# 答え合わせ美術部：SNSカード画像対応（差分ZIP）

このパッチは、前に生成した**黒髪・短髪の中性的な美少年が美術館で絵画を鑑賞する画像**を、トップページと展覧会一覧のSNSリンクカードに使います。

## 更新対象

- `docs/assets/images/web/og-social-card-v1.jpg`（1200×630、JPEG）
- `docs/index.html`（スクリプトで、OGP/Twitterメタタグのみ追加）
- `docs/exhibitions.html`（同上）

**既存のHTMLそのものを古い版で上書きしない**ため、ZIPにはHTMLを同梱していません。`tools/apply_social_card.py` が、PCの最新HTMLへ画像タグだけ安全に挿入します。ページの見た目・JS・展覧会自動更新には触りません。

## 適用手順（Windows）

1. ZIPの中身をすべて `C:\hillslife-github\kotaeawase-art\` の直下に上書きコピーします。`docs` と `tools` が同じ階層です。
2. コピー先の `APPLY_SOCIAL_CARD.bat` をダブルクリックします。`[OK] docs/index.html` と `[OK] docs/exhibitions.html` が出れば完了です（Pythonが必要）。**2回実行しても二重登録されません。**
3. GitHub Desktopで変更ファイルを確認し、`Add site OG image for social cards` でCommit → Push origin。
4. Actions → Manual deploy to Onamae.com → `dry-run` → Success後に `deploy` を実行。
5. 公開後 `https://hillslife.tokyo/art/assets/images/web/og-social-card-v1.jpg` が画像として表示されることを確認します。

## 確認ポイント

- `view-source:https://hillslife.tokyo/art/` に `og:image` と `twitter:card` があること。
- X・LINE・Facebookなどのリンクプレビューは各サービスのキャッシュ更新後に表示が変わります。画像が出ない場合、まず画像URLが直接開けるか確認してください。
- この画像はサイトのページ内に追加するものではなく、共有されたリンクのカード画像です。
