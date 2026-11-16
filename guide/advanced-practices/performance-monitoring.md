---
title: "V. 高级主题和专业开发最佳实践 / V.2 线上性能监控与分析（Performance Monitoring）"
---

# V.2 线上性能监控与分析（Performance Monitoring）（*）

实验室环境（本地高配开发机、光纤网络、干净浏览器）跑出的高分，往往掩盖了真实生产环境中的弱网抖动、中低端移动设备掉帧与第三方脚本阻塞。线上性能监控通过直接采集真实用户终端的运行时数据，补齐实验室测试无法覆盖的长尾故障与体验退化。

## V.2.1 真实用户监控（RUM）

RUM（Real User Monitoring，真实用户监控）通过在页面中注入轻量探针或利用浏览器 `PerformanceObserver` API，采集真实用户访问时的加载耗时、元素渲染、交互延迟、接口耗时与运行时异常。它直接反映浏览器端的实际表现，能够暴露服务端监控（APM）无法感知的白屏、卡顿与前端资源加载失败。

RUM 数据主要服务于三类工程决策：

- **定位线上长尾瓶颈**：按机型、网络制式、地域与版本聚合指标，配合分位数告警（如 P75、P95）及早捕获局部退化。
- **量化性能的业务影响**：将 LCP、INP 等耗时分布与注册转化率、结账跳出率等业务漏斗关联，评估优化的真实收益。
- **守护核心用户旅程**：针对注册、商品搜索、结账支付等关键转化路径建立独立的指标基线与专项看板。

RUM 从端侧采集原始性能条目与错误上下文后，上报至聚合平台完成分桶统计、版本对比与趋势可视化。落地时需重点控制采集成本与数据噪音：

- **聚焦可行动的目标指标**：围绕 Core Web Vitals、首屏时间与接口错误率设定明确阈值，避免无差别采集海量无用埋点。
- **按业务关键路径分级采样**：对核心转化链路提高采样率，对高并发普通浏览页面按比例采样以控制上报成本。
- **严控探针自身开销**：采集脚本应保持极小体积并异步加载，利用 `requestIdleCallback` 或 `pagehide` + `sendBeacon` 延后上报，避免监控代码自身阻塞首屏或争抢带宽。
- **纳入第三方脚本监控**：广告、统计、客服组件和外部字体往往是线上性能退化的主要诱因，需单独统计其资源耗时与长任务占比。

## V.2.2 错误监控工具

前端代码经打包压缩后，线上抛出的未捕获异常、未处理的 Promise Rejection 或框架渲染崩溃往往只剩下混淆后的行列号。错误监控工具的核心任务是结合 Source Map 还原原始调用栈，并附带触发异常前的用户操作面包屑（Breadcrumbs）、设备环境与发布版本号，让偶发故障可复现、可归因。

[Sentry](https://sentry.io/) 和 [Bugsnag](https://www.bugsnag.com/) 是两款常用的错误监控工具：

- **Sentry**：功能全面且定制空间大，支持错误跟踪、带上下文面包屑的崩溃报告、性能追踪（Tracing）与会话回放（Session Replay）。其标签过滤、自定义事件、发布版本追踪与告警规则均可深度配置，适合技术栈多样、需要将错误监控与性能链路打通的团队。
- **Bugsnag**：侧重开箱即用的降噪与稳定性治理。它提供高精度的异常自动聚类、清晰的堆栈导航、与 Jira/Slack 的工作流集成，以及基于无崩溃会话率计算的“稳定性评分（Stability Score）”，适合希望减少配置维护成本、重点考核版本稳定性的团队。

选型时主要权衡定制深度与维护成本：需要自托管或全链路深度定制时优先考虑 Sentry；追求快速接入与清晰的移动端/前端稳定性水位评估时可考虑 Bugsnag。

## V.2.3 打包分析工具

前端构建产物分析的核心目标，是弄清楚“到底是什么把首屏变慢了”。  
构建产物分析适用于所有现代构建链：无论你使用 Vite、Rspack、Webpack 还是框架内置构建链，都应该有一套查看产物组成、区分首屏关键资源、识别第三方库膨胀的办法。

典型工具包括：

- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)：适合 Webpack 项目，可视化查看模块体积与依赖分布。
- [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer)：常见于 Vite/Rollup 生态，用于查看 Chunk 组成和体积分布。
- 框架内置分析能力：例如 Next.js、Nuxt、Rspack/Rsbuild 生态通常也会提供对应的构建分析方案。

真正重要的是掌握分析思路：

- 分清首屏关键资源与可延后资源
- 分清业务代码膨胀与第三方依赖膨胀
- 分清 JavaScript 体积问题、图片字体问题和重复请求问题
- 把“构建体积”与真实用户体验指标（LCP、INP、CLS）联系起来看
- 对 React 应用，还可以结合 React Performance Tracks 这类框架级性能轨迹，区分浏览器主线程成本、React 渲染成本和具体组件更新成本

基于分析报告，常见优化手段包括：代码分割、按需加载、移除未使用代码、替换过重依赖、优化图片与字体、减少 polyfill 冗余、改进缓存策略，并把监控、编辑器、图表等重型模块延后到真正需要的路径。

## V.2.4 导航性能：Speculation Rules、预取与预渲染

性能优化不只发生在“页面加载之后”，而是越来越多地发生在用户点击之前。  
浏览器可以根据开发者提供的线索，提前执行预取（prefetch）或预渲染（prerender），缩短用户跳转到下一个页面时的等待时间。

- **传统预取**：如 `<link rel="prefetch">`，适合提前获取未来可能会用到的资源。
- **Speculation Rules API**：用声明式 JSON 规则告诉浏览器哪些链接值得预取或预渲染。相比旧式提示，它更适合现代导航性能优化。
- **预渲染（prerender）**：浏览器不仅提前请求资源，还可能在后台完成页面准备工作，因此命中时几乎像“秒开”。

这一能力非常适合：

- 内容站文章列表到文章详情
- 电商列表到商品详情
- 文档站目录到正文页
- 多页应用（MPA）或混合渲染应用中用户大概率会访问的下一个页面

使用这类能力时要同时控制收益和成本：

- 对高概率链接优先预渲染，控制带宽和算力成本
- 个性化页面、强依赖登录态页面要格外谨慎
- 要结合真实用户路径判断“用户接下来可能会点哪里”
- 要通过 RUM 和实验室测试共同验证收益

如果说代码分割是在“减少当前页面成本”，那么 Speculation Rules 更像是在“投资下一次导航”。  
它代表了现代 Web 性能优化从被动加载走向主动预测的方向。

## V.2.5 用 PerformanceObserver 采集核心指标

浏览器指标应与页面版本、路由一起上报，并配合采样策略。下面的示例只演示采集与上报的基本结构，脱敏等要求见示例后的说明；具体上报地址由项目的监控平台提供。

```js
const metrics = [];

function observe(name, type, value) {
  metrics.push({ name, value, type, route: location.pathname });
}

new PerformanceObserver((list) => {
  const entry = list.getEntries().at(-1);
  if (entry) observe("lcp", entry.entryType, entry.startTime);
}).observe({ type: "largest-contentful-paint", buffered: true });

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) observe("cls", entry.entryType, entry.value);
  }
}).observe({ type: "layout-shift", buffered: true });

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    observe("long-task", entry.entryType, entry.duration);
  }
}).observe({ type: "longtask", buffered: true });

addEventListener("pagehide", () => {
  if (!metrics.length) return;
  navigator.sendBeacon(
    "/rum",
    JSON.stringify({
      metrics,
      version: document.documentElement.dataset.version,
    }),
  );
});
```

生产实现还应加入 INP、采样率、连接类型、设备类别、请求 ID 和错误事件关联，并过滤 URL 参数、表单输入和用户内容。指标需要按路由、版本和设备分组，再与业务路径一起解释。

## V.2.6 前端全链路可观测性（OpenTelemetry）与会话回放（Session Replay）

现代前端监控已经从孤立的“捕获异常堆栈”升级为端到端分布式可观测体系：

1. **[OpenTelemetry（OTel）](https://opentelemetry.io/) 前端分布式链路追踪**：
   - 前端是微服务调用链路的发起点。通过在前端 `fetch` / `XHR` 请求拦截器中自动注入 W3C Trace Context（`traceparent` 请求头），用同一个 Trace ID 把用户的每次交互与后端 API 网关、微服务和数据库查询串联起来，让前后端可以沿同一条链路排查问题。
2. **基于 [rrweb](https://www.rrweb.io/) 的会话回放（Session Replay）与数据脱敏**：
   - 记录初次全量 DOM 快照，并通过 `MutationObserver` 序列化后续所有细粒度 DOM 变更与鼠标轨迹，像回放录像一样重现线上疑难 bug 发生时的现场。
   - **在采集端脱敏**：必须在浏览器端序列化之前，就把密码、手机号、银行卡号以及带有 `data-privacy="mask"` / `.mask-pii` 标记的敏感文本替换或遮蔽，确保原始数据不离开用户浏览器，防止用户隐私进入分析系统。
