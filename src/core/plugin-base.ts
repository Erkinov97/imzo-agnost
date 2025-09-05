import type { PluginMethodCall, CallbackFunction, ErrorCallback, BasePlugin } from './types';
import CAPIWS from '../e-imzo/capiws';

/**
 * Core plugin base class that all E-IMZO plugins extend
 */
export abstract class EIMZOPlugin implements BasePlugin {
  abstract readonly name: string;
  public readonly version: string = '1.0.0';
  public readonly description: string = '';

  /**
   * Execute a plugin method call through CAPIWS
   */
  protected callMethod<T = any>(
    methodName: string,
    args: any[] = [],
    onSuccess: CallbackFunction<T>,
    onError: ErrorCallback
  ): void {
    const call: PluginMethodCall = {
      plugin: this.name,
      name: methodName,
      ...(args.length > 0 && { arguments: args })
    };

    CAPIWS.callFunction(call, onSuccess, onError);
  }

  /**
   * Create a promise-based wrapper for plugin methods
   */
  protected createPromiseMethod<TArgs extends any[], TResult = any>(methodName: string) {
    return (...args: TArgs): Promise<TResult> => {
      return new Promise((resolve, reject) => {
        this.callMethod<TResult>(
          methodName,
          args as any[],
          (event, data) => {
            if (data.success) {
              resolve(data as TResult);
            } else {
              reject(new Error(data.reason || 'Unknown error'));
            }
          },
          error => reject(error)
        );
      });
    };
  }

  /**
   * Create both callback and promise versions of a method
   */
  protected createMethod<TArgs extends any[], TResult = any>(methodName: string) {
    const promiseMethod = this.createPromiseMethod<TArgs, TResult>(methodName);

    const callbackMethod = (...args: [...TArgs, CallbackFunction<TResult>, ErrorCallback]) => {
      const methodArgs = args.slice(0, -2) as TArgs;
      const onSuccess = args[args.length - 2] as CallbackFunction<TResult>;
      const onError = args[args.length - 1] as ErrorCallback;

      this.callMethod<TResult>(methodName, methodArgs as any[], onSuccess, onError);
    };

    return {
      promise: promiseMethod,
      callback: callbackMethod
    };
  }
}

/**
 * Plugin manager for registering and accessing plugins
 */
export class PluginManager {
  private static plugins = new Map<string, EIMZOPlugin>();

  static register(plugin: EIMZOPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  static get<T extends EIMZOPlugin>(name: string): T | undefined {
    return this.plugins.get(name) as T;
  }

  static getAll(): EIMZOPlugin[] {
    return Array.from(this.plugins.values());
  }

  static has(name: string): boolean {
    return this.plugins.has(name);
  }
}

/**
 * Decorator for auto-registering plugins
 */
export function RegisterPlugin<T extends new () => EIMZOPlugin>(constructor: T): T {
  const instance = new constructor();
  PluginManager.register(instance);
  return constructor;
}
