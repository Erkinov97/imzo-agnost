# TSAClient Plugin API Reference

TSAClient (Time Stamp Authority Client) plugin vaqt tamg'alari (timestamp) olish
va boshqarish uchun mo'ljallangan. Bu plugin TSA serverlar bilan aloqa o'rnatib,
xavfsiz vaqt tamg'alari yaratish uchun ishlatiladi.

## Overview

TSAClient plugin quyidagi funksiyalarni taqdim etadi:

- TSA serverlardan timestamp olish
- Timestamp tokenlarni yaratish va tekshirish
- RFC 3161 Time-Stamp Protocol qo'llab-quvvatlash
- Timestamp verification
- TSA server configuration

## Import

```typescript
// ES6 import
import { tsaClientPlugin } from 'imzo-agnost';

// CommonJS
const { tsaClientPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.tsaClient;
```

## Types

```typescript
interface TimestampRequest {
  data: string; // Base64 encoded data to timestamp
  hashAlgorithm?: string; // SHA-1, SHA-256, SHA-512
  nonce?: string; // Optional nonce for uniqueness
  certReq?: boolean; // Include TSA certificate in response
  policyId?: string; // TSA policy identifier
}

interface TimestampResponse {
  success: boolean;
  token?: string; // Base64 encoded timestamp token
  timestamp?: string; // ISO formatted timestamp
  serialNumber?: string; // TSA serial number
  accuracy?: string; // Timestamp accuracy
  reason?: string; // Error reason if failed
}

interface TSAConfig {
  url: string; // TSA server URL
  username?: string; // Authentication username
  password?: string; // Authentication password
  timeout?: number; // Request timeout in ms
  retries?: number; // Number of retry attempts
}

interface TimestampInfo {
  timestamp: string; // Timestamp value
  accuracy: string; // Accuracy information
  serialNumber: string; // TSA serial number
  tsa: string; // TSA identifier
  policyId: string; // Policy identifier
  nonce?: string; // Nonce if present
}

interface VerificationResult {
  valid: boolean;
  timestamp: string;
  tsaCertificate?: string;
  reason?: string;
}
```

## Basic Timestamp Operations

### requestTimestampAsync()

TSA serverdan timestamp so'rash.

**Basic Timestamp Request:**

```typescript
try {
  const dataToTimestamp = 'Hello, TSA World!';
  const base64Data = btoa(dataToTimestamp);

  const request: TimestampRequest = {
    data: base64Data,
    hashAlgorithm: 'SHA-256',
    certReq: true // TSA sertifikatini javobga qo'shish
  };

  const response = await tsaClientPlugin.requestTimestampAsync(request);

  if (response.success) {
    console.log('✅ Timestamp obtained successfully');
    console.log('Timestamp:', response.timestamp);
    console.log('Serial Number:', response.serialNumber);
    console.log('Accuracy:', response.accuracy);
    console.log('Token:', response.token?.substring(0, 100) + '...');
  }
} catch (error) {
  console.error('❌ Timestamp request failed:', error);
}
```

**Advanced Timestamp Request with Nonce:**

```typescript
try {
  const documentHash = 'a1b2c3d4e5f6789012345678901234567890abcd';
  const nonce = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const request: TimestampRequest = {
    data: documentHash,
    hashAlgorithm: 'SHA-256',
    nonce: nonce,
    certReq: true,
    policyId: '1.2.3.4.5' // TSA policy identifier
  };

  const response = await tsaClientPlugin.requestTimestampAsync(request);

  if (response.success) {
    console.log('✅ Advanced timestamp obtained');
    console.log('Request nonce:', nonce);
    console.log('Response timestamp:', response.timestamp);
    console.log('Policy ID used:', request.policyId);
  }
} catch (error) {
  console.error('❌ Advanced timestamp request failed:', error);
}
```

### configTSAAsync()

TSA server konfiguratsiyasini o'rnatish.

```typescript
try {
  const tsaConfig: TSAConfig = {
    url: 'https://tsa.example.com/tsa',
    username: 'tsa_user',
    password: 'tsa_password',
    timeout: 30000, // 30 seconds
    retries: 3 // 3 marta urinish
  };

  const result = await tsaClientPlugin.configTSAAsync(tsaConfig);

  if (result.success) {
    console.log('✅ TSA configuration set successfully');
    console.log('TSA URL:', tsaConfig.url);
    console.log('Timeout:', tsaConfig.timeout, 'ms');
    console.log('Retries:', tsaConfig.retries);
  }
} catch (error) {
  console.error('❌ TSA configuration failed:', error);
}
```

## Timestamp Verification

### verifyTimestampAsync()

Timestamp tokenni tekshirish.

```typescript
try {
  const timestampToken =
    'MIIBCgYJKoZIhvcNAQcCoIH8MIH5AgEBMQ8wDQYJYIZIAWUDBAIBBQAw...';
  const originalData = btoa('Hello, TSA World!');

  const verification = await tsaClientPlugin.verifyTimestampAsync(
    timestampToken,
    originalData
  );

  if (verification.valid) {
    console.log('✅ Timestamp verification successful');
    console.log('Timestamp:', verification.timestamp);
    console.log('TSA Certificate included:', !!verification.tsaCertificate);
  } else {
    console.log('❌ Timestamp verification failed');
    console.log('Reason:', verification.reason);
  }
} catch (error) {
  console.error('❌ Timestamp verification error:', error);
}
```

### parseTimestampAsync()

Timestamp tokenni parse qilish va ma'lumotlarini olish.

```typescript
try {
  const timestampToken =
    'MIIBCgYJKoZIhvcNAQcCoIH8MIH5AgEBMQ8wDQYJYIZIAWUDBAIBBQAw...';

  const info = await tsaClientPlugin.parseTimestampAsync(timestampToken);

  if (info.success) {
    console.log('📋 Timestamp Information:');
    console.log('Timestamp:', info.timestamp);
    console.log('Accuracy:', info.accuracy);
    console.log('Serial Number:', info.serialNumber);
    console.log('TSA Identifier:', info.tsa);
    console.log('Policy ID:', info.policyId);
    console.log('Nonce:', info.nonce || 'Not present');
  }
} catch (error) {
  console.error('❌ Timestamp parsing failed:', error);
}
```

## Multiple TSA Support

### addTSAServerAsync()

Qo'shimcha TSA server qo'shish.

```typescript
try {
  const additionalTSA: TSAConfig = {
    url: 'https://backup-tsa.example.com/tsa',
    username: 'backup_user',
    password: 'backup_password',
    timeout: 20000,
    retries: 2
  };

  const result = await tsaClientPlugin.addTSAServerAsync(
    'backup_tsa',
    additionalTSA
  );

  if (result.success) {
    console.log('✅ Additional TSA server added');
    console.log('Server ID: backup_tsa');
    console.log('URL:', additionalTSA.url);
  }
} catch (error) {
  console.error('❌ Adding TSA server failed:', error);
}
```

### requestTimestampFromServerAsync()

Specific TSA serverdan timestamp so'rash.

```typescript
try {
  const data = btoa('Document requiring backup TSA timestamp');

  const request: TimestampRequest = {
    data: data,
    hashAlgorithm: 'SHA-256',
    certReq: true
  };

  // Primary TSA dan urinish
  try {
    const primaryResponse =
      await tsaClientPlugin.requestTimestampFromServerAsync(
        'primary_tsa',
        request
      );

    if (primaryResponse.success) {
      console.log('✅ Primary TSA timestamp obtained');
      console.log('Timestamp:', primaryResponse.timestamp);
    }
  } catch (primaryError) {
    console.log('⚠️ Primary TSA failed, trying backup...');

    // Backup TSA dan urinish
    const backupResponse =
      await tsaClientPlugin.requestTimestampFromServerAsync(
        'backup_tsa',
        request
      );

    if (backupResponse.success) {
      console.log('✅ Backup TSA timestamp obtained');
      console.log('Timestamp:', backupResponse.timestamp);
    }
  }
} catch (error) {
  console.error('❌ All TSA servers failed:', error);
}
```

### listTSAServersAsync()

Ro'yxatga olingan TSA serverlarni ko'rish.

```typescript
try {
  const servers = await tsaClientPlugin.listTSAServersAsync();

  if (servers.success) {
    console.log('📋 Available TSA Servers:');
    servers.list.forEach((server, index) => {
      console.log(`${index + 1}. ${server.id}`);
      console.log(`   URL: ${server.url}`);
      console.log(`   Status: ${server.status}`);
      console.log(`   Last Check: ${server.lastCheck}`);
      console.log(`   Response Time: ${server.responseTime}ms`);
    });
  }
} catch (error) {
  console.error('❌ Listing TSA servers failed:', error);
}
```

## Timestamp Chain Operations

### createTimestampChainAsync()

Bir nechta TSA dan timestamp chain yaratish.

```typescript
try {
  const documentData = btoa('Important legal document content');

  const chainRequest = {
    data: documentData,
    tsaServers: ['primary_tsa', 'backup_tsa', 'legal_tsa'],
    hashAlgorithm: 'SHA-256',
    simultaneousRequests: false // Ketma-ket so'rash
  };

  const chain = await tsaClientPlugin.createTimestampChainAsync(chainRequest);

  if (chain.success) {
    console.log('✅ Timestamp chain created');
    console.log('Chain length:', chain.timestamps.length);

    chain.timestamps.forEach((ts, index) => {
      console.log(`Timestamp ${index + 1}:`);
      console.log(`  TSA: ${ts.tsaId}`);
      console.log(`  Time: ${ts.timestamp}`);
      console.log(`  Serial: ${ts.serialNumber}`);
    });
  }
} catch (error) {
  console.error('❌ Timestamp chain creation failed:', error);
}
```

### verifyTimestampChainAsync()

Timestamp chain ni tekshirish.

```typescript
try {
  const timestampChain = [
    'MIIBCgYJKoZIhvcNAQcCoIH8MIH5AgEBMQ8wDQYJYIZIAWUDBAIBBQAw...', // TSA 1
    'MIIBCgYJKoZIhvcNAQcCoIH8MIH5AgEBMQ8wDQYJYIZIAWUDBAIBBQAw...', // TSA 2
    'MIIBCgYJKoZIhvcNAQcCoIH8MIH5AgEBMQ8wDQYJYIZIAWUDBAIBBQAw...' // TSA 3
  ];

  const originalData = btoa('Important legal document content');

  const chainVerification = await tsaClientPlugin.verifyTimestampChainAsync(
    timestampChain,
    originalData
  );

  if (chainVerification.valid) {
    console.log('✅ Timestamp chain verification successful');
    console.log('Valid timestamps:', chainVerification.validCount);
    console.log('Chain consistency:', chainVerification.consistent);

    chainVerification.details.forEach((detail, index) => {
      console.log(
        `Timestamp ${index + 1}: ${detail.valid ? '✅' : '❌'} ${detail.timestamp}`
      );
    });
  } else {
    console.log('❌ Timestamp chain verification failed');
    console.log('Reason:', chainVerification.reason);
  }
} catch (error) {
  console.error('❌ Timestamp chain verification error:', error);
}
```

## Complete Examples

### Document Timestamping Workflow

```typescript
async function timestampDocument(
  documentContent: string,
  documentName: string
) {
  try {
    console.log('🕒 Starting document timestamping workflow...');
    console.log('Document:', documentName);

    // 1. Configure TSA if not already configured
    console.log('1. Configuring TSA...');
    const tsaConfig: TSAConfig = {
      url: 'https://tsa.ca.gov/TSS/HttpTspServer',
      timeout: 30000,
      retries: 3
    };

    await tsaClientPlugin.configTSAAsync(tsaConfig);
    console.log('✅ TSA configured');

    // 2. Calculate document hash
    console.log('2. Calculating document hash...');
    const documentHash = await calculateSHA256Hash(documentContent);

    // 3. Request timestamp
    console.log('3. Requesting timestamp...');
    const nonce =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);

    const timestampRequest: TimestampRequest = {
      data: documentHash,
      hashAlgorithm: 'SHA-256',
      nonce: nonce,
      certReq: true
    };

    const timestampResponse =
      await tsaClientPlugin.requestTimestampAsync(timestampRequest);

    if (!timestampResponse.success) {
      throw new Error('Timestamp request failed: ' + timestampResponse.reason);
    }

    console.log('✅ Timestamp obtained');
    console.log('Timestamp:', timestampResponse.timestamp);
    console.log('Serial Number:', timestampResponse.serialNumber);

    // 4. Verify timestamp immediately
    console.log('4. Verifying timestamp...');
    const verification = await tsaClientPlugin.verifyTimestampAsync(
      timestampResponse.token!,
      documentHash
    );

    if (!verification.valid) {
      throw new Error('Timestamp verification failed: ' + verification.reason);
    }

    console.log('✅ Timestamp verified');

    // 5. Parse timestamp details
    console.log('5. Parsing timestamp details...');
    const timestampInfo = await tsaClientPlugin.parseTimestampAsync(
      timestampResponse.token!
    );

    console.log('📋 Timestamp Details:');
    console.log('  Timestamp:', timestampInfo.timestamp);
    console.log('  Accuracy:', timestampInfo.accuracy);
    console.log('  TSA:', timestampInfo.tsa);
    console.log('  Policy ID:', timestampInfo.policyId);
    console.log('  Nonce:', timestampInfo.nonce);

    // 6. Create timestamped document package
    console.log('6. Creating timestamped document package...');
    const timestampedPackage = {
      document: {
        name: documentName,
        content: documentContent,
        hash: documentHash,
        hashAlgorithm: 'SHA-256'
      },
      timestamp: {
        token: timestampResponse.token,
        timestamp: timestampResponse.timestamp,
        serialNumber: timestampResponse.serialNumber,
        accuracy: timestampResponse.accuracy,
        nonce: nonce,
        tsaUrl: tsaConfig.url
      },
      verification: {
        verified: verification.valid,
        verificationTime: new Date().toISOString()
      },
      metadata: {
        createdAt: new Date().toISOString(),
        workflow: 'document_timestamping',
        version: '1.0'
      }
    };

    console.log('✅ Document timestamping workflow completed!');

    return timestampedPackage;
  } catch (error) {
    console.error('❌ Document timestamping workflow failed:', error);
    throw error;
  }
}

// Helper function to calculate SHA-256 hash
async function calculateSHA256Hash(data: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Browser environment
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return btoa(String.fromCharCode.apply(null, hashArray));
  } else {
    // Node.js environment or fallback
    return btoa(data); // Simplified for example
  }
}
```

### Batch Timestamping Operations

```typescript
async function batchTimestampDocuments(
  documents: Array<{ name: string; content: string }>
) {
  try {
    console.log(
      `🕒 Starting batch timestamping for ${documents.length} documents...`
    );

    const results = [];
    const batchStartTime = Date.now();

    // Configure TSA
    const tsaConfig: TSAConfig = {
      url: 'https://tsa.ca.gov/TSS/HttpTspServer',
      timeout: 30000,
      retries: 3
    };

    await tsaClientPlugin.configTSAAsync(tsaConfig);

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const startTime = Date.now();

      try {
        console.log(
          `\n📄 Processing document ${i + 1}/${documents.length}: ${doc.name}`
        );

        // Calculate hash
        const documentHash = await calculateSHA256Hash(doc.content);

        // Create unique nonce
        const nonce = `${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;

        // Request timestamp
        const timestampRequest: TimestampRequest = {
          data: documentHash,
          hashAlgorithm: 'SHA-256',
          nonce: nonce,
          certReq: true
        };

        const timestampResponse =
          await tsaClientPlugin.requestTimestampAsync(timestampRequest);

        if (!timestampResponse.success) {
          throw new Error(
            'Timestamp request failed: ' + timestampResponse.reason
          );
        }

        // Verify timestamp
        const verification = await tsaClientPlugin.verifyTimestampAsync(
          timestampResponse.token!,
          documentHash
        );

        if (!verification.valid) {
          throw new Error(
            'Timestamp verification failed: ' + verification.reason
          );
        }

        const processingTime = Date.now() - startTime;

        results.push({
          index: i,
          document: {
            name: doc.name,
            size: doc.content.length,
            hash: documentHash
          },
          timestamp: {
            token: timestampResponse.token,
            timestamp: timestampResponse.timestamp,
            serialNumber: timestampResponse.serialNumber,
            nonce: nonce
          },
          verified: verification.valid,
          processingTime: processingTime,
          success: true
        });

        console.log(
          `✅ Document ${i + 1} timestamped successfully (${processingTime}ms)`
        );
        console.log(`   Serial: ${timestampResponse.serialNumber}`);
        console.log(`   Time: ${timestampResponse.timestamp}`);
      } catch (error) {
        const processingTime = Date.now() - startTime;

        results.push({
          index: i,
          document: {
            name: doc.name,
            size: doc.content.length
          },
          error: error.message,
          processingTime: processingTime,
          success: false
        });

        console.error(`❌ Document ${i + 1} failed: ${error.message}`);
      }
    }

    const totalTime = Date.now() - batchStartTime;
    const successCount = results.filter(r => r.success).length;

    console.log('\n📊 BATCH TIMESTAMPING SUMMARY');
    console.log('═══════════════════════════════');
    console.log(`Total documents: ${documents.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${documents.length - successCount}`);
    console.log(`Total time: ${totalTime}ms`);
    console.log(
      `Average time per document: ${(totalTime / documents.length).toFixed(2)}ms`
    );

    // Generate batch report
    const batchReport = {
      summary: {
        totalDocuments: documents.length,
        successful: successCount,
        failed: documents.length - successCount,
        totalTime: totalTime,
        averageTime: totalTime / documents.length
      },
      results: results,
      timestamp: new Date().toISOString()
    };

    console.log('📄 Batch report generated');

    return batchReport;
  } catch (error) {
    console.error('❌ Batch timestamping failed:', error);
    throw error;
  }
}
```

### TSA Server Monitoring

```typescript
async function monitorTSAServers() {
  try {
    console.log('📡 Starting TSA server monitoring...');

    // Add multiple TSA servers for monitoring
    const tsaServers = [
      {
        id: 'primary_tsa',
        config: {
          url: 'https://tsa.ca.gov/TSS/HttpTspServer',
          timeout: 15000,
          retries: 2
        }
      },
      {
        id: 'backup_tsa',
        config: {
          url: 'https://timestamp.sectigo.com',
          timeout: 15000,
          retries: 2
        }
      },
      {
        id: 'fallback_tsa',
        config: {
          url: 'https://freetsa.org/tsr',
          timeout: 20000,
          retries: 1
        }
      }
    ];

    // Add all servers
    for (const server of tsaServers) {
      await tsaClientPlugin.addTSAServerAsync(server.id, server.config);
      console.log(`✅ Added TSA server: ${server.id}`);
    }

    console.log('\n🔍 Testing TSA server connectivity...');

    const testData = btoa('TSA connectivity test');
    const testRequest: TimestampRequest = {
      data: testData,
      hashAlgorithm: 'SHA-256',
      certReq: false // Faster test without certificate
    };

    const serverStatus = [];

    for (const server of tsaServers) {
      const startTime = Date.now();

      try {
        console.log(`Testing ${server.id}...`);

        const response = await tsaClientPlugin.requestTimestampFromServerAsync(
          server.id,
          testRequest
        );

        const responseTime = Date.now() - startTime;

        if (response.success) {
          console.log(`✅ ${server.id}: OK (${responseTime}ms)`);

          serverStatus.push({
            id: server.id,
            url: server.config.url,
            status: 'online',
            responseTime: responseTime,
            lastTimestamp: response.timestamp,
            serialNumber: response.serialNumber,
            error: null
          });
        } else {
          console.log(`❌ ${server.id}: Failed - ${response.reason}`);

          serverStatus.push({
            id: server.id,
            url: server.config.url,
            status: 'error',
            responseTime: responseTime,
            error: response.reason
          });
        }
      } catch (error) {
        const responseTime = Date.now() - startTime;

        console.log(`❌ ${server.id}: Error - ${error.message}`);

        serverStatus.push({
          id: server.id,
          url: server.config.url,
          status: 'offline',
          responseTime: responseTime,
          error: error.message
        });
      }
    }

    // Generate monitoring report
    console.log('\n📊 TSA SERVER MONITORING REPORT');
    console.log('═══════════════════════════════════');

    const onlineServers = serverStatus.filter(s => s.status === 'online');
    const offlineServers = serverStatus.filter(s => s.status === 'offline');
    const errorServers = serverStatus.filter(s => s.status === 'error');

    console.log(`Online servers: ${onlineServers.length}`);
    console.log(`Offline servers: ${offlineServers.length}`);
    console.log(`Error servers: ${errorServers.length}`);

    if (onlineServers.length > 0) {
      console.log('\n✅ Online Servers:');
      onlineServers.forEach(server => {
        console.log(`  ${server.id}: ${server.responseTime}ms`);
        console.log(`    URL: ${server.url}`);
        console.log(`    Last timestamp: ${server.lastTimestamp}`);
      });

      // Find fastest server
      const fastestServer = onlineServers.reduce((prev, current) =>
        prev.responseTime < current.responseTime ? prev : current
      );

      console.log(
        `\n🚀 Fastest server: ${fastestServer.id} (${fastestServer.responseTime}ms)`
      );
    }

    if (offlineServers.length > 0 || errorServers.length > 0) {
      console.log('\n❌ Problem Servers:');
      [...offlineServers, ...errorServers].forEach(server => {
        console.log(`  ${server.id}: ${server.status}`);
        console.log(`    URL: ${server.url}`);
        console.log(`    Error: ${server.error}`);
      });
    }

    const monitoringReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: tsaServers.length,
        online: onlineServers.length,
        offline: offlineServers.length,
        errors: errorServers.length
      },
      servers: serverStatus,
      recommendation:
        onlineServers.length > 0
          ? `Use ${onlineServers[0].id} as primary TSA`
          : 'No TSA servers available'
    };

    console.log('\n📄 Monitoring report generated');

    return monitoringReport;
  } catch (error) {
    console.error('❌ TSA server monitoring failed:', error);
    throw error;
  }
}
```

## Callback API (Legacy)

### requestTimestamp() - Callback Version

```typescript
tsaClientPlugin.requestTimestamp(
  {
    data: btoa('Hello, TSA!'),
    hashAlgorithm: 'SHA-256',
    certReq: true
  },
  (event, response) => {
    if (response.success) {
      console.log('Callback: Timestamp obtained');
      console.log('Timestamp:', response.timestamp);
      console.log('Token:', response.token);
    } else {
      console.error('Callback: Timestamp failed:', response.reason);
    }
  },
  error => {
    console.error('Callback: Timestamp error:', error);
  }
);
```

### verifyTimestamp() - Callback Version

```typescript
tsaClientPlugin.verifyTimestamp(
  timestampToken,
  originalData,
  (event, response) => {
    if (response.valid) {
      console.log('Callback: Timestamp valid');
      console.log('Timestamp:', response.timestamp);
    } else {
      console.log('Callback: Timestamp invalid:', response.reason);
    }
  },
  error => {
    console.error('Callback: Verification error:', error);
  }
);
```

## Error Handling

### TSA Request Errors

```typescript
try {
  const result = await tsaClientPlugin.requestTimestampAsync(request);
} catch (error) {
  if (error.message.includes('TSA server unreachable')) {
    console.error('❌ TSA server is not reachable');
  } else if (error.message.includes('invalid hash algorithm')) {
    console.error('❌ Hash algorithm not supported by TSA');
  } else if (error.message.includes('policy not supported')) {
    console.error('❌ TSA policy not supported');
  } else if (error.message.includes('timeout')) {
    console.error('❌ TSA request timed out');
  } else if (error.message.includes('authentication failed')) {
    console.error('❌ TSA authentication failed');
  } else {
    console.error('❌ TSA request error:', error.message);
  }
}
```

### Timestamp Verification Errors

```typescript
try {
  const result = await tsaClientPlugin.verifyTimestampAsync(token, data);
} catch (error) {
  if (error.message.includes('invalid token format')) {
    console.error('❌ Timestamp token format is invalid');
  } else if (error.message.includes('data mismatch')) {
    console.error('❌ Data does not match timestamp');
  } else if (error.message.includes('certificate invalid')) {
    console.error('❌ TSA certificate is invalid');
  } else if (error.message.includes('timestamp expired')) {
    console.error('❌ Timestamp has expired');
  } else {
    console.error('❌ Timestamp verification error:', error.message);
  }
}
```

## Best Practices

1. **Multiple TSAs**: Use multiple TSA servers for redundancy
2. **Nonce Usage**: Always use nonces for uniqueness
3. **Certificate Inclusion**: Request TSA certificates for verification
4. **Hash Algorithms**: Use strong hash algorithms (SHA-256 or higher)
5. **Timeout Settings**: Set appropriate timeouts for network requests
6. **Verification**: Always verify timestamps after obtaining them
7. **Error Handling**: Implement robust error handling and retry logic
8. **Monitoring**: Monitor TSA server availability and performance
9. **Backup Strategy**: Have fallback TSA servers configured
10. **Documentation**: Document timestamp policies and procedures
