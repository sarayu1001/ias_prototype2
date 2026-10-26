import React, { useState, useEffect, useRef } from 'react';
import { sha512Trace, toHex64, SHA512Trace, BlockTrace, RoundStep } from '../crypto/sha512';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Info, Layers, RefreshCw } from 'lucide-react';

interface RoundVisualizerProps {
  initialText?: string;
}

export const RoundVisualizer: React.FC<RoundVisualizerProps> = ({ initialText = 'abc' }) => {
  const [inputText, setInputText] = useState<string>(initialText);
  const [trace, setTrace] = useState<SHA512Trace | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(300); // ms per step
  const [activeStage, setActiveStage] = useState<'padding' | 'schedule' | 'rounds' | 'accumulation'>('rounds');
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);

  // Compute trace on input change
  useEffect(() => {
    try {
      const result = sha512Trace(inputText);
      setTrace(result);
      setCurrentBlockIndex(0);
      setCurrentRound(0);
      setIsPlaying(false);
    } catch (e) {
      console.error(e);
    }
  }, [inputText]);

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentRound((prev) => {
          if (prev >= 79) {
            setIsPlaying(false);
            return 79;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  if (!trace) return null;

  const currentBlock: BlockTrace | undefined = trace.blocks[currentBlockIndex] || trace.blocks[0];
  const roundData: RoundStep | undefined = currentBlock?.rounds[currentRound];

  return (
    <div className="space-y-6">
      {/* Header controls & message selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">SHA-512 Step-by-Step Round Inspector</h2>
            <p className="text-sm text-slate-400 mt-1">
              Follow every transformation through padding, 80-word schedule expansion, and 80 compression rounds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sample inputs:</span>
            {['abc', 'hello', 'sha512', 'NIST-test'].map((sample) => (
              <button
                key={sample}
                onClick={() => setInputText(sample)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  inputText === sample
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type message to trace..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <div className="text-xs font-mono text-slate-400 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
            {trace.originalByteLength} bytes ({trace.originalBitLength.toString()} bits) · {trace.blocks.length} {trace.blocks.length === 1 ? 'Block' : 'Blocks'} (1024-bit)
          </div>
        </div>

        {/* Sub-Stage Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg w-fit mt-4">
          <button
            onClick={() => setActiveStage('padding')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeStage === 'padding' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Padding & Blocks
          </button>
          <button
            onClick={() => setActiveStage('schedule')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeStage === 'schedule' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Message Schedule (W₀..W₇₉)
          </button>
          <button
            onClick={() => setActiveStage('rounds')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeStage === 'rounds' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Round Engine (0..79)
          </button>
          <button
            onClick={() => setActiveStage('accumulation')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeStage === 'accumulation' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            4. State Accumulation
          </button>
        </div>
      </div>

      {/* Block Selector (if multi-block) */}
      {trace.blocks.length > 1 && (
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-slate-300">
              Active Block: {currentBlockIndex + 1} of {trace.blocks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {trace.blocks.map((b, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentBlockIndex(idx);
                  setCurrentRound(0);
                }}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  currentBlockIndex === idx
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                Block {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 1: PADDING & BLOCKS INSPECTION */}
      {activeStage === 'padding' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white">FIPS 180-4 Section 5.1.2: Message Padding</h3>
            <p className="text-xs text-slate-400 mt-1">
              Messages must be padded to a multiple of 1024 bits (128 bytes). Padding appends a single 1-bit (`0x80`), followed by `k` zero bytes such that length ≡ 112 (mod 128) bytes, followed by the original message length encoded as a 128-bit big-endian integer.
            </p>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950 border border-cyan-900/60 rounded-xl">
              <span className="text-xs text-cyan-400 font-medium">1. Message Payload</span>
              <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{trace.originalByteLength} B</div>
              <p className="text-[11px] text-slate-400 mt-1">{trace.originalBitLength.toString()} bits</p>
            </div>
            <div className="p-4 bg-slate-950 border border-amber-900/60 rounded-xl">
              <span className="text-xs text-amber-400 font-medium">2. Start Bit Marker</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">1 Byte</div>
              <p className="text-[11px] text-slate-400 mt-1">0x80 (Binary 10000000)</p>
            </div>
            <div className="p-4 bg-slate-950 border border-indigo-900/60 rounded-xl">
              <span className="text-xs text-indigo-400 font-medium">3. Zero Padding (k)</span>
              <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{trace.paddingZeroCount} B</div>
              <p className="text-[11px] text-slate-400 mt-1">{trace.paddingZeroCount * 8} zero bits</p>
            </div>
            <div className="p-4 bg-slate-950 border border-emerald-900/60 rounded-xl">
              <span className="text-xs text-emerald-400 font-medium">4. 128-Bit Bit Length</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">16 Bytes</div>
              <p className="text-[11px] text-slate-400 mt-1">Big-endian binary value</p>
            </div>
          </div>

          {/* Padded Bytes Hex Visualizer */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Padded Stream Hex Breakdown ({trace.paddedBytes.length} bytes / {trace.paddedBytes.length * 8} bits)
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs max-h-64 overflow-y-auto">
              <div className="flex flex-wrap gap-1 leading-relaxed">
                {Array.from(trace.paddedBytes).map((byte, idx) => {
                  let colorClass = 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40'; // Original message
                  let role = 'Payload';

                  if (idx === trace.originalByteLength) {
                    colorClass = 'text-amber-300 bg-amber-950/60 border-amber-700/60 font-bold'; // 0x80
                    role = 'Marker (0x80)';
                  } else if (idx > trace.originalByteLength && idx < trace.paddedBytes.length - 16) {
                    colorClass = 'text-slate-500 bg-slate-900/40 border-slate-800/30'; // Zero padding
                    role = 'Zero Pad';
                  } else if (idx >= trace.paddedBytes.length - 16) {
                    colorClass = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'; // 128-bit length
                    role = 'Length Big-Endian';
                  }

                  return (
                    <span
                      key={idx}
                      title={`Byte ${idx}: 0x${byte.toString(16).padStart(2, '0')} [${role}]`}
                      className={`px-1 py-0.5 rounded border text-[11px] cursor-help ${colorClass}`}
                    >
                      {byte.toString(16).padStart(2, '0')}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs mt-2">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 bg-cyan-950 border border-cyan-700 rounded-sm inline-block" />
                Message Data
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2.5 h-2.5 bg-amber-950 border border-amber-600 rounded-sm inline-block" />
                0x80 Byte
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 bg-slate-900 border border-slate-700 rounded-sm inline-block" />
                Zeroes
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 bg-emerald-950 border border-emerald-700 rounded-sm inline-block" />
                128-bit Length
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: MESSAGE SCHEDULE EXPANSION */}
      {activeStage === 'schedule' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">Message Schedule W₀..W₇₉ (Block {currentBlockIndex + 1})</h3>
              <p className="text-xs text-slate-400 mt-1">
                W₀..W₁₅ are extracted directly from the 16 64-bit words of the 1024-bit block. W₁₆..W₇₉ are derived via σ₁(W_{'{t-2}'}) + W_{'{t-7}'} + σ₀(W_{'{t-15}'}) + W_{'{t-16}'} mod 2⁶⁴.
              </p>
            </div>
            <div className="text-xs text-slate-400">
              Click any word to inspect its mathematical derivation
            </div>
          </div>

          {/* Word Derivation Inspector Card */}
          {selectedWordIndex !== null && (
            <div className="bg-slate-950 border border-cyan-800/80 rounded-xl p-4 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold">Derivation of W[{selectedWordIndex}]</span>
                <button
                  onClick={() => setSelectedWordIndex(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Close ×
                </button>
              </div>
              {selectedWordIndex < 16 ? (
                <p className="text-slate-300">
                  Direct message word: Extracted from block bytes [{selectedWordIndex * 8}..{(selectedWordIndex + 1) * 8 - 1}] as big-endian 64-bit integer.
                  <br />
                  <span className="text-emerald-400 mt-1 block">Value: 0x{toHex64(currentBlock?.W[selectedWordIndex] || 0n)}</span>
                </p>
              ) : (
                <div className="text-slate-300 space-y-1">
                  <div>Formula: W[{selectedWordIndex}] = σ₁(W[{selectedWordIndex - 2}]) + W[{selectedWordIndex - 7}] + σ₀(W[{selectedWordIndex - 15}]) + W[{selectedWordIndex - 16}] mod 2⁶⁴</div>
                  <div className="text-slate-400 text-[11px]">
                    · W[{selectedWordIndex - 2}] = 0x{toHex64(currentBlock?.W[selectedWordIndex - 2] || 0n)}
                    <br />
                    · W[{selectedWordIndex - 7}] = 0x{toHex64(currentBlock?.W[selectedWordIndex - 7] || 0n)}
                    <br />
                    · W[{selectedWordIndex - 15}] = 0x{toHex64(currentBlock?.W[selectedWordIndex - 15] || 0n)}
                    <br />
                    · W[{selectedWordIndex - 16}] = 0x{toHex64(currentBlock?.W[selectedWordIndex - 16] || 0n)}
                  </div>
                  <div className="text-emerald-400 font-bold mt-1">
                    Result W[{selectedWordIndex}] = 0x{toHex64(currentBlock?.W[selectedWordIndex] || 0n)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grid of 80 words */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {currentBlock?.W.map((w, idx) => {
              const isDirect = idx < 16;
              const isSelected = selectedWordIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedWordIndex(idx)}
                  className={`p-2 rounded-lg border text-left font-mono transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/80 ring-1 ring-cyan-400'
                      : isDirect
                      ? 'bg-slate-950 border-cyan-900/50 hover:border-cyan-700'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={isDirect ? 'text-cyan-400 font-semibold' : 'text-slate-400'}>
                      W{idx}
                    </span>
                    <span className="text-[9px] text-slate-500">{isDirect ? 'Direct' : 'Expanded'}</span>
                  </div>
                  <div className="text-[11px] text-slate-200 truncate mt-1">
                    {toHex64(w).substring(0, 8)}...
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STAGE 3: 80-ROUND COMPRESSION ENGINE */}
      {activeStage === 'rounds' && roundData && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          {/* Round Header & Playback Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white font-mono">
                  Round {currentRound} <span className="text-slate-500 font-normal">/ 79</span>
                </span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                  Block {currentBlockIndex + 1} of {trace.blocks.length}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Constants: K[{currentRound}] = <span className="font-mono text-slate-300">0x{toHex64(roundData.K)}</span> · Word: W[{currentRound}] = <span className="font-mono text-slate-300">0x{toHex64(roundData.W)}</span>
              </p>
            </div>

            {/* Playback Button Group */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentRound(0)}
                disabled={currentRound === 0}
                className="p-2 text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-slate-700 transition-colors"
                title="First round"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentRound((p) => Math.max(0, p - 1))}
                disabled={currentRound === 0}
                className="p-2 text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-slate-700 transition-colors"
                title="Previous round"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => setCurrentRound((p) => Math.min(79, p + 1))}
                disabled={currentRound === 79}
                className="p-2 text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-slate-700 transition-colors"
                title="Next round"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentRound(79)}
                disabled={currentRound === 79}
                className="p-2 text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-slate-700 transition-colors"
                title="Last round"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Speed selector */}
              <div className="flex items-center gap-1 ml-2 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                <button
                  onClick={() => setPlaybackSpeed(800)}
                  className={`px-2 py-1 text-[11px] rounded ${playbackSpeed === 800 ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                >
                  Slow
                </button>
                <button
                  onClick={() => setPlaybackSpeed(300)}
                  className={`px-2 py-1 text-[11px] rounded ${playbackSpeed === 300 ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setPlaybackSpeed(100)}
                  className={`px-2 py-1 text-[11px] rounded ${playbackSpeed === 100 ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                >
                  Fast
                </button>
              </div>
            </div>
          </div>

          {/* Round Scrub Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Scrub Round: {currentRound}</span>
              <span>Total: 80 Rounds (FIPS 180-4)</span>
            </div>
            <input
              type="range"
              min="0"
              max="79"
              value={currentRound}
              onChange={(e) => setCurrentRound(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* 8 Working State Registers: a, b, c, d, e, f, g, h */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Working State Registers (64-Bit Words)
              </h4>
              <span className="text-xs text-slate-500 font-mono">Input → Compressed Transition</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { name: 'a', val: roundData.a, next: roundData.nextA, updated: true },
                { name: 'b', val: roundData.b, next: roundData.a, shiftFrom: 'a' },
                { name: 'c', val: roundData.c, next: roundData.b, shiftFrom: 'b' },
                { name: 'd', val: roundData.d, next: roundData.c, shiftFrom: 'c' },
                { name: 'e', val: roundData.e, next: roundData.nextE, updated: true },
                { name: 'f', val: roundData.f, next: roundData.e, shiftFrom: 'e' },
                { name: 'g', val: roundData.g, next: roundData.f, shiftFrom: 'f' },
                { name: 'h', val: roundData.h, next: roundData.g, shiftFrom: 'g' },
              ].map((reg) => (
                <div
                  key={reg.name}
                  className={`p-3 bg-slate-950 border rounded-xl font-mono ${
                    reg.updated
                      ? 'border-cyan-500/60 bg-gradient-to-b from-cyan-950/30 to-slate-950'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white uppercase text-sm">{reg.name}</span>
                    {reg.updated ? (
                      <span className="text-[10px] text-cyan-400 font-sans font-medium">New Value</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-sans">← {reg.shiftFrom}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-cyan-300 tracking-tight font-semibold break-all">
                    {toHex64(reg.val).substring(0, 8)}
                  </div>
                  <div className="text-[10px] text-slate-500 break-all">
                    {toHex64(reg.val).substring(8)}
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-900 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Next:</span>
                    <span className="text-emerald-400">{toHex64(reg.next).substring(0, 8)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mathematical Transformation Cards: T1 & T2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* T1 Box */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400">Temporary Word T₁ (Affects Next e and a)</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">0x{toHex64(roundData.T1)}</span>
              </div>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                T₁ = h + Σ₁(e) + Ch(e, f, g) + K[t] + W[t]
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800/80 space-y-1">
                <div>h: 0x{toHex64(roundData.h)}</div>
                <div>Σ₁(e) = ROTR¹⁴ ⊕ ROTR¹⁸ ⊕ ROTR⁴¹: 0x{toHex64(roundData.Sigma1_e)}</div>
                <div>Ch(e,f,g) = (e ∧ f) ⊕ (¬e ∧ g): 0x{toHex64(roundData.ch_efg)}</div>
                <div>K[{currentRound}]: 0x{toHex64(roundData.K)}</div>
                <div>W[{currentRound}]: 0x{toHex64(roundData.W)}</div>
              </div>
              <div className="text-xs text-slate-300">
                Next <span className="font-mono text-cyan-400">e</span> = (d + T₁) mod 2⁶⁴ = <span className="font-mono text-emerald-400">0x{toHex64(roundData.nextE)}</span>
              </div>
            </div>

            {/* T2 Box */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400">Temporary Word T₂ (Affects Next a)</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">0x{toHex64(roundData.T2)}</span>
              </div>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                T₂ = Σ₀(a) + Maj(a, b, c)
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-800/80 space-y-1">
                <div>a: 0x{toHex64(roundData.a)}</div>
                <div>Σ₀(a) = ROTR²⁸ ⊕ ROTR³⁴ ⊕ ROTR³⁹: 0x{toHex64(roundData.Sigma0_a)}</div>
                <div>Maj(a,b,c) = (a∧b) ⊕ (a∧c) ⊕ (b∧c): 0x{toHex64(roundData.maj_abc)}</div>
              </div>
              <div className="text-xs text-slate-300">
                Next <span className="font-mono text-cyan-400">a</span> = (T₁ + T₂) mod 2⁶⁴ = <span className="font-mono text-emerald-400">0x{toHex64(roundData.nextA)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: STATE ACCUMULATION */}
      {activeStage === 'accumulation' && currentBlock && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white">Davies-Meyer State Accumulation (Block {currentBlockIndex + 1})</h3>
            <p className="text-xs text-slate-400 mt-1">
              After round 79, each initial hash value H_i^(i-1) is added to the corresponding working variable (a..h) modulo 2⁶⁴ to produce the intermediate hash H_i^(i).
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((name, idx) => {
              const initVal = currentBlock.initialState[idx];
              const finalReg = currentBlock.rounds[79] ? [
                currentBlock.rounds[79].nextA,
                currentBlock.rounds[79].a,
                currentBlock.rounds[79].b,
                currentBlock.rounds[79].c,
                currentBlock.rounds[79].nextE,
                currentBlock.rounds[79].e,
                currentBlock.rounds[79].f,
                currentBlock.rounds[79].g,
              ][idx] : 0n;
              const resultH = currentBlock.finalState[idx];

              return (
                <div key={name} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-slate-400 flex items-center gap-2">
                    <span className="font-bold text-white">H{idx}</span> =
                    <span>0x{toHex64(initVal)}</span>
                    <span className="text-cyan-400">+</span>
                    <span>reg_{name} (0x{toHex64(finalReg)})</span>
                  </div>
                  <div className="text-emerald-400 font-bold">
                    → 0x{toHex64(resultH)}
                  </div>
                </div>
              );
            })}
          </div>

          {currentBlockIndex === trace.blocks.length - 1 && (
            <div className="p-4 bg-cyan-950/40 border border-cyan-800/80 rounded-xl mt-4">
              <span className="text-xs text-cyan-400 font-semibold uppercase">Final Resulting SHA-512 Digest</span>
              <p className="font-mono text-sm text-cyan-200 font-bold mt-1 break-all">
                {trace.hashHex}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
