/* Orman Parkları — uygulama (görüntüleyici + yönetici). Sayfalar: genel, park, alacaklar, hesap, denetim, ekler, parklar, zincir, muhasebe, veriler */
(function () {
  'use strict';
  const CFG = { owner: 'suleymanozyurt', repo: 'orman-Parklari', branch: 'main', veri: 'data/veri.enc', oran: 'data/oranlar.json', teblig: 'data/teblig.enc', ekler: 'data/ekler.enc', yonetici: 'data/yonetici.enc' };
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (v) => (v == null ? '' : String(v)).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tl = E.tl, fd = E.fmtDate, r2 = E.r2;
  const depo = (D) => ({ get: (k) => { try { return D().getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { D().setItem(k, v); } catch (e) {} },
    del: (k) => { try { D().removeItem(k); } catch (e) {} } });
  const ls = depo(() => localStorage), ss = depo(() => sessionStorage);
  const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const AY3 = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const IC = {
    home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10', park: 'M12 3 6 12h3.5L5 18h14l-4.5-6H18zM12 18v3', money: 'M3 7h18v10H3zM7 12h.01M17 12h.01M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
    calc: 'M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01', check: 'M9 11l3 3 8-8M20 12v7H4V5h11',
    file: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6', list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    chain: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5', gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
    clock: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', build: 'M3 21V10l9-6 9 6v11M9 21v-6h6v6', doc: 'M8 3h8l4 4v14H4V3h4M8 12h8M8 16h5',
    swap: 'M4 8h13l-3-3M20 16H7l3 3', x: 'M6 6l12 12M18 6 6 18', menu: 'M4 6h16M4 12h16M4 18h16', search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5'
  };
  const svg = (d, s, w) => '<svg width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"></path></svg>';
  const LOGO = (s) => '<svg width="' + s + '" height="' + s + '" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#174A37" stroke="#2C6A4D"></circle><path d="M20 7 12.5 18h4L11 26h6.5v6h5v-6H29l-5.5-8h4z" fill="#9CC27A"></path></svg>';
  const PAGES = [
    { id: 'genel', l: 'Genel durum', s: 'Genel', ic: IC.home }, { id: 'park', l: 'Park dosyası', s: 'Park', ic: IC.park },
    { id: 'alacaklar', l: 'Alacaklar', s: 'Alacaklar', ic: IC.money }, { id: 'hesap', l: 'Hesaplama', s: 'Hesap', ic: IC.calc },
    { id: 'denetim', l: 'Denetim ve planlar', s: 'Denetim', ic: IC.check }, { id: 'ekler', l: 'Ekler ve defter', s: 'Ekler', ic: IC.file },
    { id: 'tahakkuk', l: 'Kira ve tahakkuk', s: 'Tahakkuk', ic: IC.clock }, { id: 'teblig', l: 'Tebliğ ve hesaplar', s: 'Tebliğ', ic: IC.doc },
    { h: 'Kayıtlar' }, { id: 'parklar', l: 'Parklar', s: 'Parklar', ic: IC.list }, { id: 'zincir', l: 'Kira zinciri', s: 'Zincir', ic: IC.chain },
    { id: 'muhasebe', l: 'Muhasebe', s: 'Muhasebe', ic: IC.book }, { id: 'veriler', l: 'Veriler ve ayarlar', s: 'Veriler', ic: IC.gear }, { id: 'form', l: 'Ek formu', s: 'Form', ic: IC.file, gizli: true }];

  // ---------------- durum ----------------
  const S = { veri: null, oran: null, pw: null, rapor: null, owner: false, token: null, sha: null, dirty: 0, page: 'genel', park: null, ekB: null, form: null, tY: null, tQ: '', tMd: null,
    af: 'acik', ap: 'Tüm parklar', tool: 'g', defterOnly: false, muhK: 'tümü', muhQ: '', csv: null, hesapS: null, zPark: null };
  function bugun() {
    const q = new URLSearchParams(location.search).get('tarih');
    if (q && /^\d{4}-\d\d-\d\d$/.test(q)) return q;
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    return p;
  }
  // TÜFE: resmî kaynaktan gelen tablo + (yalnız eksik aylar için) yöneticinin girdiği değer
  function tufe() {
    const t = JSON.parse(JSON.stringify(S.oran.tufe.degerler || {}));
    const m = (S.veri && S.veri.tufe_manuel) || {};
    Object.keys(m).forEach((k) => { const [y, mo] = k.split('-').map(Number); t[y] = t[y] || Array(12).fill(null); if (t[y][mo - 1] == null) t[y][mo - 1] = m[k]; });
    return t;
  }
  // veri yapısı (eski kayıtlarla uyum): eksik alanlar boş olarak açılır
  function gocEt(V) {
    V.kurum = V.kurum || {}; V.ekler = V.ekler || {}; V.gecmis = V.gecmis || []; V.gz_manuel = V.gz_manuel || [];
    V.vade_duz = V.vade_duz || []; V.ek_kira = V.ek_kira || []; V.defter = V.defter || []; V.plan = V.plan || []; V.takip = V.takip || []; V.denetim = V.denetim || [];
    V.meta = V.meta || {};
  }
  // gecikme zammı oranları: resmî tablo + yöneticinin kayıt altına aldığı geçici oranlar (aynı tarihte resmî oran varsa o geçerlidir)
  function gzOranlar() {
    const o = S.oran.gz.oranlar.map((x) => [x[0], x[1], x[2] || 'Resmî Gazete']);
    (S.veri.gz_manuel || []).forEach((m) => { if (!o.some((x) => x[0] === m.tarih)) o.push([m.tarih, m.oran, 'Elle: ' + (m.not_ || '')]); });
    return o.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }
  function hesapla() {
    const V = S.veri;
    gocEt(V);
    S.rapor = bugun();
    S.gzO = gzOranlar();
    S.esl = E.eslestir(V);
    S.al = E.alacakHesapla(S.esl.parcalar, S.rapor, S.gzO, S.oran.gz_kdv);
    S.tufe = tufe();
    S.oz = E.parkOzet(V, S.al, S.rapor, S.tufe);
    S.ozBy = {}; S.oz.forEach((o) => { S.ozBy[o.kisa] = o; });
    S.pBy = {}; V.parks.forEach((p) => { S.pBy[p.kisa] = p; });
    if (!S.park || !S.pBy[S.park]) S.park = (S.oz.slice().sort((a, b) => b.vgec - a.vgec)[0] || {}).kisa || (V.parks[0] || {}).kisa;
    const y = E.year(S.rapor); S.plan = {};
    [y, y + 1].forEach((Y) => { S.plan[Y] = {}; V.parks.forEach((p) => { S.plan[Y][p.kisa] = E.tahakkukPlan(V, S.esl, p, S.tufe, Y, S.rapor); }); });
  }

  // ---------------- yükleme ----------------
  async function getText(url, noCache) {
    const r = await fetch(url, { cache: noCache ? 'no-store' : 'default' });
    if (!r.ok) throw new Error(url + ' ' + r.status);
    return r.text();
  }
  async function veriGetir() {
    // En güncel hâl için önce GitHub API (yayın gecikmesi yok), olmazsa site kopyası
    try {
      const h = { Accept: 'application/vnd.github.raw+json' };
      if (S.token) h.Authorization = 'Bearer ' + S.token;
      const r = await fetch('https://api.github.com/repos/' + CFG.owner + '/' + CFG.repo + '/contents/' + CFG.veri + '?ref=' + CFG.branch + '&t=' + Date.now(), { headers: h, cache: 'no-store' });
      if (r.ok) return await r.text();
    } catch (e) { /* çevrimdışı ya da sınır */ }
    return getText(CFG.veri + '?t=' + Date.now(), true);
  }
  async function oranGetir() {
    try {
      const r = await fetch('https://api.github.com/repos/' + CFG.owner + '/' + CFG.repo + '/contents/' + CFG.oran + '?ref=' + CFG.branch + '&t=' + Date.now(), { headers: { Accept: 'application/vnd.github.raw+json' }, cache: 'no-store' });
      if (r.ok) return JSON.parse(await r.text());
    } catch (e) {}
    return JSON.parse(await getText(CFG.oran + '?t=' + Date.now(), true));
  }

  async function basla() {
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
    S.token = ls.get('op_gh') || ss.get('op_gh') || null; S.kim = ls.get('op_kim') || ss.get('op_kim') || 'Yönetici';
    gateGoster('yukleniyor');
    try {
      const [vt, or] = await Promise.all([veriGetir(), oranGetir()]);
      S.enc = vt; S.oran = or;
    } catch (e) { gateGoster('hata', 'Veriler alınamadı. İnternet bağlantısını kontrol edip sayfayı yenileyin. (' + e.message + ')'); return; }
    const kayitli = ls.get('op_pw');
    if (kayitli) { try { S.veri = await K.coz(S.enc, kayitli); S.pw = kayitli; } catch (e) { ls.del('op_pw'); } }
    if (!S.veri) { gateGoster('parola'); return; }
    await acildi();
  }
  async function acildi() {
    if (S.token) await yetkiKontrol(true);
    hesapla();
    kabukKur();
    window.addEventListener('hashchange', yonlendir);
    yonlendir();
  }
  function gateGoster(t, msg) {
    const g = $('#gate'); g.style.display = 'grid'; $('#app').style.display = 'none';
    if (t === 'yukleniyor') { g.innerHTML = '<div class="box" style="text-align:center">' + LOGO(56) + '<h1>Orman Parkları</h1><p>Veriler yükleniyor…</p><span class="spin"></span></div>'; return; }
    if (t === 'hata') { g.innerHTML = '<div class="box">' + LOGO(48) + '<h1>Bağlantı sorunu</h1><p>' + esc(msg) + '</p><button class="btn pri" onclick="location.reload()">Yeniden dene</button></div>'; return; }
    g.innerHTML = '<form class="box" id="gform">' + LOGO(52) + '<h1>Orman Parkları</h1><p>İstanbul Orman İşletme Müdürlüğü · Emlak Şefliği. Kayıtlar şifrelidir; size verilen erişim parolasını girin.</p>' +
      '<input class="fld" id="gpw" type="password" autocomplete="current-password" placeholder="Erişim parolası" aria-label="Erişim parolası" required>' +
      '<label class="chk"><input type="checkbox" id="gkeep" checked> Bu cihazda hatırla</label>' +
      '<button class="btn pri" type="submit">Aç</button><div class="err" id="gerr" role="alert"></div></form>';
    $('#gpw').focus();
    $('#gform').onsubmit = async (ev) => {
      ev.preventDefault(); const pw = $('#gpw').value; $('#gerr').textContent = 'Açılıyor…';
      try { S.veri = await K.coz(S.enc, pw); S.pw = pw; if ($('#gkeep').checked) ls.set('op_pw', pw); await acildi(); }
      catch (e) { $('#gerr').textContent = 'Parola yanlış. Tekrar deneyin.'; }
    };
  }

  // ---------------- GitHub (yalnız yönetici) ----------------
  async function gh(path, opt) {
    opt = opt || {};
    const r = await fetch('https://api.github.com/repos/' + CFG.owner + '/' + CFG.repo + path, Object.assign({}, opt, {
      headers: Object.assign({ Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + S.token, 'X-GitHub-Api-Version': '2022-11-28' }, opt.headers || {}) }));
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((j && j.message) || ('GitHub ' + r.status));
    return j;
  }
  async function yetkiKontrol(sessiz) {
    try {
      const j = await gh('');
      S.owner = !!(j.permissions && j.permissions.push);
      if (!S.owner && !sessiz) toast('Bu anahtarın depoya yazma izni yok.', true);
    } catch (e) { S.owner = false; if (!sessiz) toast('Anahtar doğrulanamadı: ' + e.message, true); }
    document.body.classList.toggle('is-owner', S.owner);
    return S.owner;
  }
  async function shaAl(yol) { try { return (await gh('/contents/' + yol + '?ref=' + CFG.branch)).sha; } catch (e) { return null; } }
  async function dosyaYaz(yol, txt, mesaj) {
    const sha = await shaAl(yol);
    const body = { message: mesaj, content: K.b64(new TextEncoder().encode(txt)), branch: CFG.branch };
    if (sha) body.sha = sha;
    const j = await gh('/contents/' + yol, { method: 'PUT', body: JSON.stringify(body) });
    return j && j.content ? j.content.sha : null;
  }
  async function kaydet() {
    if (!S.owner) { yoneticiGiris(); return; }
    const btn = $('#bKaydet'); if (btn) { btn.disabled = true; btn.textContent = 'Kaydediliyor…'; }
    try {
      const uzak = await shaAl(CFG.veri);
      if (S.sha && uzak && uzak !== S.sha) {
        const ok = confirm('Veriler siz düzenlerken başka bir cihazdan kaydedilmiş. “Tamam” derseniz sizin hâliniz kaydedilir (öteki değişiklikler git geçmişinde kalır). “İptal” derseniz değişiklikleriniz yedek dosyası olarak indirilir ve güncel hâl yüklenir.');
        if (!ok) { AKSIYON.yedekIndir(); S.dirty = 0; if (btn) btn.disabled = false; await yenile(true); return; }
      }
      S.veri.meta.kaydedildi = new Date().toISOString(); S.veri.meta.kaydeden = S.kim || 'Yönetici';
      const txt = await K.sifrele(S.veri, S.pw);
      const body = { message: 'Veriler güncellendi (' + fd(bugun()) + ', ' + (S.kim || 'yönetici') + ')', content: K.b64(new TextEncoder().encode(txt)), branch: CFG.branch };
      if (uzak) body.sha = uzak;
      const j = await gh('/contents/' + CFG.veri, { method: 'PUT', body: JSON.stringify(body) });
      S.sha = j && j.content ? j.content.sha : null;
      S.enc = txt; S.dirty = 0; kabukDurum(); toast('Kaydedildi. Linki açan herkes güncel hâli görür.');
    } catch (e) { toast('Kaydedilemedi: ' + e.message, true); }
    if (btn) { btn.disabled = false; }
    kabukDurum();
  }
  // her değişiklik işlem geçmişine yazılır (kim, ne zaman, ne)
  function degisti(msg, park) {
    S.dirty++;
    if (msg) { S.veri.gecmis = S.veri.gecmis || []; S.veri.gecmis.push({ t: new Date().toISOString(), kim: S.kim || 'Yönetici', is: msg, park: park || null }); if (S.veri.gecmis.length > 2000) S.veri.gecmis.splice(0, S.veri.gecmis.length - 2000); }
    hesapla(); kabukDurum(); sayfaCiz(); if (msg) toast(msg + ' · Kaydetmeyi unutmayın.');
  }

  // ---------------- kabuk (kenar çubuğu, mobil çubuklar) ----------------
  function kabukKur() {
    $('#gate').style.display = 'none'; const A = $('#app'); A.style.display = 'grid';
    const navHtml = PAGES.filter((x) => !x.gizli).map((x) => x.h ? '<div class="h">' + x.h + '</div>' :
      '<a href="#/' + x.id + '" data-p="' + x.id + '">' + svg(x.ic) + x.l + (x.id === 'alacaklar' ? '<span class="cnt" id="cntAl"></span>' : '') + '</a>').join('');
    const tab = ['genel', 'park', 'alacaklar', 'hesap'].map((id) => { const x = PAGES.find((p) => p.id === id); return '<a href="#/' + id + '" data-p="' + id + '">' + svg(x.ic, 22) + x.s + (id === 'alacaklar' ? '<span class="cnt" id="cntAl2"></span>' : '') + '</a>'; }).join('');
    A.innerHTML =
      '<header class="mbar">' + LOGO(34) + '<b id="mTitle">Orman Parkları</b>' +
      '<button class="ib" id="mSearch" aria-label="Ara">' + svg(IC.search, 18, 2) + '</button><button class="ib" id="mMore" aria-label="İşlemler">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle></svg></button></header>' +
      '<nav class="tabbar" aria-label="Alt menü">' + tab + '<button id="tMore">' + svg(IC.menu, 22) + 'Daha</button></nav>' +
      '<aside class="side"><div class="brand">' + LOGO(40) + '<div><b>Orman Parkları</b><small>İstanbul OİM · Emlak Şefliği</small></div></div>' +
      '<nav class="nav" aria-label="Sayfalar">' + navHtml + '</nav>' +
      '<div class="sbox"><label class="ssearch">' + svg(IC.search, 15, 2) + '<input id="sQ" type="search" placeholder="Park, işletmeci, yevmiye ara" aria-label="Ara"></label><div class="sres" id="sRes"></div></div>' +
      '<div class="sbox" id="sPark"><span class="lbl">Seçili park</span><select id="sSel" aria-label="Park seçin"></select>' +
      '<div class="sgrid"><button class="sbtn" data-a="prev">‹ Önceki</button><button class="sbtn" data-a="next">Sonraki ›</button></div>' +
      '<span class="lbl" id="sQl">Vadesi geçmiş alacağı olan</span><div class="sq" id="sQuick"></div></div>' +
      '<div class="sbox"><span class="lbl">İşlemler</span>' +
      '<div class="sgrid"><button class="sbtn" data-a="geri">Geri</button><button class="sbtn" data-a="pdf">PDF kaydet</button></div>' +
      '<div class="sgrid"><button class="sbtn" data-a="csv">CSV indir</button><button class="sbtn" data-a="paylas">Paylaş</button></div>' +
      '<button class="sbtn" data-a="yenile">Verileri yenile</button>' +
      '<button class="sbtn pri own-only" id="bKaydet" data-a="kaydet">Değişiklikleri kaydet</button>' +
      '<button class="sbtn view-only" data-a="giris">Yönetici girişi</button><button class="sbtn own-only" data-a="cikis">Yönetici çıkışı</button></div>' +
      '<div class="foot" id="sFoot"></div></aside>' +
      '<div class="main"><div class="wrap" id="page"></div></div>';
    $('#sSel').innerHTML = S.veri.parks.map((p) => '<option>' + esc(p.kisa) + '</option>').join('');
    $('#sSel').onchange = (e) => parkSec(e.target.value);
    A.addEventListener('click', tikla);
    $('#sQ').addEventListener('input', (e) => ara(e.target.value, $('#sRes')));
    $('#mSearch').onclick = aramaSheet; $('#mMore').onclick = menuSheet; $('#tMore').onclick = menuSheet;
    window.addEventListener('beforeunload', (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });
    document.body.classList.toggle('is-owner', S.owner);
    kabukDurum();
  }
  function kabukDurum() {
    const late = S.oz.filter((o) => o.vgec > 0).length;
    ['#cntAl', '#cntAl2'].forEach((s) => { const el = $(s); if (el) { el.textContent = late || ''; el.style.display = late ? '' : 'none'; } });
    const tf = S.oran.tufe, sonAy = sonTufeAyi();
    const muhT = S.veri.meta.muhasebe_tarihi;
    $('#sFoot').innerHTML = 'Rapor tarihi <b class="n">' + fd(S.rapor) + '</b><br>Muhasebe verisi <b class="n">' + fd(muhT) + '</b><br>TÜFE son veri <b>' + (sonAy ? AY[sonAy[1] - 1] + ' ' + sonAy[0] : '—') + '</b>' +
      (tufeGecikti() ? '<br><span class="warn">TÜFE güncellemesi bekleniyor</span>' : '') + '<br>GZ oranı <b>%' + (gzSon()[1] * 100).toLocaleString('tr-TR') + '</b> · ' + fd(gzSon()[0]) +
      '<div class="role ' + (S.owner ? 'own' : '') + '" style="margin-top:8px"><i></i>' + (S.owner ? 'Yönetici · düzenleme açık' : 'Görüntüleme') + '</div>';
    const b = $('#bKaydet'); if (b) b.textContent = S.dirty ? 'Değişiklikleri kaydet (' + S.dirty + ')' : 'Kaydedildi ✓';
  }
  const gzSon = () => S.gzO[S.gzO.length - 1];
  function sonTufeAyi() { const t = S.tufe || {}; let best = null; Object.keys(t).forEach((y) => (t[y] || []).forEach((v, i) => { if (v != null) { const k = [+y, i + 1]; if (!best || k[0] * 12 + k[1] > best[0] * 12 + best[1]) best = k; } })); return best; }
  // TÜİK ayın 3'ünde açıklar: bugün ayın 5'ini geçtiyse önceki ayın verisi olmalı
  function tufeGecikti() { const s = sonTufeAyi(); if (!s) return true; const [y, m, d] = S.rapor.split('-').map(Number); let ey = y, em = m - 1; if (d < 5) em--; if (em <= 0) { em += 12; ey--; } return s[0] * 12 + s[1] < ey * 12 + em; }

  function tikla(ev) {
    const t = ev.target.closest('[data-a]'); if (!t) return;
    const a = t.dataset.a;
    if (t.tagName === 'A' && t.getAttribute('href') === '#') ev.preventDefault();
    const keys = S.veri.parks.map((p) => p.kisa), i = keys.indexOf(S.park);
    switch (a) {
      case 'prev': parkSec(keys[(i - 1 + keys.length) % keys.length]); break;
      case 'next': parkSec(keys[(i + 1) % keys.length]); break;
      case 'park': parkSec(t.dataset.k, t.dataset.go); break;
      case 'geri': if (history.length > 1) history.back(); else location.hash = '#/genel'; break;
      case 'pdf': modalKapat(); setTimeout(() => window.print(), 50); break;
      case 'csv': csvIndir(); break;
      case 'paylas': paylas(); break;
      case 'yenile': yenile(); break;
      case 'kaydet': kaydet(); break;
      case 'giris': yoneticiGiris(); break;
      case 'cikis': if (!S.dirty || confirm('Kaydedilmemiş değişiklikler silinecek. Çıkılsın mı?')) { ls.del('op_gh'); ss.del('op_gh'); ls.del('op_kim'); ss.del('op_kim'); S.token = null; S.owner = false; document.body.classList.remove('is-owner'); if (S.dirty) { location.reload(); return; } kabukDurum(); sayfaCiz(); toast('Yönetici oturumu kapatıldı.'); } break;
      default: if (AKSIYON[a]) AKSIYON[a](t, ev);
    }
  }
  function parkSec(k, go) {
    if (!S.pBy[k]) return; S.park = k; S.zPark = k;
    if (go) { if (location.hash !== '#/' + go) { location.hash = '#/' + go; return; } }
    modalKapat(); sayfaCiz();
  }
  async function yenile(zorla) {
    if (!zorla && S.dirty && !confirm('Kaydedilmemiş değişiklikleriniz var. Sunucudaki son hâl yüklenirse bu değişiklikler kaybolur. Devam edilsin mi?')) return;
    toast('Güncel veriler alınıyor…');
    try {
      const [vt, or] = await Promise.all([veriGetir(), oranGetir()]);
      S.enc = vt; S.oran = or; S.veri = await K.coz(vt, S.pw); S.dirty = 0; if (S.owner) S.sha = await shaAl(CFG.veri); hesapla(); kabukDurum(); sayfaCiz(); toast('Veriler ve oranlar güncel.');
    } catch (e) { toast('Yenilenemedi: ' + e.message, true); }
  }
  function paylas() {
    const url = location.origin + location.pathname + location.hash;
    if (navigator.share) navigator.share({ title: 'Orman Parkları', text: 'Orman Parkları kira takip programı', url }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Bağlantı kopyalandı. Açacak kişiye erişim parolasını ayrıca iletin.'));
    else prompt('Bağlantı', url);
  }
  function csvIndir() {
    const c = S.csv; if (!c || !c.rows.length) { toast('Bu sayfada indirilecek tablo yok.', true); return; }
    const q = (v) => { v = v == null ? '' : (typeof v === 'number' ? v.toLocaleString('tr-TR', { maximumFractionDigits: 2, useGrouping: false }) : String(v)); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const txt = '﻿' + [c.head].concat(c.rows).map((r) => r.map(q).join(';')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' })); a.download = c.name + '_' + S.rapor + '.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function toast(msg, err) {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.className = 'toast on' + (err ? ' err' : ''); clearTimeout(t._h); t._h = setTimeout(() => { t.className = 'toast' + (err ? ' err' : ''); }, err ? 6000 : 3500);
  }
  // ---- modal ----
  function modal(title, body, foot) {
    let m = $('#modal'); if (!m) { m = document.createElement('div'); m.id = 'modal'; m.className = 'modal'; document.body.appendChild(m);
      m.addEventListener('click', (e) => { if (e.target === m) modalKapat(); }); m.addEventListener('click', tikla); }
    m.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="sh"><h3>' + esc(title) + '</h3><button class="x" aria-label="Kapat" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">×</button></div>' +
      '<div class="sb">' + body + '</div>' + (foot ? '<div class="sf">' + foot + '</div>' : '') + '</div>';
    m.classList.add('on');
    const f = m.querySelector('input,select,textarea,button.btn'); if (f) setTimeout(() => f.focus(), 30);
    return m;
  }
  function modalKapat() { const m = $('#modal'); if (m) m.classList.remove('on'); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modalKapat(); });

  function menuSheet() {
    const late = S.oz.filter((o) => o.vgec > 0).map((o) => o.kisa);
    modal('Menü', '<div class="menu">' + PAGES.filter((x) => !x.h && !x.gizli).map((x) => '<a href="#/' + x.id + '" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">' + svg(x.ic, 20) + x.l + '</a>').join('') + '</div>' +
      '<div class="f"><label>Seçili park</label><select class="fld" id="mPark">' + S.veri.parks.map((p) => '<option' + (p.kisa === S.park ? ' selected' : '') + '>' + esc(p.kisa) + '</option>').join('') + '</select></div>' +
      (late.length ? '<div class="chiprow">' + late.map((k) => '<button class="btn sm red" data-a="park" data-k="' + esc(k) + '" data-go="park">' + esc(k) + '</button>').join('') + '</div>' : '') +
      '<div class="frow"><button class="btn" data-a="pdf">PDF kaydet</button><button class="btn" data-a="csv">CSV indir</button><button class="btn" data-a="paylas">Paylaş</button><button class="btn" data-a="yenile">Verileri yenile</button>' +
      '<button class="btn pri own-only" data-a="kaydet">Değişiklikleri kaydet' + (S.dirty ? ' (' + S.dirty + ')' : '') + '</button>' +
      '<button class="btn view-only" data-a="giris">Yönetici girişi</button><button class="btn own-only" data-a="cikis">Yönetici çıkışı</button></div>' +
      '<p class="muted" style="font-size:13px;margin:0">Rapor tarihi ' + fd(S.rapor) + ' · Muhasebe ' + fd(S.veri.meta.muhasebe_tarihi) + ' · ' + (S.owner ? 'Yönetici' : 'Görüntüleme') + '</p>');
    $('#mPark').onchange = (e) => parkSec(e.target.value, 'park');
  }
  function aramaSheet() {
    modal('Ara', '<input class="fld" id="mQ" type="search" placeholder="Park, işletmeci, VKN, yevmiye no" style="font-size:16px;padding:12px"><div class="sres on" id="mRes" style="border:1px solid var(--line)"></div>');
    $('#mQ').addEventListener('input', (e) => ara(e.target.value, $('#mRes')));
  }
  function ara(q, box) {
    q = (q || '').trim().toLocaleLowerCase('tr-TR');
    if (q.length < 2) { box.classList.remove('on'); box.innerHTML = ''; return; }
    const out = [];
    S.veri.parks.forEach((p) => { const t = [p.kisa, p.ad, p.isletmeci, p.vkn, p.seflik].join(' ').toLocaleLowerCase('tr-TR'); if (t.includes(q)) out.push('<a href="#/park" data-a="park" data-k="' + esc(p.kisa) + '" data-go="park">' + esc(p.kisa) + '<small>' + esc(p.isletmeci || '') + '</small></a>'); });
    S.veri.muhasebe.forEach((x) => { if (out.length > 30) return; const t = (String(x.yev) + ' ' + x.aciklama + ' ' + x.musteri).toLocaleLowerCase('tr-TR'); if (t.includes(q)) out.push('<a href="#/muhasebe" data-a="muhara" data-q="' + esc(String(x.yev)) + '">Yev. ' + x.yev + ' · ' + fd(x.tarih) + '<small>' + esc(x.aciklama) + ' · ' + tl(x.borc || x.alacak) + '</small></a>'); });
    box.innerHTML = out.length ? out.slice(0, 30).join('') : '<a class="muted">Sonuç yok</a>'; box.classList.add('on');
  }

  // ---------------- yönlendirme ----------------
  function yonlendir() {
    const id = (location.hash.replace(/^#\/?/, '') || 'genel').split('?')[0];
    S.page = PAGES.find((p) => p.id === id) ? id : 'genel';
    modalKapat(); sayfaCiz(); window.scrollTo(0, 0);
  }
  function sayfaCiz() {
    $$('.nav a, .tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.p === S.page));
    const showPark = ['park', 'ekler', 'zincir', 'form', 'teblig'].includes(S.page);
    $('#sPark').style.display = showPark ? '' : 'none';
    $('#sSel').value = S.park;
    const late = S.oz.filter((o) => o.vgec > 0).map((o) => o.kisa);
    $('#sQuick').innerHTML = late.map((k) => '<button data-a="park" data-k="' + esc(k) + '">' + esc(k) + '</button>').join('');
    $('#sQl').style.display = late.length && S.page === 'park' ? '' : 'none'; $('#sQuick').style.display = late.length && S.page === 'park' ? '' : 'none';
    $('#mTitle').textContent = (PAGES.find((p) => p.id === S.page) || {}).l || 'Orman Parkları';
    S.csv = null;
    $('#page').innerHTML = (SAYFA[S.page] || SAYFA.genel)();
    if (AFTER[S.page]) AFTER[S.page]();
    document.title = ((PAGES.find((p) => p.id === S.page) || {}).l || '') + ' – Orman Parkları';
  }
  const mpick = () => '<div class="mpick"><button data-a="prev" aria-label="Önceki park">‹</button><select aria-label="Park seçin" onchange="window.__parkSec(this.value)">' +
    S.veri.parks.map((p) => '<option' + (p.kisa === S.park ? ' selected' : '') + '>' + esc(p.kisa) + '</option>').join('') + '</select><button data-a="next" aria-label="Sonraki park">›</button></div>';
  window.__parkSec = (k) => parkSec(k);
  const td = (v, lab, cls, extra) => '<td' + (cls ? ' class="' + cls + '"' : '') + (lab ? ' data-l="' + esc(lab) + '"' : '') + (extra || '') + '>' + v + '</td>';
  const badgeDurum = { 'Ödenmedi': 'b-no', 'Geç ödendi': 'b-amb', 'Ödendi': 'b-ok', 'Vadesi gelmedi': 'b-gray', 'Vade yok': 'b-amb' };
  const stCls = (d) => 'st st-' + (d || '').split(' ')[0];
  const trees = (seed, base, hmin, hmax, step) => { let d = 'M0 70 L0 ' + base, x = 0, s = seed; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    while (x < 1200) { const w = step * (0.7 + rnd() * 0.6), h = hmin + rnd() * (hmax - hmin); d += ' L' + (x + w * 0.5).toFixed(1) + ' ' + (base - h).toFixed(1) + ' L' + (x + w).toFixed(1) + ' ' + base; x += w; } return d + ' L1200 70 Z'; };
  const treeSvg = (a, b) => '<svg class="trees" viewBox="0 0 1200 70" preserveAspectRatio="none" aria-hidden="true"><path d="' + trees(a, 70, 18, 46, 26) + '" fill="rgba(255,255,255,.05)"></path><path d="' + trees(b, 70, 8, 30, 18) + '" fill="rgba(156,194,122,.10)"></path></svg>';
  const trLow = (s) => (s || '').toLocaleLowerCase('tr-TR');
  const sumOf = (arr, f) => r2(arr.reduce((s, x) => s + (f ? f(x) : x), 0));

  // =============== SAYFALAR ===============
  const SAYFA = {}, AFTER = {}, AKSIYON = {};

  // ---------- GENEL DURUM ----------
  SAYFA.genel = function () {
    const R = S.rapor, y = E.year(R), m0 = E.month(R) - 1, al = S.al;
    const late = S.oz.filter((o) => o.vgec > 0);
    const vgec = sumOf(late, (o) => o.vgec), gz = sumOf(S.oz, (o) => o.gz);
    const enEski = late.map((o) => o.enEski).filter(Boolean).sort()[0];
    const kira = sumOf(S.oz, (o) => o.kira_yil), tah = sumOf(al.filter((a) => a.odeme), (a) => a.tutar), tum = sumOf(al, (a) => a.tutar);
    const acik = sumOf(al, (a) => a.acik), nAcik = al.filter((a) => a.acik > 0).length;
    const D = S.veri.parks.map((p) => p.durum);
    const cnt = (s) => D.filter((d) => d === s).length;
    const hero = '<section class="hero"><div><h1>' + (late.length ? 'Bugün ' + late.length + ' parkta vadesi geçmiş alacak var' : 'Vadesi geçmiş alacak yok') + '</h1>' +
      '<p>' + (late.length ? late.map((o) => esc(o.kisa)).join(', ').replace(/, ([^,]*)$/, ' ve $1') + ' için ödeme takibi gerekiyor. Park adına dokununca park dosyası açılır.' : 'Vadesi gelmiş bütün alacaklar ödenmiş görünüyor.') + '</p>' +
      '<div class="chips">' + late.map((o) => '<a class="chip" href="#/park" data-a="park" data-k="' + esc(o.kisa) + '" data-go="park"><i></i>' + esc(o.kisa) + '</a>').join('') + '</div></div>' +
      '<div class="big"><span>Vadesi geçmiş alacak</span><strong class="n">' + tl(vgec) + ' TL</strong><div class="row"><div>Gecikme zammı ve KDV’si<b class="n">' + tl(gz) + '</b></div><div>En eski vade<b class="n">' + fd(enEski) + '</b></div></div></div>' +
      treeSvg(7, 31) + '</section>';
    const kp = [['Bu yıl vadeli kira', tl(kira), 'Ek ve kıst tahakkuklar dahil', 'var(--ink)', 100, '#3F7D4E'],
      ['Tahsil edilen', tl(tah), 'Dökümdeki ' + tl(tum) + ' TL tahakkukun %' + (tum ? (tah / tum * 100).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) : 0) + '’i', '#1E6B3E', tum ? Math.round(tah / tum * 100) : 0, '#2F8A55'],
      ['Açık alacak', tl(acik), nAcik + ' kalem, 120.99 + 127', 'var(--ink)', tum ? Math.max(2, Math.round(acik / tum * 100)) : 0, '#C2412D'],
      ['Kiradaki park', cnt('Kirada') + ' / ' + D.length, cnt('Sona erdi') + ' sona erdi, ' + cnt('İhale edilecek') + ' ihale, ' + cnt('Davalık') + ' davalık', 'var(--ink)', Math.round(cnt('Kirada') / D.length * 100), '#9CC27A']];
    const kpis = '<section class="kpis">' + kp.map((k) => '<div class="kpi"><span>' + k[0] + '</span><strong class="n" style="color:' + k[3] + '">' + k[1] + '</strong><em>' + k[2] + '</em><div class="bar"><i style="width:' + k[4] + '%;background:' + k[5] + '"></i></div></div>').join('') + '</section>';
    // takvim
    const calCls = (k, mo) => {
      const A = al.filter((a) => a.park === k && a.esas && E.year(a.esas) === y && E.month(a.esas) === mo + 1);
      if (A.some((a) => a.durum === 'Ödenmedi')) return 'red'; if (A.some((a) => a.durum === 'Geç ödendi')) return 'amb';
      if (A.some((a) => a.durum === 'Vadesi gelmedi')) return 'open'; if (A.some((a) => a.durum === 'Ödendi')) return 'ok'; return '';
    };
    const rows = S.veri.parks.map((p) => { const o = S.ozBy[p.kisa];
      return '<tr>' + td('<a class="pk" href="#/park" data-a="park" data-k="' + esc(p.kisa) + '" data-go="park">' + esc(p.kisa) + '<small>' + esc(p.seflik) + ' Şefliği</small></a>', '', 'lead') +
        td('<span class="' + stCls(p.durum) + '">' + esc(p.durum) + '</span>', 'Durum') +
        AY3.map((a, i) => { const c = calCls(p.kisa, i); return '<td class="mc' + (i === m0 ? ' now' : '') + '" data-l="' + a + '">' + (c ? '<i class="cal c-' + c + '" title="' + a + '"></i>' : '') + '</td>'; }).join('') +
        td(o.kira_yil ? tl(o.kira_yil) : '–', 'Bu yıl kira', 'n r') + td('<b>' + (o.acik ? tl(o.acik) : '–') + '</b>', 'Açık alacak', 'n r') +
        td(o.vgec ? tl(o.vgec) : '–', 'Vadesi geçmiş', 'n r' + (o.vgec ? ' red-t' : ' muted')) + td(o.gz ? tl(o.gz) : '–', 'GZ ve KDV', 'n r' + (o.gz ? ' red-t' : ' muted')) + '</tr>'; }).join('');
    S.csv = { name: 'genel_durum', head: ['Park', 'Şeflik', 'Durum', 'Bu yıl kira', 'Açık alacak', 'Vadesi geçmiş', 'GZ ve KDV'],
      rows: S.veri.parks.map((p) => { const o = S.ozBy[p.kisa]; return [p.kisa, p.seflik, p.durum, o.kira_yil, o.acik, o.vgec, o.gz]; }) };
    const cal = '<section class="card"><div class="ch"><h2>' + y + ' ödeme takvimi</h2><div class="leg"><span><i class="cal c-ok"></i>Vadesinde ödendi</span><span><i class="cal c-amb"></i>Geç ödendi</span><span><i class="cal c-red"></i>Ödenmedi</span><span><i class="cal c-open"></i>Vadesi gelmedi</span></div></div>' +
      '<div class="scroll"><table class="rt" style="min-width:1040px"><thead><tr><th>Park</th><th>Durum</th>' + AY3.map((a, i) => '<th class="mc' + (i === m0 ? ' now' : '') + '">' + a + '</th>').join('') +
      '<th class="r">Bu yıl kira</th><th class="r">Açık alacak</th><th class="r">Vadesi geçmiş</th><th class="r">GZ ve KDV</th></tr></thead><tbody>' + rows +
      '<tr style="font-weight:600">' + td('Toplam', '', 'lead') + '<td colspan="13"></td>' + td(tl(kira), 'Bu yıl kira', 'n r') + td(tl(acik), 'Açık alacak', 'n r') + td(tl(vgec), 'Vadesi geçmiş', 'n r red-t') + td(tl(gz), 'GZ ve KDV', 'n r red-t') + '</tr>' +
      '</tbody></table></div></section>';
    // öncelik listesi
    const todo = [];
    late.slice().sort((a, b) => b.vgec - a.vgec).forEach((o) => {
      const p = S.pBy[o.kisa], A = al.filter((a) => a.park === o.kisa && a.durum === 'Ödenmedi');
      const esik = o.enEski ? E.addMonths(o.enEski, 24) : null;
      todo.push({ k: o.kisa, red: true, tutar: tl(o.vgec), alt: '+ GZ ' + tl(o.gz),
        ne: A.length + ' kalem ödenmedi; en eski vade ' + fd(o.enEski) + '. Md. 39/2 fesih eşiği ' + fd(esik) + '.' + (p.yapilacak ? ' ' + p.yapilacak : '') });
    });
    // onaylanmış revize plan, ek kira tahakkuku yok
    (S.veri.plan || []).forEach((pl) => {
      if (E.year(pl.onay) !== y) return;
      const t = revizeTahakkuk(pl); if (t.var) return;
      todo.push({ k: pl.park, red: false, tutar: tl(pl.ek), alt: 'yıllık ek kira', ne: pl.revize + ' ' + fd(pl.onay) + '’de onaylandı; kıst ek kira (' + tl(t.kist) + '), ağaçlandırma, KDV ve ek kesin teminat (' + tl(r2(pl.ek * .06)) + ') tahakkuk ettirilmeli (Md. 30/2, 9/2).' });
    });
    Object.values(S.plan[y] || {}).forEach((t) => { if (t.kod === 'bekliyor') todo.push({ k: t.park, red: true, tutar: tl(t.kira), alt: y + ' yıllık kira', go: 'tahakkuk',
      ne: y + ' yılı kira tahakkuku muhasebe dökümünde ve programda yok. Tebliğe göre yıllık kira ' + tl(t.kira) + ' TL (' + t.donem + '. dönem, başlangıç ' + fd(t.bas) + '); Kira ve tahakkuk sayfasından tahakkuk edilebilir.' }); });
    const sy = Object.values(S.plan[y + 1] || {}), hz = sy.filter((t) => t.kod === 'plan'), bk = sy.filter((t) => t.kod === 'tufe');
    if (hz.length || bk.length) todo.push({ k: '', red: false, tutar: hz.length + ' / ' + (hz.length + bk.length), alt: (y + 1) + ' kirası hesaplanan', go: 'tahakkuk',
      ne: (y + 1) + ' yılı kiraları: ' + (hz.length ? hz.map((t) => t.park).join(', ') + ' hesaplandı' : 'henüz hesaplanan yok') + (bk.length ? '; ' + bk.length + ' park TÜFE bekliyor (en erken ' + fd(bk.map((t) => t.yayim).filter(Boolean).sort()[0]) + ', otomatik tamamlanır).' : '.') });
    S.veri.parks.forEach((p) => { if (p.durum === 'Sona erdi') todo.push({ k: p.kisa, red: false, tutar: '', alt: '', ne: 'Sözleşme ' + fd(p.soz_bit) + '’de sona erdi: geri teslim tutanağı 15 gün içinde GM’ye (Md. 13/1), yeniden ihale.' }); });
    const todoH = '<section class="card"><div class="ch"><h2>Öncelik sırasıyla yapılacaklar</h2></div><ul class="todo">' + todo.map((t, i) => '<li><span class="no" style="background:' + (t.red ? 'var(--red)' : 'var(--amb)') + '">' + (i + 1) + '</span>' +
      '<div><b>' + (t.go && !t.k ? '<a href="#/' + t.go + '">Kira ve tahakkuk</a>' : '<a href="#/' + (t.go || 'park') + '" data-a="park" data-k="' + esc(t.k) + '" data-go="' + (t.go || 'park') + '">' + esc(t.k) + '</a>') + '</b><p>' + esc(t.ne) + '</p></div><div class="amt n" style="color:' + (t.red ? 'var(--red)' : 'var(--ambt)') + '">' + t.tutar + '<small>' + esc(t.alt) + '</small></div></li>').join('') +
      (todo.length ? '' : '<li><div></div><p>Bekleyen iş yok.</p></li>') + '</ul></section>';
    // 60 gün
    const son = E.addDays(R, 60), grp = {};
    al.filter((a) => a.acik > 0 && a.esas && a.esas >= R && a.esas <= son).forEach((a) => { const k = a.esas + '|' + a.park; grp[k] = grp[k] || { esas: a.esas, park: a.park, t: 0, ek: false }; grp[k].t += a.acik; if (a.grup === 'Ek tahakkuk') grp[k].ek = true; });
    const up = Object.values(grp).sort((a, b) => (a.esas < b.esas ? -1 : a.esas > b.esas ? 1 : 0));
    const tlH = '<section class="card"><div class="ch"><h2>Önümüzdeki 60 günün vadeleri</h2></div><div class="tl">' + up.map((u) => '<div class="d"><div class="day"><b>' + E.fmtDate(u.esas).slice(0, 2) + '</b><span>' + AY3[E.month(u.esas) - 1] + '</span></div>' +
      '<div class="who"><b>' + esc(u.park) + '</b><span>' + E.days(R, u.esas) + ' gün sonra' + (u.ek ? ' · ek kira dahil' : '') + '</span></div><div class="n" style="font-weight:600">' + tl(u.t) + '</div></div>').join('') +
      (up.length ? '' : '<div class="empty">60 gün içinde vadesi gelen alacak yok.</div>') + '<div class="sum"><span>Toplam</span><span class="n">' + tl(sumOf(up, (u) => u.t)) + '</span></div></div></section>';
    const tiles = [['park', 'Park dosyası', 'Sözleşme, bedeller, denetim ve alacaklar tek sayfada', IC.park], ['alacaklar', 'Alacaklar', 'Kalem kalem vade, ödeme ve gecikme zammı', IC.money],
      ['hesap', 'Hesaplama', 'Gecikme zammı, ek tesis, ihale, devir, fesih', IC.calc], ['denetim', 'Denetim ve planlar', 'Ek-10 sonuçları, revize planlar, yazışmalar', IC.check],
      ['ekler', 'Ekler ve defter', 'Tebliğin 18 eki, süre sınırları, işlem defteri', IC.file], ['zincir', 'Kira zinciri', 'Md. 31–32 kira hesabı ve muhasebe karşılaştırması', IC.chain]];
    const tilesH = '<section class="tiles">' + tiles.map((t) => '<a class="tile" href="#/' + t[0] + '"><span class="ic" style="color:#2F6B45">' + svg(t[3], 20) + '</span><span><b>' + t[1] + '</b><p>' + t[2] + '</p></span></a>').join('') + '</section>';
    return banners() + hero + kpis + cal + '<div class="split">' + todoH + tlH + '</div>' + tilesH;
  };
  function banners() {
    let h = '';
    if (tufeGecikti()) { const s = sonTufeAyi(); h += '<div class="banner noprint">' + svg(IC.clock, 18, 2) + '<div><b>TÜFE güncellemesi bekleniyor.</b> Elde en son ' + (s ? AY[s[1] - 1] + ' ' + s[0] : '—') + ' verisi var. Otomatik güncelleme günde bir kez TÜİK’ten denenir' + (S.oran.tufe.durum ? ' (' + esc(S.oran.tufe.durum) + ')' : '') + '. Kira hesapları bu aya kadar doğrudur.</div></div>'; }
    if (S.esl.uyarilar.length) h += '<div class="banner">' + svg(IC.check, 18, 2) + '<div><b>Muhasebe eşleştirme uyarısı:</b> ' + S.esl.uyarilar.map(esc).join(' · ') + '</div></div>';
    return h;
  }
  function revizeTahakkuk(pl) {
    const gun = E.days(pl.kist_bas, E.year(pl.kist_bas) + '-12-31'), kist = r2(pl.ek * gun / 365);
    const it = S.esl.items.filter((x) => x.park === pl.park && x.grup === 'Ek tahakkuk' && x.tur === 'Kira' && (Math.abs(x.tutar - kist) < 0.05 || Math.abs(x.tutar - kist / 2) < 0.05));
    return { gun, kist, agac: r2(kist * .05), kdv: r2((kist + r2(kist * .05)) * .2), var: it.length > 0 };
  }

  // ---------- PARK DOSYASI ----------
  SAYFA.park = function () {
    const p = S.pBy[S.park], o = S.ozBy[S.park], kk = o.kk, R = S.rapor, y = E.year(R);
    const A = S.al.filter((a) => a.park === p.kisa);
    const kalan = o.kalan != null ? o.kalan.toLocaleString('tr-TR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + ' yıl' : '—';
    const head = '<section class="phead"><div><div class="tag"><b>' + esc(p.durum) + '</b>' + esc(p.seflik) + ' Şefliği · ' + esc(p.sekil || '') + (p.alan ? ' · ' + p.alan.toLocaleString('tr-TR') + ' ha' : '') + '</div>' +
      '<h1>' + esc(p.ad) + '</h1><p>' + esc(p.isletmeci || '—') + (p.vkn ? ' <span style="color:#A9C7B4">(' + (p.vkn.length === 11 ? 'TCKN ' : 'VKN ') + esc(p.vkn) + ')</span>' : '') + '</p>' +
      '<div class="facts"><div>Sözleşme<b class="n">' + (p.soz_bas ? fd(p.soz_bas) + ' – ' + fd(p.soz_bit) : '—') + '</b></div><div>Kalan süre<b>' + kalan + '</b></div><div>İhale bedeli<b class="n">' + (p.ihale_b != null ? tl(p.ihale_b) + ' TL' : '—') + '</b></div></div>' +
      '<div class="own-only" style="margin-top:14px"><button class="btn sm" data-a="parkDuzenle" data-k="' + esc(p.kisa) + '">Park bilgilerini düzenle</button></div></div>' +
      '<div class="big"><span>Açık alacak</span><strong class="n">' + tl(o.acik) + ' TL</strong><div class="row"><div>Vadesi geçmiş<b class="n">' + tl(o.vgec) + '</b></div><div>GZ ve KDV’si<b class="n">' + tl(o.gz) + '</b></div></div></div>' + treeSvg(11, 41) + '</section>';
    const uy = o.uyari.filter((u) => u !== 'Vadesi geçmiş alacak');
    const alert = (o.vgec > 0 || uy.length) ? '<div class="alert ' + (o.vgec > 0 ? 'red' : 'amb') + '">' + svg('M12 3 2 21h20zM12 10v5M12 18h.01', 18, 2) + '<span>' +
      (o.vgec > 0 ? 'Vadesi geçmiş ' + tl(o.vgec) + ' TL (en eski vade ' + fd(o.enEski) + ', Md. 39/2 fesih eşiği ' + fd(E.addMonths(o.enEski, 24)) + '). ' : '') + esc(uy.join(' · ')) + (p.yapilacak ? ' · ' + esc(p.yapilacak) : '') + '</span></div>' : '';
    // taksitler
    const tk = {}; A.filter((a) => a.grup === y + ' tahakkuku' && a.tur === 'Kira').forEach((a) => { const k = a.esas; tk[k] = tk[k] || { esas: k, t: 0, d: [], o: [] }; tk[k].t += a.tutar; tk[k].d.push(a.durum); if (a.odeme) tk[k].o.push(a.odeme); });
    const tks = Object.values(tk).sort((a, b) => (a.esas < b.esas ? -1 : 1));
    const ic = { 'Ödenmedi': ['red', '#C2412D'], 'Geç ödendi': ['amb', '#DDA034'], 'Ödendi': ['ok', '#2F8A55'], 'Vadesi gelmedi': ['open', '#DDE4DC'] };
    const inst = '<section class="card"><div class="ch"><h2>' + y + ' kira taksitleri</h2><span class="muted" style="font-size:13px">Ödeme şekli: ' + esc(p.odeme || '—') + ' · Md. 32/3</span></div>' +
      (tks.length ? '<div class="inst" style="padding:0 22px 20px">' + tks.map((t, i) => { const d = ['Ödenmedi', 'Geç ödendi', 'Vadesi gelmedi', 'Ödendi'].find((x) => t.d.includes(x)); const c = ic[d] || ['open', '#DDE4DC'];
        return '<div class="ins ' + c[0] + '"><div class="d">' + (tks.length > 1 ? (i + 1) + '. taksit · ' : '') + 'vade ' + fd(t.esas) + '</div><b class="n">' + tl(t.t) + ' TL</b><div class="s">' + d + (t.o.length ? ' · ' + fd(t.o.sort().slice(-1)[0]) : '') + '</div><div class="bar" style="background:' + c[1] + '"></div></div>'; }).join('') + '</div>'
        : '<div class="empty">' + y + ' yılı kira tahakkuku muhasebe dökümünde yok.</div>') + '</section>';
    const yk = kk.muh != null ? kk.muh : kk.hesap;
    const kv = (a, b) => '<div class="kv"><span>' + a + '</span><span class="n">' + b + '</span></div>';
    const soz = '<section class="panel"><h3>Sözleşme</h3>' + kv('İhale usulü', esc(p.sekil || '—')) + kv('İhale tarihi', fd(p.ihale_t)) + kv('İhale bedeli (1. yıl kira)', p.ihale_b != null ? tl(p.ihale_b) : '—') +
      kv('Sözleşme', p.soz_bas ? fd(p.soz_bas) + ' – ' + fd(p.soz_bit) : '—') + kv('Saha teslimi', fd(p.teslim)) + kv('Kira dönem tabanı', fd(p.taban)) + kv('TÜFE kuralı', esc(p.kural || '—')) +
      kv('Artış esası', esc(p.artis || '—')) + kv('Ödeme', esc(p.odeme || '—')) + kv('Gelişim ve yönetim planı', esc((p.plan || '—').slice(0, 60))) + '</section>';
    const tem = '<section class="panel"><h3>Teminat ve bağlı bedeller</h3>' + kv('Yıllık kira (esas)', yk != null ? tl(yk) : '—') + kv('Kesin teminat', p.kesin != null ? tl(p.kesin) : 'Kayıt yok') +
      kv('Güvence', p.guv == null ? 'Sözleşmede yok' : E.pct(p.guv, 0) + ' · ' + tl(r2(yk * p.guv))) + kv('Depozito', p.dep == null ? 'Sözleşmede yok' : E.pct(p.dep, 0) + ' · ' + tl(r2(yk * p.dep))) +
      kv('Ağaçlandırma (Md. 33, %5)', yk != null ? tl(r2(yk * .05)) : '—') + kv('KDV (%20)', yk != null ? tl(r2((yk + r2(yk * .05)) * .2)) : '—') + kv('Devirde kira (Md. 35/3, +%30)', yk != null ? tl(r2(yk * 1.3)) : '—') +
      '<h3>Kira kontrolü</h3>' + kv('Karşılaştırılan dönem başı', fd(kk.bas)) + kv('Uygulanan TÜFE', kk.tufe != null ? E.pct(kk.tufe) + (kk.tufeAy ? ' (' + AY[kk.tufeAy[1] - 1] + ' ' + kk.tufeAy[0] + ')' : '') : (kk.donem === 1 ? 'İlk dönem (ihale bedeli)' : '—')) +
      kv('Tebliğe göre dönem kirası', tl(kk.hesap)) + kv('Muhasebedeki yıllık kira', tl(kk.muh)) +
      '<div class="verd"><span>Sonuç</span><span class="badge ' + (kk.durum === 'Uyumlu' ? 'b-ok' : kk.durum === 'Fark var' ? 'b-no' : 'b-gray') + '">' + kk.durum + (kk.fark && kk.durum === 'Fark var' ? ' · ' + tl(kk.fark) : '') + '</span></div>' +
      (p.kz_not ? '<div class="quote">' + esc(p.kz_not) + '</div>' : '') + '</section>';
    const d = (S.veri.denetim || []).find((x) => x.park === p.kisa);
    const vc = (s) => /^Uyulmamakta|^Yok/.test(s) ? 'b-no' : (/^Uyulmakta|^Var/.test(s) ? 'b-ok' : 'b-gray');
    const sh = (s) => (s || '').split(' (')[0];
    const sonDon = d ? (E.month(R) > 6 && /1\. dönem/.test(d.donem) && E.year(d.tarih) === y ? y + ' / 2. dönem (Temmuz–Aralık)' : '—') : '—';
    const den = '<section class="panel"><h3>Son denetim' + (d ? ' · ' + fd(d.tarih) : '') + '</h3>' + (d ? '<div class="verd"><span>Ödeme planına uyum</span><span class="badge ' + vc(d['Ödeme planına uyum']) + '">' + esc(sh(d['Ödeme planına uyum'])) + '</span></div>' +
      '<div class="verd"><span>Şartname ve sözleşme</span><span class="badge ' + vc(d['Şartname ve sözleşmeye uyum']) + '">' + esc(sh(d['Şartname ve sözleşmeye uyum'])) + '</span></div>' +
      '<div class="quote">' + esc(d.ozet || d['Genel kanaat']) + '</div>' + kv('Sonraki denetim', sonDon) +
      '<div style="padding:10px 0 4px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-a="formAc" data-e="R10" data-k="' + esc(p.kisa) + '">İmzalı Ek-10 raporu</button><button class="btn" data-a="formAc" data-e="Ek-10" data-k="' + esc(p.kisa) + '">Yeni dönem Ek-10</button></div>' : '<div class="empty">Bu park için denetim kaydı yok.</div>') +
      (p.notlar ? '<h3>Notlar</h3><div class="quote" style="margin-bottom:8px">' + esc(p.notlar) + '</div>' : '') + '</section>';
    const rows = A.map((a) => '<tr>' + td('<span class="' + (a.duz ? 'duz' : '') + '" title="' + esc(a.vnot) + '">' + fd(a.esas) + '</span>', '', 'lead n') + td(esc(a.grup), 'Grup', 'muted') + td(esc(a.tur), 'Tür') +
      td('<b>' + tl(a.tutar) + '</b>', 'Tutar', 'n r') + td(a.odeme ? fd(a.odeme) : '–', 'Ödeme', 'n muted') + td('<span class="badge ' + (badgeDurum[a.durum] || 'b-gray') + '">' + a.durum + '</span>', 'Durum') +
      td(a.gun ? a.gun : '–', 'Gün', 'n r') + td(a.gztop ? tl(a.gztop) : '–', 'GZ ve KDV’si', 'n r ' + (a.durum === 'Ödenmedi' ? 'red-t' : 'muted')) +
      td('<button class="btn sm own-only" data-a="tahsilat" data-kalem="' + a.kalem + '">' + (a.odeme ? 'Ödeme' : 'Tahsilat ekle') + '</button>', '', 'noprint') + '</tr>').join('');
    S.csv = { name: 'park_' + p.kisa, head: ['Esas vade', 'Muhasebe vadesi', 'Grup', 'Tür', 'Tutar', 'Ödeme', 'Durum', 'Gün', 'GZ', 'GZ KDV', 'Açıklama', 'Kaynak'],
      rows: A.map((a) => [fd(a.esas), fd(a.vade), a.grup, a.tur, a.tutar, a.odeme ? fd(a.odeme) : '', a.durum, a.gun, a.gz, a.gzkdv, a.aciklama, a.kaynak]) };
    const alT = '<section class="card"><div class="ch"><h2>Alacak kalemleri</h2><span class="muted" style="font-size:13px">Gecikme zammı rapor tarihine kadar; ödenmiş kalemlerde ödeme gününe kadar</span>' +
      '<button class="btn sm own-only" data-a="tahakkuk" data-k="' + esc(p.kisa) + '">Yeni tahakkuk ekle</button></div>' +
      (A.length ? '<div class="scroll"><table class="rt" style="min-width:960px"><thead><tr><th>Esas vade</th><th>Grup</th><th>Tür</th><th class="r">Tutar</th><th>Ödeme</th><th>Durum</th><th class="r">Gün</th><th class="r">GZ ve KDV’si</th><th class="noprint"></th></tr></thead><tbody>' + rows +
        '<tr style="font-weight:600">' + td('Toplam', '', 'lead') + '<td colspan="2"></td>' + td(tl(sumOf(A, (a) => a.tutar)), 'Tutar', 'n r') + '<td colspan="3"></td>' + td(tl(sumOf(A.filter((a) => !a.odeme), (a) => a.gztop)), 'GZ (açık)', 'n r') + '<td></td></tr></tbody></table></div>'
        : '<div class="empty">Muhasebe dökümünde bu parka ait kalem yok' + (p.vkn_muh ? '' : ' (muhasebe VKN’si tanımlı değil)') + '.</div>') + '</section>';
    const pY = (Y) => { const t = (S.plan[Y] || {})[p.kisa]; if (!t || t.kod === 'eksik' || t.kod === 'disi') return '';
      return '<div class="plnb"><div class="t"><b>' + Y + '</b><span class="badge ' + ({ tamam: 'b-ok', oto: 'b-ok', fark: 'b-amb', bekliyor: 'b-no', tufe: 'b-amb' }[t.kod] || 'b-gray') + '">' + esc(t.durum) + '</span></div>' +
        (t.kira != null ? '<div class="big2 n">' + tl(t.kira) + ' TL</div><div class="muted" style="font-size:13px">' + t.donem + '. dönem · ' + fd(t.bas) + (t.tufe != null ? ' · TÜFE ' + E.pct(t.tufe) : '') + '</div>' +
          '<div class="muted n" style="font-size:13px;margin-top:6px">' + t.vadeler.map((v) => fd(v.vade).slice(0, 5) + ' ' + tl(v.kira)).join(' · ') + '<br>Ağaçlandırma ' + tl(t.agac) + ' · KDV ' + tl(t.kdv) + '</div>' +
          (t.kod === 'fark' ? '<div class="red-t" style="font-size:13px;margin-top:4px">Muhasebe ' + tl(t.muhKira) + ' · fark ' + tl(t.fark) + '</div>' : '')
          : '<div class="muted" style="font-size:13.5px;margin-top:6px">' + (t.yayim ? AY[t.tufeAy[1] - 1] + ' ' + t.tufeAy[0] + ' TÜFE’si ' + fd(t.yayim) + '’te açıklanınca otomatik hesaplanır.' : esc(t.durum)) + '</div>') +
        '<div style="margin-top:8px"><button class="btn sm" data-a="tAyrP" data-k="' + esc(p.kisa) + '" data-y="' + Y + '">Hesabı göster</button>' + ((t.kod === 'bekliyor' || t.kod === 'plan') ? ' <button class="btn sm pri own-only" data-a="tEtP" data-k="' + esc(p.kisa) + '" data-y="' + Y + '">Tahakkuk et</button>' : '') + '</div></div>'; };
    const plH = pY(y) + pY(y + 1);
    const planK = plH ? '<section class="card"><div class="ch"><h2>Yıllık kira ve tahakkuk</h2><span class="muted" style="font-size:13px">Md. 31–33, 10/2 · ' + esc(p.artis || '') + ' · ' + esc(p.kural || '') + '</span></div><div class="plns">' + plH + '</div></section>' : '';
    const T = TAKVIM(p);
    const tkK = '<section class="card"><div class="ch"><h2>Süreler ve yükümlülükler</h2><span class="muted" style="font-size:13px">' + fd(R) + ' tarihine göre</span></div><div class="scroll"><table class="rt"><thead><tr><th>Dayanak</th><th>İş</th><th>Durum</th><th>Ayrıntı</th></tr></thead><tbody>' +
      T.map((x) => '<tr>' + td(esc(x.md), '', 'lead muted') + td('<b>' + esc(x.ad) + '</b>', 'İş', 'wide', ' style="white-space:normal"') + td('<span class="badge ' + x.c + '">' + esc(x.s) + '</span>', 'Durum') + td(esc(x.d), 'Ayrıntı', 'wide n', ' style="white-space:normal;font-size:13.5px;color:var(--ink2)"') + '</tr>').join('') + '</tbody></table></div></section>';
    return mpick() + head + alert + inst + planK + '<div class="cols">' + soz + tem + den + '</div>' + tkK + alT;
  };
  AKSIYON.ek10 = (t) => {
    const d = (S.veri.denetim || []).find((x) => x.park === t.dataset.k); if (!d) return;
    const keys = S.veri.den_keys || Object.keys(d).filter((k) => !['park', 'donem', 'tarih', 'imza', 'ozet'].includes(k));
    modal('Ek-10 Denetim Raporu · ' + d.park, '<p class="muted" style="margin:0">' + esc(d.donem) + ' · rapor tarihi ' + fd(d.tarih) + '</p>' +
      keys.map((k) => '<div class="kv" style="display:block"><span style="display:block;font-size:13px">' + esc(k) + '</span><span style="display:block;text-align:left;font-weight:500;margin-top:3px;white-space:pre-wrap">' + esc(d[k] || '—') + '</span></div>').join('') +
      '<div class="kv" style="display:block"><span style="display:block;font-size:13px">Komisyon</span><span style="display:block;text-align:left;font-weight:500;margin-top:3px">' + esc(d.imza || '—') + '</span></div>' +
      '<div class="own-only"><button class="btn" data-a="denDuzenle" data-k="' + esc(d.park) + '">Bu raporu düzenle</button></div>',
      '<button class="btn" data-a="teblig" data-pg="61">Tebliğdeki Ek-10 formu</button><button class="btn pri" data-a="pdf">Yazdır / PDF</button>');
  };

  // ---------- ALACAKLAR ----------
  SAYFA.alacaklar = function () {
    const R = S.rapor, al = S.al, open = al.filter((a) => a.durum === 'Ödenmedi');
    const acik = sumOf(al, (a) => a.acik), vg = sumOf(open, (a) => a.acik), gz = sumOf(open, (a) => a.gztop), d30 = E.addDays(R, 30);
    const y30 = al.filter((a) => a.acik > 0 && a.esas && a.esas >= R && a.esas <= d30);
    const kp = [['Açık alacak', tl(acik), al.filter((a) => a.acik > 0).length + ' kalem, 120.99 + 127', 'var(--ink)'], ['Vadesi geçmiş', tl(vg), S.oz.filter((o) => o.vgec > 0).length + ' parkta, ' + open.length + ' kalem', 'var(--red)'],
      ['Gecikme zammı ve KDV’si', tl(gz), 'Açık kalemler, ' + fd(R) + ' tarihine', 'var(--ambt)'], ['30 gün içinde vadesi gelecek', tl(sumOf(y30, (a) => a.acik)), y30.length + ' kalem · ' + fd(R) + ' – ' + fd(d30), 'var(--ink)']];
    const B = [['0–30 gün', 0, 30, '#E7B65A'], ['31–90 gün', 31, 90, '#DDA034'], ['91–180 gün', 91, 180, '#D9774A'], ['181–365 gün', 181, 365, '#C2412D'], ['365 günden fazla', 366, 1e9, '#8E2A1C']];
    const ag = B.map((b) => { const v = sumOf(open.filter((a) => a.gun >= b[1] && a.gun <= b[2]), (a) => a.tutar); return { l: b[0], c: b[3], v, w: vg ? Math.round(v / vg * 1000) / 10 : 0 }; });
    const rows = S.esl.rows, bal = (k) => sumOf(rows.filter((x) => x.kaynak === k), (x) => x.borc - x.alacak), pd = sumOf(rows.filter((x) => x.park === 'Park dışı'), (x) => x.borc - x.alacak);
    const ok = Math.abs(r2(bal('120') + bal('127') - pd) - acik) < 0.02;
    const flt = { acik: (a) => a.durum === 'Ödenmedi' || a.durum === 'Vadesi gelmedi' || a.durum === 'Vade yok', odenmedi: (a) => a.durum === 'Ödenmedi', gec: (a) => a.durum === 'Geç ödendi', tum: () => true };
    const L = al.filter(flt[S.af]).filter((a) => S.ap === 'Tüm parklar' || a.park === S.ap);
    const parks = ['Tüm parklar'].concat(Array.from(new Set(al.map((a) => a.park))));
    S.csv = { name: 'alacaklar', head: ['Park', 'Esas vade', 'Muhasebe vadesi', 'Grup', 'Tür', 'Tutar', 'Ödeme', 'Durum', 'Gün', 'GZ', 'GZ KDV', 'Açık', 'Açıklama', 'Kaynak', 'Vade notu'],
      rows: L.map((a) => [a.park, fd(a.esas), fd(a.vade), a.grup, a.tur, a.tutar, a.odeme ? fd(a.odeme) : '', a.durum, a.gun, a.gz, a.gzkdv, a.acik, a.aciklama, a.kaynak, a.vnot]) };
    return banners() + '<div class="pagehead"><div><h1>Alacaklar</h1><p>Muhasebe dökümündeki her tahakkuk ve ödemesi; gecikme zammı ' + fd(R) + ' tarihine göre (Tebliğ Md. 39/1 → 6183 s.K. m.51).</p></div></div>' +
      '<section class="kpis">' + kp.map((k) => '<div class="kpi"><span>' + k[0] + '</span><strong class="n" style="color:' + k[3] + '">' + k[1] + '</strong><em>' + k[2] + '</em></div>').join('') + '</section>' +
      '<div class="age"><section class="card"><div class="ch"><h2>Vadesi geçmiş alacağın yaşı</h2><span class="muted" style="font-size:13px">Ödenmemiş kalemler, gün olarak</span></div><div class="aging">' +
      '<div class="stack">' + ag.map((a) => '<i style="width:' + a.w + '%;background:' + a.c + '"></i>').join('') + '</div>' +
      ag.map((a) => '<div class="ab"><span>' + a.l + '</span><span class="tr"><i style="width:' + a.w + '%;background:' + a.c + '"></i></span><span class="n" style="text-align:right;font-weight:600">' + tl(a.v) + '</span></div>').join('') +
      '<p class="muted" style="margin:10px 0 0;font-size:13.5px">365 günü aşan kalemler Md. 39/2 fesih eşiğine (iki yıl) yaklaşan alacaklardır.</p></div></section>' +
      '<section class="card"><div class="ch"><h2>Muhasebe ile sağlama</h2></div><div class="rec"><div class="ln"><span>120.99 bakiyesi</span><span>' + tl(bal('120')) + '</span></div><div class="ln"><span>127 bakiyesi</span><span>' + tl(bal('127')) + '</span></div>' +
      '<div class="ln"><span>Park dışı kayıtlar (şahıs)</span><span>− ' + tl(pd) + '</span></div><div class="eq"><span>Parkların açık alacağı</span><span class="n">' + tl(r2(bal('120') + bal('127') - pd)) + '</span></div>' +
      (ok ? '<div class="ok-note">' + svg('M5 12l4 4 10-10', 18, 2) + 'Alacak kalemleri dökümle kuruşu kuruşuna tutuyor.</div>' : '<div class="alert red" style="margin-top:12px">Döküm ile alacak kalemleri arasında fark var; Muhasebe sayfasını kontrol edin.</div>') + '</div></section></div>' +
      '<section class="card"><div class="ch" style="gap:12px"><h2>Alacak kalemleri</h2><div class="filters"><div class="seg">' +
      [['acik', 'Açık'], ['odenmedi', 'Ödenmedi'], ['gec', 'Geç ödendi'], ['tum', 'Tümü']].map((s) => '<button class="' + (S.af === s[0] ? 'on' : '') + '" data-a="af" data-v="' + s[0] + '">' + s[1] + '</button>').join('') + '</div>' +
      '<select id="aPark" aria-label="Park süz">' + parks.map((k) => '<option' + (k === S.ap ? ' selected' : '') + '>' + esc(k) + '</option>').join('') + '</select></div></div>' +
      '<div class="scroll"><table class="rt" style="min-width:1040px"><thead><tr><th>Park</th><th>Esas vade</th><th>Grup</th><th>Tür</th><th class="r">Tutar</th><th>Ödeme</th><th>Durum</th><th class="r">Gün</th><th class="r">GZ ve KDV’si</th><th class="noprint"></th></tr></thead><tbody>' +
      L.map((a) => '<tr>' + td('<a href="#/park" data-a="park" data-k="' + esc(a.park) + '" data-go="park" style="font-weight:600">' + esc(a.park) + '</a>', '', 'lead') +
        td('<span class="' + (a.duz ? 'duz' : '') + '" title="' + esc(a.vnot) + '">' + fd(a.esas) + '</span>', 'Esas vade', 'n') + td(esc(a.grup), 'Grup', 'muted') + td(esc(a.tur), 'Tür') + td('<b>' + tl(a.tutar) + '</b>', 'Tutar', 'n r') +
        td(a.odeme ? fd(a.odeme) : '–', 'Ödeme', 'n muted') + td('<span class="badge ' + (badgeDurum[a.durum] || 'b-gray') + '">' + a.durum + '</span>', 'Durum') + td(a.gun || '–', 'Gün', 'n r') +
        td(a.gztop ? tl(a.gztop) : '–', 'GZ ve KDV’si', 'n r ' + (a.durum === 'Ödenmedi' ? 'red-t' : 'muted')) + td('<button class="btn sm" data-a="kalemBilgi" data-kalem="' + a.kalem + '" data-odeme="' + (a.odeme || '') + '">Ayrıntı</button>', '', 'noprint') + '</tr>').join('') +
      '<tr style="font-weight:600">' + td(L.length + ' kalem', '', 'lead') + '<td colspan="3"></td>' + td(tl(sumOf(L, (a) => a.tutar)), 'Tutar', 'n r') + '<td colspan="3"></td>' + td(tl(sumOf(L.filter((a) => !a.odeme), (a) => a.gztop)), 'GZ (açık)', 'n r') + '<td></td></tr>' +
      '</tbody></table>' + (L.length ? '' : '<div class="empty">Bu süzgeçte kalem yok.</div>') +
      '<p class="muted" style="margin:10px 6px 0;font-size:13.5px"><span class="duz">Sarı zeminli vade</span> resmî yazıya göre düzeltilmiş esas vadedir; üzerine gelince kaynağı görünür.</p></div></section>';
  };
  AFTER.alacaklar = () => { const s = $('#aPark'); if (s) s.onchange = (e) => { S.ap = e.target.value; sayfaCiz(); }; };
  AKSIYON.af = (t) => { S.af = t.dataset.v; sayfaCiz(); };
  AKSIYON.kalemBilgi = (t) => {
    const k = +t.dataset.kalem, it = S.esl.items.find((x) => x.id === k); if (!it) return;
    const a = S.al.find((x) => x.kalem === k && (x.odeme || '') === t.dataset.odeme) || S.al.find((x) => x.kalem === k);
    const dil = a && a.esas ? E.gzDilimler(a.esas, a.odeme || S.rapor, S.gzO) : [];
    modal('Alacak kalemi · ' + it.park, '<div class="kv"><span>Grup / tür</span><span>' + esc(it.grup) + ' · ' + esc(it.tur) + '</span></div><div class="kv"><span>Kalem tutarı</span><span class="n">' + tl(it.tutar) + '</span></div>' +
      '<div class="kv"><span>Muhasebe vadesi</span><span>' + fd(it.vade) + '</span></div><div class="kv"><span>Esas vade</span><span>' + fd(it.duz || it.vade) + '</span></div>' +
      (it.vnot ? '<div class="quote">' + esc(it.vnot) + '</div>' : '') + '<div class="kv"><span>Açıklama</span><span>' + esc(it.aciklama) + '</span></div><div class="kv"><span>Kaynak kayıt</span><span>yev. ' + it.yev + ' (' + esc(it.hesap) + ') · ' + fd(it.olusma) + '</span></div>' +
      '<div class="kv"><span>Ödemeler</span><span>' + (it.odemeler.length ? it.odemeler.map((o) => fd(o.tarih) + ' yev. ' + o.yev + ' · ' + tl(o.tutar)).join('<br>') : 'Yok') + '</span></div>' +
      (dil.length ? '<div class="sl"><table><thead><tr><th>Dilim</th><th class="r">Oran</th><th class="r">Ay</th><th class="r">Gün</th><th class="r">GZ</th></tr></thead><tbody>' + dil.map((d) => '<tr><td class="n">' + fd(d.bas) + ' – ' + fd(d.bit) + '</td><td class="r">' + E.pct(d.oran, 1) + '</td><td class="r">' + d.ay + '</td><td class="r">' + d.gun + '</td><td class="r n">' + tl(r2(a.tutar * d.faktor)) + '</td></tr>').join('') +
        '</tbody></table></div><div class="kv"><span>Gecikme zammı · KDV’si</span><span class="n">' + tl(a.gz) + ' · ' + tl(a.gzkdv) + '</span></div><p class="muted" style="margin:0;font-size:13px">Her dilimde tutar × aylık oran × (tam ay + gün ÷ 30). KDV yalnız kira kalemlerinin gecikme zammına uygulanır.</p>' : ''),
      '<button class="btn own-only" data-a="tahsilat" data-kalem="' + k + '">Tahsilat ekle</button><button class="btn own-only" data-a="vadeDuz" data-kalem="' + k + '">Vadeyi düzelt</button><button class="btn pri" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Kapat</button>');
  };

  // ---------- HESAPLAMA ----------
  const HS0 = () => ({ gt: 100000, gv: E.addMonths(S.rapor, -3), ge: S.rapor, gk: 'Kira', ek: 1000000, et: 9, em: 0, eo: S.rapor, it: 1000000, io: 10, ih: 1000000, is: 10,
    dk: 1000000, dt: '0', fk: 1000000, fs: 60000, fe: 0 });
  SAYFA.hesap = function () {
    S.hesapS = S.hesapS || HS0(); const H = S.hesapS;
    const tools = [['g', 'Gecikme zammı', 'Md. 39 · 6183 s.K. m.51', IC.clock], ['e', 'Ek yapı ve tesis kirası', 'Md. 30 · kıst, teminat', IC.build], ['i', 'İhale ve sözleşme bedelleri', 'Md. 8–10, 31, 33', IC.doc],
      ['d', 'Sözleşme devri', 'Md. 35 · %30 artış', IC.swap], ['f', 'Fesih hâlinde', 'Md. 39/2, 40', IC.x]];
    const inp = (id, lab, v, type, extra) => '<div class="fl"><label for="h_' + id + '">' + lab + '</label><input id="h_' + id + '" data-h="' + id + '" type="' + (type || 'number') + '" step="0.01" value="' + esc(v) + '"' + (extra || '') + '></div>';
    const out = (a, b) => '<div class="out"><span>' + a + '</span><span>' + b + '</span></div>';
    let body = '';
    if (S.tool === 'g') {
      const dil = E.gzDilimler(H.gv, H.ge, S.gzO), gz = r2(H.gt * dil.reduce((s, d) => s + d.faktor, 0)), kdv = H.gk === 'Kira' ? r2(gz * S.oran.gz_kdv) : 0;
      body = calc('Gecikme zammı', 'Tebliğ Md. 39/1 · 6183 s.K. m.51', inp('gt', 'Anapara (TL)', H.gt) + inp('gv', 'Vade tarihi', H.gv, 'date') + inp('ge', 'Ödeme ya da hesap tarihi', H.ge, 'date') +
        '<div class="fl"><label for="h_gk">Kalem türü</label><select id="h_gk" data-h="gk"><option value="Kira"' + (H.gk === 'Kira' ? ' selected' : '') + '>Kira (GZ’ye %20 KDV)</option><option value="Diğer"' + (H.gk !== 'Kira' ? ' selected' : '') + '>KDV, ağaçlandırma, vergi/fon</option></select></div>' +
        '<p class="note" style="margin:0">Kesin teminat, güvence ve depozitoya gecikme zammı uygulanmaz (Md. 9–10).</p>',
        out('Gecikme süresi', Math.max(0, E.days(H.gv, H.ge)) + ' gün') + out('Gecikme zammı', tl(gz)) + out('KDV’si', tl(kdv)) + '<div class="tot"><span>Toplam gecikme</span><b>' + tl(r2(gz + kdv)) + '</b></div>' +
        (dil.length ? '<div class="sl"><table><thead><tr><th>Dilim</th><th class="r">Oran</th><th class="r">Tam ay</th><th class="r">Gün</th><th class="r">Tutar</th></tr></thead><tbody>' +
          dil.map((d) => '<tr><td class="n">' + fd(d.bas) + ' – ' + fd(d.bit) + '</td><td class="r">' + E.pct(d.oran, 1) + '</td><td class="r">' + d.ay + '</td><td class="r">' + d.gun + '</td><td class="r n">' + tl(r2(H.gt * d.faktor)) + '</td></tr>').join('') + '</tbody></table></div>' : '') +
        '<p class="note">Süre oran değişikliği tarihinde bölünür; her dilimde aylık oran × (tam ay + gün ÷ 30). Hesap yöntemi Müdürlüğün 27.09.2026 tarihli borç çalışmasındaki tutarlarla kuruşu kuruşuna karşılaştırılarak doğrulandı.Güncel oran: aylık ' + E.pct(gzSon()[1], 1) + ' (' + fd(gzSon()[0]) + ').</p>');
    } else if (S.tool === 'e') {
      const k = E.KATSAYI[H.et] || E.KATSAYI[0], r = E.ekTesis(H.ek, k[1], H.em, H.eo);
      body = calc('Ek yapı ve tesis kirası', 'Md. 30/1–2, Md. 9/2, Md. 33', inp('ek', 'Cari yıl kira bedeli', H.ek) +
        '<div class="fl"><label for="h_et">Tesis türü ve katsayısı</label><select id="h_et" data-h="et">' + E.KATSAYI.map((x, i) => '<option value="' + i + '"' + (i === +H.et ? ' selected' : '') + '>' + esc(x[0]) + ' (' + x[1].toLocaleString('tr-TR') + ')</option>').join('') + '</select></div>' +
        inp('em', 'Onay yılı maliyeti (birim fiyat × alan)', H.em) + inp('eo', 'Revize plan onay tarihi', H.eo, 'date'),
        out('Katsayı bedeli', tl(r.kb)) + out('Maliyetin %2’si', tl(r.m2)) + out('Yıllık ek kira (yüksek olan)', tl(r.ek)) + out('Kıst (' + r.gun + ' gün ÷ 365)', tl(r.kist)) + out('Ağaçlandırma, kıst üzerinden %5', tl(r.agac)) +
        out('KDV, kıst + ağaçlandırma üzerinden %20', tl(r.kdv)) + out('Ek kesin teminat, yıllık ek kiranın %6’sı', tl(r.tem)) + '<div class="tot"><span>Bu yıl tahsil edilecek</span><b>' + tl(r.top) + '</b></div>' + out('Gelecek dönem kira tabanı', tl(r.taban)) +
        '<p class="note">Md. 30/1’e göre yıllık ek kira cari yıl kirasına eklenir ve izleyen yıllar bu toplam üzerinden hesaplanır. Bölge onay yazılarında cari yıl için onay tarihinden yıl sonuna kadar kıst (gün ÷ 365) tahsil edilmektedir; tam yıl tutarı da yukarıda gösterilir. Tahsil zamanı: onayı izleyen ilk taksitle; son taksit geçmişse onay ayı sonuna kadar peşin (Md. 30/2).</p>');
    } else if (S.tool === 'i') {
      const r = E.ihale(H.it, H.io, H.ih, H.is);
      body = calc('İhale ve sözleşme bedelleri', 'Md. 8, 9, 10, 31, 33', inp('it', 'Tahmin edilen yıllık bedel', H.it) + inp('io', 'Geçici teminat oranı (%10–30)', H.io) + inp('ih', 'İhale bedeli (teklif)', H.ih) + inp('is', 'Kira süresi (yıl)', H.is),
        out('Geçici teminat', r.gec == null ? 'Oran %10–30 arasında olmalı' : tl(r.gec)) + out('Kesin teminat (%6)', tl(r.kes)) + out('Güvence (%25)', tl(r.guv)) + out('Depozito (%10)', tl(r.dep)) +
        out('İlk yıl ağaçlandırma (%5)', tl(r.agac)) + out('İlk yıl KDV (%20)', tl(r.kdv)) + out('İlk yıl ödeme şekli', r.od) + '<div class="tot"><span>Sözleşme bedeli</span><b>' + tl(r.soz) + '</b></div>' +
        '<p class="note">Güvence ve depozito oranları sözleşmeye göre değişebilir (eski sözleşmelerde %30 / %20).</p>');
    } else if (S.tool === 'd') {
      const r = E.devir(H.dk, H.dt);
      body = calc('Sözleşme devri', 'Md. 35/3–6, 35/9', inp('dk', 'O yılın kira bedeli', H.dk) +
        '<div class="fl"><label for="h_dt">Devir türü</label><select id="h_dt" data-h="dt"><option value="0"' + (H.dt === '0' ? ' selected' : '') + '>Genel devir (%30 artış)</option><option value="1"' + (H.dt === '1' ? ' selected' : '') + '>Unvan, tür, %51 hisse (artış yok)</option><option value="2"' + (H.dt === '2' ? ' selected' : '') + '>Ölüm, miras (artış yok)</option></select></div>',
        out('Artış', tl(r.art)) + out('Artışın ağaçlandırması (%5)', tl(r.ag)) + out('Artışın KDV’si (%20)', tl(r.kdv)) + '<div class="tot"><span>Yeni yıllık kira</span><b>' + tl(r.yeni) + '</b></div>' +
        '<p class="note">Kapalı teklifle ihale edilen parklarda, GM izniyle; devir tarihinde borç olmamalı. Sözleşmeden itibaren üç yıl dolmadan ve son altı ayda devredilemez (Md. 35/1–4).</p>');
    } else {
      const r = E.fesih(H.fk, H.fs, H.fe);
      body = calc('Fesih hâlinde', 'Md. 39/2, 40/2–3', inp('fk', 'Cari yıl kira bedeli', H.fk) + inp('fs', 'Kesin teminat', H.fs) + inp('fe', 'Ek kesin teminat (ek tesis, Md. 9/2)', H.fe),
        out('Gelir kaydedilecek teminatlar', tl(r.kesO)) + out('Tazminat, cari yıl kirası', tl(r.taz)) + '<div class="tot"><span>İdareye geçecek toplam</span><b>' + tl(r.top) + '</b></div>' +
        '<p class="note">Vadesi üzerinden iki yıl geçmiş ödenmemiş kira varsa fesih hakkı doğar (Md. 39/2). Ödenmemiş kira ve gecikme zammı ayrıca takip edilir.</p>');
    }
    return '<div class="pagehead"><div><h1>Hesaplama</h1><p>Sarı alanlara yazdıkça sonuç hesaplanır; bu sayfadaki girişler kayıtlara işlenmez. Oranlar Veriler sayfasındaki resmî değerlerdir.</p></div></div>' +
      '<div class="tools"><nav class="tlist">' + tools.map((t) => '<button class="' + (S.tool === t[0] ? 'on' : '') + '" data-a="tool" data-v="' + t[0] + '"><span class="ti" style="color:#2F6B45">' + svg(t[3]) + '</span><span><b>' + t[1] + '</b><small>' + t[2] + '</small></span></button>').join('') +
      '<button data-a="hsifir" style="margin-top:6px"><span class="ti">↺</span><span><b>Örnek değerlere dön</b><small>Girişleri sıfırla</small></span></button></nav>' + body + '</div>';
  };
  function calc(t, s, inp, res) { return '<section class="calc"><div class="hd"><h2>' + t + '</h2><span>' + s + '</span></div><div class="bd"><div class="cin">' + inp + '</div><div class="res">' + res + '</div></div></section>'; }
  AKSIYON.tool = (t) => { S.tool = t.dataset.v; sayfaCiz(); };
  AKSIYON.hsifir = () => { S.hesapS = HS0(); sayfaCiz(); };
  AFTER.hesap = () => {
    $$('[data-h]').forEach((el) => el.addEventListener('change', (e) => {
      const k = e.target.dataset.h, v = e.target.value;
      S.hesapS[k] = (e.target.type === 'number') ? (parseFloat(v) || 0) : (k === 'et' ? +v : v);
      const id = e.target.id; sayfaCiz(); const n = document.getElementById(id); if (n) n.focus();
    }));
  };

  // ---------- DENETİM ----------
  SAYFA.denetim = function () {
    const D = S.veri.denetim || [], sh = (s) => (s || '').split(' (')[0];
    const cls = (s) => /^Uyulmamakta|^Yok|Bakımsız|Yapılmıyor/.test(s) ? 'v-no' : (/^Var|^Uyulmakta|^Bakımlı|^Yapılıyor/.test(s) ? 'v-ok' : 'v-mid');
    const C = ['Ödeme planına uyum', 'Onaylı plan', 'Tesislerin bakım durumu', 'Saha bakım ve temizlik', 'Şartname ve sözleşmeye uyum'];
    const cnt = (k, re) => D.filter((d) => re.test(d[k] || '')).length;
    const sm = [[D.length, 'park denetlendi', 'var(--ink)'], [cnt(C[0], /^Uyulmamakta/), 'parkta ödeme planına uyulmuyor', 'var(--red)'], [cnt(C[4], /^Uyulmamakta/), 'parkta şartname veya sözleşmeye aykırılık', 'var(--red)'],
      [cnt(C[1], /^Yok/), 'parkta onaylı plan yok', 'var(--ambt)'], [cnt(C[2], /^Bakımsız/), 'parkta tesisler bakımsız', 'var(--ambt)']];
    const son = D.map((d) => d.tarih).sort().slice(-1)[0];
    const plans = (S.veri.plan || []).map((pl) => { const r = revizeTahakkuk(pl);
      return '<div class="plan"><div class="t"><div><b>' + esc(pl.park) + '</b><small>' + esc(pl.revize) + ' · ' + esc((pl.sayi || '').split('-').slice(-1)[0]) + '</small></div><span class="v ' + (r.var ? 'v-ok' : 'v-no') + '">' + (r.var ? 'Tahakkuk edildi' : 'Tahakkuk bekleniyor') + '</span></div>' +
        '<div class="big2 n">' + tl(pl.ek) + ' TL</div><div class="muted" style="font-size:13px">yıllık ek kira · onay ' + fd(pl.onay) + '</div><div style="margin-top:12px">' +
        '<div class="kv"><span>Kıst (' + r.gun + ' gün)</span><span class="n">' + tl(r.kist) + '</span></div><div class="kv"><span>Ağaçlandırma %5</span><span class="n">' + tl(r.agac) + '</span></div><div class="kv"><span>KDV %20</span><span class="n">' + tl(r.kdv) + '</span></div>' +
        '<div class="kv"><span>Ek kesin teminat %6</span><span class="n">' + tl(r2(pl.ek * .06)) + '</span></div></div><p class="muted" style="font-size:13px;margin:10px 0 0;line-height:1.45">' + esc(pl.aciklama) + '</p></div>'; }).join('');
    S.csv = { name: 'denetim', head: ['Park', 'Dönem', 'Tarih'].concat(C).concat(['Genel kanaat']), rows: D.map((d) => [d.park, d.donem, fd(d.tarih)].concat(C.map((k) => d[k])).concat([d['Genel kanaat']])) };
    const tk = (S.veri.takip || []).slice().sort((a, b) => ((b.tarih || '') > (a.tarih || '') ? 1 : -1));
    return '<div class="pagehead"><div><h1>Denetim ve planlar</h1><p>' + (son ? E.year(son) + ' yılı ' + (D[0] ? esc(D[0].donem.split(' (')[0].split('/ ')[1] || '') : '') + ' Ek-10 denetim raporları ' + fd(son) + '’da imzalandı. ' : '') + 'Komisyon yılda iki kez denetler (Md. 42/3); temizlik ve bakım her ay denetlenir (Md. 42/7).</p></div></div>' +
      '<section class="sumrow">' + sm.map((s) => '<div class="sm"><b class="n" style="color:' + s[2] + '">' + s[0] + '</b><span>' + s[1] + '</span></div>').join('') + '</section>' +
      '<section class="card"><div class="ch"><h2>' + (D[0] ? esc(D[0].donem.split(' (')[0]) : 'Denetim') + ' sonuçları</h2><span class="muted" style="font-size:13px">Kaynak: imzalı Ek-10 raporları</span></div><div class="scroll"><table class="rt" style="min-width:1040px"><thead><tr><th>Park</th>' +
      ['Ödeme planı', 'Onaylı plan', 'Tesis bakımı', 'Saha temizliği', 'Şartname ve sözleşme'].map((h) => '<th style="text-align:center">' + h + '</th>').join('') + '<th>Komisyonun kanaati</th><th class="noprint"></th></tr></thead><tbody>' +
      D.map((d) => '<tr>' + td('<a href="#/park" data-a="park" data-k="' + esc(d.park) + '" data-go="park" style="font-weight:600">' + esc(d.park) + '</a>', '', 'lead') +
        ['Ödeme planı', 'Onaylı plan', 'Tesis bakımı', 'Saha temizliği', 'Şartname ve sözleşme'].map((h, i) => td('<span class="v ' + cls(d[C[i]]) + '">' + esc(sh(d[C[i]])) + '</span>', h, '', ' style="text-align:center"')).join('') +
        td(esc(d.ozet || d['Genel kanaat']), 'Kanaat', 'wide', ' style="white-space:normal;font-size:13.5px;color:var(--ink2);max-width:380px"') +
        td('<button class="btn sm" data-a="formAc" data-e="R10" data-k="' + esc(d.park) + '">Raporu aç</button>', '', 'noprint') + '</tr>').join('') + '</tbody></table></div></section>' +
      '<section class="card"><div class="ch"><h2>Revize planlar ve ek tesis kirası</h2><span class="muted" style="font-size:13px">Kıst = yıllık ek kira × gün ÷ 365 (Bölge uygulaması) · Md. 30/1–2</span></div><div class="plans">' + plans + '</div></section>' +
      '<section class="card"><div class="ch"><h2>Tespit yazışmaları</h2></div><div class="tline">' + tk.map((y) => { const c = y.yon === 'Giden' ? '#1F5E43' : '#8A5A0B';
        return '<div class="ev"><div class="dt n">' + fd(y.tarih) + '</div><div class="dot" style="background:' + c + '"></div><div><b>' + esc(y.park) + '</b> <span class="v" style="background:#EEF2EE;color:' + c + ';margin-left:6px">' + esc(y.yon) + '</span><p><b style="font-size:14px">' + esc(y.konu) + '</b><br>' + esc(y.ozet) + '<br><span class="muted" style="font-size:12.5px">' + esc(y.sayi) + '</span></p></div></div>'; }).join('') + '</div></section>';
  };

  // ---------- EKLER VE DEFTER ----------
  const EKSAYFA = { 'Ek-1': 41, 'Ek-2': 45, 'Ek-3': 46, 'Ek-4': 47, 'Ek-5': 54, 'Ek-6': 55, 'Ek-7': 57, 'Ek-8': 59, 'Ek-9': 60, 'Ek-10': 61, 'Ek-11': 63, 'Ek-12': 86, 'Ek-13': 87, 'Ek-14': 88, 'Ek-15': 89, 'Ek-16': 90, 'Ek-17': 93, 'Ek-18': 110 };
  function ekVeri() {
    const p = S.pBy[S.park], RT = S.rapor, win = [];
    const pencere = (t, a, b, md, ek) => {
      let s, c;
      if (RT > p.soz_bit) { s = 'Sözleşme sona erdi'; c = 'b-gray'; } else if (RT < a) { s = 'Yapılamaz, açılış ' + fd(a); c = 'b-amb'; } else if (RT > b) { s = 'Yapılamaz, süre sonuna yakın'; c = 'b-no'; } else { s = 'Süre açısından uygun'; c = 'b-ok'; }
      win.push({ t, s, c, d: 'Açık aralık ' + fd(a) + ' – ' + fd(b) + ' · ' + md + (ek ? ' · ' + ek : '') });
    };
    if (p.soz_bas && p.soz_bit) {
      const yil = E.days(p.soz_bas, p.soz_bit) / 365.2425, s20 = E.addMonths(p.soz_bas, 240), ok = p.soz_bit <= s20;
      win.push({ t: 'Sözleşme süresi', s: ok ? (RT > p.soz_bit ? 'Sona erdi' : 'Uygun') : '20 yılı aşıyor', c: ok ? (RT > p.soz_bit ? 'b-no' : 'b-ok') : 'b-no', d: yil.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' yıl · üst sınır 20 yıl, ' + fd(s20) + ' (Md. 36/1–2)' });
      pencere('Statü değişikliği (Ek-7)', E.addMonths(p.soz_bas, 36), E.addMonths(p.soz_bit, -12), 'ilk 3 yıl ve son 1 yıl yapılamaz (Md. 25/3)');
      if (/Kapalı/.test(p.sekil || '')) pencere('Sözleşme devri (Ek-18)', E.addMonths(p.soz_bas, 36), E.addMonths(p.soz_bit, -6), 'ilk 3 yıl ve son 6 ay devredilemez (Md. 35/4)', 'devir tarihinde borç olmamalı (Md. 35/2), o yılın kirası %30 artar (Md. 35/3)');
      else win.push({ t: 'Sözleşme devri (Ek-18)', s: 'Uygulanmaz', c: 'b-gray', d: 'Md. 35/1 devri kapalı teklif usulüyle ihale edilen parklara tanır; bu parkın ihale usulü: ' + (p.sekil || '—').toLocaleLowerCase('tr-TR') });
      if (p.teslim) { const once = p.teslim < p.soz_bas; win.push({ t: 'Saha teslimi (Ek-9)', s: once ? 'Sözleşmeden önce görünüyor' : 'Kayıtlı', c: once ? 'b-amb' : 'b-ok', d: 'Teslim ' + fd(p.teslim) + ' · sözleşmeden sonra en geç 5 iş günü (Md. 27/1)' + (once ? ' · kayıtlı teslim tarihi sözleşme tarihinden (' + fd(p.soz_bas) + ') önce' : '') }); }
    } else win.push({ t: 'Sözleşme', s: 'Kayıtlı sözleşme yok', c: 'b-gray', d: p.durum === 'Davalık' ? 'Dava süreci; süre hesapları yapılmaz.' : 'İhale sonrası sözleşme tarihleri girildiğinde hesaplanır.' });
    const kes6 = p.ihale_b == null ? null : r2(p.ihale_b * .06);
    const ekTem = r2((S.veri.ek_kira || []).filter((e) => e.park === p.kisa).reduce((a, e) => a + e.tutar * 0.06, 0));
    const kesTxt = kes6 == null ? null : '%6 = ' + tl(kes6) + ' ₺' + (p.kesin != null && Math.abs(p.kesin - kes6) > 0.005 ?
      (ekTem && Math.abs(p.kesin - kes6 - ekTem) <= 0.05 ? ' + ek tesis kesin teminatı (Md. 9/2) ' + tl(ekTem) + ' ₺ = kayıtlı ' + tl(p.kesin) + ' ₺' : ' · kayıtlı ' + tl(p.kesin) + ' ₺, fark ' + tl(r2(p.kesin - kes6 - ekTem)) + ' ₺' + (ekTem ? ' (ek tesis teminatı ' + tl(ekTem) + ' ₺ düşüldükten sonra)' : ''))
      : (p.kesin != null ? ' · kayıtla aynı' : ' · kayıt yok'));
    const den = (S.veri.denetim || []).find((d) => d.park === p.kisa);
    const G = (g, gs) => ({ g, gs }), F = (e, ad, kim, sure, md, pv, pc) => ({ e, ad, kim, sure, md, pv, pc });
    const forms = [G('Kuruluş ve planlama', 'parkın ayrılması, bilgi formu, gelişim ve yönetim planı, uygulama projesi'),
      F('Ek-1', 'Orman Parkı Teklif Raporu', 'İşletme müdürlüğü, park olarak ayrılacak saha için.', 'Haritalar, en az 5 fotoğraf ve görüşlerle bölgeye; bölge görüşüyle GM’ye.', 'Md. 5/5–6'),
      F('Ek-2', 'Orman Parkı Bilgi Formu', 'İhaleye çıkılırken tesis, özellik ve kısıtlar için.', 'İhale dokümanına eklenir.', 'Md. 6/2, 18/5', p.alan != null ? p.statu + ' · ' + p.alan.toLocaleString('tr-TR') + ' ha' : null),
      F('Ek-4', 'Gelişim ve Yönetim Planı Teknik Şartnamesi', 'İşletmeci planı bu şartnameye göre yaptırır.', 'Sözleşmeden sonra 3 ay içinde onaya.', 'Md. 18/2, 19/1', p.plan ? p.plan.slice(0, 50) : null),
      F('Ek-5', 'Uygulama Projesi Onay Sayfası', 'Uygulama projesinin onay bölümü.', 'GYP onayından sonra 12 ay içinde proje ve ruhsat başvurusu.', 'Md. 23/3, 23/5'),
      G('İhale', 'tahmin edilen bedel, ilan, şartname, teklif ve teminat'),
      F('Ek-3', 'Kira Bedeli Tespit Tutanağı', 'Bedel tespit komisyonu, ihaleden önce.', 'Bölge uygunluk oluruyla ihale.', 'Md. 7/1–5'),
      F('Ek-16', 'İhale İlanı Örneği', 'İşletme müdürlüğü.', '2886 s.K. kapalı teklif; giriş ücreti varsa ilanda.', 'Md. 6/1, 34/3', p.ihale_t ? 'İhale ' + fd(p.ihale_t) + ' · ' + p.sekil : null),
      F('Ek-11', 'Tip Şartname', 'İhale şartnamesi.', 'İşletmeci ve müdürlükçe imzalanır, mühürlenir; noter tasdiki aranmaz.', 'Md. 12/2'),
      F('Ek-12', 'Teklif Mektubu', 'İstekli.', 'Teklif zarfında; bedel rakam ve yazıyla.', 'Şartname'),
      F('Ek-13', 'İş Ortaklığı Beyannamesi', 'Ortak girişimle teklif verilecekse.', 'Noter tasdikli.', 'Şartname'),
      F('Ek-14', 'Geçici Teminat Mektubu', 'Geçici teminat banka mektubuyla verilecekse.', 'Tahmin edilen bedelin %10–30’u.', 'Md. 8/1, 11'),
      G('Sözleşme ve saha teslimi', 'kesin teminat, sözleşme, teslim tutanağı'),
      F('Ek-15', 'Kesin Teminat Mektubu', 'Kesin teminat banka mektubuyla verilecekse.', 'Sözleşmeden önce, ihale bedelinin %6’sı.', 'Md. 9/1, 11', kesTxt, kes6 == null ? '' : (p.kesin != null && Math.abs(p.kesin - kes6) > 0.005 ? 'amb-t' : 'ok-t')),
      F('Ek-17', 'Tip Sözleşme', 'İdare ile işletmeci.', 'Gerekirse noter tasdiki (kamu tüzel kişiliğinde aranmaz); örneği 15 gün içinde GM’ye.', 'Md. 12/1, 13/1', p.soz_bas ? fd(p.soz_bas) + ' – ' + fd(p.soz_bit) : null),
      F('Ek-9', 'Örnek Saha Teslim Tesellüm Tutanağı', 'İşletme şefi sahayı teslim eder.', 'Sözleşmeden sonra en geç 5 iş günü; örneği 15 gün içinde GM’ye.', 'Md. 27/1', p.teslim ? 'Teslim ' + fd(p.teslim) + (p.soz_bas && p.teslim < p.soz_bas ? ' · sözleşme tarihinden önce kayıtlı' : '') : null, p.soz_bas && p.teslim && p.teslim < p.soz_bas ? 'amb-t' : ''),
      G('İşletme ve denetim', 'yılda iki dönem komisyon denetimi'),
      F('Ek-10', 'Denetim Raporu', 'Komisyon, yılda iki dönem.', 'Aykırılıkta GM’ye bilgi; işletmeci veya yetkilisinin imzası.', 'Md. 42/3–4', den ? den.donem.split(' (')[0] + ' raporu ' + fd(den.tarih) : 'Denetim kaydı yok', den ? '' : 'amb-t'),
      G('Değişiklik, devir ve iptal', 'sınır ve statü değişikliği, devir, iptal'),
      F('Ek-6', 'Sınır Değişikliği Teklif Raporu', 'Sınır genişletilecek veya daraltılacaksa.', 'Bölge görüşüyle GM’ye.', 'Md. 24'),
      F('Ek-7', 'Statü Değişikliği Teklif Raporu', 'Konaklama eklenecek veya kaldırılacaksa.', 'GM onayı; ilk 3 yıl ve son 1 yıl yapılamaz.', 'Md. 25', (win.find((w) => /Statü/.test(w.t)) || {}).s),
      F('Ek-18', 'Devir Taahhütnamesi', 'Sözleşmeyi devralacak kişi.', 'Noter onaylı; o yılın kirası %30 artar.', 'Md. 35/3–4, 35/10-b', (win.find((w) => /devri/.test(w.t)) || {}).s),
      F('Ek-8', 'İptal Teklif Raporu', 'Kiraya verilemeyen, potansiyelini yitirmiş park için.', 'Bölge görüşüyle GM’ye.', 'Md. 26/1')];
    return { p, win, forms };
  }
  const MEV = [['Md. 8/1', 'Geçici teminat', 'Tahmin edilen bedelin %10’undan az olmamak üzere %30’una kadar; ita amirince belirlenir.'],
    ['Md. 9/1–2', 'Kesin teminat', 'Sözleşmeden önce ihale bedelinin %6’sı. Ek yapı ve tesiste, revize planın onaylandığı yıl dahil edilerek hesaplanır.'],
    ['Md. 10/1–2', 'Güvence ve depozito', 'Güvence yıllık kiranın %25’i, depozito %10’u; her yıl kira artış oranıyla güncellenir.'],
    ['Md. 13/1', 'Belgelerin gönderilmesi', 'Sözleşme, şartname ve teslim tutanağı 15 gün içinde GM’ye; sona erme veya fesihte geri teslim tutanağı 15 gün içinde.'],
    ['Md. 27/1', 'Saha teslimi', 'Sözleşmeden sonra en geç 5 iş günü içinde Ek-9 tutanağıyla.'],
    ['Md. 30/1–2', 'Ek yapı ve tesis kirası', 'Cari yıl kirası × tesis katsayısı; maliyetin %2’sinden az olamaz, cari yıl kirasına eklenir. Onayı izleyen ilk taksitle; son taksit geçmişse onay ayı sonuna kadar peşin. Cari yıl için Bölge onay yazılarında kıst (gün ÷ 365) uygulanır.'],
    ['Md. 31/1', 'İlk yıl kirası', 'İhale bedeli; 150.000 TL’ye kadar sözleşmede tek seferde peşin. Üzerindekiler peşin veya üçte biri tebliğden itibaren 15 gün içinde, kalanı iki eşit taksit.'],
    ['Md. 32/1–3', 'Yıllık artış', 'Sözleşme ayında yayımlanan TÜFE (12 aylık ortalamalara göre) oranında. 150.000 TL üzeri peşin veya üçer aylık dört eşit taksit; KDV ve diğer bedeller 1. taksitle.'],
    ['Md. 33/1', 'Ağaçlandırma bedeli', 'Her yıl yıllık kiranın %5’i; taksitli ödemede ilk taksitle peşin.'],
    ['Md. 35/1–4', 'Sözleşme devri', 'Kapalı teklifle ihale edilen parklarda GM izniyle; borç olmamalı. O yılın kirası %30 artar. İlk 3 yıl ve son 6 ay devredilemez.'],
    ['Md. 36', 'Süre', '20 yıla kadar; süre sözleşme tarihinden hesaplanır.'],
    ['Md. 39', 'Gecikme ve fesih hakkı', 'Ödenmeyen kiraya 6183 s.K. m.51 gecikme zammı. Vadesi üzerinden iki yıl geçmiş borçta idare sözleşmeyi feshedebilir.'],
    ['Md. 40', 'Sona erme ve fesih', 'Süre bitince sona erer. Aykırılık, amaç dışı kullanım veya talep hâlinde fesih; teminatlar gelir kaydedilir, ayrıca cari yıl kirası tutarında tazminat.'],
    ['Md. 42/3–7', 'Denetim', 'Komisyon yılda iki kez denetler, Ek-10 düzenlenir; aykırılıkta GM’ye bilgi. Temizlik ve bakım her ay müdürlük komisyonunca denetlenir.']];
  const KONU = ['Tahsilat', 'Denetim raporu', 'Aylık temizlik-bakım denetimi', 'Yazışma, giden', 'Yazışma, gelen', 'Ek yapı ve tesis', 'Sözleşme devri', 'Statü değişikliği', 'Sınır değişikliği', 'Gecikme zammı', 'Teminat', 'Gelişim ve yönetim planı', 'Fesih / tahliye', 'Sözleşme sona erdi', 'Diğer'];
  const KONUC = { 'Fesih / tahliye': 'b-no', 'Sözleşme sona erdi': 'b-no', 'Denetim raporu': 'b-ok', 'Ek yapı ve tesis': 'b-amb', 'Sınır değişikliği': 'b-amb', 'Tahsilat': 'b-ok' };
  SAYFA.ekler = function () {
    const { p, win, forms } = ekVeri(), y = E.year(S.rapor);
    const kv = (a, b) => '<div class="kv"><span>' + a + '</span><span class="n">' + b + '</span></div>';
    const vals = kv('Orman parkı', esc(p.ad)) + kv('Şeflik', esc(p.seflik) + ' İşletme Şefliği') + kv('Statü', esc(p.statu || '—')) + kv('Durum', esc(p.durum)) + kv('İşletmeci', esc(p.isletmeci || '—')) +
      kv('Vergi / T.C. kimlik no', esc(p.vkn || '—')) + kv('Alan', p.alan != null ? p.alan.toLocaleString('tr-TR') + ' ha' : '—') + kv('İhale usulü', esc(p.sekil || '—')) + kv('İhale tarihi', fd(p.ihale_t)) +
      kv('İhale bedeli (KDV hariç)', p.ihale_b != null ? tl(p.ihale_b) + ' ₺' : '—') + kv('Sözleşme', p.soz_bas ? fd(p.soz_bas) + ' – ' + fd(p.soz_bit) : '—') + kv('Saha teslimi', fd(p.teslim)) + kv('Kesin teminat (kayıtlı)', p.kesin != null ? tl(p.kesin) + ' ₺' : '—');
    const defter = (S.veri.defter || []).slice().sort((a, b) => ((b.tarih || '') > (a.tarih || '') ? 1 : (b.tarih || '') < (a.tarih || '') ? -1 : b.id - a.id))
      .filter((x) => !S.defterOnly || x.park === p.kisa || (x.park === '14 park' && (S.veri.denetim || []).some((d) => d.park === p.kisa)));
    S.csv = { name: 'islem_defteri', head: ['Tarih', 'Park', 'Konu', 'Açıklama', 'Belge / sayı', 'Tutar'], rows: defter.map((l) => [fd(l.tarih), l.park, l.konu, l.aciklama, l.belge, l.tutar]) };
    const T = S.tufe[String(y)] || Array(12).fill(null), sonAy = sonTufeAyi();
    const gzr = S.gzO.slice().reverse();
    const A = (S.veri.arsiv && S.veri.arsiv.park) || [], mx = Math.max.apply(null, A.map((a) => a[1]).concat([1]));
    const ku = S.veri.kurum || {};
    return mpick() + '<div class="pagehead"><div><h1>Ekler, işlem defteri ve mevzuat</h1><p>Tebliğin 18 eki seçilen parkın bilgileriyle açılır; süre sınırları sözleşme tarihlerinden hesaplanır. Seçili park: <b>' + esc(p.kisa) + '</b></p></div></div>' +
      '<div class="two"><section class="panel"><h3>Forma aktarılan değerler <small>' + esc(p.kisa) + '</small></h3>' + vals + '</section>' +
      '<section class="panel"><h3>Süre sınırları <small>' + fd(S.rapor) + ' tarihine göre</small></h3>' + win.map((w) => '<div class="win"><div class="t"><span>' + esc(w.t) + '</span><span class="badge ' + w.c + '">' + esc(w.s) + '</span></div><div class="d n">' + esc(w.d) + '</div></div>').join('') + '</section></div>' +
      '<section class="card"><div class="ch"><h2>Tebliğ ekleri</h2><span class="muted" style="font-size:13px">313 sayılı Tebliğ · sürecin aşamasına göre</span></div><div class="scroll"><table class="rt" style="min-width:1040px"><thead><tr><th>Ek</th><th>Form</th><th>Kim, ne zaman</th><th>Süre ve gönderim</th><th>Dayanak</th><th>' + esc(p.kisa) + ' için</th><th class="noprint"></th></tr></thead><tbody>' +
      forms.map((f) => f.g ? '<tr class="grp"><td colspan="7">' + esc(f.g) + '<small>' + esc(f.gs) + '</small></td></tr>' :
        '<tr>' + td('<span class="ek">' + f.e + '</span>', '', 'lead') + td('<b>' + esc(f.ad) + '</b>', 'Form', 'wide', ' style="white-space:normal"') + td(esc(f.kim), 'Kim, ne zaman', 'wide', ' style="white-space:normal;color:var(--ink2);font-size:13.5px"') +
        td(esc(f.sure), 'Süre ve gönderim', 'wide', ' style="white-space:normal;color:var(--ink2);font-size:13.5px"') + td(esc(f.md), 'Dayanak', 'muted') + td(esc(f.pv || '—'), p.kisa + ' için', 'wide ' + (f.pc || ''), ' style="white-space:normal;font-size:13.5px"') +
        td('<button class="btn sm pri" data-a="formAc" data-e="' + f.e + '">Doldur</button> <button class="btn sm" data-a="formBilgi" data-e="' + f.e + '">Bilgi</button>' + (f.e === 'Ek-10' ? ' <button class="btn sm" data-a="formAc" data-e="R10">İmzalı rapor</button>' : ''), '', 'noprint', ' style="white-space:nowrap"') + '</tr>').join('') + '</tbody></table></div></section>' +
      '<section class="card"><div class="ch"><h2>İşlem defteri</h2><div class="seg"><button class="' + (S.defterOnly ? '' : 'on') + '" data-a="defOnly" data-v="0">Tüm parklar</button><button class="' + (S.defterOnly ? 'on' : '') + '" data-a="defOnly" data-v="1">Yalnız ' + esc(p.kisa) + '</button></div>' +
      '<button class="btn sm pri own-only" data-a="defterEkle">Kayıt ekle</button></div><div class="scroll"><table class="rt" style="min-width:1040px"><thead><tr><th style="width:100px">Tarih</th><th style="width:130px">Park</th><th style="width:170px">Konu</th><th>Açıklama</th><th style="width:200px">Belge / sayı</th><th class="r">Tutar</th><th class="noprint own-only"></th></tr></thead><tbody>' +
      defter.map((l) => '<tr>' + td(fd(l.tarih), '', 'lead n') + td('<b>' + esc(l.park) + '</b>', 'Park') + td('<span class="badge ' + (KONUC[l.konu] || 'b-gray') + '">' + esc(l.konu) + '</span>', 'Konu') +
        td(esc(l.aciklama), 'Açıklama', 'wide', ' style="white-space:normal;color:var(--ink2);font-size:13.5px"') + td(esc(l.belge || '—'), 'Belge / sayı', 'wide', ' style="white-space:normal;font-size:12.5px;color:var(--mute);word-break:break-all"') +
        td(l.tutar != null ? tl(l.tutar) : '', 'Tutar', 'n r') + td('<button class="btn sm red" data-a="defterSil" data-id="' + l.id + '">Sil</button>', '', 'noprint own-only') + '</tr>').join('') + '</tbody></table>' +
      (defter.length ? '' : '<div class="empty">' + esc(p.kisa) + ' için kayıt yok.</div>') + '</div></section>' +
      '<div class="two" style="grid-template-columns:1.4fr 1fr"><section class="panel"><h3>Hesaplara esas hükümler <small>Tebliğ metninden</small></h3>' +
      MEV.map((m) => '<div class="mev"><b>' + m[0] + '</b><div><div style="font-weight:600">' + m[1] + '</div><p>' + m[2] + '</p></div></div>').join('') +
      '<div style="padding:12px 0 4px"><button class="btn" data-a="teblig" data-pg="1">Tebliğin tam metni (PDF)</button></div></section>' +
      '<div style="display:flex;flex-direction:column;gap:18px"><section class="panel"><h3>Gecikme zammı oranları <small>6183 s.K. m.51</small></h3>' +
      gzr.map((g, j) => '<div class="kv" style="' + (j === 0 ? 'background:#E3F0E7;font-weight:600;padding-left:8px;padding-right:8px;border-radius:6px' : '') + '"><span class="n">' + fd(g[0]) + ' tarihinden</span><span class="n">aylık ' + E.pct(g[1], 1) + '</span></div>').join('') + '</section>' +
      '<section class="panel"><h3>TÜFE ' + y + ' <small>12 aylık ortalamalara göre</small></h3><div class="mini">' + T.map((v, j) => '<div style="background:' + (v == null ? '#fff' : 'var(--mist)') + '"><span>' + AY3[j] + '</span><b class="n" style="color:' + (v == null ? '#9AA69E' : 'var(--ink)') + '">' + (v == null ? '—' : E.pct(v)) + '</b></div>').join('') + '</div>' +
      '<p style="font-size:13px;color:' + (tufeGecikti() ? 'var(--ambt)' : 'var(--mute)') + ';margin:6px 0 4px">Son veri: ' + (sonAy ? AY[sonAy[1] - 1] + ' ' + sonAy[0] : '—') + ' · ' + esc(S.oran.tufe.kaynak) + (tufeGecikti() ? ' · yeni ay bekleniyor' : '') + '</p></section>' +
      '<section class="panel"><h3>Arşiv dizini <small>' + ((S.veri.arsiv && S.veri.arsiv.dosya) || 0) + ' PDF · ' + ((S.veri.arsiv && S.veri.arsiv.kayit) || 0) + ' kayıt</small></h3>' +
      A.map((a) => '<div class="arow"><span style="' + (a[0] === p.kisa ? 'font-weight:700;color:var(--pine)' : '') + '">' + esc(a[0]) + '</span><span class="tr"><i style="width:' + Math.round(a[1] / mx * 100) + '%;background:' + (a[0] === p.kisa ? '#2E7D4F' : '#A9C9B4') + '"></i></span><span class="n" style="text-align:right;color:var(--mute)">' + a[1] + '</span></div>').join('') +
      '<div style="padding:10px 0 4px"><button class="btn sm" data-a="arsivAc">' + esc(p.kisa) + ' arşiv kayıtları</button></div></section>' +
      '<section class="panel"><h3>Kurum bilgileri <small>eklere aktarılır</small></h3>' + KURUMF.map((k) => '<div class="kv"><span>' + k[1] + '</span><span>' + esc(ku[k[0]] || '—') + '</span></div>').join('') + '<div class="own-only" style="padding:10px 0 4px"><button class="btn sm" data-a="kurumDuzenle">Düzenle</button></div></section></div></div>';
  };
  AKSIYON.defOnly = (t) => { S.defterOnly = t.dataset.v === '1'; sayfaCiz(); };
  AKSIYON.formAc = (t) => {
    const { p, forms } = ekVeri(), f = forms.find((x) => x.e === t.dataset.e); if (!f) return;
    const o = S.ozBy[p.kisa], kk = o.kk;
    const dolu = [['Orman parkı', p.ad], ['Şeflik', p.seflik + ' İşletme Şefliği'], ['İşletme müdürlüğü', (S.veri.kurum || {}).isletme], ['İşletmeci', p.isletmeci], ['Vergi / T.C. no', p.vkn], ['Alan', p.alan != null ? p.alan.toLocaleString('tr-TR') + ' ha' : null],
      ['İhale usulü / tarihi', (p.sekil || '—') + ' · ' + fd(p.ihale_t)], ['İhale bedeli', p.ihale_b != null ? tl(p.ihale_b) + ' ₺' : null], ['Sözleşme', p.soz_bas ? fd(p.soz_bas) + ' – ' + fd(p.soz_bit) : null], ['Saha teslimi', fd(p.teslim)],
      ['Bu yılki kira (Tebliğe göre)', kk.hesap != null ? tl(kk.hesap) + ' ₺' : null], ['Kesin teminat (%6)', p.ihale_b != null ? tl(r2(p.ihale_b * .06)) + ' ₺' : null], ['Kayıtlı kesin teminat', p.kesin != null ? tl(p.kesin) + ' ₺' : null], ['Gelişim ve yönetim planı', p.plan]];
    modal(f.e + ' · ' + f.ad, '<div class="kv"><span>Kim, ne zaman</span><span>' + esc(f.kim) + '</span></div><div class="kv"><span>Süre ve gönderim</span><span>' + esc(f.sure) + '</span></div><div class="kv"><span>Dayanak</span><span>' + esc(f.md) + '</span></div>' +
      (f.pv ? '<div class="quote"><b>' + esc(p.kisa) + ':</b> ' + esc(f.pv) + '</div>' : '') + '<h3 style="margin:8px 0 0;font-size:15.5px">Forma yazılacak değerler</h3>' +
      dolu.filter((d) => d[1]).map((d) => '<div class="kv"><span>' + d[0] + '</span><span>' + esc(d[1]) + '</span></div>').join('') +
      '<p class="muted" style="font-size:13px;margin:4px 0 0">Formun resmî örneği Tebliğin ' + EKSAYFA[f.e] + '. sayfasındadır. Değerler bu programdaki kayıtlardan gelir; imzadan önce asıl belgelerle karşılaştırın.</p>',
      '<button class="btn" data-a="teblig" data-pg="' + EKSAYFA[f.e] + '">Tebliğdeki formu aç</button>' + (f.e === 'Ek-10' ? '<button class="btn" data-a="ek10" data-k="' + esc(p.kisa) + '">Bu parkın raporu</button>' : '') + '<button class="btn pri" data-a="pdf">Yazdır / PDF</button>');
  };
  AKSIYON.arsivAc = () => {
    const p = S.pBy[S.park], L = ((S.veri.arsiv && S.veri.arsiv.liste) || []).filter((a) => a.park === p.kisa);
    modal('Arşiv · ' + p.kisa, L.length ? '<div class="sl"><table><thead><tr><th>Dosya</th><th>Sayfa</th><th>Yıl</th><th>Tür / konu</th></tr></thead><tbody>' + L.map((a) => '<tr><td>' + esc(a.dosya) + '</td><td class="n">' + a.bas + (a.son !== a.bas ? '–' + a.son : '') + '</td><td>' + esc(a.yil) + '</td><td style="white-space:normal;font-size:13px">' + esc(a.tur) + (a.konu ? '<br><span class="muted">' + esc(a.konu) + '</span>' : '') + '</td></tr>').join('') + '</tbody></table></div>' : '<div class="empty">Bu park için arşiv kaydı yok.</div>');
  };

  // ---------- PARKLAR ----------
  SAYFA.parklar = function () {
    const P = S.veri.parks;
    S.csv = { name: 'parklar', head: ['Park', 'Resmî adı', 'Şeflik', 'Statü', 'Durum', 'İşletmeci', 'VKN/TCKN', 'İhale usulü', 'Alan (ha)', 'İhale tarihi', 'İhale bedeli', 'Sözleşme başı', 'Sözleşme sonu', 'Saha teslimi', 'Kalan yıl', 'Artış esası', 'TÜFE kuralı', 'Kesin teminat', 'Bu yıl kira', 'Tahsil', 'Açık', 'Vadesi geçmiş', 'GZ', 'Uyarılar'],
      rows: P.map((p) => { const o = S.ozBy[p.kisa]; return [p.kisa, p.ad, p.seflik, p.statu, p.durum, p.isletmeci, p.vkn, p.sekil, p.alan, fd(p.ihale_t), p.ihale_b, fd(p.soz_bas), fd(p.soz_bit), fd(p.teslim), o.kalan != null ? r2(o.kalan) : '', p.artis, p.kural, p.kesin, o.kira_yil, o.tahsil, o.acik, o.vgec, o.gz, o.uyari.join(' · ')]; }) };
    return '<div class="pagehead"><div><h1>Parklar</h1><p>Her satır bir orman parkı. Mali sütunlar muhasebe dökümünden otomatik hesaplanır; park bilgilerini yalnız yönetici değiştirebilir.</p></div><button class="btn pri own-only" data-a="parkDuzenle" data-k="">Yeni park ekle</button></div>' +
      '<section class="card"><div class="scroll" style="padding-top:8px"><table class="rt" style="min-width:1180px"><thead><tr><th>Park</th><th>Durum</th><th>İşletmeci</th><th>Sözleşme</th><th class="r">Kalan</th><th class="r">Bu yıl kira</th><th class="r">Tahsil edilen</th><th class="r">Açık</th><th class="r">Vadesi geçmiş</th><th>Uyarılar</th><th class="noprint"></th></tr></thead><tbody>' +
      P.map((p) => { const o = S.ozBy[p.kisa]; return '<tr>' + td('<a class="pk" href="#/park" data-a="park" data-k="' + esc(p.kisa) + '" data-go="park">' + esc(p.kisa) + '<small>' + esc(p.seflik) + ' · ' + esc(p.statu || '') + '</small></a>', '', 'lead') +
        td('<span class="' + stCls(p.durum) + '">' + esc(p.durum) + '</span>', 'Durum') + td(esc(p.isletmeci || '—'), 'İşletmeci', 'wide', ' style="white-space:normal;max-width:240px;font-size:13.5px"') +
        td(p.soz_bas ? fd(p.soz_bas) + ' – ' + fd(p.soz_bit) : '—', 'Sözleşme', 'n') + td(o.kalan != null ? o.kalan.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' yıl' : '—', 'Kalan', 'r') +
        td(o.kira_yil ? tl(o.kira_yil) : '–', 'Bu yıl kira', 'n r') + td(o.tahsil ? tl(o.tahsil) : '–', 'Tahsil', 'n r') + td('<b>' + (o.acik ? tl(o.acik) : '–') + '</b>', 'Açık', 'n r') + td(o.vgec ? tl(o.vgec) : '–', 'Vadesi geçmiş', 'n r ' + (o.vgec ? 'red-t' : 'muted')) +
        td(o.uyari.length ? o.uyari.map((u) => '<span class="tag2">' + esc(u) + '</span>').join(' ') : '<span class="muted">—</span>', 'Uyarılar', 'wide', ' style="white-space:normal;max-width:260px"') +
        td('<button class="btn sm own-only" data-a="parkDuzenle" data-k="' + esc(p.kisa) + '">Düzenle</button><a class="btn sm view-only" href="#/park" data-a="park" data-k="' + esc(p.kisa) + '" data-go="park">Aç</a>', '', 'noprint') + '</tr>'; }).join('') +
      '</tbody></table></div></section>';
  };

  // ---------- KİRA ZİNCİRİ ----------
  SAYFA.zincir = function () {
    const P = S.veri.parks.filter((p) => p.taban && p.ihale_b != null);
    if (!S.zPark || !P.find((p) => p.kisa === S.zPark)) S.zPark = P.find((p) => p.kisa === S.park) ? S.park : (P[0] || {}).kisa;
    const z = S.pBy[S.zPark] ? S.ozBy[S.zPark].kk : null;
    S.csv = { name: 'kira_zinciri', head: ['Park', 'Artış esası', 'TÜFE kuralı', 'Kira tabanı', 'İhale bedeli', 'Dönem', 'Dönem başı', 'TÜFE', 'Tebliğe göre', 'Muhasebe', 'Fark', 'Durum', 'Açıklama'],
      rows: S.veri.parks.map((p) => { const k = S.ozBy[p.kisa].kk; return [p.kisa, p.artis, p.kural, fd(p.taban), p.ihale_b, k.donem, fd(k.bas), k.tufe, k.hesap, k.muh, k.fark, k.durum, (p.muh_kira_not ? 'Muhasebe: ' + p.muh_kira_not + '. ' : '') + (p.kz_not || '')]; }) };
    return mpick() + '<div class="pagehead"><div><h1>Kira zinciri ve kontrol</h1><p>Md. 31–32: 1. dönem ihale bedelidir; sonraki dönem = (önceki dönem + o dönemde eklenen ek tesis kirası) × (1 + TÜFE), kuruşa yuvarlanır. Rapor yılının 31 Mart’ına kadar başlamış son dönem muhasebedeki yıllık kirayla karşılaştırılır.</p></div></div>' +
      '<section class="card"><div class="ch"><h2>Park bazında kontrol</h2></div><div class="scroll"><table class="rt" style="min-width:1180px"><thead><tr><th>Park</th><th>Artış esası / TÜFE kuralı</th><th>Dönem başı</th><th class="r">TÜFE</th><th class="r">Tebliğe göre</th><th class="r">Muhasebe</th><th class="r">Fark</th><th>Durum</th><th>Açıklama</th></tr></thead><tbody>' +
      S.veri.parks.map((p) => { const k = S.ozBy[p.kisa].kk; return '<tr>' + td('<a href="#/zincir" data-a="zsec" data-k="' + esc(p.kisa) + '" style="font-weight:600">' + esc(p.kisa) + '</a>', '', 'lead') +
        td(esc(p.artis || '—') + '<br><span class="muted" style="font-size:12.5px">' + esc(p.kural || '') + '</span>', 'Esas / kural') + td(fd(k.bas), 'Dönem başı', 'n') + td(k.tufe != null ? E.pct(k.tufe) : '—', 'TÜFE', 'r') +
        td(tl(k.hesap), 'Tebliğe göre', 'n r') + td(tl(k.muh), 'Muhasebe', 'n r') + td(k.fark != null ? tl(k.fark) : '–', 'Fark', 'n r ' + (k.durum === 'Fark var' ? 'red-t' : 'muted')) +
        td('<span class="badge ' + (k.durum === 'Uyumlu' ? 'b-ok' : k.durum === 'Fark var' ? 'b-no' : 'b-gray') + '">' + k.durum + '</span>', 'Durum') +
        td(esc((p.muh_kira_not ? 'Muhasebe: ' + p.muh_kira_not + '. ' : '') + (p.kz_not || '')), 'Açıklama', 'wide', ' style="white-space:normal;font-size:13px;color:var(--ink2);max-width:360px"') + '</tr>'; }).join('') +
      '</tbody></table></div></section>' +
      (z ? '<section class="card"><div class="ch"><h2>Dönem zinciri · ' + esc(S.zPark) + '</h2><span class="muted" style="font-size:13px">Taban ' + fd(S.pBy[S.zPark].taban) + ' · ' + esc(S.pBy[S.zPark].kural) + '</span>' +
        '<button class="btn sm own-only" data-a="ekKiraEkle" data-k="' + esc(S.zPark) + '">Ek kira ekle</button></div><div class="scroll"><table class="rt"><thead><tr><th>Dönem</th><th>Başlangıç</th><th>Uygulanan TÜFE</th><th class="r">Oran</th><th class="r">Eklenen ek tesis kirası</th><th class="r">Dönem kirası</th></tr></thead><tbody>' +
        z.zincir.map((d) => '<tr' + (d.n === z.donem ? ' style="background:#F1F8F3"' : '') + '>' + td(d.n + '. dönem' + (d.n === z.donem ? ' · karşılaştırılan' : ''), '', 'lead') + td(fd(d.bas), 'Başlangıç', 'n') +
          td(d.tufeAy ? AY[d.tufeAy[1] - 1] + ' ' + d.tufeAy[0] : 'İhale bedeli', 'TÜFE ayı') + td(d.tufe != null ? E.pct(d.tufe) : (d.n === 1 ? '–' : 'yayımlanmadı'), 'Oran', 'r') + td(d.ek ? tl(d.ek) : '–', 'Ek kira', 'n r') + td('<b>' + tl(d.bedel) + '</b>', 'Dönem kirası', 'n r') + '</tr>').join('') +
        '</tbody></table></div></section>' : '');
  };
  AKSIYON.zsec = (t, ev) => { ev.preventDefault(); S.zPark = t.dataset.k; S.park = t.dataset.k; sayfaCiz(); };

  // ---------- MUHASEBE ----------
  SAYFA.muhasebe = function () {
    const rows = S.esl.rows, q = (S.muhQ || '').toLocaleLowerCase('tr-TR');
    const bal = (k) => sumOf(rows.filter((x) => x.kaynak === k), (x) => x.borc - x.alacak);
    const L = rows.filter((x) => (S.muhK === 'tümü' || x.kaynak === S.muhK || (S.muhK === 'elle' && x.ek)) && (!q || (String(x.yev) + ' ' + x.aciklama + ' ' + x.musteri + ' ' + x.park + ' ' + x.vkn).toLocaleLowerCase('tr-TR').includes(q)))
      .sort((a, b) => (a.kaynak < b.kaynak ? -1 : a.kaynak > b.kaynak ? 1 : a.tarih < b.tarih ? -1 : a.tarih > b.tarih ? 1 : a.yev - b.yev));
    S.csv = { name: 'muhasebe', head: ['Hesap', 'Yev. no', 'Yev. tarihi', 'Hesap no', 'Vergi no', 'Müşteri', 'Vade', 'Nedeni', 'Açıklama', 'Borç', 'Alacak', 'Borç hs.', 'Alacak hs.', 'Park', 'Not'],
      rows: L.map((x) => [x.kaynak, x.yev, fd(x.tarih), x.hesap, x.vkn, x.musteri, fd(x.vade), x.neden, x.aciklama, x.borc, x.alacak, x.borc_h, x.alacak_h, x.park, x.not_]) };
    return '<div class="pagehead"><div><h1>Muhasebe</h1><p>120.99 ve 127 hesap dökümleri (veri tarihi ' + fd(S.veri.meta.muhasebe_tarihi) + '). Tahakkuklar alacak kalemi olur; her tahsilat fişi önce aynı hesap ve vadeli kaleme, sonra en eski vadeye dağıtılır.</p></div>' +
      '<div class="own-only" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri" data-a="csvYukle">Yeni döküm yükle (CSV)</button><button class="btn" data-a="kayitEkle">Elle kayıt ekle</button></div></div>' +
      '<section class="kpis"><div class="kpi"><span>120.99 bakiyesi</span><strong class="n">' + tl(bal('120')) + '</strong><em>Borç − alacak</em></div><div class="kpi"><span>127 bakiyesi</span><strong class="n">' + tl(bal('127')) + '</strong><em>Borç − alacak (park dışı dahil)</em></div>' +
      '<div class="kpi"><span>Satır sayısı</span><strong class="n">' + rows.length + '</strong><em>' + rows.filter((x) => x.park === 'Park dışı').length + ' satır park dışı · ' + rows.filter((x) => x.ek).length + ' elle eklenen</em></div><div class="kpi"><span>Alacak kalemi</span><strong class="n">' + S.esl.items.length + '</strong><em>' + S.esl.parcalar.length + ' parça (ödeme bölünmeleriyle)</em></div></section>' +
      '<section class="card"><div class="ch" style="gap:12px"><h2>Döküm satırları</h2><div class="filters"><div class="seg">' + [['tümü', 'Tümü'], ['120', '120.99'], ['127', '127'], ['elle', 'Elle eklenen']].map((s) => '<button class="' + (S.muhK === s[0] ? 'on' : '') + '" data-a="muhK" data-v="' + s[0] + '">' + s[1] + '</button>').join('') + '</div>' +
      '<input class="fld" id="muhQ" type="search" placeholder="Yevmiye, açıklama, park ara" value="' + esc(S.muhQ) + '" style="width:240px;background:#fff;border-color:var(--line)"></div></div>' +
      '<div class="scroll"><table class="rt" style="min-width:1180px"><thead><tr><th>Hesap</th><th>Yev.</th><th>Tarih</th><th>Park</th><th>Hesap no</th><th>Vade</th><th>Açıklama</th><th class="r">Borç</th><th class="r">Alacak</th><th>Borç / alacak hs.</th><th class="noprint own-only"></th></tr></thead><tbody>' +
      L.slice(0, 400).map((x) => '<tr' + (x.ek ? ' style="background:#FFFCEF"' : '') + '>' + td('<b>' + x.kaynak + '</b>', '', 'lead') + td(x.yev, 'Yev.', 'n') + td(fd(x.tarih), 'Tarih', 'n') + td(esc(x.park), 'Park', x.park === 'Park dışı' ? 'muted' : '') +
        td(esc(x.hesap), 'Hesap no', 'muted') + td(fd(x.vade), 'Vade', 'n') + td(esc(x.aciklama) + (x.not_ ? '<br><span class="amb-t" style="font-size:12px">' + esc(x.not_) + '</span>' : ''), 'Açıklama', 'wide', ' style="white-space:normal;max-width:380px;font-size:13.5px"') +
        td(x.borc ? tl(x.borc) : '', 'Borç', 'n r') + td(x.alacak ? tl(x.alacak) : '', 'Alacak', 'n r') + td(esc(x.borc_h) + ' / ' + esc(x.alacak_h), 'Hesaplar', 'muted') +
        td(x.ek ? '<button class="btn sm red" data-a="kayitSil" data-id="' + x.id + '">Sil</button>' : '', '', 'noprint own-only') + '</tr>').join('') + '</tbody></table>' +
      (L.length > 400 ? '<p class="muted" style="margin:10px 6px">İlk 400 satır gösteriliyor; arama ile daraltın ya da CSV indirin.</p>' : '') + (L.length ? '' : '<div class="empty">Satır yok.</div>') + '</div></section>';
  };
  AFTER.muhasebe = () => { const q = $('#muhQ'); if (q) { q.oninput = (e) => { S.muhQ = e.target.value; clearTimeout(q._t); q._t = setTimeout(() => { sayfaCiz(); const n = $('#muhQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 300); }; } };
  AKSIYON.muhK = (t) => { S.muhK = t.dataset.v; sayfaCiz(); };
  AKSIYON.muhara = (t, ev) => { S.muhQ = t.dataset.q; S.muhK = 'tümü'; modalKapat(); if (location.hash === '#/muhasebe') { ev.preventDefault(); sayfaCiz(); } };

  // ---------- VERİLER VE AYARLAR ----------
  SAYFA.veriler = function () {
    const T = S.tufe, yrs = Object.keys(T).map(Number).sort((a, b) => b - a), man = S.veri.tufe_manuel || {}, O = S.oran;
    const tufeT = '<section class="card"><div class="ch"><h2>TÜFE — on iki aylık ortalamalara göre değişim</h2><span class="muted" style="font-size:13px">' + esc(O.tufe.kaynak) + '</span></div>' +
      '<div style="padding:0 22px 8px" class="muted"><p style="margin:0 0 6px;font-size:13.5px">Durum: ' + esc(O.tufe.durum || '—') + ' · son güncelleme ' + esc((O.guncelleme || '').slice(0, 16).replace('T', ' ')) + '. Sarı hücreler yöneticinin geçici girdiğidir; resmî veri gelince onun yerine geçer.</p></div>' +
      '<div class="scroll"><table style="min-width:900px"><thead><tr><th>Yıl</th>' + AY3.map((a) => '<th class="r">' + a + '</th>').join('') + '</tr></thead><tbody>' +
      yrs.map((y) => '<tr><td><b>' + y + '</b></td>' + (T[y] || []).map((v, i) => { const k = y + '-' + String(i + 1).padStart(2, '0'), m = man[k] != null && (O.tufe.degerler[y] || [])[i] == null;
        return '<td class="r n" style="' + (m ? 'background:#FFFBEA' : '') + '">' + (v == null ? '<span class="muted">—</span>' : E.pct(v)) + '</td>'; }).join('') + '</tr>').join('') + '</tbody></table></div>' +
      '<div class="own-only" style="padding:4px 22px 18px"><button class="btn sm" data-a="tufeGir">Eksik ayı elle gir</button></div></section>';
    const gzT = '<section class="card"><div class="ch"><h2>Gecikme zammı oranları</h2><span class="muted" style="font-size:13px">' + esc(O.gz.kaynak) + '</span></div><div style="padding:0 22px 18px">' +
      '<p class="muted" style="margin:0 0 8px;font-size:13.5px">' + esc(O.gz.durum || '') + (O.gz.son_kontrol ? ' · Resmî Gazete son kontrol ' + esc(O.gz.son_kontrol) : '') + '</p>' +
      S.gzO.slice().reverse().map((g) => '<div class="kv"><span>' + fd(g[0]) + ' tarihinden itibaren</span><span>aylık ' + E.pct(g[1], 1) + (g[2] ? ' · <span style="font-size:12.5px;color:var(--mute)">' + esc(g[2]).slice(0, 140) + '</span>' : '') + '</span></div>').join('') +
      '<div class="kv"><span>Gecikme zammının KDV’si (kira kalemleri)</span><span>' + E.pct(O.gz_kdv, 0) + '</span></div>' +
      ((S.veri.gz_manuel || []).length ? '<h3 style="font-size:14px;margin:12px 0 4px">Elle kaydedilen oranlar</h3>' + S.veri.gz_manuel.map((m, i) => '<div class="kv"><span>' + fd(m.tarih) + ' · %' + (m.oran * 100).toLocaleString('tr-TR') + ' · ' + esc(m.not_) + '</span><span>' + esc(m.kim || '') + ' <button class="btn sm red own-only" data-a="gzSil" data-i="' + i + '">Sil</button></span></div>').join('') : '') +
      '<div class="own-only" style="padding-top:10px"><button class="btn sm" data-a="gzGir">Oranı elle kaydet</button></div></div></section>';
    const ed = S.veri.vade_duz || [];
    const vd = '<section class="card"><div class="ch"><h2>Vade düzeltmeleri</h2><span class="muted" style="font-size:13px">Resmî yazıya göre muhasebe vadesinden farklı esas vade</span><button class="btn sm own-only" data-a="vadeDuz" data-kalem="">Kural ekle</button></div><div class="scroll"><table class="rt"><thead><tr><th>Park</th><th>Tür</th><th>Muhasebe vadesi</th><th>Grup</th><th>Esas vade</th><th>Kaynak</th><th class="own-only noprint"></th></tr></thead><tbody>' +
      ed.map((r, i) => '<tr>' + td('<b>' + esc(r.park) + '</b>', '', 'lead') + td(esc(r.tur || 'Tümü'), 'Tür') + td(r.mv ? fd(r.mv) : 'vade yok', 'Muhasebe vadesi', 'n') + td(esc(r.grup), 'Grup') + td('<span class="duz">' + fd(r.yeni) + '</span>', 'Esas vade', 'n') +
        td(esc(r.not_), 'Kaynak', 'wide', ' style="white-space:normal;font-size:13px;max-width:420px"') + td('<button class="btn sm red" data-a="vadeSil" data-i="' + i + '">Sil</button>', '', 'own-only noprint') + '</tr>').join('') + '</tbody></table></div></section>';
    const ek = S.veri.ek_kira || [];
    const ekT = '<section class="card"><div class="ch"><h2>Ek tesis kiraları (kira zincirine eklenen)</h2></div><div class="scroll"><table class="rt"><thead><tr><th>Park</th><th>Dönem</th><th class="r">Yıllık ek kira</th><th>Kaynak</th><th class="own-only noprint"></th></tr></thead><tbody>' +
      ek.map((r, i) => '<tr>' + td('<b>' + esc(r.park) + '</b>', '', 'lead') + td(r.donem + '. dönem', 'Dönem') + td(tl(r.tutar), 'Ek kira', 'n r') + td(esc(r.not_ || ''), 'Kaynak', 'wide') + td('<button class="btn sm red" data-a="ekKiraSil" data-i="' + i + '">Sil</button>', '', 'own-only noprint') + '</tr>').join('') + '</tbody></table></div></section>';
    const yon = '<section class="card own-only"><div class="ch"><h2>Yönetici ayarları</h2></div><div style="padding:0 22px 20px;display:flex;flex-direction:column;gap:10px">' +
      '<div class="kv"><span>GitHub deposu</span><span>' + CFG.owner + '/' + CFG.repo + '</span></div><div class="kv"><span>Son kayıt</span><span>' + esc(S.veri.meta.kaydedildi ? new Date(S.veri.meta.kaydedildi).toLocaleString('tr-TR') : '—') + '</span></div>' +
      '<div class="kv"><span>Oturum</span><span>' + esc(S.kim || 'Yönetici') + '</span></div>' +
      '<div class="chiprow"><button class="btn" data-a="sifreDegis">Erişim parolasını değiştir</button><button class="btn" data-a="yPwDegis">Yönetici parolasını değiştir</button><button class="btn" data-a="anahtarYenile">GitHub anahtarını yenile</button>' +
      '<button class="btn" data-a="kurumDuzenle">Kurum bilgileri</button><button class="btn" data-a="yedekIndir">Veri yedeğini indir (JSON)</button><button class="btn" data-a="yedekYukle">Yedekten geri yükle</button><button class="btn" data-a="muhTarih">Muhasebe veri tarihini değiştir</button></div>' +
      '<p class="muted" style="margin:0;font-size:13px">Yetki düzeyleri: erişim parolası yalnız görüntüleme sağlar; yönetici parolası depodaki şifreli GitHub anahtarını açar ve kaydetmeye izin verir. Her kayıt git geçmişinde sürüm olarak saklanır.</p></div></section>';
    const G = (S.veri.gecmis || []).slice().reverse().slice(0, 300);
    const gecH = '<section class="card"><div class="ch"><h2>İşlem geçmişi</h2><span class="muted" style="font-size:13px">' + (S.veri.gecmis || []).length + ' kayıt · son kayıt ' + esc(S.veri.meta.kaydedildi ? new Date(S.veri.meta.kaydedildi).toLocaleString('tr-TR') + ' (' + (S.veri.meta.kaydeden || '') + ')' : '—') + '</span></div>' +
      (G.length ? '<div class="scroll"><table class="rt"><thead><tr><th>Zaman</th><th>Kim</th><th>Park</th><th>İşlem</th></tr></thead><tbody>' + G.map((g) => '<tr>' + td(new Date(g.t).toLocaleString('tr-TR'), '', 'lead n muted') + td(esc(g.kim || ''), 'Kim') + td(esc(g.park || '—'), 'Park') + td(esc(g.is), 'İşlem', 'wide', ' style="white-space:normal"') + '</tr>').join('') + '</tbody></table></div>'
        : '<div class="empty">Henüz kayıtlı işlem yok. Yönetici her değişiklik yaptığında burada görünür.</div>') + '</section>';
    const tm = ls.get('op_tema') || 'oto';
    const temaH = '<section class="card"><div class="ch"><h2>Görünüm</h2><div class="seg">' + [['oto', 'Cihaza göre'], ['acik', 'Açık'], ['koyu', 'Koyu']].map((x) => '<button class="' + (tm === x[0] ? 'on' : '') + '" data-a="tema" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div></div></section>';
    const info = '<section class="card"><div class="ch"><h2>Bu program hakkında</h2></div><div style="padding:0 22px 20px;font-size:14.5px;line-height:1.6;color:var(--ink2)">' +
      '<p style="margin:0 0 8px">Hesaplar 313 sayılı Orman Parkları Tebliği (Md. 8–10, 30–33, 35, 39–40) ve 6183 sayılı Kanunun 51. maddesine göre yapılır. Rapor tarihi her gün kendiliğinden bugünün tarihidir (' + fd(S.rapor) + ').</p>' +
      '<p style="margin:0 0 8px">TÜFE ve gecikme zammı oranları her gün resmî kaynaklardan otomatik denetlenir (TÜİK veri servisi, Resmî Gazete). Kayıtlar şifreli tutulur; yalnız erişim parolasını bilen açabilir, yalnız yönetici değiştirebilir.</p>' +
      '<p style="margin:0">Kaynak belgeler: ' + esc(S.veri.meta.kaynak) + '.</p></div></section>';
    S.csv = { name: 'tufe', head: ['Yıl'].concat(AY), rows: yrs.map((y) => [y].concat((T[y] || []).map((v) => (v == null ? '' : r2(v * 10000) / 100)))) };
    return '<div class="pagehead"><div><h1>Veriler ve ayarlar</h1><p>Resmî oranlar, vade düzeltmeleri, ek kiralar, işlem geçmişi ve program ayarları.</p></div></div>' + banners() + tufeT + '<div class="two">' + gzT + info + '</div>' + vd + ekT + yon + gecH + temaH;
  };

  // =============== YÖNETİCİ İŞLEMLERİ (formlar) ===============
  // ---- yönetici girişi: yönetici parolası, depodaki şifreli anahtarı (data/yonetici.enc) açar ----
  async function yoneticiDosya() {
    try {
      const r = await fetch('https://api.github.com/repos/' + CFG.owner + '/' + CFG.repo + '/contents/' + CFG.yonetici + '?ref=' + CFG.branch + '&t=' + Date.now(), { headers: { Accept: 'application/vnd.github.raw+json' }, cache: 'no-store' });
      if (r.ok) return await r.text();
      if (r.status === 404) return null;
    } catch (e) { /* ağ */ }
    try { const r = await fetch(CFG.yonetici + '?t=' + Date.now(), { cache: 'no-store' }); if (r.ok) return await r.text(); if (r.status === 404) return null; } catch (e) {}
    throw new Error('Yönetici kaydı okunamadı; internet bağlantısını kontrol edin.');
  }
  function oturumAc(tok, kim, kalici) {
    S.token = tok; S.kim = kim || 'Yönetici';
    (kalici ? ls : ss).set('op_gh', tok); (kalici ? ls : ss).set('op_kim', S.kim);
  }
  function yoneticiGiris() {
    modal('Yönetici girişi', '<p style="margin:0;color:var(--ink2);line-height:1.5">Düzenleme ve kaydetme için <b>yönetici parolasını</b> girin. Erişim parolası yalnız görüntüleme içindir.</p>' +
      '<div class="f"><label for="ypw">Yönetici parolası</label><input class="fld" id="ypw" type="password" autocomplete="current-password"></div>' +
      '<label class="chk"><input type="checkbox" id="ykeep" checked> Bu cihazda açık kalsın</label><div class="err" id="yerr" role="alert"></div>' +
      '<p class="muted" style="margin:0;font-size:13px"><a href="#" data-a="kurulum" style="text-decoration:underline">İlk kurulum / parolamı unuttum / anahtarı yenile</a></p>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="yOk">Giriş</button>');
    const go = async () => {
      const pw = $('#ypw').value; if (!pw) return;
      $('#yerr').textContent = 'Denetleniyor…';
      let txt;
      try { txt = await yoneticiDosya(); } catch (e) { $('#yerr').textContent = e.message; return; }
      if (!txt) { $('#yerr').textContent = 'Yönetici kaydı henüz oluşturulmamış. İlk kurulum açılıyor…'; setTimeout(() => kurulum('ilk'), 700); return; }
      let o; try { o = await K.coz(txt, pw); } catch (e) { $('#yerr').textContent = 'Yönetici parolası yanlış.'; return; }
      S.token = o.token; const ok = await yetkiKontrol(true);
      if (!ok) { S.token = null; $('#yerr').innerHTML = 'Parola doğru, ancak kayıtlı GitHub anahtarı artık geçerli değil (süresi dolmuş veya iptal edilmiş). <a href="#" data-a="kurulum" data-m="yenile" style="text-decoration:underline">Anahtarı yenileyin</a>.'; return; }
      oturumAc(o.token, o.kim, $('#ykeep').checked); S.yPw = pw;
      if (!S.dirty) S.sha = await shaAl(CFG.veri);
      modalKapat(); kabukDurum(); sayfaCiz(); toast('Yönetici girişi yapıldı (' + S.kim + '). Düzenleme düğmeleri açıldı.');
    };
    $('#yOk').onclick = go; $('#ypw').onkeydown = (e) => { if (e.key === 'Enter') go(); };
  }
  const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new?name=' + encodeURIComponent('Orman Parklari yonetici') +
    '&description=' + encodeURIComponent('Orman Parklari programinda kayit yetkisi') + '&target_name=' + CFG.owner + '&expires_in=366&contents=write';
  function kurulum(mod) {
    modal(mod === 'yenile' ? 'GitHub anahtarını yenile' : 'Yönetici kurulumu (bir kez)',
      '<ol style="margin:0;padding-left:20px;line-height:1.6;color:var(--ink2)"><li><a class="btn sm" href="' + TOKEN_URL + '" target="_blank" rel="noopener">GitHub’da anahtar sayfasını aç</a> (ad, süre ve “Contents: Read and write” izni hazır gelir).</li>' +
      '<li>“Repository access” bölümünde <b>Only select repositories</b> → <b>' + CFG.repo + '</b> seçin, en altta <b>Generate token</b>’a basın.</li><li>Oluşan anahtarı (github_pat_…) aşağıya yapıştırın ve bir yönetici parolası belirleyin.</li></ol>' +
      fi('ku_tok', 'GitHub anahtarı', '', 'password') + fi('ku_kim', 'Adınız (işlem geçmişinde görünür)', S.kim && S.kim !== 'Yönetici' ? S.kim : '') +
      '<div class="frow">' + fi('ku_p1', 'Yönetici parolası (en az 8 karakter)', '', 'password') + fi('ku_p2', 'Yönetici parolası (tekrar)', '', 'password') + '</div>' +
      '<p class="muted" style="margin:0;font-size:13px">Yönetici parolası erişim parolasından farklı olmalıdır. Anahtar bu parolayla şifrelenip depoya yazılır; başka cihazlarda yalnız parola yeterlidir. Parolayı unutursanız bu ekrandan yeni anahtarla yeniden belirlenir.</p><div class="err" id="kuerr" role="alert"></div>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="kuOk">Kaydet ve giriş yap</button>');
    $('#kuOk').onclick = async () => {
      const tok = $('#ku_tok').value.trim(), p1 = $('#ku_p1').value, p2 = $('#ku_p2').value, kim = gv('ku_kim') || 'Yönetici', er = $('#kuerr');
      if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(tok)) { er.textContent = 'Anahtar “github_pat_” ile başlamalı.'; return; }
      if (p1.length < 8 || p1 !== p2) { er.textContent = 'Parolalar aynı ve en az 8 karakter olmalı.'; return; }
      if (p1 === S.pw) { er.textContent = 'Yönetici parolası erişim parolasıyla aynı olamaz.'; return; }
      er.textContent = 'Anahtar denetleniyor…';
      S.token = tok; const ok = await yetkiKontrol(true);
      if (!ok) { S.token = null; er.textContent = 'Bu anahtarın ' + CFG.repo + ' deposuna yazma izni yok. Depo seçimini ve “Contents: Read and write” iznini kontrol edin.'; return; }
      try { await dosyaYaz(CFG.yonetici, await K.sifrele({ token: tok, kim, t: new Date().toISOString() }, p1), 'Yönetici anahtarı güncellendi (' + kim + ')'); }
      catch (e) { er.textContent = 'Yönetici kaydı yazılamadı: ' + e.message; return; }
      oturumAc(tok, kim, true); S.yPw = p1; if (!S.dirty) S.sha = await shaAl(CFG.veri);
      modalKapat(); kabukDurum(); sayfaCiz(); toast('Kurulum tamam. Bundan sonra yönetici girişi için yalnız parola yeterli.');
    };
  }
  AKSIYON.kurulum = (t, ev) => { ev.preventDefault(); kurulum(t.dataset.m); };
  const fi = (id, lab, v, type, opts, extra) => (type === 'number' && typeof v === 'number' ? (v = String(v).replace('.', ',')) : 0, '') + '<div class="f"><label for="' + id + '">' + lab + '</label>' + (opts ? '<select class="fld" id="' + id + '">' + opts.map((o) => '<option' + (String(o) === String(v == null ? '' : v) ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>'
    : type === 'area' ? '<textarea class="fld" id="' + id + '">' + esc(v || '') + '</textarea>' : '<input class="fld" id="' + id + '" type="' + (type === 'number' ? 'text' : (type || 'text')) + '"' + (type === 'number' ? ' inputmode="decimal" autocomplete="off"' : '') + ' value="' + esc(v == null ? '' : v) + '"' + (extra || '') + '>') + '</div>';
  const sayiOku = (v) => { v = String(v).replace(/[\s₺]|TL/g, ''); if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.'); else if (/^-?\d{1,3}(\.\d{3})+$/.test(v)) v = v.replace(/\./g, ''); const n = parseFloat(v); return isNaN(n) ? NaN : n; };
  const gv = (id, type) => { const el = $('#' + id); if (!el) return null; const v = el.value.trim(); if (v === '') return null; return type === 'number' ? sayiOku(v) : v; };
  // ---- park kaydı (yeni park sihirbazı ve düzenleme): tek kayıt, bütün sayfalar ve ekler buradan beslenir ----
  const USUL = ['Kapalı teklif usulü', 'Pazarlık usulü (2886 s.K.)', 'Protokol / tahsis'];
  AKSIYON.parkDuzenle = (t) => {
    if (!S.owner) return yoneticiGiris();
    const yeni = !t.dataset.k, ku = S.veri.kurum || {};
    const p = yeni ? { kisa: '', durum: 'İhale edilecek', rejim: '313', artis: 'Yıldönümü', kural: 'Yayımlanan (önceki ay)', il: ku.il || '', guv: 0.25, dep: 0.1, statu: 'Konaklamasız', sekil: 'Kapalı teklif usulü' } : S.pBy[t.dataset.k];
    const pct = (v) => (v == null ? null : r2(v * 100));
    const H = (x) => '<h3 class="fsec">' + x + '</h3>';
    modal(yeni ? 'Yeni orman parkı' : p.kisa + ' · park kaydı',
      (yeni ? '<p class="muted" style="margin:0;font-size:13.5px">Yıldızlı alanlar zorunlu. Kaydedilince park bütün listelere, kira zincirine, tahakkuk planına, süre takvimine, denetim ve Tebliğ eklerine kendiliğinden eklenir.</p>' : '') +
      H('Genel') + '<div class="frow">' + fi('pk_kisa', 'Kısa ad *', p.kisa) + fi('pk_durum', 'Durum *', p.durum, null, ['Kirada', 'İhale edilecek', 'Sona erdi', 'Davalık', 'Feshedildi']) + '</div>' +
      '<div class="frow one">' + fi('pk_ad', 'Resmî adı * (tescil olurundaki)', p.ad) + '</div><div class="frow">' + fi('pk_seflik', 'İşletme şefliği *', p.seflik) + fi('pk_statu', 'Statü', p.statu, null, ['Konaklamasız', 'Konaklamalı']) + '</div>' +
      '<div class="frow">' + fi('pk_alan', 'Alan (ha)', p.alan, 'number') + fi('pk_tes', 'İlk tescil tarihi', p.tescil_t, 'date') + '</div>' +
      H('Konum') + '<div class="frow">' + fi('pk_il', 'İl', p.il) + fi('pk_ilce', 'İlçe', p.ilce) + '</div><div class="frow">' + fi('pk_mah', 'Köy / mahalle', p.mahalle) + fi('pk_mev', 'Mevkii', p.mevki) + '</div>' +
      '<div class="frow">' + fi('pk_bol', 'Bölme no', p.bolme) + fi('pk_mes', 'Meşcere tipi', p.mescere) + '</div><div class="frow">' + fi('pk_rak', 'Rakım', p.rakim) + fi('pk_uz', 'İl / ilçe merkezine uzaklık', p.uzaklik) + '</div>' +
      '<div class="frow">' + fi('pk_imar', 'İmar durumu', p.imar) + fi('pk_tapu', 'Tapu bilgisi', p.tapu) + '</div><div class="frow one">' + fi('pk_koor', 'Koordinatlar (ITRF96, 3°; satır başına “nokta Y X”)', p.koordinat, 'area') + '</div>' +
      H('İşletmeci') + '<div class="frow one">' + fi('pk_isl', 'İşletmeci (ad / unvan)', p.isletmeci) + '</div><div class="frow">' + fi('pk_vkn', 'Vergi / T.C. no', p.vkn) + fi('pk_vknm', 'Muhasebedeki vergi no (eşleştirme)', p.vkn_muh) + '</div>' +
      '<div class="frow">' + fi('pk_yet', 'Yetkili adı soyadı', p.yetkili) + fi('pk_ytc', 'Yetkili T.C. no', p.yetkili_tc) + '</div><div class="frow one">' + fi('pk_adr', 'Tebligat adresi', p.adres) + '</div>' +
      '<div class="frow">' + fi('pk_tel', 'Telefon', p.tel) + fi('pk_faks', 'Faks', p.faks) + '</div><div class="frow one">' + fi('pk_ep', 'E-posta', p.eposta, 'email') + '</div>' +
      H('İhale ve sözleşme') + '<div class="frow">' + fi('pk_sekil', 'İhale usulü', p.sekil, null, Array.from(new Set(USUL.concat(p.sekil ? [p.sekil] : [])))) + fi('pk_iht', 'İhale tarihi', p.ihale_t, 'date') + '</div>' +
      '<div class="frow">' + fi('pk_ihb', 'İhale bedeli (1. yıl kira, KDV hariç)', p.ihale_b, 'number') + fi('pk_rej', 'Mevzuat', p.rejim, null, ['313', 'Eski']) + '</div>' +
      '<div class="frow">' + fi('pk_sb', 'Sözleşme tarihi', p.soz_bas, 'date') + fi('pk_se', 'Sözleşme bitişi', p.soz_bit, 'date') + '</div><div class="frow">' + fi('pk_tsl', 'Saha teslimi (Ek-9)', p.teslim, 'date') + fi('pk_tab', 'Kira dönem tabanı (boşsa sözleşme tarihi)', p.taban, 'date') + '</div>' +
      '<div class="frow">' + fi('pk_gm', 'Belgelerin GM’ye gönderimi (Md. 13)', p.gm_gonderim, 'date') + fi('pk_gt', 'Geri teslim tutanağı gönderimi', p.geri_teslim, 'date') + '</div>' +
      H('Kira, teminat ve ödeme') + '<div class="frow">' + fi('pk_art', 'Artış esası', p.artis, null, ['Yıldönümü', 'Takvim yılı']) + fi('pk_kur', 'TÜFE kuralı', p.kural, null, ['Yayımlanan (önceki ay)', 'Yıldönümü ayı', 'Aralık (önceki yıl)']) + '</div>' +
      '<div class="frow">' + fi('pk_od', 'Ödeme şekli', p.odeme, null, ['', 'Peşin', '4 taksit', '1/3 peşin + 2 taksit'].concat(p.odeme && !['Peşin', '4 taksit', '1/3 peşin + 2 taksit'].includes(p.odeme) ? [p.odeme] : [])) + fi('pk_tv', 'Ödeme günleri (AA-GG, virgülle; boşsa önceki yıl / Md. 32-3)', p.taksit_vade) + '</div>' +
      '<div class="frow">' + fi('pk_kes', 'Kesin teminat (TL; boşsa ihale × %6)', p.kesin, 'number') + fi('pk_gir', 'Giriş ücreti (varsa)', p.giris) + '</div>' +
      '<div class="frow">' + fi('pk_guv', 'Güvence (%)', pct(p.guv), 'number') + fi('pk_dep', 'Depozito (%)', pct(p.dep), 'number') + '</div>' +
      '<div class="frow">' + fi('pk_mk', 'Muhasebedeki yıllık kira (karşılaştırma)', p.muh_kira, 'number') + fi('pk_mkn', 'Muhasebe kira açıklaması', p.muh_kira_not) + '</div>' +
      H('Plan, tesisler ve yatırımlar') + '<div class="frow one">' + fi('pk_plan', 'Gelişim ve yönetim planı durumu', p.plan) + '</div><div class="frow">' + fi('pk_gyp', 'GYP onay tarihi', p.gyp_onay, 'date') + fi('pk_prj', 'Uygulama projesi / ruhsat başvurusu', p.proje_t, 'date') + '</div>' +
      '<div class="frow">' + fi('pk_yat', 'Planlanan yatırım maliyeti (TL, Md. 29)', p.yatirim, 'number') + fi('pk_ybt', 'Yatırımlar tamamlandı', p.yatirim_bitti ? 'Evet' : 'Hayır', null, ['Hayır', 'Evet']) + '</div>' +
      '<div class="frow one">' + fi('pk_tsl2', 'Teslim edilen tesisler (Ek-9, Ek-10)', p.tesisler, 'area') + fi('pk_muh', 'Muhdesat (şartname/sözleşme)', p.muhdesat, 'area') + '</div>' +
      H('Notlar') + '<div class="frow one">' + fi('pk_yap', 'Yapılacak iş (Genel durum listesine eklenir)', p.yapilacak, 'area') + fi('pk_not', 'Notlar ve kaynak', p.notlar, 'area') + fi('pk_kzn', 'Kira kontrol notu', p.kz_not, 'area') + '</div>' +
      '<div class="err" id="pkErr" role="alert"></div>',
      (yeni ? '' : '<button class="btn red" id="pkSil">Parkı sil</button>') + '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="pkOk">' + (yeni ? 'Parkı ekle' : 'Kaydet') + '</button>');
    $('#pkOk').onclick = () => {
      const er = (m) => { $('#pkErr').textContent = m; $('#pkErr').scrollIntoView({ block: 'nearest' }); };
      const k = gv('pk_kisa'); if (!k) return er('Kısa ad gerekli.');
      if (k !== p.kisa && S.pBy[k]) return er('Bu kısa adla başka park var.');
      if (!gv('pk_ad')) return er('Resmî ad gerekli.'); if (!gv('pk_seflik')) return er('İşletme şefliği gerekli.');
      const q = { durum: gv('pk_durum'), sb: gv('pk_sb'), se: gv('pk_se'), iht: gv('pk_iht'), ihb: gv('pk_ihb', 'number'), rej: gv('pk_rej'), tsl: gv('pk_tsl') };
      if (q.durum === 'Kirada' && (!q.sb || q.ihb == null || !gv('pk_isl'))) return er('Kirada park için sözleşme tarihi, ihale bedeli ve işletmeci gerekli.');
      if (q.sb && q.se && q.se <= q.sb) return er('Sözleşme bitişi başlangıçtan sonra olmalı.');
      if (q.sb && q.se && q.rej === '313' && q.se > E.addMonths(q.sb, 240)) return er('Md. 36: sözleşme süresi 20 yılı aşamaz (bitiş en geç ' + fd(E.addMonths(q.sb, 240)) + ').');
      if (q.iht && q.sb && q.iht > q.sb) return er('İhale tarihi sözleşme tarihinden sonra olamaz.');
      if (q.ihb != null && !(q.ihb > 0)) return er('İhale bedeli sıfırdan büyük olmalı.');
      const tv = gv('pk_tv'); if (tv && !tv.split(/[,;\s]+/).filter(Boolean).every((x) => /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(x))) return er('Ödeme günleri AA-GG biçiminde olmalı (ör. 01-30, 04-30).');
      const vk = gv('pk_vkn'); if (vk && !/^\d{10,11}$/.test(vk)) return er('Vergi no 10, T.C. kimlik no 11 haneli olmalı.');
      const vm = gv('pk_vknm'); if (vm && S.veri.parks.some((x) => x !== p && x.vkn_muh === vm)) return er('Bu muhasebe vergi numarası başka bir parka tanımlı; kayıtlar karışır.');
      const ihb = q.ihb, rej = q.rej;
      const yeniK = Object.assign(yeni ? {} : p, {
        kisa: k, durum: q.durum, ad: gv('pk_ad'), seflik: gv('pk_seflik'), statu: gv('pk_statu'), alan: gv('pk_alan', 'number'), tescil_t: gv('pk_tes'),
        il: gv('pk_il') || '', ilce: gv('pk_ilce') || '', mahalle: gv('pk_mah') || '', mevki: gv('pk_mev') || '', bolme: gv('pk_bol') || '', mescere: gv('pk_mes') || '', rakim: gv('pk_rak') || '',
        uzaklik: gv('pk_uz') || '', imar: gv('pk_imar') || '', tapu: gv('pk_tapu') || '', koordinat: gv('pk_koor') || '',
        isletmeci: gv('pk_isl'), vkn: vk || '', vkn_muh: vm || '', yetkili: gv('pk_yet') || '', yetkili_tc: gv('pk_ytc') || '', adres: gv('pk_adr') || '', tel: gv('pk_tel') || '', faks: gv('pk_faks') || '', eposta: gv('pk_ep') || '',
        sekil: gv('pk_sekil'), ihale_t: q.iht, ihale_b: ihb, rejim: rej, soz_bas: q.sb, soz_bit: q.se, teslim: q.tsl, taban: gv('pk_tab') || q.sb, gm_gonderim: gv('pk_gm'), geri_teslim: gv('pk_gt'),
        artis: gv('pk_art'), kural: gv('pk_kur'), odeme: gv('pk_od') || (ihb != null ? (ihb <= 150000 ? 'Peşin' : '4 taksit') : ''), taksit_vade: tv || '',
        kesin: gv('pk_kes', 'number') != null ? gv('pk_kes', 'number') : (ihb != null && yeni ? r2(ihb * 0.06) : (yeni ? null : p.kesin)), giris: gv('pk_gir') || '',
        guv: gv('pk_guv', 'number') == null ? null : gv('pk_guv', 'number') / 100, dep: gv('pk_dep', 'number') == null ? null : gv('pk_dep', 'number') / 100,
        muh_kira: gv('pk_mk', 'number'), muh_kira_not: gv('pk_mkn') || '', plan: gv('pk_plan'), gyp_onay: gv('pk_gyp'), proje_t: gv('pk_prj'), yatirim: gv('pk_yat', 'number'), yatirim_bitti: gv('pk_ybt') === 'Evet',
        tesisler: gv('pk_tsl2') || '', muhdesat: gv('pk_muh') || '', yapilacak: gv('pk_yap') || '', notlar: gv('pk_not') || '', kz_not: gv('pk_kzn') || '' });
      if (yeni) S.veri.parks.push(yeniK);
      else if (k !== t.dataset.k) parkAdTasi(t.dataset.k, k);
      modalKapat(); S.park = k; degisti(yeni ? k + ' parkı eklendi' : k + ' park kaydı güncellendi', k);
    };
    const sil = $('#pkSil'); if (sil) sil.onclick = () => { if (!confirm(p.kisa + ' parkı silinsin mi? Muhasebe satırları silinmez, “Park dışı” görünür; ek kira, vade düzeltmesi ve form kayıtları da silinir.')) return;
      S.veri.parks = S.veri.parks.filter((x) => x !== p); ['ek_kira', 'vade_duz'].forEach((k) => { S.veri[k] = (S.veri[k] || []).filter((x) => x.park !== p.kisa); }); if (S.veri.ekler) delete S.veri.ekler[p.kisa];
      S.park = null; modalKapat(); degisti(p.kisa + ' parkı silindi', p.kisa); };
  };
  // kısa ad değişince bağlı bütün kayıtlar yeni ada taşınır
  function parkAdTasi(eski, yeni) {
    const V = S.veri;
    ['ek_kira', 'vade_duz', 'denetim', 'plan', 'takip', 'defter', 'kay_tesis'].forEach((k) => (V[k] || []).forEach((x) => { if (x.park === eski) x.park = yeni; }));
    const pk = V.parks.find((x) => x.kisa === yeni); if (pk && !pk.r10) pk.r10 = eski;
    if (V.ekler && V.ekler[eski]) { V.ekler[yeni] = V.ekler[eski]; delete V.ekler[eski]; }
    V.muhasebe.forEach((x) => { if (x.oto && x.oto.split('|')[0] === eski) x.oto = yeni + '|' + x.oto.split('|')[1]; });
  }
  AKSIYON.tahsilat = (t) => {
    if (!S.owner) return yoneticiGiris();
    const it = S.esl.items.find((x) => x.id === +t.dataset.kalem); if (!it) return;
    const kalan = r2(it.tutar - it.odenen);
    modal('Tahsilat ekle · ' + it.park, '<div class="kv"><span>Kalem</span><span>' + esc(it.grup) + ' · ' + esc(it.tur) + ' · vade ' + fd(it.duz || it.vade) + '</span></div><div class="kv"><span>Kalan</span><span class="n">' + tl(kalan) + '</span></div>' +
      (it.odemeler.length ? '<div class="kv"><span>Önceki ödemeler</span><span>' + it.odemeler.map((o) => fd(o.tarih) + ' · ' + tl(o.tutar)).join('<br>') + '</span></div>' : '') +
      '<div class="frow">' + fi('th_t', 'Tahsilat tarihi', S.rapor, 'date') + fi('th_tu', 'Tutar (TL)', kalan, 'number') + '</div><div class="frow">' + fi('th_y', 'Yevmiye / fiş no', '', 'number') + fi('th_a', 'Açıklama', 'Tahsilat (elle)') + '</div>' +
      '<p class="muted" style="margin:0;font-size:13px">Kayıt muhasebe dökümüne “elle eklenen” satır olarak yazılır ve eşleştirmede bu kaleme dağıtılır. Yeni döküm yüklendiğinde aynı tahsilat dökümde varsa bu satırı silin.</p>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="thOk">Ekle</button>');
    $('#thOk').onclick = () => {
      const tar = gv('th_t'), tu = gv('th_tu', 'number'), yev = gv('th_y', 'number');
      if (!tar || !(tu > 0) || !yev) { toast('Tarih, tutar ve yevmiye no gerekli.', true); return; }
      if (tar < it.olusma) { toast('Tahsilat tarihi tahakkuk tarihinden (' + fd(it.olusma) + ') önce olamaz.', true); return; }
      const src = S.veri.muhasebe[it.row];
      S.veri.muhasebe.push({ kaynak: src.kaynak, yev: yev, tarih: tar, hesap: it.hesap, vkn: it.vkn, musteri: src.musteri, vade: it.vade, neden: 'Elle tahsilat', aciklama: gv('th_a') || 'Tahsilat (elle)',
        borc: 0, alacak: r2(tu), borc_h: '102', alacak_h: src.kaynak, not_: 'Elle eklendi ' + fd(bugun()), ek: true });
      modalKapat(); degisti('Tahsilat eklendi');
    };
  };
  AKSIYON.tahakkuk = (t) => {
    if (!S.owner) return yoneticiGiris();
    const p = S.pBy[t.dataset.k]; if (!p.vkn_muh) { toast('Önce parkın muhasebe VKN’sini girin (Park bilgilerini düzenle).', true); return; }
    modal('Yeni tahakkuk · ' + p.kisa, '<div class="frow">' + fi('tk_tur', 'Tür', 'Kira', null, ['Kira', 'KDV', 'Ağaçlandırma', 'Vergi/fon']) + fi('tk_tu', 'Tutar (TL)', '', 'number') + '</div>' +
      '<div class="frow">' + fi('tk_t', 'Tahakkuk (fiş) tarihi', S.rapor, 'date') + fi('tk_v', 'Vade tarihi', '', 'date') + '</div><div class="frow">' + fi('tk_y', 'Yevmiye / fiş no', '', 'number') + fi('tk_a', 'Açıklama', '') + '</div>' +
      '<p class="muted" style="margin:0;font-size:13px">127 hesabına “ek tahakkuk” olarak işlenir (kira 127.01.03; KDV, ağaçlandırma, vergi/fon 127.01.06).</p>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="tkOk">Ekle</button>');
    $('#tkOk').onclick = () => {
      const tur = gv('tk_tur'), tu = gv('tk_tu', 'number'), v = gv('tk_v'), tar = gv('tk_t'), yev = gv('tk_y', 'number');
      if (!(tu > 0) || !v || !tar || !yev) { toast('Tutar, tarih, vade ve yevmiye no gerekli.', true); return; }
      const a = (gv('tk_a') || '') + (tur === 'KDV' ? ' KDV' : tur === 'Ağaçlandırma' ? ' ağaçlandırma' : tur === 'Vergi/fon' ? ' fon' : '');
      S.veri.muhasebe.push({ kaynak: '127', yev, tarih: tar, hesap: tur === 'Kira' ? '127.01.03' : '127.01.06', vkn: p.vkn_muh, musteri: p.isletmeci || p.kisa, vade: v, neden: 'Elle tahakkuk',
        aciklama: a.trim() || tur, borc: r2(tu), alacak: 0, borc_h: '127', alacak_h: '600, 391', not_: 'Elle eklendi ' + fd(bugun()), ek: true });
      modalKapat(); degisti('Tahakkuk eklendi');
    };
  };
  AKSIYON.vadeDuz = (t) => {
    if (!S.owner) return yoneticiGiris();
    const it = t.dataset.kalem !== '' ? S.esl.items.find((x) => x.id === +t.dataset.kalem) : null;
    modal('Vade düzeltme kuralı', '<div class="frow">' + fi('vd_p', 'Park', it ? it.park : S.park, null, S.veri.parks.map((p) => p.kisa)) + fi('vd_t', 'Tür', it ? it.tur : '', null, ['', 'Kira', 'KDV', 'Ağaçlandırma', 'Vergi/fon']) + '</div>' +
      '<div class="frow">' + fi('vd_mv', 'Muhasebe vadesi (boşsa vadesiz kalemler)', it ? it.vade : '', 'date') + fi('vd_g', 'Grup başlangıcı', it ? it.grup.split(' ')[0] : '2026', null, null) + '</div>' +
      '<div class="frow">' + fi('vd_y', 'Esas vade (resmî yazıdaki)', it ? (it.duz || it.vade) : '', 'date') + '</div><div class="frow one">' + fi('vd_n', 'Dayanak (yazı tarihi ve sayısı)', '', 'area') + '</div>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="vdOk">Ekle</button>');
    $('#vdOk').onclick = () => {
      const y = gv('vd_y'), n = gv('vd_n'); if (!y || !n) { toast('Esas vade ve dayanak gerekli.', true); return; }
      S.veri.vade_duz.push({ park: gv('vd_p'), tur: gv('vd_t') || null, mv: gv('vd_mv'), grup: gv('vd_g') || '', yeni: y, not_: n, haric_yev: [] });
      modalKapat(); degisti('Vade düzeltmesi eklendi');
    };
  };
  AKSIYON.vadeSil = (t) => { if (!confirm('Bu vade düzeltmesi silinsin mi?')) return; S.veri.vade_duz.splice(+t.dataset.i, 1); degisti('Vade düzeltmesi silindi'); };
  AKSIYON.ekKiraEkle = (t) => {
    if (!S.owner) return yoneticiGiris();
    const z = S.ozBy[t.dataset.k].kk;
    modal('Ek tesis kirası · ' + t.dataset.k, '<p class="muted" style="margin:0">Revize planla eklenen ek tesisin yıllık kirası, onaylandığı dönemin satırına yazılır ve bir sonraki dönemin tabanına eklenir (Md. 30/1).</p><div class="frow">' +
      fi('ek_d', 'Dönem no', z.donem, 'number') + fi('ek_t', 'Yıllık ek kira (TL)', '', 'number') + '</div><div class="frow one">' + fi('ek_n', 'Dayanak (onay tarihi, sayı)', '') + '</div>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="ekOk">Ekle</button>');
    $('#ekOk').onclick = () => { const d = gv('ek_d', 'number'), tu = gv('ek_t', 'number'); if (!(d >= 1) || !(tu > 0)) { toast('Dönem ve tutar gerekli.', true); return; }
      S.veri.ek_kira.push({ park: t.dataset.k, donem: Math.round(d), tutar: r2(tu), not_: gv('ek_n') || '' }); modalKapat(); degisti('Ek kira eklendi'); };
  };
  AKSIYON.ekKiraSil = (t) => { if (!confirm('Bu ek kira silinsin mi?')) return; S.veri.ek_kira.splice(+t.dataset.i, 1); degisti('Ek kira silindi'); };
  AKSIYON.defterEkle = () => {
    if (!S.owner) return yoneticiGiris();
    modal('İşlem defterine kayıt', '<div class="frow">' + fi('df_t', 'Tarih', S.rapor, 'date') + fi('df_p', 'Park', S.park, null, S.veri.parks.map((p) => p.kisa).concat(['14 park', 'Tüm parklar'])) + '</div>' +
      '<div class="frow">' + fi('df_k', 'Konu', 'Yazışma, giden', null, KONU) + fi('df_tu', 'Tutar (varsa)', '', 'number') + '</div><div class="frow one">' + fi('df_a', 'Ne yapıldı, sonuç', '', 'area') + fi('df_b', 'Belge / sayı', '') + '</div>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="dfOk">Kaydet</button>');
    $('#dfOk').onclick = () => { const a = gv('df_a'); if (!a) { toast('Açıklama gerekli.', true); return; }
      const id = Math.max(0, ...S.veri.defter.map((x) => x.id)) + 1;
      S.veri.defter.push({ id, tarih: gv('df_t'), park: gv('df_p'), konu: gv('df_k'), aciklama: a, belge: gv('df_b') || '—', tutar: gv('df_tu', 'number') }); modalKapat(); degisti('Defter kaydı eklendi'); };
  };
  AKSIYON.defterSil = (t) => { if (!confirm('Bu defter kaydı silinsin mi?')) return; S.veri.defter = S.veri.defter.filter((x) => x.id !== +t.dataset.id); degisti('Defter kaydı silindi'); };
  AKSIYON.kayitSil = (t) => { const x = S.esl.rows.find((r) => r.id === +t.dataset.id); if (!x || !x.ek) return; if (!confirm('Elle eklenen satır silinsin mi? (yev. ' + x.yev + ')')) return; S.veri.muhasebe.splice(+t.dataset.id, 1); degisti('Satır silindi'); };
  AKSIYON.kayitEkle = () => {
    if (!S.owner) return yoneticiGiris();
    modal('Elle muhasebe kaydı', '<div class="frow">' + fi('mk_k', 'Hesap', '127', null, ['120', '127']) + fi('mk_h', 'Hesap no', '127.01.03') + '</div><div class="frow">' + fi('mk_y', 'Yevmiye no', '', 'number') + fi('mk_t', 'Yevmiye tarihi', S.rapor, 'date') + '</div>' +
      '<div class="frow">' + fi('mk_vkn', 'Vergi no (muhasebe)', (S.pBy[S.park] || {}).vkn_muh) + fi('mk_v', 'Vade', '', 'date') + '</div><div class="frow">' + fi('mk_b', 'Borç', '', 'number') + fi('mk_a', 'Alacak', '', 'number') + '</div>' +
      '<div class="frow">' + fi('mk_bh', 'Borç hesapları', '127') + fi('mk_ah', 'Alacak hesapları', '600, 391') + '</div><div class="frow one">' + fi('mk_ac', 'Açıklama', '') + fi('mk_n', 'Not / kaynak', '') + '</div>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="mkOk">Ekle</button>');
    $('#mkOk').onclick = () => { const yev = gv('mk_y', 'number'), t = gv('mk_t'); if (!yev || !t) { toast('Yevmiye no ve tarih gerekli.', true); return; }
      const p = S.veri.parks.find((x) => x.vkn_muh === gv('mk_vkn'));
      S.veri.muhasebe.push({ kaynak: gv('mk_k'), yev, tarih: t, hesap: gv('mk_h') || '', vkn: gv('mk_vkn') || '', musteri: p ? (p.isletmeci || p.kisa) : '', vade: gv('mk_v'), neden: 'Elle kayıt', aciklama: gv('mk_ac') || '',
        borc: r2(gv('mk_b', 'number') || 0), alacak: r2(gv('mk_a', 'number') || 0), borc_h: gv('mk_bh') || '', alacak_h: gv('mk_ah') || '', not_: (gv('mk_n') || 'Elle eklendi') + ' ' + fd(bugun()), ek: true });
      modalKapat(); degisti('Muhasebe satırı eklendi'); };
  };
  AKSIYON.csvYukle = () => {
    if (!S.owner) return yoneticiGiris();
    modal('Yeni muhasebe dökümü', '<p style="margin:0;line-height:1.5">Muhasebe sisteminden alınan <b>120.99</b> ve/veya <b>127</b> hesap dökümünü (noktalı virgül ayraçlı CSV) seçin. Seçilen hesabın eski döküm satırları yenisiyle değişir; elle eklenen satırlar korunur.</p>' +
      '<div class="frow">' + fi('cv_k', 'Hesap', '120', null, ['120', '127']) + fi('cv_t', 'Döküm (veri) tarihi', S.rapor, 'date') + '</div><div class="f"><label for="cv_f">CSV dosyası</label><input class="fld" id="cv_f" type="file" accept=".csv,text/csv"></div><div id="cv_on" class="muted" style="font-size:13.5px"></div>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="cvOk" disabled>Yükle ve eşleştir</button>');
    let rows = null;
    $('#cv_f').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const buf = await f.arrayBuffer(); let txt = new TextDecoder('utf-8').decode(buf); if (txt.includes('�')) txt = new TextDecoder('windows-1254').decode(buf);
      rows = E.csvOku(txt, gv('cv_k'));
      const b = sumOf(rows, (x) => x.borc - x.alacak);
      $('#cv_on').innerHTML = rows.length ? rows.length + ' satır okundu · bakiye ' + tl(b) + ' · ilk satır yev. ' + rows[0].yev + ' (' + fd(rows[0].tarih) + ')' : '<span class="red-t">Satır okunamadı; dosya biçimini kontrol edin.</span>';
      $('#cvOk').disabled = !rows.length;
    };
    $('#cvOk').onclick = () => { const k = gv('cv_k'); if (!rows || !rows.length) return; rows.forEach((x) => { x.kaynak = k; });
      S.veri.muhasebe = S.veri.muhasebe.filter((x) => x.kaynak !== k || x.ek).concat(rows); S.veri.meta.muhasebe_tarihi = gv('cv_t') || S.rapor;
      const gercek = new Set(rows.filter((x) => x.kaynak === '120' && x.borc > 0 && (x.alacak_h || '').includes('600')).map((x) => x.vkn + '|' + E.year(x.tarih)));
      const once = S.veri.muhasebe.length; S.veri.muhasebe = S.veri.muhasebe.filter((x) => !(x.oto && gercek.has(x.vkn + '|' + x.oto.split('|')[1])));
      const dus = once - S.veri.muhasebe.length;
      modalKapat(); degisti(k + ' dökümü yüklendi ve eşleştirildi (' + rows.length + ' satır' + (dus ? '; muhasebede karşılığı gelen ' + dus + ' program tahakkuku satırı kaldırıldı' : '') + ')'); };
  };
  AKSIYON.tufeGir = () => {
    const s = sonTufeAyi(); let y = s ? s[0] : E.year(S.rapor), m = s ? s[1] + 1 : 1; if (m > 12) { m = 1; y++; }
    modal('TÜFE değeri (geçici)', '<p class="muted" style="margin:0">TÜİK bülteninde “on iki aylık ortalamalara göre” yazan oranı girin. Resmî veri otomatik geldiğinde bu değerin yerine geçer.</p><div class="frow">' +
      fi('tf_a', 'Ay (YYYY-AA)', y + '-' + String(m).padStart(2, '0')) + fi('tf_v', 'Oran (%)', '', 'number') + '</div>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="tfOk">Kaydet</button>');
    $('#tfOk').onclick = () => { const a = gv('tf_a'), v = gv('tf_v', 'number'); if (!/^\d{4}-\d\d$/.test(a || '') || !(v > 0 && v < 500)) { toast('Ay ve oran gerekli.', true); return; }
      S.veri.tufe_manuel = S.veri.tufe_manuel || {}; S.veri.tufe_manuel[a] = r2(v * 100) / 10000; modalKapat(); degisti('TÜFE ' + a + ' girildi'); };
  };
  AKSIYON.denDuzenle = (t) => {
    const d = (S.veri.denetim || []).find((x) => x.park === t.dataset.k); if (!d) return;
    const keys = S.veri.den_keys;
    modal('Ek-10 düzenle · ' + d.park, fi('dn_donem', 'Dönem', d.donem) + fi('dn_t', 'Rapor tarihi', d.tarih, 'date') + keys.map((k, i) => fi('dn_' + i, k, d[k], 'area')).join('') + fi('dn_oz', 'Kısa kanaat (listelerde)', d.ozet, 'area') + fi('dn_im', 'Komisyon', d.imza, 'area'),
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="dnOk">Uygula</button>');
    $('#dnOk').onclick = () => { d.donem = gv('dn_donem') || d.donem; d.tarih = gv('dn_t') || d.tarih; keys.forEach((k, i) => { d[k] = gv('dn_' + i) || ''; }); d.ozet = gv('dn_oz') || ''; d.imza = gv('dn_im') || ''; modalKapat(); degisti('Denetim raporu güncellendi'); };
  };
  AKSIYON.kurumDuzenle = () => {
    const k = S.veri.kurum; const F = KURUMF;
    modal('Kurum bilgileri', F.map((f) => fi('ku_' + f[0], f[1], k[f[0]])).join(''), '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="kuOk">Uygula</button>');
    $('#kuOk').onclick = () => { const ib = (gv('ku_iban') || '').replace(/\s+/g, ''); if (ib && !/^TR\d{24}$/i.test(ib)) { toast('IBAN TR ile başlayan 26 karakter olmalı.', true); return; }
      F.forEach((f) => { k[f[0]] = gv('ku_' + f[0]) || ''; }); modalKapat(); degisti('Kurum bilgileri güncellendi'); };
  };
  const KURUMF = [['bolge', 'Bölge müdürlüğü'], ['isletme', 'İşletme müdürlüğü'], ['mudur', 'İşletme müdürü'], ['sube', 'Birim'], ['ilgili', 'İlgili personel (ad, unvan)'], ['il', 'İl'], ['adres', 'Adres'],
    ['tel', 'Telefon'], ['faks', 'Faks'], ['eposta', 'E-posta'], ['kep', 'KEP'], ['banka', 'Banka'], ['sube_banka', 'Banka şubesi'], ['iban', 'IBAN']];
  AKSIYON.sifreDegis = () => {
    modal('Erişim parolasını değiştir', '<p style="margin:0;line-height:1.5">Yeni parola kaydedildikten sonra linki açanlar yeni parolayı girmelidir. Eski parolayı bilenler artık açamaz. En az 10 karakter.</p>' + fi('pw1', 'Yeni parola', '', 'password') + fi('pw2', 'Yeni parola (tekrar)', '', 'password'),
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="pwOk">Değiştir ve kaydet</button>');
    $('#pwOk').onclick = async () => { const a = $('#pw1').value, b = $('#pw2').value; if (a.length < 10 || a !== b) { toast('Parolalar aynı ve en az 10 karakter olmalı.', true); return; }
      if (a === S.yPw) { toast('Erişim parolası yönetici parolasıyla aynı olamaz.', true); return; }
      toast('Tebliğ ve ek şablonları yeni parolayla şifreleniyor…');
      try {
        const buf = await K.cozBin(await getText(CFG.teblig + '?t=' + Date.now(), true), S.pw);
        await dosyaYaz(CFG.teblig, await K.sifreleBin(new Uint8Array(buf), a), 'Tebliğ dosyası yeni parolayla şifrelendi');
        const ekj = await K.coz(await getText(CFG.ekler + '?t=' + Date.now(), true), S.pw);
        await dosyaYaz(CFG.ekler, await K.sifrele(ekj, a), 'Ek şablonları yeni parolayla şifrelendi');
      } catch (e) { toast('Şifreli dosyalar güncellenemedi: ' + e.message, true); return; }
      S.pw = a; S.tebligUrl = null; if (ls.get('op_pw')) ls.set('op_pw', a); modalKapat(); degisti('Erişim parolası değiştirildi'); await kaydet(); };
  };
  AKSIYON.yPwDegis = () => {
    if (!S.owner) return yoneticiGiris();
    modal('Yönetici parolasını değiştir', fi('yp1', 'Yeni yönetici parolası (en az 8 karakter)', '', 'password') + fi('yp2', 'Tekrar', '', 'password'),
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="ypOk">Değiştir</button>');
    $('#ypOk').onclick = async () => { const a = $('#yp1').value, b = $('#yp2').value;
      if (a.length < 8 || a !== b) { toast('Parolalar aynı ve en az 8 karakter olmalı.', true); return; } if (a === S.pw) { toast('Erişim parolasıyla aynı olamaz.', true); return; }
      try { await dosyaYaz(CFG.yonetici, await K.sifrele({ token: S.token, kim: S.kim, t: new Date().toISOString() }, a), 'Yönetici parolası değiştirildi (' + S.kim + ')'); S.yPw = a; modalKapat(); toast('Yönetici parolası değiştirildi.'); }
      catch (e) { toast('Değiştirilemedi: ' + e.message, true); } };
  };
  AKSIYON.anahtarYenile = () => kurulum('yenile');
  AKSIYON.gzGir = () => {
    if (!S.owner) return yoneticiGiris();
    modal('Gecikme zammı oranı (elle)', '<p class="muted" style="margin:0">Yalnız Resmî Gazete’de yayımlanmış ve otomatik taramada henüz görünmeyen bir karar için kullanın. Kayıt işlem geçmişine yazılır; aynı tarihli resmî kayıt gelince o geçerli olur.</p><div class="frow">' +
      fi('gz_t', 'Yürürlük tarihi', S.rapor, 'date') + fi('gz_o', 'Aylık oran (%)', '', 'number') + '</div><div class="frow one">' + fi('gz_n', 'Dayanak (RG tarihi, karar sayısı)', '') + '</div>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="gzOk">Kaydet</button>');
    $('#gzOk').onclick = () => { const t = gv('gz_t'), o = gv('gz_o', 'number'), n = gv('gz_n'); if (!t || !(o > 0 && o < 20) || !n) { toast('Tarih, oran ve dayanak gerekli.', true); return; }
      S.veri.gz_manuel.push({ tarih: t, oran: r2(o * 100) / 10000, not_: n, kim: S.kim, kayit: new Date().toISOString() }); modalKapat(); degisti('Gecikme zammı oranı elle eklendi: ' + fd(t) + ' aylık %' + o); };
  };
  AKSIYON.gzSil = (t) => { if (!confirm('Bu elle girilmiş oran silinsin mi?')) return; const x = S.veri.gz_manuel.splice(+t.dataset.i, 1)[0]; degisti('Elle girilen gecikme zammı oranı silindi: ' + fd(x.tarih)); };
  AKSIYON.tema = (t) => { const v = t.dataset.v; if (v === 'oto') { ls.del('op_tema'); document.documentElement.removeAttribute('data-tema'); } else { ls.set('op_tema', v); document.documentElement.setAttribute('data-tema', v); } sayfaCiz(); };
  AKSIYON.yedekIndir = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S.veri, null, 1)], { type: 'application/json' })); a.download = 'orman_parklari_veri_' + S.rapor + '.json'; a.click(); toast('Yedek indirildi. Bu dosya şifresizdir; güvenli yerde saklayın.'); };
  AKSIYON.yedekYukle = () => {
    modal('Yedekten geri yükle', '<p style="margin:0">Daha önce indirilen JSON yedeğini seçin. Mevcut veriler yedektekiyle değişir (kaydetmeden önce kontrol edebilirsiniz).</p><input class="fld" id="yd_f" type="file" accept=".json,application/json">',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button>');
    $('#yd_f').onchange = async (e) => { try { const j = JSON.parse(await e.target.files[0].text()); if (!j.parks || !j.muhasebe) throw new Error('Geçersiz yedek'); S.veri = j; modalKapat(); degisti('Yedek yüklendi'); } catch (er) { toast(er.message, true); } };
  };
  AKSIYON.muhTarih = () => {
    modal('Muhasebe veri tarihi', fi('mt', 'Döküm tarihi', S.veri.meta.muhasebe_tarihi, 'date'), '<button class="btn pri" id="mtOk">Uygula</button>');
    $('#mtOk').onclick = () => { S.veri.meta.muhasebe_tarihi = gv('mt') || S.veri.meta.muhasebe_tarihi; modalKapat(); degisti('Tarih güncellendi'); };
  };

  // Tebliğ PDF'i de şifreli tutulur; tarayıcıda çözülüp istenen sayfada açılır
  AKSIYON.teblig = async (t) => {
    const pg = t.dataset.pg || '1', w = window.open('', '_blank');
    try {
      if (!S.tebligUrl) { toast('Tebliğ açılıyor…'); const enc = await getText(CFG.teblig); const buf = await K.cozBin(enc, S.pw); S.tebligUrl = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' })); }
      const u = S.tebligUrl + '#page=' + pg;
      if (w) w.location.href = u; else location.href = u;
    } catch (e) { if (w) w.close(); toast('Tebliğ açılamadı: ' + e.message, true); }
  };
  // =============== EK FORMLARI, TAHAKKUK, TEBLİĞ ===============
  async function ekPaket() {
    if (S.ekB) return S.ekB;
    const enc = await getText(CFG.ekler + '?s=' + encodeURIComponent((S.veri.meta && S.veri.meta.ekler_surum) || '1'));
    S.ekB = await K.coz(enc, S.pw);
    return S.ekB;
  }
  const EKAD = { 'Ek-1': 'Orman Parkı Teklif Raporu', 'Ek-2': 'Orman Parkı Bilgi Formu', 'Ek-3': 'Kira Bedeli Tespit Tutanağı', 'Ek-4': 'Gelişim ve Yönetim Planı Teknik Şartnamesi',
    'Ek-5': 'Uygulama Projesi Onay Sayfası', 'Ek-6': 'Sınır Değişikliği Teklif Raporu', 'Ek-7': 'Statü Değişikliği Teklif Raporu', 'Ek-8': 'İptal Teklif Raporu',
    'Ek-9': 'Saha Teslim Tesellüm Tutanağı', 'Ek-10': 'Denetim Raporu', 'Ek-11': 'Tip Şartname', 'Ek-12': 'Teklif Mektubu', 'Ek-13': 'İş Ortaklığı Beyannamesi',
    'Ek-14': 'Geçici Teminat Mektubu', 'Ek-15': 'Kesin Teminat Mektubu', 'Ek-16': 'İhale İlanı Örneği', 'Ek-17': 'Tip Sözleşme', 'Ek-18': 'Devir Taahhütnamesi', 'R10': 'İmzalı Ek-10 Denetim Raporu' };
  function odemeMetni(p) {
    const y = E.year(S.rapor);
    const it = S.esl.items.filter((x) => x.park === p.kisa && x.grup === y + ' tahakkuku' && x.tur === 'Kira').sort((a, b) => ((a.duz || a.vade) < (b.duz || b.vade) ? -1 : 1));
    const L = it.length ? it.map((x) => ({ v: x.duz || x.vade, t: x.tutar })) : (((S.plan[y] || {})[p.kisa] || {}).vadeler || []).map((x) => ({ v: x.vade, t: x.kira }));
    if (!L.length) return '';
    const sek = L.length === 4 ? 'Üçer aylık dört eşit taksit (Tebliğ Md. 32/3)' : L.length === 1 ? 'Tek seferde peşin' : L.length + ' taksit';
    return 'Ödeme şekli: ' + sek + '\n' + L.map((x, i) => (L.length > 1 ? (i + 1) + '. Taksit: ' : 'Vade: ') + fd(x.v) + ' – ' + tl(x.t) + ' ₺').join('\n');
  }
  function ekCtx(p) {
    const y = E.year(S.rapor);
    const r10 = {};
    const m = S.ekB && S.ekB.rapor10[p.r10 || p.kisa];
    if (m) m.cells.forEach((c) => { if (c.slot && c.t) r10[EK.norm(c.lab)] = c.t; });
    return { p, ku: S.veri.kurum || {}, plan: (S.plan[y] || {})[p.kisa] || {}, rapor: S.rapor, odemeDonem: odemeMetni(p), r10 };
  }
  function elDeger(park, ek) { const e = S.veri.ekler || {}; return (e[park] && e[park][ek]) || {}; }
  AKSIYON.formAc = (t) => { S.form = { ek: t.dataset.e, duzenle: false }; S.fOnizle = false; if (t.dataset.k) S.park = t.dataset.k; if (location.hash === '#/form') sayfaCiz(); else location.hash = '#/form'; };
  AKSIYON.formBilgi = (t) => { formBilgi(t.dataset.e); };
  SAYFA.form = function () {
    const f = S.form || (S.form = { ek: 'Ek-10' }); if (!EKAD[f.ek]) f.ek = 'Ek-10'; const p = S.pBy[S.park];
    const docx = ['Ek-11', 'Ek-16', 'Ek-17'].includes(f.ek), r10 = f.ek === 'R10';
    const nm = f.ek === 'R10' ? 'Ek-10' : f.ek;
    const ekler = Object.keys(EKAD).filter((k) => k !== 'R10');
    return mpick() + '<div class="pagehead ftool"><div><h1>' + esc(r10 ? 'İmzalı Ek-10 · ' + p.kisa : f.ek + ' · ' + EKAD[f.ek]) + '</h1><p>' +
      (r10 ? 'Komisyonun imzaladığı rapor, orijinal düzeniyle. Yönetici yeni dönem tespitlerini doğrudan hücrelere yazabilir.' :
        'Orijinal şablon. Park, sözleşme, kurum ve hesap bilgileri kayıtlardan gelir; boş kalan alanları ' + (docx ? 'park kaydından tamamlayın.' : 'yönetici doğrudan form üzerinde doldurur.')) + '</p></div></div>' +
      '<div class="ftool frow2"><select id="fEk" class="fld" aria-label="Ek seç">' + ekler.map((k) => '<option value="' + k + '"' + (k === f.ek ? ' selected' : '') + '>' + k + ' · ' + EKAD[k] + '</option>').join('') +
      (S.ekB === null || (S.ekB && S.ekB.rapor10[p.r10 || p.kisa]) ? '<option value="R10"' + (r10 ? ' selected' : '') + '>İmzalı Ek-10 raporu (' + esc(p.kisa) + ')</option>' : '') + '</select>' +
      '<button class="btn pri" data-a="fYazdir">Yazdır / PDF</button>' + (docx ? '<button class="btn" data-a="fWord">Word indir</button>' : '<button class="btn" data-a="fExcel">Excel indir</button>') +
      (!docx ? '<button class="btn own-only" data-a="fDuzenle">' + (f.duzenle ? 'Düzenlemeyi bitir' : 'Form üzerinde düzenle') + '</button><button class="btn own-only" data-a="fSifirla">Elle girilenleri sil</button>' : '') +
      '<button class="btn own-only" data-a="parkDuzenle" data-k="' + esc(p.kisa) + '">Park bilgilerini düzenle</button>' +
      '<button class="btn" data-a="teblig" data-pg="' + (EKSAYFA[nm] || 1) + '">Tebliğdeki asıl form</button></div>' +
      '<div class="ftool eks-leg"><span><i class="lg-oto"></i>Kayıtlardan otomatik</span><span><i class="lg-el"></i>Elle girilen</span><span><i class="lg-ip"></i>Doldurulacak alan</span><span id="fEksik"></span></div>' +
      '<div id="ekAlan" class="ekalan"><div class="empty"><span class="spin"></span> Şablon açılıyor…</div></div>';
  };
  AFTER.form = async () => {
    const sel = $('#fEk'); if (sel) sel.onchange = (e) => { S.form = { ek: e.target.value, duzenle: false }; S.fOnizle = false; sayfaCiz(); };
    try { await ekPaket(); } catch (e) { $('#ekAlan').innerHTML = '<div class="alert red">Ek şablonları açılamadı: ' + esc(e.message) + '</div>'; return; }
    if (S.page !== 'form') return;
    const f = S.form, p = S.pBy[S.park];
    if (f.ek === 'R10' && !S.ekB.rapor10[p.r10 || p.kisa]) { S.form.ek = 'Ek-10'; sayfaCiz(); return; }
    if (['Ek-11', 'Ek-16', 'Ek-17'].includes(f.ek)) return wordGoster(f.ek, p);
    const m = f.ek === 'R10' ? S.ekB.rapor10[p.r10 || p.kisa] : S.ekB.sheets[f.ek];
    const F = EK.alanlar(ekCtx(p)), el = elDeger(p.kisa, f.ek);
    const V = EK.degerler(f.ek === 'R10' ? 'R10' : f.ek, m, F, el, S.rapor);
    S.fV = { m, V, F };
    const kutu = $('#ekAlan');
    kutu.innerHTML = EK.ciz(f.ek, m, V, { duzenle: !!(f.duzenle && S.owner) });
    sigdir(kutu, m);
    const eks = EK.eksikler(m, V);
    $('#fEksik').innerHTML = eks.length ? '<b class="amb-t">' + eks.length + ' alan boş:</b> ' + esc(Array.from(new Set(eks.map((x) => x.lab))).slice(0, 8).join(', ')) + (eks.length > 8 ? '…' : '') : (m.dolu ? '' : '<b class="ok-t">Kayıtlardan gelen bütün alanlar dolu.</b>');
    sayfaBoyutu(m);
    if (f.duzenle && S.owner) {
      kutu.addEventListener('focusout', (ev) => { const td = ev.target.closest('td[data-ad]'); if (td) hucreKaydet(td); });
      kutu.addEventListener('click', (ev) => { const td = ev.target.closest('td[data-cb]'); if (td) { const a = td.dataset.ad, now = S.fV.V[a].v === 'True' ? 'False' : 'True'; ekYaz(a, now); S.fV.V[a] = { v: now, k: 'el' }; td.querySelector('.eks-cb').textContent = now === 'True' ? '☒' : '☐'; } });
      kutu.addEventListener('focusin', (ev) => { const td = ev.target.closest('td[data-ad]'); if (td && td.querySelector('.eks-ip')) td.textContent = ''; });
    }
  };
  function sigdir(kutu, m) {
    const W = EK.genislik(m), k = kutu.querySelector('.eks-kagit'); if (!k) return;
    const av = kutu.clientWidth - 2;
    k.style.zoom = av < W ? (av / W).toFixed(3) : '';
  }
  function sayfaBoyutu(m) {
    let st = $('#pgsz'); if (!st) { st = document.createElement('style'); st.id = 'pgsz'; document.head.appendChild(st); }
    const k = m.kenar || [0.7, 0.7, 0.75, 0.75], W = EK.genislik(m);
    const pw = ((m.yatay ? 11.69 : 8.27) - k[0] - k[1]) * 96;
    const z = W > pw ? pw / W : (m.scale && m.scale < 100 && !m.fit ? m.scale / 100 : 1);
    st.textContent = '@media print{@page{size:A4 ' + (m.yatay ? 'landscape' : 'portrait') + ';margin:' + k[2] + 'in ' + k[1] + 'in ' + k[3] + 'in ' + k[0] + 'in}' +
      '.ekalan .eks-kagit{zoom:' + z.toFixed(3) + ' !important;margin:' + (m.ortala ? '0 auto' : '0') + '}}';
  }
  function ekYaz(a, v) {
    const f = S.form, p = S.park; S.veri.ekler = S.veri.ekler || {};
    const E1 = S.veri.ekler[p] = S.veri.ekler[p] || {}; const D = E1[f.ek] = E1[f.ek] || {};
    if (v == null) delete D[a]; else D[a] = v;
    S.dirty++;
    const anahtar = p + '|' + f.ek;
    if (S._ekLog !== anahtar) { S._ekLog = anahtar; S.veri.gecmis.push({ t: new Date().toISOString(), kim: S.kim || 'Yönetici', is: f.ek + ' formu düzenlendi', park: p }); }
    kabukDurum();
  }
  function hucreKaydet(td) {
    const a = td.dataset.ad, eski = S.fV.V[a] || { v: '', k: 'sabit' };
    const yeni = td.innerText.replace(/ /g, ' ').replace(/\n+$/, '');
    if (td.dataset.cb) return;
    if (eski.k === 'ipucu' && yeni === '') { td.innerHTML = '<span class="eks-ip">' + esc(eski.ipucu) + '</span>'; return; }
    if (yeni === eski.v) return;
    // otomatik değerine dönülürse elle kaydı kaldır
    const el = elDeger(S.park, S.form.ek);
    const Vo = EK.degerler(S.form.ek === 'R10' ? 'R10' : S.form.ek, S.fV.m, S.fV.F, Object.fromEntries(Object.entries(el).filter(([k]) => k !== a)), S.rapor)[a] || { v: '' };
    if (yeni === Vo.v) { ekYaz(a, null); S.fV.V[a] = Vo; td.className = td.className.replace(/k-\w+/, 'k-' + Vo.k); return; }
    ekYaz(a, yeni); S.fV.V[a] = { v: yeni, k: 'el' }; td.className = td.className.replace(/k-\w+/, 'k-el');
  }
  AKSIYON.fDuzenle = () => { if (!S.owner) return yoneticiGiris(); S.form.duzenle = !S.form.duzenle; sayfaCiz(); };
  AKSIYON.fSifirla = () => { const el = elDeger(S.park, S.form.ek); const n = Object.keys(el).length; if (!n) { toast('Bu formda elle girilmiş değer yok.'); return; }
    if (!confirm(n + ' elle girilmiş değer silinsin mi? Otomatik değerler yerine gelir.')) return; delete S.veri.ekler[S.park][S.form.ek]; degisti(S.form.ek + ' elle girilen değerleri silindi', S.park); };
  AKSIYON.fYazdir = () => { document.body.classList.add('pr-form'); setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove('pr-form'), 500); }, 60); };
  AKSIYON.fExcel = async () => {
    if (!S.fV) return; toast('Excel dosyası hazırlanıyor…');
    try { const b = await EK.excel(S.form.ek, S.fV.m, S.fV.V, S.form.ek === 'R10' ? 'Ek-10 ' + S.park : S.form.ek); EK.indir(b, (S.form.ek === 'R10' ? 'Ek-10_imzali_' : S.form.ek + '_') + dosyaAdi(S.park) + '.xlsx'); toast('Excel indirildi.'); }
    catch (e) { toast('Excel üretilemedi: ' + e.message, true); }
  };
  const dosyaAdi = (s) => (s || '').replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => ({ ç: 'c', Ç: 'C', ğ: 'g', Ğ: 'G', ı: 'i', İ: 'I', ö: 'o', Ö: 'O', ş: 's', Ş: 'S', ü: 'u', Ü: 'U' }[c])).replace(/[^\w-]+/g, '_');
  async function wordUret(ek, p) { return EK.docxDoldur(ek, S.ekB.docx[ek], EK.alanlar(ekCtx(p)), null); }
  async function wordGoster(ek, p) {
    const kutu = $('#ekAlan'); const F = EK.alanlar(ekCtx(p)); S.fW = null; S.fWek = ek + '|' + p.kisa;
    const al = EK.docAlanlar(ek, F), bos = Array.from(new Set(al.filter((x) => !x.v).map((x) => x.key)));
    $('#fEksik').innerHTML = bos.length ? '<b class="amb-t">Park kaydında boş olduğu için boş bırakılan alanlar:</b> ' + esc(bos.map((k) => ALANAD[k] || k).join(', ')) : '<b class="ok-t">Belgedeki bütün kayıt alanları dolu.</b>';
    try {
      const { blob, sonuc } = await wordUret(ek, p);
      S.fW = blob;
      const dolu = sonuc.filter((x) => x.durum === 'dolduruldu').length;
      const goster = async () => { kutu.innerHTML = '<div class="empty"><span class="spin"></span> Önizleme hazırlanıyor…</div>'; await new Promise((r) => setTimeout(r, 30));
        const d = document.createElement('div'); d.className = 'dxk'; await EK.docxGoster(blob, d); kutu.innerHTML = ''; kutu.appendChild(d); };
      if (ek === 'Ek-11' && !S.fOnizle) {
        kutu.innerHTML = '<div class="dxozet"><p><b>' + dolu + ' paragraftaki boşluk</b> park ve kurum kayıtlarıyla dolduruldu. Tip şartname uzun bir belge olduğundan önizleme isteğe bağlıdır; Word dosyası hemen indirilebilir.</p>' +
          '<button class="btn pri" id="dxOn">Önizlemeyi göster</button></div>';
        $('#dxOn').onclick = () => { S.fOnizle = true; goster(); };
      } else await goster();
    } catch (e) { kutu.innerHTML = '<div class="alert red">Belge hazırlanamadı: ' + esc(e.message) + '</div>'; }
  }
  const ALANAD = { il: 'il', ilce: 'ilçe', mahalle: 'köy/mahalle', mevki: 'mevkii', bolme: 'bölme no', tapu: 'tapu', uzaklik: 'il/ilçe merkezine uzaklık', muhdesat: 'muhdesat (mevcut tesisler)',
    yetkili: 'yetkili', adres: 'işletmeci adresi', tel: 'işletmeci telefonu', faks: 'işletmeci faksı', eposta: 'işletmeci e-postası', guvence: 'güvence oranı', depozito: 'depozito oranı',
    guvence_yazi: 'güvence oranı', depozito_yazi: 'depozito oranı', k_ilgili: 'ilgili personel (kurum)', k_banka: 'banka (kurum)', k_sube: 'banka şubesi (kurum)', k_faks: 'faks (kurum)' };
  AKSIYON.fWord = async () => {
    try { if (!S.fW || S.fWek !== S.form.ek + '|' + S.park) { toast('Word belgesi hazırlanıyor…'); await ekPaket(); S.fW = (await wordUret(S.form.ek, S.pBy[S.park])).blob; S.fWek = S.form.ek + '|' + S.park; }
      EK.indir(S.fW, S.form.ek + '_' + dosyaAdi(S.park) + '.docx'); toast('Word belgesi indirildi.'); } catch (e) { toast('Word belgesi üretilemedi: ' + e.message, true); } };
  function formBilgi(ek) {
    const { p, forms } = ekVeri(), f = forms.find((x) => x.e === ek); if (!f) return;
    modal(f.e + ' · ' + f.ad, '<div class="kv"><span>Kim, ne zaman</span><span>' + esc(f.kim) + '</span></div><div class="kv"><span>Süre ve gönderim</span><span>' + esc(f.sure) + '</span></div><div class="kv"><span>Dayanak</span><span>' + esc(f.md) + '</span></div>' +
      (f.pv ? '<div class="quote"><b>' + esc(p.kisa) + ':</b> ' + esc(f.pv) + '</div>' : ''),
      '<button class="btn" data-a="teblig" data-pg="' + EKSAYFA[f.e] + '">Tebliğdeki form</button><button class="btn pri" data-a="formAc" data-e="' + f.e + '">Formu aç ve doldur</button>');
  }

  // ---------- KİRA VE TAHAKKUK ----------
  SAYFA.tahakkuk = function () {
    const y0 = E.year(S.rapor); if (!S.tY || !S.plan[S.tY]) S.tY = y0 + 1;
    const Y = S.tY, L = S.veri.parks.map((p) => S.plan[Y][p.kisa]).filter((t) => t.kod !== 'eksik' && t.kod !== 'disi');
    const say = (k) => L.filter((t) => t.kod === k).length;
    const top = sumOf(L.filter((t) => t.kira != null), (t) => t.kira);
    const durumC = { tamam: 'b-ok', oto: 'b-ok', fark: 'b-amb', bekliyor: 'b-no', plan: 'b-gray', tufe: 'b-amb', yok: 'b-gray' };
    S.csv = { name: 'tahakkuk_' + Y, head: ['Park', 'Dönem', 'Dönem başı', 'TÜFE ayı', 'TÜFE', 'Yıllık kira (Tebliğ)', 'Ağaçlandırma', 'KDV', 'Toplam', 'Muhasebe', 'Fark', 'Vadeler', 'Güvence', 'Depozito', 'Durum'],
      rows: L.map((t) => [t.park, t.donem, fd(t.bas), t.tufeAy ? AY[t.tufeAy[1] - 1] + ' ' + t.tufeAy[0] : '', t.tufe, t.kira, t.agac, t.kdv, t.toplam, t.muhasebede ? t.muhKira : '', t.fark, (t.vadeler || []).map((v) => fd(v.vade) + ' ' + tl(v.kira)).join(' | '), t.guv, t.dep, t.durum]) };
    const satir = (t) => '<tr>' + td('<a href="#/park" data-a="park" data-k="' + esc(t.park) + '" data-go="park" style="font-weight:600">' + esc(t.park) + '</a>', '', 'lead') +
      td(t.donem ? t.donem + '. dönem<br><span class="muted n" style="font-size:12.5px">' + fd(t.bas) + '</span>' : '—', 'Dönem') +
      td(t.tufeAy ? AY[t.tufeAy[1] - 1] + ' ' + t.tufeAy[0] + '<br><span class="n">' + (t.tufe != null ? E.pct(t.tufe) : 'açıklanmadı') + '</span>' : (t.donem === 1 ? 'İhale bedeli' : '—'), 'TÜFE') +
      td(t.kira != null ? '<b>' + tl(t.kira) + '</b>' : (t.kod === 'tufe' ? '<span class="amb-t">' + fd(t.yayim) + '’te</span>' : '—'), 'Yıllık kira', 'n r') +
      td(t.kira != null ? tl(t.agac) + '<br><span class="muted">' + tl(t.kdv) + '</span>' : '—', 'Ağaç. / KDV', 'n r') +
      td((t.vadeler || []).map((v) => '<span class="n">' + fd(v.vade).slice(0, 5) + ' · ' + tl(v.kira) + '</span>').join('<br>') || '—', 'Taksitler', 'n', ' style="white-space:nowrap"') +
      td(t.muhasebede ? tl(t.muhKira) + (t.kod === 'fark' ? '<br><span class="red-t">fark ' + tl(t.fark) + '</span>' : '') + (t.muhKist ? '<br><span class="muted" style="font-size:12px">+ kıst/dönem arası ' + tl(t.muhKist) + '</span>' : '') : '—', 'Muhasebe', 'n r') +
      td('<span class="badge ' + (durumC[t.kod] || 'b-gray') + '">' + esc(t.durum) + '</span>', 'Durum') +
      td('<button class="btn sm" data-a="tAyr" data-k="' + esc(t.park) + '">Hesap</button>' + ((t.kod === 'bekliyor' || t.kod === 'plan') ? ' <button class="btn sm pri own-only" data-a="tEt" data-k="' + esc(t.park) + '">Tahakkuk et</button>' : '') +
        (t.kod === 'oto' ? ' <button class="btn sm red own-only" data-a="tGeri" data-k="' + esc(t.park) + '">Geri al</button>' : ''), '', 'noprint') + '</tr>';
    return '<div class="pagehead"><div><h1>Kira ve tahakkuk</h1><p>Yıllık kira Tebliğ Md. 31–32 zincirinden hesaplanır: dönem kirası = (önceki dönem + o dönemde eklenen ek tesis kirası) × (1 + TÜFE). Takvim yılının kirası, o yılın 31 Mart’ına kadar başlamış dönemin kirasıdır. Ödeme günleri önceki yılın tahakkukundan, yoksa Md. 32/3’ten alınır; ağaçlandırma %5 (Md. 33), KDV %20 ilk taksitle. TÜFE açıklanmadıkça tutar hesaplanmaz; açıklandığı gün otomatik tamamlanır.</p></div>' +
      '<div class="seg">' + [y0, y0 + 1].map((v) => '<button class="' + (v === Y ? 'on' : '') + '" data-a="tYil" data-v="' + v + '">' + v + '</button>').join('') + '</div></div>' +
      '<section class="kpis"><div class="kpi"><span>' + Y + ' yıllık kira (hesaplanan)</span><strong class="n">' + tl(top) + '</strong><em>' + L.filter((t) => t.kira != null).length + ' park</em></div>' +
      '<div class="kpi"><span>Tahakkuk edilmiş</span><strong class="n">' + (say('tamam') + say('fark') + say('oto')) + '</strong><em>' + say('fark') + ' parkta Tebliğ hesabından farklı</em></div>' +
      '<div class="kpi"><span>Tahakkuk edilmesi gereken</span><strong class="n" style="color:' + (say('bekliyor') ? 'var(--red)' : 'var(--ink)') + '">' + say('bekliyor') + '</strong><em>' + (Y > y0 ? Y + ' başında ' + say('plan') + ' park hazır' : 'vadesi gelmiş yıl') + '</em></div>' +
      '<div class="kpi"><span>TÜFE bekleyen</span><strong class="n">' + say('tufe') + '</strong><em>' + (say('tufe') ? 'ilk açıklama ' + fd(L.filter((t) => t.yayim).map((t) => t.yayim).sort()[0]) : 'hepsi hesaplandı') + '</em></div></section>' +
      '<section class="card"><div class="ch"><h2>' + Y + ' yılı kira ve tahakkuk planı</h2><button class="btn sm" data-a="tTalimat">Tahakkuk talimatı (yazdır)</button></div><div class="scroll"><table class="rt" style="min-width:1180px"><thead><tr><th>Park</th><th>Dönem</th><th>TÜFE</th><th class="r">Yıllık kira</th><th class="r">Ağaç. / KDV</th><th>Taksitler</th><th class="r">Muhasebe</th><th>Durum</th><th class="noprint"></th></tr></thead><tbody>' +
      L.map(satir).join('') + '</tbody></table></div><p class="muted" style="margin:10px 22px 16px;font-size:13.5px">“Tahakkuk et” kayıtları programın muhasebe defterine işlenir; muhasebe dökümü yüklendiğinde aynı park ve yılın gerçek tahakkuku gelirse program kaydı kendiliğinden devreden çıkar. İşlenmiş tahakkuk, sonradan değişen oranlardan etkilenmez.</p></section>';
  };
  AKSIYON.tYil = (t) => { S.tY = +t.dataset.v; sayfaCiz(); };
  AKSIYON.tAyrP = (t) => { S.tY = +t.dataset.y; AKSIYON.tAyr(t); };
  AKSIYON.tEtP = (t) => { S.tY = +t.dataset.y; AKSIYON.tEt(t); };
  AKSIYON.tAyr = (t) => {
    const Y = S.tY || E.year(S.rapor) + 1, pl = S.plan[Y][t.dataset.k], p = S.pBy[t.dataset.k];
    const ky = E.kiraYili(p, S.tufe, S.veri.ek_kira, Y);
    const z = ky ? ky.zincir.filter((d) => d.n <= ky.donem) : [];
    modal(Y + ' kira hesabı · ' + p.kisa, '<div class="kv"><span>Esas</span><span>' + esc(p.rejim === 'Eski' ? 'Sözleşmesi Tebliğ öncesi (Geçici Md. 8): artış sözleşmedeki esasa göre' : 'Tebliğ Md. 31–32') + ' · ' + esc(p.artis || '') + ' · ' + esc(p.kural || '') + '</span></div>' +
      '<div class="sl"><table><thead><tr><th>Dönem</th><th>Başlangıç</th><th>TÜFE</th><th class="r">Ek kira</th><th class="r">Dönem kirası</th></tr></thead><tbody>' +
      z.map((d) => '<tr><td>' + d.n + '</td><td class="n">' + fd(d.bas) + '</td><td>' + (d.n === 1 ? 'İhale bedeli' : (d.tufeAy ? AY[d.tufeAy[1] - 1] + ' ' + d.tufeAy[0] + ' · ' : '') + (d.tufe != null ? E.pct(d.tufe) : 'açıklanmadı')) + '</td><td class="r n">' + (d.ek ? tl(d.ek) : '–') + '</td><td class="r n"><b>' + tl(d.bedel) + '</b></td></tr>').join('') + '</tbody></table></div>' +
      (z.length > 1 ? '<p class="muted" style="margin:0;font-size:13px">Her satır: (önceki dönem kirası + önceki dönemde eklenen ek kira) × (1 + TÜFE), kuruşa yuvarlanır.</p>' : '') +
      (pl.kira != null ? '<div class="kv"><span>' + Y + ' yıllık kira</span><span class="n"><b>' + tl(pl.kira) + '</b></span></div><div class="kv"><span>Ağaçlandırma (kira × %5)</span><span class="n">' + tl(pl.agac) + '</span></div>' +
        '<div class="kv"><span>KDV ((kira + ağaçlandırma) × %20)</span><span class="n">' + tl(pl.kdv) + '</span></div><div class="kv"><span>Toplam</span><span class="n">' + tl(pl.toplam) + '</span></div>' +
        '<div class="kv"><span>Ödeme günleri</span><span>' + esc(pl.kaynak) + '</span></div>' +
        '<div class="sl"><table><thead><tr><th>Vade</th><th class="r">Kira</th><th class="r">Ağaç.</th><th class="r">KDV</th></tr></thead><tbody>' + pl.vadeler.map((v) => '<tr><td class="n">' + fd(v.vade) + '</td><td class="r n">' + tl(v.kira) + '</td><td class="r n">' + (v.agac ? tl(v.agac) : '–') + '</td><td class="r n">' + (v.kdv ? tl(v.kdv) : '–') + '</td></tr>').join('') + '</tbody></table></div>' +
        (pl.guv != null ? '<div class="kv"><span>Güvence (kira × ' + E.pct(p.guv, 0) + ', Md. 10/1)</span><span class="n">' + tl(pl.guv) + (pl.guvFark != null ? ' · artış ' + tl(pl.guvFark) : '') + '</span></div>' : '') +
        (pl.dep != null ? '<div class="kv"><span>Depozito (kira × ' + E.pct(p.dep, 0) + ', Md. 10/2)</span><span class="n">' + tl(pl.dep) + (pl.depFark != null ? ' · artış ' + tl(pl.depFark) : '') + '</span></div>' : '')
        : '<div class="alert amb">' + esc(pl.durum) + (pl.yayim ? ': ' + AY[pl.tufeAy[1] - 1] + ' ' + pl.tufeAy[0] + ' TÜFE’si TÜİK tarafından ' + fd(pl.yayim) + ' tarihinde açıklanır; açıklandığı gün hesap kendiliğinden tamamlanır.' : '') + '</div>'),
      '<button class="btn pri" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Kapat</button>');
  };
  AKSIYON.tEt = (t) => {
    if (!S.owner) return yoneticiGiris();
    const Y = S.tY, pl = S.plan[Y][t.dataset.k], p = S.pBy[t.dataset.k];
    if (pl.kira == null) { toast('Tutar hesaplanmadan tahakkuk edilemez.', true); return; }
    if (!p.vkn_muh) { toast('Parkın muhasebe vergi numarası tanımlı değil; önce park bilgilerini tamamlayın.', true); return; }
    const t0 = S.rapor >= Y + '-01-01' ? S.rapor : Y + '-01-01';
    modal('Tahakkuk et · ' + p.kisa + ' · ' + Y, '<div class="sl"><table><thead><tr><th>Vade</th><th>Kalem</th><th>Hesap</th><th class="r">Tutar</th></tr></thead><tbody>' +
      pl.vadeler.map((v, i) => '<tr><td class="n">' + fd(v.vade) + '</td><td>' + (i + 1) + '. taksit kira</td><td>' + esc(pl.hesap.kira) + '</td><td class="r n">' + tl(v.kira) + '</td></tr>' +
        (v.agac ? '<tr><td class="n">' + fd(v.vade) + '</td><td>Ağaçlandırma</td><td>' + esc(pl.hesap.agac) + '</td><td class="r n">' + tl(v.agac) + '</td></tr>' : '') +
        (v.kdv ? '<tr><td class="n">' + fd(v.vade) + '</td><td>KDV</td><td>' + esc(pl.hesap.kdv) + '</td><td class="r n">' + tl(v.kdv) + '</td></tr>' : '')).join('') +
      '<tr style="font-weight:600"><td colspan="3">Toplam</td><td class="r n">' + tl(pl.toplam) + '</td></tr></tbody></table></div>' +
      '<div class="frow">' + fi('te_t', 'Tahakkuk tarihi', t0, 'date') + fi('te_y', 'Muhasebe fiş / yevmiye no (varsa)', '', 'number') + '</div>' +
      '<p class="muted" style="margin:0;font-size:13px">Kayıtlar muhasebe defterine “program tahakkuku” olarak işlenir; alacak takibi, gecikme zammı ve Ek-10’daki işletme bedeli bu kayıtlardan gelir.</p>',
      '<button class="btn" onclick="document.getElementById(\'modal\').classList.remove(\'on\')">Vazgeç</button><button class="btn pri" id="teOk">Tahakkuk et</button>');
    $('#teOk').onclick = () => {
      const tar = gv('te_t'), yev = gv('te_y', 'number') || 0;
      if (!tar || E.year(tar) !== Y) { toast('Tahakkuk tarihi ' + Y + ' yılı içinde olmalı.', true); return; }
      const oto = p.kisa + '|' + Y, base = { kaynak: '120', yev, tarih: tar, vkn: p.vkn_muh, musteri: p.isletmeci || p.kisa, neden: 'Program tahakkuku', borc_h: '120', alacak_h: '600, 391', alacak: 0, ek: true, oto, not_: 'Program tahakkuku ' + fd(bugun()) + ' (' + (S.kim || 'yönetici') + ')' };
      pl.vadeler.forEach((v, i) => {
        S.veri.muhasebe.push(Object.assign({}, base, { hesap: pl.hesap.kira, vade: v.vade, aciklama: Y + ' yılı işletme bedeli ' + (pl.vadeler.length > 1 ? (i + 1) + '. taksit' : ''), borc: v.kira }));
        if (v.agac) S.veri.muhasebe.push(Object.assign({}, base, { hesap: pl.hesap.agac, vade: v.vade, aciklama: Y + ' yılı ağaçlandırma bedeli', borc: v.agac }));
        if (v.kdv) S.veri.muhasebe.push(Object.assign({}, base, { hesap: pl.hesap.kdv, vade: v.vade, aciklama: Y + ' yılı KDV', borc: v.kdv }));
      });
      modalKapat(); degisti(p.kisa + ' ' + Y + ' yılı kira tahakkuku işlendi (' + tl(pl.toplam) + ' TL)', p.kisa);
    };
  };
  AKSIYON.tGeri = (t) => {
    const Y = S.tY, oto = t.dataset.k + '|' + Y, n = S.veri.muhasebe.filter((x) => x.oto === oto).length;
    if (!n || !confirm(t.dataset.k + ' ' + Y + ' program tahakkuku (' + n + ' satır) silinsin mi?')) return;
    S.veri.muhasebe = S.veri.muhasebe.filter((x) => x.oto !== oto); degisti(t.dataset.k + ' ' + Y + ' program tahakkuku geri alındı', t.dataset.k);
  };
  AKSIYON.tTalimat = () => {
    const Y = S.tY, L = S.veri.parks.map((p) => [p, S.plan[Y][p.kisa]]).filter(([, t]) => t.kira != null);
    const ku = S.veri.kurum || {};
    modal(Y + ' yılı kira tahakkuk talimatı', '<div class="talimat"><p style="margin:0 0 8px"><b>' + esc(ku.isletme || '') + '</b> · ' + esc(ku.sube || '') + ' · ' + fd(S.rapor) + '</p>' +
      '<p style="margin:0 0 10px">313 sayılı Orman Parkları Tebliği Md. 31–33 uyarınca hesaplanan ' + Y + ' yılı işletme hakkı kira bedelleri ve tahakkuk planı aşağıdadır.</p>' +
      '<div class="sl"><table><thead><tr><th>Park / işletmeci</th><th>VKN</th><th>Vade</th><th class="r">Kira</th><th class="r">Ağaç.</th><th class="r">KDV</th></tr></thead><tbody>' +
      L.map(([p, t]) => t.vadeler.map((v, i) => '<tr><td>' + (i ? '' : '<b>' + esc(p.kisa) + '</b><br><span style="font-size:12px">' + esc(p.isletmeci || '') + '</span>') + '</td><td class="n">' + (i ? '' : esc(p.vkn || '')) + '</td><td class="n">' + fd(v.vade) + '</td><td class="r n">' + tl(v.kira) + '</td><td class="r n">' + (v.agac ? tl(v.agac) : '') + '</td><td class="r n">' + (v.kdv ? tl(v.kdv) : '') + '</td></tr>').join('') +
        '<tr><td colspan="3" style="font-size:12.5px;color:var(--mute)">' + t.donem + '. dönem (' + fd(t.bas) + ')' + (t.tufe != null ? ', TÜFE ' + E.pct(t.tufe) : ', ihale bedeli') + ' · ' + esc(t.durum) + '</td><td class="r n"><b>' + tl(t.kira) + '</b></td><td class="r n">' + tl(t.agac) + '</td><td class="r n">' + tl(t.kdv) + '</td></tr>').join('') +
      '<tr style="font-weight:700"><td colspan="3">Toplam</td><td class="r n">' + tl(sumOf(L, ([, t]) => t.kira)) + '</td><td class="r n">' + tl(sumOf(L, ([, t]) => t.agac)) + '</td><td class="r n">' + tl(sumOf(L, ([, t]) => t.kdv)) + '</td></tr></tbody></table></div>' +
      '<p style="margin:12px 0 0;font-size:13px">' + esc(ku.ilgili || '') + '</p></div>', '<button class="btn pri" data-a="pdf">Yazdır / PDF</button>');
  };

  // ---------- TEBLİĞ VE HESAPLAR ----------
  // Her madde: programdaki karşılığı (modül, ek, hesap) ve seçili park için canlı uygulama
  const MD = {
    '1': ['Bilgi'], '2': ['Bilgi'], '3': ['İlke'], '4': ['İlke'], '5': ['Belge', ['Ek-1', 'Ek-2']], '6': ['Belge', ['Ek-2', 'Ek-11', 'Ek-16']], '7': ['Hesap', ['Ek-3'], 'i'], '8': ['Hesap', ['Ek-14'], 'i'],
    '9': ['Hesap', ['Ek-15', 'Ek-17'], 'i'], '10': ['Hesap', ['Ek-17'], 'i'], '11': ['Bilgi', ['Ek-14', 'Ek-15']], '12': ['Belge', ['Ek-11', 'Ek-17']], '13': ['Süre'], '14': ['Plan', ['Ek-4']],
    '15': ['Plan', ['Ek-4']], '16': ['Plan', ['Ek-4']], '17': ['Plan', ['Ek-4']], '18': ['Süre', ['Ek-4']], '19': ['Süre', ['Ek-4']], '20': ['Plan'], '21': ['Plan'], '22': ['Plan', ['Ek-5']],
    '23': ['Süre', ['Ek-5']], '24': ['Belge', ['Ek-6']], '25': ['Süre', ['Ek-7']], '26': ['Belge', ['Ek-8']], '27': ['Süre', ['Ek-9']], '28': ['Bilgi'], '29': ['Süre'], '30': ['Hesap', [], 'e'],
    '31': ['Hesap', ['Ek-17'], 'i'], '32': ['Hesap', [], 't'], '33': ['Hesap', ['Ek-17'], 't'], '34': ['Hesap'], '35': ['Hesap', ['Ek-18'], 'd'], '36': ['Süre'], '37': ['Bilgi'], '38': ['Bilgi'],
    '39': ['Hesap', [], 'g'], '40': ['Hesap', [], 'f'], '41': ['Bilgi'], '42': ['Süre', ['Ek-10']], '43': ['Bilgi'], '44': ['Bilgi'], '45': ['Bilgi'], '46': ['Bilgi'], '47': ['Bilgi'], '48': ['Bilgi'],
    '49': ['Bilgi'], '50': ['Bilgi'], '51': ['Belge', ['Ek-1', 'Ek-2', 'Ek-3', 'Ek-4', 'Ek-5', 'Ek-6', 'Ek-7', 'Ek-8', 'Ek-9', 'Ek-10', 'Ek-11', 'Ek-12', 'Ek-13', 'Ek-14', 'Ek-15', 'Ek-16', 'Ek-17', 'Ek-18']],
    '52': ['Bilgi'], '53': ['Bilgi'], '54': ['Bilgi'], 'G1': ['Bilgi'], 'G2': ['Bilgi'], 'G3': ['Bilgi'], 'G4': ['Hesap', ['Ek-18'], 'd'], 'G5': ['Bilgi'], 'G6': ['Hesap'], 'G7': ['Bilgi'], 'G8': ['Bilgi'] };
  function mdCanli(no, p) {
    const o = S.ozBy[p.kisa], y = E.year(S.rapor), pl = (S.plan[y] || {})[p.kisa] || {}, kk = o.kk;
    const kira = pl.muhasebede ? pl.muhKira : (pl.kira != null ? pl.kira : kk.hesap);
    const kv = (a, b) => '<div class="kv"><span>' + a + '</span><span class="n">' + b + '</span></div>';
    const ib = p.ihale_b, iy = p.soz_bas && p.soz_bit ? Math.round(E.days(p.soz_bas, p.soz_bit) / 365.25) : null;
    const T = TAKVIM(p);
    const tk = (re) => T.filter((x) => re.test(x.md)).map((x) => kv(esc(x.ad), '<span class="badge ' + x.c + '">' + esc(x.s) + '</span> ' + esc(x.d))).join('');
    switch (no) {
      case '7': return kv('İhale bedeli (sonuç)', ib != null ? tl(ib) : '—') + '<p class="muted" style="margin:6px 0 0;font-size:13px">Tahmin edilen bedel Ek-3 tutanağıyla komisyonca tespit edilir; Ek-3 formu park bilgileriyle açılır.</p>';
      case '8': return ib == null ? '' : kv('Geçici teminat aralığı (%10–30, ihale bedeli üzerinden örnek)', tl(r2(ib * 0.1)) + ' – ' + tl(r2(ib * 0.3)));
      case '9': { const ekT = r2((S.veri.ek_kira || []).filter((e) => e.park === p.kisa).reduce((a, e) => a + e.tutar * 0.06, 0));
        return ib == null ? '' : kv('Kesin teminat (ihale × %6)', tl(r2(ib * 0.06))) + (ekT ? kv('Ek tesis kesin teminatı (ek kira × %6, Md. 9/2)', tl(ekT)) + kv('Toplam', tl(r2(ib * 0.06 + ekT))) : '') + kv('Kayıtlı kesin teminat', p.kesin != null ? tl(p.kesin) : 'Kayıt yok'); }
      case '10': return kira == null ? '' : (p.guv != null ? kv('Güvence (' + y + ' kirası × ' + E.pct(p.guv, 0) + ')', tl(r2(kira * p.guv))) : kv('Güvence', 'Sözleşmede yok')) + (p.dep != null ? kv('Depozito (' + y + ' kirası × ' + E.pct(p.dep, 0) + ')', tl(r2(kira * p.dep))) : kv('Depozito', 'Sözleşmede yok'));
      case '13': case '27': case '18': case '19': case '23': case '25': case '29': case '36': case '42': return tk(new RegExp('Md\\. ' + no + '\\b'));
      case '30': return (S.veri.plan || []).filter((x) => x.park === p.kisa).map((x) => { const r = revizeTahakkuk(x); return kv(esc(x.revize) + ' · ' + fd(x.onay), 'yıllık ' + tl(x.ek) + ' · kıst ' + tl(r.kist) + ' · ek teminat ' + tl(r2(x.ek * 0.06))); }).join('') || kv('Revize plan', 'Kayıtlı ek tesis yok');
      case '31': return ib == null ? '' : kv('İlk yıl kirası', tl(ib)) + kv('Ödeme', ib <= 150000 ? 'Sözleşmede tek seferde peşin (≤ 150.000 TL)' : 'Peşin ya da 1/3 peşin + kalanı iki eşit taksit') + kv('İlk yıl ağaçlandırma (Md. 33/2)', tl(r2(ib * 0.05))) + kv('İlk yıl KDV', tl(r2((ib + r2(ib * 0.05)) * 0.2)));
      case '32': { const a = S.plan[y][p.kisa], b = S.plan[y + 1][p.kisa];
        return kv('Dönem tabanı / kural', fd(p.taban) + ' · ' + esc(p.kural || '')) + kv(y + ' yıllık kira', a && a.kira != null ? tl(a.kira) + ' (' + a.donem + '. dönem)' : esc(a ? a.durum : '—')) + kv((y + 1) + ' yıllık kira', b && b.kira != null ? tl(b.kira) : esc(b ? b.durum + (b.yayim ? ' (' + fd(b.yayim) + ')' : '') : '—')) +
          '<div style="padding:8px 0 0"><a class="btn sm" href="#/tahakkuk">Kira ve tahakkuk planı</a> <a class="btn sm" href="#/zincir" data-a="zsec" data-k="' + esc(p.kisa) + '">Kira zinciri</a></div>'; }
      case '33': return kira == null ? '' : kv('Ağaçlandırma (' + y + ' kirası × %5)', tl(r2(kira * 0.05)));
      case '34': return kv('Giriş ücreti', esc(p.giris || 'Kayıtta giriş ücreti yok')) + '<p class="muted" style="margin:6px 0 0;font-size:13px">Müteakip yıllar giriş ücreti ocakta açıklanan yıllık TÜFE (12 aylık ort.) oranında artar: ' + (S.tufe[y - 1] && S.tufe[y - 1][11] != null ? E.pct(S.tufe[y - 1][11]) + ' (Aralık ' + (y - 1) + ')' : '—') + '.</p>';
      case '35': case 'G4': return (kira == null ? '' : kv('Devirde ' + y + ' kirası (+%30)', tl(r2(kira * 1.3))) + kv('Artış', tl(r2(kira * 0.3)))) + tk(/Md\. 35/);
      case '39': return kv('Vadesi geçmiş alacak', tl(o.vgec)) + kv('Gecikme zammı ve KDV’si (' + fd(S.rapor) + ')', tl(o.gz)) + kv('En eski vade', fd(o.enEski)) + kv('Fesih hakkı eşiği (vade + 2 yıl)', o.enEski ? fd(E.addMonths(o.enEski, 24)) + (E.addMonths(o.enEski, 24) <= S.rapor ? ' · doldu' : '') : '—');
      case '40': return kira == null ? '' : kv('Fesihte gelir kaydedilecek kesin teminat', p.kesin != null ? tl(p.kesin) : '—') + kv('Tazminat (cari yıl kirası)', tl(kira));
      case 'G6': return kira == null ? '' : kv('Giriş ücreti talebinde asgari ek kira (yıllık kiranın %30’u)', tl(r2(kira * 0.3)));
      default: return '';
    }
  }
  SAYFA.teblig = function () {
    const p = S.pBy[S.park];
    if (!S.ekB) return mpick() + '<div class="pagehead"><div><h1>Tebliğ ve hesaplar</h1></div></div><div id="tbAlan" class="empty"><span class="spin"></span> Tebliğ metni açılıyor…</div>';
    const L = S.ekB.teblig, q = trLow(S.tQ || '');
    const F = L.filter((m) => !q || trLow(m.no + ' ' + m.baslik + ' ' + m.metin.join(' ')).includes(q));
    if (!S.tMd || !L.find((m) => m.no === S.tMd)) S.tMd = '32';
    const m = L.find((x) => x.no === S.tMd), md = MD[m.no] || ['Bilgi'];
    const canli = mdCanli(m.no, p);
    const tur = { Bilgi: 'b-gray', İlke: 'b-gray', Belge: 'b-ok', Hesap: 'b-amb', Süre: 'b-no', Plan: 'b-ok' };
    const hesTool = { i: 'İhale ve sözleşme bedelleri', e: 'Ek yapı ve tesis kirası', d: 'Sözleşme devri', f: 'Fesih hâlinde', g: 'Gecikme zammı', t: 'Kira ve tahakkuk' };
    return mpick() + '<div class="pagehead"><div><h1>Tebliğ ve hesaplar</h1><p>313 sayılı Orman Parkları Uygulama Tebliği’nin ' + L.length + ' maddesi (54 madde, 8 geçici madde). Her maddenin programdaki karşılığı ve seçili park (<b>' + esc(p.kisa) + '</b>) için canlı uygulaması.</p></div></div>' +
      '<div class="tbg"><aside class="card tbl"><input class="fld" id="tbQ" type="search" placeholder="Madde ara (ör. teminat, devir)" value="' + esc(S.tQ || '') + '"><div class="tbli">' +
      F.map((x) => '<button class="' + (x.no === m.no ? 'on' : '') + '" data-a="tMd" data-v="' + x.no + '"><b>' + (x.no[0] === 'G' ? 'Geç. ' + x.no.slice(1) : 'Md. ' + x.no) + '</b><span>' + esc(x.baslik || '—') + '</span><i class="badge ' + (tur[(MD[x.no] || ['Bilgi'])[0]]) + '">' + (MD[x.no] || ['Bilgi'])[0] + '</i></button>').join('') +
      (F.length ? '' : '<div class="empty">Sonuç yok</div>') + '</div></aside>' +
      '<section class="card tbm"><div class="ch"><h2>' + (m.no[0] === 'G' ? 'Geçici Madde ' + m.no.slice(1) : 'Madde ' + m.no) + ' · ' + esc(m.baslik || '') + '</h2><span class="badge ' + tur[md[0]] + '">' + md[0] + '</span></div>' +
      (m.bolum ? '<p class="muted" style="margin:0 22px 8px;font-size:13px">' + esc(m.bolum) + '</p>' : '') +
      '<div class="tbt">' + m.metin.map((x) => '<p>' + esc(x) + '</p>').join('') + '</div>' +
      '<div class="tbk"><h3>Programdaki karşılığı</h3>' +
      ((md[1] || []).length ? '<div class="chiprow">' + md[1].map((e) => '<button class="btn sm" data-a="formAc" data-e="' + e + '">' + e + ' · ' + esc(EKAD[e]) + '</button>').join('') + '</div>' : '') +
      (md[2] ? '<div class="chiprow"><a class="btn sm" href="#/' + (md[2] === 't' ? 'tahakkuk' : 'hesap') + '" data-a="' + (md[2] === 't' ? '' : 'toolGit') + '" data-v="' + md[2] + '">' + hesTool[md[2]] + ' hesabı</a></div>' : '') +
      (canli ? '<h3>' + esc(p.kisa) + ' için</h3>' + canli : (md[0] === 'Bilgi' || md[0] === 'İlke' ? '<p class="muted" style="margin:0;font-size:13.5px">Tanım, ilke veya genel hüküm; işlemlerde bilgi olarak gösterilir.</p>' : '')) +
      '</div><div style="padding:0 22px 18px"><button class="btn sm" data-a="teblig" data-pg="1">Resmî metin (PDF)</button></div></section></div>';
  };
  AFTER.teblig = async () => {
    if (!S.ekB) { try { await ekPaket(); if (S.page === 'teblig') sayfaCiz(); } catch (e) { const a = $('#tbAlan'); if (a) a.innerHTML = 'Tebliğ metni açılamadı: ' + esc(e.message); } return; }
    const q = $('#tbQ'); if (q) q.oninput = (e) => { S.tQ = e.target.value; clearTimeout(q._t); q._t = setTimeout(() => { sayfaCiz(); const n = $('#tbQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
  };
  AKSIYON.tMd = (t) => { S.tMd = t.dataset.v; sayfaCiz(); const b = $('.tbm'); if (b && window.innerWidth < 900) b.scrollIntoView({ behavior: 'smooth' }); };
  AKSIYON.toolGit = (t) => { S.tool = t.dataset.v; };

  // ---------- park takvimi: Tebliğ süreleri (Md. 13, 18, 19, 23, 25, 27, 29, 35, 36, 39, 42) ----------
  // Sonraki adım, önceki adımın tarihi girilmeden kesinleştirilemez; eksik tarih "bekliyor" olarak gösterilir.
  function isGunuEkle(d, n) { let x = d; while (n > 0) { x = E.addDays(x, 1); const g = new Date(x + 'T12:00:00Z').getUTCDay(); if (g !== 0 && g !== 6) n--; } return x; }
  function TAKVIM(p) {
    const R = S.rapor, out = [];
    const ad = (md, ad_, s, c, d) => out.push({ md, ad: ad_, s, c, d });
    if (!p.soz_bas) { ad('Md. 27', 'Sözleşme', 'Bekliyor', 'b-gray', p.durum === 'Davalık' ? 'Dava süreci' : 'Sözleşme tarihi girilince süreler hesaplanır'); return out; }
    if (p.ihale_t && p.ihale_t > p.soz_bas) ad('Md. 27', 'İhale ve sözleşme sırası', 'Hatalı', 'b-no', 'İhale tarihi sözleşmeden sonra kayıtlı');
    const t5 = isGunuEkle(p.soz_bas, 5);
    if (p.teslim) ad('Md. 27', 'Saha teslimi (Ek-9)', p.teslim <= t5 ? 'Süresinde' : 'Süre aşıldı', p.teslim <= t5 ? 'b-ok' : 'b-no', fd(p.teslim) + ' · son gün ' + fd(t5) + (p.teslim < p.soz_bas ? ' · sözleşme tarihinden önce kayıtlı' : ''));
    else ad('Md. 27', 'Saha teslimi (Ek-9)', R > t5 ? 'Kayıt yok, süre geçti' : 'Bekliyor', R > t5 ? 'b-no' : 'b-amb', 'Son gün ' + fd(t5));
    const g15 = E.addDays(p.teslim || p.soz_bas, 15);
    ad('Md. 13', 'Sözleşme, şartname, teslim tutanağının GM’ye gönderimi', p.gm_gonderim ? (p.gm_gonderim <= g15 ? 'Süresinde' : 'Geç') : (R > g15 ? 'Kayıt yok' : 'Bekliyor'), p.gm_gonderim ? (p.gm_gonderim <= g15 ? 'b-ok' : 'b-amb') : (R > g15 ? 'b-amb' : 'b-gray'), (p.gm_gonderim ? fd(p.gm_gonderim) + ' · ' : '') + 'son gün ' + fd(g15));
    const gyp = E.addMonths(p.soz_bas, 3);
    const planVar = p.gyp_onay || /^var|onayl/i.test(p.plan || '');
    ad('Md. 19', 'Gelişim ve yönetim planı (3 ay)', planVar ? 'Var' : (R > gyp ? 'Süre geçti' : 'Bekliyor'), planVar ? 'b-ok' : (R > gyp ? 'b-no' : 'b-amb'), (p.gyp_onay ? 'Onay ' + fd(p.gyp_onay) + ' · ' : (p.plan ? p.plan.slice(0, 60) + ' · ' : '')) + 'GM’ye gönderim son gün ' + fd(gyp));
    ad('Md. 18', 'Plan revizesi yasağı (ilk 2 yıl)', R < E.addMonths(p.soz_bas, 24) ? 'Revize yapılamaz' : 'Revize yapılabilir', R < E.addMonths(p.soz_bas, 24) ? 'b-amb' : 'b-ok', 'İlk iki yıl ' + fd(E.addMonths(p.soz_bas, 24)) + '’e kadar');
    if (p.gyp_onay) { const pj = E.addMonths(p.gyp_onay, 12); ad('Md. 23', 'Uygulama projeleri ve ruhsat başvurusu (12 ay)', p.proje_t ? 'Yapıldı' : (R > pj ? 'Süre geçti' : 'Bekliyor'), p.proje_t ? 'b-ok' : (R > pj ? 'b-no' : 'b-amb'), (p.proje_t ? fd(p.proje_t) + ' · ' : '') + 'son gün ' + fd(pj)); }
    if (p.yatirim != null && p.teslim) { const ky = p.yatirim < 3000000.01 ? 2 : p.yatirim <= 7500000 ? 3 : 4; const son = E.addMonths(p.teslim, ky * 12);
      ad('Md. 29', 'Planlanan yatırımların tamamlanması (' + ky + ' yıl)', p.yatirim_bitti ? 'Tamamlandı' : (R > son ? 'Süre geçti' : 'Devam'), p.yatirim_bitti ? 'b-ok' : (R > son ? 'b-no' : 'b-amb'), 'Plan maliyeti ' + tl(p.yatirim) + ' TL · son gün ' + fd(son)); }
    (S.veri.plan || []).filter((x) => x.park === p.kisa).forEach((x) => { const son = E.addMonths(x.onay, 12); ad('Md. 29', x.revize + ' tesisleri (1 yıl)', R > son ? 'Süre doldu' : 'Devam', R > son ? 'b-amb' : 'b-ok', 'Onay ' + fd(x.onay) + ' · son gün ' + fd(son)); });
    if (p.soz_bit) {
      const yil = E.days(p.soz_bas, p.soz_bit) / 365.2425;
      ad('Md. 36', 'Sözleşme süresi (en çok 20 yıl)', p.soz_bit <= E.addMonths(p.soz_bas, 240) ? 'Uygun' : '20 yılı aşıyor', p.soz_bit <= E.addMonths(p.soz_bas, 240) ? 'b-ok' : 'b-no', yil.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' yıl · ' + fd(p.soz_bas) + ' – ' + fd(p.soz_bit));
      const a = E.addMonths(p.soz_bas, 36), b = E.addMonths(p.soz_bit, -12);
      ad('Md. 25', 'Statü değişikliği penceresi (Ek-7)', R < a ? 'Açılış ' + fd(a) : R > b ? 'Kapandı' : 'Açık', R < a ? 'b-amb' : R > b ? 'b-no' : 'b-ok', fd(a) + ' – ' + fd(b));
      if (/kapal/i.test(p.sekil || '')) { const b2 = E.addMonths(p.soz_bit, -6); ad('Md. 35', 'Sözleşme devri penceresi (Ek-18)', R < a ? 'Açılış ' + fd(a) : R > b2 ? 'Kapandı' : 'Açık', R < a ? 'b-amb' : R > b2 ? 'b-no' : 'b-ok', fd(a) + ' – ' + fd(b2) + ' · devirde borç olmamalı (' + (S.ozBy[p.kisa].acik > 0 ? 'açık alacak ' + tl(S.ozBy[p.kisa].acik) : 'borç yok') + ')'); }
      else ad('Md. 35', 'Sözleşme devri', 'Uygulanmaz', 'b-gray', 'Md. 35/1 yalnız kapalı teklif usulüyle ihale edilen parklarda; bu parkın usulü: ' + (p.sekil || '—'));
      if (p.soz_bit < R) ad('Md. 13', 'Geri teslim tutanağının GM’ye gönderimi', p.geri_teslim ? 'Yapıldı' : 'Bekliyor', p.geri_teslim ? 'b-ok' : 'b-no', 'Sona erme ' + fd(p.soz_bit) + ' · 15 gün içinde (' + fd(E.addDays(p.soz_bit, 15)) + ')');
    }
    const d = (S.veri.denetim || []).filter((x) => x.park === p.kisa).map((x) => x.tarih).sort().slice(-1)[0];
    const y = E.year(R), donem = E.month(R) <= 6 ? 1 : 2;
    ad('Md. 42', 'Komisyon denetimi (yılda iki kez, Ek-10)', d && d >= (donem === 1 ? y + '-01-01' : y + '-07-01') ? 'Bu dönem yapıldı' : 'Bu dönem bekliyor', d && d >= (donem === 1 ? y + '-01-01' : y + '-07-01') ? 'b-ok' : 'b-amb', (d ? 'Son rapor ' + fd(d) + ' · ' : '') + y + ' / ' + donem + '. dönem');
    const ay = (S.veri.defter || []).filter((x) => (x.park === p.kisa || x.park === 'Tüm parklar') && x.konu === 'Aylık temizlik-bakım denetimi').map((x) => x.tarih).sort().slice(-1)[0];
    ad('Md. 42', 'Aylık temizlik ve bakım denetimi', ay && ay.slice(0, 7) === R.slice(0, 7) ? 'Bu ay yapıldı' : 'Bu ay kayıt yok', ay && ay.slice(0, 7) === R.slice(0, 7) ? 'b-ok' : 'b-amb', ay ? 'Son kayıt ' + fd(ay) + ' (işlem defteri)' : 'İşlem defterine “Aylık temizlik-bakım denetimi” olarak işlenir');
    const o = S.ozBy[p.kisa];
    if (o.enEski) { const e2 = E.addMonths(o.enEski, 24); ad('Md. 39', 'Fesih hakkı (vadeden 2 yıl)', e2 <= R ? 'Doğdu' : 'Doğmadı', e2 <= R ? 'b-no' : 'b-amb', 'En eski ödenmemiş vade ' + fd(o.enEski) + ' · eşik ' + fd(e2)); }
    return out;
  }

  window.__app = { S, hesapla, E, TAKVIM: (k) => TAKVIM(S.pBy[k]), mdCanli: (n, k) => mdCanli(n, S.pBy[k]) };
  document.addEventListener('DOMContentLoaded', basla);
})();
