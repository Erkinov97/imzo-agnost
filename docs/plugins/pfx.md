# PFX Plugin Documentation

The PFX Plugin provides comprehensive certificate management functionality for
E-IMZO. It handles loading, listing, and managing digital certificates stored in
PKCS#12 format.

## 📋 Overview

The PFX (Personal Information Exchange) plugin is the primary interface for
certificate operations in E-IMZO. It allows you to:

* List available certificates
* Load certificates with passwords
* Get detailed certificate information
* Manage certificate passwords
* Handle certificate storage operations

## 🚀 Quick Start

```typescript
import { pfxPlugin } from 'imzo-agnost';

// List all available certificates
const certificates = await pfxPlugin.listCertificates();

// Load a certificate
await pfxPlugin.loadKeyFromId(certificates[0].serialNumber, 'password');

// Get certificate details
const info = await pfxPlugin.getCertificateInfo(certificates[0].serialNumber);
```

## 📖 API Reference

### Certificate Listing

#### `listCertificates(): Promise<Certificate[]>`

Retrieves all certificates available in the E-IMZO certificate store.

```typescript
const certificates = await pfxPlugin.listCertificates();

certificates.forEach((cert, index) => {
  console.log(`Certificate ${index + 1}:`);
  console.log(`  Subject: ${cert.subjectName}`);
  console.log(`  Serial: ${cert.serialNumber}`);
  console.log(`  Valid: ${cert.validFrom} to ${cert.validTo}`);
  console.log(`  Key Usage: ${cert.keyUsage}`);
});
```

**Returns:** Array of certificate objects

**Certificate Object:**

```typescript
interface Certificate {
  serialNumber: string; // Unique certificate identifier
  subjectName: string; // Certificate subject (owner)
  issuerName: string; // Certificate issuer (CA)
  validFrom: string; // Start date (ISO format)
  validTo: string; // Expiry date (ISO format)
  keyUsage: string; // Certificate key usage
  publicKey: string; // Public key (base64)
}
```

**Example Response:**

```json
[
  {
    "serialNumber": "123456789",
    "subjectName": "CN=Johndoe Johnovich, O=MyCompany, C=UZ",
    "issuerName": "CN=E-IMZO CA, O=ALOQABANK, C=UZ",
    "validFrom": "2023-01-01T00:00:00.000Z",
    "validTo": "2025-01-01T00:00:00.000Z",
    "keyUsage": "Digital Signature, Key Encipherment",
    "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A..."
  }
]
```

### Certificate Loading

#### `loadKeyFromId(certId: string, password: string): Promise<boolean>`

Loads a certificate into memory for cryptographic operations.

```typescript
try {
  const success = await pfxPlugin.loadKeyFromId('123456789', 'mypassword');
  if (success) {
    console.log('Certificate loaded successfully');
    // Now you can use this certificate for signing
  }
} catch (error) {
  console.error('Failed to load certificate:', error.message);
}
```

**Parameters:**

* `certId: string` - Certificate serial number (from `listCertificates()`)
* `password: string` - Certificate password

**Returns:** `Promise<boolean>` - Success status

**Throws:**

* `Error` - If certificate not found
* `Error` - If password is incorrect
* `Error` - If certificate is expired or invalid

**Common Error Messages:**

```typescript
// Handle specific errors
try {
  await pfxPlugin.loadKeyFromId(certId, password);
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('Certificate with ID not found');
  } else if (error.message.includes('password')) {
    console.error('Incorrect certificate password');
  } else if (error.message.includes('expired')) {
    console.error('Certificate has expired');
  }
}
```

### Certificate Information

#### `getCertificateInfo(certId: string): Promise<CertificateInfo>`

Retrieves detailed information about a specific certificate.

```typescript
const info = await pfxPlugin.getCertificateInfo('123456789');

console.log('Certificate Details:');
console.log(`Organization: ${info.organization}`);
console.log(`Common Name: ${info.commonName}`);
console.log(`Email: ${info.email}`);
console.log(`Key Usage: ${info.keyUsage.join(', ')}`);
console.log(`Extended Key Usage: ${info.extendedKeyUsage.join(', ')}`);
console.log(`Signature Algorithm: ${info.signAlgorithm}`);
```

**Parameters:**

* `certId: string` - Certificate serial number

**Returns:** `Promise<CertificateInfo>` - Detailed certificate information

**CertificateInfo Interface:**

```typescript
interface CertificateInfo {
  serialNumber: string;
  subjectName: string;
  issuerName: string;
  validFrom: string;
  validTo: string;
  organization: string; // O= field from subject
  commonName: string; // CN= field from subject
  email: string; // E= field from subject
  keyUsage: string[]; // Key usage extensions
  extendedKeyUsage: string[]; // Extended key usage
  publicKey: string; // Public key (base64)
  signAlgorithm: string; // Signature algorithm
}
```

### Password Management

#### `changePassword(certId: string, oldPassword: string, newPassword: string): Promise<boolean>`

Changes the password for a certificate.

```typescript
try {
  const success = await pfxPlugin.changePassword(
    '123456789',
    'oldPassword',
    'newPassword123'
  );

  if (success) {
    console.log('Password changed successfully');
  }
} catch (error) {
  console.error('Password change failed:', error.message);
}
```

**Parameters:**

* `certId: string` - Certificate serial number
* `oldPassword: string` - Current password
* `newPassword: string` - New password

**Returns:** `Promise<boolean>` - Success status

**Password Requirements:**

* Minimum 6 characters
* Should contain letters and numbers
* Cannot be the same as old password

### Certificate Storage

#### `storeCertificate(certificate: string, password: string): Promise<string>`

Stores a new certificate in E-IMZO.

```typescript
// Import certificate from file or other source
const certificateData = '...'; // Base64 certificate data

try {
  const certId = await pfxPlugin.storeCertificate(
    certificateData,
    'password123'
  );
  console.log('Certificate stored with ID:', certId);
} catch (error) {
  console.error('Failed to store certificate:', error.message);
}
```

**Parameters:**

* `certificate: string` - Certificate data (base64 or PEM)
* `password: string` - Password for the certificate

**Returns:** `Promise<string>` - Certificate ID of stored certificate

#### `removeCertificate(certId: string): Promise<boolean>`

Removes a certificate from E-IMZO storage.

```typescript
const success = await pfxPlugin.removeCertificate('123456789');
if (success) {
  console.log('Certificate removed successfully');
}
```

**Parameters:**

* `certId: string` - Certificate serial number

**Returns:** `Promise<boolean>` - Success status

## 💡 Usage Examples

### Basic Certificate Selection

```typescript
import { pfxPlugin } from 'imzo-agnost';

async function selectAndLoadCertificate() {
  try {
    // Get available certificates
    const certificates = await pfxPlugin.listCertificates();

    if (certificates.length === 0) {
      throw new Error('No certificates available');
    }

    // Show certificates to user
    console.log('Available certificates:');
    certificates.forEach((cert, index) => {
      console.log(`${index + 1}. ${cert.subjectName}`);
      console.log(`   Valid: ${cert.validFrom} - ${cert.validTo}`);
    });

    // Get user selection (simplified)
    const selectedIndex = 0; // In real app, get from user input
    const selectedCert = certificates[selectedIndex];

    // Get password from user
    const password = 'user_password'; // In real app, get from secure input

    // Load certificate
    await pfxPlugin.loadKeyFromId(selectedCert.serialNumber, password);

    console.log('Certificate loaded successfully!');
    return selectedCert.serialNumber;
  } catch (error) {
    console.error('Certificate selection failed:', error.message);
    throw error;
  }
}
```

### Certificate Validation

```typescript
async function validateCertificate(certId: string) {
  try {
    const info = await pfxPlugin.getCertificateInfo(certId);

    // Check expiry
    const now = new Date();
    const validTo = new Date(info.validTo);

    if (validTo < now) {
      throw new Error('Certificate has expired');
    }

    // Check if expires soon (within 30 days)
    const daysUntilExpiry = Math.floor(
      (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 30) {
      console.warn(`Certificate expires in ${daysUntilExpiry} days`);
    }

    // Check key usage
    if (!info.keyUsage.includes('Digital Signature')) {
      throw new Error('Certificate cannot be used for digital signatures');
    }

    console.log('Certificate validation passed');
    return true;
  } catch (error) {
    console.error('Certificate validation failed:', error.message);
    return false;
  }
}
```

### Certificate Management Dashboard

```typescript
async function certificateDashboard() {
  try {
    const certificates = await pfxPlugin.listCertificates();

    console.log('=== Certificate Management Dashboard ===\n');

    for (const cert of certificates) {
      console.log(`Certificate: ${cert.subjectName}`);
      console.log(`Serial: ${cert.serialNumber}`);

      // Get detailed info
      const info = await pfxPlugin.getCertificateInfo(cert.serialNumber);
      console.log(`Organization: ${info.organization}`);
      console.log(`Email: ${info.email}`);

      // Check status
      const now = new Date();
      const validTo = new Date(cert.validTo);
      const isExpired = validTo < now;

      if (isExpired) {
        console.log('Status: ❌ EXPIRED');
      } else {
        const daysLeft = Math.floor(
          (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft <= 30) {
          console.log(`Status: ⚠️ EXPIRES IN ${daysLeft} DAYS`);
        } else {
          console.log('Status: ✅ VALID');
        }
      }

      console.log('---\n');
    }
  } catch (error) {
    console.error('Dashboard error:', error.message);
  }
}
```

## 🔧 Advanced Usage

### Certificate Caching

```typescript
class CertificateManager {
  private loadedCertificates = new Set<string>();
  private certificateCache = new Map<string, CertificateInfo>();

  async loadCertificate(certId: string, password: string): Promise<boolean> {
    // Check if already loaded
    if (this.loadedCertificates.has(certId)) {
      console.log('Certificate already loaded');
      return true;
    }

    try {
      await pfxPlugin.loadKeyFromId(certId, password);
      this.loadedCertificates.add(certId);
      return true;
    } catch (error) {
      console.error('Failed to load certificate:', error);
      return false;
    }
  }

  async getCertificateInfo(certId: string): Promise<CertificateInfo> {
    // Check cache first
    if (this.certificateCache.has(certId)) {
      return this.certificateCache.get(certId)!;
    }

    // Fetch and cache
    const info = await pfxPlugin.getCertificateInfo(certId);
    this.certificateCache.set(certId, info);
    return info;
  }

  clearCache(): void {
    this.loadedCertificates.clear();
    this.certificateCache.clear();
  }
}
```

### Bulk Certificate Operations

```typescript
async function processCertificates(
  operations: Array<{ certId: string; password: string }>
) {
  const results = [];

  for (const { certId, password } of operations) {
    try {
      // Load certificate
      await pfxPlugin.loadKeyFromId(certId, password);

      // Get info
      const info = await pfxPlugin.getCertificateInfo(certId);

      // Validate
      const isValid = await validateCertificate(certId);

      results.push({
        certId,
        success: true,
        info,
        isValid
      });
    } catch (error) {
      results.push({
        certId,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}
```

## ⚠️ Error Handling

### Common Error Scenarios

```typescript
async function robustCertificateLoading(certId: string, password: string) {
  try {
    await pfxPlugin.loadKeyFromId(certId, password);
    return { success: true };
  } catch (error) {
    const message = error.message.toLowerCase();

    if (message.includes('not found')) {
      return {
        success: false,
        error: 'CERTIFICATE_NOT_FOUND',
        userMessage: 'Certificate not found in E-IMZO storage'
      };
    }

    if (message.includes('password') || message.includes('invalid')) {
      return {
        success: false,
        error: 'INVALID_PASSWORD',
        userMessage: 'Incorrect certificate password'
      };
    }

    if (message.includes('expired')) {
      return {
        success: false,
        error: 'CERTIFICATE_EXPIRED',
        userMessage: 'Certificate has expired'
      };
    }

    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      userMessage: 'An unexpected error occurred',
      details: error.message
    };
  }
}
```

## 🔗 Integration with Other Plugins

### With PKCS#7 Plugin

```typescript
import { pfxPlugin, pkcs7Plugin } from 'imzo-agnost';

async function signDocument(data: string, certId: string, password: string) {
  // 1. Load certificate
  await pfxPlugin.loadKeyFromId(certId, password);

  // 2. Validate certificate
  const isValid = await validateCertificate(certId);
  if (!isValid) {
    throw new Error('Certificate validation failed');
  }

  // 3. Create signature
  const signature = await pkcs7Plugin.createPKCS7(data, certId, 'no');

  return signature;
}
```

### With CRL Plugin

```typescript
import { pfxPlugin, crlPlugin } from 'imzo-agnost';

async function checkCertificateStatus(certId: string) {
  // Get certificate info
  const info = await pfxPlugin.getCertificateInfo(certId);

  // Check revocation status
  const revocationStatus = await crlPlugin.checkRevocation(info.publicKey);

  return {
    certificateInfo: info,
    isRevoked: revocationStatus.isRevoked,
    revocationDate: revocationStatus.revocationDate,
    isExpired: new Date(info.validTo) < new Date()
  };
}
```

## 📱 Platform-Specific Notes

### Windows

* Certificates stored in Windows Certificate Store
* May require administrator privileges for some operations
* Integration with Windows security prompts

### macOS/Linux

* Limited certificate storage options
* May require manual certificate import
* File-based certificate storage

## 🔒 Security Best Practices


1. **Password Security**

   ```typescript
   // Never log passwords
   console.log('Loading certificate with ID:', certId); // ✅ OK
   console.log('Password:', password); // ❌ NEVER
   
   // Clear passwords from memory when possible
   password = null;
   ```
2. **Certificate Validation**

   ```typescript
   // Always validate before use
   const isValid = await validateCertificate(certId);
   if (!isValid) {
     throw new Error('Certificate validation failed');
   }
   ```
3. **Error Information**

   ```typescript
   // Don't expose sensitive error details to end users
   catch (error) {
       console.error('Internal error:', error); // For debugging
       throw new Error('Certificate operation failed'); // For user
   }
   ```

## 🔗 Related Documentation

* [PKCS#7 Plugin](./pkcs7.md) - Use certificates for signing
* [CRL Plugin](./crl.md) - Check certificate revocation
* [X509 Plugin](./x509.md) - Parse certificate details
* [API Reference](../api.md) - Complete API documentation


