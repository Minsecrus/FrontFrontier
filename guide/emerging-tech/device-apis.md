---
title: "VI. 新兴技术和专业领域 / VI.10 设备集成：Web Bluetooth、WebUSB、WebHID、Generic Sensor API"
---

# VI.10 设备集成：Web Bluetooth、WebUSB、WebHID、Generic Sensor API

在安全上下文（HTTPS）与用户显式授权的前提下，现代浏览器支持跳过额外驱动或本地守护进程，直接与设备内置传感器及蓝牙、USB、HID 外设通信。Web 端的硬件交互主要由以下四组 API 构成：

- [Generic Sensor API](https://developer.mozilla.org/en-US/docs/Web/API/Generic_Sensor_API)：以统一的事件与采样频率接口向网页暴露加速度计、陀螺仪、环境光、磁力计等板载传感器。
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)：扫描、连接低功耗蓝牙（BLE）外设并读写其 GATT 服务与特性。
- [WebUSB API](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API)：直接访问非标准或厂商自定义的 USB 设备接口，免去用户为专用硬件单独安装系统驱动或桌面客户端的步骤。
- [WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API)：与游戏手柄、宏键盘、旋钮控制台等人机接口设备（HID）双向收发输入输出报告（Reports）。

这四类 API 均要求运行在安全上下文（HTTPS）中，且外设连接必须由用户手势触发授权。下表对比了它们面向的硬件类型与当前浏览器兼容边界：

| API 名称                                                                                      | 目的（设备类型）               | 关键功能（示例）                      | 安全要求（[HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限） | 浏览器支持（实验性/基线） |
| :-------------------------------------------------------------------------------------------- | :----------------------------- | :------------------------------------ | :------------------------------------------------------------------------------------- | :------------------------ |
| [Generic Sensor API](https://developer.mozilla.org/en-US/docs/Web/API/Generic_Sensor_API) | 设备传感器（加速度计、陀螺仪） | 读取传感器数据，事件监听              | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 有限（仅 Chromium 系）    |
| [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)   | 低功耗蓝牙设备                 | 连接 BLE 设备，读写 GATT 特性         | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 实验性                    |
| [WebUSB API](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API)                | 非标准 USB 设备                | 连接 USB 设备，读写数据，简化驱动安装 | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 实验性                    |
| [WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API)                 | 人机接口设备（游戏手柄）       | 连接 HID 设备，发送/接收报告          | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 实验性                    |

## VI.10.1 Web Bluetooth API

[Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) 专门面向低功耗蓝牙（BLE，蓝牙 4.0 及以上）外设，不支持经典蓝牙（Bluetooth Classic）音频或串口传输：

- **交互模型与适用设备**：适用于心率带、智能灯具、蓝牙电子秤、工业巡检终端等基于通用属性配置文件（GATT）通信的设备。应用通过 `navigator.bluetooth.requestDevice()` 弹出系统级设备选择器，连接 GATT Server 后即可按 UUID 发现服务（Service）、读写特性值（Characteristic）与描述符（Descriptor），或订阅特征值变更通知。
- **权限与安全边界**：仅限 HTTPS 环境，且 `requestDevice()` 必须由点击等用户手势触发；浏览器维护了受保护的敏感 GATT 服务黑名单（如固件升级或键盘输入服务），默认禁止网页直接读写以收敛攻击面。
- **兼容范围**：目前仍属实验性能力，Chrome、Edge 和 Opera 在 Android、macOS、Windows 上默认启用（Linux 桌面端常需手动开启标志位）；Firefox 与 Safari 均不支持，上线前需核对 [MDN 兼容性表](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API#browser_compatibility)。
- **Electron 扩展控制**：在 Electron 中可通过 `webContents` 的 `select-bluetooth-device` 事件接管设备配对列表，并配合 `ses.setDevicePermissionHandler` 定制默认授权策略。

## VI.10.2 WebUSB API

[WebUSB API](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API) 面向硬件开发板、科学仪器、工业控制器、热敏打印机等非标准 USB 设备，常用于在线固件烧录、硬件配置与串口调试：

- **设备类型限制与安全边界**：WebUSB 不允许网页绕过系统权限访问网络摄像头、常规大容量存储（U 盘）或标准键鼠等受操作系统保护的 USB 设备类（Protected Classes）。请求连接同样需要 HTTPS 与用户手势，且支持通过 HTTP `Permissions-Policy` 响应头限制可调用该 API 的 iframe 来源。由于直接暴露底层 USB 传输通道风险较高（例如若用户误授权 Android 手机的 ADB 接口，恶意网页可能借此控制手机），生产环境必须引导用户核对设备厂商 ID（`vendorId`）与产品 ID（`productId`）。
- **兼容范围**：仅 Chrome（自 61 版起）、Edge 和 Opera 的桌面端与 Android 端默认支持；iOS、Firefox 与 Safari 均不支持。
- **Electron 扩展控制**：Electron 提供 `select-usb-device`、`usb-device-added`、`usb-device-removed` 与 `usb-device-revoked` 事件来管理设备热插拔与权限撤销，并允许通过 `ses.setUSBProtectedClassesHandler` 调整受保护 USB 设备类的拦截策略。

## VI.10.3 WebHID API

[WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API) 处于底层 WebUSB/Web Bluetooth 与高层输入事件（`KeyboardEvent`、Gamepad API）之间，专为采用 HID 协议但需要双向自定义报文的外设设计：

- **适用场景与保护列表**：常用于在线配置定制机械键盘（如 VIA 改键工具）、控制 Elgato StreamDeck 导播台、读取专用会议耳机按键或 blink(1) 信号灯。出于防键盘记录与防凭证窃取考虑，产生标准字符输入的主键盘、鼠标以及 FIDO 安全密钥等属于受保护的顶层集合（Protected Top-Level Collections），浏览器默认禁止通过 WebHID 拦截。
- **兼容范围**：目前仅 Chrome（自 89 版起）、Edge 和 Opera 的桌面版支持；移动端浏览器、Firefox 和 Safari 均不支持，产品需明确标注支持的桌面浏览器范围。
- **Electron 扩展控制**：Electron 提供 `select-hid-device`、`hid-device-added` 与 `hid-device-removed` 事件，以及 `ses.setDevicePermissionHandler` 和 `ses.setPermissionCheckHandler` 权限钩子；默认沿用 Chromium 的 HID 阻止列表（blocklist），特殊工业客户端可通过 `disable-hid-blocklist` 命令行开关按需放开。

综合来看，Web Bluetooth、WebUSB 与 WebHID 均属于**仅限 Chromium 系的实验性硬件接口**：在公网 Web 应用中应先做运行时能力检测并明确提示兼容的浏览器与操作系统；若业务强依赖静默连接、受保护设备类访问或跨平台一致的硬件管控，则更适合封装进 Electron 等桌面容器中交付。

## VI.10.4 Web Bluetooth 的授权与断开处理

设备选择必须由用户手势触发，连接状态和异常状态也应显式反馈：

```js
export async function connectBluetooth() {
  if (!navigator.bluetooth) throw new Error("当前浏览器不支持 Web Bluetooth");

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: ["battery_service"] }],
  });

  device.addEventListener("gattserverdisconnected", () => {
    console.info("设备已断开");
  });

  const server = await device.gatt?.connect();
  if (!server) throw new Error("无法连接 GATT 服务");
  return { device, server };
}
```

上线前需要提供 HTTPS、权限拒绝、设备断开、重新连接、浏览器不支持和撤销授权的用户路径。设备名称、服务 UUID 和传感器数据也应按最小必要原则处理。
