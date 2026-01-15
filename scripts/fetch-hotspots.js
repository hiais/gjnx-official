import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';

// ESM path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parser = new Parser();

const HOTSPOTS_PATH = path.join(__dirname, '../src/data/hotspots.json');

// Technical RSS Sources (Global & Domestic)
// Technical RSS Sources (Optimized for High-Value Engineering & SEO)
const RSS_FEEDS = [
    // Global (High Authority Domain)
    { name: 'HackerNews', url: 'https://news.ycombinator.com/rss' },
    { name: 'ArsTechnica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
    { name: 'HuggingFace', url: 'https://huggingface.co/blog/feed.xml' },
    { name: 'SemiWiki', url: 'https://semiwiki.com/feed/' },
    { name: 'Phoronix', url: 'https://www.phoronix.com/rss.php' }, // Replaced AnandTech (Broken)

    // Domestic (Vertical AI & Chip)
    { name: 'MachineHeart', url: 'https://www.jiqizhixin.com/rss' }, // 机器之心
    { name: 'QbitAI', url: 'https://www.qbitai.com/feed' }, // 量子位
    { name: 'OSChina', url: 'https://www.oschina.net/news/rss' } // 开源中国
];

// Refined Keyword Weights (Bilingual High Impact)
// Refined Keyword Weights (2026 High-Impact Tech)
const KEYWORDS = {
    high: {
        'energy efficiency': 40, 'power consumption': 35,
        '2nm': 45, '1.6nm': 45, // Updated node
        'npu': 35, 'tpu': 35, 'lpu': 40, 'groq': 40, // Emerging AI chips
        'hbm4': 40, 'hbm3e': 35,
        'ppw': 50, 'performance/watt': 50,
        'backside power': 40, 'powervia': 40,
        'solid state battery': 40, 'lithium-metal': 35,
        'blackwell': 45, 'rubin': 45, // Nvidia Gen
        'gemini': 30, 'sora': 30, 'gpt-5': 35,
        // 中文权重
        '能效': 40, '功耗': 35,
        '制程': 30, '晶圆': 25,
        '算力': 35, '存算一体': 40,
        '固态电池': 40, '硅碳负极': 35,
        '每瓦性能': 50, '背面供电': 40,
        '具身智能': 45, '人形机器人': 35,
        '量子计算': 30
    },
    medium: {
        'efficiency': 25, 'thermal': 20, 'cooling': 20,
        'silicon': 15, 'ai': 15, 'gpu': 20,
        'server': 15, 'datacenter': 20,
        'benchmark': 25, 'yield': 20,
        'architecture': 15, 'risc-v': 20,
        // 中文权重
        '效率': 25, '散热': 20,
        '硅': 15, '良率': 20,
        '数据中心': 20, '基准测试': 25,
        '架构': 15
    }
};

/**
 * Score a news item based on keywords in title and description
 */
function calculatePScore(title, description) {
    let score = 40; // Base score
    const content = (title + ' ' + description).toLowerCase();

    for (const [kw, weight] of Object.entries(KEYWORDS.high)) {
        if (content.includes(kw)) score += weight;
    }
    for (const [kw, weight] of Object.entries(KEYWORDS.medium)) {
        if (content.includes(kw)) score += Math.floor(weight / 2);
    }

    return Math.min(score, 99); // Cap at 99
}

async function fetchFeed(feedConfig) {
    try {
        console.log(`- Scanning node: ${feedConfig.name}...`);
        const feed = await parser.parseURL(feedConfig.url);
        console.log(`  └─ Found ${feed.items.length} raw signals (${feedConfig.name}).`);

        return feed.items.map(item => ({
            title: item.title,
            source: feedConfig.name,
            link: item.link,
            abstract: item.contentSnippet ? item.contentSnippet.slice(0, 180).replace(/\n/g, ' ') + '...' : '',
            pscore: calculatePScore(item.title, item.contentSnippet || ''),
            category: 'CHIP_FRONT'
        }));
    } catch (err) {
        console.error(`- node failure: ${feedConfig.name}`, err.message);
        return [];
    }
}

async function fetchRealIntel() {
    console.log('🚀 Starting Intel Intelligence Gathering (Parallel High Density Phase)...');

    // Parallel Fetching
    const results = await Promise.all(RSS_FEEDS.map(fetchFeed));
    let allItems = results.flat();

    // Deduplication Strategy (by Link)
    const seenLinks = new Set();
    allItems = allItems.filter(item => {
        if (!item.link || seenLinks.has(item.link)) return false;
        seenLinks.add(item.link);
        return true;
    });

    // Dynamic Thresholding
    let threshold = 65;
    let hotspots = allItems.filter(item => item.pscore > threshold);

    // Fallback: If < 5 items, lower standards to find *something*
    if (hotspots.length < 5) {
        console.log('⚠️ High-quality yield low. Lowering signal threshold to 50...');
        threshold = 50;
        hotspots = allItems.filter(item => item.pscore > threshold);
    }

    // Sort and Slice
    hotspots = hotspots
        .sort((a, b) => b.pscore - a.pscore)
        .slice(0, 15)
        .map((item, index) => ({
            ...item,
            rank: (index + 1).toString().padStart(2, '0'),
            trend: Math.random() > 0.5 ? 'up' : 'down'
        }));

    if (hotspots.length > 0) {
        fs.writeFileSync(HOTSPOTS_PATH, JSON.stringify(hotspots, null, 2));
        console.log(`✅ Intelligence synchronization complete. ${hotspots.length} high-value nodes indexed.`);
    } else {
        console.log('⚠️ No pulse detected even after filter relaxation.');
    }
}

fetchRealIntel();
