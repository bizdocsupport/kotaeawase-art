答え合わせ美術部｜展覧会画像の公式ビジュアル差し替え（続き）

■ 変更内容
1. 展覧会データ（docs/assets/js/exhibitions-data.js）を更新
   - 以下の展覧会カード画像を、公式ビジュアル/公式ポスターに差し替え
     - “カフェ”に集う芸術家
     - 版画家レンブラント
     - 大英博物館日本美術コレクション 百花繚乱
     - シンシナティ美術館展
     - 禅とジブリ
     - アンドリュー・ワイエス展
     - 躍動する明代の書
     - フォンタネージ
     - WHOSE LIGHT?
     - ターナー展
     - オルセー美術館所蔵 いまを生きる歓び
   - 画像の見え方調整のため imagePosition / imageAlt も設定

2. 新規追加画像（ローカル保存）
   - docs/assets/images/exhibition-official/cafe-artists-2026-official.png
   - docs/assets/images/exhibition-official/rembrandt-etcher-2026-official.png
   - docs/assets/images/exhibition-official/british-museum-edo-2026-official.png
   - docs/assets/images/exhibition-official/turner-2026-official.png

■ 補足
- 一部はローカル保存した公式ポスター画像を使用。
- 一部は公式サイトの画像URLを直接参照（公式引用）しています。
- もし表示されない画像があれば、その展覧会だけローカル保存方式に切り替える追加パッチを作れます。

■ 反映方法
1. ZIPを展開
2. 中のファイルをそのままリポジトリ同パスへ上書き
3. コミット＆デプロイ
