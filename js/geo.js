/* Coğrafi kontrol: mevcut şifreli veri şemasıyla uyumlu, hiçbir kaydı değiştirmez. */
(function (root) {
  'use strict';
  const G = {}, R = 6371008.8, rad = (x) => x * Math.PI / 180;
  G.normal = (s) => String(s || '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');
  G.safeURL = (s) => { try { const u = new URL(s); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch (_) { return ''; } };
  G.points = (f) => f.g === 'N' ? [f.c] : (f.c || []);
  G.coordinate = (q) => Array.isArray(q) && q.length >= 2 && Number.isFinite(q[0]) && Number.isFinite(q[1]) && Math.abs(q[0]) <= 90 && Math.abs(q[1]) <= 180;
  const eq = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
  G.close = (a) => { const r = a.slice(); if (r.length && !eq(r[0], r[r.length - 1])) r.push(r[0].slice()); return r; };
  const orient = (a, b, c) => { const x = (b[1] - a[1]) * (c[0] - a[0]), y = (b[0] - a[0]) * (c[1] - a[1]), d = x - y; return Math.abs(d) <= (Math.abs(x) + Math.abs(y)) * Number.EPSILON * 4 ? 0 : d; };
  const on = (a, b, p) => orient(a, b, p) === 0 && p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0]) && p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1]);
  const crosses = (a, b, c, d) => { const x = orient(a, b, c), y = orient(a, b, d), z = orient(c, d, a), w = orient(c, d, b);
    return (x * y < 0 && z * w < 0) || on(a, b, c) || on(a, b, d) || on(c, d, a) || on(c, d, b); };
  G.ringIssues = (r) => {
    if (!Array.isArray(r) || r.some((q) => !G.coordinate(q))) return ['Geçersiz WGS84 koordinatı'];
    const clean = r.filter((q, i) => !i || !eq(q, r[i - 1]));
    const a = eq(clean[0], clean[clean.length - 1]) ? clean.slice(0, -1) : clean;
    if (new Set(a.map((q) => q.join(','))).size < 3) return ['Poligon için en az üç farklı köşe gerekli'];
    for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) {
      if (j === i + 1 || (i === 0 && j === a.length - 1)) continue;
      if (crosses(a[i], a[(i + 1) % a.length], a[j], a[(j + 1) % a.length])) return ['Poligon kendiyle kesişiyor veya tekrarlanan köşe içeriyor'];
    }
    let area = 0; a.forEach((q, i) => { const n = a[(i + 1) % a.length]; area += (q[1] - a[0][1]) * (n[0] - a[0][0]) - (n[1] - a[0][1]) * (q[0] - a[0][0]); });
    return area === 0 ? ['Sıfır alanlı poligon'] : [];
  };
  G.inside = (q, ring) => { let v = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j]; if (on(a, b, q)) return true;
    if ((a[0] > q[0]) !== (b[0] > q[0]) && q[1] < (b[1] - a[1]) * (q[0] - a[0]) / (b[0] - a[0]) + a[1]) v = !v;
  } return v; };
  G.validate = (f) => {
    const a = G.points(f); if (!a.length || a.some((q) => !G.coordinate(q))) return ['Eksik veya geçersiz WGS84 geometri'];
    if (f.g === 'N') return [];
    if (f.g === 'L') return a.length < 2 || a.every((q) => eq(q, a[0])) ? ['Çizgi için iki farklı nokta gerekli'] : [];
    if (f.g !== 'A') return ['Desteklenmeyen geometri türü'];
    const e = G.ringIssues(a), holes = f.holes || [];
    if (e.length) return e;
    if (!Array.isArray(holes)) return ['İç halka listesi geçersiz'];
    for (const h of holes) { const he = G.ringIssues(h); if (he.length) return he; }
    holes.forEach((h) => { if (h.some((q) => !G.inside(q, a))) e.push('İç halka dış sınırın dışında'); });
    // Halka sınırlarının kesişmesi ve iç halkaların birbirine taşması geçersizdir.
    const rings = [a, ...holes].map(G.close);
    for (let i = 0; i < rings.length; i++) for (let j = i + 1; j < rings.length; j++) {
      const x = rings[i], y = rings[j];
      for (let k = 1; k < x.length; k++) for (let n = 1; n < y.length; n++) if (crosses(x[k - 1], x[k], y[n - 1], y[n])) { e.push('Poligon halkaları kesişiyor'); k = x.length; break; }
      if (i > 0 && (G.inside(x[0], y) || G.inside(y[0], x))) e.push('İç halkalar birbiriyle örtüşüyor');
    }
    return [...new Set(e)];
  };
  // Eski kayıtlarda yalnız dış halkalar bulunur; iç halkalar aynı parça sırasıyla saklanır.
  G.boundaries = (h) => ((h && h.sinir) || []).map((c, i) => ({ g: 'A', c, holes: (h.sinir_holes || [])[i] || [] }));
  G.boundaryIssues = (h) => G.boundaries(h).flatMap(G.validate);
  G.boundaryContains = (h, q, checked = false) => G.boundaries(h).some((f) => (checked || !G.validate(f).length) && G.inside(q, f.c) && !f.holes.some((r) => G.inside(q, r)));
  G.outsideBoundary = (h, f, checked = false) => {
    if (!(h && h.sinir && h.sinir.length) || (!checked && G.boundaryIssues(h).length) || G.validate(f).length) return null;
    const contains = (q) => G.boundaryContains(h, q, true), pts = G.points(f);
    if (pts.some((q) => !contains(q))) return true;
    if (f.g === 'N') return false;
    const edges = f.g === 'A' ? G.close(pts) : pts, boundaries = G.boundaries(h), rings = boundaries.flatMap((b) => [b.c, ...b.holes]).map(G.close);
    // Köşeler içerideyken bir kenar boşluğu veya içbükey dış sınırı kesebilir.
    for (let i = 1; i < edges.length; i++) {
      const a = edges[i - 1], b = edges[i], ts = [0, 1], dx = b[1] - a[1], dy = b[0] - a[0];
      for (const ring of rings) for (let j = 1; j < ring.length; j++) {
        const c = ring[j - 1], d = ring[j], ex = d[1] - c[1], ey = d[0] - c[0], den = dx * ey - dy * ex;
        if (!den) continue;
        const cx = c[1] - a[1], cy = c[0] - a[0], t = (cx * ey - cy * ex) / den, u = (cx * dy - cy * dx) / den;
        if (t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t);
      }
      ts.sort((x, y) => x - y);
      for (let j = 1; j < ts.length; j++) { if (ts[j] - ts[j - 1] < 1e-12) continue; const t = (ts[j] + ts[j - 1]) / 2; if (!contains([a[0] + dy * t, a[1] + dx * t])) return true; }
    }
    // Oturum alanı bir hariç alanı çevreleyebilir; yalnız kenar denetimi bunu bulamaz.
    if (f.g === 'A' && boundaries.some((b) => b.holes.some((r) => r.some((q) => G.inside(q, f.c) && !(f.holes || []).some((inner) => G.inside(q, inner)))))) return true;
    return false;
  };
  G.distance = (a, b) => { const x = rad(b[0] - a[0]), y = rad(b[1] - a[1]); const h = Math.sin(x / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(y / 2) ** 2; return 2 * R * Math.asin(Math.min(1, Math.sqrt(h))); };
  G.length = (a) => a.slice(1).reduce((s, q, i) => s + G.distance(a[i], q), 0);
  G.area = (r) => { const a = G.close(r); let s = 0; for (let i = 1; i < a.length; i++) s += rad(a[i][1] - a[i - 1][1]) * (2 + Math.sin(rad(a[i - 1][0])) + Math.sin(rad(a[i][0]))); return Math.abs(s * R * R / 2); };
  G.hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0'); };
  G.id = (p, f) => f.id || 'g-' + G.hash(JSON.stringify([p, f.s, f.ad, f.t, f.g, f.c, f.holes || []]));
  const canonicalRing = (r) => { const a = eq(r[0], r[r.length - 1]) ? r.slice(0, -1) : r.slice(); if (!a.length) return '';
    const enc = (x) => x.map((q) => q.join(',')).join(';'), min = (x) => { let k = 0; x.forEach((q, i) => { if (q[0] < x[k][0] || (q[0] === x[k][0] && q[1] < x[k][1])) k = i; }); return enc(x.slice(k).concat(x.slice(0, k))); };
    return [min(a), min(a.slice().reverse())].sort()[0]; };
  G.geometryKey = (f) => f.g + ':' + (f.g === 'A' ? canonicalRing(f.c || []) + '|' + (f.holes || []).map(canonicalRing).sort().join('|') : JSON.stringify(f.c));
  G.inventory = (parks, data) => { const result = [], geo = new Map(), exact = new Map();
    parks.forEach((p) => { const g = (data.parklar || {})[p.kisa] || { f: [], kaynak: [] }, boundaryOK = p.harita && p.harita.sinir && p.harita.sinir.length && !G.boundaryIssues(p.harita).length;
      (g.f || []).forEach((f, i) => { const source = (g.kaynak || []).find((s) => s.k === f.s) || {}, issues = G.validate(f);
        const key = p.kisa + ':' + G.geometryKey(f), identity = JSON.stringify([key, f.s, f.ad, f.t, f.d, f.b || []]);
        const row = { p, f, i, id: G.id(p.kisa, f), source, issues, duplicate: exact.has(identity), geometryPeer: geo.has(key), outside: false };
        if (!issues.length && boundaryOK) row.outside = G.outsideBoundary(p.harita, f, true);
        if (!row.duplicate) exact.set(identity, row.id); if (!geo.has(key)) geo.set(key, row.id); result.push(row);
      });
    }); return result; };
  G.matches = (r, filter) => {
    if (filter.park && r.p.kisa !== filter.park) return false;
    if (filter.type && r.f.t !== filter.type) return false;
    if (filter.status && r.f.d !== filter.status) return false;
    if (filter.source && r.f.s !== filter.source) return false;
    if (!filter.archive && r.f.d === 'K') return false;
    if (!filter.duplicates && r.duplicate) return false;
    if (filter.issues && !r.issues.length && !r.outside && !r.geometryPeer) return false;
    return !filter.q || G.normal([r.p.kisa, r.f.ad, r.f.t, r.f.k, r.source.ad, ...(r.f.b || []).flat()].join(' ')).includes(G.normal(filter.q));
  };
  G.report = (parks, data) => { const rows = G.inventory(parks, data); return { tarih: new Date().toISOString(), park_sayisi: parks.length, cizim_sayisi: rows.length,
    geometri_hatasi: rows.filter((r) => r.issues.length).length, birebir_tekrar: rows.filter((r) => r.duplicate).length, ayni_geometri: rows.filter((r) => r.geometryPeer).length,
    aciklama: 'Geometrik kontrol hukuki onay veya saha mevcudiyeti teyidi değildir. Sınır dışı çizimler arşiv, altyapı veya farklı sınır sürümüne ait olabilir.',
    parklar: parks.map((p) => ({ park: p.kisa, kayitli_alan_ha: p.alan, geometrik_alan_ha: p.harita && p.harita.alan_ha,
      sinir_kontrolu: G.boundaryIssues(p.harita), diger_sinirlar: (p.harita && p.harita.alt || []).map((a) => ({ ad: a.ad, sorunlar: G.boundaryIssues(a), kaynak: a.kaynak })), kaynak: p.harita && p.harita.kaynak, onay: p.harita && p.harita.onay || 'Onay belgesiyle eşleştirme gerekli', belge_incelemesi: p.harita && p.harita.belge_incelemesi || null })),
    cizimler: rows.map((r) => ({ id: r.id, park: r.p.kisa, kod: r.f.ad, tur: r.f.t, durum: r.f.d, kaynak: r.source.ad, kaynak_url: G.safeURL(r.source.url),
      sorunlar: r.issues, birebir_tekrar: r.duplicate, ayni_geometri: r.geometryPeer, sinir_disina_tasma: r.outside,
      onay: r.f.onay || r.source.onay || 'Teyit gerekli', saha: r.f.saha || 'Saha mevcudiyeti teyit edilmedi' })) }; };
  if (typeof module !== 'undefined' && module.exports) module.exports = G; else root.OPGeo = G;
})(typeof window !== 'undefined' ? window : globalThis);
