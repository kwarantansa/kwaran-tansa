import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Award, 
  CreditCard, 
  BarChart3, 
  QrCode, 
  Sparkles, 
  RefreshCw, 
  Download, 
  ShieldCheck,
  FolderArchive,
  FileCheck,
  Menu,
  X,
  Globe,
  LogOut,
  UserCheck,
  Lock,
  ChevronDown,
  Settings,
  Palette,
  HardDrive,
  KeyRound
} from 'lucide-react';
import { AuthUser } from '../types';

export type ActiveTab = 'dashboard' | 'gudep' | 'members' | 'collective-kta' | 'archives' | 'semester-report';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenVerifier: () => void;
  onOpenAi: () => void;
  onSyncAll?: () => void;
  isSyncing?: boolean;
  lastSyncTime?: string;
  onExportBackup?: () => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onSwitchToPublic: () => void;
  onOpenLogin: () => void;
  onOpenPengurusSettings?: (section?: 'pengurus' | 'credentials' | 'kontak' | 'background') => void;
  onOpenHeroBgSettings?: () => void;
  onOpenGDriveSettings?: () => void;
  logoUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenVerifier,
  onOpenAi,
  onSyncAll,
  isSyncing = false,
  lastSyncTime = 'Hari ini, 09:30 WIB',
  onExportBackup,
  currentUser,
  onLogout,
  onSwitchToPublic,
  onOpenLogin,
  onOpenPengurusSettings,
  onOpenHeroBgSettings,
  onOpenGDriveSettings,
  logoUrl
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard & Statistik', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'gudep', label: 'Pendataan Gudep', icon: <Building2 className="w-4 h-4" /> },
    { id: 'members', label: 'Buku Induk Anggota (NTA)', icon: <Users className="w-4 h-4" /> },
    { id: 'collective-kta', label: 'KTA Kolektif', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'archives', label: 'Arsip Kwarran', icon: <FolderArchive className="w-4 h-4 text-amber-400" />, badge: 'Cloud' },
    { id: 'semester-report', label: 'Laporan Semester', icon: <FileCheck className="w-4 h-4 text-amber-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#25150E] text-white shadow-md border-b border-[#44271B] print:hidden">
      {/* Top Banner Bar */}
      <div className="bg-[#1A0E08] px-4 sm:px-6 lg:px-8 py-2 text-[11px] border-b border-[#381E13] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-stone-300 font-medium">
          <span className="inline-flex items-center gap-1.5 font-bold tracking-wider text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            PORTAL RESMI KWARTIR RANTING TANAH SAREAL
          </span>
          <span className="text-stone-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-stone-400">Kwartir Cabang Kota Bogor • Kwarda Jawa Barat</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-stone-400 hidden md:inline">
            Pembaruan Sistem: <strong className="text-stone-200 font-mono">{lastSyncTime}</strong>
          </span>

          <button
            onClick={onSwitchToPublic}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#341C12] hover:bg-[#452719] text-stone-200 text-[11px] font-semibold transition-colors border border-[#4F2E1F]"
            title="Lihat halaman portal untuk umum"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Lihat Portal Umum</span>
          </button>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer min-w-0 flex-1" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 p-0.5 shadow-md flex items-center justify-center flex-shrink-0 border border-amber-400/40 overflow-hidden">
              <div className="w-full h-full rounded-[9px] bg-[#1A0E08] flex items-center justify-center text-amber-400 font-bold text-base sm:text-lg overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Kwarran"
                    className="w-full h-full object-contain p-0.5"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = './logo-kwarran-tanah-sareal.png';
                    }}
                  />
                ) : (
                  <span>⚜️</span>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-white font-sans truncate">
                  SISKA<span className="text-amber-400">-SIKAP</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md font-mono flex-shrink-0">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 font-normal truncate max-w-[180px] sm:max-w-none">
                Sistem Informasi Pramuka Tanah Sareal
              </p>
            </div>
          </div>

          {/* Action Tools & User Profile (Right) */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={onOpenVerifier}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-[#341C12] hover:bg-[#452719] text-stone-200 border border-[#4F2E1F] transition-all shadow-sm"
              title="Verifikasi QR Code KTA Pramuka"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Verifikasi QR</span>
            </button>

            <button
              onClick={onOpenAi}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md transition-all border border-amber-400"
            >
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>Asisten AI Kwarran</span>
            </button>

            {onExportBackup && (
              <button
                onClick={onExportBackup}
                className="p-2.5 text-stone-400 hover:text-white rounded-xl hover:bg-[#341C12] transition-colors border border-transparent hover:border-[#4F2E1F]"
                title="Ekspor Backup Basis Data JSON"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Authenticated User Status */}
            {currentUser ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 bg-[#341C12] hover:bg-[#452719] border border-[#4F2E1F] rounded-xl transition-all"
                >
                  <span className="text-base">{currentUser.avatarEmoji || '⚜️'}</span>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white max-w-[130px] truncate leading-tight">
                      {currentUser.name.split(',')[0]}
                    </p>
                    <p className="text-[10px] text-amber-400 leading-tight">
                      {currentUser.roleTitle.split('/')[0]}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Dropdown menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-[#27160F] border border-[#48291B] rounded-2xl shadow-2xl p-2.5 space-y-1.5 z-50 animate-fadeIn"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="p-2.5 bg-[#1C0E08] rounded-xl border border-[#381E13]">
                      <p className="text-xs font-bold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-amber-400 font-medium">{currentUser.jabatan}</p>
                      <p className="text-[10px] text-stone-400 mt-1 font-mono">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={onSwitchToPublic}
                      className="w-full flex items-center gap-2.5 p-2 text-xs font-semibold text-stone-300 hover:text-white hover:bg-[#381F15] rounded-xl transition-colors text-left"
                    >
                      <Globe className="w-4 h-4 text-amber-400" />
                      <span>Buka Halaman Publik</span>
                    </button>

                    <button
                      onClick={onOpenLogin}
                      className="w-full flex items-center gap-2.5 p-2 text-xs font-semibold text-stone-300 hover:text-white hover:bg-[#381F15] rounded-xl transition-colors text-left"
                    >
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>Ganti Akun Pengurus</span>
                    </button>

                    {onOpenPengurusSettings && (
                      <button
                        onClick={() => onOpenPengurusSettings('credentials')}
                        className="w-full flex items-center gap-2.5 p-2 text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-[#233430] rounded-xl transition-colors text-left"
                      >
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        <span>Pengaturan Username & Password</span>
                      </button>
                    )}

                    {onOpenPengurusSettings && (
                      <button
                        onClick={() => onOpenPengurusSettings('pengurus')}
                        className="w-full flex items-center gap-2.5 p-2 text-xs font-semibold text-stone-300 hover:text-white hover:bg-[#233430] rounded-xl transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-stone-400" />
                        <span>Pengaturan Pengurus & Kontak WA</span>
                      </button>
                    )}

                    {onOpenHeroBgSettings && (
                      <button
                        onClick={onOpenHeroBgSettings}
                        className="w-full flex items-center gap-2.5 p-2 text-xs font-semibold text-stone-300 hover:text-white hover:bg-[#233430] rounded-xl transition-colors text-left"
                      >
                        <Palette className="w-4 h-4 text-amber-400" />
                        <span>Pengaturan Background & Logo</span>
                      </button>
                    )}

                    {onOpenGDriveSettings && (
                      <button
                        onClick={onOpenGDriveSettings}
                        className="w-full flex items-center gap-2.5 p-2 text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-[#381F15] rounded-xl transition-colors text-left"
                      >
                        <HardDrive className="w-4 h-4 text-amber-400" />
                        <span>Pilih & Kelola Google Drive</span>
                      </button>
                    )}

                    <div className="pt-1 border-t border-[#381E13]">
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2.5 p-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-amber-600 text-stone-950 hover:bg-amber-500"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk Pengurus</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onSwitchToPublic}
              className="p-2 bg-[#341C12] text-amber-300 rounded-xl text-xs font-semibold border border-[#4F2E1F]"
              title="Lihat Portal Publik"
            >
              <Globe className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAi}
              className="p-2 bg-amber-600 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-300 hover:text-white rounded-xl hover:bg-[#341C12] transition-colors border border-transparent"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Tabs */}
        <nav className="hidden lg:flex space-x-1 border-t border-[#381E13] py-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#422518] text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-stone-300 hover:bg-[#341C12] hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-400/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1A0E08] border-t border-[#381E13] px-4 pt-3 pb-5 space-y-2">
          {currentUser && (
            <div className="p-3 bg-[#28170F] rounded-xl border border-[#48291B] mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{currentUser.name}</p>
                <p className="text-[10px] text-amber-400">{currentUser.jabatan}</p>
              </div>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/40 rounded-lg"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold ${
                activeTab === item.id
                  ? 'bg-[#422518] text-amber-300 border border-amber-500/40'
                  : 'text-stone-300 hover:bg-[#2A170F]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-3 border-t border-[#381E13] flex flex-col gap-2">
            {onOpenPengurusSettings && (
              <>
                <button
                  onClick={() => {
                    onOpenPengurusSettings('credentials');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-semibold bg-[#233430] text-amber-300 rounded-xl flex items-center justify-center gap-2 border border-amber-500/30"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Pengaturan Username & Password</span>
                </button>

                <button
                  onClick={() => {
                    onOpenPengurusSettings('pengurus');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-semibold bg-[#341C12] text-stone-200 rounded-xl flex items-center justify-center gap-2 border border-[#4F2E1F]"
                >
                  <Settings className="w-4 h-4" />
                  <span>Pengaturan Pengurus & Kontak WA</span>
                </button>
              </>
            )}

            {onOpenHeroBgSettings && (
              <button
                onClick={() => {
                  onOpenHeroBgSettings();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-xs font-semibold bg-[#341C12] text-amber-300 rounded-xl flex items-center justify-center gap-2 border border-amber-500/30"
              >
                <Palette className="w-4 h-4" />
                <span>Pengaturan Background & Logo</span>
              </button>
            )}

            {onOpenGDriveSettings && (
              <button
                onClick={() => {
                  onOpenGDriveSettings();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-xs font-semibold bg-[#341C12] text-amber-300 rounded-xl flex items-center justify-center gap-2 border border-amber-500/30"
              >
                <HardDrive className="w-4 h-4" />
                <span>Pilih & Kelola Google Drive</span>
              </button>
            )}

            <button
              onClick={() => {
                onSwitchToPublic();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-xs font-semibold bg-[#341C12] text-stone-200 rounded-xl flex items-center justify-center gap-2 border border-[#4F2E1F]"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Buka Halaman Portal Umum</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onOpenVerifier();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold bg-[#341C12] text-amber-300 rounded-xl flex items-center justify-center gap-2 border border-[#4F2E1F]"
              >
                <QrCode className="w-4 h-4" />
                Verifikasi QR
              </button>

              {onExportBackup && (
                <button
                  onClick={() => {
                    onExportBackup();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold bg-[#341C12] text-stone-300 rounded-xl flex items-center justify-center gap-1.5 border border-[#4F2E1F]"
                >
                  <Download className="w-4 h-4" />
                  Backup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
