import { PluginManager, type EIMZOPlugin } from './core/plugin-base';
import CAPIWS from './e-imzo/capiws';
import EIMZOClient from './e-imzo-client';

// Import all plugins to ensure they're registered
import './plugins/pfx';
import './plugins/pkcs7';
import './plugins/ftjc';
import './plugins/cryptoauth';
import './plugins/truststore-jks';
import './plugins/tunnel';
import './plugins/certkey';
import './plugins/x509';
import './plugins/cipher';
import './plugins/pki';
import './plugins/pkcs10';
import './plugins/idcard';
import './plugins/truststore';
import './plugins/crl';
import './plugins/fileio';
import './plugins/tsaclient';
import './plugins/ytks';

// Re-export plugin instances for direct access
export { pfxPlugin } from './plugins/pfx';
export { pkcs7Plugin } from './plugins/pkcs7';
export { ftjcPlugin } from './plugins/ftjc';
// Note: cryptoauth and other plugins use class-based registration, instances available via PluginManager

// Re-export types
export * from './core/types';
export type { PfxPlugin, PfxCertificate } from './plugins/pfx';
export type { Pkcs7Plugin, Pkcs7Response } from './plugins/pkcs7';
export type { FtjcPlugin, FtjcTokenInfo } from './plugins/ftjc';
export type { CryptoAuthPlugin } from './plugins/cryptoauth';
export type { TruststoreJKSPlugin } from './plugins/truststore-jks';
export type { TunnelPlugin } from './plugins/tunnel';
export type { CertKeyPlugin } from './plugins/certkey';
export type { X509Plugin } from './plugins/x509';
export type { CipherPlugin } from './plugins/cipher';
export type { PKIPlugin } from './plugins/pki';
export type { PKCS10Plugin, PKCS10Info, KeyPairInfo } from './plugins/pkcs10';
export type { IDCardPlugin, ReaderInfo } from './plugins/idcard';
export type { TruststorePlugin } from './plugins/truststore';
export type { CRLPlugin, CRLInfo, CertificateStatus } from './plugins/crl';
export type { FileIOPlugin } from './plugins/fileio';
export type { TSAClientPlugin, TimestampTokenInfo } from './plugins/tsaclient';
export type { YTKSPlugin } from './plugins/ytks';

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
        (error, reason) => reject(error || new Error(reason || 'Version check failed'))
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
        (error, reason) => reject(error || new Error(reason || 'API key installation failed'))
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
        (error, reason) => reject(error || new Error(reason || 'ID card check failed'))
      );
    });
  }

  /**
   * Get version information
   */
  async getVersion(): Promise<{ major: string; minor: string }> {
    return new Promise((resolve, reject) => {
      this.capiws.version(
        (event, data) => {
          if (data.success && data.major && data.minor) {
            resolve({ major: data.major, minor: data.minor });
          } else {
            reject(new Error(data.reason || 'Failed to get version'));
          }
        },
        error => reject(error)
      );
    });
  }

  /**
   * Get API documentation
   */
  async getApiDoc(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.capiws.apidoc(
        (event, data) => {
          if (data.success) {
            resolve(data);
          } else {
            reject(new Error(data.reason || 'Failed to get API documentation'));
          }
        },
        error => reject(error)
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
        (event, data) => {
          if (data.success) {
            resolve();
          } else {
            reject(new Error(data.reason || 'Failed to setup API keys'));
          }
        },
        error => reject(error)
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
