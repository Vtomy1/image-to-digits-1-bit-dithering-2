import React from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Sliders, 
  RotateCcw,
  Sparkles,
  FileText
} from 'lucide-react';
import { DitherResult } from '../types';

interface HeaderProps {
  onDownloadTxt: () => void;
  onCopyText: () => void;
  onOpenExportModal: () => void;
  onResetAll: () => void;
  isCopied: boolean;
  result: DitherResult | null;
  toggleControlsMobile: () => void;
  showControlsMobile: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onDownloadTxt,
  onCopyText,
  onOpenExportModal,
  onResetAll,
  isCopied,
  result,
  toggleControlsMobile,
  showControlsMobile,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between gap-4">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-jetbrains font-bold text-xs tracking-tighter shadow-sm shadow-emerald-950">
          01
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>DigitDither</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                1-Bit Lab
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Image to 1-Bit Dithered Digits & Custom ASCII Art Generator
          </p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-2">
        {/* Mobile controls toggle */}
        <button
          onClick={toggleControlsMobile}
          className={`lg:hidden px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
            showControlsMobile
              ? 'bg-slate-800 border-slate-600 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
          title="Toggle settings panel"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>

        {/* Copy Button */}
        <button
          onClick={onCopyText}
          disabled={!result}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
            isCopied
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-950'
              : 'bg-slate-900 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200 disabled:opacity-40 disabled:pointer-events-none'
          }`}
          title="Copy generated digits to clipboard"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Copy Text</span>
            </>
          )}
        </button>

        {/* Download TXT Button - Primary Highlight */}
        <button
          onClick={onDownloadTxt}
          disabled={!result}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-900/40 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-95"
          title="Download as .txt file"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .TXT</span>
        </button>

        {/* Advanced Export (PNG, SVG, HTML) */}
        <button
          onClick={onOpenExportModal}
          disabled={!result}
          className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
          title="Export as PNG, SVG, or styled HTML"
        >
          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Export Image</span>
        </button>

        {/* Reset settings */}
        <button
          onClick={onResetAll}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset all settings to default"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
