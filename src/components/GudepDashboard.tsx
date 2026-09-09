import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Award,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Instagram,
  Facebook,
  Video,
  CheckCircle2,
  Printer,
  Download,
  Plus,
  Search,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  ExternalLink,
  Info,
  Check,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  QrCode,
  Trash2,
  X,
  Edit3,
  Pencil,
  FileText
} from 'lucide-react';
import {
  AuthUser,
  GudepRegistration,
  Gudep,
  Member,
  CollectiveKtaBatch,
  GolonganPramuka,
  TingkatanPramuka,
  GudepActivityReport
} from '../types';
import { KtaCard } from './KtaCard';
import { EditGudepProfileModal } from './EditGudepProfileModal';
import { EditMemberModal } from './EditMemberModal';
import { GudepActivityReportModal } from './GudepActivityReportModal';
import { loadGudepActivityReports, saveGudepActivityReports } from '../utils/storage';
import confetti from 'canvas-confetti';

interface GudepDashboardProps {
  currentUser: AuthUser;
  registration?: GudepRegistration;
  gudep?: Gudep;
  members: Member[];
  batches: CollectiveKtaBatch[];
  onSaveMember: (member: Member) => Promise<void>;
  onDeleteMember?: (memberId: string) => Promise<void>;
  onSaveBatch: (batch: CollectiveKtaBatch) => Promise<void>;
  onLogout: () => void;
  onSwitchToPublic: () => void;
  onUpdatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  onSaveRegistration?: (updatedRegistration: GudepRegistration) => Promise<void>;
}

export const GudepDashboard: React.FC<GudepDashboardProps> = ({
  currentUser,
  registration,
  gudep,
  members,
  batches,
  onSaveMember,
  onDeleteMember,
  onSaveBatch,
  onLogout,
  onSwitchToPublic,
  onUpdatePassword,
  onSaveRegistration
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'anggota' | 'kta' | 'laporan' | 'keamanan'>('profil');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedGolongan, setSelectedGolongan] = useState<string>('ALL');
  const [selectedKtaMember, setSelectedKtaMember] = useState<Member | null>(null);
  
  // Modals state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);

  // Gudep Activity Reports state
  const [activityReports, setActivityReports] = useState<GudepActivityReport[]>(() => loadGudepActivityReports());
  const [isActivityReportModalOpen, setIsActivityReportModalOpen] = useState(false);
  const [editingActivityReport, setEditingActivityReport] = useState<GudepActivityReport | null>(null);
  const [reportCategoryFilter, setReportCategoryFilter] = useState<string>('ALL');

  // Password state
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isSavingPass, setIsSavingPass] = useState(false);

  // New Member Form state
  const [newMemberForm, setNewMemberForm] = useState({
    namaLengkap: '',
    nik: '',
    jenisKelamin: 'L' as 'L' | 'P',
    tempatLahir: 'Bogor',
    tanggalLahir: '2012-05-15',
    golongan: 'Penggalang' as GolonganPramuka,
    tingkatan: 'Ramu' as TingkatanPramuka,
    alamatRumah: 'Tanah Sareal, Kota Bogor',
    noTelepon: ''
  });

  // Batch KTA Form state
  const [selectedMemberIdsForBatch, setSelectedMemberIdsForBatch] = useState<string[]>([]);
  const [batchNote, setBatchNote] = useState('');

  // Target Pangkalan Data (from registration or gudep or currentUser)
  const pangkalanName = registration?.namaPangkalan || gudep?.namaPangkalan || currentUser.namaPangkalan || 'Gugus Depan Tanah Sareal';
  const nomorGudep = registration?.nomorGudep || (gudep ? `${gudep.noGudepPa} / ${gudep.noGudepPi}` : '04.071 / 04.072');
  const noGudepPa = registration?.noGudepPa || gudep?.noGudepPa || '04.071';
  const noGudepPi = registration?.noGudepPi || gudep?.noGudepPi || '04.072';
  const kelurahan = registration?.kelurahan || gudep?.kelurahan || currentUser.kelurahan || 'Tanah Sareal';
  const alamat = registration?.alamat || gudep?.alamat || 'Kecamatan Tanah Sareal, Kota Bogor';
  const kaMabigus = registration?.kaMabigus || gudep?.kaMabigus || 'Kepala Pangkalan';
  const noHpMabigus = registration?.noHpKaMabigus || gudep?.kontakHp || '';
  const pembinaPa = registration?.namaPembinaPa || gudep?.pembinaGudepPa || 'Pembina Satuan Putra';
  const ntaPembinaPa = registration?.ntaPembinaPa || '09.02.04.071.0001';
  const noHpPembinaPa = registration?.noHpPembinaPa || '';
  const pembinaPi = registration?.namaPembinaPi || gudep?.pembinaGudepPi || 'Pembina Satuan Putri';
  const ntaPembinaPi = registration?.ntaPembinaPi || '09.02.04.072.0001';
  const noHpPembinaPi = registration?.noHpPembinaPi || '';

  const effectiveRegistration: GudepRegistration = useMemo(() => {
    if (registration) return registration;
    return {
      id: gudep?.id || 'gudep-' + (currentUser.gudepId || 'active'),
      namaPangkalan: pangkalanName,
      nomorGudepPa: noGudepPa,
      nomorGudepPi: noGudepPi,
      jenjang: (gudep?.jenjang as any) || 'SMP',
      alamat: alamat,
      kelurahan: kelurahan,
      kamabigus: kamabigus,
      pembinaPutra: pembinaPa,
      pembinaPutri: pembinaPi,
      namaPembinaPa: pembinaPa,
      namaPembinaPi: pembinaPi,
      ntaPembinaPa: ntaPembinaPa,
      ntaPembinaPi: ntaPembinaPi,
      noHpMabigus: '',
      noHpPembinaPa: noHpPembinaPa,
      noHpPembinaPi: noHpPembinaPi,
      emailPangkalan: emailPangkalan,
      status: 'APPROVED',
      tanggalPengajuan: '2026-08-01',
      tanggalVerifikasi: '2026-08-12',
      diverifikasiOleh: 'Kak Drs. H. Suryadi, M.Pd.',
      noRegistrasi: 'REG-GD-2026-002',
      catatanVerifikasi: 'Terdaftar Resmi di Kwartir Ranting Tanah Sareal',
      jumlahAnggotaPa: gudep?.jumlahAnggotaPa || 0,
      jumlahAnggotaPi: gudep?.jumlahAnggotaPi || 0,
      saranaPrasarana: ['Tenda Regu', 'Peralatan Pionering', 'Sanggar Pramuka', 'Kotak P3K Lengkap'],
      mediaSosial: {
        instagram: '@pramuka_' + pangkalanName.toLowerCase().replace(/[^a-z0-9]/g, '_')
      }
    };
  }, [registration, gudep, currentUser, pangkalanName, noGudepPa, noGudepPi, alamat, kelurahan, kamabigus, pembinaPa, pembinaPi, ntaPembinaPa, ntaPembinaPi, noHpPembinaPa, noHpPembinaPi, emailPangkalan]);

  // Filter members belonging to this pangkalan
  const gudepMembers = useMemo(() => {
    return members.filter(m => {
      const matchPangkalan = m.namaPangkalan.toLowerCase() === pangkalanName.toLowerCase() ||
        (m.gudepId && registration && m.gudepId === registration.id) ||
        (m.gudepId && gudep && m.gudepId === gudep.id) ||
        (m.noGudep && (m.noGudep.includes(noGudepPa) || m.noGudep.includes(noGudepPi)));
      return matchPangkalan;
    });
  }, [members, pangkalanName, registration, gudep, noGudepPa, noGudepPi]);

  // Filtered members by search and golongan
  const displayedMembers = useMemo(() => {
    return gudepMembers.filter(m => {
      const matchQuery = !memberSearchQuery || 
        m.namaLengkap.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        m.nta.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        (m.nik && m.nik.includes(memberSearchQuery));
      const matchGolongan = selectedGolongan === 'ALL' || m.golongan === selectedGolongan;
      return matchQuery && matchGolongan;
    });
  }, [gudepMembers, memberSearchQuery, selectedGolongan]);

  // Statistics for this Gudep
  const stats = useMemo(() => {
    const siaga = gudepMembers.filter(m => m.golongan === 'Siaga').length;
    const penggalang = gudepMembers.filter(m => m.golongan === 'Penggalang').length;
    const penegak = gudepMembers.filter(m => m.golongan === 'Penegak').length;
    const pandega = gudepMembers.filter(m => m.golongan === 'Pandega').length;
    const pembina = gudepMembers.filter(m => m.golongan === 'Pembina').length;
    const ktaTerbit = gudepMembers.filter(m => m.statusKta === 'Terbit').length;
    return {
      total: gudepMembers.length,
      siaga: (registration?.jumlahSiagaPa || 0) + (registration?.jumlahSiagaPi || 0) + siaga,
      penggalang: (registration?.jumlahPenggalangPa || 0) + (registration?.jumlahPenggalangPi || 0) + penggalang,
      penegak: (registration?.jumlahPenegakPa || 0) + (registration?.jumlahPenegakPi || 0) + penegak,
      pandega: (registration?.jumlahPandegaPa || 0) + (registration?.jumlahPandegaPi || 0) + pandega,
      pembina: (registration?.jumlahPembinaPa || 0) + (registration?.jumlahPembinaPi || 0) + (pembina || 2),
      ktaTerbit
    };
  }, [gudepMembers, registration]);

  // Filter batches belonging to this Gudep
  const gudepBatches = useMemo(() => {
    return batches.filter(b => 
      b.namaPangkalan.toLowerCase() === pangkalanName.toLowerCase() ||
      (registration && b.gudepId === registration.id)
    );
  }, [batches, pangkalanName, registration]);

  // Filter activity reports for this Gudep
  const gudepActivityReports = useMemo(() => {
    return activityReports.filter(r => 
      (registration && r.pangkalanId === registration.id) ||
      r.namaPangkalan.toLowerCase() === pangkalanName.toLowerCase() ||
      (r.nomorGudep && (r.nomorGudep.includes(noGudepPa) || r.nomorGudep.includes(noGudepPi)))
    );
  }, [activityReports, registration, pangkalanName, noGudepPa, noGudepPi]);

  const filteredActivityReports = useMemo(() => {
    if (reportCategoryFilter === 'ALL') return gudepActivityReports;
    return gudepActivityReports.filter(r => r.kategori === reportCategoryFilter);
  }, [gudepActivityReports, reportCategoryFilter]);

  const handleSaveActivityReport = async (report: GudepActivityReport) => {
    const exists = activityReports.some(r => r.id === report.id);
    let updated: GudepActivityReport[];
    if (exists) {
      updated = activityReports.map(r => r.id === report.id ? report : r);
    } else {
      updated = [report, ...activityReports];
    }
    setActivityReports(updated);
    saveGudepActivityReports(updated);
  };

  const handleDeleteActivityReport = (id: string) => {
    if (window.confirm('Hapus catatan / laporan kegiatan ini?')) {
      const updated = activityReports.filter(r => r.id !== id);
      setActivityReports(updated);
      saveGudepActivityReports(updated);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.namaLengkap.trim()) return;

    const noGudepSelected = newMemberForm.jenisKelamin === 'L' ? noGudepPa : noGudepPi;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ntaNew = `09.02.04.${noGudepSelected.replace('.', '')}.${randomSuffix}`;

    const newMember: Member = {
      id: `m-${Date.now()}`,
      nta: ntaNew,
      nik: newMemberForm.nik.trim() || `327101${Date.now().toString().slice(-10)}`,
      namaLengkap: newMemberForm.namaLengkap.trim(),
      jenisKelamin: newMemberForm.jenisKelamin,
      tempatLahir: newMemberForm.tempatLahir,
      tanggalLahir: newMemberForm.tanggalLahir,
      agama: 'Islam',
      golongan: newMemberForm.golongan,
      tingkatan: newMemberForm.tingkatan,
      gudepId: registration?.id || gudep?.id || 'gudep-active',
      namaPangkalan: pangkalanName,
      noGudep: `${noGudepPa} / ${noGudepPi}`,
      kelurahan: kelurahan as any,
      alamatRumah: newMemberForm.alamatRumah,
      noTelepon: newMemberForm.noTelepon || noHpPembinaPa || '',
      fotoUrl: newMemberForm.jenisKelamin === 'L' 
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      statusKta: 'Menunggu Verifikasi',
      statusSync: 'Tersinkronisasi',
      berlakuKtaSampai: '2028-12-31',
      tanggalBergabung: new Date().toISOString().slice(0, 10)
    };

    await onSaveMember(newMember);
    setIsAddMemberModalOpen(false);
    setNewMemberForm({
      namaLengkap: '',
      nik: '',
      jenisKelamin: 'L',
      tempatLahir: 'Bogor',
      tanggalLahir: '2012-05-15',
      golongan: 'Penggalang',
      tingkatan: 'Ramu',
      alamatRumah: 'Tanah Sareal, Kota Bogor',
      noTelepon: ''
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberIdsForBatch.length === 0) return;

    const newBatch: CollectiveKtaBatch = {
      id: `batch-${Date.now()}`,
      noBatch: `BATCH-KTA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      gudepId: registration?.id || gudep?.id || 'gudep-active',
      namaPangkalan: pangkalanName,
      noGudep: `${noGudepPa} / ${noGudepPi}`,
      tanggalPengajuan: new Date().toISOString().slice(0, 10),
      jumlahAnggota: selectedMemberIdsForBatch.length,
      golonganUtama: 'Penggalang',
      status: 'Diajukan ke Kwarcab',
      pemohonNama: pembinaPa || currentUser.name,
      pemohonKontak: noHpPembinaPa || '081388992211',
      daftarAnggotaIds: selectedMemberIdsForBatch,
      catatan: batchNote || 'Pengajuan penerbitan KTA kolektif pangkalan terverifikasi.'
    };

    await onSaveBatch(newBatch);
    setIsBatchModalOpen(false);
    setSelectedMemberIdsForBatch([]);
    setBatchNote('');
  };

  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!newPassInput.trim()) {
      setPassError('Kata sandi baru tidak boleh kosong.');
      return;
    }
    if (newPassInput.length < 6) {
      setPassError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setPassError('Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }

    setIsSavingPass(true);
    const res = await onUpdatePassword(newPassInput.trim());
    setIsSavingPass(false);

    if (res.success) {
      setPassSuccess('Kata sandi Akun Gudep berhasil diperbarui! Gunakan kata sandi baru untuk login berikutnya.');
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
    } else {
      setPassError(res.error || 'Gagal mengubah kata sandi.');
    }
  };

  const exportMembersCsv = () => {
    if (gudepMembers.length === 0) return;
    const headers = ['NTA', 'NIK', 'Nama Lengkap', 'Jenis Kelamin', 'Golongan', 'Tingkatan', 'No Gudep', 'Pangkalan', 'Status KTA'];
    const rows = gudepMembers.map(m => [
      m.nta,
      m.nik,
      `"${m.namaLengkap}"`,
      m.jenisKelamin,
      m.golongan,
      m.tingkatan,
      m.noGudep,
      `"${m.namaPangkalan}"`,
      m.statusKta
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Buku_Induk_Anggota_${pangkalanName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-[#140A06] text-stone-100 flex flex-col font-sans">
      {/* Top Bar for Gudep Account Session */}
      <header className="sticky top-0 z-40 bg-[#1F110B] border-b border-[#442618] px-4 sm:px-6 lg:px-8 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              🏫
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-400 font-mono tracking-wider uppercase">
                  PORTAL GUGUS DEPAN TERVERIFIKASI
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-semibold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Akun Aktif & Disetujui</span>
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{pangkalanName}</span>
                <span className="text-xs font-normal text-amber-300 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono">
                  Gudep {nomorGudep}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
              title="Edit dan Ubah Data Profil Pangkalan (Mabigus, Pembina, Sarana, Medsos)"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profil Gudep</span>
            </button>

            <button
              onClick={() => setIsCertificateModalOpen(true)}
              className="px-3 py-1.5 bg-[#2F1A10] hover:bg-[#3E2316] text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Cetak Piagam / Bukti Registrasi Sah Gudep"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Cetak Piagam Gudep</span>
            </button>

            <button
              onClick={onSwitchToPublic}
              className="px-3 py-1.5 bg-[#2A160E] hover:bg-[#3A1F14] text-stone-300 hover:text-white border border-[#48281A] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Portal Publik</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Keluar dari sesi akun pangkalan"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Keluar</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* Pangkalan Identity Hero Card */}
        <div className="bg-gradient-to-r from-[#2B160E] via-[#351C11] to-[#25120B] border border-[#4D2919] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-mono font-bold bg-amber-950/70 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                  KWARTIR RANTING TANAH SAREAL • KOTA BOGOR
                </span>
                {registration?.noRegistrasi && (
                  <span className="text-[11px] text-stone-300 bg-black/40 px-2 py-0.5 rounded-md font-mono border border-stone-800">
                    No. Reg: {registration.noRegistrasi}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {pangkalanName}
              </h2>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-300">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Jenjang: <strong>{registration?.jenjang || gudep?.jenjang || 'Sekolah'}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kel. {kelurahan}, Kota Bogor</span>
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Terverifikasi Kwarran</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-[#1C0E07] border border-[#482819] p-3 rounded-xl text-center min-w-[90px]">
                <div className="text-xl font-bold text-amber-400">{stats.total}</div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">Total Anggota</div>
              </div>
              <div className="bg-[#1C0E07] border border-[#482819] p-3 rounded-xl text-center min-w-[90px]">
                <div className="text-xl font-bold text-amber-400">{stats.pembina}</div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">Pembina</div>
              </div>
              <div className="bg-[#1C0E07] border border-[#482819] p-3 rounded-xl text-center min-w-[90px]">
                <div className="text-xl font-bold text-emerald-400">{stats.ktaTerbit}</div>
                <div className="text-[10px] text-stone-400 uppercase font-semibold">KTA Terbit</div>
              </div>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex flex-wrap gap-1.5 mt-6 pt-5 border-t border-[#462516]">
            <button
              onClick={() => setActiveTab('profil')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'profil'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'bg-[#1D0F08] text-stone-300 hover:text-white hover:bg-[#2C170D]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Profil & Pimpinan</span>
            </button>

            <button
              onClick={() => setActiveTab('anggota')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'anggota'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'bg-[#1D0F08] text-stone-300 hover:text-white hover:bg-[#2C170D]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Buku Induk Anggota ({gudepMembers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('kta')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'kta'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'bg-[#1D0F08] text-stone-300 hover:text-white hover:bg-[#2C170D]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Layanan KTA Kolektif ({gudepBatches.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('laporan')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'laporan'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'bg-[#1D0F08] text-stone-300 hover:text-white hover:bg-[#2C170D]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Laporan Gudep</span>
            </button>

            <button
              onClick={() => setActiveTab('keamanan')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'keamanan'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'bg-[#1D0F08] text-stone-300 hover:text-white hover:bg-[#2C170D]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Akun & Kata Sandi</span>
            </button>

            {/* Quick Edit Profile Action */}
            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="ml-auto px-4 py-2 bg-[#2D160D] hover:bg-amber-600 text-amber-300 hover:text-stone-950 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profil Pangkalan</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PROFIL & PIMPINAN GUGUS DEPAN */}
        {activeTab === 'profil' && (
          <div className="space-y-6">
            
            {/* Direct Edit Callout Banner */}
            <div className="p-4 bg-[#231208] border border-[#442314] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl flex-shrink-0">
                  ✏️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Kelola & Edit Data Pangkalan Anda Secara Mandiri</h4>
                  <p className="text-[11px] text-stone-400">
                    Anda dapat memperbarui nama Ka Mabigus, Pembina Putra/Putri, NTA, kontak WhatsApp, sarana prasarana, dan link media sosial pangkalan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all flex-shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Ubah Data Profil Ini</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1 & 2: Leadership Structure & Gudep Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Mabigus & Pembina Section */}
              <div className="bg-[#1D0F08] border border-[#3D2115] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#3B1F13] pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Pimpinan & Pembina Gugus Depan</span>
                  </h3>
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-stone-950 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit Pimpinan</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Ka Mabigus */}
                  <div className="p-4 rounded-xl bg-[#26130A] border border-[#442517] space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Ketua Majelis Pembimbing (Mabigus)
                    </span>
                    <h4 className="text-xs font-bold text-white">{kaMabigus}</h4>
                    <p className="text-[11px] text-stone-400">{registration?.jabatanKaMabigus || 'Kepala Pangkalan / Mabigus'}</p>
                    {noHpMabigus && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-300 pt-1">
                        <Phone className="w-3 h-3 text-amber-400" />
                        <span className="font-mono">{noHpMabigus}</span>
                      </div>
                    )}
                  </div>

                  {/* Pembina Satuan Putra */}
                  <div className="p-4 rounded-xl bg-[#26130A] border border-[#442517] space-y-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      Pembina Gudep Putra ({noGudepPa})
                    </span>
                    <h4 className="text-xs font-bold text-white">{pembinaPa}</h4>
                    <div className="text-[11px] text-stone-400">
                      <span>NTA: </span>
                      <strong className="text-amber-300 font-mono">{ntaPembinaPa}</strong>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      <span>Kualifikasi: </span>
                      <strong className="text-stone-200">{registration?.kursusPembinaPa || 'KMD'}</strong>
                    </div>
                    {noHpPembinaPa && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-300 pt-1">
                        <Phone className="w-3 h-3 text-blue-400" />
                        <span className="font-mono">{noHpPembinaPa}</span>
                      </div>
                    )}
                  </div>

                  {/* Pembina Satuan Putri */}
                  <div className="p-4 rounded-xl bg-[#26130A] border border-[#442517] space-y-2">
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                      Pembina Gudep Putri ({noGudepPi})
                    </span>
                    <h4 className="text-xs font-bold text-white">{pembinaPi}</h4>
                    <div className="text-[11px] text-stone-400">
                      <span>NTA: </span>
                      <strong className="text-amber-300 font-mono">{ntaPembinaPi}</strong>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      <span>Kualifikasi: </span>
                      <strong className="text-stone-200">{registration?.kursusPembinaPi || 'KMD'}</strong>
                    </div>
                    {noHpPembinaPi && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-300 pt-1">
                        <Phone className="w-3 h-3 text-pink-400" />
                        <span className="font-mono">{noHpPembinaPi}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Prestasi & Kegiatan Section */}
              <div className="bg-[#1D0F08] border border-[#3D2115] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#3B1F13] pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Prestasi & Sarana Gugus Depan</span>
                  </h3>
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-stone-950 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit Prestasi & Sarana</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-bold text-stone-300 mb-1">Prestasi 3 Tahun Terakhir:</h5>
                    <p className="text-xs text-stone-300 leading-relaxed bg-[#25130A] p-3.5 rounded-xl border border-[#432417]">
                      {registration?.prestasi3Tahun || 'Keaktifan dalam kegiatan kepramukaan tingkat kwartir ranting dan keikutsertaan lomba tingkat satuan.'}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-stone-300 mb-1.5">Kegiatan Pangkalan yang Diikuti:</h5>
                    <div className="flex flex-wrap gap-2">
                      {(registration?.kegiatanGudep || ['Latihan Mingguan', 'Persami', 'LT (Lomba Tingkat)']).map((kg, i) => (
                        <span key={i} className="text-xs bg-[#2B160D] text-amber-300 px-3 py-1 rounded-lg border border-[#48291A]">
                          ✓ {kg}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-stone-300 mb-1.5">Sarana & Prasarana Gugus Depan:</h5>
                    <div className="flex flex-wrap gap-2">
                      {(registration?.saranaPrasarana || ['Sanggar', 'Papan Nama Gudep', 'Tiang Bendera', 'Tenda', 'Tongkat']).map((sp, i) => (
                        <span key={i} className="text-xs bg-[#241209] text-stone-300 px-2.5 py-1 rounded-md border border-[#3F2215]">
                          • {sp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Column 3: Contact, Social & Official Certificate */}
            <div className="space-y-6">
              
              {/* Official Certificate Card */}
              <div className="bg-[#21110A] border border-[#4C2818] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
                    📜
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Status Legalitas Pangkalan</h4>
                    <p className="text-[11px] text-stone-400">Kwartir Ranting Tanah Sareal</p>
                  </div>
                </div>

                <div className="bg-[#170C06] p-3.5 rounded-xl border border-[#3E2114] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Nomor Registrasi:</span>
                    <strong className="text-amber-300 font-mono">{registration?.noRegistrasi || 'REG-GD-2026-002'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Status Verifikasi:</span>
                    <strong className="text-emerald-400 font-semibold">Disetujui Resmi</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Tanggal Pengesahan:</span>
                    <span className="text-stone-200 font-mono">{registration?.tanggalVerifikasi || '2026-08-12'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Pengesah:</span>
                    <span className="text-stone-200">{registration?.diverifikasiOleh || 'Ketua Kwarran'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCertificateModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Lihat & Cetak Piagam Gudep</span>
                </button>
              </div>

              {/* Media Sosial & Informasi Tambahan */}
              <div className="bg-[#1D0F08] border border-[#3D2115] rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Media Sosial & Portal Pangkalan</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  {registration?.mediaSosial?.instagram ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#25130A] rounded-xl border border-[#412316]">
                      <span className="flex items-center gap-2 text-stone-300">
                        <Instagram className="w-4 h-4 text-pink-400" />
                        <span>Instagram</span>
                      </span>
                      <span className="font-mono text-amber-300">{registration.mediaSosial.instagram}</span>
                    </div>
                  ) : null}

                  {registration?.mediaSosial?.facebook ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#25130A] rounded-xl border border-[#412316]">
                      <span className="flex items-center gap-2 text-stone-300">
                        <Facebook className="w-4 h-4 text-blue-400" />
                        <span>Facebook</span>
                      </span>
                      <span className="text-stone-200">{registration.mediaSosial.facebook}</span>
                    </div>
                  ) : null}

                  {registration?.mediaSosial?.website ? (
                    <a
                      href={registration.mediaSosial.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 bg-[#25130A] hover:bg-[#32190E] rounded-xl border border-[#412316] text-amber-300 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-stone-300">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        <span>Website</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-xs">
                        <span>{registration.mediaSosial.website.replace('https://', '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  ) : null}
                </div>
              </div>

            </div>

          </div>
        </div>
        )}

        {/* TAB 2: BUKU INDUK ANGGOTA GUDDE PANGKALAN */}
        {activeTab === 'anggota' && (
          <div className="bg-[#1D0F08] border border-[#3D2115] rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3B1F13] pb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Buku Induk Anggota Gudep ({pangkalanName})</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Daftar seluruh peserta didik dan pembina terdaftar di pangkalan ini dengan NTA resmi.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={exportMembersCsv}
                  className="px-3.5 py-2 bg-[#29150D] hover:bg-[#381F13] text-stone-300 hover:text-white border border-[#462719] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Ekspor Data (CSV)</span>
                </button>

                <button
                  onClick={() => {
                    setEditingMember(null);
                    setIsEditMemberModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Anggota Baru</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Nama atau NTA..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#25130A] border border-[#432316] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
                {['ALL', 'Siaga', 'Penggalang', 'Penegak', 'Pandega', 'Pembina'].map((gol) => (
                  <button
                    key={gol}
                    onClick={() => setSelectedGolongan(gol)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedGolongan === gol
                        ? 'bg-amber-600 text-stone-950'
                        : 'bg-[#26140B] text-stone-400 hover:text-white border border-[#442517]'
                    }`}
                  >
                    {gol === 'ALL' ? 'Semua Golongan' : gol}
                  </button>
                ))}
              </div>
            </div>

            {/* Members Table */}
            {displayedMembers.length === 0 ? (
              <div className="py-12 text-center bg-[#25130A] rounded-2xl border border-dashed border-[#442517] space-y-3">
                <Users className="w-10 h-10 text-stone-600 mx-auto" />
                <h4 className="text-sm font-bold text-stone-300">Belum ada data anggota untuk filter ini</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Tambahkan anggota pertama untuk pangkalan {pangkalanName} dengan tombol &quot;Tambah Anggota Baru&quot; di atas.
                </p>
                <button
                  onClick={() => {
                    setEditingMember(null);
                    setIsEditMemberModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Input Anggota Pertama</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#432316]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#28150D] text-stone-300 uppercase text-[10px] font-mono tracking-wider border-b border-[#432316]">
                    <tr>
                      <th className="p-3.5">Anggota</th>
                      <th className="p-3.5">NTA Resmi</th>
                      <th className="p-3.5">Golongan / Tingkat</th>
                      <th className="p-3.5">No. Gudep</th>
                      <th className="p-3.5">Status KTA</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#351C10]">
                    {displayedMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-[#25130A] transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={m.fotoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'}
                            alt={m.namaLengkap}
                            className="w-9 h-9 rounded-full object-cover border border-amber-500/40"
                          />
                          <div>
                            <div className="font-bold text-white">{m.namaLengkap}</div>
                            <div className="text-[11px] text-stone-400">{m.jenisKelamin === 'L' ? 'Putra' : 'Putri'} • NIK: {m.nik}</div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-amber-300 font-bold">
                          {m.nta}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            m.golongan === 'Siaga' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                            m.golongan === 'Penggalang' ? 'bg-red-950 text-red-300 border border-red-500/30' :
                            m.golongan === 'Penegak' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                            m.golongan === 'Pandega' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' :
                            'bg-stone-800 text-stone-300 border border-stone-700'
                          }`}>
                            {m.golongan} {m.tingkatan ? `(${m.tingkatan})` : ''}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-stone-300">
                          {m.noGudep}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.statusKta === 'Terbit' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' :
                            'bg-amber-900/60 text-amber-300 border border-amber-500/40'
                          }`}>
                            {m.statusKta}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingMember(m);
                              setIsEditMemberModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-[#28140B] hover:bg-amber-600 text-stone-300 hover:text-stone-950 rounded-lg text-xs font-semibold transition-all border border-[#492718] inline-flex items-center gap-1"
                            title="Edit dan Ubah Data Lengkap Anggota Ini"
                          >
                            <Edit3 className="w-3 h-3 text-amber-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setSelectedKtaMember(m)}
                            className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-stone-950 rounded-lg text-xs font-bold transition-all border border-amber-500/30"
                          >
                            KTA Digital
                          </button>
                          {onDeleteMember && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus data anggota ${m.namaLengkap}?`)) {
                                  onDeleteMember(m.id);
                                }
                              }}
                              className="p-1 text-stone-500 hover:text-red-400 rounded-lg transition-colors"
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: LAYANAN KTA KOLEKTIF */}
        {activeTab === 'kta' && (
          <div className="bg-[#1D0F08] border border-[#3D2115] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3B1F13] pb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>Pengajuan KTA Kolektif ({pangkalanName})</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Ajukan penerbitan KTA fisik / cetak kartu secara kolektif untuk anggota pangkalan Anda ke Kwartir Ranting.
                </p>
              </div>

              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Pengajuan KTA Baru</span>
              </button>
            </div>

            {gudepBatches.length === 0 ? (
              <div className="py-12 text-center bg-[#25130A] rounded-2xl border border-dashed border-[#442517] space-y-3">
                <CreditCard className="w-10 h-10 text-stone-600 mx-auto" />
                <h4 className="text-sm font-bold text-stone-300">Belum ada riwayat pengajuan KTA kolektif</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Pangkalan Anda belum mengajukan batch cetak KTA kolektif ke Kwarran. Klik tombol di atas untuk mengajukan.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {gudepBatches.map((b) => (
                  <div key={b.id} className="p-4 bg-[#26130B] border border-[#442618] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-xs">{b.noBatch}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'Selesai Cetak' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                          b.status === 'Disetujui' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                          'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">
                        Pengajuan {b.jumlahAnggota} Anggota Pramuka
                      </h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Pemohon: {b.pemohonNama} ({b.pemohonKontak}) • Tanggal: {b.tanggalPengajuan}
                      </p>
                    </div>

                    <div className="text-xs text-stone-300 bg-[#1A0C06] px-3.5 py-2 rounded-xl border border-[#3E2114]">
                      <span className="text-stone-400">Catatan: </span>
                      <span>{b.catatan || 'Menunggu pemrosesan'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LAPORAN GUDEP (INTERACTIVE ACTIVITY & SEMESTER REPORTS) */}
        {activeTab === 'laporan' && (
          <div className="bg-[#1D0F08] border border-[#3D2115] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3B1F13] pb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-amber-400" />
                  <span>Pelaporan Kegiatan & Keaktifan Gudep ({pangkalanName})</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Catat riwayat kegiatan latihan rutin, persami, ujian SKU/SKK, dan pelaporan semester pangkalan Anda.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingActivityReport(null);
                  setIsActivityReportModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Laporan / Catatan Baru</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[#25130A] border border-[#432316] rounded-xl">
                <div className="text-[10px] uppercase font-bold text-stone-400">Total Laporan</div>
                <div className="text-xl font-bold text-amber-400 mt-0.5">{gudepActivityReports.length}</div>
              </div>
              <div className="p-3.5 bg-[#25130A] border border-[#432316] rounded-xl">
                <div className="text-[10px] uppercase font-bold text-stone-400">Latihan Rutin</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">
                  {gudepActivityReports.filter(r => r.kategori === 'Latihan Rutin').length}
                </div>
              </div>
              <div className="p-3.5 bg-[#25130A] border border-[#432316] rounded-xl">
                <div className="text-[10px] uppercase font-bold text-stone-400">Ujian SKU / SKK</div>
                <div className="text-xl font-bold text-blue-400 mt-0.5">
                  {gudepActivityReports.filter(r => r.kategori === 'Ujian SKU / SKK').length}
                </div>
              </div>
              <div className="p-3.5 bg-[#25130A] border border-[#432316] rounded-xl">
                <div className="text-[10px] uppercase font-bold text-stone-400">Kemah / Persami</div>
                <div className="text-xl font-bold text-purple-400 mt-0.5">
                  {gudepActivityReports.filter(r => r.kategori === 'Perkemahan / Persami').length}
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'ALL', label: 'Semua Laporan' },
                { id: 'Latihan Rutin', label: 'Latihan Rutin' },
                { id: 'Perkemahan / Persami', label: 'Perkemahan' },
                { id: 'Ujian SKU / SKK', label: 'Ujian SKU/SKK' },
                { id: 'Lomba Tingkat', label: 'Lomba Tingkat' },
                { id: 'Bakti Sosial', label: 'Bakti Sosial' },
                { id: 'Laporan Semester', label: 'Laporan Semester' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setReportCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    reportCategoryFilter === cat.id
                      ? 'bg-amber-600 text-stone-950 font-bold'
                      : 'bg-[#24130A] text-stone-400 hover:text-white border border-[#3E2114]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Reports List */}
            {filteredActivityReports.length === 0 ? (
              <div className="py-12 text-center bg-[#24130A] rounded-2xl border border-dashed border-[#442316] space-y-3">
                <FileText className="w-10 h-10 text-stone-600 mx-auto" />
                <h4 className="text-sm font-bold text-stone-300">Belum ada laporan kegiatan tercatat</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Catat kegiatan kepramukaan pertama pangkalan Anda untuk arsip mandiri dan pelaporan ke Kwarran.
                </p>
                <button
                  onClick={() => {
                    setEditingActivityReport(null);
                    setIsActivityReportModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tulis Laporan Kegiatan</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivityReports.map(rep => (
                  <div
                    key={rep.id}
                    className="p-4 bg-[#25130A] border border-[#432316] hover:border-amber-500/40 rounded-xl transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3B1F13] pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 border border-amber-500/40 text-amber-300 uppercase tracking-wider">
                            {rep.kategori}
                          </span>
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-500" />
                            <span>{rep.tanggalKegiatan}</span>
                          </span>
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-500" />
                            <span>{rep.tempat}</span>
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">
                          {rep.judul}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => {
                            setEditingActivityReport(rep);
                            setIsActivityReportModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-[#31180E] hover:bg-amber-600 text-stone-300 hover:text-stone-950 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all border border-[#4A2617]"
                          title="Edit Catatan Laporan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteActivityReport(rep.id)}
                          className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Hapus Laporan Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      {rep.ringkasan}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#3B1F13] text-[11px] text-stone-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-400" />
                          <span>Peserta: <strong className="text-stone-200">{rep.jumlahPeserta} orang</strong></span>
                        </span>
                        <span>Diunggah oleh: <strong className="text-stone-300">{rep.diunggahOleh}</strong></span>
                      </div>

                      {rep.dokumenUrl && (
                        <a
                          href={rep.dokumenUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <span>Buka Berkas / Tautan Dokumentasi</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AKUN & KEAMANAN GUDDE */}
        {activeTab === 'keamanan' && (
          <div className="max-w-2xl mx-auto bg-[#1D0F08] border border-[#3D2115] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-[#3B1F13] pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>Pengaturan Akun & Kata Sandi Gudep</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Kelola kredensial akun login pangkalan {pangkalanName}.
              </p>
            </div>

            {/* Account Info */}
            <div className="bg-[#26130B] p-4 rounded-xl border border-[#442618] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Username Login:</span>
                <strong className="text-amber-300 font-mono">{currentUser.username}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Penanggung Jawab / Pendaftar:</span>
                <strong className="text-white">{registration?.akunGudep?.namaPendaftar || currentUser.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">WhatsApp Penanggung Jawab:</span>
                <span className="text-stone-300 font-mono">{registration?.akunGudep?.noWaPendaftar || noHpPembinaPa || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Email Pangkalan:</span>
                <span className="text-stone-300">{registration?.akunGudep?.emailPendaftar || currentUser.email}</span>
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Ubah Kata Sandi Akun
              </h4>

              {passError && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Kata Sandi Baru:
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPassInput}
                      onChange={(e) => setNewPassInput(e.target.value)}
                      placeholder="Minimal 6 karakter..."
                      className="w-full pl-3 pr-10 py-2.5 bg-[#25130A] border border-[#432316] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Konfirmasi Kata Sandi Baru:
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    placeholder="Ulangi kata sandi baru..."
                    className="w-full px-3 py-2.5 bg-[#25130A] border border-[#432316] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingPass}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSavingPass ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}</span>
              </button>
            </form>

          </div>
        )}

      </main>

      {/* MODAL 1: ADD MEMBER */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#24130C] border border-[#4A2718] rounded-2xl w-full max-w-lg shadow-2xl p-6 my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#442517] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Tambah Anggota Pramuka Baru</span>
              </h3>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3.5 text-xs">
              <div className="bg-[#1B0C06] p-3 rounded-xl border border-[#3E2114]">
                <span className="text-stone-400">Pangkalan Terkunci: </span>
                <strong className="text-amber-300">{pangkalanName} ({nomorGudep})</strong>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Nama Lengkap Siswa / Anggota *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Farhan"
                  value={newMemberForm.namaLengkap}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, namaLengkap: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2D170E] border border-[#4E2A1B] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={newMemberForm.jenisKelamin}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 bg-[#2D170E] border border-[#4E2A1B] rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="L">Putra (Laki-laki)</option>
                    <option value="P">Putri (Perempuan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">NIK (KTP/KK)</label>
                  <input
                    type="text"
                    placeholder="16 Digit NIK..."
                    value={newMemberForm.nik}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, nik: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2D170E] border border-[#4E2A1B] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Golongan Pramuka</label>
                  <select
                    value={newMemberForm.golongan}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, golongan: e.target.value as GolonganPramuka })}
                    className="w-full px-3 py-2 bg-[#2D170E] border border-[#4E2A1B] rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Siaga">Siaga (7-10 th)</option>
                    <option value="Penggalang">Penggalang (11-15 th)</option>
                    <option value="Penegak">Penegak (16-20 th)</option>
                    <option value="Pandega">Pandega (21-25 th)</option>
                    <option value="Pembina">Pembina Dewasa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Tingkatan SKU</label>
                  <select
                    value={newMemberForm.tingkatan}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, tingkatan: e.target.value as TingkatanPramuka })}
                    className="w-full px-3 py-2 bg-[#2D170E] border border-[#4E2A1B] rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Mula">Mula / Calon</option>
                    <option value="Bantu">Bantu</option>
                    <option value="Tata">Tata</option>
                    <option value="Ramu">Ramu</option>
                    <option value="Rakit">Rakit</option>
                    <option value="Terap">Terap</option>
                    <option value="Bantara">Bantara</option>
                    <option value="Laksana">Laksana</option>
                    <option value="Garuda">Pramuka Garuda</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#442517]">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 bg-[#2E180F] hover:bg-[#3D2115] text-stone-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH KTA CREATION */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#24130C] border border-[#4A2718] rounded-2xl w-full max-w-lg shadow-2xl p-6 my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#442517] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Pengajuan KTA Kolektif Baru</span>
              </h3>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <p className="text-stone-300">
                Pilih anggota dari pangkalan <strong>{pangkalanName}</strong> yang akan diajukan pencetakan KTA:
              </p>

              <div className="max-h-52 overflow-y-auto space-y-1.5 p-2 bg-[#1B0C06] border border-[#432316] rounded-xl">
                {gudepMembers.map((m) => {
                  const isChecked = selectedMemberIdsForBatch.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#28150D] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedMemberIdsForBatch(selectedMemberIdsForBatch.filter(id => id !== m.id));
                          } else {
                            setSelectedMemberIdsForBatch([...selectedMemberIdsForBatch, m.id]);
                          }
                        }}
                        className="rounded accent-amber-500"
                      />
                      <span className="font-semibold text-white">{m.namaLengkap}</span>
                      <span className="text-stone-400 font-mono text-[11px]">({m.nta})</span>
                    </label>
                  );
                })}
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Catatan Pengajuan (Opsional):</label>
                <textarea
                  rows={2}
                  placeholder="Catatan untuk sekretariat Kwarran..."
                  value={batchNote}
                  onChange={(e) => setBatchNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2D170E] border border-[#4E2A1B] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-amber-300 font-bold">
                  Terpilih: {selectedMemberIdsForBatch.length} Anggota
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBatchModalOpen(false)}
                    className="px-3.5 py-2 bg-[#2E180F] text-stone-300 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={selectedMemberIdsForBatch.length === 0}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl disabled:opacity-50"
                  >
                    Kirim Pengajuan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: OFFICIAL REGISTRATION PIAGAM / CERTIFICATE */}
      {isCertificateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FAF7F2] text-stone-900 border-4 border-amber-800/80 rounded-2xl w-full max-w-2xl shadow-2xl p-8 my-8 relative print:border-none print:shadow-none">
            <button
              onClick={() => setIsCertificateModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-900 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-1 border-b-2 border-stone-800 pb-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">⚜️</span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-amber-900 font-serif">
                    GERAKAN PRAMUKA KWARTIR RANTING TANAH SAREAL
                  </h3>
                  <h4 className="text-xs font-semibold text-stone-700">
                    KOTA BOGOR • JAWA BARAT
                  </h4>
                </div>
              </div>
              <div className="pt-2">
                <h2 className="text-xl font-black uppercase tracking-wider text-stone-900 font-serif underline decoration-amber-700">
                  PIAGAM TANDA BUKTI GUGUS DEPAN TERDAFTAR
                </h2>
                <p className="text-[11px] font-mono text-stone-600 mt-0.5">
                  Nomor Registrasi: {registration?.noRegistrasi || 'REG-GD-2026-002'}
                </p>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="py-6 space-y-4 text-xs leading-relaxed text-stone-800">
              <p className="text-center font-serif text-sm">
                Kwartir Ranting Gerakan Pramuka Tanah Sareal Kota Bogor menyatakan bahwa:
              </p>

              <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200/80 space-y-1.5 text-center">
                <div className="text-xs text-amber-900 font-bold uppercase font-mono">NAMA PANGKALAN:</div>
                <div className="text-lg font-black text-amber-950 font-serif">{pangkalanName}</div>
                <div className="text-xs text-stone-700">
                  Nomor Gudep Putra: <strong>{noGudepPa}</strong> • Nomor Gudep Putri: <strong>{noGudepPi}</strong>
                </div>
                <div className="text-[11px] text-stone-600">
                  Alamat: {alamat} • Kelurahan {kelurahan}
                </div>
              </div>

              <p className="text-justify indent-6">
                Telah memenuhi persyaratan administrasi dan diverifikasi resmi sebagai Gugus Depan aktif di wilayah kerja Kwartir Ranting Tanah Sareal. Pangkalan ini berhak menyelenggarakan pendidikan kepramukaan, mengusulkan penerbitan Tanda Anggota (KTA), dan mengikuti seluruh kegiatan kepramukaan resmi Kwartir Ranting Tanah Sareal dan Kwartir Cabang Kota Bogor.
              </p>
            </div>

            {/* Certificate Signature */}
            <div className="pt-4 border-t border-stone-300 flex justify-between items-end text-xs">
              <div>
                <div className="font-mono text-[10px] text-stone-500">KODE OTENTIKASI RESMI SIKAP:</div>
                <div className="font-mono text-[11px] font-bold text-amber-900">TANSA-GD-{noGudepPa.replace('.', '')}-2026</div>
                <div className="text-[10px] text-stone-500">Terdaftar di Basis Data Terpadu Kwarran</div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-[11px] text-stone-600">Tanah Sareal, {registration?.tanggalVerifikasi || '12 Agustus 2026'}</p>
                <p className="text-xs font-bold text-stone-800">Ketua Kwartir Ranting Tanah Sareal,</p>
                <div className="h-12 flex items-center justify-center text-stone-400 italic text-xs">
                  [ Tanda Tangan & Cap Sah ]
                </div>
                <p className="font-bold text-stone-900 underline">Kak Drs. H. Suryadi, M.Pd.</p>
                <p className="text-[10px] text-stone-600 font-mono">NTA: 09.02.04.001.0001</p>
              </div>
            </div>

            {/* Print Button */}
            <div className="mt-6 flex justify-end gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen Piagam Ini</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: KTA DIGITAL CARD PREVIEW */}
      {selectedKtaMember && (
        <KtaCard
          member={selectedKtaMember}
          onClose={() => setSelectedKtaMember(null)}
        />
      )}

      {/* MODAL 5: EDIT GUDEP PROFILE MODAL */}
      <EditGudepProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        registration={effectiveRegistration}
        onSave={async (updatedReg) => {
          if (onSaveRegistration) {
            await onSaveRegistration(updatedReg);
          }
        }}
      />

      {/* MODAL 6: EDIT / ADD INDIVIDUAL MEMBER MODAL */}
      <EditMemberModal
        isOpen={isEditMemberModalOpen}
        onClose={() => {
          setIsEditMemberModalOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
        pangkalanName={pangkalanName}
        noGudepPa={noGudepPa}
        noGudepPi={noGudepPi}
        kelurahan={kelurahan}
        onSave={async (savedMember) => {
          await onSaveMember(savedMember);
        }}
      />

      {/* MODAL 7: GUDEP ACTIVITY REPORT MODAL */}
      <GudepActivityReportModal
        isOpen={isActivityReportModalOpen}
        onClose={() => {
          setIsActivityReportModalOpen(false);
          setEditingActivityReport(null);
        }}
        report={editingActivityReport}
        pangkalanId={effectiveRegistration.id}
        namaPangkalan={pangkalanName}
        nomorGudep={nomorGudep}
        authorName={pembinaPa || currentUser.namaPangkalan || 'Pembina Pangkalan'}
        onSave={handleSaveActivityReport}
      />
    </div>
  );
};
