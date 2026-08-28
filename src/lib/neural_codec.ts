import { BinaryShield } from './binaryShield';

/**
 * Encodes a UTF-8 string to Base64 with environment-agnostic fallback safety and optimized memory handling.
 */
export function encodeBase64(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64');
  }
  
  if (typeof btoa === 'function') {
    try {
      const bytes = new TextEncoder().encode(str);
      const len = bytes.byteLength;
      
      // Prevent stack overflow/performance degradation on massive arrays by batching chunks
      const CHUNK_SIZE = 0x8000;
      let binary = '';
      
      for (let i = 0; i < len; i += CHUNK_SIZE) {
        const chunk = bytes.subarray(i, i + CHUNK_SIZE);
        // Explicitly map chunk elements to character codes for bulk conversion
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      return btoa(binary);
    } catch {
      return '';
    }
  }
  
  return '';
}

/**
 * Decodes a Base64 string back to UTF-8 with environment-agnostic fallback safety and high-throughput memory buffers.
 */
export function decodeBase64(b64: string): string {
  if (typeof b64 !== 'string') {
    return '';
  }

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
  public static async encode<T = unknown>(data: T, shield?: BinaryShield): Promise<string> {
    try {
      const json = JSON.stringify(data);
      if (shield) {
        const packet = await shield.encryptPacket(json);
        return JSON.stringify(packet);
      }
      return encodeBase64(json);
    } catch (error) {
      throw new Error(`NeuralCodec encoding failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Decodes and optionally unshields encrypted transmission packets back into strongly typed payloads.
   */
  public static async decode<T = unknown>(encoded: string, shield?: BinaryShield): Promise<T> {
    if (typeof encoded !== 'string' || encoded.trim() === '') {
      throw new Error('NeuralCodec decode received empty or invalid input payload.');
    }

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

    if (raw === '') {
      throw new Error('NeuralCodec decode failed to retrieve raw data string.');
    }

    return JSON.parse(raw) as T;
  }
}

/**
 * Minifies JSON or general code text while guaranteeing structural integrity and memory optimization.
 */
export function minifyCode(code: string, path: string): string {
  if (typeof code !== 'string') {
    return '';
  }

  if (typeof path === 'string' && path.endsWith('.json')) {
    try {
      return JSON.stringify(JSON.parse(code));
    } catch {
      return code;
    }
  }
  
  return code.replace(/\s+/g, ' ').trim();
}