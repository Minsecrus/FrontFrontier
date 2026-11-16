---
title: "VI. 新兴技术和专业领域 / VI.11 本地优先架构与实时协同计算（Local-First & CRDTs）"
---

# VI.11 本地优先架构与实时协同计算（Local-First & CRDTs）

传统 Web 应用以云端数据库为唯一数据源：每次写操作都要等待网络请求往返（RTT）后才能确认状态，一旦离线或网络抖动，界面交互就会停滞。本地优先（Local-First） 架构将主数据源（SSOT，Single Source of Truth，即应用状态以哪份数据为准）移到客户端本地存储：读写先在本地数据库中即时完成，随后在后台向云端增量同步，多设备与多人的并发修改则交由 CRDT 等算法自动合并，从而兼顾零网络延迟的交互响应、离线可用性与实时协同。

## VI.11.1 本地优先的七项理想目标

Martin Kleppmann 等人在 Ink & Switch 发表的 [*Local-first software*](https://www.inkandswitch.com/local-first/) 一文中，为本地优先软件提出了七项衡量标准：

1. **无需等待（No Spinners）**：读写直接在本地内存与磁盘完成，交互响应不绑定网络往返。
2. **不被困在单一设备**：用户在手机、平板与桌面端的本地修改可在后台自动跨端同步。
3. **网络是可选的**：断网或弱网环境下，核心创建与编辑功能照常运作。
4. **顺畅的多人协作**：支持类似 Google Docs、Figma 的多人实时共编与冲突自动消解。
5. **数据长期可用**：即使云端服务商停运，用户本地仍保有完整、可独立读取的数据副本。
6. **默认安全与隐私**：支持在客户端完成端到端加密（E2EE），云端同步节点只转发密文增量。
7. **用户保有最终控制权**：本地数据可按开放格式自由导出、备份或迁移到其他工具。

## VI.11.2 冲突解决核心算法：CRDTs（无冲突复制数据类型）

在没有中心服务器加锁仲裁的多端离线并发编辑场景下，简单的“最后写入获胜（Last-Write-Wins，LWW）”会让后到达的快照直接覆盖他人的并发修改。现代协同系统普遍采用 [CRDTs (Conflict-free Replicated Data Types)](https://crdt.tech/)：

- **强最终一致性（Strong Eventual Consistency）**：各客户端对数据结构的操作满足交换律、结合律与幂等性。只要任意两个节点最终收到相同的变更操作集合（无论网络到达顺序如何），各自在本地独立合并出的最终文档状态必定严格一致，无需中心服务器串行仲裁。
- **主流 CRDT 开源生态**：
  - [Yjs](https://yjs.dev/)：JavaScript 生态中应用最广的基于状态的序列 CRDT 实现，内存与合并性能优异，提供现成的富文本编辑器绑定（ProseMirror、Quill、Slate、Monaco Editor）以及可插拔的传输与存储 Provider（WebSocket、WebRTC、IndexedDB）。
  - [Automerge](https://automerge.org/)：面向 JSON 式嵌套文档树的 CRDT 实现，底层核心已用 Rust 重写并编译为 Wasm 以压缩历史体积与提升合并吞吐。
  - [Loro](https://loro.dev/)：基于 Rust 与 Fugue 算法的现代 CRDT 库，针对富文本样式合并、树形节点移动、低开销历史版本回溯（Time Travel）做了专门优化。

## VI.11.3 协同状态感知：Awareness & Presence

除了需要持久化落盘并严格合并的文档内容，实时协同界面还需要通过轻量广播通道同步只在当前会话存活的临时状态（Ephemeral State）：

- **协同光标（Multiplayer Cursors）**：实时广播并渲染其他协作者当前的文本选区、画布视口框或鼠标坐标。
- **在线状态（Presence）**：展示当前房间内的在线成员列表、头像以及各自聚焦的模块或字段。

除专用的 CRDT 文档模型外，面向常规结构化业务数据的前端应用也可以采用 [TanStack DB](https://tanstack.com/db) 等客户端响应式数据库层：把接口数据映射为标准化本地集合，在客户端执行高速增量关联查询与即时乐观更新，再按需对接远端同步协议，从而在传统缓存与完整本地优先系统之间平滑演进（状态边界划分参见[服务器状态与客户端状态](/guide/frameworks/server-client-state)）。

下表从主数据源位置、延迟感知、离线能力与冲突解决机制四个维度，对比了本地优先架构与传统前端状态模型：

| 评估维度             | Local-First 架构（CRDT + 本地 DB）      | 传统 REST / GraphQL SPA             | 中心化 WebSocket 实时状态机      |
| :------------------- | :------------------------------------- | :---------------------------------- | :------------------------------- |
| **主数据源（SSOT）** | 客户端本地数据库（OPFS / IndexedDB）    | 远端中心化关系型数据库              | 服务端内存状态机 / Redis         |
| **交互延迟感知**     | 接近 0（只需写入本地）                 | 取决于网络 RTT（50 毫秒到数秒不等）  | 较快（数十毫秒网络往返）         |
| **离线可用性**       | 原生支持（联网后自动合并双向增量）     | 通常不可用（断网后无法写入）        | 差（连接断开后无法交互）         |
| **多人协同冲突解决** | CRDT 自动收敛到一致状态；同一字段的并发写入仍按确定规则只保留一个值 | 简单的最后写入覆盖（LWW），易丢数据  | 由服务端锁、单线程队列或 OT 串行化仲裁 |
| **系统架构复杂度**   | 较高（需理解分布式数据模型与同步协议） | 低至中等（经典 CRUD，心智模型简单） | 中等（需维护有状态的长连接集群） |

::: details 示例：基于 Yjs 的多人协同状态同步

下面的代码使用 `Yjs` 创建协同文档，通过 `IndexedDB` 做本地持久化，并通过 `WebSocket` 实现多人状态同步与光标感知：

```ts
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";

// 1. 初始化本地协同文档
const doc = new Y.Doc();

// 2. 绑定本地持久化：断网或刷新页面后本地数据仍在
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

// 本地修改：立即更新本地状态，随后在后台同步给其他端
function changeTheme(color: string) {
  ySettings.set("themeColor", color);
}

// 5. 设置用户协同光标感知（Awareness）
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

这个示例体现了本地优先的关键特点：无论在线还是离线，`ySettings.set()` 都会立即更新本地文档并触发 UI 渲染，y-indexeddb 随后异步写入 IndexedDB；网络连通后，Yjs 只与远端交换缺失的增量更新，并自动合并。

注意，CRDT 保证各端最终一致，并不保证“零丢失”。两人同时修改 `themeColor` 时，Y.Map 会按确定规则只保留其中一个值；需要保留双方编辑意图的内容，应使用 `Y.Text`、`Y.Array` 等能合并并发插入的结构。

:::
