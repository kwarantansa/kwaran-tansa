import React, { useState, useMemo, useRef } from 'react';
import { 
  SuratKeluarTemplate, 
  ArchiveDocument, 
  KlasifikasiSuratKeluar 
} from '../types';
import { 
  SURAT_KELUAR_TEMPLATES, 
  KWARANTANSA_LETTERHEAD, 
  generateLetterNumber 
} from '../data/letterTemplates';
import { 
  FileText, 
  Printer, 
  Copy, 
  Download, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Layers, 
  Info, 
  RotateCcw, 
  Building2, 
  Calendar, 
  UserCheck, 
  Send,
  Eye,
  Edit3
} from 'lucide-react';

interface SuratKeluarTemplateManagerProps {
  onSaveArchive: (doc: ArchiveDocument) => void;
  onBackToSuratKeluar?: () => void;
  existingSuratKeluarCount?: number;
}

export const SuratKeluarTemplateManager: React.FC<SuratKeluarTemplateManagerProps> = ({
  onSaveArchive,
  onBackToSuratKeluar,
  existingSuratKeluarCount = 0
}) => {
  // Navigation tabs within Template Menu
  const [activeTab, setActiveTab] = useState<'catalog' | 'editor' | 'guideline'>('catalog');
  const [selectedTemplate, setSelectedTemplate] = useState<SuratKeluarTemplate>(SURAT_KELUAR_TEMPLATES[0]);
  const [selectedFilterKlasifikasi, setSelectedFilterKlasifikasi] = useState<string>('ALL');

  // Form State
  const defaultSeq = existingSuratKeluarCount + 1;
  const [letterNumber, setLetterNumber] = useState(generateLetterNumber(defaultSeq, selectedTemplate.kodeKlasifikasi));
  const [klasifikasi, setKlasifikasi] = useState<KlasifikasiSuratKeluar>(selectedTemplate.kodeKlasifikasi);
  
  // Format tanggal Indonesia default: "Bogor, 11 September 2026"
  const defaultDateStr = useMemo(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const now = new Date();
    return `Bogor, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  const [letterDate, setLetterDate] = useState(defaultDateStr);
  const [lampiran, setLampiran] = useState(selectedTemplate.lampiranDefault);
  const [perihal, setPerihal] = useState(selectedTemplate.perihalDefault);
  const [tujuan, setTujuan] = useState(selectedTemplate.tujuanDefault);
  const [tempatTujuan, setTempatTujuan] = useState(selectedTemplate.tempatTujuanDefault);
  const [salamPembuka, setSalamPembuka] = useState(selectedTemplate.salamPembukaDefault);
  const [isiPembuka, setIsiPembuka] = useState(selectedTemplate.isiPembukaDefault);

  // Detail kegiatan
  const [enableDetailKegiatan, setEnableDetailKegiatan] = useState(!!selectedTemplate.detailKegiatanDefault);
  const [hariTanggal, setHariTanggal] = useState(selectedTemplate.detailKegiatanDefault?.hariTanggal || '');
  const [waktu, setWaktu] = useState(selectedTemplate.detailKegiatanDefault?.waktu || '');
  const [tempat, setTempat] = useState(selectedTemplate.detailKegiatanDefault?.tempat || '');
  const [acara, setAcara] = useState(selectedTemplate.detailKegiatanDefault?.acara || '');
  const [pakaian, setPakaian] = useState(selectedTemplate.detailKegiatanDefault?.pakaian || '');

  const [isiBadan, setIsiBadan] = useState(selectedTemplate.isiBadanDefault);
  const [isiPenutup, setIsiPenutup] = useState(selectedTemplate.isiPenutupDefault);

  // Penandatangan
  const [signerRole, setSignerRole] = useState<'ketua' | 'sekretaris' | 'custom'>('ketua');
  const [penandatanganJabatan, setPenandatanganJabatan] = useState(selectedTemplate.penandatanganJabatanDefault);
  const [penandatanganNama, setPenandatanganNama] = useState(selectedTemplate.penandatanganNamaDefault);
  const [penandatanganNta, setPenandatanganNta] = useState(selectedTemplate.penandatanganNtaDefault);

  // Tembusan
  const [tembusanList, setTembusanList] = useState<string[]>(selectedTemplate.tembusanDefault);
  const [newTembusanInput, setNewTembusanInput] = useState('');

  // Notifications
  const [copySuccessToast, setCopySuccessToast] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Load a template into the editor
  const handleSelectTemplate = (tpl: SuratKeluarTemplate) => {
    setSelectedTemplate(tpl);
    setKlasifikasi(tpl.kodeKlasifikasi);
    setLetterNumber(generateLetterNumber(defaultSeq, tpl.kodeKlasifikasi));
    setLampiran(tpl.lampiranDefault);
    setPerihal(tpl.perihalDefault);
    setTujuan(tpl.tujuanDefault);
    setTempatTujuan(tpl.tempatTujuanDefault);
    setSalamPembuka(tpl.salamPembukaDefault);
    setIsiPembuka(tpl.isiPembukaDefault);

    if (tpl.detailKegiatanDefault) {
      setEnableDetailKegiatan(true);
      setHariTanggal(tpl.detailKegiatanDefault.hariTanggal || '');
      setWaktu(tpl.detailKegiatanDefault.waktu || '');
      setTempat(tpl.detailKegiatanDefault.tempat || '');
      setAcara(tpl.detailKegiatanDefault.acara || '');
      setPakaian(tpl.detailKegiatanDefault.pakaian || '');
    } else {
      setEnableDetailKegiatan(false);
      setHariTanggal('');
      setWaktu('');
      setTempat('');
      setAcara('');
      setPakaian('');
    }

    setIsiBadan(tpl.isiBadanDefault);
    setIsiPenutup(tpl.isiPenutupDefault);
    setPenandatanganJabatan(tpl.penandatanganJabatanDefault);
    setPenandatanganNama(tpl.penandatanganNamaDefault);
    setPenandatanganNta(tpl.penandatanganNtaDefault);
    setTembusanList(tpl.tembusanDefault);
    setActiveTab('editor');
  };

  // Change Signer quickly
  const handleSignerRoleChange = (role: 'ketua' | 'sekretaris' | 'custom') => {
    setSignerRole(role);
    if (role === 'ketua') {
      setPenandatanganJabatan('Ketua Kwartir Ranting Tanah Sareal');
      setPenandatanganNama(KWARANTANSA_LETTERHEAD.ketuaKwarran);
      setPenandatanganNta(`NTA. ${KWARANTANSA_LETTERHEAD.ketuaNta}`);
    } else if (role === 'sekretaris') {
      setPenandatanganJabatan('Sekretaris Kwartir Ranting Tanah Sareal');
      setPenandatanganNama(KWARANTANSA_LETTERHEAD.sekretarisKwarran);
      setPenandatanganNta(`NTA. ${KWARANTANSA_LETTERHEAD.sekretarisNta}`);
    }
  };

  // Handle Klasifikasi change
  const handleKlasifikasiChange = (newK: KlasifikasiSuratKeluar) => {
    setKlasifikasi(newK);
    setLetterNumber(generateLetterNumber(defaultSeq, newK));
  };

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    if (selectedFilterKlasifikasi === 'ALL') return SURAT_KELUAR_TEMPLATES;
    return SURAT_KELUAR_TEMPLATES.filter(t => t.kodeKlasifikasi === selectedFilterKlasifikasi);
  }, [selectedFilterKlasifikasi]);

  // Construct Plain Text Letter for Copying
  const generatePlainText = () => {
    let text = `${KWARANTANSA_LETTERHEAD.namaOrganisasi}\n`;
    text += `${KWARANTANSA_LETTERHEAD.kwartir}\n`;
    text += `${KWARANTANSA_LETTERHEAD.alamat}\n`;
    text += `${KWARANTANSA_LETTERHEAD.kontak}\n`;
    text += `---------------------------------------------------------\n\n`;
    text += `Nomor   : ${letterNumber}\n`;
    text += `Lampiran: ${lampiran}\n`;
    text += `Perihal : ${perihal}\n\n`;
    text += `${letterDate}\n\n`;
    text += `Kepada:\n${tujuan}\n${tempatTujuan}\n\n`;
    text += `${salamPembuka}\n\n`;
    text += `${isiPembuka}\n\n`;

    if (enableDetailKegiatan) {
      if (hariTanggal) text += `Hari/Tanggal : ${hariTanggal}\n`;
      if (waktu) text += `Waktu        : ${waktu}\n`;
      if (tempat) text += `Tempat       : ${tempat}\n`;
      if (acara) text += `Acara        : ${acara}\n`;
      if (pakaian) text += `Pakaian      : ${pakaian}\n\n`;
    }

    text += `${isiBadan}\n\n`;
    text += `${isiPenutup}\n\n`;
    text += `Kwartir Ranting Gerakan Pramuka Tanah Sareal\n`;
    text += `${penandatanganJabatan},\n\n\n\n`;
    text += `${penandatanganNama}\n`;
    text += `${penandatanganNta}\n\n`;

    if (tembusanList.length > 0) {
      text += `Tembusan:\n`;
      tembusanList.forEach((t, i) => {
        text += `${i + 1}. ${t}\n`;
      });
    }

    return text;
  };

  // Copy to Clipboard
  const handleCopyToClipboard = () => {
    const text = generatePlainText();
    navigator.clipboard.writeText(text);
    setCopySuccessToast(true);
    setTimeout(() => setCopySuccessToast(false), 2500);
  };

  // Print Letter
  const handlePrintLetter = () => {
    window.print();
  };

  // Save directly as a Surat Keluar Archive Document
  const handleSaveToArsipSuratKeluar = () => {
    const nowIso = new Date().toISOString().slice(0, 10);
    const newDoc: ArchiveDocument = {
      id: `surat-keluar-${Date.now()}`,
      nomorDokumen: letterNumber,
      judul: perihal,
      kategori: 'Surat Keluar Kwarran',
      tipeArsip: 'surat_keluar',
      tanggalTerbit: nowIso,
      tahun: new Date().getFullYear(),
      instansiPenerbit: 'Kwartir Ranting Tanah Sareal',
      pangkalanTerkait: tujuan.includes('Gudep') ? tujuan : undefined,
      ringkasan: `${isiPembuka.slice(0, 140)}... (Tujuan: ${tujuan})`,
      fileType: 'DOCX',
      fileSize: '1.2 MB',
      cloudStorageUrl: 'https://drive.google.com/drive/folders/kwarran-tanahsareal-surat-keluar',
      tags: ['Surat Keluar', `Klasifikasi-${klasifikasi}`, selectedTemplate.kategori, 'Resmi Kwarran'],
      statusArsip: 'Tersimpan di Cloud',
      aksesLevel: 'Publik / Gudep',
      diunggahOleh: `${penandatanganJabatan} (${penandatanganNama})`,
      terakhirDiperbarui: nowIso,
      isiSurat: generatePlainText(),
      suratKeluar: {
        nomorSuratKwarran: letterNumber,
        kodeKlasifikasi: klasifikasi,
        tujuanPenerima: tujuan,
        perihal: perihal,
        tanggalSurat: letterDate,
        lampiran: lampiran,
        penandatanganNama: penandatanganNama,
        penandatanganJabatan: penandatanganJabatan,
        penandatanganNta: penandatanganNta,
        tembusan: tembusanList,
        templateId: selectedTemplate.id,
        statusDistribusi: 'Telah Terbit & Didistribusikan'
      }
    };

    onSaveArchive(newDoc);
    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
      if (onBackToSuratKeluar) {
        onBackToSuratKeluar();
      }
    }, 1500);
  };

  // Download Letter as Word HTML document
  const handleDownloadDoc = () => {
    const letterHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${perihal}</title><meta charset='utf-8'>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.35; padding: 20px; }
        .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 20px; }
        .kop h2 { margin: 0; font-size: 15pt; font-weight: bold; letter-spacing: 1px; }
        .kop h3 { margin: 2px 0; font-size: 13pt; font-weight: bold; }
        .kop p { margin: 0; font-size: 9.5pt; }
        table.meta { width: 100%; margin-bottom: 16px; font-size: 12pt; }
        table.detail { width: 100%; border-collapse: collapse; margin: 12px 0 16px 20px; font-size: 11.5pt; }
        table.detail td { padding: 4px 8px; vertical-align: top; }
        .signature { float: right; width: 280px; text-align: center; margin-top: 24px; }
        .tembusan { clear: both; margin-top: 30px; font-size: 10pt; }
      </style>
      </head>
      <body>
        <div class="kop">
          <h2>${KWARANTANSA_LETTERHEAD.namaOrganisasi}</h2>
          <h3>${KWARANTANSA_LETTERHEAD.kwartir}</h3>
          <p>${KWARANTANSA_LETTERHEAD.alamat}</p>
          <p>${KWARANTANSA_LETTERHEAD.kontak}</p>
        </div>
        <table class="meta">
          <tr>
            <td style="width: 100px;">Nomor</td><td style="width: 10px;">:</td><td>${letterNumber}</td>
            <td style="text-align: right;">${letterDate}</td>
          </tr>
          <tr><td>Lampiran</td><td>:</td><td>${lampiran}</td><td></td></tr>
          <tr><td>Perihal</td><td>:</td><td><strong>${perihal}</strong></td><td></td></tr>
        </table>
        <p>Kepada Yth.<br/><strong>${tujuan}</strong><br/>${tempatTujuan.replace(/\n/g, '<br/>')}</p>
        <p><strong>${salamPembuka}</strong></p>
        <p style="text-align: justify; text-indent: 30px;">${isiPembuka}</p>
        ${enableDetailKegiatan ? `
          <table class="detail">
            ${hariTanggal ? `<tr><td style="width: 130px;">Hari, Tanggal</td><td>:</td><td>${hariTanggal}</td></tr>` : ''}
            ${waktu ? `<tr><td>Waktu</td><td>:</td><td>${waktu}</td></tr>` : ''}
            ${tempat ? `<tr><td>Tempat</td><td>:</td><td>${tempat}</td></tr>` : ''}
            ${acara ? `<tr><td>Acara</td><td>:</td><td>${acara.replace(/\n/g, '<br/>')}</td></tr>` : ''}
            ${pakaian ? `<tr><td>Pakaian</td><td>:</td><td>${pakaian}</td></tr>` : ''}
          </table>
        ` : ''}
        <p style="text-align: justify; text-indent: 30px;">${isiBadan}</p>
        <p style="text-align: justify; text-indent: 30px;">${isiPenutup}</p>
        <div class="signature">
          <p>Kwartir Ranting Gerakan Pramuka<br/>Tanah Sareal<br/><strong>${penandatanganJabatan}</strong>,</p>
          <br/><br/><br/>
          <p><strong><u>${penandatanganNama}</u></strong><br/>${penandatanganNta}</p>
        </div>
        ${tembusanList.length > 0 ? `
          <div class="tembusan">
            <p><strong><u>Tembusan disampaikan kepada Yth:</u></strong></p>
            <ol style="margin: 0; padding-left: 20px;">
              ${tembusanList.map(t => `<li>${t}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', letterHtml], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Surat-Keluar-${letterNumber.replace(/[\/\\]/g, '-')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      {copySuccessToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-xl bg-stone-900 text-amber-400 text-xs flex items-center gap-2 shadow-2xl border border-amber-600/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Format naskah surat dinas berhasil disalin ke Clipboard!</span>
        </div>
      )}

      {saveSuccessToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-xl bg-emerald-900 text-emerald-100 text-xs flex items-center gap-2 shadow-2xl border border-emerald-500/50 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Surat Keluar resmi berhasil disimpan ke Buku Arsip & Sinkronisasi Cloud!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#24140D] text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-[#3C2216]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {onBackToSuratKeluar && (
                <button
                  onClick={onBackToSuratKeluar}
                  className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors mr-1"
                  title="Kembali ke Daftar Surat Keluar"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                MENU TEMPLATE SURAT KELUAR KWARRAN
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
              Generator & Tata Naskah Surat Keluar Gerakan Pramuka
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              Pilih format template baku resmi Kwarran Tanah Sareal (Undangan, Edaran, Surat Tugas/Mandat, Rekomendasi Kegiatan Gudep, Izin Fasilitas), sesuaikan isian secara instan, cetak format A4 ber-Kop Surat resmi, atau simpan langsung ke repositori arsip.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onBackToSuratKeluar && (
              <button
                onClick={onBackToSuratKeluar}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#331B10] hover:bg-[#442416] text-stone-200 border border-[#4E2818] transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Lihat Arsip Surat Keluar</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab(activeTab === 'catalog' ? 'editor' : 'catalog')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md transition-all flex items-center gap-2 border border-amber-400"
            >
              {activeTab === 'catalog' ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Buka Editor & Pratinjau Surat</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Pilih Template Lain ({SURAT_KELUAR_TEMPLATES.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation in Template Manager */}
        <div className="flex items-center gap-2 border-t border-[#3C2216] mt-5 pt-4 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-[#341C11]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Katalog Template Resmi ({SURAT_KELUAR_TEMPLATES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'editor'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-[#341C11]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>2. Editor & Pratinjau Cetak Surat ({selectedTemplate.namaTemplate.slice(0, 24)}...)</span>
          </button>

          <button
            onClick={() => setActiveTab('guideline')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'guideline'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:bg-[#341C11]'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>3. Panduan Tata Naskah & Kode Klasifikasi Surat Pramuka</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CATALOG OF TEMPLATES */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-[#E5DFD5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700">Filter Klasifikasi:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'ALL', label: 'Semua Template' },
                  { id: 'A', label: 'A (Biasa, Edaran & Undangan)' },
                  { id: 'C', label: 'C (Surat Tugas & Mandat)' },
                  { id: 'D', label: 'D (Rekomendasi & Pengantar)' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilterKlasifikasi(f.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      selectedFilterKlasifikasi === f.id
                        ? 'bg-amber-800 text-white font-bold'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs text-stone-500">
              Ditemukan {filteredTemplates.length} template baku
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(tpl => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                    isSelected ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-sm' : 'border-[#E5DFD5]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                        tpl.kodeKlasifikasi === 'A'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : tpl.kodeKlasifikasi === 'C'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}>
                        Kode: {tpl.kodeKlasifikasi} ({tpl.kategori})
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-amber-700" />
                          Dipilih
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 leading-snug">
                      {tpl.namaTemplate}
                    </h3>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {tpl.deskripsi}
                    </p>

                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-stone-400 font-semibold">Perihal Default:</span>
                        <div className="font-medium text-stone-800 line-clamp-2">{tpl.perihalDefault}</div>
                      </div>
                      <div>
                        <span className="text-stone-400 font-semibold">Tujuan Umum:</span>
                        <div className="font-medium text-stone-700 truncate">{tpl.tujuanDefault}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-stone-400">
                      Format Kwarran 09.02.04
                    </span>
                    <button
                      onClick={() => handleSelectTemplate(tpl)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <span>Gunakan Template</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EDITOR & LIVE DOCUMENT PREVIEW */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5DFD5] shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-800">
                Template Aktif:
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300">
                {selectedTemplate.namaTemplate}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopyToClipboard}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors flex items-center gap-1.5"
                title="Salin naskah lengkap ke clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks</span>
              </button>

              <button
                onClick={handleDownloadDoc}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors flex items-center gap-1.5"
                title="Unduh berkas Word (.doc)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Word (.doc)</span>
              </button>

              <button
                onClick={handlePrintLetter}
                className="px-3.5 py-1.5 text-xs font-bold bg-[#24140D] hover:bg-[#341C11] text-amber-300 border border-amber-600/40 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                title="Cetak format kertas A4 ber-Kop Surat"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Cetak / Cetak PDF (A4)</span>
              </button>

              <button
                onClick={handleSaveToArsipSuratKeluar}
                className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl shadow-md transition-all flex items-center gap-1.5 border border-amber-400 active:scale-95"
                title="Simpan langsung ke daftar Surat Keluar Kwarran"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan ke Arsip Surat Keluar</span>
              </button>
            </div>
          </div>

          {/* Split Screen: Form Editor (Left) & Live A4 Document Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: FORM SETTINGS (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-sm space-y-4 max-h-[950px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-700" />
                  <h3 className="text-sm font-bold text-stone-900">Form Isian Variabel Surat</h3>
                </div>
                <button
                  onClick={() => handleSelectTemplate(selectedTemplate)}
                  className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                  title="Kembalikan nilai isian ke bawaan template"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Isian
                </button>
              </div>

              {/* Klasifikasi & Nomor Surat */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Kode Klasifikasi
                    </label>
                    <select
                      value={klasifikasi}
                      onChange={(e) => handleKlasifikasiChange(e.target.value as KlasifikasiSuratKeluar)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                    >
                      <option value="A">A - Biasa / Edaran / Undangan</option>
                      <option value="B">B - Surat Keputusan / Instruksi</option>
                      <option value="C">C - Surat Tugas / Mandat</option>
                      <option value="D">D - Pengantar / Rekomendasi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Tanggal Surat
                    </label>
                    <input
                      type="text"
                      value={letterDate}
                      onChange={(e) => setLetterDate(e.target.value)}
                      placeholder="Bogor, 11 September 2026"
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Nomor Surat Resmi Kwarran
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={letterNumber}
                      onChange={(e) => setLetterNumber(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono font-bold bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                    />
                    <button
                      onClick={() => setLetterNumber(generateLetterNumber(defaultSeq, klasifikasi))}
                      className="px-2.5 py-1.5 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl"
                      title="Generate ulang format nomor kwarran"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Lampiran
                    </label>
                    <input
                      type="text"
                      value={lampiran}
                      onChange={(e) => setLampiran(e.target.value)}
                      placeholder="1 (satu) Berkas / -"
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Salam Pembuka
                    </label>
                    <input
                      type="text"
                      value={salamPembuka}
                      onChange={(e) => setSalamPembuka(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Perihal Dokumen
                  </label>
                  <input
                    type="text"
                    value={perihal}
                    onChange={(e) => setPerihal(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-semibold bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Tujuan Surat (Kepada Yth.)
                  </label>
                  <input
                    type="text"
                    value={tujuan}
                    onChange={(e) => setTujuan(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none mb-1.5"
                  />
                  <input
                    type="text"
                    value={tempatTujuan}
                    onChange={(e) => setTempatTujuan(e.target.value)}
                    placeholder="di Tempat / di Kota Bogor"
                    className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Paragraf Pembuka
                  </label>
                  <textarea
                    rows={2}
                    value={isiPembuka}
                    onChange={(e) => setIsiPembuka(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none"
                  />
                </div>

                {/* Detail Kegiatan Toggle */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      Detail Jadwal / Lokasi Acara
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-600">
                      <input
                        type="checkbox"
                        checked={enableDetailKegiatan}
                        onChange={(e) => setEnableDetailKegiatan(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Aktifkan</span>
                    </label>
                  </div>

                  {enableDetailKegiatan && (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={hariTanggal}
                        onChange={(e) => setHariTanggal(e.target.value)}
                        placeholder="Hari, Tanggal (contoh: Sabtu, 26 September 2026)"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5DFD5] rounded-lg"
                      />
                      <input
                        type="text"
                        value={waktu}
                        onChange={(e) => setWaktu(e.target.value)}
                        placeholder="Waktu (contoh: 08.30 WIB s.d. Selesai)"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5DFD5] rounded-lg"
                      />
                      <input
                        type="text"
                        value={tempat}
                        onChange={(e) => setTempat(e.target.value)}
                        placeholder="Tempat Pelaksanaan"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5DFD5] rounded-lg"
                      />
                      <input
                        type="text"
                        value={acara}
                        onChange={(e) => setAcara(e.target.value)}
                        placeholder="Agenda / Acara"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5DFD5] rounded-lg"
                      />
                      <input
                        type="text"
                        value={pakaian}
                        onChange={(e) => setPakaian(e.target.value)}
                        placeholder="Pakaian (contoh: Seragam Pramuka Lengkap)"
                        className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5DFD5] rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Paragraf Isi / Ketentuan Lanjutan
                  </label>
                  <textarea
                    rows={3}
                    value={isiBadan}
                    onChange={(e) => setIsiBadan(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Paragraf Penutup
                  </label>
                  <textarea
                    rows={2}
                    value={isiPenutup}
                    onChange={(e) => setIsiPenutup(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none"
                  />
                </div>

                {/* Penandatangan Section */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">
                      Pejabat Penandatangan
                    </span>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        onClick={() => handleSignerRoleChange('ketua')}
                        className={`px-2 py-0.5 rounded ${signerRole === 'ketua' ? 'bg-amber-800 text-white font-bold' : 'bg-stone-200'}`}
                      >
                        Ka Kwarran
                      </button>
                      <button
                        onClick={() => handleSignerRoleChange('sekretaris')}
                        className={`px-2 py-0.5 rounded ${signerRole === 'sekretaris' ? 'bg-amber-800 text-white font-bold' : 'bg-stone-200'}`}
                      >
                        Sekretaris
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={penandatanganJabatan}
                    onChange={(e) => setPenandatanganJabatan(e.target.value)}
                    placeholder="Jabatan"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5DFD5] rounded-lg"
                  />
                  <input
                    type="text"
                    value={penandatanganNama}
                    onChange={(e) => setPenandatanganNama(e.target.value)}
                    placeholder="Nama Lengkap Pejabat"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5DFD5] rounded-lg font-bold"
                  />
                  <input
                    type="text"
                    value={penandatanganNta}
                    onChange={(e) => setPenandatanganNta(e.target.value)}
                    placeholder="NTA / Nomor Anggota"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5DFD5] rounded-lg"
                  />
                </div>

                {/* Tembusan Section */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-stone-700">
                    Tembusan Surat ({tembusanList.length})
                  </label>
                  <div className="space-y-1">
                    {tembusanList.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E5DFD5]">
                        <span className="text-stone-400 text-[10px]">{idx + 1}.</span>
                        <span className="flex-1 text-stone-800 truncate">{t}</span>
                        <button
                          onClick={() => setTembusanList(tembusanList.filter((_, i) => i !== idx))}
                          className="text-stone-400 hover:text-red-600 font-bold px-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      value={newTembusanInput}
                      onChange={(e) => setNewTembusanInput(e.target.value)}
                      placeholder="Tambah tembusan (misal: Yth. Danramil...)"
                      className="flex-1 px-2.5 py-1 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTembusanInput.trim()) {
                          setTembusanList([...tembusanList, newTembusanInput.trim()]);
                          setNewTembusanInput('');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newTembusanInput.trim()) {
                          setTembusanList([...tembusanList, newTembusanInput.trim()]);
                          setNewTembusanInput('');
                        }
                      }}
                      className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: LIVE WYSIWYG A4 DOCUMENT PREVIEW (7 Cols) */}
            <div className="lg:col-span-7 bg-[#473b33] p-4 sm:p-8 rounded-2xl shadow-inner flex justify-center overflow-x-auto">
              {/* The Actual A4 Sheet */}
              <div 
                id="printable-surat-keluar"
                className="w-full max-w-[650px] bg-white text-black p-8 sm:p-10 shadow-2xl rounded-sm font-serif min-h-[900px] flex flex-col justify-between"
                style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '11.5pt', lineHeight: 1.4 }}
              >
                {/* Printable Content Body */}
                <div>
                  {/* KOP SURAT RESMI KWARRAN */}
                  <div className="border-b-[3px] border-b-black pb-2 mb-6 text-center relative">
                    {/* Double border line representation */}
                    <div className="absolute -bottom-1.5 left-0 right-0 border-b border-black"></div>

                    <div className="flex items-center justify-between gap-2 mb-1">
                      {/* Left: Tunas Kelapa Logo SVG */}
                      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 100 100" className="w-12 h-12 text-black fill-current">
                          {/* Stylized Tunas Kelapa Siluet */}
                          <path d="M50,10 C52,25 65,30 65,45 C65,58 55,68 50,75 C45,68 35,58 35,45 C35,30 48,25 50,10 Z M50,75 C48,82 45,90 40,95 C45,92 55,92 60,95 C55,90 52,82 50,75 Z" />
                          <circle cx="50" cy="45" r="7" />
                        </svg>
                      </div>

                      {/* Header Text */}
                      <div className="flex-1 text-center font-sans">
                        <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-black m-0 leading-tight">
                          {KWARANTANSA_LETTERHEAD.namaOrganisasi}
                        </h2>
                        <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-black m-0 leading-tight mt-0.5">
                          {KWARANTANSA_LETTERHEAD.kwartir}
                        </h1>
                        <p className="text-[9.5pt] font-medium text-stone-700 m-0 mt-1 leading-snug">
                          {KWARANTANSA_LETTERHEAD.alamat}
                        </p>
                        <p className="text-[9pt] text-stone-600 m-0 leading-snug">
                          {KWARANTANSA_LETTERHEAD.kontak}
                        </p>
                      </div>

                      {/* Right: WOSM / Pandu Dunia Logo SVG */}
                      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 100 100" className="w-12 h-12 text-black fill-current">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" />
                          {/* Stylized Fleur-de-lis */}
                          <path d="M50,18 C53,32 68,36 68,52 C68,62 60,68 50,70 C40,68 32,62 32,52 C32,36 47,32 50,18 Z" />
                          <circle cx="38" cy="52" r="3" />
                          <circle cx="62" cy="52" r="3" />
                          <rect x="47" y="65" width="6" height="15" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Header Meta: Nomor & Tanggal */}
                  <div className="flex justify-between items-start text-xs sm:text-[11pt] mb-5">
                    <table className="w-auto border-none leading-tight">
                      <tbody>
                        <tr>
                          <td className="pr-3 pb-1 w-20 text-stone-700">Nomor</td>
                          <td className="pr-2 pb-1">:</td>
                          <td className="pb-1 font-mono font-bold text-black">{letterNumber}</td>
                        </tr>
                        <tr>
                          <td className="pr-3 pb-1 text-stone-700">Lampiran</td>
                          <td className="pr-2 pb-1">:</td>
                          <td className="pb-1 text-black">{lampiran}</td>
                        </tr>
                        <tr>
                          <td className="pr-3 pb-1 text-stone-700">Perihal</td>
                          <td className="pr-2 pb-1">:</td>
                          <td className="pb-1 font-bold text-black underline">{perihal}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="text-right text-stone-900 font-sans text-xs sm:text-[11pt]">
                      {letterDate}
                    </div>
                  </div>

                  {/* Tujuan Surat */}
                  <div className="mb-5 text-xs sm:text-[11pt] leading-snug">
                    <p className="m-0">Kepada Yth.</p>
                    <p className="m-0 font-bold text-black">{tujuan}</p>
                    <p className="m-0 text-stone-800 whitespace-pre-line">{tempatTujuan}</p>
                  </div>

                  {/* Salam Pembuka */}
                  <p className="font-bold text-xs sm:text-[11pt] mb-3 text-black">
                    {salamPembuka}
                  </p>

                  {/* Paragraf Pembuka */}
                  <p className="text-justify text-xs sm:text-[11pt] leading-relaxed mb-3 indent-8 text-black">
                    {isiPembuka}
                  </p>

                  {/* Detail Acara / Rincian */}
                  {enableDetailKegiatan && (
                    <div className="my-3.5 pl-6 sm:pl-8 text-xs sm:text-[11pt] leading-snug">
                      <table className="w-full border-none">
                        <tbody>
                          {hariTanggal && (
                            <tr>
                              <td className="w-28 sm:w-36 py-0.5 text-stone-700">Hari, Tanggal</td>
                              <td className="w-4 py-0.5">:</td>
                              <td className="py-0.5 font-bold text-black">{hariTanggal}</td>
                            </tr>
                          )}
                          {waktu && (
                            <tr>
                              <td className="py-0.5 text-stone-700">Waktu</td>
                              <td className="py-0.5">:</td>
                              <td className="py-0.5 font-bold text-black">{waktu}</td>
                            </tr>
                          )}
                          {tempat && (
                            <tr>
                              <td className="py-0.5 text-stone-700">Tempat</td>
                              <td className="py-0.5">:</td>
                              <td className="py-0.5 text-black">{tempat}</td>
                            </tr>
                          )}
                          {acara && (
                            <tr>
                              <td className="py-0.5 text-stone-700 align-top">Acara / Agenda</td>
                              <td className="py-0.5 align-top">:</td>
                              <td className="py-0.5 font-bold text-black whitespace-pre-line">{acara}</td>
                            </tr>
                          )}
                          {pakaian && (
                            <tr>
                              <td className="py-0.5 text-stone-700">Pakaian</td>
                              <td className="py-0.5">:</td>
                              <td className="py-0.5 text-black">{pakaian}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Paragraf Isi */}
                  <p className="text-justify text-xs sm:text-[11pt] leading-relaxed mb-3 indent-8 text-black">
                    {isiBadan}
                  </p>

                  {/* Paragraf Penutup */}
                  <p className="text-justify text-xs sm:text-[11pt] leading-relaxed mb-6 indent-8 text-black">
                    {isiPenutup}
                  </p>
                </div>

                {/* Footer Section: Signature & Tembusan */}
                <div>
                  {/* Blok Tanda Tangan (Sebelah Kanan) */}
                  <div className="flex justify-end mb-6">
                    <div className="text-center w-64 sm:w-72 text-xs sm:text-[11pt] leading-snug">
                      <p className="m-0 text-black">Kwartir Ranting Gerakan Pramuka</p>
                      <p className="m-0 text-black">Tanah Sareal Kota Bogor</p>
                      <p className="m-0 font-bold text-black mt-0.5">{penandatanganJabatan},</p>
                      
                      {/* Space for Signature & Stamp */}
                      <div className="h-16 flex items-center justify-center my-1 text-stone-300 italic text-[9pt]">
                        ( Cap Stempel & Tanda Tangan )
                      </div>

                      <p className="m-0 font-bold text-black underline">{penandatanganNama}</p>
                      <p className="m-0 font-mono text-[10pt] text-stone-700">{penandatanganNta}</p>
                    </div>
                  </div>

                  {/* Tembusan (Kiri Bawah) */}
                  {tembusanList.length > 0 && (
                    <div className="text-[9.5pt] border-t border-stone-200 pt-2 text-stone-800 leading-tight">
                      <p className="font-bold underline m-0 mb-1">Tembusan Yth:</p>
                      <ol className="m-0 pl-4 list-decimal space-y-0.5">
                        {tembusanList.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GUIDELINE & STANDARD PRAMUKA LETTER CODING */}
      {activeTab === 'guideline' && (
        <div className="bg-white rounded-2xl p-6 border border-[#E5DFD5] shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
              <Info className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Pedoman Tata Naskah & Kode Klasifikasi Surat Gerakan Pramuka
              </h3>
              <p className="text-xs text-stone-600">
                Sesuai Petunjuk Penyelenggaraan Kwartir Nasional tentang Tata Administrasi Kwartir & Gugus Depan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2">
              <span className="font-bold text-amber-950 block text-sm">
                1. Struktur Penomoran Surat Resmi Kwarran
              </span>
              <p className="text-stone-700 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-stone-200">
                [No. Urut] / 09.02.04 - [Kode Klasifikasi] / [Tahun]
              </p>
              <ul className="list-disc pl-4 space-y-1 text-stone-600">
                <li><strong className="text-stone-800">09</strong>: Kode Kwartir Daerah Jawa Barat</li>
                <li><strong className="text-stone-800">02</strong>: Kode Kwartir Cabang Kota Bogor</li>
                <li><strong className="text-stone-800">04</strong>: Kode Kwartir Ranting Tanah Sareal</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-2">
              <span className="font-bold text-amber-950 block text-sm">
                2. Daftar Kode Klasifikasi Surat
              </span>
              <div className="space-y-1.5 text-stone-700">
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-bold font-mono">A</span>
                  <span><strong>Surat Biasa / Edaran / Undangan:</strong> Komunikasi rutin, undangan rapat, surat edaran kegiatan ke gudep.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-red-100 text-red-900 rounded font-bold font-mono">B</span>
                  <span><strong>Surat Keputusan (SK) & Instruksi:</strong> Ketetapan hukum, pelantikan pengurus, dan instruksi pimpinan.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded font-bold font-mono">C</span>
                  <span><strong>Surat Tugas / Mandat:</strong> Penugasan personel, tim penilai, juri, kontingen utusan kwartir.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold font-mono">D</span>
                  <span><strong>Surat Pengantar & Rekomendasi:</strong> Rekomendasi perkemahan gudep, pengantar berkas ke kwarcab.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
