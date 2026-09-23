答え合わせ美術部 | note自動同期 FTP 550 エラー修正 v4.6.4

現象
GitHub Actions > Sync note latest articles の Fetch note RSS は成功するが、
Publish note JSON only (no full-site deploy) にて
  mkdir: Access failed: 550 Can't create directory: File exists (assets/data)
で停止する。

原因
公開サーバーの assets/data は既に存在し、
一部FTPサーバーでは lftp の mkdir -p に対しても550が返るため。

変更内容（1ファイルだけ）
  .github/workflows/note-rss-sync.yml

既存ディレクトリへ cd してから note-latest.json を上書き。
再作成の mkdir -p を行わない。

反映手順
1. リポジトリ直下の .github/workflows/note-rss-sync.yml だけを上書きしてコミット。
2. Actions > Sync note latest articles > Run workflow (main) を実行。
3. Publish note JSON only が緑色になったら、
   https://hillslife.tokyo/art/assets/data/note-latest.json の image URL を確認。
4. トップページを Ctrl+F5 で再読込。サイト全体のManual deployは不要。

【前提】公開サーバーの assets/data/note-latest.json は現在表示できているため、
遠隔 assets/data ディレクトリは既存です。
【注意】このパッチはFTPエラーだけを修正します。画像URLが空のままなら
Fetch note RSS のログを確認し、OGP画像取得の結果を切り分けてください。
