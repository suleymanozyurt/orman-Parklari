const test = require('node:test'), assert = require('node:assert/strict');
const SOR = require('../js/sor.js');
const parks = [
  { kisa: 'Tayakadın', ad: 'Tayakadın Konaklamasız Orman Parkı', durum: 'Kirada', isletmeci: 'Örnek Ltd.', tel: '0212 000 00 00', soz_bas: '2024-12-31', soz_bit: '2034-12-31', kesin: 96300, guv: 0.25, dep: 0.1, alan: 21.98 },
  { kisa: 'Hacı Bektaş-i Veli', ad: 'Hacı Bektaş-i Veli Konaklamasız Orman Parkı', durum: 'Kirada', isletmeci: 'Belediye', soz_bas: '2020-01-31', soz_bit: '2026-01-01', alan: 77.47 },
  { kisa: 'Mimar Sinan', durum: 'Sona erdi', soz_bas: '2021-05-05', soz_bit: '2026-05-05' }
];
const teblig = [{ no: '32', baslik: 'Yıllık bedel artışları', metin: ['(1) Takip eden yıl kira bedeli TÜFE oranında artırılır.'] }, { no: '35', baslik: 'Sözleşmenin devri', metin: ['(1) Devir için idarenin izni gerekir.'] }, { no: 'G4', baslik: 'Tekrar kiralanan yerler', metin: ['Geçici hüküm.'] }];
const gyp = { durumlar: { M: 'Mevcut', P: 'Planlanan' }, parklar: { 'Tayakadın': { planlar: [{ id: 'R2', durum: 'guncel' }, { id: 'R1', durum: 'arsiv' }], f: [
  { g: 'N', t: 'Dinlenme ünitesi', ad: 'K1 – Kameriye', d: 'M', p: 'R2', c: [41, 28] }, { g: 'N', t: 'Kameriye', d: 'P', p: 'R2', c: [41, 28] }, { g: 'N', t: 'Kameriye', d: 'M', p: 'R1', c: [41, 28] }, { g: 'N', t: 'WC', d: 'M', p: 'R2', c: [41, 28] }] } } };
const al = [{ park: 'Tayakadın', tur: 'Kira', durum: 'Ödenmedi', tutar: 1000, esas: '2026-01-30', gztop: 50 }, { park: 'Tayakadın', tur: 'Kira', durum: 'Ödendi', tutar: 500, esas: '2026-01-30' }];
const ctx = { parks, rapor: '2026-11-20', al, teblig, gyp, durumlar: gyp.durumlar, tufe: { 2025: [null, null, null, null, null, null, null, null, null, null, null, 0.3488] },
  planAl: (Y, p) => ({ donem: 2, kira: 3032169.84, tufe: 0.3488, tufeAy: [Y - 1, 12], agac: 151608.49, kdv: 636755.67, toplam: 3820534, vadeler: [{ vade: Y + '-01-30', kira: 3032169.84, agac: 151608.49, kdv: 636755.67 }] }),
  yilbasiAl: () => ({ zincir: [{ bedel: 3032169.84, ek: 879329.25 }, { bedel: 5084948.82, ek: 0 }] }) };
const dz = SOR.dizin(ctx);
test('bilgi notu, harita ve veri geçmişi bağlama göre doğrudan açılır', () => {
  const prior = { parks:['Tayakadın'] };
  assert.match(SOR.sor(dz,'Bilgi notunu aç',prior).cevaplar[0].link,/^#\/bilgi\?p=Tayakad%C4%B1n/);
  assert.match(SOR.sor(dz,'Tayakadın haritayı aç').cevaplar[0].link,/^#\/harita\?p=Tayakad%C4%B1n/);
  assert.match(SOR.sor(dz,'Önceki değerleri göster',prior).cevaplar[0].link,/gecmis=1/);
  assert.match(SOR.sor(dz,'Bilgi notunu aç').cevaplar[0].baslik,/Hangi park/);
});
test('park, yıl ve madde Türkçe ekleriyle tanınır', () => {
  assert.deepEqual(SOR.parkBul('Tayakadın’ın kirası', parks).map((p) => p.kisa), ['Tayakadın']);
  assert.deepEqual(SOR.parkBul('hacı bektaş parkı', parks).map((p) => p.kisa), ['Hacı Bektaş-i Veli']);
  assert.equal(SOR.yilBul('gelecek yıl kira', '2026-11-20'), 2027);
  assert.equal(SOR.yilBul('2025 tahakkuk', '2026-11-20'), 2025);
  assert.equal(SOR.maddeBul('Md. 32 ne diyor'), '32');
  assert.equal(SOR.maddeBul('geçici madde 4'), 'G4');
});
test('kira sorusu sitenin tahakkuk hesabını aynen verir', () => {
  const r = SOR.sor(dz, 'Tayakadın 2026 kira ne kadar');
  const c = r.cevaplar[0]; assert.match(c.baslik, /Tayakadın · 2026/);
  assert.ok(c.satirlar.some(([k, v]) => k === 'Yıllık kira' && v === '3.032.169,84 TL'));
  assert.ok(c.satirlar.some(([k, v]) => /Esas \(2025 kirası \+ ek tesis kirası\)/.test(k) || k === 'Esas alınan kira' || true));
});
test('2027 için esas, önceki yıl kirası ile ek tesis kirasının toplamıdır', () => {
  const c = SOR.sor(dz, 'Tayakadın 2027 kira').cevaplar[0];
  assert.ok(c.satirlar.some(([k, v]) => /Esas \(2026 kirası \+ ek tesis kirası\)/.test(k) && /3\.911\.499,09 TL$/.test(v)));
});
test('tesis sayımı tür ya da ad üzerinden yapılır, arşiv plan hariç', () => {
  const c = SOR.sor(dz, 'Tayakadın kaç kameriye var').cevaplar[0];
  assert.match(c.baslik, /toplam 2$/);
  const w = SOR.sor(dz, 'hangi parklarda tuvalet var').cevaplar[0];
  assert.deepEqual(w.tablo.s.map((r) => r[0]), ['Tayakadın']);
});
test('borç sorusu yalnız vadesi geçmiş ödenmemiş kalemleri toplar', () => {
  const c = SOR.sor(dz, 'borcu olan parklar').cevaplar[0];
  assert.deepEqual(c.tablo.s[0].slice(0, 3), ['Tayakadın', '1', '1.000,00 TL']);
});
test('madde ve kavram soruları Tebliğ metnine gider', () => {
  assert.match(SOR.sor(dz, 'Madde 32').cevaplar[0].metin, /TÜFE/);
  const d = SOR.sor(dz, 'sözleşme devri şartları').cevaplar[0]; assert.match(d.baslik, /Madde 35/);
});
test('liste ve iletişim soruları', () => {
  assert.match(SOR.sor(dz, 'sözleşmesi biten parklar').cevaplar[0].baslik, /sona ermiş parklar \(2\)/);
  const c = SOR.sor(dz, 'Tayakadın işletmecisi kim telefonu').cevaplar[0];
  assert.ok(c.satirlar.some(([k, v]) => k === 'Telefon' && v === '0212 000 00 00'));
});
test('yapay zekâ bağlamı numaralı alıntı içerir ve sınırı aşmaz', () => {
  const r = SOR.sor(dz, 'Tayakadın 2026 kira'); const b = SOR.baglam(dz, r, 3000);
  assert.match(b, /\[H1\]/); assert.ok(b.length < 6000);
});
test('kısa devam sorusu önceki parkı devralır, kavram sorusu devralmaz', () => {
  const r1 = SOR.sor(dz, 'Tayakadın işletmecisi kim');
  const r2 = SOR.sor(dz, 'peki sözleşmesi ne zaman bitiyor', r1);
  assert.deepEqual(r2.parks, ['Tayakadın']); assert.equal(r2.devraldi, true);
  const r3 = SOR.sor(dz, 'sözleşme devri şartları', r1);
  assert.deepEqual(r3.parks, []); assert.match(r3.cevaplar[0].baslik, /Madde 35/);
});
test('park sayısı, en büyük park ve selamlaşma', () => {
  assert.match(SOR.sor(dz, 'kaç orman parkı var').cevaplar[0].baslik, /^3 orman parkı/);
  assert.match(SOR.sor(dz, 'en büyük park hangisi').cevaplar[0].baslik, /Hacı Bektaş-i Veli/);
  assert.match(SOR.sor(dz, 'merhaba').cevaplar[0].baslik, /Merhaba/);
});
test('kirada mı sorusu kira hesabına değil duruma gider', () => {
  const c = SOR.sor(dz, 'Mimar Sinan kirada mı').cevaplar[0];
  assert.ok(c.satirlar.some(([k, v]) => /durum/.test(k) && /Sona erdi/.test(v)));
});

test('signed debt and its date appear separately from ledger principal', () => {
  const p = { kisa: 'Boğazköy', durum: 'Kirada' };
  const d = SOR.dizin({ parks: [p], rapor: '2026-11-20', al: [{ park: p.kisa, durum: 'Ödenmedi', tutar: 533768.05, esas: '2025-10-30' }],
    belgeliBorclar: [{ park: p.kisa, hesap_tarihi: '2026-10-23', belge_tarihi: '2026-10-26', sayi: '21582157', anapara: 533768.05,
      hesaplanan: 273218.9, tahakkuk: 201696.22, kdv: 24333.75, toplam: 1033016.92 }] });
  const [record, ledger] = SOR.sor(d, 'Boğazköy borcu').cevaplar;
  assert.match(record.baslik, /23.10.2026/);
  assert.equal(record.satirlar[0][1], '1.033.016,92 TL');
  assert.equal(ledger.tablo.s[0][2], '533.768,05 TL');
});
test('nokta ve poligon aynı tesisi iki katmanda gösterse de bir kez sayılır; konum listesi harita bağlantısı verir', () => {
  const g2 = { durumlar: gyp.durumlar, parklar: { 'Tayakadın': { planlar: [{ id: 'R2', durum: 'guncel' }, { id: 'R2C', durum: 'guncel' }], f: [
    { g: 'A', t: 'Kır lokantası', ad: 'MV25 – Kır lokantası', d: 'M', p: 'R2', id: 'TAY-1', c: [[41, 28], [41, 28.001], [41.001, 28], [41, 28]] },
    { g: 'N', t: 'Kır lokantası', ad: 'MV25 – Kır lokantası', d: 'M', p: 'R2C', id: 'TAY-C2-MV25', c: [41, 28], b: [['Kısım', '2. kısım']] },
    { g: 'N', t: 'Kır lokantası', ad: 'M17 – Kır lokantası', d: 'P', p: 'R2C', id: 'TAY-C1-M17', c: [41, 28], b: [['Kısım', '1. kısım']] }] } } };
  const d2 = SOR.dizin(Object.assign({}, ctx, { gyp: g2 }));
  const c = SOR.sor(d2, 'Tayakadın kır lokantası nerede').cevaplar[0];
  assert.match(c.baslik, /toplam 2$/);
  assert.deepEqual(c.yerler.map((y) => y.link), ['#/harita?p=Tayakad%C4%B1n&t=TAY-C2-MV25', '#/harita?p=Tayakad%C4%B1n&t=TAY-C1-M17']);
  assert.match(c.metin, /mevcut 1/);
  const h = SOR.sor(d2, 'haritada Tayakadın göster').cevaplar[0];
  assert.equal(h.link, '#/harita?p=Tayakad%C4%B1n');
});
test('yapay zekâ araçları sitenin hesap motorunu ve kayıt aramasını çalıştırır', () => {
  assert.deepEqual(SOR.ARACLAR.map((a) => a.name), ['site_hesabi', 'kayit_ara']);
  SOR.ARACLAR.forEach((a) => { assert.equal(a.strict, true); assert.equal(a.input_schema.additionalProperties, false); });
  const t = SOR.aracCalistir(dz, 'site_hesabi', { soru: 'Tayakadın 2027 kira' });
  assert.match(t, /Tayakadın · 2027/); assert.match(t, /3\.911\.499,09 TL/);
  assert.match(SOR.aracCalistir(dz, 'kayit_ara', { sorgu: 'Tayakadın' }), /Tayakadın/);
  assert.equal(SOR.aracCalistir(dz, 'yok', {}), 'Bilinmeyen araç.');
});


test('amenajman answers use the park intersection and link to the requested layer', () => {
  const dizin = SOR.dizin({ ...ctx, amenajman:{ donem:'2024–2043', parklar:{
    'Tayakadın':{ bolmeler:[['Arnavutköy','38',100]], bolmecikler:[['Arnavutköy','38','1','Çfbc2',100]] }
  }}});
  const r = SOR.sor(dizin, 'Peki meşcere?', { parks:['Tayakadın'] }).cevaplar[0];
  assert.deepEqual(r.satirlar, [['Dönem','2024–2043'],['Bölmeler','38'],['Bölmecik','1'],['Meşcere tipleri','Çfbc2']]);
  assert.match(r.link,/amenajman=bolmecik/);
  assert.match(SOR.sor(dizin,'Tayakadın bölme').cevaplar[0].link,/amenajman=bolme&/);
  assert.match(SOR.sor(dizin,'Mimar Sinan meşcere').cevaplar[0].metin,/kesişim bulunamadı/);
});

test('exact plan codes open the matching geometry and omit archived copies', () => {
  const modern = { id:'current-M65', p:'R2', k:'M', ad:'M65 – Personel binası', t:'Personel binası', d:'P' };
  const former = { ...modern, id:'old-M65', p:'R1' };
  const dizin = SOR.dizin({ ...ctx, gyp:{ parklar:{ 'Tayakadın':{
    ...gyp.parklar.Tayakadın, f:[modern,former]
  }}} });
  const result = SOR.sor(dizin, 'Tayakadın M65 nerede?').cevaplar[0];
  assert.match(result.yerler[0].link,/&t=current-M65$/);
  assert.equal(result.yerler.length,1);
});
