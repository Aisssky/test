/**
 * 文章查询工具。所有需要文章列表的页面都从这里取，保证排序、
 * 草稿过滤、分类/标签归并的口径一致。
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** 开发环境下把草稿也显示出来，方便预览；正式构建时草稿一律不输出 */
export const SHOW_DRAFTS = import.meta.env.DEV;

const byDateDesc = (a: Post, b: Post) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

/** 已发布文章，按发布日期倒序 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => SHOW_DRAFTS || !data.draft);
  return posts.sort(byDateDesc);
}

/** 取某篇文章的前后邻居（按时间线） */
export function getSiblings(posts: Post[], id: string): { newer?: Post; older?: Post } {
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) return {};
  return {
    newer: index > 0 ? posts[index - 1] : undefined,
    older: index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

export type Facet = { name: string; count: number };

function tally(values: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const value of values) {
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return map;
}

/** 分类归并：按文章数量倒序，同数量按名称排序 */
export function collectCategories(posts: Post[]): Facet[] {
  const names = posts.map((post) => post.data.category).filter((v): v is string => Boolean(v));
  return [...tally(names)]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

/** 标签归并 */
export function collectTags(posts: Post[]): Facet[] {
  const names = posts.flatMap((post) => post.data.tags);
  return [...tally(names)]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}
