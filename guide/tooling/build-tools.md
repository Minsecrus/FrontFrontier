---
title: "III. 基本开发环境和工具 / III.5 现代构建工具、打包器与编译器"
---

# III.5 现代构建工具、打包器与编译器

**目的**：将源码转换为可部署产物，在开发期提供快速反馈循环，在生产环境提供更小、更快、更稳定的输出。

- [**Webpack**](https://webpack.js.org/)：经典而成熟的模块打包器。生态极其完整，插件与 Loader 丰富，仍广泛用于大型存量项目和高度定制化工程。
- [**Vite**](https://vite.dev/)：现代前端开发的主流选择之一。开发期依赖原生 ESM 和极快的 HMR；新的主线版本已经切换到 [Rolldown](https://vite.dev/guide/rolldown) 作为统一的 Rust 打包后端，并继续尽量保持与 Rollup 插件生态的兼容。使用新版 Vite 时需留意 Node.js 版本要求。
- [**Rspack / Rsbuild**](https://rspack.dev/)：基于 Rust 的高性能打包器及其上层构建工具，在兼容 Webpack 生态的同时追求更快的构建速度。对中大型应用和企业级工程尤具吸引力。
- [**esbuild**](https://esbuild.github.io/)：用 [Go](https://go.dev/) 编写的超高速编译/打包工具，常作为构建链中的基础能力使用，例如预打包、转换、压缩，或充当其他工具的底层引擎。
- [**Rollup**](https://rollupjs.org/)：偏向库构建的打包器，擅长 tree-shaking 和生成干净的 ESM/CJS 输出。很多工具会把它作为生产构建阶段的核心部件。
- [**Turbopack**](https://turbo.build/pack)：面向 [Next.js](https://nextjs.org/) 生态的 Rust 增量打包器，强调大型应用开发期的响应速度与按需计算能力。
- [**SWC**](https://swc.rs/)：基于 Rust 的 TypeScript/JavaScript 编译器，核心定位是“编译与转换”，常作为框架或工具链的底层编译层。

前端工具链的职责分层正变得愈加清晰：

- 开发服务器与工程入口：Vite、Rsbuild、框架内置 dev server
- 通用应用打包器：Webpack、Rspack、Turbopack
- 库构建与产物优化：Rollup、Rolldown
- 编译与转换层：esbuild、SWC、Oxc

因此，讨论构建工具时应区分“开发体验”“应用打包”“库打包”“编译层”这几个不同职责。

## **表格：领先构建工具/打包器比较**

| 工具名称                                    | 核心技术                                        | 主要用例                                 | 关键特性（示例）                         | 当前定位                            |
| :------------------------------------------ | :---------------------------------------------- | :--------------------------------------- | :--------------------------------------- | :---------------------------------- |
| [**Webpack**](https://webpack.js.org/)      | JavaScript                                      | 存量应用、深度定制工程                   | Loader、Plugin、Module Federation        | 稳定、生态最深                      |
| [**Vite**](https://vite.dev/)               | 原生 ESM + Rolldown/Oxc 工具链                  | 现代应用开发入口                         | 快速 HMR、统一打包后端、插件兼容层       | 新项目常用首选之一                  |
| [**Rspack / Rsbuild**](https://rspack.dev/) | Rust                                            | 中大型应用、企业工程                     | 高性能、Webpack 兼容、迁移成本相对可控   | 近年增长很快                        |
| [**esbuild**](https://esbuild.github.io/)   | [Go](https://go.dev/)                           | 转换、压缩、预打包                       | 极快、嵌入式能力强                       | 常作为底层引擎                      |
| [**Rollup**](https://rollupjs.org/)         | JavaScript                                      | 库构建、产物优化                         | Tree-shaking、ESM 优先                   | 仍是库生态核心之一                  |
| [**Turbopack**](https://turbo.build/pack)   | Rust                                            | [Next.js](https://nextjs.org/) 开发/构建 | 增量计算、按需工作、默认集成度提升       | Next.js 专用路线                    |
| [**SWC**](https://swc.rs/)                  | Rust                                            | 编译、转换、压缩                         | 快速 TS/JS 转换、JSX 支持                | 编译层工具                          |

选择这些工具时，最实用的判断标准包括：

- 你做的是应用还是库
- 你是在新建项目还是迁移老项目
- 你是否依赖现有 Webpack 生态
- 你更在意开发时反馈速度，还是迁移成本和生态成熟度
