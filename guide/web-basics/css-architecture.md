---
title: "II. 基础 Web 技术：核心支柱 / II.4 现代 CSS 架构与策略"
---

# II.4 现代 CSS 架构与策略

现代前端开发对 CSS 提出了远超以往的要求——不仅要实现美观、功能完善的界面，更要确保代码的可维护性、可扩展性和团队协作效率。传统的 CSS 编写方式在大型项目中容易遭遇全局作用域污染、命名冲突、样式复用困难等挑战。为应对这些问题，业界涌现出多种现代 CSS 架构与策略，旨在优化开发体验并提升项目质量。

## **II.4.1 CSS 预处理器（CSS Preprocessors）**

CSS 预处理器（CSS Preprocessor）是一种脚本语言，用于扩展 CSS 的功能。写完这些带有新特性的代码后，需要通过“编译器”将其编译成浏览器能识别的标准 CSS 文件。

### **1. Sass / SCSS**
Sass 是最成熟、最稳定、功能最强大的 CSS 预处理器之一。它有两种语法：

1. [Sass](https://sass-lang.com/)（旧语法）：采用缩进语法，省略分号。这种语法更简洁，但与原生 CSS 差异较大。文件扩展名为 .sass。
2. [SCSS](https://sass-lang.com/documentation/syntax#scss)（新语法）：全称“Sassy CSS”，语法与原生 CSS 完全兼容。任何有效的 CSS 文件都是有效的 SCSS 文件。这是目前更主流、更推荐的语法。文件扩展名为 .scss。

由于功能强大、生态稳定，Sass/SCSS 在社区中非常受欢迎。

### **2. Less**

[Less](https://lesscss.org/) 是另一个流行的预处理器，其语法和功能与 SCSS 非常相似。它受 Sass 启发，但部分语法实现略有不同（例如，变量使用 @ 作为前缀）。Less 最初的特点是可以通过浏览器端的 JavaScript 库实时编译，但这在生产环境中很少使用，实际项目通常在构建阶段预先编译。

## **II.4.2 PostCSS：用 JavaScript 插件转换 CSS 的工具平台**

[PostCSS](https://postcss.org/) 可以：

- 实现类似预处理器的功能：通过插件（如 [postcss-nested](https://github.com/postcss/postcss-nested)、[postcss-simple-vars](https://github.com/postcss/postcss-simple-vars)），你可以实现嵌套和变量等功能。
- 自动添加浏览器前缀（[Autoprefixer](https://github.com/postcss/autoprefixer)）：这是 PostCSS 最著名的插件。它会自动分析代码，为需要兼容的 CSS 规则添加厂商前缀（如 `-webkit-`、`-moz-`）。
- 使用未来的 CSS 语法：借助 [postcss-preset-env](https://preset-env.cssdb.org/) 这类插件，你可以现在就使用尚未获得所有浏览器支持的最新 CSS 规范，它会自动将这些新语法转换为当前浏览器兼容的等效代码。
- 代码优化和压缩：通过插件可以自动压缩 CSS 代码，移除注释等。

## **II.4.3 原子化（utility-first）CSS**

原子化 CSS 在英文中称为 utility-first CSS，即“工具类优先”，代表框架有 [Tailwind CSS](https://tailwindcss.com/) 和 [UnoCSS](https://unocss.dev/)。它不再为每个组件编写语义化类名，而是直接在 HTML 中组合大量预定义、单用途的原子类（例如 `text-center`、`bg-blue-500`、`px-4`）来构建样式。这种方法的核心价值在于提升开发效率和设计一致性：开发者不必离开 HTML 文件编写自定义 CSS，就能快速开发和迭代原型。

该方法的主要优势包括：

- **设计一致性**：原子类的取值来自统一的设计 token（如间距、颜色刻度），限制了随意取值，有助于保持视觉统一，也减少了样式互相覆盖。
- **效率提升**：通过组合现成的原子类完成常见 UI 样式，显著减少了自定义 CSS 的代码量和维护成本。
- **响应式设计**：内置响应式断点，简化了多设备布局，无需手动编写媒体查询。
- **性能优化**：通过按需生成和自动内容检测，最终生成的 CSS 文件只包含实际使用的样式，文件体积小，加载速度快，有助于提升网站性能。
- **灵活性与可定制性**：尽管是预定义类，但通过组合不同的原子类，可以创建出独特的样式。同时，现代原子化框架越来越多地利用 CSS 变量、主题 token 和构建插件承载设计系统。

在实践中，Tailwind CSS 作为该领域的先驱，凭借 utility-first 理念和成熟的生态，已经从“配置文件驱动的原子类框架”进一步演进为更贴近原生 CSS 的样式系统。新版 Tailwind 强调 **CSS 优先配置（CSS-first configuration）**，通过 `@theme` 等能力把设计 token 写回 CSS 本身，并提供官方 Vite 插件减少构建链摩擦。PostCSS 仍然可用，但在 Vite 项目中更多作为可选集成路径。

UnoCSS 则从头重新设计了原子化 CSS 引擎，追求更快的生成速度、更高的灵活性和更精简的输出：

- **性能**：它[不解析 AST（抽象语法树），也不做全量扫描](https://github.com/unocss/unocss#readme)，而是把源码切分成候选 token，再用静态规则或正则规则逐一匹配，按需生成并缓存结果，只输出实际用到的 CSS。
- **预设系统**：它没有内置的“核心工具类”，所有功能都由预设提供。开发者可以只引入所需部分，也可以编写自己的预设；官方预设兼容 Tailwind 的类名写法和使用习惯。
- **扩展能力**：通过插件支持 Attributify 模式（把原子类写成 HTML 属性，缩短冗长的 `class` 字符串）、纯 CSS 图标等。

尽管原子化 CSS 具有诸多优势，但也存在一些权衡。对习惯传统 CSS 的开发者来说，学习曲线可能较陡峭。此外，HTML 中可能充斥大量原子类，导致代码冗长。基于 JavaScript props 的动态样式实现起来，可能不如 CSS-in-JS 直观。

## **II.4.4 CSS-in-JS**

CSS-in-JS 是一种将 CSS 样式直接嵌入 JavaScript 组件的技术。它允许开发者用 JavaScript 定义和管理组件样式，让样式与组件紧密耦合。这种方法在组件化开发中具有天然优势：样式随组件的创建和销毁而加载、卸载。其核心优势在于自动生成唯一类名，确保样式只作用于定义它的组件，把全局样式污染和命名冲突控制在组件边界内。此外，CSS-in-JS 可以轻松根据组件的 props 或状态动态调整样式，实现高度灵活的 UI，并内置或易于实现主题化机制，便于管理和切换应用的主题。

在实践中，[styled-components](https://styled-components.com/) 凭借直观的 API 和类似传统 CSS 的语法广受好评。它允许开发者在 JavaScript 中编写纯 CSS，并通过模板字面量创建带样式的 [React](https://react.dev/) 组件。[Emotion](https://emotion.sh/) 则提供字符串和对象两种样式写法，支持服务端渲染（SSR），并可通过 Babel 插件等方式改进调试信息、压缩输出和部分编译期优化。评估这类方案时，应把运行时样式计算、组件渲染频率、动态样式比例和框架集成方式一并纳入性能判断。

然而，CSS-in-JS 也存在一些权衡。样式逻辑作为 JavaScript 的一部分，会增加 JavaScript 打包体积。运行时的样式计算和注入会带来一定性能开销；在 React 并发渲染下，频繁在运行时注入样式还会引发额外的样式重算。SSR 配置不当时，可能出现无样式内容闪烁（FOUC）。此外，自动生成的类名不易读，可能增加调试难度。

## **II.4.5 CSS Modules**

[CSS Modules](https://github.com/css-modules/css-modules) 是一种将 CSS 文件中的类名局部作用域化的方案。它在构建时自动生成唯一哈希值，重命名 CSS 类名，确保每个组件的样式相互独立、不会冲突。其核心优势包括：

- **默认局部作用域**：类名限定在组件内部，从机制上避免了全局类名冲突；
- **学习成本低**：可以继续使用熟悉的 CSS、Sass 或 Less 语法；
- **无运行时开销**：样式在构建时处理；
- **易于维护和调试**：每个组件有独立的样式文件，样式与组件的对应关系直观，在大型代码库中优势更明显。

在实践中，CSS Modules 的用法是创建以 .module.css 结尾的 CSS 文件。在 React 组件中导入样式文件后，类名可以像 JavaScript 对象属性一样使用。该方案可以结合 [classnames](https://github.com/JedWatson/classnames) 库实现动态类名，并允许同时使用全局 CSS 定义基础样式。

CSS Modules 的权衡在于，相比 CSS-in-JS，它基于 props 或状态实现复杂动态样式的能力较弱。它也缺乏内置的主题系统，需要额外工具或手动实现主题化。此外，它需要 [Webpack](https://webpack.js.org/) 或其他打包工具正确配置，才能处理 .module.css 文件。

## **II.4.6 设计系统与组件库中的 CSS**

在构建设计系统和组件库时，选择合适的 CSS 架构至关重要。这些架构能帮助团队统一风格、提高复用性、提升协作效率，也便于维护和扩展。例如，原子化 CSS 可以作为设计系统底层的基础工具集，提供高度可组合的原子类；CSS-in-JS 或 CSS Modules 则可以用于构建独立、封装性强的组件，确保样式隔离。许多大型设计系统会采用混合策略，根据具体需求选择最合适的方案。

**现代 CSS 自身也在快速补齐能力——过去只能依靠框架或预处理器解决的问题，如今原生 CSS 也能应对**。容器查询、`:has()`、CSS Nesting、`@scope`、Popover、View Transitions、`content-visibility` 等能力让“原生 CSS + 少量构建增强”变得更有竞争力。采用这些能力时，应该先看它们的 Baseline 状态，再结合目标用户的浏览器分布决定是否需要降级方案。

## **II.4.7 表：现代 CSS 架构对比（原子化 CSS vs. CSS-in-JS vs. CSS Modules）**

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

选择 CSS 架构时，需要综合考虑项目规模、团队协作模式、性能目标以及与组件库、设计系统、打包工具的兼容性。例如，大型设计系统可能用原子化 CSS 提供基础工具集，再用 CSS Modules 或 CSS-in-JS 封装具体组件。

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
