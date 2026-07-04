---
title: "V. 高级主题和专业开发最佳实践 / V.1 性能优化：提供快速用户体验"
---

# V.1 性能优化：提供快速用户体验

**目的**：优化网页以提供快速的用户体验。

- **Core Web Vitals ([LCP](https://web.dev/lcp/), [INP](https://web.dev/inp/), CLS)**：Google 定义的衡量用户体验的指标，包括加载、交互性和视觉稳定性。
  - **Largest Contentful Paint ([LCP](https://web.dev/lcp/))**：通过标记最大内容元素的渲染时间来衡量感知加载速度。
  - **Interaction to Next Paint ([INP](https://web.dev/inp/))**：通过评估页面对用户交互的整体响应能力来衡量交互性。
  - **Cumulative Layout Shift (CLS)**：通过测量意外的布局偏移来量化视觉稳定性。
- **技术**：
  - **图像优化**：压缩、调整大小、转换为现代格式（例如，WebP）。
  - **关键 CSS**：内联首屏内容所需的基本 CSS。
  - **代码分割和惰性加载**：仅在需要时加载组件/代码，以减少初始加载时间和包大小。
  - **缓存**：浏览器缓存、CDN（内容分发网络）使用，以减少延迟和改善加载时间。
  - **字体传输优化**：使用 link rel="preload" 和 font-display: optional 来防止布局偏移。
  - **压缩和合并文件**：删除不必要的字符并组合文件以减少 HTTP 请求。
  - **保持布局稳定**：为图像/视频添加 width/height 属性，为动态内容保留空间，使用 CSS 进行布局。
- **工具**：[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)（用于审计性能、可访问性、SEO 等的开源自动化工具）和 [PageSpeed Insights](https://pagespeed.web.dev/)。

性能优化已经成为一项核心设计原则，由用户期望和搜索引擎排名因素共同驱动。Core Web Vitals 提供了一套可衡量的框架来改善用户感知体验。**关键 CSS** 和**惰性加载**等技术，正是针对"初始负载过大导致用户体验差"这一因果链条的有效解法。

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

CLS 的关键不是“图片越小越好”，而是元素加载前后占位要稳定。图片、广告位、嵌入内容和异步插入的提示条都需要提前保留空间。

:::

## **表格：Core Web Vitals 优化技术**

| Core Web Vital                  | 解决的问题     | 关键技术（示例）                                                                                                                  | 工具（示例）                                                         |
| :------------------------------ | :------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| [**LCP**](https://web.dev/lcp/) | 感知加载速度慢 | 优化图像，关键 CSS，服务器响应时间，预加载英雄图像                                                                                | [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) |
| [**INP**](https://web.dev/inp/) | 交互响应慢     | 拆分主线程长任务，优化事件回调，减少 [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) 大小 | [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) |
| **CLS**                         | 视觉稳定性差   | 为图像/视频设置尺寸，为广告/动态内容保留空间，优化字体传输                                                                        | [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) |

这个表格提供了与可衡量性能指标直接相关的可操作策略。它帮助开发者理解如何改善 Web 性能以及为什么特定技术有效，将技术实现与用户体验和 SEO 联系起来。

