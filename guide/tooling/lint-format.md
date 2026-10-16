---
title: "III. 基本开发环境和工具 / III.6 代码质量和一致性：Linter（ESLint / Biome）和 Formatter（Prettier）"
---

# III.6 代码质量和一致性：Linter（ESLint / Biome）和 Formatter（Prettier）（*）

- **Linter（[ESLint](https://eslint.org/)）**：运行一组规则来发现潜在代码缺陷、落实架构约束与最佳实践，维护 JavaScript/TypeScript 代码库质量。ESLint 9 起默认采用 **Flat Config（`eslint.config.js`）**，用模块化的数组配置取代旧的 `.eslintrc.*` 级联继承模型。
- **Formatter（[Prettier](https://prettier.io/)）**：预设风格（opinionated）的代码格式化工具，通过解析 AST（抽象语法树）重新打印代码，让全团队的代码排版保持一致，避免在代码审查中为空格与换行争论。
- **Rust 驱动的新一代高速工具链**：
  - [**Biome**](https://biomejs.dev/)：用 Rust 编写的一体化代码工具链（集成了 Formatter 与 Linter）。官方基准中，其格式化速度约为 Prettier 的 35 倍；支持从 ESLint/Prettier 迁移已有配置，集成方式简单。
  - [**Oxlint**](https://oxc.rs/)：基于 Oxc 编译底层的高速 Linter（官方称比 ESLint 快 50~100 倍），开箱即用地捕获常见 Bug，适合在大型 Monorepo 的 pre-commit 与 CI 阶段做快速拦截。

Linter 和 Formatter 结合使用，是团队协作和代码可维护性的最佳实践。Linter 约束代码逻辑和结构，Formatter 统一代码风格。这样可以减轻代码审查时的认知负荷，避免在代码风格上反复争论，提升开发者体验和代码质量。

在团队项目中，ESLint 和 Prettier 通常会与 [Husky](https://typicode.github.io/husky/)、[lint-staged](https://github.com/lint-staged/lint-staged) 配合使用。Husky 用于管理 Git hooks，例如在 `pre-commit` 阶段触发检查；lint-staged 则只对暂存区中的文件运行 lint 或 format，降低每次提交的扫描成本。这样就把低成本、快速反馈的质量检查提前到提交之前，减少明显的格式问题和基础 lint 错误流入代码审查。

::: details 示例：现代 ESLint Flat Config 与 lint-staged + Husky

**1. 现代 `eslint.config.js`（Flat Config 扁平配置）：**
```js
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig({
  files: ["**/*.{js,jsx,ts,tsx}"],
  extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": "error",
  },
});
```

`defineConfig()` 与 `extends` 由 ESLint 核心提供（9.22+，见 [ESLint 配置文档](https://eslint.org/docs/latest/use/configure/configuration-files)）；typescript-eslint 早期示例中的 `tseslint.config()` 已被标记为弃用，详见 [typescript-eslint 说明](https://typescript-eslint.io/packages/typescript-eslint/#config-deprecated)。

**2. `package.json` 中的 `lint-staged` 与 Husky 钩子：**
```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

```sh
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

Husky 负责在提交前触发 hook，lint-staged 只处理已暂存的文件。这样既能拦住明显问题，又不会每次提交都扫描整个仓库。

:::

**表格：现代代码质量工具生态对比**

| 工具名称 | 主要目的 | 核心优势 | 执行速度 | 语言支持 | 典型适用场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [**ESLint**](https://eslint.org/) | 代码质量、AST 语义检查、架构规则约束 | 庞大插件生态（TypeScript、React、Vue），自定义规则灵活 | 中等（Node.js 运行时） | JS、TS、JSX、Vue、Svelte | 企业级复杂项目、高度定制代码规范 |
| [**Prettier**](https://prettier.io/) | 代码格式化、排版对齐 | 预设标准风格，应用广泛，极少需要手动调参 | 良好 | JS、TS、HTML、CSS、JSON、Markdown | 通用格式化标准 |
| [**Biome**](https://biomejs.dev/) | 格式化 + Lint 一体化 | Rust 编写，响应快，单个二进制文件、无 Node 依赖，提供 VS Code 扩展 | 很快（官方基准中格式化约为 Prettier 的 35 倍） | JS、TS、JSX、JSON、CSS | 追求快速反馈与简洁配置的现代项目 |
| [**Oxlint**](https://oxc.rs/) | 高速代码诊断（Lint） | 零配置扫描主要潜在缺陷，适合嵌入 pre-commit/CI | 很快（官方称比 ESLint 快 50~100 倍） | JS、TS、JSX | 大型 Monorepo 提交门禁与快速 CI 检查 |
