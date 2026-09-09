フェルメール特集5本 反映修正版（差分ZIP）

現行 column.zip を基準に作成。

上書き対象:
- column/index.html  ← フェルメール特集5本を一覧へ直接追加
- column/assets/column.css ← 一覧特集ブロック用CSS追加
- column/assets/vermeer-feature.css
- column/vermeer-ticket-hard-to-get.html
- column/vermeer-ticket-resale.html
- column/girl-with-a-pearl-earring-popularity.html
- column/girl-with-a-pearl-earring-famous.html
- column/vermeer2026-highlights.html

今回の修正点:
- _patch_snippets に置くだけではなく index.html 本体へ直接反映
- COLUMN版 今日の一枚 の直下に「フェルメール《真珠の耳飾りの少女》展」5記事を表示
- index.html の構造化データのコラム本数を51→56へ更新
- column.css を v1.8 に更新してブラウザキャッシュを回避

配置: サーバーの /art/column/ にこのZIPの column/ 以下を同じ階層で上書きしてください。
