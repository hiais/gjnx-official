import fs from 'node:fs';
import path from 'node:path';

// CONFIGURATION
const SITE_URL = 'https://www.gjnx.cc';
// SECURITY: Do not hardcode tokens. Read from env or .env file.
import 'dotenv/config'; // Requirement: npm install dotenv
const TOKEN = process.env.BAIDU_TOKEN;

if (!TOKEN) {
    console.error("❌ Error: BAIDU_TOKEN is not set in environment variables.");
    console.log("   Create a .env file with: BAIDU_TOKEN=your_token_here");
    process.exit(1);
}

async function pushToBaidu() {
    console.log('🚀 Starting Baidu SEO Push...');

    // 1. Check for Sitemap
    const sitemapPath = path.join(process.cwd(), 'dist', 'sitemap-0.xml');

    if (!fs.existsSync(sitemapPath)) {
        console.error('❌ Error: dist/sitemap-0.xml not found.');
        console.log('💡 Please run "npm run build" first to generate the sitemap.');
        return;
    }

    // 2. Extract URLs
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    const urls = sitemapContent.match(/<loc>(.*?)<\/loc>/g)?.map(val => val.replace(/<\/?loc>/g, '')) || [];

    if (urls.length === 0) {
        console.warn('⚠️ No URLs found in sitemap.');
        return;
    }

    console.log(`📋 Found ${urls.length} URLs to push:`);
    urls.forEach(url => console.log(`   - ${url}`));

    // 3. Push to Baidu API
    const apiEndpoint = `http://data.zz.baidu.com/urls?site=${SITE_URL}&token=${TOKEN}`;

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: urls.join('\n'),
        });

        const result = await response.json();

        if (result.success) {
            console.log(`\n✅ Push Successful!`);
            console.log(`   Success Count: ${result.success}`);
            console.log(`   Remaining Quota: ${result.remain}`);
        } else {
            console.error('\n❌ Push Failed:', result);
        }

    } catch (error) {
        console.error('\n❌ Network Error:', error);
    }
}

pushToBaidu();
