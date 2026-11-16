---
title: "VI. 新兴技术和专业领域 / VI.4 Web 图形和沉浸式体验"
---

# VI.4 Web 图形和沉浸式体验

浏览器图形与沉浸式体验覆盖从矢量图元、2D 像素画布到 3D 场景渲染、通用 GPU 计算（GPGPU）和混合现实（XR）的不同层级。选型时需要先明确图元数量、DOM 无障碍需求、计算负载以及目标设备的 GPU 能力。

## VI.4.1 核心图形技术（Core Graphics Technologies）
### 2D 图形

- [Canvas 2D Context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)：基于即时模式（Immediate Mode）在 `<canvas>` 元素上绘制形状、文本和位图，提供像素级读写控制，适合成千上万个动态图元的高频重绘，但画布内部图元不具备独立 DOM 节点与默认无障碍语义。
- SVG（Scalable Vector Graphics）：基于 XML 的保留模式（Retained Mode）矢量图形，可无损缩放、直接挂载无障碍属性（ARIA），并能用 CSS 与 DOM 事件控制单个图元；但节点数量达到数千级时会带来明显的 DOM 布局与内存开销。
- 节点编辑器（[React Flow](https://reactflow.dev/)、[Vue Flow](https://vueflow.dev/)、[Svelte Flow](https://svelteflow.dev/)）：面向可交互流程图、工作流编排与节点图的组件库，通常结合 HTML/SVG 渲染节点与连线，并内置视口缩放、拖拽与连线碰撞处理。

### 3D 图形与通用 GPU 计算（GPGPU）

- [WebGL](https://www.khronos.org/webgl/)：基于 OpenGL ES 的传统浏览器 3D 光栅化 API，设备覆盖率广，但全局状态机模型复杂，在高频绘制调用（Draw Calls）与通用计算场景下存在较高的 CPU/GPU 通信开销。
- [WebGPU](https://www.w3.org/TR/webgpu/)：新一代底层图形与计算 API，架构贴近 Vulkan、Metal 与 Direct3D 12，可直接映射到现代原生图形接口。截至 2026 年，随着 Chromium、Apple Safari 26（覆盖 macOS / iOS / visionOS）以及 Firefox 141+/145+ 陆续默认启用，WebGPU 的主流桌面与移动端覆盖率已大幅提高；在面向全量用户交付时，仍应通过 `navigator.gpu` 与 `requestAdapter()` 做运行时能力检测，并保留 WebGL 2、Canvas 2D 或 SVG 的降级路径：
  - **显式的资源与管线控制**：通过预编译渲染管线与命令编码器（Command Encoder），大幅降低 JavaScript 与 GPU 驱动之间的通信开销。
  - **计算着色器（Compute Shaders in WGSL）**：超越单纯的图形渲染，支持在网页中调度大规模 GPU 并行线程，执行通用矩阵运算、粒子物理模拟以及浏览器端大模型推理（如 WebLLM、Transformers.js v3 运行端侧 Llama/Whisper）。
- [Three.js](https://threejs.org/)：生态最成熟的 JavaScript 3D 渲染库，封装了场景图、相机、PBR 材质、模型加载器与着色器节点体系（TSL），同时支持 WebGL 与 WebGPU 后端。
- [Babylon.js](https://www.babylonjs.com/)：完整的 Web 3D 与游戏引擎，内置物理引擎集成、碰撞检测、粒子系统、骨骼动画与调试器。
- [TresJS](https://tresjs.org/)：基于 Three.js 的 Vue 自定义渲染器，允许以 Vue 组件声明式编排 3D 场景并复用响应式状态。
- [PixiJS](https://pixijs.com/)：基于 WebGL/WebGPU 的高性能 2D 精灵与批处理渲染器，适合高帧率 2D 游戏与复杂交互动效。
- 游戏引擎（[Phaser](https://phaser.io/)、[PlayCanvas](https://playcanvas.com/)）：在渲染层之上整合了游戏循环、物理碰撞、音频与输入管理的高阶引擎。

直接编写 WebGL 或 WebGPU 需要手动管理缓冲区、着色器与管线状态；大多数业务项目会通过 Three.js、Babylon.js 等引擎或 TresJS、[A-Frame](https://aframe.io/) 等声明式框架接入，只在定制着色器或性能热点处下沉到底层 API。

### Web Animations API 和 Motion（原 Framer Motion）

- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)：浏览器原生的 JavaScript 动画接口，提供关键帧定义、播放控制和时间线同步，可将满足条件的属性动画交由合成器线程执行。
- [Motion](https://motion.dev/)：原名 Framer Motion，2024 年 11 月从 Framer [独立并更名](https://motion.dev/blog/framer-motion-is-now-independent-introducing-motion)，现支持 React、原生 JavaScript 和 Vue。底层采用混合引擎（结合 Web Animations API 硬件加速与 JavaScript 帧循环），支持弹簧物理、手势驱动和跨组件布局动画。新项目安装 `motion` 包，React 中从 `motion/react` 导入；旧教程里的 `framer-motion` 包名仍很常见。

下表按抽象层级对比了常见 Web 图形 API 与引擎的定位及适用场景：

| 引擎名称 | 抽象级别 | 主要场景（示例） | 核心技术 | 学习曲线 | 关键特性（示例） | 框架集成（示例） |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [WebGL](https://www.khronos.org/webgl/) | 低级 API | 复杂 3D 渲染，高性能需求 | WebGL 2.0 | 陡峭 | 直接 GPU 访问，像素级控制 | 无 |
| [WebGPU](https://www.w3.org/TR/webgpu/) | 低级现代 API | 高性能 3D、GPGPU 计算、端侧 AI 推理 | WebGPU / WGSL | 陡峭 | 贴近现代原生 GPU API，并行计算着色器 | 无 |
| [Three.js](https://threejs.org/) | 3D 框架 | 通用 Web 动画，数据可视化，3D 产品展示 | WebGL / WebGPU | 较平缓 | 场景图，PBR 材质，几何体，动画系统 | 灵活 |
| [Babylon.js](https://www.babylonjs.com/) | 3D 框架/游戏引擎 | Web 游戏开发，复杂 3D 场景，工业仿真 | WebGL / WebGPU | 中等 | 物理引擎，碰撞检测，粒子系统，GUI 工具箱 | 灵活 |
| [TresJS](https://tresjs.org/) | Vue 3D 渲染器 | Vue 应用中的声明式 3D 场景 | Three.js | 较平缓 | Vue 组件化，类型安全，Vite 集成 | Vue |
| [PixiJS](https://pixijs.com/) | 2D 渲染器 | 2D 游戏，交互式动效看板 | WebGL / WebGPU | 较平缓 | GPU 批处理加速，场景图，滤镜管线 | 灵活 |
| [Phaser](https://phaser.io/) | 2D 游戏引擎 | 2D Web 游戏，H5 互动小游戏 | Canvas / WebGL | 较低 | 物理引擎，骨骼动画，音频与输入管理 | 无 |
| [PlayCanvas](https://playcanvas.com/) | 3D 游戏引擎 | 3D Web 游戏，实时协作编辑器 | WebGL / WebGPU | 中等 | 云端协同编辑器，轻量运行时，物理系统 | 无 |

## VI.4.2 沉浸式 Web（Immersive Web）：WebXR、AR/VR 与 A-Frame

- [WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)：为网页提供访问虚拟现实（VR）与增强现实（AR）头显设备的标准接口，负责空间姿态追踪、立体帧渲染循环与手柄/手势输入，可对接 Apple Vision Pro、Meta Quest 等混合现实硬件。
- [A-Frame](https://aframe.io/)：基于 Three.js 与 WebXR 的实体-组件-系统（ECS）框架，支持用声明式 HTML 标签快速搭建 VR/AR 场景。

## VI.4.3 相关专题

数据可视化、科学内容渲染和 Web GIS 已经从 Web 图形中拆出，详见 [Web 数据可视化](/guide/emerging-tech/data-visualization)。

## VI.4.4 先用 SVG 表达语义，再检测 GPU 能力

图形功能可以从支持无障碍、可缩放的 SVG 开始；需要大规模绘制或计算时，再检测 WebGPU 并提供 Canvas/SVG 回退。

```html
<svg viewBox="0 0 240 80" role="img" aria-labelledby="chart-title">
  <title id="chart-title">本周访问量趋势</title>
  <polyline
    points="8,64 48,50 88,56 128,30 168,38 208,16"
    fill="none"
    stroke="currentColor"
    stroke-width="4"
  />
</svg>
```

```js
export async function chooseRenderer(canvas) {
  const adapter = await navigator.gpu?.requestAdapter();
  if (!adapter) {
    return { kind: "canvas-2d", context: canvas.getContext("2d") };
  }

  const device = await adapter.requestDevice();
  return { kind: "webgpu", device, context: canvas.getContext("webgpu") };
}
```

回退路径应保持数据、操作和替代文本可用；渲染器只负责表现层。性能实验可以固定数据量，分别记录 SVG 节点数、Canvas 绘制时间、GPU 初始化时间和低端设备帧率。
