---
title: "VI. 新兴技术和专业领域 / VI.9 边缘计算：Cloudflare Workers、Vercel Edge Runtime、Deno Deploy"
---

# VI.9 边缘计算：Cloudflare Workers、Vercel Edge Runtime、Deno Deploy

**目的**：在更靠近用户的地方（网络“边缘”）运行无服务器函数，以降低延迟、提升性能。

- [**Cloudflare Workers**](https://workers.cloudflare.com/)：运行在 Cloudflare 全球网络上的低延迟无服务器函数。
- [**Vercel Edge Runtime / Functions**](https://vercel.com/docs/functions/runtimes/edge)：Vercel 提供的边缘运行时能力，适合低延迟响应、流式输出和贴近前端框架的部署体验。Vercel 官方已将独立 Edge Runtime 标注为 deprecated，使用时应关注其最新迁移建议。
- [**Deno Deploy**](https://deno.com/deploy)：基于 Deno Runtime 的全球部署平台。学习时要区分当前平台与历史上的 **Deploy Classic**，后者已经成为历史文档/迁移语境。

**边缘计算**是对传统中心化服务器架构局限性的直接回应，尤其对全球应用而言。它把计算移到更靠近用户的位置，有效降低延迟（TTFB、E2E 延迟）、提升感知性能，这对现代 Web 体验至关重要。

“边缘”更强调**任务匹配**：

- 适合边缘的任务：鉴权、重写/重定向、轻量 API、A/B 实验、地理位置感知、流式响应、缓存编排
- 不适合边缘的任务：重 CPU 计算、强 Node.js 依赖、大型二进制处理、需要完整长连接生态的服务

也就是说，边缘计算是针对特定负载的部署策略。

## **表格：边缘计算平台比较**

| 平台名称                                                                 | 提供商     | 运行时/模型                   | 适合场景                                 | 优势                                                | 需要注意的点                                  |
| :------------------------------------------------------------------------ | :--------- | :---------------------------- | :--------------------------------------- | :-------------------------------------------------- | :-------------------------------------------- |
| [**Cloudflare Workers**](https://workers.cloudflare.com/)                | Cloudflare | Workers Runtime / Isolates    | 全球低延迟 API、缓存编排、边缘逻辑       | 全球网络强、边缘生态完整、与 D1/R2/KV 配套紧密      | 运行时约束与传统 Node.js 服务不同             |
| [**Vercel Edge Runtime / Functions**](https://vercel.com/docs/functions/runtimes/edge) | Vercel     | Edge Runtime                  | 与前端框架紧密结合的流式输出和边缘逻辑   | 与 Next.js 等框架集成自然，部署体验顺滑             | 独立 Edge Runtime 已被官方标注为 deprecated |
| [**Deno Deploy**](https://deno.com/deploy)                               | Deno       | Deno Runtime                  | TypeScript 优先的全球部署与托管          | Deno 原生体验、TS 友好、Web 标准取向明确            | 要区分当前平台与已经退出历史舞台的 Classic   |

这个表格帮助学习者理解边缘计算的格局——边缘计算是高性能全球应用程序的关键部署策略。它突出了不同提供商如何借助分布式基础设施最小化延迟、增强可扩展性。

## **VI.9.1 一个 Web 标准风格的边缘处理器**

边缘入口适合做轻量请求编排。下面采用 Cloudflare Workers 风格的 `fetch` 处理器，展示鉴权、缓存头和 Web 标准 API 的组合：

```ts
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname !== "/api/region") {
      return new Response("Not Found", { status: 404 });
    }

    const country = request.headers.get("cf-ipcountry") ?? "unknown";
    return new Response(JSON.stringify({ country }), {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=60",
      },
    });
  },
};
```

部署前应列出运行时允许的 Web API、CPU/内存/请求时长限制、区域一致性要求和回源方式。Node.js 专属模块、长时间计算和大文件处理应沿用适合它们的运行环境。

