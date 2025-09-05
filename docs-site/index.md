# IMZO Agnost

Modern TypeScript library for E-IMZO API with comprehensive plugin architecture
supporting all E-IMZO operations.

## 🚀 Features

- **Full TypeScript Support** - Complete type safety and intellisense
- **Plugin Architecture** - Modular design for all E-IMZO operations
- **Modern API** - Promise-based with async/await support
- **Cross-Platform** - Works in browsers and Node.js
- **Comprehensive** - Supports PFX, PKCS7, FTJC, X509, CryptoAuth, TSA, CRL
- **Well Documented** - Full API documentation and examples
- **Production Ready** - Extensively tested and battle-proven

## 📦 Installation

::: code-group

```bash [pnpm]
pnpm add imzo-agnost
```

```bash [npm]
npm install imzo-agnost
```

```bash [yarn]
yarn add imzo-agnost
```

:::

## 🏃 Quick Start

```typescript
import EIMZOClient from 'imzo-agnost';

// Check E-IMZO version
EIMZOClient.checkVersion(
  (major, minor) => {
    console.log(`E-IMZO version: ${major}.${minor}`);
  },
  (error, reason) => {
    console.error('Failed to get version:', reason);
  }
);

// Install API keys
EIMZOClient.installApiKeys(
  () => {
    console.log('API keys installed successfully');
  },
  (error, reason) => {
    console.error('Failed to install API keys:', reason);
  }
);
```

## 🔧 Supported Operations

### Certificate Management

- **PFX certificates** - Load and manage PFX files
- **FTJC tokens** - Work with hardware tokens
- **Certificate listing** - Enumerate available certificates
- **Key loading** - Load cryptographic keys securely

### Digital Signatures

- **PKCS#7 signatures** - Create detached/attached signatures
- **Document signing** - Sign any type of document
- **Signature verification** - Verify digital signatures
- **Timestamp support** - TSA timestamping integration

### Advanced Features

- **X.509 operations** - Certificate management
- **CRL checking** - Certificate revocation lists
- **CryptoAuth** - Advanced authentication
- **PKI operations** - Public key infrastructure

## 🌟 Why IMZO Agnost?

- **Type Safe** - Full TypeScript support with strict typing
- **Modern** - Uses latest JavaScript features and best practices
- **Reliable** - Comprehensive error handling and validation
- **Flexible** - Plugin architecture for extensibility
- **Fast** - Optimized for performance
- **Maintained** - Active development and support

## 📚 Documentation

- [Getting Started](/guide/getting-started) - Start here for basic setup
- [Installation Guide](/guide/installation) - Detailed installation instructions
- [API Reference](/api/) - Complete API documentation
- [Examples](/examples/) - Practical usage examples
- [Architecture](/guide/architecture) - Understanding the library design

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/Erkinov97/imzo-agnost/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

[ISC License](https://github.com/Erkinov97/imzo-agnost/blob/main/LICENSE)

## 🔗 Links

- [GitHub Repository](https://github.com/Erkinov97/imzo-agnost)
- [npm Package](https://www.npmjs.com/package/imzo-agnost)
- [Issue Tracker](https://github.com/Erkinov97/imzo-agnost/issues)
