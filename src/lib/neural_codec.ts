import { BinaryShield } from './binaryShield';

export function encodeBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64');
  }
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(str)));
  }
  return '';
}

export function decodeBase64(b64: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf8');
  }
  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(b64)));
  }
  return '';
}

export class NeuralCodec {
  static async encode(data: any, shield?: BinaryShield): Promise<string> {
    const json = JSON.stringify(data);
    if (shield) {
      const packet = await shield.encryptPacket(json);
      return JSON.stringify(packet);
    }
    return encodeBase64(json);
  }

  static async decode(encoded: string, shield?: BinaryShield): Promise<any> {
    let raw = encoded;
    if (shield) {
      try {
        const packet = JSON.parse(encoded);
        raw = await shield.decryptPacket(packet);
      } catch (e) {
        // fallback
        raw = decodeBase64(encoded);
      }
    } else {
      raw = decodeBase64(encoded);
    }
    return JSON.parse(raw);
  }
}

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
