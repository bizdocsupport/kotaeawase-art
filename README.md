# 答え合わせ美術部 — Git移行 Phase 1

このZIPは、現在の `https://hillslife.tokyo/art/` を一文字も変更せずGitHub管理へ移すための Phase 1 版です。

## 今回やること

- 現サイトの `art/` 内の全ファイルを `docs/` にバイト単位でそのまま格納
- GitHubでソース管理
- GitHub Actionsからお名前.comへ**手動**デプロイ
- 初回は `dry-run` のみ
- 自動更新・push時自動デプロイはまだ行わない

## 構成

```text
kotaeawase-art/
├─ .github/workflows/manual-deploy.yml
├─ docs/                    # 現在の art/ の完全コピー
├─ tools/verify_baseline.py
├─ baseline-manifest.json
├─ .gitattributes
├─ .gitignore
├─ README.md
└─ SITE_INFO.md
```

## 元サイトとの一致確認

- 元ZIP SHA-256: `592936e06a13f33e61ddd80bfb5e7b557edc43470f0b113cbba657e961c8ace8`
- 元 `art/` ファイル数: 748
- `docs/` ファイル数: 748
- 合計サイズ: 173,173,080 bytes
- 全ファイルの内容をSHA-256で検証済み

`docs/` のファイル内容は元の `art/` と同一です。リポジトリ上の配置だけ `art/` → `docs/` へ変えています。

## 1. GitHubに空リポジトリを作る

推奨名: `kotaeawase-art`

GitHub側ではREADME等を追加せず、空で作成します。

## 2. ZIPを展開して初回push

PowerShellで `kotaeawase-art` フォルダへ移動して実行します。

```powershell
git init
git branch -M main
git add .
git commit -m "Initial import: exact copy of current art site"
git remote add origin https://github.com/<YOUR_ACCOUNT>/kotaeawase-art.git
git push -u origin main
```

## 3. Repository Secrets

GitHubの `Settings` → `Secrets and variables` → `Actions` で以下を登録します。

```text
FTP_SERVER
FTP_USERNAME
FTP_PASSWORD
FTP_REMOTE_DIR
```

任意:

```text
FTP_PORT   # 既定21
FTP_TLS    # 通常FTP=false、FTPS=true
```

`FTP_REMOTE_DIR` は、現在FTPソフトで `art` の中身を置いている公開先ディレクトリを指定してください。

## 4. まずdry-run

GitHubの `Actions` → `Manual deploy to Onamae.com` → `Run workflow` で `dry-run` を選択します。

この時点では何もアップロードしません。

## 5. 問題なければdeploy

同じActionで `deploy` を選択します。

Phase 1では `--delete` を使わないため、サーバーにのみ存在する `.htaccess` 等は削除されません。

## まだやらないこと

- push時の自動デプロイ
- 毎朝の定期更新
- 展覧会情報スクレイピング
- GitHub Pagesへの移転

まず現サイトがGitHub経由でも全く同じ状態で公開できることだけ確認します。
