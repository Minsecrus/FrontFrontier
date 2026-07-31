---
title: "IV. 前端框架和库：构建现代 UI / IV.1 UI 框架概述：React、Vue、Angular、Svelte、SolidJS、Lit"
---

# IV.1 UI 框架概述：React、Vue、Angular、Svelte、SolidJS、Lit

**目的**：提供构建交互式用户界面的结构化方法，封装底层 DOM 操作并简化状态管理。

当前框架的差异需要同时从语法、编译优化、服务端/客户端分工、细粒度响应性和运行时体积等角度评估。React Compiler、Server Components，Angular Signals 与 zoneless，Svelte Runes，以及 Vue 正在推进的 Vapor Mode，都在重新划分这些工作。

- [**React**](https://react.dev/)：用于构建用户界面的 JavaScript 库，以其组件化架构、声明式方法和庞大生态系统而闻名。新的主线能力围绕 Actions、Server Components、Compiler、Activity、Effect Events 和性能分析工具继续扩展。使用 [JSX](https://react.dev/learn/writing-markup-with-jsx)。
- [**Vue**](https://vuejs.org/)：渐进式框架，通常被视为 React 的灵活性和 Svelte 的简洁性之间的中间地带。因其易于集成、易于理解的语法和全面的文档而备受青睐。
- [**Angular**](https://angular.dev/)：由 Google 开发的综合框架，以其结构化方法、性能、安全性和可伸缩性而闻名。Signals、zoneless、独立组件和更清晰的版本兼容策略，让它在企业级应用中继续保持强约束工程路线。
- [**Svelte**](https://svelte.dev/)：“后起之秀”，将工作从浏览器转移到构建过程，在构建时将组件编译成高效的 JavaScript。Runes 让响应性模型更加显式，也让 SvelteKit 的全栈应用体验更统一。
- [**SolidJS**](https://www.solidjs.com/)：轻量级响应式库，优先考虑细粒度响应性，仅更新需要更改的 UI 部分。在特定更新模式下可以减少不必要的运行时工作，但性能判断仍应以真实页面和用户路径的基准测试为准。
- [**Lit**](https://lit.dev/)：用于构建快速、轻量级 [Web Components](https://www.webcomponents.org/) 的简单库，利用 Web 标准实现响应性、声明式模板和作用域样式。

UI 框架的多样性，反映了在响应性（虚拟 DOM vs. 细粒度 vs. 编译时）和开发者体验（灵活性 vs. 预设风格的结构）上的不同理念。Svelte 和 SolidJS 的兴起，表明了最小化运行时开销和包体积的趋势，直接关系到 Core Web Vitals 和用户对性能的感知。

## **从框架名称转向渲染模型**

学习或选型时，可以先回答这些与框架无关的问题：

| 判断问题 | 需要理解的概念 | 常见影响 |
| :--- | :--- | :--- |
| 代码运行在哪里？ | 浏览器、服务器、边缘运行时、构建期 | 能否访问 DOM、密钥和请求上下文 |
| 状态如何更新？ | 虚拟 DOM、Signals、细粒度响应性、编译时转换 | 更新范围、调试方式和运行时成本 |
| HTML 如何到达用户？ | CSR、SSR、流式渲染、预渲染、恢复/增量 hydration | 首屏性能、交互时机和部署复杂度 |
| 数据如何进入组件？ | loader、Server Functions、RSC、查询缓存、客户端状态 | 序列化、错误恢复、缓存失效和权限边界 |
| 优化由谁完成？ | 手工 memo、编译器、静态分析、运行时调度 | 代码写法、迁移风险和性能验证方式 |

这些能力的组合才是框架的真实运行模型。版本和 API 会变化，模型和边界判断更值得长期掌握。

## **表格：流行 UI 框架比较 (React, Vue, Svelte, SolidJS)**

| 框架名称                                | 设计哲学（示例）                                                                                         | 学习曲线 | 性能（运行时/包大小）  | 生态系统大小 | 社区支持       | 理想用例（示例）                     |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------- | :------- | :--------------------- | :----------- | :------------- | :----------------------------------- |
| [**React**](https://react.dev/)         | 虚拟 [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)，组件化，声明式       | 较陡峭   | 良好，但包体积可能较大 | 庞大         | 活跃、资源丰富 | 大型复杂应用，企业级项目             |
| [**Vue**](https://vuejs.org/)           | 渐进式，模板驱动，双向绑定                                                                               | 较平缓   | 良好，初始设置轻量     | 正在增长     | 活跃、文档全面 | 中小型项目，快速原型开发             |
| [**Svelte**](https://svelte.dev/)       | 编译时，无虚拟 [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)，细粒度响应 | 极小     | 极速，包体积小         | 较小         | 热情、正在增长 | 性能关键型应用，轻量级，个人项目       |
| [**SolidJS**](https://www.solidjs.com/) | 细粒度响应，无虚拟 [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)         | 较平缓   | 极速，包体积小         | 较小         | 正在增长       | 性能关键型应用，复杂 UI 更新频繁场景 |

此表至关重要，因为 UI 框架是构建现代 Web 应用程序的主要选择。它帮助学习者理解这些框架在响应性和性能实现上的根本区别，指导他们根据项目需求和个人学习偏好做出明智决策。

## **IV.1.1 用同一个搜索交互比较框架边界**

选型练习适合固定同一功能，再比较状态、事件和渲染位置。下面只展示一个受控输入框的核心部分：

```tsx
// React：状态由组件保存，事件触发重新渲染
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
<!-- Vue：ref 保存响应式状态，模板声明状态与 DOM 的关系 -->
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

对比时记录四项证据：状态存放位置、事件入口、更新范围、组件能否在服务器渲染。这样能把框架差异落到运行行为，再继续研究 Compiler、Signals、Runes 或 Server Components 的工程影响。

