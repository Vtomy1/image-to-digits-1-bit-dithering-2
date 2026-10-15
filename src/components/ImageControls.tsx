import React, { useRef } from 'react';
import {
  Upload,
  Lock,
  Unlock,
  Sliders,
  Type,
  Maximize2,
  RefreshCw,
  Sun,
  Contrast as ContrastIcon,
  Zap,
  ArrowLeftRight,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  DitherConfig,
  DitherAlgorithm,
  CharSetMode,
  SampleImage,
} from '../types';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import { PRESET_RAMPS } from '../utils/dither';

interface ImageControlsProps {
  config: DitherConfig;
  onChangeConfig: (newConfig: Partial<DitherConfig>) => void;
  onImageLoaded: (img: HTMLImageElement) => void;
  imageDimensions: { width: number; height: number } | null;
  currentSampleId: string | null;
  onSelectSample: (sample: SampleImage) => void;
}

const ALGORITHMS: { id: DitherAlgorithm; name: string; tag: string; desc: string }[] = [
  { id: 'floyd-steinberg', name: 'Floyd-Steinberg', tag: 'Standard', desc: 'Balanced 4-neighbour error diffusion' },
  { id: 'atkinson', name: 'Atkinson (Mac)', tag: 'Classic', desc: '1984 Apple Macintosh 1-bit high-contrast style' },
  { id: 'bayer-8', name: 'Bayer 8×8', tag: 'Matrix', desc: 'Fine ordered cross-hatch matrix dithering' },
  { id: 'bayer-4', name: 'Bayer 4×4', tag: 'Retro', desc: 'Game Boy / 90s console dot pattern' },
  { id: 'bayer-2', name: 'Bayer 2×2', tag: 'Coarse', desc: 'High-contrast checkerboard cross-hatch' },
  { id: 'sierra-3', name: 'Sierra', tag: 'Smooth', desc: 'Three-row smooth gradient diffusion' },
  { id: 'sierra-2', name: 'Sierra Lite', tag: 'Crisp', desc: 'Fast two-row sharp diffusion' },
  { id: 'stucki', name: 'Stucki', tag: 'Hi-Fi', desc: 'Clean edge retention error diffusion' },
  { id: 'burkes', name: 'Burkes', tag: 'Crisp', desc: 'Clean 7-neighbour error dispersion' },
  { id: 'jarvis', name: 'Jarvis-Judice', tag: 'Soft', desc: 'Ultra-wide 12-neighbour smooth gradient' },
  { id: 'threshold', name: 'Threshold (Raw)', tag: 'Hard 1-Bit', desc: 'No error diffusion, direct binary cutoff' },
  { id: 'halftone', name: 'Halftone Dots', tag: 'Print', desc: 'Rotated dot screen newspaper aesthetic' },
  { id: 'random', name: 'White Noise', tag: 'Stipple', desc: 'Film grain randomized stippling' },
];

export const ImageControls: React.FC<ImageControlsProps> = ({
  config,
  onChangeConfig,
  onImageLoaded,
  imageDimensions,
  currentSampleId,
  onSelectSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        onImageLoaded(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          onImageLoaded(img);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Dimensions Helpers
  const handleWidthChange = (val: number) => {
    const newWidth = Math.max(10, Math.min(400, val));
    if (config.maintainAspectRatio && imageDimensions) {
      const imageAspect = imageDimensions.height / imageDimensions.width;
      const newHeight = Math.max(
        5,
        Math.round(newWidth * imageAspect * config.charAspectRatio)
      );
      onChangeConfig({ width: newWidth, height: newHeight });
    } else {
      onChangeConfig({ width: newWidth });
    }
  };

  const handleHeightChange = (val: number) => {
    const newHeight = Math.max(5, Math.min(300, val));
    if (config.maintainAspectRatio && imageDimensions) {
      const imageAspect = imageDimensions.width / imageDimensions.height;
      const newWidth = Math.max(
        10,
        Math.round((newHeight * imageAspect) / config.charAspectRatio)
      );
      onChangeConfig({ width: newWidth, height: newHeight });
    } else {
      onChangeConfig({ height: newHeight });
    }
  };

  const setPresetDimensions = (w: number, h?: number) => {
    if (h !== undefined) {
      onChangeConfig({ width: w, height: h });
    } else if (imageDimensions) {
      const imageAspect = imageDimensions.height / imageDimensions.width;
      const newHeight = Math.max(
        5,
        Math.round(w * imageAspect * config.charAspectRatio)
      );
      onChangeConfig({ width: w, height: newHeight });
    } else {
      onChangeConfig({ width: w, height: Math.round(w * 0.5) });
    }
  };

  // Swap 1-bit digits
  const handleSwapDigits = () => {
    onChangeConfig({
      oneDigit: config.zeroDigit,
      zeroDigit: config.oneDigit,
    });
  };

  // Reset adjustments
  const handleResetAdjustments = () => {
    onChangeConfig({
      adjustments: {
        brightness: 0,
        contrast: 0,
        gamma: 1.0,
        sharpness: 25,
        invert: false,
        thresholdBias: 128,
      },
      ditherStrength: 1.0,
    });
  };

  return (
    <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-5 p-4 overflow-y-auto bg-slate-900/60 border-r border-slate-800 text-slate-200 text-xs">
      {/* 1. Image Source & Upload */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Image Source</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            Ctrl+V to paste
          </span>
        </div>

        {/* Upload dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-3.5 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/80 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center gap-1.5">
            <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-emerald-950/60 group-hover:text-emerald-400 text-slate-400 transition-colors">
              <Upload className="w-4 h-4" />
            </div>
            <p className="font-medium text-slate-300">
              Drop image here, or{' '}
              <span className="text-emerald-400 underline decoration-emerald-500/40 underline-offset-2">
                browse
              </span>
            </p>
            <p className="text-[11px] text-slate-500">
              PNG, JPG, WebP, GIF, SVG
            </p>
          </div>
        </div>

        {/* Sample presets gallery */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Or choose instant test sample:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className={`p-1.5 rounded-lg border text-left flex flex-col items-center gap-1 transition-all ${
                  currentSampleId === sample.id
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title={sample.description}
              >
                <img
                  src={sample.dataUrl}
                  alt={sample.name}
                  className="w-10 h-10 object-contain rounded bg-black/40"
                />
                <span className="text-[10px] font-medium truncate w-full text-center">
                  {sample.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800/80" />

      {/* 2. Custom Height & Width Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Output Dimensions</span>
          </label>
          <button
            onClick={() =>
              onChangeConfig({
                maintainAspectRatio: !config.maintainAspectRatio,
              })
            }
            className={`px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1 transition-colors ${
              config.maintainAspectRatio
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={
              config.maintainAspectRatio
                ? 'Aspect Ratio Locked (proportional to image)'
                : 'Free Dimensions'
            }
          >
            {config.maintainAspectRatio ? (
              <>
                <Lock className="w-3 h-3" />
                <span>Locked</span>
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3" />
                <span>Unlocked</span>
              </>
            )}
          </button>
        </div>

        {/* Width & Height Number Inputs + Sliders */}
        <div className="grid grid-cols-2 gap-3">
          {/* Width */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Width (columns)</span>
              <span className="font-mono text-emerald-400 font-bold">
                {config.width}
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="350"
              value={config.width}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <input
              type="number"
              min="10"
              max="400"
              value={config.width}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Height */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Height (rows)</span>
              <span className="font-mono text-emerald-400 font-bold">
                {config.height}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="250"
              value={config.height}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <input
              type="number"
              min="5"
              max="300"
              value={config.height}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Character Aspect Ratio Fine Tuner */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-2 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1" title="Monospace characters are taller than wide. Standard monospace is 0.50 (2:1).">
              <span>Font Aspect Correction</span>
              <HelpCircle className="w-3 h-3 text-slate-500" />
            </span>
            <span className="font-mono text-slate-200">
              {config.charAspectRatio.toFixed(2)}x
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.35"
              max="1.0"
              step="0.01"
              value={config.charAspectRatio}
              onChange={(e) => {
                const ratio = parseFloat(e.target.value);
                onChangeConfig({ charAspectRatio: ratio });
                if (config.maintainAspectRatio && imageDimensions) {
                  const imageAspect = imageDimensions.height / imageDimensions.width;
                  const newHeight = Math.max(
                    5,
                    Math.round(config.width * imageAspect * ratio)
                  );
                  onChangeConfig({ height: newHeight, charAspectRatio: ratio });
                }
              }}
              className="flex-1 accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded"
            />
            <button
              onClick={() => {
                onChangeConfig({ charAspectRatio: 0.5 });
                if (config.maintainAspectRatio && imageDimensions) {
                  const imageAspect = imageDimensions.height / imageDimensions.width;
                  onChangeConfig({
                    charAspectRatio: 0.5,
                    height: Math.round(config.width * imageAspect * 0.5),
                  });
                }
              }}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Reset to 0.50 standard monospace ratio"
            >
              Reset (0.5)
            </button>
          </div>
        </div>

        {/* Quick Resolution Presets */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400">Quick Presets:</span>
          <div className="flex flex-wrap gap-1">
            {[
              { label: '60×30', w: 60, h: 30 },
              { label: '80×40 (Terminal)', w: 80, h: 40 },
              { label: '100×50', w: 100, h: 50 },
              { label: '120×60', w: 120, h: 60 },
              { label: '160×80', w: 160, h: 80 },
              { label: '64×64 (Square)', w: 64, h: 64 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => setPresetDimensions(p.w, p.h)}
                className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                  config.width === p.w && config.height === p.h
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-semibold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800/80" />

      {/* 3. Digits & Character Set Mode */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-emerald-400" />
          <span>Digits & Character Mapping</span>
        </label>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          {[
            { id: '1bit-digits', label: '1-Bit Binary', badge: '0 / 1' },
            { id: 'numeric-ramp', label: '10 Digits', badge: '0-9' },
            { id: 'hex-ramp', label: 'Hexadecimal', badge: '0-F' },
            { id: 'custom-ramp', label: 'Custom Chars', badge: 'User' },
            { id: 'ascii-classic', label: 'Classic ASCII', badge: '@#%*' },
            { id: 'blocks', label: 'Block Density', badge: '░▒▓█' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() =>
                onChangeConfig({ charSetMode: mode.id as CharSetMode })
              }
              className={`px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between transition-all ${
                config.charSetMode === mode.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span className="truncate">{mode.label}</span>
              <span
                className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                  config.charSetMode === mode.id
                    ? 'bg-slate-950/20 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {mode.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Mode Specific Inputs */}
        {config.charSetMode === '1bit-digits' && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium">1-Bit Digit Pair</span>
              <button
                onClick={handleSwapDigits}
                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                title="Swap 1 and 0 mapping"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Swap</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Active / Foreground Digit
                </label>
                <input
                  type="text"
                  maxLength={1}
                  value={config.oneDigit}
                  onChange={(e) =>
                    onChangeConfig({ oneDigit: e.target.value || '1' })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono text-center text-sm font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Empty / Background Digit
                </label>
                <input
                  type="text"
                  maxLength={1}
                  value={config.zeroDigit}
                  onChange={(e) =>
                    onChangeConfig({ zeroDigit: e.target.value || '0' })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 font-mono text-center text-sm font-bold focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. 0, ., or space"
                />
              </div>
            </div>

            {/* Quick digit presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500">Pairs:</span>
              {[
                { one: '1', zero: '0' },
                { one: '1', zero: ' ' },
                { one: '0', zero: '1' },
                { one: '#', zero: '.' },
                { one: '8', zero: '0' },
                { one: '█', zero: ' ' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    onChangeConfig({ oneDigit: p.one, zeroDigit: p.zero })
                  }
                  className="px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900 font-mono text-[10px] text-slate-300 hover:border-emerald-500 hover:text-emerald-300"
                >
                  {p.one}/{p.zero === ' ' ? '␣' : p.zero}
                </button>
              ))}
            </div>
          </div>
        )}

        {config.charSetMode === 'custom-ramp' && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-slate-300 text-[11px]">
              <span>Custom Characters (Lightest → Darkest)</span>
              <span className="font-mono text-emerald-400 font-bold">
                {config.customChars.length} chars
              </span>
            </div>
            <input
              type="text"
              value={config.customChars}
              onChange={(e) => onChangeConfig({ customChars: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:border-emerald-500 focus:outline-none tracking-widest"
              placeholder="e.g.  .123456789"
            />
            {/* Visual gradient preview of custom chars */}
            <div className="flex items-center gap-1 font-mono text-xs bg-slate-900/90 p-2 rounded border border-slate-800 text-center justify-center overflow-x-auto text-emerald-400">
              {config.customChars.split('').map((c, i) => (
                <span
                  key={i}
                  className="inline-block w-4 h-5 border border-slate-800/80 rounded bg-slate-950/50"
                >
                  {c === ' ' ? '␣' : c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-slate-800/80" />

      {/* 4. Dithering Algorithms */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dithering Algorithm</span>
          </label>
        </div>

        {/* Algorithm Dropdown / Select */}
        <div className="relative">
          <select
            value={config.algorithm}
            onChange={(e) =>
              onChangeConfig({ algorithm: e.target.value as DitherAlgorithm })
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs font-medium focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer"
          >
            {ALGORITHMS.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name} — [{algo.tag}] {algo.desc}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            ▼
          </div>
        </div>

        {/* Quick algorithm chips */}
        <div className="flex flex-wrap gap-1">
          {ALGORITHMS.slice(0, 6).map((algo) => (
            <button
              key={algo.id}
              onClick={() => onChangeConfig({ algorithm: algo.id })}
              className={`px-2 py-1 rounded text-[10px] border transition-all ${
                config.algorithm === algo.id
                  ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-medium'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              {algo.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Dither Strength Slider */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Dither Intensity / Strength</span>
            <span className="font-mono text-emerald-400 font-bold">
              {Math.round(config.ditherStrength * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.ditherStrength}
            onChange={(e) =>
              onChangeConfig({ ditherStrength: parseFloat(e.target.value) })
            }
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Serpentine Scanning Toggle */}
        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 cursor-pointer hover:bg-slate-950/80 transition-colors">
          <div>
            <span className="font-medium text-slate-200">
              Serpentine Scanning
            </span>
            <p className="text-[10px] text-slate-500">
              Alternates row direction to eliminate diagonal worm artifacts
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.serpentine}
            onChange={(e) => onChangeConfig({ serpentine: e.target.checked })}
            className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
          />
        </label>
      </div>

      <div className="h-px bg-slate-800/80" />

      {/* 5. Image Preprocessing Adjustments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Image Processing</span>
          </label>
          <button
            onClick={handleResetAdjustments}
            className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Invert toggle */}
        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 cursor-pointer hover:bg-slate-950/80 transition-colors">
          <span className="font-medium text-slate-200">Invert Negative</span>
          <input
            type="checkbox"
            checked={config.adjustments.invert}
            onChange={(e) =>
              onChangeConfig({
                adjustments: {
                  ...config.adjustments,
                  invert: e.target.checked,
                },
              })
            }
            className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
          />
        </label>

        {/* Threshold Cutoff Bias */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Threshold Bias (Light vs Dark balance)</span>
            <span className="font-mono text-emerald-400 font-bold">
              {config.adjustments.thresholdBias}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="245"
            value={config.adjustments.thresholdBias}
            onChange={(e) =>
              onChangeConfig({
                adjustments: {
                  ...config.adjustments,
                  thresholdBias: Number(e.target.value),
                },
              })
            }
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sun className="w-3 h-3" />
              <span>Brightness</span>
            </span>
            <span className="font-mono text-slate-200">
              {config.adjustments.brightness > 0 ? '+' : ''}
              {config.adjustments.brightness}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={config.adjustments.brightness}
            onChange={(e) =>
              onChangeConfig({
                adjustments: {
                  ...config.adjustments,
                  brightness: Number(e.target.value),
                },
              })
            }
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ContrastIcon className="w-3 h-3" />
              <span>Contrast</span>
            </span>
            <span className="font-mono text-slate-200">
              {config.adjustments.contrast > 0 ? '+' : ''}
              {config.adjustments.contrast}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={config.adjustments.contrast}
            onChange={(e) =>
              onChangeConfig({
                adjustments: {
                  ...config.adjustments,
                  contrast: Number(e.target.value),
                },
              })
            }
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Sharpness / Edge boost */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1" title="Sharpening enhances outlines and silhouettes for crisper ASCII text">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Edge Sharpening</span>
            </span>
            <span className="font-mono text-slate-200">
              {config.adjustments.sharpness}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={config.adjustments.sharpness}
            onChange={(e) =>
              onChangeConfig({
                adjustments: {
                  ...config.adjustments,
                  sharpness: Number(e.target.value),
                },
              })
            }
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Gamma */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Gamma Correction</span>
            <span className="font-mono text-slate-200">
              {config.adjustments.gamma.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.05"
            value={config.adjustments.gamma}
            onChange={(e) =>
              onChangeConfig({
                adjustments: {
                  ...config.adjustments,
                  gamma: parseFloat(e.target.value),
                },
              })
            }
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
