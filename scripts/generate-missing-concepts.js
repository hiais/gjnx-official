import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const TAXONOMY_PATH = path.join(__dirname, '../src/data/wiki-taxonomy.json');
const KNOWLEDGE_DIR = path.join(__dirname, '../src/content/knowledge');

// Read taxonomy
const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf8'));

// Counters
let createdCount = 0;
let skippedCount = 0;

console.log('🚀 Starting content generation for missing Core-64 Tech Points...');

// Iterate dimensions
taxonomy.dimensions.forEach(dim => {
    console.log(`\nChecking Dimension: ${dim.name} (${dim.code})...`);

    dim.techPoints.forEach(tp => {
        // 1. Determine target filename
        const slug = tp.slug;
        if (!slug) {
            console.warn(`⚠️  Skipping Tech Point with no slug: ID ${tp.id} (${tp.name})`);
            return;
        }

        // Check if file exists (using slug as filename)
        // Note: Existing concepts might use a different filename (the conceptId). 
        // Ideally we should check if *any* concept maps to this techPointId, but for NEW ones, we use the slug.
        // If wiki-taxonomy says 'mapped' or has a 'conceptId', we assume it's done.

        let isMapped = false;
        if (tp.status === 'mapped' || tp.conceptId) {
            // Double check if the concept file actually exists
            const conceptId = tp.conceptId || slug;
            if (fs.existsSync(path.join(KNOWLEDGE_DIR, `${conceptId}.md`))) {
                isMapped = true;
            } else {
                console.log(`⚠️  Tech Point ${tp.name} claimed mapped to '${conceptId}' but file missing. Re-creating as '${slug}.md'...`);
                isMapped = false;
            }
        }

        if (isMapped) {
            console.log(`✅ [Exists] ${tp.name} -> Mapped to ${tp.conceptId}`);
            skippedCount++;
            return;
        }

        const filePath = path.join(KNOWLEDGE_DIR, `${slug}.md`);
        if (fs.existsSync(filePath)) {
            console.log(`✅ [Exists] ${tp.name} -> File ${slug}.md exists`);
            skippedCount++;
            return;
        }

        // 2. Prepare content
        // Find the module this tech point belongs to (rough heuristic or default)
        // We search the dimension's modules to see if any concepts list match, but likely it's empty.
        // So we pick the first module of the dimension as a fallback, or try to match loose keywords.
        const defaultModule = dim.modules[0];

        const frontmatter = `---
title: ${tp.name}
description: ${dim.name} 核心技术点 - ${tp.name}
category: ${defaultModule ? defaultModule.name : dim.name}
dimension: ${dim.code}
techPointId: ${tp.id}
module: ${defaultModule ? defaultModule.id : ''}
isCore64: true
level: beginner
prerequisites: []
nextSteps: []
---

# ${tp.name}

> ${dim.description}

## 核心概念

这里是关于 **${tp.name}** 的核心概念描述。作为 **${dim.name} (${dim.code})** 维度的第 ${tp.id} 个核心技术点，它在硅基能效体系中扮演着关键角色。

## 技术原理

(待补充技术原理)

## 关键指标

- **指标1**: ...
- **指标2**: ...

## 行业现状

(待补充行业现状)

## 延伸阅读

- 相关词条: ...
`;

        // 3. Write file
        fs.writeFileSync(filePath, frontmatter, 'utf8');
        console.log(`✨ [Created] ${tp.name} -> ${slug}.md`);
        createdCount++;
    });
});

console.log(`\n🎉 Done! Created ${createdCount} files. Skipped ${skippedCount} existing.`);
