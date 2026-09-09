import React, { useState } from 'react';
import { 
  GDriveFolderTarget, 
  GDriveStorageSettings, 
  GDriveType 
} from '../types';
import { 
  HardDrive, 
  Cloud, 
  ExternalLink, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  X, 
  Sparkles, 
  ShieldCheck, 
  FileSpreadsheet, 
  FolderCheck,
  AlertCircle,
  Radio,
  Check
} from 'lucide-react';

interface GDriveSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GDriveStorageSettings;
  onUpdateSettings: (newSettings: GDriveStorageSettings) => void;
  onSelectActiveDrive: (driveId: string) => void;
}

export const GDriveSelectorModal: React.FC<GDriveSelectorModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onSelectActiveDrive
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingDriveId, setEditingDriveId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formType, setFormType] = useState<GDriveType>('Google Drive Resmi Kwarran');
  const [formFolderName, setFormFolderName] = useState('');
  const [formFolderUrl, setFormFolderUrl] = useState('');
  const [formSheetsUrl, setFormSheetsUrl] = useState('');
  const [formQuota, setFormQuota] = useState('15 GB (Standar Google)');
  const [formDescription, setFormDescription] = useState('');
  const [formSetAsActive, setFormSetAsActive] = useState(true);

  if (!isOpen) return null;

  const activeDrive = settings.drives.find(d => d.id === settings.activeDriveId) || settings.drives[0];

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSetActive = (drive: GDriveFolderTarget) => {
    onSelectActiveDrive(drive.id);
    setSuccessToast(`Google Drive aktif berhasil dialihkan ke: ${drive.name}`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleStartAdd = () => {
    setEditingDriveId(null);
    setFormName('');
    setFormEmail('kwarran.tanahsareal@gmail.com');
    setFormType('Google Drive Resmi Kwarran');
    setFormFolderName('ARSIP_KWARRAN_TANAH_SAREAL');
    setFormFolderUrl('https://drive.google.com/drive/folders/');
    setFormSheetsUrl('');
    setFormQuota('15 GB (Google Drive)');
    setFormDescription('');
    setFormSetAsActive(true);
    setIsAddingNew(true);
  };

  const handleStartEdit = (drive: GDriveFolderTarget) => {
    setIsAddingNew(false);
    setEditingDriveId(drive.id);
    setFormName(drive.name);
    setFormEmail(drive.accountEmail);
    setFormType(drive.type);
    setFormFolderName(drive.folderName);
    setFormFolderUrl(drive.folderUrl);
    setFormSheetsUrl(drive.sheetsUrl || '');
    setFormQuota(drive.storageQuota || '15 GB');
    setFormDescription(drive.description || '');
    setFormSetAsActive(drive.id === settings.activeDriveId);
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingDriveId(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formFolderUrl.trim() || !formFolderName.trim()) {
      alert('Nama Drive, Nama Folder, dan Tautan Folder Google Drive wajib diisi.');
      return;
    }

    if (editingDriveId) {
      // Update existing
      const updatedDrives = settings.drives.map(d => {
        if (d.id === editingDriveId) {
          return {
            ...d,
            name: formName.trim(),
            accountEmail: formEmail.trim() || 'kwarran.tanahsareal@gmail.com',
            type: formType,
            folderName: formFolderName.trim(),
            folderUrl: formFolderUrl.trim(),
            sheetsUrl: formSheetsUrl.trim() || undefined,
            storageQuota: formQuota.trim() || '15 GB',
            description: formDescription.trim() || undefined,
            terakhirDigunakan: 'Diperbarui baru saja'
          };
        }
        return d;
      });

      const newSettings: GDriveStorageSettings = {
        ...settings,
        activeDriveId: formSetAsActive ? editingDriveId : settings.activeDriveId,
        drives: updatedDrives
      };

      onUpdateSettings(newSettings);
      setEditingDriveId(null);
      setSuccessToast(`Informasi Google Drive "${formName}" berhasil diperbarui.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } else {
      // Add new
      const newId = `gdrive-${Date.now()}`;
      const newDrive: GDriveFolderTarget = {
        id: newId,
        name: formName.trim(),
        accountEmail: formEmail.trim() || 'kwarran.tanahsareal@gmail.com',
        type: formType,
        folderName: formFolderName.trim(),
        folderUrl: formFolderUrl.trim(),
        sheetsUrl: formSheetsUrl.trim() || undefined,
        storageQuota: formQuota.trim() || '15 GB',
        description: formDescription.trim() || undefined,
        isDefault: formSetAsActive,
        terakhirDigunakan: formSetAsActive ? 'Aktif saat ini' : 'Belum digunakan'
      };

      const updatedDrives = formSetAsActive
        ? settings.drives.map(d => ({ ...d, isDefault: false }))
        : [...settings.drives];

      const newSettings: GDriveStorageSettings = {
        ...settings,
        activeDriveId: formSetAsActive ? newId : settings.activeDriveId,
        drives: [newDrive, ...updatedDrives]
      };

      onUpdateSettings(newSettings);
      setIsAddingNew(false);
      setSuccessToast(`Google Drive "${formName}" berhasil ditambahkan dan siap digunakan.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handleDeleteDrive = (driveId: string, driveName: string) => {
    if (settings.drives.length <= 1) {
      alert('Tidak dapat menghapus. Minimal harus ada 1 Google Drive yang terdaftar.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun/folder "${driveName}" dari daftar pilihan Google Drive?`)) {
      const remainingDrives = settings.drives.filter(d => d.id !== driveId);
      const newActiveId = settings.activeDriveId === driveId ? remainingDrives[0].id : settings.activeDriveId;
      
      const newSettings: GDriveStorageSettings = {
        ...settings,
        activeDriveId: newActiveId,
        drives: remainingDrives
      };

      onUpdateSettings(newSettings);
      setSuccessToast(`Google Drive "${driveName}" berhasil dihapus.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handleToggleAutoCategorize = () => {
    const updated: GDriveStorageSettings = {
      ...settings,
      autoSubfolderCategorization: !settings.autoSubfolderCategorization
    };
    onUpdateSettings(updated);
    setSuccessToast(
      updated.autoSubfolderCategorization 
        ? 'Otomatisasi subfolder berdasarkan kategori diaktifkan.' 
        : 'Penyimpanan langsung ke folder utama diaktifkan.'
    );
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#24140D] border border-[#3C2216] text-stone-100 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#3C2216] bg-[#1A0C06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 p-0.5 shadow-lg flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#1A0C06] flex items-center justify-center text-amber-400">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  Pilih & Kelola Google Drive Arsip Cloud
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Cloud Storage
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Tentukan akun atau folder Google Drive tujuan untuk menyimpan seluruh dokumen arsip SISKA-SIKAP Kwarran Tanah Sareal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#341B10] transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-6 py-2.5 text-xs text-emerald-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">{successToast}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Tersimpan</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Active Drive Banner Card */}
          {activeDrive && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1C2C28] to-[#14221F] border-2 border-amber-500/50 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      TEMPAT SIMPAN UTAMA SAAT INI
                    </span>
                    <span className="text-xs text-stone-400">• {activeDrive.type}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span>{activeDrive.name}</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-300">
                    <span className="flex items-center gap-1.5 text-amber-200 font-mono">
                      <FolderCheck className="w-3.5 h-3.5 text-amber-400" />
                      Folder: <strong>{activeDrive.folderName}</strong>
                    </span>
                    <span className="text-stone-500">•</span>
                    <span className="text-stone-300 font-mono">
                      Akun: {activeDrive.accountEmail}
                    </span>
                    {activeDrive.storageQuota && (
                      <>
                        <span className="text-stone-500">•</span>
                        <span className="text-emerald-300 font-mono text-[11px]">
                          Kuota: {activeDrive.storageQuota}
                        </span>
                      </>
                    )}
                  </div>

                  {activeDrive.description && (
                    <p className="text-xs text-stone-300/80 leading-relaxed pt-1">
                      {activeDrive.description}
                    </p>
                  )}
                </div>

                {/* Direct Actions on Active Drive */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <a
                    href={activeDrive.folderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-950/30 transition-all hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka di Google Drive</span>
                  </a>

                  {activeDrive.sheetsUrl && (
                    <a
                      href={activeDrive.sheetsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#233430] hover:bg-[#2D433E] text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
                      title="Buka Google Sheets Buku Induk"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Google Sheets</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleCopyLink(activeDrive.folderUrl, activeDrive.id)}
                    className="p-2.5 rounded-xl bg-[#233430] hover:bg-[#2D433E] text-stone-300 hover:text-white border border-[#344C45] transition-all"
                    title="Salin Tautan Folder Google Drive"
                  >
                    {copiedId === activeDrive.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Setting Preference: Auto-Categorize in Subfolders */}
          <div className="p-4 rounded-2xl bg-[#2E1910] border border-[#442618] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-200">
                  Otomatisasi Subfolder Kategori Dokumen
                </p>
                <p className="text-[11px] text-stone-400">
                  Otomatis mengelompokkan berkas baru ke subfolder khusus (SK, Data Registrasi, Akreditasi, Musran, dan Edaran) di Google Drive yang aktif.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleAutoCategorize}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 flex-shrink-0 ${
                settings.autoSubfolderCategorization
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${settings.autoSubfolderCategorization ? 'bg-amber-400' : 'bg-stone-500'}`} />
              <span>{settings.autoSubfolderCategorization ? 'Aktif Otomatis' : 'Non-Aktif (Satu Folder)'}</span>
            </button>
          </div>

          {/* Section: List of Available Google Drives */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
                  <span>Daftar Pilihan Google Drive Penyimpanan</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#331B10] text-amber-300 border border-[#4E2818]">
                    {settings.drives.length} Pilihan
                  </span>
                </h3>
                <p className="text-[11px] text-stone-400">
                  Klik tombol <strong>"Pilih Drive Ini"</strong> untuk mengubah Google Drive yang dijadikan tempat penyimpanan arsip cloud aktif.
                </p>
              </div>

              {!isAddingNew && !editingDriveId && (
                <button
                  onClick={handleStartAdd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md transition-all border border-amber-400 flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Google Drive</span>
                </button>
              )}
            </div>

            {/* List of Drive Cards */}
            <div className="grid grid-cols-1 gap-3">
              {settings.drives.map((drive) => {
                const isActive = drive.id === settings.activeDriveId;

                return (
                  <div
                    key={drive.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-[#341B10] border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                        : 'bg-[#201109] border-[#3C2216] hover:border-[#4E2818] hover:bg-[#28150D]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left info */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className={`p-2.5 rounded-2xl flex-shrink-0 ${
                          isActive 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-[#331B10] text-stone-400 border border-[#4E2818]'
                        }`}>
                          <HardDrive className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm text-white truncate">
                              {drive.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#341B10] text-stone-300 border border-[#4E2818]">
                              {drive.type}
                            </span>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                                AKTIF DIGUNAKAN
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400 font-mono">
                            <span className="text-amber-300">
                              Folder: <strong>{drive.folderName}</strong>
                            </span>
                            <span>•</span>
                            <span className="text-stone-300">
                              {drive.accountEmail}
                            </span>
                            {drive.storageQuota && (
                              <>
                                <span>•</span>
                                <span className="text-stone-400 text-[11px]">
                                  {drive.storageQuota}
                                </span>
                              </>
                            )}
                          </div>

                          {drive.description && (
                            <p className="text-xs text-stone-400 line-clamp-1 pt-0.5">
                              {drive.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        {isActive ? (
                          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Sedang Aktif</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSetActive(drive)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 border border-amber-400"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>Pilih Drive Ini</span>
                          </button>
                        )}

                        <a
                          href={drive.folderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-[#20302C] hover:bg-[#2B3E39] text-stone-300 hover:text-white border border-[#30443F] transition-colors"
                          title="Buka Folder di Google Drive"
                        >
                          <ExternalLink className="w-4 h-4 text-amber-400" />
                        </a>

                        <button
                          onClick={() => handleStartEdit(drive)}
                          className="p-2 rounded-xl bg-[#20302C] hover:bg-[#2B3E39] text-stone-300 hover:text-white border border-[#30443F] transition-colors"
                          title="Edit Informasi Drive Ini"
                        >
                          <Edit2 className="w-4 h-4 text-stone-300" />
                        </button>

                        {settings.drives.length > 1 && (
                          <button
                            onClick={() => handleDeleteDrive(drive.id, drive.name)}
                            className="p-2 rounded-xl bg-[#20302C] hover:bg-red-950/60 text-stone-400 hover:text-red-300 border border-[#30443F] hover:border-red-500/40 transition-colors"
                            title="Hapus Dari Daftar Pilihan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORM: Tambah / Edit Google Drive */}
          {(isAddingNew || editingDriveId) && (
            <div className="p-5 rounded-2xl bg-[#131D1B] border-2 border-amber-500/40 shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#233430] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                    {editingDriveId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    {editingDriveId ? 'Edit Pengaturan Google Drive' : 'Hubungkan / Tambah Google Drive Baru'}
                  </h4>
                </div>
                <button
                  onClick={handleCancelForm}
                  className="text-stone-400 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-[#22332F]"
                >
                  Batal
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Nama Identitas Google Drive <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contoh: Google Drive Humas Kwarran Tanah Sareal"
                      required
                      className="w-full px-3 py-2 text-xs bg-[#1C2C28] border border-[#2F443F] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Email Akun Google Pemilik
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="kwarran.tanahsareal@gmail.com"
                      className="w-full px-3 py-2 text-xs bg-[#1C2C28] border border-[#2F443F] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Kategori / Tipe Akun Drive
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as GDriveType)}
                      className="w-full px-3 py-2 text-xs bg-[#1C2C28] border border-[#2F443F] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Google Drive Resmi Kwarran">Google Drive Resmi Kwarran</option>
                      <option value="Google Drive Sekretariat">Google Drive Sekretariat</option>
                      <option value="Shared Drive Kwarcab">Shared Drive Kwarcab</option>
                      <option value="Google Workspace Satuan / Sekolah">Google Workspace Satuan / Sekolah</option>
                      <option value="Google Drive Kustom / Pribadi">Google Drive Kustom / Pribadi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Nama Folder Utama di Drive <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formFolderName}
                      onChange={(e) => setFormFolderName(e.target.value)}
                      placeholder="Contoh: ARSIP_RESMI_KWARRAN_TANAH_SAREAL"
                      required
                      className="w-full px-3 py-2 text-xs bg-[#1C2C28] border border-[#2F443F] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-amber-300"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Tautan / URL Folder Google Drive <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={formFolderUrl}
                      onChange={(e) => setFormFolderUrl(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74..."
                      required
                      className="w-full px-3 py-2 text-xs bg-[#1C2C28] border border-[#2F443F] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Pastikan setelan izin akses folder di Google Drive telah diatur ke <em>"Siapa saja yang memiliki link dapat melihat/mengedit"</em> atau dibagikan ke email pengurus.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Tautan Google Sheets Terkait (Opsional)
                    </label>
                    <input
                      type="url"
                      value={formSheetsUrl}
                      onChange={(e) => setFormSheetsUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="w-full px-3 py-2 text-xs bg-[#1C2C28] border border-[#2F443F] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Estimasi Kuota Penyimpanan
                    </label>
                    <input
                      type="text"
                      value={formQuota}
                      onChange={(e) => setFormQuota(e.target.value)}
                      placeholder="Contoh: 15 GB / 30 GB / Unlimited"
                      className="w-full px-3 py-2 text-xs bg-[#1C2C28] border border-[#2F443F] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Deskripsi Penggunaan Folder
                    </label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Contoh: Digunakan untuk backup berkas SK dan formulir pendaftaran kegiatan cabang"
                      className="w-full px-3 py-2 text-xs bg-[#1C2C28] border border-[#2F443F] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                    <input
                      type="checkbox"
                      checked={formSetAsActive}
                      onChange={(e) => setFormSetAsActive(e.target.checked)}
                      className="rounded bg-[#1C2C28] border-[#2F443F] text-amber-500 focus:ring-amber-400"
                    />
                    <span>Jadikan Google Drive ini sebagai tempat simpan arsip utama yang aktif sekarang</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-[#20302C] hover:bg-[#2A3F3A]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md transition-all border border-amber-400"
                    >
                      {editingDriveId ? 'Simpan Perubahan' : 'Tambah & Simpan'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Guide & Best Practice Card */}
          <div className="p-4 rounded-2xl bg-[#121B19] border border-[#202E2B] text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Petunjuk Standar Tata Kelola Arsip Google Drive Kwarran:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-stone-400 text-[11px] leading-relaxed">
              <li>Pilih <strong>Google Drive Resmi Kwarran</strong> sebagai repositori primer untuk menjaga kesinambungan antar periode kepengurusan.</li>
              <li>Pilih <strong>Shared Drive Kwarcab</strong> jika berkas perlu langsung ditinjau oleh tim verifikator Kwartir Cabang Kota Bogor.</li>
              <li>Tautan folder yang dipilih akan otomatis menjadi rute utama saat mengunggah SK, berkas Akreditasi Gudep, atau mengekspor buku induk.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#253733] bg-[#121C1A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Drive Aktif: <strong className="text-amber-300">{activeDrive?.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md transition-all border border-amber-400"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
