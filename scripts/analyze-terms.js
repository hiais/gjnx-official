
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ARTICLES_DIR = path.resolve('src/content/articles');
const OUTPUT_FILE = path.resolve('scripts/term-candidates.json');

// Blacklist of common acronyms/words that are NOT technical terms
const BLACKLIST = new Set([
    'THE', 'AND', 'FOR', 'BUT', 'NOT', 'YES', 'NO', 'CAN', 'WHO', 'WHY', 'HOW',
    'CEO', 'CTO', 'CFO', 'COO', 'VP', 'HR', 'PR', 'PM',
    'PDF', 'JPG', 'PNG', 'GIF', 'SVG', 'MP4',
    'HTTP', 'HTTPS', 'COM', 'NET', 'ORG', 'WWW', 'URL', 'API', 'SDK', 'APP',
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
    'USA', 'UK', 'CN', 'EU', 'US',
    'CES', 'MWC', 'IFA', // Events
    'LOG', 'DOC', 'TXT', 'MD',
    'THIS', 'THAT', 'WITH', 'FROM',
    // Common visual prompt keywords
    'VIBE', 'VIEW', 'LENS', 'FILM', 'LIGHT', 'COLOR', 'STYLE', 'RATIO', 'SEED'
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

async function analyze() {
    console.log(`🔍 Scanning articles for technical terms...`);
    const files = getFiles(ARTICLES_DIR);

    const termCounts = new Map();

    files.forEach(file => {
        const raw = fs.readFileSync(file, 'utf-8');
        const { content } = matter(raw);

        // Strategy 1: Match English Acronyms (2-6 chars, e.g., NPU, LLM, DVFS)
        const acronymMatches = content.match(/\b[A-Z]{2,6}\b/g) || [];

        acronymMatches.forEach(term => {
            if (BLACKLIST.has(term)) return;
            // Filter out numbers like "2024" which match [A-Z] if regex was lax, but strict [A-Z] handles it.
            // Wait, \b[A-Z]{2,6}\b only matches letters.

            const count = termCounts.get(term) || 0;
            termCounts.set(term, count + 1);
        });

        // Strategy 2: Match "English (Chinese)" pattern common in definitions
        // e.g. "NPU (神经处理单元)"
        const definitionMatches = content.match(/\b([A-Z]{2,10})\s*\(([\u4e00-\u9fa5]+)\)/g) || [];
        definitionMatches.forEach(match => {
            // Extract just the acronym to boost its score
            const acronym = match.split('(')[0].trim();
            if (BLACKLIST.has(acronym)) return;
            // Bonus weight for explicit definitions
            const count = termCounts.get(acronym) || 0;
            termCounts.set(acronym, count + 5);
        });
    });

    // Sort by frequency
    const sortedTerms = Array.from(termCounts.entries())
        .map(([term, count]) => ({ term, count }))
        .sort((a, b) => b.count - a.count)
        .filter(item => item.count >= 3); // Minimum occurence threshold

    console.log(`📊 Found ${sortedTerms.length} potential terms.`);

    // Save to JSON for "AI" (Agent) to review
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedTerms, null, 2));
    console.log(`💾 Saved candidates to ${OUTPUT_FILE}`);

    // Preview top 20
    console.log('--- Top 20 Candidates ---');
    console.table(sortedTerms.slice(0, 20));
}

analyze();
