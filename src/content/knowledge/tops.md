---
title: TOPS (万亿次运算每秒)
date: 2026-01-20T14:56:05.277Z
category: 算力指标
tags:
  - 算力峰值
  - AI规格
  - MAC单元
  - 性能虚标
description: Tera Operations Per Second，衡量 AI 算力峰值的粗暴指标。
---

> [!NOTE]
> Tera Operations Per Second，衡量 AI 算力峰值的粗暴指标。

## 💡 核心解析
它是‘并行计算单元数量’与‘时钟频率’的乘积。然而，单纯的 TOPS 毫无意义，因为它没考虑到内存访问效率。一个标称 45 TOPS 但显存带宽受限的 NPU，在运行 LLM 时可能还不如一个 10 TOPS 但具备高位宽总线的旧显卡。真正决定 AI 使用体验的是‘落地的利用率’。

## 📊 关键指标
- **Effective TOPS**:  真实有效算力
- **Quantized Performance**:  定点运算性能对比
- **MAC Density**:  计算单元密度

## 🚀 硅基视角
如果你只看 TOPS 买电脑，那你正中厂商下怀。真正的硬核指标应该是每瓦能跑多少个 Token。记住：堆算力易，省电力难。

---
*本条目由 GJNX AI 引擎自动挖掘并生成，旨在构建《硅基能效通识》知识体系。*
