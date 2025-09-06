# FTJC Plugin API Reference

FTJC (File Transfer Java Card) plugin Java Card appletlari bilan aloqa o'rnatish
va ma'lumot almashinuvi uchun mo'ljallangan.

## Overview

FTJC plugin quyidagi funksiyalarni taqdim etadi:

- Java Card appletlari bilan aloqa
- APDU buyruqlarini yuborish va qabul qilish
- Smartcard operatsiyalari
- Applet lifecycle management
- Secure channel communication

## Import

```typescript
// ES6 import
import { ftjcPlugin } from 'imzo-agnost';

// CommonJS
const { ftjcPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.ftjc;
```

## Types

```typescript
interface FtjcResponse {
  success: boolean;
  data?: string;
  reason?: string;
}

interface FtjcConnectOptions {
  appletId?: string;
  timeout?: number;
  verbose?: boolean;
}

interface ApduCommand {
  cla: string; // Class byte
  ins: string; // Instruction byte
  p1: string; // Parameter 1
  p2: string; // Parameter 2
  data?: string; // Data payload
  le?: string; // Expected length
}

interface ApduResponse {
  success: boolean;
  data: string;
  sw1: string; // Status word 1
  sw2: string; // Status word 2
  statusWord: string; // SW1 + SW2
}
```

## Connection Management

### connectAsync()

Java Card applet bilan aloqa o'rnatish.

```typescript
try {
  const result = await ftjcPlugin.connectAsync();

  if (result.success) {
    console.log('✅ FTJC connection established');
  }
} catch (error) {
  console.error('❌ Connection failed:', error);
}
```

**With Options:**

```typescript
try {
  const options: FtjcConnectOptions = {
    appletId: 'D2760001240102000000000000000000',
    timeout: 30000, // 30 seconds
    verbose: true // Debug output
  };

  const result = await ftjcPlugin.connectAsync(options);
  console.log('Connected with options:', result);
} catch (error) {
  console.error('Connection with options failed:', error);
}
```

### disconnectAsync()

Applet bilan aloqani uzish.

```typescript
try {
  const result = await ftjcPlugin.disconnectAsync();

  if (result.success) {
    console.log('✅ FTJC disconnected successfully');
  }
} catch (error) {
  console.error('❌ Disconnect failed:', error);
}
```

### isConnectedAsync()

Aloqa holatini tekshirish.

```typescript
try {
  const result = await ftjcPlugin.isConnectedAsync();

  console.log(
    'Connection status:',
    result.success ? 'Connected' : 'Disconnected'
  );
} catch (error) {
  console.error('❌ Status check failed:', error);
}
```

## APDU Communication

### sendApduAsync()

APDU buyrug'ini yuborish va javobni olish.

**Basic APDU:**

```typescript
try {
  const apdu = '00A40400'; // SELECT command

  const response = await ftjcPlugin.sendApduAsync(apdu);

  if (response.success) {
    console.log('APDU Response:');
    console.log('Data:', response.data);
    console.log('Status Word:', response.statusWord);
    console.log('SW1:', response.sw1, 'SW2:', response.sw2);
  }
} catch (error) {
  console.error('❌ APDU send failed:', error);
}
```

**Structured APDU:**

```typescript
try {
  const command: ApduCommand = {
    cla: '00', // Class
    ins: 'A4', // Instruction (SELECT)
    p1: '04', // Parameter 1
    p2: '00', // Parameter 2
    data: 'D2760001240102000000000000000000', // AID
    le: '00' // Expected length
  };

  // Convert to APDU string
  const apduString = `${command.cla}${command.ins}${command.p1}${command.p2}${command.data?.length ? (command.data.length / 2).toString(16).padStart(2, '0') : ''}${command.data || ''}${command.le || ''}`;

  const response = await ftjcPlugin.sendApduAsync(apduString);

  console.log('Structured APDU response:', response);
} catch (error) {
  console.error('❌ Structured APDU failed:', error);
}
```

### sendApduChainAsync()

Ko'p qismli APDU buyruqlarini yuborish.

```typescript
try {
  const apduChain = [
    '00A40400', // SELECT
    '00200001', // VERIFY PIN
    '0084000008', // GET CHALLENGE
    '002A9E9A80' // PERFORM SECURITY OPERATION
  ];

  const responses = [];

  for (const apdu of apduChain) {
    const response = await ftjcPlugin.sendApduAsync(apdu);

    responses.push(response);

    if (!response.success || response.statusWord !== '9000') {
      console.warn(`⚠️ APDU chain broken at: ${apdu}`);
      break;
    }
  }

  console.log('APDU Chain results:', responses);
} catch (error) {
  console.error('❌ APDU chain failed:', error);
}
```

## Applet Management

### selectAppletAsync()

Specific applet tanlash.

```typescript
try {
  const appletId = 'D2760001240102000000000000000000';

  const result = await ftjcPlugin.selectAppletAsync(appletId);

  if (result.success) {
    console.log('✅ Applet selected:', appletId);
    console.log('Response data:', result.data);
  }
} catch (error) {
  console.error('❌ Applet selection failed:', error);
}
```

### getAppletInfoAsync()

Applet ma'lumotlarini olish.

```typescript
try {
  const info = await ftjcPlugin.getAppletInfoAsync();

  if (info.success) {
    console.log('Applet Information:');
    console.log('AID:', info.aid);
    console.log('Version:', info.version);
    console.log('Status:', info.status);
  }
} catch (error) {
  console.error('❌ Applet info failed:', error);
}
```

### listAppletsAsync()

Mavjud appletlar ro'yxatini olish.

```typescript
try {
  const applets = await ftjcPlugin.listAppletsAsync();

  if (applets.success) {
    console.log('Available Applets:');
    applets.list.forEach((applet, index) => {
      console.log(`${index + 1}. AID: ${applet.aid}`);
      console.log(`   Name: ${applet.name || 'Unknown'}`);
      console.log(`   Status: ${applet.status}`);
    });
  }
} catch (error) {
  console.error('❌ Applet listing failed:', error);
}
```

## Cryptographic Operations

### generateKeyPairAsync()

Kalitlar juftligini yaratish.

```typescript
try {
  const keySpec = {
    algorithm: 'RSA',
    keySize: 2048,
    keyId: 'crypto_key_01'
  };

  const result = await ftjcPlugin.generateKeyPairAsync(keySpec);

  if (result.success) {
    console.log('✅ Key pair generated');
    console.log('Public Key:', result.publicKey);
    console.log('Key ID:', result.keyId);
  }
} catch (error) {
  console.error('❌ Key generation failed:', error);
}
```

### signDataAsync()

Ma'lumotni imzolash.

```typescript
try {
  const data = 'Hello, Java Card!';
  const keyId = 'crypto_key_01';

  const result = await ftjcPlugin.signDataAsync(data, keyId);

  if (result.success) {
    console.log('✅ Data signed');
    console.log('Signature:', result.signature);
  }
} catch (error) {
  console.error('❌ Signing failed:', error);
}
```

### verifySignatureAsync()

Imzoni tekshirish.

```typescript
try {
  const data = 'Hello, Java Card!';
  const signature = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...';
  const publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...';

  const result = await ftjcPlugin.verifySignatureAsync(
    data,
    signature,
    publicKey
  );

  console.log('Signature valid:', result.valid);
} catch (error) {
  console.error('❌ Verification failed:', error);
}
```

## File Operations

### uploadFileAsync()

Faylni Java Card ga yuklash.

```typescript
try {
  const fileData = 'SGVsbG8sIEphdmEgQ2FyZCE='; // Base64
  const fileName = 'document.txt';

  const result = await ftjcPlugin.uploadFileAsync(fileData, fileName);

  if (result.success) {
    console.log('✅ File uploaded');
    console.log('File ID:', result.fileId);
  }
} catch (error) {
  console.error('❌ Upload failed:', error);
}
```

### downloadFileAsync()

Faylni Java Card dan yuklab olish.

```typescript
try {
  const fileId = 'document_001';

  const result = await ftjcPlugin.downloadFileAsync(fileId);

  if (result.success) {
    console.log('✅ File downloaded');
    console.log('File data:', result.data);
    console.log('File size:', result.size);
  }
} catch (error) {
  console.error('❌ Download failed:', error);
}
```

### listFilesAsync()

Fayllar ro'yxatini olish.

```typescript
try {
  const files = await ftjcPlugin.listFilesAsync();

  if (files.success) {
    console.log('Files on Java Card:');
    files.list.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name} (${file.size} bytes)`);
      console.log(`   ID: ${file.id}`);
      console.log(`   Modified: ${file.lastModified}`);
    });
  }
} catch (error) {
  console.error('❌ File listing failed:', error);
}
```

## Advanced Operations

### authenticateAsync()

Java Card da authentication.

```typescript
try {
  const credentials = {
    pin: '123456',
    keyId: 'auth_key',
    challenge: 'random_challenge_data'
  };

  const result = await ftjcPlugin.authenticateAsync(credentials);

  if (result.success) {
    console.log('✅ Authentication successful');
    console.log('Session token:', result.sessionToken);
  }
} catch (error) {
  console.error('❌ Authentication failed:', error);
}
```

### setSecurityLevelAsync()

Security level ni o'rnatish.

```typescript
try {
  const securityLevel = 'HIGH'; // LOW, MEDIUM, HIGH

  const result = await ftjcPlugin.setSecurityLevelAsync(securityLevel);

  if (result.success) {
    console.log(`✅ Security level set to: ${securityLevel}`);
  }
} catch (error) {
  console.error('❌ Security level setting failed:', error);
}
```

### performDiagnosticsAsync()

Diagnostika testlarini bajarish.

```typescript
try {
  const diagnostics = await ftjcPlugin.performDiagnosticsAsync();

  if (diagnostics.success) {
    console.log('Diagnostics Results:');
    console.log('Memory usage:', diagnostics.memoryUsage);
    console.log('Performance:', diagnostics.performance);
    console.log('Errors:', diagnostics.errors);
  }
} catch (error) {
  console.error('❌ Diagnostics failed:', error);
}
```

## Complete Examples

### Full Java Card Session

```typescript
async function javaCardWorkflow() {
  try {
    console.log('🚀 Starting Java Card workflow...');

    // 1. Connect to Java Card
    console.log('1. Connecting to Java Card...');
    const connection = await ftjcPlugin.connectAsync({
      timeout: 30000,
      verbose: true
    });

    if (!connection.success) {
      throw new Error('Failed to connect to Java Card');
    }
    console.log('✅ Connected to Java Card');

    // 2. List available applets
    console.log('2. Listing applets...');
    const applets = await ftjcPlugin.listAppletsAsync();

    if (applets.success) {
      console.log(`Found ${applets.list.length} applets:`);
      applets.list.forEach(applet => {
        console.log(`  - ${applet.aid} (${applet.name})`);
      });
    }

    // 3. Select specific applet
    console.log('3. Selecting applet...');
    const appletId = 'D2760001240102000000000000000000';
    const selection = await ftjcPlugin.selectAppletAsync(appletId);

    if (!selection.success) {
      throw new Error('Failed to select applet');
    }
    console.log('✅ Applet selected');

    // 4. Authenticate
    console.log('4. Authenticating...');
    const auth = await ftjcPlugin.authenticateAsync({
      pin: '123456',
      keyId: 'default_auth_key'
    });

    if (!auth.success) {
      throw new Error('Authentication failed');
    }
    console.log('✅ Authenticated successfully');

    // 5. Generate key pair
    console.log('5. Generating key pair...');
    const keyPair = await ftjcPlugin.generateKeyPairAsync({
      algorithm: 'RSA',
      keySize: 2048,
      keyId: 'session_key_' + Date.now()
    });

    if (!keyPair.success) {
      throw new Error('Key generation failed');
    }
    console.log('✅ Key pair generated');

    // 6. Sign some data
    console.log('6. Signing data...');
    const testData = 'Test data for Java Card signing';
    const signature = await ftjcPlugin.signDataAsync(testData, keyPair.keyId);

    if (!signature.success) {
      throw new Error('Signing failed');
    }
    console.log('✅ Data signed successfully');

    // 7. Verify signature
    console.log('7. Verifying signature...');
    const verification = await ftjcPlugin.verifySignatureAsync(
      testData,
      signature.signature,
      keyPair.publicKey
    );

    console.log('✅ Signature verification:', verification.valid);

    // 8. Disconnect
    console.log('8. Disconnecting...');
    const disconnect = await ftjcPlugin.disconnectAsync();

    if (disconnect.success) {
      console.log('✅ Disconnected successfully');
    }

    console.log('🎉 Java Card workflow completed successfully!');

    return {
      connected: true,
      authenticated: true,
      keyGenerated: true,
      dataSigned: true,
      signatureValid: verification.valid
    };
  } catch (error) {
    console.error('❌ Java Card workflow failed:', error);

    // Cleanup - ensure disconnection
    try {
      await ftjcPlugin.disconnectAsync();
    } catch (disconnectError) {
      console.error('❌ Cleanup disconnect failed:', disconnectError);
    }

    throw error;
  }
}
```

### APDU Communication Pattern

```typescript
async function apduCommunicationExample() {
  try {
    // Connect first
    await ftjcPlugin.connectAsync();

    console.log('🔄 Starting APDU communication...');

    // 1. SELECT application
    console.log('1. Selecting application...');
    const selectApdu = '00A4040008D27600012401020000';
    const selectResponse = await ftjcPlugin.sendApduAsync(selectApdu);

    if (selectResponse.statusWord !== '9000') {
      throw new Error(`SELECT failed: ${selectResponse.statusWord}`);
    }
    console.log('✅ Application selected');

    // 2. VERIFY PIN
    console.log('2. Verifying PIN...');
    const pin = '313233343536'; // "123456" in hex
    const verifyApdu = `002000010${pin.length / 2}${pin}`;
    const verifyResponse = await ftjcPlugin.sendApduAsync(verifyApdu);

    if (verifyResponse.statusWord !== '9000') {
      throw new Error(`PIN verification failed: ${verifyResponse.statusWord}`);
    }
    console.log('✅ PIN verified');

    // 3. GET CHALLENGE
    console.log('3. Getting challenge...');
    const challengeApdu = '00840000088';
    const challengeResponse = await ftjcPlugin.sendApduAsync(challengeApdu);

    if (challengeResponse.statusWord === '9000') {
      console.log('✅ Challenge received:', challengeResponse.data);
    }

    // 4. READ DATA
    console.log('4. Reading data...');
    const readApdu = '00B0000020';
    const readResponse = await ftjcPlugin.sendApduAsync(readApdu);

    if (readResponse.statusWord === '9000') {
      console.log('✅ Data read:', readResponse.data);
    }

    // 5. WRITE DATA
    console.log('5. Writing data...');
    const dataToWrite = '48656C6C6F20576F726C64'; // "Hello World"
    const writeApdu = `00D6000000${dataToWrite.length / 2}${dataToWrite}`;
    const writeResponse = await ftjcPlugin.sendApduAsync(writeApdu);

    if (writeResponse.statusWord === '9000') {
      console.log('✅ Data written successfully');
    }

    console.log('🎉 APDU communication completed!');
  } catch (error) {
    console.error('❌ APDU communication failed:', error);
  } finally {
    // Always disconnect
    await ftjcPlugin.disconnectAsync();
  }
}
```

### File Management Example

```typescript
async function fileManagementExample() {
  try {
    await ftjcPlugin.connectAsync();

    console.log('📁 Starting file management...');

    // 1. List existing files
    console.log('1. Listing files...');
    const fileList = await ftjcPlugin.listFilesAsync();

    if (fileList.success) {
      console.log(`Found ${fileList.list.length} files:`);
      fileList.list.forEach(file => {
        console.log(`  - ${file.name} (${file.size} bytes)`);
      });
    }

    // 2. Upload a new file
    console.log('2. Uploading file...');
    const fileContent = btoa('This is test file content for Java Card');
    const uploadResult = await ftjcPlugin.uploadFileAsync(
      fileContent,
      'test_document.txt'
    );

    if (uploadResult.success) {
      console.log('✅ File uploaded:', uploadResult.fileId);
    }

    // 3. Download the file
    console.log('3. Downloading file...');
    const downloadResult = await ftjcPlugin.downloadFileAsync(
      uploadResult.fileId
    );

    if (downloadResult.success) {
      const decodedContent = atob(downloadResult.data);
      console.log('✅ File downloaded:', decodedContent);
    }

    // 4. Update file list
    console.log('4. Updated file list...');
    const updatedList = await ftjcPlugin.listFilesAsync();

    if (updatedList.success) {
      console.log(`Now ${updatedList.list.length} files:`);
      updatedList.list.forEach(file => {
        console.log(`  - ${file.name} (${file.size} bytes)`);
      });
    }

    console.log('📁 File management completed!');
  } catch (error) {
    console.error('❌ File management failed:', error);
  } finally {
    await ftjcPlugin.disconnectAsync();
  }
}
```

## Callback API (Legacy)

### connect() - Callback Version

```typescript
ftjcPlugin.connect(
  (event, response) => {
    if (response.success) {
      console.log('Callback: Connected to FTJC');
    } else {
      console.error('Callback: Connection failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Connection error:', error);
  }
);
```

### sendApdu() - Callback Version

```typescript
const apdu = '00A40400';

ftjcPlugin.sendApdu(
  apdu,
  (event, response) => {
    if (response.success) {
      console.log('Callback APDU Response:', response.data);
      console.log('Status Word:', response.statusWord);
    }
  },
  error => {
    console.error('Callback APDU Error:', error);
  }
);
```

## Error Handling

### Common Error Patterns

```typescript
try {
  const result = await ftjcPlugin.connectAsync();
} catch (error) {
  if (error.message.includes('card not found')) {
    console.error('❌ Java Card not detected');
  } else if (error.message.includes('applet not found')) {
    console.error('❌ Required applet not installed');
  } else if (error.message.includes('authentication')) {
    console.error('❌ Authentication failed - check PIN');
  } else if (error.message.includes('timeout')) {
    console.error('❌ Operation timed out');
  } else {
    console.error('❌ Unknown FTJC error:', error.message);
  }
}
```

### APDU Error Handling

```typescript
async function handleApduErrors(apdu: string) {
  try {
    const response = await ftjcPlugin.sendApduAsync(apdu);

    switch (response.statusWord) {
      case '9000':
        console.log('✅ Success');
        break;
      case '6300':
        console.warn('⚠️ Authentication failed');
        break;
      case '6A82':
        console.error('❌ File not found');
        break;
      case '6A86':
        console.error('❌ Wrong parameters P1-P2');
        break;
      case '6B00':
        console.error('❌ Wrong parameters P1-P2');
        break;
      case '6D00':
        console.error('❌ Instruction not supported');
        break;
      case '6E00':
        console.error('❌ Class not supported');
        break;
      default:
        console.error(`❌ Unknown status: ${response.statusWord}`);
    }

    return response;
  } catch (error) {
    console.error('❌ APDU communication error:', error);
    throw error;
  }
}
```

## Best Practices

1. **Connection Management**: Always connect before operations and disconnect
   after
2. **Error Handling**: Handle APDU status words properly
3. **Authentication**: Verify PIN before sensitive operations
4. **Applet Selection**: Select correct applet before operations
5. **Timeout Management**: Set appropriate timeouts for operations
6. **Security**: Use secure channels for sensitive data
7. **Resource Cleanup**: Always disconnect in finally blocks
8. **Status Checking**: Check response status words
9. **Memory Management**: Be mindful of Java Card memory limits
10. **Testing**: Test with different card types and applets
