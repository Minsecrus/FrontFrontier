---
title: "IV. 前端框架和库：构建现代 UI / IV.1 UI 框架概述：React、Vue、Angular、Svelte、SolidJS、Lit"
---

# IV.1 UI 框架概述：React、Vue、Angular、Svelte、SolidJS、Lit

直接在复杂界面中手写原生 DOM 读写与事件同步，很快就会陷入状态失步和局部更新难以追踪的泥潭。UI 框架通过声明式视图与状态绑定接管了底层 DOM 操作，而在当前的技术演进下，评估或选型一套框架已不再只是比较模板语法，而是要从编译优化、服务端/客户端分工、细粒度响应式（Fine-grained Reactivity）和运行时体积四个维度审视其运行机制：

- [React](https://react.dev/)：围绕组件化与声明式模型构建了最庞大的前端生态。React 19 将 Actions 原语（`useActionState`、`useOptimistic`、`useFormStatus`、`use()`）与服务器组件（Server Components，RSC）纳入标准能力；[React 19.2](https://react.dev/blog/2025/10/01/react-19-2) 进一步加入 `<Activity>`（在显隐切换时保留离屏状态与 DOM 并自动暂停内部副作用订阅）、`useEffectEvent`（将 Effect 的触发时机与最新状态读取解耦）以及集成原生视图过渡的 `<ViewTransition>`；[React Compiler](https://react.dev/learn/react-compiler)（原 Forget 项目）则在编译期静态分析代码并自动完成细粒度记忆化（auto-memoization），日常开发中多数场景已无需手写 `useMemo` 与 `useCallback`。这两个 Hook 仍作为“逃生舱”（escape hatch，即自动机制不够用时手动接管的手段）保留，供需要精确控制记忆化边界的场景使用（如稳定 Effect 依赖项），详见 [useMemo、useCallback 与 Compiler 的关系](https://react.dev/learn/react-compiler/introduction#what-should-i-do-about-usememo-usecallback-and-reactmemo)。
- [Vue](https://vuejs.org/)：采用渐进式设计，兼顾模板可读性与工程演进弹性。Vue 3.5+ 重构了底层响应式系统（据官方数据，内存占用降低 56%，大型深层响应式数组的部分操作最高提速 10 倍），同时补充了 `onWatcherCleanup()`、`useTemplateRef()` 与 `useId()` 等实用原语；Vue 3.6 进一步吸纳超轻量信号库 [`alien-signals`](https://github.com/stackblitz/alien-signals) 的 Push-Pull 调度算法打磨响应式内核，并持续推进 Vapor Mode——直接将 `<script setup vapor>` 模板编译为精准的原生 DOM 操作指令，底层思路与 SolidJS 接近。
- [Svelte](https://svelte.dev/)：开创了编译时框架路线。Svelte 5 引入 Runes（符文系统：`$state`、`$derived`、`$effect`、`$props`、`$bindable`） 重塑响应式表达，使响应式状态可以在 `.svelte.ts` 等普通模块中复用，并以更灵活的 Snippets（`{#snippet}`） 替代原有的 Slots 插槽机制；后续围绕 Async Svelte 与 Remote Functions 的演进，则进一步支持在组件脚本与模板中直接书写 `await`，并通过类型安全的远程函数打通服务端数据读写。
- [SolidJS](https://www.solidjs.com/)：细粒度响应式的典型代表。组件函数仅在挂载创建时执行一次，后续状态变更会沿着 Signals 依赖图直接定位并更新对应的真实 DOM 节点，完全省去了虚拟 DOM Diff 开销。
- [Angular](https://angular.dev/)：Google 主导的企业级全栈框架，正全面转向 Signals 与 Zoneless 架构。所谓 Zoneless，是指摆脱对 zone.js 的依赖——过去 zone.js 需要通过“猴子补丁”（monkey patching，即在运行时改写 `setTimeout`、Promise 等原生 API）拦截异步任务来触发变更检测。结合独立组件（Standalone Components）与基于 Signal 模型的声明式 Signal Forms，这一演进显著缩减了运行时体积，也让变更检测与表单状态联动更加精准可控。
- [Lit](https://lit.dev/)：Google 推出的轻量级 [Web Components](https://www.webcomponents.org/) 开发库，紧贴浏览器原生标准，在原生 Shadow DOM 样式隔离之上提供轻巧的声明式模板与响应式属性。

这些框架之所以呈现出迥异的 API 形态，本质上源于它们在响应式更新粒度（虚拟 DOM Diff、细粒度 Signals 依赖图、编译时直接生成 DOM 指令）与工程约束强度（自由组合 vs. 全家桶约定）上的不同取舍。

## IV.1.1 从框架名称转向渲染模型

在切入具体 API 之前，可以先用五个与框架名称无关的问题理清应用的运行边界：

| 判断问题                | 需要理解的概念                                                        | 常见影响                             |
| :---------------------- | :-------------------------------------------------------------------- | :----------------------------------- |
| **代码运行在哪里？**    | 浏览器、服务器、边缘运行时、构建期                                    | 能否访问 DOM、密钥和请求上下文       |
| **状态如何更新？**      | 虚拟 DOM Diff、Signals 依赖图、编译时转换（Svelte/Vapor）              | 更新范围、调试方式和运行时成本       |
| **HTML 如何到达用户？** | CSR、SSR、流式渲染（Streaming）、预渲染（SSG）、可恢复性（Resumability） | 首屏性能、交互时机和部署复杂度       |
| **数据如何进入组件？**  | loader、Server Functions、RSC、查询缓存、客户端状态                   | 序列化、错误恢复、缓存失效和权限边界 |
| **优化由谁完成？**      | 手工 memo、编译器（React Compiler）、静态分析、运行时调度              | 代码写法、迁移风险和性能验证方式     |

这五个维度的组合才构成了框架真实的运行模型。版本与表层 API 会不断迭代，但底层的渲染时机与状态边界判断始终通用。

结合上述维度，下表横向对比了五大主流 UI 框架的响应式机制、运行时开销与适用场景：

| 框架名称                                | 核心机制与响应式范式                                              | 学习曲线 | 性能与运行时开销                        | 生态系统与工具链                | 理想用例（示例）                                 |
| :-------------------------------------- | :---------------------------------------------------------------- | :------- | :-------------------------------------- | :------------------------------ | :----------------------------------------------- |
| [React](https://react.dev/)         | 声明式 JSX，虚拟 DOM，React Compiler 自动记忆化，Actions 原语     | 较陡峭   | 良好；Compiler 可减少不必要的重渲染     | 规模最大，使用最广泛            | 大型复杂业务系统、跨平台应用（React Native）      |
| [Vue](https://vuejs.org/)           | 响应式 Proxy（Vue 3.5 重构）+ 模板编译优化；可选 Vapor Mode | 较平缓   | 优秀；内存占用低，启动轻量              | 庞大且成熟，官方生态高度统一    | 中大型企业系统、面向公众的现代 Web 应用          |
| [Svelte](https://svelte.dev/)       | 编译时无虚拟 DOM，Svelte 5 Runes 通用细粒度响应式                 | 较低     | 优秀；包体积小，运行时开销低            | 正在快速扩张，SvelteKit 成熟    | 高性能关键型产品、交互式数据可视化、轻量嵌入组件 |
| [SolidJS](https://www.solidjs.com/) | 纯原生 DOM 操作，Signals 依赖图驱动，组件只执行一次               | 中等     | 优秀；主流基准测试中名列前茅            | 较小，SolidStart 仍在演进       | 对性能高度敏感的仪表盘、高频更新的数据看板       |
| [Angular](https://angular.dev/)     | Signals 细粒度变更检测，Zoneless 架构，强类型依赖注入             | 较陡峭   | 良好；去掉 zone.js 后体积和检测开销下降 | Google 生态，企业级工具链完备   | 大型跨国组织、强工程约束与标准化企业平台         |

## IV.1.2 用同一个搜索交互比较框架边界

对比不同框架时，最直观的做法是固定同一个交互需求，观察各自的状态声明、事件绑定和 DOM 更新路径。下面以受控搜索框为例，对比三种响应式模型的核心实现：

```tsx
// React 19：组件状态保存于 Fiber 树，状态更新触发函数重新执行（由 Compiler 自动优化）
import { useState } from "react";

export function SearchBox() {
  const [query, setQuery] = useState("");

  return (
    <>
      <label>
        搜索
        <input
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      </label>
      <output aria-live="polite">当前输入：{query}</output>
    </>
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
  </label>
  <output aria-live="polite">当前输入：{{ query }}</output>
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
</label>
<output aria-live="polite">当前输入：{query}</output>
```

三个示例都把 `<output>` 放在 `<label>` 之外：HTML 规定 `<label>` 内只能包含它所标注的那一个可标注控件，而 `<output>` 本身也是可标注元素；放在里面不仅不合规范，还会让输入框的可访问名称（accessible name，读屏软件朗读的控件名称）混入“当前输入：…”。

对比时记录四项证据：状态存放位置、事件入口、更新范围、组件能否在服务器渲染。这样能把框架差异落实到具体的运行行为上，再继续研究 Compiler、Signals、Runes 或服务器组件的工程影响。
