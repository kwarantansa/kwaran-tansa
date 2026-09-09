import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  MapPin, 
  Phone, 
  Mail, 
  UserCheck, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Printer,
  Users,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  FileText,
  Lock,
  Check
} from 'lucide-react';
import { Gudep, JenjangSekolah, KelurahanTanahSareal, StatusSync, Member, GudepRegistration } from '../types';
import { KELURAHAN_LIST } from '../data/initialData';
import { GudepRegistrationDetailModal } from './GudepRegistrationDetailModal';

interface GudepManagerProps {
  gudepList: Gudep[];
  members?: Member[];
  registrations?: GudepRegistration[];
  onSaveGudep: (gudep: Gudep) => void;
  onDeleteGudep: (id: string) => void;
  onVerifyRegistration?: (regId: string, status: 'Disetujui' | 'Ditolak', note?: string) => Promise<void>;
  onNavigateToMembers?: (searchQuery?: string, gudepId?: string, golongan?: string) => void;
}

export const GudepManager: React.FC<GudepManagerProps> = ({
  gudepList,
  members = [],
  registrations = [],
  onSaveGudep,
  onDeleteGudep,
  onVerifyRegistration,
  onNavigateToMembers
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'buku_induk' | 'verifikasi_registrasi'>('buku_induk');
  const [selectedRegDetail, setSelectedRegDetail] = useState<GudepRegistration | null>(null);
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState<string>('ALL');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenjang, setSelectedJenjang] = useState<string>('ALL');
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>('ALL');
  const [selectedAkreditasi, setSelectedAkreditasi] = useState<string>('ALL');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingGudep, setEditingGudep] = useState<Gudep | null>(null);
  const [viewingGudep, setViewingGudep] = useState<Gudep | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Gudep>>({
    noGudepPa: '04.',
    noGudepPi: '04.',
    namaPangkalan: '',
    jenjang: 'SD/MI',
    kelurahan: 'Kebon Pedes',
    alamat: '',
    kaMabigus: '',
    pembinaGudepPa: '',
    pembinaGudepPi: '',
    kontakHp: '',
    email: '',
    akreditasi: 'A',
    tahunBerdiri: 2000,
    jumlahAnggotaMuda: 0,
    jumlahPembina: 2,
    statusSync: 'Tersinkronisasi',
  });

  // Filter logic
  const filteredList = gudepList.filter(g => {
    const matchesSearch = 
      g.namaPangkalan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.noGudepPa.includes(searchQuery) ||
      g.noGudepPi.includes(searchQuery) ||
      g.kaMabigus.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesJenjang = selectedJenjang === 'ALL' || g.jenjang === selectedJenjang;
    const matchesKelurahan = selectedKelurahan === 'ALL' || g.kelurahan === selectedKelurahan;
    const matchesAkreditasi = selectedAkreditasi === 'ALL' || g.akreditasi === selectedAkreditasi;

    return matchesSearch && matchesJenjang && matchesKelurahan && matchesAkreditasi;
  });

  const handleOpenAddModal = () => {
    setEditingGudep(null);
    setFormData({
      id: `gudep-${Date.now()}`,
      noGudepPa: '04.',
      noGudepPi: '04.',
      namaPangkalan: '',
      jenjang: 'SD/MI',
      kelurahan: 'Kebon Pedes',
      alamat: '',
      kaMabigus: '',
      pembinaGudepPa: '',
      pembinaGudepPi: '',
      kontakHp: '',
      email: '',
      akreditasi: 'A',
      tahunBerdiri: 2000,
      jumlahAnggotaMuda: 50,
      jumlahPembina: 2,
      statusSync: 'Tersinkronisasi',
      terakhirDiperbarui: new Date().toISOString().slice(0, 10),
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (g: Gudep) => {
    setEditingGudep(g);
    setFormData(g);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaPangkalan) return;

    const saved: Gudep = {
      id: editingGudep ? editingGudep.id : `gudep-${Date.now()}`,
      noGudepPa: formData.noGudepPa || '04.001',
      noGudepPi: formData.noGudepPi || '04.002',
      namaPangkalan: formData.namaPangkalan || '',
      jenjang: (formData.jenjang as JenjangSekolah) || 'SD/MI',
      kelurahan: (formData.kelurahan as KelurahanTanahSareal) || 'Kebon Pedes',
      alamat: formData.alamat || '',
      kaMabigus: formData.kaMabigus || '',
      pembinaGudepPa: formData.pembinaGudepPa || '',
      pembinaGudepPi: formData.pembinaGudepPi || '',
      kontakHp: formData.kontakHp || '',
      email: formData.email || '',
      akreditasi: (formData.akreditasi as any) || 'A',
      tahunBerdiri: Number(formData.tahunBerdiri) || 2000,
      jumlahAnggotaMuda: Number(formData.jumlahAnggotaMuda) || 0,
      jumlahPembina: Number(formData.jumlahPembina) || 0,
      statusSync: (formData.statusSync as StatusSync) || 'Tersinkronisasi',
      terakhirDiperbarui: new Date().toISOString().slice(0, 10),
    };

    onSaveGudep(saved);
    setIsFormModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = ['No Gudep Putra', 'No Gudep Putri', 'Nama Pangkalan', 'Jenjang', 'Kelurahan', 'Ka Mabigus', 'Pembina Pa', 'Pembina Pi', 'Kontak HP', 'Akreditasi', 'Anggota Muda', 'Pembina', 'Status Sync'];
    const rows = filteredList.map(g => [
      `"${g.noGudepPa}"`,
      `"${g.noGudepPi}"`,
      `"${g.namaPangkalan.replace(/"/g, '""')}"`,
      `"${g.jenjang}"`,
      `"${g.kelurahan}"`,
      `"${g.kaMabigus}"`,
      `"${g.pembinaGudepPa}"`,
      `"${g.pembinaGudepPi}"`,
      `"${g.kontakHp}"`,
      `"${g.akreditasi}"`,
      g.jumlahAnggotaMuda,
      g.jumlahPembina,
      `"${g.statusSync}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Gudep_Kwarran_Tanah_Sareal_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingRegCount = registrations.filter(r => r.statusVerifikasi === 'Menunggu Verifikasi').length;

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = 
      r.namaPangkalan.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
      r.noRegistrasi.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
      r.akunGudep.username.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
      (r.nomorGudep && r.nomorGudep.toLowerCase().includes(regSearchQuery.toLowerCase())) ||
      r.kaMabigus.toLowerCase().includes(regSearchQuery.toLowerCase());
    const matchesStatus = regStatusFilter === 'ALL' || r.statusVerifikasi === regStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5DFD5] shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-stone-900 font-sans tracking-tight">
              Buku Induk & Pendataan Gugus Depan (SISKA)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Data pemutakhiran seluruh pangkalan SD/MI, SMP/MTs, SMA/SMK/MA di 11 kelurahan wilayah Kwarran Tanah Sareal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeMainTab === 'buku_induk' && (
            <>
              <button
                onClick={handleExportCsv}
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
                Tambah Gudep Baru
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Tab Navigation: Buku Induk vs Verifikasi Registrasi */}
      <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-2">
        <button
          onClick={() => setActiveMainTab('buku_induk')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMainTab === 'buku_induk'
              ? 'bg-amber-900 text-amber-100 shadow-sm'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Buku Induk Pangkalan Resmi ({gudepList.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('verifikasi_registrasi')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMainTab === 'verifikasi_registrasi'
              ? 'bg-amber-900 text-amber-100 shadow-sm'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verifikasi Pendaftaran Publik ({registrations.length})</span>
          {pendingRegCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-stone-950 animate-pulse">
              {pendingRegCount} Menunggu
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: BUKU INDUK GUDEP */}
      {activeMainTab === 'buku_induk' && (
        <div className="space-y-6">

      {/* SISKA - Pusat Data Anggota Integration Notice */}
      <div className="bg-gradient-to-r from-amber-50/90 via-[#FAF8F5] to-orange-50/80 border border-amber-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-600 text-stone-950 flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
            ⚜️
          </div>
          <div>
            <div className="font-bold text-stone-900 flex items-center gap-2">
              <span>Integrasi Buku Induk Gugus Depan & Pusat Data Anggota</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                Pusat Data Terhubung
              </span>
            </div>
            <p className="text-stone-600 text-[11.5px] mt-0.5">
              Seluruh Ka Mabigus (Kepala Sekolah) dan Pembina Gudep Putra/Putri dari Buku Induk otomatis tersinkronisasi ke menu <strong>Sinkronisasi Anggota</strong> sebagai pusat data kepramukaan.
            </p>
          </div>
        </div>
        {onNavigateToMembers && (
          <button
            onClick={() => onNavigateToMembers('', 'ALL', 'Mabigus')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-950 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl transition-all shadow-2xs whitespace-nowrap self-start sm:self-auto"
          >
            <Users className="w-3.5 h-3.5 text-amber-800" />
            <span>Buka Pusat Data Anggota</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pangkalan, No Gudep..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
            />
          </div>

          {/* Jenjang Filter */}
          <div>
            <select
              value={selectedJenjang}
              onChange={(e) => setSelectedJenjang(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none font-medium"
            >
              <option value="ALL">Semua Jenjang Sekolah</option>
              <option value="SD/MI">SD / MI (Siaga)</option>
              <option value="SMP/MTs">SMP / MTs (Penggalang)</option>
              <option value="SMA/SMK/MA">SMA / SMK / MA (Penegak)</option>
              <option value="Perguruan Tinggi">Perguruan Tinggi (Pandega)</option>
            </select>
          </div>

          {/* Kelurahan Filter */}
          <div>
            <select
              value={selectedKelurahan}
              onChange={(e) => setSelectedKelurahan(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none font-medium"
            >
              <option value="ALL">Semua 11 Kelurahan</option>
              {KELURAHAN_LIST.map((k) => (
                <option key={k} value={k}>
                  Kel. {k}
                </option>
              ))}
            </select>
          </div>

          {/* Akreditasi Filter */}
          <div>
            <select
              value={selectedAkreditasi}
              onChange={(e) => setSelectedAkreditasi(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none font-medium"
            >
              <option value="ALL">Semua Status Akreditasi</option>
              <option value="A">Akreditasi A</option>
              <option value="B">Akreditasi B</option>
              <option value="C">Akreditasi C</option>
              <option value="Belum Terakreditasi">Belum Terakreditasi</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-[#E5DFD5]">
          <span>Menampilkan <strong className="text-stone-900">{filteredList.length}</strong> dari {gudepList.length} Gugus Depan</span>
          {(selectedJenjang !== 'ALL' || selectedKelurahan !== 'ALL' || selectedAkreditasi !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedJenjang('ALL');
                setSelectedKelurahan('ALL');
                setSelectedAkreditasi('ALL');
              }}
              className="text-amber-800 font-bold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Gudep Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((gudep) => (
          <div
            key={gudep.id}
            className="bg-white rounded-2xl border border-[#E5DFD5] hover:border-amber-700/60 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
          >
            {/* Top Bar */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                    Gudep {gudep.noGudepPa} - {gudep.noGudepPi}
                  </span>
                  <span className="ml-2 text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                    {gudep.jenjang}
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  gudep.akreditasi === 'A'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                  Akreditasi {gudep.akreditasi}
                </span>
              </div>

              <h3 className="text-base font-bold text-stone-900 mt-2.5 line-clamp-1">
                {gudep.namaPangkalan}
              </h3>
              
              <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-800 flex-shrink-0" />
                <span className="truncate">Kel. {gudep.kelurahan}, Tanah Sareal</span>
              </p>
            </div>

            {/* Middle Info with Pusat Data linking */}
            {(() => {
              const gudepMembers = members.filter(m => m.gudepId === gudep.id);
              const mabigusMem = gudepMembers.find(m => m.golongan === 'Mabigus' || m.namaLengkap.toLowerCase().trim() === gudep.kaMabigus.toLowerCase().trim());
              const pembinaMembers = gudepMembers.filter(m => ['Pembina', 'Pelatih'].includes(m.golongan));
              const mudaCount = gudepMembers.filter(m => ['Siaga', 'Penggalang', 'Penegak', 'Pandega'].includes(m.golongan)).length || gudep.jumlahAnggotaMuda;
              const pembinaCount = pembinaMembers.length || gudep.jumlahPembina;

              return (
                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DFD5] text-xs space-y-2">
                  {/* Ka Mabigus */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-stone-500 text-[11px] flex-shrink-0 flex items-center gap-1">
                      <span className="text-xs">👑</span> Ka Mabigus:
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-stone-900 truncate block max-w-[160px]">{gudep.kaMabigus}</span>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-300">
                          <CheckCircle2 className="w-2.5 h-2.5 text-amber-700" />
                          Terdata di Anggota
                        </span>
                        {onNavigateToMembers && (
                          <button
                            onClick={() => onNavigateToMembers(gudep.kaMabigus, gudep.id, 'Mabigus')}
                            className="text-amber-800 hover:text-amber-950 p-0.5 hover:bg-amber-100 rounded"
                            title="Buka Ka Mabigus di Pusat Data Anggota"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pembina Gudep */}
                  <div className="flex items-start justify-between gap-2 pt-1.5 border-t border-[#EAE4DC]">
                    <span className="text-stone-500 text-[11px] flex-shrink-0">Pembina Gudep:</span>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-medium text-stone-800 truncate block max-w-[150px]">{gudep.pembinaGudepPa}</span>
                        {onNavigateToMembers && (
                          <button
                            onClick={() => onNavigateToMembers(gudep.pembinaGudepPa, gudep.id, 'Pembina')}
                            className="text-stone-500 hover:text-amber-900 p-0.5"
                            title="Buka Pembina Putra di Pusat Data Anggota"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="font-normal text-[11px] text-stone-600 truncate block max-w-[150px]">{gudep.pembinaGudepPi}</span>
                        {onNavigateToMembers && (
                          <button
                            onClick={() => onNavigateToMembers(gudep.pembinaGudepPi, gudep.id, 'Pembina')}
                            className="text-stone-500 hover:text-amber-900 p-0.5"
                            title="Buka Pembina Putri di Pusat Data Anggota"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Anggota Terdata Realtime */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#EAE4DC] text-[11px]">
                    <span className="text-stone-500">Personil Terdata:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amber-950">
                        {mudaCount} Muda • {pembinaCount + 1} Pimpinan/Pembina
                      </span>
                      {onNavigateToMembers && (
                        <button
                          onClick={() => onNavigateToMembers('', gudep.id, 'ALL')}
                          className="p-1 text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200"
                          title="Buka seluruh personil pangkalan ini di Pusat Data Anggota"
                        >
                          <Users className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E5DFD5] text-xs">
              <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold ${
                gudep.statusSync === 'Tersinkronisasi'
                  ? 'text-emerald-800'
                  : 'text-amber-800'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {gudep.statusSync}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewingGudep(gudep)}
                  className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors border border-transparent hover:border-stone-200"
                  title="Lihat Detail"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEditModal(gudep)}
                  className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                  title="Edit Data Gudep"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus data Gugus Depan ${gudep.namaPangkalan}?`)) {
                      onDeleteGudep(gudep.id);
                    }
                  }}
                  className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                  title="Hapus Gudep"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* TAB 2: VERIFIKASI REGISTRASI GUDEP PUBLIK */}
  {activeMainTab === 'verifikasi_registrasi' && (
    <div className="space-y-6">
      {/* Information Banner */}
      <div className="bg-gradient-to-r from-amber-900/10 via-amber-50 to-orange-50 border border-amber-300/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-stone-950 flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
            ⚜️
          </div>
          <div>
            <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <span>Verifikasi Berkas & Akun Gugus Depan Publik</span>
              <span className="bg-amber-600 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                Portal Pengurus
              </span>
            </div>
            <p className="text-stone-600 text-xs mt-1 leading-relaxed max-w-2xl">
              Pendaftaran ini diajukan oleh Pangkalan/Mabigus melalui Portal Publik. Pengurus Kwarran berwenang memverifikasi kelengkapan identitas, sarana prasarana, serta mengaktifkan <strong>Username & Kata Sandi</strong> agar pangkalan dapat login ke dashboard resmi.
            </p>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-center shadow-2xs">
            <span className="text-[10px] text-stone-500 block uppercase font-bold">Total Masuk</span>
            <strong className="text-sm font-bold text-stone-900">{registrations.length}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-100 border border-amber-300 text-center shadow-2xs">
            <span className="text-[10px] text-amber-800 block uppercase font-bold">Menunggu</span>
            <strong className="text-sm font-bold text-amber-950">{pendingRegCount}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-100 border border-emerald-300 text-center shadow-2xs">
            <span className="text-[10px] text-emerald-800 block uppercase font-bold">Disetujui</span>
            <strong className="text-sm font-bold text-emerald-950">
              {registrations.filter(r => r.statusVerifikasi === 'Disetujui').length}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={regSearchQuery}
            onChange={(e) => setRegSearchQuery(e.target.value)}
            placeholder="Cari pangkalan, No Reg, username..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Semua Status' },
            { id: 'Menunggu Verifikasi', label: '⏳ Menunggu Verifikasi' },
            { id: 'Disetujui', label: '✓ Disetujui & Aktif' },
            { id: 'Ditolak', label: '✕ Perlu Revisi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRegStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                regStatusFilter === tab.id
                  ? 'bg-amber-900 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5DFD5] p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">
            {regSearchQuery || regStatusFilter !== 'ALL'
              ? 'Tidak ada permohonan yang sesuai dengan filter'
              : 'Belum Ada Permohonan Pendaftaran Gudep Baru'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {regSearchQuery || regStatusFilter !== 'ALL'
              ? 'Coba ganti kata kunci pencarian atau reset filter status.'
              : 'Pendaftaran yang diisi oleh publik melalui formulir di Portal Publik akan muncul di sini untuk ditinjau dan diverifikasi.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-2xl border border-[#E5DFD5] p-5 shadow-sm space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                        {reg.noRegistrasi}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {reg.tanggalRegistrasi}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-base mt-1">
                      {reg.namaPangkalan}
                    </h3>
                    <p className="text-xs text-amber-700 font-semibold mt-0.5">
                      No. Gudep: {reg.nomorGudep} • Kelurahan {reg.kelurahan}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {reg.statusVerifikasi === 'Disetujui' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Aktif
                    </span>
                  ) : reg.statusVerifikasi === 'Ditolak' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded-full border border-red-300">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      Ditolak
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300 animate-pulse">
                      ⏳ Menunggu
                    </span>
                  )}
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] space-y-1.5 text-xs text-stone-700">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Ka Mabigus:</span>
                    <strong className="text-stone-900">{reg.kaMabigus}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Pembina Gudep:</span>
                    <span className="text-stone-900">Pa: {reg.namaPembinaPa || '-'} • Pi: {reg.namaPembinaPi || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E5DFD5] pt-1.5 mt-1">
                    <span className="text-stone-500">Akun Login Dibuat:</span>
                    <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      @{reg.akunGudep.username}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Pendaftar / WhatsApp:</span>
                    <span className="text-stone-700">{reg.akunGudep.namaPendaftar} ({reg.akunGudep.noWaPendaftar})</span>
                  </div>
                </div>

                {reg.catatanVerifikasi && (
                  <div className="text-[11px] bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-stone-600">
                    <span className="font-bold block text-stone-700">Catatan Pengurus:</span>
                    {reg.catatanVerifikasi}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedRegDetail(reg)}
                  className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl border border-stone-300 flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-stone-600" />
                  <span>Lihat Kuesioner (4 Hal.)</span>
                </button>

                <div className="flex items-center gap-2">
                  {onVerifyRegistration && reg.statusVerifikasi !== 'Disetujui' && (
                    <button
                      onClick={() => {
                        if (confirm(`Verifikasi & aktifkan akun Gudep ${reg.namaPangkalan}?`)) {
                          onVerifyRegistration(reg.id, 'Disetujui', 'Disetujui oleh Pengurus Kwarran');
                        }
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Setujui & Aktifkan</span>
                    </button>
                  )}

                  {onVerifyRegistration && reg.statusVerifikasi === 'Menunggu Verifikasi' && (
                    <button
                      onClick={() => {
                        const note = prompt('Tuliskan alasan penolakan / catatan revisi:') || '';
                        onVerifyRegistration(reg.id, 'Ditolak', note);
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl border border-red-200 transition-colors"
                    >
                      Tolak
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5] my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-[#24140D] text-white">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-stone-100">
                  {editingGudep ? 'Perbarui Data Gugus Depan' : 'Formulir Pendataan Gudep Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Nama Pangkalan / Sekolah *</label>
                  <input
                    type="text"
                    required
                    value={formData.namaPangkalan}
                    onChange={(e) => setFormData({ ...formData, namaPangkalan: e.target.value })}
                    placeholder="Contoh: SDN Kebon Pedes 1"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Jenjang Satuan *</label>
                  <select
                    value={formData.jenjang}
                    onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as any })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    <option value="SD/MI">SD / MI (Perindukan Siaga)</option>
                    <option value="SMP/MTs">SMP / MTs (Pasukan Penggalang)</option>
                    <option value="SMA/SMK/MA">SMA / SMK / MA (Ambalan Penegak)</option>
                    <option value="Perguruan Tinggi">Perguruan Tinggi (Racana Pandega)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">No. Gudep Putra</label>
                  <input
                    type="text"
                    value={formData.noGudepPa}
                    onChange={(e) => setFormData({ ...formData, noGudepPa: e.target.value })}
                    placeholder="Contoh: 04.071"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">No. Gudep Putri</label>
                  <input
                    type="text"
                    value={formData.noGudepPi}
                    onChange={(e) => setFormData({ ...formData, noGudepPi: e.target.value })}
                    placeholder="Contoh: 04.072"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Kelurahan di Tanah Sareal *</label>
                  <select
                    value={formData.kelurahan}
                    onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value as any })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    {KELURAHAN_LIST.map((k) => (
                      <option key={k} value={k}>
                        Kel. {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Status Akreditasi Gudep</label>
                  <select
                    value={formData.akreditasi}
                    onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value as any })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    <option value="A">Peringkat A (Unggul)</option>
                    <option value="B">Peringkat B (Baik)</option>
                    <option value="C">Peringkat C (Cukup)</option>
                    <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-stone-800">Nama Ketua Mabigus (Kepala Sekolah)</label>
                    <span className="text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-bold">Sync ke Anggota</span>
                  </div>
                  <input
                    type="text"
                    value={formData.kaMabigus}
                    onChange={(e) => setFormData({ ...formData, kaMabigus: e.target.value })}
                    placeholder="Nama Lengkap & Gelar (Kepala Sekolah)"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                  <p className="text-[10.5px] text-stone-500 mt-1">
                    Otomatis terdaftar ke Menu Sinkronisasi Anggota sebagai <strong>Mabigus</strong>.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-stone-800">Nama Pembina Gudep Putra (KMD/KML)</label>
                    <span className="text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-bold">Sync ke Anggota</span>
                  </div>
                  <input
                    type="text"
                    value={formData.pembinaGudepPa}
                    onChange={(e) => setFormData({ ...formData, pembinaGudepPa: e.target.value })}
                    placeholder="Contoh: Ahmad Fauzi, S.Pd. (KML)"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                  <p className="text-[10.5px] text-stone-500 mt-1">
                    Otomatis terdaftar ke Menu Sinkronisasi Anggota sebagai <strong>Pembina Satuan Putra</strong>.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-stone-800">Nama Pembina Gudep Putri</label>
                    <span className="text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded font-bold">Sync ke Anggota</span>
                  </div>
                  <input
                    type="text"
                    value={formData.pembinaGudepPi}
                    onChange={(e) => setFormData({ ...formData, pembinaGudepPi: e.target.value })}
                    placeholder="Contoh: Siti Rohmah, S.Pd. (KMD)"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                  <p className="text-[10.5px] text-stone-500 mt-1">
                    Otomatis terdaftar ke Menu Sinkronisasi Anggota sebagai <strong>Pembina Satuan Putri</strong>.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Kontak WhatsApp / Telp Pangkalan</label>
                  <input
                    type="text"
                    value={formData.kontakHp}
                    onChange={(e) => setFormData({ ...formData, kontakHp: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-800 mb-1">Alamat Lengkap Pangkalan</label>
                  <input
                    type="text"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Jl. ..., RT/RW ..., Kel. ..., Kec. Tanah Sareal"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Estimasi Jumlah Anggota Muda</label>
                  <input
                    type="number"
                    value={formData.jumlahAnggotaMuda}
                    onChange={(e) => setFormData({ ...formData, jumlahAnggotaMuda: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
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
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-stone-950 bg-amber-600 hover:bg-amber-500 rounded-xl shadow border border-amber-400"
                >
                  Simpan Data Gudep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Gudep Detail Modal */}
      {viewingGudep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5]">
            <div className="flex items-center justify-between px-6 py-4 bg-[#24140D] text-white">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-stone-100">
                  Profil Lengkap Gugus Depan
                </h3>
              </div>
              <button
                onClick={() => setViewingGudep(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border-b border-[#E5DFD5] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg font-mono">
                    Gudep {viewingGudep.noGudepPa} - {viewingGudep.noGudepPi}
                  </span>
                  <span className="font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                    Jenjang {viewingGudep.jenjang}
                  </span>
                </div>
                <h2 className="text-lg font-black text-stone-900 mt-2 font-sans">
                  {viewingGudep.namaPangkalan}
                </h2>
                <p className="text-stone-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-800" />
                  {viewingGudep.alamat || `Kel. ${viewingGudep.kelurahan}, Kec. Tanah Sareal, Kota Bogor`}
                </p>
              </div>

              {/* Pangkalan Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] p-4 rounded-xl border border-[#E5DFD5]">
                <div>
                  <span className="text-stone-500 text-[11px] block">Akreditasi Satuan</span>
                  <span className="font-bold text-amber-900">Peringkat {viewingGudep.akreditasi}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px] block">Tahun Berdiri</span>
                  <span className="font-semibold text-stone-800">{viewingGudep.tahunBerdiri || '-'}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px] block">Kontak Telepon</span>
                  <span className="font-mono text-stone-800">{viewingGudep.kontakHp || '-'}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px] block">Email Pangkalan</span>
                  <span className="text-stone-800 truncate block">{viewingGudep.email || '-'}</span>
                </div>
              </div>

              {/* Personalia SISKA Terdaftar di Pusat Data Anggota */}
              {(() => {
                const gudepMembers = members.filter(m => m.gudepId === viewingGudep.id);
                const mabigusMem = gudepMembers.find(m => m.golongan === 'Mabigus' || m.namaLengkap.toLowerCase().trim() === viewingGudep.kaMabigus.toLowerCase().trim());
                const pembinaPaMem = gudepMembers.find(m => m.jenisKelamin === 'L' && ['Pembina', 'Pelatih'].includes(m.golongan));
                const pembinaPiMem = gudepMembers.find(m => m.jenisKelamin === 'P' && ['Pembina', 'Pelatih'].includes(m.golongan));

                return (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-800" />
                        <span>Struktur Pimpinan & Pembina (Pusat Data Anggota)</span>
                      </h4>
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                        Tersinkronisasi Otomatis
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Ka Mabigus Card */}
                      <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-200 text-stone-900 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            👑
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-950 text-xs truncate">{viewingGudep.kaMabigus}</span>
                              <span className="text-[9.5px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300 flex-shrink-0">
                                Ka Mabigus
                              </span>
                            </div>
                            <p className="text-[10.5px] text-stone-500 truncate mt-0.5">
                              NTA: <span className="font-mono">{mabigusMem?.nta || 'Terdata di Pusat Data'}</span> • Gol: Mabigus
                            </p>
                          </div>
                        </div>

                        {onNavigateToMembers && (
                          <button
                            onClick={() => {
                              setViewingGudep(null);
                              onNavigateToMembers(viewingGudep.kaMabigus, viewingGudep.id, 'Mabigus');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-amber-950 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs whitespace-nowrap flex-shrink-0"
                          >
                            <span>Buka Profil</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Pembina Pa Card */}
                      <div className="p-3 bg-white rounded-xl border border-[#E5DFD5] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            Pa
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-xs truncate">{viewingGudep.pembinaGudepPa}</span>
                              <span className="text-[9.5px] font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 flex-shrink-0">
                                Pembina Pa
                              </span>
                            </div>
                            <p className="text-[10.5px] text-stone-500 truncate mt-0.5">
                              NTA: <span className="font-mono">{pembinaPaMem?.nta || '-'}</span>
                            </p>
                          </div>
                        </div>

                        {onNavigateToMembers && (
                          <button
                            onClick={() => {
                              setViewingGudep(null);
                              onNavigateToMembers(viewingGudep.pembinaGudepPa, viewingGudep.id, 'Pembina');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg whitespace-nowrap flex-shrink-0"
                          >
                            <span>Buka Profil</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Pembina Pi Card */}
                      <div className="p-3 bg-white rounded-xl border border-[#E5DFD5] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-900 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            Pi
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-xs truncate">{viewingGudep.pembinaGudepPi}</span>
                              <span className="text-[9.5px] font-semibold text-rose-900 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 flex-shrink-0">
                                Pembina Pi
                              </span>
                            </div>
                            <p className="text-[10.5px] text-stone-500 truncate mt-0.5">
                              NTA: <span className="font-mono">{pembinaPiMem?.nta || '-'}</span>
                            </p>
                          </div>
                        </div>

                        {onNavigateToMembers && (
                          <button
                            onClick={() => {
                              setViewingGudep(null);
                              onNavigateToMembers(viewingGudep.pembinaGudepPi, viewingGudep.id, 'Pembina');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg whitespace-nowrap flex-shrink-0"
                          >
                            <span>Buka Profil</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* All Members CTA */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                      <div>
                        <span className="font-bold text-stone-900 text-xs block">
                          Total {gudepMembers.length} Personel Terdaftar di Pangkalan Ini
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Semua data tersimpan terpusat di menu Sinkronisasi Anggota.
                        </span>
                      </div>
                      {onNavigateToMembers && (
                        <button
                          onClick={() => {
                            setViewingGudep(null);
                            onNavigateToMembers('', viewingGudep.id, 'ALL');
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-950 bg-amber-600 hover:bg-amber-500 rounded-xl shadow-xs transition-all border border-amber-400 whitespace-nowrap"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Buka di Menu Sinkronisasi Anggota</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setViewingGudep(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Registration Detail & Questionnaire Verification Modal */}
      {selectedRegDetail && onVerifyRegistration && (
        <GudepRegistrationDetailModal
          registration={selectedRegDetail}
          onClose={() => setSelectedRegDetail(null)}
          onVerify={onVerifyRegistration}
        />
      )}
    </div>
  );
};
