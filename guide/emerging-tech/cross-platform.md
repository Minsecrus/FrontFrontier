---
title: "VI. 新兴技术和专业领域 / VI.3 跨平台开发：移动端（React Native、Capacitor），桌面端（Electron、Tauri）"
---

# VI.3 跨平台开发：移动端（React Native、Capacitor），桌面端（Electron、Tauri）

**目的**：用一套代码（通常基于 Web 技术）为多个平台（iOS、Android、Windows、macOS、Linux）构建应用程序。

## **VI.3.1 移动应用程序开发**

- [**React Native**](https://reactnative.dev/)：用 React 编写 Android 和 iOS 应用，界面由原生组件渲染，并可调用原生 API，因此能提供原生的 UI 与性能。
- [**Capacitor**](https://capacitorjs.com/)：Ionic 推出的跨平台工具，借助系统原生 WebView，把 Web 应用（HTML、CSS、JS）打包为 iOS/Android 应用。兼容各类 JS 框架，并支持 PWA。

在 React Native 和 Capacitor 之间做选择，本质上是一种权衡：React Native 提供原生 UI 和更高的性能上限；Capacitor 让 Web 开发者沿用熟悉的技术，并能兼顾 PWA。这一选择直接影响开发速度、性能上限，以及现有 Web 代码能否复用。

### **表格：移动应用程序开发框架比较**

| 框架名称                                     | 核心技术           | 渲染（原生 UI/WebView） | 原生功能访问         | 性能 | 学习曲线 | [PWA](https://web.dev/progressive-web-apps/) 支持 | 适用场景（示例）                                                                 |
| :------------------------------------------- | :----------------- | :---------------------- | :------------------- | :--- | :------- | :------------------------------------------------ | :------------------------------------------------------------------------------- |
| [**React Native**](https://reactnative.dev/) | JavaScript/Native  | 原生 UI                 | 直接访问原生 API     | 较高 | 较陡峭   | 否                                                | 追求原生性能和体验，复杂应用                                                     |
| [**Capacitor**](https://capacitorjs.com/)    | JavaScript/WebView | WebView                 | 通过插件访问原生 API | 中等 | 较低     | 是                                                | 将现有 Web 应用转换为移动应用，[PWA](https://web.dev/progressive-web-apps/) 优先 |

## **VI.3.2 桌面应用程序开发**

- [**Electron**](https://www.electronjs.org/)：捆绑 Chromium 实例与 Node.js，以 Web 技术构建跨平台桌面应用。代价是应用体积较大、资源消耗较高。
- [**Tauri**](https://tauri.app/)：使用操作系统的原生 WebView 渲染界面，后端逻辑以 Rust 编写。相比 Electron，应用体积更小、内存占用更低、启动更快，默认权限也更严格。

Tauri 用 Rust 编写后端、使用系统原生 WebView，在资源占用和权限控制上有明显优势，已成为 Electron 之外的常见选择。

### **表格：桌面应用程序开发框架比较**

| 框架名称                                    | 核心技术                                          | 应用程序大小 | 资源使用（CPU/RAM） | 启动时间 | 安全模型           | 开发者体验                                        |
| :------------------------------------------ | :------------------------------------------------ | :----------- | :------------------ | :------- | :----------------- | :------------------------------------------------ |
| [**Electron**](https://www.electronjs.org/) | 捆绑 Chromium + [Node.js](https://nodejs.org/)    | 较大         | 较高                | 较慢     | 暴露面较大         | 熟悉 Web 技术                                     |
| [**Tauri**](https://tauri.app/)             | 原生 WebView + [Rust](https://www.rust-lang.org/) | 较小         | 较低                | 较快     | 细粒度权限，沙盒化 | 性能优先，[Rust](https://www.rust-lang.org/) 后端 |

## **VI.3.3 用适配器隔离平台能力**

跨平台 UI 可以共享业务流程，把通知、文件选择和窗口控制等平台能力收敛到适配器：

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

