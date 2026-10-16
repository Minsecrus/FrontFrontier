---
title: "VI. 新兴技术和专业领域 / VI.1 渐进式 Web 应用程序（PWA）：原生般的 Web 体验"
---

# VI.1 渐进式 Web 应用程序（PWA）：原生般的 Web 体验

渐进式 Web 应用（PWA）在不引入应用商店分发的前提下，用标准 Web 技术补齐弱网与离线可用、主屏安装、后台消息触达三项能力。其运行建立在三个核心机制之上：

- [**Service Workers**](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)：独立于页面的后台脚本，负责拦截网络请求、管理离线缓存、执行后台同步与接收推送。
- [**Web App Manifest**](https://developer.mozilla.org/en-US/docs/Web/Manifest)：描述应用名称、图标、启动路径与窗口显示模式的 JSON 清单，“添加到主屏幕”和安装提示均依赖它。
- **推送通知**：结合 Service Worker 与推送服务，在用户未打开页面时下发消息并召回用户。

## **VI.1.1 衡量与提升性能**

PWA 的离线与安装体验建立在首屏加载和交互性能达标的基础上，通常从加载架构、量化目标、核心指标和调试工具四个层面把控：

- **PRPL 模式（PRPL Pattern）**：面向单页与渐进式应用的加载架构模式：
  - **Push（推送）**：优先推送或预加载初始路由的关键资源。
  - **Render（渲染）**：尽快完成初始路由渲染，缩短白屏时间。
  - **Pre-cache（预缓存）**：由 Service Worker 在后台预缓存后续路由资源。
  - **Lazy-load（懒加载）**：按需加载并实例化剩余路由与非关键模块。
- **RAIL 模型（RAIL Model）**：将用户体验拆解为四个可量化的性能预算（见 [web.dev RAIL](https://web.dev/articles/rail)）：
  - **Response（响应）**：在 100 毫秒内响应用户输入。
  - **Animation（动画）**：单帧渲染与逻辑控制在 16 毫秒内完成（60 fps）。
  - **Idle（空闲）**：将非紧急任务拆小并推迟到主线程空闲时段执行。
  - **Load（加载）**：在中端移动设备和慢速网络下，首次访问 5 秒内可交互，后续访问控制在 2 秒以内。
- **Performance Metrics（性能指标）**：当前稳定的 Core Web Vitals 包括衡量加载速度的 LCP（最大内容绘制）、衡量整体交互响应性的 INP（Interaction to Next Paint，交互到下一次绘制）以及衡量视觉稳定性的 CLS（累积布局偏移）。
- **Lighthouse 与 DevTools**：Lighthouse 用于自动化审计性能、无障碍、最佳实践与 SEO。注意 Lighthouse 12（2024 年）已[移除独立的 PWA 评分类别](https://github.com/GoogleChrome/lighthouse/releases/tag/v12.0.0)，[PWA](https://web.dev/progressive-web-apps/) 的可安装性、Manifest 解析和 Service Worker 生命周期改在 [DevTools 的 Application 面板](https://developer.chrome.com/docs/devtools/progressive-web-apps/)中核查；运行时卡顿与长任务则在 Performance 面板中定位。

## **VI.1.2 浏览器 API**

PWA 依赖一组后台脚本、异步存储与系统集成 API 来处理断网容错和设备交互，接入时需要留意线程限制与权限边界：

- **Service Workers**：运行在独立线程中，无法直接访问 DOM，通过拦截 `fetch` 与监听系统事件提供两项核心能力：
  - **离线访问**：网络不可用或超时时直接从本地缓存返回响应，避免展示浏览器默认的断网错误页。
  - **消息推送**：页面关闭后仍可由系统唤醒，接收服务端推送并触发通知展示。
- **Storage（存储）**：涵盖 Web Storage（`localStorage`、`sessionStorage`）、IndexedDB 和 Cache Storage。Service Worker 内部只能调用 IndexedDB 和 Cache API 等异步存储，同步的 Web Storage 在其中不可用；需要跨主线程与 Service Worker 共享的结构化离线数据应存入 IndexedDB。
- **WebSocket / Server-Sent Events（SSE）**：在线状态下分别提供全双工通信与服务端单向流式推送，常用于实时消息与状态同步。
- **Location（地理位置）、Device Orientation（设备方向）、Payments（支付）、Credentials（凭证管理）**：在安全上下文（HTTPS）与用户授权下调用设备定位、姿态传感、系统支付界面和登录凭证管理。
- **Notifications（通知）**：配合 Service Worker 在系统层面展示通知，需先通过用户手势完成权限申请，并妥善处理权限被拒或被系统静默的情况。

::: details 示例：离线能力是一组明确的缓存决策

Manifest 负责 `name`、`start_url`、`display`、`icons` 等安装元数据，页面通过 `navigator.serviceWorker.register("/sw.js")` 注册 Service Worker。下面只展示最关键的缓存决策：

```js
const CACHE = "reader-v2";
const APP_SHELL = ["/offline.html", "/styles.css", "/app.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  const url = new URL(request.url);
  const isAsset =
    url.origin === self.location.origin &&
    ["style", "script", "image"].includes(request.destination);

  if (isAsset) event.respondWith(cacheFirst(request));
});

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE);
    return (await cache.match("/offline.html")) ??
      new Response("当前离线。", { status: 503 });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}
```

缓存策略应按资源风险和更新方式选择。带身份信息的页面和接口默认走网络；静态资源适合 cache-first，导航更适合 network-first。改变预缓存资源时应更新缓存版本，并在 `activate` 阶段只清理本应用的旧缓存；运行时缓存还要设置数量或过期上限。

:::

除缓存与存储外，交付完整的 [PWA](https://web.dev/progressive-web-apps/) 还需要统筹安装配置、后台队列与搜索引擎可发现性：

- **可安装性（Installability）**：通过 [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) 声明名称、图标、主题色与启动 URL，满足浏览器安装条件后即可添加到主屏幕或桌面并以独立窗口启动。
- **离线能力（Offline Capability）**：由 Service Worker 区分导航请求、静态资源与接口请求，分别落地缓存、离线回退页和断网提示。
- **推送通知（Push Notifications）**：结合 Service Worker 和 [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) 接收服务端推送，在应用未打开时触达用户。
- **后台同步（Background Sync）**：离线时将表单提交等写操作暂存本地队列，待网络恢复后由 Service Worker 在后台重放请求。
- **Web Share API / Web Share Target API**：调用系统原生分享面板，或将 PWA 注册为系统分享目标以接收外部应用传入的内容。
- **SEO**：安装型 Web 应用同样依赖搜索引擎入口，需为每个视图提供独立 URL（History API）、提交站点地图、完善元数据与结构化数据（Schema），并对需要收录的页面采用 SSR/SSG 等渲染方案。

## **VI.1.3 Manifest、注册与更新验证**

最小安装能力由 Manifest、页面链接和 Service Worker 注册共同组成：

```html
<!-- index.html -->
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#172033" />
```

```json
{
  "name": "离线阅读器",
  "short_name": "阅读器",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#172033",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service Worker 注册失败", error);
    });
  });
}
```

验证时使用 DevTools Application 面板检查 Manifest、图标和 Service Worker 状态；切换 Offline 后刷新导航页，更新缓存版本后确认旧缓存只清理本应用命名空间。
