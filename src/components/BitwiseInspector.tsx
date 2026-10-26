import React, { useState } from 'react';
import {
  rotr,
  shr,
  ch,
  maj,
  Sigma0,
  Sigma1,
  sigma0,
  sigma1,
  toHex64,
  toBin64,
  MASK64,
} from '../crypto/sha512';
import { Binary, RefreshCw, Zap } from 'lucide-react';

export const BitwiseInspector: React.FC = () => {
  const [selectedOperation, setSelectedOperation] = useState<
    'rotr' | 'shr' | 'ch' | 'maj' | 'Sigma0' | 'Sigma1' | 'sigma0' | 'sigma1'
  >('rotr');

  // Working 64-bit words as BigInts
  const [wordX, setWordX] = useState<bigint>(0x6a09e667f3bcc908n); // Initial H[0]
  const [wordY, setWordY] = useState<bigint>(0xbb67ae8584caa73bn); // Initial H[1]
  const [wordZ, setWordZ] = useState<bigint>(0x3c6ef372fe94f82bn); // Initial H[2]
  const [shiftAmount, setShiftAmount] = useState<number>(28);

  // Compute output based on operation
  const computeResult = (): { result: bigint; formula: string; description: string } => {
    switch (selectedOperation) {
      case 'rotr':
        return {
          result: rotr(wordX, BigInt(shiftAmount)),
          formula: `ROTR^${shiftAmount}(x) = (x >> ${shiftAmount}) | (x << ${64 - shiftAmount})`,
          description: `Rotates the 64-bit word x circularly to the right by ${shiftAmount} positions. Bits falling off the right end wrap around to the left.`,
        };
      case 'shr':
        return {
          result: shr(wordX, BigInt(shiftAmount)),
          formula: `SHR^${shiftAmount}(x) = x >> ${shiftAmount}`,
          description: `Shifts the 64-bit word x logically to the right by ${shiftAmount} positions. Vacated left bits are filled with 0s.`,
        };
      case 'ch':
        return {
          result: ch(wordX, wordY, wordZ),
          formula: 'Ch(x, y, z) = (x ∧ y) ⊕ (¬x ∧ z)',
          description: 'Conditional Choose function: For each bit position, if bit in x is 1, chooses bit from y; if bit in x is 0, chooses bit from z.',
        };
      case 'maj':
        return {
          result: maj(wordX, wordY, wordZ),
          formula: 'Maj(x, y, z) = (x ∧ y) ⊕ (x ∧ z) ⊕ (y ∧ z)',
          description: 'Majority function: For each bit position, returns 1 if at least two of the three input bits are 1; otherwise returns 0.',
        };
      case 'Sigma0':
        return {
          result: Sigma0(wordX),
          formula: 'Σ₀(x) = ROTR²⁸(x) ⊕ ROTR³⁴(x) ⊕ ROTR³⁹(x)',
          description: 'Compression transformation on register a using 3 circular rotations.',
        };
      case 'Sigma1':
        return {
          result: Sigma1(wordX),
          formula: 'Σ₁(x) = ROTR¹⁴(x) ⊕ ROTR¹⁸(x) ⊕ ROTR⁴¹(x)',
          description: 'Compression transformation on register e using 3 circular rotations.',
        };
      case 'sigma0':
        return {
          result: sigma0(wordX),
          formula: 'σ₀(x) = ROTR¹(x) ⊕ ROTR⁸(x) ⊕ SHR⁷(x)',
          description: 'Message schedule expansion function applied to W[t-15]. Uses 2 rotations and 1 logical shift.',
        };
      case 'sigma1':
        return {
          result: sigma1(wordX),
          formula: 'σ₁(x) = ROTR¹⁹(x) ⊕ ROTR⁶¹(x) ⊕ SHR⁶(x)',
          description: 'Message schedule expansion function applied to W[t-2]. Uses 2 rotations and 1 logical shift.',
        };
    }
  };

  const { result, formula, description } = computeResult();

  // Helper to toggle a single bit in a 64-bit word
  const toggleBit = (word: bigint, setWord: (val: bigint) => void, bitPos: number) => {
    // bitPos: 0 is MSB (bit 63 from left), 63 is LSB (bit 0 from left)
    const shift = 63n - BigInt(bitPos);
    const mask = 1n << shift;
    setWord((word ^ mask) & MASK64);
  };

  const setRandomWord = (setWord: (val: bigint) => void) => {
    const array = new BigUint64Array(1);
    crypto.getRandomValues(array);
    setWord(array[0] & MASK64);
  };

  // Render an interactive 64-bit visual ribbon
  const renderBitRibbon = (
    label: string,
    word: bigint,
    setWord: (val: bigint) => void,
    color: string
  ) => {
    const binStr = toBin64(word);
    return (
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${color}`}>{label}</span>
            <span className="font-mono text-slate-400">0x{toHex64(word)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => setWord(0n)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              All 0s
            </button>
            <button
              onClick={() => setWord(MASK64)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              All 1s
            </button>
            <button
              onClick={() => setWord((~word) & MASK64)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            >
              Invert
            </button>
            <button
              onClick={() => setRandomWord(setWord)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Random
            </button>
          </div>
        </div>

        {/* 64 clickable bit buttons */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 overflow-x-auto">
          <div className="flex gap-[3px] min-w-[620px]">
            {Array.from({ length: 64 }).map((_, idx) => {
              const bit = binStr[idx];
              const isOne = bit === '1';
              return (
                <button
                  key={idx}
                  onClick={() => toggleBit(word, setWord, idx)}
                  className={`h-7 flex-1 rounded text-[10px] font-mono font-bold transition-all ${
                    isOne
                      ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_4px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900 text-slate-500 hover:bg-slate-800 border border-slate-800'
                  }`}
                  title={`Bit index ${63 - idx} (click to toggle)`}
                >
                  {bit}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 px-0.5">
            <span>Bit 63 (MSB)</span>
            <span>Bit 0 (LSB)</span>
          </div>
        </div>
      </div>
    );
  };

  const isMultiInput = selectedOperation === 'ch' || selectedOperation === 'maj';
  const isShiftOp = selectedOperation === 'rotr' || selectedOperation === 'shr';

  return (
    <div className="space-y-6">
      {/* Overview & Function Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">SHA-512 64-Bit Mathematical Primitives</h2>
          <p className="text-sm text-slate-400 mt-1">
            Explore the core non-linear algebraic functions, circular right rotations, and logical shifts that provide cryptographic diffusion and confusion.
          </p>
        </div>

        {/* Operation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 p-1 bg-slate-950 border border-slate-800 rounded-lg w-fit">
          {[
            { id: 'rotr', label: 'ROTRⁿ(x)' },
            { id: 'shr', label: 'SHRⁿ(x)' },
            { id: 'ch', label: 'Ch(x, y, z)' },
            { id: 'maj', label: 'Maj(x, y, z)' },
            { id: 'Sigma0', label: 'Σ₀(x)' },
            { id: 'Sigma1', label: 'Σ₁(x)' },
            { id: 'sigma0', label: 'σ₀(x)' },
            { id: 'sigma1', label: 'σ₁(x)' },
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => setSelectedOperation(op.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md font-mono transition-colors ${
                selectedOperation === op.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Function Description & Formula Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-base font-semibold text-white font-mono text-cyan-400">{formula}</span>
          <span className="text-xs font-mono text-slate-400">FIPS 180-4 Section 4.1.3</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

        {isShiftOp && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Shift/Rotation Count n: <strong>{shiftAmount}</strong> bits</span>
              <span>Range: 1..63</span>
            </div>
            <input
              type="range"
              min="1"
              max="63"
              value={shiftAmount}
              onChange={(e) => setShiftAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        )}
      </div>

      {/* Interactive Word Bit Ribbons */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <h3 className="text-sm font-semibold text-white">Interactive 64-Bit Operand Inspector (Click Bits to Toggle)</h3>

        {renderBitRibbon('Operand x (64 bits)', wordX, setWordX, 'text-cyan-400')}

        {isMultiInput && (
          <>
            {renderBitRibbon('Operand y (64 bits)', wordY, setWordY, 'text-emerald-400')}
            {renderBitRibbon('Operand z (64 bits)', wordZ, setWordZ, 'text-amber-400')}
          </>
        )}
      </div>

      {/* Computed Result Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Transformation Output</h3>
          </div>
          <span className="font-mono text-sm text-cyan-400 font-bold">
            0x{toHex64(result)}
          </span>
        </div>

        {/* 64-bit result ribbon */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 overflow-x-auto">
          <div className="flex gap-[3px] min-w-[620px]">
            {Array.from(toBin64(result)).map((bit, idx) => {
              const isOne = bit === '1';
              return (
                <div
                  key={idx}
                  className={`h-7 flex-1 rounded flex items-center justify-center text-[10px] font-mono font-bold ${
                    isOne
                      ? 'bg-emerald-600/90 text-white shadow-[0_0_4px_rgba(16,185,129,0.4)]'
                      : 'bg-slate-900 text-slate-600 border border-slate-800/80'
                  }`}
                  title={`Result Bit ${63 - idx} = ${bit}`}
                >
                  {bit}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 px-0.5">
            <span>Bit 63 (MSB)</span>
            <span>Bit 0 (LSB)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Total 1-bits: {Array.from(toBin64(result)).filter((b) => b === '1').length}</span>
          <span>Total 0-bits: {Array.from(toBin64(result)).filter((b) => b === '0').length}</span>
        </div>
      </div>
    </div>
  );
};
