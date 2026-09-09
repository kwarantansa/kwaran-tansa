import React, { useState } from 'react';
import {
  X,
  Building2,
  UserCheck,
  Award,
  Compass,
  Globe,
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
  Check,
  Upload,
  Loader2
} from 'lucide-react';
import { GudepRegistration, Gudep, KelurahanTanahSareal, JenjangSekolah } from '../types';
import { KELURAHAN_LIST } from '../data/initialData';
import { compressImageFile, normalizeImageUrl } from '../utils/imageCompressor';

interface EditGudepProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration?: GudepRegistration | null;
  gudep?: Gudep | null;
  onSave: (updatedRegistration: GudepRegistration) => Promise<void>;
}

const KEGIATAN_OPTIONS = [
  'Latihan Rutin Mingguan',
  'Perkemahan Sabtu-Minggu (Persami)',
  'Lomba Tingkat (LT-I / LT-II)',
  'Ujian Kenaikan Tingkat SKU / SKK',
  'Gladian Pemimpin Regu (Dianpinru / Dianpinsat)',
  'Peringatan Hari Pramuka & HUT Gugus Depan',
  'Bakti Lingkungan & Penanaman Pohon',
  'Karnaval & Pawai Pramuka',
  'Pelantikan Penegak Bantara & Laksana',
  'Bakti Sosial Ramadhan / Bumbung Kemanusiaan'
];

const SARANA_OPTIONS = [
  'Sanggar Pramuka Khusus',
  'Tiang Bendera Gudep',
  'Papan Nama Gugus Depan',
  'Tenda Regu / Dome Pramuka',
  'Tongkat & Tali Pramuka Lengkap',
  'Bendera Semaphore & Peluit',
  'Buku Panduan SKU/SKK Lengkap',
  'Peralatan P3K Lengkap',
  'Kompas Bidik & Peta Topografi',
  'Alat Memasak / Dapur Lapangan',
  'Komputer / Laptop Administrasi Gudep',
  'Akses Internet / WiFi Pangkalan'
];

export const EditGudepProfileModal: React.FC<EditGudepProfileModalProps> = ({
  isOpen,
  onClose,
  registration,
  gudep,
  onSave
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'identitas' | 'pimpinan' | 'anggota' | 'sarana' | 'medsos'>('identitas');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingFoto, setIsProcessingFoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State initialized from registration or gudep
  const [formData, setFormData] = useState<GudepRegistration>(() => {
    if (registration) return { ...registration };

    // Fallback if registration is null but gudep exists
    return {
      id: gudep?.id || `reg-gudep-${Date.now()}`,
      noRegistrasi: `REG-GD-${Date.now()}`,
      tanggalRegistrasi: new Date().toISOString().slice(0, 10),
      statusVerifikasi: 'Disetujui',
      namaPangkalan: gudep?.namaPangkalan || '',
      nomorGudep: `${gudep?.noGudepPa || '04.000'} / ${gudep?.noGudepPi || '04.000'}`,
      noGudepPa: gudep?.noGudepPa || '04.',
      noGudepPi: gudep?.noGudepPi || '04.',
      jenjang: gudep?.jenjang || 'SD/MI',
      statusSekolah: 'Negeri',
      npsn: '',
      kelurahan: gudep?.kelurahan || 'Kebon Pedes',
      alamat: gudep?.alamat || '',
      kaMabigus: gudep?.kaMabigus || '',
      jabatanKaMabigus: 'Kepala Sekolah',
      noHpKaMabigus: gudep?.kontakHp || '',
      namaPembinaPa: gudep?.pembinaGudepPa || '',
      ntaPembinaPa: '',
      noHpPembinaPa: gudep?.kontakHp || '',
      kursusPembinaPa: 'KMD',
      jumlahPembinaPa: 1,
      namaPembinaPi: gudep?.pembinaGudepPi || '',
      ntaPembinaPi: '',
      noHpPembinaPi: '',
      kursusPembinaPi: 'KMD',
      jumlahPembinaPi: 1,
      jumlahSiagaPa: 0,
      jumlahSiagaPi: 0,
      jumlahPenggalangPa: 15,
      jumlahPenggalangPi: 15,
      jumlahPenegakPa: 0,
      jumlahPenegakPi: 0,
      jumlahPandegaPa: 0,
      jumlahPandegaPi: 0,
      kegiatanGudep: ['Latihan Rutin Mingguan', 'Perkemahan Sabtu-Minggu (Persami)'],
      prestasi3Tahun: gudep?.prestasi?.join(', ') || '',
      saranaPrasarana: ['Papan Nama Gugus Depan', 'Tongkat & Tali Pramuka Lengkap'],
      potensiGudep: ['Kedisiplinan', 'Pionering'],
      kendalaGudep: [],
      kebutuhanPembinaan: ['Pelatihan Pembina Mahir (KMD/KML)'],
      mediaSosial: {
        instagram: '',
        facebook: '',
        tiktok: '',
        website: ''
      },
      akunGudep: {
        username: (gudep?.namaPangkalan || 'gudep').toLowerCase().replace(/[^a-z0-9]/g, ''),
        password: 'password123',
        namaPendaftar: gudep?.pembinaGudepPa || gudep?.kaMabigus || 'Pembina Gudep',
        noWaPendaftar: gudep?.kontakHp || '',
        emailPendaftar: gudep?.email || ''
      }
    };
  });

  const [customKegiatan, setCustomKegiatan] = useState('');
  const [customSarana, setCustomSarana] = useState('');
  const [customPotensi, setCustomPotensi] = useState('');

  const toggleKegiatan = (keg: string) => {
    const list = formData.kegiatanGudep || [];
    if (list.includes(keg)) {
      setFormData({ ...formData, kegiatanGudep: list.filter(item => item !== keg) });
    } else {
      setFormData({ ...formData, kegiatanGudep: [...list, keg] });
    }
  };

  const addCustomKegiatan = () => {
    if (!customKegiatan.trim()) return;
    const list = formData.kegiatanGudep || [];
    if (!list.includes(customKegiatan.trim())) {
      setFormData({ ...formData, kegiatanGudep: [...list, customKegiatan.trim()] });
    }
    setCustomKegiatan('');
  };

  const toggleSarana = (sar: string) => {
    const list = formData.saranaPrasarana || [];
    if (list.includes(sar)) {
      setFormData({ ...formData, saranaPrasarana: list.filter(item => item !== sar) });
    } else {
      setFormData({ ...formData, saranaPrasarana: [...list, sar] });
    }
  };

  const addCustomSarana = () => {
    if (!customSarana.trim()) return;
    const list = formData.saranaPrasarana || [];
    if (!list.includes(customSarana.trim())) {
      setFormData({ ...formData, saranaPrasarana: [...list, customSarana.trim()] });
    }
    setCustomSarana('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.namaPangkalan.trim()) {
      setErrorMsg('Nama Pangkalan tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    try {
      // Sync formatted nomorGudep string
      const updated: GudepRegistration = {
        ...formData,
        nomorGudep: `${formData.noGudepPa} / ${formData.noGudepPi}`,
      };

      await onSave(updated);
      setSuccessMsg('Data Gugus Depan berhasil diperbarui!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Error saving Gudep profile:', err);
      setErrorMsg(err.message || 'Gagal menyimpan data profil gudep.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1C0E07] border border-[#442315] text-stone-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2B140A] to-[#1E0E06] px-6 py-4 border-b border-[#3D1F13] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl">
              ⚜️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Ubah & Edit Profil Gugus Depan</span>
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  Mandiri Gudep
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Pangkalan: <strong className="text-amber-300">{formData.namaPangkalan}</strong> ({formData.noGudepPa} / {formData.noGudepPi})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-2 rounded-xl hover:bg-[#33180D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-[#170B05] border-b border-[#331A0F] overflow-x-auto text-xs font-semibold flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('identitas')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'identitas'
                ? 'bg-amber-600 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-white hover:bg-[#261309]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Identitas & Lokasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pimpinan')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'pimpinan'
                ? 'bg-amber-600 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-white hover:bg-[#261309]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>2. Pimpinan & Pembina</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('anggota')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'anggota'
                ? 'bg-amber-600 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-white hover:bg-[#261309]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>3. Peserta Didik & Kegiatan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sarana')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'sarana'
                ? 'bg-amber-600 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-white hover:bg-[#261309]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Sarana & Potensi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('medsos')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'medsos'
                ? 'bg-amber-600 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-white hover:bg-[#261309]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>5. Media & Dokumen</span>
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: IDENTITAS & LOKASI */}
          {activeTab === 'identitas' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Nama Pangkalan / Sekolah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaPangkalan}
                    onChange={(e) => setFormData({ ...formData, namaPangkalan: e.target.value })}
                    placeholder="Contoh: SDN Kebon Pedes 1"
                    className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    NPSN (Nomor Pokok Sekolah Nasional)
                  </label>
                  <input
                    type="text"
                    value={formData.npsn || ''}
                    onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                    placeholder="Contoh: 20220345"
                    className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    No. Gudep Putra (Pa) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.noGudepPa}
                    onChange={(e) => setFormData({ ...formData, noGudepPa: e.target.value })}
                    placeholder="04.071"
                    className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    No. Gudep Putri (Pi) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.noGudepPi}
                    onChange={(e) => setFormData({ ...formData, noGudepPi: e.target.value })}
                    placeholder="04.072"
                    className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Jenjang Sekolah *
                  </label>
                  <select
                    value={formData.jenjang}
                    onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as JenjangSekolah })}
                    className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="SD/MI">SD / MI</option>
                    <option value="SMP/MTs">SMP / MTs</option>
                    <option value="SMA/SMK/MA">SMA / SMK / MA</option>
                    <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Status Sekolah
                  </label>
                  <select
                    value={formData.statusSekolah || 'Negeri'}
                    onChange={(e) => setFormData({ ...formData, statusSekolah: e.target.value as 'Negeri' | 'Swasta' })}
                    className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Negeri">Negeri</option>
                    <option value="Swasta">Swasta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Kelurahan (Tanah Sareal) *
                  </label>
                  <select
                    value={formData.kelurahan}
                    onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value as KelurahanTanahSareal })}
                    className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    {KELURAHAN_LIST.map((kel) => (
                      <option key={kel} value={kel}>{kel}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-stone-300 font-semibold mb-1">
                    Alamat Lengkap Pangkalan *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Jalan, RT/RW, nomor gedung pangkalan..."
                    className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PIMPINAN & PEMBINA */}
          {activeTab === 'pimpinan' && (
            <div className="space-y-5">
              {/* Mabigus */}
              <div className="bg-[#24130A] p-4 rounded-xl border border-[#3E2013] space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span>Ketua Majelis Pembimbing Gugus Depan (Ka Mabigus)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Nama Lengkap Ka Mabigus *</label>
                    <input
                      type="text"
                      required
                      value={formData.kaMabigus}
                      onChange={(e) => setFormData({ ...formData, kaMabigus: e.target.value })}
                      placeholder="Nama lengkap beserta gelar..."
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Jabatan Formal</label>
                    <input
                      type="text"
                      value={formData.jabatanKaMabigus || 'Kepala Sekolah'}
                      onChange={(e) => setFormData({ ...formData, jabatanKaMabigus: e.target.value })}
                      placeholder="Contoh: Kepala Sekolah / Pimpinan Pondok"
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">No. HP / WhatsApp Mabigus</label>
                    <input
                      type="text"
                      value={formData.noHpKaMabigus || ''}
                      onChange={(e) => setFormData({ ...formData, noHpKaMabigus: e.target.value })}
                      placeholder="0812xxxxxxxx"
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pembina Gudep Putra */}
              <div className="bg-[#24130A] p-4 rounded-xl border border-[#3E2013] space-y-3">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span>Pembina Gugus Depan Satuan Putra</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Nama Pembina Putra *</label>
                    <input
                      type="text"
                      required
                      value={formData.namaPembinaPa}
                      onChange={(e) => setFormData({ ...formData, namaPembinaPa: e.target.value })}
                      placeholder="Nama pembina putra..."
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">NTA Pembina Putra</label>
                    <input
                      type="text"
                      value={formData.ntaPembinaPa || ''}
                      onChange={(e) => setFormData({ ...formData, ntaPembinaPa: e.target.value })}
                      placeholder="09.02.04.xxx"
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">No. HP / WA Pembina Putra</label>
                    <input
                      type="text"
                      value={formData.noHpPembinaPa || ''}
                      onChange={(e) => setFormData({ ...formData, noHpPembinaPa: e.target.value })}
                      placeholder="08xxxxxxxx"
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Kualifikasi Kursus Mahir</label>
                    <select
                      value={formData.kursusPembinaPa || 'KMD'}
                      onChange={(e) => setFormData({ ...formData, kursusPembinaPa: e.target.value as any })}
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Belum KMD">Belum KMD</option>
                      <option value="KMD">KMD (Kursus Mahir Dasar)</option>
                      <option value="KML">KML (Kursus Mahir Lanjutan)</option>
                      <option value="KPD">KPD (Pelatih Dasar)</option>
                      <option value="KPL">KPL (Pelatih Lanjutan)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Total Pembina Satuan Putra (Orang)</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.jumlahPembinaPa || 1}
                      onChange={(e) => setFormData({ ...formData, jumlahPembinaPa: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pembina Gudep Putri */}
              <div className="bg-[#24130A] p-4 rounded-xl border border-[#3E2013] space-y-3">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span>Pembina Gugus Depan Satuan Putri</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Nama Pembina Putri *</label>
                    <input
                      type="text"
                      required
                      value={formData.namaPembinaPi}
                      onChange={(e) => setFormData({ ...formData, namaPembinaPi: e.target.value })}
                      placeholder="Nama pembina putri..."
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">NTA Pembina Putri</label>
                    <input
                      type="text"
                      value={formData.ntaPembinaPi || ''}
                      onChange={(e) => setFormData({ ...formData, ntaPembinaPi: e.target.value })}
                      placeholder="09.02.04.xxx"
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">No. HP / WA Pembina Putri</label>
                    <input
                      type="text"
                      value={formData.noHpPembinaPi || ''}
                      onChange={(e) => setFormData({ ...formData, noHpPembinaPi: e.target.value })}
                      placeholder="08xxxxxxxx"
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Kualifikasi Kursus Mahir</label>
                    <select
                      value={formData.kursusPembinaPi || 'KMD'}
                      onChange={(e) => setFormData({ ...formData, kursusPembinaPi: e.target.value as any })}
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Belum KMD">Belum KMD</option>
                      <option value="KMD">KMD (Kursus Mahir Dasar)</option>
                      <option value="KML">KML (Kursus Mahir Lanjutan)</option>
                      <option value="KPD">KPD (Pelatih Dasar)</option>
                      <option value="KPL">KPL (Pelatih Lanjutan)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Total Pembina Satuan Putri (Orang)</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.jumlahPembinaPi || 1}
                      onChange={(e) => setFormData({ ...formData, jumlahPembinaPi: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PESERTA DIDIK & KEGIATAN */}
          {activeTab === 'anggota' && (
            <div className="space-y-5">
              <div className="bg-[#24130A] p-4 rounded-xl border border-[#3E2013] space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Estimasi Jumlah Peserta Didik Aktif
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#1B0C06] p-3 rounded-lg border border-[#3A1D11]">
                    <span className="text-stone-400 block mb-1">Siaga Pa / Pi</span>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={formData.jumlahSiagaPa || 0}
                        onChange={(e) => setFormData({ ...formData, jumlahSiagaPa: parseInt(e.target.value) || 0 })}
                        className="w-1/2 p-1.5 bg-[#2B140A] text-white text-center rounded border border-[#482415]"
                        placeholder="Pa"
                      />
                      <input
                        type="number"
                        min={0}
                        value={formData.jumlahSiagaPi || 0}
                        onChange={(e) => setFormData({ ...formData, jumlahSiagaPi: parseInt(e.target.value) || 0 })}
                        className="w-1/2 p-1.5 bg-[#2B140A] text-white text-center rounded border border-[#482415]"
                        placeholder="Pi"
                      />
                    </div>
                  </div>

                  <div className="bg-[#1B0C06] p-3 rounded-lg border border-[#3A1D11]">
                    <span className="text-stone-400 block mb-1">Penggalang Pa / Pi</span>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={formData.jumlahPenggalangPa || 0}
                        onChange={(e) => setFormData({ ...formData, jumlahPenggalangPa: parseInt(e.target.value) || 0 })}
                        className="w-1/2 p-1.5 bg-[#2B140A] text-white text-center rounded border border-[#482415]"
                        placeholder="Pa"
                      />
                      <input
                        type="number"
                        min={0}
                        value={formData.jumlahPenggalangPi || 0}
                        onChange={(e) => setFormData({ ...formData, jumlahPenggalangPi: parseInt(e.target.value) || 0 })}
                        className="w-1/2 p-1.5 bg-[#2B140A] text-white text-center rounded border border-[#482415]"
                        placeholder="Pi"
                      />
                    </div>
                  </div>

                  <div className="bg-[#1B0C06] p-3 rounded-lg border border-[#3A1D11]">
                    <span className="text-stone-400 block mb-1">Penegak Pa / Pi</span>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={formData.jumlahPenegakPa || 0}
                        onChange={(e) => setFormData({ ...formData, jumlahPenegakPa: parseInt(e.target.value) || 0 })}
                        className="w-1/2 p-1.5 bg-[#2B140A] text-white text-center rounded border border-[#482415]"
                        placeholder="Pa"
                      />
                      <input
                        type="number"
                        min={0}
                        value={formData.jumlahPenegakPi || 0}
                        onChange={(e) => setFormData({ ...formData, jumlahPenegakPi: parseInt(e.target.value) || 0 })}
                        className="w-1/2 p-1.5 bg-[#2B140A] text-white text-center rounded border border-[#482415]"
                        placeholder="Pi"
                      />
                    </div>
                  </div>

                  <div className="bg-[#1B0C06] p-3 rounded-lg border border-[#3A1D11]">
                    <span className="text-stone-400 block mb-1">Pandega Pa / Pi</span>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={formData.jumlahPandegaPa || 0}
                        onChange={(e) => setFormData({ ...formData, jumlahPandegaPa: parseInt(e.target.value) || 0 })}
                        className="w-1/2 p-1.5 bg-[#2B140A] text-white text-center rounded border border-[#482415]"
                        placeholder="Pa"
                      />
                      <input
                        type="number"
                        min={0}
                        value={formData.jumlahPandegaPi || 0}
                        onChange={(e) => setFormData({ ...formData, jumlahPandegaPi: parseInt(e.target.value) || 0 })}
                        className="w-1/2 p-1.5 bg-[#2B140A] text-white text-center rounded border border-[#482415]"
                        placeholder="Pi"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Prestasi 3 Tahun Terakhir */}
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Prestasi & Kejuaraan Kepramukaan 3 Tahun Terakhir
                </label>
                <textarea
                  rows={3}
                  value={formData.prestasi3Tahun || ''}
                  onChange={(e) => setFormData({ ...formData, prestasi3Tahun: e.target.value })}
                  placeholder="Contoh: Juara 1 Pionering LT-II 2025, Juara Harapan PBB Kreasi Hari Pramuka 2024..."
                  className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Kegiatan Gudep */}
              <div className="space-y-2">
                <label className="block text-stone-300 font-semibold">
                  Kegiatan Rutin & Program Kerja Gudep
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#221108] p-3 rounded-xl border border-[#3C1D10]">
                  {KEGIATAN_OPTIONS.map((keg) => {
                    const isChecked = (formData.kegiatanGudep || []).includes(keg);
                    return (
                      <label
                        key={keg}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-amber-950/60 text-amber-200 border border-amber-500/30' : 'text-stone-300 hover:bg-[#2C150B]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleKegiatan(keg)}
                          className="rounded accent-amber-500"
                        />
                        <span className="text-xs">{keg}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customKegiatan}
                    onChange={(e) => setCustomKegiatan(e.target.value)}
                    placeholder="Tambah kegiatan lain..."
                    className="flex-1 px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomKegiatan}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SARANA, POTENSI & KEBUTUHAN */}
          {activeTab === 'sarana' && (
            <div className="space-y-5">
              {/* Sarana & Prasarana */}
              <div className="space-y-2">
                <label className="block text-stone-300 font-semibold">
                  Sarana & Prasarana Kepramukaan yang Dimiliki
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#221108] p-3 rounded-xl border border-[#3C1D10]">
                  {SARANA_OPTIONS.map((sar) => {
                    const isChecked = (formData.saranaPrasarana || []).includes(sar);
                    return (
                      <label
                        key={sar}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-amber-950/60 text-amber-200 border border-amber-500/30' : 'text-stone-300 hover:bg-[#2C150B]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSarana(sar)}
                          className="rounded accent-amber-500"
                        />
                        <span className="text-xs">{sar}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSarana}
                    onChange={(e) => setCustomSarana(e.target.value)}
                    placeholder="Tambah sarana prasarana lain..."
                    className="flex-1 px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomSarana}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* Potensi Pangkalan */}
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Potensi & Keunggulan Khusus Pangkalan
                </label>
                <textarea
                  rows={2}
                  value={(formData.potensiGudep || []).join(', ')}
                  onChange={(e) => setFormData({ ...formData, potensiGudep: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Contoh: Lingkungan hijau asri, Tim Pionering tangguh, Pasukan PBB terlatih..."
                  className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Kebutuhan Pembinaan dari Kwarran */}
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Kebutuhan Pembinaan / Bimbingan dari Kwartir Ranting
                </label>
                <textarea
                  rows={2}
                  value={(formData.kebutuhanPembinaan || []).join(', ')}
                  onChange={(e) => setFormData({ ...formData, kebutuhanPembinaan: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Contoh: Bimbingan teknis administrasi KTA digital, Kursus Mahir Dasar (KMD) bagi guru muda..."
                  className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: MEDIA SOSIAL, DOKUMEN & KONTAK */}
          {activeTab === 'medsos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Akun Instagram Pramuka Pangkalan
                  </label>
                  <input
                    type="text"
                    value={formData.mediaSosial?.instagram || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      mediaSosial: { ...formData.mediaSosial, instagram: e.target.value }
                    })}
                    placeholder="@pramuka_namapangkalan"
                    className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Website / Linktree Pangkalan
                  </label>
                  <input
                    type="text"
                    value={formData.mediaSosial?.website || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      mediaSosial: { ...formData.mediaSosial, website: e.target.value }
                    })}
                    placeholder="https://sekolah.sch.id/pramuka"
                    className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Tautan URL SK Gudep / Dokumen Pendirian
                  </label>
                  <input
                    type="text"
                    value={formData.skGudepUrl || ''}
                    onChange={(e) => setFormData({ ...formData, skGudepUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">
                    Foto Papan Nama / Logo Gugus Depan
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.fotoPapanNamaUrl || ''}
                        onChange={(e) => setFormData({ ...formData, fotoPapanNamaUrl: e.target.value })}
                        onBlur={() => {
                          if (formData.fotoPapanNamaUrl) {
                            const normalized = normalizeImageUrl(formData.fotoPapanNamaUrl);
                            if (normalized !== formData.fotoPapanNamaUrl) {
                              setFormData({ ...formData, fotoPapanNamaUrl: normalized });
                            }
                          }
                        }}
                        placeholder="https://images.unsplash.com/... atau link Google Drive / Upload"
                        className="flex-1 px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                      />
                      <label className={`px-3 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm ${isProcessingFoto ? 'opacity-50 pointer-events-none' : ''}`}>
                        {isProcessingFoto ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setIsProcessingFoto(true);
                              const compressed = await compressImageFile(file, 640, 640, 0.85);
                              setFormData({ ...formData, fotoPapanNamaUrl: compressed });
                            } catch (err: any) {
                              setErrorMsg(err.message || 'Gagal memproses gambar papan nama.');
                            } finally {
                              setIsProcessingFoto(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                    {formData.fotoPapanNamaUrl && (
                      <div className="flex items-center gap-2 p-2 bg-[#1F0E06] border border-[#3E1E0F] rounded-lg">
                        <img 
                          src={formData.fotoPapanNamaUrl} 
                          alt="Preview Papan Nama" 
                          className="w-10 h-10 object-cover rounded-md border border-amber-500/30"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span className="text-[11px] text-emerald-400 font-medium">Gambar berhasil terpasang</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, fotoPapanNamaUrl: '' })}
                          className="ml-auto text-[11px] text-red-400 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#24130A] p-4 rounded-xl border border-[#3E2013] space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Kontak Person Penanggung Jawab Akun
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Nama Kontak Person</label>
                    <input
                      type="text"
                      value={formData.akunGudep?.namaPendaftar || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        akunGudep: { ...formData.akunGudep, namaPendaftar: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">No. WhatsApp Aktif</label>
                    <input
                      type="text"
                      value={formData.akunGudep?.noWaPendaftar || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        akunGudep: { ...formData.akunGudep, noWaPendaftar: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-[11px] mb-1">Email Pangkalan</label>
                    <input
                      type="email"
                      value={formData.akunGudep?.emailPendaftar || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        akunGudep: { ...formData.akunGudep, emailPendaftar: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-[#1B0C06] border border-[#3D1E12] rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#3D1F13]">
            <span className="text-stone-400 text-xs">
              * Perubahan otomatis tersinkron ke pusat database Kwarran Tanah Sareal
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-[#2D160D] hover:bg-[#3D1F13] text-stone-300 font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
