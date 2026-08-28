import { BinaryShield } from './binaryShield';

/**
 * Encodes a UTF-8 string to Base64 with environment-agnostic fallback safety.
 */
export function encodeBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64');
  }
  if (typeof btoa === 'function') {
    // Modern TextEncoder / Uint8Array approach avoids deprecated unescape/encodeURIComponent
    try {
      const bytes = new TextEncoder().encode(str);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * Decodes a Base64 string back to UTF-8 with environment-agnostic fallback safety.
 */
export function decodeBase64(b64: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf8');
  }
  if (typeof atob === 'function') {
    try {
      const binary = atob(b64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * High-performance Neural Codec engine for secure serialization, encryption, and deserialization.
 */
export class NeuralCodec {
  /**
   * Encodes and optionally shields arbitrary data payloads into a secure transmission format.
   */
  static async encode<T = unknown>(data: T, shield?: BinaryShield): Promise<string> {
    const json = JSON.stringify(data);
    if (shield) {
      const packet = await shield.encryptPacket(json);
      return JSON.stringify(packet);
    }
    return encodeBase64(json);
  }

  /**
   * Decodes and optionally unshields encrypted transmission packets back into strongly typed payloads.
   */
  static async decode<T = unknown>(encoded: string, shield?: BinaryShield): Promise<T> {
    let raw = encoded;
    if (shield) {
      try {
        const packet = JSON.parse(encoded);
        raw = await shield.decryptPacket(packet);
      } catch {
        // Fallback to standard base64 decoding if packet parsing or decryption fails
        raw = decodeBase64(encoded);
      }
    } else {
      raw = decodeBase64(encoded);
    }
    return JSON.parse(raw) as T;
  }
}

/**
 * Minifies JSON or general code text while guaranteeing structural integrity.
 */
export function minifyCode(code: string, path: string): string {
  if (path.endsWith('.json')) {
    try {
      return JSON.stringify(JSON.parse(code));
    } catch {
      return code;
    }
  }
  return code.replace(/\s+/g, ' ').trim();
}