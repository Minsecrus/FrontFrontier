---
title: "IV. 前端框架和库：构建现代 UI / IV.10 理解服务器状态与客户端状态"
---

# IV.10 理解服务器状态与客户端状态

**目的**：明确不同状态的来源、生命周期和同步方式，为不同数据选择合适的管理方案。

现代前端应用中的“状态”可以分成多种类型。  
很多复杂度来自不同类型状态的混合管理。

- **本地 UI 状态**：只影响所在组件或局部界面的状态，例如弹窗打开/关闭、下拉菜单展开、选中的 Tab、临时输入值。  
  这类状态通常适合放在组件内部，用 `useState`、Vue `ref`、Svelte store 或框架自带的局部状态能力管理。
- **客户端共享状态**：多个组件都需要读取或修改的客户端状态，例如主题、语言偏好、侧边栏状态、复杂编辑器状态、购物车草稿。  
  这类状态可以使用 Context、Zustand、Redux Toolkit、Jotai、Pinia 等工具管理。
- **服务器状态**：源自远程系统的数据，例如用户资料、商品列表、权限信息、订单记录、评论数据。  
  它的关键问题包括获取、缓存、失效、重新获取、并发请求、乐观更新和错误恢复。
- **URL 状态**：可以被分享、刷新后保留、参与浏览器前进后退的状态，例如搜索关键词、筛选条件、分页页码、视图模式。  
  这类状态应该优先考虑放进 URL query、path 或 hash，并与浏览器导航行为保持一致。
- **表单状态**：介于 UI 状态和业务数据之间，包含输入值、校验错误、脏状态、提交中状态和服务端返回错误。  
  简单表单可以直接由框架管理，复杂表单则需要专门的表单库或清晰的状态约定。

服务器状态和客户端状态最大的区别在于：**服务器状态不由前端拥有，前端只是它的一份缓存视图**。  
因此，服务器状态管理关注的是“这份数据是否新鲜、何时重新获取、更新失败如何回滚”，需要缓存策略、同步策略和错误恢复策略共同配合。

- **缓存**：减少重复请求，提高页面切换和回退时的响应速度。
- **失效**：在数据被修改后，让相关查询重新变为陈旧状态，触发重新获取。
- **后台刷新**：先展示已有数据，再在后台请求新数据，减少空白加载。
- **乐观更新**：先在界面上表现为成功，再在请求失败时回滚或提示用户。
- **请求去重**：多个组件依赖同一份数据时，合并相同请求。
- **错误恢复**：请求失败时提供重试、降级、回退数据或明确的用户反馈。

在 React 生态中，[TanStack Query](https://tanstack.com/query/latest) 和 SWR 这类工具就是围绕服务器状态而设计的。  
在元框架中，服务器组件、Loader、Action、Server Function 等机制也在把一部分数据获取逻辑重新放回服务器侧。

这并不意味着客户端状态不重要，而是意味着客户端状态应该更聚焦于**交互状态和前端拥有的数据**。  
如果把接口返回结果长期放进 Redux、Context 或普通全局 store 中，就需要自己处理缓存失效、并发、重新获取和错误恢复，这通常会让代码变得复杂而脆弱。

## **表格：不同状态的管理方式**

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

这个拆分让每份状态交给最了解其生命周期的系统。判断时依次问：它能否从 props 或其他状态计算出来？刷新后是否应该保留？是否应该出现在 URL？真正的数据所有者是谁？多个远距离组件共同修改且由浏览器拥有的数据，适合进入客户端共享 store。

清晰区分这些状态，是现代前端架构中非常基础但又常被忽略的一步。  
它直接影响组件边界、数据获取位置、缓存策略、用户体验和代码可维护性。很多状态管理问题都需要先判断这份状态到底属于哪里。
