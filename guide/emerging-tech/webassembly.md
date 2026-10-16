---
title: "VI. 新兴技术和专业领域 / VI.2 WebAssembly（Wasm）：释放 Web 平台的原生性能"
---

# VI.2 WebAssembly（Wasm）：释放 Web 平台的原生性能

长久以来，JavaScript 几乎是 Web 世界唯一的原生编程语言，承载了浏览器中几乎所有的逻辑与交互。尽管现代 JavaScript 引擎（如 [V8](https://v8.dev/)）通过即时编译（JIT）等技术大幅提升了性能，但在执行计算密集型任务（如 3D 图形渲染、视频编解码、复杂科学计算）时，受动态语言特性所限，它与原生语言（如 C++、Rust）之间仍有明显的性能差距。**WebAssembly（[Wasm](https://webassembly.org/)）** 正是为缩小这一差距而设计的。

WebAssembly 是一种面向 Web 的二进制指令格式，可移植且体积紧凑。它主要作为**编译目标（Compilation Target）**：开发者用 C、C++、Rust、Go 等语言编写代码，再编译成 Wasm 模块。浏览器可以高效地加载、解码并执行模块，在合适的任务上运行速度接近原生代码。

从本质上讲，WebAssembly 为 Web 平台引入了第二种语言，与 JavaScript 形成**互补**关系：JavaScript 负责页面交互、操作 DOM、调用 Web API；Wasm 负责计算密集的部分，由 JavaScript 调用和调度。

## **VI.2.1 Wasm 的核心价值**

1. **接近原生的性能（Near-Native Performance）**
   Wasm 是预编译的静态类型低级二进制格式，浏览器能快速完成验证和机器码编译，省去 JavaScript 那样的动态解析与推测优化过程。因此在 CPU 密集型任务上，Wasm 往往能达到接近原生代码的执行效率，使专业级图像/视频编辑器、大型游戏、CAD 软件等重度应用可以在浏览器中运行。

2. **复用其他语言的生态（Bringing New Ecosystems to the Web）**
   Wasm 让 Web 开发不再只能使用 JavaScript。数十年来在 C++、Rust 等语言中积累的大量库（例如图像处理库、物理引擎、压缩算法）可以移植到 Web 平台，开发者不必用 JavaScript 重写这些复杂的轮子。移植时仍要处理文件系统、线程和内存等平台差异。

3. **可预测的性能与安全性（Predictable Performance & Security）**
   Wasm 是提前编译的低级字节码，不依赖 JIT 的推测优化，因此执行性能通常比 JavaScript 更稳定、可预测。同时，Wasm 运行在与宿主环境隔离的**沙箱（Sandbox）** 中，只能读写自己的线性内存，默认无法直接访问 DOM 或任何 Web API，与外部的交互都要通过显式导入的 JavaScript 函数。这种设计大幅缩小了攻击面，但模块内部仍可能存在内存越界等漏洞，第三方模块需要和普通依赖一样审查。

## **VI.2.2 现代 Wasm 标准演进（2024–2026）**

WebAssembly 标准近年有多项重要的底层扩展：

- **[WasmGC（垃圾回收扩展）](https://github.com/WebAssembly/gc)**（Baseline）：过去，Kotlin、Dart、Java、C# 等依赖垃圾回收的语言编译为 Wasm 时，必须在产物中自带一套垃圾回收运行时，产物常达数 MB。WasmGC 允许 Wasm 模块直接复用宿主浏览器的垃圾回收器，产物不必再自带 GC 运行时。[Flutter Web 的 Wasm 构建](https://docs.flutter.dev/platform-integration/web/wasm)和 [Kotlin/Wasm](https://kotlinlang.org/docs/wasm-overview.html) 都以 WasmGC 为前提（Flutter 在不支持 WasmGC 的浏览器上回退到 JS 产物）；体积与 GC 停顿的实际收益因项目而异，应以实测为准。
- **Component Model 与 WASI 0.2**：Component Model 用 WIT 接口定义语言描述组件之间的接口约定，让不同语言编写的 Wasm 组件可以像积木一样组合与复用；WASI 0.2 建立在 Component Model 之上，为边缘计算（Edge Runtime）与 Serverless 场景提供受沙箱约束的系统接口（网络、文件系统、环境变量等）。
- **Fixed-width SIMD 与多线程**：128 位向量指令（SIMD）可以用一条指令同时处理多个数据通道，再配合 `SharedArrayBuffer` 与 Web Worker 多线程，可以显著提升浏览器端音视频处理与端侧 AI 推理的吞吐量。

## **VI.2.3 应用场景与未来展望**

WebAssembly 的应用不止于游戏和科学计算，已经进入前端开发的多个领域：

- **重度计算型 Web 应用**：从图像处理（如 Figma）、视频编辑到数据可视化，需要大量计算的应用可以把核心算法用 Rust/C++ 编写并编译为 Wasm，UI 层继续使用 React/Vue 等框架。
- **浏览器内的轻量数据库**：
  - **SQLite Wasm + OPFS**：SQLite 官方提供 Wasm 构建，可以用浏览器的 Origin Private File System（OPFS）做持久化存储，在客户端直接执行复杂 SQL 查询与全文检索。
  - **[PGlite](https://pglite.dev/)**：把 Postgres 打包成单个 Wasm 文件（压缩后约 3 MB），不需要单独的数据库服务进程，就能在浏览器中运行 Postgres 及部分扩展。
  - **[DuckDB-Wasm](https://duckdb.org/docs/api/wasm/overview.html)**：在浏览器中运行的列式 OLAP 分析引擎，可以直接查询 Parquet 等格式的数据，适合百万行级别的交互式分析。
- **代码库与算法的复用**：有些复杂算法（如数据加解密、压缩）在服务端（如 Node.js）和客户端都需要使用，用支持编译到 Wasm 的语言编写，就能实现一套代码、两端复用，保证逻辑的一致性。
- **插件化系统**：允许第三方开发者以安全、高性能的方式为 Web 应用提供插件。例如，一个在线音频工作站可以允许用户加载用 C++ 编写并编译成 Wasm 的第三方音频效果器。
- **无服务器与边缘计算**：Wasm 体积小、启动快、隔离性好，适合在 [Cloudflare Workers](https://workers.cloudflare.com/) 等边缘计算环境中运行，同一模块也能在不同平台之间移植。

## **VI.2.4 从 JavaScript 加载 Wasm 模块**

[`instantiateStreaming`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/instantiateStreaming_static) 可以边下载边编译，但要求服务器返回 `Content-Type: application/wasm`，否则会抛出 `TypeError`，而且此时响应体已被读取，无法再拿来回退。因此先检查响应头再选择路径：MIME 正确时走流式编译，否则读成 `ArrayBuffer` 再实例化。回退路径失去了流式编译，应记录下来并尽快修正服务器 MIME。

```js
export async function loadMathModule(imports = {}) {
  const response = await fetch("/math.wasm");
  if (!response.ok) throw new Error(`WASM request failed: ${response.status}`);

  const isWasmMime = response.headers.get("content-type")?.startsWith("application/wasm");

  if (WebAssembly.instantiateStreaming && isWasmMime) {
    const { instance } = await WebAssembly.instantiateStreaming(response, imports);
    return instance.exports;
  }

  console.warn("WASM 未以 application/wasm 返回，使用 ArrayBuffer 回退");
  const { instance } = await WebAssembly.instantiate(await response.arrayBuffer(), imports);
  return instance.exports;
}

const math = await loadMathModule();
console.log(math.add(2, 3));
```

Wasm 适合有明确计算瓶颈、可测量输入输出和稳定模块边界的任务。加载体积、JS/Wasm 之间的数据复制、初始化时间和内存占用都应纳入基准测试。
