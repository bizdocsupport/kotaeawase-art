import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import sys

BASE = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('update_note_feed', BASE/'scripts/update_note_feed.py')
MOD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MOD)
RSS = '''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
 <channel>
  <title>答え合わせ美術部</title>
  <item><title>最新 &amp; 新着</title>
    <link>https://note.com/kotaeawase_art/n/n1234?utm_source=x</link>
    <description><![CDATA[<p>最初の説明<strong>です</strong></p><img src="https://assets.st-note.com/a.jpg"/>]]></description>
    <pubDate>Wed, 23 Sep 2026 09:00:00 +0900</pubDate>
    <media:thumbnail url="https://assets.st-note.com/cover.jpg" />
  </item>
  <item><title>除外記事</title><link>https://note.com/another_account/n/n9999</link></item>
  <item><title>重複記事</title><link>https://note.com/kotaeawase_art/n/n1234</link></item>
  <item><title>先週</title><link>https://note.com/kotaeawase_art/n/n0001</link>
    <description><![CDATA[<script>injection</script><p>普通の説明です。</p>]]></description>
    <pubDate>Wed, 16 Sep 2026 09:00:00 +0900</pubDate>
  </item>
 </channel>
</rss>'''

class NoteFeedTests(unittest.TestCase):
    def test_rss_parses_dedupes_and_sanitizes(self):
        out = MOD.parse_rss(RSS.encode('utf-8'))
        self.assertEqual(len(out), 2)
        self.assertEqual(out[0]['url'], 'https://note.com/kotaeawase_art/n/n1234')
        self.assertEqual(out[0]['title'], '最新 & 新着')
        self.assertEqual(out[0]['image'], 'https://assets.st-note.com/cover.jpg')
        self.assertEqual(out[0]['publishedAt'], '2026-09-23T00:00:00Z')
        self.assertIn('最初の説明です', out[0]['excerpt'])
        self.assertNotIn('injection', out[1]['excerpt'])

    def test_external_urls_and_non_https_images_rejected(self):
        self.assertEqual(MOD.safe_article_url('https://evil.com/abc'), '')
        self.assertEqual(MOD.safe_article_url('https://note.com/kotaeawase_art/about'), '')
        self.assertEqual(MOD.safe_image_url('javascript:alert(1)'), '')
        self.assertEqual(MOD.safe_image_url('https://example.org/pic.png'), '')

    def test_bad_rss_does_not_overwrite_cached_data(self):
        with tempfile.TemporaryDirectory() as d:
            existing = Path(d)/'note-latest.json'
            existing.write_text('{"articles":[{"title":"keep"}]}', 'utf-8')
            with self.assertRaises(Exception):
                MOD.parse_rss(b'<rss>not xml')
            self.assertEqual(json.loads(existing.read_text())['articles'][0]['title'], 'keep')

    def test_seed_has_well_formed_note_links(self):
        seed = json.loads((BASE/'docs/assets/data/note-latest.json').read_text('utf-8'))
        self.assertGreaterEqual(len(seed['articles']), 4)
        self.assertTrue(all(MOD.safe_article_url(item['url']) for item in seed['articles']))

    def test_bad_feed_preserves_existing_json_end_to_end(self):
        with tempfile.TemporaryDirectory() as d:
            dest = Path(d) / 'note-latest.json'
            old_data = '{"articles":[{"title":"Previous good data"}]}\n'
            dest.write_text(old_data, encoding='utf-8')
            bad_xml = Path(d) / 'broken.xml'
            bad_xml.write_text('<rss><channel></channel></rss>', encoding='utf-8')
            with patch.object(sys, 'argv', ['script', '--rss-file', str(bad_xml), '--out', str(dest)]):
                with self.assertRaises(ValueError):
                    MOD.main()
            self.assertEqual(dest.read_text(encoding='utf-8'), old_data)

    def test_extracts_og_image_even_with_reversed_attributes_and_ampersands(self):
        html = '''<html><head>
          <meta content="https://assets.st-note.com/production/uploads/images/123/rectangle_large_type_2_A.png?fit=bounds&amp;width=1280"
                property="og:image">
        </head><body></body></html>'''
        self.assertEqual(
            MOD.parse_article_og_image(html),
            'https://assets.st-note.com/production/uploads/images/123/rectangle_large_type_2_A.png?fit=bounds&width=1280',
        )

    def test_rejects_external_og_image_and_prefers_valid_twitter_image(self):
        html = '''<meta property="og:image" content="https://example.com/tracking.png">
        <meta name="twitter:image" content="https://assets.st-note.com/thumb.jpg">'''
        self.assertEqual(MOD.parse_article_og_image(html), 'https://assets.st-note.com/thumb.jpg')

    def test_rss_missing_image_fetches_article_metadata(self):
        items = [{'url': 'https://note.com/kotaeawase_art/n/n1234', 'image': '', 'title': 'test'}]
        with patch.object(MOD, 'fetch_article_og_image', return_value='https://assets.st-note.com/header.jpg') as fetch:
            MOD.fill_missing_images(items)
        fetch.assert_called_once_with(items[0]['url'])
        self.assertEqual(items[0]['image'], 'https://assets.st-note.com/header.jpg')

    def test_previous_image_survives_empty_rss_without_extra_requests(self):
        items = [{'url': 'https://note.com/kotaeawase_art/n/n1234', 'image': ''}]
        previous = [{'url': items[0]['url'], 'image': 'https://assets.st-note.com/previous.jpg'}]
        with patch.object(MOD, 'fetch_article_og_image') as fetch:
            MOD.fill_missing_images(items, previous)
        fetch.assert_not_called()
        self.assertEqual(items[0]['image'], previous[0]['image'])

    def test_rss_image_has_priority_over_og_and_previous(self):
        items = [{'url': 'https://note.com/kotaeawase_art/n/n1234', 'image': 'https://assets.st-note.com/rss.jpg'}]
        previous = [{'url': items[0]['url'], 'image': 'https://assets.st-note.com/previous.jpg'}]
        with patch.object(MOD, 'fetch_article_og_image') as fetch:
            MOD.fill_missing_images(items, previous)
        fetch.assert_not_called()
        self.assertEqual(items[0]['image'], 'https://assets.st-note.com/rss.jpg')

    def test_bad_article_image_fetch_does_not_discard_other_data(self):
        items = [{'url': 'https://note.com/kotaeawase_art/n/n1234', 'image': '', 'title': 'remain'}]
        with patch.object(MOD, 'fetch_article_og_image', return_value=''):
            MOD.fill_missing_images(items)
        self.assertEqual(items[0]['image'], '')
        self.assertEqual(items[0]['title'], 'remain')

    def test_output_defaults_to_uploaded_repository_docs(self):
        self.assertEqual(MOD.output_path(), BASE / 'docs/assets/data/note-latest.json')

if __name__ == '__main__':
    unittest.main()

# The automated job must keep the previous published list on a broken response.
