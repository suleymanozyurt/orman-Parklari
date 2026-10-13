/* Orman Parkları — hesap motoru
   313 sayılı Orman Parkları Tebliği (Md. 30–33, 39) ve 6183 s.K. m.51 gecikme zammı.
   Tarayıcıda ve Node'da (test) aynı kod çalışır. Tarihler 'YYYY-AA-GG' metni olarak taşınır. */
(function (root) {
  'use strict';
  const E = {};

  // ---------- yardımcılar ----------
  const r2 = (x) => Math.round((x + (x >= 0 ? 1e-9 : -1e-9)) * 100) / 100;
  E.r2 = r2;
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (y, m, d) => y + '-' + pad(m) + '-' + pad(d);
  const P = (s) => { const a = s.split('-').map(Number); return a; };
  const lastDay = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m: 1..12
  // ay taşmasını düzelterek tarih kur (m 1-tabanlı, taşabilir)
  const mk = (y, m, d) => { const t = new Date(Date.UTC(y, m - 1, 1)); return [t.getUTCFullYear(), t.getUTCMonth() + 1, d]; };
  const days = (a, b) => Math.round((Date.UTC(...toUTC(b)) - Date.UTC(...toUTC(a))) / 864e5); // b - a
  function toUTC(s) { const [y, m, d] = P(s); return [y, m - 1, d]; }
  E.days = days;
  E.addDays = (s, n) => { const t = new Date(Date.UTC(...toUTC(s)) + n * 864e5); return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); };
  // Excel MIN(DATE(y,m+n,d), DATE(y,m+n+1,0)) karşılığı: n ay sonrası, ay sonu taşmasında son gün
  E.addMonths = (s, n) => {
    const [y, m, d] = P(s); const [yy, mm] = mk(y, m + n, 1); const ld = lastDay(yy, mm);
    return iso(yy, mm, Math.min(d, ld));
  };
  E.fmtDate = (s) => { if (!s) return '—'; const [y, m, d] = P(s); return pad(d) + '.' + pad(m) + '.' + y; };
  E.year = (s) => P(s)[0];
  E.month = (s) => P(s)[1];

  // ---------- gecikme zammı (6183 s.K. m.51; Tebliğ Md. 39/1) ----------
  // Süre oran değişikliği tarihlerinde dilimlenir; her dilimde: tutar × aylık oran × (tam ay + kalan gün ÷ 30)
  E.gzDilimler = function (bas, bit, oranlar) {
    const out = [];
    if (!bas || !bit || bit <= bas) return out;
    for (let k = 0; k < oranlar.length; k++) {
      const tk = oranlar[k][0], tk1 = k + 1 < oranlar.length ? oranlar[k + 1][0] : '9999-12-31';
      const s = bas > tk ? bas : tk, e = bit < tk1 ? bit : tk1;
      if (e <= s) continue;
      const [sy, sm] = P(s), [ey, em] = P(e);
      let n0 = (ey - sy) * 12 + em - sm;
      if (E.addMonths(s, n0) > e) n0--;
      const g = days(E.addMonths(s, n0), e);
      out.push({ bas: s, bit: e, oran: oranlar[k][1], ay: n0, gun: g, faktor: oranlar[k][1] * (n0 + g / 30) });
    }
    return out;
  };
  E.gzFaktor = (bas, bit, oranlar) => E.gzDilimler(bas, bit, oranlar).reduce((a, x) => a + x.faktor, 0);

  // ---------- muhasebe eşleştirme (120.99 tahakkukları, 127 devir/ek borçları; tahsilat fişleri FIFO) ----------
  const hs = (s) => (s || '').replace(/ /g, '');
  const aile = (h) => (h.endsWith('.05') || h.endsWith('.06')) ? 'V' : 'K';
  const TS = { 'KDV': 0, 'Ağaçlandırma': 1, 'Vergi/fon': 1, 'Kira': 2 };
  E.TS = TS;
  function tur(x) {
    const a = (x.aciklama || '').toLocaleLowerCase('tr-TR');
    const a2 = (x.aciklama || '').toLowerCase();
    if (x.hesap.endsWith('.05') || x.hesap.endsWith('.06')) {
      if (a.includes('kdv') || a.includes('vergi') || a2.includes('kdv') || a2.includes('vergi')) return 'KDV';
      if (a.includes('ağaç') || a.includes('agac') || a2.includes('ağaç') || a2.includes('agac')) return 'Ağaçlandırma';
      return 'Vergi/fon';
    }
    return 'Kira';
  }
  E.tur = tur;
  const vs = (v) => v || '1899-12-30';

  E.eslestir = function (veri) {
    const uyarilar = [];
    const parkByVkn = {};
    veri.parks.forEach((p) => { if (p.vkn_muh) parkByVkn[p.vkn_muh] = p.kisa; });
    // Programın oluşturduğu tahakkuk satırları (oto), aynı park ve yıl için muhasebe dökümünde gerçek tahakkuk varsa devre dışı kalır
    const gercek = new Set(veri.muhasebe.filter((x) => !x.oto && x.kaynak === '120' && x.borc > 0 && (x.alacak_h || '').includes('600')).map((x) => x.vkn + '|' + E.year(x.tarih)));
    const rows = veri.muhasebe.map((x, i) => Object.assign({}, x, { id: i, park: parkByVkn[x.vkn] || 'Park dışı', item: false }))
      .filter((x) => !(x.oto && gercek.has(x.vkn + '|' + x.oto.split('|')[1])));
    const yeniden = new Set(rows.filter((x) => x.kaynak === '127' && hs(x.borc_h) === '127' && hs(x.alacak_h) === '127').map((x) => x.vkn));
    const items = [];
    for (const x of rows) {
      if (x.park === 'Park dışı') continue;
      let g = '';
      if (x.kaynak === '120' && x.borc > 0 && (x.alacak_h || '').includes('600')) g = E.year(x.tarih) + ' tahakkuku';
      if (x.kaynak === '127' && x.borc > 0) {
        if (hs(x.borc_h) === '' && !yeniden.has(x.vkn)) g = 'Devir (önceki yıllar)';
        if (hs(x.borc_h) === '127' && hs(x.alacak_h) === '127') g = 'Devir (önceki yıllar)';
        if (hs(x.borc_h) === '127' && !(x.alacak_h || '').includes('120') && hs(x.alacak_h) !== '127') g = 'Ek tahakkuk';
      }
      if (g) {
        items.push({ id: items.length, park: x.park, vkn: x.vkn, grup: g, tur: tur(x), vade: x.vade || null, tutar: r2(x.borc), olusma: x.tarih,
          yev: x.yev, aciklama: x.aciklama, hesap: x.hesap, odenen: 0, odemeler: [], row: x.id, duz: null, vnot: '', ek: !!x.ek, not_: x.not_ || '' });
        x.item = true;
      }
    }
    // vade düzeltmeleri (resmî yazılardan)
    for (const it of items) {
      for (const R of (veri.vade_duz || [])) {
        if (it.park === R.park && (!R.tur || it.tur === R.tur) && (it.vade || null) === (R.mv || null) && it.grup.startsWith(R.grup) &&
            !(R.haric_yev || []).includes(it.yev)) { it.duz = R.yeni; it.vnot = R.not_; }
      }
      if (it.ek && it.not_) {
        it.vnot = 'Kaynak: ' + it.not_;
      }
    }
    // tahsilat fişleri
    const fis = new Map(), fd = new Map();
    for (const x of rows) {
      if (x.park === 'Park dışı' || x.item) continue;
      const bh = hs(x.borc_h), ah = hs(x.alacak_h);
      if (x.kaynak === '120' && x.alacak > 0 && bh === '127') continue;
      if (x.kaynak === '127' && x.borc > 0 && ah === '120') continue;
      if (x.kaynak === '127' && bh === '127' && ah === '127') continue;
      if (x.kaynak === '127' && bh === '') continue;
      const k = x.vkn + '|' + x.yev;
      if (!fd.has(k)) fd.set(k, x.tarih);
      if (!fis.has(k)) fis.set(k, new Map());
      const g = fis.get(k), gk = aile(x.hesap) + '|' + (x.vade || '');
      g.set(gk, (g.get(gk) || 0) + x.alacak - x.borc);
    }
    const keys = Array.from(fis.keys()).map((k, i) => ({ k, i })).sort((a, b) => {
      const da = fd.get(a.k), db = fd.get(b.k);
      if (da !== db) return da < db ? -1 : 1;
      const ya = +a.k.split('|')[1], yb = +b.k.split('|')[1];
      if (ya !== yb) return ya - yb;
      return a.i - b.i;
    }).map((o) => o.k);
    for (const k of keys) {
      const [vkn, yevS] = k.split('|'); const yev = +yevS; const tarih = fd.get(k);
      for (const [gk, amt0] of fis.get(k)) {
        const [fam, vade0] = gk.split('|'); const vade = vade0 || null;
        let amt = r2(amt0);
        if (amt < -0.004) { uyarilar.push('Negatif net tahsilat: ' + k + ' ' + gk + ' ' + amt); continue; }
        if (amt <= 0.004) continue;
        const op = items.filter((it) => it.vkn === vkn && it.olusma <= tarih && it.tutar - it.odenen > 0.004);
        const pr = (it) => {
          const f = aile(it.hesap) === fam, v = it.duz || it.vade;
          let p;
          if (f && (v || null) === vade) p = 0;
          else if (f && v && vade && v.slice(0, 7) === vade.slice(0, 7)) p = 1;
          else if (f) p = 2; else p = 3;
          return [p, vs(v), TS[it.tur], it.id];
        };
        op.sort((a, b) => { const A = pr(a), B = pr(b); for (let i = 0; i < 4; i++) { if (A[i] < B[i]) return -1; if (A[i] > B[i]) return 1; } return 0; });
        for (const it of op) {
          if (amt <= 0.004) break;
          const pay = Math.min(amt, r2(it.tutar - it.odenen));
          it.odenen = r2(it.odenen + pay); amt = r2(amt - pay);
          it.odemeler.push({ tarih, yev, tutar: pay });
        }
        if (amt > 0.004) uyarilar.push('Eşleşmeyen tahsilat (fazla ödeme): ' + vkn + ' yev. ' + yev + ' ' + E.tl(amt) + ' TL');
      }
    }
    // alacak parçaları
    const pord = {}; veri.parks.forEach((p, i) => { pord[p.kisa] = i; });
    const sorted = items.slice().sort((a, b) => {
      const A = [pord[a.park] ?? 999, vs(a.duz || a.vade), TS[a.tur], a.id], B = [pord[b.park] ?? 999, vs(b.duz || b.vade), TS[b.tur], b.id];
      for (let i = 0; i < 4; i++) { if (A[i] < B[i]) return -1; if (A[i] > B[i]) return 1; } return 0;
    });
    const parcalar = [];
    for (const it of sorted) {
      const base = { park: it.park, vkn: it.vkn, grup: it.grup, tur: it.tur, vade: it.vade, duz: it.duz, aciklama: it.aciklama,
        kaynak: 'yev. ' + it.yev + ' (' + it.hesap + ')', vnot: it.vnot, kalem_tutar: it.tutar, kalem: it.id };
      for (const o of it.odemeler) parcalar.push(Object.assign({}, base, { tutar: o.tutar, odeme: o.tarih, fis: 'yev. ' + o.yev }));
      const rem = r2(it.tutar - it.odenen);
      if (rem > 0.004) parcalar.push(Object.assign({}, base, { tutar: rem, odeme: null, fis: '' }));
    }
    // sağlama: park bazında muhasebe bakiyesi = açık parçalar
    const b = {}, op2 = {};
    rows.forEach((x) => { if (x.park !== 'Park dışı') b[x.park] = (b[x.park] || 0) + x.borc - x.alacak; });
    parcalar.forEach((q) => { if (!q.odeme) op2[q.park] = (op2[q.park] || 0) + q.tutar; });
    Object.keys(b).forEach((p) => { if (Math.abs(b[p] - (op2[p] || 0)) >= 0.02) uyarilar.push(p + ': muhasebe bakiyesi (' + E.tl(b[p]) + ') açık kalemlerle (' + E.tl(op2[p] || 0) + ') tutmuyor'); });
    return { rows, items, parcalar, uyarilar };
  };

  // ---------- alacak durumu ve gecikme zammı (rapor tarihine) ----------
  E.alacakHesapla = function (parcalar, rapor, oranlar, gzKdv) {
    return parcalar.map((q) => {
      const esas = q.duz || q.vade || null;
      let durum;
      if (q.odeme) durum = !esas ? 'Ödendi' : (q.odeme > esas ? 'Geç ödendi' : 'Ödendi');
      else durum = !esas ? 'Vade yok' : (esas < rapor ? 'Ödenmedi' : 'Vadesi gelmedi');
      const son = q.odeme || rapor;
      const gun = esas ? Math.max(0, days(esas, son)) : null;
      const gz = esas ? r2(q.tutar * E.gzFaktor(esas, son, oranlar)) : 0;
      const gzkdv = q.tur === 'Kira' ? r2(gz * gzKdv) : 0;
      return Object.assign({}, q, { esas, durum, gun, gz, gzkdv, gztop: r2(gz + gzkdv), acik: q.odeme ? 0 : q.tutar });
    });
  };

  // ---------- kira zinciri (Md. 30/1, 31, 32) ----------
  // 1. dönem ihale bedeli; sonraki dönem = (önceki dönem + o dönemde eklenen ek tesis kirası) × (1 + TÜFE), kuruşa yuvarlanır.
  E.tufeAl = function (tufe, y, m) { const a = tufe[String(y)]; if (!a) return null; const v = a[m - 1]; return v == null ? null : v; };
  E.tufeAyi = function (p, d) {
    const y = E.year(d), m = E.month(d);
    if (p.artis === 'Takvim yılı' || p.kural === 'Aralık (önceki yıl)') return [y - 1, 12];
    if (p.kural === 'Yıldönümü ayı') return [y, m];
    return m === 1 ? [y - 1, 12] : [y, m - 1];   // Yayımlanan (önceki ay): dönem ayında yayımlanan = önceki ayın verisi
  };
  // Belgeli başlangıç (p.kok = {bas, bedel, kaynak}): eski dönemleri belgelerle kurulamayan parklarda zincir, belgede yazan
  // dönem kirasından başlatılır; o tarihten önceki dönemler hesaplanmaz (tahmin yok).
  E.zincir = function (p, tufe, ekKira, NPER) {
    NPER = NPER || 30;
    const out = [];
    if (!p.taban || p.ihale_b == null) return out;
    const [ty, tm, td] = P(p.taban);
    const kok = p.kok && p.kok.bas && p.kok.bedel != null ? p.kok : null;
    for (let n = 1; n <= NPER; n++) {
      let bas;
      if (n === 1) bas = p.taban;
      else {
        if (p.artis === 'Takvim yılı') bas = iso(ty + n - 1, 1, 1);
        else bas = iso(ty + n - 1, tm, Math.min(td, lastDay(ty + n - 1, tm)));
        if (p.soz_bit && bas >= p.soz_bit) break;
      }
      const ek = (ekKira || []).filter((e) => e.park === p.kisa && e.donem === n).reduce((a, e) => a + e.tutar, 0);
      let t = null, ta = null, bedel = null, belge = null;
      if (n > 1) { ta = E.tufeAyi(p, bas); t = E.tufeAl(tufe, ta[0], ta[1]); }
      if (kok && bas < kok.bas) { out.push({ n, bas, tufe: t, tufeAy: ta, ek, bedel: null, oncesi: true }); continue; }
      if (kok && bas === kok.bas) { bedel = r2(kok.bedel); belge = kok.kaynak || 'belge'; }
      else if (n === 1) bedel = p.ihale_b;
      else {
        const prev = out[n - 2];
        if (t != null && prev && prev.bedel != null) bedel = r2((prev.bedel + prev.ek) * (1 + t));
      }
      out.push({ n, bas, tufe: t, tufeAy: ta, ek, bedel, belge });
    }
    return out;
  };
  // Takvim yılına düşen dönem: varsayılan, yılın 31 Mart'ına kadar başlamış son dönem (muhasebe uygulaması);
  // p.yil_esas === 'Dönem başı' ise o yıl içinde başlayan dönem (ör. 15 Kasım yıldönümlü parklar).
  E.yilSiniri = (p, Y) => (p.yil_esas === 'Dönem başı' ? iso(Y, 12, 31) : iso(Y, 3, 31));
  // Kira kontrolünde karşılaştırılan dönem: rapor tarihinde yürüyen dönem
  E.kiraKontrol = function (p, tufe, ekKira, rapor) {
    const z = E.zincir(p, tufe, ekKira);
    const sinir = p.yil_esas === 'Dönem başı' ? rapor : iso(E.year(rapor), 3, 31);
    const G = z.filter((x) => x.bas <= sinir).length;
    const d = G ? z[G - 1] : null;
    const hesap = d ? d.bedel : null;
    const muh = p.muh_kira;
    let durum;
    if (muh == null) durum = 'Muhasebe verisi yok';
    else if (hesap == null) durum = 'Hesaplanamadı';
    else durum = Math.abs(r2(muh - hesap)) <= 1 ? 'Uyumlu' : 'Fark var';
    return { zincir: z, donem: G, bas: d ? d.bas : null, tufe: d && G >= 2 ? d.tufe : null, tufeAy: d ? d.tufeAy : null, hesap, muh,
      fark: muh != null && hesap != null ? r2(muh - hesap) : null, durum };
  };

  // ---------- yıllık kira ve tahakkuk planı (Md. 31–33, 10/2) ----------
  // Y takvim yılının yıllık kirası: Y yılının 31 Mart'ına kadar başlamış son dönemin bedeli (muhasebe uygulaması ve kira kontrolüyle aynı esas).
  E.kiraYili = function (p, tufe, ekKira, Y) {
    const z = E.zincir(p, tufe, ekKira);
    const sinir = E.yilSiniri(p, Y);
    const G = z.filter((x) => x.bas <= sinir);
    if (!G.length) return null;
    const d = G[G.length - 1];
    return { donem: d.n, bas: d.bas, tufe: d.tufe, tufeAy: d.tufeAy, bedel: d.bedel, ek: d.ek, zincir: z, onceki: G.length > 1 ? G[G.length - 2] : null };
  };
  // TÜİK, ayın verisini izleyen ayın 3'ünde açıklar
  E.tufeYayim = (ta) => (ta ? iso(ta[1] === 12 ? ta[0] + 1 : ta[0], ta[1] === 12 ? 1 : ta[1] + 1, 3) : null);
  const bol = (top, n) => { const a = []; const b = r2(top / n); for (let i = 0; i < n - 1; i++) a.push(b); a.push(r2(top - b * (n - 1))); return a; };
  E.bol = bol;
  // Ödeme düzeni: önceki yılın muhasebe tahakkukları (vade günleri +1 yıl); yoksa Md. 31/32-3 kuralı; yönetici parkta 'taksit_vade' (AA-GG listesi) tanımlayabilir.
  E.tahakkukPlan = function (veri, esl, p, tufe, Y, rapor) {
    const out = { park: p.kisa, yil: Y, uyari: [] };
    if (!p.soz_bas || !p.taban || p.ihale_b == null) { out.durum = 'Sözleşme bilgisi eksik'; out.kod = 'eksik'; return out; }
    if (p.durum && p.durum !== 'Kirada') { out.durum = 'Park kirada değil (' + p.durum + ')'; out.kod = 'disi'; return out; }
    if (p.soz_bit && iso(Y, 1, 1) > p.soz_bit) { out.durum = 'Sözleşme süresi dışında'; out.kod = 'disi'; return out; }
    const ky = E.kiraYili(p, tufe, veri.ek_kira, Y);
    if (!ky) { out.durum = 'Kira dönemi başlamamış'; out.kod = 'yok'; return out; }
    Object.assign(out, { donem: ky.donem, bas: ky.bas, tufe: ky.tufe, tufeAy: ky.tufeAy });
    if (ky.bedel == null) { out.durum = 'TÜFE bekleniyor'; out.kod = 'tufe'; out.yayim = E.tufeYayim(ky.tufeAy); return out; }
    const kira = ky.bedel;
    out.kira = kira; out.ilkDonem = ky.donem === 1;
    // muhasebede bu yılın tahakkuku var mı
    // yıllık kira tahakkuku: Y tahakkuku + aynı yıla ait ek tahakkuk kira farkları; kıst / dönem arası tahakkuklar ayrı gösterilir
    const KIST = /k[ıi]st|\d{2}\.\d{2}\.\d{4}\s*-\s*\d{2}\.\d{2}\.\d{4}/i;
    const muh = (it) => !(veri.muhasebe[it.row] || {}).oto;
    const items = esl.items.filter((it) => it.park === p.kisa && it.grup === Y + ' tahakkuku' && muh(it));
    const ekler = esl.items.filter((it) => it.park === p.kisa && it.grup === 'Ek tahakkuk' && it.tur === 'Kira' && muh(it) && E.year(it.duz || it.vade || it.olusma) === Y);
    const kiraIt = items.filter((x) => x.tur === 'Kira').concat(ekler);
    out.muhasebede = items.length > 0;
    out.muhKira = r2(kiraIt.filter((x) => !KIST.test(x.aciklama || '')).reduce((s, x) => s + x.tutar, 0));
    out.muhKist = r2(kiraIt.filter((x) => KIST.test(x.aciklama || '')).reduce((s, x) => s + x.tutar, 0));
    out.otoVar = veri.muhasebe.some((x) => x.oto === p.kisa + '|' + Y);
    // örnek düzen
    let ornek = null;
    for (let y = Y - 1; y >= Y - 6 && !ornek; y--) {
      const it = esl.items.filter((x) => x.park === p.kisa && x.grup === y + ' tahakkuku' && muh(x));
      if (it.some((x) => x.tur === 'Kira')) ornek = { yil: y, items: it };
    }
    let vadeler, kaynak;
    const own = (p.taksit_vade || '').split(/[,;\s]+/).filter((s) => /^\d\d-\d\d$/.test(s));
    if (own.length) { vadeler = own.map((s) => Y + '-' + s).sort(); kaynak = 'Parkta tanımlı ödeme günleri'; }
    else if (ornek) {
      const kv = Array.from(new Set(ornek.items.filter((x) => x.tur === 'Kira').map((x) => x.vade || x.duz).filter(Boolean))).sort();
      vadeler = kv.map((v) => E.addMonths(v, (Y - ornek.yil) * 12)); kaynak = ornek.yil + ' tahakkukunun ödeme günleri (bir yıl ileri)';
    } else {
      const [, sm, sd] = P(p.soz_bas);
      if (p.ihale_b <= 150000) { vadeler = [iso(Y, sm, lastDay(Y, sm))]; kaynak = 'Md. 32/3: sözleşme ayının sonunda tek seferde peşin'; }
      else { vadeler = [0, 3, 6, 9].map((k) => { const [yy, mm] = mk(Y, sm + k, 1); return iso(yy, mm, Math.min(sd, lastDay(yy, mm))); }).filter((v) => E.year(v) === Y).sort();
        kaynak = 'Md. 32/3: sözleşme ayından başlayarak üçer aylık dört eşit taksit'; }
    }
    if (!vadeler.length) vadeler = [iso(Y, 1, 31)];
    const kTut = bol(kira, vadeler.length);
    const agac = r2(kira * 0.05), kdv = r2((kira + agac) * 0.2);
    out.vadeler = vadeler.map((v, i) => ({ vade: v, kira: kTut[i], agac: i === 0 ? agac : 0, kdv: i === 0 ? kdv : 0 }));
    out.agac = agac; out.kdv = kdv; out.toplam = r2(kira + agac + kdv); out.kaynak = kaynak;
    // güvence ve depozito (Md. 10/2): yıllık kira artış oranıyla güncellenir
    const onc = ky.onceki && ky.onceki.bedel != null ? ky.onceki.bedel : null;
    if (p.guv != null) { out.guv = r2(kira * p.guv); out.guvFark = onc != null ? r2(out.guv - onc * p.guv) : null; }
    if (p.dep != null) { out.dep = r2(kira * p.dep); out.depFark = onc != null ? r2(out.dep - onc * p.dep) : null; }
    // örnek hesap kodları
    const hk = (tur) => { const x = ornek && ornek.items.find((i) => i.tur === tur); return x ? x.hesap : null; };
    out.hesap = { kira: hk('Kira') || '120.99.01', kdv: hk('KDV') || hk('Vergi/fon') || '120.99.05', agac: hk('Ağaçlandırma') || hk('Vergi/fon') || '120.99.06' };
    // tahakkuk zamanı: takvim yılı esasında yıl başı; 'Dönem başı' esasında dönemin başladığı gün
    const due = p.yil_esas === 'Dönem başı' ? ky.bas : iso(Y, 1, 1);
    const ds = E.dokumSon(veri);
    out.zaman = due; out.dokumSon = ds['120'] || null;
    if (out.muhasebede) {
      out.fark = r2(out.muhKira - kira);
      out.durum = Math.abs(out.fark) <= 1 ? 'Muhasebede tahakkuk edildi' : 'Muhasebede farklı tutarla tahakkuk edildi';
      out.kod = Math.abs(out.fark) <= 1 ? 'tamam' : 'fark';
    } else if (out.otoVar) { out.durum = 'Program kaydıyla tahakkuk edildi'; out.kod = 'oto'; }
    else if (rapor >= due && out.dokumSon && out.dokumSon >= due) { out.durum = 'İncelenen dökümde tahakkuk tespit edilemedi'; out.kod = 'bekliyor'; }
    else if (rapor >= due) { out.durum = 'Döküm bu tarihi kapsamıyor (120 son yevmiye ' + E.fmtDate(out.dokumSon) + ')'; out.kod = 'kapsam'; }
    else { out.durum = 'Hesaplandı, ' + E.fmtDate(due) + ' itibarıyla tahakkuk edilecek'; out.kod = 'plan'; }
    return out;
  };
  // Muhasebe dökümlerinin kapsadığı son yevmiye tarihi (elle/program kayıtları hariç)
  E.dokumSon = function (veri) {
    const o = {};
    (veri.muhasebe || []).forEach((x) => { if (x.ek || x.oto || !x.tarih) return; if (!o[x.kaynak] || x.tarih > o[x.kaynak]) o[x.kaynak] = x.tarih; });
    (veri.muhasebe || []).forEach((x) => { if (!x.ek || x.oto || !x.tarih) return; if (!o.ek || x.tarih > o.ek) o.ek = x.tarih; });
    return o;
  };
  // Mükerrer kontrol anahtarı: aynı hesap dökümü satırı (kaynak, yevmiye no ve tarihi, hesap, VKN, vade, borç, alacak)
  E.muhAnahtar = (x) => [x.kaynak, x.yev, x.tarih, (x.hesap || '').trim(), String(x.vkn || '').replace(/^0+/, ''), x.vade || '', r2(x.borc || 0).toFixed(2), r2(x.alacak || 0).toFixed(2)].join('|');
  // Yeni döküm satırlarını mevcut kayıtlara işler: aynı hesabın eski döküm satırları yenisiyle değişir; elle eklenmiş
  // satırlardan dökümde birebir karşılığı bulunanlar mükerrer olmasın diye çıkarılır; program tahakkukları gerçek tahakkuk gelince düşer.
  E.muhBirlestir = function (mevcut, rows, kaynak) {
    const sayac = new Map(); rows.forEach((x) => { const k = E.muhAnahtar(x); sayac.set(k, (sayac.get(k) || 0) + 1); });
    const eskiSon = mevcut.filter((x) => x.kaynak === kaynak && !x.ek && !x.oto && x.tarih).map((x) => x.tarih).sort().slice(-1)[0] || null;
    const yeniSon = rows.map((x) => x.tarih).filter(Boolean).sort().slice(-1)[0] || null;
    const mukerrer = [], kalan = [];
    mevcut.forEach((x) => {
      if (x.kaynak === kaynak && !x.ek && !x.oto) return;            // eski döküm satırı: yenisiyle değişir
      if (x.ek && !x.oto) { const k = E.muhAnahtar(x), n = sayac.get(k) || 0; if (n > 0) { sayac.set(k, n - 1); mukerrer.push(x); return; } }
      kalan.push(x);
    });
    const gercek = new Set(rows.filter((x) => x.kaynak === '120' && x.borc > 0 && (x.alacak_h || '').includes('600')).map((x) => x.vkn + '|' + E.year(x.tarih)));
    const sonuc = kalan.filter((x) => !(x.oto && gercek.has(x.vkn + '|' + x.oto.split('|')[1])));
    return { muhasebe: sonuc.concat(rows), mukerrer, otoDus: kalan.length - sonuc.length, eskiSon, yeniSon, geri: !!(eskiSon && yeniSon && yeniSon < eskiSon) };
  };
  // Ek yapı ve tesis kirasının tahsil zamanı (Md. 30/2). vadeler: onay yılının kira taksit vadeleri.
  E.ekTahsil = function (onay, vadeler) {
    if (!onay) return { tarih: null, ne: 'Onay tarihi girilmedi' };
    const V = (vadeler || []).filter(Boolean).slice().sort(), [oy, om] = P(onay), ayson = iso(oy, om, lastDay(oy, om));
    if (V.length > 1) {
      const s = V.find((v) => v > onay);
      return s ? { tarih: s, ne: 'Onayı izleyen ilk kira taksitiyle birlikte (Md. 30/2)' } : { tarih: ayson, ne: 'Son taksit tarihi geçtiği için onay ayının sonuna kadar peşin (Md. 30/2)' };
    }
    if (V.length === 1) return onay < V[0] ? { tarih: V[0], ne: 'Yıllık kira bedeliyle birlikte (Md. 30/2)' } : { tarih: ayson, ne: 'Kira tahsil tarihinden sonra onaylandığı için onay ayının sonuna kadar (Md. 30/2)' };
    return { tarih: null, ne: 'Kira ödeme düzeni bilinmiyor' };
  };
  // Onaylı revize plan: Tebliğ tutarları (tam yıllık ek kira, Md. 30/1), tahsil zamanı (Md. 30/2) ve muhasebe kaydıyla karşılaştırma.
  // Tebliğ gün/365 kıstlaştırma öngörmez; muhasebede kıst kaydı varsa fark olarak gösterilir, otomatik kıst hesaplanmaz.
  E.revizeDurum = function (veri, esl, pl, vadeler, rapor) {
    const ek = r2(pl.ek || 0), agac = r2(ek * 0.05), kdv = r2((ek + agac) * 0.2), tem = r2(ek * 0.06);
    const th = E.ekTahsil(pl.onay, vadeler);
    const rom = ((pl.revize || '').match(/^([IVX]+)\./) || [])[1];
    const re = rom ? new RegExp('(^|[^IVX])' + rom + '\\.\\s*Revize', 'i') : null;
    const kayit = (esl.items || []).filter((it) => it.park === pl.park && it.grup === 'Ek tahakkuk' && it.tur === 'Kira' && re && re.test(it.aciklama || '') && !/fark/i.test(it.aciklama || ''));
    const muh = r2(kayit.reduce((s, it) => s + it.tutar, 0));
    const ds = E.dokumSon(veri), son = [ds['120'], ds['127']].filter(Boolean).sort().slice(-1)[0] || null;
    let kod, durum;
    if (kayit.length && Math.abs(muh - ek) <= 1) { kod = 'tamam'; durum = 'Muhasebede Tebliğ tutarıyla tahakkuk edildi'; }
    else if (kayit.length) { kod = 'fark'; durum = 'Muhasebe kaydı (' + E.tl(muh) + ') Tebliğe göre yıllık ek kiradan (' + E.tl(ek) + ') farklı; fark ' + E.tl(r2(ek - muh)) + (/k[ıi]st/i.test(kayit.map((k) => k.aciklama).join(' ')) ? '. Kayıtta gün/365 kıst uygulanmış; Tebliğ Md. 30/1–2 kıst öngörmez, ayrı dayanak belgesi yoksa farkın tahakkuku incelenmeli.' : '.'); }
    else if (son && th.tarih && son >= th.tarih) { kod = 'yok'; durum = 'İncelenen dökümde (son yevmiye ' + E.fmtDate(son) + ') tahakkuk tespit edilemedi'; }
    else if (th.tarih && rapor >= th.tarih) { kod = 'kapsam'; durum = 'Tahsil tarihi (' + E.fmtDate(th.tarih) + ') geçti; dökümler bu tarihi kapsamıyor (son yevmiye ' + E.fmtDate(son) + ')'; }
    else { kod = 'bekliyor'; durum = 'Tahsil zamanı ' + (th.tarih ? E.fmtDate(th.tarih) : 'belirsiz') + (son && pl.onay && son < pl.onay ? '; dökümler plan onayından önce (son yevmiye ' + E.fmtDate(son) + ')' : ''); }
    return { ek, agac, kdv, tem, top: r2(ek + agac + kdv + tem), tahsil: th.tarih, tahsilNe: th.ne, kayit, muh, kod, durum, dokumSon: son };
  };

  // ---------- rakamı yazıyla (Türkçe) ----------
  E.yaziyla = function (n, kurus) {
    if (n == null || isNaN(n)) return '';
    const B = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'], O = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
    const U = ['', 'bin', 'milyon', 'milyar', 'trilyon'];
    const uc = (x) => { const y = Math.floor(x / 100), o = Math.floor((x % 100) / 10), b = x % 10; return [y ? (y > 1 ? B[y] + ' ' : '') + 'yüz' : '', O[o], B[b]].filter(Boolean).join(' '); };
    const tam = (x) => { if (x === 0) return 'sıfır'; const p = []; let i = 0; while (x > 0) { const g = x % 1000; if (g) p.unshift([(i === 1 && g === 1) ? '' : uc(g), U[i]].filter(Boolean).join(' ')); x = Math.floor(x / 1000); i++; } return p.join(' '); };
    const t = Math.floor(r2(n) + 1e-9), k = Math.round((r2(n) - t) * 100);
    let s = tam(t) + ' Türk Lirası';
    if (kurus !== false && k) s += ' ' + tam(k) + ' kuruş';
    return s;
  };

  // ---------- park özetleri ----------
  E.parkOzet = function (veri, alacak, rapor, tufe) {
    const y = E.year(rapor), y1 = iso(y, 1, 1), y2 = iso(y, 12, 31);
    return veri.parks.map((p) => {
      const A = alacak.filter((a) => a.park === p.kisa);
      const kira_yil = r2(A.filter((a) => a.tur === 'Kira' && a.esas && a.esas >= y1 && a.esas <= y2).reduce((s, a) => s + a.tutar, 0));
      const tahsil = r2(A.filter((a) => a.odeme).reduce((s, a) => s + a.tutar, 0));
      const acik = r2(A.reduce((s, a) => s + a.acik, 0));
      const vgec = r2(A.filter((a) => a.esas && a.esas < rapor).reduce((s, a) => s + a.acik, 0));
      const gz = r2(A.filter((a) => !a.odeme).reduce((s, a) => s + a.gztop, 0));
      const kk = E.kiraKontrol(p, tufe, veri.ek_kira, rapor);
      const uy = [];
      if (vgec > 0) uy.push('Vadesi geçmiş alacak');
      if (p.soz_bit && p.durum === 'Kirada') { if (p.soz_bit < rapor) uy.push('Süre dolmuş'); else if (days(rapor, p.soz_bit) <= 180) uy.push('Bitime 6 aydan az'); }
      if (p.durum === 'Sona erdi') uy.push('Sona erdi: geri teslim ve tahliye (Md. 13, 41)');
      if (p.soz_bas && p.teslim && p.teslim < p.soz_bas) uy.push('Saha teslimi sözleşmeden önce');
      if (p.durum === 'Kirada' && kira_yil === 0) {
        const ky = p.yil_esas === 'Dönem başı' ? E.kiraYili(p, tufe, veri.ek_kira, y) : null;
        if (!(ky && ky.bas > rapor)) uy.push('Dökümde bu yıl vadeli kira yok');
      }
      if (kk.durum === 'Fark var') uy.push('Kira hesabı farklı');
      const kalan = p.soz_bit ? Math.max(0, days(rapor, p.soz_bit) / 365.25) : null;
      const enEski = A.filter((a) => !a.odeme && a.esas && a.esas < rapor).map((a) => a.esas).sort()[0] || null;
      return { kisa: p.kisa, kira_yil, tahsil, acik, vgec, gz, kk, uyari: uy, kalan, enEski,
        guv_t: p.guv != null ? r2(kira_yil * p.guv) : null, dep_t: p.dep != null ? r2(kira_yil * p.dep) : null };
    });
  };

  // ---------- muhasebe CSV okuma (120.99 / 127 dökümü; ';' ayraçlı) ----------
  E.csvOku = function (text, hesap) {
    // tırnak içindeki ';' ve satır sonları alanın parçasıdır (açıklama sütunu çok satırlı olabilir)
    const t = text.replace(/^﻿/, ''), M = []; let row = [], cur = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      if (q) { if (ch === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; continue; }
      if (ch === '"') q = true; else if (ch === ';') { row.push(cur); cur = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(cur); M.push(row); row = []; cur = ''; }
      else cur += ch;
    }
    if (cur !== '' || row.length) { row.push(cur); M.push(row); }
    return E.dokumSatir(M.slice(1), hesap);
  };
  // Döküm satırları (CSV ya da Excel'den okunan tablo; sütun sırası muhasebe sisteminin 120.99/127 dökümüyle aynı)
  E.dokumSatir = function (M, hesap) {
    const s = (v) => (v == null ? '' : String(v)).trim();
    const num = (v) => { if (typeof v === 'number') return r2(v); v = s(v); return v ? r2(parseFloat(v.replace(/\./g, '').replace(',', '.'))) : 0; };
    const dte = (v) => {
      if (v instanceof Date) return iso(v.getUTCFullYear(), v.getUTCMonth() + 1, v.getUTCDate());
      if (typeof v === 'number') { const t = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 864e5); return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); }
      v = s(v); if (!v) return null; if (/^\d{4}-\d\d-\d\d/.test(v)) return v.slice(0, 10);
      const [d, m, y] = v.split(/[./]/); return y ? iso(+y, +m, +d) : null;
    };
    const out = [];
    for (const x of M) {
      if (!x || x.length < 17 || !s(x[2]) || isNaN(parseInt(s(x[2]), 10))) continue;
      out.push({ kaynak: hesap, yev: parseInt(s(x[2]), 10), tarih: dte(x[3]), hesap: s(x[5]), vkn: s(x[6]), musteri: s(x[7]), vade: dte(x[8]),
        neden: s(x[12]), aciklama: s(x[13]).split(/\s+/).filter(Boolean).join(' '), borc: num(x[14]), alacak: num(x[15]),
        borc_h: s(x[17]), alacak_h: s(x[18]), not_: '', ek: false });
    }
    return out;
  };

  // ---------- biçim ----------
  E.tl = (n) => (n == null || isNaN(n) ? '–' : Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  E.pct = (n, d) => (n == null ? '–' : '%' + (n * 100).toLocaleString('tr-TR', { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }));

  // ---------- hesap araçları (Hesaplama sayfası) ----------
  E.KATSAYI = [['Kır evi', .03], ['Çadır ünitesi', .01], ['Lüks çadır ünitesi', .03], ['Karavan ünitesi', .01], ['Kır lokantası', .08], ['Kır kahvesi', .08], ['Büfe', .05],
    ['Yöresel ürün satış yeri', .04], ['Yüzme havuzu', .10], ['Macera parkı', .10], ['Paintball sahası', .10], ['Zipline', .15], ['Sıhhi tesis kompleksi', .06],
    ['Manej ve hayvan barınağı', .05], ['Diğer gelir getirici yapı ve tesis', .05]];
  // Md. 30/1: yıllık ek kira = max(cari yıl kirası × katsayı, onay yılı maliyetinin %2'si); cari yıl kirasına eklenir.
  // Md. 30/2: ek kira, KDV'si, ağaçlandırma bedeli ve ek kesin teminat onayı izleyen ilk taksitle (son taksit geçmişse onay ayı sonuna kadar) peşin tahsil edilir.
  // Tebliğ gün/365 kıstlaştırma öngörmediğinden tutar tam yıllıktır.
  E.ekTesis = function (kira, katsayi, maliyet, onay, vadeler) {
    const kb = r2(kira * katsayi), m2 = r2((maliyet || 0) * .02), ek = Math.max(kb, m2);
    const agac = r2(ek * .05), kdv = r2((ek + agac) * .2), tem = r2(ek * .06), th = E.ekTahsil(onay, vadeler);
    return { kb, m2, ek, agac, kdv, tem, top: r2(ek + agac + kdv + tem), taban: r2(kira + ek), tahsil: th.tarih, tahsilNe: th.ne };
  };
  E.ihale = function (tah, oran, ih, sure) {
    return { gec: (oran < 10 || oran > 30) ? null : r2(tah * oran / 100), kes: r2(ih * .06), guv: r2(ih * .25), dep: r2(ih * .10), agac: r2(ih * .05),
      kdv: r2((ih + r2(ih * .05)) * .2), od: ih <= 150000 ? 'Tek seferde peşin (Md. 31/1)' : 'Peşin ya da 1/3 peşin + kalanı 2 eşit taksit (Md. 31/1)', soz: r2(ih * sure) };
  };
  E.devir = function (kira, tur) { const art = tur === '0' ? r2(kira * .3) : 0; const ag = r2(art * .05); return { art, ag, kdv: r2((art + ag) * .2), yeni: r2(kira + art) }; };
  E.fesih = function (kira, kes, ekKes) { const k = r2((kes || 0) + (ekKes || 0)); return { kesO: k, taz: r2(kira), top: r2(k + kira) }; };

  if (typeof module !== 'undefined' && module.exports) module.exports = E; else root.E = E;
})(typeof window !== 'undefined' ? window : globalThis);
