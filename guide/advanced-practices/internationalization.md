---
title: "V. 高级主题和专业开发最佳实践 / V.9 国际化（internationalization，i18n）和本地化（localization，l10n）：全球化应用程序"
---

# V.9 国际化（internationalization，i18n）和本地化（localization，l10n）：全球化应用程序（*）

当应用面向多语言、多区域用户交付时，界面不仅要切换文案，还要按目标地区的语言语法、阅读方向和区域约定呈现内容。真正的国际化远不止“翻译文案”，它涵盖**文本提取、ICU（International Components for Unicode）消息语法（复数、语法性别、条件分支）、数字与货币格式化、时区与日历体系，以及 RTL（从右到左）双向排版**等一系列工程能力。

## **V.9.1 现代国际化的核心工程要素**

1. **ICU 消息格式（ICU Message Format）**：用于处理自然语言中复杂的**复数形式（Pluralization）** 和 **动态分支选择（Select）**。例如英文只区分单复数（1 item / 2 items），俄语、波兰语等斯拉夫语族语言的复数形式则有多种，因此应依赖 ICU 规则，而不是硬编码 `count > 1 ? 's' : ''`。
2. **原生 [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) API 体系**：无需加载庞大的第三方 JS 库，浏览器原生提供了一组区域化格式化 API：
   - `Intl.NumberFormat`：货币符号、千分位、百分比与度量单位；
   - `Intl.DateTimeFormat`：日期时间格式、农历/伊斯兰历等日历，以及按指定时区（`timeZone`）显示；
   - `Intl.RelativeTimeFormat`：“3 天前”“in 2 hours”这类相对时间；
   - `Intl.PluralRules`：返回某个数字在目标语言中的复数类别（`one`、`few`、`many`、`other` 等），是选择复数文案的基础；
   - `Intl.ListFormat`：符合目标语言语法的列表连词（如 "A, B, and C" 与 "A、B 和 C"）；
   - `Intl.Segmenter`：按语言规则对中文、日文等不用空格分词的文本进行分词与断句。
3. **RTL（从右到左）与 CSS 逻辑属性**：针对阿拉伯语（Arabic）、希伯来语（Hebrew）等 RTL 语言，必须使用现代 CSS 逻辑属性（如 `margin-inline-start` 替代 `margin-left`、`inset-inline-end` 替代 `right`），配合 `<html dir="rtl">` 声明书写方向，让布局自动镜像。

## **V.9.2 主流国际化库选型对比**

- [**FormatJS（react-intl）**](https://formatjs.io/)：严格遵循 [ICU](https://icu.unicode.org/) 与 [Unicode CLDR](https://cldr.unicode.org/)（Common Locale Data Repository，通用区域数据仓库）的实现，适合对多语言语法准确性要求很高的大型全球化产品。
- [**react-i18next**](https://react.i18next.com/)：插件生态丰富的 React 国际化方案，支持插件化加载翻译字典、嵌套插值、命名空间分割与懒加载。
- [**vue-i18n**](https://vue-i18n.intlify.dev/)：Vue 生态最常用的国际化方案，与 Vue 响应式系统和编译时优化深度结合。
- [**Intlayer**](https://intlayer.org/)：强类型、声明式的 i18n 与多语言内容管理方案，支持 TypeScript 编译期字典类型推断与服务端渲染（SSR）。

下表从框架兼容性、规范遵循度与适用场景对比了这四类方案：

| 库名称 | 框架兼容性 | 核心特性与机制 | 学习成本 | 规范遵循度 | 典型适用场景 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [**FormatJS**](https://formatjs.io/) | React / 原生 JS | 严格遵循 ICU 消息规范，基于标准 Intl API | 中等 | 高（遵循 CLDR） | 企业级全球化产品、严谨文本排版系统 |
| [**react-i18next**](https://react.i18next.com/) | React | 庞大插件生态、按路由动态分包加载语言包 | 较低 | 良好 | 中大型 React 业务应用、多模块全栈项目 |
| [**vue-i18n**](https://vue-i18n.intlify.dev/) | Vue 3 / Nuxt | 响应式多语言切换、SFC 单文件组件多语言块 | 较低 | 良好 | Vue / Nuxt 生态默认首选 |
| [**Intlayer**](https://intlayer.org/) | React / Next.js / Vue | 字典的 TypeScript 类型推导、内容与组件就近声明 | 中等 | 良好 | 现代全栈元框架项目、注重类型安全的代码库 |

::: details 示例：硬编码拼接反模式 vs 原生 Intl 与逻辑属性

**反模式：硬编码字符串拼接与物理方向 CSS（无法处理复数与多语言语序）**
```ts
// 错误：中文语序与英文语序不同，且无法处理英文的 items 单复数差异
function formatItemCountBad(count: number, price: number) {
  return `You have ${count} item(s) in cart, total $${price.toFixed(2)}`;
}
```

```css
/* 错误：在 RTL (从右到左) 语言下，图标仍然在左侧，导致阅读混乱 */
.cart-icon {
  margin-right: 8px;
  float: left;
}
```

**推荐实践：结合原生 Intl 格式化与 CSS 逻辑属性**
```ts
// 英文只有 one/other 两类，俄语、阿拉伯语等还有 few/many/two/zero，
// 统一交给 Intl.PluralRules 选择类别，避免硬编码 count === 1
const enPluralRules = new Intl.PluralRules("en-US");
const enItemWords: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: "item",
  other: "items",
};

const messages = {
  "zh-CN": {
    orderSummary: (name: string, count: number) => `尊敬的 ${name}，您的购物车共有 ${count} 件商品`,
  },
  "en-US": {
    orderSummary: (name: string, count: number) => {
      const noun = enItemWords[enPluralRules.select(count)] ?? enItemWords.other;
      return `Dear ${name}, you have ${count} ${noun} in your cart`;
    },
  },
} as const;

type SupportedLocale = keyof typeof messages;

export function formatOrderSummary(
  locale: SupportedLocale,
  userName: string,
  itemCount: number,
  total: { amount: number; currency: string }, // 币种来自订单数据，如 "CNY"、"USD"
  orderDate: Date
) {
  // 1. 语言文案插值
  const summaryText = messages[locale].orderSummary(userName, itemCount);

  // 2. 本地化货币与数字：locale 只决定显示格式，不决定币种
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: total.currency,
  });
  const formattedPrice = currencyFormatter.format(total.amount);

  // 3. 本地化日期时间
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const formattedDate = dateFormatter.format(orderDate);

  return {
    summary: summaryText,
    price: formattedPrice,
    date: formattedDate,
  };
}
```

```css
/* 正确：使用 CSS 逻辑属性自适应 LTR 与 RTL */
.cart-widget {
  display: flex;
  align-items: center;
  /* 逻辑内边距：在 LTR 下是 padding-left，在 RTL 下自动变为 padding-right */
  padding-inline-start: 1rem;
}

.cart-icon {
  /* 逻辑外边距：确保在任何书写方向下都与文本保持逻辑间距 */
  margin-inline-end: 0.5rem;
}
```

这个示例的思路是：语序交给结构化字典，数值、货币和日期交给原生 `Intl` API，布局使用 CSS 逻辑属性。这样只需较少的代码改动，就能支持更多语言和地区。

:::
