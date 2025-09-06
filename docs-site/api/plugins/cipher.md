# Cipher Plugin API Reference

Cipher plugin ma'lumotlarni shifrlash va deshifrlash uchun mo'ljallangan. Bu
plugin turli shifrlash algoritmlari, key management va ma'lumotlar xavfsizligini
ta'minlash uchun ishlatiladi.

## Overview

Cipher plugin quyidagi funksiyalarni taqdim etadi:

- Simmetrik va assimmetrik shifrlash
- Ma'lumotlarni encrypt/decrypt qilish
- Key generation va management
- Bulk data encryption
- Stream cipher operations
- File encryption/decryption

## Import

```typescript
// ES6 import
import { cipherPlugin } from 'imzo-agnost';

// CommonJS
const { cipherPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.cipher;
```

## Types

```typescript
interface EncryptionParams {
  algorithm:
    | 'AES-128-CBC'
    | 'AES-192-CBC'
    | 'AES-256-CBC'
    | 'AES-128-GCM'
    | 'AES-192-GCM'
    | 'AES-256-GCM'
    | 'RSA-PKCS1'
    | 'RSA-OAEP'
    | 'RSA-PSS'
    | '3DES-CBC'
    | 'DES-CBC'
    | 'ChaCha20-Poly1305';
  mode?: 'ECB' | 'CBC' | 'CFB' | 'OFB' | 'GCM' | 'CTR';
  padding?: 'PKCS7' | 'PKCS5' | 'ISO7816' | 'X923' | 'None';
  keySize?: 128 | 192 | 256 | 512 | 1024 | 2048 | 3072 | 4096;
  iv?: string; // Initialization Vector (base64)
  key?: string; // Encryption key (base64)
  keyId?: string; // Key container ID
  associatedData?: string; // For AEAD algorithms (base64)
  tagLength?: number; // For GCM mode (96, 104, 112, 120, 128)
}

interface EncryptionResult {
  success: boolean;
  encryptedData?: string; // Base64 encoded
  iv?: string; // Used IV (base64)
  tag?: string; // Authentication tag for AEAD (base64)
  keyId?: string; // Used key ID
  algorithm?: string; // Used algorithm
  reason?: string;
}

interface DecryptionParams {
  algorithm: string;
  encryptedData: string; // Base64 encoded
  key?: string; // Decryption key (base64)
  keyId?: string; // Key container ID
  iv?: string; // Initialization Vector (base64)
  tag?: string; // Authentication tag for AEAD (base64)
  associatedData?: string; // For AEAD algorithms (base64)
  padding?: string;
  mode?: string;
}

interface DecryptionResult {
  success: boolean;
  decryptedData?: string; // Original data
  verified?: boolean; // For AEAD algorithms
  keyId?: string; // Used key ID
  algorithm?: string; // Used algorithm
  reason?: string;
}

interface KeyGenerationParams {
  algorithm: 'AES' | 'RSA' | '3DES' | 'DES' | 'ChaCha20';
  keySize: number;
  purpose?: 'encryption' | 'signing' | 'key-agreement';
  exportable?: boolean;
  usage?: string[]; // Key usage purposes
}

interface KeyInfo {
  keyId: string;
  algorithm: string;
  keySize: number;
  purpose: string;
  created: string;
  exportable: boolean;
  usage: string[];
  publicKey?: string; // For asymmetric keys
}

interface StreamCipherParams {
  algorithm: 'ChaCha20' | 'AES-CTR' | 'AES-CFB' | 'AES-OFB';
  keyId: string;
  iv?: string;
  blockSize?: number; // Stream block size
}
```

## Symmetric Encryption

### encryptSymmetricAsync()

Simmetrik algoritm bilan shifrlash.

```typescript
try {
  const data = 'Sensitive information to encrypt';

  // AES-256-CBC bilan shifrlash
  const aesResult = await cipherPlugin.encryptSymmetricAsync(
    {
      algorithm: 'AES-256-CBC',
      mode: 'CBC',
      padding: 'PKCS7',
      keySize: 256
    },
    data
  );

  if (aesResult.success) {
    console.log('✅ AES encryption successful');
    console.log('Encrypted data:', aesResult.encryptedData);
    console.log('IV used:', aesResult.iv);
    console.log('Key ID:', aesResult.keyId);
    console.log('Algorithm:', aesResult.algorithm);

    // Save encryption parameters for decryption
    const encryptionInfo = {
      encryptedData: aesResult.encryptedData,
      iv: aesResult.iv,
      keyId: aesResult.keyId,
      algorithm: aesResult.algorithm
    };

    console.log(
      '💾 Save this info for decryption:',
      JSON.stringify(encryptionInfo, null, 2)
    );
  } else {
    console.error('❌ AES encryption failed:', aesResult.reason);
  }
} catch (error) {
  console.error('❌ Symmetric encryption error:', error);
}
```

### encryptAESAsync()

AES shifrlash (enhanced method).

```typescript
try {
  const sensitiveData = 'Confidential business data';

  // AES-256-GCM with authentication
  const gcmResult = await cipherPlugin.encryptAESAsync({
    data: sensitiveData,
    algorithm: 'AES-256-GCM',
    keySize: 256,
    generateKey: true, // Auto generate key
    generateIV: true, // Auto generate IV
    associatedData: 'metadata', // Additional authenticated data
    tagLength: 128 // Authentication tag length
  });

  if (gcmResult.success) {
    console.log('✅ AES-GCM encryption successful');
    console.log('Encrypted data:', gcmResult.encryptedData);
    console.log('IV:', gcmResult.iv);
    console.log('Authentication tag:', gcmResult.tag);
    console.log('Key ID:', gcmResult.keyId);

    // Store complete encryption package
    const encryptionPackage = {
      algorithm: 'AES-256-GCM',
      encryptedData: gcmResult.encryptedData,
      iv: gcmResult.iv,
      tag: gcmResult.tag,
      keyId: gcmResult.keyId,
      associatedData: 'metadata',
      timestamp: new Date().toISOString()
    };

    console.log('📦 Complete encryption package:', encryptionPackage);

    return encryptionPackage;
  }
} catch (error) {
  console.error('❌ AES encryption error:', error);
}
```

### decryptSymmetricAsync()

Simmetrik deshifrlash.

```typescript
try {
  // Previously encrypted data
  const encryptionInfo = {
    encryptedData: 'base64_encrypted_data...',
    iv: 'base64_iv...',
    keyId: 'encryption_key_id',
    algorithm: 'AES-256-CBC'
  };

  const decryptResult = await cipherPlugin.decryptSymmetricAsync({
    algorithm: encryptionInfo.algorithm,
    encryptedData: encryptionInfo.encryptedData,
    keyId: encryptionInfo.keyId,
    iv: encryptionInfo.iv,
    mode: 'CBC',
    padding: 'PKCS7'
  });

  if (decryptResult.success) {
    console.log('✅ Decryption successful');
    console.log('Original data:', decryptResult.decryptedData);
    console.log('Key ID used:', decryptResult.keyId);
    console.log('Algorithm used:', decryptResult.algorithm);
  } else {
    console.error('❌ Decryption failed:', decryptResult.reason);
  }
} catch (error) {
  console.error('❌ Symmetric decryption error:', error);
}
```

### decryptAESAsync()

AES deshifrlash (enhanced method).

```typescript
try {
  // Previously encrypted with AES-GCM
  const encryptionPackage = {
    algorithm: 'AES-256-GCM',
    encryptedData: 'base64_encrypted_data...',
    iv: 'base64_iv...',
    tag: 'base64_auth_tag...',
    keyId: 'aes_key_id',
    associatedData: 'metadata'
  };

  const decryptResult = await cipherPlugin.decryptAESAsync({
    encryptedData: encryptionPackage.encryptedData,
    keyId: encryptionPackage.keyId,
    iv: encryptionPackage.iv,
    tag: encryptionPackage.tag,
    associatedData: encryptionPackage.associatedData,
    algorithm: encryptionPackage.algorithm,
    verifyAuthentication: true // Verify authentication tag
  });

  if (decryptResult.success) {
    console.log('✅ AES-GCM decryption successful');
    console.log('Original data:', decryptResult.decryptedData);
    console.log('Authentication verified:', decryptResult.verified);

    if (decryptResult.verified) {
      console.log('🔒 Data integrity confirmed');
    } else {
      console.log(
        '⚠️ Authentication verification failed - data may be tampered'
      );
    }
  } else {
    console.error('❌ AES-GCM decryption failed:', decryptResult.reason);
  }
} catch (error) {
  console.error('❌ AES decryption error:', error);
}
```

## Asymmetric Encryption

### encryptAsymmetricAsync()

Assimmetrik shifrlash (RSA).

```typescript
try {
  const data = 'Secret message for RSA encryption';

  // RSA-OAEP encryption
  const rsaResult = await cipherPlugin.encryptAsymmetricAsync(
    {
      algorithm: 'RSA-OAEP',
      keySize: 2048,
      keyId: 'rsa_public_key_id',
      padding: 'OAEP',
      hashFunction: 'SHA-256'
    },
    data
  );

  if (rsaResult.success) {
    console.log('✅ RSA encryption successful');
    console.log('Encrypted data:', rsaResult.encryptedData);
    console.log('Key ID used:', rsaResult.keyId);
    console.log('Algorithm:', rsaResult.algorithm);

    // Note: RSA can only encrypt limited data size
    const maxDataSize = 2048 / 8 - 42; // For OAEP padding
    console.log(`ℹ️ Max data size for RSA-2048-OAEP: ${maxDataSize} bytes`);
  } else {
    console.error('❌ RSA encryption failed:', rsaResult.reason);
  }
} catch (error) {
  console.error('❌ Asymmetric encryption error:', error);
}
```

### decryptAsymmetricAsync()

Assimmetrik deshifrlash (RSA).

```typescript
try {
  const encryptedData = 'base64_rsa_encrypted_data...';

  const rsaDecryptResult = await cipherPlugin.decryptAsymmetricAsync({
    algorithm: 'RSA-OAEP',
    encryptedData: encryptedData,
    keyId: 'rsa_private_key_id',
    padding: 'OAEP',
    hashFunction: 'SHA-256'
  });

  if (rsaDecryptResult.success) {
    console.log('✅ RSA decryption successful');
    console.log('Original data:', rsaDecryptResult.decryptedData);
    console.log('Key ID used:', rsaDecryptResult.keyId);
  } else {
    console.error('❌ RSA decryption failed:', rsaDecryptResult.reason);
  }
} catch (error) {
  console.error('❌ Asymmetric decryption error:', error);
}
```

## Key Management

### generateKeyAsync()

Shifrlash kaliti yaratish.

```typescript
try {
  // AES key generation
  const aesKey = await cipherPlugin.generateKeyAsync({
    algorithm: 'AES',
    keySize: 256,
    purpose: 'encryption',
    exportable: false,
    usage: ['encrypt', 'decrypt']
  });

  if (aesKey.success) {
    console.log('✅ AES key generated');
    console.log('Key ID:', aesKey.keyId);
    console.log('Algorithm:', aesKey.algorithm);
    console.log('Key size:', aesKey.keySize);
    console.log('Purpose:', aesKey.purpose);
    console.log('Exportable:', aesKey.exportable);
    console.log('Usage:', aesKey.usage.join(', '));
  }

  // RSA key pair generation
  const rsaKeyPair = await cipherPlugin.generateKeyAsync({
    algorithm: 'RSA',
    keySize: 2048,
    purpose: 'encryption',
    exportable: true,
    usage: ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  });

  if (rsaKeyPair.success) {
    console.log('✅ RSA key pair generated');
    console.log('Private key ID:', rsaKeyPair.privateKeyId);
    console.log('Public key ID:', rsaKeyPair.publicKeyId);
    console.log('Public key (Base64):', rsaKeyPair.publicKey);
    console.log('Key size:', rsaKeyPair.keySize);
  }
} catch (error) {
  console.error('❌ Key generation error:', error);
}
```

### getKeyInfoAsync()

Key haqida ma'lumot olish.

```typescript
try {
  const keyId = 'my_encryption_key';

  const keyInfo = await cipherPlugin.getKeyInfoAsync(keyId);

  if (keyInfo.success) {
    console.log('🔑 Key Information:');
    console.log('Key ID:', keyInfo.keyId);
    console.log('Algorithm:', keyInfo.algorithm);
    console.log('Key size:', keyInfo.keySize);
    console.log('Purpose:', keyInfo.purpose);
    console.log('Created:', new Date(keyInfo.created).toLocaleString());
    console.log('Exportable:', keyInfo.exportable ? '✅' : '❌');
    console.log('Usage:', keyInfo.usage.join(', '));

    if (keyInfo.publicKey) {
      console.log('Public key available:', '✅');
      console.log('Public key:', keyInfo.publicKey.substring(0, 50) + '...');
    }

    // Check key validity
    const now = new Date();
    const created = new Date(keyInfo.created);
    const ageInDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );

    console.log(`Key age: ${ageInDays} days`);

    if (ageInDays > 365) {
      console.log('⚠️ Key is older than 1 year, consider rotation');
    }
  }
} catch (error) {
  console.error('❌ Key info retrieval error:', error);
}
```

### listKeysAsync()

Barcha kalitlarni ro'yxatlash.

```typescript
try {
  const keyList = await cipherPlugin.listKeysAsync({
    algorithm: 'AES', // Filter by algorithm (optional)
    purpose: 'encryption', // Filter by purpose (optional)
    exportable: false // Filter by exportable flag (optional)
  });

  if (keyList.success) {
    console.log(`🗝️ Found ${keyList.keys.length} encryption keys:`);
    console.log('═══════════════════════════════════════');

    keyList.keys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.keyId}`);
      console.log(`   Algorithm: ${key.algorithm}`);
      console.log(`   Key size: ${key.keySize} bits`);
      console.log(`   Purpose: ${key.purpose}`);
      console.log(`   Created: ${new Date(key.created).toLocaleDateString()}`);
      console.log(`   Usage: ${key.usage.join(', ')}`);
      console.log(`   Exportable: ${key.exportable ? '✅' : '❌'}`);
      console.log('');
    });

    // Group by algorithm
    const groupedKeys = keyList.keys.reduce((groups, key) => {
      const algorithm = key.algorithm;
      if (!groups[algorithm]) {
        groups[algorithm] = [];
      }
      groups[algorithm].push(key);
      return groups;
    }, {});

    console.log('📊 Keys by algorithm:');
    Object.entries(groupedKeys).forEach(([algorithm, keys]) => {
      console.log(`${algorithm}: ${keys.length} keys`);
    });
  }
} catch (error) {
  console.error('❌ Key listing error:', error);
}
```

### deleteKeyAsync()

Kalitni o'chirish.

```typescript
try {
  const keyId = 'old_encryption_key';

  // Get key info before deletion
  const keyInfo = await cipherPlugin.getKeyInfoAsync(keyId);

  if (keyInfo.success) {
    console.log(`🗑️ Deleting key: ${keyId}`);
    console.log(`Algorithm: ${keyInfo.algorithm}`);
    console.log(`Key size: ${keyInfo.keySize} bits`);
    console.log(`Created: ${new Date(keyInfo.created).toLocaleString()}`);

    // Confirm deletion
    const confirmed = await confirmKeyDeletion(keyId);

    if (confirmed) {
      const deleteResult = await cipherPlugin.deleteKeyAsync(keyId);

      if (deleteResult.success) {
        console.log('✅ Key deleted successfully');
        console.log('Key ID:', deleteResult.deletedKeyId);
        console.log('Deletion time:', new Date().toLocaleString());
      } else {
        console.error('❌ Key deletion failed:', deleteResult.reason);
      }
    } else {
      console.log('🚫 Key deletion cancelled');
    }
  } else {
    console.error('❌ Key not found:', keyId);
  }
} catch (error) {
  console.error('❌ Key deletion error:', error);
}

async function confirmKeyDeletion(keyId: string): Promise<boolean> {
  // In real application, this would be a user confirmation dialog
  return new Promise(resolve => {
    console.log(`⚠️ Are you sure you want to delete key '${keyId}'?`);
    console.log('This action cannot be undone!');
    // Simulate user confirmation
    setTimeout(() => resolve(true), 1000);
  });
}
```

## Stream Cipher Operations

### createStreamCipherAsync()

Stream cipher yaratish.

```typescript
try {
  console.log('🌊 Creating stream cipher...');

  const streamCipher = await cipherPlugin.createStreamCipherAsync({
    algorithm: 'ChaCha20',
    keyId: 'stream_key_id',
    generateIV: true,
    blockSize: 64 // Stream block size in bytes
  });

  if (streamCipher.success) {
    console.log('✅ Stream cipher created');
    console.log('Cipher ID:', streamCipher.cipherId);
    console.log('Algorithm:', streamCipher.algorithm);
    console.log('Key ID:', streamCipher.keyId);
    console.log('IV:', streamCipher.iv);
    console.log('Block size:', streamCipher.blockSize);

    return streamCipher.cipherId;
  } else {
    console.error('❌ Stream cipher creation failed:', streamCipher.reason);
  }
} catch (error) {
  console.error('❌ Stream cipher creation error:', error);
}
```

### encryptStreamAsync()

Stream cipher bilan shifrlash.

```typescript
try {
  const cipherId = 'stream_cipher_id';
  const dataChunk = 'First chunk of data to encrypt';

  // Encrypt first chunk
  const chunk1Result = await cipherPlugin.encryptStreamAsync(
    cipherId,
    dataChunk
  );

  if (chunk1Result.success) {
    console.log('✅ First chunk encrypted');
    console.log('Encrypted chunk:', chunk1Result.encryptedChunk);
    console.log('Position:', chunk1Result.position);
  }

  // Encrypt second chunk
  const chunk2 = 'Second chunk of streaming data';
  const chunk2Result = await cipherPlugin.encryptStreamAsync(cipherId, chunk2);

  if (chunk2Result.success) {
    console.log('✅ Second chunk encrypted');
    console.log('Encrypted chunk:', chunk2Result.encryptedChunk);
    console.log('Position:', chunk2Result.position);
  }

  // Finalize stream
  const finalizeResult = await cipherPlugin.finalizeStreamAsync(cipherId);

  if (finalizeResult.success) {
    console.log('✅ Stream finalized');
    console.log('Total bytes processed:', finalizeResult.totalBytes);
    console.log('Final tag:', finalizeResult.finalTag);
  }
} catch (error) {
  console.error('❌ Stream encryption error:', error);
}
```

### decryptStreamAsync()

Stream deshifrlash.

```typescript
try {
  const cipherId = 'stream_cipher_id';
  const encryptedChunk1 = 'base64_encrypted_chunk1...';
  const encryptedChunk2 = 'base64_encrypted_chunk2...';

  // Decrypt first chunk
  const decrypt1Result = await cipherPlugin.decryptStreamAsync(
    cipherId,
    encryptedChunk1
  );

  if (decrypt1Result.success) {
    console.log('✅ First chunk decrypted');
    console.log('Decrypted chunk:', decrypt1Result.decryptedChunk);
  }

  // Decrypt second chunk
  const decrypt2Result = await cipherPlugin.decryptStreamAsync(
    cipherId,
    encryptedChunk2
  );

  if (decrypt2Result.success) {
    console.log('✅ Second chunk decrypted');
    console.log('Decrypted chunk:', decrypt2Result.decryptedChunk);
  }

  // Finalize decryption
  const finalizeResult = await cipherPlugin.finalizeStreamAsync(cipherId);

  if (finalizeResult.success) {
    console.log('✅ Stream decryption finalized');
    console.log('Total bytes processed:', finalizeResult.totalBytes);
    console.log('Verification successful:', finalizeResult.verified);
  }
} catch (error) {
  console.error('❌ Stream decryption error:', error);
}
```

## File Encryption

### encryptFileAsync()

Fayl shifrlash.

```typescript
try {
  const filePath = '/path/to/sensitive/document.pdf';
  const outputPath = '/path/to/encrypted/document.pdf.enc';

  console.log('📁 Encrypting file...');
  console.log('Source:', filePath);
  console.log('Output:', outputPath);

  const fileEncryption = await cipherPlugin.encryptFileAsync({
    inputPath: filePath,
    outputPath: outputPath,
    algorithm: 'AES-256-GCM',
    keyId: 'file_encryption_key',
    generateIV: true,
    overwrite: false, // Don't overwrite existing files
    preserveMetadata: true, // Keep original file metadata
    progress: (bytesProcessed, totalBytes) => {
      const percentage = ((bytesProcessed / totalBytes) * 100).toFixed(1);
      console.log(
        `Progress: ${percentage}% (${bytesProcessed}/${totalBytes} bytes)`
      );
    }
  });

  if (fileEncryption.success) {
    console.log('✅ File encryption completed');
    console.log('Input file:', fileEncryption.inputPath);
    console.log('Output file:', fileEncryption.outputPath);
    console.log('Algorithm used:', fileEncryption.algorithm);
    console.log('Key ID:', fileEncryption.keyId);
    console.log('IV:', fileEncryption.iv);
    console.log('Authentication tag:', fileEncryption.tag);
    console.log('File size (original):', fileEncryption.originalSize);
    console.log('File size (encrypted):', fileEncryption.encryptedSize);
    console.log('Compression ratio:', fileEncryption.compressionRatio || 'N/A');

    // Save encryption metadata
    const metadata = {
      originalFile: filePath,
      encryptedFile: outputPath,
      algorithm: fileEncryption.algorithm,
      keyId: fileEncryption.keyId,
      iv: fileEncryption.iv,
      tag: fileEncryption.tag,
      originalSize: fileEncryption.originalSize,
      encryptedSize: fileEncryption.encryptedSize,
      encryptionDate: new Date().toISOString(),
      checksum: fileEncryption.checksum
    };

    const metadataPath = outputPath + '.meta';
    await saveMetadata(metadataPath, metadata);

    console.log('💾 Encryption metadata saved to:', metadataPath);

    return {
      encryptedFile: outputPath,
      metadata: metadata
    };
  } else {
    console.error('❌ File encryption failed:', fileEncryption.reason);
  }
} catch (error) {
  console.error('❌ File encryption error:', error);
}
```

### decryptFileAsync()

Fayl deshifrlash.

```typescript
try {
  const encryptedFilePath = '/path/to/encrypted/document.pdf.enc';
  const outputPath = '/path/to/decrypted/document.pdf';
  const metadataPath = encryptedFilePath + '.meta';

  console.log('📁 Decrypting file...');

  // Load encryption metadata
  const metadata = await loadMetadata(metadataPath);

  if (!metadata) {
    throw new Error('Encryption metadata not found');
  }

  console.log('Metadata loaded:');
  console.log('Original file:', metadata.originalFile);
  console.log('Algorithm:', metadata.algorithm);
  console.log('Key ID:', metadata.keyId);
  console.log('Encrypted date:', metadata.encryptionDate);

  const fileDecryption = await cipherPlugin.decryptFileAsync({
    inputPath: encryptedFilePath,
    outputPath: outputPath,
    algorithm: metadata.algorithm,
    keyId: metadata.keyId,
    iv: metadata.iv,
    tag: metadata.tag,
    overwrite: false,
    verifyChecksum: true,
    expectedChecksum: metadata.checksum,
    progress: (bytesProcessed, totalBytes) => {
      const percentage = ((bytesProcessed / totalBytes) * 100).toFixed(1);
      console.log(
        `Decryption progress: ${percentage}% (${bytesProcessed}/${totalBytes} bytes)`
      );
    }
  });

  if (fileDecryption.success) {
    console.log('✅ File decryption completed');
    console.log('Input file:', fileDecryption.inputPath);
    console.log('Output file:', fileDecryption.outputPath);
    console.log('Algorithm used:', fileDecryption.algorithm);
    console.log('Verification passed:', fileDecryption.verified);
    console.log('File size (encrypted):', fileDecryption.encryptedSize);
    console.log('File size (decrypted):', fileDecryption.decryptedSize);
    console.log('Checksum verified:', fileDecryption.checksumVerified);

    // Verify file size matches original
    if (fileDecryption.decryptedSize === metadata.originalSize) {
      console.log('✅ File size verification passed');
    } else {
      console.log('⚠️ File size mismatch detected');
    }

    return {
      decryptedFile: outputPath,
      verified: fileDecryption.verified && fileDecryption.checksumVerified
    };
  } else {
    console.error('❌ File decryption failed:', fileDecryption.reason);
  }
} catch (error) {
  console.error('❌ File decryption error:', error);
}

async function saveMetadata(path: string, metadata: any): Promise<void> {
  // Implementation depends on environment
  console.log(`💾 Saving metadata to ${path}`);
}

async function loadMetadata(path: string): Promise<any> {
  // Implementation depends on environment
  console.log(`📂 Loading metadata from ${path}`);
  return {}; // Mock metadata
}
```

## Complete Examples

### Complete File Encryption Workflow

```typescript
async function encryptSensitiveFiles(files: string[]) {
  try {
    console.log('🔐 Starting batch file encryption...');
    console.log(`Files to encrypt: ${files.length}`);

    // 1. Generate encryption key
    console.log('1. Generating encryption key...');

    const keyGenResult = await cipherPlugin.generateKeyAsync({
      algorithm: 'AES',
      keySize: 256,
      purpose: 'encryption',
      exportable: false,
      usage: ['encrypt', 'decrypt']
    });

    if (!keyGenResult.success) {
      throw new Error(`Key generation failed: ${keyGenResult.reason}`);
    }

    const encryptionKeyId = keyGenResult.keyId;
    console.log('✅ Encryption key generated:', encryptionKeyId);

    // 2. Create encrypted directory
    const encryptedDir = './encrypted_files';
    await createDirectory(encryptedDir);

    const results = [];
    const errors = [];

    // 3. Encrypt each file
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i];
      const fileName = getFileName(filePath);
      const encryptedPath = `${encryptedDir}/${fileName}.enc`;

      try {
        console.log(`\n${i + 1}/${files.length}. Encrypting: ${fileName}`);

        const encryptResult = await cipherPlugin.encryptFileAsync({
          inputPath: filePath,
          outputPath: encryptedPath,
          algorithm: 'AES-256-GCM',
          keyId: encryptionKeyId,
          generateIV: true,
          preserveMetadata: true,
          progress: (processed, total) => {
            const pct = ((processed / total) * 100).toFixed(1);
            if (processed % 1024 === 0 || processed === total) {
              // Log every KB or at end
              console.log(`  Progress: ${pct}%`);
            }
          }
        });

        if (encryptResult.success) {
          // Save metadata
          const metadata = {
            originalFile: filePath,
            fileName: fileName,
            encryptedFile: encryptedPath,
            algorithm: encryptResult.algorithm,
            keyId: encryptResult.keyId,
            iv: encryptResult.iv,
            tag: encryptResult.tag,
            originalSize: encryptResult.originalSize,
            encryptedSize: encryptResult.encryptedSize,
            checksum: encryptResult.checksum,
            encryptionDate: new Date().toISOString()
          };

          const metadataPath = encryptedPath + '.meta';
          await saveMetadata(metadataPath, metadata);

          results.push({
            originalFile: filePath,
            encryptedFile: encryptedPath,
            metadataFile: metadataPath,
            originalSize: encryptResult.originalSize,
            encryptedSize: encryptResult.encryptedSize,
            compressionRatio: encryptResult.compressionRatio
          });

          console.log(
            `  ✅ Encrypted: ${fileName} (${formatBytes(encryptResult.originalSize)} → ${formatBytes(encryptResult.encryptedSize)})`
          );
        } else {
          throw new Error(encryptResult.reason);
        }
      } catch (error) {
        errors.push({
          file: filePath,
          error: error.message
        });

        console.log(`  ❌ Failed: ${fileName} - ${error.message}`);
      }
    }

    // 4. Create batch metadata
    const batchMetadata = {
      batchId: `batch_${Date.now()}`,
      encryptionDate: new Date().toISOString(),
      keyId: encryptionKeyId,
      algorithm: 'AES-256-GCM',
      totalFiles: files.length,
      successfulFiles: results.length,
      failedFiles: errors.length,
      totalOriginalSize: results.reduce((sum, r) => sum + r.originalSize, 0),
      totalEncryptedSize: results.reduce((sum, r) => sum + r.encryptedSize, 0),
      files: results,
      errors: errors
    };

    const batchMetadataPath = `${encryptedDir}/batch_metadata.json`;
    await saveMetadata(batchMetadataPath, batchMetadata);

    // 5. Generate summary report
    console.log('\n📊 Batch Encryption Summary:');
    console.log('═══════════════════════════════════');
    console.log(`Total files: ${files.length}`);
    console.log(`Successfully encrypted: ${results.length}`);
    console.log(`Failed: ${errors.length}`);
    console.log(
      `Success rate: ${((results.length / files.length) * 100).toFixed(1)}%`
    );
    console.log(
      `Original size: ${formatBytes(batchMetadata.totalOriginalSize)}`
    );
    console.log(
      `Encrypted size: ${formatBytes(batchMetadata.totalEncryptedSize)}`
    );
    console.log(
      `Overhead: ${formatBytes(batchMetadata.totalEncryptedSize - batchMetadata.totalOriginalSize)}`
    );
    console.log(`Key ID: ${encryptionKeyId}`);
    console.log(`Encrypted directory: ${encryptedDir}`);

    if (errors.length > 0) {
      console.log('\n❌ Failed files:');
      errors.forEach(error => {
        console.log(`  - ${error.file}: ${error.error}`);
      });
    }

    console.log('\n🎉 Batch file encryption completed!');

    return {
      batchId: batchMetadata.batchId,
      keyId: encryptionKeyId,
      encryptedDirectory: encryptedDir,
      results: results,
      errors: errors,
      summary: {
        totalFiles: files.length,
        successful: results.length,
        failed: errors.length,
        successRate: (results.length / files.length) * 100,
        totalOriginalSize: batchMetadata.totalOriginalSize,
        totalEncryptedSize: batchMetadata.totalEncryptedSize
      }
    };
  } catch (error) {
    console.error('❌ Batch file encryption failed:', error);
    throw error;
  }
}

// Helper functions
function getFileName(filePath: string): string {
  return filePath.split('/').pop() || 'unknown';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function createDirectory(path: string): Promise<void> {
  console.log(`📁 Creating directory: ${path}`);
  // Implementation depends on environment
}
```

### Bulk Data Encryption for Database

```typescript
async function encryptDatabaseRecords(records: any[]) {
  try {
    console.log('🏗️ Starting bulk database encryption...');
    console.log(`Records to encrypt: ${records.length}`);

    // 1. Generate dedicated key for this batch
    const keyResult = await cipherPlugin.generateKeyAsync({
      algorithm: 'AES',
      keySize: 256,
      purpose: 'encryption',
      exportable: false,
      usage: ['encrypt', 'decrypt']
    });

    if (!keyResult.success) {
      throw new Error('Failed to generate encryption key');
    }

    const batchKeyId = keyResult.keyId;
    console.log('✅ Batch encryption key generated:', batchKeyId);

    // 2. Define fields to encrypt
    const sensitiveFields = ['ssn', 'creditCard', 'email', 'phone', 'address'];

    const encryptedRecords = [];
    const errors = [];
    let totalFieldsEncrypted = 0;

    // 3. Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      try {
        console.log(`Processing record ${i + 1}/${records.length}...`);

        const encryptedRecord = { ...record };
        const encryptionMap = {};

        // Encrypt sensitive fields
        for (const field of sensitiveFields) {
          if (record[field] && record[field].trim() !== '') {
            const fieldValue = record[field].toString();

            const encryptResult = await cipherPlugin.encryptSymmetricAsync(
              {
                algorithm: 'AES-256-GCM',
                keyId: batchKeyId,
                mode: 'GCM',
                generateIV: true
              },
              fieldValue
            );

            if (encryptResult.success) {
              encryptedRecord[field] = encryptResult.encryptedData;

              encryptionMap[field] = {
                iv: encryptResult.iv,
                tag: encryptResult.tag,
                algorithm: encryptResult.algorithm,
                originalLength: fieldValue.length
              };

              totalFieldsEncrypted++;
            } else {
              console.log(
                `  ⚠️ Failed to encrypt field '${field}': ${encryptResult.reason}`
              );
            }
          }
        }

        // Add encryption metadata
        encryptedRecord._encryption = {
          keyId: batchKeyId,
          encryptedFields: Object.keys(encryptionMap),
          fieldMetadata: encryptionMap,
          encryptionDate: new Date().toISOString(),
          version: '1.0'
        };

        encryptedRecords.push(encryptedRecord);

        if ((i + 1) % 100 === 0) {
          console.log(`  Processed ${i + 1} records...`);
        }
      } catch (error) {
        errors.push({
          recordIndex: i,
          recordId: record.id || `record_${i}`,
          error: error.message
        });

        console.log(`  ❌ Failed to process record ${i + 1}: ${error.message}`);
      }
    }

    // 4. Create batch summary
    const batchSummary = {
      batchId: `db_batch_${Date.now()}`,
      processDate: new Date().toISOString(),
      keyId: batchKeyId,
      algorithm: 'AES-256-GCM',
      totalRecords: records.length,
      successfulRecords: encryptedRecords.length,
      failedRecords: errors.length,
      totalFieldsEncrypted: totalFieldsEncrypted,
      sensitiveFields: sensitiveFields,
      version: '1.0'
    };

    console.log('\n📊 Database Encryption Summary:');
    console.log('═══════════════════════════════════');
    console.log(`Batch ID: ${batchSummary.batchId}`);
    console.log(`Total records: ${records.length}`);
    console.log(`Successfully processed: ${encryptedRecords.length}`);
    console.log(`Failed: ${errors.length}`);
    console.log(`Total fields encrypted: ${totalFieldsEncrypted}`);
    console.log(
      `Success rate: ${((encryptedRecords.length / records.length) * 100).toFixed(1)}%`
    );
    console.log(`Encryption key: ${batchKeyId}`);

    if (errors.length > 0) {
      console.log('\n❌ Failed records:');
      errors.forEach(error => {
        console.log(
          `  - Record ${error.recordIndex} (${error.recordId}): ${error.error}`
        );
      });
    }

    console.log('\n🎉 Database encryption completed!');

    return {
      batchSummary: batchSummary,
      encryptedRecords: encryptedRecords,
      errors: errors,
      keyId: batchKeyId
    };
  } catch (error) {
    console.error('❌ Bulk database encryption failed:', error);
    throw error;
  }
}

// Usage example
async function exampleDatabaseEncryption() {
  const sampleRecords = [
    {
      id: 1,
      name: 'John Doe',
      ssn: '123-45-6789',
      creditCard: '4111-1111-1111-1111',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      address: '123 Main St, Anytown, USA',
      publicInfo: 'This field is not encrypted'
    },
    {
      id: 2,
      name: 'Jane Smith',
      ssn: '987-65-4321',
      creditCard: '5555-5555-5555-4444',
      email: 'jane.smith@example.com',
      phone: '+1-555-987-6543',
      address: '456 Oak Ave, Another City, USA',
      publicInfo: 'This field remains in plain text'
    }
  ];

  const result = await encryptDatabaseRecords(sampleRecords);

  console.log('\n📋 Sample encrypted record:');
  console.log(JSON.stringify(result.encryptedRecords[0], null, 2));
}
```

## Callback API (Legacy)

### encryptSymmetric() - Callback Version

```typescript
cipherPlugin.encryptSymmetric(
  {
    algorithm: 'AES-256-CBC',
    mode: 'CBC',
    padding: 'PKCS7',
    keySize: 256
  },
  data,
  (event, response) => {
    if (response.success) {
      console.log('Callback: Encryption successful');
      console.log('Encrypted data:', response.encryptedData);
      console.log('IV:', response.iv);
    } else {
      console.error('Callback: Encryption failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Encryption error:', error);
  }
);
```

### decryptSymmetric() - Callback Version

```typescript
cipherPlugin.decryptSymmetric(
  {
    algorithm: 'AES-256-CBC',
    encryptedData: encryptedData,
    keyId: keyId,
    iv: iv,
    mode: 'CBC',
    padding: 'PKCS7'
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Decryption successful');
      console.log('Decrypted data:', response.decryptedData);
    } else {
      console.error('Callback: Decryption failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Decryption error:', error);
  }
);
```

## Error Handling

### Encryption Errors

```typescript
try {
  const result = await cipherPlugin.encryptSymmetricAsync(params, data);
} catch (error) {
  if (error.message.includes('key not found')) {
    console.error('❌ Encryption key not found');
  } else if (error.message.includes('invalid algorithm')) {
    console.error('❌ Unsupported encryption algorithm');
  } else if (error.message.includes('data too large')) {
    console.error('❌ Data size exceeds algorithm limits');
  } else if (error.message.includes('invalid padding')) {
    console.error('❌ Invalid padding mode for algorithm');
  } else {
    console.error('❌ Encryption error:', error.message);
  }
}
```

### Key Management Errors

```typescript
try {
  const result = await cipherPlugin.generateKeyAsync(params);
} catch (error) {
  if (error.message.includes('key size not supported')) {
    console.error('❌ Key size not supported for algorithm');
  } else if (error.message.includes('algorithm not available')) {
    console.error('❌ Encryption algorithm not available');
  } else if (error.message.includes('storage full')) {
    console.error('❌ Key storage is full');
  } else {
    console.error('❌ Key generation error:', error.message);
  }
}
```

## Best Practices

1.  **Algorithm Selection**: Choose appropriate algorithms for your security
    requirements
2.  **Key Management**: Use secure key generation and storage practices
3.  **IV/Nonce**: Always use unique IVs/nonces for each encryption operation
4.  **AEAD**: Prefer authenticated encryption modes (GCM, ChaCha20-Poly1305)
5.  **Key Rotation**: Implement regular key rotation policies
6.  **Secure Deletion**: Properly delete keys and sensitive data when no longer
    needed
7.  **Performance**: Consider algorithm performance for bulk operations
8.  **Compliance**: Ensure compliance with relevant security standards
9.  **Error Handling**: Implement comprehensive error handling
10. **Audit Trail**: Maintain logs of encryption/decryption operations
