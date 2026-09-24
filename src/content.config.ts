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

export const collections = { blog };
