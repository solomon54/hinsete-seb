/**
 * Hinsete Seb Security Module
 * AES-GCM-256 Encryption for User Reflections (SRS-6.2-01)
 */

// Generates a random Initialization Vector (IV) for each encryption
const generateIV = () => window.crypto.getRandomValues(new Uint8Array(12));

// Derives a key from a password/secret (for local-first auth)
export async function deriveKey(
  password: string,
  salt: string
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(
  text: string,
  key: CryptoKey
): Promise<string> {
  const iv = generateIV();
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(text);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );

  // Combine IV and Encrypted Data for storage
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return btoa(String.fromCharCode(...combined)); // Convert to Base64 for storage
}

export async function decryptData(
  base64Data: string,
  key: CryptoKey
): Promise<string> {
  const combined = new Uint8Array(
    atob(base64Data)
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return new TextDecoder().decode(decryptedBuffer);
}
