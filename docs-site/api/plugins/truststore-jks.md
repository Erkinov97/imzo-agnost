# Truststore-JKS Plugin API Reference

Truststore-JKS plugin Java KeyStore (JKS) formatidagi truststore'larni
boshqarish uchun mo'ljallangan. Bu plugin JKS format bilan ishlash, Java
ilovalar bilan integratsiya qilish va cross-platform trust management uchun
ishlatiladi.

## Overview

Truststore-JKS plugin quyidagi funksiyalarni taqdim etadi:

- JKS format truststore yaratish va boshqarish
- Java KeyStore format bilan ishlash
- PKCS12 dan JKS ga konvertatsiya qilish
- Java ilovalar bilan integratsiya
- Certificate trust management
- KeyStore password management

## Import

```typescript
// ES6 import
import { truststoreJksPlugin } from 'imzo-agnost';

// CommonJS
const { truststoreJksPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.truststoreJks;
```

## Types

```typescript
interface JKSTruststoreInfo {
  keystoreId: string;
  name: string;
  type: 'JKS' | 'JCEKS';
  version: string;
  created: string;
  lastModified: string;
  entryCount: number;
  certificateEntries: number;
  keyEntries: number;
  secretKeyEntries: number;
  filePath?: string;
  protected: boolean;
  provider: string; // 'SUN', 'BC', etc.
}

interface JKSCertificateEntry {
  alias: string;
  type: 'CERTIFICATE' | 'PRIVATE_KEY' | 'SECRET_KEY';
  certificate?: string; // Base64 encoded certificate
  certificateChain?: string[]; // Certificate chain if available
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  fingerprint: string;
  algorithm: string;
  keySize?: number;
  trusted: boolean;
  created: string;
  metadata?: Record<string, any>;
}

interface JKSConversionOptions {
  sourceFormat: 'PKCS12' | 'PEM' | 'DER';
  targetFormat: 'JKS' | 'JCEKS';
  sourcePassword?: string;
  targetPassword: string;
  preserveAliases: boolean;
  includeCertificateChain: boolean;
  includePrivateKeys: boolean;
  keyTransformation?: 'PRESERVE' | 'CONVERT_RSA' | 'CONVERT_EC';
  provider?: 'SUN' | 'BC' | 'IBMJCE';
}

interface JKSImportOptions {
  alias: string;
  password?: string; // For private key entries
  trusted: boolean;
  replaceExisting: boolean;
  validateCertificate: boolean;
  includeCertificateChain: boolean;
  metadata?: Record<string, any>;
}

interface JKSExportOptions {
  format: 'JKS' | 'PKCS12' | 'PEM';
  password?: string;
  includePrivateKeys: boolean;
  includeTrustedCertificates: boolean;
  selectedAliases?: string[]; // Export specific entries only
  compressionLevel?: number;
}
```

## JKS Truststore Management

### createJKSTruststoreAsync()

Yangi JKS truststore yaratish.

```typescript
try {
  console.log('🏗️ Creating new JKS truststore...');

  const jksResult = await truststoreJksPlugin.createJKSTruststoreAsync({
    name: 'Corporate JKS Truststore',
    type: 'JKS',
    password: 'jksPassword123',
    provider: 'SUN', // Java security provider
    filePath: './truststores/corporate.jks',
    initialEntries: [
      // Optional: Add initial certificates
      {
        alias: 'corporate_root_ca',
        certificate: 'MIIDroot...', // Root CA certificate
        type: 'CERTIFICATE',
        trusted: true
      },
      {
        alias: 'intermediate_ca_ssl',
        certificate: 'MIIDint...', // Intermediate CA
        type: 'CERTIFICATE',
        trusted: true
      }
    ],
    metadata: {
      purpose: 'Corporate certificate trust management',
      department: 'IT Security',
      created_by: 'System Administrator'
    }
  });

  if (jksResult.success) {
    console.log('✅ JKS truststore created successfully');
    console.log('Keystore ID:', jksResult.keystoreId);
    console.log('Name:', jksResult.name);
    console.log('Type:', jksResult.type);
    console.log('Provider:', jksResult.provider);
    console.log('Entry count:', jksResult.entryCount);
    console.log('File path:', jksResult.filePath);

    // Display creation details
    if (jksResult.creationDetails) {
      console.log('\n📋 Creation Details:');
      console.log(
        'Creation time:',
        new Date(jksResult.creationDetails.timestamp).toLocaleString()
      );
      console.log(
        'Initial entries added:',
        jksResult.creationDetails.initialEntriesAdded
      );
      console.log('Keystore version:', jksResult.creationDetails.version);
      console.log(
        'Provider version:',
        jksResult.creationDetails.providerVersion
      );
    }

    return jksResult.keystoreId;
  } else {
    console.error('❌ JKS truststore creation failed:', jksResult.reason);
  }
} catch (error) {
  console.error('❌ JKS truststore creation error:', error);
}
```

### loadJKSTruststoreAsync()

Mavjud JKS truststore ni yuklash.

```typescript
try {
  const jksFilePath = './truststores/corporate.jks';
  const password = 'jksPassword123';

  console.log('📂 Loading JKS truststore...');
  console.log('Path:', jksFilePath);

  const loadResult = await truststoreJksPlugin.loadJKSTruststoreAsync({
    filePath: jksFilePath,
    password: password,
    provider: 'SUN', // Preferred provider
    readOnly: false, // Allow modifications
    validateEntries: true, // Validate all entries on load
    cacheEnabled: true, // Enable caching for performance
    autoBackup: true, // Create backup before modifications
    keystoreId: 'corporate_jks_truststore'
  });

  if (loadResult.success) {
    console.log('✅ JKS truststore loaded successfully');

    const info = loadResult.truststoreInfo;
    console.log('\n📋 JKS Truststore Information:');
    console.log('Keystore ID:', info.keystoreId);
    console.log('Name:', info.name);
    console.log('Type:', info.type);
    console.log('Provider:', info.provider);
    console.log('Total entries:', info.entryCount);
    console.log('Certificate entries:', info.certificateEntries);
    console.log('Key entries:', info.keyEntries);
    console.log('Secret key entries:', info.secretKeyEntries);
    console.log('Created:', new Date(info.created).toLocaleString());
    console.log('Last modified:', new Date(info.lastModified).toLocaleString());
    console.log('Protected:', info.protected ? 'Yes' : 'No');

    // List all entries
    if (loadResult.entries && loadResult.entries.length > 0) {
      console.log('\n📄 Keystore Entries:');
      loadResult.entries.forEach((entry, index) => {
        console.log(`\n${index + 1}. ${entry.alias}`);
        console.log(`   Type: ${entry.type}`);
        console.log(`   Subject: ${entry.subject}`);
        console.log(`   Issuer: ${entry.issuer}`);
        console.log(`   Algorithm: ${entry.algorithm}`);

        if (entry.keySize) {
          console.log(`   Key Size: ${entry.keySize} bits`);
        }

        console.log(
          `   Valid From: ${new Date(entry.validFrom).toLocaleDateString()}`
        );
        console.log(
          `   Valid To: ${new Date(entry.validTo).toLocaleDateString()}`
        );
        console.log(`   Trusted: ${entry.trusted ? '✅' : '❌'}`);
        console.log(
          `   Created: ${new Date(entry.created).toLocaleDateString()}`
        );

        // Check expiry
        const daysUntilExpiry = Math.ceil(
          (new Date(entry.validTo).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry <= 0) {
          console.log('   ⚠️ EXPIRED');
        } else if (daysUntilExpiry < 90) {
          console.log(`   ⚠️ Expires in ${daysUntilExpiry} days`);
        }

        // Display certificate chain if available
        if (entry.certificateChain && entry.certificateChain.length > 1) {
          console.log(
            `   Certificate Chain: ${entry.certificateChain.length} certificates`
          );
        }
      });
    }

    // Provider information
    if (loadResult.providerInfo) {
      console.log('\n🔧 Provider Information:');
      console.log('Provider:', loadResult.providerInfo.name);
      console.log('Version:', loadResult.providerInfo.version);
      console.log(
        'Supported algorithms:',
        loadResult.providerInfo.supportedAlgorithms.join(', ')
      );
    }

    return info.keystoreId;
  } else {
    console.error('❌ JKS truststore loading failed:', loadResult.reason);
  }
} catch (error) {
  console.error('❌ JKS truststore loading error:', error);
}
```

### convertToJKSAsync()

Boshqa formatdan JKS ga konvertatsiya qilish.

```typescript
try {
  const sourceFile = './certificates/corporate.p12'; // PKCS12 source
  const targetFile = './truststores/corporate.jks'; // JKS target

  console.log('🔄 Converting PKCS12 to JKS...');
  console.log('Source:', sourceFile);
  console.log('Target:', targetFile);

  const conversionResult = await truststoreJksPlugin.convertToJKSAsync({
    sourceFilePath: sourceFile,
    targetFilePath: targetFile,
    conversionOptions: {
      sourceFormat: 'PKCS12',
      targetFormat: 'JKS',
      sourcePassword: 'pkcs12Password',
      targetPassword: 'jksPassword123',
      preserveAliases: true,
      includeCertificateChain: true,
      includePrivateKeys: false, // Only certificates for truststore
      keyTransformation: 'PRESERVE',
      provider: 'SUN'
    },
    validationOptions: {
      validateSource: true,
      validateTarget: true,
      checkCertificateIntegrity: true,
      verifyPrivateKeyAccess: false
    }
  });

  if (conversionResult.success) {
    console.log('✅ Conversion completed successfully');

    const result = conversionResult.conversionResult;
    console.log('\n📊 Conversion Summary:');
    console.log('Source format:', result.sourceFormat);
    console.log('Target format:', result.targetFormat);
    console.log('Entries processed:', result.entriesProcessed);
    console.log('Certificates converted:', result.certificatesConverted);
    console.log('Private keys converted:', result.privateKeysConverted);
    console.log('Failed conversions:', result.failedConversions);
    console.log('Conversion time:', `${result.conversionTime}ms`);

    // Detailed conversion log
    if (result.conversionLog && result.conversionLog.length > 0) {
      console.log('\n📋 Conversion Log:');
      result.conversionLog.forEach((log, index) => {
        console.log(`${index + 1}. ${log.alias}`);
        console.log(`   Status: ${log.status}`);
        console.log(`   Type: ${log.entryType}`);

        if (log.originalAlias !== log.newAlias) {
          console.log(
            `   Alias changed: ${log.originalAlias} → ${log.newAlias}`
          );
        }

        if (log.warnings && log.warnings.length > 0) {
          console.log(`   Warnings: ${log.warnings.join(', ')}`);
        }

        if (log.error) {
          console.log(`   Error: ${log.error}`);
        }
      });
    }

    // Validation results
    if (result.validation) {
      console.log('\n🔍 Validation Results:');
      console.log('Source valid:', result.validation.sourceValid ? '✅' : '❌');
      console.log('Target valid:', result.validation.targetValid ? '✅' : '❌');
      console.log(
        'Integrity check:',
        result.validation.integrityCheck ? '✅' : '❌'
      );

      if (result.validation.issues && result.validation.issues.length > 0) {
        console.log('Validation issues:');
        result.validation.issues.forEach(issue => {
          console.log(`  - ${issue.severity}: ${issue.message}`);
        });
      }
    }

    // File information
    console.log('\n📁 File Information:');
    console.log('Source file size:', formatBytes(result.sourceFileSize));
    console.log('Target file size:', formatBytes(result.targetFileSize));
    console.log('Target file path:', result.targetFilePath);

    return result.targetFilePath;
  } else {
    console.error('❌ Conversion failed:', conversionResult.reason);
  }
} catch (error) {
  console.error('❌ Conversion error:', error);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

## Certificate Entry Management

### addCertificateEntryAsync()

JKS truststore ga sertifikat entry qo'shish.

```typescript
try {
  const keystoreId = 'corporate_jks_truststore';
  const certificateBase64 = 'MIIDnew...'; // New certificate to add

  console.log('➕ Adding certificate entry to JKS truststore...');

  const addResult = await truststoreJksPlugin.addCertificateEntryAsync(
    keystoreId,
    {
      alias: 'new_trusted_ca',
      certificate: certificateBase64,
      certificateChain: [
        // Optional: full certificate chain
        'MIIDnew...', // End entity or intermediate
        'MIIDinter...', // Intermediate CA
        'MIIDroot...' // Root CA
      ],
      importOptions: {
        trusted: true,
        replaceExisting: false,
        validateCertificate: true,
        includeCertificateChain: true,
        metadata: {
          addedBy: 'Administrator',
          purpose: 'SSL validation',
          approvalDate: new Date().toISOString()
        }
      },
      jksOptions: {
        provider: 'SUN',
        updateTimestamp: true,
        createBackup: true
      }
    }
  );

  if (addResult.success) {
    console.log('✅ Certificate entry added successfully');
    console.log('Alias:', addResult.alias);
    console.log('Type:', addResult.entryType);
    console.log('Subject:', addResult.subject);
    console.log('Issuer:', addResult.issuer);
    console.log('Fingerprint:', addResult.fingerprint);
    console.log('Entry created:', new Date(addResult.created).toLocaleString());

    // Certificate chain information
    if (addResult.certificateChain && addResult.certificateChain.length > 1) {
      console.log('\n🔗 Certificate Chain:');
      addResult.certificateChain.forEach((cert, index) => {
        console.log(`${index + 1}. ${cert.subject}`);
        console.log(`   Issued by: ${cert.issuer}`);
        console.log(
          `   Valid until: ${new Date(cert.validTo).toLocaleDateString()}`
        );
      });
    }

    // JKS specific information
    if (addResult.jksInfo) {
      console.log('\n⚙️ JKS Information:');
      console.log('Provider used:', addResult.jksInfo.provider);
      console.log('Entry position:', addResult.jksInfo.position);
      console.log(
        'Backup created:',
        addResult.jksInfo.backupCreated ? '✅' : '❌'
      );

      if (addResult.jksInfo.backupPath) {
        console.log('Backup path:', addResult.jksInfo.backupPath);
      }
    }

    // Validation results
    if (addResult.validation) {
      console.log('\n🔍 Certificate Validation:');
      console.log(
        'Format valid:',
        addResult.validation.formatValid ? '✅' : '❌'
      );
      console.log(
        'Signature valid:',
        addResult.validation.signatureValid ? '✅' : '❌'
      );
      console.log(
        'Not expired:',
        addResult.validation.notExpired ? '✅' : '❌'
      );
      console.log(
        'Chain complete:',
        addResult.validation.chainComplete ? '✅' : '❌'
      );

      if (addResult.validation.warnings.length > 0) {
        console.log('Warnings:');
        addResult.validation.warnings.forEach(warning => {
          console.log(`  - ${warning}`);
        });
      }
    }

    return addResult.alias;
  } else {
    console.error('❌ Certificate entry addition failed:', addResult.reason);
  }
} catch (error) {
  console.error('❌ Certificate entry addition error:', error);
}
```

### removeCertificateEntryAsync()

JKS truststore dan sertifikat entry ni o'chirish.

```typescript
try {
  const keystoreId = 'corporate_jks_truststore';
  const entryAlias = 'old_trusted_ca';

  console.log('➖ Removing certificate entry from JKS truststore...');
  console.log('Alias:', entryAlias);

  // First, get entry information
  const entryInfo = await truststoreJksPlugin.getCertificateEntryAsync(
    keystoreId,
    entryAlias
  );

  if (entryInfo.success) {
    console.log('Entry to remove:');
    console.log('Type:', entryInfo.entry.type);
    console.log('Subject:', entryInfo.entry.subject);
    console.log(
      'Created:',
      new Date(entryInfo.entry.created).toLocaleDateString()
    );
  }

  const removeResult = await truststoreJksPlugin.removeCertificateEntryAsync(
    keystoreId,
    entryAlias,
    {
      createBackup: true, // Backup before removal
      validateRemoval: true, // Validate removal impact
      updateReferences: true, // Update any references to this entry
      removalOptions: {
        reason: 'Certificate expired and replaced',
        removedBy: 'System Administrator',
        approvalRequired: false
      },
      jksOptions: {
        provider: 'SUN',
        updateTimestamp: true,
        optimizeAfterRemoval: true // Optimize keystore after removal
      }
    }
  );

  if (removeResult.success) {
    console.log('✅ Certificate entry removed successfully');
    console.log('Removed alias:', removeResult.removedAlias);
    console.log('Entry type:', removeResult.entryType);
    console.log('Subject:', removeResult.subject);
    console.log(
      'Removal time:',
      new Date(removeResult.removalTime).toLocaleString()
    );

    // Backup information
    if (removeResult.backupInfo) {
      console.log('\n💾 Backup Information:');
      console.log(
        'Backup created:',
        removeResult.backupInfo.created ? '✅' : '❌'
      );
      console.log('Backup path:', removeResult.backupInfo.path);
      console.log(
        'Backup timestamp:',
        new Date(removeResult.backupInfo.timestamp).toLocaleString()
      );
    }

    // Impact analysis
    if (removeResult.impact) {
      console.log('\n📊 Removal Impact:');
      console.log('Entries affected:', removeResult.impact.entriesAffected);
      console.log('References updated:', removeResult.impact.referencesUpdated);
      console.log(
        'Trust relationships affected:',
        removeResult.impact.trustRelationshipsAffected
      );

      if (
        removeResult.impact.warnings &&
        removeResult.impact.warnings.length > 0
      ) {
        console.log('Impact warnings:');
        removeResult.impact.warnings.forEach(warning => {
          console.log(`  - ${warning}`);
        });
      }
    }

    // JKS optimization results
    if (removeResult.optimization) {
      console.log('\n⚡ Optimization Results:');
      console.log(
        'Keystore optimized:',
        removeResult.optimization.completed ? '✅' : '❌'
      );
      console.log(
        'Size before:',
        formatBytes(removeResult.optimization.sizeBefore)
      );
      console.log(
        'Size after:',
        formatBytes(removeResult.optimization.sizeAfter)
      );
      console.log(
        'Space saved:',
        formatBytes(removeResult.optimization.spaceSaved)
      );
      console.log(
        'Optimization time:',
        `${removeResult.optimization.optimizationTime}ms`
      );
    }

    console.log('Removal reason:', removeResult.reason);
  } else {
    console.error('❌ Certificate entry removal failed:', removeResult.reason);
  }
} catch (error) {
  console.error('❌ Certificate entry removal error:', error);
}
```

### listCertificateEntriesAsync()

JKS truststore dagi barcha entry'larni ro'yxatlash.

```typescript
try {
  const keystoreId = 'corporate_jks_truststore';

  console.log('📋 Listing JKS truststore entries...');

  const listResult = await truststoreJksPlugin.listCertificateEntriesAsync(
    keystoreId,
    {
      entryTypes: ['CERTIFICATE', 'PRIVATE_KEY'], // Filter by entry type
      trusted: true, // Only trusted entries
      includeExpired: false, // Exclude expired certificates
      sortBy: 'alias', // Sort by alias
      sortOrder: 'asc', // Ascending order
      includeChain: true, // Include certificate chains
      includeMetadata: true, // Include metadata
      provider: 'SUN', // Specific provider
      limit: 100 // Limit results
    }
  );

  if (listResult.success) {
    const entries = listResult.entries;

    console.log('✅ JKS Entries Retrieved:');
    console.log(`Total entries: ${entries.length}`);
    console.log('═══════════════════════════════════════');

    entries.forEach((entry, index) => {
      console.log(`\n${index + 1}. ${entry.alias}`);
      console.log(`   Type: ${entry.type}`);
      console.log(`   Subject: ${entry.subject}`);
      console.log(`   Issuer: ${entry.issuer}`);
      console.log(`   Serial Number: ${entry.serialNumber}`);
      console.log(`   Algorithm: ${entry.algorithm}`);

      if (entry.keySize) {
        console.log(`   Key Size: ${entry.keySize} bits`);
      }

      console.log(
        `   Valid From: ${new Date(entry.validFrom).toLocaleDateString()}`
      );
      console.log(
        `   Valid To: ${new Date(entry.validTo).toLocaleDateString()}`
      );
      console.log(`   Trusted: ${entry.trusted ? '✅' : '❌'}`);
      console.log(
        `   Created: ${new Date(entry.created).toLocaleDateString()}`
      );
      console.log(`   Fingerprint: ${entry.fingerprint}`);

      // Certificate chain information
      if (entry.certificateChain && entry.certificateChain.length > 1) {
        console.log(
          `   Certificate Chain: ${entry.certificateChain.length} certificates`
        );
        entry.certificateChain.forEach((chainCert, chainIndex) => {
          console.log(`     ${chainIndex + 1}. ${chainCert.split(',')[0]}`); // Show only CN
        });
      }

      // Expiry warning
      const daysUntilExpiry = Math.ceil(
        (new Date(entry.validTo).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 0) {
        console.log('   ⚠️ EXPIRED');
      } else if (daysUntilExpiry < 90) {
        console.log(`   ⚠️ Expires in ${daysUntilExpiry} days`);
      }

      // Metadata
      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        console.log('   Metadata:');
        Object.entries(entry.metadata).forEach(([key, value]) => {
          console.log(`     ${key}: ${value}`);
        });
      }
    });

    // Summary statistics
    console.log('\n📊 Entry Summary:');
    const stats = {
      total: entries.length,
      certificates: entries.filter(e => e.type === 'CERTIFICATE').length,
      privateKeys: entries.filter(e => e.type === 'PRIVATE_KEY').length,
      secretKeys: entries.filter(e => e.type === 'SECRET_KEY').length,
      trusted: entries.filter(e => e.trusted).length,
      expired: entries.filter(e => new Date(e.validTo) < new Date()).length,
      expiringSoon: entries.filter(e => {
        const days = Math.ceil(
          (new Date(e.validTo).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return days > 0 && days < 90;
      }).length
    };

    console.log(`Certificate entries: ${stats.certificates}`);
    console.log(`Private key entries: ${stats.privateKeys}`);
    console.log(`Secret key entries: ${stats.secretKeys}`);
    console.log(`Trusted entries: ${stats.trusted}`);
    console.log(`Expired entries: ${stats.expired}`);
    console.log(`Expiring soon (< 90 days): ${stats.expiringSoon}`);

    // Algorithm distribution
    const algorithms = entries.reduce((acc, entry) => {
      acc[entry.algorithm] = (acc[entry.algorithm] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 Algorithm Distribution:');
    Object.entries(algorithms).forEach(([algorithm, count]) => {
      console.log(`${algorithm}: ${count} entries`);
    });

    return entries;
  } else {
    console.error('❌ Failed to list JKS entries:', listResult.reason);
  }
} catch (error) {
  console.error('❌ JKS entry listing error:', error);
}
```

## Import/Export Operations

### exportJKSTruststoreAsync()

JKS truststore ni export qilish.

```typescript
try {
  const keystoreId = 'corporate_jks_truststore';

  console.log('📤 Exporting JKS truststore...');

  const exportResult = await truststoreJksPlugin.exportJKSTruststoreAsync(
    keystoreId,
    {
      exportOptions: {
        format: 'JKS', // Target format
        password: 'exportPassword123',
        includePrivateKeys: false, // For truststore, usually false
        includeTrustedCertificates: true,
        selectedAliases: [
          // Export specific entries only
          'corporate_root_ca',
          'partner_ca_ssl',
          'intermediate_ca_email'
        ],
        compressionLevel: 6 // 0-9, higher = more compression
      },
      validationOptions: {
        validateExport: true,
        checkIntegrity: true,
        verifyPasswords: true
      },
      outputOptions: {
        outputPath: './exports/corporate_truststore_export.jks',
        overwriteExisting: true,
        createDirectory: true,
        includeMetadata: true
      }
    }
  );

  if (exportResult.success) {
    console.log('✅ JKS truststore exported successfully');

    const result = exportResult.exportResult;
    console.log('\n📊 Export Summary:');
    console.log('Export format:', result.format);
    console.log('Entries exported:', result.entriesExported);
    console.log('Certificate entries:', result.certificateEntries);
    console.log('Private key entries:', result.privateKeyEntries);
    console.log('File size:', formatBytes(result.fileSize));
    console.log('Export time:', `${result.exportTime}ms`);
    console.log('Output path:', result.outputPath);

    // Export details
    if (result.exportDetails && result.exportDetails.length > 0) {
      console.log('\n📋 Export Details:');
      result.exportDetails.forEach((detail, index) => {
        console.log(`${index + 1}. ${detail.alias}`);
        console.log(`   Type: ${detail.entryType}`);
        console.log(`   Status: ${detail.exportStatus}`);
        console.log(`   Size: ${formatBytes(detail.entrySize)}`);

        if (detail.warnings && detail.warnings.length > 0) {
          console.log(`   Warnings: ${detail.warnings.join(', ')}`);
        }
      });
    }

    // Validation results
    if (result.validation) {
      console.log('\n🔍 Export Validation:');
      console.log('Export valid:', result.validation.exportValid ? '✅' : '❌');
      console.log(
        'Integrity check:',
        result.validation.integrityCheck ? '✅' : '❌'
      );
      console.log(
        'Password verification:',
        result.validation.passwordVerification ? '✅' : '❌'
      );

      if (result.validation.issues && result.validation.issues.length > 0) {
        console.log('Validation issues:');
        result.validation.issues.forEach(issue => {
          console.log(`  - ${issue.severity}: ${issue.message}`);
        });
      }
    }

    // Compression information
    if (result.compression) {
      console.log('\n🗜️ Compression Information:');
      console.log(
        'Original size:',
        formatBytes(result.compression.originalSize)
      );
      console.log(
        'Compressed size:',
        formatBytes(result.compression.compressedSize)
      );
      console.log(
        'Compression ratio:',
        `${result.compression.compressionRatio.toFixed(2)}%`
      );
      console.log('Compression level used:', result.compression.levelUsed);
    }

    return result.outputPath;
  } else {
    console.error('❌ JKS truststore export failed:', exportResult.reason);
  }
} catch (error) {
  console.error('❌ JKS truststore export error:', error);
}
```

### importFromPKCS12Async()

PKCS12 dan JKS ga import qilish.

```typescript
try {
  const pkcs12FilePath = './certificates/source.p12';
  const jksKeystoreId = 'corporate_jks_truststore';

  console.log('📥 Importing from PKCS12 to JKS...');
  console.log('Source PKCS12:', pkcs12FilePath);
  console.log('Target JKS:', jksKeystoreId);

  const importResult = await truststoreJksPlugin.importFromPKCS12Async(
    pkcs12FilePath,
    jksKeystoreId,
    {
      pkcs12Password: 'pkcs12Password',
      jksPassword: 'jksPassword123',
      importOptions: {
        aliasPrefix: 'imported_', // Prefix for imported aliases
        preserveAliases: false, // Don't preserve original aliases
        trusted: true, // Mark as trusted
        replaceExisting: false, // Don't replace existing entries
        validateCertificates: true, // Validate before import
        includeCertificateChain: true,
        includePrivateKeys: false, // Truststore - no private keys
        metadata: {
          importedFrom: 'PKCS12',
          importDate: new Date().toISOString(),
          importedBy: 'System Administrator'
        }
      },
      conversionOptions: {
        provider: 'SUN',
        keyTransformation: 'PRESERVE',
        handleDuplicates: 'SKIP', // 'SKIP', 'REPLACE', 'RENAME'
        createBackup: true
      }
    }
  );

  if (importResult.success) {
    console.log('✅ PKCS12 to JKS import completed successfully');

    const result = importResult.importResult;
    console.log('\n📊 Import Summary:');
    console.log('Entries processed:', result.entriesProcessed);
    console.log('Certificates imported:', result.certificatesImported);
    console.log('Private keys imported:', result.privateKeysImported);
    console.log('Failed imports:', result.failedImports);
    console.log('Duplicate entries skipped:', result.duplicatesSkipped);
    console.log('Import time:', `${result.importTime}ms`);

    // Detailed import log
    if (result.importLog && result.importLog.length > 0) {
      console.log('\n📋 Import Log:');
      result.importLog.forEach((log, index) => {
        console.log(`${index + 1}. ${log.originalAlias} → ${log.newAlias}`);
        console.log(`   Type: ${log.entryType}`);
        console.log(`   Status: ${log.importStatus}`);
        console.log(`   Subject: ${log.subject}`);

        if (log.certificateChain) {
          console.log(`   Chain length: ${log.certificateChain.length}`);
        }

        if (log.warnings && log.warnings.length > 0) {
          console.log(`   Warnings: ${log.warnings.join(', ')}`);
        }

        if (log.error) {
          console.log(`   Error: ${log.error}`);
        }
      });
    }

    // Backup information
    if (result.backupInfo) {
      console.log('\n💾 Backup Information:');
      console.log('Backup created:', result.backupInfo.created ? '✅' : '❌');
      console.log('Backup path:', result.backupInfo.path);
      console.log(
        'Backup timestamp:',
        new Date(result.backupInfo.timestamp).toLocaleString()
      );
    }

    // Validation results
    if (result.validation) {
      console.log('\n🔍 Import Validation:');
      console.log(
        'All imports valid:',
        result.validation.allValid ? '✅' : '❌'
      );
      console.log(
        'Certificate integrity:',
        result.validation.certificateIntegrity ? '✅' : '❌'
      );
      console.log(
        'Chain validation:',
        result.validation.chainValidation ? '✅' : '❌'
      );

      if (result.validation.issues && result.validation.issues.length > 0) {
        console.log('Validation issues:');
        result.validation.issues.forEach(issue => {
          console.log(`  - ${issue.alias}: ${issue.message}`);
        });
      }
    }

    return result;
  } else {
    console.error('❌ PKCS12 to JKS import failed:', importResult.reason);
  }
} catch (error) {
  console.error('❌ PKCS12 to JKS import error:', error);
}
```

## Complete Examples

### Complete JKS Truststore Management Workflow

```typescript
async function setupJKSTruststoreWorkflow() {
  try {
    console.log('🏢 Setting up complete JKS truststore workflow...');

    // 1. Create new JKS truststore
    console.log('\n1. Creating JKS truststore...');

    const createResult = await truststoreJksPlugin.createJKSTruststoreAsync({
      name: 'Enterprise JKS Truststore',
      type: 'JKS',
      password: 'JksEnterprise2024!',
      provider: 'SUN',
      filePath: './truststores/enterprise.jks',
      metadata: {
        purpose: 'Enterprise SSL and code signing trust management',
        department: 'IT Security',
        created_by: 'Security Administrator'
      }
    });

    if (!createResult.success) {
      throw new Error(`JKS truststore creation failed: ${createResult.reason}`);
    }

    const keystoreId = createResult.keystoreId;
    console.log('✅ JKS truststore created:', keystoreId);

    // 2. Import certificates from PKCS12
    console.log('\n2. Importing certificates from PKCS12...');

    const pkcs12Sources = [
      {
        path: './certificates/root_cas.p12',
        password: 'rootCAsPassword',
        aliasPrefix: 'root_'
      },
      {
        path: './certificates/intermediate_cas.p12',
        password: 'intermediateCAsPassword',
        aliasPrefix: 'intermediate_'
      },
      {
        path: './certificates/partner_cas.p12',
        password: 'partnerCAsPassword',
        aliasPrefix: 'partner_'
      }
    ];

    for (const source of pkcs12Sources) {
      const importResult = await truststoreJksPlugin.importFromPKCS12Async(
        source.path,
        keystoreId,
        {
          pkcs12Password: source.password,
          jksPassword: 'JksEnterprise2024!',
          importOptions: {
            aliasPrefix: source.aliasPrefix,
            preserveAliases: false,
            trusted: true,
            validateCertificates: true,
            includeCertificateChain: true,
            includePrivateKeys: false
          }
        }
      );

      if (importResult.success) {
        console.log(
          `✅ Imported from ${source.path}: ${importResult.importResult.certificatesImported} certificates`
        );
      } else {
        console.log(
          `⚠️ Failed to import from ${source.path}: ${importResult.reason}`
        );
      }
    }

    // 3. Add individual certificates
    console.log('\n3. Adding individual trusted certificates...');

    const individualCerts = [
      {
        alias: 'government_root_ca',
        certificate:
          '-----BEGIN CERTIFICATE-----\nMIIDgov...\n-----END CERTIFICATE-----',
        metadata: { source: 'Government PKI', validity: 'High' }
      },
      {
        alias: 'banking_root_ca',
        certificate:
          '-----BEGIN CERTIFICATE-----\nMIIDbank...\n-----END CERTIFICATE-----',
        metadata: { source: 'Banking Consortium', validity: 'High' }
      }
    ];

    for (const cert of individualCerts) {
      const addResult = await truststoreJksPlugin.addCertificateEntryAsync(
        keystoreId,
        {
          alias: cert.alias,
          certificate: cert.certificate,
          importOptions: {
            trusted: true,
            validateCertificate: true,
            metadata: cert.metadata
          }
        }
      );

      if (addResult.success) {
        console.log(`✅ Added certificate: ${cert.alias}`);
      } else {
        console.log(`⚠️ Failed to add ${cert.alias}: ${addResult.reason}`);
      }
    }

    // 4. List all entries and analyze
    console.log('\n4. Analyzing truststore contents...');

    const listResult =
      await truststoreJksPlugin.listCertificateEntriesAsync(keystoreId);

    if (listResult.success) {
      const entries = listResult.entries;
      console.log(
        `✅ Truststore analysis completed: ${entries.length} entries`
      );

      // Security analysis
      const securityAnalysis = {
        totalEntries: entries.length,
        trustedEntries: entries.filter(e => e.trusted).length,
        expiredEntries: entries.filter(e => new Date(e.validTo) < new Date())
          .length,
        expiringSoon: entries.filter(e => {
          const days = Math.ceil(
            (new Date(e.validTo).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );
          return days > 0 && days < 90;
        }).length,
        algorithms: [...new Set(entries.map(e => e.algorithm))],
        keySizes: [...new Set(entries.map(e => e.keySize).filter(Boolean))]
      };

      console.log('\n🔍 Security Analysis:');
      console.log('Total entries:', securityAnalysis.totalEntries);
      console.log('Trusted entries:', securityAnalysis.trustedEntries);
      console.log('Expired entries:', securityAnalysis.expiredEntries);
      console.log('Expiring soon:', securityAnalysis.expiringSoon);
      console.log('Algorithms used:', securityAnalysis.algorithms.join(', '));
      console.log('Key sizes:', securityAnalysis.keySizes.join(', '));

      // Recommendations
      console.log('\n💡 Recommendations:');
      if (securityAnalysis.expiredEntries > 0) {
        console.log(
          `- Remove ${securityAnalysis.expiredEntries} expired certificates`
        );
      }
      if (securityAnalysis.expiringSoon > 0) {
        console.log(
          `- Plan renewal for ${securityAnalysis.expiringSoon} certificates expiring soon`
        );
      }
      if (securityAnalysis.algorithms.includes('MD5')) {
        console.log('- Replace certificates using MD5 algorithm (deprecated)');
      }
      if (securityAnalysis.keySizes.includes(1024)) {
        console.log('- Replace certificates with 1024-bit keys (weak)');
      }
    }

    // 5. Create backup export
    console.log('\n5. Creating backup export...');

    const backupResult = await truststoreJksPlugin.exportJKSTruststoreAsync(
      keystoreId,
      {
        exportOptions: {
          format: 'JKS',
          password: 'BackupJks2024!',
          includeTrustedCertificates: true,
          compressionLevel: 9
        },
        outputOptions: {
          outputPath: `./backups/enterprise_truststore_backup_${Date.now()}.jks`,
          createDirectory: true,
          includeMetadata: true
        }
      }
    );

    if (backupResult.success) {
      console.log('✅ Backup created:', backupResult.exportResult.outputPath);
      console.log(
        'Backup size:',
        formatBytes(backupResult.exportResult.fileSize)
      );
    }

    // 6. Generate comprehensive report
    console.log('\n6. Generating comprehensive report...');

    const truststoreInfo =
      await truststoreJksPlugin.getTruststoreInfoAsync(keystoreId);

    const report = {
      timestamp: new Date().toISOString(),
      truststore: {
        id: keystoreId,
        name: truststoreInfo.truststoreInfo.name,
        type: truststoreInfo.truststoreInfo.type,
        provider: truststoreInfo.truststoreInfo.provider,
        entryCount: truststoreInfo.truststoreInfo.entryCount,
        filePath: truststoreInfo.truststoreInfo.filePath
      },
      entries: listResult.entries.map(entry => ({
        alias: entry.alias,
        type: entry.type,
        subject: entry.subject,
        issuer: entry.issuer,
        algorithm: entry.algorithm,
        keySize: entry.keySize,
        validFrom: entry.validFrom,
        validTo: entry.validTo,
        trusted: entry.trusted,
        fingerprint: entry.fingerprint
      })),
      securityAnalysis: securityAnalysis,
      backup: {
        created: backupResult.success,
        path: backupResult.success
          ? backupResult.exportResult.outputPath
          : null,
        size: backupResult.success ? backupResult.exportResult.fileSize : null
      },
      recommendations: [
        'Regularly review and update trusted certificates',
        'Monitor certificate expiration dates',
        'Use strong algorithms and key sizes',
        'Maintain backup copies of truststore',
        'Audit trust relationships quarterly',
        'Implement certificate lifecycle management'
      ]
    };

    const reportFileName = `enterprise_jks_truststore_report_${Date.now()}.json`;
    await saveReportFile(reportFileName, JSON.stringify(report, null, 2));

    console.log('\n🎉 JKS truststore workflow completed successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log('📋 Workflow Summary:');
    console.log(`Truststore ID: ${keystoreId}`);
    console.log(`Total entries: ${report.securityAnalysis.totalEntries}`);
    console.log(`Trusted entries: ${report.securityAnalysis.trustedEntries}`);
    console.log(`Backup created: ${report.backup.created ? 'Yes' : 'No'}`);
    console.log(`Report: ${reportFileName}`);
    console.log(`Security level: ${getSecurityLevel(securityAnalysis)}`);

    return {
      keystoreId: keystoreId,
      report: report,
      backupPath: report.backup.path
    };
  } catch (error) {
    console.error('❌ JKS truststore workflow failed:', error);
    throw error;
  }
}

function getSecurityLevel(analysis: any): string {
  let score = 100;

  if (analysis.expiredEntries > 0) score -= 30;
  if (analysis.expiringSoon > 0) score -= 20;
  if (analysis.algorithms.includes('MD5')) score -= 25;
  if (analysis.keySizes.includes(1024)) score -= 25;

  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
}

async function saveReportFile(
  fileName: string,
  content: string
): Promise<void> {
  console.log(`💾 Saving report: ${fileName}`);
  // Implementation depends on environment
}
```

## Callback API (Legacy)

### createJKSTruststore() - Callback Version

```typescript
truststoreJksPlugin.createJKSTruststore(
  {
    name: 'My JKS Truststore',
    type: 'JKS',
    password: 'jksPassword123',
    provider: 'SUN'
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: JKS truststore created');
      console.log('ID:', response.keystoreId);
    } else {
      console.error('Callback: Creation failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Creation error:', error);
  }
);
```

### convertToJKS() - Callback Version

```typescript
truststoreJksPlugin.convertToJKS(
  {
    sourceFilePath: './source.p12',
    targetFilePath: './target.jks',
    conversionOptions: {
      sourceFormat: 'PKCS12',
      targetFormat: 'JKS',
      sourcePassword: 'sourcePass',
      targetPassword: 'targetPass'
    }
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Conversion completed');
      console.log(
        'Entries converted:',
        response.conversionResult.entriesProcessed
      );
    } else {
      console.error('Callback: Conversion failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Conversion error:', error);
  }
);
```

## Error Handling

### JKS Creation/Loading Errors

```typescript
try {
  const result = await truststoreJksPlugin.createJKSTruststoreAsync(params);
} catch (error) {
  if (error.message.includes('invalid password')) {
    console.error('❌ Invalid JKS password');
  } else if (error.message.includes('provider not available')) {
    console.error('❌ JKS provider not available');
  } else if (error.message.includes('invalid keystore type')) {
    console.error('❌ Invalid JKS keystore type');
  } else if (error.message.includes('file already exists')) {
    console.error('❌ JKS file already exists');
  } else if (error.message.includes('permission denied')) {
    console.error('❌ Permission denied - check file access rights');
  } else {
    console.error('❌ JKS truststore creation error:', error.message);
  }
}
```

### Conversion Errors

```typescript
try {
  const result = await truststoreJksPlugin.convertToJKSAsync(params);
} catch (error) {
  if (error.message.includes('unsupported source format')) {
    console.error('❌ Unsupported source format for conversion');
  } else if (error.message.includes('invalid source password')) {
    console.error('❌ Invalid source file password');
  } else if (error.message.includes('conversion failed')) {
    console.error('❌ Format conversion failed');
  } else if (error.message.includes('provider incompatible')) {
    console.error('❌ JKS provider incompatible with source format');
  } else {
    console.error('❌ JKS conversion error:', error.message);
  }
}
```

## Best Practices

1. **Provider Selection**: Use appropriate JKS provider (SUN, BC, etc.)
2. **Password Security**: Use strong passwords for JKS protection
3. **Backup Strategy**: Regular backups before modifications
4. **Entry Validation**: Always validate certificates before adding
5. **Algorithm Security**: Use modern algorithms (avoid MD5, SHA1)
6. **Key Size**: Use adequate key sizes (2048+ for RSA)
7. **Expiry Monitoring**: Monitor certificate expiration dates
8. **Access Control**: Implement proper file access controls
9. **Conversion Testing**: Test conversions in non-production environment
10. **Documentation**: Document JKS structure and entry purposes
