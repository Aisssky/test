/**
 * 我的游戏库 · 统一数据清单
 * --------------------------------------------------------------
 * 所有游戏信息集中在这里维护，卡片组件不硬编码任何游戏数据。
 *
 * 字段：
 *   id          稳定内部标识（用于锚点 /games/#<id>，也用作封面文件名）
 *   title       真实游戏名称（必填，与草稿箱封面文件夹名一致）
 *   url         Evomeme 游戏页链接（必填；空字符串 = 链接待补，不渲染坏链）
 *   cover       站内封面路径（base 前缀由页面 withBase 拼接）
 *   description 一句话玩法介绍（可选，留空则不显示）
 *   order       展示顺序（必填，越小越靠前）
 *
 * 维护：
 *   - 新增游戏：在数组里加一项即可，无需改组件。
 *   - 删除游戏：删这一项即可。
 *   - 调顺序：改 order。
 *
 * 链接配对进度：
 *   2026-10-17：原草稿箱封面经用户确认，删除垒鱼（只留太空垒）、跑团、大大蛋将军，
 *   最终 11 款全部由用户按 EvoMeme 后台游戏名逐条指定并填入 url。
 *   2026-11-04：用户新增 7 款（SwapPlay / 不真实的ta / 我的快餐店不可能破产！？ /
 *   消消糖果屋 / 熊孩子模拟器 / 能工智人 / 饥饿派制陶人），合计 18 款；这 7 款 url 待补。
 *   配对红线：每个链接必须由用户明确「游戏名 → 链接」指定，绝不靠 URL 顺序猜测
 *   （曾因猜测导致全部配对错误，已记教训）。
 *   2026-11-05：用户补齐 SwapPlay / 不真实的ta / 饥饿派制陶人 / 消消糖果屋 /
 *   我的快餐店不可能破产！？ / 能工智人 6 条；地球OJ / 喵喵大王 / 倒水瓶大作战 /
 *   小恐龙多比 / 四时之岛 5 条与既有配对一致（确认）。
 *   同日用户要求删除「熊孩子模拟器」（不再提供链接），现共 17 款，全部已填 url。
 */

export interface Game {
  id: string;
  title: string;
  url: string;
  cover: string;
  description?: string;
  order: number;
}

export const games: Game[] = [
  { id: 'phone-ads', title: '我的手机不可能这么多广告', url: 'https://www.evomeme.com/games/pwb01a1111eec3c7dfe868514b57373bde2', cover: '/images/arcade/phone-ads.webp', description: '你的手机被广告淹没，疯狂点击也清不干净。', order: 1 },
  { id: 'trash-sort', title: '垃圾分类大师', url: 'https://www.evomeme.com/games/pwb01a0f61c7e7b7a5daebe4aa5a11b8e20', cover: '/images/arcade/trash-sort.webp', description: '把垃圾正确分类投放，分错可是要被罚款的。', order: 2 },
  { id: 'space-stack', title: '太空垒', url: 'https://www.evomeme.com/games/pwb01a11544bf4772f48deb281900c58901', cover: '/images/arcade/space-stack.webp', description: '在失重星球上堆叠落块，搭出最稳的太空高塔。', order: 3 },
  { id: 'bean-sort', title: '拼豆分拣法则', url: 'https://www.evomeme.com/games/pwb01a11f426e267634b33f53c3fe986e40', cover: '/images/arcade/bean-sort.webp', description: '抖动网格里把彩色豆子分拣归位，手别抖。', order: 4 },
  { id: 'alien-invasion', title: '外星人入侵了我的手机', url: 'https://www.evomeme.com/games/pwb01a12a21c3d173b5b50294070be1e4a8', cover: '/images/arcade/alien-invasion.webp', description: '像素小外星人举着你的手机，快来把它赶走。', order: 5 },
  { id: 'destiny-dice', title: '埃及命运之骰', url: 'https://www.evomeme.com/games/pwb01a1294eb081749d963bffbdecf0af92', cover: '/images/arcade/destiny-dice.webp', description: '1v3 骰子对决叠加 roguelike buff，赌上你的命运。', order: 6 },
  { id: 'earth-oj', title: '地球OJ', url: 'https://www.evomeme.com/games/pwb01a1459f554b7acaaa13665d5df489e9', cover: '/images/arcade/earth-oj.webp', description: '在线判题小游戏，写代码解开一道道谜题。', order: 8 },
  { id: 'grow-island', title: '四时之岛', url: 'https://www.evomeme.com/games/pwb01a14514eb3c76c1b0a1782d75adb180', cover: '/images/arcade/grow-island.webp', description: '经营你的小岛，看它随春夏秋冬生长变化。', order: 9 },
  { id: 'dino-dobi', title: '小恐龙多比', url: 'https://www.evomeme.com/games/pwb01a13aee107879409cbe0ed47f2fea57', cover: '/images/arcade/dino-dobi.webp', description: '像素平台跳跃，跟多比一起踏上冒险旅程。', order: 10 },
  { id: 'cat-king', title: '喵喵大王', url: 'https://www.evomeme.com/games/pwb01a1402fbe4e7322a1dfcf0a9d741fa7', cover: '/images/arcade/cat-king.webp', description: '扮演喵喵大王，统治你可爱的猫猫王国。', order: 12 },
  { id: 'water-sort', title: '倒水瓶大作战', url: 'https://www.evomeme.com/games/pwb01a149357590713fae9f4805e0dd6705', cover: '/images/arcade/water-sort.webp', description: '把不同颜色的水倒来倒去，直到每瓶都纯净单一。', order: 13 },
  { id: 'swapplay', title: 'SwapPlay', url: 'https://www.evomeme.com/games/pwb01a17be9ac8d716497354af9c1962a47', cover: '/images/arcade/swapplay.webp', description: '交换方块、连成消除，轻松又上头的休闲小品。', order: 14 },
  { id: 'unreal-ta', title: '不真实的ta', url: 'https://www.evomeme.com/games/pwb01a1a008dd1379179b4467c803bf939e', cover: '/images/arcade/unreal-ta.webp', description: '一场虚实交织的竖屏叙事，关于「真实的ta」究竟是谁。', order: 15 },
  { id: 'fastfood', title: '我的快餐店不可能破产！？', url: 'https://www.evomeme.com/games/pwb01a0edcac8a27ba591dc77ce653f8e05', cover: '/images/arcade/fastfood.webp', description: '疯狂经营你的快餐店，手忙脚乱也别让它倒闭。', order: 16 },
  { id: 'candy', title: '消消糖果屋', url: 'https://www.evomeme.com/games/pwb01a13ac2d0f971139d9c650486e20197', cover: '/images/arcade/candy.webp', description: '甜到掉牙的三消小游戏，糖果连消根本停不下来。', order: 17 },
  { id: 'ai-worker', title: '能工智人', url: 'https://www.evomeme.com/games/pwb01a124e25e5e7c13af9e633ea6b55411', cover: '/images/arcade/ai-worker.webp', description: '假装自己是 AI 的潜行打工日，在工位间悄悄生存。', order: 18 },
  { id: 'pottery', title: '饥饿派制陶人', url: 'https://www.evomeme.com/games/pwb01a19ba7f8307f65b5353b697f8af2fe', cover: '/images/arcade/pottery.webp', description: '法式木偶剧场风，亲手捏出一件件陶器。', order: 20 },
];

/** 按 order 排序后的列表（页面直接用） */
export const gamesSorted = [...games].sort((a, b) => a.order - b.order);
