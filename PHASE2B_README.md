# Phase 2B｜自動取得した展覧会をサイト用データへ反映

Phase 2A.4で取得精度を確認できたため、Phase 2Bでは自動候補をサイトの展覧会一覧で読める形にします。

## 重要：まだFTP自動デプロイはしません

毎朝のGitHub Actionsは次まで自動化します。

1. 12館の公式サイトをスキャン
2. `data/exhibitions-auto.json` を更新
3. `docs/assets/js/exhibitions-auto.js` を自動生成
4. GitHubへ自動commit/push

お名前.comへのFTPは、従来どおり `Manual deploy to Onamae.com` を手動実行します。
本番サイトで問題がないことを確認してからPhase 2CでFTPまで自動化します。

## 手動マスタは保護します

`docs/assets/js/exhibitions-data.js` は一切書き換えません。

- 画像
- 見どころ
- homePriority
- bigPick / large
- チケット日時
- 訪問記録

など、これまで手で作った情報はそのままです。

自動取得分は別ファイル `exhibitions-auto.js` から追記します。
手動マスタに同じ展覧会がある場合は自動分を除外します。

## サイトへ出す範囲

レビュー候補は将来分まで保持しますが、サイト用JSに出すのは次だけです。

- 開催中
- 開始180日以内

180日より先の展覧会は、近づいた時点で自動的にサイト用データへ入ります。

自動カードは `homePriority: -1000` とし、トップページでは従来の手動セレクトを優先します。
展覧会一覧と12館カードでは通常の会期順で表示されます。

## 初回適用手順

1. このZIPをリポジトリ直下へ上書き
2. GitHub Desktopでcommit
   - `Add Phase 2B exhibition site data`
3. Push origin
4. GitHub Actions → `Update exhibition data` → Run workflow
5. 成功後、GitHubの `docs/assets/js/exhibitions-auto.js` を確認
6. `Manual deploy to Onamae.com` をまず `dry-run`
7. 問題なければ `deploy`
8. `https://hillslife.tokyo/art/exhibitions.html` を確認

## 安全装置

定期Actionから `docs/` で変更を許可するのは
`docs/assets/js/exhibitions-auto.js` だけです。
他のHTML/CSS/JSが変更された場合はActionをエラー終了します。
