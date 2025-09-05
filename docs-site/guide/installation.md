# Installation

This guide covers installing IMZO Agnost in different environments and package
managers.

## Package Manager Installation

::: code-group

```bash [pnpm (Recommended)]
pnpm add imzo-agnost
```

```bash [npm]
npm install imzo-agnost
```

```bash [yarn]
yarn add imzo-agnost
```

```bash [bun]
bun add imzo-agnost
```

:::

## CDN Installation

For browser usage without a bundler:

::: code-group

```html [ES Modules]
<script type="module">
  import EIMZOClient from 'https://cdn.skypack.dev/imzo-agnost';
  // Your code here
</script>
```

```html [UMD]
<script src="https://unpkg.com/imzo-agnost/dist/index.umd.js"></script>
<script>
  // Available as window.IMZOAgnost
  const EIMZOClient = window.IMZOAgnost.default;
</script>
```

:::

## Environment Requirements

### Node.js Requirements

- **Node.js**: 20.0.0 or higher
- **TypeScript**: 5.0.0 or higher (if using TypeScript)
- **Package Manager**: pnpm 9.0.0+ (recommended)

Check your Node.js version:

```bash
node --version  # Should be 20.0.0+
```

### Browser Requirements

- **ES2022 support** (Chrome 94+, Firefox 93+, Safari 15+)
- **WebSocket support** for E-IMZO communication
- **Local E-IMZO installation** on the user's machine

### E-IMZO Requirements

IMZO Agnost requires E-IMZO to be installed and running:

1. **Download E-IMZO** from [official website](https://e-imzo.uz/)
2. **Install** following the official instructions
3. **Verify** E-IMZO is running (usually on port 64443)

## Development Setup

For development with full TypeScript support:

```bash
# Clone the repository
git clone https://github.com/Erkinov97/imzo-agnost.git
cd imzo-agnost

# Install dependencies
pnpm install

# Run development build
pnpm run dev
```

## Verification

Test your installation:

::: code-group

```typescript [TypeScript]
import EIMZOClient from 'imzo-agnost';

// Check if E-IMZO is available
EIMZOClient.checkVersion(
  (major, minor) => {
    console.log(`✅ E-IMZO ${major}.${minor} is available`);
  },
  (error, reason) => {
    console.error('❌ E-IMZO not available:', reason);
  }
);
```

```javascript [JavaScript]
const EIMZOClient = require('imzo-agnost');

// Check if E-IMZO is available
EIMZOClient.checkVersion(
  (major, minor) => {
    console.log(`✅ E-IMZO ${major}.${minor} is available`);
  },
  (error, reason) => {
    console.error('❌ E-IMZO not available:', reason);
  }
);
```

:::

## Troubleshooting

### Common Issues

#### Node.js Version Error

```
Error: Node.js 20.0.0 or higher is required
```

**Solution**: Update Node.js to version 20 or higher.

#### E-IMZO Not Found

```
Error: E-IMZO not available
```

**Solution**:

1. Install E-IMZO from the official website
2. Ensure E-IMZO service is running
3. Check firewall settings (port 64443)

#### Import Errors

```
Cannot find module 'imzo-agnost'
```

**Solutions**:

1. Verify installation: `npm list imzo-agnost`
2. Clear cache: `npm cache clean --force`
3. Reinstall: `npm uninstall imzo-agnost && npm install imzo-agnost`

### TypeScript Configuration

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Next Steps

- Continue to [Quick Start Guide](/guide/quick-start)
- Learn about [Configuration](/guide/configuration)
- Check out [Examples](/examples/)

## Support

If you encounter issues:

1. Check this troubleshooting section
2. Search [existing issues](https://github.com/Erkinov97/imzo-agnost/issues)
3. Create a [new issue](https://github.com/Erkinov97/imzo-agnost/issues/new)
   with details
