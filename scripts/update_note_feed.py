#!/usr/bin/env python3
"""Fetch public note RSS into a tiny JSON file consumed by static pages.

Only titles, canonical URLs, posting dates, thumbnails and a short excerpt
are retained; full note text remains on note. No third-party Python packages.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit, urlunsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

FEED_URL = "https://note.com/kotaeawase_art/rss"
AUTHOR = "kotaeawase_art"
MAX_ITEMS = 12
MAX_FEED_BYTES = 2_000_000


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.skipping = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skipping += 1
        elif tag in ("br", "p", "div", "li"):
            self.parts.append(" ")

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skipping = max(0, self.skipping - 1)
        elif tag in ("p", "div", "li"):
            self.parts.append(" ")

    def handle_data(self, data):
        if not self.skipping:
            self.parts.append(data)


def clean_text(value: str, max_length=138) -> str:
    parser = PlainText()
    parser.feed(value or "")
    text = re.sub(r"\s+", " ", "".join(parser.parts)).strip()
    if len(text) > max_length:
        text = text[: max_length - 1].rstrip(" 、。 ") + "…"
    return text


def safe_article_url(url: str) -> str:
    try:
        s = urlsplit(url.strip())
        if s.scheme != "https" or s.hostname != "note.com":
            return ""
        if not re.fullmatch(r"/kotaeawase_art/n/n[a-zA-Z0-9]+/?", s.path):
            return ""
        return urlunsplit(("https", "note.com", s.path.rstrip("/"), "", ""))
    except ValueError:
        return ""


def safe_image_url(url: str) -> str:
    try:
        s = urlsplit((url or "").strip())
        # Only publicly hosted images; a failed image falls back to a title card.
        if s.scheme != "https" or not s.hostname:
            return ""
        if s.hostname not in ("assets.st-note.com", "note.com", "image.note.com", "images.note.com") and not s.hostname.endswith(".st-note.com"):
            return ""
        return urlunsplit(s)
    except ValueError:
        return ""


def pick_image(item: ET.Element, raw_description: str) -> str:
    # note feeds commonly use media:thumbnail or media:content.
    for child in list(item):
        name = child.tag.rsplit("}", 1)[-1]
        if name in ("thumbnail", "content", "enclosure"):
            url = child.attrib.get("url", "")
            good = safe_image_url(url)
            if good:
                return good
    class ImgFinder(HTMLParser):
        src = ""

        def handle_starttag(self, tag, attrs):
            if tag == "img" and not self.src:
                self.src = dict(attrs).get("src", "")

    finder = ImgFinder()
    finder.feed(raw_description)
    return safe_image_url(finder.src)


def iso_date(value: str) -> str:
    try:
        dt = parsedate_to_datetime(value)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    except (ValueError, TypeError):
        return ""


def parse_rss(rss_bytes: bytes) -> list[dict]:
    if len(rss_bytes) > MAX_FEED_BYTES:
        raise ValueError("RSS exceeds size limit")
    root = ET.fromstring(rss_bytes)
    if root.tag != "rss":
        raise ValueError("Expected an RSS feed")
    channel = root.find("channel")
    if channel is None:
        raise ValueError("RSS channel missing")
    articles = []
    seen = set()
    for entry in channel.findall("item"):
        url = safe_article_url(entry.findtext("link", ""))
        if not url or url in seen:
            continue
        title = clean_text(entry.findtext("title", ""), 120)
        if not title:
            continue
        desc = entry.findtext("description", "") or ""
        articles.append({
            "title": title,
            "url": url,
            "publishedAt": iso_date(entry.findtext("pubDate", "")),
            "image": pick_image(entry, desc),
            "excerpt": clean_text(desc),
        })
        seen.add(url)
    articles.sort(key=lambda a: a["publishedAt"], reverse=True)
    return articles[:MAX_ITEMS]


def output_path() -> Path:
    # This repository serves docs/ as https://hillslife.tokyo/art/.
    return Path(__file__).resolve().parents[1] / "docs/assets/data/note-latest.json"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=None)
    parser.add_argument("--rss-file", type=Path, default=None, help="local XML test fixture")
    args = parser.parse_args()
    dest = args.out or output_path()
    if args.rss_file:
        raw = args.rss_file.read_bytes()
    else:
        req = Request(FEED_URL, headers={"User-Agent": "KotaeawaseArtClubRSS/1.0 (+https://hillslife.tokyo/art/)", "Accept": "application/rss+xml, application/xml, text/xml"})
        with urlopen(req, timeout=25) as response:
            raw = response.read(MAX_FEED_BYTES + 1)
    items = parse_rss(raw)
    if not items:
        raise ValueError("No valid public note articles in RSS; keeping existing cache")
    current = None
    if dest.exists():
        try:
            current = json.loads(dest.read_text("utf-8"))
        except (ValueError, OSError):
            pass
    if current and current.get("articles") == items and current.get("updatedAt"):
        print(f"Unchanged ({len(items)} articles): {dest}")
        return
    payload = {
        "source": FEED_URL,
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "articles": items,
    }
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(dest)
    print(f"Updated {len(items)} articles: {dest}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"RSS synchronization failed; existing file retained: {exc}", file=sys.stderr)
        sys.exit(1)
