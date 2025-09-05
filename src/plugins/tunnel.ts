import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback } from '../core/types.js';

/**
 * Плагин для установки зашифрованного соединения с сервером по алг.шифрования ГОСТ-28147
 */
@RegisterPlugin
export class TunnelPlugin extends EIMZOPlugin {
  readonly name = 'tunnel';
  readonly description = 'Plugin for establishing encrypted connections using GOST-28147';

  /**
   * Создать зашифрованного соединения с сервером и вернуть TCP-порт для приема/передачи данных
   */
  createTunnel = (
    serverHost: string,
    serverPort: number,
    keyId: string,
    onSuccess: CallbackFunction<{ port: number }>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('create_tunnel', [serverHost, serverPort, keyId], onSuccess, onError);
  };

  // Promise-based wrapper (если нужен)
  async createTunnelAsync(serverHost: string, serverPort: number, keyId: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.createTunnel(
        serverHost,
        serverPort,
        keyId,
        (event, data) => {
          if (data.success) {
            resolve(data);
          } else {
            reject(new Error(data.reason ?? 'Unknown error'));
          }
        },
        error => reject(new Error(String(error)))
      );
    });
  }
}
