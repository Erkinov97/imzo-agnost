import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback } from '../core/types.js';

export interface PKCS10Info {
  subject: string;
  publicKey: string;
  signatureAlgorithm: string;
  [key: string]: any;
}

export interface KeyPairInfo {
  privateKeyId: string;
  publicKey: string;
}

/**
 * Плагин для генерации ключевой пары и формирования запроса на сертификат формата PKCS#10
 */
@RegisterPlugin
export class PKCS10Plugin extends EIMZOPlugin {
  readonly name = 'pkcs10';
  readonly description = 'Plugin for generating key pairs and PKCS#10 certificate requests';

  /**
   * Формировать запрос на сертификат формата PKCS#10 из существующего ключа
   */
  createPkcs10FromKey = (
    keyId: string,
    subject: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('create_pkcs10_from_key', [keyId, subject], onSuccess, onError);
  };

  /**
   * Сгенерировать ключевую пару
   */
  generateKeypair = (
    keySize: number,
    onSuccess: CallbackFunction<KeyPairInfo>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('generate_keypair', [keySize], onSuccess, onError);
  };

  /**
   * Формировать запрос на сертификат формата PKCS#10
   */
  createPkcs10 = (
    subject: string,
    keySize: number,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('create_pkcs10', [subject, keySize], onSuccess, onError);
  };

  /**
   * Получить информацию о запросе PKCS#10
   */
  getPkcs10Info = (
    pkcs10: string,
    onSuccess: CallbackFunction<PKCS10Info>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_pkcs10_info', [pkcs10], onSuccess, onError);
  };
}
