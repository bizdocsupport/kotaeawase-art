V3.04.4 → V3.04.5 差分

修正内容
- beginner.html 冒頭の代表画像（#13）が縦長に引き伸ばされ、巨大な余白ができる表示崩れを修正
- 原因：img要素の height="1350" がCSSのwidth変更後も残っていたため
- .beginner-index-feature img に height:auto を追加
- CSSキャッシュ対策として styles.css?v=3.045 に更新

適用方法
現在の /art/ へフォルダ構造を保ったまま上書きしてください。
削除ファイルはありません。
