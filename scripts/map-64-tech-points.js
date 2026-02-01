#!/usr/bin/env node

/**
 * 64技术点映射工具
 * 扫描现有词条，识别哪些对应64技术点
 * 
 * 使用方法:
 *   node scripts/map-64-tech-points.js
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 路径配置
const taxonomyPath = join(projectRoot, 'src/data/wiki-taxonomy.json');
const knowledgeDir = join(projectRoot, 'src/content/knowledge');
const outputPath = join(projectRoot, 'src/data/64-tech-points-mapping.json');

// 读取知识体系配置
let taxonomy;
try {
  const fileContent = readFileSync(taxonomyPath, 'utf-8');
  taxonomy = JSON.parse(fileContent);
} catch (error) {
  console.error(`❌ 无法读取知识体系配置: ${taxonomyPath}`);
  console.error(error.message);
  process.exit(1);
}

// 读取所有知识词条
let knowledgeFiles = [];
try {
  knowledgeFiles = readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));
} catch (error) {
  console.error(`❌ 无法读取知识目录: ${knowledgeDir}`);
  console.error(error.message);
  process.exit(1);
}

// 提取64技术点信息
const techPointsMap = new Map();
taxonomy.dimensions.forEach(dimension => {
  dimension.techPoints.forEach(tp => {
    techPointsMap.set(tp.id, {
      ...tp,
      dimension: dimension.id,
      dimensionCode: dimension.code,
    });
  });
});

// 匹配函数：检查词条是否对应某个技术点
function matchTechPoint(conceptId, title, description, content) {
  const matches = [];
  
  for (const [id, tp] of techPointsMap.entries()) {
    const techName = tp.name.toLowerCase();
    const techSlug = tp.slug.toLowerCase();
    const conceptLower = conceptId.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = (description || '').toLowerCase();
    const contentLower = (content || '').toLowerCase();
    
    // 精确匹配conceptId
    if (tp.conceptId && tp.conceptId === conceptId) {
      matches.push({ id, tp, score: 100, reason: 'exact-concept-id' });
      continue;
    }
    
    // 标题匹配
    if (titleLower.includes(techName) || techName.includes(titleLower)) {
      matches.push({ id, tp, score: 80, reason: 'title-match' });
      continue;
    }
    
    // Slug匹配
    if (conceptLower === techSlug || conceptLower.includes(techSlug) || techSlug.includes(conceptLower)) {
      matches.push({ id, tp, score: 75, reason: 'slug-match' });
      continue;
    }
    
    // 描述匹配
    if (descLower.includes(techName) || techName.includes(descLower)) {
      matches.push({ id, tp, score: 60, reason: 'description-match' });
      continue;
    }
    
    // 内容匹配（提取技术点名称的关键词）
    const keywords = techName.split(/[\/\s\(\)]/).filter(k => k.length > 2);
    const matchedKeywords = keywords.filter(k => contentLower.includes(k));
    if (matchedKeywords.length >= keywords.length * 0.5) {
      matches.push({ id, tp, score: 50, reason: 'content-keywords' });
    }
  }
  
  // 返回得分最高的匹配
  if (matches.length > 0) {
    matches.sort((a, b) => b.score - a.score);
    return matches[0];
  }
  
  return null;
}

// 处理所有词条
const mapping = {
  version: '1.0',
  lastUpdated: new Date().toISOString(),
  mappings: [],
  statistics: {
    totalConcepts: knowledgeFiles.length,
    mappedConcepts: 0,
    unmappedConcepts: 0,
    core64Count: 0,
  }
};

console.log(`\n🔍 开始扫描 ${knowledgeFiles.length} 个词条...\n`);

for (const file of knowledgeFiles) {
  const filePath = join(knowledgeDir, file);
  const conceptId = file.replace('.md', '');
  
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);
    
    const title = frontmatter.title || '';
    const description = frontmatter.description || '';
    
    // 尝试匹配技术点
    const match = matchTechPoint(conceptId, title, description, content);
    
    if (match) {
      mapping.mappings.push({
        conceptId,
        techPointId: match.id,
        techPointName: match.tp.name,
        dimension: match.tp.dimension,
        dimensionCode: match.tp.dimensionCode,
        matchScore: match.score,
        matchReason: match.reason,
        status: 'mapped',
      });
      mapping.statistics.mappedConcepts++;
      mapping.statistics.core64Count++;
      console.log(`✅ ${conceptId} → ${match.tp.name} (${match.tp.dimensionCode}-${match.id}, score: ${match.score})`);
    } else {
      mapping.mappings.push({
        conceptId,
        techPointId: null,
        techPointName: null,
        dimension: null,
        dimensionCode: null,
        matchScore: 0,
        matchReason: null,
        status: 'unmapped',
      });
      mapping.statistics.unmappedConcepts++;
    }
  } catch (error) {
    console.error(`⚠️  处理文件失败: ${file}`);
    console.error(`   ${error.message}`);
  }
}

// 生成技术点状态报告
const techPointsStatus = [];
for (const [id, tp] of techPointsMap.entries()) {
  const mapped = mapping.mappings.find(m => m.techPointId === id);
  techPointsStatus.push({
    id,
    name: tp.name,
    slug: tp.slug,
    dimension: tp.dimension,
    dimensionCode: tp.dimensionCode,
    conceptId: mapped?.conceptId || tp.conceptId || null,
    status: mapped ? 'mapped' : (tp.status || 'missing'),
    matchScore: mapped?.matchScore || 0,
  });
}

mapping.techPointsStatus = techPointsStatus;

// 保存映射结果
try {
  writeFileSync(outputPath, JSON.stringify(mapping, null, 2), 'utf-8');
  console.log(`\n✅ 映射结果已保存到: ${outputPath}\n`);
} catch (error) {
  console.error(`❌ 无法保存映射结果: ${outputPath}`);
  console.error(error.message);
  process.exit(1);
}

// 输出统计信息
console.log('\n📊 映射统计:');
console.log(`   总词条数: ${mapping.statistics.totalConcepts}`);
console.log(`   已映射: ${mapping.statistics.mappedConcepts} (64技术点)`);
console.log(`   未映射: ${mapping.statistics.unmappedConcepts}`);
console.log(`   64技术点覆盖率: ${((mapping.statistics.core64Count / 64) * 100).toFixed(1)}%\n`);

// 输出缺失的技术点
const missingTechPoints = techPointsStatus.filter(tp => tp.status === 'missing' || tp.status === 'unmapped');
if (missingTechPoints.length > 0) {
  console.log(`⚠️  缺失的64技术点 (${missingTechPoints.length}个):`);
  missingTechPoints.slice(0, 10).forEach(tp => {
    console.log(`   - ${tp.dimensionCode}-${tp.id}: ${tp.name}`);
  });
  if (missingTechPoints.length > 10) {
    console.log(`   ... 还有 ${missingTechPoints.length - 10} 个`);
  }
  console.log('');
}

process.exit(0);

