---
# ============================================================================
# FRIENDS —— 我认识 / 喜欢的其他小站
# 放在 About 页 BRAIN DUMP 之后、Colophon 之前。
# 超过 20～30 个再考虑单独开 /friends，现在不做成博客门户。
#
# 字段：
#   name        站名 / 人名（必填）
#   url         链接（必填）
#   description 一句话简介，中英都行
#   avatar      头像，放 public/images/friends/ 后写 /images/friends/xxx.webp
#               留空或不写 → 显示一个圆点
# ============================================================================
lead: "People who make things on the internet."

friends: []

# ============================================================================
# 申请友链（第一版不做自动申请系统，手动维护就很好）
# apply_url 留空则默认跳邮箱
# ============================================================================
apply_text: "想交换友链？如果你也有一个小小的网站，欢迎来找我。"
apply_label: "Add your site →"
apply_url: ""
---

# 填写说明

加友链只要往 `friends:` 下面加一条，**不用改任何代码**：

```yaml
- name: "站名"
  url: "https://example.com"
  description: "一句话"
  avatar: "/images/friends/xxx.webp"
```

## 头像放哪

```
public/images/friends/
```

建议 80×80 左右的正方形、`.webp`、单张 20KB 以内。
不放头像就把 `avatar` 留空，会显示一个圆点，也挺好。

## TODO（需要本人确认）

- [ ] 占位友链已删（2026-09-25），现在是 `friends: []`——列表为空时只显示标题和申请入口。
      拿到真实友链后往 `friends:` 下面加一条就会出现
- [ ] `apply_url` 要不要换成 GitHub Issue / Guestbook，还是就用邮箱
