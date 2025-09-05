// Legacy exports for backward compatibility
export {
  default as EIMZOClient,
  dates,
  type CertificateInfo,
  type EIMZOClientType
} from './e-imzo-client.js';
export { default as CAPIWS } from './e-imzo/capiws.js';

// New modern API
export * from './eimzo-api.js';
export { EIMZOApi, default as eimzoApi } from './eimzo-api.js';

// Core types and classes
export { EIMZOPlugin, PluginManager } from './core/plugin-base.js';
export * from './core/types.js';

// Session Management
export {
  EIMZOSessionManager,
  sessionManager,
  type KeySession,
  type SessionConfig,
  type StorageType
} from './core/session-manager.js';

// Global setup for browser (avtomatik ishga tushadi)
import './global.js';
