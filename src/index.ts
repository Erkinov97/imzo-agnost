// Legacy exports for backward compatibility
export {
  dates,
  default as EIMZOClient,
  type CertificateInfo,
  type EIMZOClientType
} from './e-imzo-client.js';
export { default as CAPIWS } from './e-imzo/capiws.js';

// New modern API
export * from './eimzo-api.js';
export { default as eimzoApi, EIMZOApi } from './eimzo-api.js';

// Core types and classes
export { EIMZOPlugin, PluginManager } from './core/plugin-base.js';
export * from './core/types.js';

// Global setup for browser (avtomatik ishga tushadi)
import './global.js';
