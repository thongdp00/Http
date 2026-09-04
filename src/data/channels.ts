import { CategoryInfo, Channel } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'vtv', name: 'VTV', iconName: 'Tv' },
  { id: 'vtvcab', name: 'VTVcab', iconName: 'Tv2' },
  { id: 'htv', name: 'HTV', iconName: 'MonitorPlay' },
  { id: 'sctv', name: 'SCTV', iconName: 'Film' },
  { id: 'thethaoquocte', name: 'Thể thao quốc tế', iconName: 'Trophy' },
  { id: 'sukien', name: 'Sự Kiện', iconName: 'Sparkles' },
  { id: 'diaphuong', name: 'Địa Phương', iconName: 'MapPin' },
  { id: 'phim', name: 'Phim truyện', iconName: 'Clapperboard' },
  { id: 'quocte', name: 'Quốc Tế', iconName: 'Globe' },
  { id: 'nghenhac', name: 'Nghe nhạc', iconName: 'Music' },
];

const rawVtvChannels: Omit<Channel, 'number'>[] = [
  {
    "id": "vtv1-hd",
    "name": "VTV1 HD",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/1.png",
    "url": "https://vips-livecdn.fptplay.net/live/media/vtv1/live247-hls-avc/index.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtv2-hd",
    "name": "VTV2 HD",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/2.png",
    "url": "https://vips-livecdn.fptplay.net/live/media/vtv2/live247-hls-avc/index.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtv3-hd",
    "name": "VTV3 HD",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/3.png",
    "url": "https://vips-livecdn.fptplay.net/live/media/vtv3/live247-hls-avc/index.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtv4-hd",
    "name": "VTV4 HD",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/4.png",
    "url": "https://live.fptplay53.net/fnxhd1/vtv4hd_vhls.smil/chunklist.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtv5-hd",
    "name": "VTV5 HD",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/5.png",
    "url": "https://live.fptplay53.net/fnxhd1/vtv5hd_vhls.smil/chunklist.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtv5-hd-tnb",
    "name": "VTV5 HD - Tây Nam Bộ",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/5TNB.png",
    "url": "https://live.fptplay53.net/fnxhd1/vtv5tnb_vhls.smil/chunklist.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtv5-hd-tn",
    "name": "VTV5 HD - Tây Nguyên",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/5TN.png",
    "url": "https://vips-livecdn.fptplay.net/live/media/vtv5tn/live-hls-avc/index.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtv6-hd",
    "name": "VTV6 HD",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/6.png",
    "url": "https://vips-livecdn.fptplay.net/live/media/vtv6/live247-hls-avc/index.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtv7-hd",
    "name": "VTV7 HD",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/7.png",
    "url": "https://vips-livecdn.fptplay.net/live/media/vtv7/live247-hls-avc/index.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtv8-hd",
    "name": "VTV8 HD",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/8.png",
    "url": "https://live.fptplay53.net/fnxhd1/vtv8hd_vhls.smil/chunklist.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtv9-hd",
    "name": "VTV9 HD",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/9.png",
    "url": "https://vips-livecdn.fptplay.net/live/media/vtv9/live247-hls-avc/index.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtv10-hd",
    "name": "VTV10 HD",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/10.png",
    "url": "https://vips-livecdn.fptplay.net/live/media/vtv10/live247-hls-avc/index.m3u8",
    "userAgent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vietnam-today",
    "name": "VietNam Today",
    "category": "vtv",
    "categoryName": "VTV",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/VNTD.png",
    "url": "https://live.fptplay53.net/fnxhd1/vntoday_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  }
];

const rawVtvcabChannels: Omit<Channel, 'number'>[] = [
  {
    "id": "vtvcab-bibi",
    "name": "On BiBi",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/Logo/refs/heads/main/onbibi.png",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=178",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "vtvcab-cine",
    "name": "ON Cine",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://i.ytimg.com/vi/rwhsuTvSXxo/maxresdefault.jpg",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=176",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "vtvcab-e-channel",
    "name": "ON E- Channel",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/Logo/refs/heads/main/onechannel.png",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=182",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "vtvcab-info",
    "name": "ON Info TV",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://img-ali1.tv360.vn/image1/2023/07/19/09/1689732099410/a13853e5de55_480_270.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=189&expires=1787186707&token=91e6e10d50eb540c3ca2f89b60f5ed44",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls",
    "drm": {
      "type": "clearkey",
      "keys": {
        "39425f1a9f7f4db985b5e7b2e65e4208": "63e3aad2bc5bed77e59724ba8d2e94f0"
      }
    }
  },
  {
    "id": "onkids",
    "name": "On Kids",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://assets-vtvcab.gviet.vn/images/v2/channel/20220613/2022061306/onkids5_1675158859.webp",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=179",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtvcab-life",
    "name": "On Life",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://img-ali1.tv360.vn/image1/2023/07/19/09/1689732652862/f124f55c3587_640_360.png",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=188",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtvcab-movies",
    "name": "On Movies - You TV",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/onmovi.png",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=181",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "vtvcab-music",
    "name": "On Music",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://img-zlr1.tv360.vn/image1/2023/07/20/10/1689822524259/0f3a4d1ebfaf_640_360.png",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=185",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "vtvcab-o2tv",
    "name": "On O2TV",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/Logo/refs/heads/main/ono2tv.png",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=136",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "vtvcab-phim-viet",
    "name": "ON Phim Việt",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/Logo/refs/heads/main/ONPHIMVIET.png",
    "url": "https://livevlisctcdnw.seenow.vn/livesnv2/PHIM_VIET/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "7417db88928243fda4e03596bbd19a27": "eebb689de1191ae1b207d32f0d5ca9fe"
      }
    }
  },
  {
    "id": "vtvcab-style",
    "name": "ON Style TV",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://vietanhtv.id.vn/logo/onstyle.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=184&expires=1787186707&token=94be7ed43cc9628ff1a49d56a1927b2d",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls",
    "drm": {
      "type": "clearkey",
      "keys": {
        "414a288afe3d4f3985407d9613ec21eb": "31d12c6d561e208f4c79b4a6c280dd5b"
      }
    }
  },
  {
    "id": "vtvcab-trending",
    "name": "ON TRENDING TV",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://vietanhtv.id.vn/logo/ontrendingtv.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=186&expires=1786932337&token=039ff0db68189e01fbdfdf2b87cf0118",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls",
    "drm": {
      "type": "clearkey",
      "keys": {
        "765c826c381e4d58849784bb206c8e90": "2970317ebf86d70fa11434eab4c59c5d"
      }
    }
  },
  {
    "id": "vtvcab-v-family",
    "name": "ON V Family",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://i.ibb.co/HHfL7Dq/cocab20.webp",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=187",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "vtvcab-vie-dramas",
    "name": "ON Vie Dramas",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://i.ytimg.com/vi/4SqDlPT8oEI/maxresdefault.jpg",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=177",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "vtvcab-vie-giai-tri",
    "name": "ON Vie Giải Trí",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://i.ytimg.com/vi/fyT_xa-g-Pk/hq720.jpg",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=180",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "vtvcab-on-football",
    "name": "ON Football",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://assets-vtvcab.gviet.vn/images/hq/posters/_ootball_-_opyright_by_cab_logo_202212.jpg",
    "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv265/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "widevine",
      "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
    },
    "sources": [
      {
        "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv265/manifest.mpd",
        "type": "mpd",
        "drm": {
          "type": "widevine",
          "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
        }
      },
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=174&expires=1786534141&token=1fb93f2a6a6fd3a0352438a285eadeac",
        "type": "mpd",
        "drm": {
          "type": "clearkey",
          "keys": {
            "f3d73b3a9b89462ebf7911004ea3b3b9": "2e547a81ff90aa02648cb9e3f79e7339"
          }
        }
      }
    ]
  },
  {
    "id": "vtvcab-on-sports",
    "name": "ON SPORTS",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://assets-vtvcab.gviet.vn/images/hq/posters/_ports_ng_logo_04202212.jpg",
    "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv264/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "widevine",
      "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
    },
    "sources": [
      {
        "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv264/manifest.mpd",
        "type": "mpd",
        "drm": {
          "type": "widevine",
          "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
        }
      },
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=173&expires=1787186707&token=a932bdacc2b1f463957314fda6b12608",
        "type": "mpd",
        "drm": {
          "type": "clearkey",
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360173&token=7b71dc1f01c841cd03ed65d95b171513"
        }
      }
    ]
  },
  {
    "id": "vtvcab-on-sports-plus",
    "name": "ON SPORTS+",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://assets-vtvcab.gviet.vn/images/hq/posters/onsportscongmoi1.jpg",
    "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv311/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "widevine",
      "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
    },
    "sources": [
      {
        "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv311/manifest.mpd",
        "type": "mpd",
        "drm": {
          "type": "widevine",
          "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
        }
      },
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=183&expires=1787186707&token=292aa2e4b0146c625ac6e6cc08151959",
        "type": "mpd",
        "drm": {
          "type": "clearkey",
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360183&token=7b71dc1f01c841cd03ed65d95b171513"
        }
      }
    ]
  },
  {
    "id": "vtvcab-on-sports-news",
    "name": "ON SPORTS NEWS",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://assets-vtvcab.gviet.vn/images/v2/channel/20220613/2022061306/Logo_ONSPORTSNEWS_150x904_1675158858.webp",
    "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv496/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "widevine",
      "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
    },
    "sources": [
      {
        "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv496/manifest.mpd",
        "type": "mpd",
        "drm": {
          "type": "widevine",
          "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
        }
      },
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=170&expires=1786534141&token=5aefd196051dff088c471f62eb9ba455",
        "type": "mpd",
        "drm": {
          "type": "clearkey",
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360170&token=4bf0b7cede68d617b6cfaacf9ec4655c"
        }
      }
    ]
  },
  {
    "id": "vtvcab-on-golf",
    "name": "ON GOLF",
    "category": "vtvcab",
    "categoryName": "VTVcab",
    "logo": "https://img.lichphatsong.site/logo/on-golf.jpg",
    "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv485/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "widevine",
      "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
    },
    "sources": [
      {
        "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv485/manifest.mpd",
        "type": "mpd",
        "drm": {
          "type": "widevine",
          "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
        }
      },
      {
        "url": "https://vmttv.dpdns.org/tv360/?id=vtvcab-23-golf-channel",
        "type": "hls"
      }
    ]
  }
];

const rawHtvChannels: Omit<Channel, 'number'>[] = [
  {
    "id": "htvkey",
    "name": "HTV Key",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htvkey.png",
    "url": "https://live.fptplay53.net/epzhd1/htv4_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htv-the-thao-hd",
    "name": "HTV Thể Thao HD",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htvthethao.png",
    "url": "https://live.fptplay53.net/epzhd1/htvcthethao_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htv1",
    "name": "HTV1",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htv1.png",
    "url": "https://live.fptplay53.net/epzhd1/htv1_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htv2-hd",
    "name": "HTV2 HD",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htv2.png",
    "url": "https://live.fptplay53.net/epzhd1/htv2hd_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htv3",
    "name": "HTV3",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htv3.png",
    "url": "https://live.fptplay53.net/epzhd1/htv3_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htv5",
    "name": "HTV5 - B Channel",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/vuminhthanh12/refs/heads/main/HTV5.jpg",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=151",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "htv7-hd",
    "name": "HTV7 HD",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htv7.png",
    "url": "https://live.fptplay53.net/epzhd1/htv7hd_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htv9-hd",
    "name": "HTV9 HD",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htv9.png",
    "url": "https://live.fptplay53.net/epzhd1/htv9hd_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htvc-ca-nhac-hd",
    "name": "HTVC Ca Nhạc HD",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htvccanhac.png",
    "url": "https://live.fptplay53.net/epzhd1/htvcmusic_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htvc-du-lich-hd",
    "name": "HTVC Du Lịch HD",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htvcdulichcuocsong.png",
    "url": "https://live.fptplay53.net/epzhd1/htvcdulich_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htvc-gia-dinh-hd",
    "name": "HTVC Gia Đình HD",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htvcgiadinh.png",
    "url": "https://live.fptplay53.net/epzhd1/htvcgiadinh_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htvc-phim-hd",
    "name": "HTVC Phim HD",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://img-ali1.tv360.vn/image1/2021/07/01/15/1625129239161/48401c7a9ce3_480_270.png",
    "url": "https://live.fptplay53.net/epzhd1/htvcmovieshd_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htvc-phu-nu-hd",
    "name": "HTVC Phụ Nữ HD",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htvcphunu.png",
    "url": "https://live.fptplay53.net/epzhd1/htvcphunu_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htvc-plus-hd",
    "name": "HTVC Plus HD",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htvcplus.png",
    "url": "https://live.fptplay53.net/epzhd1/htvcplus_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  },
  {
    "id": "htvc-thuan-viet",
    "name": "HTVC Thuần Việt",
    "category": "htv",
    "categoryName": "HTV",
    "logo": "https://vietanhtv.id.vn/logo/htvcthuanviet.png",
    "url": "https://live.fptplay53.net/epzhd1/htvcthuanviethd_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
    "type": "hls"
  }
];

const rawSctvChannels: Omit<Channel, 'number'>[] = [
  {
    "id": "sctv1hd",
    "name": "SCTV1 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv1.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV1/Live_DASHDRM/SCTV1.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv1"
    }
  },
  {
    "id": "sctv2hd",
    "name": "SCTV2 HD - TODAY TV",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv2.png",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=201",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "sctv3hd",
    "name": "SCTV3 - SEE TV",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv3.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV3/Live_DASHDRM/SCTV3.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv3"
    }
  },
  {
    "id": "sctv4hd",
    "name": "SCTV4 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv4.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV4/Live_DASHDRM/SCTV4.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv4"
    }
  },
  {
    "id": "sctv5hd",
    "name": "SCTV5 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv5.png",
    "url": "https://vmttv.dpdns.org/VTVGo/?sctv5",
    "type": "hls"
  },
  {
    "id": "sctv6hd",
    "name": "SCTV6 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv6.png",
    "url": "https://live.fptplay53.net/epzhd2/film360_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "sctv7hd",
    "name": "SCTV7 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv7.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV7/Live_DASHDRM/SCTV7.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv7"
    }
  },
  {
    "id": "sctv8hd",
    "name": "SCTV8 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv8.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV8/Live_DASHDRM/SCTV8.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv8"
    }
  },
  {
    "id": "sctv9",
    "name": "SCTV9",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv9.png",
    "url": "https://livevlisctcdnw.seenow.vn/mean/SCTV9/manifest.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv9"
    }
  },
  {
    "id": "sctv10hd",
    "name": "SCTV10 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv10.png",
    "url": "https://vmttv.dpdns.org/VTVGo/?sctv10",
    "type": "hls"
  },
  {
    "id": "sctv11hd",
    "name": "SCTV11 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv11.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV11/Live_DASHDRM/SCTV11.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv11"
    }
  },
  {
    "id": "sctv12hd",
    "name": "SCTV12 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv12.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV12/Live_DASHDRM/SCTV12.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv12"
    }
  },
  {
    "id": "sctv13hd",
    "name": "SCTV13 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv13.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV13/Live_DASHDRM/SCTV13.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv13"
    }
  },
  {
    "id": "sctv14hd",
    "name": "SCTV14 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv14.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV14/Live_DASHDRM/SCTV14.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv14"
    }
  },
  {
    "id": "sctv15hd",
    "name": "SCTV15 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv15.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV15HD/Live_DASHDRM/SCTV15HD.mpd",
    "backupUrl": "https://livevlisctcdnw.seenow.vn/livesnv2/SCTV15HD/manifest.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv15",
      "keys": {
        "a7c942778e874d43be92b8d0a0cd11b4": "6d54358306571658ffdb952c6560688b"
      }
    },
    "sources": [
      {
        "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV15HD/Live_DASHDRM/SCTV15HD.mpd",
        "type": "mpd",
        "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "drm": {
          "type": "clearkey",
          "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv15",
          "keys": {
            "a7c942778e874d43be92b8d0a0cd11b4": "6d54358306571658ffdb952c6560688b"
          }
        },
        "label": "SCTV15 HD (DASH vtvprime)"
      },
      {
        "url": "https://livevlisctcdnw.seenow.vn/livesnv2/SCTV15HD/manifest.mpd",
        "type": "mpd",
        "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "drm": {
          "type": "clearkey",
          "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv15",
          "keys": {
            "a7c942778e874d43be92b8d0a0cd11b4": "6d54358306571658ffdb952c6560688b"
          }
        },
        "label": "SCTV15 HD (DASH seenow)"
      },
      {
        "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV15/Live_DASHDRM/SCTV15.mpd",
        "type": "mpd",
        "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "drm": {
          "type": "clearkey",
          "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv15",
          "keys": {
            "a7c942778e874d43be92b8d0a0cd11b4": "6d54358306571658ffdb952c6560688b"
          }
        },
        "label": "SCTV15 HD (DASH Dự phòng)"
      }
    ]
  },
  {
    "id": "sctv16hd",
    "name": "SCTV16 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv16.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV16/Live_DASHDRM/SCTV16.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv16"
    }
  },
  {
    "id": "sctv17hd",
    "name": "SCTV17 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv17.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV17/Live_DASHDRM/SCTV17.mpd",
    "backupUrl": "https://livevlisctcdnw.seenow.vn/livesnv2/SCTV17/manifest.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv17",
      "keys": {
        "a7c942778e874d43be92b8d0a0cd11b4": "6d54358306571658ffdb952c6560688b"
      }
    },
    "sources": [
      {
        "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV17/Live_DASHDRM/SCTV17.mpd",
        "type": "mpd",
        "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "drm": {
          "type": "clearkey",
          "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv17",
          "keys": {
            "a7c942778e874d43be92b8d0a0cd11b4": "6d54358306571658ffdb952c6560688b"
          }
        },
        "label": "SCTV17 HD (DASH vtvprime)"
      },
      {
        "url": "https://livevlisctcdnw.seenow.vn/livesnv2/SCTV17/manifest.mpd",
        "type": "mpd",
        "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "drm": {
          "type": "clearkey",
          "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv17",
          "keys": {
            "a7c942778e874d43be92b8d0a0cd11b4": "6d54358306571658ffdb952c6560688b"
          }
        },
        "label": "SCTV17 HD (DASH seenow)"
      }
    ]
  },
  {
    "id": "sctv18hd",
    "name": "SCTV18 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv18.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV18/Live_DASHDRM/SCTV18.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv18"
    }
  },
  {
    "id": "sctv19hd",
    "name": "SCTV19 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv19.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV19/Live_DASHDRM/SCTV19.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv19"
    }
  },
  {
    "id": "sctv20hd",
    "name": "SCTV20 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv20.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV20/Live_DASHDRM/SCTV20.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv20"
    }
  },
  {
    "id": "sctv21hd",
    "name": "SCTV21 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv21.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV21/Live_DASHDRM/SCTV21.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv21"
    }
  },
  {
    "id": "sctv22hd",
    "name": "SCTV22 HD",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://vietanhtv.id.vn/logo/sctv22.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTV22/Live_DASHDRM/SCTV22.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctv22"
    }
  },
  {
    "id": "sctvhdpth",
    "name": "SCTV Phim Tổng Hợp",
    "category": "sctv",
    "categoryName": "SCTV",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/vuminhthanh12/refs/heads/main/sctvpth.png",
    "url": "https://liveatmvng.vtvprime.vn/live/data8/SCTVPHIM/Live_DASHDRM/SCTVPHIM.mpd",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "licenseUrl": "https://tv.vietanhtv.top/sctv/cleankey.php?id=sctvphim"
    }
  }
];

const rawTheThaoQuocTeChannels: Omit<Channel, 'number'>[] = [];

const rawSuKienChannels: Omit<Channel, 'number'>[] = [
  {
    "id": "tv360plus1",
    "name": "TV360+1",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://img-zlr1.tv360.vn/image1/2026/04/15/22/1776266760359/ba1ca843cd06_480_270.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=2554&expires=1788166836&token=03cddb4a00027f8006f49b4f3e617665",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "47404f622db3536c867b2545581aadb4": "9fbdc12cfe74564fd4329baa6a6d1968"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus1&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=2554&expires=1788166836&token=03cddb4a00027f8006f49b4f3e617665",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "47404f622db3536c867b2545581aadb4": "9fbdc12cfe74564fd4329baa6a6d1968"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=2554&expires=1788166836&token=03cddb4a00027f8006f49b4f3e617665",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "47404f622db3536c867b2545581aadb4": "9fbdc12cfe74564fd4329baa6a6d1968"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus1&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+1 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=2554&expires=1788166836&token=03cddb4a00027f8006f49b4f3e617665",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "47404f622db3536c867b2545581aadb4": "9fbdc12cfe74564fd4329baa6a6d1968"
          }
        },
        "label": "TV360+1 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus2",
    "name": "TV360+2",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://vietanhtv.id.vn/logo/tv360plus2.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=1&expires=1788166836&token=9d4261de43f7410a63b6629322513631",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "2c24f672f7715433a83953e74ae564b1": "10a63f9f2ccd81dfc4a05263c2fd1575"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus2&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=1&expires=1788166836&token=9d4261de43f7410a63b6629322513631",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "2c24f672f7715433a83953e74ae564b1": "10a63f9f2ccd81dfc4a05263c2fd1575"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=1&expires=1788166836&token=9d4261de43f7410a63b6629322513631",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "2c24f672f7715433a83953e74ae564b1": "10a63f9f2ccd81dfc4a05263c2fd1575"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus2&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+2 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=1&expires=1788166836&token=9d4261de43f7410a63b6629322513631",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "2c24f672f7715433a83953e74ae564b1": "10a63f9f2ccd81dfc4a05263c2fd1575"
          }
        },
        "label": "TV360+2 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus3",
    "name": "TV360+3",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://vietanhtv.id.vn/logo/tv360plus3.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=148&expires=1788166836&token=c5357dddfda87a9ff87cda15dd399b0d",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "8405a15e96b35497bde131a29e7fb67e": "adb30d908915cf14760880240961a5ed"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus3&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=148&expires=1788166836&token=c5357dddfda87a9ff87cda15dd399b0d",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "8405a15e96b35497bde131a29e7fb67e": "adb30d908915cf14760880240961a5ed"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=148&expires=1788166836&token=c5357dddfda87a9ff87cda15dd399b0d",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "8405a15e96b35497bde131a29e7fb67e": "adb30d908915cf14760880240961a5ed"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus3&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+3 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=148&expires=1788166836&token=c5357dddfda87a9ff87cda15dd399b0d",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "8405a15e96b35497bde131a29e7fb67e": "adb30d908915cf14760880240961a5ed"
          }
        },
        "label": "TV360+3 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus4",
    "name": "TV360+4",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://vietanhtv.id.vn/logo/tv360plus4.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=2458&expires=1788166836&token=c3476245e7b33e776394cfd60bbb8b95",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "70d033252d025d719ba70a37acc0f5c8": "6ca465d8b3018f1604da6d43d3395a6d"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus4&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=2458&expires=1788166836&token=c3476245e7b33e776394cfd60bbb8b95",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "70d033252d025d719ba70a37acc0f5c8": "6ca465d8b3018f1604da6d43d3395a6d"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=2458&expires=1788166836&token=c3476245e7b33e776394cfd60bbb8b95",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "70d033252d025d719ba70a37acc0f5c8": "6ca465d8b3018f1604da6d43d3395a6d"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus4&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+4 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=2458&expires=1788166836&token=c3476245e7b33e776394cfd60bbb8b95",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "70d033252d025d719ba70a37acc0f5c8": "6ca465d8b3018f1604da6d43d3395a6d"
          }
        },
        "label": "TV360+4 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus5",
    "name": "TV360+5",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://vietanhtv.id.vn/logo/tv360plus5.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9867&expires=1788166836&token=a098115808151dab154756d42a3f8121",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "edfa094d8ac55cf98f5867128a926aa7": "0e10fa6099105e2e0a7ce1e34e9c0230"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus5&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=9867&expires=1788166836&token=a098115808151dab154756d42a3f8121",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "edfa094d8ac55cf98f5867128a926aa7": "0e10fa6099105e2e0a7ce1e34e9c0230"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9867&expires=1788166836&token=a098115808151dab154756d42a3f8121",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "edfa094d8ac55cf98f5867128a926aa7": "0e10fa6099105e2e0a7ce1e34e9c0230"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus5&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+5 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=9867&expires=1788166836&token=a098115808151dab154756d42a3f8121",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "edfa094d8ac55cf98f5867128a926aa7": "0e10fa6099105e2e0a7ce1e34e9c0230"
          }
        },
        "label": "TV360+5 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus6",
    "name": "TV360+6",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://vietanhtv.id.vn/logo/tv360plus6.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9868&expires=1788166836&token=7d25928ce39da3464cb7bae5144c9b9b",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "3b0f9e1892864641aa17f02b2e7b0b2d": "6c06f96a6296d05442466d5b09e58192"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus6&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=9868&expires=1788166836&token=7d25928ce39da3464cb7bae5144c9b9b",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "3b0f9e1892864641aa17f02b2e7b0b2d": "6c06f96a6296d05442466d5b09e58192"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9868&expires=1788166836&token=7d25928ce39da3464cb7bae5144c9b9b",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "3b0f9e1892864641aa17f02b2e7b0b2d": "6c06f96a6296d05442466d5b09e58192"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus6&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+6 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=9868&expires=1788166836&token=7d25928ce39da3464cb7bae5144c9b9b",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "3b0f9e1892864641aa17f02b2e7b0b2d": "6c06f96a6296d05442466d5b09e58192"
          }
        },
        "label": "TV360+6 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus7",
    "name": "TV360+7",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://vietanhtv.id.vn/logo/tv360plus7.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9869&expires=1788166836&token=8a472176387ef042267969e273c1ab7b",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "072f0a0d4eda40cbb04dfadf521a2b9f": "2fb11373b36e018573d3b07132df050e"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus7&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=9869&expires=1788166836&token=8a472176387ef042267969e273c1ab7b",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "072f0a0d4eda40cbb04dfadf521a2b9f": "2fb11373b36e018573d3b07132df050e"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9869&expires=1788166836&token=8a472176387ef042267969e273c1ab7b",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "072f0a0d4eda40cbb04dfadf521a2b9f": "2fb11373b36e018573d3b07132df050e"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus7&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+7 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=9869&expires=1788166836&token=8a472176387ef042267969e273c1ab7b",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "072f0a0d4eda40cbb04dfadf521a2b9f": "2fb11373b36e018573d3b07132df050e"
          }
        },
        "label": "TV360+7 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus8",
    "name": "TV360+8",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://vietanhtv.id.vn/logo/tv360plus8.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9870&expires=1788166836&token=62cea754501f80d5f74d8f02956be02f",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "1a08bd3a8c565cdfa4e01a0273915f40": "d956d96ac3799d42441f582ec12f10df"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus8&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=9870&expires=1788166836&token=62cea754501f80d5f74d8f02956be02f",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "1a08bd3a8c565cdfa4e01a0273915f40": "d956d96ac3799d42441f582ec12f10df"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9870&expires=1788166836&token=62cea754501f80d5f74d8f02956be02f",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "1a08bd3a8c565cdfa4e01a0273915f40": "d956d96ac3799d42441f582ec12f10df"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus8&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+8 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=9870&expires=1788166836&token=62cea754501f80d5f74d8f02956be02f",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "1a08bd3a8c565cdfa4e01a0273915f40": "d956d96ac3799d42441f582ec12f10df"
          }
        },
        "label": "TV360+8 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus9",
    "name": "TV360+9",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://vietanhtv.id.vn/logo/tv360plus9.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9887&expires=1788166836&token=d9dede2a67b18435490d14204cea32a5",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls",
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=9887&expires=1788166836&token=d9dede2a67b18435490d14204cea32a5",
    "backupType": "hls",
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9887&expires=1788166836&token=d9dede2a67b18435490d14204cea32a5",
        "type": "hls",
        "label": "TV360+9 (HLS Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=9887&expires=1788166836&token=d9dede2a67b18435490d14204cea32a5",
        "type": "hls",
        "label": "TV360+9 (HLS Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus10",
    "name": "TV360+10",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://vietanhtv.id.vn/logo/tv360plus10.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9957&expires=1788166836&token=f235880cb4bad9d21ed1265c279ca89e",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls",
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=9957&expires=1788166836&token=f235880cb4bad9d21ed1265c279ca89e",
    "backupType": "hls",
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9957&expires=1788166836&token=f235880cb4bad9d21ed1265c279ca89e",
        "type": "hls",
        "label": "TV360+10 (HLS Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=9957&expires=1788166836&token=f235880cb4bad9d21ed1265c279ca89e",
        "type": "hls",
        "label": "TV360+10 (HLS Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus11",
    "name": "TV360+11",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://vietanhtv.id.vn/logo/tv360plus11.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9958&expires=1788166836&token=962de07359da4949e7ad1cb44fa7dd92",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls",
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=9958&expires=1788166836&token=962de07359da4949e7ad1cb44fa7dd92",
    "backupType": "hls",
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=9958&expires=1788166836&token=962de07359da4949e7ad1cb44fa7dd92",
        "type": "hls",
        "label": "TV360+11 (HLS Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=9958&expires=1788166836&token=962de07359da4949e7ad1cb44fa7dd92",
        "type": "hls",
        "label": "TV360+11 (HLS Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus12",
    "name": "TV360+12",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://img-ali1.tv360.vn/image1/2026/03/05/10/1772681417916/2433e49579ab_640_360.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=10021&expires=1788166836&token=877d9c64b73b22b109f5ff990098df24",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "29b3e7c5de895bfa8850f16dad16e378": "72a9e1be1d94ad66207f1ac61bcf7681",
        "6db5c5c963365f6fafa1a23b8a06bd67": "1a0727fcea62de4e4471ebb0aaaec628"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus12&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=10021&expires=1788166836&token=877d9c64b73b22b109f5ff990098df24",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "29b3e7c5de895bfa8850f16dad16e378": "72a9e1be1d94ad66207f1ac61bcf7681",
        "6db5c5c963365f6fafa1a23b8a06bd67": "1a0727fcea62de4e4471ebb0aaaec628"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=10021&expires=1788166836&token=877d9c64b73b22b109f5ff990098df24",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "29b3e7c5de895bfa8850f16dad16e378": "72a9e1be1d94ad66207f1ac61bcf7681",
            "6db5c5c963365f6fafa1a23b8a06bd67": "1a0727fcea62de4e4471ebb0aaaec628"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus12&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+12 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=10021&expires=1788166836&token=877d9c64b73b22b109f5ff990098df24",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "29b3e7c5de895bfa8850f16dad16e378": "72a9e1be1d94ad66207f1ac61bcf7681",
            "6db5c5c963365f6fafa1a23b8a06bd67": "1a0727fcea62de4e4471ebb0aaaec628"
          }
        },
        "label": "TV360+12 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus13",
    "name": "TV360+13",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://img-zlr1.tv360.vn/image1/2026/05/15/01/1778782670293/dd4067f28084_480_270.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=10022&expires=1788166836&token=48a4e4347fccb57b098d5a1bdd1d3b3b",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "856f291af35a5db7b7d0c944b32993b9": "aa3547547f084fe4c9ea5206effb6b78"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus13&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=10022&expires=1788166836&token=48a4e4347fccb57b098d5a1bdd1d3b3b",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "856f291af35a5db7b7d0c944b32993b9": "aa3547547f084fe4c9ea5206effb6b78"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=10022&expires=1788166836&token=48a4e4347fccb57b098d5a1bdd1d3b3b",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "856f291af35a5db7b7d0c944b32993b9": "aa3547547f084fe4c9ea5206effb6b78"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus13&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+13 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=10022&expires=1788166836&token=48a4e4347fccb57b098d5a1bdd1d3b3b",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "856f291af35a5db7b7d0c944b32993b9": "aa3547547f084fe4c9ea5206effb6b78"
          }
        },
        "label": "TV360+13 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus14",
    "name": "TV360+14",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://img-zlr1.tv360.vn/image1/2026/05/15/01/177878325467/bbecb3ccb477_480_270.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=10023&expires=1788166836&token=3b9cf24ae9c8df44aab1537d0d717235",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "e57b008cedba5d12a192e66152bb61ca": "a4b58d543b1c042f8b399f268040b623"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus14&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=10023&expires=1788166836&token=3b9cf24ae9c8df44aab1537d0d717235",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "e57b008cedba5d12a192e66152bb61ca": "a4b58d543b1c042f8b399f268040b623"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=10023&expires=1788166836&token=3b9cf24ae9c8df44aab1537d0d717235",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "e57b008cedba5d12a192e66152bb61ca": "a4b58d543b1c042f8b399f268040b623"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus14&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+14 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=10023&expires=1788166836&token=3b9cf24ae9c8df44aab1537d0d717235",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "e57b008cedba5d12a192e66152bb61ca": "a4b58d543b1c042f8b399f268040b623"
          }
        },
        "label": "TV360+14 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  },
  {
    "id": "tv360plus15",
    "name": "TV360+15",
    "category": "sukien",
    "categoryName": "Sự Kiện",
    "logo": "https://img-zlr1.tv360.vn/image1/2026/05/15/01/1778783528367/ddfa21d56253_480_270.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=10024&expires=1788166836&token=3c37b8763f873f19c00f2b084900c3c7",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "c305b22dfd6d55e3998ab279cc98e0d3": "12998335c7da89877aa1b1d50f1ec174"
      },
      "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus15&token=90b680950284bf0155f294f6e5917b54"
    },
    "backupUrl": "https://vietanhtv.id.vn/tv360/tv360.php?id=10024&expires=1788166836&token=3c37b8763f873f19c00f2b084900c3c7",
    "backupType": "mpd",
    "backupDrm": {
      "type": "clearkey",
      "keys": {
        "c305b22dfd6d55e3998ab279cc98e0d3": "12998335c7da89877aa1b1d50f1ec174"
      }
    },
    "sources": [
      {
        "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=10024&expires=1788166836&token=3c37b8763f873f19c00f2b084900c3c7",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "c305b22dfd6d55e3998ab279cc98e0d3": "12998335c7da89877aa1b1d50f1ec174"
          },
          "licenseUrl": "https://tv.vietanhtv.top/sex/cleankey.php?id=tv360plus15&token=90b680950284bf0155f294f6e5917b54"
        },
        "label": "TV360+15 (DASH Nguồn 1)"
      },
      {
        "url": "https://vietanhtv.id.vn/tv360/tv360.php?id=10024&expires=1788166836&token=3c37b8763f873f19c00f2b084900c3c7",
        "type": "mpd",
        "userAgent": "Dalvik/2.1.0",
        "drm": {
          "type": "clearkey",
          "keys": {
            "c305b22dfd6d55e3998ab279cc98e0d3": "12998335c7da89877aa1b1d50f1ec174"
          }
        },
        "label": "TV360+15 (DASH Nguồn 2 Dự phòng)"
      }
    ]
  }
];

const rawDiaPhuongChannels: Omit<Channel, 'number'>[] = [
  {
    "id": "antv-hd",
    "name": "ANTV HD",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/thietyeu/antv.png",
    "url": "https://live.fptplay53.net/fnxhd2/anninhtv_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "atv1-hd",
    "name": "ATV1 HD | TH An Giang",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/angiang1.png",
    "url": "https://live.fptplay53.net/epzsd1/angiang01_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "atv2-hd",
    "name": "ATV2 HD | TH An Giang",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/angiang2.png",
    "url": "https://live.fptplay53.net/epzhd2/angiang02hd_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "atv3-hd",
    "name": "ATV3 HD | TH An Giang",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/angiang3.png",
    "url": "https://live.fptplay53.net/epzsd1/angiang03_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "bhttv-hd",
    "name": "BHTTV HD | TH Hà Tĩnh",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/hatinh_new.png",
    "url": "https://live.fptplay53.net/fnxsd1/hatinh_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "btn-hd",
    "name": "BTN HD | TH Bắc Ninh",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/bacninh.png",
    "url": "https://live.fptplay53.net/fnxsd1/bacninh01_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "can-tho-1",
    "name": "Cần Thơ TV 1 | TH Cần Thơ",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/cantho1_new.png",
    "url": "https://live.fptplay53.net/epzhd2/cantho01_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "can-tho-2",
    "name": "Cần Thơ TV 2 | TH Cần Thơ",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/cantho2_new.png",
    "url": "https://live.fptplay53.net/epzhd2/cantho02_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "can-tho-3",
    "name": "Cần Thơ TV 3 | TH Cần Thơ",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/cantho3_new.png",
    "url": "https://live.fptplay53.net/epzsd1/cantho03_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "crtv-hd",
    "name": "CRTV HD | TH Cao Bằng",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caobang.png",
    "url": "https://live.fptplay53.net/fnxsd1/caobang_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "ctv-hd",
    "name": "CTV HD | TH Cà Mau",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/camau.png",
    "url": "https://live.fptplay53.net/epzhd2/camauhd_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "danang-1",
    "name": "DaNangTV1 HD",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/danang1.png",
    "url": "https://live.fptplay53.net/epzsd1/danang1_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "danang-2",
    "name": "DaNangTV2 HD",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/danang2.png",
    "url": "https://live.fptplay53.net/epzsd1/danang2_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "drt-hd",
    "name": "DRT HD | TH Đắk Lắk",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/daklak.png",
    "url": "https://live.fptplay53.net/epzsd1/daklak_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "dnrtv1-hd",
    "name": "ĐNRTV1 HD | TH Đồng Nai",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/dongnai1.png",
    "url": "https://live.fptplay53.net/epzsd1/dongnai1_hls.smil/chunklist.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "dnrtv2-hd",
    "name": "ĐNRTV2 HD | TH Đồng Nai",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/dongnai2.png",
    "url": "https://live.fptplay53.net/epzsd1/dongnai2_hls.smil/chunklist.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "dnrtv3",
    "name": "ĐNRTV3 HD | TH Đồng Nai",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/dongnai3.png",
    "url": "https://tv.vietanhtv.top/vieon/vieon.php?id=dong-nai-3",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "dtv",
    "name": "ĐTV | TH Điện Biên",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/dienbien.png",
    "url": "https://live.fptplay53.net/fnxsd1/dienbien_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "gtv",
    "name": "GTV | TH Gia Lai",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/gialai.png",
    "url": "https://live.fptplay53.net/epzsd1/gialai01_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "hanoi1-hd",
    "name": "HanoiTV1 HD",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/hanoi1.png",
    "url": "https://live.fptplay53.net/fnxhd2/hanoitv1_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "hanoi2-hd",
    "name": "HanoiTV2 HD",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/hanoi2.png",
    "url": "https://live.fptplay53.net/live/media/hanoitv2/live-hls-avc/hanoitv2-avc1_4000000=10000-mp4a_131600=20000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "hitv",
    "name": "HiTV",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/hanoicab/hitv.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=32&expires=1788150498&token=42f9121addd9fa010d5f320e805f3a98",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "hy-hd",
    "name": "HY HD | TH Hưng Yên",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/hungyen.png",
    "url": "https://live.fptplay53.net/fnxsd1/hungyen_2000.stream/chunklist.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "ktv-hd",
    "name": "KTV HD | TH Khánh Hòa",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/khanhhoa.png",
    "url": "https://live.fptplay53.net/epzsd1/khanhhoa_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "ktv1-hd",
    "name": "KTV1 HD | TH Khánh Hòa",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/khanhhoa1.png",
    "url": "https://live.fptplay53.net/epzsd1/khanhhoa01_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "lstv-hd",
    "name": "LSTV HD | TH Lạng Sơn",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/langson.png",
    "url": "https://live.fptplay53.net/fnxsd1/langson_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "ltv-hd-laichau",
    "name": "LTV HD | TH Lai Châu",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/laichau.png",
    "url": "https://live.fptplay53.net/fnxsd1/laichau_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "ltv1-hd",
    "name": "LTV1 HD | TH Lâm Đồng",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/lamdong01.jpg",
    "url": "https://live.fptplay53.net/epzsd1/lamdong_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "ltv2-hd",
    "name": "LTV2 HD | TH Lâm Đồng - KV Bình Thuận",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/lamdong02.jpg",
    "url": "https://live.fptplay53.net/epzsd1/lamdong02_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "ntv-hd-nghean",
    "name": "NTV HD | TH Nghệ An",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/nghean.png",
    "url": "https://live.fptplay53.net/fnxsd1/nghean_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "ntv-hd-ninhbinh",
    "name": "NTV HD | TH Ninh Bình",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/ninhbinh.png",
    "url": "https://live.fptplay53.net/fnxsd1/ninhbinh_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "ptv-hd",
    "name": "PTV HD | TH Phú Thọ",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/phutho.png",
    "url": "https://live.fptplay53.net/fnxsd1/phutho_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "quangngaitv2",
    "name": "QNgTV2 - TH QUẢNG NGÃI 2 HD",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://i.postimg.cc/0j90HbNC/QNg-TV2.png",
    "url": "https://live.fptplay53.net/epzsd1/quangngai01_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 Edge/12.246",
    "type": "hls"
  },
  {
    "id": "qpvn-hd",
    "name": "QPVN HD",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/thietyeu/qpvn.png",
    "url": "https://live.fptplay53.net/fnxhd2/quocphongvnhd_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "qrtv-hd",
    "name": "QRTV HD | TH Quảng Trị",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/quangtri.png",
    "url": "https://live.fptplay53.net/epzsd1/quangtri_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "qtv1-hd",
    "name": "QTV1 HD | TH Quảng Ninh",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/quangninh1.png",
    "url": "https://live.fptplay53.net/fnxsd1/quangninh1_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "qtv3-hd",
    "name": "QTV3 HD | TH Quảng Ninh",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/quangninh3.png",
    "url": "https://live.fptplay53.net/fnxsd1/quangninh3_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "quangngaitv1",
    "name": "QuangNgaiTV1 | TH Quảng Ngãi",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/caicach/quangngai_1.png",
    "url": "https://live.fptplay53.net/epzsd1/quangngai_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "stv-hd",
    "name": "STV HD | TH Sơn La",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/sonla.png",
    "url": "https://live.fptplay53.net/fnxsd1/sonla_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "tayninh-tv",
    "name": "Tây Ninh TV - Báo và PTTH Tây Ninh",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/vuminhthanh12/refs/heads/main/TayNinhTV.jpg",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=72",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "thdt1-hd",
    "name": "THĐT1 HD | TH Đồng Tháp",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/dongthap1.png",
    "url": "https://live.fptplay53.net/epzhd2/dongthap01_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "thdt2-hd",
    "name": "THĐT2 HD | TH Đồng Tháp",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/dongthap2.png",
    "url": "https://live.fptplay53.net/epzhd2/mientaythdt02_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "thlc-hd",
    "name": "THLC HD | TH Lào Cai",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/laocai.png",
    "url": "https://live.fptplay53.net/fnxsd1/laocai_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "thp-hd",
    "name": "THP HD | TH Hải Phòng",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/haiphong.png",
    "url": "https://live.fptplay53.net/fnxsd1/haiphong_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "thp3-hd",
    "name": "THP3 HD | TH Hải Phòng",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 180' width='300' height='180'%3E%3Crect width='300' height='180' rx='20' fill='%230f172a'/%3E%3Cg transform='translate(25, 25)'%3E%3Ctext x='10' y='65' font-family='sans-serif' font-weight='900' font-size='56' fill='%23EF4444'%3ETH%3Ctspan fill='%233B82F6'%3EP%3C/tspan%3E%3Ctspan fill='%23F59E0B'%3E3%3C/tspan%3E%3C/text%3E%3Crect x='180' y='24' width='42' height='24' rx='4' fill='%230284C7'/%3E%3Ctext x='201' y='41' font-family='sans-serif' font-weight='800' font-size='14' fill='%23FFFFFF' text-anchor='middle'%3EHD%3C/text%3E%3C/g%3E%3Crect x='20' y='115' width='260' height='42' rx='8' fill='%23DC2626'/%3E%3Ctext x='150' y='142' font-family='sans-serif' font-weight='800' font-size='18' fill='%23FFFFFF' text-anchor='middle' letter-spacing='1'%3ETHP3 - HẢI PHÒNG%3C/text%3E%3C/svg%3E",
    "url": "https://live.fptplay53.net/fnxsd1/haiphongplus_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "thvl1",
    "name": "THVL1 | TH Vĩnh Long",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/vinhlong1.png",
    "url": "https://live.fptplay53.net/live/media/vinhlong1/live247-hls-avc/vinhlong1-avc1_5600000=10000-mp4a_131600=20000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "thvl2",
    "name": "THVL2 | TH Vĩnh Long",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/vinhlong2.png",
    "url": "https://live.fptplay53.net/live/media/vinhlong2/live247-hls-avc/vinhlong2-avc1_5600000=10000-mp4a_131600=20000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "thvl3",
    "name": "THVL3 | TH Vĩnh Long",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/vinhlong3.png",
    "url": "https://live.fptplay53.net/live/media/vinhlong3/live247-hls-avc/vinhlong3-avc1_5600000=10000-mp4a_131600=20000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "thvl4",
    "name": "THVL4 | TH Vĩnh Long",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/vinhlong4.png",
    "url": "https://live.fptplay53.net/epzhd2/vinhlong4-hd_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "thvl5",
    "name": "THVL5 | TH Vĩnh Long",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/vinhlong5.png",
    "url": "https://live.fptplay53.net/epzhd2/vinhlong5hd_vhls.smil/chunklist_b5000000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "tn1-hd",
    "name": "TN1 HD | TH Thái Nguyên",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/thainguyen.png",
    "url": "https://live.fptplay53.net/fnxsd1/thainguyen_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "ttv-hd-thanhhoa",
    "name": "TTV HD - Báo và PTTH Thanh Hóa",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://img-zlr1.tv360.vn/image1/2020_09_23/1600821878406/58ff77e57117_640_360.png",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=89",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "tuyenquang",
    "name": "TTV HD | TH Tuyên Quang",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/diaphuong/tuyenquang.png",
    "url": "https://live.fptplay53.net/fnxsd1/tuyenquang_hls.smil/chunklist_b2500000.m3u8",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  },
  {
    "id": "youtv",
    "name": "You TV",
    "category": "diaphuong",
    "categoryName": "Địa Phương",
    "logo": "https://freem3u.xyz/static/images/hanoicab/youtv.png",
    "url": "https://tv.vietanhtv.top/tv360/tv360.php?id=31&expires=1788150498&token=764d36a75a1b3bfc08277f9f2eb67299",
    "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "type": "hls"
  }
];

const rawPhimChannels: Omit<Channel, 'number'>[] = [
  {
    "id": "phim-anh-hung",
    "name": "Anh Hùng",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/Logo/refs/heads/main/anh-hung.jpg",
    "url": "https://v7.kkphimplayer7.com/20260821/1tcAZTSo/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-bau-vat-troi-cho",
    "name": "Báu Vật Trời Cho",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://img-zlr1.tv360.vn/image1/2026/06/03/22/bc4677df/bc4677df-dbcd-4a57-844b-390414aa1778_640_360.jpg",
    "url": "https://v7.kkphimplayer7.com/20260617/QgEs8NDH/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-bo-tu-bao-thu",
    "name": "Bộ Tứ Báo Thủ",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2025/08/28/bo-tu-bao-thu-fpt-play-1756374565016_Landscape.jpg",
    "url": "https://s6.kkphimplayer6.com/20250901/2RZvePPZ/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-conan-movie-28",
    "name": "Conan Movie 28 - Dư Ảnh Của Độc Nhãn",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2025/12/26/tham-tu-lung-danh-conan-du-anh-cua-doc-nhan-fpt-play-1766741539032_Landscape.jpg",
    "url": "https://vodcdn.fptplay.net/POVOD/encoded/2025/12/28/thamtulungdanhconanduanhcuadocnhan-detectiveconanoneeyedflashback-2025-dolby-mav-bb8d776e6f35fe41/H264/stream.mpd?st=8PSyksBMiL_tvRpq4B3-eg&expires=1767859023",
    "type": "mpd"
  },
  {
    "id": "phim-cuc-vang-cua-ngoai",
    "name": "Cục Vàng Của Ngoại",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/03/27/cuc-vang-cua-ngoai-fpt-play-1774595783778_Landscape.jpg",
    "url": "https://s6.kkphimplayer6.com/20260403/6UwV8LAv/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-cuoc-xe-am-phu-tap-1",
    "name": "Cuốc Xe Âm Phủ - Tập 1",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/04/30/cuoc-xe-am-phu-fpt-play-1777541165464_Background_origin.jpg",
    "url": "https://v7.kkphimplayer7.com/20260502/89qXv3Fa/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-cuoc-xe-am-phu-tap-2",
    "name": "Cuốc Xe Âm Phủ - Tập 2",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/04/30/cuoc-xe-am-phu-fpt-play-1777541165464_Background_origin.jpg",
    "url": "https://v7.kkphimplayer7.com/20260503/Lp2p18eb/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-cuoc-xe-am-phu-tap-3",
    "name": "Cuốc Xe Âm Phủ - Tập 3",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/04/30/cuoc-xe-am-phu-fpt-play-1777541165464_Background_origin.jpg",
    "url": "https://v7.kkphimplayer7.com/20260504/9JB48ezG/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-cuoc-xe-am-phu-tap-4",
    "name": "Cuốc Xe Âm Phủ - Tập 4",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/04/30/cuoc-xe-am-phu-fpt-play-1777541165464_Background_origin.jpg",
    "url": "https://v7.kkphimplayer7.com/20260504/xNE4czZl/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-cuoc-xe-am-phu-tap-cuoi",
    "name": "Cuốc Xe Âm Phủ - Tập Cuối",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/04/30/cuoc-xe-am-phu-fpt-play-1777541165464_Background_origin.jpg",
    "url": "https://v7.kkphimplayer7.com/20260505/6REaXK8f/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-cuoi-vo-cho-cha",
    "name": "Cưới Vợ Cho Cha",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/Logo/refs/heads/main/cuoivochocha.jpg",
    "url": "https://v7.kkphimplayer7.com/20260711/ATJuS0IV/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-doraemon-movie-44",
    "name": "Doraemon Movie 44: Nobita và cuộc phiêu lưu vào thế giới trong tranh (bản lồng tiếng)",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://kenh14cdn.com/203336854389633024/2025/5/24/ngangcc690d7e-1620-4524-aafa-a7496c81f6f6-174807929920015425666-1748084313655-17480843144601375971451.jpg",
    "url": "https://s6.kkphimplayer6.com/20250827/JfkCJsGc/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-den-am-hon",
    "name": "Đèn Âm Hồn: Người Con Gái Nam Xương",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://daknong.1cdn.vn/2025/02/06/den-am-hon-review-phim-va-lich-chieu-tai-viet-nam.jpg",
    "url": "https://s6.kkphimplayer6.com/20250811/miyJKDrj/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-hoang-tu-quy",
    "name": "Hoàng Tử Quỷ",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://cdn.galaxycine.vn/media/2025/11/25/hoang-tu-quy-750_1764065943548.jpg",
    "url": "https://v7.kkphimplayer7.com/20260615/qtiKqvFo/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-hung-long-phong-ba-4-tap-1",
    "name": "Hùng Long Phong Bá Phần 4 - Tập 1",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/02/11/hung-long-phong-ba-4-fpt-play-1770804850859_Landscape.jpg",
    "url": "https://rumble.com/hls-vod/73gr0i/playlist.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-hung-long-phong-ba-4-tap-2",
    "name": "Hùng Long Phong Bá Phần 4 - Tập 2",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/02/11/hung-long-phong-ba-4-fpt-play-1770804850859_Landscape.jpg",
    "url": "https://rumble.com/hls-vod/73k35o/playlist.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-hung-long-phong-ba-4-tap-3",
    "name": "Hùng Long Phong Bá Phần 4 - Tập 3",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/02/11/hung-long-phong-ba-4-fpt-play-1770804850859_Landscape.jpg",
    "url": "https://rumble.com/hls-vod/73os1q/playlist.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-hung-long-phong-ba-4-tap-4",
    "name": "Hùng Long Phong Bá Phần 4 - Tập 4",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/02/11/hung-long-phong-ba-4-fpt-play-1770804850859_Landscape.jpg",
    "url": "https://rumble.com/hls-vod/73s4u6/playlist.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-hung-long-phong-ba-4-tap-5",
    "name": "Hùng Long Phong Bá Phần 4 - Tập 5",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/02/11/hung-long-phong-ba-4-fpt-play-1770804850859_Landscape.jpg",
    "url": "https://rumble.com/hls-vod/73txdq/playlist.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-hung-long-phong-ba-4-tap-cuoi",
    "name": "Hùng Long Phong Bá Phần 4 - Tập Cuối",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/02/11/hung-long-phong-ba-4-fpt-play-1770804850859_Landscape.jpg",
    "url": "https://rumble.com/hls-vod/73vrdu/playlist.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-khe-uoc-ban-dau",
    "name": "Khế Ước Bán Dâu",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://tintuc-divineshop.cdn.vccloud.vn/wp-content/uploads/2025/08/164142635_khe-uoc-ban-dau.webp",
    "url": "https://s6.kkphimplayer6.com/20260118/tdyKqxYZ/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-lam-giau-voi-ma",
    "name": "Làm Giàu Với Ma (Betting With Ghost)",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://haniff.vn/wp-content/uploads/2024/10/Lam-giau-voi-ma-2.jpg",
    "url": "https://s4.phim1280.tv/20250323/KmdatGKe/3000kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-mua-tren-canh-buom",
    "name": "Mưa Trên Cánh Bướm",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://i.imgur.com/q05fNtW.png",
    "url": "https://s6.kkphimplayer6.com/20250918/48nrktLm/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-ngay-xua-co-mot-chuyen-tinh",
    "name": "Ngày Xưa Có Một Chuyện Tình",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://assets.glxplay.io/images/w700/title/ngay-xua-co-mot-chuyen-tinh_web_backdrop_8b7a5b8cbb5fe245d3a6f7aea524c796.jpg",
    "url": "https://s6.kkphimplayer6.com/20250901/w8LN0LND/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-nha-hai-chu",
    "name": "Nhà Hai Chủ",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/04/29/nha-hai-chu-fpt-play-1777448554178_Landscape.jpg",
    "url": "https://v7.kkphimplayer7.com/20260505/YnFXHB6A/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-quy-nhap-trang",
    "name": "Quỷ Nhập Tràng",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/01/27/quy-nhap-trang-fpt-play-1769508575571_Landscape.jpg",
    "url": "https://s6.kkphimplayer6.com/20260129/HDz8Fu0F/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-quy-nhap-trang-2",
    "name": "Quỷ Nhập Tràng 2",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/Logo/refs/heads/main/quy-nhap-trang-2.jpg",
    "url": "https://v7.kkphimplayer7.com/20260820/QT327Pkh/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-tai",
    "name": "Tài",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT_ECS/2026/07/27/tai20261920x1080s_1785141290941.jpg",
    "url": "https://v7.kkphimplayer7.com/20260729/UgOYpPkC/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-tham-tu-kien",
    "name": "Thám Tử Kiên: Kỳ Án Không Đầu",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2025/09/29/tham-tu-kien-ky-an-khong-dau-fpt-play-1759139646462_Landscape.jpg",
    "url": "https://s6.kkphimplayer6.com/20251010/86AEDncn/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-the-he-ky-tich",
    "name": "Thế Hệ Kỳ Tích",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/vuminhthanh12/refs/heads/main/Th%E1%BA%BF%20H%E1%BB%87%20K%E1%BB%B3%20T%C3%ADch.jpg",
    "url": "https://rumble.com/hls-vod/745t9a/playlist.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-thien-duong-mau",
    "name": "Thiên Đường Máu",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/03/13/thien-duong-mau-fpt-play-1773396128871_Landscape.jpg",
    "url": "https://s6.kkphimplayer6.com/20260320/02bq9QLy/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-tho-oi",
    "name": "Thỏ Ơi",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/Logo/refs/heads/main/Th%E1%BB%8F%20%C6%A0i.jpg",
    "url": "https://v7.kkphimplayer7.com/20260531/mazEQT6f/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-trai-tim-que-quat",
    "name": "Trái Tim Què Quặt",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2025/12/26/trai-tim-que-quat-fpt-play-1766744170691_Landscape.jpg",
    "url": "https://s6.kkphimplayer6.com/20251228/0HQf0tP2/3500kb/hls/index.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-truy-tim-long-dien-huong",
    "name": "Truy Tìm Long Diên Hương",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://cdn-images.vtv.vn/zoom/554_346/66349b6076cb4dee98746cf1/2025/09/19/truy-tim-long-dien-huong-67756442926310209483416-92025497027105625698228.jpg",
    "url": "https://rumble.com/hls-vod/74h9mw/playlist.m3u8",
    "type": "hls"
  },
  {
    "id": "phim-tu-chien-tren-khong",
    "name": "Tử Chiến Trên Không",
    "category": "phim",
    "categoryName": "Phim truyện",
    "logo": "https://images.fptplay53.net/media/OTT/VOD/2026/01/23/tu-chien-tren-khong-fpt-play-1769164011330_Landscape.jpg",
    "url": "https://rumble.com/hls-vod/72x1ns/playlist.m3u8",
    "type": "hls"
  }
];

const rawQuocTeChannels: Omit<Channel, 'number'>[] = [
  {
    "id": "al-jazeera-english",
    "name": "Al Jazeera English",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_eng.svg/1280px-Aljazeera_eng.svg.png",
    "url": "https://live-hls-web-aje-gcp.thehlive.com/AJE/01.m3u8",
    "type": "hls"
  },
  {
    "id": "all-babies-channel",
    "name": "All Babies Channel",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/abc-all-babies-channel.png",
    "url": "https://d390zi2w1jc4t4.cloudfront.net/master.m3u8",
    "type": "hls"
  },
  {
    "id": "animalhd",
    "name": "Animal Planet",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/animal-planet.png",
    "url": "https://s2129134.cdn.mytvnet.vn/pkg20/live_dzones/ap.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "ec6f072c7125377a9bc0ae61598095f4": "1d5388e0781415ebcec9914f5ad75875"
      }
    }
  },
  {
    "id": "arirang",
    "name": "Arirang",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://i.ytimg.com/vi/ZqVyukYe4YM/hq720.jpg",
    "url": "https://live.fptplay53.net/fnxhd1/airanghd_vhls.smil/chunklist_b5000000.m3u8",
    "type": "hls"
  },
  {
    "id": "axn",
    "name": "AXN",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/axn.png",
    "url": "https://s7771.cdn.mytvnet.vn/pkg20/live_dzones/axn.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "9d29f87efdec3c9fab368f724a62ad0e": "6f1c09c035eab36323d60d1454db3d20"
      }
    }
  },
  {
    "id": "barbie-and-friends",
    "name": "Barbie and Friends",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/Barbie-Friends.png",
    "url": "https://d1xqdnwy1bo05f.cloudfront.net/barb.m3u8",
    "type": "hls"
  },
  {
    "id": "bbc-cbeebies",
    "name": "BBC Cbeebies",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/bbc-cbeebies.png",
    "url": "https://s2129134.cdn.mytvnet.vn/pkg20/live_dzones/cbb.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "cca73a006b4b39a595207ceb5ed9ca0a": "b833d1f40c261ef78896f97e06f80cdc"
      }
    }
  },
  {
    "id": "bbcearth",
    "name": "BBC Earth",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://i.ytimg.com/vi/0jFG4yuzMRo/maxresdefault.jpg",
    "url": "https://s7771.cdn.mytvnet.vn/pkg20/live_dzones/bbcearth.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "5014941a2c42379880b5edf72304c165": "f3fa0fe3cd39a52f4eefd36ff7161e89"
      }
    }
  },
  {
    "id": "bbclifestyle",
    "name": "BBC Lifestyle",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://images.now-tv.com/shares/channelPreview/img/en_hk/color/ch502_425_305",
    "url": "https://s7770.cdn.mytvnet.vn/pkg20/live_dzones/bbclifestyle.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "58b949986ed13294bc01b0f330abc527": "23e8c5f2fe202906ac2d6554d9527299"
      }
    }
  },
  {
    "id": "bbcworldnews",
    "name": "BBC World News",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://i.ytimg.com/vi/jL2fsQB9J-g/maxresdefault.jpg",
    "url": "https://s7771.cdn.mytvnet.vn/pkg20/live_dzones/bbcworldnews.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "c7ba46086dda345a929e29bf155e459c": "d374b8f39904bf572689ea347ae86591"
      }
    }
  },
  {
    "id": "bloomberg",
    "name": "Bloomberg",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://i.imgur.com/rxFZgIK.png",
    "url": "https://s2129134.cdn.mytvnet.vn/pkg20/live_dzones/bloomberg.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "1071393f8fc237f3a9a28028142110f7": "7a0f8c3c72e0ffff811d534c929c57c2"
      }
    }
  },
  {
    "id": "box-hits",
    "name": "Box Hits",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/Logo/refs/heads/main/boxhits.png",
    "url": "https://livevlisctcdnw.seenow.vn/mean/BOXHIT/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "a7c942778e874d43be92b8d0a0cd11b4": "6d54358306571658ffdb952c6560688b"
      }
    }
  },
  {
    "id": "box-movie-1",
    "name": "Box Movie 1",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://vietanhtv.id.vn/logo/boxmovie.png",
    "url": "https://livevlisctcdnw.seenow.vn/mean/BM1/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "a7c942778e874d43be92b8d0a0cd11b4": "6d54358306571658ffdb952c6560688b"
      }
    }
  },
  {
    "id": "cartoon-network",
    "name": "Cartoon Network",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/cartoon-network.png",
    "url": "https://s2129134.cdn.mytvnet.vn/pkg20/live_dzones/cn.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "3c20166660a93a75ac77db81567389f7": "3cc1add43aecce3fe31c9c6a2a5b8c21"
      }
    }
  },
  {
    "id": "cartoonito",
    "name": "Cartoonito",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://1000logos.net/wp-content/uploads/2023/10/Cartoonito-Logo.jpg",
    "url": "https://s2129134.cdn.mytvnet.vn/pkg20/live_dzones/boomerang.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "b1f0d759e914369db388b3b0dc815971": "5678d317e17007a88a9b9539e4526512"
      }
    }
  },
  {
    "id": "cgtn",
    "name": "CGTN",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://i.ytimg.com/vi/twB_6GV5AM8/hq720.jpg",
    "url": "https://english-livebkali.cgtn.com/live/encgtn_0.m3u8",
    "type": "hls"
  },
  {
    "id": "cgtn-documentary",
    "name": "CGTN Documentary",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://i.ytimg.com/vi/QbB9p0LDAyE/maxresdefault.jpg",
    "url": "https://english-livebkali.cgtn.com/live/doccgtn_0.m3u8",
    "type": "hls"
  },
  {
    "id": "cinemaworld",
    "name": "CinemaWorld",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/cine.png",
    "url": "https://s2129134.cdn.mytvnet.vn/pkg20/live_dzones/cinemaworld.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "ee7915564d7439d09bd3556ffccc87a4": "b35e12a75a42a6f9184723a90ff42d9c"
      }
    }
  },
  {
    "id": "cinemax",
    "name": "Cinemax",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/cinemax.png",
    "url": "https://s2129134.cdn.mytvnet.vn/pkg20/live_dzones/max.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "acb4c23471063327adc732e283c0847f": "e9868f5f473d0fd8699ede48d531c2b0"
      }
    }
  },
  {
    "id": "cna",
    "name": "CNA",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://onecms-res.cloudinary.com/image/upload/v1673978069/mediacorp/corporate/inline-images/CNA__370x180.jpg",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=112",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "cnbc",
    "name": "CNBC",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/30b1d744249569.56076e09dd31e.png",
    "url": "https://live.fptplay53.net/fnxhd1/cnbchd_vhls.smil/chunklist_b5000000.m3u8",
    "type": "hls"
  },
  {
    "id": "cnn",
    "name": "CNN",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://deadline.com/wp-content/uploads/2020/09/CNN-Logo.jpg",
    "url": "https://s7771.cdn.mytvnet.vn/pkg20/live_dzones/cnn.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "714cc8ed05a03abb9ac61bd4bbd1d8a0": "1acf58ff8d4cd87c2d3c12d22248efb1"
      }
    }
  },
  {
    "id": "davinci",
    "name": "Da Vinci",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/davinci.png",
    "url": "https://live.fptplay53.net/fnxhd2/davincihd_vhls.smil/chunklist.m3u8",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "dreamworks",
    "name": "Dreamworks",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/dreamworks.png",
    "url": "https://s2129134.cdn.mytvnet.vn/pkg20/live_dzones/dreamwork.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "67dae20527c63dadaaae609aa91577cb": "59328f621d56767bc5ff9404a8940683"
      }
    }
  },
  {
    "id": "dw",
    "name": "DW",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://i.ytimg.com/vi/puzK9XqJ6-Y/hq720.jpg",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=109",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "fashiontv",
    "name": "Fashion TV",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/fashiontv.png",
    "url": "https://s2129134.cdn.mytvnet.vn/pkg20/live_dzones/ftv.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "c1d9f25701023508bfa6737e3a8c7001": "30c3613e9b06e0f7cc201014f31bf5d8"
      }
    }
  },
  {
    "id": "filmrise-anime",
    "name": "FilmRise Anime",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/FilmRise-Anime.png",
    "url": "https://dvu7aia8rjlfm.cloudfront.net/master.m3u8",
    "type": "hls"
  },
  {
    "id": "france24eng",
    "name": "France 24",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://m.media-amazon.com/images/I/81oryzEMf-L.png",
    "url": "https://live.france24.com/hls/live/2037218/F24_EN_HI_HLS/master_5000.m3u8",
    "type": "hls"
  },
  {
    "id": "hbo",
    "name": "HBO",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/hbo.png",
    "url": "https://s2129134.cdn.mytvnet.vn/pkg20/live_dzones/hbo.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "09ddfe3d63863cafaeb79d0546b098ab": "3de0f38dcf014827dfd5bec38743c6a2"
      }
    }
  },
  {
    "id": "hollywood-classics",
    "name": "Hollywood Classics",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/Logo/refs/heads/main/hollywoodclassic.png",
    "url": "https://livevlisctcdnw.seenow.vn/mean/HC/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "a7c942778e874d43be92b8d0a0cd11b4": "6d54358306571658ffdb952c6560688b"
      }
    }
  },
  {
    "id": "kbsworld",
    "name": "KBS World",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://img.hplus.com.vn/728x409/banner/2018/06/05/654179-KBS.png",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=213",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "kix",
    "name": "Kix",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/kix.png",
    "url": "https://live.fptplay53.net/fnxhd2/kixhd_vhls.smil/chunklist.m3u8",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "mr-bean-anime",
    "name": "Mr. Bean Anime",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/mr_bean.png",
    "url": "https://amg00627-amg00627c28-rakuten-uk-3984.playouts.now.amagi.tv/playlist/amg00627-banijayfast-mrbeanukcc-rakutenuk/playlist.m3u8",
    "type": "hls"
  },
  {
    "id": "musicbox",
    "name": "Music Box",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://img-zlr1.tv360.vn/image1/2023/07/20/10/1689822939536/68d521f6938e_640_360.png",
    "url": "https://livevlisctcdnw.seenow.vn/livesnv2/MUSICBOX/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "2942ed303e0d40c9b99c94c587bbf509": "96cda24109734fb7920d799d58d1a9ae"
      }
    }
  },
  {
    "id": "nhk-world",
    "name": "NHK World",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/vuminhthanh12/Logo/refs/heads/main/nhkworld.png",
    "url": "https://live.fptplay53.net/fnxhd2/nhkworld_vhls.smil/chunklist_b5000000.m3u8",
    "type": "hls"
  },
  {
    "id": "pbs-kids",
    "name": "PBS Kids",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/PBS_Kids.png",
    "url": "https://2-fss-2.streamhoster.com/pl_140/amlst:200914-1298290/chunklist_b2000000.m3u8",
    "type": "hls"
  },
  {
    "id": "pbs-kids-alaska",
    "name": "PBS Kids Alaska",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/PBS_Kids.png",
    "url": "https://livestream.pbskids.org/out/v1/94b88ad58fc14f84a9382341f1c00b82/akst.m3u8",
    "type": "hls"
  },
  {
    "id": "pbs-kids-mountain",
    "name": "PBS Kids Mountain",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/PBS_Kids.png",
    "url": "https://livestream.pbskids.org/out/v1/3fe3030a2c8045a3932f4289d9eba3e6/mst.m3u8",
    "type": "hls"
  },
  {
    "id": "pbs-kids-pacific",
    "name": "PBS Kids Pacific",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/PBS_Kids.png",
    "url": "https://livestream.pbskids.org/out/v1/11f2e6b73eaa4887b3746cb863960e79/pst.m3u8",
    "type": "hls"
  },
  {
    "id": "spotv",
    "name": "SPOTV",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/spotv.png",
    "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv587/manifest.mpd",
    "type": "mpd",
    "drm": {
      "type": "widevine",
      "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
    }
  },
  {
    "id": "spotv2",
    "name": "SPOTV2",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/spotv2.png",
    "url": "https://s7484.cdn.mytvnet.vn/pkg20/__cl/gvtsig/vstv588/manifest.mpd",
    "type": "mpd",
    "drm": {
      "type": "widevine",
      "licenseUrl": "https://tv.vietanhtv.top/mytv2/key.php"
    }
  },
  {
    "id": "tom-and-jerry",
    "name": "Tom And Jerry",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/tom.png",
    "url": "https://live20.bozztv.com/giatvplayout7/giatv-208314/playlist.m3u8",
    "type": "hls"
  },
  {
    "id": "tlc",
    "name": "Travel Living Channel",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/tlc.png",
    "url": "https://s129135.cdn.mytvnet.vn/pkg20/live_dzones/tlc.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "b6908629732639ada4814a6208296d9c": "7ca9bf03623f77b5e2f16df0b53f274d"
      }
    }
  },
  {
    "id": "trt-world",
    "name": "TRT World",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/425e1955860511.59ae62ac642ba.png",
    "url": "https://tv-trtworld.medya.trt.com.tr/master_1080.m3u8",
    "type": "hls"
  },
  {
    "id": "tv5monde",
    "name": "TV5Monde",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://information.tv5monde.com/sites/tv5-info/files/styles/entete/public/2023-11/tv5monde_logo.jpg",
    "url": "https://freem3u.xyz/api/live/play.m3u8?vid=9852",
    "userAgent": "Dalvik/2.1.0",
    "type": "hls"
  },
  {
    "id": "tvb-vietnam",
    "name": "TVB Việt Nam",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://tvbaw-na.s3.us-west-1.amazonaws.com/hb/TVB%20Vietnam%20Banner_Side.jpg",
    "url": "https://amg01868-amg01868c3-tvbanywhere-us-4491.playouts.now.amagi.tv/playlist1080p.m3u8",
    "type": "hls"
  },
  {
    "id": "warner-tv",
    "name": "Warner TV",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://freem3u.xyz/static/images/global/warnertv.png",
    "url": "https://s7771.cdn.mytvnet.vn/pkg20/live_dzones/wtv.smil/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "086d09a40bff3a00aa6dd4dbaf9c13b2": "34f1908cfe2e05ee060046d40f14aec9"
      }
    }
  },
  {
    "id": "woman",
    "name": "Woman",
    "category": "quocte",
    "categoryName": "Quốc Tế",
    "logo": "https://img-zlr1.tv360.vn/image1/2020_09_23/1600822442611/f6b738c3d05a_640_360.png",
    "url": "https://livevlisctcdnw.seenow.vn/Live_DASHDRM1/WO/manifest.mpd",
    "userAgent": "Dalvik/2.1.0",
    "type": "mpd",
    "drm": {
      "type": "clearkey",
      "keys": {
        "a7c942778e874d43be92b8d0a0cd11b4": "6d54358306571658ffdb952c6560688b"
      }
    }
  }
];

const rawNgheNhacChannels: Omit<Channel, 'number'>[] = [
  {
    "id": "zing-radio-1",
    "name": "ZingRadio 1 - Vpop",
    "category": "nghenhac",
    "categoryName": "Nghe nhạc",
    "logo": "https://photo-zmp3.zmdcdn.me/cover_rect/5/0/8/f/508fb88137284723e67c83b9c9fede28.jpg",
    "url": "https://multi-playlist-zmp3.zmdcdn.me/odi6UBatld4/zhls/playback-realtime/6ddadf76e3330a6d5322/index.m3u8",
    "type": "hls"
  },
  {
    "id": "zing-radio-2",
    "name": "ZingRadio 2 - Chạm FM",
    "category": "nghenhac",
    "categoryName": "Nghe nhạc",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/ch.png",
    "url": "https://multi-playlist-zmp3.zmdcdn.me/eHjZAdAk-sk/zhls/playback-realtime/59a2ee0ed24b3b15625a/index.m3u8",
    "type": "hls"
  },
  {
    "id": "zing-radio-3",
    "name": "ZingRadio 3 - Kpop",
    "category": "nghenhac",
    "categoryName": "Nghe nhạc",
    "logo": "https://photo-zmp3.zmdcdn.me/cover_rect/e/1/8/8/e1887a2c79f9d3d04984905cbf443a29.jpg",
    "url": "https://multi-playlist-zmp3.zmdcdn.me/rTbzjcKEO1A/zhls/playback-realtime/6600baac86e96fb736f8/index.m3u8",
    "type": "hls"
  },
  {
    "id": "zing-radio-4",
    "name": "ZingRadio 4 - USUK",
    "category": "nghenhac",
    "categoryName": "Nghe nhạc",
    "logo": "https://photo-zmp3.zmdcdn.me/cover_rect/3/1/0/d/310df4f53c1026d4cb2844dc96cc01d3.jpg",
    "url": "https://multi-playlist-zmp3.zmdcdn.me/-XosZVJX9XA/zhls/playback-realtime/f49e38320477ed29b466/index.m3u8",
    "type": "hls"
  },
  {
    "id": "zing-radio-5",
    "name": "ZingRadio 5 - CPop",
    "category": "nghenhac",
    "categoryName": "Nghe nhạc",
    "logo": "https://photo-zmp3.zmdcdn.me/cover_rect/1/5/c/2/15c2abf5f4554b416384d4f675b2151e.jpg",
    "url": "https://multi-playlist-zmp3.zmdcdn.me/_TAVBRh_ce4/zhls/playback-realtime/97b35e1f625a8b04d24b/index.m3u8",
    "type": "hls"
  },
  {
    "id": "zing-radio-6",
    "name": "ZingRadio 6 - EDM",
    "category": "nghenhac",
    "categoryName": "Nghe nhạc",
    "logo": "https://photo-zmp3.zmdcdn.me/cover_rect/a/6/f/4/a6f4712ca91e9cc15530960ab44611da.jpg",
    "url": "https://multi-playlist-zmp3.zmdcdn.me/lupi_x8-Su4/zhls/playback-realtime/7386bb2a876f6e31377e/index.m3u8",
    "type": "hls"
  },
  {
    "id": "zing-radio-7",
    "name": "ZingRadio 7 - Acoustic",
    "category": "nghenhac",
    "categoryName": "Nghe nhạc",
    "logo": "https://photo-zmp3.zmdcdn.me/cover_rect/8/1/d/6/81d6bc7e9ced5d11d01f6da4b440f146.jpg",
    "url": "https://multi-playlist-zmp3.zmdcdn.me/AiekixzmitQ/zhls/playback-realtime/9b7b55d7699280ccd983/index.m3u8",
    "type": "hls"
  },
  {
    "id": "zing-radio-8",
    "name": "ZingRadio 8 - Bolero",
    "category": "nghenhac",
    "categoryName": "Nghe nhạc",
    "logo": "https://photo-zmp3.zmdcdn.me/cover_rect/d/6/7/4/d6746d1bbff609111133449abb9e622b.jpg",
    "url": "https://multi-playlist-zmp3.zmdcdn.me/ioZs7yhxUxk/zhls/playback-realtime/5bace800d4453d1b6454/index.m3u8",
    "type": "hls"
  },
  {
    "id": "zing-radio-9",
    "name": "ZingRadio 9 - Rap Việt",
    "category": "nghenhac",
    "categoryName": "Nghe nhạc",
    "logo": "https://photo-zmp3.zmdcdn.me/cover_rect/0/c/2/e/0c2ee7cb5ef72b5db673341864312a2a.jpg",
    "url": "https://multi-playlist-zmp3.zmdcdn.me/XHOosOJ-f8g/zhls/playback-realtime/cef1015d3d18d4468d09/index.m3u8",
    "type": "hls"
  },
  {
    "id": "zing-radio-10",
    "name": "ZingRadio 10 - Indie",
    "category": "nghenhac",
    "categoryName": "Nghe nhạc",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/id.png",
    "url": "https://multi-playlist-zmp3.zmdcdn.me/VV55kkJD6Qo/zhls/playback-realtime/eeff2a531616ff48a607/index.m3u8",
    "type": "hls"
  },
  {
    "id": "zing-radio-11",
    "name": "ZingRadio 11 - Thiếu Nhi",
    "category": "nghenhac",
    "categoryName": "Nghe nhạc",
    "logo": "https://raw.githubusercontent.com/hieu-TQS/picture/main/tn.png",
    "url": "https://multi-playlist-zmp3.zmdcdn.me/UKk_cQEl314/zhls/playback-realtime/ef512afd16b8ffe6a6a9/index.m3u8",
    "type": "hls"
  }
];

export const ALL_CHANNELS: Channel[] = [
  ...rawVtvChannels,
  ...rawVtvcabChannels,
  ...rawHtvChannels,
  ...rawSctvChannels,
  ...rawTheThaoQuocTeChannels,
  ...rawSuKienChannels,
  ...rawDiaPhuongChannels,
  ...rawPhimChannels,
  ...rawQuocTeChannels,
  ...rawNgheNhacChannels
]
  .filter((item) => item.id !== 'ch-66')
  .map((item, index) => ({
    ...item,
    number: index + 1
  }));

export const CHANNELS_BY_CATEGORY: Record<string, Channel[]> = {
  vtv: ALL_CHANNELS.filter(c => c.category === 'vtv'),
  vtvcab: ALL_CHANNELS.filter(c => c.category === 'vtvcab'),
  htv: ALL_CHANNELS.filter(c => c.category === 'htv'),
  sctv: ALL_CHANNELS.filter(c => c.category === 'sctv'),
  thethaoquocte: ALL_CHANNELS.filter(c => c.category === 'thethaoquocte'),
  sukien: ALL_CHANNELS.filter(c => c.category === 'sukien'),
  diaphuong: ALL_CHANNELS.filter(c => c.category === 'diaphuong'),
  phim: ALL_CHANNELS.filter(c => c.category === 'phim'),
  quocte: ALL_CHANNELS.filter(c => c.category === 'quocte'),
  nghenhac: ALL_CHANNELS.filter(c => c.category === 'nghenhac')
};
