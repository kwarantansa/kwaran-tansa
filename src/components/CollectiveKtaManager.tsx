import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Users, 
  Building2, 
  Download, 
  ArrowRight, 
  Check, 
  X,
  ShieldCheck,
  Sparkles,
  Layers
} from 'lucide-react';
import { CollectiveKtaBatch, Gudep, Member, GolonganPramuka } from '../types';
import { KtaCard } from './KtaCard';
import confetti from 'canvas-confetti';

interface CollectiveKtaManagerProps {
  batches: CollectiveKtaBatch[];
  gudepList: Gudep[];
  members: Member[];
  onSaveBatch: (batch: CollectiveKtaBatch, newMembers?: Member[]) => void;
  onUpdateBatchStatus: (batchId: string, status: CollectiveKtaBatch['status']) => void;
  onOpenKtaModal: (member: Member) => void;
}

export const CollectiveKtaManager: React.FC<CollectiveKtaManagerProps> = ({
  batches,
  gudepList,
  members,
  onSaveBatch,
  onUpdateBatchStatus,
  onOpenKtaModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [printBatchModal, setPrintBatchModal] = useState<CollectiveKtaBatch | null>(null);

  // Wizard Step State
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [selectedGudepId, setSelectedGudepId] = useState(gudepList[0]?.id || '');
  const [selectedGolongan, setSelectedGolongan] = useState<GolonganPramuka>('Penggalang');
  const [pemohonNama, setPemohonNama] = useState('');
  const [pemohonKontak, setPemohonKontak] = useState('0812-');
  const [catatan, setCatatan] = useState('');

  // Bulk input textarea (Format: Nama Lengkap, NIK, JK, Tingkat)
  const [bulkInputText, setBulkInputText] = useState(
`Ahmad Rizky Pratama, 3271031201110001, L, Penggalang Ramu
Siti Nur Aini, 3271035502120002, P, Penggalang Ramu
Fajar Hidayatullah, 3271032103110003, L, Penggalang Rakit
Aditya Nugroho, 3271031804110004, L, Penggalang Terap
Annisa Putri Rahayu, 3271034405120005, P, Penggalang Ramu`
  );

  const filteredBatches = batches.filter(b => 
    b.namaPangkalan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.noBatch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.pemohonNama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGudep = gudepList.find(g => g.id === selectedGudepId) || gudepList[0];

  const handleOpenWizard = () => {
    setWizardStep(1);
    setSelectedGudepId(gudepList[0]?.id || '');
    setSelectedGolongan('Penggalang');
    setPemohonNama(gudepList[0]?.pembinaGudepPa || 'Pembina Satuan');
    setPemohonKontak('0812-8765-4321');
    setCatatan('Penerbitan KTA Pramuka Massal Tahun Ajaran Baru.');
    setIsWizardOpen(true);
  };

  const handleProcessBulkSubmit = () => {
    // Parse bulk text
    const lines = bulkInputText.trim().split('\n').filter(l => l.trim().length > 0);
    const parsedMembers: Member[] = [];
    const newMemberIds: string[] = [];

    const gudep = gudepList.find(g => g.id === selectedGudepId) || gudepList[0];

    lines.forEach((line, index) => {
      const parts = line.split(',').map(p => p.trim());
      const nama = parts[0] || `Anggota Baru ${index + 1}`;
      const nik = parts[1] || `327103${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const jk = (parts[2] && parts[2].toUpperCase() === 'P') ? 'P' : 'L';
      const tingkatan = (parts[3] as any) || `${selectedGolongan} Mula/Ramu`;

      const id = `mem-bulk-${Date.now()}-${index}`;
      newMemberIds.push(id);

      parsedMembers.push({
        id,
        nta: `09.02.04.${gudep.noGudepPa.slice(3) || '071'}.${Math.floor(1000 + Math.random() * 9000)}`,
        nik,
        namaLengkap: nama,
        jenisKelamin: jk as 'L' | 'P',
        tempatLahir: 'Bogor',
        tanggalLahir: '2012-05-10',
        agama: 'Islam',
        golongan: selectedGolongan,
        tingkatan,
        gudepId: gudep.id,
        namaPangkalan: gudep.namaPangkalan,
        noGudep: gudep.noGudepPa,
        kelurahan: gudep.kelurahan,
        alamatRumah: `Kel. ${gudep.kelurahan}, Kec. Tanah Sareal`,
        noTelepon: pemohonKontak,
        fotoUrl: jk === 'L' 
          ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300' 
          : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
        golonganDarah: 'O',
        statusKta: 'Proses Cetak',
        statusSync: 'Menunggu Sinkronisasi',
        berlakuKtaSampai: '2028-08-14',
        tanggalBergabung: new Date().toISOString().slice(0, 10)
      });
    });

    const newBatch: CollectiveKtaBatch = {
      id: `batch-${Date.now()}`,
      noBatch: `BATCH-KTA-TS-${new Date().getFullYear()}-${new Date().getMonth() + 1}-${Math.floor(10 + Math.random() * 90)}`,
      gudepId: gudep.id,
      namaPangkalan: gudep.namaPangkalan,
      noGudep: `${gudep.noGudepPa} - ${gudep.noGudepPi}`,
      tanggalPengajuan: new Date().toISOString().slice(0, 10),
      jumlahAnggota: parsedMembers.length,
      golonganUtama: selectedGolongan,
      status: 'Diajukan ke Kwarcab',
      pemohonNama,
      pemohonKontak,
      daftarAnggotaIds: newMemberIds,
      catatan,
      suratPengantarNo: `04.07/04.02-TS/KTA/${new Date().getMonth() + 1}/${new Date().getFullYear()}`
    };

    onSaveBatch(newBatch, parsedMembers);
    setIsWizardOpen(false);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5DFD5] shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-stone-900 font-sans tracking-tight">
              Pendampingan Penerbitan KTA Kolektif & Digital
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Layanan pengajuan massal Kartu Tanda Anggota (KTA) Pramuka bagi pangkalan gugus depan se-Kecamatan Tanah Sareal.
          </p>
        </div>

        <button
          onClick={handleOpenWizard}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-950 bg-amber-600 hover:bg-amber-500 rounded-xl shadow-sm transition-all border border-amber-400"
        >
          <Plus className="w-4 h-4 text-stone-950" />
          Pengajuan KTA Kolektif Baru
        </button>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-stone-900">Input Massal / Spreadsheet</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Pangkalan dapat mendaftarkan satu perindukan / pasukan sekaligus dengan format CSV/Teks instan.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-stone-900">QR Code Terenkripsi Resmi</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Setiap KTA memuat QR Code unik yang terverifikasi ke sistem Kwartir Cabang Kota Bogor.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-stone-900">Surat Rekomendasi Kwarran</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Diterbitkan surat pengantar resmi KTA kolektif secara otomatis untuk diteruskan ke Kwarcab.
            </p>
          </div>
        </div>
      </div>

      {/* Batch List */}
      <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-stone-900">
            Daftar Batch Pengajuan KTA Kolektif Pangkalan
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor batch, pangkalan..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl border border-[#E5DFD5] bg-[#FAF8F5] hover:bg-amber-50/30 hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    {b.noBatch}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    b.status === 'Selesai Cetak'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : b.status === 'Disetujui'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-stone-900 mt-2 line-clamp-1">
                  {b.namaPangkalan}
                </h4>
                <p className="text-[11px] text-stone-500">
                  Gudep {b.noGudep} • Satuan {b.golonganUtama}
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E5DFD5] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500 text-[11px]">Jumlah Anggota:</span>
                  <span className="font-bold text-stone-900 font-mono">{b.jumlahAnggota} Anggota</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 text-[11px]">Pemohon / Pembina:</span>
                  <span className="font-medium text-stone-800 truncate max-w-[130px]">{b.pemohonNama}</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-400 pt-1 border-t border-[#E5DFD5]">
                  <span>Tanggal:</span>
                  <span>{b.tanggalPengajuan}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => setPrintBatchModal(b)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 font-semibold text-stone-900 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 transition-colors text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Lembar Batch
                </button>

                <select
                  value={b.status}
                  onChange={(e) => onUpdateBatchStatus(b.id, e.target.value as any)}
                  className="text-[11px] py-1 px-2 bg-white border border-[#E5DFD5] rounded-lg font-semibold text-stone-800"
                >
                  <option value="Diajukan ke Kwarcab">Diajukan</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Selesai Cetak">Selesai</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collective Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5] my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-[#24140D] text-white">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-stone-100">
                  Wizard Pendaftaran & Penerbitan KTA Kolektif
                </h3>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps Indicator */}
            <div className="flex border-b border-[#E5DFD5] bg-[#FAF8F5] px-6 py-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  wizardStep === 1 ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-emerald-700 text-white'
                }`}>
                  1
                </span>
                <span className={wizardStep === 1 ? 'font-bold text-stone-900' : 'text-stone-500'}>
                  Pilih Pangkalan
                </span>
              </div>
              <div className="w-8 h-[1px] bg-[#E5DFD5] self-center mx-3" />
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  wizardStep === 2 ? 'bg-amber-600 text-stone-950 font-bold' : wizardStep === 3 ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-600'
                }`}>
                  2
                </span>
                <span className={wizardStep === 2 ? 'font-bold text-stone-900' : 'text-stone-500'}>
                  Input Daftar Nama Anggota
                </span>
              </div>
              <div className="w-8 h-[1px] bg-[#E5DFD5] self-center mx-3" />
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  wizardStep === 3 ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-200 text-stone-600'
                }`}>
                  3
                </span>
                <span className={wizardStep === 3 ? 'font-bold text-stone-900' : 'text-stone-500'}>
                  Konfirmasi & Terbitkan
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Pilih Gugus Depan / Pangkalan Pengusul:
                    </label>
                    <select
                      value={selectedGudepId}
                      onChange={(e) => {
                        setSelectedGudepId(e.target.value);
                        const g = gudepList.find(x => x.id === e.target.value);
                        if (g) setPemohonNama(g.pembinaGudepPa);
                      }}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none text-xs"
                    >
                      {gudepList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.namaPangkalan} (Gudep {g.noGudepPa} - {g.noGudepPi})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-800 mb-1">Golongan Utama Anggota:</label>
                      <select
                        value={selectedGolongan}
                        onChange={(e) => setSelectedGolongan(e.target.value as any)}
                        className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none text-xs"
                      >
                        <option value="Siaga">Perindukan Siaga (SD/MI)</option>
                        <option value="Penggalang">Pasukan Penggalang (SMP/MTs)</option>
                        <option value="Penegak">Ambalan Penegak (SMA/SMK)</option>
                        <option value="Pandega">Racana Pandega (PT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-800 mb-1">Nama Pembina Penanggung Jawab:</label>
                      <input
                        type="text"
                        value={pemohonNama}
                        onChange={(e) => setPemohonNama(e.target.value)}
                        placeholder="Nama Pembina Gudep"
                        className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Kontak WhatsApp Pembina:</label>
                    <input
                      type="text"
                      value={pemohonKontak}
                      onChange={(e) => setPemohonKontak(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none text-xs"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-stone-800">
                      Daftar Anggota Kolektif (Format: Nama, NIK, Jenis Kelamin (L/P), Tingkatan):
                    </label>
                    <span className="text-[11px] text-amber-800 font-mono">1 Baris = 1 Anggota</span>
                  </div>

                  <textarea
                    rows={8}
                    value={bulkInputText}
                    onChange={(e) => setBulkInputText(e.target.value)}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono text-xs focus:ring-2 focus:ring-amber-700/20 focus:outline-none leading-relaxed"
                  />

                  <p className="text-[11px] text-stone-500">
                    Tips: Anda bisa menyalin langsung kolom dari spreadsheet Excel. Sistem akan otomatis memvalidasi format dan men-generate NTA resmi.
                  </p>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                    <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Ringkasan Pengajuan KTA Kolektif
                    </h4>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-emerald-900">
                      <div>Pangkalan: <strong>{selectedGudep.namaPangkalan}</strong></div>
                      <div>Golongan: <strong>{selectedGolongan}</strong></div>
                      <div>Jumlah Calon KTA: <strong>{bulkInputText.trim().split('\n').filter(Boolean).length} Orang</strong></div>
                      <div>Penanggung Jawab: <strong>{pemohonNama}</strong></div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Catatan Pengantar ke Kwarcab:</label>
                    <textarea
                      rows={2}
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl text-xs focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-[#E5DFD5]">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((wizardStep - 1) as any)}
                    className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
                  >
                    Kembali
                  </button>
                ) : <div />}

                {wizardStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((wizardStep + 1) as any)}
                    className="px-5 py-2 text-xs font-bold text-stone-950 bg-amber-600 hover:bg-amber-500 rounded-xl shadow border border-amber-400"
                  >
                    Lanjutkan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleProcessBulkSubmit}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow"
                  >
                    Proses & Terbitkan KTA Kolektif
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Batch Sheet Modal */}
      {printBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 print:m-0 print:shadow-none print:w-full print:max-w-none border border-[#E5DFD5]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#24140D] text-white print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base text-stone-100">
                  Lembar Cetak KTA Kolektif ({printBatchModal.namaPangkalan})
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Semua KTA (A4 Layout)
                </button>
                <button
                  onClick={() => setPrintBatchModal(null)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Cards Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="text-center pb-4 border-b border-stone-200">
                <h2 className="text-lg font-black text-amber-950 font-serif uppercase">
                  Kwartir Ranting Gerakan Pramuka Tanah Sareal Kota Bogor
                </h2>
                <p className="text-xs text-stone-600">
                  Lembar Penerbitan KTA Pramuka Kolektif • {printBatchModal.namaPangkalan} ({printBatchModal.noBatch})
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
                {members
                  .filter(m => m.gudepId === printBatchModal.gudepId || printBatchModal.daftarAnggotaIds.includes(m.id))
                  .slice(0, 6)
                  .map((m) => (
                    <div key={m.id} className="scale-90 sm:scale-100">
                      <KtaCard member={m} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
