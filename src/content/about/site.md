---
# THIS WEBSITE —— 这个小地方的故事
story: >
  因为服务器到期不想再续所以迁移到了这里，在审视自己过去记的笔记的时候发现过去记的东西基本上已经会了，都是很基础的东西，就没有搬过来。未来应该会持续更新吧，毕竟把各种各样的想法分散在各个平台还是有一点难绷的。

  其实是今天学校不断电没事做，一边学网络同步一边后台蹬了一晚上AI✧(≖ ◡ ≖✿)

# BUILT WITH
stack:
  - { name: "Astro", note: "静态站点生成" }
  - { name: "Markdown / MDX", note: "内容源文件" }
  - { name: "Decap CMS", note: "/admin/ 后台，Turbo 托管认证" }
  - { name: "GitHub Pages", note: "构建与托管（GitHub Actions）" }

# SITE TIMELINE
# confirmed: true  = 已核实，当事实渲染
# confirmed: false = 未经核实，弱化显示 + 带「待确认」标记，不当史实
timeline:
  - year: "2026-09"
    confirmed: true
    events:
      - "重构为 Astro + Decap CMS"

# 进度条文案（故意写不满）
progress_label: "Status"
progress_percent: 90
progress_note: "(It's never going to be finished.)"
---

# 填写说明

时间线是**这个网站的成长记录**，不是你的简历。
以后每做一次大改就往 `timeline` 里加一条。

`progress_percent` 建议永远不要写 100——
个人网站的乐趣就在于它永远不会做完。

## TODO（需要本人确认）

- [ ] 时间线已精简：只留 2026-09「重构为 Astro + Decap CMS」一条（2026-02/04/05 那批
      未经核实，已删）。以后每做一次大改往 `timeline` 里加一条，`confirmed: true` 再当事实显示
- [ ] 是否要把「删掉的 C++ 笔记」也记进时间线（它确实存在过）
