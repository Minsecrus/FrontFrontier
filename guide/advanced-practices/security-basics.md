---
title: "V. 高级主题和专业开发最佳实践 / V.5 安全基础：保护前端应用程序"
---

# V.5 安全基础：保护前端应用程序

**目的**：保护 Web 应用程序免受恶意攻击，保护用户数据并维护系统完整性。

- **OWASP Top 10 相关漏洞**：最关键的 Web 应用程序安全风险列表。新版分类更强调访问控制、供应链、错误配置、可观测性不足和不安全设计等系统性风险。
  - **跨站脚本 (XSS)**：向 Web 应用程序注入恶意代码，在客户端执行。缓解措施：适当的输入净化和输出过滤。
  - **跨站请求伪造 (CSRF)**：欺骗用户提交非预期表单。缓解措施：使用反 CSRF 令牌。
  - **其他风险**：DoS 攻击、供应链失败、不安全第三方库、不受限制的权限策略、缺乏子资源完整性、日志与监控不足。
- **缓解策略**：
  - **内容安全策略 (CSP)**：一个 HTTP 头，控制浏览器允许加载哪些资源，从而防止 XSS 攻击。
  - **CSP Report-Only**：先用报告模式收集违规信息，修复问题后再切换到强制模式，适合渐进迁移已有项目。
  - **Trusted Types**：通过浏览器原生约束，让 `innerHTML`、`eval` 等危险 DOM sink 只能接收经过策略处理的可信值，降低 DOM XSS 风险。
  - **跨域资源共享 ([CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS))**：一种基于 HTTP 头的机制，允许服务器指示哪些源被允许跨域加载资源，从而防止未经授权的访问。
  - **Fetch Metadata**：利用 `Sec-Fetch-*` 请求头识别请求来源、模式和目标，在服务端实现资源隔离策略，抵御常见跨站请求。
  - **子资源完整性 ([SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity))**：一项安全功能，允许浏览器使用加密哈希验证从第三方主机（例如 CDN）获取的文件是否未被意外篡改。
  - **权限策略 (Permissions-Policy)**：限制摄像头、麦克风、地理位置、USB 等敏感浏览器能力的使用范围，降低第三方内容或嵌入页面滥用平台 API 的风险。
  - **Cookie 安全属性**：为会话 Cookie 配置 `HttpOnly`、`Secure`、`SameSite`、合理的 `Path` / `Domain`，并在需要第三方嵌入状态隔离时理解 CHIPS / `Partitioned` Cookie。
  - **供应链治理**：锁定依赖版本、审查锁文件 (lockfile)、启用 SCA 扫描、使用可信发布和来源证明 (provenance)、限制依赖安装脚本，降低恶意包和被劫持发布流程带来的风险。
  - **防御性编程**：编写不易受意外输入或操作导致错误的健壮代码，包括安全 Web 存储/消息传递和适当的事件处理。

前端安全是一个持续的过程，需要多层防御策略。客户端验证主要改善用户体验，真正的数据约束和权限判断仍应在服务端完成。CSP、Trusted Types、Fetch Metadata、CORS、SRI、Permissions-Policy 和 Cookie 安全属性的组合，代表了现代 Web 更依赖浏览器原生安全机制的趋势。

## **V.5.1 XSS 防护：从转义到 CSP 与 Trusted Types**

XSS 的本质是让不可信数据进入可执行上下文。传统做法强调输入校验和输出转义；现代浏览器还提供了更强的运行时防线。

- **上下文感知输出**：HTML、属性、URL、CSS、JavaScript 字符串各有不同转义规则。模板引擎和框架通常会默认转义文本插值，但 `v-html`、`dangerouslySetInnerHTML`、`innerHTML` 这类能力需要额外审查。
- **优先使用安全 DOM API**：写文本时使用 `textContent`；构建节点时使用 `createElement()`、`setAttribute()`、`append()`；处理富文本时使用经过审计的 sanitizer。
- **严格 CSP**：比起只维护域名白名单，更推荐基于 nonce 或 hash 的 `script-src`，并配合 `object-src 'none'`、`base-uri 'none'` 等约束。严格 CSP 是纵深防御，应与 XSS 根因修复一起使用。
- **CSP Report-Only 迁移**：已有项目可以先部署 `Content-Security-Policy-Report-Only` 收集违规报告，分析 inline script、第三方脚本和动态执行代码，再逐步切换到强制策略。
- **Trusted Types**：适合大型前端应用治理 DOM XSS。启用后，危险 DOM sink 需要接收 `TrustedHTML`、`TrustedScript` 或 `TrustedScriptURL` 等可信类型，团队可以把安全处理逻辑收敛到少数策略中。

示例方向：

```http
Content-Security-Policy-Report-Only: script-src 'nonce-{RANDOM}' 'strict-dynamic'; object-src 'none'; base-uri 'none'; report-to csp-endpoint
```

```http
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types default dompurify
```

实际部署时，nonce 需要由服务端为每次响应生成；静态页面可以考虑 hash；报告端点需要配合 `Reporting-Endpoints` 或兼容的报告机制配置。

## **V.5.2 CSRF、Cookie 与请求边界**

CSRF 的关键在于浏览器会自动携带 Cookie。当前常见防线是组合使用 SameSite Cookie、CSRF token、Origin / Referer 校验和服务端权限判断。

- **SameSite**：`Lax` 适合多数普通会话，能覆盖常见跨站表单提交风险；`Strict` 更保守，可能影响跨站跳转后的登录体验；`None` 用于确实需要跨站发送 Cookie 的场景，并且必须配合 `Secure`。
- **HttpOnly**：让 JavaScript 读不到 Cookie，降低 XSS 窃取会话标识的风险。
- **Secure**：只通过 HTTPS 发送 Cookie。
- **Domain / Path**：控制 Cookie 发送范围。范围越宽，暴露面越大。
- **Partitioned Cookie / CHIPS**：适合第三方嵌入场景中的分区状态。`Partitioned` 会按顶级站点隔离 Cookie，通常需要与 `Secure` 一起设置。
- **CSRF token**：对高风险写操作，服务端签发并校验不可预测 token，前端随表单或请求头提交。

示例方向：

```http
Set-Cookie: __Host-session=...; Path=/; Secure; HttpOnly; SameSite=Lax
```

```http
Set-Cookie: __Host-widget=...; Path=/; Secure; SameSite=None; Partitioned
```

Cookie 安全不只是前端配置问题。前端需要理解属性含义、调试发送范围、处理登录态体验；服务端需要负责签发、校验、轮换、撤销和权限判断。

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

- **CORP (Cross-Origin-Resource-Policy)**：声明资源是否允许被其他源加载。
- **COOP (Cross-Origin-Opener-Policy)**：隔离浏览上下文组，减少跨窗口引用带来的风险。
- **COEP (Cross-Origin-Embedder-Policy)**：要求页面加载的跨源资源显式允许被嵌入。

COOP + COEP 可以让页面进入 cross-origin isolated 状态，某些高能力 API（例如 SharedArrayBuffer）会依赖这种隔离环境。采用它们时，需要逐个检查第三方脚本、图片、字体、worker 和 iframe 是否支持必要的 CORS 或 CORP 配置。

## **V.5.5 前端安全检查清单**

| 领域 | 检查点 |
| :--- | :--- |
| XSS | 文本默认转义，富文本经过 sanitizer，减少 `innerHTML`，部署 CSP，逐步引入 Trusted Types |
| CSRF | SameSite Cookie、CSRF token、Origin / Referer 校验、高风险操作二次确认或重放保护 |
| Cookie | `HttpOnly`、`Secure`、`SameSite`、合理 `Domain` / `Path`，第三方嵌入场景评估 `Partitioned` |
| 跨域 | CORS 白名单精确，区分读取权限和资源加载，让 `Access-Control-Allow-Origin` 保持明确边界 |
| 资源加载 | CDN 脚本使用 SRI，第三方脚本有加载边界和降级策略 |
| 浏览器能力 | 使用 Permissions-Policy 限制摄像头、麦克风、地理位置、USB、传感器等能力 |
| 请求隔离 | 使用 Fetch Metadata 在服务端拒绝异常跨站请求 |
| 依赖供应链 | 锁文件审查、依赖扫描、限制 install script、关注包来源与发布证明 |
| 日志与监控 | 收集 CSP 违规、前端错误、安全相关接口异常，并建立告警和复盘流程 |

## **表格：常见前端安全风险及缓解策略**

| 风险类型                                                                                                  | 描述                                       | 缓解策略（示例）                                                                                                          |
| :-------------------------------------------------------------------------------------------------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **跨站脚本 (XSS)**                                                                                        | 注入恶意脚本，在用户浏览器执行             | 上下文转义，安全 DOM API，CSP，Trusted Types，富文本 sanitizer                                                           |
| **跨站请求伪造 (CSRF)**                                                                                   | 欺骗用户执行非预期操作                     | SameSite Cookie，反 CSRF 令牌，Origin / Referer 校验，Fetch Metadata                                                     |
| **供应链失败**                                                                                             | 恶意包、被劫持依赖、未审查的安装脚本       | 锁定依赖，审查锁文件，使用 SCA、来源证明和可信发布，限制依赖构建脚本                                                     |
| **不安全第三方库**                                                                                        | 引入漏洞或恶意代码                         | 审计和扫描第三方库，使用 [SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) 校验 CDN 资源 |
| **拒绝服务 (DoS)**                                                                                        | 通过大量请求使服务不可用                   | 速率限制，使用 CDN/WAF 过滤恶意流量                                                                                       |
| **不受限制的权限策略**                                                                                    | 恶意网站滥用浏览器 API（如摄像头、麦克风） | 使用 Permissions-Policy 限制功能访问                                                                                      |
| **缺乏子资源完整性 ([SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity))** | CDN 资源被篡改，加载恶意代码               | 对 CDN 资源使用 integrity 属性和加密哈希                                                                                  |
| **跨站资源滥用**                                                                                          | 跨站请求调用内部接口或加载敏感资源         | Fetch Metadata 资源隔离，CORP / COOP / COEP，精确 CORS 策略                                                              |
| **Cookie 配置不当**                                                                                       | 会话标识暴露、跨站发送范围过宽             | `HttpOnly`、`Secure`、`SameSite`、`__Host-` 前缀、必要时使用 `Partitioned`                                                |
| **客户端数据验证不足**                                                                                    | 恶意用户绕过客户端验证发送无效数据         | 始终在服务器端进行数据验证，客户端验证仅用于 UX 提升                                                                      |

这个表格提供了常见前端漏洞及其解决方案的实用指南。它帮助学习者理解具体的威胁以及如何实施对策，这对于构建安全可靠的 Web 应用程序至关重要。

