import React, { useState } from 'react';
import { CODE_SNIPPETS } from '../crypto/codeSnippets';
import { Copy, Check, Terminal, BookOpen } from 'lucide-react';

export const CodeExport: React.FC = () => {
  const [selectedSnippetIdx, setSelectedSnippetIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const snippet = CODE_SNIPPETS[selectedSnippetIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Code Snippets Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Production Implementations</h2>
            <p className="text-sm text-slate-400 mt-1">
              Zero-dependency, standalone code ready to embed in your applications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Language selectors */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              {CODE_SNIPPETS.map((s, idx) => (
                <button
                  key={s.name}
                  onClick={() => setSelectedSnippetIdx(idx)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedSnippetIdx === idx
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.language.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          <p>{snippet.description}</p>
        </div>

        <div className="relative">
          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed select-all">
            {snippet.code}
          </pre>
        </div>
      </div>

      {/* Mathematical Specification Cheat Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">FIPS PUB 180-4 Architectural Parameters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-slate-500 block mb-1">Block Size</span>
            <span className="text-white font-bold text-sm">1024 bits (128 bytes)</span>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">
              Data is processed in chunks of sixteen 64-bit words.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-slate-500 block mb-1">Word Size & Math</span>
            <span className="text-cyan-400 font-bold text-sm">64 bits (BigInt modulo 2⁶⁴)</span>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">
              All rotations and additions take place in ℤ / 2⁶⁴ℤ.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-slate-500 block mb-1">Compression Rounds</span>
            <span className="text-emerald-400 font-bold text-sm">80 Rounds</span>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">
              80 distinct constants K derived from cube roots of primes 2..409.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mt-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="text-cyan-400 font-bold block">Compression Functions</span>
            <div className="text-slate-300 space-y-1 text-[11px]">
              <div>· Ch(e, f, g) = (e ∧ f) ⊕ (¬e ∧ g)</div>
              <div>· Maj(a, b, c) = (a ∧ b) ⊕ (a ∧ c) ⊕ (b ∧ c)</div>
              <div>· Σ₀(a) = ROTR²⁸(a) ⊕ ROTR³⁴(a) ⊕ ROTR³⁹(a)</div>
              <div>· Σ₁(e) = ROTR¹⁴(e) ⊕ ROTR¹⁸(e) ⊕ ROTR⁴¹(e)</div>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="text-cyan-400 font-bold block">Message Schedule Functions</span>
            <div className="text-slate-300 space-y-1 text-[11px]">
              <div>· σ₀(x) = ROTR¹(x) ⊕ ROTR⁸(x) ⊕ SHR⁷(x)</div>
              <div>· σ₁(x) = ROTR¹⁹(x) ⊕ ROTR⁶¹(x) ⊕ SHR⁶(x)</div>
              <div>· W[t] = σ₁(W[t-2]) + W[t-7] + σ₀(W[t-15]) + W[t-16] mod 2⁶⁴</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
