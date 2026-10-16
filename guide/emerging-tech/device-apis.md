---
title: "VI. 新兴技术和专业领域 / VI.10 设备集成：Web Bluetooth、WebUSB、WebHID、Generic Sensor API"
---

# VI.10 设备集成：Web Bluetooth、WebUSB、WebHID、Generic Sensor API

**目的**：让 Web 应用直接与用户电脑或移动设备上连接的硬件交互。

- [**Generic Sensor API**](https://developer.mozilla.org/en-US/docs/Web/API/Generic_Sensor_API)：一套接口，以一致的方式将设备传感器（例如加速度计、陀螺仪、环境光传感器）暴露给 Web 平台。
- [**Web Bluetooth API**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)：连接并交互低功耗蓝牙（BLE）外围设备。
- [**WebUSB API**](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API)：让网页访问非标准的 USB 设备，许多设备因此无需单独安装驱动程序。
- [**WebHID API**](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API)：连接人机接口设备（HID），例如游戏手柄、键盘和其他专用输入设备。
- **安全注意事项**：这些 API 通常都要求安全上下文（HTTPS）和用户的明确授权。

**表格：Web 设备集成 API 比较**

| API 名称                                                                                      | 目的（设备类型）               | 关键功能（示例）                      | 安全要求（[HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限） | 浏览器支持（实验性/基线） |
| :-------------------------------------------------------------------------------------------- | :----------------------------- | :------------------------------------ | :------------------------------------------------------------------------------------- | :------------------------ |
| [**Generic Sensor API**](https://developer.mozilla.org/en-US/docs/Web/API/Generic_Sensor_API) | 设备传感器（加速度计、陀螺仪） | 读取传感器数据，事件监听              | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 有限（仅 Chromium 系）    |
| [**Web Bluetooth API**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)   | 低功耗蓝牙设备                 | 连接 BLE 设备，读写 GATT 特性         | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 实验性                    |
| [**WebUSB API**](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API)                | 非标准 USB 设备                | 连接 USB 设备，读写数据，简化驱动安装 | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 实验性                    |
| [**WebHID API**](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API)                 | 人机接口设备（游戏手柄）       | 连接 HID 设备，发送/接收报告          | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 实验性                    |

## **VI.10.1 Web Bluetooth API**

[Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) 允许网站以安全、保护隐私的方式与蓝牙设备通信。

- **使用场景**：让 Web 应用与附近的低功耗蓝牙（BLE，蓝牙 4.0 及以上）设备交互，例如心率监测器、智能灯泡、自助终端和玩具。
- **功能**：开发者可以请求蓝牙设备（`navigator.bluetooth.requestDevice`），连接到设备的通用属性配置文件（GATT）服务器，读写蓝牙特性，接收 GATT 通知，以及断开连接。它还支持读写蓝牙描述符，描述符提供有关特性值的附加信息。
- **安全与隐私**：Web Bluetooth API 要求在安全上下文（HTTPS）中运行。出于安全考虑，`requestDevice()` 方法必须由用户手势（例如点击）触发。对于难以安全开放的部分蓝牙功能，该 API 在设计上不予开放，以缩小恶意网站可利用的攻击面。
- **浏览器支持与成熟度**：Web Bluetooth API 可用性有限，MDN 仍将其标为实验性技术。Chrome、Edge 和 Opera 已在 Android、macOS、Windows 等平台默认启用（Linux 桌面默认未启用）；Firefox 和 Safari 均不支持。规范仍在演进，上线前应以 [MDN 兼容性表](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API#browser_compatibility)为准。
- **Electron 环境**：在 Electron 中，开发者可以通过 `webContents` 上的 `select-bluetooth-device` 事件选择蓝牙设备，并通过 `ses.setDevicePermissionHandler` 提供默认权限，实现更灵活的设备管理。

## **VI.10.2 WebUSB API**

WebUSB API 让网页能够访问非标准 USB 设备提供的功能，目标是让这类设备用起来更方便，也比安装原生驱动更安全。

- **使用场景**：主要用于访问科学仪器、工业设备等非标准 USB 设备，以及刷写固件。注意，它不支持网络摄像头、HID 设备或大容量存储设备等常见设备。
- **安全与隐私**：与 Web Bluetooth 类似，WebUSB API 也仅在安全上下文（HTTPS）中运行。`requestDevice()` 方法同样必须由用户手势触发。权限策略（Permissions Policy）机制允许开发者选择性地启用或禁用 WebUSB 等浏览器功能和 API。然而，WebUSB 也带来潜在的安全隐患，例如网站可能利用它建立 ADB 连接并入侵所连接的 Android 手机。
- **浏览器支持与成熟度**：WebUSB API 可用性有限，同样被视为实验性技术。Chrome、Edge 和 Opera（桌面和 Android）均已支持，Chrome 自 61 版起默认启用；Firefox 和 Safari 不支持。
- **Electron 环境**：在 Electron 中，WebUSB API 提供了 `select-usb-device` 事件，以及 `usb-device-added`、`usb-device-removed` 和 `usb-device-revoked` 事件，用于处理设备的插拔和撤销。`ses.setDevicePermissionHandler` 可用于设置默认权限，`ses.setUSBProtectedClassesHandler` 则允许使用默认不可用的受保护 USB 类。

## **VI.10.3 WebHID API**

[WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API) 用于访问人机接口设备（HID），如键盘和游戏手柄。它的抽象层次高于 WebUSB 和 Web Bluetooth，低于 Gamepad API 以及指针、键盘等基本输入事件。

- **使用场景**：WebHID API 可访问各种 HID 设备，包括 Elgato StreamDeck 和 blink(1) 等。
- **安全与隐私**：与 WebUSB 和 Web Bluetooth 类似，设备访问必须由用户通过浏览器提供的选择器对话框授予。键盘、鼠标、安全密钥等产生受信任输入的设备属于受保护的 HID 类型，默认无法访问。
- **浏览器支持与成熟度**：WebHID API 同样是一项实验性技术，可用性有限。Chrome、Edge 和 Opera 的桌面版已支持，Chrome 自 89 版（2021 年 3 月）、Opera 自 75 版起默认启用；移动端、Firefox 和 Safari 不支持，需要准备替代路径。
- **Electron 环境**：在 Electron 中，WebHID API 提供了 `select-hid-device` 事件来选择 HID 设备，以及 `hid-device-added` 和 `hid-device-removed` 事件来处理设备插拔。`ses.setDevicePermissionHandler` 可用于提供默认权限，`ses.setPermissionCheckHandler` 则可用于禁用特定来源的 HID 访问。Electron 默认使用与 Chromium 相同的阻止列表（blocklist），可以通过 `disable-hid-blocklist` 命令行开关关闭。

Web Bluetooth、WebUSB 和 WebHID 能力很强，但大多仍处于**实验性阶段，浏览器支持有限**。在生产环境中采用前，应评估兼容范围、安全风险和对用户体验的影响，并为不支持的浏览器提供回退方案，或明确限定支持范围。

这些 API 都把**安全与用户授权**放在首位：普遍要求安全上下文（HTTPS），设备访问必须由用户手势触发。这样既能防止恶意网站未经授权访问硬件，也让用户清楚地掌控与硬件的交互。

**Electron 对设备集成的控制更灵活**。它在标准浏览器之外提供了额外的 API，可以更细粒度地处理设备选择和权限，例如自定义设备选择界面，某些情况下还能自动选择设备。需要深度设备集成的桌面应用可以考虑 Electron。

## **VI.10.4 Web Bluetooth 的授权与断开处理**

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
