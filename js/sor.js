/* Sor asistanı: sitedeki bütün kayıtlarda (park, sözleşme, tahakkuk, alacak, muhasebe, harita tesisleri,
   Tebliğ maddeleri, denetim, kayıt defteri, yazışma, plan revizyonları) Türkçe soruyu anlar ve cevaplar.
   Yerel çalışır: veri cihazdan çıkmaz. Yapay zekâ katmanı (isteğe bağlı) yalnız burada seçilen alıntıları kullanır. */
(function (root) {
  'use strict';
  const SOR = {};

  // ---------- metin ----------
  const norm = (s) => String(s == null ? '' : s).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
  SOR.norm = norm;
  const DUR = new Set('ve veya ile icin ne nedir neler kac kadar mi mu midir midir hangi hangisi olan olarak var yok bir bu su o da de ki gibi daha en cok az ise ama nasil neden niye nerede nereye zaman zamani kim kimin bana goster listele soyle ver getir hakkinda bilgi lutfen acaba orman parki parki parklari parkinin parkin parkindaki park mi'.split(' '));
  // Eş anlamlılar (normalleştirilmiş biçimde): soru kelimesi → aranan kök
  const ES = {
    kamelya: 'kameriye', kamelyalar: 'kameriye', cardak: 'kameriye', tuvalet: 'wc', tuvaletler: 'wc', mescit: 'ibadethane', mescid: 'ibadethane', cami: 'ibadethane',
    lokanta: 'kir lokantasi', kahve: 'kir kahvesi', gazino: 'kir gazinosu', oyun: 'oyun', salincak: 'oyun', otopark: 'otopark', parkyeri: 'otopark',
    teminat: 'teminat', guvence: 'guvence', depozito: 'depozito', kira: 'kira', kirasi: 'kira', bedel: 'bedel', bedeli: 'bedel', ucret: 'bedel',
    borc: 'borc', borcu: 'borc', borclari: 'borc', odenmemis: 'odenmedi', odenmedi: 'odenmedi', gecikme: 'gecikme', faiz: 'gecikme',
    sozlesme: 'sozlesme', mukavele: 'sozlesme', isletmeci: 'isletmeci', kiraci: 'isletmeci', yuklenici: 'isletmeci', firma: 'isletmeci',
    madde: 'madde', md: 'madde', tebligi: 'teblig', teblig: 'teblig', yonetmelik: 'teblig', mevzuat: 'teblig',
    denetim: 'denetim', kontrol: 'denetim', tespit: 'denetim', harita: 'harita', sinir: 'sinir', koordinat: 'koordinat',
    plan: 'plan', gyp: 'plan', vaziyet: 'plan', revize: 'revize', revizyon: 'revize', tufe: 'tufe', enflasyon: 'tufe', yi: 'tufe'
  };
  const KOK = (t) => (t.length > 5 ? t.slice(0, 5) : t);
  function kelimeler(s) {
    return norm(s).split(/[^a-z0-9]+/).filter((t) => t.length > 1 && !DUR.has(t));
  }
  function kokler(s) {
    const out = [];
    kelimeler(s).forEach((t) => { out.push(KOK(t)); if (ES[t]) ES[t].split(' ').forEach((x) => out.push(KOK(x))); });
    return out;
  }
  const tl = (n) => (n == null || isNaN(n) ? '–' : Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL');
  const fd = (s) => { if (!s || !/^\d{4}-\d{2}-\d{2}/.test(s)) return s || '—'; const [y, m, d] = s.slice(0, 10).split('-'); return d + '.' + m + '.' + y; };
  const yuzde = (x) => (x == null || isNaN(x) ? '–' : '%' + (x * 100).toLocaleString('tr-TR', { maximumFractionDigits: 2 }));
  const ha = (x) => (x == null || isNaN(x) ? '—' : Number(x).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ha');
  SOR.fmt = { tl, fd, yuzde, ha };
  const AY = ['ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran', 'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik'];
  const AYAD = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const parkLink = (k) => '#/park?p=' + encodeURIComponent(k);

  // ---------- park tanıma ----------
  const OZEL = { ayko: 'Avrupa Yakası Kent Ormanı', 'kent ormani': 'Avrupa Yakası Kent Ormanı', mimarsinan: 'Mimar Sinan', hacibektas: 'Hacı Bektaş-i Veli', 'haci bektas': 'Hacı Bektaş-i Veli', bektas: 'Hacı Bektaş-i Veli', 'kurt yolu': 'Kurtyolu', 'turk kose': 'Türkköşe', 'tayakadin': 'Tayakadın' };
  function parkBul(soru, parks) {
    const q = ' ' + norm(soru).replace(/[^a-z0-9]+/g, ' ') + ' ', bul = new Set();
    Object.keys(OZEL).forEach((k) => { if (q.includes(' ' + k)) bul.add(OZEL[k]); });
    parks.forEach((p) => {
      const ws = norm(p.kisa).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !['orman', 'parki', 'kent'].includes(w));
      if (ws.length && ws.every((w) => q.includes(' ' + w.slice(0, Math.max(4, Math.min(w.length, 6)))))) bul.add(p.kisa);
    });
    if (!bul.size) {
      const rak = (q.match(/\b\d{9,11}\b/g) || []);
      parks.forEach((p) => { if (rak.some((r) => [p.vkn, p.vkn_muh].some((v) => v && String(v).replace(/\D/g, '').replace(/^0+/, '') === r.replace(/^0+/, '')))) bul.add(p.kisa); });
      const yer = new Set(parks.flatMap((p) => [p.ilce, p.seflik, p.mahalle, p.il].map((x) => norm(x || '')).filter(Boolean)).concat(['istanbul', 'buyuksehir', 'arnavutkoy', 'sultangazi', 'eyupsultan', 'sariyer', 'kagithane', 'gungoren', 'bayrampasa']));
      if (!bul.size) parks.forEach((p) => { const w = norm(p.isletmeci || '').split(/[^a-z0-9]+/).filter((x) => x.length >= 5 && !yer.has(x) && !['belediye', 'baskanligi', 'limited', 'sirketi', 'ticaret', 'sanayi', 'turizm', 'insaat', 'hizmetleri', 'yatirim'].includes(x)); if (w.length && q.includes(' ' + w[0])) bul.add(p.kisa); });
    }
    return parks.filter((p) => bul.has(p.kisa));
  }
  SOR.parkBul = parkBul;
  function yilBul(soru, rapor) {
    const q = norm(soru), y0 = Number(String(rapor || '').slice(0, 4)) || new Date().getFullYear();
    const m = q.match(/\b(20[1-4]\d)\b/); if (m) return Number(m[1]);
    if (/(gelecek|sonraki|onumuzdeki|yeni|ertesi) yil|seneye|gelecek sene/.test(q)) return y0 + 1;
    if (/(gecen|onceki|gecmis) yil|gecen sene|gectigimiz yil/.test(q)) return y0 - 1;
    return null;
  }
  SOR.yilBul = yilBul;
  function maddeBul(soru) {
    const q = norm(soru);
    let m = q.match(/gecici\s*madde\s*(\d{1,2})|gec\.?\s*(?:md\.?|madde)?\s*(\d{1,2})/); if (m) return 'G' + (m[1] || m[2]);
    m = q.match(/\b(?:madde|md|m)\.?\s*(\d{1,2})\b/) || q.match(/\b(\d{1,2})\s*\.?\s*(?:madde|md)\b/); if (m) return String(Number(m[1]));
    return null;
  }
  SOR.maddeBul = maddeBul;

  // ---------- dizin ----------
  // ctx: { parks, rapor, al, muhasebe, teblig, gyp, durumlar, tufe, denetim, defter, takip, planRev, ekKira, planAl(Y), ekler }
  SOR.dizin = function (ctx) {
    const docs = [];
    const ekle = (d) => { d.k = kokler([d.baslik, d.metin, d.park].join(' ')); docs.push(d); };
    (ctx.parks || []).forEach((p) => {
      const h = p.harita || {};
      const sat = [['Tam adı', p.ad], ['Durum', p.durum], ['Şeflik', p.seflik], ['İl/ilçe/köy', [p.il, p.ilce, p.mahalle, p.mevki].filter(Boolean).join(' · ')], ['Bölme', p.bolme],
        ['Kayıtlı alan', p.alan != null ? ha(p.alan) : ''], ['Haritadan alan', h.alan_ha != null ? ha(h.alan_ha) : ''], ['İşletmeci', p.isletmeci], ['Vergi/T.C. no', p.vkn], ['Yetkili', p.yetkili],
        ['Telefon', p.tel], ['E-posta', p.eposta], ['Adres', p.adres], ['İhale tarihi', fd(p.ihale_t)], ['İhale bedeli', p.ihale_b != null ? tl(p.ihale_b) : ''],
        ['Sözleşme', (p.soz_bas || p.soz_bit) ? fd(p.soz_bas) + ' – ' + fd(p.soz_bit) : ''], ['Saha teslimi', fd(p.teslim)], ['Kira artışı', [p.artis, p.kural].filter(Boolean).join(' · ')],
        ['Ödeme', p.odeme], ['Kesin teminat', p.kesin != null ? tl(p.kesin) : ''], ['Güvence', p.guv != null ? yuzde(p.guv) : ''], ['Depozito', p.dep != null ? yuzde(p.dep) : ''],
        ['Güncel yıllık kira (muhasebe)', p.muh_kira != null ? tl(p.muh_kira) : ''], ['Plan', p.plan], ['GYP onayı', fd(p.gyp_onay)], ['Notlar', p.notlar], ['Yapılacaklar', p.yapilacak]]
        .filter((x) => x[1] && x[1] !== '—' && x[1] !== '— – —');
      ekle({ tur: 'Park', park: p.kisa, baslik: p.ad || p.kisa, link: parkLink(p.kisa), satirlar: sat, metin: sat.map((x) => x[0] + ': ' + x[1]).join('. '), ozet: [p.isletmeci, p.durum, p.alan != null ? ha(p.alan) : ''].filter(Boolean).join(' · '), agirlik: 1.4 });
    });
    (ctx.teblig || []).forEach((m) => {
      const ad = m.no[0] === 'G' ? 'Geçici Madde ' + m.no.slice(1) : 'Madde ' + m.no;
      ekle({ tur: 'Tebliğ', madde: m.no, baslik: ad + ' · ' + (m.baslik || ''), link: '#/teblig', mdLink: m.no, metin: (m.bolum || '') + ' ' + (m.metin || []).join(' '), ozet: (m.metin || []).join(' ').slice(0, 220), agirlik: 1.1 });
    });
    (ctx.al || []).forEach((a) => {
      if (!a.park) return;
      ekle({ tur: 'Alacak', park: a.park, baslik: a.park + ' · ' + (a.tur || '') + ' · ' + a.durum, link: '#/alacaklar?p=' + encodeURIComponent(a.park),
        metin: [a.aciklama, a.grup, a.kaynak, a.vnot, 'vade ' + fd(a.esas), 'tutar ' + tl(a.tutar), a.durum, a.odeme ? 'ödeme ' + fd(a.odeme) : 'ödenmedi'].filter(Boolean).join(' · '),
        ozet: tl(a.tutar) + ' · vade ' + fd(a.esas) + ' · ' + a.durum + (a.gz ? ' · gecikme zammı ' + tl(a.gztop) : ''), agirlik: 0.9 });
    });
    (ctx.muhasebe || []).forEach((x) => {
      ekle({ tur: 'Muhasebe', park: x.park || '', baslik: 'Yev. ' + x.yev + ' · ' + fd(x.tarih) + ' · ' + (x.musteri || ''), link: '#/muhasebe', yev: x.yev,
        metin: [x.aciklama, x.neden, x.hesap, x.musteri, x.vkn, x.not_].filter(Boolean).join(' · '), ozet: (x.aciklama || '') + ' · ' + tl(x.borc || x.alacak), agirlik: 0.7 });
    });
    (ctx.denetim || []).forEach((d) => {
      const kv = Object.entries(d).filter(([k, v]) => !['park', 'donem', 'tarih', 'id'].includes(k) && v != null && typeof v !== 'object' && String(v).length);
      ekle({ tur: 'Denetim', park: d.park, baslik: d.park + ' · ' + (d.donem || '') + ' denetimi', link: '#/denetim?p=' + encodeURIComponent(d.park), satirlar: kv.map(([k, v]) => [k, String(v)]),
        metin: kv.map(([k, v]) => k + ': ' + v).join('. '), ozet: fd(d.tarih) + ' · ' + kv.slice(0, 3).map(([k, v]) => k + ': ' + v).join(' · '), agirlik: 1 });
    });
    (ctx.defter || []).forEach((d) => ekle({ tur: 'Kayıt defteri', park: d.park, baslik: (d.park || '') + ' · ' + (d.konu || '') + ' · ' + fd(d.tarih), link: '#/defter', metin: [d.aciklama, d.belge, d.tutar != null ? tl(d.tutar) : ''].filter(Boolean).join(' · '), ozet: d.aciklama || '', agirlik: 0.9 }));
    (ctx.takip || []).forEach((d) => ekle({ tur: 'Yazışma', park: d.park, baslik: (d.park || '') + ' · ' + (d.yon || '') + ' yazı · ' + fd(d.tarih), link: '#/islem?p=' + encodeURIComponent(d.park || ''), metin: [d.konu, d.ozet, d.sayi].filter(Boolean).join(' · '), ozet: (d.sayi || '') + ' · ' + (d.konu || ''), agirlik: 1 }));
    (ctx.planRev || []).forEach((d) => ekle({ tur: 'Plan revizyonu', park: d.park, baslik: d.park + ' · ' + (d.revize || '') + ' · onay ' + fd(d.onay), link: '#/denetim?p=' + encodeURIComponent(d.park), metin: [d.aciklama, d.sayi, d.ek != null ? 'ek kira ' + tl(d.ek) : ''].filter(Boolean).join(' · '), ozet: d.aciklama || '', agirlik: 1.1 }));
    (ctx.ekler || []).forEach(([kod, ad]) => ekle({ tur: 'Form', baslik: kod + ' · ' + ad, link: '#/ekler', ek: kod, metin: kod + ' ' + ad, ozet: ad, agirlik: 0.9 }));
    // harita: tür bazında özet (tek tek tesis de aranabilir)
    const gyp = ctx.gyp && ctx.gyp.parklar || {};
    Object.entries(gyp).forEach(([k, g]) => {
      const arsiv = new Set((g.planlar || []).filter((x) => x.durum === 'arsiv').map((x) => x.id));
      const say = {};
      (g.f || []).forEach((f) => {
        if (arsiv.has(f.p) || f._geo?.length || f._repeat) return;
        say[f.t] = (say[f.t] || 0) + 1;
        if (f.ad || f.k) ekle({ tur: 'Tesis', park: k, baslik: k + ' · ' + (f.ad || f.k) + ' · ' + f.t, link: '#/harita?p=' + encodeURIComponent(k) + (f.id ? '&t=' + encodeURIComponent(f.id) : ''),
          metin: [f.t, f.ad, f.k, (ctx.durumlar || {})[f.d], (f.b || []).map((x) => x.join(': ')).join('. ')].filter(Boolean).join(' · '), ozet: [f.t, (ctx.durumlar || {})[f.d]].filter(Boolean).join(' · '), agirlik: 0.6 });
      });
      const list = Object.entries(say).sort((a, b) => b[1] - a[1]);
      if (list.length) ekle({ tur: 'Harita', park: k, baslik: k + ' · güncel plan tesisleri', link: '#/harita?p=' + encodeURIComponent(k), satirlar: list.map(([t, n]) => [t, String(n)]), metin: list.map(([t, n]) => t + ' ' + n).join(', ') + ' ' + (g.eksik || []).map((e) => e.konu).join(' '), ozet: list.slice(0, 6).map(([t, n]) => t + ' ' + n).join(' · '), agirlik: 1.2 });
    });
    // BM25 ön hesap
    const df = {}; let top = 0;
    docs.forEach((d) => { d.tf = {}; d.k.forEach((t) => { d.tf[t] = (d.tf[t] || 0) + 1; }); d.n = d.k.length; top += d.n; Object.keys(d.tf).forEach((t) => { df[t] = (df[t] || 0) + 1; }); });
    return { docs, df, ort: top / Math.max(1, docs.length), N: docs.length, ctx };
  };

  function ara(dz, soru, parkSec, sinir) {
    const q = [...new Set(kokler(soru))]; if (!q.length) return [];
    const pk = new Set(parkSec.map((p) => p.kisa)), parkKok = new Set(parkSec.flatMap((p) => kokler(p.kisa)));
    const sonuc = [];
    dz.docs.forEach((d) => {
      let s = 0, es = 0;
      q.forEach((t) => {
        const f = d.tf[t]; if (!f) return; es++;
        if (parkKok.has(t) && pk.size) return; // park adı tek başına puanlamasın; park filtresi aşağıda
        const idf = Math.log(1 + (dz.N - dz.df[t] + 0.5) / (dz.df[t] + 0.5));
        s += idf * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * d.n / dz.ort));
      });
      if (pk.size) { if (!pk.has(d.park)) return; s += 1.5; if (!es) return; }
      if (s <= 0) return;
      s *= d.agirlik || 1;
      s *= 1 + 0.15 * (es / q.length);
      sonuc.push({ d, s });
    });
    sonuc.sort((a, b) => b.s - a.s);
    return sonuc.slice(0, sinir || 40).map((x) => Object.assign({ skor: x.s }, x.d));
  }

  // ---------- doğrudan cevaplar ----------
  const var_ = (q, re) => re.test(q);
  function cevapTahakkuk(ctx, parks, Y) {
    const out = [];
    parks.forEach((p) => {
      const pl = ctx.planAl && ctx.planAl(Y, p); if (!pl) return;
      const sat = [['Yıl / dönem', Y + (pl.donem ? ' · ' + pl.donem + '. dönem' : '')], ['Durum', pl.durum || (pl.kira != null ? 'Hesaplandı' : '—')]];
      if (pl.kira != null) {
        sat.push(['Yıllık kira', tl(pl.kira)]);
        if (pl.tufe != null) sat.push(['Artış oranı', yuzde(pl.tufe) + (pl.tufeAy ? ' (' + AYAD[pl.tufeAy[1] - 1] + ' ' + pl.tufeAy[0] + ' TÜFE, 12 aylık ort.)' : '')]);
        const zz = Y >= 2027 && ctx.yilbasiAl ? ((ctx.yilbasiAl(Y, p) || {}).zincir || []).filter((x) => x.bedel != null) : [], onc = zz[zz.length - 2];
        if (onc) sat.push(['Esas (' + (Y - 1) + ' kirası' + (onc.ek ? ' + ek tesis kirası' : '') + ')', tl(onc.bedel) + (onc.ek ? ' + ' + tl(onc.ek) + ' = ' + tl(r2(onc.bedel + onc.ek)) : '')]);
        else if (pl.esasBedeli != null) sat.push(['Esas alınan kira', tl(pl.esasBedeli) + (pl.esasYili ? ' (' + pl.esasYili + ')' : '')]);
        sat.push(['%5 ağaçlandırma', tl(pl.agac)], ['%20 KDV', tl(pl.kdv)], ['Fiş toplamı', tl(ctx.fisKalemleri?.(pl)?.toplam ?? pl.toplam)]);
        if (pl.guvFark != null) sat.push(['Güvence farkı', tl(pl.guvFark)]);
        if (pl.depFark != null) sat.push(['Depozito farkı', tl(pl.depFark)]);
        (pl.vadeler || []).forEach((v, i) => sat.push([(pl.vadeler.length > 1 ? (i + 1) + '. taksit' : 'Peşin') + ' · ' + fd(v.vade), tl(ctx.fisKalemleri?.(pl, i + 1)?.toplam ?? r2(v.kira + v.agac + v.kdv))]));
      } else if (pl.yayim) sat.push(['TÜFE yayımı', fd(pl.yayim) + ' (TÜİK); yayımlanınca kendiliğinden hesaplanır']);
      if (pl.kira == null && ctx.yilbasiAl && Y >= 2027) {
        const ky = ctx.yilbasiAl(Y, p), z = ky && ky.zincir && ky.zincir.filter((x) => x.bedel != null).pop();
        if (z && z.bedel != null) {
          const esas = r2(z.bedel + (z.ek || 0));
          sat.push(['Esas (' + (Y - 1) + ' kirası' + (z.ek ? ' + ek tesis kirası' : '') + ')', tl(z.bedel) + (z.ek ? ' + ' + tl(z.ek) + ' = ' + tl(esas) : '')]);
          sat.push([Y + ' kirası', tl(esas) + ' × (1 + Aralık ' + (Y - 1) + ' TÜFE); 1 Ocak ' + Y + '’ten. TÜFE ' + fd(Y + '-01-03') + ' civarı yayımlanınca kendiliğinden dolar.']);
        }
      }
      if (pl.kiraEsasi) sat.push(['Hesap kuralı', pl.kiraEsasi]);
      out.push({ baslik: p.kisa + ' · ' + Y + ' kira ve tahakkuku', satirlar: sat, link: '#/tahakkuk?p=' + encodeURIComponent(p.kisa) + '&y=' + Y, linkAd: 'Kira ve Tahakkuk sayfasında aç', ek: { formTF: p.kisa, yil: Y } });
    });
    return out;
  }
  const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
  function tesisSay(ctx, parks, soru) {
    const gyp = ctx.gyp && ctx.gyp.parklar; if (!gyp) return null;
    const q = kelimeler(soru).filter((w) => !/^park/.test(w) && !['kac', 'sayi', 'sayisi', 'adet', 'tane', 'tesis', 'tesisi', 'tesisler', 'mevcut', 'planlanan', 'toplam'].includes(w));
    const hedef = q.map((w) => KOK(ES[w] || w)).filter((w) => w.length >= 2 && !parks.some((p) => kokler(p.kisa).includes(w)));
    if (!hedef.length) return null;
    const durum = /mevcut|insa edil|yapilmis/.test(norm(soru)) ? 'M' : /planlanan|yapilacak|onerilen/.test(norm(soru)) ? 'P' : null;
    const P = parks.length ? parks.map((p) => p.kisa) : Object.keys(gyp);
    const rows = []; let toplam = 0; const turler = new Set(); let liste = [];
    P.forEach((k) => {
      const g = gyp[k]; if (!g) return; const arsiv = new Set((g.planlar || []).filter((x) => x.durum === 'arsiv').map((x) => x.id));
      const sayP = {}, featP = {};
      (g.f || []).forEach((f) => {
        if (arsiv.has(f.p) || f._geo?.length || f._repeat || (durum && f.d !== durum) || (f.b || []).some((x) => x[0] === 'Parça')) return;
        const say = sayP[f.p || ''] = sayP[f.p || ''] || {};
        let ad = null;
        if (hedef.every((h) => kokler(f.t).includes(h))) ad = f.t;
        else if (!String(f.ad || '').startsWith(f.t) && !/yol|patika|cizgi|cit/i.test(f.t) && /\s[–-]\s/.test(String(f.ad || ''))) { const a = String(f.ad || '').split(/\s[–-]\s/).pop(); if (a && a.length < 60 && hedef.every((h) => kokler(a).includes(h))) ad = a.trim(); }
        if (ad) { say[ad] = (say[ad] || 0) + 1; turler.add(ad); (featP[f.p || ''] = featP[f.p || ''] || []).push(f); }
      });
      if (P.length === 1) { const en = Object.values(featP).sort((a, b) => (b.length - a.length) || (b.filter((f) => f.g === 'N').length - a.filter((f) => f.g === 'N').length))[0] || []; liste = en.map((f) => ({ f, k })); }
      // Aynı tesis birden çok güncel katmanda (ör. koordinat cetveli noktaları ve sayısal plan poligonları) çizilmiş olabilir: her tür için en çok çizimi olan katman sayılır.
      const say = {}; Object.values(sayP).forEach((o) => Object.entries(o).forEach(([t, m]) => { say[t] = Math.max(say[t] || 0, m); }));
      const n = Object.values(say).reduce((a, b) => a + b, 0); if (n) { rows.push([k, n, Object.entries(say).map(([t, m]) => t + ' ' + m).join(', ')]); toplam += n; }
    });
    if (!turler.size) return null;
    rows.sort((a, b) => b[1] - a[1]);
    const DA = { M: 'mevcut', P: 'planlanan', K: 'kaldırılacak', O: 'önceki planda, yapılmamış', V: 'onaylı vaziyet planında', B: 'durumu belirtilmemiş', A: 'bilgi' };
    const bv = (f, k) => ((f.b || []).find((x) => x[0] === k) || [])[1];
    const yerler = liste.length && (liste.length <= 12 || /nerede|konum|yer(i|leri)?\b|goster|harita/.test(norm(soru))) ? liste.slice(0, 40).map(({ f, k }) => ({ ad: f.ad && f.ad !== f.t ? f.ad : f.t, alt: [DA[f.d] || '', bv(f, 'Kısım'), bv(f, 'Cetvel grubu') && f.d !== 'M' ? bv(f, 'Cetvel grubu') : ''].filter(Boolean).join(' · '), link: '#/harita?p=' + encodeURIComponent(k) + '&t=' + encodeURIComponent(f.id || '') })) : null;
    const dsay = {}; liste.forEach(({ f }) => { dsay[DA[f.d] || 'diğer'] = (dsay[DA[f.d] || 'diğer'] || 0) + 1; });
    const dozet = Object.keys(dsay).length > 1 ? Object.entries(dsay).map(([d, n]) => d + ' ' + n).join(' · ') : '';
    return { yerler, baslik: [...turler].slice(0, 3).join(', ') + (durum ? (durum === 'M' ? ' (planda mevcut)' : ' (planlanan)') : '') + ' · toplam ' + toplam, tablo: { b: ['Park', 'Adet', 'Tür'], s: rows }, link: '#/harita' + (parks.length === 1 ? '?p=' + encodeURIComponent(parks[0].kisa) : ''), linkAd: 'Haritada aç', metin: dozet ? 'Durum: ' + dozet : '', not: 'Sayım arşiv dışındaki plan çizimlerinden gelir; aynı tesis hem nokta hem poligon olarak çizildiyse bir kez sayılır. Plan onayı ve saha teyidi haritada belirtilir.' };
  }

  // Önceki soruya bağlı kısa sorular ("peki 2026?", "sözleşmesi ne zaman bitiyor") önceki parkı ve yılı devralır.
  const DEVAM = /^(peki|ya|bunun|onun|onunki|bu park|o park|ayni|aynisi|ayrica|bir de|simdi)\b|\b(bunun|onun|bu parkin|o parkin)\b/;
  SOR.sor = function (dz, soru, onceki) {
    const ctx = dz.ctx, ns = norm(soru);
    let parks = parkBul(soru, ctx.parks || []), devraldi = false;
    const devamUygun = !/(nasil|nedir|ne demek|madde|devri|devir|sart|kosul|kural|fesih|feshi|tahliye|alt kira|hesaplanir|yapilabilir|mevzuat|\bmd\b|teblig|tufe|gecikme zammi orani|yevmiye|\bek\s*-?\d|merhaba|selam|tesekkur|hangi|\btum\b|butun|parklar|\ben |\bsef|mudur)/.test(ns) &&
      (DEVAM.test(ns) || (kelimeler(soru).length <= 3 && /kira|sozlesme|teminat|guvence|depozito|isletmeci|alan|borc|tahakkuk|taksit|vade|plan|tesis|denetim|yazi|ihale|durum|20\d\d|telefon|adres|odeme/.test(ns)));
    if (!parks.length && onceki && onceki.parks && onceki.parks.length && devamUygun) { parks = (ctx.parks || []).filter((p) => onceki.parks.includes(p.kisa)); devraldi = parks.length > 0; }
    const q = parks.reduce((s, p) => s.split(norm(p.kisa)).join(' '), ns), md = maddeBul(soru);
    let Y = yilBul(soru, ctx.rapor); if (!Y && devraldi && onceki.yil) Y = onceki.yil;
    const yil0 = Number(String(ctx.rapor).slice(0, 4));
    const cevaplar = [];
    const P = (fn) => parks.map(fn).filter(Boolean);
    // 1. Tebliğ maddesi
    if (md && ctx.teblig) { const m = ctx.teblig.find((x) => x.no === md); if (m) cevaplar.push({ baslik: (md[0] === 'G' ? 'Geçici Madde ' + md.slice(1) : 'Madde ' + md) + ' · ' + (m.baslik || ''), metin: (m.metin || []).join('\n'), link: '#/teblig', mdLink: md, linkAd: 'Tebliğ sayfasında aç', kaynak: '313 sayılı Orman Parkları Tebliği (resmî metin)' }); }
    // 2. kira / tahakkuk / taksit
    if (var_(q, /kira|tahakkuk|taksit|vade|kdv|agaclandirma|odenecek|fis|ne zaman ode|odeme yap|odeme tarih|odeyecek/) && !var_(q, /odenmedi|odenmemis|borc|gecikme|alacak|ek kira|ek tesis|revize|nasil|hesaplanir|artisi|toplam|en (yuksek|dusuk|cok|az)|kirada|kiralama|alt kira|yapilabilir/)) {
      const PP = parks.length ? parks : (var_(q, /tum|butun|hepsi|parklar/) ? (ctx.parks || []).filter((p) => p.durum === 'Kirada') : []);
      if (PP.length) {
        const yy = Y || yil0;
        if (PP.length === 1) cevaplar.push(...cevapTahakkuk(ctx, PP, yy));
        else { const rows = PP.map((p) => { const pl = ctx.planAl(yy, p) || {}; let esas = '';
            if (yy >= 2027 && ctx.yilbasiAl) { const ky = ctx.yilbasiAl(yy, p), zz = ky && ky.zincir ? ky.zincir.filter((x) => x.bedel != null) : [], z = pl.kira != null ? zz[zz.length - 2] : zz[zz.length - 1]; if (z && z.bedel != null) esas = tl(r2(z.bedel + (z.ek || 0))); }
            return [p.kisa, esas, pl.kira != null ? tl(pl.kira) : (pl.durum || '—'), pl.toplam != null ? tl(pl.toplam) : '', (pl.vadeler || []).map((v) => fd(v.vade)).join(', ')]; });
          cevaplar.push({ baslik: yy + ' yılı kira ve tahakkukları', tablo: { b: ['Park', 'Esas (önceki yıl + ek tesis)', 'Yıllık kira', 'KDV ve ağaçlandırma dahil', 'Vadeler'], s: rows }, link: '#/tahakkuk', linkAd: 'Kira ve Tahakkuk sayfası', not: yy >= 2027 ? '2027 ve sonrası: önceki yıl kirası (+ o yıl onaylanan ek tesis kirası) × (1 + Aralık TÜFE 12 aylık ort.), 1 Ocak’tan.' : '' }); }
      }
    }
    // 2b. selamlaşma
    if (/^(merhaba|selam|gunaydin|iyi gunler|iyi aksamlar|hey|sa|slm)\b/.test(ns) && kelimeler(soru).length <= 3) cevaplar.push({ baslik: 'Merhaba, buyurun', metin: 'Parklar, sözleşmeler, kira ve tahakkuklar, alacaklar, tesisler ve Tebliğ hakkında sorabilirsiniz. Örnek: “Tayakadın 2027 kira”, “borcu olan parklar”, “Kayabaşı kaç kameriye”, “Md. 35”.' });
    if (/^(tesekkur|sagol|eyvallah|tamam|ok|harika|super)/.test(ns) && kelimeler(soru).length <= 3) cevaplar.push({ baslik: 'Rica ederim', metin: 'Başka bir sorunuz olursa buradayım.' });
    // 2c. Ek-N formu
    const ekm = ns.match(/\bek\s*-?\s*(\d{1,2})\b/);
    if (ekm && !/ek (kira|tesis|yapi)/.test(ns)) { const kod = 'Ek-' + Number(ekm[1]), ad = (ctx.ekler || []).find((e) => e[0] === kod); if (ad) cevaplar.push({ baslik: kod + ' · ' + ad[1], metin: '313 sayılı Tebliğ ekindeki form. Seçili park bilgileriyle Mevzuat ve Formlar › Ekler ve Formlar sayfasından açılır' + (parks.length === 1 ? ' (' + parks[0].kisa + ')' : '') + '.', link: '#/ekler', linkAd: 'Ekler ve Formlar', ek: { form: kod, park: parks.length === 1 ? parks[0].kisa : '' } }); }
    // 2d. park sayısı ve özet
    if (!parks.length && /(kac|toplam|kac tane).*(park|mesire)|(park|mesire).*(sayisi|kac tane)/.test(ns)) {
      const P = ctx.parks || [], by = {}; P.forEach((p) => { by[p.durum || '—'] = (by[p.durum || '—'] || 0) + 1; });
      cevaplar.push({ baslik: P.length + ' orman parkı kayıtlı', satirlar: Object.entries(by).map(([k, v]) => [k, v + ' park']).concat([['Toplam kayıtlı alan', ha(P.reduce((s, p) => s + (p.alan || 0), 0))]]), link: '#/parklar', linkAd: 'Park envanteri' });
    }
    // 2e. en büyük / küçük / yüksek kira / toplam kira
    if (!parks.length && /\ben (buyuk|kucuk|genis|dar|yuksek|dusuk|pahali|ucuz|fazla|az)\b/.test(ns) && !/borc|alacak/.test(ns)) {
      const kiraM = /kira|bedel|pahali|ucuz|gelir/.test(ns), azM = /(kucuk|dar|dusuk|ucuz|az)\b/.test(ns);
      const L = (ctx.parks || []).map((p) => [p, kiraM ? (p.durum === 'Kirada' ? p.muh_kira : null) : p.alan]).filter((x) => x[1] != null).sort((a, b) => azM ? a[1] - b[1] : b[1] - a[1]);
      if (L.length) cevaplar.push({ baslik: (kiraM ? (azM ? 'En düşük kira: ' : 'En yüksek kira: ') : (azM ? 'En küçük park: ' : 'En büyük park: ')) + L[0][0].kisa + ' · ' + (kiraM ? tl(L[0][1]) : ha(L[0][1])), tablo: { b: ['Sıra', 'Park', kiraM ? 'Yıllık kira (muhasebe)' : 'Kayıtlı alan'], s: L.slice(0, 10).map((x, i) => [String(i + 1), x[0].kisa, kiraM ? tl(x[1]) : ha(x[1])]) }, link: '#/parklar', linkAd: 'Park envanteri' });
    }
    if (!parks.length && /toplam (kira|gelir)|kira geliri|yillik gelir/.test(ns)) {
      const yy = Y || yil0, L = (ctx.parks || []).filter((p) => p.durum === 'Kirada').map((p) => [p, ctx.planAl ? ctx.planAl(yy, p) : null]).map(([p, pl]) => [p.kisa, pl && pl.kira != null ? pl.kira : null]);
      const top = L.reduce((s, x) => s + (x[1] || 0), 0), eks = L.filter((x) => x[1] == null).map((x) => x[0]);
      cevaplar.push({ baslik: yy + ' toplam yıllık kira: ' + tl(r2(top)), tablo: { b: ['Park', 'Yıllık kira (KDV hariç)'], s: L.sort((a, b) => (b[1] || 0) - (a[1] || 0)).map((x) => [x[0], x[1] != null ? tl(x[1]) : 'hesaplanmadı']) }, not: eks.length ? 'Toplama girmeyen: ' + eks.join(', ') + ' (TÜFE bekleniyor ya da sözleşme bilgisi eksik).' : 'Kirada olan bütün parklar dahil; ağaçlandırma ve KDV hariç.', link: '#/tahakkuk', linkAd: 'Kira ve Tahakkuk' });
    }
    // 2e2. bilgi notu: parkın bilgi notu sayfası (şablonlu Word/PDF)
    if (/bilgi not/.test(ns)) (parks.length ? parks : []).slice(0, 3).forEach((p) => cevaplar.unshift({ baslik: p.kisa + ' · bilgi notu', metin: 'Bilgi notu, şablon biçimi korunarak ' + p.kisa + ' kayıtlarından doldurulur; konu yazılıp bölümler düzenlenebilir ve Word veya PDF olarak alınabilir.', link: '#/bilgi?p=' + encodeURIComponent(p.kisa), linkAd: 'Bilgi notunu hazırla' }));
    if (/bilgi not/.test(ns) && !parks.length) cevaplar.unshift({ baslik: 'Bilgi notu', metin: 'Hangi park için bilgi notu hazırlanacağını yazın (ör. “Tayakadın bilgi notu”) ya da Mevzuat ve Formlar › Bilgi Notu sayfasından parkı seçin.', link: '#/bilgi', linkAd: 'Bilgi Notu sayfası' });
    // 2f. kurum, şef ve müdür
    if (/\b(sef|sefi|mudur|muduru|mudurlugu|isletme mudur|iban|kep|kurum|isletmenin)\b/.test(ns) && !/isletmeci/.test(ns)) {
      const k = ctx.kurum || {}, sat = [['İşletme', k.isletme], ['İşletme Müdürü', (ctx.yetkili && ctx.yetkili.mudur) || k.mudur], ['İşletme Müdür Yardımcısı', (ctx.yetkili && ctx.yetkili.mudur_yrd) || k.mudur_yrd], ['Döner Sermaye Muhasebe Yetkilisi', (ctx.yetkili && ctx.yetkili.muhasebe) || k.muhasebe_yetkilisi], ['Birim', k.sube], ['Adres', k.adres], ['Telefon', k.tel], ['E-posta', k.eposta], ['KEP', k.kep], ['Banka', [k.banka, k.sube_banka].filter(Boolean).join(' · ')], ['IBAN', k.iban]].filter((x) => x[1]);
      const sefler = Object.entries(ctx.sefler || {}).map(([s, ad]) => [s + ' İşletme Şefi', ad]);
      const ilgiliSef = parks.length ? parks.map((p) => [p.kisa + ' · şeflik', (p.seflik || '—') + ((ctx.sefler || {})[p.seflik] ? ' · Şef: ' + ctx.sefler[p.seflik] : ' · şef adı kayıtlı değil')]) : [];
      const sorulan = ['istanbul', 'kemerburgaz', 'arnavutkoy', 'fenertepe'].find((s) => ns.includes(s));
      const ekNot = sorulan && !Object.keys(ctx.sefler || {}).some((s) => norm(s) === sorulan) ? 'Sitede ' + sorulan[0].toUpperCase() + sorulan.slice(1) + ' şefliğinin şef adı kayıtlı değil [TEYİT GEREKLİ].' : '';
      cevaplar.push({ baslik: 'Kurum ve şeflik bilgileri', satirlar: ilgiliSef.concat(sefler, sat), metin: ekNot, link: '#/veriler', linkAd: 'Veriler ve Ayarlar' });
    }
    // 2g. şefliğe / ilçeye göre parklar
    const sefq = ['arnavutkoy', 'fenertepe', 'kemerburgaz', 'istanbul', 'sariyer', 'eyupsultan', 'sultangazi', 'kagithane'].find((s) => ns.includes(s));
    if (sefq && /parklar|hangi park|parklari|seflig/.test(ns) && !parks.length) {
      const L = (ctx.parks || []).filter((p) => norm(p.seflik) === sefq || (!/sef/.test(ns) && norm(p.ilce) === sefq));
      if (L.length) cevaplar.push({ baslik: L.length + ' park · ' + (/sef/.test(ns) ? 'şeflik: ' : 'şeflik / ilçe: ') + sefq, tablo: { b: ['Park', 'Şeflik', 'İlçe', 'Durum'], s: L.map((p) => [p.kisa, p.seflik || '—', p.ilce || '—', p.durum || '—']) }, link: '#/parklar', linkAd: 'Park envanteri' });
    }
    // 2h. gecikme zammı oranı
    if (/gecikme zammi orani|gecikme orani|gecikme zammi kac|gz orani/.test(ns) && (ctx.gzOran || []).length) {
      const L = ctx.gzOran.slice().sort((a, b) => String(b[0]).localeCompare(String(a[0])));
      cevaplar.push({ baslik: 'Gecikme zammı oranı: aylık ' + yuzde(L[0][1]) + ' (' + fd(L[0][0]) + '’den beri)', tablo: { b: ['Yürürlük', 'Aylık oran'], s: L.slice(0, 6).map((x) => [fd(x[0]), yuzde(x[1])]) }, not: '6183 sayılı Kanun Md. 51 uyarınca Resmî Gazete’de yayımlanan oran; kira alacağının gecikme zammına KDV eklenir.', link: '#/alacaklar', linkAd: 'Alacak ve Tahsilat' });
    }
    // 2i. yevmiye kaydı
    const ym = ns.match(/\byev(?:miye)?\.?\s*(?:no\.?\s*)?(\d{1,6})\b/);
    if (ym) { const L = (ctx.muhasebe || []).filter((x) => String(x.yev) === ym[1]); if (L.length) cevaplar.push({ baslik: 'Yevmiye ' + ym[1] + ' · ' + L.length + ' satır', tablo: { b: ['Tarih', 'Hesap', 'Müşteri', 'Açıklama', 'Borç', 'Alacak'], s: L.slice(0, 20).map((x) => [fd(x.tarih), x.hesap || '', x.musteri || '', x.aciklama || '', x.borc ? tl(x.borc) : '', x.alacak ? tl(x.alacak) : '']) }, link: '#/muhasebe', linkAd: 'Hesap dökümleri' }); }
    // 2j. ek tesis kirası ve plan revizyonları
    if (parks.length && /ek kira|ek tesis|revize|revizyon|ek yapi/.test(q) && !/nasil|hesaplanir/.test(q)) parks.forEach((p) => {
      const R = (ctx.planRev || []).filter((r) => r.park === p.kisa), EKL = (ctx.ekKira || []).filter((e) => e.park === p.kisa);
      if (R.length || EKL.length) cevaplar.push({ baslik: p.kisa + ' · plan revizyonları ve ek tesis kiraları', tablo: { b: ['Revizyon', 'Onay', 'Yıllık ek kira', 'Açıklama'], s: R.map((r) => [r.revize || '', fd(r.onay), r.ek != null ? tl(r.ek) : '—', r.aciklama || '']).concat(EKL.filter((e) => !R.some((r) => r.ek === e.tutar)).map((e) => ['Ek kira (' + (e.donem || '') + '. dönem)', '', tl(e.tutar), e.not_ || ''])) }, not: 'Ek tesis kirası onaylandığı yılın tabanına eklenir; sonraki yılbaşında Aralık TÜFE ile birlikte artar.', link: '#/denetim?p=' + encodeURIComponent(p.kisa), linkAd: 'Denetim ve Planlar' });
    });
    // 2k. kavram → Tebliğ maddesi (park adı yoksa ya da "nasıl / nedir" soruluyorsa)
    if (!md && ctx.teblig && (!parks.length || /nasil|nedir|ne demek|mevzuat|madde|teblig|kural/.test(q))) {
      const KAV = [[/kira artis|yillik artis|bedel artis|artis orani|kira nasil art|kira artisi/, '32'], [/ek (tesis|yapi)/, '30'], [/alt (isletme|kira)/, '38'], [/fesih|feshi|sona erme|sozlesme(nin)? biti/, '40'], [/devir|devr/, '35'], [/kesin teminat/, '9'], [/gecici teminat/, '8'], [/guvence|depozito/, '10'], [/tahliye/, '41'], [/denetim/, '42'], [/sozlesme suresi|kac yil|kira suresi/, '36'], [/odenmeme|odemezse|odenmezse|vadesi gelen/, '39'], [/agaclandirma bedel/, '33'], [/giris ucret/, '34'], [/saha teslim/, '27'], [/plan yapim sure/, '19'], [/hizmete acil/, '29'], [/sinir degisik/, '24'], [/statu degisik/, '25'], [/iptal/, '26'], [/bedel(lerin)? hesap|odeme sekli|taksitle|pesin/, '31'], [/mucbir|imkansiz/, '37'], [/tebligat/, '46'], [/tahmin edilen bedel/, '7']];
      const hit = KAV.find(([re]) => re.test(q));
      if (hit) { const m = ctx.teblig.find((x) => x.no === hit[1]); if (m && !cevaplar.some((c) => c.mdLink === m.no)) cevaplar.push({ baslik: 'Madde ' + m.no + ' · ' + (m.baslik || ''), metin: (m.metin || []).join('\n'), link: '#/teblig', mdLink: m.no, linkAd: 'Tebliğ sayfasında aç', kaynak: '313 sayılı Orman Parkları Tebliği (resmî metin)' }); }
    }
    // 3. alacak / borç
    if (var_(q, /borc|odenmedi|odenmemis|alacak|gecikme|tahsil|odeme durumu|odedi|odemis/)) {
      const belgeli = (ctx.belgeliBorclar || []).filter(b => !parks.length || parks.some(p => p.kisa === b.park));
      for (const b of belgeli) cevaplar.push({ baslik: b.park + ' · Belgeli borç (' + fd(b.hesap_tarihi) + ')',
        satirlar: [['Belgeli toplam', tl(b.toplam)], ['Kira ve vergi/fon anaparası', tl(b.anapara)],
          ['2025 bakiyesine işleyen gecikme ve KDV', tl(b.hesaplanan)], ['Tahakkuk etmiş 2026 gecikme bedeli ve KDV', tl(b.tahakkuk + b.kdv)],
          ...(b.calismaToplami != null ? [[fd(ctx.rapor) + ' çalışma hesabı (tahsilat teyidi bekliyor)', tl(b.calismaToplami)]] : [])],
        kaynak: fd(b.belge_tarihi) + ' tarihli ' + b.sayi + ' sayılı yazı. Sonraki tahsilatlar teyit bekliyor.',
        link: '#/alacaklar?p=' + encodeURIComponent(b.park), linkAd: 'Borç kalemleri ve imzalı yazı' });
      const al = (ctx.al || []).filter((a) => (!parks.length || parks.some((p) => p.kisa === a.park)));
      const acik = al.filter((a) => a.durum === 'Ödenmedi');
      const by = {}; acik.forEach((a) => { const o = by[a.park] = by[a.park] || { n: 0, t: 0, gz: 0, en: null }; o.n++; o.t += a.tutar; o.gz += a.gztop || 0; if (!o.en || a.esas < o.en) o.en = a.esas; });
      const rows = Object.entries(by).sort((a, b) => b[1].t - a[1].t).map(([k, o]) => [k, String(o.n), tl(r2(o.t)), tl(r2(o.gz)), fd(o.en)]);
      cevaplar.push(rows.length ? { baslik: 'Muhasebe dökümündeki açık kalemler' + (parks.length === 1 ? ' · ' + parks[0].kisa : '') + ' · ' + fd(ctx.rapor), tablo: { b: ['Park', 'Kalem', 'Anapara', 'Bu kalemlerin GZ ve KDV’si', 'En eski vade'], s: rows }, link: '#/alacaklar' + (parks.length === 1 ? '?p=' + encodeURIComponent(parks[0].kisa) : ''), linkAd: 'Alacak ve Tahsilat sayfası', not: 'Muhasebe dökümündeki kalemler ve bunlara işleyen gecikme gösterilir. Yazıyla takip edilen ayrı borçlar belgeli hesap bölümünde yer alır.' }
        : { baslik: (parks.length === 1 ? parks[0].kisa + ': ' : '') + 'vadesi geçmiş ödenmemiş alacak yok', metin: 'Muhasebe dökümünde ' + fd(ctx.rapor) + ' itibarıyla açık kalem bulunmadı.', link: '#/alacaklar', linkAd: 'Alacak ve Tahsilat sayfası' });
    }
    // 4. kaç tesis
    if (var_(q, /\bkac\b|sayisi|adet|kac tane|toplam|hangi|nerede|var mi|bulunan|olan/)) { const c = tesisSay(ctx, parks, soru); if (c) cevaplar.push(c); }
    // 5. park alanları
    if (parks.length) {
      const alan = [];
      if (var_(q, /sozlesme|bitis|bitiyor|biter|sona er|suresi|baslangic|ne zaman/)) P((p) => alan.push([p.kisa + ' · sözleşme', fd(p.soz_bas) + ' – ' + fd(p.soz_bit) + (p.soz_bit && p.soz_bit < ctx.rapor ? ' (sona erdi)' : p.soz_bit ? ' (' + Math.max(0, Math.round((Date.parse(p.soz_bit) - Date.parse(ctx.rapor)) / 864e5 / 365.25 * 10) / 10).toLocaleString('tr-TR') + ' yıl kaldı)' : '')]));
      if (var_(q, /isletmeci|kiraci|kim isletiyor|firma|yuklenici|yetkili|telefon|tel\b|e-?posta|mail|adres|iletisim|vergi|vkn/)) P((p) => { alan.push([p.kisa + ' · işletmeci', p.isletmeci || '—']); if (p.yetkili) alan.push(['Yetkili', p.yetkili]); if (p.tel) alan.push(['Telefon', p.tel]); if (p.eposta) alan.push(['E-posta', p.eposta]); if (p.adres) alan.push(['Adres', p.adres]); if (p.vkn) alan.push(['Vergi/T.C. no', p.vkn]); });
      if (var_(q, /teminat|guvence|depozito/)) P((p) => { alan.push([p.kisa + ' · kesin teminat', p.kesin != null ? tl(p.kesin) : '—']); alan.push(['Güvence oranı', yuzde(p.guv)], ['Depozito oranı', yuzde(p.dep)]); });
      if (var_(q, /alan|hektar|\bha\b|buyukluk|konum|nerede|ilce|koy|bolme|sinir/) && !cevaplar.some((c) => c.yerler)) P((p) => { alan.push([p.kisa + ' · kayıtlı alan', ha(p.alan)], ['Haritadan alan', ha(p.harita && p.harita.alan_ha)], ['Konum', [p.ilce, p.mahalle, p.mevki].filter(Boolean).join(' · ') || '—'], ['Bölme', p.bolme || '—']); if (p.harita && p.harita.kaynak) alan.push(['Sınır kaynağı', p.harita.kaynak]); });
      if (var_(q, /plan|gyp|revize|revizyon|vaziyet|onay/)) P((p) => { alan.push([p.kisa + ' · plan', p.plan || '—'], ['GYP onayı', fd(p.gyp_onay)]); (ctx.planRev || []).filter((r) => r.park === p.kisa).forEach((r) => alan.push([r.revize, 'onay ' + fd(r.onay) + (r.ek != null ? ' · ek kira ' + tl(r.ek) : '')])); });
      if (var_(q, /ihale/)) P((p) => alan.push([p.kisa + ' · ihale', p.ihale_t || p.ihale_b != null ? fd(p.ihale_t) + ' · ' + tl(p.ihale_b) : 'Kayıtta ihale bilgisi yok']));
      if (var_(q, /kirada mi|durumu|durum ne|bos mu|isletiliyor mu|kirali mi|aktif mi/)) P((p) => alan.push([p.kisa + ' · durum', (p.durum || '—') + (p.isletmeci ? ' · ' + p.isletmeci : '') + (p.soz_bit ? ' · sözleşme sonu ' + fd(p.soz_bit) : '')]));
      if (alan.length) cevaplar.push({ baslik: parks.map((p) => p.kisa).join(', '), satirlar: alan, link: parkLink(parks[0].kisa), linkAd: 'Park dosyasını aç' });
      if (var_(q, /denetim|tespit|kontrol|ek-?10|rapor/)) parks.forEach((p) => {
        const L = (ctx.denetim || []).filter((d) => d.park === p.kisa).sort((a, b) => String(b.tarih).localeCompare(String(a.tarih)));
        if (L.length) { const d = L[0]; cevaplar.push({ baslik: p.kisa + ' · son denetim · ' + (d.donem || '') + ' · ' + fd(d.tarih), satirlar: Object.entries(d).filter(([k, v]) => !['park', 'donem', 'tarih', 'id'].includes(k) && v != null && typeof v !== 'object' && String(v).length).map(([k, v]) => [k, String(v)]), link: '#/denetim?p=' + encodeURIComponent(p.kisa), linkAd: 'Denetim ve Planlar sayfası', not: L.length > 1 ? 'Toplam ' + L.length + ' denetim kaydı var.' : '' }); }
      });
      if (var_(q, /yazi|yazisma|evrak|gelen|giden|ebys/)) parks.forEach((p) => {
        const L = [...(ctx.takip || []).filter((d) => d.park === p.kisa).map((d) => [fd(d.tarih), (d.yon || '') + ' · ' + (d.sayi || ''), d.konu || '']), ...(ctx.defter || []).filter((d) => d.park === p.kisa).map((d) => [fd(d.tarih), d.konu || '', (d.aciklama || '') + (d.belge ? ' · ' + d.belge : '')])]
          .sort((a, b) => b[0].split('.').reverse().join('').localeCompare(a[0].split('.').reverse().join('')));
        if (L.length) cevaplar.push({ baslik: p.kisa + ' · yazışma ve kayıt defteri', tablo: { b: ['Tarih', 'Tür / sayı', 'Konu'], s: L.slice(0, 15) }, link: '#/islem?p=' + encodeURIComponent(p.kisa), linkAd: 'İşlem ve Belge Kontrolü' });
      });
      if (!cevaplar.length) { const p = parks[0], d = dz.docs.find((x) => x.tur === 'Park' && x.park === p.kisa); if (d) cevaplar.push({ baslik: d.baslik, satirlar: d.satirlar.slice(0, 16), link: d.link, linkAd: 'Park dosyasını aç', genel: true }); }
    }
    // 5b. planlanan / mevcut tesis listesi (tür belirtilmeden)
    if (parks.length === 1 && /(planlanan|onerilen|yapilacak|mevcut|var olan|hangi) tesis|tesisler(i)?\b|tesis listesi|neler var/.test(q) && ctx.gyp && ctx.gyp.parklar[parks[0].kisa] && !cevaplar.some((c) => c.tablo && c.tablo.b[1] === 'Adet')) {
      const g = ctx.gyp.parklar[parks[0].kisa], ars = new Set((g.planlar || []).filter((x) => x.durum === 'arsiv').map((x) => x.id)), du = /planlanan|onerilen|yapilacak/.test(q) ? 'P' : /mevcut|var olan/.test(q) ? 'M' : null;
      const sayP = {}; (g.f || []).forEach((f) => { if (ars.has(f.p) || f._geo?.length || f._repeat || ['A','Y','K'].includes(f.d) || (du && f.d !== du) || /yol|patika|cizgi|cit|ihata|etiket|nokta/i.test(norm(f.t))) return; const o = sayP[f.p || ''] = sayP[f.p || ''] || {}; o[f.t] = (o[f.t] || 0) + 1; });
      const say = {}; Object.values(sayP).forEach((o) => Object.entries(o).forEach(([t, m]) => { say[t] = Math.max(say[t] || 0, m); }));
      const L = Object.entries(say).sort((a, b) => b[1] - a[1]);
      const link = '#/harita?p=' + encodeURIComponent(parks[0].kisa);
      if (L.length) cevaplar.unshift({ baslik: parks[0].kisa + ' · ' + (du === 'P' ? 'planlanan' : du === 'M' ? 'planda mevcut' : 'arşiv dışındaki') + ' tesisler (' + L.reduce((s, x) => s + x[1], 0) + ')', tablo: { b: ['Tesis türü', 'Adet'], s: L.map(([t, n]) => [t, String(n)]) }, not: 'Sayım plan çizimlerinden gelir. Yol, patika, çit ve arşiv çizimleri hariç.', link, linkAd: 'Haritada aç' });
      else cevaplar.unshift({ baslik: parks[0].kisa + ' · Bu seçimde tesis çizimi yok', metin: 'Haritadaki kaynak notları plan ve tesis kapsamını gösterir.', link, linkAd: 'Haritayı ve eksikleri aç' });
    }
    // 6. TÜFE
    if (var_(q, /tufe|enflasyon|ufe\b/) && ctx.tufe) {
      const ay = AY.findIndex((a) => q.includes(a)), yy = Y || (ay >= 0 ? yil0 : yil0);
      const a = ctx.tufe[String(yy)] || [];
      const rows = a.map((v, i) => [AYAD[i] + ' ' + yy, v == null ? 'yayımlanmadı' : yuzde(v)]);
      if (ay >= 0) cevaplar.push({ baslik: AYAD[ay] + ' ' + yy + ' TÜFE (12 aylık ortalamalara göre değişim)', metin: a[ay] == null ? 'Henüz yayımlanmadı; TÜİK yayımlayınca site kendiliğinden günceller.' : yuzde(a[ay]), link: '#/hesap', linkAd: 'Hesaplama araçları' });
      else if (rows.length) cevaplar.push({ baslik: yy + ' TÜFE (12 aylık ortalamalara göre değişim)', tablo: { b: ['Ay', 'Oran'], s: rows }, link: '#/hesap', linkAd: 'Hesaplama araçları' });
    }
    // 7. liste soruları
    if (!parks.length && !cevaplar.length && var_(q, /(hangi|tum|butun|liste).*park|parklar/)) {
      let L = ctx.parks || [], b = 'Bütün parklar';
      if (/sona er|biten|bitmis|suresi dol/.test(q)) { L = L.filter((p) => p.soz_bit && p.soz_bit < ctx.rapor); b = 'Sözleşmesi sona ermiş parklar'; }
      else if (/bitecek|yaklasan|yakinda/.test(q)) { const s = String(yil0 + 2) + ctx.rapor.slice(4); L = L.filter((p) => p.soz_bit && p.soz_bit >= ctx.rapor && p.soz_bit <= s); b = 'Sözleşmesi 2 yıl içinde bitecek parklar'; }
      else if (/kirada|isletilen|kiralik/.test(q)) { L = L.filter((p) => p.durum === 'Kirada'); b = 'Kirada olan parklar'; }
      else if (/bos|kirada degil|ihale edilecek/.test(q)) { L = L.filter((p) => p.durum !== 'Kirada'); b = 'Kirada olmayan parklar'; }
      cevaplar.push({ baslik: b + ' (' + L.length + ')', tablo: { b: ['Park', 'İşletmeci', 'Sözleşme', 'Alan'], s: L.map((p) => [p.kisa, p.isletmeci || '—', fd(p.soz_bas) + ' – ' + fd(p.soz_bit), ha(p.alan)]) }, link: '#/parklar', linkAd: 'Park envanteri' });
    }
    if (cevaplar.length > 1) for (let i = cevaplar.length - 1; i >= 0; i--) if (cevaplar[i].genel) cevaplar.splice(i, 1);
    const sonuclar = ara(dz, soru, parks, 40);
    if (!cevaplar.length && !parks.length) { const c = tesisSay(ctx, parks, soru); if (c) cevaplar.push(c); }
    // haritada göster / sınır / konum: parkın haritasını aç
    if (parks.length && /harita|goster|sinir|konum|nerede|uydu|kml/.test(q) && !cevaplar.some((c) => c.yerler || /harita/.test(c.link || ''))) parks.slice(0, 3).forEach((p) => {
      const g = ctx.gyp && ctx.gyp.parklar && ctx.gyp.parklar[p.kisa], h = p.harita || {}, n = g ? (g.f || []).length : 0, gp = g && (g.planlar || []).find((x) => x.durum === 'guncel');
      cevaplar.unshift({ baslik: p.kisa + ' · harita', satirlar: [['Konum', [p.ilce, p.mahalle, p.mevki].filter(Boolean).join(' · ') || '—'], ['Kayıtlı alan', p.alan != null ? ha(p.alan) : '—'], ['Haritadan alan', h.alan_ha != null ? ha(h.alan_ha) : '—'], ['Plan çizimi', n ? n + ' nesne' + (gp ? ' · güncel: ' + gp.ad : '') : 'Tesis çizimi yok']], link: '#/harita?p=' + encodeURIComponent(p.kisa), linkAd: 'Haritada aç' });
    });
    // Kavram sorusu (park adı yok): en iyi eşleşen Tebliğ maddesini cevap olarak göster
    const tb = !cevaplar.length && !parks.length && sonuclar.slice(0, 5).find((d) => d.tur === 'Tebliğ' && d.skor >= sonuclar[0].skor * 0.6);
    if (tb) { const m = (ctx.teblig || []).find((x) => x.no === tb.madde); if (m) cevaplar.push({ baslik: tb.baslik, metin: (m.metin || []).join('\n'), link: '#/teblig', mdLink: m.no, linkAd: 'Tebliğ sayfasında aç', kaynak: '313 sayılı Orman Parkları Tebliği (resmî metin) · en yakın eşleşen madde', yakin: true }); }
    return { soru, parks: parks.map((p) => p.kisa), yil: Y, madde: md, cevaplar, sonuclar, devraldi };
  };

  // ---------- yapay zekâ bağlamı ----------
  // Yalnız soruyla ilgili alıntılar gönderilir; sıra numarası [n] kaynak göstermek için kullanılır.
  SOR.baglam = function (dz, sonuc, sinir) {
    const parca = [], lim = sinir || 28000;
    let boy = 0;
    const ekle = (s) => { if (boy + s.length > lim) return false; parca.push(s); boy += s.length; return true; };
    sonuc.cevaplar.forEach((c, i) => {
      const t = [c.baslik, c.metin || '', (c.satirlar || []).map((x) => x[0] + ': ' + x[1]).join('\n'), c.tablo ? [c.tablo.b.join(' | '), ...c.tablo.s.map((r) => r.join(' | '))].join('\n') : '', c.not || ''].filter(Boolean).join('\n');
      ekle('[H' + (i + 1) + '] (sitenin hesapladığı cevap)\n' + t);
    });
    sonuc.sonuclar.slice(0, 18).forEach((d, i) => { ekle('[' + (i + 1) + '] ' + d.tur + ' · ' + d.baslik + '\n' + (d.satirlar ? d.satirlar.map((x) => x[0] + ': ' + x[1]).join('\n') : String(d.metin).slice(0, 2400))); });
    const ozet = (dz.ctx.parks || []).map((p) => p.kisa + ': ' + [p.durum, p.isletmeci, 'sözleşme ' + fd(p.soz_bas) + '–' + fd(p.soz_bit), 'alan ' + ha(p.alan)].filter(Boolean).join(', ')).join('\n');
    return 'Rapor tarihi: ' + fd(dz.ctx.rapor) + '\nPark listesi:\n' + ozet + '\n\nAlıntılar:\n' + parca.join('\n\n');
  };
  // Yapay zekânın çağırabildiği araçlar: sitenin kendi hesap motoru ve kayıt araması.
  const kartMetin = (c) => [c.baslik, c.metin || '', (c.satirlar || []).map((x) => x[0] + ': ' + x[1]).join('\n'),
    c.tablo ? [c.tablo.b.join(' | '), ...c.tablo.s.slice(0, 60).map((r) => r.join(' | '))].join('\n') + (c.tablo.s.length > 60 ? '\n(+' + (c.tablo.s.length - 60) + ' satır daha)' : '') : '',
    (c.yerler || []).slice(0, 40).map((y) => '- ' + y.ad + (y.alt ? ' (' + y.alt + ')' : '')).join('\n'), c.not || ''].filter(Boolean).join('\n');
  SOR.kartMetin = kartMetin;
  SOR.ARACLAR = [
    { name: 'site_hesabi', description: 'Sitenin kendi hesap motoruna kısa bir soru sorar ve kayıtlardan hesaplanmış kesin cevabı döndürür. Park bilgisi, işletmeci, sözleşme tarihleri, yıllık kira ve tahakkuk (TÜFE artışı, ek tesis kirası), borç ve gecikme zammı, tesis sayıları ve yerleri, şeflik ve yetkililer, Tebliğ maddeleri için kullan. Her tutar, tarih ve sayı bu araçtan gelmeli. Bir soruda tek konu sor; gerekirse birkaç kez çağır.', strict: true,
      input_schema: { type: 'object', properties: { soru: { type: 'string', description: 'Tek konulu, park adını içeren Türkçe soru. Örn: "Tayakadın 2027 kirası", "Kayabaşı kaç kameriye var", "Md. 32".' } }, required: ['soru'], additionalProperties: false } },
    { name: 'kayit_ara', description: 'Sitedeki bütün kayıtlarda (park dosyaları, muhasebe dökümü, denetim raporları, yazışmalar, plan revizyonları, Tebliğ, harita tesisleri) serbest metin araması yapar ve en ilgili kayıtların içeriğini döndürür. site_hesabi doğrudan cevap vermediğinde kullan.', strict: true,
      input_schema: { type: 'object', properties: { sorgu: { type: 'string', description: 'Aranacak kelimeler' } }, required: ['sorgu'], additionalProperties: false } }
  ];
  SOR.aracCalistir = function (dz, ad, girdi) {
    if (ad === 'site_hesabi') {
      const r = SOR.sor(dz, String(girdi.soru || ''));
      if (!r.cevaplar.length) return 'Hesap motoru bu soru için doğrudan cevap üretmedi. En ilgili kayıtlar:\n' + r.sonuclar.slice(0, 5).map((d) => '- ' + d.tur + ' · ' + d.baslik + ': ' + String(d.ozet || '').slice(0, 300)).join('\n');
      return r.cevaplar.slice(0, 4).map((c) => kartMetin(c)).join('\n\n---\n\n');
    }
    if (ad === 'kayit_ara') {
      const r = SOR.sor(dz, String(girdi.sorgu || ''));
      return r.sonuclar.slice(0, 8).map((d, i) => '(' + (i + 1) + ') ' + d.tur + ' · ' + d.baslik + '\n' + (d.satirlar ? d.satirlar.map((x) => x[0] + ': ' + x[1]).join('\n') : String(d.metin).slice(0, 2000))).join('\n\n') || 'Kayıt bulunamadı.';
    }
    return 'Bilinmeyen araç.';
  };
  SOR.SISTEM = 'Sen İstanbul Orman İşletme Müdürlüğü Emlak Şefliğinin orman parkları yönetim sitesindeki "Sor" asistanısın. ' +
    'Yalnız sana verilen alıntılara dayanarak Türkçe, kısa ve doğrudan cevap ver; önce sonucu yaz. ' +
    'Her bilginin yanına kaynağını [1], [H1] gibi alıntı numarasıyla yaz. Alıntılarda olmayan bilgiyi uydurma: doğrulanamayanı [TEYİT GEREKLİ], alıntıda doğrudan yazmayan sonucu [ÇIKARIM] ile işaretle. ' +
    'Tutarları alıntıdaki gibi aynen yaz, yuvarlama veya yeniden hesaplama yapma; hesap gerekiyorsa adımlarını göster. Mevzuat için 313 sayılı Orman Parkları Tebliğinin alıntılanan maddesine dayan. ' +
    'Cevabın bulunmuyorsa bunu açıkça söyle ve hangi sayfaya bakılması gerektiğini belirt. ' +
    'Alıntılar cevabı tam vermiyorsa, ya da soruda bir tutar, tarih, sayı, hesap veya karşılaştırma varsa, önce site_hesabi aracıyla sitenin kendi hesabını al; gerekirse kayit_ara ile kayıtları ara. Tutarı kendin hesaplama; araçtan geleni aynen yaz ve yanına (site hesabı) yaz. ' +
    'Araç çağırmadan önce kullanıcıya bir şey yazma; cevabı araç sonuçları geldikten sonra tek seferde yaz.';

  if (typeof module !== 'undefined' && module.exports) module.exports = SOR; else root.SOR = SOR;
})(typeof window !== 'undefined' ? window : globalThis);
