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
 * 链接配对进度（2026-10-17，已全部完成）：
 *   13 款原草稿箱封面 → 经用户确认：删除垒鱼（只留太空垒）、删除跑团与大大蛋将军
 *   （用户砍掉这两个项目），最终 11 款全部由用户按 Evomeme 后台游戏名逐条指定并填入 url，
 *   无「链接待补」占位。
 *   配对红线：每个链接必须由用户明确「游戏名 → 链接」指定，绝不靠 URL 顺序猜测
 *   （曾因猜测导致全部配对错误，已记教训）。
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
  { id: 'phone-ads', title: '我的手机不可能这么多广告', url: 'https://www.evomeme.com/games/pwb01a1111eec3c7dfe868514b57373bde2', cover: '/images/arcade/phone-ads.webp', order: 1 },
  { id: 'trash-sort', title: '垃圾分类大师', url: 'https://www.evomeme.com/games/pwb01a0f61c7e7b7a5daebe4aa5a11b8e20', cover: '/images/arcade/trash-sort.webp', order: 2 },
  { id: 'space-stack', title: '太空垒', url: 'https://www.evomeme.com/games/pwb01a11544bf4772f48deb281900c58901', cover: '/images/arcade/space-stack.webp', order: 3 },
  { id: 'bean-sort', title: '拼豆分拣法则', url: 'https://www.evomeme.com/games/pwb01a11f426e267634b33f53c3fe986e40', cover: '/images/arcade/bean-sort.webp', order: 4 },
  { id: 'alien-invasion', title: '外星人入侵了我的手机', url: 'https://www.evomeme.com/games/pwb01a12a21c3d173b5b50294070be1e4a8', cover: '/images/arcade/alien-invasion.webp', order: 5 },
  { id: 'destiny-dice', title: '埃及命运之骰', url: 'https://www.evomeme.com/games/pwb01a1294eb081749d963bffbdecf0af92', cover: '/images/arcade/destiny-dice.webp', order: 6 },
  { id: 'earth-oj', title: '地球OJ', url: 'https://www.evomeme.com/games/pwb01a1459f554b7acaaa13665d5df489e9', cover: '/images/arcade/earth-oj.webp', order: 8 },
  { id: 'grow-island', title: '四时之岛', url: 'https://www.evomeme.com/games/pwb01a14514eb3c76c1b0a1782d75adb180', cover: '/images/arcade/grow-island.webp', order: 9 },
  { id: 'dino-dobi', title: '小恐龙多比', url: 'https://www.evomeme.com/games/pwb01a13aee107879409cbe0ed47f2fea57', cover: '/images/arcade/dino-dobi.webp', order: 10 },
  { id: 'cat-king', title: '喵喵大王', url: 'https://www.evomeme.com/games/pwb01a1402fbe4e7322a1dfcf0a9d741fa7', cover: '/images/arcade/cat-king.webp', order: 12 },
  { id: 'water-sort', title: '倒水瓶大作战', url: 'https://www.evomeme.com/games/pwb01a149357590713fae9f4805e0dd6705', cover: '/images/arcade/water-sort.webp', order: 13 },
];

/** 按 order 排序后的列表（页面直接用） */
export const gamesSorted = [...games].sort((a, b) => a.order - b.order);
