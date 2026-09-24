/**
 * 站点元信息 + URL 拼装工具。
 *
 * 注意：站点部署在 GitHub Pages 项目页（base = /test），
 * 所有站内链接都必须经过 withBase()，否则会漏掉 /test 前缀。
 * 正文 Markdown 里的绝对路径由 rehype-base-prefix 插件兜底。
 */

export const SITE = {
  /** 站点根域名（不含 base），与 astro.config.mjs 的 site 保持一致 */
  url: 'https://aisssky.github.io',
  title: 'Aisssky',
  titleSuffix: 'Aisssky | Game Dev Portfolio',
  description: 'Unreal Engine Developer - My Own ONE PIECE',
  author: 'Aisssky',
  email: 'aisssky09@163.com',
  github: 'https://github.com/Aisssky',
  locale: 'zh-CN',
} as const;

/** BASE_URL 由 Astro 注入，base 为 "/test" 时其值为 "/test/" */
export const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** 把站内绝对路径拼上 base；外链/协议相对/纯锚点原样返回 */
export function withBase(path = '/'): string {
  if (!path) return `${BASE}/`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//') || path.startsWith('#')) {
    return path;
  }
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}` || '/';
}

/** 把站内路径提升为绝对 URL（用于 RSS / OG 等需要完整地址的场合） */
export function absoluteUrl(path = '/'): string {
  return new URL(withBase(path), SITE.url).href;
}

/** 带 base 的站点根地址，例如 https://aisssky.github.io/test */
export function siteOrigin(): string {
  return new URL(`${BASE}/`, SITE.url).href.replace(/\/+$/, '');
}

/** 文章详情页路径 */
export function postPath(id: string): string {
  return withBase(`/blog/${id}/`);
}

/** 分类页路径 */
export function categoryPath(name: string): string {
  return withBase(`/categories/${encodeURIComponent(name)}/`);
}

/** 标签页路径 */
export function tagPath(name: string): string {
  return withBase(`/tags/${encodeURIComponent(name)}/`);
}

/** 格式化日期，zh-CN 习惯的 YYYY-MM-DD */
export function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
