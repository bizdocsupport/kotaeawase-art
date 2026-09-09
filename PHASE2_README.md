# 答え合わせ美術部 — Git移行 Phase 2A

## 今回の目的

12館の公式サイトから展覧会候補を毎朝自動取得し、GitHub上でレビューできるようにします。

**Phase 2Aでは本番サイトを自動変更しません。**

- `docs/` は変更しない
- FTPデプロイは呼ばない
- 自動取得結果は `data/` にだけ保存
- 既存の手動展覧会データを優先し、重複候補を除外
- 1館が取得失敗しても他館の処理は継続
- 取得失敗した館は前回データを保持

## FC東京サイトと合わせた構成

```text
kotaeawase-art/
├─ .github/workflows/
│  ├─ manual-deploy.yml
│  └─ update-exhibitions.yml
├─ data/
│  ├─ exhibitions-auto.json
│  ├─ exhibitions-review.md
│  └─ exhibitions-source-status.json
├─ docs/                         ← Phase 2Aでは触らない
├─ tests/
│  └─ test_exhibition_tools.py
├─ requirements.txt
├─ scraper.py
├─ site_config.py
├─ updater.py
└─ PHASE2_README.md
```

## 監視対象（12館）

1. 国立西洋美術館
2. 東京都美術館
3. 国立新美術館
4. 東京国立博物館
5. 東京都現代美術館
6. SOMPO美術館
7. 三菱一号館美術館
8. アーティゾン美術館
9. 大阪中之島美術館
10. 京都市京セラ美術館
11. 大阪市立美術館
12. あべのハルカス美術館

## 自動処理

毎朝 06:15 JST に GitHub Actions が次を実行します。

1. 12館の公式ページを取得
2. 展覧会名・会期・公式URLを抽出
3. `docs/assets/js/exhibitions-data.js` の手動マスタと比較
4. 手動登録済みの展覧会を自動候補から除外
5. `data/exhibitions-auto.json` を更新
6. `data/exhibitions-source-status.json` に各館の取得成否を記録
7. `data/exhibitions-review.md` に人が確認しやすい一覧を生成
8. 差分がある場合だけ GitHub Actions bot が commit / push

## 適用方法

このZIPの中身をリポジトリ直下へ上書きコピーします。

例:

```text
C:\hillslife-github\kotaeawase-art\
```

GitHub Desktopで変更を確認し、次のようなSummaryでcommitします。

```text
Add Phase 2A exhibition auto-update
```

その後 `Push origin`。

## 初回手動テスト

GitHubで

```text
Actions
→ Update exhibition candidates
→ Run workflow
```

を実行します。

成功後は、

```text
Code
→ data
→ exhibitions-review.md
```

を確認します。

### 確認ポイント

- 12館すべてが `OK` か
- 取得件数が極端に多くないか
- 展覧会名ではないリンクが混ざっていないか
- 既に手動登録済みの展覧会が重複していないか

## GitHub Actionsがpushできない場合

`git push` で `403` / `permission denied` になった場合だけ、

```text
Settings
→ Actions
→ General
→ Workflow permissions
→ Read and write permissions
```

を選択します。

## Phase 2B（まだ実施しない）

取得精度を確認したあと、初めて自動候補をサイト表示に接続します。

- `docs/assets/js/exhibitions-auto.js` を生成
- 手動データが常に優先
- 自動候補は画像なし・低優先度から開始
- 最後に自動FTPデプロイを有効化

Phase 2Aの段階では `https://hillslife.tokyo/art/` の表示は変わりません。
