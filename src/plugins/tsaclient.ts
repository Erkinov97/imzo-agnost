import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback } from '../core/types.js';

export interface TimestampTokenInfo {
  timestamp: string;
  tsaName: string;
  serialNumber: string;
  messageImprint: string;
  policy?: string;
}

/**
 * Плагин для работы с токенами штампов времени
 */
@RegisterPlugin
export class TSAClientPlugin extends EIMZOPlugin {
  readonly name = 'tsaclient';
  readonly description = 'Plugin for working with timestamp tokens';

  /**
   * Получить запрос на получения токена штампа времени для данных
   */
  getTimestampTokenRequestForData = (
    data: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_timestamp_token_request_for_data', [data], onSuccess, onError);
  };

  /**
   * Получить токен штампа времени на подпись от службы штампов времени по веб-ссылке
   */
  getTimestampTokenForSignature = (
    signature: string,
    tsaUrl: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_timestamp_token_for_signature', [signature, tsaUrl], onSuccess, onError);
  };

  /**
   * Получить токен штампа времени на данные от службы штампов времени по веб-ссылке
   */
  getTimestampTokenForData = (
    data: string,
    tsaUrl: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_timestamp_token_for_data', [data, tsaUrl], onSuccess, onError);
  };

  /**
   * Получить информацию о токене штампа времени
   */
  getTimestampTokenInfo = (
    token: string,
    onSuccess: CallbackFunction<TimestampTokenInfo>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_timestamp_token_info', [token], onSuccess, onError);
  };

  /**
   * Получить запрос на получения токена штампа времени для подписи
   */
  getTimestampTokenRequestForSignature = (
    signature: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_timestamp_token_request_for_signature', [signature], onSuccess, onError);
  };
}
