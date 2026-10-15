import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Image as ImageIcon,
  Code,
  Check,
  Palette,
} from 'lucide-react';
import { DitherResult, ThemeMode, FontFamily } from '../types';
import {
  downloadTxtFile,
  downloadAsPng,
  downloadAsSvg,
  THEME_PALETTES,
} from '../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DitherResult | null;
  theme: ThemeMode;
  fontFamily: FontFamily;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  result,
  theme,
  fontFamily,
}) => {
  const [activeTab, setActiveTab] = useState<'txt' | 'png' | 'svg' | 'html'>('txt');
  const [filename, setFilename] = useState<string>('dithered-digits');
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [pngFontSize, setPngFontSize] = useState<number>(14);
  const [pngPadding, setPngPadding] = useState<number>(32);
  const [customBg, setCustomBg] = useState<string>(
    THEME_PALETTES[theme]?.bg || '#050c05'
  );
  const [customText, setCustomText] = useState<string>(
    THEME_PALETTES[theme]?.text || '#22c55e'
  );
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  if (!isOpen || !result) return null;

  // Handle direct TXT download
  const handleDownloadTxt = () => {
    downloadTxtFile(
      result.text,
      `${filename}.txt`,
      includeMetadata,
      {
        width: result.width,
        height: result.height,
        algorithm: '1-bit dither',
      }
    );
  };

  // Handle PNG image export
  const handleDownloadPng = () => {
    downloadAsPng(result.lines, `${filename}.png`, {
      fontSize: pngFontSize,
      padding: pngPadding,
      bgColor: customBg,
      textColor: customText,
      fontFamily,
    });
  };

  // Handle SVG vector download
  const handleDownloadSvg = () => {
    downloadAsSvg(result.lines, `${filename}.svg`, {
      fontSize: pngFontSize,
      padding: pngPadding,
      bgColor: customBg,
      textColor: customText,
      fontFamily,
    });
  };

  // Generate HTML snippet
  const htmlSnippet = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${filename}</title>
  <style>
    body {
      background-color: ${customBg};
      color: ${customText};
      font-family: 'JetBrains Mono', monospace;
      padding: 2rem;
      margin: 0;
      display: flex;
      justify-content: center;
    }
    pre {
      font-size: ${pngFontSize}px;
      line-height: 1.15;
      letter-spacing: 0px;
    }
  </style>
</head>
<body>
  <pre>${result.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;

  const handleCopyHtml = async () => {
    await navigator.clipboard.writeText(htmlSnippet);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-200 text-xs">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Export & Download ASCII Art
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Format Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-3 gap-2">
          {[
            { id: 'txt', label: 'Plain Text (.TXT)', icon: FileText },
            { id: 'png', label: 'Image (.PNG)', icon: ImageIcon },
            { id: 'svg', label: 'Vector (.SVG)', icon: Code },
            { id: 'html', label: 'HTML Embed', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 px-3 font-medium text-xs border-b-2 flex items-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 space-y-4">
          {/* Filename Input */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium">
              File Name (without extension)
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* TXT Tab Settings */}
          {activeTab === 'txt' && (
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-slate-200">
                    Include Information Header
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Prepends dimensions, timestamp, and metadata as comments
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400">
                <span>Output size:</span>{' '}
                <span className="text-emerald-400 font-bold">
                  {result.width} columns × {result.height} lines
                </span>{' '}
                (~{((result.totalChars + result.height) / 1024).toFixed(1)} KB)
              </div>

              <button
                onClick={handleDownloadTxt}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>Download {filename}.txt</span>
              </button>
            </div>
          )}

          {/* PNG / SVG Visual Settings */}
          {(activeTab === 'png' || activeTab === 'svg') && (
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
              <div className="grid grid-cols-2 gap-3">
                {/* Background color */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1">
                    <input
                      type="color"
                      value={customBg}
                      onChange={(e) => setCustomBg(e.target.value)}
                      className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-slate-300 text-[11px]">
                      {customBg}
                    </span>
                  </div>
                </div>

                {/* Text color */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    Text / Digit Color
                  </label>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1">
                    <input
                      type="color"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-slate-300 text-[11px]">
                      {customText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Font size & padding */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Font Size</span>
                    <span className="font-mono">{pngFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    value={pngFontSize}
                    onChange={(e) => setPngFontSize(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-slate-800 rounded"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Padding</span>
                    <span className="font-mono">{pngPadding}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={pngPadding}
                    onChange={(e) => setPngPadding(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-slate-800 rounded"
                  />
                </div>
              </div>

              {activeTab === 'png' ? (
                <button
                  onClick={handleDownloadPng}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Res {filename}.png</span>
                </button>
              ) : (
                <button
                  onClick={handleDownloadSvg}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Vector {filename}.svg</span>
                </button>
              )}
            </div>
          )}

          {/* HTML Tab */}
          {activeTab === 'html' && (
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
              <p className="text-[11px] text-slate-400">
                Copy self-contained HTML code snippet for embedding in websites or docs:
              </p>
              <textarea
                readOnly
                rows={6}
                value={htmlSnippet}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] text-slate-300 focus:outline-none"
              />
              <button
                onClick={handleCopyHtml}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {copiedHtml ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4" />
                    <span>Copy HTML Snippet</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
