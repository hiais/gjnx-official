import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

// 1. 定义哪些页面需要生成 OG 图片
export async function getStaticPaths() {
    const articles = await getCollection('articles');
    return articles.map((post) => ({
        params: { slug: post.id },
        props: { title: post.data.title, description: post.data.description },
    }));
}

// 2. 核心生成逻辑
export const GET: APIRoute = async ({ props }) => {
    const { title, description } = props;

    let fontData: Buffer | undefined;

    // 尝试读取本地字体文件
    // 优先级：1. LXGW WenKai (完美中文于阅读体验) 2. Noto Sans SC (保底)
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    const primaryFontPath = path.join(fontsDir, 'LXGWWenKai-Regular.ttf');
    const secondaryFontPath = path.join(fontsDir, 'noto-sans-sc-latin-700-normal.woff');

    try {
        if (fs.existsSync(primaryFontPath)) {
            fontData = fs.readFileSync(primaryFontPath);
        } else if (fs.existsSync(secondaryFontPath)) {
            fontData = fs.readFileSync(secondaryFontPath);
        } else {
            console.warn(`[OG] No local fonts found in ${fontsDir}. OG image text will be missing.`);
        }
    } catch (e) {
        console.error('[OG] Failed to read font file:', e);
    }

    // 兜底：如果没有字体，为了让 Build 不崩溃，渲染一个不带文字的占位图
    if (!fontData) {
        const svg = await satori(
            {
                type: 'div',
                props: {
                    style: {
                        display: 'flex', width: '100%', height: '100%', background: '#050505',
                        justifyContent: 'center', alignItems: 'center', color: '#00F0FF', fontSize: 40, flexDirection: 'column'
                    },
                    children: [
                        { type: 'div', props: { children: 'SILICON EFFICIENCY', style: { marginBottom: 20 } } },
                        { type: 'div', props: { children: 'Image Generation Failed (No Font)', style: { fontSize: 20, color: '#666' } } }
                    ]
                }
            },
            {
                width: 1200, height: 630,
                fonts: [] // 空字体列表
            }
        );
        const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
        return new Response(resvg.render().asPng(), { headers: { 'Content-Type': 'image/png' } });
    }

    // 正常渲染
    const svg = await satori(
        {
            type: 'div',
            props: {
                children: [
                    // Background Layer
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                top: 0, left: 0, width: '100%', height: '100%',
                                background: '#050505',
                                display: 'flex',
                                backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                            },
                        },
                    },
                    // Content Layer
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                padding: '80px',
                                width: '100%', height: '100%',
                            },
                            children: [
                                // Brand Label
                                {
                                    type: 'div',
                                    props: {
                                        children: 'SILICON EFFICIENCY // 硅基能效',
                                        style: { color: '#00F0FF', fontSize: 24, marginBottom: 40, fontFamily: 'sans-serif' },
                                    },
                                },
                                // Title
                                {
                                    type: 'div',
                                    props: {
                                        children: title,
                                        style: { color: 'white', fontSize: 64, fontWeight: 'bold', lineHeight: 1.2, marginBottom: 20, fontFamily: 'LXGW WenKai' },
                                    },
                                },
                                // Description (Truncated)
                                {
                                    type: 'div',
                                    props: {
                                        children: description?.slice(0, 100) + (description && description.length > 100 ? '...' : ''),
                                        style: { color: '#888', fontSize: 32, lineHeight: 1.4, fontFamily: 'LXGW WenKai' },
                                    },
                                },
                                // Decoration Bar
                                {
                                    type: 'div',
                                    props: {
                                        style: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '8px', background: 'linear-gradient(90deg, #00F0FF, #FFAE00)' },
                                    },
                                },
                            ],
                        },
                    },
                ],
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    position: 'relative',
                },
            },
        },
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'LXGW WenKai', // 这一步仅仅是给字体起个名
                    data: fontData,      // 这是真正的数据
                    style: 'normal',
                },
            ],
        }
    );

    const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: 1200 },
    });
    const image = resvg.render();

    return new Response(image.asPng(), {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=604800, immutable',
        },
    });
};
