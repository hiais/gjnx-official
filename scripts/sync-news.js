import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const SOURCE_FILE = path.resolve('../04_Management/20-选题素材库.md');
const DEST_DIR = path.resolve('src/content/news');

async function sync() {
    console.log(`📡 Observation Station Syncing...`);

    if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

    const rawContent = fs.readFileSync(SOURCE_FILE, 'utf-8');

    // Regex to find topics in the format: - **Topic X: ...**
    const topicRegex = /- \*\*Topic \d+: (.*?)\*\*\s*- \*\*核心事实\*\*: (.*?)\s*/g;
    let match;
    const newsBatch = [];

    while ((match = topicRegex.exec(rawContent)) !== null) {
        const title = match[1].trim();
        const facts = match[2].trim();
        newsBatch.push({ title, facts });
    }

    // Also look for simple bullet points in [2026-xx-xx] sections
    const simpleTopicRegex = /- \*\*(Topic \d+:.*?)\*\*/g;
    // (This is a simplified logic for demonstration; real implementation would be more robust)

    for (const item of newsBatch) {
        const date = new Date();
        const slug = item.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 50);
        const filePath = path.join(DEST_DIR, `${slug}.md`);

        // Skip if already exists
        if (fs.existsSync(filePath)) continue;

        // Simulate AI Critique Logic
        const critique = `> **硅基锐评**: ${item.facts.includes('2nm') ? '2nm 不仅仅是制程的胜利，更是背面供电技术（PowerVia）在民用领域的首次大规模演练。散热大改是意料之中，毕竟物理定律不会因为你是苹果就网开一面。' : '当算力膨胀遇到能源红线，所谓的‘性能’如果不能转化为‘每瓦产出’，那它充其量只是一个昂贵的电暖器。'}`;

        const frontmatter = {
            title: item.title,
            date: date,
            author: "Agent O (Sentinel)",
            summary: item.facts.slice(0, 100) + '...'
        };

        const content = `\n## 行业级情报\n\n${item.facts}\n\n---\n\n${critique}\n\n*本条目由 GJNX 混合猎手自动追踪并归档。*`;

        const fileContent = matter.stringify(content, frontmatter);
        fs.writeFileSync(filePath, fileContent);
        console.log(`✅ News Item Synced: ${item.title}`);
    }
}

sync();
