---
title: "II. 基础 Web 技术：核心支柱 / II.2 HTML：构建网页结构"
---

# II.2 HTML：构建网页结构

HTML（Hypertext Markup Language，超文本标记语言）负责定义网页的文档结构与内容语义，如标题、段落、链接、图像、列表和表单控件。大多数 HTML 元素由起始标签、内容和结束标签组成；`<img>`、`<input>`、`<meta>`、`<br>` 等空元素（void element）只有起始标签，不包含内容和结束标签。标准文档由承载元数据（标题、样式链接、图标、字符集等）的 `<head>` 与承载可见内容的 `<body>` 组成，元素还可通过属性声明附加行为与语义信息。

## **II.2.1 文档结构与元数据**

完整的 HTML 文档以 `<!doctype html>` 声明标准模式，随后是根元素 `<html>`、`<head>` 和 `<body>`。`<head>` 中的元数据虽然不直接渲染在页面正文中，却直接决定浏览器解析方式、搜索引擎索引、社交卡片预览和移动端视口行为：

- **字符集**：`<meta charset="utf-8">` 确保中文、特殊符号和多语言文本按 UTF-8 正确解码，避免乱码。
- **视口设置**：`<meta name="viewport" content="width=device-width, initial-scale=1">` 让移动端浏览器按设备真实宽度渲染页面，是响应式布局的前提。
- **标题与描述**：`<title>` 和 `<meta name="description">` 决定浏览器标签页标题、搜索结果摘要以及社交分享预览。
- **资源关系**：`<link rel="stylesheet">`、`<link rel="icon">` 以及 `preload`、`preconnect` 等资源提示，用于声明样式依赖、站点图标与关键资源的加载时机。

## **II.2.2 语义化 HTML：赋予意义，改善无障碍体验**（*）

语义化 HTML 指根据内容的实际角色选择 `<header>`、`<footer>`、`<nav>`、`<article>`、`<section>`、`<main>`、`<aside>` 等具有明确语义的标签，而非一律使用无语义的 `<div>` 和 `<span>` 堆砌视觉样式。语义标签能直接向屏幕阅读器等辅助技术暴露页面地标（Landmark）以便快速跳转，帮助搜索引擎识别正文与导航层级，并供浏览器阅读模式提取核心内容。

## **II.2.3 链接、媒体与表格**

HTML 将文本与媒体组织成可导航、可引用、可感知的信息结构，各类元素在使用时有明确的语义边界：

- **链接**：`<a>` 用于页面跳转与资源引用。链接文本应直接说明目标内容（避免仅写“点击这里”）；外部链接、文件下载和新窗口打开应通过文本或属性明确传达行为。
- **图片**：`<img>` 应提供准确传达图像信息的 `alt` 文本；纯装饰性图片应显式设置空属性 `alt=""`，使屏幕阅读器直接跳过，避免朗读无意义的文件名。
- **音视频**：`<audio>` 和 `<video>` 应提供 `controls` 控制条，并按需配置 `<track>` 字幕、替代文本或下载入口，保证用户在静音或听障场景下仍能获取信息。
- **表格**：`<table>` 专用于展示二维结构化数据，页面布局应交由 CSS 处理。数据表格应配合 `<caption>`、`<thead>`、`<tbody>`、`<th>` 及 `scope` 属性，显式声明表头与数据单元格的行列对应关系。

## **II.2.4 表单：用户输入和交互**

HTML 表单（`<form>`）配合 `<input>`、`<button>` 等控件收集用户输入，将文档结构、客户端脚本校验与服务端数据处理连接起来。完整的表单实现涵盖输入语义、校验规则、错误反馈与提交行为：

- **控件类型**：根据数据语义选择 `type="email"`、`type="number"`、`type="date"`、`checkbox`、`radio`、`<select>`、`<textarea>` 等原生控件，可直接唤醒匹配的移动端虚拟键盘，并获得浏览器内置格式校验与辅助技术支持。
- **标签关联**：每个可见输入控件都应配有 `<label>`，并通过 `for` 与控件 `id` 绑定；这既能扩大点击/触控热区，也能让屏幕阅读器在聚焦时准确读出字段名称。
- **原生校验**：`required`、`minlength`、`maxlength`、`pattern`、`min`、`max` 等属性可声明基础约束，复杂跨字段校验与安全校验仍需结合 JavaScript 与服务端共同完成。
- **按钮语义**：位于 `<form>` 内部的 `<button>` 默认为 `type="submit"`。取消、关闭弹窗、展开选项等非提交动作必须显式声明 `type="button"`，防止误触发表单提交。
- **错误提示**：校验失败的反馈应紧邻对应字段，同时使用文本说明、颜色与图标提示原因及修复方式，不能仅靠边框变红表达错误。

::: details 示例：语义化表单

```html
<form action="/signup" method="post">
  <fieldset>
    <legend>创建账号</legend>

    <label for="email">邮箱</label>
    <input id="email" name="email" type="email" autocomplete="email" required>

    <label for="password">密码</label>
    <input
      id="password"
      name="password"
      type="password"
      autocomplete="new-password"
      minlength="8"
      aria-describedby="password-help"
      required
    >

    <p id="password-help">至少 8 个字符。</p>
    <button type="submit">注册</button>
  </fieldset>
</form>
```

这个例子展示了各元素的分工：`label` 让字段有可访问名称，`type` 带来移动键盘和基础校验，`fieldset` / `legend` 给相关字段建立分组，`button type="submit"` 明确提交行为。

`aria-describedby="password-help"` 把提示文字关联到密码框，屏幕阅读器聚焦字段时会在名称之后读出“至少 8 个字符”。只给提示加 `id` 而不建立关联，读屏用户在填写时就听不到这条规则。错误信息也可以用同样方式关联到字段。

:::

## **II.2.5 调试 HTML**

HTML 解析器具有极强的容错性，遇到未闭合或错误嵌套的标签时会尝试自动修复并继续渲染。因此“页面看起来正常”不代表 DOM 结构正确，排查时可通过以下步骤验证：

- 在浏览器 DevTools 的 Elements 面板中查看解析后的实时 DOM 树，并与源码对照，确认是否存在被浏览器自动拆开或移动的节点。
- 检查标签嵌套合法性，重点排查列表（`<ul>`/`<ol>` 的直接子元素应为 `<li>`）、表格、表单及交互元素（如 `<button>` 内不可再嵌套 `<a>` 或 `<button>`）。
- 核对图片 `alt`、表单 `label`、标题层级（`<h1>`–`<h6>` 是否跳级）以及地标元素是否完整。
- 使用 W3C Markup Validator、Lighthouse 或 DevTools Accessibility 面板扫描遗漏属性与无障碍树缺陷。
