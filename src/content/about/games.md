---
# GAMES —— 常回头的那几款。
# 这里不写评分，只写「它为什么影响了我」。
# 每条一个 - ，顺序 = 渲染顺序，行优先（先左右、再换行）。
# 现在排成：阴阳师 | 洛克王国：世界  ← 第一排
#           明日方舟 | 未定事件簿     ← 第二排
#
# 封面图：放进 public/images/games/ ，cover 里写 /images/games/文件名
#          （不用管 /test 前缀，渲染时自动补）
games:
  - title: 阴阳师
    # 什么时候玩的 / 玩了多久
    meta: "2020.01.27"
    # 可选：这张卡整体放大的倍数（1 = 不放大）。宽度高度一起乘。
    scale: 1.5
    # 为什么喜欢它——一句话就够，不要写成评测。
    # 没想好就先空着（整段注释掉），卡片会自动少这一块，不要留占位文字。
    # why: >
    #   一句话。
    # 可选：Steam / 官网链接
    link: ""
    # 封面图，留空则只显示文字
    cover: "/images/games/onmyoji.webp"
    # 游戏个人名片 / 练度：k 是标签，v 是值，想写几条写几条。
    # 空数组（card: []）或直接不写这个字段 → 卡片里不显示这一块。
    # card:
    #   - { k: "账号等级", v: "60" }

  - title: 洛克王国：世界
    meta: "2026.3.27"
    scale: 1.5
    why: >
      精灵学最佳受益者，至尊，下蛋专家，接生大王。
    link: ""
    cover: "/images/games/rocklandworld.webp"
    card: []

  - title: 明日方舟
    meta: "2025.6.10"
    scale: 1.5
    why: >
      不肝只抽之人
    link: ""
    cover: "/images/games/nights.webp"
    card: []

  - title: 未定事件簿
    meta: "2025.2"
    scale: 1.5
    why: >
      🦁左然推꒰ঌ(˶ˆᗜˆ˵)໒꒱⚖
    link: ""
    cover: "/images/games/wdsjb.webp"
    card: []

# 区块导语
lead: >
  长期主义者，决定了做什么事就不会轻易放弃。觉得21世纪没有纯爱的可以看看我和阴阳师。
---

# 填写说明

`why` 是这一块的灵魂——重点不是「我玩过什么」，
而是**这些游戏为什么影响了我**。

建议 3～5 款，挑真正会回头玩的，不要凑数。
`meta` 可以写年份、也可以写时长（"玩了 400 小时"），随意。

## 封面图放哪

```
public/images/games/
```

项目里的绝对路径：`D:\cxdownload\yemian\public\images\games\`

放进去之后，在对应条目的 `cover` 里写：

```yaml
cover: "/images/games/你的文件名.webp"
```

**`/test` 前缀不用写**，渲染时会自动补。文件名建议 kebab-case（小写 + 连字符），
不要有中文和空格。

建议尺寸：宽 800～820px、`.webp`、单张控制在 150KB 以内。
图片会进 git 仓库（现在 39MB，大头是那个 36MB 视频），所以别塞原图。

**只留 webp**——原图（jpg/png）转成 webp 之后就删掉，两套格式不并存。
转换用项目自带的 sharp：

```bash
node -e "require('sharp')('public/images/games/xxx.jpg').resize({width:820,withoutEnlargement:true}).webp({quality:76}).toFile('public/images/games/xxx.webp')"
```

**默认不会被裁剪**——横图、竖图、方图、立绘、游戏内名片都按原比例完整显示
（上限高 360px）。所以比例随意，不用自己先裁好。

只有当你希望这张图**铺满**卡片顶部的 16:10 区域（例如纯横向截图）时，
才在该条目里加一行：

```yaml
cover_fit: cover
```

## 个人名片 / 练度（card）

卡片里「为什么影响我」上方那一小块，放你的账号信息：

```yaml
card:
  - { k: "账号等级", v: "60" }
  - { k: "主力式神", v: "待填" }
```

`k` 是左侧标签，`v` 是右侧值，条数随意。
不想显示就写 `card: []`，或者把这个字段整个删掉。

## TODO（需要本人确认）

- [ ] 阴阳师的 `why` 还空着（占位文字已删），等本人写一句真实理由
- [ ] 洛克王国 / 未定事件簿 / 明日方舟 现在填的是**游戏内个人名片**
      （「不肝只抽之人」同理），如果以后想写「它为什么影响我」，
      把名片挪进 `card`、正文换成理由
- [ ] `lead` 已于 2026-09-25 换成本人原话（长期主义者…阴阳师），不再是英文
