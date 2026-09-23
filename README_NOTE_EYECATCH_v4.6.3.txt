答え合わせ美術部 | note 見出し画像の自動取得パッチ v4.6.3
====================================
現状：note RSS で画像URLが取れない記事（例：最近の3記事）が
トップ・読みもののカードで「note／答え合わせ美術部」の代替表示になっている。

【修正内容】
RSSに画像URLがない記事は、note記事ページをGitHub Actions側で取得して
<meta property="og:image" ...> を参照する。取得できたnote CDNの画像URLを
既存の note-latest.json に設定して、既存ワークフローで公開する。

取得の優先順位：
1. RSS が提供する画像
2. 前回正常取得した画像（通信失敗でも保持）
3. 該当note記事のOGP見出し画像（HTTPS、noteの画像CDNのみ）
4. 画像が無い・アクセスできない場合は従来の代替表示を維持

【変更ファイル／リポジトリ直下に配置】
  scripts/update_note_feed.py
  tests/test_note_feed.py
上記2ファイルだけ置き換える。既存のJSON、HTML、CSS、
JS、GitHub Actions設定は変更・上書きしない。
トップと「読みもの」はすでに画像表示に対応しており、CSSは object-fit:contain。

【反映手順】
1. ZIPを展開し、GitHubリポジトリのルートで同じ位置の2ファイルを上書きしてコミット。
   過去の「Commit failed」を避けるなら2ファイルを個別に編集・保存しても可。
2. GitHub > Actions > Sync note latest articles > Run workflow > main を実行。
3. 完了後 https://hillslife.tokyo/art/assets/data/note-latest.json を開き、
   articles先頭3件のimageに https://assets.st-note.com/... が入ったことを確認。
4. トップを強制更新（Ctrl+F5）、または https://hillslife.tokyo/art/?v=note463
   で確認。フルサイトの手動デプロイは不要（note同期がJSONだけFTP送信）。

【注意】
・GitHub Actionsからnote.comの記事HTMLを取得できない場合は空欄のままです。
  Actionsの「Fetch note RSS」ログに画像取得失敗が出ます。既存の一覧は保持。
・noteで見出し画像を未設定のとき、本文からnote内の一覧に自動表示される
  サムネイルはOGPに含まれません。必要なら記事に見出し画像を設定してください。
・画像はユーザー自身のnoteの公開画像URLを直接表示します。
・このZIP自体はGitHub・FTPへの反映を実行しません。
・ローカルで12件のユニットテスト通過（note.comへの本番アクセスは未検証）。
