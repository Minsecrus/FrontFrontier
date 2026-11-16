---
title: "III. 基本开发环境和工具 / III.5 现代构建工具、打包器与编译器"
---

# III.5 现代构建工具、打包器与编译器（*）

浏览器无法直接运行 TypeScript、JSX、Vue/Svelte 单文件组件或零散的裸模块导入（如 `import { ref } from 'vue'`）。构建工具负责把工程源码转换为可部署产物：在开发期提供毫秒级的热更新（HMR）反馈，在生产期完成语法降级、代码分割（Code Splitting）、死代码消除（Tree Shaking）与资源哈希命名：

- [Webpack](https://webpack.js.org/)：生态最成熟的模块打包器，Loader 与 Plugin 体系覆盖各类复杂定制需求，仍广泛服务于大型存量项目与微前端（Module Federation）工程。
- [Vite](https://vite.dev/)：现代前端应用开发的主流入口。
  - Vite 6 引入了 [Environment API](https://vite.dev/guide/api-environment.html)（目前整体处于 Release Candidate 阶段，部分 API 仍为实验性）。它允许全栈元框架（如 Nuxt、SvelteKit 等构建在 Vite 之上的框架）在同一个 Vite 开发服务器实例中编排多个运行环境（`client`、`ssr`，以及框架自定义的 `rsc`、`edge` 等），不必再为每个环境单独启动和协调服务。
  - [Vite 8](https://vite.dev/blog/announcing-vite8)（2026 年 3 月）起，[Rolldown](https://rolldown.rs/)（基于 Rust 和 Oxc）取代了此前“开发期 esbuild、生产期 Rollup”的双打包器组合，成为统一的打包后端。Rolldown 在显著提升构建速度的同时，兼容现有的 Rollup 插件生态。
  - [Vite+](https://viteplus.dev/)（2026 年 9 月发布 1.0）进一步把开发服务器、打包、测试与规范门禁收拢进统一的 `vp` CLI：在单一配置入口下统筹 Vite 8（Rolldown/Oxc）、Vitest、Oxlint、Oxfmt、tsdown 与缓存感知任务编排（Vite Task），一条 `vp check` 即可顺序或并发完成格式化、Lint 与类型检查。
- [Rspack / Rsbuild](https://rspack.dev/)：基于 Rust 的高性能打包器及其上层构建工具，在兼容 Webpack 配置与插件生态的前提下大幅缩短构建耗时，适合中大型存量工程平滑迁移。
- [esbuild](https://esbuild.github.io/)：用 [Go](https://go.dev/) 编写的高速编译与打包工具，常作为上层工具链的依赖预构建、TS/JSX 转换或代码压缩底层引擎。
- [Rollup](https://rollupjs.org/)：面向 ESM 设计的打包器，擅长静态分析与 Tree Shaking（摇树优化，即在打包时移除未被使用的代码），能够输出干净紧凑的产物，广泛用于开源库构建与框架底层打包。
- [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack)：面向 [Next.js](https://nextjs.org/) 生态的 Rust 增量打包器，强调大型应用开发期的按需编译与函数级增量缓存。
- [SWC](https://swc.rs/) 与 [Oxc](https://oxc.rs/)：基于 Rust 的新一代 TypeScript/JavaScript 编译底层。Oxc（Oxidation Compiler）提供高性能的解析器（Parser）、模块解析器（Resolver）与转换器（Transformer），官方基准中比 SWC 更快，已成为 Rolldown、Oxlint 等工具的共同底层。

避免将不同层级的工具混为一谈，可以按职责将前端构建链路拆解为四层：

- **开发服务器与工程入口**：Vite、Rsbuild、框架内置 dev server；
- **通用应用打包器**：Webpack、Rspack、Turbopack；
- **库构建与产物优化**：Rollup、Rolldown；
- **编译与转换层**：esbuild、SWC、Oxc。

先明确工具所处的层级，才能看清它们是竞争替代关系还是上下游组合关系。

## III.5.1 构建工具的新共性：原生实现与迁移能力并重

Vite/Rolldown/Oxc、Rspack、Turbopack、SWC 和 esbuild 共同指向一个趋势：前端工具链正普遍用 Rust 或 Go 重写计算密集型环节。但原生语言带来的吞吐量提升只是基础，工程选型还需逐一核对以下问题：

- 现有插件、Loader、Transform 和自定义脚本是否兼容；
- ESM、CommonJS、浏览器目标和 Node.js 运行时是否仍然匹配；
- 构建速度提升是否换来了更难排查的配置或调试问题；
- 应用构建、库构建和开发服务器是否应该使用同一套工具。

评估时应把冷启动、增量构建、最终产物体积、生态兼容和迁移成本放在一起测量。官方基准或单个开源项目的跑分仅作线索，最终决策应以目标项目自身的实测数据为准。

下表对比了主流构建工具与编译器的技术定位和适用场景：

| 工具名称                                    | 核心技术                       | 主要用例               | 关键特性（示例）                       | 当前定位           |
| :------------------------------------------ | :----------------------------- | :--------------------- | :------------------------------------- | :----------------- |
| [Webpack](https://webpack.js.org/)      | JavaScript                     | 存量应用、深度定制工程 | Loader、Plugin、Module Federation      | 稳定、生态最深     |
| [Vite](https://vite.dev/)               | 原生 ESM + Rolldown/Oxc 工具链 | 现代应用开发入口       | 快速 HMR、统一打包后端、插件兼容层     | 新项目常用首选之一 |
| [Rspack / Rsbuild](https://rspack.dev/) | Rust                           | 中大型应用、企业工程   | 高性能、Webpack 兼容、迁移成本相对可控 | 近年增长很快       |
| [esbuild](https://esbuild.github.io/)   | Go                             | 转换、压缩、预打包     | 速度快、易嵌入其他工具                 | 常作为底层引擎     |
| [Rollup](https://rollupjs.org/)         | JavaScript                     | 库构建、产物优化       | Tree Shaking、ESM 优先                 | 仍是库生态核心之一 |
| [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack)   | Rust                           | Next.js 开发/构建      | 增量计算、按需工作、默认集成度提升     | Next.js 专用路线   |
| [SWC](https://swc.rs/)                  | Rust                           | 编译、转换、压缩       | 快速 TS/JS 转换、JSX 支持              | 编译层工具         |

选型时可以先回答四个问题：

- 交付目标是业务应用还是可复用库？
- 是从零新建项目，还是改造存量工程？
- 是否强依赖现有的自定义 Webpack Loader/Plugin？
- 当前的主要痛点是本地开发反馈慢、CI 构建耗时长，还是迁移风险不可控？

::: details 示例：防范 Barrel Files 导致的 Tree Shaking 失效与产物膨胀

在大型组件库或工具库中，滥用“桶文件（Barrel Files，即用 `index.ts` 集中重新导出所有模块）”是生产包体积膨胀和开发期编译变慢的常见原因。

**容易引发体积膨胀的反模式：**

```ts
// packages/components/index.ts (桶文件集中导出了 100+ 个大型组件)
export * from "./Button";
export * from "./ComplexChart"; // 依赖了 500KB 的图表库
export * from "./RichEditor";   // 依赖了 800KB 的富文本内核
```

```tsx
// 业务页面：只想使用一个小按钮，却由于引用了 index.ts，导致打包器分析所有关联依赖
import { Button } from "@/components"; 
```

若 `package.json` 未声明 `sideEffects`，或打包器判定模块存在全局副作用，那么使用方即使只导入了 `Button`，图表和编辑器的代码也会被一起打包进页面。

**推荐实践：精确声明 `sideEffects` 与子路径导出**

`packages/components/package.json`：

```json
{
  "name": "@my-app/components",
  "sideEffects": ["**/*.css"],
  "exports": {
    "./button": "./src/Button.tsx",
    "./chart": "./src/ComplexChart.tsx"
  }
}
```

`"sideEffects": ["**/*.css"]` 表示只有 CSS 文件具有全局副作用，其余模块未被使用时都可以安全移除；如果包内没有任何带副作用的文件，可以直接写 `"sideEffects": false`。注意 package.json 是严格 JSON，不能写注释。

```tsx
// 业务页面采用精确的子路径导入，避免解析无关模块：
import { Button } from "@my-app/components/button";
```

现代打包器（Vite/Rollup/Rspack）依赖精确的 `sideEffects` 声明来安全地进行 Tree Shaking。在大型项目中避免多层 Barrel 文件嵌套、规范子路径导出，能明显降低首次构建的内存占用和首屏 JS 体积，具体收益以自己项目的构建报告为准。

:::

## III.5.2 一个最小 Vite 工程的构建闭环

用一个小项目理解“源码、开发服务器、生产产物”三者的关系：

```text
vite-demo/
├─ index.html
├─ package.json
├─ vite.config.ts
└─ src/
   └─ main.ts
```

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^8.0.0"
  }
}
```

```ts
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    sourcemap: true,
    reportCompressedSize: true,
  },
});
```

```ts
// src/main.ts
const root = document.querySelector<HTMLDivElement>("#app");

if (!root) throw new Error("Missing #app");

root.innerHTML = `
  <main>
    <h1>构建闭环</h1>
    <p>开发期由 Vite 提供模块服务，生产期生成可部署资源。</p>
  </main>
`;
```

```powershell
pnpm install
pnpm dev
pnpm build
pnpm preview
```

观察 `dev` 与 `build` 的差异：开发期请求源码模块并提供快速 HMR；生产期完成转换、分块、压缩、hash 命名和 sourcemap 生成。学习工具链时，可以把构建前后的 `dist` 目录、Network 瀑布和终端日志一起记录下来。

## III.5.3 现代开源库与组件库开发规范（Library Authoring）

为他人或团队开发可复用的 npm 库（SDK、工具函数库、UI 组件库）时，面临的约束与构建 Web 应用有明显不同：

1. **`package.json` 现代条件导出（Conditional Exports）**：传统的 `main` 字段正逐步让位于标准的 `exports` 字段，后者支持按运行环境和模块格式精细分发：

   ```json
   {
     "name": "@my-org/core-sdk",
     "type": "module",
     "exports": {
       ".": {
         "import": {
           "types": "./dist/index.d.ts",
           "default": "./dist/index.js"
         },
         "require": {
           "types": "./dist/index.d.cts",
           "default": "./dist/index.cjs"
         }
       },
       "./helpers": {
         "types": "./dist/helpers.d.ts",
         "import": "./dist/helpers.js"
       }
     }
   }
   ```

   注意 ESM 与 CJS 的类型要分开声明：在 `"type": "module"` 的包里，`.d.ts` 会被 TypeScript 当作 ESM 声明。如果 `require` 分支也共用它，CJS 使用者拿到的类型与实际模块格式不符，类型检查工具 attw（are-the-types-wrong，检查包的类型声明在不同模块解析模式下能否被正确识别，见下文）会报“Masquerading as ESM”（伪装成 ESM）。`types` 条件要放在每个分支的第一位；示例中的 `./helpers` 则是只提供 ESM 的子路径。

2. **防范双模块陷阱（Dual Package Hazard）**：当一个库同时分发 ESM 和 CJS 产物时，如果上层应用的不同依赖分别通过 `import` 和 `require` 引入了该库，Node.js 会在内存中加载两份独立的模块实例，库内部的单例（Singleton）或全局状态因此被拆成两份，彼此不同步。常见做法是优先只发布 ESM，或让 CJS 入口只作为一层轻量包装（Wrapper），转发到同一份实现以共享状态。
3. **产物合规性校验工具**：
   - [publint](https://publint.dev/)：自动化检查 `package.json` 的 `exports` 路径与实际文件是否存在映射缺陷；
   - [are-the-types-wrong (attw)](https://github.com/arethetypeswrong/arethetypeswrong.github.io)：严格分析 TypeScript 类型定义文件在 Node10 / Node16 / Bundler 等不同模块解析模式下，是否会出现类型丢失或无法被正确识别的问题。
4. **现代库打包工具链**：
   - [tsdown](https://tsdown.dev/)（基于 Rolldown）与 [unbuild](https://github.com/unjs/unbuild)（Rollup/esbuild 驱动）：只需少量配置即可生成 ESM + CJS 双产物，并原生支持将多个零散的 `.d.ts` 类型声明合并打包为单个精简的 `index.d.ts`（DTS Bundling）。
   - 曾经常用的 [tsup](https://tsup.egoist.dev/)（基于 esbuild）已在 README 中声明不再积极维护，并推荐迁移到 tsdown，见[官方迁移指南](https://tsdown.dev/guide/migrate-from-tsup)。
