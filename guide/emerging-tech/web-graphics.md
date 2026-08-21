---
title: "VI. 新兴技术和专业领域 / VI.4 Web 图形和沉浸式体验"
---

# VI.4 Web 图形和沉浸式体验

**目的**：直接在浏览器中创建丰富的 2D 和 3D 视觉内容、动画和沉浸式（AR/VR）体验。

## **VI.4.1 核心图形技术 (Core Graphics Technologies)**
### **2D 图形**

- [**Canvas 2D Context**](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)：JavaScript API，用于在 HTML `<canvas>` 元素上绘制 2D 图形（形状、文本、图像）。提供像素级控制。
- **SVG (Scalable Vector Graphics)**：基于 XML 的语言，用于描述矢量图像。可伸缩、可访问，并且易于用 CSS/JS 设置样式和编写脚本。
- **基于节点的编辑器 ([React Flow](https://reactflow.dev/), [Vue Flow](https://vueflow.dev/), [Svelte Flow](https://svelteflow.dev/))**：用于构建交互式基于节点的编辑器和图表的库。

### **3D 图形与通用 GPU 计算 (GPGPU)**

- [**WebGL**](https://www.khronos.org/webgl/)：经典的 JavaScript 3D 图形 API，基于 OpenGL ES。状态机模型复杂，主要面向图形光栅化渲染。
- [**WebGPU**](https://www.w3.org/TR/webgpu/)：现代浏览器的下一代底层图形与计算 API，底层直接映射 Vulkan、Metal 与 Direct3D 12：
  - **显存与硬件控制**：极大降低 JavaScript 与 GPU 驱动之间的通信开销。
  - **计算着色器 (Compute Shaders in WGSL)**：突破纯图形渲染范畴，允许开发者在 Web 页面中直接调度数千个 GPU 核心执行通用矩阵运算、粒子物理模拟以及**浏览器端大模型推理（如 WebLLM、Transformers.js v3 运行端侧 Llama/Whisper）**。
- [**Three.js**](https://threejs.org/)：基于 JavaScript 的 3D 引擎事实标准，拥有完备的场景图、材质系统、加载器与着色器节点体系。
- [**Babylon.js**](https://www.babylonjs.com/)：功能完备的企业级 Web 3D/游戏引擎，深度整合物理碰撞检测与复杂粒子系统。
- [**TresJS**](https://tresjs.org/)：用于 Three.js 的 Vue 自定义渲染器，支持在 Vue 应用中声明式构建 3D 场景。
- [**PixiJS**](https://pixijs.com/)：高性能 2D 渲染器，使用 WebGL/WebGPU 实现 GPU 加速渲染，常用于游戏和交互式体验。
- **游戏引擎 ([Phaser](https://phaser.io/), [PlayCanvas](https://playcanvas.com/))**：用于构建 Web 游戏（2D/3D）的高级框架，抽象了图形和物理。

Web 图形技术栈日益丰富——从 SVG 到 WebGL/WebGPU——这种演进反映了行业对更丰富、更沉浸式 Web 体验（包括游戏和 AR/VR）的追求。Three.js、Babylon.js 等高级库以及 TresJS、[A-Frame](https://aframe.io/) 等声明式框架，封装了底层 API 的复杂性，让高级图形能力对前端开发者更加触手可及，有效扩展了浏览器中可直接构建的应用类型。

### **Web Animations API 和 Framer Motion**

- [**Web Animations API**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)：JavaScript API，提供动画的播放控制和时间线，可细粒度地控制 Web 动画。
- [**Framer Motion**](https://www.framer.com/motion/)：用于 React 的动画库，具有混合引擎（原生浏览器 + JavaScript 动画），支持手势和布局动画。

### **表格：3D 图形/游戏引擎比较**

| 引擎名称 | 抽象级别 | 主要用例（示例） | 核心技术 | 学习曲线 | 关键特性（示例） | 框架集成（示例） |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [**WebGL**](https://www.khronos.org/webgl/) | 低级 API | 复杂 3D 渲染，高性能需求 | WebGL 2.0 | 陡峭 | 直接 GPU 访问，像素级控制 | 无 |
| [**WebGPU**](https://www.w3.org/TR/webgpu/) | 低级现代 API | 高性能 3D、GPGPU 计算、端侧 AI 推理 | WebGPU / WGSL | 陡峭 | 原生现代 GPU 驱动对接，并行计算着色器 | 无 |
| [**Three.js**](https://threejs.org/) | 3D 框架 | 通用 Web 动画，数据可视化，3D 产品展示 | WebGL / WebGPU | 较平缓 | 场景图，PBR 材质，几何体，动画系统 | 灵活 |
| [**Babylon.js**](https://www.babylonjs.com/) | 3D 框架/游戏引擎 | Web 游戏开发，复杂 3D 场景，工业仿真 | WebGL / WebGPU | 中等 | 物理引擎，碰撞检测，粒子系统，GUI 工具箱 | 灵活 |
| [**TresJS**](https://tresjs.org/) | Vue 3D 渲染器 | Vue 应用中的声明式 3D 场景 | Three.js | 较平缓 | Vue 组件化，类型安全，Vite 集成 | Vue |
| [**PixiJS**](https://pixijs.com/) | 2D 渲染器 | 2D 游戏，交互式动效看板 | WebGL / WebGPU | 较平缓 | GPU 批处理加速，场景图，滤镜管线 | 灵活 |
| [**Phaser**](https://phaser.io/) | 2D 游戏引擎 | 2D Web 游戏，H5 互动小游戏 | Canvas / WebGL | 较低 | 物理引擎，骨骼动画，音频与输入管理 | 无 |
| [**PlayCanvas**](https://playcanvas.com/) | 3D 游戏引擎 | 3D Web 游戏，实时协作编辑器 | WebGL / WebGPU | 中等 | 云端协同编辑器，轻量运行时，物理系统 | 无 |

此表有助于区分原始 API 与高级 3D 图形抽象，指导学习者根据项目的复杂度和性能需求选择合适的工具，同时也突出了 WebGPU 日益增长的重要性。

## **VI.4.2 沉浸式 Web (Immersive Web): WebXR：AR/VR，A-Frame**

- [**WebXR Device API**](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)：在 Web 应用中启用增强现实 (AR) 和虚拟现实 (VR) 体验，可对接混合现实硬件（如 Apple Vision Pro、Meta Quest）。
- [**A-Frame**](https://aframe.io/)：基于 WebGL 的 Web 框架，可用熟悉的 HTML 标记语言构建 VR 体验。

## **VI.4.3 相关专题**

数据可视化、科学内容渲染和 Web GIS 已经从 Web 图形中拆出，详见 [Web 数据可视化](/guide/emerging-tech/data-visualization)。

## **VI.4.4 先用 SVG 表达语义，再检测 GPU 能力**

图形功能可以从可访问、可缩放的 SVG 开始；需要大规模绘制或计算时，再检测 WebGPU 并提供 Canvas/SVG 回退。

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
