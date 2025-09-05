// Core types for E-IMZO API Library
export interface ApiResponse<T = unknown> {
  success: boolean;
  reason?: string;
  data?: T;
  [key: string]: unknown;
}

export type CallbackFunction<T = unknown> = (event: MessageEvent, data: ApiResponse<T>) => void;

export type ErrorCallback = (error: unknown) => void;

export interface PluginMethodCall {
  plugin: string;
  name: string;
  arguments?: unknown[];
}

export interface BasePlugin {
  readonly name: string;
  readonly version?: string;
  readonly description?: string;
}

// Generic plugin method interface
export type PluginMethod<TArgs extends unknown[] = unknown[], TResult = unknown> = (
  ...args: [...TArgs, CallbackFunction<TResult>, ErrorCallback]
) => void;

// Utility types for better type inference
export type PluginMethodArgs<T> = T extends PluginMethod<infer Args, unknown> ? Args : never;
export type PluginMethodResult<T> =
  T extends PluginMethod<unknown[], infer Result> ? Result : never;

// Base response types
export interface ListResponse<T> {
  success: true;
  items: T[];
}

export interface KeyResponse {
  success: true;
  keyId: string;
}

export interface CertificateInfo {
  disk?: string;
  path?: string;
  name?: string;
  alias?: string;
  serialNumber?: string;
  subject?: string;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  [key: string]: unknown;
}

export interface TokenInfo {
  cardUID: string;
  statusInfo?: string;
  ownerName?: string;
  info?: string;
  [key: string]: unknown;
}
