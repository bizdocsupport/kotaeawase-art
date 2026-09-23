#!/usr/bin/env python3
"""Official exhibition page -> cautiously selected picture URL.

Uses public metadata only; never modifies curated master and never downloads
copyrighted artwork. Image URL candidates may require venue permission for
republishing/hotlinking. The source page URL is retained for attribution.
"""
from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urljoin, urlsplit

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
AUTO = ROOT / 'data/exhibitions-auto.json'
MANUAL = ROOT / 'docs/assets/js/exhibitions-data.js'
OVERRIDES = ROOT / 'data/exhibition-image-overrides.json'
REVIEW = ROOT / 'data/exhibition-image-review.md'
MAX_PER_RUN = 24
TIMEOUT = 9
BAD_NAMES = re.compile(r'(?:^|[/_\-])(logo|icon|favicon|avatar|spacer|blank|noimage|placeholder|bnr_?common|site_?logo)(?:\.|[/_\-]|$)', re.I)
GOOD_EXT = re.compile(r'\.(?:jpe?g|png|webp|avif)(?:\?|$)', re.I)
META_SELECTORS = (
    ('meta[property="og:image:secure_url"]', 100),
    ('meta[property="og:image"]', 98),
    ('meta[name="twitter:image"]', 88),
    ('link[rel="image_src"]', 84),
)
HEADER = {'User-Agent': 'Mozilla/5.0 (compatible; ArtGuideImagePreview/1.0)', 'Accept-Language': 'ja,en;q=0.8'}


def valid_image_url(raw: str, page_url: str) -> str:
    raw = (raw or '').strip()
    if not raw or raw.startswith(('data:', 'blob:')):
        return ''
    url = urljoin(page_url, raw)
    parsed = urlsplit(url)
    if parsed.scheme not in ('http', 'https') or not parsed.netloc or len(url) > 1500:
        return ''
    if parsed.path.lower().endswith(('.svg', '.gif', '.ico', '.pdf')):
        return ''
    if BAD_NAMES.search(parsed.path):
        return ''
    return url


def extract_official_image(html: str, page_url: str) -> tuple[str, str]:
    """Prefer exhibition-specific OGP, then conspicuous poster/hero elements.

    Returns (URL, evidence). Intentionally does not use generic first image;
    museum home pages commonly advertise unrelated events in their OGP.
    """
    soup = BeautifulSoup(html, 'html.parser')
    for selector, _weight in META_SELECTORS:
        for el in soup.select(selector):
            value = el.get('content') or el.get('href') or ''
            image = valid_image_url(value, page_url)
            if image:
                return image, selector.split('[')[0] + ' ' + selector[selector.find('['):]

    # JSON-LD exhibition/visual artwork images (avoid generic Organization logo)
    for block in soup.select('script[type="application/ld+json"]'):
        try:
            doc = json.loads(block.string or block.text or '')
        except (ValueError, TypeError):
            continue
        nodes = doc if isinstance(doc, list) else [doc]
        for node in nodes:
            if not isinstance(node, dict):
                continue
            nodes_to_scan = node.get('@graph') if isinstance(node.get('@graph'), list) else [node]
            for item in nodes_to_scan:
                if not isinstance(item, dict):
                    continue
                typ = str(item.get('@type', '')).lower()
                if not any(x in typ for x in ('event', 'exhibition', 'visualartwork')):
                    continue
                value = item.get('image')
                if isinstance(value, list): value = value[0] if value else ''
                if isinstance(value, dict): value = value.get('url') or value.get('contentUrl') or ''
                image = valid_image_url(value if isinstance(value, str) else '', page_url)
                if image: return image, 'json-ld'

    # Only obvious key visuals/posters; never the museum's first arbitrary photo.
    for sel in (
        'img[class*="poster" i]', 'img[class*="keyvisual" i]',
        'img[class*="key-visual" i]', 'img[class*="mainvisual" i]',
        'img[class*="main-visual" i]', 'img[class*="exhibition" i]',
        '[class*="poster" i] img', '[class*="keyvisual" i] img',
        '[class*="mainvisual" i] img',
    ):
        for el in soup.select(sel)[:5]:
            src = el.get('data-src') or el.get('data-original') or el.get('src') or ''
            if not src and el.get('srcset'):
                src = el['srcset'].split(',')[-1].strip().split(' ')[0]
            image = valid_image_url(src, page_url)
            if image and GOOD_EXT.search(urlsplit(image).path):
                return image, 'poster/hero'
    return '', ''


def image_accessible(session: requests.Session, image: str, page: str) -> bool:
    """Check for a real image response; tolerate servers that reject HEAD."""
    # The image will be requested from the art site, not the source museum.
    # Check with the same external Referer to avoid publishing obvious 403 hotlinks.
    headers = {'Referer': 'https://hillslife.tokyo/art/exhibitions.html', 'Accept': 'image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8'}
    try:
        response = session.head(image, timeout=TIMEOUT, allow_redirects=True, headers=headers)
        if response.status_code in (403, 405):
            response.close()
            response = session.get(image, timeout=TIMEOUT, allow_redirects=True, headers={**headers, 'Range': 'bytes=0-1023'}, stream=True)
        valid = response.ok and response.headers.get('content-type', '').lower().startswith('image/')
        length = response.headers.get('content-length', '')
        if length.isdigit() and int(length) < 3000:
            valid = False
        response.close()
        return valid
    except requests.RequestException:
        return False


def fetch_image(session: requests.Session, official_url: str) -> tuple[str, str, str]:
    try:
        resp = session.get(official_url, timeout=TIMEOUT, headers=HEADER, allow_redirects=True)
        resp.raise_for_status()
        # Do not accidentally scrape an image/JSON or a redirected generic home page.
        if 'html' not in resp.headers.get('content-type', '').lower():
            return '', '', 'non-HTML official page'
        original_path = urlsplit(official_url).path.rstrip('/')
        redirected_path = urlsplit(resp.url).path.rstrip('/')
        if original_path not in ('', '/') and redirected_path in ('', '/'):
            return '', '', 'redirected to museum homepage'
        resp.encoding = resp.apparent_encoding or 'utf-8'
        image, evidence = extract_official_image(resp.text, resp.url)
        if image and image_accessible(session, image, resp.url):
            return image, evidence, ''
        return '', '', 'no verified official visual'
    except requests.RequestException as exc:
        return '', '', type(exc).__name__


def top_level_objects(text: str) -> list[str]:
    start = text.find('window.KA_EXHIBITIONS')
    if start < 0: return []
    start = text.find('[', start)
    if start < 0: return []
    result=[]; depth=0; obj_start=-1; quote=''; escaped=False
    for i in range(start+1, len(text)):
        ch=text[i]
        if quote:
            if escaped: escaped=False
            elif ch=='\\': escaped=True
            elif ch==quote: quote=''
            continue
        if ch in ('\"', "'"): quote=ch; continue
        if ch=='{':
            if depth==0: obj_start=i
            depth+=1
        elif ch=='}':
            depth-=1
            if depth==0 and obj_start>=0:
                result.append(text[obj_start:i+1]); obj_start=-1
        elif ch==']' and depth==0: break
    return result


def js_field(block: str, name: str) -> str:
    m=re.search(rf'\b{re.escape(name)}\s*:\s*([\'\"])(.*?)\1',block,re.S)
    return m.group(2) if m else ''


def curate_needed(manual_js: str) -> list[dict]:
    result=[]
    for block in top_level_objects(manual_js):
        id_, official = js_field(block, 'id'), js_field(block, 'official')
        image = js_field(block, 'image')
        if not id_ or not official or js_field(block, 'imageId'): continue
        if image and '/exhibition-card/' not in image: continue
        result.append({'id':id_, 'title':js_field(block,'title'), 'official':official})
    return result


def enrich_payload(auto: dict, manual: str, previous: dict, session: requests.Session, today: date, cap=MAX_PER_RUN) -> tuple[dict, dict, list[dict]]:
    """Keep previous usable URLs on fetch failure and throttle network."""
    rows=auto.get('items', [])
    cache={x.get('official'):x for x in rows if x.get('image')}
    overrides=dict(previous)
    report=[]; checked=0
    queues=[]
    for row in rows:
        if not row.get('image') and row.get('official'):
            queues.append(('auto',row))
    for item in curate_needed(manual):
        if item['id'] not in overrides:
            queues.append(('manual',item))
    # Keep rotating the probe window: an inaccessible museum must not starve
    # the remaining exhibitions on every scheduled daily run.
    if len(queues) > cap and cap > 0:
        offset = (today.toordinal() * cap) % len(queues)
        queues = queues[offset:] + queues[:offset]
    for kind, item in queues:
        if checked>=cap: break
        checked+=1
        image, evidence, error=fetch_image(session,item['official'])
        if image:
            if kind=='manual':
                overrides[item['id']]={'image':image,'sourcePage':item['official'],'evidence':evidence}
            else:
                item['image']=image
                item['imageSource']=item['official']
                item['imageEvidence']=evidence
        report.append({'kind':kind, 'id':item['id'],'title':item.get('title',''), 'result':'ok' if image else error,'image':image,'official':item['official']})
    return auto, overrides, report


def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument('--auto-json',type=Path,default=AUTO)
    parser.add_argument('--manual-js',type=Path,default=MANUAL)
    parser.add_argument('--overrides',type=Path,default=OVERRIDES)
    parser.add_argument('--review',type=Path,default=REVIEW)
    parser.add_argument('--limit',type=int,default=MAX_PER_RUN)
    args=parser.parse_args()
    auto=json.loads(args.auto_json.read_text(encoding='utf-8'))
    manual=args.manual_js.read_text(encoding='utf-8')
    previous=json.loads(args.overrides.read_text(encoding='utf-8')) if args.overrides.exists() else {}
    session=requests.Session();session.headers.update(HEADER)
    auto, overrides, report=enrich_payload(auto,manual,previous,session,date.today(),args.limit)
    args.auto_json.write_text(json.dumps(auto,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    args.overrides.parent.mkdir(parents=True,exist_ok=True)
    args.overrides.write_text(json.dumps(overrides,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    review=['# 展覧会の公式画像取得レポート','','公式ページのメタデータを優先して画像URLを取得します。掲載可否や公式サイトの利用条件は別途確認してください。','','| 種別 | 展覧会 | 結果 | 取得画像 |','|---|---|---|---|']
    for r in report:
        title=r['title'].replace('|','｜')
        review.append(f"| {r['kind']} | {title} | {r['result']} | {r['image'] or '-'} |")
    args.review.write_text('\n'.join(review)+'\n',encoding='utf-8')
    print(f'image scan: checked={len(report)}; new={sum(r["result"]=="ok" for r in report)}; pending={len([r for r in report if r["result"]!="ok"])}')
    return 0

if __name__=='__main__': raise SystemExit(main())
