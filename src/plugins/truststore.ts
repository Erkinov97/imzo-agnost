import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback, CertificateInfo } from '../core/types.js';

/**
 * Плагин для работы с хранилищами доверенных сертификатов
 */
@RegisterPlugin
export class TruststorePlugin extends EIMZOPlugin {
  readonly name = 'truststore';
  readonly description = 'Plugin for working with trust stores';

  /**
   * Получить список доверенных сертификатов (ЗАГЛУШКА)
   */
  listTruststore = (
    onSuccess: CallbackFunction<CertificateInfo[]>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('list_truststore', [], onSuccess, onError);
  };
}
