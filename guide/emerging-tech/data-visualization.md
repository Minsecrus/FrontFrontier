---
title: "VI. 新兴技术和专业领域 / VI.5 Web 数据可视化"
---

# VI.5 Web 数据可视化

Web 数据可视化关注如何在浏览器中把数据转换成图表、地图、科学内容和实时可交互界面。它和 Web 图形共享 Canvas、SVG、WebGL/WebGPU 等底层能力，但学习重点从“画什么”转向“如何表达数据、处理规模、保持交互性能”。

## **VI.5.1 核心可视化技术**

- **D3.js（Data-Driven Documents）**：把数据绑定到 DOM、构建动态交互式可视化的 JavaScript 库。提供底层控制，便于实现定制设计。
- **图表库（[Chart.js](https://www.chartjs.org/)、[ECharts](https://echarts.apache.org/)、[AntV](https://antv.vision/)）**：用于创建常见图表的高层库，通常基于 Canvas 或 SVG 渲染。
- **MathJax、[KaTeX](https://katex.org/)：** 在浏览器中渲染数学公式和科学内容的库，排版美观，并支持无障碍输出。
- **Web GIS（Geographic Information System）：** 在浏览器中显示、分析地理空间数据，并与之交互。

如果关注 React/Vue/Angular 项目里的图表组件选型，可以先读 [数据可视化组件库](/guide/frameworks/data-visualization-libraries)。本篇更偏向渲染模型、性能策略和可视化场景本身。

## **VI.5.2 大数据可视化的性能策略**

数据量过大时，前端可视化会遇到性能瓶颈。常用策略如下：

- **数据抽样与聚合**：不直接渲染全部数据点，而是先抽样（如随机抽样、均匀抽样）或聚合（如把时间序列按小时/天汇总），在较高层级只展示汇总信息，用户再按需钻取（drill-down）查看明细。
- **分层渲染与按需加载**：
  - **视口内渲染**：只渲染当前用户视口内的数据点或图形元素，视口外元素延迟加载或不渲染。
  - **渐进式渲染**：先快速渲染低精度的图形，然后逐步加载和渲染更高精度的细节。
  - **Web Workers**：把复杂的数据处理和计算（如过滤、聚合、格式化）放到 Web Worker 中，让界面保持流畅响应。
- **WebAssembly 与 WebGL/Canvas**：
  - **Wasm**：计算密集型的数据处理或渲染逻辑可以用 C++/Rust 等语言编写，编译成 Wasm，在浏览器中以接近原生的速度运行。
  - **WebGL/Canvas**：数据点达到上万个或包含复杂 3D 图形时，可以直接用 WebGL（GPU 加速）或 Canvas（2D 绘图 API）做底层渲染，性能优于大量 DOM/SVG 节点。D3.js 等库也支持渲染到 Canvas。
- **数据流优化**：
  - **增量更新**：数据源变化时，只更新受影响的图形元素。
  - **虚拟化**：长列表或大量图形元素只在 DOM 中渲染可见部分，滚动时动态加载和卸载元素。

## **VI.5.3 实时数据可视化的技术选型**

实时数据可视化要求前端能够高效地接收并渲染持续更新的数据流。

- **实时通信协议**：
  - **WebSocket**：提供全双工通信，适合需要频繁双向交互的实时场景（如实时仪表盘、在线交易图表）。
  - **Server-Sent Events（SSE）**：如果只需要服务器向客户端单向推送数据，SSE 更轻量、更易实现，且内置断线重连。
- **数据处理与渲染库**：
  - [**D3.js**](https://d3js.org/)：提供灵活的数据绑定和转换能力，可以自定义各种图表类型，但学习曲线较陡峭。
  - **ECharts/[AntV](https://antv.vision/)/Chart.js**：开箱即用的图表库，提供了丰富的图表组件和配置选项，易于上手，适合快速构建常见的实时图表。
- **性能考量**：
  - **节流与按帧合并**：数据更新频繁时，使用节流（throttle）或 `requestAnimationFrame` 把多次更新合并到一帧再渲染。不要对持续到达的数据流使用防抖（debounce），否则只要数据不停，图表就一直不会刷新。
  - **动画优化**：动画优先使用 CSS `transform` 和 `opacity` 等属性，便于浏览器交给 GPU 合成。
  - **增量渲染**：只更新图表中发生变化的部分。

## **VI.5.4 Web GIS 简介**

**Web GIS（Geographic Information System）** 是把地理信息系统功能集成到 Web 平台上的技术，用于在浏览器中显示、分析地理空间数据并与之交互。

- **核心功能**：地图显示、地理数据查询、空间分析、路径规划、地理编码/逆地理编码等。
- **前端技术栈**：
  - **地图库**：[Leaflet.js](https://leafletjs.com/)（轻量级、灵活）、[OpenLayers](https://openlayers.org/)（功能全面、复杂）、[Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)（基于 WebGL，高性能、定制性强）。
  - **数据格式**：[GeoJSON](https://geojson.org/)、[TopoJSON](https://github.com/topojson/topojson)、[KML](https://www.ogc.org/standards/kml/)、[WKT](https://www.ogc.org/standards/sfa/) 等。
  - **可视化**：结合 D3.js、ECharts GL 等库，在地图上叠加热力图、散点图、轨迹图等。
- **应用场景**：位置服务、智慧城市、物流追踪、环境监测、灾害预警、房地产分析等。

## **VI.5.5 用 Worker 预处理大批量数据**

当聚合、排序或采样占用主线程时，可以把计算移到 Worker，并把结果以明确消息契约返回：

```ts
// chart.worker.ts
self.onmessage = (event: MessageEvent<Float32Array>) => {
  const values = event.data;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  for (const value of values) {
    min = Math.min(min, value);
    max = Math.max(max, value);
    sum += value;
  }

  self.postMessage({ min, max, average: values.length ? sum / values.length : 0 });
};
```

```ts
const worker = new Worker(new URL("./chart.worker.ts", import.meta.url), {
  type: "module",
});

const values = new Float32Array([12, 18, 9, 27]);
worker.onmessage = ({ data }) => console.log("统计结果", data);
worker.postMessage(values, [values.buffer]);
```

传输数据前应衡量复制成本、内存峰值和序列化开销。Worker 负责计算，主线程负责交互和渲染，图表仍应提供数据表、摘要和键盘可达的替代阅读路径。
