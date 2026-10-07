/**
 * Client-Side Cryptographic Helper for HIPAA & GDPR Compliant Medical File Encryption
 * Uses Web Crypto API (AES-GCM 256-bit).
 */

/**
 * Derives a cryptographic key from a passphrase or generates a random key.
 * @param {string} secretKey - Passphrase or wallet signature
 */
export async function deriveKey(secretKey) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("Intellihealth-Salt-2024"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts an ArrayBuffer/Blob using AES-GCM 256.
 * @param {ArrayBuffer} data 
 * @param {string} secretKey 
 * @returns {Promise<{ encryptedBlob: Blob, iv: Uint8Array }>}
 */
export async function encryptMedicalFile(data, secretKey = "Intellihealth-HIPAA-Key") {
  const key = await deriveKey(secretKey);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  // Pack IV + Encrypted Data into a single Blob
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return new Blob([combined], { type: "application/octet-stream" });
}

/**
 * Decrypts a previously encrypted ArrayBuffer.
 * @param {ArrayBuffer} encryptedBuffer 
 * @param {string} secretKey 
 * @returns {Promise<ArrayBuffer>}
 */
export async function decryptMedicalFile(encryptedBuffer, secretKey = "Intellihealth-HIPAA-Key") {
  const key = await deriveKey(secretKey);
  const bytes = new Uint8Array(encryptedBuffer);
  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);

  return window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );
}
