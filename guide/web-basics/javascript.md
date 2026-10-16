---
title: "II. 基础 Web 技术：核心支柱 / II.5 JavaScript：赋予交互性生命"
---

# II.5 JavaScript：赋予交互性生命

## **II.5.1 核心语言概念（ES6+）**

JavaScript（JS）负责处理网页的交互逻辑、状态更新与异步数据通信。现代前端开发以 [ES6（ECMAScript 2015）](https://www.ecma-international.org/publications-and-standards/standards/ecma-262/6th-edition/) 及后续标准为基准：

- **变量声明（`let` / `const`）**：提供块级作用域并受暂时性死区（TDZ）约束，避免了 `var` 变量提升（hoisting）带来的作用域泄漏。`const` 声明不可重新赋值的绑定引用（若绑定值为对象，其内部属性仍可修改），`let` 用于需要重新赋值的变量。
- **基础类型与引用类型**：`string`、`number`、`boolean`、`null`、`undefined`、`symbol`、`bigint` 为按值传递的基础类型；对象、数组、函数等为按共享引用传递的引用类型。区分“值拷贝”与“引用共享”，是排查状态意外篡改和组件重渲染不生效的前提。
- **箭头函数**：提供简洁的函数表达式语法，且不绑定自身的 `this`、`arguments` 和 `prototype`，其 `this` 直接继承自外层词法作用域。
- **数据结构（`Array`、`Object`、`Map`、`Set`）**：`Array` 与 `Object` 承载日常列表和结构化记录；`Map` 支持任意类型作为键且适合高频增删的键值集合；`Set` 用于存储唯一值并支持高效的去重与成员存在性判断。
- **控制流与迭代**：包括条件分支（`if...else`、`switch`）与循环语句（`for`、`while`、`do...while`、`for...in`、`for...of`），其中 `for...of` 可统一遍历数组、`Map`、`Set`、字符串等实现了可迭代协议（Iterable）的对象。
- **作用域与闭包**：词法作用域由代码书写位置决定变量的可访问范围；闭包（Closure）使内部函数在外部函数执行完毕后仍能保留并访问其外层词法环境中的变量。
- **`this` 绑定与原型链**：普通函数的 `this` 取决于运行时的调用方式（默认绑定、隐式绑定、`call`/`apply`/`bind` 显式绑定或 `new` 构造调用）；原型链（Prototype Chain）则是对象之间共享属性与方法的委托查找机制。
- **解构、展开与剩余参数**：解构赋值与展开语法（`...`）常用于提取局部字段与浅拷贝对象/数组；剩余参数（rest parameters）将不定长参数收敛为真实数组，替代了早期的 `arguments` 对象。
- **可选链与空值合并**：可选链 `?.` 在遇到 `null` 或 `undefined` 时短路返回 `undefined`，空值合并 `??` 仅在左侧为 `null` 或 `undefined` 时才回退到默认值（不会像 `||` 那样误伤 `0` 或空字符串 `""`），适合读取深层接口字段。

## **II.5.2 异步 JavaScript：Promise、async/await、事件循环（宏任务/微任务）**

JavaScript 在主线程上以单线程方式运行，耗时操作（网络请求、定时器、磁盘 I/O）若同步阻塞主线程，页面就会停止响应输入与渲染。浏览器与语言标准通过事件循环和异步原语协调并发：

- **Promise**：表示异步操作最终完成（fulfilled）或失败（rejected）的状态容器，通过链式调用（`.then()` / `.catch()` / `.finally()`）及并发组合方法（`Promise.all`、`Promise.allSettled`、`Promise.race`、`Promise.any`）替代深层嵌套回调。
- **`async` / `await`**：基于 Promise 的语法层封装，让异步流程能够按同步风格顺序编写，并直接使用 `try...catch` 捕获异步异常。
- **事件循环（Event Loop）**：主线程执行栈清空后，事件循环持续按规则从任务队列中取出待执行的回调压入调用栈。
- **宏任务与微任务**：事件循环调度的两类队列。宏任务（Task，如 `setTimeout`、`setInterval`、DOM 事件回调、消息通道）每次循环只取出一个执行；微任务（Microtask，如 Promise 回调、`queueMicrotask`、`MutationObserver`）则在每个宏任务执行完毕后立即连续清空，随后才允许浏览器进入渲染阶段或取下一个宏任务。ECMAScript 规范将 Promise 回调称为“作业”（Job），在浏览器宿主中即映射为微任务队列。

::: details 示例：先猜事件循环的输出顺序

```js
console.log("A");

setTimeout(() => console.log("B: timeout"), 0);

queueMicrotask(() => console.log("C: microtask"));

Promise.resolve().then(() => console.log("D: promise"));

console.log("E");
```

实际输出是：

```txt
A
E
C: microtask
D: promise
B: timeout
```

推理时逐轮问三个问题：当前调用栈是否已经清空？微任务队列里有哪些任务？进入下一轮事件循环后，哪个宏任务可以执行？`queueMicrotask` 和 Promise 回调都进入微任务队列，并按入队顺序执行；`setTimeout` 至少要等到下一轮。

:::

## **II.5.3 DOM 操作：与网页交互**

文档对象模型（[DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)）是浏览器将 HTML 文档解析后生成的树状内存表示。JavaScript 通过 DOM API 查询节点、修改内容与样式、增删结构并同步无障碍状态；React、Vue、Svelte 等声明式框架在底层同样是通过协调这些原生 DOM 操作来完成界面更新：

- **查询节点**：使用 `querySelector()` 和 `querySelectorAll()` 按 CSS 选择器定位元素，使用 `closest()` 沿祖先链向上查找最近匹配的容器节点。
- **读写内容与 XSS 防护**：使用 `textContent` 安全地写入纯文本；`innerHTML` 仅用于受信任的静态模板片段，任何来自用户输入或外部接口的字符串直接拼入 HTML 前都必须经过转义或消毒（Sanitize）。
- **属性与自定义数据**：使用 `getAttribute()`、`setAttribute()`、`removeAttribute()` 管理 HTML 属性，通过 `element.dataset` 读写 `data-*` 自定义数据属性。
- **类名与视觉状态**：使用 `classList.add()`、`classList.remove()`、`classList.toggle()` 切换状态类名，把具体视觉表现交给 CSS 规则处理。
- **增删与替换节点**：使用 `createElement()`、`append()`、`prepend()`、`remove()`、`replaceChildren()` 构建或批量更新子树。
- **表单状态同步**：通过 `value`、`checked`、`selectedOptions` 读取表单控件当前值，并将校验错误文案更新到对应字段关联的提示节点中。
- **无障碍状态同步**：展开面板、切换页签或标记校验失败时，同步更新 `aria-expanded`、`aria-selected`、`aria-invalid` 等属性，确保辅助技术读取到的状态与视觉呈现一致。

DOM 修改会触发浏览器的样式重算（Style）、布局（Layout）与绘制（Paint）。若在循环中交替读取几何属性（如 `offsetHeight`、`getBoundingClientRect()`）并立即写入样式，会迫使浏览器反复提前执行同步布局（强制同步布局 / 布局抖动）。工程中应先集中读取所需尺寸，再统一写入变更；批量插入列表节点时可使用 `DocumentFragment` 或 `replaceChildren()` 合并提交。

## **II.5.4 事件模型：从用户动作到程序响应**

浏览器通过事件机制将用户输入、资源状态与生命周期变化通知给 JavaScript。排查“点击无响应”“点中子元素却误触外层逻辑”或“表单意外刷新页面”等问题，都需要回到事件传播机制与默认行为本身：

- **事件监听与解绑**：使用 `addEventListener()` 注册回调，并可在第三个参数中传入 `AbortSignal`（`{ signal }`）以便在组件卸载时一键清理监听器。
- **事件对象与默认行为**：区分 `event.target`（实际触发事件的最深层节点）与 `event.currentTarget`（当前绑定监听器的节点）；使用 `preventDefault()` 阻止浏览器默认动作（如链接跳转、表单原生提交），使用 `stopPropagation()` 阻止事件继续传播。
- **捕获、目标与冒泡阶段**：DOM 事件依次经历从根向下传递的**捕获阶段**、到达目标节点的**目标阶段**，以及从目标向上回溯的**冒泡阶段**。
- **表单提交语义**：监听表单应绑定 `<form>` 的 `submit` 事件，而非提交按钮的 `click` 事件，这样才能同时覆盖按回车提交、原生校验拦截与脚本触发提交等路径。

日常交互中常见的事件类别：

- **指针与鼠标事件**：`click`、`pointerdown`、`pointermove`、`pointerup` 统一覆盖鼠标、触控笔与触摸屏交互，适合按钮点击、拖拽与画布操作。
- **键盘事件**：`keydown` 用于处理快捷键、方向键导航及 `Esc` 关闭等键盘交互；文本输入变化则应监听 `input` 事件。
- **表单事件**：`input` 在值每次变化时立即触发（适合实时搜索或字数统计），`change` 在控件失焦或选择确认后触发，`submit` 在表单提交时触发。
- **文档与视图生命周期事件**：`DOMContentLoaded` 在 HTML 解析完成且延迟脚本执行后触发；`load` 在图片、样式等外部子资源全部加载完毕后触发；`visibilitychange` 在用户切换标签页或最小化窗口时触发。
- **网络状态事件**：`window` 上的 `online` 与 `offline` 事件可反映设备网络连接状态的切换。

对于动态增删的列表、表格操作列或菜单项，推荐采用**事件委托（Event Delegation）**：只在稳定的父容器上绑定一次监听器，触发时通过 `event.target.closest('[data-action]')` 定位具体操作节点。这样既减少了监听器数量，也能让后续动态插入或筛选后的子节点自动生效。

## **II.5.5 网络请求、JSON 与数据交换**

前端应用通过 `fetch()` API 与后端服务完成 HTTP 数据交换。处理网络请求不仅要拿到正常响应，还要覆盖状态码判别、序列化边界、异常分类与并发竞态：

- **HTTP 方法与状态码**：`GET`、`POST`、`PUT`、`PATCH`、`DELETE` 表达不同的资源操作语义；状态码 `2xx` 表示成功，`4xx` 表示客户端参数、认证或权限错误，`5xx` 表示服务端异常。
- **JSON 序列化与反序列化**：发送请求体时使用 `JSON.stringify()` 转为字符串并声明 `Content-Type: application/json`；接收响应时调用 `await response.json()` 解析为 JavaScript 对象。
- **分层错误处理**：需要区分网络层断连/超时、HTTP 非 2xx 状态码以及响应体内的业务错误码，分别向用户提供可理解的提示或重试入口。
- **取消与并发竞态**：在搜索联想、筛选切换、分页跳转等高频交互中，先发出的慢请求可能晚于后发出的快请求返回并覆盖最新界面，需配合 `AbortController` 与请求序号（Request ID）控制时序。

一次生产级的数据请求通常包含以下七步：

1. 将界面切换为加载状态（Loading），并保留用户当前输入上下文。
2. 构造 URL、编码查询参数（`URLSearchParams` / `encodeURIComponent`）、设置请求头与请求体。
3. 调用 `fetch()` 发起请求，首先检查 `response.ok`（状态码在 200–299 之间）或具体 `response.status`。
4. 按 `Content-Type` 解析响应正文（如 `await response.json()` 或 `response.text()`）。
5. 校验并转换数据结构，隔离后端字段命名变动。
6. 更新界面状态或本地缓存。
7. 捕获异常或错误分支，展示错误反馈并恢复交互状态。

使用 `fetch()` 时有两个高频陷阱：第一，只有 DNS 失败、断网、跨域拦截或主动取消等**网络层故障**才会使 `fetch()` 返回的 Promise reject；服务端返回 HTTP `404` 或 `500` 时 Promise 依然会 resolve，必须显式检查 `response.ok`。第二，`response.json()` 本身也是异步操作，当状态码为 `204 No Content`、响应体为空或网关返回了 HTML 错误页时，直接调用 `response.json()` 会抛出解析异常。

当网络请求与表单提交结合时，还需核对以下工程边界：

- 提交期间禁用提交按钮或忽略重复触发，防止多次创建记录（幂等保护）。
- 区分具体字段的校验错误（定位到输入框旁）与全局错误（如网络断开、服务端 500）。
- 跨域请求（CORS）下的凭据携带策略（`credentials: 'include'`）、Cookie `SameSite` 属性及 CSRF 防护。
- 搜索、筛选、分页场景下的防抖（Debounce）、请求取消与过期响应丢弃。

在现代框架工程中，TanStack Query、SWR 等服务端状态库封装了缓存过期、后台重验证、自动重试与请求去重；Axios、ky 等 HTTP 客户端则封装了请求/响应拦截器、超时控制与非 2xx 自动抛错。理解上述原生机制，才能在这些上层库出现缓存不更新或竞态异常时快速定位根因。

## **II.5.6 错误处理与调试**

JavaScript 调试的目标是把模糊的“功能坏了”收敛为可复现的输入、可观察的中间状态与明确的异常调用栈：

- 使用 `try...catch...finally` 包裹可能失败的边界操作（如 `JSON.parse()`、网络请求、第三方存储读写或权限请求），在 `finally` 中确保清理加载状态或释放资源。
- 区分语法错误（SyntaxError，构建或解析阶段直接报错）、运行时类型/引用错误（TypeError / ReferenceError，附带完整调用栈）与逻辑错误（无报错但输出不符预期，需借助断点排查）。
- 在浏览器 DevTools 的 Sources 面板中使用普通断点、条件断点（Conditional Breakpoint）与日志点（Logpoint），无需反复修改源码插删 `console.log` 即可观察循环与高频回调中的变量值。
- 监控未捕获的同步异常（`window.addEventListener('error', ...)`）与未处理的 Promise 拒绝（`window.addEventListener('unhandledrejection', ...)`），防止异步错误静默丢失。

定位问题时，可按职责组合使用浏览器 DevTools 的五个核心面板：

- **Console**：查看报错堆栈、警告信息，或在当前断点上下文中直接求值表达式。
- **Elements**：确认目标节点是否存在、属性与类名是否正确更新、DOM 事件监听器绑定在哪个节点上。
- **Sources**：单步跟踪执行流，检查作用域变量、闭包捕获值与异步调用栈（Async Stack Trace）。
- **Network**：核对请求 URL、方法、状态码、请求/响应头、载荷正文、缓存命中状态与 CORS 预检结果。
- **Application**：检查并手动清理 Cookie、`localStorage`、`sessionStorage`、IndexedDB、Cache Storage 与 Service Worker 状态。

## **II.5.7 客户端存储**

浏览器提供了多种本地存储机制，各自在容量上限、同步/异步模型、生命周期与线程可用性上存在明确差异：

- **localStorage**：同步键值存储，容量约 5MB，仅支持字符串，主线程直接读写过大数据会阻塞渲染；适合保存轻量级界面偏好（如主题、字号），切勿存放敏感凭证。
- **sessionStorage**：API 与 `localStorage` 相同，但作用域与生命周期绑定到当前顶级标签页会话，关闭标签页后自动清除，适合分步表单等当前会话临时状态。
- **IndexedDB**：浏览器内置的异步事务型对象数据库，支持索引查询与二进制数据（Blob / ArrayBuffer），可在主线程与 Worker 中访问，适合大容量离线数据与本地缓存表。
- **[Origin Private File System（OPFS）](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)**：File System API 中按源（origin）隔离的私有虚拟文件系统，已进入 Baseline。在专用 Web Worker 中可通过 `createSyncAccessHandle()` 获取 **`FileSystemSyncAccessHandle`** 进行同步原地文件读写，I/O 吞吐远高于通用键值存储，常作为浏览器端运行 SQLite（如 SQLite Wasm）和读写大型媒体/模型文件的基础设施。
- **Cache Storage**：面向 `Request` / `Response` 对象的异步缓存仓库，常配合 Service Worker 拦截并缓存静态资源与接口响应，支撑离线访问。

客户端脚本可读的存储（`localStorage`、`sessionStorage`、IndexedDB 等）一旦遭遇 XSS 攻击即可被恶意脚本读取；因此会话令牌与高敏凭证应优先通过设置 `HttpOnly`、`Secure`、`SameSite` 属性的 Cookie 交由浏览器自动管理。

各存储方案的选型对照如下：

| 存储能力 | 适合内容 | 生命周期 | 典型调试位置 |
| :--- | :--- | :--- | :--- |
| localStorage | 主题、语言、轻量偏好 | 持久保存，用户或代码清理 | DevTools Application |
| sessionStorage | 当前标签页临时状态 | 标签页会话结束后清理 | DevTools Application |
| IndexedDB | 离线草稿、复杂对象列表、本地索引 | 持久保存，容量更大 | DevTools Application |
| [**OPFS**](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) | 大型二进制文件、SQLite 数据库文件 | 持久保存，按源隔离，与 IndexedDB 共用存储配额 | DevTools Application / OPFS Explorer |
| Cache Storage | 请求与响应缓存 | 由 Service Worker 或代码管理 | DevTools Application |
| Cookie | 会话标识、服务端协作状态 | 由过期时间和服务端策略决定 | DevTools Application / Network |

在实际架构中，应将**内存组件状态**（React/Vue/Svelte state，表达当前视图瞬态）、**服务端状态缓存**（TanStack Query/SWR，表达远端数据快照与同步状态）与**浏览器持久化存储**（跨页面刷新或离线恢复）划分为清晰的三个层次，避免把所有数据都不加区分地塞进本地存储或全局状态树。

## **II.5.8 模块系统：import/export**

ES 模块（ES Modules，即 `import` / `export`）是语言内置的标准模块化机制，取代了早期社区自行约定的全局变量挂载、IIFE、[CommonJS](http://www.commonjs.org/) 和 [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)。

由于 ES 模块的 `import` 和 `export` 声明位于模块顶层且结构静态确定，打包工具（Vite、Rollup、Webpack、esbuild、Rolldown）无需执行代码即可在编译期构建完整的依赖图，从而实现 **Tree Shaking**（自动剔除未被引用的导出代码）、按路由或交互边界做代码分割（Code Splitting），以及通过动态 `import()` 按需异步加载模块。

在浏览器中，通过 `<script type="module">` 加载的脚本会自动开启模块语义：拥有独立模块作用域（顶层变量不会污染 `window`）、默认启用严格模式（`'use strict'`），且默认行为等同于 `defer`（异步下载、待 HTML 解析完成后按依赖顺序执行）。

阅读或设计模块时，重点核对三个边界：

- 该模块对外暴露了哪些最小必要导出（命名导出还是默认导出）？
- 该模块引入了哪些外部依赖，是否存在循环依赖或带有全局副作用（Side Effects）的导入？
- 构建工具最终会将该模块合并进首屏主包，还是拆分为按需加载的独立 chunk？

## **II.5.9 现代 ECMAScript 演进与标准新特性**

JavaScript 标准（ECMAScript）每年按 TC39 流程持续迭代。以下前四项能力已进入现代浏览器 Baseline，可直接在工程中使用；Temporal API 已完成标准化，正处于跨浏览器落地阶段：

- **原生 Set 集合运算方法**（ES2025 / Baseline）：无需引入 lodash 等第三方工具库，原生支持集合的数学运算：
  - `setA.union(setB)`：求并集；
  - `setA.intersection(setB)`：求交集；
  - `setA.difference(setB)`：求差集（存在于 A 但不存在于 B）；
  - `setA.symmetricDifference(setB)`：求对称差集；
  - `setA.isSubsetOf(setB)` / `setA.isSupersetOf(setB)`：判断子集/超集关系。
- **`Promise.withResolvers()`**（ES2024 / Baseline）：直接解构返回 `{ promise, resolve, reject }`，不必再为了在 Promise 外部调用 `resolve`/`reject` 而预先声明外部变量：
  ```ts
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  ```
- **数据分组：`Object.groupBy()` 与 `Map.groupBy()`**（ES2024 / Baseline）：按照回调函数的返回值将可迭代对象分组为普通对象或 Map 实例：
  ```ts
  const grouped = Object.groupBy(products, (item) => item.category);
  ```
- **异步迭代收集：`Array.fromAsync()`**（ES2026 / Baseline）：直接将异步生成器（AsyncGenerator）或 `ReadableStream` 等异步可迭代对象转换为普通数组。
- **下一代时间日期标准：[Temporal API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal)**（已于 2026 年进入 TC39 Stage 4，预计纳入 ES2027）：旨在取代设计缺陷众多的 `Date` 对象，提供不可变的日期时间对象、纳秒级精度、完整的时区计算与日历系统支持。截至 2026 年 10 月，Chrome 与 Firefox 已支持，Safari 尚未支持，因此还不是 Baseline；生产环境使用前应先检测 `typeof Temporal !== "undefined"`，或引入 polyfill。

## **II.5.10 一个最小浏览器应用闭环**

要验证自己是否真正掌握了前五节的 Web 基础能力，可以不借助任何前端框架，独立实现一个“可搜索、可收藏、可离线保留草稿”的商品列表页：

- 使用语义化 HTML 搭建搜索表单、结果列表、空状态与错误提示区域。
- 使用 CSS Grid / Flexbox 处理响应式布局、骨架屏/加载态与焦点样式。
- 使用事件委托与表单 `submit` 事件监听用户检索和收藏交互。
- 使用 `fetch()` 请求接口数据，校验状态码并将 JSON 渲染为 DOM 节点。
- 使用 `AbortController` 与请求序号处理连续输入时的并发竞态。
- 使用 `localStorage` 保存排序或视图偏好，使用 IndexedDB 保存收藏列表与离线草稿。
- 在 DevTools 的 Elements、Network、Sources 和 Application 面板中逐项核对运行证据。

::: details 示例：只让最后一次搜索更新界面

下面只保留搜索请求最关键的竞态边界：

```js
const form = document.querySelector("#search-form");
let controller;
let latestRequest = 0;

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const requestId = ++latestRequest;
  controller?.abort();

  const data = new FormData(form);
  const keyword = String(data.get("keyword") ?? "").trim();
  if (!keyword) return;

  controller = new AbortController();

  try {
    const response = await fetch(
      `/api/products?q=${encodeURIComponent(keyword)}`,
      { signal: controller.signal },
    );

    if (!response.ok) {
      throw new Error(`请求失败：${response.status}`);
    }

    const products = await response.json();
    if (requestId !== latestRequest) return;

    renderProducts(products);
  } catch (error) {
    const wasAborted =
      error instanceof DOMException && error.name === "AbortError";
    if (wasAborted || requestId !== latestRequest) return;

    showSearchError();
  }
});
```

`AbortController` 用于停止已经过时的工作，请求序号则保证只有最新意图能写入 UI。两层约束解决的问题不同：取消是一种优化，“提交结果前再次确认”才是正确性边界。真实项目还应验证接口响应，并把用户提示与诊断日志分开。

:::
