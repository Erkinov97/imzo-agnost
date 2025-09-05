# Examples

Real-world examples demonstrating how to use E-IMZO Agnostic Library in
different scenarios and environments.

## 📚 Example Categories

### 🌐 [Browser Examples](./browser/)

Complete examples for web applications:

- [Basic Web Integration](./browser/basic-web.md) - Simple HTML/JavaScript setup
- [React Application](./browser/react-app.md) - Modern React integration
- [Vue.js Application](./browser/vue-app.md) - Vue.js implementation
- [Angular Application](./browser/angular-app.md) - Angular integration

### 🖥️ [Node.js Examples](./nodejs/)

Server-side implementations:

- [Express Server](./nodejs/express-server.md) - REST API with E-IMZO
- [Electron App](./nodejs/electron-app.md) - Desktop application
- [CLI Tool](./nodejs/cli-tool.md) - Command-line interface
- [Microservice](./nodejs/microservice.md) - Containerized service

### 🏗️ [Integration Patterns](./patterns/)

Common integration scenarios:

- [Document Management](./patterns/document-management.md) - Complete document
  workflow
- [User Authentication](./patterns/user-authentication.md) - Certificate-based
  auth
- [Batch Processing](./patterns/batch-processing.md) - Bulk operations
- [Real-time Signing](./patterns/realtime-signing.md) - WebSocket integration

### 🇺🇿 [Uzbekistan Specific](./uzbekistan/)

Country-specific implementations:

- [FTJC Tax Invoices](./uzbekistan/ftjc-invoices.md) - Tax invoice signing
- [MyGov Integration](./uzbekistan/mygov-integration.md) - Government services
- [Banking Applications](./uzbekistan/banking-apps.md) - Financial services
- [EDS Integration](./uzbekistan/eds-integration.md) - Electronic document flow

## 🚀 Quick Start Examples

### Basic Digital Signature (Browser)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>E-IMZO Quick Sign</title>
    <script src="https://unpkg.com/imzo-agnost@latest/dist/index.js"></script>
  </head>
  <body>
    <h1>Digital Signature Demo</h1>
    <textarea id="content" placeholder="Enter text to sign..."></textarea>
    <button onclick="signContent()">Sign Document</button>
    <div id="result"></div>

    <script>
      const { eimzoApi, pfxPlugin, pkcs7Plugin } = window;

      async function signContent() {
        try {
          const content = document.getElementById('content').value;
          const result = document.getElementById('result');

          // Initialize E-IMZO
          await eimzoApi.installApiKeys();

          // Get certificates
          const certificates = await pfxPlugin.listCertificates();
          if (certificates.length === 0) {
            throw new Error('No certificates found');
          }

          // Load first certificate
          const certId = certificates[0].serialNumber;
          const password = prompt('Certificate password:');
          await pfxPlugin.loadKeyFromId(certId, password);

          // Create signature
          const signature = await pkcs7Plugin.createPKCS7(
            content,
            certId,
            'no'
          );

          result.innerHTML = `
                    <h3>✅ Signature Created</h3>
                    <p><strong>Certificate:</strong> ${certificates[0].subjectName}</p>
                    <p><strong>Signature:</strong> ${signature.substring(0, 100)}...</p>
                `;
        } catch (error) {
          document.getElementById('result').innerHTML = `
                    <h3>❌ Error</h3>
                    <p>${error.message}</p>
                `;
        }
      }
    </script>
  </body>
</html>
```

### Basic Digital Signature (Node.js)

```typescript
import { eimzoApi, pfxPlugin, pkcs7Plugin } from 'imzo-agnost';

async function signDocument() {
  try {
    console.log('🔧 Initializing E-IMZO...');
    await eimzoApi.installApiKeys();

    console.log('📋 Getting certificates...');
    const certificates = await pfxPlugin.listCertificates();

    if (certificates.length === 0) {
      throw new Error('No certificates available');
    }

    // Show available certificates
    console.log('Available certificates:');
    certificates.forEach((cert, index) => {
      console.log(`  ${index + 1}. ${cert.subjectName}`);
    });

    // Use first certificate for demo
    const certId = certificates[0].serialNumber;
    console.log(`📜 Using certificate: ${certId}`);

    // Load certificate (in real app, get password securely)
    const password = 'certificate_password';
    console.log('🔐 Loading certificate...');
    await pfxPlugin.loadKeyFromId(certId, password);

    // Document to sign
    const document = 'This is a test document to be signed.';
    console.log('✍️ Creating signature...');

    // Create digital signature
    const signature = await pkcs7Plugin.createPKCS7(document, certId, 'no');

    console.log('✅ Document signed successfully!');
    console.log(`📄 Document: ${document}`);
    console.log(`🔏 Signature: ${signature.substring(0, 100)}...`);

    // Verify signature
    console.log('🔍 Verifying signature...');
    const isValid = await pkcs7Plugin.verifyPKCS7(signature, document);
    console.log(`✅ Signature valid: ${isValid}`);

    return {
      document,
      signature,
      isValid,
      certificate: certificates[0]
    };
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run the example
signDocument()
  .then(result => {
    console.log('🎉 Signing completed successfully');
  })
  .catch(error => {
    console.error('💥 Signing failed:', error.message);
  });
```

### Certificate Management Example

```typescript
import { pfxPlugin, crlPlugin } from 'imzo-agnost';

async function manageCertificates() {
  try {
    console.log('📋 Certificate Management Dashboard');
    console.log('=====================================\n');

    // Get all certificates
    const certificates = await pfxPlugin.listCertificates();

    for (const cert of certificates) {
      console.log(`📜 Certificate: ${cert.subjectName}`);
      console.log(`🔢 Serial: ${cert.serialNumber}`);

      // Get detailed information
      const info = await pfxPlugin.getCertificateInfo(cert.serialNumber);
      console.log(`🏢 Organization: ${info.organization}`);
      console.log(`📧 Email: ${info.email}`);

      // Check expiry status
      const validTo = new Date(cert.validTo);
      const now = new Date();
      const daysUntilExpiry = Math.ceil(
        (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry < 0) {
        console.log('⚠️ Status: EXPIRED');
      } else if (daysUntilExpiry <= 30) {
        console.log(`⚠️ Status: EXPIRES IN ${daysUntilExpiry} DAYS`);
      } else {
        console.log('✅ Status: VALID');
      }

      // Check revocation status
      try {
        const revocationStatus = await crlPlugin.checkRevocation(
          cert.publicKey
        );
        if (revocationStatus.isRevoked) {
          console.log('❌ REVOKED on', revocationStatus.revocationDate);
        } else {
          console.log('✅ Not revoked');
        }
      } catch (error) {
        console.log('⚠️ Could not check revocation status');
      }

      console.log('---\n');
    }
  } catch (error) {
    console.error('❌ Certificate management error:', error.message);
  }
}

manageCertificates();
```

## 📖 Tutorial Series

### Beginner Tutorial: Your First Signature

1. **[Setup E-IMZO](./tutorials/01-setup.md)** - Installing and configuring
   E-IMZO
2. **[Hello World](./tutorials/02-hello-world.md)** - Your first signature
3. **[Certificate Selection](./tutorials/03-certificate-selection.md)** -
   Working with multiple certificates
4. **[Error Handling](./tutorials/04-error-handling.md)** - Robust error
   management

### Intermediate Tutorial: Web Application

1. **[Project Setup](./tutorials/05-web-setup.md)** - Setting up a web project
2. **[User Interface](./tutorials/06-user-interface.md)** - Building the UI
3. **[File Handling](./tutorials/07-file-handling.md)** - Signing files
4. **[Verification](./tutorials/08-verification.md)** - Signature verification

### Advanced Tutorial: Production Application

1. **[Architecture](./tutorials/09-architecture.md)** - Scalable architecture
   design
2. **[Security](./tutorials/10-security.md)** - Security best practices
3. **[Performance](./tutorials/11-performance.md)** - Optimization techniques
4. **[Deployment](./tutorials/12-deployment.md)** - Production deployment

## 🎯 Use Case Examples

### Document Management System

```typescript
class DocumentManager {
  async signDocument(document: Document, certId: string, password: string) {
    // Load certificate
    await pfxPlugin.loadKeyFromId(certId, password);

    // Create document hash
    const hash = await eimzoApi.createHash(document.content, 'SHA256');

    // Sign hash
    const signature = await pkcs7Plugin.createPKCS7(hash, certId, 'no');

    // Store signature with document
    return {
      documentId: document.id,
      content: document.content,
      hash: hash,
      signature: signature,
      signedAt: new Date().toISOString(),
      signedBy: certId
    };
  }

  async verifyDocument(signedDocument: SignedDocument) {
    // Verify signature
    const isValid = await pkcs7Plugin.verifyPKCS7(
      signedDocument.signature,
      signedDocument.hash
    );

    // Verify hash
    const currentHash = await eimzoApi.createHash(
      signedDocument.content,
      'SHA256'
    );
    const hashMatches = currentHash === signedDocument.hash;

    return {
      signatureValid: isValid,
      contentIntact: hashMatches,
      isAuthentic: isValid && hashMatches
    };
  }
}
```

### Authentication Service

```typescript
class AuthenticationService {
  async authenticateUser(challenge: string, certId: string, password: string) {
    try {
      // Load user certificate
      await pfxPlugin.loadKeyFromId(certId, password);

      // Get certificate info
      const certInfo = await pfxPlugin.getCertificateInfo(certId);

      // Sign challenge
      const signature = await pkcs7Plugin.createPKCS7(challenge, certId, 'no');

      // Verify signature
      const isValid = await pkcs7Plugin.verifyPKCS7(signature, challenge);

      if (isValid) {
        return {
          authenticated: true,
          userId: certInfo.commonName,
          organization: certInfo.organization,
          email: certInfo.email,
          sessionToken: this.generateSessionToken(certId)
        };
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      return {
        authenticated: false,
        error: error.message
      };
    }
  }

  private generateSessionToken(certId: string): string {
    // Generate secure session token
    return `session_${certId}_${Date.now()}`;
  }
}
```

## 🔧 Framework-Specific Examples

### React Hook

```typescript
// useEImzo.ts
import { useState, useEffect } from 'react';
import { eimzoApi, pfxPlugin, pkcs7Plugin } from 'imzo-agnost';

export function useEImzo() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeEImzo();
  }, []);

  const initializeEImzo = async () => {
    try {
      await eimzoApi.installApiKeys();
      const certs = await pfxPlugin.listCertificates();
      setCertificates(certs);
      setIsInitialized(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const signData = async (data, certId, password) => {
    try {
      await pfxPlugin.loadKeyFromId(certId, password);
      const signature = await pkcs7Plugin.createPKCS7(data, certId, 'no');
      return signature;
    } catch (error) {
      throw new Error(`Signing failed: ${error.message}`);
    }
  };

  return {
    isInitialized,
    certificates,
    error,
    signData
  };
}
```

### Vue.js Composable

```typescript
// useEImzo.js
import { ref, onMounted } from 'vue';
import { eimzoApi, pfxPlugin, pkcs7Plugin } from 'imzo-agnost';

export function useEImzo() {
  const isInitialized = ref(false);
  const certificates = ref([]);
  const error = ref(null);

  const initialize = async () => {
    try {
      await eimzoApi.installApiKeys();
      const certs = await pfxPlugin.listCertificates();
      certificates.value = certs;
      isInitialized.value = true;
    } catch (err) {
      error.value = err.message;
    }
  };

  const signDocument = async (content, certId, password) => {
    await pfxPlugin.loadKeyFromId(certId, password);
    return await pkcs7Plugin.createPKCS7(content, certId, 'no');
  };

  onMounted(initialize);

  return {
    isInitialized: readonly(isInitialized),
    certificates: readonly(certificates),
    error: readonly(error),
    signDocument
  };
}
```

## 📱 Platform Examples

### Electron Desktop App

```typescript
// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const { eimzoApi, pfxPlugin, pkcs7Plugin } = require('imzo-agnost');

// IPC handlers for E-IMZO operations
ipcMain.handle('eimzo:init', async () => {
  await eimzoApi.installApiKeys();
  return await pfxPlugin.listCertificates();
});

ipcMain.handle('eimzo:sign', async (event, { data, certId, password }) => {
  await pfxPlugin.loadKeyFromId(certId, password);
  return await pkcs7Plugin.createPKCS7(data, certId, 'no');
});

// renderer.js
const { ipcRenderer } = require('electron');

document.getElementById('sign-btn').addEventListener('click', async () => {
  try {
    // Initialize and get certificates
    const certificates = await ipcRenderer.invoke('eimzo:init');

    // Get user inputs
    const data = document.getElementById('data').value;
    const certId = certificates[0].serialNumber;
    const password = document.getElementById('password').value;

    // Sign data
    const signature = await ipcRenderer.invoke('eimzo:sign', {
      data,
      certId,
      password
    });

    document.getElementById('result').textContent = signature;
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
```

## 🔗 Additional Resources

### Complete Examples Repository

- **[GitHub Repository](https://github.com/Erkinov97/imzo-agnost-examples)** -
  Full example projects
- **[CodeSandbox Demos](https://codesandbox.io/u/imzo-agnost)** - Interactive
  online examples
- **[NPM Package Examples](https://www.npmjs.com/package/imzo-agnost)** -
  Package documentation examples

### Video Tutorials

- **[YouTube Playlist](https://youtube.com/playlist?list=PLxxxxxx)** -
  Step-by-step video guides
- **[Live Coding Sessions](https://twitch.tv/xxxxx)** - Weekly development
  streams

### Community Examples

- **[Community Cookbook](./community/)** - User-contributed examples
- **[Stack Overflow](https://stackoverflow.com/questions/tagged/imzo-agnost)** -
  Q&A examples
- **[Discord Community](https://discord.gg/xxxxx)** - Real-time help and
  examples

---

**Ready to build?** Start with the [Quick Start Guide](../quickstart.md) or dive
into specific examples above!
