# CRL Plugin API Reference

CRL (Certificate Revocation List) plugin bekor qilingan sertifikatlar ro'yxati
bilan ishlash uchun mo'ljallangan. Bu plugin CRL ni yuklab olish, tekshirish,
parse qilish va sertifikat bekor qilinish holatini aniqlash uchun ishlatiladi.

## Overview

CRL plugin quyidagi funksiyalarni taqdim etadi:

- CRL ni CA serveridan yuklab olish
- CRL ni parse qilish va ma'lumotlarini olish
- Sertifikat revocation holatini tekshirish
- CRL validatsiyasi va verification
- Offline CRL management
- CRL cache va update qilish

## Import

```typescript
// ES6 import
import { crlPlugin } from 'imzo-agnost';

// CommonJS
const { crlPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.crl;
```

## Types

```typescript
interface CRLInfo {
  version: number;
  issuer: string;
  thisUpdate: string; // ISO string
  nextUpdate?: string; // ISO string
  signatureAlgorithm: string;
  signature: string; // Base64
  revokedCertificates: RevokedCertificate[];
  extensions?: CRLExtension[];
  crlNumber?: number;
  deltaCRLIndicator?: number;
}

interface RevokedCertificate {
  serialNumber: string;
  revocationDate: string; // ISO string
  reason?: RevocationReason;
  extensions?: CertificateExtension[];
}

interface CRLExtension {
  oid: string;
  critical: boolean;
  value: string; // Base64
  name?: string;
}

interface RevocationReason {
  code: number;
  reason:
    | 'unspecified'
    | 'keyCompromise'
    | 'cACompromise'
    | 'affiliationChanged'
    | 'superseded'
    | 'cessationOfOperation'
    | 'certificateHold'
    | 'removeFromCRL'
    | 'privilegeWithdrawn'
    | 'aACompromise';
}

interface CRLValidationResult {
  success: boolean;
  valid: boolean;
  current: boolean; // thisUpdate <= now <= nextUpdate
  signatureValid: boolean;
  issuerValid: boolean;
  errors: string[];
  warnings: string[];
  validFrom: string;
  validUntil: string;
  daysUntilExpiry?: number;
}

interface RevocationCheckResult {
  revoked: boolean;
  revocationDate?: string;
  reason?: RevocationReason;
  serialNumber: string;
  crlIssuer: string;
  crlThisUpdate: string;
  crlNextUpdate?: string;
}

interface CRLDownloadParams {
  distributionPoint: string; // CRL Distribution Point URL
  timeout?: number; // Request timeout in seconds
  retryCount?: number; // Number of retry attempts
  validateSignature?: boolean; // Validate CRL signature
  cacheDir?: string; // Local cache directory
  useCache?: boolean; // Use cached CRL if available
  maxCacheAge?: number; // Max cache age in hours
}
```

## CRL Download and Loading

### downloadCRLAsync()

CRL ni distribution point dan yuklab olish.

```typescript
try {
  const distributionPoint = 'http://ca.example.com/crl/ca.crl';

  console.log('📥 Downloading CRL...');
  console.log('Distribution Point:', distributionPoint);

  const downloadResult = await crlPlugin.downloadCRLAsync({
    distributionPoint: distributionPoint,
    timeout: 30, // 30 seconds timeout
    retryCount: 3, // 3 retry attempts
    validateSignature: true, // Validate CRL signature
    useCache: true, // Use cache if available
    maxCacheAge: 24, // Cache valid for 24 hours
    cacheDir: './crl_cache' // Local cache directory
  });

  if (downloadResult.success) {
    console.log('✅ CRL downloaded successfully');
    console.log('CRL size:', downloadResult.size, 'bytes');
    console.log('Content type:', downloadResult.contentType);
    console.log('Last modified:', downloadResult.lastModified);
    console.log('Cached:', downloadResult.fromCache ? 'Yes' : 'No');
    console.log('Cache path:', downloadResult.cachePath);

    if (downloadResult.validationResult) {
      const validation = downloadResult.validationResult;
      console.log(
        'CRL validation:',
        validation.valid ? '✅ Valid' : '❌ Invalid'
      );
      console.log(
        'Current:',
        validation.current ? '✅ Current' : '⚠️ Outdated'
      );
      console.log('Signature valid:', validation.signatureValid ? '✅' : '❌');

      if (validation.daysUntilExpiry !== undefined) {
        console.log(`Expires in: ${validation.daysUntilExpiry} days`);
      }
    }

    return downloadResult.crlData; // Base64 encoded CRL
  } else {
    console.error('❌ CRL download failed:', downloadResult.reason);
    console.error('Error details:', downloadResult.error);
  }
} catch (error) {
  console.error('❌ CRL download error:', error);
}
```

### loadCRLFromFileAsync()

Lokal fayldan CRL yuklab olish.

```typescript
try {
  const crlFilePath = './certificates/ca.crl';

  console.log('📂 Loading CRL from file...');
  console.log('File path:', crlFilePath);

  const loadResult = await crlPlugin.loadCRLFromFileAsync(crlFilePath, {
    format: 'DER', // 'DER' or 'PEM'
    validate: true, // Validate CRL format
    checkSignature: true, // Verify signature
    issuerCert: 'ca_cert_id' // Issuer certificate for verification
  });

  if (loadResult.success) {
    console.log('✅ CRL loaded from file');
    console.log('File size:', loadResult.fileSize, 'bytes');
    console.log('Format:', loadResult.detectedFormat);
    console.log('CRL data loaded:', loadResult.crlData ? 'Yes' : 'No');

    if (loadResult.validation) {
      const validation = loadResult.validation;
      console.log('CRL validation:');
      console.log('  Format valid:', validation.formatValid ? '✅' : '❌');
      console.log(
        '  Signature valid:',
        validation.signatureValid ? '✅' : '❌'
      );
      console.log('  Current:', validation.current ? '✅' : '⚠️');
    }

    return loadResult.crlData;
  } else {
    console.error('❌ CRL file loading failed:', loadResult.reason);
  }
} catch (error) {
  console.error('❌ CRL file loading error:', error);
}
```

### loadCRLFromBase64Async()

Base64 string dan CRL yuklab olish.

```typescript
try {
  const crlBase64 = 'MIICyz...'; // Your CRL in base64

  console.log('📄 Loading CRL from base64...');

  const loadResult = await crlPlugin.loadCRLFromBase64Async(crlBase64, {
    validate: true,
    checkSignature: true,
    issuerCert: 'ca_cert_id',
    strictMode: false // Allow some validation warnings
  });

  if (loadResult.success) {
    console.log('✅ CRL loaded from base64');
    console.log('Data size:', crlBase64.length, 'characters');
    console.log('Parsed successfully:', loadResult.parsed ? 'Yes' : 'No');

    return loadResult.crlData;
  } else {
    console.error('❌ CRL base64 loading failed:', loadResult.reason);
  }
} catch (error) {
  console.error('❌ CRL base64 loading error:', error);
}
```

## CRL Information and Analysis

### parseCRLAsync()

CRL ni parse qilish va ma'lumotlarini olish.

```typescript
try {
  const crlBase64 = 'MIICyz...'; // Your CRL data

  console.log('🔍 Parsing CRL...');

  const parseResult = await crlPlugin.parseCRLAsync(crlBase64);

  if (parseResult.success) {
    const crlInfo = parseResult.crlInfo;

    console.log('📋 CRL Information:');
    console.log('═══════════════════');

    // Basic information
    console.log('Version:', crlInfo.version);
    console.log('Issuer:', crlInfo.issuer);
    console.log('This update:', new Date(crlInfo.thisUpdate).toLocaleString());

    if (crlInfo.nextUpdate) {
      console.log(
        'Next update:',
        new Date(crlInfo.nextUpdate).toLocaleString()
      );

      // Calculate validity period
      const now = new Date();
      const nextUpdate = new Date(crlInfo.nextUpdate);
      const hoursUntilExpiry = Math.round(
        (nextUpdate.getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      if (hoursUntilExpiry > 0) {
        console.log(
          `Valid for: ${hoursUntilExpiry} hours (${Math.round(hoursUntilExpiry / 24)} days)`
        );
      } else {
        console.log(`⚠️ CRL expired ${Math.abs(hoursUntilExpiry)} hours ago`);
      }
    }

    console.log('Signature algorithm:', crlInfo.signatureAlgorithm);

    // CRL extensions
    if (crlInfo.extensions && crlInfo.extensions.length > 0) {
      console.log('\n🔧 CRL Extensions:');
      crlInfo.extensions.forEach((ext, index) => {
        console.log(`${index + 1}. ${ext.name || ext.oid}`);
        console.log(`   OID: ${ext.oid}`);
        console.log(`   Critical: ${ext.critical ? 'Yes' : 'No'}`);
        console.log(`   Value: ${ext.value.substring(0, 50)}...`);
      });

      // Check for specific extensions
      const crlNumberExt = crlInfo.extensions.find(
        ext => ext.oid === '2.5.29.20'
      );
      if (crlNumberExt && crlInfo.crlNumber) {
        console.log(`\n📊 CRL Number: ${crlInfo.crlNumber}`);
      }

      const deltaCRLExt = crlInfo.extensions.find(
        ext => ext.oid === '2.5.29.27'
      );
      if (deltaCRLExt && crlInfo.deltaCRLIndicator) {
        console.log(`📊 Delta CRL Indicator: ${crlInfo.deltaCRLIndicator}`);
      }
    }

    // Revoked certificates
    console.log('\n🚫 Revoked Certificates:');
    console.log(`Total revoked: ${crlInfo.revokedCertificates.length}`);

    if (crlInfo.revokedCertificates.length > 0) {
      console.log('\nFirst 10 revoked certificates:');
      crlInfo.revokedCertificates.slice(0, 10).forEach((revoked, index) => {
        console.log(`${index + 1}. Serial: ${revoked.serialNumber}`);
        console.log(
          `   Revoked: ${new Date(revoked.revocationDate).toLocaleString()}`
        );

        if (revoked.reason) {
          console.log(
            `   Reason: ${revoked.reason.reason} (code: ${revoked.reason.code})`
          );
        }

        if (revoked.extensions && revoked.extensions.length > 0) {
          console.log(`   Extensions: ${revoked.extensions.length}`);
        }
      });

      if (crlInfo.revokedCertificates.length > 10) {
        console.log(`... and ${crlInfo.revokedCertificates.length - 10} more`);
      }
    }

    // Revocation statistics
    const revocationStats = analyzeRevocations(crlInfo.revokedCertificates);
    console.log('\n📊 Revocation Statistics:');
    console.log('By reason:');
    Object.entries(revocationStats.byReason).forEach(([reason, count]) => {
      console.log(`  ${reason}: ${count}`);
    });

    console.log('By year:');
    Object.entries(revocationStats.byYear).forEach(([year, count]) => {
      console.log(`  ${year}: ${count}`);
    });

    return crlInfo;
  } else {
    console.error('❌ CRL parsing failed:', parseResult.reason);
  }
} catch (error) {
  console.error('❌ CRL parsing error:', error);
}

function analyzeRevocations(revokedCerts: RevokedCertificate[]) {
  const byReason = {};
  const byYear = {};

  revokedCerts.forEach(cert => {
    // Group by reason
    const reason = cert.reason?.reason || 'unspecified';
    byReason[reason] = (byReason[reason] || 0) + 1;

    // Group by year
    const year = new Date(cert.revocationDate).getFullYear().toString();
    byYear[year] = (byYear[year] || 0) + 1;
  });

  return { byReason, byYear };
}
```

### validateCRLAsync()

CRL ni validate qilish.

```typescript
try {
  const crlBase64 = 'MIICyz...'; // Your CRL data
  const issuerCertId = 'ca_certificate_id';

  console.log('✅ Validating CRL...');

  const validationResult = await crlPlugin.validateCRLAsync(crlBase64, {
    issuerCertId: issuerCertId,
    checkSignature: true,
    checkValidity: true,
    strictMode: true, // Strict validation
    allowClockSkew: 300, // 5 minutes clock skew tolerance
    requireNextUpdate: true // Require nextUpdate field
  });

  if (validationResult.success) {
    console.log('🔍 CRL Validation Results:');
    console.log('═══════════════════════════');

    // Overall validity
    console.log('Overall valid:', validationResult.valid ? '✅' : '❌');
    console.log(
      'Current (not expired):',
      validationResult.current ? '✅' : '⚠️'
    );
    console.log(
      'Signature valid:',
      validationResult.signatureValid ? '✅' : '❌'
    );
    console.log('Issuer valid:', validationResult.issuerValid ? '✅' : '❌');

    // Validity period
    console.log('\n📅 Validity Period:');
    console.log(
      'Valid from:',
      new Date(validationResult.validFrom).toLocaleString()
    );
    console.log(
      'Valid until:',
      new Date(validationResult.validUntil).toLocaleString()
    );

    if (validationResult.daysUntilExpiry !== undefined) {
      if (validationResult.daysUntilExpiry > 0) {
        console.log(`Expires in: ${validationResult.daysUntilExpiry} days`);

        if (validationResult.daysUntilExpiry < 7) {
          console.log('⚠️ CRL expires soon, update recommended');
        }
      } else {
        console.log(
          `⚠️ CRL expired ${Math.abs(validationResult.daysUntilExpiry)} days ago`
        );
      }
    }

    // Errors and warnings
    if (validationResult.errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      validationResult.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (validationResult.warnings.length > 0) {
      console.log('\n⚠️ Validation Warnings:');
      validationResult.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    // Overall assessment
    console.log('\n📊 Assessment:');
    if (
      validationResult.valid &&
      validationResult.current &&
      validationResult.signatureValid
    ) {
      console.log('✅ CRL is valid and can be used for revocation checking');
    } else if (validationResult.signatureValid && !validationResult.current) {
      console.log(
        '⚠️ CRL signature is valid but CRL is expired, update needed'
      );
    } else if (!validationResult.signatureValid) {
      console.log('❌ CRL signature is invalid, cannot trust this CRL');
    } else {
      console.log('❌ CRL has validation issues and should not be used');
    }

    return validationResult;
  } else {
    console.error('❌ CRL validation failed:', validationResult.reason);
  }
} catch (error) {
  console.error('❌ CRL validation error:', error);
}
```

## Certificate Revocation Checking

### checkCertificateRevocationAsync()

Sertifikat bekor qilinganligini tekshirish.

```typescript
try {
  const certificateSerial = '1234567890ABCDEF';
  const crlBase64 = 'MIICyz...'; // CRL data

  console.log('🔍 Checking certificate revocation...');
  console.log('Certificate serial:', certificateSerial);

  const revocationCheck = await crlPlugin.checkCertificateRevocationAsync(
    certificateSerial,
    crlBase64,
    {
      validateCRL: true, // Validate CRL before checking
      issuerCertId: 'ca_cert_id',
      strictMode: true,
      normalizeSerial: true // Normalize serial number format
    }
  );

  if (revocationCheck.success) {
    console.log('\n📊 Revocation Check Result:');
    console.log('═══════════════════════════');

    if (revocationCheck.revoked) {
      console.log('Status: ❌ REVOKED');
      console.log('Serial number:', revocationCheck.serialNumber);
      console.log(
        'Revocation date:',
        new Date(revocationCheck.revocationDate).toLocaleString()
      );

      if (revocationCheck.reason) {
        console.log('Revocation reason:', revocationCheck.reason.reason);
        console.log('Reason code:', revocationCheck.reason.code);

        // Provide human-readable reason
        const reasonDescription = getRevocationReasonDescription(
          revocationCheck.reason.reason
        );
        console.log('Description:', reasonDescription);
      }

      // Calculate time since revocation
      const revocationDate = new Date(revocationCheck.revocationDate);
      const now = new Date();
      const daysSinceRevocation = Math.floor(
        (now.getTime() - revocationDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log(`Days since revocation: ${daysSinceRevocation}`);

      if (daysSinceRevocation < 1) {
        console.log('⚠️ Recently revoked (less than 24 hours ago)');
      }
    } else {
      console.log('Status: ✅ NOT REVOKED');
      console.log('Serial number:', revocationCheck.serialNumber);
      console.log('Certificate appears to be valid (not in CRL)');
    }

    // CRL information
    console.log('\n📋 CRL Information:');
    console.log('CRL issuer:', revocationCheck.crlIssuer);
    console.log(
      'CRL this update:',
      new Date(revocationCheck.crlThisUpdate).toLocaleString()
    );

    if (revocationCheck.crlNextUpdate) {
      console.log(
        'CRL next update:',
        new Date(revocationCheck.crlNextUpdate).toLocaleString()
      );
    }

    return revocationCheck;
  } else {
    console.error('❌ Revocation check failed:', revocationCheck.reason);
  }
} catch (error) {
  console.error('❌ Revocation check error:', error);
}

function getRevocationReasonDescription(reason: string): string {
  const descriptions = {
    unspecified: 'No specific reason provided',
    keyCompromise: 'Private key has been compromised',
    cACompromise: 'Certificate Authority has been compromised',
    affiliationChanged: 'Certificate holder affiliation has changed',
    superseded: 'Certificate has been superseded by a new one',
    cessationOfOperation: 'Certificate holder has ceased operations',
    certificateHold: 'Certificate is temporarily on hold',
    removeFromCRL: 'Certificate should be removed from CRL',
    privilegeWithdrawn: 'Certificate privileges have been withdrawn',
    aACompromise: 'Attribute Authority has been compromised'
  };

  return descriptions[reason] || 'Unknown reason';
}
```

### checkMultipleCertificatesAsync()

Bir nechta sertifikatni bir vaqtda tekshirish.

```typescript
try {
  const certificateSerials = [
    '1234567890ABCDEF',
    'FEDCBA0987654321',
    '1111222233334444',
    'AAAAAAAAAAAAAAAA'
  ];

  const crlBase64 = 'MIICyz...'; // CRL data

  console.log('🔍 Checking multiple certificates...');
  console.log(`Certificates to check: ${certificateSerials.length}`);

  const batchCheck = await crlPlugin.checkMultipleCertificatesAsync(
    certificateSerials,
    crlBase64,
    {
      validateCRL: true,
      issuerCertId: 'ca_cert_id',
      continueOnError: true, // Continue checking even if some fail
      normalizeSerials: true,
      includeDetails: true // Include detailed revocation info
    }
  );

  if (batchCheck.success) {
    console.log('\n📊 Batch Revocation Check Results:');
    console.log('═══════════════════════════════════');

    console.log(`Total certificates checked: ${batchCheck.totalChecked}`);
    console.log(`Revoked certificates: ${batchCheck.revokedCount}`);
    console.log(`Valid certificates: ${batchCheck.validCount}`);
    console.log(`Failed checks: ${batchCheck.failedCount}`);

    // Detailed results
    console.log('\n📋 Detailed Results:');
    batchCheck.results.forEach((result, index) => {
      console.log(`\n${index + 1}. Certificate: ${result.serialNumber}`);

      if (result.success) {
        if (result.revoked) {
          console.log('   Status: ❌ REVOKED');
          console.log(
            '   Revocation date:',
            new Date(result.revocationDate).toLocaleString()
          );

          if (result.reason) {
            console.log('   Reason:', result.reason.reason);
          }
        } else {
          console.log('   Status: ✅ VALID (not revoked)');
        }
      } else {
        console.log('   Status: ⚠️ CHECK FAILED');
        console.log('   Error:', result.error);
      }
    });

    // Summary by status
    const revokedCerts = batchCheck.results.filter(r => r.success && r.revoked);
    const validCerts = batchCheck.results.filter(r => r.success && !r.revoked);
    const failedCerts = batchCheck.results.filter(r => !r.success);

    if (revokedCerts.length > 0) {
      console.log('\n❌ Revoked Certificates:');
      revokedCerts.forEach(cert => {
        console.log(
          `  - ${cert.serialNumber} (revoked: ${new Date(cert.revocationDate).toLocaleDateString()})`
        );
      });
    }

    if (validCerts.length > 0) {
      console.log('\n✅ Valid Certificates:');
      validCerts.forEach(cert => {
        console.log(`  - ${cert.serialNumber}`);
      });
    }

    if (failedCerts.length > 0) {
      console.log('\n⚠️ Failed Checks:');
      failedCerts.forEach(cert => {
        console.log(`  - ${cert.serialNumber}: ${cert.error}`);
      });
    }

    return batchCheck;
  } else {
    console.error('❌ Batch revocation check failed:', batchCheck.reason);
  }
} catch (error) {
  console.error('❌ Batch revocation check error:', error);
}
```

## CRL Management

### getCRLFromCertificateAsync()

Sertifikatdan CRL distribution point olish va CRL yuklab olish.

```typescript
try {
  const certificateBase64 = 'MIICzD...'; // Your certificate

  console.log('🔍 Extracting CRL distribution points from certificate...');

  const crlExtraction = await crlPlugin.getCRLFromCertificateAsync(
    certificateBase64,
    {
      downloadCRL: true, // Auto download CRL
      validateCRL: true, // Validate downloaded CRL
      preferredProtocol: 'http', // Prefer HTTP over LDAP
      timeout: 30,
      retryCount: 3,
      useCache: true,
      maxCacheAge: 12 // 12 hours cache
    }
  );

  if (crlExtraction.success) {
    console.log('✅ CRL distribution points found and processed');

    // Distribution points
    console.log('\n📍 CRL Distribution Points:');
    crlExtraction.distributionPoints.forEach((dp, index) => {
      console.log(`${index + 1}. ${dp.url}`);
      console.log(`   Protocol: ${dp.protocol}`);
      console.log(`   Accessible: ${dp.accessible ? '✅' : '❌'}`);

      if (dp.downloadResult) {
        console.log(
          `   Downloaded: ${dp.downloadResult.success ? '✅' : '❌'}`
        );
        console.log(`   Size: ${dp.downloadResult.size || 'N/A'} bytes`);
      }
    });

    // Best CRL
    if (crlExtraction.bestCRL) {
      console.log('\n🏆 Best Available CRL:');
      console.log('Source:', crlExtraction.bestCRL.source);
      console.log(
        'Download successful:',
        crlExtraction.bestCRL.downloadSuccessful ? '✅' : '❌'
      );
      console.log(
        'Validation passed:',
        crlExtraction.bestCRL.validationPassed ? '✅' : '❌'
      );
      console.log(
        'CRL data available:',
        crlExtraction.bestCRL.crlData ? '✅' : '❌'
      );

      if (crlExtraction.bestCRL.crlInfo) {
        const info = crlExtraction.bestCRL.crlInfo;
        console.log('Issuer:', info.issuer);
        console.log('This update:', new Date(info.thisUpdate).toLocaleString());
        console.log(
          'Next update:',
          info.nextUpdate
            ? new Date(info.nextUpdate).toLocaleString()
            : 'Not specified'
        );
        console.log('Revoked certificates:', info.revokedCertificates.length);
      }

      return crlExtraction.bestCRL.crlData;
    } else {
      console.log('⚠️ No valid CRL could be obtained');
    }
  } else {
    console.error('❌ CRL extraction failed:', crlExtraction.reason);
  }
} catch (error) {
  console.error('❌ CRL extraction error:', error);
}
```

### updateCRLCacheAsync()

CRL cache ni yangilash.

```typescript
try {
  console.log('🔄 Updating CRL cache...');

  const cacheUpdate = await crlPlugin.updateCRLCacheAsync({
    cacheDir: './crl_cache',
    maxAge: 24, // Max cache age in hours
    forceUpdate: false, // Only update expired entries
    parallel: true, // Update in parallel
    maxConcurrent: 5, // Max concurrent downloads
    validateAfterUpdate: true, // Validate after downloading
    cleanupOld: true, // Remove old cache files
    distributionPoints: [
      // Specific DPs to update
      'http://ca1.example.com/crl/ca1.crl',
      'http://ca2.example.com/crl/ca2.crl',
      'http://ca3.example.com/crl/ca3.crl'
    ]
  });

  if (cacheUpdate.success) {
    console.log('✅ CRL cache update completed');

    console.log('\n📊 Update Summary:');
    console.log('Total CRLs processed:', cacheUpdate.totalProcessed);
    console.log('Successfully updated:', cacheUpdate.successCount);
    console.log('Failed updates:', cacheUpdate.failureCount);
    console.log('Skipped (up to date):', cacheUpdate.skippedCount);
    console.log('Cache entries cleaned:', cacheUpdate.cleanedCount);

    // Detailed results
    if (cacheUpdate.results && cacheUpdate.results.length > 0) {
      console.log('\n📋 Update Details:');
      cacheUpdate.results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.distributionPoint}`);
        console.log(
          `   Status: ${result.success ? '✅ Updated' : '❌ Failed'}`
        );

        if (result.success) {
          console.log(`   Size: ${result.size} bytes`);
          console.log(`   Cache file: ${result.cacheFile}`);
          console.log(
            `   Validation: ${result.validationPassed ? '✅' : '⚠️'}`
          );

          if (result.previousUpdate) {
            const lastUpdate = new Date(result.previousUpdate);
            const now = new Date();
            const hoursSinceUpdate = Math.round(
              (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
            );
            console.log(`   Previous update: ${hoursSinceUpdate} hours ago`);
          }
        } else {
          console.log(`   Error: ${result.error}`);
        }
      });
    }

    // Cache statistics
    if (cacheUpdate.cacheStats) {
      console.log('\n📈 Cache Statistics:');
      console.log(
        'Total cache size:',
        formatBytes(cacheUpdate.cacheStats.totalSize)
      );
      console.log('Number of files:', cacheUpdate.cacheStats.fileCount);
      console.log(
        'Oldest entry:',
        new Date(cacheUpdate.cacheStats.oldestEntry).toLocaleString()
      );
      console.log(
        'Newest entry:',
        new Date(cacheUpdate.cacheStats.newestEntry).toLocaleString()
      );
    }

    return cacheUpdate;
  } else {
    console.error('❌ CRL cache update failed:', cacheUpdate.reason);
  }
} catch (error) {
  console.error('❌ CRL cache update error:', error);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

## Complete Examples

### Complete Certificate Revocation Verification Workflow

```typescript
async function verifyCertificateRevocationStatus(certificateBase64: string) {
  try {
    console.log('🔍 Starting complete certificate revocation verification...');

    // 1. Extract certificate information
    console.log('1. Extracting certificate information...');

    const certInfo = await extractCertificateInfo(certificateBase64);

    if (!certInfo.success) {
      throw new Error(`Certificate parsing failed: ${certInfo.reason}`);
    }

    console.log('✅ Certificate information extracted');
    console.log('Serial number:', certInfo.serialNumber);
    console.log('Issuer:', certInfo.issuer);
    console.log('Subject:', certInfo.subject);
    console.log('Valid from:', new Date(certInfo.validFrom).toLocaleString());
    console.log('Valid to:', new Date(certInfo.validTo).toLocaleString());

    // 2. Check certificate validity period
    console.log('\n2. Checking certificate validity period...');

    const now = new Date();
    const validFrom = new Date(certInfo.validFrom);
    const validTo = new Date(certInfo.validTo);

    const isExpired = now > validTo;
    const isNotYetValid = now < validFrom;

    if (isExpired) {
      console.log('⚠️ Certificate has expired');
      const daysExpired = Math.floor(
        (now.getTime() - validTo.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(`Expired ${daysExpired} days ago`);
    } else if (isNotYetValid) {
      console.log('⚠️ Certificate is not yet valid');
      const daysUntilValid = Math.floor(
        (validFrom.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(`Will be valid in ${daysUntilValid} days`);
    } else {
      console.log('✅ Certificate is within validity period');
      const daysUntilExpiry = Math.floor(
        (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(`Expires in ${daysUntilExpiry} days`);
    }

    // 3. Extract CRL distribution points
    console.log('\n3. Extracting CRL distribution points...');

    const crlExtraction = await crlPlugin.getCRLFromCertificateAsync(
      certificateBase64,
      {
        downloadCRL: true,
        validateCRL: true,
        preferredProtocol: 'http',
        timeout: 30,
        retryCount: 3,
        useCache: true,
        maxCacheAge: 6 // 6 hours cache for more frequent updates
      }
    );

    if (!crlExtraction.success) {
      throw new Error(`CRL extraction failed: ${crlExtraction.reason}`);
    }

    console.log('✅ CRL distribution points processed');
    console.log(
      `Found ${crlExtraction.distributionPoints.length} distribution points`
    );

    // 4. Get best available CRL
    if (!crlExtraction.bestCRL || !crlExtraction.bestCRL.crlData) {
      throw new Error(
        'No valid CRL could be obtained from any distribution point'
      );
    }

    console.log('\n4. Best CRL obtained:');
    console.log('Source:', crlExtraction.bestCRL.source);
    console.log(
      'Validation passed:',
      crlExtraction.bestCRL.validationPassed ? '✅' : '⚠️'
    );

    const crlData = crlExtraction.bestCRL.crlData;
    const crlInfo = crlExtraction.bestCRL.crlInfo;

    // 5. Validate CRL
    console.log('\n5. Validating CRL...');

    const crlValidation = await crlPlugin.validateCRLAsync(crlData, {
      issuerCertId: certInfo.issuerCertId,
      checkSignature: true,
      checkValidity: true,
      strictMode: true,
      allowClockSkew: 300 // 5 minutes
    });

    if (!crlValidation.success || !crlValidation.valid) {
      console.log('⚠️ CRL validation issues detected');

      if (crlValidation.errors.length > 0) {
        console.log('Errors:', crlValidation.errors.join(', '));
      }

      if (crlValidation.warnings.length > 0) {
        console.log('Warnings:', crlValidation.warnings.join(', '));
      }

      if (!crlValidation.current) {
        console.log('⚠️ CRL is not current (expired)');
      }

      // Continue with revocation check but flag the issues
    } else {
      console.log('✅ CRL validation passed');
    }

    // 6. Check certificate revocation status
    console.log('\n6. Checking certificate revocation status...');

    const revocationCheck = await crlPlugin.checkCertificateRevocationAsync(
      certInfo.serialNumber,
      crlData,
      {
        validateCRL: false, // Already validated
        issuerCertId: certInfo.issuerCertId,
        strictMode: true,
        normalizeSerial: true
      }
    );

    if (!revocationCheck.success) {
      throw new Error(`Revocation check failed: ${revocationCheck.reason}`);
    }

    console.log('✅ Revocation check completed');

    // 7. Generate comprehensive report
    console.log('\n🎯 CERTIFICATE REVOCATION STATUS REPORT');
    console.log('════════════════════════════════════════');

    // Certificate details
    console.log('\n📄 Certificate Details:');
    console.log(`Serial Number: ${certInfo.serialNumber}`);
    console.log(`Subject: ${certInfo.subject}`);
    console.log(`Issuer: ${certInfo.issuer}`);
    console.log(
      `Valid Period: ${new Date(certInfo.validFrom).toLocaleDateString()} - ${new Date(certInfo.validTo).toLocaleDateString()}`
    );

    // Validity status
    console.log('\n📅 Certificate Validity:');
    if (isExpired) {
      console.log('Status: ❌ EXPIRED');
    } else if (isNotYetValid) {
      console.log('Status: ⚠️ NOT YET VALID');
    } else {
      console.log('Status: ✅ VALID (within validity period)');
    }

    // CRL information
    console.log('\n📋 CRL Information:');
    console.log(`Issuer: ${crlInfo.issuer}`);
    console.log(
      `This Update: ${new Date(crlInfo.thisUpdate).toLocaleString()}`
    );
    console.log(
      `Next Update: ${crlInfo.nextUpdate ? new Date(crlInfo.nextUpdate).toLocaleString() : 'Not specified'}`
    );
    console.log(
      `Total Revoked Certificates: ${crlInfo.revokedCertificates.length}`
    );
    console.log(
      `CRL Validation: ${crlValidation.valid ? '✅ Valid' : '⚠️ Issues detected'}`
    );
    console.log(
      `CRL Current: ${crlValidation.current ? '✅ Current' : '⚠️ Expired'}`
    );

    // Revocation status
    console.log('\n🔍 Revocation Status:');

    if (revocationCheck.revoked) {
      console.log('STATUS: ❌ CERTIFICATE IS REVOKED');
      console.log(
        `Revocation Date: ${new Date(revocationCheck.revocationDate).toLocaleString()}`
      );

      if (revocationCheck.reason) {
        console.log(`Revocation Reason: ${revocationCheck.reason.reason}`);
        console.log(
          `Reason Description: ${getRevocationReasonDescription(revocationCheck.reason.reason)}`
        );
      }

      const daysSinceRevocation = Math.floor(
        (now.getTime() - new Date(revocationCheck.revocationDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      console.log(`Days Since Revocation: ${daysSinceRevocation}`);
    } else {
      console.log('STATUS: ✅ CERTIFICATE IS NOT REVOKED');
      console.log('The certificate does not appear in the revocation list');
    }

    // Overall assessment
    console.log('\n🎯 OVERALL ASSESSMENT:');

    let overallStatus: 'valid' | 'revoked' | 'expired' | 'issues' = 'valid';
    const issues = [];

    if (revocationCheck.revoked) {
      overallStatus = 'revoked';
      issues.push('Certificate is revoked');
    }

    if (isExpired) {
      overallStatus = 'expired';
      issues.push('Certificate has expired');
    } else if (isNotYetValid) {
      overallStatus = 'issues';
      issues.push('Certificate is not yet valid');
    }

    if (!crlValidation.valid) {
      overallStatus = 'issues';
      issues.push('CRL validation failed');
    }

    if (!crlValidation.current) {
      if (overallStatus === 'valid') overallStatus = 'issues';
      issues.push('CRL is not current');
    }

    switch (overallStatus) {
      case 'valid':
        console.log('🟢 CERTIFICATE IS VALID AND TRUSTED');
        console.log('The certificate can be used safely.');
        break;

      case 'revoked':
        console.log('🔴 CERTIFICATE IS REVOKED - DO NOT TRUST');
        console.log(
          'This certificate has been revoked and should not be accepted.'
        );
        break;

      case 'expired':
        console.log('🟡 CERTIFICATE HAS EXPIRED');
        console.log('This certificate is no longer valid due to expiration.');
        break;

      case 'issues':
        console.log('🟡 CERTIFICATE HAS ISSUES');
        console.log('Issues detected that may affect trustworthiness.');
        break;
    }

    if (issues.length > 0) {
      console.log('\n⚠️ Issues Detected:');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');

    if (overallStatus === 'revoked') {
      console.log('• Immediately stop using this certificate');
      console.log('• Investigate the cause of revocation');
      console.log('• Obtain a new certificate if needed');
    } else if (overallStatus === 'expired') {
      console.log('• Renew the certificate');
      console.log('• Update applications using this certificate');
    } else if (overallStatus === 'issues') {
      console.log('• Review the detected issues');
      console.log("• Update CRL if it's expired");
      console.log('• Verify certificate validity period');
    } else {
      console.log('• Regular monitoring recommended');
      console.log('• Set up alerts for certificate expiration');
      console.log('• Periodically check revocation status');
    }

    console.log('\n🎉 Certificate revocation verification completed!');

    return {
      certificate: {
        serialNumber: certInfo.serialNumber,
        subject: certInfo.subject,
        issuer: certInfo.issuer,
        validFrom: certInfo.validFrom,
        validTo: certInfo.validTo,
        expired: isExpired,
        notYetValid: isNotYetValid
      },
      crl: {
        issuer: crlInfo.issuer,
        thisUpdate: crlInfo.thisUpdate,
        nextUpdate: crlInfo.nextUpdate,
        revokedCount: crlInfo.revokedCertificates.length,
        valid: crlValidation.valid,
        current: crlValidation.current
      },
      revocation: {
        revoked: revocationCheck.revoked,
        revocationDate: revocationCheck.revocationDate,
        reason: revocationCheck.reason
      },
      overall: {
        status: overallStatus,
        trusted: overallStatus === 'valid',
        issues: issues
      }
    };
  } catch (error) {
    console.error('❌ Certificate revocation verification failed:', error);
    throw error;
  }
}

// Helper function to extract certificate info
async function extractCertificateInfo(certificateBase64: string) {
  // This would typically use the X509 plugin to parse certificate
  // Mock implementation for demonstration
  return {
    success: true,
    serialNumber: '1234567890ABCDEF',
    subject: 'CN=John Doe, O=Example Corp, C=US',
    issuer: 'CN=Example CA, O=Example Corp, C=US',
    validFrom: '2023-01-01T00:00:00Z',
    validTo: '2024-12-31T23:59:59Z',
    issuerCertId: 'example_ca_cert'
  };
}
```

## Callback API (Legacy)

### downloadCRL() - Callback Version

```typescript
crlPlugin.downloadCRL(
  {
    distributionPoint: 'http://ca.example.com/crl/ca.crl',
    timeout: 30,
    validateSignature: true
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: CRL downloaded');
      console.log('Size:', response.size);
      console.log('CRL data:', response.crlData);
    } else {
      console.error('Callback: CRL download failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: CRL download error:', error);
  }
);
```

### checkCertificateRevocation() - Callback Version

```typescript
crlPlugin.checkCertificateRevocation(
  certificateSerial,
  crlBase64,
  {
    validateCRL: true,
    issuerCertId: 'ca_cert_id'
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Revocation check completed');
      console.log('Revoked:', response.revoked);

      if (response.revoked) {
        console.log('Revocation date:', response.revocationDate);
        console.log('Reason:', response.reason);
      }
    } else {
      console.error('Callback: Revocation check failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Revocation check error:', error);
  }
);
```

## Error Handling

### CRL Download Errors

```typescript
try {
  const result = await crlPlugin.downloadCRLAsync(params);
} catch (error) {
  if (error.message.includes('network timeout')) {
    console.error('❌ Network timeout - check connection or increase timeout');
  } else if (error.message.includes('invalid url')) {
    console.error('❌ Invalid CRL distribution point URL');
  } else if (error.message.includes('server error')) {
    console.error('❌ Server error - CRL server may be down');
  } else if (error.message.includes('signature verification failed')) {
    console.error('❌ CRL signature verification failed - CRL may be tampered');
  } else {
    console.error('❌ CRL download error:', error.message);
  }
}
```

### Revocation Check Errors

```typescript
try {
  const result = await crlPlugin.checkCertificateRevocationAsync(serial, crl);
} catch (error) {
  if (error.message.includes('invalid crl format')) {
    console.error('❌ CRL format is invalid or corrupted');
  } else if (error.message.includes('crl expired')) {
    console.error('❌ CRL has expired - obtain fresh CRL');
  } else if (error.message.includes('serial number format')) {
    console.error('❌ Certificate serial number format is invalid');
  } else if (error.message.includes('issuer mismatch')) {
    console.error('❌ CRL issuer does not match certificate issuer');
  } else {
    console.error('❌ Revocation check error:', error.message);
  }
}
```

## Best Practices

1.  **CRL Freshness**: Always check CRL validity period before using
2.  **Caching**: Implement proper CRL caching to reduce network requests
3.  **Fallback**: Have multiple CRL distribution points for redundancy
4.  **Validation**: Always validate CRL signature before trusting
5.  **Performance**: Use batch checking for multiple certificates
6.  **Monitoring**: Monitor CRL availability and update status
7.  **Error Handling**: Implement graceful degradation when CRL is unavailable
8.  **Security**: Verify CRL integrity and authenticity
9.  **Compliance**: Follow industry standards for revocation checking
10. **Automation**: Automate CRL updates and cache management
