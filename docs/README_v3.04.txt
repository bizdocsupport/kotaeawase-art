答え合わせ美術部 V3.04 差分パッチ
================================

対象：V3.03 → V3.04

■ 変更内容
1. assets/images/beginner/ に 01.webp～50.webp を追加
2. beginner.html を新設
   - #01～#50を番号順に画像カード表示
   - 各画像にalt
   - 各カードにHTMLタイトル＋一言の答え合わせ
   - 画像クリックで1080×1350のWebPを大きく表示
3. museum-beginner.html を25件→50件へ拡張
   - #26～#50の本文を追加
   - 「50枚の画像で見る」導線を追加
4. index.html の「美術館初心者あるある」を強化
   - おすすめ6枚（#01 / #13 / #17 / #25 / #37 / #45）だけ表示
   - 「50個すべて見る」→ beginner.html
   - 「文章で詳しく読む」→ museum-beginner.html
5. assets/css/styles.css にV3.04用レイアウトを追加
6. ヘッダー・ナビ・ブランドキャラクター等の既存ブランドデザインは変更なし

■ 画像
- 50枚
- 1080×1350px
- WebP
- 1枚 約146～231KB（平均 約177KB）
- lazy loading設定あり

■ 配置方法
このZIPの中身を、公開中の /art/ 直下へ構造を保ったまま上書きしてください。

上書き：
- index.html
- museum-beginner.html
- assets/css/styles.css

新規：
- beginner.html
- assets/images/beginner/01.webp ～ 50.webp

削除するファイルはありません。

■ 公開後の確認URL
https://hillslife.tokyo/art/beginner.html
https://hillslife.tokyo/art/museum-beginner.html
https://hillslife.tokyo/art/
