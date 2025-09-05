// Legacy exports for backward compatibility
export { default as CAPIWS } from './e-imzo/capiws';
export {
  default as EIMZOClient,
  dates,
  type CertificateInfo,
  type EIMZOClientType
} from './e-imzo-client';

// New modern API
export { default as eimzoApi, EIMZOApi } from './eimzo-api';
export * from './eimzo-api';

// Core types and classes
export * from './core/types';
export { EIMZOPlugin, PluginManager } from './core/plugin-base';

// Global setup for browser (avtomatik ishga tushadi)
import './global';
