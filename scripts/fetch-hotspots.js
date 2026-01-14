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
const RSS_FEEDS = [
    // Global
    { name: 'SemiWiki', url: 'https://semiwiki.com/feed/' },
    { name: 'TechPowerUp', url: 'https://www.techpowerup.com/rss/news' },
    { name: 'TomHardware', url: 'https://www.tomshardware.com/rss' },
    // Domestic (CN)
    { name: 'Solidot', url: 'https://www.solidot.org/index.rss' },
    { name: 'ITHome', url: 'https://www.ithome.com/rss/' },
    { name: '36Kr', url: 'https://36kr.com/feed' },
    { name: 'Huxiu', url: 'https://www.huxiu.com/rss/0.xml' },
    { name: 'Sspai', url: 'https://sspai.com/feed' },
    { name: 'TMTPost', url: 'https://www.tmtpost.com/feed' },
    { name: 'GeekPark', url: 'https://www.geekpark.net/rss' },
    { name: 'ifanr', url: 'https://www.ifanr.com/feed' },
    { name: 'V2EX_Tech', url: 'https://www.v2ex.com/feed/tab/tech.xml' }
];

// Refined Keyword Weights (Bilingual High Impact)
const KEYWORDS = {
    high: {
        'energy efficiency': 40,
        'power consumption': 35,
        '2nm': 45,
        '3nm': 30,
        'npu': 35,
        'tpu': 35,
        'hbm4': 40,
        'ppw': 50,
        'performance/watt': 50,
        'backside power': 40,
        'powervia': 40,
        'solid state battery': 40,
        'robotics': 35,
        // 中文权重
        '能效': 40,
        '功耗': 35,
        '制程': 30,
        '算力': 35,
        '固态电池': 40,
        '每瓦性能': 50,
        '背面供电': 40,
        '具身智能': 45,
        '人形机器人': 35
    },
    medium: {
        'efficiency': 25,
        'thermal': 20,
        'cooling': 20,
        'silicon': 15,
        'ai': 15,
        'gpu': 20,
        'server': 15,
        'datacenter': 20,
        'benchmark': 25,
        'yield': 20,
        // 中文权重
        '效率': 25,
        '散热': 20,
        '硅': 15,
        '良率': 20,
        '数据中心': 20,
        '基准测试': 25
    }
};

/**
 * Score a news item based on keywords in title and description
 */
function calculatePScore(title, description) {
    let score = 40; // Reduced base score for more spread
    const content = (title + ' ' + description).toLowerCase();

    for (const [kw, weight] of Object.entries(KEYWORDS.high)) {
        if (content.includes(kw)) score += weight;
    }
    for (const [kw, weight] of Object.entries(KEYWORDS.medium)) {
        if (content.includes(kw)) score += Math.floor(weight / 2);
    }

    return Math.min(score, 99); // Cap at 99
}

async function fetchRealIntel() {
    console.log('🚀 Starting Intel Intelligence Gathering (High Density Phase)...');
    let allItems = [];

    for (const feedConfig of RSS_FEEDS) {
        try {
            console.log(`- Scanning node: ${feedConfig.name}...`);
            const feed = await parser.parseURL(feedConfig.url);
            console.log(`  └─ Found ${feed.items.length} raw signals.`);

            const mapped = feed.items.map(item => ({
                title: item.title,
                source: feedConfig.name,
                link: item.link,
                abstract: item.contentSnippet ? item.contentSnippet.slice(0, 180).replace(/\n/g, ' ') + '...' : '',
                pscore: calculatePScore(item.title, item.contentSnippet || ''),
                category: 'CHIP_FRONT'
            }));

            allItems = [...allItems, ...mapped];
        } catch (err) {
            console.error(`- node failure: ${feedConfig.name}`, err.message);
        }
    }

    // Filter and Rank
    // Threshold: PSCORE > 65, Capacity Expanded to 15
    const hotspots = allItems
        .filter(item => item.pscore > 65)
        .sort((a, b) => b.pscore - a.pscore)
        .slice(0, 15)
        .map((item, index) => ({
            ...item,
            rank: (index + 1).toString().padStart(2, '0'),
            trend: Math.random() > 0.5 ? 'up' : 'down' // Simulation for UI
        }));

    if (hotspots.length > 0) {
        fs.writeFileSync(HOTSPOTS_PATH, JSON.stringify(hotspots, null, 2));
        console.log(`✅ Intelligence synchronization complete. ${hotspots.length} nodes updated.`);
    } else {
        console.log('⚠️ No high-efficiency pulses detected this cycle.');
    }
}

fetchRealIntel();
