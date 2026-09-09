#!/usr/bin/env python3
"""Phase 2B: review済みの自動取得候補からサイト読込用JSを生成する。

設計方針:
- 手動マスタ docs/assets/js/exhibitions-data.js は一切書き換えない。
- 自動候補は docs/assets/js/exhibitions-auto.js にだけ出力する。
- 手動マスタと重複する候補は防御的に再除外する。
- 公開対象は「開催中〜開始180日以内」。遠い将来の候補はレビューには残すがサイトにはまだ出さない。
- 自動候補は homePriority を大きく下げ、トップの手動セレクトを優先する。
"""
from __future__ import annotations

import argparse
import json
import re
import unicodedata
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from zoneinfo import ZoneInfo
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_AUTO_JSON = ROOT / "data/exhibitions-auto.json"
DEFAULT_MANUAL_JS = ROOT / "docs/assets/js/exhibitions-data.js"
DEFAULT_OUTPUT_JS = ROOT / "docs/assets/js/exhibitions-auto.js"
DEFAULT_HORIZON_DAYS = 180


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value or "")
    value = re.sub(r"[\s\u3000]+", "", value)
    value = re.sub(r"[「」『』〖〗《》〈〉\[\]（）()・･:：,，.。!?！？\-‐‑–—―~〜～]", "", value)
    return value.lower()


def canonical_url(value: str) -> str:
    if not value:
        return ""
    try:
        parts = urlsplit(value.strip())
        path = parts.path.rstrip("/") or "/"
        return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, "", ""))
    except Exception:
        return value.strip().rstrip("/")


def split_top_level_objects(text: str) -> list[str]:
    marker = "window.KA_EXHIBITIONS"
    start = text.find(marker)
    if start < 0:
        return []
    arr = text.find("[", start)
    if arr < 0:
        return []
    objects: list[str] = []
    depth = 0
    obj_start = None
    quote = None
    escape = False
    for i in range(arr + 1, len(text)):
        ch = text[i]
        if quote:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == quote:
                quote = None
            continue
        if ch in ("'", '"'):
            quote = ch
            continue
        if ch == "{":
            if depth == 0:
                obj_start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and obj_start is not None:
                objects.append(text[obj_start:i + 1])
                obj_start = None
        elif ch == "]" and depth == 0:
            break
    return objects


def field(block: str, key: str) -> str:
    # 現行マスタは単引用符。防御的に二重引用符も許可する。
    m = re.search(rf"\b{re.escape(key)}\s*:\s*(['\"])(.*?)\1", block, flags=re.S)
    return m.group(2).strip() if m else ""


def manual_catalog(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    out = []
    for block in split_top_level_objects(text):
        title = field(block, "title")
        if not title:
            continue
        kind = field(block, "kind")
        if kind and kind != "exhibition":
            continue
        out.append({
            "title": title,
            "title_norm": normalize_text(title),
            "venue": field(block, "venue"),
            "official": canonical_url(field(block, "official")),
        })
    return out


def is_manual_duplicate(item: dict, catalog: list[dict]) -> bool:
    url = canonical_url(str(item.get("official", "")))
    title = normalize_text(str(item.get("title", "")))
    venue = str(item.get("venue", ""))
    for m in catalog:
        if url and m["official"] and url == m["official"]:
            return True
        if venue and m["venue"] and venue != m["venue"]:
            continue
        mt = m["title_norm"]
        if title and mt:
            if title == mt:
                return True
            if min(len(title), len(mt)) >= 8 and (title in mt or mt in title):
                return True
    return False


def parse_iso_day(value: str) -> date | None:
    try:
        return date.fromisoformat(value)
    except Exception:
        return None


def valid_candidate(item: dict) -> bool:
    required = ("id", "title", "venue", "area", "start", "end", "official")
    if any(not str(item.get(k, "")).strip() for k in required):
        return False
    start = parse_iso_day(str(item.get("start", "")))
    end = parse_iso_day(str(item.get("end", "")))
    if not start or not end or start > end:
        return False
    official = str(item.get("official", "")).strip().lower()
    return official.startswith("https://") or official.startswith("http://")


def site_item(item: dict) -> dict:
    title = str(item["title"]).strip()
    return {
        "id": str(item["id"]).strip(),
        "kind": "exhibition",
        "title": title,
        "shortTitle": title,
        "aliases": [title],
        "venue": str(item["venue"]).strip(),
        "area": str(item["area"]).strip(),
        "start": str(item["start"]).strip(),
        "end": str(item["end"]).strip(),
        "image": "",
        "guide": "",
        "official": str(item["official"]).strip(),
        "note": "公式サイトから自動取得した開催情報です。",
        "homePriority": -1000,
        "large": False,
        "bigPick": False,
        "auto": True,
        "ticketEvents": [],
    }


def build_items(payload: dict, manual: list[dict], today: date, horizon_days: int) -> list[dict]:
    horizon = today + timedelta(days=horizon_days)
    result = []
    seen_ids: set[str] = set()
    for raw in payload.get("items", []):
        if not isinstance(raw, dict) or not valid_candidate(raw):
            continue
        start = parse_iso_day(str(raw["start"]))
        end = parse_iso_day(str(raw["end"]))
        assert start and end
        # 終了済みはサイト用自動データから外す。レビュー側には別途履歴が残る。
        if end < today:
            continue
        # 180日より先は候補として保持するが、表示は近づいてから。
        if start > horizon:
            continue
        if is_manual_duplicate(raw, manual):
            continue
        item_id = str(raw["id"]).strip()
        if item_id in seen_ids:
            continue
        seen_ids.add(item_id)
        result.append(site_item(raw))
    result.sort(key=lambda x: (x["start"], x["end"], x["venue"], x["title"]))
    return result


def render_js(items: list[dict]) -> str:
    payload = json.dumps(items, ensure_ascii=False, indent=2)
    return (
        "/* AUTO-GENERATED FILE. DO NOT EDIT.\n"
        " * Source: data/exhibitions-auto.json\n"
        " * Manual curated data remains in exhibitions-data.js.\n"
        " */\n"
        "window.KA_EXHIBITIONS = Array.isArray(window.KA_EXHIBITIONS) ? window.KA_EXHIBITIONS : [];\n"
        f"window.KA_EXHIBITIONS.push(...{payload});\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--auto-json", type=Path, default=DEFAULT_AUTO_JSON)
    parser.add_argument("--manual-js", type=Path, default=DEFAULT_MANUAL_JS)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_JS)
    parser.add_argument("--horizon-days", type=int, default=DEFAULT_HORIZON_DAYS)
    parser.add_argument("--today", help="YYYY-MM-DD。テスト/確認用。未指定はAsia/Tokyoの今日")
    args = parser.parse_args()

    payload = json.loads(args.auto_json.read_text(encoding="utf-8"))
    manual = manual_catalog(args.manual_js)
    if args.today:
        today = date.fromisoformat(args.today)
    else:
        today = datetime.now(ZoneInfo("Asia/Tokyo")).date()
    items = build_items(payload, manual, today, args.horizon_days)
    text = render_js(items)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    old = args.output.read_text(encoding="utf-8") if args.output.exists() else None
    if old != text:
        args.output.write_text(text, encoding="utf-8", newline="\n")
        changed = "updated"
    else:
        changed = "unchanged"
    print(f"exhibitions-auto.js: {changed}; published={len(items)}; horizon={args.horizon_days}d")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
