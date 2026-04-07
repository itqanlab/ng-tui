import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'ng-tui',
  description: 'Angular-syntax Terminal UI Framework',
  base: '/ng-tui/',

  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/ng-tui/logo.svg' }]],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API', link: '/api/core' },
      { text: 'Examples', link: '/examples/counter' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ],
        },
        {
          text: 'Essentials',
          items: [
            { text: 'Components', link: '/guide/components' },
            { text: 'Template Syntax', link: '/guide/templates' },
            { text: 'Signals & Reactivity', link: '/guide/signals' },
            { text: 'Dependency Injection', link: '/guide/dependency-injection' },
            { text: 'Lifecycle Hooks', link: '/guide/lifecycle-hooks' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Directives & Pipes', link: '/guide/directives-pipes' },
            { text: 'Widgets & Layout', link: '/guide/widgets' },
            { text: 'Screen Navigation', link: '/guide/navigation' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: '@ng-tui/core', link: '/api/core' },
            { text: '@ng-tui/common', link: '/api/common' },
            { text: '@ng-tui/compiler', link: '/api/compiler' },
            { text: '@ng-tui/platform-terminal', link: '/api/platform-terminal' },
            { text: '@ng-tui/cli', link: '/api/cli' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Counter', link: '/examples/counter' },
            { text: 'Todo List', link: '/examples/todo-list' },
            { text: 'Dashboard', link: '/examples/dashboard' },
            { text: 'AI Chat', link: '/examples/ai-chat' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/itqanlab/ng-tui' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2025-present ng-tui contributors',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/itqanlab/ng-tui/edit/main/apps/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
});
