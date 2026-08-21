---
title: "III. 基本开发环境和工具 / III.6 代码质量和一致性：Linter (ESLint / Biome) 和 Formatter (Prettier)"
---

# III.6 代码质量和一致性：Linter (ESLint / Biome) 和 Formatter (Prettier)

- **Linter ([ESLint](https://eslint.org/))**：运行一组规则来发现潜在代码缺陷、强制执行架构与最佳实践、维护 JavaScript/TypeScript 代码库质量。ESLint 9+ 全面推行了 **Flat Config (`eslint.config.js`)**，采用模块化数组配置体系彻底替代了过时的 `.eslintrc.*` 级联继承模型。
- **Formatter ([Prettier](https://prettier.io/))**：预设风格的代码格式化工具，通过解析 AST 重新打印代码，确保全团队输出完全统一的代码排版，避免在 Code Review 中就空格与换行产生争论。
- **Rust 驱动的新一代超高速工具链**：
  - [**Biome**](https://biomejs.dev/)：用 Rust 编写的一体化代码工具链（集成了 Formatter 与 Linter），格式化与 Lint 速度比传统 Node.js 工具链快 20~30 倍，支持零配置迁移与极简集成。
  - [**Oxlint**](https://oxc.rs/)：基于 Oxc 编译底座的超高速 Linter（速度比 ESLint 快 50~100 倍），专注于开箱即用捕获常见 Bug，非常适合在大型 Monorepo 的 pre-commit 与 CI 阶段实现毫秒级即时拦截。

Linter 和 Formatter 结合使用，是团队协作和代码可维护性的最佳实践。Linter 强制执行逻辑和结构规则，而 Formatter 处理样式一致性。这减轻了代码审查时的认知负荷，避免了”样式战争”，直接提升开发者体验和代码质量。

在团队项目中，ESLint 和 Prettier 通常会与 [Husky](https://typicode.github.io/husky/)、[lint-staged](https://github.com/lint-staged/lint-staged) 配合使用。Husky 用于管理 Git hooks，例如在 `pre-commit` 阶段触发检查；lint-staged 则只对暂存区中的文件运行 lint 或 format，降低每次提交的扫描成本。这样就把低成本、快速反馈的质量检查提前到提交之前，减少明显的格式问题和基础 lint 错误流入代码审查。

::: details 启发式示例：现代 ESLint Flat Config 与 lint-staged + Husky

**1. 现代 `eslint.config.js` (Flat Config 扁平配置)：**
```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
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
  }
);
```

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

## **表格：现代代码质量工具生态对比**

| 工具名称 | 主要目的 | 核心优势 | 执行速度 | 语言支持 | 典型适用场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [**ESLint**](https://eslint.org/) | 代码质量、AST 语义检查、架构规则约束 | 庞大插件生态（TypeScript, React, Vue），自定义规则极其灵活 | 中等（Node.js 运行时） | JS, TS, JSX, Vue, Svelte | 企业级复杂项目、高度定制代码规范 |
| [**Prettier**](https://prettier.io/) | 代码格式化、排版对齐 | 预设标准风格，全行业公认，极少需要手动调参 | 良好 | JS, TS, HTML, CSS, JSON, Markdown | 通用格式化标准 |
| [**Biome**](https://biomejs.dev/) | 格式化 + Lint 一体化 | Rust 编写，极速响应，单二进制无依赖，与 VS Code 深度集成 | 极快（比传统快 25 倍） | JS, TS, JSX, JSON, CSS | 追求极速反馈与极简配置的现代项目 |
| [**Oxlint**](https://oxc.rs/) | 极速代码诊断 (Lint) | 零配置扫描主要潜在缺陷，适合嵌入 pre-commit/CI | 极致（毫秒级全仓扫描） | JS, TS, JSX | 大型 Monorepo 提交门禁与极速 CI 检查 |
