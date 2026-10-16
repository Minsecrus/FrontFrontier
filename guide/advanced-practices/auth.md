---
title: "V. 高级主题和专业开发最佳实践 / V.6 安全基础：用户认证与授权"
---

# V.6 安全基础：用户认证与授权（*）

凡是涉及个人数据或受限操作的 Web 应用，都必须在架构上严格区分两个安全边界：**认证（Authentication）** 与 **授权（Authorization）**。

- **认证（Authentication — “你是谁？”）**：校验请求发起者的真实身份（如核对密码、Passkey 签名或会话凭据）。认证失败意味着身份未确认或凭据已失效，对应 HTTP `401 Unauthorized`。
- **授权（Authorization — “你能做什么？”）**：在认证通过之后，判定当前身份是否有权访问特定资源或执行特定写操作（如普通用户只能编辑自己的文章，管理员可删除任意文章）。授权失败意味着身份已知但权限不足，对应 HTTP `403 Forbidden`。

打个比方，认证是刷身份证进入办公楼，授权则是门禁卡决定你能刷开哪几间会议室。在工程边界上，**真正的身份核验与权限裁决必须在服务端完成**；前端的路由守卫和按钮显隐仅用于提供流畅的界面引导，绝不能替代后端的接口鉴权。

## **V.6.1 主流认证模式的演进**

不同架构形态（传统多页应用、前后端分离 SPA、跨端 API 与第三方接入）对状态存储和跨域传递有不同诉求，由此衍生出几类主流认证模式：

### **1. 基于会话的认证（Session-Based Authentication）**

这是传统的有状态（Stateful）认证模式，常见于服务端直接渲染或同站部署的 Web 应用。

- **工作流程**：用户提交用户名和密码后，服务器验证用户身份，然后创建一个“会话（Session）”，并把会话信息存储在服务器内存或数据库中。服务器随后向浏览器返回一个包含唯一 Session ID 的 Cookie。后续每次请求中，浏览器都会自动携带这个 Cookie，服务器通过查询 Session ID 识别用户身份。
- **优势**：原理简单，易于实现和管理。服务器可以方便地控制和撤销用户会话。
- **劣势**：
  - **有状态与扩展性问题**：服务器需要存储所有用户的会话信息，用户量大时会消耗大量服务器资源。分布式系统要水平扩展，就必须在多台服务器之间同步会话数据，既复杂又低效。
  - **CSRF 风险**：由于认证依赖于浏览器自动发送的 Cookie，这种模式天然面临跨站请求伪造（CSRF）的攻击风险，需要额外的安全措施来防范。
  - **跨域不友好**：在前后端分离和跨域请求成为常态的今天，基于 Cookie 的会话管理会遇到诸多跨域策略的限制。

### **2. 基于 token 的认证与 BFF 模式**

为了解决会话认证的扩展性问题，无状态的（Stateless）token 认证模式应运而生。**JSON Web Token（[JWT](https://jwt.io/)）** 是其中最常见的实现标准之一。在现代 Web 应用中，认证方案通常会在短期 access token（访问令牌）、refresh token（刷新令牌）轮换（rotation，每次刷新都签发新的 refresh token 并作废旧的）、HttpOnly Cookie、SameSite、CSRF 防护和 BFF（Backend for Frontend，专为前端服务的后端层）之间组合取舍。

- **工作流程**：用户登录后，认证服务器签发短期 access token，并配套安全的刷新和撤销机制。纯 API 客户端常用 `Authorization: Bearer` 发送 token；浏览器应用则越来越多地通过 BFF 让服务端持有敏感 token，浏览器只保存合理配置了 HttpOnly、Secure、SameSite 的会话 Cookie。
- **优势**：
  - **无状态与高扩展性**：自包含的 access token 可以由资源服务器直接验签，校验请求时无需查询共享的会话存储，后端服务更容易水平扩展。refresh token、撤销列表和 BFF 会话仍需要服务端存储，因此完整方案通常是“请求校验无状态、会话管理有状态”。
  - **跨域友好与解耦**：token 可以服务于 API、移动端、第三方集成等多种客户端，但浏览器端要额外考虑 XSS、CSRF 和刷新流程。
  - **权限表达清晰**：短期 access token 适合表达作用域、受众、过期时间等访问边界。
- **劣势**：
  - **token 难以主动撤销**：自包含的 token 一旦签发，在过期前一直有效。如果 token 泄露，服务器无法像撤销 Session 一样使其立即失效，通常需要引入黑名单机制或缩短 token 有效期来缓解。
  - **安全性**：长期或高权限 token 更适合放在服务端可控、且有浏览器安全属性保护的方案中，例如 HttpOnly Cookie 或 BFF 会话。

### **3. OAuth 与 OpenID Connect（OIDC）**

如果你的应用需要让用户通过第三方服务（如 Google、GitHub、Facebook）登录，就要用到 [OAuth](https://oauth.net/) 协议。浏览器应用应优先采用 **Authorization Code + PKCE** 流程。PKCE（Proof Key for Code Exchange，授权码交换证明密钥）让客户端在换取 token 时证明自己就是发起授权的一方，防止授权码被截获后冒用。

- **OAuth（开放授权）**：它是一个**授权**框架，而非认证协议。核心目的是允许用户授权一个应用（客户端）访问自己在另一个服务（资源服务器）上的受保护资源，而无需把用户名和密码直接暴露给该应用。例如，你授权一个图片打印网站访问自己 Google Photos 里的照片。
- **OpenID Connect（[OIDC](https://openid.net/connect/)）**：它是构建在 OAuth 2.0 之上的简单**身份认证层**。OAuth 只关心“授权”，OIDC 则增加了“认证”功能。它允许客户端不仅能获得访问资源的授权，还能验证用户身份并获取基本的用户信息。“通过 Google 账号登录”“通过 Microsoft 账号登录”等功能通常基于 OIDC，客户端可以从 ID token 中验证用户身份。但并非所有第三方登录都是 OIDC：例如“通过 GitHub 登录”基于普通 OAuth 2.0，应用拿到 access token 后还要调用 GitHub 用户 API 才能确认身份。

### **4. Passkeys、WebAuthn 与 FedCM**

现代认证正在从“记住密码并处理 token”转向更强的浏览器和平台原语（primitive，指平台内置、可直接调用的基础能力）：

- **Passkeys / WebAuthn**：用设备安全能力和公钥密码学替代传统密码，降低钓鱼、撞库和弱密码风险。前端需要理解注册、登录、账户恢复和跨设备同步体验，而真正的凭据验证仍在服务端完成。
- **FedCM（Federated Credential Management）**：由浏览器统一承载联合登录（使用第三方身份提供方的账号登录）的交互流程，减少对第三方 Cookie 和隐式跨站追踪的依赖。
- **BFF 与会话边界**：对安全要求较高的业务来说，把敏感 token 留在服务端，由前端通过同源会话访问 BFF，通常比让浏览器 JavaScript 管理长期 token 更容易控制风险。

### **5. 单点登录（Single Sign-On，SSO）**
SSO 允许用户使用一套凭据（如用户名和密码），一次性登录多个相互独立的软件系统。这在企业环境中尤为常见：用户登录一次内部系统后，就可以直接访问其他关联的应用，而无需重复输入密码。SSO 通常基于 [SAML](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=security) 或 OIDC 等标准协议实现。

## **V.6.2 前端开发者的职责与考量**

- **审慎选择凭据存储介质**：将会话标识存入带 `HttpOnly`、`Secure`、`SameSite` 属性的 Cookie，可防止 XSS 脚本直接读取凭据，但写接口必须配套 CSRF 防护；若将长期 token 存入 `localStorage`，一旦页面存在任一 XSS 漏洞（含第三方脚本被攻破），攻击者即可直接盗取完整令牌。
- **同步全局认证状态**：在应用状态层（如 React Context、Pinia/Zustand 或请求缓存层）统一维护当前用户资料与权限列表，并处理多标签页之间的登出状态同步（如通过 `BroadcastChannel` 或 `storage` 事件）。
- **实现私有路由守卫与加载态**：在路由切换前拦截未认证访问，跳转到登录页并记录原始目标地址（`redirect` 参数，需校验为站内相对路径以防开放重定向漏洞），登录成功后跳回原页面。
- **处理并发请求的静默刷新**：短期 access token 过期触发刷新时，需在请求拦截器中加锁并挂起同期的其他并发请求，待新 token 换取成功后再统一重放，避免多个并发请求同时携带旧 refresh token 触发服务端的重放告警（token rotation 失效）。
- **接入无密码认证体验**：在支持 Passkeys 的业务中，完整处理 WebAuthn 注册、条件式自动填充登录（Conditional UI）、跨设备扫码与降级恢复流程。
- **区分 `401` 与 `403` 的恢复路径**：遇到 `401 Unauthorized` 时尝试静默刷新或清理本地状态后引导重新登录；遇到 `403 Forbidden` 时保持当前登录态，向用户展示明确的权限不足提示，避免陷入“重定向到登录页—已登录又跳回—再次 403”的死循环。

<BadGoodExample bad-title="把前端状态当成权限证明" good-title="前端表达体验，服务端执行授权" vertical>
<template #bad>

```ts
const role = localStorage.getItem("role");

if (role === "admin") {
  showDeleteButton();
}

// 问题：role 可被用户随意改写；如果服务端只校验登录态、不校验权限，
// 任何登录用户直接调用这个接口就能越权删除。
async function deleteUser(userId: string) {
  await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
}
```

</template>
<template #good>

```ts
// 浏览器：通过同源 BFF 会话恢复 UI，
// 敏感 token 不需要暴露给页面 JavaScript。
const sessionResponse = await fetch("/bff/session", {
  credentials: "same-origin",
});

const session = sessionResponse.ok
  ? await sessionResponse.json()
  : null;

if (session?.permissions.includes("users:delete")) {
  showDeleteButton();
}

// 服务端：每个受保护操作都重新认证并授权。
export async function DELETE(request: Request) {
  const session = await requireSessionFromCookie(request);

  if (!session.permissions.includes("users:delete")) {
    return Response.json(
      { message: "Forbidden" },
      { status: 403 },
    );
  }

  await deleteRequestedUser(request);
  return new Response(null, { status: 204 });
}
```

</template>
</BadGoodExample>

在 BFF 模式中，服务端应为会话 Cookie 设置合理的 `HttpOnly`、`Secure`、`SameSite` 等属性，并配套 CSRF 防护、轮换和撤销策略。前端路由守卫和按钮显隐用于改善体验，服务端则对每次请求执行授权。客户端还应区分 401（需要恢复或重新登录）与 403（身份有效但无权操作）。
