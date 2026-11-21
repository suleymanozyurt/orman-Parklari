const test = require('node:test');
const assert = require('node:assert/strict');
const { link, collect, authorize } = require('../js/drive-aktar.js');

test('Drive belge, klasör, Google Doküman ve güvenli doğrudan bağlantılar tanınır', () => {
  assert.deepEqual(link('https://drive.google.com/drive/folders/abc_123?resourcekey=q-1'),{ id:'abc_123', key:'q-1' });
  assert.deepEqual(link('https://docs.google.com/spreadsheets/d/id-2/edit'),{ id:'id-2',key:'' });
  assert.equal(link('https://example.test/readme.txt').url.pathname,'/readme.txt');
  assert.equal(link('javascript:alert(1)'),null);
  assert.equal(link('https://drive.google.com/drive/my-drive'),null);
});

test('Drive klasörünü sayfalar, alt klasörleri ve yerel Dokümanları işler, erişim hatasını bildirir', async () => {
  const G = 'application/vnd.google-apps.';
  const calls = [];
  const fetch = async (u,{ headers }) => {
    const url = new URL(u);
    calls.push([url, headers]);
    assert.equal(headers.Authorization,'Bearer session');
    const path = url.pathname.replace('/drive/v3/files',''), q = url.searchParams;
    if (path === '/root') return Response.json({ id:'root', name:'Park', mimeType:G+'folder' });
    if (path === '/word/export') return new Response('Word');
    if (path === '/secret') return new Response('Erişim yok',{ status:403 });
    if (path === '/pdf' && q.get('alt') === 'media') return new Response('PDF');
    if (q.get('q').includes("'sub'")) return Response.json({ files:[{ id:'pdf', name:'Plan.pdf', size:3, mimeType:'application/pdf' }] });
    if (q.get('pageToken') === 'page2') return Response.json({ files:[{ id:'secret', name:'Kayıt.pdf', mimeType:'application/pdf' }] });
    return Response.json({ files:[{ id:'word', name:'Bilgi Notu', mimeType:G+'document' },{ id:'sub', name:'Alt', mimeType:G+'folder' }],nextPageToken:'page2' });
  };
  const result = await collect({ links:[link('https://drive.google.com/drive/folders/root?resourcekey=s1')], token:'session', fetch, File, limit:12 });
  assert.deepEqual(result.files.map(f=>f.name),['Park/Bilgi Notu.docx','Park/Alt/Plan.pdf']);
  assert.match(result.skipped[0],/Kay[ıi]t\.pdf.*erişimi reddetti/);
  assert.equal(calls[0][1]['X-Goog-Drive-Resource-Keys'],'root/s1');
  assert.equal(calls.find(([url])=>url.pathname.endsWith('/word/export'))[0].searchParams.get('mimeType'),'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});

test('harici dosyaya Drive erişim jetonu gönderilmez ve boyut sınırı korunur', async () => {
  const result = await collect({ links:[link('https://example.test/map.kml'),link('https://example.test/note.txt')], token:'session', File, limit:4,
    fetch:async (u,options) => {
      assert.equal(options.headers,undefined);
      assert.equal(options.credentials,'omit');
      return new Response(u.pathname.endsWith('kml') ? 'Long text' : 'note');
    }
  });
  assert.equal(result.files.length,1);
  assert.equal(await result.files[0].text(),'note');
  assert.match(result.skipped[0],/map\.kml.*boyut sınırı/);
});

test('Google yetkilendirmesi reddedilince oturum açılmaz', async () => {
  const google = { accounts:{ oauth2:{ initTokenClient:({ callback }) => ({ requestAccessToken:() => callback({ access_token:'session' }) }),
    hasGrantedAllScopes:() => false } } };
  await assert.rejects(authorize(google,'test-app'), /açılamadı/);
});
