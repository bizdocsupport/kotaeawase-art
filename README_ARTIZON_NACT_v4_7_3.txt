答え合わせ美術部｜アーティゾン美術館・国立新美術館の取得・画像反映修正 v4.7.3

【今回直した原因】
- 展覧会の汎用OGP画像が一度取得されると、個別に指定した公式画像への修正がスキップされる。
- 自動公開JS生成時、個別補完画像のimageAlt／imagePositionが保持されない。
- 一覧のHTMLが変わって候補0件でも、HTTP200だけで取得成功と記録される。

【修正内容】
1. アーティゾン美術館（瀧口修造・エトランゼたち）と国立新美術館（少女漫画・インフィニティ）は、展覧会IDまたは公式詳細URLに一致する場合、個別画像設定を優先（force=true）。別の展覧会への誤適用は行わない。
2. 公式ページと日程一覧の両方を確認し、本文内の「会期」を詳細ページで照合。HTTPが成功しても候補0件なら異常として記録し、前回の有効な候補を保持。
3. 自動生成の画像代替テキスト・表示位置を維持。

【GitHubへの反映】
ZIPを解凍し、同名ファイルをリポジトリ直下に配置・上書きしてコミットしてください。
このZIPには docs/index.html、docs/exhibitions.html、公開済みJS、note連携のファイルは含めていません。

【実行】
Actions → Update exhibition data → Run workflow
「Scan official museum sites」「Build site auto exhibition data」「Publish updated exhibition JS only」が緑になることを確認。
全体デプロイ（Manual deploy）は不要です。

【確認先】
公開後、https://hillslife.tokyo/art/exhibitions.html を強制再読み込み。
データの取得状況は GitHubの data/exhibitions-source-status.json で nact/artizon を確認。
画像URLが出力されたかは docs/assets/js/exhibitions-auto.js で展覧会名と image を検索。
画像の元サイトが外部表示を拒否すると、URLが正しくても表示できない場合があります。その場合は対象の画像URL・利用条件の確認が必要です。

【補足】
このパッチは、ユーザーがアップロードした kotaeawase-art-main.zip + 既存v4.7～v4.7.2の差分に対して作成。
実サイトのFTPと画像のアクセス結果はGitHub Actions実行後に確認してください。
