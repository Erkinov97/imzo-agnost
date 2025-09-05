# E-IMZO Agnostic Library

A modern, type-safe, plugin-based TypeScript library for working with E-IMZO
cryptographic operations.

## 🚀 Features

- **Plugin-based Architecture**: Modular design with separate plugins for
  different functionality
- **TypeScript Support**: Full type safety and IntelliSense support
- **Dual API**: Both Promise-based and callback-based methods
- **Backward Compatibility**: Legacy client support for existing code
- **High Performance**: Optimized for speed and memory efficiency
- **Auto-completion**: Rich IDE support with comprehensive type definitions

## 📦 Installation

```bash
npm install imzo-agnost
# or
yarn add imzo-agnost
# or
pnpm add imzo-agnost
```

## 🎯 Quick Start

### Browser Global Objects (Legacy Support)

Kutubxonani import qilgandan keyin global obyektlar avtomatik ravishda window
obyektiga qo'shiladi:

```javascript
// Import qilish (avtomatik global setup)
import 'imzo-agnost';

// Keyin browserda global obyektlar ishlatish mumkin
console.log(CAPIWS); // ✅ Original CAPIWS object
console.log(EIMZOClient); // ✅ Original EIMZOClient object
console.log(capiws); // ✅ Lowercase alias
console.log(eimzoApi); // ✅ Modern API

// Legacy usuli (boshqalar qilganidek)
CAPIWS.version(
  (event, data) => console.log('Version:', data),
  error => console.error('Error:', error)
);

EIMZOClient.checkVersion(
  (major, minor) => console.log(`Version: ${major}.${minor}`),
  (error, reason) => console.error('Error:', error || reason)
);
```

### Modern Promise-based API

```typescript
import { eimzoApi, pfxPlugin, pkcs7Plugin } from 'imzo-agnost';

async function signDocument() {
  try {
    // Initialize and check version
    const version = await eimzoApi.initialize();
    console.log(`E-IMZO Version: ${version.major}.${version.minor}`);

    // Install API keys
    await eimzoApi.installApiKeys();

    // Get certificates
    const certificates = await pfxPlugin.listAllCertificatesAsync();

    if (certificates.certificates.length > 0) {
      const cert = certificates.certificates[0];

      // Load key
      const keyResult = await pfxPlugin.loadKeyAsync(
        cert.disk || '',
        cert.path || '',
        cert.name || '',
        cert.alias || ''
      );

      // Sign data
      const data = btoa('Hello, E-IMZO!');
      const pkcs7Result = await pkcs7Plugin.createPkcs7Async(
        data,
        keyResult.keyId,
        'no'
      );

      console.log('Signature created:', pkcs7Result.pkcs7_64);

      // Cleanup
      await pfxPlugin.unloadKeyAsync(keyResult.keyId);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Legacy Callback API

```typescript
import { pfxPlugin, pkcs7Plugin } from 'imzo-agnost';

pfxPlugin.listAllCertificates(
  (event, data) => {
    console.log('Certificates:', data);
    // Handle success
  },
  error => {
    console.error('Error:', error);
    // Handle error
  }
);
```

## 🏗️ Architecture

### Core Components

1. **Plugin Base**: Abstract base class for all plugins
2. **Plugin Manager**: Centralized plugin registration and access
3. **Type Definitions**: Comprehensive TypeScript types
4. **Unified API**: Single entry point for all operations

### Available Plugins

| Plugin            | Description                      | Status      |
| ----------------- | -------------------------------- | ----------- |
| **PFX**           | PFX key storage files            | ✅ Complete |
| **PKCS7**         | PKCS#7/CMS operations            | ✅ Complete |
| **FTJC**          | USB FT Javacard tokens           | ✅ Complete |
| **CryptoAuth**    | Low-level crypto operations      | ✅ Complete |
| **TruststoreJKS** | JKS trust store operations       | ✅ Complete |
| **Tunnel**        | Encrypted GOST-28147 connections | ✅ Complete |
| **CertKey**       | Electronic keys and certificates | ✅ Complete |
| **X509**          | X.509 certificate operations     | ✅ Complete |
| **Cipher**        | Document encryption/decryption   | ✅ Complete |
| **PKI**           | Public Key Infrastructure        | ✅ Complete |
| **PKCS10**        | Certificate request generation   | ✅ Complete |
| **IDCard**        | E-IMZO ID card operations        | ✅ Complete |
| **Truststore**    | Trust store management           | ✅ Complete |
| **CRL**           | Certificate Revocation Lists     | ✅ Complete |
| **FileIO**        | File input/output operations     | ✅ Complete |
| **TSAClient**     | Timestamp token operations       | ✅ Complete |
| **YTKS**          | YTKS key storage files           | ✅ Complete |

## 📖 API Reference

### EIMZOApi Class

```typescript
const api = new EIMZOApi();

// Core methods
await api.initialize();
await api.installApiKeys();
await api.isIdCardPluggedIn();

// Plugin access
api.pfx; // PFX operations
api.pkcs7; // PKCS#7 operations
api.ftjc; // FTJC token operations
api.cryptoauth; // Cryptographic operations
api.truststoreJks; // JKS trust store
api.tunnel; // Encrypted connections
api.certkey; // Key/certificate management
api.x509; // X.509 operations
api.cipher; // Encryption/decryption
api.pki; // PKI operations
api.pkcs10; // Certificate requests
api.idcard; // ID card operations
api.truststore; // Trust store management
api.crl; // CRL operations
api.fileio; // File operations
api.tsaclient; // Timestamp operations
api.ytks; // YTKS operations
await api.getVersion();

// Plugin access
const pfx = api.getPlugin('pfx');
const plugins = api.getAvailablePlugins();
const hasPfx = api.hasPlugin('pfx');
```

### PFX Plugin

```typescript
import { pfxPlugin } from 'imzo-agnost';

// Promise API
await pfxPlugin.listAllCertificatesAsync();
await pfxPlugin.loadKeyAsync(disk, path, name, alias);
await pfxPlugin.unloadKeyAsync(keyId);
await pfxPlugin.verifyPasswordAsync(keyId);

// Callback API
pfxPlugin.listAllCertificates(onSuccess, onError);
pfxPlugin.loadKey(disk, path, name, alias, onSuccess, onError);
```

### PKCS7 Plugin

```typescript
import { pkcs7Plugin } from 'imzo-agnost';

// 🚀 Enhanced API (Recommended)
// Avtomatik base64 encoding va smart defaults
await pkcs7Plugin.createPkcs7Async(
  'Hello, E-IMZO!', // Plain string - avtomatik base64 ga aylanadi
  keyId
  // Default: attached signature, auto base64 encoding
);

// Detached signature
await pkcs7Plugin.createPkcs7Async('Document content', keyId, {
  detached: true,
  autoBase64: true
});

// Allaqachon base64 data
await pkcs7Plugin.createPkcs7Async(base64Data, keyId, { autoBase64: false });

// 📛 Legacy API (Backward compatibility)
await pkcs7Plugin.createPkcs7LegacyAsync(btoa('data'), keyId, 'no');

// Callback API
pkcs7Plugin.createPkcs7Enhanced(
  'Plain text data',
  keyId,
  { detached: false },
  onSuccess,
  onError
);
```

### FTJC Plugin

```typescript
import { ftjcPlugin } from 'imzo-agnost';

// Promise API
await ftjcPlugin.listAllKeysAsync();
await ftjcPlugin.loadKeyAsync(cardUID);
await ftjcPlugin.verifyPinAsync(tokenId, pinType);

// Callback API
ftjcPlugin.listAllKeys(exceptCards, onSuccess, onError);
```

## 🔧 Creating Custom Plugins

```typescript
import { EIMZOPlugin, RegisterPlugin } from 'imzo-agnost';

@RegisterPlugin
export class MyCustomPlugin extends EIMZOPlugin {
  readonly name = 'my-custom-plugin';
  readonly description = 'My custom E-IMZO plugin';

  // Callback method
  myMethod = (
    param: string,
    onSuccess: CallbackFunction<MyResponse>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('my_method', [param], onSuccess, onError);
  };

  // Promise method
  myMethodAsync = this.createPromiseMethod<[string], MyResponse>('my_method');
}
```

## 🔄 Migration from Legacy Code

### Before (Legacy)

```javascript
CAPIWS.callFunction(
  {
    plugin: 'pfx',
    name: 'list_all_certificates'
  },
  function (event, data) {
    console.log(data);
  },
  function (error) {
    console.error(error);
  }
);
```

### After (Modern)

```typescript
// Promise style
const certificates = await pfxPlugin.listAllCertificatesAsync();
console.log(certificates);

// Or callback style (same as before)
pfxPlugin.listAllCertificates(
  (event, data) => console.log(data),
  error => console.error(error)
);
```

## 🎯 Best Practices

1. **Use Promise API**: Prefer `async/await` for cleaner code
2. **Handle Errors**: Always wrap operations in try-catch blocks
3. **Cleanup Resources**: Unload keys when done
4. **Type Safety**: Leverage TypeScript types for better development experience
5. **Plugin Access**: Use plugin instances for better performance

## 🔍 Error Handling

```typescript
try {
  const result = await pfxPlugin.loadKeyAsync(disk, path, name, alias);
  // Success
} catch (error) {
  if (error.message.includes('password')) {
    // Handle password error
  } else {
    // Handle other errors
  }
}
```

## 📋 Requirements

- E-IMZO installed on user's machine
- Modern browser with WebSocket support
- TypeScript 4.5+ (for development)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your plugin or improvement
4. Write tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

- Check the [documentation](./docs)
- Open an [issue](https://github.com/Erkinov97/imzo-agnost/issues)
- Contact support

---

Made with ❤️ for the E-IMZO community
