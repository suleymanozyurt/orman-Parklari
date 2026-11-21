(function (root) {
  'use strict';
  const normal = value => String(value || '').toLocaleLowerCase('tr-TR').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i')
    .replace(/[^a-z0-9]+/g, ' ').trim();
  const aliases = {
    ilce:['ilçe adı'], mahalle:['mahalle','köy','köyü','mahallesi'], mevki:['mevki'],
    bolme:['bölme numarası'], alan:['alan ha','park alanı ha','yüzölçümü ha'],
    isletmeci:['işletmeci unvanı','kiracı','kiracı unvanı'], vkn:['vergi kimlik no','vkn'],
    tel:['telefon numarası','iletişim telefonu'], eposta:['e posta adresi','e-mail'],
    soz_bas:['sözleşme başlangıç tarihi','sözleşme başlangıcı'], soz_bit:['sözleşme bitiş tarihi','sözleşme bitişi'],
    teslim:['saha teslim tarihi'], ihale_b:['ilk ihale bedeli'], kesin:['kesin teminat tutarı'],
    gyp_onay:['plan onay tarihi','gyp onay tarihi']
  };
  function canonical(value, type) {
    value = value.trim();
    if (type === 'date') {
      const m = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
      if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
    }
    if (type === 'number' || type === 'pct') {
      value = value.replace(/\s*(?:TL|₺|ha|hektar)\s*$/i, '').replace(/^%\s*|\s*%$/g, '');
      if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(value)) value = value.replace(/\./g, '');
      return value.replace(',', '.');
    }
    return value;
  }
  function collect({ docs, fields, parks, selected }) {
    const labels = new Map(fields.flatMap(([key, title, type]) =>
      [key, title, ...(aliases[key] || [])].map(label => [normal(label), {key,type}])));
    const parkNames = new Map(parks.flatMap(p => [p.kisa, p.ad].filter(Boolean).map(name => [normal(name), p.kisa])));
    const changes = new Map(), issues = [];
    let park = selected;
    for (const doc of docs) {
      const lines = doc.text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      const docParks = new Set();
      for (const line of lines) {
        const parts = line.match(/^([^:\t;=]{1,100})(?::|\t+|;|=)\s*(.+)$/);
        const label = normal(parts?.[1]), value = normal(parts?.[2] || line);
        if (!parts || ['park','orman parki','park adi','orman parki adi'].includes(label)) {
          const name = parkNames.get(value) || parkNames.get(value.replace(/ (?:konaklamali |konaklamasiz )?orman parki$/, ''));
          if (name) docParks.add(name);
        }
      }
      if (docParks.size > 1 || (park && docParks.size && !docParks.has(park))) {
        issues.push(doc.name + ' (park eşleşmedi)');
        continue;
      }
      if (!park && docParks.size) park = [...docParks][0];
      if (!park || (!selected && !docParks.size)) { issues.push(doc.name + ' (park adı doğrulanamadı)'); continue; }
      if (/\b(?:taslak|iptal edilmiştir)\b/i.test(lines.slice(0,5).join(' '))) { issues.push(doc.name + ' (taslak veya iptal bilgisi)'); continue; }
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i], m = line.match(/^([^:\t;=]{1,100})(?:[=:]|\t+|;)\s*(.+)$/);
        const field = labels.get(normal(m?.[1] || line));
        if (!field) continue;
        const raw = m?.[2] || lines[i+1];
        if (!raw || raw.length > 500 || (!m && (raw.includes(':') || labels.has(normal(raw))))) continue;
        const yeni = canonical(raw, field.type);
        const list = changes.get(field.key) || new Map();
        if (!list.has(yeni)) list.set(yeni, {alan:field.key, yeni, belge:doc.name, url:doc.url || '', alinti:m ? line : line + ' ' + raw, guven:'belgeli alan'});
        changes.set(field.key, list);
      }
    }
    const degisiklikler = [];
    for (const [key, list] of changes) {
      if (list.size === 1) degisiklikler.push(list.values().next().value);
      else issues.push(fields.find(f => f[0] === key)[1] + ' (değerler çelişiyor)');
    }
    return { park, degisiklikler, issues };
  }
  const api = { collect };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.OPBelge = api;
})(typeof window !== 'undefined' ? window : globalThis);
