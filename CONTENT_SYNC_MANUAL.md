# 硅基能效官网：全量同步机制详解 (Sync Protocol V6.0)
> **Status**: FINAL / AUTO-PILOT
> **Philosophy**: Zero-Touch Intelligence

经过专家级重构，我们已实现了 **"所写即所得"** 的全自动生态。
您要求的 "专栏文章自动生成通识"，现已完美实现。

---

## 1. 核心机制 (One Command)

所有魔法都封装在同一个命令中：
```bash
npm run sync:all
```
*(GitHub Actions 也会在云端自动执行此命令)*

---

## 2. 通识百科：全自动繁衍 (Self-Reproducing Wiki)

这是系统中最精彩的部分。**您不再需要手动维护任何 JSON 文件。**

### 2.1 触发机制 (Trigger)
只要您在【深度专栏】的文章中，按照严谨的技术格式书写：
> **...英伟达的 NPU (神经处理单元) 在此次测试中...**

系统会自动识别 `NPU (神经处理单元)` 这个模式。

### 2.2 幕后流水线 (The Pipeline)
当您点击同步时，后台会瞬间发生以下化学反应：

1.  **Sync Content**: 先把您的文章搬运上线。
2.  **Auto-Mining (新功能)**: `analyze-terms.js` 立即扫描新文章。
    *   发现 `NPU (神经处理单元)`。
    *   检查 `glossary.json`：没有？👉 **自动写入！**
    *   *AI还会自动摘录该词所在的上下文句子作为例句。*
3.  **Wiki Gen**: `generate-wiki.js` 发现金库里多了个 NPU。
    *   👉 **自动生成 `knowledge/npu.md` 页面。**

### 2.3 结果
您只写了一篇文章，但网站上自动多了一个 "NPU" 的百科词条。

---

## 3. 情报站：纯云端抓取 (Cloud Radar)

*   **驱动**：GitHub Actions + `fetch-hotspots.js`
*   **来源**：全球 Tech RSS
*   **动作**：每6小时自动更新 `hotspots.json`。
*   **您的工作**：零。喝咖啡即可。

---

## 4. 深度专栏与资源 (Manual Control)

这两块依然保持"严谨发布"原则：
*   **专栏**：`04_Published` + 闭环表登记。
*   **资源**：`_User_Resources` 直接上传。

---

## 5. 常见问题 (FAQ)

**Q: 怎么定义“严谨格式”？**
A: 必须是 `英文缩写 (中文全称)` 的格式，例如 `TDP (热设计功耗)`。
如果写成 `TDP，即热设计功耗`，脚本会认为这不是定义，从而忽略（防止生成垃圾）。

**Q: 我想修改自动生成的词条怎么办？**
A: 您有两个选择：
1.  (推荐) 在 `src/data/glossary.json` 里直接修饰润色。
2.  (高级) 在 `04_Published` 里写一篇同名的深度文章（如 `TDP.md`），归类为 `Knowledge`，它会直接覆盖掉自动生成的词条。
