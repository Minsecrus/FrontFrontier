---
title: "VI. 新兴技术和专业领域 / VI.5 Web 数据可视化"
---

# VI.5 Web 数据可视化

Web 数据可视化关注如何在浏览器中把数据转换成图表、地图、科学内容和实时可交互界面。它和 Web 图形共享 Canvas、SVG、WebGL/WebGPU 等底层能力，但学习重点从“画什么”转向“如何表达数据、处理规模、保持交互性能”。

## VI.5.1 核心可视化技术

- **D3.js（Data-Driven Documents）**：提供比例尺（Scales）、坐标轴、布局算法与 DOM/Canvas 数据绑定原语的底层可视化库，适合高度定制的图形语法与交互，但需自行组织组件状态与渲染更新。
- **图表库（[Chart.js](https://www.chartjs.org/)、[ECharts](https://echarts.apache.org/)、[AntV](https://antv.vision/)）**：封装了常见图表类型、图例、提示框与坐标系的声明式高层库，底层基于 Canvas 或 SVG 渲染，适合快速交付业务报表与监控大盘。
- **MathJax、[KaTeX](https://katex.org/)**：在浏览器中将 LaTeX 数学公式排版为 HTML/CSS、SVG 或 MathML，兼顾渲染速度与屏幕阅读器无障碍输出。
- **Web GIS（Geographic Information System）**：在浏览器中加载瓦片地图、叠加空间矢量数据并执行地理空间查询与交互。

如果关注 React/Vue/Angular 项目里的图表组件选型，可以先读 [数据可视化组件库](/guide/frameworks/data-visualization-libraries)。本篇更偏向渲染模型、性能策略和可视化场景本身。

## VI.5.2 大数据可视化的性能策略

当数据点从数百增长到数万乃至百万级时，直接生成等量 DOM/SVG 节点会迅速耗尽内存并阻塞主线程。工程上通常从数据降维、分批调度、底层渲染和增量更新四个层面拆解瓶颈：

- **数据抽样与聚合**：不在首屏直接绘制全量原始点，而是先在服务端或端侧执行降采样（如 LTTB 保形采样、均匀抽样）与时间窗口聚合（按小时/天汇总），默认呈现宏观趋势，待用户缩放或框选下钻（drill-down）时再按需拉取局部明细。
- **分层渲染与计算解耦**：
  - **视口裁剪**：只计算和绘制当前画布视口（Viewport）及缩放层级内可见的数据点，剔除视口外图元。
  - **渐进式渲染**：交互拖拽或首次加载时先快速绘制低精度轮廓或抽样点，交互静止后再按时间片分批补齐高精度细节。
  - **Web Workers**：将大数组过滤、分组聚合、布局计算和格式解析移入 Worker 线程，避免阻塞主线程的缩放与悬停响应。
- **WebAssembly 与 WebGL/Canvas**：
  - **Wasm**：在端侧处理高密度空间索引、力导向图布局或列式分析（如 DuckDB-Wasm）时，用 Rust/C++ 编译为 Wasm 以降低 CPU 计算耗时。
  - **WebGL/Canvas**：数据点达到数千至上万级时切换为 Canvas 2D 绘制；达到十万级或包含 3D 场景时改用 WebGL/WebGPU 批量提交顶点缓冲。D3.js 的比例尺与布局算法同样可以配合 Canvas/WebGL 渲染层使用。
- **增量更新与虚拟化**：
  - **增量更新**：数据源局部变化时只重绘受影响的图层或脏矩形区域，避免整图重建。
  - **虚拟化**：配套的数据表格与长图例列表只挂载可视区域内的 DOM 节点，随滚动动态复用。

## VI.5.3 实时数据可视化的技术选型

实时监控与行情界面需要在持续到达的数据流下维持稳定帧率，选型涉及传输协议、图表引擎和帧调度策略：

- **实时通信协议**：
  - **WebSocket**：提供全双工长连接，适合客户端需频繁动态切换订阅指标、调整过滤条件或双向交互的场景（如在线交易看盘、交互式监控台）。
  - **Server-Sent Events（SSE）**：基于 HTTP 的单向事件流，协议轻量且原生支持断线重连，适合只由服务端持续推送指标更新的监控大盘。
- **数据处理与渲染库**：
  - [D3.js](https://d3js.org/)：适合自定义流式时间轴过渡与非标图形映射，但高频更新时需手动管理数据窗口裁剪与 Canvas 重绘循环。
  - ECharts / [AntV](https://antv.vision/) / Chart.js：内置动态数据追加接口与默认动画过渡，适合快速搭建标准时序折线图、仪表盘与柱状图。
- **帧率与内存保护**：
  - **节流与按帧合并**：高频消息到达时，先将增量数据写入内存环形缓冲区，再通过节流（throttle）或 `requestAnimationFrame` 合并为每帧最多一次视图刷新。切勿对持续不断的数据流使用防抖（debounce），否则只要消息不中断，画面将永远无法触发重绘。
  - **动画与合成优化**：高频刷新模式下应关闭或缩短昂贵的逐点过渡动画；确需动画时优先使用可由 GPU 合成的变换，或限制同屏活动图元数量。
  - **滑动窗口淘汰**：流式图表必须限制保留的历史点数上限，及时丢弃滑出时间窗口的旧数据，防止长时间挂机导致内存泄漏。

## VI.5.4 Web GIS 简介

Web GIS 将地理空间坐标系、瓦片金字塔与前端渲染结合，核心工程问题在于底图渲染、空间数据格式选择与图层叠加性能：

- **地图渲染引擎**：
  - [Leaflet.js](https://leafletjs.com/)：体积轻量、插件生态丰富，基于 DOM/栅格瓦片与 SVG/Canvas 覆盖物，适合标记点较少、以常规二维底图交互为主的场景。
  - [OpenLayers](https://openlayers.org/)：支持多投影坐标系转换、OGC 标准服务（WMS/WFS）与复杂矢量编辑，适合专业测绘与地理信息系统。
  - [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)：基于 WebGL 渲染矢量瓦片（Vector Tiles），支持无级缩放旋转、3D 地形与建筑拉伸，适合高密度空间点线面渲染与定制地图样式。
- **空间数据格式**：中小型矢量要素常用 [GeoJSON](https://geojson.org/)；需要压缩共享边界并减小传输体积时使用 [TopoJSON](https://github.com/topojson/topojson)；跨系统交换还常涉及 [KML](https://www.ogc.org/standards/kml/) 与 [WKT](https://www.ogc.org/standards/sfa/)。数据量较大时应切片为矢量瓦片（MVT）按视口按需加载，避免一次性解析数十 MB 的 GeoJSON。
- **可视化图层叠加**：在底图之上可结合 D3.js、ECharts GL 或 deck.gl 叠加空间热力图、迁徙飞线、蜂窝聚合与实时轨迹，需注意底图相机矩阵与覆盖物重绘的同步。

## VI.5.5 用 Worker 预处理大批量数据

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
