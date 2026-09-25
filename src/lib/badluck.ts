import { getCollection } from 'astro:content';

/**
 * 倒霉熊日记（Bad Luck Diary）数据层。
 *
 * 三个铁律，改这个文件前请先看一眼：
 *   1. **正文一个字都不能改** —— 不润色、不总结、不扩写、不改标点、不删 emoji、不删网络用语。
 *   2. **不补数据** —— 缺第十一杯就是没有第十一杯，numbers 一律来自 frontmatter 或正文里的原话。
 *   3. **不生成标题** —— 「第 X 杯敬自己」是唯一的标题机制，直接从杯号算出来。
 *
 * About 页和 /diary/ 归档页都从这里取数据，保证两处一致。
 */

export interface BadLuckStory {
  /** 稳定 key，用于渲染列表 */
  id: string;
  /** 原始 Date，用于排序 */
  date: Date;
  /** 展示用日期：2026.09.17 */
  ymd: string;
  year: number;
  /** 第几杯，null = 正文里没识别出杯号 */
  cup: number | null;
  /** 「第三十六杯」，cup 为 null 时是 null */
  cupLabel: string | null;
  /** 正文原文，已去掉开头那句「第 X 杯敬自己，」，其余一字未动 */
  text: string;
}

const CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/** 36 → 三十六（只处理 1~99，够用了） */
export function cnNum(n: number): string {
  if (!Number.isFinite(n) || n <= 0 || n >= 100) return String(n);
  if (n < 10) return CN_NUM[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${tens > 1 ? CN_NUM[tens] : ''}十${ones ? CN_NUM[ones] : ''}`;
}

/** 三十六 → 36；识别不出来返回 null */
export function parseCnNum(s: string): number | null {
  if (!s) return null;
  let total = 0;
  let digit = 0;
  for (const ch of s) {
    const idx = CN_NUM.indexOf(ch); // 注意：数组上不能用 `in`，那查的是下标
    if (idx > 0) {
      digit = idx;
    } else if (idx === 0) {
      continue; // 零没有实际数值
    } else if (ch === '十') {
      total += (digit || 1) * 10;
      digit = 0;
    } else {
      return null;
    }
  }
  return total + digit || null;
}

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Date → 2026.09.17（一律按 UTC 取，避免时区把日期挪走一天） */
export const ymdOf = (d: Date): string =>
  `${d.getUTCFullYear()}.${pad2(d.getUTCMonth() + 1)}.${pad2(d.getUTCDate())}`;

/**
 * 把一个文件的正文按「第X杯敬自己」切成一条条。
 * 只按行首的前缀切分，行内内容原样保留（含换行）。
 * 若整段没有出现该前缀，返回整段作为一条。
 */
export function splitEntries(body = ''): string[] {
  const raw = String(body ?? '')
    .replace(/\r\n/g, '\n')
    .trim();
  if (!raw) return [];

  const head = /^[ \t]*第[零一二三四五六七八九十百]+杯/;
  const out: string[] = [];

  for (const line of raw.split('\n')) {
    if (head.test(line) && out.length) out.push(line);
    else if (out.length) out[out.length - 1] += `\n${line}`;
    else out.push(line);
  }

  return out.map((s) => s.trim()).filter(Boolean);
}

/** 去掉正文开头的「第三十六杯敬自己，」，剩下的部分返回。除此之外不做任何改动。 */
function stripLeadingCup(text: string): string {
  return text.replace(/^[ \t]*第[零一二三四五六七八九十百]+杯敬自己[，,、：:]?[ \t]*/, '');
}

/**
 * 读取全部日记，按日期倒序（同一天按杯号倒序）。
 * draft 不进这里。
 */
export async function getBadLuckStories(): Promise<BadLuckStory[]> {
  const entries = await getCollection('badluck', ({ data }) => !data.draft);
  const list: BadLuckStory[] = [];

  for (const entry of entries) {
    const date = new Date(entry.data.date);
    const nums: number[] =
      Array.isArray(entry.data.cups) && entry.data.cups.length
        ? entry.data.cups
        : entry.data.cup != null
          ? [entry.data.cup]
          : [];

    splitEntries(entry.body).forEach((raw, i) => {
      // 杯号优先取 frontmatter；没写就从正文开头那句话里读回来
      const cup =
        nums[i] ??
        parseCnNum(raw.match(/^[ \t]*第([零一二三四五六七八九十百]+?)杯/)?.[1] ?? '') ??
        null;

      list.push({
        id: `${entry.id}-${i}`,
        date,
        ymd: ymdOf(date),
        year: date.getUTCFullYear(),
        cup,
        cupLabel: cup != null ? `第${cnNum(cup)}杯` : null,
        text: stripLeadingCup(raw),
      });
    });
  }

  list.sort(
    (a, b) => b.date.getTime() - a.date.getTime() || (b.cup ?? 0) - (a.cup ?? 0),
  );

  return list;
}

/** 「36 杯敬自己 · 21 个故事」——杯数取最大编号（中间缺号是真实的），故事数取实际条数 */
export function summarize(stories: BadLuckStory[]): {
  maxCup: number;
  count: number;
  label: string;
} {
  const maxCup = stories.reduce((m, s) => Math.max(m, s.cup ?? 0), 0);
  const count = stories.length;
  return {
    maxCup,
    count,
    label: `${maxCup} 杯敬自己 · ${count} 个故事`,
  };
}

/** 正文要当纯文本渲染：只允许原样显示，任何 Markdown / HTML 语法都不解释 */
export const escapeText = (s: string): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
