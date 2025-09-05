/**
 * Global browser setup for E-IMZO Agnostic
 * Bu fayl browserda window obyektiga global o'zgaruvchilarni qo'shadi
 */

import EIMZOClient from './e-imzo-client.js';
import CAPIWS from './e-imzo/capiws.js';
import { eimzoApi } from './eimzo-api.js';

// Global types
declare global {
  interface Window {
    CAPIWS: typeof CAPIWS;
    EIMZOClient: typeof EIMZOClient;
    capiws: typeof CAPIWS;
    eimzoApi: typeof eimzoApi;
    imzoPlugins?: Record<string, unknown>;
  }
}

/**
 * Setup global objects in browser environment
 */
export function setupGlobalObjects(): void {
  // Browser environment tekshirish
  if (typeof window !== 'undefined') {
    const win = window;

    // Legacy global objects (boshqalar ishlatganidek)
    win.CAPIWS = CAPIWS;
    win.EIMZOClient = EIMZOClient;

    // Lowercase alias for convenience
    win.capiws = CAPIWS;

    // Modern API
    win.eimzoApi = eimzoApi;

    // Development mode - barcha pluginlarni expose qilish (browser-safe)
    const isNodeJS =
      typeof process !== 'undefined' &&
      typeof process.versions === 'object' &&
      Boolean(process.versions.node);
    const isDev = isNodeJS && process.env.NODE_ENV === 'development';

    if (isDev) {
      win.imzoPlugins = {
        version: '1.0.0',
        loaded: true,
        plugins: [],
        debug: true
      };

      console.info('🔧 E-IMZO Agnostic Library - Development Mode');
      console.info('Available APIs:', {
        CAPIWS: 'Main CAPIWS client for E-IMZO communication',
        EIMZOClient: 'Legacy E-IMZO client wrapper',
        capiws: 'Legacy alias for CAPIWS',
        eimzoApi: 'Modern plugin-based E-IMZO API',
        imzoPlugins: 'Plugin system information'
      });
    }

    // Log successful initialization
    if (isDev) {
      console.info('✅ E-IMZO Global Setup - Success');
      console.info('Global status:', {
        CAPIWS: Boolean(win.CAPIWS),
        EIMZOClient: Boolean(win.EIMZOClient),
        capiws: Boolean(win.capiws),
        eimzoApi: Boolean(win.eimzoApi),
        imzoPlugins: Boolean(win.imzoPlugins)
      });
    }
  }
}

// Auto-setup browser globals
setupGlobalObjects();
