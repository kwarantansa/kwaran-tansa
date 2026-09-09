import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  Eye, 
  RotateCcw, 
  Save, 
  Sliders, 
  Check, 
  CheckCircle2, 
  Layers, 
  MoveVertical,
  Sun,
  Palette,
  Shield,
  Maximize2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { HeroBackgroundConfig, DEFAULT_HERO_BACKGROUND } from '../types';
import { compressImageFile, normalizeImageUrl, checkImageUrlCanLoad } from '../utils/imageCompressor';

interface HeroBackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeroBackgroundConfig;
  onSave: (newConfig: HeroBackgroundConfig) => void;
  onLivePreview?: (previewConfig: HeroBackgroundConfig) => void;
}

// Preset Logos for Gerakan Pramuka Kwarran Tanah Sareal
export const PRESET_HERO_LOGOS = [
  {
    id: 'kwarran-ts-official',
    title: 'Logo Resmi Kwarran 0917-06 Tanah Sareal',
    subtitle: 'Emblem Kwartir Ranting 0917-06 Tanah Sareal Kota Bogor',
    url: '/logo-kwarran-tanah-sareal.png',
    tag: 'Rekomendasi Utama'
  },
  {
    id: 'tunas-kelapa-emas',
    title: 'Lambang Tunas Kelapa Emas',
    subtitle: 'Simbol Gerakan Pramuka Republik Indonesia',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    svgType: 'tunas-gold',
    tag: 'Klasik Emas'
  },
  {
    id: 'wosm-world-scout',
    title: 'Lambang WOSM Pramuka Dunia',
    subtitle: 'World Organization of the Scout Movement (Fleur-de-lis)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Emblem_of_the_World_Organization_of_the_Scout_Movement.svg/512px-Emblem_of_the_World_Organization_of_the_Scout_Movement.svg.png',
    tag: 'Internasional'
  },
  {
    id: 'silhouette-modern',
    title: 'Siluet Tunas Kelapa Grafis',
    subtitle: 'Gaya modern minimalis garis ganda',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    svgType: 'scout-silhouette',
    tag: 'Minimalis'
  }
];

export const HeroBackgroundSettingsModal: React.FC<HeroBackgroundSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onLivePreview
}) => {
  const [currentConfig, setCurrentConfig] = useState<HeroBackgroundConfig>(config);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when opened with external config
  React.useEffect(() => {
    setCurrentConfig(config);
    setIsSavedNotice(false);
    setUploadError(null);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const updateField = <K extends keyof HeroBackgroundConfig>(field: K, value: HeroBackgroundConfig[K]) => {
    const updated = { ...currentConfig, [field]: value };
    setCurrentConfig(updated);
    if (onLivePreview) {
      onLivePreview(updated);
    }
  };

  // Handle local file upload with auto-compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Mohon pilih file gambar yang valid (PNG, JPG, WEBP, atau SVG).');
      return;
    }

    try {
      setIsProcessingImage(true);
      // Automatically resize and optimize so it saves cleanly to Cloud Firestore and localStorage
      const optimizedDataUrl = await compressImageFile(file, 512, 512, 0.88);
      updateField('logoUrl', optimizedDataUrl);
      updateField('logoTitle', file.name.replace(/\.[^/.]+$/, ''));
      setIsSavedNotice(false);
    } catch (err: any) {
      console.error('Error optimizing image:', err);
      setUploadError(err.message || 'Gagal memproses file logo gambar.');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  const handleApplyCustomUrl = async () => {
    const raw = customUrlInput.trim();
    if (!raw) return;
    setUploadError(null);
    setIsProcessingImage(true);

    try {
      const normalized = normalizeImageUrl(raw);
      const testResult = await checkImageUrlCanLoad(normalized);
      if (!testResult.ok) {
        setUploadError(testResult.reason || 'Tautan gambar tidak dapat dimuat oleh browser.');
        return;
      }

      updateField('logoUrl', normalized);
      updateField('logoTitle', normalized.startsWith('/logo-kwarran') ? 'Logo Resmi Kwarran 0917-06' : 'Logo Kustom URL');
      setCustomUrlInput('');
    } catch (err: any) {
      setUploadError(err.message || 'Gagal memproses URL logo.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleResetToDefault = () => {
    setCurrentConfig(DEFAULT_HERO_BACKGROUND);
    if (onLivePreview) {
      onLivePreview(DEFAULT_HERO_BACKGROUND);
    }
  };

  const handleSaveAndClose = async () => {
    let finalConfig = { ...currentConfig };
    if (customUrlInput.trim()) {
      const normalized = normalizeImageUrl(customUrlInput.trim());
      finalConfig = {
        ...finalConfig,
        logoUrl: normalized,
        logoTitle: normalized.startsWith('/logo-kwarran') ? 'Logo Resmi Kwarran 0917-06' : 'Logo Kustom URL'
      };
      setCurrentConfig(finalConfig);
    }
    onSave(finalConfig);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#201109] border border-amber-500/40 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden my-auto">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#2A160E] via-[#331B10] to-[#2A160E] border-b border-[#442618] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Pengaturan Background & Logo Watermark Hero
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  Live Preview
                </span>
              </h3>
              <p className="text-xs text-stone-300">
                Atur logo Kwarran Tanah Sareal di belakang judul utama, transparansi, dan dimensi ukuran
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#243632] transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto custom-scrollbar">

          {/* 1. LIVE MINI PREVIEW CARD */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-[#111A18] p-6 shadow-inner text-center">
            <div className="absolute top-2 right-3 text-[10px] text-stone-400 font-mono flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-400" />
              <span>Simulasi Tampilan Teks & Background</span>
            </div>

            {/* Simulated Watermark in Mini Preview */}
            {currentConfig.enabled && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden transition-all duration-300"
                style={{
                  transform: `translateY(${currentConfig.offsetY * 0.4}px) rotate(${currentConfig.rotation}deg)`
                }}
              >
                {currentConfig.glow && (
                  <div 
                    className="absolute rounded-full blur-2xl opacity-40 bg-amber-500/30 transition-all pointer-events-none"
                    style={{
                      width: `${Math.min(300, currentConfig.size * 0.6)}px`,
                      height: `${Math.min(300, currentConfig.size * 0.6)}px`
                    }}
                  />
                )}
                <img
                  src={currentConfig.logoUrl}
                  alt="Watermark Preview"
                  className={`object-contain transition-all duration-200 ${currentConfig.animateFloat ? 'animate-pulse' : ''}`}
                  style={{
                    width: `${Math.min(320, currentConfig.size * 0.55)}px`,
                    height: `${Math.min(320, currentConfig.size * 0.55)}px`,
                    opacity: currentConfig.opacity,
                    filter: `${currentConfig.grayscale ? 'grayscale(100%)' : 'none'} ${currentConfig.blur > 0 ? `blur(${currentConfig.blur * 0.5}px)` : ''}`,
                    mixBlendMode: currentConfig.blendMode
                  }}
                  onError={(e) => {
                    // Fallback to default if error
                    (e.target as HTMLImageElement).src = '/logo-kwarran-tanah-sareal.png';
                  }}
                />
              </div>
            )}

            {/* Simulated Foreground Text */}
            <div className="relative z-10 max-w-lg mx-auto py-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C2C28]/90 border border-amber-500/30 text-amber-300 text-[11px] font-medium mb-3">
                <span>⚜️</span>
                <span>Satu Data Pramuka Terpadu • Kwarran Tanah Sareal</span>
              </div>
              <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                Portal Layanan & Database Keanggotaan Pramuka <span className="text-amber-400">Tanah Sareal</span>
              </h4>
              <p className="mt-2 text-xs text-stone-300 line-clamp-2">
                Digitalisasi administrasi kepramukaan, validasi NTA/KTA, pencatatan pembina mahir, dan akreditasi pangkalan.
              </p>
            </div>
          </div>

          {/* 2. TOGGLE ENABLE / DISABLE */}
          <div className="flex items-center justify-between p-3.5 bg-[#182623] border border-[#2B3E39] rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentConfig.enabled ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-500'}`}>
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  Tampilkan Watermark Logo di Background Hero
                </p>
                <p className="text-[11px] text-stone-400">
                  {currentConfig.enabled ? 'Aktif - Logo muncul di balik teks utama' : 'Nonaktif - Background hanya gradien polos'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentConfig.enabled}
                onChange={(e) => updateField('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* 3. TRANSPARANSI / OPACITY SLIDER */}
          <div className="p-4 bg-[#182623] border border-[#2B3E39] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-stone-200 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Transparansi (Opacity Watermark)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-300 px-2 py-0.5 bg-amber-500/20 rounded border border-amber-500/30">
                  {Math.round(currentConfig.opacity * 100)}%
                </span>
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="80"
              step="1"
              value={Math.round(currentConfig.opacity * 100)}
              onChange={(e) => updateField('opacity', Number(e.target.value) / 100)}
              className="w-full h-2 bg-[#263834] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            {/* Quick preset buttons for opacity */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-stone-400">Pilihan Cepat:</span>
              {[
                { label: 'Sangat Samar (10%)', val: 0.10 },
                { label: 'Standar Ideal (22%)', val: 0.22 },
                { label: 'Tegas (35%)', val: 0.35 },
                { label: 'Kontras Tinggi (50%)', val: 0.50 }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => updateField('opacity', item.val)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                    Math.abs(currentConfig.opacity - item.val) < 0.04
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-[#22332F] text-stone-300 border-[#2D423D] hover:border-amber-500/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. UKURAN / DIMENSI LOGO SLIDER */}
          <div className="p-4 bg-[#182623] border border-[#2B3E39] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-stone-200 flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span>Ukuran Dimensi Logo</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-300 px-2 py-0.5 bg-amber-500/20 rounded border border-amber-500/30">
                  {currentConfig.size} px
                </span>
              </div>
            </div>

            <input
              type="range"
              min="180"
              max="850"
              step="10"
              value={currentConfig.size}
              onChange={(e) => updateField('size', Number(e.target.value))}
              className="w-full h-2 bg-[#263834] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            {/* Quick preset buttons for size */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] text-stone-400">Pilihan Cepat:</span>
              {[
                { label: 'Kompak (280px)', val: 280 },
                { label: 'Sedang (440px)', val: 440 },
                { label: 'Besar (580px)', val: 580 },
                { label: 'Ekstra Lebar (720px)', val: 720 }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => updateField('size', item.val)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                    Math.abs(currentConfig.size - item.val) < 30
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-[#22332F] text-stone-300 border-[#2D423D] hover:border-amber-500/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. GANTI LOGO (PRESETS, UPLOAD, DAN URL) */}
          <div className="p-4 bg-[#182623] border border-[#2B3E39] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-stone-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Pilihan Logo Kwarran & Pramuka</span>
              </label>
              <span className="text-[11px] text-amber-400/90 font-medium">
                {currentConfig.logoTitle || 'Logo Terpilih'}
              </span>
            </div>

            {/* Preset Logos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_HERO_LOGOS.map((preset) => {
                const isSelected = currentConfig.logoUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      updateField('logoUrl', preset.url);
                      updateField('logoTitle', preset.title);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected 
                        ? 'bg-[#233531] border-amber-400 shadow-md ring-1 ring-amber-400/50' 
                        : 'bg-[#15201E] border-[#293B37] hover:border-amber-500/40 hover:bg-[#1D2C28]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#0F1715] p-1 border border-stone-700/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img 
                        src={preset.url} 
                        alt={preset.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo-kwarran-tanah-sareal.png';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white truncate">
                          {preset.title}
                        </p>
                        {isSelected && (
                          <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 truncate">
                        {preset.subtitle}
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {preset.tag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Upload Logo File & Input URL Options */}
            <div className="pt-2 space-y-2">
              {uploadError && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* File Upload Button */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isProcessingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-3 rounded-xl bg-[#202F2B] hover:bg-[#283C37] border border-[#314842] text-xs font-semibold text-stone-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isProcessingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                        <span>Mengompresi & Memproses Logo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>Upload Logo dari HP / Komputer</span>
                      </>
                    )}
                  </button>
                  <p className="mt-1 text-[10px] text-stone-400 text-center">
                    Format: PNG Transparan, JPG, SVG (Otomatis dikompresi)
                  </p>
                </div>

                {/* URL Input */}
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://...link-gambar.png atau Google Drive"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCustomUrl();
                        }
                      }}
                      className="flex-1 bg-[#131D1B] border border-[#2B3E39] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      disabled={isProcessingImage}
                      onClick={handleApplyCustomUrl}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {isProcessingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : null}
                      <span>Terapkan</span>
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-400 flex-wrap gap-1">
                    <span>Mendukung link Google Drive, Dropbox, atau direct link (.png/.jpg)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomUrlInput('/logo-kwarran-tanah-sareal.png');
                      }}
                      className="text-amber-400 hover:underline font-mono"
                    >
                      Pakai link lokal: /logo-kwarran-tanah-sareal.png
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. ADVANCED TUNING (POSISI Y, BLUR, GLOW, BLEND MODE, ROTASI) */}
          <div className="p-4 bg-[#182623] border border-[#2B3E39] rounded-xl space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-stone-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Penyempurnaan Posisi & Efek Visual</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Offset Y (Posisi Naik / Turun) */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <MoveVertical className="w-3.5 h-3.5 text-stone-400" />
                    Posisi Vertikal (Y-Offset)
                  </span>
                  <span className="font-mono text-amber-300 text-[11px]">
                    {currentConfig.offsetY > 0 ? `+${currentConfig.offsetY}px` : `${currentConfig.offsetY}px`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="5"
                  value={currentConfig.offsetY}
                  onChange={(e) => updateField('offsetY', Number(e.target.value))}
                  className="w-full h-1.5 bg-[#263834] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[9px] text-stone-400 mt-1">
                  <span>Lebih Tinggi (-80px)</span>
                  <span>Tengah (0)</span>
                  <span>Lebih Rendah (+80px)</span>
                </div>
              </div>

              {/* Rotasi Sudut */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-stone-300">Kemiringan / Rotasi</span>
                  <span className="font-mono text-amber-300 text-[11px]">
                    {currentConfig.rotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={currentConfig.rotation}
                  onChange={(e) => updateField('rotation', Number(e.target.value))}
                  className="w-full h-1.5 bg-[#263834] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[9px] text-stone-400 mt-1">
                  <span>-30° Kiri</span>
                  <span>Tegak (0°)</span>
                  <span>+30° Kanan</span>
                </div>
              </div>

              {/* Efek Blur */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-stone-300">Efek Kelembutan / Blur</span>
                  <span className="font-mono text-amber-300 text-[11px]">
                    {currentConfig.blur} px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={currentConfig.blur}
                  onChange={(e) => updateField('blur', Number(e.target.value))}
                  className="w-full h-1.5 bg-[#263834] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[9px] text-stone-400 mt-1">
                  <span>Tajam (0px)</span>
                  <span>Medium (4px)</span>
                  <span>Sangat Lembut (8px)</span>
                </div>
              </div>

              {/* Mode Pencampuran / Blend Mode */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-stone-300">Mode Pencampuran Warna</span>
                  <span className="font-mono text-amber-300 text-[11px] capitalize">
                    {currentConfig.blendMode}
                  </span>
                </div>
                <select
                  value={currentConfig.blendMode}
                  onChange={(e) => updateField('blendMode', e.target.value as HeroBackgroundConfig['blendMode'])}
                  className="w-full bg-[#131D1B] border border-[#2B3E39] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="screen">Screen (Paling Bersih di Background Gelap)</option>
                  <option value="normal">Normal (Sesuai Gambar Asli)</option>
                  <option value="soft-light">Soft Light (Penyatuan Lembut)</option>
                  <option value="overlay">Overlay (Kontras Tajam)</option>
                  <option value="luminosity">Luminosity (Monokromatik Terang)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes for effects */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#2A160E] border border-[#442618] cursor-pointer hover:border-amber-500/30">
                <input
                  type="checkbox"
                  checked={currentConfig.glow}
                  onChange={(e) => updateField('glow', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 bg-stone-900 border-stone-700"
                />
                <span className="text-xs text-stone-300">Aura Bercahaya Emas</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#2A160E] border border-[#442618] cursor-pointer hover:border-amber-500/30">
                <input
                  type="checkbox"
                  checked={currentConfig.animateFloat}
                  onChange={(e) => updateField('animateFloat', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 bg-stone-900 border-stone-700"
                />
                <span className="text-xs text-stone-300">Animasi Bernapas Halus</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#2A160E] border border-[#442618] cursor-pointer hover:border-amber-500/30">
                <input
                  type="checkbox"
                  checked={currentConfig.grayscale}
                  onChange={(e) => updateField('grayscale', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 bg-stone-900 border-stone-700"
                />
                <span className="text-xs text-stone-300">Mode Monokrom (B&W)</span>
              </label>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-[#101917] border-t border-[#233430] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#1C2C28] text-xs font-semibold transition-colors border border-transparent hover:border-stone-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar Kwarran</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1C2C28] hover:bg-[#253934] text-stone-300 text-xs font-semibold transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSavedNotice ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-stone-950" />
                  <span>Simpan & Terapkan Background</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
