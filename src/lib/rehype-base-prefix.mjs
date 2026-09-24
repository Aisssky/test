/**
 * rehype 插件：给正文里以 "/" 开头的 URL 自动加上 Astro 的 base 前缀。
 *
 * 为什么需要它：站点部署在 GitHub Pages 项目页时 base = "/test"，
 * 但 Markdown 正文里的 `/images/a.jpg`（以及 Decap CMS 上传后写入的
 * `/images/uploads/a.jpg`）是站点根路径，不会自动带上 base，直接 404。
 * 这个插件只处理站内绝对路径，外链、协议相对地址（//cdn...）、
 * 纯锚点（#foo）一律不动。
 */

const URL_ATTRS = {
  a: ['href'],
  img: ['src'],
  source: ['src'],
  video: ['src', 'poster'],
  audio: ['src'],
  iframe: ['src'],
  embed: ['src'],
  object: ['data'],
};

const isExternal = (value) =>
  /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//') || value.startsWith('#');

export default function rehypeBasePrefix(options = {}) {
  const base = String(options.base ?? '').replace(/\/+$/, '');

  return (tree) => {
    console.log("[BASE-PREFIX] 插件被调用, base=" + base);
    if (!base) return;
    walk(tree);
  };

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'element' && node.properties) {
      const attrs = URL_ATTRS[node.tagName];
      if (attrs) {
        for (const attr of attrs) {
          const value = node.properties[attr];
          if (typeof value === 'string' && value.startsWith('/') && !isExternal(value)) {
            node.properties[attr] = base + value;
          }
        }
      }
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
    }
  }
}
