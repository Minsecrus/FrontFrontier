---
title: "VI. 新兴技术和专业领域 / VI.3 跨平台开发：移动端 (React Native, Capacitor)，桌面端 (Electron, Tauri)"
---

# VI.3 跨平台开发：移动端 (React Native, Capacitor)，桌面端 (Electron, Tauri)

**目的**：使用单一代码库（通常是 Web 技术）为多个平台（iOS、Android、Windows、macOS、Linux）构建应用程序。

## **VI.3.1 移动应用程序开发**

- [**React Native**](https://reactnative.dev/)：使用 React 语法为 Android 和 iOS 创建原生移动应用程序，与原生 API 和组件交互。提供原生 UI 和性能。
- [**Capacitor**](https://capacitorjs.com/)：Ionic 推出的跨平台工具，借助原生 WebView 将 Web 应用程序（HTML、CSS、JS）转换为 iOS/Android 应用程序。兼容各类 JS 框架，并支持 PWA。

在 React Native 和 Capacitor 之间做选择，反映了一个根本性的权衡：原生 UI/性能 (React Native) 与 Web 开发者熟悉度/PWA 支持 (Capacitor)。这一决策直接影响开发速度、性能上限，以及现有 Web 代码库能否复用。

### **表格：移动应用程序开发框架比较**

| 框架名称                                     | 核心技术           | 渲染（原生 UI/WebView） | 原生功能访问         | 性能 | 学习曲线 | [PWA](https://web.dev/progressive-web-apps/) 支持 | 理想用例（示例）                                                                 |
| :------------------------------------------- | :----------------- | :---------------------- | :------------------- | :--- | :------- | :------------------------------------------------ | :------------------------------------------------------------------------------- |
| [**React Native**](https://reactnative.dev/) | JavaScript/Native  | 原生 UI                 | 直接访问原生 API     | 较高 | 较陡峭   | 否                                                | 追求原生性能和体验，复杂应用                                                     |
| [**Capacitor**](https://capacitorjs.com/)    | JavaScript/WebView | WebView                 | 通过插件访问原生 API | 中等 | 较低     | 是                                                | 将现有 Web 应用转换为移动应用，[PWA](https://web.dev/progressive-web-apps/) 优先 |

这个表格是理解跨平台移动开发方法核心差异与权衡的关键，展示了不同框架如何在原生性能与 Web 开发便利性之间取得平衡。

## **VI.3.2 桌面应用程序开发**

- [**Electron**](https://www.electronjs.org/)：捆绑 Chromium 实例与 Node.js，以 Web 技术构建跨平台桌面应用。代价是应用体积较大、资源消耗较高。
- [**Tauri**](https://tauri.app/)：使用操作系统的原生 WebView 渲染界面，后端逻辑以 Rust 编写。相比 Electron，应用体积更小、内存占用更低、启动更快，安全性也更为突出。

Tauri 以 Rust 驱动后端、采用原生 WebView，在资源效率与安全性上优势显著，对 Electron 的主导地位发起了有力挑战。这一趋势反映出业界对更轻量、更高性能桌面应用框架的需求，也直接影响着用户体验与系统资源消耗。

### **表格：桌面应用程序开发框架比较**

| 框架名称                                    | 核心技术                                          | 应用程序大小 | 资源使用（CPU/RAM） | 启动时间 | 安全模型           | 开发者体验                                        |
| :------------------------------------------ | :------------------------------------------------ | :----------- | :------------------ | :------- | :----------------- | :------------------------------------------------ |
| [**Electron**](https://www.electronjs.org/) | 捆绑 Chromium + [Node.js](https://nodejs.org/)    | 较大         | 较高                | 较慢     | 较高暴露风险       | 熟悉 Web 技术                                     |
| [**Tauri**](https://tauri.app/)             | 原生 WebView + [Rust](https://www.rust-lang.org/) | 极小         | 较低                | 极快     | 细粒度权限，沙盒化 | 性能优先，[Rust](https://www.rust-lang.org/) 后端 |

这个表格清晰地比较了两个领先的桌面框架，强调架构选择对性能、资源效率与安全性的影响——这些正是桌面应用程序的关键因素。

