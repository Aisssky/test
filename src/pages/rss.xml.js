/**
 * RSS 订阅源：/rss.xml
 * 草稿不会出现在这里。
 */
import rss from '@astrojs/rss';
import { getPublishedPosts } from '../lib/posts';
import { postPath, siteOrigin, SITE } from '../lib/site';

export async function GET(context) {
  const posts = await getPublishedPosts();
  // site 必须带 base，否则生成的 link 会漏掉 /test 前缀
  const origin = context.site ? new URL(`${import.meta.env.BASE_URL}`, context.site).href.replace(/\/+$/, '') : siteOrigin();

  return rss({
    title: `${SITE.author} · 笔记`,
    description: SITE.description,
    site: origin,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? post.data.subtitle ?? '',
      pubDate: post.data.pubDate,
      link: postPath(post.id),
      categories: [
        ...(post.data.category ? [post.data.category] : []),
        ...post.data.tags,
      ],
    })),
    customData: `<language>zh-cn</language>`,
  });
}
