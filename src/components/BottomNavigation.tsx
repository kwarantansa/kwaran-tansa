import React, { useState } from 'react';
import { 
  BarChart3, 
  Building2, 
  Users, 
  Award, 
  CreditCard, 
  FolderArchive, 
  FileCheck, 
  QrCode, 
  Sparkles, 
  Globe, 
  Lock, 
  LogOut, 
  Settings, 
  Download, 
  X, 
  ChevronUp, 
  Home, 
  Search, 
  BookOpen, 
  Phone, 
  Layers,
  ShieldCheck,
  UserCheck,
  Palette,
  HardDrive
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { AuthUser } from '../types';

interface BottomNavigationProps {
  currentView: 'public' | 'admin';
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenVerifier: () => void;
  onOpenAi: () => void;
  onOpenLogin: () => void;
  onOpenPengurusSettings?: () => void;
  onOpenHeroBgSettings?: () => void;
  onOpenGDriveSettings?: () => void;
  onSwitchToPublic: () => void;
  onSwitchToAdmin: () => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onExportBackup?: () => void;
  memberCount?: number;
  gudepCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentView,
  activeTab,
  setActiveTab,
  onOpenVerifier,
  onOpenAi,
  onOpenLogin,
  onOpenPengurusSettings,
  onOpenHeroBgSettings,
  onOpenGDriveSettings,
  onSwitchToPublic,
  onSwitchToAdmin,
  currentUser,
  onLogout,
  onExportBackup,
  memberCount = 0,
  gudepCount = 0
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Safe ignore
      }
    }
  };

  const handleSelectTab = (tab: ActiveTab) => {
    triggerHaptic();
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
  };

  const handlePublicScroll = (targetId: string) => {
    triggerHaptic();
    setIsMoreMenuOpen(false);
    if (targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. BOTTOM SHEET / DRAWER MENU (WHEN "MENU LAIN" IS TAPPED) */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMoreMenuOpen(false)}
          />

          {/* Sheet Container */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#24140D] border-t border-[#3C2216] rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col transform transition-transform duration-300">
            {/* Grab Handle */}
            <div className="pt-3 pb-1 flex justify-center items-center">
              <div className="w-12 h-1.5 bg-stone-600 rounded-full" />
            </div>

            {/* Sheet Header */}
            <div className="px-5 py-3 border-b border-[#3C2216] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                  ⚜️
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white font-sans tracking-tight">
                    {currentView === 'admin' ? 'Menu Administrasi Kwarran' : 'Layanan Terpadu Tanah Sareal'}
                  </h3>
                  <p className="text-[10px] text-stone-400">
                    {currentView === 'admin' && currentUser 
                      ? `${currentUser.name} (${currentUser.roleTitle})`
                      : 'Akses cepat informasi & administrasi Pramuka'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white bg-[#331B10] hover:bg-[#442416] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Body (Scrollable) */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {currentView === 'admin' ? (
                <>
                  {/* Bagian 1: Modul Administrasi Lanjutan */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
                      Administrasi & Pelaporan
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSelectTab('archives')}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                          activeTab === 'archives'
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                            : 'bg-[#2A160E] border-[#442618] text-stone-200 hover:bg-[#381F14]'
                        }`}
                      >
                        <FolderArchive className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="font-bold text-xs">Arsip Digital</p>
                          <p className="text-[10px] text-stone-400">SK & Surat Edaran</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSelectTab('semester-report')}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                          activeTab === 'semester-report'
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                            : 'bg-[#2A160E] border-[#442618] text-stone-200 hover:bg-[#381F14]'
                        }`}
                      >
                        <FileCheck className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="font-bold text-xs">Laporan Semester</p>
                          <p className="text-[10px] text-stone-400">Evaluasi Ranting</p>
                        </div>
                      </button>

                      {onOpenPengurusSettings && (
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setIsMoreMenuOpen(false);
                            onOpenPengurusSettings();
                          }}
                          className="p-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 text-left flex flex-col justify-between gap-2 transition-all"
                        >
                          <Settings className="w-5 h-5 text-amber-400" />
                          <div>
                            <p className="font-bold text-xs">Kelola Pengurus</p>
                            <p className="text-[10px] text-amber-300/70">Nama & Kontak WA</p>
                          </div>
                        </button>
                      )}

                      {onOpenHeroBgSettings && (
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setIsMoreMenuOpen(false);
                            onOpenHeroBgSettings();
                          }}
                          className="p-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 text-left flex flex-col justify-between gap-2 transition-all"
                        >
                          <Palette className="w-5 h-5 text-amber-400" />
                          <div>
                            <p className="font-bold text-xs">Background & Logo</p>
                            <p className="text-[10px] text-amber-300/70">Kustomisasi Watermark</p>
                          </div>
                        </button>
                      )}

                      {onOpenGDriveSettings && (
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setIsMoreMenuOpen(false);
                            onOpenGDriveSettings();
                          }}
                          className="p-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 text-left flex flex-col justify-between gap-2 transition-all"
                        >
                          <HardDrive className="w-5 h-5 text-emerald-400" />
                          <div>
                            <p className="font-bold text-xs">Pilih Google Drive</p>
                            <p className="text-[10px] text-emerald-300/70">Akun & Folder Arsip</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bagian 2: Fitur Pintar & Verifikasi */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
                      Alat Pintar & Validasi
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          triggerHaptic();
                          setIsMoreMenuOpen(false);
                          onOpenAi();
                        }}
                        className="p-3 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-stone-950 font-bold text-left flex items-center gap-3 shadow-md hover:brightness-110 transition-all"
                      >
                        <Sparkles className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-black leading-tight">Asisten AI</p>
                          <p className="text-[10px] text-stone-900/80 font-medium">Tanya Juknis & Surat</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          triggerHaptic();
                          setIsMoreMenuOpen(false);
                          onOpenVerifier();
                        }}
                        className="p-3 rounded-2xl bg-[#2A160E] border border-[#442618] text-stone-200 hover:bg-[#381F14] text-left flex items-center gap-3 transition-all"
                      >
                        <QrCode className="w-6 h-6 text-amber-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold leading-tight">Pindai QR Code</p>
                          <p className="text-[10px] text-stone-400">Cek Keaslian KTA & NTA</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Bagian 3: Navigasi & Sesi */}
                  <div className="space-y-2 pt-2 border-t border-[#3C2216]">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          triggerHaptic();
                          setIsMoreMenuOpen(false);
                          onSwitchToPublic();
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#2E1910] hover:bg-[#3D2115] text-stone-200 font-semibold flex items-center justify-between border border-[#48281A] transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-amber-400" />
                          <span>Buka Portal Publik Tanah Sareal</span>
                        </span>
                        <span className="text-[10px] text-stone-400">&rarr;</span>
                      </button>

                      {onExportBackup && (
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setIsMoreMenuOpen(false);
                            onExportBackup();
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#2E1910] hover:bg-[#3D2115] text-stone-200 font-semibold flex items-center justify-between border border-[#48281A] transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-amber-400" />
                            <span>Ekspor Backup Basis Data JSON</span>
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono">Backup</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          triggerHaptic();
                          setIsMoreMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-950/60 text-red-300 font-semibold flex items-center justify-center gap-2 border border-red-900/40 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar Dari Mode Pengurus</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* MENU POPUP UNTUK MODE PUBLIK */
                <>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
                      Menu Utama Portal Publik
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handlePublicScroll('layanan-cek')}
                        className="p-3 rounded-2xl bg-[#2A160E] border border-[#442618] text-stone-200 hover:bg-[#381F14] text-left flex flex-col justify-between gap-2"
                      >
                        <Search className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="font-bold text-xs">Pencarian NTA Anggota</p>
                          <p className="text-[10px] text-stone-400">Verifikasi anggota online</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handlePublicScroll('direktori-gudep')}
                        className="p-3 rounded-2xl bg-[#2A160E] border border-[#442618] text-stone-200 hover:bg-[#381F14] text-left flex flex-col justify-between gap-2"
                      >
                        <Building2 className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="font-bold text-xs">Direktori Gudep</p>
                          <p className="text-[10px] text-stone-400">11 Kelurahan Tanah Sareal</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handlePublicScroll('statistik')}
                        className="p-3 rounded-2xl bg-[#2A160E] border border-[#442618] text-stone-200 hover:bg-[#381F14] text-left flex flex-col justify-between gap-2"
                      >
                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="font-bold text-xs">Statistik Potensi</p>
                          <p className="text-[10px] text-stone-400">Data sensus ranting</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handlePublicScroll('unduhan')}
                        className="p-3 rounded-2xl bg-[#2A160E] border border-[#442618] text-stone-200 hover:bg-[#381F14] text-left flex flex-col justify-between gap-2"
                      >
                        <BookOpen className="w-5 h-5 text-rose-400" />
                        <div>
                          <p className="font-bold text-xs">Arsip & Juknis</p>
                          <p className="text-[10px] text-stone-400">Surat edaran & pedoman</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#3C2216]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 font-mono">
                      Akses Pengurus & Bantuan
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          triggerHaptic();
                          setIsMoreMenuOpen(false);
                          onOpenVerifier();
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#2E1910] hover:bg-[#3D2115] text-stone-200 font-semibold flex items-center justify-between border border-[#48281A] transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-amber-400" />
                          <span>Verifikasi QR Code KTA / SK</span>
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">Pindai</span>
                      </button>

                      <button
                        onClick={() => handlePublicScroll('kontak')}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#2E1910] hover:bg-[#3D2115] text-stone-200 font-semibold flex items-center justify-between border border-[#48281A] transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-amber-400" />
                          <span>Hubungi Sekretariat Kwarran</span>
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">WA Resmi</span>
                      </button>

                      {currentUser ? (
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setIsMoreMenuOpen(false);
                            onSwitchToAdmin();
                          }}
                          className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black flex items-center justify-center gap-2 shadow-lg transition-all"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Buka Dashboard Pengurus ({currentUser.roleTitle.split('/')[0]})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            triggerHaptic();
                            setIsMoreMenuOpen(false);
                            onOpenLogin();
                          }}
                          className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black flex items-center justify-center gap-2 shadow-lg transition-all"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Masuk Akun Pengurus Kwarran</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sheet Safe Bottom Padding */}
            <div className="h-4" />
          </div>
        </div>
      )}

      {/* 2. THE STICKY BOTTOM DASHBOARD BAR (ALWAYS VISIBLE ON MOBILE) */}
      <nav 
        aria-label="Navigasi Menu Dashboard Bawah"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#1A0C06]/95 backdrop-blur-xl border-t border-[#3C2216]/90 shadow-[0_-8px_32px_rgba(0,0,0,0.4)] px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
      >
        <div className="max-w-md mx-auto flex items-center justify-around gap-1">
          {currentView === 'admin' ? (
            /* BUTTONS FOR ADMIN PENGURUS */
            <>
              {/* Tab 1: Dashboard */}
              <button
                type="button"
                onClick={() => handleSelectTab('dashboard')}
                className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                  activeTab === 'dashboard'
                    ? 'text-amber-400 font-black'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors relative ${
                  activeTab === 'dashboard' ? 'bg-amber-500/20 text-amber-300' : ''
                }`}>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Dashboard</span>
                {activeTab === 'dashboard' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
                )}
              </button>

              {/* Tab 2: Gudep */}
              <button
                type="button"
                onClick={() => handleSelectTab('gudep')}
                className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                  activeTab === 'gudep'
                    ? 'text-amber-400 font-black'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors relative ${
                  activeTab === 'gudep' ? 'bg-amber-500/20 text-amber-300' : ''
                }`}>
                  <Building2 className="w-5 h-5" />
                  {gudepCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-[#341B10] text-stone-300 text-[8.5px] px-1 rounded-full font-mono border border-[#4E2818]">
                      {gudepCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Gudep</span>
                {activeTab === 'gudep' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
                )}
              </button>

              {/* Tab 3: Anggota */}
              <button
                type="button"
                onClick={() => handleSelectTab('members')}
                className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                  activeTab === 'members'
                    ? 'text-amber-400 font-black'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors relative ${
                  activeTab === 'members' ? 'bg-amber-500/20 text-amber-300' : ''
                }`}>
                  <Users className="w-5 h-5" />
                  {memberCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-amber-500 text-stone-950 font-black text-[8.5px] px-1 rounded-full">
                      {memberCount > 99 ? '99+' : memberCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Anggota</span>
                {activeTab === 'members' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
                )}
              </button>

              {/* Tab 4: KTA Kolektif */}
              <button
                type="button"
                onClick={() => handleSelectTab('collective-kta')}
                className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                  activeTab === 'collective-kta'
                    ? 'text-amber-400 font-black'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors relative ${
                  activeTab === 'collective-kta' ? 'bg-amber-500/20 text-amber-300' : ''
                }`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">KTA</span>
                {activeTab === 'collective-kta' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
                )}
              </button>

              {/* Tab 5: Menu Lainnya (Drawer Launcher) */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setIsMoreMenuOpen(true);
                }}
                className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                  isMoreMenuOpen || ['archives', 'semester-report'].includes(activeTab)
                    ? 'text-amber-400 font-black'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${
                  isMoreMenuOpen || ['archives', 'semester-report'].includes(activeTab)
                    ? 'bg-amber-500/20 text-amber-300'
                    : ''
                }`}>
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Menu</span>
                {['archives', 'semester-report'].includes(activeTab) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
                )}
              </button>
            </>
          ) : (
            /* BUTTONS FOR PUBLIC PORTAL */
            <>
              {/* Tab 1: Beranda */}
              <button
                type="button"
                onClick={() => handlePublicScroll('top')}
                className="flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center text-amber-400 hover:text-amber-300 transition-all active:scale-95"
              >
                <div className="p-1 rounded-xl bg-amber-500/20 text-amber-300">
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-tight mt-0.5 whitespace-nowrap">Beranda</span>
              </button>

              {/* Tab 2: Cek NTA */}
              <button
                type="button"
                onClick={() => handlePublicScroll('layanan-cek')}
                className="flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:text-amber-300 transition-all active:scale-95"
              >
                <div className="p-1 rounded-xl">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap">Cek NTA</span>
              </button>

              {/* Tab 3: Direktori Gudep */}
              <button
                type="button"
                onClick={() => handlePublicScroll('direktori-gudep')}
                className="flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:text-amber-300 transition-all active:scale-95"
              >
                <div className="p-1 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap">Gudep</span>
              </button>

              {/* Tab 4: Arsip & Edaran */}
              <button
                type="button"
                onClick={() => handlePublicScroll('unduhan')}
                className="flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:text-amber-300 transition-all active:scale-95"
              >
                <div className="p-1 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap">Arsip</span>
              </button>

              {/* Tab 5: Menu / Masuk Pengurus */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setIsMoreMenuOpen(true);
                }}
                className="flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center text-amber-400 hover:text-amber-300 transition-all active:scale-95"
              >
                <div className="p-1 rounded-xl bg-amber-600/25 text-amber-300 border border-amber-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-tight mt-0.5 whitespace-nowrap">Layanan</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};
