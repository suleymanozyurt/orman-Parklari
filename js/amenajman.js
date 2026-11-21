(function (root) {
  'use strict';

  function ayniSinir(ozet, harita) {
    return !!harita?.sinir?.length && JSON.stringify(ozet.sinir) === JSON.stringify(harita.sinir)
      && JSON.stringify(ozet.sinir_holes) === JSON.stringify(harita.sinir_holes || []);
  }

  function kesismeler(index, park) {
    const row = park && index?.parklar?.[park.kisa];
    return row?.alan_m2 && ayniSinir(row, park.harita) ? row : null;
  }

  function katmanSec(dataset, type, row) {
    const group = dataset.features.filter(f => f.properties.katman === type);
    if (!row) return group;
    const office = dataset.kaynak.seflik;
    const bolmecik = type === 'bolmecik';
    const key = (bolme, index, tip) => JSON.stringify(bolmecik ? [String(bolme), String(index), String(tip)] : [String(bolme)]);
    const names = new Set((bolmecik ? row.bolmecikler : row.bolmeler).filter(([name]) => name === office)
      .map(([, bolme, part, tip]) => key(bolme, part, tip)));
    return group.filter(({ properties }) => names.has(key(properties.bolme, properties.bolmecik, properties.tip)));
  }

  const pct = (area, total) => (100 * area / total).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + '%';
  const hektar = (area) => (area / 10000).toLocaleString('tr-TR', { maximumFractionDigits: 3 }) + ' ha';
  const metin = (value) => value && value !== 'None' ? value : '—';

  function sources(index, offices, esc) {
    return offices.map((office) => {
      const source = index.seflikler[office];
      const plan = OPGeo.safeURL(source.plan), kmz = OPGeo.safeURL(source.kmz);
      return '<div class="hbel"><b>' + esc(office) + '</b><small>' + source.sayilar.bolme + ' bölme · ' + source.sayilar.bolmecik + ' bölmecik</small>' +
        (plan ? '<a target="_blank" rel="noopener" href="' + esc(plan) + '">Amenajman planı PDF</a>' : '') +
        (kmz ? ' <a target="_blank" rel="noopener" href="' + esc(kmz) + '">Kaynak meşcere KMZ</a>' : '') + '</div>';
    }).join('');
  }

  function panel(index, park, esc) {
    const imported = index.aktarim ? ' · Aktarım ' + index.aktarim.split('-').reverse().join('.') : '';
    const intro = '<p class="hnote">' + esc(index.donem + ' sayısal meşcere haritası' + imported) + '. Kaynak belgeler Drive’da açılır.</p>';
    if (!park) return intro + sources(index, Object.keys(index.seflikler), esc);
    const row = Object.hasOwn(index.parklar, park.kisa) ? index.parklar[park.kisa] : null;
    const offices = new Set(row?.bolmeler.map(([office]) => office) || []);
    if (Object.hasOwn(index.seflikler, park.seflik)) offices.add(park.seflik);
    const links = sources(index, [...offices], esc);
    if (!row || !row.alan_m2) return intro + '<p class="hnote">Bu park için sayısal sınır eşleştirmesi yok.</p>' + links;
    if (!ayniSinir(row, park.harita)) return intro + '<p class="hnote">Park sınırı değişti. Bölme ve meşcere yüzdeleri için yeniden kesişim hesabı gerekiyor.</p>' + links;
    const sectionRows = row.bolmeler.map(([office, number, area]) => '<tr><td>' + esc(office) + '</td><td>' + esc(number) + '</td><td class="r n">' + hektar(area) + '</td><td class="r n">' + pct(area, row.alan_m2) + '</td></tr>').join('');
    const standRows = row.bolmecikler.map(([office, number, part, type, area]) => '<tr><td>' + esc(office) + '</td><td>' + esc(number + ' / ' + metin(part)) + '</td><td>' + esc(metin(type)) + '</td><td class="r n">' + hektar(area) + '</td></tr>').join('');
    const overlap = Math.max(row.cakisma_m2, row.bolmecik_cakisma_m2);
    return intro + (park.bolme ? '<p class="hnote">Park dosyasındaki bölme kaydı <b>' + esc(park.bolme) + '</b></p>' : '') +
      '<p class="hnote">Sayısal bölme kesişimi park alanının %' + (100 * row.kapsam_m2 / row.alan_m2).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + '’ini kapsıyor. 1 m² ve altındaki parçalar hesaba alınmadı.</p>' +
      (overlap >= 1 ? '<p class="hnote">Kaynak poligonlar arasında ' + hektar(overlap) + ' örtüşme var. Bu alan satır toplamına birden çok kez girebilir.</p>' : '') +
      '<div class="sl"><table class="htes"><thead><tr><th>Şeflik</th><th>Bölme</th><th class="r">Park içindeki alan</th><th class="r">Pay</th></tr></thead><tbody>' + sectionRows + '</tbody></table></div>' +
      '<details><summary>Meşcere ve bölmecik kesişimleri (' + row.bolmecikler.length + ')</summary><div class="sl"><table class="htes"><thead><tr><th>Şeflik</th><th>Bölme / bölmecik</th><th>Meşcere</th><th class="r">Park içindeki alan</th></tr></thead><tbody>' + standRows + '</tbody></table></div></details>' + links;
  }

  function popup(feature, source, esc) {
    const p = feature.properties;
    return '<div class="hpop"><div class="hpt">' + esc(source.seflik) + ' · Bölme ' + esc(p.bolme) + '</div>' +
      (p.katman === 'bolmecik' ? '<p>Bölmecik ' + esc(metin(p.bolmecik)) + ' · Meşcere ' + esc(metin(p.tip)) + '<br>İşletme sınıfı ' + esc(metin(p.sinif)) + '</p>' : '') +
      '<small>2024–2043 meşcere haritası · Kaynak nesne ' + esc(p.nesne) + '</small></div>';
  }

  const api = { ayniSinir, kesismeler, katmanSec, panel, popup };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.OPAmenajman = api;
})(typeof window !== 'undefined' ? window : globalThis);
