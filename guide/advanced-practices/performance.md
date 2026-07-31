---
title: "V. 高级主题和专业开发最佳实践 / V.1 性能优化：提供快速用户体验"
---

# V.1 性能优化：提供快速用户体验

**目的**：优化网页以提供快速的用户体验。

- **Core Web Vitals ([LCP](https://web.dev/lcp/), [INP](https://web.dev/inp/), CLS)**：Google 定义的用户体验衡量指标，包括加载、交互性和视觉稳定性。
  - **Largest Contentful Paint ([LCP](https://web.dev/lcp/))**：标记最大内容元素的渲染时间，衡量感知加载速度。
  - **Interaction to Next Paint ([INP](https://web.dev/inp/))**：评估页面对用户交互的整体响应能力，衡量交互性。
  - **Cumulative Layout Shift (CLS)**：测量意外的布局偏移，量化视觉稳定性。
- **技术**：
  - **图像优化**：压缩、调整大小、转换为现代格式（例如 WebP）。
  - **关键 CSS**：内联首屏内容所需的基本 CSS。
  - **代码分割和惰性加载**：仅在需要时加载组件/代码，减少初始加载时间和包大小。
  - **缓存**：使用浏览器缓存和 CDN（内容分发网络），减少延迟、缩短加载时间。
  - **字体传输优化**：使用 link rel="preload" 和 font-display: optional 防止布局偏移。
  - **压缩和合并文件**：删除不必要的字符，合并文件，减少 HTTP 请求。
  - **保持布局稳定**：为图像/视频添加 width/height 属性，为动态内容保留空间，用 CSS 布局。
- **工具**：[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)（用于审计性能、可访问性、SEO 等的开源自动化工具）和 [PageSpeed Insights](https://pagespeed.web.dev/)。

在用户期望和搜索引擎排名因素的共同驱动下，性能优化已成为核心设计原则。Core Web Vitals 为改善用户感知体验提供了可衡量的框架。**关键 CSS** 和**惰性加载**等技术，正是针对"初始负载过大导致用户体验差"这一因果链条的有效解法。

::: details 启发式示例：CLS 图片尺寸对比

容易造成布局偏移的写法：

```html
<img src="/hero.jpg" alt="产品截图">
```

图片下载完成前，浏览器不知道它需要占多高，后续内容可能先上移再被挤下去。

更稳定的写法：

```html
<img
  src="/hero.jpg"
  alt="产品截图"
  width="1200"
  height="675"
  loading="eager"
>
```

或者用 CSS 提前声明比例：

```css
.hero-image {
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
}
```

CLS 的关键在于元素加载前后占位稳定。图片、广告位、嵌入内容和异步插入的提示条都需要提前保留空间，文件体积只是性能判断的一部分。

:::

## **表格：Core Web Vitals 优化技术**

| Core Web Vital                  | 解决的问题     | 关键技术（示例）                                                                                                                  | 工具（示例）                                                         |
| :------------------------------ | :------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| [**LCP**](https://web.dev/lcp/) | 感知加载速度慢 | 优化图像，关键 CSS，服务器响应时间，预加载首屏大图                                                                                | [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) |
| [**INP**](https://web.dev/inp/) | 交互响应慢     | 拆分主线程长任务，优化事件回调，减少 [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) 大小 | [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) |
| **CLS**                         | 视觉稳定性差   | 为图像/视频设置尺寸，为广告/动态内容保留空间，优化字体传输                                                                        | [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) |

上表列出了与可衡量性能指标直接相关的可操作策略，帮助开发者理解如何改善 Web 性能、特定技术为何有效，将技术实现与用户体验、SEO 联系起来。
