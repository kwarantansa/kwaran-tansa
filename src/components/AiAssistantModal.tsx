import React, { useState } from 'react';
import { Bot, Sparkles, FileText, CheckCircle2, Copy, Printer, RefreshCw, X } from 'lucide-react';
import { Gudep, Member } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  gudepList: Gudep[];
  members: Member[];
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  gudepList,
  members,
}) => {
  const [activeMode, setActiveMode] = useState<'letter' | 'analysis'>('letter');
  const [letterType, setLetterType] = useState<'rekomendasi' | 'kta'>('kta');
  const [selectedGudepId, setSelectedGudepId] = useState(gudepList[0]?.id || '');
  const [applicantName, setApplicantName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const selectedGudep = gudepList.find(g => g.id === selectedGudepId) || gudepList[0];

  const handleGenerate = async () => {
    setLoading(true);
    setResultText('');
    try {
      if (activeMode === 'letter') {
        const payload = {
          type: letterType,
          gudepName: `${selectedGudep?.namaPangkalan} (Gudep ${selectedGudep?.noGudepPa} - ${selectedGudep?.noGudepPi})`,
          applicantName: applicantName || (letterType === 'rekomendasi' ? selectedGudep?.pembinaGudepPa : selectedGudep?.kaMabigus),
          applicantRole: letterType === 'rekomendasi' ? 'Pembina Satuan (KML/KMD)' : 'Ka Mabigus / Pangkalan',
          count: letterType === 'kta' ? selectedGudep?.jumlahAnggotaMuda : undefined,
          notes: notes || 'Berkas telah divalidasi lengkap sesuai standar Kwarran Tanah Sareal',
        };

        const res = await fetch('/api/ai/letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setResultText(data.letter || 'Gagal menghasilkan surat.');
      } else {
        const stats = {
          totalGudep: gudepList.length,
          totalMembers: members.length,
          totalPembinaMahir: members.filter(m => m.kualifikasiKursus && m.kualifikasiKursus !== 'Belum').length,
          gudepByJenjang: {
            sd: gudepList.filter(g => g.jenjang === 'SD/MI').length,
            smp: gudepList.filter(g => g.jenjang === 'SMP/MTs').length,
            sma: gudepList.filter(g => g.jenjang === 'SMA/SMK/MA').length,
            pt: gudepList.filter(g => g.jenjang === 'Perguruan Tinggi').length,
          }
        };

        const gudepSummary = gudepList.map(g => ({
          nama: g.namaPangkalan,
          kelurahan: g.kelurahan,
          statusSync: g.statusSync,
          akreditasi: g.akreditasi,
          anggota: g.jumlahAnggotaMuda,
        }));

        const res = await fetch('/api/ai/analyze-census', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stats, gudepSummary })
        });
        const data = await res.json();
        setResultText(data.analysis || 'Gagal menganalisis data.');
      }
    } catch (err: any) {
      console.error(err);
      setResultText('Terjadi kesalahan saat memproses permintaan AI. Menggunakan template standar administrasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#24140D] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-stone-100">
                  Asisten Administrasi & Rekomendasi Kwarran (Gemini AI)
                </h3>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
                  Powered by Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Penyusunan otomatis Surat Resmi Administrasi Kwarran Tanah Sareal & Analisis Data Pemutakhiran
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#E5DFD5] bg-[#FAF8F5] px-6 pt-3 gap-3">
          <button
            onClick={() => {
              setActiveMode('letter');
              setResultText('');
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeMode === 'letter'
                ? 'border-amber-600 text-stone-900 bg-white rounded-t-xl border-t border-x border-[#E5DFD5]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Generator Surat Resmi Pengantar & Rekomendasi
          </button>

          <button
            onClick={() => {
              setActiveMode('analysis');
              setResultText('');
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeMode === 'analysis'
                ? 'border-amber-600 text-stone-900 bg-white rounded-t-xl border-t border-x border-[#E5DFD5]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            Analisis Eksekutif Pemutakhiran Data
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Side */}
          <div className="lg:col-span-5 space-y-4">
            {activeMode === 'letter' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Jenis Dokumen Surat:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLetterType('kta')}
                      className={`p-2.5 text-xs rounded-xl font-medium border text-left transition-all ${
                        letterType === 'kta'
                          ? 'border-amber-600 bg-amber-50 text-stone-950 font-bold ring-1 ring-amber-600'
                          : 'border-[#E5DFD5] bg-[#FAF8F5] text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      Surat Pengantar KTA Kolektif
                    </button>
                    <button
                      type="button"
                      onClick={() => setLetterType('rekomendasi')}
                      className={`p-2.5 text-xs rounded-xl font-medium border text-left transition-all ${
                        letterType === 'rekomendasi'
                          ? 'border-amber-600 bg-amber-50 text-stone-950 font-bold ring-1 ring-amber-600'
                          : 'border-[#E5DFD5] bg-[#FAF8F5] text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      Rekomendasi Pembina & Gudep
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Pilih Pangkalan / Gugus Depan:
                  </label>
                  <select
                    value={selectedGudepId}
                    onChange={(e) => setSelectedGudepId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    {gudepList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.namaPangkalan} ({g.noGudepPa} - {g.noGudepPi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Nama Ka Mabigus / Pembina:
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Drs. H. Mulyadi, M.Pd."
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Catatan Tambahan / Keterangan Khusus:
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Berkas Ijazah KML dan SHB aktif telah divalidasi..."
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
                <h4 className="font-bold">Analisis Kecerdasan Data (Data Intelligence)</h4>
                <p className="text-stone-700 leading-relaxed">
                  Sistem akan mengompilasi statistik real-time dari seluruh 11 kelurahan di wilayah Kwarran Tanah Sareal, mengevaluasi rasio pembina berkualifikasi KMD/KML, serta memberikan rekomendasi percepatan tertib KTA & NTA ke Kwartir Cabang Kota Bogor.
                </p>
                <div className="pt-2 text-[11px] text-amber-900">
                  <p>• Cakupan: {gudepList.length} Gudep Terdaftar</p>
                  <p>• Total Anggota Terdata: {members.length} Anggota</p>
                  <p>• Total Pembina Mahir: {members.filter(m => (m.golongan === 'Pembina' || m.golongan === 'Pelatih') && m.kualifikasiKursus && m.kualifikasiKursus !== 'Belum').length} Pembina</p>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-amber-400"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Memproses dengan Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  {activeMode === 'letter' ? 'Buat Draft Surat Resmi' : 'Jalankan Analisis Eksekutif'}
                </>
              )}
            </button>
          </div>

          {/* Result Preview Side */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Pratinjau Hasil AI:
              </span>

              {resultText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 border border-[#E5DFD5] rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Salin Teks
                      </>
                    )}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-stone-950 border border-amber-300 rounded-lg transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[320px] p-4 bg-[#24140D] text-stone-200 font-mono text-xs rounded-xl overflow-y-auto leading-relaxed whitespace-pre-wrap border border-stone-800 shadow-inner">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-amber-300/80 space-y-3 py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                  <p className="text-xs font-sans">
                    Sedang memproses dan memformulasikan dokumen resmi Kwarran Tanah Sareal...
                  </p>
                </div>
              ) : resultText ? (
                resultText
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 space-y-2 py-12 font-sans">
                  <FileText className="w-8 h-8 text-stone-600" />
                  <p className="text-xs">
                    Klik tombol &ldquo;Buat Draft Surat Resmi&rdquo; atau &ldquo;Jalankan Analisis&rdquo; untuk memulai.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
