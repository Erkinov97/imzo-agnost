# Quick Start

Get up and running with IMZO Agnost in under 5 minutes!

## Step 1: Install the Library

First, install IMZO Agnost using your preferred package manager:

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

## Step 2: Import the Library

::: code-group

```typescript [TypeScript]
import EIMZOClient from 'imzo-agnost';
```

```javascript [CommonJS]
const EIMZOClient = require('imzo-agnost');
```

```javascript [Browser]
import EIMZOClient from 'https://cdn.skypack.dev/imzo-agnost';
```

:::

## Step 3: Check E-IMZO Connection

Before using the library, verify that E-IMZO is installed and running:

```typescript
EIMZOClient.checkVersion(
  (major, minor) => {
    console.log(`✅ E-IMZO ${major}.${minor} is available`);
    // Continue with your application
  },
  (error, reason) => {
    console.error('❌ E-IMZO error:', reason);
    // Show user-friendly error message
  }
);
```

## Step 4: Install API Keys

E-IMZO requires API keys to be installed before use:

```typescript
EIMZOClient.installApiKeys(
  () => {
    console.log('✅ API keys installed successfully');
    // Now you can list certificates and perform operations
  },
  (error, reason) => {
    console.error('❌ API key installation failed:', reason);
  }
);
```

## Step 5: List Available Certificates

Get all available certificates (PFX files and hardware tokens):

```typescript
EIMZOClient.listAllUserKeys(
  // Generate item ID for each certificate
  (certificateInfo, index) => `cert_${index}`,

  // Generate UI representation for each certificate
  (itemId, certificateInfo) => ({
    id: itemId,
    name: certificateInfo.CN, // Common Name
    tin: certificateInfo.TIN, // Tax Identification Number
    validFrom: certificateInfo.validFrom,
    validTo: certificateInfo.validTo,
    type: certificateInfo.type // 'pfx' or 'ftjc'
  }),

  // Success callback
  (certificates, firstCertId) => {
    console.log('Available certificates:', certificates);
    if (firstCertId) {
      console.log('Default certificate ID:', firstCertId);
    }
  },

  // Error callback
  (error, reason) => {
    console.error('Failed to list certificates:', reason);
  }
);
```

## Step 6: Load a Certificate

Before signing documents, you need to load a certificate:

```typescript
// Certificate information from previous step
const certificateInfo = {
  type: 'pfx', // or 'ftjc'
  disk: 'C:',
  path: '\\Users\\username\\certificates',
  name: 'certificate.pfx',
  alias: 'My Certificate'
};

EIMZOClient.loadKey(
  certificateInfo,
  keyId => {
    console.log('✅ Certificate loaded with ID:', keyId);
    // Now you can create signatures with this keyId
  },
  (error, reason) => {
    console.error('❌ Failed to load certificate:', reason);
  },
  true // Verify password
);
```

## Step 7: Create Digital Signature

Create a PKCS#7 digital signature:

```typescript
const documentData = 'Hello, World!'; // Your document content
const keyId = 'cert_key_id'; // From step 6

EIMZOClient.createPkcs7(
  keyId,
  documentData,
  null, // No timestamper (can add TSA later)
  signature => {
    console.log('✅ Digital signature created:', signature);
    // signature is Base64-encoded PKCS#7
  },
  (error, reason) => {
    console.error('❌ Signature creation failed:', reason);
  },
  false, // Attached signature (includes original data)
  false // Data is not Base64-encoded
);
```

## Complete Example

Here's a complete working example:

```typescript
import EIMZOClient from 'imzo-agnost';

async function signDocument(documentContent: string) {
  return new Promise((resolve, reject) => {
    // Step 1: Check E-IMZO
    EIMZOClient.checkVersion(
      (major, minor) => {
        console.log(`E-IMZO ${major}.${minor} detected`);

        // Step 2: Install API keys
        EIMZOClient.installApiKeys(
          () => {
            // Step 3: List certificates
            EIMZOClient.listAllUserKeys(
              (cert, idx) => `cert_${idx}`,
              (id, cert) => ({ id, cert }),
              (certificates, firstId) => {
                if (certificates.length === 0) {
                  reject(new Error('No certificates found'));
                  return;
                }

                const selectedCert = certificates[0].cert;

                // Step 4: Load certificate
                EIMZOClient.loadKey(
                  selectedCert,
                  keyId => {
                    // Step 5: Create signature
                    EIMZOClient.createPkcs7(
                      keyId,
                      documentContent,
                      null,
                      signature => {
                        resolve(signature);
                      },
                      (error, reason) => {
                        reject(new Error(`Signature failed: ${reason}`));
                      }
                    );
                  },
                  (error, reason) => {
                    reject(new Error(`Key loading failed: ${reason}`));
                  },
                  true
                );
              },
              (error, reason) => {
                reject(new Error(`Certificate listing failed: ${reason}`));
              }
            );
          },
          (error, reason) => {
            reject(new Error(`API key installation failed: ${reason}`));
          }
        );
      },
      (error, reason) => {
        reject(new Error(`E-IMZO not available: ${reason}`));
      }
    );
  });
}

// Usage
signDocument('My important document')
  .then(signature => {
    console.log('Document signed successfully!');
    console.log('Signature:', signature);
  })
  .catch(error => {
    console.error('Signing failed:', error.message);
  });
```

## Next Steps

- **[Configuration](/guide/configuration)** - Learn about advanced configuration
  options
- **[Architecture](/guide/architecture)** - Understand the library structure
- **[API Reference](/api/)** - Explore all available methods
- **[Examples](/examples/)** - See framework-specific integrations

## Common Patterns

### Error Handling

Always handle errors gracefully:

```typescript
EIMZOClient.checkVersion(
  (major, minor) => {
    // Success case
  },
  (error, reason) => {
    // Handle different error types
    if (reason?.includes('connection')) {
      // E-IMZO not running
      alert('Please install and run E-IMZO application');
    } else {
      // Other errors
      console.error('Unexpected error:', reason);
    }
  }
);
```

### Loading States

Show loading indicators during operations:

```typescript
setLoading(true);
EIMZOClient.listAllUserKeys(
  // ... callbacks
  certificates => {
    setLoading(false);
    setCertificates(certificates);
  },
  (error, reason) => {
    setLoading(false);
    setError(reason);
  }
);
```

### Certificate Validation

Validate certificates before use:

```typescript
const isValidCertificate = cert => {
  const now = new Date();
  return cert.validFrom <= now && now <= cert.validTo;
};
```
