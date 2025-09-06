# YTKS Plugin API Reference

YTKS (Yagona Token Kriptografiya Servisi) plugin O'zbekiston milliy kriptografik
token'lari va smart card'lari bilan ishlash uchun mo'ljallangan. Bu plugin
milliy PKI infratuzilmasi, e-imzo operatsiyalari va local kriptografik tokenlar
bilan integratsiya uchun ishlatiladi.

## Overview

YTKS plugin quyidagi funksiyalarni taqdim etadi:

- Milliy kriptografik tokenlar bilan ishlash
- Smart card operatsiyalari
- E-imzo yaratish va tekshirish
- PKI sertifikatlar boshqaruvi
- Token autentifikatsiyasi
- GOST algoritmlar qo'llab-quvvatlash
- Hardware Security Module (HSM) integratsiyasi

## Import

```typescript
// ES6 import
import { ytksPlugin } from 'imzo-agnost';

// CommonJS
const { ytksPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.ytks;
```

## Types

```typescript
interface YTKSTokenInfo {
  tokenId: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  hardwareVersion: string;
  supportedAlgorithms: string[];
  status: 'CONNECTED' | 'DISCONNECTED' | 'LOCKED' | 'ERROR';
  pinRequired: boolean;
  pinAttempts: number;
  maxPinAttempts: number;
  certificates: YTKSCertificateInfo[];
  keyPairs: YTKSKeyPairInfo[];
  capacity: YTKSCapacityInfo;
  features: YTKSFeatures;
}

interface YTKSCertificateInfo {
  id: string;
  alias: string;
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  keyUsage: string[];
  extendedKeyUsage: string[];
  algorithm: string;
  keySize: number;
  thumbprint: string;
  status: 'VALID' | 'EXPIRED' | 'REVOKED' | 'PENDING';
  certType:
    | 'SIGNATURE'
    | 'AUTHENTICATION'
    | 'ENCRYPTION'
    | 'SSL_CLIENT'
    | 'SSL_SERVER';
  gostParameters?: GOSTParameters;
}

interface YTKSKeyPairInfo {
  id: string;
  alias: string;
  algorithm:
    | 'GOST_R3410_2001'
    | 'GOST_R3410_2012_256'
    | 'GOST_R3410_2012_512'
    | 'RSA'
    | 'ECDSA';
  keySize: number;
  usage: 'SIGNATURE' | 'KEY_AGREEMENT' | 'AUTHENTICATION';
  extractable: boolean;
  sensitive: boolean;
  created: string;
  certificateId?: string;
  gostParameters?: GOSTParameters;
}

interface GOSTParameters {
  curve: string; // OID of the curve
  hashAlgorithm:
    | 'GOST_R3411_2012_256'
    | 'GOST_R3411_2012_512'
    | 'GOST_R3411_94';
  signatureFormat: 'CMS' | 'PKCS7' | 'RAW';
  publicKeyFormat: 'COMPRESSED' | 'UNCOMPRESSED';
}

interface YTKSCapacityInfo {
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  maxCertificates: number;
  currentCertificates: number;
  maxKeyPairs: number;
  currentKeyPairs: number;
  maxPinLength: number;
  minPinLength: number;
}

interface YTKSFeatures {
  multipleApplications: boolean;
  securePinEntry: boolean;
  biometricSupport: boolean;
  randomNumberGeneration: boolean;
  keyGeneration: boolean;
  keyImport: boolean;
  keyExport: boolean;
  certificateStorage: boolean;
  dataEncryption: boolean;
  digitalSignature: boolean;
  timeStamping: boolean;
  ocspValidation: boolean;
}

interface YTKSSignatureOptions {
  algorithm: 'GOST_R3410_2001' | 'GOST_R3410_2012_256' | 'GOST_R3410_2012_512';
  hashAlgorithm:
    | 'GOST_R3411_2012_256'
    | 'GOST_R3411_2012_512'
    | 'GOST_R3411_94';
  signatureFormat: 'CMS' | 'PKCS7' | 'RAW';
  detached: boolean;
  includeChain: boolean;
  includeSigningTime: boolean;
  includeSignerInfo: boolean;
  timestampUrl?: string;
  ocspValidation?: boolean;
}

interface YTKSAuthenticationResult {
  success: boolean;
  tokenId: string;
  certificateId: string;
  userInfo: YTKSUserInfo;
  sessionToken: string;
  sessionExpiry: string;
  permissions: string[];
  authenticationTime: string;
  authenticationMethod: 'PIN' | 'BIOMETRIC' | 'COMBINED';
}

interface YTKSUserInfo {
  pinfl: string; // Personal Identification Number
  fullName: string;
  organization?: string;
  position?: string;
  region?: string;
  district?: string;
  citizenship: string;
  passportNumber?: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  email?: string;
  phone?: string;
}
```

## Token Management

### listTokensAsync()

Mavjud YTKS tokenlarni ro'yxatlash.

```typescript
try {
  console.log('🔍 Scanning for YTKS tokens...');

  const scanResult = await ytksPlugin.listTokensAsync({
    includeDisconnected: false, // Only connected tokens
    includeDetails: true, // Include detailed information
    refreshCache: true, // Refresh token cache
    timeout: 30000, // 30 seconds timeout
    supportedAlgorithms: [
      // Filter by supported algorithms
      'GOST_R3410_2012_256',
      'GOST_R3410_2012_512'
    ]
  });

  if (scanResult.success) {
    const tokens = scanResult.tokens;

    console.log('✅ YTKS tokens found:', tokens.length);
    console.log('═══════════════════════════════════════');

    tokens.forEach((token, index) => {
      console.log(`\n${index + 1}. ${token.name}`);
      console.log(`   Token ID: ${token.tokenId}`);
      console.log(`   Manufacturer: ${token.manufacturer}`);
      console.log(`   Model: ${token.model}`);
      console.log(`   Serial Number: ${token.serialNumber}`);
      console.log(`   Firmware: ${token.firmwareVersion}`);
      console.log(`   Hardware: ${token.hardwareVersion}`);
      console.log(
        `   Status: ${getTokenStatusIcon(token.status)} ${token.status}`
      );
      console.log(`   PIN Required: ${token.pinRequired ? '✅' : '❌'}`);

      if (token.pinRequired) {
        console.log(
          `   PIN Attempts: ${token.pinAttempts}/${token.maxPinAttempts}`
        );
      }

      console.log(`   Certificates: ${token.certificates.length}`);
      console.log(`   Key Pairs: ${token.keyPairs.length}`);
      console.log(
        `   Supported Algorithms: ${token.supportedAlgorithms.join(', ')}`
      );

      // Capacity information
      const capacity = token.capacity;
      console.log(
        `   Memory: ${formatBytes(capacity.usedMemory)}/${formatBytes(capacity.totalMemory)} (${((capacity.usedMemory / capacity.totalMemory) * 100).toFixed(1)}% used)`
      );
      console.log(
        `   Certificate slots: ${capacity.currentCertificates}/${capacity.maxCertificates}`
      );
      console.log(
        `   Key pair slots: ${capacity.currentKeyPairs}/${capacity.maxKeyPairs}`
      );

      // Features
      const features = token.features;
      console.log(`   Features:`);
      console.log(
        `     - Secure PIN Entry: ${features.securePinEntry ? '✅' : '❌'}`
      );
      console.log(
        `     - Biometric Support: ${features.biometricSupport ? '✅' : '❌'}`
      );
      console.log(
        `     - Key Generation: ${features.keyGeneration ? '✅' : '❌'}`
      );
      console.log(
        `     - Random Number Generation: ${features.randomNumberGeneration ? '✅' : '❌'}`
      );
      console.log(
        `     - OCSP Validation: ${features.ocspValidation ? '✅' : '❌'}`
      );

      // Certificate summary
      if (token.certificates.length > 0) {
        console.log(`   Certificates by type:`);
        const certTypes = token.certificates.reduce((acc, cert) => {
          acc[cert.certType] = (acc[cert.certType] || 0) + 1;
          return acc;
        }, {});

        Object.entries(certTypes).forEach(([type, count]) => {
          console.log(`     - ${type}: ${count}`);
        });

        // Check for expiring certificates
        const expiring = token.certificates.filter(cert => {
          const daysUntilExpiry = Math.ceil(
            (new Date(cert.validTo).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );
          return daysUntilExpiry > 0 && daysUntilExpiry < 90;
        });

        if (expiring.length > 0) {
          console.log(
            `   ⚠️ ${expiring.length} certificate(s) expiring within 90 days`
          );
        }

        const expired = token.certificates.filter(
          cert => new Date(cert.validTo) < new Date()
        );
        if (expired.length > 0) {
          console.log(`   ❌ ${expired.length} expired certificate(s)`);
        }
      }
    });

    // Overall summary
    console.log('\n📊 Summary:');
    const summary = {
      totalTokens: tokens.length,
      connectedTokens: tokens.filter(t => t.status === 'CONNECTED').length,
      lockedTokens: tokens.filter(t => t.status === 'LOCKED').length,
      totalCertificates: tokens.reduce(
        (sum, t) => sum + t.certificates.length,
        0
      ),
      totalKeyPairs: tokens.reduce((sum, t) => sum + t.keyPairs.length, 0),
      gostTokens: tokens.filter(t =>
        t.supportedAlgorithms.some(alg => alg.includes('GOST'))
      ).length
    };

    console.log(`Total tokens: ${summary.totalTokens}`);
    console.log(`Connected: ${summary.connectedTokens}`);
    console.log(`Locked: ${summary.lockedTokens}`);
    console.log(`Total certificates: ${summary.totalCertificates}`);
    console.log(`Total key pairs: ${summary.totalKeyPairs}`);
    console.log(`GOST-capable tokens: ${summary.gostTokens}`);

    return tokens;
  } else {
    console.error('❌ Failed to scan for tokens:', scanResult.reason);
  }
} catch (error) {
  console.error('❌ Token scanning error:', error);
}

function getTokenStatusIcon(status: string): string {
  switch (status) {
    case 'CONNECTED':
      return '🟢';
    case 'DISCONNECTED':
      return '⚪';
    case 'LOCKED':
      return '🔒';
    case 'ERROR':
      return '🔴';
    default:
      return '❓';
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
```

### authenticateTokenAsync()

Token ga autentifikatsiya qilish.

```typescript
try {
  const tokenId = 'ytks_token_001';
  const pin = '123456'; // User's PIN

  console.log('🔐 Authenticating with YTKS token...');
  console.log('Token ID:', tokenId);

  const authResult = await ytksPlugin.authenticateTokenAsync(tokenId, {
    pin: pin,
    authenticationMethod: 'PIN', // 'PIN', 'BIOMETRIC', 'COMBINED'
    sessionTimeout: 1800, // 30 minutes
    enableBiometric: false, // Use biometric if available
    retryOnFailure: true,
    maxRetryAttempts: 3,
    secureChannel: true, // Use secure channel for PIN
    cacheCredentials: false, // Don't cache credentials
    auditLog: true, // Enable audit logging
    validateCertificates: true // Validate certificates after auth
  });

  if (authResult.success) {
    console.log('✅ Authentication successful');

    const auth = authResult.authenticationResult;
    console.log('\n👤 User Information:');
    console.log('PINFL:', auth.userInfo.pinfl);
    console.log('Full Name:', auth.userInfo.fullName);

    if (auth.userInfo.organization) {
      console.log('Organization:', auth.userInfo.organization);
    }

    if (auth.userInfo.position) {
      console.log('Position:', auth.userInfo.position);
    }

    if (auth.userInfo.region) {
      console.log('Region:', auth.userInfo.region);
    }

    if (auth.userInfo.district) {
      console.log('District:', auth.userInfo.district);
    }

    console.log('Citizenship:', auth.userInfo.citizenship);

    if (auth.userInfo.email) {
      console.log('Email:', auth.userInfo.email);
    }

    if (auth.userInfo.phone) {
      console.log('Phone:', auth.userInfo.phone);
    }

    // Session information
    console.log('\n🔑 Session Information:');
    console.log('Session Token:', auth.sessionToken);
    console.log(
      'Session Expiry:',
      new Date(auth.sessionExpiry).toLocaleString()
    );
    console.log('Authentication Method:', auth.authenticationMethod);
    console.log(
      'Authentication Time:',
      new Date(auth.authenticationTime).toLocaleString()
    );
    console.log('Certificate ID:', auth.certificateId);

    // Permissions
    if (auth.permissions && auth.permissions.length > 0) {
      console.log('\n🛡️ Permissions:');
      auth.permissions.forEach(permission => {
        console.log(`- ${permission}`);
      });
    }

    // Token status after authentication
    const tokenStatus = await ytksPlugin.getTokenStatusAsync(tokenId);
    if (tokenStatus.success) {
      console.log('\n📊 Token Status:');
      console.log('Status:', tokenStatus.status.status);
      console.log(
        'PIN Attempts Remaining:',
        tokenStatus.status.maxPinAttempts - tokenStatus.status.pinAttempts
      );

      if (tokenStatus.status.certificates.length > 0) {
        console.log('\n📄 Available Certificates:');
        tokenStatus.status.certificates.forEach((cert, index) => {
          console.log(`${index + 1}. ${cert.subject}`);
          console.log(`   Type: ${cert.certType}`);
          console.log(`   Algorithm: ${cert.algorithm}`);
          console.log(
            `   Valid until: ${new Date(cert.validTo).toLocaleDateString()}`
          );
          console.log(`   Status: ${cert.status}`);

          // Check expiry
          const daysUntilExpiry = Math.ceil(
            (new Date(cert.validTo).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (daysUntilExpiry <= 0) {
            console.log('   ⚠️ EXPIRED');
          } else if (daysUntilExpiry < 30) {
            console.log(`   ⚠️ Expires in ${daysUntilExpiry} days`);
          }
        });
      }
    }

    return auth;
  } else {
    console.error('❌ Authentication failed:', authResult.reason);

    // Handle specific authentication errors
    if (authResult.reason.includes('PIN_BLOCKED')) {
      console.error('🚫 PIN is blocked. Contact administrator to unblock.');
    } else if (authResult.reason.includes('INVALID_PIN')) {
      console.error('🔑 Invalid PIN. Please try again.');

      if (authResult.attemptsRemaining !== undefined) {
        console.log(`Attempts remaining: ${authResult.attemptsRemaining}`);

        if (authResult.attemptsRemaining === 1) {
          console.warn('⚠️ WARNING: One attempt remaining before PIN block!');
        }
      }
    } else if (authResult.reason.includes('TOKEN_NOT_FOUND')) {
      console.error('📱 Token not found. Please ensure token is connected.');
    } else if (authResult.reason.includes('TOKEN_LOCKED')) {
      console.error('🔒 Token is locked. Please unlock and try again.');
    }
  }
} catch (error) {
  console.error('❌ Authentication error:', error);
}
```

### selectCertificateAsync()

Imzolash uchun sertifikat tanlash.

```typescript
try {
  const tokenId = 'ytks_token_001';
  const sessionToken = 'session_token_xyz'; // From authentication

  console.log('📄 Selecting certificate for signing...');

  const selectResult = await ytksPlugin.selectCertificateAsync(tokenId, {
    sessionToken: sessionToken,
    purpose: 'SIGNATURE', // 'SIGNATURE', 'AUTHENTICATION', 'ENCRYPTION'
    keyUsage: ['digitalSignature'], // Required key usage
    algorithm: 'GOST_R3410_2012_256', // Preferred algorithm
    validOnly: true, // Only valid certificates
    includeChain: true, // Include certificate chain
    filterExpired: true, // Filter out expired certificates
    sortBy: 'validTo', // Sort by expiry date
    sortOrder: 'desc' // Newest first
  });

  if (selectResult.success) {
    const certificates = selectResult.certificates;

    console.log('✅ Available certificates for signing:');
    console.log(`Found ${certificates.length} suitable certificate(s)`);
    console.log('═══════════════════════════════════════');

    certificates.forEach((cert, index) => {
      console.log(`\n${index + 1}. Certificate ID: ${cert.id}`);
      console.log(`   Subject: ${cert.subject}`);
      console.log(`   Issuer: ${cert.issuer}`);
      console.log(`   Serial: ${cert.serialNumber}`);
      console.log(`   Type: ${cert.certType}`);
      console.log(`   Algorithm: ${cert.algorithm} (${cert.keySize} bits)`);
      console.log(
        `   Valid From: ${new Date(cert.validFrom).toLocaleDateString()}`
      );
      console.log(
        `   Valid To: ${new Date(cert.validTo).toLocaleDateString()}`
      );
      console.log(`   Status: ${cert.status}`);
      console.log(`   Thumbprint: ${cert.thumbprint}`);

      // Key usage
      if (cert.keyUsage.length > 0) {
        console.log(`   Key Usage: ${cert.keyUsage.join(', ')}`);
      }

      if (cert.extendedKeyUsage.length > 0) {
        console.log(
          `   Extended Key Usage: ${cert.extendedKeyUsage.join(', ')}`
        );
      }

      // GOST parameters if available
      if (cert.gostParameters) {
        console.log(`   GOST Parameters:`);
        console.log(`     Curve: ${cert.gostParameters.curve}`);
        console.log(
          `     Hash Algorithm: ${cert.gostParameters.hashAlgorithm}`
        );
        console.log(
          `     Signature Format: ${cert.gostParameters.signatureFormat}`
        );
      }

      // Validity check
      const now = new Date();
      const validFrom = new Date(cert.validFrom);
      const validTo = new Date(cert.validTo);

      if (now < validFrom) {
        console.log('   ⚠️ Certificate not yet valid');
      } else if (now > validTo) {
        console.log('   ❌ Certificate expired');
      } else {
        const daysUntilExpiry = Math.ceil(
          (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry < 30) {
          console.log(`   ⚠️ Expires in ${daysUntilExpiry} days`);
        } else {
          console.log('   ✅ Valid');
        }
      }
    });

    // Auto-select best certificate
    const bestCertificate = selectBestCertificate(certificates);

    if (bestCertificate) {
      console.log('\n🎯 Recommended Certificate:');
      console.log(`Certificate ID: ${bestCertificate.id}`);
      console.log(`Subject: ${bestCertificate.subject}`);
      console.log(`Algorithm: ${bestCertificate.algorithm}`);
      console.log(
        `Valid until: ${new Date(bestCertificate.validTo).toLocaleDateString()}`
      );

      // Set as active certificate
      const setActiveResult = await ytksPlugin.setActiveCertificateAsync(
        tokenId,
        {
          sessionToken: sessionToken,
          certificateId: bestCertificate.id,
          validateChain: true,
          checkRevocation: false // Skip OCSP for demo
        }
      );

      if (setActiveResult.success) {
        console.log('✅ Certificate set as active for signing');
        return bestCertificate;
      } else {
        console.error(
          '❌ Failed to set active certificate:',
          setActiveResult.reason
        );
      }
    } else {
      console.log('⚠️ No suitable certificate found');
    }

    return certificates;
  } else {
    console.error('❌ Failed to select certificate:', selectResult.reason);
  }
} catch (error) {
  console.error('❌ Certificate selection error:', error);
}

function selectBestCertificate(certificates: any[]): any | null {
  if (certificates.length === 0) return null;

  // Filter valid certificates
  const validCerts = certificates.filter(
    cert => cert.status === 'VALID' && new Date(cert.validTo) > new Date()
  );

  if (validCerts.length === 0) return null;

  // Prefer GOST algorithms
  const gostCerts = validCerts.filter(cert => cert.algorithm.includes('GOST'));

  const candidateCerts = gostCerts.length > 0 ? gostCerts : validCerts;

  // Sort by expiry date (longest valid first)
  candidateCerts.sort(
    (a, b) => new Date(b.validTo).getTime() - new Date(a.validTo).getTime()
  );

  return candidateCerts[0];
}
```

## Digital Signature Operations

### createSignatureAsync()

YTKS token bilan raqamli imzo yaratish.

```typescript
try {
  const tokenId = 'ytks_token_001';
  const sessionToken = 'session_token_xyz';
  const certificateId = 'cert_12345';
  const dataToSign = 'Imzolanadigan hujjat matni'; // Document text to sign

  console.log('✍️ Creating digital signature with YTKS...');
  console.log('Data to sign:', dataToSign);

  const signResult = await ytksPlugin.createSignatureAsync(tokenId, {
    sessionToken: sessionToken,
    certificateId: certificateId,
    data: dataToSign,
    signatureOptions: {
      algorithm: 'GOST_R3410_2012_256',
      hashAlgorithm: 'GOST_R3411_2012_256',
      signatureFormat: 'CMS',
      detached: false, // Attached signature
      includeChain: true, // Include certificate chain
      includeSigningTime: true, // Include signing time
      includeSignerInfo: true, // Include signer information
      timestampUrl: 'http://tsa.e-imzo.uz/tsa', // Timestamp server
      ocspValidation: false // Skip OCSP for demo
    },
    documentInfo: {
      fileName: 'document.pdf',
      mimeType: 'application/pdf',
      description: 'Important contract document',
      purpose: 'Contract approval',
      metadata: {
        department: 'Legal',
        documentType: 'Contract',
        version: '1.0'
      }
    },
    signerRole: {
      role: 'Director',
      organization: 'My Company LLC',
      location: 'Tashkent, Uzbekistan',
      reason: 'Document approval and authorization'
    }
  });

  if (signResult.success) {
    console.log('✅ Digital signature created successfully');

    const signature = signResult.signatureResult;
    console.log('\n📝 Signature Information:');
    console.log('Signature ID:', signature.signatureId);
    console.log('Algorithm Used:', signature.algorithmUsed);
    console.log('Hash Algorithm:', signature.hashAlgorithmUsed);
    console.log('Format:', signature.format);
    console.log('Size:', formatBytes(signature.signatureSize));
    console.log('Created:', new Date(signature.createdAt).toLocaleString());

    // Signature data (Base64 encoded)
    console.log('\n💾 Signature Data:');
    console.log('Length:', signature.signatureData.length, 'characters');
    console.log(
      'First 100 chars:',
      signature.signatureData.substring(0, 100) + '...'
    );

    // Certificate information
    if (signature.certificateInfo) {
      console.log('\n📄 Certificate Used:');
      console.log('Subject:', signature.certificateInfo.subject);
      console.log('Issuer:', signature.certificateInfo.issuer);
      console.log('Serial Number:', signature.certificateInfo.serialNumber);
      console.log(
        'Valid Until:',
        new Date(signature.certificateInfo.validTo).toLocaleDateString()
      );
    }

    // Timestamp information
    if (signature.timestamp) {
      console.log('\n⏰ Timestamp Information:');
      console.log('TSA URL:', signature.timestamp.tsaUrl);
      console.log(
        'Timestamp:',
        new Date(signature.timestamp.timestamp).toLocaleString()
      );
      console.log(
        'TSA Certificate:',
        signature.timestamp.tsaCertificate ? 'Included' : 'Not included'
      );
      console.log(
        'Timestamp verified:',
        signature.timestamp.verified ? '✅' : '❌'
      );
    }

    // Validation
    if (signature.validation) {
      console.log('\n🔍 Signature Validation:');
      console.log(
        'Signature valid:',
        signature.validation.signatureValid ? '✅' : '❌'
      );
      console.log(
        'Certificate valid:',
        signature.validation.certificateValid ? '✅' : '❌'
      );
      console.log(
        'Chain valid:',
        signature.validation.chainValid ? '✅' : '❌'
      );
      console.log(
        'Timestamp valid:',
        signature.validation.timestampValid ? '✅' : '❌'
      );

      if (signature.validation.warnings.length > 0) {
        console.log('\nValidation warnings:');
        signature.validation.warnings.forEach(warning => {
          console.log(`- ${warning}`);
        });
      }
    }

    // GOST specific information
    if (signature.gostInfo) {
      console.log('\n🇺🇿 GOST Signature Details:');
      console.log('GOST Curve:', signature.gostInfo.curve);
      console.log('Hash Function:', signature.gostInfo.hashFunction);
      console.log('Signature Format:', signature.gostInfo.signatureFormat);
      console.log('National Standard:', signature.gostInfo.nationalStandard);
    }

    // Save signature to file
    const signatureFileName = `signature_${Date.now()}.p7s`;
    await saveSignatureFile(signatureFileName, signature.signatureData);
    console.log(`\n💾 Signature saved to: ${signatureFileName}`);

    // Create signature report
    const signatureReport = {
      signatureId: signature.signatureId,
      documentInfo: {
        originalData: dataToSign,
        fileName: 'document.pdf',
        signedAt: signature.createdAt
      },
      signerInfo: {
        subject: signature.certificateInfo.subject,
        issuer: signature.certificateInfo.issuer,
        serialNumber: signature.certificateInfo.serialNumber
      },
      technicalDetails: {
        algorithm: signature.algorithmUsed,
        hashAlgorithm: signature.hashAlgorithmUsed,
        format: signature.format,
        size: signature.signatureSize,
        timestamp: signature.timestamp?.timestamp
      },
      validation: signature.validation,
      metadata: {
        tokenId: tokenId,
        sessionId: sessionToken,
        createdBy: 'YTKS Plugin',
        version: '1.0'
      }
    };

    const reportFileName = `signature_report_${Date.now()}.json`;
    await saveSignatureReport(reportFileName, signatureReport);
    console.log(`📊 Signature report saved to: ${reportFileName}`);

    return signature;
  } else {
    console.error('❌ Digital signature creation failed:', signResult.reason);

    // Handle specific signature errors
    if (signResult.reason.includes('PIN_REQUIRED')) {
      console.error('🔑 PIN verification required for signing operation');
    } else if (signResult.reason.includes('CERTIFICATE_EXPIRED')) {
      console.error('📅 Certificate has expired');
    } else if (signResult.reason.includes('CERTIFICATE_REVOKED')) {
      console.error('🚫 Certificate has been revoked');
    } else if (signResult.reason.includes('TOKEN_LOCKED')) {
      console.error('🔒 Token is locked');
    } else if (signResult.reason.includes('INSUFFICIENT_PERMISSIONS')) {
      console.error('🛡️ Insufficient permissions for signing');
    }
  }
} catch (error) {
  console.error('❌ Signature creation error:', error);
}

async function saveSignatureFile(
  fileName: string,
  signatureData: string
): Promise<void> {
  console.log(`💾 Saving signature file: ${fileName}`);
  // Implementation would save Base64 signature data to file
}

async function saveSignatureReport(
  fileName: string,
  report: any
): Promise<void> {
  console.log(`📊 Saving signature report: ${fileName}`);
  // Implementation would save JSON report to file
}
```

### verifySignatureAsync()

YTKS imzosini tekshirish.

```typescript
try {
  const signatureData = 'MIIGsignature...'; // Base64 encoded signature
  const originalData = 'Imzolanadigan hujjat matni'; // Original document text

  console.log('🔍 Verifying YTKS digital signature...');

  const verifyResult = await ytksPlugin.verifySignatureAsync({
    signatureData: signatureData,
    originalData: originalData, // For detached signatures
    verificationOptions: {
      checkCertificateChain: true,
      checkCertificateRevocation: true,
      checkTimestamp: true,
      validateGOSTParameters: true,
      requireValidCertificate: true,
      allowExpiredCertificates: false,
      allowSelfSignedCertificates: false,
      trustedRootCertificates: [
        // Trusted root CAs
        'MIIDroot1...', // O'zbekiston Root CA
        'MIIDroot2...' // E-IMZO Root CA
      ]
    },
    validationTime: new Date(), // Validation time (default: current)
    ocspUrls: [
      // OCSP servers for revocation check
      'http://ocsp.e-imzo.uz',
      'http://crl.nca.uz/ocsp'
    ],
    timestampValidation: {
      enabled: true,
      allowedTimeDrift: 300, // 5 minutes allowed drift
      requireTimestamp: false // Timestamp not mandatory
    }
  });

  if (verifyResult.success) {
    console.log('✅ Signature verification completed');

    const verification = verifyResult.verificationResult;
    console.log('\n🔍 Verification Results:');
    console.log('═══════════════════════════════════════');
    console.log(
      'Overall Status:',
      verification.valid ? '✅ VALID' : '❌ INVALID'
    );
    console.log('Signature Valid:', verification.signatureValid ? '✅' : '❌');
    console.log(
      'Certificate Valid:',
      verification.certificateValid ? '✅' : '❌'
    );
    console.log('Chain Valid:', verification.chainValid ? '✅' : '❌');
    console.log('Timestamp Valid:', verification.timestampValid ? '✅' : '❌');
    console.log(
      'Verification Time:',
      new Date(verification.verificationTime).toLocaleString()
    );

    // Signer information
    if (verification.signerInfo) {
      const signer = verification.signerInfo;
      console.log('\n👤 Signer Information:');
      console.log('Subject:', signer.subject);
      console.log('Issuer:', signer.issuer);
      console.log('Serial Number:', signer.serialNumber);
      console.log(
        'Valid From:',
        new Date(signer.validFrom).toLocaleDateString()
      );
      console.log('Valid To:', new Date(signer.validTo).toLocaleDateString());
      console.log('Algorithm:', signer.algorithm);
      console.log('Key Size:', signer.keySize, 'bits');

      // Parse subject DN for user information
      const subjectInfo = parseSubjectDN(signer.subject);
      if (subjectInfo) {
        console.log('\n📋 Parsed Signer Details:');
        if (subjectInfo.CN) console.log('Common Name:', subjectInfo.CN);
        if (subjectInfo.SERIALNUMBER)
          console.log('PINFL:', subjectInfo.SERIALNUMBER);
        if (subjectInfo.O) console.log('Organization:', subjectInfo.O);
        if (subjectInfo.OU) console.log('Organizational Unit:', subjectInfo.OU);
        if (subjectInfo.L) console.log('Location:', subjectInfo.L);
        if (subjectInfo.C) console.log('Country:', subjectInfo.C);
      }
    }

    // Certificate chain
    if (
      verification.certificateChain &&
      verification.certificateChain.length > 0
    ) {
      console.log('\n🔗 Certificate Chain:');
      verification.certificateChain.forEach((cert, index) => {
        console.log(`${index + 1}. ${cert.subject}`);
        console.log(`   Issued by: ${cert.issuer}`);
        console.log(
          `   Valid until: ${new Date(cert.validTo).toLocaleDateString()}`
        );
        console.log(`   Status: ${cert.status}`);
      });
    }

    // Timestamp information
    if (verification.timestampInfo) {
      const ts = verification.timestampInfo;
      console.log('\n⏰ Timestamp Information:');
      console.log('Signing Time:', new Date(ts.signingTime).toLocaleString());
      console.log('TSA Authority:', ts.tsaAuthority);
      console.log('Timestamp Serial:', ts.timestampSerial);
      console.log('Hash Algorithm:', ts.hashAlgorithm);
      console.log('Timestamp Valid:', ts.valid ? '✅' : '❌');

      if (ts.accuracy) {
        console.log('Accuracy:', `±${ts.accuracy} seconds`);
      }
    }

    // GOST specific verification
    if (verification.gostVerification) {
      const gost = verification.gostVerification;
      console.log('\n🇺🇿 GOST Verification:');
      console.log('GOST Algorithm:', gost.algorithm);
      console.log('Curve Parameters:', gost.curveParameters);
      console.log('Hash Function:', gost.hashFunction);
      console.log('GOST Compliance:', gost.compliant ? '✅' : '❌');
      console.log('National Standard:', gost.nationalStandard);
    }

    // Validation errors and warnings
    if (verification.errors && verification.errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      verification.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.code}: ${error.message}`);
        if (error.details) {
          console.log(`   Details: ${error.details}`);
        }
      });
    }

    if (verification.warnings && verification.warnings.length > 0) {
      console.log('\n⚠️ Validation Warnings:');
      verification.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.code}: ${warning.message}`);
        if (warning.details) {
          console.log(`   Details: ${warning.details}`);
        }
      });
    }

    // Signature properties
    if (verification.signatureProperties) {
      const props = verification.signatureProperties;
      console.log('\n📊 Signature Properties:');
      console.log('Format:', props.format);
      console.log('Version:', props.version);
      console.log('Detached:', props.detached ? 'Yes' : 'No');
      console.log('Content Type:', props.contentType);
      console.log('Message Digest:', props.messageDigest);

      if (props.signingTime) {
        console.log(
          'Signing Time (claimed):',
          new Date(props.signingTime).toLocaleString()
        );
      }

      if (props.counterSignatures && props.counterSignatures.length > 0) {
        console.log('Counter Signatures:', props.counterSignatures.length);
      }
    }

    // Generate verification report
    const verificationReport = {
      verificationId: `verify_${Date.now()}`,
      timestamp: new Date().toISOString(),
      result: {
        valid: verification.valid,
        signatureValid: verification.signatureValid,
        certificateValid: verification.certificateValid,
        chainValid: verification.chainValid,
        timestampValid: verification.timestampValid
      },
      signerInfo: verification.signerInfo,
      certificateChain: verification.certificateChain,
      timestampInfo: verification.timestampInfo,
      gostVerification: verification.gostVerification,
      errors: verification.errors,
      warnings: verification.warnings,
      metadata: {
        verifiedBy: 'YTKS Plugin',
        verificationTime: verification.verificationTime,
        version: '1.0'
      }
    };

    const reportFileName = `verification_report_${Date.now()}.json`;
    await saveVerificationReport(reportFileName, verificationReport);
    console.log(`\n📊 Verification report saved to: ${reportFileName}`);

    return verification;
  } else {
    console.error('❌ Signature verification failed:', verifyResult.reason);

    // Handle specific verification errors
    if (verifyResult.reason.includes('INVALID_SIGNATURE_FORMAT')) {
      console.error('📄 Invalid signature format');
    } else if (verifyResult.reason.includes('CERTIFICATE_NOT_TRUSTED')) {
      console.error('🚫 Certificate is not trusted');
    } else if (verifyResult.reason.includes('SIGNATURE_CORRUPTED')) {
      console.error('💥 Signature data is corrupted');
    } else if (verifyResult.reason.includes('TIMESTAMP_INVALID')) {
      console.error('⏰ Timestamp is invalid');
    }
  }
} catch (error) {
  console.error('❌ Signature verification error:', error);
}

function parseSubjectDN(subjectDN: string): Record<string, string> | null {
  try {
    const components: Record<string, string> = {};
    const parts = subjectDN.split(',');

    parts.forEach(part => {
      const [key, value] = part.trim().split('=');
      if (key && value) {
        components[key.trim()] = value.trim();
      }
    });

    return components;
  } catch (error) {
    console.error('Failed to parse subject DN:', error);
    return null;
  }
}

async function saveVerificationReport(
  fileName: string,
  report: any
): Promise<void> {
  console.log(`📊 Saving verification report: ${fileName}`);
  // Implementation would save JSON report to file
}
```

## Complete Examples

### Complete YTKS E-Signature Workflow

```typescript
async function completeYTKSESignatureWorkflow() {
  try {
    console.log('🇺🇿 Starting complete YTKS e-signature workflow...');

    // 1. Scan for available YTKS tokens
    console.log('\n1. Scanning for YTKS tokens...');

    const scanResult = await ytksPlugin.listTokensAsync({
      includeDetails: true,
      refreshCache: true,
      supportedAlgorithms: ['GOST_R3410_2012_256', 'GOST_R3410_2012_512']
    });

    if (!scanResult.success || scanResult.tokens.length === 0) {
      throw new Error('No YTKS tokens found. Please connect your token.');
    }

    // Select first available token
    const selectedToken = scanResult.tokens.find(t => t.status === 'CONNECTED');
    if (!selectedToken) {
      throw new Error('No connected tokens found');
    }

    console.log('✅ Selected token:', selectedToken.name);
    console.log('Serial Number:', selectedToken.serialNumber);

    // 2. Authenticate with token
    console.log('\n2. Authenticating with token...');

    const pin = await promptForPIN(); // In real app, get from user input

    const authResult = await ytksPlugin.authenticateTokenAsync(
      selectedToken.tokenId,
      {
        pin: pin,
        authenticationMethod: 'PIN',
        sessionTimeout: 1800,
        validateCertificates: true,
        auditLog: true
      }
    );

    if (!authResult.success) {
      throw new Error(`Authentication failed: ${authResult.reason}`);
    }

    console.log('✅ Authentication successful');
    console.log('User:', authResult.authenticationResult.userInfo.fullName);
    console.log('PINFL:', authResult.authenticationResult.userInfo.pinfl);

    const sessionToken = authResult.authenticationResult.sessionToken;

    // 3. Select signing certificate
    console.log('\n3. Selecting signing certificate...');

    const certResult = await ytksPlugin.selectCertificateAsync(
      selectedToken.tokenId,
      {
        sessionToken: sessionToken,
        purpose: 'SIGNATURE',
        validOnly: true,
        algorithm: 'GOST_R3410_2012_256'
      }
    );

    if (!certResult.success || certResult.certificates.length === 0) {
      throw new Error('No suitable signing certificates found');
    }

    const signingCert = certResult.certificates[0]; // Use first certificate
    console.log('✅ Selected certificate:', signingCert.subject);

    // Set as active certificate
    await ytksPlugin.setActiveCertificateAsync(selectedToken.tokenId, {
      sessionToken: sessionToken,
      certificateId: signingCert.id,
      validateChain: true
    });

    // 4. Prepare documents for signing
    console.log('\n4. Preparing documents for signing...');

    const documentsToSign = [
      {
        id: 'doc1',
        content: "Shartnoma № 001 - Xizmat ko'rsatish shartnomasi",
        fileName: 'contract_001.txt',
        description: 'Service contract for company services'
      },
      {
        id: 'doc2',
        content: "Buyruq № 15 - Ishchi qabul qilish to'g'risida",
        fileName: 'order_015.txt',
        description: 'Employment order for new employee'
      },
      {
        id: 'doc3',
        content: 'Hisobot - 2024 yil uchinchi chorak moliyaviy hisoboti',
        fileName: 'report_q3_2024.txt',
        description: 'Q3 2024 financial report'
      }
    ];

    const signedDocuments = [];

    // 5. Sign each document
    console.log('\n5. Signing documents...');

    for (let i = 0; i < documentsToSign.length; i++) {
      const doc = documentsToSign[i];
      console.log(
        `\nSigning document ${i + 1}/${documentsToSign.length}: ${doc.fileName}`
      );

      const signResult = await ytksPlugin.createSignatureAsync(
        selectedToken.tokenId,
        {
          sessionToken: sessionToken,
          certificateId: signingCert.id,
          data: doc.content,
          signatureOptions: {
            algorithm: 'GOST_R3410_2012_256',
            hashAlgorithm: 'GOST_R3411_2012_256',
            signatureFormat: 'CMS',
            detached: false,
            includeChain: true,
            includeSigningTime: true,
            includeSignerInfo: true,
            timestampUrl: 'http://tsa.e-imzo.uz/tsa'
          },
          documentInfo: {
            fileName: doc.fileName,
            mimeType: 'text/plain',
            description: doc.description,
            purpose: 'Document approval'
          },
          signerRole: {
            role:
              authResult.authenticationResult.userInfo.position || 'Employee',
            organization:
              authResult.authenticationResult.userInfo.organization ||
              'My Company',
            location: 'Tashkent, Uzbekistan',
            reason: 'Official document signing'
          }
        }
      );

      if (signResult.success) {
        console.log('✅ Document signed successfully');

        signedDocuments.push({
          documentId: doc.id,
          originalFileName: doc.fileName,
          signedFileName: `${doc.fileName}.p7s`,
          signatureData: signResult.signatureResult.signatureData,
          signatureId: signResult.signatureResult.signatureId,
          signedAt: signResult.signatureResult.createdAt
        });

        // Save signed document
        await saveSignedDocument(
          `${doc.fileName}.p7s`,
          signResult.signatureResult.signatureData
        );
      } else {
        console.error(`❌ Failed to sign ${doc.fileName}:`, signResult.reason);
      }

      // Brief pause between signings
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 6. Verify signatures
    console.log('\n6. Verifying signatures...');

    const verificationResults = [];

    for (const signedDoc of signedDocuments) {
      console.log(`\nVerifying: ${signedDoc.originalFileName}`);

      const verifyResult = await ytksPlugin.verifySignatureAsync({
        signatureData: signedDoc.signatureData,
        verificationOptions: {
          checkCertificateChain: true,
          checkCertificateRevocation: false, // Skip for demo
          checkTimestamp: true,
          validateGOSTParameters: true,
          requireValidCertificate: true
        }
      });

      if (verifyResult.success) {
        const verification = verifyResult.verificationResult;
        console.log(`✅ Signature valid: ${verification.valid ? 'Yes' : 'No'}`);

        verificationResults.push({
          documentId: signedDoc.documentId,
          fileName: signedDoc.originalFileName,
          signatureValid: verification.valid,
          verifiedAt: new Date().toISOString(),
          signerSubject: verification.signerInfo?.subject
        });
      } else {
        console.log(`❌ Verification failed: ${verifyResult.reason}`);
        verificationResults.push({
          documentId: signedDoc.documentId,
          fileName: signedDoc.originalFileName,
          signatureValid: false,
          error: verifyResult.reason
        });
      }
    }

    // 7. Generate comprehensive report
    console.log('\n7. Generating signing session report...');

    const sessionReport = {
      sessionId: `ytks_session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      token: {
        id: selectedToken.tokenId,
        name: selectedToken.name,
        serialNumber: selectedToken.serialNumber,
        manufacturer: selectedToken.manufacturer
      },
      signer: {
        fullName: authResult.authenticationResult.userInfo.fullName,
        pinfl: authResult.authenticationResult.userInfo.pinfl,
        organization: authResult.authenticationResult.userInfo.organization,
        position: authResult.authenticationResult.userInfo.position
      },
      certificate: {
        id: signingCert.id,
        subject: signingCert.subject,
        issuer: signingCert.issuer,
        serialNumber: signingCert.serialNumber,
        algorithm: signingCert.algorithm,
        validTo: signingCert.validTo
      },
      documents: {
        total: documentsToSign.length,
        signed: signedDocuments.length,
        verified: verificationResults.filter(v => v.signatureValid).length,
        failed: documentsToSign.length - signedDocuments.length
      },
      signedDocuments: signedDocuments,
      verificationResults: verificationResults,
      statistics: {
        sessionDuration: Date.now() - sessionStartTime,
        averageSigningTime:
          signedDocuments.length > 0
            ? (Date.now() - sessionStartTime) / signedDocuments.length
            : 0,
        successRate: (signedDocuments.length / documentsToSign.length) * 100
      },
      compliance: {
        gostCompliant: true,
        nationalStandard: "O'z DSt 1092:2009",
        timestamped: true,
        certificateChainValidated: true
      }
    };

    const reportFileName = `ytks_session_report_${Date.now()}.json`;
    await saveSessionReport(reportFileName, sessionReport);

    // 8. Logout from token
    console.log('\n8. Logging out from token...');

    const logoutResult = await ytksPlugin.logoutTokenAsync(
      selectedToken.tokenId,
      {
        sessionToken: sessionToken,
        clearCache: true,
        auditLog: true
      }
    );

    if (logoutResult.success) {
      console.log('✅ Successfully logged out from token');
    }

    console.log('\n🎉 YTKS e-signature workflow completed successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 Session Summary:');
    console.log(`Token: ${selectedToken.name} (${selectedToken.serialNumber})`);
    console.log(`Signer: ${authResult.authenticationResult.userInfo.fullName}`);
    console.log(`Documents processed: ${documentsToSign.length}`);
    console.log(`Documents signed: ${signedDocuments.length}`);
    console.log(
      `Signatures verified: ${verificationResults.filter(v => v.signatureValid).length}`
    );
    console.log(
      `Success rate: ${sessionReport.statistics.successRate.toFixed(1)}%`
    );
    console.log(
      `Session duration: ${formatDuration(sessionReport.statistics.sessionDuration)}`
    );
    console.log(`Report: ${reportFileName}`);

    return {
      sessionReport: sessionReport,
      signedDocuments: signedDocuments,
      verificationResults: verificationResults
    };
  } catch (error) {
    console.error('❌ YTKS e-signature workflow failed:', error);
    throw error;
  }
}

const sessionStartTime = Date.now();

async function promptForPIN(): Promise<string> {
  // In real application, this would be a secure PIN input dialog
  console.log('Please enter your PIN:');
  return '123456'; // Demo PIN
}

async function saveSignedDocument(
  fileName: string,
  signatureData: string
): Promise<void> {
  console.log(`💾 Saving signed document: ${fileName}`);
  // Implementation would save signature data to file
}

async function saveSessionReport(fileName: string, report: any): Promise<void> {
  console.log(`📊 Saving session report: ${fileName}`);
  // Implementation would save JSON report to file
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
```

## Callback API (Legacy)

### listTokens() - Callback Version

```typescript
ytksPlugin.listTokens(
  {
    includeDetails: true,
    refreshCache: true
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Tokens found:', response.tokens.length);
    } else {
      console.error('Callback: Scan failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Scan error:', error);
  }
);
```

### createSignature() - Callback Version

```typescript
ytksPlugin.createSignature(
  tokenId,
  {
    sessionToken: sessionToken,
    certificateId: certificateId,
    data: dataToSign,
    signatureOptions: {
      algorithm: 'GOST_R3410_2012_256',
      signatureFormat: 'CMS'
    }
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Signature created');
      console.log('Signature ID:', response.signatureResult.signatureId);
    } else {
      console.error('Callback: Signing failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Signing error:', error);
  }
);
```

## Error Handling

### Token Authentication Errors

```typescript
try {
  const result = await ytksPlugin.authenticateTokenAsync(tokenId, params);
} catch (error) {
  if (error.message.includes('invalid pin')) {
    console.error('❌ Invalid PIN entered');
  } else if (error.message.includes('pin blocked')) {
    console.error('❌ PIN is blocked - contact administrator');
  } else if (error.message.includes('token not found')) {
    console.error('❌ Token not found - check connection');
  } else if (error.message.includes('token locked')) {
    console.error('❌ Token is locked');
  } else {
    console.error('❌ Authentication error:', error.message);
  }
}
```

### Signature Creation Errors

```typescript
try {
  const result = await ytksPlugin.createSignatureAsync(tokenId, params);
} catch (error) {
  if (error.message.includes('certificate expired')) {
    console.error('❌ Signing certificate has expired');
  } else if (error.message.includes('certificate revoked')) {
    console.error('❌ Signing certificate has been revoked');
  } else if (error.message.includes('invalid data')) {
    console.error('❌ Invalid data format for signing');
  } else if (error.message.includes('pin required')) {
    console.error('❌ PIN verification required for signing');
  } else {
    console.error('❌ Signature creation error:', error.message);
  }
}
```

## Best Practices

1. **Token Security**: Always logout after completing operations
2. **PIN Handling**: Use secure PIN entry methods, never store PINs
3. **Certificate Validation**: Always validate certificates before signing
4. **GOST Compliance**: Use GOST algorithms for compliance with national
   standards
5. **Timestamp Services**: Include timestamps for non-repudiation
6. **Session Management**: Implement proper session timeouts
7. **Error Handling**: Handle all possible error scenarios gracefully
8. **Audit Logging**: Maintain detailed audit logs for all operations
9. **Certificate Monitoring**: Monitor certificate expiration dates
10. **Regular Updates**: Keep token drivers and software updated
