import React from 'react';
import { DitherResult, DitherConfig } from '../types';
import { Activity, Hash, FileCode, CheckCircle2 } from 'lucide-react';

interface StatsBarProps {
  result: DitherResult | null;
  config: DitherConfig;
}

export const StatsBar: React.FC<StatsBarProps> = ({ result, config }) => {
  if (!result) return null;

  const fileSizeKb = ((result.totalChars + result.height) / 1024).toFixed(1);
  const onesPercent =
    result.totalChars > 0
      ? Math.round((result.onesCount / result.totalChars) * 100)
      : 0;
  const zerosPercent = 100 - onesPercent;

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono z-20">
      {/* Left: Resolution & Metrics */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Hash className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-emerald-400">
            {result.width} × {result.height}
          </span>
          <span className="text-slate-500">chars</span>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          <span className="text-slate-500">Total:</span>
          <span className="text-slate-200">
            {result.totalChars.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <FileCode className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-200">{fileSizeKb} KB</span>
          <span className="text-slate-500">(.txt)</span>
        </div>

        {/* 1-Bit Distribution */}
        {config.charSetMode === '1bit-digits' && (
          <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-3">
            <span className="text-slate-500">Density:</span>
            <span className="text-emerald-400 font-bold">
              {config.oneDigit || '1'}: {onesPercent}%
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">
              {config.zeroDigit || '0'}: {zerosPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Right: Algorithm & Processing Time */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-300">{result.processingTimeMs} ms</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 uppercase font-bold">
          <CheckCircle2 className="w-3 h-3" />
          <span>{config.algorithm}</span>
        </div>
      </div>
    </footer>
  );
};
