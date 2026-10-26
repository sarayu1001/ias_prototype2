import React, { useState, useMemo } from 'react';
import { sha512 } from '../crypto/sha512';
import { calculateBitDiff } from '../crypto/utils';
import { Sparkles, ArrowRight, Shuffle, Sliders } from 'lucide-react';

export const AvalancheEffect: React.FC = () => {
  const [inputA, setInputA] = useState<string>('The quick brown fox jumps over the lazy dog');
  const [inputB, setInputB] = useState<string>('The quick brown fox jumps over the lazy dog.');
  const [hoveredBit, setHoveredBit] = useState<number | null>(null);

  const hashA = useMemo(() => {
    try {
      return sha512(inputA);
    } catch {
      return '';
    }
  }, [inputA]);

  const hashB = useMemo(() => {
    try {
      return sha512(inputB);
    } catch {
      return '';
    }
  }, [inputB]);

  const diff = useMemo(() => {
    if (!hashA || !hashB) return null;
    return calculateBitDiff(hashA, hashB);
  }, [hashA, hashB]);

  // Flip 1 single bit in inputA to create inputB
  const handleFlipOneBit = () => {
    if (!inputA) {
      setInputA('abc');
      setInputB('abd');
      return;
    }
    const bytes = new TextEncoder().encode(inputA);
    // Flip least significant bit of last byte
    const flippedBytes = new Uint8Array(bytes);
    flippedBytes[flippedBytes.length - 1] ^= 0x01;
    setInputB(new TextDecoder().decode(flippedBytes));
  };

  const presets = [
    {
      title: 'Pangram + Period',
      a: 'The quick brown fox jumps over the lazy dog',
      b: 'The quick brown fox jumps over the lazy dog.',
    },
    {
      title: '1-Character Change',
      a: 'CryptographicHash512',
      b: 'CryptographicHash513',
    },
    {
      title: 'Single Bit Flip',
      a: 'MessageA',
      b: 'Message@', // 'A' (0x41 = 01000001) vs '@' (0x40 = 01000000) is exactly 1 bit!
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Avalanche Effect Visualizer</h2>
            <p className="text-sm text-slate-400 mt-1">
              Strict Avalanche Criterion (SAC): Changing even 1 bit of input results in ~50% of the 512 output bits flipping pseudorandomly.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFlipOneBit}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Flip Exactly 1 Bit
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span className="text-slate-500">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.title}
              onClick={() => {
                setInputA(p.a);
                setInputB(p.b);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input A */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400">Input String A</span>
            <span className="text-xs text-slate-500 font-mono">{new TextEncoder().encode(inputA).length} bytes</span>
          </div>
          <textarea
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <div>
            <span className="text-[11px] text-slate-500 block mb-1">SHA-512(A) Digest</span>
            <div className="bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-[11px] text-cyan-300 break-all select-all">
              {hashA}
            </div>
          </div>
        </div>

        {/* Input B */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Input String B</span>
            <span className="text-xs text-slate-500 font-mono">{new TextEncoder().encode(inputB).length} bytes</span>
          </div>
          <textarea
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <div>
            <span className="text-[11px] text-slate-500 block mb-1">SHA-512(B) Digest</span>
            <div className="bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-[11px] text-amber-300 break-all select-all">
              {hashB}
            </div>
          </div>
        </div>
      </div>

      {/* Quantitative Rigor Stats Banner */}
      {diff && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Hamming Distance</span>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {diff.distance} <span className="text-sm font-normal text-slate-500">/ 512 bits</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Number of differing output bits</p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Flip Ratio (Target: ~50%)</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
              {diff.flipPercentage.toFixed(2)}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Theoretical cryptographic ideal = 50.0%
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Identical Bits</span>
            <div className="text-2xl font-bold font-mono text-slate-300 mt-1 tabular-nums">
              {diff.totalBits - diff.distance} <span className="text-sm font-normal text-slate-500">/ 512 bits</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {((1 - diff.distance / diff.totalBits) * 100).toFixed(2)}% unchanged bits
            </p>
          </div>
        </div>
      )}

      {/* 512-Bit Matrix Visualizer */}
      {diff && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">512-Bit Output Differential Matrix</h3>
              <p className="text-xs text-slate-400 mt-1">
                Each row corresponds to one 64-bit word (H0..H7). Amber cells represent flipped bits (1 vs 0).
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 bg-slate-800 border border-slate-700 rounded-sm inline-block" />
                Unchanged ({diff.totalBits - diff.distance})
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-3 bg-amber-500 border border-amber-400 rounded-sm inline-block" />
                Flipped ({diff.distance})
              </span>
            </div>
          </div>

          {/* Interactive Matrix Grid (8 rows of 64 bits) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto space-y-2">
            {Array.from({ length: 8 }).map((_, wordIdx) => (
              <div key={wordIdx} className="flex items-center gap-2">
                <span className="w-8 text-[10px] font-mono font-semibold text-slate-500 shrink-0">
                  H{wordIdx}
                </span>
                <div className="flex gap-1 flex-1 min-w-[640px]">
                  {Array.from({ length: 64 }).map((_, bitInWord) => {
                    const globalBit = wordIdx * 64 + bitInWord;
                    const isFlipped = diff.diffMask[globalBit];
                    const bitValA = diff.bitsA[globalBit];
                    const bitValB = diff.bitsB[globalBit];
                    const isHovered = hoveredBit === globalBit;

                    return (
                      <button
                        key={bitInWord}
                        onMouseEnter={() => setHoveredBit(globalBit)}
                        onMouseLeave={() => setHoveredBit(null)}
                        className={`h-4 flex-1 rounded-[2px] transition-all ${
                          isFlipped
                            ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                            : 'bg-slate-800/80 hover:bg-slate-700'
                        } ${isHovered ? 'scale-125 z-10' : ''}`}
                        title={`Bit ${globalBit} (H${wordIdx}[${bitInWord}]): A=${bitValA}, B=${bitValB} (${isFlipped ? 'FLIPPED' : 'EQUAL'})`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Live Hover Info Inspector */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 flex items-center justify-between">
            {hoveredBit !== null ? (
              <div className="flex items-center gap-4">
                <span className="text-cyan-400 font-bold">Bit #{hoveredBit}</span>
                <span>Word: H{Math.floor(hoveredBit / 64)} [Bit {hoveredBit % 64}]</span>
                <span>Digest A Bit: <strong className="text-white">{diff.bitsA[hoveredBit]}</strong></span>
                <span>Digest B Bit: <strong className="text-white">{diff.bitsB[hoveredBit]}</strong></span>
                <span className={diff.diffMask[hoveredBit] ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {diff.diffMask[hoveredBit] ? '● Bit Flipped' : '○ Bit Unchanged'}
                </span>
              </div>
            ) : (
              <span className="text-slate-500">Hover over any bit cell above to inspect bit coordinates and values.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
