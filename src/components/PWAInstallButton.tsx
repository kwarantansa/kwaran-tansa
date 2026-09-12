import React, { useState } from 'react';
import { Smartphone, Download, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'hero' | 'floating' | 'card';
  logoUrl?: string;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  logoUrl = '/logo-kwarran-tanah-sareal.png',
  className = ''
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running in standalone mode (already installed), don't show the prompt
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      // Prompt native install directly
      const success = await install();
      if (!success) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-black rounded-xl shadow-md border border-amber-300 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex-shrink-0 animate-pulse-subtle ${className}`}
          title="Instal Aplikasi SISKA-SIKAP di Handphone tanpa buka browser"
        >
          <Smartphone className="w-3.5 h-3.5 flex-shrink-0 text-stone-950" />
          <span className="hidden sm:inline">Instal di HP</span>
          <span className="sm:hidden">Instal</span>
        </button>
      )}

      {variant === 'hero' && (
        <button
          onClick={handleClick}
          className={`px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl border border-amber-200 transition-all hover:scale-[1.02] active:scale-[0.98] ring-2 ring-amber-500/20 ${className}`}
          title="Instal Aplikasi SISKA-SIKAP di Layar Utama Handphone"
        >
          <Smartphone className="w-4 h-4 text-stone-950" />
          <span>📲 Instal di Handphone</span>
          <span className="bg-stone-950/15 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">PWA</span>
        </button>
      )}

      {variant === 'floating' && (
        <div className="fixed bottom-4 right-4 z-40 lg:hidden animate-bounce-subtle">
          <button
            onClick={handleClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-black text-xs rounded-full shadow-2xl border-2 border-amber-300 active:scale-95 transition-all"
          >
            <Smartphone className="w-4 h-4 text-stone-950" />
            <span>Instal Aplikasi di HP</span>
          </button>
        </div>
      )}

      {variant === 'card' && (
        <div className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#2D160C] via-[#241108] to-[#1A0C06] border-2 border-amber-500/40 shadow-2xl relative overflow-hidden ${className}`}>
          {/* Subtle glow circle */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left relative z-10">
            {/* App Icon preview */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-xl flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#140A05] flex items-center justify-center overflow-hidden p-1">
                <img
                  src={logoUrl}
                  alt="Logo Kwarran Tanah Sareal"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo-kwarran-tanah-sareal.png';
                  }}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  FITUR PWA RESMI
                </span>
                <span className="text-[11px] text-stone-400">Android & iOS</span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white">
                Pasang SISKA-SIKAP di Handphone Anda
              </h3>

              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed max-w-xl">
                Buka aplikasi langsung dari layar utama HP dalam satu ketukan tanpa harus membuka browser atau mengetik alamat web. Lebih cepat, hemat kuota, dan tampilan layar penuh.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <button
                  onClick={handleClick}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg border border-amber-300 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 text-stone-950" />
                  <span>📲 Instal Aplikasi Sekarang</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-3.5 py-2.5 bg-[#3B1F13] hover:bg-[#4D2819] text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-colors"
                >
                  Lihat Cara Pasang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructional / QR Install Modal */}
      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        logoUrl={logoUrl}
      />
    </>
  );
};
