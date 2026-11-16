---
title: "III. 基本开发环境和工具 / III.4 包管理器：npm、Yarn 和 pnpm 依赖管理"
---

# III.4 包管理器：npm、Yarn 和 pnpm 依赖管理

前端工程通常依赖数百个第三方包。包管理器不仅负责下载、更新和卸载依赖，还决定了依赖树如何解析、`node_modules` 如何布局，以及团队与 CI 环境能否复现完全一致的安装结果：

- npm（Node Package Manager）：随 [Node.js](https://nodejs.org/) 默认分发，兼容性最广，近年持续强化可信发布、来源证明（provenance）和安全审计能力。
- [Yarn](https://yarnpkg.com/)：早期为解决 npm 安装慢与锁文件不确定性而生，提供离线缓存、并行安装、Plug'n'Play（PnP）以及校验工作区依赖规则的 Constraints 机制。
- [pnpm](https://pnpm.io/)：用全局内容寻址存储加硬链接、符号链接组织 `node_modules`，消除跨项目重复安装、节省磁盘空间，并默认阻断“幽灵依赖”（即代码直接 `import` 未在 `package.json` 中显式声明、仅被底层依赖间接安装的包），是当前 Monorepo（单仓多项目）与严格依赖治理的主流选择。
- [Bun](https://bun.sh/)：集成了 JavaScript 运行时、包管理、测试运行器和打包能力。安装与脚本启动速度突出，适合追求一体化高速反馈的项目；引入前需核对团队现有工具链、CI 镜像与目标部署平台的兼容性。

包管理器的演进围绕三个核心工程问题展开：缩短本地与 CI 的安装耗时、通过严格隔离防止幽灵依赖引发的线上故障，以及借助锁文件与来源校验保障供应链安全。

为了防止不同成员混用包管理器导致锁文件冲突或依赖解析漂移，项目应在 `package.json` 中用 `packageManager` 字段锁定工具及版本，并配合 Corepack 或统一安装脚本强制执行。注意：Node.js 25 起安装包不再附带 Corepack，需要先通过 `npm install -g corepack` 单独安装（见 [Corepack 仓库](https://github.com/nodejs/corepack)）；Node.js 16.9~24 仍内置 Corepack。

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

下表对比了四款主流包管理器的设计取舍与适用场景：

| 特性         | [npm](https://www.npmjs.com/)          | [Yarn](https://yarnpkg.com/)            | [pnpm](https://pnpm.io/)                 | [Bun](https://bun.sh/)                     |
| :----------- | :------------------------------------- | :-------------------------------------- | :--------------------------------------- | :----------------------------------------- |
| **安装**     | 随 [Node.js](https://nodejs.org/) 捆绑 | Corepack、全局安装或项目内安装          | Corepack、全局安装或项目内安装           | 独立运行时与工具链                         |
| **核心理念** | 简单易用、广泛兼容                     | 速度、可靠性、安全性、开发者体验        | 磁盘空间优化、严格依赖检查               | 高速、一体化运行时和工具链                 |
| **独特功能** | 默认包管理器、审计、可信发布           | Plug'n'Play、约束（Constraints，校验工作区依赖规则）、工作区 | 内容寻址存储、工作区、防止幽灵依赖       | 安装、运行、测试、打包能力集成             |
| **性能**     | 稳定，生态兼容性强                     | 快速安装，高效利用资源                  | 高速安装，大幅减少磁盘占用               | 安装和脚本执行速度突出                     |
| **适用场景** | 默认选择、开源包发布、兼容性优先       | 强约束 Monorepo、成熟团队规范 | 大型 Monorepo、严格依赖、磁盘空间敏感项目 | 新项目试验、一体化开发体验（DX）、对 Bun 兼容性有把握 |

## III.4.1 依赖供应链的双端防线：可信发布与版本冷却期

在锁文件校验与定期漏洞扫描的基础上，现代包管理围绕发布端身份溯源与消费端拉取延迟进一步建立了两道协同防线：

- **发布端**：[npm 可信发布（Trusted Publishing / OIDC）](https://docs.npmjs.com/trusted-publishers)：由 CI/CD 平台（如 GitHub Actions、GitLab CI）在每次发布流水线中动态签发短期 OIDC 凭据，并自动生成加密来源证明（provenance），将发布的产物精确绑定到源码仓库与构建工作流。结合 npm 仓库的“强制双因素认证并停用静态写 Token”设置，可让发布流程全程使用按次签发的短期凭据，增强包发布环节的凭据安全性。
- **消费端：依赖版本冷却期（如 [pnpm `minimumReleaseAge`](https://pnpm.io/settings#minimumreleaseage)）**：恶意接管包往往在发布后极短时间内被社区和安全平台发现并下架。通过在工作区配置中声明最小发布时长（单位为分钟），包管理器会延后安装刚刚发布的新版本，为安全扫描和人工排查争取缓冲窗口；对于确需立即跟进的紧急修复包或内部受控包，可通过白名单单独放行。

::: details 示例：在 pnpm-workspace.yaml 中配置依赖冷却期

```yaml
# pnpm-workspace.yaml
# 仅自动解析发布已满 24 小时（1440 分钟）的依赖版本
minimumReleaseAge: 1440

# 对内部组织作用域或经团队核验可立即升级的包设置例外
minimumReleaseAgeExclude:
  - "@my-org/*"
```

配合 `pnpm install --frozen-lockfile` 与定期依赖更新机器人（如 Renovate 的稳定性年龄策略），可在保持自动更新效率的同时降低短期恶意版本直接进入生产构建的概率。

:::