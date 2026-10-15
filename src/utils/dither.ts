import { DitherConfig, DitherResult } from '../types';

// Bayer Matrices for ordered dithering
const BAYER_2X2 = [
  [0, 2],
  [3, 1],
];

const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

const BAYER_8X8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

// Density ramps (ordered from lightest / empty to darkest / solid)
export const PRESET_RAMPS = {
  '1bit-digits': { light: '0', dark: '1' },
  'numeric-ramp': ' .123456789',
  'hex-ramp': ' 0123456789ABCDEF',
  'ascii-classic': ' .:-=+*#%@',
  'blocks': ' ░▒▓█',
};

/**
 * Applies brightness, contrast, gamma, and edge sharpening to pixel data
 */
function applyImageAdjustments(
  data: Float32Array,
  width: number,
  height: number,
  config: DitherConfig
): Float32Array {
  const { brightness, contrast, gamma, sharpness, invert } = config.adjustments;
  const processed = new Float32Array(width * height);

  // Pre-calculate contrast factor
  // contrast: -100 to 100 -> factor ~ 0 to 3
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const gammaExp = 1 / Math.max(0.01, gamma);

  for (let i = 0; i < data.length; i++) {
    let val = data[i];

    // Invert if active
    if (invert) {
      val = 255 - val;
    }

    // Brightness (-100 to 100)
    val = val + (brightness * 2.55);

    // Contrast
    val = factor * (val - 128) + 128;

    // Clamp
    val = Math.max(0, Math.min(255, val));

    // Gamma
    if (gamma !== 1) {
      val = 255 * Math.pow(val / 255, gammaExp);
    }

    processed[i] = Math.max(0, Math.min(255, val));
  }

  // Sharpness (3x3 Laplacian / Unsharp Mask filter)
  if (sharpness > 0) {
    const sharpened = new Float32Array(width * height);
    const amount = (sharpness / 100) * 1.5;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;

        // Skip edges
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          sharpened[idx] = processed[idx];
          continue;
        }

        const center = processed[idx];
        const up = processed[(y - 1) * width + x];
        const down = processed[(y + 1) * width + x];
        const left = processed[y * width + (x - 1)];
        const right = processed[y * width + (x + 1)];

        // Laplacian edge
        const laplacian = 4 * center - up - down - left - right;
        const sharpVal = center + amount * laplacian;

        sharpened[idx] = Math.max(0, Math.min(255, sharpVal));
      }
    }
    return sharpened;
  }

  return processed;
}

/**
 * Resamples an HTMLImageElement or Canvas onto width x height grid
 * and extracts grayscale luminance.
 */
export function extractGrayscaleBuffer(
  img: HTMLImageElement | HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): Float32Array {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, targetWidth);
  canvas.height = Math.max(1, targetHeight);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return new Float32Array(targetWidth * targetHeight);

  // High quality smoothing for downsampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const rgba = imgData.data;
  const buffer = new Float32Array(canvas.width * canvas.height);

  for (let i = 0; i < buffer.length; i++) {
    const r = rgba[i * 4];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];
    const a = rgba[i * 4 + 3] / 255;

    // Rec. 709 Luminance blend against dark background for transparent areas
    const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
    buffer[i] = luma;
  }

  return buffer;
}

/**
 * Core Dithering Function
 * Returns ASCII art text and metadata
 */
export function ditherImage(
  img: HTMLImageElement | HTMLCanvasElement,
  config: DitherConfig
): DitherResult {
  const startTime = performance.now();
  const width = Math.max(1, Math.min(600, Math.floor(config.width)));
  const height = Math.max(1, Math.min(400, Math.floor(config.height)));

  // 1. Resample to target grid
  const rawLuma = extractGrayscaleBuffer(img, width, height);

  // 2. Adjust brightness, contrast, gamma, sharpness, invert
  const pixels = applyImageAdjustments(rawLuma, width, height, config);

  // 3. Prepare character set mapping
  let ramp: string[];
  const is1BitMode = config.charSetMode === '1bit-digits';

  if (is1BitMode) {
    const zeroChar = config.zeroDigit.length > 0 ? config.zeroDigit[0] : '0';
    const oneChar = config.oneDigit.length > 0 ? config.oneDigit[0] : '1';
    // Dark/active pixel is 1, Light/background is 0
    ramp = [zeroChar, oneChar];
  } else if (config.charSetMode === 'custom-ramp') {
    const chars = config.customChars.length > 0 ? config.customChars : '01';
    ramp = chars.split('');
  } else {
    const preset = PRESET_RAMPS[config.charSetMode] || PRESET_RAMPS['ascii-classic'];
    ramp = typeof preset === 'string' ? preset.split('') : ['0', '1'];
  }

  // Work with a mutable copy for error diffusion algorithms
  const workBuf = new Float32Array(pixels);
  const outputGrid: string[][] = Array.from({ length: height }, () => new Array(width));

  const thresholdBias = config.adjustments.thresholdBias ?? 128;
  const strength = config.ditherStrength ?? 1.0;
  let onesCount = 0;
  let zerosCount = 0;

  // Helper to safely diffuse error
  const addError = (x: number, y: number, err: number, weight: number) => {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      workBuf[y * width + x] += err * weight * strength;
    }
  };

  // Run selected dithering algorithm
  switch (config.algorithm) {
    case 'threshold': {
      // Direct binary threshold with no error diffusion
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const val = workBuf[y * width + x];
          if (is1BitMode) {
            const isDark = val < thresholdBias;
            outputGrid[y][x] = isDark ? ramp[1] : ramp[0];
            if (isDark) onesCount++; else zerosCount++;
          } else {
            const normalized = Math.max(0, Math.min(255, val));
            const charIdx = Math.floor((1 - normalized / 256) * ramp.length);
            outputGrid[y][x] = ramp[Math.min(ramp.length - 1, Math.max(0, charIdx))];
          }
        }
      }
      break;
    }

    case 'bayer-2':
    case 'bayer-4':
    case 'bayer-8': {
      // Ordered Bayer Dithering
      const matrix =
        config.algorithm === 'bayer-2'
          ? BAYER_2X2
          : config.algorithm === 'bayer-4'
          ? BAYER_4X4
          : BAYER_8X8;
      const mSize = matrix.length;
      const mMax = mSize * mSize;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const val = workBuf[y * width + x];
          const bayerNormalized = (matrix[y % mSize][x % mSize] + 0.5) / mMax; // 0..1
          // Scaled threshold based on Bayer matrix
          const dynamicThreshold = (bayerNormalized - 0.5) * (255 * strength) + thresholdBias;

          if (is1BitMode) {
            const isDark = val < dynamicThreshold;
            outputGrid[y][x] = isDark ? ramp[1] : ramp[0];
            if (isDark) onesCount++; else zerosCount++;
          } else {
            // Apply bayer perturbation to ramp selection
            const ditheredVal = val + (bayerNormalized - 0.5) * (255 / ramp.length) * strength;
            const normalized = Math.max(0, Math.min(255, ditheredVal));
            const charIdx = Math.floor((1 - normalized / 256) * ramp.length);
            outputGrid[y][x] = ramp[Math.min(ramp.length - 1, Math.max(0, charIdx))];
          }
        }
      }
      break;
    }

    case 'random': {
      // Random White-Noise Dithering
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const val = workBuf[y * width + x];
          const noise = (Math.random() - 0.5) * (180 * strength);
          const ditheredVal = val + noise;

          if (is1BitMode) {
            const isDark = ditheredVal < thresholdBias;
            outputGrid[y][x] = isDark ? ramp[1] : ramp[0];
            if (isDark) onesCount++; else zerosCount++;
          } else {
            const normalized = Math.max(0, Math.min(255, ditheredVal));
            const charIdx = Math.floor((1 - normalized / 256) * ramp.length);
            outputGrid[y][x] = ramp[Math.min(ramp.length - 1, Math.max(0, charIdx))];
          }
        }
      }
      break;
    }

    case 'halftone': {
      // Halftone dot matrix approximation
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const val = workBuf[y * width + x];
          // 4x4 circular dot weight
          const cx = (x % 4) - 1.5;
          const cy = (y % 4) - 1.5;
          const dist = Math.sqrt(cx * cx + cy * cy); // 0 to ~2.12
          const halftoneThreshold = (dist / 2.12) * 200 * strength + (thresholdBias - 100);

          if (is1BitMode) {
            const isDark = val < halftoneThreshold;
            outputGrid[y][x] = isDark ? ramp[1] : ramp[0];
            if (isDark) onesCount++; else zerosCount++;
          } else {
            const normalized = Math.max(0, Math.min(255, val + (dist / 2.12 - 0.5) * 80 * strength));
            const charIdx = Math.floor((1 - normalized / 256) * ramp.length);
            outputGrid[y][x] = ramp[Math.min(ramp.length - 1, Math.max(0, charIdx))];
          }
        }
      }
      break;
    }

    // Error diffusion algorithms
    default: {
      for (let y = 0; y < height; y++) {
        // Serpentine scanning alternates left-to-right & right-to-left
        const isReverse = config.serpentine && y % 2 === 1;
        const xStart = isReverse ? width - 1 : 0;
        const xEnd = isReverse ? -1 : width;
        const xStep = isReverse ? -1 : 1;

        for (let x = xStart; x !== xEnd; x += xStep) {
          const oldVal = workBuf[y * width + x];

          let newVal: number;
          let chosenChar: string;

          if (is1BitMode) {
            const isDark = oldVal < thresholdBias;
            newVal = isDark ? 0 : 255;
            chosenChar = isDark ? ramp[1] : ramp[0];
            if (isDark) onesCount++; else zerosCount++;
          } else {
            // Quantize to closest step in ramp
            const steps = ramp.length - 1;
            const norm = Math.max(0, Math.min(255, oldVal));
            // Inverted index: 0 luma = darkest char (highest index), 255 luma = empty (index 0)
            const exactIdx = (1 - norm / 255) * steps;
            const stepIdx = Math.min(steps, Math.max(0, Math.round(exactIdx)));
            chosenChar = ramp[stepIdx];
            newVal = 255 * (1 - stepIdx / steps);
          }

          outputGrid[y][x] = chosenChar;
          const err = oldVal - newVal;

          // Error diffusion patterns
          const dir = isReverse ? -1 : 1;

          if (config.algorithm === 'atkinson') {
            // Bill Atkinson (Macintosh 1984): 1/8 to 6 neighbours
            addError(x + dir * 1, y, err, 1 / 8);
            addError(x + dir * 2, y, err, 1 / 8);
            addError(x - dir * 1, y + 1, err, 1 / 8);
            addError(x, y + 1, err, 1 / 8);
            addError(x + dir * 1, y + 1, err, 1 / 8);
            addError(x, y + 2, err, 1 / 8);
          } else if (config.algorithm === 'sierra-3') {
            // Sierra 3-row (div 32)
            addError(x + dir * 1, y, err, 5 / 32);
            addError(x + dir * 2, y, err, 3 / 32);
            addError(x - dir * 2, y + 1, err, 2 / 32);
            addError(x - dir * 1, y + 1, err, 4 / 32);
            addError(x, y + 1, err, 5 / 32);
            addError(x + dir * 1, y + 1, err, 4 / 32);
            addError(x + dir * 2, y + 1, err, 2 / 32);
            addError(x - dir * 1, y + 2, err, 2 / 32);
            addError(x, y + 2, err, 3 / 32);
            addError(x + dir * 1, y + 2, err, 2 / 32);
          } else if (config.algorithm === 'sierra-2') {
            // Sierra Two-Row (div 16)
            addError(x + dir * 1, y, err, 4 / 16);
            addError(x + dir * 2, y, err, 3 / 16);
            addError(x - dir * 2, y + 1, err, 1 / 16);
            addError(x - dir * 1, y + 1, err, 2 / 16);
            addError(x, y + 1, err, 3 / 16);
            addError(x + dir * 1, y + 1, err, 2 / 16);
            addError(x + dir * 2, y + 1, err, 1 / 16);
          } else if (config.algorithm === 'stucki') {
            // Stucki (div 42)
            addError(x + dir * 1, y, err, 8 / 42);
            addError(x + dir * 2, y, err, 4 / 42);
            addError(x - dir * 2, y + 1, err, 2 / 42);
            addError(x - dir * 1, y + 1, err, 4 / 42);
            addError(x, y + 1, err, 8 / 42);
            addError(x + dir * 1, y + 1, err, 4 / 42);
            addError(x + dir * 2, y + 1, err, 2 / 42);
            addError(x - dir * 2, y + 2, err, 1 / 42);
            addError(x - dir * 1, y + 2, err, 2 / 42);
            addError(x, y + 2, err, 4 / 42);
            addError(x + dir * 1, y + 2, err, 2 / 42);
            addError(x + dir * 2, y + 2, err, 1 / 42);
          } else if (config.algorithm === 'burkes') {
            // Burkes (div 32)
            addError(x + dir * 1, y, err, 8 / 32);
            addError(x + dir * 2, y, err, 4 / 32);
            addError(x - dir * 2, y + 1, err, 2 / 32);
            addError(x - dir * 1, y + 1, err, 4 / 32);
            addError(x, y + 1, err, 8 / 32);
            addError(x + dir * 1, y + 1, err, 4 / 32);
            addError(x + dir * 2, y + 1, err, 2 / 32);
          } else if (config.algorithm === 'jarvis') {
            // Jarvis-Judice-Ninke (div 48)
            addError(x + dir * 1, y, err, 7 / 48);
            addError(x + dir * 2, y, err, 5 / 48);
            addError(x - dir * 2, y + 1, err, 3 / 48);
            addError(x - dir * 1, y + 1, err, 5 / 48);
            addError(x, y + 1, err, 7 / 48);
            addError(x + dir * 1, y + 1, err, 5 / 48);
            addError(x + dir * 2, y + 1, err, 3 / 48);
            addError(x - dir * 2, y + 2, err, 1 / 48);
            addError(x - dir * 1, y + 2, err, 3 / 48);
            addError(x, y + 2, err, 5 / 48);
            addError(x + dir * 1, y + 2, err, 3 / 48);
            addError(x + dir * 2, y + 2, err, 1 / 48);
          } else {
            // Floyd-Steinberg (div 16) default
            addError(x + dir * 1, y, err, 7 / 16);
            addError(x - dir * 1, y + 1, err, 3 / 16);
            addError(x, y + 1, err, 5 / 16);
            addError(x + dir * 1, y + 1, err, 1 / 16);
          }
        }
      }
      break;
    }
  }

  // Format lines
  const lines = outputGrid.map((row) => row.join(''));
  const text = lines.join('\n');
  const endTime = performance.now();

  return {
    text,
    lines,
    width,
    height,
    totalChars: width * height,
    onesCount,
    zerosCount,
    processingTimeMs: Math.round(endTime - startTime),
  };
}

/**
 * Calculates matching height or width preserving visual aspect ratio
 * Monospace font characters are generally twice as tall as they are wide (~0.5 aspect ratio).
 */
export function calculateAspectRatioDimensions(
  naturalWidth: number,
  naturalHeight: number,
  specifiedWidth: number,
  charAspectRatio: number = 0.5
): number {
  if (naturalWidth <= 0) return 40;
  const imageAspect = naturalHeight / naturalWidth;
  // chars are narrower than tall, so to make it square on screen, we scale by charAspectRatio
  const calculatedHeight = Math.round(specifiedWidth * imageAspect * charAspectRatio);
  return Math.max(5, calculatedHeight);
}

export function calculateAspectRatioWidth(
  naturalWidth: number,
  naturalHeight: number,
  specifiedHeight: number,
  charAspectRatio: number = 0.5
): number {
  if (naturalHeight <= 0) return 80;
  const imageAspect = naturalWidth / naturalHeight;
  const calculatedWidth = Math.round((specifiedHeight * imageAspect) / charAspectRatio);
  return Math.max(5, calculatedWidth);
}
