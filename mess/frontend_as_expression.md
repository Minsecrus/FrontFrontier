# 第三类前端

普遍地，可以把前端分为 2 类。

其一为*工程*：需要规范和约定，考虑安全和性能等因素。

其二为*艺术品*：需要逸致和魄力。Awwwards 上的很多作品，艺术特质远大于工程特质。

可我觉得应该还有第三类前端：可能只需要一点火花，就可以写出功能少但完整的网站。可能为了实现一个需求，可能为了表达一点情感。写前端也可以像写随笔。

借助 AI 工具尤其是 CLI 工具，写这类前端很容易，可能只需要一天，甚至一小时。所以我更喜欢叫它“日抛型前端”或者“时抛型前端”。很多此类前端只部署在 GitHub Pages 上，没有前后端交互，不在浏览器内存储任何数据，未来也不会进行任何维护，不会新增任何功能。这时，一切软件工程的原则都**不存在**。（有些此类前端需要数据库，这时 Supabase 是很好的选择；记得配置 GitHub Secrets，别把 Key 明文写在代码里面）

但这类前端也是个完整的系统——**有输入有输出**。输入依靠各类 input，输出可以通过导出文件或者复制到剪贴板来实现。

由于高中校园占据了大量时间，使得我几乎没有精力搞工程或艺术品，所以目前我写的前端项目基本都是日抛型。下面几个是比较典型的：

- [HistoryAxis](https://minsecrus.github.io/HistoryAxis/)：中国历史时间轴
- [ZenResume](https://minsecrus.github.io/ZenResume-Generator/)：极简简历生成器
- [ProConSheet](https://minsecrus.github.io/ProConSheet/)：利弊分析法表格
- [CssTellation](https://minsecrus.github.io/CssTellation/)：CSS 星图
- [NameKura](https://minsecrus.github.io/NameKura/)：拾名
- [GeneGraph](https://minsecrus.github.io/GeneGraph/)：遗传棋盘格
- [CalliGrid](https://minsecrus.github.io/CalliGrid/)：书法格子生成器
