# 小动物数据核对记录

核对日期：2026-10-01。范围为《集合啦！动物森友会》中可入住的居民，共 417 位；特殊 NPC 不列入目录。所有角色使用游戏角色代码形成稳定 ID（例如 `villager_cat23`）。小动物目录仅供浏览、筛选，不提供标记或收集统计，全部居民显示英文名。

## 来源

- 主要列表、中文名、立绘及详情链接：[BWIKI 小动物图鉴](https://wiki.biligame.com/dongsen/小动物图鉴)，修订 56837。
- 种族、性别、性格及 A/B 型、生日、爱好：[社区 ACNH 原始数据表](https://docs.google.com/spreadsheets/d/13d_LAJPlxMa_DubPTuirkIV4DERBMXbrWQsmSh8ReK4/edit)，Villagers 页。
- 简体中文名称及初始口头禅：[ACNH Translations](https://docs.google.com/spreadsheets/d/1MMbsvDfu59OY9YBEAfHhFJ6O8vRTllNFgMrX7RBZuyI/edit)，Villagers 和 Villager Catchphrases 页的 CNzh 列。
- 辅助数据镜像：[Norviah/animal-crossing](https://github.com/Norviah/animal-crossing/blob/master/json/combined/Villagers.json)。镜像仅有 413 位居民，已与原始表核对其全部居民的名称、种族、性别、性格、A/B 型、生日、爱好及简体口头禅，字段一致；完整目录采用原始表。
- 补充角色与图片：[Nookipedia 居民目录](https://nookipedia.com/wiki/Villager/New_Horizons)。[任天堂更新页面](https://animalcrossing.nintendo.com/new-horizons/update-3-0/)确认塞尔达传说与斯普拉遁的 4 位联动居民。

## 核对结果

BWIKI 有 418 行：413 位不同的可入住居民、2 行重复居民（雀儿喜、咚比）、1 行空白 String、2 位特殊 NPC（西施惠、K.K.）。去除重复、空白与特殊 NPC；413 位居民的种族、性别、性格及 A/B 型、生日、爱好均与原始表一致。

BWIKI 缺少下列 4 位居民，依据原始数据表、中文翻译表和 Nookipedia 补充；立绘与详情链接使用对应 Nookipedia 页面。

| 中文名 | 英文名 | 角色代码 | 来源 |
| --- | --- | --- | --- |
| 丘栗 | Tulin | brd20 | [Nookipedia](https://nookipedia.com/wiki/Tulin) |
| 米涅鲁 | Mineru | der12 | [Nookipedia](https://nookipedia.com/wiki/Mineru) |
| 霓莎 | Cece | squ19 | [Nookipedia](https://nookipedia.com/wiki/Cece) |
| 弥莎 | Viché | squ20 | [Nookipedia](https://nookipedia.com/wiki/Vich%C3%A9) |

以下 10 处口头禅差异按原始翻译表 CNzh 列统一，保持简体中文原始文本，去除附加解释、标点和其他语言词语。

| 居民 | BWIKI 列表 | 采用的简体中文口头禅 |
| --- | --- | --- |
| 熊战士 | over | Over |
| 丹丹 | 哇哦 | 哇喔 |
| 阿邦 | 切/关节 | 切 |
| 莉拉 | 哈啰 | 哈罗 |
| 莫儿 | 晶亮kira | 晶亮 |
| 敖志明 | 哇。 | 哇 |
| 罗萱儿 | 可爱 | 开心 |
| 达满 | “禅” | 禅 |
| 布兰妮 | 讨厌啦~ | 讨厌啦 |
| 嘟嘟 | 哇塞 | 哇赛 |

保留三丽鸥、塞尔达传说和斯普拉遁联动分类；名称、数据 schema 和界面均不保存或展示版本标签。

`tests/fixtures/villagers.json` 保存原始表的独立字段快照，数据测试逐项比对全部 417 位居民，避免只校验数量却遗漏生日或性格错误。图片权利归原权利人所有，项目仅链接公开图片。
