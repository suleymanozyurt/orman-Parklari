/* Yerel erişim olayları yalnız yöneticinin anahtarıyla açılır.
   Merkezî/IP günlüğü değildir; bütün cihazlara ait kayıt varmış gibi gösterilmez. */
(function(root){
  'use strict';
  const enc=new TextEncoder(),dec=new TextDecoder(),STORE='op-access-sealed-v1';
  const b64=b=>{let s='';for(const x of new Uint8Array(b))s+=String.fromCharCode(x);return btoa(s);};
  const un64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  function device(ua){return [/iPad|iPhone/.test(ua)?'iOS':/Android/.test(ua)?'Android':/Windows/.test(ua)?'Windows':/Macintosh/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'Diğer cihaz',/Edg\//.test(ua)?'Edge':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'Diğer tarayıcı'].join(' · ');}
  function create({crypto,storage,loadKey,userAgent=()=>'',now=()=>new Date()}){
    let keyPromise,queue=Promise.resolve();
    const entries=()=>{try{const x=JSON.parse(storage.getItem(STORE)||'[]');return Array.isArray(x)?x.slice(-200):[];}catch(_){return[];}};
    async function append(event){
      const run=async()=>{
        if(!keyPromise)keyPromise=loadKey().catch(e=>{keyPromise=null;throw e;});
        const cfg=await keyPromise;
        const key=await crypto.subtle.importKey('jwk',cfg.publicKey,{name:'RSA-OAEP',hash:'SHA-256'},false,['encrypt']);
        const aes=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt']);
        const iv=crypto.getRandomValues(new Uint8Array(12));
        // Sadece açıkça izin verilen alanlar. Parola/token ve serbest sayfa URL'si alınmaz.
        const payload={at:now().toISOString(),who:String(event.who||'Ortak görüntüleme erişimi').slice(0,120),method:['Ortak erişim','Kişisel hesap','Yönetici'].includes(event.method)?event.method:'Ortak erişim',event:['giriş','oturum yenilendi','çıkış'].includes(event.event)?event.event:'giriş',device:device(userAgent())};
        const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},aes,enc.encode(JSON.stringify(payload)));
        const wrapped=await crypto.subtle.encrypt({name:'RSA-OAEP'},key,await crypto.subtle.exportKey('raw',aes));
        const rows=entries();rows.push({v:1,kid:cfg.kid,key:b64(wrapped),iv:b64(iv),ct:b64(ct)});
        storage.setItem(STORE,JSON.stringify(rows.slice(-200)));return true;
      };
      const pending=queue.then(run);queue=pending.catch(()=>{});return pending;
    }
    async function read(privateJWK){
      await queue;
      const key=await crypto.subtle.importKey('jwk',privateJWK,{name:'RSA-OAEP',hash:'SHA-256'},false,['decrypt']);
      const out=[];let unavailable=0;
      for(const r of entries())try{
        const raw=await crypto.subtle.decrypt({name:'RSA-OAEP'},key,un64(r.key));
        const aes=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);
        const p=JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(r.iv)},aes,un64(r.ct))));
        if(typeof p.at!=='string'||!Number.isFinite(Date.parse(p.at))||typeof p.who!=='string')throw Error('Kayıt bozuk');
        out.push(p);
      }catch(_){unavailable++;}
      return{rows:out.reverse(),unavailable,scope:'device',ipAvailable:false};
    }
    return{append,read,count:()=>entries().length};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={create,device};else root.OPAccess={create,device};
})(typeof window!=='undefined'?window:globalThis);
