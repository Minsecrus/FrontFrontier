---
title: "V. 高级主题和专业开发最佳实践 / V.7 组件驱动开发与 Storybook"
---

# V.7 组件驱动开发与 Storybook

直接在完整业务页面中开发和调试 UI 组件，往往受制于长链路上下文：要验证一个结账失败弹窗或表单第三步的校验提示，开发者不得不先登录账号、构造前置购物车数据、走完前两步表单，甚至手动篡改接口响应。组件驱动开发（Component-Driven Development，CDD） 通过“自下而上”的方式解耦这一过程：先在隔离环境中独立构建并验证每个原子组件与业务组件的所有状态，再将它们组装进页面。[Storybook](https://storybook.js.org/) 是落地这一工作流的核心工具。

Storybook 提供了独立于主应用的受控组件沙盒。开发者可以为每个组件编写多个 Story（故事），每个 Story 用确定的 `args`（属性输入）或 Mock 数据锁定组件的一种特定状态。这使 UI 组件脱离主应用的路由、全局状态与后端接口依赖，成为可独立挂载、交互和断言的最小单元。

## V.7.1 核心价值：从“上下文开发”到“隔离开发”

将组件从业务主干中剥离出来开发，主要解决两类工程痛点：

- **缩短深层状态的反馈周期**：针对向导表单第三步的错误提示或权限受限态，无需在主应用中反复手工复现前置步骤，直接用对应的 Story 传入目标状态即可热更新调试。
- **确定性地覆盖极端边界**：接口超时、空列表、超长多语言文本折行、窄视口挤压与并发禁用态等在联调环境中难以稳定触发的边界场景，都可以固化为独立的 Story 随时检视。

::: details 示例：Story 记录可复现状态

下面以 UX 工程章节中的 `ProfileForm` 为例，固定默认态、提交态、错误态和用户交互。Story 直接描述组件输入，不需要先登录、打开设置页再制造接口失败。

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { ProfileForm } from "./ProfileForm";

const meta = {
  component: ProfileForm,
  args: {
    state: { status: "idle" },
    onSubmit: fn(),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.type(canvas.getByLabelText("显示名称"), "Ada");
    await userEvent.click(canvas.getByRole("button", { name: "保存" }));
    await expect(args.onSubmit).toHaveBeenCalledWith("Ada");
  },
};

export const Submitting: Story = {
  args: {
    state: { status: "submitting" },
  },
};

export const ServerError: Story = {
  args: {
    state: {
      status: "error",
      message: "这个名称已经被使用，请换一个。",
    },
  },
};

```

一个 Story 应回答“如何稳定得到这个状态”。默认态之外，优先覆盖 loading、empty、error、disabled、长文本、窄容器和关键交互；只有颜色或间距变化时再依赖视觉回归。`play` 函数适合验证组件内的真实操作，跨路由和跨服务流程仍应交给端到端测试。

:::

## V.7.2 超越文档：“活的”协作与设计系统平台

Storybook 表面上是组件浏览器，更大的价值在于：它连接了团队中的不同角色，也是设计系统落地和演进的基础。

- **交互式的“活文档”**：Storybook 能自动解析组件代码，生成包含 props、事件和源码的交互式文档。团队成员（包括设计师、产品经理、测试工程师）无需理解代码或运行整个项目，就能在浏览器中直接与所有 UI 组件交互，查看其不同变体和响应式行为。这有助于降低沟通成本，让团队对 UI 的理解保持一致。
- **设计系统的一致性保障**：与 Figma 等设计工具结合后，Storybook 成为设计系统的“单一事实来源（Single Source of Truth）”。设计稿中定义的组件规范，在 Storybook 中以代码实现并得到验证。组件的修改会直接反映在 Storybook 中，有助于设计与实现保持同步。

## V.7.3 UI 测试的统一入口

Storybook 以 Story 为单位组织组件状态，很适合作为自动化 UI 测试的平台，让测试在开发早期就能进行。

- **视觉回归测试（Visual Regression Testing）**：这是 Storybook 最常见的用途之一。[Chromatic](https://www.chromatic.com/)、[Percy](https://percy.io/) 这类自动化工具可以直接与 Storybook 集成，为每个 Story 拍摄 UI 快照作为“视觉基线”。代码变更后，工具自动生成新快照，与基线逐像素对比，找出意料之外的视觉变化。
- **交互、无障碍与组件测试**：Storybook 正在朝组件测试工作台演进，同时保留组件展示能力。基于 `play` 函数、Testing Library、a11y 检查，以及 Storybook 9 里更强调的测试体验，你可以直接把交互测试、无障碍测试和覆盖率检查放进以 Story 驱动的工作流中，无需为同一套组件状态在单测和组件预览里重复编写两份挂载代码。

## V.7.4 将交互与无障碍写进 Story

`play` 函数适合描述用户如何使用组件，`a11y` 参数适合把自动化审计放到同一条反馈路径：

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { SearchBox } from "./SearchBox";

const meta = {
  component: SearchBox,
  parameters: {
    a11y: { test: "error" },
  },
} satisfies Meta<typeof SearchBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EnterQuery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("searchbox");

    await userEvent.type(input, "web performance");
    await expect(input).toHaveValue("web performance");
  },
};
```

组件状态应覆盖默认、加载、空结果、错误、禁用、长文本和窄容器。CI 中可以执行 Storybook 构建、组件测试与视觉回归，让组件状态成为稳定的质量资产。
