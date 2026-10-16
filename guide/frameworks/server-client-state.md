---
title: "IV. 前端框架和库：构建现代 UI / IV.10 理解服务器状态与客户端状态"
---

# IV.10 理解服务器状态与客户端状态（*）

前端项目中的状态失控，往往源于将不同所有权、不同生命周期的数据塞进了同一个状态容器。在设计状态层之前，应先按数据来源、存活周期与同步机制将状态划分为五类：

- **本地 UI 状态**：仅影响当前组件或局部子树的状态，如弹窗开关、下拉菜单展开、当前选中的 Tab 或临时输入。这类状态应直接收敛在组件内部，交由 `useState`、Vue `ref`、Svelte 5 的 `$state` 等框架局部原语维护。
- **客户端共享状态**：由浏览器端拥有、且需要跨多个组件协同读写的状态，如主题模式、语言偏好、侧边栏折叠状态、富文本编辑器画布状态或本地购物车草稿。适合使用 Context、Zustand、Redux Toolkit、Jotai 或 Pinia 管理。
- **服务器状态**：真实数据源位于远程服务的数据，如用户资料、商品目录、权限配置、订单记录与评论列表。其核心挑战不在于“存取值”，而在于拉取、缓存、过期失效、后台刷新、并发去重、乐观更新与失败回滚。
- **URL 状态**：需要支持链接分享、刷新后保留以及浏览器前进/后退导航的状态，如搜索关键词、筛选条件、分页页码与视图切换。这类状态应直接编码进 URL 的 query、path 或 hash，由路由器作为单一事实来源。
- **表单状态**：介于临时 UI 状态与远端业务数据之间，涵盖当前输入值、字段级/跨字段校验错误、脏字段标记（dirty）、提交中状态及服务端返回的错误映射。简单表单可直接借助原生表单与框架 Action 处理，复杂联动表单则适合交由专门的表单状态库管理。

在这五类状态中，最关键的架构分界线在于**服务器状态与客户端状态的分离**：服务器状态的真实所有权在远端数据库，前端持有的只是一份**带有时效性的异步快照**。因此，管理服务器状态围绕的是数据新鲜度与网络不确定性，需要一套协同工作的缓存与同步机制：

- **缓存**：复用近期已拉取的数据快照，消除切页与组件重挂载时的重复白屏等待。
- **失效**：当写操作改变远端数据后，将关联查询标记为过期（stale）并触发按需重取。
- **后台刷新**：先立即渲染本地已有快照，同时在后台静默发起请求拉取最新数据。
- **乐观更新**：在写请求发出瞬间先行更新界面状态，若服务端返回失败则自动回滚至先前快照并提示用户。
- **请求去重**：当同一屏幕的多个组件同时挂载并请求相同资源时，自动合并为单次网络请求。
- **错误恢复**：针对网络抖动或上游异常提供指数退避重试、降级展示与统一的错误反馈入口。

在客户端生态中，[TanStack Query](https://tanstack.com/query/latest) 与 SWR 正是专为这套服务器状态生命周期打造的缓存引擎；而在全栈元框架中，服务器组件（Server Components）、路由 `loader` / `action` 与 Server Functions 则进一步将部分数据读取与聚合前移到了服务端运行。

将服务器状态剥离出去后，客户端 Store 就能回归本职——**只维护真正由前端拥有、需要跨组件同步的交互与会话状态**。反之，若把接口返回的列表和详情长期手动拷入 Redux、Pinia 或全局 Context，团队就不得不自行手写过期清理、并发竞态防护与失败回滚逻辑，导致状态层迅速膨胀且脆弱。

下表汇总了五类状态的来源边界、典型场景与对应的工程管理工具：

| 状态类型         | 来源           | 典型示例                         | 常见管理方式                                    |
| :--------------- | :------------- | :------------------------------- | :---------------------------------------------- |
| 本地 UI 状态     | 所在组件       | 弹窗、菜单、选中 Tab             | 组件状态、局部 store                            |
| 客户端共享状态   | 浏览器端       | 主题、偏好、编辑器状态           | Context、Zustand、Redux Toolkit、Jotai、Pinia   |
| 服务器状态       | API / 数据库   | 用户资料、列表数据、权限信息     | TanStack Query、SWR、框架数据获取机制           |
| URL 状态         | 浏览器地址栏   | 搜索、筛选、分页、排序           | Router、URLSearchParams、框架路由能力           |
| 表单状态         | 用户输入       | 输入值、校验错误、提交状态       | 原生表单、React Hook Form、框架 Action          |

<BadGoodExample bad-title="按页面建一个万能 Store" good-title="按所有权和生命周期拆分">
<template #bad>

```tsx
const usePageStore = create((set) => ({
  keyword: "",
  products: [],
  isLoading: false,
  productError: null,
  isDetailsOpen: false,
  formDraft: { note: "" },
  theme: "light",

  loadProducts: async () => {
    set({ isLoading: true });
    const products = await fetch("/api/products")
      .then((response) => response.json());
    set({ products, isLoading: false });
  },
}));
```

</template>
<template #good>

```tsx
function ProductsPage() {
  // 可分享、可前进后退：URL 状态
  const [params, setParams] = useSearchParams();
  const keyword = params.get("q") ?? "";

  // 远端拥有、需要缓存和失效：服务器状态
  const products = useQuery({
    queryKey: ["products", { keyword }],
    queryFn: () => fetchProducts(keyword),
  });

  // 只影响当前组件树：本地 UI 状态
  const [selectedProductId, setSelectedProductId] =
    useState<string | null>(null);

  // 当前表单编辑过程：表单状态
  const form = useForm({ defaultValues: { note: "" } });

  // 真正跨页面共享且由客户端拥有：共享状态
  const theme = usePreferencesStore((state) => state.theme);

  function updateKeyword(nextKeyword: string) {
    const next = new URLSearchParams(params);
    nextKeyword ? next.set("q", nextKeyword) : next.delete("q");
    setParams(next, { replace: true });
  }

  // 根据以上状态渲染页面……
}
```

</template>
</BadGoodExample>

按所有权拆分后，每份数据都能交由最匹配其生命周期的机制托管。日常设计组件与状态层时，可以按四个问题依次过滤：**它能否直接由现有 props 或状态派生计算得出？刷新或分享链接后是否需要保留在 URL 中？它的真实数据源是否位于远端服务器？** 只有当一份数据确实由浏览器端生成并拥有、且需要被相距较远的多个组件共同修改时，才值得放进客户端共享 Store。
