# 框架原理教学

深入理解主流框架的核心原理。

## 已上线内容

### [Mini Vue：从响应式到模板编译](/principles/mini-vue)

这是一篇基于最小实现整理出来的原理讲解，核心覆盖：

- `Object.defineProperty` 风格的响应式
- `Dep / Watcher` 依赖收集
- 模板编译与 `v-model`
- Vue 2 教学模型与 Vue 3 现代实现的区别

### [Preact 11：内核剖析](/principles/preact)

这是一篇从源码出发、由表及里拆解 Preact 11 的完整指南，核心覆盖：

- VNode、JSX 与 `options` 插件系统
- 统一 diff、keyed 子节点协调与提交阶段
- 调度器、Context、Ref、错误边界与 Hooks
- `preact/compat`、Suspense、lazy 与核心 `createPortal`
- 从零实现一套 VDOM 的完整路径

## 后续计划

### 响应式系统的横向对比

后续会继续补上 Vue 3、Solid、React Signals 一类现代响应式方案的对照讲解。

## 编译器实现

::: tip 敬请期待
内容筹备中...
:::
