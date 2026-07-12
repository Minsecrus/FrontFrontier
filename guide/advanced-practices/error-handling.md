---
title: "V. 高级主题和专业开发最佳实践 / V.10 错误处理和防御性编程：构建健壮的应用程序"
---

# V.10 错误处理和防御性编程：构建健壮的应用程序

**目的**：创建能够优雅地处理意外问题、提供有意义的反馈并防止崩溃的弹性应用程序。

前端错误处理的目标，是在错误发生时尽量缩小影响范围，并让用户和开发者都能知道下一步该做什么。  
一个成熟应用通常需要同时处理渲染错误、网络错误、业务错误、权限错误、表单错误和第三方脚本错误。

- **渲染错误**：组件渲染过程中出现异常，可能导致局部界面无法显示。  
  在 React 中可以通过错误边界 (Error Boundary) 捕获子组件树中的渲染错误，记录错误并显示备用 UI，把影响范围控制在局部。
- **网络错误**：请求超时、断网、DNS 失败、服务不可用、网关错误等。  
  这类错误应提供重试、离线提示、后台恢复或明确的失败反馈。
- **业务错误**：接口正常返回，但业务规则不允许继续，例如余额不足、库存变化、状态已过期、权限不足。  
  业务错误应该使用用户能理解的语言说明原因，并尽量给出下一步操作。
- **表单错误**：输入格式错误、必填项缺失、字段冲突、服务端校验失败。  
  表单错误应靠近对应字段展示，并保留用户已经输入的内容，让用户可以直接修正并继续当前流程。
- **权限和认证错误**：登录过期、token 失效、角色权限不足、跨租户访问被拒绝。  
  这类错误应区分“需要重新登录”和“账号无权限”，分别进入刷新会话、重新登录或权限提示流程。
- **第三方依赖错误**：统计脚本、地图、支付、客服、广告或其他外部 SDK 失败。  
  第三方能力应尽量隔离，让非核心脚本的失败停留在可降级范围内。

错误处理需要分层设计：

- **组件层**：处理局部渲染失败、空状态、加载状态和轻量交互错误。
- **请求层**：统一处理超时、重试、取消请求、状态码映射和错误对象标准化。
- **路由层**：处理页面级加载失败、未找到资源、权限不足和路由异常。
- **应用层**：处理全局兜底错误、日志上报、用户会话失效和不可恢复异常。
- **监控层**：记录错误堆栈、用户环境、版本号、路由、请求 ID 和复现线索。

防御性编程并不意味着到处写 `try-catch`。  
更重要的是提前明确输入输出边界，并让不可信数据在进入业务逻辑前被校验和规范化。

- **校验外部输入**：包括用户输入、URL 参数、接口响应、LocalStorage、postMessage、第三方 SDK 返回值。
- **显式处理空状态**：对可选字段、空数组、空对象和异常状态做明确处理。
- **保留安全默认值**：当配置缺失或接口异常时，选择更保守的行为。
- **区分用户错误和系统错误**：用户输错内容，应提示如何修正；系统异常，应提供重试、反馈或稍后再试。
- **记录错误上下文**：捕获错误后应记录必要信息，让问题可以被定位和复盘。

<BadGoodExample bad-title="所有失败都进入同一个 catch" good-title="让失败类型决定恢复动作" vertical>
<template #bad>

```ts
async function submitProfile(input: ProfileInput) {
  try {
    await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    toast("保存成功");
  } catch {
    toast("保存失败");
  }
}
```

</template>
<template #good>

```ts
type SaveProfileResult =
  | { ok: true }
  | {
      ok: false;
      kind: "validation";
      fields: Record<string, string>;
    }
  | { ok: false; kind: "conflict"; message: string }
  | { ok: false; kind: "unauthenticated" }
  | { ok: false; kind: "network"; retryable: boolean }
  | { ok: false; kind: "server"; requestId?: string };

async function submitProfile(input: ProfileInput) {
  const result: SaveProfileResult = await saveProfile(input);

  if (result.ok) {
    toast("保存成功");
    return;
  }

  switch (result.kind) {
    case "validation":
      form.setErrors(result.fields);
      return;
    case "conflict":
      showInlineMessage(result.message);
      return;
    case "unauthenticated":
      redirectToLogin({ returnTo: location.href });
      return;
    case "network":
      showRetryAction({ enabled: result.retryable });
      return;
    case "server":
      showIncidentMessage({ requestId: result.requestId });
  }
}
```

</template>
</BadGoodExample>

请求层应负责把断网、超时、HTTP 状态码和服务端错误体标准化成稳定结果；组件层负责把结果转换为用户能执行的下一步。搜索词改变后触发的 `AbortError` 属于主动取消，应直接结束旧流程。异常日志只保留 request ID、路由和版本等必要诊断上下文，并对请求数据执行脱敏与最小化处理。

## **表格：常见错误类型与处理方式**

| 错误类型       | 常见表现                         | 处理策略                                      |
| :------------- | :------------------------------- | :-------------------------------------------- |
| 渲染错误       | 页面局部崩溃、白屏               | Error Boundary、页面级 fallback、日志上报     |
| 网络错误       | 请求失败、超时、断网             | 重试、取消请求、离线提示、后台刷新            |
| 业务错误       | 状态不允许、库存变化、权限不足   | 明确说明原因，提供下一步操作                  |
| 表单错误       | 字段无效、提交失败               | 字段级提示、保留输入、服务端错误回填          |
| 认证错误       | token 过期、会话失效             | 刷新 token、重新登录、恢复原跳转目标          |
| 第三方错误     | SDK 加载失败、外部服务不可用     | 隔离影响范围、降级能力、监控告警              |

可靠的错误处理和数据验证对应用程序的稳定性和用户信任至关重要。  
客户端验证可以改善 UX；服务器端验证始终是安全和数据完整性的必要环节。好的错误处理能让系统在失败时仍然可理解、可恢复、可观测。
