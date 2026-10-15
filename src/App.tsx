import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DitherConfig,
  DitherResult,
  ThemeMode,
  FontFamily,
  SampleImage,
} from './types';
import { Header } from './components/Header';
import { ImageControls } from './components/ImageControls';
import { AsciiViewer } from './components/AsciiViewer';
import { StatsBar } from './components/StatsBar';
import { ExportModal } from './components/ExportModal';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import { ditherImage, calculateAspectRatioDimensions } from './utils/dither';
import { downloadTxtFile, copyTextToClipboard } from './utils/export';

const DEFAULT_CONFIG: DitherConfig = {
  width: 90,
  height: 45,
  maintainAspectRatio: true,
  charAspectRatio: 0.5,
  algorithm: 'floyd-steinberg',
  charSetMode: '1bit-digits',
  oneDigit: '1',
  zeroDigit: '0',
  customChars: ' .123456789',
  serpentine: true,
  ditherStrength: 1.0,
  adjustments: {
    brightness: 0,
    contrast: 0,
    gamma: 1.0,
    sharpness: 25,
    invert: false,
    thresholdBias: 128,
  },
};

export default function App() {
  const [config, setConfig] = useState<DitherConfig>(DEFAULT_CONFIG);
  const [theme, setTheme] = useState<ThemeMode>('matrix');
  const [fontFamily, setFontFamily] = useState<FontFamily>('jetbrains');
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [currentSampleId, setCurrentSampleId] = useState<string | null>('cyber-skull');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [result, setResult] = useState<DitherResult | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [showControlsMobile, setShowControlsMobile] = useState<boolean>(false);

  // Debounced processing ref to avoid lag while dragging sliders
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to re-render ASCII art
  const processImage = useCallback(
    (img: HTMLImageElement, currentConfig: DitherConfig) => {
      if (!img) return;
      try {
        const res = ditherImage(img, currentConfig);
        setResult(res);
      } catch (err) {
        console.error('Error dithering image:', err);
      }
    },
    []
  );

  // Trigger processing with debouncing for smooth slider interaction
  const triggerProcess = useCallback(
    (img: HTMLImageElement | null, cfg: DitherConfig) => {
      if (!img) return;
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
      renderTimeoutRef.current = setTimeout(() => {
        processImage(img, cfg);
      }, 30);
    },
    [processImage]
  );

  // Initial load: Set initial sample image
  useEffect(() => {
    const defaultSample = SAMPLE_IMAGES[0];
    const img = new Image();
    img.onload = () => {
      setCurrentImage(img);
      setImageSrc(defaultSample.dataUrl);
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      // Calculate initial height based on aspect ratio
      const initialHeight = calculateAspectRatioDimensions(
        img.naturalWidth,
        img.naturalHeight,
        DEFAULT_CONFIG.width,
        DEFAULT_CONFIG.charAspectRatio
      );

      const initialConfig = { ...DEFAULT_CONFIG, height: initialHeight };
      setConfig(initialConfig);
      processImage(img, initialConfig);
    };
    img.src = defaultSample.dataUrl;
  }, [processImage]);

  // Global Clipboard Paste Listener (Ctrl+V anywhere in app)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
              setCurrentImage(img);
              setImageSrc(dataUrl);
              setCurrentSampleId(null);
              setImageDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight,
              });

              let newHeight = config.height;
              if (config.maintainAspectRatio) {
                newHeight = calculateAspectRatioDimensions(
                  img.naturalWidth,
                  img.naturalHeight,
                  config.width,
                  config.charAspectRatio
                );
              }
              const updatedConfig = { ...config, height: newHeight };
              setConfig(updatedConfig);
              processImage(img, updatedConfig);
            };
            img.src = dataUrl;
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [config, processImage]);

  // Handle configuration changes
  const handleChangeConfig = (newConfig: Partial<DitherConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      triggerProcess(currentImage, updated);
      return updated;
    });
  };

  // Handle image loaded via file upload
  const handleImageLoaded = (img: HTMLImageElement) => {
    setCurrentImage(img);
    setImageSrc(img.src);
    setCurrentSampleId(null);
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });

    let newHeight = config.height;
    if (config.maintainAspectRatio) {
      newHeight = calculateAspectRatioDimensions(
        img.naturalWidth,
        img.naturalHeight,
        config.width,
        config.charAspectRatio
      );
    }
    const updatedConfig = { ...config, height: newHeight };
    setConfig(updatedConfig);
    processImage(img, updatedConfig);
  };

  // Handle sample image selected
  const handleSelectSample = (sample: SampleImage) => {
    setCurrentSampleId(sample.id);
    const img = new Image();
    img.onload = () => {
      setCurrentImage(img);
      setImageSrc(sample.dataUrl);
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });

      let newHeight = config.height;
      if (config.maintainAspectRatio) {
        newHeight = calculateAspectRatioDimensions(
          img.naturalWidth,
          img.naturalHeight,
          config.width,
          config.charAspectRatio
        );
      }
      const updatedConfig = { ...config, height: newHeight };
      setConfig(updatedConfig);
      processImage(img, updatedConfig);
    };
    img.src = sample.dataUrl;
  };

  // Quick Action: Download TXT file
  const handleDownloadTxt = () => {
    if (!result) return;
    const filename = `ascii-art-${result.width}x${result.height}`;
    downloadTxtFile(result.text, filename, false);
  };

  // Quick Action: Copy to clipboard
  const handleCopyText = async () => {
    if (!result) return;
    const success = await copyTextToClipboard(result.text);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Reset all to factory defaults
  const handleResetAll = () => {
    setConfig(DEFAULT_CONFIG);
    if (currentImage) {
      processImage(currentImage, DEFAULT_CONFIG);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        onDownloadTxt={handleDownloadTxt}
        onCopyText={handleCopyText}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onResetAll={handleResetAll}
        isCopied={isCopied}
        result={result}
        toggleControlsMobile={() => setShowControlsMobile(!showControlsMobile)}
        showControlsMobile={showControlsMobile}
      />

      {/* Main Workspace: Controls Sidebar + ASCII Viewer */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Sidebar Controls (Responsive drawer on mobile) */}
        <div
          className={`${
            showControlsMobile ? 'flex fixed inset-y-14 left-0 z-40 w-full sm:w-96 shadow-2xl' : 'hidden'
          } lg:flex`}
        >
          <ImageControls
            config={config}
            onChangeConfig={handleChangeConfig}
            onImageLoaded={handleImageLoaded}
            imageDimensions={imageDimensions}
            currentSampleId={currentSampleId}
            onSelectSample={handleSelectSample}
          />
        </div>

        {/* ASCII Viewer Canvas */}
        <AsciiViewer
          result={result}
          originalImageSrc={imageSrc}
          onDownloadTxt={handleDownloadTxt}
          onCopyText={handleCopyText}
          isCopied={isCopied}
          theme={theme}
          onChangeTheme={setTheme}
          fontFamily={fontFamily}
          onChangeFontFamily={setFontFamily}
        />
      </div>

      {/* Bottom Status / Stats Bar */}
      <StatsBar result={result} config={config} />

      {/* Advanced Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={result}
        theme={theme}
        fontFamily={fontFamily}
      />
    </div>
  );
}
