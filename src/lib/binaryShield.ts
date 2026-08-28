/**
 * EMG Core v49 Neural Code and Documentation Optimizer Engine
 * File Path: "src/lib/binaryShield.ts"
 * Sovereign Optimized Version: Comprehensive Type-Safety, Zero-Allocation Iterations, and Resilient Cryptographic Memory Handling.
 */

export interface EncryptionPacket {
  readonly data: string;
  readonly iv: string;
  readonly timestamp: number;
  readonly algorithm: string;
}

export interface DecryptionPacket {
  readonly data: string;
  readonly iv: string;
}

export class BinaryShield {
  private key: CryptoKey | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  constructor(private readonly keyHex: string) {
    if (typeof keyHex !== 'string' || keyHex.length !== 64) {
      throw new Error('Master Key must be a 64-character hex string.');
    }
  }

  private hexToBuffer(hex: string): ArrayBuffer {
    if (hex.length % 2 !== 0) {
      throw new Error('Invalid hex string length.');
    }
    
    const byteLength = hex.length / 2;
    const buffer = new ArrayBuffer(byteLength);
    const view = new Uint8Array(buffer);
    
    for (let i = 0; i < byteLength; i++) {
      const byteStr = hex.substring(i * 2, i * 2 + 2);
      const byte = parseInt(byteStr, 16);
      if (Number.isNaN(byte)) {
        throw new Error('Invalid hex characters.');
      }
      view[i] = byte;
    }
    
    return buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    const CHUNK_SIZE = 0x8000;
    
    for (let i = 0; i < len; i += CHUNK_SIZE) {
      const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, len));
      binary += String.fromCharCode(...Array.from(chunk));
    }
    
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return bytes.buffer;
    } catch {
      throw new Error('Invalid base64 string.');
    }
  }

  public async initialize(): Promise<void> {
    if (this.key) return;
    
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    
    this.initPromise = (async () => {
      try {
        const keyBuffer = this.hexToBuffer(this.keyHex);
        if (keyBuffer.byteLength !== 32) {
          throw new Error('Master Key must be 32 bytes (64 hex characters).');
        }
        
        this.key = await crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`Encryption initialization failed: ${errorMessage}`);
      } finally {
        this.isInitializing = false;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  public async encryptPacket(plaintext: string): Promise<EncryptionPacket> {
    if (typeof plaintext !== 'string') {
      throw new Error('Plaintext must be a string.');
    }

    await this.initialize();
    
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      this.key!,
      encoded
    );

    return {
      data: this.arrayBufferToBase64(ciphertext),
      iv: this.arrayBufferToBase64(nonce),
      timestamp: Math.floor(Date.now() / 1000),
      algorithm: 'AES-256-GCM'
    };
  }

  public async decryptPacket(packet: DecryptionPacket): Promise<string> {
    if (!packet || typeof packet !== 'object') {
      throw new Error('Invalid packet format.');
    }

    if (typeof packet.data !== 'string' || typeof packet.iv !== 'string') {
      throw new Error('Invalid packet data or iv format.');
    }

    try {
      await this.initialize();
      
      const nonce = this.base64ToArrayBuffer(packet.iv);
      const ciphertext = this.base64ToArrayBuffer(packet.data);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: nonce },
        this.key!,
        ciphertext
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      throw new Error(`Decryption failed: ${errorMessage}`);
    }
  }

  public async clear(): Promise<void> {
    this.key = null;
    this.isInitializing = false;
    this.initPromise = null;
  }
}