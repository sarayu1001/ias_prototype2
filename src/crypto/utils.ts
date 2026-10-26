/**
 * Cryptographic Utility Functions
 */

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Hex string must have an even length');
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function hexToBinaryString(hex: string): string {
  return Array.from(hex)
    .map((char) => parseInt(char, 16).toString(2).padStart(4, '0'))
    .join('');
}

/**
 * Calculates Hamming distance and bitwise differences between two hex strings
 */
export function calculateBitDiff(hexA: string, hexB: string): {
  distance: number;
  totalBits: number;
  flipPercentage: number;
  bitsA: string;
  bitsB: string;
  diffMask: boolean[];
} {
  const bitsA = hexToBinaryString(hexA);
  const bitsB = hexToBinaryString(hexB);
  const maxLen = Math.max(bitsA.length, bitsB.length);
  const padA = bitsA.padEnd(maxLen, '0');
  const padB = bitsB.padEnd(maxLen, '0');

  let distance = 0;
  const diffMask: boolean[] = [];

  for (let i = 0; i < maxLen; i++) {
    const isDiff = padA[i] !== padB[i];
    if (isDiff) distance++;
    diffMask.push(isDiff);
  }

  return {
    distance,
    totalBits: maxLen,
    flipPercentage: maxLen > 0 ? (distance / maxLen) * 100 : 0,
    bitsA: padA,
    bitsB: padB,
    diffMask,
  };
}

/**
 * Validates with the browser's hardware WebCrypto API: crypto.subtle.digest('SHA-512')
 */
export async function webCryptoSha512(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-512', data as unknown as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
