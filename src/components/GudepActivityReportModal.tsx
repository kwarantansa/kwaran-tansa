import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  MapPin,
  Users,
  Link,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GudepActivityReport } from '../types';

interface GudepActivityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: GudepActivityReport | null;
  pangkalanId: string;
  namaPangkalan: string;
  nomorGudep: string;
  authorName: string;
  onSave: (report: GudepActivityReport) => Promise<void>;
}

export const GudepActivityReportModal: React.FC<GudepActivityReportModalProps> = ({
  isOpen,
  onClose,
  report,
  pangkalanId,
  namaPangkalan,
  nomorGudep,
  authorName,
  onSave
}) => {
  if (!isOpen) return null;

  const isEditing = !!report;

  const [formData, setFormData] = useState<GudepActivityReport>(() => {
    if (report) return { ...report };
    return {
      id: `act-rep-${Date.now()}`,
      pangkalanId: pangkalanId || 'gudep-default',
      namaPangkalan: namaPangkalan,
      nomorGudep: nomorGudep,
      judul: '',
      tanggalKegiatan: new Date().toISOString().slice(0, 10),
      kategori: 'Latihan Rutin',
      tempat: `Pangkalan ${namaPangkalan}`,
      jumlahPeserta: 30,
      ringkasan: '',
      dokumenUrl: '',
      diunggahOleh: authorName || 'Pembina Gudep',
      terakhirDiperbarui: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.judul.trim()) {
      setErrorMsg('Judul kegiatan / laporan tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    try {
      const updated: GudepActivityReport = {
        ...formData,
        terakhirDiperbarui: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      await onSave(updated);
      onClose();
    } catch (err: any) {
      console.error('Error saving activity report:', err);
      setErrorMsg(err.message || 'Gagal menyimpan laporan kegiatan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1D0F08] border border-[#442316] text-stone-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2B140A] to-[#1E0E06] px-6 py-4 border-b border-[#3D1F13] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl">
              📝
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isEditing ? 'Ubah Laporan Kegiatan' : 'Buat Laporan / Catatan Kegiatan'}</span>
              </h2>
              <p className="text-xs text-stone-400">
                Pangkalan: <strong className="text-amber-300">{namaPangkalan}</strong> ({nomorGudep})
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

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div>
            <label className="block text-stone-300 font-semibold mb-1">
              Judul Kegiatan / Laporan *
            </label>
            <input
              type="text"
              required
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              placeholder="Contoh: Latihan Rutin Pionering & Semaphore / Persami Semester Ganjil"
              className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Kategori Kegiatan *
              </label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Latihan Rutin">Latihan Rutin Mingguan</option>
                <option value="Perkemahan / Persami">Perkemahan / Persami</option>
                <option value="Ujian SKU / SKK">Ujian SKU / SKK / Garuda</option>
                <option value="Lomba Tingkat">Lomba Tingkat (LT)</option>
                <option value="Bakti Sosial">Bakti Sosial / Lingkungan</option>
                <option value="Muspas / Musyawarah">Muspas / Musyawarah Gudep</option>
                <option value="Laporan Semester">Laporan Semester Pangkalan</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Tanggal Pelaksanaan *
              </label>
              <input
                type="date"
                required
                value={formData.tanggalKegiatan}
                onChange={(e) => setFormData({ ...formData, tanggalKegiatan: e.target.value })}
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Tempat / Lokasi Kegiatan
              </label>
              <input
                type="text"
                value={formData.tempat}
                onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                placeholder="Lokasi kegiatan dilaksanakan..."
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Jumlah Peserta Hadir (Orang)
              </label>
              <input
                type="number"
                min={1}
                value={formData.jumlahPeserta}
                onChange={(e) => setFormData({ ...formData, jumlahPeserta: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">
              Uraian & Ringkasan Hasil Kegiatan *
            </label>
            <textarea
              rows={4}
              required
              value={formData.ringkasan}
              onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })}
              placeholder="Jelaskan ringkasan materi, pencapaian regu, kendala, atau evaluasi kegiatan..."
              className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">
              Tautan Google Drive / Dokumentasi Foto (Opsional)
            </label>
            <input
              type="text"
              value={formData.dokumenUrl || ''}
              onChange={(e) => setFormData({ ...formData, dokumenUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 bg-[#251309] border border-[#432314] rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

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
              disabled={isSaving}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Laporan'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
