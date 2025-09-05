# API Reference

Complete API documentation for IMZO Agnost library.

## Core API

The main API provides essential methods for E-IMZO integration:

### [EIMZOClient](/api/eimzo-client)

Main client class with all E-IMZO operations:

- Version checking
- API key management
- Certificate operations
- Digital signatures

### [Types](/api/types)

TypeScript type definitions:

- Interfaces and types
- Callback signatures
- Configuration options

### [Utilities](/api/utilities)

Helper functions and utilities:

- Date handling
- String operations
- Validation helpers

## Plugin APIs

IMZO Agnost uses a plugin architecture for different E-IMZO operations:

### Certificate Plugins

- **[PFX Plugin](/api/plugins/pfx)** - Software certificates
- **[FTJC Plugin](/api/plugins/ftjc)** - Hardware tokens

### Signature Plugins

- **[PKCS7 Plugin](/api/plugins/pkcs7)** - Digital signatures
- **[CryptoAuth Plugin](/api/plugins/cryptoauth)** - Authentication

### PKI Plugins

- **[X509 Plugin](/api/plugins/x509)** - Certificate management
- **[CRL Plugin](/api/plugins/crl)** - Revocation lists
- **[TSA Client Plugin](/api/plugins/tsa-client)** - Timestamping

## Quick Reference

### Common Methods

```typescript
// Check E-IMZO version
EIMZOClient.checkVersion(success, fail)

// Install API keys
EIMZOClient.installApiKeys(success, fail)

// List certificates
EIMZOClient.listAllUserKeys(idGen, uiGen, success, fail)

// Load certificate
EIMZOClient.loadKey(certInfo, success, fail, verifyPassword?)

// Create signature
EIMZOClient.createPkcs7(keyId, data, tsa, success, fail, detached?, base64?)
```

### Error Handling

All methods follow the same error handling pattern:

```typescript
method(
  // ... parameters
  successCallback,
  (error: unknown, reason: string | null) => {
    // Handle error
  }
);
```

## Examples

- [Basic Usage](/examples/basic-usage)
- [React Integration](/examples/react)
- [Vue.js Integration](/examples/vue)
- [Node.js Server](/examples/nodejs)
