# 🔐 E-IMZO Session Management

Avtomatik key lifecycle management va 6 soatlik auto-unload funksiyasi bilan PFX
keylarni boshqarish.

## 📋 Asosiy Funksiyalar

- ✅ **Automatic Key Lifecycle** - 6 soat avtomatik unload
- ✅ **Configurable Storage** - sessionStorage, localStorage, cookie, memory
- ✅ **Key Session Management** - keyId ni saqlash va topish
- ✅ **Auto-cleanup** - expired sessionlarni avtomatik tozalash
- ✅ **Browser & Server Support** - universal ishlash

## 🚀 Quick Start

### 1. Basic Usage

```typescript
import { pfxPlugin, sessionManager } from 'e-imzo-agnostic';

// Key ni yuklash va 6 soatga saqlash
const keyResponse = await pfxPlugin.loadKeyAsync(
  'C:',
  '/keys/',
  'my-key.pfx',
  'user@example.com',
  6 // 6 hours auto-save
);

// KeyId ni olish
const keyId = pfxPlugin.getKeyId('user@example.com');

// Password verify qilish
if (keyId) {
  await pfxPlugin.verifyPasswordAsync(keyId);
}
```

### 2. Storage Configuration

```typescript
// localStorage ga o'tkazish
sessionManager.updateConfig({
  storageType: 'localStorage',
  autoUnloadAfter: 8 * 60 * 60 * 1000, // 8 hours
  keyPrefix: 'my_app_eimzo_'
});

// Cookie storage
sessionManager.updateConfig({
  storageType: 'cookie',
  cookieOptions: {
    domain: 'example.com',
    secure: true,
    sameSite: 'strict'
  }
});
```

## 💡 Key Management Patterns

### Certificate ID orqali KeyId olish

```typescript
// Method 1: Direct certificate ID
const certificateId = 'C:/keys/my-key.pfx:user@example.com';
const keyId = pfxPlugin.getKeyId(certificateId);

// Method 2: Alias orqali qidirish
const certificateId = pfxPlugin.findCertificateId('user@example.com');
const keyId = pfxPlugin.getKeyId(certificateId);

// Method 3: Active sessionlarni ko'rish
const sessions = sessionManager.getActiveSessions();
sessions.forEach(session => {
  console.log(`KeyId: ${session.keyId}, Certificate: ${session.certificateId}`);
});
```

### "Save for 6 hours" Checkbox Pattern

```typescript
async function loadKeyWithCheckbox(
  disk: string,
  path: string,
  name: string,
  alias: string,
  saveFor6Hours: boolean
) {
  const keyResponse = await pfxPlugin.loadKeyAsync(
    disk,
    path,
    name,
    alias,
    saveFor6Hours ? 6 : undefined // Conditional auto-save
  );

  if (saveFor6Hours) {
    console.log('💾 Key saved for 6 hours');
  }

  return keyResponse.keyId;
}
```

## 🔧 Advanced Configuration

### Multiple Storage Options

```typescript
// Browser environment
sessionManager.updateConfig({
  storageType: 'sessionStorage', // Lost on tab close
  autoUnloadAfter: 6 * 60 * 60 * 1000
});

// Persistent browser storage
sessionManager.updateConfig({
  storageType: 'localStorage', // Persistent across sessions
  autoUnloadAfter: 24 * 60 * 60 * 1000 // 24 hours
});

// Server environment
sessionManager.updateConfig({
  storageType: 'memory', // Memory only, no persistence
  autoUnloadAfter: 4 * 60 * 60 * 1000 // 4 hours
});
```

### Session Monitoring

```typescript
// Active sessionlar
const sessions = sessionManager.getActiveSessions();
console.log(`Active sessions: ${sessions.length}`);

// Session holatini tekshirish
function getSessionStatus(alias: string) {
  const certificateId = pfxPlugin.findCertificateId(alias);

  if (!certificateId) {
    return { status: 'not_found' };
  }

  const keyId = pfxPlugin.getKeyId(certificateId);

  if (!keyId) {
    return { status: 'not_loaded' };
  }

  const sessions = sessionManager.getActiveSessions();
  const session = sessions.find(s => s.certificateId === certificateId);

  if (session) {
    const remainingHours = (session.expiresAt - Date.now()) / (1000 * 60 * 60);
    return {
      status: 'saved',
      remainingHours: Math.round(remainingHours * 10) / 10,
      keyId
    };
  }

  return { status: 'loaded' };
}
```

## 🛠️ API Reference

### PfxPlugin Methods

```typescript
// Session management qo'shilgan methodlar
pfxPlugin.getKeyId(certificateId: string): string | null
pfxPlugin.findCertificateId(searchTerm: string): string | null
pfxPlugin.getActiveSessions(): KeySession[]
pfxPlugin.clearAllSessions(): Promise<void>
pfxPlugin.updateSessionConfig(config: Partial<SessionConfig>): void

// Extended loadKeyAsync with session support
pfxPlugin.loadKeyAsync(
  disk: string,
  path: string,
  name: string,
  alias: string,
  saveForHours?: number
): Promise<KeyResponse>
```

### SessionManager Methods

```typescript
// Session boshqaruvi
sessionManager.saveKeySession(keyId, certificateId, certificate, autoUnload): void
sessionManager.getKeyId(certificateId: string): string | null
sessionManager.getActiveSessions(): KeySession[]
sessionManager.extendSession(certificateId: string): boolean
sessionManager.removeKeySession(certificateId: string): Promise<void>
sessionManager.clearAllSessions(): Promise<void>

// Configuration
sessionManager.updateConfig(config: Partial<SessionConfig>): void
sessionManager.destroy(): void
```

## 🎯 Use Cases

### 1. Web Application

```typescript
// Application startup
import { initializeEIMZOSessions } from 'e-imzo-agnostic/examples-session-management';

initializeEIMZOSessions();

// Key loading with UI
const saveCheckbox = document.getElementById('save-6-hours');
const loadButton = document.getElementById('load-key');

loadButton.addEventListener('click', async () => {
  await loadKeyWithCheckbox(
    'C:',
    '/keys/',
    'user.pfx',
    'user@example.com',
    saveCheckbox.checked
  );
});
```

### 2. Multiple Keys Management

```typescript
const keys = [
  {
    disk: 'C:',
    path: '/keys/',
    name: 'company.pfx',
    alias: 'company@example.com'
  },
  {
    disk: 'C:',
    path: '/keys/',
    name: 'personal.pfx',
    alias: 'personal@example.com'
  }
];

// Load all keys
for (const key of keys) {
  await pfxPlugin.loadKeyAsync(key.disk, key.path, key.name, key.alias, 6);
}

// Use specific key
const companyKeyId = pfxPlugin.getKeyId('company@example.com');
if (companyKeyId) {
  await pfxPlugin.verifyPasswordAsync(companyKeyId);
  // Use for signing...
}
```

### 3. Auto-cleanup & Monitoring

```typescript
// Monitor expiring sessions
setInterval(
  () => {
    const sessions = sessionManager.getActiveSessions();

    sessions.forEach(session => {
      const remainingMs = session.expiresAt - Date.now();
      const remainingMinutes = Math.round(remainingMs / (1000 * 60));

      if (remainingMinutes < 30) {
        console.warn(
          `Session expiring soon: ${session.certificateId} (${remainingMinutes}m)`
        );
      }
    });
  },
  5 * 60 * 1000
); // Every 5 minutes

// Application cleanup
window.addEventListener('beforeunload', async () => {
  await sessionManager.clearAllSessions();
  sessionManager.destroy();
});
```

## 🔒 Security Features

- **Auto-unload**: Keylar 6 soat after avtomatik unload bo'ladi
- **Secure Storage**: Cookie options bilan secure, httpOnly, sameSite
- **Memory Cleanup**: Browser tab yopilganda avtomatik cleanup
- **Session Isolation**: Har bir certificate alohida session
- **Configurable Expiry**: Custom expiration times

## 🌟 Benefits

1. **Xavfsizlik**: Avtomatik key unloading
2. **Qulaylik**: KeyId ni qidirishga hojat yo'q
3. **Moslashuvchanlik**: Ko'p storage turları
4. **Monitoring**: Session holatini kuzatish
5. **Performance**: Efficient cleanup va memory management

Bu session management sistem E-IMZO keylarni xavfsiz va qulaylik bilan
boshqarish imkonini beradi! 🚀
