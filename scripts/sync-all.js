import { execSync } from 'node:child_process';
import path from 'node:path';

const scripts = [
    'scripts/sync-content.js',
    'scripts/sync-resources.js',
    'scripts/generate-wiki.js',
    'scripts/sync-news.js'
];

async function runAll() {
    console.log('🦾 INITIATING_FULL_SYNC_SEQUENCE');
    console.log('-----------------------------------');

    for (const script of scripts) {
        const scriptName = path.basename(script);
        console.log(`\n>> EXECUTING: ${scriptName}`);
        try {
            const output = execSync(`node ${script}`, { stdio: 'inherit' });
            console.log(`✅ ${scriptName} COMPLETED`);
        } catch (error) {
            console.error(`❌ ${scriptName} FAILED`);
            process.exit(1);
        }
    }

    console.log('\n-----------------------------------');
    console.log('✨ ALL_SYSTEMS_SYNCHRONIZED');
}

runAll();
