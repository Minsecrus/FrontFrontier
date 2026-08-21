---
title: "IV. 前端框架和库：构建现代 UI / IV.1 UI 框架概述：React、Vue、Angular、Svelte、SolidJS、Lit"
---

# IV.1 UI 框架概述：React、Vue、Angular、Svelte、SolidJS、Lit

**目的**：提供构建交互式用户界面的结构化方法，封装底层 DOM 操作并简化状态管理。

当前主流 UI 框架的差异需要同时从**编译优化、服务端/客户端分工、细粒度响应性（Fine-grained Reactivity）和运行时体积**等维度综合评估：

- [**React**](https://react.dev/)：以组件化、声明式理念和庞大生态闻名。**React 19** 将 Actions 原语（`useActionState`、`useOptimistic`、`useFormStatus`、`use()`）和 Server Components (RSC) 标准化；**[React Compiler](https://react.dev/learn/react-compiler)**（原 Forget 项目）通过静态编译推导自动完成细粒度记忆化（Auto-memoization），彻底消除手动编写 `useMemo` / `useCallback` 及依赖数组的心智负担。
- [**Vue**](https://vuejs.org/)：渐进式框架，在灵活性与简洁性之间取得极佳平衡。**Vue 3.5+** 全面重构了响应式引擎（内存开销直降 56%，大型数组追踪性能提升达 10 倍），引入 `onWatcherCleanup()`、`useTemplateRef()` 与 `useId()`；同时积极推进 **Vapor Mode**（无虚拟 DOM 的纯原生 DOM 编译模式，对标 SolidJS）。
- [**Svelte**](https://svelte.dev/)：编译时框架先驱。**Svelte 5** 完成了向 **Runes（符文系统：`$state`、`$derived`、`$effect`、`$props`、`$bindable`）** 的架构跃迁，打破了旧版仅在 `.svelte` 单文件生效的限制，实现了跨 `.svelte.ts` 文件的通用细粒度响应式，并以 **Snippets (`{#snippet}`)** 取代了传统 Slots。
- [**SolidJS**](https://www.solidjs.com/)：细粒度响应式标杆。组件函数仅在挂载时执行一次，后续状态变更直接通过 Signals 依赖图精确定向驱动原生 DOM 节点，零虚拟 DOM 树 Diff 开销。
- [**Angular**](https://angular.dev/)：Google 主导的企业级全栈框架。全面推进 **Signals** 与 **Zoneless（无 zone.js 猴子补丁）** 架构，配合独立组件（Standalone Components）与强类型表单，大幅精简运行时并提升变更检测性能。
- [**Lit**](https://lit.dev/)：Google 推出的轻量级 [Web Components](https://www.webcomponents.org/) 库，深度贴近浏览器标准，提供声明式模板、响应式属性与原生 Shadow DOM 隔离。

UI 框架的多样性，反映了在响应性（虚拟 DOM vs. 细粒度 Signals vs. 编译时代码生成）和开发者体验（灵活性 vs. 强预设约束）上的不同理念。

## **从框架名称转向渲染模型**

学习或选型时，可以先回答这些与框架无关的问题：

| 判断问题 | 需要理解的概念 | 常见影响 |
| :--- | :--- | :--- |
| **代码运行在哪里？** | 浏览器、服务器、边缘运行时、构建期 | 能否访问 DOM、密钥和请求上下文 |
| **状态如何更新？** | 虚拟 DOM Diff、Signals 依赖图、编译时转换 (Svelte/Vapor) | 更新范围、调试方式和运行时成本 |
| **HTML 如何到达用户？** | CSR、SSR、流式渲染 (Streaming)、预渲染 (SSG)、可恢复性 (Resumability) | 首屏性能、交互时机和部署复杂度 |
| **数据如何进入组件？** | loader、Server Functions、RSC、查询缓存、客户端状态 | 序列化、错误恢复、缓存失效和权限边界 |
| **优化由谁完成？** | 手工 memo、编译器 (React Compiler)、静态分析、运行时调度 | 代码写法、迁移风险和性能验证方式 |

这些能力的组合才是框架的真实运行模型。版本和 API 会变化，模型和边界判断更值得长期掌握。

## **表格：流行 UI 框架比较 (React, Vue, Svelte, SolidJS, Angular)**

| 框架名称 | 核心机制与响应性范式 | 学习曲线 | 性能与运行时开销 | 生态系统与工具链 | 理想用例（示例） |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [**React**](https://react.dev/) | 声明式 JSX，虚拟 DOM，React Compiler 自动记忆化，Actions 原语 | 较陡峭 | 良好；Compiler 大幅降低重渲染损耗 | 极其庞大，全行业事实标准 | 大型复杂业务系统、跨平台应用 (React Native) |
| [**Vue**](https://vuejs.org/) | 响应式 Proxy（Vue 3.5 高性能重构）+ 模板编译优化；可选 Vapor Mode | 较平缓 | 极佳；内存占用极低，启动轻量 | 庞大且成熟，官方生态高度统一 | 中大型企业系统、面向公众的现代 Web 应用 |
| [**Svelte**](https://svelte.dev/) | 编译时无虚拟 DOM，Svelte 5 Runes 通用细粒度响应式 | 较低 | 极佳；包体积极小，运行极速 | 正在快速扩张，SvelteKit 成熟 | 高性能关键型产品、交互式数据可视化、轻量嵌入组件 |
| [**SolidJS**](https://www.solidjs.com/) | 纯原生 DOM 操作，Signals 依赖图驱动，组件只执行一次 | 中等 | 极致；基准测试顶尖性能 | 较小但精悍，SolidStart 不断演进 | 极致性能敏感型仪表盘、复杂高频动态数据看板 |
| [**Angular**](https://angular.dev/) | Signals 细粒度变更检测，Zoneless 架构，强类型依赖注入 | 较陡峭 | 优秀；脱离 zone.js 后体积和速度显著提升 | Google 生态，企业级完备工具链 | 大型跨国组织、强工程约束与标准化企业平台 |

## **IV.1.1 用同一个搜索交互比较框架边界**

选型练习适合固定同一功能，再比较状态、事件和渲染位置。下面展示一个受控输入框在不同响应式模型下的核心代码：

```tsx
// React 19：组件状态保存于 Fiber 树，状态更新触发函数重新执行（由 Compiler 自动优化）
import { useState } from "react";

export function SearchBox() {
  const [query, setQuery] = useState("");

  return (
    <label>
      搜索
      <input
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
      />
      <output aria-live="polite">当前输入：{query}</output>
    </label>
  );
}
```

```vue
<!-- Vue 3.5+：ref 维护精准依赖，模板编译生成带 PatchFlag 的高效更新指令 -->
<script setup lang="ts">
import { ref } from "vue";

const query = ref("");
</script>

<template>
  <label>
    搜索
    <input v-model="query" />
    <output aria-live="polite">当前输入：{{ query }}</output>
  </label>
</template>
```

```svelte
<!-- Svelte 5：Runes 统一响应式，编译期将声明转换为原生 DOM 绑定 -->
<script lang="ts">
let query = $state("");
</script>

<label>
  搜索
  <input bind:value={query} />
  <output aria-live="polite">当前输入：{query}</output>
</label>
```

对比时记录四项证据：状态存放位置、事件入口、更新范围、组件能否在服务器渲染。这样能把框架差异落到运行行为，再继续研究 Compiler、Signals、Runes 或 Server Components 的工程影响。
