import React, { useState, useMemo } from 'react';
import { 
  ArchiveDocument, 
  ArchiveCategory, 
  Gudep,
  GDriveStorageSettings,
  GDriveFolderTarget
} from '../types';
import { exportArchivesCsv } from '../utils/storage';
import { 
  FolderArchive, 
  FileText, 
  FileSpreadsheet, 
  Cloud, 
  CloudCheck, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Eye, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Sparkles, 
  Calendar, 
  Tag, 
  Building2, 
  FileCheck, 
  Share2, 
  Copy, 
  X,
  RefreshCw,
  HardDrive,
  Settings
} from 'lucide-react';

interface DigitalArchiveManagerProps {
  archives: ArchiveDocument[];
  gudepList: Gudep[];
  onSaveArchive: (doc: ArchiveDocument) => void;
  onDeleteArchive: (id: string) => void;
  gdriveSettings: GDriveStorageSettings;
  onOpenGDriveSettings: () => void;
  onSelectActiveDrive: (driveId: string) => void;
}

export const DigitalArchiveManager: React.FC<DigitalArchiveManagerProps> = ({
  archives,
  gudepList,
  onSaveArchive,
  onDeleteArchive,
  gdriveSettings,
  onOpenGDriveSettings,
  onSelectActiveDrive
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccess, setSelectedAccess] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ArchiveDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ArchiveDocument | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncedToast, setCloudSyncedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const [formNumber, setFormNumber] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ArchiveCategory>('Surat Keputusan (SK)');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formIssuer, setFormIssuer] = useState('Kwartir Ranting Tanah Sareal');
  const [formGudep, setFormGudep] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formFileType, setFormFileType] = useState<'PDF' | 'Spreadsheet' | 'DOCX' | 'Google Docs'>('PDF');
  const [formFileSize, setFormFileSize] = useState('2.5 MB');
  const [formCloudUrl, setFormCloudUrl] = useState('');
  const [formSpreadsheetId, setFormSpreadsheetId] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formAccess, setFormAccess] = useState<'Publik / Gudep' | 'Pengurus Harian' | 'Rahasia / Terbatas'>('Pengurus Harian');
  const [formUploader, setFormUploader] = useState('Sekretaris Kwarran');

  // Active Google Drive Target
  const activeDrive = useMemo(() => {
    return gdriveSettings.drives.find(d => d.id === gdriveSettings.activeDriveId) || gdriveSettings.drives[0];
  }, [gdriveSettings]);

  const [formTargetDriveId, setFormTargetDriveId] = useState<string>(gdriveSettings.activeDriveId);

  // Statistics
  const stats = useMemo(() => {
    const total = archives.length;
    const skCount = archives.filter(a => a.kategori === 'Surat Keputusan (SK)').length;
    const regCount = archives.filter(a => a.kategori === 'Data Registrasi').length;
    const akrCount = archives.filter(a => a.kategori === 'Akreditasi Gudep').length;
    const cloudSyncCount = archives.filter(a => a.statusArsip === 'Tersimpan di Cloud' || a.statusArsip === 'Tersinkronisasi Spreadsheet').length;

    return { total, skCount, regCount, akrCount, cloudSyncCount };
  }, [archives]);

  // Unique Years for Filter
  const availableYears = useMemo(() => {
    const years = Array.from(new Set<number>(archives.map(a => Number(a.tahun)))).sort((a, b) => b - a);
    return years;
  }, [archives]);

  // Filtered List
  const filteredArchives = useMemo(() => {
    return archives.filter(doc => {
      const matchSearch = 
        doc.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.nomorDokumen.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.ringkasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.pangkalanTerkait && doc.pangkalanTerkait.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'all' || doc.kategori === selectedCategory;
      const matchAccess = selectedAccess === 'all' || doc.aksesLevel === selectedAccess;
      const matchYear = selectedYear === 'all' || doc.tahun.toString() === selectedYear;

      return matchSearch && matchCategory && matchAccess && matchYear;
    });
  }, [archives, searchQuery, selectedCategory, selectedAccess, selectedYear]);

  // Open Edit
  const handleEdit = (doc: ArchiveDocument) => {
    setEditingDoc(doc);
    setFormNumber(doc.nomorDokumen);
    setFormTitle(doc.judul);
    setFormCategory(doc.kategori);
    setFormDate(doc.tanggalTerbit);
    setFormIssuer(doc.instansiPenerbit);
    setFormGudep(doc.pangkalanTerkait || '');
    setFormSummary(doc.ringkasan);
    setFormFileType(doc.fileType);
    setFormFileSize(doc.fileSize);
    setFormCloudUrl(doc.cloudStorageUrl);
    setFormSpreadsheetId(doc.spreadsheetId || '');
    setFormTags(doc.tags.join(', '));
    setFormAccess(doc.aksesLevel);
    setFormUploader(doc.diunggahOleh);
    setFormTargetDriveId(doc.targetDriveId || gdriveSettings.activeDriveId);
    setIsFormOpen(true);
  };

  // Open Create
  const handleOpenCreate = () => {
    setEditingDoc(null);
    const randNum = Math.floor(10 + Math.random() * 90);
    setFormNumber(`${randNum}/09.02.04/SK/${new Date().getFullYear()}`);
    setFormTitle('');
    setFormCategory('Surat Keputusan (SK)');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormIssuer('Kwartir Ranting Tanah Sareal');
    setFormGudep('');
    setFormSummary('');
    setFormFileType('PDF');
    setFormFileSize('2.4 MB');
    setFormTargetDriveId(gdriveSettings.activeDriveId);
    setFormCloudUrl(activeDrive ? activeDrive.folderUrl : 'https://drive.google.com/drive/folders/kwarran-tanahsareal');
    setFormSpreadsheetId(activeDrive?.sheetsUrl || '');
    setFormTags('SK, Administrasi, Kwarran');
    setFormAccess('Pengurus Harian');
    setFormUploader('Sekretaris Kwarran');
    setIsFormOpen(true);
  };

  // Change selected drive in form
  const handleDriveSelectionChange = (newDriveId: string) => {
    setFormTargetDriveId(newDriveId);
    const selected = gdriveSettings.drives.find(d => d.id === newDriveId);
    if (selected) {
      setFormCloudUrl(selected.folderUrl);
      if (selected.sheetsUrl && formFileType === 'Spreadsheet') {
        setFormSpreadsheetId(selected.sheetsUrl);
      }
    }
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formNumber.trim()) {
      alert('Nomor dokumen dan judul dokumen wajib diisi.');
      return;
    }

    const year = parseInt(formDate.slice(0, 4), 10) || new Date().getFullYear();
    const tagArray = formTags.split(',').map(t => t.trim()).filter(Boolean);
    const selectedDrive = gdriveSettings.drives.find(d => d.id === formTargetDriveId) || activeDrive;

    const docToSave: ArchiveDocument = {
      id: editingDoc ? editingDoc.id : `arch-${Date.now()}`,
      nomorDokumen: formNumber,
      judul: formTitle,
      kategori: formCategory,
      tanggalTerbit: formDate,
      tahun: year,
      instansiPenerbit: formIssuer,
      pangkalanTerkait: formGudep.trim() || undefined,
      ringkasan: formSummary,
      fileType: formFileType,
      fileSize: formFileSize,
      cloudStorageUrl: formCloudUrl || (selectedDrive ? selectedDrive.folderUrl : 'https://drive.google.com/drive/folders/kwarran-tanahsareal'),
      targetDriveId: selectedDrive?.id,
      targetDriveName: selectedDrive?.name,
      spreadsheetId: formSpreadsheetId.trim() || undefined,
      tags: tagArray.length > 0 ? tagArray : ['Arsip Resmi'],
      statusArsip: formFileType === 'Spreadsheet' ? 'Tersinkronisasi Spreadsheet' : 'Tersimpan di Cloud',
      aksesLevel: formAccess,
      diunggahOleh: formUploader,
      terakhirDiperbarui: new Date().toISOString().slice(0, 10)
    };

    onSaveArchive(docToSave);
    setIsFormOpen(false);
  };

  // Handle Cloud Sync Trigger
  const handleCloudSync = () => {
    setIsSyncingCloud(true);
    setTimeout(() => {
      setIsSyncingCloud(false);
      setCloudSyncedToast(true);
      setTimeout(() => setCloudSyncedToast(false), 3000);
    }, 1200);
  };

  // Copy Cloud Link
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#24140D] text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#3C2216] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
              <FolderArchive className="w-3.5 h-3.5" />
              PUSAT DOKUMENTASI & ARSIP DIGITAL KWARRAN
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
              Digitalisasi Arsip & Repositori Cloud Terpusat
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Penyimpanan berbasis cloud dan spreadsheet terpusat untuk Surat Keputusan (SK), Rekapitulasi Data Registrasi Gugus Depan, Berkas Borang Akreditasi, dan Dokumen Musran yang mudah diakses oleh Pengurus Harian Kwarran Tanah Sareal.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              onClick={onOpenGDriveSettings}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#331B10] hover:bg-[#442416] text-amber-300 border border-amber-500/40 transition-all flex items-center gap-2 shadow-sm"
              title="Pilih dan atur akun Google Drive penyimpanan arsip"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Pilih Google Drive ({activeDrive?.name || 'Drive Utama'})</span>
            </button>

            <button
              onClick={handleCloudSync}
              disabled={isSyncingCloud}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#331B10] hover:bg-[#442416] text-stone-200 border border-[#4E2818] transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>{isSyncingCloud ? 'Menyinkronkan...' : 'Sinkron Cloud & Drive'}</span>
            </button>

            <button
              onClick={() => exportArchivesCsv(archives)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#331B10] hover:bg-[#442416] text-stone-200 border border-[#4E2818] transition-all flex items-center gap-2"
              title="Unduh Rekap Arsip (.CSV)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md transition-all flex items-center gap-2 border border-amber-400"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah / Tambah Dokumen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Sync Toast Notification */}
      {cloudSyncedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-900/90 text-emerald-100 border border-emerald-500/40 text-xs flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Repositori Cloud Google Drive & Spreadsheet Kwarran Tanah Sareal berhasil disinkronkan.</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-300">Live Updated</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Dokumen</span>
            <FolderArchive className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 font-mono">{stats.total}</span>
            <span className="text-[10px] text-stone-500">Arsip Resmi</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Surat Keputusan (SK)</span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 font-mono">{stats.skCount}</span>
            <span className="text-[10px] text-amber-700 font-medium">SK Sah</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Data & Spreadsheet</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 font-mono">{stats.regCount}</span>
            <span className="text-[10px] text-emerald-700 font-medium">Buku Induk</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Arsip Akreditasi</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 font-mono">{stats.akrCount}</span>
            <span className="text-[10px] text-blue-700 font-medium">Borang & Nilai</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Integrasi Cloud</span>
            <CloudCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">100%</span>
            <span className="text-[10px] text-emerald-600 font-medium">Tersimpan Aman</span>
          </div>
        </div>
      </div>

      {/* Cloud Storage & Live Spreadsheet Quick Access Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#24140D] text-amber-400 flex-shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-stone-900">
                Pusat Penyimpanan Google Drive & Spreadsheet Kwarran
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                Drive Aktif: {activeDrive?.name || 'Google Drive Kwarran'}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Folder Utama: <code className="text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded font-mono text-[11px] border border-amber-200">{activeDrive?.folderName || 'Arsip Resmi Kwarran'}</code> • Akun: <span className="font-mono text-stone-700 font-semibold">{activeDrive?.accountEmail || 'kwarrantanahsareal@gmail.com'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenGDriveSettings}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl transition-all shadow-sm border border-amber-400"
            title="Ganti atau tambahkan pilihan Google Drive penyimpanan"
          >
            <HardDrive className="w-4 h-4" />
            <span>Pilih / Ganti Drive</span>
          </button>

          <a
            href={activeDrive?.sheetsUrl || "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-stone-50 text-stone-800 border border-[#E5DFD5] rounded-xl transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Buka Google Sheets</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>

          <a
            href={activeDrive?.folderUrl || "https://drive.google.com/drive/folders/kwarran-tanahsareal"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#24140D] hover:bg-[#341C11] text-amber-300 border border-amber-600/30 rounded-xl transition-colors shadow-sm"
          >
            <Cloud className="w-4 h-4 text-amber-400" />
            <span>Buka Google Drive Aktif</span>
            <ExternalLink className="w-3 h-3 text-amber-400" />
          </a>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor SK, judul dokumen, pangkalan, kata kunci tag (contoh: KTA, Akreditasi, SMPN 5)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Access & Year Filter Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl px-2.5 py-1.5">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none"
              >
                <option value="all">Semua Akses</option>
                <option value="Publik / Gudep">Publik / Gudep</option>
                <option value="Pengurus Harian">Pengurus Harian</option>
                <option value="Rahasia / Terbatas">Rahasia / Terbatas</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none"
              >
                <option value="all">Semua Tahun</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr.toString()}>{yr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-t border-[#E5DFD5] pt-3">
          <span className="text-stone-400 font-semibold flex items-center gap-1 mr-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Kategori:
          </span>
          {[
            { id: 'all', label: 'Semua Kategori' },
            { id: 'Surat Keputusan (SK)', label: 'Surat Keputusan (SK)' },
            { id: 'Data Registrasi', label: 'Data Registrasi' },
            { id: 'Akreditasi Gudep', label: 'Akreditasi Gudep' },
            { id: 'Musran & Rakor', label: 'Musran & Rakor' },
            { id: 'Edaran & Petunjuk', label: 'Edaran & Petunjuk' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-800 text-white font-bold shadow-sm'
                  : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-100 border border-[#E5DFD5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Archives Document Cards Grid */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Daftar Arsip Digital ({filteredArchives.length} Dokumen Ditemukan)
          </span>
          <span className="text-xs text-stone-500">
            Menampilkan dokumen resmi terverifikasi Kwarran
          </span>
        </div>

        {filteredArchives.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#E5DFD5] space-y-3">
            <FolderArchive className="w-10 h-10 text-stone-300 mx-auto" />
            <h4 className="text-sm font-bold text-stone-800">
              Tidak ada arsip dokumen yang sesuai dengan kriteria pencarian
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Coba gunakan kata kunci lain, pilih kategori berbeda, atau klik tombol &ldquo;Unggah / Tambah Dokumen&rdquo; untuk menambahkan arsip baru.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedAccess('all');
                setSelectedYear('all');
              }}
              className="px-4 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArchives.map((doc) => {
              const isSK = doc.kategori === 'Surat Keputusan (SK)';
              const isReg = doc.kategori === 'Data Registrasi';
              const isAkr = doc.kategori === 'Akreditasi Gudep';

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-[#E5DFD5] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Card Badges Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isSK
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : isReg
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : isAkr
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : 'bg-stone-100 text-stone-800 border-stone-200'
                          }`}
                        >
                          {doc.kategori}
                        </span>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF8F5] text-stone-600 border border-[#E5DFD5] flex items-center gap-1">
                          {doc.fileType === 'Spreadsheet' ? (
                            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <FileText className="w-3 h-3 text-amber-700" />
                          )}
                          {doc.fileType} • {doc.fileSize}
                        </span>

                        {doc.targetDriveName && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-900 border border-amber-500/30 flex items-center gap-1" title={`Tersimpan di ${doc.targetDriveName}`}>
                            <HardDrive className="w-3 h-3 text-amber-600" />
                            <span>{doc.targetDriveName}</span>
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          doc.aksesLevel === 'Publik / Gudep'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : doc.aksesLevel === 'Pengurus Harian'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {doc.aksesLevel === 'Publik / Gudep' ? (
                          <Globe className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        {doc.aksesLevel}
                      </span>
                    </div>

                    {/* Document Number & Title */}
                    <div>
                      <div className="text-[11px] font-mono text-amber-800 font-bold tracking-tight">
                        No: {doc.nomorDokumen}
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 mt-1 line-clamp-2 leading-snug">
                        {doc.judul}
                      </h3>
                    </div>

                    {/* Summary Excerpt */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {doc.ringkasan}
                    </p>

                    {/* Related Gudep / Issuer Info */}
                    <div className="space-y-1 text-[11px] text-stone-500 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E5DFD5]">
                      <div className="flex items-center justify-between">
                        <span>Penerbit: <strong className="text-stone-800">{doc.instansiPenerbit}</strong></span>
                        <span>Tahun: <strong className="text-stone-800 font-mono">{doc.tahun}</strong></span>
                      </div>
                      {doc.pangkalanTerkait && (
                        <div className="flex items-center gap-1 text-amber-900 font-medium truncate">
                          <Building2 className="w-3 h-3 flex-shrink-0 text-amber-700" />
                          <span className="truncate">Pangkalan: {doc.pangkalanTerkait}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-[#E5DFD5]/60">
                        <span>Oleh: {doc.diunggahOleh}</span>
                        <span>Update: {doc.terakhirDiperbarui}</span>
                      </div>
                    </div>

                    {/* Tags Pills */}
                    <div className="flex flex-wrap items-center gap-1">
                      {doc.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E5DFD5] gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-700" />
                      <span>Lihat Detail</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={doc.cloudStorageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
                        title="Buka File di Cloud Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleEdit(doc)}
                        className="p-1.5 text-stone-600 hover:text-amber-800 bg-stone-100 hover:bg-amber-50 rounded-lg transition-colors border border-stone-200"
                        title="Edit Data Arsip"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus arsip dokumen: "${doc.judul}"?`)) {
                            onDeleteArchive(doc.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 bg-stone-100 hover:bg-rose-50 rounded-lg transition-colors border border-stone-200"
                        title="Hapus Arsip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5] my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#24140D] text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-100">
                    Pratinjau Dokumen Arsip Kwarran
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    {previewDoc.nomorDokumen}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 bg-[#FAF8F5] max-h-[75vh] overflow-y-auto">
              {/* Document Certificate Frame */}
              <div className="p-6 bg-white rounded-2xl border-2 border-[#E5DFD5] shadow-sm space-y-4 relative">
                {/* Official Letterhead Header */}
                <div className="text-center pb-4 border-b-2 border-stone-900/80 space-y-1">
                  <div className="text-[11px] font-bold tracking-widest text-stone-500 uppercase">
                    GERAKAN PRAMUKA KWARTIR RANTING TANAH SAREAL
                  </div>
                  <div className="text-base font-extrabold text-stone-900 uppercase">
                    {previewDoc.kategori}
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-800">
                    Nomor: {previewDoc.nomorDokumen}
                  </div>
                </div>

                {/* Title and Summary */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-base font-bold text-stone-900 leading-snug">
                    {previewDoc.judul}
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5]">
                    {previewDoc.ringkasan}
                  </p>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E5DFD5]">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Instansi Penerbit:</span>
                    <span className="font-semibold text-stone-800">{previewDoc.instansiPenerbit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Tanggal Penetapan:</span>
                    <span className="font-semibold text-stone-800 font-mono">{previewDoc.tanggalTerbit} (Tahun {previewDoc.tahun})</span>
                  </div>
                  {previewDoc.pangkalanTerkait && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-stone-500 block">Gugus Depan / Pangkalan Terkait:</span>
                      <span className="font-semibold text-amber-900">{previewDoc.pangkalanTerkait}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-stone-500 block">Format & Ukuran Berkas:</span>
                    <span className="font-mono text-stone-700">{previewDoc.fileType} ({previewDoc.fileSize})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Status Penyimpanan:</span>
                    <span className="font-semibold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {previewDoc.statusArsip}
                    </span>
                  </div>
                  {previewDoc.targetDriveName && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-stone-500 block">Penyimpanan Google Drive:</span>
                      <span className="font-semibold text-amber-900 flex items-center gap-1.5 font-mono text-xs">
                        <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                        {previewDoc.targetDriveName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Electronic Stamp Signature */}
                <div className="pt-4 flex justify-between items-end border-t border-dashed border-[#E5DFD5]">
                  <div className="text-[10px] text-stone-400 font-mono">
                    Diunggah oleh: {previewDoc.diunggahOleh}<br />
                    Tingkat Akses: {previewDoc.aksesLevel}
                  </div>
                  <div className="text-center">
                    <div className="inline-block p-2 border-2 border-dashed border-amber-600/40 rounded-xl bg-amber-50/50">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900 block">
                        ⚜️ TERSERTIFIKASI DIGITAL
                      </span>
                      <span className="text-[8px] font-mono text-stone-500 block">
                        KWARRAN TANAH SAREAL
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Links & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => handleCopyLink(previewDoc.cloudStorageUrl)}
                  className="px-3 py-2 text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-[#E5DFD5] rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Tautan Disalin!' : 'Salin Tautan Cloud'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={previewDoc.cloudStorageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-bold bg-[#24140D] hover:bg-[#341C11] text-amber-300 border border-amber-600/30 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Berkas di Cloud</span>
                  </a>

                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-xl transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5] my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-[#24140D] text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-100">
                    {editingDoc ? 'Perbarui Data Arsip Digital' : 'Tambah & Unggah Arsip Dokumen Digital'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Penyimpanan Terpusat Cloud & Spreadsheet Kwarran Tanah Sareal
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Nomor Dokumen / SK Resmi: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="Contoh: 04/09.02.04/SK/2026"
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Kategori Dokumen: *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ArchiveCategory)}
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    <option value="Surat Keputusan (SK)">Surat Keputusan (SK)</option>
                    <option value="Data Registrasi">Data Registrasi</option>
                    <option value="Akreditasi Gudep">Akreditasi Gudep</option>
                    <option value="Musran & Rakor">Musran & Rakor</option>
                    <option value="Edaran & Petunjuk">Edaran & Petunjuk</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Judul Dokumen Lengkap: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: SK Penetapan Nomor Gugus Depan Se-Kecamatan Tanah Sareal Tahun 2026"
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Tanggal Terbit / Penetapan: *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Instansi / Pejabat Penerbit:
                  </label>
                  <input
                    type="text"
                    value={formIssuer}
                    onChange={(e) => setFormIssuer(e.target.value)}
                    placeholder="Kwartir Ranting Tanah Sareal"
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Pangkalan Gudep Terkait (Opsional):
                  </label>
                  <select
                    value={formGudep}
                    onChange={(e) => setFormGudep(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    <option value="">-- Seluruh Kwarran / Umum --</option>
                    {gudepList.map(g => (
                      <option key={g.id} value={`${g.namaPangkalan} (${g.noGudepPa})`}>
                        {g.namaPangkalan} ({g.noGudepPa} - {g.noGudepPi})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Format & Ukuran Berkas:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={formFileType}
                      onChange={(e) => setFormFileType(e.target.value as any)}
                      className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="Spreadsheet">Spreadsheet (XLSX/Sheets)</option>
                      <option value="DOCX">Word DOCX</option>
                      <option value="Google Docs">Google Docs</option>
                    </select>
                    <input
                      type="text"
                      value={formFileSize}
                      onChange={(e) => setFormFileSize(e.target.value)}
                      placeholder="Contoh: 3.2 MB"
                      className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono text-center"
                    />
                  </div>
                </div>

                {/* Google Drive Selection Box */}
                <div className="sm:col-span-2 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-amber-600" />
                      <span>Penyimpanan Google Drive Tujuan: *</span>
                    </label>
                    <button
                      type="button"
                      onClick={onOpenGDriveSettings}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Kelola / Tambah Drive</span>
                    </button>
                  </div>

                  <select
                    value={formTargetDriveId}
                    onChange={(e) => handleDriveSelectionChange(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none font-semibold text-stone-900 shadow-sm"
                  >
                    {gdriveSettings.drives.map(drive => (
                      <option key={drive.id} value={drive.id}>
                        {drive.name} ({drive.accountEmail}) — Folder: {drive.folderName} {drive.id === gdriveSettings.activeDriveId ? '★ [Drive Utama]' : ''}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1">
                    <span>Folder: <strong className="font-mono text-stone-800">{gdriveSettings.drives.find(d => d.id === formTargetDriveId)?.folderName || activeDrive?.folderName}</strong></span>
                    <span>Tipe: <strong className="text-amber-800">{gdriveSettings.drives.find(d => d.id === formTargetDriveId)?.driveType || 'Pribadi'}</strong></span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Tautan Cloud Storage (Google Drive / Cloud Folder):
                  </label>
                  <div className="relative flex items-center">
                    <Cloud className="w-4 h-4 text-amber-600 absolute left-3" />
                    <input
                      type="url"
                      value={formCloudUrl}
                      onChange={(e) => setFormCloudUrl(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/kwarran-tanahsareal-..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Ringkasan Isi Pokok Dokumen:
                  </label>
                  <textarea
                    rows={3}
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="Tuliskan uraian singkat peruntukan surat, jumlah pangkalan/pembina yang diatur, dan pokok ketetapan..."
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Kata Kunci / Tags (Pisahkan koma):
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="SK, Pembina, KTA, 2026"
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Tingkat Aksesibilitas:
                  </label>
                  <select
                    value={formAccess}
                    onChange={(e) => setFormAccess(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:ring-2 focus:ring-amber-700/20 focus:outline-none"
                  >
                    <option value="Publik / Gudep">Publik / Gugus Depan Terbuka</option>
                    <option value="Pengurus Harian">Khusus Pengurus Harian Kwarran</option>
                    <option value="Rahasia / Terbatas">Rahasia / Terbatas Kwarcab</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md transition-colors border border-amber-400"
                >
                  {editingDoc ? 'Simpan Perubahan' : 'Simpan ke Arsip Cloud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
