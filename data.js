import { shiftMonths } from './schema.js';
import { ART_DATA } from './art-data.js';

const FISH_DATA = [
  {
    id: "fish_001",
    name: "红目鲫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/2b/h7e8yfv2sh86m83vnexdia6jpn0cv75.png/80px-%E3%82%BF%E3%83%8A%E3%82%B4.png",
    location: "河流",
    shadowSize: "特小",
    northMonths: [1,2,3,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 900
  },
  {
    id: "fish_002",
    name: "溪哥",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/3/31/7mzob58scv2d6wwbxg1txm4fyp9i4a4.png/80px-%E3%82%AA%E3%82%A4%E3%82%AB%E3%83%AF.png",
    location: "河流",
    shadowSize: "特小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [9,10,11,12,13,14,15,16],
    price: 200
  },
  {
    id: "fish_003",
    name: "鲫鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/49/7gpabuqx1xc8jxi0ba3vpfhdpx8tnwd.png/80px-%E3%83%95%E3%83%8A.png",
    location: "河流",
    shadowSize: "稍小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 160
  },
  {
    id: "fish_004",
    name: "雅罗鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/ce/07izuyyrslir10f8zbnnd7bjkwvyust.png/80px-%E3%82%A6%E3%82%B0%E3%82%A4.png",
    location: "河流",
    shadowSize: "中",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 240
  },
  {
    id: "fish_005",
    name: "鲤鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/8/83/rpkowt4rjxrz69bdjgbaisnlnu6pk7y.png/80px-%E3%82%B3%E3%82%A4.png",
    location: "池塘",
    shadowSize: "稍大",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 300
  },
  {
    id: "fish_006",
    name: "锦鲤",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/8/84/ll3j8z4836ai8ahmjfw11pqlvahqzek.png/80px-%E3%83%8B%E3%82%B7%E3%82%AD%E3%82%B4%E3%82%A4.png",
    location: "池塘",
    shadowSize: "稍大",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 4000
  },
  {
    id: "fish_007",
    name: "金鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/5/51/l1qiiao9a4jnz1t2tgvbc4b52620mdk.png/80px-%E3%82%AD%E3%83%B3%E3%82%AE%E3%83%A7.png",
    location: "池塘",
    shadowSize: "特小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1300
  },
  {
    id: "fish_008",
    name: "龙睛金鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/43/3wul51gym31wr185jd16g7e34400646.png/80px-%E3%83%87%E3%83%A1%E3%82%AD%E3%83%B3.png",
    location: "池塘",
    shadowSize: "特小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [9,10,11,12,13,14,15,16],
    price: 1300
  },
  {
    id: "fish_009",
    name: "兰寿金鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/ea/kmgqmj5vbxsqo7a7f8ttquox9esybp2.png/80px-%E3%83%A9%E3%83%B3%E3%83%81%E3%83%A5%E3%82%A6.png",
    location: "池塘",
    shadowSize: "稍小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [9,10,11,12,13,14,15,16],
    price: 4500
  },
  {
    id: "fish_010",
    name: "稻田鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/a/a1/8bhd8ymx77oga6cgcu2kejac2zx1y1h.png/80px-%E3%83%A1%E3%83%80%E3%82%AB.png",
    location: "池塘",
    shadowSize: "特小",
    northMonths: [4,5,6,7,8],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 300
  },
  {
    id: "fish_011",
    name: "淡水龙虾",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/f/f7/g18rjfpmnh66g2jbp2v2ysz02q3sse1.png/80px-%E3%82%B6%E3%83%AA%E3%82%AC%E3%83%8B.png",
    location: "池塘",
    shadowSize: "稍小",
    northMonths: [4,5,6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 200
  },
  {
    id: "fish_012",
    name: "鳖",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d5/0jpytpo0t85ry9itm2ut2zglyvcns9d.png/80px-%E3%82%B9%E3%83%83%E3%83%9D%E3%83%B3.png",
    location: "河流",
    shadowSize: "稍大",
    northMonths: [8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 3750
  },
  {
    id: "fish_013",
    name: "拟鳄龟",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/c8/pl60tn4c17a1b0m695ahnsdmzj6yepr.png/80px-%E3%82%AB%E3%83%9F%E3%83%84%E3%82%AD%E3%82%AC%E3%83%A1.png",
    location: "河流",
    shadowSize: "稍大",
    northMonths: [4,5,6,7,8,9,10],
    hours: [0,1,2,3,4,21,22,23],
    price: 5000
  },
  {
    id: "fish_014",
    name: "蝌蚪",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/7d/jvwwycd9ywyy6cbwobwk9p442ilv3qw.png/80px-%E3%82%AA%E3%82%BF%E3%83%9E%E3%82%B8%E3%83%A3%E3%82%AF%E3%82%B7.png",
    location: "池塘",
    shadowSize: "特小",
    northMonths: [3,4,5,6,7],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 100
  },
  {
    id: "fish_015",
    name: "青蛙",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e4/hdtx9sf53q8pdabeppc8w8o7arpnq3v.png/80px-%E3%82%AB%E3%82%A8%E3%83%AB.png",
    location: "池塘",
    shadowSize: "稍小",
    northMonths: [5,6,7,8],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 120
  },
  {
    id: "fish_016",
    name: "塘鳢鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/6/63/1v49llkhzx8xgx25y4sgs2n8cod7xyo.png/80px-%E3%83%89%E3%83%B3%E3%82%B3.png",
    location: "河流",
    shadowSize: "稍小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 400
  },
  {
    id: "fish_017",
    name: "泥鳅",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/ca/a1jtdwf74go20o9hbq4qxdsobqc9vrx.png/80px-%E3%83%89%E3%82%B8%E3%83%A7%E3%82%A6.png",
    location: "河流",
    shadowSize: "稍小",
    northMonths: [3,4,5],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 400
  },
  {
    id: "fish_018",
    name: "鲶鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/0c/8rpmdkucuuq6ebzkrpeohj5m30wyfu1.png/80px-%E3%83%8A%E3%83%9E%E3%82%BA.png",
    location: "池塘",
    shadowSize: "稍大",
    northMonths: [5,6,7,8,9,10],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 800
  },
  {
    id: "fish_019",
    name: "黑鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/8/8b/d4g5vhhtiaeapu4s4o95pmzp020jkkj.png/80px-%E3%83%A9%E3%82%A4%E3%82%AE%E3%83%A7.png",
    location: "池塘",
    shadowSize: "稍大",
    northMonths: [6,7,8],
    hours: [9,10,11,12,13,14,15,16],
    price: 5500
  },
  {
    id: "fish_020",
    name: "蓝腮太阳鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/ee/4vm195u1h782pc1avo04u6kou1sp5qq.png/80px-%E3%83%96%E3%83%AB%E3%83%BC%E3%82%AE%E3%83%AB.png",
    location: "河流",
    shadowSize: "稍小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [9,10,11,12,13,14,15,16],
    price: 180
  },
  {
    id: "fish_021",
    name: "黄鲈鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/4b/irc2d2zc98f0voiuvylog418n9eu795.png/80px-%E3%82%A4%E3%82%A8%E3%83%AD%E3%83%BC%E3%83%91%E3%83%BC%E3%83%81.png",
    location: "河流",
    shadowSize: "中",
    northMonths: [1,2,3,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 300
  },
  {
    id: "fish_022",
    name: "黑鲈鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/6/68/p42emnfc7ip4r95i33krb6ehjtdixfw.png/80px-%E3%83%96%E3%83%A9%E3%83%83%E3%82%AF%E3%83%90%E3%82%B9.png",
    location: "河流",
    shadowSize: "稍大",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 400
  },
  {
    id: "fish_023",
    name: "吴郭鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/14/prbt048mdjqgh3foqk1zq7p7buou0o6.png/80px-%E3%83%86%E3%82%A3%E3%83%A9%E3%83%94%E3%82%A2.png",
    location: "河流",
    shadowSize: "中",
    northMonths: [6,7,8,9,10],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 800
  },
  {
    id: "fish_024",
    name: "白斑狗鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/77/pv8emgmx5axok8vbz0j00semcqisx5x.png/80px-%E3%83%91%E3%82%A4%E3%82%AF.png",
    location: "河流",
    shadowSize: "大",
    northMonths: [9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1800
  },
  {
    id: "fish_025",
    name: "西太公鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/5/59/ivr5ebz8qgbhfwgz2v46rlpd9bzti1g.png/80px-%E3%83%AF%E3%82%AB%E3%82%B5%E3%82%AE.png",
    location: "河流",
    shadowSize: "稍小",
    northMonths: [1,2,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 400
  },
  {
    id: "fish_026",
    name: "香鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/5/57/rzlb802cc1dfs9pmsu9f9kiwgluypyi.png/80px-%E3%82%A2%E3%83%A6.png",
    location: "河流",
    shadowSize: "中",
    northMonths: [7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 900
  },
  {
    id: "fish_027",
    name: "樱花钩吻鲑",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/6/69/dokqdxshvmi88ezm1vh2xl0jxyi70oy.png/80px-%E3%83%A4%E3%83%9E%E3%83%A1.png",
    location: "悬崖上",
    shadowSize: "中",
    northMonths: [3,4,5,6,9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1000
  },
  {
    id: "fish_028",
    name: "花羔红点鲑",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/b/bf/m6yiih27x6iqyzuhn3w7p3a9bfs7my7.png/80px-%E3%82%AA%E3%82%AA%E3%82%A4%E3%83%AF%E3%83%8A.png",
    location: "悬崖上",
    shadowSize: "中",
    northMonths: [3,4,5,6,9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 3800
  },
  {
    id: "fish_029",
    name: "金鳟",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/b/b4/hju4hizzg2xmsmzgu3azx7npwpfbdlr.png/80px-%E3%82%B4%E3%83%BC%E3%83%AB%E3%83%87%E3%83%B3%E3%83%88%E3%83%A9%E3%82%A6%E3%83%88.png",
    location: "悬崖上",
    shadowSize: "中",
    northMonths: [3,4,5,9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 15000
  },
  {
    id: "fish_030",
    name: "远东哲罗鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/14/0mc67aftp63pu7pp1orfuei72vvh8nr.png/80px-%E3%82%A4%E3%83%88%E3%82%A6.png",
    location: "悬崖上",
    shadowSize: "大",
    northMonths: [1,2,3,12],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 15000
  },
  {
    id: "fish_031",
    name: "鲑鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/18/bb9iw31pap5g4uhhq4nq0c9ze1ayf7d.png/80px-%E3%82%B5%E3%82%B1.png",
    location: "出海口",
    shadowSize: "稍大",
    northMonths: [9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 700
  },
  {
    id: "fish_032",
    name: "帝王鲑",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e0/l3v65k7uhrbp41ijbc0usoct1djcp0n.png/80px-%E3%82%AD%E3%83%B3%E3%82%B0%E3%82%B5%E3%83%BC%E3%83%A2%E3%83%B3.png",
    location: "出海口",
    shadowSize: "大",
    northMonths: [9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1800
  },
  {
    id: "fish_033",
    name: "中华绒螯蟹",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/9/92/lknkm6txgzxvpzijekvcba0g0ofcpag.png/80px-%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%8F%E3%82%A4%E3%82%AC%E3%83%8B.png",
    location: "河流",
    shadowSize: "稍小",
    northMonths: [9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 2000
  },
  {
    id: "fish_034",
    name: "孔雀鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/8/89/rw56wcvmrxu2tw592d2i76plwsrec96.png/80px-%E3%82%B0%E3%83%83%E3%83%94%E3%83%BC.png",
    location: "河流",
    shadowSize: "特小",
    northMonths: [4,5,6,7,8,9,10,11],
    hours: [9,10,11,12,13,14,15,16],
    price: 1300
  },
  {
    id: "fish_035",
    name: "温泉医生鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/09/16ss1juswihz9n029rny9cy2ca61i0e.png/80px-%E3%83%89%E3%82%AF%E3%82%BF%E3%83%BC%E3%83%95%E3%82%A3%E3%83%83%E3%82%B7%E3%83%A5.png",
    location: "河流",
    shadowSize: "特小",
    northMonths: [5,6,7,8,9],
    hours: [9,10,11,12,13,14,15,16],
    price: 1500
  },
  {
    id: "fish_036",
    name: "神仙鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/12/az7ienxdha4zclb7ctp26uylxd4b1r0.png/80px-%E3%82%A8%E3%83%B3%E3%82%BC%E3%83%AB%E3%83%95%E3%82%A3%E3%83%83%E3%82%B7%E3%83%A5.png",
    location: "河流",
    shadowSize: "稍小",
    northMonths: [5,6,7,8,9,10],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 3000
  },
  {
    id: "fish_037",
    name: "斗鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d7/ku2isgz3t3o9wroe2eycn3d0f1mkns3.png/80px-%E3%83%99%E3%82%BF.png",
    location: "河流",
    shadowSize: "稍小",
    northMonths: [5,6,7,8,9,10],
    hours: [9,10,11,12,13,14,15,16],
    price: 2500
  },
  {
    id: "fish_038",
    name: "霓虹灯鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/10/nsovgsbddr6l6k17u8o09o0c5koj9wy.png/80px-%E3%83%8D%E3%82%AA%E3%83%B3%E3%83%86%E3%83%88%E3%83%A9.png",
    location: "河流",
    shadowSize: "特小",
    northMonths: [4,5,6,7,8,9,10,11],
    hours: [9,10,11,12,13,14,15,16],
    price: 500
  },
  {
    id: "fish_039",
    name: "彩虹鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/08/s4ev8q4xpx8p9792wvx2knd31e5trf1.png/80px-%E3%83%AC%E3%82%A4%E3%83%B3%E3%83%9C%E3%83%BC%E3%83%95%E3%82%A3%E3%83%83%E3%82%B7%E3%83%A5.png",
    location: "河流",
    shadowSize: "特小",
    northMonths: [5,6,7,8,9,10],
    hours: [9,10,11,12,13,14,15,16],
    price: 800
  },
  {
    id: "fish_040",
    name: "食人鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/71/sclkmux2kxayhndzd4tjotfw2aat663.png/80px-%E3%83%94%E3%83%A9%E3%83%8B%E3%82%A2.png",
    location: "河流",
    shadowSize: "稍小",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,9,10,11,12,13,14,15,16,21,22,23],
    price: 2500
  },
  {
    id: "fish_041",
    name: "骨舌鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/8/8a/pelv0w3ur24gqx1vgqxtabsve3mivzw.png/80px-%E3%82%A2%E3%83%AD%E3%83%AF%E3%83%8A.png",
    location: "河流",
    shadowSize: "稍大",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 10000
  },
  {
    id: "fish_042",
    name: "黄金河虎",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/2b/7zi6iendlzvrq5hlfrvsmwpml16w3p4.png/80px-%E3%83%89%E3%83%A9%E3%83%89.png",
    location: "河流",
    shadowSize: "大",
    northMonths: [6,7,8,9],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
    price: 15000
  },
  {
    id: "fish_043",
    name: "雀鳝",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/6/69/9s9vxvkqnu6ig1z2jpiwrfkv0o4jakk.png/80px-%E3%82%AC%E3%83%BC.png",
    location: "池塘",
    shadowSize: "大",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 6000
  },
  {
    id: "fish_044",
    name: "巨骨舌鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/46/417p8b6qepweugm42f5kw66ulnq5uqg.png/80px-%E3%83%94%E3%83%A9%E3%83%AB%E3%82%AF.png",
    location: "河流",
    shadowSize: "特大",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 10000
  },
  {
    id: "fish_045",
    name: "恩氏多鳍鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e0/tlryr2oorudlnzs7pzrapz2jebbzzgw.png/80px-%E3%82%A8%E3%83%B3%E3%83%89%E3%83%AA%E3%82%B1%E3%83%AA%E3%83%BC.png",
    location: "河流",
    shadowSize: "稍大",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,21,22,23],
    price: 4000
  },
  {
    id: "fish_046",
    name: "鲟鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/13/3rv7gk92km567pswu45nsd8zqfdkoph.png/80px-%E3%83%81%E3%83%A7%E3%82%A6%E3%82%B6%E3%83%A1.png",
    location: "出海口",
    shadowSize: "特大",
    northMonths: [1,2,3,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 10000
  },
  {
    id: "fish_047",
    name: "海天使",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/f/f7/t7jc3q7p4t4lvt3ru2gtai1qcc8a7ko.png/80px-%E3%82%AF%E3%83%AA%E3%82%AA%E3%83%8D.png",
    location: "大海",
    shadowSize: "特小",
    northMonths: [1,2,3,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1000
  },
  {
    id: "fish_048",
    name: "海马",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/f/f6/kgoyq4mq9gxjpk1y7n0rq93euj25pze.png/80px-%E3%82%BF%E3%83%84%E3%83%8E%E3%82%AA%E3%83%88%E3%82%B7%E3%82%B4.png",
    location: "大海",
    shadowSize: "特小",
    northMonths: [4,5,6,7,8,9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1100
  },
  {
    id: "fish_049",
    name: "小丑鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/9/93/8ngj7r868f122vyrwad6c48gpkzqhkw.png/80px-%E3%82%AF%E3%83%9E%E3%83%8E%E3%83%9F.png",
    location: "大海",
    shadowSize: "特小",
    northMonths: [4,5,6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 650
  },
  {
    id: "fish_050",
    name: "拟刺尾鲷",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/7d/gobvb6v7dcon7w03g5dgzy57pahdpkq.png/80px-%E3%83%8A%E3%83%B3%E3%83%A8%E3%82%A6%E3%83%8F%E3%82%AE.png",
    location: "大海",
    shadowSize: "稍小",
    northMonths: [4,5,6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1000
  },
  {
    id: "fish_051",
    name: "耳带蝴蝶鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d5/9vedk5xlkq0s9gw3305om4lysfu5070.png/80px-%E3%83%81%E3%83%A7%E3%82%A6%E3%83%81%E3%83%A7%E3%82%A6%E3%82%A6%E3%82%AA.png",
    location: "大海",
    shadowSize: "稍小",
    northMonths: [4,5,6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1000
  },
  {
    id: "fish_052",
    name: "苏眉鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/5/54/4nejh18c2z4hn24d7pcz1xtfimk94bl.png/80px-%E3%83%8A%E3%83%9D%E3%83%AC%E3%82%AA%E3%83%B3%E3%83%95%E3%82%A3%E3%83%83%E3%82%B7%E3%83%A5.png",
    location: "大海",
    shadowSize: "特大",
    northMonths: [7,8],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
    price: 10000
  },
  {
    id: "fish_053",
    name: "狮子鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/3/3a/brs53in944dflt3hig9pny7dofjri1c.png/80px-%E3%83%9F%E3%83%8E%E3%82%AB%E3%82%B5%E3%82%B4.png",
    location: "大海",
    shadowSize: "中",
    northMonths: [4,5,6,7,8,9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 500
  },
  {
    id: "fish_054",
    name: "河豚",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/9/94/gbw905i2d51yboda00788p9fuesflec.png/80px-%E3%83%95%E3%82%B0.png",
    location: "大海",
    shadowSize: "中",
    northMonths: [1,2,11,12],
    hours: [0,1,2,3,4,21,22,23],
    price: 5000
  },
  {
    id: "fish_055",
    name: "刺豚",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/a/af/dy1wo6hzw7ex3oxrhb9lpbcqhsomjwx.png/80px-%E3%83%8F%E3%83%AA%E3%82%BB%E3%83%B3%E3%83%9C%E3%83%B3.png",
    location: "大海",
    shadowSize: "中",
    northMonths: [7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 250
  },
  {
    id: "fish_056",
    name: "凤尾鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/06/t8jrqsivrbqio9o71dofi68hl4dn769.png/80px-%E3%82%A2%E3%83%B3%E3%83%81%E3%83%A7%E3%83%93.png",
    location: "大海",
    shadowSize: "稍小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
    price: 200
  },
  {
    id: "fish_057",
    name: "竹荚鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/4c/rs3f8dcipq87sa5rj0jm3s3m5beykqq.png/80px-%E3%82%A2%E3%82%B8.png",
    location: "大海",
    shadowSize: "稍小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 150
  },
  {
    id: "fish_058",
    name: "条石鲷",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/7f/4uh6ao0ym76x7aehf57trnubywvueww.png/80px-%E3%82%A4%E3%82%B7%E3%83%80%E3%82%A4.png",
    location: "大海",
    shadowSize: "中",
    northMonths: [3,4,5,6,7,8,9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 5000
  },
  {
    id: "fish_059",
    name: "鲈鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/6/62/2413d4xxizimhopsc8g0p34kccwqoz3.png/80px-%E3%82%B9%E3%82%BA%E3%82%AD.png",
    location: "大海",
    shadowSize: "大",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 400
  },
  {
    id: "fish_060",
    name: "鲷鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/ca/qw3xkntcusy5fggzttuxp6119cgkxpx.png/80px-%E3%82%BF%E3%82%A4.png",
    location: "大海",
    shadowSize: "稍大",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 3000
  },
  {
    id: "fish_061",
    name: "鲽鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/17/6q9wwyx7p9emckvearazvzgcjntqe17.png/80px-%E3%82%AB%E3%83%AC%E3%82%A4.png",
    location: "大海",
    shadowSize: "中",
    northMonths: [1,2,3,4,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 300
  },
  {
    id: "fish_062",
    name: "比目鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d3/egf08r0fkt5ha5y8t1rui23j4bji4rh.png/80px-%E3%83%92%E3%83%A9%E3%83%A1.png",
    location: "大海",
    shadowSize: "大",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 800
  },
  {
    id: "fish_063",
    name: "鱿鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/ee/bk9eadp80m3k3z4zm4wawr6mkexssx4.png/80px-%E3%82%A4%E3%82%AB.png",
    location: "大海",
    shadowSize: "中",
    northMonths: [1,2,3,4,5,6,7,8,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 500
  },
  {
    id: "fish_064",
    name: "裸胸鳝",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/42/n1io97k5ut7jr9yzjagcl48qvd3tojl.png/80px-%E3%82%A6%E3%83%84%E3%83%9C.png",
    location: "大海",
    shadowSize: "细长",
    northMonths: [8,9,10],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 2000
  },
  {
    id: "fish_065",
    name: "五彩鳗",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/5/51/8j8z3njvg1u2vxgm779b91b46u4wigb.png/80px-%E3%83%8F%E3%83%8A%E3%83%92%E3%82%B2%E3%82%A6%E3%83%84%E3%83%9C.png",
    location: "大海",
    shadowSize: "细长",
    northMonths: [6,7,8,9,10],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 600
  },
  {
    id: "fish_066",
    name: "鲔鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/3/39/7kbw4yo9eo9jp1jcdpo21dm0271msrm.png/80px-%E3%83%9E%E3%82%B0%E3%83%AD.png",
    location: "码头",
    shadowSize: "特大",
    northMonths: [1,2,3,4,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 7000
  },
  {
    id: "fish_067",
    name: "旗鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/a/a7/e45gxoprc559fipll0a2ynv9vie8e2z.png/80px-%E3%82%AB%E3%82%B8%E3%82%AD.png",
    location: "码头",
    shadowSize: "特大",
    northMonths: [1,2,3,4,7,8,9,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 10000
  },
  {
    id: "fish_068",
    name: "白面弄鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/8/82/d9t5omxi2exx7oxy4obbdy6go4os14t.png/80px-%E3%83%AD%E3%82%A6%E3%83%8B%E3%83%B3%E3%82%A2%E3%82%B8.png",
    location: "码头",
    shadowSize: "大",
    northMonths: [5,6,7,8,9,10],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 4500
  },
  {
    id: "fish_069",
    name: "鬼头刀",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/7e/iql1135iro3890tb0asqudmosnn9bxe.png/80px-%E3%82%B7%E3%82%A4%E3%83%A9.png",
    location: "码头",
    shadowSize: "大",
    northMonths: [5,6,7,8,9,10],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 6000
  },
  {
    id: "fish_070",
    name: "翻车鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e3/h86chodkqcdcc4pi2bzfxjm6u6t02eq.png/80px-%E3%83%9E%E3%83%B3%E3%83%9C%E3%82%A6.png",
    location: "大海",
    shadowSize: "背鳍",
    northMonths: [7,8,9],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
    price: 4000
  },
  {
    id: "fish_071",
    name: "鳐鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/4f/kaasprzy9wmodbrdjm7mc9nuddefh0w.png/80px-%E3%82%A8%E3%82%A4.png",
    location: "大海",
    shadowSize: "大",
    northMonths: [8,9,10,11],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
    price: 3000
  },
  {
    id: "fish_072",
    name: "锯鲨",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/5/55/a4d7q2k2lqs1785c4ow1efk27yvbfgt.png/80px-%E3%83%8E%E3%82%B3%E3%82%AE%E3%83%AA%E3%82%B6%E3%83%A1.png",
    location: "大海",
    shadowSize: "背鳍",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 12000
  },
  {
    id: "fish_073",
    name: "双髻鲨",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/a/a5/30fl4ws324j6yb2h6tnekrdvq04t6g0.png/80px-%E3%82%B7%E3%83%A5%E3%83%A2%E3%82%AF%E3%82%B6%E3%83%A1.png",
    location: "大海",
    shadowSize: "背鳍",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 8000
  },
  {
    id: "fish_074",
    name: "鲨鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/b/bf/2189n313mat13h0iz26cm8va91ugck1.png/80px-%E3%82%B5%E3%83%A1.png",
    location: "大海",
    shadowSize: "背鳍",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,16,17,18,19,20,21,22,23],
    price: 15000
  },
  {
    id: "fish_075",
    name: "鲸鲨",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/23/k2my0utwwe4ka33o80q2ewgzcsaltqt.png/80px-%E3%82%B8%E3%83%B3%E3%83%99%E3%82%A8%E3%82%B6%E3%83%A1.png",
    location: "大海",
    shadowSize: "背鳍",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 13000
  },
  {
    id: "fish_076",
    name: "吸盘鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e1/9u97ouv3wp72p5tb7k6v2yxng6rzhyn.png/80px-%E3%82%B3%E3%83%90%E3%83%B3%E3%82%B6%E3%83%A1.png",
    location: "大海",
    shadowSize: "背鳍",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1500
  },
  {
    id: "fish_077",
    name: "灯笼鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e9/nch66xnybubhc83gxwk6cdq7rtf9zz8.png/80px-%E3%83%81%E3%83%A7%E3%82%A6%E3%83%81%E3%83%B3%E3%82%A2%E3%83%B3%E3%82%B3%E3%82%A6.png",
    location: "大海",
    shadowSize: "稍大",
    northMonths: [1,2,3,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 2500
  },
  {
    id: "fish_078",
    name: "皇带鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/2e/0s6mm9eld3co16sc6tyyaize58ujkx6.png/80px-%E3%83%AA%E3%83%A5%E3%82%A6%E3%82%B0%E3%82%A6%E3%83%8E%E3%83%84%E3%82%AB%E3%82%A4.png",
    location: "大海",
    shadowSize: "特大",
    northMonths: [1,2,3,4,5,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 9000
  },
  {
    id: "fish_079",
    name: "太平洋桶眼鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/0d/donnltjruei52iaahn7y3ruvu1xznsd.png/80px-%E3%83%87%E3%83%A1%E3%83%8B%E3%82%AE%E3%82%B9.png",
    location: "大海",
    shadowSize: "稍小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,21,22,23],
    price: 15000
  },
  {
    id: "fish_080",
    name: "矛尾鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/b/b9/61i5zfw0hmbvsrrbxxftjvvsbvlqz5l.png/80px-%E3%82%B7%E3%83%BC%E3%83%A9%E3%82%AB%E3%83%B3%E3%82%B9.png",
    location: "大海",
    shadowSize: "特大",
    weather: "雨天",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 15000
  }
];

const BUG_DATA = [
  {
    id: "bug_001",
    name: "白粉蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/f/f2/b3yp0xsxbjkmjzdt7swumevf12av2e1.png/80px-%E3%83%A2%E3%83%B3%E3%82%B7%E3%83%AD%E3%83%81%E3%83%A7%E3%82%A6.png",
    location: "绿地",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [1,2,3,4,5,6,9,10,11,12],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
    price: 160
  },
  {
    id: "bug_002",
    name: "斑缘点粉蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/1c/jhjnypmn09oo9g0zysfe6jlgnjgor8g.png/80px-%E3%83%A2%E3%83%B3%E3%82%AD%E3%83%81%E3%83%A7%E3%82%A6.png",
    location: "绿地",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [3,4,5,6,9,10],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
    price: 160
  },
  {
    id: "bug_003",
    name: "凤蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/eb/a463w7hebh04d0f5y0wp4clogbpy5sm.png/80px-%E3%82%A2%E3%82%B2%E3%83%8F%E3%83%81%E3%83%A7%E3%82%A6.png",
    location: "绿地",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [3,4,5,6,7,8,9],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
    price: 240
  },
  {
    id: "bug_004",
    name: "乌鸦凤蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d5/2hk29zv9hefe8h1uda40mf0sksq55cs.png/80px-%E3%82%AB%E3%83%A9%E3%82%B9%E3%82%A2%E3%82%B2%E3%83%8F.png",
    location: "绿地",
    note: "飞行；异色花附近",
    weather: "雨雪天除外",
    northMonths: [3,4,5,6],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
    price: 2500
  },
  {
    id: "bug_005",
    name: "青带凤蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/42/kgcgkc78moc6qtlxwq01x6rdi3yc63u.png/80px-%E3%82%A2%E3%82%AA%E3%82%B9%E3%82%B8%E3%82%A2%E3%82%B2%E3%83%8F.png",
    location: "绿地",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [4,5,6,7,8],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    price: 300
  },
  {
    id: "bug_006",
    name: "大白斑蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/a/a1/r0ej13b4qcbezi8kf2k1uid6zecj4xf.png/80px-%E3%82%AA%E3%82%AA%E3%82%B4%E3%83%9E%E3%83%80%E3%83%A9.png",
    location: "绿地",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [8,9,10,11,12,13,14,15,16,17,18,19],
    price: 1000
  },
  {
    id: "bug_007",
    name: "大紫蛱蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/05/cd94oi83q6k5z7rn2p7kma8r6jkw3wz.png/80px-%E3%82%AA%E3%82%AA%E3%83%A0%E3%83%A9%E3%82%B5%E3%82%AD.png",
    location: "绿地",
    note: "飞行",
    weather: "无限制",
    northMonths: [5,6,7,8],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
    price: 3000
  },
  {
    id: "bug_008",
    name: "大桦斑蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/26/4ljjxhawv3sxudodkwofngmp2girwzt.png/80px-%E3%82%AA%E3%82%AA%E3%82%AB%E3%83%90%E3%83%9E%E3%83%80%E3%83%A9.png",
    location: "绿地",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [9,10,11],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17],
    price: 140
  },
  {
    id: "bug_009",
    name: "大蓝闪蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e9/9hf7sxz0e3ya2bqy8gaxgjrt971eiqo.png/80px-%E3%83%A2%E3%83%AB%E3%83%95%E3%82%A9%E3%83%81%E3%83%A7%E3%82%A6.png",
    location: "绿地",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [1,2,3,6,7,8,9,12],
    hours: [0,1,2,3,4,5,6,7,8,19,20,21,22,23],
    price: 4000
  },
  {
    id: "bug_010",
    name: "彩袄蛱蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d5/53pvy4fel6fvhfb43wsv3iwo503hudu.png/80px-%E3%83%9F%E3%82%A4%E3%83%AD%E3%82%BF%E3%83%86%E3%83%8F.png",
    location: "绿地",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [4,5,6,7,8,9],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 3000
  },
  {
    id: "bug_011",
    name: "红颈凤蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/0d/64gis9x156ukxsbhici74rabf6uznhd.png/80px-%E3%82%A2%E3%82%AB%E3%82%A8%E3%83%AA%E3%83%88%E3%83%AA%E3%83%90%E3%83%8D%E3%82%A2%E3%82%B2%E3%83%8F.png",
    location: "绿地",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [1,2,4,5,6,7,8,9,12],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 2500
  },
  {
    id: "bug_012",
    name: "亚历山大凤蝶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/a/aa/cbptbezq95qtzkiw2n3kx4c08xtexo6.png/80px-%E3%82%A2%E3%83%AC%E3%82%AF%E3%82%B5%E3%83%B3%E3%83%89%E3%83%A9%E3%83%88%E3%83%AA%E3%83%90%E3%83%8D%E3%82%A2%E3%82%B2%E3%83%8F.png",
    location: "绿地",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [5,6,7,8,9],
    hours: [8,9,10,11,12,13,14,15,16],
    price: 4000
  },
  {
    id: "bug_013",
    name: "飞蛾",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/74/efh07nnwjtzbl42gu65lzmjbuz40xa9.png/80px-%E3%82%AC.png",
    location: "其他",
    note: "户外灯光附近飞行",
    weather: "雨雪天除外",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,19,20,21,22,23],
    price: 130
  },
  {
    id: "bug_014",
    name: "皇蛾",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e8/27of6gfarjcf5uy4q2ahezgq6wbopib.png/80px-%E3%83%A8%E3%83%8A%E3%82%B0%E3%83%8B%E3%82%B5%E3%83%B3.png",
    location: "树干",
    weather: "无限制",
    northMonths: [4,5,6,7,8,9],
    hours: [0,1,2,3,4,19,20,21,22,23],
    price: 3000
  },
  {
    id: "bug_015",
    name: "日落蛾",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/26/klve8wu8t28h994n7phuzqtkr1dkyk0.png/80px-%E3%83%8B%E3%82%B7%E3%82%AD%E3%82%AA%E3%82%AA%E3%83%84%E3%83%90%E3%83%A1%E3%82%AC.png",
    location: "绿地",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [4,5,6,7,8,9],
    hours: [8,9,10,11,12,13,14,15,16],
    price: 2500
  },
  {
    id: "bug_016",
    name: "中华剑角蝗",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/da/2wuyovjbrhorakxvsn718nzjxe9xghz.png/80px-%E3%82%B7%E3%83%A7%E3%82%A6%E3%83%AA%E3%83%A7%E3%82%A6%E3%83%90%E3%83%83%E3%82%BF.png",
    location: "草地",
    note: "地面跳跃",
    weather: "无限制",
    northMonths: [4,5,6,7,8,9,10,11],
    hours: [8,9,10,11,12,13,14,15,16,17,18,19],
    price: 200
  },
  {
    id: "bug_017",
    name: "飞蝗",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d3/6rcr3ud6wt93uio2scco5z7uz3nxkcz.png/80px-%E3%83%88%E3%83%8E%E3%82%B5%E3%83%9E%E3%83%90%E3%83%83%E3%82%BF.png",
    location: "草地",
    note: "地面跳跃",
    weather: "雨雪天除外",
    northMonths: [8,9,10,11],
    hours: [8,9,10,11,12,13,14,15,16,17,18,19],
    price: 600
  },
  {
    id: "bug_018",
    name: "稻蝗",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/7e/o8i7s1qtdsona7i7lrmk7mb5dfat5cu.png/80px-%E3%82%A4%E3%83%8A%E3%82%B4.png",
    location: "草地",
    note: "地面跳跃",
    weather: "雨雪天除外",
    northMonths: [8,9,10,11],
    hours: [8,9,10,11,12,13,14,15,16,17,18,19],
    price: 400
  },
  {
    id: "bug_019",
    name: "蚱蜢",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/18/sgbum7vsbr9rzh6qrnhrwv538spp0z7.png/80px-%E3%82%AD%E3%83%AA%E3%82%AE%E3%83%AA%E3%82%B9.png",
    location: "草地",
    note: "地面跳跃",
    weather: "雨雪天除外",
    northMonths: [7,8,9],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 160
  },
  {
    id: "bug_020",
    name: "蟋蟀",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/7f/j5fysdul8weezpg8ulqhje1vb849rug.png/80px-%E3%82%B3%E3%82%AA%E3%83%AD%E3%82%AE.png",
    location: "草地",
    note: "地面跳跃",
    weather: "雨雪天除外",
    northMonths: [9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,17,18,19,20,21,22,23],
    price: 130
  },
  {
    id: "bug_021",
    name: "铃虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/c4/2noves2coa2l118fb37hfn5j8l3btia.png/80px-%E3%82%B9%E3%82%BA%E3%83%A0%E3%82%B7.png",
    location: "草地",
    note: "地面跳跃",
    weather: "雨雪天除外",
    northMonths: [9,10],
    hours: [0,1,2,3,4,5,6,7,8,17,18,19,20,21,22,23],
    price: 430
  },
  {
    id: "bug_022",
    name: "螳螂",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/5/5f/ny1jhu8zq99duqv9tfp6w76ed8jmmey.png/80px-%E3%82%AB%E3%83%9E%E3%82%AD%E3%83%AA.png",
    location: "花朵",
    note: "会逃走",
    weather: "雨雪天除外",
    northMonths: [3,4,5,6,7,8,9,10,11],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 430
  },
  {
    id: "bug_023",
    name: "兰花螳螂",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d2/6kuqr6g6i8637x0uvkcmzj10s3foi1s.png/80px-%E3%83%8F%E3%83%8A%E3%82%AB%E3%83%9E%E3%82%AD%E3%83%AA.png",
    location: "花朵",
    note: "白色花；会逃走",
    weather: "雨雪天除外",
    northMonths: [3,4,5,6,7,8,9,10,11],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 2400
  },
  {
    id: "bug_024",
    name: "蜜蜂",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/08/ehfsi19n1hjp8525sf90vm7sq08eq5k.png/80px-%E3%83%9F%E3%83%84%E3%83%90%E3%83%81.png",
    location: "花朵",
    note: "花丛附近飞行",
    weather: "雨雪天除外",
    northMonths: [3,4,5,6,7],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 200
  },
  {
    id: "bug_025",
    name: "黄蜂",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/f/f1/32m51dy40jr3qutq16svxhdn6rfk4sh.png/80px-%E3%83%8F%E3%83%81.png",
    location: "树干",
    note: "摇晃或敲击树干，落下蜂巢中出现",
    weather: "无限制",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 2500
  },
  {
    id: "bug_026",
    name: "油蝉",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/ce/6ciwxrzahp3v0wa113g7fxtewrdtqks.png/80px-%E3%82%A2%E3%83%96%E3%83%A9%E3%82%BC%E3%83%9F.png",
    location: "树干",
    note: "除椰子和香蕉树",
    weather: "无限制",
    northMonths: [7,8],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 250
  },
  {
    id: "bug_027",
    name: "斑透翅蝉",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/0d/3fp7zz61kad1outsg3pqjgfq693aaar.png/80px-%E3%83%9F%E3%83%B3%E3%83%9F%E3%83%B3%E3%82%BC%E3%83%9F.png",
    location: "树干",
    note: "除椰子和香蕉树",
    weather: "无限制",
    northMonths: [7,8],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 300
  },
  {
    id: "bug_028",
    name: "熊蝉",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/24/09skn0p7td5dd3yoz0ieifz4l2rq6wb.png/80px-%E3%82%AF%E3%83%9E%E3%82%BC%E3%83%9F.png",
    location: "树干",
    note: "除椰子和香蕉树",
    weather: "无限制",
    northMonths: [7,8],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 500
  },
  {
    id: "bug_029",
    name: "寒蝉",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/26/lboywkkmog7s7qr2hw2dfybe51gxnk9.png/80px-%E3%83%84%E3%82%AF%E3%83%84%E3%82%AF%E3%83%9B%E3%82%A6%E3%82%B7.png",
    location: "树干",
    note: "除椰子和香蕉树",
    weather: "无限制",
    northMonths: [8,9],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 400
  },
  {
    id: "bug_030",
    name: "暮蝉",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/b/b2/2bhixh5ijnsqvfgy6c24p3aqpw8fb0w.png/80px-%E3%83%92%E3%82%B0%E3%83%A9%E3%82%B7.png",
    location: "树干",
    note: "除椰子和香蕉树",
    weather: "无限制",
    northMonths: [7,8],
    hours: [4,5,6,7,8,16,17,18,19],
    price: 550
  },
  {
    id: "bug_031",
    name: "蝉蜕",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/5/5c/4lm0p5u7y7174g2goqopdqsm2tlzhzy.png/80px-%E3%82%BB%E3%83%9F%E3%81%AE%E3%81%AC%E3%81%91%E3%81%8C%E3%82%89.png",
    location: "树干",
    note: "除椰子和香蕉树",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 10
  },
  {
    id: "bug_032",
    name: "红蜻蜓",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d9/3vaem3pytlrts6xg2uxvdeczmvvht6m.png/80px-%E3%82%A2%E3%82%AD%E3%82%A2%E3%82%AB%E3%83%8D.png",
    location: "水边",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [9,10],
    hours: [8,9,10,11,12,13,14,15,16,17,18,19],
    price: 180
  },
  {
    id: "bug_033",
    name: "绿胸晏蜓",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/6/68/35qwjxxgphlumqe6kr2bcgxb1pt3rl5.png/80px-%E3%82%AE%E3%83%B3%E3%83%A4%E3%83%B3%E3%83%9E.png",
    location: "水边",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [4,5,6,7,8,9,10],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 230
  },
  {
    id: "bug_034",
    name: "无霸勾蜓",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/f/f5/49cq2wxlwjvtu63aixqz4d2ggw8caor.png/80px-%E3%82%AA%E3%83%8B%E3%83%A4%E3%83%B3%E3%83%9E.png",
    location: "水边",
    note: "飞行",
    weather: "雨雪天除外",
    northMonths: [5,6,7,8,9,10],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 4500
  },
  {
    id: "bug_035",
    name: "豆娘",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/4c/5h1leeevpg2uzxbs8o96umf1j3uwkno.png/80px-%E3%82%A4%E3%83%88%E3%83%88%E3%83%B3%E3%83%9C.png",
    location: "水边",
    note: "飞行",
    weather: "雨天除外",
    northMonths: [1,2,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 500
  },
  {
    id: "bug_036",
    name: "萤火虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/4d/csj99s3wbipdtr6qp80uwznehfp1xp5.png/80px-%E3%83%9B%E3%82%BF%E3%83%AB.png",
    location: "水边",
    note: "淡水附近飞行",
    weather: "雨雪天除外",
    northMonths: [6],
    hours: [0,1,2,3,4,19,20,21,22,23],
    price: 300
  },
  {
    id: "bug_037",
    name: "蝼蛄",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e2/s6bgynitx6jugz2xbr0vcnhkb5ca52d.png/80px-%E3%82%AA%E3%82%B1%E3%83%A9.png",
    location: "地面",
    note: "听声音挖掘地面",
    weather: "无限制",
    northMonths: [1,2,3,4,5,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 500
  },
  {
    id: "bug_038",
    name: "水黾",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/7d/8vereheoonx65w8lnpx7rcd4c4aj0z5.png/80px-%E3%82%A2%E3%83%A1%E3%83%B3%E3%83%9C.png",
    location: "水中",
    note: "池塘水面滑行",
    weather: "雪天除外",
    northMonths: [5,6,7,8,9],
    hours: [8,9,10,11,12,13,14,15,16,17,18,19],
    price: 130
  },
  {
    id: "bug_039",
    name: "龙虱",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/4b/blb6a5a4y777zrfu0vpsiryfas9rbhp.png/80px-%E3%82%B2%E3%83%B3%E3%82%B4%E3%83%AD%E3%82%A6.png",
    location: "水中",
    note: "河流或池塘",
    weather: "无限制",
    northMonths: [5,6,7,8,9],
    hours: [8,9,10,11,12,13,14,15,16,17,18,19],
    price: 800
  },
  {
    id: "bug_040",
    name: "田鳖",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/ee/7n3mcawyl274y9gbmbxs18h5mqhfk0h.png/80px-%E3%82%BF%E3%82%AC%E3%83%A1.png",
    location: "水中",
    note: "河流或池塘",
    weather: "无限制",
    northMonths: [4,5,6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,19,20,21,22,23],
    price: 2000
  },
  {
    id: "bug_041",
    name: "椿象",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/3/31/c09v7xf55gyngff55a6vwvg26nm4qsn.png/80px-%E3%82%AB%E3%83%A1%E3%83%A0%E3%82%B7.png",
    location: "花朵",
    note: "会逃走",
    weather: "无限制",
    northMonths: [3,4,5,6,7,8,9,10],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 120
  },
  {
    id: "bug_042",
    name: "人面樁象",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d0/qydptepgvff5uts5enhiijze0mxdtxs.png/80px-%E3%82%B8%E3%83%B3%E3%83%A1%E3%83%B3%E3%82%AB%E3%83%A1%E3%83%A0%E3%82%B7.png",
    location: "花朵",
    note: "会逃走",
    weather: "无限制",
    northMonths: [3,4,5,6,7,8,9,10],
    hours: [0,1,2,3,4,5,6,7,8,19,20,21,22,23],
    price: 1000
  },
  {
    id: "bug_043",
    name: "瓢虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/15/6nz4hr40bmrl2ha7pr280zgncuhwevn.png/80px-%E3%83%86%E3%83%B3%E3%83%88%E3%82%A6%E3%83%A0%E3%82%B7.png",
    location: "花朵",
    note: "会逃走",
    weather: "雨雪天除外",
    northMonths: [3,4,5,6,10],
    hours: [8,9,10,11,12,13,14,15,16,17],
    price: 200
  },
  {
    id: "bug_044",
    name: "虎甲虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/f/fb/4xcby3i52236wn6ev1y42n7kiyaa08y.png/80px-%E3%83%8F%E3%83%B3%E3%83%9F%E3%83%A7%E3%82%A6.png",
    location: "草地",
    note: "地面爬行",
    weather: "雨雪天除外",
    northMonths: [2,3,4,5,6,7,8,9,10],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1500
  },
  {
    id: "bug_045",
    name: "吉丁虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/a/a3/h10nyi28cp4tohgl0egpm4dyfy5ty1d.png/80px-%E3%82%BF%E3%83%9E%E3%83%A0%E3%82%B7.png",
    location: "树桩",
    weather: "无限制",
    northMonths: [4,5,6,7,8],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 2400
  },
  {
    id: "bug_046",
    name: "提琴虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d8/op28yn15q8kd9ka7fo7ycdboip729kf.png/80px-%E3%83%90%E3%82%A4%E3%82%AA%E3%83%AA%E3%83%B3%E3%83%A0%E3%82%B7.png",
    location: "树桩",
    weather: "雨雪天除外",
    northMonths: [5,6,9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 450
  },
  {
    id: "bug_047",
    name: "星天牛",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/22/9jd3fmbyo3xl1orkafn3jueih41zc2d.png/80px-%E3%82%B4%E3%83%9E%E3%83%80%E3%83%A9%E3%82%AB%E3%83%9F%E3%82%AD%E3%83%AA.png",
    location: "树桩",
    weather: "无限制",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 350
  },
  {
    id: "bug_048",
    name: "琉璃星天牛",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/7a/6h3gd1qqapnntl33gvnsn07puhlbwjb.png/80px-%E3%83%AB%E3%83%AA%E3%83%9C%E3%82%B7%E3%82%AB%E3%83%9F%E3%82%AD%E3%83%AA.png",
    location: "树桩",
    weather: "无限制",
    northMonths: [5,6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 3000
  },
  {
    id: "bug_049",
    name: "宝石象鼻虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/6/6f/b66i2k78qbcqqnog4myaf3kdasuu36r.png/80px-%E3%83%9B%E3%82%A6%E3%82%BB%E3%82%AD%E3%82%BE%E3%82%A6%E3%83%A0%E3%82%B7.png",
    location: "树干",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 800
  },
  {
    id: "bug_050",
    name: "蜣螂",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/05/ra00g1nzgtx896zqiheawlgqhr6a93q.png/80px-%E3%83%95%E3%83%B3%E3%82%B3%E3%83%AD%E3%82%AC%E3%82%B7.png",
    location: "其他",
    note: "雪球附近出现",
    weather: "无限制",
    northMonths: [1,2,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 3000
  },
  {
    id: "bug_051",
    name: "雪隐金龟",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/0f/jhf66vi110p0r61v9u2glamheo9og68.png/80px-%E3%82%AA%E3%82%AA%E3%82%BB%E3%83%B3%E3%83%81%E3%82%B3%E3%82%AC%E3%83%8D.png",
    location: "草地",
    note: "地面爬行",
    weather: "无限制",
    northMonths: [7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 300
  },
  {
    id: "bug_052",
    name: "宝石金龟",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/4f/k00ko2dxz18s7gyw9ptbkz4owxuebsc.png/80px-%E3%83%97%E3%83%A9%E3%83%81%E3%83%8A%E3%82%B3%E3%82%AC%E3%83%8D.png",
    location: "树干",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,23],
    price: 10000
  },
  {
    id: "bug_053",
    name: "日铜锣花金龟",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/14/lfqid0o6vj9388z2zkx3yxojentkr0u.png/80px-%E3%82%AB%E3%83%8A%E3%83%96%E3%83%B3.png",
    location: "树干",
    weather: "无限制",
    northMonths: [6,7,8],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 200
  },
  {
    id: "bug_054",
    name: "歌利亚大角花金龟",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/f/fe/sk36ditdr7qetggwqav4smaxn5tsp0u.png/80px-%E3%82%B4%E3%83%A9%E3%82%A4%E3%82%A2%E3%82%B9%E3%82%AA%E3%82%AA%E3%83%84%E3%83%8E%E3%83%8F%E3%83%8A%E3%83%A0%E3%82%B0%E3%83%AA.png",
    location: "椰子树",
    weather: "无限制",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,17,18,19,20,21,22,23],
    price: 8000
  },
  {
    id: "bug_055",
    name: "锯锹形虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/9/94/9a8ay56uthbrpmfminffe2weoci5koh.png/80px-%E3%83%8E%E3%82%B3%E3%82%AE%E3%83%AA%E3%82%AF%E3%83%AF%E3%82%AC%E3%82%BF.png",
    location: "树干",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 2000
  },
  {
    id: "bug_056",
    name: "深山锹形虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/b/b6/1tgzktp1xzz5heg3xudf6sxvx95rlut.png/80px-%E3%83%9F%E3%83%A4%E3%83%9E%E3%82%AF%E3%83%AF%E3%82%AC%E3%82%BF.png",
    location: "树干",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1000
  },
  {
    id: "bug_057",
    name: "大锹形虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/c7/kl2h6iab5a4x4ghxfl4u0bricx3bs1z.png/80px-%E3%82%AA%E3%82%AA%E3%82%AF%E3%83%AF%E3%82%AC%E3%82%BF.png",
    location: "树干",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,23],
    price: 10000
  },
  {
    id: "bug_058",
    name: "彩虹锹形虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/ec/k379k4nylxls6unpczuhfsuov4zf3vj.png/80px-%E3%83%8B%E3%82%B8%E3%82%A4%E3%83%AD%E3%82%AF%E3%83%AF%E3%82%AC%E3%82%BF.png",
    location: "树干",
    weather: "无限制",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,19,20,21,22,23],
    price: 6000
  },
  {
    id: "bug_059",
    name: "细身赤锹形虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/ed/apun9p18lvqbjjgprhnfxi13vn6ox9p.png/80px-%E3%83%9B%E3%82%BD%E3%82%A2%E3%82%AB%E3%82%AF%E3%83%AF%E3%82%AC%E3%82%BF.png",
    location: "椰子树",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,17,18,19,20,21,22,23],
    price: 8000
  },
  {
    id: "bug_060",
    name: "黄金鬼锹形虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/f/f4/e04sqs6pdi33qecnviowin9ksydzjky.png/80px-%E3%82%AA%E3%82%A6%E3%82%B4%E3%83%B3%E3%82%AA%E3%83%8B%E3%82%AF%E3%83%AF%E3%82%AC%E3%82%BF.png",
    location: "椰子树",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,17,18,19,20,21,22,23],
    price: 12000
  },
  {
    id: "bug_061",
    name: "长颈鹿锯锹形虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/25/4nblp4jbds5a4g34ut9gj6sik6sk6wf.png/80px-%E3%82%AE%E3%83%A9%E3%83%95%E3%82%A1%E3%83%8E%E3%82%B3%E3%82%AE%E3%83%AA%E3%82%AF%E3%83%AF%E3%82%AC%E3%82%BF.png",
    location: "椰子树",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,17,18,19,20,21,22,23],
    price: 12000
  },
  {
    id: "bug_062",
    name: "独角仙",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e6/pacp8nrf17uqwavc7ee1uyztpt5p2y0.png/80px-%E3%82%AB%E3%83%96%E3%83%88%E3%83%A0%E3%82%B7.png",
    location: "树干",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,17,18,19,20,21,22,23],
    price: 1350
  },
  {
    id: "bug_063",
    name: "高卡萨斯南洋大兜虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/8/8c/f0nunnzdey4n6txrsmjohf9wzgdv5n6.png/80px-%E3%82%B3%E3%83%BC%E3%82%AB%E3%82%B5%E3%82%B9%E3%82%AA%E3%82%AA%E3%82%AB%E3%83%96%E3%83%88.png",
    location: "椰子树",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,17,18,19,20,21,22,23],
    price: 8000
  },
  {
    id: "bug_064",
    name: "象兜虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/c6/7cu5djvk4l15ymstuaw2tllhqx2m9yy.png/80px-%E3%82%BE%E3%82%A6%E3%82%AB%E3%83%96%E3%83%88.png",
    location: "椰子树",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,17,18,19,20,21,22,23],
    price: 8000
  },
  {
    id: "bug_065",
    name: "长戟大兜虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/00/0hr4gzq7jvh9yt1fise09xr78fnr3xo.png/80px-%E3%83%98%E3%83%A9%E3%82%AF%E3%83%AC%E3%82%B9%E3%82%AA%E3%82%AA%E3%82%AB%E3%83%96%E3%83%88.png",
    location: "椰子树",
    weather: "无限制",
    northMonths: [7,8],
    hours: [0,1,2,3,4,5,6,7,8,17,18,19,20,21,22,23],
    price: 12000
  },
  {
    id: "bug_066",
    name: "竹节虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/76/f5tx68tkp3uqmh78ntp38y1jf4b20cj.png/80px-%E3%83%8A%E3%83%8A%E3%83%95%E3%82%B7.png",
    location: "树干",
    weather: "无限制",
    northMonths: [7,8,9,10,11],
    hours: [4,5,6,7,8,17,18,19],
    price: 600
  },
  {
    id: "bug_067",
    name: "叶竹节虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/3/30/n32cu3rqvjmzz1p3ocea5o40pm9ft34.png/80px-%E3%82%B3%E3%83%8E%E3%83%8F%E3%83%A0%E3%82%B7.png",
    location: "树干",
    note: "拟态为叶片（家具物品形式）",
    weather: "无限制",
    northMonths: [7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 600
  },
  {
    id: "bug_068",
    name: "蓑衣虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/2c/t40nr1onxpzkbejyxz46v4qi2z9us8v.png/80px-%E3%83%9F%E3%83%8E%E3%83%A0%E3%82%B7.png",
    location: "树干",
    note: "摇晃或敲击垂下",
    weather: "无限制",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 600
  },
  {
    id: "bug_069",
    name: "蚂蚁",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e5/acr3ls2qa7py4l2jqfud8oqakwb4kaj.png/80px-%E3%82%A2%E3%83%AA.png",
    location: "地面",
    note: "下雨或有腐烂的大头菜时出现",
    weather: "无限制",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 80
  },
  {
    id: "bug_070",
    name: "寄居蟹",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/9/9e/pgh20kmdlsqgtvxxuwwz4t1dljrx7lb.png/80px-%E3%83%A4%E3%83%89%E3%82%AB%E3%83%AA.png",
    location: "沙滩",
    note: "平时像是个贝壳",
    weather: "无限制",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,19,20,21,22,23],
    price: 1000
  },
  {
    id: "bug_071",
    name: "海蟑螂",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/44/rnoe2jce7nl8jviu8wilk9f1uz1nenl.png/80px-%E3%83%95%E3%83%8A%E3%83%A0%E3%82%B7.png",
    location: "沙滩",
    weather: "无限制",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 200
  },
  {
    id: "bug_072",
    name: "苍蝇",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/2f/4tybndib1yjm2546xbbzyat2ae60ea2.png/80px-%E3%83%8F%E3%82%A8.png",
    location: "其他",
    note: "腐烂的大头菜和垃圾附近飞行",
    weather: "无限制",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 60
  },
  {
    id: "bug_073",
    name: "蚊子",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/1d/hpto6goikl78tv423xzj5a05cydphe6.png/80px-%E3%82%AB.png",
    location: "其他",
    note: "随机出现（飞到附近会有嗡嗡声）",
    weather: "雨雪天除外",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,17,18,19,20,21,22,23],
    price: 130
  },
  {
    id: "bug_074",
    name: "跳蚤",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/45/39urm5brl1n683j9sjs5x0glynnwp0n.png/80px-%E3%83%8E%E3%83%9F.png",
    location: "其他",
    note: "居民身上",
    weather: "无限制",
    northMonths: [4,5,6,7,8,9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 70
  },
  {
    id: "bug_075",
    name: "蜗牛",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/b/bd/7tkmks670yq8u60he5w2x7ai0766niu.png/80px-%E3%82%AB%E3%82%BF%E3%83%84%E3%83%A0%E3%83%AA.png",
    location: "岩石",
    note: "岩石或灌木上；会逃走",
    weather: "雨天",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 250
  },
  {
    id: "bug_076",
    name: "鼠妇",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/03/p7uigfpk1z6gkr9uwtaf0o8pl4rpg82.png/80px-%E3%83%80%E3%83%B3%E3%82%B4%E3%83%A0%E3%82%B7.png",
    location: "岩石",
    note: "敲击岩石",
    weather: "无限制",
    northMonths: [1,2,3,4,5,6,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,23],
    price: 250
  },
  {
    id: "bug_077",
    name: "蜈蚣",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/12/g282jnq09efbm3d627oksawbkskvngd.png/80px-%E3%83%A0%E3%82%AB%E3%83%87.png",
    location: "岩石",
    note: "敲击岩石",
    weather: "无限制",
    northMonths: [1,2,3,4,5,6,9,10,11,12],
    hours: [16,17,18,19,20,21,22,23],
    price: 300
  },
  {
    id: "bug_078",
    name: "蜘蛛",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/46/qwbh9fxs6hic8ak559uexglydf0galq.png/80px-%E3%82%AF%E3%83%A2.png",
    location: "树干",
    note: "摇晃或敲击垂下",
    weather: "无限制",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,19,20,21,22,23],
    price: 600
  },
  {
    id: "bug_079",
    name: "狼蛛",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d3/it1fdtc760ypmg4jk7a9g3dne07u9n7.png/80px-%E3%82%BF%E3%83%A9%E3%83%B3%E3%83%81%E3%83%A5%E3%83%A9.png",
    location: "草地",
    note: "地面爬行；靠近会主动攻击",
    weather: "无限制",
    northMonths: [1,2,3,4,11,12],
    hours: [0,1,2,3,4,19,20,21,22,23],
    price: 8000
  },
  {
    id: "bug_080",
    name: "蝎子",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/a/a0/ix36kyg7stw7dgpcx1c20gnoj1yss2p.png/80px-%E3%82%B5%E3%82%BD%E3%83%AA.png",
    location: "草地",
    note: "地面爬行；靠近会主动攻击",
    weather: "无限制",
    northMonths: [5,6,7,8,9,10],
    hours: [0,1,2,3,4,19,20,21,22,23],
    price: 8000
  }
];

const SEA_DATA = [
  {
    id: "sea_001",
    name: "裙带菜",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/8/87/93y8t4253testg9wexf29d8gwv94a5g.png/80px-%E3%83%AF%E3%82%AB%E3%83%A1.png",
    location: "海洋底部",
    shadowSize: "稍大",
    northMonths: [1,2,3,4,5,6,7,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 600
  },
  {
    id: "sea_002",
    name: "海葡萄",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/11/co308vb2kitaxf72nwblqhl2zwhmbbv.png/80px-%E3%82%A6%E3%83%9F%E3%83%96%E3%83%89%E3%82%A6.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 900
  },
  {
    id: "sea_003",
    name: "海参",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/1/10/mpsaw8jzyedlwc9rph6289v4lt4qgzl.png/80px-%E3%83%8A%E3%83%9E%E3%82%B3.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [1,2,3,4,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 500
  },
  {
    id: "sea_004",
    name: "海猪",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/a/a0/aizbqnqwvp1b6hpubeh6tju4j5llwth.png/80px-%E3%82%BB%E3%83%B3%E3%82%B8%E3%83%A5%E3%83%8A%E3%83%9E%E3%82%B3.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [1,2,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 10000
  },
  {
    id: "sea_005",
    name: "海星",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/b/b3/fm11lvrxm2blq03vilstt7jy2pp9slx.png/80px-%E3%83%92%E3%83%88%E3%83%87.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 500
  },
  {
    id: "sea_006",
    name: "海胆",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/6/62/ikv5v6091x6w6bnez3q73tpyd5aymw4.png/80px-%E3%82%A6%E3%83%8B.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [5,6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1700
  },
  {
    id: "sea_007",
    name: "石笔海胆",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/9/9e/sgn6qlg1kqbv27hi9v0x5qpiwba5u3q.png/80px-%E3%83%91%E3%82%A4%E3%83%97%E3%82%A6%E3%83%8B.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [5,6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 2000
  },
  {
    id: "sea_008",
    name: "海葵",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/0f/boqgs5g70g3b0r483u96xajsbxewqqs.png/80px-%E3%82%A4%E3%82%BD%E3%82%AE%E3%83%B3%E3%83%81%E3%83%A3%E3%82%AF.png",
    location: "海洋底部",
    shadowSize: "稍大",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 500
  },
  {
    id: "sea_009",
    name: "海月水母",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/77/tf30ms72w3uuhrjzb05qnnxiiot3je7.png/80px-%E3%83%9F%E3%82%BA%E3%82%AF%E3%83%A9%E3%82%B2.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 600
  },
  {
    id: "sea_010",
    name: "海蛞蝓",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/00/7cnckp16l264eim40a5cde2adg0db55.png/80px-%E3%82%A6%E3%83%9F%E3%82%A6%E3%82%B7.png",
    location: "海洋底部",
    shadowSize: "特小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 600
  },
  {
    id: "sea_011",
    name: "马氏珠母贝",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/48/4ael270dj1heqt91uhgd6t4uaaeecee.png/80px-%E3%82%A2%E3%82%B3%E3%83%A4%E3%82%AC%E3%82%A4.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 2800
  },
  {
    id: "sea_012",
    name: "贻贝",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/0f/9lpi1h6g1uestxw2ms83ib4kqrd243c.png/80px-%E3%83%A0%E3%83%BC%E3%83%AB%E3%82%AC%E3%82%A4.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1500
  },
  {
    id: "sea_013",
    name: "牡蛎",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e8/2qlxfyd8g8uus5be49tls1s11pdfib0.png/80px-%E3%82%AA%E3%82%A4%E3%82%B9%E3%82%BF%E3%83%BC.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [1,2,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1100
  },
  {
    id: "sea_014",
    name: "虾夷扇贝",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/ed/en2iqtjtdd87zdpfblqsivqlqyob5w4.png/80px-%E3%83%9B%E3%82%BF%E3%83%86.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1200
  },
  {
    id: "sea_015",
    name: "花螺",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/c5/e5npxf6e29hj5v9wsz6zt61jicvna09.png/80px-%E3%83%90%E3%82%A4%E3%82%AC%E3%82%A4.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1000
  },
  {
    id: "sea_016",
    name: "角蝾螺",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/2f/ianc6zkjrbb69q3sr39rnqy6dn2yzmz.png/80px-%E3%82%B5%E3%82%B6%E3%82%A8.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [3,4,5,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1000
  },
  {
    id: "sea_017",
    name: "鲍鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/8/84/4txg1o4bbz5ewul2nqlt5cr4qg5fb23.png/80px-%E3%82%A2%E3%83%AF%E3%83%93.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [1,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 2000
  },
  {
    id: "sea_018",
    name: "大砗磲",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/f/f0/mvueqqti10n6z5qf9ep7s7k8lmxvbac.png/80px-%E3%82%AA%E3%82%AA%E3%82%B7%E3%83%A3%E3%82%B3%E3%82%AC%E3%82%A4.png",
    location: "海洋底部",
    shadowSize: "大",
    northMonths: [5,6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 15000
  },
  {
    id: "sea_019",
    name: "鹦鹉螺",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/2f/qk7vtroreh26bz6cgxccg1qujj6qmsb.png/80px-%E3%82%AA%E3%82%A6%E3%83%A0%E3%82%AC%E3%82%A4.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [3,4,5,6,9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 1800
  },
  {
    id: "sea_020",
    name: "章鱼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/f/f8/44pl012sipnfgv04as0s7vjct9ftzg1.png/80px-%E3%82%BF%E3%82%B3.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1200
  },
  {
    id: "sea_021",
    name: "扁面蛸",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/06/2ozinqpa1ytp24z6mbjl3fex2r7sctu.png/80px-%E3%83%A1%E3%83%B3%E3%83%80%E3%82%B3.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [3,4,5,9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 6000
  },
  {
    id: "sea_022",
    name: "吸血鬼乌贼",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/4/40/d3qp7asavn69v2nojlpyhg5zorf94wc.png/80px-%E3%82%B3%E3%82%A6%E3%83%A2%E3%83%AA%E3%83%80%E3%82%B3.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [5,6,7,8],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 10000
  },
  {
    id: "sea_023",
    name: "萤火鱿",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/74/co710iutgbhmpqccssm1sms14rr8jd3.png/80px-%E3%83%9B%E3%82%BF%E3%83%AB%E3%82%A4%E3%82%AB.png",
    location: "海洋底部",
    shadowSize: "特小",
    northMonths: [3,4,5,6],
    hours: [0,1,2,3,4,21,22,23],
    price: 1400
  },
  {
    id: "sea_024",
    name: "梭子蟹",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/a/a8/mo2h1tqi1bmlmzxx8jrpy8y80r1hx8q.png/80px-%E3%82%AC%E3%82%B6%E3%83%9F.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [6,7,8,9,10,11],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 2200
  },
  {
    id: "sea_025",
    name: "珍宝蟹",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/7/71/siccbxn1ekaqtspc5v8xjye4r896axr.png/80px-%E3%83%80%E3%83%B3%E3%82%B8%E3%83%8D%E3%82%B9%E3%82%AF%E3%83%A9%E3%83%96.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [1,2,3,4,5,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1900
  },
  {
    id: "sea_026",
    name: "松叶蟹",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/c8/m10b9hki4byqxo1gc746e9vaum4uxfn.png/80px-%E3%82%BA%E3%83%AF%E3%82%A4%E3%82%AC%E3%83%8B.png",
    location: "海洋底部",
    shadowSize: "稍大",
    northMonths: [1,2,3,4,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 6000
  },
  {
    id: "sea_027",
    name: "帝王蟹",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/e3/o22ed5d1m1p3t99ftcs3tmiy3nd5yir.png/80px-%E3%82%BF%E3%83%A9%E3%83%90%E3%82%AC%E3%83%8B.png",
    location: "海洋底部",
    shadowSize: "稍大",
    northMonths: [1,2,3,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 8000
  },
  {
    id: "sea_028",
    name: "藤壶",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/c0/sd2uynktzn3y6uc2fs9ulc0cmwefydl.png/80px-%E3%83%95%E3%82%B8%E3%83%84%E3%83%9C.png",
    location: "海洋底部",
    shadowSize: "特小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 600
  },
  {
    id: "sea_029",
    name: "高脚蟹",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/2/25/gfc6nmuip6nlxafgwppybljupk9rkcp.png/80px-%E3%82%BF%E3%82%AB%E3%82%A2%E3%82%B7%E3%82%AC%E3%83%8B.png",
    location: "海洋底部",
    shadowSize: "大",
    northMonths: [3,4],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 12000
  },
  {
    id: "sea_030",
    name: "日本对虾",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/b/b1/00lksnnop6o0627hh3d5nulbq5ia3tx.png/80px-%E3%82%AF%E3%83%AB%E3%83%9E%E3%82%A8%E3%83%93.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [6,7,8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 3000
  },
  {
    id: "sea_031",
    name: "甜虾",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/3/3c/3crexe0yenawnuwhx5efb8fa55hn257.png/80px-%E3%82%A2%E3%83%9E%E3%82%A8%E3%83%93.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [1,2,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 1400
  },
  {
    id: "sea_032",
    name: "虾蛄",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/8/8e/dg3b72zsmrf2tq8720ipu1r7fcth4mm.png/80px-%E3%82%B7%E3%83%A3%E3%82%B3.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [1,2,3,4,5,6,7,8,9,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 2500
  },
  {
    id: "sea_033",
    name: "伊势龙虾",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/c/c9/ra4dvqadt6z940v5kupm8fs2bzz23m1.png/80px-%E3%82%A4%E3%82%BB%E3%82%A8%E3%83%93.png",
    location: "海洋底部",
    shadowSize: "稍大",
    northMonths: [10,11,12],
    hours: [0,1,2,3,4,21,22,23],
    price: 5000
  },
  {
    id: "sea_034",
    name: "龙虾",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/df/qgzir3gz3e61wps5po7h0a5r8xou513.png/80px-%E3%83%AD%E3%83%96%E3%82%B9%E3%82%BF%E3%83%BC.png",
    location: "海洋底部",
    shadowSize: "稍大",
    northMonths: [1,4,5,6,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 4500
  },
  {
    id: "sea_035",
    name: "大王具足虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/0/09/bvf7sfrluhd89wxtgp2lhjnku5c13n8.png/80px-%E3%83%80%E3%82%A4%E3%82%AA%E3%82%A6%E3%82%B0%E3%82%BD%E3%82%AF%E3%83%A0%E3%82%B7.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [7,8,9,10],
    hours: [0,1,2,3,4,9,10,11,12,13,14,15,16,21,22,23],
    price: 12000
  },
  {
    id: "sea_036",
    name: "鲎",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/e/ea/6ku052q2a5nb7dz84p3ix7l9k2cjz80.png/80px-%E3%82%AB%E3%83%96%E3%83%88%E3%82%AC%E3%83%8B.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [7,8,9],
    hours: [0,1,2,3,4,21,22,23],
    price: 2500
  },
  {
    id: "sea_037",
    name: "海鞘",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/6/69/dr1t4cyp3f766xgtx0cbpul7vf39jio.png/80px-%E3%83%9B%E3%83%A4.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [4,5,6,7,8],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 1500
  },
  {
    id: "sea_038",
    name: "花园鳗",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/d/d6/j446n0i8nj5dthz8b7qi3u5dgsf8ruk.png/80px-%E3%83%81%E3%83%B3%E3%82%A2%E3%83%8A%E3%82%B4.png",
    location: "海洋底部",
    shadowSize: "稍小",
    northMonths: [5,6,7,8,9,10],
    hours: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
    price: 1100
  },
  {
    id: "sea_039",
    name: "海扁虫",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/3/3a/2sehvkvft9salrj0srn7o56ezf01rc5.png/80px-%E3%83%92%E3%83%A9%E3%83%A0%E3%82%B7.png",
    location: "海洋底部",
    shadowSize: "特小",
    northMonths: [8,9],
    hours: [0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23],
    price: 700
  },
  {
    id: "sea_040",
    name: "偕老同穴",
    image: "https://patchwiki.biligame.com/images/dongsen/thumb/5/50/jcdvt5khosemkjb0slfvpag3csk8f99.png/80px-%E3%82%AB%E3%82%A4%E3%83%AD%E3%82%A6%E3%83%89%E3%82%A6%E3%82%B1%E3%83%84.png",
    location: "海洋底部",
    shadowSize: "中",
    northMonths: [1,2,10,11,12],
    hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    price: 5000
  }
];

function withDerivedHemisphere(items) {
  return items.map(item => Object.freeze({
    ...item,
    southMonths: Object.freeze(shiftMonths(item.northMonths))
  }));
}

export const DATA_MAP = Object.freeze({
  fish: Object.freeze(withDerivedHemisphere(FISH_DATA)),
  bug: Object.freeze(withDerivedHemisphere(BUG_DATA)),
  sea: Object.freeze(withDerivedHemisphere(SEA_DATA)),
  art: ART_DATA
});
