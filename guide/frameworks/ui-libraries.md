---
title: "IV. 前端框架和库：构建现代 UI / IV.3 UI 组件库：加速开发的利器"
---

# IV.3 UI 组件库：加速开发的利器

使用 UI 组件库，意味着把一部分界面责任交给组件库：

- 用统一的视觉语言减少页面之间的不一致；
- 复用菜单、弹窗、表格等容易出错的交互行为；
- 获得一套无障碍基础，但仍要测试真实页面；
- 复用主题、国际化和复杂数据组件；
- 跟随库的升级节奏，承担对应的依赖与迁移成本。

因此，组件数量只是一个评估维度。选型的核心问题是：项目希望把哪些责任交给库，又有哪些部分必须由团队自己掌控？

## IV.3.1 先判断需要哪一种“完整度”

组件库大致可以放在一条连续光谱上：

1. **完整设计系统**：带有明确视觉语言、主题系统和大量组件，适合希望快速得到一致界面的项目。MUI、Ant Design、Vuetify 和 Angular Material 属于这一类。
2. **可组合组件系统**：提供符合无障碍要求的结构和样式能力，但鼓励团队组合出自己的界面语言。Chakra UI、Mantine 等更接近这种思路。
3. **复杂业务套件**：除基础组件外，还重视 DataTable、Tree、Upload、Scheduler 等企业功能。Prime 系列和部分中后台组件库属于这一类。
4. **多端应用框架**：不仅提供组件，还负责 SPA、SSR、PWA、移动端或桌面端的构建方式。Quasar 是这种取向的代表。

这条光谱上的每个位置对应不同责任。完整系统能加快起步，却可能更难做出强品牌差异；更轻、更自由的系统便于定制，但团队要自己补齐更多设计和测试工作。

如果项目需要完全掌控标记、样式或组件源码，可以继续阅读 [无头组件与组件代码所有权](/guide/frameworks/headless-ui)。那一章讨论另一种分工：库只提供交互逻辑，样式和组件源码由团队掌控。

## IV.3.2 用六个问题完成筛选

### 1. 框架是否匹配

组件库必须匹配当前框架、版本和渲染模式。满足这项硬约束后，再比较其他能力。对于 SSR 或 React 服务器组件（React Server Components），还要确认组件是否依赖浏览器环境，以及引入后有多少组件必须改为客户端组件。

### 2. 关键组件是否真的够用

先列出项目最难的三到五个界面，再检查候选库的实际覆盖度，例如：

- 有联动校验和动态字段的表单；
- 支持筛选、排序、分页、固定列的数据表格；
- 带焦点陷阱和嵌套操作的 Dialog；
- 树、日期区间、文件上传或国际化输入。

如果这些关键组件仍需大量自行补写，说明该候选库对项目的实际覆盖度较低。

### 3. 设计语言是否合适

MUI 对应 Material Design，Ant Design 面向企业级产品语言，Fluent UI 与微软产品体验接近。采用它们意味着同时采用一部分视觉和交互判断。若产品已有强品牌系统，应先验证主题能力能否自然表达品牌；层层 CSS 覆盖通常意味着更高的定制与升级成本。

### 4. 定制边界在哪里

定制通常有四层：

- 给单个实例改一个样式；
- 封装团队自己的复用组件；
- 通过 token 或 theme 修改全局规则；
- 深改组件结构与行为。

[MUI 的定制文档](https://mui.com/material-ui/customization/how-to-customize/) 就按相似层次说明一次性修改、复用组件、主题和全局覆盖。评估任何库时，都可以用同一组问题试一遍：改品牌色是否容易？改内部结构是否稳定？升级后覆盖规则的稳定性如何？

### 5. 无障碍是否能被验证

组件库可以提供键盘交互、ARIA 属性和焦点管理的无障碍基础。页面要符合 WCAG，还需要验证标签、错误提示、颜色对比、阅读顺序和业务流程。可以先用键盘完整走一遍核心表单和 Dialog，再检查屏幕阅读器输出。

### 6. 按需使用和升级成本是否可控

现代库通常提供 ESM、Tree Shaking 或独立组件入口，最终产物还取决于导入方式、样式文件、图标包和构建器。用生产构建验证按需引入：

1. 只引入试验页面需要的组件；
2. 构建生产包并查看依赖分析；
3. 检查是否意外带入整套图标、日期库或主题 CSS；
4. 再加入一个复杂组件，比较体积和客户端 JavaScript 的变化。

同时查看发布节奏、迁移指南、破坏性更新和问题响应。组件库会进入大量页面，退出成本通常比接入成本高。

## IV.3.3 主流生态中的代表性例子

不同框架生态孕育出了各有侧重的代表性组件库，折射出从“开箱即用”到“底层组合”的不同工程取向。

### React：设计系统与组合自由并存

- [MUI](https://mui.com/material-ui/)：完整实现了 Material Design，主题定制层次清晰；其生态内部按复杂度进一步分层，[MUI X](https://mui.com/x/) 覆盖数据网格等高复杂度组件，[Toolpad](https://mui.com/toolpad/) 则面向内部工具搭建。
- [Ant Design](https://ant.design/)：以统一的企业级设计语言覆盖布局、导航、数据录入、数据展示与反馈，契合流程复杂、信息密度高的中后台系统。
- [Chakra UI](https://chakra-ui.com/docs/components/concepts/overview)：主打无障碍组件原语、组合式 API 与 style props，适合在现成交互行为之上构建自有品牌主题的团队。
- [Fluent UI](https://react.fluentui.dev/)：源自微软自身产品体系，适合追求微软生产力工具视觉与交互风格的应用。
- **更多细分选择**：[PrimeReact](https://primereact.org/) 见长于复杂企业组件广度；[Mantine](https://mantine.dev/) 同时提供丰富的 UI 组件与实用 Hooks；[Flowbite React](https://flowbite-react.com/) 则围绕 Tailwind CSS 构建组件生态。

### Vue：从现成后台到多端交付

- [Vuetify](https://vuetifyjs.com/)：将 Material Design 完整引入 Vue 生态，适合需要统一视觉规范与大量现成组件的项目。
- [Element Plus](https://element-plus.org/)：Vue 3 中后台项目的常见选择，围绕表单录入、数据表格与 CSS 变量主题体系提供高频业务组件。
- [Quasar](https://quasar.dev/introduction-to-quasar/)：跨越了单纯“组件库”的边界，将 UI 组件与 SPA、SSR、PWA、移动端、桌面端及浏览器扩展纳入同一套构建与交付体系。
- **更多细分选择**：[Ant Design Vue](https://antdv.com/) 便于在 Vue 项目中延续 Ant Design 规范；[Naive UI](https://www.naiveui.com/) 以完备的 TypeScript 类型与代码级主题配置见长；[PrimeVue](https://primevue.org/) 则侧重组件覆盖面与复杂数据场景。

### Angular：官方基础与企业套件并重

- [Angular Material](https://material.angular.dev/) 与 [Angular CDK](https://material.angular.dev/cdk)：前者提供开箱即用的 Material 成品组件，后者抽离出 overlay、无障碍（a11y）、拖拽（drag-drop）等底层交互基础设施，两者常在同一项目中配合使用。
- [PrimeNG](https://primeng.org/)：针对企业级复杂表格、树形结构、文件上传及商业模板生态提供了高度完备的套件。
- [NG-ZORRO](https://ng.ant.design/)：将 Ant Design 企业级设计体系引入 Angular，便于多技术栈团队保持统一的后台交互规范。

图表、仪表盘和专业可视化有独立的数据模型与交互问题，详见 [数据可视化组件库](/guide/frameworks/data-visualization-libraries)。

## IV.3.4 跨维度比较与综合评估

阅读对比表前，可以先将每一列还原为具体的选型审视问题：

- **所属框架**：候选是否满足项目的硬约束？
- **设计风格/理念**：团队是否愿意接受这套默认语言？
- **无障碍支持**：库提供怎样的基础，项目还要验证什么？
- **定制化模式**：改一次、改一类和改全局分别用什么机制？
- **主要适用场景**：它解决的问题是否与项目的难点重合？

围绕上述五个问题，下表汇总了 React、Vue 与 Angular 生态主流组件库的设计取向与定制机制：

| 库名称                                           | 所属框架                        | 设计风格/理念                              | 无障碍支持   | 定制化模式                                        | 主要适用场景                 |
| :----------------------------------------------- | :------------------------------ | :----------------------------------------- | :----------- | :------------------------------------------------ | :--------------------------- |
| [MUI](https://mui.com/)                          | [React](https://react.dev/)     | [Material Design](https://m3.material.io/) | 优秀         | CSS-in-JS、主题系统                               | 通用 Web 应用、内部工具      |
| [Ant Design](https://ant.design/)                | [React](https://react.dev/)     | [Ant Design](https://ant.design/)          | 优秀         | CSS-in-JS + [Design Token](https://ant.design/docs/react/customize-theme)，可选 CSS 变量 | 企业级中后台、管理系统       |
| [Chakra UI](https://chakra-ui.com/)              | [React](https://react.dev/)     | 可组合/无障碍优先                          | 核心设计原则 | Style Props、主题系统                             | 通用 Web 应用、设计系统      |
| [Vuetify](https://vuetifyjs.com/)                | [Vue](https://vuejs.org/)       | [Material Design](https://m3.material.io/) | 优秀         | [Sass](https://sass-lang.com/)/CSS 变量、预设主题 | 通用 Web 应用                 |
| [Element Plus](https://element-plus.org/)        | [Vue](https://vuejs.org/)       | Element Design                             | 良好         | [BEM](https://getbem.com/) 命名的 CSS、Sass 变量  | 企业级中后台、管理系统       |
| [Quasar](https://quasar.dev/)                    | [Vue](https://vuejs.org/)       | [Material Design](https://m3.material.io/) | 良好         | [Sass](https://sass-lang.com/)/CSS 变量、主题定制 | 多端（Web、Mobile、Desktop） |
| [Angular Material](https://material.angular.dev/) | [Angular](https://angular.dev/) | [Material Design](https://m3.material.io/) | 优秀         | [Sass](https://sass-lang.com/) 变量、主题定制     | 通用 Web 应用（Google 官方维护） |
| [PrimeNG](https://primeng.org/)                  | [Angular](https://angular.dev/) | 设计无关                                   | 优秀         | Theme Designer 主题编辑器、CSS 变量               | 企业级应用、复杂界面         |
| [NG-ZORRO](https://ng.ant.design/)               | [Angular](https://angular.dev/) | [Ant Design](https://ant.design/)          | 优秀         | CSS 变量、主题定制                                | 企业级中后台、管理系统       |

横向对比这些方案，可以提炼出五类典型的架构取舍：

- 采纳完整设计规范（MUI、Angular Material、Vuetify）：开箱即可获得高度一致的视觉与动效细节，但深度改写视觉语言时往往需要逆向覆盖默认规则。
- 聚焦企业中后台效率（Ant Design、Element Plus、NG-ZORRO）：围绕复杂表单校验、高密度表格与标准工作流做了深度封装，显著降低后台页面拼装成本。
- 优先保障组合与主题弹性（Chakra UI）：弱化预设的产品级视觉印记，通过原子化属性与主题 Token 为自有品牌留出充足的定制空间。
- 绑定多端构建与交付链路（Quasar）：选型不仅决定了 UI 组件层，也同时确定了跨 Web、移动端与桌面端的工程打包模型。
- 以复杂数据组件广度取胜（PrimeNG）：当项目重度依赖高级表格、树表联动、日程排期等专业控件时，现成复杂组件的完备度往往直接决定研发周期。

## IV.3.5 用小型试验做最终选择

阅读文档只能完成初筛。最终选择前，可以用两个真实切片做一个小型试验：

1. 实现一个包含校验、加载、服务端错误和键盘操作的表单。
2. 实现一个包含筛选、分页、空状态和窄屏处理的表格或列表。
3. 套用品牌色、字体、圆角、深色模式和长文本。
4. 运行生产构建，检查按需引入、样式和图标带来的实际体积。
5. 用键盘和至少一种辅助技术走完流程，再评估 API、测试和升级体验。

不同场景可以有不同优先级：

- **快速原型或小型项目**：MUI、Vuetify、Element Plus 等现成视觉系统可以缩短起步时间。
- **企业级中后台**：Ant Design、NG-ZORRO、PrimeNG 等的价值主要体现在复杂表单和数据组件上。
- **高度定制的品牌产品**：应重点验证主题上限；如果持续与默认样式对抗，改用无头组件或自持组件源码的方案可能更合适。
- **数据驱动应用或仪表盘**：先分清通用 UI 与图表库的责任，再查看 [数据可视化组件库](/guide/frameworks/data-visualization-libraries)。
- **多端部署**：Quasar 这类应用框架值得进入候选，但要同时评估平台插件、发布流程和团队经验。

合适的组件库能让团队用较少例外完成真实界面，并且在两三年后仍然改得动、测得了、升得上去。

## IV.3.6 把组件库边界写进业务代码

组件库负责视觉和交互基础，业务组件负责语义、数据和状态组合。按下面的结构封装后，升级组件库时业务 API 可以保持不变：

```tsx
type ProductActionProps = {
  disabled?: boolean;
  onAdd: () => void;
};

export function ProductAction({ disabled = false, onAdd }: ProductActionProps) {
  return (
    <button type="button" disabled={disabled} onClick={onAdd}>
      加入购物车
    </button>
  );
}
```

实践时为这个业务组件补充加载、错误、禁用、键盘操作和埋点状态，再比较底层 UI 库提供的 Button、Tooltip、Form 与团队设计 token 的映射关系。
