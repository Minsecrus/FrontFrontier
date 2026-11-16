---
title: "IV. 前端框架和库：构建现代 UI / IV.8 状态管理解决方案：集中化应用程序数据"
---

# IV.8 状态管理解决方案：集中化应用程序数据

当应用中的同一份数据需要被组件树中相距较远的多个节点共同读写时，单纯依赖组件自身的局部状态就会导致严重的 prop drilling（属性逐层透传，即为了让深层子组件拿到数据，不得不把 props 一层层传过并不消费该数据的中间组件）。状态管理方案的核心职责，就是在组件树之外建立清晰、可预测的共享状态容器。

在引入任何状态管理库之前，应先按数据归属切分三类状态：

- **本地 UI 状态**：弹窗开关、表单输入、当前激活的选项卡，优先收敛在组件内部。
- **客户端共享状态**：主题配置、用户界面偏好、跨组件协同的业务草稿。
- **服务器状态**：远端接口响应、缓存副本、后台重新验证与失效同步。

许多前端项目的状态层之所以失控，根源在于把服务器状态与客户端状态塞进了同一个全局 Store。像 TanStack Query、SWR 这类工具专为管理服务器状态生命周期而生；本章讨论的状态管理库，则聚焦于客户端共享状态的建模与更新分发：

- [Redux](https://redux.js.org/)（[Redux Toolkit](https://redux-toolkit.js.org/)）：遵循严格的单向数据流与集中式单一状态树（Single Store）。现代工程统一采用官方推荐的 Redux Toolkit（RTK）编写 slice，大幅消除了早期的模板代码，适合需要强架构约束与时间旅行调试的大型团队。
- [Zustand](https://zustand-demo.pmnd.rs/)：基于发布-订阅模型的轻量级单一 Store 方案。无需在组件树外层包裹 Context Provider，通过 selector 按需订阅状态切片即可避免多余重渲染，兼顾了极简 API 与运行性能。
- [Jotai](https://jotai.org/)：采用原子化（Atom，自下而上）设计。状态由细粒度的独立原子与派生原子组合而成，更新沿着原子依赖图精确触发重渲染，适合状态间派生关系密集的 React 组件树。
- [Pinia](https://pinia.vuejs.org/)：Vue 官方默认的状态管理库。移除繁琐的 `mutations` 概念后，直接通过模块化 Store 提供完整的 TypeScript 类型推导与组合式 API 体验，是 Vue 3 新项目的标准起点。
- [Vuex](https://vuex.vuejs.org/)：Vue 早期版本的官方集中式状态管理方案。在当前工程实践中主要作为维护存量 Vue 2 或早期 Vue 3 项目时的储备知识。

如果在存量代码或早期技术文章中遇到 [Recoil](https://recoiljs.org/)，需要注意其官方 GitHub 仓库已归档停更；新项目若有原子化状态需求，应优先评估 Jotai 等仍在活跃演进的方案。整体而言，主流客户端状态库都在向零样板代码、原生 TypeScript 推导与最小化重渲染范围收敛，新项目通常直接在 Redux Toolkit、Zustand、Jotai 与 Pinia 之间按生态与状态拓扑选型。

## IV.8.1 范式演进：Signals 细粒度响应式与 React 19 Actions

除了独立的状态管理库，前端框架自身的状态原语也在经历两项关键演进：

1. **Signals 细粒度响应式（Fine-grained Reactivity）**：
   [SolidJS](https://www.solidjs.com/)、[Preact Signals](https://preactjs.com/guide/v10/signals/)、[Vue 3.5+](https://vuejs.org/)（重构响应式追踪系统，内存占用降低 56%）、Angular Signals 以及 Svelte 5（Runes）均以 Signals 作为响应式核心。其机制是在读取状态（getter）时自动建立精确到表达式的依赖图，状态变更时仅通知真正消费该值的计算节点与视图，而不再从根组件或父组件开始整棵子树重渲染。在此基础上，Solid、Svelte 5 与 Vue Vapor Mode 能够将更新直接编译为针对具体 DOM 节点的点对点修改，完全跳过虚拟 DOM Diff；Vue 默认模式与 Angular 则利用 Signals 将变更范围精确锁定到单个组件，再交由模板补丁或局部变更检测完成渲染。
2. **React 19 异步表单与 Actions 原语**：
   React 19 原生内置了 `useActionState`、`useOptimistic` 与 `useFormStatus`。过去在客户端状态库中需要手动拼装的“表单提交 → pending 加载标记 → 乐观界面更新 → 异常自动回滚”状态机，如今可以直接用框架内置的异步过渡原语统一表达，进一步压缩了需要放入全局 Store 的状态体积。

围绕框架兼容性、状态模型与工程维护成本，下表横向对比了各主流客户端状态管理方案的选型边界：

| 库名称 | 框架兼容性 | 设计哲学（示例） | 学习曲线 | 样板代码 | TypeScript 支持 | 推荐度 | 理想用例（示例） |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [Redux Toolkit](https://redux-toolkit.js.org/) | UI 无关；React 通过 [React-Redux](https://react-redux.js.org/) 绑定 | 集中式存储，可预测状态 | 中等偏高 | 中等 | 良好 | 高 | 大型复杂应用，需要强约束、可预测状态流 |
| [Zustand](https://zustand-demo.pmnd.rs/) | [React](https://react.dev/) | 极简，单一存储 | 较低 | 极少 | 良好 | 很高 | 中小型应用，重视简单、灵活和性能 |
| [Jotai](https://jotai.org/) | [React](https://react.dev/) | 原子，自下而上 | 较平缓 | 极少 | 良好 | 高 | 细粒度状态控制、组合性强的 React 项目 |
| [Pinia](https://pinia.vuejs.org/) | [Vue](https://vuejs.org/) | 模块化，无 Mutations | 较低 | 极少 | 优秀 | 很高 | Vue 3 新项目，注重简单性和类型支持 |
| [Vuex](https://vuex.vuejs.org/) | [Vue](https://vuejs.org/) | 集中式存储，严格结构 | 中等 | 较多 | 较弱 | 仅存量项目推荐 | 遗留 Vue 2/早期 Vue 3 项目，需要维护既有代码 |
| [Recoil（已归档）](https://recoiljs.org/) | [React](https://react.dev/) | 原子，派生状态 | 中等 | 中等 | 良好 | 不建议新项目继续采用 | 仅在维护历史项目时需要理解 |

实际落地时可遵循三条简明原则：

- **React 新项目**：先确认状态能否留在组件局部、URL 或服务器缓存中；确需全局客户端状态时，常规跨组件共享优先选 Zustand，大型强规范协作选 Redux Toolkit，高频细粒度派生计算选 Jotai。
- **Vue 新项目**：默认直接采用 Pinia。
- **维护存量 Recoil / Vuex 代码**：按既有约定维护，增量重构时再评估向 Jotai / Zustand 或 Pinia 迁移。

::: details 示例：Store 保存事实，派生值随用随算

把 `subtotal` 与购物车条目同时保存，会形成两个事实来源：

```ts
const useCartStore = create((set) => ({
  items: [],
  subtotal: 0,
  addItem: (item) => set((state) => ({
    items: [...state.items, item],
    subtotal: state.subtotal + item.price * item.quantity,
  })),
  // removeItem、修改数量、恢复缓存时都必须记得同步 subtotal。
}));
```

更稳定的做法是只保存无法从别处得到的事实：

```ts
type CartItem = {
  id: string;
  price: number;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
};

const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item],
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),
}));

function CartSummary() {
  const subtotal = useCartStore((state) =>
    state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    ),
  );

  return <output>小计：{subtotal}</output>;
}
```

判断原则是：能从现有状态确定性算出的值，优先用 selector 或普通计算得出；计算成本经实测确实过高时，再引入记忆化。保持单一事实来源，可以减少副本所需的同步路径。

:::
