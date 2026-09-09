# Phase 2A.1 — 展覧会自動取得の精度改善

Phase 2A 初回実行で確認できた以下を修正します。

- 「過去の展覧会」「展覧会スケジュール」などナビ項目の誤取得を除外
- 一覧リンク自体に「タイトル＋会期」が入るサイトを正しく解析
- 大阪中之島美術館の詳細URLを `/exhibition-post/` として認識
- 美術館ごとの詳細ページURLパターンを限定し、一覧・過去・検索ページを除外
- 国立西洋美術館とSOMPO美術館は複数の公式一覧ページを監視
- 三菱一号館美術館はトップではなく `/exhibition/` を監視
- 403対策としてブラウザ相当User-Agent＋1回再試行

## 適用

ZIPの中身をリポジトリ直下へ上書きし、GitHub DesktopでCommit/Pushしてください。

推奨Commit名:

`Refine exhibition scraper accuracy`

Push後:

Actions → Update exhibition candidates → Run workflow

実行後、`data/exhibitions-review.md` を確認してください。

Phase 2A.1でも `docs/` は変更しません。本番サイトへの自動反映はまだありません。
