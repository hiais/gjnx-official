#!/usr/bin/env node

/**
 * 数据验证脚本
 * 验证 chips.json 数据是否符合 Schema 定义
 * 
 * 使用方法:
 *   node scripts/validate-data.js
 *   npm run validate:data (如果配置在package.json中)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const chipsPath = join(projectRoot, 'src/data/chips.json');

// 读取数据
let chips;
try {
  const fileContent = readFileSync(chipsPath, 'utf-8');
  chips = JSON.parse(fileContent);
} catch (error) {
  console.error(`❌ 无法读取文件: ${chipsPath}`);
  console.error(error.message);
  process.exit(1);
}

// 验证规则
const errors = [];
const warnings = [];

// 验证单个芯片数据
function validateChipData(chip, index) {
  const chipErrors = [];
  const chipWarnings = [];
  const chipId = chip.id || `[index ${index}]`;

  // 1. 验证 id
  if (!chip.id) {
    chipErrors.push(`缺少 id 字段`);
  } else if (!/^[a-z0-9-]+$/.test(chip.id)) {
    chipErrors.push(`id 格式错误: "${chip.id}" (应为小写字母+数字+连字符)`);
  } else if (chip.id.length < 3 || chip.id.length > 50) {
    chipErrors.push(`id 长度错误: "${chip.id}" (应为3-50字符)`);
  }

  // 2. 验证 name
  if (!chip.name) {
    chipErrors.push(`缺少 name 字段`);
  } else if (chip.name.length < 5 || chip.name.length > 100) {
    chipErrors.push(`name 长度错误: "${chip.name}" (应为5-100字符)`);
  }

  // 3. 验证 process
  if (!chip.process) {
    chipErrors.push(`缺少 process 字段`);
  }

  // 4. 验证 type
  const validTypes = ['mobile', 'desktop', 'gpu', 'laptop'];
  if (!chip.type) {
    chipErrors.push(`缺少 type 字段`);
  } else if (!validTypes.includes(chip.type)) {
    chipWarnings.push(`type 值不在标准枚举中: "${chip.type}" (标准值: ${validTypes.join(', ')})`);
  }

  // 5. 验证 data_points
  if (!chip.data_points) {
    chipErrors.push(`缺少 data_points 字段`);
  } else if (!Array.isArray(chip.data_points)) {
    chipErrors.push(`data_points 必须是数组`);
  } else if (chip.data_points.length === 0) {
    chipErrors.push(`data_points 数组不能为空`);
  } else {
    // 验证每个数据点
    chip.data_points.forEach((point, pointIndex) => {
      if (!point.watts && point.watts !== 0) {
        chipErrors.push(`data_points[${pointIndex}].watts 缺失`);
      } else if (typeof point.watts !== 'number') {
        chipErrors.push(`data_points[${pointIndex}].watts 必须是数字`);
      } else if (point.watts <= 0) {
        chipErrors.push(`data_points[${pointIndex}].watts 必须为正数 (当前: ${point.watts})`);
      } else if (point.watts < 0.1 || point.watts > 500) {
        chipWarnings.push(`data_points[${pointIndex}].watts 超出建议范围 (0.1-500): ${point.watts}`);
      }

      if (!point.score && point.score !== 0) {
        chipErrors.push(`data_points[${pointIndex}].score 缺失`);
      } else if (typeof point.score !== 'number') {
        chipErrors.push(`data_points[${pointIndex}].score 必须是数字`);
      } else if (point.score <= 0) {
        chipErrors.push(`data_points[${pointIndex}].score 必须为正数 (当前: ${point.score})`);
      } else if (point.score < 1 || point.score > 10000) {
        chipWarnings.push(`data_points[${pointIndex}].score 超出建议范围 (1-10000): ${point.score}`);
      }

      if (!point.scenario) {
        chipErrors.push(`data_points[${pointIndex}].scenario 缺失`);
      } else if (typeof point.scenario !== 'string') {
        chipErrors.push(`data_points[${pointIndex}].scenario 必须是字符串`);
      }
    });
  }

  // 6. 验证 last_updated
  if (!chip.last_updated) {
    chipWarnings.push(`缺少 last_updated 字段 (建议添加)`);
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(chip.last_updated)) {
    chipErrors.push(`last_updated 格式错误: "${chip.last_updated}" (应为 YYYY-MM-DD)`);
  } else {
    // 验证日期有效性
    const date = new Date(chip.last_updated);
    if (isNaN(date.getTime())) {
      chipErrors.push(`last_updated 无效日期: "${chip.last_updated}"`);
    }
  }

  // 7. 检查额外字段 (警告)
  const allowedFields = ['id', 'name', 'process', 'type', 'data_points', 'last_updated', 'battery_drain_factor'];
  const extraFields = Object.keys(chip).filter(key => !allowedFields.includes(key));
  if (extraFields.length > 0) {
    chipWarnings.push(`包含未定义的字段: ${extraFields.join(', ')}`);
  }

  return { errors: chipErrors, warnings: chipWarnings };
}

// 验证所有数据
console.log('🔍 开始验证数据...\n');

// 检查是否为数组
if (!Array.isArray(chips)) {
  console.error('❌ 数据必须是数组格式');
  process.exit(1);
}

// 验证每个芯片
chips.forEach((chip, index) => {
  const { errors: chipErrors, warnings: chipWarnings } = validateChipData(chip, index);
  
  if (chipErrors.length > 0) {
    errors.push({
      chip: chip.id || `[index ${index}]`,
      index,
      errors: chipErrors
    });
  }
  
  if (chipWarnings.length > 0) {
    warnings.push({
      chip: chip.id || `[index ${index}]`,
      index,
      warnings: chipWarnings
    });
  }
});

// 检查ID唯一性
const ids = chips.map(chip => chip.id).filter(Boolean);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length > 0) {
  errors.push({
    chip: '全局检查',
    index: -1,
    errors: [`发现重复的 id: ${[...new Set(duplicateIds)].join(', ')}`]
  });
}

// 输出结果
if (warnings.length > 0) {
  console.log('⚠️  警告:\n');
  warnings.forEach(({ chip, warnings: chipWarnings }) => {
    console.log(`  ${chip}:`);
    chipWarnings.forEach(warning => {
      console.log(`    - ${warning}`);
    });
    console.log('');
  });
}

if (errors.length > 0) {
  console.error('❌ 验证失败:\n');
  errors.forEach(({ chip, errors: chipErrors }) => {
    console.error(`  ${chip}:`);
    chipErrors.forEach(error => {
      console.error(`    - ${error}`);
    });
    console.error('');
  });
  console.error(`\n共发现 ${errors.reduce((sum, e) => sum + e.errors.length, 0)} 个错误`);
  process.exit(1);
} else {
  console.log('✅ 数据验证通过!');
  if (warnings.length > 0) {
    console.log(`⚠️  有 ${warnings.reduce((sum, w) => sum + w.warnings.length, 0)} 个警告，建议修复`);
  }
  console.log(`\n验证了 ${chips.length} 个产品数据`);
  process.exit(0);
}


