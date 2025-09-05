import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base';
import { sessionManager, type SessionConfig } from '../core/session-manager';
import type {
  CallbackFunction,
  CertificateInfo,
  ErrorCallback,
  KeyResponse,
  ListResponse
} from '../core/types';

// PFX-specific response types
export interface PfxCertificate extends CertificateInfo {
  disk: string;
  path: string;
  name: string;
  alias: string;
}

export interface PfxListResponse extends ListResponse<PfxCertificate> {
  certificates: PfxCertificate[];
}

export interface DiskInfo {
  name: string;
  label?: string;
  available: boolean;
}

/**
 * PFX Plugin for working with PFX key storage files
 * Session management support for automatic key lifecycle
 */
@RegisterPlugin
export class PfxPlugin extends EIMZOPlugin {
  readonly name = 'pfx';
  readonly description = 'Plugin for working with PFX key storage files with session management';

  // Session management configuration
  updateSessionConfig(config: Partial<SessionConfig>): void {
    sessionManager.updateConfig(config);
  }

  // Certificate cache for keyId lookup
  private certificateCache = new Map<string, PfxCertificate>();

  /**
   * Get keyId from certificate identifier
   * Used for: await pfxPlugin.verifyPasswordAsync(keyId);
   * @param certificateId - Format: "disk:path:name:alias" or just "alias"
   * @returns keyId or null if not found
   */
  getKeyId(certificateId: string): string | null {
    // Certificate ID dan keyId ni olish
    return sessionManager.getKeyId(certificateId);
  }

  /**
   * Get all active key sessions
   */
  getActiveSessions() {
    return sessionManager.getActiveSessions();
  }

  /**
   * Find certificate ID by partial match (alias, name, etc.)
   */
  findCertificateId(searchTerm: string): string | null {
    // Cache dan qidirish
    for (const [certId, cert] of this.certificateCache.entries()) {
      if (cert.alias === searchTerm || cert.name === searchTerm || certId.includes(searchTerm)) {
        return certId;
      }
    }

    // Session dan qidirish
    const sessions = sessionManager.getActiveSessions();
    for (const session of sessions) {
      if (session.certificateId.includes(searchTerm)) {
        return session.certificateId;
      }
    }

    return null;
  }

  /**
   * Clear all sessions
   */
  async clearAllSessions(): Promise<void> {
    await sessionManager.clearAllSessions();
    this.certificateCache.clear();
  }

  // Callback-based methods

  /**
   * Get list of available disks
   */
  listDisks = (
    onSuccess: CallbackFunction<{ disks: DiskInfo[] }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('list_disks', [], onSuccess, onError);
  };

  /**
   * Get list of certificates from specific disk
   */
  listCertificates = (
    disk: string,
    onSuccess: CallbackFunction<PfxListResponse>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('list_certificates', [disk], onSuccess, onError);
  };

  /**
   * Get list of all certificates from all disks
   */
  listAllCertificates = (
    onSuccess: CallbackFunction<PfxListResponse>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('list_all_certificates', [], onSuccess, onError);
  };

  /**
   * Load key and get key identifier with session management
   * @param disk - Storage disk name
   * @param path - Path to PFX file
   * @param name - File name
   * @param alias - Certificate alias
   * @param saveForHours - Save in session for automatic management (6 hours default)
   */
  loadKey = (
    disk: string,
    path: string,
    name: string,
    alias: string,
    onSuccess: CallbackFunction<KeyResponse>,
    onError: ErrorCallback,
    saveForHours?: number
  ): void => {
    const originalOnSuccess: CallbackFunction<KeyResponse> = (event, response) => {
      if (!response.data) return;

      const keyResponse = response.data;
      // Certificate ID ni yaratish
      const certificateId = `${disk}:${path}:${name}:${alias}`;

      // Basic certificate ma'lumotlari
      const certificate: PfxCertificate = {
        disk,
        path,
        name,
        alias,
        serialNumber: '',
        subjectName: '',
        validFromDate: '',
        validToDate: '',
        issuerName: '',
        subjectId: '',
        publicKeyAlgorithm: '',
        signAlgorithm: '',
        keyUsage: '',
        extendedKeyUsage: '',
        crlDistributionPoints: '',
        authorityInfoAccess: '',
        subjectAltName: '',
        issuerAltName: '',
        subjectKeyIdentifier: '',
        authorityKeyIdentifier: '',
        basicConstraints: '',
        certificatePolicies: '',
        keyUsageNonRepudiation: false,
        keyUsageDigitalSignature: false,
        keyUsageContentCommitment: false,
        extendedKeyUsageTimeStamping: false
      };

      this.certificateCache.set(certificateId, certificate);

      // Session management (faqat saveForHours ko'rsatilgan bo'lsa)
      if (saveForHours && saveForHours > 0 && keyResponse.keyId) {
        sessionManager.saveKeySession(
          keyResponse.keyId,
          certificateId,
          certificate,
          true // Auto unload enabled
        );

        console.log(`💾 Key session saved for ${saveForHours} hours: ${certificateId}`);
      }

      onSuccess(event, response);
    };

    this.callMethod('load_key', [disk, path, name, alias], originalOnSuccess, onError);
  };

  /**
   * Unload key by identifier
   */
  unloadKey = (
    keyId: string,
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('unload_key', [keyId], onSuccess, onError);
  };

  /**
   * Verify password for key storage
   */
  verifyPassword = (
    keyId: string,
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('verify_password', [keyId], onSuccess, onError);
  };

  /**
   * Change password for key storage
   */
  changePassword = (
    keyId: string,
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('change_password', [keyId], onSuccess, onError);
  };

  /**
   * Save key pair and certificates to new PFX file
   */
  savePfx = (
    disk: string,
    path: string,
    name: string,
    alias: string,
    id: string,
    newKeyPassword: string,
    subjectCertificate64: string,
    caCertificate64: string,
    rootCertificate64: string,
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'save_pfx',
      [
        disk,
        path,
        name,
        alias,
        id,
        newKeyPassword,
        subjectCertificate64,
        caCertificate64,
        rootCertificate64
      ],
      onSuccess,
      onError
    );
  };

  /**
   * Save temporary PFX with self-signed certificate
   */
  saveTemporaryPfx = (
    disk: string,
    path: string,
    name: string,
    alias: string,
    id: string,
    password: string,
    subjectX500Name: string,
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'save_temporary_pfx',
      [disk, path, name, alias, id, password, subjectX500Name],
      onSuccess,
      onError
    );
  };

  // Promise-based methods

  /**
   * Get list of available disks (Promise version)
   */
  listDisksAsync = this.createPromiseMethod<[], { disks: DiskInfo[] }>('list_disks');

  /**
   * Get list of certificates from specific disk (Promise version)
   */
  listCertificatesAsync = this.createPromiseMethod<[string], PfxListResponse>('list_certificates');

  /**
   * Get list of all certificates (Promise version)
   */
  listAllCertificatesAsync = this.createPromiseMethod<[], PfxListResponse>('list_all_certificates');

  /**
   * Load key (Promise version) with session management
   * @param disk Storage disk name
   * @param path Path to PFX file
   * @param name File name
   * @param alias Certificate alias
   * @param saveForHours Save in session for automatic management
   */
  loadKeyAsync = async (
    disk: string,
    path: string,
    name: string,
    alias: string,
    saveForHours?: number
  ): Promise<KeyResponse> => {
    return new Promise<KeyResponse>((resolve, reject) => {
      this.loadKey(
        disk,
        path,
        name,
        alias,
        (event, response) => {
          if (response.success && response.data) {
            resolve(response.data);
          } else {
            reject(new Error(response.reason ?? 'Unknown error'));
          }
        },
        reject,
        saveForHours
      );
    });
  };

  /**
   * Unload key (Promise version)
   */
  unloadKeyAsync = this.createPromiseMethod<[string], { success: true }>('unload_key');

  /**
   * Verify password (Promise version)
   */
  verifyPasswordAsync = this.createPromiseMethod<[string], { success: true }>('verify_password');

  /**
   * Change password (Promise version)
   */
  changePasswordAsync = this.createPromiseMethod<[string], { success: true }>('change_password');

  /**
   * Save PFX (Promise version)
   */
  savePfxAsync = this.createPromiseMethod<
    [string, string, string, string, string, string, string, string, string],
    { success: true }
  >('save_pfx');

  /**
   * Save temporary PFX (Promise version)
   */
  saveTemporaryPfxAsync = this.createPromiseMethod<
    [string, string, string, string, string, string, string],
    { success: true }
  >('save_temporary_pfx');
}

// Export singleton instance
export const pfxPlugin = new PfxPlugin();
