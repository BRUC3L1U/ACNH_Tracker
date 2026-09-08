// Names and comparison images: BWIKI art catalogue and forgery guide.
// Identification notes checked against Future Press's official companion guide.
// See README data sources for scope and the corrected Moving Painting clue.
// IDs are permanent collection keys; adding or reordering entries must not change them.
const ART_ITEMS = [
  {
    "id": "art_001",
    "name": "学术性的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "维特鲁威人",
    "genuineNote": "右上角没有污渍。",
    "fakeNote": "右上角有圆形咖啡渍。",
    "image": "https://patchwiki.biligame.com/images/dongsen/7/7f/4rwnyiv4ow2sj8s0f1xnp4e8x7r8ete.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/a/a8/2d60tudszq6jpwez4rwgxww2g8qiacf.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/f/f7/45sw257p8mp7nnso9w9gpzsvrvk7lbs.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%AD%A6%E6%9C%AF%E6%80%A7%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_002",
    "name": "惊人的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "夜巡",
    "genuineNote": "前排黑衣男子戴着帽子。",
    "fakeNote": "前排黑衣男子没有帽子。",
    "image": "https://patchwiki.biligame.com/images/dongsen/6/6c/f7puc77vv3rzyr1n457cgg4m2on5sg8.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/3/3d/r952kvedlyde5crl7753afnzliv7rdu.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/5/53/2jk9eadotqypua2hg3x49xvabsr4cv4.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E6%83%8A%E4%BA%BA%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_003",
    "name": "远古的雕塑",
    "artType": "雕塑",
    "authenticity": "有赝品",
    "realName": "遮光器土偶",
    "genuineNote": "头部两侧没有突出的触角。",
    "fakeNote": "头部两侧有触角。",
    "image": "https://patchwiki.biligame.com/images/dongsen/1/16/23exku73n6eu7qdsmrl90azadf29zor.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/e/e1/88piy32nhuyczao4ffxw47utpasa9d0.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/e/e8/am22nxy5ixg10nglvft8h0sq3wj7grv.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E8%BF%9C%E5%8F%A4%E7%9A%84%E9%9B%95%E5%A1%91%E7%9C%9F"
  },
  {
    "id": "art_004",
    "name": "勇敢的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "蓝衣少年",
    "genuineNote": "额头露出，刘海较短。",
    "fakeNote": "厚重的刘海遮住额头。",
    "image": "https://patchwiki.biligame.com/images/dongsen/3/3d/3xclg9wac98vjuco6v0xx9i61iajv5n.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/a/ae/iok3ydqzlmd4tv0c3iriju2toqdurn7.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/0/0a/cl3vve4mz7m0iyy5n35zr1z6t7yg3jy.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%8B%87%E6%95%A2%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_005",
    "name": "美丽的雕塑",
    "artType": "雕塑",
    "authenticity": "有赝品",
    "realName": "米洛斯的维纳斯",
    "genuineNote": "颈部没有项链。",
    "fakeNote": "颈部多了一条项链。",
    "image": "https://patchwiki.biligame.com/images/dongsen/6/6d/he67n2zxpnjwmin8evw6jr12yisqm8i.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/0/06/e5oe09ul8yso9l8tm5n11fr713zro6i.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/5/56/awk6jsobroeihwzhhdedrocku8kq3mh.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%BE%8E%E4%B8%BD%E7%9A%84%E9%9B%95%E5%A1%91%E7%9C%9F"
  },
  {
    "id": "art_006",
    "name": "和煦的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "大碗岛的星期天下午",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/3/3c/29onzt3ylb05trkdy11r4popzid39mm.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/c/cc/f7poijq7l1sffualbvvrtvk5y4u5hn5.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%92%8C%E7%85%A6%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_007",
    "name": "常见的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "拾穗者",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/9/9d/jquzrrzu1f4raa6khou9tzkrmltdye0.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/0/00/jj62oxa3bhmda9nxx1z7avvzdaewdos.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%B8%B8%E8%A7%81%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_008",
    "name": "细致的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "紫阳花双鸡图",
    "genuineNote": "花朵为蓝色，并有印章。",
    "fakeNote": "花朵为紫色，缺少印章。",
    "image": "https://patchwiki.biligame.com/images/dongsen/9/9b/h8tfg6f2bbz1w13qutqhj792myxft70.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/b/b2/6h0qrj47bkp3yiuc19drkhpjc2pd1tl.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/b/b9/r89m2hw199tvq4y40q8a62w2pvbri42.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%BB%86%E8%87%B4%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_009",
    "name": "磅礴的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "神奈川冲浪里",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/3/31/39pgwwkuggn5lhzg4tx8gm4yhlk7jjs.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/e/e2/tfvuy10tum9b045vy6q7oox4203a5s1.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%A3%85%E7%A4%B4%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_010",
    "name": "似曾相识的雕塑",
    "artType": "雕塑",
    "authenticity": "仅真品",
    "realName": "思想者",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/b/b5/3o43r7mq8xxwput252ezdnbmjwoauc0.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/4/4a/qrhklra4tm177bou87q6jznk63nsfjx.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E4%BC%BC%E6%9B%BE%E7%9B%B8%E8%AF%86%E7%9A%84%E9%9B%95%E5%A1%91"
  },
  {
    "id": "art_011",
    "name": "有名的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "蒙娜丽莎",
    "genuineNote": "没有明显上挑的眉毛。",
    "fakeNote": "多了一对上挑的眉毛。",
    "image": "https://patchwiki.biligame.com/images/dongsen/3/34/abq1i269tuq5v3zkl1kseqak4zs6d36.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/9/95/tc2roeu4tetoyaryrq1cfd3rz2ph8my.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/a/a8/s5linoon0azng4t08lg6g6elj0fx59v.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E6%9C%89%E5%90%8D%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_012",
    "name": "珍贵的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "向日葵",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/8/87/n09qv8rfts0h0hdqx8wa4ob8jb6s1ti.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/8/87/evvctdnw2scp3ogwy5ndw7f0b6baf2g.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%8F%8D%E8%B4%B5%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_013",
    "name": "英挺的雕塑",
    "artType": "雕塑",
    "authenticity": "有赝品",
    "realName": "大卫",
    "genuineNote": "手臂旁没有书。",
    "fakeNote": "右臂下夹着一本书。",
    "image": "https://patchwiki.biligame.com/images/dongsen/5/57/6ynejwzb2z9bbiegspfr4ebf5uu1foo.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/8/83/rttk1kps85sd0qd0rdwmym2lfrtlp1x.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/c/c2/5pl6maigdlprbcufh6mrjfh2hzkczc8.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E8%8B%B1%E6%8C%BA%E7%9A%84%E9%9B%95%E5%A1%91%E7%9C%9F"
  },
  {
    "id": "art_014",
    "name": "光线的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "被拖去解体的战舰无畏号",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/7/74/cxaryz1d9wt5hyj98jedwqnmydkf88s.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/5/50/14qvcww2tdpno4k0t6ad4rhf6vdvcl7.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%85%89%E7%BA%BF%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_015",
    "name": "端庄的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "回眸美人图",
    "genuineNote": "人物较小，头顶留白较多，面向画面右侧。",
    "fakeNote": "人物放大、头顶留白少；也有面向画面左侧的变化。",
    "image": "https://patchwiki.biligame.com/images/dongsen/7/7a/a6172ac2aaa9iefzmket4fr3owml66q.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/8/85/4ij4imi1dpeaqlnglfz0k00snokvgqm.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/5/53/ab6f7nl7e44vah4j4a1pe0oy6hzi2zg.jpg"
      },
      {
        "label": "赝品的另一种状态",
        "url": "https://patchwiki.biligame.com/images/dongsen/4/4a/4lxb0ba4dfvqgdvs8oj5a0c53g3lko9.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%AB%AF%E5%BA%84%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_016",
    "name": "伟大的雕塑",
    "artType": "雕塑",
    "authenticity": "仅真品",
    "realName": "卡美哈美哈一世国王像",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/d/d7/ig5o9g0eugxmepjt1wrtdw6yt794s0q.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/1/11/5jo8e8abixfmkdrqlcj6ouk3uamyntv.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E4%BC%9F%E5%A4%A7%E7%9A%84%E9%9B%95%E5%A1%91"
  },
  {
    "id": "art_017",
    "name": "线索的雕塑",
    "artType": "雕塑",
    "authenticity": "有赝品",
    "realName": "罗塞塔石碑",
    "genuineNote": "石碑为灰黑色。",
    "fakeNote": "石碑为蓝色。",
    "image": "https://patchwiki.biligame.com/images/dongsen/e/e0/lrj4zc2pclhxdtgie1vt83ng0p4l27m.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/1/11/01wiiw2n0gfouyrzcvm4xsk42vnz1gt.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/d/d7/debq7slhuyfl1ctmjyribpgj8f7kwao.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%BA%BF%E7%B4%A2%E7%9A%84%E9%9B%95%E5%A1%91%E7%9C%9F"
  },
  {
    "id": "art_018",
    "name": "有趣的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "夏季",
    "genuineNote": "胸口有向上伸出的花。",
    "fakeNote": "胸口缺少这朵花。",
    "image": "https://patchwiki.biligame.com/images/dongsen/e/e3/5sygcklfhtm7uoef7k64j48cqhlz5yh.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/c/c2/eqcddvqmek9qdoe2ykxl5urb2afejrc.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/8/80/p1anhaozre7c6tg319rh7tkbfa856e2.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E6%9C%89%E8%B6%A3%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_019",
    "name": "强健的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "播种者",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/6/61/lx09o4jaz0ll572d2ybl38f7f308xpw.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/6/6e/8v3huvmjll0jdc2x25qn3hh2vkp21th.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%BC%BA%E5%81%A5%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_020",
    "name": "充满母爱的雕塑",
    "artType": "雕塑",
    "authenticity": "有赝品",
    "realName": "青铜母狼像",
    "genuineNote": "母狼没有伸出舌头。",
    "fakeNote": "母狼伸出舌头。",
    "image": "https://patchwiki.biligame.com/images/dongsen/d/d7/i4nacr232x8su75g78tvmek4kxglapf.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/d/d1/kloaor6takkhza81eswuluyri8btsvb.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/c/c7/87tpnzdjecftineyv6jd9jcwrr69can.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%85%85%E6%BB%A1%E6%AF%8D%E7%88%B1%E7%9A%84%E9%9B%95%E5%A1%91%E7%9C%9F"
  },
  {
    "id": "art_021",
    "name": "动人的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "维纳斯的诞生",
    "genuineNote": "画面右上方、女子身后有树。",
    "fakeNote": "右上方的树消失，露出天空。",
    "image": "https://patchwiki.biligame.com/images/dongsen/f/f1/ppd9a9cenn6w6q6njny5wwzjh9ts7yy.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/b/bf/opdc9b8d9jqyk8lmg2bzfpo9qishsgt.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/a/ac/bmh39yw6cwl4tskx5wg11sgvtcpgfga.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%8A%A8%E4%BA%BA%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_022",
    "name": "神秘的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "死之岛",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/6/63/b2773s5son7ymyhwtgll476jrpck01w.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/6/63/b2773s5son7ymyhwtgll476jrpck01w.png"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%A5%9E%E7%A7%98%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_023",
    "name": "神秘的雕塑",
    "artType": "雕塑",
    "authenticity": "有赝品",
    "realName": "娜芙蒂蒂胸像",
    "genuineNote": "没有垂下的耳饰。",
    "fakeNote": "多了一枚垂下的长耳饰。",
    "image": "https://patchwiki.biligame.com/images/dongsen/e/e4/ny3vkxr2ku0jltaxzhqyl6vlzmvccq3.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/2/2d/h28yxxfx61gq1wvyt0zi8xoh9iqx022.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/9/9e/li32caa2gewf1mnj1pzeq5r85xruuf1.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%A5%9E%E7%A7%98%E7%9A%84%E9%9B%95%E5%A1%91%E7%9C%9F"
  },
  {
    "id": "art_024",
    "name": "很好的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "吹笛少年",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/f/fc/qvao325kll0iu5he4bo4yxxntt1gpa2.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/9/9e/sm7v2yp16nq3jtvfgerpzi9i3zppx4s.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%BE%88%E5%A5%BD%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_025",
    "name": "厉害的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "苹果与橘子",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/4/42/j6nxlce03r0anboonnicqb6w6w3rldh.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/c/c2/8wpj6mq0zy622dftfu82gt1ax7l7jfz.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%8E%89%E5%AE%B3%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_026",
    "name": "热闹的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "女神游乐厅的吧台",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/c/c2/idk7verwf7pmc40nxsifq5qeude68ev.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/a/a4/6aoi9offtwq8suxloqtn1hhjhmv6egz.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%83%AD%E9%97%B9%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_027",
    "name": "平静的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "倒牛奶的女仆",
    "genuineNote": "倒出的牛奶是一道细流。",
    "fakeNote": "倒出的牛奶明显更粗、量更多。",
    "image": "https://patchwiki.biligame.com/images/dongsen/2/21/px5rwl6a9u7duzcxefh9y9vbjt2x7oy.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/1/13/es8kwctyob0mwidezqcky5psjcndb8g.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/b/b8/b06voqchije5lfnptpnu8dp0kdp0s9c.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%B9%B3%E9%9D%99%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_028",
    "name": "强壮的雕塑",
    "artType": "雕塑",
    "authenticity": "有赝品",
    "realName": "掷铁饼者",
    "genuineNote": "右手腕没有手表。",
    "fakeNote": "右手腕戴着手表。",
    "image": "https://patchwiki.biligame.com/images/dongsen/d/d0/5beuchkw0j11rkstcygha8053s8lfx7.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/8/84/0orf5it8p7dli44okpomg0w89q8eeip.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/2/2d/ahoj34alkkwt9b0n0re2z4d0eas4vmk.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%BC%BA%E5%A3%AE%E7%9A%84%E9%9B%95%E5%A1%91%E7%9C%9F"
  },
  {
    "id": "art_029",
    "name": "石头颅雕塑",
    "artType": "雕塑",
    "authenticity": "有赝品",
    "realName": "奥尔梅克巨石头像",
    "genuineNote": "嘴角下垂，没有笑容。",
    "fakeNote": "嘴角上扬，露出笑容。",
    "image": "https://patchwiki.biligame.com/images/dongsen/8/8e/518zolh5z5bzwxt6pu5g3ojeop5d7qo.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/6/64/lkedgfr2upj9e5jkfbxpa5z90chxgk3.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/8/8a/spy5pijfp4gh2i7rgrwfpupqgry1fdo.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%9F%B3%E5%A4%B4%E9%A2%85%E9%9B%95%E5%A1%91%E7%9C%9F"
  },
  {
    "id": "art_030",
    "name": "俊俏的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "第三代大谷鬼次之奴江户兵卫",
    "genuineNote": "眉头朝下，表情严肃。",
    "fakeNote": "眉头上扬；也有露出笑容的变化。",
    "image": "https://patchwiki.biligame.com/images/dongsen/3/3b/01nqc6x8uajxtvco4f97cdewgu20mte.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/6/6a/1hpvkrfuztxdcvxay5m3b4jjhn0u8b1.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/a/ae/37xtu9uec1gw6q0gtl789j06k06cfcp.jpg"
      },
      {
        "label": "赝品的另一种状态",
        "url": "https://patchwiki.biligame.com/images/dongsen/c/cb/qvz6klryvlquhwd7yiivhwo4wfpucam.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E4%BF%8A%E4%BF%8F%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_031",
    "name": "优美的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "雪中猎人",
    "genuineNote": "左下方有三名猎人。",
    "fakeNote": "左下方只剩一名猎人，猎犬也变少。",
    "image": "https://patchwiki.biligame.com/images/dongsen/a/a0/7seb4q2jv1vm99nmj5zxua5fbyr0g5w.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/e/e4/bhsbq1lalt39hrjp5z8k7l85rx7e52j.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/0/09/c0ga5os7q5yp383githgjwo3xo5hyxm.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E4%BC%98%E7%BE%8E%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_032",
    "name": "婀娜的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "抱银鼠的女子",
    "genuineNote": "怀中的动物通体为白色。",
    "fakeNote": "动物身上有深色斑块。",
    "image": "https://patchwiki.biligame.com/images/dongsen/a/a9/nm7l0mq2lj0x0s2o7mcptt915m52bfn.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/4/42/s2w646cnzbw8ua2ori0e1itpe0e8xw5.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/3/3d/1r587sybdgmwxj7xjavv2m1ezc0rcaw.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%A9%80%E5%A8%9C%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_033",
    "name": "沉没的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "奥菲利亚",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/b/bd/l9au9mlsyimrwx8v59b105wqyd31iaw.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/6/60/2k2pqpstiktpkz7scqk7u21dny7tc2e.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E6%B2%89%E9%BB%98%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_034",
    "name": "肃穆的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "宫娥",
    "genuineNote": "后方门口男子的手臂较低。",
    "fakeNote": "后方男子把手抬得更高，指向上方。",
    "image": "https://patchwiki.biligame.com/images/dongsen/c/c1/les58ho9fdzuf5nkd79x71trozhi893.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/1/1e/21vg2n5knw8mp54lzohdb45dwt5pn5z.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/9/9d/at2smyttp0z1eip663ezrl57347jr6b.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E8%82%83%E7%A9%86%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_035",
    "name": "出乎意料的雕塑",
    "artType": "雕塑",
    "authenticity": "有赝品",
    "realName": "后母戊鼎",
    "genuineNote": "鼎口敞开，没有盖子。",
    "fakeNote": "鼎上多了盖子。",
    "image": "https://patchwiki.biligame.com/images/dongsen/a/a9/og732e2airkaysytysd3vjitol5hno5.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/f/fd/t4bjbgrsoy8rcrqs7sdx6go2d51uqc1.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/7/7e/8pvfrov5wak6qh4fn34edjy5q569awq.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%87%BA%E4%B9%8E%E6%84%8F%E6%96%99%E7%9A%84%E9%9B%95%E5%A1%91%E7%9C%9F"
  },
  {
    "id": "art_036",
    "name": "闪烁的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "星月夜",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/3/38/0wb7rpbapw0emglv2hggm46owafd93j.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/7/7c/84l6848o2ulx37rhjzdwtwd3afjrb28.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E9%97%AA%E7%83%81%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_037",
    "name": "神圣的雕塑",
    "artType": "雕塑",
    "authenticity": "有赝品",
    "realName": "萨莫色雷斯的胜利女神",
    "genuineNote": "雕像自身的右腿在前。",
    "fakeNote": "雕像自身的左腿在前，与真品左右相反。",
    "image": "https://patchwiki.biligame.com/images/dongsen/9/93/61ma2ahmrc0qymbf7jct1jzrk0l19jn.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/9/9e/ke0prppt263kf93e5agihkdvi0u4r4o.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/3/3d/hdh7cv82l78sfjb9seny0auitbovczz.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%A5%9E%E5%9C%A3%E7%9A%84%E9%9B%95%E5%A1%91%E7%9C%9F"
  },
  {
    "id": "art_038",
    "name": "舒适的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "着衣的玛哈",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/4/40/hkja9fr7lzt3m3ixjebfxia4t9hdlly.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/7/73/g9w8t5re80763es6artxoz3b7g0gaa1.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E8%88%92%E9%80%82%E7%9A%84%E5%90%8D%E7%94%BB"
  },
  {
    "id": "art_039",
    "name": "武士的雕刻",
    "artType": "雕塑",
    "authenticity": "有赝品",
    "realName": "兵马俑",
    "genuineNote": "双手之间没有铲子。",
    "fakeNote": "双手扶着一把铲子。",
    "image": "https://patchwiki.biligame.com/images/dongsen/5/50/8z0jv94b8vg36szi84jjxpu2kzhnve2.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/5/5c/2npdup011582ltfxhwbpi7ryrb7gb0r.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/a/ae/nvr1wmk9ty2hcv9mlfb5v9mz1e66mte.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E6%AD%A6%E5%A3%AB%E7%9A%84%E9%9B%95%E5%88%BB%E7%9C%9F"
  },
  {
    "id": "art_040",
    "name": "粗野的名画左半边",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "风神雷神图屏风（雷神）",
    "genuineNote": "神像为白色。",
    "fakeNote": "神像变成绿色。",
    "image": "https://patchwiki.biligame.com/images/dongsen/e/ea/5fxciswdqnjkmg7wpbxgjlmwnril96f.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/8/86/pa3cg56nt8ap0rhhl81cskadx6pyza8.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/f/ff/ruzvhmui3437q5z3mqmy922ecncs233.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%B2%97%E9%87%8E%E7%9A%84%E5%90%8D%E7%94%BB%E5%B7%A6%E5%8D%8A%E8%BE%B9%E7%9C%9F"
  },
  {
    "id": "art_041",
    "name": "粗野的名画右半边",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "风神雷神图屏风（风神）",
    "genuineNote": "神像为绿色。",
    "fakeNote": "神像变成白色。",
    "image": "https://patchwiki.biligame.com/images/dongsen/2/2b/4uhyr7prae3yjo39joi8oupapwaw8sg.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/a/a9/ainnpjxbyg3eca7xi30bomgas3scwsr.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/c/cc/opggx7dfok5w27zgwf93l0ujz9oc2vw.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E7%B2%97%E9%87%8E%E7%9A%84%E5%90%8D%E7%94%BB%E5%8F%B3%E5%8D%8A%E8%BE%B9%E7%9C%9F"
  },
  {
    "id": "art_042",
    "name": "漂亮的名画",
    "artType": "名画",
    "authenticity": "有赝品",
    "realName": "戴珍珠耳环的少女",
    "genuineNote": "耳饰为圆形珍珠。",
    "fakeNote": "耳饰为星形；也有闭眼的变化。",
    "image": "https://patchwiki.biligame.com/images/dongsen/a/aa/29i99p7jldibrnsvh5io165jlghyzxh.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/2/24/r3pisqud5zj572515socrqwsd9x4jqv.jpg"
      },
      {
        "label": "赝品",
        "url": "https://patchwiki.biligame.com/images/dongsen/4/48/bv93v7rtipt7kv78c0579q59oxmijxa.jpg"
      },
      {
        "label": "赝品的另一种状态",
        "url": "https://patchwiki.biligame.com/images/dongsen/c/cf/qceh7ncfpjfb3b5f2w8yuy7rcbnhawk.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E6%BC%82%E4%BA%AE%E7%9A%84%E5%90%8D%E7%94%BB%E7%9C%9F"
  },
  {
    "id": "art_043",
    "name": "名贵的名画",
    "artType": "名画",
    "authenticity": "仅真品",
    "realName": "自由引导人民",
    "genuineNote": "这件艺术品没有赝品。",
    "fakeNote": "",
    "image": "https://patchwiki.biligame.com/images/dongsen/8/89/4j7czafhvijb7pjg7zmvtugcs23he2c.png",
    "comparisons": [
      {
        "label": "真品",
        "url": "https://patchwiki.biligame.com/images/dongsen/b/ba/o6ugx1msbe45x88zeu541sgh3o17gi8.jpg"
      }
    ],
    "sourceUrl": "https://wiki.biligame.com/dongsen/%E5%90%8D%E8%B4%B5%E7%9A%84%E5%90%8D%E7%94%BB"
  }
];

export const ART_DATA = Object.freeze(ART_ITEMS.map(item => Object.freeze({
  ...item,
  comparisons: Object.freeze(item.comparisons.map(comparison => Object.freeze(comparison)))
})));
