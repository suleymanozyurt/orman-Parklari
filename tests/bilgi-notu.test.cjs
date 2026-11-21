const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const note = require('../js/bilgi-notu.js');
const engine = require('../js/engine.js');

const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWBUAAAAASUVORK5CYII=';
const p = { kisa:'Örnek', ad:'Örnek Orman Parkı', ilce:'Arnavutköy', alan:19.71, durum:'Kirada',
  soz_bas:'2020-08-31', soz_bit:'2040-08-31', gyp_onay:'2023-04-04',
  harita:{ sinir:[[[41,28],[41.01,28],[41,28.01],[41,28]]] },
  yapilacak:'Sınır revizyonu için onaylı pafta eşleştirilecek.' };
const modelFor = (park = p) => note.degerlendirme({ park, kurum:{ il:'İstanbul' }, rapor:'2026-11-21',
  base:'https://example.test/orman-Parklari/', fd:engine.fmtDate, borc:{ hesap_tarihi:'2026-11-08', sayi:'123', toplam:533768.05 } });

test('bilgi notunun sonuç ve takip metni parkın belgeli verilerinden gelir', () => {
  assert.match(modelFor(),/19,71 ha/);
  assert.match(modelFor(),/31\.08\.2040/);
  assert.match(modelFor(),/04\.04\.2023/);
  assert.match(modelFor(),/533\.768,05 TL/);
  assert.match(modelFor(),/Sınır revizyonu için onaylı pafta/);
  const other = modelFor({ kisa:'Diğer', durum:'İhale edilecek' });
  assert.match(other,/ihale edilecek durumdadır/);
  assert.match(other,/koordinat listesi/);
  assert.doesNotMatch(other,/19,71/);
});

test('kaynak kadastro paftası kendi başlığında ve kaynak bağlantısıyla tutulur', async () => {
  const dom = new JSDOM();
  try {
    const model = note.haritaModel();
    await note.haritalar(dom.window,model,{ park:p, boundary:[], maps:{
      kadastro_map:{ png, url:'https://drive.google.com/file/d/ornek/view', aciklama:'Kaynak kadastro paftası' }
    }});
    assert.equal(model.images.kadastro_map,png);
    assert.equal(model.links.kadastro_map,'https://drive.google.com/file/d/ornek/view');
    assert.equal(model.values.kadastro_map_note,'Kaynak kadastro paftası');
    assert.match(model.values.topo_map_note,/teyit gerekli/);
  } finally { dom.window.close(); }
});

test('harita çerçevesi parkın koordinatlarını ve yatay çıktı oranını korur', () => {
  const box = note.extent([{ c:p.harita.sinir[0] }]);
  assert.ok(box.every(Number.isFinite));
  assert.ok(Math.abs((box[2]-box[0])/(box[3]-box[1])-975/540) < 1e-9);
  assert.equal(note.extent([]),null);
});
