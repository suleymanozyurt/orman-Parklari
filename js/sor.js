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
    // "Mimar Sinan" ile "Hacı Bektaş" çakışmasın: daha uzun eşleşme kalır
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
        if (arsiv.has(f.p)) return;
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
        sat.push(['%5 ağaçlandırma', tl(pl.agac)], ['%20 KDV', tl(pl.kdv)], ['Toplam', tl(pl.toplam)]);
        if (pl.guvFark != null) sat.push(['Güvence farkı', tl(pl.guvFark)]);
        if (pl.depFark != null) sat.push(['Depozito farkı', tl(pl.depFark)]);
        (pl.vadeler || []).forEach((v, i) => sat.push([(pl.vadeler.length > 1 ? (i + 1) + '. taksit' : 'Peşin') + ' · ' + fd(v.vade), tl(r2(v.kira + v.agac + v.kdv))]));
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
      out.push({ baslik: p.kisa + ' · ' + Y + ' kira ve tahakkuku', satirlar: sat, link: '#/tahakkuk?p=' + encodeURIComponent(p.kisa), linkAd: 'Kira ve Tahakkuk sayfasında aç', ek: { formTF: p.kisa, yil: Y } });
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
    const rows = []; let toplam = 0; const turler = new Set();
    P.forEach((k) => {
      const g = gyp[k]; if (!g) return; const arsiv = new Set((g.planlar || []).filter((x) => x.durum === 'arsiv').map((x) => x.id));
      const say = {};
      (g.f || []).forEach((f) => {
        if (arsiv.has(f.p) || (durum && f.d !== durum)) return;
        let ad = null;
        if (hedef.every((h) => kokler(f.t).includes(h))) ad = f.t;
        else { const a = String(f.ad || '').split(/\s[–-]\s/).pop(); if (a && hedef.every((h) => kokler(a).includes(h))) ad = a.trim(); }
        if (ad) { say[ad] = (say[ad] || 0) + 1; turler.add(ad); }
      });
      const n = Object.values(say).reduce((a, b) => a + b, 0); if (n) { rows.push([k, n, Object.entries(say).map(([t, m]) => t + ' ' + m).join(', ')]); toplam += n; }
    });
    if (!turler.size) return null;
    rows.sort((a, b) => b[1] - a[1]);
    return { baslik: [...turler].slice(0, 3).join(', ') + (durum ? (durum === 'M' ? ' (mevcut)' : ' (planlanan)') : '') + ' · toplam ' + toplam, tablo: { b: ['Park', 'Adet', 'Tür'], s: rows }, link: '#/harita' + (parks.length === 1 ? '?p=' + encodeURIComponent(parks[0].kisa) : ''), linkAd: 'Haritada aç', not: 'Güncel onaylı plan katmanları sayıldı; arşiv (önceki plan) çizimleri hariç.' };
  }

  SOR.sor = function (dz, soru) {
    const ctx = dz.ctx, parks = parkBul(soru, ctx.parks || []), q = parks.reduce((s, p) => s.split(norm(p.kisa)).join(' '), norm(soru)), Y = yilBul(soru, ctx.rapor), md = maddeBul(soru);
    const yil0 = Number(String(ctx.rapor).slice(0, 4));
    const cevaplar = [];
    const P = (fn) => parks.map(fn).filter(Boolean);
    // 1. Tebliğ maddesi
    if (md && ctx.teblig) { const m = ctx.teblig.find((x) => x.no === md); if (m) cevaplar.push({ baslik: (md[0] === 'G' ? 'Geçici Madde ' + md.slice(1) : 'Madde ' + md) + ' · ' + (m.baslik || ''), metin: (m.metin || []).join('\n'), link: '#/teblig', mdLink: md, linkAd: 'Tebliğ sayfasında aç', kaynak: '313 sayılı Orman Parkları Tebliği (resmî metin)' }); }
    // 2. kira / tahakkuk / taksit
    if (var_(q, /kira|tahakkuk|taksit|vade|kdv|agaclandirma|odenecek|fis/) && !var_(q, /odenmedi|odenmemis|borc|gecikme|alacak/)) {
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
    // 3. alacak / borç
    if (var_(q, /borc|odenmedi|odenmemis|alacak|gecikme|tahsil|odeme durumu|odedi|odemis/)) {
      const al = (ctx.al || []).filter((a) => (!parks.length || parks.some((p) => p.kisa === a.park)));
      const acik = al.filter((a) => a.durum === 'Ödenmedi');
      const by = {}; acik.forEach((a) => { const o = by[a.park] = by[a.park] || { n: 0, t: 0, gz: 0, en: null }; o.n++; o.t += a.tutar; o.gz += a.gztop || 0; if (!o.en || a.esas < o.en) o.en = a.esas; });
      const rows = Object.entries(by).sort((a, b) => b[1].t - a[1].t).map(([k, o]) => [k, String(o.n), tl(r2(o.t)), tl(r2(o.gz)), fd(o.en)]);
      cevaplar.push(rows.length ? { baslik: 'Vadesi geçmiş ödenmemiş alacaklar' + (parks.length === 1 ? ' · ' + parks[0].kisa : '') + ' · ' + fd(ctx.rapor), tablo: { b: ['Park', 'Kalem', 'Anapara', 'Gecikme zammı', 'En eski vade'], s: rows }, link: '#/alacaklar' + (parks.length === 1 ? '?p=' + encodeURIComponent(parks[0].kisa) : ''), linkAd: 'Alacak ve Tahsilat sayfası', not: 'Muhasebe dökümüne göre; döküm tarihinden sonraki ödemeler görünmez.' }
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
      if (var_(q, /alan|hektar|\bha\b|buyukluk|konum|nerede|ilce|koy|bolme|sinir/)) P((p) => { alan.push([p.kisa + ' · kayıtlı alan', ha(p.alan)], ['Haritadan alan', ha(p.harita && p.harita.alan_ha)], ['Konum', [p.ilce, p.mahalle, p.mevki].filter(Boolean).join(' · ') || '—'], ['Bölme', p.bolme || '—']); if (p.harita && p.harita.kaynak) alan.push(['Sınır kaynağı', p.harita.kaynak]); });
      if (var_(q, /plan|gyp|revize|revizyon|vaziyet|onay/)) P((p) => { alan.push([p.kisa + ' · plan', p.plan || '—'], ['GYP onayı', fd(p.gyp_onay)]); (ctx.planRev || []).filter((r) => r.park === p.kisa).forEach((r) => alan.push([r.revize, 'onay ' + fd(r.onay) + (r.ek != null ? ' · ek kira ' + tl(r.ek) : '')])); });
      if (var_(q, /ihale/)) P((p) => alan.push([p.kisa + ' · ihale', fd(p.ihale_t) + ' · ' + tl(p.ihale_b)]));
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
      if (!cevaplar.length) { const p = parks[0], d = dz.docs.find((x) => x.tur === 'Park' && x.park === p.kisa); if (d) cevaplar.push({ baslik: d.baslik, satirlar: d.satirlar.slice(0, 16), link: d.link, linkAd: 'Park dosyasını aç' }); }
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
    const sonuclar = ara(dz, soru, parks, 40);
    if (!cevaplar.length && !parks.length) { const c = tesisSay(ctx, parks, soru); if (c) cevaplar.push(c); }
    // Kavram sorusu (park adı yok): en iyi eşleşen Tebliğ maddesini cevap olarak göster
    const tb = !cevaplar.length && !parks.length && sonuclar.slice(0, 5).find((d) => d.tur === 'Tebliğ' && d.skor >= sonuclar[0].skor * 0.6);
    if (tb) { const m = (ctx.teblig || []).find((x) => x.no === tb.madde); if (m) cevaplar.push({ baslik: tb.baslik, metin: (m.metin || []).join('\n'), link: '#/teblig', mdLink: m.no, linkAd: 'Tebliğ sayfasında aç', kaynak: '313 sayılı Orman Parkları Tebliği (resmî metin) · en yakın eşleşen madde', yakin: true }); }
    return { soru, parks: parks.map((p) => p.kisa), yil: Y, madde: md, cevaplar, sonuclar };
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
  SOR.SISTEM = 'Sen İstanbul Orman İşletme Müdürlüğü Emlak Şefliğinin orman parkları yönetim sitesindeki "Sor" asistanısın. ' +
    'Yalnız sana verilen alıntılara dayanarak Türkçe, kısa ve doğrudan cevap ver; önce sonucu yaz. ' +
    'Her bilginin yanına kaynağını [1], [H1] gibi alıntı numarasıyla yaz. Alıntılarda olmayan bilgiyi uydurma: doğrulanamayanı [TEYİT GEREKLİ], alıntıda doğrudan yazmayan sonucu [ÇIKARIM] ile işaretle. ' +
    'Tutarları alıntıdaki gibi aynen yaz, yuvarlama veya yeniden hesaplama yapma; hesap gerekiyorsa adımlarını göster. Mevzuat için 313 sayılı Orman Parkları Tebliğinin alıntılanan maddesine dayan. ' +
    'Cevabın bulunmuyorsa bunu açıkça söyle ve hangi sayfaya bakılması gerektiğini belirt.';

  if (typeof module !== 'undefined' && module.exports) module.exports = SOR; else root.SOR = SOR;
})(typeof window !== 'undefined' ? window : globalThis);
