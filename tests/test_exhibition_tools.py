import unittest

from scraper import normalize_text, parse_date_range
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

    def test_square_bracket_weekday(self):
        self.assertEqual(
            parse_date_range("2026年6月23日[火] - 10月4日[日]"),
            ("2026-06-23", "2026-10-04"),
        )

    def test_iso_range(self):
        self.assertEqual(
            parse_date_range("2026-07-04 – 2026-09-27"),
            ("2026-07-04", "2026-09-27"),
        )

    def test_year_rollover(self):
        self.assertEqual(
            parse_date_range("2026年12月19日～1月17日"),
            ("2026-12-19", "2027-01-17"),
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


if __name__ == "__main__":
    unittest.main()
