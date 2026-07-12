import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Front Frontier",
  lang: "zh-CN",
  description: "Minsecrus 的前端知识分享站",
  base: "/FrontFrontier/",
  cleanUrls: true,
  metaChunk: true,
  lastUpdated: true,
  themeConfig: {
    nav: [],

    sidebar: {
      "/guide/": [
        {
          text: "现代前端开发指南",
          items: [
            { text: "简介", link: "/guide/" },
            { text: "引言", link: "/guide/preface" },
            {
              text: "第一章 前端开发简介",
              collapsed: true,
              items: [{ text: "前端开发简介", link: "/guide/intro" }],
            },
            {
              text: "第二章 基础 Web 技术",
              collapsed: true,
              items: [
                {
                  text: "Internet 互联网",
                  link: "/guide/web-basics/internet",
                },
                { text: "HTML", link: "/guide/web-basics/html" },
                { text: "CSS", link: "/guide/web-basics/css-basics" },
                { text: "CSS 进阶", link: "/guide/web-basics/css-architecture" },
                {
                  text: "JavaScript",
                  link: "/guide/web-basics/javascript",
                },
                {
                  text: "TypeScript",
                  link: "/guide/web-basics/typescript",
                },
              ],
            },
            {
              text: "第三章 基本开发环境和工具",
              collapsed: true,
              items: [
                {
                  text: "Git & GitHub",
                  link: "/guide/tooling/git-github",
                },
                { text: "Git 进阶", link: "/guide/tooling/git-workflows" },
                {
                  text: "高级工程化工作流",
                  link: "/guide/tooling/engineering-workflows",
                },
                { text: "包管理器", link: "/guide/tooling/package-managers" },
                { text: "现代构建工具", link: "/guide/tooling/build-tools" },
                {
                  text: "Linter & Formatter",
                  link: "/guide/tooling/lint-format",
                },
                { text: "IDE 配置", link: "/guide/tooling/ide" },
                { text: "AI 协作能力", link: "/guide/tooling/ai-tools" },
                { text: "浏览器开发者工具", link: "/guide/tooling/devtools" },
                {
                  text: "设计协作能力",
                  link: "/guide/tooling/design-collaboration",
                },
              ],
            },
            {
              text: "第四章 前端框架和库",
              collapsed: true,
              items: [
                {
                  text: "框架概览",
                  link: "/guide/frameworks/framework-overview",
                },
                {
                  text: "Web Components",
                  link: "/guide/frameworks/web-components",
                },
                { text: "UI 组件库", link: "/guide/frameworks/ui-libraries" },
                {
                  text: "无头组件与组件代码所有权",
                  link: "/guide/frameworks/headless-ui",
                },
                {
                  text: "数据可视化组件库",
                  link: "/guide/frameworks/data-visualization-libraries",
                },
                { text: "元框架", link: "/guide/frameworks/meta-frameworks" },
                { text: "HTMX", link: "/guide/frameworks/htmx" },
                { text: "状态管理", link: "/guide/frameworks/state-management" },
                {
                  text: "数据获取",
                  link: "/guide/frameworks/data-fetching",
                },
                {
                  text: "服务器状态与客户端状态",
                  link: "/guide/frameworks/server-client-state",
                },
                {
                  text: "现代后端集成模式",
                  link: "/guide/frameworks/backend-integration",
                },
              ],
            },
            {
              text: "第五章 高级主题和专业开发最佳实践",
              collapsed: true,
              items: [
                { text: "性能优化", link: "/guide/advanced-practices/performance" },
                {
                  text: "性能监控",
                  link: "/guide/advanced-practices/performance-monitoring",
                },
                { text: "无障碍", link: "/guide/advanced-practices/accessibility" },
                { text: "SEO", link: "/guide/advanced-practices/seo" },
                { text: "安全基础", link: "/guide/advanced-practices/security-basics" },
                { text: "用户认证与授权", link: "/guide/advanced-practices/auth" },
                { text: "Storybook", link: "/guide/advanced-practices/storybook" },
                { text: "测试策略", link: "/guide/advanced-practices/testing" },
                {
                  text: "国际化",
                  link: "/guide/advanced-practices/internationalization",
                },
                {
                  text: "错误处理和防御性编程",
                  link: "/guide/advanced-practices/error-handling",
                },
                { text: "UX 设计", link: "/guide/advanced-practices/ux" },
                {
                  text: "前端架构模式",
                  link: "/guide/advanced-practices/frontend-architecture",
                },
                { text: "移动端 Web 开发", link: "/guide/advanced-practices/mobile-web" },
                { text: "微前端架构", link: "/guide/advanced-practices/micro-frontends" },
                {
                  text: "DevOps",
                  link: "/guide/advanced-practices/devops",
                },
                {
                  text: "法律、合规与隐私",
                  link: "/guide/advanced-practices/compliance-privacy",
                },
              ],
            },
            {
              text: "第六章 新兴技术和专业领域",
              collapsed: true,
              items: [
                { text: "PWA", link: "/guide/emerging-tech/pwa" },
                {
                  text: "WebAssembly",
                  link: "/guide/emerging-tech/webassembly",
                },
                {
                  text: "跨端开发",
                  link: "/guide/emerging-tech/cross-platform",
                },
                { text: "Web 图形与沉浸式体验", link: "/guide/emerging-tech/web-graphics" },
                {
                  text: "Web 数据可视化",
                  link: "/guide/emerging-tech/data-visualization",
                },
                { text: "Web 音频和媒体流", link: "/guide/emerging-tech/web-audio-media" },
                { text: "Web3", link: "/guide/emerging-tech/web3" },
                { text: "AI/ML", link: "/guide/emerging-tech/ai-ml" },
                {
                  text: "Edge Runtime 与边缘平台",
                  link: "/guide/emerging-tech/edge-runtime",
                },
                {
                  text: "设备集成 API",
                  link: "/guide/emerging-tech/device-apis",
                },
              ],
            },
            {
              text: "第七章 持续学习和职业发展",
              collapsed: true,
              items: [{ text: "持续学习和职业发展", link: "/guide/career" }],
            },
            {
              text: "第八章 结语",
              collapsed: true,
              items: [{ text: "结语", link: "/guide/conclusion" }],
            },
            {
              text: "附录",
              collapsed: true,
              items: [{ text: "学习资料汇总", link: "/guide/resources" }],
            },
          ],
        },
      ],
      "/tips/": [
        {
          text: "小巧思",
          items: [{ text: "简介", link: "/tips/" }],
        },
      ],
      "/principles/": [
        {
          text: "框架原理教学",
          items: [
            { text: "简介", link: "/principles/" },
            {
              text: "Mini Vue：从响应式到模板编译",
              link: "/principles/mini-vue",
            },
          ],
        },
      ],
      "/advanced/": [
        {
          text: "进阶专题",
          items: [{ text: "简介", link: "/advanced/" }],
        },
      ],
      "/mess/": [
        {
          text: "杂谈",
          items: [
            { text: "总览", link: "/mess/" },
            {
              text: "字体后缀里的 Sans、Serif、Mono",
              link: "/mess/font_suffixes.md",
            },
            {
              text: "网页的三段式",
              link: "/mess/web_three_part.md",
            },
            {
              text: "第三类前端",
              link: "/mess/frontend_as_expression.md",
            },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/minsecrus" }],

    footer: {
      message: "基于 CC BY-NC-SA 4.0 许可发布",
      copyright: "Copyright © 2024-present Minsecrus",
    },

    outline: {
      level: [2, 3],
    },

    search: {
      provider: "local",
    },
  },
});
