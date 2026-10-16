---
title: "II. 基础 Web 技术：核心支柱 / II.3 CSS：样式和布局"
---

# II.3 CSS：样式和布局

## **II.3.1 基础：选择器、层叠、优先级、继承**

CSS（层叠样式表）用于为网页设置样式和布局，控制外观、颜色、字体和定位。标签、类和 ID 选择器将样式应用于目标 HTML 元素。

- **层叠**决定了多个规则针对同一元素时，样式如何按来源、重要性和顺序应用。
- **优先级**（specificity）是浏览器根据选择器构成（ID、类、标签等）计算出的权重，决定了多个选择器针对同一元素时哪条规则生效。
- **继承**是指属性可以从父元素继承到其子元素。

理解层叠、优先级和继承至关重要，因为 CSS 是声明式的：元素的最终样式不由某一条规则决定，而是所有匹配规则按层叠、优先级和继承计算出的结果。误解这些概念，就会遇到难以预测的样式行为和“样式覆盖问题”。

## **II.3.2 盒模型：理解元素尺寸**

每个 HTML 元素都呈现为一个矩形盒子，由内容、内边距、边框和外边距组成；相邻块级元素的垂直外边距还可能发生折叠，合并为其中较大的值。盒模型是 CSS 布局的基本心智模型，不理解它，就无法准确预测或控制元素大小和间距。

## **II.3.3 现代布局技术：Flexbox 和 CSS Grid**

[**Flexbox**](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)（弹性盒布局）是一种一维布局方法，用于在行或列中排列项目，实现灵活的对齐和空间分配。

**CSS Grid Layout** 是一种二维布局系统，用于设计复杂的响应式 Web 布局。

## **II.3.4 常见内容样式：文本、图片、表单和表格**

除了布局，还要能稳定地处理日常内容的样式。

- **文本与排版**：字体族、字号、行高、段落间距、列表样式和链接状态决定了页面的基础可读性。正文排版应优先服务阅读节奏，再根据品牌风格补充视觉装饰。
- **图片与媒体**：常用 `max-width: 100%`、`height: auto` 让图片适应容器；需要固定比例时，可使用 `aspect-ratio` 建立稳定尺寸，保持加载前后的布局稳定。
- **表单样式**：输入框、选择器、复选框、单选框、按钮和错误提示应保持 focus、hover、disabled、invalid 状态清晰可辨。自定义样式应保留键盘焦点，并结合文本、颜色和图标表达错误。
- **表格样式**：数据表格需要清楚的表头、行列间距、边框或分隔线。移动端表格要考虑横向滚动、列优先级或卡片化转换，让内容在窄屏下仍然可读。

这些基础样式是工程质量的一部分。很多“组件不好用”的问题，源头常在原生控件状态、排版和无障碍处理上。

## **II.3.5 响应式设计：媒体查询、容器查询和移动优先原则**（*）

响应式设计确保网页在各种设备和屏幕尺寸上都能良好呈现。

- **媒体查询**是 CSS 技术，用于根据设备特性（例如屏幕宽度、高度、方向）应用不同的样式。
- **容器查询（Container Queries）**根据**父容器**的尺寸调整组件自身的布局。
  - 传统的媒体查询无法感知组件**所在的上下文**。例如，同一个“卡片组件”既可能出现在宽敞的主内容区，也可能出现在狭窄的侧边栏。
  - 使用 `@container`，组件可以根据所在父容器的宽度自动调整样式，实现**组件级响应式**。这样，同一个组件放进不同宽度的区域都能自行适配，不必为每种页面布局单独写一套样式。
- **移动优先**是一种设计策略：从最小的屏幕开始设计，然后向上扩展。写法上先写适用于小屏的基础样式，再用 `min-width` 媒体查询为更大的屏幕逐步追加样式。

移动优先随移动端访问量的增长而普及：先在受限环境下保证核心内容和功能，再为更大的屏幕逐步增强，响应式设计也更容易落地。

::: details 示例：页面响应式与组件响应式解决不同问题

同一张商品卡可能出现在主内容区，也可能出现在窄侧栏。媒体查询只知道视口宽度，容器查询能知道组件实际获得了多少空间。

```html
<section class="card-slot">
  <article class="product-card">
    <img src="/shoe.jpg" alt="灰色跑鞋">
    <div>
      <h2>城市跑鞋</h2>
      <p>轻量鞋面，适合日常慢跑。</p>
    </div>
  </article>
</section>
```

<CodeCompare left-title="媒体查询：跟随页面" right-title="容器查询：跟随组件">
<template #left>

```css
.product-card {
  display: grid;
  gap: 1rem;
}

@media (min-width: 48rem) {
  .product-card {
    grid-template-columns: 10rem 1fr;
  }
}
```

</template>
<template #right>

```css
.card-slot {
  container-type: inline-size;
}

.product-card {
  display: grid;
  gap: 1rem;
}

@container (min-width: 32rem) {
  .product-card {
    grid-template-columns: 10rem 1fr;
  }
}
```

</template>
</CodeCompare>

判断方式是：页面导航、整体栅格等宏观变化通常看视口；可复用组件需要根据自身插槽宽度变化时，优先考虑容器查询。

:::

## **II.3.6 调试 CSS：从结果反推规则**

CSS 调试的核心是回答三个问题：规则有没有匹配？匹配后有没有被覆盖？最终计算值为什么是这样？

常用方法包括：

- 在 DevTools 的 Elements / Styles 面板查看选择器匹配、失效声明、变量取值和最终计算值（Computed）。
- 用盒模型图检查内容、padding、border、margin 的真实尺寸，定位溢出、间距异常和外边距折叠。
- 临时切换伪类状态，如 `:hover`、`:focus`、`:focus-visible`、`:active`，确认交互状态是否完整。
- 用 Layout、Flexbox、Grid 调试工具观察对齐、轨道、gap 和容器尺寸。
- 当样式难以覆盖时，优先检查层叠来源、加载顺序、优先级和层叠层（cascade layers，即 `@layer`），再决定是否需要提高规则的优先级。

调试 CSS 就是依靠浏览器呈现的事实，逐步缩小问题范围。

## **II.3.7 组织 CSS：从能写到能维护**

小页面可以靠少量选择器完成样式；一旦进入真实项目，就需要有意识地组织 CSS。

- **基础层**：重置或规范化样式、全局字体、颜色变量、排版规则。
- **布局层**：页面栅格、容器、间距系统、响应式断点。
- **组件层**：按钮、表单、卡片、弹窗、导航等可复用 UI。
- **工具层**：少量单用途工具类，例如隐藏文本、视觉隐藏、间距辅助。

良好的组织方式应让样式来源可预测、命名可读、覆盖关系简单。无论后续选择 BEM、CSS Modules、原子化 CSS 还是 CSS-in-JS，这些基本分层意识都是共同基础。

## **II.3.8 现代 CSS 逻辑、交互与动画**

随着浏览器引擎的演进，CSS 已能处理逻辑判断、感知状态、驱动高性能动画。许多过去依赖 JavaScript 的效果，现在可以用纯 CSS 实现，通常也更省性能。

- **逻辑选择器与原生嵌套**：
  - **`:has()`（关系伪类，常被称为“父选择器”）**：根据**子元素的状态**控制父元素或兄弟元素的样式。例如，`form:has(input:invalid)` 可以直接在 CSS 中实现“输入框内容无效时改变表单背景”，无需 JS 介入。
  - **原生嵌套（CSS Nesting）**：浏览器现已原生支持类似 Sass/Less 的嵌套语法，允许开发者直接在 CSS 中编写层级清晰的代码，减少了对 Sass 等预处理器的依赖。

- **[视图过渡（View Transitions API）](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)**：
  - 提供了一种原生机制来创建平滑的 DOM 状态切换动画。浏览器会截取新旧状态的画面并生成过渡效果（如元素形变、淡入淡出），无需复杂的 JS 动画库，但需要开发者显式开启：单页应用（SPA）用 `document.startViewTransition()` 包裹 DOM 更新；同源多页应用（MPA）在新旧两个页面都声明 `@view-transition { navigation: auto; }`。
  - 同文档过渡已进入 Baseline，跨文档过渡尚未进入 Baseline，宜作为渐进增强使用：

    ```js
    // 不支持时直接更新 DOM，功能不受影响
    if (document.startViewTransition) {
      document.startViewTransition(() => renderNextView());
    } else {
      renderNextView();
    }
    ```

- **原生弹层与进入离开动画（Popover API & `@starting-style`）**：
  - **[Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)**（Baseline）：通过 HTML `popover` 属性与 `popovertarget` 按钮原生实现气泡卡片、抽屉与下拉菜单。弹层由浏览器放在顶层图层（Top Layer）中渲染，自带按 Esc 关闭、点击外部区域关闭（Light Dismiss）以及无障碍焦点回退能力，不必再靠 `z-index: 9999` 这类层级竞争保证弹层在最上方。
  - **`@starting-style` 与离散属性过渡**（Baseline）：解决了长期存在的“元素从 `display: none` 变为 `block` 时无法触发 CSS transition 进场动画”的问题，允许定义元素挂载时的初始样式帧。

- **CSS 锚点定位与强类型变量（Anchor Positioning & `@property`）**：
  - **[CSS Anchor Positioning API](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)**：通过 `anchor-name` 与 `position-anchor`，在纯 CSS 层面将浮动元素（Tooltip、下拉浮层）声明式锚定到页面任意参照物上，配合 `position-try-fallbacks` 自动处理边缘碰撞翻转，无需引入 JavaScript 坐标计算库。
  - **强类型 CSS 变量注册（`@property`）**（Baseline）：允许显式声明 CSS 自定义属性的语法类型（如 `<color>`、`<percentage>`、`<length>`）、继承行为与初始值，未注册的 CSS 变量只能整体替换、无法平滑过渡；注册类型后，渐变色角度、颜色值等变量就能直接参与 CSS transition 和关键帧（keyframes）动画。
  - **主题配色函数 `light-dark()`**（Baseline）：根据当前 `color-scheme` 在一处同时声明浅色和深色两套颜色（如 `color: light-dark(#1a1a1a, #ffffff)`），省去不少为深色模式重复编写的样式。

- **[滚动驱动动画（Scroll-driven Animations）](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)**：
  - 允许将动画进度直接绑定到**滚动容器的滚动位置**，而非时间流逝。
  - **性能优势**：当动画只改变 `transform`、`opacity` 等可合成属性时，浏览器可以把它放到**合成线程（Compositor Thread）** 上运行，即使 JavaScript 占满主线程，视差滚动、阅读进度条等效果依然流畅。动画 `width`、`height`、`top` 等布局属性时仍需主线程参与，不具备这一优势。
  - 截至 2026 年 10 月该能力尚未进入 Baseline，可用 `@supports (animation-timeline: scroll())` 做渐进增强。

## **II.3.9 高级样式：单位（rem、em、vw/vh）、函数（clamp()、calc()）**

借助各种单位（rem、em、vw、vh）和函数（clamp()、calc()），CSS 可以动态、响应式地定义属性值。

- **rem**（根 em）和 **em** 相对于字体大小，而 **vw**（视口宽度）和 **vh**（视口高度）相对于视口尺寸。

- **calc()** 支持数学表达式，而 **clamp()** 将值限制在上下限之间。借助这些高级单位和函数，开发者无需过度依赖 JavaScript 做布局，就能创建高度动态、适应性强的设计，从而提高性能和可维护性。

## **II.3.10 BEM（Block、Element、Modifier）命名规范：告别 CSS 混乱**

[BEM](https://getbem.com/) 不仅是一种命名约定，更是一种前端开发的思维方法，旨在将混乱的 CSS 样式转化为清晰、可维护的组件化结构。你可以把它想象成给前端组件制定的一套“身份证编码规则”。

在大型项目中，如果没有统一规范，CSS 样式很容易互相干扰，造成所谓的“样式污染”。开发者为了覆盖已有样式，往往需要写出越来越复杂的选择器，陷入“优先级战争”，最终造成 `!important` 满天飞的乱象。BEM 用结构化的命名模式为每个组件创建独立的“命名空间”，能有效避免这些问题，让样式的作用范围更可预测。

### **核心构成**

- **Block - 块（`block`）**
  - **定义：** 一个独立的、可在项目中任意位置复用的页面组件。可以把它想象成一块乐高积木，比如“搜索表单”“产品卡片”或“导航菜单”。它自身完整且有意义。

- **Element - 元素（`__element`）**
  - **定义：** 块的组成部分，在语义上从属于块，意义依附于块的上下文。如果“产品卡片”是块，那么“卡片标题”“卡片图片”和“购买按钮”就是元素。
  - **命名规则：** 元素名称用**双下划线（`__`）** 与所属的块连接。例如 `card__title`。

- **Modifier - 修饰符（`--modifier`）**
  - **定义：** 用来描述块或元素的外观、状态或行为的“标志”或“形容词”，定义组件的变体。
  - **命名规则：** 修饰符名称用**双连字符（`--`）** 与所修饰的块或元素连接。
  - **示例：**
    - 修饰块：比如普通的 `card` 组件可以有一个“特别推荐”版本，称为 `card--featured`。
    - 修饰元素：比如 `card__button` 默认是灰色，但可以有一个“主要”状态，称为 `card__button--primary`。或者菜单项 `menu__item` 可以有“当前激活”状态，即 `menu__item--active`。

### **核心优势**

- **结构清晰：** 仅通过阅读类名，就能直观地理解 UI 元素的结构和组件间的从属关系。
- **高可读性：** 类名本身就成了一种文档，清晰传达组件的功能和状态。
- **易于维护：** 所有样式都基于单一的类选择器，选择器结构保持扁平，样式覆盖和修改也更简单安全。

<BadGoodExample bad-title="靠提高优先级抢样式" good-title="让组件状态显式可见">
<template #bad>

```css
#shop .products article.card h3 {
  color: var(--text-color);
}

#shop .products article.card.featured h3 {
  color: var(--accent-color) !important;
}
```

</template>
<template #good>

```css
@layer components {
  .product-card__title {
    color: var(--text-color);
  }

  .product-card--featured .product-card__title {
    color: var(--accent-color);
  }
}
```

</template>
</BadGoodExample>

```html
<article class="product-card product-card--featured">
  <h3 class="product-card__title">本周推荐</h3>
</article>
```

判断方法是：如果一次普通状态变化需要增加 ID、继续加深选择器或引入 `!important`，通常说明组件边界和状态命名需要进一步明确。BEM 只给需要独立样式或状态控制的元素命名。

