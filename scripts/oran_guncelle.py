#!/usr/bin/env python3
"""Resmî oranları günceller -> data/oranlar.json
1) Gecikme zammı (6183 s.K. m.51): Resmî Gazete günlük fihristinde ilgili Cumhurbaşkanı Kararı aranır; bulunursa yeni aylık oran,
   kararın yayım tarihinden itibaren tabloya eklenir.
2) TÜFE (on iki aylık ortalamalara göre değişim): TÜİK SDMX veri servisi (TUIK_API_KEY gizli anahtarı ile).
   Yeni ay ancak bulunan seri tablodaki bilinen aylarla birebir tutuyorsa kabul edilir (yanlış seri alınmasın diye).
Kullanım: python oran_guncelle.py [--gun YYYY-AA-GG] [--geri N]
"""
import json, os, re, sys, datetime as dt, urllib.request, urllib.parse, ssl, html, io

YOL = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'oranlar.json')
UA = {'User-Agent': 'Mozilla/5.0 (orman-parklari oran guncelleme; +https://github.com/suleymanozyurt/orman-parklari)'}
LOG = []
def log(*a):
    s = ' '.join(str(x) for x in a); LOG.append(s); print(s, flush=True)

def get(url, headers=None, data=None, timeout=40):
    h = dict(UA); h.update(headers or {})
    req = urllib.request.Request(url, headers=h, data=data)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read(), r.headers.get('Content-Type', '')

def metin(b):
    for enc in ('utf-8', 'windows-1254', 'iso-8859-9'):
        try: return b.decode(enc)
        except UnicodeDecodeError: pass
    return b.decode('utf-8', 'ignore')

# ------------------------------------------------------------ gecikme zammı
GZ_RE = re.compile(r'gecikme\s+zamm', re.I)
def gz_tara(gun, geri):
    bulunan = []
    for i in range(geri):
        d = gun - dt.timedelta(days=i)
        url = 'https://www.resmigazete.gov.tr/eskiler/%04d/%02d/%04d%02d%02d.htm' % (d.year, d.month, d.year, d.month, d.day)
        try:
            b, _ = get(url)
        except Exception as e:
            log('RG', d, 'alınamadı:', e); continue
        s = metin(b)
        for m in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', s, re.S | re.I):
            t = html.unescape(re.sub(r'<[^>]+>', ' ', m.group(2)))
            t = re.sub(r'\s+', ' ', t).strip()
            if GZ_RE.search(t) and ('6183' in t or 'Amme Alacaklar' in t or 'Tahsil Usul' in t):
                link = urllib.parse.urljoin(url, m.group(1))
                log('RG', d, 'karar bulundu:', t, link)
                oran = oran_metinden(t, 'başlık') or karar_oran(link)
                if oran: bulunan.append((d.isoformat(), oran, t[:160], link))
    return bulunan

def oran_metinden(s, ne):
    s = re.sub(r'\s+', ' ', s)
    gz = [m.start() for m in re.finditer(r'gecikme\s*zamm', s, re.I)]
    for m in re.finditer(r'(?:y[üuÜU]zde|%)\s*([0-9]+(?:[,.][0-9]+)?)', s, re.I):
        if any(0 <= m.start() - g <= 700 or 0 <= g - m.start() <= 200 for g in gz):
            v = float(m.group(1).replace(',', '.'))
            if 0.1 <= v <= 20:
                log('oran (%s): aylık %%%s' % (ne, v)); return round(v / 100, 6)
    return None

def pdf_metin(b):
    import subprocess, tempfile
    try:
        with tempfile.NamedTemporaryFile(suffix='.pdf') as f:
            f.write(b); f.flush()
            return subprocess.run(['pdftotext', '-layout', f.name, '-'], capture_output=True, timeout=60).stdout.decode('utf-8', 'ignore')
    except Exception as e:
        log('pdftotext yok/hata', e)
    try:
        from pypdf import PdfReader
        return ' '.join(p.extract_text() or '' for p in PdfReader(io.BytesIO(b)).pages)
    except Exception as e:
        log('pdf okunamadı', e); return ''

def karar_oran(link):
    try:
        b, ct = get(link)
    except Exception as e:
        log('karar alınamadı', e); return None
    s = pdf_metin(b) if ('pdf' in ct.lower() or link.lower().endswith('.pdf')) else html.unescape(re.sub(r'<[^>]+>', ' ', metin(b)))
    log('karar metni (ilk 300):', re.sub(r'\s+', ' ', s)[:300])
    v = oran_metinden(s, 'karar metni')
    if v: return v
    log('karar metninde oran bulunamadı'); return None

# ------------------------------------------------------------ TÜFE (TÜİK SDMX)
TUIK = 'https://nsiws.tuik.gov.tr/rest'
def tuik_token(key):
    body = urllib.parse.urlencode({'grant_type': 'password', 'client_id': 'nsi-ws-consumer', 'api_key': key}).encode()
    b, _ = get('https://giris.tuik.gov.tr/realms/web/protocol/openid-connect/token', {'Content-Type': 'application/x-www-form-urlencoded'}, body)
    return json.loads(b)['access_token']

def tuik_json(path, tok, accept='application/vnd.sdmx.structure+json;version=1.0'):
    b, _ = get(TUIK + path, {'Authorization': 'Bearer ' + tok, 'Accept': accept}, timeout=90)
    return b

def tufe_tuik(tablo):
    key = os.environ.get('TUIK_API_KEY', '').strip()
    if not key:
        return None, 'TÜİK API anahtarı tanımlı değil (GitHub › Settings › Secrets › TUIK_API_KEY)'
    try:
        tok = tuik_token(key)
    except Exception as e:
        return None, 'TÜİK giriş hatası: %s' % e
    try:
        d = json.loads(tuik_json('/dataflow/TR/all/latest', tok))
        flows = d.get('data', {}).get('dataflows', [])
        def ad(f): n = f.get('names') or {}; return (n.get('tr') or f.get('name') or '')
        aday = [f for f in flows if re.search(r't[üu]ketici fiyat', ad(f), re.I)]
        log('TÜFE aday veri akışları:', [(f['id'], ad(f)[:80]) for f in aday][:15])
    except Exception as e:
        return None, 'TÜİK veri akışı listesi alınamadı: %s' % e
    bilinen = {(int(y), i + 1): v for y, a in tablo.items() for i, v in enumerate(a) if v is not None}
    for f in aday:
        fid, ag, ver = f['id'], f.get('agencyID', 'TR'), f.get('version', 'latest')
        try:
            csvb = tuik_json('/data/%s,%s,%s/all?startPeriod=%d-01&dimensionAtObservation=AllDimensions' % (ag, fid, ver, dt.date.today().year - 3), tok,
                             'application/vnd.sdmx.data+csv;version=2.0.0')
        except Exception as e:
            log('veri alınamadı', fid, e); continue
        import csv
        rows = list(csv.DictReader(io.StringIO(metin(csvb))))
        if not rows: continue
        cols = rows[0].keys()
        tcol = next((c for c in cols if c.upper() in ('TIME_PERIOD', 'TIME')), None)
        vcol = next((c for c in cols if c.upper() in ('OBS_VALUE', 'VALUE')), None)
        if not tcol or not vcol: continue
        boyut = [c for c in cols if c not in (tcol, vcol) and c.upper() not in ('DATAFLOW', 'STRUCTURE', 'STRUCTURE_ID', 'ACTION', 'OBS_STATUS', 'UNIT_MULT', 'DECIMALS')]
        seriler = {}
        for r in rows:
            m = re.match(r'(\d{4})-?M?(\d{2})', r[tcol] or '')
            if not m or r[vcol] in ('', None): continue
            k = tuple(r[c] for c in boyut)
            try: seriler.setdefault(k, {})[(int(m.group(1)), int(m.group(2)))] = float(r[vcol])
            except ValueError: pass
        # bilinen aylarla birebir tutan seri (yüzde olarak)
        for k, s in seriler.items():
            ortak = [ym for ym in s if ym in bilinen]
            if len(ortak) < 6: continue
            if all(abs(s[ym] / 100 - bilinen[ym]) < 0.00006 for ym in ortak):
                log('TÜFE serisi bulundu:', fid, dict(zip(boyut, k)), 'ortak ay', len(ortak))
                return {ym: round(v / 100, 6) for ym, v in s.items()}, 'TÜİK veri servisi (%s) — %d bilinen ayla doğrulandı' % (fid, len(ortak))
    return None, 'TÜİK servisinde bilinen aylarla tutan seri bulunamadı'

# ------------------------------------------------------------ ana
def main():
    args = sys.argv[1:]
    gun = dt.date.today()
    if '--gun' in args: gun = dt.date.fromisoformat(args[args.index('--gun') + 1])
    geri = int(args[args.index('--geri') + 1]) if '--geri' in args else 7
    O = json.load(open(YOL, encoding='utf-8'))
    eski = json.dumps(O, sort_keys=True, ensure_ascii=False)
    simdi = dt.datetime.utcnow() + dt.timedelta(hours=3)
    # GZ
    try:
        bul = gz_tara(gun, geri)
        oranlar = O['gz']['oranlar']
        for (tarih, oran, baslik, link) in bul:
            son = oranlar[-1]
            if tarih > son[0] and abs(oran - son[1]) > 1e-9:
                oranlar.append([tarih, oran, 'RG ' + tarih + ' — ' + baslik])
                O['gz']['durum'] = 'Yeni oran Resmî Gazete’den alındı: %s tarihinden aylık %%%s' % (tarih, str(round(oran * 100, 4)).replace('.', ','))
                log('YENİ GZ ORANI', tarih, oran)
        O['gz']['son_kontrol'] = simdi.strftime('%Y-%m-%d %H:%M')
    except Exception as e:
        log('GZ taraması hata:', e)
    # TÜFE
    tab = O['tufe']['degerler']
    seri, durum = tufe_tuik(tab)
    log('TÜFE:', durum)
    if seri:
        eklenen = 0
        for (y, m), v in sorted(seri.items()):
            a = tab.setdefault(str(y), [None] * 12)
            if a[m - 1] is None and 0 < v < 3:
                a[m - 1] = v; eklenen += 1; log('YENİ TÜFE', y, m, v)
        sonay = max((int(y), i + 1) for y, a in tab.items() for i, v in enumerate(a) if v is not None)
        O['tufe']['son_ay'] = '%04d-%02d' % sonay
        O['tufe']['durum'] = 'otomatik: ' + durum
    else:
        O['tufe']['durum'] = 'otomatik güncelleme yapılamadı: ' + durum
    O['tufe']['son_kontrol'] = simdi.strftime('%Y-%m-%d %H:%M')
    O['guncelleme'] = simdi.strftime('%Y-%m-%dT%H:%M:%S+03:00')
    O['son_calisma_kaydi'] = LOG[-25:]
    json.dump(O, open(YOL, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('değişti' if json.dumps(O, sort_keys=True, ensure_ascii=False) != eski else 'değişmedi')

if __name__ == '__main__':
    main()
