---
title: "IV. 前端框架和库：构建现代 UI / IV.1 UI 框架概述：React、Vue、Angular、Svelte、SolidJS、Lit"
---

# IV.1 UI 框架概述：React、Vue、Angular、Svelte、SolidJS、Lit

**目的**：提供构建交互式用户界面的结构化方法，封装底层 DOM 操作并简化状态管理。

当前主流 UI 框架的差异需要同时从**编译优化、服务端/客户端分工、细粒度响应式（Fine-grained Reactivity）和运行时体积**等维度综合评估：

- [**React**](https://react.dev/)：以组件化、声明式理念和庞大生态闻名。**React 19** 将 Actions 原语（`useActionState`、`useOptimistic`、`useFormStatus`、`use()`）和服务器组件（Server Components，RSC）标准化。**[React Compiler](https://react.dev/learn/react-compiler)**（原 Forget 项目）在编译期分析代码，自动完成细粒度记忆化（auto-memoization），多数场景无需再手写 `useMemo` / `useCallback`。官方仍保留这两个 Hook 作为“逃生舱”（escape hatch，即在自动机制不够用时手动接管的手段），用于需要精确控制记忆化的场合（如作为 Effect 依赖的值），详见 [useMemo、useCallback 与 Compiler 的关系](https://react.dev/learn/react-compiler/introduction#what-should-i-do-about-usememo-usecallback-and-reactmemo)。
- [**Vue**](https://vuejs.org/)：渐进式框架，在灵活性与简洁性之间取得了较好的平衡。**Vue 3.5+** 重构了响应式系统（官方数据：内存占用降低 56%，大型深层响应式数组的部分操作最多快 10 倍），并引入 `onWatcherCleanup()`、`useTemplateRef()` 与 `useId()`；同时在推进 **Vapor Mode**（不使用虚拟 DOM、直接编译为原生 DOM 操作的模式，思路接近 SolidJS）。
- [**Svelte**](https://svelte.dev/)：编译时框架的先驱。**Svelte 5** 改用 **Runes（符文系统：`$state`、`$derived`、`$effect`、`$props`、`$bindable`）** 表达响应式。响应式状态不再局限于 `.svelte` 组件文件，也可以写在 `.svelte.ts` 等模块中；**Snippets（`{#snippet}`）** 则取代了原来的 Slots。
- [**SolidJS**](https://www.solidjs.com/)：细粒度响应式的代表。组件函数只在创建时执行一次；之后状态变化沿 Signals 依赖图直接更新对应的 DOM 节点，没有虚拟 DOM Diff 开销。
- [**Angular**](https://angular.dev/)：Google 主导的企业级全栈框架，正在推进 **Signals** 与 **Zoneless** 架构。Zoneless 指不再依赖 zone.js：zone.js 通过“猴子补丁”（monkey patching，即在运行时改写 `setTimeout`、Promise 等原生 API）感知异步任务并触发变更检测。配合独立组件（Standalone Components）与强类型表单，这些变化减小了运行时体积，也让变更检测更精确。
- [**Lit**](https://lit.dev/)：Google 推出的轻量级 [Web Components](https://www.webcomponents.org/) 库，紧贴浏览器标准，提供声明式模板、响应式属性与原生 Shadow DOM 隔离。

各框架的差异，反映了它们在响应式模型（虚拟 DOM vs. 细粒度 Signals vs. 编译时代码生成）和开发者体验（灵活性 vs. 强预设约束）上的不同取舍。

## **IV.1.1 从框架名称转向渲染模型**

学习或选型时，可以先回答这些与框架无关的问题：

| 判断问题                | 需要理解的概念                                                        | 常见影响                             |
| :---------------------- | :-------------------------------------------------------------------- | :----------------------------------- |
| **代码运行在哪里？**    | 浏览器、服务器、边缘运行时、构建期                                    | 能否访问 DOM、密钥和请求上下文       |
| **状态如何更新？**      | 虚拟 DOM Diff、Signals 依赖图、编译时转换（Svelte/Vapor）              | 更新范围、调试方式和运行时成本       |
| **HTML 如何到达用户？** | CSR、SSR、流式渲染（Streaming）、预渲染（SSG）、可恢复性（Resumability） | 首屏性能、交互时机和部署复杂度       |
| **数据如何进入组件？**  | loader、Server Functions、RSC、查询缓存、客户端状态                   | 序列化、错误恢复、缓存失效和权限边界 |
| **优化由谁完成？**      | 手工 memo、编译器（React Compiler）、静态分析、运行时调度              | 代码写法、迁移风险和性能验证方式     |

这些能力的组合才是框架的真实运行模型。版本和 API 会变化，模型和边界判断更值得长期掌握。

**表格：流行 UI 框架比较（React、Vue、Svelte、SolidJS、Angular）**

| 框架名称                                | 核心机制与响应式范式                                              | 学习曲线 | 性能与运行时开销                        | 生态系统与工具链                | 理想用例（示例）                                 |
| :-------------------------------------- | :---------------------------------------------------------------- | :------- | :-------------------------------------- | :------------------------------ | :----------------------------------------------- |
| [**React**](https://react.dev/)         | 声明式 JSX，虚拟 DOM，React Compiler 自动记忆化，Actions 原语     | 较陡峭   | 良好；Compiler 可减少不必要的重渲染     | 规模最大，使用最广泛            | 大型复杂业务系统、跨平台应用（React Native）      |
| [**Vue**](https://vuejs.org/)           | 响应式 Proxy（Vue 3.5 重构）+ 模板编译优化；可选 Vapor Mode | 较平缓   | 优秀；内存占用低，启动轻量              | 庞大且成熟，官方生态高度统一    | 中大型企业系统、面向公众的现代 Web 应用          |
| [**Svelte**](https://svelte.dev/)       | 编译时无虚拟 DOM，Svelte 5 Runes 通用细粒度响应式                 | 较低     | 优秀；包体积小，运行时开销低            | 正在快速扩张，SvelteKit 成熟    | 高性能关键型产品、交互式数据可视化、轻量嵌入组件 |
| [**SolidJS**](https://www.solidjs.com/) | 纯原生 DOM 操作，Signals 依赖图驱动，组件只执行一次               | 中等     | 优秀；主流基准测试中名列前茅            | 较小，SolidStart 仍在演进       | 对性能高度敏感的仪表盘、高频更新的数据看板       |
| [**Angular**](https://angular.dev/)     | Signals 细粒度变更检测，Zoneless 架构，强类型依赖注入             | 较陡峭   | 良好；去掉 zone.js 后体积和检测开销下降 | Google 生态，企业级工具链完备   | 大型跨国组织、强工程约束与标准化企业平台         |

## **IV.1.2 用同一个搜索交互比较框架边界**

选型练习适合固定同一功能，再比较状态、事件和渲染位置。下面展示一个受控输入框在不同响应式模型下的核心代码：

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
