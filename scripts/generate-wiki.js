import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const DEST_DIR = path.resolve('src/content/knowledge');

const DATA_FILE = path.resolve('src/data/glossary.json');

async function generate() {
    console.log(`🧠 AI Wiki Generator Activated`);

    if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

    if (!fs.existsSync(DATA_FILE)) {
        console.error(`❌ Glossary data file not found: ${DATA_FILE}`);
        return;
    }

    const glossaryData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    console.log(`📚 Loaded ${glossaryData.length} terms from glossary library.`);

    for (const entry of glossaryData) {
        const slug = entry.title.split('(')[0].trim().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const filePath = path.join(DEST_DIR, `${slug}.md`);

        const frontmatter = {
            title: entry.title,
            date: new Date(),
            category: entry.category,
            tags: entry.tags || [],
            description: entry.description
        };

        // Build structured content
        let content = `\n> [!NOTE]\n> ${entry.description}\n\n`;

        if (entry.explanation) {
            content += `## 💡 核心解析\n${entry.explanation}\n\n`;
        }

        if (entry.metrics && entry.metrics.length > 0) {
            content += `## 📊 关键指标\n`;
            entry.metrics.forEach(m => {
                content += `- **${m.split(':')[0]}**: ${m.split(':')[1] || ''}\n`;
            });
            content += `\n`;
        }

        if (entry.context) {
            content += `## 🚀 硅基视角\n${entry.context}\n\n`;
        }

        content += `---\n*本条目由 GJNX AI 引擎自动挖掘并生成，旨在构建《硅基能效通识》知识体系。*`;

        const fileContent = matter.stringify(content, frontmatter);
        fs.writeFileSync(filePath, fileContent);
        console.log(`✅ Wiki Entry Created: ${entry.title}`);
    }
}

generate();
