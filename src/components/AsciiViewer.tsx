import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Copy,
  Download,
  Search,
  Check,
  Split,
  Eye,
  Columns,
  Sliders,
  Terminal,
  Tv,
  Layers,
} from 'lucide-react';
import {
  DitherResult,
  ThemeMode,
  FontFamily,
  ViewMode,
} from '../types';
import { THEME_PALETTES } from '../utils/export';

interface AsciiViewerProps {
  result: DitherResult | null;
  originalImageSrc: string | null;
  onDownloadTxt: () => void;
  onCopyText: () => void;
  isCopied: boolean;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  fontFamily: FontFamily;
  onChangeFontFamily: (font: FontFamily) => void;
}

export const AsciiViewer: React.FC<AsciiViewerProps> = ({
  result,
  originalImageSrc,
  onDownloadTxt,
  onCopyText,
  isCopied,
  theme,
  onChangeTheme,
  fontFamily,
  onChangeFontFamily,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('ascii');
  const [fontSize, setFontSize] = useState<number>(10);
  const [lineHeight, setLineHeight] = useState<number>(1.0);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(100);
  const [crtScanlines, setCrtScanlines] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0-100%

  // Pan state
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollPosRef = useRef<{ left: number; top: number }>({ left: 0, top: 0 });

  const currentTheme = THEME_PALETTES[theme] || THEME_PALETTES.matrix;

  // Resolve font CSS class
  const fontClass = useMemo(() => {
    switch (fontFamily) {
      case 'vt323':
        return 'font-vt323';
      case 'fira':
        return 'font-fira';
      case 'monospace':
        return 'font-mono';
      default:
        return 'font-jetbrains';
    }
  }, [fontFamily]);

  // Adjust font size based on dimensions on initial load
  useEffect(() => {
    if (result) {
      if (result.width > 180) {
        setFontSize(7);
      } else if (result.width > 120) {
        setFontSize(8);
      } else if (result.width > 80) {
        setFontSize(10);
      } else {
        setFontSize(12);
      }
    }
  }, [result?.width]);

  // Handle Pan Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left mouse when clicking background
    if (e.button !== 0) return;
    if (!containerRef.current) return;

    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    scrollPosRef.current = {
      left: containerRef.current.scrollLeft,
      top: containerRef.current.scrollTop,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    containerRef.current.scrollLeft = scrollPosRef.current.left - dx;
    containerRef.current.scrollTop = scrollPosRef.current.top - dy;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(25, Math.min(300, prev + delta)));
  };

  const handleFit = () => {
    if (!containerRef.current || !result) return;
    const containerW = containerRef.current.clientWidth - 48;
    // Estimate char width: roughly fontSize * 0.6
    const estimatedWidth = result.width * (fontSize * 0.6);
    if (estimatedWidth > 0) {
      const targetZoom = Math.min(200, Math.max(30, Math.round((containerW / estimatedWidth) * 100)));
      setZoom(targetZoom);
    } else {
      setZoom(100);
    }
  };

  // Highlight matches if search active
  const renderHighlightedContent = () => {
    if (!result) return null;
    if (!searchQuery) {
      return result.text;
    }

    // Split text into spans for highlight
    const parts = result.text.split(searchQuery);
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < parts.length - 1 && (
          <mark className="bg-yellow-400 text-black px-0.5 rounded font-bold">
            {searchQuery}
          </mark>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative select-none">
      {/* Top Toolbar */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-10 backdrop-blur-sm">
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {[
            { id: 'ascii', label: 'ASCII Art', icon: Terminal },
            { id: 'split', label: 'Side-by-Side', icon: Columns },
            { id: 'slider', label: 'Split Slider', icon: Split },
            { id: 'original', label: 'Original', icon: Eye },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as ViewMode)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === mode.id
                    ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center: Theme & Font Pickers */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mr-1 hidden md:inline">
              Theme
            </span>
            {(
              [
                { id: 'matrix', label: 'Matrix', bg: '#050c05', dot: '#22c55e' },
                { id: 'amber', label: 'Amber', bg: '#0c0a06', dot: '#f59e0b' },
                { id: 'cyberpunk', label: 'Neon', bg: '#090a16', dot: '#06b6d4' },
                { id: 'monochrome-dark', label: 'Dark', bg: '#000000', dot: '#ffffff' },
                { id: 'monochrome-light', label: 'Light', bg: '#ffffff', dot: '#000000' },
                { id: 'gameboy', label: 'LCD', bg: '#8bac0f', dot: '#0f380f' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => onChangeTheme(t.id)}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  theme === t.id
                    ? 'scale-125 ring-2 ring-emerald-500 ring-offset-1 ring-offset-slate-950 border-white'
                    : 'border-slate-700 opacity-60 hover:opacity-100 hover:scale-110'
                }`}
                style={{ backgroundColor: t.dot }}
                title={t.label}
              />
            ))}
          </div>

          {/* Font Family Selector */}
          <select
            value={fontFamily}
            onChange={(e) => onChangeFontFamily(e.target.value as FontFamily)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="jetbrains">JetBrains Mono</option>
            <option value="vt323">VT323 (Retro CRT)</option>
            <option value="fira">Fira Code</option>
            <option value="monospace">Standard Mono</option>
          </select>

          {/* Scanline CRT overlay toggle */}
          <button
            onClick={() => setCrtScanlines(!crtScanlines)}
            className={`p-1.5 rounded-lg border transition-colors ${
              crtScanlines
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Retro CRT Scanlines"
          >
            <Tv className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Zoom & Search */}
        <div className="flex items-center gap-2">
          {/* Search / Highlight in ASCII */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Find digit (e.g. 1)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 focus:w-44 transition-all bg-slate-950 border border-slate-800 rounded-lg pl-6 pr-2 py-1 text-slate-200 text-[11px] focus:outline-none focus:border-emerald-500 font-mono"
            />
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1 text-[10px] text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-1 rounded-lg border border-slate-800 text-slate-300">
            <button
              onClick={() => handleZoom(-15)}
              className="p-1 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] w-9 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => handleZoom(15)}
              className="p-1 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="p-1 hover:text-emerald-400 border-l border-slate-800 pl-1.5 ml-0.5"
              title="Fit to Screen"
            >
              <Maximize className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Font Size & Spacing Bar (Sub-bar) */}
      <div className="border-b border-slate-900 bg-slate-950/60 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 gap-4 overflow-x-auto">
        <div className="flex items-center gap-4">
          {/* Font Size Slider */}
          <div className="flex items-center gap-2">
            <span>Size:</span>
            <input
              type="range"
              min="4"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-20 accent-emerald-500 h-1 bg-slate-800 rounded cursor-pointer"
            />
            <span className="font-mono text-slate-200">{fontSize}px</span>
          </div>

          {/* Line Height Slider */}
          <div className="flex items-center gap-2">
            <span>Line:</span>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.05"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className="w-16 accent-emerald-500 h-1 bg-slate-800 rounded cursor-pointer"
            />
            <span className="font-mono text-slate-200">
              {lineHeight.toFixed(2)}x
            </span>
          </div>

          {/* Letter Spacing */}
          <div className="flex items-center gap-2">
            <span>Spacing:</span>
            <input
              type="range"
              min="-2"
              max="6"
              step="0.5"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
              className="w-16 accent-emerald-500 h-1 bg-slate-800 rounded cursor-pointer"
            />
            <span className="font-mono text-slate-200">
              {letterSpacing}px
            </span>
          </div>
        </div>

        {/* Quick hint */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-500">
          <span>Click & drag to pan</span>
          <span>•</span>
          <span>Scroll to inspect</span>
        </div>
      </div>

      {/* Main View Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center relative cursor-grab active:cursor-grabbing"
        style={{
          backgroundColor: currentTheme.bg,
        }}
      >
        {/* CRT Scanlines Overlay */}
        {crtScanlines && (
          <div className="absolute inset-0 scanlines-overlay pointer-events-none z-20" />
        )}

        {/* View Mode: Original Image Only */}
        {viewMode === 'original' && originalImageSrc && (
          <div className="max-w-2xl max-h-full flex flex-col items-center justify-center p-4">
            <img
              src={originalImageSrc}
              alt="Original"
              className="max-h-[70vh] object-contain rounded-lg border border-slate-800 shadow-2xl"
            />
            <p className="text-xs text-slate-400 mt-3 font-mono">
              Source Image Preview
            </p>
          </div>
        )}

        {/* View Mode: Side-by-Side */}
        {viewMode === 'split' && (
          <div className="flex flex-col lg:flex-row items-center gap-6 max-w-full">
            {originalImageSrc && (
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-mono text-slate-400 mb-2 uppercase tracking-wider">
                  Original Source
                </span>
                <img
                  src={originalImageSrc}
                  alt="Original"
                  className="max-h-[50vh] max-w-xs object-contain rounded-lg border border-slate-800 shadow-xl"
                />
              </div>
            )}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-mono text-emerald-400 mb-2 uppercase tracking-wider">
                1-Bit Dithered Art ({result?.width}×{result?.height})
              </span>
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                }}
                className="transition-transform duration-75"
              >
                <pre
                  className={`select-text leading-none whitespace-pre ${fontClass}`}
                  style={{
                    color: currentTheme.text,
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                    letterSpacing: `${letterSpacing}px`,
                  }}
                >
                  {renderHighlightedContent()}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Interactive Split Slider */}
        {viewMode === 'slider' && originalImageSrc && result && (
          <div className="relative max-w-2xl w-full h-[65vh] flex items-center justify-center border border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-black">
            {/* ASCII Layer (Underneath / Left) */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-4">
              <pre
                className={`select-text leading-none whitespace-pre ${fontClass}`}
                style={{
                  color: currentTheme.text,
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  letterSpacing: `${letterSpacing}px`,
                }}
              >
                {renderHighlightedContent()}
              </pre>
            </div>

            {/* Original Image Layer (Clipped by slider position) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`,
              }}
            >
              <img
                src={originalImageSrc}
                alt="Original"
                className="max-h-[60vh] object-contain shadow-2xl"
              />
            </div>

            {/* Slider Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-lg cursor-ew-resize z-20"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                <Split className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Hidden range input over top for smooth dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
            />
          </div>
        )}

        {/* View Mode: ASCII Art Only (Default Primary Canvas) */}
        {viewMode === 'ascii' && result && (
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
            className="transition-transform duration-75 inline-block text-left"
          >
            <pre
              className={`select-text leading-none whitespace-pre p-2 ${fontClass}`}
              style={{
                color: currentTheme.text,
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                letterSpacing: `${letterSpacing}px`,
                textShadow: crtScanlines
                  ? `0 0 4px ${currentTheme.text}80`
                  : undefined,
              }}
            >
              {renderHighlightedContent()}
            </pre>
          </div>
        )}

        {/* Empty State */}
        {!result && (
          <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
            <Terminal className="w-10 h-10 opacity-30 animate-pulse" />
            <p className="text-sm font-mono">Generating dithered art...</p>
          </div>
        )}

        {/* Floating Fast Action Badges on Top-Right of Canvas */}
        {result && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
            <button
              onClick={onCopyText}
              className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white shadow-lg backdrop-blur transition-all active:scale-95"
              title="Copy all digits to clipboard"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onDownloadTxt}
              className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg transition-all active:scale-95 font-semibold"
              title="Download TXT file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
