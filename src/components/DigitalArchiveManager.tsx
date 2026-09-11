import React, { useState, useMemo } from 'react';
import { 
  ArchiveDocument, 
  ArchiveCategory, 
  ArchiveType,
  Gudep,
  Member,
  GDriveStorageSettings,
  SifatSurat,
  StatusDisposisi,
  KlasifikasiSuratKeluar
} from '../types';
import { exportArchivesCsv } from '../utils/storage';
import { SuratKeluarTemplateManager } from './SuratKeluarTemplateManager';
import { BuatSuratKeluarModal } from './BuatSuratKeluarModal';
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
  Sparkles, 
  Calendar, 
  Tag, 
  Building2, 
  FileCheck, 
  Copy, 
  X,
  RefreshCw,
  HardDrive,
  Settings,
  Inbox,
  Send,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  AlertCircle,
  FileCode,
  Printer
} from 'lucide-react';

interface DigitalArchiveManagerProps {
  archives: ArchiveDocument[];
  gudepList: Gudep[];
  members?: Member[];
  onSaveArchive: (doc: ArchiveDocument) => void;
  onDeleteArchive: (id: string) => void;
  gdriveSettings: GDriveStorageSettings;
  onOpenGDriveSettings: () => void;
  onSelectActiveDrive: (driveId: string) => void;
}

// Helper to determine Archive Type with backward compatibility
export const getDocArchiveType = (doc: ArchiveDocument): ArchiveType => {
  if (doc.tipeArsip) return doc.tipeArsip;
  if (doc.kategori === 'Surat Masuk Kwarran' || doc.suratMasuk) return 'surat_masuk';
  if (doc.kategori === 'Surat Keluar Kwarran' || doc.suratKeluar || doc.kategori === 'Edaran & Petunjuk') return 'surat_keluar';
  return 'arsip_umum';
};

export const DigitalArchiveManager: React.FC<DigitalArchiveManagerProps> = ({
  archives,
  gudepList,
  members = [],
  onSaveArchive,
  onDeleteArchive,
  gdriveSettings,
  onOpenGDriveSettings,
  onSelectActiveDrive
}) => {
  // Main Navigation Type Tabs (surat_masuk | surat_keluar | arsip_umum | template_menu)
  const [activeMainType, setActiveMainType] = useState<ArchiveType | 'template_menu'>('surat_masuk');
  const [isBuatSuratKeluarOpen, setIsBuatSuratKeluarOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<string>('all');
  const [selectedDisposisiFilter, setSelectedDisposisiFilter] = useState<string>('all');
  const [selectedKlasifikasiFilter, setSelectedKlasifikasiFilter] = useState<string>('all');
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
  const [formTipeArsip, setFormTipeArsip] = useState<ArchiveType>('surat_masuk');
  const [formNumber, setFormNumber] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ArchiveCategory>('Surat Masuk Kwarran');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formIssuer, setFormIssuer] = useState('Kwartir Ranting Tanah Sareal');
  const [formGudep, setFormGudep] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formFileType, setFormFileType] = useState<'PDF' | 'Spreadsheet' | 'DOCX' | 'Google Docs'>('PDF');
  const [formFileSize, setFormFileSize] = useState('1.5 MB');
  const [formCloudUrl, setFormCloudUrl] = useState('');
  const [formSpreadsheetId, setFormSpreadsheetId] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formAccess, setFormAccess] = useState<'Publik / Gudep' | 'Pengurus Harian' | 'Rahasia / Terbatas'>('Pengurus Harian');
  const [formUploader, setFormUploader] = useState('Sekretaris Kwarran');
  const [formTargetDriveId, setFormTargetDriveId] = useState<string>(gdriveSettings.activeDriveId);

  // Form Specific: Surat Masuk
  const [formSmNomorAsal, setFormSmNomorAsal] = useState('');
  const [formSmPengirim, setFormSmPengirim] = useState('');
  const [formSmTanggalSurat, setFormSmTanggalSurat] = useState(new Date().toISOString().slice(0, 10));
  const [formSmTanggalDiterima, setFormSmTanggalDiterima] = useState(new Date().toISOString().slice(0, 10));
  const [formSmSifat, setFormSmSifat] = useState<SifatSurat>('Biasa');
  const [formSmDisposisiTujuan, setFormSmDisposisiTujuan] = useState('Ka Kwarran Tanah Sareal');
  const [formSmDisposisiCatatan, setFormSmDisposisiCatatan] = useState('');
  const [formSmStatusDisposisi, setFormSmStatusDisposisi] = useState<StatusDisposisi>('Menunggu Disposisi');

  // Form Specific: Surat Keluar
  const [formSkKlasifikasi, setFormSkKlasifikasi] = useState<KlasifikasiSuratKeluar>('A');
  const [formSkTujuan, setFormSkTujuan] = useState('');
  const [formSkLampiran, setFormSkLampiran] = useState('1 Berkas');
  const [formSkPenandatanganNama, setFormSkPenandatanganNama] = useState('Kak Drs. H. Mulyadi, M.Pd');
  const [formSkPenandatanganJabatan, setFormSkPenandatanganJabatan] = useState('Ketua Kwartir Ranting Tanah Sareal');
  const [formSkPenandatanganNta, setFormSkPenandatanganNta] = useState('09.02.04.001.0001');
  const [formSkTembusan, setFormSkTembusan] = useState('Ketua Kwarcab Kota Bogor, Camat Tanah Sareal, Arsip');

  // Active Google Drive Target
  const activeDrive = useMemo(() => {
    return gdriveSettings.drives.find(d => d.id === gdriveSettings.activeDriveId) || gdriveSettings.drives[0];
  }, [gdriveSettings]);

  // Statistics per Category
  const stats = useMemo(() => {
    const total = archives.length;
    const suratMasukList = archives.filter(a => getDocArchiveType(a) === 'surat_masuk');
    const suratKeluarList = archives.filter(a => getDocArchiveType(a) === 'surat_keluar');
    const arsipUmumList = archives.filter(a => getDocArchiveType(a) === 'arsip_umum');

    const smNeedDisposisi = suratMasukList.filter(a => a.suratMasuk?.statusDisposisi === 'Menunggu Disposisi').length;
    const skTerbitCount = suratKeluarList.length;

    return {
      total,
      suratMasukCount: suratMasukList.length,
      smNeedDisposisi,
      suratKeluarCount: suratKeluarList.length,
      skTerbitCount,
      arsipUmumCount: arsipUmumList.length
    };
  }, [archives]);

  // Available Years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set<number>(archives.map(a => Number(a.tahun)))).sort((a, b) => b - a);
    return years;
  }, [archives]);

  // Filtered Archives for the current main view
  const currentCategoryArchives = useMemo(() => {
    if (activeMainType === 'template_menu') return [];
    return archives.filter(a => getDocArchiveType(a) === activeMainType);
  }, [archives, activeMainType]);

  const filteredArchives = useMemo(() => {
    return currentCategoryArchives.filter(doc => {
      const matchSearch = 
        doc.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.nomorDokumen.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.ringkasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.pangkalanTerkait && doc.pangkalanTerkait.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.suratMasuk?.pengirimAsal && doc.suratMasuk.pengirimAsal.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.suratKeluar?.tujuanPenerima && doc.suratKeluar.tujuanPenerima.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchAccess = selectedAccess === 'all' || doc.aksesLevel === selectedAccess;
      const matchYear = selectedYear === 'all' || doc.tahun.toString() === selectedYear;

      // Type-specific filters
      if (activeMainType === 'surat_masuk') {
        const matchUrgency = selectedUrgencyFilter === 'all' || doc.suratMasuk?.sifatSurat === selectedUrgencyFilter;
        const matchDisposisi = selectedDisposisiFilter === 'all' || doc.suratMasuk?.statusDisposisi === selectedDisposisiFilter;
        return matchSearch && matchAccess && matchYear && matchUrgency && matchDisposisi;
      }

      if (activeMainType === 'surat_keluar') {
        const matchKlasifikasi = selectedKlasifikasiFilter === 'all' || doc.suratKeluar?.kodeKlasifikasi === selectedKlasifikasiFilter;
        return matchSearch && matchAccess && matchYear && matchKlasifikasi;
      }

      if (activeMainType === 'arsip_umum') {
        const matchSubCat = selectedSubCategory === 'all' || doc.kategori === selectedSubCategory;
        return matchSearch && matchAccess && matchYear && matchSubCat;
      }

      return matchSearch && matchAccess && matchYear;
    });
  }, [
    currentCategoryArchives, 
    searchQuery, 
    selectedAccess, 
    selectedYear, 
    activeMainType, 
    selectedUrgencyFilter, 
    selectedDisposisiFilter, 
    selectedKlasifikasiFilter, 
    selectedSubCategory
  ]);

  // Open Edit
  const handleEdit = (doc: ArchiveDocument) => {
    setEditingDoc(doc);
    const determinedType = getDocArchiveType(doc);
    setFormTipeArsip(determinedType);
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

    // Populate Surat Masuk specific
    if (doc.suratMasuk) {
      setFormSmNomorAsal(doc.suratMasuk.nomorSuratAsal || doc.nomorDokumen);
      setFormSmPengirim(doc.suratMasuk.pengirimAsal || doc.instansiPenerbit);
      setFormSmTanggalSurat(doc.suratMasuk.tanggalSurat || doc.tanggalTerbit);
      setFormSmTanggalDiterima(doc.suratMasuk.tanggalDiterima || doc.tanggalTerbit);
      setFormSmSifat(doc.suratMasuk.sifatSurat || 'Biasa');
      setFormSmDisposisiTujuan(doc.suratMasuk.disposisiTujuan || '');
      setFormSmDisposisiCatatan(doc.suratMasuk.disposisiCatatan || '');
      setFormSmStatusDisposisi(doc.suratMasuk.statusDisposisi || 'Sudah Didisposisikan');
    } else {
      setFormSmNomorAsal(doc.nomorDokumen);
      setFormSmPengirim(doc.instansiPenerbit);
      setFormSmTanggalSurat(doc.tanggalTerbit);
      setFormSmTanggalDiterima(doc.tanggalTerbit);
      setFormSmSifat('Biasa');
      setFormSmDisposisiTujuan('');
      setFormSmDisposisiCatatan('');
      setFormSmStatusDisposisi('Sudah Didisposisikan');
    }

    // Populate Surat Keluar specific
    if (doc.suratKeluar) {
      setFormSkKlasifikasi(doc.suratKeluar.kodeKlasifikasi || 'A');
      setFormSkTujuan(doc.suratKeluar.tujuanPenerima || '');
      setFormSkLampiran(doc.suratKeluar.lampiran || '1 Berkas');
      setFormSkPenandatanganNama(doc.suratKeluar.penandatanganNama || 'Kak Drs. H. Mulyadi, M.Pd');
      setFormSkPenandatanganJabatan(doc.suratKeluar.penandatanganJabatan || 'Ketua Kwartir Ranting Tanah Sareal');
      setFormSkPenandatanganNta(doc.suratKeluar.penandatanganNta || '09.02.04.001.0001');
      setFormSkTembusan(doc.suratKeluar.tembusan ? doc.suratKeluar.tembusan.join(', ') : '');
    } else {
      setFormSkKlasifikasi('A');
      setFormSkTujuan('');
      setFormSkLampiran('1 Berkas');
      setFormSkPenandatanganNama('Kak Drs. H. Mulyadi, M.Pd');
      setFormSkPenandatanganJabatan('Ketua Kwartir Ranting Tanah Sareal');
      setFormSkPenandatanganNta('09.02.04.001.0001');
      setFormSkTembusan('Ketua Kwarcab Kota Bogor, Camat Tanah Sareal, Arsip');
    }

    setIsFormOpen(true);
  };

  // Open Create for specific type
  const handleOpenCreateForType = (targetType: ArchiveType) => {
    setEditingDoc(null);
    setFormTipeArsip(targetType);
    const nowYear = new Date().getFullYear();
    const nowIso = new Date().toISOString().slice(0, 10);
    setFormDate(nowIso);
    setFormTargetDriveId(gdriveSettings.activeDriveId);
    setFormCloudUrl(activeDrive ? activeDrive.folderUrl : 'https://drive.google.com/drive/folders/kwarran-tanahsareal');
    setFormSpreadsheetId(activeDrive?.sheetsUrl || '');
    setFormAccess('Pengurus Harian');
    setFormUploader('Sekretaris Kwarran');

    if (targetType === 'surat_masuk') {
      const randNum = Math.floor(100 + Math.random() * 900);
      setFormNumber(`AGD-${randNum}/${nowYear}`);
      setFormSmNomorAsal('');
      setFormSmPengirim('Kwartir Cabang Kota Bogor');
      setFormTitle('');
      setFormCategory('Surat Masuk Kwarran');
      setFormIssuer('Kwartir Cabang Gerakan Pramuka Kota Bogor');
      setFormGudep('');
      setFormSummary('');
      setFormFileType('PDF');
      setFormFileSize('1.8 MB');
      setFormSmTanggalSurat(nowIso);
      setFormSmTanggalDiterima(nowIso);
      setFormSmSifat('Biasa');
      setFormSmDisposisiTujuan('Ka Kwarran & Waka Organisasi');
      setFormSmDisposisiCatatan('');
      setFormSmStatusDisposisi('Menunggu Disposisi');
      setFormTags('Surat Masuk, Agenda, Disposisi');
    } else if (targetType === 'surat_keluar') {
      const existingCount = archives.filter(a => getDocArchiveType(a) === 'surat_keluar').length + 1;
      const pad = existingCount.toString().padStart(3, '0');
      setFormNumber(`${pad}/09.02.04-A/${nowYear}`);
      setFormTitle('');
      setFormCategory('Surat Keluar Kwarran');
      setFormIssuer('Kwartir Ranting Tanah Sareal');
      setFormGudep('');
      setFormSummary('');
      setFormFileType('PDF');
      setFormFileSize('1.2 MB');
      setFormSkKlasifikasi('A');
      setFormSkTujuan('Yth. Ka Mabigus & Pembina Gugus Depan Se-Kecamatan Tanah Sareal');
      setFormSkLampiran('1 (satu) Berkas');
      setFormSkPenandatanganNama('Kak Drs. H. Mulyadi, M.Pd');
      setFormSkPenandatanganJabatan('Ketua Kwartir Ranting Tanah Sareal');
      setFormSkPenandatanganNta('09.02.04.001.0001');
      setFormSkTembusan('Ketua Kwarcab Kota Bogor, Camat Tanah Sareal, Arsip Kwarran');
      setFormTags('Surat Keluar, Resmi, Klasifikasi-A');
    } else {
      const randNum = Math.floor(10 + Math.random() * 90);
      setFormNumber(`${randNum}/09.02.04/SK/${nowYear}`);
      setFormTitle('');
      setFormCategory('Surat Keputusan (SK)');
      setFormIssuer('Kwartir Ranting Tanah Sareal');
      setFormGudep('');
      setFormSummary('');
      setFormFileType('PDF');
      setFormFileSize('2.5 MB');
      setFormTags('SK, Administrasi, Kwarran');
    }

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
      tipeArsip: formTipeArsip,
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
      terakhirDiperbarui: new Date().toISOString().slice(0, 10),
      ...(formTipeArsip === 'surat_masuk' ? {
        suratMasuk: {
          nomorSuratAsal: formSmNomorAsal.trim() || formNumber,
          pengirimAsal: formSmPengirim.trim() || formIssuer,
          tanggalSurat: formSmTanggalSurat,
          tanggalDiterima: formSmTanggalDiterima,
          sifatSurat: formSmSifat,
          disposisiTujuan: formSmDisposisiTujuan.trim() || undefined,
          disposisiCatatan: formSmDisposisiCatatan.trim() || undefined,
          statusDisposisi: formSmStatusDisposisi
        }
      } : {}),
      ...(formTipeArsip === 'surat_keluar' ? {
        suratKeluar: {
          nomorSuratKwarran: formNumber,
          kodeKlasifikasi: formSkKlasifikasi,
          tujuanPenerima: formSkTujuan.trim() || 'Pangkalan Se-Kwarran',
          perihal: formTitle,
          tanggalSurat: formDate,
          lampiran: formSkLampiran,
          penandatanganNama: formSkPenandatanganNama,
          penandatanganJabatan: formSkPenandatanganJabatan,
          penandatanganNta: formSkPenandatanganNta,
          tembusan: formSkTembusan.split(',').map(s => s.trim()).filter(Boolean),
          statusDistribusi: 'Telah Terbit & Didistribusikan'
        }
      } : {})
    };

    onSaveArchive(docToSave);
    setIsFormOpen(false);
  };

  // Cloud Sync
  const handleCloudSync = () => {
    setIsSyncingCloud(true);
    setTimeout(() => {
      setIsSyncingCloud(false);
      setCloudSyncedToast(true);
      setTimeout(() => setCloudSyncedToast(false), 3000);
    }, 1200);
  };

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
              SISTEM ARSIP ELEKTRONIK GERAKAN PRAMUKA TANAH SAREAL
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
              Tata Kelola Arsip Surat & Dokumen Resmi Kwarran
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Repositori digital terstruktur yang membagi tata naskah kwartir menjadi 3 jenis utama: <strong>Surat Masuk</strong> (lengkap dengan lembar disposisi), <strong>Surat Keluar</strong> (didukung <strong>Menu Template Baku A4</strong>), dan <strong>Arsip Umum</strong> (SK, Data Registrasi, Akreditasi Gudep & Musran).
            </p>
          </div>

          {/* Top Global Actions */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              onClick={onOpenGDriveSettings}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#331B10] hover:bg-[#442416] text-amber-300 border border-amber-500/40 transition-all flex items-center gap-2 shadow-sm"
              title="Pilih dan atur akun Google Drive penyimpanan arsip"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Drive: {activeDrive?.name || 'Drive Utama'}</span>
            </button>

            <button
              onClick={handleCloudSync}
              disabled={isSyncingCloud}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#331B10] hover:bg-[#442416] text-stone-200 border border-[#4E2818] transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>{isSyncingCloud ? 'Menyinkronkan...' : 'Sinkron Cloud'}</span>
            </button>

            <button
              onClick={() => exportArchivesCsv(archives)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#331B10] hover:bg-[#442416] text-stone-200 border border-[#4E2818] transition-all flex items-center gap-2"
              title="Unduh Rekap Arsip (.CSV)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* 3 PRIMARY CATEGORY TABS + TEMPLATE MENU BUTTON */}
        <div className="flex items-center gap-2 border-t border-[#3C2216] mt-6 pt-4 overflow-x-auto text-xs font-bold">
          {/* Tab 1: Surat Masuk */}
          <button
            onClick={() => setActiveMainType('surat_masuk')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeMainType === 'surat_masuk'
                ? 'bg-amber-500 text-stone-950 font-extrabold shadow-md'
                : 'text-stone-300 hover:bg-[#341C11] border border-transparent'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>1. SURAT MASUK</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeMainType === 'surat_masuk' ? 'bg-stone-900 text-amber-300' : 'bg-stone-800 text-stone-300'
            }`}>
              {stats.suratMasukCount}
            </span>
          </button>

          {/* Tab 2: Surat Keluar */}
          <button
            onClick={() => setActiveMainType('surat_keluar')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeMainType === 'surat_keluar'
                ? 'bg-amber-500 text-stone-950 font-extrabold shadow-md'
                : 'text-stone-300 hover:bg-[#341C11] border border-transparent'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>2. SURAT KELUAR</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeMainType === 'surat_keluar' ? 'bg-stone-900 text-amber-300' : 'bg-stone-800 text-stone-300'
            }`}>
              {stats.suratKeluarCount}
            </span>
          </button>

          {/* Tab 3: Arsip Umum */}
          <button
            onClick={() => setActiveMainType('arsip_umum')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeMainType === 'arsip_umum'
                ? 'bg-amber-500 text-stone-950 font-extrabold shadow-md'
                : 'text-stone-300 hover:bg-[#341C11] border border-transparent'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>3. ARSIP UMUM (SK & REGISTRASI)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeMainType === 'arsip_umum' ? 'bg-stone-900 text-amber-300' : 'bg-stone-800 text-stone-300'
            }`}>
              {stats.arsipUmumCount}
            </span>
          </button>

          {/* Special Tab: Menu Template Surat Keluar */}
          <button
            onClick={() => setActiveMainType('template_menu')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ml-auto ${
              activeMainType === 'template_menu'
                ? 'bg-amber-400 text-stone-950 font-black ring-2 ring-amber-300'
                : 'bg-[#3A1F13] text-amber-300 hover:bg-[#4E2A1B] border border-amber-600/40 shadow-sm'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>📑 MENU TEMPLATE SURAT KELUAR</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 text-[10px] font-bold">
              8 Template Baku
            </span>
          </button>
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

      {/* VIEW: SPECIAL TEMPLATE MANAGER VIEW */}
      {activeMainType === 'template_menu' ? (
        <SuratKeluarTemplateManager
          onSaveArchive={onSaveArchive}
          onBackToSuratKeluar={() => setActiveMainType('surat_keluar')}
          existingSuratKeluarCount={stats.suratKeluarCount}
        />
      ) : (
        <>
          {/* Statistics Bar for Current Active Type */}
          {activeMainType === 'surat_masuk' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Total Surat Masuk</span>
                  <Inbox className="w-4 h-4 text-amber-700" />
                </div>
                <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
                  {stats.suratMasukCount}
                </div>
                <span className="text-[10px] text-stone-500">Tercatat di Agenda Kwarran</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Menunggu Disposisi</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-amber-800 font-mono">
                  {stats.smNeedDisposisi}
                </div>
                <span className="text-[10px] text-amber-700 font-medium">Perlu Arahan Ka Kwarran</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Instansi Pengirim</span>
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
                  Kwarcab / Disdik / Gudep
                </div>
                <span className="text-[10px] text-blue-700 font-medium">Sumber Resmi Terverifikasi</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Aksi Cepat</span>
                  <Plus className="w-4 h-4 text-emerald-600" />
                </div>
                <button
                  onClick={() => handleOpenCreateForType('surat_masuk')}
                  className="mt-2 w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs shadow-sm transition-all"
                >
                  ➕ Catat Surat Masuk Baru
                </button>
              </div>
            </div>
          )}

          {activeMainType === 'surat_keluar' && (
            <div className="space-y-3.5">
              {/* Special Banner: Template Surat Keluar Shortcut */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#24140D] via-[#351B0F] to-[#24140D] text-white border border-amber-500/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      FITUR UTAMA SURAT KELUAR
                    </span>
                    <span className="text-xs text-amber-300 font-mono">Format Baku Gerakan Pramuka</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-100">
                    Menerbitkan Surat Resmi Kwarran dengan Menu Template
                  </h3>
                  <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
                    Tersedia 8 format template baku: Surat Undangan Rakor, Edaran Hari Pramuka, Surat Tugas Kontingen, Rekomendasi Kegiatan Gudep, Permohonan Izin Tempat, dan Pengantar Kwarcab dengan Kop Surat otomatis format A4.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <button
                    onClick={() => setIsBuatSuratKeluarOpen(true)}
                    className="px-4 py-2.5 bg-[#1e1b4b] hover:bg-indigo-900 text-white font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 border border-indigo-500/50 active:scale-95 ring-2 ring-indigo-500/20"
                  >
                    <Send className="w-4 h-4 text-indigo-300 -rotate-45" />
                    <span>➕ BUAT SURAT KELUAR BARU</span>
                  </button>

                  <button
                    onClick={() => setActiveMainType('template_menu')}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 border border-amber-300 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-stone-950" />
                    <span>BUKA MENU TEMPLATE SURAT KELUAR</span>
                  </button>

                  <button
                    onClick={() => handleOpenCreateForType('surat_keluar')}
                    className="px-3.5 py-2.5 bg-[#331B10] hover:bg-[#442416] text-stone-200 border border-[#4E2818] font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Catat Manual / Unggah File</span>
                  </button>
                </div>
              </div>

              {/* Stats for Surat Keluar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                    <span>Total Surat Keluar</span>
                    <Send className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
                    {stats.suratKeluarCount}
                  </div>
                  <span className="text-[10px] text-stone-500">Nomor Kwarran 09.02.04</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                    <span>Klasifikasi A (Edaran/Undangan)</span>
                    <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">Kode A</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-blue-900 font-mono">
                    {archives.filter(a => a.suratKeluar?.kodeKlasifikasi === 'A').length}
                  </div>
                  <span className="text-[10px] text-blue-700">Komunikasi Rutin Gudep</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                    <span>Klasifikasi C (Tugas/Mandat)</span>
                    <span className="font-mono text-xs font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">Kode C</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-purple-900 font-mono">
                    {archives.filter(a => a.suratKeluar?.kodeKlasifikasi === 'C').length}
                  </div>
                  <span className="text-[10px] text-purple-700">Penugasan Personel</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                  <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                    <span>Klasifikasi D (Rekomendasi)</span>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">Kode D</span>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-emerald-900 font-mono">
                    {archives.filter(a => a.suratKeluar?.kodeKlasifikasi === 'D').length}
                  </div>
                  <span className="text-[10px] text-emerald-700">Izin Kegiatan & Pengantar</span>
                </div>
              </div>
            </div>
          )}

          {activeMainType === 'arsip_umum' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Surat Keputusan (SK)</span>
                  <FileCheck className="w-4 h-4 text-amber-700" />
                </div>
                <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
                  {archives.filter(a => a.kategori === 'Surat Keputusan (SK)').length}
                </div>
                <span className="text-[10px] text-stone-500">Ketetapan Pengurus & Pembina</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Data Registrasi & Sheets</span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono">
                  {archives.filter(a => a.kategori === 'Data Registrasi').length}
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">Buku Induk Potensi</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Akreditasi Gudep & Musran</span>
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-900 font-mono">
                  {archives.filter(a => a.kategori === 'Akreditasi Gudep' || a.kategori === 'Musran & Rakor').length}
                </div>
                <span className="text-[10px] text-blue-700">Portofolio & Ketetapan</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>Tambah Arsip</span>
                  <Plus className="w-4 h-4 text-amber-700" />
                </div>
                <button
                  onClick={() => handleOpenCreateForType('arsip_umum')}
                  className="mt-2 w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs shadow-sm transition-all"
                >
                  ➕ Unggah Dokumen Umum
                </button>
              </div>
            </div>
          )}

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
                  placeholder={`Cari dalam ${activeMainType === 'surat_masuk' ? 'Surat Masuk (pengirim, nomor, perihal)...' : activeMainType === 'surat_keluar' ? 'Surat Keluar (nomor kwarran, tujuan, perihal)...' : 'Arsip Umum (nomor SK, judul, pangkalan)...'}`}
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

              {/* Type-Specific Filter Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {activeMainType === 'surat_masuk' && (
                  <>
                    <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl px-2.5 py-1.5">
                      <span className="text-[11px] font-bold text-stone-500">Sifat:</span>
                      <select
                        value={selectedUrgencyFilter}
                        onChange={(e) => setSelectedUrgencyFilter(e.target.value)}
                        className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none"
                      >
                        <option value="all">Semua Sifat</option>
                        <option value="Biasa">Biasa</option>
                        <option value="Penting">Penting</option>
                        <option value="Segera">Segera</option>
                        <option value="Sangat Rahasia">Sangat Rahasia</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl px-2.5 py-1.5">
                      <span className="text-[11px] font-bold text-stone-500">Disposisi:</span>
                      <select
                        value={selectedDisposisiFilter}
                        onChange={(e) => setSelectedDisposisiFilter(e.target.value)}
                        className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none"
                      >
                        <option value="all">Semua Status</option>
                        <option value="Menunggu Disposisi">Menunggu Disposisi</option>
                        <option value="Sudah Didisposisikan">Sudah Didisposisikan</option>
                        <option value="Selesai Ditindaklanjuti">Selesai Ditindaklanjuti</option>
                      </select>
                    </div>
                  </>
                )}

                {activeMainType === 'surat_keluar' && (
                  <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-bold text-stone-500">Klasifikasi:</span>
                    <select
                      value={selectedKlasifikasiFilter}
                      onChange={(e) => setSelectedKlasifikasiFilter(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none"
                    >
                      <option value="all">Semua Kode (A, B, C, D)</option>
                      <option value="A">Kode A - Biasa / Edaran / Undangan</option>
                      <option value="B">Kode B - SK / Instruksi</option>
                      <option value="C">Kode C - Tugas / Mandat</option>
                      <option value="D">Kode D - Rekomendasi / Pengantar</option>
                    </select>
                  </div>
                )}

                {activeMainType === 'arsip_umum' && (
                  <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl px-2.5 py-1.5">
                    <span className="text-[11px] font-bold text-stone-500">Kategori:</span>
                    <select
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none"
                    >
                      <option value="all">Semua Kategori Umum</option>
                      <option value="Surat Keputusan (SK)">Surat Keputusan (SK)</option>
                      <option value="Data Registrasi">Data Registrasi</option>
                      <option value="Akreditasi Gudep">Akreditasi Gudep</option>
                      <option value="Musran & Rakor">Musran & Rakor</option>
                    </select>
                  </div>
                )}

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
          </div>

          {/* DOCUMENT CARDS LIST */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
                {activeMainType === 'surat_masuk' && <Inbox className="w-4 h-4 text-amber-700" />}
                {activeMainType === 'surat_keluar' && <Send className="w-4 h-4 text-amber-700" />}
                {activeMainType === 'arsip_umum' && <FolderArchive className="w-4 h-4 text-amber-700" />}
                Daftar Dokumen: {activeMainType === 'surat_masuk' ? 'Surat Masuk' : activeMainType === 'surat_keluar' ? 'Surat Keluar' : 'Arsip Umum'} ({filteredArchives.length} Dokumen)
              </span>

              <div className="flex items-center gap-2">
                {activeMainType === 'surat_keluar' && (
                  <button
                    onClick={() => setIsBuatSuratKeluarOpen(true)}
                    className="px-3 py-1.5 bg-[#1e1b4b] hover:bg-indigo-950 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm border border-indigo-700"
                  >
                    <Send className="w-3 h-3 -rotate-45 text-indigo-300" />
                    <span>Buat Surat Keluar Baru</span>
                  </button>
                )}
                <button
                  onClick={() => handleOpenCreateForType(activeMainType as ArchiveType)}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah {activeMainType === 'surat_masuk' ? 'Surat Masuk' : activeMainType === 'surat_keluar' ? 'Surat Keluar' : 'Dokumen Umum'}</span>
                </button>
              </div>
            </div>

            {filteredArchives.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#E5DFD5] space-y-3">
                <FolderArchive className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="text-sm font-bold text-stone-800">
                  Tidak ada dokumen dalam kategori ini yang sesuai filter
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Silakan periksa kata kunci pencarian, reset filter, atau tambahkan dokumen baru.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedUrgencyFilter('all');
                    setSelectedDisposisiFilter('all');
                    setSelectedKlasifikasiFilter('all');
                    setSelectedSubCategory('all');
                    setSelectedYear('all');
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArchives.map((doc) => {
                  const docType = getDocArchiveType(doc);
                  const isSM = docType === 'surat_masuk';
                  const isSK = docType === 'surat_keluar';

                  return (
                    <div
                      key={doc.id}
                      className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Header Badges */}
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isSM ? (
                              <>
                                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
                                  <ArrowDownLeft className="w-3 h-3 text-blue-700" />
                                  Surat Masuk
                                </span>
                                {doc.suratMasuk && (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    doc.suratMasuk.sifatSurat === 'Penting'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : doc.suratMasuk.sifatSurat === 'Segera' || doc.suratMasuk.sifatSurat === 'Sangat Rahasia'
                                      ? 'bg-red-100 text-red-900 border border-red-300'
                                      : 'bg-stone-100 text-stone-700 border border-stone-200'
                                  }`}>
                                    Sifat: {doc.suratMasuk.sifatSurat}
                                  </span>
                                )}
                              </>
                            ) : isSK ? (
                              <>
                                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                                  <ArrowUpRight className="w-3 h-3 text-emerald-700" />
                                  Surat Keluar
                                </span>
                                {doc.suratKeluar && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                                    Klasifikasi: {doc.suratKeluar.kodeKlasifikasi}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono bg-stone-100 text-stone-800 border border-stone-200">
                                {doc.kategori}
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] font-mono text-stone-500 font-medium">
                            {doc.tanggalTerbit}
                          </span>
                        </div>

                        {/* Title & Document Number */}
                        <div>
                          <span className="text-[11px] font-mono font-bold text-amber-800 block">
                            {doc.nomorDokumen}
                          </span>
                          <h3 className="text-sm font-bold text-stone-900 mt-0.5 leading-snug">
                            {doc.judul}
                          </h3>
                        </div>

                        {/* Specific Meta: Surat Masuk or Surat Keluar */}
                        {isSM && doc.suratMasuk && (
                          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-stone-500 font-medium">Pengirim Asal:</span>
                              <span className="font-bold text-stone-900">{doc.suratMasuk.pengirimAsal}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-stone-500 font-medium">Nomor Surat Asal:</span>
                              <span className="font-mono text-stone-800 font-semibold">{doc.suratMasuk.nomorSuratAsal}</span>
                            </div>
                            {doc.suratMasuk.disposisiCatatan && (
                              <div className="pt-1 border-t border-stone-200 text-[11px] text-amber-950">
                                <span className="font-bold block text-amber-900">Arahan Disposisi:</span>
                                <em>&ldquo;{doc.suratMasuk.disposisiCatatan}&rdquo;</em>
                              </div>
                            )}
                            <div className="pt-1 flex items-center justify-between">
                              <span className="text-[10px] text-stone-400">Status Disposisi:</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                doc.suratMasuk.statusDisposisi === 'Menunggu Disposisi'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}>
                                {doc.suratMasuk.statusDisposisi || 'Tercatat'}
                              </span>
                            </div>
                          </div>
                        )}

                        {isSK && doc.suratKeluar && (
                          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-stone-500 font-medium">Tujuan Penerima:</span>
                              <span className="font-bold text-stone-900 truncate max-w-[240px]">{doc.suratKeluar.tujuanPenerima}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-stone-500 font-medium">Penandatangan:</span>
                              <span className="font-semibold text-stone-800">{doc.suratKeluar.penandatanganNama}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-stone-500 font-medium">Status Distribusi:</span>
                              <span className="text-emerald-800 font-semibold text-[11px]">
                                ✓ {doc.suratKeluar.statusDistribusi || 'Telah Terbit'}
                              </span>
                            </div>
                          </div>
                        )}

                        {!isSM && !isSK && (
                          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-stone-500">Penerbit:</span>
                              <span className="font-semibold text-stone-800">{doc.instansiPenerbit}</span>
                            </div>
                            {doc.pangkalanTerkait && (
                              <div className="flex items-center justify-between">
                                <span className="text-stone-500">Pangkalan:</span>
                                <span className="font-semibold text-amber-900">{doc.pangkalanTerkait}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Summary */}
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {doc.ringkasan}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-between gap-2">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-700" />
                          <span>Lihat Pratinjau</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {doc.isiSurat && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(doc.isiSurat || '');
                                alert('Format teks naskah surat dinas disalin ke clipboard!');
                              }}
                              className="p-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
                              title="Salin Naskah Teks Surat"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}

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
                              if (confirm(`Hapus dokumen arsip: "${doc.judul}"?`)) {
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
        </>
      )}

      {/* PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5] my-6">
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

            <div className="p-6 space-y-5 bg-[#FAF8F5] max-h-[75vh] overflow-y-auto">
              <div className="p-6 bg-white rounded-2xl border-2 border-[#E5DFD5] shadow-sm space-y-4">
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

                <div className="space-y-2 pt-2">
                  <h4 className="text-base font-bold text-stone-900 leading-snug">
                    {previewDoc.judul}
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5]">
                    {previewDoc.ringkasan}
                  </p>
                </div>

                {/* Specific Surat Masuk Preview */}
                {previewDoc.suratMasuk && (
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-2 text-xs">
                    <span className="font-bold text-amber-950 block">LEMBAR DISPOSISI SURAT MASUK</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-stone-500">Nomor Surat Asal:</span>
                        <div className="font-mono font-bold text-stone-900">{previewDoc.suratMasuk.nomorSuratAsal}</div>
                      </div>
                      <div>
                        <span className="text-stone-500">Instansi Pengirim:</span>
                        <div className="font-bold text-stone-900">{previewDoc.suratMasuk.pengirimAsal}</div>
                      </div>
                      <div>
                        <span className="text-stone-500">Tanggal Diterima:</span>
                        <div className="font-semibold text-stone-800">{previewDoc.suratMasuk.tanggalDiterima}</div>
                      </div>
                      <div>
                        <span className="text-stone-500">Sifat Surat:</span>
                        <div className="font-bold text-amber-800">{previewDoc.suratMasuk.sifatSurat}</div>
                      </div>
                    </div>
                    {previewDoc.suratMasuk.disposisiCatatan && (
                      <div className="pt-2 border-t border-amber-200">
                        <span className="text-stone-500 block">Instruksi Disposisi Ka Kwarran:</span>
                        <div className="font-medium text-amber-950 mt-0.5 italic">
                          &ldquo;{previewDoc.suratMasuk.disposisiCatatan}&rdquo;
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Specific Surat Keluar Preview */}
                {previewDoc.suratKeluar && (
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-2 text-xs">
                    <span className="font-bold text-emerald-950 block">RINCIAN SURAT KELUAR KWARRAN</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-stone-500">Tujuan Penerima:</span>
                        <div className="font-bold text-stone-900">{previewDoc.suratKeluar.tujuanPenerima}</div>
                      </div>
                      <div>
                        <span className="text-stone-500">Kode Klasifikasi:</span>
                        <div className="font-bold text-emerald-800 font-mono">Kode {previewDoc.suratKeluar.kodeKlasifikasi}</div>
                      </div>
                      <div>
                        <span className="text-stone-500">Penandatangan:</span>
                        <div className="font-semibold text-stone-800">{previewDoc.suratKeluar.penandatanganNama} ({previewDoc.suratKeluar.penandatanganJabatan})</div>
                      </div>
                      <div>
                        <span className="text-stone-500">Tanggal Terbit:</span>
                        <div className="font-semibold text-stone-800">{previewDoc.suratKeluar.tanggalSurat}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E5DFD5]">
                  <div>
                    <span className="text-[10px] text-stone-500 block">Penyimpanan:</span>
                    <span className="font-semibold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {previewDoc.statusArsip}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">Berkas:</span>
                    <span className="font-mono text-stone-700">{previewDoc.fileType} ({previewDoc.fileSize})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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

      {/* CREATE / EDIT FORM MODAL */}
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
                    {editingDoc ? 'Perbarui Data Arsip Dokumen' : `Tambah & Catat ${formTipeArsip === 'surat_masuk' ? 'Surat Masuk' : formTipeArsip === 'surat_keluar' ? 'Surat Keluar' : 'Arsip Umum'}`}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Arsip Elektronik Resmi Kwarran Tanah Sareal Kota Bogor
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
              {/* Type Switcher in Form */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Tipe Dokumen Arsip: *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormTipeArsip('surat_masuk');
                      setFormCategory('Surat Masuk Kwarran');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      formTipeArsip === 'surat_masuk'
                        ? 'bg-blue-800 text-white border-blue-900 shadow-sm'
                        : 'bg-[#FAF8F5] text-stone-700 border-[#E5DFD5]'
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>1. Surat Masuk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTipeArsip('surat_keluar');
                      setFormCategory('Surat Keluar Kwarran');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      formTipeArsip === 'surat_keluar'
                        ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                        : 'bg-[#FAF8F5] text-stone-700 border-[#E5DFD5]'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>2. Surat Keluar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTipeArsip('arsip_umum');
                      setFormCategory('Surat Keputusan (SK)');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      formTipeArsip === 'arsip_umum'
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                        : 'bg-[#FAF8F5] text-stone-700 border-[#E5DFD5]'
                    }`}
                  >
                    <FolderArchive className="w-3.5 h-3.5" />
                    <span>3. Arsip Umum</span>
                  </button>
                </div>
              </div>

              {/* SURAT MASUK SPECIFIC FIELDS */}
              {formTipeArsip === 'surat_masuk' && (
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-3">
                  <span className="text-xs font-bold text-blue-950 block">
                    Data Agenda & Disposisi Surat Masuk
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-800 mb-1">
                        Nomor Surat Asal Pengirim: *
                      </label>
                      <input
                        type="text"
                        required
                        value={formSmNomorAsal}
                        onChange={(e) => setFormSmNomorAsal(e.target.value)}
                        placeholder="Contoh: 112/09.02-A/2026"
                        className="w-full text-xs p-2 bg-white border border-blue-300 rounded-lg font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-800 mb-1">
                        Instansi / Pengirim Asal: *
                      </label>
                      <input
                        type="text"
                        required
                        value={formSmPengirim}
                        onChange={(e) => setFormSmPengirim(e.target.value)}
                        placeholder="Contoh: Kwarcab Kota Bogor / Disdik"
                        className="w-full text-xs p-2 bg-white border border-blue-300 rounded-lg font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-800 mb-1">
                        Tanggal Diterima di Kwarran:
                      </label>
                      <input
                        type="date"
                        value={formSmTanggalDiterima}
                        onChange={(e) => setFormSmTanggalDiterima(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-blue-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-800 mb-1">
                        Sifat Surat:
                      </label>
                      <select
                        value={formSmSifat}
                        onChange={(e) => setFormSmSifat(e.target.value as SifatSurat)}
                        className="w-full text-xs p-2 bg-white border border-blue-300 rounded-lg font-semibold"
                      >
                        <option value="Biasa">Biasa</option>
                        <option value="Penting">Penting</option>
                        <option value="Segera">Segera</option>
                        <option value="Sangat Rahasia">Sangat Rahasia</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-stone-800 mb-1">
                        Disposisi Kepada / Catatan Arahan Pimpinan:
                      </label>
                      <input
                        type="text"
                        value={formSmDisposisiTujuan}
                        onChange={(e) => setFormSmDisposisiTujuan(e.target.value)}
                        placeholder="Kepada: Waka Binamuda / Ancu Penggalang"
                        className="w-full text-xs p-2 bg-white border border-blue-300 rounded-lg mb-1.5"
                      />
                      <textarea
                        rows={2}
                        value={formSmDisposisiCatatan}
                        onChange={(e) => setFormSmDisposisiCatatan(e.target.value)}
                        placeholder="Tuliskan arahan tindak lanjut disposisi (contoh: tindak lanjuti juklak, buat surat edaran ke pangkalan)..."
                        className="w-full text-xs p-2 bg-white border border-blue-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SURAT KELUAR SPECIFIC FIELDS */}
              {formTipeArsip === 'surat_keluar' && (
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950">
                      Rincian Naskah Surat Keluar
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setActiveMainType('template_menu');
                      }}
                      className="text-[11px] text-amber-800 hover:text-amber-900 font-bold underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Gunakan Menu Template Surat
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-800 mb-1">
                        Kode Klasifikasi Surat:
                      </label>
                      <select
                        value={formSkKlasifikasi}
                        onChange={(e) => setFormSkKlasifikasi(e.target.value as KlasifikasiSuratKeluar)}
                        className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg font-bold"
                      >
                        <option value="A">A - Biasa / Edaran / Undangan</option>
                        <option value="B">B - Surat Keputusan / Instruksi</option>
                        <option value="C">C - Surat Tugas / Mandat</option>
                        <option value="D">D - Rekomendasi / Pengantar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-800 mb-1">
                        Tujuan Penerima Surat: *
                      </label>
                      <input
                        type="text"
                        required
                        value={formSkTujuan}
                        onChange={(e) => setFormSkTujuan(e.target.value)}
                        placeholder="Contoh: Ka Mabigus & Pembina Se-Tanah Sareal"
                        className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-800 mb-1">
                        Penandatangan:
                      </label>
                      <input
                        type="text"
                        value={formSkPenandatanganNama}
                        onChange={(e) => setFormSkPenandatanganNama(e.target.value)}
                        placeholder="Kak Drs. H. Mulyadi, M.Pd"
                        className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-800 mb-1">
                        Jabatan Penandatangan:
                      </label>
                      <input
                        type="text"
                        value={formSkPenandatanganJabatan}
                        onChange={(e) => setFormSkPenandatanganJabatan(e.target.value)}
                        placeholder="Ketua Kwartir Ranting Tanah Sareal"
                        className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ARSIP UMUM SPECIFIC FIELDS */}
              {formTipeArsip === 'arsip_umum' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Kategori Dokumen Umum: *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ArchiveCategory)}
                      className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-semibold"
                    >
                      <option value="Surat Keputusan (SK)">Surat Keputusan (SK)</option>
                      <option value="Data Registrasi">Data Registrasi</option>
                      <option value="Akreditasi Gudep">Akreditasi Gudep</option>
                      <option value="Musran & Rakor">Musran & Rakor</option>
                      <option value="Dokumen Umum">Dokumen Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Pangkalan Gudep Terkait (Opsional):
                    </label>
                    <select
                      value={formGudep}
                      onChange={(e) => setFormGudep(e.target.value)}
                      className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl"
                    >
                      <option value="">-- Seluruh Kwarran / Umum --</option>
                      {gudepList.map(g => (
                        <option key={g.id} value={`${g.namaPangkalan} (${g.noGudepPa})`}>
                          {g.namaPangkalan} ({g.noGudepPa} - {g.noGudepPi})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* COMMON FIELDS: NOMOR & JUDUL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5DFD5]">
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
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Tanggal Terbit / Surat: *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Judul Dokumen / Perihal Lengkap: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Edaran Pemutakhiran Registrasi Gudep Semester Ganjil 2026"
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Tautan Cloud Storage (Google Drive):
                  </label>
                  <div className="relative flex items-center">
                    <Cloud className="w-4 h-4 text-amber-600 absolute left-3" />
                    <input
                      type="url"
                      value={formCloudUrl}
                      onChange={(e) => setFormCloudUrl(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/kwarran-tanahsareal-..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Ringkasan Isi Pokok Dokumen:
                  </label>
                  <textarea
                    rows={2}
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="Uraian singkat isi, maksud, dan peruntukan arsip dokumen..."
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl"
                  />
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

      {/* Modal Buat Surat Keluar Baru (Matching User Reference Image) */}
      <BuatSuratKeluarModal
        isOpen={isBuatSuratKeluarOpen}
        onClose={() => setIsBuatSuratKeluarOpen(false)}
        onSaveArchive={onSaveArchive}
        members={members}
        gudepList={gudepList}
        gdriveSettings={gdriveSettings}
      />
    </div>
  );
};
