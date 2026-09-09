#!/usr/bin/env python3
"""展覧会候補を12館から取得し、レビュー用データを更新する。

Phase 2A:
- GitHub上の data/ だけ更新
- docs/ は変更しない
- FTP deploy は呼ばない
"""
from __future__ import annotations

import argparse
import json
import re
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from scraper import canonical_url, normalize_text, scrape_all
from site_config import MUSEUM_SOURCES

ROOT = Path(__file__).resolve().parent
MANUAL_JS = ROOT / "docs/assets/js/exhibitions-data.js"
AUTO_JSON = ROOT / "data/exhibitions-auto.json"
STATUS_JSON = ROOT / "data/exhibitions-source-status.json"
REVIEW_MD = ROOT / "data/exhibitions-review.md"


def split_top_level_objects(text: str) -> list[str]:
    marker = "window.KA_EXHIBITIONS"
    start = text.find(marker)
    if start < 0:
        return []
    arr = text.find("[", start)
    if arr < 0:
        return []
    objects = []
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
    m = re.search(rf"\b{re.escape(key)}\s*:\s*'([^']*)'", block)
    return m.group(1).strip() if m else ""


def aliases(block: str) -> list[str]:
    m = re.search(r"\baliases\s*:\s*\[([^\]]*)\]", block, flags=re.S)
    if not m:
        return []
    return [x for x in re.findall(r"'([^']+)'", m.group(1)) if x.strip()]


def parse_manual_catalog() -> list[dict]:
    text = MANUAL_JS.read_text(encoding="utf-8")
    result = []
    for block in split_top_level_objects(text):
        if field(block, "kind") not in ("", "exhibition"):
            continue
        title = field(block, "title")
        if not title:
            continue
        names = [title, field(block, "shortTitle"), field(block, "galleryTitle"), *aliases(block)]
        result.append({
            "title": title,
            "names": [normalize_text(x) for x in names if x],
            "venue": field(block, "venue"),
            "start": field(block, "start"),
            "end": field(block, "end"),
            "official": canonical_url(field(block, "official")) if field(block, "official") else "",
        })
    return result


def title_similar(candidate: str, manual_names: list[str]) -> bool:
    c = normalize_text(candidate)
    if not c:
        return False
    for m in manual_names:
        if not m:
            continue
        if c == m:
            return True
        # 長めの名称なら「副題あり/なし」も同一扱い。
        if min(len(c), len(m)) >= 8 and (c in m or m in c):
            return True
    return False


def overlaps(a_start: str, a_end: str, b_start: str, b_end: str) -> bool:
    try:
        a1, a2 = date.fromisoformat(a_start), date.fromisoformat(a_end)
        b1, b2 = date.fromisoformat(b_start), date.fromisoformat(b_end)
        return max(a1, b1) <= min(a2, b2)
    except Exception:
        return False


def is_manual_duplicate(item: dict, catalog: list[dict]) -> bool:
    url = canonical_url(item.get("official", ""))
    for manual in catalog:
        if url and manual["official"] and url == manual["official"]:
            return True
        if item.get("venue") != manual.get("venue"):
            continue
        if not overlaps(item["start"], item["end"], manual.get("start", ""), manual.get("end", "")):
            continue
        if title_similar(item["title"], manual["names"]):
            return True
    return False


def load_previous() -> dict:
    if not AUTO_JSON.exists():
        return {"updatedAt": None, "items": []}
    try:
        obj = json.loads(AUTO_JSON.read_text(encoding="utf-8"))
        if isinstance(obj, dict) and isinstance(obj.get("items"), list):
            return obj
    except Exception:
        pass
    return {"updatedAt": None, "items": []}


def key(item: dict) -> tuple[str, str, str, str]:
    return (
        item.get("source_key", ""),
        canonical_url(item.get("official", "")),
        item.get("start", ""),
        normalize_text(item.get("title", "")),
    )


def preserve_failed_sources(previous: list[dict], fresh: list[dict], statuses: list[dict], today: date) -> list[dict]:
    """取得失敗館だけ前回値を保持。ただし終了済みは持ち越さない。"""
    failed = {s["key"] for s in statuses if not s.get("ok")}
    if not failed:
        return fresh
    kept = []
    for x in previous:
        if x.get("source_key") not in failed:
            continue
        try:
            if date.fromisoformat(x.get("end", "")) < today:
                continue
        except Exception:
            continue
        kept.append(x)
    return fresh + kept


def dedupe(items: list[dict]) -> list[dict]:
    by_url = {}
    for item in items:
        url = canonical_url(item.get("official", ""))
        if not url:
            continue
        item = dict(item)
        item["official"] = url
        by_url[url] = item
    return sorted(by_url.values(), key=lambda x: (x.get("start", ""), x.get("venue", ""), x.get("title", "")))


def review_markdown(items: list[dict], previous: list[dict], statuses: list[dict]) -> str:
    prev_keys = {key(x) for x in previous}
    new_items = [x for x in items if key(x) not in prev_keys]
    lines = [
        "# 展覧会自動取得レビュー",
        "",
        "> Phase 2A.4。ここに出た内容はまだ本番サイトには反映されません。",
        "",
        f"- 自動候補: **{len(items)}件**",
        f"- 今回の新規候補: **{len(new_items)}件**",
        f"- 監視館: **{len(statuses)}館**",
        "",
        "## 取得状況",
        "",
        "| 美術館 | 状態 | 取得方式 | 候補数 |",
        "|---|---:|---:|---:|",
    ]
    for s in statuses:
        state = "OK" if s.get("ok") else "ERROR"
        lines.append(f"| {s['venue']} | {state} | {s.get('fetchMethod', '-')} | {s.get('candidateCount', 0)} |")
    warnings = [s for s in statuses if s.get("warning")]
    if warnings:
        lines += ["", "### 取得警告（フォールバック等）", ""]
        for s in warnings:
            lines.append(f"- **{s['venue']}**: `{s.get('warning', '')}`")

    failed = [s for s in statuses if not s.get("ok")]
    if failed:
        lines += ["", "### 取得エラー", ""]
        for s in failed:
            lines.append(f"- **{s['venue']}**: `{s.get('error', '')}`")

    lines += ["", "## 今回の新規候補", ""]
    if not new_items:
        lines.append("新規候補はありません。")
    else:
        for x in new_items:
            lines += [
                f"### {x['title']}",
                f"- 会場: {x['venue']}",
                f"- 会期: {x['start']} ～ {x['end']}",
                f"- 公式: {x['official']}",
                "",
            ]

    lines += ["## 自動候補一覧", ""]
    if not items:
        lines.append("候補はありません。")
    else:
        lines += ["| 開始 | 終了 | 美術館 | 展覧会 |", "|---|---|---|---|"]
        for x in items:
            safe_title = x["title"].replace("|", "｜")
            lines.append(f"| {x['start']} | {x['end']} | {x['venue']} | [{safe_title}]({x['official']}) |")
    lines += [
        "",
        "---",
        "Phase 2A.4では文字コード誤判定を補正し、東博・あべのハルカスは詳細ページの「会期／開催期間」近傍からタイトル・会期を確定します。403の館は前回候補を保持し、`docs/` は変更しません。",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--today", help="テスト用 YYYY-MM-DD")
    args = parser.parse_args()

    jst = ZoneInfo("Asia/Tokyo")
    today = date.fromisoformat(args.today) if args.today else datetime.now(jst).date()
    previous_obj = load_previous()
    previous = previous_obj.get("items", [])
    catalog = parse_manual_catalog()

    fresh, statuses = scrape_all(MUSEUM_SOURCES, today)
    fresh = preserve_failed_sources(previous, fresh, statuses, today)
    fresh = dedupe(fresh)
    # 既存データに終了済みが残っていても、Phase 2A.2以降は自動候補から除外。
    fresh = [x for x in fresh if date.fromisoformat(x.get("end", "1900-01-01")) >= today]
    items = [x for x in fresh if not is_manual_duplicate(x, catalog)]

    changed = items != previous
    updated_at = (
        datetime.now(jst).isoformat(timespec="seconds")
        if changed
        else previous_obj.get("updatedAt")
    )
    AUTO_JSON.parent.mkdir(parents=True, exist_ok=True)
    AUTO_JSON.write_text(
        json.dumps({"updatedAt": updated_at, "items": items}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    # statusには毎回時刻を書かず、Gitの無意味な日次差分を避ける。
    compact_status = {
        "sources": statuses,
        "summary": {
            "sourceCount": len(statuses),
            "okCount": sum(1 for s in statuses if s.get("ok")),
            "errorCount": sum(1 for s in statuses if not s.get("ok")),
            "candidateCountBeforeManualFilter": len(fresh),
            "candidateCountAfterManualFilter": len(items),
        },
    }
    STATUS_JSON.write_text(json.dumps(compact_status, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REVIEW_MD.write_text(review_markdown(items, previous, statuses), encoding="utf-8")

    print(f"manual catalog: {len(catalog)}")
    print(f"auto candidates after manual filter: {len(items)}")
    print(f"changed: {changed}")
    print("Phase 2A: docs/ was not modified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
