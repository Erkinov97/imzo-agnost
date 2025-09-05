import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base';
import type {
  CertificateInfo,
  KeyResponse,
  ListResponse,
  CallbackFunction,
  ErrorCallback
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
 */
@RegisterPlugin
export class PfxPlugin extends EIMZOPlugin {
  readonly name = 'pfx';
  readonly description = 'Plugin for working with PFX key storage files';

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
   * Load key and get key identifier
   */
  loadKey = (
    disk: string,
    path: string,
    name: string,
    alias: string,
    onSuccess: CallbackFunction<KeyResponse>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('load_key', [disk, path, name, alias], onSuccess, onError);
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
   * Load key (Promise version)
   */
  loadKeyAsync = this.createPromiseMethod<[string, string, string, string], KeyResponse>(
    'load_key'
  );

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
