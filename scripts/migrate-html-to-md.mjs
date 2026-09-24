/**
 * 旧站长文页 → Markdown 迁移脚本（一次性使用，迁移完可留作参考）
 *
 *   npm run migrate:html
 *
 * 输入：legacy/*.html（迁移前的原始页面，原样留档）
 * 输出：src/content/blog/*.md
 *
 * 设计要点
 * --------
 * 1. 用 domino（turndown 自带的 HTML 解析器）真正解析 DOM，
 *    不靠正则切标签，保证 205KB 的 cpp.html 也能可靠处理。
 * 2. 旧站的「非 Markdown 组件」按类型分别处理：
 *      - 面试题 hover 浮层  → <details> 折叠块（内容仍是 Markdown）
 *      - Mermaid 图卡片     → ```mermaid 代码块（工具栏由布局脚本注入）
 *      - 技术栈标签 / 并排图片 / 视频卡片 / 提示卡 → 原样保留内联 HTML
 *      - UE 板块的蓝色小标题 → 保留 HTML 并挂上原 id
 * 3. 旧站的站内锚点（#ue-build 等）通过 <span id> 保留，链接不会失效。
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const require = createRequire(import.meta.url);
const domino = require('@mixmark-io/domino');

const ROOT = path.resolve(import.meta.dirname, '..');
const LEGACY = path.join(ROOT, 'legacy');
const OUT = path.join(ROOT, 'src', 'content', 'blog');

/* ------------------------------------------------------------------ */
/* 资源路径重写：旧站的相对路径 → public/ 下的站点绝对路径            */
/* ------------------------------------------------------------------ */

const PATH_REWRITES = [
  [/^image\/poster\.jpg$/i, null], // 文件本来就不存在，去掉 poster
  [/^image\/(.+)$/i, '/images/$1'],
  [/^video\/5月12日\.mp4$/i, '/video/dialogue-demo.mp4'],
  [/^video\/(.+)$/i, '/video/$1'],
];

function rewriteUrl(value) {
  if (!value) return value;
  for (const [pattern, replacement] of PATH_REWRITES) {
    if (pattern.test(value)) {
      if (replacement === null) return null;
      return value.replace(pattern, replacement);
    }
  }
  return value;
}

/* ------------------------------------------------------------------ */
/* turndown 配置                                                      */
/* ------------------------------------------------------------------ */

const td = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  br: '\n',
});

td.use(gfm); // 表格 / 删除线 / 任务列表

td.remove(['script', 'style', 'noscript', 'svg']);

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const oneLine = (value) => String(value).replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();

/** domino 的 NodeList 没有 forEach，统一走这个入口 */
const each = (scope, selector, fn) => {
  const nodes = Array.prototype.slice.call(scope.querySelectorAll(selector));
  for (const node of nodes) fn(node);
};

/**
 * 取元素自身的文本，跳过指定 class 的子树。
 * （不能用 cloneNode —— domino 深拷贝到一定层级会抛 INVALID_CHARACTER_ERR）
 */
function ownText(element, skipClass) {
  let out = '';
  const walk = (parent) => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === 1 && child.classList && child.classList.contains(skipClass)) continue;
      if (child.nodeType === 3) out += child.nodeValue;
      else if (child.nodeType === 1) walk(child);
    }
  };
  walk(element);
  return out;
}

/** 旧站锚点：<span id="x"></span> 保留，使 #x 链接继续可用
 *  注意：turndown 会丢弃「空元素」，所以锚点里塞一个零宽空格让它非空。 */
td.addRule('legacyAnchor', {
  filter: (node) => node.nodeName === 'SPAN' && node.classList && node.classList.contains('legacy-anchor'),
  replacement: (_content, node) => `\n\n<span id="${node.getAttribute('id')}"></span>\n\n`,
});

/** C++ → UE 跨栏联动标签（行内，保留胶囊样式） */
td.addRule('ueLinkTag', {
  filter: (node) => node.nodeName === 'A' && node.classList && node.classList.contains('ue-link-tag'),
  replacement: (_content, node) =>
    `<a href="${node.getAttribute('href')}" class="ue-link-tag">${oneLine(node.textContent)}</a>`,
});

/** 对应 C++ 参考标签（行内） */
td.addRule('refTag', {
  filter: (node) => node.classList && node.classList.contains('ref-tag'),
  replacement: (_content, node) => `<span class="ref-tag">${oneLine(node.textContent)}</span>`,
});

/** 技术栈标签组：整块保留 HTML，样式由 article.css 继续接管 */
td.addRule('techStack', {
  filter: (node) => node.classList && node.classList.contains('tech-stack-container'),
  replacement: (_content, node) => `\n\n${oneLine(node.outerHTML)}\n\n`,
});

/** 提示卡：内部全是行内内容，整块保留 HTML */
td.addRule('tipCard', {
  filter: (node) => node.classList && node.classList.contains('tip-card'),
  replacement: (_content, node) => `\n\n${oneLine(node.outerHTML)}\n\n`,
});

/** 并排图片组 */
td.addRule('imageRow', {
  filter: (node) => node.classList && node.classList.contains('image-row'),
  replacement: (_content, node) => `\n\n${prettifyImageRow(node)}\n\n`,
});

/** 视频卡片 */
td.addRule('videoCard', {
  filter: (node) => node.classList && node.classList.contains('video-card'),
  replacement: (_content, node) => `\n\n${buildVideoCard(node)}\n\n`,
});

/**
 * Mermaid 图卡片 → 代码块
 *
 * 源码必须在 turndown 之前预先取出：turndown 对非 pre/code 元素会执行
 * collapseWhitespace，直接在规则里读 DOM 的话换行会被压平成一行。
 */
const mermaidSources = [];
let mermaidCursor = 0;

td.addRule('diagramCard', {
  filter: (node) => node.classList && node.classList.contains('diagram-card'),
  replacement: () => {
    const code = mermaidSources[mermaidCursor++] ?? '';
    return `\n\n\`\`\`mermaid\n${code}\n\`\`\`\n\n`;
  },
});

/** 面试题区块 → 标题 + 一组 <details> */
td.addRule('interviewBlock', {
  filter: (node) =>
    node.nodeName === 'DIV' && node.classList && node.classList.contains('interview-block'),
  replacement: (_content, node) => {
    const blocks = [];

    each(node, '.iq-trigger', (trigger) => {
      const question = oneLine(ownText(trigger, 'iq-popup'));
      const popup = trigger.querySelector('.iq-popup');
      const answerEl = popup ? popup.querySelector('.q-answer') : null;
      const answer = answerEl ? td.turndown(answerEl.innerHTML).trim() : '（原页面未提供答案）';

      blocks.push(
        [
          '<details class="iq">',
          `<summary>${escapeHtml(question)}</summary>`,
          '',
          answer,
          '',
          '</details>',
        ].join('\n')
      );
    });

    return `\n\n#### 📝 面试高频题\n\n${blocks.join('\n\n')}\n\n`;
  },
});

/* ------------------------------------------------------------------ */
/* 各组件的小工具                                                     */
/* ------------------------------------------------------------------ */

function prettifyImageRow(node) {
  const items = [];

  each(node, '.image-item', (item) => {
    const img = item.querySelector('img');
    const caption = item.querySelector('.img-caption');
    if (!img) return;

    const src = rewriteUrl(img.getAttribute('src'));
    if (!src) return;

    items.push(
      [
        '  <div class="image-item">',
        `    <img src="${src}" alt="${escapeHtml(img.getAttribute('alt') || '')}" />`,
        `    <div class="img-caption">${escapeHtml(oneLine(caption ? caption.textContent : ''))}</div>`,
        '  </div>',
      ].join('\n')
    );
  });

  return ['<div class="image-row">', ...items, '</div>'].join('\n');
}

function buildVideoCard(node) {
  const video = node.querySelector('video');
  const desc = node.querySelector('.video-desc');
  const source = node.querySelector('source');

  const src = rewriteUrl(source ? source.getAttribute('src') : null) ?? '/video/dialogue-demo.mp4';
  const type = (source && source.getAttribute('type')) || 'video/mp4';
  const attrs = video
    ? ['controls', 'muted', 'loop', 'preload="auto"']
        .filter((name) => {
          const key = name.split('=')[0];
          return video.hasAttribute(key);
        })
        .join(' ')
    : 'controls';

  return [
    '<figure class="video-card">',
    `  <video ${attrs}>`,
    `    <source src="${src}" type="${type}" />`,
    '    您的浏览器不支持视频播放，请升级浏览器或查看项目文档。',
    '  </video>',
    `  <figcaption class="video-desc">${escapeHtml(oneLine(desc ? desc.textContent : ''))}</figcaption>`,
    '</figure>',
  ].join('\n');
}

/* ------------------------------------------------------------------ */
/* DOM 预处理                                                          */
/* ------------------------------------------------------------------ */

/** 删掉 HTML 注释，避免干扰层级判断 */
function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

/** 重写所有图片/视频/链接的站内相对路径 */
function rewritePaths(root) {
  each(root, 'img', (img) => {
    const next = rewriteUrl(img.getAttribute('src'));
    if (next === null) img.parentNode.removeChild(img);
    else if (next) img.setAttribute('src', next);
    img.removeAttribute('onerror');
  });

  each(root, 'source', (source) => {
    const next = rewriteUrl(source.getAttribute('src'));
    if (next) source.setAttribute('src', next);
  });

  each(root, 'video', (video) => {
    const poster = video.getAttribute('poster');
    if (poster) {
      const next = rewriteUrl(poster);
      if (next) video.setAttribute('poster', next);
      else video.removeAttribute('poster');
    }
  });
}

/**
 * 处理 <section id="x">：
 *   - 首个元素子节点是 UE 小标题 → 把 id 挪到该标题上
 *   - 否则在 section 开头插入 <span class="legacy-anchor" id="x">
 *   - 最后去掉 section 包裹（Markdown 里不需要这一层）
 */
function flattenSections(root) {
  each(root, 'section', (section) => {
    const id = section.getAttribute('id');
    const firstElement = Array.from(section.childNodes).find((child) => child.nodeType === 1);

    if (id) {
      // 把所有 section 的 id 都做成前置锚点，保证 #xxx 深链不失效。
      // UE 板块的蓝色小标题也走这条路：摘掉 class 让 turndown 正常
      // 生成 Markdown 标题（这样才能进自动生成的侧边索引），
      // 蓝色样式改由 article.css 里的 h2:has(+ p .ref-tag) 命中。
      const anchor = section.ownerDocument.createElement('span');
      anchor.setAttribute('class', 'legacy-anchor');
      anchor.setAttribute('id', id);
      anchor.appendChild(section.ownerDocument.createTextNode('\u200B'));
      section.insertBefore(anchor, section.firstChild);

      const firstHeading = Array.from(section.childNodes).find(
        (child) => child.nodeType === 1 && /^H[1-6]$/.test(child.nodeName)
      );
      if (firstHeading && firstHeading.classList && firstHeading.classList.contains('section-title')) {
        firstHeading.removeAttribute('class');
      }
    }
  });
}

/** 解包一层（把 <article>/<aside>/<section> 换成其子节点） */
function unwrap(element) {
  const parent = element.parentNode;
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

/** 全量解包 section / article / aside */
function unwrapStructure(root) {
  root.querySelectorAll('article, aside, section').forEach((element) => unwrap(element));
}

/* ------------------------------------------------------------------ */
/* 逐篇迁移                                                            */
/* ------------------------------------------------------------------ */

const POSTS = [
  {
    file: 'cpp.html',
    output: '2026-04-21-cpp-ue5-notes.md',
    frontmatter: {
      title: 'C++ / UE5 技术笔记',
      description: '纯血 C++ 全覆盖 · 从编译到 STL · UE C++ 落地应用',
      pubDate: '2026-04-21',
      updatedDate: '2026-07-11',
      subtitle: '纯血 C++ 全覆盖 · 从编译到 STL · UE C++ 落地应用（原页面日期：2026-04-21 ~ 2026-07-11）',
      category: '技术',
      tags: ['C++', 'UE5', '面试题', '计算机基础'],
      cover: '/images/promo.webp',
      copyright: '© 2026 Aisssky | 仅供学习交流',
    },
    /** 内容根：双栏容器（左 C++ / 右 UE），拆开后按顺序拼成单栏 */
    prepare(doc) {
      const wrapper = doc.querySelector('.content-wrapper');
      const cppPanel = wrapper.querySelector('.cpp-panel');
      const uePanel = wrapper.querySelector('.ue-panel');

      // 把两个面板的内容并到同一个容器里，保持原有先后顺序
      const container = doc.createElement('div');
      [cppPanel, uePanel].forEach((panel) => {
        while (panel.firstChild) container.appendChild(panel.firstChild);
      });

      return container;
    },
  },
  {
    file: 'Games101-1.html',
    output: '2026-05-30-games101-notes.md',
    frontmatter: {
      title: '计算机图形学 GAMES101 课堂笔记',
      description: 'Lecture 01 ~ Lecture 22 完整课堂笔记',
      pubDate: '2026-05-30',
      subtitle: '课堂完整笔记 · Lecture 01 ~ Lecture 22',
      category: '图形学',
      tags: ['图形学', 'GAMES101', '渲染', '光线追踪'],
      cover: '/images/promo.webp',
      copyright: '© 2026 Aisssky | 仅供学习交流',
    },
    prepare(doc) {
      return doc.querySelector('.content-area');
    },
  },
  {
    file: 'cyberpunk-devlog.html',
    output: '2026-04-21-cyberpunk-devlog.md',
    frontmatter: {
      title: '《赛博朋克：飘渺城影》开发日志',
      description: '对话系统 / 玩家交互 / 文本收集 / 教程系统的重构记录',
      pubDate: '2026-04-21',
      updatedDate: '2026-05-10',
      subtitle: '开发日志 · 2026-04-21 ~ 2026-05-10',
      category: '项目日志',
      tags: ['UE5', '对话系统', 'UMG', '项目复盘'],
      cover: '/images/promo.webp',
      copyright: '© 2026 集体梦境 项目组 | 仅供学习交流与开发展示',
    },
    prepare(doc) {
      return doc.querySelector('.content-area');
    },
  },
];

function buildFrontmatter(data) {
  const lines = ['---'];

  const push = (key, value) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      value.forEach((item) => lines.push(`  - ${item}`));
    } else {
      lines.push(`${key}: ${value}`);
    }
  };

  push('title', JSON.stringify(data.title));
  if (data.description) push('description', JSON.stringify(data.description));
  push('pubDate', data.pubDate);
  if (data.updatedDate) push('updatedDate', data.updatedDate);
  if (data.subtitle) push('subtitle', JSON.stringify(data.subtitle));
  if (data.category) push('category', JSON.stringify(data.category));
  push('tags', data.tags);
  if (data.cover) push('cover', data.cover);
  if (data.copyright) push('copyright', JSON.stringify(data.copyright));
  push('draft', false);
  push('toc', true);
  lines.push('---');

  return lines.join('\n');
}

function tidyMarkdown(markdown) {
  return (
    markdown
      // 压缩 3 行以上空行
      .replace(/\n{3,}/g, '\n\n')
      // turndown 的列表标记是 "-   "，统一收成 "- "，编辑起来清爽些
      .replace(/^(\s*)[-*] {2,}/gm, '$1- ')
      // 去掉行尾空格
      .split('\n')
      .map((line) => line.replace(/[ \t]+$/, ''))
      .join('\n')
      .trim()
  );
}

function migrate() {
  fs.mkdirSync(OUT, { recursive: true });

  const report = [];

  for (const post of POSTS) {
    const sourcePath = path.join(LEGACY, post.file);
    const html = stripComments(fs.readFileSync(sourcePath, 'utf8'));

    const doc = domino.createDocument(html, true);
    const root = post.prepare(doc);

    if (!root) throw new Error(`找不到内容根节点：${post.file}`);

    rewritePaths(root);
    flattenSections(root);
    unwrapStructure(root);

    // Mermaid 源码必须在 turndown 之前取出来（见 diagramCard 规则注释）
    mermaidSources.length = 0;
    mermaidCursor = 0;
    each(root, '.diagram-card .mermaid', (element) => {
      mermaidSources.push(element.textContent.trim());
    });

    const markdown = tidyMarkdown(td.turndown(root.innerHTML));
    const content = `${buildFrontmatter(post.frontmatter)}\n\n${markdown}\n`;

    fs.writeFileSync(path.join(OUT, post.output), content, 'utf8');

    report.push({
      文件: post.output,
      来源: post.file,
      字符数: content.length,
      行数: content.split('\n').length,
    });
  }

  console.table(report);
}

migrate();
