---
title: "III. 基本开发环境和工具 / III.9 AI 协作能力与工程化工作流"
---

# III.9 AI 协作能力与工程化工作流

学习 AI 辅助开发时，重点是贯穿工具更迭的五个稳定问题：

1. **目标**：这次任务要改变什么，什么结果算完成？
2. **上下文**：模型必须看到哪些代码、日志、设计和业务约束？
3. **执行**：它能读什么、改什么、运行什么？
4. **反馈**：测试、构建、浏览器和人工审查怎样告诉它做得对不对？
5. **治理**：哪些动作需要审批，过程怎样回退、追踪和复盘？

可以把它记成一条简单的工作链：

> 目标 → 上下文 → 执行 → 反馈 → 治理

下文介绍的在线 IDE、编辑器、终端 Agent、Skills、MCP 和测试工具，分别展示了这条链上不同位置的工作方式。

## **III.9.1 先让开发环境可以复现**

AI 和人一样，只有在环境可运行时，才能可靠地定位问题。所谓“可复现”，就是另一位开发者打开项目后，能得到相同的依赖、启动方式、错误现象和检查结果。

云端开发环境在这里很有代表性：

- [**CodeSandbox**](https://codesandbox.io/) 把代码、依赖、预览和协作链接放进同一个环境，适合分享原型和问题复现。
- [**StackBlitz**](https://stackblitz.com/) 通过 WebContainer 在浏览器中提供接近 Node.js 的运行体验，适合快速安装依赖、启动项目和发送复现链接。

选这类工具时，检查以下内容：

- 锁文件、运行时版本和环境变量是否明确；
- 失败能否被别人稳定重现；
- 预览环境是否接近真正的构建与部署环境；
- 敏感配置是否会意外进入共享链接。

稳定复现为 Agent 提供了真实现象和可验证反馈，是 AI 工作流的起点。

## **III.9.2 从提示词扩展到工程循环**

AI 协作的范围已经从提示词扩展到上下文、执行环境和反馈循环。社区常用 **Prompt Engineering → Context Engineering → Harness Engineering → Loop Engineering** 来描述这种逐层包含的工程范围。

| 层级 | 关注点 | 在开发工作流中的含义 |
| :--- | :--- | :--- |
| **Prompt Engineering** | 怎么说 | 用清晰的角色、目标、约束、输出格式和示例，让模型更容易理解任务。 |
| **Context Engineering** | 给什么信息 | 管理模型能看到的上下文，包括相关文件、错误日志、设计稿、接口契约、仓库规则和历史决策。[Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) 将其概括为在推理过程中维护最合适的信息集合。 |
| **Harness Engineering** | 在什么系统里工作 | 为 Agent 配置工具、权限、沙箱、测试命令、质量门禁、可观测性和人类审批机制。[Martin Fowler](https://martinfowler.com/articles/harness-engineering.html) 将 coding agent 的 harness 视为包裹在模型外部、帮助约束和反馈模型行为的工程结构。 |
| **Loop Engineering** | 如何持续推进和自我修正 | 设计“计划 -> 执行 -> 观察 -> 修复 -> 验收”的循环，让 Agent 能在工具反馈、测试结果、guardrails 和人工确认之间迭代。[OpenAI Agents SDK](https://openai.github.io/openai-agents-python/agents/) 这类框架也把 tools、handoffs、guardrails、tracing、human-in-the-loop 等能力作为 Agent 系统的一部分。 |

以“修复结算页重复提交”这个任务为例，可以直观看到四层的差别：

- **Prompt**：说明现象、期望结果和“不改变支付接口”的约束。
- **Context**：提供表单组件、请求封装、相关测试、错误日志和已有防重约定，把上下文筛选到完成任务所需的最小充分集合。
- **Harness**：允许 Agent 读写相关目录、运行测试和查看 diff；禁止读取生产密钥、部署或执行高风险命令。
- **Loop**：先用测试复现重复请求，再做最小修改，运行类型检查和 E2E，最后由人审查 diff 与真实支付边界。

这时，提示词仍然重要，但它只是完整系统的入口。

## **III.9.3 上下文决定结果，界面只决定入口**

AI 可以出现在云端环境、编辑器或终端里。三种形态的差别主要是工作入口和权限范围，实际能力由模型、上下文、工具与反馈共同决定。

| 工作形态 | 代表性工具 | 它解释的能力 | 更适合的场景 |
| :--- | :--- | :--- | :--- |
| **云端环境** | [CodeSandbox](https://codesandbox.io/)、[StackBlitz](https://stackblitz.com/) | 把代码、运行时和预览一起分享 | 原型、教学、最小复现、远程协作 |
| **编辑器协作** | [GitHub Copilot](https://github.com/features/copilot)、[Cursor](https://cursor.com/)、[Windsurf](https://windsurf.com/)、[Trae](https://trae.ai/)、[CodeBuddy](https://codebuddy.ca/) | 围绕当前文件、符号和代码库问答、编辑多个文件 | 高频编码、局部重构、边写边审查 |
| **终端 Agent** | [Codex](https://developers.openai.com/codex/use-cases)、[Gemini CLI](https://google-gemini.github.io/gemini-cli/)、[Claude Code](https://www.claude.com/product/claude-code)、[Qwen Code](https://qwen.aliyun.com/code) | 在受控权限内读写文件、运行命令并根据结果继续工作 | 测试修复、跨文件任务、脚本与仓库级操作 |

无论使用哪一种入口，都应检查同一组能力：

- 能否定位相关文件、符号和调用关系；
- 能否明确添加与移除上下文，并把输入保持在最小充分范围；
- 多文件修改是否以清晰 diff 呈现；
- 命令失败后，能否引用真实输出继续判断；
- 开发者能否逐步接受、拒绝或回退改动。

例如，让 Agent “把商品页改快一点”几乎无从验收；改成“把首屏产品图从同步加载改为按可视区域加载，保持布局尺寸不变，并用现有性能脚本验证 LCP 没有退化”，目标、范围和证据就都清楚了。

## **III.9.4 把团队经验变成可复用上下文**

每次都在对话里重新解释目录结构、测试命令和业务禁区，既浪费上下文，也容易遗漏。团队可以把稳定知识分成四类：

- **仓库规则**回答“必须遵守什么”：目录约定、代码风格、禁止操作、测试门禁和审批要求。GitHub Copilot 等工具也支持仓库级自定义指令；关键规则仍应进入版本控制并接受评审。
- **Skills、任务模板或 playbook**回答“这类任务通常怎样做”：例如新增页面、补 E2E、修 CI、做无障碍审查。它们更像可执行的 onboarding 文档。
- **MCP**回答“还需要连接哪些信息或动作”：按 [Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/server/index) 的抽象，服务器可以提供 prompts、resources 和 tools，让 Agent 在明确边界内连接文档、设计、工单或内部服务。
- **模型路由**回答“哪类任务交给谁”：检索与整理、复杂推理、代码编辑可能使用不同模型，统一的质量标准适用于所有路由结果。

三者很容易混淆，可以这样记：

> 规则写边界，Skill 写做法，MCP 接外部能力；模型路由只负责分配计算。

沉淀这些内容时，只保留长期有效的信息。一次性的报错、过期路径和个人偏好如果写进全局规则，反而会持续污染后续任务。

## **III.9.5 用证据闭合任务**

完成任务需要同时交付代码和验证证据。一个小而完整的验证循环通常是：

1. **复现**：先得到失败测试、错误日志或可见问题。
2. **修改**：限定文件和目标，优先做最小改动。
3. **自动检查**：运行类型检查、Lint、单元测试、E2E 和构建。
4. **观察产品**：检查页面状态、浏览器控制台、视觉差异与性能指标。
5. **人工验收**：阅读 diff，确认业务语义、架构边界和风险。

这里的工具都是“提供证据”的例子：

- [Playwright](https://playwright.dev/) 可以复现真实用户路径，并用 trace、报告和多浏览器结果帮助定位失败。
- [Chromatic](https://www.chromatic.com/) 和 [Percy](https://percy.io/) 可以显示组件或页面的视觉差异。
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) 和 [WebPageTest](https://www.webpagetest.org/) 可以把性能结果放进持续集成。

AI 可以解释这些结果、提出修复并补测试，但“是否允许合并”应由明确门禁和责任人决定。尤其在缺少测试的旧项目里，应先建立最小可验证路径，再扩大自动修改范围。

## **III.9.6 权限、审批与追踪组成治理边界**

只读分析、修改文件、运行测试、访问网络、读取凭据和执行部署分属不同风险等级。能力越强的 Agent，越需要分级授权。

| 风险问题 | 应有的工程机制 |
| :--- | :--- |
| Agent 能看到什么？ | 上下文白名单、敏感文件排除、数据最小化 |
| Agent 能做什么？ | 文件与命令权限、沙箱、网络边界 |
| 哪些动作必须停下来？ | 部署、删除、付款、外部消息等敏感动作由人工审批 |
| 出错后怎样恢复？ | 小步 diff、版本控制、可重放测试和明确回滚点 |
| 事后怎样解释？ | 保存关键输入、工具调用、测试结果、审批记录和变更说明 |

[OpenAI Agents SDK 的 human-in-the-loop](https://openai.github.io/openai-agents-python/human_in_the_loop/) 展示了敏感工具调用如何暂停并等待批准；[tracing](https://openai.github.io/openai-agents-js/guides/tracing/) 则说明工具调用、模型生成和 guardrail 等事件为何需要记录。这些机制构成所有自动执行系统都应具备的治理基础。

在前端项目中，AI 还可以辅助发现 RSC 与客户端组件边界、硬编码密钥、Cookie 属性、第三方脚本和埋点风险。但这类输出只是审查线索：安全、隐私和法规结论仍要结合真实数据流、部署配置和责任人的确认。

## **III.9.7 一套可落地的协作顺序**

面对新任务，可以按下面的顺序开始：

1. 用一句话写清用户可见的结果和验收证据。
2. 找出最小相关文件、接口、日志、规则和历史决策。
3. 明确允许的工具、命令、目录和必须审批的动作。
4. 让 Agent 先说明计划，再分小步修改并持续读取反馈。
5. 运行自动检查，观察真实界面，最后由人审查业务与风险。
6. 把重复出现的规则或流程沉淀进仓库并纳入版本控制。

这样使用 AI，开发者负责设定目标、组织信息、设计反馈并承担最终判断。具体工具会更替，这条工程链则长期稳定。
