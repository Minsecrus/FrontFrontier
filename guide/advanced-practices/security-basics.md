---
title: "V. 高级主题和专业开发最佳实践 / V.5 安全基础：保护前端应用程序"
---

# V.5 安全基础：保护前端应用程序（*）

浏览器运行在用户完全可控的终端环境中：任何客户端校验都可以被绕过，拼接进 DOM 的不可信字符串可能变成恶意脚本，第三方 CDN 脚本与 npm 依赖可能被篡改，浏览器自动携带的 Cookie 也可能被跨站请求借用。前端安全的核心任务，是在明确“客户端只负责体验与输入约束、服务端负责最终权限与数据校验”的前提下，利用现代浏览器原生安全策略建立纵深防御。

对照 **OWASP Top 10** 风险分类（新版更强调访问控制失效、软件供应链故障、安全配置错误与可观测性缺失等系统性风险），前端侧最直接暴露的攻击面包括：

- **跨站脚本（XSS）**：攻击者将恶意脚本注入页面并在用户浏览器中执行，窃取会话或伪造操作。核心防线是对输入做校验与净化（sanitize），对输出按上下文转义，并配合 CSP 与 Trusted Types 限制脚本执行。
- **跨站请求伪造（CSRF）**：诱导已登录用户在不知情时从第三方站点发起带 Cookie 的跨站写请求。核心防线是配置 `SameSite` Cookie、校验 CSRF token 以及核对 `Origin` / `Referer` 与 Fetch Metadata。
- **其他关联风险**：拒绝服务（DoS）攻击、依赖供应链投毒、不安全第三方库、过度开放的浏览器硬件权限、缺乏子资源完整性校验（SRI）以及安全日志与监控缺失。

针对上述威胁，现代 Web 应用依赖一套由 HTTP 响应头、浏览器运行时原语与工程规范组成的纵深缓解策略：

- **内容安全策略（CSP）**：通过 `Content-Security-Policy` 响应头声明允许加载和执行的脚本、样式与连接源，收敛 XSS 攻击面。
- **CSP Report-Only**：先通过 `Content-Security-Policy-Report-Only` 仅上报违规而不拦截，排查存量内联脚本与第三方代码后再切换为强制阻断，适合存量项目平滑迁移。
- **Trusted Types**：通过浏览器原生约束，强制要求 `innerHTML`、`eval` 等危险 DOM sink（注入点，指会把字符串当作 HTML 或代码解析执行的 API）只能接收经过策略净化的可信类型对象，从根源阻断 DOM 型 XSS。
- **跨域资源共享（[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)）**：基于 HTTP 头的受控放宽机制，由服务端显式声明允许哪些源的前端脚本读取响应内容。注意 CORS 仅拦截浏览器端读取响应，不能阻止请求到达服务器，接口写操作仍须由服务端鉴权保护。
- **Fetch Metadata**：利用浏览器自动附带的 `Sec-Fetch-*` 请求头识别请求来源、模式和目标上下文，在服务端直接拒绝异常的跨站请求。
- **子资源完整性（[SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)）**：通过 `<script integrity="sha384-...">` 让浏览器用加密哈希比对从第三方 CDN 拉取的文件，一旦内容被篡改即拒绝执行。
- **权限策略（Permissions-Policy）**：按源限制摄像头、麦克风、地理位置、USB 等敏感平台 API 的调用权限，防止页面或嵌入的第三方 `<iframe>` 越权滥用硬件能力。
- **Cookie 安全属性**：为会话 Cookie 严格配置 `HttpOnly`、`Secure`、`SameSite` 以及最小化的 `Path` / `Domain`，并在合法跨站嵌入需要独立状态时采用 CHIPS（`Partitioned` Cookie）。
- **供应链治理**：锁定依赖版本、在代码评审中审查锁文件（lockfile）、接入 SCA（Software Composition Analysis，软件成分分析）漏洞扫描、校验包发布来源证明（provenance）并禁用非必要的依赖安装脚本（install scripts）。
- **防御性编程**：审慎处理客户端存储（不在 `localStorage` 中存放高敏凭据），在使用 `window.postMessage` 跨窗口通信时严格双向校验 `origin` 与消息结构。

## **V.5.1 XSS 防护：从转义到 CSP 与 Trusted Types**

XSS 的本质是让不可信数据进入可执行上下文。传统做法强调输入校验和输出转义；现代浏览器还提供了更强的运行时防线。

- **上下文感知输出**：HTML、属性、URL、CSS、JavaScript 字符串各有不同转义规则。模板引擎和框架通常会默认转义文本插值，但 `v-html`、`dangerouslySetInnerHTML`、`innerHTML` 这类能力需要额外审查。
- **优先使用安全 DOM API**：写文本时使用 `textContent`；构建节点时使用 `createElement()`、`setAttribute()`、`append()`；处理富文本时使用经过审计的 HTML 净化库（如 DOMPurify）。
- **严格 CSP**：比起只维护域名白名单，更推荐基于 nonce 或 hash 的 `script-src`，并配合 `object-src 'none'`、`base-uri 'none'` 等约束。严格 CSP 是纵深防御，应与 XSS 根因修复一起使用。
- **CSP Report-Only 迁移**：已有项目可以先部署 `Content-Security-Policy-Report-Only` 收集违规报告，分析 inline script、第三方脚本和动态执行代码，再逐步切换到强制策略。
- **Trusted Types**：适合大型前端应用治理 DOM XSS。启用后，危险 DOM sink 需要接收 `TrustedHTML`、`TrustedScript` 或 `TrustedScriptURL` 等可信类型，团队可以把安全处理逻辑收敛到少数策略中。

<BadGoodExample bad-title="把不可信数据拼进 HTML" good-title="按文本和节点处理数据">
<template #bad>

```js
function renderProduct(product) {
  results.innerHTML = `
    <li class="product">
      <strong>${product.name}</strong>
      <span>${product.description}</span>
    </li>
  `;
}
```

</template>
<template #good>

```js
function renderProduct(product) {
  const item = document.createElement("li");
  const name = document.createElement("strong");
  const description = document.createElement("span");

  item.className = "product";
  name.textContent = product.name;
  description.textContent = product.description;
  item.append(name, description);

  results.replaceChildren(item);
}
```

</template>
</BadGoodExample>

这里的边界是“这份数据是否应该被解释为 HTML”。普通名称、评论和描述应作为文本处理；确实需要保留格式的富文本，应使用经过审计且配置明确的净化库，并结合 CSP 等纵深防御。不要用正则表达式自行净化 HTML，应交给经过审计的解析与净化方案。

配置示例：

```http
Content-Security-Policy-Report-Only: script-src 'nonce-{RANDOM}' 'strict-dynamic'; object-src 'none'; base-uri 'none'; report-to csp-endpoint
```

```http
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types default dompurify
```

实际部署时，服务端需要为每次响应生成 nonce；静态页面可以考虑 hash；报告端点需要配合 `Reporting-Endpoints` 或兼容的报告机制配置。

## **V.5.2 CSRF、Cookie 与请求边界**

CSRF 的关键在于浏览器会自动携带 Cookie。当前常见防线是组合使用 SameSite Cookie、CSRF token、Origin / Referer 校验和服务端权限判断。

- **SameSite**：`Lax` 适合多数普通会话，能覆盖常见跨站表单提交风险；`Strict` 更保守，可能影响跨站跳转后的登录体验；`None` 用于确实需要跨站发送 Cookie 的场景，并且必须配合 `Secure`。
- **HttpOnly**：让 JavaScript 读不到 Cookie，降低 XSS 窃取会话标识的风险。
- **Secure**：只通过 HTTPS 发送 Cookie。
- **Domain / Path**：控制 Cookie 发送范围。范围越宽，暴露面越大。
- **Partitioned Cookie / CHIPS（Cookies Having Independent Partitioned State）**：适合第三方嵌入场景中的分区状态。`Partitioned` 会按顶级站点隔离 Cookie，必须同时设置 `Secure`，并建议使用 `__Host-` 前缀（见 [MDN：Partitioned cookies](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies/Partitioned_cookies)）。
- **CSRF token**：对高风险写操作，服务端签发并校验不可预测 token，前端随表单或请求头提交。

配置示例：

```http
Set-Cookie: __Host-session=...; Path=/; Secure; HttpOnly; SameSite=Lax
```

```http
Set-Cookie: __Host-widget=...; Path=/; Secure; SameSite=None; Partitioned
```

Cookie 安全涉及前端配置与服务端责任。前端需要理解属性含义、调试发送范围、处理登录态体验；服务端需要负责签发、校验、轮换、撤销和权限判断。

## **V.5.3 Fetch Metadata 与资源隔离**

Fetch Metadata 请求头（如 `Sec-Fetch-Site`、`Sec-Fetch-Mode`、`Sec-Fetch-Dest`、`Sec-Fetch-User`）让服务端能判断请求是同源、同站、跨站，还是导航、图片、脚本、fetch 等不同模式。它适合在服务端实现资源隔离策略。

常见思路包括：

- 对状态修改接口，拒绝不可信的跨站请求。
- 对只应由页面内部调用的 JSON API，限制跨站 `no-cors` 或异常模式请求。
- 对静态资源、公开图片和嵌入资源，按业务需要放宽。
- 对登录、OAuth 回调、Webhook、公开嵌入组件等特殊路径做白名单或单独策略。

Fetch Metadata 和 CORS 解决的问题不同。CORS 主要决定浏览器是否允许前端读取跨域响应；Fetch Metadata 更偏服务端根据请求上下文主动拒绝不合理请求。两者可以一起使用。

## **V.5.4 跨源隔离与嵌入边界**

复杂应用还需要理解几个容易混淆的响应头：

- **CORP（Cross-Origin-Resource-Policy）**：声明资源是否允许其他源加载。
- **COOP（Cross-Origin-Opener-Policy）**：隔离浏览上下文组，减少跨窗口引用带来的风险。
- **COEP（Cross-Origin-Embedder-Policy）**：要求页面加载的跨源资源显式允许被嵌入。

COOP + COEP 可以让页面进入 cross-origin isolated 状态，部分敏感 API（例如 SharedArrayBuffer）依赖这种隔离环境。采用时，需要逐个检查第三方脚本、图片、字体、worker 和 iframe 是否支持必要的 CORS 或 CORP 配置。

## **V.5.5 前端安全检查清单**

| 领域 | 检查点 |
| :--- | :--- |
| XSS | 文本默认转义、富文本经过净化、减少 `innerHTML`、部署 CSP、逐步引入 Trusted Types |
| CSRF | SameSite Cookie、CSRF token、Origin / Referer 校验、高风险操作二次确认或重放保护 |
| Cookie | `HttpOnly`、`Secure`、`SameSite`、合理 `Domain` / `Path`、第三方嵌入场景评估 `Partitioned` |
| 跨域 | CORS 白名单精确、区分读取权限和资源加载、让 `Access-Control-Allow-Origin` 保持明确边界 |
| 资源加载 | CDN 脚本使用 SRI、第三方脚本有加载边界和降级策略 |
| 浏览器能力 | 使用 Permissions-Policy 限制摄像头、麦克风、地理位置、USB、传感器等能力 |
| 请求隔离 | 使用 Fetch Metadata 在服务端拒绝异常跨站请求 |
| 依赖供应链 | 锁文件审查、依赖扫描、限制 install script、关注包来源与发布证明 |
| 日志与监控 | 收集 CSP 违规、前端错误、安全相关接口异常、并建立告警和复盘流程 |

下表对照归纳了常见前端安全风险的攻击机理与关键缓解策略：

| 风险类型                                                                                                  | 描述                                       | 缓解策略（示例）                                                                                                          |
| :-------------------------------------------------------------------------------------------------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **跨站脚本（XSS）**                                                                                        | 注入恶意脚本、在用户浏览器执行             | 上下文转义、安全 DOM API、CSP、Trusted Types、富文本净化                                                           |
| **跨站请求伪造（CSRF）**                                                                                   | 欺骗用户执行非预期操作                     | SameSite Cookie、CSRF token、Origin / Referer 校验、Fetch Metadata                                                     |
| **供应链失败**                                                                                             | 恶意包、被劫持依赖、未审查的安装脚本       | 锁定依赖、审查锁文件、使用 SCA、来源证明和可信发布、限制依赖构建脚本                                                     |
| **不安全第三方库**                                                                                        | 引入漏洞或恶意代码                         | 审计和扫描第三方库、使用 [SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) 校验 CDN 资源 |
| **拒绝服务（DoS）**                                                                                        | 通过大量请求使服务不可用                   | 速率限制、使用 CDN/WAF 过滤恶意流量                                                                                       |
| **不受限制的权限策略**                                                                                    | 恶意网站滥用浏览器 API（如摄像头、麦克风） | 使用 Permissions-Policy 限制功能访问                                                                                      |
| **缺乏子资源完整性（[SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)）** | CDN 资源被篡改、加载恶意代码               | 对 CDN 资源使用 integrity 属性和加密哈希                                                                                  |
| **跨站资源滥用**                                                                                          | 跨站请求调用内部接口或加载敏感资源         | Fetch Metadata 资源隔离、CORP / COOP / COEP、精确 CORS 策略                                                              |
| **Cookie 配置不当**                                                                                       | 会话标识暴露、跨站发送范围过宽             | `HttpOnly`、`Secure`、`SameSite`、`__Host-` 前缀、必要时使用 `Partitioned`                                                |
| **客户端数据验证不足**                                                                                    | 恶意用户绕过客户端验证发送无效数据         | 始终在服务端验证数据、客户端验证仅用于提升 UX                                                                           |