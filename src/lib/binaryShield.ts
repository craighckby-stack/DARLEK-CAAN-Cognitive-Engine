interface EncryptionPacket {
  data: string;
  iv: string;
  timestamp: number;
  algorithm: string;
}

interface DecryptionPacket {
  data: string;
  iv: string;
}

export class BinaryShield {
  private key: CryptoKey | null = null;
  private isInitializing = false;

  constructor(private keyHex: string) {
    if (typeof keyHex !== 'string' || keyHex.length !== 64) {
      throw new Error('Master Key must be a 64-character hex string.');
    }
  }

  private hexToBuffer(hex: string): ArrayBuffer {
    if (hex.length % 2 !== 0) {
      throw new Error('Invalid hex string length.');
    }
    
    try {
      return new Uint8Array(
        hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      ).buffer;
    } catch (e) {
      throw new Error('Invalid hex characters.');
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    return btoa(
      String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)))
    );
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    try {
      const binaryString = atob(base64);
      return new Uint8Array(
        Array.from(binaryString).map(char => char.charCodeAt(0))
      ).buffer;
    } catch (e) {
      throw new Error('Invalid base64 string.');
    }
  }

  async initialize(): Promise<void> {
    if (this.key) return;
    
    // Prevent race conditions during initialization
    if (this.isInitializing) {
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.key) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 10);
      });
      return;
    }

    this.isInitializing = true;
    
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
    } catch (e) {
      throw new Error(`Encryption initialization failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      this.isInitializing = false;
    }
  }

  async encryptPacket(plaintext: string): Promise<EncryptionPacket> {
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

  async decryptPacket(packet: DecryptionPacket): Promise<string> {
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
    } catch (e) {
      throw new Error(`Decryption failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  // Cleanup method to securely clear the key
  async clear(): Promise<void> {
    if (this.key) {
      try {
        // In a real implementation, we might want to zero out the key material
        // Note: Web Crypto API doesn't provide a direct way to zero out keys
        this.key = null;
      } catch (e) {
        console.error('Error during key cleanup:', e);
      }
    }
  }
}