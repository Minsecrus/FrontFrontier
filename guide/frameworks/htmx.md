---
title: "IV. 前端框架和库：构建现代 UI / IV.7 htmx：超媒体驱动开发"
---

# IV.7 htmx：超媒体驱动开发

**htmx** 让你用 HTML 构建交互丰富的 Web 界面，同时最大限度地减少 JavaScript 的使用。它借助 HTTP 方法和 hx-get、hx-target、hx-trigger、hx-swap 等属性，向服务器发送请求，再用返回的 HTML 片段部分更新页面。

**htmx 的哲学**是：稳定性优先，谨慎扩展核心功能，专注通用超媒体控制，并支持辅助工具。

htmx 代表着对 JavaScript 密集型前端格局的一次理念反思。它聚焦超媒体驱动开发，挑战了"复杂交互必须完全存在于客户端"这一假设，为更简单、更快速、JavaScript 开销更少的应用提供了替代方案；对特定类型的应用，还能有效缩短开发周期。

::: details 启发式示例：不用 fetch 的局部更新

```html
<button hx-get="/notifications" hx-target="#notifications" hx-swap="innerHTML">
  刷新通知
</button>

<ul id="notifications">
  <li>暂无新通知</li>
</ul>
```

服务端返回的是 HTML 片段，而不是 JSON：

```html
<li>你的申请已通过</li>
<li>有一条新的系统消息</li>
```

例子的重点是：按钮不用写 `fetch()`、不用手动解析 JSON、也不用自己操作 DOM。htmx 根据 `hx-get` 发请求，再把响应片段替换到 `hx-target` 指定的位置。

:::

