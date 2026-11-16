---
title: "II. 基础 Web 技术：核心支柱 / II.1 关于互联网（Internet）的基础知识"
---

# II.1 关于互联网（Internet）的基础知识

## II.1.1 互联网如何运作？

互联网连接着全球无数计算机设备，常被称为“网络的网络”。一次跨网络的数据传输依赖以下四个环节协同运作：

- **数据包交换**：发送或接收信息（如网页或电子邮件）时，数据会被拆分为多个小数据包独立传输。
- **协议**（[TCP/IP](https://www.rfc-editor.org/rfc/rfc9293)）：每个数据包都遵循“传输控制协议/网际协议”（TCP/IP）规则。IP 负责为数据包贴上目标地址标签；TCP 负责确保数据包准确无误地到达目的地，并按序重新组装。例外是 HTTP 的第 3 版（HTTP/3）：它不再基于 TCP，而是改用基于 UDP 的 QUIC 协议，由 QUIC 自身负责可靠传输与流控。
- **路由和传输**：数据包在由路由器、交换机、光纤电缆、无线电波等组成的物理网络中传输。路由器读取每个数据包的 IP 地址，并根据实时网络拓扑规划到达目的地的路径。
- **客户端与服务器**：你的设备（电脑或手机）作为“客户端”向“服务器”发起请求；服务器存储网站内容或服务逻辑，收到请求后将对应的数据包发回客户端。

## II.1.2 什么是 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)？

HTTP（Hypertext Transfer Protocol，超文本传输协议）是万维网（World Wide Web）数据传输的核心协议，规定了浏览器（客户端）与服务器之间请求和响应的报文格式与交互规则。

在浏览器中输入网址后，浏览器会向目标服务器发送 HTTP 请求；服务器处理后返回 HTTP 响应，其中包含 HTML 文档、图片、CSS 样式表等资源。HTTP 本身是“无状态”协议，服务器默认不记录同一客户端的历史请求；跨页面的状态保持（如登录态）通常借助 Cookie、Token 或服务端会话实现。

[HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)（Hypertext Transfer Protocol Secure）是 HTTP 的加密版本，通过 TLS/SSL 保障传输过程中的机密性与完整性，防止报文被窃听或篡改。

## II.1.3 什么是域名？

计算机在网络中通过数字形式的 IP 地址（如 `172.217.160.78`）寻址通信，但数字地址难以记忆。域名（Domain Name，如 `google.com` 或 `wikipedia.org`）为 IP 地址提供了可读的字符标识，相当于网站在互联网上的“门牌号”。

当你在浏览器中输入域名时，域名系统（DNS）会自动将其解析为对应的 IP 地址，使浏览器能够定位并连接到目标服务器。

## II.1.4 什么是托管？

网站托管（Web Hosting，常称“主机”或“空间”）是将网站文件部署到持续联网的服务器上、使其对外可访问的服务。

如果域名是网站的“门牌号”，网站托管就是存放网站内容的“房屋”。构成网站的 HTML、CSS、JavaScript、图片、视频及数据库都需要部署在托管服务商提供的服务器空间中。用户通过域名访问网站时，浏览器正是连接到这组托管服务器，下载并呈现页面文件。

## II.1.5 DNS 及其工作原理？

DNS（Domain Name System，域名系统）负责将可读的域名（如 `google.com`）解析为机器寻址所需的 IP 地址（如 `172.217.160.78`）。一次完整的 DNS 解析按以下步骤推进：

- **用户请求（递归查询）**：在浏览器中输入网址后，浏览器和操作系统会先检查本地缓存；未命中时，向 DNS 解析器（由 ISP 提供或使用公共 DNS）发起查询请求：“`google.com` 对应的 IP 地址是什么？”解析器负责替客户端查到最终结果。
- **分级追问（迭代查询）**：若解析器缓存未命中，它会依次询问根域名服务器、顶级域名（`.com`）服务器，再到负责该域名的权威域名服务器。前两级仅返回“下一步该询问哪台服务器”，解析器据此逐级定位。
- **获取 IP 地址**：权威域名服务器保存着域名与 IP 地址的最终映射记录，将该 IP 返回给解析器。
- **缓存与返回**：解析器将 IP 地址返回给客户端计算机，并按记录的 TTL（生存时间）缓存结果，加速后续相同域名的访问。
- **建立连接**：浏览器拿到目标 IP 地址后，向存放网站内容的服务器发起网络连接并请求网页数据。

因此，当域名无法访问但直接请求 IP 正常时，问题往往出在本地 DNS 缓存、解析器故障或权威 DNS 记录配置上。

## II.1.6 浏览器及其工作原理？

浏览器（Browser）作为 Web 客户端，负责向服务器请求资源、解析文档结构与样式、执行脚本，并将结果渲染为可交互的屏幕画面。从输入网址到画面呈现的主要步骤如下：

- **处理用户输入**：解析地址栏输入的 URL。
- **DNS 查询**：通过 DNS 查询该 URL 中域名对应的 IP 地址。
- **发送 HTTP 请求**：使用获取到的 IP 地址向目标服务器发送 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 请求，获取页面主文档（通常是 HTML 文件）。
- **接收服务器响应**：服务器返回包含 HTML 文档的 HTTP 响应；页面引用的 CSS、JavaScript、图片等子资源，则由浏览器在解析过程中继续发起请求。
- **渲染页面**：将接收到的文档与样式转换为屏幕像素：
  - 解析 HTML 文件，构建代表文档结构的“文档对象模型”（[DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) 树）。
  - 解析 CSS 文件，构建代表样式规则的“CSS 对象模型”（CSSOM 树）。
  - 结合 DOM 树和 CSSOM 树生成“渲染树”（Render Tree），确定需要显示的节点及其计算样式。
  - 执行布局（Layout），根据视口与内容计算每个元素的几何尺寸与位置。
  - 将布局结果绘制（Paint）并合成（Composite）到屏幕上（详见[浏览器运行时与渲染管线](/guide/web-basics/browser-runtime)）。
- **执行 JavaScript**：在解析或渲染过程中执行页面的 JavaScript 代码，动态修改 DOM 内容与样式，或响应点击、滚动等用户交互。

## II.1.7 Web 平台兼容性判断：Baseline 与 Interop（*）

过去判断“一个新特性是否适合生产使用”，往往需要在 [Can I Use](https://caniuse.com/) 和浏览器版本表之间反复比对。如今更高效的工程判断路径是：**先看特性是否进入 Baseline，再结合项目的真实用户分布决定是否直接采用或配置降级。**

- **Baseline**：由 WebDX 社区小组维护的兼容性标识，表示某个 Web 平台特性是否已在全部核心浏览器（Chrome、Edge、Firefox、Safari 的桌面版和移动版）中可用。
- **Newly available（新近可用）**：该特性刚在全部核心浏览器的最新版本中可用，可作为现代项目的候选能力。
- **Widely available（广泛可用）**：该特性在全部核心浏览器中可用已满 30 个月，通常可作为通用基础能力直接使用。
- **Interop**：浏览器厂商每年选定一组重点特性，协同消除各家实现差异，使“规范支持”真正转化为“跨端一致可用”。例如 Interop 2026 重点推动增强型 CSS `attr()`、CSS `shape()`、Navigation API、View Transitions 与锚点定位等能力的跨引擎对齐。

截至 2026 年 10 月，容器样式查询（`@container style()`）、`contrast-color()`、`@scope` 等能力已进入 Baseline 2026 新近可用；同文档 View Transitions 在 2025 年进入 Baseline，跨文档 View Transitions 仍在跨引擎推进中。具体特性可在 [Web Platform Status](https://webstatus.dev/) 或 MDN 兼容性表中查询，也可以通过工具链将 Baseline 校验前置到编码与 CI 阶段：

- **静态规则检查**：ESLint 官方的 [`@eslint/css`](https://github.com/eslint/css/blob/main/docs/rules/use-baseline.md) 提供 `css/use-baseline` 规则（可配置为 `"widely"` 或 `"newly"`），自动核对样式是否满足团队约定的基线或已包裹在 `@supports` 中；HTML 与 JavaScript 生态也有对应的 Baseline 检查插件。
- **构建目标对齐**：Browserslist 原生支持 `baseline widely available`、`baseline newly available` 等查询条件，使打包与编译目标同 Baseline 政策保持一致。

Baseline 提供兼容性决策信号；项目仍需结合目标浏览器、设备性能、辅助技术和降级路径验证。

评估浏览器兼容性时，可按以下四个维度逐项核对：

- 是否已进入 Baseline（新近可用还是广泛可用）
- 是否已在主流浏览器间通过 Interop 消除实现差异
- 项目的真实用户浏览器分布是否允许直接使用
- 是否需要为低版本环境引入 polyfill、`@supports` 分支或渐进增强

例如 Container Queries、`:has()`、CSS Nesting 等能力，都应以 Baseline 可用性等级和真实用户分布作为取舍依据，而非凭经验一概视为“新特性不敢用”。

## II.1.8 用一条请求观察 HTTP 证据

学习 HTTP 时，先从一次真实请求开始。下面的命令适合在 Windows PowerShell 中执行；`curl.exe` 用来调用系统的 curl 程序，避免与 PowerShell 的别名混淆。

```powershell
curl.exe -I https://example.com
curl.exe -v https://example.com -o NUL
```

重点观察这些输出：

| 证据 | 说明 | 前端决策 |
| :--- | :--- | :--- |
| `HTTP/2 200` 或 `HTTP/1.1 304` | 状态码和协议版本 | 判断请求是否成功、是否命中协商缓存 |
| `content-type` | 响应内容类型 | 检查 HTML、JSON、图片是否匹配预期 |
| `cache-control`、`etag` | 缓存与版本校验 | 设计静态资源和接口的缓存策略 |
| `set-cookie` | 服务端下发的 Cookie | 检查 `Secure`、`HttpOnly`、`SameSite` 等属性 |
| `content-encoding` | 响应压缩方式 | 观察 Brotli 或 gzip 是否生效 |

再打开浏览器 DevTools 的 Network 面板，刷新页面并对照同一个请求。记录请求方法、请求头、响应头、Timing 分段和 Initiator，就能把“页面加载很慢”拆成 DNS、连接、等待响应、下载和主线程处理等可验证的问题。

练习时可以按下面的顺序完成：

1. 对一个静态 HTML 请求执行 `curl.exe -I`，记录状态码、类型和缓存头。
2. 在 DevTools 中关闭缓存并刷新，比较首次请求和再次请求的 Timing。
3. 修改一个静态资源版本号，观察缓存命中、重新验证和下载行为的差异。
