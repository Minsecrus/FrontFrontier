---
title: "V. 高级主题和专业开发最佳实践 / V.3 Web 无障碍（A11y）：为所有用户提供包容性设计"
---

# V.3 Web 无障碍（A11y）：为所有用户提供包容性设计（*）

**目的**：确保所有用户，包括残障人士，都能有效访问和使用 Web 内容。

- **WCAG 2.2**：本节以 [WCAG 2.2](https://www.w3.org/TR/WCAG22/) 为主要参照。它补充了焦点不被遮挡、焦点外观、拖拽替代、目标尺寸、重复输入和可访问身份验证等成功标准。
- **法律合规要求**：
  - **[欧洲无障碍法案（EAA - Directive 2019/882）](https://commission.europa.eu/news-and-media/news/eu-becomes-more-accessible-all-2025-07-31_en)**：自 **2025 年 6 月 28 日起已在全欧盟范围内强制执行**。所有面向欧盟消费者提供服务的商业 Web 应用（电商、银行、旅游、媒体、SaaS 等）必须严格符合 **EN 301 549 / WCAG 2.1 AA 级**标准，不合规者面临巨额民事罚款与市场准入禁令。无障碍已从传统的“道德关怀”上升为企业必须满足的**法定合规底线**。
  - ISO 已将 WCAG 2.2 批准为国际标准 **[ISO/IEC 40500:2025](https://www.w3.org/press-releases/2025/wcag22-iso-pas/)**；美国（ADA Title II/III 相关司法裁判）与中国（《无障碍环境建设法》）也在加强对数字界面无障碍与适老化的合规审查。
- **下一代标准**：[WCAG 3.0](https://www.w3.org/TR/wcag-3.0/) 仍处于 Working Draft 阶段，当前项目以 WCAG 2.2 为主要合规参照，WCAG 3.0 适合作为观察材料。
- **关键原则**：确保所有功能都可通过键盘操作，焦点可见且有意义，内容可被辅助技术理解。
- **屏幕阅读器**：把屏幕上的文字和界面信息朗读出来的软件（如 [NVDA](https://www.nvaccess.org/)、[JAWS](https://www.freedomscientific.com/products/software/jaws/)、[VoiceOver](https://www.apple.com/voiceover/info/guide/_1121.html)），对视障用户至关重要。常见问题包括链接缺少描述、图像缺少 alt 文本和标题结构不佳。
- **键盘导航**：所有交互元素都必须能仅凭键盘完成操作；焦点顺序应逻辑清晰，焦点应始终可见。
- **颜色对比度**：确保文本（普通文本 4.5:1，大文本 3:1）和非文本元素对比度足够，兼顾弱视或色盲用户。状态和错误信息不能只靠颜色区分，还应借助文本、图标、形状或位置等线索。

无障碍不只是一项功能，它既是法律法规的要求，也是道德责任。遵守 WCAG 能扩大可服务的用户范围，也能改善非残障用户的使用体验，例如良好的键盘导航对所有用户都有益。

**表格：WCAG 2.2 新增的关键成功标准**

| 成功标准                 | 等级 | 做法                             | 重要性                                       |
| :----------------------- | :--- | :------------------------------- | :------------------------------------------- |
| **焦点不被遮挡（最小）** | AA   | 确保键盘焦点元素至少部分可见     | 键盘用户需要看到焦点所在                     |
| **焦点不被遮挡（增强）** | AAA  | 确保键盘焦点元素完全可见         | 键盘用户需要清晰地看到焦点所在               |
| **焦点外观**             | AAA  | 使用大小和对比度足够的焦点指示器 | 许多人难以感知细微视觉变化，需要清晰的指示器 |
| **拖拽动作**             | AA   | 为拖拽提供不依赖拖拽的等价操作   | 触控、运动障碍和键盘用户需要替代路径         |
| **目标尺寸（最小）**     | AA   | 交互目标满足最小尺寸或提供例外   | 减少误触并改善触控操作                         |
| **重复输入**             | A    | 已输入的信息尽量自动填充或可选取 | 降低认知和操作负担                             |
| **可访问身份验证（最小）** | AA | 不把记忆、识别或解题作为唯一通道 | 避免把辅助技术用户排除在登录流程之外           |

## **V.3.1 ARIA 属性的使用**

[WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/)（Web Accessibility Initiative - Accessible Rich Internet Applications）是一套技术规范，通过添加额外的 HTML 属性增强 HTML 语义，从而改善残障人士借助辅助技术（如屏幕阅读器）访问 Web 应用的体验。ARIA 属性不会改变元素的视觉表现，但会改变辅助技术对元素的解释方式。

ARIA 的核心作用有三类：

- **角色（role）**：描述元素是什么或做什么，例如 `role="button"`、`role="navigation"`、`role="search"`。HTML5 已有许多语义化标签（如 `<nav>`、`<header>`、`<aside>`），ARIA 角色主要用于为非语义化元素补充语义，或在复杂组件中提供更精细的语义。
- **状态（state）**：描述元素的当前状态，例如 `aria-pressed="true/false"`（按钮是否按下）、`aria-checked="true/false"`（复选框是否选中）。
- **属性（property）**：描述元素的特性或与其他元素的关系，例如 `aria-required="true"`（表单输入是否必填）、`aria-labelledby="ID"`（标签文本来自哪个元素）。

用 `<div>` 或 `<span>` 等非语义化元素构建自定义按钮时，需要添加 `role="button"` 声明角色、添加 `tabindex="0"` 使其可聚焦，并用 `aria-pressed` 等状态属性表示状态，再通过 JavaScript 监听点击事件，切换 `aria-pressed` 的状态。涉及复杂表单元素的关联时，若某个输入框的标签由多个元素组成，或标签文本不在 `<label for>` 的直接关联范围内，可以用 `aria-labelledby` 将该输入框与提供标签文本的元素关联起来。`aria-describedby` 用于提供额外描述信息，如输入框的提示或错误信息。聊天消息、通知中心等动态内容区域，则用 `aria-live` 属性告知屏幕阅读器其内容会动态变化。已有原生语义的元素应直接使用内置语义，例如 `<button>` 本身就具备按钮角色。

::: details 示例：button vs div role button

优先使用原生按钮：

```html
<button type="button" aria-pressed="false">
  收藏
</button>
```

如果受限于历史结构，被迫用 `div` 模拟按钮，就必须补齐角色、焦点和键盘行为：

```html
<div role="button" tabindex="0" aria-pressed="false" id="favorite">
  收藏
</div>

<script>
  const favorite = document.querySelector("#favorite");

  favorite.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      favorite.click();
    }
  });
</script>
```

判断原则是：优先使用 `<button>`，历史结构确实需要时再使用 `div role="button"`。ARIA 可以补充语义；键盘行为、禁用状态、表单集成和浏览器默认交互细节需要工程代码明确实现。

:::

## **V.3.2 辅助技术测试方法**

仅添加 ARIA 属性是不够的，必须通过实际测试验证效果。用屏幕阅读器测试是关键步骤。常见的屏幕阅读器包括：Windows 上免费开源的 [NVDA](https://www.nvaccess.org/)（NonVisual Desktop Access）和流行的商业软件 [JAWS](https://www.freedomscientific.com/products/software/jaws/)（Job Access With Speech）；macOS 和 iOS 内置的 [VoiceOver](https://www.apple.com/voiceover/info/guide/_1121.html)；Android 设备内置的 TalkBack。

测试步骤通常包括：仅使用键盘（Tab 键、Enter 键、空格键等）遍历页面所有可交互元素，确保所有功能都可通过键盘访问。启动屏幕阅读器，使用它提供的导航快捷键（如 Tab、Shift+Tab、方向键）按顺序浏览页面内容，听取朗读内容。检查屏幕阅读器是否正确朗读了元素的角色、状态、名称和值。例如，按钮是否朗读为“按钮”，复选框是否朗读选中状态。尝试用屏幕阅读器提供的交互命令（如激活按钮、输入文本、选择下拉菜单项），验证功能是否正常。对动态更新的区域，验证屏幕阅读器是否及时、准确地朗读了变更。最后，尝试在不同浏览器、不同设备上测试，并模拟视力障碍、运动障碍等不同用户场景。

其他测试工具和方法包括：浏览器内置工具，如 Chrome Lighthouse、Firefox Accessibility Inspector，可提供自动化审计和建议。自动化测试库，如 [jest-dom](https://github.com/testing-library/jest-dom) 和 [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)，可以在单元测试和集成测试中检查 DOM 的无障碍属性。由于自动化工具无法发现所有无障碍问题，仍需要有经验的开发者人工审查。最后，邀请残障用户参与测试，获取真实反馈，这是最直接有效的方法。

是否需要满足某项法律要求，应由产品所在市场、服务类别、客户合同和法律顾问共同判断。工程团队可以先把 WCAG 2.2 的成功标准转化为组件 API、设计检查、自动化测试和人工测试，再根据业务范围确认合规责任。

语义化 HTML 是无障碍的基石，ARIA 则是补充和增强。ARIA 属性可以为非语义化元素提供语义，或增强复杂组件的语义。这强调了“优先使用原生 HTML 语义元素”的原则。前端开发者构建 UI 时，需要同时关注视觉呈现和底层 DOM 的语义结构，确保辅助技术能够正确解析和传达信息。这种对“语义优先”的坚持，是构建健壮、可维护且可访问的 Web 应用的基础。

## **V.3.3 把自动化审计接入浏览器测试**

自动化审计适合拦截明显的语义、名称、颜色和结构问题；键盘顺序、焦点体验和屏幕阅读器朗读仍需人工验证。

```ts
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("搜索页满足基础可访问性要求", async ({ page }) => {
  await page.goto("/search");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
  await expect(page.getByRole("searchbox")).toBeVisible();
});
```

axe 的规则标签按 WCAG 版本区分：`wcag2a`、`wcag2aa` 只包含 WCAG 2.0 的规则，按 WCAG 2.2 AA 审计时需要同时列出 `wcag21a`、`wcag21aa`、`wcag22aa`（见 [axe-core 标签列表](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#axe-core-tags)）。运行后应保存失败规则、影响节点和修复链接。手动检查至少覆盖 Tab 顺序、焦点可见性、`Escape` 关闭、错误提示播报和 200% 缩放布局。
