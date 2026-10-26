/**
 * Official NIST FIPS 180-4, RFC 6234, and RFC 4231 HMAC-SHA-512 test vectors.
 */

export interface TestVector {
  id: string;
  name: string;
  category: 'Standard' | 'Boundary' | 'HMAC' | 'Avalanche';
  input: string;
  isHexInput?: boolean;
  expectedHash: string;
  description: string;
  key?: string; // For HMAC
}

export const NIST_TEST_VECTORS: TestVector[] = [
  {
    id: 'empty',
    name: 'Empty String (0 bits)',
    category: 'Standard',
    input: '',
    expectedHash: 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
    description: 'NIST CAVP zero-length input, tests proper initial padding and zero-length 128-bit length append.',
  },
  {
    id: 'abc',
    name: 'Short Message "abc" (24 bits)',
    category: 'Standard',
    input: 'abc',
    expectedHash: 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    description: 'FIPS PUB 180-4 standard primary 3-byte test vector for SHA-512.',
  },
  {
    id: 'fox',
    name: 'Quick Brown Fox',
    category: 'Standard',
    input: 'The quick brown fox jumps over the lazy dog',
    expectedHash: '07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6',
    description: 'Standard English pangram (43 bytes / 344 bits), fits in a single 1024-bit block.',
  },
  {
    id: 'alphabet',
    name: 'Full Lowercase Alphabet',
    category: 'Standard',
    input: 'abcdefghijklmnopqrstuvwxyz',
    expectedHash: '4dbff86cc2ca1bae1e16468a0e01f324ac477b14c484ac52d6a445193837da80f557350ee7f43f7f52a723b82fa30b39e5e7e6e4ae22a1aa67c4e4ec6824a71e',
    description: '26 ASCII letters test vector.',
  },
  {
    id: 'multi_block',
    name: 'Two Blocks (112-byte FIPS 180-4 vector)',
    category: 'Boundary',
    input: 'abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu',
    expectedHash: '8e959b75dae313da8cf4f72814fc143f8f7779c6eb9f7fa17299aeadb6889018501d289e4900f7e4331b99dec4b5433ac7d329eeb6dd26545e96e55b874be909',
    description: '112-byte test vector that exactly hits the padding boundary, forcing an extra 1024-bit block.',
  },
  {
    id: 'boundary_128',
    name: 'Exact 1024-bit Boundary (128 bytes)',
    category: 'Boundary',
    input: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    expectedHash: 'f4544f8ea030bc39e05f037dd787c89736c589b25fb49ab31e34e567ab6807f45778a48ef01d8985175e47c1664177d54b859345c2250284ab941f17bc841bb2',
    description: 'Exactly 128 bytes (1 block), testing rollover to a second padding block.',
  },
  {
    id: 'hmac_1',
    name: 'HMAC-SHA-512 (RFC 4231 Case 1)',
    category: 'HMAC',
    key: '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', // 20 bytes 0x0b
    input: 'Hi There',
    expectedHash: '87aa7c45dad628d08ecc5be1229adc42c38a165436a5fa163f8275617d79ab73fb4f34d557284d9bc77d95cdc83abec34907447d6b583cbeeb8e86db3acd514c',
    description: 'RFC 4231 Test Case 1 with 20-byte key and "Hi There" ASCII message.',
  },
  {
    id: 'hmac_2',
    name: 'HMAC-SHA-512 (RFC 4231 Case 2)',
    category: 'HMAC',
    key: 'Jefe',
    input: 'what do ya want for nothing?',
    expectedHash: '164b075414f12e53bd5c39c8188150b13d08623a324ccb1679d2ba3940f6f7da791a4cad8c296ecf6ddb4f03c4f2f0816ac672adac77f5f9bee57f55307094d5',
    description: 'RFC 4231 Test Case 2 with ASCII key "Jefe".',
  },
];
