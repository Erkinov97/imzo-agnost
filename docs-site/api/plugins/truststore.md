# Truststore Plugin API Reference

Truststore plugin ishonchli sertifikatlar do'konini boshqarish uchun
mo'ljallangan. Bu plugin CA sertifikatlarini saqlash, verify qilish, trust
relationships ni boshqarish va sertifikat zanjirini validatsiya qilish uchun
ishlatiladi.

## Overview

Truststore plugin quyidagi funksiyalarni taqdim etadi:

- Truststore yaratish va boshqarish
- CA sertifikatlarini import/export qilish
- Trust relationships ni boshqarish
- Certificate chain validation
- Trusted root certificates management
- Cross-certification support

## Import

```typescript
// ES6 import
import { truststorePlugin } from 'imzo-agnost';

// CommonJS
const { truststorePlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.truststore;
```

## Types

```typescript
interface TruststoreInfo {
  truststoreId: string;
  name: string;
  type: 'PKCS12' | 'JKS' | 'PEM' | 'CUSTOM';
  created: string;
  lastModified: string;
  certificateCount: number;
  description?: string;
  version: string;
  protected: boolean;
}

interface TrustedCertificate {
  alias: string;
  certificate: string; // Base64 encoded
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  fingerprint: string;
  keyUsage: string[];
  trustLevel: 'ROOT' | 'INTERMEDIATE' | 'END_ENTITY';
  trusted: boolean;
  enabled: boolean;
  added: string;
  purpose: string[]; // 'SSL_SERVER', 'SSL_CLIENT', 'CODE_SIGNING', etc.
}

interface TrustPolicy {
  policyId: string;
  name: string;
  description: string;
  rules: TrustRule[];
  defaultAction: 'ALLOW' | 'DENY' | 'PROMPT';
  strictMode: boolean;
  enabled: boolean;
}

interface TrustRule {
  ruleId: string;
  condition: TrustCondition;
  action: 'TRUST' | 'DISTRUST' | 'PROMPT';
  priority: number;
  enabled: boolean;
}

interface TrustCondition {
  type: 'ISSUER' | 'SUBJECT' | 'KEYUSAGE' | 'EXTENSION' | 'CUSTOM';
  field?: string;
  operator: 'EQUALS' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'REGEX';
  value: string;
  caseSensitive?: boolean;
}

interface ValidationResult {
  valid: boolean;
  trusted: boolean;
  chainComplete: boolean;
  chain: CertificateChainInfo[];
  errors: string[];
  warnings: string[];
  trustPath: string[];
  validationTime: string;
}

interface CertificateChainInfo {
  certificate: string;
  subject: string;
  issuer: string;
  level: number; // 0 = end entity, 1+ = CA levels
  trusted: boolean;
  inTruststore: boolean;
  valid: boolean;
  purpose: string;
}
```

## Truststore Management

### createTruststoreAsync()

Yangi truststore yaratish.

```typescript
try {
  console.log('🏗️ Creating new truststore...');

  const truststoreResult = await truststorePlugin.createTruststoreAsync({
    name: 'Corporate Truststore',
    type: 'PKCS12',
    password: 'truststorePassword123',
    description: 'Corporate root and intermediate CA certificates',
    initialCertificates: [
      // Optional: Add initial certificates
      {
        alias: 'corporate_root_ca',
        certificate: 'MIIDroot...', // Root CA certificate
        trustLevel: 'ROOT',
        purpose: ['SSL_SERVER', 'SSL_CLIENT', 'CODE_SIGNING']
      },
      {
        alias: 'intermediate_ca',
        certificate: 'MIIDinter...', // Intermediate CA certificate
        trustLevel: 'INTERMEDIATE',
        purpose: ['SSL_SERVER', 'SSL_CLIENT']
      }
    ]
  });

  if (truststoreResult.success) {
    console.log('✅ Truststore created successfully');
    console.log('Truststore ID:', truststoreResult.truststoreId);
    console.log('Name:', truststoreResult.name);
    console.log('Type:', truststoreResult.type);
    console.log(
      'Initial certificates:',
      truststoreResult.initialCertificateCount
    );
    console.log('Protected:', truststoreResult.protected ? 'Yes' : 'No');

    if (truststoreResult.filePath) {
      console.log('File path:', truststoreResult.filePath);
    }

    return truststoreResult.truststoreId;
  } else {
    console.error('❌ Truststore creation failed:', truststoreResult.reason);
  }
} catch (error) {
  console.error('❌ Truststore creation error:', error);
}
```

### loadTruststoreAsync()

Mavjud truststore ni yuklash.

```typescript
try {
  const truststorePath = './certificates/corporate.p12';
  const password = 'truststorePassword123';

  console.log('📂 Loading truststore...');
  console.log('Path:', truststorePath);

  const loadResult = await truststorePlugin.loadTruststoreAsync({
    path: truststorePath,
    password: password,
    type: 'PKCS12',
    readOnly: false, // Allow modifications
    validateCertificates: true, // Validate all certificates on load
    autoRegister: true, // Auto-register with plugin
    truststoreId: 'corporate_truststore'
  });

  if (loadResult.success) {
    console.log('✅ Truststore loaded successfully');

    const info = loadResult.truststoreInfo;
    console.log('\n📋 Truststore Information:');
    console.log('Truststore ID:', info.truststoreId);
    console.log('Name:', info.name);
    console.log('Type:', info.type);
    console.log('Certificate count:', info.certificateCount);
    console.log('Created:', new Date(info.created).toLocaleString());
    console.log('Last modified:', new Date(info.lastModified).toLocaleString());
    console.log('Version:', info.version);
    console.log('Protected:', info.protected ? 'Yes' : 'No');

    if (info.description) {
      console.log('Description:', info.description);
    }

    // List certificates
    if (loadResult.certificates && loadResult.certificates.length > 0) {
      console.log('\n📄 Loaded Certificates:');
      loadResult.certificates.forEach((cert, index) => {
        console.log(`${index + 1}. ${cert.alias}`);
        console.log(`   Subject: ${cert.subject}`);
        console.log(`   Trust Level: ${cert.trustLevel}`);
        console.log(`   Trusted: ${cert.trusted ? '✅' : '❌'}`);
        console.log(
          `   Valid Until: ${new Date(cert.validTo).toLocaleDateString()}`
        );
        console.log(`   Purpose: ${cert.purpose.join(', ')}`);

        // Check expiry
        const daysUntilExpiry = Math.ceil(
          (new Date(cert.validTo).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry <= 0) {
          console.log('   ⚠️ EXPIRED');
        } else if (daysUntilExpiry < 90) {
          console.log(`   ⚠️ Expires in ${daysUntilExpiry} days`);
        }
      });
    }

    return info.truststoreId;
  } else {
    console.error('❌ Truststore loading failed:', loadResult.reason);
  }
} catch (error) {
  console.error('❌ Truststore loading error:', error);
}
```

### getTruststoreInfoAsync()

Truststore haqida ma'lumot olish.

```typescript
try {
  const truststoreId = 'corporate_truststore';

  console.log('📋 Getting truststore information...');

  const infoResult =
    await truststorePlugin.getTruststoreInfoAsync(truststoreId);

  if (infoResult.success) {
    const info = infoResult.truststoreInfo;

    console.log('✅ Truststore Information Retrieved:');
    console.log('═══════════════════════════════════════');

    // Basic information
    console.log('Truststore ID:', info.truststoreId);
    console.log('Name:', info.name);
    console.log('Type:', info.type);
    console.log('Certificate Count:', info.certificateCount);
    console.log('Created:', new Date(info.created).toLocaleString());
    console.log('Last Modified:', new Date(info.lastModified).toLocaleString());
    console.log('Version:', info.version);
    console.log(
      'Protected:',
      info.protected ? 'Yes (Password required)' : 'No'
    );

    if (info.description) {
      console.log('Description:', info.description);
    }

    // Statistics
    if (infoResult.statistics) {
      const stats = infoResult.statistics;
      console.log('\n📊 Statistics:');
      console.log('Root CAs:', stats.rootCertificates);
      console.log('Intermediate CAs:', stats.intermediateCertificates);
      console.log('End Entity Certificates:', stats.endEntityCertificates);
      console.log('Trusted Certificates:', stats.trustedCertificates);
      console.log('Enabled Certificates:', stats.enabledCertificates);
      console.log('Expired Certificates:', stats.expiredCertificates);
      console.log('Expiring Soon (< 90 days):', stats.expiringSoon);

      // File size if available
      if (stats.fileSize) {
        console.log('File Size:', formatBytes(stats.fileSize));
      }
    }

    // Health check
    if (infoResult.health) {
      const health = infoResult.health;
      console.log('\n🏥 Health Status:');
      console.log('Overall Status:', health.status); // 'healthy', 'warning', 'critical'

      if (health.issues && health.issues.length > 0) {
        console.log('Issues:');
        health.issues.forEach(issue => {
          console.log(`  - ${issue.severity}: ${issue.message}`);
        });
      }

      if (health.recommendations && health.recommendations.length > 0) {
        console.log('Recommendations:');
        health.recommendations.forEach(rec => {
          console.log(`  • ${rec}`);
        });
      }
    }

    return info;
  } else {
    console.error('❌ Failed to get truststore info:', infoResult.reason);
  }
} catch (error) {
  console.error('❌ Truststore info error:', error);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

## Certificate Management

### addCertificateAsync()

Truststorega sertifikat qo'shish.

```typescript
try {
  const truststoreId = 'corporate_truststore';
  const certificateBase64 = 'MIIDnew...'; // New certificate to add

  console.log('➕ Adding certificate to truststore...');

  const addResult = await truststorePlugin.addCertificateAsync(truststoreId, {
    certificate: certificateBase64,
    alias: 'new_intermediate_ca',
    trustLevel: 'INTERMEDIATE',
    trusted: true,
    enabled: true,
    purpose: ['SSL_SERVER', 'SSL_CLIENT'],
    validateBeforeAdd: true, // Validate certificate before adding
    checkDuplicates: true, // Check for existing certificates
    overwriteExisting: false, // Don't overwrite if alias exists
    metadata: {
      addedBy: 'Administrator',
      reason: 'New intermediate CA deployment',
      approvedBy: 'Security Team'
    }
  });

  if (addResult.success) {
    console.log('✅ Certificate added successfully');
    console.log('Alias:', addResult.alias);
    console.log('Subject:', addResult.subject);
    console.log('Issuer:', addResult.issuer);
    console.log('Trust Level:', addResult.trustLevel);
    console.log('Fingerprint:', addResult.fingerprint);
    console.log('Added Time:', new Date(addResult.added).toLocaleString());

    // Validation results
    if (addResult.validation) {
      const validation = addResult.validation;
      console.log('\n🔍 Certificate Validation:');
      console.log('Format valid:', validation.formatValid ? '✅' : '❌');
      console.log('Signature valid:', validation.signatureValid ? '✅' : '❌');
      console.log('Not expired:', validation.notExpired ? '✅' : '❌');
      console.log(
        'Trust chain exists:',
        validation.trustChainExists ? '✅' : '❌'
      );

      if (validation.warnings.length > 0) {
        console.log('\n⚠️ Warnings:');
        validation.warnings.forEach(warning => console.log(`  - ${warning}`));
      }
    }

    // Check if this creates new trust paths
    if (addResult.newTrustPaths && addResult.newTrustPaths.length > 0) {
      console.log('\n🛤️ New Trust Paths Created:');
      addResult.newTrustPaths.forEach(path => {
        console.log(`  ${path.from} → ${path.to}`);
      });
    }

    return addResult.alias;
  } else {
    console.error('❌ Certificate addition failed:', addResult.reason);
  }
} catch (error) {
  console.error('❌ Certificate addition error:', error);
}
```

### removeCertificateAsync()

Truststoredan sertifikatni o'chirish.

```typescript
try {
  const truststoreId = 'corporate_truststore';
  const certificateAlias = 'old_intermediate_ca';

  console.log('➖ Removing certificate from truststore...');
  console.log('Alias:', certificateAlias);

  // First, check dependencies
  const dependencyCheck =
    await truststorePlugin.checkCertificateDependenciesAsync(
      truststoreId,
      certificateAlias
    );

  if (dependencyCheck.hasDependencies) {
    console.log('⚠️ Certificate has dependencies:');
    dependencyCheck.dependencies.forEach(dep => {
      console.log(`  - ${dep.type}: ${dep.description}`);
    });

    const forceContinue = await confirmRemoval(
      certificateAlias,
      dependencyCheck.dependencies
    );
    if (!forceContinue) {
      console.log('🚫 Certificate removal cancelled');
      return;
    }
  }

  const removeResult = await truststorePlugin.removeCertificateAsync(
    truststoreId,
    certificateAlias,
    {
      createBackup: true, // Backup before removal
      validateImpact: true, // Check impact on trust paths
      forceDeletion: false, // Don't force if dependencies exist
      reason: 'Certificate expired and replaced',
      removedBy: 'Administrator'
    }
  );

  if (removeResult.success) {
    console.log('✅ Certificate removed successfully');
    console.log('Removed alias:', removeResult.removedAlias);
    console.log('Subject:', removeResult.subject);
    console.log('Backup created:', removeResult.backupCreated ? 'Yes' : 'No');

    if (removeResult.backupPath) {
      console.log('Backup location:', removeResult.backupPath);
    }

    // Impact analysis
    if (removeResult.impact) {
      const impact = removeResult.impact;
      console.log('\n📊 Removal Impact:');
      console.log('Broken trust paths:', impact.brokenTrustPaths);
      console.log('Affected certificates:', impact.affectedCertificates.length);

      if (impact.affectedCertificates.length > 0) {
        console.log('\n⚠️ Affected Certificates:');
        impact.affectedCertificates.forEach(cert => {
          console.log(`  - ${cert.alias}: ${cert.subject}`);
          console.log(`    Impact: ${cert.impactDescription}`);
        });
      }

      if (impact.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        impact.recommendations.forEach(rec => {
          console.log(`  • ${rec}`);
        });
      }
    }

    console.log('Removal time:', new Date().toLocaleString());
    console.log('Reason:', removeResult.reason);
  } else {
    console.error('❌ Certificate removal failed:', removeResult.reason);
  }
} catch (error) {
  console.error('❌ Certificate removal error:', error);
}

async function confirmRemoval(
  alias: string,
  dependencies: any[]
): Promise<boolean> {
  // In real application, this would be a user confirmation dialog
  console.log(
    `Are you sure you want to remove certificate '${alias}' despite dependencies?`
  );
  console.log('Dependencies:');
  dependencies.forEach(dep => {
    console.log(`  - ${dep.description}`);
  });

  // Simulate user confirmation
  return new Promise(resolve => {
    setTimeout(() => resolve(true), 1000);
  });
}
```

### listCertificatesAsync()

Truststoredagi sertifikatlarni ro'yxatlash.

```typescript
try {
  const truststoreId = 'corporate_truststore';

  console.log('📋 Listing truststore certificates...');

  const listResult = await truststorePlugin.listCertificatesAsync(
    truststoreId,
    {
      trustLevel: ['ROOT', 'INTERMEDIATE'], // Filter by trust level
      purpose: ['SSL_SERVER'], // Filter by purpose
      trusted: true, // Only trusted certificates
      enabled: true, // Only enabled certificates
      includeExpired: false, // Exclude expired certificates
      sortBy: 'validTo', // Sort by expiry date
      sortOrder: 'asc', // Ascending order
      includeDetails: true, // Include detailed information
      limit: 100 // Limit results
    }
  );

  if (listResult.success) {
    const certificates = listResult.certificates;

    console.log('✅ Certificates Retrieved:');
    console.log(`Total certificates: ${certificates.length}`);
    console.log('═══════════════════════════════════════');

    certificates.forEach((cert, index) => {
      console.log(`\n${index + 1}. ${cert.alias}`);
      console.log(`   Subject: ${cert.subject}`);
      console.log(`   Issuer: ${cert.issuer}`);
      console.log(`   Trust Level: ${cert.trustLevel}`);
      console.log(`   Serial Number: ${cert.serialNumber}`);
      console.log(
        `   Valid From: ${new Date(cert.validFrom).toLocaleDateString()}`
      );
      console.log(
        `   Valid To: ${new Date(cert.validTo).toLocaleDateString()}`
      );
      console.log(`   Trusted: ${cert.trusted ? '✅' : '❌'}`);
      console.log(`   Enabled: ${cert.enabled ? '✅' : '❌'}`);
      console.log(`   Purpose: ${cert.purpose.join(', ')}`);
      console.log(`   Added: ${new Date(cert.added).toLocaleDateString()}`);

      // Expiry warning
      const daysUntilExpiry = Math.ceil(
        (new Date(cert.validTo).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 0) {
        console.log('   ⚠️ EXPIRED');
      } else if (daysUntilExpiry < 90) {
        console.log(`   ⚠️ Expires in ${daysUntilExpiry} days`);
      }
    });

    // Summary statistics
    console.log('\n📊 Summary:');
    const stats = {
      total: certificates.length,
      root: certificates.filter(c => c.trustLevel === 'ROOT').length,
      intermediate: certificates.filter(c => c.trustLevel === 'INTERMEDIATE')
        .length,
      trusted: certificates.filter(c => c.trusted).length,
      enabled: certificates.filter(c => c.enabled).length,
      expired: certificates.filter(c => new Date(c.validTo) < new Date()).length
    };

    console.log(`Root CAs: ${stats.root}`);
    console.log(`Intermediate CAs: ${stats.intermediate}`);
    console.log(`Trusted: ${stats.trusted}`);
    console.log(`Enabled: ${stats.enabled}`);
    console.log(`Expired: ${stats.expired}`);

    // Group by purpose
    const byPurpose = certificates.reduce((groups, cert) => {
      cert.purpose.forEach(purpose => {
        if (!groups[purpose]) groups[purpose] = [];
        groups[purpose].push(cert);
      });
      return groups;
    }, {});

    console.log('\n📈 By Purpose:');
    Object.entries(byPurpose).forEach(([purpose, certList]) => {
      console.log(`${purpose}: ${certList.length} certificates`);
    });

    return certificates;
  } else {
    console.error('❌ Failed to list certificates:', listResult.reason);
  }
} catch (error) {
  console.error('❌ Certificate listing error:', error);
}
```

## Certificate Chain Validation

### validateCertificateChainAsync()

Sertifikat zanjirini validate qilish.

```typescript
try {
  const truststoreId = 'corporate_truststore';
  const certificateToValidate = 'MIIDend...'; // End-entity certificate

  console.log('🔍 Validating certificate chain...');

  const validationResult = await truststorePlugin.validateCertificateChainAsync(
    truststoreId,
    certificateToValidate,
    {
      buildChain: true, // Build complete chain
      checkRevocation: true, // Check revocation status
      requireCompleteChain: true, // Require complete chain to root
      allowSelfSigned: false, // Don't allow self-signed certificates
      checkKeyUsage: true, // Validate key usage
      checkBasicConstraints: true, // Validate basic constraints
      maxChainLength: 10, // Maximum chain length
      purpose: 'SSL_SERVER', // Validation purpose
      verificationTime: new Date(), // Verification time (current time)
      strictMode: true // Strict validation
    }
  );

  if (validationResult.success) {
    console.log('✅ Certificate chain validation completed');

    const validation = validationResult.validation;

    console.log('\n🔍 Validation Results:');
    console.log('═══════════════════════');
    console.log('Overall Valid:', validation.valid ? '✅' : '❌');
    console.log('Trusted:', validation.trusted ? '✅' : '❌');
    console.log('Chain Complete:', validation.chainComplete ? '✅' : '❌');
    console.log(
      'Verification Time:',
      new Date(validation.validationTime).toLocaleString()
    );

    // Certificate chain
    console.log('\n📄 Certificate Chain:');
    validation.chain.forEach((cert, index) => {
      const level = cert.level;
      const indent = '  '.repeat(level);

      console.log(`${indent}${index + 1}. Level ${level}: ${cert.subject}`);
      console.log(`${indent}   Issued by: ${cert.issuer}`);
      console.log(
        `${indent}   In Truststore: ${cert.inTruststore ? '✅' : '❌'}`
      );
      console.log(`${indent}   Trusted: ${cert.trusted ? '✅' : '❌'}`);
      console.log(`${indent}   Valid: ${cert.valid ? '✅' : '❌'}`);
      console.log(`${indent}   Purpose: ${cert.purpose}`);
    });

    // Trust path
    if (validation.trustPath.length > 0) {
      console.log('\n🛤️ Trust Path:');
      validation.trustPath.forEach((step, index) => {
        console.log(`${index + 1}. ${step}`);
      });
    }

    // Validation errors
    if (validation.errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      validation.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    // Validation warnings
    if (validation.warnings.length > 0) {
      console.log('\n⚠️ Validation Warnings:');
      validation.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }

    // Chain analysis
    console.log('\n📊 Chain Analysis:');
    const rootCA = validation.chain.find(
      cert => cert.level === validation.chain.length - 1
    );
    const endEntity = validation.chain.find(cert => cert.level === 0);

    if (rootCA) {
      console.log('Root CA:', rootCA.subject);
      console.log('Root CA Trusted:', rootCA.trusted ? '✅' : '❌');
    }

    if (endEntity) {
      console.log('End Entity:', endEntity.subject);
    }

    console.log('Chain Length:', validation.chain.length);
    console.log('Max Chain Length Allowed:', 10);

    // Overall assessment
    console.log('\n🎯 Assessment:');
    if (validation.valid && validation.trusted) {
      console.log('✅ Certificate is valid and trusted');
      console.log(
        'The certificate can be safely used for the specified purpose'
      );
    } else if (validation.chainComplete && !validation.trusted) {
      console.log('⚠️ Certificate chain is complete but not trusted');
      console.log('The root CA is not in the truststore');
    } else if (!validation.chainComplete) {
      console.log('❌ Certificate chain is incomplete');
      console.log('Cannot establish trust path to a trusted root');
    } else {
      console.log('❌ Certificate validation failed');
      console.log('Certificate should not be trusted');
    }

    return validation;
  } else {
    console.error(
      '❌ Certificate chain validation failed:',
      validationResult.reason
    );
  }
} catch (error) {
  console.error('❌ Certificate chain validation error:', error);
}
```

### buildCertificateChainAsync()

Sertifikat zanjirini build qilish.

```typescript
try {
  const truststoreId = 'corporate_truststore';
  const endEntityCert = 'MIIDend...'; // End-entity certificate

  console.log('🔗 Building certificate chain...');

  const chainResult = await truststorePlugin.buildCertificateChainAsync(
    truststoreId,
    endEntityCert,
    {
      intermediateCertificates: [
        // Additional intermediate certificates
        'MIIDint1...', // Intermediate CA 1
        'MIIDint2...' // Intermediate CA 2
      ],
      searchMode: 'COMPREHENSIVE', // 'FAST', 'COMPREHENSIVE', 'EXHAUSTIVE'
      includeRoot: true, // Include root CA in chain
      orderFromRoot: false, // Order from end-entity to root
      allowCrossCertification: true, // Allow cross-certified chains
      maxSearchDepth: 10, // Maximum search depth
      cacheResults: true // Cache intermediate results
    }
  );

  if (chainResult.success) {
    console.log('✅ Certificate chain built successfully');

    const chain = chainResult.chain;
    console.log(`Chain length: ${chain.length} certificates`);
    console.log(`Search time: ${chainResult.searchTime}ms`);
    console.log(`Cached results used: ${chainResult.cacheHits || 0}`);

    console.log('\n🔗 Certificate Chain:');
    chain.forEach((cert, index) => {
      console.log(`\n${index + 1}. ${cert.subject}`);
      console.log(`   Issued by: ${cert.issuer}`);
      console.log(`   Serial: ${cert.serialNumber}`);
      console.log(
        `   Valid from: ${new Date(cert.validFrom).toLocaleDateString()}`
      );
      console.log(
        `   Valid to: ${new Date(cert.validTo).toLocaleDateString()}`
      );
      console.log(`   In truststore: ${cert.inTruststore ? '✅' : '❌'}`);
      console.log(`   Trust level: ${cert.trustLevel}`);

      if (cert.keyUsage && cert.keyUsage.length > 0) {
        console.log(`   Key usage: ${cert.keyUsage.join(', ')}`);
      }
    });

    // Chain validation summary
    console.log('\n📊 Chain Summary:');
    const rootCert = chain[chain.length - 1];
    const endEntityCert = chain[0];

    console.log('End Entity:', endEntityCert.subject);
    console.log('Root CA:', rootCert.subject);
    console.log('Intermediate CAs:', chain.length - 2);

    // Check for issues
    const expiredCerts = chain.filter(
      cert => new Date(cert.validTo) < new Date()
    );
    const untrustedCerts = chain.filter(cert => !cert.inTruststore);

    if (expiredCerts.length > 0) {
      console.log('\n⚠️ Expired certificates in chain:');
      expiredCerts.forEach(cert => {
        console.log(`  - ${cert.subject}`);
      });
    }

    if (untrustedCerts.length > 0) {
      console.log('\n⚠️ Certificates not in truststore:');
      untrustedCerts.forEach(cert => {
        console.log(`  - ${cert.subject}`);
      });
    }

    // Alternative chains
    if (
      chainResult.alternativeChains &&
      chainResult.alternativeChains.length > 0
    ) {
      console.log('\n🔄 Alternative Chains Found:');
      chainResult.alternativeChains.forEach((altChain, index) => {
        console.log(`${index + 1}. Chain via: ${altChain.rootCA}`);
        console.log(`   Length: ${altChain.length} certificates`);
        console.log(`   Trust score: ${altChain.trustScore}`);
      });
    }

    return chain;
  } else {
    console.error('❌ Certificate chain building failed:', chainResult.reason);
  }
} catch (error) {
  console.error('❌ Certificate chain building error:', error);
}
```

## Trust Policy Management

### createTrustPolicyAsync()

Trust policy yaratish.

```typescript
try {
  console.log('📋 Creating trust policy...');

  const policyResult = await truststorePlugin.createTrustPolicyAsync({
    name: 'Corporate Security Policy',
    description:
      'Trust policy for corporate certificates and external partners',
    defaultAction: 'DENY', // Default to deny unless explicitly trusted
    strictMode: true, // Strict policy enforcement
    rules: [
      {
        // Trust corporate root CA
        condition: {
          type: 'ISSUER',
          operator: 'EQUALS',
          value: 'CN=Corporate Root CA, O=My Company, C=US'
        },
        action: 'TRUST',
        priority: 1,
        enabled: true
      },
      {
        // Trust partner CA for specific purposes
        condition: {
          type: 'ISSUER',
          operator: 'CONTAINS',
          value: 'Partner CA'
        },
        action: 'TRUST',
        priority: 2,
        enabled: true
      },
      {
        // Distrust specific compromised CA
        condition: {
          type: 'ISSUER',
          operator: 'CONTAINS',
          value: 'Compromised CA'
        },
        action: 'DISTRUST',
        priority: 0, // Highest priority
        enabled: true
      },
      {
        // Require code signing usage for code signing certificates
        condition: {
          type: 'KEYUSAGE',
          operator: 'CONTAINS',
          value: 'digitalSignature'
        },
        action: 'TRUST',
        priority: 3,
        enabled: true
      },
      {
        // Prompt for unknown CAs
        condition: {
          type: 'CUSTOM',
          operator: 'EQUALS',
          value: 'unknown_issuer'
        },
        action: 'PROMPT',
        priority: 10,
        enabled: true
      }
    ],
    enabled: true
  });

  if (policyResult.success) {
    console.log('✅ Trust policy created successfully');
    console.log('Policy ID:', policyResult.policyId);
    console.log('Name:', policyResult.name);
    console.log('Rules created:', policyResult.rulesCreated);
    console.log('Default action:', policyResult.defaultAction);
    console.log(
      'Strict mode:',
      policyResult.strictMode ? 'Enabled' : 'Disabled'
    );

    // Validate policy rules
    if (policyResult.validation) {
      const validation = policyResult.validation;
      console.log('\n🔍 Policy Validation:');
      console.log('Valid:', validation.valid ? '✅' : '❌');
      console.log('Rule conflicts:', validation.conflicts);
      console.log('Coverage gaps:', validation.gaps);

      if (validation.warnings.length > 0) {
        console.log('\n⚠️ Policy Warnings:');
        validation.warnings.forEach(warning => {
          console.log(`  - ${warning}`);
        });
      }
    }

    return policyResult.policyId;
  } else {
    console.error('❌ Trust policy creation failed:', policyResult.reason);
  }
} catch (error) {
  console.error('❌ Trust policy creation error:', error);
}
```

### applyTrustPolicyAsync()

Trust policy ni truststorega qo'llash.

```typescript
try {
  const truststoreId = 'corporate_truststore';
  const policyId = 'corporate_security_policy';

  console.log('🔒 Applying trust policy to truststore...');
  console.log('Truststore:', truststoreId);
  console.log('Policy:', policyId);

  const applyResult = await truststorePlugin.applyTrustPolicyAsync(
    truststoreId,
    policyId,
    {
      dryRun: false, // Actually apply changes
      backupBeforeApply: true, // Create backup before applying
      validateBeforeApply: true, // Validate policy before applying
      overridePrevious: true, // Override previous policy
      logActions: true, // Log all policy actions
      notifyChanges: true // Notify about changes
    }
  );

  if (applyResult.success) {
    console.log('✅ Trust policy applied successfully');

    // Application summary
    const summary = applyResult.summary;
    console.log('\n📊 Application Summary:');
    console.log('Certificates processed:', summary.certificatesProcessed);
    console.log('Trust status changed:', summary.trustStatusChanged);
    console.log('Certificates enabled:', summary.certificatesEnabled);
    console.log('Certificates disabled:', summary.certificatesDisabled);
    console.log('New trust relationships:', summary.newTrustRelationships);
    console.log(
      'Removed trust relationships:',
      summary.removedTrustRelationships
    );

    // Detailed changes
    if (applyResult.changes && applyResult.changes.length > 0) {
      console.log('\n📋 Detailed Changes:');
      applyResult.changes.forEach((change, index) => {
        console.log(`\n${index + 1}. ${change.certificate}`);
        console.log(`   Action: ${change.action}`);
        console.log(`   Previous status: ${change.previousStatus}`);
        console.log(`   New status: ${change.newStatus}`);
        console.log(`   Rule applied: ${change.ruleApplied}`);

        if (change.reason) {
          console.log(`   Reason: ${change.reason}`);
        }
      });
    }

    // Policy conflicts
    if (applyResult.conflicts && applyResult.conflicts.length > 0) {
      console.log('\n⚠️ Policy Conflicts:');
      applyResult.conflicts.forEach(conflict => {
        console.log(`  - ${conflict.certificate}: ${conflict.description}`);
        console.log(`    Resolution: ${conflict.resolution}`);
      });
    }

    // Backup information
    if (applyResult.backupInfo) {
      console.log('\n💾 Backup Information:');
      console.log(
        'Backup created:',
        applyResult.backupInfo.created ? '✅' : '❌'
      );
      console.log('Backup path:', applyResult.backupInfo.path);
      console.log(
        'Backup time:',
        new Date(applyResult.backupInfo.timestamp).toLocaleString()
      );
    }

    console.log(
      '\nPolicy application completed at:',
      new Date().toLocaleString()
    );

    return applyResult;
  } else {
    console.error('❌ Trust policy application failed:', applyResult.reason);
  }
} catch (error) {
  console.error('❌ Trust policy application error:', error);
}
```

## Complete Examples

### Complete Truststore Management Workflow

```typescript
async function setupCorporateTruststore() {
  try {
    console.log('🏢 Setting up corporate truststore...');

    // 1. Create new truststore
    console.log('\n1. Creating corporate truststore...');

    const truststoreResult = await truststorePlugin.createTruststoreAsync({
      name: 'Corporate Root Truststore',
      type: 'PKCS12',
      password: 'CorporateTS2024!',
      description: 'Corporate trusted root and intermediate certificates'
    });

    if (!truststoreResult.success) {
      throw new Error(`Truststore creation failed: ${truststoreResult.reason}`);
    }

    const truststoreId = truststoreResult.truststoreId;
    console.log('✅ Truststore created:', truststoreId);

    // 2. Add corporate root CA
    console.log('\n2. Adding corporate root CA...');

    const corporateRootCA = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/corporate/root/ca...
-----END CERTIFICATE-----`;

    const rootCAResult = await truststorePlugin.addCertificateAsync(
      truststoreId,
      {
        certificate: corporateRootCA,
        alias: 'corporate_root_ca',
        trustLevel: 'ROOT',
        trusted: true,
        enabled: true,
        purpose: ['SSL_SERVER', 'SSL_CLIENT', 'CODE_SIGNING', 'EMAIL'],
        validateBeforeAdd: true,
        metadata: {
          addedBy: 'System Administrator',
          reason: 'Corporate root CA deployment',
          department: 'IT Security'
        }
      }
    );

    if (!rootCAResult.success) {
      throw new Error(`Root CA addition failed: ${rootCAResult.reason}`);
    }

    console.log('✅ Corporate root CA added');

    // 3. Add intermediate CAs
    console.log('\n3. Adding intermediate CAs...');

    const intermediateCAs = [
      {
        certificate:
          '-----BEGIN CERTIFICATE-----\nMIIDint1...\n-----END CERTIFICATE-----',
        alias: 'corporate_ssl_intermediate_ca',
        purpose: ['SSL_SERVER', 'SSL_CLIENT']
      },
      {
        certificate:
          '-----BEGIN CERTIFICATE-----\nMIIDint2...\n-----END CERTIFICATE-----',
        alias: 'corporate_codesigning_intermediate_ca',
        purpose: ['CODE_SIGNING']
      },
      {
        certificate:
          '-----BEGIN CERTIFICATE-----\nMIIDint3...\n-----END CERTIFICATE-----',
        alias: 'corporate_email_intermediate_ca',
        purpose: ['EMAIL']
      }
    ];

    for (const ca of intermediateCAs) {
      const intResult = await truststorePlugin.addCertificateAsync(
        truststoreId,
        {
          certificate: ca.certificate,
          alias: ca.alias,
          trustLevel: 'INTERMEDIATE',
          trusted: true,
          enabled: true,
          purpose: ca.purpose,
          validateBeforeAdd: true
        }
      );

      if (intResult.success) {
        console.log(`✅ Added intermediate CA: ${ca.alias}`);
      } else {
        console.log(`⚠️ Failed to add ${ca.alias}: ${intResult.reason}`);
      }
    }

    // 4. Add trusted partner CAs
    console.log('\n4. Adding trusted partner CAs...');

    const partnerCAs = [
      {
        certificate:
          '-----BEGIN CERTIFICATE-----\nMIIDpartner1...\n-----END CERTIFICATE-----',
        alias: 'partner_company_a_ca',
        purpose: ['SSL_SERVER'],
        metadata: { partner: 'Company A', contract: 'PARTNER-2024-001' }
      },
      {
        certificate:
          '-----BEGIN CERTIFICATE-----\nMIIDpartner2...\n-----END CERTIFICATE-----',
        alias: 'partner_company_b_ca',
        purpose: ['SSL_CLIENT'],
        metadata: { partner: 'Company B', contract: 'PARTNER-2024-002' }
      }
    ];

    for (const partner of partnerCAs) {
      const partnerResult = await truststorePlugin.addCertificateAsync(
        truststoreId,
        {
          certificate: partner.certificate,
          alias: partner.alias,
          trustLevel: 'ROOT', // Partners are treated as roots for their domains
          trusted: true,
          enabled: true,
          purpose: partner.purpose,
          validateBeforeAdd: true,
          metadata: partner.metadata
        }
      );

      if (partnerResult.success) {
        console.log(`✅ Added partner CA: ${partner.alias}`);
      } else {
        console.log(
          `⚠️ Failed to add ${partner.alias}: ${partnerResult.reason}`
        );
      }
    }

    // 5. Create and apply trust policy
    console.log('\n5. Creating trust policy...');

    const policyResult = await truststorePlugin.createTrustPolicyAsync({
      name: 'Corporate Trust Policy v1.0',
      description: 'Corporate security policy for certificate trust management',
      defaultAction: 'DENY',
      strictMode: true,
      rules: [
        {
          condition: {
            type: 'ISSUER',
            operator: 'CONTAINS',
            value: 'Corporate Root CA'
          },
          action: 'TRUST',
          priority: 1,
          enabled: true
        },
        {
          condition: {
            type: 'ISSUER',
            operator: 'CONTAINS',
            value: 'Partner Company'
          },
          action: 'TRUST',
          priority: 2,
          enabled: true
        },
        {
          condition: {
            type: 'KEYUSAGE',
            operator: 'CONTAINS',
            value: 'keyCertSign'
          },
          action: 'TRUST',
          priority: 3,
          enabled: true
        }
      ],
      enabled: true
    });

    if (policyResult.success) {
      console.log('✅ Trust policy created');

      // Apply policy
      const applyResult = await truststorePlugin.applyTrustPolicyAsync(
        truststoreId,
        policyResult.policyId,
        { backupBeforeApply: true }
      );

      if (applyResult.success) {
        console.log('✅ Trust policy applied');
      }
    }

    // 6. Test certificate validation
    console.log('\n6. Testing certificate validation...');

    const testCertificate =
      '-----BEGIN CERTIFICATE-----\nMIIDtest...\n-----END CERTIFICATE-----';

    const validationResult =
      await truststorePlugin.validateCertificateChainAsync(
        truststoreId,
        testCertificate,
        {
          buildChain: true,
          checkRevocation: false, // Skip for demo
          purpose: 'SSL_SERVER'
        }
      );

    if (validationResult.success) {
      const validation = validationResult.validation;
      console.log('✅ Test certificate validation completed');
      console.log('Valid:', validation.valid ? '✅' : '❌');
      console.log('Trusted:', validation.trusted ? '✅' : '❌');
      console.log('Chain length:', validation.chain.length);
    }

    // 7. Export truststore backup
    console.log('\n7. Creating truststore backup...');

    const backupResult = await truststorePlugin.exportTruststoreAsync(
      truststoreId,
      {
        format: 'PKCS12',
        password: 'BackupTS2024!',
        includePrivateKeys: false,
        includeTrustSettings: true,
        includeMetadata: true
      }
    );

    if (backupResult.success) {
      const backupFileName = `corporate_truststore_backup_${Date.now()}.p12`;
      await saveExportedFile(backupFileName, backupResult.data, 'binary');
      console.log('✅ Truststore backup created:', backupFileName);
    }

    // 8. Generate truststore report
    console.log('\n8. Generating truststore report...');

    const listResult =
      await truststorePlugin.listCertificatesAsync(truststoreId);
    const infoResult =
      await truststorePlugin.getTruststoreInfoAsync(truststoreId);

    const report = {
      timestamp: new Date().toISOString(),
      truststore: {
        id: truststoreId,
        name: infoResult.truststoreInfo.name,
        type: infoResult.truststoreInfo.type,
        certificateCount: infoResult.truststoreInfo.certificateCount
      },
      certificates: listResult.certificates.map(cert => ({
        alias: cert.alias,
        subject: cert.subject,
        trustLevel: cert.trustLevel,
        purpose: cert.purpose,
        validTo: cert.validTo,
        trusted: cert.trusted,
        enabled: cert.enabled
      })),
      statistics: {
        totalCertificates: listResult.certificates.length,
        rootCAs: listResult.certificates.filter(c => c.trustLevel === 'ROOT')
          .length,
        intermediateCAs: listResult.certificates.filter(
          c => c.trustLevel === 'INTERMEDIATE'
        ).length,
        trustedCertificates: listResult.certificates.filter(c => c.trusted)
          .length,
        enabledCertificates: listResult.certificates.filter(c => c.enabled)
          .length
      },
      security: {
        policyApplied: true,
        policyId: policyResult.policyId,
        strictMode: true,
        backupCreated: true
      },
      recommendations: [
        'Regularly update intermediate certificates',
        'Monitor certificate expiration dates',
        'Review partner certificate agreements annually',
        'Audit trust policy rules quarterly'
      ]
    };

    const reportFileName = `corporate_truststore_report_${Date.now()}.json`;
    await saveExportedFile(
      reportFileName,
      JSON.stringify(report, null, 2),
      'text'
    );

    console.log('\n🎉 Corporate truststore setup completed!');
    console.log('═══════════════════════════════════════════');
    console.log('📋 Setup Summary:');
    console.log(`Truststore ID: ${truststoreId}`);
    console.log(`Total certificates: ${report.statistics.totalCertificates}`);
    console.log(`Root CAs: ${report.statistics.rootCAs}`);
    console.log(`Intermediate CAs: ${report.statistics.intermediateCAs}`);
    console.log(
      `Trust policy: ${policyResult.success ? 'Applied' : 'Not applied'}`
    );
    console.log(`Backup created: ${backupResult.success ? 'Yes' : 'No'}`);
    console.log(`Report: ${reportFileName}`);

    return {
      truststoreId: truststoreId,
      report: report,
      backupFile: backupResult.success
        ? `corporate_truststore_backup_${Date.now()}.p12`
        : null
    };
  } catch (error) {
    console.error('❌ Corporate truststore setup failed:', error);
    throw error;
  }
}

async function saveExportedFile(
  fileName: string,
  data: string,
  type: 'text' | 'binary'
): Promise<void> {
  console.log(`💾 Saving ${fileName} (${type} format)`);
  // Implementation depends on environment
}
```

## Callback API (Legacy)

### createTruststore() - Callback Version

```typescript
truststorePlugin.createTruststore(
  {
    name: 'My Truststore',
    type: 'PKCS12',
    password: 'password123'
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Truststore created');
      console.log('ID:', response.truststoreId);
    } else {
      console.error('Callback: Creation failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Creation error:', error);
  }
);
```

### validateCertificateChain() - Callback Version

```typescript
truststorePlugin.validateCertificateChain(
  truststoreId,
  certificate,
  {
    buildChain: true,
    checkRevocation: true
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Validation completed');
      console.log('Valid:', response.validation.valid);
      console.log('Trusted:', response.validation.trusted);
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

### Truststore Creation/Loading Errors

```typescript
try {
  const result = await truststorePlugin.createTruststoreAsync(params);
} catch (error) {
  if (error.message.includes('invalid password')) {
    console.error('❌ Invalid truststore password');
  } else if (error.message.includes('file exists')) {
    console.error('❌ Truststore file already exists');
  } else if (error.message.includes('invalid type')) {
    console.error('❌ Unsupported truststore type');
  } else if (error.message.includes('permission denied')) {
    console.error('❌ Permission denied - check file access rights');
  } else {
    console.error('❌ Truststore creation error:', error.message);
  }
}
```

### Certificate Addition Errors

```typescript
try {
  const result = await truststorePlugin.addCertificateAsync(
    truststoreId,
    params
  );
} catch (error) {
  if (error.message.includes('duplicate alias')) {
    console.error('❌ Certificate alias already exists');
  } else if (error.message.includes('invalid certificate')) {
    console.error('❌ Certificate format is invalid');
  } else if (error.message.includes('truststore not found')) {
    console.error('❌ Truststore not found or not loaded');
  } else if (error.message.includes('validation failed')) {
    console.error('❌ Certificate validation failed');
  } else {
    console.error('❌ Certificate addition error:', error.message);
  }
}
```

## Best Practices

1.  **Password Security**: Use strong passwords for truststore protection
2.  **Certificate Validation**: Always validate certificates before adding to
    truststore
3.  **Regular Backups**: Create regular backups of truststore data
4.  **Access Control**: Implement proper access controls for truststore
    operations
5.  **Certificate Monitoring**: Monitor certificate expiration dates
6.  **Trust Policy**: Implement and regularly review trust policies
7.  **Audit Trail**: Maintain logs of truststore modifications
8.  **Version Control**: Version control truststore configurations
9.  **Testing**: Regular testing of certificate validation workflows
10. **Documentation**: Document trust relationships and policies clearly
