import React, { useState } from 'react';
import { HashGenerator } from './components/HashGenerator';
import { RoundVisualizer } from './components/RoundVisualizer';
import { AvalancheEffect } from './components/AvalancheEffect';
import { BitwiseInspector } from './components/BitwiseInspector';
import { NistTestSuite } from './components/NistTestSuite';
import { CodeExport } from './components/CodeExport';
import { Shield, CheckCircle, FileCode } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'generator' | 'visualizer' | 'avalanche' | 'bitwise' | 'nist' | 'code'
  >('generator');

  const [inspectMessage, setInspectMessage] = useState<string>('abc');

  const handleInspect = (msg: string) => {
    setInspectMessage(msg);
    setActiveTab('visualizer');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav Links) - Zone 3 (1 Primary Action) */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab('generator')}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 text-left"
          >
            <Shield className="w-5 h-5 text-cyan-400" />
            <span>SHA-512 Studio</span>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveTab('generator')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'generator'
                  ? 'border-cyan-400 text-white font-semibold'
                  : 'border-transparent text-slate-400'
              }`}
            >
              Hash Generator
            </button>
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'visualizer'
                  ? 'border-cyan-400 text-white font-semibold'
                  : 'border-transparent text-slate-400'
              }`}
            >
              Step-by-Step Visualizer
            </button>
            <button
              onClick={() => setActiveTab('avalanche')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'avalanche'
                  ? 'border-cyan-400 text-white font-semibold'
                  : 'border-transparent text-slate-400'
              }`}
            >
              Avalanche Effect
            </button>
            <button
              onClick={() => setActiveTab('bitwise')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'bitwise'
                  ? 'border-cyan-400 text-white font-semibold'
                  : 'border-transparent text-slate-400'
              }`}
            >
              Bitwise Primitives
            </button>
            <button
              onClick={() => setActiveTab('nist')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'nist'
                  ? 'border-cyan-400 text-white font-semibold'
                  : 'border-transparent text-slate-400'
              }`}
            >
              NIST Vectors
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'code'
                  ? 'border-cyan-400 text-white font-semibold'
                  : 'border-transparent text-slate-400'
              }`}
            >
              Source Code
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('nist')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Standard</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 bg-slate-900/80 border-t border-slate-800 text-xs no-scrollbar">
          {[
            { id: 'generator', label: 'Generator' },
            { id: 'visualizer', label: 'Visualizer' },
            { id: 'avalanche', label: 'Avalanche' },
            { id: 'bitwise', label: 'Bitwise' },
            { id: 'nist', label: 'NIST Tests' },
            { id: 'code', label: 'Code' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generator' && <HashGenerator onInspectMessage={handleInspect} />}
        {activeTab === 'visualizer' && <RoundVisualizer initialText={inspectMessage} />}
        {activeTab === 'avalanche' && <AvalancheEffect />}
        {activeTab === 'bitwise' && <BitwiseInspector />}
        {activeTab === 'nist' && <NistTestSuite />}
        {activeTab === 'code' && <CodeExport />}
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>SHA-512 Cryptographic Studio</span>
            <span aria-hidden="true">·</span>
            <span>FIPS PUB 180-4 Secure Hash Standard</span>
            <span aria-hidden="true">·</span>
            <span>RFC 6234</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Pure 64-bit BigInt Engine</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-500 font-mono">100% Bit-Exact CAVP Parity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
