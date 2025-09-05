import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback, CertificateInfo } from '../core/types.js';

/**
 * Плагин для работы с сертификатами X.509
 */
@RegisterPlugin
export class X509Plugin extends EIMZOPlugin {
  readonly name = 'x509';
  readonly description = 'Plugin for working with X.509 certificates';

  /**
   * Верификация подписи сертификата субъектка сертификатом издателя
   */
  verifyCertificate = (
    subjectCert: string,
    issuerCert: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('verify_certificate', [subjectCert, issuerCert], onSuccess, onError);
  };

  /**
   * Получить цепочку сертификатов в кодировке BASE64 по идентификатору ключа
   */
  getCertificateChain = (
    keyId: string,
    onSuccess: CallbackFunction<string[]>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_certificate_chain', [keyId], onSuccess, onError);
  };

  /**
   * Получить информацию о сертификате
   */
  getCertificateInfo = (
    certificate: string,
    onSuccess: CallbackFunction<CertificateInfo>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_certificate_info', [certificate], onSuccess, onError);
  };
}
