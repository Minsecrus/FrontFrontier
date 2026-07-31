---
title: "VI. 新兴技术和专业领域 / VI.6 Web 音频和媒体流：实时音频/视频处理"
---

# VI.6 Web 音频和媒体流：实时音频/视频处理

**目的**：在浏览器中实现高级音频处理、实时通信和媒体捕获/录制。

- [**Web Audio API**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)：强大的音频控制系统，支持模块化路由、添加效果、创建可视化和空间效果。作为 `<audio>` 元素的补充，用于复杂处理。
- **Media Streams API (Media Capture and Streams API)**：支持流式传输音频和视频数据，可访问用户摄像头/麦克风 (getUserMedia())，也可操作媒体轨道。
- **Media Source Extensions (MSE)**：支持基于 Web 的无插件流媒体，可通过 JavaScript 为 `<audio>` 和 `<video>` 元素创建媒体流，并细粒度地控制获取。
- **[WebRTC](https://webrtc.org/) (Web Real-Time Communication)**：让 Web 应用能够捕获并流式传输音频/视频，在浏览器之间点对点地交换任意数据，无需中心服务器中转，从而助力电话会议和实时应用。

这些 API（Web Audio、Media Streams、WebRTC）是在浏览器中构建复杂实时多媒体应用（例如视频会议、在线数字音频工作站）的核心技术支撑，也标志着 Web 功能向静态内容之外的重大扩展，带来了更丰富的交互体验。

## **VI.6.1 麦克风预览的权限、生命周期与清理**

媒体能力需要在 HTTPS 和用户手势下启动，并为权限拒绝、设备变化和页面离开准备清理逻辑。

```js
export async function startMicrophonePreview(audioElement) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("当前浏览器不支持麦克风访问");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioElement.srcObject = stream;
  audioElement.autoplay = true;
  audioElement.muted = true;

  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  source.connect(analyser);

  return () => {
    stream.getTracks().forEach((track) => track.stop());
    source.disconnect();
    analyser.disconnect();
    void audioContext.close();
    audioElement.srcObject = null;
  };
}
```

调用方应在 `try/catch` 中区分权限拒绝、设备占用和浏览器能力缺失，并在组件卸载或用户停止录音时调用返回的清理函数。产品界面还应明确展示麦克风指示、录制状态和数据用途。
