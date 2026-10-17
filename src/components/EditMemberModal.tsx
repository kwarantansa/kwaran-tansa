import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Users,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  Trash2,
  Loader2,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Member, GolonganPramuka, TingkatanPramuka, StatusKTA } from '../types';
import { compressImageFile, normalizeImageUrl } from '../utils/imageCompressor';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  pangkalanName: string;
  noGudepPa: string;
  noGudepPi: string;
  kelurahan: string;
  onSave: (member: Member) => Promise<void>;
}

const TINGKATAN_OPTIONS: Record<GolonganPramuka, TingkatanPramuka[]> = {
  Siaga: ['Siaga Mula', 'Siaga Bantu', 'Siaga Tata', 'Siaga Garuda'],
  Penggalang: ['Penggalang Ramu', 'Penggalang Rakit', 'Penggalang Terap', 'Penggalang Garuda'],
  Penegak: ['Penegak Bantara', 'Penegak Laksana', 'Penegak Garuda'],
  Pandega: ['Pandega', 'Pandega Garuda'],
  Pembina: ['Pembina Satuan', 'Pembina Mahir Dasar (KMD)', 'Pembina Mahir Lanjutan (KML)'],
  Pelatih: ['Pelatih Dasar (KPD)', 'Pelatih Lanjutan (KPL)'],
  Andalan: ['Pembina Satuan', 'Pembina Mahir Dasar (KMD)', 'Pembina Mahir Lanjutan (KML)'],
  Mabigus: ['Ketua Mabigus', 'Pembina Satuan'],
};

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  pangkalanName,
  noGudepPa,
  noGudepPi,
  kelurahan,
  onSave
}) => {
  if (!isOpen) return null;

  const isEditing = !!member;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Member>(() => {
    if (member) return { ...member };

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return {
      id: `mem-${Date.now()}`,
      nta: `09.02.04.${noGudepPa.replace(/[^0-9]/g, '') || '071'}.${randomSuffix}`,
      nik: '',
      namaLengkap: '',
      jenisKelamin: 'L',
      tempatLahir: 'Bogor',
      tanggalLahir: '2013-05-12',
      agama: 'Islam',
      golongan: 'Penggalang',
      tingkatan: 'Penggalang Ramu',
      jabatan: 'Anggota Regu',
      gudepId: `gudep-${noGudepPa}`,
      namaPangkalan: pangkalanName,
      noGudep: noGudepPa,
      kelurahan: (kelurahan as any) || 'Kebon Pedes',
      alamatRumah: '',
      noTelepon: '',
      fotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=face',
      golonganDarah: 'O',
      statusKta: 'Menunggu Verifikasi',
      statusSync: 'Tersinkronisasi',
      kualifikasiKursus: 'Belum',
      berlakuKtaSampai: '2028-12-31',
      tanggalBergabung: new Date().toISOString().slice(0, 10),
      inputSource: 'gudep',
      inputBy: pangkalanName,
      inputDate: new Date().toISOString().slice(0, 10)
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Photo upload states
  const [photoTab, setPhotoTab] = useState<'upload' | 'url'>('upload');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // When gender changes, update noGudep default if appropriate
  const handleGenderChange = (jk: 'L' | 'P') => {
    const newGudep = jk === 'L' ? noGudepPa : noGudepPi;
    const defaultPhoto = jk === 'L' 
      ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=face'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face';

    setFormData(prev => ({
      ...prev,
      jenisKelamin: jk,
      noGudep: newGudep,
      fotoUrl: prev.fotoUrl.includes('unsplash') ? defaultPhoto : prev.fotoUrl
    }));
  };

  const handleGolonganChange = (gol: GolonganPramuka) => {
    const availableTingkatan = TINGKATAN_OPTIONS[gol] || ['Penggalang Ramu'];
    setFormData(prev => ({
      ...prev,
      golongan: gol,
      tingkatan: availableTingkatan[0]
    }));
  };

  // Process file upload from device
  const handleProcessPhotoFile = async (file: File) => {
    setPhotoError(null);
    setPhotoSuccessMsg(null);

    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg|gif|bmp|avif)$/i.test(file.name);
    if (!isImage) {
      setPhotoError('Mohon pilih file gambar yang valid (JPG, PNG, WEBP, atau format foto lainnya).');
      return;
    }

    try {
      setIsProcessingPhoto(true);
      // Compress and optimize image to high-fidelity, web-friendly data URL
      const optimizedDataUrl = await compressImageFile(file, 480, 560, 0.88);
      
      setFormData(prev => ({
        ...prev,
        fotoUrl: optimizedDataUrl
      }));
      setUploadedFileName(file.name);
      setPhotoSuccessMsg(`Foto "${file.name}" berhasil dimuat dari perangkat!`);
      setTimeout(() => setPhotoSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Error processing photo:', err);
      setPhotoError(err.message || 'Gagal memproses file foto dari perangkat.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcessPhotoFile(file);
    }
    e.target.value = '';
  };

  const handleDropPhoto = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleProcessPhotoFile(file);
    }
  };

  const handleResetToDefaultPhoto = () => {
    const defaultPhoto = formData.jenisKelamin === 'L'
      ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=face'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face';

    setFormData(prev => ({ ...prev, fotoUrl: defaultPhoto }));
    setUploadedFileName(null);
    setPhotoSuccessMsg('Foto dikembalikan ke foto standar.');
    setTimeout(() => setPhotoSuccessMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.namaLengkap.trim()) {
      setErrorMsg('Nama lengkap anggota harus diisi.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        fotoUrl: normalizeImageUrl(formData.fotoUrl),
        inputSource: formData.inputSource || 'gudep',
        inputBy: formData.inputBy || pangkalanName,
        inputDate: formData.inputDate || new Date().toISOString().slice(0, 10)
      });
      onClose();
    } catch (err: any) {
      console.error('Error saving member:', err);
      setErrorMsg(err.message || 'Gagal menyimpan data anggota.');
    } finally {
      setIsSaving(false);
    }
  };

  const availableTingkatans = TINGKATAN_OPTIONS[formData.golongan] || ['Penggalang Ramu', 'Penggalang Rakit', 'Penggalang Terap'];

  const isCustomPhoto = !formData.fotoUrl.includes('unsplash.com') && formData.fotoUrl.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1D0F08] border border-[#442316] text-stone-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2B140A] to-[#1E0E06] px-6 py-4 border-b border-[#3D1F13] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl">
              ⚜️
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isEditing ? 'Ubah & Edit Data Anggota' : 'Tambah Anggota Pramuka Baru'}</span>
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  {pangkalanName}
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                NTA: <span className="font-mono text-amber-300">{formData.nta}</span> • Gudep: {formData.noGudep}
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

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* UPLOAD FOTO PROFIL SECTION */}
          <div className="bg-[#241208] border border-[#48281A] rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3D1F13] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Camera className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-stone-200 text-xs sm:text-sm">
                    Foto Profil Anggota (Pasfoto KTA)
                  </h4>
                  <p className="text-[10px] text-stone-400">
                    Gunakan foto berseragam Pramuka resmi dengan latar rapi
                  </p>
                </div>
              </div>

              {/* Mode Selector Tabs */}
              <div className="flex items-center gap-1 bg-[#190C05] p-1 rounded-xl border border-[#3E1F11]">
                <button
                  type="button"
                  onClick={() => setPhotoTab('upload')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    photoTab === 'upload'
                      ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoTab('url')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    photoTab === 'url'
                      ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Tautan URL</span>
                </button>
              </div>
            </div>

            {/* Photo preview + upload action area */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start pt-1">
              {/* Preview image */}
              <div className="relative flex-shrink-0 group">
                <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-amber-500/40 bg-stone-900 shadow-lg relative">
                  <img
                    src={formData.fotoUrl}
                    alt="Preview Pasfoto Anggota"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=face';
                    }}
                  />
                  {isProcessingPhoto && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1 text-amber-400 text-[10px]">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  )}
                </div>
                <div className="mt-1 text-center">
                  <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Pasfoto KTA
                  </span>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-2.5">
                {photoTab === 'upload' ? (
                  <>
                    {/* Drag and Drop / Click Upload Box */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingPhoto(true);
                      }}
                      onDragLeave={() => setIsDraggingPhoto(false)}
                      onDrop={handleDropPhoto}
                      className={`border-2 border-dashed rounded-xl p-3.5 text-center transition-all cursor-pointer ${
                        isDraggingPhoto
                          ? 'border-amber-400 bg-amber-950/40'
                          : 'border-[#4E2B19] hover:border-amber-500/60 bg-[#1D0E07]'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="font-semibold text-stone-200 text-xs">
                          Klik untuk <span className="text-amber-400 underline">Pilih Foto dari Device</span> atau Tarik ke sini
                        </p>
                        <p className="text-[10px] text-stone-400">
                          Mendukung kamera HP, Galeri, file JPG, PNG, WEBP (Otomatis dikompres optimal)
                        </p>
                      </div>
                    </div>

                    {/* Actions and Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessingPhoto}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors shadow"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Ambil / Unggah Foto</span>
                        </button>

                        {isCustomPhoto && (
                          <button
                            type="button"
                            onClick={handleResetToDefaultPhoto}
                            className="px-2.5 py-1.5 bg-[#2E170E] hover:bg-red-950/60 text-stone-400 hover:text-red-300 border border-[#48281A] hover:border-red-500/40 rounded-xl flex items-center gap-1 text-[11px] transition-colors"
                            title="Reset ke foto avatar default"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Reset Default</span>
                          </button>
                        )}
                      </div>

                      {uploadedFileName && (
                        <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-600/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="truncate max-w-[150px]">{uploadedFileName}</span>
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* URL Input Mode */}
                    <div className="space-y-1.5">
                      <label className="block text-stone-300 font-semibold text-[11px]">
                        Tautan URL Foto / Google Drive:
                      </label>
                      <input
                        type="text"
                        value={formData.fotoUrl}
                        onChange={(e) => {
                          const normalized = normalizeImageUrl(e.target.value);
                          setFormData({ ...formData, fotoUrl: normalized });
                        }}
                        placeholder="https://drive.google.com/... atau https://..."
                        className="w-full px-3 py-2 bg-[#1A0C06] border border-[#48281A] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs font-mono"
                      />
                      <p className="text-[10px] text-stone-400">
                        Tips: Link Google Drive shareable akan otomatis dikonversi menjadi gambar langsung.
                      </p>
                    </div>
                  </>
                )}

                {/* Upload feedback messages */}
                {photoSuccessMsg && (
                  <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{photoSuccessMsg}</span>
                  </div>
                )}
                {photoError && (
                  <div className="p-2 bg-red-950/80 border border-red-500/40 rounded-xl text-[11px] text-red-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span>{photoError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-stone-300 font-semibold mb-1">
                Nama Lengkap Anggota *
              </label>
              <input
                type="text"
                required
                value={formData.namaLengkap}
                onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                placeholder="Contoh: Muhammad Farhan"
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Jenis Kelamin *
              </label>
              <select
                value={formData.jenisKelamin}
                onChange={(e) => handleGenderChange(e.target.value as 'L' | 'P')}
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="L">Putra (Laki-laki)</option>
                <option value="P">Putri (Perempuan)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                NIK (16 Digit KTP / Kartu Keluarga)
              </label>
              <input
                type="text"
                maxLength={16}
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="3271xxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Nomor Tanda Anggota (NTA)
              </label>
              <input
                type="text"
                value={formData.nta}
                onChange={(e) => setFormData({ ...formData, nta: e.target.value })}
                placeholder="09.02.04.xxx.xxxx"
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Golongan Pramuka *
              </label>
              <select
                value={formData.golongan}
                onChange={(e) => handleGolonganChange(e.target.value as GolonganPramuka)}
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Siaga">Siaga (7-10 th)</option>
                <option value="Penggalang">Penggalang (11-15 th)</option>
                <option value="Penegak">Penegak (16-20 th)</option>
                <option value="Pandega">Pandega (21-25 th)</option>
                <option value="Pembina">Pembina Dewasa</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Tingkatan SKU *
              </label>
              <select
                value={formData.tingkatan}
                onChange={(e) => setFormData({ ...formData, tingkatan: e.target.value as TingkatanPramuka })}
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                {availableTingkatans.map((tingkat) => (
                  <option key={tingkat} value={tingkat}>{tingkat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Jabatan di Pangkalan
              </label>
              <input
                type="text"
                value={formData.jabatan || 'Anggota'}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                placeholder="Pratama / Pinru / Anggota"
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.tempatLahir}
                onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                placeholder="Kota Kelahiran"
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.tanggalLahir}
                onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Nomor Gudep
              </label>
              <input
                type="text"
                value={formData.noGudep}
                onChange={(e) => setFormData({ ...formData, noGudep: e.target.value })}
                placeholder="Contoh: 04.071"
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Alamat Rumah Anggota
              </label>
              <textarea
                rows={2}
                value={formData.alamatRumah}
                onChange={(e) => setFormData({ ...formData, alamatRumah: e.target.value })}
                placeholder="Alamat tempat tinggal siswa..."
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.noTelepon}
                  onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                  placeholder="08xxxxxxxx"
                  className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Status Penerbitan KTA
                </label>
                <select
                  value={formData.statusKta}
                  onChange={(e) => setFormData({ ...formData, statusKta: e.target.value as StatusKTA })}
                  className="w-full px-3 py-1.5 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Sudah Terbit">Sudah Terbit (KTA Digital Aktif)</option>
                  <option value="Proses Cetak">Proses Cetak</option>
                  <option value="Belum Diajukan">Belum Diajukan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sumber Input Notice */}
          <div className="p-3 bg-[#251309] border border-[#432314] rounded-xl flex items-center justify-between text-xs">
            <span className="text-stone-400">
              Keterangan Asal Sumber Input:
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-1.5">
              <span>🏫</span>
              <span>Diinput Mandiri di Gudep ({formData.inputBy || pangkalanName})</span>
            </span>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#3D1F13]">
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
              disabled={isSaving || isProcessingPhoto}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Data Anggota'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
