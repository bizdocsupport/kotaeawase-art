/*
 * 記事本文データ。展覧会の会期・会場・カード画像・公式URL・チケット日程の正本は
 * assets/js/exhibitions-data.js (window.KA_EXHIBITIONS)。
 * このファイルの thumbnail / officialUrl は旧記事互換のフォールバック。
 */
window.EXHIBITION_DETAIL_DATA = Object.freeze({
  'hokusai-hiroshige-fuji': {
    slug:'hokusai-hiroshige-fuji', title:'開館10周年記念　北斎 広重　ふたりの富士、それぞれの富士', eyebrow:'HOKUSAI × HIROSHIGE',
    tagline:'北斎＝形。広重＝場所。',
    intro:'北斎は「富士を使って画面を作る」。広重は「風景の中で富士に出会わせる」。同じ富士山でも、北斎は構図の骨格として、広重は名所や旅の風景の中の存在として見せる。その違いを持って会場を歩くと、二人の個性と影響関係が見えやすくなります。',
    officialUrl:'https://hokusai-museum.jp/hokusaihiroshige/',
    hero:'assets/images/exhibition-official/hokusai-hiroshige-fuji.webp', summary:'assets/images/exhibition-html/hokusai-hiroshige-fuji-summary.webp',
    thumbnail:'assets/images/exhibition-official/hokusai-hiroshige-fuji.webp', thumbnailSource:'https://hokusai-museum.jp/uploads/files/upload_file/exhibition/chirashi_pdf/1384/%E5%8C%97%E6%96%8E%E5%BA%83%E9%87%8D_%E4%BA%8C%E4%BA%BA%E3%81%AE%E5%AF%8C%E5%A3%AB%E3%81%9D%E3%82%8C%E3%81%9E%E3%82%8C%E3%81%AE%E5%AF%8C%E5%A3%AB_%E3%83%81%E3%83%A9%E3%82%B7.pdf', thumbnailCredit:'すみだ北斎美術館 公式チラシ（表面）', thumbnailSourceType:'official-pdf',
    relatedArtists:['hokusai','hiroshige'],
    featuredWork:'ov-120',
    comparison:{
      lead:['北斎は「富士を使って画面を作る」。','広重は「風景の中で富士に出会わせる」。'],
      rows:[
        ['富士','画面の中心・骨格になりやすい','名所や旅の風景の一部として現れやすい'],
        ['構図','大胆、幾何学的、仕掛けが強い','手前・中景・遠景を使って場所の感じを作る'],
        ['人','富士と対比する小さな人々','その土地で暮らす・旅する人々'],
        ['天候・季節','富士そのものを劇的に変える','場所の空気や季節感につながる'],
        ['最初に見る問い','「どういう形で富士を見せた？」','「どこから富士を見ている？」']
      ]
    },
    highlights:[
      ['北斎は「富士の形」を探す','富士と、その周囲にある三角・円・斜線を見る。波・屋根・木材・道・人の姿などと富士を比べると、富士の三角形を別の形で繰り返したり、巨大な波と小さな富士をぶつけたりして、「富士を使って一枚の画面をどう面白く組み立てるか」を考えていることが見えてくる。'],
      ['広重は「富士までの距離」を見る','富士だけでなく、富士と自分の間に何があるかを見る。手前→中景→遠景の順に目を進めると、「ここに立ったら、こんなふうに富士が見える」という場所の体験が強くなる。'],
      ['「北斎を見た広重」を探す','北斎から広重への影響と、そこから広重が独自の表現を作る過程を見る。《神奈川沖浪裏》と《相模七里か浜辺》では「波と富士の関係」に注目。北斎は巨大な波と小さな富士を強く対決させ、広重は海・波・海岸・富士という場所全体へ視線を広げる。']
    ],
    mustSee:[
      ['北斎《神奈川沖浪裏》','富士の大きさではなく、巨大な波と小さな富士の大小関係を見る。'],
      ['北斎《凱風快晴》','富士を「山」ではなく、巨大な三角形と色面として見る。'],
      ['北斎《山下白雨》','同じ富士なのに、天候だけでどれだけ印象が変わるかを見る。'],
      ['広重《甲斐大月の原》','富士だけを見ず、手前の秋草から奥の富士まで目を動かす。「花咲く庭のように見える富士」を体験する。']
    ],
    order:['北斎を3〜5枚見て、「北斎って富士をどう配置してる？」と考える','広重を3〜5枚見て、「広重だと富士までの間に何が増えた？」と考える','最後の比較展示で、広重は北斎から何を借りて、何を変えたかを見る'],
    mantra:'北斎は「富士で構図を見る」。広重は「富士までの風景を見る」。もっと短く言うなら、北斎＝形。広重＝場所。これを頭に入れてから「本当にそう？」と反例を探すのも面白い。'
  },
  'van-gogh': {
    slug:'van-gogh', title:'大ゴッホ展', eyebrow:'VINCENT VAN GOGH',
    tagline:'暗い土色から、光る色へ',
    intro:'暗い土色の画家が、色と筆づかいを試しながら《夜のカフェテラス》へたどり着く過程を見る展覧会。完成した名作だけでなく、他の画家から何を学び、自分の線と色へ組み替えたのかを追います。',
    officialUrl:'https://grand-van-gogh-tokyo.com/',
    hero:'assets/images/exhibition-html/van-gogh-hero.webp', summary:'assets/images/exhibition-html/van-gogh-summary.webp',
    thumbnail:'assets/images/exhibition-official/van-gogh.webp', thumbnailSource:'https://grand-van-gogh-tokyo.com/', thumbnailCredit:'大ゴッホ展 東京展 公式サイト掲載《夜のカフェテラス》', thumbnailSourceType:'official-site',
    relatedArtist:'vangogh',
    featuredWork:'ov-201',
    highlights:[
      ['「暗い絵」から「光る色」へ','初期の農民画からパリ、アルルへ。色の数と細かな筆触が増え、影まで色で表すようになる変化を追う。'],
      ['他の画家から何を受け取り、どう変えたか','ミレー、モネ、ピサロ、ルノワール、新印象派などとの違いを見ながら、学んだ技法をゴッホ自身の線と色へ変えていく過程を見る。'],
      ['《夜のカフェテラス》では黄色だけを見ない','黄色いカフェ、深い青空、奥へ集まる石畳の線、星を見る。黄色と青の対比によって、互いの色が強く光る。']
    ],
    mustSee:[
      ['《じゃがいもを食べる人々》','土色の出発点。明るい代表作の前に、暗さをどう作ったかを見る。'],
      ['花の静物','パリで増えた色数と筆触の実験を見る。'],
      ['《自画像》','顔そのものより、色と筆触の試行錯誤を見る。'],
      ['《寝室》','点と線、平たい色面が空間へ変わるところを見る。'],
      ['《夜のカフェテラス》','黄色を見ると、青まで光り出す。']
    ],
    order:['暗い土色の作品からスタートする','パリで色の数が増える変化を見る','他の画家との違いを比べる','アルルで筆の向きと補色を見る','最後に《夜のカフェテラス》で色と線をまとめて見る'],
    mantra:'暗い土色から、光る色へ'
  },
  'kuniyoshi': {
    slug:'kuniyoshi', title:'歌川国芳展', eyebrow:'UTAGAWA KUNIYOSHI',
    tagline:'驚きの裏に、設計を見る',
    intro:'武者絵、美人画、役者絵、風景、戯画まで、国芳が「どう描けば一目で伝わるか」を試し続けた画面設計を見る展覧会。最初の驚きのあとに、大きさ、線の向き、身体のつながり、見立ての仕組みを確かめます。',
    officialUrl:'https://kyotocity-kyocera.museum/exhibition/20260718-20260923',
    hero:'assets/images/exhibition-html/kuniyoshi-hero.webp', summary:'assets/images/exhibition-html/kuniyoshi-summary.webp',
    thumbnail:'assets/images/exhibition-official/kuniyoshi.webp', thumbnailSource:'https://kyotocity-kyocera.museum/exhibition/20260718-20260923', thumbnailCredit:'京都市京セラ美術館 公式展覧会ページ キービジュアル', thumbnailSourceType:'official-site',
    relatedArtist:'kuniyoshi',
    highlights:[
      ['三枚続を「横長の一画面」として見る','巨大な鯨や骸骨、人物、波、武器など、斜めに走る線を目で追う。三枚を同じ大きさに分けず、大きな形を紙の中に収める設計を見る。'],
      ['妖怪の「怖さ」より、身体の仕組みを見る','顔だけでなく、骸骨の背骨・肩・肘・指のつながりを追う。ありえない存在でも、骨や関節に説得力がある。'],
      ['「人や猫で別の形を作る」発想を見る','一度離れて全体が何に見えるかを確認し、近づいて何人・何匹がどう組み合わされているかを見る。']
    ],
    mustSee:[
      ['《相馬の古内裏》','巨大な骸骨、三枚続の構成、身体の描写力を一度に見る。'],
      ['《宮本武蔵と巨鯨》','人間を小さくして、戦いそのものを大きく見せる。'],
      ['《みかけハこハゐがとんだいゝ人だ》','一つの顔に二つの見方を入れる見立ての発想を見る。']
    ],
    order:['第1幕のアクションで身体がどちらへ動くかを見る','モンスターで骨・手足・身体の大きさを見る','美人画で着物の柄や大きな身ぶりを見る','ハンサムで役者の顔・視線・立ち姿を見る','ヴィジョンで風景や奥行きの重ね方を見る','最後にアイデアで見立て・猫・戯画を見る'],
    mantra:'驚きの裏に、設計を見る'
  },
  'suikoden': {
    slug:'suikoden', title:'水滸伝展', eyebrow:'SUIKODEN',
    tagline:'豪傑は、時代ごとに姿を変える',
    intro:'中国で生まれた英雄の物語が、日本で浮世絵、文学、漫画、現代美術へどう変化したかをたどる展覧会。人物名を全部覚えるより、豪傑の身体表現、時代ごとの英雄像、日本独自の作り替え方を比較します。',
    officialUrl:'https://www.yomiuri-osaka.com/lp/suikoden/',
    hero:'assets/images/exhibition-html/suikoden-hero.webp', summary:'assets/images/exhibition-html/suikoden-summary.webp',
    thumbnail:'assets/images/exhibition-official/suikoden.webp', thumbnailSource:'https://www.yomiuri-osaka.com/lp/suikoden/', thumbnailCredit:'大阪市立美術館 公式展覧会ページ バナー', thumbnailSourceType:'official-site',
    highlights:[
      ['国芳の74図を「キャラクター図鑑」として見る','一枚ずつ暗記せず、躍動して見える人、深い刺青が目立つ人、武器を持つ人などを選び、姿勢や背景、持ち物の違いを見る。'],
      ['「物語の舞台」と「実際の北宋美術」を分けて見る','燕文貴の山水や青磁などを見て、物語を描いた浮世絵と当時の美術の違いを比べる。'],
      ['英雄が日本で別の姿へ変わる過程を見る','北斎、国芳、八犬伝、白髪一雄、さいとう・たかをなど、時代ごとに表現のしかたがどう変わるかを見る。']
    ],
    mustSee:[
      ['歌川国芳「通俗水滸伝」シリーズ','展覧会全体へ入る入口。人物の設定を一枚の姿勢で伝える。'],
      ['燕文貴《江山楼観図》','人物より大きな山水世界。空間の作り方を見る。'],
      ['青磁 水仙盆','静かな色を、近くで長く見る。']
    ],
    order:['まず国芳で人物を覚える','派手さを一度リセットして中国美術を見る','物語がどう日本へ取り込まれたかを見る','日本での作り替えを追う','現代の表現へ進む'],
    mantra:'豪傑は、時代ごとに姿を変える'
  },
  'kyosai': {
    slug:'kyosai', title:'河鍋暁斎の世界', eyebrow:'KAWANABE KYOSAI',
    tagline:'笑う前に、線を見る',
    intro:'妖怪や戯画の面白さだけでなく、「何でも描ける確かな画力」と、まじめな題材を少しずらす発想を見る展覧会。笑って終わらず、足の曲がり、指の位置、衣服の線、墨の速さを追います。',
    officialUrl:'https://kyosai2026.exhibit.jp/',
    hero:'assets/images/exhibition-html/kyosai-hero.webp', summary:'assets/images/exhibition-html/kyosai-summary.webp',
    thumbnail:'assets/images/exhibition-official/kyosai.webp', thumbnailSource:'https://kyosai2026.exhibit.jp/', thumbnailCredit:'『河鍋暁斎の世界』公式サイト キービジュアル', thumbnailSourceType:'official-site',
    relatedArtist:'kyosai',
    highlights:[
      ['「うまい」と「おかしい」が同居するところ','鬼、妖怪、骸骨、蛙などの身体を見て、足の曲がり方、手の位置、衣服の線、身体の重心を追う。'],
      ['同じ題材が、怖さと愛嬌の間を動くところ','猫、蛙、狐、鬼の目・口・手足を見る。「怖い／かわいい」と先に決めず、人間のように振る舞う動物や間の抜けた鬼を探す。'],
      ['墨の速さと、仕上げの細かさを比べる','即興的な墨線と、色を重ねて仕上げた肉筆画を比べ、線が一気に引かれた場所と途中で止まる場所を見る。']
    ],
    mustSee:[
      ['《地獄太夫と一休》','ユーモア、人物画、精密な仕上げが一枚に集まる。'],
      ['《三味線を弾く洋装の骸骨と踊る妖怪》','ありえない場面を、身体の動きで納得させる。'],
      ['《風流蛙大合戦之図》','蛙の戦争に、人間の癖を見る。']
    ],
    order:['スター作品で一気に描いた線を見る','けもの・ひと・おにで人間らしい姿勢を探す','かみ・ほとけで線の緊張感を見る','版画で一枚の細部より斜めの動きや人物の密集を見る'],
    mantra:'笑う前に、線を見る'
  },
  'van-gogh-bridge': {
    slug:'van-gogh-bridge', title:'ゴッホの跳ね橋と印象派の画家たち', eyebrow:'VAN GOGH × IMPRESSIONISM',
    tagline:'自然の見方が変わるリレーを追う',
    intro:'印象派の名画を集めただけでなく、19世紀の画家たちが「自然をどう見るか」を受け継ぎ、光・形づかい・色の表現を変えていく過程を見る展覧会。ゴッホ作品だけではなく、前後の画家と比べることが入口です。',
    officialUrl:'https://www.aham.jp/exhibition/future/wallraf/',
    hero:'assets/images/exhibition-html/van-gogh-bridge-hero.webp', summary:'assets/images/exhibition-html/van-gogh-bridge-summary.webp',
    thumbnail:'assets/images/exhibition-official/van-gogh-bridge.webp', thumbnailSource:'https://www.aham.jp/exhibition/future/wallraf/', thumbnailCredit:'あべのハルカス美術館 公式展覧会ページ掲載《跳ね橋》 Photo: © RBA, Cologne', thumbnailSourceType:'official-site',
    relatedArtist:'vangogh',
    highlights:[
      ['印象派は突然生まれたのかを見る','海・川・空・木など同じ要素の描き方を比較し、時間のはかり方、色の置き方、筆致が光になる瞬間を見る。'],
      ['ゴッホの3年間の変化を見る','暗い色と明るい色、輪郭線の強さ、葉の動きを比べ、暗い実験色から印象派に触れた後の明るさ、跳ね橋へ至る変化を見る。'],
      ['光の表現が「色の仕組み」へ変わるところ','モネ→シニャック→マティスなどを並べ、近くで絵具を見て、離れて色がどう混ざるか確かめる。']
    ],
    mustSee:[
      ['ゴッホ《跳ね橋》','勢いだけでなく、橋の構造と色の重なりを見る。'],
      ['マネ《アスパラガスの木の束》','普通の野菜を、色と筆触の主役にする。'],
      ['モネ→シニャックの比較','印象派と点描派の光・色・筆触の違いを見る。']
    ],
    order:['最初の2章で絵の歴史との変化を見る','第3章の印象派で自然の光を見る','第4章のポスト印象派で色が理論へ変わるのを見る','第5章の点描派で色の分離を見る','第6章の20世紀の色彩画家へ進む','最後にもう一度全体を見て、同じ景色がどう変わって見えるか確認する'],
    mantra:'自然の見方が変わるリレーを追う'
  },
  'picasso-paul-smith': {
    slug:'picasso-paul-smith', title:'ピカソmeetsポールスミス', eyebrow:'PICASSO × PAUL SMITH',
    tagline:'見方を着替える',
    intro:'ピカソの作品だけでなく、ポール・スミスが作った「作品の見え方」まで鑑賞する展覧会。部屋ごとに色や模様が変わるため、作品だけを見るのではなく、壁・床・展示物との組み合わせまで見るのがポイントです。',
    officialUrl:'https://www.nact.jp/exhibition_special/2026/picasso_paulsmith/',
    hero:'assets/images/exhibition-html/picasso-paul-smith-hero.webp', summary:'assets/images/exhibition-html/picasso-paul-smith-summary.webp',
    thumbnail:'assets/images/exhibition-official/picasso-paul-smith.webp', thumbnailSource:'https://www.nact.jp/exhibition_special/2026/picasso_paulsmith/', thumbnailCredit:'国立新美術館 公式展覧会ページ キービジュアル', thumbnailSourceType:'official-site',
    relatedArtist:'picasso',
    highlights:[
      ['同じ画家とは思えない「変化」を見る','青の時代→キュビスム→古典的な人物画→陶芸→晩年まで、色・形・素材のうち一つだけを前の部屋と比べる。'],
      ['作品を見る前と後で、壁を見直す','黄色と青のストライプや濃い緑の壁など、背景の色や模様が作品の輪郭・衣装・画面のリズムをどう強く見せるかを見る。'],
      ['「描く」以外の作り方を見る','自転車部品、印刷物、布、木、陶器などを使った作品を探し、貼る・組み合わせる・見立てるという作り方を見る。']
    ],
    mustSee:[
      ['《牡牛の頭部》','サドルとハンドルが、どの瞬間に自転車部品へ戻って見えるか。'],
      ['《男の肖像》','一色に見えても、青の明るさや混ざり方が何種類あるか。'],
      ['《草上の昼食（マネに基づく）》の作品群','過去の名画を分解して、別の仕組みに作り直す。']
    ],
    order:['最初の《牡牛の頭部》で解説を読む前に何に見えたか覚える','青の時代からキュビスムまで色と形の変化だけ追う','中盤で過去の名画との比較を見る','後半は陶芸など絵画以外の素材や作り方を見る','最後に晩年作へ進み、初期の壁や線との自由さを比べる'],
    mantra:'見方を着替える'
  },
  'kansai-ukiyoe': {
    slug:'kansai-ukiyoe', title:'関西浮世絵', eyebrow:'TRAVEL × UKIYO-E',
    tagline:'豪傑から弟子へ、弟子から師匠へ',
    intro:'水滸伝→河鍋暁斎→歌川国芳をめぐる関西の比較鑑賞ガイド。3展を別々に見るのではなく、国芳の豪傑表現、弟子・暁斎が受け継いで広げた線と発想、最後に国芳展で師匠の全体像へ戻る順番で見るとつながりが見えます。',
    hero:'assets/images/exhibition-html/kansai-ukiyoe-hero.webp', summary:'assets/images/exhibition-html/kansai-ukiyoe-summary.webp',
    thumbnail:'assets/images/exhibition-html/kansai-ukiyoe-summary.webp',
    highlights:[
      ['水滸伝｜豪傑表現の入口','国芳が人気絵師になる重要な画題。豪傑の身体・武器・勢いを見る。後の国芳鑑賞の入口にする。'],
      ['河鍋暁斎｜弟子が線と発想を広げる','国芳の弟子として何を受け継いだかを見る。速い輪郭線、身体をひねる動き、笑いと異様さの混ぜ方に注目。'],
      ['歌川国芳｜師匠の全体像で答え合わせ','武者絵の迫力、水滸伝ものの再比較、猫・戯画・寄せ絵の遊び心まで見て、国芳の幅を確認する。']
    ],
    mustSee:[
      ['水滸伝','豪傑表現の入口'],
      ['河鍋暁斎','弟子が線と発想を広げる'],
      ['歌川国芳','師匠の全体像で答え合わせ']
    ],
    order:['水滸伝で豪傑の身体・武器・勢いを見る','暁斎で国芳から何を受け継ぎ、何を変えたかを見る','国芳展で武者絵・戯画・猫まで全体像へ戻る'],
    mantra:'豪傑から弟子へ、弟子から師匠へ'
  },
  'leo-lionni-friends': {
    slug:'leo-lionni-friends', title:'レオ・レオーニと仲間たち', eyebrow:'LEO LIONNI AND FRIENDS',
    tagline:'「スイミーの人」が、どうやって“スイミーの人”になったのかを見る。',
    intro:'『スイミー』『フレデリック』の原画展だと思って行くと、かなり印象が変わる展覧会。約370点を通して、レオ・レオーニを絵本作家だけでなく、画家・デザイナー・アートディレクター・彫刻家として、20世紀美術の人脈ごと見る。ヨーロッパ美術→1930年代のデザイン→ニューヨークの広告→絵画・彫刻→絵本、という5章の流れを追うと、最後の絵本原画まで一本につながります。',
    officialUrl:'https://www.nagasaki-museum.jp/archives/exhibition_post/30717',
    hero:'assets/images/exhibition-official/leo-lionni-friends.webp',
    thumbnail:'assets/images/exhibition-official/leo-lionni-friends.webp',
    thumbnailSource:'https://www.nagasaki-museum.jp/archives/exhibition_post/30717',
    thumbnailCredit:'長崎県美術館 公式展覧会ページ メインビジュアル',
    thumbnailSourceType:'official-site',
    highlights:[
      ['「絵本作家になる前」がかなり長い','最初の絵本『あおくんときいろちゃん』を出したのは1959年、49歳頃。それ以前はミラノの広告・出版、アメリカの広告業界で長く活動し、MoMAやオリヴェッティ社、『フォーチュン』誌のアートディレクションも手がけた。1930年代の広告やポスターでは、「かわいいか」より、少ない形でどう伝えるか、文字と絵をどう置くか、最初にどこへ目が行くかを見る。後の絵本のシンプルな形は突然生まれたものではないと分かります。'],
      ['「仲間たち」を飛ばさない','タイトルの「仲間たち」が重要。若い頃のイタリアではブルーノ・ムナーリら未来派周辺の作家と活動し、ソール・スタインバーグとも交流。アメリカではベン・シャーン、アレクサンダー・カルダーらとも関係を築いた。「どっちがどっちに影響した？」と答えを決めるより、線の使い方、形の単純化、真面目な美術の中にある遊びを比べる。国芳→暁斎→コンドルのような人のつながりを、20世紀のヨーロッパとアメリカで見る感じです。'],
      ['最後に絵本原画を見ると、それまで全部が戻ってくる','最終章では『フレデリック』『マシューのゆめ』などの原画を見る。キャラクターだけでなく、紙・色・輪郭・素材に近づき、「これ、筆で全部描いてる？」と確認する。コラージュやモノタイプなど多様な技法を使うので、遠くでは「フレデリック」、近くでは「切った紙・色・形」へ見え方が切り替わる。']
    ],
    mustSee:[
      ['1930年代の広告','絵本以前の「伝えるデザイン」。少ない形、文字との位置関係、視線の誘導を見る。'],
      ['《ニューヨーク近代美術館 開館25周年記念ポスター》1954','一流アートディレクターとしての仕事。どこに最初に目が行くか、少ない要素でどう情報を整理しているかを見る。'],
      ['「平行植物」シリーズ','実在しない植物を、本当にありそうな植物として油彩、細密画、ブロンズ、書籍など複数の方法で作る。「植物の絵？」→「架空？」→「なぜ本当にありそう？」と順番に見る。'],
      ['『フレデリック』などの絵本原画','最後に「知っているレオーニ」へ戻る。キャラクターより、切った紙・色・形・輪郭に近づく。']
    ],
    order:[
      '第1章 アムステルダム｜幼少期にシャガールなど美術に囲まれた環境を見る。「何を見て育った？」から始める。',
      '第2章 イタリア｜ムナーリ、スタインバーグ、未来派、広告を見る。「美術とデザインがどう混ざった？」を探す。',
      '第3章 ニューヨーク｜広告・MoMA・『フォーチュン』を見て、「少ない形で伝える力」がどう磨かれたかを見る。',
      '第4章 イタリアへ戻る｜絵画・彫刻・架空の植物へ。「売るためのデザイン」から自分の作品へ何が変わったかを見る。',
      '第5章 絵本｜『フレデリック』などの原画で、「今まで見てきたものが絵本にどう残っている？」を答え合わせする。'
    ],
    mantra:'「絵本になる前」を見る。／「かわいい」だけで終わらず、形と素材を見る。'
  },
  'hajimete-bijutsu': {
    slug:'hajimete-bijutsu', title:'はじめてびじゅつ', eyebrow:'MOT COLLECTION',
    tagline:'分からないまま、見始める',
    intro:'現代美術の意味を覚える展覧会ではなく、「どう見始めればよいか」を試す展覧会。身のまわりから始める、初めて見るってどういうこと？、作品の生まれるところは？という問いに沿って、日用品に近いもの、絵画、立体、映像、制作資料を見ていきます。',
    officialUrl:'https://www.mot-art-museum.jp/exhibitions/mot-collection-260428/',
    hero:'assets/images/exhibition-html/hajimete-bijutsu-hero.webp', summary:'assets/images/exhibition-html/hajimete-bijutsu-summary.webp',
    thumbnail:'assets/images/exhibition-official/hajimete-bijutsu.webp', thumbnailSource:'https://www.mot-art-museum.jp/exhibitions/mot-collection-260428/', thumbnailCredit:'東京都現代美術館 公式展覧会ページ メインビジュアル', thumbnailSourceType:'official-site',
    highlights:[
      ['「これは美術？」と思った作品で立ち止まる','最初に「何に見えたか」を覚え、次に作品名と素材を確認する。珍しいものを作るだけではなく、見慣れたものから別の見方を差し出す作品が多い。'],
      ['近くと遠くで、絵が変わる瞬間を見る','まず少し離れて全体を見て、次に近づき点・太い輪郭・赤・黄・青の使い方を確認する。'],
      ['完成作品だけでなく「作っている途中」を見る','完成した絵を先に見たあと、トレーシングペーパー、筆、イーゼルなど関連資料を見て、もう一度作品へ戻る。']
    ],
    mustSee:[
      ['庄井良平《Fence》','形、素材、物と物の接し方を見る。知っている物が、知らない物に変わる。'],
      ['ロイ・リキテンスタイン《ヘア・リボンの少女》','顔より先に、点・輪郭・三原色を見る。'],
      ['中西夏之の作品群と制作資料','絵を、筆の動きから見る。']
    ],
    order:['最初の部屋では分からない作品を一つ選ぶ','次に、近くと遠くで見え方が変わる作品を探す','後半では手の動きや制作方法を想像できる作品を見る','最後に最初は分からなかった作品へ戻る'],
    mantra:'分からないまま、見始める'
  },
  'tada-minami': {
    slug:'tada-minami', title:'多田美波', eyebrow:'MINAMI TADA',
    tagline:'光と一緒に歩いて見る',
    intro:'彫刻そのものより、光と周囲の空間がどう変わるかを見る展覧会。ステンレス、アクリル、ガラスなどの工業素材を使い、反射・透過・屈折を造形の中心に置いた多田美波の約70年を、絵画、彫刻、光造形、建築資料までたどります。',
    officialUrl:'https://www.mot-art-museum.jp/exhibitions/Tada-Minami/',
    hero:'assets/images/exhibition-html/tada-minami-hero.webp', summary:'assets/images/exhibition-html/tada-minami-summary.webp',
    thumbnail:'assets/images/exhibition-official/tada-minami.webp', thumbnailSource:'https://www.mot-art-museum.jp/exhibitions/Tada-Minami/', thumbnailCredit:'東京都現代美術館 公式展覧会ページ メインビジュアル（公式GIFの先頭フレーム）', thumbnailSourceType:'official-site',
    highlights:[
      ['作品の前で、横に一歩動く','正面で止まらず、左右へゆっくり移動する。自分の姿、別の作品、照明がどう映り込むかを比べる。'],
      ['絵画から「光造形」への変化を見る','初期の絵画、ブロンズ彫刻、アクリルやステンレスの作品、照明作品の順に、輪郭・表面・素材の扱いがどう変化するかを見る。'],
      ['美術・建築・デザインの境目を見る','シャンデリア、光壁、建築造形の部品や写真・スケッチを見て、「これは彫刻か、照明か、建築の一部か」と考える。']
    ],
    mustSee:[
      ['反射・透過する作品群','表面に映る周囲と、透明部分を通して見える奥を比べる。'],
      ['「光造形」と建築資料','作品だけでなく、写真やスケッチも見て、実際の建築では人の動線や天井、外光と結びつくことを知る。'],
      ['アトリウム／屋外作品','自然光と人工光で、作品の表情がどう変わるかを見る。']
    ],
    order:['最初は作品名を細かく覚えず、素材の変化だけ追う','初期絵画では形がどう分割・単純化されているか見る','金属やアクリルでは正面から見た後に横へ動く','光造形では器具本体より床・壁・天井に生じる光を見る','建築資料では作品と人間の大きさを比べる','最後に自然光の入る場所で、光と一緒に作品を見る'],
    mantra:'光と一緒に歩いて見る'
  }
});
