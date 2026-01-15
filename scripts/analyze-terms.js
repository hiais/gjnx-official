
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ARTICLES_DIR = path.resolve('src/content/articles');
const GLOSSARY_FILE = path.resolve('src/data/glossary.json');

// Blacklist to prevent noise
const BLACKLIST = new Set([
    'CEO', 'CTO', 'CFO', 'COO', 'VP', 'HR', 'PR', 'PM',
    'PDF', 'JPG', 'PNG', 'GIF', 'SVG',
    'HTTP', 'HTTPS', 'COM', 'NET', 'ORG', 'WWW',
    'USA', 'UK', 'CN', 'EU', 'US',
    'CES', 'MWC', 'IFA',
    'LOG', 'DOC', 'TXT', 'MD',
    'THIS', 'THAT', 'WITH'
]);

// Helper to get all markdown files
function getFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).flatMap(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) return getFiles(fullPath);
        return file.endsWith('.md') ? fullPath : [];
    });
}

async function mine() {
    console.log(`⛏️  Auto-Mining Terms from Articles...`);

    // 1. Load Existing Glossary
    let glossary = [];
    if (fs.existsSync(GLOSSARY_FILE)) {
        glossary = JSON.parse(fs.readFileSync(GLOSSARY_FILE, 'utf-8'));
    }
    const existingTerms = new Set(glossary.map(g => g.title.toUpperCase().split('(')[0].trim()));

    // 2. Scan Articles
    const files = getFiles(ARTICLES_DIR);
    const newEntries = [];

    files.forEach(file => {
        const raw = fs.readFileSync(file, 'utf-8');
        const { content } = matter(raw);

        // Strict Pattern: "NPU (神经处理单元)" OR "HBM3 (高带宽内存)"
        // Captures Tech Term (Group 1) and Chinese Definition (Group 2)
        // Improved Regex: Allows Numbers, Lowercase (PCIe), Hyphens (Wi-Fi), Dots (Web 3.0)
        // AND Chinese Parentheses Support: ( or （
        const regex = /\b([a-zA-Z0-9\-\.]{2,15})\s*[\(\（]([\u4e00-\u9fa5]{2,30})[\)\）]/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            const term = match[1].trim();
            const definition = match[2].trim();

            if (BLACKLIST.has(term)) continue;
            if (existingTerms.has(term)) continue;

            // Context Extraction (Sentence around the term)
            const index = match.index;
            const contextStart = Math.max(0, index - 50);
            const contextEnd = Math.min(content.length, index + 100);
            const rawContext = content.slice(contextStart, contextEnd);
            // Clean up context (remove partial markdown)
            const cleanContext = '...' + rawContext.replace(/\n/g, ' ').replace(/[#*]/g, '') + '...';

            // Add to new entries
            existingTerms.add(term); // Prevent dupes in same run
            newEntries.push({
                title: `${term} (${definition})`, // Always normalize to English ()
                category: 'Auto-Mined',
                description: `全称：${term}，中文释义：${definition}。`,
                explanation: `该术语自动提取自深度专栏文章。`,
                context: cleanContext,
                tags: ['Auto-Gen', term]
            });
            console.log(`💎 Discovered: ${term} = ${definition}`);
        }
    });

    // 3. Save if new found
    if (newEntries.length > 0) {
        const updatedGlossary = [...glossary, ...newEntries];
        fs.writeFileSync(GLOSSARY_FILE, JSON.stringify(updatedGlossary, null, 2));
        console.log(`✅ Automatically enriched Glossary with ${newEntries.length} new terms.`);
    } else {
        console.log(`✨ No new qualified terms found.`);
    }
}

mine();
