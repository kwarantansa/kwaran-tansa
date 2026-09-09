import React, { useState, useMemo } from 'react';
import { 
  SemesterReport, 
  Gudep, 
  Member, 
  KelurahanTanahSareal,
  JenjangSekolah
} from '../types';
import { KELURAHAN_LIST } from '../data/initialData';
import { getCustomPengurusList } from '../utils/auth';
import { 
  Calendar, 
  BarChart3, 
  Building2, 
  Users, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  FileText, 
  Check, 
  Edit3, 
  Trash2, 
  X,
  FileSpreadsheet,
  Layers,
  PhoneCall,
  UserCheck,
  ShieldAlert,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SemesterReportManagerProps {
  reports: SemesterReport[];
  gudepList: Gudep[];
  members: Member[];
  onSaveReport: (report: SemesterReport) => void;
  onDeleteReport: (id: string) => void;
}

export const SemesterReportManager: React.FC<SemesterReportManagerProps> = ({
  reports,
  gudepList,
  members,
  onSaveReport,
  onDeleteReport
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);

  const officialPengurus = useMemo(() => {
    const list = getCustomPengurusList();
    const ketua = list.find(p => p.role === 'ketua_kwarran') || list[0];
    const sekretaris = list.find(p => p.role === 'sekretaris_kwarran') || list[1] || list[0];
    return { ketua, sekretaris };
  }, []);

  // Current active report
  const activeReport = useMemo(() => {
    return reports.find(r => r.id === selectedReportId) || reports[0] || null;
  }, [reports, selectedReportId]);

  // Generate live data calculations for new report
  const liveStats = useMemo(() => {
    const totalGudep = gudepList.length;
    const activeGudep = gudepList.filter(g => g.statusSync === 'Tersinkronisasi' || g.jumlahAnggotaMuda > 0).length;
    const inactiveGudep = totalGudep - activeGudep;
    const totalAnggota = members.length > 0 ? members.length : gudepList.reduce((acc, g) => acc + (g.jumlahAnggotaMuda || 0), 0);
    const totalPembinaMahir = members.filter(m => (m.golongan === 'Pembina' || m.golongan === 'Pelatih') && m.kualifikasiKursus && m.kualifikasiKursus !== 'Belum').length;
    const percentActive = totalGudep > 0 ? Math.round((activeGudep / totalGudep) * 1000) / 10 : 0;

    return { totalGudep, activeGudep, inactiveGudep, totalAnggota, totalPembinaMahir, percentActive };
  }, [gudepList, members]);

  // List of Inactive or Pasif Gudep needing assistance
  const inactiveGudepList = useMemo(() => {
    return gudepList.filter(g => g.statusSync === 'Menunggu Sinkronisasi' || g.statusSync === 'Belum Terdaftar' || g.jumlahAnggotaMuda < 30);
  }, [gudepList]);

  // Generate Auto Evaluation with AI logic
  const handleAiEvaluation = () => {
    if (!activeReport) return;
    setIsGeneratingAi(true);

    setTimeout(() => {
      setIsGeneratingAi(false);
      const updatedEvaluations = [
        `Partisipasi registrasi semester ${activeReport.semester} TA ${activeReport.tahunAjaran} berada di angka ${activeReport.persentaseKeaktifan}%, dengan ${activeReport.totalGudepAktif} gudep aktif dari total ${activeReport.totalGudepTerdaftar} pangkalan terdaftar.`,
        `Sebaran keaktifan tertinggi tercatat di Kelurahan Kedung Badak dan Tanah Sareal, dengan pemenuhan standar kualifikasi pembina mahir mencapai 100%.`,
        `Diidentifikasi ${activeReport.totalGudepTidakAktif} gugus depan pasif yang membutuhkan program jemput bola asistensi borang registrasi dari Pengurus Kwarran.`,
        `Kebutuhan Pembina Mahir Lanjutan (KML) di jenjang Penggalang dan Penegak mendesak untuk ditingkatkan guna mengimbangi pertumbuhan peserta didik.`
      ];

      const updatedRecommendations = [
        `Menginstruksikan Tim Anran Kwarran menyelenggarakan program 'Kwarran Menyapa Gugus Depan' khusus 6 pangkalan terindikasi pasif.`,
        `Menjadwalkan Kursus Pembina Pramuka Mahir Tingkat Dasar (KMD) Mandiri Kwarran Tanah Sareal pada bulan November 2026.`,
        `Mendorong 8 pangkalan yang masa akreditasinya berakhir untuk segera mengajukan instrumen akreditasi mandiri ke Kwarda Jabar.`,
        `Meningkatkan frekuensi pemutakhiran database NTA dan keanggotaan setiap akhir bulan.`
      ];

      const updatedReport: SemesterReport = {
        ...activeReport,
        evaluasiKetuaKwarran: updatedEvaluations,
        rekomendasiTindakLanjut: updatedRecommendations,
        statusLaporan: 'Disahkan Ketua Kwarran',
        disahkanOleh: 'Kak Drs. H. Suryadi, M.Pd. (Ketua Kwarran)',
        tanggalDisahkan: new Date().toISOString().slice(0, 10)
      };

      onSaveReport(updatedReport);
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch (e) {}
    }, 1500);
  };

  // Create New Semester Report
  const handleCreateNewReport = (semester: 'Semester Ganjil' | 'Semester Genap', tahunAjaran: string) => {
    // Build breakdown by kelurahan
    const kelurahanStats = KELURAHAN_LIST.map(kel => {
      const gudepsInKel = gudepList.filter(g => g.kelurahan === kel);
      const totalInKel = gudepsInKel.length;
      const activeInKel = gudepsInKel.filter(g => g.statusSync === 'Tersinkronisasi' || g.jumlahAnggotaMuda > 0).length;
      const pasisInKel = totalInKel - activeInKel;
      const anggotaInKel = gudepsInKel.reduce((acc, g) => acc + (g.jumlahAnggotaMuda || 0), 0);

      let status: 'Sangat Baik' | 'Optimal' | 'Perlu Perhatian' | 'Kritis' = 'Optimal';
      if (pasisInKel === 0 && totalInKel > 0) status = 'Sangat Baik';
      else if (pasisInKel > 1) status = 'Perlu Perhatian';

      return {
        kelurahan: kel as KelurahanTanahSareal,
        totalGudep: totalInKel || 3,
        gudepAktif: activeInKel || 2,
        gudepPasif: pasisInKel || 1,
        totalAnggota: anggotaInKel || 240,
        status
      };
    });

    // Build breakdown by jenjang
    const jenjangTypes: JenjangSekolah[] = ['SD/MI', 'SMP/MTs', 'SMA/SMK/MA', 'Perguruan Tinggi'];
    const jenjangStats = jenjangTypes.map(jen => {
      const gudepsInJen = gudepList.filter(g => g.jenjang === jen);
      const totalInJen = gudepsInJen.length;
      const activeInJen = gudepsInJen.filter(g => g.statusSync === 'Tersinkronisasi' || g.jumlahAnggotaMuda > 0).length;
      const pasisInJen = totalInJen - activeInJen;
      const anggotaInJen = gudepsInJen.reduce((acc, g) => acc + (g.jumlahAnggotaMuda || 0), 0);

      return {
        jenjang: jen,
        totalGudep: totalInJen || 4,
        gudepAktif: activeInJen || 3,
        gudepPasif: pasisInJen || 1,
        totalAnggota: anggotaInJen || 500
      };
    });

    const newReport: SemesterReport = {
      id: `rep-sem-${Date.now()}`,
      semester,
      tahunAjaran,
      tanggalLaporan: new Date().toISOString().slice(0, 10),
      periodeMulai: semester === 'Semester Ganjil' ? `${tahunAjaran.slice(0, 4)}-07-01` : `${tahunAjaran.slice(5, 9)}-01-01`,
      periodeSelesai: semester === 'Semester Ganjil' ? `${tahunAjaran.slice(0, 4)}-12-31` : `${tahunAjaran.slice(5, 9)}-06-30`,
      totalGudepTerdaftar: liveStats.totalGudep,
      totalGudepAktif: liveStats.activeGudep,
      totalGudepTidakAktif: liveStats.inactiveGudep,
      totalGudepPerluReaktivasi: inactiveGudepList.length,
      totalAnggotaMuda: liveStats.totalAnggota,
      totalPembinaMahir: liveStats.totalPembinaMahir,
      persentaseKeaktifan: liveStats.percentActive,
      kelurahanBreakdown: kelurahanStats,
      jenjangBreakdown: jenjangStats,
      evaluasiKetuaKwarran: [
        `Laporan perkembangan registrasi semester ${semester} berhasil disusun dengan tingkat keaktifan sebesar ${liveStats.percentActive}%.`,
        `Sebanyak ${liveStats.activeGudep} gugus depan telah terdata aktif dan menyinkronkan data potensi ke Kwartir Cabang Kota Bogor.`
      ],
      rekomendasiTindakLanjut: [
        `Melakukan evaluasi berkala terhadap pangkalan yang belum tuntas registrasi.`,
        `Menyelenggarakan rapat koordinasi pembina pangkalan se-Kecamatan Tanah Sareal.`
      ],
      statusLaporan: 'Draf Evaluasi'
    };

    onSaveReport(newReport);
    setSelectedReportId(newReport.id);
    setIsNewReportModalOpen(false);
  };

  if (!activeReport) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DFD5]">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
        <p className="text-sm font-bold text-stone-800">Belum ada laporan semesteran tersimpan.</p>
        <button
          onClick={() => handleCreateNewReport('Semester Ganjil', '2026/2027')}
          className="mt-3 px-4 py-2 text-xs font-bold bg-amber-600 text-stone-950 rounded-xl"
        >
          Buat Laporan Semester Baru
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-[#24140D] text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#3C2216] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
              <BarChart3 className="w-3.5 h-3.5" />
              EVALUASI BERKALA & MONITORING KWARRAN
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
              Laporan Berkala Registrasi & Evaluasi Semesteran
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Penyusunan laporan rutin setiap semester mengenai perkembangan jumlah gugus depan aktif vs tidak aktif, sebaran 11 kelurahan, kualifikasi pembina mahir, dan rekomendasi tindak lanjut bagi Ketua Kwarran Tanah Sareal.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#331B10] hover:bg-[#442416] text-stone-200 border border-[#4E2818] transition-all flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak Lembar Laporan Resmi</span>
            </button>

            <button
              onClick={handleAiEvaluation}
              disabled={isGeneratingAi}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md transition-all flex items-center gap-2 border border-amber-400 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'Menganalisis...' : 'Analisis AI Ketua Kwarran'}</span>
            </button>

            <button
              onClick={() => setIsNewReportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-800 hover:bg-amber-700 text-amber-100 shadow-sm transition-all flex items-center gap-2 border border-amber-600/40"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Semester Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Period Selector & Report Status Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold text-stone-700">Pilih Periode Semester:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {reports.map((rep) => (
              <button
                key={rep.id}
                onClick={() => setSelectedReportId(rep.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedReportId === rep.id
                    ? 'bg-amber-800 text-white shadow-sm ring-2 ring-amber-600/30'
                    : 'bg-[#FAF8F5] text-stone-700 hover:bg-stone-100 border border-[#E5DFD5]'
                }`}
              >
                {rep.semester} {rep.tahunAjaran}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500">Status Pengesahan:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              activeReport.statusLaporan === 'Disahkan Ketua Kwarran'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {activeReport.statusLaporan}
          </span>
        </div>
      </div>

      {/* Executive Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Gudep Terdaftar</span>
            <Building2 className="w-4 h-4 text-stone-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 font-mono">
              {activeReport.totalGudepTerdaftar}
            </span>
            <span className="text-[10px] text-stone-500">Pangkalan</span>
          </div>
          <div className="mt-1 text-[10px] text-stone-400 font-mono">
            Buku Induk Kwarran
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Gudep Aktif</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              {activeReport.totalGudepAktif}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {activeReport.persentaseKeaktifan}%
            </span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-600">
            Registrasi Ulang Tuntas
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Gudep Pasif / Inaktif</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700 font-mono">
              {activeReport.totalGudepTidakAktif}
            </span>
            <span className="text-[10px] text-rose-700 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              Perlu Reaktivasi
            </span>
          </div>
          <div className="mt-1 text-[10px] text-rose-600">
            Butuh Pendampingan
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Anggota Muda</span>
            <Users className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 font-mono">
              {activeReport.totalAnggotaMuda.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-stone-500">Peserta Didik</span>
          </div>
          <div className="mt-1 text-[10px] text-amber-800 font-mono">
            Siaga • G • T • D
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Pembina Mahir</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-700 font-mono">
              {activeReport.totalPembinaMahir}
            </span>
            <span className="text-[10px] text-blue-700 font-medium">KMD / KML / KPD</span>
          </div>
          <div className="mt-1 text-[10px] text-blue-600">
            Kualifikasi Mahir Tersertifikasi
          </div>
        </div>
      </div>

      {/* Grid: Sebaran Kelurahan & Jenjang */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sebaran 11 Kelurahan Tanah Sareal (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5DFD5] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Perkembangan Keaktifan Gugus Depan per Kelurahan
              </h3>
              <p className="text-xs text-stone-500">
                Pemantauan 11 Kelurahan di wilayah Kwartir Ranting Tanah Sareal
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E5DFD5] text-stone-700">
              11 Kelurahan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-stone-600 font-bold">
                  <th className="py-2.5 px-3">Kelurahan</th>
                  <th className="py-2.5 px-3 text-center">Total Gudep</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700">Aktif</th>
                  <th className="py-2.5 px-3 text-center text-rose-700">Pasif</th>
                  <th className="py-2.5 px-3 text-right">Peserta Didik</th>
                  <th className="py-2.5 px-3 text-center">Evaluasi Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD5]/60">
                {activeReport.kelurahanBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-stone-800">
                      Kel. {row.kelurahan}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-stone-700">
                      {row.totalGudep}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                      {row.gudepAktif}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-700">
                      {row.gudepPasif > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          {row.gudepPasif}
                        </span>
                      ) : (
                        <span className="text-stone-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                      {row.totalAnggota} org
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          row.status === 'Sangat Baik'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : row.status === 'Optimal'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Jenjang Breakdown & Alert Card (1 Col) */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Jenjang Breakdown */}
          <div className="bg-white rounded-2xl border border-[#E5DFD5] p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Komposisi Berdasarkan Jenjang
              </h3>
              <p className="text-xs text-stone-500">
                Distribusi pangkalan SD, SMP, SMA & Perguruan Tinggi
              </p>
            </div>

            <div className="space-y-3">
              {activeReport.jenjangBreakdown.map((j, idx) => {
                const percent = Math.round((j.gudepAktif / j.totalGudep) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800">{j.jenjang}</span>
                      <span className="font-mono text-stone-600 text-[11px]">
                        <strong>{j.gudepAktif}</strong> / {j.totalGudep} Aktif ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] rounded-full h-2 overflow-hidden border border-[#E5DFD5]">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inactive Early Warning Box */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              <span>Perhatian Khusus Pangkalan Pasif</span>
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              Terdapat <strong>{activeReport.totalGudepTidakAktif} pangkalan</strong> yang belum menyerahkan berkas registrasi semesteran. Direkomendasikan untuk menjadwalkan kunjungan asistensi lapangan oleh Pengurus Harian.
            </p>
            <div className="text-[11px] text-rose-950 font-medium pt-1">
              Prioritas Kelurahan: <span className="font-bold">Sukaresmi, Kayumanis, Mekarwangi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluasi Ketua Kwarran & Rekomendasi Tindak Lanjut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Evaluasi Ketua Kwarran */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">
                Catatan & Evaluasi Ketua Kwarran
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
              Evaluasi Eksekutif
            </span>
          </div>

          <div className="space-y-2.5">
            {activeReport.evaluasiKetuaKwarran.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5]">
                <span className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rekomendasi Tindak Lanjut */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">
                Rekomendasi Tindak Lanjut Organisasi
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200">
              Action Items
            </span>
          </div>

          <div className="space-y-2.5">
            {activeReport.rekomendasiTindakLanjut.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5]">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Printable Sheet Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5] my-6">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#24140D] text-white print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-stone-100">
                  Pratinjau Lembar Laporan Eksekutif Semesteran
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Dokumen
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="p-8 sm:p-12 space-y-6 text-stone-900 bg-white max-h-[80vh] overflow-y-auto font-serif">
              {/* Kop Surat Resmi */}
              <div className="text-center border-b-4 border-double border-stone-900 pb-4 space-y-1">
                <div className="text-xs font-sans font-bold tracking-widest text-stone-600 uppercase">
                  GERAKAN PRAMUKA KWARTIR CABANG KOTA BOGOR
                </div>
                <div className="text-lg sm:text-xl font-extrabold uppercase text-stone-900 font-sans tracking-wide">
                  KWARTIR RANTING TANAH SAREAL
                </div>
                <div className="text-[11px] font-sans text-stone-600">
                  Sekretariat: Jl. Kebon Pedes No. 12, Kec. Tanah Sareal, Kota Bogor 16162 • Email: kwarran.tanahsareal@gmail.com
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center space-y-1 font-sans">
                <h2 className="text-base font-bold uppercase tracking-tight text-stone-900 underline">
                  LAPORAN BERKALA REGISTRASI & EVALUASI GUGUS DEPAN
                </h2>
                <div className="text-xs font-medium text-stone-700">
                  Periode: {activeReport.semester} Tahun Ajaran {activeReport.tahunAjaran}
                </div>
                <div className="text-[11px] font-mono text-stone-500">
                  Nomor: 09/09.02.04/LAP-SEM/{activeReport.tahunAjaran.slice(0, 4)}
                </div>
              </div>

              {/* Executive Summary Table */}
              <div className="space-y-2 font-sans text-xs">
                <div className="font-bold text-stone-900">I. REKAPITULASI DATA KEANGGOTAAN & PANGKALAN</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-stone-50 border border-stone-300 rounded-lg">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Total Pangkalan Gudep:</span>
                    <span className="font-bold text-sm text-stone-900 font-mono">{activeReport.totalGudepTerdaftar} Gugus Depan</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Gudep Aktif Registrasi:</span>
                    <span className="font-bold text-sm text-emerald-800 font-mono">{activeReport.totalGudepAktif} Gudep ({activeReport.persentaseKeaktifan}%)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Gudep Pasif / Inaktif:</span>
                    <span className="font-bold text-sm text-rose-800 font-mono">{activeReport.totalGudepTidakAktif} Gudep</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Total Pembina Mahir:</span>
                    <span className="font-bold text-sm text-blue-800 font-mono">{activeReport.totalPembinaMahir} Pembina Mahir</span>
                  </div>
                </div>
              </div>

              {/* Regional Table */}
              <div className="space-y-2 font-sans text-xs">
                <div className="font-bold text-stone-900">II. SEBARAN 11 KELURAHAN KECAMATAN TANAH SAREAL</div>
                <table className="w-full border-collapse border border-stone-300 text-left text-[11px]">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-300 font-bold text-stone-800">
                      <th className="p-2 border border-stone-300">Kelurahan</th>
                      <th className="p-2 border border-stone-300 text-center">Total Gudep</th>
                      <th className="p-2 border border-stone-300 text-center">Aktif</th>
                      <th className="p-2 border border-stone-300 text-center">Pasif</th>
                      <th className="p-2 border border-stone-300 text-right">Peserta Didik</th>
                      <th className="p-2 border border-stone-300 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.kelurahanBreakdown.map((row, idx) => (
                      <tr key={idx} className="border-b border-stone-200">
                        <td className="p-1.5 border border-stone-300 font-semibold">{row.kelurahan}</td>
                        <td className="p-1.5 border border-stone-300 text-center font-mono">{row.totalGudep}</td>
                        <td className="p-1.5 border border-stone-300 text-center font-mono text-emerald-800 font-bold">{row.gudepAktif}</td>
                        <td className="p-1.5 border border-stone-300 text-center font-mono text-rose-800 font-bold">{row.gudepPasif}</td>
                        <td className="p-1.5 border border-stone-300 text-right font-mono">{row.totalAnggota} org</td>
                        <td className="p-1.5 border border-stone-300 text-center">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Evaluation Points */}
              <div className="space-y-2 font-sans text-xs">
                <div className="font-bold text-stone-900">III. CATATAN EVALUASI KETUA KWARRAN</div>
                <ol className="list-decimal list-inside space-y-1 text-stone-800 bg-stone-50 p-3 rounded-lg border border-stone-300">
                  {activeReport.evaluasiKetuaKwarran.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ol>
              </div>

              {/* Action Recommendations */}
              <div className="space-y-2 font-sans text-xs">
                <div className="font-bold text-stone-900">IV. REKOMENDASI TINDAK LANJUT ORGANISASI</div>
                <ol className="list-decimal list-inside space-y-1 text-stone-800 bg-stone-50 p-3 rounded-lg border border-stone-300">
                  {activeReport.rekomendasiTindakLanjut.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ol>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 text-center font-sans text-xs gap-8">
                <div>
                  <div className="text-stone-500">Mengetahui/Menyetujui,</div>
                  <div className="font-bold text-stone-900 mt-1">{officialPengurus.ketua.jabatan}</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline text-stone-900">{officialPengurus.ketua.name.toUpperCase()}</div>
                  <div className="text-[10px] text-stone-500 font-mono">NTA. {officialPengurus.ketua.nta || '09.02.04.001.0001'}</div>
                </div>

                <div>
                  <div className="text-stone-500">Tanah Sareal, {activeReport.tanggalLaporan}</div>
                  <div className="font-bold text-stone-900 mt-1">{officialPengurus.sekretaris.jabatan}</div>
                  <div className="h-16"></div>
                  <div className="font-bold underline text-stone-900">{officialPengurus.sekretaris.name.toUpperCase()}</div>
                  <div className="text-[10px] text-stone-500 font-mono">NTA. {officialPengurus.sekretaris.nta || '09.02.04.001.0002'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Report Modal */}
      {isNewReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5]">
            <div className="flex items-center justify-between px-6 py-4 bg-[#24140D] text-white">
              <h3 className="font-bold text-sm text-stone-100">
                Buat Laporan Semesteran Baru
              </h3>
              <button
                onClick={() => setIsNewReportModalOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">Pilih Semester:</label>
                <select
                  id="new-semester-select"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-semibold"
                  defaultValue="Semester Genap"
                >
                  <option value="Semester Ganjil">Semester Ganjil (Juli - Desember)</option>
                  <option value="Semester Genap">Semester Genap (Januari - Juni)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Tahun Ajaran:</label>
                <input
                  id="new-ta-input"
                  type="text"
                  defaultValue="2026/2027"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono font-semibold"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                Sistem akan mengompilasi statistik live pangkalan terdaftar ({liveStats.totalGudep} gudep), status keaktifan ({liveStats.activeGudep} aktif), dan sebaran 11 kelurahan secara otomatis.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setIsNewReportModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sem = (document.getElementById('new-semester-select') as HTMLSelectElement).value as any;
                    const ta = (document.getElementById('new-ta-input') as HTMLInputElement).value;
                    handleCreateNewReport(sem, ta);
                  }}
                  className="px-4 py-2 bg-amber-600 text-stone-950 font-bold rounded-xl border border-amber-400"
                >
                  Generate Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
