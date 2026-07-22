---
title: "II. 基础 Web 技术：核心支柱 / II.7 浏览器运行时与渲染管线"
---

# II.7 浏览器运行时与渲染管线

浏览器把网络响应变成可交互画面，需要网络、解析器、JavaScript 引擎、样式系统、布局系统、绘制系统和合成器共同工作。理解这条链，可以把“页面有点卡”转换成具体问题：网络在等待、主线程在执行、布局计算过多、绘制区域过大，或者页面生命周期处理失当。

可以先记住这条主线：

> 导航 → 加载 → 解析 → 样式 → 布局 → 绘制 → 合成 → 交互 → 生命周期

具体浏览器的进程和线程实现会持续演进，本章关注各浏览器共同呈现的 Web 平台行为。

## **II.7.1 浏览器中的主要工作区域**

现代浏览器会把不同职责分配给多个进程或线程，以提升隔离性、响应能力和安全性。

| 工作区域 | 主要职责 | 开发者可以观察什么 | 工具示例 |
| :--- | :--- | :--- | :--- |
| **浏览器进程** | 标签页、导航、权限、站点隔离和进程协调 | 导航是否成功、页面是否崩溃、权限是否被允许 | Chrome Task Manager、浏览器站点信息面板 |
| **网络服务** | DNS、连接、TLS、HTTP、缓存和资源下载 | 请求排队、连接复用、响应头、缓存命中和下载时间 | DevTools Network |
| **渲染器主线程** | 解析 HTML/CSS、执行 JavaScript、计算样式、布局和生成绘制指令 | 长任务、事件处理、样式重算、布局和脚本调用栈 | DevTools Performance、Sources |
| **合成与栅格化区域** | 把绘制指令转换为图块与图层，并组合成最终画面 | 图层数量、栅格化成本、滚动和动画是否稳定 | DevTools Layers、Rendering |
| **Worker 执行环境** | 在独立全局环境中执行 JavaScript 计算或处理网络事件 | 消息传递、计算耗时、Worker 调用栈 | DevTools Sources、Performance |

页面的大部分 DOM、样式和事件回调都由渲染器主线程管理。长任务持续占用主线程时，输入事件、样式计算和下一帧画面都会等待。

## **II.7.2 从响应字节到第一帧**

一次普通页面导航通常经历以下过程：

1. **导航**：浏览器解析 URL，检查缓存和 Service Worker，并建立所需网络连接。
2. **接收响应**：服务器返回状态码、响应头和正文。HTML 可以边到达、边解析。
3. **构建 DOM**：HTML 解析器把标签转换成节点，并逐步构建 DOM 树。
4. **发现子资源**：解析器和预加载扫描器发现样式表、脚本、字体、图片等资源并安排请求。
5. **构建样式信息**：浏览器解析 CSS，结合层叠、继承和选择器匹配计算元素最终样式。
6. **布局**：浏览器根据样式、视口和内容计算元素的尺寸与位置。
7. **绘制**：浏览器把文字、颜色、边框、阴影和图片转换成绘制指令。
8. **合成**：不同图层按顺序组合，最终画面提交到屏幕。

脚本的加载方式会影响 HTML 解析：

- 普通经典脚本在解析器遇到它时执行，外部脚本还需等待下载完成。
- 带有 **defer** 的经典脚本在文档解析完成后按文档顺序执行。
- 带有 **async** 的脚本在资源准备好后执行，多个脚本的执行顺序取决于各自完成时间。
- 模块脚本默认采用延后执行语义，并遵循模块依赖图。

诊断首屏时，可以把 Network 中的请求瀑布与 Performance 中的主线程轨迹对齐。响应到达很早、画面出现很晚，通常需要继续查看脚本执行、样式计算、布局和绘制记录。

## **II.7.3 事件循环与渲染时机**

渲染器主线程通过事件循环安排工作。一次简化的循环包含：

1. 从任务队列取出一个任务，例如点击回调、定时器回调或消息事件。
2. 执行该任务中的 JavaScript。
3. 清空当前微任务队列，例如 Promise 回调和 **queueMicrotask** 回调。
4. 浏览器决定更新画面时，运行 **requestAnimationFrame** 回调并完成样式、布局、绘制与合成。
5. 进入下一轮任务处理。

浏览器根据刷新率、页面可见性和系统负载决定具体渲染时机。连续追加微任务会持续占用主线程，因此 Promise 链同样可能推迟下一帧。

::: details 启发式示例：在一帧中先读取布局，再写入样式

```js
function updateTabIndicator(tab, tabList, indicator) {
  requestAnimationFrame(() => {
    const tabRect = tab.getBoundingClientRect();
    const listRect = tabList.getBoundingClientRect();
    const offset = tabRect.left - listRect.left + tabList.scrollLeft;

    indicator.style.width = tabRect.width + "px";
    indicator.style.transform = "translateX(" + offset + "px)";
  });
}
```

这个例子先读取两处几何信息，再集中写入样式。DOM 写入会使部分样式或布局结果失效；随后立刻读取几何信息可能触发同步样式计算或布局。把读取放在前面、写入放在后面，可以减少读写交错带来的重复工作。

:::

**requestAnimationFrame** 适合安排下一帧之前的视觉更新。网络请求、复杂数据聚合和大规模解析各有调度方式，其中计算密集型工作可以进一步交给 Worker。

## **II.7.4 样式、布局、绘制与合成**

[渲染性能资料](https://web.dev/articles/rendering-performance) 常用 JavaScript → Style → Layout → Paint → Composite 描述像素管线。一次视觉变化可能经过全部阶段，也可能复用已有布局或绘制结果。

| 阶段 | 浏览器计算的内容 | 常见触发示例 | 诊断入口 |
| :--- | :--- | :--- | :--- |
| **Style** | 哪些 CSS 规则匹配元素，最终属性值是什么 | 修改 class、CSS 自定义属性、媒体条件或 DOM 结构 | Performance 中的 Recalculate Style |
| **Layout** | 元素尺寸、位置以及彼此的几何关系 | 修改宽高、字体、内容、网格轨道或可用空间 | Performance 中的 Layout、Layout Shift |
| **Paint** | 需要绘制的文字、颜色、边框、阴影和图片 | 修改颜色、背景、阴影或绘制区域 | Rendering 中的 Paint flashing |
| **Composite** | 图层的顺序、变换、裁剪与最终组合 | transform、opacity 和滚动常可主要进入合成阶段 | Layers、Performance 中的 Composite Layers |

使用 **transform** 和 **opacity** 可以为动画提供更轻的执行路径，最终效果仍取决于浏览器的图层决策。大量图层会增加内存与管理成本，因此应结合 Performance 和 Layers 面板验证。

减少渲染成本时，可以优先检查：

- DOM 与选择器作用范围是否过大；
- 一次更新是否改变了大量元素的几何关系；
- 动态内容是否提前保留尺寸；
- 阴影、滤镜和大面积绘制是否覆盖过多像素；
- 动画是否持续触发布局或大面积绘制；
- **contain**、**content-visibility** 等隔离能力是否适合长列表或独立区域。

## **II.7.5 主线程响应与 Worker**

浏览器通常把持续超过 50 毫秒的主线程任务标记为长任务。长任务会推迟输入事件处理和画面更新，并可能影响 INP。优化顺序通常是：

1. 删除重复计算和无效工作。
2. 把大任务拆成能让主线程恢复响应的小任务。
3. 按用户可见程度安排工作优先级。
4. 把纯计算、解析、编码或大数据转换移到 Worker。

不同 Worker 对应不同运行边界：

| 类型 | 作用范围 | 适合的工作 | 关键边界 |
| :--- | :--- | :--- | :--- |
| **Dedicated Worker** | 创建它的页面 | 搜索索引、数据聚合、图片处理、压缩和模型推理 | 通过消息与页面通信，DOM 由主线程管理 |
| **SharedWorker** | 同源的多个浏览上下文 | 多标签页共享连接或协调状态 | 支持度和产品需求需按目标浏览器验证 |
| **Service Worker** | 受控作用域内的页面和请求 | 离线缓存、请求代理、后台事件 | 生命周期独立于页面，详见 PWA 章节 |
| **Worklet** | 浏览器提供的专用渲染或媒体管线 | Paint、Audio 等低层扩展点 | API 专用、执行环境受限 |

Worker 的消息数据通常通过结构化克隆复制。[Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) 可以把 ArrayBuffer 等资源的所有权移动到另一执行环境，适合传递大型二进制数据。

::: details 启发式示例：把大型数值聚合交给 Worker

页面线程：

```ts
const worker = new Worker(
  new URL("./average.worker.ts", import.meta.url),
  { type: "module" },
);

const values = new Float64Array(measurements);
const buffer = values.buffer;

worker.postMessage(buffer, [buffer]);
worker.addEventListener("message", ({ data }) => {
  renderAverage(data.average);
});
```

Worker：

```ts
self.addEventListener("message", ({ data }) => {
  const values = new Float64Array(data);
  const sum = values.reduce((total, value) => total + value, 0);
  const average = values.length === 0 ? 0 : sum / values.length;

  self.postMessage({ average });
});
```

ArrayBuffer 的所有权已转移给 Worker，页面线程中的原缓冲区随之被分离。这个边界适合一次性交给 Worker 处理的大块数据。

:::

## **II.7.6 页面生命周期与返回导航**

页面会在 active、hidden、frozen、discarded 等状态之间变化。后台标签页的定时器可能被节流，系统也可能冻结或丢弃页面以节省 CPU、内存和电量。

常用事件承担不同职责：

- **visibilitychange**：页面进入隐藏状态时保存草稿、暂停视觉更新或记录会话状态。
- **pagehide**：页面离开当前会话历史位置时完成轻量清理。
- **pageshow**：页面首次显示或从 bfcache 恢复时同步可能过期的数据。
- **beforeunload**：仅在确实存在未保存输入时注册，用于请求用户确认离开。

[Page Lifecycle API](https://developer.chrome.com/docs/web-platform/page-lifecycle-api) 把这些状态放进同一条生命周期中。bfcache 会保存整个页面的运行状态，让前进、后退导航可以快速恢复；HTTP 缓存负责复用网络响应，两者解决不同层次的问题。

```js
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveDraft();
  }
});

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    refreshPotentiallyStaleData();
  }
});
```

页面恢复时，内存中的 DOM 和 JavaScript 状态仍然存在，网络数据的有效期则由应用自行确认。

## **II.7.7 内存与资源所有权**

JavaScript 垃圾回收器会释放已失去引用的对象。前端内存问题通常来自仍然可达、但业务已经结束的对象：

- 已卸载组件遗留的事件监听器、定时器和订阅；
- 被 JavaScript 引用保留的 detached DOM；
- 无上限增长的 Map、数组、日志和客户端缓存；
- 未释放的 Blob URL、Worker、媒体流和图形资源；
- 闭包长期持有大型数据结构。

管理资源时，为每个创建动作定义对应的释放动作：

| 创建的资源 | 生命周期结束时的动作 |
| :--- | :--- |
| addEventListener | removeEventListener，或使用带 signal 的监听方式 |
| setInterval / setTimeout | clearInterval / clearTimeout |
| Observer、订阅和流 | disconnect、unsubscribe 或 cancel |
| URL.createObjectURL | URL.revokeObjectURL |
| Worker | terminate |
| MediaStreamTrack | stop |

DevTools Memory 可以比较 Heap Snapshot、观察 Allocation timeline，并查看对象的保留路径。可靠的检测方式是重复执行同一用户流程，主动触发垃圾回收后比较对象数量和内存基线。

## **II.7.8 从现象到证据的诊断顺序**

| 用户现象 | 首先记录什么 | 重点寻找什么 |
| :--- | :--- | :--- |
| 首屏出现很慢 | Network + Performance 导航轨迹 | TTFB、关键请求、脚本长任务、LCP 资源和渲染延迟 |
| 点击后迟迟无反馈 | 包含交互的 Performance 轨迹 | 事件处理、长任务、同步布局和下一次绘制 |
| 滚动或动画卡顿 | Performance + Rendering | 每帧主线程工作、绘制区域、图层和事件监听器 |
| 操作越多页面越慢 | Memory 快照与分配记录 | retained objects、detached DOM、持续增长的缓存 |
| 返回上一页仍需完整加载 | Application / Lighthouse bfcache 检查 | 生命周期监听器、未关闭资源和缓存资格原因 |

稳定的性能排查流程如下：

1. 在接近真实的设备、网络和数据量下稳定复现。
2. 录制包含问题发生前后的完整轨迹。
3. 从最长的主线程任务或最晚的关键资源开始。
4. 沿调用栈和渲染事件找到具体代码与 DOM 区域。
5. 每次只改变一个主要因素并重新测量。
6. 用真实用户监控确认实验室改进能够覆盖线上用户。

浏览器运行时知识的价值，在于把网络、JavaScript、CSS、性能和生命周期连接成一个可观察系统。后续学习框架渲染、[性能优化](/guide/advanced-practices/performance)、[PWA](/guide/emerging-tech/pwa)和浏览器 AI 时，都可以继续沿用这条运行链。
