import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import _pinyin from 'pinyin';
const pinyin = _pinyin.pinyin || _pinyin.default || _pinyin;

const SOURCES = [
    // STRATEGY CHECK: Remove '03_Ready' to prevent drafts from leaking. Only sync physically published/archived files.
    path.resolve('../03_Content_Factory/04_Published')
];
const DEST_BASE = path.resolve('src/content');
const ASSET_DEST_BASE = path.resolve('src/assets/images/posts');

if (!fs.existsSync(ASSET_DEST_BASE)) fs.mkdirSync(ASSET_DEST_BASE, { recursive: true });

function getFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const res = path.resolve(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getFiles(res));
        } else if (entry.name.endsWith('.md')) {
            files.push(res);
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

function cleanContent(content) {
    let cleaned = content;

    // 1. Remove WeChat Header
    cleaned = cleaned.replace(/<div[^>]*?>[\s\S]*?设为星标[\s\S]*?<\/div>/gi, '');

    // 2. Remove Labels
    cleaned = cleaned.replace(/<font[^>]*?>[\s\S]*?<\/font>/gi, '');

    // 3. Remove Checklist & Summary Header
    cleaned = cleaned.replace(/### 📝 硅基君的发布清单[\s\S]*?(?=\n#|---)/gi, '');
    cleaned = cleaned.replace(/[\*>] \*\*摘要 \(Digest\)\*\*：[\s\S]*?(?=\n#|---)/gi, '');

    // NOTE: H1 removal is now handled by extractTitleAndCleanH1()

    // 4. Remove Internal Column Headers (e.g., "硅基能效 | 04-电力之冠")
    // Only match single-line patterns to avoid over-deletion
    cleaned = cleaned.replace(/^硅基能效\s*\|\s*\d{2}[-\s][^\n]+$/gm, '');

    // 5. Remove Visual Prompt blocks (very specific patterns only)
    // Pattern 1: [🎨 Visual Prompt] followed by the prompt content until a blank line + heading
    cleaned = cleaned.replace(/\[🎨\s*Visual\s*Prompt\][^\n]*\n(?:(?!##)[^\n]*\n){0,10}/gi, '');

    // Pattern 2: Structured prompt with Subject/Modifiers/Style/Parameters on consecutive lines
    cleaned = cleaned.replace(/\*\*Subject\*\*:[^\n]+\n\*\*Modifiers\*\*:[^\n]+\n\*\*Style\*\*:[^\n]+\n\*\*Parameters\*\*:[^\n]+\n?/gi, '');

    // Pattern 3: Plain text version (less common)
    cleaned = cleaned.replace(/^Subject:\s*[^\n]+\nModifiers:\s*[^\n]+\nStyle:\s*[^\n]+\nParameters:\s*[^\n]+$/gm, '');

    // 6. Remove 硅基解读 blocks (all variants including emoji prefixes)
    cleaned = cleaned.replace(/^硅基解读[:：][^\n]+$/gm, '');
    cleaned = cleaned.replace(/^\*{0,2}硅基解读\*{0,2}[:：][^\n]+$/gm, '');
    // With emoji prefix: ⚡ 硅基解读：xxx or ✨ 硅基解读: xxx
    cleaned = cleaned.replace(/^[⚡✨🚀💡🔥]\s*硅基解读[:：][^\n]+$/gm, '');
    // Bold variant: **⚡ 硅基解读：xxx**
    cleaned = cleaned.replace(/^\*{2}[⚡✨🚀💡🔥]?\s*硅基解读[:：][^\n]+\*{2}$/gm, '');

    // 7. Fix malformed Markdown headings (e.g., **## 04. Title** or **## Title)
    // Pattern: Lines starting with ** followed by ## - remove the leading **
    cleaned = cleaned.replace(/^\*{2}(#{1,6}\s)/gm, '$1');
    // Pattern: Headings ending with ** - remove trailing **
    cleaned = cleaned.replace(/(^#{1,6}\s[^\n]+)\*{2}$/gm, '$1');
    // Pattern: Lines that are just "**## xxx" without proper markdown - convert to heading
    cleaned = cleaned.replace(/^\*{2}##\s*(\d+\.?\s*[🔬⚙️🚨🧭📊✅�🎯]\s*[^\n]+)$/gm, '## $1');

    // 8. Remove Footer sections (promotional content, QR codes, etc.)
    const footerMarkers = [
        /### 🎯 交互投票[\s\S]*/gi,
        /## 独家数据[\s\S]*/gi,
        /📌 \*{0,2}关注硅基君[\s\S]*/gi,
        /扫描关注\s*【?硅基能效】?[\s\S]*/gi,
        // Match 🎁 后台回复 with various quote styles: "", "", **, etc.
        /🎁\s*后台回复[\s\S]*?(?:报告|资料)[\s\S]*/gi,
        // Match 🔥 扫码关注 patterns
        /🔥\s*扫码关注[\s\S]*/gi,
        // Match standalone ** around keywords
        /^\*{2,}[^\n]*\*{2,}$/gm,
    ];

    footerMarkers.forEach(marker => {
        cleaned = cleaned.replace(marker, '');
    });

    // 9. Remove ALL image placeholders (broken images, QR codes, etc.)
    // This removes markdown image syntax: ![alt](url) or ![](url)
    cleaned = cleaned.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
    // Also remove HTML img tags
    cleaned = cleaned.replace(/<img[^>]*>/gi, '');

    return cleaned.trim().replace(/\n{3,}/g, '\n\n');
}

/**
 * ROBUST TITLE EXTRACTION (Solution D)
 * Handles all edge cases:
 * - Case 1: Short frontmatter title + Long H1 in body → Use H1
 * - Case 2: Same title in both → Use frontmatter, remove H1
 * - Case 3: Only frontmatter title → Use it
 * - Case 4: Only H1 in body → Use it, remove H1
 * 
 * @param {string} content - Markdown content (after frontmatter)
 * @param {string} frontmatterTitle - Title from YAML frontmatter
 * @param {string} fallbackFilename - Filename to use if no title found
 * @returns {{ title: string, cleanedContent: string }}
 */
function extractTitleAndCleanH1(content, frontmatterTitle, fallbackFilename) {
    // Try to find H1 at the beginning of content (with possible whitespace before)
    // Matches: # Title, # **Title**, # Title 🚀, etc.
    const h1Regex = /^\s*#\s+(.+?)(?:\n|$)/m;
    const match = content.match(h1Regex);

    let bodyH1 = null;
    if (match) {
        // Extract title text, remove markdown formatting like ** or *
        bodyH1 = match[1].trim().replace(/\*\*/g, '').replace(/\*/g, '').trim();
    }

    // Normalize for comparison (remove punctuation and spaces)
    const normalize = (str) => (str || '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');

    // Decision Logic
    let finalTitle;

    if (bodyH1 && frontmatterTitle) {
        // Both exist - use the LONGER one (more complete)
        const normBody = normalize(bodyH1);
        const normFm = normalize(frontmatterTitle);

        if (normBody.length > normFm.length) {
            finalTitle = bodyH1;
            // console.log(`📝 Title upgraded: "${frontmatterTitle.slice(0, 20)}..." → "${bodyH1.slice(0, 30)}..."`);
        } else {
            finalTitle = frontmatterTitle;
        }
    } else if (bodyH1) {
        // Only H1 exists
        finalTitle = bodyH1;
    } else if (frontmatterTitle) {
        // Only frontmatter exists
        finalTitle = frontmatterTitle;
    } else {
        // Neither exists - use filename
        finalTitle = fallbackFilename.replace('.md', '').replace(/^\d{8}-?/, '');
    }

    // Remove ALL H1 headings from the START of content to prevent duplication
    // This handles cases where H1 might appear with or without leading whitespace
    let cleanedContent = content;
    if (match) {
        // Remove the first H1 we found
        cleanedContent = content.replace(h1Regex, '');
    }

    // Also try to remove any H1 that might appear right at the start after cleanup
    cleanedContent = cleanedContent.replace(/^\s*#\s+.+?\n/m, '');

    return { title: finalTitle, cleanedContent: cleanedContent.trim() };
}

function parseMarkdownRobust(raw) {
    try {
        return matter(raw);
    } catch (e) {
        const lines = raw.split(/\r?\n/);
        const data = {};
        let contentStart = 0;
        if (lines[0].trim() === '---') {
            let yamlEnd = -1;
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '---') { yamlEnd = i; break; }
                const match = lines[i].match(/^(\w+):\s*(.*)/);
                if (match) {
                    let val = match[2].trim();
                    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                    data[match[1]] = val;
                }
            }
            contentStart = yamlEnd + 1;
        }
        return { data, content: lines.slice(contentStart).join('\n') };
    }
}

// --- AUTO TAGGING SYSTEM ---
const TAG_RULES = [
    { tag: 'Computing-算力', keywords: ['NVIDIA', 'Blackwell', 'B300', '5090', '显卡', 'GPU', '算力', 'TDP', '4090'] },
    { tag: 'Edge_AI-端侧', keywords: ['NPU', 'AIPC', 'AI手机', '边缘', '端侧', 'Apple Intelligence', 'Copilot', 'AI Agent'] },
    { tag: 'Energy-能效', keywords: ['电池', '续航', '功耗', '电力', 'PUE', '锂电', '快充', '能效', '瓦特', 'W'] },
    { tag: 'Architecture-架构', keywords: ['架构', '拆解', '原理', '晶体管', '2nm', '3nm', '18A', 'FP4', 'SoC'] },
    { tag: 'Signals-趋势', keywords: ['报告', '趋势', '预测', '骗局', '真相', '战争', 'CES', '财报'] },
    { tag: 'OS-系统', keywords: ['iOS', '安卓', 'Android', '鸿蒙', 'HyperOS', 'OriginOS', '系统'] },
    { tag: 'Robot-具身', keywords: ['机器人', 'Optimus', '具身', '电机', '关节'] },
    { tag: 'Tech-硬核', keywords: [] } // Fallback
];

function autoTag(title, content, originalTags) {
    const textToScan = (title + ' ' + content.slice(0, 1000)).toLowerCase(); // Scan title and intro
    const newTags = new Set(Array.isArray(originalTags) ? originalTags : []);

    // Remove 'General' if we find better tags
    if (newTags.has('General') || newTags.size === 0) {
        newTags.delete('General');

        TAG_RULES.forEach(rule => {
            if (rule.keywords.some(k => textToScan.includes(k.toLowerCase()))) {
                newTags.add(rule.tag);
            }
        });

        // Fallback if still empty
        if (newTags.size === 0) newTags.add('Tech-硬核');
    }

    return Array.from(newTags);
}

/**
 * Process content with authoritative date from Closed Loop Table.
 * @param {string} filePath - Path to the markdown file
 * @param {string} authoritativeDate - Date string from 25-内容数据闭环表.md (YYYY-MM-DD format)
 * @returns {object|null} - Processed content or null if blocked
 */
function processContent(filePath, authoritativeDate) {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content: originalContent } = parseMarkdownRobust(rawContent);
    const filename = path.basename(filePath);

    if (filename.includes('trace-') || filename.includes('Debug_') || filename.includes('README')) return null;

    // Content Blacklist - Filter out junk/test files
    const BLACKLIST = ['hello-world', 'untitled', 'mock', 'ppt-2026', 'template'];
    if (BLACKLIST.some(kw => filename.toLowerCase().includes(kw))) return null;

    // --- STRATEGY: USE AUTHORITATIVE DATE FROM CLOSED LOOP TABLE ---
    let dateStr = authoritativeDate;
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        console.warn(`⚠️ Invalid authoritative date for ${filename}. Blocking with future date.`);
        dateStr = '2099-12-31'; // FAIL SAFE: Block
    }

    // --- STRATEGY: 72-HOUR TIME LOCK ---
    const articleDate = new Date(dateStr);
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000)); // 72 hours ago

    if (articleDate > threeDaysAgo) {
        return null;
    }

    // --- SOLUTION D: ROBUST TITLE EXTRACTION ---
    // 1. First, do basic content cleaning (without H1 removal)
    const basicCleaned = cleanContent(originalContent);

    // 2. Extract the best title and remove H1 from content
    const { title, cleanedContent } = extractTitleAndCleanH1(
        basicCleaned,
        data.title,
        filename
    );

    // 3. Generate slug using the extracted title
    const slug = data.website_slug || generateSlug(title, dateStr);

    // Images are now removed in cleanContent() - no need for additional processing
    let processedContent = cleanedContent;

    const cleanDescription = (data.description || '').replace(/<[^>]*>?/gm, '').trim();

    // Trigger Auto-Tagging with the extracted title
    let allTags = autoTag(title, cleanedContent, data.tags);

    // Sanitize Tags (Critical for URL Routing)
    allTags = allTags.map(t => t.replace(/\//g, '-').replace(/\\/g, '-'));

    const finalFrontmatter = {
        title: title, // Use the extracted title (possibly from H1)
        date: new Date(dateStr).toISOString(),
        tags: allTags,
        category: data.category || 'Deep Column',
        description: cleanDescription || cleanedContent.slice(0, 160).replace(/[#*`\n]/g, ' ').trim() + '...',
    };

    return { slug, content: processedContent, frontmatter: finalFrontmatter };
}

// --- CLOSED LOOP VERIFICATION ---
const CLOSED_LOOP_FILE = path.resolve('../04_Management/25-内容数据闭环表.md');

/**
 * Load approved articles from the Closed Loop Table.
 * Returns a Map where key = normalized title, value = authoritative date.
 * ONLY articles with Read Count > 0 are included.
 * @returns {Map<string, string>|null} - Map of approved articles or null on critical error
 */
function getApprovedData() {
    if (!fs.existsSync(CLOSED_LOOP_FILE)) {
        console.error("❌ CRITICAL: Data Ledger (Closed Loop Table) NOT FOUND!");
        return null; // Return null to signal system failure
    }
    const content = fs.readFileSync(CLOSED_LOOP_FILE, 'utf-8');

    // Parse the table line by line for robustness
    const lines = content.split('\n');
    const approvedMap = new Map();

    for (const line of lines) {
        // Skip header and separator lines (more precise matching)
        if (!line.startsWith('|') || line.includes('---') || line.includes('| 日期 |') || line.includes('| Date |')) continue;

        const parts = line.split('|').map(p => p.trim());
        // Expected structure: | Date | Title | Topic | ReadCount | ... |
        // parts[0] is empty (before first |), parts[1] is Date, parts[2] is Title, etc.

        if (parts.length < 5) continue;

        // 1. Extract Date (Source of Truth) - Remove ** formatting
        const dateStr = parts[1].replace(/\*/g, '').trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue; // Skip invalid dates

        // 2. Extract Title
        let title = parts[2].trim();
        title = title.replace(/^《|》$/g, '').trim();
        if (!title || title.length < 3) continue;

        // 3. Extract & Validate Read Count (parts[4])
        const readStr = (parts[4] || '').trim().replace(/,/g, '');
        const readCount = parseInt(readStr, 10);

        // STRATEGY: Read Count > 0 is REQUIRED
        if (isNaN(readCount) || readCount <= 0) {
            // console.log(`📊 Skipped (Read=0 or N/A): ${title}`);
            continue; // Skip: Not verified published (or 0 reads)
        }

        // Normalize title for matching
        const normalized = title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
        if (normalized.length > 2) {
            approvedMap.set(normalized, dateStr);
        }
    }

    if (approvedMap.size === 0) {
        console.warn("⚠️ Data Ledger found but NO valid entries (Read>0). Check data.");
    }

    return approvedMap;
}

const APPROVED_DATA = getApprovedData();

async function sync() {
    console.log(`🤖 Deep Sync Started (Strict Closed Loop Mode)...`);

    // STRICT SAFETY CHECK
    if (APPROVED_DATA === null) {
        console.error("⛔ ABORTING: Cannot confirm published status without Data Ledger.");
        process.exit(1);
    }

    console.log(`📜 Loaded ${APPROVED_DATA.size} verified published articles (Read>0) from Data Ledger.`);

    // PURGE STRATEGY: Clear destination directories to remove stale/future/invalid files
    // This ensures that what we see is EXACTLY what the current logic permits.
    const collections = ['articles', 'knowledge'];
    collections.forEach(col => {
        const dir = path.join(DEST_BASE, col);
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(file => {
                if (file.endsWith('.md')) {
                    fs.unlinkSync(path.join(dir, file));
                }
            });
            console.log(`🧹 Purged existing ${col} files.`);
        }
    });

    const syncedPaths = new Set();
    let totalFiles = 0;
    let skippedNoMatch = 0;
    let skippedTimeLock = 0;

    for (const source of SOURCES) {
        const files = getFiles(source);
        for (const f of files) {
            totalFiles++;
            try {
                // 1. Basic Parse
                const rawContent = fs.readFileSync(f, 'utf-8');
                const { data } = parseMarkdownRobust(rawContent);
                const title = data.title || path.basename(f, '.md');

                // 2. Closed Loop Check & Authoritative Data Retrieval
                const normalizedTitle = title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');

                // Fuzzy Match Logic
                let authoritativeDate = null;

                // Try Exact Match first
                if (APPROVED_DATA.has(normalizedTitle)) {
                    authoritativeDate = APPROVED_DATA.get(normalizedTitle);
                } else {
                    // Try contains match (handles filename prefixes like "20260101-Title")
                    for (const [approvedTitle, approvedDate] of APPROVED_DATA) {
                        if (normalizedTitle.includes(approvedTitle) || approvedTitle.includes(normalizedTitle)) {
                            authoritativeDate = approvedDate;
                            break;
                        }
                    }
                }

                if (!authoritativeDate) {
                    // Not in approved list (or read count was 0)
                    skippedNoMatch++;
                    continue;
                }

                // 3. Process Content (Pass Authoritative Date)
                const result = processContent(f, authoritativeDate);
                if (!result) {
                    skippedTimeLock++; // Time-lock or Blacklist hit
                    continue;
                }

                const { slug, content, frontmatter } = result;
                if (syncedPaths.has(slug)) continue;

                let collection = 'articles';
                if (frontmatter.category === 'Knowledge' || frontmatter.category === '百科') collection = 'knowledge';

                const destPath = path.join(DEST_BASE, collection, `${slug}.md`);
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

                const yamlBody = Object.entries(frontmatter)
                    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                    .join('\n');
                const fileBody = `---\n${yamlBody}\n---\n\n${content}`;

                fs.writeFileSync(destPath, fileBody);
                syncedPaths.add(slug);
                console.log(`✅ Synced: ${frontmatter.title.slice(0, 40)}...`);
            } catch (e) {
                console.error(`❌ Failed ${path.basename(f)}:`, e.message);
            }
        }
    }

    console.log(`\n📊 Sync Summary:`);
    console.log(`   Total Files Scanned: ${totalFiles}`);
    console.log(`   Skipped (Not in Ledger/Read=0): ${skippedNoMatch}`);
    console.log(`   Skipped (Time-Lock <72h): ${skippedTimeLock}`);
    console.log(`✨ Total Verified Articles Available on Website: ${syncedPaths.size}`);
}

sync();
