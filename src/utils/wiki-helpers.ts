/**
 * Wiki系统工具函数
 * 用于处理知识体系相关的数据操作
 */

import type { CollectionEntry } from 'astro:content';
import taxonomyData from '../data/wiki-taxonomy.json';

export type KnowledgeEntry = CollectionEntry<'knowledge'>;

/**
 * 获取词条对应的64技术点信息
 */
export function getTechPointForConcept(conceptId: string) {
  for (const dim of taxonomyData.dimensions) {
    const techPoint = dim.techPoints.find(tp => tp.conceptId === conceptId);
    if (techPoint) {
      return { techPoint, dimension: dim };
    }
  }
  return null;
}

/**
 * 检查词条是否为64核心技术点
 */
export function isCore64Concept(concept: KnowledgeEntry): boolean {
  // 检查显式标记
  if (concept.data.isCore64 === true) {
    return true;
  }
  // 检查taxonomy映射
  return getTechPointForConcept(concept.id) !== null;
}

/**
 * 获取词条所属的维度
 */
export function getDimensionForConcept(concept: KnowledgeEntry) {
  if (concept.data.dimension) {
    return taxonomyData.dimensions.find(d => d.code === concept.data.dimension);
  }
  const techPointInfo = getTechPointForConcept(concept.id);
  return techPointInfo?.dimension || null;
}

/**
 * 获取词条所属的模块
 */
export function getModuleForConcept(concept: KnowledgeEntry) {
  if (concept.data.module) {
    const dimension = getDimensionForConcept(concept);
    if (dimension) {
      return dimension.modules.find(m => m.id === concept.data.module);
    }
    // 也检查通用模块
    return taxonomyData.commonModules.find(m => m.id === concept.data.module);
  }
  return null;
}

/**
 * 获取所有64技术点词条
 */
export function getCore64Concepts(allKnowledge: KnowledgeEntry[]) {
  const core64Concepts: Array<KnowledgeEntry & { techPoint?: any; dimension?: any }> = [];
  
  // 从taxonomy映射中获取
  taxonomyData.dimensions.forEach(dim => {
    dim.techPoints.forEach(tp => {
      if (tp.conceptId) {
        const concept = allKnowledge.find(k => k.id === tp.conceptId);
        if (concept) {
          core64Concepts.push({ ...concept, techPoint: tp, dimension: dim });
        }
      }
    });
  });
  
  // 包含显式标记的
  allKnowledge.forEach(k => {
    if (k.data.isCore64 === true && !core64Concepts.find(c => c.id === k.id)) {
      const techPointInfo = getTechPointForConcept(k.id);
      core64Concepts.push({ 
        ...k, 
        techPoint: techPointInfo?.techPoint,
        dimension: techPointInfo?.dimension
      });
    }
  });
  
  return core64Concepts;
}

/**
 * 按维度组织词条
 */
export function organizeConceptsByDimension(allKnowledge: KnowledgeEntry[]) {
  const map = new Map();
  taxonomyData.dimensions.forEach(dim => {
    const dimConcepts = allKnowledge.filter(k => {
      if (k.data.dimension === dim.code) return true;
      // 也检查通过techPoint映射的
      const techPointInfo = getTechPointForConcept(k.id);
      return techPointInfo?.dimension?.id === dim.id;
    });
    map.set(dim.id, dimConcepts);
  });
  return map;
}

/**
 * 获取相关概念（同模块或同维度）
 */
export function getRelatedConcepts(
  concept: KnowledgeEntry,
  allKnowledge: KnowledgeEntry[],
  limit: number = 6
) {
  const related: KnowledgeEntry[] = [];
  const dimension = getDimensionForConcept(concept);
  const module = getModuleForConcept(concept);
  
  allKnowledge.forEach(k => {
    if (k.id === concept.id) return;
    
    // 同模块优先
    if (module && k.data.module === module.id) {
      related.push(k);
      return;
    }
    
    // 同维度
    if (dimension) {
      const kDimension = getDimensionForConcept(k);
      if (kDimension?.id === dimension.id) {
        related.push(k);
      }
    }
  });
  
  return related.slice(0, limit);
}

