import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  X, 
  Eye, 
  EyeOff, 
  Info, 
  AlertCircle,
  Building2,
  School,
  CheckCircle2,
  User,
  Shield
} from 'lucide-react';
import { AuthUser, GudepRegistration } from '../types';
import { 
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
  existingRegistrations,
  initialTab = 'pengurus',
  onOpenRegistration,
}) => {
  // Main tab: 'pengurus' for kwarran board & superadmin, 'gudep' for members/pembina of registered gudep
  const [mainTab, setMainTab] = useState<'gudep' | 'pengurus'>(initialTab);

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
  const [registrations, setRegistrations] = useState<GudepRegistration[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMainTab(initialTab);
      setErrorMessage(null);
      setSuccessInfo(null);

      if (existingRegistrations && existingRegistrations.length > 0) {
        setRegistrations(existingRegistrations);
      } else {
        setRegistrations(loadGudepRegistrations());
      }
    }
  }, [isOpen, initialTab, existingRegistrations]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D97706', '#10B981', '#F59E0B', '#3B82F6']
    });
  };

  // 1. Handler for Gudep Account Login
  const handleGudepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    const user = gudepUsername.trim();
    const pass = gudepPassword.trim();

    if (!user) {
      setErrorMessage('Silakan masukkan Username, Email, atau NTA Gudep Anda.');
      return;
    }
    if (!pass) {
      setErrorMessage('Silakan masukkan Kata Sandi akun Gudep.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authenticateCredentials(user, pass, registrations);
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

  // 2. Handler for Pengurus & Super Admin Login
  const handlePengurusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    const user = pengurusUsername.trim();
    const pass = pengurusPassword.trim();

    if (!user) {
      setErrorMessage('Silakan masukkan Username atau Email pengurus.');
      return;
    }
    if (!pass) {
      setErrorMessage('Silakan masukkan Kata Sandi atau PIN.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authenticateCredentials(user, pass, registrations);
      setIsLoading(false);
      if (res.success && res.user) {
        triggerConfetti();
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Autentikasi gagal. Periksa kembali Username dan Kata Sandi / PIN Anda.');
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#24140D] border border-[#442618] rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#2D180F] via-[#381F13] to-[#2D180F] p-6 border-b border-[#442618] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-xl hover:bg-[#46281A] transition-colors"
            title="Tutup Form Login"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400 shadow-inner">
              {mainTab === 'pengurus' ? <ShieldCheck className="w-6 h-6" /> : <School className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  FORM KREDENSIAL LOGIN
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                  SIKAP v2.0
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                {mainTab === 'pengurus' 
                  ? 'Portal Pengurus & Super Admin' 
                  : 'Portal Mandiri Gugus Depan'}
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                {mainTab === 'pengurus'
                  ? 'Autentikasi akun Super Admin, Ketua, Sekretaris, dan Andalan Kwarran.'
                  : 'Gunakan Username dan Kata Sandi pangkalan yang telah disetujui.'}
              </p>
            </div>
          </div>

          {/* Primary Tab Selector */}
          <div className="grid grid-cols-2 bg-[#160B05] p-1.5 rounded-2xl mt-5 border border-[#3E2114] gap-1">
            <button
              type="button"
              onClick={() => { setMainTab('pengurus'); setErrorMessage(null); }}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                mainTab === 'pengurus'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md scale-[1.01]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Pengurus & Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => { setMainTab('gudep'); setErrorMessage(null); }}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                mainTab === 'gudep'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md scale-[1.01]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Gugus Depan / Anggota</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Pure Credential Forms */}
        <div className="p-6 space-y-4">
          
          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 bg-red-950/70 border border-red-500/50 rounded-2xl flex items-start gap-3 text-xs text-red-200">
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

          {/* FORM 1: PENGURUS & SUPER ADMIN KREDENSIAL */}
          {mainTab === 'pengurus' && (
            <form onSubmit={handlePengurusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Username / Email Pengurus *</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={pengurusUsername}
                  onChange={(e) => setPengurusUsername(e.target.value)}
                  placeholder="Contoh: admin atau ketua.kwarran"
                  className="w-full bg-[#180C06] border border-[#442517] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kata Sandi / PIN Pengurus *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPengurusPassword ? 'text' : 'password'}
                    required
                    value={pengurusPassword}
                    onChange={(e) => setPengurusPassword(e.target.value)}
                    placeholder="Masukkan kata sandi atau PIN..."
                    className="w-full bg-[#180C06] border border-[#442517] focus:border-amber-500 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPengurusPassword(!showPengurusPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                    title={showPengurusPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPengurusPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#1B0C06] border border-[#3E2114] rounded-xl text-[11px] text-stone-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Untuk <strong>Super Admin</strong>, gunakan username <code className="text-amber-300 font-bold bg-[#2A150C] px-1 py-0.5 rounded">admin</code> dan kata sandi yang telah ditetapkan.
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
                    <span>Memverifikasi Kredensial...</span>
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

          {/* FORM 2: GUGUS DEPAN & ANGGOTA KREDENSIAL */}
          {mainTab === 'gudep' && (
            <div className="space-y-4">
              <form onSubmit={handleGudepSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Username Akun Gudep / NTA Pembina / Email *</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={gudepUsername}
                    onChange={(e) => setGudepUsername(e.target.value)}
                    placeholder="Contoh: pembina.sdnkebonpedes atau 09.02.04.071.0001"
                    className="w-full bg-[#180C06] border border-[#442517] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kata Sandi Akun Gudep *</span>
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
                      title={showGudepPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showGudepPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[#1B0C06] border border-[#3E2114] rounded-xl text-[11px] text-stone-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Gunakan kredensial yang dibuat pada formulir pendaftaran pangkalan. Akses akan terbuka otomatis jika pendaftaran berstatus <strong>Disetujui</strong> oleh Pengurus Kwarran.
                  </p>
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

              {/* Quick link to register if user doesn't have an account */}
              {onOpenRegistration && (
                <div className="pt-3 border-t border-[#351B11] text-center">
                  <p className="text-xs text-stone-400">
                    Belum memiliki akun pangkalan?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRegistration();
                      }}
                      className="text-amber-400 hover:text-amber-300 font-bold underline inline-flex items-center gap-1 ml-1"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Daftar Gudep Baru</span>
                    </button>
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#1A0C06] px-6 py-3.5 border-t border-[#3A1E12] flex items-center justify-between text-[11px] text-stone-400">
          <span>Kwartir Ranting Tanah Sareal • Kota Bogor</span>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white underline font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
