---
title: "IV. 前端框架和库：构建现代 UI / IV.8 状态管理解决方案：集中化应用程序数据"
---

# IV.8 状态管理解决方案：集中化应用程序数据

**目的**：在复杂应用中管理多个组件共享的状态，减少 prop drilling（属性逐层透传：为了让深层组件拿到数据，把 props 一层层传过并不使用它的中间组件）。

谈状态管理，首先要区分：

- **本地 UI 状态**：弹窗开关、表单输入、当前选项卡。
- **客户端共享状态**：主题、用户偏好、跨组件业务状态。
- **服务器状态**：接口请求结果、缓存、重新获取、失效策略。

很多项目的状态之所以复杂，是因为服务器状态和客户端状态混在一起。  
像 TanStack Query、SWR 这类工具更适合处理服务器状态；本章讨论的库主要针对**客户端共享状态**。

- **[Redux](https://redux.js.org/)（[Redux Toolkit](https://redux-toolkit.js.org/)）**：广泛使用的状态管理库，遵循单向数据流和集中式存储。Redux Toolkit 简化了 Redux 逻辑。
- [**Zustand**](https://zustand-demo.pmnd.rs/)：极简的状态管理库，专注于简单与性能，使用单一存储。
- [**Jotai**](https://jotai.org/)：原子（自下而上）状态管理库，状态由单个原子组成，按原子依赖关系优化渲染。
- [**Pinia**](https://pinia.vuejs.org/)：Vue 官方推荐的状态管理库。相较 Vuex 更直观、类型友好、样板更少，适合作为 Vue 3 新项目的默认起点。
- [**Vuex**](https://vuex.vuejs.org/)：Vue.js 的传统状态管理方案。如今更适合作为**存量项目知识**来理解。

如果你在旧文章、旧项目里看到 [**Recoil**](https://recoiljs.org/)，需要特别注意：它的官方 GitHub 仓库已进入归档状态，新项目应优先评估仍在活跃维护的方案。

状态管理库的演进趋势很明确：更少样板代码、更好的 TypeScript 支持、更清晰的心智模型。  
因此，新项目通常优先在 **Redux Toolkit / Zustand / Jotai / Pinia** 之间选择。

## **IV.8.1 范式演进：Signals 细粒度响应式与 React 19 Actions**

前端状态管理正在经历两个重要的范式转移：

1. **Signals 细粒度响应式（Fine-grained Reactivity）**：
   - 以 [SolidJS](https://www.solidjs.com/)、[Preact Signals](https://preactjs.com/guide/v10/signals/)、[Vue 3.5+](https://vuejs.org/)（重构了响应式系统，内存占用降低 56%）、Angular Signals 以及 Svelte 5（Runes）为代表。
   - **核心优势**：通过自动追踪 getter 建立精确的依赖图，值变化时只通知真正依赖它的计算和视图，而不是从根组件开始重新渲染。Solid、Svelte 5 和 Vue Vapor Mode 能把更新直接落到具体 DOM 节点，跳过虚拟 DOM 的子树 Diff；Vue 默认模式和 Angular 则用 Signals 把更新范围收窄到组件，再交给虚拟 DOM 补丁或模板变更检测完成渲染。
2. **React 19 异步表单与 Actions 原语**：
   - React 19 引入了 `useActionState`、`useOptimistic` 与 `useFormStatus`。“表单提交 → 加载标记 → 乐观更新 → 失败回滚”这条流程，过去往往要靠自定义状态或第三方库拼起来，现在可以用框架内置的统一方式表达。

**表格：主要状态管理库比较**

| 库名称 | 框架兼容性 | 设计哲学（示例） | 学习曲线 | 样板代码 | TypeScript 支持 | 推荐度 | 理想用例（示例） |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [**Redux Toolkit**](https://redux-toolkit.js.org/) | UI 无关；React 通过 [React-Redux](https://react-redux.js.org/) 绑定 | 集中式存储，可预测状态 | 中等偏高 | 中等 | 良好 | 高 | 大型复杂应用，需要强约束、可预测状态流 |
| [**Zustand**](https://zustand-demo.pmnd.rs/) | [React](https://react.dev/) | 极简，单一存储 | 较低 | 极少 | 良好 | 很高 | 中小型应用，重视简单、灵活和性能 |
| [**Jotai**](https://jotai.org/) | [React](https://react.dev/) | 原子，自下而上 | 较平缓 | 极少 | 良好 | 高 | 细粒度状态控制、组合性强的 React 项目 |
| [**Pinia**](https://pinia.vuejs.org/) | [Vue](https://vuejs.org/) | 模块化，无 Mutations | 较低 | 极少 | 优秀 | 很高 | Vue 3 新项目，注重简单性和类型支持 |
| [**Vuex**](https://vuex.vuejs.org/) | [Vue](https://vuejs.org/) | 集中式存储，严格结构 | 中等 | 较多 | 较弱 | 仅存量项目推荐 | 遗留 Vue 2/早期 Vue 3 项目，需要维护既有代码 |
| [**Recoil（已归档）**](https://recoiljs.org/) | [React](https://react.dev/) | 原子，派生状态 | 中等 | 中等 | 良好 | 不建议新项目继续采用 | 仅在维护历史项目时需要理解 |

几条默认建议：

- React 新项目：先想清楚是否真的需要全局状态；需要时优先看 Zustand 或 Redux Toolkit，细粒度组合场景再看 Jotai。
- Vue 新项目：默认先看 Pinia。
- 遇到 Recoil / Vuex：当作接手旧项目时需要掌握的知识。

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
