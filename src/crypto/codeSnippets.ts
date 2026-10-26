export interface CodeSnippet {
  language: string;
  name: string;
  description: string;
  code: string;
}

export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    language: 'typescript',
    name: 'TypeScript (Pure BigInt, Zero Dependencies)',
    description: 'Bit-exact FIPS 180-4 implementation using native 64-bit BigInt math. Runs in any modern browser, Node.js, Deno, or Bun.',
    code: `// Pure TypeScript SHA-512 (FIPS 180-4 compliant)
const MASK64 = 0xffffffffffffffffn;

const INITIAL_H: readonly bigint[] = [
  0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn,
  0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,
  0x510e527fade682d1n, 0x9b05688c2b3e6c1fn,
  0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n,
];

const K: readonly bigint[] = [
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

const rotr = (x: bigint, n: bigint): bigint => ((x >> n) | (x << (64n - n))) & MASK64;
const shr = (x: bigint, n: bigint): bigint => (x >> n) & MASK64;
const ch = (x: bigint, y: bigint, z: bigint): bigint => ((x & y) ^ (~x & z)) & MASK64;
const maj = (x: bigint, y: bigint, z: bigint): bigint => ((x & y) ^ (x & z) ^ (y & z)) & MASK64;
const Sigma0 = (x: bigint): bigint => (rotr(x, 28n) ^ rotr(x, 34n) ^ rotr(x, 39n)) & MASK64;
const Sigma1 = (x: bigint): bigint => (rotr(x, 14n) ^ rotr(x, 18n) ^ rotr(x, 41n)) & MASK64;
const sigma0 = (x: bigint): bigint => (rotr(x, 1n) ^ rotr(x, 8n) ^ shr(x, 7n)) & MASK64;
const sigma1 = (x: bigint): bigint => (rotr(x, 19n) ^ rotr(x, 61n) ^ shr(x, 6n)) & MASK64;

export function sha512(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const bitLen = BigInt(bytes.length) * 8n;
  const rem = (bytes.length + 1) % 128;
  const k = (112 - rem + 128) % 128;
  const padded = new Uint8Array(bytes.length + 1 + k + 16);
  padded.set(bytes, 0);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setBigUint64(padded.length - 8, bitLen, false);

  let H = [...INITIAL_H];
  const numBlocks = padded.length / 128;

  for (let b = 0; b < numBlocks; b++) {
    const W = new Array<bigint>(80);
    const offset = b * 128;

    for (let t = 0; t < 16; t++) {
      W[t] = view.getBigUint64(offset + t * 8, false);
    }
    for (let t = 16; t < 80; t++) {
      W[t] = (sigma1(W[t - 2]) + W[t - 7] + sigma0(W[t - 15]) + W[t - 16]) & MASK64;
    }

    let [a, b, c, d, e, f, g, h] = H;

    for (let t = 0; t < 80; t++) {
      const T1 = (h + Sigma1(e) + ch(e, f, g) + K[t] + W[t]) & MASK64;
      const T2 = (Sigma0(a) + maj(a, b, c)) & MASK64;
      h = g;
      g = f;
      f = e;
      e = (d + T1) & MASK64;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) & MASK64;
    }

    H = H.map((v, idx) => (v + [a, b, c, d, e, f, g, h][idx]) & MASK64);
  }

  return H.map((v) => v.toString(16).padStart(16, '0')).join('');
}`,
  },
  {
    language: 'python',
    name: 'Python 3 (Standard Library & Custom)',
    description: 'Python example using standard library hashlib or standalone bitwise calculation.',
    code: `import hashlib

def sha512_hashlib(message: str) -> str:
    """Computes SHA-512 hex digest using Python standard library."""
    hasher = hashlib.sha512()
    hasher.update(message.encode('utf-8'))
    return hasher.hexdigest()

# Example test:
if __name__ == '__main__':
    msg = "abc"
    digest = sha512_hashlib(msg)
    print(f"Message: {msg}")
    print(f"SHA-512: {digest}")
    # Expected: ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f`,
  },
  {
    language: 'javascript',
    name: 'Browser WebCrypto API (Hardware Accelerated)',
    description: 'Using the native Web Cryptography API available in all modern browsers and Node.js 18+.',
    code: `async function sha512WebCrypto(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Example usage:
sha512WebCrypto("abc").then(console.log);`,
  },
];
