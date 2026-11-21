(function (root) {
  'use strict';
  const adTemizle = (value, trim = true) => {
    const temiz = String(value ?? '').replace(/\bs[üu]leyman\s+[öo]z(?:y)?[üu]rt\b/giu, '');
    return trim ? temiz.trim() : temiz;
  };
  const quant = (n) => Number(n).toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  const sourceUrl = (url) => /^https:\/\//i.test(url || '') ? url : '';

  function degerlendirme({ park: p, rapor, ozet: s, denetim, borc, fd }) {
    const park = adTemizle(p.ad || p.kisa);
    const tarih = (v) => v ? fd(v) : 'teyit gerekli';
    const mali = Number.isFinite(borc?.toplam) ?
      tarih(borc.hesap_tarihi) + ' tarihli hesapta ' + quant(borc.toplam) + ' TL belgeli borç kayıtlıdır.' :
      s?.vgec > 0 ? tarih(rapor) + ' itibarıyla vadesi geçmiş muhasebe anaparası ' + quant(s.vgec) + ' TL’dir.' : '';
    const durum = {
      Kirada: p.soz_bit ? 'Kayıtlı sözleşme ' + tarih(p.soz_bit) + ' tarihinde sona ermektedir.' : 'Park kiradadır. Sözleşme bitiş tarihi teyit gerektirir.',
      'İhale edilecek': 'Park ihale edilecek durumdadır.',
      'Sona erdi': 'Kayıtlı sözleşme sona ermiştir.',
      Davalık: 'Parkın işlem durumu dava dosyası üzerinden izlenmektedir.',
      Feshedildi: 'Parkın kayıtlı sözleşmesi feshedilmiştir.'
    };
    const sonuc = [
      park + (p.alan != null ? ' ' + quant(p.alan) + ' ha kayıtlı alana sahiptir.' : ' için kayıtlı alan teyit gerektirir.'),
      durum[p.durum], p.gyp_onay ? 'Son belgeli plan onayı ' + tarih(p.gyp_onay) + ' tarihlidir.' : '',
      mali
    ].filter(Boolean).join(' ');
    const izlem = [
      adTemizle(p.yapilacak),
      !p.gyp_onay ? 'Güncel onaylı planın tarihi ve kapsamı ilgili şeflik dosyasından teyit edilmelidir.' : '',
      !denetim ? 'Son denetim tutanağı ilgili şeflikten teyit edilmelidir.' : '',
      !p.harita?.sinir?.length ? 'Onaylı saha sınırının koordinat listesi temin edilmelidir.' : '',
      (borc || s?.vgec > 0) && !p.yapilacak ? 'Açık kalemler için tahsilat ve tebligat durumu saymanlık kayıtlarından izlenmelidir.' : ''
    ].filter(Boolean).join(' ');
    return [sonuc, izlem || 'Son onaylı plan, sözleşme ve denetim tutanağı birlikte esas alınarak izleme sürdürülmelidir.'].join('\n\n');
  }

  function haritaModel() {
    return { values: {
      mescere_map_header:'MEŞCERE HARİTASI', kadastro_map_header:'ORMAN KADASTRO HARİTASI',
      uydu_map_header:'UYDU GÖRÜNTÜSÜ', topo_map_header:'MEMLEKET HARİTASI',
      mescere_map_note:'Sayısal meşcere kesişimi teyit gerekli.', kadastro_map_note:'Orman kadastro paftası teyit gerekli.',
      uydu_map_note:'Uydu altlığına veya sayısal sınıra erişilemedi.', topo_map_note:'Memleket paftası teyit gerekli.'
    }, images:{}, links:{} };
  }

  const W = 975, H = 540;
  const mercator = ([lat, lon]) => {
    const rad = Math.PI / 180, l = Math.max(-85, Math.min(85, lat)) * rad;
    return [6378137 * lon * rad, 6378137 * Math.log(Math.tan(Math.PI / 4 + l / 2))];
  };
  function extent(boundary) {
    const bounds = [Infinity, Infinity, -Infinity, -Infinity];
    for (const ring of boundary) for (const point of ring.c) {
      const [x,y] = mercator(point);
      bounds[0] = Math.min(bounds[0],x); bounds[1] = Math.min(bounds[1],y);
      bounds[2] = Math.max(bounds[2],x); bounds[3] = Math.max(bounds[3],y);
    }
    if (!bounds.every(Number.isFinite)) return null;
    const [west,south,east,north] = bounds, x = (west + east) / 2, y = (south + north) / 2;
    const halfH = Math.max(north - south, (east - west) * H / W, 300) * .68;
    return [x - halfH * W / H, y - halfH, x + halfH * W / H, y + halfH];
  }
  function sheet(window, bbox, park) {
    const canvas = window.document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d'), [west,south,east,north] = bbox;
    if (!ctx) throw Error('Harita yüzeyi oluşturulamadı.');
    const xy = (point) => { const [x,y] = mercator(point); return [(x - west) * W / (east - west), (north - y) * H / (north - south)]; };
    ctx.fillStyle = '#F1F4EB'; ctx.fillRect(0,0,W,H);
    const path = (points) => points.forEach((point, i) => { const [x,y] = xy(point); if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    const ring = (points) => { path(points); ctx.closePath(); };
    function polygon(rings, stroke, fill, width) {
      ctx.beginPath(); rings.forEach(ring);
      if (fill) { ctx.fillStyle = fill; ctx.fill('evenodd'); }
      ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke();
    }
    function label(value, x, y, anchor = 'left') {
      ctx.font = '600 18px sans-serif'; ctx.textAlign = anchor; ctx.lineWidth = 4; ctx.strokeStyle = '#FFF';
      ctx.strokeText(value,x,y); ctx.fillStyle = '#162E27'; ctx.fillText(value,x,y);
    }
    function facilities(features) {
      for (const f of features) {
        const c = f.d === 'P' || f.d === 'O' ? '#A66011' : '#24546B';
        if (f.g === 'A') polygon([f.c, ...(f.holes || [])], c, c + '45', 2);
        else if (f.g === 'L') {
          ctx.beginPath(); path(f.c); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.stroke();
        } else if (f.g === 'N') {
          const [x,y] = xy(f.c);
          ctx.beginPath(); ctx.arc(x,y,3.5,0,2*Math.PI); ctx.fillStyle = c; ctx.fill();
        }
      }
    }
    function finish(boundary, attribution) {
      for (const b of boundary) {
        polygon([b.c, ...b.holes], '#FFF', '', 7);
        polygon([b.c, ...b.holes], '#A22723', 'rgba(220,70,56,.10)', 4);
      }
      label(adTemizle(park), 12, 24);
      label('K ↑', W - 12, 24, 'right');
      const groundPerPixel = (east - west) * Math.cos(boundary[0].c[0][0] * Math.PI / 180) / W;
      const target = 130 * groundPerPixel, order = 10 ** Math.floor(Math.log10(target));
      const meters = ([5, 2, 1].find(n => n * order <= target) || 1) * order;
      const x = W - 14 - meters / groundPerPixel;
      ctx.beginPath(); ctx.moveTo(x,H-35); ctx.lineTo(W-14,H-35);
      ctx.strokeStyle = '#FFF'; ctx.lineWidth = 6; ctx.stroke();
      ctx.strokeStyle = '#162E27'; ctx.lineWidth = 3; ctx.stroke();
      label(quant(meters) + ' m', W - 14, H - 12, 'right');
      label(attribution, 12, H - 12);
      return canvas.toDataURL('image/png').split(',')[1];
    }
    return { ctx, xy, polygon, label, facilities, finish };
  }
  function raster(window, service, bbox) {
    const query = new URLSearchParams({ bbox:bbox.join(','), bboxSR:'3857', imageSR:'3857', size:W + ',' + H, format:'png', f:'image' });
    return new Promise((resolve,reject) => {
      const img = new window.Image();
      const timer = window.setTimeout(() => reject(Error('Altlık zamanında yüklenemedi.')), 6500);
      img.crossOrigin = 'anonymous';
      img.onload = () => { window.clearTimeout(timer); resolve(img); };
      img.onerror = () => { window.clearTimeout(timer); reject(Error('Altlık açılamadı.')); };
      img.src = 'https://server.arcgisonline.com/ArcGIS/rest/services/' + service + '/MapServer/export?' + query;
    });
  }
  async function haritalar(window, model, { park, boundary, stand, facilities = [], maps = park.bilgi_notu_haritalar || {} }) {
    for (const [slot, image] of Object.entries(maps)) {
      if (!Object.hasOwn(model.values, slot + '_header') || !/^iVBORw0KGgo[A-Za-z0-9+/=]+$/.test(image.png || '')) continue;
      model.images[slot] = image.png;
      model.values[slot + '_note'] = adTemizle(image.aciklama || 'Kaynak pafta');
      model.links[slot] = sourceUrl(image.url);
    }
    const bbox = extent(boundary);
    if (!bbox) return;
    if (!model.images.kadastro_map) {
      const s = sheet(window, bbox, park.kisa);
      s.facilities(facilities);
      model.images.kadastro_map = s.finish(boundary, 'Parkın sayısal planı · kırmızı: sınır');
      model.values.kadastro_map_header = facilities.length ? 'PARK SINIRI VE TESİSLER' : 'PARK SINIRI';
      model.values.kadastro_map_note = facilities.length ? 'Mavi: kayıtlı çizim · turuncu: planlanan. Resmî kadastro paftası teyit gerekli.' : 'Tesis çizimi ve kadastro paftası teyit gerekli.';
    }
    if (!model.images.mescere_map && stand?.features?.length) {
      const s = sheet(window, bbox, park.kisa);
      const renkler = ['#CADCAD','#C5DFF6','#D5E7C4','#E9D5AF','#D5D5EC','#EEE3BD','#BDDDCF','#DFCBDF'];
      const etiketler = new Map();
      for (const feature of stand.features) {
        const polys = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
        const p = feature.properties, tip = p.tip === 'None' ? '' : p.tip || '', lab = [p.bolme, p.bolmecik !== 'None' ? p.bolmecik : '', tip].filter(Boolean).join(' · ');
        const color = [...tip].reduce((sum,c) => sum + c.charCodeAt(0), 0) % renkler.length;
        for (const poly of polys) {
          const rings = poly.map((ring) => ring.map(([lon,lat]) => [lat,lon]));
          s.polygon(rings, '#587D52', renkler[color], 1.3);
          const xy = rings[0].map(s.xy).filter(([x,y]) => x > 75 && x < W-75 && y > 55 && y < H-45);
          if (!xy.length || !lab) continue;
          const [mx,my] = xy.reduce(([x,y],[a,b]) => [x+a,y+b], [0,0]).map((n) => n / xy.length);
          const space = Math.floor(mx / 130) + ':' + Math.floor(my / 42);
          if (!etiketler.has(space)) etiketler.set(space,[lab,mx,my]);
        }
      }
      for (const [label,x,y] of etiketler.values()) s.label(label,x,y,'center');
      model.images.mescere_map = s.finish(boundary, 'OGM · ' + stand.donem + ' amenajman verisi');
      model.values.mescere_map_note = 'Kırmızı çizgi park sınırını gösterir.';
    }
    const layers = [
      ['uydu_map','World_Imagery','Esri World Imagery ve katkıcıları'],
      ['topo_map','World_Topo_Map','Esri World Topo Map ve katkıcıları']
    ];
    await Promise.all(layers.map(async ([slot, service, credit]) => {
      if (model.images[slot]) return;
      try {
        const image = await raster(window, service, bbox), s = sheet(window, bbox, park.kisa);
        s.ctx.drawImage(image,0,0,W,H);
        model.images[slot] = s.finish(boundary, credit);
        if (slot === 'topo_map') model.values.topo_map_header = 'TOPOĞRAFİK GÖRÜNÜM';
        model.values[slot + '_note'] = slot === 'topo_map' ? 'Memleket paftası için belge teyidi gerekli.' : 'Kırmızı çizgi park sınırını gösterir.';
      } catch (error) { /* Canlı altlık yeniden açılabilir. */ }
    }));
  }

  async function jpeg(window, model, slot) {
    const c = window.document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d'), data = model.images[slot];
    if (!ctx) throw Error('Harita resmi hazırlanamadı.');
    ctx.fillStyle = '#FFF'; ctx.fillRect(0,0,W,H);
    if (data) {
      const image = new window.Image();
      await new Promise((resolve,reject) => {
        image.onload = resolve; image.onerror = reject; image.src = 'data:image/png;base64,' + data;
      });
      ctx.drawImage(image,0,0,W,H);
    }
    const msg = model.values[slot + '_note'];
    if (!data || model.links[slot] || (slot === 'kadastro_map' && model.values.kadastro_map_header !== 'ORMAN KADASTRO HARİTASI')) {
      ctx.fillStyle = data ? 'rgba(255,255,255,.91)' : '#F0F4F1';
      const fallback = data && !model.links[slot] && slot === 'kadastro_map';
      const top = fallback ? 42 : data ? H-32 : H/2-24;
      ctx.fillRect(0,top,W,data ? 32 : 48);
      ctx.textAlign = 'center'; ctx.font = '600 16px sans-serif'; ctx.fillStyle = '#253D34';
      ctx.fillText(msg,W/2,top + (data ? 22 : 30),W-32);
    }
    return new Promise((resolve,reject) => c.toBlob((blob) => blob ? resolve(blob) : reject(Error('Harita resmi kaydedilemedi.')), 'image/jpeg', .94));
  }

  const api = { degerlendirme, haritaModel, haritalar, jpeg, extent, adTemizle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.OPBilgiNotu = api;
})(typeof window !== 'undefined' ? window : globalThis);
