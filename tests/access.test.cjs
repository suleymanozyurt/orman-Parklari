const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto').webcrypto;
const {create,device}=require('../js/access');
const setup=async()=>{
 const key=await crypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']);
 const publicKey=await crypto.subtle.exportKey('jwk',key.publicKey),privateKey=await crypto.subtle.exportKey('jwk',key.privateKey),map=new Map();
 const storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
 const api=create({crypto,storage,loadKey:async()=>({kid:'test',publicKey}),userAgent:()=> 'Windows Chrome/140.0',now:()=>new Date('2026-11-11T16:00:00Z')});
 return {api,map,publicKey,privateKey};
};
test('access event keeps names, device details and timestamps encrypted; discards credentials and URL',async()=>{
 const {api,map,privateKey}=await setup();
 await api.append({who:'Yetkili Örnek',method:'Kişisel hesap',event:'giriş',password:'TEST-SECRET',token:'TOKEN-TEST',url:'https://private.test'});
 const stored=[...map.values()].join('');for(const value of ['Yetkili','Windows','2026-11-11','TEST-SECRET','TOKEN-TEST','private.test'])assert.ok(!stored.includes(value),value);
 const out=await api.read(privateKey);assert.equal(out.scope,'device');assert.equal(out.ipAvailable,false);assert.equal(out.rows[0].who,'Yetkili Örnek');assert.equal(out.rows[0].device,'Windows · Chrome');assert.equal(out.rows[0].password,undefined);assert.equal(out.rows[0].token,undefined);
});
test('public or unrelated key cannot read stored access details',async()=>{
 const a=await setup(),b=await setup();await a.api.append({who:'Sadece yönetici açar'});
 const out=await a.api.read(b.privateKey);assert.equal(out.rows.length,0);assert.equal(out.unavailable,1);
 await assert.rejects(()=>a.api.read(a.publicKey));
});
test('concurrent login/logout writes are serialized and corrupted events remain explicitly unreadable',async()=>{
 const {api,map,privateKey}=await setup();await Promise.all([api.append({who:'Bir',event:'giriş'}),api.append({who:'İki',event:'çıkış'})]);
 assert.equal(api.count(),2);let out=await api.read(privateKey);assert.deepEqual(out.rows.map(x=>x.who),['İki','Bir']);
 const k=[...map.keys()][0],v=JSON.parse(map.get(k));v[0].ct='broken';map.set(k,JSON.stringify(v));out=await api.read(privateKey);assert.equal(out.rows.length,1);assert.equal(out.unavailable,1);
});
test('device label uses broad platform and browser names without exact location inference',()=>{assert.equal(device('iPhone Safari/20'),'iOS · Safari');assert.equal(device('Linux Android Chrome/140'),'Android · Chrome');});
