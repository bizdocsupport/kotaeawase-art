答え合わせ美術部 v3.04.50 差分

1. inspection.html の「X用4枚出力」を復旧・維持
2. X予約投稿RPA用の月次バッチ出力を追加
   - 確認済み
   - ズレ記録なし
   - 画像/01/02/03データあり
   の未出力作品から指定件数を抽出
3. デフォルトは週2回（火・木）20:30、8件=4週間分
4. 1回の出力でZIPを生成
   - X予約投稿一覧_答え合わせ美術部.xlsx
   - images/<ID>_00.png
   - images/<ID>_01.png
   - images/<ID>_02.png
   - images/<ID>_03.png
   - README_RPA.txt
5. Excelの先頭12列は従来構造を維持
   M:R に ImageFile2/ImagePath2/ImageFile3/ImagePath3/ImageFile4/ImagePath4 を追加
6. ov-001《モナ・リザ》02の手フォーカスを下へ修正

RPA側の変更点
- 従来のImagePathアップロード後、ImagePath2 / ImagePath3 / ImagePath4を順に追加アップロード
- PostText / Year / Month / Day / Hour / Minute 等は従来と同じ

推奨展開先
C:\RPA\art_guide\
  X予約投稿一覧_答え合わせ美術部.xlsx
  images\*.png

注意
Excel生成は SheetJS 0.20.3、ZIP生成は JSZip 3.10.1 をCDNから読み込みます。
