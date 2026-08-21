---
title: "VI. 新兴技术和专业领域 / VI.6 Web 音频和媒体流：实时音频/视频处理"
---

# VI.6 Web 音频和媒体流：实时音频/视频处理

**目的**：在浏览器中实现高级音频处理、实时通信、底层音视频编解码和媒体捕获/录制。

- [**Web Audio API**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)：强大的音频控制系统，支持模块化路由、添加效果、创建可视化和空间效果。作为 `<audio>` 元素的补充，用于复杂处理。在独立线程处理自定义信号处理（DSP）时，现代规范引入了 **[AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)** 替代主线程脚本。
- **[Media Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API)**：支持流式传输音频和视频数据，可访问用户摄像头/麦克风（`getUserMedia()`）或屏幕共享（`getDisplayMedia()`），并配合 **[MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)** 在客户端录制音视频。
- **[WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)**：提供对浏览器底层硬件加速编解码器（VideoEncoder/Decoder, AudioEncoder/Decoder）的直接访问，暴露原始 `VideoFrame` 与 `AudioData`，为 Web 端视频剪辑与低延迟推流奠定基础。
- **Media Source Extensions (MSE)**：支持基于 Web 的无插件流媒体，可通过 JavaScript 为 `<audio>` 和 `<video>` 元素创建媒体流，并细粒度地控制获取。
- **[WebRTC](https://webrtc.org/) 与 [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)**：WebRTC 支持浏览器间点对点实时音视频流与 DataChannel 数据交换；WebTransport 则基于 HTTP/3 QUIC 协议提供双向低延迟多路复用传输。

这些多媒体 API 是在浏览器中构建复杂实时应用（例如视频会议、在线数字音频工作站、网页视频编辑器、云游戏）的核心技术支撑，标志着 Web 功能向静态内容之外的重大扩展。

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

## **表格：现代 Web 媒体技术体系与选型指南**

| 技术方案 | 核心层级与机制 | 运行环境 / 线程 | 理想用例 | 注意事项与局限 |
| :--- | :--- | :--- | :--- | :--- |
| [**Web Audio API**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | 基于节点图（Node Graph）的音频混合、过滤与频谱可视化 | 主线程调度 + 音频渲染线程执行 | 网页游戏音效、音乐播放器可视化、简单混音器 | 需由明确的用户手势（如点击）激活 `AudioContext` 以绕过自动播放策略限制 |
| [**AudioWorklet**](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet) | 独立线程执行自定义 PCM/DSP 算法 | 专属音频 Worklet 线程 | 在线数字音频工作站（DAW）、吉他效果器、自定义音频合成器 | 无法直接访问主线程 DOM，必须通过 `MessagePort` 异步传递参数 |
| [**MediaRecorder**](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) | 高层级媒体流录制器，自动封装为容器格式 | 浏览器内部编码线程 | 屏幕录制工具、麦克风语音留言、简单视频片段导出 | 导出的视频可能缺乏完整的 Duration 关键帧索引，需服务端或工具库进行容器修复 |
| [**WebCodecs API**](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API) | 底层零拷贝音视频硬编/硬解，暴露原始 `VideoFrame` | 主线程或 Dedicated Worker 线程 | 在线视频剪辑编辑器、低延迟云桌面推流、结合 WebGPU 的实时特效渲染 | 属于底层原语，不包含容器解封装（Demuxing）与音画同步逻辑，需配合 MP4Box 等解复用库使用 |
| [**WebRTC**](https://webrtc.org/) | P2P 实时流媒体通信与数据通道 | 浏览器专用网络与媒体管道 | 视频会议系统（如 Zoom 网页版）、P2P 文件传输、协同白板 | NAT 穿透需要部署 STUN/TURN 服务器基础设施，网状连接在多人场景下需 SFU/MCU 服务端支持 |

::: details 启发式示例：屏幕捕获与 MediaRecorder 分片录制

下面的示例演示了如何通过现代 Web API 请求屏幕共享、捕获音视频流、使用 `MediaRecorder` 进行内存分片录制，并安全管理资源释放与生命周期：

```ts
export async function recordScreenStream(
  durationMs: number,
  onChunkReady: (blob: Blob) => void
): Promise<Blob> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("当前浏览器不支持屏幕捕获 (getDisplayMedia)");
  }

  // 1. 请求屏幕与系统音频捕获
  const mediaStream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 30, max: 60 } },
    audio: true,
  });

  const chunks: Blob[] = [];
  const mimeType = MediaRecorder.isTypeSupported("video/webm; codecs=vp9,opus")
    ? "video/webm; codecs=vp9,opus"
    : "video/webm";

  const recorder = new MediaRecorder(mediaStream, {
    mimeType,
    videoBitsPerSecond: 2_500_000, // 2.5 Mbps 码率控制
  });

  return new Promise<Blob>((resolve, reject) => {
    // 2. 收集每个时间片的二进制数据
    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
        onChunkReady(event.data);
      }
    };

    // 3. 用户手动停止共享或录制结束时的清理逻辑
    const cleanUp = () => {
      mediaStream.getTracks().forEach((track) => track.stop());
    };

    recorder.onstop = () => {
      cleanUp();
      const completeBlob = new Blob(chunks, { type: mimeType });
      resolve(completeBlob);
    };

    recorder.onerror = (event: Event) => {
      cleanUp();
      reject(new Error("录制过程发生异常"));
    };

    // 监听用户点击浏览器原生的“停止共享”浮条
    mediaStream.getVideoTracks()[0].addEventListener("ended", () => {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    });

    // 4. 每隔 1 秒触发一次 ondataavailable，便于流式处理
    recorder.start(1000);

    // 达到预设时长自动停止
    setTimeout(() => {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    }, durationMs);
  });
}
```

该示例展示了媒体捕获与录制的工程标准实践：类型嗅探优先、码率控制、分片流式回调、原生“停止共享”事件联动，以及通过 `track.stop()` 彻底关闭硬件占用的生命周期清理。

:::
