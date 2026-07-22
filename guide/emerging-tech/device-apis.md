---
title: "VI. 新兴技术和专业领域 / VI.10 设备集成：Web Bluetooth、Web USB、WebHID、Generic Sensor API"
---

# VI.10 设备集成：Web Bluetooth、Web USB、WebHID、Generic Sensor API

**目的**：允许 Web 应用程序直接与连接到用户计算机或移动设备的硬件设备交互。

- [**Generic Sensor API**](https://developer.mozilla.org/en-US/docs/Web/API/Generic_Sensor_API)：一套接口，以一致的方式将设备传感器（例如加速度计、陀螺仪、环境光传感器）暴露给 Web 平台。
- [**Web Bluetooth API**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)：连接并交互低功耗蓝牙 (BLE) 外围设备。
- [**Web USB API**](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API)：将非标准通用串行总线 (USB) 设备暴露给 Web，简化驱动程序安装。
- [**WebHID API**](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API)：连接人机接口设备 (HID)，例如游戏手柄、键盘和其他专用输入设备。
- **安全注意事项**：所有这些 API 通常都需要安全上下文 (HTTPS) 和明确的用户权限才能访问。

Web API 向直接设备集成的扩展，标志着 Web 与原生应用之间的界限正日益模糊。这让 Web 体验更丰富、更具交互性、更能感知上下文，得以利用物理硬件，为基于 Web 的工具和游戏开辟新的可能。

## **表格：Web 设备集成 API 比较**

| API 名称                                                                                      | 目的（设备类型）               | 关键功能（示例）                      | 安全要求（[HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限） | 浏览器支持（实验性/基线） |
| :-------------------------------------------------------------------------------------------- | :----------------------------- | :------------------------------------ | :------------------------------------------------------------------------------------- | :------------------------ |
| [**Generic Sensor API**](https://developer.mozilla.org/en-US/docs/Web/API/Generic_Sensor_API) | 设备传感器（加速度计、陀螺仪） | 读取传感器数据，事件监听              | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 基线                      |
| [**Web Bluetooth API**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)   | 低功耗蓝牙设备                 | 连接 BLE 设备，读写 GATT 特性         | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 实验性                    |
| [**Web USB API**](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API)                | 非标准 USB 设备                | 连接 USB 设备，读写数据，简化驱动安装 | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 实验性                    |
| [**WebHID API**](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API)                 | 人机接口设备（游戏手柄）       | 连接 HID 设备，发送/接收报告          | [HTTPS](https://developer.mozilla.org/en-US/docs/Web/HTTP/HTTPS)，用户权限             | 实验性                    |

该表格帮助学习者理解 Web 应用程序与物理硬件集成的能力与局限，并凸显这些强大 API 的安全隐患和实验性质。

## **VI.10.1 Web Bluetooth API**

[Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) 允许网站以安全、保护隐私的方式与蓝牙设备通信。

- **用例**：该 API 让 Web 应用程序能够与附近的低功耗蓝牙（BLE）设备（蓝牙 4.0 或更高版本）交互，例如心率监测器、智能灯泡、零售亭和玩具。
- **功能**：开发者可以请求蓝牙设备（`navigator.bluetooth.requestDevice`），连接到设备的通用属性配置文件（GATT）服务器，读写蓝牙特性，接收 GATT 通知，以及断开连接。它还支持读写蓝牙描述符，描述符提供有关特性值的附加信息。
- **安全与隐私**：Web Bluetooth API 要求在安全上下文（HTTPS）中运行。出于安全考虑，`requestDevice()` 方法必须由用户手势（例如点击）触发。该 API 在设计上限制了对某些难以安全实现的蓝牙功能的访问，以最大限度减少恶意网站可利用的设备攻击面。
- **浏览器支持与成熟度**：Web Bluetooth API 可用性有限，被视为实验性技术，并非所有主流浏览器都支持。例如，Chrome、Edge 和 Opera（桌面和 Android）提供部分支持，Firefox 和 Safari 则不支持。尽管如此，该标准正在成熟，工具集和 API 不断涌现，Chrome 53 已通过 Origin Trial（源试用）支持蓝牙功能。
- **Electron 环境**：在 Electron 中，开发者可以通过 webContents 上的 `select-bluetooth-device` 事件选择蓝牙设备，并通过 ses.`setDevicePermissionHandler` 提供默认权限，实现更灵活的设备管理。

## **VI.10.2 WebUSB API**

WebUSB API 提供了一种方式，将非标准通用串行总线（USB）兼容设备的服务暴露给 Web，使 USB 更安全、更易于使用。

- **用例**：该 API 主要用于访问非标准 USB 设备，如科学和工业设备，以及固件刷写（隐含提及）。值得注意的是，它不支持网络摄像头、HID 设备或大容量存储设备等常见设备。
- **安全与隐私**：与 Web Bluetooth 类似，WebUSB API 也仅在安全上下文（HTTPS）中运行。`requestDevice()` 方法同样必须由用户手势触发。权限策略（Permissions Policy）机制允许开发者选择性地启用或禁用 WebUSB 等浏览器功能和 API。然而，WebUSB 也带来潜在的安全隐患，例如网站可能利用它建立 ADB 连接并入侵所连接的 Android 手机。
- **浏览器支持与成熟度**：WebUSB API 可用性有限，同样被视为实验性技术。Chrome、Edge 和 Opera（桌面和 Android）从早期版本开始即提供全面支持，但 Firefox 和 Safari 仍不支持。该 API 自 Chrome 61 起已默认启用。
- **Electron 环境**：在 Electron 中，WebUSB API 提供了 `select-usb-device` 事件，以及 `usb-device-added`、`usb-device-removed` 和 `usb-device-revoked` 事件，用于处理设备的插拔和撤销。ses.`setDevicePermissionHandler` 可用于设置默认权限，ses.`setUSBProtectedClassesHandler` 则允许使用默认不可用的受保护 USB 类。

## **VI.10.3 WebHID API**

[WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API) 用于访问人机界面设备（HID），如键盘和游戏手柄。它比 WebUSB 和 Web Bluetooth API 更高级，但比 Gamepad API 和基本输入（指针/键盘）更低级。

- **用例**：WebHID API 可访问各种 HID 设备，包括 Elgato StreamDeck 和 blink(1) 等。
- **安全与隐私**：与 WebUSB 和 Web Bluetooth 类似，设备访问必须由用户通过浏览器提供的选择器对话框授予。值得注意的是，生成受信任输入（例如键盘、鼠标、安全密钥）的设备通常不可访问，因为它们在顶层 HID 集合中被视为受保护用途。
- **浏览器支持与成熟度**：WebHID API 同样是一项实验性技术，可用性有限。Chrome、Edge 和 Opera 的桌面版本从较新版本（例如 Chrome 89、Opera 75）开始提供全面支持；移动设备、Firefox 和 Safari 则需要准备替代路径。该 API 自 Chrome 89（2021 年 3 月）起已默认启用。
- **Electron 环境**：在 Electron 中，WebHID API 提供了 `select-hid-device` 事件来选择 HID 设备，以及 `hid-device-added` 和 `hid-device-removed` 事件来处理设备插拔。`ses.setDevicePermissionHandler` 可用于提供默认权限，`ses.setPermissionCheckHandler` 则可用于禁用特定来源的 HID 访问。Electron 默认使用与 Chromium 相同的黑名单，但可以通过 `disable-hid-blocklist` 标志覆盖。

这些设备集成 API（Web Bluetooth、WebUSB 和 WebHID）虽然功能强大，但目前大多处于**实验性阶段，且浏览器支持有限**。这意味着开发者在生产环境中采用这些 API 时需要谨慎权衡，充分考虑其生产就绪度、潜在的安全隐患以及对用户体验的影响。由于浏览器兼容性不一，开发者可能需要为不支持的浏览器提供回退方案，或限制应用范围。

所有这些 API 都强调**安全与用户授权的核心地位**。它们普遍要求在安全上下文（HTTPS）中运行，并强制通过用户手势才能访问设备。这种设计理念旨在最大程度地防止恶意网站未经授权访问用户硬件，并确保用户对涉及敏感硬件的交互拥有明确的控制权。这体现了 Web 平台在扩展能力的同时，对用户隐私和安全的高度重视。

值得一提的是，**Electron 环境为设备集成提供了增强的控制能力**。与标准浏览器环境相比，Electron 提供了额外的 API，允许开发者更细粒度地控制设备选择和权限处理。这意味着开发者可以构建自定义的用户界面来引导用户进行设备交互，某些情况下甚至可以自动选择设备，从而提供超越标准浏览器功能的更无缝或定制化的用户体验。这种灵活性使 Electron 成为开发需要深度设备集成的前端桌面应用的理想选择。
