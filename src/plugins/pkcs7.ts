import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base';
import type { CallbackFunction, ErrorCallback } from '../core/types';

// PKCS7-specific response types
export interface Pkcs7Response {
  success: true;
  pkcs7_64: string;
}

export interface Pkcs7InfoResponse {
  success: boolean;
  signatures: {
    signer: string;
    timestamp?: string;
    valid: boolean;
  }[];
}

export interface TimestampTokenResponse {
  success: true;
  timestamp_token_64: string;
}

/**
 * PKCS7 Plugin for working with PKCS#7/CMS format
 */
@RegisterPlugin
export class Pkcs7Plugin extends EIMZOPlugin {
  readonly name = 'pkcs7';
  readonly description = 'Plugin for working with PKCS#7/CMS format';

  // Callback-based methods

  /**
   * Create PKCS#7/CMS document by signing with key
   */
  createPkcs7 = (
    data64: string,
    keyId: string,
    detached: 'yes' | 'no' | '' = '',
    onSuccess: CallbackFunction<Pkcs7Response>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('create_pkcs7', [data64, keyId, detached], onSuccess, onError);
  };

  /**
   * Get full information about PKCS#7/CMS document (attached)
   */
  getPkcs7AttachedInfo = (
    pkcs764: string,
    trustStoreId = '',
    onSuccess: CallbackFunction<Pkcs7InfoResponse>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_pkcs7_attached_info', [pkcs764, trustStoreId], onSuccess, onError);
  };

  /**
   * Get full information about PKCS#7/CMS document (detached)
   */
  getPkcs7DetachedInfo = (
    data64: string,
    pkcs764: string,
    trustStoreId = '',
    onSuccess: CallbackFunction<Pkcs7InfoResponse>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_pkcs7_detached_info', [data64, pkcs764, trustStoreId], onSuccess, onError);
  };

  /**
   * Verify PKCS#7/CMS document (attached) - STUB
   */
  verifyPkcs7Attached = (
    pkcs764: string,
    trustStoreId: string,
    requesterId = '',
    onSuccess: CallbackFunction<{ success: true; valid: boolean }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'verify_pkcs7_attached',
      [pkcs764, trustStoreId, requesterId],
      onSuccess,
      onError
    );
  };

  /**
   * Verify PKCS#7/CMS document (detached) - STUB
   */
  verifyPkcs7Detached = (
    data64: string,
    pkcs764: string,
    trustStoreId: string,
    requesterId = '',
    onSuccess: CallbackFunction<{ success: true; valid: boolean }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'verify_pkcs7_detached',
      [data64, pkcs764, trustStoreId, requesterId],
      onSuccess,
      onError
    );
  };

  /**
   * Verify PKCS#7/CMS document with CRL (attached) - STUB
   */
  verifyPkcs7AttachedCrl = (
    pkcs764: string,
    trustStoreId: string,
    crlId: string,
    onSuccess: CallbackFunction<{ success: true; valid: boolean }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'verify_pkcs7_attached_crl',
      [pkcs764, trustStoreId, crlId],
      onSuccess,
      onError
    );
  };

  /**
   * Verify PKCS#7/CMS document with CRL (detached) - STUB
   */
  verifyPkcs7DetachedCrl = (
    data64: string,
    pkcs764: string,
    trustStoreId: string,
    crlId: string,
    onSuccess: CallbackFunction<{ success: true; valid: boolean }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'verify_pkcs7_detached_crl',
      [data64, pkcs764, trustStoreId, crlId],
      onSuccess,
      onError
    );
  };

  /**
   * Attach timestamp token to PKCS#7/CMS document - STUB
   */
  attachTimestampTokenPkcs7 = (
    pkcs764: string,
    signerSerialNumber: string,
    timestampToken64: string,
    onSuccess: CallbackFunction<Pkcs7Response>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'attach_timestamp_token_pkcs7',
      [pkcs764, signerSerialNumber, timestampToken64],
      onSuccess,
      onError
    );
  };

  /**
   * Add signature to existing PKCS#7/CMS document (attached) - DEPRECATED
   */
  appendPkcs7Attached = (
    pkcs764: string,
    keyId: string,
    onSuccess: CallbackFunction<Pkcs7Response>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('append_pkcs7_attached', [pkcs764, keyId], onSuccess, onError);
  };

  /**
   * Add signature to existing PKCS#7/CMS document (detached) - DEPRECATED
   */
  appendPkcs7Detached = (
    data64: string,
    pkcs764: string,
    keyId: string,
    onSuccess: CallbackFunction<Pkcs7Response>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('append_pkcs7_detached', [data64, pkcs764, keyId], onSuccess, onError);
  };

  // Promise-based methods

  /**
   * Create PKCS#7/CMS document (Promise version)
   */
  createPkcs7Async = this.createPromiseMethod<
    [string, string, ('yes' | 'no' | '')?],
    Pkcs7Response
  >('create_pkcs7');

  /**
   * Get PKCS#7 attached info (Promise version)
   */
  getPkcs7AttachedInfoAsync = this.createPromiseMethod<[string, string?], Pkcs7InfoResponse>(
    'get_pkcs7_attached_info'
  );

  /**
   * Get PKCS#7 detached info (Promise version)
   */
  getPkcs7DetachedInfoAsync = this.createPromiseMethod<
    [string, string, string?],
    Pkcs7InfoResponse
  >('get_pkcs7_detached_info');

  /**
   * Verify PKCS#7 attached (Promise version)
   */
  verifyPkcs7AttachedAsync = this.createPromiseMethod<
    [string, string, string?],
    { success: true; valid: boolean }
  >('verify_pkcs7_attached');

  /**
   * Verify PKCS#7 detached (Promise version)
   */
  verifyPkcs7DetachedAsync = this.createPromiseMethod<
    [string, string, string, string?],
    { success: true; valid: boolean }
  >('verify_pkcs7_detached');

  /**
   * Attach timestamp token (Promise version)
   */
  attachTimestampTokenPkcs7Async = this.createPromiseMethod<
    [string, string, string],
    Pkcs7Response
  >('attach_timestamp_token_pkcs7');
}

// Export singleton instance
export const pkcs7Plugin = new Pkcs7Plugin();
