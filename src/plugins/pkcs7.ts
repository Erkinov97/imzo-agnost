import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base';
import type { CallbackFunction, ErrorCallback } from '../core/types';

// PKCS7-specific response types
export interface Pkcs7Response {
  success: true;
  pkcs7_64: string;
}

// Enhanced PKCS7 creation options
export interface Pkcs7CreateOptions {
  detached?: boolean | 'yes' | 'no' | '';
  autoBase64?: boolean; // Auto-encode string data to base64
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

  // Utility method to check if string is base64
  private isBase64(str: string): boolean {
    try {
      // Base64 pattern check
      const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Pattern.test(str)) return false;

      // Try to decode and encode back
      const decoded = atob(str);
      const encoded = btoa(decoded);
      return encoded === str;
    } catch {
      return false;
    }
  }

  // Callback-based methods

  /**
   * Create PKCS#7/CMS document by signing with key (enhanced version)
   * @param data - String data or already base64 encoded data
   * @param keyId - Key identifier
   * @param options - Creation options with smart defaults
   */
  createPkcs7Enhanced = (
    data: string,
    keyId: string,
    options: Pkcs7CreateOptions = {},
    onSuccess: CallbackFunction<Pkcs7Response>,
    onError: ErrorCallback
  ): void => {
    const {
      detached = false, // Default to attached (no)
      autoBase64 = true // Default to auto base64 encoding
    } = options;

    // Auto base64 encoding agar kerak bo'lsa
    let data64 = data;
    if (autoBase64 && !this.isBase64(data)) {
      try {
        data64 = btoa(data);
      } catch (_error) {
        // UTF-8 string lar uchun
        data64 = btoa(unescape(encodeURIComponent(data)));
      }
    }

    // Detached parameter ni normalizatsiya qilish
    let detachedParam: 'yes' | 'no' | '' = '';
    if (typeof detached === 'boolean') {
      detachedParam = detached ? 'yes' : 'no';
    } else {
      detachedParam = detached;
    }

    this.callMethod('create_pkcs7', [data64, keyId, detachedParam], onSuccess, onError);
  };

  /**
   * Create PKCS#7/CMS document by signing with key (original method)
   */
  createPkcs7 = (
    data64: string,
    keyId: string,
    detached: 'yes' | 'no' | '' = 'no', // Default to attached
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
   * Get full information about PKCS#7/CMS document (detached) with auto base64
   */
  getPkcs7DetachedInfoEnhanced = (
    data: string,
    pkcs764: string,
    trustStoreId = '',
    autoBase64 = true,
    onSuccess: CallbackFunction<Pkcs7InfoResponse>,
    onError: ErrorCallback
  ): void => {
    let data64 = data;
    if (autoBase64 && !this.isBase64(data)) {
      try {
        data64 = btoa(data);
      } catch (_error) {
        data64 = btoa(unescape(encodeURIComponent(data)));
      }
    }

    this.callMethod('get_pkcs7_detached_info', [data64, pkcs764, trustStoreId], onSuccess, onError);
  };

  /**
   * Get full information about PKCS#7/CMS document (detached) - original
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
   * Verify PKCS#7/CMS document (detached) with auto base64
   */
  verifyPkcs7DetachedEnhanced = (
    data: string,
    pkcs764: string,
    trustStoreId: string,
    requesterId = '',
    autoBase64 = true,
    onSuccess: CallbackFunction<{ success: true; valid: boolean }>,
    onError: ErrorCallback
  ): void => {
    let data64 = data;
    if (autoBase64 && !this.isBase64(data)) {
      try {
        data64 = btoa(data);
      } catch (_error) {
        data64 = btoa(unescape(encodeURIComponent(data)));
      }
    }

    this.callMethod(
      'verify_pkcs7_detached',
      [data64, pkcs764, trustStoreId, requesterId],
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
   * Create PKCS#7/CMS document (Enhanced Promise version)
   * @param data String data (auto base64 encoded) or base64 data
   * @param keyId Key identifier
   * @param options Creation options with smart defaults
   */
  createPkcs7Async = async (
    data: string,
    keyId: string,
    options: Pkcs7CreateOptions = {}
  ): Promise<Pkcs7Response> => {
    return new Promise<Pkcs7Response>((resolve, reject) => {
      this.createPkcs7Enhanced(
        data,
        keyId,
        options,
        (_event, response) => {
          if (response.success && response.data) {
            resolve(response.data);
          } else {
            reject(new Error(response.reason ?? 'Unknown error'));
          }
        },
        reject
      );
    });
  };

  /**
   * Create PKCS#7/CMS document (Original Promise version for backward compatibility)
   */
  createPkcs7LegacyAsync = this.createPromiseMethod<
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
   * Get PKCS#7 detached info (Enhanced Promise version)
   */
  getPkcs7DetachedInfoAsync = async (
    data: string,
    pkcs764: string,
    trustStoreId = '',
    autoBase64 = true
  ): Promise<Pkcs7InfoResponse> => {
    return new Promise<Pkcs7InfoResponse>((resolve, reject) => {
      this.getPkcs7DetachedInfoEnhanced(
        data,
        pkcs764,
        trustStoreId,
        autoBase64,
        (_event, response) => {
          if (response.success && response.data) {
            resolve(response.data);
          } else {
            reject(new Error(response.reason ?? 'Unknown error'));
          }
        },
        reject
      );
    });
  };

  /**
   * Get PKCS#7 detached info (Original Promise version)
   */
  getPkcs7DetachedInfoLegacyAsync = this.createPromiseMethod<
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
   * Verify PKCS#7 detached (Enhanced Promise version)
   */
  verifyPkcs7DetachedAsync = async (
    data: string,
    pkcs764: string,
    trustStoreId: string,
    requesterId = '',
    autoBase64 = true
  ): Promise<{ success: true; valid: boolean }> => {
    return new Promise<{ success: true; valid: boolean }>((resolve, reject) => {
      this.verifyPkcs7DetachedEnhanced(
        data,
        pkcs764,
        trustStoreId,
        requesterId,
        autoBase64,
        (_event, response) => {
          if (response.success && response.data) {
            resolve(response.data);
          } else {
            reject(new Error(response.reason ?? 'Unknown error'));
          }
        },
        reject
      );
    });
  };

  /**
   * Verify PKCS#7 detached (Original Promise version)
   */
  verifyPkcs7DetachedLegacyAsync = this.createPromiseMethod<
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
