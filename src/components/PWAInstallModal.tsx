import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Share, 
  CheckCircle2, 
  X, 
  QrCode as QrIcon, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  PlusSquare, 
  MoreVertical,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoUrl?: string;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  logoUrl = './logo-kwarran-tanah-sareal.png'
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeDeviceTab, setActiveDeviceTab] = useState<'android' | 'ios' | 'qrcode'>('android');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Set default tab based on user's device
  useEffect(() => {
    if (isIOS) {
      setActiveDeviceTab('ios');
    } else {
      setActiveDeviceTab('android');
    }
  }, [isIOS]);

  // Generate QR Code for scanning from desktop
  useEffect(() => {
    if (isOpen) {
      const currentUrl = window.location.href;
      QRCode.toDataURL(currentUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: '#180E09',
          light: '#FFFFFF',
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.warn('QR Code generation error:', err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    setIsInstalling(true);
    const success = await install();
    setIsInstalling(false);
    if (success) {
      onClose();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#20110A] text-stone-100 rounded-3xl border border-[#442314] shadow-2xl overflow-hidden my-auto">
        {/* Top Accent Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 w-full" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-4 border-b border-[#351B0F] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* App Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#140A05] flex items-center justify-center overflow-hidden p-1">
                <img
                  src={logoUrl}
                  alt="Icon SISKA-SIKAP"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = './logo-kwarran-tanah-sareal.png';
                  }}
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Instal di Handphone
                </h3>
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                  PWA APP
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate">
                SISKA-SIKAP • Kwarran Tanah Sareal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#341B10] transition-colors flex-shrink-0"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Direct One-Click Install Banner (if browser supports beforeinstallprompt) */}
          {isInstallable && !isInstalled && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-700/30 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5 min-w-0 text-center sm:text-left">
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Browser Anda Mendukung Instal Otomatis!</p>
                  <p className="text-[11px] text-amber-200/90">Klik tombol di samping untuk langsung menambahkan aplikasi ke HP.</p>
                </div>
              </div>

              <button
                onClick={handleNativeInstall}
                disabled={isInstalling}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 flex-shrink-0 border border-amber-300"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalling ? 'Memproses...' : '📲 Instal Sekarang'}</span>
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Aplikasi telah berhasil terpasang di perangkat Anda (Mode Standalone).</span>
            </div>
          )}

          {/* Advantages Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#28150D] border border-[#3E2215]">
              <Smartphone className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-white">Tanpa Browser</p>
              <p className="text-[9.5px] text-stone-400 leading-tight">Langsung buka dari layar utama</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#28150D] border border-[#3E2215]">
              <Layers className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-white">Layar Penuh</p>
              <p className="text-[9.5px] text-stone-400 leading-tight">Pengalaman layaknya aplikasi asli</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#28150D] border border-[#3E2215]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-white">Ringan & Aman</p>
              <p className="text-[9.5px] text-stone-400 leading-tight">Tidak membebani memori HP</p>
            </div>
          </div>

          {/* Device Tabs */}
          <div>
            <div className="flex items-center gap-1.5 p-1 bg-[#180D07] rounded-xl border border-[#351B0F]">
              <button
                type="button"
                onClick={() => setActiveDeviceTab('android')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeDeviceTab === 'android'
                    ? 'bg-amber-600 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android (Chrome)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDeviceTab('ios')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeDeviceTab === 'ios'
                    ? 'bg-amber-600 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Share className="w-3.5 h-3.5" />
                <span>iPhone / iPad (Safari)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDeviceTab('qrcode')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeDeviceTab === 'qrcode'
                    ? 'bg-amber-600 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <QrIcon className="w-3.5 h-3.5" />
                <span>Scan QR HP</span>
              </button>
            </div>

            {/* Tab 1: Android Guide */}
            {activeDeviceTab === 'android' && (
              <div className="mt-3 p-4 rounded-2xl bg-[#160B06] border border-[#351B0F] space-y-3">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>Petunjuk Instal di HP Android (Chrome / Samsung / Edge):</span>
                </p>

                <ol className="space-y-2.5 text-xs text-stone-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/30">
                      1
                    </span>
                    <span>
                      {isInstallable ? (
                        <>Klik tombol <strong>"📲 Instal Sekarang"</strong> di atas.</>
                      ) : (
                        <>Ketuk ikon menu titik tiga <strong className="text-amber-300 inline-flex items-center"><MoreVertical className="w-3 h-3 inline" /> (⋮)</strong> di pojok kanan atas browser Google Chrome Anda.</>
                      )}
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/30">
                      2
                    </span>
                    <span>
                      Pilih menu <strong className="text-amber-300">"Tambahkan ke Layar Utama"</strong> atau <strong className="text-amber-300">"Instal Aplikasi"</strong>.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/30">
                      3
                    </span>
                    <span>
                      Tekan tombol <strong>"Instal"</strong> atau <strong>"Tambah"</strong> saat muncul kotak konfirmasi.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/30">
                      4
                    </span>
                    <span className="text-emerald-300">
                      Ikon <strong>SISKA-SIKAP</strong> akan otomatis terpasang di layar utama HP Anda dan siap dibuka kapan saja!
                    </span>
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 2: iOS Safari Guide */}
            {activeDeviceTab === 'ios' && (
              <div className="mt-3 p-4 rounded-2xl bg-[#160B06] border border-[#351B0F] space-y-3">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>Petunjuk Instal di iPhone / iPad (Safari):</span>
                </p>

                <ol className="space-y-2.5 text-xs text-stone-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/30">
                      1
                    </span>
                    <span>
                      Pastikan Anda membuka website ini melalui browser resmi <strong>Safari</strong> di iPhone Anda.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/30">
                      2
                    </span>
                    <span>
                      Ketuk tombol <strong>Bagikan (Share)</strong> dengan ikon <strong className="text-amber-300 inline-flex items-center"><Share className="w-3 h-3 inline" /></strong> di bagian bilah bawah Safari.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/30">
                      3
                    </span>
                    <span>
                      Gulir ke bawah dan ketuk opsi <strong className="text-amber-300 inline-flex items-center gap-1"><PlusSquare className="w-3 h-3 inline" /> "Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/30">
                      4
                    </span>
                    <span className="text-emerald-300">
                      Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas. Aplikasi langsung muncul di home screen iPhone Anda!
                    </span>
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 3: QR Code Guide for Desktop users wanting to install on Mobile */}
            {activeDeviceTab === 'qrcode' && (
              <div className="mt-3 p-4 rounded-2xl bg-[#160B06] border border-[#351B0F] text-center space-y-3">
                <p className="text-xs font-bold text-amber-300">
                  Scan QR Code Menggunakan Kamera HP Anda:
                </p>

                {qrDataUrl ? (
                  <div className="inline-block p-3 rounded-2xl bg-white shadow-xl">
                    <img
                      src={qrDataUrl}
                      alt="Scan QR Code untuk Buka di HP"
                      className="w-40 h-40 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 mx-auto bg-stone-800 rounded-xl flex items-center justify-center text-xs text-stone-500">
                    Memuat QR Code...
                  </div>
                )}

                <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                  Arahkan kamera HP ke kode QR di atas untuk membuka aplikasi secara otomatis di handphone Anda, lalu pilih Instal Aplikasi.
                </p>

                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2B170F] hover:bg-[#3D1E11] text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Tautan Berhasil Disalin!' : 'Salin Tautan Web'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 pt-3 bg-[#180E09] border-t border-[#351B0F] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#2A150D] hover:bg-[#3B1F13] text-stone-300 text-xs font-bold rounded-xl transition-colors text-center border border-[#442314]"
          >
            Tutup
          </button>

          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={handleNativeInstall}
              disabled={isInstalling}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 border border-amber-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instal Sekarang</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
