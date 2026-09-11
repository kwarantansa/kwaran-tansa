import React, { useState, useMemo } from 'react';
import { 
  ArchiveDocument, 
  Member, 
  Gudep, 
  GDriveStorageSettings, 
  KlasifikasiSuratKeluar 
} from '../types';
import { 
  Send, 
  X, 
  Zap, 
  Printer, 
  Copy, 
  Calendar, 
  FileText, 
  User, 
  Building2, 
  CheckCircle2, 
  Eye, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface BuatSuratKeluarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveArchive: (doc: ArchiveDocument) => void;
  members?: Member[];
  gudepList?: Gudep[];
  gdriveSettings?: GDriveStorageSettings;
}

interface QuickTemplate {
  id: string;
  label: string;
  kodeKlasifikasi: string;
  kodeKlasifikasiPramuka: KlasifikasiSuratKeluar;
  perihal: string;
  lampiran: string;
  tujuan: string;
  alamatTujuan: string;
  isiUtama: string;
  waktuTempat?: {
    hariTanggal?: string;
    waktu?: string;
    tempat?: string;
    acara?: string;
  };
}

export const BuatSuratKeluarModal: React.FC<BuatSuratKeluarModalProps> = ({
  isOpen,
  onClose,
  onSaveArchive,
  members = [],
  gudepList = [],
  gdriveSettings
}) => {
  // Current date strings
  const today = new Date();
  const yearStr = today.getFullYear().toString();
  const monthRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][today.getMonth()];
  const todayIso = today.toISOString().slice(0, 10);

  // Form Fields matching user image
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState('PP.00.5 - Surat Keterangan Aktif Belajar Siswa');
  const [nomorSurat, setNomorSurat] = useState(`MTs.13.08/PP.00.5/005/${monthRoman}/${yearStr}`);
  const [tanggalSurat, setTanggalSurat] = useState(todayIso);
  const [lampiran, setLampiran] = useState('-');
  const [perihalSurat, setPerihalSurat] = useState('Surat Keterangan Aktif Belajar');
  const [tujuanSurat, setTujuanSurat] = useState('Orang Tua / Wali Siswa');
  const [alamatTujuan, setAlamatTujuan] = useState('di Tempat');
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [selectedGuruId, setSelectedGuruId] = useState('');
  const [isiUtamaSurat, setIsUtamaSurat] = useState(
    'Yang bertanda tangan di bawah ini Kepala Madrasah / Pangkalan menerangkan dengan sesungguhnya bahwa siswa tersebut di bawah ini adalah benar siswa aktif terdaftar pada tahun ajaran berjalan dan berkelakuan baik.'
  );

  // Detail Tambahan Waktu & Tempat (opsional)
  const [detailHariTanggal, setDetailHariTanggal] = useState('');
  const [detailWaktu, setDetailWaktu] = useState('');
  const [detailTempat, setDetailTempat] = useState('');
  const [detailAcara, setDetailAcara] = useState('');

  // Penandatangan
  const [tipeKop, setTipeKop] = useState<'madrasah' | 'kwarran'>('madrasah');
  const [namaPenandatangan, setNamaPenandatangan] = useState('Kak Drs. H. Mulyadi, M.Pd');
  const [jabatanPenandatangan, setJabatanPenandatangan] = useState('Kepala Madrasah / Ka Mabigus');
  const [nipPenandatangan, setNipPenandatangan] = useState('197608122005011004');
  const [tembusan, setTembusan] = useState('Ketua Komite / Mabigus, Arsip Surat');

  // Preview Mode Toggle
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Filter students and teachers from members
  const siswaList = useMemo(() => {
    return members.filter(m => m.golongan === 'Siaga' || m.golongan === 'Penggalang' || m.golongan === 'Penegak' || m.golongan === 'Pandega');
  }, [members]);

  const guruList = useMemo(() => {
    return members.filter(m => m.golongan === 'Pembina' || m.golongan === 'Pelatih' || m.golongan === 'Andalan' || m.golongan === 'Mabigus' || (m.jabatan && m.jabatan.toLowerCase().includes('pembina')));
  }, [members]);

  // Quick Templates Definition matching the pills in user screenshot
  const quickTemplates: QuickTemplate[] = [
    {
      id: 'ulangan',
      label: '+ Surat Pemberitahuan Ulangan',
      kodeKlasifikasi: 'PP.00.6 - Surat Pemberitahuan Penilaian / Ulangan',
      kodeKlasifikasiPramuka: 'A',
      perihal: 'Pemberitahuan Pelaksanaan Asesmen / Ulangan Semester',
      lampiran: '1 Lembar Jadwal',
      tujuan: 'Bapak/Ibu Orang Tua / Wali Siswa',
      alamatTujuan: 'di Tempat',
      isiUtama: 'Dengan hormat, diberitahukan kepada seluruh Bapak/Ibu Orang Tua/Wali Siswa bahwa pelaksanaan Penilaian Sumatif / Ulangan Semester Ganjil Tahun Pelajaran 2025/2026 akan dilaksanakan dengan jadwal terlampir. Mohon bantuan Bapak/Ibu untuk mendampingi dan memotivasi belajar putra-putrinya di rumah.',
      waktuTempat: {
        hariTanggal: 'Senin s.d. Jumat, 15 - 19 September 2026',
        waktu: '07.30 - 11.30 WIB',
        tempat: 'Ruang Kelas Masing-masing',
        acara: 'Penilaian Sumatif Tengah Semester'
      }
    },
    {
      id: 'aktif_siswa',
      label: '+ Surat Keterangan Aktif Siswa',
      kodeKlasifikasi: 'PP.00.5 - Surat Keterangan Aktif Belajar Siswa',
      kodeKlasifikasiPramuka: 'D',
      perihal: 'Surat Keterangan Aktif Belajar',
      lampiran: '-',
      tujuan: 'Orang Tua / Wali Siswa',
      alamatTujuan: 'di Tempat',
      isiUtama: 'Yang bertanda tangan di bawah ini menerangkan dengan sesungguhnya bahwa siswa yang bersangkutan adalah benar-benar terdaftar aktif sebagai siswa dan anggota Gerakan Pramuka pada pangkalan kami pada Tahun Pelajaran 2025/2026, serta memiliki kelakuan baik. Surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.'
    },
    {
      id: 'undangan_wali',
      label: '+ Surat Undangan Wali Murid',
      kodeKlasifikasi: 'HM.01 - Surat Undangan Pertemuan Wali Murid',
      kodeKlasifikasiPramuka: 'A',
      perihal: 'Undangan Pertemuan Wali Murid & Pembina',
      lampiran: '-',
      tujuan: 'Bapak/Ibu Orang Tua / Wali Siswa',
      alamatTujuan: 'di Tempat',
      isiUtama: 'Dengan hormat, sehubungan dengan awal tahun ajaran baru dan pembahasan program pembinaan karakter serta kepramukaan, kami mengundang Bapak/Ibu Orang Tua/Wali Siswa untuk dapat hadir pada pertemuan yang akan diselenggarakan pada:',
      waktuTempat: {
        hariTanggal: 'Sabtu, 20 September 2026',
        waktu: '08.30 WIB s.d. Selesai',
        tempat: 'Aula Pertemuan Utama Pangkalan',
        acara: 'Musyawarah Orang Tua Siswa & Pembina Gudep'
      }
    },
    {
      id: 'tugas_guru',
      label: '+ Surat Tugas Guru / Karyawan',
      kodeKlasifikasi: 'KP.01.2 - Surat Tugas Guru / Karyawan',
      kodeKlasifikasiPramuka: 'C',
      perihal: 'Surat Tugas Pendamping Kegiatan',
      lampiran: '1 Berkas',
      tujuan: 'Guru / Pembina yang Bersangkutan',
      alamatTujuan: 'di Tempat',
      isiUtama: 'Yang bertanda tangan di bawah ini memberikan tugas kedinasan dan kepramukaan kepada guru/pembina yang tercantum untuk menghadiri, mendampingi, dan membimbing kontingen siswa dalam agenda kegiatan resmi Kwartir Ranting Tanah Sareal.',
      waktuTempat: {
        hariTanggal: 'Jumat s.d. Minggu, 25 - 27 September 2026',
        waktu: '07.30 WIB s.d. Selesai',
        tempat: 'Bumi Perkemahan Cimandala / Kwarran',
        acara: 'Pendampingan Kontingen Giat Prestasi Pramuka'
      }
    },
    {
      id: 'panggilan_ortu',
      label: '+ Surat Panggilan Orang Tua Siswa',
      kodeKlasifikasi: 'PP.00.8 - Surat Panggilan Orang Tua Siswa',
      kodeKlasifikasiPramuka: 'A',
      perihal: 'Panggilan Orang Tua / Wali Siswa',
      lampiran: '-',
      tujuan: 'Bapak/Ibu Orang Tua / Wali Siswa',
      alamatTujuan: 'di Tempat',
      isiUtama: 'Dengan hormat, mengharap kehadiran Bapak/Ibu Orang Tua/Wali Siswa untuk hadir ke madrasah/sekolah guna membicarakan perkembangan proses belajar dan kedisiplinan putra/putri Bapak/Ibu:',
      waktuTempat: {
        hariTanggal: 'Rabu, 16 September 2026',
        waktu: '09.00 - 10.30 WIB',
        tempat: 'Ruang Bimbingan Konseling / Kesiswaan',
        acara: 'Konsultasi dan Pembinaan Siswa'
      }
    },
    {
      id: 'libur_kegiatan',
      label: '+ Surat Pemberitahuan Libur / Kegiatan',
      kodeKlasifikasi: 'HM.00 - Surat Pemberitahuan Libur / Kegiatan',
      kodeKlasifikasiPramuka: 'A',
      perihal: 'Pemberitahuan Hari Libur & Agenda Kegiatan',
      lampiran: '-',
      tujuan: 'Bapak/Ibu Orang Tua / Wali Siswa',
      alamatTujuan: 'di Tempat',
      isiUtama: 'Dengan hormat, diberitahukan kepada seluruh Bapak/Ibu Orang Tua/Wali Siswa bahwa berkaitan dengan kalender akademik dan agenda resmi, kegiatan belajar mengajar diliburkan mulai tanggal 28 September s.d. 30 September 2026 dan siswa aktif belajar kembali pada hari Kamis, 1 Oktober 2026.'
    }
  ];

  // Apply Quick Template
  const handleSelectTemplate = (tpl: QuickTemplate) => {
    setKodeKlasifikasi(tpl.kodeKlasifikasi);
    setPerihalSurat(tpl.perihal);
    setLampiran(tpl.lampiran);
    setTujuanSurat(tpl.tujuan);
    setAlamatTujuan(tpl.alamatTujuan);
    setIsUtamaSurat(tpl.isiUtama);

    // Auto update number
    const randNum = Math.floor(10 + Math.random() * 90);
    const codePart = tpl.kodeKlasifikasi.split(' ')[0];
    if (tipeKop === 'madrasah') {
      setNomorSurat(`MTs.13.08/${codePart}/0${randNum}/${monthRoman}/${yearStr}`);
    } else {
      setNomorSurat(`0${randNum}/09.02.04-${tpl.kodeKlasifikasiPramuka}/${yearStr}`);
    }

    if (tpl.waktuTempat) {
      setDetailHariTanggal(tpl.waktuTempat.hariTanggal || '');
      setDetailWaktu(tpl.waktuTempat.waktu || '');
      setDetailTempat(tpl.waktuTempat.tempat || '');
      setDetailAcara(tpl.waktuTempat.acara || '');
    } else {
      setDetailHariTanggal('');
      setDetailWaktu('');
      setDetailTempat('');
      setDetailAcara('');
    }
  };

  // Autofill Siswa change
  const handleSiswaChange = (siswaId: string) => {
    setSelectedSiswaId(siswaId);
    if (!siswaId) return;
    const s = members.find(m => m.id === siswaId);
    if (s) {
      setTujuanSurat(`Orang Tua / Wali dari ${s.namaLengkap}`);
      // If it's a student active letter or notification, inject details
      const studentSnippet = `\n\nIdentitas Siswa / Anggota:\n• Nama Lengkap: ${s.namaLengkap}\n• NTA / NIK: ${s.nta || s.nik || '-'}\n• Golongan / Tingkat: Pramuka ${s.golongan} (${s.tingkatan})\n• Pangkalan Gudep: ${s.namaPangkalan}\n• Alamat Rumah: ${s.alamatRumah || 'Kota Bogor'}`;
      if (!isiUtamaSurat.includes(s.namaLengkap)) {
        setIsUtamaSurat(prev => prev + studentSnippet);
      }
    }
  };

  // Autofill Guru change
  const handleGuruChange = (guruId: string) => {
    setSelectedGuruId(guruId);
    if (!guruId) return;
    const g = members.find(m => m.id === guruId);
    if (g) {
      setTujuanSurat(g.namaLengkap);
      const teacherSnippet = `\n\nIdentitas Guru / Pembina yang ditugaskan:\n• Nama: ${g.namaLengkap}\n• NTA / NIP: ${g.nta || '-'}\n• Jabatan: ${g.jabatan || 'Pembina Satuan Pramuka'}\n• Pangkalan / Satuan: ${g.namaPangkalan}`;
      if (!isiUtamaSurat.includes(g.namaLengkap)) {
        setIsUtamaSurat(prev => prev + teacherSnippet);
      }
    }
  };

  // Regenerate Number
  const handleRegenerateNumber = () => {
    const randNum = Math.floor(10 + Math.random() * 90);
    const codePart = kodeKlasifikasi.split(' ')[0];
    if (tipeKop === 'madrasah') {
      setNomorSurat(`MTs.13.08/${codePart}/0${randNum}/${monthRoman}/${yearStr}`);
    } else {
      setNomorSurat(`0${randNum}/09.02.04-A/${yearStr}`);
    }
  };

  // Save to Archive
  const handleSaveToArchive = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nomorSurat.trim() || !perihalSurat.trim()) {
      alert('Nomor surat dan perihal wajib diisi.');
      return;
    }

    const docId = `arch-sk-${Date.now()}`;
    const selectedSiswa = members.find(m => m.id === selectedSiswaId);
    const selectedGuru = members.find(m => m.id === selectedGuruId);
    const targetDrive = gdriveSettings?.drives.find(d => d.id === gdriveSettings.activeDriveId);

    // Full text composition for print & clipboard
    const fullLetterContent = `
${tipeKop === 'madrasah' ? "MADRASAH TSANAWIYAH / PANGKALAN GERAKAN PRAMUKA\nKECAMATAN TANAH SAREAL KOTA BOGOR" : "GERAKAN PRAMUKA KWARTIR RANTING TANAH SAREAL\nKOTA BOGOR"}

Nomor    : ${nomorSurat}
Lampiran : ${lampiran}
Perihal  : ${perihalSurat}

Kepada Yth.
${tujuanSurat}
${alamatTujuan}

Assalamu'alaikum Warahmatullahi Wabarakatuh / Salam Pramuka,

${isiUtamaSurat}
${detailHariTanggal ? `\nPelaksanaan:\nHari / Tanggal : ${detailHariTanggal}\nWaktu          : ${detailWaktu}\nTempat         : ${detailTempat}\nAcara          : ${detailAcara}\n` : ''}
Demikian surat ini kami sampaikan, atas perhatian, bantuan, dan kerja samanya kami ucapkan terima kasih.

Wassalamu'alaikum Warahmatullahi Wabarakatuh / Salam Pramuka.

Tanah Sareal, ${tanggalSurat}
${jabatanPenandatangan},

${namaPenandatangan}
NIP / NTA. ${nipPenandatangan}

Tembusan:
${tembusan}
    `.trim();

    const newDoc: ArchiveDocument = {
      id: docId,
      nomorDokumen: nomorSurat,
      judul: perihalSurat,
      kategori: 'Surat Keluar Kwarran',
      tipeArsip: 'surat_keluar',
      tanggalTerbit: tanggalSurat,
      tahun: parseInt(tanggalSurat.slice(0, 4), 10) || today.getFullYear(),
      instansiPenerbit: tipeKop === 'madrasah' ? 'MTs / Pangkalan Gugus Depan Tanah Sareal' : 'Kwartir Ranting Tanah Sareal',
      pangkalanTerkait: selectedSiswa?.namaPangkalan || selectedGuru?.namaPangkalan || undefined,
      ringkasan: `Surat Keluar perihal "${perihalSurat}" ditujukan kepada ${tujuanSurat}. Klasifikasi: ${kodeKlasifikasi}.`,
      fileType: 'DOCX',
      fileSize: '1.2 MB',
      cloudStorageUrl: targetDrive?.folderUrl || 'https://drive.google.com/drive/folders/kwarran-tanahsareal',
      targetDriveId: targetDrive?.id,
      targetDriveName: targetDrive?.name,
      tags: ['Surat Keluar', 'Resmi', kodeKlasifikasi.split(' ')[0]],
      statusArsip: 'Tersimpan di Cloud',
      aksesLevel: 'Pengurus Harian',
      diunggahOleh: 'Tata Usaha / Sekretaris',
      terakhirDiperbarui: todayIso,
      isiSurat: fullLetterContent,
      suratKeluar: {
        nomorSuratKwarran: nomorSurat,
        kodeKlasifikasi: (kodeKlasifikasi.includes('-A') ? 'A' : kodeKlasifikasi.includes('-B') ? 'B' : kodeKlasifikasi.includes('-C') ? 'C' : kodeKlasifikasi.includes('-D') ? 'D' : 'A') as KlasifikasiSuratKeluar,
        tujuanPenerima: tujuanSurat,
        perihal: perihalSurat,
        tanggalSurat: tanggalSurat,
        lampiran: lampiran,
        penandatanganNama: namaPenandatangan,
        penandatanganJabatan: jabatanPenandatangan,
        penandatanganNta: nipPenandatangan,
        tembusan: tembusan.split(',').map(t => t.trim()).filter(Boolean),
        statusDistribusi: 'Telah Terbit & Didistribusikan'
      }
    };

    onSaveArchive(newDoc);
    alert(`Surat Keluar "${nomorSurat}" berhasil disimpan ke daftar Arsip Surat Keluar!`);
    onClose();
  };

  // Copy Full Letter
  const handleCopyLetter = () => {
    const textToCopy = `
Nomor    : ${nomorSurat}
Lampiran : ${lampiran}
Perihal  : ${perihalSurat}

Kepada Yth.
${tujuanSurat}
${alamatTujuan}

${isiUtamaSurat}
${detailHariTanggal ? `\nHari/Tanggal: ${detailHariTanggal}\nWaktu: ${detailWaktu}\nTempat: ${detailTempat}\nAcara: ${detailAcara}\n` : ''}
Tanah Sareal, ${tanggalSurat}
${jabatanPenandatangan}

${namaPenandatangan}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  // Trigger Print
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container matching screenshot styling */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-4 flex flex-col max-h-[90vh]">
        
        {/* Dark Navy / Indigo Header matching user screenshot */}
        <div className="bg-[#1e1b4b] text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <Send className="w-5 h-5 -rotate-45" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Buat Surat Keluar Baru
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 bg-white flex-1 text-xs">
          
          {/* Quick Template Box (matching screenshot yellow/lightning banner) */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Pilih Template Cepat:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {quickTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className="px-3 py-1.5 bg-white hover:bg-amber-100/70 text-stone-800 border border-amber-300 rounded-lg font-semibold text-xs shadow-xs transition-all active:scale-95 text-left flex items-center gap-1"
                >
                  <span>{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 1: Kode Klasifikasi Surat & Nomor Surat (Auto/Manual) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Kode Klasifikasi Surat
              </label>
              <select
                value={kodeKlasifikasi}
                onChange={(e) => setKodeKlasifikasi(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-700/20 focus:outline-none font-medium text-stone-800"
              >
                <option value="PP.00.5 - Surat Keterangan Aktif Belajar Siswa">
                  PP.00.5 - Surat Keterangan Aktif Belajar Siswa
                </option>
                <option value="PP.00.6 - Surat Pemberitahuan Penilaian / Ulangan">
                  PP.00.6 - Surat Pemberitahuan Penilaian / Ulangan
                </option>
                <option value="HM.01 - Surat Undangan Pertemuan Wali Murid">
                  HM.01 - Surat Undangan Pertemuan Wali Murid
                </option>
                <option value="KP.01.2 - Surat Tugas Guru / Karyawan">
                  KP.01.2 - Surat Tugas Guru / Karyawan
                </option>
                <option value="PP.00.8 - Surat Panggilan Orang Tua Siswa">
                  PP.00.8 - Surat Panggilan Orang Tua Siswa
                </option>
                <option value="HM.00 - Surat Pemberitahuan Libur / Kegiatan">
                  HM.00 - Surat Pemberitahuan Libur / Kegiatan
                </option>
                <option value="09.02.04-A - Surat Edaran / Undangan Kwarran">
                  09.02.04-A - Surat Edaran / Undangan Kwarran
                </option>
                <option value="09.02.04-C - Surat Tugas / Mandat Kwarran">
                  09.02.04-C - Surat Tugas / Mandat Kwarran
                </option>
                <option value="09.02.04-D - Surat Rekomendasi Gudep">
                  09.02.04-D - Surat Rekomendasi Gudep
                </option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-800">
                  Nomor Surat (Auto/Manual)
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateNumber}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Acak Nomor</span>
                </button>
              </div>
              <input
                type="text"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                placeholder="MTs.13.08/PP.00.5/005/IX/2026"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-700/20 focus:outline-none font-mono font-bold text-indigo-950"
              />
            </div>
          </div>

          {/* Row 2: Tanggal Surat & Lampiran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Tanggal Surat
              </label>
              <input
                type="date"
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-700/20 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Lampiran
              </label>
              <input
                type="text"
                value={lampiran}
                onChange={(e) => setLampiran(e.target.value)}
                placeholder="-"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-700/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Perihal Surat */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Perihal Surat
            </label>
            <input
              type="text"
              value={perihalSurat}
              onChange={(e) => setPerihalSurat(e.target.value)}
              placeholder="Surat Keterangan Aktif Belajar"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-700/20 focus:outline-none font-semibold text-stone-900"
            />
          </div>

          {/* Row 4: Tujuan Surat (Kepada Yth.) & Alamat / Tempat Tujuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Tujuan Surat (Kepada Yth.)
              </label>
              <input
                type="text"
                value={tujuanSurat}
                onChange={(e) => setTujuanSurat(e.target.value)}
                placeholder="Orang Tua / Wali Siswa"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-700/20 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Alamat / Tempat Tujuan
              </label>
              <input
                type="text"
                value={alamatTujuan}
                onChange={(e) => setAlamatTujuan(e.target.value)}
                placeholder="di Tempat"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-700/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 5: Autofill Data Siswa (Opsional) & Autofill Data Guru (Opsional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                Autofill Data Siswa (Opsional)
              </label>
              <select
                value={selectedSiswaId}
                onChange={(e) => handleSiswaChange(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-700/20 focus:outline-none text-stone-700 font-medium"
              >
                <option value="">-- Pilih Siswa Untuk Isi Otomatis --</option>
                {siswaList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.namaLengkap} ({s.golongan} - {s.namaPangkalan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                Autofill Data Guru (Opsional)
              </label>
              <select
                value={selectedGuruId}
                onChange={(e) => handleGuruChange(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-700/20 focus:outline-none text-stone-700 font-medium"
              >
                <option value="">-- Pilih Guru Untuk Surat Tugas --</option>
                {guruList.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.namaLengkap} ({g.jabatan || 'Pembina'} - {g.namaPangkalan})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 6: Isi Utama Surat */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Isi Utama Surat
            </label>
            <textarea
              rows={4}
              value={isiUtamaSurat}
              onChange={(e) => setIsUtamaSurat(e.target.value)}
              placeholder="Tuliskan isi redaksi pokok surat di sini..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-700/20 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Optional: Detail Kegiatan (Hari/Tanggal/Waktu/Tempat/Acara) jika ada acara */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <span className="text-xs font-bold text-stone-800 block">
              Detail Agenda / Acara (Opsional untuk Surat Undangan / Ulangan / Tugas)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-stone-500 font-medium block mb-0.5">Hari / Tanggal:</label>
                <input
                  type="text"
                  value={detailHariTanggal}
                  onChange={(e) => setDetailHariTanggal(e.target.value)}
                  placeholder="Contoh: Sabtu, 20 September 2026"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 font-medium block mb-0.5">Waktu / Pukul:</label>
                <input
                  type="text"
                  value={detailWaktu}
                  onChange={(e) => setDetailWaktu(e.target.value)}
                  placeholder="Contoh: 08.00 s.d. Selesai"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 font-medium block mb-0.5">Tempat:</label>
                <input
                  type="text"
                  value={detailTempat}
                  onChange={(e) => setDetailTempat(e.target.value)}
                  placeholder="Contoh: Aula Pertemuan"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 font-medium block mb-0.5">Acara / Keperluan:</label>
                <input
                  type="text"
                  value={detailAcara}
                  onChange={(e) => setDetailAcara(e.target.value)}
                  placeholder="Contoh: Pertemuan Sosialisasi"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Row 7: Kop Surat & Penandatangan */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <span className="text-xs font-bold text-stone-800 block">
              Format Kop Surat & Penandatangan
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-stone-500 font-medium block mb-0.5">Pilihan Kop Surat:</label>
                <select
                  value={tipeKop}
                  onChange={(e) => setTipeKop(e.target.value as any)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="madrasah">Kop Madrasah / Sekolah / Gudep</option>
                  <option value="kwarran">Kop Kwarran Tanah Sareal</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-stone-500 font-medium block mb-0.5">Nama Penandatangan:</label>
                <input
                  type="text"
                  value={namaPenandatangan}
                  onChange={(e) => setNamaPenandatangan(e.target.value)}
                  placeholder="Kak Drs. H. Mulyadi, M.Pd"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] text-stone-500 font-medium block mb-0.5">Jabatan Penandatangan:</label>
                <input
                  type="text"
                  value={jabatanPenandatangan}
                  onChange={(e) => setJabatanPenandatangan(e.target.value)}
                  placeholder="Kepala Madrasah / Ka Mabigus"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] text-stone-500 font-medium block mb-0.5">NIP / NTA Penandatangan:</label>
                <input
                  type="text"
                  value={nipPenandatangan}
                  onChange={(e) => setNipPenandatangan(e.target.value)}
                  placeholder="197608122005011004"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-stone-500 font-medium block mb-0.5">Tembusan (Opsional):</label>
                <input
                  type="text"
                  value={tembusan}
                  onChange={(e) => setTembusan(e.target.value)}
                  placeholder="Ketua Komite, Arsip"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLetter}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-stone-700 border border-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedToast ? 'Teks Disalin!' : 'Salin Naskah'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-indigo-900 border border-indigo-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isPreviewOpen ? 'Sembunyikan Pratinjau' : 'Pratinjau Lembar A4'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 bg-white hover:bg-stone-100 border border-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-stone-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-amber-800" />
              <span>Cetak Surat</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveToArchive()}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 -rotate-45 text-indigo-300" />
              <span>Simpan ke Surat Keluar</span>
            </button>
          </div>
        </div>

        {/* Live A4 Print Preview Overlay if toggled */}
        {isPreviewOpen && (
          <div className="p-6 bg-slate-200 border-t border-slate-300 max-h-[60vh] overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-300 text-stone-900 font-serif leading-relaxed text-xs space-y-4">
              {/* Kop Surat */}
              <div className="text-center pb-3 border-b-2 border-stone-900 space-y-1">
                <div className="text-xs font-extrabold uppercase tracking-wider">
                  {tipeKop === 'madrasah' ? 'KEMENTERIAN AGAMA REPUBLIK INDONESIA' : 'GERAKAN PRAMUKA KWARTIR RANTING'}
                </div>
                <div className="text-sm font-black uppercase tracking-wide">
                  {tipeKop === 'madrasah' ? 'MADRASAH TSANAWIYAH AL-IKHLAS / GUGUS DEPAN' : 'KWARTIR RANTING TANAH SAREAL KOTA BOGOR'}
                </div>
                <div className="text-[10px] text-stone-600 italic">
                  Jl. KH. Sholeh Iskandar No. 12, Kel. Kedung Badak, Tanah Sareal, Kota Bogor 16164 • Telp: (0251) 8332145
                </div>
              </div>

              {/* Header Surat */}
              <div className="flex justify-between items-start pt-2">
                <div className="space-y-0.5">
                  <div><strong>Nomor</strong> : <span className="font-mono">{nomorSurat}</span></div>
                  <div><strong>Lampiran</strong> : {lampiran}</div>
                  <div><strong>Perihal</strong> : <strong>{perihalSurat}</strong></div>
                </div>
                <div className="text-right">
                  Tanah Sareal, {tanggalSurat}
                </div>
              </div>

              {/* Tujuan */}
              <div className="pt-2">
                <div>Kepada Yth.</div>
                <div className="font-bold">{tujuanSurat}</div>
                <div>{alamatTujuan}</div>
              </div>

              {/* Isi */}
              <div className="pt-3 space-y-2 whitespace-pre-line text-justify">
                <p>Assalamu&apos;alaikum Warahmatullahi Wabarakatuh,</p>
                <p>{isiUtamaSurat}</p>

                {detailHariTanggal && (
                  <div className="pl-6 py-2 space-y-1 font-sans text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <div><strong>Hari / Tanggal :</strong> {detailHariTanggal}</div>
                    <div><strong>Waktu :</strong> {detailWaktu}</div>
                    <div><strong>Tempat :</strong> {detailTempat}</div>
                    <div><strong>Acara :</strong> {detailAcara}</div>
                  </div>
                )}

                <p>Demikian surat ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.</p>
                <p>Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh.</p>
              </div>

              {/* Tanda Tangan */}
              <div className="pt-6 flex justify-end">
                <div className="text-center w-56 space-y-12">
                  <div>
                    {jabatanPenandatangan},
                  </div>
                  <div>
                    <div className="font-bold underline">{namaPenandatangan}</div>
                    <div className="text-[10px] font-mono text-stone-600">NIP/NTA. {nipPenandatangan}</div>
                  </div>
                </div>
              </div>

              {/* Tembusan */}
              {tembusan && (
                <div className="pt-4 border-t border-stone-200 text-[10px] text-stone-600">
                  <strong>Tembusan Yth:</strong><br />
                  {tembusan}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
