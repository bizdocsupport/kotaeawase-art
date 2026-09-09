答え合わせ美術部 Git patch: トップページ「初心者あるある」54個 → 59個

変更ファイル:
- docs/index.html
  トップページの表示のみ 54個 → 59個
- .github/workflows/manual-deploy.yml
  Phase 1 の「全ファイルが元サイトと完全一致すること」を要求する検証を終了し、
  今後の意図した編集を許可する軽量なサイト構成チェックに変更。

適用方法:
1. このZIPを展開
2. 中身をローカルの kotaeawase-art リポジトリ直下へ上書きコピー
3. GitHub DesktopでCommit
   例: Update beginner count to 59 and retire Phase 1 baseline gate
4. Push origin
5. Actions > Manual deploy to Onamae.com で dry-run
6. 成功後 deploy

baseline-manifest.json と tools/verify_baseline.py は初回移行時の記録として残します。
