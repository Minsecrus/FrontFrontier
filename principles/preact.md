---
title: "Preact 11 内核剖析：从零开始的完全指南"
outline: deep
---

# Preact 11 内核剖析：从零开始的完全指南

::: info 来源声明
本文摘自 Garvish Panchal 的 [Preact From The Inside Out](https://www.garvish.tech/blog/preact-internals)，此处为中文翻译整理版，并依据 Preact 最新源码修正了少量时效性内容。
:::

> 我一头扎进 Preact 的兔子洞，带出来的就是它——一篇从零讲起、完整拆解 Preact 11 到底怎么运作的文章：虚拟 DOM、diff、调度器、hooks、context、ref、错误边界、Suspense，以及 React 兼容层。我的出发点有点私心：写出一篇我自己当初巴不得有人直接塞到手上的东西，让**一个人只读这一个文件，就能把整个代码仓库弄懂**，然后转身写出自己的 VDOM 库。
>
> 开卷之前先打个预防针：这篇文章是经典老文《虚拟 DOM 的内部运作》（Inner Workings of Virtual DOM）的重写版，那篇讲的是 Preact 7/8（`nodeName`、`attributes`、同步递归 diff、`diffLevel` 全局变量）。这些如今已荡然无存。你此刻读到的，是这套引擎当下的模样：一趟扁平的单遍 diff 扫过类 fiber 的 vnode，微任务批处理的渲染队列，基于偏移量的 keyed 协调器，还有一套插件系统——hooks（名副其实地“钩”上去）和 `preact/compat` 都搭建在它之上。

## 目录

1. [鸟瞰全局](#_1-鸟瞰全局)
2. [仓库结构：逐个包拆解](#_2-仓库结构-逐个包拆解)
3. [VNode：Preact 的原子](#_3-vnode-preact-的原子)
4. [createElement 与 JSX](#_4-createelement-与-jsx)
5. [`options`：万物的插件基座](#_5-options-万物的插件基座)
6. [`render`：入口](#_6-render-入口)
7. [diff 其一：统一的算法](#_7-diff-其一-统一的算法)
8. [diff 其二：组件](#_8-diff-其二-组件)
9. [diff 其三：DOM 元素，props 与事件](#_9-diff-其三-dom-元素-props-与事件)
10. [diff 其四：keyed 子节点与偏移算法](#_10-diff-其四-keyed-子节点与偏移算法)
11. [提交阶段](#_11-提交阶段)
12. [调度器：`setState` 为什么是异步的](#_12-调度器-setstate-为什么是异步的)
13. [Context](#_13-context)
14. [Ref](#_14-ref)
15. [错误边界](#_15-错误边界)
16. [Hooks：全景图](#_16-hooks-全景图)
17. [`preact/compat`：伪装成 React](#_17-preact-compat-伪装成-react)
18. [Suspense 与 lazy 深入](#_18-suspense-与-lazy-深入)
19. [其余的包](#_19-其余的包)
20. [动手写一个 VDOM：按部就班的清单](#_20-动手写一个-vdom-按部就班的清单)
21. [附录：下划线字段速查表](#_21-附录-下划线字段速查表)

## 1. 鸟瞰全局

剥去一切细枝末节，Preact 其实只干一件事：让真实 DOM 树与一份“这棵树该长什么样”的描述保持同步，同时尽可能少地触碰真实 DOM。这份“描述”是什么？是一棵由**虚拟节点**（vnode）组成的树——就是普通的 JavaScript 对象，没有任何玄学。整个流程如下：

```text
   你写的 JSX
      │  （由 Babel/TS 编译）
      ▼
  createElement / jsx()  ───────►  一棵 VNode 对象树
      │
      ▼
  render(vnode, container)
      │
      ▼
  ┌──────────────────────────────────────────────────────────┐
  │  diff()  —— 自顶向下走一遍新树，与旧树逐节点对照          │
  │     • type 是函数？   → 执行组件，递归                    │
  │     • type 是字符串？ → 创建/修补真实 DOM 节点            │
  │     • 有 children？   → diffChildren()（keyed）           │
  └──────────────────────────────────────────────────────────┘
      │  （此时 DOM 已被修改）
      ▼
  commitRoot()  —— 触发 ref，再执行布局 effect 与生命周期回调
```

多数人栽跟头的地方在这里：首次渲染之后，更新不是从根节点开始的。一次 `setState`（或 hook 的 state setter）只会把**一个**组件标记为脏（dirty），把它推进队列，然后调度在下一个微任务里统一处理。这次处理只重新执行这一个组件，把*它的*子树与上一次的产出做 diff。Preact 为什么让人觉得快，秘密全在这里——大多数渲染只碰到树的一小片，而大多数参与 diff 的节点最终对 DOM 什么都没做。

有四个观念撑起了整个库。把这四条刻进脑子里，剩下的都只是细节：

1. **vnode 就是对象，而旧树始终留存在内存里。** 所谓 diff，就是“拿新对象树对照旧对象树，输出最少的 DOM 操作”。
2. **每个 vnode 都是一棵可双向遍历的树上的节点**（`_parent`、`_children`），并且记得自己产出的真实 DOM（`_dom`）。这就是 Preact 版的 React Fiber。深层的更新不重渲染任何上层节点，就能找到自己的 DOM 该放在哪——靠的就是它。
3. **组件不过是 `type` 为函数的 vnode。** 渲染组件就是调用这个函数，再 diff 它的返回值。state 存在挂于 vnode 之上的组件实例里。
4. **`options` 是一组空回调槽位，在关键时刻触发。** Hooks、compat、devtools、debug 都*不在*核心里——它们是填充这些槽位的插件。

## 2. 仓库结构：逐个包拆解

Preact 以寥寥几个小包的形式发布，全都叠在约 `3KB` 的核心之上。

- **`preact`（核心）**——vnode、`render`/`hydrate`、diff、调度器、`Component`、`createContext`、`cloneElement`、`createPortal`、`options`。下文所有内容都依赖它，而它不依赖其余任何包。总共约 1500 行。
- **`preact/hooks`**——`useState`、`useEffect`、`useRef`……整个就是靠 `options` 实现的*插件*。核心对 hooks 的存在一无所知。你不 import hooks，这些代码一行都不会加载。
- **`preact/compat`**——React API 的垫片。用 React 的名字重新导出核心，再给 `options` 打补丁，把 props/事件按 React 的语义规范化，外加 `memo`、`forwardRef`、`PureComponent`、`Suspense`、`lazy`、`Children`、`flushSync` 以及 React 18 的 hooks（`useTransition`、`useSyncExternalStore`……）。`createPortal` 则直接借用核心的同名实现，只补上 React 生态要看的 `containerInfo`。它对外报告 `version = '18.3.1'`，让各路类库相信自己正在跟 React 对话。
- **`preact/jsx-runtime`**——现代“自动”JSX 转换所用的 `jsx`/`jsxs`/`jsxDEV` 函数，外加服务于 SSR 的预编译/字符串 JSX 辅助函数（`jsxAttr`、`jsxEscape`、`jsxTemplate`）。
- **`preact/debug`**——仅开发期使用。import 它会加上运行时检查：非法的 hooks 用法、重复的 key、错误的 prop 类型、出错时输出可读的组件栈。它也是给 `options` 打补丁，只在开发环境里 import。
- **`preact/devtools`**——同样借 `options` 钩子，把应用桥接到 React DevTools 浏览器扩展。
- **`preact/test-utils`**——`act()` 一类的工具，用于在测试里同步刷新渲染与 effect。

留意这里的模式，因为它会一路重复到底：核心之外的一切，都是通过 `options` 接进来的。正是这一个设计抉择，让核心得以保持纤小，*同时*撑得起 hooks、Suspense、React 兼容和 devtools。

## 3. VNode：Preact 的原子

vnode 就是一个普通对象，仅此而已。系统里的每一个 vnode——无论它是 `<div>`、组件、文本节点还是 Fragment——形状都分毫不差：

```js
const vnode = {
    type,             // 'div' | 组件函数 | null（文本节点）
    props,            // { ...attributes, children }，文本节点则直接是字符串/数字
    key,              // 用户的 key，从 props 里提取出来
    ref,              // 用户的 ref，从 props 里提取出来
    _children: null,  // VNode[] - 本节点的子节点，diff 期间填充
    _parent: null,    // 父 VNode（借此可以向上遍历）
    _depth: 0,        // 距根节点的距离；用于给重渲染队列排序
    _dom: null,       // 本 vnode 对应的真实 DOM 节点（组件则指向第一个 DOM 节点）
    _component: null, // 背后的组件实例，函数/类组件才有
    constructor: undefined, // 一道安全防线，下文解释
    _original: ++vnodeId,   // 身份/版本号，用于快速短路
    _index: -1,       // 在兄弟节点中的下标（diff 期间兼作临时暂存）
    _flags: 0         // 位字段：INSERT_VNODE | MATCHED | MODE_HYDRATE | MODE_SUSPENDED
};
```

我们逐字段过一遍，因为真正有意思的是每个字段背后的*为什么*：

- **`type`**——渲染什么。字符串代表 DOM 元素；函数代表组件（函数组件、类组件都算）；`null` 代表文本节点，此时 `props` 就是实际的文本字符串或数字。
- **`props`**——`createElement` 的第二个参数，children 已被折叠进 `props.children`。对组件来说，函数收到的正是它；对 DOM 元素来说，它们会变成 attribute/property。`key` 和 `ref` 已经从这里*摘出去*了。
- **`key` / `ref`**——创建时从 props 里提取出来，协调器就能直接读到身份（`key`）和 ref 目标，不必翻遍 props。只有 DOM 类型和类组件会把 `ref` 提出来；普通函数组件的 `ref` 会留在 props 里（`forwardRef` 消费的就是这个）。
- **`_children`**——diff 之后的子 vnode。正是它让 vnode 成了树节点。节点被 diff 之前一直是 `null`。
- **`_parent`**——指向父 vnode 的指针。与 `_children` 配合，这棵树就能双向遍历，这一点至关重要：组件自己重渲染时，diff 需要找到周围的 DOM，靠的就是一路翻 `_parent`/`_children` 寻找 `_dom`。
- **`_dom`**——本 vnode 产出的真实 DOM 节点。DOM vnode 指向自己的元素；组件 vnode（自身没有 DOM）指向子树里*第一个*真实 DOM 节点。保住这个指针的正确性，更新才能把 DOM 精确地插到该去的位置，而不必全量重渲染。
- **`_depth`**——这个 vnode 的深度。调度器按深度给脏组件排序，保证父组件先于子组件渲染（父组件也在更新时，避免把子组件渲染两遍）。
- **`_original`**——单调递增的版本戳。重渲染若产出的*新* vnode 的 `_original` 与旧者相等，整棵子树便可按引用判定为完全一致，直接跳过。这是代价最低的短路。
- **`_index`**——vnode 在兄弟节点中的位置。协调 children 时，这个字段会被临时挪用：先存匹配到的旧 child 下标，随后覆写为最终下标。
- **`_flags`**——一个小位字段。diff 期间用到的位：

  - `INSERT_VNODE`——本节点的 DOM 需要插入/移动。
  - `MATCHED`——这个旧节点已被新节点认领（不会再被卸载）。
  - `MODE_HYDRATE`——正在接管已有 DOM，而非新建。
  - `MODE_SUSPENDED`——本子树在上一次渲染时挂起过。

### `constructor: undefined`：一道安全防线

注意到 `constructor` 被显式设为了 `undefined`。这不是意外——这是一道防 XSS/JSON 注入的防线。可信 vnode 的判定方式是：

```js
const isValidElement = vnode => vnode != null && vnode.constructor === undefined;
```

`JSON.parse` 得到的任何对象都是 `constructor === Object`，而不是 `undefined`。因此，任何以 JSON 形式从服务器抵达的恶意载荷，都不可能冒充 vnode、作为活节点注入树中。diff 里做的是同样的检查，`constructor` 不是 `undefined` 的一律拒绝处理。

## 4. createElement 与 JSX

JSX 不过是语法糖。经典转换下，`<div class="a">hi</div>` 会编译成一次调用：

```js
h('div', { class: 'a' }, 'hi');   // h === createElement
```

`createElement` 只做三件小事：

```js
export function createElement(type, props, children) {
    let normalizedProps = {}, key, ref, i;
    for (i in props) {
        if (i == 'key') key = props[i];
        else if (i == 'ref' && typeof type != 'function') ref = props[i];
        else normalizedProps[i] = props[i];
    }
    if (arguments.length > 2) {
        normalizedProps.children =
            arguments.length > 3 ? slice.call(arguments, 2) : children;
    }
    return createVNode(type, normalizedProps, key, ref, null);
}
```

1. **把 `key` 和 `ref` 从 props 里提出来。**（函数组件的 `ref` 例外，留在 props 里。）
2. **把 children 折叠进 `props.children`。** 只有一个 child 就保持单值，多个 child 收成数组。
3. **借 `createVNode` 构建 vnode**：分配上面那个对象形状，并且——关键的一步——触发 `options.vnode(vnode)`，让插件有机会对它做后处理。

`createVNode` 被单独拆成函数、只留一处分配点，是有意为之：所有 vnode 从同一调用点分配，V8 便会赋予它们相同的隐藏类（hidden class），整个库的属性访问因此更快。这类微优化，在看到基准测试结果之前，怎么看都像被害妄想。

### 自动运行时

现代工具链使用**自动 JSX 运行时**，你不用写 import，编译器直接产出 `preact/jsx-runtime` 的 `jsx(type, props, key)` / `jsxs(...)`。它们产出同样的 vnode 形状，有两处值得知道的差异：

- 运行时把 `key` 放进专用参数（不再混在 props 里）；DOM/类组件的 `ref` 会从 props 中提取出来，而对函数组件则刻意*把 `ref` 留在 props 里*（长远方向是彻底淘汰 `forwardRef`）。
- 这里的 `_original` 播种的是*负数*计数器，而非正数。正负无关紧要，唯一要紧的是新旧 vnode 的 `_original` 是否相等。

同一模块还导出了 `jsxAttr`、`jsxEscape`、`jsxTemplate`——预编译式 SSR 转换用它们把 JSX 直接变成 HTML 字符串（转义实体、把 `style` 对象序列化成 CSS、借 `valueOf` 解开 signal 一类的值）。Preact 就这样把 JSX 编译成字符串拼接，换来高速的服务端渲染。

`Fragment` 是最简单不过的组件：

```js
export function Fragment(props) {
    return props.children;
}
```

它渲染自己的 children，不套任何包裹元素。每次渲染的根部都裹着一个 Fragment。

`cloneElement` 与 `createElement` 形似，只是以既有 vnode 的 props 为底，覆以新的 props，并可选地替换 children——供那些需要向 `props.children` 注入 props 的库使用。

## 5. `options`：万物的插件基座

碰 diff 之前，先把 `options` 在脑子里钉牢——diff 里遍布对它的调用，而整个 hooks 系统就悄悄栖身于此。

`options` 是一个全局共享的对象。核心只播下一粒种子：一个错误处理器：

```js
const options = { _catchError };
export default options;
```

其余全是可选的回调槽位。到了特定时刻，核心就执行 `if (options._someHook) options._someHook(...)`。重要的槽位，按一次渲染中的触发次序排列：

- **`options.vnode(vnode)`**——每次创建 vnode 时触发。compat 用它规范化 props，devtools 用它打标记。
- **`options._root(vnode, parentDom)`**——顶层 `render` 开始时触发。
- **`options._diff(vnode)`**——vnode 被 diff 之前触发。hooks 用它清空“当前组件”。
- **`options._render(vnode)`**——组件的渲染函数执行前触发。hooks 用它设置当前组件、重置 hook 下标。**hooks 挂到组件上，就在这里。**
- **`options._commit(root, commitQueue)`**——diff 之后、提交期间触发。hooks 用它刷新布局 effect。
- **`options.diffed(vnode)`**——vnode 完整 diff 结束后触发。hooks 用它调度被动 effect。
- **`options.unmount(vnode)`**——vnode 被移除时触发。hooks 用它执行清理函数。
- **`options._catchError(error, vnode, oldVNode)`**——任何地方抛错时触发。
- **`options.event(e)`**——每个 DOM 事件到达处理器之前都会过一层它。compat 用它补上 React 合成事件的方法。
- **`options.debounceRendering(cb)`**——由你决定批量渲染*何时*执行（测试里把它设成同步执行）。

插件恪守一个严格的范式：先捕获前任处理器，装上自己的，再在内部调用前任。hooks、compat、devtools 能同时监听同一槽位而互不踩踏，靠的就是它：

```js
let oldRender = options._render;
options._render = vnode => {
    if (oldRender) oldRender(vnode);
    // ...插件的活儿...
};
```

接下来的全文，请时刻记住这句话：**凡在核心里见到 `options._x` 被调用，那里就是扩展点，真正有意思的行为也许住在 hooks 或 compat 里，而不在核心本身。**

## 6. `render`：入口

```js
export function render(vnode, parentDom) {
    if (parentDom == document) parentDom = document.documentElement;
    if (options._root) options._root(vnode, parentDom);

    let isHydrating = vnode && vnode._flags & MODE_HYDRATE;

    // 上一次渲染出的树就藏在 DOM 节点自身上：
    let oldVNode = isHydrating ? null : parentDom._children;
    parentDom._children = createElement(Fragment, null, [vnode]);

    let commitQueue = [], refQueue = [];
    diff(parentDom, parentDom._children, oldVNode || EMPTY_OBJ, /* …context, namespace… */,
         commitQueue, /* …oldDom… */, isHydrating, refQueue, parentDom.ownerDocument);
    commitRoot(commitQueue, parentDom._children, refQueue);
}
```

有三点需要吃透：

1. **旧树挂在 `parentDom._children` 上。** Preact 把上次渲染的 vnode 树附在容器 DOM 节点上。对同一容器再次调用 `render`，它会找到旧树并与之 diff，而非推倒重建。根节点的重新渲染就是这么工作的。
2. **根部永远裹一个 `Fragment`。** 形状统一——树的顶端不过是又一个组件 vnode，diff 无需为根部开特例。
3. **`commitQueue` 和 `refQueue` 是出参。** diff 分成两个阶段：**渲染阶段**（`diff`）计算并应用 DOM 变更，同时收集两份清单：有待执行生命周期/effect 回调的组件（`commitQueue`）和有待绑定的 ref（`refQueue`）；**提交阶段**（`commitRoot`）逐一清空这两份清单。和 React 同一套两阶段模型，机关却少得多。

`hydrate(vnode, parentDom)` 无非是给 vnode 打上 `MODE_HYDRATE` 标记的 `render`。这个标记告诉元素 diff：接管服务端已渲染好的 DOM，不要新建节点，props 的比对也一并跳过（服务端早已设置妥当）。

### `createPortal`：核心里的第二个根

把一棵子树渲染进*另一个* DOM 容器，同时又让它在逻辑上留在原来的 vnode 树里，这便是 portal。这里有一道很新的分界线：自 2026 年 7 月 19 日合并的 [PR #5168](https://github.com/preactjs/preact/pull/5168) 起，`createPortal` 已从 compat 搬进核心。旧实现那套假 DOM 父节点与嵌套 `render()` 随之退场，留下的入口反倒短得叫人疑心它是否藏了机关：

```js
function Portal(props) {
    return props.children;
}

export function createPortal(vnode, container) {
    return createElement(Portal, { _parentDom: container }, vnode);
}
```

机关确实有，只是不在入口里。`Portal` 使用独立的组件 type，而非 `Fragment`，免得组件直接返回 portal 时，被 `diff()` 的 Fragment 展平逻辑拆进普通 children。真正改变渲染去向的是 `_parentDom`：组件 diff 看见它，便把 `parentDom`、namespace 与 `ownerDocument` 一并切到目标容器；若容器身份改变，旧 children 先卸载，再到新容器重新挂载。

子树 diff 完成后，核心把宿主树的 `oldDom` 游标原样接回，并令 portal vnode 的 `_dom` 保持 `null`。于是目标容器里的 DOM 不会混进宿主树的安放账本，context 却仍沿着原来的 vnode 父链流动。portal 由此不再是 compat 在核心外搭出的一座侧楼，而成了 diff 本身认识的一种**新根边界**。

## 7. diff 其一：统一的算法

`diff` 每次只处理一个 vnode，它是整个库跳动的心脏。一个函数，按 type 分派：

```js
export function diff(parentDom, newVNode, oldVNode, globalContext, namespace,
                     excessDomChildren, commitQueue, oldDom, isHydrating, refQueue, doc) {
    let newType = newVNode.type;

    if (newVNode.constructor !== undefined) return null;   // 安全防线

    if (options._diff) options._diff(newVNode);            // 插件槽位

    if (typeof newType == 'function') {
        // ── 组件分支（第 8 节）──
    } else {
        // ── DOM 元素分支（第 9 节）──
        newVNode._dom = diffElementNodes(oldVNode._dom, newVNode, oldVNode, /* … */);
    }

    if (options.diffed) options.diffed(newVNode);          // 插件槽位
    return /* 下一个兄弟节点的 DOM 游标 */;
}
```

几条结构性的事实：

- **遍历是自顶向下的一趟。** 老 React 那种“先建一棵 vnode 树、再行协调”的两步走，在这里并不存在——Preact 边下行边 diff。
- **`diff` 不为 children 递归调用自己。** 它调用 `diffChildren`，后者遍历 children，为每个 child 调用一次 `diff`。递归由这对搭档接力完成。
- **`oldDom`** 贯穿整条递归链。它是一个移动的游标，指向下一个待创建/移动的节点应当插入其前的那个真实 DOM 节点。新节点该接在父容器的何处，全凭它定夺。
- **`excessDomChildren`** 是既有的真实 DOM 子节点清单，水合（hydration）与 `replaceNode` 时借它接管节点、免去新建。
- **两次 `options` 调用**一前一后包住全程——先 `_diff`，后 `diffed`。hooks 把按组件的记账工作悬在这两点上。

两个分支体量都够大，值得各自单开一节。

## 8. diff 其二：组件

`type` 是函数时，Preact 需要一个安放 state、生命周期与 hook 数据的所在。这个地方就是**组件实例**。组件分支的骨架如下：

```text
typeof newType == 'function'
   │
   ├─ 是类组件？   →  newType.prototype.render 存在
   │
   ├─ 取得实例：
   │     • 更新时复用 oldVNode._component
   │     • 否则，若是类组件：    new newType(props, context)
   │     • 否则，若是函数组件：  new BaseComponent(props, context)，
   │                            并令 c.render = doRender（转调该函数）
   │
   ├─ 解析 context（contextType / provider）
   │
   ├─ 派生 state（getDerivedStateFromProps），执行渲染前的生命周期
   │
   ├─ 短路检查：
   │     • newVNode._original === oldVNode._original  → 完全一致，跳过子树
   │     • shouldComponentUpdate(...) === false       → 跳过子树
   │
   ├─ options._render(newVNode)        ◄── HOOKS 在此准备 state
   ├─ renderResult = c.render(props, state, context)   ◄── 你的函数体在此运行
   │
   └─ diffChildren(parentDom, [renderResult], …)       ◄── 递归进入渲染产物
```

### 函数组件是穿了马甲的类组件

这是我灵光乍现的一刻，索性把话挑明：**函数组件与类组件走的是同一套机关。** 当 type 是个不带 prototype `render` 的函数时，Preact 替它套上外壳：

```js
newVNode._component = c = new BaseComponent(newProps, componentContext);
c.constructor = newType;     // 记住这个函数
c.render = doRender;         // 一个垫片
```

而 `doRender` 无非是：

```js
function doRender(props, state, context) {
    return this.constructor(props, context);
}
```

所以调用 `c.render(...)` 就是在调用你的函数。因为总有一个 `BaseComponent` 实例坐镇，`setState`、生命周期方法、ref、hooks 便都有了统一的归宿，无论你写的是类还是函数。调度器和 hooks 层里不存在单独的“函数组件”代码路径——有的只是一个 `render` 恰好转调函数的组件实例。

### 实例与它的各个零件

`BaseComponent` 小得可怜：

```js
export function BaseComponent(props, context) {
    this.props = props;
    this.context = context;
    this._bits = 0;
}
BaseComponent.prototype.render = Fragment;  // 默认 render：渲染 children
```

`_bits` 是与 `_flags` 相仿的位字段，记录的却是组件状态：

- `COMPONENT_DIRTY`——已入队等待重渲染。
- `COMPONENT_FORCE`——调用过 `forceUpdate`；跳过 `shouldComponentUpdate`。
- `COMPONENT_PENDING_ERROR` / `COMPONENT_PROCESSING_EXCEPTION`——错误边界的状态。

### 生命周期的精确顺序

**挂载**时（无旧组件）：

1. 构造实例
2. `getDerivedStateFromProps`（若存在）——否则 `componentWillMount`
3. `render`
4. 把 `componentDidMount` 入队，留到提交阶段执行

**更新**时（旧组件存在）：

1. `getDerivedStateFromProps`——否则 `componentWillReceiveProps`（props 有变时）
2. 短路检查（见下）
3. `componentWillUpdate`
4. `render`
5. `getSnapshotBeforeUpdate`
6. 把 `componentDidUpdate` 入队，留到提交阶段执行

这些都在 `diff` 内部执行；`componentDidMount`/`componentDidUpdate`/snapshot 回调则压入组件的 `_renderCallbacks`，留待 `commitRoot` 触发。

### 两条短路之路

渲染之前，Preact 会极力*避免*渲染：

```js
if (newVNode._original == oldVNode._original ||
    (!(c._bits & COMPONENT_FORCE) &&
     c.shouldComponentUpdate != null &&
     c.shouldComponentUpdate(newProps, c._nextState, componentContext) === false)) {
    // 把旧 DOM + children 指针复制到新 vnode 上，然后：
    break outer;   // 整个子树直接跳过渲染
}
```

- **引用级短路**（`_original` 相等）：父组件重渲染，递给子组件的却是与上次分毫不差的同一个 vnode 对象（提升到外层或记忆化过的 children 常有此事），整棵子树便可被证明纹丝未动，径直跳过。
- **`shouldComponentUpdate`**：经典的逃生舱。`PureComponent`、`memo` 与 hooks 层各装各的 `shouldComponentUpdate`，驱动的正是这条短路。

短路发生时，新 vnode 承袭旧 vnode 的 `_dom` 与 `_children`，children 的 `_parent` 指针也改指新 vnode，整棵树始终自洽。

### 渲染循环（render 期间的 setState）

函数组件的 render 在一个小循环里执行：

```js
do {
    c._bits &= ~COMPONENT_DIRTY;
    if (renderHook) renderHook(newVNode);   // options._render
    tmp = c.render(c.props, c.state, c.context);
    c.state = c._nextState;
} while (c._bits & COMPONENT_DIRTY && ++count < 25);
```

若在 render *期间*调用 state setter，组件会被再度标脏，循环随即同步重跑 render（至多 25 次），而不是另排一轮。这正是官方支持的“渲染期间派生 state”模式；上限用来防死循环。

### Fragment 产物的展开与 context 传播

render 之后：

- 产物是不带 key 的 Fragment 时，直接取用其 children 数组，免掉一层树结构。
- 组件定义了 `getChildContext` 时，其返回对象在递归前并入 `globalContext`，后代便可见之。（这正是 `createContext` 的 provider 底层所用的机制——见第 13 节。）

随后 `diffChildren` 递归进入渲染产物；最后，组件的 render 回调（若有）压入提交队列。

## 9. diff 其三：DOM 元素，props 与事件

`type` 是字符串（或 `null`，即文本）时，我们终于摸到了真实 DOM——这是 `diffElementNodes` 的差事，也是真刀真枪见分晓之处。

### 获取节点

```text
命名空间追踪：  <svg> → SVG ns，  <math> → MathML ns，  其余走 XHTML
               （<foreignObject> 与 MathML 的记号类元素切回 XHTML）

dom = oldVNode._dom
若无 dom：
    先尝试从 excessDomChildren 中认领一个匹配的节点（水合 / replaceNode）
    否则若是文本：    doc.createTextNode(props)
    否则：            doc.createElementNS(namespace, type)
```

正是命名空间处理让 SVG 与 MathML“开箱即用”——老文章里可没有这些。`excessDomChildren` 的认领是水合的精髓：Preact 不新建元素，而是找出标签匹配的那个服务端渲染节点，将其收编。

### 文本节点

`type` 为 `null` 时，vnode 即文本节点，`props` 即字符串。更新只消一行——有变则设 `dom.data`——水合时另有一处特例，免得盖掉服务端的文本。

### props 的 diff（两趟循环）

元素节点的 props 分两趟协调：

```js
// 1) 删掉旧有而新已消失的 props
for (i in oldProps) {
    if (i != 'children' && !(i in newProps) /* …value/checked 例外… */)
        setProperty(dom, i, null, oldProps[i], namespace);
}
// 2) 设置新增或有变化的 props
for (i in newProps) {
    if (i 是 children)       newChildren = value;
    else if (dangerHTML)     newHtml = value;
    else if (i 是 value)     inputValue = value;   // 延后处理——见下文
    else if (i 是 checked)   checked = value;
    else if (oldProps[i] !== value)
        setProperty(dom, i, value, oldProps[i], namespace);
}
```

`children`、`value`、`checked` 与 `dangerouslySetInnerHTML` 被单独拎出，特殊处理。`value`/`checked` 要**等 children 就位后**才应用——`<select>` 的 `value` 只能选中已经创建出来的 `<option>`。

### `setProperty`：一个 prop 如何落地成 DOM

这个函数为每个 prop 拍板：设成 JS property、调用 `setAttribute`、挂上事件监听，还是修补 `style`。逻辑如下：

- **`style`**——字符串径直设到 `cssText`；对象则逐键 diff。数值在此保持原样（补 `px` 是 compat 的事——见第 17 节）。以 `-` 打头的键按自定义属性处理，走 `setProperty`。
- **事件（`onX`）**——此处颇为微妙，值得彻悟。更换处理器时，Preact **绝不**重复调用 `addEventListener`。它把处理器存放在 DOM 节点上，只挂一次共享代理：

  ```js
  if (!dom._listeners) dom._listeners = {};
  dom._listeners[name + useCapture] = value;
  if (value && !oldValue) {
      dom.addEventListener(name, useCapture ? eventProxyCapture : eventProxy, useCapture);
  } else if (!value) {
      dom.removeEventListener(name, /* 代理 */, useCapture);
  }
  ```

  代理在事件分发时现查处理器：

  ```js
  function eventProxy(e) {
      return this._listeners[e.type + useCapture](options.event ? options.event(e) : e);
  }
  ```

  把 `onClick` 从一个函数换成另一个，只是改写 `_listeners`——不触碰任何 DOM。处理器名会转为小写，将 `onClick` 映射为 `click` 事件；带 `Capture` 后缀则路由到捕获阶段的代理。

  **事件时钟。** 真有一个实际存在的 bug 是为此而防的：事件冒泡上浮之际，两跳之间的微任务可能修补 DOM、插入一个*新*节点，而这个新节点刚刚挂上的处理器，竟可能对一个早在它诞生之前就已发生的事件作出响应。Preact 在挂载处理器时为其盖上一个逻辑时钟值（`EVENT_ATTACHED`），又在事件首次分发时为事件盖上时钟值（`EVENT_DISPATCHED`）。若事件的分发戳早于处理器的挂载戳，代理便将其忽略。这里以逻辑计数器取代 `Date.now()`，即便处理器挂载与事件分发落在同一毫秒，先后次序依然不乱。
- **其余一切**——只要名字在元素上存在，Preact 就倾向于设置 **JS property**（`dom[name] = value`），因为更快且类型无误；另有一份写死的排除清单（`width`、`height`、`href`、`list`、`form`、`tabIndex`、`download`、`rowSpan`、`colSpan`、`role`、`popover`），这些必须经 `setAttribute` 方能行为正常。SVG 需要修正名字（`className` → `class`、`xlinkHref` → `href`）。布尔值与 `false` 映射为移除 attribute，`aria-`/`data-` 属性除外——在那里，`false` 与缺省含义确实有别。

### 先递归，后应用受控值

若无 `dangerouslySetInnerHTML`，Preact 先经 `diffChildren` 对 children 做 diff，再清掉一切无 vnode 认领的残余真实 DOM 子节点，最后应用延后的 `value`/`checked`，让受控表单元素各归其位。

## 10. diff 其四：keyed 子节点与偏移算法

这是 Preact 最精巧的部分，也是离老文章与 React 都最远的部分。泡杯咖啡，慢慢看。目标是：给定旧子 vnode 数组与新数组，弄清楚哪个新 child 复用哪个旧 child（连同其 DOM 与组件 state），什么该插入、什么该移动、什么该删除——**而且在常见情形下不分配任何 key→index 的 Map。**

`diffChildren` 分两个阶段运行。

### 阶段 A——构建新数组，为每个 child 配对

`constructNewChildrenArray` 遍历新的 children，对每一个做两件事：

1. **规范化**：把原始类型与数组化为 vnode——字符串/数字化作文本 vnode（`type: null`）；数组化作 `Fragment` vnode；`null`/布尔值/函数化作空位（`null` 槽）。已在同一次渲染中被别处使用的 vnode 会克隆一份，好让它握有自己独立的 DOM/组件指针。
2. 借 `findMatchingIndex` **找出匹配的旧 child**，倚仗的是一个滚动维护的**偏移量（skew）**。

偏移量就是全部的戏法，值得慢下来琢磨。概念上：随着子节点的插入或删除，你预期“下一个”旧 child 所在的位置会发生漂移。`skew` 追踪的正是这一漂移——对下标 `i` 处的每个新 child，其*预期*的旧下标为 `i + skew`。`findMatchingIndex` 先检查这个预期槽位：

```js
function findMatchingIndex(childVNode, oldChildren, skewedIndex, remainingOldChildren) {
    const key = childVNode.key, type = childVNode.type;
    let oldVNode = oldChildren[skewedIndex];
    const matched = oldVNode != null && (oldVNode._flags & MATCHED) == 0;

    // 快路径：预期槽位恰好匹配
    if ((oldVNode === null && key == null) ||
        (matched && key == oldVNode.key && type == oldVNode.type)) {
        return skewedIndex;
    }

    // 否则向左右两侧扇形搜索 key+type 匹配
    if (remainingOldChildren > (matched ? 1 : 0)) {
        let x = skewedIndex - 1, y = skewedIndex + 1;
        while (x >= 0 || y < oldChildren.length) {
            const childIndex = x >= 0 ? x-- : y++;
            oldVNode = oldChildren[childIndex];
            if (oldVNode != null && (oldVNode._flags & MATCHED) == 0 &&
                key == oldVNode.key && type == oldVNode.type) {
                return childIndex;
            }
        }
    }
    return -1;   // 没有匹配 → 这是新节点
}
```

日常情形——尾插、头插、原地更新——快路径百发百中，整场协调是 O(n) 且零分配。唯有真正的乱序才触发双向搜索。

配对既毕，调整偏移量。规则如下（值得慢读）：

```js
if (oldVNode == null || oldVNode._original == null) {
    // 什么都没配上（新节点），或配上了一个“挂载中”的占位
    if (matchingIndex == -1) {
        if (newChildrenLength > oldChildrenLength) skew--;       // 列表变长
        else if (newChildrenLength < oldChildrenLength) skew++;  // 列表变短
    }
    if (typeof childVNode.type != 'function') childVNode._flags |= INSERT_VNODE;
} else if (matchingIndex != skewedIndex) {
    // 配上了，但不在预期位置 → 有东西挪动了
    if (matchingIndex == skewedIndex - 1) skew--;
    else if (matchingIndex == skewedIndex + 1) skew++;
    else {
        if (matchingIndex > skewedIndex) skew--; else skew++;
        childVNode._flags |= INSERT_VNODE;   // 真正的移动/交换 → 标记待插入 DOM
    }
}
```

跑两个实例便豁然开朗：

- **头插** `[1,2,3] → [0,1,2,3]`。下标 0 处的新 child `0` 寻不到匹配（它是新来的）；列表变长，故 `skew--`（skew = −1），`0` 被标记 INSERT。接着，下标 1 处的新 child `1` 预期旧下标为 `1 + (−1) = 0` → 恰好找到旧 `1`。`2`→`2`、`3`→`3` 同理。结果：唯有 `0` 被插入，其余纹丝不动。一次 DOM 操作。
- **交换** `[0,1,2] → [1,0,2]`。下标 0 处的新 `1`，预期旧下标 0，却在下标 1 处寻得旧 `1`（偏移 +……）→ 这是一次移动，标记 INSERT，调整 skew。下标 1 处的新 `0` 找到旧 `0`。新 `2` 原地落定。一个节点被移动。库明确把偏移 1 位当作插入/删除处理，更大的偏移才当作交换；源码注释特意点明：这是体积与最优性之间刻意的取舍。

配上的旧 vnode 获得 `MATCHED` 标记（阶段 A 随后便能看出哪些旧 child *未*被复用）。无匹配的新 DOM vnode 获得 `INSERT_VNODE`。

### 阶段 B——diff 每个 child，安放其 DOM

主循环随即将每个新 child 与其配上的旧 child 做 diff，并安放 DOM：

```js
for (i = 0; i < newChildrenLength; i++) {
    childVNode = newParentVNode._children[i];
    oldVNode = oldChildren[childVNode._index] || EMPTY_OBJ;   // 配上的旧 child
    childVNode._index = i;                                    // 此刻存入最终下标

    let result = diff(parentDom, childVNode, oldVNode, /* … */, oldDom, /* … */);

    newDom = childVNode._dom;
    // …把 ref 变更入队…

    if (childVNode._flags & INSERT_VNODE || oldVNode._children === childVNode._children) {
        oldDom = insert(childVNode, oldDom, parentDom, /* shouldPlace */);
    } else if (typeof childVNode.type == 'function' && result !== undefined) {
        oldDom = result;
    } else if (newDom) {
        oldDom = newDom.nextSibling;
    }
    childVNode._flags &= ~(INSERT_VNODE | MATCHED);
}
newParentVNode._dom = firstChildDom;
```

`oldDom` 是插入游标。对每个 child：

- 带插入标记者（或复制了 children 的短路情形），调用 `insert`：DOM 节点执行 `parentDom.insertBefore(dom, oldDom)`，组件则递归进其 children（组件自身无 DOM，“插入”它意味着插入它的后代）。游标越过安放好的节点前进。
- 否则节点已在正确位置，游标只需推进到下一个兄弟。

portal 是前一条里刻意凿出的例外：`insert` 一旦看见组件带有 `props._parentDom`，便径直交还宿主树原来的 `oldDom`。portal 的后代属于另一个容器，既不能跟着宿主树移动，也不能占走宿主树的插入游标。

大多数 child 既非新增亦非移动，故大多数迭代执行的 DOM 变更是**零**——只是推进游标。性能红利尽在于此。

### 阶段 C——卸载余下的

任何仍未带 `MATCHED` 标记的旧 child 都未被复用，于是移除：

```js
if (remainingOldChildren) {
    for (i = 0; i < oldChildrenLength; i++) {
        oldVNode = oldChildren[i];
        if (oldVNode != null && (oldVNode._flags & MATCHED) == 0) {
            if (oldVNode._dom == oldDom) oldDom = getDomSibling(oldVNode);
            unmount(oldVNode, oldVNode);
        }
    }
}
```

`unmount` 执行 `componentWillUnmount`，解绑 ref（置为 `null`），递归处理 children，移除 DOM 节点，清空 vnode 的指针。`getDomSibling` 保证节点消失时游标依然有效。portal 又是一道容器边界：即便宿主祖先已移除、普通后代本可省掉逐个 DOM 删除，它的 children 仍须从另一个容器里亲手卸下。

### key 为何重要——落到具体处

没有 `key` 时，配对依据是 `type` + 位置。在无 key 列表的头部插入一项，其后*每一个*新 child 都会与旧 child 错位一格 → 扇形搜索或许能把它们重新配对，但若 type 重复，便可能复用*错误的*旧节点、重建 DOM、丢掉组件 state（`<input>` 失焦丢值，子组件被打回原形）。有稳定的 `key`，`findMatchingIndex` 便能将每个新 child 与正确的旧 child 相配，唯有新插入的节点才触碰 DOM。**无论使用还是构建 VDOM，这都是顶顶重要的一条实战规则。**

## 11. 提交阶段

`diff` 返回时，DOM 已与新树相符——看得见的工作已然完成。`commitRoot` 负责收尾，处理那些必须等到 DOM 一致*之后*才能执行的副作用：

```js
export function commitRoot(commitQueue, root, refQueue) {
    // 1) 绑定 ref（按 children 被 diff 的次序）
    for (let i = 0; i < refQueue.length; i++)
        applyRef(refQueue[i], refQueue[++i], refQueue[++i]);

    // 2) 插件槽位——hooks 在此刷新布局 effect
    if (options._commit) options._commit(root, commitQueue);

    // 3) 按树的次序，执行每个入队组件的回调：componentDidMount/Update、
    //    setState 回调、forceUpdate 回调
    commitQueue.some(c => {
        let cbs = c._renderCallbacks;
        c._renderCallbacks = [];
        cbs.some(cb => cb.call(c));
    });
}
```

顺序至关重要，且有保证：

1. **ref** 最先绑定，故 `componentDidMount` 执行时，`this.refs` / `ref.current` 已各就各位。
2. **布局 effect**（`useLayoutEffect`）其次，同步执行，抢在浏览器绘制之前——经由 hooks 填充的 `options._commit` 槽位。
3. **生命周期回调**最后执行。

`applyRef` 既处理对象 ref（`ref.current = value`），也处理回调 ref（`ref(value)`），并且——React 19 的风格——保存回调 ref 可能返回的清理函数，待 ref 解绑时调用。

## 12. 调度器：`setState` 为什么是异步的

老文章里，每一次 state 变化都同步重渲染——好讲，实践中却很糙。现代 Preact 把更新**攒批**，改在微任务中渲染。这些代码全住在 `Component`/调度器里。

### `setState`

```js
BaseComponent.prototype.setState = function (update, callback) {
    let s = (this._nextState != null && this._nextState != this.state)
        ? this._nextState
        : (this._nextState = assign({}, this.state));    // state 只克隆一次

    if (typeof update == 'function') update = update(assign({}, s), this.props);
    if (update) assign(s, update); else return;          // 合并局部更新

    if (this._vnode) {                                   // 仅在已挂载时
        if (callback) this._stateCallbacks.push(callback);
        enqueueRender(this);
    }
};
```

state 累积进 `_nextState`（克隆一份，于是函数式更新器与 Immer 这类冻结 state 的库依然好使），随后组件入队。此刻*尚未*渲染。

### `enqueueRender` 与微任务刷新

```js
const rerenderQueue = [];
let rerenderCount = 0, prevDebounce;

export function enqueueRender(c) {
    if ((!(c._bits & COMPONENT_DIRTY) && (c._bits |= COMPONENT_DIRTY) &&
         rerenderQueue.push(c) && !rerenderCount++) ||
        prevDebounce != options.debounceRendering) {
        prevDebounce = options.debounceRendering;
        (prevDebounce || queueMicrotask)(process);
    }
}
```

每个组件被标脏，且**只**入队一次。刷新（`process`）每批恰好调度一次，挂在下一个微任务上（`queueMicrotask`）——除非你覆盖了 `options.debounceRendering`（测试里将其设为同步执行，你甚至可以设为 `requestAnimationFrame`）。于是一个点击处理器里连着十次 `setState`，只换来下一个时机片的**一次**渲染。

### `process`：按深度排序，逐一清空

```js
function process() {
    let c, l = 1;
    while (rerenderQueue.length) {
        if (rerenderQueue.length > l) rerenderQueue.sort((a, b) => a._vnode._depth - b._vnode._depth);
        c = rerenderQueue.shift();
        l = rerenderQueue.length;
        if (c._bits & COMPONENT_DIRTY) renderComponent(c);
    }
    rerenderQueue.length = rerenderCount = 0;
}
```

队列按树的深度保持有序，**父组件先于子组件渲染**。父组件渲染时若连带重渲染了某个已独立入队的子组件，该子组件此时已然干净（或按序重新入队），不会被渲染两遍。刷新进行中新添的条目（比如 context provider 将订阅者入队）也会以正确的次序并入同一轮。

### `renderComponent`：重渲染一棵子树

```js
function renderComponent(component) {
    const oldVNode = component._vnode, oldDom = oldVNode._dom;
    const parentDom = component._parentDom;
    if (!parentDom) return;

    const newVNode = assign({}, oldVNode);   // 浅克隆
    newVNode._original = oldVNode._original + 1;   // 强制真 diff（绕过引用级短路）

    diff(parentDom, newVNode, oldVNode, component._globalContext, parentDom.namespaceURI,
         /* excessDom */, commitQueue, oldDom == null ? getDomSibling(oldVNode) : oldDom,
         /* isHydrating */, refQueue, parentDom.ownerDocument);

    newVNode._original = oldVNode._original;        // 还原身份
    newVNode._parent._children[newVNode._index] = newVNode;   // 缝回树中
    commitRoot(commitQueue, newVNode, refQueue);

    if (newVNode._dom != oldDom) updateParentDomPointers(newVNode);
}
```

局部更新的魔法，尽在此处。要重渲染一个深居树中的组件，Preact 克隆它的 vnode，抬高 `_original` 使 diff 不致短路，只 diff 这一棵子树，提交，再把新 vnode 缝回父节点的 `_children`。树的其余部分秋毫无犯。

### `getDomSibling` 与 `updateParentDomPointers`

子树局部的 diff 要把 DOM 插到正确位置，就必须回答“我后面紧跟的真实 DOM 节点是谁？”——而无需知晓整棵树的布局。`getDomSibling` 遍历 vnode 树作答：

```js
export function getDomSibling(vnode, childIndex) {
    if (childIndex == null)
        return vnode._parent ? getDomSibling(vnode._parent, vnode._index + 1) : null;

    for (; childIndex < vnode._children.length; childIndex++) {
        let sibling = vnode._children[childIndex];
        if (sibling != null && sibling._dom != null) return sibling._dom;
    }
    return typeof vnode.type == 'function' && !vnode.props._parentDom
        ? getDomSibling(vnode)
        : null;
}
```

它向右在兄弟中寻找第一个拥有 DOM 的；寻不到便爬到父节点继续。唯有 `_parentDom` 不许再爬——那意味着眼前已是 portal 的根边界，边界另一头的 DOM 兄弟活在另一个容器里。因为每个普通 vnode 的 `_dom` 指针都保持最新，它总能寻得正确的插入锚点。

而当组件的第一个 DOM 节点生变，`updateParentDomPointers` 便沿树**向上**走，修正每个祖先的 `_dom`，使日后的 `getDomSibling` 调用依然正确：

```js
function updateParentDomPointers(vnode) {
    if (
        (vnode = vnode._parent) != null &&
        vnode._component != null &&
        !vnode.props._parentDom
    ) {
        vnode._dom = null;
        vnode._children.some(child => {
            if (child != null && child._dom != null) return (vnode._dom = child._dom);
        });
        return updateParentDomPointers(vnode);
    }
}
```

向上修指针也在 `_parentDom` 前收手：portal vnode 的 `_dom` 必须保持 `null`，目标容器里的第一个 DOM 节点绝不能冒充宿主树里的第一个节点。`_dom` + `_parent` + 这两个函数合在一起，便是 Preact 对“如何原地更新树的一部分”这一问题的全部答案——Fiber 在 React 中扮演的角色，这里约莫 30 行就够了。

## 13. Context

`createContext(defaultValue)` 返回的 `Context` 对象本身就是一个组件。provider 所用的是**旧式 context 通道**（`getChildContext`）——组件 diff 本来就会把它并入 `globalContext`——外加一个订阅者集合，实现精准更新：

```js
export function createContext(defaultValue) {
    function Context(props) {
        if (!this.getChildContext) {
            let subs = new Set();
            let ctx = {};
            ctx[Context._id] = this;                    // 以唯一 id 为键

            this.getChildContext = () => ctx;           // 由 diff 并入 globalContext

            this.shouldComponentUpdate = function (_props) {
                if (this.props.value != _props.value) {
                    subs.forEach(c => {                 // 只重渲染订阅者
                        c._bits |= COMPONENT_FORCE;
                        enqueueRender(c);
                    });
                }
            };

            this.sub = c => {                           // 消费者订阅
                subs.add(c);
                let old = c.componentWillUnmount;
                c.componentWillUnmount = () => { subs.delete(c); if (old) old.call(c); };
            };
        }
        return props.children;
    }
    Context._id = '__cC' + i++;
    Context._defaultValue = defaultValue;
    Context.Consumer = (props, contextValue) => props.children(contextValue);
    Context.Provider = Context;
    return Context;
}
```

两条通道并行：

- **沿树而下：** `getChildContext` 以 `Context._id` 为键，将 `this` 置入 `globalContext`。任何 `contextType` 指向该 context 的后代组件，都在 diff 期间读到 `provider.props.value`。`useContext` hook 读的也是同一处。
- **精准更新：** provider 的 `value` 变化时，它不重渲染整棵子树，而是强制入队*仅仅*那些经 `sub` 订阅过的组件。正因消费者是直接订阅的，context 更新才能跳过中间 `memo` 过的组件，依然抵达深处的消费者。订阅在卸载时自动清理——手段是包一层 `componentWillUnmount`。

`Context.Consumer` 是一个调用 `props.children(value)` 的函数组件——render-prop 形式。`useContext` 则是 hook 形式（第 16 节）。

## 14. Ref

ref 要么是对象 `{ current }`（出自 `createRef` 或 `useRef`），要么是回调。diff 在协调 children 期间将 ref 变更收集进 `refQueue`，于 `commitRoot` 中经 `applyRef` 应用：

```js
export function applyRef(ref, value, vnode) {
    if (typeof ref == 'function') {
        if (typeof ref._unmount == 'function') ref._unmount();   // 先执行上一次的清理
        if (typeof ref._unmount != 'function' || value != null)
            ref._unmount = ref(value);   // 回调 ref 可返回清理函数（React 19）
    } else ref.current = value;
}
```

对类组件及有实例的函数组件，ref 设为组件实例；对元素则设为 DOM 节点。卸载时，ref 以 `null` 被调用（或 `current` 被置空）。ref 只在两次渲染之间生变时才触发——协调 child 时会比较 `oldVNode.ref != childVNode.ref` 再入队，且先解绑旧的。

## 15. 错误边界

diff/提交期间的任何抛错都会路由至 `options._catchError`，其核心实现沿 vnode 树**向上**寻找最近的、能处理此错误的组件：

```js
export function _catchError(error, vnode) {
    for (; (vnode = vnode._parent); ) {
        let component = vnode._component;
        if (component && !(component._bits & COMPONENT_PROCESSING_EXCEPTION)) {
            component._bits |= COMPONENT_FORCE;
            let ctor = component.constructor;
            if (ctor && ctor.getDerivedStateFromError != null) {
                component.setState(ctor.getDerivedStateFromError(error));
                handled = component._bits & COMPONENT_DIRTY;
            }
            if (component.componentDidCatch != null) {
                component.componentDidCatch(error, {});
                handled = component._bits & COMPONENT_DIRTY;
            }
            if (handled) {                                   // 它重渲染了 → 边界接住了
                component._bits |= COMPONENT_PENDING_ERROR;
                return;
            }
        }
    }
    throw error;   // 无人接招 → 重新抛出
}
```

定义了 `getDerivedStateFromError` 或 `componentDidCatch` 的组件即是**错误边界**。找到边界后，强制其重渲染（想必是切换为兜底 UI）；`COMPONENT_PENDING_ERROR`/`PROCESSING_EXCEPTION` 这两位则防止同一个错误在恢复途中被同一边界再次捕获。若无任何边界，错误便重新抛给宿主。compat 在此之上再加一层，拦截抛出的 **promise** 以支撑 Suspense（第 18 节）。

## 16. Hooks：全景图

Hooks **不在核心里**——说实话，这一点一旦想通，hooks 表面上一半的怪癖便不再怪。它是一个独立模块，在第 5 节那些 `options` 槽位上安装处理器。核心的组件 diff 对它们一无所知，只在执行组件前调用 `options._render(vnode)`——而这正是 hooks 悄然滑入的缝隙。

### hook state 的栖身之所

每个组件实例在头一回运行 hook 时都会获得一个 `__hooks` 对象：

```js
currentComponent.__hooks = {
    _list: [],            // 每次 hook 调用一条，按调用次序排列
    _pendingEffects: []   // 待执行的被动 effect，绘制后运行
};
```

`getHookState(index, type)` 返回 `_list[index]`，首次渲染时将列表撑长：

```js
function getHookState(index, type) {
    if (options._hook) options._hook(currentComponent, index, currentHook || type);
    const hooks = currentComponent.__hooks ||
        (currentComponent.__hooks = { _list: [], _pendingEffects: [] });
    if (index >= hooks._list.length) hooks._list.push({});
    return hooks._list[index];
}
```

**hook 纯按调用次序寻址。** 函数里第一个 `useState` 是 0 号槽，下一个 hook 是 1 号槽，以此类推。这正是*不能*有条件地调用 hook 的缘由：一个跳过某 hook 的 `if` 会使此后所有下标错位，败坏 hook 调用与所存 state 之间的映射。没有名字，没有 key——只有位置。（没错，那条 lint 规则冲你大吼，真正原因便是这个，绝非什么随性的风格洁癖。）

### hooks 如何搭上渲染：`options` 的接线

hooks 模块装上这些处理器（每一个都链接前一个）：

- **`options._diff`**——任何 vnode 被 diff 之前触发。清空 `currentComponent = null`。
- **`options._render`**——组件 render 执行前一刻触发。性命攸关的一个：

  ```js
  options._render = vnode => {
      currentComponent = vnode._component;   // “即将运行 hooks 的那个组件”
      currentIndex = 0;                      // 槽位计数器归零
      const hooks = currentComponent.__hooks;
      if (hooks) {
          // …刷新 state 更新 / 执行重入渲染遗留的待处理 effect…
      }
  };
  ```

  随后你的函数体调用 `useState()` 时，这次调用便读取 `currentComponent`、`currentIndex++`，以此找到自己的槽位。“当前组件”是一个模块级变量——这便是那个著名的“hooks 依赖渲染器设置的全局指针”设计。
- **`options.diffed`**——组件 diff 之后，若有待执行的被动 effect，便调度其于绘制后运行；随后清空 `currentComponent`。
- **`options._commit`**——提交期间，同步执行本组件的**布局** effect（先清理，后 effect）。
- **`options.unmount`**——组件卸载时，执行每个 hook 的清理函数。

于是一次 hook 调用的生命周期便是：`_diff` 清空指针 → `_render` 设置指针、下标归零 → 你的函数运行，hooks 读写各自的槽位 → `diffed` 调度被动 effect → `_commit` 执行布局 effect → 移除时，`unmount` 执行清理函数。

### `useState` 与 `useReducer`

`useState` 就是 reducer 平凡到极致的 `useReducer`：

```js
export function useState(initialState) {
    currentHook = 1;
    return useReducer(invokeOrReturn, initialState);   // invokeOrReturn(arg,f)=typeof f=='function'?f(arg):f
}
```

`useReducer` 在槽位里存 `[value, dispatch]`。dispatch 计算下一个 state，只在确有变化时才调度渲染：

```js
export function useReducer(reducer, initialState, init) {
    const hookState = getHookState(currentIndex++, 2);
    hookState._reducer = reducer;
    if (!hookState._component) {
        hookState._value = [
            init ? init(initialState) : invokeOrReturn(undefined, initialState),
            action => {
                const currentValue = hookState._nextValue ? hookState._nextValue[0] : hookState._value[0];
                const nextValue = hookState._reducer(currentValue, action);
                if (!Object.is(currentValue, nextValue)) {
                    hookState._nextValue = [nextValue, hookState._value[1]];
                    hookState._component.setState({});   // 调度一次渲染
                }
            }
        ];
        hookState._component = currentComponent;
        // …装上起短路作用的 shouldComponentUpdate（见下）…
    }
    return hookState._value;
}
```

注意 dispatch 优先读取 `_nextValue`（若存在），于是渲染发生之前连续多次 dispatch 也能正确衔接成链。那个 `setState({})` 是一次空更新，唯一的差事就是把组件入队。

**短路之道。** 首次使用时，带 state 的 hook 会在组件上装一个 `shouldComponentUpdate`，将待定的 hook 值落定，并判定是否确有变化：

```js
function updateHookState(p, s, c) {
    const hooksList = hookState._component.__hooks._list;
    let shouldUpdate = hookState._component.props !== p || hooksList.every(x => !x._nextValue);
    hooksList.some(hookItem => {
        if (hookItem._nextValue) {
            const currentValue = hookItem._value[0];
            hookItem._value = hookItem._nextValue;
            hookItem._nextValue = undefined;
            if (!Object.is(currentValue, hookItem._value[0])) shouldUpdate = true;
        }
    });
    return prevScu ? prevScu.call(this, p, s, c) || shouldUpdate : shouldUpdate;
}
```

正是它让“state 设为同值 → 组件不再重渲染”得以成立（与 React 一致），同时仍可与用户自定义的 `shouldComponentUpdate` 叠合。与之配对的 `componentWillUpdate` 保证 `forceUpdate`（它跳过 sCU）时同样执行这次落定。

### Effect：`useEffect` 与 `useLayoutEffect`

两者都逐元素以 `Object.is` 比较依赖数组，区别仅在**执行的时机**：

```js
export function useEffect(callback, args) {
    const state = getHookState(currentIndex++, 3);
    if (!options._skipEffects && argsChanged(state._args, args)) {
        state._value = callback;
        state._pendingArgs = args;
        currentComponent.__hooks._pendingEffects.push(state);   // → 绘制后执行
    }
}

export function useLayoutEffect(callback, args) {
    const state = getHookState(currentIndex++, 4);
    if (!options._skipEffects && argsChanged(state._args, args)) {
        state._value = callback;
        state._pendingArgs = args;
        currentComponent._renderCallbacks.push(state);          // → 提交期间执行
    }
}
```

- **`useLayoutEffect`** 压入 `_renderCallbacks`，由 `commitRoot` 经 `options._commit` 槽位清空——**在 DOM 变更之后、浏览器绘制之前同步执行。** 测量或修改 DOM、且绝不能让用户看见中间状态的场合，用它。
- **`useEffect`** 压入 `__hooks._pendingEffects`。组件 diff 完毕，`options.diffed` 调度一次“下一帧绘制之后”的刷新。这一调度将 `requestAnimationFrame` 与 `setTimeout` 兜底（35 ms，约 30 Hz）组合在一起，纵然标签页退居后台、rAF 永不触发，effect 也照跑不误：

  ```js
  function afterNextFrame(callback) {
      const done = () => { clearTimeout(timeout); if (HAS_RAF) cancelAnimationFrame(raf); setTimeout(callback); };
      const timeout = setTimeout(done, RAF_TIMEOUT);
      let raf; if (HAS_RAF) raf = requestAnimationFrame(done);
  }
  ```

effect 返回的函数即其**清理函数**，存为 `_cleanup`。清理函数在 effect 重跑之前（依赖变化时）与卸载时执行。执行器小心地在每次清理/effect 前后保存与恢复 `currentComponent`，因为 effect 自己也可能调用 `render()`，挪动那个全局指针：

```js
function invokeEffect(hook) {
    const comp = currentComponent;
    hook._cleanup = hook._value();
    currentComponent = comp;
}
```

### 其余的 hooks

- **`useRef(initial)`** 不过是个记忆化的盒子：`useMemo(() => ({ current: initial }), [])`。一个跨渲染稳定存活的对象。
- **`useMemo(factory, deps)`** 只在 `deps` 变化时（经 `argsChanged`）重新计算 `factory()`。**`useCallback(fn, deps)`** 即 `useMemo(() => fn, deps)`。
- **`useContext(context)`** 从当前组件的 context 中读出 provider 并订阅更新：

  ```js
  export function useContext(context) {
      const provider = currentComponent.context[context._id];
      const state = getHookState(currentIndex++, 9);
      state._context = context;
      if (!provider) return context._defaultValue;   // 没有 provider → 取默认值
      if (state._value == null) { state._value = true; provider.sub(currentComponent); }
      return provider.props.value;
  }
  ```

  订阅意味着 provider 的 value 变化时消费者会重渲染，即便隔着 `memo` 边界（第 13 节）。
- **`useImperativeHandle(ref, create, deps)`** 筑于 `useLayoutEffect` 之上：提交后赋值 `ref.current = create()`（或调用回调 ref），ref 被追加进依赖列表，ref 身份变化时便会重新执行。
- **`useErrorBoundary(cb)`** 在实例上接一个 `componentDidCatch`，将错误存入配对的 `useState` 并调用你的回调，返回 `[error, reset]`。
- **`useId()`** 生成树稳定的 id（如 `P0-3`）：向上寻至最近的“掩码”节点——一个从渲染根部传播下来的计数器（跨 Suspense/Portal 边界亦然）。因这一上行遍历是确定性的，服务端与客户端产出的 id 完全一致——水合需要的正是这个。
- **`useDebugValue(value, fmt)`** 经 `options.useDebugValue` 将标签转交 devtools；生产环境没有 devtools，它便什么也不做。

## 17. `preact/compat`：伪装成 React

`preact/compat` 使 Preact 成为 React 的即插即用替身。这是一场魔术——而一切高明的魔术一样，大半靠的是障眼法：它以 React 的名字重新导出核心，再给 `options` 打补丁，将 React 的语义翻译成 Preact 的。绝大多数功能仍以插件或薄包装实现——核心根本不必知道 React 给它们起了什么名字。

`createPortal` 恰好把这层关系照得最清楚：compat 如今只调用核心的 `createPortal`，再给返回的 vnode 添一个 `containerInfo`，供 React 生态辨认；真正改换渲染根部的机关，已经住进核心（[§6]）。

### props 与元素的规范化（`options.vnode`）

compat 装了一个 `options.vnode` 处理器，在 DOM 元素的 props 抵达 diff 之前，将其改写为 React 的惯例：

- `className` → `class`；两者保持同步，`className` 做成 getter，读取无碍。
- input/textarea 上的 `onChange` → `onInput`（React 的“change”每次键入都触发）；file/checkbox/radio 上的 `onChange` 原样不动。`onDoubleClick` → `ondblclick`；`onFocus`/`onBlur` → 可冒泡的 `onfocusin`/`onfocusout`。
- `style` 的数值补上 `px`，除非该属性无单位（一个正则编码了 `opacity`、`zIndex`、`flex` 之类的无单位集合）。
- 适时将 `defaultValue` 映射到 `value`；受控的 `<select multiple>` 与带 `defaultValue` 的 `<select>` 被翻译成 option children 上的 `selected` 标记。
- 驼峰式的 SVG attribute 转为短横线小写。
- 组件的 `defaultProps` 并入 props。
- 每个 vnode 都被盖上 `$$typeof = Symbol.for('react.element')`，好让 `react-is` 式的检查通过；类组件的 ref 从 props 提取到 vnode 的 `ref` 上。

它还在 `options.diffed` 里修了一个 `<textarea>` 取值的边界情形。

### 合成事件（`options.event`）

React 的处理器收到的是带有额外方法的合成事件。compat 经 `options.event` 槽位给每个事件补上这些方法——这个槽位，正是核心事件代理在调用你的处理器之前必经之处：

```js
options.event = e => {
    e.persist = () => {};
    e.isPropagationStopped = () => e.cancelBubble;
    e.isDefaultPrevented = () => e.defaultPrevented;
    return (e.nativeEvent = e);
};
```

### `memo`

包上一层，让组件只在 props 变化时重渲染（浅比较，或你自定义的比较器）——手段是装一个 `shouldComponentUpdate` 来驱动 diff 的短路：

```js
export function memo(c, comparer) {
    function shouldUpdate(nextProps) {
        const ref = this.props.ref;
        if (ref != nextProps.ref && ref) { /* 解绑旧 ref */ }
        return comparer ? !comparer(this.props, nextProps) || ref != nextProps.ref
                        : shallowDiffers(this.props, nextProps);
    }
    function Memoed(props) { this.shouldComponentUpdate = shouldUpdate; return createElement(c, props); }
    Memoed._forwarded = Memoed.prototype.isReactComponent = true;
    Memoed.type = c;
    return Memoed;
}
```

`shallowDiffers` 在任何自有 prop 以 `Object.is` 不等时返回 true——`PureComponent` 用的也是同一块基石。

### `forwardRef`

让函数组件以第二个参数接收 `ref`（自动运行时问世之前，把 ref 透传过包装层的办法）。它克隆一份剔除 `ref` 的 props，以 `(props, ref)` 调用你的函数，并给产物盖上 `react.forward_ref` 符号与一个 `render` 属性——某些库（mobx-react）会检查它。

### `PureComponent`

`Component` 的子类，自带对 props 与 state 一并浅比较的 `shouldComponentUpdate`。不必亲手写比较，便得纯渲染短路。

### React 18 的 hooks 与入口

compat 提供了并发时代的 hooks；鉴于 Preact 是同步的，大多是务实的垫片：

- `useTransition` → `[false, cb => cb()]`，`startTransition(cb) => cb()`，`useDeferredValue(v) => v`，`useInsertionEffect` → `useLayoutEffect`。Preact 没有并发模式，“transition”便是同步执行。
- `useSyncExternalStore(subscribe, getSnapshot)` 是真实现：读取快照并保存，在 effect 中订阅，快照变化（以 `Object.is` 校验）时强制更新——标准的外部存储模式。
- `flushSync(cb)` 临时将 `options.debounceRendering` 设为同步执行，强制立即刷新。
- `findDOMNode`、`unmountComponentAtNode`、`createFactory`、`isValidElement`、`isMemo`、`Children`、`StrictMode`（`Fragment` 的别名）、`unstable_batchedUpdates`（原样透传的空操作）将 API 补全。
- `version` 报告 `'18.3.1'`；那个大名鼎鼎的 `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED` 对象则经 `ReactCurrentDispatcher` 暴露 hooks，让那些伸手探入 React 内部的库依然能运转。

`Children`（`map`/`forEach`/`count`/`only`/`toArray`）是 `toChildArray` 的薄包装，后者把嵌套的 children/数组拍平成一份扁平的 vnode 列表——对 Preact 而言基本是空操作，存在只为 API 对齐。

## 18. Suspense 与 lazy 深入

Suspense 筑于一个观念之上：**组件可以抛出一个 promise，意为“我还没准备好”。** compat 给 `options._catchError` 打补丁，在常规错误路径之前拦截抛出的 thenable：

```js
options._catchError = (error, newVNode, oldVNode, errorInfo) => {
    if (error.then) {                                  // 是 promise → 挂起
        let vnode = newVNode;
        while ((vnode = vnode._parent)) {
            let component = vnode._component;
            if (component && component._childDidSuspend) {
                if (newVNode._dom == null) {           // 保住当前 DOM
                    newVNode._dom = oldVNode._dom;
                    newVNode._children = oldVNode._children;
                }
                return component._childDidSuspend(error, newVNode);
            }
        }
    }
    oldCatchError(error, newVNode, oldVNode, errorInfo);   // 否则走常规错误路径
};
```

于是抛出的 promise 一路上浮至最近的 `Suspense`，调用其 `_childDidSuspend`。此方法：

1. 记下挂起的组件，pending 计数加一。
2. 将挂起者的 `_parentDom` 置空，使其挂起期间排上的渲染尽数空转（免得搅动调度器）。
3. 首次挂起时（且不在水合中），调用 `setState` 将 children 换作 `fallback`，真正的 children 则搁置一旁（`_detachOnNextRender`）。
4. 订阅该 promise；resolve 时计数减一，一旦归零，恢复搁置的 children，恢复 `_parentDom`，对挂起者执行 `forceUpdate`。

`Suspense.prototype.render` 返回两个 fragment——children（挂起期间为 `null`）与 fallback（仅挂起期间存在）——摘除时则将搁置的子树深克隆到文档之外的父节点，使其隐藏期间的 effect/清理函数不致触发。水合时，真实的服务端标记被刻意留在屏幕上，待数据 resolve 后再行水合，而非闪一下 fallback。

`lazy(loader)` 是最常见的挂起来源：

```js
export function lazy(loader) {
    let prom, component, error, resolved;
    function Lazy(props) {
        if (!prom) prom = loader().then(m => { component = m.default || m; resolved = true; },
                                        e => { error = e; resolved = true; });
        if (error) throw error;
        if (!resolved) throw prom;                 // import resolve 之前一直挂起
        return createElement(component, props);
    }
    return Lazy;
}
```

首次渲染抛出 import 的 promise（挂起 → 显示 fallback）；模块加载完毕，Suspense 边界强制更新，`Lazy` 渲染出真正的组件。

## 19. 其余的包

- **`preact/debug`**——开发期 import 一次即可（`import 'preact/debug'`）。它给 `options` 打补丁，加上开发者级的诊断：在渲染之外或次序错乱地调用 hooks 时报错；key 重复、非法嵌套（`<table>` 缺 `<tbody>`）、错误/缺失的 prop 类型（经可选的 `propTypes`）、把 vnode 当 prop 传下却不渲染、渲染到非法容器，则发出警告。它还借向上遍历 `_parent` 为错误构建人类可读的**组件栈**。这一切都不会进入生产构建。
- **`preact/devtools`**——`import 'preact/devtools'` 将运行中的应用接入 React DevTools 浏览器扩展，同样经由 `options` 槽位，于是你能在熟悉的界面里检视 Preact 的树、props、state 与 hooks。
- **`preact/test-utils`**——提供 `act(callback)`：执行回调，随后同步刷新渲染队列**与** effect（将 `options.requestAnimationFrame`/`debounceRendering` 切成同步），测试因此可以断言 effect 之后的 DOM，无需定时器。另有 `setupRerender`/`teardown` 辅助函数。
- **`preact/jsx-runtime`**——第 4 节已述：自动转换所用的 `jsx`/`jsxs`/`jsxDEV` 工厂，外加 SSR 字符串辅助函数。

## 20. 动手写一个 VDOM：按部就班的清单

倘若你的目标是真刀真枪地*写*一个 VDOM 库——你确实该至少试一次——就按这个顺序实现。每一步都能单独测试，且筑于前一步之上。所需的一切，上文都已讲明。

1. **VNode + `h()`。** 普通对象，带 `type`、`props`、`key`、`ref`，以及空的 `_children`/`_dom`/`_parent` 槽位。把 `key`/`ref` 从 props 里提出来。（[§3]、[§4]）
2. **仅挂载的渲染。** 从 vnode 树递归创建真实 DOM 并追加进去。先不做 diff。证明静态树能渲染出来。（[§6]、[§9]）
3. **元素 diff。** 给定同类型的新旧 vnode，修补 props（两趟循环：删消失的，设有变化的），按下标递归进 children。加上事件系统：每节点一个共享代理，处理器存于节点之上，更新时替换。（[§9]）
4. **keyed children diff。** 加上 `key`+`type` 匹配。先为正确性用简单的 key→index Map；日后再优化为偏移量启发式。追踪哪些旧 child 未被配上并予以卸载。正确性就系于这一步——好好测乱序、插入、删除与 state 保持。（[§10]）
5. **组件。** 让 `type` 可为函数；创建背后的实例使 state 有容身之所；把函数组件裹一层，与类组件同路而行。按正确次序执行生命周期。加上引用级与 `shouldComponentUpdate` 两条短路。（[§8]）
6. **调度器。** `setState` 累积进 `_nextState`，标脏实例，只入队一次，调度单次微任务刷新。按深度给队列排序，父组件先行渲染。克隆 vnode、原地 diff，重渲染一棵子树。（[§12]）
7. **局部更新的 DOM 安放。** 实现 `getDomSibling`（遍历 vnode 树寻得下一个真实 DOM 节点），局部渲染后沿树向上保持 `_dom` 指针正确，使深处的更新插到正确位置而不惊动根部。（[§12]）
8. **两阶段提交。** 把“计算并应用 DOM 变更”与“触发 ref，继而布局 effect，继而生命周期回调”一分为二。diff 期间收集 ref 与回调，事后统一清空。（[§11]）
9. **插件接缝。** 加一个 `options` 式的对象，带空的回调槽位，于创建时/渲染前/diff 后/提交时/卸载时触发。证明你能在它之上筑起高楼而不碰核心。（[§5]）
10. **Hooks（架于接缝之上）。** 每实例一份有序的 hook 列表，一个在渲染前槽位设置、下标归零的“当前组件”指针，会调度渲染的 state setter，以及两条 effect 队列——提交时清空一条（布局），绘制后清空一条（被动）——皆有清理函数。先造 `useState`/`useReducer`，再造 `useEffect`，而后派生出 `useMemo`/`useRef`/`useCallback`/`useContext`。（[§16]）
11. **Context、ref、错误边界。** Context 走 child-context 通道，辅以订阅者集合实现精准更新；ref 于提交时应用；错误沿 `_parent` 冒泡至最近的边界。（[§13]、[§14]、[§15]）
12. **兼容层（可选）。** 先在核心用 `_parentDom` 筑出 portal 的新根边界，再让 compat 复用 `createPortal`、只补 `containerInfo`；其余 props/事件规范化与 `memo`/`forwardRef`/`Suspense`，仍架在插件接缝之上。（[§6]、[§17]、[§18]）

按此顺序做完，你便重建了一个 Preact——而且每一行都了然于胸。

## 21. 附录：下划线字段速查表

源码以下划线打头的字段表示“私有”内部实现（生产构建会把它们压缩成单个字母）。逐一破译：

**VNode 上：**

| 字段         | 含义                                                                  |
| ------------ | --------------------------------------------------------------------- |
| `_children`  | 子 vnode 数组（使其成为树节点）                                       |
| `_parent`    | 父 vnode（向上遍历）                                                  |
| `_dom`       | 本 vnode 拥有的第一个真实 DOM 节点                                    |
| `_component` | 背后的组件实例（函数/类组件）                                         |
| `_depth`     | 树深度；为重渲染队列排序                                              |
| `_original`  | 版本戳；新旧相等 ⇒ 子树可跳过                                         |
| `_index`     | 兄弟中的位置（配对期间兼作暂存）                                      |
| `_flags`     | 位字段：`INSERT_VNODE`、`MATCHED`、`MODE_HYDRATE`、`MODE_SUSPENDED`   |
| `_mask`      | `useId` 的 id 命名空间，自根部传播而下                                |

**组件实例上：**

| 字段               | 含义                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| `_vnode`           | 当前由此实例支撑的 vnode                                              |
| `_parentDom`       | 本组件渲染进去的 DOM 容器                                             |
| `_globalContext`   | 本组件可见的、合并后的旧式 context                                    |
| `_nextState`       | 提交前由 `setState` 累积的待定 state                                  |
| `_bits`            | 位字段：`DIRTY`、`FORCE`、`PENDING_ERROR`、`PROCESSING_EXCEPTION`     |
| `_renderCallbacks` | 提交时执行的回调（含布局 effect）                                     |
| `_stateCallbacks`  | 提交时执行的 `setState` 回调                                          |
| `__hooks`          | `{ _list, _pendingEffects }`——本组件的 hook state                     |

**hook 槽位上（`__hooks._list[i]`）：**

| 字段           | 含义                                                                  |
| -------------- | --------------------------------------------------------------------- |
| `_value`       | hook 存储的值（如 `[state, dispatch]`、memo 的结果）                  |
| `_nextValue`   | state hook 在下次渲染前的待定值                                       |
| `_args`        | 上一次的依赖数组（供 memo/effect 检测变化）                           |
| `_pendingArgs` | 等待提交的依赖数组                                                    |
| `_cleanup`     | effect 返回的函数，重跑/卸载前执行                                    |
| `_component`   | 所属组件（state hook 用）                                             |

### 建议的阅读与调试路线

按这次序读源码，旁边开着本文对应的章节：

1. flag/常量定义（篇幅小，奠定词汇表）——[§3]
2. vnode 的创建——[§3]、[§4]
3. `options`（只有两行，却是全篇的脊柱）——[§5]
4. `render`/`hydrate`——[§6]
5. diff：先元素分支，后组件分支——[§7]、[§9]、[§8]
6. children 协调（最难、也最值得的部分）——[§10]
7. 调度器——[§12]
8. hooks——[§16]

[§3]: #_3-vnode-preact-的原子
[§4]: #_4-createelement-与-jsx
[§5]: #_5-options-万物的插件基座
[§6]: #_6-render-入口
[§7]: #_7-diff-其一-统一的算法
[§8]: #_8-diff-其二-组件
[§9]: #_9-diff-其三-dom-元素-props-与事件
[§10]: #_10-diff-其四-keyed-子节点与偏移算法
[§11]: #_11-提交阶段
[§12]: #_12-调度器-setstate-为什么是异步的
[§13]: #_13-context
[§14]: #_14-ref
[§15]: #_15-错误边界
[§16]: #_16-hooks-全景图
[§17]: #_17-preact-compat-伪装成-react
[§18]: #_18-suspense-与-lazy-深入
