import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  KeyRound, 
  ArrowRight, 
  X, 
  Eye, 
  EyeOff, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Award,
  Sparkles,
  HelpCircle,
  Settings,
  Users,
  School,
  Check
} from 'lucide-react';
import { AuthUser, GudepRegistration } from '../types';
import { 
  getCustomPengurusList, 
  loginWithPreset, 
  authenticateCredentials, 
  PengurusAccountItem 
} from '../utils/auth';
import { loadGudepRegistrations } from '../utils/storage';
import confetti from 'canvas-confetti';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onOpenPengurusSettings?: () => void;
  pengurusList?: PengurusAccountItem[];
  existingRegistrations?: GudepRegistration[];
  initialTab?: 'gudep' | 'pengurus';
  onOpenRegistration?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenPengurusSettings,
  pengurusList,
  existingRegistrations,
  initialTab = 'gudep',
  onOpenRegistration,
}) => {
  // Main tab: 'gudep' for members/pembina of registered gudep, 'pengurus' for kwarran board
  const [mainTab, setMainTab] = useState<'gudep' | 'pengurus'>(initialTab);
  
  // Sub-tab for pengurus: 'preset' or 'manual'
  const [pengurusSubTab, setPengurusSubTab] = useState<'preset' | 'manual'>('preset');

  // Gudep Login Form State
  const [gudepUsername, setGudepUsername] = useState('');
  const [gudepPassword, setGudepPassword] = useState('');
  const [showGudepPassword, setShowGudepPassword] = useState(false);

  // Pengurus Login Form State
  const [pengurusUsername, setPengurusUsername] = useState('');
  const [pengurusPassword, setPengurusPassword] = useState('');
  const [showPengurusPassword, setShowPengurusPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [accountList, setAccountList] = useState<PengurusAccountItem[]>([]);
  const [registrations, setRegistrations] = useState<GudepRegistration[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMainTab(initialTab);
      setErrorMessage(null);
      setSuccessInfo(null);
      
      if (pengurusList && pengurusList.length > 0) {
        setAccountList(pengurusList);
      } else {
        setAccountList(getCustomPengurusList());
      }

      if (existingRegistrations && existingRegistrations.length > 0) {
        setRegistrations(existingRegistrations);
      } else {
        setRegistrations(loadGudepRegistrations());
      }
    }
  }, [isOpen, initialTab, pengurusList, existingRegistrations]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D97706', '#10B981', '#F59E0B', '#3B82F6']
    });
  };

  // 1. Handler for Gudep Account Login (Member & Pembina)
  const handleGudepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (!gudepUsername.trim()) {
      setErrorMessage('Silakan masukkan Username, Email, atau NTA Gudep Anda.');
      return;
    }
    if (!gudepPassword.trim()) {
      setErrorMessage('Silakan masukkan Kata Sandi akun Gudep.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authenticateCredentials(gudepUsername, gudepPassword, registrations);
      setIsLoading(false);

      if (res.success && res.user) {
        triggerConfetti();
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Login gagal. Pastikan akun telah diverifikasi dan disetujui oleh Pengurus Kwarran.');
      }
    }, 450);
  };

  // 2. Handler for Preset Pengurus Select
  const handlePresetSelect = (presetId: string) => {
    if (presetId === 'user-superadmin') {
      setPengurusSubTab('manual');
      setPengurusUsername('superadmin');
      setPengurusPassword('');
      setErrorMessage('Akun Super Admin berkeamanan tinggi. Silakan masukkan kata sandi akun superadmin untuk melanjutkan.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      const user = loginWithPreset(presetId);
      setIsLoading(false);
      if (user) {
        triggerConfetti();
        onLoginSuccess(user);
        onClose();
      } else {
        setErrorMessage('Gagal memuat akun terpilih.');
      }
    }, 400);
  };

  // 3. Handler for Manual Pengurus Submit
  const handlePengurusManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authenticateCredentials(pengurusUsername, pengurusPassword, registrations);
      setIsLoading(false);
      if (res.success && res.user) {
        triggerConfetti();
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Autentikasi gagal. Periksa kembali kredensial Anda.');
      }
    }, 500);
  };

  // Filter approved Gudeps for quick helper
  const approvedGudeps = registrations.filter(r => r.statusVerifikasi === 'Disetujui');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-[#24140D] border border-[#442618] rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#2D180F] via-[#381F13] to-[#2D180F] p-6 border-b border-[#442618] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-xl hover:bg-[#46281A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-2xl shadow-inner">
              {mainTab === 'gudep' ? '🏫' : '⚜️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  {mainTab === 'gudep' ? 'PORTAL MANDIRI GUGUS DEPAN' : 'AUTENTIKASI PENGURUS KWARRAN'}
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                  SIKAP v2.0
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                {mainTab === 'gudep' 
                  ? 'Masuk Akun Anggota & Gugus Depan' 
                  : 'Portal Manajemen Pengurus Kwarran'}
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                {mainTab === 'gudep'
                  ? 'Gunakan Username & Password pendaftaran yang telah diverifikasi oleh Pengurus Kwarran Tanah Sareal.'
                  : 'Masuk sebagai Ketua, Sekretaris, Andalan, atau Super Admin Kwarran.'}
              </p>
            </div>
          </div>

          {/* Primary Tab Selector: Gudep vs Pengurus */}
          <div className="flex bg-[#160B05] p-1.5 rounded-2xl mt-5 border border-[#3E2114]">
            <button
              type="button"
              onClick={() => { setMainTab('gudep'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                mainTab === 'gudep'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md scale-[1.01]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Akun Gugus Depan / Anggota</span>
            </button>

            <button
              type="button"
              onClick={() => { setMainTab('pengurus'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                mainTab === 'pengurus'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md scale-[1.01]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pengurus Kwarran</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          
          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 bg-red-950/70 border border-red-500/50 rounded-2xl flex items-start gap-3 text-xs text-red-200 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Info Box */}
          {successInfo && (
            <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl flex items-start gap-3 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successInfo}</div>
            </div>
          )}

          {/* TAB 1: GUDGE / MEMBER LOGIN */}
          {mainTab === 'gudep' && (
            <div className="space-y-4">
              
              <div className="p-3.5 bg-[#1B0C06] border border-[#3E2114] rounded-2xl text-xs text-stone-300 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>Petunjuk Login Akun Gudep:</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed pl-6">
                  Masukkan <strong>Username</strong> dan <strong>Kata Sandi</strong> yang dibuat pada saat mengisi formulir pendaftaran pangkalan. Akses akan terbuka otomatis jika pendaftaran telah <strong>Disetujui</strong> oleh Pengurus Kwarran.
                </p>
              </div>

              <form onSubmit={handleGudepSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                    Username Akun Gudep / NTA Pembina / Email Pendaftar *
                  </label>
                  <input
                    type="text"
                    required
                    value={gudepUsername}
                    onChange={(e) => setGudepUsername(e.target.value)}
                    placeholder="Contoh: pembina.sdnkebonpedes atau 09.02.04.071.0001"
                    className="w-full bg-[#180C06] border border-[#442517] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                    Kata Sandi Akun Gudep *
                  </label>
                  <div className="relative">
                    <input
                      type={showGudepPassword ? 'text' : 'password'}
                      required
                      value={gudepPassword}
                      onChange={(e) => setGudepPassword(e.target.value)}
                      placeholder="Masukkan kata sandi yang dibuat saat registrasi..."
                      className="w-full bg-[#180C06] border border-[#442517] focus:border-amber-500 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGudepPassword(!showGudepPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                    >
                      {showGudepPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-stone-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg border border-amber-300 mt-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Memverifikasi Akun Gudep...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Masuk ke Dashboard Gugus Depan</span>
                    </>
                  )}
                </button>
              </form>

              {/* Sample Verified Gudep Accounts for Quick Trial */}
              {approvedGudeps.length > 0 && (
                <div className="pt-2 border-t border-[#3B1F13]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Akun Gudep Terverifikasi Resmi:
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Siap Digunakan
                    </span>
                  </div>

                  <div className="space-y-2">
                    {approvedGudeps.slice(0, 2).map((reg) => (
                      <div
                        key={reg.id}
                        className="p-3 bg-[#1C0E07] border border-[#402316] rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{reg.namaPangkalan}</span>
                            <span className="text-[10px] text-amber-400 font-mono">({reg.nomorGudep})</span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            Username: <strong className="text-amber-300 font-mono">{reg.akunGudep.username}</strong> • Password: <span className="font-mono text-stone-300">{reg.akunGudep.password}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setGudepUsername(reg.akunGudep.username);
                            setGudepPassword(reg.akunGudep.password);
                            setSuccessInfo(`Kredensial akun "${reg.namaPangkalan}" terpasang. Klik tombol "Masuk ke Dashboard" di atas.`);
                          }}
                          className="px-2.5 py-1.5 bg-[#31180F] hover:bg-amber-600 hover:text-stone-950 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/30 transition-all flex-shrink-0"
                        >
                          Isi Otomatis
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400 border-t border-[#351B11]">
                <span>Belum memiliki akun pangkalan?</span>
                {onOpenRegistration && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRegistration();
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Daftar Gudep Baru Sekarang</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PENGURUS KWARRAN LOGIN */}
          {mainTab === 'pengurus' && (
            <div className="space-y-4">
              
              {/* Sub-tab: Preset vs Manual */}
              <div className="flex bg-[#180C06] p-1 rounded-xl border border-[#381D12]">
                <button
                  type="button"
                  onClick={() => { setPengurusSubTab('preset'); setErrorMessage(null); }}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    pengurusSubTab === 'preset'
                      ? 'bg-amber-600 text-stone-950 font-bold shadow'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Pilih Akun Pengurus</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPengurusSubTab('manual'); setErrorMessage(null); }}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    pengurusSubTab === 'manual'
                      ? 'bg-amber-600 text-stone-950 font-bold shadow'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Form Kredensial</span>
                </button>
              </div>

              {pengurusSubTab === 'preset' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-300">
                      Daftar Akun Resmi Terdaftar:
                    </span>
                    {onOpenPengurusSettings && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenPengurusSettings();
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold underline"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Ubah/Kelola Pengurus</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {accountList.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => handlePresetSelect(acc.id)}
                        disabled={isLoading}
                        className="w-full text-left p-3.5 bg-[#2A160E] hover:bg-[#381F14] border border-[#442618] hover:border-amber-500/50 rounded-xl transition-all group relative flex items-start justify-between gap-3 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1A0C06] border border-[#48281A] flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                            {acc.avatarEmoji || '⚜️'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                {acc.name}
                              </h4>
                              {acc.id === 'user-superadmin' ? (
                                <span className="text-[9.5px] bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                                  SUPER ADMIN
                                </span>
                              ) : (
                                <span className="text-[10px] bg-[#1A0C06] text-stone-300 px-2 py-0.5 rounded font-medium border border-stone-700">
                                  {acc.roleTitle}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">
                              {acc.jabatan}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform flex-shrink-0 mt-1">
                          <span>{acc.id === 'user-superadmin' ? 'Verifikasi Sandi' : 'Masuk'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePengurusManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      Username / Email Pengurus
                    </label>
                    <input
                      type="text"
                      required
                      value={pengurusUsername}
                      onChange={(e) => setPengurusUsername(e.target.value)}
                      placeholder="Contoh: superadmin atau ketua.kwarran"
                      className="w-full bg-[#1A0C06] border border-[#442618] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                      PIN / Kata Sandi Pengurus
                    </label>
                    <div className="relative">
                      <input
                        type={showPengurusPassword ? 'text' : 'password'}
                        required
                        value={pengurusPassword}
                        onChange={(e) => setPengurusPassword(e.target.value)}
                        placeholder="Masukkan PIN atau password"
                        className="w-full bg-[#1A0C06] border border-[#442618] focus:border-amber-500 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPengurusPassword(!showPengurusPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                      >
                        {showPengurusPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md border border-amber-400 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Memverifikasi Akses...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Masuk ke Dashboard Pengurus</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#1A0C06] px-6 py-3.5 border-t border-[#3A1E12] flex items-center justify-between text-[11px] text-stone-400">
          <span>Kwartir Ranting Tanah Sareal • Kota Bogor</span>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white underline font-medium"
          >
            Kembali ke Portal Umum
          </button>
        </div>
      </div>
    </div>
  );
};
