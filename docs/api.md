# API Reference

Complete API documentation for E-IMZO Agnostic Library.

## 📚 Core API

### eimzoApi

The main API interface for E-IMZO operations.

#### Connection & Setup

##### `installApiKeys(): Promise<boolean>`

Installs API keys required for E-IMZO communication.

```typescript
await eimzoApi.installApiKeys();
```

**Returns:** `Promise<boolean>` - Success status

**Throws:** `Error` if installation fails

---

##### `getVersion(): Promise<string>`

Gets the E-IMZO version information.

```typescript
const version = await eimzoApi.getVersion();
console.log('E-IMZO Version:', version); // "1.7.0"
```

**Returns:** `Promise<string>` - Version string

---

##### `checkConnection(): Promise<boolean>`

Checks if E-IMZO service is available.

```typescript
const isConnected = await eimzoApi.checkConnection();
if (!isConnected) {
  console.error('E-IMZO not available');
}
```

**Returns:** `Promise<boolean>` - Connection status

#### Utility Methods

##### `createHash(data: string, algorithm?: string): Promise<string>`

Creates a hash of the provided data.

```typescript
const hash = await eimzoApi.createHash('Hello World', 'SHA256');
```

**Parameters:**

- `data: string` - Data to hash
- `algorithm?: string` - Hash algorithm (default: 'SHA256')

**Returns:** `Promise<string>` - Base64-encoded hash

**Supported Algorithms:** SHA1, SHA256, SHA512

---

##### `getAvailablePlugins(): string[]`

Returns list of available plugins.

```typescript
const plugins = eimzoApi.getAvailablePlugins();
// ['pfx', 'pkcs7', 'ftjc', 'crl', 'x509', ...]
```

**Returns:** `string[]` - Plugin names

## 🔐 PFX Plugin

Certificate management operations.

### pfxPlugin

#### Certificate Operations

##### `listCertificates(): Promise<Certificate[]>`

Lists all available certificates.

```typescript
const certificates = await pfxPlugin.listCertificates();

certificates.forEach(cert => {
  console.log('Subject:', cert.subjectName);
  console.log('Serial:', cert.serialNumber);
  console.log('Valid:', cert.validFrom, '-', cert.validTo);
});
```

**Returns:** `Promise<Certificate[]>`

**Certificate Interface:**

```typescript
interface Certificate {
  serialNumber: string;
  subjectName: string;
  issuerName: string;
  validFrom: string;
  validTo: string;
  keyUsage: string;
  publicKey: string;
}
```

---

##### `loadKeyFromId(certId: string, password: string): Promise<boolean>`

Loads a certificate by ID with password.

```typescript
await pfxPlugin.loadKeyFromId('123456789', 'password123');
```

**Parameters:**

- `certId: string` - Certificate serial number
- `password: string` - Certificate password

**Returns:** `Promise<boolean>` - Success status

**Throws:** `Error` if certificate not found or password incorrect

---

##### `getCertificateInfo(certId: string): Promise<CertificateInfo>`

Gets detailed certificate information.

```typescript
const info = await pfxPlugin.getCertificateInfo('123456789');
console.log('Organization:', info.organization);
console.log('Email:', info.email);
```

**Returns:** `Promise<CertificateInfo>`

**CertificateInfo Interface:**

```typescript
interface CertificateInfo {
  serialNumber: string;
  subjectName: string;
  issuerName: string;
  validFrom: string;
  validTo: string;
  organization: string;
  commonName: string;
  email: string;
  keyUsage: string[];
  extendedKeyUsage: string[];
  publicKey: string;
  signAlgorithm: string;
}
```

---

##### `changePassword(certId: string, oldPassword: string, newPassword: string): Promise<boolean>`

Changes certificate password.

```typescript
await pfxPlugin.changePassword('123456789', 'oldPassword', 'newPassword');
```

**Parameters:**

- `certId: string` - Certificate ID
- `oldPassword: string` - Current password
- `newPassword: string` - New password

**Returns:** `Promise<boolean>` - Success status

## 📄 PKCS#7 Plugin

Digital signature operations.

### pkcs7Plugin

#### Signature Creation

##### `createPKCS7(data: string, certId: string, withData?: string): Promise<string>`

Creates a PKCS#7 digital signature.

```typescript
// Sign without including data
const signature = await pkcs7Plugin.createPKCS7(
  'Document content',
  '123456789',
  'no'
);

// Sign with data included
const signatureWithData = await pkcs7Plugin.createPKCS7(
  'Document content',
  '123456789',
  'yes'
);
```

**Parameters:**

- `data: string` - Data to sign
- `certId: string` - Certificate ID
- `withData?: string` - Include data in signature ('yes'/'no', default: 'no')

**Returns:** `Promise<string>` - Base64-encoded PKCS#7 signature

---

##### `createHashedPKCS7(hash: string, certId: string): Promise<string>`

Creates signature from pre-computed hash.

```typescript
const hash = await eimzoApi.createHash('Large document', 'SHA256');
const signature = await pkcs7Plugin.createHashedPKCS7(hash, '123456789');
```

**Parameters:**

- `hash: string` - Pre-computed hash
- `certId: string` - Certificate ID

**Returns:** `Promise<string>` - PKCS#7 signature

#### Signature Verification

##### `verifyPKCS7(signature: string, data?: string, cert?: string): Promise<boolean>`

Verifies a PKCS#7 signature.

```typescript
// Verify detached signature
const isValid = await pkcs7Plugin.verifyPKCS7(
  signature,
  'Original data',
  null // Certificate extracted from signature
);

// Verify attached signature
const isValidAttached = await pkcs7Plugin.verifyPKCS7(
  signatureWithData,
  null, // Data extracted from signature
  null
);
```

**Parameters:**

- `signature: string` - PKCS#7 signature to verify
- `data?: string` - Original data (for detached signatures)
- `cert?: string` - Certificate to verify against (optional)

**Returns:** `Promise<boolean>` - Verification result

---

##### `getSignatureInfo(signature: string): Promise<SignatureInfo>`

Extracts information from a PKCS#7 signature.

```typescript
const info = await pkcs7Plugin.getSignatureInfo(signature);
console.log('Signer:', info.signerName);
console.log('Signed at:', info.signTime);
```

**Returns:** `Promise<SignatureInfo>`

**SignatureInfo Interface:**

```typescript
interface SignatureInfo {
  signerName: string;
  signerCertificate: string;
  signTime: string;
  hashAlgorithm: string;
  signAlgorithm: string;
  isValid: boolean;
  data?: string; // If signature includes data
}
```

## 🎫 FTJC Plugin

Tax invoice operations for Uzbekistan.

### ftjcPlugin

#### Invoice Operations

##### `signInvoice(invoiceData: InvoiceData, certId: string): Promise<string>`

Signs a tax invoice according to Uzbek regulations.

```typescript
const invoiceData = {
  invoiceNumber: 'INV-001',
  date: '2024-01-15',
  sellerTin: '123456789',
  buyerTin: '987654321',
  items: [
    {
      name: 'Product 1',
      quantity: 2,
      price: 50000,
      amount: 100000
    }
  ],
  totalAmount: 100000,
  vatAmount: 12000
};

const signedInvoice = await ftjcPlugin.signInvoice(invoiceData, '123456789');
```

**Parameters:**

- `invoiceData: InvoiceData` - Invoice data structure
- `certId: string` - Certificate ID

**Returns:** `Promise<string>` - Signed invoice XML

---

##### `verifyInvoice(signedInvoice: string): Promise<InvoiceVerificationResult>`

Verifies a signed tax invoice.

```typescript
const result = await ftjcPlugin.verifyInvoice(signedInvoice);

if (result.isValid) {
  console.log('Invoice is valid');
  console.log('Seller:', result.sellerInfo.name);
} else {
  console.log('Verification errors:', result.errors);
}
```

**Returns:** `Promise<InvoiceVerificationResult>`

## 🔒 CRL Plugin

Certificate Revocation List operations.

### crlPlugin

##### `checkRevocation(certificate: string): Promise<RevocationStatus>`

Checks if a certificate is revoked.

```typescript
const status = await crlPlugin.checkRevocation(certificateBase64);

if (status.isRevoked) {
  console.log('Certificate revoked on:', status.revocationDate);
  console.log('Reason:', status.reason);
}
```

**Returns:** `Promise<RevocationStatus>`

**RevocationStatus Interface:**

```typescript
interface RevocationStatus {
  isRevoked: boolean;
  revocationDate?: string;
  reason?: string;
  crlUrl: string;
  lastUpdate: string;
  nextUpdate: string;
}
```

## 📜 X509 Plugin

X.509 certificate operations.

### x509Plugin

##### `parseCertificate(certificate: string): Promise<ParsedCertificate>`

Parses X.509 certificate details.

```typescript
const parsed = await x509Plugin.parseCertificate(certificateBase64);

console.log('Subject:', parsed.subject);
console.log('Issuer:', parsed.issuer);
console.log('Extensions:', parsed.extensions);
```

**Returns:** `Promise<ParsedCertificate>`

## 🔧 Error Handling

### Error Types

```typescript
// Standard E-IMZO errors
class EIMZOError extends Error {
  code: string;
  details?: any;
}

// Connection errors
class ConnectionError extends EIMZOError {
  code = 'CONNECTION_ERROR';
}

// Certificate errors
class CertificateError extends EIMZOError {
  code = 'CERTIFICATE_ERROR';
}

// Signature errors
class SignatureError extends EIMZOError {
  code = 'SIGNATURE_ERROR';
}
```

### Error Handling Pattern

```typescript
try {
  await eimzoApi.installApiKeys();
} catch (error) {
  if (error instanceof ConnectionError) {
    console.error('E-IMZO not available');
  } else if (error instanceof CertificateError) {
    console.error('Certificate issue:', error.details);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## 🔌 Plugin Development

### Creating Custom Plugins

```typescript
import { EIMZOPlugin } from 'imzo-agnost/core';

class CustomPlugin extends EIMZOPlugin {
  constructor() {
    super('custom-plugin');
  }

  async customMethod(param: string): Promise<string> {
    return this.callEimzoMethod('CUSTOM_METHOD', [param]);
  }
}

// Register plugin
const customPlugin = new CustomPlugin();
```

### Plugin Interface

```typescript
interface PluginInterface {
  name: string;
  version: string;
  initialize(): Promise<boolean>;
  cleanup(): Promise<void>;
  isAvailable(): Promise<boolean>;
}
```

## 📱 Platform Differences

### Browser vs Node.js

| Feature        | Browser      | Node.js       |
| -------------- | ------------ | ------------- |
| WebSocket      | ✅ Native    | ✅ ws library |
| File Access    | ❌ Limited   | ✅ Full       |
| HTTPS Required | ✅ Yes       | ❌ No         |
| CORS           | ⚠️ May apply | ❌ N/A        |

### Example: Platform-specific code

```typescript
// Detect environment
const isBrowser = typeof window !== 'undefined';
const isNode = typeof process !== 'undefined';

if (isBrowser) {
  // Browser-specific initialization
  console.log('Running in browser');
} else if (isNode) {
  // Node.js-specific initialization
  console.log('Running in Node.js');
}
```

---

## 📖 Type Definitions

See [types.md](./types.md) for complete TypeScript definitions.

## 🔗 Related Documentation

- [Installation Guide](./installation.md)
- [Quick Start](./quickstart.md)
- [Plugin Documentation](./plugins/)
- [Examples](./examples/)
- [Troubleshooting](./advanced/troubleshooting.md)
