import React, { useState } from 'react';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  UserCheck, 
  RotateCcw, 
  Search, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Edit3,
  HelpCircle,
  X
} from 'lucide-react';
import { AuthUser } from '../types';
import { 
  PengurusAccountItem, 
  updateAccountCredentials, 
  resetAccountPasswordToDefault, 
  saveCustomPengurusList,
  isSuperAdmin
} from '../utils/auth';
import { savePengurusToCloud, syncAllPengurusToCloud } from '../services/realtimeDb';

interface CredentialsSettingsTabProps {
  currentUser: AuthUser | null;
  onUpdateCurrentUser: (user: AuthUser) => void;
  pengurusList: PengurusAccountItem[];
  onPengurusListUpdated: (newList: PengurusAccountItem[]) => void;
  onShowSuccess: (msg: string) => void;
  onOpenLogin?: () => void;
}

export const CredentialsSettingsTab: React.FC<CredentialsSettingsTabProps> = ({
  currentUser,
  onUpdateCurrentUser,
  pengurusList,
  onPengurusListUpdated,
  onShowSuccess,
  onOpenLogin
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Password visibility state per account id
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Copied indicator state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Cloud sync state
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // Self account edit form state
  const [selfUsername, setSelfUsername] = useState(currentUser?.username || '');
  const [selfPassword, setSelfPassword] = useState('');
  const [selfConfirmPassword, setSelfConfirmPassword] = useState('');
  const [showSelfPassword, setShowSelfPassword] = useState(false);
  const [selfError, setSelfError] = useState<string | null>(null);
  const [selfSuccess, setSelfSuccess] = useState<string | null>(null);
  const [isSavingSelf, setIsSavingSelf] = useState(false);

  // Modal edit account credentials state
  const [editingTarget, setEditingTarget] = useState<PengurusAccountItem | null>(null);
  const [targetUsername, setTargetUsername] = useState('');
  const [targetPassword, setTargetPassword] = useState('');
  const [targetConfirmPassword, setTargetConfirmPassword] = useState('');
  const [showTargetPassword, setShowTargetPassword] = useState(false);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [isSavingTarget, setIsSavingTarget] = useState(false);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Toggle password reveal
  const togglePasswordVisibility = (accountId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  // Generate random 6-digit PIN
  const generateRandomPin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Handle Save for Active User (Current User)
  const handleSaveSelf = async (e: React.FormEvent) => {
    e.preventDefault();
    setSelfError(null);
    setSelfSuccess(null);

    if (!currentUser) {
      setSelfError('Tidak ada akun pengurus yang sedang aktif.');
      return;
    }

    if (!selfUsername || selfUsername.trim().length < 3) {
      setSelfError('Username harus minimal 3 karakter.');
      return;
    }

    // If password provided, validate match
    const newPinToSave = selfPassword.trim() 
      ? selfPassword.trim() 
      : (pengurusList.find(p => p.id === currentUser.id)?.pin || '123456');

    if (selfPassword.trim()) {
      if (selfPassword.trim().length < 4) {
        setSelfError('Password / PIN baru minimal 4 karakter.');
        return;
      }
      if (selfPassword.trim() !== selfConfirmPassword.trim()) {
        setSelfError('Konfirmasi password tidak cocok dengan password baru.');
        return;
      }
    }

    setIsSavingSelf(true);
    try {
      const result = updateAccountCredentials(currentUser.id, selfUsername, newPinToSave, currentUser);
      if (!result.success || !result.updatedAccount) {
        setSelfError(result.error || 'Gagal memperbarui username & password.');
        setIsSavingSelf(false);
        return;
      }

      // Sync to cloud Firestore
      await savePengurusToCloud(result.updatedAccount);

      // Update local state list
      const updatedList = pengurusList.map(p => 
        p.id === result.updatedAccount!.id ? result.updatedAccount! : p
      );
      onPengurusListUpdated(updatedList);

      // Update active user in session
      const { pin, description, ...activeUserData } = result.updatedAccount;
      onUpdateCurrentUser(activeUserData);

      setSelfPassword('');
      setSelfConfirmPassword('');
      setSelfSuccess(`Username & Password akun ${result.updatedAccount.name} berhasil disimpan dan disinkronkan ke Cloud!`);
      onShowSuccess(`Kredensial akun Anda (${result.updatedAccount.name}) berhasil diperbarui.`);
      setTimeout(() => setSelfSuccess(null), 4000);
    } catch (err) {
      setSelfError('Terjadi kesalahan saat menyimpan data ke cloud.');
    } finally {
      setIsSavingSelf(false);
    }
  };

  // Open modal edit target account
  const handleOpenEditTarget = (account: PengurusAccountItem) => {
    if (!currentUser) return;
    const isSuper = isSuperAdmin(currentUser);
    const isOwn = currentUser.id === account.id || currentUser.username.toLowerCase() === account.username.toLowerCase();
    if (!isSuper && !isOwn) {
      alert('Akses Ditolak: Anda hanya berhak mengatur password akun Anda sendiri. Akun lain hanya dapat dikelola oleh Super Admin ("superadmin").');
      return;
    }

    setEditingTarget(account);
    setTargetUsername(account.username);
    setTargetPassword(account.pin);
    setTargetConfirmPassword(account.pin);
    setShowTargetPassword(false);
    setTargetError(null);
  };

  // Handle Save for Target Account Modal
  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget || !currentUser) return;
    setTargetError(null);

    if (!targetUsername || targetUsername.trim().length < 3) {
      setTargetError('Username harus minimal 3 karakter.');
      return;
    }

    if (!targetPassword || targetPassword.trim().length < 4) {
      setTargetError('Password / PIN minimal 4 karakter.');
      return;
    }

    if (targetPassword.trim() !== targetConfirmPassword.trim()) {
      setTargetError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsSavingTarget(true);
    try {
      const result = updateAccountCredentials(editingTarget.id, targetUsername, targetPassword, currentUser);
      if (!result.success || !result.updatedAccount) {
        setTargetError(result.error || 'Gagal memperbarui kredensial.');
        setIsSavingTarget(false);
        return;
      }

      // Sync to cloud Firestore
      await savePengurusToCloud(result.updatedAccount);

      // Update state
      const updatedList = pengurusList.map(p => 
        p.id === result.updatedAccount!.id ? result.updatedAccount! : p
      );
      onPengurusListUpdated(updatedList);

      // If matches active logged-in user
      if (currentUser && currentUser.id === result.updatedAccount.id) {
        const { pin, description, ...activeUserData } = result.updatedAccount;
        onUpdateCurrentUser(activeUserData);
      }

      onShowSuccess(`Username & Password Kak ${result.updatedAccount.name} berhasil diperbarui.`);
      setEditingTarget(null);
    } catch (err) {
      setTargetError('Gagal menyimpan ke Cloud Firestore.');
    } finally {
      setIsSavingTarget(false);
    }
  };

  // Reset password to default
  const handleResetPassword = async (account: PengurusAccountItem) => {
    if (!currentUser) return;
    const isSuper = isSuperAdmin(currentUser);
    const isOwn = currentUser.id === account.id || currentUser.username.toLowerCase() === account.username.toLowerCase();
    if (!isSuper && !isOwn) {
      alert('Akses Ditolak: Hanya Super Admin ("superadmin") atau pemilik akun yang berwenang mereset password akun ini.');
      return;
    }

    const defaultPin = account.username.toLowerCase() === 'superadmin' ? 'akhmadtaufik84@' : '123456';
    const confirmReset = window.confirm(
      `Yakin ingin mereset kata sandi/PIN Kak ${account.name} ke default "${defaultPin}"?`
    );
    if (!confirmReset) return;

    const result = resetAccountPasswordToDefault(account.id, currentUser);
    if (result.success && result.updatedAccount) {
      await savePengurusToCloud(result.updatedAccount);
      const updatedList = pengurusList.map(p => 
        p.id === result.updatedAccount!.id ? result.updatedAccount! : p
      );
      onPengurusListUpdated(updatedList);
      onShowSuccess(`Password/PIN Kak ${account.name} direset ke default "${defaultPin}".`);
    } else if (result.error) {
      alert(result.error);
    }
  };

  // Sync all credentials to Cloud Firestore
  const handleSyncAllToCloud = async () => {
    setIsSyncingCloud(true);
    try {
      await syncAllPengurusToCloud(pengurusList);
      onShowSuccess(`Seluruh ${pengurusList.length} kredensial akun berhasil disinkronkan ke Cloud Firestore!`);
    } catch (err) {
      alert('Gagal menyinkronkan data ke Cloud Firestore.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Filtered accounts
  const filteredAccounts = pengurusList.filter(acc => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      acc.name.toLowerCase().includes(q) ||
      acc.username.toLowerCase().includes(q) ||
      acc.roleTitle.toLowerCase().includes(q) ||
      acc.jabatan.toLowerCase().includes(q) ||
      acc.email.toLowerCase().includes(q) ||
      (acc.nta && acc.nta.toLowerCase().includes(q))
    );
  });

  // Check superadmin privilege
  const userIsSuperAdmin = isSuperAdmin(currentUser);

  // GATE: User must be logged in to manage credentials
  if (!currentUser) {
    return (
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-900 rounded-xl flex-shrink-0 mt-0.5 border border-amber-400/40">
              <KeyRound className="w-6 h-6 text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base text-stone-900">
                  Pengaturan Kredensial Login (Username & Password)
                </h4>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-black text-[10px] uppercase rounded-md tracking-wider border border-rose-200">
                  Akses Terproteksi
                </span>
              </div>
              <p className="text-xs text-stone-700 mt-1 leading-relaxed max-w-2xl">
                Pengaturan username dan kata sandi dilindungi oleh hak akses sistem SISKA-SIKAP.
              </p>
            </div>
          </div>
        </div>

        {/* Protected Gate Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md text-center max-w-xl mx-auto space-y-5 my-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-800 flex items-center justify-center mx-auto border border-amber-300 shadow-inner">
            <Lock className="w-8 h-8 text-amber-800" />
          </div>

          <div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
              Login Diperlukan
            </span>
            <h3 className="text-lg sm:text-xl font-black text-stone-900 mt-2.5">
              Akses Pengaturan Password Dilindungi
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Sesuai kebijakan privasi & keamanan, yang dapat mengatur password hanyalah <strong>user yang bersangkutan setelah masuk (login)</strong> atau <strong>Super Admin</strong>.
            </p>
          </div>

          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-left space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>Ketentuan Hak Akses Pengaturan:</span>
            </div>
            <ul className="space-y-2 text-stone-700 pl-1 text-[11.5px]">
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold mt-0.5">•</span>
                <span><strong>User / Pengurus Terkait:</strong> Masuk ke akun Anda untuk mengatur username dan kata sandi Anda sendiri.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-700 font-bold mt-0.5">•</span>
                <span><strong>Super Admin:</strong> Masuk dengan akun <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-mono font-bold text-amber-950">superadmin</code> dan password <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-mono font-bold text-amber-950">akhmadtaufik84@</code> untuk otoritas penuh mengelola dan mereset password seluruh pengurus.</span>
              </li>
            </ul>
          </div>

          {onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full py-3 px-5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Masuk / Login Akun Sekarang</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300/80 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-900 rounded-xl flex-shrink-0 mt-0.5 border border-amber-400/40">
            <KeyRound className="w-6 h-6 text-amber-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-stone-900">
                Pengaturan Kredensial Login (Username & Password)
              </h4>
              <span className="px-2 py-0.5 bg-amber-200/90 text-amber-950 font-black text-[10px] uppercase rounded-md tracking-wider">
                {userIsSuperAdmin ? 'Super Admin' : 'Akun Pengurus'}
              </span>
            </div>
            <p className="text-xs text-stone-700 mt-1 leading-relaxed max-w-2xl">
              Atur username serta kata sandi / PIN login untuk akun pengurus ranting dan operator pangkalan Gudep. 
              Setiap perubahan otomatis disimpan dan disinkronkan secara Real-time ke Cloud Firestore.
            </p>
          </div>
        </div>

        {userIsSuperAdmin && (
          <button
            type="button"
            onClick={handleSyncAllToCloud}
            disabled={isSyncingCloud}
            className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0 cursor-pointer"
            title="Kirim dan sinkronkan seluruh kredensial ke cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingCloud ? 'Menyinkronkan...' : 'Sinkronkan ke Cloud'}</span>
          </button>
        )}
      </div>

      {/* ACCESS LEVEL NOTIFICATION */}
      {userIsSuperAdmin ? (
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border-2 border-amber-500 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-white rounded-xl shadow-xs border border-amber-300">⚡</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-amber-500 text-stone-950 font-black text-[10px] uppercase rounded-md tracking-wider shadow-xs">
                  SUPER ADMIN AKTIF
                </span>
                <span className="text-xs font-bold text-stone-900">
                  {currentUser.name} ({currentUser.username})
                </span>
              </div>
              <p className="text-[11.5px] text-stone-700 mt-0.5 leading-relaxed">
                Anda memiliki hak akses penuh untuk mengatur, melihat, mengubah, merandomisasi, dan mereset password seluruh akun pengurus Kwarran & pangkalan Gudep.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-amber-50/70 border border-amber-300/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🛡️</span>
            <div>
              <span className="font-bold text-amber-950">Akses Pengaturan Akun Pribadi: </span>
              <span className="text-stone-700">Anda dapat mengubah username dan kata sandi akun Anda sendiri ({currentUser.name}) pada form di bawah.</span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white text-stone-800 border border-amber-200 font-mono text-[11px] rounded-lg font-bold flex-shrink-0 self-start sm:self-auto">
            @{currentUser.username}
          </span>
        </div>
      )}

      {/* PANEL 1: Ubah Username & Password Akun Anda Sendiri (Jika Sedang Login) */}
      {currentUser && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-amber-400/80 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-stone-950 px-3 py-1 text-[10.5px] font-black uppercase rounded-bl-xl tracking-wider">
            Akun Anda Saat Ini
          </div>

          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-200">
            <span className="text-3xl p-1.5 bg-[#FAF8F5] rounded-xl border border-amber-300">
              {currentUser.avatarEmoji || '⚜️'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-stone-900 text-sm sm:text-base">
                  {currentUser.name}
                </h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md border border-amber-300">
                  {currentUser.roleTitle}
                </span>
              </div>
              <p className="text-xs text-stone-600 font-mono mt-0.5">
                ID Akun: {currentUser.id} • Username Aktif: <strong className="text-stone-900">{currentUser.username}</strong>
              </p>
            </div>
          </div>

          {selfSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{selfSuccess}</span>
            </div>
          )}

          {selfError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{selfError}</span>
            </div>
          )}

          <form onSubmit={handleSaveSelf} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1.5">
                  Username Login Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={selfUsername}
                    onChange={e => setSelfUsername(e.target.value)}
                    placeholder="Contoh: ketua.kwarran"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl font-mono text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">Username digunakan untuk masuk sistem.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-stone-800">
                    Kata Sandi / PIN Baru
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pin = generateRandomPin();
                      setSelfPassword(pin);
                      setSelfConfirmPassword(pin);
                      setShowSelfPassword(true);
                    }}
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Acak PIN</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSelfPassword ? 'text' : 'password'}
                    value={selfPassword}
                    onChange={e => setSelfPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak diubah"
                    className="w-full p-2.5 pr-9 bg-[#FAF8F5] border border-stone-300 rounded-xl font-mono text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSelfPassword(!showSelfPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    title={showSelfPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showSelfPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 mt-1">Bisa PIN 6 digit atau teks password bebas.</p>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1.5">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showSelfPassword ? 'text' : 'password'}
                    value={selfConfirmPassword}
                    onChange={e => setSelfConfirmPassword(e.target.value)}
                    disabled={!selfPassword}
                    placeholder={selfPassword ? 'Ulangi kata sandi' : 'Masukkan password baru dahulu'}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-stone-300 disabled:opacity-60 rounded-xl font-mono text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                {selfPassword && (
                  <p className={`text-[10px] mt-1 font-semibold ${
                    selfPassword === selfConfirmPassword ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {selfPassword === selfConfirmPassword ? '✓ Konfirmasi cocok' : '✗ Belum cocok'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelfPassword('123456');
                    setSelfConfirmPassword('123456');
                    setShowSelfPassword(true);
                  }}
                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-lg text-[11px] font-bold transition-colors"
                >
                  Gunakan Default (123456)
                </button>
              </div>

              <button
                type="submit"
                disabled={isSavingSelf}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs shadow-sm flex items-center gap-2 transition-all"
              >
                {isSavingSelf ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Simpan Kredensial Saya</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PANEL 2: Daftar Username & Password Seluruh Pengurus (Khusus Super Admin) */}
      {userIsSuperAdmin ? (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5DFD5] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base text-stone-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Daftar Kredensial Akses Seluruh Pengurus & Operator</span>
                </h4>
                <span className="px-2 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-black uppercase rounded-md shadow-xs">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Kelola username dan password dari setiap tingkatan jabatan. Total {pengurusList.length} akun terdaftar.
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama, role, username..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Grid Akun */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredAccounts.map((acc) => {
              const isCurrentActive = currentUser?.id === acc.id;
              const isRevealed = revealedPasswords[acc.id] || false;

              return (
                <div
                  key={acc.id}
                  className={`p-4 rounded-2xl border transition-all bg-white flex flex-col justify-between ${
                    isCurrentActive 
                      ? 'border-amber-500 ring-2 ring-amber-400/30 shadow-md' 
                      : 'border-stone-200 hover:border-stone-400 shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1 bg-[#FAF8F5] rounded-xl border border-stone-200">
                          {acc.avatarEmoji || '⚜️'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="font-black text-sm text-stone-900 leading-tight">
                              {acc.name}
                            </h5>
                            {isCurrentActive && (
                              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9.5px] font-bold">
                                Akun Anda
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-amber-800 leading-tight mt-0.5">
                            {acc.jabatan}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono font-medium border border-stone-200 flex-shrink-0">
                        {acc.roleTitle}
                      </span>
                    </div>

                    {/* Kredensial Box */}
                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 space-y-2 text-xs">
                      {/* Username */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-500 font-medium">Username:</span>
                        <div className="flex items-center gap-1.5">
                          <code className="px-2 py-0.5 bg-white border border-stone-300 rounded-md font-mono font-bold text-stone-900 text-xs">
                            {acc.username}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.username, `user-${acc.id}`)}
                            className="p-1 hover:bg-stone-200 rounded text-stone-600 transition-colors cursor-pointer"
                            title="Salin Username"
                          >
                            {copiedKey === `user-${acc.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Password / PIN */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-500 font-medium">Password / PIN:</span>
                        <div className="flex items-center gap-1.5">
                          <code className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                            isRevealed 
                              ? 'bg-amber-50 text-amber-950 border border-amber-300' 
                              : 'bg-white border border-stone-300 text-stone-700 tracking-wider'
                          }`}>
                            {isRevealed ? acc.pin : '••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(acc.id)}
                            className="p-1 hover:bg-stone-200 rounded text-stone-600 transition-colors cursor-pointer"
                            title={isRevealed ? 'Sembunyikan' : 'Tampilkan Kata Sandi'}
                          >
                            {isRevealed ? (
                              <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.pin, `pin-${acc.id}`)}
                            className="p-1 hover:bg-stone-200 rounded text-stone-600 transition-colors cursor-pointer"
                            title="Salin Password"
                          >
                            {copiedKey === `pin-${acc.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Extra Info */}
                      <div className="pt-1.5 border-t border-stone-200/80 flex items-center justify-between text-[10.5px] text-stone-500">
                        <span className="truncate max-w-[170px]">{acc.email}</span>
                        {acc.nta && <span>NTA: {acc.nta}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleResetPassword(acc)}
                      className="text-[11px] text-stone-500 hover:text-stone-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      title="Reset ke PIN default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Default</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditTarget(acc)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Ubah Username & Password</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAccounts.length === 0 && (
            <div className="py-12 text-center text-stone-500">
              <Lock className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-xs font-medium">Tidak ada akun pengurus yang sesuai dengan pencarian &quot;{searchQuery}&quot;.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center mx-auto border border-amber-300/60 shadow-xs">
            <Lock className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-sm sm:text-base text-stone-900">
              Pengelolaan Kredensial Pengurus Lain Dibatasi
            </h4>
            <p className="text-xs text-stone-600 max-w-lg mx-auto leading-relaxed">
              Anda sedang masuk sebagai <strong className="text-stone-900">{currentUser.name}</strong> ({currentUser.roleTitle}). 
              Sesuai aturan keamanan dan privasi, Anda hanya berwenang mengatur username & kata sandi akun Anda sendiri pada formulir di atas.
            </p>
          </div>
          <div className="max-w-md mx-auto p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-left text-xs space-y-1.5 shadow-xs">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>Otoritas Super Admin:</span>
            </div>
            <p className="text-stone-700 text-[11.5px] leading-relaxed">
              Pengaturan kredensial, perubahan kata sandi, dan reset akun untuk pengurus lain hanya dapat dilakukan oleh <strong>Super Admin</strong> dengan akun <code className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-mono font-bold text-amber-950">superadmin</code>.
            </p>
          </div>
        </div>
      )}

      {/* PANEL 3: Informasi Panduan Keamanan */}
      <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-stone-300/80 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 space-y-1 leading-relaxed">
          <h5 className="font-bold text-stone-900">Tips Kredensial Akses Pengurus SISKA - SIKAP:</h5>
          <ul className="list-disc pl-4 space-y-0.5 text-[11.5px] text-stone-600">
            <li>Saat login ke sistem, pengurus dapat menggunakan <strong>Username</strong>, <strong>Email resmi</strong>, atau <strong>Nomor Tanda Anggota (NTA)</strong>.</li>
            <li>Kata sandi / PIN default untuk seluruh akun standar adalah <code className="bg-stone-200 px-1 py-0.5 rounded font-mono font-bold text-stone-900">123456</code>.</li>
            <li>Perubahan kredensial tersimpan secara aman di peramban lokal dan disinkronkan secara instan ke Cloud Firestore sehingga berlaku saat login di gawai lain.</li>
          </ul>
        </div>
      </div>

      {/* MODAL EDIT AKUN TERTENTU */}
      {editingTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden animate-scaleUp">
            <div className="bg-[#1A2E26] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-1 bg-white/10 rounded-xl border border-white/20">
                  {editingTarget.avatarEmoji || '⚜️'}
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white">
                    Ubah Kredensial Akun Pengurus
                  </h3>
                  <p className="text-xs text-emerald-300">
                    {editingTarget.name} ({editingTarget.roleTitle})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingTarget(null)}
                className="p-1.5 text-stone-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="p-6 space-y-4">
              {targetError && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{targetError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Username Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={targetUsername}
                  onChange={e => setTargetUsername(e.target.value)}
                  placeholder="Contoh: sekretaris.kwarran"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl font-mono text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-stone-500 mt-1">Username harus unik dan minimal 3 karakter.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-800">
                    Kata Sandi / PIN Baru <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pin = generateRandomPin();
                      setTargetPassword(pin);
                      setTargetConfirmPassword(pin);
                      setShowTargetPassword(true);
                    }}
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Acak PIN</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showTargetPassword ? 'text' : 'password'}
                    required
                    value={targetPassword}
                    onChange={e => setTargetPassword(e.target.value)}
                    placeholder="Masukkan PIN atau password baru"
                    className="w-full p-2.5 pr-9 bg-[#FAF8F5] border border-stone-300 rounded-xl font-mono text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTargetPassword(!showTargetPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showTargetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Ulangi Kata Sandi / PIN <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showTargetPassword ? 'text' : 'password'}
                  required
                  value={targetConfirmPassword}
                  onChange={e => setTargetConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-stone-300 rounded-xl font-mono text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                {targetPassword && (
                  <p className={`text-[10px] mt-1 font-semibold ${
                    targetPassword === targetConfirmPassword ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {targetPassword === targetConfirmPassword ? '✓ Konfirmasi cocok' : '✗ Belum cocok'}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setTargetPassword('123456');
                    setTargetConfirmPassword('123456');
                    setShowTargetPassword(true);
                  }}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold"
                >
                  Set ke 123456
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTarget(null)}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingTarget}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    {isSavingTarget ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Simpan Kredensial</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
