const test = require('node:test');
const assert = require('node:assert/strict');
const { collect } = require('../js/belge');
const parks = [{ kisa:'Işıklar', ad:'Işıklar Orman Parkı' },{ kisa:'Ağaçlı', ad:'Ağaçlı Orman Parkı' }];
const fields = [['alan','Alan (ha)','number'],['soz_bas','Sözleşme başı','date'],['ihale_b','İhale bedeli','number']];
test('local labelled records preserve source and Turkish decimal and date formats', () => {
  const r = collect({parks,fields,docs:[{name:'belge.pdf · s. 1',text:'IŞIKLAR ORMAN PARKI\nAlan (ha)\t4,33\nSözleşme başlangıcı: 01.03.2024\nİhale bedeli;1.125.000,50 TL'}]});
  assert.equal(r.park,'Işıklar');
  assert.deepEqual(r.degisiklikler.map(x=>x.yeni),['4.33','2024-03-01','1125000.50']);
  assert.equal(r.degisiklikler[0].belge,'belge.pdf · s. 1');
});
test('local extraction withholds cross-park, draft and conflicting values',() => {
  const r = collect({parks,fields,selected:'Ağaçlı',docs:[
    {name:'Işıklar',text:'Park: Işıklar\nAlan (ha): 4,33'},
    {name:'taslak',text:'TASLAK\nAlan (ha): 123'},
    {name:'biri',text:'Alan (ha): 19,4'},
    {name:'diğeri',text:'Alan (ha): 19,3'}
  ]});
  assert.equal(r.degisiklikler.length,0);
  assert.equal(r.issues.length,3);
});
