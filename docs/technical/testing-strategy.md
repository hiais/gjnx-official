# 测试策略

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **维护者**: QA Team

## 测试原则

### 核心原则
1. **测试金字塔**: 单元测试 > 集成测试 > E2E 测试
2. **自动化优先**: 尽可能自动化测试
3. **持续测试**: 每次代码变更都运行测试
4. **快速反馈**: 测试结果快速反馈给开发者

### 测试目标
- **覆盖率**: 核心组件覆盖率 > 80%
- **关键路径**: 100% 覆盖
- **稳定性**: 测试通过率 > 95%

## 测试类型

### 1. 单元测试 (Unit Tests)

**工具**: Vitest  
**范围**: 组件功能、工具函数、数据验证

#### 测试示例
```typescript
// src/components/__tests__/EfficiencyCalculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateEfficiency } from '../EfficiencyCalculator.astro';

describe('EfficiencyCalculator', () => {
  it('should calculate efficiency correctly', () => {
    const result = calculateEfficiency(100, 10);
    expect(result).toBe(10);
  });

  it('should handle zero values', () => {
    const result = calculateEfficiency(0, 10);
    expect(result).toBe(0);
  });
});
```

#### 覆盖率目标
- 核心组件: > 80%
- 工具函数: > 90%
- 数据验证: 100%

### 2. 集成测试 (Integration Tests)

**工具**: Vitest + @astrojs/testing  
**范围**: 页面渲染、组件交互、数据流

#### 测试示例
```typescript
// src/pages/__tests__/index.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '@astrojs/testing';

describe('Homepage', () => {
  it('should render correctly', async () => {
    const result = await render('./src/pages/index.astro');
    expect(result.html).toContain('硅基能效');
  });
});
```

### 3. E2E 测试 (End-to-End Tests)

**工具**: Playwright  
**范围**: 用户流程、关键路径、跨浏览器兼容性

#### 测试示例
```typescript
// tests/e2e/user-flows.spec.ts
import { test, expect } from '@playwright/test';

test('用户查找技术原理流程', async ({ page }) => {
  // 1. 访问首页
  await page.goto('/');
  
  // 2. 点击知识库
  await page.click('text=知识库');
  
  // 3. 选择分类
  await page.click('text=芯片制程');
  
  // 4. 验证页面加载
  await expect(page).toHaveURL(/\/knowledge\/chip-process/);
  await expect(page.locator('h1')).toContainText('芯片制程');
});
```

#### 关键路径测试
- ✅ 用户查找技术原理流程
- ✅ 用户对比产品流程
- ✅ 用户阅读新闻流程

### 4. 性能测试 (Performance Tests)

**工具**: Lighthouse CI  
**范围**: 页面性能、资源加载、Core Web Vitals

#### 配置示例
```yaml
# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4321/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

## 测试数据管理

### 测试数据位置
- `src/data/chips.test.json`: 测试用产品数据
- `src/content/articles/test-*.md`: 测试用文章
- `tests/fixtures/`: 测试固件数据

### 测试数据规则
- ✅ 测试数据必须符合生产 Schema
- ✅ 测试数据必须标记为测试（`test: true`）
- ✅ 测试数据不应部署到生产环境
- ✅ 测试数据应覆盖边界情况

### 测试数据示例
```json
// src/data/chips.test.json
[
  {
    "id": "test-chip-1",
    "name": "Test Chip",
    "process": "TSMC N3E",
    "type": "mobile",
    "data_points": [
      {
        "watts": 3.5,
        "score": 2100,
        "scenario": "Daily"
      }
    ],
    "last_updated": "2025-01-01",
    "test": true
  }
]
```

## 测试工具配置

### Vitest 配置
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'tests/'],
    },
  },
});
```

### Playwright 配置
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
```

## 测试执行

### 本地测试
```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行 E2E 测试
npm run test:e2e

# 运行性能测试
npm run test:performance

# 生成覆盖率报告
npm run test:coverage
```

### CI/CD 测试
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:e2e
```

## 缺陷管理

### 缺陷分类
- **P0（阻塞）**: 系统无法使用，必须立即修复
- **P1（严重）**: 核心功能不可用，24小时内修复
- **P2（一般）**: 功能异常但不影响核心流程，1周内修复
- **P3（轻微）**: 界面问题、优化建议，按计划修复

### 缺陷报告格式
```markdown
## 缺陷报告

### 标题
[简洁描述缺陷]

### 严重程度
[P0/P1/P2/P3]

### 复现步骤
1. [步骤1]
2. [步骤2]
3. [步骤3]

### 预期结果
[应该发生什么]

### 实际结果
[实际发生了什么]

### 环境信息
- 浏览器: [Chrome/Firefox/Safari]
- 操作系统: [Windows/macOS/Linux]
- 设备: [Desktop/Mobile]

### 截图/日志
[如有]
```

### 缺陷修复流程
1. **确认**: 确认缺陷存在
2. **分配**: 分配优先级和负责人
3. **修复**: 修复缺陷并编写测试
4. **验证**: 验证修复效果
5. **关闭**: 关闭缺陷并记录

## 回归测试

### 自动化回归测试
- **每次 PR**: 运行完整测试套件
- **关键路径**: 必须 100% 通过
- **性能测试**: 性能不能下降 > 5%

### 手动回归测试
- **重大功能更新**: 手动测试关键流程
- **浏览器兼容性**: 测试主流浏览器
- **移动端测试**: 测试移动端关键功能

### 回归测试清单
- [ ] 所有单元测试通过
- [ ] 所有集成测试通过
- [ ] 所有 E2E 测试通过
- [ ] 性能测试通过
- [ ] 浏览器兼容性测试通过
- [ ] 移动端测试通过

## 测试覆盖率

### 覆盖率目标
- **总体覆盖率**: > 70%
- **核心组件**: > 80%
- **工具函数**: > 90%
- **数据验证**: 100%

### 覆盖率报告
```bash
# 生成覆盖率报告
npm run test:coverage

# 查看 HTML 报告
open coverage/index.html
```

## AI Agent 测试指南

### AI 生成代码测试要求
- ✅ 所有新组件必须有单元测试
- ✅ 所有新功能必须有集成测试
- ✅ 关键路径必须有 E2E 测试
- ✅ 测试覆盖率必须达标

### AI 测试检查清单
- [ ] 单元测试已编写
- [ ] 集成测试已编写
- [ ] E2E 测试已编写（如需要）
- [ ] 测试通过
- [ ] 覆盖率达标

## 测试最佳实践

### 测试编写
- **AAA 模式**: Arrange（准备）、Act（执行）、Assert（断言）
- **测试隔离**: 每个测试独立，不依赖其他测试
- **测试命名**: 使用描述性名称，说明测试内容
- **测试数据**: 使用测试数据，不依赖生产数据

### 测试维护
- **定期审查**: 定期审查测试用例
- **删除冗余**: 删除重复和无效的测试
- **更新测试**: 功能变更时更新测试
- **性能优化**: 优化慢速测试

## 变更日志

### v1.0.0 (2025-01-01)
- 初始测试策略文档
- 定义测试类型和工具
- 建立测试数据管理规范
- 建立缺陷管理流程
- 定义测试覆盖率目标

