答え合わせ美術部｜展覧会の公式画像URLを自動取得する差分 v4.7.0

【解決する問題】
前の自動取得では開催情報だけを取っており、生成JSが全自動候補の image を空文字に固定していました。公式URLがあるのに画像が空になる問題を直します。既存の手動展覧会で汎用の仮ポスター画像（assets/images/exhibition-card/）を使っているものも画像候補の対象とします。

【仕組み】
- 展覧会詳細ページから og:image:secure_url → og:image → twitter:image → JSON-LD → ポスター/キービジュアル の順に画像候補を探す。
- ロゴ、アイコン、SVG、GIF、極端に小さい画像などを除き、HTTPで画像として取得できるか確認する。
- 自動展覧会は data/exhibitions-auto.json に画像URLと出典ページを保存する。
- 既存の手動展覧会は data/exhibition-image-overrides.json に画像URLと出典ページを保存する。元の exhibitions-data.js は書き換えません。
- tools/build_exhibitions_auto_js.py が公開用 JS 生成時に、仮画像／無画像のみ公式画像へ置き換える。
- GitHub Actions は自動データをコミットし、FTPで docs/assets/js/exhibitions-auto.js の１ファイルだけを公開サイトへ転送する。
- FTPではディレクトリを作り直さず既存 assets/js/ に直接 put する（以前の550エラー対策）。

【適用】
1. このZIPのフォルダ構成を維持して、GitHubリポジトリ直下へ展開・コミット（元からある他のファイルは削除しない）。
2. Actions → Update exhibition data → Run workflow（ブランチ main）。
3. すべて緑で完了したらサイトの「展覧会」で画像を確認。生成JSだけ自動FTP転送されるため Manual deploy は原則不要。
4. data/exhibition-image-review.md に各ページの画像取得成否が記録される。取得できなかった展覧会は既存の仮画像のまま。

【補足・注意】
- 画像URLの発見・画像としての応答を確認する方式で、実際の引用条件や掲載許諾までは自動判定できません。運用前に各美術館・主催者のプレス素材利用条件をご確認ください。公開時には公式URLへの導線を残します。
- 相手サイトが外部参照を禁止している、画像をJavaScriptで動的描画している、OGPが美術館共通画像だけを返す等の場合は自動取得を見送ります。画像が確実に出るとは限りません。
- 画像ファイル自体はこのZIPでは複製しません。公式画像URLを使用する方式です。
- 1回の実行で最大24件調査。全候補が入りきらない場合は、日を変えて異なる候補を調べます。
- 今回のZIPはトップ・note・初心者あるある・既存の手動展覧会データを上書きしません。
- GitHub公開版で FTP secrets が設定されていない場合、JSON/JS生成までは成功してFTP転送だけスキップします。
