export type DitherAlgorithm =
  | 'floyd-steinberg'
  | 'atkinson'
  | 'bayer-8'
  | 'bayer-4'
  | 'bayer-2'
  | 'sierra-3'
  | 'sierra-2'
  | 'stucki'
  | 'burkes'
  | 'jarvis'
  | 'threshold'
  | 'halftone'
  | 'random';

export type CharSetMode =
  | '1bit-digits'
  | 'numeric-ramp'
  | 'hex-ramp'
  | 'custom-ramp'
  | 'ascii-classic'
  | 'blocks';

export type ThemeMode =
  | 'matrix'
  | 'amber'
  | 'cyberpunk'
  | 'monochrome-dark'
  | 'monochrome-light'
  | 'gameboy'
  | 'slate';

export type FontFamily = 'jetbrains' | 'vt323' | 'fira' | 'monospace';

export type ViewMode = 'ascii' | 'split' | 'slider' | 'original';

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  gamma: number; // 0.2 to 2.5
  sharpness: number; // 0 to 100
  invert: boolean;
  thresholdBias: number; // 0 to 255
}

export interface DitherConfig {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  charAspectRatio: number; // e.g. 0.50 for standard monospace, 1.0 for square
  algorithm: DitherAlgorithm;
  charSetMode: CharSetMode;
  oneDigit: string; // Active / dark character (e.g. '1')
  zeroDigit: string; // Background / light character (e.g. '0' or ' ')
  customChars: string; // User defined sequence from darkest to lightest
  serpentine: boolean; // Zigzag error diffusion
  ditherStrength: number; // 0 to 1 (0% to 100%)
  adjustments: ImageAdjustments;
}

export interface DitherResult {
  text: string;
  lines: string[];
  width: number;
  height: number;
  totalChars: number;
  onesCount: number;
  zerosCount: number;
  processingTimeMs: number;
}

export interface SampleImage {
  id: string;
  name: string;
  description: string;
  dataUrl: string;
}
