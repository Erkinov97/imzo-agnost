import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback } from '../core/types.js';

/**
 * Плагин для шифрования и дешифрования документа по алг.шифрования ГОСТ-28147, алг.обмена ключа ECDH-SHA256 в режиме P2P
 */
@RegisterPlugin
export class CipherPlugin extends EIMZOPlugin {
  readonly name = 'cipher';
  readonly description = 'Plugin for encryption/decryption using GOST-28147 and ECDH-SHA256';

  /**
   * Создать зашифрованный документ
   */
  encryptDocument = (
    data: string,
    recipientCertificate: string,
    senderKeyId: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod(
      'encrypt_document',
      [data, recipientCertificate, senderKeyId],
      onSuccess,
      onError
    );
  };

  /**
   * Дешифровать зашифрованный документ
   */
  decryptDocument = (
    encryptedData: string,
    recipientKeyId: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('decrypt_document', [encryptedData, recipientKeyId], onSuccess, onError);
  };
}
