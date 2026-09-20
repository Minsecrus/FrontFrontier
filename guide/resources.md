---
title: "附录 A：前端学习资料汇总"
---

# 附录 A：前端学习资料汇总

按正在解决的问题选择资料：先用正文建立概念，再查官方文档确认 API 和配置，最后用练习或项目验证。阅读工具文档时应选择与项目依赖相符的版本。

## **0. 学习路线图 (The Map)**

_出发前的指南针，迷茫时的导航仪。_

- **[roadmap.sh](https://roadmap.sh/)**
  - **用途**：通过 [Frontend Roadmap](https://roadmap.sh/frontend) 了解技能之间的关系，也可按 React、Vue 或全栈方向继续查阅。
  - **何时阅读**：开始学习或阶段复盘时，对照本文标记已掌握的知识，再根据项目需要安排后续主题。
- **[The Odin Project](https://www.theodinproject.com/)**
  - **用途**：免费的项目驱动型全栈课程，覆盖本地开发环境、Git、命令行和 Web 应用练习。
  - **何时阅读**：已经看懂基础教程、但还不能独立完成项目时，选择对应练习，把正文概念落实到代码中。

## **1. Web 文档、兼容性与标准 (Web References)**

_这些是所有前端开发的基石，遇到问题时的第一检索源。_

- **[MDN Web Docs](https://developer.mozilla.org/zh-CN/)**
  - **用途**：查询 HTML、CSS、JavaScript 和 Web API 的用法、示例及兼容性；需要确认规范细节时，继续查看条目中的规范链接。
- **[web.dev](https://web.dev/)**
  - **用途**：学习性能、Core Web Vitals、PWA 和无障碍的实现方法，适合在发现具体体验问题后按主题阅读。
- **[Web Platform Baseline](https://web.dev/baseline/)**
  - **用途**：了解 Web 特性在主要浏览器中的支持状态；决定是否采用时，还要核对项目的目标浏览器和用户分布。
- **[Web Platform Dashboard / WebStatus](https://webstatus.dev/)**
  - **用途**：按特性查询 Web 平台能力、Baseline 状态与浏览器进展。
- **[Can I Use](https://caniuse.com/)**
  - **用途**：查询 CSS/JS 新特性的浏览器兼容性（如 `:has()`, Container Queries）。
- **[WCAG 2.2](https://www.w3.org/TR/WCAG22/)** / **[WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)**
  - **用途**：用 WCAG 查询可访问性成功标准，用 APG 参考组件语义、键盘交互和实现示例，适合在组件设计与验收时查阅。
- **[Patterns.dev](https://www.patterns.dev/)**
  - **用途**：学习 Web 应用的设计模式、渲染模式和性能取舍，适合比较 CSR、SSR、SSG、Streaming、Islands 等方案时阅读。

## **2. 核心技术栈深度学习 (Deep Dives)**

_不仅是官方文档，更是进阶教程。_

- **JavaScript**
  - **[JavaScript.info](https://javascript.info/)**
    - **用途**：按顺序学习语言基础、对象、异步、DOM 与网络请求；适合从零学习，也适合针对薄弱主题精读。
    - **中文站**：[现代 JavaScript 教程](https://zh.javascript.info/)。
  - **[You Don't Know JS Yet (GitHub)](https://github.com/getify/You-Dont-Know-JS)**
    - **用途**：深入理解作用域、闭包、对象与类型机制，适合已经会使用语法、需要解释代码行为时阅读。
  - **[Just JavaScript](https://justjavascript.com/)**
    - **用途**：通过值、变量、对象与引用建立 JavaScript 心智模型，适合梳理对象共享和相等性判断中的困惑。
- **TypeScript**
  - **[Total TypeScript](https://www.totaltypescript.com/)**：通过练习学习泛型、类型推断和应用类型设计，适合掌握基础语法后进阶。
  - **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**：官方手册，适合系统学习类型系统，也可在遇到类型收窄、泛型或模块问题时查阅。
- **React 生态**
  - **[React.dev](https://react.dev/)**：通过官方教程和练习学习组件、状态与 Effect，适合入门和检查常见使用误区。
  - **[Josh W Comeau's Blog](https://www.joshwcomeau.com/)**：通过交互式示例讲解 CSS 和 React，适合需要观察布局或渲染行为时阅读。
- **Vue 生态**
  - **[Vue.js 官方文档](https://vuejs.org/)**：学习响应式、组件与组合式 API，并按项目写法查阅 Options API 或 Composition API。
  - **[Anthony Fu (antfu)](https://antfu.me/)**：阅读开源工具的设计过程与工程经验，适合了解工具链实现中的取舍。
- **现代全栈课程**
  - **[Full Stack Open](https://fullstackopen.com/)**
    - **用途**：通过 React、Node.js、TypeScript、GraphQL、测试、CI/CD 和容器相关练习，学习 Web 应用的完整开发过程。
    - **何时阅读**：掌握 HTML、CSS、JavaScript 基础后，系统补齐 SPA、后端接口、测试和部署能力。
- **中文知识库**
  - **[千古前端图文教程](https://github.com/qianguyihao/Web)**：覆盖 HTML、CSS、JavaScript、工程化、算法和面试等主题，适合作为中文补充材料，按知识点查漏补缺。

## **3. 样式与 UI 设计 (CSS & Design)**

_从“写出 CSS”到“写出好用的 UI”。_

- **CSS 进阶**
  - **[Modern CSS](https://moderncss.dev/)**: 专注于现代 CSS 解决方案的教程。
  - **[SmolCSS](https://smolcss.dev/)**: 极简的现代 CSS 布局片段。
- **图标库**
  - **[Lucide](https://lucide.dev/)**：风格统一的图标集合，适合按同一视觉语言为界面选择图标。
  - **[React Icons](https://react-icons.github.io/react-icons/)**：以 React 组件形式提供多套图标集合，适合在项目中按需选择和引用。
- **无头组件 (Headless UI)**
  - **[Radix UI](https://www.radix-ui.com/)** / **[Headless UI](https://headlessui.com/)**: 提供逻辑和无障碍能力，不带样式的组件库底座。
  - **[shadcn/ui](https://ui.shadcn.com/)**：将组件源码引入项目后自行维护，适合需要调整组件实现、统一样式和保留代码控制权的场景。
- **UI/UX 设计基础**
  - **[Refactoring UI](https://www.refactoringui.com/)**: 面向开发者的界面设计入门，特别适合理解层级、间距、对齐、色彩和组件细节如何影响成品质感。
  - **[Nielsen Norman Group](https://www.nngroup.com/articles/)**: UX 研究和可用性原则的经典资料库，适合补充用户行为、信息架构、表单和导航设计的底层判断。
  - **[Laws of UX](https://lawsofux.com/)**: 简洁地整理常见 UX 心理学原则，适合作为设计决策和界面复盘时的快速参考。
- **设计系统参考**
  - **[Material Design](https://m3.material.io/)**: Google 的设计系统，适合学习组件规范、动效、颜色体系和跨平台体验一致性。
  - **[Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)**: Apple 平台设计指南，适合理解系统级交互、平台习惯和高质量原生体验。
  - **[IBM Carbon Design System](https://carbondesignsystem.com/)**: 面向企业级产品的成熟设计系统，适合学习数据密集界面、组件状态和设计 token 的组织方式。
  - **[Atlassian Design System](https://atlassian.design/)**: 面向协作和工作流产品的设计系统，适合参考复杂产品中的导航、表单、反馈和内容设计。

## **4. 工程化与工具链 (Engineering)**

_提升开发效率与代码质量的利器。_

- **构建与编译**
  - **[AST Explorer](https://astexplorer.net/)**：查看代码的抽象语法树，适合编写代码转换或静态检查规则前观察节点结构。
  - **[Bundlephobia](https://bundlephobia.com/)**：估算 npm 包的打包体积，适合初步比较依赖；项目中的实际成本仍需用构建产物分析确认。
  - **[Vite 官方指南](https://vite.dev/guide/)**：查询开发服务器、静态资源、环境变量与生产构建，适合搭建工程或排查构建配置时阅读。
  - **[TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig/)**：查询编译选项的含义与影响，适合调整严格检查、模块解析和输出配置时查阅。
- **测试与组件开发**
  - **[Vitest](https://vitest.dev/guide/)**：学习测试组织、断言、Mock 和覆盖率配置，适合为业务逻辑与模块补充单元测试时阅读。
  - **[Testing Library](https://testing-library.com/docs/guiding-principles/)**：学习从用户可观察的行为查询和操作界面，适合为表单、按钮等组件编写交互测试时阅读。
  - **[Playwright](https://playwright.dev/docs/intro)**：学习在浏览器中验证关键流程，并通过自动等待和 Trace 排查失败，适合端到端测试与回归验证。
  - **[Storybook](https://storybook.js.org/docs)**：将组件状态组织为独立的 Story，适合组件开发、设计评审及交互测试时查阅。
- **调试与性能分析**
  - **[Chrome DevTools 官方文档](https://developer.chrome.com/docs/devtools/)**：按 Elements、Console、Network、Performance 等面板学习排障，适合定位样式、请求或运行时性能问题。
  - **[Regex101](https://regex101.com/)**：用样例验证正则表达式并查看解释；调试 JavaScript 正则时选择对应的引擎模式。
  - **[JSON Crack](https://jsoncrack.com/)**：将嵌套 JSON 可视化，适合梳理接口数据结构和对象之间的关系。
- **安全实践**
  - **[OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)**：按 XSS、CSRF、CSP 等主题查询防护方法，适合处理不可信内容、设计认证交互或开展安全检查时阅读。

## **5. AI 驱动开发 (AI-Native)**

阅读这组资料时，先明确是改进开发流程，还是把 AI 能力集成到产品中。具体配置与 API 应以所用工具的官方文档为准。

- **界面生成与编辑器**
  - **[v0](https://v0.dev/)**：通过描述和视觉输入探索界面实现，适合原型阶段比较布局，再结合项目组件与设计约束调整。
  - **[Cursor 文档](https://cursor.com/docs)**：查阅代码库上下文、项目规则和 Agent 的使用方法，适合在编辑器中组织代码修改与检查流程。
- **终端 Agent**
  - **[Codex CLI 文档](https://learn.chatgpt.com/docs/codex/cli)**：查阅在本地仓库中阅读代码、修改文件、执行命令与配置工作流的方法，适合建立终端中的开发和验证流程。
  - **[Claude Code 文档](https://code.claude.com/docs/en/overview)**：查阅终端开发、项目上下文、Skills 与 MCP 的使用方法，适合把项目约定和外部工具接入开发流程。
- **前端 AI 工作流**
  - **[Figma MCP Server](https://developers.figma.com/docs/figma-mcp-server/)**：了解如何向 Agent 提供布局、变量与组件等设计上下文，适合把设计稿约束带入界面实现时查阅。
  - **[Playwright MCP](https://github.com/microsoft/playwright-mcp)**：让 Agent 通过工具读取页面状态、操作浏览器并收集反馈，适合开发过程中复现交互与检查运行结果；需要长期回归的路径应另写为可重复运行的测试。
  - **[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance)**：参考将 Web 平台实践与兼容性知识组织为 Agent Skills 的方式，适合为团队整理可复用执行指引时阅读。
- **AI 集成 (Integration & SDKs)**
  - **[LangChain JS](https://docs.langchain.com/oss/javascript/langchain/overview)**：学习模型调用、工具集成与 Agent 编排，适合需要组织多步骤 AI 处理流程时查阅。
  - **[AI SDK UI](https://ai-sdk.dev/docs/reference/ai-sdk-ui)**：查询聊天、流式消息和结构化结果相关的 UI 接口，适合把模型输出接入应用界面时阅读。
  - **[MCP (Model Context Protocol)](https://modelcontextprotocol.io/)**：了解资源、提示模板与工具等协议能力，适合设计 Agent 与外部系统的连接方式时阅读。
  - **[MCP Apps](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)**：了解工具如何提供可在支持该扩展的宿主中显示的交互式 UI。
  - **[Google A2UI](https://github.com/google/A2UI)**：了解 Agent 声明界面结构、由客户端渲染组件的实现思路。
  - **[WebMCP Draft](https://webmachinelearning.github.io/webmcp/)**：了解网页向 Agent 暴露工具的实验性草案，适合研究网页操作接口；落地前需核对草案与浏览器实现状态。
  - **[Chrome Built-in AI Docs](https://developer.chrome.com/docs/ai)**：查询浏览器内建 AI API 的使用方式、运行条件与能力检测，适合评估端侧 AI 功能时阅读。

### **按日期阅读趋势资料**

岗位和工具调查很容易过时，阅读时应记录发布日期、地域、样本和指标定义：

- [Stack Overflow 2025 AI Survey](https://survey.stackoverflow.co/2025/ai)：观察开发者对 AI 准确性、Agent、信任和安全的态度。
- [DORA 2025 Report](https://dora.dev/research/2025/dora-report/)：理解 AI 与组织工程能力、交付质量之间的关系。
- [LinkedIn Talent 2026](https://news.linkedin.com/en-us/2026/LinkedIn-Research-Talent-2026)：观察招聘流程和求职竞争的变化。
- [BLS Web Developers and Digital Designers](https://www.bls.gov/ooh/computer-and-information-technology/web-developers.htm)：作为美国宽口径职业展望阅读；其他市场需要配合本地数据。

## **6. 实战与练习平台 (Practice)**

_眼过千遍不如手过一遍。_

- **[Frontend Mentor](https://www.frontendmentor.io/)**
  - 提供设计图（Figma）和资源，让你从零实现页面，非常接近真实工作流。
- **[GreatFrontend](https://www.greatfrontend.com/)**
  - 专注前端大厂面试的准备平台（系统设计、算法、UI 挑战）。
- **[CodeSandbox](https://codesandbox.io/)** / **[StackBlitz](https://stackblitz.com/)**
  - 云端 IDE，快速验证想法，无需本地配环境。

## **7. 资讯与社区 (Stay Updated)**

_保持技术敏感度。_

- **[Bytes](https://bytes.dev/)**: 幽默风趣的 JavaScript 每周简报。
- **[This Week In React](https://thisweekinreact.com/)**：汇集 React 生态文章与项目动态，适合每周挑选与工作相关的主题阅读。
- **[Best of JS](https://bestofjs.org/)**：按项目和关注度变化发现 JavaScript 生态工具，适合寻找待调研的候选项目；采用前仍需检查文档、维护情况和项目适配性。
