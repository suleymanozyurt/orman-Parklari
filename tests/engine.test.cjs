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
