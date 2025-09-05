# Installation Guide

This guide will help you install and set up E-IMZO Agnostic Library in your
project.

## 📦 Package Installation

### Using npm

```bash
npm install imzo-agnost
```

### Using Yarn

```bash
yarn add imzo-agnost
```

### Using pnpm (Recommended)

```bash
pnpm add imzo-agnost
```

## 🌐 Browser Setup

### ES Modules (Modern)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>E-IMZO Demo</title>
  </head>
  <body>
    <script type="module">
      import {
        eimzoApi,
        pfxPlugin
      } from './node_modules/imzo-agnost/dist/index.mjs';

      // Your code here
      console.log('E-IMZO Library loaded!');
    </script>
  </body>
</html>
```

### IIFE (Browser Global)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>E-IMZO Demo</title>
    <script src="./node_modules/imzo-agnost/dist/index.js"></script>
  </head>
  <body>
    <script>
      // Global objects available: CAPIWS, EIMZOClient, eimzoApi
      console.log('E-IMZO Library loaded!', window.eimzoApi);
    </script>
  </body>
</html>
```

### CDN Usage

```html
<!-- Latest version -->
<script src="https://unpkg.com/imzo-agnost@latest/dist/index.js"></script>

<!-- Specific version -->
<script src="https://unpkg.com/imzo-agnost@1.0.0/dist/index.js"></script>
```

## 🖥️ Node.js Setup

### CommonJS

```javascript
const { eimzoApi, pfxPlugin, pkcs7Plugin } = require('imzo-agnost');

async function main() {
  try {
    const version = await eimzoApi.getVersion();
    console.log('E-IMZO Version:', version);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

### ES Modules

```javascript
import { eimzoApi, pfxPlugin, pkcs7Plugin } from 'imzo-agnost';

async function main() {
  try {
    const version = await eimzoApi.getVersion();
    console.log('E-IMZO Version:', version);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## 🔧 Development Setup

### TypeScript Configuration

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  // ... other config
  resolve: {
    alias: {
      'imzo-agnost': 'imzo-agnost/dist/index.mjs'
    }
  }
};
```

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Vite handles ES modules automatically
  optimizeDeps: {
    include: ['imzo-agnost']
  }
});
```

## 🏗️ Build Tool Integration

### Rollup

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    })
  ]
};
```

### Parcel

```json
// package.json
{
  "source": "src/index.html",
  "scripts": {
    "start": "parcel",
    "build": "parcel build"
  }
}
```

## 🔍 Verification

Test your installation with this simple script:

```typescript
import { eimzoApi } from 'imzo-agnost';

async function testInstallation() {
  try {
    console.log('Testing E-IMZO installation...');

    // Test library loading
    console.log('✅ Library loaded successfully');

    // Test API availability
    const plugins = eimzoApi.getAvailablePlugins();
    console.log('✅ Available plugins:', plugins);

    // Test E-IMZO connection (requires E-IMZO to be installed)
    try {
      await eimzoApi.installApiKeys();
      console.log('✅ E-IMZO connection successful');
    } catch (error) {
      console.warn('⚠️ E-IMZO not available (install E-IMZO first)');
    }
  } catch (error) {
    console.error('❌ Installation test failed:', error);
  }
}

testInstallation();
```

## 🔧 Prerequisites

### E-IMZO Installation

Before using this library, users must have E-IMZO installed:

1. **Download E-IMZO**: Get the latest version from
   [e-imzo.uz](https://e-imzo.uz)
2. **Install E-IMZO**: Follow the official installation guide
3. **Verify Installation**: Ensure E-IMZO service is running

### Browser Requirements

- **Modern Browser**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **WebSocket Support**: Required for E-IMZO communication
- **HTTPS Context**: Required for secure cryptographic operations

### Node.js Requirements

- **Node.js**: Version 16.0.0 or higher
- **Operating System**: Windows, macOS, or Linux
- **Memory**: Minimum 256MB available RAM

## 🚨 Troubleshooting

### Common Issues

**Import Errors**

```bash
# If you see module resolution errors
npm install --save-dev @types/node

# For TypeScript projects
npm install --save-dev typescript
```

**Build Errors**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**E-IMZO Connection Issues**

- Ensure E-IMZO is installed and running
- Check Windows firewall settings
- Verify E-IMZO service is not blocked by antivirus

### Getting Help

If you encounter issues:

1. Check the [troubleshooting guide](./advanced/troubleshooting.md)
2. Search [existing issues](https://github.com/Erkinov97/imzo-agnost/issues)
3. Create a [new issue](https://github.com/Erkinov97/imzo-agnost/issues/new)
   with:
   - Your operating system
   - Node.js/browser version
   - Package manager and version
   - Complete error message
   - Minimal reproduction code

---

**Next Steps:** Continue to the [Quick Start Guide](./quickstart.md) to begin
using the library!
