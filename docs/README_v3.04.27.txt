答え合わせ美術部 v3.04.27

- ov-101 ゴッホ《星月夜》の画像表示不具合を修正
- 原因: Wikimedia Commons の Special:Redirect が663.94MBの超高解像度原画を参照し、ブラウザで読み込み失敗する可能性がある構成だった
- 対応: 1280px版をローカルWebP化して assets/images/mustsee/ov-101.webp に収録
- mustsee-images.js の ov-101 src をローカル画像へ変更
- fallbackSrc に Wikimedia Commons 1280px版を設定
- mustsee-images.js のキャッシュバージョンを 3.04.27 へ更新
