---
title: "V. 高级主题和专业开发最佳实践 / V.16 法律、合规与隐私"
---

# V.16 法律、合规与隐私

前端直接运行在用户终端设备上，是个人数据采集、Cookie 读写、第三方追踪脚本注入以及 AI 生成内容呈现的第一现场。任何未经授权的脚本加载、默认勾选的隐私弹窗或违规打包的传染性开源许可证，都可能直接触发监管处罚或商业法律风险。

## V.16.1 GDPR、CCPA 等隐私法规对前端的要求

欧盟的 [GDPR（General Data Protection Regulation）](https://gdpr.eu/) 与美国加州的 [CCPA（California Consumer Privacy Act）](https://oag.ca.gov/privacy/ccpa) 均具备域外管辖效力：只要产品面向对应地区居民提供服务或处理其个人数据，就必须遵守相关约束。落到前端工程层面，核心要求包括：

- **用户同意（Consent）与选择退出（Opt-out）**：GDPR 要求处理个人数据具备合法基础（同意是第 6 条列出的六种合法基础之一）；而在终端设备上存储或读取非必要信息（如分析、广告 Cookie 和各类追踪器），在欧盟通常需依据 ePrivacy 指令事先获得用户明确、知情的同意（Opt-in）。CCPA 则以清晰告知和“选择退出（Opt-out）”为主，例如在页面显著位置提供“不出售或共享我的个人信息”入口。前端需接入同意管理平台（Consent Management Platform，CMP），如实展示数据收集目的，并提供对等的同意与拒绝操作。
- **数据最小化**：表单、埋点与日志只采集业务所必需的最小字段，避免在 URL 参数、报错堆栈或本地存储中顺带记录完整手机号、身份证号、邮箱等个人可识别信息（PII）。
- **用户权利闭环**：用户依法享有查阅、导出、更正、删除个人数据及撤回同意的权利。前端需提供配套的自助设置界面与状态反馈，确保撤回或删除操作能同步清理客户端缓存。
- **透明度与传输安全**：在收集点就近关联隐私政策与 Cookie 清单说明数据用途与保留周期；全站强制启用 HTTPS，并避免将敏感凭据写入前端可读存储。

## V.16.2 Cookie 管理与用户同意（Consent Management）的最佳实践

客户端存储（Cookie、`localStorage`、`IndexedDB`）与第三方追踪脚本是隐私合规审查的重灾区，工程落地需遵循以下边界：

- **按用途严格分级 Cookie**：
  - **必要（Strictly Necessary）**：维持登录会话、CSRF 防护、购物车状态等核心功能所必需，通常无需事先征得同意，但仍需在隐私声明中披露。
  - **功能性（Functional）**：记忆语言、地区或界面偏好等增强体验项，视法域要求决定是否需要显式同意。
  - **分析/性能（Analytics）与营销/追踪（Marketing）**：用于流量统计、跨站画像与个性化广告，在 GDPR 等严监管地区必须在获得明确同意后才能写入。
- **实施严格的同意管理（CMP）交互**：
  - 首次访问时通过合规横幅或弹窗呈现分级选项，严禁将非必要类别设为默认勾选，且“拒绝非必要”与“全部接受”按钮必须在同一层级、具备对等的视觉权重。
  - 提供常驻入口（如页脚“Cookie 设置”），支持用户随时查看或撤回历史授权。
- **前端底层技术管控**：
  - **前置脚本阻断**：在用户完成授权前，严禁在 HTML 中直接执行 Google Analytics、广告像素等非必要第三方脚本，必须由同意状态管理器按需动态挂载。
  - **Cookie 安全属性**：设置 Cookie 时显式指定 `SameSite` 与 `Secure` 属性；涉及会话凭据的 Cookie 应由服务端下发并附加 `HttpOnly`（客户端脚本无法设置该属性），防止被 XSS 脚本窃取。
  - **本地数据连带清理**：当用户触发账号注销、数据删除或撤回某类授权时，前端除调用服务端接口外，还必须同步清空 `localStorage`、`sessionStorage`、`IndexedDB` 及本站可控 Cookie 中的对应数据。

## V.16.3 用数据流和同意状态表达隐私边界

```mermaid
flowchart LR
  U[用户] --> CMP[同意管理界面]
  CMP -->|必要| APP[应用功能]
  CMP -->|同意分析| ANA[分析脚本]
  CMP -->|同意营销| ADS[营销脚本]
  APP --> API[服务端 API]
  API --> STORE[受控数据存储]
```

前端可以把同意结果收敛成明确状态，再决定是否加载第三方脚本：

```ts
type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export function applyConsent(consent: Consent) {
  if (consent.analytics) loadScript("/analytics.js");
  if (consent.marketing) loadScript("/marketing.js");
}

function loadScript(src: string) {
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  document.head.append(script);
}
```

加载前应核对数据用途、供应商、保存周期、撤回行为和所在市场的法律要求。日志、localStorage、IndexedDB、Cookie 和第三方 SDK 都应进入数据清单。

::: details 示例：基于同意状态的第三方脚本按需加载与撤回

**违规反模式：在 HTML 中无条件直接加载第三方追踪脚本**
```html
<head>
  <!-- 违规：用户尚未同意，即已直接向第三方服务器发送包含 IP 和设备指纹的请求 -->
  <script src="https://analytics.example.com/tracker.js" async></script>
</head>
```

**合规推荐实践：通过同意管理器控制动态注入与撤回**
```ts
export type ConsentPreferences = {
  necessary: true; // 始终为 true
  analytics: boolean;
  marketing: boolean;
};

type OptionalCategory = "analytics" | "marketing";

// 每个类别对应的脚本，以及该脚本在本站域名下写入的 Cookie 名称
const VENDORS: Record<OptionalCategory, { id: string; src: string; cookies: string[] }> = {
  analytics: {
    id: "analytics-sdk",
    src: "https://analytics.example.com/tracker.js",
    cookies: ["_ex_analytics_id"],
  },
  marketing: {
    id: "marketing-pixel",
    src: "https://ads.example.com/pixel.js",
    cookies: ["_ex_ads_id"],
  },
};

class ConsentManager {
  private preferences: ConsentPreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
  };

  constructor() {
    this.restoreFromStorage();
  }

  private restoreFromStorage() {
    try {
      const stored = localStorage.getItem("user_consent");
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored), necessary: true };
        this.apply();
      }
    } catch {
      // 存储不可用或数据损坏时，保持默认的“全部拒绝”
    }
  }

  public updateConsent(updates: Partial<Record<OptionalCategory, boolean>>) {
    const previous = this.preferences;
    this.preferences = { ...previous, ...updates, necessary: true };

    try {
      localStorage.setItem("user_consent", JSON.stringify(this.preferences));
    } catch {
      // 无法持久化时，本次会话仍按新的选择执行
    }

    const revoked = (Object.keys(VENDORS) as OptionalCategory[]).filter(
      (category) => previous[category] && !this.preferences[category],
    );

    if (revoked.length > 0) {
      revoked.forEach((category) => this.clearVendor(category));
      // 已执行的脚本无法从内存中卸载，重新加载页面让撤回立即生效
      location.reload();
      return;
    }

    this.apply();
  }

  private apply() {
    for (const category of Object.keys(VENDORS) as OptionalCategory[]) {
      if (this.preferences[category]) {
        this.loadScriptOnce(VENDORS[category].id, VENDORS[category].src);
      }
    }
  }

  private clearVendor(category: OptionalCategory) {
    const { id, cookies } = VENDORS[category];
    document.getElementById(id)?.remove();
    for (const name of cookies) {
      // Path、Domain 需与写入时一致才能删除成功
      document.cookie = `${name}=; Max-Age=0; Path=/`;
    }
  }

  private loadScriptOnce(id: string, src: string) {
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
  }
}

export const consentManager = new ConsentManager();
```

把第三方脚本的注入时机严格绑定到 `ConsentManager` 保存的同意状态上，可以确保用户点击同意前，浏览器不会向任何第三方数据收集域名发出网络请求，从技术上避免这类违规风险。

撤回同意时，已执行的脚本无法从内存中卸载，示例会移除脚本节点、删除已知的本站 Cookie，再重新加载页面。第三方域名下的 Cookie 无法由页面脚本删除，需要通过供应商提供的接口或服务端流程处理。

:::

## V.16.4 EU AI Act 与前端人工智能功能透明度合规

随着 [EU AI Act（欧盟人工智能法案）](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) 分阶段生效，涉及 AI 交互的前端应用必须守住严格的透明度与反欺诈红线：

1. **生成式内容显式披露（AI Content Disclosure）**：页面中由大模型生成的文本、图像、视频或合成语音，必须在 UI 层面提供明确的人类可读标识（如“由 AI 辅助生成”）与元数据水印。
2. **AI 对话知情权**：当用户在与智能客服或 AI 助理交互时，界面必须在一开始明确告知用户“当前正在与 AI 系统对话”，严禁伪装为真人客服。
3. **禁止操纵性暗黑模式（Dark Patterns）**：严禁利用 AI 个性化推荐诱导用户做出非理性的高危财务或隐私授权决策。

## V.16.5 开源软件供应链与许可证（License）治理

现代前端项目平均依赖数百个 npm 模块，开源许可证合规与依赖安全直接关系到企业的商业法律风险：

1. **常见许可证分类与传染性约束**：
   - **宽松型（Permissive）**：MIT、Apache 2.0、BSD。允许闭源商业使用与修改，只需保留原始版权声明，合规风险通常最低。
   - **强传染型（Copyleft）**：GPL、AGPL。若前端代码打包（Bundle）中直接静态链接了 GPL 模块，可能导致整个前端项目乃至后端代码被强制要求按照 GPL 开源。
   - **商业化协议变更（BSL / SSPL）**：部分开源基础设施曾改用限制性许可证（如 Redis、Elasticsearch 的协议变迁），需密切关注其二次分发约束，避免在商业 SaaS 产品中违规打包。
2. **SBOM（Software Bill of Materials，软件物料清单）与自动化 CVE 审计**：
   - 在构建时生成 SBOM，列出产物包含的全部依赖及其版本和许可证，漏洞披露后可以快速判断哪些版本受影响。
   - 在 CI 流程中集成 `pnpm audit`、Socket.dev、Snyk 等依赖安全审计工具。`pnpm audit` 只把依赖树与公开安全公告中的已知漏洞（通常带有 CVE 编号；CVE 即 Common Vulnerabilities and Exposures，公开漏洞的统一编号体系）比对，发现不了尚未披露的恶意包；仿冒包名（Typosquatting，即发布名称与流行包极其相似的包，诱导开发者误装）、安装脚本窃取凭据等风险，需要结合包行为分析工具、锁文件审查和限制依赖安装脚本来防范。
