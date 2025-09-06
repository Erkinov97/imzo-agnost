/**
 * E-IMZO PKCS7 Enhanced Examples
 * Simplified API with auto base64 encoding and smart defaults
 */

import { pfxPlugin } from './plugins/pfx.js';
import { pkcs7Plugin } from './plugins/pkcs7.js';

// ===============================================
// 1. SIMPLIFIED PKCS7 CREATION (RECOMMENDED)
// ===============================================

/**
 * Create PKCS7 with string data (auto base64 encoding)
 */
async function createPkcs7Simple() {
  try {
    // Load key first
    const keyResult = await pfxPlugin.loadKeyAsync(
      'C:',
      '/keys/',
      'my-key.pfx',
      'user@example.com'
    );

    // Create PKCS7 with plain string (auto base64 + attached by default)
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(
      'Hello, E-IMZO!', // Plain string - avtomatik base64 ga aylanadi
      keyResult.keyId
      // Default options: { detached: false, autoBase64: true }
    );

    console.log('✅ PKCS7 created:', pkcs7Result.pkcs7_64);
    return pkcs7Result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Create detached PKCS7 signature
 */
async function createDetachedPkcs7() {
  try {
    const keyResult = await pfxPlugin.loadKeyAsync(
      'C:',
      '/keys/',
      'my-key.pfx',
      'user@example.com'
    );

    // Detached signature
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(
      'Important document content',
      keyResult.keyId,
      {
        detached: true, // Detached signature
        autoBase64: true // Auto encode
      }
    );

    console.log('✅ Detached PKCS7 created:', pkcs7Result.pkcs7_64);
    return pkcs7Result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Work with already base64 encoded data
 */
async function createPkcs7WithBase64Data() {
  try {
    const keyResult = await pfxPlugin.loadKeyAsync(
      'C:',
      '/keys/',
      'my-key.pfx',
      'user@example.com'
    );

    const base64Data = btoa('Some data');

    // Disable auto encoding for already encoded data
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(base64Data, keyResult.keyId, {
      detached: false,
      autoBase64: false // Data allaqachon base64 da
    });

    console.log('✅ PKCS7 with base64 data created:', pkcs7Result.pkcs7_64);
    return pkcs7Result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ===============================================
// 2. DIFFERENT INPUT DATA TYPES
// ===============================================

/**
 * Sign file content
 */
async function signFileContent() {
  try {
    const keyResult = await pfxPlugin.loadKeyAsync(
      'C:',
      '/keys/',
      'my-key.pfx',
      'user@example.com'
    );

    // File content (could be from FileReader, fetch, etc.)
    const fileContent = `
      <?xml version="1.0" encoding="UTF-8"?>
      <document>
        <title>Important Document</title>
        <content>This is sensitive information</content>
      </document>
    `;

    // Auto base64 encoding + attached signature
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(fileContent, keyResult.keyId);

    console.log('✅ File content signed:', pkcs7Result.pkcs7_64);
    return pkcs7Result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Sign JSON data
 */
async function signJsonData() {
  try {
    const keyResult = await pfxPlugin.loadKeyAsync(
      'C:',
      '/keys/',
      'my-key.pfx',
      'user@example.com'
    );

    const jsonData = JSON.stringify({
      orderId: '12345',
      amount: 1000000,
      currency: 'UZS',
      timestamp: new Date().toISOString()
    });

    // Detached signature for JSON
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(jsonData, keyResult.keyId, {
      detached: true
    });

    console.log('✅ JSON data signed:', pkcs7Result.pkcs7_64);
    return pkcs7Result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * Sign binary data (e.g., from file upload)
 */
async function signBinaryData(fileInput: File) {
  try {
    const keyResult = await pfxPlugin.loadKeyAsync(
      'C:',
      '/keys/',
      'my-key.pfx',
      'user@example.com'
    );

    // Read file as text
    const fileContent = await fileInput.text();

    // Create attached PKCS7
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(fileContent, keyResult.keyId, {
      detached: false
    });

    console.log('✅ Binary data signed:', pkcs7Result.pkcs7_64);
    return pkcs7Result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ===============================================
// 3. VERIFICATION WITH AUTO BASE64
// ===============================================

/**
 * Verify detached PKCS7 signature
 */
async function verifyDetachedSignature() {
  try {
    const originalData = 'Important document content';
    const pkcs7Signature = 'MIIGxQYJKoZIhvcNAQcCoIIGtjCCBrI...'; // From previous signing

    // Verify with auto base64 encoding
    const verifyResult = await pkcs7Plugin.verifyPkcs7DetachedAsync(
      originalData, // Plain text - avtomatik base64 ga aylanadi
      pkcs7Signature,
      'truststore_id',
      '', // requesterId
      true // autoBase64 = true
    );

    console.log('✅ Signature valid:', verifyResult.valid);
    return verifyResult;
  } catch (error) {
    console.error('❌ Verification error:', error);
    throw error;
  }
}

/**
 * Get detached PKCS7 info with auto encoding
 */
async function getDetachedPkcs7Info() {
  try {
    const originalData = 'Some document content';
    const pkcs7Data = 'MIIGxQYJKoZIhvcNAQcCoIIGtjCCBrI...';

    // Get info with auto base64 encoding
    const infoResult = await pkcs7Plugin.getPkcs7DetachedInfoAsync(
      originalData, // Plain text - avtomatik base64 ga aylanadi
      pkcs7Data,
      'truststore_id',
      true // autoBase64 = true
    );

    console.log('✅ PKCS7 signatures:', infoResult.signatures);
    return infoResult;
  } catch (error) {
    console.error('❌ Error getting info:', error);
    throw error;
  }
}

// ===============================================
// 4. MIGRATION FROM OLD API
// ===============================================

/**
 * Old way (manual base64 encoding)
 */
async function oldWayExample() {
  try {
    const keyResult = await pfxPlugin.loadKeyAsync(
      'C:',
      '/keys/',
      'my-key.pfx',
      'user@example.com'
    );

    // Manual base64 encoding (old way)
    const data = btoa('Hello, E-IMZO!');
    const pkcs7Result = await pkcs7Plugin.createPkcs7LegacyAsync(
      data,
      keyResult.keyId,
      'no' // Manual detached parameter
    );

    console.log('📛 Old way PKCS7:', pkcs7Result.pkcs7_64);
    return pkcs7Result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

/**
 * New way (automatic base64 encoding + smart defaults)
 */
async function newWayExample() {
  try {
    const keyResult = await pfxPlugin.loadKeyAsync(
      'C:',
      '/keys/',
      'my-key.pfx',
      'user@example.com'
    );

    // Automatic base64 encoding (new way)
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(
      'Hello, E-IMZO!', // Plain string
      keyResult.keyId
      // Default: attached signature, auto base64
    );

    console.log('✅ New way PKCS7:', pkcs7Result.pkcs7_64);
    return pkcs7Result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ===============================================
// 5. UI INTEGRATION EXAMPLES
// ===============================================

/**
 * Form submission with PKCS7 signing
 */
async function signFormData(formElement: HTMLFormElement) {
  try {
    // Get form data
    const formData = new FormData(formElement);
    const dataObject: Record<string, unknown> = {};

    // Convert FormData to object
    formData.forEach((value, key) => {
      dataObject[key] = value;
    });

    const dataString = JSON.stringify(dataObject);

    const keyResult = await pfxPlugin.loadKeyAsync(
      'C:',
      '/keys/',
      'my-key.pfx',
      'user@example.com'
    );

    // Sign form data
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(
      dataString,
      keyResult.keyId,
      { detached: true } // Detached signature for form data
    );

    // Add signature to form
    const signatureInput = document.createElement('input');
    signatureInput.type = 'hidden';
    signatureInput.name = 'digital_signature';
    signatureInput.value = pkcs7Result.pkcs7_64;
    formElement.appendChild(signatureInput);

    console.log('✅ Form data signed and ready for submission');
    return pkcs7Result;
  } catch (error) {
    console.error('❌ Form signing error:', error);
    throw error;
  }
}

/**
 * File upload with digital signature
 */
async function signUploadedFile(fileInput: HTMLInputElement) {
  try {
    const file = fileInput.files?.[0];
    if (!file) throw new Error('No file selected');

    const keyResult = await pfxPlugin.loadKeyAsync(
      'C:',
      '/keys/',
      'my-key.pfx',
      'user@example.com'
    );

    // Read file content
    const fileContent = await file.text();

    // Create attached signature (file + signature in one)
    const pkcs7Result = await pkcs7Plugin.createPkcs7Async(
      fileContent,
      keyResult.keyId,
      { detached: false } // Attached signature
    );

    console.log('✅ File signed:', file.name);
    console.log('📄 Signature size:', pkcs7Result.pkcs7_64.length, 'bytes');

    return {
      originalFile: file,
      signedData: pkcs7Result.pkcs7_64,
      filename: file.name + '.p7s'
    };
  } catch (error) {
    console.error('❌ File signing error:', error);
    throw error;
  }
}

// ===============================================
// 6. COMPARISON EXAMPLES
// ===============================================

/**
 * API comparison: Before vs After
 */
function apiComparison() {
  console.log(`
  🔄 API COMPARISON:
  
  ❌ BEFORE (Manual & Complex):
  const data = btoa('Hello, E-IMZO!');
  const pkcs7Result = await pkcs7Plugin.createPkcs7Async(data, keyId, 'no');
  
  ✅ AFTER (Auto & Simple):  
  const pkcs7Result = await pkcs7Plugin.createPkcs7Async('Hello, E-IMZO!', keyId);
  
  📊 BENEFITS:
  - No manual btoa() encoding needed
  - Smart defaults (attached signature)
  - Boolean detached option (true/false vs 'yes'/'no')
  - Auto-detection of base64 data
  - UTF-8 string support
  - Backward compatibility maintained
  `);
}

// ===============================================
// EXPORT ALL EXAMPLES
// ===============================================

export {
  // Comparison
  apiComparison,
  createDetachedPkcs7,
  // Basic usage
  createPkcs7Simple,
  createPkcs7WithBase64Data,
  getDetachedPkcs7Info,
  newWayExample,
  // Migration examples
  oldWayExample,
  signBinaryData,
  // Different data types
  signFileContent,
  // UI integration
  signFormData,
  signJsonData,
  signUploadedFile,
  // Verification
  verifyDetachedSignature
};
