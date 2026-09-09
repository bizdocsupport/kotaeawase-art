import unittest
from datetime import date

from scraper import candidate_in_window, extract_detail_fields, link_allowed, normalize_text, parse_date_range
from updater import title_similar


class ExhibitionToolsTest(unittest.TestCase):
    def test_japanese_date_range(self):
        self.assertEqual(
            parse_date_range("2026年11月14日(土)～2027年3月28日(日)"),
            ("2026-11-14", "2027-03-28"),
        )

    def test_short_end_year(self):
        self.assertEqual(
            parse_date_range("2026.6.13(土) - 9.23(水・祝)"),
            ("2026-06-13", "2026-09-23"),
        )

    def test_year_rollover(self):
        self.assertEqual(
            parse_date_range("2026年12月19日～1月17日"),
            ("2026-12-19", "2027-01-17"),
        )

    def test_iso_like_range(self):
        self.assertEqual(
            parse_date_range("2026-07-04 – 2026-09-27"),
            ("2026-07-04", "2026-09-27"),
        )

    def test_normalize(self):
        self.assertEqual(
            normalize_text("フェルメール《真珠の耳飾りの少女》展"),
            "フェルメール真珠の耳飾りの少女展",
        )

    def test_title_similar_with_subtitle(self):
        manual = [normalize_text("フェルメール《真珠の耳飾りの少女》展")]
        self.assertTrue(
            title_similar(
                "フェルメール《真珠の耳飾りの少女》展 17世紀オランダ絵画の名品、奇跡の再来日",
                manual,
            )
        )

    def test_past_exhibition_is_out(self):
        self.assertFalse(candidate_in_window("2026-04-25", "2026-06-21", date(2026, 9, 9)))

    def test_today_ending_exhibition_is_in(self):
        self.assertTrue(candidate_in_window("2026-07-04", "2026-09-09", date(2026, 9, 9)))

    def test_tnm_detail_link_allowed(self):
        source = {
            "detail_url_regex": r"/modules/r_free_page/index\.php\?id=\d+$",
        }
        self.assertTrue(
            link_allowed(
                "/modules/r_free_page/index.php?id=2759",
                source,
                "https://www.tnm.jp/modules/r_exhibition/index.php?cid=1&controller=ctg&lang=ja",
            )
        )

    def test_mot_slug_detail_link_allowed(self):
        source = {
            "include_url": "/exhibitions/",
            "detail_url_regex": r"/exhibitions/(?!past(?:/|$))[^/?#]+/?$",
        }
        self.assertTrue(
            link_allowed(
                "/exhibitions/Constellation/",
                source,
                "https://www.mot-art-museum.jp/exhibitions/",
            )
        )
        self.assertFalse(
            link_allowed(
                "/exhibitions/past/",
                source,
                "https://www.mot-art-museum.jp/exhibitions/",
            )
        )

    def test_detail_enrichment_aham(self):
        html = """<html><head><title>ルーシー・リー展 －東西をつなぐ優美のうつわ－ | あべのハルカス美術館</title></head>
        <body><main><h1>ルーシー・リー展 －東西をつなぐ優美のうつわ－</h1><p>2026年12月26日（土）～ 2027年3月7日（日）</p></main></body></html>"""
        title, dr = extract_detail_fields(html, {"venue": "あべのハルカス美術館"})
        self.assertEqual(title, "ルーシー・リー展 －東西をつなぐ優美のうつわ－")
        self.assertEqual(dr, ("2026-12-26", "2027-03-07"))

    def test_detail_enrichment_tnm(self):
        html = """<html><body><main><h1>特別展 内山晋コレクション受贈記念「歌川広重 江戸のベストアングル」</h1>
        <p>2026年9月29日（火）～2026年12月20日（日）</p></main></body></html>"""
        title, dr = extract_detail_fields(html, {"venue": "東京国立博物館"})
        self.assertIn("歌川広重", title)
        self.assertEqual(dr, ("2026-09-29", "2026-12-20"))


if __name__ == "__main__":
    unittest.main()
