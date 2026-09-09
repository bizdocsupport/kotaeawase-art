#!/usr/bin/env python3
"""公式美術館ページから展覧会候補を抽出する。

Phase 2A.2:
- 通常は requests で高速取得
- 403 / 0件になりやすい館だけ Playwright(Chromium) でフォールバック
- 終了済み展覧会は候補に残さない
- docs/ は変更しない
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


def find_date_block(anchor, max_levels: int = 8):
    """リンク自身→親へたどり、日付範囲を含む最小ブロックを返す。"""
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
        if len(text) > 2200:
            break
        if parse_date_range(text):
            # サイト全体ナビのような巨大ブロックは候補カードとして扱わない。
            if len(node.find_all("a", href=True)) > 12:
                continue
            fallback = node
            if getattr(node, "name", "") in {"article", "li", "section", "div"}:
                # div は汎用的だが、リンク数が少ない場合だけここまで来るので採用可。
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
    for tag_name in ("h1", "h2", "h3", "h4", "h5", "strong", "dt"):
        tag = block.find(tag_name)
        if tag:
            candidates.append(clean_space(tag.get_text(" ", strip=True)))
    candidates.append(_remove_date_tail(clean_space(block.get_text(" ", strip=True))))

    for raw in candidates:
        title = LEADING_STATUS_RE.sub("", _remove_date_tail(raw)).strip(" -|｜:：")
        if 4 <= len(normalize_text(title)) <= 180 and not title_is_generic(title):
            return title
    return ""


def candidate_in_window(start: str, end: str, today: date) -> bool:
    """本番候補は『今日終了』を含む現在・未来のみ。終了済みは残さない。"""
    sd, ed = date.fromisoformat(start), date.fromisoformat(end)
    if ed < today - timedelta(days=PAST_GRACE_DAYS):
        return False
    if sd > today + timedelta(days=FUTURE_HORIZON_DAYS):
        return False
    return True


def extract_candidates(html: str, source: dict, source_url: str, today: date) -> dict[str, Candidate]:
    soup = BeautifulSoup(html, "html.parser")
    by_url: dict[str, Candidate] = {}
    source_urls = source.get("urls") or [source.get("url", source_url)]
    source_url_set = {canonical_url(x) for x in source_urls}

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
        if not candidate_in_window(start, end, today):
            continue

        title = pick_title(anchor, block)
        if not title:
            continue
        normalized = normalize_text(title)
        if any(normalize_text(word) in normalized for word in GLOBAL_EXCLUDES + source.get("exclude_title", [])):
            continue

        url = canonical_url(urljoin(source_url, href))
        if url in source_url_set:
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
    return by_url


def _fetch_page(session: requests.Session, url: str) -> requests.Response:
    response = session.get(url, timeout=REQUEST_TIMEOUT_SECONDS, allow_redirects=True)
    if response.status_code == 403:
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


class LazyBrowser:
    """必要になったときだけChromiumを起動する。"""

    def __init__(self) -> None:
        self._pw = None
        self._browser = None
        self._context = None

    def fetch(self, url: str) -> tuple[str, int | None]:
        if self._pw is None:
            from playwright.sync_api import sync_playwright

            self._pw = sync_playwright().start()
            self._browser = self._pw.chromium.launch(headless=True)
            self._context = self._browser.new_context(
                user_agent=USER_AGENT,
                locale="ja-JP",
                viewport={"width": 1365, "height": 900},
            )
        page = self._context.new_page()
        try:
            response = page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=REQUEST_TIMEOUT_SECONDS * 1000,
            )
            # JavaScript描画型ページのカードが出る時間を少しだけ待つ。
            page.wait_for_timeout(1500)
            status = response.status if response else None
            if status is not None and status >= 400:
                raise RuntimeError(f"browser HTTP {status}")
            return page.content(), status
        finally:
            page.close()

    def close(self) -> None:
        if self._context is not None:
            self._context.close()
        if self._browser is not None:
            self._browser.close()
        if self._pw is not None:
            self._pw.stop()
        self._context = self._browser = self._pw = None


def scrape_source(
    session: requests.Session,
    source: dict,
    today: date,
    browser: LazyBrowser,
) -> tuple[list[dict], dict]:
    source_urls = source.get("urls") or [source["url"]]
    status = {
        "key": source["key"],
        "venue": source["venue"],
        "url": source_urls[0],
        "ok": False,
        "httpStatus": None,
        "candidateCount": 0,
        "fetchMethod": "",
        "warning": "",
        "error": "",
    }
    by_url: dict[str, Candidate] = {}
    hard_errors: list[str] = []
    warnings: list[str] = []
    methods: list[str] = []
    http_statuses: list[int] = []
    ok_pages = 0

    for source_url in source_urls:
        page_items: dict[str, Candidate] = {}
        http_error: Exception | None = None

        try:
            response = _fetch_page(session, source_url)
            http_statuses.append(response.status_code)
            page_items = extract_candidates(response.text, source, source_url, today)
            ok_pages += 1
            methods.append("HTTP")
        except Exception as exc:
            http_error = exc

        use_browser = bool(source.get("browser_fallback")) and (http_error is not None or not page_items)
        if use_browser:
            try:
                html, browser_status = browser.fetch(source_url)
                if browser_status is not None:
                    http_statuses.append(browser_status)
                rendered_items = extract_candidates(html, source, source_url, today)
                if rendered_items:
                    page_items = rendered_items
                ok_pages += 1 if http_error is not None else 0
                methods.append("BROWSER")
                if http_error is not None:
                    warnings.append(f"HTTP取得失敗→ブラウザ取得成功: {source_url}: {type(http_error).__name__}: {http_error}")
                elif not page_items:
                    warnings.append(f"ブラウザ取得も候補0件: {source_url}")
            except Exception as browser_exc:
                if http_error is not None:
                    hard_errors.append(
                        f"{source_url}: HTTP={type(http_error).__name__}: {http_error}; "
                        f"BROWSER={type(browser_exc).__name__}: {browser_exc}"
                    )
                else:
                    warnings.append(f"ブラウザ再取得失敗（HTTP自体は成功）: {source_url}: {type(browser_exc).__name__}: {browser_exc}")
        elif http_error is not None:
            hard_errors.append(f"{source_url}: {type(http_error).__name__}: {http_error}")

        by_url.update(page_items)

    items = sorted(
        (x.to_dict() for x in by_url.values()),
        key=lambda x: (x["start"], x["venue"], x["title"]),
    )
    status["httpStatus"] = http_statuses[-1] if http_statuses else None
    status["candidateCount"] = len(items)
    status["ok"] = ok_pages > 0 and not (not items and hard_errors)
    status["fetchMethod"] = "+".join(dict.fromkeys(methods)) or "-"
    status["warning"] = " | ".join(warnings)
    if hard_errors and not status["ok"]:
        status["error"] = " | ".join(hard_errors)
    elif hard_errors:
        status["warning"] = " | ".join([x for x in [status["warning"], *hard_errors] if x])
    return items, status


def scrape_all(sources: list[dict], today: date) -> tuple[list[dict], list[dict]]:
    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept-Language": "ja,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml",
    })
    browser = LazyBrowser()
    all_items: list[dict] = []
    statuses: list[dict] = []
    try:
        for source in sources:
            items, status = scrape_source(session, source, today, browser)
            all_items.extend(items)
            statuses.append(status)
            method = status.get("fetchMethod") or "-"
            print(f"{source['key']}: {'OK' if status['ok'] else 'WARN'} / {len(items)} candidates / {method}")
            if status.get("warning"):
                print(f"  warning: {status['warning']}")
            if status.get("error"):
                print(f"  error: {status['error']}")
    finally:
        browser.close()
    return all_items, statuses
