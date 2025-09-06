# PFX Plugin API Reference

PFX (Personal Information Exchange) plugin PFX formatidagi key storage fayllari
bilan ishlash uchun mo'ljallangan.

## Overview

PFX plugin quyidagi asosiy funksiyalarni taqdim etadi:

- PFX fayllarni ko'rish va boshqarish
- Kalitlarni yuklash va unload qilish
- Sertifikatlarni ro'yxatlash
- Parol tekshirish va o'zgartirish
- Session management (avtomatik 6 soatlik unload)

## Import

```typescript
// ES6 import
import { pfxPlugin } from 'imzo-agnost';

// CommonJS
const { pfxPlugin } = require('imzo-agnost');

// Global object (browser)
window.eimzoApi.pfx;
```

## Types

```typescript
interface PfxCertificate {
  disk: string;
  path: string;
  name: string;
  alias: string;
  serialNumber: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  // ... other certificate properties
}

interface DiskInfo {
  name: string;
  label?: string;
  available: boolean;
}

interface PfxListResponse {
  success: true;
  certificates: PfxCertificate[];
}

interface KeyResponse {
  success: true;
  keyId: string;
}
```

## Methods

### Disk Operations

#### listDisks() / listDisksAsync()

Mavjud disklarni ro'yxatlash.

**Callback API:**

```typescript
pfxPlugin.listDisks(
  (event, response) => {
    console.log('Available disks:', response.data.disks);
    response.data.disks.forEach(disk => {
      console.log(`${disk.name}: ${disk.label || 'No label'}`);
    });
  },
  error => {
    console.error('Error listing disks:', error);
  }
);
```

**Promise API:**

```typescript
try {
  const result = await pfxPlugin.listDisksAsync();
  console.log('Available disks:', result.disks);

  result.disks.forEach(disk => {
    console.log(
      `Disk: ${disk.name} (${disk.available ? 'Available' : 'Unavailable'})`
    );
  });
} catch (error) {
  console.error('Error:', error);
}
```

### Certificate Operations

#### listCertificates() / listCertificatesAsync()

Berilgan diskdan sertifikatlarni ro'yxatlash.

**Callback API:**

```typescript
pfxPlugin.listCertificates(
  'C:', // disk name
  (event, response) => {
    console.log('Certificates:', response.data.certificates);
    response.data.certificates.forEach(cert => {
      console.log(`${cert.alias}: ${cert.subject}`);
    });
  },
  error => {
    console.error('Error:', error);
  }
);
```

**Promise API:**

```typescript
try {
  const result = await pfxPlugin.listCertificatesAsync('C:');
  console.log('Certificates found:', result.certificates.length);

  result.certificates.forEach(cert => {
    console.log(`Certificate: ${cert.alias}`);
    console.log(`  Subject: ${cert.subject}`);
    console.log(`  Valid: ${cert.validFrom} - ${cert.validTo}`);
    console.log(`  Path: ${cert.disk}${cert.path}${cert.name}`);
  });
} catch (error) {
  console.error('Error:', error);
}
```

#### listAllCertificates() / listAllCertificatesAsync()

Barcha disklardan sertifikatlarni ro'yxatlash.

**Callback API:**

```typescript
pfxPlugin.listAllCertificates(
  (event, response) => {
    console.log('All certificates:', response.data.certificates);
  },
  error => {
    console.error('Error:', error);
  }
);
```

**Promise API:**

```typescript
try {
  const result = await pfxPlugin.listAllCertificatesAsync();
  console.log(`Total certificates: ${result.certificates.length}`);

  // Group by disk
  const byDisk = result.certificates.reduce(
    (acc, cert) => {
      if (!acc[cert.disk]) acc[cert.disk] = [];
      acc[cert.disk].push(cert);
      return acc;
    },
    {} as Record<string, PfxCertificate[]>
  );

  Object.entries(byDisk).forEach(([disk, certs]) => {
    console.log(`${disk}: ${certs.length} certificates`);
  });
} catch (error) {
  console.error('Error:', error);
}
```

### Key Management

#### loadKey() / loadKeyAsync()

Kalitni yuklash va keyId olish.

**Enhanced API (Session Management):**

```typescript
// 6 soatga session da saqlash bilan
try {
  const keyResult = await pfxPlugin.loadKeyAsync(
    'C:', // disk
    '/keys/', // path
    'my-key.pfx', // name
    'user@example.com', // alias
    6 // saveForHours (optional)
  );

  console.log('Key loaded:', keyResult.keyId);

  // KeyId ni session dan olish
  const certificateId = 'C:/keys/my-key.pfx:user@example.com';
  const cachedKeyId = pfxPlugin.getKeyId(certificateId);
  console.log('Cached keyId:', cachedKeyId);
} catch (error) {
  console.error('Error loading key:', error);
}
```

**Callback API:**

```typescript
pfxPlugin.loadKey(
  'C:',
  '/certificates/',
  'company.pfx',
  'company@example.com',
  (event, response) => {
    console.log('Key loaded with ID:', response.data.keyId);

    // Use keyId for signing or other operations
    // ... signing operations
  },
  error => {
    console.error('Failed to load key:', error);
  },
  6 // saveForHours (optional)
);
```

**Legacy Promise API:**

```typescript
try {
  const keyResult = await pfxPlugin.loadKeyAsync(
    'C:',
    '/keys/',
    'user.pfx',
    'user@company.com'
    // No session management
  );

  console.log('Key loaded:', keyResult.keyId);
} catch (error) {
  console.error('Error:', error);
}
```

#### unloadKey() / unloadKeyAsync()

Kalitni unload qilish.

**Callback API:**

```typescript
pfxPlugin.unloadKey(
  keyId,
  (event, response) => {
    console.log('Key unloaded successfully');
  },
  error => {
    console.error('Error unloading key:', error);
  }
);
```

**Promise API:**

```typescript
try {
  await pfxPlugin.unloadKeyAsync(keyId);
  console.log('Key unloaded successfully');
} catch (error) {
  console.error('Error unloading key:', error);
}
```

### Password Operations

#### verifyPassword() / verifyPasswordAsync()

Kalit uchun parolni tekshirish.

**Callback API:**

```typescript
pfxPlugin.verifyPassword(
  keyId,
  (event, response) => {
    console.log('Password verified successfully');
  },
  error => {
    console.error('Password verification failed:', error);
  }
);
```

**Promise API:**

```typescript
try {
  await pfxPlugin.verifyPasswordAsync(keyId);
  console.log('Password is correct');
} catch (error) {
  console.error('Invalid password or error:', error);
}
```

#### changePassword() / changePasswordAsync()

Kalit uchun parolni o'zgartirish.

**Callback API:**

```typescript
pfxPlugin.changePassword(
  keyId,
  (event, response) => {
    console.log('Password changed successfully');
  },
  error => {
    console.error('Failed to change password:', error);
  }
);
```

**Promise API:**

```typescript
try {
  await pfxPlugin.changePasswordAsync(keyId);
  console.log('Password changed successfully');
} catch (error) {
  console.error('Failed to change password:', error);
}
```

### PFX File Creation

#### savePfx() / savePfxAsync()

Yangi PFX fayl yaratish.

**Callback API:**

```typescript
pfxPlugin.savePfx(
  'C:', // disk
  '/output/', // path
  'new-certificate.pfx', // name
  'user@newcompany.com', // alias
  existingKeyId, // existing key ID
  'newPassword123', // new password
  subjectCertBase64, // subject certificate
  caCertBase64, // CA certificate
  rootCertBase64, // root certificate
  (event, response) => {
    console.log('PFX file created successfully');
  },
  error => {
    console.error('Failed to create PFX:', error);
  }
);
```

**Promise API:**

```typescript
try {
  await pfxPlugin.savePfxAsync(
    'C:',
    '/backup/',
    'backup.pfx',
    'backup@company.com',
    keyId,
    'securePassword',
    subjectCert64,
    caCert64,
    rootCert64
  );
  console.log('Backup PFX created');
} catch (error) {
  console.error('Backup failed:', error);
}
```

#### saveTemporaryPfx() / saveTemporaryPfxAsync()

Vaqtinchalik self-signed PFX yaratish.

**Promise API:**

```typescript
try {
  await pfxPlugin.saveTemporaryPfxAsync(
    'C:',
    '/temp/',
    'temp.pfx',
    'temp@test.com',
    keyId,
    'tempPassword',
    'CN=Test User,O=Test Org,C=UZ'
  );
  console.log('Temporary PFX created');
} catch (error) {
  console.error('Failed to create temp PFX:', error);
}
```

## Session Management Methods

### getKeyId()

Certificate ID orqali keyId ni olish.

```typescript
// Direct certificate ID
const keyId = pfxPlugin.getKeyId('C:/keys/my-key.pfx:user@example.com');

// Alias orqali qidirish
const keyId2 = pfxPlugin.getKeyId('user@example.com');

if (keyId) {
  console.log('Found keyId:', keyId);
  // Use for verification or signing
  await pfxPlugin.verifyPasswordAsync(keyId);
} else {
  console.log('Key not found or expired');
}
```

### findCertificateId()

Alias, name yoki qisman ID orqali certificate topish.

```typescript
// Alias orqali
const certId = pfxPlugin.findCertificateId('user@example.com');

// Name orqali
const certId2 = pfxPlugin.findCertificateId('my-key.pfx');

// Qisman path orqali
const certId3 = pfxPlugin.findCertificateId('/keys/company');

if (certId) {
  console.log('Found certificate:', certId);
  const keyId = pfxPlugin.getKeyId(certId);
}
```

### getActiveSessions()

Barcha faol sessionlarni ko'rish.

```typescript
const sessions = pfxPlugin.getActiveSessions();

console.log(`Active sessions: ${sessions.length}`);

sessions.forEach(session => {
  const remainingHours = (session.expiresAt - Date.now()) / (1000 * 60 * 60);
  console.log(`Certificate: ${session.certificateId}`);
  console.log(`KeyId: ${session.keyId}`);
  console.log(`Expires in: ${Math.round(remainingHours * 10) / 10} hours`);
  console.log(`Auto-unload: ${session.autoUnload ? 'Yes' : 'No'}`);
});
```

### updateSessionConfig()

Session sozlamalarini o'zgartirish.

```typescript
// localStorage ga o'tkazish
pfxPlugin.updateSessionConfig({
  storageType: 'localStorage',
  autoUnloadAfter: 8 * 60 * 60 * 1000, // 8 hours
  keyPrefix: 'myapp_pfx_'
});

// Cookie storage
pfxPlugin.updateSessionConfig({
  storageType: 'cookie',
  cookieOptions: {
    domain: 'example.com',
    secure: true,
    sameSite: 'strict'
  }
});
```

### clearAllSessions()

Barcha sessionlarni tozalash.

```typescript
await pfxPlugin.clearAllSessions();
console.log('All sessions cleared');
```

## Complete Examples

### Certificate Selection and Key Loading

```typescript
async function selectAndLoadCertificate() {
  try {
    // 1. List all available certificates
    const allCerts = await pfxPlugin.listAllCertificatesAsync();

    if (allCerts.certificates.length === 0) {
      throw new Error('No certificates found');
    }

    // 2. Filter valid certificates
    const validCerts = allCerts.certificates.filter(cert => {
      const validTo = new Date(cert.validTo);
      return validTo > new Date();
    });

    console.log(`Found ${validCerts.length} valid certificates`);

    // 3. Select first valid certificate (or let user choose)
    const selectedCert = validCerts[0];
    console.log('Selected certificate:', selectedCert.alias);

    // 4. Load key with session management
    const keyResult = await pfxPlugin.loadKeyAsync(
      selectedCert.disk,
      selectedCert.path,
      selectedCert.name,
      selectedCert.alias,
      6 // Save for 6 hours
    );

    console.log('Key loaded successfully:', keyResult.keyId);

    // 5. Verify password
    await pfxPlugin.verifyPasswordAsync(keyResult.keyId);
    console.log('Password verified');

    return {
      certificate: selectedCert,
      keyId: keyResult.keyId
    };
  } catch (error) {
    console.error('Certificate selection failed:', error);
    throw error;
  }
}
```

### Session Management Example

```typescript
async function demonstrateSessionManagement() {
  // Load key with session
  const keyResult = await pfxPlugin.loadKeyAsync(
    'C:',
    '/keys/',
    'user.pfx',
    'user@example.com',
    6
  );

  console.log('Key loaded and saved to session');

  // Later, get keyId from session
  const keyId = pfxPlugin.getKeyId('user@example.com');

  if (keyId) {
    console.log('Key retrieved from session:', keyId);

    // Use key for operations
    await pfxPlugin.verifyPasswordAsync(keyId);

    // Check session status
    const sessions = pfxPlugin.getActiveSessions();
    const userSession = sessions.find(s =>
      s.certificateId.includes('user@example.com')
    );

    if (userSession) {
      const remainingMs = userSession.expiresAt - Date.now();
      const remainingHours = remainingMs / (1000 * 60 * 60);
      console.log(`Session expires in ${remainingHours.toFixed(1)} hours`);
    }
  } else {
    console.log('Key session expired or not found');
  }
}
```

### Error Handling Patterns

```typescript
async function robustKeyLoading(cert: PfxCertificate) {
  let keyId: string | null = null;

  try {
    // Try to get from session first
    keyId = pfxPlugin.getKeyId(cert.alias);

    if (keyId) {
      console.log('Using cached key from session');
      // Verify it's still valid
      await pfxPlugin.verifyPasswordAsync(keyId);
      return keyId;
    }

    // Load new key
    console.log('Loading new key...');
    const result = await pfxPlugin.loadKeyAsync(
      cert.disk,
      cert.path,
      cert.name,
      cert.alias,
      6
    );

    keyId = result.keyId;

    // Verify password
    await pfxPlugin.verifyPasswordAsync(keyId);

    return keyId;
  } catch (error) {
    // Handle specific errors
    if (error.message.includes('password')) {
      throw new Error('Invalid password for certificate');
    } else if (error.message.includes('not found')) {
      throw new Error('Certificate file not found');
    } else if (error.message.includes('expired')) {
      throw new Error('Certificate has expired');
    } else {
      throw new Error(`Key loading failed: ${error.message}`);
    }
  }
}
```

## Migration Guide

### From Legacy API

**Old way:**

```typescript
// Manual disk and path handling
eimzoApi.pfx.listCertificates('C:', onSuccess, onError);

// Manual keyId tracking
let currentKeyId = null;
eimzoApi.pfx.loadKey(
  disk,
  path,
  name,
  alias,
  (event, response) => {
    currentKeyId = response.data.keyId;
  },
  onError
);
```

**New way:**

```typescript
// Simplified with auto session management
const certs = await pfxPlugin.listCertificatesAsync('C:');

const keyResult = await pfxPlugin.loadKeyAsync(
  disk,
  path,
  name,
  alias,
  6 // Auto session management
);

// Later retrieve without manual tracking
const keyId = pfxPlugin.getKeyId(alias);
```

## Error Codes

Common error scenarios:

- `Certificate not found` - PFX fayl topilmadi
- `Invalid password` - Noto'g'ri parol
- `Certificate expired` - Sertifikat muddati tugagan
- `Key already loaded` - Kalit allaqachon yuklangan
- `Disk not available` - Disk mavjud emas
- `Session expired` - Session muddati tugagan

## Best Practices

1. **Session Management**: Har doim `saveForHours` parametrini ishlating
2. **Error Handling**: Specific error typelarini handle qiling
3. **Certificate Validation**: Muddatini tekshiring
4. **Memory Management**: Auto-cleanup dan foydalaning
5. **Security**: Sensitive operatsiyalar uchun password verification qiling
