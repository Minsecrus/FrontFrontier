---
title: "V. 高级主题和专业开发最佳实践 / V.9 国际化 (internationalization, i18n) 和本地化 (localization, l10n)：全球化应用程序"
---

# V.9 国际化 (internationalization, i18n) 和本地化 (localization, l10n)：全球化应用程序

**目的**：设计和准备应用程序，使其能在世界各地的不同区域和语言中使用。

- **关键方面**：
  - **文本翻译**：管理和显示多种语言的文本。
  - **RTL（从右到左）布局**：使用 CSS direction: rtl，为从右到左书写的语言（例如，阿拉伯语、希伯来语）实现布局。
  - **日期/数字/货币格式**：使用 JavaScript 的原生 [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) API（Intl.DateTimeFormat、Intl.NumberFormat），根据区域约定本地化度量单位、日期、时间、数字和货币。
  - **时区和日历**：处理时区差异和各种日历系统。
- **库**：
  - [**react-i18next**](https://react.i18next.com/)：功能丰富，基于 [i18next](https://www.i18next.com/)，支持嵌套翻译、复数，以及通过 Intl 对象本地化格式化。
  - [**vue-i18n**](https://vue-i18n.intlify.dev/)：为 Vue.js 应用程序提供基本功能，力求在 Vue 的响应式系统中直观高效。
  - **FormatJS ([react-intl](https://formatjs.io/docs/react-intl/))**：一套 i18n 库，高度关注标准（[ICU](https://icu.unicode.org/) 消息语法、[Unicode CLDR](https://cldr.unicode.org/)）。
  - [**Intlayer**](https://intlayer.org/zh) 是现代国际化（i18n）和内容管理解决方案（CMS），支持 React、Next.js、Vue 等框架。AI 驱动，提供类型安全的多语言内容管理、SSR 支持、字典格式（JSON/Markdown）和无缝集成。降低 i18n 的复杂性（如嵌套翻译、复数），适用于多语言应用。比传统库更灵活、可扩展。

国际化不仅仅是简单的文本翻译，还涉及格式与布局中的文化差异。利用 [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) 等原生浏览器 API 格式化日期/数字/货币是最佳实践，相比自定义实现能提高性能、减小包体积，直接影响全球市场覆盖与用户满意度。

## **表格：流行国际化库比较**

| 库名称                                          | 框架兼容性                  | 功能（示例）                                                                                         | 灵活性 | 学习曲线 | 性能/包大小 | 标准遵循 |
| :---------------------------------------------- | :-------------------------- | :--------------------------------------------------------------------------------------------------- | :----- | :------- | :---------- | :------- |
| [**react-i18next**](https://react.i18next.com/) | [React](https://react.dev/) | 嵌套翻译，复数，语言检测，日期/数字格式化                                                            | 高     | 中等     | 较大        | 良好     |
| [**vue-i18n**](https://vue-i18n.intlify.dev/)   | [Vue](https://vuejs.org/)   | 消息格式化，复数，日期/时间本地化                                                                    | 良好   | 较低     | 良好        | 良好     |
| [**FormatJS**](https://formatjs.io/)            | [React](https://react.dev/) | [ICU](https://icu.unicode.org/) 消息语法，[Unicode CLDR](https://cldr.unicode.org/)，日期/数字格式化 | 良好   | 中等     | 较小        | 优秀     |

此表帮助学习者根据所选框架和具体的本地化需求选择合适的 i18n 库，并强调了全面的国际化远不止简单的字符串替换。

## **V.9.1 用 Intl 和消息目录处理真实显示**

国际化代码应把消息、日期、数字和货币格式化拆开管理：

```ts
const messages = {
  zh-CN: { welcome: "欢迎，{name}" },
  en-US: { welcome: "Welcome, {name}" },
} as const;

type Locale = keyof typeof messages;

export function formatOrder(locale: Locale, name: string, amount: number, date: Date) {
  const message = messages[locale].welcome.replace("{name}", name);
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "zh-CN" ? "CNY" : "USD",
  }).format(amount);
  const when = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

  return `${message}：${money}，${when}`;
}
```

验证时至少覆盖长文本、复数、RTL 布局、日期时区、货币小数位和回退语言。消息目录的 key 应保持稳定，翻译缺失时记录诊断信息并显示可理解的回退内容。

