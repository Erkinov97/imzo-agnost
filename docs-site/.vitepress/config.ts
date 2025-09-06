import { defineConfig } from 'vitepress';

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
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Migration Guide', link: '/guide/migration' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Architecture', link: '/guide/architecture' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Plugin System', link: '/guide/plugins-system' },
            { text: 'Session Management', link: '/guide/session-management' },
            { text: 'Certificate Management', link: '/guide/certificates' },
            { text: 'Digital Signatures', link: '/guide/digital-signatures' },
            { text: 'Error Handling', link: '/guide/error-handling' },
            { text: 'TypeScript Support', link: '/guide/typescript' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'Core API',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'EIMZOApi', link: '/api/eimzo-api' },
            { text: 'EIMZOClient (Legacy)', link: '/api/eimzo-client' },
            { text: 'Plugin Base', link: '/api/plugin-base' },
            { text: 'Session Manager', link: '/api/session-manager' },
            { text: 'Types', link: '/api/types' }
          ]
        },
        {
          text: 'Key Storage Plugins',
          items: [
            { text: 'PFX Plugin', link: '/api/plugins/pfx' },
            { text: 'FTJC Plugin', link: '/api/plugins/ftjc' },
            { text: 'YTKS Plugin', link: '/api/plugins/ytks' },
            { text: 'IDCard Plugin', link: '/api/plugins/idcard' }
          ]
        },
        {
          text: 'Cryptographic Plugins',
          items: [
            { text: 'PKCS7 Plugin', link: '/api/plugins/pkcs7' },
            { text: 'CryptoAuth Plugin', link: '/api/plugins/cryptoauth' },
            { text: 'Cipher Plugin', link: '/api/plugins/cipher' },
            { text: 'X509 Plugin', link: '/api/plugins/x509' },
            { text: 'PKCS10 Plugin', link: '/api/plugins/pkcs10' }
          ]
        },
        {
          text: 'Trust & Certificate Plugins',
          items: [
            { text: 'Truststore Plugin', link: '/api/plugins/truststore' },
            { text: 'Truststore JKS Plugin', link: '/api/plugins/truststore-jks' },
            { text: 'CRL Plugin', link: '/api/plugins/crl' },
            { text: 'CertKey Plugin', link: '/api/plugins/certkey' }
          ]
        },
        {
          text: 'Infrastructure Plugins',
          items: [
            { text: 'PKI Plugin', link: '/api/plugins/pki' },
            { text: 'TSAClient Plugin', link: '/api/plugins/tsaclient' },
            { text: 'Tunnel Plugin', link: '/api/plugins/tunnel' },
            { text: 'FileIO Plugin', link: '/api/plugins/fileio' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Framework Integration',
          items: [
            { text: 'Vue.js Examples', link: '/examples/vue' },
            { text: 'React Examples', link: '/examples/react' },
            { text: 'Angular Examples', link: '/examples/angular' },
            { text: 'Vanilla JavaScript', link: '/examples/vanilla' },
            { text: 'Node.js Server', link: '/examples/nodejs' }
          ]
        },
        {
          text: 'Use Cases',
          items: [
            { text: 'Basic Usage', link: '/examples/basic-usage' },
            { text: 'Document Signing', link: '/examples/document-signing' },
            { text: 'File Operations', link: '/examples/file-operations' },
            { text: 'Session Management', link: '/examples/session-management' },
            { text: 'Certificate Management', link: '/examples/certificate-management' },
            { text: 'Migration Examples', link: '/examples/migration' },
            { text: 'Advanced Examples', link: '/examples/advanced' }
          ]
        }
      ]
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/Erkinov97/imzo-agnost' }],

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
});
