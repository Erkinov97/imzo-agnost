import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback, CertificateInfo } from '../core/types.js';

export interface ReaderInfo {
  name: string;
  connected: boolean;
  cardPresent: boolean;
}

/**
 * Плагин для работы с ID-card E-IMZO
 */
@RegisterPlugin
export class IDCardPlugin extends EIMZOPlugin {
  readonly name = 'idcard';
  readonly description = 'Plugin for working with E-IMZO ID cards';

  /**
   * Проверить пароль хранилища ключей (заглушка)
   */
  verifyPassword = (
    password: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('verify_password', [password], onSuccess, onError);
  };

  /**
   * Персонализировать ID-карту записав новые сертификаты и установив PIN-код
   */
  personalize = (
    certificates: string[],
    pinCode: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('personalize', [certificates, pinCode], onSuccess, onError);
  };

  /**
   * Получить список считывателей
   */
  listReaders = (onSuccess: CallbackFunction<ReaderInfo[]>, onError: ErrorCallback): void => {
    this.callMethod('list_readers', [], onSuccess, onError);
  };

  /**
   * Получить список всех сертификатов пользователя (заглушка)
   */
  listAllCertificates = (
    onSuccess: CallbackFunction<CertificateInfo[]>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('list_all_certificates', [], onSuccess, onError);
  };

  /**
   * Получить зашифрованный и подписанный заводской номер USB-токена
   */
  getEncryptedSignedCplc = (onSuccess: CallbackFunction<string>, onError: ErrorCallback): void => {
    this.callMethod('get_encrypted_signed_cplc', [], onSuccess, onError);
  };

  /**
   * Загрузить ключ и получить идентификатор ключа. Ключ будет доступен определенное время (заглушка)
   */
  loadKey = (
    cardIndex: number,
    password: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('load_key', [cardIndex, password], onSuccess, onError);
  };
}
