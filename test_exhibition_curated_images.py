import importlib.util
import json
import unittest
from pathlib import Path
from unittest.mock import Mock

SCRIPT = Path(__file__).resolve().parents[1] / 'tools/build_exhibitions_auto_js.py'
spec = importlib.util.spec_from_file_location('build_images', SCRIPT)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class CuratedImageTests(unittest.TestCase):
    def test_five_expected_ids_and_http_image_urls(self):
        path = SCRIPT.parents[1] / 'data/exhibition-image-curated-overrides.json'
        conf = json.loads(path.read_text(encoding='utf-8'))
        self.assertEqual(len(conf), 5)
        for item in conf.values():
            self.assertTrue(item.get('image','').startswith('https://'), item.get('title'))

    def test_replaces_only_missing_and_retains_existing(self):
        original = [{'id':'x','title':'X','image':'','official':'https://museum.org/x'},
                    {'id':'y','title':'Y','image':'https://museum.org/verified.jpg'}]
        conf = {'x':{'image':'https://museum.org/new.jpg','sourcePage':'https://museum.org/x'},
                'y':{'image':'https://museum.org/should-not-replace.jpg'}}
        rows, merged = mod.merge_curated_images(original, {}, conf)
        self.assertEqual(rows[0]['image'],'https://museum.org/new.jpg')
        self.assertEqual(rows[1]['image'],'https://museum.org/verified.jpg')

    def test_stable_organizer_url_when_auto_id_changes(self):
        data = [{'id':'new-auto-id','title':'新着','official':'https://museum.example/exhibition/a','image':''}]
        config = {'old-auto-id':{'official':'https://museum.example/exhibition/a/',
                                 'image':'https://museum.example/official.jpg'}}
        rows, _ = mod.merge_curated_images(data, {}, config)
        self.assertEqual(rows[0]['image'], 'https://museum.example/official.jpg')

    def test_match_official_figure_caption(self):
        resp = Mock(status_code=200, url='https://museum.example/show')
        resp.text = '<main><figure><img src="/media/figure.jpg" alt=""><figcaption>松延総司《私の石》</figcaption></figure><img src="/logo.png" alt="logo"></main>'
        resp.raise_for_status.return_value=None
        result = mod.selected_official_image('https://museum.example/show','私の石',fetch=lambda *a,**kw:resp)
        self.assertEqual(result,'https://museum.example/media/figure.jpg')

    def test_official_match_preferred_and_source_attributed(self):
        resp = Mock(status_code=200, url='https://museum.org/exhibition')
        resp.text = '<figure><img src="/original.png" alt="《針仕事》"><figcaption>展覧会出品作</figcaption></figure>'
        resp.raise_for_status.return_value=None
        items = [{'id':'x','title':'エトランゼ','image':'','official':'https://museum.org/exhibition'}]
        config = {'x':{'image':'https://backup.org/backup.png','officialPage':'https://museum.org/exhibition','matchText':'針仕事','sourcePage':'https://backup.org/page'}}
        rows, _ = mod.merge_curated_images(items, {}, config, fetch=lambda *a,**kw:resp)
        self.assertEqual(rows[0]['image'],'https://museum.org/original.png')
        self.assertEqual(rows[0]['imageSource'],'https://museum.org/exhibition')

    def test_official_error_does_not_interrupt_generation(self):
        from requests import RequestException
        def fail(*a, **kw): raise RequestException('temporarily unavailable')
        rows, _ = mod.merge_curated_images([{'id':'x','title':'展覧会','image':'','official':'https://m.org'}],{},
                {'x':{'officialPage':'https://m.org','matchText':'針仕事','image':'https://backup.org/backup.jpg'}},fetch=fail)
        self.assertEqual(rows[0]['image'],'https://backup.org/backup.jpg')

if __name__ == '__main__': unittest.main()
