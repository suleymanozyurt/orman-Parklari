/* Tebliğ ekleri: orijinal şablon modelinden ekranda doldurulabilir form, yazdırma, Excel (ExcelJS) ve Word (JSZip) çıktısı.
   Şablon modelleri data/ekler.enc içinde şifreli gelir (build/ek_export.py üretir). */
(function (root) {
  'use strict';
  const EK = {};
  const esc = (v) => (v == null ? '' : String(v)).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const trUp = (s) => (s || '').toLocaleUpperCase('tr-TR');
  const trLow = (s) => (s || '').toLocaleLowerCase('tr-TR');
  const colL = (c) => { let s = ''; c++; while (c > 0) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };
  EK.colL = colL;
  EK.adres = (m, e) => colL(e.c + m.c1 - 1) + (e.r + m.r1);

  // ---------------------------------------------------------------- alan sözlüğü
  // Bütün eklerde aynı bilgi tek kaynaktan gelir: park kaydı, kurum bilgileri ve hesap motoru.
  EK.alanlar = function (ctx) {
    const E = root.E, p = ctx.p || {}, ku = ctx.ku || {}, fd = E.fmtDate, tl = E.tl, r2 = E.r2;
    const F = {};
    const ad = p.ad || p.kisa || '';
    const onek = ad.replace(/\s*Orman\s+Park[ıi]\s*$/i, '').trim();
    const isl = ku.isletme || '', bol = ku.bolge || '';
    const islOnek = isl.replace(/\s*Orman\s+İşletme\s+Müdürlüğü\s*$/i, '').trim();
    const bolOnek = bol.replace(/\s*Orman\s+Bölge\s+Müdürlüğü\s*$/i, '').trim();
    const sayi = (v, d) => (v == null || v === '' ? '' : Number(v).toLocaleString('tr-TR', { minimumFractionDigits: d == null ? 0 : d, maximumFractionDigits: d == null ? 2 : d }));
    const yilSay = p.soz_bas && p.soz_bit ? Math.max(1, Math.round(E.days(p.soz_bas, p.soz_bit) / 365.25)) : null;
    const vknTxt = p.vkn ? (p.vkn.length === 11 ? 'T.C. Kimlik No: ' : 'Vergi No: ') + p.vkn : '';
    const islBilgi = p.isletmeci ? (/vergi|t\.c\./i.test(p.isletmeci) || !vknTxt ? p.isletmeci : p.isletmeci + ' (' + vknTxt + ')') : '';
    const ihale = p.ihale_b;
    const kes = ihale != null ? r2(ihale * 0.06) : (p.kesin != null ? p.kesin : null);   // Md. 9/1: ihale bedelinin %6'sı
    const pl = ctx.plan || {};
    const kiraY = pl.muhasebede ? pl.muhKira : pl.kira;
    const tlY = (v) => (v == null || v === '' ? '' : tl(v) + ' ₺');
    // yazıyla: kuruşsuz tutarda yalnız sayı (şablondaki “Türk Lirası” korunur); kuruşlu tutarda “… Türk Lirası … kuruş”
    const yaz = (v) => { if (v == null) return ''; const k = Math.round((r2(v) - Math.floor(r2(v) + 1e-9)) * 100); return k ? E.yaziyla(v) : E.yaziyla(v, false).replace(/ Türk Lirası$/, ''); };
    const iban = (ku.iban || '').replace(/\s*\(.*\)\s*$/, '').trim();
    Object.assign(F, {
      park_ad: ad, park_ad_buyuk: trUp(ad), park_onek: onek, park_onek_buyuk: trUp(onek), park_onek_orman: onek ? onek + ' Orman' : '', kisa: p.kisa || '',
      statu: p.statu || '', statu_buyuk: trUp(p.statu || ''),
      seflik: p.seflik || '', seflik_tam: p.seflik ? p.seflik + ' Orman İşletme Şefliği' : '', seflik_buyuk: trUp(p.seflik ? p.seflik + ' Orman İşletme Şefliği' : ''),
      isletme: isl, isletme_onek: islOnek, isletme_onek_buyuk: trUp(islOnek), bolge: bol, bolge_onek: bolOnek, bolge_buyuk: trUp(bol),
      il: p.il || ku.il || '', ilce: p.ilce || '', il_ilce: [p.il || ku.il, p.ilce].filter(Boolean).join(' / '), mahalle: p.mahalle || '', mevki: p.mevki || '',
      bolme: p.bolme || '', mescere: p.mescere || '', rakim: p.rakim || '', koordinat: p.koordinat || '', uzaklik: p.uzaklik || '', imar: p.imar || '', tapu: p.tapu || '',
      sahibi: p.sahibi || '', muhdesat: p.muhdesat || p.tesisler || '', tesisler: p.tesisler || '', giris: p.giris || '',
      alan: sayi(p.alan), alan_ha: p.alan != null ? sayi(p.alan) + ' Ha' : '', tescil_t: fd(p.tescil_t) === '—' ? '' : fd(p.tescil_t),
      isletmeci: p.isletmeci || '', isletmeci_bilgi: islBilgi, vkn: p.vkn || '', vkn_tam: vknTxt, yetkili: p.yetkili || '', yetkili_tc: p.yetkili_tc || '',
      adres: p.adres || '', tel: p.tel || '', faks: p.faks || '', tel_faks: [p.tel, p.faks].filter(Boolean).join(' / '), eposta: p.eposta || '',
      isletilme: p.durum === 'Kirada' ? 'İşletmecilik hakkı kiraya verilmiştir' + (p.isletmeci ? ' (' + p.isletmeci + ')' : '') : (p.durum || ''),
      soz_bas: p.soz_bas ? fd(p.soz_bas) : '', soz_bit: p.soz_bit ? fd(p.soz_bit) : '', teslim: p.teslim ? fd(p.teslim) : '', ihale_t: p.ihale_t ? fd(p.ihale_t) : '',
      soz_yil: yilSay ? String(yilSay) : '', soz_yil_yazi: yilSay ? E.yaziyla(yilSay, false).replace(/ Türk Lirası$/, '') : '',
      soz_sure: p.soz_bas && p.soz_bit ? fd(p.soz_bas) + ' - ' + fd(p.soz_bit) + ' (' + yilSay + ' Yıl)' : '',
      soz_bas_sure: p.soz_bas ? fd(p.soz_bas) + (yilSay ? ' – ' + yilSay + ' yıl (' + fd(p.soz_bit) + ' tarihine kadar)' : '') : '',
      soz_konu: ad ? ad + ' işletme hakkının kiraya verilmesi' : '', soz_konu_hak: ad ? ad + ' işletme hakkı' : '', is_adres: ad ? ad + ', ' + (p.ilce ? p.ilce + ' / ' : '') + (p.il || ku.il || '') : '',
      ihale_b: ihale != null ? tl(ihale) : '', ihale_b_tl: tlY(ihale), ihale_yazi: yaz(ihale),
      kesin: kes != null ? tl(kes) : '', kesin_yazi: yaz(kes),
      guvence: p.guv != null && ihale != null ? tl(r2(ihale * p.guv)) : '', guvence_yazi: p.guv != null && ihale != null ? yaz(r2(ihale * p.guv)) : '',
      depozito: p.dep != null && ihale != null ? tl(r2(ihale * p.dep)) : '', depozito_yazi: p.dep != null && ihale != null ? yaz(r2(ihale * p.dep)) : '',
      agac: ihale != null ? tl(r2(ihale * 0.05)) : '', agac_yazi: ihale != null ? yaz(r2(ihale * 0.05)) : '',
      soz_bedel: ihale != null && yilSay ? tl(r2(ihale * yilSay)) : '', soz_bedel_yazi: ihale != null && yilSay ? yaz(r2(ihale * yilSay)) : '',
      kira_yil_tl: tlY(kiraY), kira_yil: kiraY != null ? tl(kiraY) : '',
      odeme_donem: ctx.odemeDonem || '', plan: p.plan || '',
      k_adres: ku.adres || '', k_tel: ku.tel || '', k_faks: ku.faks || '', k_tel_faks: [ku.tel, ku.faks].filter(Boolean).join(' / '), k_eposta: ku.eposta || '',
      k_ilgili: ku.ilgili || '', k_iban: iban, k_iban_nr: iban.replace(/^TR\s*/i, ''), k_banka: (ku.banka || '').replace(/\s*Bankası\s*$/i, ''), k_sube: ku.sube_banka || '', k_mudur: ku.mudur || '',
      tarih: fd(ctx.rapor), yil: String(E.year(ctx.rapor)), sabit313: '313'
    });
    // son imzalı Ek-10 raporundaki tespitler (yeni dönem raporu için başlangıç değeri)
    const R = ctx.r10 || {};
    Object.keys(R).forEach((k) => { F['r10:' + k] = R[k]; });
    return F;
  };

  // ---------------------------------------------------------------- etiket -> alan eşleştirmesi
  const norm = (s) => trLow(s || '').replace(/\s+/g, ' ').replace(/[:\s]+$/, '').trim();
  EK.norm = norm;
  const GENEL = {
    'orman parkı adı': 'park_ad', 'kiraya verilen orman parkının adı': 'park_ad', 'ili': 'il', 'il': 'il', 'kiraya verilen orman parkının ili': 'il',
    'ilçesi': 'ilce', 'ilçe': 'ilce', 'kiraya verilen orman parkının ilçesi': 'ilce', 'bölge müdürlüğü': 'bolge', 'kiraya verilen orman parkının bölge müdürlüğü': 'bolge',
    'işletme müdürlüğü': 'isletme', 'işletmesi': 'isletme', 'kiraya verilen orman parkının işletmesi': 'isletme', 'işletme şefliği': 'seflik_tam', 'şefliği': 'seflik_tam',
    'kiraya verilen orman parkının şefliği': 'seflik_tam', 'mevkii': 'mevki', 'kiraya verilen orman parkının mevkii': 'mevki', 'alanı (ha.)': 'alan',
    'kiraya verilen orman parkının alanı': 'alan_ha', 'konaklama durumu': 'statu', 'bölme no': 'bolme', 'kiraya verilen orman parkının bölmesi': 'bolme',
    'meşcere tipi': 'mescere', 'meşçere tipi': 'mescere', 'rakımı': 'rakim', 'sahanın koordinatları': 'koordinat', 'orman parkının i̇lk tescil tarihi': 'tescil_t',
    'orman parkının ilk tescil tarihi': 'tescil_t', 'orman parkı tescil tarihi': 'tescil_t', 'il ve ilçe merkezine uzaklığı': 'uzaklik', 'orman parkının işletilme durumu': 'isletilme',
    'sahanın işletmecilik durumu (idare-özel sektör)': 'isletilme', 'işletmeci bilgileri': 'isletmeci_bilgi', 'sözleşme başlangıç tarihi ve süresi': 'soz_bas_sure',
    'mevcut tesislerin adı, adedi,ebatları': 'muhdesat', 'işletmeci': 'isletmeci', 'işletmecinin yönetim kurulu başkanı adı soyadı': 'yetkili',
    'işletmecinin yönetim kurulu başkanı t.c. no': 'yetkili_tc', 'işletmenin vergi no': 'vkn', 'işletmecinin tebligat adresi': 'adres', 'işletmecinin telefonu': 'tel',
    'işletmecinin fax no': 'faks', 'işletmecinin e-posta adresi': 'eposta', 'sözleşme tarihi': 'soz_bas', 'sözleşme bitiş tarihi': 'soz_bit',
    'işletmecinin adı soyadı unvanı': 'isletmeci_bilgi', 'orman parkı alan büyüklüğü(ha)': 'alan', 'ihale tarihi': 'ihale_t', 'sözleşme süresi (başlangıç-bitim tarihi)': 'soz_sure',
    'saha teslim tesellüm tutanağı tarihi': 'teslim', 'teslim edilen tesisler (gelir getirici olanlar ve olmayanlar dâhil)': 'tesisler',
    'ihale bedeli (bir yıl için işletmeci tarafından teklif edilen bedel)': 'ihale_b_tl', 'işletme bedeli ödeme dönemleri': 'odeme_donem',
    'teklif sahibinin adı ve soyadı / ticaret unvanı': 'isletmeci', 't.c kimlik numarası ya da bağlı olduğu vergi dairesi ve vergi kimlik numarası': 'vkn_tam',
    'tebligata esas açık adresi': 'adres', 'telefon ve faks numarası (varsa)': 'tel_faks', 'elektronik posta adresi (varsa)': 'eposta',
    'mahalle/köy': 'mahalle', 'sahibi': 'sahibi', 'imar durumu': 'imar', 'adı': 'park_ad'
  };
  // Ek-10: son imzalı rapordaki tespitlerden başlangıç değeri alınan satırlar
  const R10ALAN = ['onaylı planı (gelişim ve yönetim planı)', 'onaylı planı yoksa sözleşme hükümlerine göre kim tarafından yapılacağı',
    'onaylı planında öngörülen tesisler (gelir getirici olanlar ve olmayanlar dâhil)', 'revize planı (gelişim ve yönetim planı)', 'sahada mevcut tesisler', 'ihaleye konu edilen tesisler'];
  const OZEL = {
    'Ek-2': { J21: 'il_ilce', J22: 'alan_ha', J23: 'tescil_t' },
    'Ek-18': { D6: '', D7: '', D8: '', D9: '', D10: '', D13: 'soz_konu', D14: 'soz_konu_hak', D15: 'is_adres', D16: 'isletme', D17: '', D18: 'soz_bas', D19: 'soz_bit' },
    'Ek-14': { C7: '', C8: '' }, 'Ek-15': { C8: '', C9: '' }, 'Ek-1': { C4: '' }, 'Ek-3': { D4: '' }
  };
  EK.slotAlan = function (ek, addr, lab) {
    const o = OZEL[ek];
    if (o && Object.prototype.hasOwnProperty.call(o, addr)) return o[addr] || null;
    const n = norm(lab);
    if (/yılı işletme bedeli$/.test(n)) return 'kira_yil_tl';
    if (ek === 'Ek-10' && R10ALAN.includes(n)) return 'r10:' + n;
    return GENEL[n] || null;
  };

  // ---------------------------------------------------------------- cümle içi boşluklar
  const BOS = /[.…]+\s*\/\s*[.…]+\s*\/\s*(?:20)?[.…]+|[.…]{2,}|…/g;
  const HARF = /[A-Za-zÇĞİÖŞÜçğıöşü0-9]/;
  const bitistir = (str, off, len, v) => (off > 0 && HARF.test(str[off - 1]) ? ' ' : '') + v + (HARF.test(str[off + len] || '') ? ' ' : '');
  EK.temizle = (t) => t.replace(/(kuruş)\s+Türk Lirasıdır/g, '$1tur').replace(/(kuruş)\s+Türk Lirası(?![a-zçğıöşü])/g, '$1').replace(/(Türk Lirası)\s+Türk Lirası/g, '$1');
  EK.bosDoldur = function (txt, kurallar, F) {
    if (!kurallar) return { t: txt, oto: false };
    let t = txt, oto = false;
    if (kurallar.tpl) {
      const keys = (kurallar.tpl.match(/\{(\w+)\}/g) || []).map((k) => k.slice(1, -1));
      if (keys.every((k) => F[k])) { t = kurallar.tpl.replace(/\{(\w+)\}/g, (m, k) => F[k]); oto = true; }
      return { t, oto };
    }
    (kurallar.r || []).forEach(([re, tpl, sart]) => {
      const keys = (tpl.match(/\{(\w+)\}/g) || []).map((k) => k.slice(1, -1));
      if (sart && !F[sart]) return;
      if (!keys.every((k) => F[k])) return;
      const nt = t.replace(new RegExp(re, 'm'), tpl.replace(/\{(\w+)\}/g, (m, k) => F[k]));
      if (nt !== t) { t = nt; oto = true; }
    });
    if (kurallar.b) {
      let i = 0;
      t = t.replace(BOS, (m, off, str) => { const k = kurallar.b[i++]; if (k && F[k]) { oto = true; return bitistir(str, off, m.length, F[k]); } return m; });
    }
    return { t: oto ? EK.temizle(t) : t, oto };
  };
  const HUCRE = {
    'Ek-1': { A106: { b: ['il', 'ilce', 'mevki', 'alan'] } },
    'Ek-2': { H19: { tpl: '{park_ad_buyuk}' } },
    'Ek-3': { A36: { b: ['park_onek'] } },
    'Ek-4': { F43: { tpl: '{park_ad_buyuk} GELİŞİM VE YÖNETİM PLANI' }, B115: { tpl: '{park_ad_buyuk}' }, B130: { tpl: '{park_ad_buyuk}' },
      B118: { tpl: '{park_ad_buyuk}\nGELİŞİM VE YÖNETİM PLANI' }, B133: { tpl: '{park_ad_buyuk}\nGELİŞİM VE YÖNETİM PLANI' } },
    'Ek-5': { B5: { tpl: '{isletme_onek_buyuk} ORMAN İŞLETME MÜDÜRLÜĞÜ' }, B6: { tpl: '{park_ad_buyuk} UYGULAMA PROJESİ' } },
    'Ek-9': { A36: { b: ['soz_bas'] } },
    'Ek-10': { A5: { tpl: '{park_ad_buyuk}' } },
    'Ek-12': { A18: { r: [['olan,\\s*Orman İşletme Şefliği', 'olan, {seflik_tam}'], ['kalan\\tOrman Parkında', 'kalan {park_onek} Orman Parkında']], b: ['bolme'] } },
    'Ek-13': { A4: { b: ['isletme_onek_buyuk', null, 'seflik', 'bolme'], r: [['kalan\\tOrman Parkında', 'kalan {park_onek} Orman Parkında']] } },
    'Ek-14': { A10: { r: [['çıkarılan;\\tOrman İşletme Şefliği', 'çıkarılan; {seflik_tam}']], b: ['bolme', 'park_onek'] } },
    'Ek-15': { A11: { b: ['seflik', 'bolme'], r: [['kalan\\tOrman Parkında', 'kalan {park_onek} Orman Parkında'], ['\\[İşletmecinin adı ve soyadı/ticaret unvanı\\]', '{isletmeci}']] } }
  };

  // ---------------------------------------------------------------- basit formül değerlendirici
  function formul(f, m, deger, rapor) {
    if (!f || f.includes('!')) return null;
    const ex = f.replace(/^=/, '');
    const parts = []; let cur = '', q = false, d = 0;
    for (const ch of ex) { if (ch === '"') q = !q; if (!q && ch === '(') d++; if (!q && ch === ')') d--; if (!q && d === 0 && ch === '&') { parts.push(cur); cur = ''; } else cur += ch; }
    parts.push(cur);
    let out = '';
    for (let p of parts) {
      p = p.trim();
      let mm;
      if ((mm = p.match(/^"(.*)"$/))) out += mm[1].replace(/""/g, '"');
      else if (/^YEAR\(TODAY\(\)\)$/i.test(p)) out += rapor.slice(0, 4);
      else if (/^TODAY\(\)$/i.test(p)) out += root.E.fmtDate(rapor);
      else if ((mm = p.match(/^\$?([A-Z]+)\$?(\d+)$/))) out += deger(mm[1] + mm[2]) || '';
      else if (/^-?\d+(\.\d+)?$/.test(p)) out += p;
      else return null;
    }
    return out;
  }

  // ---------------------------------------------------------------- hücre değerleri
  // kaynak: 'el' (yöneticinin girdiği), 'oto' (kayıtlardan), 'ipucu' (boş form açıklaması), 'sabit' (şablon metni)
  EK.degerler = function (ek, m, F, el, rapor) {
    el = el || {};
    const V = {}, A = {};
    m.cells.forEach((c) => { A[EK.adres(m, c)] = c; });
    const get = (a) => (V[a] ? V[a].v : (A[a] ? (A[a].t || '') : ''));
    const hk = HUCRE[ek] || {};
    // önce formülsüz hücreler, sonra formüller (başvurduğu hücre önce hazır olsun)
    const sirali = m.cells.slice().sort((a, b) => (a.f ? 1 : 0) - (b.f ? 1 : 0));
    for (const c of sirali) {
      const a = EK.adres(m, c);
      if (Object.prototype.hasOwnProperty.call(el, a)) { V[a] = { v: el[a], k: 'el' }; continue; }
      if (c.bool != null) { V[a] = { v: c.bool ? 'True' : 'False', k: 'sabit' }; continue; }
      if (c.f) { const r = formul(c.f, m, get, rapor); V[a] = { v: r != null ? r : (c.t || ''), k: r != null && /YEAR|TODAY/i.test(c.f) ? 'oto' : 'sabit' }; continue; }
      if (c.slot) {
        if (m.dolu) { V[a] = { v: c.t || '', k: 'sabit', slot: 1 }; continue; }
        const key = EK.slotAlan(ek, a, c.lab);
        const v = key ? F[key] : '';
        if (v) V[a] = { v, k: 'oto', slot: 1, key };
        else V[a] = { v: '', k: 'ipucu', ipucu: c.ipucu || '', slot: 1, key };
        continue;
      }
      if (hk[a] && c.t) { const r = EK.bosDoldur(c.t, hk[a], F); V[a] = { v: r.t, k: r.oto ? 'oto' : 'sabit' }; continue; }
      V[a] = { v: c.t || '', k: 'sabit' };
    }
    return V;
  };

  // ---------------------------------------------------------------- ekrana çizim
  const FONT = (fn) => { const f = (fn || 'Calibri'); if (/times/i.test(f)) return "'Times New Roman',Tinos,Times,serif"; if (/calibri/i.test(f)) return 'Calibri,Carlito,Arial,sans-serif';
    if (/arial/i.test(f)) return "Arial,'Liberation Sans',Helvetica,sans-serif"; if (/cambria/i.test(f)) return 'Cambria,Caladea,Georgia,serif'; return "'" + f + "',Arial,sans-serif"; };
  const BW = { thin: '1px solid', medium: '2px solid', thick: '3px solid', double: '3px double', dotted: '1px dotted', hair: '1px dotted', dashed: '1px dashed',
    mediumDashed: '2px dashed', dashDot: '1px dashed', mediumDashDot: '2px dashed', dashDotDot: '1px dotted', mediumDashDotDot: '2px dotted', slantDashDot: '2px dashed' };
  function css(st, num) {
    const s = [];
    s.push('font-family:' + FONT(st.fn)); s.push('font-size:' + (st.fs || 11) + 'pt');
    if (st.b) s.push('font-weight:700'); if (st.i) s.push('font-style:italic');
    const deco = []; if (st.u) deco.push('underline'); if (st.st) deco.push('line-through'); if (deco.length) s.push('text-decoration:' + deco.join(' '));
    if (st.fc) s.push('color:' + st.fc); if (st.bg) s.push('background:' + st.bg);
    const bd = st.bd || {};
    ['top', 'right', 'bottom', 'left'].forEach((k) => { if (bd[k]) s.push('border-' + k + ':' + (BW[bd[k][0]] || '1px solid') + ' ' + bd[k][1]); });
    const h = st.h || (num ? 'right' : 'left');
    s.push('text-align:' + (h === 'centerContinuous' ? 'center' : h));
    s.push('vertical-align:' + (st.v || 'bottom'));
    s.push(st.w ? 'white-space:pre-wrap;overflow-wrap:anywhere' : 'white-space:pre');
    if (st.in) s.push('padding-left:' + (st.in * 9 + 2) + 'px');
    return s.join(';');
  }
  EK.genislik = (m) => m.cols.reduce((a, c) => a + c.px, 0);
  EK.ciz = function (ek, m, V, opt) {
    opt = opt || {};
    const W = EK.genislik(m);
    const occ = {};
    m.cells.forEach((c) => { for (let r = 0; r < (c.rs || 1); r++) for (let k = 0; k < (c.cs || 1); k++) occ[(c.r + r) + ',' + (c.c + k)] = (r || k) ? 'x' : c; });
    const stCss = m.styles.map((s) => css(s, false));
    const brk = new Set(m.brk || []);
    let h = '<table class="eks" style="width:' + W + 'px"><colgroup>' + m.cols.map((c) => '<col style="width:' + c.px + 'px">').join('') + '</colgroup><tbody>';
    for (let r = 0; r < m.rows.length; r++) {
      const rh = m.rows[r].px;
      h += '<tr style="height:' + rh + 'px' + (rh === 0 ? ';visibility:collapse' : '') + '"' + (brk.has(r + 1) ? ' class="eks-brk"' : '') + '>';
      for (let c = 0; c < m.cols.length; c++) {
        const o = occ[r + ',' + c];
        if (o === 'x') continue;
        if (!o) { h += '<td' + (opt.duzenle ? ' class="eks-e" contenteditable="true" data-ad="' + colL(c + m.c1 - 1) + (r + m.r1) + '"' : '') + '></td>'; continue; }
        const a = EK.adres(m, o), v = V[a] || { v: '', k: 'sabit' };
        let st = stCss[o.s] || '';
        if (o.n != null && !(o.slot)) st = css(m.styles[o.s] || {}, true);
        const span = (o.rs > 1 ? ' rowspan="' + o.rs + '"' : '') + (o.cs > 1 ? ' colspan="' + o.cs + '"' : '');
        let ic, cls = 'k-' + v.k + (o.slot ? ' eks-slot' : '');
        if (o.bool != null) ic = '<span class="eks-cb">' + (v.v === 'True' ? '☒' : '☐') + '</span>';
        else if (v.k === 'ipucu') ic = '<span class="eks-ip">' + esc(v.ipucu) + '</span>';
        else ic = esc(v.v);
        const ed = opt.duzenle && o.bool == null ? ' contenteditable="true"' : '';
        h += '<td' + span + ' class="' + cls + (opt.duzenle ? ' eks-e' : '') + '" style="' + st + '" data-ad="' + a + '"' + (o.bool != null ? ' data-cb="1"' : '') + ed +
          (o.dv ? ' data-dv="' + esc(o.dv.join('|')) + '"' : '') + (v.key ? ' title="Otomatik alan: ' + esc(v.key) + '"' : '') + '>' + ic + '</td>';
      }
      h += '</tr>';
    }
    h += '</tbody></table>';
    const img = (m.imgs || []).map((i) => '<img class="eks-img" src="' + i.src + '" style="left:' + i.x + 'px;top:' + i.y + 'px;width:' + i.w + 'px;height:' + i.h + 'px" alt="">').join('');
    return '<div class="eks-kagit' + (m.yatay ? ' yatay' : '') + '" data-w="' + W + '" style="width:' + W + 'px">' + h + img + '</div>';
  };
  EK.eksikler = function (m, V) {
    return m.cells.filter((c) => c.slot).map((c) => ({ a: EK.adres(m, c), lab: c.lab, v: V[EK.adres(m, c)] })).filter((x) => x.v && x.v.k === 'ipucu');
  };

  // ---------------------------------------------------------------- kütüphane yükleme
  const yuklenen = {};
  EK.js = function (src) {
    if (!yuklenen[src]) yuklenen[src] = new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error(src + ' yüklenemedi')); document.head.appendChild(s); });
    return yuklenen[src];
  };
  const ub64 = (s) => { const bin = atob(s); const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b; };
  EK.indir = function (blob, ad) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ad; a.style.display = 'none'; document.body.appendChild(a); a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(a.href); }, 60000); };

  // ---------------------------------------------------------------- Excel çıktısı (orijinal şablon ölçüleriyle)
  const argb = (h) => 'FF' + (h || '#000000').replace('#', '').toUpperCase();
  EK.excel = async function (ek, m, V, sayfaAd) {
    await EK.js('vendor/exceljs.min.js');
    const wb = new root.ExcelJS.Workbook();
    wb.creator = 'Orman Parkları programı';
    const ws = wb.addWorksheet((sayfaAd || ek).slice(0, 31).replace(/[\\/?*[\]:]/g, '-'), { views: [{ showGridLines: false }] });
    const R0 = m.r1 - 1, C0 = m.c1 - 1;
    for (let c = 0; c < C0; c++) ws.getColumn(c + 1).width = 2;
    m.cols.forEach((c, i) => { const col = ws.getColumn(C0 + i + 1); col.width = c.w; if (c.px === 0) col.hidden = true; });
    m.rows.forEach((r, i) => { const row = ws.getRow(R0 + i + 1); row.height = r.h; if (r.px === 0) row.hidden = true; });
    const stil = (st, edge) => {
      const o = { font: { name: st.fn || 'Calibri', size: st.fs || 11, bold: !!st.b, italic: !!st.i, underline: !!st.u, strike: !!st.st, color: { argb: argb(st.fc) } },
        alignment: { horizontal: st.h || undefined, vertical: st.v === 'middle' ? 'middle' : (st.v || 'bottom'), wrapText: !!st.w, indent: st.in || undefined, textRotation: st.rot || undefined } };
      if (st.bg) o.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(st.bg) } };
      const bd = st.bd || {}, b = {};
      ['top', 'left', 'bottom', 'right'].forEach((k) => { if (bd[k] && (!edge || edge[k])) b[k] = { style: bd[k][0], color: { argb: argb(bd[k][1]) } }; });
      if (Object.keys(b).length) o.border = b;
      return o;
    };
    for (const c of m.cells) {
      const a = EK.adres(m, c), v = V[a] || { v: '' };
      const r = R0 + c.r + 1, k = C0 + c.c + 1, rs = c.rs || 1, cs = c.cs || 1;
      const st = m.styles[c.s] || {};
      if (rs > 1 || cs > 1) {
        for (let i = 0; i < rs; i++) for (let j = 0; j < cs; j++) {
          const cell = ws.getCell(r + i, k + j);
          Object.assign(cell, stil(st, { top: i === 0, bottom: i === rs - 1, left: j === 0, right: j === cs - 1 }));
        }
        ws.mergeCells(r, k, r + rs - 1, k + cs - 1);
      }
      const cell = ws.getCell(r, k);
      Object.assign(cell, stil(st));
      let val;
      if (c.bool != null) val = v.v === 'True' ? '☒' : '☐';
      else if (v.k === 'ipucu') val = v.ipucu || '';
      else if (c.n != null && v.k === 'sabit') { val = c.n; if (st.nf) cell.numFmt = st.nf; }
      else val = v.v;
      if (val !== '' && val != null) cell.value = val;
    }
    // elle girilen ama şablonda hücresi olmayan yerler
    Object.keys(V).forEach((a) => { if (!m.cells.some((c) => EK.adres(m, c) === a) && V[a].v) ws.getCell(a).value = V[a].v; });
    for (const b of m.brk || []) ws.getRow(R0 + b).addPageBreak();
    const xs = [0]; m.cols.forEach((c) => xs.push(xs[xs.length - 1] + c.px));
    const ys = [0]; m.rows.forEach((r) => ys.push(ys[ys.length - 1] + r.px));
    const kesir = (arr, v) => { let i = 0; while (i < arr.length - 2 && arr[i + 1] <= v) i++; const w = arr[i + 1] - arr[i] || 1; return i + (v - arr[i]) / w; };
    (m.imgs || []).forEach((im) => {
      const mt = im.src.match(/^data:image\/(\w+);base64,(.*)$/); if (!mt) return;
      const id = wb.addImage({ base64: mt[2], extension: mt[1] === 'jpeg' ? 'jpeg' : 'png' });
      ws.addImage(id, { tl: { col: C0 + kesir(xs, im.x), row: R0 + kesir(ys, im.y) }, ext: { width: im.w, height: im.h } });
    });
    const k = m.kenar || [0.7, 0.7, 0.75, 0.75];
    ws.pageSetup = { paperSize: 9, orientation: m.yatay ? 'landscape' : 'portrait', fitToPage: !!m.fit, fitToWidth: m.fit ? m.fitW : undefined, fitToHeight: m.fit ? m.fitH : undefined,
      scale: m.fit ? undefined : (m.scale || 100), horizontalCentered: !!m.ortala,
      margins: { left: k[0], right: k[1], top: k[2], bottom: k[3], header: 0.3, footer: 0.3 },
      printArea: colL(C0) + (R0 + 1) + ':' + colL(C0 + m.cols.length - 1) + (R0 + m.rows.length) };
    const buf = await wb.xlsx.writeBuffer();
    return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  // ---------------------------------------------------------------- Word ekleri (Ek-11, 16, 17)
  // Paragraf sırası ve başlangıç metniyle eşleşen kurallara göre noktalı boşluklar doldurulur; biçim ve dipnotlar korunur.
  const DOC = {
    'Ek-11': { 6: { on: 'Adresi', b: ['k_adres'] }, 7: { on: 'Telefon', b: ['k_tel'] }, 8: { on: 'Faks', b: ['k_faks'] }, 10: { on: 'İlgili', b: ['k_ilgili'] },
      13: { on: '2.1-', b: ['seflik', 'bolme'] }, 14: { on: 'No.lu', r: [['kalan\\t', 'kalan {park_onek} ']] }, 16: { on: 'İli', b: ['il'] }, 17: { on: 'İlçesi', b: ['ilce'] },
      18: { on: 'Köyü', b: ['mahalle'] }, 19: { on: 'ç) Mevkii', b: ['mevki'] }, 21: { on: 'Tapu', b: ['tapu'] }, 22: { on: 'Yüzölçümü', r: [['^Yüzölçümü\\t', 'Yüzölçümü\t: {alan} ']] },
      26: { on: 'Muhdesatı', b: ['muhdesat'] }, 27: { on: 'ı) İl/İlçe', b: ['uzaklik'] }, 28: { on: 'İmar', b: ['il'], r: [['ile\\tİlçe$', 'ile {ilce} İlçe']] },
      37: { on: '2.5-', b: ['soz_yil'], r: [['\\(\\t\\)', '({soz_yil_yazi})']] },
      54: { on: 'veznesine', b: ['isletme_onek', 'k_banka', 'k_sube'], r: [['IBAN TR…', 'IBAN {k_iban}']] },
      136: { on: 'yapmak;', b: ['park_onek'] }, 140: { on: '12.3-', b: ['park_onek'], r: [['verilecek\\tOrman Parkına', 'verilecek {park_onek} Orman Parkına']] },
      142: { on: '…', b: ['park_onek'] }, 162: { on: 'İstekliler', b: ['park_onek'] }, 186: { on: '21.1-', b: ['park_onek'] },
      208: { on: '23.2.2-', b: ['isletme_onek', 'isletme_onek', 'k_banka', 'k_sube'], r: [['IBAN TR\\t', 'IBAN {k_iban} ']] },
      245: { on: '26.1-', b: ['park_onek'] }, 282: { on: '31.4-', b: ['park_onek'] }, 283: { on: '31.4.1-', b: ['isletme_onek', 'isletme_onek'] },
      284: { on: '…', b: ['k_banka', 'k_sube'], r: [['IBANTR\\s*[.…]+', 'IBAN {k_iban}']] }, 288: { on: '31.5.-', r: [['[.…]{2,}\\s*…\\s*Tipi Mesire Yeri', '{park_ad}']] },
      289: { on: '31.5.1-', b: ['isletme_onek', 'isletme_onek'] }, 290: { on: '…', b: ['k_banka', 'k_sube'], r: [['IBANTR\\s*[.…]+', 'IBAN {k_iban}']] }, 307: { on: '32.3-', b: ['isletme_onek'] },
      326: { on: '35.4-', b: ['soz_yil', 'soz_yil_yazi'] }, 355: { on: '37.3-', b: ['il'] }, 460: { on: '41.11-', b: ['bolge_onek'] }, 472: { on: '42.1-', b: ['park_onek_orman'] },
      503: { on: '45.1-', b: ['soz_yil', 'soz_yil_yazi'] } },
    'Ek-16': { 1: { on: '…', b: ['isletme_onek_buyuk'] }, 2: { on: 'Müdürlüğümüz', b: ['seflik', 'park_onek'], r: [['Planı\\tNo\\.lu', 'Planı {bolme} No.lu']] },
      4: { on: 'Adresi', r: [['^(Adresi\\t: ).*$', '$1{k_adres}']] }, 5: { on: '…', r: [['^.*$', '', 'k_adres']] }, 6: { on: 'Telefon', b: ['k_tel_faks'] },
      15: { on: ': 1 Adet', b: ['park_onek'] }, 46: { on: '…', b: ['k_banka', 'k_sube'], r: [['IBAN TR\\t', 'IBAN {k_iban} ']] } },
    'Ek-17': { 4: { on: 'Madde 1-', b: ['isletme_onek_buyuk', 'isletmeci'] }, 7: { on: 'Adresi', b: ['k_adres'] }, 8: { on: 'Tel', b: ['k_tel'] }, 9: { on: 'Faks', b: ['k_faks'] },
      12: { on: 'Adı ve', b: ['isletmeci'] }, 13: { on: 'T.C.', b: ['vkn'] }, 14: { on: 'İşletmecinin', b: ['adres'] }, 15: { on: 'Tel', b: ['tel'] }, 16: { on: 'Faks', b: ['faks'] },
      10: { on: 'E-Posta', r: [['\\s*@ogm\\.gov\\.tr\\s*$', '\t: {k_eposta}']] }, 17: { on: 'E-Posta', b: ['eposta'] }, 21: { on: '3.1-', b: ['seflik', 'bolme', 'park_onek'] }, 23: { on: 'İli', b: ['il'] }, 24: { on: 'İlçesi', b: ['ilce'] },
      25: { on: 'Köyü', b: ['mahalle'] }, 26: { on: 'ç) Mevkii', b: ['mevki'] }, 29: { on: 'Yüzölçümü', b: ['alan'] }, 37: { on: 'Muhdesatı', b: ['muhdesat'] },
      38: { on: 'ı) İmar', b: ['il', 'ilce'] },
      61: { on: 'yıllık kira', r: [['\\(rakamla\\)\\tTL\\. \\(yazıyla\\)\\tTürk', '(rakamla) {kesin} TL. (yazıyla) {kesin_yazi} Türk']] },
      62: { on: '8.1.2-', b: ['kesin'], r: [['\\(yazıyla\\)\\tTürk', '(yazıyla) {kesin_yazi} Türk']] },
      67: { on: '8.2-', r: [['\\(rakamla\\)\\tTL\\. \\(yazıyla\\)$', '(rakamla) {depozito} TL. (yazıyla)']] }, 68: { on: '…', b: ['depozito_yazi'] },
      69: { on: '8.2.1-', b: ['depozito'], r: [['\\(yazıyla\\)\\tTürk', '(yazıyla) {depozito_yazi} Türk']] },
      77: { on: 'bedeli için', r: [['\\(rakamla\\)\\tTL\\. \\(yazıyla\\)$', '(rakamla) {guvence} TL. (yazıyla)']] }, 78: { on: '…', b: ['guvence_yazi'] },
      79: { on: '8.3.1-', b: ['guvence'], r: [['\\(yazıyla\\)\\tTürk', '(yazıyla) {guvence_yazi} Türk']] },
      97: { on: 'bedeli için', b: ['agac'] }, 98: { on: '…', b: ['agac_yazi'] }, 99: { on: '8.4.1-', b: ['agac', 'agac_yazi', null, 'isletme_onek', 'isletme_onek'] },
      100: { on: '…', b: ['k_banka', 'k_sube'] }, 101: { on: '…', b: ['k_iban'] }, 108: { on: '9.1-', b: ['ihale_b', 'ihale_yazi'] },
      110: { on: '9.1.2-', b: ['ihale_b'], r: [['\\(yazıyla\\)\\tTürk', '(yazıyla) {ihale_yazi} Türk']] },
      111: { on: 'kira bedeli', b: [null, 'isletme_onek', 'isletme_onek'], r: [['nün\\tBankası$', 'nün {k_banka} Bankası']] },
      112: { on: '…', b: ['k_sube'], r: [['IBAN\\t', 'IBAN {k_iban} ']] }, 123: { on: '10.1-', r: [['[.…]+/[.…]+/\\s*', '{soz_bit} ']] },
      129: { on: '10.4-', b: ['soz_yil', 'soz_yil_yazi'] }, 131: { on: 'ön görülen', b: ['sabit313'] }, 242: { on: '16.11-', b: ['bolge_onek'] },
      254: { on: '17.1-', b: ['park_onek_orman'] }, 290: { on: '20.3-', b: ['il'] }, 321: { on: '21.1-', b: ['soz_yil', 'soz_yil_yazi'] } }
  };
  EK.DOC = DOC;
  const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  function parSegs(p) {
    const segs = []; let pos = 0;
    const walk = (n) => {
      for (const ch of Array.from(n.childNodes)) {
        if (ch.nodeType !== 1) continue;
        const ln = ch.localName;
        if (ln === 't') { const t = ch.textContent; segs.push({ n: ch, t, s: pos }); pos += t.length; }
        else if (ln === 'tab' && ch.parentNode.localName === 'r') { segs.push({ n: ch, t: '\t', s: pos, tab: true }); pos += 1; }
        else if (ln === 'r' || ln === 'hyperlink' || ln === 'ins' || ln === 'smartTag' || ln === 'fldSimple') walk(ch);
      }
    };
    walk(p);
    return segs;
  }
  // [bas, son) aralığını yeni metinle değiştir
  function degistir(doc, segs, bas, son, yeni) {
    if (bas === son) {
      const sg = segs.find((x) => !x.tab && x.s <= bas && bas < x.s + x.t.length) || segs.find((x) => !x.tab && x.s + x.t.length === bas);
      if (sg) { const a = bas - sg.s; sg.t = sg.t.slice(0, a) + yeni + sg.t.slice(a); sg.n.textContent = sg.t; sg.n.setAttribute('xml:space', 'preserve'); return; }
      const nx = segs.find((x) => x.s >= bas);
      if (nx) { const t = doc.createElementNS(W_NS, 'w:t'); t.setAttribute('xml:space', 'preserve'); t.textContent = yeni; nx.n.parentNode.insertBefore(t, nx.n); }
      return;
    }
    let yazildi = false;
    for (const sg of segs) {
      const e = sg.s + sg.t.length;
      if (e <= bas || sg.s >= son) continue;
      const a = Math.max(bas, sg.s) - sg.s, b = Math.min(son, e) - sg.s;
      if (sg.tab) {
        if (!yazildi) { const t = doc.createElementNS(W_NS, 'w:t'); t.setAttribute('xml:space', 'preserve'); t.textContent = yeni; sg.n.parentNode.insertBefore(t, sg.n); yazildi = true; }
        sg.n.parentNode.removeChild(sg.n); sg.t = ''; continue;
      }
      const t = sg.t;
      sg.t = t.slice(0, a) + (yazildi ? '' : yeni) + t.slice(b);
      sg.n.textContent = sg.t; sg.n.setAttribute('xml:space', 'preserve');
      yazildi = true;
    }
  }
  EK.docxDoldur = async function (ek, b64, F, el) {
    await EK.js('vendor/jszip.min.js');
    const zip = await root.JSZip.loadAsync(ub64(b64));
    const xml = await zip.file('word/document.xml').async('string');
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const body = doc.getElementsByTagNameNS(W_NS, 'body')[0];
    const pars = Array.from(body.childNodes).filter((n) => n.nodeType === 1 && n.localName === 'p');
    const K = DOC[ek] || {}; const sonuc = [];
    Object.keys(K).forEach((ix) => {
      const kr = K[ix], p = pars[+ix]; if (!p) return;
      let segs = parSegs(p); const txt = segs.map((s) => s.t).join('');
      if (kr.on && !txt.trim().startsWith(kr.on)) { sonuc.push({ ix, durum: 'eşleşmedi' }); return; }
      const ov = el && el[ek + ':' + ix];
      const yeni = ov != null ? { t: ov, oto: true } : EK.bosDoldur(txt, kr, F);
      if (yeni.t === txt) { sonuc.push({ ix, durum: 'boş kaldı', txt }); return; }
      // en uzun ortak baş ve son kısım dışında kalan aralığı değiştir (biçim korunur)
      let i = 0; while (i < txt.length && i < yeni.t.length && txt[i] === yeni.t[i]) i++;
      let j = 0; while (j < txt.length - i && j < yeni.t.length - i && txt[txt.length - 1 - j] === yeni.t[yeni.t.length - 1 - j]) j++;
      // birden çok ayrı değişiklik varsa her boşluğu ayrı ayrı uygula
      const parca = []; let t = txt; const b = kr.b || [];
      if (ov == null && b.length && !kr.r) {
        let k = 0; const ms = [];
        t.replace(BOS, (m, off, str) => { const key = b[k++]; if (key && F[key]) ms.push([off, off + m.length, bitistir(str, off, m.length, F[key])]); return m; });
        for (let z = ms.length - 1; z >= 0; z--) { segs = parSegs(p); degistir(doc, segs, ms[z][0], ms[z][1], ms[z][2]); }
        segs = parSegs(p); const t1 = segs.map((s) => s.t).join(''), t2 = EK.temizle(t1);
        if (t2 !== t1) { let a = 0; while (a < t1.length && t1[a] === t2[a]) a++; let c = 0; while (c < t1.length - a && c < t2.length - a && t1[t1.length - 1 - c] === t2[t2.length - 1 - c]) c++; degistir(doc, segs, a, t1.length - c, t2.slice(a, t2.length - c)); }
      } else {
        degistir(doc, segs, i, txt.length - j, yeni.t.slice(i, yeni.t.length - j));
      }
      sonuc.push({ ix, durum: 'dolduruldu', txt: yeni.t });
      void parca;
    });
    zip.file('word/document.xml', new XMLSerializer().serializeToString(doc));
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    return { blob, sonuc };
  };
  EK.docxGoster = async function (blob, kutu) {
    await EK.js('vendor/jszip.min.js');
    await EK.js('vendor/docx-preview.min.js');
    kutu.innerHTML = '';
    await root.docx.renderAsync(blob, kutu, null, { inWrapper: true, ignoreWidth: false, ignoreHeight: false, breakPages: true, renderFootnotes: true, experimental: false, className: 'dx' });
  };
  // Word eki için kural listesi (ekranda alan paneli)
  EK.docAlanlar = function (ek, F) {
    const K = DOC[ek] || {}; const out = [];
    Object.keys(K).forEach((ix) => {
      const kr = K[ix]; const keys = (kr.b || []).filter(Boolean).concat(((kr.r || []).map((x) => (x[1].match(/\{(\w+)\}/g) || []).map((k) => k.slice(1, -1)))).flat());
      Array.from(new Set(keys)).forEach((k) => out.push({ ix, key: k, v: F[k] || '' }));
    });
    return out;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = EK; else root.EK = EK;
})(typeof window !== 'undefined' ? window : globalThis);
