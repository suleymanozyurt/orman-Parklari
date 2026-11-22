const test=require('node:test'),assert=require('node:assert/strict'),E=require('../js/engine.js');
// Independent published numerical examples: GİB Tahsilat Genel Tebliği Seri A/1,
// PDF pp.84–90, examples 2,3,4,6,7,9,10. Never use the implementation to define expectations.
const oldRates=[['2000-01-01',.04],['2005-03-02',.03]];
const gz=(amount,due,paid,rates)=>E.r2(amount*E.gzFaktor(due,paid,rates));
test('GIB example 9 preserves old rate across a change inside a complete monthly period',()=>{assert.equal(gz(120,'2004-12-26','2005-05-15',oldRates),20.28);const rows=E.gzDilimler('2004-12-26','2005-05-15',oldRates);assert.equal(rows[0].ay,3);assert.equal(rows[0].bit,'2005-03-26');assert.equal(rows[1].ay,1);assert.equal(rows[2].gun,19);});
test('GIB example 10 splits daily remainder including effective day and rounds coefficient upward',()=>{assert.equal(gz(250000,'2004-11-26','2005-03-05',oldRates),32000.50);const rows=E.gzDilimler('2004-11-26','2005-03-05',oldRates);assert.equal(rows[1].gun,3);assert.equal(rows[1].gunluk,.001334);assert.equal(rows[2].gun,4);});
test('GIB examples 2,3,4 preserve month-end and exact daily coefficient',()=>{const r=[['2000-01-01',.025]];assert.equal(gz(10000,'2006-07-31','2006-10-05',r),541.70);assert.equal(gz(2000,'2006-12-26','2007-01-08',r),21.68);assert.equal(gz(5000,'2006-11-30','2007-01-15',r),187.55);});
test('30-day remainders use monthly basis rather than rounded daily rate',()=>{const r=[['2000-01-01',.025]];assert.equal(gz(1000,'2006-12-31','2007-01-30',r),25);assert.equal(gz(5000,'2007-04-30','2007-05-30',r),125);assert.equal(gz(5000,'2007-04-30','2007-05-31',r),125);});
test('leap-year and non-month-end anchors do not drift after February',()=>{const r=[['2020-01-01',.037]];assert.equal(gz(1000,'2024-01-31','2024-03-31',r),74);assert.equal(gz(1000,'2024-01-30','2024-03-30',r),74);assert.equal(gz(1000,'2024-02-29','2024-03-31',r),37);assert.equal(E.gzDilimler('2024-01-30','2024-03-29',r).at(-1).gun,29);});
test('new daily rate applies on its effective day and on following days only',()=>{const r=[['2025-01-01',.045],['2025-11-13',.037]];assert.equal(gz(1000,'2025-11-12','2025-11-13',r),1.23);});
test('no delay is zero; missing historical rates cannot silently produce zero',()=>{assert.equal(gz(1000,'2026-01-01','2026-01-01',[]),0);assert.ok(Number.isNaN(E.gzFaktor('2020-01-01','2020-01-10',[['2021-01-01',.037]])));assert.equal(E.gzGunluk(.045),.0015);assert.equal(E.gzGunluk(.037),.001234);});

test('a debit reclassification to another due date survives a payment journal and reconciles to the ledger',()=>{
 const row=(x)=>({kaynak:'127',yev:2,tarih:'2026-09-03',hesap:'127.01.06',vkn:'123',vade:'2026-01-30',aciklama:'KDV',borc:0,alacak:0,borc_h:'102, 127',alacak_h:'127',...x});
 const original=row({kaynak:'120',yev:1,tarih:'2026-01-01',hesap:'120.99.99.05',borc:1000,borc_h:'120',alacak_h:'600'});
 const credit=row({alacak:900}),debit=row({vade:'2025-10-30',borc:500});
 for(const tail of [[credit,debit],[debit,credit]]){
  const v={parks:[{kisa:'Test',vkn_muh:'123'}],muhasebe:[original,...tail]};const before=JSON.stringify(v),r=E.eslestir(v);
  assert.equal(r.parcalar.filter(x=>!x.odeme).reduce((s,x)=>s+x.tutar,0),600);
  const restored=r.items.find(x=>x.grup==='Muhasebe borç düzeltmesi');assert.equal(restored.vade,'2025-10-30');assert.equal(restored.tutar,500);assert.equal(restored.yev,2);
  assert.equal(r.items.find(x=>x.yev===1).odenen,900);assert.equal(r.uyarilar.length,0);assert.equal(JSON.stringify(v),before);
 }
});
test('a net debit is counted once after credit offsets within the same journal and due date, and later collection closes it',()=>{
 const row=(x)=>({kaynak:'127',yev:2,tarih:'2026-02-01',hesap:'127.01.06',vkn:'123',vade:'2026-01-30',aciklama:'KDV düzeltmesi',borc:0,alacak:0,borc_h:'102',alacak_h:'127',...x});
 const v={parks:[{kisa:'Test',vkn_muh:'123'}],muhasebe:[row({borc:500}),row({alacak:100}),row({yev:3,tarih:'2026-03-01',alacak:400})]};const r=E.eslestir(v);
 assert.equal(r.items.length,1);assert.equal(r.items[0].tutar,400);assert.equal(r.items[0].odenen,400);assert.equal(r.parcalar.filter(x=>!x.odeme).length,0);assert.equal(r.uyarilar.length,0);
});

test('a plan source link recognizes a collected 120 proration without presenting annual comparison as an unpaid debt',()=>{
 const invoice={kaynak:'120',yev:8,tarih:'2026-09-25',hesap:'120.99.99.02',vkn:'123',vade:'2026-10-30',aciklama:'107 günlük ek kira',borc:100,alacak:0,borc_h:'120',alacak_h:'600'};
 const v={parks:[{kisa:'Test',vkn_muh:'123'}],muhasebe:[invoice,{...invoice,yev:9,tarih:'2026-10-07',borc:0,alacak:100,borc_h:'102',alacak_h:'120'}]},e=E.eslestir(v),p={park:'Test',onay:'2026-09-16',ek:400,revize:'II. Revize',muhasebe_baglari:[{anahtar:E.muhAnahtar(invoice)}]};
 const r=E.revizeDurum(v,e,p,['2026-10-30'],'2026-10-22');assert.equal(r.kayit.length,1);assert.equal(r.muh,100);assert.equal(r.muhTahsil,100);assert.equal(r.muhAcik,0);assert.equal(r.kod,'fark');assert.match(r.durum,/tek başına ödenmemiş borç değildir/);
 assert.equal(E.revizeDurum(v,e,{...p,park:'Other'},['2026-10-30'],'2026-10-22').kayit.length,0);
 assert.equal(E.revizeDurum(v,e,{...p,muhasebe_baglari:[{anahtar:'stale'}]},['2026-10-30'],'2026-10-22').kayit.length,0);
});

test('historical report excludes not yet posted debits and treats later payments as still open', () => {
  const rows = [
    { olusma: '2026-01-10', vade: '2026-01-30', tutar: 100, odeme: '2026-02-10', fis: 'yev. 2' },
    { olusma: '2026-03-01', vade: '2026-03-30', tutar: 200, odeme: null }
  ];
  const [a] = E.alacakHesapla(rows, '2026-02-01', [['2025-11-13', .037]], .2);
  assert.equal(a.durum, 'Ödenmedi');
  assert.equal(a.acik, 100);
  assert.equal(a.fis, '');
  assert.equal(E.alacakHesapla(rows, '2026-02-01', [], .2).length, 1);
  assert.equal(E.alacakHesapla(rows, '2026-02-10', [['2025-11-13', .037]], .2)[0].acik, 0);
});

test('same voucher number in different years keeps each payment on its own date', () => {
  const item = { vkn: '1', hesap: '120.99.99.02', kaynak: '120', alacak: 0, borc: 100, borc_h: '120', alacak_h: '600' };
  const settle = { ...item, borc: 0, alacak: 100, borc_h: '102', alacak_h: '120', yev: 100 };
  const veri = { parks: [{ kisa: 'Park', vkn_muh: '1' }], muhasebe: [
    { ...item, tarih: '2025-01-10', vade: '2025-02-01', yev: 25 },
    { ...settle, tarih: '2025-02-01', vade: '2025-02-01' },
    { ...item, tarih: '2026-01-10', vade: '2026-02-01', yev: 25 },
    { ...settle, tarih: '2026-02-01', vade: '2026-02-01' }
  ] };
  assert.deepEqual(E.eslestir(veri).parcalar.map(p => p.odeme), ['2025-02-01', '2026-02-01']);
});

test('a signed debt stays the baseline and only subsequent interest is added', () => {
 const report = '2026-11-20';
 const rated = [['2025-11-13', .037]];
 const lines = [
  {park:'Test', kalem:1, tur:'Kira', vade:'2026-06-30', tutar:10000},
  {park:'Test', kalem:2, tur:'Vergi/fon', vade:'2026-05-30', tutar:1000}
 ];
 const record = {park:'Test', hesap_tarihi:'2026-10-23', anapara:11000, hesaplanan:100, tahakkuk:200, kdv:40, toplam:11340};
 const entries = date => E.alacakHesapla(lines,date,rated,.2);
 const current = entries(report);
 const forward = E.belgeliBorcHesapla(record,lines,current,report,rated,.2);
 const sum = rows => E.r2(rows.reduce((s,row) => s + row.gztop,0));
 assert.equal(forward.sonrakiGecikme,E.r2(sum(current)-sum(entries(record.hesap_tarihi))));
 assert.equal(forward.calismaToplami,E.r2(record.toplam + forward.sonrakiGecikme));
 assert.equal(forward.sabitGecikme,240);
 assert.equal(E.belgeliBorcHesapla(record,lines,entries(record.hesap_tarihi),record.hesap_tarihi,rated,.2).calismaToplami,null);
 assert.equal(E.belgeliBorcHesapla(record,lines,[{...current[0],kalem:9},current[1]],report,rated,.2).calismaToplami,null);
 assert.equal(E.belgeliBorcHesapla(record,lines,[{...current[0],durum:'Ödendi'},current[1]],report,rated,.2).calismaToplami,null);
 const [ozet] = E.parkOzet({parks:[{kisa:'Test'}]},current,report,{});
 assert.equal(ozet.enEski,'2026-05-30');
 assert.equal(ozet.enEskiKira,'2026-06-30');
});

test('Madde 31 and 32 distinguish first year, documented up-front payment and installments across New Year', () => {
  const park = {kisa:'Test', soz_bas:'2025-10-31', soz_bit:'2035-10-31', taban:'2025-10-31', durum:'Kirada',
    ihale_b:200000, yil_esas:'Dönem başı', kural:'Yayımlanan (önceki ay)'};
  const data = {muhasebe:[], ek_kira:[]}, ledger = {items:[]};
  const rates = {'2026':Array(12).fill(.1)};
  const plan = (p, year, book = ledger) => E.tahakkukPlan(data, book, p, rates, year, '2026-11-22');
  assert.deepEqual(plan({...park, ihale_b:150000}, 2025).vadeler.map(v=>v.vade), ['2025-10-31']);
  assert.deepEqual(plan(park, 2025).vadeler, []);
  assert.deepEqual(plan({...park, odeme:'Peşin'}, 2026).vadeler.map(v=>v.vade), ['2026-10-31']);
  const book = {items:[{park:'Test',tur:'Kira',grup:'2025 tahakkuku',vade:'2025-10-31',tutar:50000}]};
  const installments = plan({...park, odeme:'4 taksit'}, 2026, book);
  assert.deepEqual(installments.vadeler.map(v=>v.vade), ['2026-10-31','2027-01-31','2027-04-30','2027-07-31']);
  assert.equal(E.r2(installments.vadeler.reduce((sum, v)=>sum + v.kira,0)), installments.kira);
  assert.equal(installments.vadeler[1].kdv, 0);
});
