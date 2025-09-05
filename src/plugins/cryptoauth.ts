import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback } from '../core/types.js';

/**
 * Плагин для выполнения низкоуровневых криптографических преобразований
 */
@RegisterPlugin
export class CryptoAuthPlugin extends EIMZOPlugin {
  readonly name = 'cryptoauth';
  readonly description = 'Plugin for low-level cryptographic operations';

  /**
   * Подписать данные ключем задаваемым идентификатором
   */
  getSignature = (
    keyId: string,
    data: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_signature', [keyId, data], onSuccess, onError);
  };

  /**
   * Вычислить хеш (в формате HEX) данных по алгоритму OZDST-1106-2009-2-A
   */
  getDigestHex = (
    data: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_digest_hex', [data], onSuccess, onError);
  };

  /**
   * Верифицировать подпись данных сертификатом
   */
  verifySignatureWithCertificate = (
    data: string,
    signature: string,
    certificate: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'verify_signature_with_certificate',
      [data, signature, certificate],
      onSuccess,
      onError
    );
  };

  /**
   * Верифицировать подпись хеша (в формате HEX) ключем задаваемым идентификатором
   */
  verifyDigestHexSignatureWithId = (
    digestHex: string,
    signature: string,
    keyId: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'verify_digest_hex_signature_with_id',
      [digestHex, signature, keyId],
      onSuccess,
      onError
    );
  };

  /**
   * Подписать хеш (в формате HEX) ключем задаваемым идентификатором
   */
  getDigestHexSignature = (
    digestHex: string,
    keyId: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_digest_hex_signature', [digestHex, keyId], onSuccess, onError);
  };

  /**
   * Верифицировать подпись данных ключем задаваемым идентификатором
   */
  verifySignatureWithId = (
    data: string,
    signature: string,
    keyId: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('verify_signature_with_id', [data, signature, keyId], onSuccess, onError);
  };

  /**
   * Верифицировать подпись хеша (в формате HEX) сертификатом
   */
  verifyDigestHexSignatureWithCertificate = (
    digestHex: string,
    signature: string,
    certificate: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'verify_digest_hex_signature_with_certificate',
      [digestHex, signature, certificate],
      onSuccess,
      onError
    );
  };
}
