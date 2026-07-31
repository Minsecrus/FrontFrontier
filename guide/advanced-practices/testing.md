---
title: "V. 高级主题和专业开发最佳实践 / V.8 测试策略：确保代码质量和可靠性"
---

# V.8 测试策略：确保代码质量和可靠性

**目的**：验证软件功能是否符合预期，及早发现错误，并确保代码质量和可维护性。

- **测试类型**：
  - **单元测试**：独立测试单个函数或组件。
  - **集成测试**：测试多个组件或模块之间的交互。
  - **端到端 (E2E) 测试**：模拟用户与整个应用程序的真实交互。
- **框架和库**：
  - [**Jest**](https://jestjs.io/)：Facebook 开发的流行 JavaScript 测试框架，提供测试运行器、断言工具、模拟和代码覆盖率。
  - [**Vitest**](https://vitest.dev/)：基于 Vite 构建的快速增长的替代方案，支持 ESM、TypeScript 和即时更新。在观察模式下通常比 Jest 快 10-20 倍。
  - [**Cypress**](https://www.cypress.io/)：专注于 JavaScript 应用程序，提供实时反馈、交互式 GUI 和时间旅行调试。在单个浏览器选项卡中运行测试。
  - [**Playwright**](https://playwright.dev/)：支持跨浏览器和移动测试，多种语言（JS/TS、Python、C#、Java）和并行测试执行。在真实设备上运行测试。
  - **Testing Library**：轻量级解决方案，通过模拟用户查找节点的方式来查询它们，鼓励良好的测试实践，把测试重点放在用户可感知的功能行为上。
- **视觉回归测试**：比较应用程序 UI 在不同版本间的视觉外观，确保没有意外的视觉更改。工具包括 Chromatic (用于 Storybook) 和 Percy (一体化平台)。

从 Jest 到 Vitest 的转变，凸显了行业对更快开发反馈循环的持续追求，这也直接影响了开发者生产力。Cypress 和 Playwright 之间的选择，体现了易用性/以 JS 为中心与跨浏览器/语言多功能性之间的权衡。全面的测试（单元、集成、E2E、视觉回归）是保障代码质量的关键手段，有助于减少技术债务并提升用户信任。

::: details 启发式示例：Testing Library 用户视角测试

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { SubscribeForm } from "./SubscribeForm";

test("submits an email address", async () => {
  const user = userEvent.setup();

  render(<SubscribeForm />);

  await user.type(screen.getByLabelText("Email"), "me@example.com");
  await user.click(screen.getByRole("button", { name: "Subscribe" }));

  expect(screen.getByText("Thanks for subscribing")).toBeInTheDocument();
});
```

这个测试按用户能感知的 label、button name 和反馈文本来断言，避免把断言绑定到 `.input-primary` 等实现细节。Testing Library 的启发是：测试行为和可访问名称。

:::

::: details 启发式示例：Playwright 登录流程

```ts
import { expect, test } from "@playwright/test";

test("user can sign in", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("me@example.com");
  await page.getByLabel("Password").fill("correct-horse-battery-staple");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
```

Playwright 适合覆盖跨页面、真实浏览器、真实路由和网络边界。它验证完整用户流程，并观察页面最终呈现和网络行为。

:::

## **表格：流行测试框架比较**

| 框架名称                                  | 类型（示例）    | 速度       | 浏览器支持（示例）                                                                                                                                   | 语言支持（示例）                                          | 模拟能力                                | 调试工具             | 社区/生态系统 | 理想用例（示例）                                         |
| :---------------------------------------- | :-------------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- | :-------------------------------------- | :------------------- | :------------ | :------------------------------------------------------- |
| [**Jest**](https://jestjs.io/)            | 单元、集成、E2E | 良好，可靠 | Chrome, [Firefox](https://www.mozilla.org/en-US/firefox/new/), [Edge](https://www.microsoft.com/en-us/edge)                                          | JavaScript, [TypeScript](https://www.typescriptlang.org/) | 强大，内置                              | 报告，快照，调试器   | 庞大，成熟    | 任何 JavaScript 项目，大型应用                           |
| [**Vitest**](https://vitest.dev/)         | 单元、集成      | 极速       | Chrome, [Firefox](https://www.mozilla.org/en-US/firefox/new/), [Edge](https://www.microsoft.com/en-us/edge)                                          | JavaScript, [TypeScript](https://www.typescriptlang.org/) | 类似 [Jest](https://jestjs.io/)，更现代 | 浏览器 GUI，错误报告 | 正在增长      | [Vite](https://vitejs.dev/) 项目，注重速度和现代 JS 特性 |
| [**Cypress**](https://www.cypress.io/)    | E2E             | 良好       | Chrome, [Firefox](https://www.mozilla.org/en-US/firefox/new/), [Edge](https://www.microsoft.com/en-us/edge)                                          | JavaScript                                                | 实时，内置                              | GUI，时间旅行调试    | 较大，成熟    | JavaScript 密集型前端应用，实时反馈                      |
| [**Playwright**](https://playwright.dev/) | E2E             | 极速       | Chrome, [Firefox](https://www.mozilla.org/en-US/firefox/new/), [Safari](https://www.apple.com/safari/), [Edge](https://www.microsoft.com/en-us/edge) | JS/TS, Python, C#, Java                                   | 强大，并行                              | 强大，需高级技能     | 正在增长      | 复杂集成场景，跨浏览器/设备测试，并行执行                |

这个表格有助于学习者理解不同测试工具各自擅长什么。它还能帮助你做出有依据的选择，构建一个覆盖应用程序质量各方面的健壮测试策略，从单个组件到完整用户流程和视觉完整性。
