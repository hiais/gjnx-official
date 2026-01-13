import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import _pinyin from 'pinyin';
const pinyin = _pinyin.pinyin || _pinyin.default || _pinyin;

// --- CONFIGURATION ---
const SOURCE_DIR = path.resolve('../03_Content_Factory/_User_Resources');
const DEST_DIR = path.resolve('src/content/resources');

// Ensure directory exists
if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

function getFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getFiles(fullPath));
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

function generateSlug(title, dateStr) {
    const englishMatches = title.match(/[a-zA-Z0-9]+/g);
    let baseSlug = '';

    if (englishMatches && englishMatches.join('-').length > 5) {
        baseSlug = englishMatches.join('-').toLowerCase();
    } else {
        const py = pinyin(title, { style: pinyin.STYLE_NORMAL, segment: true }).flat().join('-');
        baseSlug = py.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    }

    const cleanDate = dateStr.replace(/-/g, '').slice(0, 8);
    return `${cleanDate}-${baseSlug}`.slice(0, 80);
}

function generateCode(filename) {
    // Simple deterministic code generation for verification
    const hash = filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `GX${(hash % 9000 + 1000)}`;
}

async function sync() {
    console.log(`🚀 Resource Sync Activated`);
    const allFiles = getFiles(SOURCE_DIR);

    for (const filePath of allFiles) {
        const ext = path.extname(filePath).toLowerCase();
        if (ext !== '.md' && ext !== '.pdf') continue;

        const filename = path.basename(filePath);
        const folderName = path.basename(path.dirname(filePath));

        // Skip hidden or system files
        if (filename.startsWith('.')) continue;

        let dateStr = new Date().toISOString().split('T')[0];
        const dateMatch = filename.match(/^(\d{4}-?\d{2}-?\d{2})/);
        if (dateMatch) {
            dateStr = dateMatch[1].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        }

        const title = filename.replace(ext, '').replace(/^\d{8}-?/, '').replace(/_/g, ' ');
        const slug = generateSlug(title, dateStr);
        const category = folderName === '生存地图' ? 'Survival Map' : 'Industry Report';

        let description = `硅基能效专业资源：${title}`;
        let code = generateCode(filename);

        if (ext === '.md') {
            const rawContent = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(rawContent);
            if (data.description) description = data.description;
            else {
                // Extract first 100 chars from content
                description = content.replace(/[#*`]/g, '').trim().slice(0, 150) + '...';
            }
        } else if (ext === '.pdf') {
            description = `技术级深度报告 (PDF)：${title}。包含详细能效数据与行业对比。`;
        }

        const frontmatter = {
            title: title,
            date: new Date(dateStr),
            category: category,
            downloadUrl: `/resources/${slug}`,
            code: "报告", // Unified keyword as requested
            description: description,
        };

        const destPath = path.join(DEST_DIR, `${slug}.md`);
        const fileContent = matter.stringify('', frontmatter);
        fs.writeFileSync(destPath, fileContent);

        console.log(`✅ Synced Resource: ${slug} (${category})`);
    }
}

sync();
