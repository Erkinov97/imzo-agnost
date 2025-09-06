# PKCS10 Plugin API Reference

PKCS10 plugin Certificate Signing Request (CSR) yaratish va boshqarish uchun
mo'ljallangan. Bu plugin yangi sertifikat so'rovi yaratish, CSR ni verify qilish
va Certificate Authority ga yuborish uchun ishlatiladi.

## Overview

PKCS10 plugin quyidagi funksiyalarni taqdim etadi:

- PKCS#10 Certificate Signing Request yaratish
- CSR ni digital imzolash
- CSR ma'lumotlarini extract qilish
- CSR formatini verify qilish
- Subject va Extension ma'lumotlarini boshqarish

## Import

```typescript
// ES6 import
import { pkcs10Plugin } from 'imzo-agnost';

// CommonJS
const { pkcs10Plugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.pkcs10;
```

## Types

```typescript
interface SubjectInfo {
  countryName?: string; // C
  stateOrProvinceName?: string; // ST
  localityName?: string; // L
  organizationName?: string; // O
  organizationalUnitName?: string; // OU
  commonName: string; // CN
  emailAddress?: string; // E
  serialNumber?: string; // serialNumber
  title?: string; // title
  givenName?: string; // givenName
  surname?: string; // surname
  pseudonym?: string; // pseudonym
}

interface KeyUsage {
  digitalSignature?: boolean;
  nonRepudiation?: boolean;
  keyEncipherment?: boolean;
  dataEncipherment?: boolean;
  keyAgreement?: boolean;
  keyCertSign?: boolean;
  cRLSign?: boolean;
  encipherOnly?: boolean;
  decipherOnly?: boolean;
}

interface ExtensionRequest {
  keyUsage?: KeyUsage;
  extendedKeyUsage?: string[]; // OID values
  subjectAltName?: {
    email?: string[];
    dns?: string[];
    uri?: string[];
    ip?: string[];
  };
  basicConstraints?: {
    cA?: boolean;
    pathLenConstraint?: number;
  };
  customExtensions?: {
    oid: string;
    critical: boolean;
    value: string;
  }[];
}

interface CSRRequest {
  subject: SubjectInfo;
  keyId: string; // PFX container key ID
  keySize?: number; // 2048, 3072, 4096
  hashAlgorithm?: 'SHA1' | 'SHA256' | 'SHA384' | 'SHA512';
  extensions?: ExtensionRequest;
  attributes?: {
    challengePassword?: string;
    unstructuredName?: string;
    custom?: {
      oid: string;
      value: string;
    }[];
  };
}

interface CSRResult {
  success: boolean;
  csr?: string; // Base64 encoded CSR
  keyId?: string; // Associated key ID
  subject?: string; // Subject DN string
  publicKey?: string; // Base64 encoded public key
  signature?: string; // Base64 encoded signature
  reason?: string;
}

interface CSRInfo {
  version: number;
  subject: SubjectInfo;
  subjectDN: string;
  publicKey: {
    algorithm: string;
    keySize: number;
    exponent: string;
    modulus: string;
  };
  attributes: {
    challengePassword?: string;
    unstructuredName?: string;
    extensions?: ExtensionRequest;
  };
  signature: {
    algorithm: string;
    value: string;
  };
}
```

## CSR Creation

### createCSRAsync()

PKCS#10 Certificate Signing Request yaratish.

```typescript
try {
  const csrRequest = {
    subject: {
      countryName: 'UZ',
      stateOrProvinceName: 'Toshkent',
      localityName: 'Toshkent',
      organizationName: 'My Company',
      organizationalUnitName: 'IT Department',
      commonName: 'John Doe',
      emailAddress: 'john.doe@company.uz'
    },
    keyId: 'my_signing_key',
    keySize: 2048,
    hashAlgorithm: 'SHA256' as const,
    extensions: {
      keyUsage: {
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true
      },
      extendedKeyUsage: [
        '1.3.6.1.5.5.7.3.2', // Client Authentication
        '1.3.6.1.5.5.7.3.4' // Email Protection
      ],
      subjectAltName: {
        email: ['john.doe@company.uz', 'j.doe@company.uz'],
        dns: ['john-doe.company.uz']
      }
    },
    attributes: {
      challengePassword: 'mySecretPassword123',
      unstructuredName: 'Certificate for digital signing'
    }
  };

  const result = await pkcs10Plugin.createCSRAsync(csrRequest);

  if (result.success) {
    console.log('✅ CSR created successfully');
    console.log('Subject:', result.subject);
    console.log('Key ID:', result.keyId);
    console.log('CSR (Base64):', result.csr);
    console.log('Public Key:', result.publicKey);

    // Save CSR to file or send to CA
    const csrPEM = formatCSRAsPEM(result.csr);
    console.log('CSR in PEM format:', csrPEM);
  } else {
    console.error('❌ CSR creation failed:', result.reason);
  }
} catch (error) {
  console.error('❌ CSR creation error:', error);
}
```

### createCSREnhancedAsync()

Enhanced CSR yaratish method (auto formatting, smart defaults).

```typescript
try {
  // Simple CSR with smart defaults
  const simpleCSR = await pkcs10Plugin.createCSREnhancedAsync({
    commonName: 'John Doe',
    email: 'john.doe@company.uz',
    organization: 'My Company',
    country: 'UZ',
    keyId: 'my_key'
  });

  if (simpleCSR.success) {
    console.log('✅ Simple CSR created');
    console.log('Subject DN:', simpleCSR.subjectDN);
    console.log('PEM format:', simpleCSR.pemFormat); // Auto-formatted
  }

  // Advanced CSR with full control
  const advancedCSR = await pkcs10Plugin.createCSREnhancedAsync({
    subject: {
      commonName: 'Advanced User',
      emailAddress: 'advanced@company.uz',
      organizationName: 'Advanced Corp',
      organizationalUnitName: 'Security Team',
      countryName: 'UZ',
      stateOrProvinceName: 'Toshkent',
      localityName: 'Chilonzor',
      title: 'Security Officer',
      givenName: 'Advanced',
      surname: 'User'
    },
    keyId: 'advanced_key',
    keySize: 4096,
    hashAlgorithm: 'SHA384',
    extensions: {
      keyUsage: {
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      extendedKeyUsage: [
        '1.3.6.1.5.5.7.3.2', // Client Authentication
        '1.3.6.1.5.5.7.3.4', // Email Protection
        '1.3.6.1.5.5.7.3.1' // Server Authentication
      ],
      subjectAltName: {
        email: ['advanced@company.uz', 'security@company.uz'],
        dns: ['advanced.company.uz', 'security.company.uz'],
        uri: ['https://advanced.company.uz'],
        ip: ['192.168.1.100']
      },
      basicConstraints: {
        cA: false,
        pathLenConstraint: 0
      },
      customExtensions: [
        {
          oid: '1.2.3.4.5.6.7.8.9', // Custom OID
          critical: false,
          value: 'Custom extension value'
        }
      ]
    },
    attributes: {
      challengePassword: 'SecurePassword123!',
      unstructuredName: 'Advanced Security Certificate',
      custom: [
        {
          oid: '1.2.840.113549.1.9.7', // Challenge password OID
          value: 'Additional challenge'
        }
      ]
    },
    autoFormat: true, // Auto format as PEM
    validateSubject: true, // Validate subject DN
    checkKeyUsage: true // Validate key usage combinations
  });

  if (advancedCSR.success) {
    console.log('✅ Advanced CSR created');
    console.log('Subject DN:', advancedCSR.subjectDN);
    console.log('Extensions count:', advancedCSR.extensionsCount);
    console.log('PEM format:', advancedCSR.pemFormat);
    console.log('Validation passed:', advancedCSR.validationPassed);
  }
} catch (error) {
  console.error('❌ Enhanced CSR creation error:', error);
}
```

### createCSRFromTemplateAsync()

Template dan CSR yaratish.

```typescript
try {
  // Predefined templates
  const templates = {
    emailUser: {
      keyUsage: {
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true
      },
      extendedKeyUsage: ['1.3.6.1.5.5.7.3.4'], // Email Protection
      keySize: 2048,
      hashAlgorithm: 'SHA256'
    },

    webServer: {
      keyUsage: {
        digitalSignature: true,
        keyEncipherment: true
      },
      extendedKeyUsage: ['1.3.6.1.5.5.7.3.1'], // Server Authentication
      keySize: 2048,
      hashAlgorithm: 'SHA256'
    },

    codeSign: {
      keyUsage: {
        digitalSignature: true,
        nonRepudiation: true
      },
      extendedKeyUsage: ['1.3.6.1.5.5.7.3.3'], // Code Signing
      keySize: 3072,
      hashAlgorithm: 'SHA384'
    }
  };

  const csrFromTemplate = await pkcs10Plugin.createCSRFromTemplateAsync({
    template: 'emailUser',
    subject: {
      commonName: 'Email User',
      emailAddress: 'user@company.uz',
      organizationName: 'Company',
      countryName: 'UZ'
    },
    keyId: 'email_key',
    customizations: {
      subjectAltName: {
        email: ['user@company.uz', 'backup@company.uz']
      }
    }
  });

  if (csrFromTemplate.success) {
    console.log('✅ CSR created from template');
    console.log('Template used:', csrFromTemplate.templateUsed);
    console.log('CSR:', csrFromTemplate.csr);
  }
} catch (error) {
  console.error('❌ Template CSR creation error:', error);
}
```

## CSR Information and Verification

### parseCSRAsync()

CSR ni parse qilish va ma'lumotlarini olish.

```typescript
try {
  const csrBase64 = 'MIICyz...'; // Your CSR in base64

  const csrInfo = await pkcs10Plugin.parseCSRAsync(csrBase64);

  if (csrInfo.success) {
    console.log('📋 CSR Information:');
    console.log('═══════════════════');

    // Version
    console.log('Version:', csrInfo.version);

    // Subject Information
    console.log('\n👤 Subject:');
    console.log('DN:', csrInfo.subjectDN);
    const subject = csrInfo.subject;
    if (subject.commonName) console.log('Common Name:', subject.commonName);
    if (subject.emailAddress) console.log('Email:', subject.emailAddress);
    if (subject.organizationName)
      console.log('Organization:', subject.organizationName);
    if (subject.organizationalUnitName)
      console.log('Unit:', subject.organizationalUnitName);
    if (subject.countryName) console.log('Country:', subject.countryName);
    if (subject.stateOrProvinceName)
      console.log('State:', subject.stateOrProvinceName);
    if (subject.localityName) console.log('City:', subject.localityName);

    // Public Key
    console.log('\n🔑 Public Key:');
    console.log('Algorithm:', csrInfo.publicKey.algorithm);
    console.log('Key size:', csrInfo.publicKey.keySize);
    console.log('Exponent:', csrInfo.publicKey.exponent);
    console.log('Modulus:', csrInfo.publicKey.modulus.substring(0, 50) + '...');

    // Attributes
    console.log('\n📝 Attributes:');
    if (csrInfo.attributes.challengePassword) {
      console.log('Challenge password: [Protected]');
    }
    if (csrInfo.attributes.unstructuredName) {
      console.log('Unstructured name:', csrInfo.attributes.unstructuredName);
    }

    // Extensions
    if (csrInfo.attributes.extensions) {
      console.log('\n🔧 Extensions:');
      const ext = csrInfo.attributes.extensions;

      if (ext.keyUsage) {
        console.log('Key Usage:');
        Object.entries(ext.keyUsage).forEach(([usage, enabled]) => {
          if (enabled) console.log(`  - ${usage}`);
        });
      }

      if (ext.extendedKeyUsage) {
        console.log('Extended Key Usage:');
        ext.extendedKeyUsage.forEach(oid => {
          console.log(`  - ${oid} (${getKeyUsageDescription(oid)})`);
        });
      }

      if (ext.subjectAltName) {
        console.log('Subject Alternative Name:');
        const san = ext.subjectAltName;
        if (san.email) console.log('  Emails:', san.email.join(', '));
        if (san.dns) console.log('  DNS:', san.dns.join(', '));
        if (san.uri) console.log('  URIs:', san.uri.join(', '));
        if (san.ip) console.log('  IPs:', san.ip.join(', '));
      }
    }

    // Signature
    console.log('\n✍️ Signature:');
    console.log('Algorithm:', csrInfo.signature.algorithm);
    console.log('Value:', csrInfo.signature.value.substring(0, 50) + '...');
  } else {
    console.error('❌ CSR parsing failed:', csrInfo.reason);
  }
} catch (error) {
  console.error('❌ CSR parsing error:', error);
}

function getKeyUsageDescription(oid: string): string {
  const descriptions = {
    '1.3.6.1.5.5.7.3.1': 'Server Authentication',
    '1.3.6.1.5.5.7.3.2': 'Client Authentication',
    '1.3.6.1.5.5.7.3.3': 'Code Signing',
    '1.3.6.1.5.5.7.3.4': 'Email Protection',
    '1.3.6.1.5.5.7.3.8': 'Time Stamping',
    '1.3.6.1.5.5.7.3.9': 'OCSP Signing'
  };
  return descriptions[oid] || 'Unknown';
}
```

### verifyCSRAsync()

CSR ni verify qilish.

```typescript
try {
  const csrBase64 = 'MIICyz...'; // Your CSR

  const verification = await pkcs10Plugin.verifyCSRAsync(csrBase64);

  if (verification.success) {
    console.log('✅ CSR verification results:');
    console.log('═══════════════════════════');

    // Format validation
    console.log('Format valid:', verification.formatValid ? '✅' : '❌');

    // Signature verification
    console.log('Signature valid:', verification.signatureValid ? '✅' : '❌');

    // Subject validation
    console.log('Subject valid:', verification.subjectValid ? '✅' : '❌');

    // Key pair validation
    console.log('Key pair valid:', verification.keyPairValid ? '✅' : '❌');

    // Extension validation
    console.log(
      'Extensions valid:',
      verification.extensionsValid ? '✅' : '❌'
    );

    // Overall status
    const isValid =
      verification.formatValid &&
      verification.signatureValid &&
      verification.subjectValid &&
      verification.keyPairValid &&
      verification.extensionsValid;

    console.log('\n📊 Overall Status:', isValid ? '✅ VALID' : '❌ INVALID');

    if (verification.warnings && verification.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      verification.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }

    if (verification.errors && verification.errors.length > 0) {
      console.log('\n❌ Errors:');
      verification.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
  } else {
    console.error('❌ CSR verification failed:', verification.reason);
  }
} catch (error) {
  console.error('❌ CSR verification error:', error);
}
```

### getCSRPublicKeyAsync()

CSR dan public key ni extract qilish.

```typescript
try {
  const csrBase64 = 'MIICyz...'; // Your CSR

  const publicKeyResult = await pkcs10Plugin.getCSRPublicKeyAsync(csrBase64);

  if (publicKeyResult.success) {
    console.log('🔑 Public Key Extracted:');
    console.log('Algorithm:', publicKeyResult.algorithm);
    console.log('Key size:', publicKeyResult.keySize);
    console.log('Format:', publicKeyResult.format);
    console.log('Public key (Base64):', publicKeyResult.publicKey);
    console.log('Public key (PEM):', publicKeyResult.publicKeyPEM);

    // Save public key
    await savePublicKey(
      publicKeyResult.publicKeyPEM,
      'extracted_public_key.pem'
    );
  } else {
    console.error('❌ Public key extraction failed:', publicKeyResult.reason);
  }
} catch (error) {
  console.error('❌ Public key extraction error:', error);
}
```

## CSR Utilities and Conversion

### convertCSRFormatAsync()

CSR formatini o'zgartirish (DER ↔ PEM).

```typescript
try {
  const csrBase64 = 'MIICyz...'; // DER format in base64

  // Convert DER to PEM
  const pemResult = await pkcs10Plugin.convertCSRFormatAsync(
    csrBase64,
    'DER',
    'PEM'
  );

  if (pemResult.success) {
    console.log('✅ Converted to PEM format:');
    console.log(pemResult.convertedCSR);

    // Convert back to DER
    const derResult = await pkcs10Plugin.convertCSRFormatAsync(
      pemResult.convertedCSR,
      'PEM',
      'DER'
    );

    if (derResult.success) {
      console.log('✅ Converted back to DER format');
      console.log('Original matches:', derResult.convertedCSR === csrBase64);
    }
  }
} catch (error) {
  console.error('❌ Format conversion error:', error);
}
```

### generateCSRFileNameAsync()

CSR uchun nom yaratish.

```typescript
try {
  const csrBase64 = 'MIICyz...'; // Your CSR

  const fileName = await pkcs10Plugin.generateCSRFileNameAsync(csrBase64, {
    includeSubject: true,
    includeDate: true,
    includeKeySize: true,
    format: 'sanitized' // 'sanitized' | 'original'
  });

  if (fileName.success) {
    console.log('📁 Generated file names:');
    console.log('Full name:', fileName.fullName);
    console.log('Base name:', fileName.baseName);
    console.log('Extension:', fileName.extension);
    console.log('Suggested path:', fileName.suggestedPath);

    // Example output: "JohnDoe_Company_20231215_2048_csr.pem"
  }
} catch (error) {
  console.error('❌ File name generation error:', error);
}
```

## Complete Examples

### Complete CSR Creation and Submission Workflow

```typescript
async function createAndSubmitCSR() {
  try {
    console.log('📝 Starting complete CSR workflow...');

    // 1. Prepare CSR request with comprehensive information
    console.log('1. Preparing CSR request...');

    const csrRequest = {
      subject: {
        countryName: 'UZ',
        stateOrProvinceName: 'Toshkent viloyati',
        localityName: 'Toshkent',
        organizationName: 'Digital Solutions LLC',
        organizationalUnitName: 'IT Security Department',
        commonName: 'Ulugbek Erkinov',
        emailAddress: 'ulugbek@digitalsolutions.uz',
        title: 'Senior Developer',
        givenName: 'Ulugbek',
        surname: 'Erkinov',
        serialNumber: 'EMP001234'
      },
      keyId: 'ulugbek_signing_key_2024',
      keySize: 2048,
      hashAlgorithm: 'SHA256' as const,
      extensions: {
        keyUsage: {
          digitalSignature: true,
          nonRepudiation: true,
          keyEncipherment: true,
          dataEncipherment: false,
          keyAgreement: false,
          keyCertSign: false,
          cRLSign: false
        },
        extendedKeyUsage: [
          '1.3.6.1.5.5.7.3.2', // Client Authentication
          '1.3.6.1.5.5.7.3.4' // Email Protection
        ],
        subjectAltName: {
          email: [
            'ulugbek@digitalsolutions.uz',
            'u.erkinov@digitalsolutions.uz',
            'development@digitalsolutions.uz'
          ],
          dns: ['ulugbek.digitalsolutions.uz', 'dev.digitalsolutions.uz'],
          uri: [
            'https://ulugbek.digitalsolutions.uz',
            'https://dev.digitalsolutions.uz'
          ]
        },
        basicConstraints: {
          cA: false,
          pathLenConstraint: 0
        }
      },
      attributes: {
        challengePassword: 'SecureChallenge2024!',
        unstructuredName: 'Digital signing certificate for development',
        custom: [
          {
            oid: '1.2.840.113549.1.9.14', // Extension request
            value: 'Custom attribute for CSR'
          }
        ]
      }
    };

    // 2. Create CSR
    console.log('2. Creating CSR...');
    const csrResult = await pkcs10Plugin.createCSRAsync(csrRequest);

    if (!csrResult.success) {
      throw new Error(`CSR creation failed: ${csrResult.reason}`);
    }

    console.log('✅ CSR created successfully');
    console.log('Subject DN:', csrResult.subject);
    console.log('Key ID:', csrResult.keyId);

    // 3. Verify CSR
    console.log('3. Verifying CSR...');
    const verification = await pkcs10Plugin.verifyCSRAsync(csrResult.csr);

    if (!verification.success || !verification.signatureValid) {
      throw new Error('CSR verification failed');
    }

    console.log('✅ CSR verification passed');

    // 4. Parse CSR for information
    console.log('4. Parsing CSR information...');
    const csrInfo = await pkcs10Plugin.parseCSRAsync(csrResult.csr);

    if (!csrInfo.success) {
      throw new Error('CSR parsing failed');
    }

    console.log('✅ CSR parsed successfully');

    // 5. Convert to PEM format
    console.log('5. Converting to PEM format...');
    const pemCSR = formatCSRAsPEM(csrResult.csr);

    // 6. Generate file name
    console.log('6. Generating file name...');
    const fileName = await pkcs10Plugin.generateCSRFileNameAsync(
      csrResult.csr,
      {
        includeSubject: true,
        includeDate: true,
        includeKeySize: true,
        format: 'sanitized'
      }
    );

    if (!fileName.success) {
      throw new Error('File name generation failed');
    }

    console.log('✅ File name generated:', fileName.fullName);

    // 7. Create submission package
    console.log('7. Creating submission package...');

    const submissionPackage = {
      timestamp: new Date().toISOString(),
      applicant: {
        name: `${csrRequest.subject.givenName} ${csrRequest.subject.surname}`,
        email: csrRequest.subject.emailAddress,
        organization: csrRequest.subject.organizationName,
        department: csrRequest.subject.organizationalUnitName,
        employeeId: csrRequest.subject.serialNumber
      },
      certificateRequest: {
        csr: csrResult.csr,
        csrPEM: pemCSR,
        subject: csrResult.subject,
        keyId: csrResult.keyId,
        publicKey: csrResult.publicKey,
        fileName: fileName.fullName
      },
      technicalDetails: {
        keySize: csrRequest.keySize,
        hashAlgorithm: csrRequest.hashAlgorithm,
        version: csrInfo.version,
        signatureAlgorithm: csrInfo.signature.algorithm,
        publicKeyAlgorithm: csrInfo.publicKey.algorithm
      },
      requestedUsage: {
        digitalSigning: true,
        emailProtection: true,
        clientAuthentication: true,
        serverAuthentication: false,
        codeSigning: false
      },
      extensions: {
        keyUsage: csrRequest.extensions.keyUsage,
        extendedKeyUsage: csrRequest.extensions.extendedKeyUsage,
        subjectAltName: csrRequest.extensions.subjectAltName
      },
      verification: {
        formatValid: verification.formatValid,
        signatureValid: verification.signatureValid,
        subjectValid: verification.subjectValid,
        keyPairValid: verification.keyPairValid,
        extensionsValid: verification.extensionsValid,
        overallValid: verification.success
      },
      submissionReady: true
    };

    // 8. Save files
    console.log('8. Saving files...');

    // Save CSR in PEM format
    await saveFile(`${fileName.baseName}.csr`, pemCSR);

    // Save CSR in DER format (base64)
    await saveFile(`${fileName.baseName}.der`, csrResult.csr);

    // Save submission package as JSON
    await saveFile(
      `${fileName.baseName}_package.json`,
      JSON.stringify(submissionPackage, null, 2)
    );

    // Save public key separately
    const publicKeyPEM = formatPublicKeyAsPEM(csrResult.publicKey);
    await saveFile(`${fileName.baseName}_publickey.pem`, publicKeyPEM);

    console.log('✅ Files saved successfully');

    // 9. Generate submission report
    console.log('9. Generating submission report...');

    const report = `
CERTIFICATE SIGNING REQUEST SUBMISSION REPORT
=============================================

Submission Date: ${new Date().toLocaleString()}
Applicant: ${submissionPackage.applicant.name}
Organization: ${submissionPackage.applicant.organization}
Email: ${submissionPackage.applicant.email}

CERTIFICATE REQUEST DETAILS:
---------------------------
Subject DN: ${csrResult.subject}
Key Size: ${csrRequest.keySize} bits
Hash Algorithm: ${csrRequest.hashAlgorithm}
Key ID: ${csrResult.keyId}

REQUESTED USAGE:
---------------
${Object.entries(submissionPackage.requestedUsage)
  .filter(([_, enabled]) => enabled)
  .map(([usage, _]) => `✅ ${usage.replace(/([A-Z])/g, ' $1').trim()}`)
  .join('\n')}

ALTERNATIVE NAMES:
-----------------
${
  csrRequest.extensions.subjectAltName.email
    ? 'Email addresses:\n' +
      csrRequest.extensions.subjectAltName.email
        .map(e => `  - ${e}`)
        .join('\n') +
      '\n'
    : ''
}
${
  csrRequest.extensions.subjectAltName.dns
    ? 'DNS names:\n' +
      csrRequest.extensions.subjectAltName.dns.map(d => `  - ${d}`).join('\n') +
      '\n'
    : ''
}
${
  csrRequest.extensions.subjectAltName.uri
    ? 'URIs:\n' +
      csrRequest.extensions.subjectAltName.uri.map(u => `  - ${u}`).join('\n') +
      '\n'
    : ''
}

VERIFICATION STATUS:
-------------------
Format Valid: ${verification.formatValid ? '✅' : '❌'}
Signature Valid: ${verification.signatureValid ? '✅' : '❌'}
Subject Valid: ${verification.subjectValid ? '✅' : '❌'}
Key Pair Valid: ${verification.keyPairValid ? '✅' : '❌'}
Extensions Valid: ${verification.extensionsValid ? '✅' : '❌'}

Overall Status: ${submissionPackage.verification.overallValid ? '✅ READY FOR SUBMISSION' : '❌ NEEDS ATTENTION'}

FILES GENERATED:
---------------
1. ${fileName.baseName}.csr - Certificate request (PEM format)
2. ${fileName.baseName}.der - Certificate request (DER format)
3. ${fileName.baseName}_publickey.pem - Public key (PEM format)
4. ${fileName.baseName}_package.json - Complete submission package
5. ${fileName.baseName}_report.txt - This report

NEXT STEPS:
----------
1. Review all generated files
2. Submit the CSR file to your Certificate Authority
3. Keep the private key secure and backed up
4. Wait for certificate issuance
5. Install the issued certificate with the corresponding private key

Note: The private key remains in your secure key container (${csrResult.keyId}).
Never share or export the private key unless absolutely necessary.
`;

    await saveFile(`${fileName.baseName}_report.txt`, report);

    console.log('✅ Submission report generated');

    // 10. Final summary
    console.log('\n🎉 Complete CSR workflow finished successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 Summary:');
    console.log(`Subject: ${submissionPackage.applicant.name}`);
    console.log(`Organization: ${submissionPackage.applicant.organization}`);
    console.log(`Key Size: ${csrRequest.keySize} bits`);
    console.log(`Files generated: 5`);
    console.log(`Base filename: ${fileName.baseName}`);
    console.log(
      `Verification: ${submissionPackage.verification.overallValid ? 'PASSED' : 'FAILED'}`
    );
    console.log(
      `Status: ${submissionPackage.submissionReady ? 'READY FOR SUBMISSION' : 'NEEDS REVIEW'}`
    );

    return {
      success: true,
      submissionPackage: submissionPackage,
      files: {
        csr: `${fileName.baseName}.csr`,
        der: `${fileName.baseName}.der`,
        publicKey: `${fileName.baseName}_publickey.pem`,
        package: `${fileName.baseName}_package.json`,
        report: `${fileName.baseName}_report.txt`
      },
      summary: {
        applicant: submissionPackage.applicant.name,
        organization: submissionPackage.applicant.organization,
        keySize: csrRequest.keySize,
        verification: submissionPackage.verification.overallValid,
        submissionReady: submissionPackage.submissionReady
      }
    };
  } catch (error) {
    console.error('❌ Complete CSR workflow failed:', error);
    throw error;
  }
}

// Helper functions
function formatCSRAsPEM(base64CSR: string): string {
  const csrBody = base64CSR.replace(/(.{64})/g, '$1\n');
  return `-----BEGIN CERTIFICATE REQUEST-----\n${csrBody}\n-----END CERTIFICATE REQUEST-----`;
}

function formatPublicKeyAsPEM(base64PublicKey: string): string {
  const keyBody = base64PublicKey.replace(/(.{64})/g, '$1\n');
  return `-----BEGIN PUBLIC KEY-----\n${keyBody}\n-----END PUBLIC KEY-----`;
}

async function saveFile(fileName: string, content: string): Promise<void> {
  // In real application, this would save to file system
  console.log(`💾 Saving ${fileName} (${content.length} characters)`);
  // Implementation depends on environment (Node.js fs, browser download, etc.)
}
```

### CSR Batch Creation

```typescript
async function createMultipleCSRs(requests: any[]) {
  try {
    console.log(`📝 Creating ${requests.length} CSRs in batch...`);

    const results = [];
    const errors = [];

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];

      try {
        console.log(
          `Creating CSR ${i + 1}/${requests.length} for ${request.subject.commonName}...`
        );

        const result = await pkcs10Plugin.createCSRAsync(request);

        if (result.success) {
          // Verify each CSR
          const verification = await pkcs10Plugin.verifyCSRAsync(result.csr);

          results.push({
            index: i,
            commonName: request.subject.commonName,
            keyId: request.keyId,
            success: true,
            csr: result.csr,
            subject: result.subject,
            verified: verification.success && verification.signatureValid
          });

          console.log(`✅ CSR ${i + 1} created and verified`);
        } else {
          errors.push({
            index: i,
            commonName: request.subject.commonName,
            keyId: request.keyId,
            error: result.reason
          });

          console.log(`❌ CSR ${i + 1} failed: ${result.reason}`);
        }
      } catch (error) {
        errors.push({
          index: i,
          commonName: request.subject.commonName,
          keyId: request.keyId,
          error: error.message
        });

        console.log(`❌ CSR ${i + 1} error: ${error.message}`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Generate batch report
    console.log('\n📊 Batch Creation Report:');
    console.log('═══════════════════════════');
    console.log(`Total requests: ${requests.length}`);
    console.log(`Successful: ${results.length}`);
    console.log(`Failed: ${errors.length}`);
    console.log(
      `Success rate: ${((results.length / requests.length) * 100).toFixed(1)}%`
    );

    if (results.length > 0) {
      console.log('\n✅ Successful CSRs:');
      results.forEach(result => {
        console.log(
          `  ${result.index + 1}. ${result.commonName} (Key: ${result.keyId}) - ${result.verified ? 'Verified' : 'Not verified'}`
        );
      });
    }

    if (errors.length > 0) {
      console.log('\n❌ Failed CSRs:');
      errors.forEach(error => {
        console.log(
          `  ${error.index + 1}. ${error.commonName} (Key: ${error.keyId}) - ${error.error}`
        );
      });
    }

    return {
      success: results.length > 0,
      totalRequests: requests.length,
      successful: results.length,
      failed: errors.length,
      successRate: (results.length / requests.length) * 100,
      results: results,
      errors: errors
    };
  } catch (error) {
    console.error('❌ Batch CSR creation failed:', error);
    throw error;
  }
}
```

## Callback API (Legacy)

### createCSR() - Callback Version

```typescript
pkcs10Plugin.createCSR(
  csrRequest,
  (event, response) => {
    if (response.success) {
      console.log('Callback: CSR created');
      console.log('Subject:', response.subject);
      console.log('CSR:', response.csr);
    } else {
      console.error('Callback: CSR creation failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: CSR creation error:', error);
  }
);
```

### verifyCSR() - Callback Version

```typescript
pkcs10Plugin.verifyCSR(
  csrBase64,
  (event, response) => {
    if (response.success) {
      console.log('Callback: CSR verified');
      console.log('Valid:', response.signatureValid);
    } else {
      console.error('Callback: CSR verification failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: CSR verification error:', error);
  }
);
```

## Error Handling

### CSR Creation Errors

```typescript
try {
  const result = await pkcs10Plugin.createCSRAsync(csrRequest);
} catch (error) {
  if (error.message.includes('key not found')) {
    console.error('❌ Private key not found in container');
  } else if (error.message.includes('invalid subject')) {
    console.error('❌ Subject DN is invalid');
  } else if (error.message.includes('invalid key usage')) {
    console.error('❌ Key usage combination is invalid');
  } else if (error.message.includes('signing failed')) {
    console.error('❌ CSR signing failed');
  } else {
    console.error('❌ CSR creation error:', error.message);
  }
}
```

### CSR Verification Errors

```typescript
try {
  const result = await pkcs10Plugin.verifyCSRAsync(csrBase64);
} catch (error) {
  if (error.message.includes('invalid format')) {
    console.error('❌ CSR format is invalid');
  } else if (error.message.includes('corrupted data')) {
    console.error('❌ CSR data is corrupted');
  } else if (error.message.includes('unsupported algorithm')) {
    console.error('❌ Signature algorithm not supported');
  } else {
    console.error('❌ CSR verification error:', error.message);
  }
}
```

## Best Practices

1.  **Subject DN**: Always provide complete and valid subject DN information
2.  **Key Usage**: Carefully select appropriate key usage extensions
3.  **Validation**: Always verify CSR before submission
4.  **File Management**: Use descriptive file names and organize CSR files
    properly
5.  **Security**: Protect challenge passwords and private keys
6.  **Documentation**: Maintain records of CSR submissions and their purposes
7.  **Backup**: Keep backup copies of CSR files and submission packages
8.  **Standards Compliance**: Follow PKI standards and CA requirements
9.  **Testing**: Test CSR creation and verification in development environment
10. **Monitoring**: Track CSR submission status and certificate issuance
