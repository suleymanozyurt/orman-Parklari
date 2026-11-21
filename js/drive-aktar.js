(function (root) {
  'use strict';
  const DRIVE = 'https://www.googleapis.com/drive/v3/files';
  const GOOGLE = 'application/vnd.google-apps.';
  const SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
  const FIELDS = 'id,name,mimeType,size,resourceKey,shortcutDetails(targetId,targetResourceKey)';
  const EXPORT = {
    document:['.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    spreadsheet:['.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    presentation:['.pdf','application/pdf']
  };
  const nativeUpload = /\.(pdf|docx|xlsx|jpe?g|png|gif|webp|txt|csv|tsv|md|json|kml|xml|html?)$/i;

  function link(value) {
    let url;
    try { url = new URL(value); } catch { return null; }
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const supported = ['drive.google.com','docs.google.com'].includes(url.hostname);
    if (!supported) return { url };
    const id = url.pathname.match(/\/(?:folders|d)\/([\w-]+)(?:\/|$)/)?.[1] || url.searchParams.get('id');
    const key = url.searchParams.get('resourcekey');
    return id && /^[\w-]+$/.test(id) ? { id, key:key && /^[\w-]+$/.test(key) ? key : '' } : null;
  }

  function authorize(google, clientId) {
    return new Promise((resolve,reject) => {
      const fail = () => reject(Error('Google Drive bağlantısı açılamadı. Google oturumu ve OAuth istemci ayarını kontrol edin.'));
      const client = google.accounts.oauth2.initTokenClient({ client_id:clientId, scope:SCOPE, error_callback:fail,
        callback: (response) => {
          if (response.error || !response.access_token || !google.accounts.oauth2.hasGrantedAllScopes(response,SCOPE)) { fail(); return; }
          resolve(response.access_token);
        }
      });
      client.requestAccessToken();
    });
  }

  async function collect({ links, token, fetch, File, limit, active = () => true }) {
    const files = [], skipped = [], visited = new Set();
    const supportedCount = 100;
    let total = 0, visitedCount = 0, many = false;
    const req = async (suffix, params, id, key) => {
      if (!active()) throw Error('Belge okuma kapatıldı.');
      const headers = { Authorization:'Bearer ' + token };
      if (id && key) headers['X-Goog-Drive-Resource-Keys'] = id + '/' + key;
      const r = await fetch(DRIVE + suffix + '?' + new URLSearchParams(params), { headers, credentials:'omit' });
      if (!r.ok) throw Error(r.status === 401 || r.status === 403 ? 'Google Drive erişimi reddetti.' : 'Google Drive dosyayı açamadı.');
      return r;
    };
    const read = async (r, name, type) => {
      const size = Number(r.headers.get('content-length')) || 0;
      if (size && size + total > limit) { skipped.push(name + ' (boyut sınırı)'); return; }
      const reader = r.body?.getReader();
      let sizeRead = 0;
      const parts = [];
      if (reader) {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          sizeRead += value.byteLength;
          if (total + sizeRead > limit || !active()) { await reader.cancel(); skipped.push(name + ' (boyut sınırı veya işlem kapatıldı)'); return; }
          parts.push(value);
        }
      } else {
        const buffer = await r.arrayBuffer();
        if (total + buffer.byteLength > limit) { skipped.push(name + ' (boyut sınırı)'); return; }
        parts.push(buffer); sizeRead = buffer.byteLength;
      }
      if (!sizeRead) { skipped.push(name + ' (dosya boş)'); return; }
      const file = new File(parts,name,{ type });
      files.push(file); total += sizeRead;
    };
    const meta = async (id,key) => (await req('/' + id,{ fields:FIELDS,supportsAllDrives:'true' },id,key)).json();
    async function add(item, inheritedKey = '', path = '') {
      if (visited.has(item.id) || !active()) return;
      if (visitedCount >= supportedCount) { many = true; return; }
      visitedCount++;
      visited.add(item.id);
      const name = path + item.name, key = item.resourceKey || inheritedKey;
      try {
        if (item.mimeType === GOOGLE + 'shortcut') {
          const shortcut = item.shortcutDetails;
          if (shortcut?.targetId) await add(await meta(shortcut.targetId,shortcut.targetResourceKey),shortcut.targetResourceKey,path);
          else skipped.push(name + ' (kısayol hedefi açılamadı)');
          return;
        }
        if (item.mimeType === GOOGLE + 'folder') {
          let pageToken;
          do {
            const params = { q:"'" + item.id + "' in parents and trashed = false", fields:'nextPageToken,files(' + FIELDS + ')', pageSize:'100',
              supportsAllDrives:'true',includeItemsFromAllDrives:'true',orderBy:'name' };
            if (pageToken) params.pageToken = pageToken;
            const page = await (await req('',params,item.id,key)).json();
            for (const child of page.files || []) await add(child,'',name + '/');
            pageToken = page.nextPageToken;
          } while (pageToken && !many && active());
          return;
        }
        if (total + (Number(item.size) || 0) > limit) { skipped.push(name + ' (boyut sınırı)'); return; }
        const fmt = item.mimeType.startsWith(GOOGLE) && EXPORT[item.mimeType.slice(GOOGLE.length)];
        if (fmt) return await read(await req('/' + item.id + '/export',{ mimeType:fmt[1] },item.id,key),name + fmt[0],fmt[1]);
        if (!nativeUpload.test(name)) { skipped.push(name + ' (desteklenmeyen biçim)'); return; }
        await read(await req('/' + item.id,{ alt:'media',supportsAllDrives:'true' },item.id,key),name,item.mimeType);
      } catch (error) { skipped.push(name + ' (' + error.message + ')'); }
    }
    for (const item of links) {
      if (!active()) break;
      try {
        if (item.id) await add(await meta(item.id,item.key),item.key);
        else {
          const name = decodeURIComponent(item.url.pathname.split('/').pop() || '');
          if (!nativeUpload.test(name)) { skipped.push((name || item.url.hostname) + ' (doğrudan belge bağlantısı gerekli)'); continue; }
          const r = await fetch(item.url,{ credentials:'omit' });
          if (!r.ok) throw Error('Bağlantı açılamadı.');
          const type = r.headers.get('content-type') || '';
          if (type.startsWith('text/html') && !/\.html?$/i.test(name)) throw Error('Dosya yerine giriş veya önizleme sayfası açıldı.');
          await read(r,name,type);
        }
      } catch (error) { skipped.push((item.id || item.url.hostname) + ' (' + error.message + ')'); }
    }
    if (many) skipped.push('Klasörün kalan öğeleri (100 öğe sınırı). Alt klasörleri ayrı okutun.');
    return { files, skipped };
  }

  const api = { link, authorize, collect };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.OPDriveAktar = api;
})(typeof window !== 'undefined' ? window : globalThis);
