---
title: "VI. 新兴技术和专业领域 / VI.3 跨平台开发：移动端（React Native、Capacitor），桌面端（Electron、Tauri）"
---

# VI.3 跨平台开发：移动端（React Native、Capacitor），桌面端（Electron、Tauri）

跨平台方案解决的核心问题，是在复用前端代码与工程体系的同时，接入移动端（iOS、Android）与桌面端（Windows、macOS、Linux）的系统级能力，并在渲染管线、包体积、内存开销与跨端一致性之间做出取舍。

## **VI.3.1 移动应用程序开发**

移动端跨平台方案主要分为“原生组件渲染”和“系统 WebView 容器”两条路线：

- [**React Native**](https://reactnative.dev/)：以 React 编写业务逻辑，界面映射为 iOS/Android 原生视图组件渲染，并可直接桥接原生模块，交互手感和列表滚动性能更贴近纯原生应用。
- [**Capacitor**](https://capacitorjs.com/)：Ionic 推出的 WebView 容器方案，直接将现有 Web 应用（HTML、CSS、JS）打包进 iOS/Android 壳工程，通过插件调用相机、文件系统等原生 API，兼容任意前端框架且可与 [PWA](https://web.dev/progressive-web-apps/) 共用一套产物。

选型取决于团队对 UI 渲染上限与现有 Web 资产复用率的权衡。下表对比了两者的技术边界：

| 框架名称                                     | 核心技术           | 渲染（原生 UI/WebView） | 原生功能访问         | 性能 | 学习曲线 | [PWA](https://web.dev/progressive-web-apps/) 支持 | 适用场景（示例）                                                                 |
| :------------------------------------------- | :----------------- | :---------------------- | :------------------- | :--- | :------- | :------------------------------------------------ | :------------------------------------------------------------------------------- |
| [**React Native**](https://reactnative.dev/) | JavaScript/Native  | 原生 UI                 | 直接访问原生 API     | 较高 | 较陡峭   | 否                                                | 追求原生性能和体验，复杂应用                                                     |
| [**Capacitor**](https://capacitorjs.com/)    | JavaScript/WebView | WebView                 | 通过插件访问原生 API | 中等 | 较低     | 是                                                | 将现有 Web 应用转换为移动应用，[PWA](https://web.dev/progressive-web-apps/) 优先 |

## **VI.3.2 桌面应用程序开发**

桌面端方案的核心分歧在于“是否自带浏览器内核与 Node.js 运行时”：

- [**Electron**](https://www.electronjs.org/)：将特定版本的 Chromium 与 [Node.js](https://nodejs.org/) 一起打包进安装程序。优势是跨操作系统的渲染表现与底层 API 高度一致，可直接复用庞大的 Node 原生模块生态；代价是安装包动辄上百 MB，常驻内存与启动开销较高。
- [**Tauri**](https://tauri.app/)：直接调用操作系统内置的原生 WebView（Windows WebView2、macOS WKWebView、Linux WebKitGTK）渲染前端界面，后端进程使用 [Rust](https://www.rust-lang.org/) 编写。安装包通常仅数 MB，内存占用低、启动快，且默认采用细粒度的能力（Capability）权限隔离；但前端需要自行应对不同系统 WebView 的内核版本与 CSS/API 兼容性差异。

下表对比了 Electron 与 Tauri 在资源消耗、安全模型与开发体验上的差异：

| 框架名称                                    | 核心技术                                          | 应用程序大小 | 资源使用（CPU/RAM） | 启动时间 | 安全模型           | 开发者体验                                        |
| :------------------------------------------ | :------------------------------------------------ | :----------- | :------------------ | :------- | :----------------- | :------------------------------------------------ |
| [**Electron**](https://www.electronjs.org/) | 捆绑 Chromium + [Node.js](https://nodejs.org/)    | 较大         | 较高                | 较慢     | 暴露面较大         | 熟悉 Web 技术                                     |
| [**Tauri**](https://tauri.app/)             | 原生 WebView + [Rust](https://www.rust-lang.org/) | 较小         | 较低                | 较快     | 细粒度权限，沙盒化 | 性能优先，[Rust](https://www.rust-lang.org/) 后端 |

## **VI.3.3 用适配器隔离平台能力**

跨平台 UI 应共享纯业务状态与视图，而将系统通知、文件读写和外部链接打开等受平台约束的能力收敛到统一的适配器接口后：

```ts
export interface PlatformBridge {
  notify(title: string, body: string): Promise<void>;
  openExternal(url: string): Promise<void>;
}

export const browserBridge: PlatformBridge = {
  async notify(title, body) {
    if (!("Notification" in window)) return; // 不支持时由调用方降级为页面内提示
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
    if (Notification.permission !== "granted") return;

    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(title, { body });
    } else {
      new Notification(title, { body }); // 仅桌面浏览器可用
    }
  },
  async openExternal(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  },
};
```

浏览器通知的平台差异很大：Android Chrome 禁止直接 `new Notification()`（会抛 `TypeError`），iOS Safari 只在添加到主屏幕的 Web 应用里提供通知。因此有 Service Worker 时统一使用 [`registration.showNotification()`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification)。

权限请求、失败处理和降级逻辑应由平台适配器统一负责；业务模块只依赖接口，Electron、Tauri、WebView 或原生桥接层分别提供实现。测试业务流程时可以注入内存适配器，减少对真实平台的依赖。

