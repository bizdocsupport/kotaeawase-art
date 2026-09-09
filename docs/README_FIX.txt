答え合わせ美術部 v4 修正差分 2026-08-20

修正1
トップの「展覧会を探す」カードをマウスオーバーした際、共通 a:hover の accent 色が子要素に適用され文字が見えにくくなる問題を修正。

修正2
主要美術展カレンダーの登録を、Google Calendar の直接購読リンク（calendar/r?cid=...）を最初に開く方式へ変更。
従来の「URLで追加」画面を空欄で開く方式はフォールバックへ移動。
「うまく登録できない場合」を押すとICS URLをクリップボードへコピーし、Google Calendarの「URLで追加」画面を開く。

上書き対象
art/index.html
art/exhibitions.html
art/exhibition-detail.html
art/assets/css/site-v4.css
art/assets/js/site-v4.js
art/assets/js/exhibition-calendar.js
