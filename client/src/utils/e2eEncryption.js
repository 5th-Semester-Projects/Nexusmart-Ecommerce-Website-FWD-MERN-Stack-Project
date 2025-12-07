/**
 * End-to-End Encryption Service
 * Client-side encryption for sensitive data
 */

// Web Crypto API wrapper
class E2EEncryptionService {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12;
    this.saltLength = 16;
    this.iterations = 100000;
    this.keyCache = new Map();
  }

  // Generate a random key
  async generateKey() {
    const key = await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength
      },
      true,
      ['encrypt', 'decrypt']
    );
    return key;
  }

  // Derive key from password
  async deriveKeyFromPassword(password, salt) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive AES key from password
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.algorithm,
        length: this.keyLength
      },
      true,
      ['encrypt', 'decrypt']
    );

    return derivedKey;
  }

  // Generate random bytes
  generateRandomBytes(length) {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  // Export key to raw format
  async exportKey(key) {
    const exported = await crypto.subtle.exportKey('raw', key);
    return new Uint8Array(exported);
  }

  // Import key from raw format
  async importKey(keyData) {
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.algorithm },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Convert ArrayBuffer to Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Convert Base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Encrypt data with key
  async encrypt(data, key) {
    const encoder = new TextEncoder();
    const iv = this.generateRandomBytes(this.ivLength);

    const dataBuffer = typeof data === 'string'
      ? encoder.encode(data)
      : new Uint8Array(data);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv
      },
      key,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return this.arrayBufferToBase64(combined.buffer);
  }

  // Decrypt data with key
  async decrypt(encryptedBase64, key) {
    const combined = new Uint8Array(this.base64ToArrayBuffer(encryptedBase64));

    // Extract IV and encrypted data
    const iv = combined.slice(0, this.ivLength);
    const encryptedData = combined.slice(this.ivLength);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv
      },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  // Encrypt with password
  async encryptWithPassword(data, password) {
    const salt = this.generateRandomBytes(this.saltLength);
    const key = await this.deriveKeyFromPassword(password, salt);

    const encrypted = await this.encrypt(data, key);

    // Prepend salt to encrypted data
    const saltBase64 = this.arrayBufferToBase64(salt.buffer);

    return {
      salt: saltBase64,
      data: encrypted
    };
  }

  // Decrypt with password
  async decryptWithPassword(encryptedObj, password) {
    const salt = new Uint8Array(this.base64ToArrayBuffer(encryptedObj.salt));
    const key = await this.deriveKeyFromPassword(password, salt);

    return await this.decrypt(encryptedObj.data, key);
  }

  // Generate RSA key pair for asymmetric encryption
  async generateRSAKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );

    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey
    };
  }

  // Export RSA public key
  async exportRSAPublicKey(publicKey) {
    const exported = await crypto.subtle.exportKey('spki', publicKey);
    return this.arrayBufferToBase64(exported);
  }

  // Import RSA public key
  async importRSAPublicKey(publicKeyBase64) {
    const keyData = this.base64ToArrayBuffer(publicKeyBase64);
    return await crypto.subtle.importKey(
      'spki',
      keyData,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['encrypt']
    );
  }

  // Encrypt with RSA public key
  async encryptWithRSA(data, publicKey) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      dataBuffer
    );

    return this.arrayBufferToBase64(encryptedData);
  }

  // Decrypt with RSA private key
  async decryptWithRSA(encryptedBase64, privateKey) {
    const encryptedData = this.base64ToArrayBuffer(encryptedBase64);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  // Generate digital signature
  async sign(data, privateKey) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Generate signing key if needed
    const signingKeyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      true,
      ['sign', 'verify']
    );

    const signature = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: 'SHA-256'
      },
      signingKeyPair.privateKey,
      dataBuffer
    );

    return {
      signature: this.arrayBufferToBase64(signature),
      publicKey: await crypto.subtle.exportKey('spki', signingKeyPair.publicKey)
    };
  }

  // Verify digital signature
  async verify(data, signatureBase64, publicKeyData) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const signatureBuffer = this.base64ToArrayBuffer(signatureBase64);

    const publicKey = await crypto.subtle.importKey(
      'spki',
      publicKeyData,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      true,
      ['verify']
    );

    return await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: 'SHA-256'
      },
      publicKey,
      signatureBuffer,
      dataBuffer
    );
  }

  // Hash data using SHA-256
  async hash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return this.arrayBufferToBase64(hashBuffer);
  }

  // Secure random token generator
  generateSecureToken(length = 32) {
    const bytes = this.generateRandomBytes(length);
    return this.arrayBufferToBase64(bytes.buffer);
  }

  // Clear key cache
  clearKeyCache() {
    this.keyCache.clear();
  }
}

// Singleton instance
const e2eEncryption = new E2EEncryptionService();

export default e2eEncryption;

// React hook for E2E encryption
import { useState, useCallback } from 'react';

export const useE2EEncryption = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState(null);

  const encryptData = useCallback(async (data, password) => {
    setIsEncrypting(true);
    setError(null);

    try {
      const result = await e2eEncryption.encryptWithPassword(data, password);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  const decryptData = useCallback(async (encryptedObj, password) => {
    setIsDecrypting(true);
    setError(null);

    try {
      const result = await e2eEncryption.decryptWithPassword(encryptedObj, password);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const generateSecureKey = useCallback(async () => {
    const key = await e2eEncryption.generateKey();
    const exported = await e2eEncryption.exportKey(key);
    return e2eEncryption.arrayBufferToBase64(exported.buffer);
  }, []);

  const hashData = useCallback(async (data) => {
    return await e2eEncryption.hash(data);
  }, []);

  return {
    encryptData,
    decryptData,
    generateSecureKey,
    hashData,
    isEncrypting,
    isDecrypting,
    error
  };
};
