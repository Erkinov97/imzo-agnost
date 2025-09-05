/**
 * Base64 encoding/decoding utilities
 * This file provides Base64 API interface types for E-IMZO
 */

export interface Base64API {
  readonly VERSION: string;
  encode: (input: string, urlSafe?: boolean) => string;
  decode: (input: string) => string;
  isValid: (input: string) => boolean;
}

declare global {
  interface Window {
    Base64: Base64API;
  }
   
  var Base64: Base64API | undefined;
}

/**
 * High-performance Base64 implementation
 * Optimized for both browser and Node.js environments
 */
(() => {
  'use strict';

  const VERSION = '3.0.0';
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const URL_SAFE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  // Pre-computed lookup tables for O(1) performance
  const DECODE_TABLE = (() => {
    const table = Array.from({ length: 128 }, () => -1);
    for (let i = 0; i < 64; i++) {
      table[CHARS.charCodeAt(i)] = i;
      table[URL_SAFE_CHARS.charCodeAt(i)] = i;
    }
    return table;
  })();

  // Native browser APIs detection
  const hasNativeSupport = typeof btoa === 'function' && typeof atob === 'function';

  // UTF-8 encoding
  const toUTF8Bytes = (str: string): number[] => {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else if ((code & 0xfc00) === 0xd800) {
        // Surrogate pair
        const hi = code;
        const lo = str.charCodeAt(++i);
        const codePoint = 0x10000 + ((hi & 0x3ff) << 10) + (lo & 0x3ff);
        bytes.push(
          0xf0 | (codePoint >> 18),
          0x80 | ((codePoint >> 12) & 0x3f),
          0x80 | ((codePoint >> 6) & 0x3f),
          0x80 | (codePoint & 0x3f)
        );
      } else {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      }
    }
    return bytes;
  };

  // High-performance base64 encoding
  const encodeBytes = (bytes: number[], urlSafe: boolean): string => {
    const chars = urlSafe ? URL_SAFE_CHARS : CHARS;
    let result = '';

    for (let i = 0; i < bytes.length; i += 3) {
      const b1 = bytes[i] ?? 0;
      const b2 = bytes[i + 1] ?? 0;
      const b3 = bytes[i + 2] ?? 0;

      const bitmap = (b1 << 16) | (b2 << 8) | b3;

      result +=
        chars.charAt((bitmap >> 18) & 0x3f) +
        chars.charAt((bitmap >> 12) & 0x3f) +
        (i + 1 < bytes.length ? chars.charAt((bitmap >> 6) & 0x3f) : '=') +
        (i + 2 < bytes.length ? chars.charAt(bitmap & 0x3f) : '=');
    }

    return result;
  };

  // Validation
  const isValidBase64 = (input: string): boolean => {
    if (!input || typeof input !== 'string') return false;

    const clean = input.replace(/=/g, '');
    if (clean.length % 4 === 1) return false;

    return /^[A-Za-z0-9+/\-_]*$/.test(clean);
  };

  // Main encoding function
  const encode = (input: string, urlSafe = false): string => {
    if (typeof input !== 'string') {
      throw new TypeError('Input must be a string');
    }

    if (!input) return '';

    // Use native btoa for ASCII-only strings when available
    if (hasNativeSupport && !urlSafe && /^[\x20-\x7F]*$/.test(input)) {
      return btoa(input);
    }

    const bytes = toUTF8Bytes(input);
    return encodeBytes(bytes, urlSafe);
  };

  // Main decoding function
  const decode = (input: string): string => {
    if (typeof input !== 'string') {
      throw new TypeError('Input must be a string');
    }

    if (!input) return '';

    if (!isValidBase64(input)) {
      throw new Error('Invalid base64 string');
    }

    // Use native atob when available
    if (hasNativeSupport && /^[A-Za-z0-9+/]*={0,2}$/.test(input)) {
      try {
        return atob(input);
      } catch {
        // Fall through to manual decode
      }
    }

    // Manual decoding fallback
    const clean = input.replace(/[=\s]/g, '');
    const bytes: number[] = [];

    for (let i = 0; i < clean.length; i += 4) {
      const c1 = DECODE_TABLE[clean.charCodeAt(i)] || 0;
      const c2 = DECODE_TABLE[clean.charCodeAt(i + 1)] || 0;
      const c3 = DECODE_TABLE[clean.charCodeAt(i + 2)] || 0;
      const c4 = DECODE_TABLE[clean.charCodeAt(i + 3)] || 0;

      const bitmap = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;

      bytes.push((bitmap >> 16) & 0xff);
      if (i + 2 < clean.length) bytes.push((bitmap >> 8) & 0xff);
      if (i + 3 < clean.length) bytes.push(bitmap & 0xff);
    }

    // Convert bytes back to string
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      if (typeof byte === 'undefined') continue;

      if (byte < 0x80) {
        result += String.fromCharCode(byte);
      } else if ((byte >> 5) === 0x06) {
        const nextByte = bytes[++i];
        if (typeof nextByte !== 'undefined') {
          result += String.fromCharCode(((byte & 0x1f) << 6) | (nextByte & 0x3f));
        }
      } else if ((byte >> 4) === 0x0e) {
        const nextByte1 = bytes[++i];
        const nextByte2 = bytes[++i];
        if (typeof nextByte1 !== 'undefined' && typeof nextByte2 !== 'undefined') {
          result += String.fromCharCode(
            ((byte & 0x0f) << 12) | ((nextByte1 & 0x3f) << 6) | (nextByte2 & 0x3f)
          );
        }
      }
    }

    return result;
  };

  // Public API
  const Base64: Base64API = Object.freeze({
    VERSION,
    encode,
    decode,
    isValid: isValidBase64
  });

  // Export to global
  const globalObj = (() => {
    return (typeof globalThis !== 'undefined' ? globalThis : global) as Record<string, unknown>;
  })();

  globalObj.Base64 = Base64;

  // CommonJS support
  if (typeof module === 'object' && module.exports) {
    module.exports = Base64;
  }
})();
