---
title: "IV. 前端框架和库：构建现代 UI / IV.9 数据获取和缓存库：SWR、TanStack Query、Axios、Fetch API"
---

# IV.9 数据获取和缓存库：SWR、TanStack Query、Axios、Fetch API

在前端应用中，“发起一次 HTTP 请求拿到响应”与“在多个组件之间共享、缓存、刷新和失效同一份远端数据”属于两个不同层次的问题。前者由底层 HTTP 客户端完成，后者则需要专门的服务器状态缓存层来接管异步生命周期：

- [**Fetch API**](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)：浏览器与现代服务端运行时原生内置的 HTTP 请求接口，基于 Promise 与标准 `Request` / `Response` 流设计，结合 `AbortSignal` 即可原生取消请求。
- [**Axios**](https://axios-http.com/)：跨浏览器与 Node.js 的 Promise HTTP 客户端，在原生请求之上封装了请求/响应拦截器链、自动 JSON 转换、上传下载进度监听以及 XSRF Token 注入等工程特性。
- **[SWR](https://swr.vercel.app/)（stale-while-revalidate）**：面向 React 的轻量级数据获取与缓存库，核心采用 stale-while-revalidate 策略——先立即返回本地缓存中的旧数据（stale）渲染界面，同时在后台发起重新验证请求（revalidate）并静默更新视图。
- **[TanStack Query](https://tanstack.com/query/latest)（原名 React Query）**：框架无关的服务器状态管理与异步缓存引擎，现已支持 React、Vue、Solid、Svelte 与 Angular（改名正是为了体现跨框架能力）。它围绕查询键（`queryKey`）统一接管数据拉取、请求去重、过期标记、后台刷新、乐观更新与缓存垃圾回收（GC）。

选型时应先分清职责边界：**通用 HTTP 客户端**（Fetch API、Axios）负责网络传输层的协议通信与统一拦截；**数据获取与缓存库**（SWR、TanStack Query）则工作在传输层之上（内部仍调用 `fetch` 或 Axios 发请求），专门消解手写 `isLoading`、竞态丢弃、重复请求合并与缓存失效同步等状态样板代码。

下表对比了这两类工具在定位、缓存控制粒度与调试支持上的差异：

| 库名称                                                                      | 类型                                                             | 核心策略（示例）              | 缓存控制               | API 简洁性 | DevTools   | 用例（示例）                                                                                                     |
| :-------------------------------------------------------------------------- | :--------------------------------------------------------------- | :---------------------------- | :--------------------- | :--------- | :--------- | :--------------------------------------------------------------------------------------------------------------- |
| [**Fetch API**](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) | [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 客户端 | 原生浏览器 API，基于 Promise  | 无内置缓存             | 简洁       | 浏览器内置 | 基本 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 请求，轻量级数据交互                              |
| [**Axios**](https://axios-http.com/)                                        | [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 客户端 | 基于 Promise，拦截器          | 无内置缓存             | 良好       | 浏览器内置 | 复杂 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 请求，[Node.js](https://nodejs.org/) 和浏览器通用 |
| [**SWR**](https://swr.vercel.app/)                                          | 服务器状态管理                                                   | Stale-while-revalidate        | 自动缓存，后台重新验证 | 极简       | 无内置     | 简单数据获取和缓存，快速感知更新                                                                                 |
| [**TanStack Query**](https://tanstack.com/query/latest)                     | 服务器状态管理                                                   | 综合数据管理                  | 细粒度控制，垃圾回收   | 良好       | 内置       | 复杂数据管理，高级缓存，乐观更新，性能优化                                                                       |

::: details 示例：fetch vs. TanStack Query

`fetch` 只负责“发出一次请求并拿到响应”：

```ts
type User = { id: string; name: string };

async function loadUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${encodeURIComponent(userId)}`);

  if (!response.ok) {
    throw new Error("Failed to load user");
  }

  return response.json();
}
```

TanStack Query 管的是服务器状态生命周期：缓存、加载态、错误态、重新验证、窗口聚焦后刷新、请求去重等。

```tsx
import { useQuery } from "@tanstack/react-query";

function UserProfile({ userId }: { userId: string }) {
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => loadUser(userId),
  });

  if (userQuery.isPending) return <p>Loading...</p>;
  if (userQuery.isError) return <p>Load failed</p>;

  return <h2>{userQuery.data.name}</h2>;
}
```

这里用 `isPending`（还没有数据）而不是 `isLoading` 判断是否显示首屏加载态。

在 v5 中，`isLoading` 等于 `isPending && isFetching`。查询因离线而暂停，或设置了 `enabled: false` 时，`isLoading` 为 `false`，但 `data` 仍是 `undefined`；如果用 `isLoading` 判断，代码会继续执行到 `userQuery.data.name` 并报错。

`isLoading` 只表示“首次请求正在进行”，后台刷新则看 `isFetching`。详见 [Queries 指南](https://tanstack.com/query/latest/docs/framework/react/guides/queries)。

判断边界可以很朴素：一次性请求用 `fetch` 很自然；多个组件读取、缓存、刷新和重试同一份远端数据时，就进入 TanStack Query 这类服务器状态工具的领域。

:::
