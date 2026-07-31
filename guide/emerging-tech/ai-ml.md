---
title: "VI. 新兴技术和专业领域 / VI.8 前端 AI/ML 与 Agent 界面"
---

# VI.8 前端 AI/ML 与 Agent 界面

**目的**：理解 AI 功能可以在哪里运行、模型由谁管理，以及怎样在隐私、延迟、兼容性和成本之间做取舍。

前端 AI 包含多种架构。翻译、手势识别、语音转写、语义搜索和聊天助手在模型大小、输入数据与实时要求上完全不同。开始选框架之前，先问两个问题：

1. 模型运行在用户设备还是服务器？
2. 模型由浏览器、应用还是服务端团队管理？

## **VI.8.0 先分清四条实现路线**

| 实现路线 | 模型由谁管理 | 工具示例 | 更适合说明的场景 | 主要边界 |
| :--- | :--- | :--- | :--- | :--- |
| **浏览器内建 AI** | 浏览器负责模型下载、更新和生命周期 | [Chrome Built-in AI APIs](https://developer.chrome.com/docs/ai/built-in-apis) 中的翻译、语言检测、摘要等任务 API | 希望用高层 API 完成常见文本任务，并能接受渐进增强 | API 阶段、设备要求和浏览器支持不一致，模型可能尚未下载 |
| **应用自带模型** | 应用选择模型、格式、缓存和执行后端 | [MediaPipe](https://developers.google.com/mediapipe)、[ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)、[Transformers.js](https://huggingface.co/docs/transformers.js/en/index)、[TensorFlow.js](https://www.tensorflow.org/js) | 本地视觉、音频、文本或定制模型推理 | 应用需自行承担下载体积、内存、功耗、算子支持和设备性能 |
| **服务器模型** | 服务端或模型平台负责部署与更新 | 托管推理 API，以及 [LangChain](https://www.langchain.com/)、[LlamaIndex](https://www.llamaindex.ai/)、[Pinecone](https://www.pinecone.io/) 等 RAG 相关工具 | 大模型、集中更新、复杂推理和共享知识库 | 网络延迟、持续成本、数据传输、认证与合规 |
| **混合架构** | 浏览器与服务端各负责一部分 | 本地轻量模型 + 远端复杂模型，或本地优先 + 服务端回退 | 同时需要低延迟、隐私和稳定覆盖的产品 | 路由、结果一致性、回退策略和可观测性更复杂 |

表里的工具分别示例了四种责任划分。比较时先按层次分组：浏览器内建 API 与 ONNX Runtime Web 管理不同层次，LangChain 与 Pinecone 位于服务端编排和数据层。

## **VI.8.1 用六个问题决定本地还是远端**

### **1. 原始数据能否离开设备**

摄像头画面、录音、医疗信息和未发布文档可能需要尽量留在设备端。本地运行仍需要配合日志、缓存、第三方脚本和网络请求审查，团队应画出真实数据流，明确哪些数据被读取、保存和传输。

### **2. 用户能等多久**

手势控制、实时滤镜和输入建议通常对延迟敏感，本地推理可以减少网络往返。长文总结或复杂生成往往允许更长等待，也更可能需要服务器算力。评估指标应覆盖端到端体验，包括模型推理、数据准备、渲染与网络耗时。

### **3. 模型有多大、多久更新一次**

应用自带模型意味着用户要下载它，浏览器还要解码并缓存它，占用内存。模型很大或更新频繁时，集中部署更容易控制版本；小而稳定的模型更适合端侧缓存和离线使用。

### **4. 最差设备能否完成任务**

应同时在低内存手机、集成显卡电脑和节电模式下验证体验，并为设备分级。每一级都要明确路径：换用更小模型、切回 Wasm、调用服务器或隐藏增强功能。

### **5. 成本落在哪里**

本地推理减少服务器调用，却把下载、功耗和设备资源交给用户；服务端推理更容易统一性能，却会产生基础设施与调用成本。比较时要把模型分发、缓存失效、峰值并发和失败重试一起计算。

### **6. 模型与凭据能否放到客户端**

浏览器中的模型文件和 JavaScript 都可被用户取得，知识产权保护应以此为前提来规划。服务端 API 密钥应保存在受控服务端；需要保密的模型、系统提示、数据权限和供应商凭据也应遵循这一边界。

## **VI.8.2 浏览器内建 AI 要按渐进增强使用**

浏览器内建 AI 允许应用调用较高层的任务 API，并由浏览器负责底层模型。是否可用取决于 API 阶段、设备条件和模型下载状态，需要在运行时确认。

[Chrome 的入门说明](https://developer.chrome.com/docs/ai/get-started) 提醒开发者检查设备支持和模型状态；首次使用还可能需要下载模型或满足用户激活条件。不同 API 也可能分别处于稳定、试用或开发阶段。

因此，接入顺序应该是：

1. **检测 API 是否存在**，以运行时能力检测为准，并把浏览器版本作为调试信息。
2. **查询可用状态**，区分不可用、可下载、下载中和可用。
3. **提前说明下载与资源消耗**，提供进度、取消和重试。
4. **让普通功能覆盖全部设备**，在能力满足时启用本地 AI，并按数据政策提供服务端回退。
5. **持续监测真实失败率**，因为实验室里的支持列表无法代表所有设备状态。

例如，文章页始终显示原文；支持相关能力时提供本地摘要，并按产品的数据政策决定是否提供服务端摘要。AI 在这里处于渐进增强层。

## **VI.8.3 用工具理解不同抽象层**

下面的表说明每个工具替开发者承担了哪一层工作。

| 工具 | 它封装的重点 | 常见执行位置与后端 | 适合用来解释的任务 | 需要自行验证的边界 |
| :--- | :--- | :--- | :--- | :--- |
| [**MediaPipe**](https://developers.google.com/mediapipe) | 把视觉、音频等常见感知任务封装成较高层接口 | 浏览器与其他端侧平台，具体后端由任务与环境决定 | 手势、姿态、目标检测等实时交互 | 支持的任务、模型定制范围、摄像头权限、帧率与功耗 |
| [**ONNX Runtime Web**](https://onnxruntime.ai/docs/tutorials/web/) | 在 Web 中运行 ONNX 模型，并选择执行后端 | Wasm、WebGL、WebGPU、WebNN；各后端的算子覆盖不同 | 把其他训练生态导出的模型部署到浏览器 | 模型转换、算子兼容、包体、初始化时间和后端差异 |
| [**Transformers.js**](https://huggingface.co/docs/transformers.js/en/index) | 用接近 Transformers 的高层 API 运行预训练模型 | 底层使用 ONNX Runtime；浏览器默认可走 Wasm，也可按环境尝试 WebGPU | 文本分类、特征提取、语音和视觉等 Transformer 任务 | 模型下载、量化精度、内存、WebGPU 兼容性与首次加载体验 |
| [**TensorFlow.js**](https://www.tensorflow.org/js) | 在 JavaScript 中运行或训练 TensorFlow 模型 | 浏览器和 Node.js，可选择不同 backend | 已有 TensorFlow 模型、JS 内训练或定制交互实验 | 模型格式、后端支持、训练资源和目标设备性能 |
| [**浏览器内建 AI API**](https://developer.chrome.com/docs/ai/built-in-apis) | 浏览器管理模型，应用调用翻译、摘要等任务接口 | 支持该 API 且满足设备条件的浏览器 | 不想自行分发模型的常见文本增强 | API 生命周期、跨浏览器覆盖、下载状态和输出质量 |
| [**LangChain**](https://www.langchain.com/)、[**LlamaIndex**](https://www.llamaindex.ai/)、[**Pinecone**](https://www.pinecone.io/) | 服务端编排、数据连接和向量检索等 RAG 环节 | 通常位于受控服务端或云服务，承担编排与数据检索 | 需要权限控制、共享知识库和复杂检索的问答 | 数据新鲜度、召回质量、租户隔离、注入攻击、成本与凭据保护 |

以 Transformers.js 为例，它给开发者的是高层任务 API，底层仍要依赖 ONNX Runtime 和具体计算后端。理解这层关系后，可以分别评估模型库、推理运行时和 GPU API。

## **VI.8.4 Wasm、WebGPU 与 WebNN 分别解决什么**

浏览器端推理可以分成三层：

> 应用或任务 API → 模型运行时 → 浏览器计算后端

MediaPipe、Transformers.js 等更接近上层；ONNX Runtime Web、TensorFlow.js runtime 负责加载模型与调度算子；Wasm、WebGPU、WebNN 则提供不同的底层执行路径。

- **WebAssembly（Wasm）**兼容面通常更广，适合作为 CPU 路径和基础回退。它在所有模型上未必最快，但更容易覆盖没有现代 GPU 能力的设备。
- **WebGPU**向 Web 暴露通用 GPU 计算能力，是高并行推理的重要路径。模型是否更快仍取决于浏览器、驱动、算子、数据传输和预热成本。[Transformers.js 的 WebGPU 指南](https://huggingface.co/docs/transformers.js/guides/webgpu) 也要求显式选择并关注兼容性。
- **WebNN**是面向神经网络图的硬件无关 Web API，目标是让实现映射到 CPU、GPU 或 NPU。[W3C WebNN 规范](https://www.w3.org/TR/webnn/) 仍在标准化、实现也在演进中，适合作为经过能力检测的增强路径。
- **WebGL**原本为图形设计，但仍可能出现在既有框架的后端列表中。新项目应依据运行时官方支持和实际测量选择执行路径。

一个稳妥的选择方式是：先建立可工作的 Wasm 或服务端基线，再对支持的设备启用 WebGPU；只有在目标浏览器确实实现且模型算子受支持时才尝试 WebNN。每条路径都要测首次加载、预热、持续推理、峰值内存、功耗和结果一致性。

## **VI.8.5 混合架构的启发式例子**

假设产品要在浏览器里为用户照片生成辅助说明：

1. 页面先显示图片和人工填写入口，核心功能不依赖 AI。
2. 支持且性能足够的设备，用 MediaPipe 或 ONNX Runtime Web 在本地识别有限的对象与场景；原图保留在设备端。
3. 用户明确选择“生成详细描述”时，再按数据政策把经过处理的图片发送给服务端大模型。
4. 设备太弱、模型下载失败或算子不支持时，回退到服务端，或者只保留人工填写。
5. 服务端失败时不丢失用户已经编辑的文字，本地结果与远端结果也要标明来源。

这个例子没有追求“全部本地”或“全部上云”。本地路径负责隐私敏感、低延迟的粗处理；远端路径负责更复杂的生成；普通表单负责兜底。三条路径共同保证产品可用。

## **VI.8.6 上线前检查清单**

- **价值**：AI 是否解决了明确用户问题，还是只增加一个演示功能？
- **数据**：输入、模型输出、日志和缓存分别存在哪里，保留多久？
- **能力检测**：是否检查 API、模型下载、执行后端和设备资源？
- **体验**：是否展示下载与处理状态，并允许取消、重试和继续使用普通功能？
- **回退**：本地失败、服务端失败、离线和低端设备分别怎样处理？
- **评估**：是否有固定样本衡量正确性、偏差、安全性和版本变化？
- **性能**：是否在真实目标设备上测首次加载、内存、耗电和交互响应？
- **安全**：密钥是否留在服务端，上传与 RAG 是否有权限、隔离和注入防护？
- **可观测性**：能否区分下载失败、后端不支持、模型错误和服务端超时，同时避免把敏感输入写进日志？

前端 AI/ML 的核心能力，是划清运行与数据边界，并为不同设备设计可检测、可降级、可评估的路径。

## **VI.8.7 面向 Agent 的 Web 界面：新兴方向**

传统前端把用户当作主要交互主体；新的 Agent 场景还要求网页向模型暴露可理解、可调用、可确认的能力。这里至少要区分三类工作：

| 方向 | 解决的问题 | 当前成熟度 |
| :--- | :--- | :--- |
| [MCP Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) | 让 Agent 发现并调用带有名称、描述和输入 Schema 的工具 | 已形成公开协议规范和生态，但权限与实现质量仍需自行治理 |
| [MCP Apps](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/) | 让工具结果在对话中呈现交互式组件，并保留文本和 JSON 数据能力 | MCP 的官方扩展，适合关注 Agent 内交互的团队 |
| [A2UI](https://github.com/google/A2UI) | 用声明式组件树描述 Agent 要呈现的表单和界面，由客户端从受控目录渲染 | Public Preview，组件协议仍在演进 |
| [WebMCP](https://webmachinelearning.github.io/webmcp/) | 让网页把自身的 JavaScript 能力暴露为 Agent 可调用的工具 | Community Group Draft，规范状态仍在演进，适合实验性项目 |

这类系统应让模型提交受约束的数据和意图，再由客户端使用经过审核的组件目录渲染。前端需要继续负责：

- 工具名称、描述、输入 Schema 和错误状态；
- 用户身份、来源权限、确认步骤和可撤销操作；
- Prompt injection、越权调用、误导性描述和隐私泄露防护；
- 表单、焦点、键盘操作、错误提示和屏幕阅读器体验；
- 当 Agent 不可用、模型输出不可信或工具调用失败时的普通 Web 回退。

因此，Agent-facing UI 目前适合放在新兴技术和实验项目中学习。MCP Apps、A2UI 或 WebMCP 属于可选探索方向，权限、可访问性和审计要求继续保持在与普通 Web UI 相同或更高的标准。

## **VI.8.8 本地能力与服务端回退的适配层**

前端可以把模型能力包在一个可替换的适配层里：浏览器具备本地能力时优先使用本地执行，能力缺失、下载失败或设备资源不足时转到服务端。下面的 `localSummarize` 由具体浏览器 API 或 WebGPU/Wasm 实现提供。

```ts
type Summarize = (input: string, signal?: AbortSignal) => Promise<string>;

export async function summarize(
  input: string,
  options: { localSummarize?: Summarize; signal?: AbortSignal } = {},
) {
  if (options.localSummarize) {
    try {
      return await options.localSummarize(input, options.signal);
    } catch (error) {
      console.warn("本地模型失败，切换服务端", error);
    }
  }

  const response = await fetch("/api/summarize", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ input }),
    signal: options.signal,
  });

  if (!response.ok) throw new Error(`Summarize failed: ${response.status}`);
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("text" in result)) {
    throw new Error("Invalid summarize response");
  }
  return String(result.text);
}
```

适配层应同时返回加载、取消、超时、权限和内容安全状态。客户端只保存公开配置，模型密钥、敏感数据处理和最终权限判断留在服务端。

## **VI.8.9 受约束的工具 Schema**

面向 Agent 的工具先定义输入 Schema，再由客户端执行权限检查和确认：

```json
{
  "name": "search_products",
  "description": "按关键词搜索当前用户有权查看的商品",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "minLength": 1, "maxLength": 80 },
      "limit": { "type": "integer", "minimum": 1, "maximum": 20 }
    },
    "required": ["query"]
  },
  "requiresConfirmation": false
}
```

读取类工具可以在权限过滤后直接执行；写入、付款、删除和外部消息类工具应显示影响范围、请求用户确认，并提供撤销或回滚路径。
