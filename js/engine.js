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
    const rows = veri.muhasebe.map((x, i) => Object.assign({}, x, { id: i, park: parkByVkn[x.vkn] || 'Park dışı', item: false }));
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
  E.zincir = function (p, tufe, ekKira, NPER) {
    NPER = NPER || 30;
    const out = [];
    if (!p.taban || p.ihale_b == null) return out;
    const [ty, tm, td] = P(p.taban);
    for (let n = 1; n <= NPER; n++) {
      let bas;
      if (n === 1) bas = p.taban;
      else {
        if (p.artis === 'Takvim yılı') bas = iso(ty + n - 1, 1, 1);
        else bas = iso(ty + n - 1, tm, Math.min(td, lastDay(ty + n - 1, tm)));
        if (p.soz_bit && bas >= p.soz_bit) break;
      }
      const ek = (ekKira || []).filter((e) => e.park === p.kisa && e.donem === n).reduce((a, e) => a + e.tutar, 0);
      let t = null, ta = null, bedel = null;
      if (n === 1) bedel = p.ihale_b;
      else {
        ta = E.tufeAyi(p, bas); t = E.tufeAl(tufe, ta[0], ta[1]);
        const prev = out[n - 2];
        if (t != null && prev && prev.bedel != null) bedel = r2((prev.bedel + prev.ek) * (1 + t));
      }
      out.push({ n, bas, tufe: t, tufeAy: ta, ek, bedel });
    }
    return out;
  };
  // rapor yılının 31 Mart'ına kadar başlamış son dönem karşılaştırılır (Excel Kira Zinciri ile aynı)
  E.kiraKontrol = function (p, tufe, ekKira, rapor) {
    const z = E.zincir(p, tufe, ekKira);
    const sinir = iso(E.year(rapor), 3, 31);
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
      if (p.durum === 'Kirada' && kira_yil === 0) uy.push('Bu yıl tahakkuk yok');
      if (kk.durum === 'Fark var') uy.push('Kira hesabı farklı');
      const kalan = p.soz_bit ? Math.max(0, days(rapor, p.soz_bit) / 365.25) : null;
      const enEski = A.filter((a) => !a.odeme && a.esas && a.esas < rapor).map((a) => a.esas).sort()[0] || null;
      return { kisa: p.kisa, kira_yil, tahsil, acik, vgec, gz, kk, uyari: uy, kalan, enEski,
        guv_t: p.guv != null ? r2(kira_yil * p.guv) : null, dep_t: p.dep != null ? r2(kira_yil * p.dep) : null };
    });
  };

  // ---------- muhasebe CSV okuma (120.99 / 127 dökümü; ';' ayraçlı) ----------
  E.csvOku = function (text, hesap) {
    const num = (s) => { s = (s || '').trim(); return s ? parseFloat(s.replace(/\./g, '').replace(',', '.')) : 0; };
    const dte = (s) => { s = (s || '').trim(); if (!s) return null; const [d, m, y] = s.split('.'); return iso(+y, +m, +d); };
    const lines = text.replace(/^﻿/, '').split(/\r?\n/);
    const out = [];
    const split = (ln) => { const r = []; let cur = '', q = false; for (const ch of ln) { if (ch === '"') q = !q; else if (ch === ';' && !q) { r.push(cur); cur = ''; } else cur += ch; } r.push(cur); return r; };
    for (let i = 1; i < lines.length; i++) {
      const x = split(lines[i]);
      if (x.length < 17 || !(x[2] || '').trim()) continue;
      out.push({ kaynak: hesap, yev: parseInt(x[2], 10), tarih: dte(x[3]), hesap: x[5].trim(), vkn: x[6].trim(), musteri: x[7].trim(), vade: dte(x[8]),
        neden: x[12].trim(), aciklama: x[13].split(/\s+/).filter(Boolean).join(' '), borc: num(x[14]), alacak: num(x[15]),
        borc_h: (x[17] || '').trim(), alacak_h: (x[18] || '').trim(), not_: '', ek: false });
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
  E.ekTesis = function (kira, katsayi, maliyet, onay) {
    const kb = r2(kira * katsayi), m2 = r2(maliyet * .02), ek = Math.max(kb, m2);
    const gun = onay ? days(onay, iso(E.year(onay), 12, 31)) : 0;
    const kist = r2(ek * gun / 365), agac = r2(kist * .05), kdv = r2((kist + agac) * .2), tem = r2(ek * .06);
    return { kb, m2, ek, gun, kist, agac, kdv, tem, top: r2(kist + agac + kdv + tem), taban: r2(kira + ek) };
  };
  E.ihale = function (tah, oran, ih, sure) {
    return { gec: (oran < 10 || oran > 30) ? null : r2(tah * oran / 100), kes: r2(ih * .06), guv: r2(ih * .25), dep: r2(ih * .10), agac: r2(ih * .05),
      kdv: r2((ih + r2(ih * .05)) * .2), od: ih <= 150000 ? 'Tek seferde peşin (Md. 31/1)' : 'Peşin ya da 1/3 peşin + kalanı 2 eşit taksit (Md. 31/1)', soz: r2(ih * sure) };
  };
  E.devir = function (kira, tur) { const art = tur === '0' ? r2(kira * .3) : 0; const ag = r2(art * .05); return { art, ag, kdv: r2((art + ag) * .2), yeni: r2(kira + art) }; };
  E.fesih = function (kira, kes, ekKes) { const k = r2((kes || 0) + (ekKes || 0)); return { kesO: k, taz: r2(kira), top: r2(k + kira) }; };

  if (typeof module !== 'undefined' && module.exports) module.exports = E; else root.E = E;
})(typeof window !== 'undefined' ? window : globalThis);
