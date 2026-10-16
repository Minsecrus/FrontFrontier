---
title: "VI. 新兴技术和专业领域 / VI.1 渐进式 Web 应用程序（PWA）：原生般的 Web 体验"
---

# VI.1 渐进式 Web 应用程序（PWA）：原生般的 Web 体验

**目的**：兼具网站的易触达与移动应用的能力，提供更快的加载、离线可用和接近原生应用的体验。

- **关键组件**：
  - [**Service Workers**](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)：在后台运行的脚本，支持离线缓存、后台同步和推送通知等功能。
  - [**Web App Manifest**](https://developer.mozilla.org/en-US/docs/Web/Manifest)：一个 JSON 文件，向浏览器提供有关 PWA 的信息（名称、图标、显示模式），“添加到主屏幕”和推送通知都依赖它。
  - **推送通知**：服务器可以向用户设备发送消息，即使用户当前没有打开该 Web 应用。
- **优点**：及时推送消息、召回用户、个性化内容、离线可用。

## **VI.1.1 衡量与提升性能**

- **PRPL 模式（PRPL Pattern）：** Google 提出的性能模式，用于加快 Web 应用的加载与交互响应。字母含义如下：
  - **Push（推送）：** 为初始路由推送关键资源。
  - **Render（渲染）：** 渲染初始路由，尽快让用户看到内容。
  - **Pre-cache（预缓存）：** 使用 Service Worker 预缓存剩余的路由资源。
  - **Lazy-load（懒加载）：** 按需懒加载和创建剩余的路由。

这个模式是构建高性能 PWA 的指导思想。

- **RAIL 模型（RAIL Model）：** 以用户为中心的性能模型，用于衡量应用的性能表现。RAIL 代表：
  - **Response（响应）：** 在 100 毫秒内响应用户输入。
  - **Animation（动画）：** 动画的每一帧在 16 毫秒内完成（即 60 fps）。
  - **Idle（空闲）：** 利用主线程的空闲时间来完成延迟任务。
  - **Load（加载）：** 在中端移动设备和慢速网络下，5 秒内交付内容并可交互；后续访问争取 2 秒内完成加载（见 [web.dev RAIL](https://web.dev/articles/rail)）。

这个模型为 PWA 的性能优化提供了明确的量化目标。

- **Performance Metrics（性能指标）：** 当前稳定的 Core Web Vitals 主要包括 LCP（最大内容绘制）、INP（Interaction to Next Paint，交互到下一次绘制）和 CLS（累积布局偏移）。LCP 关注加载速度，INP 关注整体交互响应性，CLS 关注视觉稳定性。这三项指标是量化用户体验的具体工具，帮助你评估应用真实的加载速度、响应性和视觉稳定性。
- **使用 Lighthouse / DevTools：** 这两者是实践工具。Lighthouse 是自动化的网站质量评估工具，可以审计性能、无障碍、最佳实践和 SEO 并给出优化建议。Lighthouse 12（2024 年）已[移除 PWA 类别](https://github.com/GoogleChrome/lighthouse/releases/tag/v12.0.0)，[PWA](https://web.dev/progressive-web-apps/) 的可安装性、Manifest 和 Service Worker 状态改在 [DevTools 的 Application 面板](https://developer.chrome.com/docs/devtools/progressive-web-apps/)中检查。Chrome DevTools 的 Performance 面板则用于深入定位性能瓶颈。

## **VI.1.2 浏览器 API**

本节介绍的 API 让网站突破传统页面的限制，获得更接近原生应用的能力，是 PWA 做到“可靠”（Reliable）和“有吸引力”（Engaging）的技术基础。

- **Service Workers：** PWA 技术栈的基础。它是独立于页面、在浏览器后台运行的脚本，能够拦截和处理网络请求，为 PWA 提供两项核心能力：
  - **离线访问**：即使设备没有网络连接，Service Worker 也能从缓存中返回内容，让应用可以离线使用。这是实现“可靠”的关键。
  - **消息推送**：即使用户关闭了浏览器页面，Service Worker 也能接收服务器发来的推送通知，重新吸引用户回来。
- **Storage（存储）：** 包括 Web Storage（localStorage、sessionStorage）、IndexedDB 和 Cache Storage 等。为了实现离线体验，你必须能把应用数据（如文章内容、用户信息）存储在用户的设备上。注意 Service Worker 中只能使用 IndexedDB、Cache API 这类异步存储，同步的 Web Storage 在 Service Worker 里不可用；需要与 Service Worker 共享的离线数据应放进 IndexedDB。
- **WebSocket / Server-Sent Events（SSE）：** 分别提供客户端与服务器之间的实时双向和单向通信，可用于实时聊天、数据实时更新等功能。
- **Location（地理位置）、Device Orientation（设备方向）、Payments（支付）、Credentials（凭证管理）：** 这些 API 让 Web 应用能够使用过去多为原生应用专有的设备硬件和系统功能，例如获取用户位置、感知设备旋转、调用系统支付界面，缩小了 Web 应用与原生应用之间的差距。
- **Notifications（通知）：** 通常与 Service Worker 配合使用，负责把推送消息展示给用户。借助它，PWA 可以像原生应用一样在用户不活跃时提醒用户回来，这是“有吸引力”的重要体现。

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

PWA（Progressive Web Apps）融合了 Web 的开放性与原生应用的优势，核心特性包括：

- **可安装性（Installability）**：通过 [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) 定义应用的名称、图标、主题色、启动 URL 等，让应用可以添加到主屏幕，获得类似原生应用的启动体验。
- **离线能力（Offline Capability）**：通过 Service Worker 拦截网络请求，实现资源缓存、离线访问和断网提示。
- **推送通知（Push Notifications）**：通过 Service Worker 和 [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) 向用户发送通知，用户未打开应用时也能收到消息。
- **后台同步（Background Sync）**：用户离线时操作先在本地排队，恢复联网后再自动发出请求，例如离线提交表单。
- **Web Share API / Web Share Target API**：调用操作系统的原生分享功能，或作为分享目标接收其他应用分享的内容。
- **SEO**：PWA 同样需要做 SEO，包括提交站点地图、为每个视图提供独立 URL（使用 History API）、监控性能、优化元数据和结构化数据（Schema），以及按需采用 SSR/SSG 等混合渲染。

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
