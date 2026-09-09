"""答え合わせ美術部｜展覧会自動取得の設定。

Phase 2A は『取得・GitHub記録のみ』です。
本番 docs/ には書き込みません。
"""

MUSEUM_SOURCES = [
    {
        "key": "nmwa",
        "venue": "国立西洋美術館",
        "area": "東京",
        "url": "https://www.nmwa.go.jp/jp/exhibitions/",
        "include_url": "/jp/exhibitions/",
        "exclude_title": ["常設展", "コレクション・イン・フォーカス"],
    },
    {
        "key": "tobikan",
        "venue": "東京都美術館",
        "area": "東京",
        "url": "https://www.tobikan.jp/exhibition/",
        "include_url": "/exhibition/",
        "exclude_title": ["公募展"],
    },
    {
        "key": "nact",
        "venue": "国立新美術館",
        "area": "東京",
        "url": "https://www.nact.jp/exhibition_special/",
        "include_url": "/exhibition_special/",
    },
    {
        "key": "tnm",
        "venue": "東京国立博物館",
        "area": "東京",
        "url": "https://www.tnm.jp/modules/r_exhibition/index.php?cid=1&controller=ctg&lang=ja",
        "include_url": "r_exhibition",
        "exclude_title": ["総合文化展"],
    },
    {
        "key": "mot",
        "venue": "東京都現代美術館",
        "area": "東京",
        "url": "https://www.mot-art-museum.jp/exhibitions/",
        "include_url": "/exhibitions/",
    },
    {
        "key": "sompo",
        "venue": "SOMPO美術館",
        "area": "東京",
        "url": "https://www.sompo-museum.org/exhibitions/",
        "include_url": "/exhibitions/",
    },
    {
        "key": "mimt",
        "venue": "三菱一号館美術館",
        "area": "東京",
        # 展覧会一覧URLが環境により不安定なため、トップの開催中/次回カードを監視。
        "url": "https://mimt.jp/",
        "include_url": "/exhibition/",
        "exclude_title": ["小企画展"],
    },
    {
        "key": "artizon",
        "venue": "アーティゾン美術館",
        "area": "東京",
        "url": "https://www.artizon.museum/exhibition/",
        "include_url": "/exhibition/",
    },
    {
        "key": "nakka",
        "venue": "大阪中之島美術館",
        "area": "大阪",
        # /exhibition/ は過去展へリダイレクトされるため、開催中ページを使用。
        # このページには開催予定も併記される。
        "url": "https://nakka-art.jp/exhibition/held/",
        "include_url": "/exhibition/",
    },
    {
        "key": "kyocera",
        "venue": "京都市京セラ美術館",
        "area": "京都",
        "url": "https://kyotocity-kyocera.museum/ja/exhibition",
        "include_url": "/exhibition/",
        "exclude_title": ["コレクションルーム予定"],
    },
    {
        "key": "osaka-art",
        "venue": "大阪市立美術館",
        "area": "大阪",
        "url": "https://www.osaka-art-museum.jp/special_exhibition",
        "include_url": "special_exhibition",
    },
    {
        "key": "aham",
        "venue": "あべのハルカス美術館",
        "area": "大阪",
        "url": "https://www.aham.jp/exhibition/future/",
        "include_url": "/exhibition/",
    },
]

USER_AGENT = "KotaeawaseArtExhibitionBot/2.0 (+https://hillslife.tokyo/art/)"
REQUEST_TIMEOUT_SECONDS = 30
# 終了90日前～開始730日先までを監視対象にする。
PAST_GRACE_DAYS = 90
FUTURE_HORIZON_DAYS = 730
