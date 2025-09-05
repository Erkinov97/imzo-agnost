import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback, CertificateInfo } from '../core/types.js';

/**
 * Плагин для работы с электронными ключами и сертификатами
 */
@RegisterPlugin
export class CertKeyPlugin extends EIMZOPlugin {
  readonly name = 'certkey';
  readonly description = 'Plugin for working with electronic keys and certificates';

  /**
   * Удалить загруженные ключи по идентификатору
   */
  unloadKey = (
    keyId: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('unload_key', [keyId], onSuccess, onError);
  };

  /**
   * Получить список дисков
   */
  listDisks = (onSuccess: CallbackFunction<string[]>, onError: ErrorCallback): void => {
    this.callMethod('list_disks', [], onSuccess, onError);
  };

  /**
   * Получить список сертификатов пользователя
   */
  listCertificates = (
    diskPath: string,
    onSuccess: CallbackFunction<CertificateInfo[]>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('list_certificates', [diskPath], onSuccess, onError);
  };

  /**
   * Получить список всех сертификатов пользователя
   */
  listAllCertificates = (
    onSuccess: CallbackFunction<CertificateInfo[]>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('list_all_certificates', [], onSuccess, onError);
  };

  /**
   * Загрузить ключ и получить идентификатор ключа
   */
  loadKey = (
    keyPath: string,
    password: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('load_key', [keyPath, password], onSuccess, onError);
  };
}
