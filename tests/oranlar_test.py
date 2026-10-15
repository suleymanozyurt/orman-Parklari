import contextlib
import copy
import datetime as dt
import importlib.util
import io
import json
import pathlib
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('oranlar', pathlib.Path(__file__).parents[1] / 'scripts/oran_guncelle.py')
rates = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rates)


class RatesTests(unittest.TestCase):
    def data(self):
        return {'tufe': {'degerler': {'2026': [.1] * 6 + [None] * 6}, 'son_basarili_kontrol': 'eski başarılı kontrol'},
                'gz': {'oranlar': [['2025-11-13', .037]], 'son_basarili_kontrol': 'eski başarılı kontrol'}, 'gz_kdv': .2}

    def run_main(self, initial, series):
        with tempfile.TemporaryDirectory() as folder:
            path = pathlib.Path(folder) / 'oranlar.json'
            path.write_text(json.dumps(initial))
            with patch.object(rates, 'YOL', str(path)), patch.object(rates, 'get', side_effect=OSError('unavailable')), patch.object(rates, 'tufe_portal', return_value=(series, 'test source')), patch.dict(rates.os.environ, {'TUIK_API_KEY': ''}), patch.object(rates.sys, 'argv', ['updater', '--gun', '2026-10-15', '--geri', '2']), contextlib.redirect_stdout(io.StringIO()):
                rates.main()
            return json.loads(path.read_text())

    def test_failed_sources_do_not_claim_success_or_replace_rates(self):
        old = self.data()
        new = self.run_main(copy.deepcopy(old), None)
        self.assertEqual(new['tufe']['degerler'], old['tufe']['degerler'])
        self.assertEqual(new['gz']['oranlar'], old['gz']['oranlar'])
        for key in ['tufe', 'gz']:
            self.assertEqual(new[key]['son_basarili_kontrol'], 'eski başarılı kontrol')
            self.assertTrue(new[key]['son_deneme'])
        self.assertEqual(new['gz']['tarama']['ok'], 0)
        self.assertIn('Tarama eksik', new['gz']['durum'])

    def test_valid_past_month_can_fill_but_future_or_invalid_values_cannot(self):
        new = self.run_main(self.data(), {(2026, 7): -.01, (2026, 11): .25, (2026, 9): float('nan'), (2026, 13): .2})
        self.assertEqual(new['tufe']['degerler']['2026'][6], -.01)
        self.assertIsNone(new['tufe']['degerler']['2026'][10])
        self.assertIsNone(new['tufe']['degerler']['2026'][8])
        self.assertEqual(new['tufe']['son_ay'], '2026-07')
        self.assertNotEqual(new['tufe']['son_basarili_kontrol'], 'eski başarılı kontrol')

    def test_rg_scan_records_partial_coverage_and_reads_decision(self):
        html = '<title>Resmî Gazete</title><a href="karar.htm">6183 Sayılı Kanun Gecikme Zammı Oranı</a>'
        stats = {}
        def get(url):
            if '20261014' in url:
                raise OSError('failed day')
            return html.encode(), 'text/html'
        with patch.object(rates, 'get', side_effect=get), patch.object(rates, 'karar_oran', return_value=.037), contextlib.redirect_stdout(io.StringIO()):
            found = rates.gz_tara(dt.date(2026, 10, 15), 2, stats)
        self.assertEqual(stats['ok'], 1)
        self.assertEqual(stats['eksik'], ['2026-10-14'])
        self.assertEqual(found[0][1], .037)

    def test_unverified_effective_date_is_not_automatically_imported(self):
        text = '6183 sayılı Kanun 51 inci maddesi gecikme zammı oranı %3,7 olarak belirlenmiştir.'
        with patch.object(rates, 'get', return_value=(text.encode(), 'text/html')), contextlib.redirect_stdout(io.StringIO()):
            self.assertIsNone(rates.karar_oran('https://www.resmigazete.gov.tr/test.htm'))
        text += ' Bu Karar yayımı tarihinde yürürlüğe girer.'
        with patch.object(rates, 'get', return_value=(text.encode(), 'text/html')), contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(rates.karar_oran('https://www.resmigazete.gov.tr/test.htm'), .037)

    def test_wrong_tufe_series_is_rejected(self):
        dataset = {'id': ['TIME_PERIOD'], 'size': [7], 'dimension': {'DEGISIM': {'label': 'On iki aylık ortalamalara göre değişim'}, 'TIME_PERIOD': {'category': {'index': [f'2026-{i:02}' for i in range(1, 8)]}}}, 'value': [99] * 7}
        with patch.object(rates, 'get', return_value=(json.dumps(dataset).encode(), 'application/json')):
            found, message = rates.tufe_portal(self.data()['tufe']['degerler'])
        self.assertIsNone(found)
        self.assertIn('tutmadı', message)


if __name__ == '__main__':
    unittest.main()
