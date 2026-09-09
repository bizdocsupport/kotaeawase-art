"""答え合わせ美術部｜展覧会自動取得の設定。

Phase 2A.1 は『取得精度の改善』です。
本番 docs/ には書き込みません。
"""

MUSEUM_SOURCES = [
    {
        "key": "nmwa",
        "venue": "国立西洋美術館",
        "area": "東京",
        "urls": [
            "https://www.nmwa.go.jp/jp/exhibitions/",
            "https://www.nmwa.go.jp/jp/exhibitions/upcoming.html",
        ],
        "include_url": "/jp/exhibitions/",
        "detail_url_regex": r"/jp/exhibitions/20\d{2}[^/?#]*\.html$",
        "exclude_title": ["常設展", "コレクション・イン・フォーカス"],
    },
    {
        "key": "tobikan",
        "venue": "東京都美術館",
        "area": "東京",
        "url": "https://www.tobikan.jp/exhibition/",
        "include_url": "/exhibition/",
        "detail_url_regex": r"/exhibition/20\d{2}_[^/?#]+\.html$",
        "exclude_title": ["公募展"],
    },
    {
        "key": "nact",
        "venue": "国立新美術館",
        "area": "東京",
        "url": "https://www.nact.jp/exhibition_special/",
        "include_url": "/exhibition_special/",
        "detail_url_regex": r"/exhibition_special/20\d{2}/[^/?#]+/?$",
    },
    {
        "key": "tnm",
        "venue": "東京国立博物館",
        "area": "東京",
        "url": "https://www.tnm.jp/modules/r_exhibition/index.php?cid=1&controller=ctg&lang=ja",
        "include_url": "r_exhibition",
        "exclude_url_regex": r"controller=ctg|cid=1(?:&|$)",
        "exclude_title": ["総合文化展", "過去の特別展"],
    },
    {
        "key": "mot",
        "venue": "東京都現代美術館",
        "area": "東京",
        "url": "https://www.mot-art-museum.jp/exhibitions/",
        "include_url": "/exhibitions/",
        "detail_url_regex": r"/exhibitions/\d+/?$",
    },
    {
        "key": "sompo",
        "venue": "SOMPO美術館",
        "area": "東京",
        "urls": [
            "https://www.sompo-museum.org/exhibitions/",
            "https://www.sompo-museum.org/exhibitions/schedule/",
        ],
        "include_url": "/exhibitions/",
        "detail_url_regex": r"/exhibitions/20\d{2}/[^/?#]+/?$",
    },
    {
        "key": "mimt",
        "venue": "三菱一号館美術館",
        "area": "東京",
        # トップページはGitHub Actions環境で403になる場合があるため展覧会一覧を直接監視。
        "url": "https://mimt.jp/exhibition/",
        "detail_url_regex": r"/(?:ex_sp|exhibition)/[^?#]+/?$",
        "exclude_url_regex": r"/exhibition/?$|/exhibition/(?:schedule|past)/?",
        "exclude_title": ["小企画展", "展覧会スケジュール", "小企画展スケジュール"],
    },
    {
        "key": "artizon",
        "venue": "アーティゾン美術館",
        "area": "東京",
        "url": "https://www.artizon.museum/exhibition/",
        "include_url": "/exhibition/",
        "detail_url_regex": r"/exhibition/detail/\d+/?$",
    },
    {
        "key": "nakka",
        "venue": "大阪中之島美術館",
        "area": "大阪",
        "url": "https://nakka-art.jp/exhibition/held/",
        # 詳細ページは /exhibition-post/。旧設定 /exhibition/ はナビだけを拾っていた。
        "detail_url_regex": r"/exhibition-post/[^/?#]+/?$",
    },
    {
        "key": "kyocera",
        "venue": "京都市京セラ美術館",
        "area": "京都",
        "url": "https://kyotocity-kyocera.museum/ja/exhibition",
        "detail_url_regex": r"/exhibition/20\d{6}-20\d{6}(?:-\d+)?/?$",
        "exclude_title": ["コレクションルーム予定"],
    },
    {
        "key": "osaka-art",
        "venue": "大阪市立美術館",
        "area": "大阪",
        "url": "https://www.osaka-art-museum.jp/special_exhibition",
        "include_url": "/special_exhibition/",
        "detail_url_regex": r"/special_exhibition/[^/?#]+/?$",
    },
    {
        "key": "aham",
        "venue": "あべのハルカス美術館",
        "area": "大阪",
        "url": "https://www.aham.jp/exhibition/future/",
        "include_url": "/exhibition/future/",
        "detail_url_regex": r"/exhibition/future/[^/?#]+/?$",
    },
]

# 普段のブラウザに近いUA。bot名を前面に出すと403になる館がある。
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36"
)
REQUEST_TIMEOUT_SECONDS = 30
# 終了90日前～開始730日先までを監視対象にする。
PAST_GRACE_DAYS = 90
FUTURE_HORIZON_DAYS = 730
