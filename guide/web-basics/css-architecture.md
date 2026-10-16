---
title: "II. 基础 Web 技术：核心支柱 / II.4 现代 CSS 架构与策略"
---

# II.4 现代 CSS 架构与策略

在大型多人协作项目中，直接编写全局 CSS 容易遇到全局作用域污染、类名冲突、死代码难以清理以及组件样式复用困难等问题。现代 CSS 架构围绕**编译期扩展**、**作用域隔离**、**原子化复用**与**设计 Token 管理**展开，不同方案在构建链路、运行时开销与动态能力上各有取舍。

## **II.4.1 CSS 预处理器（CSS Preprocessors）**

CSS 预处理器（CSS Preprocessor）通过自定义语法为 CSS 提供变量、Mixin（混入）、函数和模块化拆分等能力，编写完成后需经编译器转换为浏览器可识别的标准 CSS 文件。

### **1. Sass / SCSS**

[Sass](https://sass-lang.com/) 是生态最成熟的 CSS 预处理器，支持两种语法格式：

1. **Sass（缩进语法）**：使用缩进代替花括号、省略分号，文件扩展名为 `.sass`。
2. **[SCSS](https://sass-lang.com/documentation/syntax#scss)（Sassy CSS）**：语法与标准 CSS 完全兼容（任何合法的 CSS 文件都是合法的 SCSS 文件），文件扩展名为 `.scss`，是工程中的主流选择。

### **2. Less**

[Less](https://lesscss.org/) 的语法和功能与 SCSS 接近，主要差异在于变量使用 `@` 前缀（如 `@primary-color`）以及混入与守卫（Guards）的写法。Less 早期支持在浏览器端通过 JavaScript 实时编译，但生产项目均在构建阶段预先编译为标准 CSS。

## **II.4.2 PostCSS：用 JavaScript 插件转换 CSS 的工具平台**

[PostCSS](https://postcss.org/) 本身不是一门预处理器语言，而是把 CSS 解析为抽象语法树（AST）、交由 JavaScript 插件链转换后再输出 CSS 的工具平台。常见工程用途包括：

- **语法转换与预处理器特性**：通过 [postcss-nested](https://github.com/postcss/postcss-nested)、[postcss-simple-vars](https://github.com/postcss/postcss-simple-vars) 等插件支持嵌套与变量转换。
- **自动补齐浏览器前缀（[Autoprefixer](https://github.com/postcss/autoprefixer)）**：根据项目的 Browserslist 目标浏览器配置，自动为需要兼容的 CSS 属性补充 `-webkit-`、`-moz-` 等厂商前缀。
- **编译前沿 CSS 规范**：借助 [postcss-preset-env](https://preset-env.cssdb.org/)，将尚未在全部目标浏览器落地的现代 CSS 语法降级转换为等效的兼容代码。
- **构建产物压缩**：配合 `cssnano` 等插件移除注释、空白并合并重复规则，减小产物体积。

## **II.4.3 原子化（utility-first）CSS**

原子化 CSS（utility-first CSS，代表框架有 [Tailwind CSS](https://tailwindcss.com/) 和 [UnoCSS](https://unocss.dev/)）不再为每个组件内部节点单独发明语义化类名，而是直接在 HTML 模板中组合单用途的工具类（如 `text-center`、`bg-blue-500`、`px-4`）来构建界面：

- **设计约束一致**：工具类的数值直接映射自统一的 Design Token（间距、字号、色板刻度），避免了随意硬编码像素值与色值，也减少了跨文件的样式覆盖冲突。
- **样式体积收敛**：构建工具按需扫描模板内容，只生成项目实际用到的原子类，随着页面数量增长，CSS 产物体积趋于平缓。
- **内联响应式与状态变体**：通过 `md:flex`、`hover:bg-blue-600`、`dark:text-white` 等前缀直接在模板中声明断点与状态，省去在独立样式文件中来回跳转和手写媒体查询的步骤。
- **与原生 CSS 深度结合**：现代原子化框架普遍将构建期工具类与运行时 CSS 变量结合，用 CSS 自定义属性承载主题 Token。

Tailwind CSS 已从早期的“JavaScript 配置文件驱动”演进为 **CSS 优先配置（CSS-first configuration）**：通过 `@theme` 指令将设计 Token 直接声明在 CSS 文件中，并提供官方 Vite 插件减少构建链配置成本（PostCSS 仍可作为可选集成路径）。

UnoCSS 则将原子化 CSS 设计为可插拔的按需生成引擎：

- **生成机制**：[不解析 AST（抽象语法树），也不做全量扫描](https://github.com/unocss/unocss#readme)，而是将源码切分为候选 Token，用静态映射或正则规则按需匹配并缓存结果。
- **预设体系**：框架核心不内置固定工具类，所有规则由预设（Presets）提供。官方预设兼容 Tailwind 类名体系，团队也可按需组合或编写自定义规则预设。
- **语法扩展**：通过插件支持 Attributify 模式（将工具类拆分为 HTML 属性以缩短冗长的 `class` 字符串）及纯 CSS 图标（基于 Iconify 按需生成）。

**工程权衡**：原子化 CSS 需要开发者熟悉工具类命名体系；复杂样式组合会使 HTML 模板中的 `class` 字符串变长，通常需要配合组件抽取或 `clsx` / `tailwind-merge` 等工具函数管理条件类名。

## **II.4.4 CSS-in-JS**

CSS-in-JS 将样式定义直接写入 JavaScript/TypeScript 组件文件中，使样式的加载、更新与卸载随组件生命周期同步管理。其核心机制是在构建期或运行时自动生成带哈希的唯一类名，将样式作用域严格限制在当前组件内部；同时可以直接读取组件的 `props` 或状态动态计算样式，并通过上下文（Context）或 CSS 变量实现主题切换。

在 React 生态中，[styled-components](https://styled-components.com/) 通过标签模板字面量将 CSS 直接封装为带样式的 [React](https://react.dev/) 组件；[Emotion](https://emotion.sh/) 则同时支持模板字符串与对象样式写法，支持服务端渲染（SSR），并可通过 Babel/SWC 插件补充调试类名与编译期优化。

**工程权衡**：传统运行时 CSS-in-JS 会把样式解析与注入逻辑打包进 JavaScript 产物，增加包体积与主线程运行时开销；在 React 并发渲染或高频状态更新下，运行时动态注入 `<style>` 标签可能触发整棵组件树的额外样式重算（Recalculate Style）。在 SSR / React Server Components（RSC）架构中，还需额外处理样式提取，否则容易引发无样式内容闪烁（FOUC）或服务端组件不兼容问题。评估时应结合渲染频率、动态样式占比与 SSR 架构综合取舍。

## **II.4.5 CSS Modules**

[CSS Modules](https://github.com/css-modules/css-modules) 通过构建工具在编译期将 `.module.css` 文件中的类名重写为带文件与哈希前缀的全局唯一名称（如 `.Button_primary__x8k2a`），在不改变原生 CSS 编写习惯的前提下实现组件级作用域隔离：

- **编译期局部作用域**：类名默认仅对导入该文件的组件可见，从构建机制上消除了全局类名冲突。
- **零运行时开销**：类名映射在打包阶段静态完成，不在浏览器端引入额外的 JavaScript 样式解析成本。
- **沿用标准 CSS 能力**：完全兼容原生 CSS、SCSS/Less 语法及 PostCSS 插件链，样式与组件文件一一对应。

在组件中导入 `.module.css` 后，可直接以 JavaScript 对象属性形式引用类名（如 `styles.card`），动态状态组合常配合 [classnames](https://github.com/JedWatson/classnames) 或 `clsx` 拼接，全局基础样式则通过 `:global()` 或独立全局样式表声明。

**工程权衡**：CSS Modules 属于静态样式方案，无法像 CSS-in-JS 那样直接把任意 JavaScript 运行时变量写进样式规则（需通过行内赋值的 CSS 自定义属性传递动态值），主题系统也需自行依托 CSS 变量与顶层类名规划。

## **II.4.6 设计系统与组件库中的 CSS**

设计系统与组件库通常采用分层或混合架构来平衡底层一致性与组件封装度：用 CSS 自定义属性定义全局 Design Token（颜色、字号、间距、圆角、阴影），用原子化 CSS 或基础工具层提供布局组合能力，再用 CSS Modules 或编译期 CSS-in-JS 封装复杂交互组件以确保样式隔离。

与此同时，**原生 CSS 已接管了大量原本依赖预处理器或框架的特性**。容器查询（`@container`）、`:has()`、原生嵌套（CSS Nesting）、层叠层（`@layer`）、`@scope`、Popover API、View Transitions 与 `content-visibility` 等能力，使“原生 CSS + 少量构建处理”成为轻量化工程的务实选择。引入这些原生特性时，应先核对 [Baseline](/guide/web-basics/internet#ii-1-7-web-平台兼容性判断-baseline-与-interop) 状态，再结合目标用户的浏览器分布决定是否配置降级方案。

## **II.4.7 现代 CSS 架构对比（原子化 CSS vs. CSS-in-JS vs. CSS Modules）**

下表从作用域机制、性能开销与开发体验等维度对比三种主流方案：

| 特性/架构    | 原子化 CSS（如 [Tailwind CSS](https://tailwindcss.com/)、[UnoCSS](https://unocss.dev/)） | CSS-in-JS（如 [styled-components](https://styled-components.com/)、[Emotion](https://emotion.sh/)） | [CSS Modules](https://github.com/css-modules/css-modules) |
| :----------- | :----------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| **哲学**     | 工具类优先，直接在 HTML 中组合原子类                                                       | JavaScript 驱动的样式，样式与组件紧密耦合                                                             | CSS 类名局部作用域化，控制全局冲突                        |
| **作用域**   | 通过组合原子类实现样式隔离                                                                 | 自动生成唯一类名，确保样式局部作用域                                                                  | 构建时重命名类名，实现局部作用域                          |
| **性能影响** | 构建时生成最小化 CSS，零运行时开销                                                         | 增加 JS 打包体积，可能产生运行时样式计算和注入开销，可通过编译期优化、缓存和减少动态样式缓解          | 构建时处理，零运行时开销                                  |
| **开发体验** | 快速原型开发，无需切换文件，HTML 可能冗长                                                  | 强大动态样式能力，主题化易实现，JS 中写 CSS                                                           | 熟悉原生 CSS 语法，样式隔离可靠，易于维护                 |
| **学习曲线** | 对于传统 CSS 使用者较陡峭                                                                  | 对于 JS 开发者友好，但概念可能需适应                                                                  | 低，接近原生 CSS                                          |
| **动态样式** | 需结合 JS 逻辑或配置实现                                                                   | 原生支持，基于 props 或 state 轻松实现                                                                | 有限，需额外库辅助                                        |
| **主题化**   | 通过配置文件和 CSS 变量实现                                                                | 内置或易于实现                                                                                        | 需额外工具或手动实现                                      |
| **适用场景** | 快速开发，设计系统，需要高度定制和性能优化的项目                                           | 组件化开发，复杂动态 UI，需要强封装性的组件                                                           | 中大型项目，追求原生 CSS 体验和严格样式隔离               |

技术选型需结合项目规模、团队协作习惯、SSR/RSC 架构约束以及打包工具生态综合决定。

## **II.4.8 原生 CSS 的小型实践：Token、层叠层与容器查询**

下面的例子把设计 token、层叠顺序和组件局部响应式放在同一个文件中。组件宽度变化时，卡片自己决定布局；页面只负责提供容器。

```html
<section class="profile" aria-labelledby="profile-title">
  <h2 id="profile-title">团队成员</h2>
  <article class="profile-card">
    <img src="avatar.webp" alt="林夏的头像" width="96" height="96" />
    <div>
      <h3>林夏</h3>
      <p>负责设计系统与前端基础设施。</p>
    </div>
  </article>
</section>
```

```css
@layer reset, tokens, components;

@layer reset {
  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
}

@layer tokens {
  :root {
    --color-surface: #ffffff;
    --color-text: #172033;
    --color-muted: #5e6b85;
    --space-3: 0.75rem;
    --radius-card: 1rem;
  }
}

@layer components {
  .profile {
    container: profile / inline-size;
    color: var(--color-text);
  }

  .profile-card {
    display: grid;
    grid-template-columns: 5rem 1fr;
    gap: var(--space-3);
    align-items: center;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: var(--radius-card);
  }

  .profile-card p {
    color: var(--color-muted);
  }

  @supports (container-type: inline-size) {
    @container profile (max-width: 24rem) {
      .profile-card {
        grid-template-columns: 1fr;
      }
    }
  }
}
```

练习时可以切换容器宽度，观察卡片布局变化，再用 DevTools 的 Computed 面板确认 token 和 `@layer` 的生效顺序。`reset` 层里的 `max-width: 100%` 让 96px 的头像在 5rem 的窄列中按比例缩小，而不是溢出压住旁边的文字；`width` / `height` 属性则继续提供宽高比，避免加载时布局跳动。真实项目还应给 token 建立命名规则，并把组件状态、主题和高对比度模式纳入同一套验证清单。
