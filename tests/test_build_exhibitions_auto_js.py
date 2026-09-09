import importlib.util
import json
import tempfile
import unittest
from datetime import date
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "tools" / "build_exhibitions_auto_js.py"
spec = importlib.util.spec_from_file_location("build_auto", MODULE_PATH)
build_auto = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(build_auto)


class BuildAutoJsTests(unittest.TestCase):
    def test_filters_manual_ended_and_far_future(self):
        manual = [{
            "title": "既存展覧会",
            "title_norm": build_auto.normalize_text("既存展覧会"),
            "venue": "A美術館",
            "official": "https://example.com/manual",
        }]
        payload = {"items": [
            {"id":"dup","title":"既存展覧会","venue":"A美術館","area":"東京","start":"2026-09-01","end":"2026-10-01","official":"https://example.com/manual"},
            {"id":"ended","title":"終了展","venue":"B美術館","area":"東京","start":"2026-07-01","end":"2026-09-08","official":"https://example.com/ended"},
            {"id":"ok","title":"新規展","venue":"C美術館","area":"大阪","start":"2026-10-01","end":"2026-12-01","official":"https://example.com/ok"},
            {"id":"far","title":"遠い未来展","venue":"D美術館","area":"京都","start":"2027-05-01","end":"2027-06-01","official":"https://example.com/far"},
        ]}
        items = build_auto.build_items(payload, manual, date(2026,9,9), 180)
        self.assertEqual([x["id"] for x in items], ["ok"])
        self.assertTrue(items[0]["auto"])
        self.assertEqual(items[0]["homePriority"], -1000)

    def test_generated_js_appends_not_replaces(self):
        js = build_auto.render_js([{"id":"x","kind":"exhibition"}])
        self.assertIn("window.KA_EXHIBITIONS.push", js)
        self.assertNotIn("window.KA_EXHIBITIONS = [", js)

    def test_manual_catalog_reads_current_shape(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / "manual.js"
            p.write_text("window.KA_EXHIBITIONS=[{id:'a',kind:'exhibition',title:'展A',venue:'館A',official:'https://example.com/a'}];", encoding="utf-8")
            rows = build_auto.manual_catalog(p)
            self.assertEqual(rows[0]["title"], "展A")
            self.assertEqual(rows[0]["venue"], "館A")


if __name__ == "__main__":
    unittest.main()
