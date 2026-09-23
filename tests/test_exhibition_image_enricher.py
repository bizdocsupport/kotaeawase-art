import sys
import unittest
from pathlib import Path
from datetime import date
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from exhibition_image_enricher import extract_official_image, valid_image_url, curate_needed, enrich_payload
from build_exhibitions_auto_js import render_js, site_item


class OfficialImageMetadataTests(unittest.TestCase):
    def test_og_image_relative_url(self):
        html='<html><head><meta property="og:image" content="/img/2026-poster.jpg"></head></html>'
        self.assertEqual(extract_official_image(html,'https://museum.example/exhibitions/123'),
                         ('https://museum.example/img/2026-poster.jpg','meta [property="og:image"]'))

    def test_twitter_fallback(self):
        html='<meta name="twitter:image" content="https://museum.example/ex/hero.webp">'
        self.assertEqual(extract_official_image(html,'https://museum.example/ex'),
                         ('https://museum.example/ex/hero.webp','meta [name="twitter:image"]'))

    def test_logo_is_not_accepted(self):
        html='<meta property="og:image" content="/images/logo.png"><img class="exhibition-poster" src="/poster.jpg">'
        self.assertEqual(extract_official_image(html,'https://museum.example/ex'),
                         ('https://museum.example/poster.jpg','poster/hero'))

    def test_json_ld_exhibition_image(self):
        html='''<script type="application/ld+json">{"@type":"ExhibitionEvent","image":"/media/poster.png"}</script>'''
        self.assertEqual(extract_official_image(html,'https://museum.example/ex'),
                         ('https://museum.example/media/poster.png','json-ld'))

    def test_generic_first_photo_is_rejected(self):
        html='<html><img src="/museum-main.jpg"><img src="/donation.jpg"></html>'
        self.assertEqual(extract_official_image(html,'https://museum.example/ex'), ('',''))

    def test_no_data_or_unsupported_scheme(self):
        self.assertEqual(valid_image_url('data:image/png;base64,AAA','https://museum.example/ex'),'')
        self.assertEqual(valid_image_url('/img/favicon.ico','https://museum.example/ex'),'')

    def test_manual_templates_only(self):
        js="""window.KA_EXHIBITIONS = [
          {id:'manualA', title:'A', official:'https://museum.example/a',image:'assets/images/exhibition-card/sample.webp'},
          {id:'manualB', title:'B', official:'https://museum.example/b',image:'assets/images/exhibition-official/b.webp'},
          {id:'manualC', title:'C', official:'https://museum.example/c',imageId:'real-art'},
          {id:'manualD', title:'D', official:'https://museum.example/d'},
        ];"""
        self.assertEqual([x['id'] for x in curate_needed(js)], ['manualA','manualD'])

    def test_generated_js_applies_overrides_before_auto_cards(self):
        js=render_js([{'id':'auto','image':'https://museum.example/poster.jpg'}],
                     {'manualA':{'image':'https://museum.example/visual.jpg','sourcePage':'https://museum.example/ex'}})
        self.assertLess(js.index('imageOverrides'), js.index('push(...'))
        self.assertIn("includes('/exhibition-card/')",js)
        self.assertIn('https://museum.example/visual.jpg',js)

    def test_site_item_has_image(self):
        row={'id':'x','title':'A','venue':'Museum','area':'Tokyo','start':'2026-10-01','end':'2026-10-03','official':'https://museum.example/a','image':'https://museum.example/p.jpg'}
        self.assertEqual(site_item(row)['image'],'https://museum.example/p.jpg')
        self.assertEqual(site_item(row)['imageSource'],'https://museum.example/a')

    def test_empty_collection_does_not_do_network(self):
        payload={'updatedAt':None,'items':[]}
        manual='window.KA_EXHIBITIONS = [];'
        out,overrides,report=enrich_payload(payload,manual,{},object(),date(2026,9,23))
        self.assertEqual(out,payload)
        self.assertEqual(overrides,{})
        self.assertEqual(report,[])


if __name__=='__main__': unittest.main()
