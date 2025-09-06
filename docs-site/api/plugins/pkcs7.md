# PKCS7 Plugin API Reference

PKCS#7/CMS plugin raqamli imzo yaratish, tekshirish va PKCS#7 format bilan
ishlash uchun mo'ljallangan.

## Overview

PKCS7 plugin quyidagi asosiy funksiyalarni taqdim etadi:

- PKCS#7/CMS imzo yaratish (attached/detached)
- Imzolarni tekshirish va validatsiya
- PKCS#7 ma'lumotlarini o'qish
- Timestamp token qo'shish
- Enhanced API with auto base64 encoding

## Import

```typescript
// ES6 import
import { pkcs7Plugin } from 'imzo-agnost';

// CommonJS
const { pkcs7Plugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.pkcs7;
```

## Types

```typescript
interface Pkcs7Response {
  success: true;
  pkcs7_64: string;
}

interface Pkcs7InfoResponse {
  success: boolean;
  signatures: {
    signer: string;
    timestamp?: string;
    valid: boolean;
  }[];
}

interface Pkcs7CreateOptions {
  detached?: boolean | 'yes' | 'no' | '';
  autoBase64?: boolean; // Auto-encode string data to base64
}

interface TimestampTokenResponse {
  success: true;
  timestamp_token_64: string;
}
```

## Enhanced API (Recommended)

Avtomatik base64 encoding va smart defaults bilan.

### createPkcs7Async() - Enhanced

Oddiy string data bilan PKCS#7 imzo yaratish (tavsiya etiladi).

**Basic Usage:**

```typescript
try {
  // Oddiy string - avtomatik base64 encoding
  const result = await pkcs7Plugin.createPkcs7Async(
    'Hello, E-IMZO!', // Plain string
    keyId
    // Default: attached signature, auto base64 encoding
  );

  console.log('PKCS7 signature:', result.pkcs7_64);
} catch (error) {
  console.error('Signing failed:', error);
}
```

**Detached Signature:**

```typescript
try {
  const documentContent = 'Important legal document content...';

  const result = await pkcs7Plugin.createPkcs7Async(documentContent, keyId, {
    detached: true, // Boolean value (yangi usul)
    autoBase64: true // Avtomatik encoding (default)
  });

  console.log('Detached signature:', result.pkcs7_64);

  // Original data va signature alohida saqlanadi
  // signature faqat imzo ma'lumotlarini o'z ichiga oladi
} catch (error) {
  console.error('Detached signing failed:', error);
}
```

**JSON Data Signing:**

```typescript
try {
  const jsonData = JSON.stringify({
    orderId: '12345',
    amount: 1000000,
    currency: 'UZS',
    timestamp: new Date().toISOString()
  });

  const result = await pkcs7Plugin.createPkcs7Async(
    jsonData,
    keyId,
    { detached: true } // JSON uchun detached signature tavsiya etiladi
  );

  console.log('JSON signature:', result.pkcs7_64);
} catch (error) {
  console.error('JSON signing failed:', error);
}
```

**File Content Signing:**

```typescript
try {
  // File content (FileReader, fetch, etc. dan)
  const fileContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <document>
      <title>Contract Agreement</title>
      <content>This is the contract content...</content>
    </document>
  `;

  const result = await pkcs7Plugin.createPkcs7Async(
    fileContent,
    keyId,
    { detached: false } // Attached signature - file va imzo birgalikda
  );

  console.log('File signature:', result.pkcs7_64);
  console.log('Signature size:', result.pkcs7_64.length, 'characters');
} catch (error) {
  console.error('File signing failed:', error);
}
```

**Already Base64 Data:**

```typescript
try {
  const base64Data = btoa('Some pre-encoded data');

  const result = await pkcs7Plugin.createPkcs7Async(base64Data, keyId, {
    detached: false,
    autoBase64: false // Base64 encoding o'chirish
  });

  console.log('Pre-encoded data signature:', result.pkcs7_64);
} catch (error) {
  console.error('Signing failed:', error);
}
```

**UTF-8 Support:**

```typescript
try {
  // Cyrillic, Arabic, Chinese characters
  const unicodeText = 'Ўзбекистон Республикаси рақамли имзо тизими';

  const result = await pkcs7Plugin.createPkcs7Async(
    unicodeText,
    keyId
    // UTF-8 encoding avtomatik handle qilinadi
  );

  console.log('Unicode text signed:', result.pkcs7_64);
} catch (error) {
  console.error('Unicode signing failed:', error);
}
```

### Verification with Enhanced API

#### verifyPkcs7DetachedAsync() - Enhanced

**Auto Base64 Encoding:**

```typescript
try {
  const originalData = 'Important document content';
  const signature = 'MIIGxQYJKoZIhvcNAQcCoIIGtjCCBrI...';

  const result = await pkcs7Plugin.verifyPkcs7DetachedAsync(
    originalData, // Plain text - avtomatik base64 ga aylanadi
    signature,
    'truststore_id',
    '', // requesterId (optional)
    true // autoBase64 = true (default)
  );

  console.log('Signature valid:', result.valid);
} catch (error) {
  console.error('Verification failed:', error);
}
```

**Manual Base64 (if needed):**

```typescript
try {
  const base64Data = btoa('Document content');

  const result = await pkcs7Plugin.verifyPkcs7DetachedAsync(
    base64Data,
    signature,
    'truststore_id',
    '',
    false // autoBase64 = false
  );

  console.log('Manual base64 verification:', result.valid);
} catch (error) {
  console.error('Verification failed:', error);
}
```

#### getPkcs7DetachedInfoAsync() - Enhanced

**Signature Info with Auto Encoding:**

```typescript
try {
  const originalData = 'Document for analysis';
  const pkcs7Data = 'MIIGxQYJKoZIhvcNAQcCoIIGtjCCBrI...';

  const info = await pkcs7Plugin.getPkcs7DetachedInfoAsync(
    originalData, // Plain text - avtomatik base64 ga aylanadi
    pkcs7Data,
    'truststore_id',
    true // autoBase64 = true (default)
  );

  console.log('PKCS7 Info:');
  console.log('Success:', info.success);
  console.log('Signatures count:', info.signatures.length);

  info.signatures.forEach((sig, index) => {
    console.log(`Signature ${index + 1}:`);
    console.log(`  Signer: ${sig.signer}`);
    console.log(`  Valid: ${sig.valid}`);
    console.log(`  Timestamp: ${sig.timestamp || 'No timestamp'}`);
  });
} catch (error) {
  console.error('Info retrieval failed:', error);
}
```

## Legacy API (Backward Compatibility)

Eski API format - manual base64 encoding bilan.

### createPkcs7LegacyAsync()

**Manual Base64 Encoding:**

```typescript
try {
  // Manual base64 encoding (eski usul)
  const data = btoa('Hello, E-IMZO!');

  const result = await pkcs7Plugin.createPkcs7LegacyAsync(
    data,
    keyId,
    'no' // String parameter: 'yes'/'no'/''
  );

  console.log('Legacy PKCS7:', result.pkcs7_64);
} catch (error) {
  console.error('Legacy signing failed:', error);
}
```

### createPkcs7() - Callback API

**Original Callback Method:**

```typescript
pkcs7Plugin.createPkcs7(
  btoa('Data to sign'), // Manual base64
  keyId,
  'no', // detached parameter
  (event, response) => {
    if (response.success && response.data) {
      console.log('Callback PKCS7:', response.data.pkcs7_64);
    } else {
      console.error('Callback error:', response.reason);
    }
  },
  error => {
    console.error('Callback failure:', error);
  }
);
```

### createPkcs7Enhanced() - Enhanced Callback

**Enhanced Callback with Auto Encoding:**

```typescript
pkcs7Plugin.createPkcs7Enhanced(
  'Plain text data', // No manual base64 needed
  keyId,
  {
    detached: false, // Boolean option
    autoBase64: true // Auto encoding
  },
  (event, response) => {
    if (response.success && response.data) {
      console.log('Enhanced callback PKCS7:', response.data.pkcs7_64);
    }
  },
  error => {
    console.error('Enhanced callback error:', error);
  }
);
```

## Information and Verification Methods

### getPkcs7AttachedInfoAsync()

Attached PKCS#7 ma'lumotlarini olish.

```typescript
try {
  const pkcs7Data = 'MIIGxQYJKoZIhvcNAQcCoIIGtjCCBrI...';

  const info = await pkcs7Plugin.getPkcs7AttachedInfoAsync(
    pkcs7Data,
    'truststore_id' // optional
  );

  console.log('Attached PKCS7 Info:');
  console.log('Signatures:', info.signatures);

  info.signatures.forEach(sig => {
    console.log(`Signer: ${sig.signer}, Valid: ${sig.valid}`);
  });
} catch (error) {
  console.error('Info error:', error);
}
```

### verifyPkcs7AttachedAsync()

Attached PKCS#7 imzoni tekshirish.

```typescript
try {
  const pkcs7Data = 'MIIGxQYJKoZIhvcNAQcCoIIGtjCCBrI...';

  const result = await pkcs7Plugin.verifyPkcs7AttachedAsync(
    pkcs7Data,
    'truststore_id',
    'requester_id' // optional
  );

  console.log('Attached signature valid:', result.valid);
} catch (error) {
  console.error('Attached verification failed:', error);
}
```

## Advanced Operations

### attachTimestampTokenPkcs7Async()

PKCS#7 ga timestamp token qo'shish.

```typescript
try {
  const pkcs7Data = 'MIIGxQYJKoZIhvcNAQcCoIIGtjCCBrI...';
  const signerSerial = '123456789';
  const timestampToken = 'MIITimestampToken...';

  const result = await pkcs7Plugin.attachTimestampTokenPkcs7Async(
    pkcs7Data,
    signerSerial,
    timestampToken
  );

  console.log('Timestamp attached:', result.pkcs7_64);
} catch (error) {
  console.error('Timestamp attachment failed:', error);
}
```

## Complete Examples

### Document Signing Workflow

```typescript
async function signDocument(documentContent: string, keyId: string) {
  try {
    console.log('Starting document signing...');

    // 1. Create detached signature for document
    const signatureResult = await pkcs7Plugin.createPkcs7Async(
      documentContent,
      keyId,
      {
        detached: true, // Detached - document va signature alohida
        autoBase64: true // Auto encoding
      }
    );

    console.log('✅ Document signed successfully');
    console.log('Signature length:', signatureResult.pkcs7_64.length);

    // 2. Verify signature immediately
    const verifyResult = await pkcs7Plugin.verifyPkcs7DetachedAsync(
      documentContent, // Original document
      signatureResult.pkcs7_64,
      'default_truststore'
    );

    console.log('✅ Signature verification:', verifyResult.valid);

    // 3. Get detailed signature info
    const sigInfo = await pkcs7Plugin.getPkcs7DetachedInfoAsync(
      documentContent,
      signatureResult.pkcs7_64,
      'default_truststore'
    );

    console.log('📋 Signature details:');
    sigInfo.signatures.forEach((sig, i) => {
      console.log(`  Signer ${i + 1}: ${sig.signer}`);
      console.log(`  Valid: ${sig.valid}`);
      console.log(`  Timestamp: ${sig.timestamp || 'None'}`);
    });

    return {
      document: documentContent,
      signature: signatureResult.pkcs7_64,
      verified: verifyResult.valid,
      signers: sigInfo.signatures
    };
  } catch (error) {
    console.error('❌ Document signing failed:', error);
    throw error;
  }
}
```

### Form Data Signing

```typescript
async function signFormData(formElement: HTMLFormElement, keyId: string) {
  try {
    // Convert form to data object
    const formData = new FormData(formElement);
    const dataObject: Record<string, unknown> = {};

    formData.forEach((value, key) => {
      dataObject[key] = value;
    });

    const dataString = JSON.stringify(dataObject);
    console.log('Form data to sign:', dataString);

    // Create detached signature
    const result = await pkcs7Plugin.createPkcs7Async(dataString, keyId, {
      detached: true
    });

    // Add signature to form as hidden input
    const signatureInput = document.createElement('input');
    signatureInput.type = 'hidden';
    signatureInput.name = 'digital_signature';
    signatureInput.value = result.pkcs7_64;
    formElement.appendChild(signatureInput);

    console.log('✅ Form data signed and signature attached');

    return {
      formData: dataString,
      signature: result.pkcs7_64
    };
  } catch (error) {
    console.error('❌ Form signing failed:', error);
    throw error;
  }
}
```

### File Upload with Signature

```typescript
async function signUploadedFile(file: File, keyId: string) {
  try {
    console.log(`Signing file: ${file.name} (${file.size} bytes)`);

    // Read file content
    const fileContent = await file.text();

    // Create attached signature (file + signature in one)
    const result = await pkcs7Plugin.createPkcs7Async(
      fileContent,
      keyId,
      { detached: false } // Attached - everything in one package
    );

    console.log('✅ File signed successfully');
    console.log('Signed data size:', result.pkcs7_64.length);

    // Create downloadable blob
    const signedBlob = new Blob([result.pkcs7_64], {
      type: 'application/pkcs7-mime'
    });

    return {
      originalFile: file,
      signedData: result.pkcs7_64,
      signedBlob: signedBlob,
      downloadName: file.name + '.p7s'
    };
  } catch (error) {
    console.error('❌ File signing failed:', error);
    throw error;
  }
}
```

### Batch Document Processing

```typescript
async function batchSignDocuments(documents: string[], keyId: string) {
  const results = [];

  console.log(`Batch signing ${documents.length} documents...`);

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];

    try {
      console.log(`Signing document ${i + 1}/${documents.length}...`);

      const result = await pkcs7Plugin.createPkcs7Async(doc, keyId, {
        detached: true
      });

      // Verify immediately
      const verification = await pkcs7Plugin.verifyPkcs7DetachedAsync(
        doc,
        result.pkcs7_64,
        'default_truststore'
      );

      results.push({
        index: i,
        document: doc,
        signature: result.pkcs7_64,
        verified: verification.valid,
        success: true
      });

      console.log(`✅ Document ${i + 1} signed and verified`);
    } catch (error) {
      console.error(`❌ Document ${i + 1} failed:`, error);

      results.push({
        index: i,
        document: doc,
        signature: null,
        verified: false,
        success: false,
        error: error.message
      });
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(
    `📊 Batch complete: ${successful}/${documents.length} successful`
  );

  return results;
}
```

## API Comparison

### Old vs New API

```typescript
// ❌ OLD WAY (Manual & Complex)
const data = btoa('Hello, E-IMZO!');
const result = await pkcs7Plugin.createPkcs7LegacyAsync(data, keyId, 'no');

// ✅ NEW WAY (Auto & Simple)
const result = await pkcs7Plugin.createPkcs7Async('Hello, E-IMZO!', keyId);

// ❌ OLD DETACHED
const data2 = btoa('Document');
const detached = await pkcs7Plugin.createPkcs7LegacyAsync(data2, keyId, 'yes');

// ✅ NEW DETACHED
const detached = await pkcs7Plugin.createPkcs7Async('Document', keyId, {
  detached: true
});
```

### Benefits of Enhanced API

1. **No Manual Base64**: Avtomatik encoding
2. **Smart Defaults**: Attached signature by default
3. **Boolean Options**: `true/false` instead of `'yes'/'no'`
4. **UTF-8 Support**: Unicode characters handle qilinadi
5. **Auto-detection**: Base64 data ni avtomatik aniqlash
6. **Backward Compatibility**: Eski API ishlaydi
7. **Type Safety**: Better TypeScript support

## Migration Guide

### Step-by-step Migration

**1. Replace manual base64:**

```typescript
// Before
const data = btoa('text');
const result = await pkcs7Plugin.createPkcs7LegacyAsync(data, keyId, 'no');

// After
const result = await pkcs7Plugin.createPkcs7Async('text', keyId);
```

**2. Use boolean options:**

```typescript
// Before
const detached = await pkcs7Plugin.createPkcs7LegacyAsync(data, keyId, 'yes');

// After
const detached = await pkcs7Plugin.createPkcs7Async('text', keyId, {
  detached: true
});
```

**3. Update verification calls:**

```typescript
// Before
const originalData = btoa('text');
const valid = await pkcs7Plugin.verifyPkcs7DetachedLegacyAsync(
  originalData,
  sig,
  trust
);

// After
const valid = await pkcs7Plugin.verifyPkcs7DetachedAsync('text', sig, trust);
```

## Error Handling

### Common Error Scenarios

```typescript
try {
  const result = await pkcs7Plugin.createPkcs7Async(data, keyId);
} catch (error) {
  if (error.message.includes('key not found')) {
    console.error('❌ Key not loaded or expired');
  } else if (error.message.includes('invalid data')) {
    console.error('❌ Data format invalid');
  } else if (error.message.includes('password')) {
    console.error('❌ Key password required');
  } else {
    console.error('❌ Unknown signing error:', error.message);
  }
}
```

### Verification Error Handling

```typescript
try {
  const result = await pkcs7Plugin.verifyPkcs7DetachedAsync(
    data,
    signature,
    truststore
  );

  if (!result.valid) {
    console.warn('⚠️ Signature is invalid or cannot be verified');
  }
} catch (error) {
  if (error.message.includes('truststore')) {
    console.error('❌ Truststore not found or invalid');
  } else if (error.message.includes('format')) {
    console.error('❌ Invalid PKCS7 format');
  } else {
    console.error('❌ Verification failed:', error.message);
  }
}
```

## Best Practices

1. **Use Enhanced API**: Yangi `createPkcs7Async()` method dan foydalaning
2. **Detached for Documents**: Hujjatlar uchun detached signature
3. **Attached for Files**: Fayllar uchun attached signature
4. **Always Verify**: Imzo yaratgandan keyin darhol tekshiring
5. **Error Handling**: Specific error handling implement qiling
6. **UTF-8 Safe**: Unicode content uchun auto encoding ishlatung
7. **Performance**: Katta fayllar uchun chunked processing
8. **Security**: Truststore va certificate validation
