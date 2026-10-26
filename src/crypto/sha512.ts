/**
 * Pure TypeScript FIPS 180-4 Compliant SHA-512 Implementation.
 * Uses 64-bit BigInt arithmetic for bit-exact, hardware-independent execution.
 */

// 64-bit mask
export const MASK64 = 0xffffffffffffffffn;

// Initial hash values H^(0) (first 64 bits of the fractional parts of the square roots of the first 8 primes 2..19)
export const INITIAL_H: readonly bigint[] = [
  0x6a09e667f3bcc908n,
  0xbb67ae8584caa73bn,
  0x3c6ef372fe94f82bn,
  0xa54ff53a5f1d36f1n,
  0x510e527fade682d1n,
  0x9b05688c2b3e6c1fn,
  0x1f83d9abfb41bd6bn,
  0x5be0cd19137e2179n,
];

// Round constants K_0..K_79 (first 64 bits of fractional parts of cube roots of first 80 primes 2..409)
export const SHA512_K: readonly bigint[] = [
  0x428a2f98d728ae22n, 0x7137449123ef65cdn, 0xb5c0fbcfec4d3b2fn, 0xe9b5dba58189dbbcn,
  0x3956c25bf348b538n, 0x59f111f1b605d019n, 0x923f82a4af194f9bn, 0xab1c5ed5da6d8118n,
  0xd807aa98a3030242n, 0x12835b0145706fben, 0x243185be4ee4b28cn, 0x550c7dc3d5ffb4e2n,
  0x72be5d74f27b896fn, 0x80deb1fe3b1696b1n, 0x9bdc06a725c71235n, 0xc19bf174cf692694n,
  0xe49b69c19ef14ad2n, 0xefbe4786384f25e3n, 0x0fc19dc68b8cd5b5n, 0x240ca1cc77ac9c65n,
  0x2de92c6f592b0275n, 0x4a7484aa6ea6e483n, 0x5cb0a9dcbd41fbd4n, 0x76f988da831153b5n,
  0x983e5152ee66dfabn, 0xa831c66d2db43210n, 0xb00327c898fb213fn, 0xbf597fc7beef0ee4n,
  0xc6e00bf33da88fc2n, 0xd5a79147930aa725n, 0x06ca6351e003826fn, 0x142929670a0e6e70n,
  0x27b70a8546d22ffcn, 0x2e1b21385c26c926n, 0x4d2c6dfc5ac42aedn, 0x53380d139d95b3dfn,
  0x650a73548baf63den, 0x766a0abb3c77b2a8n, 0x81c2c92e47867d11n, 0x884a5424900f9302n,
  0x897ff3194678f647n, 0x983e5152f3a183f6n, 0xa2bfe8a14cf10364n, 0xa81a664bbc423001n,
  0xc2478794f74cbe61n, 0xcb61b2741cdeee91n, 0xd192e819d6ee521en, 0xd69906245565a910n,
  0xf40e35855771202an, 0x106aa07032bbd1b8n, 0x19a4c116b8d2d0c8n, 0x1e376c085141ab53n,
  0x2748774cdf8eeb99n, 0x34b0bcb5e19b48a8n, 0x391c0cb3c5c95a63n, 0x4ed8aa4ae3418acbn,
  0x5b9cca4f7763e373n, 0x682e6ff3d6b2b8a3n, 0x748f82ee5defb2fcn, 0x78a5636f43172f60n,
  0x84c87814a1f0ab72n, 0x8cc702081a6439ecn, 0x90befffa23631e28n, 0xa4506cebde82bde9n,
  0xbef9a3f7b2c67915n, 0xc67178f2e372532bn, 0xca273eceea26619cn, 0xd186b8c721c0c207n,
  0xeada7dd6cde0eb1en, 0xf57d4f7fee6ed178n, 0x06f067aa72176fban, 0x0a637dc5a2c898a6n,
  0x113f9804bef90daen, 0x1b710b35131c471bn, 0x28db77f523047d84n, 0x32caab7b40c72493n,
  0x3c9ebe0a15c9bebcn, 0x431d67c49c100d4cn, 0x4cc5d4becb3e42b6n, 0x597f299cfc657e2an,
];

export const K = SHA512_K;

// Bitwise rotation right (ROTR)
export function rotr(x: bigint, n: bigint): bigint {
  const shift = n % 64n;
  return ((x >> shift) | (x << (64n - shift))) & MASK64;
}

// Right shift (SHR)
export function shr(x: bigint, n: bigint): bigint {
  return (x >> n) & MASK64;
}

// Ch(x, y, z) = (x AND y) XOR (NOT x AND z)
export function ch(x: bigint, y: bigint, z: bigint): bigint {
  return ((x & y) ^ (~x & z)) & MASK64;
}

// Maj(x, y, z) = (x AND y) XOR (x AND z) XOR (y AND z)
export function maj(x: bigint, y: bigint, z: bigint): bigint {
  return ((x & y) ^ (x & z) ^ (y & z)) & MASK64;
}

// Sigma_0(x) = ROTR^28(x) XOR ROTR^34(x) XOR ROTR^39(x)
export function Sigma0(x: bigint): bigint {
  return (rotr(x, 28n) ^ rotr(x, 34n) ^ rotr(x, 39n)) & MASK64;
}

// Sigma_1(x) = ROTR^14(x) XOR ROTR^18(x) XOR ROTR^41(x)
export function Sigma1(x: bigint): bigint {
  return (rotr(x, 14n) ^ rotr(x, 18n) ^ rotr(x, 41n)) & MASK64;
}

// sigma_0(x) = ROTR^1(x) XOR ROTR^8(x) XOR SHR^7(x)
export function sigma0(x: bigint): bigint {
  return (rotr(x, 1n) ^ rotr(x, 8n) ^ shr(x, 7n)) & MASK64;
}

// sigma_1(x) = ROTR^19(x) XOR ROTR^61(x) XOR SHR^6(x)
export function sigma1(x: bigint): bigint {
  return (rotr(x, 19n) ^ rotr(x, 61n) ^ shr(x, 6n)) & MASK64;
}

/**
 * Format a 64-bit bigint to a 16-character hex string (zero padded)
 */
export function toHex64(val: bigint): string {
  return (val & MASK64).toString(16).padStart(16, '0');
}

/**
 * Format a 64-bit bigint to a 64-character binary string
 */
export function toBin64(val: bigint): string {
  return (val & MASK64).toString(2).padStart(64, '0');
}

/**
 * Convert string or Uint8Array to Uint8Array
 */
export function toUint8Array(input: string | Uint8Array): Uint8Array {
  if (typeof input === 'string') {
    return new TextEncoder().encode(input);
  }
  return input;
}

/**
 * Pads input bytes according to FIPS 180-4 section 5.1.2:
 * 1. Append byte 0x80 (single '1' bit followed by seven '0' bits)
 * 2. Append k zero bytes such that (length + 1 + k) % 128 === 112
 * 3. Append 16-byte (128-bit) big-endian representation of original message length in bits.
 */
export function padMessage(input: Uint8Array): {
  padded: Uint8Array;
  originalByteLength: number;
  originalBitLength: bigint;
  paddingZeroCount: number;
} {
  const originalByteLength = input.length;
  const originalBitLength = BigInt(originalByteLength) * 8n;

  // Length after adding 0x80
  const rem = (originalByteLength + 1) % 128;
  const paddingZeroCount = (112 - rem + 128) % 128;
  const totalLength = originalByteLength + 1 + paddingZeroCount + 16;

  const padded = new Uint8Array(totalLength);
  padded.set(input, 0);
  padded[originalByteLength] = 0x80;

  // 128-bit integer representing bit length in big-endian
  // In JS, originalBitLength fits in 64 bits comfortably for in-memory inputs,
  // high 64 bits are zero.
  const high64 = originalBitLength >> 64n;
  const low64 = originalBitLength & MASK64;

  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  view.setBigUint64(totalLength - 16, high64, false);
  view.setBigUint64(totalLength - 8, low64, false);

  return {
    padded,
    originalByteLength,
    originalBitLength,
    paddingZeroCount,
  };
}

/**
 * Pure SHA-512 calculation returning a 128-character lowercase hexadecimal hash.
 */
export function sha512(input: string | Uint8Array): string {
  const bytes = toUint8Array(input);
  const { padded } = padMessage(bytes);
  const numBlocks = padded.length / 128;

  let H = [...INITIAL_H];
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);

  for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
    const blockOffset = blockIdx * 128;
    const W = new Array<bigint>(80);

    // 1. Prepare message schedule W_0..W_15
    for (let t = 0; t < 16; t++) {
      W[t] = view.getBigUint64(blockOffset + t * 8, false);
    }

    // 2. Expand message schedule W_16..W_79
    for (let t = 16; t < 80; t++) {
      const s1 = sigma1(W[t - 2]);
      const s0 = sigma0(W[t - 15]);
      W[t] = (s1 + W[t - 7] + s0 + W[t - 16]) & MASK64;
    }

    // 3. Initialize working variables
    let [a, b, c, d, e, f, g, h] = H;

    // 4. 80 rounds of compression
    for (let t = 0; t < 80; t++) {
      const s1e = Sigma1(e);
      const ch_efg = ch(e, f, g);
      const T1 = (h + s1e + ch_efg + SHA512_K[t] + W[t]) & MASK64;
      const s0a = Sigma0(a);
      const maj_abc = maj(a, b, c);
      const T2 = (s0a + maj_abc) & MASK64;

      h = g;
      g = f;
      f = e;
      e = (d + T1) & MASK64;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) & MASK64;
    }

    // 5. Compute intermediate hash value
    H[0] = (H[0] + a) & MASK64;
    H[1] = (H[1] + b) & MASK64;
    H[2] = (H[2] + c) & MASK64;
    H[3] = (H[3] + d) & MASK64;
    H[4] = (H[4] + e) & MASK64;
    H[5] = (H[5] + f) & MASK64;
    H[6] = (H[6] + g) & MASK64;
    H[7] = (H[7] + h) & MASK64;
  }

  return H.map(toHex64).join('');
}

/**
 * Pure SHA-512 returning a 64-byte Uint8Array.
 */
export function sha512Bytes(input: string | Uint8Array): Uint8Array {
  const hex = sha512(input);
  const result = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    result[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return result;
}

/**
 * Detailed step record for round inspection in UI
 */
export interface RoundStep {
  round: number;
  W: bigint;
  K: bigint;
  a: bigint;
  b: bigint;
  c: bigint;
  d: bigint;
  e: bigint;
  f: bigint;
  g: bigint;
  h: bigint;
  Sigma1_e: bigint;
  ch_efg: bigint;
  T1: bigint;
  Sigma0_a: bigint;
  maj_abc: bigint;
  T2: bigint;
  nextA: bigint;
  nextE: bigint;
}

export interface BlockTrace {
  blockIndex: number;
  blockBytes: Uint8Array;
  W: bigint[];
  initialState: bigint[];
  rounds: RoundStep[];
  finalState: bigint[];
}

export interface SHA512Trace {
  inputBytes: Uint8Array;
  originalByteLength: number;
  originalBitLength: bigint;
  paddingZeroCount: number;
  paddedBytes: Uint8Array;
  blocks: BlockTrace[];
  finalH: bigint[];
  hashHex: string;
}

/**
 * Deep execution tracer for interactive educational visualization
 */
export function sha512Trace(input: string | Uint8Array): SHA512Trace {
  const bytes = toUint8Array(input);
  const { padded, originalByteLength, originalBitLength, paddingZeroCount } = padMessage(bytes);
  const numBlocks = padded.length / 128;

  let H = [...INITIAL_H];
  const view = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  const blocks: BlockTrace[] = [];

  for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
    const blockOffset = blockIdx * 128;
    const blockBytes = padded.slice(blockOffset, blockOffset + 128);
    const W = new Array<bigint>(80);

    for (let t = 0; t < 16; t++) {
      W[t] = view.getBigUint64(blockOffset + t * 8, false);
    }
    for (let t = 16; t < 80; t++) {
      const s1 = sigma1(W[t - 2]);
      const s0 = sigma0(W[t - 15]);
      W[t] = (s1 + W[t - 7] + s0 + W[t - 16]) & MASK64;
    }

    const initialState = [...H];
    const rounds: RoundStep[] = [];
    let [a, b, c, d, e, f, g, h] = H;

    for (let t = 0; t < 80; t++) {
      const s1e = Sigma1(e);
      const ch_efg = ch(e, f, g);
      const T1 = (h + s1e + ch_efg + SHA512_K[t] + W[t]) & MASK64;
      const s0a = Sigma0(a);
      const maj_abc = maj(a, b, c);
      const T2 = (s0a + maj_abc) & MASK64;

      const nextE = (d + T1) & MASK64;
      const nextA = (T1 + T2) & MASK64;

      rounds.push({
        round: t,
        W: W[t],
        K: SHA512_K[t],
        a,
        b,
        c,
        d,
        e,
        f,
        g,
        h,
        Sigma1_e: s1e,
        ch_efg,
        T1,
        Sigma0_a: s0a,
        maj_abc,
        T2,
        nextA,
        nextE,
      });

      h = g;
      g = f;
      f = e;
      e = nextE;
      d = c;
      c = b;
      b = a;
      a = nextA;
    }

    H[0] = (H[0] + a) & MASK64;
    H[1] = (H[1] + b) & MASK64;
    H[2] = (H[2] + c) & MASK64;
    H[3] = (H[3] + d) & MASK64;
    H[4] = (H[4] + e) & MASK64;
    H[5] = (H[5] + f) & MASK64;
    H[6] = (H[6] + g) & MASK64;
    H[7] = (H[7] + h) & MASK64;

    blocks.push({
      blockIndex: blockIdx,
      blockBytes,
      W,
      initialState,
      rounds,
      finalState: [...H],
    });
  }

  return {
    inputBytes: bytes,
    originalByteLength,
    originalBitLength,
    paddingZeroCount,
    paddedBytes: padded,
    blocks,
    finalH: H,
    hashHex: H.map(toHex64).join(''),
  };
}

/**
 * FIPS RFC 2104 HMAC-SHA-512 Implementation
 */
export function hmacSha512(key: string | Uint8Array, message: string | Uint8Array): string {
  const BLOCK_SIZE = 128; // 128 bytes (1024 bits) for SHA-512
  let keyBytes = toUint8Array(key);
  const msgBytes = toUint8Array(message);

  if (keyBytes.length > BLOCK_SIZE) {
    keyBytes = sha512Bytes(keyBytes);
  }

  const paddedKey = new Uint8Array(BLOCK_SIZE);
  paddedKey.set(keyBytes);

  const kIpad = new Uint8Array(BLOCK_SIZE + msgBytes.length);
  const kOpad = new Uint8Array(BLOCK_SIZE + 64); // 64 bytes = SHA-512 digest size

  for (let i = 0; i < BLOCK_SIZE; i++) {
    kIpad[i] = paddedKey[i] ^ 0x36;
    kOpad[i] = paddedKey[i] ^ 0x5c;
  }
  kIpad.set(msgBytes, BLOCK_SIZE);

  const innerHash = sha512Bytes(kIpad);
  kOpad.set(innerHash, BLOCK_SIZE);

  return sha512(kOpad);
}
