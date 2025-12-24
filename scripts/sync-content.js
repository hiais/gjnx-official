import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import pinyin from 'pinyin';

// --- CONFIGURATION ---
const SOURCE_DIR = path.resolve('../03_Content_Factory/01_WeChat/Published');
const DEST_DIR = path.resolve('src/content/articles');

// 🛡️ SAFETY VALVE: Max new articles per run to prevent flooding
const MAX_NEW_PER_RUN = 5;

// Recursively get all files
function getFiles(dir) {
    const subdirs = fs.readdirSync(dir);
    const files = [];
    subdirs.forEach(file => {
        const res = path.resolve(dir, file);
        return fs.statSync(res).isDirectory() ? files.push(...getFiles(res)) : files.push(res);
    });
    return files;
}

// Generate a SEO-friendly slug
function generateSlug(title, dateObj) {
    const englishMatches = title.match(/[a-zA-Z0-9]+/g);
    let baseSlug = '';

    if (englishMatches && englishMatches.join('-').length > 5) {
        baseSlug = englishMatches.join('-').toLowerCase();
    } else {
        const py = pinyin(title, { style: pinyin.STYLE_NORMAL, segment: true }).flat().join('-');
        baseSlug = py.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    }

    const dateStr = dateObj ? new Date(dateObj).toISOString().split('T')[0].replace(/-/g, '') : '20250101';
    return `${dateStr}-${baseSlug}`.slice(0, 80);
}

function cleanWeChatContent(content) {
    let cleaned = content;
    cleaned = cleaned.replace(/<div.*?点击.*?硅基能效.*?<\/div>/gis, '');
    cleaned = cleaned.replace(/<font.*?>(.*?)<\/font>/gis, '$1');
    cleaned = cleaned.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => `![${alt}](${url.split('?')[0]})`);
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned;
}

async function sync() {
    console.log('🤖 Auto-Curator Agent Active (Safety Mode On)...');
    console.log(`📂 Scanning Source: ${SOURCE_DIR}`);

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`❌ Source directory not found`);
        return;
    }

    const allFiles = getFiles(SOURCE_DIR);
    const markdownFiles = allFiles.filter(f => f.endsWith('.md'));

    let stats = { scanned: 0, dropped: 0, new_synced: 0, updated: 0, skipped: 0, deleted: 0 };

    for (const filePath of markdownFiles) {
        stats.scanned++;
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const parsed = matter(fileContent);

        // --- RECALL MECHANISM (倒挡: 自动删除) ---
        // If sync: false, we ensure it does NOT exist on the website
        if (parsed.data.sync === false) {
            if (parsed.data.website_slug) {
                const destPath = path.join(DEST_DIR, `${parsed.data.website_slug}.md`);
                if (fs.existsSync(destPath)) {
                    fs.unlinkSync(destPath);
                    console.log(`🗑️  Recalled (Deleted): ${parsed.data.title}`);
                    stats.deleted++;
                }
            }
            stats.dropped++;
            continue;
        }

        // --- QUALITY COP (AI 智能选品) ---
        if (parsed.data.sync !== true) {
            const contentLen = parsed.content.length;
            const title = parsed.data.title || '';

            // Rules: Length > 800, No "Notice" keywords, Must have headers
            if (contentLen < 800 || /通知|招聘|周报|快讯/.test(title) || !parsed.content.includes('# ')) {
                stats.dropped++;
                continue;
            }
        }

        // --- EXECUTING SYNC ---

        // 1. Auto-Tagging
        let hasChanges = false;
        let slug = parsed.data.website_slug;

        if (!slug) {
            slug = generateSlug(parsed.data.title || 'untitled', parsed.data.date);
            parsed.data.website_slug = slug;
            hasChanges = true;
        }
        if (!parsed.data.date) {
            parsed.data.date = new Date();
            hasChanges = true;
        }

        if (hasChanges) {
            const updatedFileContent = matter.stringify(parsed.content, parsed.data);
            fs.writeFileSync(filePath, updatedFileContent);
            // console.log(`🏷️  Tagged: "${parsed.data.title}"`);
        }

        // 2. Write to Website Directory
        const destPath = path.join(DEST_DIR, `${slug}.md`);
        const isNewArticle = !fs.existsSync(destPath);

        // 🛡️ SAFETY VALVE Check (流量控制)
        if (isNewArticle && stats.new_synced >= MAX_NEW_PER_RUN) {
            // console.log(`⏳ Safety Limit Reached. Skipping new: ${parsed.data.title}`);
            continue;
        }

        const newFrontmatter = {
            title: parsed.data.title,
            date: parsed.data.date,
            tags: parsed.data.tags || [],
            description: parsed.data.description || parsed.content.slice(0, 120).replace(/[#*]/g, '').trim() + '...',
        };

        const newContentBody = cleanWeChatContent(parsed.content);
        const newFileContent = matter.stringify(newContentBody, newFrontmatter);

        // Idempotency check
        if (!isNewArticle) {
            const existing = fs.readFileSync(destPath, 'utf-8');
            if (existing === newFileContent) {
                stats.skipped++;
                continue;
            }
            stats.updated++;
            console.log(`📝 Updated: ${slug}`);
        } else {
            stats.new_synced++;
            console.log(`✨ New Sync: ${slug}`);
        }

        fs.writeFileSync(destPath, newFileContent);
    }

    console.log('\n=============================================');
    console.log(`🚀 Curated Sync Report:`);
    console.log(`   Scanned: ${stats.scanned}`);
    console.log(`   Dropped/Recalled: ${stats.dropped + stats.deleted}`);
    console.log(`   ✨ New Synced: ${stats.new_synced} (Limit: ${MAX_NEW_PER_RUN})`);
    console.log(`   📝 Updated: ${stats.updated}`);
    console.log('=============================================');
}

sync();
