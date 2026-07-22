---
title: "IV. 前端框架和库：构建现代 UI / IV.2 Web Components：原生、跨框架的组件化未来"
---

# IV.2 Web Components：原生、跨框架的组件化未来

在探讨 React、Vue、Svelte 等框架如何实现组件化的同时，我们必须关注 Web 标准自身提供的原生组件化解决方案——[**Web Components**](https://www.webcomponents.org/)。它并非框架，而是一套由 W3C 标准化、浏览器原生支持的技术集合，旨在让开发者创建可复用、封装良好的自定义 HTML 元素。这些元素可以在任何 Web 页面中使用，并能与所有现代 JavaScript 框架无缝协作。

Web Components 主要由三项核心技术构成：

1. **Custom Elements (自定义元素)**：允许开发者定义自己的 HTML 标签。你可以创建一个名为 `<my-button>` 的标签，并为其赋予特定的样式和行为。HTML 的语义因此可以无限扩展。

2. **Shadow [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) (影子 [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model))**：这是 Web Components 最具革命性的特性。它能把一棵独立的、“隐藏”的 DOM 树附加到元素上。Shadow DOM 内部的**样式和脚本完全封装、隔离**，不会影响到外部页面，外部页面的样式也不会意外泄露进来。它从根本上解决了 CSS 全局作用域污染这一困扰前端开发者多年的顽疾，提供了浏览器原生的样式封装。

3. **HTML Templates (`<template>` 和 `<slot>`)**：`<template>` 标签允许我们声明一段惰性的 DOM 片段，直到激活时才会渲染。`<slot>` 元素则是一个占位符，允许我们将外部的 HTML 内容“投影”到组件的 Shadow DOM 内部，极大地增强了组件的灵活性和可组合性。

::: details 启发式示例：一个具备输入、输出和清理边界的原生组件

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

这个例子只保留组件契约：`open` 属性/property 是输入，`panel-toggle` 事件是输出，`slot` 负责组合内容，生命周期负责清理监听器。若需求只是普通折叠内容，应优先使用原生 `<details>`；只有需要稳定的跨框架 API 和额外行为时，才值得创建自定义元素。

:::

- **核心优势：真正的跨框架复用与技术无关性**：由于 Web Components 是浏览器原生标准，用它创建的组件不依赖于任何特定框架。用 Web Components 编写的组件库，可以同时在 React、Vue、Angular 或原生 JavaScript 项目中使用，无需任何修改。这对于构建企业级设计系统、或希望在多个不同技术栈的团队间共享 UI 组件的场景，具有无与伦比的优势。

- **生态与未来**：Google 的 **Lit**、微软的 FAST 等轻量级库，进一步简化了编写 Web Components 的体验。随着浏览器兼容性日益完善和前端生态对“技术栈无关性”的追求，Web Components 正作为面向未来、可持续的组件化方案，受到越来越多的关注。它代表了组件化能力回归 Web 平台本身的趋势，预示着更加标准化、互操作性更强的前端未来。
