---
# ============================================================================
# 弹幕 / 脑内声音
#
# 页面每次打开会从中随机挑 8～15 条飘过，所以这里的条目越多越好——
# 攒到 30 条以上时，每次进页面的感觉就会明显不一样。
#
# 字段：
#   text      弹幕文字（必填）
#   category  类型：idea / game / tech / night / weird / egg
#   weight    视觉权重：normal(常规) | small(小号低语) | highlight(突出) | egg(彩蛋)
#   speed     飘过时长（秒），越大越慢，建议 14～26
#   year      想法产生的年份，仅作记录，页面上可选择性显示
# ============================================================================
thoughts:
  - { text: "如果把 ECS 用来做博客，会怎么样？", category: idea, weight: normal, speed: 18, year: 2026 }
  - { text: "为什么游戏里的门都可以打开？", category: game, weight: normal, speed: 20, year: 2026 }
  - { text: "如果 GPU 真的能思考呢", category: tech, weight: highlight, speed: 22, year: 2026 }
  - { text: "今天突然想做一个……", category: idea, weight: small, speed: 16, year: 2026 }
  - { text: "这个算法能不能拿来做游戏？", category: tech, weight: normal, speed: 19, year: 2026 }
  - { text: "为什么游戏里的 UI 总是那么好看？", category: game, weight: normal, speed: 21, year: 2026 }
  - { text: "如果梦也可以被保存呢……", category: night, weight: highlight, speed: 26, year: 2026 }
  - { text: "猫如果会写代码会用什么 IDE？", category: weird, weight: normal, speed: 18, year: 2026 }
  - { text: "如果博客文章可以像游戏存档一样保存？", category: idea, weight: normal, speed: 20, year: 2026 }
  - { text: "为什么没有一种 IDE 可以把代码直接变成 3D 世界？", category: idea, weight: normal, speed: 22, year: 2026 }
  - { text: "我是不是应该做一个自己的字体？", category: idea, weight: small, speed: 17, year: 2026 }
  - { text: "如果网站背景会随着文章内容改变呢？", category: idea, weight: normal, speed: 21, year: 2026 }
  - { text: "如果把光照系统用来模拟梦境……", category: tech, weight: highlight, speed: 25, year: 2026 }
  - { text: "一本正经地研究了一个完全没用的问题", category: weird, weight: small, speed: 15, year: 2026 }
  - { text: "存档读档，是不是也算一种时间旅行", category: night, weight: normal, speed: 24, year: 2026 }

  # —— 彩蛋：出现频率极低 ——
  - { text: "[ Aisssky.exe has stopped responding ]", category: egg, weight: egg, speed: 14, year: 2026 }
  - { text: "Achievement unlocked：想到一个没什么用的点子", category: egg, weight: egg, speed: 20, year: 2026 }
  - { text: "✦ You found a thought that was never supposed to escape.", category: egg, weight: egg, speed: 28, year: 2026 }

# ============================================================================
# THINGS I'M CURIOUS ABOUT —— 长期好奇、还没想明白的问题
# 这是「安静区域」，不飘，老老实实列在那儿。
# ============================================================================
curious:
  - "Why do game worlds feel real?"
  - "Can a computer-generated world ever feel nostalgic?"
  - "What would an operating system designed for games look like?"
  - "Can graphics explain mathematics?"
  - "Why do I keep redesigning this website?"

# ============================================================================
# 彩蛋系统：点击某些特殊弹幕后弹出的小窗
# id 对应 thoughts 里 weight: egg 的条目（按顺序匹配）
# ============================================================================
secrets:
  - id: SECRET #01
    title: "我曾经想过做一个……"
    body: >
      但是后来发现太麻烦了。
      （待填：这里写那个没做完的东西）

  - id: SECRET #02
    title: "Achievement Unlocked"
    body: >
      「第一次认真看完 About」
      谢谢你真的滚到了这里。

# ============================================================================
# BRAIN DUMP —— 思想垃圾桶
# ============================================================================
brain_dump_lead: >
  一些不值得写成文章、但扔掉又可惜的想法。
  以后写文章时顺手记下的碎片也可以放进来。
brain_dump:
  - "如果博客文章可以像游戏存档一样保存？"
  - "为什么没有一种 IDE 可以把代码直接变成 3D 世界？"
  - "我是不是应该做一个自己的字体？"
  - "如果网站背景会随着文章内容改变呢？"
guestbook_hint: "Have a weird thought?"
---

# 使用说明

## 怎么加弹幕

在 `thoughts:` 下面照格式加一行就行，不用改任何代码：

```yaml
- { text: "你的新想法", category: idea, weight: normal, speed: 20, year: 2026 }
```

**category 决定图标**：
`idea` 💭 · `game` 🎮 · `tech` 💻 · `night` 🌙 · `weird` 🌀 · `egg` ✦

**weight 决定大小**：
`normal` 常规 · `small` 小号低语 · `highlight` 突出加亮 · `egg` 彩蛋样式

## 关于 weird 那一类

「猫如果会写代码会用什么 IDE」这种——**请务必保留**。
完全没用但很有意思的想法才是一个人的味道。

## 弹幕是空气，不是正文

页面上会有一个明确的「安静区域」：弹幕只在首屏那一屏飘，
往下滚进正式内容后就会淡出。不会变成 B 站首页。

## TODO（需要本人确认）

- [ ] 弹幕种子里混了我写的和你写的——**不想要的直接删**，想加的直接加
- [ ] 是否要做「按时间变色」：早上偏技术/学习，深夜偏脑洞
- [ ] 两个彩蛋的内容
- [ ] `curious` 最后一句要不要保留自嘲那句
