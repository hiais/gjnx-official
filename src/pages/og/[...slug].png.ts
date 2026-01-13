import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function getStaticPaths() {
    const articles = await getCollection('articles');
    const knowledge = await getCollection('knowledge');

    const allItems = [
        ...articles.map(item => ({ params: { slug: `articles/${item.id}` }, props: { item } })),
        ...knowledge.map(item => ({ params: { slug: `knowledge/${item.id}` }, props: { item } }))
    ];

    return allItems;
}

export async function GET({ props }: { props: { item: any } }) {
    const { item } = props;
    const title = item.data.title;
    const description = item.data.description || "";
    const category = item.data.category || (item.collection === 'articles' ? 'ARTICLE' : 'KNOWLEDGE');

    // Load font
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'LXGWWenKai-Regular.ttf');
    const fontData = await fs.readFile(fontPath);

    // Define OG Image structure using Satori
    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    position: 'relative',
                    backgroundColor: '#050505',
                },
                children: [
                    // Grid Background
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
                                backgroundSize: '40px 40px',
                                display: 'flex',
                            }
                        }
                    },
                    // Accent Gradient
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundImage: 'radial-gradient(circle at top left, rgba(0, 240, 255, 0.1), transparent 70%)',
                                display: 'flex',
                            }
                        }
                    },
                    // Content Container
                    {
                        type: 'div',
                        props: {
                            style: {
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                padding: '80px',
                            },
                            children: [
                                // Category
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            color: '#00f0ff',
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            letterSpacing: '2px',
                                            marginBottom: '20px',
                                        },
                                        children: category.toUpperCase()
                                    }
                                },
                                // Title
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            color: '#ffffff',
                                            fontSize: '64px',
                                            lineHeight: 1.2,
                                            fontWeight: 800,
                                            marginBottom: '30px',
                                            display: 'flex',
                                        },
                                        children: title
                                    }
                                },
                                // Description
                                description ? {
                                    type: 'div',
                                    props: {
                                        style: {
                                            color: '#888888',
                                            fontSize: '28px',
                                            lineHeight: 1.4,
                                            maxWidth: '900px',
                                            display: 'flex',
                                        },
                                        children: description.slice(0, 140) + (description.length > 140 ? '...' : '')
                                    }
                                } : null,
                                // Brand Footer
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            position: 'absolute',
                                            bottom: '60px',
                                            left: '80px',
                                            display: 'flex',
                                        },
                                        children: [
                                            { type: 'span', props: { style: { color: '#ffffff', fontSize: '32px', fontWeight: 'bold' }, children: 'GJNX' } },
                                            { type: 'span', props: { style: { color: '#00f0ff', fontSize: '32px', fontWeight: 'bold' }, children: '.TECH' } }
                                        ]
                                    }
                                }
                            ].filter(Boolean)
                        }
                    }
                ]
            }
        },
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'LXGW WenKai',
                    data: fontData,
                    weight: 400,
                    style: 'normal',
                }
            ],
        }
    );

    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(new Uint8Array(pngBuffer), {
        headers: {
            'Content-Type': 'image/png',
        },
    });
}
