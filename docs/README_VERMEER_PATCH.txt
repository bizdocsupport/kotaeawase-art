答え合わせ美術部｜フェルメール5記事 差分パッチ
作成日: 2026-08-18

【追加ファイル】
art/column/vermeer-ticket-hard-to-get.html
art/column/vermeer-ticket-resale.html
art/column/girl-with-a-pearl-earring-popularity.html
art/column/girl-with-a-pearl-earring-famous.html
art/column/vermeer2026-highlights.html
art/column/assets/vermeer-feature.css

【各HTMLに実装済み】
- 記事内目次（アンカーリンク）
- 関連記事4本
- SEO title / meta description / canonical
- Open Graph / Twitter Card基本メタ
- JSON-LD Article
- JSON-LD BreadcrumbList
- 2026-08-18時点の公式チケット情報に更新
- 公式サイト・マウリッツハイス美術館への参考リンク

【既存index.htmlについて】
現行の art/column/index.html の実ファイルが今回の作業環境に無いため、既存ページを推測で上書きして壊さないよう index.html はZIPに含めていません。
代わりに次を同梱しています。
art/column/_patch_snippets/vermeer-index-section.html
→ 現行の読みものTOPで「COLUMN版 今日の一枚」と「BROWSE BY CATEGORY」の間に貼る想定です。
5記事を特集カードとしてまとめて表示します。

【sitemap】
art/column/_patch_snippets/sitemap-urls.xml
→ 既存 sitemap.xml の <urlset> 内へ5つの <url> を追加してください。

【アップロード】
ZIP内の art フォルダを、サーバー上の既存 art フォルダへ「上書き/統合」してください。
新規ファイルだけなので既存記事は削除・上書きしません。
その後、上記 index 用断片と sitemap 用断片を現行ファイルへ追記します。

【重要】
前稿で言及していた「2012年の日本だけで約120万人」は一次情報で確認できなかったため、本パッチでは使用していません。
チケット日程は2026-08-18時点の展覧会公式情報に合わせています。
