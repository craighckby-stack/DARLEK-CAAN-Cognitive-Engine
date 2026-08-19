import { BinaryShield } from './binaryShield';

export class NeuralCodec {
  static async encode(data: any, shield?: BinaryShield): Promise<string> {
    const json = JSON.stringify(data);
    if (shield) {
      const packet = await shield.encryptPacket(json);
      return JSON.stringify(packet);
    }
    return btoa(encodeURIComponent(json));
  }

  static async decode(encoded: string, shield?: BinaryShield): Promise<any> {
    let raw = encoded;
    if (shield) {
      try {
        const packet = JSON.parse(encoded);
        raw = await shield.decryptPacket(packet);
      } catch (e) {
        // fallback
        raw = decodeURIComponent(atob(encoded));
      }
    } else {
      raw = decodeURIComponent(atob(encoded));
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
