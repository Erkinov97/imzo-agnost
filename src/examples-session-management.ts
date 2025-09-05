/**
 * E-IMZO Session Management Examples
 * KeyId management and automatic unloading with configurable storage
 */

import { sessionManager } from './core/session-manager.js';
import { pfxPlugin } from './plugins/pfx.js';

// ===============================================
// 1. BASIC SESSION MANAGEMENT
// ===============================================

/**
 * PFX key ni yuklash va session da saqlash
 */
async function loadKeyWithSession() {
  try {
    // 6 soatga session da saqlash
    const keyResponse = await pfxPlugin.loadKeyAsync(
      'C:',
      '/keys/',
      'my-key.pfx',
      'user@example.com',
      6 // 6 hours session
    );

    console.log('✅ Key loaded:', keyResponse.keyId);

    // KeyId ni olish
    const certificateId = 'C:/keys/my-key.pfx:user@example.com';
    const keyId = pfxPlugin.getKeyId(certificateId);

    if (keyId) {
      // Password verify qilish
      await pfxPlugin.verifyPasswordAsync(keyId);
      console.log('✅ Password verified');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Certificate alias orqali keyId ni topish
 */
async function findAndVerifyKey(alias: string) {
  try {
    // Alias orqali certificate ID ni topish
    const certificateId = pfxPlugin.findCertificateId(alias);

    if (!certificateId) {
      console.log('❌ Certificate not found for alias:', alias);
      return;
    }

    // KeyId ni olish
    const keyId = pfxPlugin.getKeyId(certificateId);

    if (!keyId) {
      console.log('❌ Key not loaded for certificate:', certificateId);
      return;
    }

    // Password verify qilish
    await pfxPlugin.verifyPasswordAsync(keyId);
    console.log('✅ Key verified:', keyId);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ===============================================
// 2. STORAGE CONFIGURATION
// ===============================================

/**
 * Session storage ni localStorage ga o'zgartirish
 */
function configureLocalStorage() {
  sessionManager.updateConfig({
    storageType: 'localStorage',
    autoUnloadAfter: 8 * 60 * 60 * 1000, // 8 hours
    keyPrefix: 'my_app_eimzo_'
  });

  console.log('✅ Configured to use localStorage');
}

/**
 * Cookie storage ni sozlash
 */
function configureCookieStorage() {
  sessionManager.updateConfig({
    storageType: 'cookie',
    autoUnloadAfter: 6 * 60 * 60 * 1000, // 6 hours
    cookieOptions: {
      domain: 'example.com',
      path: '/',
      secure: true,
      sameSite: 'strict'
    }
  });

  console.log('✅ Configured to use cookies');
}

/**
 * Memory-only storage (server-side)
 */
function configureMemoryStorage() {
  sessionManager.updateConfig({
    storageType: 'memory',
    autoUnloadAfter: 4 * 60 * 60 * 1000 // 4 hours
  });

  console.log('✅ Configured to use memory-only storage');
}

// ===============================================
// 3. SESSION MONITORING
// ===============================================

/**
 * Active sessionlarni ko'rish
 */
function monitorActiveSessions() {
  const sessions = sessionManager.getActiveSessions();

  console.log(`📊 Active sessions: ${sessions.length}`);

  sessions.forEach(session => {
    const remainingMs = session.expiresAt - Date.now();
    const remainingHours = Math.round((remainingMs / (1000 * 60 * 60)) * 10) / 10;

    console.log(`🔑 ${session.certificateId}`);
    console.log(`   KeyId: ${session.keyId}`);
    console.log(`   Expires in: ${remainingHours} hours`);
    console.log(`   Auto-unload: ${session.autoUnload ? '✅' : '❌'}`);
  });
}

/**
 * Session ni kengaytirish
 */
function extendSession(certificateId: string) {
  const extended = sessionManager.extendSession(certificateId);

  if (extended) {
    console.log(`⏰ Extended session for ${certificateId}`);
  } else {
    console.log(`❌ Session not found: ${certificateId}`);
  }
}

/**
 * Session ni qo'lda o'chirish
 */
async function removeSession(certificateId: string) {
  await sessionManager.removeKeySession(certificateId);
  console.log(`🗑️ Removed session: ${certificateId}`);
}

// ===============================================
// 4. ADVANCED USAGE PATTERNS
// ===============================================

/**
 * Multiple keys bilan ishlash
 */
async function handleMultipleKeys() {
  try {
    // PFX keys
    const pfxKeys = [
      { disk: 'C:', path: '/keys/', name: 'company.pfx', alias: 'company@example.com' },
      { disk: 'C:', path: '/keys/', name: 'personal.pfx', alias: 'personal@example.com' }
    ];

    // Barcha keylarni yuklash
    for (const key of pfxKeys) {
      await pfxPlugin.loadKeyAsync(key.disk, key.path, key.name, key.alias, 6);
      console.log(`✅ Loaded: ${key.alias}`);
    }

    // Active sessionlarni monitoring qilish
    monitorActiveSessions();

    // Specific key bilan ishlash
    const companyKeyId = pfxPlugin.getKeyId('company@example.com');
    if (companyKeyId) {
      await pfxPlugin.verifyPasswordAsync(companyKeyId);
      console.log('✅ Company key verified');
    }
  } catch (error) {
    console.error('❌ Error handling multiple keys:', error);
  }
}

/**
 * Auto-cleanup monitoring
 */
function setupAutoCleanupMonitoring() {
  // Har 5 daqiqada session holatini tekshirish
  setInterval(
    () => {
      const sessions = sessionManager.getActiveSessions();
      const now = Date.now();

      sessions.forEach(session => {
        const remainingMs = session.expiresAt - now;
        const remainingMinutes = Math.round(remainingMs / (1000 * 60));

        if (remainingMinutes < 30) {
          console.log(
            `⚠️ Session expiring soon: ${session.certificateId} (${remainingMinutes}m remaining)`
          );
        }
      });
    },
    5 * 60 * 1000
  );

  console.log('📡 Auto-cleanup monitoring started');
}

/**
 * Application shutdown cleanup
 */
async function cleanupOnExit() {
  console.log('🧹 Cleaning up sessions...');

  // Barcha sessionlarni tozalash
  await sessionManager.clearAllSessions();

  // Session manager ni destroy qilish
  sessionManager.destroy();

  console.log('✅ Cleanup completed');
}

// ===============================================
// 5. UI INTEGRATION EXAMPLES
// ===============================================

/**
 * Checkbox "Save for 6 hours" integration
 */
async function loadKeyWithCheckbox(
  disk: string,
  path: string,
  name: string,
  alias: string,
  saveFor6Hours: boolean
) {
  try {
    const keyResponse = await pfxPlugin.loadKeyAsync(
      disk,
      path,
      name,
      alias,
      saveFor6Hours ? 6 : undefined // Faqat checkbox checked bo'lsa save qilish
    );

    if (saveFor6Hours) {
      console.log(`💾 Key saved for 6 hours: ${alias}`);
    } else {
      console.log(`🔑 Key loaded (no auto-save): ${alias}`);
    }

    return keyResponse.keyId;
  } catch (error) {
    console.error('❌ Error loading key:', error);
    throw error;
  }
}

/**
 * Session status UI helper
 */
function getSessionStatus(alias: string) {
  const certificateId = pfxPlugin.findCertificateId(alias);

  if (!certificateId) {
    return { status: 'not_found', message: 'Certificate not found' };
  }

  const keyId = pfxPlugin.getKeyId(certificateId);

  if (!keyId) {
    return { status: 'not_loaded', message: 'Key not loaded' };
  }

  const sessions = sessionManager.getActiveSessions();
  const session = sessions.find(s => s.certificateId === certificateId);

  if (!session) {
    return { status: 'loaded', message: 'Key loaded (no auto-save)' };
  }

  const remainingMs = session.expiresAt - Date.now();
  const remainingHours = Math.round((remainingMs / (1000 * 60 * 60)) * 10) / 10;

  return {
    status: 'saved',
    message: `Key saved (expires in ${remainingHours}h)`,
    remainingHours,
    keyId
  };
}

// ===============================================
// EXPORT ALL EXAMPLES
// ===============================================

export {
  cleanupOnExit,
  configureCookieStorage,
  // Storage configuration
  configureLocalStorage,
  configureMemoryStorage,
  extendSession,
  findAndVerifyKey,
  getSessionStatus,
  // Advanced patterns
  handleMultipleKeys,
  // UI integration
  loadKeyWithCheckbox,
  // Basic usage
  loadKeyWithSession,
  // Session monitoring
  monitorActiveSessions,
  removeSession,
  setupAutoCleanupMonitoring
};

// ===============================================
// AUTO-STARTUP EXAMPLE
// ===============================================

/**
 * Application startup configuration
 */
export function initializeEIMZOSessions() {
  // Default configuration
  sessionManager.updateConfig({
    storageType: 'sessionStorage',
    autoUnloadAfter: 6 * 60 * 60 * 1000, // 6 hours
    keyPrefix: 'eimzo_key_'
  });

  // Setup monitoring
  setupAutoCleanupMonitoring();

  // Cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      void cleanupOnExit();
    });
  }

  console.log('🚀 E-IMZO Session Management initialized');
}
