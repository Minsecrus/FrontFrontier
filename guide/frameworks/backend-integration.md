---
title: "IV. 前端框架和库：构建现代 UI / IV.11 API 与数据契约：从 HTTP 到现代后端集成"
---

# IV.11 API 与数据契约：从 HTTP 到现代后端集成

API 契约定义前端与服务端共同遵守的通信规则。它覆盖请求意图、数据结构、错误格式、缓存方式、并发行为和版本演进。契约越清楚，前端越容易生成稳定状态、定位失败并安全重试。

一条数据从服务端进入界面，通常经过五层：

> 传输方式 → 协议语义 → 数据结构 → 业务语义 → 界面状态

GraphQL、gRPC-Web 和 tRPC 等方案位于这条链的不同位置。理解基础契约后，工具选型会更容易说清。

在 SSR、流式渲染、Server Components 或 Server Functions 中，前端还必须明确**服务端/客户端运行边界**。服务端模块可能拥有数据库、密钥和用户身份上下文；客户端模块拥有 DOM、浏览器存储和用户交互。两者之间传递的内容需要经过序列化、校验、权限判断和错误处理，形成明确的数据契约。清晰的边界有助于保护密钥、控制数据量、验证输入并保持缓存结果正确。

## **IV.11.1 契约包含哪些层次**

| 契约层次 | 需要回答的问题 | 示例 | 工具或规范示例 |
| :--- | :--- | :--- | :--- |
| **传输** | 数据通过什么通道到达，连接怎样恢复 | 请求响应、服务器推送、双向消息 | HTTP、SSE、WebSocket |
| **协议语义** | 这次操作想做什么，成功与失败怎样表达 | GET 读取、PATCH 更新、404 资源缺失、ETag 校验 | [HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) |
| **结构** | 字段、类型、必填项和嵌套关系是什么 | 用户包含 id、name、role | TypeScript、JSON Schema、OpenAPI、GraphQL SDL、Protobuf |
| **业务语义** | 字段代表什么，允许哪些状态变化 | 金额的币种、订单状态转换、权限范围 | 领域文档、状态机、示例数据 |
| **界面映射** | 前端如何呈现等待、空数据、冲突与失败 | loading、empty、validation error、conflict | 组件状态、路由状态、服务器状态工具 |

结构验证只能确认“数据长得对”。业务规则还需要回答“数据表达的事情是否成立”。例如，金额字段是数字属于结构规则；金额必须大于零且币种受支持属于业务规则。

## **IV.11.2 用 HTTP 语义表达操作意图**

[RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) 定义了 HTTP 方法、状态码、条件请求和表示元数据。前端应根据这些语义决定缓存、重试和界面反馈。

### **方法、安全性与幂等性**

| 方法 | 常见意图 | 安全方法 | 幂等方法 | 前端常见场景 |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | 读取资源表示 | 是 | 是 | 列表、详情、搜索 |
| **POST** | 创建资源或触发一次动作 | 否 | 通常否 | 创建订单、提交任务 |
| **PUT** | 用完整表示替换目标资源 | 否 | 是 | 保存完整配置 |
| **PATCH** | 对资源执行部分更新 | 否 | 取决于补丁语义 | 修改资料中的部分字段 |
| **DELETE** | 删除目标资源 | 否 | 是 | 删除收藏、撤销资源 |

“幂等”指多次相同请求产生的预期效果与一次请求相同。响应状态可以随资源当前状态变化，例如第一次 DELETE 返回 204，后续请求返回 404，删除效果仍然保持一致。

重试策略应来自方法语义和业务契约：

- GET、PUT、DELETE 等幂等操作可以在网络失败后按策略重试。
- POST 需要服务端提供明确的去重或幂等机制，例如业务请求 ID。
- 429 与 503 可以结合 **Retry-After** 和指数退避安排重试。
- 身份失效、字段校验失败和权限不足应直接进入对应恢复流程。

### **状态码与错误正文**

状态码提供机器可读的第一层结果：

- **2xx**：请求已经按相应语义成功处理。
- **400 / 422**：请求格式或业务输入需要修正。
- **401**：客户端需要恢复认证或重新登录。
- **403**：当前身份缺少执行该操作的权限。
- **404**：目标资源不存在或当前主体不可见。
- **409**：当前资源状态与操作发生冲突。
- **412**：条件请求中的前置条件失败。
- **429**：请求频率超过服务允许范围。
- **5xx**：服务端或上游系统发生失败。

[RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html) 提供了通用错误正文结构，核心字段包括 type、title、status、detail 和 instance。服务可以增加 fieldErrors、requestId 等扩展字段，让前端稳定映射表单错误并关联服务端日志。

### **缓存与条件请求**

[RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) 定义 HTTP 缓存行为。几个常见指令各司其职：

- **max-age** 定义响应保持新鲜的时间。
- **private** 限制响应只能由单个用户的私有缓存保存。
- **no-cache** 允许保存响应，并要求复用前先向源站验证。
- **no-store** 要求缓存避免保存请求或响应。
- **ETag** 为资源表示提供验证器。

客户端可以携带 **If-None-Match** 验证缓存；表示未变化时，服务端返回 304。更新操作可以携带 **If-Match** 表达“只修改我读到的版本”；资源已经变化时，服务端返回 412，前端再显示冲突并帮助用户合并。

## **IV.11.3 静态类型与运行时验证共同守住边界**

TypeScript 会在编译后擦除类型。网络响应、URL 参数、本地存储和跨窗口消息需要运行时验证，再转换成应用内部类型。

| 契约方式 | 契约来源 | 前端获得的能力 | 工具示例说明 |
| :--- | :--- | :--- | :--- |
| **代码内 Schema** | 前端或共享包中的验证定义 | 运行时验证和类型推导可以放在一起 | Zod、Valibot 用 Schema 推导 TypeScript 类型 |
| **JSON Schema** | 独立的 JSON 结构规范 | 跨语言验证、文档和测试数据生成 | [JSON Schema](https://json-schema.org/) 描述 JSON 的结构约束 |
| **OpenAPI** | HTTP 路径、方法、参数、响应和 Schema | 文档、客户端生成、Mock 与契约检查 | [OpenAPI Specification](https://spec.openapis.org/oas/) 描述 HTTP API |
| **GraphQL Schema** | 服务端 SDL | 查询字段、变量和响应类型生成 | GraphQL Code Generator、Apollo、Relay |
| **Protobuf** | 独立 IDL | 多语言代码生成和紧凑二进制消息 | gRPC、gRPC-Web |
| **TypeScript 推断** | 同一 TypeScript 工程中的服务端路由 | 端到端编辑器提示和重构反馈 | tRPC 共享路由类型 |

生成的 TypeScript 类型负责开发期反馈，运行时验证负责处理真实输入。使用 OpenAPI、GraphQL 或 Protobuf 时，团队还要明确生成代码版本、兼容策略和部署顺序。

::: details 启发式示例：统一验证成功与失败响应

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["member", "admin"]),
});

const ProblemSchema = z.object({
  title: z.string(),
  detail: z.string().optional(),
}).passthrough();

class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly requestId: string | null,
    message: string,
  ) {
    super(message);
  }
}

export async function getUser(userId: string, signal: AbortSignal) {
  const response = await fetch(
    "/api/users/" + encodeURIComponent(userId),
    {
      signal,
      headers: {
        Accept: "application/json, application/problem+json",
      },
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const problem = ProblemSchema.safeParse(body);
    throw new ApiError(
      response.status,
      response.headers.get("x-request-id"),
      problem.success
        ? problem.data.detail ?? problem.data.title
        : "请求失败",
    );
  }

  return UserSchema.parse(body);
}
```

这个边界依次检查 HTTP 状态、错误结构和成功结构。组件只需要处理 ApiError、取消状态和已验证的 User 数据。

:::

## **IV.11.4 请求生命周期：取消、竞态与重试**

稳定请求层需要覆盖整个生命周期：

- **取消**：页面离开、搜索条件变化或组件卸载时，通过 AbortSignal 结束已经失去价值的请求。
- **超时**：由应用策略定义最大等待时间，并把超时与用户主动取消分开记录。
- **竞态**：连续搜索等场景只接收当前查询对应的结果，旧请求完成后不覆盖新状态。
- **去重**：多个组件读取同一资源时，共享进行中的请求或服务器状态缓存。
- **重试**：根据幂等性、失败类型、Retry-After 和退避策略决定。
- **可观测性**：保留 request ID、路由模板、状态码、耗时和发布版本，同时遵循数据最小化原则。

数据获取库和路由 loader 可以封装缓存、去重与重新验证。API 契约仍要告诉这些工具：什么可以重试、何时过期、哪些失败需要用户操作。

## **IV.11.5 更新并发与分页稳定性**

### **用 ETag 防止覆盖新版本**

假设用户打开资料页时收到：

```http
HTTP/1.1 200 OK
ETag: "profile-v7"
Content-Type: application/json

{"id":"42","name":"Ada"}
```

保存时把读取到的版本带回服务端：

```http
PATCH /api/users/42 HTTP/1.1
If-Match: "profile-v7"
Content-Type: application/json

{"name":"Ada Lovelace"}
```

当前版本仍是 profile-v7 时，服务端执行更新并返回新的 ETag。其他人已经更新该资源时，服务端返回 412，前端展示最新数据和冲突恢复入口。

### **分页契约要定义顺序**

| 分页方式 | 契约内容 | 适合场景 | 需要处理的边界 |
| :--- | :--- | :--- | :--- |
| **Offset / page** | offset、limit 或 page、pageSize，可选 total | 数据变化较少、需要跳页的后台表格 | 插入和删除可能造成重复或跳项 |
| **Cursor** | opaque cursor、limit、nextCursor、hasNextPage | 持续变化的信息流和大数据集合 | 排序必须稳定，cursor 的有效期需要约定 |

分页结果还应明确：

- 排序字段和相同值时的稳定次序；
- 筛选条件是否编码进 cursor；
- total 是精确值、估算值还是省略；
- 空页、末页和 cursor 失效怎样表达；
- 新数据到达后，列表采用刷新、插入还是提示用户。

## **IV.11.6 契约演进与兼容性**

前后端可以独立部署，因此兼容窗口属于契约的一部分。

- 优先增加可选字段，并为新字段提供清晰默认语义。
- 调整必填字段时，先让服务端接受新旧两种输入，再升级客户端，最后收紧服务端。
- 枚举扩展时，为客户端定义未知值的展示与记录策略。
- 废弃字段需要公告、迁移窗口和调用量观测。
- 破坏性语义变化可以使用新路径、媒体类型或明确版本策略。
- OpenAPI diff、Schema 检查和 consumer contract test 可以在 CI 中阻止意外破坏。

客户端生成可以减少手写类型漂移；运行时 Schema、兼容测试和部署顺序共同保证真实系统的安全演进。

## **IV.11.7 现代后端集成模式**

这些方案以不同方式表达查询、类型与连接，前面的 HTTP、错误、验证和演进原则仍然适用。

### **GraphQL：由客户端声明响应形状**

[GraphQL](https://graphql.org/) 通过 Schema 定义字段、参数和操作。客户端使用 query 读取数据、mutation 修改数据，并只声明当前界面需要的字段。

[Apollo Client](https://www.apollographql.com/docs/react/) 展示了规范化缓存、错误处理和乐观更新等客户端能力；[Relay](https://relay.dev/) 展示了编译期数据依赖与片段组合。实际系统还要治理查询复杂度、字段权限、缓存键、错误数组和 Schema 废弃流程。

### **gRPC-Web：以 Protobuf 作为跨语言契约**

[gRPC-Web](https://github.com/grpc/grpc-web) 让浏览器客户端使用 Protobuf 生成的类型与服务通信。它适合后端已经采用 gRPC、团队重视多语言代码生成和严格消息结构的场景。

浏览器调用通常经过 Envoy 等代理或网关。团队需要核对调用类型、流式支持、错误映射、网关配置和浏览器网络限制，再决定它是否适合公开 Web 客户端。

### **tRPC：共享 TypeScript 路由类型**

[tRPC](https://trpc.io/) 从服务端 TypeScript 路由推断输入与输出类型，适合同一团队维护的全栈 TypeScript 应用。它提供紧密的编辑器反馈和重构体验。

运行时输入校验、认证授权、错误结构、缓存语义和公共 API 兼容期仍需显式设计。跨语言客户端较多时，OpenAPI、GraphQL 或 Protobuf 通常更容易共享契约。

### **实时通信：先确定消息方向**

- **轮询**适合更新频率低、实现成本敏感的状态查询。
- **SSE**使用 HTTP 向客户端持续发送文本事件，浏览器提供 EventSource 和自动重连语义。
- **WebSocket**提供全双工文本或二进制消息，适合聊天、协作和高频双向交互。

实时消息契约还要定义消息类型、版本、顺序、重复处理、确认、心跳、重连恢复、背压和认证续期。

### **Headless CMS：内容模型也是数据契约**

Headless CMS 通过 REST 或 GraphQL 提供内容，前端负责展示与交互。[Strapi](https://strapi.io/) 代表可自托管方案，[Contentful](https://www.contentful.com/) 代表 SaaS 内容平台。

集成时需要确认内容模型、草稿预览、多语言字段、资源 URL、Webhook、缓存失效和发布回滚。Next.js、Nuxt、SvelteKit 等元框架可以在构建期或请求期读取内容，并按页面需求选择 SSG、SSR 或增量更新。

## **表格：API 通信模式对比 (GraphQL vs. REST)**

| 特性/模式           | REST (Representational State Transfer)                                                                           | [GraphQL](https://graphql.org/) (Graph Query Language)                                                               |
| :------------------ | :--------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **请求方式**        | 基于 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 动词（GET, POST, PUT, DELETE），通过 URL 标识资源 | 通常通过 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) POST，使用 query, mutation, subscription 定义操作 |
| **数据返回**        | 服务器定义的整个资源结构，可能存在过度或不足获取                                                                 | 客户端精确指定所需数据，只返回所需字段                                                                               |
| **端点数量**        | 通常为每个资源或资源集合定义多个端点                                                                             | 单一端点（通常为/[graphql](https://graphql.org/)）处理所有查询                                                       |
| **服务器端 Schema** | 可选，通常通过文档或约定定义                                                                                     | 强制要求，使用 SDL 定义强类型系统，自文档化                                                                          |
| **版本化**          | 通常通过 URL 版本化（如/v1/），可能导致兼容性问题                                                                | 通过废弃字段实现向后兼容，通常无需版本化                                                                             |
| **缓存**            | 基于 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 缓存机制，易于实现                                | 复杂，因查询动态变化，难以做通用缓存                                                                                 |
| **复杂性**          | 简单直观，易于上手                                                                                               | 学习曲线较陡峭，服务器端实现复杂                                                                                     |
| **适用场景**        | 资源明确、数据结构固定、简单 CRUD 操作                                                                           | 客户端数据需求多变、需要聚合多数据源、减少请求次数、移动端优化                                                       |

## **表格：实时通信方案对比 (WebSocket vs. Server-Sent Events)**

| 特性/方案        | WebSocket                              | [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) (SSE)                                 |
| :--------------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| **通信方向**     | 全双工（双向：客户端⇄服务器）          | 单向（服务器→客户端）                                                                                                           |
| **协议**         | WebSocket 协议 (ws://, wss://)         | 标准 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)/[HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS) |
| **连接维护**     | 保持持久连接，开销相对较大             | 视为常规 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 流量，内置自动重连                                           |
| **数据格式**     | 支持任意二进制数据和文本数据           | 仅支持 UTF-8 文本数据                                                                                                           |
| **浏览器支持**   | 所有主流浏览器广泛支持                 | 主流浏览器支持，IE 等旧版浏览器不支持                                                                                           |
| **实现复杂性**   | 协议相对底层，需手动处理重连等，略复杂 | 基于 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)，客户端实现相对简单                                              |
| **并发连接限制** | 无明显限制（受限于服务器资源）         | 每个浏览器通常有 6 个并发连接限制                                                                                               |
| **防火墙兼容性** | 可能受企业防火墙影响                   | 基于 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)，通常无防火墙问题                                                |
| **典型用例**     | 聊天、在线游戏、实时协作、高频数据更新 | 新闻订阅、股票行情、直播评论、进度条、通知                                                                                      |

表中的 SSE 并发连接数字主要对应 HTTP/1.x 的同源连接限制；HTTP/2 使用多路复用，并由客户端与服务端协商并发流数量。生产方案应按实际协议、浏览器和网关配置验证。

## **IV.11.8 前端 API 契约检查清单**

接入接口前，可以逐项确认：

1. 路径、方法和请求 Content-Type 是否表达清楚操作意图。
2. 路径参数、查询参数、请求体和成功响应是否有可执行 Schema。
3. 错误是否同时具有正确状态码、稳定结构和用户可恢复信息。
4. [认证与授权](/guide/advanced-practices/auth)、[Cookie 与 CORS 安全边界](/guide/advanced-practices/security-basics)是否已经明确。
5. 取消、超时、竞态、重试和幂等策略是否与业务风险匹配。
6. Cache-Control、ETag、客户端缓存与更新失效是否形成一致策略。
7. 更新冲突、分页顺序和实时消息恢复是否有确定语义。
8. request ID、耗时、状态码和发布版本是否能支持跨端排障。
9. Schema 变更、废弃周期、契约测试和部署顺序是否可追踪。
10. 服务端专用模块、客户端专用模块和可序列化数据是否有清晰边界。
11. 认证、授权、Cookie、日志和缓存是否会把不该暴露的数据送到客户端。
12. 页面或组件的缓存失效是否与写操作、权限变化和数据更新事件一致。
13. 如果使用 AI 生成或修改接口代码，是否仍然通过 Schema、测试、真实请求和安全审查验证。

稳定的数据契约让协议、类型、业务和界面状态彼此对齐。前端由此可以把网络中的不确定输入，转换成可验证、可恢复、可演进的产品行为。现代框架把更多服务端能力带到前端工程中，也意味着缓存、权限、序列化和安全补丁属于前端需要理解的责任边界。具体的缓存生命周期，可以继续阅读[数据获取](/guide/frameworks/data-fetching)和[服务器状态与客户端状态](/guide/frameworks/server-client-state)。

## **IV.11.9 服务端 DTO 到客户端状态的边界**

服务端返回的数据进入组件前，应完成序列化、运行时验证和内部类型转换。下面用零依赖示例展示这条边界：

```ts
type Product = {
  id: string;
  name: string;
  price: number;
};

function parseProduct(value: unknown): Product {
  if (!value || typeof value !== "object") throw new Error("Invalid product");
  const record = value as Record<string, unknown>;

  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    typeof record.price !== "number"
  ) {
    throw new Error("Invalid product fields");
  }

  return { id: record.id, name: record.name, price: record.price };
}

export async function loadProducts(signal?: AbortSignal) {
  const response = await fetch("/api/products", { signal });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error("Invalid product list");
  return payload.map(parseProduct);
}
```

类型声明帮助编辑器理解数据；运行时解析负责面对真实网络输入。数据经过验证后再进入 UI、缓存或状态管理层，错误状态也就拥有稳定的处理入口。
