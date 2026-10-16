---
title: "III. 基本开发环境和工具 / III.4 包管理器：npm、Yarn 和 pnpm 依赖管理"
---

# III.4 包管理器：npm、Yarn 和 pnpm 依赖管理

**目的**：管理 JavaScript 项目中的依赖项（可重用代码包），负责包的安装、更新、配置和删除。

- **npm（Node Package Manager）**：随 [Node.js](https://nodejs.org/) 一起安装，是使用最广泛的包管理器，并持续加强可信发布、来源证明（provenance）和安全审计能力。
- [**Yarn**](https://yarnpkg.com/)：由 Facebook 开发，注重速度、正确性、安全性和开发者体验，提供离线缓存、并行安装等功能。
- [**pnpm**](https://pnpm.io/)：用内容寻址存储加硬链接、符号链接组织 `node_modules`，消除重复安装、减少磁盘占用，并防止“幽灵依赖”（代码能引用未在 `package.json` 中声明、只是被间接安装的包）。它在 Monorepo（单仓多项目）和严格依赖治理中很常见。
- [**Bun**](https://bun.sh/)：既是 JavaScript 运行时，也提供包管理、测试和打包能力。它适合追求一体化工具链和高速本地反馈的项目，但仍要评估团队生态、CI、部署平台和兼容性。

从 npm 到 Yarn、pnpm 和 Bun 的演变，反映了行业对效率（速度、磁盘空间）、可靠性（严格的依赖检查，防止幽灵依赖）和供应链安全的持续追求。包管理器的选择会直接影响构建时间、CI/CD 耗时和大型项目的稳定性。

现代项目还应该在 `package.json` 中使用 `packageManager` 字段固定包管理器和版本，并结合 Corepack 或团队统一的安装脚本，让同一仓库总能生成一致的锁文件。注意：Node.js 25 起安装包不再附带 Corepack，需要先通过 `npm install -g corepack` 单独安装（见 [Corepack 仓库](https://github.com/nodejs/corepack)）；Node.js 16.9~24 仍内置 Corepack。

::: details 示例：packageManager + Corepack

```json
{
  "name": "frontend-app",
  "private": true,
  "packageManager": "pnpm@9.15.9",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

```sh
# Node.js 25+ 需先单独安装 Corepack；Node.js 16.9~24 可跳过这一行
npm install -g corepack
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm install --frozen-lockfile
```

`packageManager` 告诉团队和 CI：这个仓库应该用哪个包管理器和版本。Corepack 则负责按这个声明准备对应工具，减少“有人用 npm、有人用 pnpm、锁文件来回变”的问题。

:::

**表格：流行 JavaScript 包管理器比较**

| 特性         | [npm](https://www.npmjs.com/)          | [Yarn](https://yarnpkg.com/)            | [pnpm](https://pnpm.io/)                 | [Bun](https://bun.sh/)                     |
| :----------- | :------------------------------------- | :-------------------------------------- | :--------------------------------------- | :----------------------------------------- |
| **安装**     | 随 [Node.js](https://nodejs.org/) 捆绑 | Corepack、全局安装或项目内安装          | Corepack、全局安装或项目内安装           | 独立运行时与工具链                         |
| **核心理念** | 简单易用、广泛兼容                     | 速度、可靠性、安全性、开发者体验        | 磁盘空间优化、严格依赖检查               | 高速、一体化运行时和工具链                 |
| **独特功能** | 默认包管理器、审计、可信发布           | Plug'n'Play、约束（Constraints，校验工作区依赖规则）、工作区 | 内容寻址存储、工作区、防止幽灵依赖       | 安装、运行、测试、打包能力集成             |
| **性能**     | 稳定，生态兼容性强                     | 快速安装，高效利用资源                  | 高速安装，大幅减少磁盘占用               | 安装和脚本执行速度突出                     |
| **适用场景** | 默认选择、开源包发布、兼容性优先       | 强约束 Monorepo、成熟团队规范 | 大型 Monorepo、严格依赖、磁盘空间敏感项目 | 新项目试验、一体化开发体验（DX）、对 Bun 兼容性有把握 |