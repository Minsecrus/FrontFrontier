---
title: "IV. 前端框架和库：构建现代 UI / IV.2 Web Components：原生、跨框架的组件化未来"
---

# IV.2 Web Components：原生、跨框架的组件化未来

除了 React、Vue、Svelte 等框架各自的组件化方案，Web 标准本身也提供了原生的组件模型——[**Web Components**](https://www.webcomponents.org/)。它是一套已纳入 WHATWG [HTML](https://html.spec.whatwg.org/multipage/custom-elements.html) 与 [DOM](https://dom.spec.whatwg.org/#shadow-trees) 标准、浏览器原生支持的技术集合，旨在让开发者创建可复用、封装良好的自定义 HTML 元素。这些元素可以在任何 Web 页面中使用，也能在主流 JavaScript 框架中使用。需要注意的是，React 18 及更早版本只会把 props 当作字符串 attribute 传给自定义元素，也不能用 `onXxx` 直接监听自定义事件，通常要借助 ref 手动设置 property 和绑定事件；React 19 起才完整支持自定义元素。

Web Components 主要由三项核心技术构成：

1. **Custom Elements（自定义元素）**：开发者可以定义自己的 HTML 标签，例如创建一个名为 `<my-button>` 的标签，并赋予它特定的样式和行为。不过，自定义元素本身没有内建语义，按钮、对话框等角色和键盘行为仍需开发者通过 ARIA 和脚本补齐。

2. **Shadow [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)（影子 [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)）**：这是 Web Components 中最有特色的部分。它能把一棵独立的、“隐藏”的 DOM 树附加到元素上。Shadow DOM 内部的 **DOM 结构和样式被封装**：内部样式规则不会影响外部页面，外部选择器也不会意外匹配内部元素。但它并不隔离脚本（组件代码与页面共享同一个全局环境），可继承的 CSS 属性（如 `color`、`font`）和 CSS 自定义属性也会穿透边界，后者正是组件对外开放主题定制的常用入口。对于 CSS 全局作用域污染这一长期问题，它提供了浏览器原生的样式封装方案。

3. **HTML Templates（`<template>` 和 `<slot>`）**：`<template>` 标签用来声明一段惰性的 DOM 片段，其内容不会渲染，直到脚本把它克隆并插入文档。`<slot>` 元素是一个占位符，用来把外部的 HTML 内容“投影”到组件的 Shadow DOM 内部，增强了组件的可组合性。

::: details 示例：一个具备输入、输出和清理边界的原生组件

```js
class TogglePanel extends HTMLElement {
  static observedAttributes = ["open"];

  #button;
  #panel;
  #toggle = () => {
    this.open = !this.open;
    this.dispatchEvent(new Event("panel-toggle", {
      bubbles: true,
      composed: true,
    }));
  };

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <button type="button" part="trigger"><slot name="label">展开</slot></button>
      <div part="panel" hidden><slot></slot></div>
    `;
    this.#button = root.querySelector("button");
    this.#panel = root.querySelector('[part="panel"]');
  }

  connectedCallback() {
    this.#button.addEventListener("click", this.#toggle);
    this.#render();
  }

  disconnectedCallback() {
    this.#button.removeEventListener("click", this.#toggle);
  }

  attributeChangedCallback() { this.#render(); }
  get open() { return this.hasAttribute("open"); }
  set open(value) { this.toggleAttribute("open", Boolean(value)); }

  #render() {
    this.#button.setAttribute("aria-expanded", String(this.open));
    this.#panel.hidden = !this.open;
  }
}

customElements.define("toggle-panel", TogglePanel);
```

```html
<toggle-panel open>
  <span slot="label">配送说明</span>
  <p>工作日 18:00 前下单，当日发货。</p>
</toggle-panel>
```

这个例子只保留组件契约：`open`（同时以 HTML attribute 和 JavaScript property 两种形式暴露，二者保持同步）是输入，`panel-toggle` 事件是输出，`slot` 负责组合内容，生命周期负责清理监听器。若需求只是普通折叠内容，应优先使用原生 `<details>`；只有需要稳定的跨框架 API 和额外行为时，才值得创建自定义元素。

:::

- **核心优势：跨框架复用与技术无关性**：Web Components 是浏览器原生标准，用它创建的组件不依赖任何特定框架。用 Web Components 编写的组件库，可以在 React、Vue、Angular 或原生 JavaScript 项目中复用，通常无需修改组件本身（React 18 及更早版本的接入限制见本章开头）。对于构建企业级设计系统，或需要在技术栈不同的多个团队之间共享 UI 组件的场景，这一点优势明显。

- **生态与未来**：Google 的 **Lit**、微软的 FAST 等轻量级库，进一步简化了 Web Components 的编写。随着浏览器兼容性日益完善、前端生态对“技术栈无关性”的需求增加，Web Components 作为一种可持续的组件化方案，受到越来越多的关注。它代表了组件化能力回归 Web 平台本身的趋势。
