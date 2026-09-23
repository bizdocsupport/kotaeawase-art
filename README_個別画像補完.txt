答え合わせ美術部｜画像の残り5件 個別補完 v4.7.2（2026-09-23）
対象：「開催中」3件 ＋「もうすぐ始まる」2件

【導入手順】
このZIPを解凍し、GitHub bizdocsupport/kotaeawase-art のリポジトリ直下へ3ファイルを配置／上書きしてコミットします。
  tools/build_exhibitions_auto_js.py
  data/exhibition-image-curated-overrides.json  （新規）
  tests/test_exhibition_curated_images.py          （新規）
※READMEは参考です。既存の data/exhibition-image-overrides.json は上書きしないでください。

次に Actions → Update exhibition data → Run workflow を実行。
「Build site auto exhibition data」と「Publish updated exhibition JS only」が緑色になれば反映。
自動更新Actionsが生成した docs/assets/js/exhibitions-auto.js をFTPで転送するので、Manual deployの実行は不要です。

【補完対象と画像掲載元】
■ 開催中
  瀧口修造「書くことと描くこと」：東京観光公式サイトの展覧会ポスター
  「この場所の風景」：東京都歴史文化財団の公式プレス画像
  松延総司「壁」：京都市京セラ美術館公式サイト《私の石》画像
■ もうすぐ始まる
  エトランゼたち：アーティゾン美術館公式サイト。公開ページから《針仕事》を優先探索し、公式ビジュアルを予備URLに設定
  少女漫画・インフィニティ：国立新美術館公式の展覧会画像

【既存機能を守る設計】
- すでに自動取得できている画像・手動マスタの公式画像は上書きしません。
- 新しい個別補完ファイルだけを追加するため、これまでの画像候補・note連携・GitHub FTP設定はそのままです。
- 自動生成JSを書き換えるのではなく、生成スクリプトに追加するため、翌日以降の定期更新でも保持されます。
- 自動生成IDが変わっても、公式ページURLの完全一致で補完可能です。
- HTMLページやCSSは変更していません。

【画像の取り扱い】
掲載画像は各主催者・美術館等の公開元を参照する方式。直接表示を禁止するサーバー設定や画像URLの変更により表示できない可能性があります。
公式サイトで公開されていることは、転載・再利用の包括的な許諾を意味しません。主催者の利用規約、出品作家・撮影者・版元等の権利表記を確認してください。
