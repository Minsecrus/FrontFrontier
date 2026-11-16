---
title: "IV. 前端框架和库：构建现代 UI / IV.2 Web Components：原生、跨框架的组件化未来"
---

# IV.2 Web Components：原生、跨框架的组件化未来

除了 React、Vue、Svelte 等框架各自的组件模型，浏览器平台本身也通过 WHATWG [HTML](https://html.spec.whatwg.org/multipage/custom-elements.html) 与 [DOM](https://dom.spec.whatwg.org/#shadow-trees) 标准提供了原生组件化方案——[Web Components](https://www.webcomponents.org/)。它允许开发者定义封装良好的自定义 HTML 元素，既能在无框架页面中直接挂载，也能接入主流 JavaScript 框架。不过在跨框架集成时需要注意版本边界：React 18 及更早版本只会将 props 作为字符串 attribute 写入自定义元素，且无法通过 `onXxx` 直接监听自定义事件，往往需要借助 `ref` 手动读写 property 和绑定监听器；直到 React 19 才原生补齐了对自定义元素属性与事件的完整支持。

Web Components 由三项浏览器原生技术协同构成：

1. **Custom Elements（自定义元素）**：通过 `customElements.define()` 注册自定义 HTML 标签（如 `<my-button>`），并挂载生命周期钩子与特定交互行为。需要注意，自定义元素默认不包含任何内建无障碍语义，诸如按钮、对话框等角色声明（ARIA）与键盘导航逻辑，仍需开发者显式补齐。

2. **Shadow [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)（影子 [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)）**：将一棵独立的内部 DOM 树挂载到宿主元素上，从浏览器引擎层面实现 DOM 结构与样式的作用域隔离——内部样式规则不会泄漏到外部文档，外部 CSS 选择器也不会意外命中内部节点。但这种隔离仅针对 DOM 与非继承样式：组件脚本仍与宿主页面共享同一个全局执行环境；`color`、`font` 等可继承 CSS 属性以及 CSS 自定义属性（`--*`）依然会穿透 Shadow 边界，后者正是自定义元素对外暴露主题定制契约的标准入口。

3. **HTML Templates（`<template>` 和 `<slot>`）**：`<template>` 用于声明解析后暂不渲染的惰性 DOM 片段，待组件实例化时再通过脚本克隆并挂载；`<slot>` 则作为内容投影插槽，将宿主标签内部的外部 HTML 节点映射到 Shadow DOM 指定位置，支撑组件的组合扩展。

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

- **核心价值：跨技术栈的设计系统底座**：由于直接运行在浏览器标准之上，Web Components 组件不绑定特定框架运行时，同一套组件产物可以同时供 React、Vue、Angular 或原生页面消费（React 18 及更早版本的接入限制见本章开头）。这使它非常适合作为多团队、多技术栈共用的企业级基础组件库或微前端公共 UI 底座。
- **工程工具链与演进**：直接手写原生 `HTMLElement` 往往需要处理大量属性同步与 DOM 更新样板代码。实际工程中通常借助 Google 的 Lit 或微软的 FAST 等轻量封装库，以极小的运行时开销获得声明式模板与响应式属性支持，将组件能力建立在长期稳定的 Web 平台标准之上。
