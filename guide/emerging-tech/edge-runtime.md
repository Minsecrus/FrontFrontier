---
title: "VI. 新兴技术和专业领域 / VI.9 边缘计算：Cloudflare Workers、Vercel Edge Runtime、Deno Deploy"
---

# VI.9 边缘计算：Cloudflare Workers、Vercel Edge Runtime、Deno Deploy

**目的**：在更靠近用户地理位置的网络“边缘节点”上运行无服务器计算，以极大降低首字节时间 (TTFB)、消除跨国网络往返延迟。

- [**Cloudflare Workers**](https://workers.cloudflare.com/)：基于 V8 Isolates 轻量隔离沙箱的无服务器计算平台，具备亚毫秒级极速冷启动，与 D1 (SQL)、KV、R2 (对象存储) 深度整合。
- [**Vercel Edge Functions**](https://vercel.com/docs/functions/runtimes/edge)：与 Next.js 等前端框架紧密集成的边缘流式计算方案。
- [**Deno Deploy**](https://deno.com/deploy)：基于 Deno 运行时的原生 TypeScript 全球分布式计算平台。

## **VI.9.1 运行时标准化：WinterCG 与 Web 互操作标准**

过去各家 Serverless 平台充斥着私有 API，导致代码难以跨云迁移。现代边缘生态的核心推动力是 **[WinterCG (Web-interoperable Runtimes Community Group)](https://wintercg.org/)**：

- **统一标准 API**：规范了边缘环境的“最小通用 Web 平台 API”（Minimum Common Web Platform API）。无论是 Cloudflare Workers、Deno、Bun 还是 Node.js，均原生支持标准的 `fetch`、`Request`、`Response`、`Headers`、`URLPattern`、`TransformStream` 以及 `Web Crypto API`。
- **同构函数与框架适配**：前端元框架（Nuxt Nitro、SvelteKit Adapters、Astro）能够编写一次路由逻辑，通过标准 Web 接口无缝编译并部署到任意边缘提供商。

## **VI.9.2 边缘计算的工程考量与权衡**

“边缘”并非适用于所有场景，它更强调**负载与任务的精确匹配**：

- **适合边缘的任务**：请求路由重写/重定向、JWT/OAuth 鉴权拦截、Geo 地理位置感知与本地化、A/B 分流实验、流式响应（Streaming SSR/AI 流式输出）、CDN 缓存编排。
- **边缘架构的工程挑战与解法**：
  1. **数据库连接池耗尽 (Connection Exhaustion)**：由于边缘函数按需高并发无状态实例化，直连传统 Postgres/MySQL 会迅速打爆连接数。必须使用支持 HTTP/WebSocket 协议的 Serverless 驱动或边缘连接池中继（如 Cloudflare Hyperdrive、Neon Serverless Driver、Prisma Accelerate）。
  2. **数据局部性 (Data Locality)**：如果边缘函数离用户 10ms，但每次都要跨洋访问位于单一区域的中心数据库（200ms 往返），边缘计算反而会因频繁回源而劣化体验。现代解法是配合边缘分布式读副本（如 Cloudflare D1、Turso / libSQL）。
  3. **计算与内存约束**：轻量 Isolates 架构限制了单次请求的 CPU 耗时与内存上限，大体积二进制依赖或长时间密集计算仍应留在传统容器环境中运行。

## **表格：边缘计算平台比较**

| 平台名称 | 提供商 | 运行时与底层模型 | 适合场景 | 优势与收益 | 需要注意的点 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [**Cloudflare Workers**](https://workers.cloudflare.com/) | Cloudflare | V8 Isolates | 全球低延迟 API、缓存编排、边缘全栈应用 | 全球 Anycast 节点多、冷启动极快（<5ms）、边缘存储生态（KV, D1, R2）成熟 | 严格的 Web API 约束，部分依赖 Node 原生 C++ 绑定的老旧 npm 包不兼容 |
| [**Vercel Edge Functions**](https://vercel.com/docs/functions/runtimes/edge) | Vercel | V8 Isolates (WinterCG 标准) | 与前端元框架紧密结合的流式输出、中间件路由 | 与 Next.js 等框架同构集成、部署工作流极其顺滑 | 需遵循最新 Vercel Functions 统一配置迁移指南 |
| [**Deno Deploy**](https://deno.com/deploy) | Deno | Deno Runtime | TypeScript 优先的全球分布式 API 与全栈应用 | 原生 TypeScript 执行、内置 Deno KV 分布式数据库、Web 标准支持极佳 | 区分现代 Deno Deploy 与历史上已归档的 Classic 平台 |

## **VI.9.3 一个 Web 标准风格的边缘处理器**

边缘入口适合做轻量请求编排。下面采用遵循 Web 标准的 `fetch` 处理器，展示地理位置感知、缓存头与流式响应：

```ts
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/api/geo") {
      // 从边缘请求头中读取地理位置元信息
      const country = request.headers.get("cf-ipcountry") ?? "unknown";
      return new Response(JSON.stringify({ country }), {
        headers: {
          "content-type": "application/json",
          "cache-control": "public, max-age=60, s-maxage=300",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
```

部署前应核对运行时允许的 Web API、CPU/内存/请求时长限制、区域一致性要求和回源方式。Node.js 专属模块、长时间计算和大文件处理应沿用适合它们的运行环境。
