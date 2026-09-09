import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  CreditCard, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  RotateCw, 
  Award, 
  MapPin, 
  UserCheck, 
  X,
  Phone,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { Member, GolonganPramuka, TingkatanPramuka, StatusKTA, StatusSync, Gudep } from '../types';
import { exportMembersCsv } from '../utils/storage';
import { PengurusAccountItem } from '../utils/auth';

interface MemberManagerProps {
  members: Member[];
  gudepList: Gudep[];
  pengurusList?: PengurusAccountItem[];
  initialSearch?: string;
  initialGudepId?: string;
  initialGolongan?: string;
  onSaveMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onOpenKtaModal: (member: Member) => void;
  onSyncMembers: (memberIds: string[]) => void;
  onAssignMemberAsPengurus?: (member: Member) => void;
  onOpenPengurusSettings?: () => void;
}

export const MemberManager: React.FC<MemberManagerProps> = ({
  members,
  gudepList,
  pengurusList,
  initialSearch = '',
  initialGudepId = 'ALL',
  initialGolongan = 'ALL',
  onSaveMember,
  onDeleteMember,
  onOpenKtaModal,
  onSyncMembers,
  onAssignMemberAsPengurus,
  onOpenPengurusSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedGolongan, setSelectedGolongan] = useState<string>(initialGolongan);
  const [selectedGudep, setSelectedGudep] = useState<string>(initialGudepId);
  const [selectedStatusKta, setSelectedStatusKta] = useState<string>('ALL');
  const [selectedStatusSync, setSelectedStatusSync] = useState<string>('ALL');

  // React to prop changes if filtered from GudepManager
  React.useEffect(() => {
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialSearch]);

  React.useEffect(() => {
    if (initialGudepId !== undefined) setSelectedGudep(initialGudepId);
  }, [initialGudepId]);

  React.useEffect(() => {
    if (initialGolongan !== undefined) setSelectedGolongan(initialGolongan);
  }, [initialGolongan]);

  // Multi select for batch sync
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const defaultGudep = gudepList[0] || {
    id: 'gudep-01',
    namaPangkalan: 'SDN Kebon Pedes 1',
    noGudepPa: '04.071',
    kelurahan: 'Kebon Pedes'
  };

  const [formData, setFormData] = useState<Partial<Member>>({
    nta: `09.02.04.${defaultGudep.noGudepPa}.${Math.floor(1000 + Math.random() * 9000)}`,
    nik: '327103',
    namaLengkap: '',
    jenisKelamin: 'L',
    tempatLahir: 'Bogor',
    tanggalLahir: '2010-01-01',
    agama: 'Islam',
    golongan: 'Penggalang',
    tingkatan: 'Penggalang Ramu',
    gudepId: defaultGudep.id,
    namaPangkalan: defaultGudep.namaPangkalan,
    noGudep: defaultGudep.noGudepPa,
    kelurahan: defaultGudep.kelurahan,
    alamatRumah: '',
    noTelepon: '0812-',
    fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
    golonganDarah: 'O',
    statusKta: 'Sudah Terbit',
    statusSync: 'Tersinkronisasi',
    berlakuKtaSampai: '2028-08-14',
    tanggalBergabung: '2024-07-15'
  });

  // Helper predicates for consistent classification across counts & filter
  const isMabigus = (m: Member): boolean => {
    const gol = (m.golongan || '').toLowerCase().trim();
    const jab = (m.jabatan || '').toLowerCase().trim();
    const ting = (m.tingkatan || '').toLowerCase().trim();
    return gol === 'mabigus' || jab.includes('mabigus') || ting.includes('mabigus') || ting.includes('kepala sekolah');
  };

  const isPembina = (m: Member): boolean => {
    const gol = (m.golongan || '').toLowerCase().trim();
    const jab = (m.jabatan || '').toLowerCase().trim();
    return (
      gol === 'pembina' || 
      gol === 'pelatih' || 
      jab.includes('pembina') ||
      jab.includes('pelatih')
    );
  };

  const isMuda = (m: Member): boolean => {
    const gol = (m.golongan || '').toLowerCase().trim();
    return ['siaga', 'penggalang', 'penegak', 'pandega'].includes(gol);
  };

  // Filtered members
  const filteredList = members.filter(m => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.namaLengkap.toLowerCase().includes(q) ||
      m.nta.toLowerCase().includes(q) ||
      m.nik.includes(q) ||
      m.namaPangkalan.toLowerCase().includes(q) ||
      (m.jabatan && m.jabatan.toLowerCase().includes(q)) ||
      (m.tingkatan && m.tingkatan.toLowerCase().includes(q)) ||
      (m.noTelepon && m.noTelepon.toLowerCase().includes(q));

    let matchesGol = true;
    if (selectedGolongan === 'ALL') {
      matchesGol = true;
    } else if (selectedGolongan === 'Mabigus') {
      matchesGol = isMabigus(m);
    } else if (selectedGolongan === 'Pembina') {
      matchesGol = isPembina(m);
    } else if (selectedGolongan === 'Muda') {
      matchesGol = isMuda(m);
    } else {
      matchesGol = m.golongan === selectedGolongan;
    }

    const matchesGudep = selectedGudep === 'ALL' || m.gudepId === selectedGudep;
    const matchesKta = selectedStatusKta === 'ALL' || m.statusKta === selectedStatusKta;
    const matchesSync = selectedStatusSync === 'ALL' || m.statusSync === selectedStatusSync;

    return matchesSearch && matchesGol && matchesGudep && matchesKta && matchesSync;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(m => m.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    const targetGudep = gudepList[0] || defaultGudep;
    setFormData({
      nta: `09.02.04.${targetGudep.noGudepPa.slice(3) || '071'}.${Math.floor(1000 + Math.random() * 9000)}`,
      nik: '327103' + Math.floor(1000000000 + Math.random() * 9000000000),
      namaLengkap: '',
      jenisKelamin: 'L',
      tempatLahir: 'Bogor',
      tanggalLahir: '2012-05-10',
      agama: 'Islam',
      golongan: 'Penggalang',
      tingkatan: 'Penggalang Ramu',
      gudepId: targetGudep.id,
      namaPangkalan: targetGudep.namaPangkalan,
      noGudep: targetGudep.noGudepPa,
      kelurahan: targetGudep.kelurahan,
      alamatRumah: `Kel. ${targetGudep.kelurahan}, Kec. Tanah Sareal`,
      noTelepon: '0812-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      golonganDarah: 'O',
      statusKta: 'Sudah Terbit',
      statusSync: 'Tersinkronisasi',
      berlakuKtaSampai: '2028-08-14',
      tanggalBergabung: '2024-07-15'
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (m: Member) => {
    setEditingMember(m);
    setFormData(m);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap) return;

    const gTarget = gudepList.find(g => g.id === formData.gudepId) || defaultGudep;

    const saved: Member = {
      id: editingMember ? editingMember.id : `mem-${Date.now()}`,
      nta: formData.nta || `09.02.04.${gTarget.noGudepPa}.001`,
      nik: formData.nik || '3271030000000000',
      namaLengkap: formData.namaLengkap,
      jenisKelamin: (formData.jenisKelamin as 'L' | 'P') || 'L',
      tempatLahir: formData.tempatLahir || 'Bogor',
      tanggalLahir: formData.tanggalLahir || '2010-01-01',
      agama: formData.agama || 'Islam',
      golongan: (formData.golongan as GolonganPramuka) || 'Penggalang',
      tingkatan: (formData.tingkatan as TingkatanPramuka) || 'Penggalang Ramu',
      gudepId: gTarget.id,
      namaPangkalan: gTarget.namaPangkalan,
      noGudep: gTarget.noGudepPa,
      kelurahan: gTarget.kelurahan,
      alamatRumah: formData.alamatRumah || `Kel. ${gTarget.kelurahan}`,
      noTelepon: formData.noTelepon || '-',
      fotoUrl: formData.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      golonganDarah: formData.golonganDarah || 'O',
      statusKta: (formData.statusKta as StatusKTA) || 'Sudah Terbit',
      statusSync: (formData.statusSync as StatusSync) || 'Tersinkronisasi',
      kualifikasiKursus: formData.kualifikasiKursus,
      jabatan: formData.jabatan || undefined,
      berlakuKtaSampai: formData.berlakuKtaSampai || '2028-08-14',
      tanggalBergabung: formData.tanggalBergabung || '2024-07-15'
    };

    onSaveMember(saved);
    setIsFormOpen(false);
  };

  const getGolonganBadgeClass = (m: Member | string) => {
    if (typeof m === 'object') {
      if (isMabigus(m)) {
        return 'bg-amber-100 text-amber-950 border-amber-300 font-bold';
      }
      if (isPembina(m)) {
        return m.golongan === 'Pelatih' 
          ? 'bg-purple-50 text-purple-900 border-purple-200 font-semibold' 
          : 'bg-blue-50 text-blue-900 border-blue-200 font-semibold';
      }
      return getGolonganBadgeClass(m.golongan);
    }
    const gol = m;
    switch (gol) {
      case 'Mabigus':
        return 'bg-amber-100 text-amber-950 border-amber-300 font-bold';
      case 'Pembina':
        return 'bg-blue-50 text-blue-900 border-blue-200 font-semibold';
      case 'Pelatih':
        return 'bg-purple-50 text-purple-900 border-purple-200 font-semibold';
      case 'Siaga':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      case 'Penggalang':
        return 'bg-rose-50 text-rose-900 border-rose-200';
      case 'Penegak':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'Pandega':
        return 'bg-amber-100 text-amber-950 border-amber-300';
      default:
        return 'bg-stone-800 text-amber-300 border-amber-500/50';
    }
  };

  // Category counts for Pusat Data overview
  const totalCount = members.length;
  const countMuda = members.filter(isMuda).length;
  const countMabigus = members.filter(isMabigus).length;
  const countPembina = members.filter(isPembina).length;
  const countPengurus = pengurusList?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5DFD5] shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-900 font-sans tracking-tight">
                  Sinkronisasi Anggota (Pusat Data SIKAP)
                </h2>
                <span className="bg-amber-100 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                  Pusat Master Data
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Pusat master data terpadu seluruh personil: Anggota Muda (Siaga, Penggalang, Penegak, Pandega), Ka Mabigus (Kepala Sekolah), dan Pembina Gudep se-Kecamatan Tanah Sareal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => onSyncMembers(selectedIds)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sinkronkan ({selectedIds.length})
            </button>
          )}

          {onOpenPengurusSettings && (
            <button
              onClick={onOpenPengurusSettings}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-300 shadow-sm transition-all"
              title="Kelola Struktur & Penugasan Pengurus Kwarran"
            >
              <Award className="w-4 h-4 text-amber-700" />
              <span>Struktur Pengurus ({pengurusList?.length || 0})</span>
            </button>
          )}

          <button
            onClick={() => exportMembersCsv(filteredList)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-[#FAF8F5] hover:bg-stone-100 rounded-xl border border-[#E5DFD5] transition-colors"
          >
            <Download className="w-4 h-4 text-stone-600" />
            Ekspor CSV
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-950 bg-amber-600 hover:bg-amber-500 rounded-xl shadow-sm transition-all border border-amber-400"
          >
            <Plus className="w-4 h-4 text-stone-950" />
            Tambah Anggota
          </button>
        </div>
      </div>

      {/* Quick Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => {
            setSelectedGolongan('ALL');
            setSelectedGudep('ALL');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap border ${
            selectedGolongan === 'ALL' && selectedGudep === 'ALL'
              ? 'bg-amber-600 text-stone-950 border-amber-400 shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-50 border-[#E5DFD5]'
          }`}
        >
          Semua Data ({totalCount})
        </button>

        <button
          onClick={() => {
            setSelectedGolongan('Mabigus');
            if (selectedGudep !== 'ALL') {
              const inGudep = members.some(m => isMabigus(m) && m.gudepId === selectedGudep);
              if (!inGudep) {
                setSelectedGudep('ALL');
              }
            }
            if (searchQuery.trim()) {
              const inSearch = members.some(m => isMabigus(m) && (
                m.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                m.namaPangkalan.toLowerCase().includes(searchQuery.toLowerCase().trim())
              ));
              if (!inSearch) {
                setSearchQuery('');
              }
            }
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap border flex items-center gap-1.5 ${
            selectedGolongan === 'Mabigus'
              ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-xs ring-2 ring-amber-500/20'
              : 'bg-white text-stone-700 hover:bg-amber-50 border-[#E5DFD5]'
          }`}
        >
          <span>👑</span>
          <span>Ka Mabigus ({countMabigus})</span>
        </button>

        <button
          onClick={() => {
            setSelectedGolongan('Pembina');
            if (selectedGudep !== 'ALL') {
              const inGudep = members.some(m => isPembina(m) && m.gudepId === selectedGudep);
              if (!inGudep) {
                setSelectedGudep('ALL');
              }
            }
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap border flex items-center gap-1.5 ${
            selectedGolongan === 'Pembina'
              ? 'bg-blue-100 text-blue-950 border-blue-400 shadow-xs ring-2 ring-blue-500/20'
              : 'bg-white text-stone-700 hover:bg-blue-50 border-[#E5DFD5]'
          }`}
        >
          <span>Pembina Gudep ({countPembina})</span>
        </button>

        <button
          onClick={() => setSelectedGolongan('Penggalang')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap border ${
            selectedGolongan === 'Penggalang'
              ? 'bg-rose-100 text-rose-950 border-rose-400 shadow-xs'
              : 'bg-white text-stone-700 hover:bg-rose-50 border-[#E5DFD5]'
          }`}
        >
          Penggalang SMP/MTs
        </button>

        <button
          onClick={() => setSelectedGolongan('Siaga')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap border ${
            selectedGolongan === 'Siaga'
              ? 'bg-emerald-100 text-emerald-950 border-emerald-400 shadow-xs'
              : 'bg-white text-stone-700 hover:bg-emerald-50 border-[#E5DFD5]'
          }`}
        >
          Siaga SD/MI
        </button>

        <button
          onClick={() => setSelectedGolongan('Penegak')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap border ${
            selectedGolongan === 'Penegak'
              ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-xs'
              : 'bg-white text-stone-700 hover:bg-amber-50 border-[#E5DFD5]'
          }`}
        >
          Penegak SMA/SMK
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] shadow-sm space-y-3">
        {selectedGudep !== 'ALL' && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-800">
              Filter Pangkalan Terpilih: <strong>{gudepList.find(g => g.id === selectedGudep)?.namaPangkalan}</strong>
            </span>
            <button
              onClick={() => setSelectedGudep('ALL')}
              className="text-stone-500 hover:text-amber-900 font-bold flex items-center gap-1 text-[11px]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Tampilkan Semua Pangkalan</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari NTA, NIK, nama lengkap, pangkalan..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
            />
          </div>

          {/* Golongan Filter */}
          <div>
            <select
              value={selectedGolongan}
              onChange={(e) => setSelectedGolongan(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none font-medium"
            >
              <option value="ALL">Semua Golongan</option>
              <option value="Mabigus">👑 Mabigus (Ka Mabigus)</option>
              <option value="Pembina">Pembina Mahir Gudep</option>
              <option value="Pelatih">Pelatih Pusdiklat</option>
              <option value="Siaga">Siaga (SD/MI)</option>
              <option value="Penggalang">Penggalang (SMP/MTs)</option>
              <option value="Penegak">Penegak (SMA/SMK)</option>
              <option value="Pandega">Pandega (PT)</option>
            </select>
          </div>

          {/* Gudep Filter */}
          <div>
            <select
              value={selectedGudep}
              onChange={(e) => setSelectedGudep(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none font-medium"
            >
              <option value="ALL">Semua Pangkalan / Gudep</option>
              {gudepList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.namaPangkalan} ({g.noGudepPa})
                </option>
              ))}
            </select>
          </div>

          {/* Status KTA */}
          <div>
            <select
              value={selectedStatusKta}
              onChange={(e) => setSelectedStatusKta(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none font-medium"
            >
              <option value="ALL">Semua Status KTA</option>
              <option value="Sudah Terbit">Sudah Terbit</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Proses Cetak">Proses Cetak</option>
              <option value="Belum Diajukan">Belum Diajukan</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-[#E5DFD5]">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                onChange={handleSelectAll}
                className="rounded text-amber-800 focus:ring-amber-700"
              />
              <span>Pilih Semua ({filteredList.length})</span>
            </label>
            {selectedIds.length > 0 && (
              <span className="text-amber-950 font-bold bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
                {selectedIds.length} dipilih
              </span>
            )}
          </div>

          {(selectedGolongan !== 'ALL' || selectedGudep !== 'ALL' || selectedStatusKta !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGolongan('ALL');
                setSelectedGudep('ALL');
                setSelectedStatusKta('ALL');
              }}
              className="text-amber-800 font-bold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Members Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-stone-600 uppercase tracking-wider text-[10px] border-b border-[#E5DFD5] font-sans font-bold">
              <tr>
                <th className="py-3 px-4 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                    onChange={handleSelectAll}
                    className="rounded text-amber-800"
                  />
                </th>
                <th className="py-3 px-4">Profil & Nama Anggota</th>
                <th className="py-3 px-4">NTA & NIK</th>
                <th className="py-3 px-4">Golongan / Tingkat</th>
                <th className="py-3 px-4">Pangkalan / Gudep</th>
                <th className="py-3 px-4">Status KTA</th>
                <th className="py-3 px-4">Status Sinkron</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD5]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-900 border border-amber-200 mx-auto flex items-center justify-center text-2xl">
                        {selectedGolongan === 'Mabigus' ? '👑' : '🔍'}
                      </div>
                      <div className="text-sm font-bold text-stone-900">
                        {selectedGolongan === 'Mabigus'
                          ? 'Data Ka Mabigus Tidak Muncul Dengan Filter Saat Ini'
                          : 'Tidak Ada Data Anggota yang Sesuai'}
                      </div>
                      <p className="text-xs text-stone-500">
                        {selectedGudep !== 'ALL'
                          ? `Filter pangkalan "${gudepList.find(g => g.id === selectedGudep)?.namaPangkalan || selectedGudep}" sedang aktif. Klik reset filter untuk menampilkan semua pangkalan.`
                          : searchQuery
                          ? `Kata kunci "${searchQuery}" tidak ditemukan pada kategori ini.`
                          : 'Silakan pilih kategori lain atau reset filter.'}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedGolongan('ALL');
                          setSelectedGudep('ALL');
                          setSelectedStatusKta('ALL');
                          setSelectedStatusSync('ALL');
                          setSearchQuery('');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-amber-300 hover:bg-stone-800 rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Semua Filter
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((m) => {
                const matchingPengurus = pengurusList?.find(
                  p => (p.memberId && p.memberId === m.id) || 
                       (p.nta && m.nta && p.nta.trim() === m.nta.trim()) ||
                       (p.name.toLowerCase().replace(/kak|\.|,/g, '').trim() === m.namaLengkap.toLowerCase().replace(/kak|\.|,/g, '').trim())
                );

                return (
                <tr key={m.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(m.id)}
                      onChange={() => toggleSelectOne(m.id)}
                      className="rounded text-amber-800"
                    />
                  </td>

                  {/* Foto & Nama */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 border border-[#E5DFD5] flex-shrink-0">
                        <img
                          src={m.fotoUrl}
                          alt={m.namaLengkap}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300';
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 leading-tight">
                          {m.namaLengkap}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span>{m.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • Gol. Darah {m.golonganDarah || '-'}</span>
                          {m.noTelepon && m.noTelepon !== '-' && (
                            <a
                              href={`https://wa.me/${m.noTelepon.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-800 hover:text-emerald-950 font-mono font-medium hover:underline bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 transition-colors"
                              title={`Hubungi via WhatsApp (${m.namaLengkap})`}
                            >
                              <Phone className="w-2.5 h-2.5 text-emerald-600" />
                              <span>{m.noTelepon}</span>
                            </a>
                          )}
                        </div>
                        {matchingPengurus && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-md text-[10px] font-bold">
                              <span>⚜️</span>
                              <span>{matchingPengurus.roleTitle}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* NTA & NIK */}
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span className="font-bold text-stone-950 block">{m.nta}</span>
                    <span className="text-stone-400 text-[10px] block">NIK: {m.nik}</span>
                  </td>

                  {/* Golongan Badge */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${getGolonganBadgeClass(m)}`}>
                        {isMabigus(m) && <span>👑</span>}
                        {isMabigus(m) ? 'Ka Mabigus' : m.golongan}
                      </span>
                      {m.jabatan && (
                        <span className="text-[9.5px] font-bold text-amber-950 bg-amber-100/90 border border-amber-300 px-1.5 py-0.2 rounded">
                          {m.jabatan}
                        </span>
                      )}
                    </div>
                    <span className="text-stone-500 block text-[10.5px] mt-0.5 font-medium">
                      {m.tingkatan}
                    </span>
                  </td>

                  {/* Pangkalan */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-stone-800 block truncate max-w-[160px]">
                      {m.namaPangkalan}
                    </span>
                    <span className="text-stone-400 text-[10.5px]">Gudep {m.noGudep}</span>
                  </td>

                  {/* Status KTA */}
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                      m.statusKta === 'Sudah Terbit'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : m.statusKta === 'Menunggu Verifikasi'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}>
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {m.statusKta}
                    </span>
                  </td>

                  {/* Status Sync */}
                  <td className="py-3 px-4">
                    <span className={`text-[10.5px] font-semibold ${
                      m.statusSync === 'Tersinkronisasi'
                        ? 'text-emerald-800'
                        : 'text-amber-800'
                    }`}>
                      {m.statusSync}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      {onAssignMemberAsPengurus && (
                        <button
                          onClick={() => onAssignMemberAsPengurus(m)}
                          className={`p-1.5 rounded-lg transition-colors border ${
                            matchingPengurus 
                              ? 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100' 
                              : 'text-stone-500 hover:text-amber-900 hover:bg-amber-50 border-stone-200 hover:border-amber-300'
                          }`}
                          title={matchingPengurus ? `Kelola Jabatan Pengurus (${matchingPengurus.roleTitle})` : `Pilih & Tetapkan ${m.namaLengkap} sebagai Pengurus Kwarran`}
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onOpenKtaModal(m)}
                        className="p-1.5 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors border border-transparent hover:border-stone-200"
                        title="Lihat / Cetak KTA Digital"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(m)}
                        className="p-1.5 text-stone-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                        title="Edit Data"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus data ${m.namaLengkap}?`)) {
                            onDeleteMember(m.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-[#E5DFD5]">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center bg-white space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-900 border border-amber-200 mx-auto flex items-center justify-center text-xl">
                {selectedGolongan === 'Mabigus' ? '👑' : '🔍'}
              </div>
              <p className="font-bold text-stone-800 text-xs">
                {selectedGolongan === 'Mabigus'
                  ? 'Tidak ada data Ka Mabigus yang cocok'
                  : 'Tidak ada data anggota yang cocok'}
              </p>
              <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                {selectedGudep !== 'ALL'
                  ? `Filter pangkalan aktif. Coba reset filter untuk melihat data dari semua pangkalan.`
                  : searchQuery
                  ? `Kata kunci "${searchQuery}" tidak ditemukan.`
                  : 'Silakan pilih kategori lain atau reset filter.'}
              </p>
              <button
                onClick={() => {
                  setSelectedGolongan('ALL');
                  setSelectedGudep('ALL');
                  setSelectedStatusKta('ALL');
                  setSelectedStatusSync('ALL');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 text-amber-300 rounded-xl text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filter
              </button>
            </div>
          ) : (
            filteredList.map((m) => {
            const matchingPengurus = pengurusList?.find(
              p => (p.memberId && p.memberId === m.id) || 
                   (p.nta && m.nta && p.nta.trim() === m.nta.trim()) ||
                   (p.name.toLowerCase().replace(/kak|\.|,/g, '').trim() === m.namaLengkap.toLowerCase().replace(/kak|\.|,/g, '').trim())
            );
            const isSelected = selectedIds.includes(m.id);

            return (
              <div 
                key={m.id} 
                className={`p-4 transition-colors space-y-3 ${
                  isSelected ? 'bg-amber-50/60' : 'bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectOne(m.id)}
                    className="mt-1 rounded text-amber-800 w-4 h-4"
                  />
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-[#E5DFD5] flex-shrink-0 shadow-sm">
                    <img
                      src={m.fotoUrl}
                      alt={m.namaLengkap}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-sm text-stone-900 leading-tight truncate">
                        {m.namaLengkap}
                      </h4>
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border flex-shrink-0 flex items-center gap-1 ${getGolonganBadgeClass(m)}`}>
                        {isMabigus(m) && <span>👑</span>}
                        {isMabigus(m) ? 'Ka Mabigus' : m.golongan}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {m.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • {m.tingkatan}
                      {m.jabatan && <span className="font-semibold text-amber-900 ml-1">({m.jabatan})</span>}
                    </p>
                    {matchingPengurus && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-md text-[10px] font-bold">
                          <span>⚜️</span>
                          <span>{matchingPengurus.roleTitle}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Meta Info */}
                <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E5DFD5] text-xs space-y-1 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-stone-500 font-sans">NTA Resmi:</span>
                    <span className="font-bold text-stone-900 text-[11px]">{m.nta}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-stone-500 font-sans">Pangkalan:</span>
                    <span className="font-sans font-medium text-stone-700 truncate max-w-[200px] text-[11px]">
                      {m.namaPangkalan} ({m.noGudep})
                    </span>
                  </div>
                  {m.noTelepon && m.noTelepon !== '-' && (
                    <div className="flex justify-between items-center pt-1 border-t border-[#EAE4DC]">
                      <span className="text-[10px] text-stone-500 font-sans flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-emerald-600" /> WhatsApp:
                      </span>
                      <a
                        href={`https://wa.me/${m.noTelepon.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-950 font-bold text-[11px] hover:underline"
                        title="Chat WhatsApp"
                      >
                        {m.noTelepon}
                      </a>
                    </div>
                  )}
                </div>

                {/* Status Badges & Quick Action Row */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      m.statusKta === 'Sudah Terbit'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : m.statusKta === 'Menunggu Verifikasi'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}>
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {m.statusKta}
                    </span>

                    <span className={`text-[10px] font-semibold ${
                      m.statusSync === 'Tersinkronisasi' ? 'text-emerald-800' : 'text-amber-800'
                    }`}>
                      • {m.statusSync}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {onAssignMemberAsPengurus && (
                      <button
                        onClick={() => onAssignMemberAsPengurus(m)}
                        className="p-2 rounded-xl text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition-colors"
                        title="Tetapkan Jabatan Pengurus"
                        aria-label="Tetapkan Pengurus"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onOpenKtaModal(m)}
                      className="p-2 rounded-xl text-emerald-900 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                      title="Lihat KTA Digital"
                      aria-label="Lihat KTA"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(m)}
                      className="p-2 rounded-xl text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 transition-colors"
                      title="Edit Data"
                      aria-label="Edit Data"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus data ${m.namaLengkap}?`)) {
                          onDeleteMember(m.id);
                        }
                      }}
                      className="p-2 rounded-xl text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                      title="Hapus"
                      aria-label="Hapus Anggota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5] my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-[#24140D] text-white">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-stone-100">
                  {editingMember ? 'Perbarui Data Anggota Pramuka' : 'Registrasi Anggota Baru (SISKA)'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-800 mb-1">Nama Lengkap Anggota *</label>
                  <input
                    type="text"
                    required
                    value={formData.namaLengkap}
                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                    placeholder="Contoh: Muhammad Rayyan Al-Ghifari"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">NTA (Nomor Tanda Anggota) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nta}
                    onChange={(e) => setFormData({ ...formData, nta: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">NIK (Nomor Induk Kependudukan) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Pangkalan / Gugus Depan *</label>
                  <select
                    value={formData.gudepId}
                    onChange={(e) => {
                      const g = gudepList.find(x => x.id === e.target.value);
                      if (g) {
                        setFormData({
                          ...formData,
                          gudepId: g.id,
                          namaPangkalan: g.namaPangkalan,
                          noGudep: g.noGudepPa,
                          kelurahan: g.kelurahan
                        });
                      }
                    }}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    {gudepList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.namaPangkalan} ({g.noGudepPa})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Golongan Pramuka *</label>
                  <select
                    value={formData.golongan}
                    onChange={(e) => {
                      const newGol = e.target.value as GolonganPramuka;
                      let newTingkatan = formData.tingkatan;
                      let newJabatan = formData.jabatan;
                      if (newGol === 'Mabigus') {
                        newTingkatan = 'Ketua Mabigus' as any;
                        newJabatan = newJabatan || 'Ketua Mabigus';
                      } else if (newGol === 'Pembina') {
                        newTingkatan = 'Pembina Mahir' as any;
                        newJabatan = newJabatan || (formData.jenisKelamin === 'P' ? 'Pembina Gudep Putri' : 'Pembina Gudep Putra');
                      }
                      setFormData({ 
                        ...formData, 
                        golongan: newGol,
                        tingkatan: newTingkatan,
                        jabatan: newJabatan
                      });
                    }}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    <option value="Mabigus">👑 Mabigus (Kepala Sekolah / Ketua Mabigus)</option>
                    <option value="Pembina">Pembina Mahir Gudep (Dewasa)</option>
                    <option value="Pelatih">Pelatih Pembina (Pusdiklat)</option>
                    <option value="Siaga">Siaga (Usia 7 - 10 Tahun)</option>
                    <option value="Penggalang">Penggalang (Usia 11 - 15 Tahun)</option>
                    <option value="Penegak">Penegak (Usia 16 - 20 Tahun)</option>
                    <option value="Pandega">Pandega (Usia 21 - 25 Tahun)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Tingkatan / SKU / Kualifikasi</label>
                  <input
                    type="text"
                    value={formData.tingkatan}
                    onChange={(e) => setFormData({ ...formData, tingkatan: e.target.value as any })}
                    placeholder="Contoh: Ketua Mabigus / Pembina Mahir / Penggalang Ramu"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Jabatan Spesifik di Gudep / Satuan</label>
                  <input
                    type="text"
                    value={formData.jabatan || ''}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    placeholder="Contoh: Ketua Mabigus, Pembina Satuan Putra, Pradana..."
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                  <p className="text-[10.5px] text-stone-500 mt-1">
                    Tersinkronisasi otomatis dengan buku induk & pendataan Gugus Depan (SISKA).
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as any })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    <option value="L">Laki-laki (Putra)</option>
                    <option value="P">Perempuan (Putri)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Golongan Darah</label>
                  <select
                    value={formData.golonganDarah}
                    onChange={(e) => setFormData({ ...formData, golonganDarah: e.target.value as any })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    <option value="A">Golongan Darah A</option>
                    <option value="B">Golongan Darah B</option>
                    <option value="AB">Golongan Darah AB</option>
                    <option value="O">Golongan Darah O</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">URL Foto Profil (KTA)</label>
                  <input
                    type="text"
                    value={formData.fotoUrl}
                    onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Status KTA</label>
                  <select
                    value={formData.statusKta}
                    onChange={(e) => setFormData({ ...formData, statusKta: e.target.value as any })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    <option value="Sudah Terbit">Sudah Terbit</option>
                    <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                    <option value="Proses Cetak">Proses Cetak</option>
                    <option value="Belum Diajukan">Belum Diajukan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Status Sinkronisasi Data</label>
                  <select
                    value={formData.statusSync}
                    onChange={(e) => setFormData({ ...formData, statusSync: e.target.value as any })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    <option value="Tersinkronisasi">Tersinkronisasi</option>
                    <option value="Menunggu Sinkronisasi">Menunggu Sinkronisasi</option>
                    <option value="Perlu Pemutakhiran">Perlu Pemutakhiran</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Nomor WhatsApp / HP *
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                      Aktif WhatsApp
                    </span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.noTelepon || ''}
                    onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                  <p className="text-[10.5px] text-stone-500 mt-1">
                    Digunakan untuk koordinasi pangkalan & verifikasi KTA digital.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-stone-950 bg-amber-600 hover:bg-amber-500 rounded-xl shadow border border-amber-400"
                >
                  Simpan Data Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
