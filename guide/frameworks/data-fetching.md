---
title: "IV. 前端框架和库：构建现代 UI / IV.9 数据获取和缓存库：SWR、TanStack Query、Axios、Fetch API"
---

# IV.9 数据获取和缓存库：SWR、TanStack Query、Axios、Fetch API

**目的**：简化 HTTP 请求，管理数据获取，并为服务器数据实现缓存策略。

- [**Fetch API**](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)：用于发出 HTTP 请求的原生浏览器 API，基于 Promise。
- [**Axios**](https://axios-http.com/)：流行的基于 Promise 的 HTTP 客户端，适用于 Node.js 和浏览器，提供请求/响应拦截、数据转换和 XSRF 保护等功能。
- **[SWR](https://swr.vercel.app/) (stale-while-revalidate)**：用于 React 的数据获取库，使用 stale-while-revalidate 策略简化数据获取、缓存和同步。
- **[TanStack Query](https://tanstack.com/query/latest) (以前称为 React Query)**：用于 React 的综合数据获取和缓存库，提供用于获取、缓存、同步和更新服务器状态的工具。提供对缓存的细粒度控制。

通用 HTTP 客户端（Fetch API、Axios）和专用数据获取/缓存库（SWR、TanStack Query）之间的区别至关重要。后者通过提供智能缓存、重新验证和同步机制来解决”服务器状态”问题，直接提升了感知性能，并减少了数据驱动 UI 中常见的样板代码。

## **表格：数据获取和缓存库比较**

| 库名称                                                                      | 类型                                                             | 核心策略（示例）              | 缓存控制               | API 简洁性 | DevTools   | 用例（示例）                                                                                                     |
| :-------------------------------------------------------------------------- | :--------------------------------------------------------------- | :---------------------------- | :--------------------- | :--------- | :--------- | :--------------------------------------------------------------------------------------------------------------- |
| [**Fetch API**](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) | [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 客户端 | 原生浏览器 API，Promise-based | 无内置缓存             | 简洁       | 浏览器内置 | 基本 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 请求，轻量级数据交互                              |
| [**Axios**](https://axios-http.com/)                                        | [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 客户端 | Promise-based，拦截器         | 无内置缓存             | 良好       | 浏览器内置 | 复杂 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 请求，[Node.js](https://nodejs.org/) 和浏览器通用 |
| [**SWR**](https://swr.vercel.app/)                                          | 服务器状态管理                                                   | Stale-while-revalidate        | 自动缓存，后台重新验证 | 极简       | 无内置     | 简单数据获取和缓存，快速更新感知                                                                                 |
| [**TanStack Query**](https://tanstack.com/query/latest)                     | 服务器状态管理                                                   | 综合数据管理                  | 细粒度控制，垃圾回收   | 良好       | 内置       | 复杂数据管理，高级缓存，乐观更新，性能优化                                                                       |

这个表格有助于区分基本 HTTP 请求工具和为复杂服务器状态管理而设计的工具。它指导学习者选择不仅获取数据而且智能管理其生命周期的库，这对于现代高性能应用程序至关重要。

::: details 启发式示例：fetch vs TanStack Query

`fetch` 只负责“发出一次请求并拿到响应”：

```ts
async function loadUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to load user");
  }

  return response.json();
}
```

TanStack Query 管的是服务器状态生命周期：缓存、加载态、错误态、重新验证、窗口聚焦后刷新、请求去重等。

```tsx
function UserProfile({ userId }: { userId: string }) {
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => loadUser(userId),
  });

  if (userQuery.isLoading) return <p>Loading...</p>;
  if (userQuery.isError) return <p>Load failed</p>;

  return <h2>{userQuery.data.name}</h2>;
}
```

判断边界可以很朴素：一次性请求用 `fetch` 很自然；同一份远端数据会被多个组件读取、缓存、刷新和重试时，就进入 TanStack Query 这类服务器状态工具的领域。

:::

