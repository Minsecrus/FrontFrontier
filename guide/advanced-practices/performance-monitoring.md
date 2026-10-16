---
title: "V. 高级主题和专业开发最佳实践 / V.2 线上性能监控与分析（Performance Monitoring）"
---

# V.2 线上性能监控与分析（Performance Monitoring）（*）

线上性能监控是保障前端用户体验的关键环节。它不局限于开发环境的测试，而是直接从真实用户的视角采集和分析性能数据，帮助团队及时发现并解决问题。

## **V.2.1 真实用户监控（RUM）**

RUM（Real User Monitoring，真实用户监控）通过在页面中嵌入一段 JavaScript 监控代码，采集真实用户使用应用时的行为和性能数据，例如页面加载时间、元素渲染、用户交互、AJAX 请求耗时和 JavaScript 错误。它衡量的是用户在浏览器端的真实体验，可以弥补服务端监控看不到的部分。

RUM 数据的主要用途包括：

- **诊断问题**：定位性能瓶颈和异常，配合实时告警及早发现问题。
- **评估业务影响**：分析性能与转化率、用户满意度等业务指标之间的关系。
- **关键用户旅程分析**：找出注册、商品搜索、结账等关键路径，优先监控和优化这些路径。

RUM 的工作流程分为两个阶段：先通过嵌入的 JS 代码或浏览器 API，从用户浏览器收集页面加载时间、错误、AJAX 请求耗时等数据；再由监控平台对数据进行分类和分析，并通过图表、仪表盘等形式展示，为优化决策提供依据。

RUM 的实践要点包括：

- 明确监控目标，例如降低页面加载时间、减少错误率。
- 为关键用户旅程排定优先级并重点监控。
- 谨慎添加 RUM 采集脚本：只采集真正需要的数据，并以异步方式加载，减少对页面加载的影响。
- 定期审查和分析 RUM 数据，以数据驱动决策。
- 同时监控第三方服务的性能，它们同样可能拖慢整个网站。

## **V.2.2 错误监控工具**

错误监控工具帮助开发者识别、跟踪和解决线上错误，从而改善用户体验，并降低 bug 对业务收入的影响。

[Sentry](https://sentry.io/) 和 [Bugsnag](https://www.bugsnag.com/) 是两款常用的错误监控工具。

Sentry 功能较全面，定制空间大，定价对小型团队较为友好。它提供实时错误跟踪、带上下文信息的崩溃报告、性能监控和用户反馈收集，支持多种编程语言和框架；标签和分类、自定义事件、问题分配流程、发布跟踪、告警规则和仪表盘都可以按需配置。Sentry 适合应用复杂、技术栈多样、需要深度定制并希望同时做性能监控的团队。

Bugsnag 更注重简洁和开箱即用。它会自动对错误分组以减少噪音，提供清晰的堆栈跟踪、可与 Jira、Slack 等工具集成的通知，以及用于确定处理优先级的稳定性评分；界面围绕错误分组和堆栈导航设计。Bugsnag 适合偏好简洁配置、重视移动端支持和稳定性指标的团队。

总体而言，Sentry 定制能力更强，但配置也更复杂；Bugsnag 上手更快，可调整的空间相对较少。应根据团队的需求和工作流评估选择。

## **V.2.3 打包分析工具**

前端构建产物分析的核心目标，是弄清楚“到底是什么把首屏变慢了”。  
构建产物分析适用于所有现代构建链：无论你使用 Vite、Rspack、Webpack 还是框架内置构建链，都应该有一套查看产物组成、区分首屏关键资源、识别第三方库膨胀的办法。

典型工具包括：

- [**Webpack Bundle Analyzer**](https://github.com/webpack-contrib/webpack-bundle-analyzer)：适合 Webpack 项目，可视化查看模块体积与依赖分布。
- [**rollup-plugin-visualizer**](https://github.com/btd/rollup-plugin-visualizer)：常见于 Vite/Rollup 生态，用于查看 Chunk 组成和体积分布。
- 框架内置分析能力：例如 Next.js、Nuxt、Rspack/Rsbuild 生态通常也会提供对应的构建分析方案。

真正重要的是掌握分析思路：

- 分清**首屏关键资源**与**可延后资源**
- 分清**业务代码膨胀**与**第三方依赖膨胀**
- 分清 **JavaScript 体积问题**、**图片字体问题**和**重复请求问题**
- 把“构建体积”与真实用户体验指标（LCP、INP、CLS）联系起来看
- 对 React 应用，还可以结合 React Performance Tracks 这类框架级性能轨迹，区分浏览器主线程成本、React 渲染成本和具体组件更新成本

基于分析报告，常见优化手段包括：代码分割、按需加载、移除未使用代码、替换过重依赖、优化图片与字体、减少 polyfill 冗余、改进缓存策略，并把监控、编辑器、图表等重型模块延后到真正需要的路径。

## **V.2.4 导航性能：Speculation Rules、预取与预渲染**

性能优化不只发生在“页面加载之后”，而是越来越多地发生在**用户点击之前**。  
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
它代表了现代 Web 性能优化从**被动加载**走向**主动预测**的方向。

## **V.2.5 用 PerformanceObserver 采集核心指标**

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

## **V.2.6 前端全链路可观测性（OpenTelemetry）与会话回放（Session Replay）**

现代前端监控已经从孤立的“捕获异常堆栈”升级为端到端分布式可观测体系：

1. **[OpenTelemetry（OTel）](https://opentelemetry.io/) 前端分布式链路追踪**：
   - 前端是微服务调用链路的发起点。通过在前端 `fetch` / `XHR` 请求拦截器中自动注入 W3C Trace Context（`traceparent` 请求头），用同一个 Trace ID 把用户的每次交互与后端 API 网关、微服务和数据库查询串联起来，让前后端可以沿同一条链路排查问题。
2. **基于 [rrweb](https://www.rrweb.io/) 的会话回放（Session Replay）与数据脱敏**：
   - 记录初次全量 DOM 快照，并通过 `MutationObserver` 序列化后续所有细粒度 DOM 变更与鼠标轨迹，像回放录像一样重现线上疑难 bug 发生时的现场。
   - **在采集端脱敏**：必须在浏览器端序列化之前，就把密码、手机号、银行卡号以及带有 `data-privacy="mask"` / `.mask-pii` 标记的敏感文本替换或遮蔽，确保原始数据不离开用户浏览器，防止用户隐私进入分析系统。
