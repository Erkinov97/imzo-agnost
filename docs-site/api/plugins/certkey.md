# CertKey Plugin API Reference

CertKey plugin sertifikat va kalit juftlari bilan ishlash uchun mo'ljallangan.
Bu plugin sertifikat va private key larni bir vaqtda boshqarish, import/export
qilish va key-certificate binding operatsiyalarini bajarish uchun ishlatiladi.

## Overview

CertKey plugin quyidagi funksiyalarni taqdim etadi:

- Sertifikat va kalit juftlarini birga boshqarish
- Certificate-Private Key binding
- Import va export operatsiyalari
- Key-Certificate validation
- Certificate chain building
- Cross-platform key storage

## Import

```typescript
// ES6 import
import { certKeyPlugin } from 'imzo-agnost';

// CommonJS
const { certKeyPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.certKey;
```

## Types

```typescript
interface CertKeyPair {
  certificateId: string;
  privateKeyId: string;
  certificate: string; // Base64 encoded certificate
  publicKey: string; // Base64 encoded public key
  privateKeyPresent: boolean;
  keyAlgorithm: string;
  keySize: number;
  usage: string[]; // Key usage purposes
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  fingerprint: string;
}

interface CertKeyBinding {
  bindingId: string;
  certificateId: string;
  privateKeyId: string;
  bindingStatus: 'bound' | 'unbound' | 'invalid';
  keyMatch: boolean; // Public key matches private key
  created: string;
  lastVerified: string;
}

interface ImportParams {
  certificate: string; // Base64 certificate
  privateKey?: string; // Base64 private key
  passphrase?: string; // Private key passphrase
  keyId?: string; // Custom key ID
  certId?: string; // Custom certificate ID
  bindAutomatically?: boolean; // Auto-bind cert and key
  overwrite?: boolean; // Overwrite existing
  validateKeyPair?: boolean; // Validate key pair matching
}

interface ExportParams {
  bindingId?: string; // Export specific binding
  certificateId?: string; // Export specific certificate
  privateKeyId?: string; // Export specific private key
  format: 'PEM' | 'DER' | 'P12' | 'PFX';
  includePrivateKey: boolean;
  includeCertificateChain: boolean;
  password?: string; // For P12/PFX export
  encryptPrivateKey?: boolean; // Encrypt private key in PEM
}

interface ValidationResult {
  valid: boolean;
  keyPairMatch: boolean;
  certificateValid: boolean;
  privateKeyValid: boolean;
  publicKeyMatch: boolean;
  algorithmMatch: boolean;
  errors: string[];
  warnings: string[];
}

interface CertKeyInfo {
  bindingId: string;
  certificate: {
    id: string;
    subject: string;
    issuer: string;
    serialNumber: string;
    validFrom: string;
    validTo: string;
    keyUsage: string[];
    algorithm: string;
    keySize: number;
    fingerprint: string;
  };
  privateKey: {
    id: string;
    algorithm: string;
    keySize: number;
    usage: string[];
    encrypted: boolean;
    exportable: boolean;
  };
  binding: {
    status: string;
    created: string;
    lastVerified: string;
    valid: boolean;
  };
}
```

## Certificate-Key Import Operations

### importCertKeyPairAsync()

Sertifikat va private key ni birga import qilish.

```typescript
try {
  const certificatePEM = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK...
-----END CERTIFICATE-----`;

  const privateKeyPEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0B...
-----END PRIVATE KEY-----`;

  console.log('📥 Importing certificate-key pair...');

  const importResult = await certKeyPlugin.importCertKeyPairAsync({
    certificate: certificatePEM,
    privateKey: privateKeyPEM,
    passphrase: 'mySecretPassword', // If private key is encrypted
    bindAutomatically: true, // Auto-bind after import
    validateKeyPair: true, // Validate key pair matching
    overwrite: false, // Don't overwrite existing
    keyId: 'my_private_key_2024', // Custom key ID
    certId: 'my_certificate_2024' // Custom certificate ID
  });

  if (importResult.success) {
    console.log('✅ Certificate-key pair imported successfully');
    console.log('Certificate ID:', importResult.certificateId);
    console.log('Private Key ID:', importResult.privateKeyId);
    console.log('Binding ID:', importResult.bindingId);
    console.log('Auto-bound:', importResult.autoBound ? 'Yes' : 'No');

    // Validation results
    if (importResult.validation) {
      const validation = importResult.validation;
      console.log('\n🔍 Validation Results:');
      console.log('Key pair match:', validation.keyPairMatch ? '✅' : '❌');
      console.log(
        'Certificate valid:',
        validation.certificateValid ? '✅' : '❌'
      );
      console.log(
        'Private key valid:',
        validation.privateKeyValid ? '✅' : '❌'
      );
      console.log('Algorithm match:', validation.algorithmMatch ? '✅' : '❌');

      if (validation.errors.length > 0) {
        console.log('\n❌ Validation Errors:');
        validation.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (validation.warnings.length > 0) {
        console.log('\n⚠️ Validation Warnings:');
        validation.warnings.forEach(warning => console.log(`  - ${warning}`));
      }
    }

    // Certificate information
    if (importResult.certificateInfo) {
      const certInfo = importResult.certificateInfo;
      console.log('\n📄 Certificate Information:');
      console.log('Subject:', certInfo.subject);
      console.log('Issuer:', certInfo.issuer);
      console.log('Serial Number:', certInfo.serialNumber);
      console.log('Valid From:', new Date(certInfo.validFrom).toLocaleString());
      console.log('Valid To:', new Date(certInfo.validTo).toLocaleString());
      console.log('Key Algorithm:', certInfo.keyAlgorithm);
      console.log('Key Size:', certInfo.keySize);
      console.log('Key Usage:', certInfo.usage.join(', '));
    }

    return {
      bindingId: importResult.bindingId,
      certificateId: importResult.certificateId,
      privateKeyId: importResult.privateKeyId
    };
  } else {
    console.error('❌ Import failed:', importResult.reason);
  }
} catch (error) {
  console.error('❌ Import error:', error);
}
```

### importCertificateAsync()

Faqat sertifikatni import qilish.

```typescript
try {
  const certificateBase64 = 'MIIDXTCCAkW...'; // Certificate in base64

  console.log('📥 Importing certificate...');

  const certImport = await certKeyPlugin.importCertificateAsync({
    certificate: certificateBase64,
    format: 'DER', // DER format
    certId: 'imported_cert_2024',
    overwrite: false,
    validate: true,
    extractPublicKey: true // Extract and store public key
  });

  if (certImport.success) {
    console.log('✅ Certificate imported');
    console.log('Certificate ID:', certImport.certificateId);
    console.log('Public Key ID:', certImport.publicKeyId);
    console.log('Subject:', certImport.subject);
    console.log('Issuer:', certImport.issuer);
    console.log('Fingerprint:', certImport.fingerprint);

    // Check if matching private key exists
    const matchingKey = await certKeyPlugin.findMatchingPrivateKeyAsync(
      certImport.certificateId
    );

    if (matchingKey.found) {
      console.log('\n🔑 Matching private key found!');
      console.log('Private Key ID:', matchingKey.privateKeyId);
      console.log('Auto-binding suggested');

      // Optionally auto-bind
      const binding = await certKeyPlugin.bindCertKeyAsync(
        certImport.certificateId,
        matchingKey.privateKeyId
      );

      if (binding.success) {
        console.log('✅ Auto-bound with existing private key');
        console.log('Binding ID:', binding.bindingId);
      }
    } else {
      console.log('\n🔍 No matching private key found');
      console.log('Certificate imported without private key binding');
    }

    return certImport.certificateId;
  } else {
    console.error('❌ Certificate import failed:', certImport.reason);
  }
} catch (error) {
  console.error('❌ Certificate import error:', error);
}
```

### importPrivateKeyAsync()

Faqat private key ni import qilish.

```typescript
try {
  const privateKeyPKCS8 = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0B...
-----END PRIVATE KEY-----`;

  console.log('🔐 Importing private key...');

  const keyImport = await certKeyPlugin.importPrivateKeyAsync({
    privateKey: privateKeyPKCS8,
    format: 'PKCS8',
    passphrase: 'keyPassword123',
    keyId: 'imported_private_key_2024',
    usage: ['signing', 'keyAgreement'],
    exportable: true,
    overwrite: false,
    extractPublicKey: true
  });

  if (keyImport.success) {
    console.log('✅ Private key imported');
    console.log('Private Key ID:', keyImport.privateKeyId);
    console.log('Public Key ID:', keyImport.publicKeyId);
    console.log('Algorithm:', keyImport.algorithm);
    console.log('Key Size:', keyImport.keySize);
    console.log('Usage:', keyImport.usage.join(', '));
    console.log('Exportable:', keyImport.exportable ? 'Yes' : 'No');

    // Check for matching certificate
    const matchingCert = await certKeyPlugin.findMatchingCertificateAsync(
      keyImport.privateKeyId
    );

    if (matchingCert.found) {
      console.log('\n📄 Matching certificate found!');
      console.log('Certificate ID:', matchingCert.certificateId);
      console.log('Subject:', matchingCert.subject);

      // Auto-bind
      const binding = await certKeyPlugin.bindCertKeyAsync(
        matchingCert.certificateId,
        keyImport.privateKeyId
      );

      if (binding.success) {
        console.log('✅ Auto-bound with existing certificate');
        console.log('Binding ID:', binding.bindingId);
      }
    } else {
      console.log('\n🔍 No matching certificate found');
      console.log('Private key imported without certificate binding');
    }

    return keyImport.privateKeyId;
  } else {
    console.error('❌ Private key import failed:', keyImport.reason);
  }
} catch (error) {
  console.error('❌ Private key import error:', error);
}
```

## Certificate-Key Binding Operations

### bindCertKeyAsync()

Sertifikat va private key ni bind qilish.

```typescript
try {
  const certificateId = 'my_certificate_2024';
  const privateKeyId = 'my_private_key_2024';

  console.log('🔗 Binding certificate and private key...');

  const bindingResult = await certKeyPlugin.bindCertKeyAsync(
    certificateId,
    privateKeyId,
    {
      validateKeyPair: true, // Validate key pair matching
      forceBind: false, // Don't force invalid bindings
      bindingId: 'custom_binding_id', // Custom binding ID
      metadata: {
        // Additional metadata
        purpose: 'Digital signing',
        department: 'IT Security',
        owner: 'John Doe'
      }
    }
  );

  if (bindingResult.success) {
    console.log('✅ Certificate-key binding created');
    console.log('Binding ID:', bindingResult.bindingId);
    console.log('Certificate ID:', bindingResult.certificateId);
    console.log('Private Key ID:', bindingResult.privateKeyId);
    console.log('Key pair valid:', bindingResult.keyPairValid ? '✅' : '❌');

    // Binding validation
    if (bindingResult.validation) {
      const validation = bindingResult.validation;
      console.log('\n🔍 Binding Validation:');
      console.log('Public key match:', validation.publicKeyMatch ? '✅' : '❌');
      console.log('Algorithm match:', validation.algorithmMatch ? '✅' : '❌');
      console.log('Key size match:', validation.keySizeMatch ? '✅' : '❌');

      if (!validation.valid) {
        console.log('\n⚠️ Binding issues detected:');
        validation.errors.forEach(error => console.log(`  - ${error}`));
      }
    }

    // Store binding information
    const bindingInfo = {
      bindingId: bindingResult.bindingId,
      certificateId: certificateId,
      privateKeyId: privateKeyId,
      created: new Date().toISOString(),
      valid: bindingResult.keyPairValid,
      metadata: bindingResult.metadata
    };

    console.log('\n📋 Binding created:', JSON.stringify(bindingInfo, null, 2));

    return bindingResult.bindingId;
  } else {
    console.error('❌ Binding failed:', bindingResult.reason);

    if (bindingResult.errors) {
      console.log('\nError details:');
      bindingResult.errors.forEach(error => console.log(`  - ${error}`));
    }
  }
} catch (error) {
  console.error('❌ Binding error:', error);
}
```

### unbindCertKeyAsync()

Sertifikat va private key binding ni bekor qilish.

```typescript
try {
  const bindingId = 'my_cert_key_binding';

  console.log('🔓 Unbinding certificate and private key...');

  const unbindResult = await certKeyPlugin.unbindCertKeyAsync(bindingId, {
    preserveCertificate: true, // Keep certificate
    preservePrivateKey: true, // Keep private key
    createBackup: true, // Backup binding info
    reason: 'Key rotation' // Reason for unbinding
  });

  if (unbindResult.success) {
    console.log('✅ Certificate-key binding removed');
    console.log('Binding ID:', unbindResult.bindingId);
    console.log(
      'Certificate preserved:',
      unbindResult.certificatePreserved ? 'Yes' : 'No'
    );
    console.log(
      'Private key preserved:',
      unbindResult.privateKeyPreserved ? 'Yes' : 'No'
    );
    console.log('Backup created:', unbindResult.backupCreated ? 'Yes' : 'No');

    if (unbindResult.backupPath) {
      console.log('Backup location:', unbindResult.backupPath);
    }

    console.log('Unbinding reason:', unbindResult.reason);
    console.log('Unbinding time:', new Date().toLocaleString());
  } else {
    console.error('❌ Unbinding failed:', unbindResult.reason);
  }
} catch (error) {
  console.error('❌ Unbinding error:', error);
}
```

### validateCertKeyBindingAsync()

Certificate-key binding ni validate qilish.

```typescript
try {
  const bindingId = 'my_cert_key_binding';

  console.log('🔍 Validating certificate-key binding...');

  const validationResult = await certKeyPlugin.validateCertKeyBindingAsync(
    bindingId,
    {
      checkKeyPairMatch: true, // Check public/private key match
      checkCertificateValidity: true, // Check certificate validity
      checkKeyUsage: true, // Check key usage compatibility
      strictMode: true, // Strict validation
      validateChain: false // Don't validate full chain
    }
  );

  if (validationResult.success) {
    console.log('✅ Binding validation completed');

    const validation = validationResult.validation;

    console.log('\n🔍 Validation Results:');
    console.log('═══════════════════════');
    console.log('Overall valid:', validation.valid ? '✅' : '❌');
    console.log('Key pair match:', validation.keyPairMatch ? '✅' : '❌');
    console.log(
      'Certificate valid:',
      validation.certificateValid ? '✅' : '❌'
    );
    console.log('Private key valid:', validation.privateKeyValid ? '✅' : '❌');
    console.log('Public key match:', validation.publicKeyMatch ? '✅' : '❌');
    console.log('Algorithm match:', validation.algorithmMatch ? '✅' : '❌');

    // Detailed analysis
    if (validation.keyPairMatch) {
      console.log('\n🔑 Key Pair Analysis:');
      console.log('Public key from certificate matches private key: ✅');
      console.log('Cryptographic verification: Passed');
    } else {
      console.log('\n⚠️ Key Pair Mismatch:');
      console.log('Public key from certificate does not match private key');
      console.log(
        'This binding should not be used for cryptographic operations'
      );
    }

    // Certificate validity
    if (validation.certificateValid) {
      console.log('\n📄 Certificate Status: ✅ Valid');
    } else {
      console.log('\n⚠️ Certificate Issues:');
      validation.errors
        .filter(error => error.includes('certificate'))
        .forEach(error => console.log(`  - ${error}`));
    }

    // Key validity
    if (validation.privateKeyValid) {
      console.log('\n🔐 Private Key Status: ✅ Valid');
    } else {
      console.log('\n⚠️ Private Key Issues:');
      validation.errors
        .filter(error => error.includes('private key'))
        .forEach(error => console.log(`  - ${error}`));
    }

    // Warnings
    if (validation.warnings.length > 0) {
      console.log('\n⚠️ Validation Warnings:');
      validation.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    // Errors
    if (validation.errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      validation.errors.forEach(error => console.log(`  - ${error}`));
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (validation.valid) {
      console.log('✅ Binding is valid and can be used safely');
      console.log('• Use for digital signing and encryption operations');
      console.log('• Regular monitoring recommended');
    } else {
      console.log('❌ Binding has issues and should be reviewed');
      if (!validation.keyPairMatch) {
        console.log('• Do not use for cryptographic operations');
        console.log('• Verify certificate and private key sources');
        console.log('• Consider re-importing the certificate-key pair');
      }
      if (!validation.certificateValid) {
        console.log('• Check certificate validity period');
        console.log('• Verify certificate has not been revoked');
      }
    }

    return validation;
  } else {
    console.error('❌ Binding validation failed:', validationResult.reason);
  }
} catch (error) {
  console.error('❌ Binding validation error:', error);
}
```

## Certificate-Key Information and Management

### getCertKeyInfoAsync()

Certificate-key binding haqida to'liq ma'lumot olish.

```typescript
try {
  const bindingId = 'my_cert_key_binding';

  console.log('📋 Getting certificate-key binding information...');

  const infoResult = await certKeyPlugin.getCertKeyInfoAsync(bindingId);

  if (infoResult.success) {
    const info = infoResult.certKeyInfo;

    console.log('✅ Certificate-Key Binding Information:');
    console.log('════════════════════════════════════════');

    // Binding details
    console.log('\n🔗 Binding Details:');
    console.log('Binding ID:', info.bindingId);
    console.log('Status:', info.binding.status);
    console.log('Created:', new Date(info.binding.created).toLocaleString());
    console.log(
      'Last Verified:',
      new Date(info.binding.lastVerified).toLocaleString()
    );
    console.log('Valid:', info.binding.valid ? '✅' : '❌');

    // Certificate information
    console.log('\n📄 Certificate Information:');
    console.log('Certificate ID:', info.certificate.id);
    console.log('Subject:', info.certificate.subject);
    console.log('Issuer:', info.certificate.issuer);
    console.log('Serial Number:', info.certificate.serialNumber);
    console.log(
      'Valid From:',
      new Date(info.certificate.validFrom).toLocaleString()
    );
    console.log(
      'Valid To:',
      new Date(info.certificate.validTo).toLocaleString()
    );
    console.log('Algorithm:', info.certificate.algorithm);
    console.log('Key Size:', info.certificate.keySize);
    console.log('Fingerprint:', info.certificate.fingerprint);
    console.log('Key Usage:', info.certificate.keyUsage.join(', '));

    // Check certificate validity
    const now = new Date();
    const validTo = new Date(info.certificate.validTo);
    const daysUntilExpiry = Math.ceil(
      (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry > 0) {
      console.log(`Days until expiry: ${daysUntilExpiry}`);
      if (daysUntilExpiry < 30) {
        console.log('⚠️ Certificate expires soon!');
      }
    } else {
      console.log(
        `❌ Certificate expired ${Math.abs(daysUntilExpiry)} days ago`
      );
    }

    // Private key information
    console.log('\n🔐 Private Key Information:');
    console.log('Private Key ID:', info.privateKey.id);
    console.log('Algorithm:', info.privateKey.algorithm);
    console.log('Key Size:', info.privateKey.keySize);
    console.log('Usage:', info.privateKey.usage.join(', '));
    console.log('Encrypted:', info.privateKey.encrypted ? 'Yes' : 'No');
    console.log('Exportable:', info.privateKey.exportable ? 'Yes' : 'No');

    // Compatibility check
    console.log('\n🔍 Compatibility Analysis:');
    const algorithmMatch =
      info.certificate.algorithm === info.privateKey.algorithm;
    const keySizeMatch = info.certificate.keySize === info.privateKey.keySize;

    console.log('Algorithm match:', algorithmMatch ? '✅' : '❌');
    console.log('Key size match:', keySizeMatch ? '✅' : '❌');

    if (algorithmMatch && keySizeMatch) {
      console.log('✅ Certificate and private key are compatible');
    } else {
      console.log(
        '⚠️ Certificate and private key compatibility issues detected'
      );
    }

    // Usage analysis
    console.log('\n🎯 Usage Analysis:');
    const certUsage = info.certificate.keyUsage;
    const keyUsage = info.privateKey.usage;

    const canSign =
      certUsage.includes('digitalSignature') ||
      certUsage.includes('nonRepudiation');
    const canEncrypt =
      certUsage.includes('keyEncipherment') ||
      certUsage.includes('dataEncipherment');
    const canAuth = certUsage.includes('digitalSignature');

    console.log('Digital Signing:', canSign ? '✅' : '❌');
    console.log('Encryption:', canEncrypt ? '✅' : '❌');
    console.log('Authentication:', canAuth ? '✅' : '❌');

    // Security assessment
    console.log('\n🛡️ Security Assessment:');
    const keySize = info.certificate.keySize;
    let securityLevel = 'Unknown';

    if (info.certificate.algorithm.includes('RSA')) {
      if (keySize >= 3072) securityLevel = 'High';
      else if (keySize >= 2048) securityLevel = 'Medium';
      else securityLevel = 'Low';
    } else if (info.certificate.algorithm.includes('EC')) {
      if (keySize >= 384) securityLevel = 'High';
      else if (keySize >= 256) securityLevel = 'Medium';
      else securityLevel = 'Low';
    }

    console.log('Security Level:', securityLevel);

    if (securityLevel === 'Low') {
      console.log('⚠️ Key size is below current security recommendations');
    }

    return info;
  } else {
    console.error('❌ Failed to get binding information:', infoResult.reason);
  }
} catch (error) {
  console.error('❌ Get info error:', error);
}
```

### listCertKeyBindingsAsync()

Barcha certificate-key bindinglarni ro'yxatlash.

```typescript
try {
  console.log('📋 Listing all certificate-key bindings...');

  const listResult = await certKeyPlugin.listCertKeyBindingsAsync({
    status: 'bound', // Filter by status ('bound', 'unbound', 'invalid')
    algorithm: 'RSA', // Filter by algorithm
    keySize: 2048, // Filter by key size
    usage: ['digitalSignature'], // Filter by usage
    validOnly: true, // Only valid bindings
    sortBy: 'created', // Sort by field
    sortOrder: 'desc', // Sort order
    limit: 50, // Limit results
    includeExpired: false // Exclude expired certificates
  });

  if (listResult.success) {
    const bindings = listResult.bindings;

    console.log('✅ Certificate-Key Bindings Found:');
    console.log(`Total bindings: ${bindings.length}`);
    console.log('═══════════════════════════════════════');

    bindings.forEach((binding, index) => {
      console.log(`\n${index + 1}. ${binding.bindingId}`);
      console.log(`   Status: ${binding.bindingStatus}`);
      console.log(`   Certificate: ${binding.certificate.subject}`);
      console.log(
        `   Algorithm: ${binding.certificate.algorithm} (${binding.certificate.keySize} bits)`
      );
      console.log(
        `   Valid Until: ${new Date(binding.certificate.validTo).toLocaleDateString()}`
      );
      console.log(`   Key Usage: ${binding.certificate.keyUsage.join(', ')}`);
      console.log(
        `   Created: ${new Date(binding.binding.created).toLocaleDateString()}`
      );
      console.log(`   Valid: ${binding.binding.valid ? '✅' : '❌'}`);

      // Check expiry
      const now = new Date();
      const validTo = new Date(binding.certificate.validTo);
      const daysUntilExpiry = Math.ceil(
        (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 0) {
        console.log('   ⚠️ EXPIRED');
      } else if (daysUntilExpiry < 30) {
        console.log(`   ⚠️ Expires in ${daysUntilExpiry} days`);
      }
    });

    // Statistics
    console.log('\n📊 Statistics:');
    const stats = {
      total: bindings.length,
      valid: bindings.filter(b => b.binding.valid).length,
      invalid: bindings.filter(b => !b.binding.valid).length,
      expired: bindings.filter(
        b => new Date(b.certificate.validTo) < new Date()
      ).length,
      expiringSoon: bindings.filter(b => {
        const daysLeft = Math.ceil(
          (new Date(b.certificate.validTo).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysLeft > 0 && daysLeft < 30;
      }).length
    };

    console.log(`Valid bindings: ${stats.valid}`);
    console.log(`Invalid bindings: ${stats.invalid}`);
    console.log(`Expired certificates: ${stats.expired}`);
    console.log(`Expiring soon (< 30 days): ${stats.expiringSoon}`);

    // Group by algorithm
    const byAlgorithm = bindings.reduce((groups, binding) => {
      const algorithm = binding.certificate.algorithm;
      if (!groups[algorithm]) groups[algorithm] = [];
      groups[algorithm].push(binding);
      return groups;
    }, {});

    console.log('\n📈 By Algorithm:');
    Object.entries(byAlgorithm).forEach(([algorithm, bindingList]) => {
      console.log(`${algorithm}: ${bindingList.length} bindings`);
    });

    return bindings;
  } else {
    console.error('❌ Failed to list bindings:', listResult.reason);
  }
} catch (error) {
  console.error('❌ List bindings error:', error);
}
```

## Export Operations

### exportCertKeyPairAsync()

Certificate-key pair ni export qilish.

```typescript
try {
  const bindingId = 'my_cert_key_binding';

  console.log('📤 Exporting certificate-key pair...');

  // Export as P12/PFX
  const p12Export = await certKeyPlugin.exportCertKeyPairAsync({
    bindingId: bindingId,
    format: 'P12',
    includePrivateKey: true,
    includeCertificateChain: true,
    password: 'exportPassword123',
    encryptPrivateKey: true,
    friendlyName: 'My Certificate'
  });

  if (p12Export.success) {
    console.log('✅ P12 export successful');
    console.log('Export format:', p12Export.format);
    console.log('File size:', p12Export.data.length, 'characters (base64)');
    console.log(
      'Includes private key:',
      p12Export.includesPrivateKey ? 'Yes' : 'No'
    );
    console.log(
      'Includes certificate chain:',
      p12Export.includesCertificateChain ? 'Yes' : 'No'
    );
    console.log(
      'Password protected:',
      p12Export.passwordProtected ? 'Yes' : 'No'
    );

    // Save to file (in real application)
    const fileName = `cert_key_export_${Date.now()}.p12`;
    await saveExportedFile(fileName, p12Export.data, 'binary');
    console.log('Saved as:', fileName);
  }

  // Export as PEM
  const pemExport = await certKeyPlugin.exportCertKeyPairAsync({
    bindingId: bindingId,
    format: 'PEM',
    includePrivateKey: true,
    includeCertificateChain: false,
    encryptPrivateKey: true,
    privateKeyPassword: 'pemPassword123'
  });

  if (pemExport.success) {
    console.log('\n✅ PEM export successful');
    console.log(
      'Certificate PEM:',
      pemExport.certificatePEM.substring(0, 100) + '...'
    );
    console.log(
      'Private Key PEM:',
      pemExport.privateKeyPEM.substring(0, 100) + '...'
    );
    console.log(
      'Private key encrypted:',
      pemExport.privateKeyEncrypted ? 'Yes' : 'No'
    );

    // Save separate files
    await saveExportedFile(
      `certificate_${Date.now()}.crt`,
      pemExport.certificatePEM,
      'text'
    );
    await saveExportedFile(
      `private_key_${Date.now()}.key`,
      pemExport.privateKeyPEM,
      'text'
    );
    console.log('PEM files saved separately');
  }
} catch (error) {
  console.error('❌ Export error:', error);
}

async function saveExportedFile(
  fileName: string,
  data: string,
  type: 'text' | 'binary'
): Promise<void> {
  // Implementation depends on environment (Node.js, browser, etc.)
  console.log(`💾 Saving ${fileName} (${type} format)`);
}
```

### exportCertificateChainAsync()

Certificate chain ni export qilish.

```typescript
try {
  const certificateId = 'my_certificate_2024';

  console.log('📤 Exporting certificate chain...');

  const chainExport = await certKeyPlugin.exportCertificateChainAsync(
    certificateId,
    {
      format: 'PEM',
      includeRoot: true, // Include root CA certificate
      orderFromRoot: false, // Order from end-entity to root
      validateChain: true, // Validate chain before export
      includeCRLs: false, // Don't include CRLs
      includeOCSP: false // Don't include OCSP responses
    }
  );

  if (chainExport.success) {
    console.log('✅ Certificate chain exported');
    console.log(`Chain length: ${chainExport.chainLength} certificates`);
    console.log('Chain valid:', chainExport.chainValid ? '✅' : '❌');

    console.log('\n📄 Certificate Chain:');
    chainExport.certificates.forEach((cert, index) => {
      console.log(`${index + 1}. ${cert.subject}`);
      console.log(`   Issued by: ${cert.issuer}`);
      console.log(`   Serial: ${cert.serialNumber}`);
      console.log(
        `   Valid until: ${new Date(cert.validTo).toLocaleDateString()}`
      );
      console.log(`   Type: ${cert.type}`); // 'end-entity', 'intermediate', 'root'
    });

    // Export full chain as single file
    const fullChainPEM = chainExport.certificates
      .map(cert => cert.certificatePEM)
      .join('\n');
    await saveExportedFile(
      `certificate_chain_${Date.now()}.pem`,
      fullChainPEM,
      'text'
    );

    // Export individual certificates
    for (let i = 0; i < chainExport.certificates.length; i++) {
      const cert = chainExport.certificates[i];
      const fileName = `cert_${i + 1}_${cert.type}_${Date.now()}.crt`;
      await saveExportedFile(fileName, cert.certificatePEM, 'text');
    }

    console.log('Certificate chain files saved');

    return chainExport;
  } else {
    console.error('❌ Chain export failed:', chainExport.reason);
  }
} catch (error) {
  console.error('❌ Chain export error:', error);
}
```

## Complete Examples

### Complete Certificate-Key Management Workflow

```typescript
async function manageCertificateKeyPair() {
  try {
    console.log('🔐 Starting complete certificate-key management workflow...');

    // 1. Import certificate and private key
    console.log('\n1. Importing certificate-key pair...');

    const certificatePEM = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/example/cert...
-----END CERTIFICATE-----`;

    const privateKeyPEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0B/example/key...
-----END PRIVATE KEY-----`;

    const importResult = await certKeyPlugin.importCertKeyPairAsync({
      certificate: certificatePEM,
      privateKey: privateKeyPEM,
      passphrase: 'importPassword123',
      bindAutomatically: true,
      validateKeyPair: true,
      keyId: 'workflow_private_key',
      certId: 'workflow_certificate'
    });

    if (!importResult.success) {
      throw new Error(`Import failed: ${importResult.reason}`);
    }

    console.log('✅ Certificate-key pair imported');
    const bindingId = importResult.bindingId;
    const certificateId = importResult.certificateId;
    const privateKeyId = importResult.privateKeyId;

    // 2. Validate the binding
    console.log('\n2. Validating certificate-key binding...');

    const validation = await certKeyPlugin.validateCertKeyBindingAsync(
      bindingId,
      {
        checkKeyPairMatch: true,
        checkCertificateValidity: true,
        checkKeyUsage: true,
        strictMode: true
      }
    );

    if (!validation.success || !validation.validation.valid) {
      throw new Error('Certificate-key binding validation failed');
    }

    console.log('✅ Binding validation passed');

    // 3. Get comprehensive information
    console.log('\n3. Getting binding information...');

    const bindingInfo = await certKeyPlugin.getCertKeyInfoAsync(bindingId);

    if (!bindingInfo.success) {
      throw new Error('Failed to get binding information');
    }

    const info = bindingInfo.certKeyInfo;
    console.log('✅ Binding information retrieved');

    // 4. Check certificate expiration
    console.log('\n4. Checking certificate expiration...');

    const now = new Date();
    const validTo = new Date(info.certificate.validTo);
    const daysUntilExpiry = Math.ceil(
      (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 0) {
      console.log('⚠️ Certificate has expired');
    } else if (daysUntilExpiry < 30) {
      console.log(`⚠️ Certificate expires in ${daysUntilExpiry} days`);
    } else {
      console.log(`✅ Certificate is valid for ${daysUntilExpiry} more days`);
    }

    // 5. Test cryptographic operations
    console.log('\n5. Testing cryptographic operations...');

    // Test signing capability
    if (info.certificate.keyUsage.includes('digitalSignature')) {
      console.log('Testing digital signature capability...');

      const testData = 'Test data for signing';
      const signResult = await testSigning(privateKeyId, testData);

      if (signResult.success) {
        console.log('✅ Digital signature test passed');
      } else {
        console.log('⚠️ Digital signature test failed');
      }
    }

    // Test encryption capability
    if (info.certificate.keyUsage.includes('keyEncipherment')) {
      console.log('Testing encryption capability...');

      const testData = 'Test data for encryption';
      const encryptResult = await testEncryption(certificateId, testData);

      if (encryptResult.success) {
        console.log('✅ Encryption test passed');
      } else {
        console.log('⚠️ Encryption test failed');
      }
    }

    // 6. Create backup
    console.log('\n6. Creating backup...');

    const backupResult = await certKeyPlugin.exportCertKeyPairAsync({
      bindingId: bindingId,
      format: 'P12',
      includePrivateKey: true,
      includeCertificateChain: true,
      password: 'backupPassword123',
      encryptPrivateKey: true,
      friendlyName: `Backup_${info.certificate.subject}`
    });

    if (backupResult.success) {
      const backupFileName = `backup_${bindingId}_${Date.now()}.p12`;
      await saveExportedFile(backupFileName, backupResult.data, 'binary');
      console.log('✅ Backup created:', backupFileName);
    } else {
      console.log('⚠️ Backup creation failed');
    }

    // 7. Security recommendations
    console.log('\n7. Security analysis and recommendations...');

    const securityReport = analyzeSecurityLevel(info);

    console.log('\n🛡️ Security Analysis:');
    console.log('Algorithm:', securityReport.algorithm);
    console.log('Key Size:', securityReport.keySize);
    console.log('Security Level:', securityReport.level);
    console.log('Recommendations:');
    securityReport.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });

    // 8. Usage monitoring setup
    console.log('\n8. Setting up usage monitoring...');

    const monitoringSetup = await setupUsageMonitoring(bindingId, {
      trackSignatures: true,
      trackEncryption: true,
      alertOnExpiry: 30, // Alert 30 days before expiry
      logOperations: true,
      sendReports: true
    });

    if (monitoringSetup.success) {
      console.log('✅ Usage monitoring configured');
      console.log('Monitoring ID:', monitoringSetup.monitoringId);
    }

    // 9. Generate final report
    console.log('\n9. Generating management report...');

    const managementReport = {
      timestamp: new Date().toISOString(),
      bindingId: bindingId,
      certificateId: certificateId,
      privateKeyId: privateKeyId,
      certificate: {
        subject: info.certificate.subject,
        issuer: info.certificate.issuer,
        serialNumber: info.certificate.serialNumber,
        algorithm: info.certificate.algorithm,
        keySize: info.certificate.keySize,
        validFrom: info.certificate.validFrom,
        validTo: info.certificate.validTo,
        keyUsage: info.certificate.keyUsage,
        daysUntilExpiry: daysUntilExpiry
      },
      privateKey: {
        algorithm: info.privateKey.algorithm,
        keySize: info.privateKey.keySize,
        usage: info.privateKey.usage,
        exportable: info.privateKey.exportable,
        encrypted: info.privateKey.encrypted
      },
      validation: {
        bindingValid: validation.validation.valid,
        keyPairMatch: validation.validation.keyPairMatch,
        certificateValid: validation.validation.certificateValid
      },
      security: securityReport,
      backup: {
        created: backupResult.success,
        fileName: backupResult.success
          ? `backup_${bindingId}_${Date.now()}.p12`
          : null
      },
      monitoring: {
        enabled: monitoringSetup.success,
        monitoringId: monitoringSetup.monitoringId
      },
      status:
        daysUntilExpiry > 30
          ? 'active'
          : daysUntilExpiry > 0
            ? 'expiring_soon'
            : 'expired',
      recommendations: securityReport.recommendations
    };

    const reportFileName = `cert_key_management_report_${Date.now()}.json`;
    await saveExportedFile(
      reportFileName,
      JSON.stringify(managementReport, null, 2),
      'text'
    );

    console.log('\n🎉 Certificate-key management workflow completed!');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 Summary:');
    console.log(`Binding ID: ${bindingId}`);
    console.log(`Certificate: ${info.certificate.subject}`);
    console.log(
      `Algorithm: ${info.certificate.algorithm} (${info.certificate.keySize} bits)`
    );
    console.log(
      `Expiry: ${new Date(info.certificate.validTo).toLocaleDateString()}`
    );
    console.log(`Status: ${managementReport.status.toUpperCase()}`);
    console.log(`Security Level: ${securityReport.level}`);
    console.log(`Backup Created: ${backupResult.success ? '✅' : '❌'}`);
    console.log(`Monitoring: ${monitoringSetup.success ? '✅' : '❌'}`);
    console.log(`Report: ${reportFileName}`);

    return managementReport;
  } catch (error) {
    console.error('❌ Certificate-key management workflow failed:', error);
    throw error;
  }
}

// Helper functions
async function testSigning(
  privateKeyId: string,
  data: string
): Promise<{ success: boolean }> {
  // Mock signing test
  console.log(`  Testing signing with private key: ${privateKeyId}`);
  console.log(`  Data to sign: ${data}`);
  // In real implementation, this would use PKCS7 or other signing plugins
  return { success: true };
}

async function testEncryption(
  certificateId: string,
  data: string
): Promise<{ success: boolean }> {
  // Mock encryption test
  console.log(`  Testing encryption with certificate: ${certificateId}`);
  console.log(`  Data to encrypt: ${data}`);
  // In real implementation, this would use cipher plugin
  return { success: true };
}

function analyzeSecurityLevel(info: CertKeyInfo) {
  const algorithm = info.certificate.algorithm;
  const keySize = info.certificate.keySize;

  let level = 'Unknown';
  const recommendations = [];

  if (algorithm.includes('RSA')) {
    if (keySize >= 3072) {
      level = 'High';
      recommendations.push('Key size meets current security standards');
    } else if (keySize >= 2048) {
      level = 'Medium';
      recommendations.push(
        'Consider upgrading to 3072+ bit keys for better security'
      );
    } else {
      level = 'Low';
      recommendations.push('Key size is below current recommendations');
      recommendations.push(
        'Urgently consider key replacement with stronger algorithm'
      );
    }
  } else if (algorithm.includes('EC')) {
    if (keySize >= 384) {
      level = 'High';
      recommendations.push('ECC key size is excellent');
    } else if (keySize >= 256) {
      level = 'Medium';
      recommendations.push('ECC key size is adequate');
    } else {
      level = 'Low';
      recommendations.push('ECC key size is too small for current standards');
    }
  }

  // Additional recommendations
  recommendations.push('Regularly monitor certificate expiration');
  recommendations.push('Keep private key secure and backed up');
  recommendations.push(
    'Use hardware security modules (HSM) for high-value keys'
  );

  return {
    algorithm: algorithm,
    keySize: keySize,
    level: level,
    recommendations: recommendations
  };
}

async function setupUsageMonitoring(
  bindingId: string,
  options: any
): Promise<{ success: boolean; monitoringId?: string }> {
  // Mock monitoring setup
  console.log(`  Setting up monitoring for binding: ${bindingId}`);
  console.log(`  Options:`, JSON.stringify(options, null, 2));
  return {
    success: true,
    monitoringId: `monitor_${bindingId}_${Date.now()}`
  };
}
```

## Callback API (Legacy)

### importCertKeyPair() - Callback Version

```typescript
certKeyPlugin.importCertKeyPair(
  {
    certificate: certificatePEM,
    privateKey: privateKeyPEM,
    passphrase: 'password',
    bindAutomatically: true
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Import successful');
      console.log('Binding ID:', response.bindingId);
      console.log('Certificate ID:', response.certificateId);
      console.log('Private Key ID:', response.privateKeyId);
    } else {
      console.error('Callback: Import failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Import error:', error);
  }
);
```

### validateCertKeyBinding() - Callback Version

```typescript
certKeyPlugin.validateCertKeyBinding(
  bindingId,
  {
    checkKeyPairMatch: true,
    checkCertificateValidity: true
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Validation completed');
      console.log('Valid:', response.validation.valid);
      console.log('Key pair match:', response.validation.keyPairMatch);
    } else {
      console.error('Callback: Validation failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Validation error:', error);
  }
);
```

## Error Handling

### Import Errors

```typescript
try {
  const result = await certKeyPlugin.importCertKeyPairAsync(params);
} catch (error) {
  if (error.message.includes('invalid certificate format')) {
    console.error('❌ Certificate format is invalid');
  } else if (error.message.includes('invalid private key')) {
    console.error('❌ Private key format is invalid or corrupted');
  } else if (error.message.includes('passphrase required')) {
    console.error('❌ Private key requires passphrase');
  } else if (error.message.includes('key pair mismatch')) {
    console.error('❌ Certificate and private key do not match');
  } else {
    console.error('❌ Import error:', error.message);
  }
}
```

### Binding Errors

```typescript
try {
  const result = await certKeyPlugin.bindCertKeyAsync(certId, keyId);
} catch (error) {
  if (error.message.includes('certificate not found')) {
    console.error('❌ Certificate not found in storage');
  } else if (error.message.includes('private key not found')) {
    console.error('❌ Private key not found in storage');
  } else if (error.message.includes('public key mismatch')) {
    console.error('❌ Public key in certificate does not match private key');
  } else if (error.message.includes('algorithm mismatch')) {
    console.error('❌ Certificate and private key use different algorithms');
  } else {
    console.error('❌ Binding error:', error.message);
  }
}
```

## Best Practices

1.  **Key Pair Validation**: Always validate certificate-private key matching
    before binding
2.  **Secure Import**: Use secure channels for importing sensitive key material
3.  **Backup Strategy**: Regular backup of certificate-key pairs in encrypted
    format
4.  **Access Control**: Implement proper access controls for sensitive
    operations
5.  **Expiry Monitoring**: Set up alerts for certificate expiration
6.  **Key Rotation**: Implement regular key rotation policies
7.  **Security Assessment**: Regular security assessment of key sizes and
    algorithms
8.  **Audit Trail**: Maintain logs of certificate-key operations
9.  **Hardware Security**: Use HSMs for high-value keys
10. **Compliance**: Ensure compliance with relevant security standards and
    regulations
