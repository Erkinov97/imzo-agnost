import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base';
import type { TokenInfo, KeyResponse, CallbackFunction, ErrorCallback } from '../core/types';

// FTJC-specific response types
export interface FtjcTokenInfo extends TokenInfo {
  cardUID: string;
  statusInfo: string;
  ownerName: string;
  info: string;
}

export interface FtjcListResponse {
  success: true;
  tokens: FtjcTokenInfo[];
}

export interface UserDataResponse {
  success: true;
  data_64: string;
}

export interface RandomDataResponse {
  success: true;
  random_64: string;
}

/**
 * FTJC Plugin for working with USB FT Javacard tokens
 */
@RegisterPlugin
export class FtjcPlugin extends EIMZOPlugin {
  readonly name = 'ftjc';
  readonly description = 'Plugin for working with USB FT Javacard tokens - STUB';

  // Callback-based methods

  /**
   * Get list of all keys from connected tokens
   */
  listAllKeys = (
    exceptCards = '',
    onSuccess: CallbackFunction<FtjcListResponse>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('list_all_keys', [exceptCards], onSuccess, onError);
  };

  /**
   * Get list of tokens
   */
  listTokens = (onSuccess: CallbackFunction<FtjcListResponse>, onError: ErrorCallback): void => {
    this.callMethod('list_tokens', [], onSuccess, onError);
  };

  /**
   * Load key and get key identifier
   */
  loadKey = (
    cardUID: string,
    onSuccess: CallbackFunction<KeyResponse>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('load_key', [cardUID], onSuccess, onError);
  };

  /**
   * Unload key by identifier
   */
  unloadKey = (
    tokenId: string,
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('unload_key', [tokenId], onSuccess, onError);
  };

  /**
   * Verify PIN code of token
   * @param pinType 0 - Initialization, 1 - User, 2 - Reset
   */
  verifyPin = (
    tokenId: string,
    pinType: '0' | '1' | '2',
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('verify_pin', [tokenId, pinType], onSuccess, onError);
  };

  /**
   * Change PIN code of token
   * @param pinType 0 - Initialization, 1 - User, 2 - Reset
   */
  changePin = (
    tokenId: string,
    pinType: '0' | '1' | '2',
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('change_pin', [tokenId, pinType], onSuccess, onError);
  };

  /**
   * Set name for USB token
   */
  setName = (
    tokenId: string,
    name: string,
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('set_name', [tokenId, name], onSuccess, onError);
  };

  /**
   * Store certificates in USB token
   */
  storeCertificates = (
    tokenId: string,
    subjectCertificate64: string,
    caCertificate64: string,
    rootCertificate64: string,
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'store_certificates',
      [tokenId, subjectCertificate64, caCertificate64, rootCertificate64],
      onSuccess,
      onError
    );
  };

  /**
   * Get user data from token
   */
  getUserData = (
    tokenId: string,
    onSuccess: CallbackFunction<UserDataResponse>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_user_data', [tokenId], onSuccess, onError);
  };

  /**
   * Set or delete user data in token
   * @param data64 Data in BASE64 encoding or empty string to delete
   */
  setUserData = (
    tokenId: string,
    data64: string,
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('set_user_data', [tokenId, data64], onSuccess, onError);
  };

  /**
   * Generate random data in USB token
   */
  getRandomData = (
    tokenId: string,
    onSuccess: CallbackFunction<RandomDataResponse>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_random_data', [tokenId], onSuccess, onError);
  };

  /**
   * Install applet in USB token
   */
  installApplet = (
    cardUID: string,
    applet64: string,
    signatureHex: string,
    onSuccess: CallbackFunction<{ success: true }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('install_applet', [cardUID, applet64, signatureHex], onSuccess, onError);
  };

  // Promise-based methods

  /**
   * List all keys (Promise version)
   */
  listAllKeysAsync = this.createPromiseMethod<[string?], FtjcListResponse>('list_all_keys');

  /**
   * List tokens (Promise version)
   */
  listTokensAsync = this.createPromiseMethod<[], FtjcListResponse>('list_tokens');

  /**
   * Load key (Promise version)
   */
  loadKeyAsync = this.createPromiseMethod<[string], KeyResponse>('load_key');

  /**
   * Unload key (Promise version)
   */
  unloadKeyAsync = this.createPromiseMethod<[string], { success: true }>('unload_key');

  /**
   * Verify PIN (Promise version)
   */
  verifyPinAsync = this.createPromiseMethod<[string, '0' | '1' | '2'], { success: true }>(
    'verify_pin'
  );

  /**
   * Change PIN (Promise version)
   */
  changePinAsync = this.createPromiseMethod<[string, '0' | '1' | '2'], { success: true }>(
    'change_pin'
  );

  /**
   * Set name (Promise version)
   */
  setNameAsync = this.createPromiseMethod<[string, string], { success: true }>('set_name');

  /**
   * Store certificates (Promise version)
   */
  storeCertificatesAsync = this.createPromiseMethod<
    [string, string, string, string],
    { success: true }
  >('store_certificates');

  /**
   * Get user data (Promise version)
   */
  getUserDataAsync = this.createPromiseMethod<[string], UserDataResponse>('get_user_data');

  /**
   * Set user data (Promise version)
   */
  setUserDataAsync = this.createPromiseMethod<[string, string], { success: true }>('set_user_data');

  /**
   * Get random data (Promise version)
   */
  getRandomDataAsync = this.createPromiseMethod<[string], RandomDataResponse>('get_random_data');

  /**
   * Install applet (Promise version)
   */
  installAppletAsync = this.createPromiseMethod<[string, string, string], { success: true }>(
    'install_applet'
  );
}

// Export singleton instance
export const ftjcPlugin = new FtjcPlugin();
