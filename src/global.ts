/**
 * Global browser setup for E-IMZO Agnostic
 * Bu fayl browserda window obyektiga global o'zgaruvchilarni qo'shadi
 */

import CAPIWS from './e-imzo/capiws';
import EIMZOClient from './e-imzo-client';
import { eimzoApi } from './eimzo-api';

// Global types
declare global {
  interface Window {
    CAPIWS: typeof CAPIWS;
    EIMZOClient: typeof EIMZOClient;
    capiws: typeof CAPIWS;
    eimzoApi: typeof eimzoApi;
    imzoPlugins?: any;
  }
}

/**
 * Setup global objects in browser environment
 */
export function setupGlobalObjects(): void {
  // Browser environment tekshirish
  if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
    const win = (globalThis as any).window;

    // Legacy global objects (boshqalar ishlatganidek)
    win.CAPIWS = CAPIWS;
    win.EIMZOClient = EIMZOClient;

    // Lowercase alias for convenience
    win.capiws = CAPIWS;

    // Modern API
    win.eimzoApi = eimzoApi;

    // Development mode - barcha pluginlarni expose qilish
    const isDev =
      typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';

    if (isDev) {
      win.imzoPlugins = {
        pfx: eimzoApi.pfx,
        pkcs7: eimzoApi.pkcs7,
        ftjc: eimzoApi.ftjc,
        cryptoauth: eimzoApi.cryptoauth,
        x509: eimzoApi.x509,
        idcard: eimzoApi.idcard,
        tsaclient: eimzoApi.tsaclient,
        fileio: eimzoApi.fileio,
        crl: eimzoApi.crl,
        cipher: eimzoApi.cipher,
        pki: eimzoApi.pki,
        pkcs10: eimzoApi.pkcs10,
        truststore: eimzoApi.truststore,
        tunnel: eimzoApi.tunnel,
        ytks: eimzoApi.ytks
      };
    }

    // Console uchun debug ma'lumotlari
    console.log('🚀 E-IMZO Agnostic yuklandi!');
    console.log('Global obyektlar:', {
      CAPIWS: !!win.CAPIWS,
      EIMZOClient: !!win.EIMZOClient,
      capiws: !!win.capiws,
      eimzoApi: !!win.eimzoApi,
      imzoPlugins: !!win.imzoPlugins
    });
  }
}

// Avtomatik ravishda global obyektlarni o'rnatish
setupGlobalObjects();

export { CAPIWS, EIMZOClient, eimzoApi };
