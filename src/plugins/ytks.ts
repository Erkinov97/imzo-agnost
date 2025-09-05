import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback, CertificateInfo } from '../core/types.js';

export interface DiskInfo {
  name: string;
  path: string;
  available: boolean;
}

/**
 * Плагин для работы с файлами хранилища ключей формата YTKS
 */
@RegisterPlugin
export class YTKSPlugin extends EIMZOPlugin {
  readonly name = 'ytks';
  readonly description = 'Plugin for working with YTKS key storage files';

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
   * Изменить пароль хранилища ключей
   */
  changePassword = (
    disk: string,
    path: string,
    name: string,
    oldPassword: string,
    newPassword: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'change_password',
      [disk, path, name, oldPassword, newPassword],
      onSuccess,
      onError
    );
  };

  /**
   * Получить список дисков
   */
  listDisks = (
    onSuccess: CallbackFunction<{ disks: DiskInfo[] }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('list_disks', [], onSuccess, onError);
  };

  /**
   * Получить список сертификатов пользователя
   */
  listCertificates = (
    disk: string,
    onSuccess: CallbackFunction<{ certificates: CertificateInfo[] }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('list_certificates', [disk], onSuccess, onError);
  };

  /**
   * Проверить пароль хранилища ключей
   */
  verifyPassword = (
    disk: string,
    path: string,
    name: string,
    password: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('verify_password', [disk, path, name, password], onSuccess, onError);
  };

  /**
   * Получить список всех сертификатов пользователя
   */
  listAllCertificates = (
    onSuccess: CallbackFunction<{ certificates: CertificateInfo[] }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('list_all_certificates', [], onSuccess, onError);
  };

  /**
   * Загрузить ключ и получить идентификатор ключа
   */
  loadKey = (
    disk: string,
    path: string,
    name: string,
    alias: string,
    onSuccess: CallbackFunction<{ keyId: string }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('load_key', [disk, path, name, alias], onSuccess, onError);
  };

  /**
   * Сохранить ключевую пару или существующий ключ и новые сертификаты в новый файл формата YTKS
   */
  saveYtks = (
    disk: string,
    path: string,
    name: string,
    password: string,
    keyId: string,
    certificates: string[],
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'save_ytks',
      [disk, path, name, password, keyId, certificates],
      onSuccess,
      onError
    );
  };
}
