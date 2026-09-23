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
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
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
CURATED_OVERRIDES = ROOT / "data/exhibition-image-curated-overrides.json"


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
        "image": str(item.get("image") or ""),
        "imageAlt": f"{title} 公式サイト掲載画像" if item.get("image") else "",
        "imageSource": str(item.get("imageSource") or item["official"]) if item.get("image") else "",
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


def render_js(items: list[dict], overrides: dict | None = None) -> str:
    payload = json.dumps(items, ensure_ascii=False, indent=2)
    override_payload = json.dumps(overrides or {}, ensure_ascii=False, indent=2)
    # 既存の画像（実作品・公式画像）は守り、テンプレート画像/無画像だけ差し替え。
    override_js = (
        f"const imageOverrides = {override_payload};\n"
        "window.KA_EXHIBITIONS.forEach(item => {\n"
        "  const found = imageOverrides[item.id];\n"
        "  const placeholder = !item.image || item.image.includes('/exhibition-card/');\n"
        "  if (found && found.image && placeholder && !item.imageId) {\n"
        "    item.image = found.image;\n"
        "    item.imageAlt = (item.shortTitle || item.title) + ' 公式サイト掲載画像';\n"
        "    item.imageSource = found.sourcePage || item.official;\n"
        "  }\n"
        "});\n"
    )
    return (
        "/* AUTO-GENERATED FILE. DO NOT EDIT.\n"
        " * Source: data/exhibitions-auto.json\n"
        " * Manual curated data remains in exhibitions-data.js.\n"
        " */\n"
        "window.KA_EXHIBITIONS = Array.isArray(window.KA_EXHIBITIONS) ? window.KA_EXHIBITIONS : [];\n"
        + override_js
        + f"window.KA_EXHIBITIONS.push(...{payload});\n"
    )



def selected_official_image(url: str, caption: str, *, fetch=None) -> str:
    """Individual handling for organizer pages whose OGP is generic or missing.

    Pick only a matching work/title in the public organizer page; do not fall
    back to the unrelated museum-wide hero image. Any failure is nonfatal.
    """
    if not url or not caption:
        return ""
    if fetch is None:
        fetch = requests.get
    try:
        resp = fetch(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; kotaeawase-art/1.0)'}, timeout=9)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        candidates = []
        for img in soup.find_all('img'):
            alt = str(img.get('alt') or '')
            title = str(img.get('title') or '')
            parent = img.find_parent('figure') or img.parent
            surrounding = parent.get_text(' ', strip=True)[:500] if parent else ''
            # srcset may point to very large artwork; prefer normal src.
            source = img.get('data-src') or img.get('data-original') or img.get('src') or ''
            if not source:
                picture = img.find_parent('picture')
                source_el = picture.find('source') if picture else None
                if source_el:
                    source = (source_el.get('data-srcset') or source_el.get('srcset') or '').split(',')[0].strip().split(' ')[0]
            if not source or source.startswith(('data:', 'blob:')):
                continue
            image = urljoin(resp.url, source)
            path = image.split('?')[0].lower()
            if not path.endswith(('.jpg', '.jpeg', '.webp', '.png', '.avif')):
                continue
            if any(x in path for x in ('logo','icon','avatar','spacer','blank','noimage')):
                continue
            score = 0
            if caption in alt or caption in title: score += 100
            if caption in surrounding: score += 55
            if score == 0: continue
            # Exclude tiny sprites if dimensions are advertised.
            try:
                width = int(img.get('width') or 0)
                if 0 < width < 150: continue
            except ValueError:
                pass
            candidates.append((score, image))
        candidates.sort(key=lambda row: row[0], reverse=True)
        return candidates[0][1] if candidates else ''
    except requests.RequestException:
        return ''


def merge_curated_images(items: list[dict], auto_overrides: dict, manual_overrides: dict, *, fetch=None) -> tuple[list[dict], dict]:
    """Merge add-only individual URLs without replacing already matched auto pictures.

    Existing generated picture URLs are kept if their organizer site is down.
    """
    image_overrides = dict(auto_overrides)
    result = []
    for x in items:
        row = dict(x)
        instruction = manual_overrides.get(row.get('id',''))
        # The updater's generated auto ID may change if exhibition title normalization changes.
        # Match the organizer's exact URL as a stable fallback; never use partial title alone.
        if not instruction:
            official = canonical_url(row.get('official',''))
            instruction = next((entry for entry in manual_overrides.values()
                                if entry.get('official') and official == canonical_url(entry['official'])), None)
        # Some museums expose the same exhibition through slightly different URLs
        # between the listing page and the detail page.  Use exact normalized title
        # + exact venue as a stable fallback, so a changed auto ID or URL variant
        # does not drop a manually curated official image.
        if not instruction:
            title_norm = normalize_text(str(row.get('title','')))
            venue = str(row.get('venue','')).strip()
            instruction = next((entry for entry in manual_overrides.values()
                                if normalize_text(str(entry.get('title',''))) == title_norm
                                and str(entry.get('venue','') or '').strip() in ('', venue)), None)
        if instruction and (not row.get('image') or '/exhibition-card/' in row.get('image','')):
            official_match = selected_official_image(instruction.get('officialPage',''), instruction.get('matchText',''), fetch=fetch) if instruction.get('officialPage') else ''
            image = official_match or instruction.get('image','')
            if image:
                row['image'] = image
                row['imageSource'] = (instruction.get('officialPage') if official_match else instruction.get('sourcePage')) or row.get('official','')
                row['imageAlt'] = instruction.get('imageAlt') or row['title']+'（公式掲載画像）'
                row['imagePosition'] = instruction.get('imagePosition','center')
        result.append(row)
    # The normal override list still handles curated master entries (if relevant).
    for key, entry in manual_overrides.items():
        if key not in image_overrides and entry.get('image'):
            image_overrides[key] = {'image': entry['image'], 'sourcePage':entry.get('sourcePage','')}
    return result, image_overrides

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--auto-json", type=Path, default=DEFAULT_AUTO_JSON)
    parser.add_argument("--image-overrides", type=Path, default=ROOT / "data/exhibition-image-overrides.json")
    parser.add_argument("--curated-image-overrides", type=Path, default=CURATED_OVERRIDES)
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
    overrides = json.loads(args.image_overrides.read_text(encoding="utf-8")) if args.image_overrides.exists() else {}
    curated = json.loads(args.curated_image_overrides.read_text(encoding="utf-8")) if args.curated_image_overrides.exists() else {}
    items, overrides = merge_curated_images(items, overrides, curated)
    text = render_js(items, overrides)
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
