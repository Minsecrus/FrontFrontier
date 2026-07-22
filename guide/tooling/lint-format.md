---
title: "III. 基本开发环境和工具 / III.6 代码质量和一致性：Linter (ESLint) 和 Formatter (Prettier)"
---

# III.6 代码质量和一致性：Linter (ESLint) 和 Formatter (Prettier)

- **Linter ([ESLint](https://eslint.org/))**：一种工具，运行一组规则来发现可能的问题、强制执行最佳实践、维护 JavaScript 和 TypeScript 代码库的样式一致性。 [typescript-eslint](https://typescript-eslint.io/) 使 ESLint 能够支持 TypeScript。
- **Formatter ([Prettier](https://prettier.io/))**：一种预设风格的代码格式化工具，支持多种语言。它删除原始样式，确保所有输出代码符合一致的样式，可与大多数编辑器集成，并能在保存时运行。

Linter 和 Formatter 结合使用，是团队协作和代码可维护性的最佳实践。Linter 强制执行逻辑和结构规则，而 Formatter 处理样式一致性。这减轻了代码审查时的认知负荷，避免了”样式战争”，直接提升开发者体验和代码质量。

在团队项目中，ESLint 和 Prettier 通常会与 [Husky](https://typicode.github.io/husky/)、[lint-staged](https://github.com/lint-staged/lint-staged) 配合使用。Husky 用于管理 Git hooks，例如在 `pre-commit` 阶段触发检查；lint-staged 则只对暂存区中的文件运行 lint 或 format，降低每次提交的扫描成本。这样就把低成本、快速反馈的质量检查提前到提交之前，减少明显的格式问题和基础 lint 错误流入代码审查。

::: details 启发式示例：lint-staged + Husky

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

## **表格：ESLint 和 Prettier 比较**

| 工具名称                             | 主要目的           | 配置方式           | 集成方式         | 语言支持（示例）                                                     | 优点（示例）         |
| :----------------------------------- | :----------------- | :----------------- | :--------------- | :------------------------------------------------------------------- | :------------------- |
| [**ESLint**](https://eslint.org/)    | 代码质量、最佳实践 | 灵活，高度可配置   | 编辑器、构建工具 | JavaScript, [TypeScript](https://www.typescriptlang.org/)            | 捕获错误，强制规范   |
| [**Prettier**](https://prettier.io/) | 代码格式化         | 预设风格，少量选项 | 编辑器、CLI      | JavaScript, [TypeScript](https://www.typescriptlang.org/), HTML, CSS | 样式一致性，节省精力 |

这个表格对于阐明 Linter 与 Formatter 独特而互补的作用很有价值。它帮助学习者理解为什么两者对专业开发工作流都很必要，以及它们如何提升可维护性、促进协作。
