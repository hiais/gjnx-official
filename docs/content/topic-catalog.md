# 内容选题目录与技术范围

> **版本**: v1.0.0  
> **最后更新**: 2025-01-01  
> **目标**: 定义各内容类型的具体选题范围和技术目录

## 核心原则

### 能效锚点 (Efficiency Lens)
所有选题必须能回答以下至少一个问题：
1. 它如何影响**功耗 (Power Consumption)**？
2. 它如何影响**每瓦性能 (Performance-per-Watt / PPW)**？
3. 它如何影响**续航 / 使用时长 / 运行成本**？
4. 它触碰了什么**物理极限 (热墙/内存墙/带宽墙)**？
5. 它如何影响**TCO (总拥有成本) / 电费**？

### 7大叙事维度
所有内容必须归属于以下7个维度之一：

| 维度代号 | 维度名称 | 核心关键词 |
|---------|---------|-----------|
| `HW` | 硬件终局 (Hardware Endgame) | 制程、EUV、晶体管、封装 |
| `CMP` | 算力跃迁 (Compute Leap) | GPU、HBM、互连、TCO |
| `EMB` | 具身革命 (Embodied AI) | 机器人、传感器、执行器 |
| `PWR` | 电力之冠 (Energy Crown) | 电池、充电、能量密度 |
| `EDGE` | 端侧异变 (Edge Intelligence) | NPU、端侧AI、隐私计算 |
| `SPACE` | 星际硅基 (Interstellar Silicon) | 卫星、抗辐射、星链 |
| `ANALOG` | 模拟觉醒 (Analog Awakening) | 类脑、光子、存算一体 |

## 技术原理知识库选题范围

### 分类体系

#### 1. 芯片制程 (HW)
**技术目录**:
- 2nm / 1.8nm (Angstrom Era)
- High-NA EUV
- GAA (围栅晶体管)
- Backside Power (背面供电) / PowerVia
- RibbonFET
- FinFET
- TSV (硅通孔)
- CoWoS / Advanced Packaging
- Chiplet (小芯片)
- Glass Substrate (玻璃基板)
- Quantum Tunneling (量子隧穿)

**选题范围**:
- 制程技术原理详解（如：PowerVia技术原理、RibbonFET工作原理）
- 制程演进路线图（如：从FinFET到GAA的技术演进）
- 制程对能效的影响（如：2nm制程的能效提升与物理极限）
- 封装技术解析（如：CoWoS如何突破内存墙）

**示例选题**:
- "PowerVia背面供电技术原理详解"
- "RibbonFET vs FinFET：能效对比分析"
- "CoWoS封装如何突破HBM带宽墙"

#### 2. 能效指标 (PWR + CMP)
**技术目录**:
- PPW (Performance-per-Watt)
- TDP (Thermal Design Power)
- TGP (Total Graphics Power)
- SDP (Scenario Design Power)
- PUE (Power Usage Effectiveness)
- TCO (Total Cost of Ownership)
- Inference Cost (推理成本)

**选题范围**:
- 能效指标定义与计算方法
- 不同场景下的能效对比
- 能效优化策略
- TCO分析（数据中心、边缘计算）

**示例选题**:
- "TDP vs TGP：功耗指标的真相"
- "PPW如何影响芯片选型"
- "数据中心PUE优化策略"

#### 3. 架构设计 (CMP + EDGE)
**技术目录**:
- Apple Silicon (M系列)
- Blackwell / H100 / B200
- NVLink
- HBM (高带宽内存)
- Memory Wall (内存墙)
- Unified Memory (统一内存)
- NPU (神经网络处理器)
- On-Device AI (端侧AI)
- Heterogeneous Computing (异构计算)

**选题范围**:
- 芯片架构设计原理
- 内存系统设计（HBM、统一内存）
- 异构计算架构
- 端侧AI架构

**示例选题**:
- "Apple Silicon统一内存架构原理"
- "HBM如何突破内存墙"
- "端侧NPU架构设计原理"

#### 4. 电力系统 (PWR)
**技术目录**:
- Solid-State Battery (固态电池)
- 800V Architecture
- SiC (碳化硅)
- GaN (氮化镓)
- Energy Density (能量密度)
- 4C/5C Charging
- BMS (电池管理系统)
- Wireless Charging
- V2G (车网互动)

**选题范围**:
- 电池技术原理
- 快充技术原理
- 第三代半导体（SiC、GaN）
- 能量管理系统

**示例选题**:
- "固态电池技术原理与能效优势"
- "SiC vs GaN：第三代半导体对比"
- "BMS如何优化电池能效"

#### 5. 端侧AI (EDGE)
**技术目录**:
- NPU (神经网络处理器)
- On-Device AI (端侧AI)
- Privacy Computing (隐私计算)
- Always-on Sensing
- LoRA (微调技术)
- Small Language Model (SLM)
- Edge Training

**选题范围**:
- 端侧AI架构原理
- 模型压缩与优化
- 隐私计算技术
- 边缘推理优化

**示例选题**:
- "端侧SLM模型压缩技术原理"
- "NPU架构如何优化推理能效"
- "隐私计算在端侧AI中的应用"

#### 6. 具身智能 (EMB)
**技术目录**:
- End-to-End (端到端)
- Harmonic Drive (谐波减速器)
- Linear Actuator (线性执行器)
- DoF (自由度)
- Tactile Sensor (触觉传感器)
- Imitation Learning (模仿学习)
- Sim2Real (虚实迁移)
- Visual SLAM

**选题范围**:
- 机器人执行器原理
- 传感器系统设计
- 能效优化策略

**示例选题**:
- "机器人执行器能效优化原理"
- "视觉SLAM在机器人中的能效挑战"

#### 7. 模拟计算 (ANALOG)
**技术目录**:
- Compute-in-Memory (存算一体)
- Photonics Computing (光子计算)
- Neuromorphic (类脑芯片)
- SNN (脉冲神经网络)
- Memristor (忆阻器)
- Analog Signal (模拟信号)
- Low-Power Inference

**选题范围**:
- 存算一体架构原理
- 类脑芯片设计
- 光子计算技术
- 模拟信号处理

**示例选题**:
- "存算一体如何突破冯诺依曼瓶颈"
- "类脑芯片SNN架构原理"
- "光子计算的能效优势"

#### 8. 星际硅基 (SPACE)
**技术目录**:
- Rad-Hard (抗辐射加固)
- Starlink (星链)
- Laser Link (星间激光链路)
- Hall Thruster (霍尔推进器)
- Solar Sail (太阳帆)
- Redundancy Design (冗余设计)
- Wide Temperature Range (宽温域)
- Delay-Tolerant Network (DTN)

**选题范围**:
- 抗辐射芯片设计
- 星间通信技术
- 极端环境下的能效优化

**示例选题**:
- "抗辐射芯片设计原理"
- "星间激光链路的能效挑战"

## 产品数据库选题范围

### 产品分类

#### 1. 移动芯片 (EDGE)
**产品范围**:
- Apple A系列 (A18 Pro, A17 Pro等)
- Snapdragon 8系列 (8 Elite, 8 Gen 3等)
- MediaTek Dimensity系列
- Google Tensor系列
- 其他移动SoC

**数据维度**:
- 制程工艺
- 核心配置（CPU、GPU、NPU）
- 功耗数据（不同场景）
- 性能数据（Geekbench、3DMark等）
- 能效比（PPW）

#### 2. 桌面CPU (HW + CMP)
**产品范围**:
- Intel Core系列 (18A、20A等)
- AMD Ryzen系列
- Apple M系列 (M4、M4 Pro等)
- 其他桌面CPU

**数据维度**:
- 制程工艺
- 核心配置
- 功耗数据（TDP、实际功耗）
- 性能数据（Cinebench、Geekbench等）
- 能效比

#### 3. GPU (CMP)
**产品范围**:
- NVIDIA RTX系列 (5090、5080等)
- NVIDIA Blackwell系列 (B200、B100等)
- AMD Radeon系列
- 其他GPU

**数据维度**:
- 制程工艺
- 核心配置（CUDA核心、Tensor核心）
- 功耗数据（TGP、峰值功耗）
- 性能数据（3DMark、游戏帧率等）
- 能效比
- HBM配置

### 数据更新规则
- **新发布产品**: 24小时内添加
- **现有产品**: 每月更新一次数据
- **数据来源**: 官方规格、第三方评测、实验室测试

## 新闻聚合选题范围

### 新闻分类

#### 1. 行业速报 (所有维度)
**选题范围**:
- 新产品发布（芯片、电池、机器人等）
- 技术突破（制程、架构、材料等）
- 行业动态（合作、收购、投资等）
- 政策法规（能效标准、环保政策等）

**时效要求**: 24小时内发布

#### 2. 深度解读 (所有维度)
**选题范围**:
- 技术深度分析（新产品技术解析）
- 行业趋势分析（能效趋势、技术路线图）
- 竞争格局分析（厂商对比、技术对比）
- 商业影响分析（TCO、市场影响）

**时效要求**: 48小时内发布

### 新闻筛选标准
1. **能效相关性**: 必须与能效、功耗、续航相关
2. **技术深度**: 至少涉及一个64技术点
3. **用户价值**: 对用户有实际参考价值
4. **时效性**: 24-48小时内发布

## 术语词典选题范围

### 术语分类

#### 1. 技术术语 (所有维度)
**术语范围**: 64个关键技术点 + 扩展术语

**示例术语**:
- PowerVia (背面供电)
- RibbonFET (围栅晶体管)
- HBM (高带宽内存)
- PPW (每瓦性能)
- TDP (热设计功耗)
- BMS (电池管理系统)
- NPU (神经网络处理器)
- CoWoS (先进封装)
- 等等...

#### 2. 能效指标术语 (PWR + CMP)
**术语范围**:
- TDP, TGP, SDP
- PPW, PUE
- Energy Density
- Inference Cost
- TCO
- 等等...

### 术语条目要求
- **定义**: 50-100字，清晰准确
- **原理**: 100-200字，技术原理说明
- **应用**: 50-100字，实际应用场景
- **相关术语**: 至少3个相关术语链接

## 深度文章选题范围

### 选题类型

#### 1. 技术深度分析
**选题范围**:
- 新技术深度解析（如：Intel 18A技术深度分析）
- 技术对比分析（如：Apple Silicon vs x86能效对比）
- 技术演进路线图（如：从FinFET到GAA的技术演进）

#### 2. 产品深度评测
**选题范围**:
- 产品能效深度评测（如：A18 Pro能效深度分析）
- 产品对比评测（如：旗舰芯片能效横评）
- 产品技术解析（如：Blackwell架构深度解析）

#### 3. 行业趋势分析
**选题范围**:
- 行业能效趋势（如：2025年芯片能效趋势）
- 技术路线图分析（如：制程演进路线图）
- 市场影响分析（如：能效标准对行业的影响）

### 文章要求
- **字数**: > 2000字
- **结构**: 概述、原理、应用、案例、总结
- **数据**: 至少3个量化数据点
- **图表**: 至少3张图表（原理图、对比图、趋势图）

## 选题优先级

### P0 (必须覆盖)
- 64个关键技术点的技术原理
- 主流产品的产品数据
- 重大技术突破的新闻
- 核心术语的定义

### P1 (重要覆盖)
- 技术对比分析
- 产品深度评测
- 行业趋势分析
- 扩展术语定义

### P2 (按需覆盖)
- 细分技术解析
- 小众产品数据
- 行业动态新闻
- 边缘术语定义

## 选题生成流程

### 1. 技术原理知识库
1. 从64技术点中选择未覆盖的技术
2. 检查是否已有相关文章
3. 设计详细大纲（参考 `outline-design-guide.md`）
4. 生成内容

### 2. 产品数据库
1. 监控新产品发布
2. 收集产品数据
3. 验证数据准确性
4. 更新数据库

### 3. 新闻聚合
1. 监控行业新闻源
2. 筛选能效相关新闻
3. 快速生成速报
4. 深度解读（如需要）

### 4. 术语词典
1. 从64技术点中选择未定义的术语
2. 生成术语定义
3. 添加相关术语链接
4. 更新术语索引

## 变更日志

### v1.0.0 (2025-01-01)
- 初始选题目录
- 基于7维度64技术点体系
- 定义各内容类型的选题范围

