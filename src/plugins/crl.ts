import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback } from '../core/types.js';

export interface CRLInfo {
  issuer: string;
  thisUpdate: string;
  nextUpdate: string;
  revokedCertificates: {
    serialNumber: string;
    revocationDate: string;
    reason?: string;
  }[];
}

export interface CertificateStatus {
  isRevoked: boolean;
  revocationDate?: string;
  reason?: string;
}

/**
 * Плагин для работы с CRL (Certificate Revocation List)
 */
@RegisterPlugin
export class CRLPlugin extends EIMZOPlugin {
  readonly name = 'crl';
  readonly description = 'Plugin for working with Certificate Revocation Lists';

  /**
   * Открывает CRL
   */
  openCrl = (
    crlData: string,
    onSuccess: CallbackFunction<unknown>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('open_crl', [crlData], onSuccess, onError);
  };

  /**
   * Открывает CRL из файла
   */
  openCrlFile = (
    filePath: string,
    onSuccess: CallbackFunction<unknown>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('open_crl_file', [filePath], onSuccess, onError);
  };

  /**
   * Проверка статуса сертификата по CRL
   */
  checkCertificate = (
    certificate: string,
    crlId: string,
    onSuccess: CallbackFunction<CertificateStatus>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('check_certificate', [certificate, crlId], onSuccess, onError);
  };

  /**
   * Получить информацию о CRL
   */
  getCrlInfo = (
    crlId: string,
    onSuccess: CallbackFunction<CRLInfo>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('get_crl_info', [crlId], onSuccess, onError);
  };

  /**
   * Верификация CRL
   */
  verifyCrl = (
    crlId: string,
    issuerCertificate: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('verify_crl', [crlId, issuerCertificate], onSuccess, onError);
  };
}
