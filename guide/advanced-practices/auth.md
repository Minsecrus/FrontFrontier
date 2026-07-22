---
title: "V. 高级主题和专业开发最佳实践 / V.6 安全基础：用户认证与授权"
---

# V.6 安全基础：用户认证与授权

在构建任何需要区分用户身份、提供个性化内容或保护私有数据的 Web 应用时，我们都必须面对两个既相关又不同的核心安全概念：**认证 (Authentication)** 和 **授权 (Authorization)**。这两个概念是构建可信、安全网络服务的基石，但常常被混淆。

- **认证 (Authentication - “你是谁？”)**：核心目标是**验证用户的身份**。它回答的是“你真的是你所声称的那个人吗？”这个问题。最常见的例子就是通过用户名和密码登录。系统成功验证你的凭据后，便确认了你的身份。

- **授权 (Authorization - “你能做什么？”)**：授权发生在认证成功之后。核心目标是**判断通过认证的用户拥有哪些权限**，可以访问哪些资源或执行哪些操作。它回答的是“你被允许做什么？”这个问题。例如，普通用户可以查看自己的帖子，管理员则可以删除任何人的帖子。

简而言之，认证是出示你的身份证进入大楼，而授权是决定你的门禁卡可以打开哪些房间的门。对前端开发者而言，虽然大部分核心安全逻辑在后端处理，但理解这些认证与授权模式的演进、原理和交互流程，对构建安全、流畅的前端用户体验至关重要。

## **V.6.1 主流认证模式的演进**

随着 Web 应用从简单的静态页面向复杂的单页应用 (SPA) 和分布式系统演进，用户认证模式也经历了数次重要的范式转变。

### **1. 基于会话的认证 (Session-Based Authentication)**

这是传统的、有状态的 (Stateful) 认证模式，常见于早期的服务器端渲染框架（如 JSP, PHP, Ruby on Rails）。

- **工作流程**：用户提交用户名和密码后，服务器验证用户身份，然后创建一个“会话 (Session)”，并把会话信息存储在服务器内存或数据库中。服务器随后向浏览器返回一个包含唯一 Session ID 的 Cookie。后续每次请求中，浏览器都会自动携带这个 Cookie，服务器通过查询 Session ID 识别用户身份。
- **优势**：原理简单，易于实现和管理。服务器可以方便地控制和撤销用户会话。
- **劣势**：
  - **有状态与扩展性问题**：服务器需要存储所有用户的会话信息，用户量大时会消耗大量服务器资源。分布式系统要水平扩展，就必须在多台服务器之间同步会话数据，既复杂又低效。
  - **CSRF 风险**：由于认证依赖于浏览器自动发送的 Cookie，这种模式天然面临跨站请求伪造 (CSRF) 的攻击风险，需要额外的安全措施来防范。
  - **跨域不友好**：在前后端分离和跨域请求成为常态的今天，基于 Cookie 的会话管理会遇到诸多跨域策略的限制。

### **2. 基于 Token 的认证与 BFF 模式**

为了解决会话认证的扩展性问题，无状态的 (Stateless) Token 认证模式应运而生。**JSON Web Token ([JWT](https://jwt.io/))** 是其中最常见的实现标准之一。在现代 Web 应用中，认证方案通常会在短期 access token、refresh token rotation、HttpOnly Cookie、SameSite、CSRF 防护和 BFF (Backend for Frontend) 之间组合取舍。

- **工作流程**：用户登录后，认证服务器签发短期 access token，并通过安全通道完成刷新和撤销策略。纯 API 客户端常用 `Authorization: Bearer` 发送 token；浏览器应用则越来越多地通过 BFF 让服务端持有敏感 token，浏览器只保存合理配置了 HttpOnly、Secure、SameSite 的会话 Cookie。
- **优势**：
  - **无状态与高扩展性**：服务器无需存储任何会话信息，每次请求都是自包含的。这使得后端服务可以轻松水平扩展，极大地提升了系统的可伸缩性。
  - **跨域友好与解耦**：Token 可以服务于 API、移动端、第三方集成等多种客户端，但浏览器端要额外考虑 XSS、CSRF 和刷新流程。
  - **权限表达清晰**：短期 access token 适合表达作用域、受众、过期时间等访问边界。
- **劣势**：
  - **Token 无法主动撤销**：Token 一旦签发，在过期前一直有效。如果 Token 泄露，服务器无法像撤销 Session 一样使其立即失效。通常需要引入黑名单机制或缩短 Token 有效期来缓解这一问题。
  - **安全性**：长期或高权限 Token 更适合放在服务端可控、且有浏览器安全属性保护的方案中，例如 HttpOnly Cookie 或 BFF 会话。

### **3. OAuth & OpenID Connect (OIDC)**

如果你的应用需要让用户通过第三方服务（如 Google, GitHub, Facebook）登录，[OAuth](https://oauth.net/) 协议就派上了用场。浏览器应用应优先理解 **Authorization Code + PKCE** 流程。

- **OAuth (开放授权)**：它是一个**授权**框架，而非认证协议。核心目的是允许用户授权一个应用（客户端）访问自己在另一个服务（资源服务器）上的受保护资源，而无需把用户名和密码直接暴露给该应用。例如，你授权一个图片打印网站访问自己 Google Photos 里的照片。
- **OpenID Connect ([OIDC](https://openid.net/connect/))**：它是构建在 OAuth 2.0 之上的简单**身份认证层**。OAuth 只关心“授权”，OIDC 则增加了“认证”功能。它允许客户端不仅能获得访问资源的授权，还能验证用户身份并获取基本的用户信息。我们日常使用的“通过 Google/GitHub 登录”功能，实际上就是 OIDC 的应用。

### **4. Passkeys、WebAuthn 与 FedCM**

现代认证正在从“记住密码并处理 Token”转向更强的浏览器和平台原语：

- **Passkeys / WebAuthn**：用设备安全能力和公钥密码学替代传统密码，降低钓鱼、撞库和弱密码风险。前端需要理解注册、登录、账户恢复和跨设备同步体验，而真正的凭据验证仍在服务端完成。
- **FedCM (Federated Credential Management)**：为联合登录提供更受浏览器约束的身份交互模型，减少对第三方 Cookie 和隐式跨站追踪的依赖。
- **BFF 与会话边界**：对安全要求较高的业务来说，把敏感 token 留在服务端，由前端通过同源会话访问 BFF，通常比让浏览器 JavaScript 管理长期 token 更容易控制风险。

### **5. Single Sign-On (SSO)**
SSO 允许用户使用一套凭据（如用户名和密码），一次性登录多个相互独立的软件系统。在企业环境中尤为常见，用户登录一次内部系统后，就可以无缝访问所有其他关联的应用，而无需重复输入密码。SSO 通常基于 [SAML](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=security) 或 OIDC 等标准协议实现。

## **V.6.2 前端开发者的职责与考量**

- **安全地存储凭据**：理解不同存储方式的优劣。把会话标识放在合理配置了 `HttpOnly`、`Secure`、`SameSite` 的 Cookie 中，可以有效降低 XSS 窃取风险，但需要配合 CSRF 防护；把长期 token 放进 Local Storage 则要承担更高的 XSS 后果。
- **管理认证状态**：前端应用中（如使用 React Context 或 Redux/Pinia），需要全局管理用户的登录状态、用户信息和 token 状态。
- **实现路由保护**：通过路由守卫或高阶组件，实现需要登录才能访问的私有路由，并在用户未登录时自动重定向到登录页面。
- **处理 Token 刷新**：为了安全，access token 的有效期通常较短。前端需要实现一套无感知的 token 刷新机制，在 access token 过期时自动获取新的 token，保持用户操作连续。
- **支持无密码体验**：在适合的业务里，前端应提供 passkey 注册、登录、设备切换和恢复流程，并明确向用户解释安全边界。
- **优雅地处理认证错误**：API 返回认证失败（如 401 Unauthorized）时，前端应能优雅处理，例如清除本地凭据、重定向到登录页并提示用户。

<BadGoodExample bad-title="把前端状态当成权限证明" good-title="前端表达体验，服务端执行授权" vertical>
<template #bad>

```ts
const role = localStorage.getItem("role");

if (role === "admin") {
  showDeleteButton();
}

// 接口权限由服务端鉴权与授权策略保护。
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

理解这些认证与授权模式，不仅仅是后端工程师的职责。前端开发者作为用户体验的直接塑造者和数据交互的实现者，必须深刻理解这些模式在整个系统架构中的运作方式和安全影响，才能构建出既安全可靠又用户友好的现代 Web 应用。

