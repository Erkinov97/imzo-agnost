import { PluginManager, type EIMZOPlugin } from './core/plugin-base.js';
import EIMZOClient from './e-imzo-client.js';
import CAPIWS from './e-imzo/capiws.js';

// Type definitions for E-IMZO API responses
interface VersionResponse {
  success: boolean;
  major: string;
  minor: string;
  reason?: string;
}

interface ApiResponse {
  success: boolean;
  reason?: string;
  [key: string]: unknown;
}

// Import all plugins to ensure they're registered
import './plugins/certkey.js';
import './plugins/cipher.js';
import './plugins/crl.js';
import './plugins/cryptoauth.js';
import './plugins/fileio.js';
import './plugins/ftjc.js';
import './plugins/idcard.js';
import './plugins/pfx.js';
import './plugins/pkcs10.js';
import './plugins/pkcs7.js';
import './plugins/pki.js';
import './plugins/truststore-jks.js';
import './plugins/truststore.js';
import './plugins/tsaclient.js';
import './plugins/tunnel.js';
import './plugins/x509.js';
import './plugins/ytks.js';

// Re-export plugin instances for direct access
export { ftjcPlugin } from './plugins/ftjc';
export { pfxPlugin } from './plugins/pfx';
export { pkcs7Plugin } from './plugins/pkcs7';
// Note: cryptoauth and other plugins use class-based registration, instances available via PluginManager

// Re-export types
export * from './core/types';
export type { CertKeyPlugin } from './plugins/certkey';
export type { CipherPlugin } from './plugins/cipher';
export type { CertificateStatus, CRLInfo, CRLPlugin } from './plugins/crl';
export type { CryptoAuthPlugin } from './plugins/cryptoauth';
export type { FileIOPlugin } from './plugins/fileio';
export type { FtjcPlugin, FtjcTokenInfo } from './plugins/ftjc';
export type { IDCardPlugin, ReaderInfo } from './plugins/idcard';
export type { PfxCertificate, PfxPlugin } from './plugins/pfx';
export type { KeyPairInfo, PKCS10Info, PKCS10Plugin } from './plugins/pkcs10';
export type { Pkcs7Plugin, Pkcs7Response } from './plugins/pkcs7';
export type { PKIPlugin } from './plugins/pki';
export type { TruststorePlugin } from './plugins/truststore';
export type { TruststoreJKSPlugin } from './plugins/truststore-jks';
export type { TimestampTokenInfo, TSAClientPlugin } from './plugins/tsaclient.js';
export type { TunnelPlugin } from './plugins/tunnel';
export type { X509Plugin } from './plugins/x509';
export type { YTKSPlugin } from './plugins/ytks.js';

/**
 * Main E-IMZO API class providing unified access to all plugins
 */
export class EIMZOApi {
  // Core CAPIWS access
  public readonly capiws = CAPIWS;

  // Legacy client for backward compatibility
  public readonly client = EIMZOClient;

  // Plugin manager for accessing plugins
  public readonly plugins = PluginManager;

  // Direct plugin access
  public readonly pfx = PluginManager.get('pfx');
  public readonly pkcs7 = PluginManager.get('pkcs7');
  public readonly ftjc = PluginManager.get('ftjc');
  public readonly cryptoauth = PluginManager.get('cryptoauth');
  public readonly truststoreJks = PluginManager.get('truststore-jks');
  public readonly tunnel = PluginManager.get('tunnel');
  public readonly certkey = PluginManager.get('certkey');
  public readonly x509 = PluginManager.get('x509');
  public readonly cipher = PluginManager.get('cipher');
  public readonly pki = PluginManager.get('pki');
  public readonly pkcs10 = PluginManager.get('pkcs10');
  public readonly idcard = PluginManager.get('idcard');
  public readonly truststore = PluginManager.get('truststore');
  public readonly crl = PluginManager.get('crl');
  public readonly fileio = PluginManager.get('fileio');
  public readonly tsaclient = PluginManager.get('tsaclient');
  public readonly ytks = PluginManager.get('ytks');

  /**
   * Initialize E-IMZO API and check version
   */
  async initialize(): Promise<{ major: string; minor: string }> {
    return new Promise((resolve, reject) => {
      this.client.checkVersion(
        (major, minor) => resolve({ major, minor }),
        (error, reason) => reject(new Error(reason ?? 'Version check failed'))
      );
    });
  }

  /**
   * Install API keys
   */
  async installApiKeys(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.installApiKeys(
        () => resolve(),
        (error, reason) => reject(new Error(reason ?? 'API key installation failed'))
      );
    });
  }

  /**
   * Check if ID card is plugged in
   */
  async isIdCardPluggedIn(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.idCardIsPLuggedIn(
        isPlugged => resolve(isPlugged),
        (error, reason) => reject(new Error(reason ?? 'ID card check failed'))
      );
    });
  }

  /**
   * Get version information
   */
  async getVersion(): Promise<{ major: string; minor: string }> {
    return new Promise((resolve, reject) => {
      this.capiws.version(
        (event, data: VersionResponse) => {
          if (data.success && data.major && data.minor) {
            resolve({ major: data.major, minor: data.minor });
          } else {
            reject(new Error(data.reason ?? 'Failed to get version'));
          }
        },
        error => reject(new Error(String(error) || 'Version check failed'))
      );
    });
  }

  /**
   * Get API documentation
   */
  async getApiDoc(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.capiws.apidoc(
        (event, data: ApiResponse) => {
          if (data.success) {
            resolve(data);
          } else {
            reject(new Error(data.reason ?? 'Failed to get API documentation'));
          }
        },
        error => reject(new Error(String(error) || 'API documentation request failed'))
      );
    });
  }

  /**
   * Setup API keys
   */
  async setupApiKeys(domainAndKey: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.capiws.apikey(
        domainAndKey,
        (event, data: ApiResponse) => {
          if (data.success) {
            resolve();
          } else {
            reject(new Error(data.reason ?? 'Failed to setup API keys'));
          }
        },
        error => reject(new Error(String(error) || 'API keys setup failed'))
      );
    });
  }

  /**
   * Get all available plugins
   */
  getAvailablePlugins(): string[] {
    return this.plugins.getAll().map(plugin => plugin.name);
  }

  /**
   * Check if a plugin is available
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Get plugin by name with type safety
   */
  getPlugin<T extends EIMZOPlugin>(name: string): T | undefined {
    return this.plugins.get<T>(name);
  }
}

// Create and export singleton instance
export const eimzoApi = new EIMZOApi();

// Default export
export default eimzoApi;
