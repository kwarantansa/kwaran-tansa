import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  Plus, 
  RotateCcw, 
  Search, 
  Filter, 
  School, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Clock, 
  Mail, 
  Phone, 
  Sparkles, 
  Cloud, 
  RefreshCw, 
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Save,
  Award,
  Upload,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { compressImageFile, normalizeImageUrl } from '../utils/imageCompressor';
import { 
  AuthUser, 
  GudepRegistration, 
  Gudep, 
  Member, 
  UserRole,
  StatusVerifikasiGudep
} from '../types';
import { 
  PengurusAccountItem, 
  isSuperAdmin, 
  saveCustomPengurusList,
  updateAccountCredentials,
  resetAccountPasswordToDefault
} from '../utils/auth';
import { 
  savePengurusToCloud, 
  deletePengurusFromCloud, 
  syncAllPengurusToCloud,
  saveRegistrationToCloud,
  deleteGudepRegistrationFromCloud,
  saveMemberToCloud
} from '../services/realtimeDb';

interface AccountManagerProps {
  currentUser: AuthUser | null;
  pengurusList: PengurusAccountItem[];
  onUpdatePengurusList: (list: PengurusAccountItem[]) => void;
  registrations: GudepRegistration[];
  onUpdateRegistrations: (list: GudepRegistration[]) => void;
  gudepList: Gudep[];
  onUpdateGudepList: (list: Gudep[]) => void;
  members: Member[];
  onUpdateMembers: (list: Member[]) => void;
  onShowToast: (msg: string) => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  currentUser,
  pengurusList,
  onUpdatePengurusList,
  registrations,
  onUpdateRegistrations,
  gudepList,
  onUpdateGudepList,
  members,
  onUpdateMembers,
  onShowToast
}) => {
  // Tabs: 'all' | 'pengurus' | 'gudep' | 'members'
  const [activeTab, setActiveTab] = useState<'all' | 'pengurus' | 'gudep' | 'members'>('all');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Password visibility map (key: accountId, value: boolean)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal State: Edit Pengurus
  const [editingPengurus, setEditingPengurus] = useState<PengurusAccountItem | null>(null);
  const [pengurusForm, setPengurusForm] = useState<{
    name: string;
    username: string;
    pin: string;
    role: UserRole;
    roleTitle: string;
    jabatan: string;
    nta: string;
    email: string;
    avatarEmoji: string;
    permissions: {
      canEditGudep: boolean;
      canEditMembers: boolean;
      canManageKta: boolean;
      canManageArchives: boolean;
      canManageSemesterReports: boolean;
      canAccessAi: boolean;
      canManageUsers: boolean;
    };
  }>({
    name: '',
    username: '',
    pin: '',
    role: 'anran_organisasi',
    roleTitle: '',
    jabatan: '',
    nta: '',
    email: '',
    avatarEmoji: '⚜️',
    permissions: {
      canEditGudep: true,
      canEditMembers: true,
      canManageKta: true,
      canManageArchives: true,
      canManageSemesterReports: true,
      canAccessAi: true,
      canManageUsers: false,
    }
  });

  // Modal State: Tambah Pengurus Baru
  const [isAddPengurusOpen, setIsAddPengurusOpen] = useState(false);

  // Modal State: Edit Akun Gudep
  const [editingGudep, setEditingGudep] = useState<GudepRegistration | null>(null);
  const [gudepAccountForm, setGudepAccountForm] = useState<{
    username: string;
    password: string;
    namaPendaftar: string;
    emailPendaftar: string;
    noWaPendaftar: string;
    namaPangkalan: string;
    statusVerifikasi: StatusVerifikasiGudep;
    catatanVerifikasi: string;
  }>({
    username: '',
    password: '',
    namaPendaftar: '',
    emailPendaftar: '',
    noWaPendaftar: '',
    namaPangkalan: '',
    statusVerifikasi: 'Disetujui',
    catatanVerifikasi: ''
  });

  // Modal State: Tambah Akun Gudep Manual
  const [isAddGudepOpen, setIsAddGudepOpen] = useState(false);
  const [newGudepForm, setNewGudepForm] = useState<{
    namaPangkalan: string;
    nomorGudep: string;
    jenjang: string;
    kelurahan: string;
    username: string;
    password: string;
    namaPendaftar: string;
    emailPendaftar: string;
    noWaPendaftar: string;
  }>({
    namaPangkalan: '',
    nomorGudep: '',
    jenjang: 'SD/MI',
    kelurahan: 'Tanah Sareal',
    username: '',
    password: '',
    namaPendaftar: '',
    emailPendaftar: '',
    noWaPendaftar: ''
  });

  // Modal State: Edit Anggota
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isProcessingMemberPhoto, setIsProcessingMemberPhoto] = useState(false);
  const [memberForm, setMemberForm] = useState<{
    namaLengkap: string;
    nta: string;
    nik: string;
    jabatan: string;
    namaPangkalan: string;
    noTelepon: string;
    fotoUrl: string;
  }>({
    namaLengkap: '',
    nta: '',
    nik: '',
    jabatan: '',
    namaPangkalan: '',
    noTelepon: '',
    fotoUrl: ''
  });

  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const userIsSuper = isSuperAdmin(currentUser);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordReveal = (key: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Open Edit Pengurus Modal
  const handleOpenEditPengurus = (item: PengurusAccountItem) => {
    setEditingPengurus(item);
    setPengurusForm({
      name: item.name,
      username: item.username,
      pin: item.pin,
      role: item.role,
      roleTitle: item.roleTitle,
      jabatan: item.jabatan,
      nta: item.nta || '',
      email: item.email || '',
      avatarEmoji: item.avatarEmoji || '⚜️',
      permissions: {
        canEditGudep: item.permissions.canEditGudep,
        canEditMembers: item.permissions.canEditMembers,
        canManageKta: item.permissions.canManageKta,
        canManageArchives: item.permissions.canManageArchives,
        canManageSemesterReports: item.permissions.canManageSemesterReports,
        canAccessAi: item.permissions.canAccessAi,
        canManageUsers: item.permissions.canManageUsers ?? (item.role === 'superadmin'),
      }
    });
  };

  // Save Edit Pengurus
  const handleSavePengurus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPengurus) return;

    if (!pengurusForm.username.trim()) {
      alert('Username wajib diisi.');
      return;
    }
    if (!pengurusForm.pin.trim()) {
      alert('PIN / Kata Sandi wajib diisi.');
      return;
    }

    // Check duplicate username
    const duplicate = pengurusList.find(
      p => p.id !== editingPengurus.id && p.username.toLowerCase() === pengurusForm.username.trim().toLowerCase()
    );
    if (duplicate) {
      alert(`Username "${pengurusForm.username}" sudah digunakan oleh ${duplicate.name}. Silakan gunakan username lain.`);
      return;
    }

    const updatedItem: PengurusAccountItem = {
      ...editingPengurus,
      name: pengurusForm.name.trim(),
      username: pengurusForm.username.trim(),
      pin: pengurusForm.pin.trim(),
      role: pengurusForm.role,
      roleTitle: pengurusForm.roleTitle || editingPengurus.roleTitle,
      jabatan: pengurusForm.jabatan || editingPengurus.jabatan,
      nta: pengurusForm.nta.trim(),
      email: pengurusForm.email.trim(),
      avatarEmoji: pengurusForm.avatarEmoji || editingPengurus.avatarEmoji,
      permissions: {
        ...pengurusForm.permissions,
        canManageUsers: pengurusForm.role === 'superadmin' ? true : pengurusForm.permissions.canManageUsers,
      }
    };

    const updatedList = pengurusList.map(p => p.id === updatedItem.id ? updatedItem : p);
    onUpdatePengurusList(updatedList);
    saveCustomPengurusList(updatedList);

    try {
      await savePengurusToCloud(updatedItem);
    } catch (err) {
      console.warn('Sync to cloud error:', err);
    }

    setEditingPengurus(null);
    onShowToast(`Akun pengurus "${updatedItem.name}" berhasil diperbarui.`);
  };

  // Reset Pengurus Password to Default
  const handleResetPengurusPassword = async (item: PengurusAccountItem) => {
    const defaultPass = (item.username.toLowerCase() === 'admin' || item.username.toLowerCase() === 'superadmin' || item.role === 'superadmin')
      ? 'akhmadtaufik84@'
      : '123456';

    if (!confirm(`Reset kata sandi akun ${item.name} (${item.username}) ke kata sandi standar "${defaultPass}"?`)) {
      return;
    }

    const updatedItem: PengurusAccountItem = {
      ...item,
      pin: defaultPass
    };

    const updatedList = pengurusList.map(p => p.id === updatedItem.id ? updatedItem : p);
    onUpdatePengurusList(updatedList);
    saveCustomPengurusList(updatedList);

    try {
      await savePengurusToCloud(updatedItem);
    } catch (err) {
      console.warn('Sync error:', err);
    }

    onShowToast(`Password akun ${item.name} direset ke: ${defaultPass}`);
  };

  // Delete Pengurus Account
  const handleDeletePengurus = async (item: PengurusAccountItem) => {
    if (item.username.toLowerCase() === 'admin' || item.username.toLowerCase() === 'superadmin' || item.role === 'superadmin') {
      alert('Akun Super Administrator master tidak dapat dihapus untuk menjaga keamanan sistem.');
      return;
    }

    if (!confirm(`Hapus akun pengurus ${item.name} (${item.username}) dari sistem?`)) {
      return;
    }

    const updatedList = pengurusList.filter(p => p.id !== item.id);
    onUpdatePengurusList(updatedList);
    saveCustomPengurusList(updatedList);

    try {
      await deletePengurusFromCloud(item.id);
    } catch (err) {
      console.warn('Cloud delete error:', err);
    }

    onShowToast(`Akun pengurus "${item.name}" berhasil dihapus.`);
  };

  // Save New Pengurus Account
  const handleCreateNewPengurus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengurusForm.name.trim() || !pengurusForm.username.trim() || !pengurusForm.pin.trim()) {
      alert('Nama, Username, dan PIN wajib diisi.');
      return;
    }

    const duplicate = pengurusList.find(p => p.username.toLowerCase() === pengurusForm.username.trim().toLowerCase());
    if (duplicate) {
      alert(`Username "${pengurusForm.username}" sudah digunakan.`);
      return;
    }

    const newId = `user-${Date.now()}`;
    const newAccount: PengurusAccountItem = {
      id: newId,
      name: pengurusForm.name.trim(),
      username: pengurusForm.username.trim(),
      pin: pengurusForm.pin.trim(),
      role: pengurusForm.role,
      roleTitle: pengurusForm.roleTitle || 'Pengurus Kwarran Tanah Sareal',
      jabatan: pengurusForm.jabatan || 'Pengurus Ranting',
      nta: pengurusForm.nta.trim() || '09.02.04.001.0009',
      email: pengurusForm.email.trim() || `${pengurusForm.username.trim()}@pramukajabar.or.id`,
      avatarEmoji: pengurusForm.avatarEmoji || '⚜️',
      description: 'Akun Pengurus Ranting Tanah Sareal',
      permissions: {
        canEditGudep: pengurusForm.permissions.canEditGudep,
        canEditMembers: pengurusForm.permissions.canEditMembers,
        canManageKta: pengurusForm.permissions.canManageKta,
        canManageArchives: pengurusForm.permissions.canManageArchives,
        canManageSemesterReports: pengurusForm.permissions.canManageSemesterReports,
        canAccessAi: pengurusForm.permissions.canAccessAi,
        canManageUsers: pengurusForm.permissions.canManageUsers,
      }
    };

    const updatedList = [...pengurusList, newAccount];
    onUpdatePengurusList(updatedList);
    saveCustomPengurusList(updatedList);

    try {
      await savePengurusToCloud(newAccount);
    } catch (err) {
      console.warn('Cloud save error:', err);
    }

    setIsAddPengurusOpen(false);
    onShowToast(`Akun pengurus baru "${newAccount.name}" berhasil ditambahkan.`);
  };

  // Open Edit Gudep Account
  const handleOpenEditGudep = (reg: GudepRegistration) => {
    setEditingGudep(reg);
    setGudepAccountForm({
      username: reg.akunGudep.username || '',
      password: reg.akunGudep.password || '',
      namaPendaftar: reg.akunGudep.namaPendaftar || reg.namaPembinaPa || '',
      emailPendaftar: reg.akunGudep.emailPendaftar || '',
      noWaPendaftar: reg.akunGudep.noWaPendaftar || reg.noHpKaMabigus || '',
      namaPangkalan: reg.namaPangkalan || '',
      statusVerifikasi: reg.statusVerifikasi || 'Menunggu Verifikasi',
      catatanVerifikasi: reg.catatanVerifikasi || ''
    });
  };

  // Save Edit Gudep Account
  const handleSaveGudepAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGudep) return;

    if (!gudepAccountForm.username.trim() || !gudepAccountForm.password.trim()) {
      alert('Username dan Password akun Gudep wajib diisi.');
      return;
    }

    const updatedReg: GudepRegistration = {
      ...editingGudep,
      namaPangkalan: gudepAccountForm.namaPangkalan.trim() || editingGudep.namaPangkalan,
      statusVerifikasi: gudepAccountForm.statusVerifikasi,
      catatanVerifikasi: gudepAccountForm.catatanVerifikasi.trim(),
      diverifikasiOleh: currentUser ? currentUser.name : 'Super Administrator',
      tanggalVerifikasi: new Date().toISOString().split('T')[0],
      akunGudep: {
        ...editingGudep.akunGudep,
        username: gudepAccountForm.username.trim(),
        password: gudepAccountForm.password.trim(),
        namaPendaftar: gudepAccountForm.namaPendaftar.trim(),
        emailPendaftar: gudepAccountForm.emailPendaftar.trim(),
        noWaPendaftar: gudepAccountForm.noWaPendaftar.trim(),
      }
    };

    const updatedList = registrations.map(r => r.id === updatedReg.id ? updatedReg : r);
    onUpdateRegistrations(updatedList);

    try {
      await saveRegistrationToCloud(updatedReg);
    } catch (err) {
      console.warn('Save registration error:', err);
    }

    setEditingGudep(null);
    onShowToast(`Akun Gudep "${updatedReg.namaPangkalan}" berhasil diperbarui. Status: ${updatedReg.statusVerifikasi}`);
  };

  // Fast Toggle Gudep Verification Status
  const handleToggleGudepStatus = async (reg: GudepRegistration, newStatus: StatusVerifikasiGudep) => {
    const updatedReg: GudepRegistration = {
      ...reg,
      statusVerifikasi: newStatus,
      diverifikasiOleh: currentUser ? currentUser.name : 'Super Administrator',
      tanggalVerifikasi: new Date().toISOString().split('T')[0],
      catatanVerifikasi: newStatus === 'Disetujui' ? 'Disetujui langsung oleh Super Administrator' : reg.catatanVerifikasi
    };

    const updatedList = registrations.map(r => r.id === updatedReg.id ? updatedReg : r);
    onUpdateRegistrations(updatedList);

    try {
      await saveRegistrationToCloud(updatedReg);
    } catch (err) {
      console.warn('Toggle status error:', err);
    }

    onShowToast(`Status akun Gudep "${reg.namaPangkalan}" diubah menjadi: ${newStatus}`);
  };

  // Reset Gudep Password
  const handleResetGudepPassword = async (reg: GudepRegistration) => {
    const newPass = prompt(`Masukkan kata sandi baru untuk akun Gudep "${reg.namaPangkalan}":`, '123456');
    if (!newPass || !newPass.trim()) return;

    const updatedReg: GudepRegistration = {
      ...reg,
      akunGudep: {
        ...reg.akunGudep,
        password: newPass.trim()
      }
    };

    const updatedList = registrations.map(r => r.id === updatedReg.id ? updatedReg : r);
    onUpdateRegistrations(updatedList);

    try {
      await saveRegistrationToCloud(updatedReg);
    } catch (err) {
      console.warn('Reset password error:', err);
    }

    onShowToast(`Kata sandi akun Gudep "${reg.namaPangkalan}" direset menjadi: ${newPass.trim()}`);
  };

  // Delete Gudep Registration & Account
  const handleDeleteGudepAccount = async (reg: GudepRegistration) => {
    if (!confirm(`Hapus akun dan pendaftaran Gudep "${reg.namaPangkalan}" (${reg.akunGudep.username})?`)) {
      return;
    }

    const updatedList = registrations.filter(r => r.id !== reg.id);
    onUpdateRegistrations(updatedList);

    try {
      await deleteGudepRegistrationFromCloud(reg.id);
    } catch (err) {
      console.warn('Delete cloud error:', err);
    }

    onShowToast(`Akun Gudep "${reg.namaPangkalan}" berhasil dihapus.`);
  };

  // Create Manual Gudep Account
  const handleCreateManualGudep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGudepForm.namaPangkalan.trim() || !newGudepForm.username.trim() || !newGudepForm.password.trim()) {
      alert('Nama Pangkalan, Username, dan Password wajib diisi.');
      return;
    }

    const regId = `reg-gd-${Date.now()}`;
    const newReg: GudepRegistration = {
      id: regId,
      noRegistrasi: `REG-GD-2026-${Math.floor(100 + Math.random() * 900)}`,
      tanggalRegistrasi: new Date().toISOString().split('T')[0],
      statusVerifikasi: 'Disetujui',
      diverifikasiOleh: currentUser ? currentUser.name : 'Super Administrator',
      tanggalVerifikasi: new Date().toISOString().split('T')[0],
      nomorGudep: newGudepForm.nomorGudep.trim() || '04.000',
      noGudepPa: newGudepForm.nomorGudep.trim() || '04.000',
      noGudepPi: newGudepForm.nomorGudep.trim() ? `${newGudepForm.nomorGudep.trim()}-Pi` : '04.000-Pi',
      namaPangkalan: newGudepForm.namaPangkalan.trim(),
      jenjang: newGudepForm.jenjang as any,
      statusSekolah: 'Negeri',
      kelurahan: newGudepForm.kelurahan as any,
      alamat: 'Tanah Sareal, Kota Bogor',
      kaMabigus: newGudepForm.namaPendaftar.trim() || 'Kepala Sekolah',
      jabatanKaMabigus: 'Kepala Sekolah / Ka Mabigus',
      noHpKaMabigus: newGudepForm.noWaPendaftar.trim() || '081234567890',
      namaPembinaPa: newGudepForm.namaPendaftar.trim() || 'Pembina Gudep',
      noHpPembinaPa: newGudepForm.noWaPendaftar.trim() || '081234567890',
      kursusPembinaPa: 'KMD',
      jumlahPembinaPa: 1,
      namaPembinaPi: 'Pembina Putri',
      noHpPembinaPi: '081234567891',
      kursusPembinaPi: 'KMD',
      jumlahPembinaPi: 1,
      jumlahSiagaPa: 0,
      jumlahSiagaPi: 0,
      jumlahPenggalangPa: 0,
      jumlahPenggalangPi: 0,
      jumlahPenegakPa: 0,
      jumlahPenegakPi: 0,
      jumlahPandegaPa: 0,
      jumlahPandegaPi: 0,
      kegiatanGudep: ['Latihan Rutin'],
      prestasi3Tahun: 'Aktif membina peserta didik kepramukaan',
      saranaPrasarana: ['Ruang Sanggar', 'Tenda', 'Tongkat'],
      potensiGudep: ['Semangat kebersamaan'],
      kendalaGudep: [],
      kebutuhanPembinaan: ['KMD/KML Pembina'],
      mediaSosial: {},
      akunGudep: {
        username: newGudepForm.username.trim(),
        password: newGudepForm.password.trim(),
        namaPendaftar: newGudepForm.namaPendaftar.trim() || 'Pembina Satuan',
        noWaPendaftar: newGudepForm.noWaPendaftar.trim() || '081234567890',
        emailPendaftar: newGudepForm.emailPendaftar.trim() || `${newGudepForm.username.trim()}@gudep.id`
      }
    };

    const updatedList = [newReg, ...registrations];
    onUpdateRegistrations(updatedList);

    try {
      await saveRegistrationToCloud(newReg);
    } catch (err) {
      console.warn('Save manual reg error:', err);
    }

    setIsAddGudepOpen(false);
    onShowToast(`Akun Gudep "${newReg.namaPangkalan}" berhasil dibuat dan langsung berstatus AKTIF (Disetujui).`);
  };

  // Save Edit Member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const updated: Member = {
      ...editingMember,
      namaLengkap: memberForm.namaLengkap.trim(),
      nta: memberForm.nta.trim(),
      nik: memberForm.nik.trim(),
      jabatan: memberForm.jabatan.trim(),
      namaPangkalan: memberForm.namaPangkalan.trim(),
      noTelepon: memberForm.noTelepon.trim(),
      fotoUrl: memberForm.fotoUrl.trim() || editingMember.fotoUrl
    };

    const updatedMembers = members.map(m => m.id === updated.id ? updated : m);
    onUpdateMembers(updatedMembers);

    try {
      await saveMemberToCloud(updated);
    } catch (err) {
      console.warn('Save member error:', err);
    }

    setEditingMember(null);
    onShowToast(`Data anggota "${updated.namaLengkap}" berhasil diperbarui.`);
  };

  // Sync All Accounts to Cloud
  const handleSyncAllAccounts = async () => {
    setIsSyncingCloud(true);
    try {
      await syncAllPengurusToCloud(pengurusList);
      for (const reg of registrations) {
        await saveRegistrationToCloud(reg);
      }
      onShowToast('Seluruh akun Pengurus dan Gudep berhasil disinkronkan ke Cloud Firestore.');
    } catch (err) {
      console.warn(err);
      alert('Gagal menyinkronkan seluruh akun ke cloud.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Filtered lists
  const filteredPengurus = useMemo(() => {
    return pengurusList.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchQ = !q || (
        p.name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.roleTitle.toLowerCase().includes(q) ||
        p.jabatan.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.nta && p.nta.toLowerCase().includes(q))
      );
      const matchRole = roleFilter === 'ALL' || p.role === roleFilter;
      return matchQ && matchRole;
    });
  }, [pengurusList, searchQuery, roleFilter]);

  const filteredGudep = useMemo(() => {
    return registrations.filter(r => {
      const q = searchQuery.toLowerCase().trim();
      const matchQ = !q || (
        (r.namaPangkalan && r.namaPangkalan.toLowerCase().includes(q)) ||
        (r.noRegistrasi && r.noRegistrasi.toLowerCase().includes(q)) ||
        (r.akunGudep?.username && r.akunGudep.username.toLowerCase().includes(q)) ||
        (r.nomorGudep && r.nomorGudep.toLowerCase().includes(q)) ||
        (r.akunGudep?.namaPendaftar && r.akunGudep.namaPendaftar.toLowerCase().includes(q)) ||
        (r.akunGudep?.emailPendaftar && r.akunGudep.emailPendaftar.toLowerCase().includes(q)) ||
        (r.namaPembinaPa && r.namaPembinaPa.toLowerCase().includes(q))
      );

      let matchStatus = true;
      if (statusFilter === 'APPROVED') matchStatus = r.statusVerifikasi === 'Disetujui';
      else if (statusFilter === 'PENDING') matchStatus = r.statusVerifikasi === 'Menunggu Verifikasi';
      else if (statusFilter === 'REJECTED') matchStatus = r.statusVerifikasi === 'Ditolak';

      return matchQ && matchStatus;
    });
  }, [registrations, searchQuery, statusFilter]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        m.namaLengkap.toLowerCase().includes(q) ||
        m.nta.toLowerCase().includes(q) ||
        m.namaPangkalan.toLowerCase().includes(q) ||
        m.golongan.toLowerCase().includes(q) ||
        (m.jabatan && m.jabatan.toLowerCase().includes(q))
      );
    });
  }, [members, searchQuery]);

  // Statistics
  const totalPengurus = pengurusList.length;
  const totalGudepAccounts = registrations.length;
  const approvedGudepCount = registrations.filter(r => r.statusVerifikasi === 'Disetujui').length;
  const pendingGudepCount = registrations.filter(r => r.statusVerifikasi === 'Menunggu Verifikasi').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-[#29160E] via-[#361E13] to-[#25130B] border border-amber-600/40 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-black tracking-wide uppercase shadow">
                <ShieldAlert className="w-3.5 h-3.5 text-stone-950" />
                Pusat Kendali Super Administrator
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Real-time Firestore Connected
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
              Manajemen & Hak Akses Semua Akun
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Tinjau, sesuaikan peran, atur izin akses, serta kelola username dan kata sandi seluruh akun Pengurus Ranting, Akun Gugus Depan pangkalan, dan data Anggota se-Kwartir Ranting Tanah Sareal.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setIsAddPengurusOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all border border-amber-300"
            >
              <Plus className="w-4 h-4" />
              <span>+ Akun Pengurus</span>
            </button>

            <button
              onClick={() => setIsAddGudepOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#3E2216] hover:bg-[#4E2B1C] text-stone-100 font-bold text-xs shadow-md transition-all border border-amber-500/30"
            >
              <School className="w-4 h-4 text-amber-400" />
              <span>+ Buat Akun Gudep</span>
            </button>

            <button
              onClick={handleSyncAllAccounts}
              disabled={isSyncingCloud}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1A0C06] hover:bg-[#28140B] text-amber-300 font-semibold text-xs transition-all border border-amber-500/30 disabled:opacity-50"
              title="Sinkronkan seluruh akun ke Cloud Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>{isSyncingCloud ? 'Menyinkronkan...' : 'Sinkron Cloud'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-amber-500/20">
          <div className="bg-[#1C0D07]/80 rounded-2xl p-3.5 border border-[#3E2216]">
            <p className="text-[10px] text-stone-400 uppercase font-mono font-semibold">Total Semua Akun</p>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              {totalPengurus + totalGudepAccounts}
            </p>
            <p className="text-[10px] text-stone-400 mt-0.5">Pengurus & Gudep Terdaftar</p>
          </div>

          <div className="bg-[#1C0D07]/80 rounded-2xl p-3.5 border border-[#3E2216]">
            <p className="text-[10px] text-stone-400 uppercase font-mono font-semibold">Akun Pengurus</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {totalPengurus}
            </p>
            <p className="text-[10px] text-amber-300 mt-0.5">1 Superadmin Master</p>
          </div>

          <div className="bg-[#1C0D07]/80 rounded-2xl p-3.5 border border-[#3E2216]">
            <p className="text-[10px] text-stone-400 uppercase font-mono font-semibold">Akun Gudep Aktif</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              {approvedGudepCount}
            </p>
            <p className="text-[10px] text-stone-400 mt-0.5">Dapat login mandiri</p>
          </div>

          <div className="bg-[#1C0D07]/80 rounded-2xl p-3.5 border border-[#3E2216]">
            <p className="text-[10px] text-stone-400 uppercase font-mono font-semibold">Gudep Menunggu</p>
            <p className="text-xl sm:text-2xl font-black text-orange-400 mt-1">
              {pendingGudepCount}
            </p>
            <p className="text-[10px] text-stone-400 mt-0.5">Perlu verifikasi akses</p>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-[#29160E] text-amber-400 shadow'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>Semua Akun</span>
            <span className="px-1.5 py-0.2 rounded-md bg-stone-700 text-stone-200 text-[10px] font-mono">
              {totalPengurus + totalGudepAccounts}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pengurus')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pengurus'
                ? 'bg-[#29160E] text-amber-400 shadow'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Akun Pengurus Kwarran</span>
            <span className="px-1.5 py-0.2 rounded-md bg-stone-700 text-stone-200 text-[10px] font-mono">
              {totalPengurus}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gudep')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'gudep'
                ? 'bg-[#29160E] text-amber-400 shadow'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <School className="w-3.5 h-3.5 text-amber-400" />
            <span>Akun Gugus Depan & Pangkalan</span>
            <span className="px-1.5 py-0.2 rounded-md bg-stone-700 text-stone-200 text-[10px] font-mono">
              {totalGudepAccounts}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'members'
                ? 'bg-[#29160E] text-amber-400 shadow'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Buku Induk Anggota (NTA)</span>
            <span className="px-1.5 py-0.2 rounded-md bg-stone-700 text-stone-200 text-[10px] font-mono">
              {members.length}
            </span>
          </button>
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, username, pangkalan, NTA..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: AKUN PENGURUS KWARRAN */}
      {(activeTab === 'all' || activeTab === 'pengurus') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-base font-extrabold text-stone-900 font-sans">
                Akun Pengurus Ranting & Administrator ({filteredPengurus.length})
              </h2>
            </div>

            <button
              onClick={() => setIsAddPengurusOpen(true)}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pengurus</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPengurus.map((acc) => {
              const isSuper = acc.username.toLowerCase() === 'admin' || acc.username.toLowerCase() === 'superadmin' || acc.role === 'superadmin';
              const isRevealed = !!revealedPasswords[acc.id];
              return (
                <div
                  key={acc.id}
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                    isSuper 
                      ? 'border-amber-400 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30' 
                      : 'border-stone-200'
                  }`}
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm border ${
                          isSuper 
                            ? 'bg-amber-500 text-stone-950 border-amber-400' 
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}>
                          {acc.avatarEmoji || '⚜️'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs font-bold text-stone-900 leading-tight">
                              {acc.name}
                            </h3>
                            {isSuper && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[9px] font-black uppercase tracking-wider">
                                Superadmin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                            {acc.roleTitle}
                          </p>
                          <p className="text-[10px] text-stone-500">
                            {acc.jabatan}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Credentials Info Box */}
                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2 text-xs mb-4">
                      {/* Username */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-stone-500 font-medium">Username:</span>
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-bold text-stone-900 bg-stone-200/70 px-2 py-0.5 rounded text-[11px]">
                            {acc.username}
                          </code>
                          <button
                            onClick={() => handleCopy(acc.username, `user-${acc.id}`)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded"
                            title="Salin Username"
                          >
                            {copiedKey === `user-${acc.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Password / PIN */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-stone-500 font-medium">Kata Sandi:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-stone-800 font-bold bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                            {isRevealed ? acc.pin : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordReveal(acc.id)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded"
                            title={isRevealed ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopy(acc.pin, `pin-${acc.id}`)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded"
                            title="Salin Kata Sandi"
                          >
                            {copiedKey === `pin-${acc.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* NTA / Email */}
                      {(acc.nta || acc.email) && (
                        <div className="pt-1.5 border-t border-stone-200 flex flex-col gap-1 text-[10px] text-stone-500">
                          {acc.nta && <span>NTA: <strong className="text-stone-700">{acc.nta}</strong></span>}
                          {acc.email && <span className="truncate">Email: <strong className="text-stone-700">{acc.email}</strong></span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEditPengurus(acc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit Akun</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleResetPengurusPassword(acc)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-stone-100 transition-colors"
                        title="Reset password ke default"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {!isSuper && (
                        <button
                          onClick={() => handleDeletePengurus(acc)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Hapus akun pengurus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: AKUN GUGUS DEPAN & PANGKALAN */}
      {(activeTab === 'all' || activeTab === 'gudep') && (
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="text-base font-extrabold text-stone-900 font-sans">
                Akun Gugus Depan & Pangkalan ({filteredGudep.length})
              </h2>
            </div>

            {/* Filter status buttons */}
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === 'ALL' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'text-stone-500'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === 'APPROVED' ? 'bg-emerald-600 text-white shadow-sm font-bold' : 'text-stone-500'
                }`}
              >
                Disetujui ({approvedGudepCount})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === 'PENDING' ? 'bg-orange-500 text-white shadow-sm font-bold' : 'text-stone-500'
                }`}
              >
                Menunggu ({pendingGudepCount})
              </button>
            </div>
          </div>

          {filteredGudep.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-3">
              <School className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500">
                Tidak ada akun Gugus Depan yang cocok dengan kriteria pencarian.
              </p>
              <button
                onClick={() => setIsAddGudepOpen(true)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Akun Gudep Baru</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGudep.map((reg) => {
                const isRevealed = !!revealedPasswords[reg.id];
                const isApproved = reg.statusVerifikasi === 'Disetujui';
                const isPending = reg.statusVerifikasi === 'Menunggu Verifikasi';
                const isRejected = reg.statusVerifikasi === 'Ditolak';

                return (
                  <div
                    key={reg.id}
                    className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Gudep Badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                              {reg.nomorGudep || 'Gudep'}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                              isApproved 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : isPending 
                                ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' 
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                              {reg.statusVerifikasi}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-stone-900 mt-1">
                            {reg.namaPangkalan}
                          </h3>
                          <p className="text-[11px] text-stone-500">
                            Kelurahan {reg.kelurahan} • {reg.jenjang}
                          </p>
                        </div>
                      </div>

                      {/* Credentials Box */}
                      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2 text-xs mb-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-stone-500 font-medium">Username Login:</span>
                          <div className="flex items-center gap-1.5">
                            <code className="font-mono font-bold text-stone-900 bg-stone-200/70 px-2 py-0.5 rounded text-[11px]">
                              {reg.akunGudep.username}
                            </code>
                            <button
                              onClick={() => handleCopy(reg.akunGudep.username, `gudep-user-${reg.id}`)}
                              className="p-1 text-stone-400 hover:text-stone-700 rounded"
                              title="Salin Username"
                            >
                              {copiedKey === `gudep-user-${reg.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-stone-500 font-medium">Kata Sandi:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-stone-800 font-bold bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                              {isRevealed ? reg.akunGudep.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordReveal(reg.id)}
                              className="p-1 text-stone-400 hover:text-stone-700 rounded"
                              title={isRevealed ? 'Sembunyikan' : 'Lihat Sandi'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(reg.akunGudep.password, `gudep-pin-${reg.id}`)}
                              className="p-1 text-stone-400 hover:text-stone-700 rounded"
                              title="Salin Sandi"
                            >
                              {copiedKey === `gudep-pin-${reg.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-200 space-y-1 text-[11px] text-stone-600">
                          <p>
                            Pembina / Kontak: <strong className="text-stone-800">{reg.akunGudep.namaPendaftar || reg.namaPembinaPa}</strong>
                          </p>
                          {reg.akunGudep.noWaPendaftar && (
                            <p className="flex items-center gap-1 text-stone-500">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{reg.akunGudep.noWaPendaftar}</span>
                            </p>
                          )}
                          {reg.akunGudep.emailPendaftar && (
                            <p className="flex items-center gap-1 text-stone-500 truncate">
                              <Mail className="w-3 h-3 text-amber-600" />
                              <span className="truncate">{reg.akunGudep.emailPendaftar}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-stone-100 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenEditGudep(reg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Edit Akun</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleResetGudepPassword(reg)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-stone-100 transition-colors"
                            title="Reset password Gudep"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteGudepAccount(reg)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Hapus akun Gudep"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Approval button if pending */}
                      {isPending && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleToggleGudepStatus(reg, 'Disetujui')}
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Setujui & Aktifkan</span>
                          </button>
                          <button
                            onClick={() => handleToggleGudepStatus(reg, 'Ditolak')}
                            className="py-1.5 px-2.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-[11px] font-bold"
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: BUKU INDUK ANGGOTA (NTA) */}
      {(activeTab === 'all' || activeTab === 'members') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h2 className="text-base font-extrabold text-stone-900 font-sans">
                Ringkasan Profil Anggota & NTA Terdaftar ({filteredMembers.length})
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] font-mono">
                  <tr>
                    <th className="py-3 px-4">Nama Lengkap & NTA</th>
                    <th className="py-3 px-4">Pangkalan / Gudep</th>
                    <th className="py-3 px-4">Golongan / Tingkatan</th>
                    <th className="py-3 px-4">Status KTA</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredMembers.slice(0, 15).map((m) => (
                    <tr key={m.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{m.namaLengkap}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{m.nta}</div>
                      </td>
                      <td className="py-3 px-4 text-stone-700">
                        {m.namaPangkalan}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">
                          {m.golongan} - {m.tingkatan}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          m.statusKta === 'Sudah Terbit' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {m.statusKta}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditingMember(m);
                            setMemberForm({
                              namaLengkap: m.namaLengkap,
                              nta: m.nta,
                              nik: m.nik || '',
                              jabatan: m.jabatan || '',
                              namaPangkalan: m.namaPangkalan,
                              noTelepon: m.noTelepon || '',
                              fotoUrl: m.fotoUrl || ''
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-amber-700" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMembers.length > 15 && (
              <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-xs text-stone-500">
                Menampilkan 15 dari {filteredMembers.length} anggota. Buka tab <strong>Buku Induk Anggota</strong> untuk manajemen lengkap seluruh data.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT PENGURUS */}
      {editingPengurus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#29160E] p-5 text-white flex items-center justify-between border-b border-[#3D2115]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base">Edit Akun Pengurus</h3>
                  <p className="text-xs text-stone-300">Sesuaikan username, kata sandi, jabatan, dan hak akses.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPengurus(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePengurus} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={pengurusForm.name}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={pengurusForm.username}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kata Sandi / PIN Baru</label>
                  <input
                    type="text"
                    required
                    value={pengurusForm.pin}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, pin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-amber-50/60 border-amber-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold text-amber-950"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Gunakan sandi yang aman. Superadmin default: <code>akhmadtaufik84@</code>
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Peran / Role</label>
                  <select
                    value={pengurusForm.role}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  >
                    <option value="superadmin">⚡ Super Administrator (Akses Penuh)</option>
                    <option value="ketua_kwarran">⚜️ Ketua Kwarran</option>
                    <option value="sekretaris_kwarran">📑 Sekretaris Kwarran</option>
                    <option value="anran_binawasa">🎖️ Anran Bina Wasa</option>
                    <option value="anran_binamuda">⛺ Anran Bina Muda</option>
                    <option value="anran_organisasi">🏛️ Anran Organisasi / Operator</option>
                    <option value="pembina_gudep">🏫 Pembina Gudep Pangkalan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Jabatan Resmi</label>
                  <input
                    type="text"
                    value={pengurusForm.jabatan}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, jabatan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nomor Tanda Anggota (NTA)</label>
                  <input
                    type="text"
                    value={pengurusForm.nta}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, nta: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={pengurusForm.email}
                  onChange={(e) => setPengurusForm({ ...pengurusForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Permissions Checklist */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block font-bold text-stone-800 mb-2">Hak Akses & Otoritas Sistem:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pengurusForm.permissions.canEditGudep}
                      onChange={(e) => setPengurusForm({
                        ...pengurusForm,
                        permissions: { ...pengurusForm.permissions, canEditGudep: e.target.checked }
                      })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Kelola Gugus Depan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pengurusForm.permissions.canEditMembers}
                      onChange={(e) => setPengurusForm({
                        ...pengurusForm,
                        permissions: { ...pengurusForm.permissions, canEditMembers: e.target.checked }
                      })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Kelola Buku Induk & NTA</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pengurusForm.permissions.canManageKta}
                      onChange={(e) => setPengurusForm({
                        ...pengurusForm,
                        permissions: { ...pengurusForm.permissions, canManageKta: e.target.checked }
                      })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Kelola KTA Kolektif</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pengurusForm.permissions.canManageArchives}
                      onChange={(e) => setPengurusForm({
                        ...pengurusForm,
                        permissions: { ...pengurusForm.permissions, canManageArchives: e.target.checked }
                      })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Kelola Arsip Kwarran</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pengurusForm.permissions.canManageSemesterReports}
                      onChange={(e) => setPengurusForm({
                        ...pengurusForm,
                        permissions: { ...pengurusForm.permissions, canManageSemesterReports: e.target.checked }
                      })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Kelola Laporan Semester</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pengurusForm.permissions.canManageUsers}
                      onChange={(e) => setPengurusForm({
                        ...pengurusForm,
                        permissions: { ...pengurusForm.permissions, canManageUsers: e.target.checked }
                      })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-bold text-amber-900">Kelola Seluruh Akun (Superadmin)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPengurus(null)}
                  className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH PENGURUS BARU */}
      {isAddPengurusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#29160E] p-5 text-white flex items-center justify-between border-b border-[#3D2115]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold">
                  <Plus className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base">Tambah Akun Pengurus Baru</h3>
                  <p className="text-xs text-stone-300">Buat akun login baru untuk pengurus Kwartir Ranting.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPengurusOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPengurus} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nama Lengkap Pengurus</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kak Budi Santoso, S.Pd."
                    value={pengurusForm.name}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: budi.organisasi"
                    value={pengurusForm.username}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">PIN / Kata Sandi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 123456"
                    value={pengurusForm.pin}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, pin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-amber-50/60 border-amber-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Peran / Jabatan</label>
                  <select
                    value={pengurusForm.role}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  >
                    <option value="anran_organisasi">🏛️ Andalan Ranting Organisasi</option>
                    <option value="anran_binamuda">⛺ Andalan Ranting Bina Muda</option>
                    <option value="anran_binawasa">🎖️ Andalan Ranting Bina Wasa</option>
                    <option value="sekretaris_kwarran">📑 Sekretaris Kwarran</option>
                    <option value="ketua_kwarran">⚜️ Ketua Kwarran</option>
                    <option value="pembina_gudep">🏫 Pembina Gugus Depan</option>
                    <option value="superadmin">⚡ Super Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Jabatan Spesifik</label>
                  <input
                    type="text"
                    placeholder="Contoh: Andalan Ranting Urusan Humas"
                    value={pengurusForm.jabatan}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, jabatan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">NTA (Opsional)</label>
                  <input
                    type="text"
                    placeholder="09.02.04..."
                    value={pengurusForm.nta}
                    onChange={(e) => setPengurusForm({ ...pengurusForm, nta: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="pengurus@pramukajabar.or.id"
                  value={pengurusForm.email}
                  onChange={(e) => setPengurusForm({ ...pengurusForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddPengurusOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan Akun Pengurus</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT AKUN GUGUS DEPAN */}
      {editingGudep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#29160E] p-5 text-white flex items-center justify-between border-b border-[#3D2115]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-600 text-white font-bold">
                  <School className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base">Edit Akun Gugus Depan & Pangkalan</h3>
                  <p className="text-xs text-stone-300">{editingGudep.namaPangkalan} ({editingGudep.nomorGudep})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingGudep(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGudepAccount} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Username Login Gudep</label>
                  <input
                    type="text"
                    required
                    value={gudepAccountForm.username}
                    onChange={(e) => setGudepAccountForm({ ...gudepAccountForm, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kata Sandi Akun</label>
                  <input
                    type="text"
                    required
                    value={gudepAccountForm.password}
                    onChange={(e) => setGudepAccountForm({ ...gudepAccountForm, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-amber-50/60 border-amber-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold text-amber-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Pangkalan Sekolah</label>
                <input
                  type="text"
                  required
                  value={gudepAccountForm.namaPangkalan}
                  onChange={(e) => setGudepAccountForm({ ...gudepAccountForm, namaPangkalan: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nama Pembina / Pendaftar</label>
                  <input
                    type="text"
                    value={gudepAccountForm.namaPendaftar}
                    onChange={(e) => setGudepAccountForm({ ...gudepAccountForm, namaPendaftar: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={gudepAccountForm.noWaPendaftar}
                    onChange={(e) => setGudepAccountForm({ ...gudepAccountForm, noWaPendaftar: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Email Pendaftar</label>
                <input
                  type="email"
                  value={gudepAccountForm.emailPendaftar}
                  onChange={(e) => setGudepAccountForm({ ...gudepAccountForm, emailPendaftar: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Status Verifikasi */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block font-bold text-stone-800 mb-1.5">Status Verifikasi Akun Gudep</label>
                <select
                  value={gudepAccountForm.statusVerifikasi}
                  onChange={(e) => setGudepAccountForm({ ...gudepAccountForm, statusVerifikasi: e.target.value as StatusVerifikasiGudep })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                >
                  <option value="Disetujui">✅ Disetujui (Akun Aktif & Dapat Login Mandiri)</option>
                  <option value="Menunggu Verifikasi">⏳ Menunggu Verifikasi (Belum Dapat Login)</option>
                  <option value="Ditolak">❌ Ditolak (Akses Ditangguhkan)</option>
                </select>
                <p className="text-[10px] text-stone-500 mt-1">
                  Pilih "Disetujui" agar akun pangkalan langsung bisa masuk ke Dashboard Gudep untuk mendata siswa.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Catatan Verifikasi (Opsional)</label>
                <textarea
                  rows={2}
                  value={gudepAccountForm.catatanVerifikasi}
                  onChange={(e) => setGudepAccountForm({ ...gudepAccountForm, catatanVerifikasi: e.target.value })}
                  placeholder="Catatan untuk pangkalan gudep..."
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingGudep(null)}
                  className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Akun Gudep</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: BUAT AKUN GUGUS DEPAN MANUAL */}
      {isAddGudepOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#29160E] p-5 text-white flex items-center justify-between border-b border-[#3D2115]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold">
                  <School className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base">Buat Akun Gudep Manual</h3>
                  <p className="text-xs text-stone-300">Buatkan akun login langsung untuk pangkalan sekolah.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddGudepOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualGudep} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nama Pangkalan Sekolah</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SDN Kebon Pedes 1"
                    value={newGudepForm.namaPangkalan}
                    onChange={(e) => setNewGudepForm({ ...newGudepForm, namaPangkalan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nomor Gudep</label>
                  <input
                    type="text"
                    placeholder="Contoh: 04.071 - 04.072"
                    value={newGudepForm.nomorGudep}
                    onChange={(e) => setNewGudepForm({ ...newGudepForm, nomorGudep: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Jenjang Sekolah</label>
                  <select
                    value={newGudepForm.jenjang}
                    onChange={(e) => setNewGudepForm({ ...newGudepForm, jenjang: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="SD/MI">SD / MI</option>
                    <option value="SMP/MTs">SMP / MTs</option>
                    <option value="SMA/SMK/MA">SMA / SMK / MA</option>
                    <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                    <option value="Komunitas/Wilayah">Komunitas / Wilayah</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kelurahan</label>
                  <select
                    value={newGudepForm.kelurahan}
                    onChange={(e) => setNewGudepForm({ ...newGudepForm, kelurahan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Kebon Pedes">Kebon Pedes</option>
                    <option value="Kedung Badak">Kedung Badak</option>
                    <option value="Kedung Jaya">Kedung Jaya</option>
                    <option value="Kedung Waringin">Kedung Waringin</option>
                    <option value="Tanah Sareal">Tanah Sareal</option>
                    <option value="Sukadamai">Sukadamai</option>
                    <option value="Sukaresmi">Sukaresmi</option>
                    <option value="Cibadak">Cibadak</option>
                    <option value="Kayumanis">Kayumanis</option>
                    <option value="Mekarwangi">Mekarwangi</option>
                    <option value="Kencana">Kencana</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-stone-200">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Username Akun Login</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: sdnkebonpedes1"
                    value={newGudepForm.username}
                    onChange={(e) => setNewGudepForm({ ...newGudepForm, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kata Sandi / PIN</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 123456"
                    value={newGudepForm.password}
                    onChange={(e) => setNewGudepForm({ ...newGudepForm, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-amber-50/60 border-amber-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold text-amber-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nama Pembina / Petugas</label>
                  <input
                    type="text"
                    placeholder="Nama Pembina Gudep"
                    value={newGudepForm.namaPendaftar}
                    onChange={(e) => setNewGudepForm({ ...newGudepForm, namaPendaftar: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={newGudepForm.noWaPendaftar}
                    onChange={(e) => setNewGudepForm({ ...newGudepForm, noWaPendaftar: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddGudepOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Buat & Aktifkan Akun Gudep</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT ANGGOTA */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#29160E] p-5 text-white flex items-center justify-between border-b border-[#3D2115]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base">Edit Data Anggota</h3>
                  <p className="text-xs text-stone-300">{editingMember.namaLengkap}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={memberForm.namaLengkap}
                  onChange={(e) => setMemberForm({ ...memberForm, namaLengkap: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">NTA Pramuka</label>
                  <input
                    type="text"
                    required
                    value={memberForm.nta}
                    onChange={(e) => setMemberForm({ ...memberForm, nta: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">NIK (KTP/KK)</label>
                  <input
                    type="text"
                    value={memberForm.nik}
                    onChange={(e) => setMemberForm({ ...memberForm, nik: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Pangkalan / Gudep</label>
                <input
                  type="text"
                  required
                  value={memberForm.namaPangkalan}
                  onChange={(e) => setMemberForm({ ...memberForm, namaPangkalan: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Jabatan di Satuan</label>
                  <input
                    type="text"
                    value={memberForm.jabatan}
                    onChange={(e) => setMemberForm({ ...memberForm, jabatan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">No. Telepon / WA</label>
                  <input
                    type="text"
                    value={memberForm.noTelepon}
                    onChange={(e) => setMemberForm({ ...memberForm, noTelepon: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <label className="block font-bold text-stone-800 text-xs">
                  Foto Profil / Pasfoto Anggota
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-16 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 flex-shrink-0 relative">
                    <img
                      src={memberForm.fotoUrl || editingMember.fotoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=face'}
                      alt="Pasfoto"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=face';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-sm">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{isProcessingMemberPhoto ? 'Memproses...' : 'Upload Foto dari Device'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isProcessingMemberPhoto}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setIsProcessingMemberPhoto(true);
                              const optimizedDataUrl = await compressImageFile(file, 480, 560, 0.88);
                              setMemberForm(prev => ({ ...prev, fotoUrl: optimizedDataUrl }));
                            } catch (err) {
                              console.error('Error uploading photo:', err);
                            } finally {
                              setIsProcessingMemberPhoto(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-stone-500">
                      Pilih dari galeri/kamera HP atau laptop. Otomatis disesuaikan rasio pasfoto KTA.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Anggota</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
