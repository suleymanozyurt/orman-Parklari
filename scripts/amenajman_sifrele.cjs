const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const K = require('../js/kasa.js');
const JSZip = require('../vendor/jszip.min.js');

async function main() {
  const [input, output] = process.argv.slice(2);
  const password = fs.readFileSync(0, 'utf8').trim();
  if (!input || !output || !password) throw Error('Girdi dizini, çıktı dizini ve standart girdiden erişim parolası gerekli.');
  await K.coz(fs.readFileSync(path.join(output, 'veri.enc'), 'utf8'), password);
  const read = (name) => fs.readFileSync(path.join(input, name + '.json'), 'utf8');
  const write = (name, encrypted) => fs.writeFileSync(path.join(output, 'amenajman-' + name + '.enc'), encrypted);
  const index = JSON.parse(read('ozet'));
  index.katmanAnahtari = randomBytes(32).toString('base64url');
  const layers = await Promise.all(Object.values(index.seflikler).map(async ({ dosya }) => {
    const source = read(dosya), zip = new JSZip();
    zip.file('harita.json', source);
    const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 9 } });
    const encrypted = await K.sifreleBin(bytes, index.katmanAnahtari);
    const checked = await JSZip.loadAsync(await K.cozBin(encrypted, index.katmanAnahtari));
    assert.equal(await checked.file('harita.json').async('string'), source);
    return [dosya, encrypted];
  }));
  const encrypted = await K.sifrele(index, password);
  assert.deepEqual(await K.coz(encrypted, password), index);
  layers.forEach(([name, content]) => write(name, content));
  write('ozet', encrypted);
  console.log(`${layers.length} katman ve park kesişim özeti şifrelendi; geri okuma doğrulandı.`);
}

main().catch(error => {
  const location = error.stack.split('\n').find(line => line.includes(__filename));
  console.error('Amenajman şifreleme hatası:', error.name, location?.trim() || '');
  process.exitCode = 1;
});
