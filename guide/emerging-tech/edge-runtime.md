---
title: "VI. 新兴技术和专业领域 / VI.8 边缘计算：Cloudflare Workers、Vercel Edge Runtime、Deno Deploy"
---

# VI.8 边缘计算：Cloudflare Workers、Vercel Edge Runtime、Deno Deploy

**目的**：在更靠近用户的地方（网络“边缘”）运行无服务器函数，以减少延迟并提高性能。

- [**Cloudflare Workers**](https://workers.cloudflare.com/)：在 Cloudflare 全球网络上运行的无服务器函数，提供低延迟。
- [**Vercel Edge Runtime / Functions**](https://vercel.com/docs/functions/runtimes/edge)：Vercel 提供的边缘运行时能力，适合低延迟响应、流式输出和贴近前端框架的部署体验。需要注意的是，Vercel 官方已将独立 Edge Runtime 标注为 deprecated，使用时应关注其最新迁移建议，而不要把它当作默认长期选项。
- [**Deno Deploy**](https://deno.com/deploy)：基于 Deno Runtime 的全球部署平台。学习时要区分当前平台与历史上的 **Deploy Classic**，后者已经成为历史文档/迁移语境，不应再与当前平台混为一谈。

**边缘计算**是对传统中心化服务器架构局限性的直接回应，尤其对全球应用而言。通过将计算移到更靠近用户的位置，它有效减少了延迟（TTFB、E2E 延迟）并提升了感知性能，这对现代 Web 体验至关重要。

“边缘”更强调**任务匹配**：

- 适合边缘的任务：鉴权、重写/重定向、轻量 API、A/B 实验、地理位置感知、流式响应、缓存编排
- 不适合边缘的任务：重 CPU 计算、强 Node.js 依赖、大型二进制处理、需要完整长连接生态的服务

也就是说，边缘不是默认最优，而是针对特定负载的部署策略。

## **表格：边缘计算平台比较**

| 平台名称                                                                 | 提供商     | 运行时/模型                   | 适合场景                                 | 优势                                                | 需要注意的点                                  |
| :------------------------------------------------------------------------ | :--------- | :---------------------------- | :--------------------------------------- | :-------------------------------------------------- | :-------------------------------------------- |
| [**Cloudflare Workers**](https://workers.cloudflare.com/)                | Cloudflare | Workers Runtime / Isolates    | 全球低延迟 API、缓存编排、边缘逻辑       | 全球网络强、边缘生态完整、与 D1/R2/KV 配套紧密      | 运行时约束与传统 Node.js 服务不同             |
| [**Vercel Edge Runtime / Functions**](https://vercel.com/docs/functions/runtimes/edge) | Vercel     | Edge Runtime                  | 与前端框架紧密结合的流式输出和边缘逻辑   | 与 Next.js 等框架集成自然，部署体验顺滑             | 独立 Edge Runtime 已被官方标注为 deprecated |
| [**Deno Deploy**](https://deno.com/deploy)                               | Deno       | Deno Runtime                  | TypeScript 优先的全球部署与托管          | Deno 原生体验、TS 友好、Web 标准取向明确            | 要区分当前平台与已经退出历史舞台的 Classic   |

这个表格帮助学习者理解边缘计算的格局，这是高性能全球应用程序的关键部署策略。它突出了不同提供商如何利用分布式基础设施来最小化延迟和增强可扩展性。

