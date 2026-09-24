---
title: "《赛博朋克：飘渺城影》开发日志"
description: "对话系统 / 玩家交互 / 文本收集 / 教程系统的重构记录"
pubDate: 2026-04-21
updatedDate: 2026-05-10
subtitle: "开发日志 · 2026-04-21 ~ 2026-05-10"
category: "项目日志"
tags:
  - UE5
  - 对话系统
  - UMG
  - 项目复盘
cover: /images/promo.webp
copyright: "© 2026 集体梦境 项目组 | 仅供学习交流与开发展示"
draft: false
toc: true
---

<span id="section1"></span>

## 📖 简介

### 🛠️ 技术栈

<div class="tech-stack-container"><div class="tech-stack-block">UE5 C++</div><div class="tech-stack-block">BluePrints</div><div class="tech-stack-block">UMG</div><div class="tech-stack-block">SVN</div></div>

### 🔗 项目链接

[https://store.steampowered.com/app/3552700/\_/](https://store.steampowered.com/app/3552700/_/) 现已开放愿望单

### ✨ 技术亮点与职责

- 基于[Dialogue Builder插件](https://www.fab.com/listings/052820ab-f423-48e8-978a-eefd4087b1a4?lang=zh-cn)进行二次开发，协同文案策划构建支持富文本打字机、动态分支选项、技能检定提示与音效联动的完整对话UI框架。
- C++ 底层逻辑：扩展 DialogueBubbleWidget、OptionButtonWidget、MainDialogueWidget 等核心类，实现逐字打印、富文本标签无截断渲染、统一打字速度及标点停顿倍率，大幅提升剧情演出节奏感。
- 分支选项系统：设计并实现单/多选项弹出、选项后自动衔接NPC侧对话的完整分支逻辑；通过合理数据结构约定，简化蓝图流程，消除分支判定的冗余数组操作，显著降低维护成本。
- 辅助功能：集成节点驱动的打字音效自动播放/停止，沉浸式赛博叙事体验。

<span id="video-section"></span>

## 🎮 实现思路及演示

因为策划找到我时，这个项目已经是完成度很高的作品，所以我的任务就是在原来的庞然巨物上做功能调优和新增功能（作为一个纯蓝图项目，代码可读性极差，调断点的时候一直在四个文件里面反复跳）

<div class="image-row">
  <div class="image-item">
    <img src="/images/req.jpg" alt="策划需求图 - 对话分支与检定规则" />
    <div class="img-caption">📑 策划需求</div>
  </div>
  <div class="image-item">
    <img src="/images/omg.jpg" alt="直面蓝图古神来了" />
    <div class="img-caption">直面蓝图古神来了</div>
  </div>
  <div class="image-item">
    <img src="/images/ver.jpg" alt="改了三版" />
    <div class="img-caption">改了三版</div>
  </div>
</div>

### 对话系统

在重构前，原对话系统采用「显示一条清一条」的机制，玩家无法回顾历史对话以及已选分支选项，严重削弱赛博朋克题材的剧情沉浸感。因此本次重构核心目标：**打造可追溯、动态检定、富有节奏的叙事UI框架**，并对接 Dialogue Builder 插件实现节点化驱动。

✨ 重构策略：

- **历史记录组件**：采用环形队列存储气泡实例，支持滚动回溯，玩家可在对话间隙翻看之前文本。
- **统一打字机控制器**：支持富文本标签延迟解析，标点符号自动停歇，音效逐字匹配。
- **选项-检定联动**：选项按钮根据数据驱动显示技能类型及风险等级，UI面板动态刷新掷骰反馈。
- **模块化事件广播**：解耦 C++ 与蓝图，选项选择、对话结束、检定进入等事件均通过动态多播驱动，策划可灵活配置。

<span id="diagram-section"></span>

#### 系统逻辑图

```mermaid
graph LR
    subgraph 对话启动
        A["外部控制器"] -->|InitDialogue| B["UTestMainDialogueWidget"]
    end

    subgraph 显示NPC对话
        B -->|AddBubble| C{"UDialogueBubbleWidget"}
        C -->|SetUpBubble| D["设置头像/名称/文本"]
        D --> E{"WriteEffect?"}
        E -->|是| F["StartTyping 打字机"]
        F --> G["逐字输出/跳过标签"]
        G --> H["标点暂停计算"]
        H --> I["OnTypingCompleted"]
        E -->|否| I
        I -->|广播| B
        C -->|OnSetPlayerNode| B
    end

    subgraph 用户点击推进
        B -->|NativeOnMouseButtonDown| J{"当前气泡打字完成?"}
        J -->|未完成| K["SkipTyping 立即显示全文"]
        J -->|已完成| L["广播 OnUserPressNext"]
        L --> A
    end

    subgraph 显示玩家选项
        A -->|ShowOptions| B
        B --> M["循环创建 UOptionButtonWidget"]
        M --> N["SetupOption 设置文本/图标"]
        N --> O{"是否有检定?"}
        O -->|是| P["向InfoPanel传递RollType/RiskLevel"]
        O -->|否| Q["仅显示文本"]
        P --> Q
        Q --> R["绑定 OnOptionChosen"]
        R --> S["设置 bWaitingForChoice=true"]
    end

    subgraph 玩家选择处理
        S --> T["玩家点击选项"]
        T -->|OnOptionChosen| B
        B --> U["构建玩家气泡 IsPlayerNode=true"]
        U --> C
        B --> V["清空选项列表 bWaitingForChoice=false"]
        V -->|广播 OnOptionSelected| A
    end

    subgraph 检定流程
        A -->|EnterPreCheckState| B
        B --> W["bWaitingForChoice=true 广播OnEnterPreCheck"]
        A -->|ShowCheckResult| X["广播 OnCheckResultReceived"]
    end

    subgraph 对话结束
        A -->|EndDialogue| B
        B --> Y["NotifyDialogueEnd"]
        Y --> Z["清空所有气泡/选项"]
        Z -->|广播 OnDialogueEnd| A
    end

    style A fill:#e0f0ff,stroke:#1e466e,stroke-width:1.5px
    style B fill:#fff4e0,stroke:#b57c1c,stroke-width:1.5px
    style C fill:#f0e0ff,stroke:#6b3fa0,stroke-width:1.5px
    style F fill:#ffe0e0,stroke:#c22,stroke-width:1px
    style M fill:#d9f0f0,stroke:#2c6e6e
```

对话系统实机演示

<figure class="video-card">
  <video controls muted loop preload="auto">
    <source src="/video/dialogue-demo.mp4" type="video/mp4" />
    您的浏览器不支持视频播放，请升级浏览器或查看项目文档。
  </video>
  <figcaption class="video-desc">🎞️ 对话系统演示视频 | 动态选项 + 逐字演出 + 技能检定</figcaption>
</figure>

### 玩家交互

这个最简单了，

### 文本收集系统

同理剧情对话系统，玩家收集到的线索没有回顾功能

### 教程系统

这还是我第一次接触UE MediaSource 相关的内容，还好文档够多
