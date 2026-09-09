import React, { useState } from 'react';
import {
  X,
  Building,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Award,
  Compass,
  Upload,
  ExternalLink,
  Globe,
  Instagram,
  Facebook,
  Video,
  Printer,
  Calendar,
  Lock,
  MessageSquare
} from 'lucide-react';
import { GudepRegistration } from '../types';

interface GudepRegistrationDetailModalProps {
  registration: GudepRegistration | null;
  onClose: () => void;
  onVerify: (regId: string, status: 'Disetujui' | 'Ditolak', note?: string) => Promise<void>;
}

export const GudepRegistrationDetailModal: React.FC<GudepRegistrationDetailModalProps> = ({
  registration,
  onClose,
  onVerify
}) => {
  const [note, setNote] = useState(registration?.catatanVerifikasi || '');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!registration) return null;

  const handleAction = async (status: 'Disetujui' | 'Ditolak') => {
    setIsProcessing(true);
    try {
      await onVerify(registration.id, status, note);
      onClose();
    } catch (err) {
      console.error('Error verifying registration:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1D100A] border border-[#48281A] text-stone-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2C170F] to-[#200F09] p-5 border-b border-[#442316] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl flex-shrink-0">
              ⚜️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500 text-stone-950 px-2 py-0.5 rounded">
                  {registration.noRegistrasi}
                </span>
                <span className="text-xs text-stone-400">
                  Diajukan: {registration.tanggalRegistrasi}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                {registration.namaPangkalan} ({registration.nomorGudep || 'Gudep Baru'})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-[#28150D] hover:bg-[#381D12] text-stone-300 border border-[#4D2817] text-xs flex items-center gap-1.5 transition-colors"
              title="Cetak Formulir"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#28150D] hover:bg-[#381D12] text-stone-400 hover:text-white border border-[#4D2817] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            registration.statusVerifikasi === 'Disetujui'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : registration.statusVerifikasi === 'Ditolak'
              ? 'bg-red-950/40 border-red-500/40 text-red-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                registration.statusVerifikasi === 'Disetujui'
                  ? 'bg-emerald-500 text-stone-950'
                  : registration.statusVerifikasi === 'Ditolak'
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-500 text-stone-950'
              }`}>
                {registration.statusVerifikasi === 'Disetujui' ? '✓' : registration.statusVerifikasi === 'Ditolak' ? '✕' : '⏳'}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  Status Verifikasi: {registration.statusVerifikasi}
                </span>
                <span className="text-[11px] text-stone-300">
                  {registration.statusVerifikasi === 'Disetujui'
                    ? `Disetujui oleh: ${registration.diverifikasiOleh || 'Pengurus Kwarran'} pada ${registration.tanggalVerifikasi || '-'}`
                    : registration.statusVerifikasi === 'Ditolak'
                    ? `Ditolak oleh: ${registration.diverifikasiOleh || 'Pengurus Kwarran'} - Perlu revisi dokumen`
                    : 'Pendaftaran publik ini menunggu persetujuan dan aktivasi akun oleh Pengurus Kwarran.'}
                </span>
              </div>
            </div>

            {/* Target Account Summary */}
            <div className="p-2.5 bg-[#140A05] rounded-lg border border-stone-800 text-xs text-stone-300">
              <span className="text-[10px] text-stone-400 block">Akun Login yang Didaftarkan:</span>
              <span className="font-mono font-bold text-amber-300">@{registration.akunGudep?.username}</span>
              <span className="text-[10px] text-stone-400 block">PIC: {registration.akunGudep?.namaPendaftar} ({registration.akunGudep?.noWaPendaftar})</span>
            </div>
          </div>

          {/* Section 1: Identitas Gugus Depan & Mabigus (PDF Hal 1) */}
          <div className="bg-[#24130C] border border-[#3E2114] rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-[#351C11] pb-2">
              <Building className="w-4 h-4" />
              <span>1. Identitas Gugus Depan & Mabigus</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Nama Pangkalan:</span>
                <span className="font-semibold text-white">{registration.namaPangkalan}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Nomor Gudep (Pa / Pi):</span>
                <span className="font-semibold text-amber-300">{registration.nomorGudep}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Jenjang & Status:</span>
                <span className="text-stone-200">{registration.jenjang} ({registration.statusSekolah || 'Swasta'})</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">NPSN:</span>
                <span className="font-mono text-stone-200">{registration.npsn || '-'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Kelurahan:</span>
                <span className="text-stone-200">Kelurahan {registration.kelurahan}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Alamat Lengkap:</span>
                <span className="text-stone-200">{registration.alamat}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Ketua Mabigus:</span>
                <span className="font-semibold text-white">{registration.kaMabigus}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Jabatan Ka Mabigus:</span>
                <span className="text-stone-200">{registration.jabatanKaMabigus || 'Kepala Sekolah'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Nomor HP Ka Mabigus:</span>
                <span className="text-amber-300 font-mono">{registration.noHpKaMabigus}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Pembina & Anggota Peserta Didik (PDF Hal 1) */}
          <div className="bg-[#24130C] border border-[#3E2114] rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-[#351C11] pb-2">
              <Users className="w-4 h-4" />
              <span>2. Pembina & Peserta Didik</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Pembina Putra */}
              <div className="p-3 bg-[#1B0D07] rounded-lg border border-[#3A1E11] space-y-1">
                <span className="text-[11px] font-bold text-amber-300 block">Pembina Gudep Putra:</span>
                <p className="text-white font-medium">{registration.namaPembinaPa || '-'}</p>
                <p className="text-[11px] text-stone-400">NTA: {registration.ntaPembinaPa || '-'}</p>
                <p className="text-[11px] text-stone-400">No HP: {registration.noHpPembinaPa || '-'}</p>
                <p className="text-[11px] text-stone-400">Kursus: <span className="text-amber-400">{registration.kursusPembinaPa || '-'}</span> • Jumlah: {registration.jumlahPembinaPa || 1}</p>
              </div>

              {/* Pembina Putri */}
              <div className="p-3 bg-[#1B0D07] rounded-lg border border-[#3A1E11] space-y-1">
                <span className="text-[11px] font-bold text-amber-300 block">Pembina Gudep Putri:</span>
                <p className="text-white font-medium">{registration.namaPembinaPi || '-'}</p>
                <p className="text-[11px] text-stone-400">NTA: {registration.ntaPembinaPi || '-'}</p>
                <p className="text-[11px] text-stone-400">No HP: {registration.noHpPembinaPi || '-'}</p>
                <p className="text-[11px] text-stone-400">Kursus: <span className="text-amber-400">{registration.kursusPembinaPi || '-'}</span> • Jumlah: {registration.jumlahPembinaPi || 1}</p>
              </div>
            </div>

            {/* Rincian Anggota */}
            <div className="pt-2">
              <span className="text-[11px] text-stone-400 block mb-1">Rincian Anggota Per Golongan:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-[#1B0D07] rounded border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 block">Siaga</span>
                  <span className="font-mono text-stone-200">Pa: {registration.jumlahSiagaPa || 0} • Pi: {registration.jumlahSiagaPi || 0}</span>
                </div>
                <div className="p-2 bg-[#1B0D07] rounded border border-amber-500/30 text-center">
                  <span className="text-[10px] text-amber-300 block font-semibold">Penggalang</span>
                  <span className="font-mono text-amber-200 font-bold">Pa: {registration.jumlahPenggalangPa || 0} • Pi: {registration.jumlahPenggalangPi || 0}</span>
                </div>
                <div className="p-2 bg-[#1B0D07] rounded border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 block">Penegak</span>
                  <span className="font-mono text-stone-200">Pa: {registration.jumlahPenegakPa || 0} • Pi: {registration.jumlahPenegakPi || 0}</span>
                </div>
                <div className="p-2 bg-[#1B0D07] rounded border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 block">Pandega</span>
                  <span className="font-mono text-stone-200">Pa: {registration.jumlahPandegaPa || 0} • Pi: {registration.jumlahPandegaPi || 0}</span>
                </div>
              </div>
            </div>

            {/* Kegiatan Gudep */}
            <div className="pt-2">
              <span className="text-[11px] text-stone-400 block mb-1.5">Kegiatan Rutin Diselenggarakan:</span>
              <div className="flex flex-wrap gap-1.5">
                {registration.kegiatanGudep?.map((k, i) => (
                  <span key={i} className="text-[11px] bg-[#170A04] text-amber-300 px-2 py-0.5 rounded border border-[#3E2214]">
                    ✓ {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Prestasi, Sarpras, Potensi & Kebutuhan (PDF Hal 2 & 3) */}
          <div className="bg-[#24130C] border border-[#3E2114] rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-[#351C11] pb-2">
              <Award className="w-4 h-4" />
              <span>3. Prestasi, Sarana Prasarana, Potensi & Kebutuhan (Hal. 2 & 3)</span>
            </h3>

            {/* Prestasi */}
            <div>
              <span className="text-[11px] text-stone-400 block">Prestasi Gudep 3 Tahun Terakhir:</span>
              <p className="text-xs text-stone-200 bg-[#1A0D07] p-2.5 rounded-lg border border-[#3A1E11] mt-1 leading-relaxed">
                {registration.prestasi3Tahun || 'Belum diisi'}
              </p>
            </div>

            {/* Sarpras */}
            <div>
              <span className="text-[11px] text-stone-400 block mb-1">Sarana Prasarana yang Dimiliki:</span>
              <div className="flex flex-wrap gap-1.5">
                {registration.saranaPrasarana?.map((s, i) => (
                  <span key={i} className="text-[11px] bg-emerald-950/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Potensi */}
            <div>
              <span className="text-[11px] text-stone-400 block mb-1">Potensi Unggulan Gudep:</span>
              <div className="flex flex-wrap gap-1.5">
                {registration.potensiGudep?.map((p, i) => (
                  <span key={i} className="text-[11px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    ⭐ {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Kendala & Kebutuhan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Kendala / Hambatan:</span>
                <div className="flex flex-wrap gap-1">
                  {registration.kendalaGudep?.map((k, i) => (
                    <span key={i} className="text-[10px] bg-red-950/30 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                      • {k}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Kebutuhan Pembinaan dari Kwarran:</span>
                <div className="flex flex-wrap gap-1">
                  {registration.kebutuhanPembinaan?.map((b, i) => (
                    <span key={i} className="text-[10px] bg-blue-950/30 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                      • {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Media Sosial & Berkas Unggahan (PDF Hal 4) */}
          <div className="bg-[#24130C] border border-[#3E2114] rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-[#351C11] pb-2">
              <Globe className="w-4 h-4" />
              <span>4. Media Sosial & Berkas Pendukung (Hal. 4)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-[#1A0D07] rounded border border-stone-800">
                <span className="text-[10px] text-pink-400 flex items-center gap-1">
                  <Instagram className="w-3 h-3" /> Instagram
                </span>
                <span className="text-stone-300 truncate block mt-0.5">{registration.mediaSosial?.instagram || '-'}</span>
              </div>
              <div className="p-2 bg-[#1A0D07] rounded border border-stone-800">
                <span className="text-[10px] text-blue-400 flex items-center gap-1">
                  <Facebook className="w-3 h-3" /> Facebook
                </span>
                <span className="text-stone-300 truncate block mt-0.5">{registration.mediaSosial?.facebook || '-'}</span>
              </div>
              <div className="p-2 bg-[#1A0D07] rounded border border-stone-800">
                <span className="text-[10px] text-red-400 flex items-center gap-1">
                  <Video className="w-3 h-3" /> TikTok
                </span>
                <span className="text-stone-300 truncate block mt-0.5">{registration.mediaSosial?.tiktok || '-'}</span>
              </div>
              <div className="p-2 bg-[#1A0D07] rounded border border-stone-800">
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Website
                </span>
                <span className="text-stone-300 truncate block mt-0.5">{registration.mediaSosial?.website || '-'}</span>
              </div>
            </div>

            <div className="p-2.5 bg-[#1B0D07] rounded-lg border border-[#391D10] text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 block">Berkas SK Gudep:</span>
                <span className="text-stone-200 font-mono">{registration.skGudepFileName || 'SK_Gudep.pdf'}</span>
              </div>
              {registration.skGudepUrl && (
                <a
                  href={registration.skGudepUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-[#2D160C] text-amber-300 hover:text-white border border-[#4E2716] flex items-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Lihat Dokumen</span>
                </a>
              )}
            </div>
          </div>

          {/* Section 5: Akun Akses Gudep (Login Credentials) */}
          <div className="bg-[#2B150D] border-2 border-amber-500/40 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2 border-b border-[#442316] pb-2">
              <Lock className="w-4 h-4" />
              <span>5. Kredensial Akun Login Pangkalan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Username Pilihan:</span>
                <span className="font-mono font-bold text-white bg-[#150A05] px-2 py-1 rounded border border-stone-700 block mt-0.5">
                  {registration.akunGudep?.username}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Nama Penanggung Jawab:</span>
                <span className="font-semibold text-white block mt-1">{registration.akunGudep?.namaPendaftar}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Nomor WhatsApp:</span>
                <span className="font-mono text-amber-300 block mt-1">{registration.akunGudep?.noWaPendaftar}</span>
              </div>
              <div className="sm:col-span-3">
                <span className="text-stone-400 block text-[11px]">Email Resmi:</span>
                <span className="text-stone-200">{registration.akunGudep?.emailPendaftar || '-'}</span>
              </div>
            </div>
          </div>

          {/* Verification Actions & Notes Input for Pengurus */}
          <div className="bg-[#180A04] border border-[#3E2114] rounded-xl p-4 space-y-3">
            <label className="block text-xs font-bold text-amber-400">
              Catatan Pengurus / Alasan Persetujuan / Catatan Revisi:
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuliskan catatan verifikasi (opsional)... Contoh: 'Dokumen SK lengkap, nomor Gudep 04.075/04.076 resmi diaktifkan'."
              className="w-full bg-[#120703] border border-[#351C10] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none"
            />
          </div>

        </div>

        {/* Modal Footer with Verification Buttons */}
        <div className="bg-[#140803] px-6 py-4 border-t border-[#3B1F13] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-400">
            Pastikan data dan dokumen pangkalan telah divalidasi sesuai Buku Induk Kwarran.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {registration.statusVerifikasi !== 'Ditolak' && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleAction('Ditolak')}
                className="px-4 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Tolak / Minta Revisi</span>
              </button>
            )}

            {registration.statusVerifikasi !== 'Disetujui' && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleAction('Disetujui')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verifikasi & Aktifkan Akun Gudep</span>
                  </>
                )}
              </button>
            )}

            {registration.statusVerifikasi === 'Disetujui' && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Akun Sudah Aktif
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
