import React, { useState, useEffect, useTransition } from 'react';
import { sha512, hmacSha512 } from '../crypto/sha512';
import { webCryptoSha512, bytesToHex, hexToBytes, bytesToBase64, hexToBinaryString } from '../crypto/utils';
import { Copy, Check, Upload, FileText, Cpu, Key, ArrowRight } from 'lucide-react';

interface HashGeneratorProps {
  onInspectMessage?: (text: string) => void;
}

export const HashGenerator: React.FC<HashGeneratorProps> = ({ onInspectMessage }) => {
  const [inputType, setInputType] = useState<'text' | 'hex' | 'file'>('text');
  const [textInput, setTextInput] = useState<string>('The quick brown fox jumps over the lazy dog');
  const [hexInput, setHexInput] = useState<string>('48656c6c6f20576f726c64'); // "Hello World"
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);

  // HMAC Mode
  const [isHmac, setIsHmac] = useState<boolean>(false);
  const [hmacKey, setHmacKey] = useState<string>('secret-crypto-key');

  // Outputs
  const [hashOutput, setHashOutput] = useState<string>('');
  const [hardwareParity, setHardwareParity] = useState<boolean | null>(null);
  const [outputFormat, setOutputFormat] = useState<'hex' | 'grouped' | 'base64' | 'binary'>('hex');
  const [copied, setCopied] = useState<boolean>(false);
  const [benchmarking, setBenchmarking] = useState<boolean>(false);
  const [benchmarkResult, setBenchmarkResult] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Presets
  const presets = [
    { label: 'Empty (0b)', value: '' },
    { label: 'Short ("abc")', value: 'abc' },
    { label: 'Fox Pangram', value: 'The quick brown fox jumps over the lazy dog' },
    { label: '112-Byte Boundary', value: 'abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu' },
  ];

  // Compute hash whenever inputs change
  useEffect(() => {
    let active = true;
    startTransition(() => {
      try {
        let dataToHash: Uint8Array;

        if (inputType === 'text') {
          dataToHash = new TextEncoder().encode(textInput);
        } else if (inputType === 'hex') {
          dataToHash = hexToBytes(hexInput);
        } else {
          dataToHash = fileBytes || new Uint8Array(0);
        }

        let computedHash = '';
        if (isHmac) {
          computedHash = hmacSha512(hmacKey, dataToHash);
        } else {
          computedHash = sha512(dataToHash);
        }

        if (active) {
          setHashOutput(computedHash);

          // Verify with native WebCrypto in standard non-HMAC mode
          if (!isHmac) {
            webCryptoSha512(dataToHash)
              .then((nativeHex) => {
                if (active) {
                  setHardwareParity(nativeHex === computedHash);
                }
              })
              .catch(() => {
                if (active) setHardwareParity(null);
              });
          } else {
            setHardwareParity(null);
          }
        }
      } catch (err) {
        if (active) {
          setHashOutput('Error: Invalid input format or hex length');
          setHardwareParity(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [inputType, textInput, hexInput, fileBytes, isHmac, hmacKey]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        if (buffer) {
          setFileBytes(new Uint8Array(buffer));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleCopy = () => {
    let textToCopy = hashOutput;
    if (outputFormat === 'grouped') {
      textToCopy = formatGrouped(hashOutput);
    } else if (outputFormat === 'base64') {
      try {
        textToCopy = bytesToBase64(hexToBytes(hashOutput));
      } catch {
        textToCopy = hashOutput;
      }
    } else if (outputFormat === 'binary') {
      textToCopy = hexToBinaryString(hashOutput);
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatGrouped = (hex: string) => {
    if (hex.length !== 128) return hex;
    // Split into eight 16-character (64-bit) words H0..H7
    const words: string[] = [];
    for (let i = 0; i < 8; i++) {
      words.push(`H${i}: ` + hex.substring(i * 16, i * 16 + 16));
    }
    return words.join('\n');
  };

  const runBenchmark = () => {
    setBenchmarking(true);
    setTimeout(() => {
      const sample = 'The quick brown fox jumps over the lazy dog';
      const iterations = 1000;
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        sha512(sample);
      }
      const duration = performance.now() - start;
      const opsPerSec = Math.round((iterations / duration) * 1000);
      setBenchmarkResult(`${opsPerSec.toLocaleString()} ops/sec (${(duration / iterations).toFixed(2)} ms/hash)`);
      setBenchmarking(false);
    }, 50);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">SHA-512 Cryptographic Digest</h2>
            <p className="text-sm text-slate-400 mt-1">
              Computes 512-bit (64-byte) message digests using pure 64-bit BigInt FIPS 180-4 standard.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hardwareParity === true && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded-md">
                <Check className="w-3.5 h-3.5" />
                Hardware Parity Match
              </span>
            )}
            <button
              onClick={runBenchmark}
              disabled={benchmarking}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              {benchmarking ? 'Benchmarking...' : 'Test Engine Speed'}
            </button>
            {benchmarkResult && (
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2.5 py-1 rounded-md">
                {benchmarkResult}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Format selector buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg w-fit">
            <button
              onClick={() => setInputType('text')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                inputType === 'text' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              UTF-8 Text
            </button>
            <button
              onClick={() => setInputType('hex')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                inputType === 'hex' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hex Bytes
            </button>
            <button
              onClick={() => setInputType('file')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                inputType === 'file' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              File Upload
            </button>
          </div>

          {/* Quick presets */}
          {inputType === 'text' && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-500">Presets:</span>
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setTextInput(p.value)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Input Mode */}
        {inputType === 'text' && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Input Message (UTF-8)</label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={3}
              placeholder="Enter text to hash..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-y"
            />
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{new TextEncoder().encode(textInput).length} bytes ({new TextEncoder().encode(textInput).length * 8} bits)</span>
              {onInspectMessage && (
                <button
                  onClick={() => onInspectMessage(textInput)}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
                >
                  Inspect in Step-by-Step Visualizer
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hex Input Mode */}
        {inputType === 'hex' && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Raw Hexadecimal String (e.g. 48656c6c6f)</label>
            <textarea
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              rows={3}
              placeholder="Enter hex characters..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-y"
            />
            <p className="text-xs text-slate-500 mt-1">
              {hexInput.replace(/[^0-9a-fA-F]/g, '').length / 2} bytes ({hexInput.replace(/[^0-9a-fA-F]/g, '').length * 4} bits)
            </p>
          </div>
        )}

        {/* File Input Mode */}
        {inputType === 'file' && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Any Local File</label>
            <label className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group">
              <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors mb-2" />
              <span className="text-sm font-medium text-slate-300">
                {fileName ? fileName : 'Click to select or drag and drop a file'}
              </span>
              <span className="text-xs text-slate-500 mt-1">Processes in client memory without network upload</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}

        {/* HMAC Authentication Extension */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsHmac(!isHmac)}
              className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Key className="w-4 h-4 text-cyan-400" />
              <span>{isHmac ? 'HMAC-SHA-512 Enabled (Click to disable)' : 'Enable HMAC-SHA-512 (Keyed-Hash Message Auth)'}</span>
            </button>
            {isHmac && (
              <span className="text-xs text-amber-400/90 font-mono">RFC 2104 Mode</span>
            )}
          </div>

          {isHmac && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-400 mb-1">HMAC Secret Key</label>
              <input
                type="text"
                value={hmacKey}
                onChange={(e) => setHmacKey(e.target.value)}
                placeholder="Enter secret key..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Keys longer than 128 bytes are hashed with SHA-512 before inner and outer padding (0x36 / 0x5c).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              {isHmac ? 'HMAC-SHA-512 Digest (512 bits / 64 bytes)' : 'SHA-512 Digest (512 bits / 64 bytes)'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Output format segmented selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                onClick={() => setOutputFormat('hex')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  outputFormat === 'hex' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hex (128)
              </button>
              <button
                onClick={() => setOutputFormat('grouped')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  outputFormat === 'grouped' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                64-bit Words (H0..H7)
              </button>
              <button
                onClick={() => setOutputFormat('base64')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  outputFormat === 'base64' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Base64
              </button>
              <button
                onClick={() => setOutputFormat('binary')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  outputFormat === 'binary' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Binary (512b)
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="p-2 text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Formatted Output Display */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          {outputFormat === 'hex' && (
            <p className="text-cyan-300 font-semibold break-all tracking-wide select-all">
              {hashOutput}
            </p>
          )}

          {outputFormat === 'grouped' && (
            <pre className="text-cyan-300 text-xs leading-relaxed select-all">
              {formatGrouped(hashOutput)}
            </pre>
          )}

          {outputFormat === 'base64' && (
            <p className="text-emerald-300 break-all select-all">
              {(() => {
                try {
                  return bytesToBase64(hexToBytes(hashOutput));
                } catch {
                  return hashOutput;
                }
              })()}
            </p>
          )}

          {outputFormat === 'binary' && (
            <div className="font-mono text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto select-all">
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 8 }).map((_, wordIdx) => {
                  const wordHex = hashOutput.substring(wordIdx * 16, wordIdx * 16 + 16);
                  const wordBin = hexToBinaryString(wordHex);
                  return (
                    <div key={wordIdx} className="col-span-8 p-1.5 bg-slate-900/60 rounded border border-slate-800/60">
                      <div className="text-[10px] text-slate-500 font-medium mb-0.5">Word H{wordIdx} ({wordHex}):</div>
                      <div className="break-all tracking-widest text-cyan-400 font-mono text-[11px]">{wordBin}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Verification Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
          <span>Digest Length: 64 bytes · 128 hexadecimal characters · 512 bits</span>
          <span>Standard: NIST FIPS PUB 180-4 · RFC 6234</span>
        </div>
      </div>
    </div>
  );
};
