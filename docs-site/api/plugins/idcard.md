# IDCard Plugin API Reference

IDCard plugin ID kartalar va smartcard'lar bilan ishlash uchun mo'ljallangan. Bu
plugin ID kartalardan ma'lumot o'qish, sertifikatlarni extract qilish va ID
karta operatsiyalarini bajarish uchun ishlatiladi.

## Overview

IDCard plugin quyidagi funksiyalarni taqdim etadi:

- ID karta ma'lumotlarini o'qish
- Shaxsiy ma'lumotlarni extract qilish
- ID kartadan sertifikatlarni olish
- PIN verification va authentication
- ID karta holati tekshirish

## Import

```typescript
// ES6 import
import { idCardPlugin } from 'imzo-agnost';

// CommonJS
const { idCardPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.idCard;
```

## Types

```typescript
interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  gender: string;
  nationality: string;
  documentNumber: string;
  issuedDate: string;
  expiryDate: string;
  issuedBy: string;
  address?: string;
  pinfl?: string; // Personal identification number
}

interface IDCardInfo {
  cardNumber: string;
  cardType: string;
  version: string;
  issuedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'blocked' | 'invalid';
  personalInfo: PersonalInfo;
}

interface CardCertificate {
  type: 'authentication' | 'signing' | 'encryption';
  certificate: string;
  serialNumber: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  keyUsage: string[];
}

interface PINVerificationResult {
  success: boolean;
  attemptsLeft?: number;
  blocked?: boolean;
  reason?: string;
}

interface CardStatus {
  connected: boolean;
  cardPresent: boolean;
  cardType: string;
  readerName: string;
  cardNumber?: string;
}
```

## Card Detection and Connection

### detectCardAsync()

ID karta mavjudligini aniqlash.

```typescript
try {
  const detection = await idCardPlugin.detectCardAsync();

  if (detection.cardPresent) {
    console.log('✅ ID card detected');
    console.log('Reader:', detection.readerName);
    console.log('Card type:', detection.cardType);
    console.log('Card number:', detection.cardNumber);
  } else {
    console.log('❌ No ID card detected');
    console.log('Available readers:', detection.availableReaders);
  }
} catch (error) {
  console.error('❌ Card detection failed:', error);
}
```

### connectToCardAsync()

ID karta bilan aloqa o'rnatish.

```typescript
try {
  const connection = await idCardPlugin.connectToCardAsync();

  if (connection.success) {
    console.log('✅ Connected to ID card');
    console.log('Card number:', connection.cardNumber);
    console.log('Card type:', connection.cardType);
    console.log('ATR:', connection.atr); // Answer To Reset
  }
} catch (error) {
  console.error('❌ Card connection failed:', error);
}
```

### getCardStatusAsync()

ID karta holatini tekshirish.

```typescript
try {
  const status = await idCardPlugin.getCardStatusAsync();

  console.log('📋 Card Status:');
  console.log('Connected:', status.connected ? '✅' : '❌');
  console.log('Card present:', status.cardPresent ? '✅' : '❌');
  console.log('Card type:', status.cardType);
  console.log('Reader name:', status.readerName);

  if (status.cardNumber) {
    console.log('Card number:', status.cardNumber);
  }
} catch (error) {
  console.error('❌ Card status check failed:', error);
}
```

## Personal Information Reading

### readPersonalInfoAsync()

Shaxsiy ma'lumotlarni o'qish.

```typescript
try {
  const personalInfo = await idCardPlugin.readPersonalInfoAsync();

  if (personalInfo.success) {
    console.log('📋 Personal Information:');
    console.log('Name:', personalInfo.firstName, personalInfo.lastName);
    if (personalInfo.middleName) {
      console.log('Middle name:', personalInfo.middleName);
    }
    console.log('Birth date:', personalInfo.birthDate);
    console.log('Gender:', personalInfo.gender);
    console.log('Nationality:', personalInfo.nationality);
    console.log('Document number:', personalInfo.documentNumber);
    console.log('PINFL:', personalInfo.pinfl);
    console.log('Issued date:', personalInfo.issuedDate);
    console.log('Expiry date:', personalInfo.expiryDate);
    console.log('Issued by:', personalInfo.issuedBy);

    if (personalInfo.address) {
      console.log('Address:', personalInfo.address);
    }
  }
} catch (error) {
  console.error('❌ Personal info reading failed:', error);
}
```

### readCardInfoAsync()

ID karta ma'lumotlarini to'liq o'qish.

```typescript
try {
  const cardInfo = await idCardPlugin.readCardInfoAsync();

  if (cardInfo.success) {
    console.log('📄 ID Card Information:');
    console.log('═══════════════════════');

    // Card details
    console.log('Card number:', cardInfo.cardNumber);
    console.log('Card type:', cardInfo.cardType);
    console.log('Version:', cardInfo.version);
    console.log('Status:', cardInfo.status);
    console.log('Issued:', cardInfo.issuedDate);
    console.log('Expires:', cardInfo.expiryDate);

    // Personal information
    const personal = cardInfo.personalInfo;
    console.log('\n👤 Personal Information:');
    console.log(
      'Full name:',
      `${personal.firstName} ${personal.middleName || ''} ${personal.lastName}`.trim()
    );
    console.log('Birth date:', personal.birthDate);
    console.log('Gender:', personal.gender);
    console.log('Nationality:', personal.nationality);
    console.log('Document №:', personal.documentNumber);
    console.log('PINFL:', personal.pinfl);

    // Check card validity
    const expiryDate = new Date(cardInfo.expiryDate);
    const today = new Date();
    const isValid = today < expiryDate;

    console.log('\n📅 Validity:');
    console.log('Status:', isValid ? '✅ Valid' : '❌ Expired');

    if (isValid) {
      const daysLeft = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log('Days until expiry:', daysLeft);

      if (daysLeft < 30) {
        console.log('⚠️ Card expires soon!');
      }
    }
  }
} catch (error) {
  console.error('❌ Card info reading failed:', error);
}
```

## Certificate Operations

### getCertificatesAsync()

ID kartadan sertifikatlarni olish.

```typescript
try {
  const certificates = await idCardPlugin.getCertificatesAsync();

  if (certificates.success) {
    console.log('🔐 ID Card Certificates:');
    console.log('═══════════════════════');

    certificates.list.forEach((cert, index) => {
      console.log(`\n${index + 1}. ${cert.type.toUpperCase()} Certificate:`);
      console.log('Serial Number:', cert.serialNumber);
      console.log('Subject:', cert.subject);
      console.log('Issuer:', cert.issuer);
      console.log('Valid from:', cert.validFrom);
      console.log('Valid to:', cert.validTo);
      console.log('Key usage:', cert.keyUsage.join(', '));
      console.log(
        'Certificate (Base64):',
        cert.certificate.substring(0, 100) + '...'
      );
    });

    // Check certificate validity
    const now = new Date();
    certificates.list.forEach(cert => {
      const validTo = new Date(cert.validTo);
      const isValid = now < validTo;
      console.log(
        `${cert.type} certificate: ${isValid ? '✅ Valid' : '❌ Expired'}`
      );
    });
  }
} catch (error) {
  console.error('❌ Certificate reading failed:', error);
}
```

### getSigningCertificateAsync()

Imzolash sertifikatini olish.

```typescript
try {
  const signingCert = await idCardPlugin.getSigningCertificateAsync();

  if (signingCert.success) {
    console.log('✍️ Signing Certificate:');
    console.log('Serial Number:', signingCert.serialNumber);
    console.log('Subject:', signingCert.subject);
    console.log('Valid until:', signingCert.validTo);
    console.log('Certificate data:', signingCert.certificate);

    // Can be used with PKCS7 plugin for signing
    // const pkcs7Result = await pkcs7Plugin.createPkcs7Async(data, signingCert.keyId);
  }
} catch (error) {
  console.error('❌ Signing certificate reading failed:', error);
}
```

### getAuthenticationCertificateAsync()

Authentication sertifikatini olish.

```typescript
try {
  const authCert = await idCardPlugin.getAuthenticationCertificateAsync();

  if (authCert.success) {
    console.log('🔐 Authentication Certificate:');
    console.log('Serial Number:', authCert.serialNumber);
    console.log('Subject:', authCert.subject);
    console.log('Valid until:', authCert.validTo);
    console.log('Certificate data:', authCert.certificate);

    // Can be used for SSL client authentication
  }
} catch (error) {
  console.error('❌ Authentication certificate reading failed:', error);
}
```

## PIN Operations

### verifyPINAsync()

PIN kodni tekshirish.

```typescript
try {
  const pin = '123456'; // User input

  const verification = await idCardPlugin.verifyPINAsync(pin);

  if (verification.success) {
    console.log('✅ PIN verification successful');
    console.log('Attempts left:', verification.attemptsLeft);
  } else {
    console.log('❌ PIN verification failed');
    console.log('Reason:', verification.reason);
    console.log('Attempts left:', verification.attemptsLeft);

    if (verification.blocked) {
      console.log('⚠️ Card is blocked due to too many failed attempts');
    }
  }
} catch (error) {
  console.error('❌ PIN verification error:', error);
}
```

### changePINAsync()

PIN kodni o'zgartirish.

```typescript
try {
  const oldPIN = '123456';
  const newPIN = '654321';

  const result = await idCardPlugin.changePINAsync(oldPIN, newPIN);

  if (result.success) {
    console.log('✅ PIN changed successfully');
  } else {
    console.log('❌ PIN change failed');
    console.log('Reason:', result.reason);

    if (result.oldPinInvalid) {
      console.log('Old PIN is incorrect');
    }

    if (result.newPinInvalid) {
      console.log('New PIN format is invalid');
    }
  }
} catch (error) {
  console.error('❌ PIN change error:', error);
}
```

### getPINStatusAsync()

PIN holati haqida ma'lumot olish.

```typescript
try {
  const pinStatus = await idCardPlugin.getPINStatusAsync();

  console.log('📌 PIN Status:');
  console.log('Verified:', pinStatus.verified ? '✅' : '❌');
  console.log('Attempts left:', pinStatus.attemptsLeft);
  console.log('Blocked:', pinStatus.blocked ? '⚠️ Yes' : '✅ No');
  console.log('Last verification:', pinStatus.lastVerification || 'Never');

  if (pinStatus.blocked) {
    console.log('Unblock required with PUK code');
  } else if (pinStatus.attemptsLeft < 3) {
    console.log('⚠️ Warning: Few attempts remaining');
  }
} catch (error) {
  console.error('❌ PIN status check failed:', error);
}
```

## Complete Examples

### Full ID Card Reading Workflow

```typescript
async function readIDCardCompletely() {
  try {
    console.log('🆔 Starting complete ID card reading...');

    // 1. Detect card
    console.log('1. Detecting ID card...');
    const detection = await idCardPlugin.detectCardAsync();

    if (!detection.cardPresent) {
      throw new Error('No ID card detected. Please insert your ID card.');
    }

    console.log('✅ ID card detected');
    console.log('Reader:', detection.readerName);

    // 2. Connect to card
    console.log('2. Connecting to card...');
    const connection = await idCardPlugin.connectToCardAsync();

    if (!connection.success) {
      throw new Error('Failed to connect to ID card');
    }

    console.log('✅ Connected to card');
    console.log('Card type:', connection.cardType);

    // 3. Read personal information
    console.log('3. Reading personal information...');
    const personalInfo = await idCardPlugin.readPersonalInfoAsync();

    if (!personalInfo.success) {
      throw new Error('Failed to read personal information');
    }

    console.log('✅ Personal information read');

    // 4. Read certificates
    console.log('4. Reading certificates...');
    const certificates = await idCardPlugin.getCertificatesAsync();

    if (!certificates.success) {
      throw new Error('Failed to read certificates');
    }

    console.log('✅ Certificates read');

    // 5. Get card status
    console.log('5. Checking card status...');
    const cardInfo = await idCardPlugin.readCardInfoAsync();

    // 6. Generate comprehensive report
    console.log('\n📄 COMPLETE ID CARD REPORT');
    console.log('═══════════════════════════════════════');

    // Personal Information
    console.log('\n👤 PERSONAL INFORMATION:');
    const fullName =
      `${personalInfo.firstName} ${personalInfo.middleName || ''} ${personalInfo.lastName}`.trim();
    console.log(`Full name: ${fullName}`);
    console.log(`Birth date: ${personalInfo.birthDate}`);
    console.log(`Gender: ${personalInfo.gender}`);
    console.log(`Nationality: ${personalInfo.nationality}`);
    console.log(`Document number: ${personalInfo.documentNumber}`);
    console.log(`PINFL: ${personalInfo.pinfl}`);
    console.log(`Issued by: ${personalInfo.issuedBy}`);
    console.log(`Issued date: ${personalInfo.issuedDate}`);
    console.log(`Expiry date: ${personalInfo.expiryDate}`);

    if (personalInfo.address) {
      console.log(`Address: ${personalInfo.address}`);
    }

    // Card Information
    console.log('\n💳 CARD INFORMATION:');
    console.log(`Card number: ${cardInfo.cardNumber}`);
    console.log(`Card type: ${cardInfo.cardType}`);
    console.log(`Version: ${cardInfo.version}`);
    console.log(`Status: ${cardInfo.status}`);

    // Validity Check
    const expiryDate = new Date(personalInfo.expiryDate);
    const today = new Date();
    const isValid = today < expiryDate;
    const daysLeft = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    console.log('\n📅 VALIDITY STATUS:');
    console.log(`Status: ${isValid ? '✅ Valid' : '❌ Expired'}`);

    if (isValid) {
      console.log(`Days until expiry: ${daysLeft}`);
      if (daysLeft < 30) {
        console.log('⚠️ Warning: Document expires soon!');
      }
    } else {
      console.log(`Expired ${Math.abs(daysLeft)} days ago`);
    }

    // Certificates
    console.log('\n🔐 CERTIFICATES:');
    certificates.list.forEach((cert, index) => {
      const certExpiryDate = new Date(cert.validTo);
      const certValid = today < certExpiryDate;

      console.log(`${index + 1}. ${cert.type.toUpperCase()}:`);
      console.log(`   Serial: ${cert.serialNumber}`);
      console.log(`   Subject: ${cert.subject}`);
      console.log(`   Valid until: ${cert.validTo}`);
      console.log(`   Status: ${certValid ? '✅ Valid' : '❌ Expired'}`);
      console.log(`   Key usage: ${cert.keyUsage.join(', ')}`);
    });

    // Summary
    const validCertificates = certificates.list.filter(cert => {
      const certExpiryDate = new Date(cert.validTo);
      return today < certExpiryDate;
    });

    console.log('\n📊 SUMMARY:');
    console.log(`Document valid: ${isValid ? '✅' : '❌'}`);
    console.log(
      `Valid certificates: ${validCertificates.length}/${certificates.list.length}`
    );
    console.log(
      `Ready for digital operations: ${isValid && validCertificates.length > 0 ? '✅' : '❌'}`
    );

    console.log('\n🎉 Complete ID card reading finished!');

    return {
      personalInfo: personalInfo,
      cardInfo: cardInfo,
      certificates: certificates.list,
      validity: {
        documentValid: isValid,
        daysLeft: daysLeft,
        validCertificates: validCertificates.length,
        readyForUse: isValid && validCertificates.length > 0
      },
      summary: {
        fullName: fullName,
        documentNumber: personalInfo.documentNumber,
        pinfl: personalInfo.pinfl,
        cardType: cardInfo.cardType,
        status: cardInfo.status
      }
    };
  } catch (error) {
    console.error('❌ Complete ID card reading failed:', error);
    throw error;
  }
}
```

### ID Card Authentication Workflow

```typescript
async function authenticateWithIDCard(pin?: string) {
  try {
    console.log('🔐 Starting ID card authentication...');

    // 1. Check card presence
    console.log('1. Checking card presence...');
    const status = await idCardPlugin.getCardStatusAsync();

    if (!status.cardPresent) {
      throw new Error('Please insert your ID card');
    }

    console.log('✅ ID card detected');

    // 2. Connect to card
    await idCardPlugin.connectToCardAsync();
    console.log('✅ Connected to card');

    // 3. Get PIN if not provided
    if (!pin) {
      // In real application, this would be from user input
      pin = await promptForPIN();
    }

    // 4. Verify PIN
    console.log('2. Verifying PIN...');
    const pinVerification = await idCardPlugin.verifyPINAsync(pin);

    if (!pinVerification.success) {
      const attemptsLeft = pinVerification.attemptsLeft || 0;

      if (pinVerification.blocked) {
        throw new Error('Card is blocked. Contact authorities to unblock.');
      } else {
        throw new Error(
          `PIN verification failed. ${attemptsLeft} attempts remaining.`
        );
      }
    }

    console.log('✅ PIN verified successfully');

    // 5. Read authenticated user info
    console.log('3. Reading user information...');
    const personalInfo = await idCardPlugin.readPersonalInfoAsync();

    // 6. Get authentication certificate
    console.log('4. Getting authentication certificate...');
    const authCert = await idCardPlugin.getAuthenticationCertificateAsync();

    // 7. Validate certificate
    console.log('5. Validating certificate...');
    const today = new Date();
    const certExpiry = new Date(authCert.validTo);
    const certValid = today < certExpiry;

    if (!certValid) {
      throw new Error('Authentication certificate has expired');
    }

    console.log('✅ Certificate validated');

    // 8. Create authentication session
    const authSession = {
      sessionId: generateSessionId(),
      timestamp: new Date().toISOString(),
      user: {
        fullName: `${personalInfo.firstName} ${personalInfo.lastName}`,
        documentNumber: personalInfo.documentNumber,
        pinfl: personalInfo.pinfl
      },
      certificate: {
        serialNumber: authCert.serialNumber,
        subject: authCert.subject,
        validUntil: authCert.validTo
      },
      authenticationMethod: 'id_card_pin',
      status: 'authenticated'
    };

    console.log('✅ Authentication session created');
    console.log('Session ID:', authSession.sessionId);
    console.log('User:', authSession.user.fullName);
    console.log('Document:', authSession.user.documentNumber);

    console.log('🎉 ID card authentication completed successfully!');

    return authSession;
  } catch (error) {
    console.error('❌ ID card authentication failed:', error);
    throw error;
  }
}

function generateSessionId(): string {
  return (
    'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  );
}

async function promptForPIN(): Promise<string> {
  // In real application, this would be a secure PIN input dialog
  return new Promise(resolve => {
    // Simulate user PIN input
    setTimeout(() => {
      resolve('123456'); // Mock PIN
    }, 1000);
  });
}
```

### ID Card Certificate Export

```typescript
async function exportIDCardCertificates(
  outputFormat: 'pem' | 'der' | 'p12' = 'pem'
) {
  try {
    console.log('💾 Exporting ID card certificates...');

    // 1. Connect and read certificates
    await idCardPlugin.connectToCardAsync();
    const certificates = await idCardPlugin.getCertificatesAsync();

    if (!certificates.success) {
      throw new Error('Failed to read certificates from ID card');
    }

    console.log(`Found ${certificates.list.length} certificates to export`);

    // 2. Get personal info for file naming
    const personalInfo = await idCardPlugin.readPersonalInfoAsync();
    const baseFileName =
      `${personalInfo.firstName}_${personalInfo.lastName}_${personalInfo.documentNumber}`.replace(
        /\s+/g,
        '_'
      );

    const exportedFiles = [];

    // 3. Export each certificate
    for (let i = 0; i < certificates.list.length; i++) {
      const cert = certificates.list[i];

      console.log(`Exporting ${cert.type} certificate...`);

      let fileName: string;
      let content: string;

      switch (outputFormat) {
        case 'pem':
          fileName = `${baseFileName}_${cert.type}.crt`;
          content = formatAsPEM(cert.certificate);
          break;

        case 'der':
          fileName = `${baseFileName}_${cert.type}.der`;
          content = cert.certificate; // Already in base64, needs binary conversion
          break;

        case 'p12':
          fileName = `${baseFileName}_${cert.type}.p12`;
          // Would need private key access for P12 format
          content = cert.certificate;
          break;

        default:
          throw new Error('Unsupported output format');
      }

      // 4. Save certificate (in browser, this would trigger download)
      const exportedFile = {
        fileName: fileName,
        content: content,
        type: cert.type,
        serialNumber: cert.serialNumber,
        subject: cert.subject,
        validFrom: cert.validFrom,
        validTo: cert.validTo
      };

      exportedFiles.push(exportedFile);

      console.log(`✅ ${cert.type} certificate exported as ${fileName}`);
    }

    // 5. Create manifest file
    const manifest = {
      exportDate: new Date().toISOString(),
      user: {
        name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        documentNumber: personalInfo.documentNumber,
        pinfl: personalInfo.pinfl
      },
      certificates: exportedFiles.map(file => ({
        fileName: file.fileName,
        type: file.type,
        serialNumber: file.serialNumber,
        subject: file.subject,
        validFrom: file.validFrom,
        validTo: file.validTo
      })),
      format: outputFormat,
      totalFiles: exportedFiles.length
    };

    exportedFiles.push({
      fileName: `${baseFileName}_manifest.json`,
      content: JSON.stringify(manifest, null, 2),
      type: 'manifest',
      serialNumber: '',
      subject: '',
      validFrom: '',
      validTo: ''
    });

    console.log('📄 Export manifest created');

    console.log('✅ Certificate export completed successfully!');
    console.log(
      `Exported ${certificates.list.length} certificates in ${outputFormat.toUpperCase()} format`
    );

    return {
      files: exportedFiles,
      manifest: manifest,
      summary: {
        totalCertificates: certificates.list.length,
        format: outputFormat,
        user: manifest.user
      }
    };
  } catch (error) {
    console.error('❌ Certificate export failed:', error);
    throw error;
  }
}

function formatAsPEM(base64Cert: string): string {
  const certBody = base64Cert.replace(/(.{64})/g, '$1\n');
  return `-----BEGIN CERTIFICATE-----\n${certBody}\n-----END CERTIFICATE-----`;
}
```

## Callback API (Legacy)

### readPersonalInfo() - Callback Version

```typescript
idCardPlugin.readPersonalInfo(
  (event, response) => {
    if (response.success) {
      console.log('Callback: Personal info read');
      console.log('Name:', response.firstName, response.lastName);
      console.log('Document:', response.documentNumber);
    } else {
      console.error('Callback: Reading failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Reading error:', error);
  }
);
```

### verifyPIN() - Callback Version

```typescript
idCardPlugin.verifyPIN(
  pin,
  (event, response) => {
    if (response.success) {
      console.log('Callback: PIN verified');
      console.log('Attempts left:', response.attemptsLeft);
    } else {
      console.log('Callback: PIN verification failed');
      console.log('Attempts left:', response.attemptsLeft);
    }
  },
  error => {
    console.error('Callback: PIN verification error:', error);
  }
);
```

## Error Handling

### Card Reading Errors

```typescript
try {
  const result = await idCardPlugin.readPersonalInfoAsync();
} catch (error) {
  if (error.message.includes('card not present')) {
    console.error('❌ ID card not inserted');
  } else if (error.message.includes('reader not found')) {
    console.error('❌ Card reader not connected');
  } else if (error.message.includes('card blocked')) {
    console.error('❌ ID card is blocked');
  } else if (error.message.includes('data corrupted')) {
    console.error('❌ Card data is corrupted');
  } else {
    console.error('❌ Card reading error:', error.message);
  }
}
```

### PIN Verification Errors

```typescript
try {
  const result = await idCardPlugin.verifyPINAsync(pin);
} catch (error) {
  if (error.message.includes('invalid pin format')) {
    console.error('❌ PIN format is invalid');
  } else if (error.message.includes('pin blocked')) {
    console.error('❌ PIN is blocked, PUK required');
  } else if (error.message.includes('card locked')) {
    console.error('❌ Card is permanently locked');
  } else {
    console.error('❌ PIN verification error:', error.message);
  }
}
```

## Best Practices

1. **Card Detection**: Always check for card presence before operations
2. **PIN Security**: Never log or store PIN codes
3. **Error Handling**: Handle all possible card reader and card errors
4. **Validity Checking**: Always check certificate and document validity
5. **Session Management**: Implement proper authentication sessions
6. **Data Privacy**: Handle personal information according to privacy laws
7. **Certificate Export**: Provide secure certificate export functionality
8. **Connection Cleanup**: Always disconnect from card after operations
9. **User Feedback**: Provide clear feedback for card operations
10. **Compliance**: Follow national ID card standards and regulations
