# Plugin Documentation

E-IMZO Agnostic Library uses a plugin-based architecture that provides
specialized functionality for different cryptographic operations. Each plugin
encapsulates specific E-IMZO features and provides a clean, consistent API.

## 🧩 Available Plugins

| Plugin                       | Description               | Primary Use Case                          |
| ---------------------------- | ------------------------- | ----------------------------------------- |
| [PFX](./pfx.md)              | Certificate management    | Loading and managing digital certificates |
| [PKCS#7](./pkcs7.md)         | Digital signatures        | Creating and verifying digital signatures |
| [FTJC](./ftjc.md)            | Tax invoices              | Uzbekistan tax invoice signing            |
| [CRL](./crl.md)              | Certificate revocation    | Checking certificate validity             |
| [X509](./x509.md)            | Certificate parsing       | Analyzing certificate details             |
| [Cipher](./cipher.md)        | Encryption/Decryption     | Data encryption operations                |
| [TSA Client](./tsaclient.md) | Timestamping              | Adding trusted timestamps                 |
| [PKI](./pki.md)              | Public key infrastructure | PKI operations                            |
| [YTKS](./ytks.md)            | Mobile certificates       | Mobile certificate management             |

## 🏗️ Plugin Architecture

### Plugin Base Class

All plugins extend the base `EIMZOPlugin` class:

```typescript
import { EIMZOPlugin } from 'imzo-agnost/core';

class MyPlugin extends EIMZOPlugin {
  constructor() {
    super('my-plugin');
  }

  async myMethod(param: string): Promise<string> {
    return this.callEimzoMethod('MY_METHOD', [param]);
  }
}
```

### Plugin Lifecycle

```typescript
// 1. Plugin registration (automatic)
import { myPlugin } from 'imzo-agnost';

// 2. Plugin initialization (lazy)
const result = await myPlugin.someMethod();

// 3. Plugin cleanup (automatic on process exit)
```

## 🔌 Using Plugins

### Import Specific Plugins

```typescript
// Import only what you need
import { pfxPlugin, pkcs7Plugin } from 'imzo-agnost';

// Use the plugins
const certificates = await pfxPlugin.listCertificates();
const signature = await pkcs7Plugin.createPKCS7('data', 'certId');
```

### Plugin Availability Check

```typescript
import { eimzoApi } from 'imzo-agnost';

// Check which plugins are available
const availablePlugins = eimzoApi.getAvailablePlugins();
console.log('Available plugins:', availablePlugins);

// Check specific plugin
if (availablePlugins.includes('ftjc')) {
  console.log('FTJC plugin is available');
}
```

## 📝 Quick Reference

### Certificate Management (PFX)

```typescript
import { pfxPlugin } from 'imzo-agnost';

// List certificates
const certs = await pfxPlugin.listCertificates();

// Load certificate
await pfxPlugin.loadKeyFromId(certId, password);

// Get certificate info
const info = await pfxPlugin.getCertificateInfo(certId);
```

### Digital Signatures (PKCS#7)

```typescript
import { pkcs7Plugin } from 'imzo-agnost';

// Create signature
const signature = await pkcs7Plugin.createPKCS7(data, certId, 'no');

// Verify signature
const isValid = await pkcs7Plugin.verifyPKCS7(signature, data);

// Get signature info
const info = await pkcs7Plugin.getSignatureInfo(signature);
```

### Tax Invoices (FTJC)

```typescript
import { ftjcPlugin } from 'imzo-agnost';

// Sign invoice
const signed = await ftjcPlugin.signInvoice(invoiceData, certId);

// Verify invoice
const result = await ftjcPlugin.verifyInvoice(signedInvoice);
```

### Certificate Revocation (CRL)

```typescript
import { crlPlugin } from 'imzo-agnost';

// Check if certificate is revoked
const status = await crlPlugin.checkRevocation(certificate);
console.log('Is revoked:', status.isRevoked);
```

## 🛠️ Plugin Development

### Creating a Custom Plugin

```typescript
import { EIMZOPlugin } from 'imzo-agnost/core';

export class CustomPlugin extends EIMZOPlugin {
  constructor() {
    super('custom');
  }

  /**
   * Custom method implementation
   */
  async customOperation(data: string): Promise<string> {
    try {
      // Call E-IMZO method
      const result = await this.callEimzoMethod('CUSTOM_OP', [data]);
      return result;
    } catch (error) {
      throw new Error(`Custom operation failed: ${error.message}`);
    }
  }

  /**
   * Check if plugin is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.callEimzoMethod('CUSTOM_CHECK');
      return true;
    } catch {
      return false;
    }
  }
}

// Export instance
export const customPlugin = new CustomPlugin();
```

### Plugin Registration

```typescript
// Register custom plugin
import { PluginManager } from 'imzo-agnost/core';
import { customPlugin } from './custom-plugin';

PluginManager.registerPlugin(customPlugin);
```

### Plugin Testing

```typescript
// Test plugin availability
async function testPlugin() {
  const available = await customPlugin.isAvailable();

  if (available) {
    console.log('Custom plugin is available');

    try {
      const result = await customPlugin.customOperation('test');
      console.log('Plugin test successful:', result);
    } catch (error) {
      console.error('Plugin test failed:', error);
    }
  } else {
    console.log('Custom plugin not available');
  }
}
```

## 🔄 Plugin Chaining

Some operations can be chained across plugins:

```typescript
import { pfxPlugin, pkcs7Plugin, crlPlugin } from 'imzo-agnost';

async function completeSigningWorkflow(
  data: string,
  certId: string,
  password: string
) {
  // 1. Load certificate
  await pfxPlugin.loadKeyFromId(certId, password);

  // 2. Check if certificate is revoked
  const certInfo = await pfxPlugin.getCertificateInfo(certId);
  const revocationStatus = await crlPlugin.checkRevocation(certInfo.publicKey);

  if (revocationStatus.isRevoked) {
    throw new Error('Certificate is revoked');
  }

  // 3. Create signature
  const signature = await pkcs7Plugin.createPKCS7(data, certId, 'no');

  // 4. Verify signature
  const isValid = await pkcs7Plugin.verifyPKCS7(signature, data);

  return {
    signature,
    isValid,
    certificateInfo: certInfo
  };
}
```

## ⚠️ Plugin Limitations

### E-IMZO Dependency

- All plugins require E-IMZO to be installed and running
- Plugin availability depends on E-IMZO version
- Some plugins may not be available on all platforms

### Version Compatibility

```typescript
// Check E-IMZO version for plugin compatibility
import { eimzoApi } from 'imzo-agnost';

const version = await eimzoApi.getVersion();
const [major, minor] = version.split('.').map(Number);

if (major >= 1 && minor >= 7) {
  console.log('Modern plugins available');
} else {
  console.log('Limited plugin support');
}
```

### Error Handling

```typescript
import { pfxPlugin } from 'imzo-agnost';

try {
  await pfxPlugin.loadKeyFromId(certId, password);
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('Certificate not found');
  } else if (error.message.includes('password')) {
    console.error('Invalid password');
  } else {
    console.error('Plugin error:', error.message);
  }
}
```

## 📚 Individual Plugin Documentation

For detailed documentation on each plugin:

- **[PFX Plugin](./pfx.md)** - Certificate management operations
- **[PKCS#7 Plugin](./pkcs7.md)** - Digital signature operations
- **[FTJC Plugin](./ftjc.md)** - Tax invoice signing for Uzbekistan
- **[CRL Plugin](./crl.md)** - Certificate revocation checking
- **[X509 Plugin](./x509.md)** - Certificate parsing and analysis
- **[Cipher Plugin](./cipher.md)** - Encryption and decryption
- **[TSA Client Plugin](./tsaclient.md)** - Trusted timestamping
- **[PKI Plugin](./pki.md)** - Public key infrastructure operations
- **[YTKS Plugin](./ytks.md)** - Mobile certificate management

## 🔗 Related Documentation

- [API Reference](../api.md) - Complete API documentation
- [Examples](../examples/) - Real-world usage examples
- [Architecture](../advanced/architecture.md) - System architecture details
- [Custom Plugin Development](../advanced/custom-plugins.md) - Advanced plugin
  development
