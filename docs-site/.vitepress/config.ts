import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'IMZO Agnost',
  description: 'Modern TypeScript library for E-IMZO API with comprehensive plugin architecture',
  
  base: '/imzo-agnost/',
  ignoreDeadLinks: true,
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'GitHub', link: 'https://github.com/Erkinov97/imzo-agnost' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Architecture', link: '/guide/architecture' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Plugins System', link: '/guide/plugins-system' },
            { text: 'Certificate Management', link: '/guide/certificates' },
            { text: 'Digital Signatures', link: '/guide/digital-signatures' },
            { text: 'Error Handling', link: '/guide/error-handling' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'EIMZOClient', link: '/api/eimzo-client' },
            { text: 'Types', link: '/api/types' },
            { text: 'Utilities', link: '/api/utilities' }
          ]
        },
        {
          text: 'Plugins',
          items: [
            { text: 'PFX Plugin', link: '/api/plugins/pfx' },
            { text: 'PKCS7 Plugin', link: '/api/plugins/pkcs7' },
            { text: 'FTJC Plugin', link: '/api/plugins/ftjc' },
            { text: 'X509 Plugin', link: '/api/plugins/x509' },
            { text: 'CryptoAuth Plugin', link: '/api/plugins/cryptoauth' },
            { text: 'TSA Client Plugin', link: '/api/plugins/tsa-client' },
            { text: 'CRL Plugin', link: '/api/plugins/crl' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Usage', link: '/examples/basic-usage' },
            { text: 'React Integration', link: '/examples/react' },
            { text: 'Vue.js Integration', link: '/examples/vue' },
            { text: 'Node.js Server', link: '/examples/nodejs' },
            { text: 'Advanced Examples', link: '/examples/advanced' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Erkinov97/imzo-agnost' }
    ],

    footer: {
      message: 'Released under the ISC License.',
      copyright: 'Copyright © 2025 IMZO Agnost Contributors'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/Erkinov97/imzo-agnost/edit/main/docs-site/:path',
      text: 'Edit this page on GitHub'
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/imzo-agnost/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'IMZO Agnost' }],
    ['meta', { name: 'og:image', content: 'https://erkinov97.github.io/imzo-agnost/og-image.png' }]
  ]
})
