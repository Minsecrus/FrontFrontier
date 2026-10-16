---
title: "IV. 前端框架和库：构建现代 UI / IV.11 API 与数据契约：从 HTTP 到现代后端集成"
---

# IV.11 API 与数据契约：从 HTTP 到现代后端集成（*）

API 契约定义前端与服务端共同遵守的通信规则。它覆盖请求意图、数据结构、错误格式、缓存方式、并发行为和版本演进。契约越清楚，前端越容易维持稳定的界面状态、定位失败原因并安全重试。

一条数据从服务端进入界面，通常经过五层：

> 传输 → 协议语义 → 数据结构 → 业务语义 → 界面状态

GraphQL、gRPC-Web 和 tRPC 等方案位于这条链的不同位置。理解基础契约后，选型理由也更容易说清。

在 SSR、流式渲染、服务器组件（Server Components）或 Server Functions 中，前端还必须明确**服务端/客户端运行边界**。服务端模块可能拥有数据库、密钥和用户身份上下文；客户端模块拥有 DOM、浏览器存储和用户交互。两者之间传递的内容需要经过序列化、校验、权限判断和错误处理，形成明确的数据契约。清晰的边界有助于保护密钥、控制数据量、验证输入并保持缓存结果正确。

## **IV.11.1 契约包含哪些层次**

| 契约层次     | 需要回答的问题                       | 示例                                          | 工具或规范示例                                                |
| :----------- | :----------------------------------- | :-------------------------------------------- | :------------------------------------------------------------ |
| **传输**     | 数据通过什么通道到达，连接怎样恢复   | 请求响应、服务器推送、双向消息                | HTTP、SSE、WebSocket                                          |
| **协议语义** | 这次操作想做什么，成功与失败怎样表达 | GET 读取、PATCH 更新、404 资源缺失、ETag 校验 | [HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) |
| **数据结构** | 字段、类型、必填项和嵌套关系是什么   | 用户包含 id、name、role                       | TypeScript、JSON Schema、OpenAPI、GraphQL SDL、Protobuf       |
| **业务语义** | 字段代表什么，允许哪些状态变化       | 金额的币种、订单状态转换、权限范围            | 领域文档、状态机、示例数据                                    |
| **界面状态** | 前端如何呈现等待、空数据、冲突与失败 | loading、empty、validation error、conflict    | 组件状态、路由状态、服务器状态工具                            |

结构验证只能确认“数据长得对”。业务规则还需要回答“数据表达的事情是否成立”。例如，金额字段是数字属于结构规则；金额必须大于零且币种受支持属于业务规则。

## **IV.11.2 用 HTTP 语义表达操作意图**

[RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) 定义了 HTTP 方法、状态码、条件请求和资源表示（representation）的元数据。前端应根据这些语义决定缓存、重试和界面反馈。

### **方法、安全性与幂等性**

| 方法       | 常见意图               | 安全方法 | 幂等方法       | 前端常见场景         |
| :--------- | :--------------------- | :------- | :------------- | :------------------- |
| **GET**    | 读取资源表示           | 是       | 是             | 列表、详情、搜索     |
| **POST**   | 创建资源或触发一次动作 | 否       | 通常否         | 创建订单、提交任务   |
| **PUT**    | 用完整表示替换目标资源 | 否       | 是             | 保存完整配置         |
| **PATCH**  | 对资源执行部分更新     | 否       | 取决于补丁语义 | 修改资料中的部分字段 |
| **DELETE** | 删除目标资源           | 否       | 是             | 删除收藏、撤销资源   |

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
- **404**：目标资源不存在，或对当前用户不可见。
- **409**：当前资源状态与操作发生冲突。
- **412**：条件请求中的前置条件失败。
- **429**：请求频率超过服务允许范围。
- **5xx**：服务端或上游系统发生失败。

[RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html) 提供了通用错误正文结构，核心字段包括 type、title、status、detail 和 instance。服务可以增加 fieldErrors、requestId 等扩展字段，让前端稳定映射表单错误并关联服务端日志。

### **缓存与条件请求**

[RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) 定义 HTTP 缓存行为。几个常见的 Cache-Control 指令和验证器各司其职：

- **max-age** 定义响应保持新鲜的时间。
- **private** 限制响应只能由单个用户的私有缓存保存。
- **no-cache** 允许保存响应，并要求复用前先向源站验证。
- **no-store** 要求缓存不得保存请求或响应。
- **ETag** 是响应头（定义于 RFC 9110），为资源表示提供验证器。

客户端可以携带 **If-None-Match** 验证缓存；资源表示未变化时，服务端返回 304。更新操作可以携带 **If-Match** 表达“只修改我读到的版本”；资源已经变化时，服务端返回 412，前端再显示冲突并帮助用户合并。

## **IV.11.3 静态类型与运行时验证共同守住边界**

TypeScript 会在编译后擦除类型。网络响应、URL 参数、本地存储和跨窗口消息需要运行时验证，再转换成应用内部类型。

| 契约方式            | 契约来源                             | 前端获得的能力                    | 工具示例说明                                                          |
| :------------------ | :----------------------------------- | :-------------------------------- | :-------------------------------------------------------------------- |
| **代码内 Schema**   | 前端或共享包中的验证定义             | 运行时验证和类型推导可以放在一起  | Zod、Valibot 用 Schema 推导 TypeScript 类型                           |
| **JSON Schema**     | 独立的 JSON 结构规范                 | 跨语言验证、文档和测试数据生成    | [JSON Schema](https://json-schema.org/) 描述 JSON 的结构约束          |
| **OpenAPI**         | HTTP 路径、方法、参数、响应和 Schema | 文档、客户端代码生成、Mock 与契约检查 | [OpenAPI Specification](https://spec.openapis.org/oas/) 描述 HTTP API |
| **GraphQL Schema**  | 服务端 SDL                           | 查询字段、变量和响应类型生成      | GraphQL Code Generator、Apollo、Relay                                 |
| **Protobuf**        | 独立 IDL                             | 多语言代码生成和紧凑二进制消息    | gRPC、gRPC-Web                                                        |
| **TypeScript 推断** | 同一 TypeScript 工程中的服务端路由   | 端到端编辑器提示和重构反馈        | tRPC 共享路由类型                                                     |

生成的 TypeScript 类型负责开发期反馈，运行时验证负责处理真实输入。使用 OpenAPI、GraphQL 或 Protobuf 时，团队还要明确生成代码版本、兼容策略和部署顺序。

::: details 示例：统一验证成功与失败响应

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["member", "admin"]),
});

const ProblemSchema = z.looseObject({
  title: z.string(),
  detail: z.string().optional(),
});

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

`getUser` 在这条边界上依次检查 HTTP 状态、错误结构和成功结构。组件只需要处理 ApiError、取消状态和已验证的 User 数据。

:::

## **IV.11.4 请求生命周期：取消、竞态与重试**

稳定的请求层需要覆盖请求的整个生命周期：

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

| 分页方式          | 契约内容                                      | 适合场景                         | 需要处理的边界                        |
| :---------------- | :-------------------------------------------- | :------------------------------- | :------------------------------------ |
| **Offset / page** | offset、limit 或 page、pageSize，可选 total   | 数据变化较少、需要跳页的后台表格 | 插入和删除可能造成重复或跳项          |
| **Cursor**        | 不透明 cursor、limit、nextCursor、hasNextPage | 持续变化的信息流和大数据集合     | 排序必须稳定，cursor 的有效期需要约定 |

表中的“不透明 cursor”（opaque cursor）指客户端只负责原样回传、不解析其内容的游标字符串。分页结果还应明确：

- 排序字段和相同值时的稳定次序；
- 筛选条件是否编码进 cursor；
- total 是精确值、估算值还是省略；
- 空页、末页和 cursor 失效怎样表达；
- 新数据到达后，列表采用刷新、插入还是提示用户。

## **IV.11.6 契约演进与兼容性**

前后端往往独立发版，且浏览器端可能长时间驻留旧版本页面或缓存脚本，因此兼容窗口本身就是契约的一部分：

- **向后兼容扩展**：优先以可选字段形式新增数据，并为新字段定义明确的缺省语义。
- **必填字段平滑迁移**：采取“扩张-收缩”（Expand-and-Contract）策略——先让服务端同时兼容新旧两种输入，待活跃客户端完成升级后再收紧服务端校验。
- **枚举未知值兜底**：服务端扩展枚举值时，客户端需预设未知枚举值的降级展示与监控上报逻辑，避免界面直接崩溃。
- **字段废弃治理**：下线旧字段前需经历废弃标记（如 `@deprecated`）、迁移窗口期与线上真实调用量清零核查。
- **破坏性变更隔离**：当业务语义发生无法兼容的改变时，应通过新路由路径、新查询字段、媒体类型协商或显式版本号隔离新旧契约。
- **自动化契约门禁**：在 CI 流水线中接入 OpenAPI diff、Schema 兼容性检查与消费者驱动的契约测试（consumer contract test，即由调用方声明自己依赖的请求与响应结构，再交由服务端在集成测试中自动验证），从工程上拦截意外的破坏性修改。

配合从契约自动生成客户端请求与类型代码，团队可以避免手写 TypeScript 类型与线上真实响应逐渐脱节；生成期静态类型、边界运行时 Schema、CI 兼容门禁与灰度发布顺序共同保障了接口的安全演进。

## **IV.11.7 现代后端集成模式**

不同后端集成方案在查询粒度、类型传递与长连接管理上各有取舍，但前述 HTTP 语义、错误结构、运行时校验与兼容演进原则依然通用。

### **GraphQL：由客户端声明响应形状**

[GraphQL](https://graphql.org/) 通过服务端 Schema（SDL）统一定义实体、字段、参数与操作类型。客户端使用 `query` 按需声明当前视图所需的字段子集，使用 `mutation` 执行写操作，从而避免单次请求返回大量冗余字段（over-fetching）或为拼装一个页面连续发起多次串行请求（under-fetching）。

在客户端层面，[Apollo Client](https://www.apollographql.com/docs/react/) 提供了基于对象标识的规范化缓存（Normalized Cache）、错误链路处理与乐观更新；[Relay](https://relay.dev/) 则强调编译期静态分析与组件级数据片段（Fragment）组合。落地 GraphQL 时，服务端与前端还需协同治理查询深度限制、字段级鉴权、部分成功（`data` 与 `errors` 并存）处理以及 Schema 字段废弃流程。

### **gRPC-Web：以 Protobuf 作为跨语言契约**

[gRPC-Web](https://github.com/grpc/grpc-web) 允许浏览器客户端直接复用 Protocol Buffers（Protobuf）生成的强类型桩代码与后端通信，适合微服务内部已广泛采用 gRPC、且重视跨语言契约一致性与紧凑二进制消息结构的团队。

由于浏览器网络 API 无法直接暴露底层 HTTP/2 帧控制，gRPC-Web 请求通常需要经过 Envoy 等反向代理或 API 网关完成协议转换。选型时需重点核对服务端流式响应支持度、网关转换配置、二进制 payload 调试方式以及公开网络环境下的代理兼容性。

### **tRPC：共享 TypeScript 路由类型**

[tRPC](https://trpc.io/) 直接从服务端 TypeScript 路由定义中推断输入参数与返回值类型，无需额外编写中间 IDL 文件或运行代码生成脚本，非常适合前后端位于同一 Monorepo 的全栈 TypeScript 团队，能提供即时的跨端重命名与类型报错反馈。

需要注意的是，编译期类型共享并不能替代网络边界治理：生产环境仍需结合 Zod / Valibot 执行服务端运行时输入校验，并显式规划认证上下文、标准错误码映射、HTTP 缓存头以及前后端分开部署时的版本兼容窗口。若接口需要同时服务移动端原生应用或第三方跨语言调用方，OpenAPI、GraphQL 或 Protobuf 依然是更通用的契约载体。

### **实时通信：先确定消息方向**

- **轮询（Polling）**：定时发起普通 HTTP 请求，适合数据变更频率低、对实时性要求在秒级以上且追求最小化基础设施复杂度的状态同步。
- **Server-Sent Events（SSE）**：基于标准 HTTP 长连接由服务端向客户端单向推送 UTF-8 文本事件流，浏览器原生提供 `EventSource` 接口与断线自动重连语义（配合 `Last-Event-ID` 续传）。
- **WebSocket**：在单个 TCP 连接上提供全双工文本或二进制帧通信，适合在线协同编辑、即时通讯与高频双向交互场景。

无论采用 SSE 还是 WebSocket，实时契约都必须额外约定消息事件类型、载荷版本号、乱序与重复消息幂等处理、心跳保活、断线重连后的增量状态补齐、消费端背压（backpressure）以及长连接期间的令牌续期。

### **Headless CMS：内容模型也是数据契约**

Headless CMS 将内容编排后台与前端渲染层解耦，通过 REST 或 GraphQL 接口对外暴露结构化内容；其中 [Strapi](https://strapi.io/) 是开源自托管方案的代表，[Contentful](https://www.contentful.com/) 则是典型的云端 SaaS 内容平台。

对接 Headless CMS 时，内容模型（Content Model）本身就是前后端的数据契约。工程上需要明确富文本/动态区块（Blocks）的解析 Schema、草稿预览（Draft Mode）鉴权通道、多语言回退规则、媒体资源 CDN 转换参数以及内容发布触发页面按需增量再生成（ISR / Webhook 缓存失效）的链路。

在请求-响应模式下，下表横向对比了 REST 与 GraphQL 在数据组织、缓存机制与演进方式上的核心差异：

| 特性/模式           | REST（Representational State Transfer）                                                                          | [GraphQL](https://graphql.org/)（Graph Query Language）                                                              |
| :------------------ | :--------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **请求方式**        | 基于 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 动词（GET、POST、PUT、DELETE），通过 URL 标识资源 | 通常通过 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) POST，使用 query、mutation、subscription 定义操作 |
| **数据返回**        | 服务器定义的整个资源结构，可能获取过多或过少（over-fetching / under-fetching）                                                                 | 客户端精确指定所需数据，只返回所需字段                                                                               |
| **端点数量**        | 通常为每个资源或资源集合定义多个端点                                                                             | 单一端点（通常为 `/graphql`）处理所有查询                                                       |
| **服务端 Schema**   | 可选，通常通过文档或约定定义                                                                                     | 强制要求，使用 SDL 定义强类型系统，自文档化                                                                          |
| **版本化**          | 通常通过 URL 版本化（如 `/v1/`），可能导致兼容性问题                                                                | 通过废弃字段实现向后兼容，通常无需版本化                                                                             |
| **缓存**            | 基于 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 缓存机制，易于实现                                | 复杂，因查询动态变化，难以做通用缓存                                                                                 |
| **复杂性**          | 简单直观，易于上手                                                                                               | 学习曲线较陡峭，服务端实现复杂                                                                                       |
| **适用场景**        | 资源明确、数据结构固定、简单 CRUD 操作                                                                           | 客户端数据需求多变、需要聚合多数据源、减少请求次数、移动端优化                                                       |

针对需要服务端主动推送的实时场景，下表对比了 WebSocket 与 Server-Sent Events（SSE）在协议特性与连接治理上的取舍：

| 特性/方案        | WebSocket                              | [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)（SSE）                                |
| :--------------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| **通信方向**     | 全双工（双向：客户端⇄服务器）          | 单向（服务器→客户端）                                                                                                           |
| **协议**         | WebSocket 协议（ws://、wss://）        | 标准 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)/[HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS) |
| **连接维护**     | 保持持久连接，开销相对较大             | 视为常规 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 流量，内置自动重连                                           |
| **数据格式**     | 支持任意二进制数据和文本数据           | 仅支持 UTF-8 文本数据                                                                                                           |
| **浏览器支持**   | 所有主流浏览器广泛支持                 | 主流浏览器支持，IE 等旧版浏览器不支持                                                                                           |
| **实现复杂性**   | 协议相对底层，需手动处理重连等，略复杂 | 基于 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)，客户端实现相对简单                                              |
| **并发连接限制** | 无明显限制（受限于服务器资源）         | HTTP/1.x 下同一域名通常最多 6 个并发连接                                                                                        |
| **防火墙兼容性** | 可能受企业防火墙影响                   | 基于 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)，通常无防火墙问题                                                |
| **典型用例**     | 聊天、在线游戏、实时协作、高频数据更新 | 新闻订阅、股票行情、直播评论、进度条、通知                                                                                      |

表中的 SSE 并发连接数字主要对应 HTTP/1.x 的同源连接限制；HTTP/2 使用多路复用，并由客户端与服务端协商并发流数量。生产方案应按实际协议、浏览器和网关配置验证。

## **IV.11.8 前端 API 契约检查清单**

联调与上线前，可按以下 13 项检查点逐一核验接口契约的完备度：

1. **协议意图**：路径、HTTP 方法与请求 `Content-Type` 是否准确表达了操作的读写与幂等语义。
2. **结构校验**：路径参数、查询参数、请求体与成功响应是否均具备可执行的运行时 Schema。
3. **错误契约**：失败响应是否同时提供准确的 HTTP 状态码、稳定的机器可读结构以及面向用户的恢复提示。
4. **安全基线**：[认证与授权](/guide/advanced-practices/auth)、[Cookie 与 CORS 安全边界](/guide/advanced-practices/security-basics)是否已在契约层显式定义。
5. **异常韧性**：请求取消、超时阈值、并发竞态丢弃、退避重试与写操作幂等键是否匹配业务风险。
6. **缓存协同**：`Cache-Control`、`ETag`、客户端内存缓存与写后失效机制是否彼此对齐。
7. **并发与顺序**：并发写冲突（`If-Match` / 412）、分页稳定排序及实时流断线重连是否具备确定性恢复语义。
8. **跨端可观测性**：`x-request-id`、路由模板、状态码、耗时与前端发版号是否足以串联端到端排障链路。
9. **演进治理**：Schema 变更比对、字段废弃窗口、契约测试门禁与前后端发布顺序是否受控可追踪。
10. **模块隔离**：服务端专属模块（含密钥与直连数据库逻辑）、客户端模块与跨端可序列化载荷之间是否画清了静态边界。
11. **最小化暴露**：认证上下文、日志脱敏与共享缓存是否严格阻止了敏感字段向客户端泄漏。
12. **状态联动**：页面或组件级缓存在写操作成功、用户权限变更或登出切换时能否可靠失效。
13. **AI 辅助产物核验**：若使用 AI 生成或修改了接口调用与 DTO 代码，是否仍通过了运行时 Schema、边界测试、真实抓包与安全审查的双重验证。

稳定的数据契约让网络协议、静态类型、业务规则与界面状态机彼此对齐，帮助前端将充满不确定性的外部网络输入转化为可验证、可恢复、可演进的产品行为。随着全栈元框架将更多服务端职责纳入前端工程仓库，缓存策略、权限校验、序列化边界与服务端依赖安全也一并进入了前端工程师的日常守备范围；关于客户端缓存与状态生命周期的具体实现，可结合[数据获取](/guide/frameworks/data-fetching)与[服务器状态与客户端状态](/guide/frameworks/server-client-state)对照阅读。

## **IV.11.9 服务端 DTO 到客户端状态的边界**

DTO（Data Transfer Object，数据传输对象）指专门用于在服务端与客户端之间传递的数据结构。服务端返回的数据进入组件前，应完成序列化、运行时验证和内部类型转换。下面用零依赖示例展示这条边界：

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
