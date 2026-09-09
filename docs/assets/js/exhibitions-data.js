/*
 * 答え合わせ美術部｜展覧会マスタ
 * v4.4.0 / 2026-08-21
 *
 * 展覧会情報の唯一の正本（single source of truth）。
 * 会期・画像・公式URL・見どころ・訪問日・チケット日程はここだけを編集する。
 * 表示先（開催中／もうすぐ／少し先／ARCHIVE）は site-v4.js が日付から自動判定する。
 */
window.KA_EXHIBITIONS = [
  {
    id:'grand-van-gogh-2026', kind:'exhibition',
    title:'大ゴッホ展 夜のカフェテラス', shortTitle:'大ゴッホ展', galleryTitle:'大ゴッホ展',
    aliases:['大ゴッホ展','大ゴッホ展 夜のカフェテラス'],
    venue:'上野の森美術館', area:'東京', start:'2026-05-29', end:'2026-08-12',
    image:'assets/images/exhibition-official/van-gogh.webp',
    guide:'exhibition-detail.html?exhibition=van-gogh', official:'https://grand-van-gogh-tokyo.com/',
    note:'《夜のカフェテラス》を中心に、ゴッホの光と色を実物で見る。', homePriority:95, large:true,
    ticketEvents:[]
  },
  {
    id:'hajimete-bijutsu', kind:'exhibition',
    title:'MOTコレクション　はじめて、びじゅつ', shortTitle:'はじめて、びじゅつ', galleryTitle:'はじめてびじゅつ',
    aliases:['はじめてびじゅつ','はじめて、びじゅつ','MOTコレクション はじめて、びじゅつ'],
    venue:'東京都現代美術館', area:'東京', start:'2026-04-28', end:'2026-08-16',
    image:'assets/images/exhibition-official/hajimete-bijutsu.webp',
    guide:'exhibition-detail.html?exhibition=hajimete-bijutsu', official:'https://www.mot-art-museum.jp/exhibitions/mot-collection-260428/',
    note:'「分からないまま、見始める」を試す現代美術の入口。', homePriority:68,
    ticketEvents:[]
  },
  {
    id:'kansai-ukiyoe-trip', kind:'trip-guide',
    title:'関西浮世絵', shortTitle:'関西浮世絵', galleryTitle:'関西浮世絵', aliases:['関西浮世絵'],
    venue:'大阪・神戸・京都', area:'関西', start:'2026-08-14', end:'2026-08-16',
    image:'assets/images/exhibition-html/kansai-ukiyoe-summary.webp',
    guide:'exhibition-detail.html?exhibition=kansai-ukiyoe', official:'',
    note:'水滸伝→河鍋暁斎→歌川国芳をつなぐ、関西3展の比較鑑賞ガイド。', homePriority:0,
    ticketEvents:[]
  },
  {
    id:'vermeer-2026', kind:'exhibition',
    title:'フェルメール《真珠の耳飾りの少女》展', shortTitle:'フェルメール《真珠の耳飾りの少女》展',
    aliases:['フェルメール《真珠の耳飾りの少女》展','真珠の耳飾りの少女'],
    venue:'大阪中之島美術館', area:'大阪', start:'2026-08-21', end:'2026-09-27',
    image:'assets/images/mustsee/jpvisit-001.webp', guide:'column/vermeer2026-highlights.html',
    official:'https://vermeer2026.exhibit.jp/', ticketUrl:'https://vermeer2026.exhibit.jp/tickets/',
    note:'14年ぶりの来日。実物では「目・真珠・青」を答え合わせ。', homePriority:100, large:true, bigPick:true,
    ticketEvents:[
      {label:'追加抽選② 申込開始',at:'2026-08-20T12:00',minutes:30},
      {label:'追加抽選② 申込締切',at:'2026-08-24T12:00',minutes:30},
      {label:'追加抽選② 結果発表',at:'2026-08-27T15:00',minutes:30},
      {label:'追加抽選③ 申込開始',at:'2026-08-28T12:00',minutes:30},
      {label:'追加抽選③ 申込締切',at:'2026-08-31T12:00',minutes:30},
      {label:'追加抽選③ 結果発表',at:'2026-09-03T15:00',minutes:30},
      {label:'追加抽選④ 申込開始',at:'2026-09-04T12:00',minutes:30},
      {label:'追加抽選④ 申込締切',at:'2026-09-07T12:00',minutes:30},
      {label:'追加抽選④ 結果発表',at:'2026-09-10T15:00',minutes:30}
    ]
  },
  {
    id:'hokusai-hiroshige-fuji', kind:'exhibition',
    title:'開館10周年記念　北斎 広重　ふたりの富士、それぞれの富士', shortTitle:'北斎 広重　ふたりの富士',
    aliases:['開館10周年記念 北斎 広重 ふたりの富士、それぞれの富士','北斎 広重 ふたりの富士','ふたりの富士'],
    venue:'すみだ北斎美術館', area:'東京', start:'2026-06-23', end:'2026-08-30',
    image:'assets/images/exhibition-official/hokusai-hiroshige-fuji.webp',
    guide:'exhibition-detail.html?exhibition=hokusai-hiroshige-fuji', official:'https://hokusai-museum.jp/hokusaihiroshige/',
    note:'北斎＝形、広重＝場所。同じ富士をどう違って見せるか。', homePriority:96, large:true,
    ticketEvents:[]
  },
  {
    id:'vangogh-wallraf-2026', kind:'exhibition',
    title:'ゴッホの跳ね橋と印象派の画家たち　ヴァルラフ＝リヒャルツ美術館所蔵', shortTitle:'ゴッホの跳ね橋と印象派の画家たち',
    aliases:['ゴッホの跳ね橋と印象派の画家たち','ゴッホの跳ね橋'],
    venue:'あべのハルカス美術館', area:'大阪', start:'2026-07-04', end:'2026-09-09',
    image:'assets/images/exhibition-official/van-gogh-bridge.webp',
    guide:'exhibition-detail.html?exhibition=van-gogh-bridge', official:'https://www.aham.jp/sp/exhibition/wallraf/',
    note:'印象派からゴッホへ。「自然の見方」が変わるリレーを追う。', homePriority:90,
    ticketEvents:[]
  },
  {
    id:'picasso-paul-smith', kind:'exhibition',
    title:'ピカソ meets ポール・スミス　遊び心の冒険へ', shortTitle:'ピカソ meets ポール・スミス', galleryTitle:'ピカソmeetsポールスミス',
    aliases:['ピカソmeetsポールスミス','ピカソ meets ポール・スミス','ピカソ meets ポール・スミス 遊び心の冒険へ'],
    venue:'国立新美術館', area:'東京', start:'2026-06-10', end:'2026-09-21',
    image:'assets/images/exhibition-official/picasso-paul-smith.webp',
    guide:'exhibition-detail.html?exhibition=picasso-paul-smith', official:'https://www.nact.jp/exhibition_special/2026/picasso_paulsmith/',
    note:'作品だけでなく、壁・床・展示空間まで。「見方を着替える」。', homePriority:86,
    ticketEvents:[]
  },
  {
    id:'kuniyoshi', kind:'exhibition',
    title:'浮世絵スーパークリエイター 歌川国芳展', shortTitle:'歌川国芳展', galleryTitle:'歌川国芳展',
    aliases:['歌川国芳展','浮世絵スーパークリエイター 歌川国芳展'],
    venue:'京都市京セラ美術館', area:'京都', start:'2026-07-18', end:'2026-09-23',
    image:'assets/images/exhibition-official/kuniyoshi.webp',
    guide:'exhibition-detail.html?exhibition=kuniyoshi', official:'https://kyotocity-kyocera.museum/exhibition/20260718-20260923',
    note:'武者絵、妖怪、猫。最初の驚きのあとに「画面の設計」を見る。', homePriority:82,
    visitDate:'2026-08-16', visitLabel:'8/16', ticketEvents:[]
  },
  {
    id:'suikoden', kind:'exhibition',
    title:'大阪市立美術館開館90周年記念特別展 水滸伝', shortTitle:'水滸伝展', galleryTitle:'水滸伝展',
    aliases:['水滸伝展','大阪市立美術館開館90周年記念特別展 水滸伝'],
    venue:'大阪市立美術館', area:'大阪', start:'2026-07-11', end:'2026-09-06',
    image:'assets/images/exhibition-official/suikoden.webp',
    guide:'exhibition-detail.html?exhibition=suikoden', official:'https://www.osaka-art-museum.jp/special_exhibition/8301',
    note:'国芳の豪傑から現代まで。英雄像が時代ごとにどう変わるか。', homePriority:76,
    visitDate:'2026-08-14', visitLabel:'8/14', ticketEvents:[]
  },
  {
    id:'kyosai', kind:'exhibition',
    title:'特別展　ゴールドマン コレクション　河鍋暁斎の世界', shortTitle:'河鍋暁斎の世界', galleryTitle:'河鍋暁斎の世界',
    aliases:['河鍋暁斎の世界','ゴールドマン コレクション 河鍋暁斎の世界','特別展 ゴールドマン コレクション 河鍋暁斎の世界'],
    venue:'神戸市立博物館', area:'神戸', start:'2026-07-11', end:'2026-09-23',
    image:'assets/images/exhibition-official/kyosai.webp',
    guide:'exhibition-detail.html?exhibition=kyosai', official:'https://www.kobecitymuseum.jp/exhibition/detail?exhibition=396',
    note:'笑う前に、線を見る。速さと確かな画力を実物で確かめる。', homePriority:80,
    visitDate:'2026-08-15', visitLabel:'8/15', ticketEvents:[]
  },
  {
    id:'leo-lionni-friends', kind:'exhibition',
    title:'レオ・レオーニと仲間たち', shortTitle:'レオ・レオーニと仲間たち', aliases:['レオ・レオーニと仲間たち'],
    venue:'長崎県美術館', area:'長崎', start:'2026-07-11', end:'2026-08-30',
    image:'assets/images/exhibition-official/leo-lionni-friends.webp',
    guide:'exhibition-detail.html?exhibition=leo-lionni-friends', official:'https://www.nagasaki-museum.jp/archives/exhibition_post/30717',
    note:'「スイミーの人」になる前の、画家・デザイナーとしての仕事を見る。', homePriority:72, large:true,
    visitDate:'2026-08-30', visitLabel:'8/28–30', ticketEvents:[]
  },
  {
    id:'tada-minami', kind:'exhibition',
    title:'多田美波―光、凛と ゆれる', shortTitle:'多田美波', galleryTitle:'多田美波', aliases:['多田美波','多田美波―光、凛と ゆれる'],
    venue:'東京都現代美術館', area:'東京', start:'2026-08-29', end:'2026-12-06',
    image:'assets/images/exhibition-official/tada-minami.webp',
    guide:'exhibition-detail.html?exhibition=tada-minami', official:'https://www.mot-art-museum.jp/exhibitions/Tada-Minami/',
    note:'作品の前で横に一歩。光・反射・空間が変わる瞬間を見る。', homePriority:94,
    ticketEvents:[]
  },
  {
    id:'louvre-renaissance-2026', kind:'exhibition',
    title:'ルーヴル美術館展　ルネサンス', shortTitle:'ルーヴル美術館展 ルネサンス', aliases:['ルーヴル美術館展 ルネサンス','ルーヴル美術館展'],
    venue:'国立新美術館', area:'東京', start:'2026-09-09', end:'2026-12-13',
    image:'assets/images/mustsee/ov-002.webp', imageAlt:'レオナルド・ダ・ヴィンチ《美しきフェロニエール》', imagePosition:'50% 28%',
    guide:'', official:'https://www.nact.jp/exhibition_special/2026/louvre2026/',
    note:'ルーヴルの名品から、ルネサンスという大きな転換を見る。', homePriority:88, large:true, bigPick:true,
    ticketEvents:[
      {label:'前売券 販売終了',at:'2026-09-08T23:59',minutes:1},
      {label:'当日券 販売開始',at:'2026-09-09T00:00',minutes:30},
      {label:'通常オンライン当日券 販売終了',at:'2026-12-06T16:00',minutes:30}
    ]
  },
  {
    id:'cincinnati-2026', kind:'exhibition',
    title:'シンシナティ美術館展 ～アメリカに渡ったヨーロッパの至宝～', shortTitle:'シンシナティ美術館展', aliases:['シンシナティ美術館展','シンシナティ美術館展 ～アメリカに渡ったヨーロッパの至宝～'],
    venue:'上野の森美術館', area:'東京', start:'2026-10-10', end:'2027-01-10',
    image:'assets/images/exhibition-card/cincinnati-2026.webp', imageAlt:'シンシナティ美術館展',
    guide:'', official:'https://www.cincinnati-art2026.jp/', ticketUrl:'https://www.cincinnati-art2026.jp/ticket.html',
    note:'アメリカの美術館コレクションを通して、西洋美術を横断して見る。', homePriority:70, large:true, bigPick:true,
    ticketEvents:[
      {label:'前売券 販売終了',at:'2026-10-09T23:59',minutes:1},
      {label:'当日券 販売開始',at:'2026-10-10T00:00',minutes:30}
    ]
  },
  {
    id:'turner-2026', kind:'exhibition',
    title:'テート美術館　ターナー展――崇高の絵画、現代美術との対話', shortTitle:'テート美術館 ターナー展', aliases:['テート美術館 ターナー展','ターナー展――崇高の絵画','ターナー展'],
    venue:'国立西洋美術館', area:'東京', start:'2026-10-24', end:'2027-02-21',
    imageId:'jpvisit-007', imageAlt:'J.M.W.ターナー《新月》', imagePosition:'50% 45%',
    guide:'', official:'https://www.nmwa.go.jp/jp/exhibitions/2026turner.html',
    note:'光と大気をどう絵にするか。ターナーの変化をまとめて見る。', homePriority:91, large:true, bigPick:true,
    ticketEvents:[]
  },
  {
    id:'orsay-2026', kind:'exhibition',
    title:'東京都美術館開館100周年記念　オルセー美術館所蔵　いまを生きる歓び', shortTitle:'オルセー美術館所蔵 いまを生きる歓び',
    aliases:['オルセー美術館所蔵 いまを生きる歓び','いまを生きる歓び','オルセー美術館','東京都美術館開館100周年記念 オルセー美術館所蔵 いまを生きる歓び'],
    venue:'東京都美術館', area:'東京', start:'2026-11-14', end:'2027-03-28',
    imageId:'jpvisit-011', imageAlt:'フィンセント・ファン・ゴッホ《ローヌ川の星月夜》', imagePosition:'50% 48%',
    guide:'', official:'https://www.tobikan.jp/exhibition/2026_orsay.html',
    note:'19世紀末の「現代」を、オルセーの作品群から見直す。', homePriority:89, large:true, bigPick:true,
    ticketEvents:[
      {label:'前売券 販売開始',at:'2026-09-28T10:00',minutes:30},
      {label:'前売券 販売終了',at:'2026-11-13T23:59',minutes:1}
    ]
  }
  ,{
    id:'rembrandt-etcher-2026', kind:'exhibition',
    title:'版画家レンブラント　挑戦、継承、インパクト', shortTitle:'版画家レンブラント', aliases:['版画家レンブラント','版画家レンブラント 挑戦、継承、インパクト'],
    venue:'国立西洋美術館', area:'東京', start:'2026-07-07', end:'2026-09-23',
    image:'assets/images/exhibition-card/rembrandt-etcher-2026.webp',
    guide:'', official:'https://www.nmwa.go.jp/jp/exhibitions/2026rembrandt.html',
    note:'油彩の「光の画家」だけではない。線と黒の濃淡でどこまで空気を作れるかを見る。', homePriority:78,
    ticketEvents:[]
  },
  {
    id:'british-museum-edo-2026', kind:'exhibition',
    title:'東京都美術館開館100周年記念　大英博物館日本美術コレクション　百花繚乱～海を越えた江戸絵画', shortTitle:'大英博物館日本美術コレクション 百花繚乱', aliases:['大英博物館日本美術コレクション 百花繚乱','百花繚乱 海を越えた江戸絵画'],
    venue:'東京都美術館', area:'東京', start:'2026-07-25', end:'2026-10-18',
    image:'assets/images/exhibition-card/british-museum-edo-2026.webp',
    guide:'', official:'https://www.tobikan.jp/exhibition/2026_britishmuseum.html',
    note:'歌麿・写楽・北斎・広重。海外に渡った江戸絵画を「何が残されたか」から見る。', homePriority:93, large:true, bigPick:true,
    ticketEvents:[]
  },
  {
    id:'kukai-shingon-2026', kind:'exhibition',
    title:'弘法大師生誕1250年記念　特別展「空海と真言の名宝」', shortTitle:'空海と真言の名宝', aliases:['空海と真言の名宝','特別展 空海と真言の名宝'],
    venue:'東京国立博物館', area:'東京', start:'2026-07-14', end:'2026-09-06',
    image:'assets/images/exhibition-card/kukai-shingon-2026.webp',
    guide:'', official:'https://www.tnm.jp/modules/r_free_page/index.php?id=2760&lang=ja',
    note:'密教美術は「何を表すか」だけでなく、像・色・道具がつくる空間そのものを見る。', homePriority:84, large:true,
    ticketEvents:[]
  },
  {
    id:'yamaguchi-kayo-2026', kind:'exhibition',
    title:'開館50周年記念 山口華楊展', shortTitle:'山口華楊展', aliases:['山口華楊展','開館50周年記念 山口華楊展'],
    venue:'SOMPO美術館', area:'東京', start:'2026-07-11', end:'2026-08-30',
    image:'assets/images/exhibition-card/yamaguchi-kayo-2026.webp',
    guide:'', official:'https://www.sompo-museum.org/exhibitions/2025/yamaguchikayo/',
    note:'動物を写すだけでなく、毛並み・姿勢・間で「生きている感じ」をどう作るかを見る。', homePriority:70,
    ticketEvents:[]
  },
  {
    id:'cafe-artists-2026', kind:'exhibition',
    title:'“カフェ”に集う芸術家―印象派からゴッホ、ロートレック、ピカソまで', shortTitle:'“カフェ”に集う芸術家', aliases:['カフェに集う芸術家','“カフェ”に集う芸術家'],
    venue:'三菱一号館美術館', area:'東京', start:'2026-06-13', end:'2026-09-23',
    image:'assets/images/exhibition-card/cafe-artists-2026.webp',
    guide:'', official:'https://mimt.jp/ex_sp/cafe/', ticketUrl:'https://mimt.jp/ex_sp/cafe/ticket/',
    note:'カフェを背景ではなく「芸術家が出会い、議論し、描いた場所」として見る。', homePriority:87, large:true,
    ticketEvents:[]
  },
  {
    id:'sottsass-2026', kind:'exhibition',
    title:'エットレ・ソットサス —魔法がはじまるとき、デザインは生まれる', shortTitle:'エットレ・ソットサス', aliases:['エットレ・ソットサス','ソットサス展'],
    venue:'アーティゾン美術館', area:'東京', start:'2026-06-23', end:'2026-10-04',
    image:'assets/images/exhibition-card/sottsass-2026.webp',
    guide:'', official:'https://www.artizon.museum/exhibition_sp/sottsass2026/',
    note:'「使いやすさ」だけではないデザイン。色・形・ユーモアが生活をどう変えるかを見る。', homePriority:75,
    ticketEvents:[
      {label:'スペシャルチケット 販売終了',at:'2026-09-18T19:30',minutes:1}
    ]
  },
  {
    id:'marquet-2026', kind:'exhibition',
    title:'開館50周年記念 アルベール・マルケ展', shortTitle:'アルベール・マルケ展', aliases:['アルベール・マルケ展','マルケ展'],
    venue:'SOMPO美術館', area:'東京', start:'2026-09-22', end:'2026-12-13',
    image:'assets/images/exhibition-card/marquet-2026.webp',
    guide:'', official:'https://www.sompo-museum.org/exhibitions/2025/albertmarquet/', ticketUrl:'https://www.sompo-museum.org/exhibitions/2025/albertmarquet/',
    note:'「マルケのグリ」と呼ばれる灰色と、水辺を単純化した色面の構成を見る。', homePriority:74,
    ticketEvents:[
      {label:'事前購入券 販売開始',at:'2026-08-21T10:00',minutes:30},
      {label:'事前購入券 販売終了',at:'2026-09-21T23:59',minutes:1}
    ]
  },
  {
    id:'hiroshige-best-angle-2026', kind:'exhibition',
    title:'特別展　内山晋コレクション受贈記念「歌川広重　江戸のベストアングル」', shortTitle:'歌川広重 江戸のベストアングル', aliases:['歌川広重 江戸のベストアングル','江戸のベストアングル'],
    venue:'東京国立博物館', area:'東京', start:'2026-09-29', end:'2026-12-20',
    image:'assets/images/exhibition-card/hiroshige-best-angle-2026.webp',
    guide:'', official:'https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12',
    note:'広重の風景を「名所」より先に、手前・中景・遠景の切り取り方から見る。', homePriority:79,
    ticketEvents:[]
  },
  {
    id:'fontanesi-2026', kind:'exhibition',
    title:'フォンタネージ――イタリアの光・心の風景', shortTitle:'フォンタネージ', aliases:['フォンタネージ','フォンタネージ イタリアの光・心の風景'],
    venue:'三菱一号館美術館', area:'東京', start:'2026-10-17', end:'2027-01-24',
    image:'assets/images/exhibition-card/fontanesi-2026.webp',
    guide:'', official:'https://mimt.jp/ex_sp/fontanesi/teaser/',
    note:'日本近代洋画につながる、少し暗く詩的な風景の「光」を見る。', homePriority:72,
    ticketEvents:[]
  },
  {
    id:'artizon-fujii-light-2026', kind:'exhibition',
    title:'ジャム・セッション　石橋財団コレクション×藤井光　WHOSE LIGHT? —だれのひかりか', shortTitle:'WHOSE LIGHT? —だれのひかりか', aliases:['WHOSE LIGHT?','だれのひかりか','ジャム・セッション 石橋財団コレクション×藤井光'],
    venue:'アーティゾン美術館', area:'東京', start:'2026-10-24', end:'2027-01-31',
    image:'assets/images/exhibition-card/artizon-fujii-light-2026.webp',
    guide:'', official:'https://www.artizon.museum/exhibition/detail/608',
    note:'「光＝真理」を誰が照らしているのか。作品を見る自分の立場まで含めて考える。', homePriority:69,
    ticketEvents:[]
  },
  {
    id:'nhk-nichibi50-2026', kind:'exhibition',
    title:'ＮＨＫ日曜美術館５０年展', shortTitle:'NHK日曜美術館50年展', aliases:['ＮＨＫ日曜美術館５０年展','NHK日曜美術館50年展'],
    venue:'大阪中之島美術館', area:'大阪', start:'2026-10-10', end:'2026-12-20',
    image:'assets/images/exhibition-card/nhk-nichibi50-2026.webp',
    guide:'', official:'https://nakka-art.jp/exhibition-post/nichibiten50/',
    note:'約50年分の「作品と言葉」。自分ならどの作品をどう語るか考えながら見る。', homePriority:82, large:true, bigPick:true,
    ticketEvents:[]
  },
  {
    id:'zen-ghibli-2026', kind:'exhibition',
    title:'禅とジブリ', shortTitle:'禅とジブリ', aliases:['禅とジブリ'],
    venue:'京都市京セラ美術館', area:'京都', start:'2026-10-03', end:'2026-12-06',
    image:'assets/images/exhibition-card/zen-ghibli-2026.webp',
    guide:'', official:'https://kyotocity-kyocera.museum/exhibition/20261003-20261206',
    note:'答えを急がない、分けない、ありのまま観る。ジブリを「見方」から読み直す。', homePriority:73, large:true,
    ticketEvents:[
      {label:'前売ペアチケット 販売終了',at:'2026-10-02T23:59',minutes:1}
    ]
  },
  {
    id:'ming-calligraphy-2026', kind:'exhibition',
    title:'躍動する明代の書－台北・何創時コレクションの至宝', shortTitle:'躍動する明代の書', aliases:['躍動する明代の書','台北・何創時コレクションの至宝'],
    venue:'大阪市立美術館', area:'大阪', start:'2026-10-09', end:'2026-12-20',
    image:'assets/images/exhibition-card/ming-calligraphy-2026.webp',
    guide:'', official:'https://www.osaka-art-museum.jp/special_exhibition/mindai', ticketUrl:'https://www.osaka-art-museum.jp/special_exhibition/mindai',
    note:'文字を読む前に、線の速度・太さ・余白を「絵」と同じように見る。', homePriority:65,
    ticketEvents:[
      {label:'前売券 販売終了',at:'2026-10-08T23:59',minutes:1},
      {label:'当日券 販売開始',at:'2026-10-09T09:30',minutes:30}
    ]
  },
  {
    id:'wyeth-2026', kind:'exhibition',
    title:'アンドリュー・ワイエス展', shortTitle:'アンドリュー・ワイエス展', aliases:['アンドリュー・ワイエス展','ワイエス展'],
    venue:'あべのハルカス美術館', area:'大阪', start:'2026-10-03', end:'2026-12-06',
    image:'assets/images/exhibition-card/wyeth-2026.webp',
    guide:'', official:'https://www.aham.jp/exhibition/future/wyeth/', ticketUrl:'https://www.aham.jp/exhibition/future/wyeth/',
    note:'乾いた草、古い家、人物の気配。派手さのない画面に残る「時間」を見る。', homePriority:77, large:true,
    ticketEvents:[
      {label:'前売券 販売終了',at:'2026-10-02T23:59',minutes:1}
    ]
  }

];

/* 答え合わせ美術部セレクト：定点観測する美術館 */
window.KA_SELECT_MUSEUMS = Object.freeze([
  {name:'国立西洋美術館',area:'東京',url:'https://www.nmwa.go.jp/'},
  {name:'東京都美術館',area:'東京',url:'https://www.tobikan.jp/'},
  {name:'国立新美術館',area:'東京',url:'https://www.nact.jp/'},
  {name:'東京国立博物館',area:'東京',url:'https://www.tnm.jp/'},
  {name:'東京都現代美術館',area:'東京',url:'https://www.mot-art-museum.jp/'},
  {name:'SOMPO美術館',area:'東京',url:'https://www.sompo-museum.org/'},
  {name:'三菱一号館美術館',area:'東京',url:'https://mimt.jp/'},
  {name:'アーティゾン美術館',area:'東京',url:'https://www.artizon.museum/'},
  {name:'大阪中之島美術館',area:'関西',url:'https://nakka-art.jp/'},
  {name:'京都市京セラ美術館',area:'関西',url:'https://kyotocity-kyocera.museum/'},
  {name:'大阪市立美術館',area:'関西',url:'https://www.osaka-art-museum.jp/'},
  {name:'あべのハルカス美術館',area:'関西',url:'https://www.aham.jp/'}
]);

/* ---- 旧コード向け互換ビュー。編集禁止：上のKA_EXHIBITIONSから自動生成 ---- */
window.KA_CURATED_EXHIBITIONS = window.KA_EXHIBITIONS.filter(function(x){ return x.kind === 'exhibition'; });
window.EXHIBITION_GUIDES = {};
window.KA_EXHIBITIONS.filter(function(x){ return x.guide; }).forEach(function(x){
  var meta={start:x.start,end:x.end,venue:x.venue};
  if(x.kind==='trip-guide')meta.type='trip-guide';
  var names=[x.title,x.shortTitle,x.galleryTitle].concat(x.aliases||[]).filter(Boolean);
  names.forEach(function(name){ window.EXHIBITION_GUIDES[name]=meta; });
});
window.TRAVEL_EXHIBITIONS = window.KA_EXHIBITIONS.filter(function(x){ return x.visitDate; }).map(function(x){
  return {
    visitDate:x.visitDate,
    date:x.visitLabel||x.visitDate,
    area:x.area,
    title:x.shortTitle||x.title,
    galleryTitle:x.galleryTitle||x.shortTitle||x.title,
    note:x.note||'',
    officialUrl:x.official||''
  };
});
window.EXHIBITIONS = [];
