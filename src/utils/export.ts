import { ThemeMode, FontFamily } from '../types';

export interface ExportPngOptions {
  fontSize?: number;
  lineHeight?: number;
  padding?: number;
  bgColor?: string;
  textColor?: string;
  fontFamily?: FontFamily;
}

export const THEME_PALETTES: Record<
  ThemeMode,
  { name: string; bg: string; text: string; accent: string; border: string }
> = {
  matrix: {
    name: 'Matrix Terminal',
    bg: '#050c05',
    text: '#22c55e',
    accent: '#4ade80',
    border: '#14532d',
  },
  amber: {
    name: 'Phosphor Amber',
    bg: '#0c0a06',
    text: '#f59e0b',
    accent: '#fbbf24',
    border: '#78350f',
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    bg: '#090a16',
    text: '#06b6d4',
    accent: '#f43f5e',
    border: '#1e293b',
  },
  'monochrome-dark': {
    name: 'Paper on Black',
    bg: '#000000',
    text: '#ffffff',
    accent: '#94a3b8',
    border: '#27272a',
  },
  'monochrome-light': {
    name: 'Ink on White',
    bg: '#ffffff',
    text: '#09090b',
    accent: '#64748b',
    border: '#e4e4e7',
  },
  gameboy: {
    name: 'Game Boy LCD',
    bg: '#8bac0f',
    text: '#0f380f',
    accent: '#306230',
    border: '#306230',
  },
  slate: {
    name: 'Dev Slate',
    bg: '#0f172a',
    text: '#cbd5e1',
    accent: '#38bdf8',
    border: '#334155',
  },
};

/**
 * Trigger download of plain text file
 */
export function downloadTxtFile(
  content: string,
  filename = 'dithered-digits.txt',
  includeMetadata = false,
  metadata?: { width: number; height: number; algorithm: string }
): void {
  let fileData = content;
  if (includeMetadata && metadata) {
    const header = [
      `# Image to Digits 1-Bit ASCII Art`,
      `# Dimensions: ${metadata.width} x ${metadata.height}`,
      `# Algorithm: ${metadata.algorithm}`,
      `# Generated: ${new Date().toISOString()}`,
      `# ---------------------------------------------`,
      '',
    ].join('\n');
    fileData = header + content;
  }

  const blob = new Blob([fileData], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy plain text to clipboard
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Render text to offscreen canvas and download as PNG
 */
export function downloadAsPng(
  lines: string[],
  filename = 'dithered-art.png',
  options: ExportPngOptions = {}
): void {
  if (!lines || lines.length === 0) return;

  const fontSize = options.fontSize || 12;
  const lineHeight = (options.lineHeight || 1.15) * fontSize;
  const padding = options.padding || 24;
  const bgColor = options.bgColor || '#050c05';
  const textColor = options.textColor || '#22c55e';

  // Font family resolution
  let fontName = "'JetBrains Mono', monospace";
  if (options.fontFamily === 'vt323') fontName = "'VT323', monospace";
  if (options.fontFamily === 'fira') fontName = "'Fira Code', monospace";
  if (options.fontFamily === 'monospace') fontName = 'monospace';

  // Character width estimate in monospace
  const testCanvas = document.createElement('canvas');
  const testCtx = testCanvas.getContext('2d');
  if (!testCtx) return;
  testCtx.font = `${fontSize}px ${fontName}`;
  const charWidth = testCtx.measureText('M').width || fontSize * 0.6;

  const maxLineLength = Math.max(...lines.map((l) => l.length));
  const canvasWidth = Math.ceil(maxLineLength * charWidth + padding * 2);
  const canvasHeight = Math.ceil(lines.length * lineHeight + padding * 2);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Text
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px ${fontName}`;
  ctx.textBaseline = 'top';

  for (let i = 0; i < lines.length; i++) {
    const y = padding + i * lineHeight;
    ctx.fillText(lines[i], padding, y);
  }

  // Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/**
 * Export as vector SVG
 */
export function downloadAsSvg(
  lines: string[],
  filename = 'dithered-art.svg',
  options: ExportPngOptions = {}
): void {
  if (!lines || lines.length === 0) return;

  const fontSize = options.fontSize || 12;
  const lineHeight = (options.lineHeight || 1.15) * fontSize;
  const padding = options.padding || 20;
  const bgColor = options.bgColor || '#050c05';
  const textColor = options.textColor || '#22c55e';
  const charWidth = fontSize * 0.6;

  const maxLen = Math.max(...lines.map((l) => l.length));
  const width = Math.ceil(maxLen * charWidth + padding * 2);
  const height = Math.ceil(lines.length * lineHeight + padding * 2);

  const escapedLines = lines
    .map((line, idx) => {
      const y = padding + (idx + 1) * lineHeight;
      const safeText = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<text x="${padding}" y="${y}">${safeText}</text>`;
    })
    .join('\n');

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <g fill="${textColor}" font-family="monospace" font-size="${fontSize}px" xml:space="preserve">
${escapedLines}
  </g>
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
