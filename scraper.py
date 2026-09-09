#!/usr/bin/env python3
"""公式美術館ページから展覧会候補を抽出する。

Phase 2A では候補を data/ に保存するだけで、docs/ は変更しない。
"""
from __future__ import annotations

import hashlib
import re
import unicodedata
from dataclasses import dataclass, asdict
from datetime import date, timedelta
from urllib.parse import urldefrag, urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from site_config import (
    FUTURE_HORIZON_DAYS,
    PAST_GRACE_DAYS,
    REQUEST_TIMEOUT_SECONDS,
    USER_AGENT,
)


DATE_TOKEN_RE = re.compile(
    r"(?:(?P<y>20\d{2})\s*[年./-]\s*)?"
    r"(?P<m>1[0-2]|0?[1-9])\s*[月./-]\s*"
    r"(?P<d>3[01]|[12]\d|0?[1-9])\s*日?"
)
RANGE_SEP_RE = re.compile(
    r"(?:\s*[（(][^）)]{0,12}[）)]\s*)?"
    r"(?:～|〜|－|―|–|—|~|-|\s+to\s+)"
    r"(?:\s*[（(][^）)]{0,12}[）)]\s*)?",
    re.I,
)

GENERIC_LINK_TEXT = {
    "詳細", "詳細へ", "詳しくはこちら", "詳しくみる", "more", "read more",
    "チケット購入", "展覧会公式ウェブサイト", "公式サイト", "開催概要", "view more",
}
GLOBAL_EXCLUDES = [
    "年間スケジュール", "開館時間", "休館日", "アクセス", "ミュージアムショップ",
    "イベント", "お知らせ", "ニュース", "チケット", "公募展一覧", "カレンダー",
]
GENERIC_TITLES = {
    "展覧会", "開催中の展覧会", "開催予定の展覧会", "これからの展覧会",
    "過去の展覧会", "これまでの展覧会", "展覧会スケジュール", "年間スケジュール",
    "企画展", "特別展", "特別展特別陳列", "の展覧会",
}
LEADING_STATUS_RE = re.compile(
    r"^(?:(?:開催中|開催予定|開催予定の展覧会|これから開催される展覧会|次回の展覧会|次々回の展覧会|予告|終了|入場自由|予約受付中|無料|企画展|特別展)\s*)+"
)


@dataclass
class Candidate:
    id: str
    title: str
    venue: str
    area: str
    start: str
    end: str
    official: str
    source_key: str

    def to_dict(self) -> dict:
        return asdict(self)


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value or "")
    value = re.sub(r"[\s\u3000]+", "", value)
    value = re.sub(r"[「」『』【】《》〈〉\[\]（）()・･:：,，.。!?！？\-‐‑–—―~〜～]", "", value)
    return value.lower()


def clean_space(value: str) -> str:
    return re.sub(r"[\s\u3000]+", " ", value or "").strip()


def _valid_date(y: int, m: int, d: int) -> str | None:
    try:
        return date(y, m, d).isoformat()
    except ValueError:
        return None


def parse_date_range(text: str) -> tuple[str, str] | None:
    """2026年9月1日～10月3日 / 2026.9.1 - 10.3 / ISO表記を抽出。"""
    text = unicodedata.normalize("NFKC", text or "")
    matches = list(DATE_TOKEN_RE.finditer(text))
    for idx, first in enumerate(matches[:-1]):
        second = matches[idx + 1]
        between = text[first.end():second.start()]
        between = re.sub(r"[\[［【(（][^\]］】)）]{0,12}[\]］】)）]", "", between)
        if not RANGE_SEP_RE.search(between):
            continue

        y1 = int(first.group("y")) if first.group("y") else None
        y2 = int(second.group("y")) if second.group("y") else None
        if y1 is None and y2 is None:
            continue
        if y1 is None:
            y1 = y2
        if y2 is None:
            y2 = y1
            if int(second.group("m")) < int(first.group("m")):
                y2 += 1

        start = _valid_date(y1, int(first.group("m")), int(first.group("d")))
        end = _valid_date(y2, int(second.group("m")), int(second.group("d")))
        if not start or not end:
            continue
        sd, ed = date.fromisoformat(start), date.fromisoformat(end)
        if ed < sd or (ed - sd).days > 550:
            continue
        return start, end
    return None


def canonical_url(url: str) -> str:
    url = urldefrag(url)[0].strip()
    return url.rstrip("/")


def same_host(a: str, b: str) -> bool:
    def host(url: str) -> str:
        return urlparse(url).netloc.lower().removeprefix("www.")
    return host(a) == host(b)


def link_allowed(href: str, source: dict, base_url: str) -> bool:
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
        return False
    full = canonical_url(urljoin(base_url, href))
    # 詳細ページが同一ホストにあるサイトを対象にする。
    if not same_host(full, base_url):
        return False
    marker = source.get("include_url")
    if marker and marker not in full:
        return False
    include_re = source.get("detail_url_regex")
    if include_re and not re.search(include_re, full):
        return False
    exclude_re = source.get("exclude_url_regex")
    if exclude_re and re.search(exclude_re, full):
        return False
    return True


def find_date_block(anchor, max_levels: int = 7):
    """リンク自身→親へたどり、日付範囲を含む最小ブロックを返す。"""
    # 一覧ページではリンク文字列自体に「タイトル＋会期」が入る館が多い。
    # ここを最初に見ることで、親の巨大なナビ領域を拾う誤検出も防げる。
    anchor_text = clean_space(anchor.get_text(" ", strip=True))
    if parse_date_range(anchor_text):
        return anchor

    node = anchor
    fallback = None
    for _ in range(max_levels):
        node = getattr(node, "parent", None)
        if node is None:
            break
        text = clean_space(node.get_text(" ", strip=True))
        if len(text) > 1600:
            break
        if parse_date_range(text):
            # ナビ全体など多数リンクを抱える大きなブロックは候補カードとして扱わない。
            if len(node.find_all("a", href=True)) > 8:
                continue
            fallback = node
            # article/li/card 相当を優先
            if getattr(node, "name", "") in {"article", "li", "section"}:
                return node
    return fallback


def _remove_date_tail(text: str) -> str:
    m = DATE_TOKEN_RE.search(text)
    return text[:m.start()].strip(" -|｜:：") if m else text


def title_is_generic(title: str) -> bool:
    return normalize_text(title) in {normalize_text(x) for x in GENERIC_TITLES}


def pick_title(anchor, block) -> str:
    """リンク文字列→近傍見出し→ブロック先頭の順でタイトル候補を選ぶ。"""
    anchor_text = clean_space(anchor.get_text(" ", strip=True))
    candidates = []
    if anchor_text and anchor_text.lower() not in GENERIC_LINK_TEXT:
        candidates.append(anchor_text)
    for tag_name in ("h1", "h2", "h3", "h4", "h5", "strong"):
        tag = block.find(tag_name)
        if tag:
            candidates.append(clean_space(tag.get_text(" ", strip=True)))
    candidates.append(_remove_date_tail(clean_space(block.get_text(" ", strip=True))))

    for raw in candidates:
        title = LEADING_STATUS_RE.sub("", _remove_date_tail(raw)).strip(" -|｜:：")
        if 4 <= len(normalize_text(title)) <= 180 and not title_is_generic(title):
            return title
    return ""


def _fetch_page(session: requests.Session, url: str) -> requests.Response:
    response = session.get(url, timeout=REQUEST_TIMEOUT_SECONDS, allow_redirects=True)
    if response.status_code == 403:
        # WAF対策として、より一般的なブラウザヘッダーで1回だけ再試行する。
        parsed = urlparse(url)
        retry_headers = {
            "User-Agent": USER_AGENT,
            "Referer": f"{parsed.scheme}://{parsed.netloc}/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
        }
        response = session.get(url, headers=retry_headers, timeout=REQUEST_TIMEOUT_SECONDS, allow_redirects=True)
    response.raise_for_status()
    return response


def scrape_source(session: requests.Session, source: dict, today: date) -> tuple[list[dict], dict]:
    source_urls = source.get("urls") or [source["url"]]
    status = {
        "key": source["key"],
        "venue": source["venue"],
        "url": source_urls[0],
        "ok": False,
        "httpStatus": None,
        "candidateCount": 0,
        "error": "",
    }
    by_url: dict[str, Candidate] = {}
    page_errors: list[str] = []
    ok_pages = 0
    http_statuses: list[int] = []

    for source_url in source_urls:
        try:
            response = _fetch_page(session, source_url)
            http_statuses.append(response.status_code)
            ok_pages += 1
            soup = BeautifulSoup(response.text, "html.parser")
            for anchor in soup.find_all("a", href=True):
                href = anchor.get("href", "")
                if not link_allowed(href, source, source_url):
                    continue
                block = find_date_block(anchor)
                if block is None:
                    continue
                text = clean_space(block.get_text(" ", strip=True))
                dr = parse_date_range(text)
                if not dr:
                    continue
                start, end = dr
                sd, ed = date.fromisoformat(start), date.fromisoformat(end)
                if ed < today - timedelta(days=PAST_GRACE_DAYS):
                    continue
                if sd > today + timedelta(days=FUTURE_HORIZON_DAYS):
                    continue

                title = pick_title(anchor, block)
                if not title:
                    continue
                normalized = normalize_text(title)
                if any(normalize_text(word) in normalized for word in GLOBAL_EXCLUDES + source.get("exclude_title", [])):
                    continue

                url = canonical_url(urljoin(source_url, href))
                if url in {canonical_url(x) for x in source_urls}:
                    continue
                digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:10]
                by_url[url] = Candidate(
                    id=f"auto-{source['key']}-{digest}",
                    title=title,
                    venue=source["venue"],
                    area=source["area"],
                    start=start,
                    end=end,
                    official=url,
                    source_key=source["key"],
                )
        except Exception as exc:
            page_errors.append(f"{source_url}: {type(exc).__name__}: {exc}")

    items = sorted(
        (x.to_dict() for x in by_url.values()),
        key=lambda x: (x["start"], x["venue"], x["title"]),
    )
    status["httpStatus"] = http_statuses[-1] if http_statuses else None
    status["candidateCount"] = len(items)
    status["ok"] = ok_pages > 0
    if page_errors:
        status["error"] = " | ".join(page_errors)
    return items, status

def scrape_all(sources: list[dict], today: date) -> tuple[list[dict], list[dict]]:
    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept-Language": "ja,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml",
    })
    all_items: list[dict] = []
    statuses: list[dict] = []
    for source in sources:
        items, status = scrape_source(session, source, today)
        all_items.extend(items)
        statuses.append(status)
        print(f"{source['key']}: {'OK' if status['ok'] else 'WARN'} / {len(items)} candidates")
        if status["error"]:
            print(f"  {status['error']}")
    return all_items, statuses
