import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback } from '../core/types.js';

/**
 * Плагин для работы с хранилищами доверенных сертификатов формата JKS
 */
@RegisterPlugin
export class TruststoreJKSPlugin extends EIMZOPlugin {
  readonly name = 'truststore-jks';
  readonly description = 'Plugin for working with JKS trust stores';

  /**
   * Открывает хранилище доверенных сертификатов 'truststore.jks' в домашней директории пользователя
   */
  openTruststore = (onSuccess: CallbackFunction<any>, onError: ErrorCallback): void => {
    this.callMethod('open_truststore', [], onSuccess, onError);
  };

  // Promise-based methods

  /**
   * Открывает хранилище доверенных сертификатов 'truststore.jks' в домашней директории пользователя
   */
  async openTruststoreAsync(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.openTruststore(
        (event, data) => {
          if (data.success) {
            resolve(data);
          } else {
            reject(new Error(data.reason || 'Unknown error'));
          }
        },
        error => reject(new Error(String(error)))
      );
    });
  }
}
