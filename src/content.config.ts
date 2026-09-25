import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * 博客内容集合。
 *
 * 源文件全部是普通 Markdown，放在 src/content/blog/ 下，
 * 既可以用编辑器手写，也可以由 Decap CMS（/admin/）创建。
 * CMS 的字段定义见 public/admin/config.yml —— 两边必须保持一致。
 */
const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
  }),

  schema: z.object({
    /** 文章标题 */
    title: z.string(),

    /** 副标题 / 文章简介，会进 <meta description> */
    description: z.string().optional(),

    /** 发布日期 */
    pubDate: z.coerce.date(),

    /** 最后更新日期 */
    updatedDate: z.coerce.date().optional(),

    /** 标签 */
    tags: z.array(z.string()).default([]),

    /** 分类（单值） */
    category: z.string().optional(),

    /** 封面图，正文头图也会用它 */
    cover: z.string().optional(),

    /** 头图下方一行小字（旧站长文页的日期区间 / 学期说明） */
    subtitle: z.string().optional(),

    /** 版权 / 署名信息，覆盖默认页脚文案 */
    copyright: z.string().optional(),

    /** 是否草稿：草稿不进首页、不进列表、不进 RSS，但本地 dev 可见 */
    draft: z.boolean().default(false),

    /** 侧边索引是否默认展示 */
    toc: z.boolean().default(true),
  }),
});

/**
 * 倒霉熊日记集合。
 *
 * 目录：src/content/badluck/ ，一个文件 = 一天的记录。
 * 同一天的多杯放在同一个文件里，正文用「第X杯敬自己，」开头分行写，
 * 由 src/lib/badluck.ts 按这个前缀切成一条条——不要为了结构统一强行拆文件。
 *
 * frontmatter 只有三个字段：date / cup（单杯）或 cups（多杯）/ draft。
 * **正文一律原样保留**，不润色、不总结、不改标点。
 * 只有「第X杯敬自己」这条没有正文时（例如只有一句话开头），标 draft: true，不进页面。
 */
const badluck = defineCollection({
  loader: glob({
    base: './src/content/badluck',
    pattern: '**/*.md',
  }),

  schema: z.object({
    /** 发生日期 */
    date: z.coerce.date(),

    /** 单条日记：第几杯 */
    cup: z.number().int().positive().optional(),

    /** 同一天多条：按正文顺序写 [1, 2, 3]，长度应与正文里的「第X杯」条数一致 */
    cups: z.array(z.number().int().positive()).optional(),

    /** 草稿：写了一半、还没有正文的记录，不进任何页面 */
    draft: z.boolean().default(false),
  }),
});

/**
 * 随记集合（Notes）。
 *
 * 目录：src/content/notes/ ，一个文件 = 一条随记。
 * 定位：**游戏开发之外**的记录——生活、想法、看到的东西，都往这里放。
 * 不做单篇详情页，/notes/ 列表页直接把正文渲染出来（随记就该一屏读完）。
 *
 * frontmatter：date 必填，其余可选。正文走正常 Markdown 渲染。
 */
const notes = defineCollection({
  loader: glob({
    base: './src/content/notes',
    pattern: '**/*.md',
  }),

  schema: z.object({
    /** 随记日期 */
    date: z.coerce.date(),

    /** 标题，可以不写（无题随记就只有日期和正文） */
    title: z.string().optional(),

    /** 一句话说明，会显示在首页 Notes 列表里 */
    description: z.string().optional(),

    /** 标签 */
    tags: z.array(z.string()).default([]),

    /** 草稿：不进任何页面 */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, badluck, notes };
