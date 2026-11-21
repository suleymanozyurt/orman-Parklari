"""Dört şefliğin Drive KMZ'lerinden amenajman katmanı ve park kesişimlerini oluşturur.

GDAL Python bağları gerekir. Girdi dizinindeki şeflik adları ve Drive bağlantıları
sources.json dosyasında, park sınırları ise çözülmüş veri JSON'unda bulunur.
Çıktılar şifreleme öncesi çalışma dizininde tutulur.
"""
import argparse
import hashlib
import json
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile
from zoneinfo import ZoneInfo

from osgeo import gdal, ogr, osr

KML = {'k': 'http://www.opengis.net/kml/2.2'}
LAYERS = {'BOLME': 'bolme', 'BOLMECIK': 'bolmecik'}
START = 2024


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf8')


def projection(epsg):
    crs = osr.SpatialReference()
    crs.ImportFromEPSG(epsg)
    crs.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)
    return crs


def polygon(rings):
    geometry = ogr.Geometry(ogr.wkbPolygon)
    for points in rings:
        ring = ogr.Geometry(ogr.wkbLinearRing)
        for lng, lat in points:
            ring.AddPoint_2D(lng, lat)
        ring.CloseRings()
        geometry.AddGeometry(ring)
    return geometry


def polygon_parts(geometry):
    if geometry.GetGeometryName() == 'POLYGON':
        return [] if geometry.IsEmpty() else [geometry.Clone()]
    if geometry.GetGeometryName() not in ('MULTIPOLYGON', 'GEOMETRYCOLLECTION'):
        return []
    return [part for child in geometry for part in polygon_parts(child)]


def source_polygon(shape):
    rings = []
    for ring in shape.findall('.//k:LinearRing/k:coordinates', KML):
        points = [tuple(map(float, p.split(',')[:2])) for p in ring.text.split()]
        if len(points) < 4 or points[0] != points[-1]:
            raise ValueError('KML poligon halkası kapalı değil.')
        if any(not 28 < lng < 30 or not 40 < lat < 42 for lng, lat in points):
            raise ValueError('KML koordinatı İstanbul çalışma aralığının dışında.')
        rings.append(points)
    return polygon(rings)


def read_office(path, office, source, transform):
    with ZipFile(path) as archive:
        names = [name for name in archive.namelist() if name.lower().endswith('.kml')]
        if len(names) != 1:
            raise ValueError(f'{path.name}: tek KML bekleniyor.')
        root = ET.fromstring(archive.read(names[0]))
    features, indexed, counts, repairs = [], {'bolme': [], 'bolmecik': []}, Counter(), []
    ids = set()
    for folder in root.findall('.//k:Folder', KML):
        layer = LAYERS.get(folder.findtext('k:name', namespaces=KML))
        if not layer:
            continue
        for record in folder.findall('k:Placemark', KML):
            fields = {f.get('name'): f.text for f in record.findall('.//k:SimpleData', KML)}
            number, oid = fields['BLM_NO'], fields['OBJECTID']
            record_id = (layer, oid)
            if record_id in ids or int(fields['PYIL']) != START or fields['SEFLIK_ADI'] != source['kurum']:
                raise ValueError(f'{office}, bölüm {number}: yinelenen kayıt veya farklı şeflik/yıl.')
            ids.add(record_id)
            counts[layer] += 1
            properties = {'katman': layer, 'bolme': number, 'nesne': oid}
            if layer == 'bolmecik':
                properties.update({'bolmecik': fields['BLC_NO'], 'tip': fields['MESCERE'], 'sinif': fields['ISL_SIN']})
            parts = []
            for shape in record.findall('.//k:Polygon', KML):
                g = source_polygon(shape)
                if not g.IsValid():
                    repaired = polygon_parts(g.MakeValid())
                    original = g.Clone()
                    original.Transform(transform)
                    area_after = 0
                    for part in repaired:
                        metric = part.Clone()
                        metric.Transform(transform)
                        area_after += metric.GetArea()
                    if not repaired or abs(area_after - original.GetArea()) > max(1, original.GetArea() * .001):
                        raise ValueError(f'{office}: {layer} {oid} onarımı alanı değiştiriyor.')
                    repairs.append({'nesne': oid, 'bolme': number, 'tip': fields.get('MESCERE'), 'alan_farki_m2': round(abs(area_after - original.GetArea()), 4)})
                    parts.extend(repaired)
                else:
                    parts.append(g)
            if not parts or any(not part.IsValid() for part in parts):
                raise ValueError(f'{office}: {layer} {oid} geçerli poligon içermiyor.')
            coords, metric_parts = [], []
            for part in parts:
                coords.append(json.loads(part.ExportToJson())['coordinates'])
                metric = part.Clone()
                metric.Transform(transform)
                metric_parts.append((metric.GetEnvelope(), metric))
            indexed[layer].append((properties, metric_parts))
            geometry = {'type': 'Polygon', 'coordinates': coords[0]} if len(coords) == 1 else {'type': 'MultiPolygon', 'coordinates': coords}
            features.append({'type': 'Feature', 'properties': properties, 'geometry': geometry})
    if not all(counts[key] for key in LAYERS.values()):
        raise ValueError(f'{office}: beklenen iki poligon katmanı bulunamadı.')
    with path.open('rb') as source_file:
        sha = hashlib.file_digest(source_file, 'sha256').hexdigest()
    return {
        'type': 'FeatureCollection', 'features': features,
        'kaynak': {**source, 'seflik': office, 'sayilar': dict(counts), 'onarmalar': repairs,
                   'sha256': sha}
    }, indexed


def park_geometry(park, transform):
    boundary = park.get('harita') or {}
    parts = boundary.get('sinir', [])
    holes = boundary.get('sinir_holes') or [[] for _ in parts]
    result = ogr.Geometry(ogr.wkbMultiPolygon)
    for shell, inner in zip(parts, holes, strict=True):
        geo = polygon([[(q[1], q[0]) for q in ring] for ring in [shell, *inner]])
        geo.Transform(transform)
        result.AddGeometry(geo)
    if not result.IsEmpty() and not result.IsValid():
        raise ValueError(f"{park['kisa']}: park sınırı geçersiz.")
    return result


def intersection_areas(park, entries, layer):
    x1, x2, y1, y2 = park.GetEnvelope()
    tally = defaultdict(float)
    covered = None
    total = 0
    for office, indexed in entries.items():
        for properties, parts in indexed[layer]:
            for (a, b, c, d), geometry in parts:
                if b < x1 or a > x2 or d < y1 or c > y2 or not park.Intersects(geometry):
                    continue
                for overlap in polygon_parts(park.Intersection(geometry)):
                    area = overlap.GetArea()
                    if area <= 1:
                        continue
                    key = (office, properties['bolme']) if layer == 'bolme' else (office, properties['bolme'], properties['bolmecik'], properties['tip'])
                    tally[key] += area
                    total += area
                    covered = overlap if covered is None else covered.Union(overlap)
    rows = [[*key, round(area, 1)] for key, area in sorted(tally.items(), key=lambda row: (-row[1], row[0]))]
    union = covered.GetArea() if covered is not None else 0
    return rows, round(union, 1), max(0, round(total - union, 1))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_dir', type=Path)
    parser.add_argument('parks', type=Path)
    parser.add_argument('output_dir', type=Path)
    args = parser.parse_args()
    ogr.UseExceptions()
    gdal.PushErrorHandler('CPLQuietErrorHandler')
    transform = osr.CoordinateTransformation(projection(4326), projection(32635))
    sources = json.loads((args.source_dir / 'sources.json').read_text(encoding='utf8'))
    parks = json.loads(args.parks.read_text(encoding='utf8'))['parks']
    args.output_dir.mkdir(parents=True, exist_ok=True)
    index = {'baslangic': START, 'donem': '2024–2043', 'aktarim': datetime.now(ZoneInfo('Europe/Istanbul')).date().isoformat(),
             'seflikler': {}, 'parklar': {}}
    entries = {}
    for office, source in sources.items():
        slug = source['dosya']
        dataset, entries[office] = read_office(args.source_dir / (slug + '.kmz'), office, source, transform)
        index['seflikler'][office] = dataset['kaynak']
        write_json(args.output_dir / (slug + '.json'), dataset)
    for park in parks:
        geometry = park_geometry(park, transform)
        if geometry.IsEmpty():
            continue
        boundary = park['harita']
        area = geometry.GetArea()
        sections, covered, overlap = intersection_areas(geometry, entries, 'bolme')
        stands, stands_covered, stands_overlap = intersection_areas(geometry, entries, 'bolmecik')
        index['parklar'][park['kisa']] = {'alan_m2': round(area, 1), 'bolmeler': sections, 'bolmecikler': stands,
                                         'sinir': boundary['sinir'], 'sinir_holes': boundary.get('sinir_holes', []),
                                         'kapsam_m2': covered, 'cakisma_m2': overlap,
                                         'bolmecik_kapsam_m2': stands_covered, 'bolmecik_cakisma_m2': stands_overlap}
    write_json(args.output_dir / 'ozet.json', index)


if __name__ == '__main__':
    main()
