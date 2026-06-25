---
title: "Mini Vue：从响应式到模板编译"
---

# Mini Vue：从响应式到模板编译

**目的**：用一个最小可解释实现，看清 Vue 2 风格响应式系统、依赖收集和模板编译如何串成闭环。

这篇内容整理自一个独立的 `mini-vue` 教学实现，但在文档站里改成了**纯讲解版**。  
不放交互面板，只保留最关键的原理、代码结构和思考路径。

需要先说清楚一点：这里讲的是**Vue 2 风格的教学模型**，核心基于 `Object.defineProperty`。  
它非常适合建立响应式心智模型，但并不等同于现代 Vue 3 在生产环境中的完整内部实现。Vue 3 的核心机制已经转向 `Proxy + effect / track / trigger`。

## **1. 先看最终要解决什么问题**

一个最小版 Vue，至少要回答四个问题：

1. 为什么 `vm.message` 能直接访问到 `data.message`
2. 为什么模板里用了 `message`，数据变化后页面会自动更新
3. 为什么 `person.name` 这种嵌套字段也能联动
4. 为什么 `v-model` 能同时做到“数据改了，输入框变”和“输入框改了，数据也变”

如果把这四个问题都打通，一个最小可运行的 Vue 闭环就成立了。

## **2. 整体架构**

这个 mini-vue 只保留了 5 个核心角色：

| 类 / 模块  | 作用                                      |
| ---------- | ----------------------------------------- |
| `Vue`      | 入口类，负责初始化、代理 `data`、启动编译 |
| `Observer` | 把普通对象转换成响应式对象                |
| `Dep`      | 依赖管理器，记录“谁依赖了当前字段”        |
| `Watcher`  | 把“数据字段”和“更新函数”绑定起来          |
| `Compiler` | 扫描模板，处理 `{{ }}` 和 `v-model`       |

可以把它理解成一条固定链路：

`初始化实例 -> data 响应式化 -> 编译模板 -> 收集依赖 -> 数据变化 -> 通知 Watcher -> 更新 DOM`

这套设计的关键不在于“代码多高级”，而在于它把下面这句话做成了现实：

**模板里用到的数据，会被记录；数据一变，只更新真正依赖它的地方。**

## **3. Vue 入口：先代理，再响应式化，再编译**

入口类本身并不复杂，但顺序很重要：

```js
class Vue {
  constructor(options) {
    this.$options = options || {}
    this.$el = typeof options.el === 'string'
      ? document.querySelector(options.el)
      : options.el
    this.$data = options.data || {}

    this.proxyData(this.$data)
    new Observer(this.$data)
    new Compiler(this)
  }
}
```

这里有三个动作：

- `proxyData`：把 `vm.$data.message` 代理成 `vm.message`
- `Observer`：把 `data` 里的字段变成可追踪的响应式字段
- `Compiler`：扫描模板，把数据和 DOM 绑定起来

这个顺序有明确依赖关系。  
如果还没响应式化就开始编译模板，后面的依赖收集就接不上；如果不先代理 `data`，实例层访问体验又会变差。

## **4. proxyData：让 data 挂到实例上**

`proxyData` 解决的是使用体验问题：它让模板和业务代码可以直接写 `message`，把底层的 `data.message` 访问隐藏起来。

```js
proxyData(data) {
  Object.keys(data).forEach((key) => {
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: true,
      get: () => data[key],
      set: (newValue) => {
        if (data[key] !== newValue) {
          data[key] = newValue
        }
      }
    })
  })
}
```

这样一来：

- 读取 `vm.message`，本质还是读取 `vm.$data.message`
- 修改 `vm.message`，本质还是写入 `vm.$data.message`

它不直接负责更新视图，但它给后续所有模块统一了访问入口。  
模板里、业务代码里、Watcher 里，大家都可以围绕同一组 key 工作。

## **5. Observer：把对象变成可感知的对象**

这一层是真正的响应式基础。核心思路是：**给每个字段安装 getter / setter**。

```js
class Observer {
  constructor(data) {
    this.walk(data, '')
  }

  walk(data, basePath) {
    if (!data || typeof data !== 'object') return
    Object.keys(data).forEach((key) => {
      const path = basePath ? `${basePath}.${key}` : key
      this.defineReactive(data, key, data[key], path)
    })
  }

  defineReactive(obj, key, val, path) {
    const dep = new Dep(path)
    this.walk(val, path)

    Object.defineProperty(obj, key, {
      get: () => {
        if (Dep.target) dep.addSub(Dep.target)
        return val
      },
      set: (newValue) => {
        if (newValue === val) return
        val = newValue
        this.walk(newValue, path)
        dep.notify()
      }
    })
  }
}
```

这里有两点最关键：

- `getter` 负责依赖收集
- `setter` 负责触发更新

`walk` 的递归也很重要。  
因为它会继续向下处理对象字段，所以 `person.name` 这样的路径也能进入响应式系统，形成多层响应式。

## **6. Dep 和 Watcher：为什么能精准更新**

很多人第一次学响应式时，最核心的困惑通常是：

**数据变了以后，框架到底怎么知道该更新谁？**

答案就是 `Dep + Watcher`。

### **6.1 Dep：每个字段自己的订阅中心**

```js
class Dep {
  constructor(path) {
    this.path = path
    this.subs = new Set()
  }

  addSub(watcher) {
    if (!watcher || typeof watcher.update !== 'function') return
    this.subs.add(watcher)
  }

  notify() {
    this.subs.forEach((watcher) => watcher.update())
  }
}

Dep.target = null
```

每个响应式字段都对应一个自己的 `Dep`。  
它可以理解为“这个字段专属的订阅列表”。

### **6.2 Watcher：数据和更新函数之间的桥**

```js
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    this.key = key
    this.cb = cb

    Dep.target = this
    this.oldValue = this.getValue(vm, key)
    Dep.target = null
  }

  update() {
    const newValue = this.getValue(this.vm, this.key)
    if (newValue !== this.oldValue) {
      this.oldValue = newValue
      this.cb(newValue)
    }
  }
}
```

这里最值得记住的是 `Dep.target`。

它的作用可以概括成一句话：

**在依赖收集窗口里，让 getter 知道“现在正在读取我的人是谁”。**

流程是这样的：

1. 创建 `Watcher`
2. 临时把它挂到 `Dep.target`
3. 主动读取一次对应字段
4. 字段的 getter 发现当前有活跃 `Watcher`
5. 于是把这个 `Watcher` 收进自己的 `Dep`
6. 收集完成后清空 `Dep.target`

这样，字段和更新逻辑之间的关系就建立起来了。

## **7. Compiler：把模板语法变成可执行绑定**

响应式系统只解决了“数据可追踪”，还没解决“模板怎么更新”。  
`Compiler` 负责的就是这一步。

它主要做两件事：

- 处理文本插值 `{{ message }}`
- 处理指令 `v-model`

### **7.1 处理插值表达式**

```js
compileText(node) {
  const text = node.textContent
  if (!/\{\{([^}]+)\}\}/.test(text)) return

  node.originalTextContent = text
  const reg = /\{\{([^}]+)\}\}/g
  const keys = []

  text.replace(reg, (_, key) => {
    const cleaned = key.trim()
    if (!keys.includes(cleaned)) keys.push(cleaned)
    return _
  })

  keys.forEach((key) => {
    new Watcher(this.vm, key, () => this.updateTextNode(node))
  })

  this.updateTextNode(node)
}
```

这里的思路是：

- 先找出文本里依赖了哪些 key
- 为每个 key 创建对应 `Watcher`
- 任何一个 key 变化时，重新计算整段文本

因此，像下面这种模板：

```html
<p>你好，{{ person.name }}，你刚输入的是「{{ message }}」。</p>
```

本质上会变成“同一段文本节点，挂多个 Watcher，任一依赖变化就重算一次文本内容”。

### **7.2 处理 v-model**

`v-model` 之所以经典，是因为它把两个方向都打通了：

- 数据 -> 视图
- 视图 -> 数据

```js
modelUpdater(node, vm, key) {
  const updateFn = (value) => {
    node.value = value == null ? '' : value
  }

  new Watcher(vm, key, updateFn)
  updateFn(this.getValue(vm, key))

  node.addEventListener('input', () => {
    this.setValue(vm, key, node.value)
  })
}
```

所以 `v-model` 并不神秘，它本质上就是：

- 用 `Watcher` 保证数据变化时输入框跟着变
- 用 `input` 事件保证用户输入时数据跟着改

也就是说，**`v-model` 可以理解为两个单向绑定的组合。**

## **8. 一次完整更新是怎么发生的**

用一个最简单的例子来看：

```js
vm.message = 'Hello Mini Vue'
```

这行代码背后会发生下面这些事：

1. 赋值命中代理后的 setter
2. 实际写入 `vm.$data.message`
3. 响应式字段的 setter 被触发
4. 对应 `Dep` 调用 `notify()`
5. 所有订阅了 `message` 的 `Watcher` 执行 `update()`
6. `Watcher` 重新读取新值
7. 对应文本节点或输入框执行更新函数
8. DOM 局部更新完成

这就是“精确更新”的本质。  
它会把更新范围尽量收缩到真正依赖该字段的绑定点上。

## **9. 这个 mini-vue 刻意省略了什么**

教学实现的价值，往往不仅在于“做了什么”，也在于“故意没做什么”。

这个版本没有覆盖：

- 虚拟 DOM 和 Diff
- 组件系统
- 生命周期
- 计算属性
- 用户自定义侦听器
- 批量异步更新队列
- 更完整的指令系统，如 `v-if`、`v-for`、`v-bind`

这是这个教学模型有意保留的取舍。  
如果一开始把所有概念都堆进去，学习者反而很难看清真正的主线。

## **10. 它和 Vue 3 的关系应该怎么理解**

现在讲一个基于 `Object.defineProperty` 的 mini-vue，最容易产生的误解是：

“这和现代 Vue 的内部实现是什么关系？”

它们属于同一条响应式思想的教学入门模型。

更准确的说法是：

- 它讲清了 Vue 家族非常重要的**响应式心智模型**
- 它保留了“依赖收集 -> 变更通知 -> 绑定更新”这条主线
- 但它没有覆盖 Vue 3 以 `Proxy`、`effect`、调度器和编译优化为核心的现代实现细节

所以，学习顺序更合理的做法是：

1. 先用这个 mini-vue 建立“为什么会自动更新”的直觉
2. 再去理解 Vue 3 为什么用 `Proxy` 取代 `Object.defineProperty`
3. 再继续看运行时调度、块级优化、编译产物这些更现代的话题

## **11. 这类原理练习真正能带来什么**

自己实现一遍最小版框架，最大的收获通常集中在下面这些能力：

- 看到模板绑定时，能反推出依赖关系是怎么建立的
- 遇到响应式失效时，知道该从 getter / setter、依赖收集还是更新链路排查
- 学 React、Vue、Solid 这类框架时，更容易比较它们在“更新粒度”上的根本差异
- 理解为什么现代框架越来越强调编译期信息、细粒度更新和更低运行时开销

从学习路径上说，这种练习很适合放在“会用框架”之后、“读框架源码”之前。  
它正好填上了“知道 API，但不知道底层为什么这样设计”的那一段空白。

## **12. 小结**

这个 mini-vue 适合作为原理入门，因为它保留了最重要的那条主线：

- `proxyData` 解决访问体验
- `Observer` 解决数据可追踪
- `Dep + Watcher` 解决依赖收集与精准更新
- `Compiler` 解决模板和 DOM 绑定
- `v-model` 把双向绑定拆回两个单向过程

如果把这条链路真正想明白，再去看 Vue、React 或其他框架的更新机制，很多概念都会变得顺得多。
