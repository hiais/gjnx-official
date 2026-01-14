import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const articles = await getCollection('articles');
    const publishedArticles = articles
        .filter(a => !a.data.draft)
        .sort((a, b) => (b.data.date?.getTime() || 0) - (a.data.date?.getTime() || 0))
        .slice(0, 20); // Latest 20 articles

    return rss({
        title: '硅基能效 | Silicon Efficiency',
        description: '解构芯片与AI算力的真相，只看数据。深度技术分析，硬核能效评测。',
        site: context.site,
        items: publishedArticles.map((article) => ({
            title: article.data.title,
            pubDate: article.data.date,
            description: article.data.description || '',
            link: `/articles/${article.id}/`,
            categories: article.data.tags || [],
        })),
        customData: `<language>zh-cn</language>`,
    });
}
