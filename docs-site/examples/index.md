# Examples

Practical examples showing how to use IMZO Agnost in different scenarios.

## Available Examples

### Basic Usage

- **[Basic Usage](/examples/basic-usage)** - Simple certificate loading and
  signing
- **[Advanced Examples](/examples/advanced)** - Complex scenarios and best
  practices

### Framework Integrations

- **[React Integration](/examples/react)** - Using with React applications
- **[Vue.js Integration](/examples/vue)** - Vue.js component examples
- **[Node.js Server](/examples/nodejs)** - Server-side integration

## Quick Examples

### Simple Document Signing

```typescript
import EIMZOClient from 'imzo-agnost';

// Basic signing workflow
async function signDocument(content: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check E-IMZO availability
    EIMZOClient.checkVersion(
      () => {
        // Install API keys
        EIMZOClient.installApiKeys(
          () => {
            // List and select first certificate
            EIMZOClient.listAllUserKeys(
              (cert, idx) => `cert_${idx}`,
              (id, cert) => ({ id, cert }),
              certificates => {
                if (certificates.length === 0) {
                  reject(new Error('No certificates found'));
                  return;
                }

                const firstCert = certificates[0].cert;

                // Load certificate
                EIMZOClient.loadKey(
                  firstCert,
                  keyId => {
                    // Create signature
                    EIMZOClient.createPkcs7(
                      keyId,
                      content,
                      null,
                      resolve,
                      (error, reason) =>
                        reject(new Error(reason || 'Signing failed'))
                    );
                  },
                  (error, reason) =>
                    reject(new Error(reason || 'Key loading failed'))
                );
              },
              (error, reason) =>
                reject(new Error(reason || 'Certificate listing failed'))
            );
          },
          (error, reason) =>
            reject(new Error(reason || 'API key installation failed'))
        );
      },
      (error, reason) => reject(new Error(reason || 'E-IMZO not available'))
    );
  });
}

// Usage
signDocument('Hello, World!')
  .then(signature => console.log('Signature:', signature))
  .catch(error => console.error('Error:', error.message));
```

### Certificate Information Display

```typescript
// Get user-friendly certificate information
EIMZOClient.listAllUserKeys(
  (cert, idx) => `cert_${idx}`,
  (id, cert) => ({
    id,
    name: cert.CN,
    organization: cert.O,
    tin: cert.TIN,
    validFrom: cert.validFrom.toLocaleDateString(),
    validTo: cert.validTo.toLocaleDateString(),
    type: cert.type === 'pfx' ? 'Software Certificate' : 'Hardware Token',
    isValid: cert.validTo > new Date()
  }),
  certificates => {
    certificates.forEach(cert => {
      console.log(`📋 ${cert.name}`);
      console.log(`   Organization: ${cert.organization}`);
      console.log(`   TIN: ${cert.tin}`);
      console.log(`   Valid: ${cert.validFrom} - ${cert.validTo}`);
      console.log(`   Type: ${cert.type}`);
      console.log(`   Status: ${cert.isValid ? '✅ Valid' : '❌ Expired'}`);
      console.log('');
    });
  },
  (error, reason) => {
    console.error('Failed to list certificates:', reason);
  }
);
```

## Error Handling Patterns

### Comprehensive Error Handling

```typescript
class EIMZOError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'EIMZOError';
  }
}

function handleEIMZOError(error: unknown, reason: string | null): EIMZOError {
  if (reason?.includes('E-IMZO not found')) {
    return new EIMZOError(
      'E-IMZO application is not installed or running',
      'EIMZO_NOT_FOUND'
    );
  }
  if (reason?.includes('certificate')) {
    return new EIMZOError('Certificate error: ' + reason, 'CERTIFICATE_ERROR');
  }
  if (reason?.includes('password')) {
    return new EIMZOError('Invalid certificate password', 'INVALID_PASSWORD');
  }
  return new EIMZOError(reason || 'Unknown E-IMZO error', 'UNKNOWN_ERROR');
}

// Usage with proper error handling
EIMZOClient.checkVersion(
  (major, minor) => {
    console.log(`E-IMZO ${major}.${minor} is available`);
  },
  (error, reason) => {
    const eimzoError = handleEIMZOError(error, reason);
    console.error(`[${eimzoError.code}] ${eimzoError.message}`);

    // Show user-appropriate message
    switch (eimzoError.code) {
      case 'EIMZO_NOT_FOUND':
        alert('Please install E-IMZO application from e-imzo.uz');
        break;
      default:
        alert('An error occurred. Please try again.');
    }
  }
);
```

## Browser Integration

### HTML Setup

```html
<!DOCTYPE html>
<html>
  <head>
    <title>E-IMZO Integration</title>
  </head>
  <body>
    <div id="app">
      <button id="checkBtn">Check E-IMZO</button>
      <button id="listBtn">List Certificates</button>
      <button id="signBtn">Sign Document</button>
      <div id="result"></div>
    </div>

    <script type="module">
      import EIMZOClient from 'https://cdn.skypack.dev/imzo-agnost';

      const result = document.getElementById('result');

      document.getElementById('checkBtn').onclick = () => {
        EIMZOClient.checkVersion(
          (major, minor) => {
            result.innerHTML = `✅ E-IMZO ${major}.${minor} is available`;
          },
          (error, reason) => {
            result.innerHTML = `❌ ${reason}`;
          }
        );
      };

      // More event handlers...
    </script>
  </body>
</html>
```

Explore specific framework integrations:

- **[React](/examples/react)** - Complete React component examples
- **[Vue.js](/examples/vue)** - Vue composition API and options API
- **[Node.js](/examples/nodejs)** - Server-side document processing
