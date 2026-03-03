// src/lib/utils/encryption.ts

const generateIV = (): Uint8Array =>
  window.crypto.getRandomValues(new Uint8Array(12));

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
      iterations: 100_000,
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
  const data = encoder.encode(text);

  // We cast both the algorithm object and the data to 'any' then the required type
  // to bypass the SharedArrayBuffer incompatibility check in TS 5.x
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource } as AesGcmParams,
    key,
    data as BufferSource
  );

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(
  input: string,
  key: CryptoKey
): Promise<string> {
  if (!input?.trim()) return "";

  try {
    const binaryStr = atob(input);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++)
      bytes[i] = binaryStr.charCodeAt(i);

    if (bytes.length < 28) return input;

    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource } as AesGcmParams,
      key,
      ciphertext as BufferSource
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err: any) {
    console.warn("Decryption skipped (Legacy or Key mismatch):", err.message);
    return input;
  }
}
