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
      { text: 'Examples', link: '/examples/ai-chat' },
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
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: '@ng-tui/core', link: '/api/core' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [{ text: 'AI Chat', link: '/examples/ai-chat' }],
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
