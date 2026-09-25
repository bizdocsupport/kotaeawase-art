#!/usr/bin/env python3
"""答え合わせ美術部: 既存のHTMLを上書きせずにOGP画像のメタタグだけ追加する。"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
IMAGE = ROOT / "docs/assets/images/web/og-social-card-v1.jpg"
IMAGE_URL = "https://hillslife.tokyo/art/assets/images/web/og-social-card-v1.jpg"
ALT = "美術館で絵画を見つめる、黒髪で中性的な青年のイラスト"
TARGETS = {
    "index.html": "https://hillslife.tokyo/art/",
    "exhibitions.html": "https://hillslife.tokyo/art/exhibitions.html",
}


def patch(path: Path, canonical: str):
    raw = path.read_bytes()
    html = raw.decode("utf-8-sig")
    if f'href="{canonical}"' not in html:
        raise RuntimeError(f"想定外のHTMLのため中止しました: {path} (canonicalが違います)")
    if "og-social-card-v1.jpg" in html:
        required = ('property="og:image"', 'name="twitter:card"', 'name="twitter:image"')
        if all(tag in html for tag in required):
            print(f"[SKIP] 既に設定済み: {path.relative_to(ROOT)}")
            return
        raise RuntimeError(f"画像URLは存在しますが一部タグが不足: {path}。手動で確認してください")
    if re.search(r'<meta\s+[^>]*property=[\'\"]og:image[\'\"]', html, re.I):
        raise RuntimeError(f"既存のOGP画像設定があります。二重登録を防ぐため中止: {path}")
    if re.search(r'<meta\s+[^>]*name=[\'\"]twitter:image[\'\"]', html, re.I):
        raise RuntimeError(f"既存のTwitter画像設定があります。二重登録を防ぐため中止: {path}")
    anchor = re.search(r'<meta\s+property="og:url"\s+content="' + re.escape(canonical) + r'"\s*/?>', html, re.I)
    if not anchor:
        raise RuntimeError(f"OGP URLの位置を特定できず中止: {path}")
    tags = (
        '\n<!-- SNS link preview: shared thumbnail for homepage and exhibitions -->\n'
        f'<meta property="og:image" content="{IMAGE_URL}">\n'
        f'<meta property="og:image:secure_url" content="{IMAGE_URL}">\n'
        '<meta property="og:image:type" content="image/jpeg">\n'
        '<meta property="og:image:width" content="1200">\n'
        '<meta property="og:image:height" content="630">\n'
        f'<meta property="og:image:alt" content="{ALT}">\n'
        '<meta name="twitter:card" content="summary_large_image">\n'
        f'<meta name="twitter:image" content="{IMAGE_URL}">\n'
        f'<meta name="twitter:image:alt" content="{ALT}">\n'
    )
    updated = html[:anchor.end()] + tags + html[anchor.end():]
    # 元HTMLのBOMと改行コードを維持し、追加した行も同じ改行コードにする
    if b'\r\n' in raw and raw.count(b'\r\n') >= raw.count(b'\n') * 0.8:
        updated = updated.replace('\r\n','\n').replace('\n','\r\n')
    encoded = updated.encode('utf-8-sig' if raw.startswith(b'\xef\xbb\xbf') else 'utf-8')
    path.write_bytes(encoded)
    print(f"[OK] {path.relative_to(ROOT)}: OGP/Twitter画像タグを追加")


def main():
    if not IMAGE.is_file():
        raise RuntimeError("画像がありません: docs/assets/images/web/og-social-card-v1.jpg")
    for name, canonical in TARGETS.items():
        target = ROOT / 'docs' / name
        if not target.is_file():
            raise RuntimeError(f"対象HTMLがありません: {target}")
    # どちらか片方だけ更新しないよう、事前に全対象を簡易チェック
    for name, canonical in TARGETS.items():
        text = (ROOT/'docs'/name).read_text(encoding='utf-8-sig')
        if f'href="{canonical}"' not in text:
            raise RuntimeError(f"canonicalの不一致: docs/{name}")
    for name, canonical in TARGETS.items():
        patch(ROOT / 'docs' / name, canonical)
    print("完了。GitHub Desktopで index.html / exhibitions.html / 画像を確認してください。")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        sys.exit(1)
