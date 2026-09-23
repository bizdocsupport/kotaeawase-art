/* AUTO-GENERATED FILE. DO NOT EDIT.
 * Source: data/exhibitions-auto.json
 * Manual curated data remains in exhibitions-data.js.
 */
window.KA_EXHIBITIONS = Array.isArray(window.KA_EXHIBITIONS) ? window.KA_EXHIBITIONS : [];
const imageOverrides = {
  "kukai-shingon-2026": {
    "image": "https://www.tnm.jp/jp/exhibition/images/tmp/ogp/TNM_ogp.jpg",
    "sourcePage": "https://www.tnm.jp/modules/r_free_page/index.php?id=2760&lang=ja",
    "evidence": "meta [property=\"og:image\"]"
  },
  "yamaguchi-kayo-2026": {
    "image": "https://www.sompo-museum.org/wp-content/uploads/2026/04/img_ex_past_kayo_yamaguchi_mainvisual_sp-scaled.jpg",
    "sourcePage": "https://www.sompo-museum.org/exhibitions/2025/yamaguchikayo/",
    "evidence": "meta [property=\"og:image\"]"
  },
  "sottsass-2026": {
    "image": "https://www.artizon.museum/exhibition_sp/sottsass2026/assets/images/og/shere_ja.png",
    "sourcePage": "https://www.artizon.museum/exhibition_sp/sottsass2026/",
    "evidence": "meta [property=\"og:image\"]"
  },
  "marquet-2026": {
    "image": "https://www.sompo-museum.org/wp-content/uploads/2026/06/img_ex_index_marquet_mainvisual_pc.jpg",
    "sourcePage": "https://www.sompo-museum.org/exhibitions/2025/albertmarquet/",
    "evidence": "meta [property=\"og:image\"]"
  },
  "hiroshige-best-angle-2026": {
    "image": "https://www.tnm.jp/jp/exhibition/images/tmp/ogp/TNM_ogp.jpg",
    "sourcePage": "https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12",
    "evidence": "meta [property=\"og:image\"]"
  },
  "nhk-nichibi50-2026": {
    "image": "https://nakka-art.jp/wp10/wp-content/uploads/2026/07/日曜美術館展_WEBバナー_白背景_920_552.jpg",
    "sourcePage": "https://nakka-art.jp/exhibition-post/nichibiten50/",
    "evidence": "meta [property=\"og:image:secure_url\"]"
  }
};
window.KA_EXHIBITIONS.forEach(item => {
  const found = imageOverrides[item.id];
  const placeholder = !item.image || item.image.includes('/exhibition-card/');
  if (found && found.image && placeholder && !item.imageId) {
    item.image = found.image;
    item.imageAlt = (item.shortTitle || item.title) + ' 公式サイト掲載画像';
    item.imageSource = found.sourcePage || item.official;
  }
});
window.KA_EXHIBITIONS.push(...[
  {
    "id": "auto-artizon-c2cb08142a",
    "kind": "exhibition",
    "title": "瀧口修造 書くことと描くこと",
    "shortTitle": "瀧口修造 書くことと描くこと",
    "aliases": [
      "瀧口修造 書くことと描くこと"
    ],
    "venue": "アーティゾン美術館",
    "area": "東京",
    "start": "2026-06-23",
    "end": "2026-10-04",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://www.artizon.museum/exhibition/detail/604",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-nakka-5830e5188a",
    "kind": "exhibition",
    "title": "スイス絵画の異才 カール・ヴァルザー",
    "shortTitle": "スイス絵画の異才 カール・ヴァルザー",
    "aliases": [
      "スイス絵画の異才 カール・ヴァルザー"
    ],
    "venue": "大阪中之島美術館",
    "area": "大阪",
    "start": "2026-07-04",
    "end": "2026-09-27",
    "image": "https://nakka-art.jp/wp10/wp-content/uploads/2026/04/banner_960・80px.jpg",
    "imageAlt": "スイス絵画の異才 カール・ヴァルザー 公式サイト掲載画像",
    "imageSource": "https://nakka-art.jp/exhibition-post/karlwalser-2026",
    "guide": "",
    "official": "https://nakka-art.jp/exhibition-post/karlwalser-2026",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-tobikan-4eb1af0a22",
    "kind": "exhibition",
    "title": "東京都美術館開館100周年記念 この場所の風景―上野・大牟田・ブエノスアイレス",
    "shortTitle": "東京都美術館開館100周年記念 この場所の風景―上野・大牟田・ブエノスアイレス",
    "aliases": [
      "東京都美術館開館100周年記念 この場所の風景―上野・大牟田・ブエノスアイレス"
    ],
    "venue": "東京都美術館",
    "area": "東京",
    "start": "2026-07-23",
    "end": "2026-10-07",
    "image": "https://tobikan.jp/media/img/poster/2026_viewsofthisplace_l.jpg",
    "imageAlt": "東京都美術館開館100周年記念 この場所の風景―上野・大牟田・ブエノスアイレス 公式サイト掲載画像",
    "imageSource": "https://www.tobikan.jp/exhibition/2026_viewsofthisplace.html",
    "guide": "",
    "official": "https://www.tobikan.jp/exhibition/2026_viewsofthisplace.html",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-kyocera-5e5119c49b",
    "kind": "exhibition",
    "title": "松延総司：壁",
    "shortTitle": "松延総司：壁",
    "aliases": [
      "松延総司：壁"
    ],
    "venue": "京都市京セラ美術館",
    "area": "京都",
    "start": "2026-09-12",
    "end": "2026-12-20",
    "image": "https://kyotocity-kyocera.museum/wp-content/uploads/matsunobesoshi_thumb.jpg",
    "imageAlt": "松延総司：壁 公式サイト掲載画像",
    "imageSource": "https://kyotocity-kyocera.museum/exhibition/20260912-20261220",
    "guide": "",
    "official": "https://kyotocity-kyocera.museum/exhibition/20260912-20261220",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-kyocera-bb644c0019",
    "kind": "exhibition",
    "title": "生誕140年記念 染織家 山鹿清華─宙翔ぶイマジネーション",
    "shortTitle": "生誕140年記念 染織家 山鹿清華─宙翔ぶイマジネーション",
    "aliases": [
      "生誕140年記念 染織家 山鹿清華─宙翔ぶイマジネーション"
    ],
    "venue": "京都市京セラ美術館",
    "area": "京都",
    "start": "2026-09-19",
    "end": "2026-12-20",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://kyotocity-kyocera.museum/exhibition/20260919-20261220",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-kyocera-1005daf56b",
    "kind": "exhibition",
    "title": "［2026秋期］コレクションルーム 特集「美術館物語 市美の産声」",
    "shortTitle": "［2026秋期］コレクションルーム 特集「美術館物語 市美の産声」",
    "aliases": [
      "［2026秋期］コレクションルーム 特集「美術館物語 市美の産声」"
    ],
    "venue": "京都市京セラ美術館",
    "area": "京都",
    "start": "2026-10-09",
    "end": "2026-12-13",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://kyotocity-kyocera.museum/exhibition/20261009-20261213",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-artizon-3538cc4973",
    "kind": "exhibition",
    "title": "エトランゼたち —洋画家たちのヨーロッパ体験",
    "shortTitle": "エトランゼたち —洋画家たちのヨーロッパ体験",
    "aliases": [
      "エトランゼたち —洋画家たちのヨーロッパ体験"
    ],
    "venue": "アーティゾン美術館",
    "area": "東京",
    "start": "2026-10-24",
    "end": "2027-01-31",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://www.artizon.museum/exhibition/detail/610",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-nact-4d6186b191",
    "kind": "exhibition",
    "title": "少女漫画・インフィニティ 萩尾望都×山岸凉子×大和和紀 三人展",
    "shortTitle": "少女漫画・インフィニティ 萩尾望都×山岸凉子×大和和紀 三人展",
    "aliases": [
      "少女漫画・インフィニティ 萩尾望都×山岸凉子×大和和紀 三人展"
    ],
    "venue": "国立新美術館",
    "area": "東京",
    "start": "2026-10-28",
    "end": "2027-02-08",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://www.nact.jp/exhibition_special/2026/shojomanga",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-nakka-23e5213bd6",
    "kind": "exhibition",
    "title": "大英博物館日本美術コレクション 百花繚乱〜海を越えた江戸絵画",
    "shortTitle": "大英博物館日本美術コレクション 百花繚乱〜海を越えた江戸絵画",
    "aliases": [
      "大英博物館日本美術コレクション 百花繚乱〜海を越えた江戸絵画"
    ],
    "venue": "大阪中之島美術館",
    "area": "大阪",
    "start": "2026-10-31",
    "end": "2027-01-31",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://nakka-art.jp/exhibition-post/daiei-ten2026",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-nakka-936b067f28",
    "kind": "exhibition",
    "title": "Osaka Directory 13 Supported by RICHARD MILLE 橘 葉月",
    "shortTitle": "Osaka Directory 13 Supported by RICHARD MILLE 橘 葉月",
    "aliases": [
      "Osaka Directory 13 Supported by RICHARD MILLE 橘 葉月"
    ],
    "venue": "大阪中之島美術館",
    "area": "大阪",
    "start": "2026-11-14",
    "end": "2026-12-13",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://nakka-art.jp/exhibition-post/osaka-directory-dir13",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-tobikan-40ce5d0143",
    "kind": "exhibition",
    "title": "東京都美術館開館100周年記念 あなたが世界を読むために",
    "shortTitle": "東京都美術館開館100周年記念 あなたが世界を読むために",
    "aliases": [
      "東京都美術館開館100周年記念 あなたが世界を読むために"
    ],
    "venue": "東京都美術館",
    "area": "東京",
    "start": "2026-11-19",
    "end": "2027-01-11",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://www.tobikan.jp/exhibition/2026_waysofreading.html",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-tobikan-693884f571",
    "kind": "exhibition",
    "title": "東京都美術館開館100周年記念 はじまりをひらく 東京都美術館の100年",
    "shortTitle": "東京都美術館開館100周年記念 はじまりをひらく 東京都美術館の100年",
    "aliases": [
      "東京都美術館開館100周年記念 はじまりをひらく 東京都美術館の100年"
    ],
    "venue": "東京都美術館",
    "area": "東京",
    "start": "2026-11-19",
    "end": "2027-01-11",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://www.tobikan.jp/exhibition/2026_archives.html",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-kyocera-a39b6482bd",
    "kind": "exhibition",
    "title": "スタジオジブリ企画制作『白隠さんの禅』京都展",
    "shortTitle": "スタジオジブリ企画制作『白隠さんの禅』京都展",
    "aliases": [
      "スタジオジブリ企画制作『白隠さんの禅』京都展"
    ],
    "venue": "京都市京セラ美術館",
    "area": "京都",
    "start": "2026-12-17",
    "end": "2027-01-11",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://kyotocity-kyocera.museum/exhibition/20261217-20270111",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-kyocera-68a7d0983e",
    "kind": "exhibition",
    "title": "第119回⽇展京都展",
    "shortTitle": "第119回⽇展京都展",
    "aliases": [
      "第119回⽇展京都展"
    ],
    "venue": "京都市京セラ美術館",
    "area": "京都",
    "start": "2026-12-19",
    "end": "2027-01-16",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://kyotocity-kyocera.museum/exhibition/20261219-20270116",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-nakka-8d9adf2eb0",
    "kind": "exhibition",
    "title": "Osaka Directory 14 Supported by RICHARD MILLE 迫 鉄平",
    "shortTitle": "Osaka Directory 14 Supported by RICHARD MILLE 迫 鉄平",
    "aliases": [
      "Osaka Directory 14 Supported by RICHARD MILLE 迫 鉄平"
    ],
    "venue": "大阪中之島美術館",
    "area": "大阪",
    "start": "2026-12-19",
    "end": "2027-01-17",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://nakka-art.jp/exhibition-post/osaka-directory-dir14",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-aham-d1abb0eb8d",
    "kind": "exhibition",
    "title": "ルーシー・リー展 －東西をつなぐ優美のうつわ－",
    "shortTitle": "ルーシー・リー展 －東西をつなぐ優美のうつわ－",
    "aliases": [
      "ルーシー・リー展 －東西をつなぐ優美のうつわ－"
    ],
    "venue": "あべのハルカス美術館",
    "area": "大阪",
    "start": "2026-12-26",
    "end": "2027-03-07",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://www.aham.jp/exhibition/future/lucie_rie",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-sompo-32cbb76acd",
    "kind": "exhibition",
    "title": "生誕130年 東郷青児展",
    "shortTitle": "生誕130年 東郷青児展",
    "aliases": [
      "生誕130年 東郷青児展"
    ],
    "venue": "SOMPO美術館",
    "area": "東京",
    "start": "2027-01-09",
    "end": "2027-02-21",
    "image": "https://www.sompo-museum.org/wp-content/uploads/2025/10/togoseiji-130th-anniversary_thumbnail_pc_750.jpg",
    "imageAlt": "生誕130年 東郷青児展 公式サイト掲載画像",
    "imageSource": "https://www.sompo-museum.org/exhibitions/2025/togoseiji-130th-anniversary",
    "guide": "",
    "official": "https://www.sompo-museum.org/exhibitions/2025/togoseiji-130th-anniversary",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-kyocera-3a6c39b2fb",
    "kind": "exhibition",
    "title": "［2026冬期］コレクションルーム 特集「時を塗る－京都のうるしが映した近代」",
    "shortTitle": "［2026冬期］コレクションルーム 特集「時を塗る－京都のうるしが映した近代」",
    "aliases": [
      "［2026冬期］コレクションルーム 特集「時を塗る－京都のうるしが映した近代」"
    ],
    "venue": "京都市京セラ美術館",
    "area": "京都",
    "start": "2027-01-15",
    "end": "2027-03-14",
    "image": "https://kyotocity-kyocera.museum/wp-content/uploads/kamisakasekka_jinbutsusairei.jpg",
    "imageAlt": "［2026冬期］コレクションルーム 特集「時を塗る－京都のうるしが映した近代」 公式サイト掲載画像",
    "imageSource": "https://kyotocity-kyocera.museum/exhibition/20270115-20270314",
    "guide": "",
    "official": "https://kyotocity-kyocera.museum/exhibition/20270115-20270314",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-kyocera-3631924a1d",
    "kind": "exhibition",
    "title": "藤野裕美子",
    "shortTitle": "藤野裕美子",
    "aliases": [
      "藤野裕美子"
    ],
    "venue": "京都市京セラ美術館",
    "area": "京都",
    "start": "2027-01-15",
    "end": "2027-04-18",
    "image": "https://kyotocity-kyocera.museum/wp-content/uploads/fujinoyumiko.jpg",
    "imageAlt": "藤野裕美子 公式サイト掲載画像",
    "imageSource": "https://kyotocity-kyocera.museum/exhibition/20270115-20270418",
    "guide": "",
    "official": "https://kyotocity-kyocera.museum/exhibition/20270115-20270418",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-nakka-d3234d567d",
    "kind": "exhibition",
    "title": "乾 真裕子",
    "shortTitle": "乾 真裕子",
    "aliases": [
      "乾 真裕子"
    ],
    "venue": "大阪中之島美術館",
    "area": "大阪",
    "start": "2027-01-23",
    "end": "2027-02-21",
    "image": "https://nakka-art.jp/wp10/wp-content/uploads/2026/09/OD15_MV_0904-scaled.jpg",
    "imageAlt": "乾 真裕子 公式サイト掲載画像",
    "imageSource": "https://nakka-art.jp/exhibition-post/osaka-directory-dir15",
    "guide": "",
    "official": "https://nakka-art.jp/exhibition-post/osaka-directory-dir15",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-osaka-art-4e095e5886",
    "kind": "exhibition",
    "title": "円山応挙 リアルの先へ 空間革命",
    "shortTitle": "円山応挙 リアルの先へ 空間革命",
    "aliases": [
      "円山応挙 リアルの先へ 空間革命"
    ],
    "venue": "大阪市立美術館",
    "area": "大阪",
    "start": "2027-02-06",
    "end": "2027-04-04",
    "image": "https://www.osaka-art-museum.jp/themes/custom/osaka_museum/images/ogp.jpg",
    "imageAlt": "円山応挙 リアルの先へ 空間革命 公式サイト掲載画像",
    "imageSource": "https://www.osaka-art-museum.jp/special_exhibition/10344",
    "guide": "",
    "official": "https://www.osaka-art-museum.jp/special_exhibition/10344",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-kyocera-3fe4990d0d",
    "kind": "exhibition",
    "title": "思考する彫刻家 ラファエル・ザルカと堀内正和 ―幾何学とモダニティをめぐる対話（仮称）",
    "shortTitle": "思考する彫刻家 ラファエル・ザルカと堀内正和 ―幾何学とモダニティをめぐる対話（仮称）",
    "aliases": [
      "思考する彫刻家 ラファエル・ザルカと堀内正和 ―幾何学とモダニティをめぐる対話（仮称）"
    ],
    "venue": "京都市京セラ美術館",
    "area": "京都",
    "start": "2027-02-06",
    "end": "2027-05-05",
    "image": "https://kyotocity-kyocera.museum/wp-content/uploads/ZARKA_HERMES.jpg",
    "imageAlt": "思考する彫刻家 ラファエル・ザルカと堀内正和 ―幾何学とモダニティをめぐる対話（仮称） 公式サイト掲載画像",
    "imageSource": "https://kyotocity-kyocera.museum/exhibition/20270206-20270505",
    "guide": "",
    "official": "https://kyotocity-kyocera.museum/exhibition/20270206-20270505",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-sompo-e7ac3a8a46",
    "kind": "exhibition",
    "title": "FACE展2027",
    "shortTitle": "FACE展2027",
    "aliases": [
      "FACE展2027"
    ],
    "venue": "SOMPO美術館",
    "area": "東京",
    "start": "2027-03-06",
    "end": "2027-03-28",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://www.sompo-museum.org/exhibitions/2025/face2027",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  },
  {
    "id": "auto-aham-362536b9d9",
    "kind": "exhibition",
    "title": "エリック・カール展 はじまりは、はらぺこあおむし",
    "shortTitle": "エリック・カール展 はじまりは、はらぺこあおむし",
    "aliases": [
      "エリック・カール展 はじまりは、はらぺこあおむし"
    ],
    "venue": "あべのハルカス美術館",
    "area": "大阪",
    "start": "2027-03-20",
    "end": "2027-05-09",
    "image": "",
    "imageAlt": "",
    "imageSource": "",
    "guide": "",
    "official": "https://www.aham.jp/exhibition/future/ericcarle",
    "note": "公式サイトから自動取得した開催情報です。",
    "homePriority": -1000,
    "large": false,
    "bigPick": false,
    "auto": true,
    "ticketEvents": []
  }
]);
