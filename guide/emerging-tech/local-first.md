---
title: "VI. 新兴技术和专业领域 / VI.11 本地优先架构与实时协同计算 (Local-First & CRDTs)"
---

# VI.11 本地优先架构与实时协同计算 (Local-First & CRDTs)

**目的**：构建以客户端本地存储为首要真实源（Primary Source of Truth）的软件架构，实现**零网络延迟即时交互、天然离线可用以及跨设备/多用户的无缝实时协同**。

传统 Web 应用采用“云端中心化”模型：用户的每次点击都必须等待网络请求往返（RTT）才能完成状态确认，一旦离线或弱网应用即陷入停滞。**本地优先 (Local-First)** 架构彻底逆转了这一范式——**数据首先写入本地数据库，后台异步增量同步到云端，多端冲突由数学算法自动解决**。

## **VI.11.1 本地优先的七大核心原则**

根据分布式系统专家 Martin Kleppmann 提出的《Local-first Software》愿景，现代本地优先应用遵循以下准则：

1. **零延迟响应 (No Spinner)**：所有读写操作均在本地内存与磁盘完成，界面毫秒级响应。
2. **多设备无缝漫游**：用户在手机、平板与桌面端的修改可跨设备自动同步。
3. **离线即正常模式 (Offline is not an error)**：网络断开不影响任何核心编辑功能的正常使用。
4. **多人实时协作**：支持类似 Google Docs、Figma 的多人同时在线协作与光标跟随。
5. **数据持久归属用户**：即使云端服务停运，用户本地仍拥有完整可读的数据副本。
6. **端到端安全与隐私**：数据可以在客户端本地加密后再同步至不可信云端中继。
7. **数据所有权终极保留**：支持自由导出与跨平台迁移。

## **VI.11.2 冲突解决核心算法：CRDTs (无冲突复制数据类型)**

在没有中心化锁机制的多人离线并发编辑场景下，传统的“后写入获胜 (Last-Write-Wins)”策略会导致数据相互覆盖丢失。现代协同系统依赖 **[CRDTs (Conflict-free Replicated Data Types)](https://crdt.tech/)**：

- **强最终一致性 (Strong Eventual Consistency)**：任意两个客户端只要接收到相同的变更操作集合（无论到达顺序先后），其在本地计算得出的最终文档状态**在数学上必然完全等价**，无需中心服务器仲裁。
- **主流 CRDT 开源生态**：
  - [**Yjs**](https://yjs.dev/)：JavaScript 生态中采用度最高、性能极其优异的 CRDT 实现。拥有成熟的富文本绑定生态（ProseMirror、Quill、Slate、Monaco Editor）与多网络 Provider（WebSocket、WebRTC、IndexedDB）。
  - [**Automerge**](https://automerge.org/)：专注于将复杂 JSON 数据结构转化为 CRDT 的严谨实现，底层由 Rust 重写以提供卓越性能。
  - [**Loro**](https://loro.dev/)：由国内团队基于 Rust 开发的高性能下一代 CRDT 库，专注于富文本、版本时间旅行（Time Travel）与超低内存占用。

## **VI.11.3 协同状态感知：Awareness & Presence**

除了文档数据的持久化同步，实时协同还需要广播短暂的非持久化瞬态信息：

- **协同光标 (Multiplayer Cursors)**：展示其他协作者的实时鼠标移动轨迹与选择高亮。
- **在线状态 (Presence)**：展示当前正在查看/编辑该文档的用户头像列表与激活焦点。

## **表格：Local-First vs 传统 REST SPA vs 纯 WebSocket 状态机**

| 评估维度 | Local-First 架构 (CRDT + 本地 DB) | 传统 REST / GraphQL SPA | 中心化 WebSocket 实时状态机 |
| :--- | :--- | :--- | :--- |
| **主数据源 (SSOT)** | 客户端本地数据库 (OPFS / IndexedDB) | 远端中心化关系型数据库 | 服务端内存状态机 / Redis |
| **交互延迟感知** | 0ms（纯本地同步写入） | 取决于网络 RTT（50ms ~ 数秒不等） | 较快（数十毫秒网络往返） |
| **离线可用性** | 完美支持（联网后自动合并双向增量） | 极差（断网无法完成写入） | 差（连接断开即失去交互响应） |
| **多人协同冲突解决** | CRDT / OT 算法数学收敛，零丢失 | 简单的最后写入覆盖 (LWW)，易丢数据 | 由服务端锁或单线程队列串行化仲裁 |
| **系统架构复杂度** | 较高（需理解分布式数据模型与同步协议） | 低至中等（经典 CRUD，心智模型简单） | 中等（需维护有状态的长连接集群） |

::: details 启发式示例：基于 Yjs 的多人协同状态同步

下面的代码展示了如何使用 `Yjs` 创建协同文档、通过 `IndexedDB` 本地持久化、并通过 `WebSocket` 实现多人实时状态同步与光标感知：

```ts
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";

// 1. 初始化本地协同文档
const doc = new Y.Doc();

// 2. 绑定本地持久化：断网或刷新页面数据不丢失
const idbPersistence = new IndexeddbPersistence("project-doc-101", doc);

// 3. 连接协同同步服务
const wsProvider = new WebsocketProvider(
  "wss://sync.example.com",
  "project-room-101",
  doc
);

// 4. 获取共享响应式数据类型（例如协同 Map）
const ySettings = doc.getMap("settings");

// 监听跨客户端的数据变更
ySettings.observe((event) => {
  console.log("配置被协作者修改：", ySettings.toJSON());
  updateUI(ySettings.get("themeColor"));
});

// 本地即时修改：零网络延迟更新本地状态，随后自动在后台广播
function changeTheme(color: string) {
  ySettings.set("themeColor", color);
}

// 5. 设置用户协同光标感知 (Awareness)
wsProvider.awareness.setLocalStateField("user", {
  name: "Minsecrus",
  color: "#3b82f6",
  cursor: { x: 120, y: 340 },
});

wsProvider.awareness.on("change", () => {
  // 获取当前房间内所有在线协作者的光标与状态
  const states = Array.from(wsProvider.awareness.getStates().values());
  renderCollaboratorCursors(states);
});
```

该示例展示了 Local-First 的核心魅力：无论本地网络处于离线还是秒开状态，`ySettings.set()` 均可瞬时完成本地落库并触发 UI 渲染；一旦网络连通，Yjs 会自动计算最小增量差异包与远端建立无冲突数学合并。

:::
