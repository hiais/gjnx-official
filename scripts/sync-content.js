import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import _pinyin from 'pinyin';
const pinyin = _pinyin.pinyin || _pinyin.default || _pinyin;

// --- CONFIGURATION ---
const SOURCE_DIR = path.resolve('../03_Content_Factory/03_Ready');
const DEST_BASE = path.resolve('src/content');
const ASSET_DEST_BASE = path.resolve('src/assets/images/posts');

// Ensure directories exist
if (!fs.existsSync(ASSET_DEST_BASE)) fs.mkdirSync(ASSET_DEST_BASE, { recursive: true });

function getFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    const subdirs = fs.readdirSync(dir);
    const files = [];
    subdirs.forEach(file => {
        const res = path.resolve(dir, file);
        return fs.statSync(res).isDirectory() ? files.push(...getFiles(res)) : files.push(res);
    });
    return files;
}

function generateSlug(title, dateStr) {
    // 1. Try to use English words
    const englishMatches = title.match(/[a-zA-Z0-9]+/g);
    let baseSlug = '';

    if (englishMatches && englishMatches.join('-').length > 5) {
        baseSlug = englishMatches.join('-').toLowerCase();
    } else {
        // 2. Fallback to Pinyin
        const py = pinyin(title, { style: pinyin.STYLE_NORMAL, segment: true }).flat().join('-');
        baseSlug = py.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    }

    // Prepend Date: 20260206-slug
    const cleanDate = dateStr.replace(/-/g, '').slice(0, 8);
    return `${cleanDate}-${baseSlug}`.slice(0, 80);
}

function processContent(filePath) {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(rawContent);
    const filename = path.basename(filePath);

    // 1. Extract Date from Filename (e.g., 20260206-Title.md)
    let dateStr = '2025-01-01';
    const dateMatch = filename.match(/^(\d{8})/);
    if (dateMatch) {
        dateStr = `${dateMatch[1].slice(0, 4)}-${dateMatch[1].slice(4, 6)}-${dateMatch[1].slice(6, 8)}`;
    }

    // 2. Generate Slug
    const slug = data.website_slug || generateSlug(data.title || filename.replace('.md', ''), dateStr);

    // 3. Asset Teleportation
    let processedContent = content;
    const assetsDir = path.join(path.dirname(filePath), 'assets');
    const targetAssetDir = path.join(ASSET_DEST_BASE, slug);

    // Find all images: ![alt](assets/xxx.png)
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    let hasImages = false;

    processedContent = processedContent.replace(imgRegex, (match, alt, imgPath) => {
        if (imgPath.startsWith('http')) return match; // Skip external

        // Clean path (handling ./assets or assets/)
        const cleanPath = imgPath.replace(/^\.\//, '');

        // Check if file exists in source
        const sourceImgPath = path.resolve(path.dirname(filePath), cleanPath);

        if (fs.existsSync(sourceImgPath)) {
            // Copy to project assets
            if (!fs.existsSync(targetAssetDir)) fs.mkdirSync(targetAssetDir, { recursive: true });

            const imgFilename = path.basename(cleanPath);
            const targetImgPath = path.join(targetAssetDir, imgFilename);

            fs.copyFileSync(sourceImgPath, targetImgPath);
            hasImages = true;

            // Rewrite standard Markdown path to Astro asset path
            // Note: In Astro content collections, we can use relative paths if images are colocated, 
            // OR use alias. Since we put them in src/assets/images/posts/[slug], 
            // valid path is: /src/assets/images/posts/[slug]/img.png 
            // But better: use relative path from the content file? 
            // Best practice for Astro: Colocate images with content? 
            // Rewrite to relative path for Astro optimization
            // The markdown file is in src/content/articles/[slug].md
            // The image is in src/assets/images/posts/[slug]/img.png
            // Path from article to image: ../../assets/images/posts/[slug]/img.png
            return `![${alt}](../../assets/images/posts/${slug}/${imgFilename})`;
        }
        return match;
    });

    // 4. Normalize metadata
    const cleanDescription = (data.description || '').replace(/<[^>]*>?/gm, '').trim();
    const newFrontmatter = {
        ...data, // Spread existing data first
        title: data.title || path.basename(filePath, '.md'), // Use path.basename(filePath, '.md') for consistency
        date: data.date ? new Date(data.date) : new Date(dateStr), // Use existing date or dateStr
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : ['General']), // Ensure tags is an array
        category: data.category, // Pass through category if exists
        description: cleanDescription || content.slice(0, 120).replace(/[#*`]/g, '').trim() + '...', // Use cleanDescription, fallback to content slice
        // website_slug: slug // No need to save this in frontmatter if filename matches? 
        // Actually Astro uses filename as ID. We will save file as [slug].md
    };

    return { slug, content: processedContent, frontmatter: newFrontmatter };
}

async function sync() {
    console.log(`🤖 Bridge Activated via Node.js ${process.version}`);
    console.log(`📂 Source: ${SOURCE_DIR}`);

    // Articles
    const files = getFiles(SOURCE_DIR).filter(f => f.endsWith('.md'));

    for (const f of files) {
        try {
            const { slug, content, frontmatter } = processContent(f);

            // Content Routing Logic
            let collection = 'articles';
            if (frontmatter.category || content.includes('category:')) {
                // Heuristic: If it has a category, it's Knowledge
                collection = 'knowledge';
                // Ensure category exists for schema validation
                if (!frontmatter.category) frontmatter.category = 'General';
            }

            let destPath;

            if (collection === 'knowledge') {
                // Ensure category is slug-friendly
                const catSlug = (frontmatter.category || 'general').toLowerCase().replace(/[^a-z0-9]/g, '-');
                destPath = path.join(DEST_BASE, collection, catSlug, `${slug}.md`);
                // Update Metadata to reflect true slug structure if needed, 
                // but Astro handles IDs based on path.
            } else {
                destPath = path.join(DEST_BASE, collection, `${slug}.md`);
            }

            // Ensure directory exists
            const destDir = path.dirname(destPath);
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

            const fileContent = matter.stringify(content, frontmatter);
            fs.writeFileSync(destPath, fileContent);
            console.log(`✅ Synced [${collection}]: ${path.relative(DEST_BASE, destPath)}`);
        } catch (e) {
            console.error(`❌ Failed: ${path.basename(f)}`, e.message);
        }
    }
}

sync();
