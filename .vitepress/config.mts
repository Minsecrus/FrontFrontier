import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Front Frontier",
  description: "Minsecrus 的前端知识分享站",
  base: '/FrontFrontier/',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '现代前端开发指南', link: '/guide/' },
      { text: '小巧思', link: '/tips/' },
      { text: '框架原理教学', link: '/principles/' },
      { text: '进阶专题', link: '/advanced/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '现代前端开发指南',
          items: [
            { text: '简介', link: '/guide/' },
            {
              text: '前言',
              collapsed: true,
              items: [
                { text: '引言', link: '/guide/02-0' },
                { text: '前端开发简介', link: '/guide/03-i' },
              ]
            },
            {
              text: '第一章 Web 概述',
              collapsed: true,
              items: [
                { text: 'Internet 互联网', link: '/guide/04-ii-web-ii-1-internet' },
                { text: 'HTML', link: '/guide/05-ii-web-ii-2-html' },
                { text: 'CSS', link: '/guide/06-ii-web-ii-3-css' },
                { text: 'CSS 进阶', link: '/guide/07-ii-web-ii-4-css' },
                { text: 'JavaScript', link: '/guide/08-ii-web-ii-5-javascript' },
                { text: 'TypeScript', link: '/guide/09-ii-web-ii-6-typescript-javascript' },
              ]
            },
            {
              text: '第二章 开发工具',
              collapsed: true,
              items: [
                { text: 'Git & GitHub', link: '/guide/10-iii-iii-1-git-github' },
                { text: 'Git 进阶', link: '/guide/11-iii-iii-2-git' },
                { text: '高级工程化工作流', link: '/guide/12-iii-iii-3' },
                { text: '包管理器', link: '/guide/13-iii-iii-4-npmyarn-pnpm' },
                { text: '构建工具和打包器', link: '/guide/14-iii-iii-5' },
                { text: 'Linter & Formatter', link: '/guide/15-iii-iii-6-linter-eslint-formatter-prettier' },
                { text: 'IDE 配置', link: '/guide/16-iii-iii-7-ide' },
                { text: 'AI 辅助开发', link: '/guide/17-iii-iii-8-ai' },
                { text: '浏览器开发者工具', link: '/guide/18-iii-iii-9' },
                { text: '设计协作实践', link: '/guide/19-iii-iii-10' },
              ]
            },
            {
              text: '第三章 UI 框架',
              collapsed: true,
              items: [
                { text: '框架概览', link: '/guide/20-iv-ui-iv-1-ui-reactvueangularsveltesolidjslit' },
                { text: 'Web Components', link: '/guide/21-iv-ui-iv-2-web-components' },
                { text: 'UI 组件库', link: '/guide/22-iv-ui-iv-3-ui' },
                { text: '元框架', link: '/guide/23-iv-ui-iv-4' },
                { text: 'HTMX', link: '/guide/24-iv-ui-iv-5-htmx' },
                { text: '状态管理', link: '/guide/25-iv-ui-iv-6' },
                { text: '数据获取', link: '/guide/26-iv-ui-iv-7-swrtanstack-queryaxiosfetch-api' },
                { text: '服务器状态与客户端状态', link: '/guide/27-iv-ui-iv-8' },
                { text: '现代后端集成模式', link: '/guide/28-iv-ui-iv-9' },
              ]
            },
            {
              text: '第四章 工程化',
              collapsed: true,
              items: [
                { text: '构建工具', link: '/guide/29-v-v-1' },
                { text: '性能监控', link: '/guide/30-v-v-2-performance-monitoring' },
                { text: '无障碍', link: '/guide/31-v-v-3-web-a11y' },
                { text: 'SEO', link: '/guide/32-v-v-4-seo' },
                { text: '安全基础', link: '/guide/33-v-v-5' },
                { text: '用户认证与授权', link: '/guide/34-v-v-6' },
                { text: 'Storybook', link: '/guide/35-v-v-7-storybook' },
                { text: '测试策略', link: '/guide/36-v-v-8' },
                { text: '国际化', link: '/guide/37-v-v-9-internationalization-i18n-localization-l10n' },
                { text: '错误处理和防御性编程', link: '/guide/38-v-v-10' },
                { text: 'UX 设计', link: '/guide/39-v-v-11-ux' },
                { text: '前端架构模式', link: '/guide/40-v-v-12' },
                { text: '移动端 Web 开发', link: '/guide/41-v-v-13-web' },
                { text: '微前端架构', link: '/guide/42-v-v-14' },
                { text: 'DevOps', link: '/guide/43-v-v-15-devops-for-Frontend' },
                { text: '法律、合规与隐私', link: '/guide/44-v-v-16' },
              ]
            },
            {
              text: '第五章 前沿技术',
              collapsed: true,
              items: [
                { text: 'PWA', link: '/guide/45-vi-vi-1-web-pwa-web' },
                { text: 'WebAssembly', link: '/guide/46-vi-vi-2-webassembly-wasm-web' },
                { text: '跨端开发', link: '/guide/47-vi-vi-3-react-native-capacitor-electron-tauri' },
                { text: 'Web 图形与数据可视化', link: '/guide/48-vi-vi-4-web' },
                { text: 'Web 音频和媒体流', link: '/guide/49-vi-vi-5-web' },
                { text: 'Web3', link: '/guide/50-vi-vi-6-web3' },
                { text: 'AI/ML', link: '/guide/51-vi-vi-7-ai-ml' },
                { text: 'Edge Functions', link: '/guide/52-vi-vi-8-cloudflare-workersvercel-edge-functionsdeno-deploy' },
                { text: '设备集成 API', link: '/guide/53-vi-vi-9-web-bluetoothweb-usbwebhidgeneric-sensor-api' },
              ]
            },
            {
              text: '附录',
              collapsed: true,
              items: [
                { text: '持续学习和职业发展', link: '/guide/54-vii' },
                { text: '结论', link: '/guide/55-viii' },
                { text: '学习资料汇总', link: '/guide/56-a' },
              ]
            },
          ]
        }
      ],
      '/tips/': [
        {
          text: '小巧思',
          items: [
            { text: '简介', link: '/tips/' },
          ]
        }
      ],
      '/principles/': [
        {
          text: '框架原理教学',
          items: [
            { text: '简介', link: '/principles/' },
          ]
        }
      ],
      '/advanced/': [
        {
          text: '进阶专题',
          items: [
            { text: '简介', link: '/advanced/' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/minsecrus' }
    ],

    footer: {
      message: '基于 CC BY-NC-SA 4.0 许可发布',
      copyright: 'Copyright © 2024-present Minsecrus'
    },

    outline: {
      level: [2, 3]
    },

    search: {
      provider: 'local'
    }
  }
})
