# PKI Plugin API Reference

PKI (Public Key Infrastructure) plugin PKI operatsiyalari va kalitlar bilan
ishlash uchun mo'ljallangan. Bu plugin kalitlar juftligini yaratish,
sertifikatlar bilan ishlash va PKI tizim operatsiyalarini bajarish uchun
ishlatiladi.

## Overview

PKI plugin quyidagi funksiyalarni taqdim etadi:

- Kalitlar juftligini yaratish (RSA, ECDSA)
- Certificate Signing Request (CSR) yaratish
- Sertifikat imzolash va berish
- PKI tizim konfiguratsiyasi
- CA operatsiyalari
- Key management operations

## Import

```typescript
// ES6 import
import { pkiPlugin } from 'imzo-agnost';

// CommonJS
const { pkiPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.pki;
```

## Types

```typescript
interface KeyPairResult {
  success: boolean;
  publicKey: string;
  privateKey: string;
  keyId: string;
  algorithm: string;
  keySize: number;
}

interface CSRRequest {
  subject: string;
  keyId: string;
  algorithm?: string;
  extensions?: Extension[];
}

interface CSRResult {
  success: boolean;
  csr: string;
  publicKey: string;
  subject: string;
}

interface CertificateRequest {
  csr: string;
  validity: number; // days
  extensions?: Extension[];
  issuerKeyId?: string;
}

interface Extension {
  oid: string;
  critical: boolean;
  value: string;
}

interface PKIConfig {
  caKeyId: string;
  caCertificate: string;
  defaultValidity: number;
  supportedAlgorithms: string[];
}
```

## Key Pair Generation

### generateKeyPairAsync()

Yangi kalitlar juftligini yaratish.

**RSA Key Pair:**

```typescript
try {
  const keySpec = {
    algorithm: 'RSA',
    keySize: 2048,
    keyId: 'user_rsa_key_' + Date.now()
  };

  const result = await pkiPlugin.generateKeyPairAsync(keySpec);

  if (result.success) {
    console.log('✅ RSA key pair generated successfully');
    console.log('Key ID:', result.keyId);
    console.log('Algorithm:', result.algorithm);
    console.log('Key Size:', result.keySize, 'bits');
    console.log('Public Key:', result.publicKey.substring(0, 100) + '...');

    // Private key ni xavfsiz joyda saqlash kerak
    console.log('Private key generated (not displayed for security)');
  }
} catch (error) {
  console.error('❌ RSA key generation failed:', error);
}
```

**ECDSA Key Pair:**

```typescript
try {
  const ecdsaSpec = {
    algorithm: 'ECDSA',
    curve: 'P-256', // P-256, P-384, P-521
    keyId: 'user_ecdsa_key_' + Date.now()
  };

  const result = await pkiPlugin.generateKeyPairAsync(ecdsaSpec);

  if (result.success) {
    console.log('✅ ECDSA key pair generated successfully');
    console.log('Key ID:', result.keyId);
    console.log('Algorithm:', result.algorithm);
    console.log('Curve:', result.curve);
    console.log('Public Key:', result.publicKey.substring(0, 100) + '...');
  }
} catch (error) {
  console.error('❌ ECDSA key generation failed:', error);
}
```

**Advanced Key Generation with Options:**

```typescript
try {
  const advancedSpec = {
    algorithm: 'RSA',
    keySize: 4096,
    keyId: 'high_security_key',
    password: 'strong_password_123',
    exportable: false, // Key ni export qilish mumkinmi
    keyUsage: ['digitalSignature', 'keyEncipherment'],
    validityDays: 365
  };

  const result = await pkiPlugin.generateKeyPairAsync(advancedSpec);

  if (result.success) {
    console.log('✅ High-security key pair generated');
    console.log('Key protected with password');
    console.log('Export allowed:', advancedSpec.exportable);
  }
} catch (error) {
  console.error('❌ Advanced key generation failed:', error);
}
```

## Certificate Signing Request (CSR)

### createCSRAsync()

Certificate Signing Request yaratish.

**Basic CSR Creation:**

```typescript
try {
  const csrRequest: CSRRequest = {
    subject: 'CN=John Doe,O=Example Corp,C=UZ',
    keyId: 'user_rsa_key_123',
    algorithm: 'SHA256withRSA'
  };

  const result = await pkiPlugin.createCSRAsync(csrRequest);

  if (result.success) {
    console.log('✅ CSR created successfully');
    console.log('Subject:', result.subject);
    console.log('CSR (PEM format):');
    console.log(result.csr);
    console.log('Public Key:', result.publicKey);
  }
} catch (error) {
  console.error('❌ CSR creation failed:', error);
}
```

**CSR with Extensions:**

```typescript
try {
  const extensions: Extension[] = [
    {
      oid: '2.5.29.15', // Key Usage
      critical: true,
      value: 'digitalSignature,keyEncipherment'
    },
    {
      oid: '2.5.29.37', // Extended Key Usage
      critical: false,
      value: 'clientAuth,emailProtection'
    },
    {
      oid: '2.5.29.17', // Subject Alternative Name
      critical: false,
      value: 'email:john.doe@example.com,DNS:johndoe.example.com'
    }
  ];

  const csrRequest: CSRRequest = {
    subject:
      'CN=John Doe,O=Example Corp,OU=IT Department,L=Tashkent,ST=Tashkent,C=UZ',
    keyId: 'user_key_123',
    algorithm: 'SHA256withRSA',
    extensions: extensions
  };

  const result = await pkiPlugin.createCSRAsync(csrRequest);

  if (result.success) {
    console.log('✅ CSR with extensions created');
    console.log('Extensions included:', extensions.length);
    console.log('CSR ready for CA submission');
  }
} catch (error) {
  console.error('❌ CSR with extensions creation failed:', error);
}
```

### parseCSRAsync()

CSR ni parse qilish va ma'lumotlarini olish.

```typescript
try {
  const csrPEM = `-----BEGIN CERTIFICATE REQUEST-----
MIICXjCCAUYCAQAwGTEXMBUGA1UEAwwOdGVzdC5leGFtcGxlLmNvbTCCASIwDQYJ
...
-----END CERTIFICATE REQUEST-----`;

  const parsed = await pkiPlugin.parseCSRAsync(csrPEM);

  if (parsed.success) {
    console.log('📋 CSR Information:');
    console.log('Subject:', parsed.subject);
    console.log('Public Key Algorithm:', parsed.publicKeyAlgorithm);
    console.log('Signature Algorithm:', parsed.signatureAlgorithm);
    console.log('Extensions:', parsed.extensions.length);

    parsed.extensions.forEach((ext, index) => {
      console.log(`  ${index + 1}. ${ext.oid} (Critical: ${ext.critical})`);
    });
  }
} catch (error) {
  console.error('❌ CSR parsing failed:', error);
}
```

## Certificate Operations

### signCertificateAsync()

CSR ga asoslangan sertifikat imzolash.

**Basic Certificate Signing:**

```typescript
try {
  const certRequest: CertificateRequest = {
    csr: csrPEM,
    validity: 365, // 1 yil
    issuerKeyId: 'ca_private_key'
  };

  const certificate = await pkiPlugin.signCertificateAsync(certRequest);

  if (certificate.success) {
    console.log('✅ Certificate signed successfully');
    console.log('Serial Number:', certificate.serialNumber);
    console.log('Valid From:', certificate.notBefore);
    console.log('Valid To:', certificate.notAfter);
    console.log('Certificate (PEM):');
    console.log(certificate.certificate);
  }
} catch (error) {
  console.error('❌ Certificate signing failed:', error);
}
```

**Advanced Certificate Signing with Custom Extensions:**

```typescript
try {
  const customExtensions: Extension[] = [
    {
      oid: '2.5.29.15', // Key Usage
      critical: true,
      value: 'digitalSignature,nonRepudiation,keyEncipherment'
    },
    {
      oid: '2.5.29.37', // Extended Key Usage
      critical: true,
      value: 'clientAuth,emailProtection'
    },
    {
      oid: '2.5.29.31', // CRL Distribution Points
      critical: false,
      value: 'URI:http://ca.example.com/crl.crl'
    },
    {
      oid: '1.3.6.1.5.5.7.1.1', // Authority Info Access
      critical: false,
      value: 'OCSP;URI:http://ocsp.example.com'
    }
  ];

  const advancedCertRequest: CertificateRequest = {
    csr: csrPEM,
    validity: 730, // 2 yil
    extensions: customExtensions,
    issuerKeyId: 'ca_private_key',
    serialNumber: generateSerialNumber(),
    template: 'user_certificate'
  };

  const certificate = await pkiPlugin.signCertificateAsync(advancedCertRequest);

  if (certificate.success) {
    console.log('✅ Advanced certificate signed');
    console.log('Custom extensions applied:', customExtensions.length);
    console.log('Certificate template used:', advancedCertRequest.template);
  }
} catch (error) {
  console.error('❌ Advanced certificate signing failed:', error);
}

function generateSerialNumber(): string {
  return Date.now().toString(16) + Math.random().toString(16).substr(2, 8);
}
```

### revokeCertificateAsync()

Sertifikatni bekor qilish.

```typescript
try {
  const revocationInfo = {
    serialNumber: '1a2b3c4d5e6f',
    reason: 'keyCompromise', // keyCompromise, cessationOfOperation, superseded
    revocationDate: new Date().toISOString(),
    issuerKeyId: 'ca_private_key'
  };

  const result = await pkiPlugin.revokeCertificateAsync(revocationInfo);

  if (result.success) {
    console.log('✅ Certificate revoked successfully');
    console.log('Serial Number:', revocationInfo.serialNumber);
    console.log('Reason:', revocationInfo.reason);
    console.log('Revocation Date:', revocationInfo.revocationDate);
  }
} catch (error) {
  console.error('❌ Certificate revocation failed:', error);
}
```

## CA Operations

### initializeCAAsync()

Certificate Authority ni ishga tushirish.

```typescript
try {
  const caConfig = {
    subject: 'CN=Example CA,O=Example Organization,C=UZ',
    keySize: 4096,
    validity: 3650, // 10 yil
    keyId: 'root_ca_key',
    extensions: [
      {
        oid: '2.5.29.15', // Key Usage
        critical: true,
        value: 'keyCertSign,cRLSign'
      },
      {
        oid: '2.5.29.19', // Basic Constraints
        critical: true,
        value: 'CA:TRUE'
      }
    ]
  };

  const caResult = await pkiPlugin.initializeCAAsync(caConfig);

  if (caResult.success) {
    console.log('✅ CA initialized successfully');
    console.log('CA Certificate:', caResult.caCertificate);
    console.log('CA Key ID:', caResult.caKeyId);
    console.log('CA Subject:', caResult.subject);
  }
} catch (error) {
  console.error('❌ CA initialization failed:', error);
}
```

### getCAInfoAsync()

CA ma'lumotlarini olish.

```typescript
try {
  const caKeyId = 'root_ca_key';

  const caInfo = await pkiPlugin.getCAInfoAsync(caKeyId);

  if (caInfo.success) {
    console.log('📋 CA Information:');
    console.log('Subject:', caInfo.subject);
    console.log('Issuer:', caInfo.issuer);
    console.log('Valid From:', caInfo.notBefore);
    console.log('Valid To:', caInfo.notAfter);
    console.log('Serial Number:', caInfo.serialNumber);
    console.log('Key Algorithm:', caInfo.keyAlgorithm);
    console.log('Signature Algorithm:', caInfo.signatureAlgorithm);
    console.log('Issued Certificates:', caInfo.issuedCertificatesCount);
  }
} catch (error) {
  console.error('❌ CA info retrieval failed:', error);
}
```

## Complete Examples

### Full PKI Setup Workflow

```typescript
async function setupCompletePKI() {
  try {
    console.log('🏗️ Setting up complete PKI infrastructure...');

    // 1. Initialize Root CA
    console.log('1. Initializing Root CA...');
    const rootCAConfig = {
      subject: 'CN=Example Root CA,O=Example Organization,C=UZ',
      keySize: 4096,
      validity: 7300, // 20 years
      keyId: 'root_ca_key',
      extensions: [
        {
          oid: '2.5.29.15', // Key Usage
          critical: true,
          value: 'keyCertSign,cRLSign'
        },
        {
          oid: '2.5.29.19', // Basic Constraints
          critical: true,
          value: 'CA:TRUE'
        }
      ]
    };

    const rootCA = await pkiPlugin.initializeCAAsync(rootCAConfig);
    if (!rootCA.success) {
      throw new Error('Root CA initialization failed');
    }
    console.log('✅ Root CA initialized');

    // 2. Create Intermediate CA
    console.log('2. Creating Intermediate CA...');

    // 2a. Generate intermediate CA key pair
    const intermediateCAAKeyPair = await pkiPlugin.generateKeyPairAsync({
      algorithm: 'RSA',
      keySize: 2048,
      keyId: 'intermediate_ca_key'
    });

    // 2b. Create CSR for intermediate CA
    const intermediateCSR = await pkiPlugin.createCSRAsync({
      subject: 'CN=Example Intermediate CA,O=Example Organization,C=UZ',
      keyId: 'intermediate_ca_key',
      extensions: [
        {
          oid: '2.5.29.15', // Key Usage
          critical: true,
          value: 'keyCertSign,cRLSign'
        },
        {
          oid: '2.5.29.19', // Basic Constraints
          critical: true,
          value: 'CA:TRUE,pathlen:0'
        }
      ]
    });

    // 2c. Sign intermediate CA certificate
    const intermediateCert = await pkiPlugin.signCertificateAsync({
      csr: intermediateCSR.csr,
      validity: 3650, // 10 years
      issuerKeyId: 'root_ca_key'
    });

    console.log('✅ Intermediate CA created');

    // 3. Create End User Certificate
    console.log('3. Creating end user certificate...');

    // 3a. Generate user key pair
    const userKeyPair = await pkiPlugin.generateKeyPairAsync({
      algorithm: 'RSA',
      keySize: 2048,
      keyId: 'user_key_john_doe'
    });

    // 3b. Create user CSR
    const userCSR = await pkiPlugin.createCSRAsync({
      subject: 'CN=John Doe,O=Example Corp,OU=IT Department,L=Tashkent,C=UZ',
      keyId: 'user_key_john_doe',
      extensions: [
        {
          oid: '2.5.29.15', // Key Usage
          critical: true,
          value: 'digitalSignature,keyEncipherment'
        },
        {
          oid: '2.5.29.37', // Extended Key Usage
          critical: false,
          value: 'clientAuth,emailProtection'
        },
        {
          oid: '2.5.29.17', // Subject Alternative Name
          critical: false,
          value: 'email:john.doe@example.com'
        }
      ]
    });

    // 3c. Sign user certificate with intermediate CA
    const userCert = await pkiPlugin.signCertificateAsync({
      csr: userCSR.csr,
      validity: 365, // 1 year
      issuerKeyId: 'intermediate_ca_key'
    });

    console.log('✅ End user certificate created');

    // 4. Verify certificate chain
    console.log('4. Verifying certificate chain...');
    const chainVerification = await pkiPlugin.verifyCertificateChainAsync([
      userCert.certificate, // End entity
      intermediateCert.certificate, // Intermediate CA
      rootCA.caCertificate // Root CA
    ]);

    if (chainVerification.valid) {
      console.log('✅ Certificate chain verification successful');
    } else {
      console.log('❌ Certificate chain verification failed');
    }

    console.log('\n🎉 Complete PKI setup finished!');
    console.log('📋 PKI Summary:');
    console.log('  Root CA: Created and self-signed');
    console.log('  Intermediate CA: Created and signed by Root CA');
    console.log('  End User Cert: Created and signed by Intermediate CA');
    console.log('  Certificate Chain: Verified');

    return {
      rootCA: {
        certificate: rootCA.caCertificate,
        keyId: rootCA.caKeyId,
        subject: rootCAConfig.subject
      },
      intermediateCA: {
        certificate: intermediateCert.certificate,
        keyId: 'intermediate_ca_key',
        subject: 'CN=Example Intermediate CA,O=Example Organization,C=UZ'
      },
      userCertificate: {
        certificate: userCert.certificate,
        keyId: 'user_key_john_doe',
        subject: 'CN=John Doe,O=Example Corp,OU=IT Department,L=Tashkent,C=UZ'
      },
      chainValid: chainVerification.valid
    };
  } catch (error) {
    console.error('❌ PKI setup failed:', error);
    throw error;
  }
}
```

### Certificate Lifecycle Management

```typescript
async function certificateLifecycleManagement() {
  try {
    console.log('🔄 Starting certificate lifecycle management...');

    // 1. Create new certificate
    console.log('1. Creating new certificate...');

    const keyPair = await pkiPlugin.generateKeyPairAsync({
      algorithm: 'RSA',
      keySize: 2048,
      keyId: 'lifecycle_test_key'
    });

    const csr = await pkiPlugin.createCSRAsync({
      subject: 'CN=Lifecycle Test,O=Test Organization,C=UZ',
      keyId: 'lifecycle_test_key'
    });

    const certificate = await pkiPlugin.signCertificateAsync({
      csr: csr.csr,
      validity: 30, // Short validity for testing
      issuerKeyId: 'ca_key'
    });

    console.log('✅ Certificate created');
    console.log('Serial Number:', certificate.serialNumber);

    // 2. Monitor certificate status
    console.log('2. Monitoring certificate status...');

    const status = await pkiPlugin.getCertificateStatusAsync(
      certificate.serialNumber
    );
    console.log('Current Status:', status.status); // active, expired, revoked
    console.log('Days until expiry:', status.daysUntilExpiry);

    // 3. Renew certificate (before expiry)
    if (status.daysUntilExpiry < 7) {
      console.log('3. Renewing certificate (near expiry)...');

      const renewalCSR = await pkiPlugin.createCSRAsync({
        subject: csr.subject,
        keyId: 'lifecycle_test_key' // Same key or generate new
      });

      const renewedCert = await pkiPlugin.signCertificateAsync({
        csr: renewalCSR.csr,
        validity: 365, // New validity period
        issuerKeyId: 'ca_key'
      });

      console.log('✅ Certificate renewed');
      console.log('New Serial Number:', renewedCert.serialNumber);

      // Revoke old certificate
      await pkiPlugin.revokeCertificateAsync({
        serialNumber: certificate.serialNumber,
        reason: 'superseded',
        issuerKeyId: 'ca_key'
      });

      console.log('✅ Old certificate revoked');
    }

    // 4. Generate CRL (Certificate Revocation List)
    console.log('4. Generating CRL...');

    const crl = await pkiPlugin.generateCRLAsync({
      issuerKeyId: 'ca_key',
      validity: 7, // CRL valid for 7 days
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    if (crl.success) {
      console.log('✅ CRL generated');
      console.log('Revoked certificates:', crl.revokedCertificates.length);
    }

    // 5. Validate certificate chain
    console.log('5. Validating certificate chain...');

    const validation = await pkiPlugin.validateCertificateAsync(
      certificate.certificate,
      {
        checkRevocation: true,
        checkExpiry: true,
        trustedCAs: ['ca_certificate']
      }
    );

    console.log('Certificate valid:', validation.valid);
    console.log('Validation details:', validation.details);

    console.log('🎉 Certificate lifecycle management completed!');
  } catch (error) {
    console.error('❌ Certificate lifecycle management failed:', error);
    throw error;
  }
}
```

### Bulk Certificate Operations

```typescript
async function bulkCertificateOperations(
  userList: Array<{ name: string; email: string; department: string }>
) {
  try {
    console.log(
      `📄 Processing bulk certificate operations for ${userList.length} users...`
    );

    const results = [];
    const batchStartTime = Date.now();

    for (let i = 0; i < userList.length; i++) {
      const user = userList[i];
      const startTime = Date.now();

      try {
        console.log(
          `\n👤 Processing user ${i + 1}/${userList.length}: ${user.name}`
        );

        // 1. Generate key pair for user
        const keyId = `user_key_${user.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;

        const keyPair = await pkiPlugin.generateKeyPairAsync({
          algorithm: 'RSA',
          keySize: 2048,
          keyId: keyId
        });

        // 2. Create CSR
        const subject = `CN=${user.name},OU=${user.department},O=Example Organization,C=UZ`;

        const csr = await pkiPlugin.createCSRAsync({
          subject: subject,
          keyId: keyId,
          extensions: [
            {
              oid: '2.5.29.17', // Subject Alternative Name
              critical: false,
              value: `email:${user.email}`
            },
            {
              oid: '2.5.29.15', // Key Usage
              critical: true,
              value: 'digitalSignature,keyEncipherment'
            },
            {
              oid: '2.5.29.37', // Extended Key Usage
              critical: false,
              value: 'clientAuth,emailProtection'
            }
          ]
        });

        // 3. Sign certificate
        const certificate = await pkiPlugin.signCertificateAsync({
          csr: csr.csr,
          validity: 365,
          issuerKeyId: 'ca_key'
        });

        // 4. Validate certificate
        const validation = await pkiPlugin.validateCertificateAsync(
          certificate.certificate
        );

        const processingTime = Date.now() - startTime;

        results.push({
          index: i,
          user: user,
          keyId: keyId,
          subject: subject,
          serialNumber: certificate.serialNumber,
          certificateValid: validation.valid,
          processingTime: processingTime,
          success: true
        });

        console.log(
          `✅ User ${i + 1} processed successfully (${processingTime}ms)`
        );
        console.log(`   Key ID: ${keyId}`);
        console.log(`   Serial: ${certificate.serialNumber}`);
      } catch (error) {
        const processingTime = Date.now() - startTime;

        results.push({
          index: i,
          user: user,
          error: error.message,
          processingTime: processingTime,
          success: false
        });

        console.error(`❌ User ${i + 1} failed: ${error.message}`);
      }
    }

    const totalTime = Date.now() - batchStartTime;
    const successCount = results.filter(r => r.success).length;

    console.log('\n📊 BULK CERTIFICATE PROCESSING SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Total users: ${userList.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${userList.length - successCount}`);
    console.log(`Total time: ${totalTime}ms`);
    console.log(
      `Average time per certificate: ${(totalTime / userList.length).toFixed(2)}ms`
    );

    // Generate summary report
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
      console.log('\n📋 Generated Certificates:');
      successfulResults.forEach(result => {
        console.log(`  ${result.user.name}: ${result.serialNumber}`);
      });
    }

    // List failed certificates
    const failedResults = results.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log('\n❌ Failed Certificates:');
      failedResults.forEach(result => {
        console.log(`  ${result.user.name}: ${result.error}`);
      });
    }

    // Export certificate bundle
    console.log('\n📦 Creating certificate bundle...');
    const certificateBundle = {
      generatedAt: new Date().toISOString(),
      totalCertificates: successCount,
      certificates: successfulResults.map(r => ({
        user: r.user,
        keyId: r.keyId,
        serialNumber: r.serialNumber,
        subject: r.subject
      }))
    };

    console.log('✅ Certificate bundle created');
    console.log(
      'Bundle contains:',
      certificateBundle.certificates.length,
      'certificates'
    );

    return {
      results: results,
      summary: {
        total: userList.length,
        successful: successCount,
        failed: userList.length - successCount,
        totalTime: totalTime,
        averageTime: totalTime / userList.length
      },
      bundle: certificateBundle
    };
  } catch (error) {
    console.error('❌ Bulk certificate operations failed:', error);
    throw error;
  }
}

// Example usage
const userList = [
  { name: 'John Doe', email: 'john.doe@example.com', department: 'IT' },
  { name: 'Jane Smith', email: 'jane.smith@example.com', department: 'HR' },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    department: 'Finance'
  }
];
```

## Callback API (Legacy)

### generateKeyPair() - Callback Version

```typescript
pkiPlugin.generateKeyPair(
  {
    algorithm: 'RSA',
    keySize: 2048,
    keyId: 'test_key'
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Key pair generated');
      console.log('Key ID:', response.keyId);
    } else {
      console.error('Callback: Key generation failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Key generation error:', error);
  }
);
```

### createCSR() - Callback Version

```typescript
pkiPlugin.createCSR(
  {
    subject: 'CN=Test User,O=Test Org,C=UZ',
    keyId: 'test_key'
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: CSR created');
      console.log('CSR:', response.csr);
    }
  },
  error => {
    console.error('Callback: CSR creation error:', error);
  }
);
```

## Error Handling

### Key Generation Errors

```typescript
try {
  const result = await pkiPlugin.generateKeyPairAsync(keySpec);
} catch (error) {
  if (error.message.includes('algorithm not supported')) {
    console.error('❌ Algorithm not supported');
  } else if (error.message.includes('key size invalid')) {
    console.error('❌ Invalid key size specified');
  } else if (error.message.includes('key already exists')) {
    console.error('❌ Key with this ID already exists');
  } else if (error.message.includes('insufficient entropy')) {
    console.error('❌ Insufficient random entropy for key generation');
  } else {
    console.error('❌ Key generation error:', error.message);
  }
}
```

### Certificate Signing Errors

```typescript
try {
  const result = await pkiPlugin.signCertificateAsync(certRequest);
} catch (error) {
  if (error.message.includes('invalid CSR')) {
    console.error('❌ CSR format is invalid');
  } else if (error.message.includes('CA key not found')) {
    console.error('❌ CA private key not available');
  } else if (error.message.includes('validity period invalid')) {
    console.error('❌ Invalid validity period specified');
  } else if (error.message.includes('extension error')) {
    console.error('❌ Certificate extension processing failed');
  } else {
    console.error('❌ Certificate signing error:', error.message);
  }
}
```

## Best Practices

1.  **Key Management**: Store private keys securely and never expose them
2.  **Algorithm Selection**: Use strong algorithms (RSA 2048+ or ECDSA P-256+)
3.  **Validity Periods**: Set appropriate certificate validity periods
4.  **Extensions**: Include necessary certificate extensions
5.  **Certificate Chain**: Always validate certificate chains
6.  **Revocation**: Implement proper certificate revocation procedures
7.  **Backup**: Maintain secure backups of CA keys and certificates
8.  **Monitoring**: Monitor certificate expiry dates
9.  **Templates**: Use certificate templates for consistency
10. **Audit**: Log all PKI operations for security audit
