const test=require('node:test'),assert=require('node:assert/strict'),E=require('../js/engine');
const p={kisa:'Test',soz_bas:'2023-12-14',soz_bit:'2042-12-31',taban:'2023-12-14',ihale_b:565000,muh_kira:1243353.57,durum:'Kirada',artis:'Yıldönümü',kural:'Yayımlanan (önceki ay)'};
const rate=(y,v)=>({[y]:Array(11).fill(null).concat(v)});
test('all anniversaries wait until the new year, then use the same official December rate',()=>{for(const date of ['2023-02-14','2023-09-01','2023-12-14']){const q={...p,soz_bas:date,taban:date};assert.equal(E.yilbasiKira(q,rate(2026,.1),2027,'2026-12-31').bedel,null);const r=E.yilbasiKira(q,rate(2026,.1),2027,'2027-01-04');assert.equal(r.bas,'2027-01-01');assert.equal(r.bedel,1367688.93);assert.deepEqual(r.tufeAy,[2026,12]);}assert.equal(p.artis,'Yıldönümü');});
test('missing rate, missing annual baseline and later missing rate never invent a rent',()=>{assert.equal(E.yilbasiKira(p,{},2027,'2027-01-01').bedel,null);assert.equal(E.yilbasiKira({...p,muh_kira:null},{},2027,'2027-01-04').esasEksik,true);const x=E.yilbasiKira(p,rate(2026,.1),2028,'2028-01-04');assert.equal(x.bedel,null);assert.deepEqual(x.tufeAy,[2027,12]);});
test('a newer documented annual baseline takes precedence over the historical snapshot',()=>{const x=E.yilbasiKira({...p,muh_kira:1400000,muh_kira_yil:2027},rate(2027,.2),2028,'2028-01-04');assert.equal(x.bedel,1680000);assert.equal(x.esasYili,2027);});
test('January workflow keeps accounting due days ahead of manually defined days and balances installments',()=>{const esl={items:[1,4,7,10].map((m,i)=>({park:'Test',grup:'2026 tahakkuku',tur:'Kira',vade:`2026-${String(m).padStart(2,'0')}-30`,tutar:310838.39,row:i,hesap:'120.99.01'}))},v={ek_kira:[],muhasebe:[]},q={...p,taksit_vade:'01-15,04-15,07-15,10-15'};const x=E.tahakkukPlan(v,esl,q,rate(2026,.1),2027,'2027-01-04');assert.deepEqual(x.vadeler.map(v=>v.vade),['2027-01-30','2027-04-30','2027-07-30','2027-10-30']);assert.equal(E.r2(x.vadeler.reduce((s,v)=>s+v.kira,0)),x.kira);assert.equal(x.zaman,'2027-01-01');});
test('proration handles leap year, cross-year intervals, one day and explicitly chosen fixed 365',()=>{assert.equal(E.kistHesap(36600,'2028-01-01','2028-12-31','gercek').tutar,36600);assert.equal(E.kistHesap(36600,'2028-02-29','2028-02-29','gercek').tutar,100);assert.equal(E.kistHesap(36500,'2027-12-31','2028-01-01','gercek').tutar,199.73);assert.equal(E.kistHesap(36500,'2028-02-29','2028-02-29','365').tutar,100);assert.throws(()=>E.kistHesap(100,'2027-02-29','2027-03-01','gercek'));assert.throws(()=>E.kistHesap(0,'2027-01-01','2027-01-02','gercek'));assert.throws(()=>E.kistHesap(100,'2027-01-02','2027-01-01','gercek'));});
test('a complete newer accounting year updates baseline automatically while partial records cannot understate it',()=>{const q={...p,odeme:'4 taksit'},items=[1,4,7,10].map((m,i)=>({park:'Test',grup:'2027 tahakkuku',tur:'Kira',vade:`2027-${String(m).padStart(2,'0')}-30`,tutar:350000,row:i})),context={veri:{muhasebe:[]},esl:{items}};const x=E.yilbasiKira(q,rate(2027,.2),2028,'2028-01-04',context);assert.equal(x.bedel,1680000);assert.equal(x.esasYili,2027);context.esl.items=items.slice(0,3);const y=E.yilbasiKira(q,{...rate(2026,.1),...rate(2027,.2)},2028,'2028-01-04',context);assert.equal(y.esasYili,2026);assert.equal(y.bedel,1641226.72);});
test('duplicate installments, impossible dates and due dates outside the accounting year cannot replace annual baseline',()=>{
 const q={...p,odeme:'4 taksit'}, base=[1,4,7,10].map((m,i)=>({park:'Test',grup:'2027 tahakkuku',tur:'Kira',vade:`2027-${String(m).padStart(2,'0')}-30`,tutar:350000,row:i}));
 const rates={...rate(2026,.1),...rate(2027,.2)};
 for(const items of [base.concat({...base[0]}),base.map((x,i)=>i?x:{...x,vade:'2027-02-30'}),base.map((x,i)=>i?x:{...x,vade:'2028-01-30'})]){
  const x=E.yilbasiKira(q,rates,2028,'2028-01-04',{veri:{muhasebe:[]},esl:{items}});
  assert.equal(x.esasYili,2026);assert.equal(x.bedel,1641226.72);
 }
});
test('tax-only accounting entries do not prove a zero annual rent accrual',()=>{const q={...p,soz_bas:'2020-01-01',taban:'2020-01-01'},r={};for(let y=2019;y<=2026;y++)r[y]=Array(12).fill(.1);const esl={items:[{park:'Test',grup:'2026 tahakkuku',tur:'KDV',vade:'2026-01-30',tutar:5000,row:0}]},v={ek_kira:[],muhasebe:[{kaynak:'120',tarih:'2026-10-21',hesap:'120.99.99.05'}]};const t=E.tahakkukPlan(v,esl,q,r,2026,'2026-11-06');assert.equal(t.muhasebede,false);assert.notEqual(t.kod,'fark');assert.ok(t.uyari.some(x=>/Yalnız vergi/.test(x)));});
test('annex rent approved in the base year joins the base before the December increase (2026 fiş example)',()=>{const q={...p,soz_bas:'2024-12-31',taban:'2024-12-31',muh_kira:3032169.84},veri={ek_kira:[{park:'Test',donem:2,tutar:879329.25,not_:'II. Revize GYP 07.09.2026'},{park:'Test',donem:1,tutar:643050,not_:'I. Revize GYP 11.07.2025'}],muhasebe:[]};const x=E.yilbasiKira(q,rate(2026,.1),2027,'2027-01-04',{veri,esl:{items:[]}});assert.equal(x.zincir[0].ek,879329.25);assert.equal(x.bedel,E.r2((3032169.84+879329.25)*1.1));assert.equal(E.yilbasiKira(q,rate(2026,.1),2027,'2027-01-04').bedel,E.r2(3032169.84*1.1));assert.equal(E.ekKiraYili(q,{donem:2}),2026);assert.equal(E.r2(2248050*0.3488),784119.84);});
test('installment days of a mid-year contract period do not leak the previous year into the new plan',()=>{const q={...p,soz_bas:'2024-12-31',taban:'2024-12-31',odeme:'4 taksit'},esl={items:['2025-07-30','2025-10-30','2026-01-30','2026-04-30','2026-07-30','2026-10-30'].map((d,i)=>({park:'Test',grup:'2026 tahakkuku',tur:'Kira',vade:d,tutar:100,row:i,hesap:'120.99.01'}))},v={ek_kira:[],muhasebe:[]};const x=E.tahakkukPlan(v,esl,q,rate(2026,.1),2027,'2027-01-04');assert.deepEqual(x.vadeler.map(v=>v.vade),['2027-01-30','2027-04-30','2027-07-30','2027-10-30']);});
test('annual accrual total equals all installment forms, including first installment additions', () => {
  const plan = { kira: 400, agac: 20, kdv: 84, depFark: 10, guvFark: 25,
    vadeler: [1, 2, 3, 4].map(n => ({ kira: 100, agac: n === 1 ? 20 : 0, kdv: n === 1 ? 84 : 0 })) };
  assert.equal(E.tahakkukFisKalemleri(plan).toplam, 539);
  assert.equal([1, 2, 3, 4].reduce((sum, n) => sum + E.tahakkukFisKalemleri(plan, n).toplam, 0), 539);
  assert.equal(E.tahakkukFisKalemleri({}, 0), null);
  assert.equal(E.tahakkukFisKalemleri(plan, 5), null);
});

test('a journal marked as 107 days stays outside annual rent and the next installment template', () => {
 const q = {...p, soz_bas:'2026-01-01', taban:'2026-01-01', odeme:'4 taksit', taksit_vade:'01-30,04-30,07-30,10-30'};
 const v = {muhasebe:[], ek_kira:[]};
 const tufe = {...rate(2023,.1),...rate(2024,.1),...rate(2025,.1),...rate(2026,.1)};
 const kira = E.kiraYili(q,tufe,[],2026).bedel;
 const items = E.bol(kira,4).map((tutar,i) => ({park:q.kisa,tur:'Kira',grup:'2026 tahakkuku',tutar,vade:`2026-${['01','04','07','10'][i]}-30`,aciklama:'2026 Kira'}));
 items.push({park:q.kisa,tur:'Kira',grup:'2026 tahakkuku',tutar:1133553.56,vade:'2026-09-28',aciklama:'Ek kira revize 107 Günlük kiranın cari yıl hesaplarına alınması'});
 const current = E.tahakkukPlan(v,{items},q,tufe,2026,'2026-11-20');
 assert.equal(current.muhKira,kira);
 assert.equal(current.muhKist,1133553.56);
 assert.equal(current.fark,0);
 const next = E.tahakkukPlan(v,{items},q,tufe,2027,'2027-01-04');
 assert.deepEqual(next.vadeler.map(x=>x.vade),['2027-01-30','2027-04-30','2027-07-30','2027-10-30']);
});
