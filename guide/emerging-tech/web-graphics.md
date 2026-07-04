---
title: "VI. 新兴技术和专业领域 / VI.4 Web 图形和沉浸式体验"
---

# VI.4 Web 图形和沉浸式体验

**目的**：直接在浏览器中创建丰富的 2D 和 3D 视觉内容、动画和沉浸式（AR/VR）体验。

## **VI.4.1 核心图形技术 (Core Graphics Technologies)**
### **2D 图形**

- [**Canvas 2D Context**](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)：一个 JavaScript API，用于在 `<canvas>` HTML 元素上绘制 2D 图形（形状、文本、图像）。提供像素级控制。
- **SVG (Scalable Vector Graphics)**：一种基于 XML 的语言，用于描述矢量图像。可伸缩、可访问，并且易于使用 CSS/JS 进行样式化/脚本化。
- **基于节点的编辑器 ([React Flow](https://reactflow.dev/), [Vue Flow](https://vueflow.dev/), [Svelte Flow](https://svelteflow.dev/))**：用于构建交互式基于节点的编辑器和图表的库。

### **3D 图形**

- [**WebGL**](https://www.khronos.org/webgl/)：一个 JavaScript API，用于在浏览器中渲染交互式 2D 和 3D 图形，利用 GPU。复杂，底层。
- [**WebGPU**](https://www.w3.org/TR/webgpu/)：WebGL 的继任者，提供与现代 GPU 更好的兼容性、GPGPU 计算支持、更快的操作和对更高级 GPU 功能的访问。
- [**Three.js**](https://threejs.org/)：基于 JavaScript 的 WebGL 引擎，简化了 3D 场景创建，适用于通用 Web 动画。
- [**Babylon.js**](https://www.babylonjs.com/)：强大的 WebGL 框架，专注于基于 Web 的游戏开发，具有碰撞检测等高级功能。
- [**TresJS**](https://tresjs.org/)：用于 Three.js 的 Vue 自定义渲染器，支持在 Vue 应用程序中声明式地构建 3D 场景。
- [**PixiJS**](https://pixijs.com/)：高性能 2D 渲染器，使用 WebGL/WebGPU 进行 GPU 加速渲染，常用于游戏和交互式体验。
- **游戏引擎 ([Phaser](https://phaser.io/), [PlayCanvas](https://playcanvas.com/))**：用于构建 Web 游戏（2D/3D）的高级框架，抽象了图形和物理。

Web 图形技术栈日益丰富——从 SVG 到 WebGL/WebGPU——这一演进反映了行业对更丰富、更沉浸式 Web 体验（包括游戏和 AR/VR）的追求。Three.js、Babylon.js 等高级库以及 TresJS、[A-Frame](https://aframe.io/) 等声明式框架，封装了底层 API 的复杂性，让高级图形能力对前端开发者更加触手可及，有效扩展了浏览器中可直接实现的应用类型。

### **Web Animations API 和 Framer Motion**

- [**Web Animations API**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)：一个 JavaScript API，提供动画的播放控制和时间线，对 Web 动画提供细粒度控制。
- [**Framer Motion**](https://www.framer.com/motion/)：用于 React 的动画库，具有混合引擎（原生浏览器 + JavaScript 动画），支持手势和布局动画。

### **表格：3D 图形/游戏引擎比较**

| 引擎名称                                     | 抽象级别                            | 主要用例（示例）                                 | 核心技术                                                                        | 学习曲线 | 关键特性（示例）                                                             | 框架集成（示例）          |
| :------------------------------------------- | :---------------------------------- | :----------------------------------------------- | :------------------------------------------------------------------------------ | :------- | :--------------------------------------------------------------------------- | :------------------------ |
| [**WebGL**](https://www.khronos.org/webgl/)  | 低级 API                            | 复杂 3D 渲染，高性能需求                         | [WebGL](https://www.khronos.org/webgl/)                                         | 陡峭     | 直接 GPU 访问，像素级控制                                                    | 无                        |
| [**WebGPU**](https://www.w3.org/TR/webgpu/)  | 低级 API                            | 高性能计算，现代 3D 图形，GPGPU                  | [WebGPU](https://www.w3.org/TR/webgpu/)                                         | 陡峭     | 现代 GPU 兼容，并行计算                                                      | 无                        |
| [**Three.js**](https://threejs.org/)         | 3D 框架                             | 通用 Web 动画，数据可视化                        | [WebGL](https://www.khronos.org/webgl/)                                         | 较平缓   | 场景图，材质，几何体，动画                                                   | 灵活                      |
| [**Babylon.js**](https://www.babylonjs.com/) | 3D 框架/游戏引擎                    | Web 游戏开发，复杂 3D 场景                       | [WebGL](https://www.khronos.org/webgl/)                                         | 中等     | 物理引擎，碰撞检测，粒子系统                                                 | 灵活                      |
| [**TresJS**](https://tresjs.org/)            | [Vue](https://vuejs.org/) 3D 渲染器 | [Vue](https://vuejs.org/) 应用中的声明式 3D 场景 | [Three.js](https://threejs.org/)                                                | 较平缓   | [Vue](https://vuejs.org/) 组件化，类型安全，[Vite](https://vitejs.dev/) 集成 | [Vue](https://vuejs.org/) |
| [**PixiJS**](https://pixijs.com/)            | 2D 渲染器                           | 2D 游戏，交互式动画                              | [WebGL](https://www.khronos.org/webgl/)/[WebGPU](https://www.w3.org/TR/webgpu/) | 较平缓   | GPU 加速，场景管理，事件处理                                                 | 灵活                      |
| [**Phaser**](https://phaser.io/)             | 2D 游戏引擎                         | 2D Web 游戏，HTML5 游戏                          | Canvas/[WebGL](https://www.khronos.org/webgl/)                                  | 较低     | 物理，动画，输入管理，预制件                                                 | 无                        |
| [**PlayCanvas**](https://playcanvas.com/)    | 3D 游戏引擎                         | 3D Web 游戏，实时协作编辑器                      | [WebGL](https://www.khronos.org/webgl/)                                         | 中等     | 实时协作，物理，动画，材质系统                                               | 无                        |

这个表格有助于区分原始 API 和高级 3D 图形抽象，指导学习者选择适合其项目复杂度和性能需求的工具。它还突出了 WebGPU 日益增长的重要性。

## **VI.4.2 沉浸式 Web (Immersive Web): WebXR：AR/VR，A-Frame**

- [**WebXR Device API**](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)：在 Web 应用程序中启用增强现实 (AR) 和虚拟现实 (VR) 体验，与混合现实硬件接口。
- [**A-Frame**](https://aframe.io/)：基于 WebGL 的 Web 框架，用于使用熟悉的 HTML 标记语言构建 VR 体验。

## **VI.4.3 相关专题**

数据可视化、科学内容渲染和 Web GIS 已经从 Web 图形中拆出，详见 [Web 数据可视化](/guide/emerging-tech/data-visualization)。

