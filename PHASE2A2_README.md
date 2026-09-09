# Phase 2A.2｜12館取得の仕上げ

今回も `docs/` は変更しません。Phase 2Bへ進む前の取得精度改善です。

## 修正内容

- 終了済み展覧会を自動候補から除外（当日終了は残す）
- 東京国立博物館の詳細URL形式を修正
- 東京都現代美術館のslug形式URLに対応
- 東京都美術館 / 東京都現代美術館 / 三菱一号館美術館 / あべのハルカス美術館は、HTTP取得が403または0件の場合のみChromiumで再取得
- 取得レビューに `取得方式`（HTTP / BROWSER）と警告を表示
- 取得失敗時に前回候補を保持する場合も、終了済みデータは持ち越さない

## 適用

ZIP内を `C:\hillslife-github\kotaeawase-art\` へ上書き。

GitHub Desktop:

- Summary: `Improve exhibition scan with browser fallback`
- Commit to main
- Pull origin が出た場合は先に Pull
- Push origin

その後 GitHub の

`Actions → Update exhibition candidates → Run workflow`

を手動実行し、`data/exhibitions-review.md` を確認します。

## 期待する変化

- 2026-06-21終了の「全力！名宝物語」は候補一覧から消える
- 東京国立博物館は「歌川広重 江戸のベストアングル」などを拾える可能性が高い
- 403だった2館は `BROWSER` で成功する可能性がある
- 東京都美術館 / あべのハルカス美術館の0件が改善する可能性がある

403がChromiumでも継続する館は、WAFを無理に回避せず「その館だけ手動確認」に切り替えます。
