/* Veri şifreleme: AES-GCM 256, anahtar PBKDF2-SHA256 (310.000 tur) ile paroladan türetilir.
   Tarayıcıda ve Node'da aynı (WebCrypto). Şifreli dosya: {v,alg,kdf,it,salt,iv,ct} (base64). */
(function (root) {
  'use strict';
  const K = {};
  const cr = (typeof crypto !== 'undefined' && crypto.subtle) ? crypto : (typeof require !== 'undefined' ? require('crypto').webcrypto : null);
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = (buf) => { const b = new Uint8Array(buf); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); };
  const ub64 = (s) => { const bin = atob(s); const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b; };
  K.b64 = b64; K.ub64 = ub64;
  const IT = 310000;
  async function key(pw, salt, it) {
    const base = await cr.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
    return cr.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: it, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  K.sifrele = async function (obj, pw) {
    const salt = cr.getRandomValues(new Uint8Array(16)), iv = cr.getRandomValues(new Uint8Array(12));
    const k = await key(pw, salt, IT);
    const ct = await cr.subtle.encrypt({ name: 'AES-GCM', iv }, k, enc.encode(JSON.stringify(obj)));
    return JSON.stringify({ v: 1, alg: 'AES-GCM', kdf: 'PBKDF2-SHA256', it: IT, salt: b64(salt), iv: b64(iv), ct: b64(ct) });
  };
  K.coz = async function (text, pw) {
    const o = typeof text === 'string' ? JSON.parse(text) : text;
    const k = await key(pw, ub64(o.salt), o.it || IT);
    const pt = await cr.subtle.decrypt({ name: 'AES-GCM', iv: ub64(o.iv) }, k, ub64(o.ct));   // yanlış parolada hata fırlatır
    return JSON.parse(dec.decode(pt));
  };
  K.sifreleBin = async function (bytes, pw) {
    const salt = cr.getRandomValues(new Uint8Array(16)), iv = cr.getRandomValues(new Uint8Array(12));
    const k = await key(pw, salt, IT);
    const ct = await cr.subtle.encrypt({ name: 'AES-GCM', iv }, k, bytes);
    return JSON.stringify({ v: 1, alg: 'AES-GCM', kdf: 'PBKDF2-SHA256', it: IT, salt: b64(salt), iv: b64(iv), ct: b64(ct), tip: 'bin' });
  };
  K.cozBin = async function (text, pw) {
    const o = typeof text === 'string' ? JSON.parse(text) : text;
    const k = await key(pw, ub64(o.salt), o.it || IT);
    return cr.subtle.decrypt({ name: 'AES-GCM', iv: ub64(o.iv) }, k, ub64(o.ct));
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = K; else root.K = K;
})(typeof window !== 'undefined' ? window : globalThis);
