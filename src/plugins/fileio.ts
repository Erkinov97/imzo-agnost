import { EIMZOPlugin, RegisterPlugin } from '../core/plugin-base.js';
import type { CallbackFunction, ErrorCallback } from '../core/types.js';

/**
 * Плагин для работы с файлами
 */
@RegisterPlugin
export class FileIOPlugin extends EIMZOPlugin {
  readonly name = 'fileio';
  readonly description = 'Plugin for file input/output operations';

  /**
   * Загруить файл
   */
  loadFile = (
    filePath: string,
    onSuccess: CallbackFunction<string>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('load_file', [filePath], onSuccess, onError);
  };

  /**
   * Записать содержимое zip файла на диск
   */
  writeFile = (
    zipContent: string,
    destinationPath: string,
    onSuccess: CallbackFunction<boolean>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('write_file', [zipContent, destinationPath], onSuccess, onError);
  };
}
