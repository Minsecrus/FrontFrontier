---
title: "III. 基本开发环境和工具 / III.6 代码质量和一致性：Linter（ESLint / Biome）和 Formatter（Prettier）"
---

# III.6 代码质量和一致性：Linter（ESLint / Biome）和 Formatter（Prettier）（*）

代码库由多人协作维护时，未使用的变量、隐式类型转换、悬空 Promise 等逻辑隐患，以及缩进、引号、分号等排版分歧，都会污染 PR Diff 并消耗审查精力。工程上通常把这两类问题拆由 Linter 和 Formatter 分别拦截：

- **Linter**（[ESLint](https://eslint.org/)）：基于 AST（抽象语法树）与类型信息执行静态分析，捕获潜在运行时缺陷并落实架构约束（如规范跨层导入、检查 Hook 依赖完整）。ESLint 9 起默认采用 Flat Config（`eslint.config.js`），用显式的模块化数组配置取代了旧版 `.eslintrc.*` 的隐式级联继承模型；配合官方 [`@eslint/css`](https://github.com/eslint/css/blob/main/docs/rules/use-baseline.md) 等扩展包，还可以借助 `css/use-baseline` 规则在 CI 中自动核验样式特性的 Baseline 兼容性。
- **Formatter**（[Prettier](https://prettier.io/)）：预设风格（opinionated）的代码格式化工具，通过解析 AST 并按统一行宽重新打印代码，让团队将精力聚焦在逻辑本身。
- **Rust 驱动的新一代高速工具链**：
  - [Biome](https://biomejs.dev/)：用 Rust 编写的一体化代码工具链（同时覆盖 Formatter 与 Linter）。官方基准中，其格式化速度约为 Prettier 的 35 倍；支持从 ESLint/Prettier 迁移已有配置，单二进制分发，配置结构简洁。
  - [Oxlint 与 Oxfmt](https://oxc.rs/)：基于 Oxc 编译底层的代码诊断与格式化组合。Oxlint（官方基准比 ESLint 快 50~100 倍）除了承担高风险缺陷的零配置快速扫描，还通过基于 Go 版 TypeScript 的 `tsgolint` 具备了类型感知检查（Type-Aware Linting）能力（例如检测悬空 Promise），从而能够覆盖更深层的语义规则；Oxfmt 则提供兼容 Prettier 规则的高速格式化输出，两者共同作为 [Vite+](https://viteplus.dev/) 的默认代码质量底座。

工程配置中，应当明确划清两者的边界：**Linter 管语义与逻辑缺陷，Formatter 管纯文本排版**（使用 ESLint + Prettier 时，通常配合 `eslint-config-prettier` 关闭 ESLint 中与排版冲突的规则）。这样既能防止格式化规则与 Lint 规则互相打架，也能让人工 Code Review 聚焦于业务语义与架构边界。

为了避免开发者忘记手动运行检查，团队通常将检查工具与 [Husky](https://typicode.github.io/husky/)、[lint-staged](https://github.com/lint-staged/lint-staged) 绑定：Husky 负责注册 Git hooks（如 `pre-commit`），lint-staged 则限制只对本次 `git add` 暂存的文件执行校验与自动修复。这把单次提交的检查耗时控制在秒级，同时将低级语法错误和排版噪音挡在远端仓库之外。

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

下表对比了四款主流代码质量与格式化工具的定位差异：

| 工具名称 | 主要目的 | 核心优势 | 执行速度 | 语言支持 | 典型适用场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [ESLint](https://eslint.org/) | 代码质量、AST 语义检查、架构规则约束 | 庞大插件生态（TypeScript、React、Vue），自定义规则灵活 | 中等（Node.js 运行时） | JS、TS、JSX、Vue、Svelte | 企业级复杂项目、高度定制代码规范 |
| [Prettier](https://prettier.io/) | 代码格式化、排版对齐 | 预设标准风格，应用广泛，极少需要手动调参 | 良好 | JS、TS、HTML、CSS、JSON、Markdown | 通用格式化标准 |
| [Biome](https://biomejs.dev/) | 格式化 + Lint 一体化 | Rust 编写，响应快，单个二进制文件、无 Node 依赖，提供 VS Code 扩展 | 很快（官方基准中格式化约为 Prettier 的 35 倍） | JS、TS、JSX、JSON、CSS | 追求快速反馈与简洁配置的现代项目 |
| [Oxlint / Oxfmt](https://oxc.rs/) | 高速代码诊断（含类型感知）与格式化 | 基于 Oxc 与 `tsgolint`，吞吐量突出，兼容 Prettier 风格与多条核心类型规则 | 很快（官方称比 ESLint 快 50~100 倍） | JS、TS、JSX（Oxfmt 覆盖常见前端文件格式） | 大型 Monorepo 门禁、Vite+ 统一检查与快速 CI |
