# Quick Start Guide

Get up and running with E-IMZO Agnostic Library in minutes!

## 🚀 Quick Overview

E-IMZO Agnostic Library provides a modern, plugin-based interface for E-IMZO
cryptographic operations. This guide will help you create your first digital
signature in just a few steps.

## 📋 Prerequisites Checklist

- ✅ [E-IMZO installed](https://e-imzo.uz) and running
- ✅ [Node.js 16+](https://nodejs.org) or modern browser
- ✅ Library installed (`npm install imzo-agnost`)

## 🎯 Your First Digital Signature

### Step 1: Import the Library

```typescript
import { eimzoApi, pfxPlugin, pkcs7Plugin } from 'imzo-agnost';
```

### Step 2: Initialize E-IMZO

```typescript
async function initializeEImzo() {
  try {
    // Install API keys (one-time setup)
    await eimzoApi.installApiKeys();

    // Get E-IMZO version to verify connection
    const version = await eimzoApi.getVersion();
    console.log('E-IMZO Version:', version);

    return true;
  } catch (error) {
    console.error('Failed to initialize E-IMZO:', error);
    return false;
  }
}
```

### Step 3: Load Certificate

```typescript
async function loadCertificate() {
  try {
    // Get list of available certificates
    const certificates = await pfxPlugin.listCertificates();

    if (certificates.length === 0) {
      throw new Error('No certificates found');
    }

    // Use the first certificate (you can let user choose)
    const certId = certificates[0].serialNumber;

    // Load certificate with password
    const password = prompt('Enter certificate password:');
    await pfxPlugin.loadKeyFromId(certId, password);

    console.log('Certificate loaded successfully');
    return certId;
  } catch (error) {
    console.error('Failed to load certificate:', error);
    throw error;
  }
}
```

### Step 4: Sign Data

```typescript
async function signData(data: string, certId: string) {
  try {
    // Create PKCS#7 signature
    const signature = await pkcs7Plugin.createPKCS7(
      data, // Data to sign
      certId, // Certificate ID
      'no' // Don't include data in signature
    );

    console.log('Signature created:', signature);
    return signature;
  } catch (error) {
    console.error('Failed to sign data:', error);
    throw error;
  }
}
```

### Step 5: Complete Example

```typescript
import { eimzoApi, pfxPlugin, pkcs7Plugin } from 'imzo-agnost';

async function quickSignExample() {
  try {
    // 1. Initialize E-IMZO
    console.log('Initializing E-IMZO...');
    const initialized = await initializeEImzo();
    if (!initialized) return;

    // 2. Load certificate
    console.log('Loading certificate...');
    const certId = await loadCertificate();

    // 3. Sign some data
    console.log('Signing data...');
    const dataToSign = 'Hello, E-IMZO!';
    const signature = await signData(dataToSign, certId);

    // 4. Success!
    console.log('✅ Digital signature created successfully!');
    console.log('Signature length:', signature.length);
  } catch (error) {
    console.error('❌ Error in signing process:', error);
  }
}

// Run the example
quickSignExample();
```

## 🌐 Browser Example

Here's a complete HTML page to get started:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>E-IMZO Quick Start</title>
    <script src="https://unpkg.com/imzo-agnost@latest/dist/index.js"></script>
  </head>
  <body>
    <div id="app">
      <h1>E-IMZO Quick Start</h1>
      <button onclick="initAndSign()">Initialize & Sign</button>
      <div id="status"></div>
      <pre id="result"></pre>
    </div>

    <script>
      const { eimzoApi, pfxPlugin, pkcs7Plugin } = window;
      const status = document.getElementById('status');
      const result = document.getElementById('result');

      function updateStatus(message) {
        status.textContent = message;
        console.log(message);
      }

      async function initAndSign() {
        try {
          updateStatus('Initializing E-IMZO...');

          // Initialize
          await eimzoApi.installApiKeys();
          const version = await eimzoApi.getVersion();
          updateStatus(`E-IMZO ${version} ready!`);

          // Load certificate
          updateStatus('Loading certificates...');
          const certificates = await pfxPlugin.listCertificates();

          if (certificates.length === 0) {
            throw new Error('No certificates found');
          }

          const certId = certificates[0].serialNumber;
          const password = prompt('Enter certificate password:');
          await pfxPlugin.loadKeyFromId(certId, password);

          // Sign data
          updateStatus('Creating digital signature...');
          const signature = await pkcs7Plugin.createPKCS7(
            'Hello from browser!',
            certId,
            'no'
          );

          updateStatus('✅ Success!');
          result.textContent = `Signature: ${signature.substring(0, 100)}...`;
        } catch (error) {
          updateStatus(`❌ Error: ${error.message}`);
          result.textContent = error.stack;
        }
      }
    </script>
  </body>
</html>
```

## 🎮 Interactive Examples

### Certificate Management

```typescript
// List all available certificates
async function listCertificates() {
  const certs = await pfxPlugin.listCertificates();

  certs.forEach((cert, index) => {
    console.log(`${index + 1}. ${cert.subjectName}`);
    console.log(`   Serial: ${cert.serialNumber}`);
    console.log(`   Valid: ${cert.validFrom} - ${cert.validTo}`);
  });

  return certs;
}

// Get certificate details
async function getCertificateInfo(certId: string) {
  const info = await pfxPlugin.getCertificateInfo(certId);
  console.log('Certificate Information:', info);
  return info;
}
```

### Document Signing

```typescript
// Sign a file
async function signFile(fileContent: string, certId: string) {
  try {
    // For larger files, you might want to hash first
    const hash = await eimzoApi.createHash(fileContent, 'SHA256');

    // Sign the hash
    const signature = await pkcs7Plugin.createPKCS7(hash, certId, 'no');

    return {
      originalData: fileContent,
      hash: hash,
      signature: signature,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('File signing failed:', error);
    throw error;
  }
}
```

### Signature Verification

```typescript
// Verify a signature
async function verifySignature(signature: string, originalData?: string) {
  try {
    const isValid = await pkcs7Plugin.verifyPKCS7(
      signature,
      originalData,
      null // Certificate will be extracted from signature
    );

    console.log('Signature valid:', isValid);
    return isValid;
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}
```

## 📱 Platform-Specific Notes

### Windows

- E-IMZO runs as a Windows service
- Default port: `127.0.0.1:64443`
- Firewall may block connections

### macOS

- E-IMZO runs as a background daemon
- May require security permissions
- Gatekeeper might block unsigned E-IMZO

### Linux

- E-IMZO might run differently
- Check service status: `systemctl status eimzo`
- Port configuration may vary

## ⚡ Performance Tips

### 1. Connection Reuse

```typescript
// Don't repeatedly install API keys
let apiKeysInstalled = false;

async function ensureInitialized() {
  if (!apiKeysInstalled) {
    await eimzoApi.installApiKeys();
    apiKeysInstalled = true;
  }
}
```

### 2. Certificate Caching

```typescript
// Cache loaded certificates
const loadedCertificates = new Map();

async function getCachedCertificate(certId: string, password: string) {
  if (!loadedCertificates.has(certId)) {
    await pfxPlugin.loadKeyFromId(certId, password);
    loadedCertificates.set(certId, true);
  }
}
```

### 3. Batch Operations

```typescript
// Sign multiple documents efficiently
async function signMultiple(documents: string[], certId: string) {
  const signatures = [];

  for (const doc of documents) {
    const signature = await pkcs7Plugin.createPKCS7(doc, certId, 'no');
    signatures.push(signature);
  }

  return signatures;
}
```

## 🔍 Debugging

### Enable Debug Mode

```typescript
// Set debug mode (if supported)
process.env.EIMZO_DEBUG = 'true';

// Or use console logging
eimzoApi.onMessage = message => {
  console.log('E-IMZO Message:', message);
};
```

### Common Error Solutions

**"Connection refused"**

- Check if E-IMZO is running
- Verify port 64443 is not blocked

**"Certificate not found"**

- List certificates first
- Check certificate ID format

**"Invalid password"**

- Verify password correctness
- Some certificates might be locked

## 🎯 Next Steps

Now that you have the basics working:

1. **Explore Plugins**: Learn about [available plugins](./plugins/)
2. **Advanced Usage**: Check [advanced patterns](./advanced/)
3. **API Reference**: Browse the [complete API](./api/)
4. **Examples**: See more [real-world examples](./examples/)

---

**🎉 Congratulations!** You've successfully created your first digital signature
with E-IMZO Agnostic Library. Ready to build something amazing?
