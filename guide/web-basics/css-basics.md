---
title: "II. 基础 Web 技术：核心支柱 / II.3 CSS：样式和布局"
---

# II.3 CSS：样式和布局

## **II.3.1 基础：选择器、层叠、优先级、继承**

CSS（Cascading Style Sheets，层叠样式表）用于控制网页的视觉呈现与空间布局，通过标签、类、属性和 ID 等选择器将样式声明绑定到目标 HTML 元素。

- **层叠（Cascade）**：当多条规则命中同一元素时，浏览器按样式来源、重要性（`!important`）、层叠层（`@layer`）、优先级和源码先后顺序裁决最终生效值。
- **优先级（Specificity）**：浏览器根据选择器构成（ID、类/属性/伪类、标签/伪元素）计算权重，决定同一层叠层级中哪条规则胜出。
- **继承（Inheritance）**：部分属性（如 `color`、`font-family`、`line-height`）在未显式指定时会自动沿用父元素的计算值。

CSS 是声明式语言：元素的最终样式并非由单条规则孤立决定，而是所有匹配规则经层叠、优先级与继承共同计算的结果。排查“样式未生效”或“覆盖失控”时，本质上就是在核对这三项机制的计算顺序。

## **II.3.2 盒模型：理解元素尺寸**

每个 HTML 元素在布局时都表现为一个矩形盒子，由内向外依次为内容区（content）、内边距（padding）、边框（border）和外边距（margin）；相邻块级元素的垂直外边距在常规文档流中还可能发生折叠（margin collapsing），合并为两者中的较大值。元素的实际尺寸计算直接受 `box-sizing`（`content-box` 或 `border-box`）控制，排查尺寸溢出、对齐偏差或意外换行时，首先应核对盒模型四层区域的数值。

## **II.3.3 现代布局技术：Flexbox 和 CSS Grid**

- [**Flexbox**](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)（弹性盒布局）：一维布局模型，擅长沿单一行或单一列分配剩余空间、处理动态尺寸项目的对齐与顺序，适合导航栏、工具条和卡片内部排布。
- **CSS Grid Layout**（网格布局）：二维布局系统，可同时定义行轨道与列轨道，适合页面整体骨架、复杂仪表盘以及需要跨行跨列对齐的响应式网格。

## **II.3.4 常见内容样式：文本、图片、表单和表格**

页面布局搭好后，日常内容与交互控件的稳定性取决于以下细节处理：

- **文本与排版**：字体族、字号、行高、段落间距、列表样式和链接状态决定了正文可读性。排版应先保证舒适的行宽与行高节奏，再叠加视觉装饰。
- **图片与媒体**：常用 `max-width: 100%`、`height: auto` 让媒体元素自适应容器宽度；需要预留固定比例空间时，配合 `aspect-ratio` 或 HTML `width`/`height` 属性锁定宽高比，防止图片加载前后发生布局偏移（CLS）。
- **表单样式**：输入框、下拉框、复选框、单选框、按钮和错误提示必须保留清晰可辨的 `:focus-visible`、`:hover`、`:disabled`、`:invalid` 状态。自定义外观时切勿直接移除键盘焦点轮廓，错误反馈需同时结合文本、颜色与图标。
- **表格样式**：数据表格需要明确的表头区分、单元格内边距与行列分隔线。在移动端窄屏下，应根据数据密度采用横向滚动容器、次要列隐藏或卡片化展示。

## **II.3.5 响应式设计：媒体查询、容器查询和移动优先原则**（*）

响应式设计使同一套页面与组件能够适配不同屏幕尺寸与容器空间：

- **媒体查询（Media Queries）**：根据视口宽度、高度、设备方向或用户偏好（如 `prefers-color-scheme`、`prefers-reduced-motion`）应用不同样式。
- **容器查询（Container Queries）**：根据**父容器**而非整个视口的尺寸调整组件自身布局。
  - 媒体查询只能感知视口宽度，无法获知组件所处的局部容器宽度（例如同一张卡片组件既可能放在宽敞的主内容区，也可能嵌在狭窄的侧边栏）。
  - 使用 `@container` 声明容器查询后，组件可根据所在容器的实际可用宽度自动切换布局，实现真正的**组件级响应式**，无需为不同页面位置重复编写变体样式。
- **移动优先（Mobile-First）**：从受限的小屏环境开始设计核心内容与纵向流式布局，先编写默认基础样式，再通过 `min-width` 媒体查询或容器查询为更宽的屏幕逐步增强多列布局。

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

CSS 调试围绕三个具体问题展开：选择器是否命中目标元素？命中的声明是否被更高优先级的规则覆盖？属性最终计算出的像素值（Computed Value）是多少？

排查时可直接在浏览器 DevTools 中验证：

- 在 Elements → Styles 面板查看命中的规则链、被划掉的失效声明、`var()` 变量解析结果以及 Computed 面板中的最终计算值。
- 利用盒模型视图核对 content、padding、border、margin 的实时像素尺寸，定位宽度溢出、间距异常与外边距折叠。
- 在 `:hov` 状态面板中强制勾选 `:hover`、`:focus`、`:focus-visible`、`:active`，验证交互态样式是否完整。
- 开启 Flexbox 与 Grid 叠加层（Overlay），直观检查主轴/交叉轴对齐、网格轨道划分与 `gap` 间距。
- 遇到样式无法覆盖时，先核对层叠来源、文件加载顺序、选择器权重以及 `@layer` 声明顺序，避免盲目追加选择器层级或 `!important`。

## **II.3.7 组织 CSS：从能写到能维护**

当项目从单页扩展为多模块工程时，可按职责将样式划分为四个层级：

- **基础层（Base / Reset）**：浏览器默认样式重置或规范化、全局字体、颜色与间距的设计变量（Custom Properties）、基础排版规则。
- **布局层（Layout）**：页面级网格、主容器宽度、通用间距系统与宏观响应式断点。
- **组件层（Components）**：按钮、表单控件、卡片、弹窗、导航栏等独立封装的可复用 UI 单元。
- **工具层（Utilities）**：少量单用途辅助类，例如文本截断、仅对屏幕阅读器可见（`sr-only`）或局部间距微调。

无论后续采用 BEM、CSS Modules、原子化 CSS 还是 CSS-in-JS，保持层级职责清晰、样式来源可预测、覆盖方向单向流动，都是避免全局样式失控的前提。

## **II.3.8 现代 CSS 逻辑、交互与动画**

随着浏览器引擎演进，许多过去必须依赖 JavaScript 监听或第三方动画库才能实现的交互与动效，现在可以直接在 CSS 中声明式完成：

- **逻辑选择器与原生嵌套**：
  - **`:has()`（关系伪类，常被称为“父选择器”）**：根据**子元素或后续兄弟元素的状态**反向控制父元素或前序元素样式。例如 `form:has(input:invalid)` 可直接在 CSS 中实现“只要内部存在无效输入就改变表单容器状态”，无需 JS 同步类名。
  - **原生嵌套（CSS Nesting）**：浏览器已原生支持类似 Sass/Less 的选择器嵌套语法，可直接编写层级关系清晰的原样式表。

- **[视图过渡（View Transitions API）](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)**：
  - 原生支持平滑的 DOM 状态切换与页面过渡动画。浏览器会自动捕获旧状态快照与新状态实时画面，并在两者之间生成位置、尺寸与透明度的插值过渡。单页应用（SPA）通过 `document.startViewTransition()` 包裹 DOM 更新开启；同源多页应用（MPA）则在新旧页面同时声明 `@view-transition { navigation: auto; }`。
  - 同文档视图过渡已进入 Baseline，跨文档视图过渡尚未进入 Baseline，生产环境适合作为渐进增强使用：

    ```js
    // 不支持时直接更新 DOM，功能不受影响
    if (document.startViewTransition) {
      document.startViewTransition(() => renderNextView());
    } else {
      renderNextView();
    }
    ```

- **原生弹层与进入离开动画（Popover API & `@starting-style`）**：
  - **[Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)**（Baseline）：通过 HTML `popover` 属性与 `popovertarget` 触发器原生实现气泡卡片、抽屉与下拉菜单。弹层由浏览器直接提升至顶层图层（Top Layer）渲染，天然脱离父级 `overflow: hidden` 裁剪与 `z-index` 层级争夺，并内置按 `Esc` 关闭、点击外部关闭（Light Dismiss）及焦点管理。
  - **`@starting-style` 与离散属性过渡**（Baseline）：配合 `transition-behavior: allow-discrete`，解决了元素从 `display: none` 切换到显示状态时无法触发 CSS `transition` 进场动画的历史难题，可直接定义元素首次渲染时的起始帧样式。

- **CSS 锚点定位与强类型变量（Anchor Positioning & `@property`）**：
  - **[CSS Anchor Positioning API](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)**：通过 `anchor-name` 与 `position-anchor` 在纯 CSS 层面将浮动层（Tooltip、下拉菜单）声明式锚定到触发元素上，并配合 `position-try-fallbacks` 在视口边缘自动翻转避让，无需在 JS 中监听滚动和窗口缩放来重算坐标。
  - **强类型 CSS 变量注册（`@property`）**（Baseline）：显式声明自定义属性的语法类型（如 `<color>`、`<percentage>`、`<length>`）、继承行为与初始值。普通未注册的 CSS 变量只能离散替换；注册类型后，浏览器即可对渐变角度、色值等自定义属性进行插值计算，使其直接参与 `transition` 和 `@keyframes` 动画。
  - **主题配色函数 `light-dark()`**（Baseline）：根据当前生效的 `color-scheme` 在同一条声明中同时指定浅色与深色值（如 `color: light-dark(#1a1a1a, #ffffff)`），减少深色模式下的重复覆写规则。

- **[滚动驱动动画（Scroll-driven Animations）](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)**：
  - 通过 `scroll()`（跟踪滚动容器进度）或 `view()`（跟踪元素进出视口进度）将动画时间轴直接绑定到滚动位置，而非时钟时间。
  - **性能边界**：当动画仅修改 `transform`、`opacity` 等可合成属性时，浏览器可将其交由**合成线程（Compositor Thread）**独立驱动，即使主线程正忙于执行 JavaScript，视差滚动与阅读进度条依然不会掉帧；若动画涉及 `width`、`height`、`top` 等触发布局的属性，则仍需主线程每帧参与计算。
  - 截至 2026 年 10 月该能力尚未进入 Baseline，可通过 `@supports (animation-timeline: scroll())` 做渐进增强。

## **II.3.9 高级样式：单位（rem、em、vw/vh）、函数（clamp()、calc()）**

通过组合相对单位与数学函数，CSS 可以根据字体基准和视口尺寸动态计算属性值：

- **相对字体单位**：`rem` 始终相对于根元素（`<html>`）的字号，适合构建全局统一的间距与字号刻度；`em` 相对于当前元素或父元素的字号，适合让按钮内边距、图标大小随自身文字缩放。
- **视口相对单位**：`vw`、`vh`（以及适配移动端动态工具栏的 `svh`、`dvh`、`lvh`）按视口尺寸的百分比计算，适合全屏横幅与流式容器。
- **数学函数**：`calc()` 支持混合不同单位做四则运算（如 `width: calc(100% - 2rem)`）；`clamp(min, preferred, max)` 将动态首选值钳制在上下限之间（如 `font-size: clamp(1rem, 2.5vw, 1.5rem)`）。组合使用它们即可在纯 CSS 中实现平滑的流式排版（Fluid Typography）与自适应间距，避免用 JavaScript 监听窗口变化计算尺寸。

## **II.3.10 BEM（Block、Element、Modifier）命名规范：告别 CSS 混乱**

在多人协作的大型项目中，缺乏约定的 CSS 选择器极易互相干扰、引发“样式污染”；开发者为了覆盖既有样式不断加深选择器层级，最终陷入“优先级战争”与 `!important` 滥用。[BEM](https://getbem.com/)（Block、Element、Modifier）通过结构化的类名约定为每个组件划分独立命名空间，将选择器保持在扁平的单类级别，使样式作用范围与组件结构一一对应。

### **核心构成**

- **Block（块，`block`）**：独立完整、可在页面任意位置复用的组件单元，例如搜索表单 `search-form`、商品卡片 `product-card` 或导航菜单 `nav-menu`。
- **Element（元素，`block__element`）**：从属于块的内部子结构，脱离所属块便失去独立语义，使用**双下划线（`__`）**连接块名。例如卡片内的标题 `card__title`、图片 `card__image` 和操作按钮 `card__button`。
- **Modifier（修饰符，`block--modifier` 或 `block__element--modifier`）**：描述块或元素的外观变体、尺寸或交互状态，使用**双连字符（`--`）**连接目标名称。例如推荐态卡片 `card--featured`、主操作按钮 `card__button--primary` 或当前激活的菜单项 `menu__item--active`。

### **工程收益**

- **从属关系自解释**：仅凭类名即可区分组件根容器、内部子节点与状态变体，无需反复对照 HTML 嵌套层级。
- **扁平化优先级**：所有规则均基于单类选择器编写，权重恒定，配合 `@layer` 即可安全完成状态覆盖。

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

