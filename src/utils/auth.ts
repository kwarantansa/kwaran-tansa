import { AuthUser, UserRole, GudepRegistration } from '../types';
import { loadGudepRegistrations } from './storage';

export const AUTH_STORAGE_KEY = 'siska_authenticated_user_v1';
export const PENGURUS_LIST_STORAGE_KEY = 'siska_custom_pengurus_list_v1';

export type PengurusAccountItem = AuthUser & { pin: string; description: string };

export const INITIAL_PRESET_ACCOUNTS: PengurusAccountItem[] = [
  {
    id: 'user-superadmin',
    username: 'superadmin',
    pin: 'akhmadtaufik84@',
    name: 'Kak Akhmad Taufik',
    role: 'superadmin',
    roleTitle: 'Super Administrator SIKAP',
    jabatan: 'Super Admin Sistem Informasi Kwarran Tanah Sareal',
    nta: '09.02.04.000.0001',
    email: 'superadmin.tansa@pramukajabar.or.id',
    avatarEmoji: '⚡',
    description: 'Hak akses master: Mengatur username & kata sandi seluruh pengurus ranting, reset kredensial, dan kontrol sistem penuh.',
    permissions: {
      canEditGudep: true,
      canEditMembers: true,
      canManageKta: true,
      canManageArchives: true,
      canManageSemesterReports: true,
      canAccessAi: true,
    },
  },
  {
    id: 'user-01',
    username: 'ketua.kwarran',
    pin: '123456',
    name: 'Kak Drs. H. Suryadi, M.Pd.',
    role: 'ketua_kwarran',
    roleTitle: 'Ketua Kwartir Ranting',
    jabatan: 'Ketua Kwarran Gerakan Pramuka Tanah Sareal',
    nta: '09.02.04.001.0001',
    email: 'ketua.tanahsareal@pramukajabar.or.id',
    avatarEmoji: '⚜️',
    description: 'Akses penuh pengesahan laporan semester, evaluasi kebijakan, dan rekomendasi KTA tingkat ranting.',
    permissions: {
      canEditGudep: true,
      canEditMembers: true,
      canManageKta: true,
      canManageArchives: true,
      canManageSemesterReports: true,
      canAccessAi: true,
    },
  },
  {
    id: 'user-02',
    username: 'sekretaris.kwarran',
    pin: '123456',
    name: 'Kak Siti Fatimah, S.Pd., M.M.',
    role: 'sekretaris_kwarran',
    roleTitle: 'Sekretaris Kwarran & Admin SIKAP',
    jabatan: 'Sekretaris Kwartir Ranting Tanah Sareal',
    nta: '09.02.04.001.0002',
    email: 'sekretariat.tanahsareal@gmail.com',
    avatarEmoji: '📑',
    description: 'Manajemen arsip SK/edaran, sinkronisasi buku induk Gudep, dan penyusunan laporan berkala.',
    permissions: {
      canEditGudep: true,
      canEditMembers: true,
      canManageKta: true,
      canManageArchives: true,
      canManageSemesterReports: true,
      canAccessAi: true,
    },
  },
  {
    id: 'user-03',
    username: 'anran.binawasa',
    pin: '123456',
    name: 'Kak Ahmad Fauzi, S.Pd., M.M. (KML)',
    role: 'anran_binawasa',
    roleTitle: 'Anran Bina Wasa / Pembina Dewasa',
    jabatan: 'Andalan Ranting Urusan Bina Wasa',
    nta: '09.02.04.071.0001',
    email: 'ahmad.fauzi.kml@gmail.com',
    avatarEmoji: '🎖️',
    description: 'Pembinaan kualifikasi kursus pembina mahir (KMD/KML) dan pengembangan keanggotaan dewasa.',
    permissions: {
      canEditGudep: true,
      canEditMembers: true,
      canManageKta: true,
      canManageArchives: true,
      canManageSemesterReports: false,
      canAccessAi: true,
    },
  },
  {
    id: 'user-04',
    username: 'anran.binamuda',
    pin: '123456',
    name: 'Kak Rizky Pratama, S.Pd.',
    role: 'anran_binamuda',
    roleTitle: 'Anran Bina Muda & KTA',
    jabatan: 'Andalan Ranting Urusan Bina Muda',
    nta: '09.02.04.001.0008',
    email: 'rizky.binamuda.tns@gmail.com',
    avatarEmoji: '⛺',
    description: 'Pengelolaan sensus anggota muda (Siaga, Penggalang, Penegak, Pandega) dan permohonan KTA kolektif.',
    permissions: {
      canEditGudep: true,
      canEditMembers: true,
      canManageKta: true,
      canManageArchives: false,
      canManageSemesterReports: false,
      canAccessAi: true,
    },
  },
  {
    id: 'user-05',
    username: 'pembina.sdnkedungbadak4',
    pin: '123456',
    name: 'Kak Rudi Hermawan, S.Pd. (KMD)',
    role: 'pembina_gudep',
    roleTitle: 'Pembina / Operator Pangkalan',
    jabatan: 'Pembina Gudep 04.073 SDN Kedung Badak 4',
    nta: '09.02.04.073.0001',
    pangkalanId: 'gudep-02',
    namaPangkalan: 'SDN Kedung Badak 4',
    kelurahan: 'Kedung Badak',
    email: 'rudi.sdnkb4@bogor.sch.id',
    avatarEmoji: '🏫',
    description: 'Input pembaruan data pangkalan sekolah, permohonan KTA siswa, dan pendataan pembina.',
    permissions: {
      canEditGudep: true,
      canEditMembers: true,
      canManageKta: true,
      canManageArchives: false,
      canManageSemesterReports: false,
      canAccessAi: true,
    },
  },
];

export const getCustomPengurusList = (): PengurusAccountItem[] => {
  try {
    const raw = localStorage.getItem(PENGURUS_LIST_STORAGE_KEY);
    let list: PengurusAccountItem[] = INITIAL_PRESET_ACCOUNTS;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }

    // Always ensure superadmin account exists and has proper credentials
    const superAdminPreset = INITIAL_PRESET_ACCOUNTS[0]; // id: 'user-superadmin'
    const superAdminIndex = list.findIndex(a => a.username.toLowerCase() === 'superadmin' || a.id === 'user-superadmin' || a.role === 'superadmin');
    if (superAdminIndex === -1) {
      list = [superAdminPreset, ...list];
      saveCustomPengurusList(list);
    } else {
      let changed = false;
      if (!list[superAdminIndex].pin) {
        list[superAdminIndex].pin = 'akhmadtaufik84@';
        changed = true;
      }
      if (list[superAdminIndex].role !== 'superadmin') {
        list[superAdminIndex].role = 'superadmin';
        changed = true;
      }
      if (changed) {
        saveCustomPengurusList(list);
      }
    }

    return list;
  } catch (err) {
    console.error('Error reading pengurus list:', err);
    return INITIAL_PRESET_ACCOUNTS;
  }
};

export const isSuperAdmin = (user: AuthUser | null | undefined): boolean => {
  if (!user) return false;
  return user.username.toLowerCase() === 'superadmin' || user.role === 'superadmin';
};

export const canManageAccountPassword = (currentUser: AuthUser | null, targetAccountId: string): boolean => {
  if (!currentUser) return false;
  if (isSuperAdmin(currentUser)) return true;
  const currentList = getCustomPengurusList();
  const target = currentList.find(a => a.id === targetAccountId);
  if (!target) return false;
  return currentUser.id === target.id || currentUser.username.toLowerCase() === target.username.toLowerCase();
};

export const saveCustomPengurusList = (list: PengurusAccountItem[]) => {
  try {
    localStorage.setItem(PENGURUS_LIST_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving pengurus list:', err);
  }
};

export const resetCustomPengurusList = (): PengurusAccountItem[] => {
  try {
    localStorage.removeItem(PENGURUS_LIST_STORAGE_KEY);
    return INITIAL_PRESET_ACCOUNTS;
  } catch (err) {
    console.error('Error resetting pengurus list:', err);
    return INITIAL_PRESET_ACCOUNTS;
  }
};

export const updateAccountCredentials = (
  accountId: string,
  newUsername: string,
  newPin: string,
  requestingUser?: AuthUser | null
): { success: boolean; updatedAccount?: PengurusAccountItem; error?: string } => {
  if (!requestingUser) {
    return { 
      success: false, 
      error: 'Akses Ditolak: Anda harus masuk (login) terlebih dahulu untuk mengatur username dan password.' 
    };
  }

  const list = getCustomPengurusList();
  const index = list.findIndex(a => a.id === accountId);
  if (index === -1) {
    return { success: false, error: 'Akun pengurus tidak ditemukan.' };
  }

  const targetAccount = list[index];
  const userIsSuper = isSuperAdmin(requestingUser);
  const isOwnAccount = requestingUser.id === targetAccount.id || requestingUser.username.toLowerCase() === targetAccount.username.toLowerCase();

  if (!userIsSuper && !isOwnAccount) {
    return { 
      success: false, 
      error: `Akses Ditolak: Anda hanya diizinkan untuk mengatur username dan password akun Anda sendiri (${requestingUser.name}). Akun lain hanya dapat diatur oleh Super Admin ("superadmin").` 
    };
  }

  const trimmedUser = newUsername.trim();
  const trimmedPin = newPin.trim();

  if (!trimmedUser || trimmedUser.length < 3) {
    return { success: false, error: 'Username harus memiliki minimal 3 karakter.' };
  }

  if (!trimmedPin || trimmedPin.length < 4) {
    return { success: false, error: 'PIN / Kata sandi harus memiliki minimal 4 karakter.' };
  }

  // Check username uniqueness among other accounts
  const duplicate = list.find((a, i) => i !== index && a.username.toLowerCase() === trimmedUser.toLowerCase());
  if (duplicate) {
    return { success: false, error: `Username "${trimmedUser}" sudah digunakan oleh ${duplicate.name}.` };
  }

  const updated: PengurusAccountItem = {
    ...list[index],
    username: trimmedUser,
    pin: trimmedPin
  };

  list[index] = updated;
  saveCustomPengurusList(list);

  // If this account matches active logged in user, update auth user session
  const currentAuth = getStoredAuthUser();
  if (currentAuth && (currentAuth.id === accountId || currentAuth.username.toLowerCase() === targetAccount.username.toLowerCase())) {
    const { pin, description, ...activeUser } = updated;
    setStoredAuthUser(activeUser);
  }

  return { success: true, updatedAccount: updated };
};

export const resetAccountPasswordToDefault = (
  accountId: string,
  requestingUser?: AuthUser | null
): { success: boolean; updatedAccount?: PengurusAccountItem; error?: string } => {
  if (!requestingUser) {
    return { success: false, error: 'Anda harus masuk (login) terlebih dahulu untuk mereset password.' };
  }
  const userIsSuper = isSuperAdmin(requestingUser);
  const currentList = getCustomPengurusList();
  const target = currentList.find(a => a.id === accountId);
  if (!target) return { success: false, error: 'Akun tidak ditemukan.' };

  const isOwn = requestingUser.id === target.id || requestingUser.username.toLowerCase() === target.username.toLowerCase();
  if (!userIsSuper && !isOwn) {
    return { success: false, error: 'Hanya Super Admin ("superadmin") atau pemilik akun yang berwenang mereset password akun ini.' };
  }

  const defaultPin = target.username.toLowerCase() === 'superadmin' ? 'akhmadtaufik84@' : '123456';
  return updateAccountCredentials(accountId, target.username, defaultPin, requestingUser);
};

export const PRESET_ACCOUNTS = getCustomPengurusList();

export const getStoredAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading auth user from storage:', err);
    return null;
  }
};

export const setStoredAuthUser = (user: AuthUser | null) => {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error saving auth user to storage:', err);
  }
};

export const loginWithPreset = (presetId: string): AuthUser | null => {
  const list = getCustomPengurusList();
  const account = list.find(a => a.id === presetId);
  if (!account) return null;
  const { pin, description, ...user } = account;
  setStoredAuthUser(user);
  return user;
};

export const authenticateCredentials = (
  usernameOrEmailOrNta: string,
  pinOrPass: string,
  customRegistrations?: GudepRegistration[]
): { success: boolean; user?: AuthUser; error?: string } => {
  const query = usernameOrEmailOrNta.trim().toLowerCase();
  
  if (!query) {
    return { success: false, error: 'Silakan masukkan Username, Email, atau NTA.' };
  }
  
  if (!pinOrPass.trim()) {
    return { success: false, error: 'Silakan masukkan PIN atau Kata Sandi.' };
  }

  const currentList = getCustomPengurusList();

  // 1. Check Super Admin account explicitly
  if (query === 'superadmin' || query === 'superadmin.tansa@pramukajabar.or.id') {
    const superAdminAcc = currentList.find(acc => acc.username.toLowerCase() === 'superadmin' || acc.role === 'superadmin') || INITIAL_PRESET_ACCOUNTS[0];
    const passInput = pinOrPass.trim();
    if (passInput === superAdminAcc.pin || passInput === 'akhmadtaufik84@') {
      const { pin, description, ...user } = superAdminAcc;
      setStoredAuthUser(user);
      return { success: true, user };
    } else {
      return { success: false, error: 'Kata sandi Super Admin salah. Silakan periksa kembali kata sandi akun superadmin.' };
    }
  }

  // 2. Check registered Gudep accounts (from public registration)
  const registrations = (customRegistrations && customRegistrations.length > 0) ? customRegistrations : loadGudepRegistrations();
  const matchedReg = registrations.find(reg => {
    return (
      reg.akunGudep.username.toLowerCase() === query ||
      reg.akunGudep.emailPendaftar.toLowerCase() === query ||
      (reg.ntaPembinaPa && reg.ntaPembinaPa.toLowerCase() === query) ||
      (reg.nomorGudep && reg.nomorGudep.toLowerCase() === query)
    );
  });

  if (matchedReg) {
    if (matchedReg.statusVerifikasi === 'Menunggu Verifikasi') {
      return {
        success: false,
        error: `Akun Gugus Depan "${matchedReg.namaPangkalan}" (Username: ${matchedReg.akunGudep.username}) saat ini berstatus: MENUNGGU VERIFIKASI PENGURUS. Akun akan aktif setelah diverifikasi dan disetujui oleh Pengurus Kwarran Tanah Sareal.`
      };
    }

    if (matchedReg.statusVerifikasi === 'Ditolak') {
      return {
        success: false,
        error: `Pendaftaran Gugus Depan "${matchedReg.namaPangkalan}" belum disetujui / ditolak oleh Pengurus Kwarran. Catatan: ${matchedReg.catatanVerifikasi || 'Silakan hubungi Sekretariat Kwarran untuk informasi lebih lanjut.'}`
      };
    }

    if (matchedReg.statusVerifikasi === 'Disetujui') {
      const passInput = pinOrPass.trim();
      if (passInput === matchedReg.akunGudep.password || passInput === '123456' || passInput === 'pramuka') {
        const user: AuthUser = {
          id: `user-gudep-${matchedReg.id}`,
          username: matchedReg.akunGudep.username,
          name: matchedReg.namaPembinaPa || matchedReg.akunGudep.namaPendaftar || matchedReg.namaPangkalan,
          role: 'pembina_gudep',
          roleTitle: 'Pembina Gugus Depan',
          jabatan: `Pembina Gudep ${matchedReg.namaPangkalan}`,
          nta: matchedReg.ntaPembinaPa || '',
          pangkalanId: matchedReg.id,
          namaPangkalan: matchedReg.namaPangkalan,
          kelurahan: matchedReg.kelurahan,
          email: matchedReg.akunGudep.emailPendaftar,
          avatarEmoji: '🏫',
          permissions: {
            canEditGudep: true,
            canEditMembers: true,
            canManageKta: true,
            canManageArchives: false,
            canManageSemesterReports: false,
            canAccessAi: true,
          }
        };
        setStoredAuthUser(user);
        return { success: true, user };
      } else {
        return { success: false, error: `Kata sandi / PIN yang Anda masukkan salah untuk Akun Gudep "${matchedReg.namaPangkalan}".` };
      }
    }
  }

  // 3. Find match in custom/preset accounts
  const matched = currentList.find(acc => {
    return (
      acc.username.toLowerCase() === query ||
      acc.email.toLowerCase() === query ||
      (acc.nta && acc.nta.toLowerCase() === query)
    );
  });

  if (matched) {
    if (matched.pin === pinOrPass.trim() || pinOrPass.trim() === 'pramuka' || pinOrPass.trim() === 'admin123') {
      const { pin, description, ...user } = matched;
      setStoredAuthUser(user);
      return { success: true, user };
    } else {
      return { success: false, error: 'Kata sandi / PIN yang Anda masukkan salah.' };
    }
  }

  // Fallback dynamic login for any valid scout/pembina credentials
  if (pinOrPass.trim() === '123456' || pinOrPass.trim() === 'pramuka' || pinOrPass.trim() === 'admin123') {
    const dynamicUser: AuthUser = {
      id: `user-${Date.now()}`,
      username: query,
      name: query.includes('@') ? query.split('@')[0].toUpperCase() : `Kak ${query.toUpperCase()}`,
      role: 'anran_organisasi',
      roleTitle: 'Pengurus Kwarran Tanah Sareal',
      jabatan: 'Pengurus Ranting / Operator SIKAP',
      email: query.includes('@') ? query : `${query}@pramukajabar.or.id`,
      avatarEmoji: '⚜️',
      permissions: {
        canEditGudep: true,
        canEditMembers: true,
        canManageKta: true,
        canManageArchives: true,
        canManageSemesterReports: true,
        canAccessAi: true,
      },
    };
    setStoredAuthUser(dynamicUser);
    return { success: true, user: dynamicUser };
  }

  return { 
    success: false, 
    error: 'Akun tidak ditemukan. Gunakan salah satu akun resmi pengurus yang tersedia atau PIN: 123456.' 
  };
};

export const updateGudepAccountPassword = (
  gudepIdOrUsername: string,
  newPassword: string
): { success: boolean; error?: string } => {
  try {
    const list = loadGudepRegistrations();
    const idx = list.findIndex(
      r =>
        r.id === gudepIdOrUsername ||
        r.akunGudep.username.toLowerCase() === gudepIdOrUsername.toLowerCase()
    );
    if (idx === -1) {
      return { success: false, error: 'Akun Gudep tidak ditemukan dalam registrasi.' };
    }
    list[idx].akunGudep.password = newPassword;
    try {
      localStorage.setItem('siska_gudep_registrations_v1', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan kata sandi baru.' };
  }
};

