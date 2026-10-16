---
title: "V. 高级主题和专业开发最佳实践 / V.3 Web 无障碍（A11y）：为所有用户提供包容性设计"
---

# V.3 Web 无障碍（A11y）：为所有用户提供包容性设计（*）

Web 应用的用户并不总是使用鼠标和高分辨率显示器：视障用户依赖屏幕阅读器朗读 DOM 语义，运动障碍或高效键盘用户依赖 `Tab` 键和焦点指示器完成全流程操作，弱视与色觉障碍用户则依赖足够的对比度与非颜色线索。Web 无障碍（Accessibility，简称 A11y）的目标是消除这些交互障碍，确保界面在各种感官通道与辅助技术下均可正常访问。

在标准与合规层面，工程团队需要关注以下基线：

- **WCAG 2.2**：本节以 [WCAG 2.2](https://www.w3.org/TR/WCAG22/) 为主要参照。它补充了焦点不被遮挡、焦点外观、拖拽替代、目标尺寸、重复输入和可访问身份验证等成功标准。
- **法律合规要求**：
  - **[欧洲无障碍法案（EAA - Directive 2019/882）](https://commission.europa.eu/news-and-media/news/eu-becomes-more-accessible-all-2025-07-31_en)**：自 **2025 年 6 月 28 日起已在全欧盟范围内强制执行**。所有面向欧盟消费者提供服务的商业 Web 应用（电商、银行、旅游、媒体、SaaS 等）必须严格符合 **EN 301 549 / WCAG 2.1 AA 级**标准，不合规者面临巨额民事罚款与市场准入禁令。无障碍已从传统的“道德关怀”上升为企业必须满足的**法定合规底线**。
  - ISO 已将 WCAG 2.2 批准为国际标准 **[ISO/IEC 40500:2025](https://www.w3.org/press-releases/2025/wcag22-iso-pas/)**；美国（ADA Title II/III 相关司法裁判）与中国（《无障碍环境建设法》）也在加强对数字界面无障碍与适老化的合规审查。
- **下一代标准**：[WCAG 3.0](https://www.w3.org/TR/wcag-3.0/) 仍处于 Working Draft 阶段，当前项目以 WCAG 2.2 为主要合规参照，WCAG 3.0 适合作为观察材料。

在日常研发中，无障碍保障主要落脚于四个具体维度（这些改进同样能提升普通用户的键盘效率与强光环境可读性）：

- **关键原则**：确保所有功能都可通过键盘操作，焦点可见且有意义，内容可被辅助技术理解。
- **屏幕阅读器**：把屏幕上的文字和界面信息朗读出来的软件（如 [NVDA](https://www.nvaccess.org/)、[JAWS](https://www.freedomscientific.com/products/software/jaws/)、[VoiceOver](https://www.apple.com/voiceover/info/guide/_1121.html)），对视障用户至关重要。常见故障包括链接缺少可识别名称、图像缺少 `alt` 文本以及标题层级跳跃。
- **键盘导航**：所有交互元素都必须能仅凭键盘完成操作；焦点移动顺序应与视觉布局一致，且当前焦点位置始终清晰可见。
- **颜色对比度**：确保文本（普通文本 4.5:1，大文本 3:1）和非文本元素对比度达标，兼顾弱视或色盲用户。状态和错误提示不能仅靠颜色区分，必须同时提供文本、图标、形状或位置等辅助线索。

下表列出了 WCAG 2.2 新增的关键成功标准及其对应的工程要求：

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

仅添加 ARIA 属性并不能保证真实可用，必须结合辅助技术与自动化工具做分层验证。常见的屏幕阅读器包括 Windows 上免费开源的 [NVDA](https://www.nvaccess.org/)（NonVisual Desktop Access）与商业软件 [JAWS](https://www.freedomscientific.com/products/software/jaws/)（Job Access With Speech）、macOS / iOS 内置的 [VoiceOver](https://www.apple.com/voiceover/info/guide/_1121.html)，以及 Android 内置的 TalkBack。

实操验证通常按以下顺序推进：

- **纯键盘走查**：拔掉鼠标或仅用键盘（`Tab`、`Shift+Tab`、`Enter`、空格、方向键、`Escape`）遍历页面所有交互控件，确认不存在键盘陷阱（焦点进得去出不来）或焦点丢失。
- **屏幕阅读器播报验证**：开启屏幕阅读器按顺序浏览，检查控件是否正确播报了角色（Role）、名称（Name）、状态（State）和当前值（Value）——例如按钮是否被识别为“按钮”，复选框切换时是否播报选中状态，动态更新区域（`aria-live`）是否及时朗读变更。
- **自动化与开发期工具拦截**：在单测和组件测试中结合 [jest-dom](https://github.com/testing-library/jest-dom) 与 [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) 按可访问角色（`getByRole`）查询节点；在浏览器中使用 Chrome Lighthouse 或 Firefox Accessibility Inspector 检查语义树与对比度；条件允许时邀请残障用户参与可用性测试。

由于自动化工具大约只能拦截 30%~50% 的已知规则违规（如缺失 `alt`、对比度不足、无效 ARIA 属性），键盘走查与屏幕阅读器实测不可省略。产品具体需满足哪一级法规标准，应由目标市场、行业类别、客户合同与法务共同确认；工程团队的职责是先把 WCAG 2.2 的成功标准固化到组件库 API、设计走查清单与 CI 自动化测试中。

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
