---
# GAMES —— 常回头的那几款。
# 这里不写评分，只写「它为什么影响了我」。
# 每条一个 - ，顺序无所谓，渲染时按数组顺序排。
#
# 封面图：放进 public/images/games/ ，cover 里写 /images/games/文件名
#          （不用管 /test 前缀，渲染时自动补）
games:
  - title: 阴阳师
    # 什么时候玩的 / 玩了多久
    meta: "2020.01.27"
    # 为什么喜欢它——一句话就够，不要写成评测
    why: >
      （待填）为什么它会留在我这里——一句话就够。
    # 可选：Steam / 官网链接
    link: ""
    # 封面图，留空则只显示文字
    cover: "/images/games/onmyoji.webp"
    # 游戏个人名片 / 练度：k 是标签，v 是值，想写几条写几条。
    # 空数组（card: []）或直接不写这个字段 → 卡片里不显示这一块。
    card:
      - { k: "账号等级", v: "待填" }
      - { k: "主力式神", v: "待填" }

  - title: TODO · 第二款游戏
    meta: "第一次玩：____ 年"
    why: >
      （待填）例如：让我开始好奇画面是怎么画出来的，于是去学了图形学。
    link: ""
    cover: "/images/games/TODO-2.webp"
    card: []

  - title: TODO · 第三款游戏
    meta: "第一次玩：____ 年"
    why: >
      （待填）例如：通关那晚我关掉电脑坐在那里想了很久。
    link: ""
    cover: "/images/games/TODO-3.webp"
    card: []

# 区块导语
lead: >
  Games are probably one of the reasons I became interested in computers.
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

建议尺寸：宽 800px 左右、`.webp`、单张控制在 150KB 以内。
图片会进 git 仓库（现在 39MB，大头是那个 36MB 视频），所以别塞原图。

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

- [ ] 三款游戏的名字、年份、理由
- [ ] 封面图存进 `public/images/games/` 后，把 `cover` 里的 TODO 文件名改掉
- [ ] `lead` 那句英文是否保留
