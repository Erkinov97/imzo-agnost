import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback } from '../core/types.js';

/**
 * Плагин для взаимодейтвия с ИОК (инфраструктура открытых ключей)
 */
@RegisterPlugin
export class PKIPlugin extends EIMZOPlugin {
  readonly name = 'pki';
  readonly description = 'Plugin for PKI (Public Key Infrastructure) interaction';

  /**
   * Шаг №1 для получения ключа PFX
   */
  enrollPfxStep1 = (
    request: string,
    onSuccess: CallbackFunction<any>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('enroll_pfx_step1', [request], onSuccess, onError);
  };

  /**
   * Шаг №2 для получения ключа PFX
   */
  enrollPfxStep2 = (
    response: string,
    onSuccess: CallbackFunction<any>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('enroll_pfx_step2', [response], onSuccess, onError);
  };
}
