import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  X, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Building2, 
  Award,
  CheckCircle2,
  Sparkles,
  Cloud,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ExternalLink,
  Palette,
  Sun,
  Maximize2,
  Sliders,
  Eye,
  Layers,
  Upload,
  RefreshCw,
  Search,
  Users,
  Check,
  Unlink,
  Link2,
  Filter,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AuthUser, UserRole, SecretariatContact, HeroBackgroundConfig, DEFAULT_HERO_BACKGROUND, Member } from '../types';
import { getCustomPengurusList, saveCustomPengurusList, resetCustomPengurusList, PengurusAccountItem, INITIAL_PRESET_ACCOUNTS } from '../utils/auth';
import { compressImageFile, normalizeImageUrl, checkImageUrlCanLoad } from '../utils/imageCompressor';
import { 
  loadSecretariatContact, 
  saveSecretariatContact, 
  DEFAULT_SECRETARIAT_CONTACT,
  loadHeroBackgroundConfig,
  saveHeroBackgroundConfig,
  loadMemberList
} from '../utils/storage';
import { 
  subscribeToPengurus, 
  savePengurusToCloud, 
  syncAllPengurusToCloud,
  deletePengurusFromCloud,
  subscribeToSecretariatContact,
  saveSecretariatContactToCloud,
  subscribeToHeroBackground,
  saveHeroBackgroundToCloud
} from '../services/realtimeDb';
import { PRESET_HERO_LOGOS } from './HeroBackgroundSettingsModal';
import { CredentialsSettingsTab } from './CredentialsSettingsTab';

interface PengurusSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onUpdateCurrentUser: (user: AuthUser) => void;
  initialSection?: 'pengurus' | 'credentials' | 'kontak' | 'background';
  members?: Member[];
  selectedMemberToAssign?: Member | null;
  onClearSelectedMemberToAssign?: () => void;
  onPengurusListUpdated?: (newList: PengurusAccountItem[]) => void;
  secretariatContact?: SecretariatContact;
  onUpdateSecretariatContact?: (contact: SecretariatContact) => void;
  heroBgConfig?: HeroBackgroundConfig;
  onUpdateHeroBgConfig?: (config: HeroBackgroundConfig) => void;
  onOpenLogin?: () => void;
}

export const PengurusSettingsModal: React.FC<PengurusSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateCurrentUser,
  initialSection = 'credentials',
  members: propMembers,
  selectedMemberToAssign,
  onClearSelectedMemberToAssign,
  onPengurusListUpdated,
  secretariatContact: initialSecretariatContact,
  onUpdateSecretariatContact,
  heroBgConfig: initialHeroBgConfig,
  onUpdateHeroBgConfig,
  onOpenLogin
}) => {
  const [activeSection, setActiveSection] = useState<'pengurus' | 'credentials' | 'kontak' | 'background'>(initialSection || 'credentials');
  const [pengurusList, setPengurusList] = useState<PengurusAccountItem[]>([]);
  const [editingItem, setEditingItem] = useState<PengurusAccountItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Member Integration State
  const allMembers: Member[] = (propMembers && propMembers.length > 0) ? propMembers : loadMemberList();
  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
  const [memberPickerTarget, setMemberPickerTarget] = useState<'editing' | 'assign_role' | 'assign_new' | null>(null);
  const [memberPickerRoleTarget, setMemberPickerRoleTarget] = useState<PengurusAccountItem | null>(null);
  const [memberSearchText, setMemberSearchText] = useState('');
  const [memberFilterCategory, setMemberFilterCategory] = useState<'ALL' | 'PEMBINA' | 'PELATIH' | 'DEWASA' | 'MUDA'>('ALL');

  // Secretariat Contact State
  const [contactForm, setContactForm] = useState<SecretariatContact>(
    initialSecretariatContact || loadSecretariatContact()
  );

  // Hero Background Config State
  const [bgConfig, setBgConfig] = useState<HeroBackgroundConfig>(
    initialHeroBgConfig || loadHeroBackgroundConfig()
  );
  const [customBgUrlInput, setCustomBgUrlInput] = useState('');
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  // Helper to find linked member
  const getLinkedMember = (item: PengurusAccountItem | null): Member | undefined => {
    if (!item) return undefined;
    if (item.memberId) {
      const found = allMembers.find(m => m.id === item.memberId);
      if (found) return found;
    }
    if (item.nta) {
      const found = allMembers.find(m => m.nta && m.nta.trim() === item.nta?.trim());
      if (found) return found;
    }
    const cleanItemName = item.name.toLowerCase().replace(/kak|\.|,/g, '').trim();
    return allMembers.find(m => m.namaLengkap.toLowerCase().replace(/kak|\.|,/g, '').trim() === cleanItemName);
  };

  const editingLinkedMember = getLinkedMember(editingItem);

  // Unlink member
  const handleUnlinkMember = () => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      memberId: undefined
    });
    setSaveSuccessMsg('Tautan data anggota telah dilepas.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Select member handler
  const handleSelectMember = (member: Member) => {
    if (memberPickerRoleTarget) {
      // Direct assignment into a specific existing role
      const targetRole = memberPickerRoleTarget;
      const updatedItem: PengurusAccountItem = {
        ...targetRole,
        name: member.namaLengkap,
        nta: member.nta,
        memberId: member.id,
        pangkalanId: member.gudepId,
        namaPangkalan: member.namaPangkalan,
        kelurahan: member.kelurahan,
        avatarEmoji: member.jenisKelamin === 'P' ? '👩‍💼' : '👨‍💼',
      };
      setEditingItem(updatedItem);
      setIsAddingNew(false);
      setMemberPickerRoleTarget(null);
      setMemberPickerTarget(null);
      setIsMemberPickerOpen(false);
      setSaveSuccessMsg(`Data Kak ${member.namaLengkap} siap disimpan sebagai ${targetRole.roleTitle}.`);
      return;
    }

    if (memberPickerTarget === 'assign_new' || !editingItem) {
      // Create new pengurus item pre-filled with this member
      const cleanUsername = `${member.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}.${Date.now().toString().slice(-4)}`;
      const newItem: PengurusAccountItem = {
        id: `user-${Date.now()}`,
        username: cleanUsername,
        pin: '123456',
        name: member.namaLengkap,
        role: 'anran_organisasi',
        roleTitle: 'Andalan Ranting Organisasi',
        jabatan: `Andalan Ranting Kwarran (${member.namaPangkalan})`,
        nta: member.nta,
        memberId: member.id,
        pangkalanId: member.gudepId,
        namaPangkalan: member.namaPangkalan,
        kelurahan: member.kelurahan,
        email: `${member.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '')}@pramukajabar.or.id`,
        avatarEmoji: member.jenisKelamin === 'P' ? '👩‍💼' : '👨‍💼',
        description: `Pengurus Kwarran Tanah Sareal terintegrasi dengan basis data anggota ${member.namaPangkalan}`,
        permissions: {
          canEditGudep: true,
          canEditMembers: true,
          canManageKta: true,
          canManageArchives: true,
          canManageSemesterReports: true,
          canAccessAi: true
        }
      };
      setEditingItem(newItem);
      setIsAddingNew(true);
      setMemberPickerTarget(null);
      setIsMemberPickerOpen(false);
      setSaveSuccessMsg(`Data Kak ${member.namaLengkap} berhasil dimuat ke formulir pengurus baru.`);
      return;
    }

    // Currently editing an existing item
    setEditingItem(prev => {
      if (!prev) return null;
      return {
        ...prev,
        name: member.namaLengkap,
        nta: member.nta,
        memberId: member.id,
        pangkalanId: member.gudepId,
        namaPangkalan: member.namaPangkalan,
        kelurahan: member.kelurahan,
        avatarEmoji: member.jenisKelamin === 'P' ? '👩‍💼' : '👨‍💼',
        email: prev.email || `${member.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '')}@pramukajabar.or.id`
      };
    });
    setMemberPickerTarget(null);
    setIsMemberPickerOpen(false);
    setSaveSuccessMsg(`Data terintegrasi dengan Kak ${member.namaLengkap} (NTA: ${member.nta}) dari ${member.namaPangkalan}!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Filtered members for the picker
  const filteredPickerMembers = allMembers.filter(m => {
    const q = memberSearchText.toLowerCase().trim();
    const matchSearch = !q || 
      m.namaLengkap.toLowerCase().includes(q) ||
      m.nta.toLowerCase().includes(q) ||
      m.nik.toLowerCase().includes(q) ||
      m.namaPangkalan.toLowerCase().includes(q) ||
      m.kelurahan.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (memberFilterCategory === 'PEMBINA') {
      return m.golongan === 'Pembina';
    }
    if (memberFilterCategory === 'PELATIH') {
      return m.golongan === 'Pelatih' || m.kualifikasiKursus === 'KPD' || m.kualifikasiKursus === 'KPL';
    }
    if (memberFilterCategory === 'DEWASA') {
      return m.golongan === 'Pembina' || m.golongan === 'Pelatih' || m.golongan === 'Andalan' || m.golongan === 'Mabigus';
    }
    if (memberFilterCategory === 'MUDA') {
      return m.golongan === 'Penegak' || m.golongan === 'Pandega' || m.golongan === 'Penggalang';
    }
    return true;
  });

  useEffect(() => {
    if (isOpen) {
      setPengurusList(getCustomPengurusList());
      setContactForm(initialSecretariatContact || loadSecretariatContact());
      setBgConfig(initialHeroBgConfig || loadHeroBackgroundConfig());
      setEditingItem(null);
      setIsAddingNew(false);
      setSaveSuccessMsg('');

      // Subscribe to realtime pengurus updates
      const unsubPengurus = subscribeToPengurus((cloudList) => {
        if (cloudList && cloudList.length > 0) {
          setPengurusList(cloudList);
          saveCustomPengurusList(cloudList);
        }
      });

      // Subscribe to realtime secretariat contact updates
      const unsubSecretariat = subscribeToSecretariatContact((cloudContact) => {
        if (cloudContact) {
          setContactForm(cloudContact);
          saveSecretariatContact(cloudContact);
          if (onUpdateSecretariatContact) {
            onUpdateSecretariatContact(cloudContact);
          }
        }
      });

      // Subscribe to realtime hero background updates
      const unsubHeroBg = subscribeToHeroBackground((cloudBg) => {
        if (cloudBg) {
          setBgConfig(cloudBg);
          saveHeroBackgroundConfig(cloudBg);
          if (onUpdateHeroBgConfig) {
            onUpdateHeroBgConfig(cloudBg);
          }
        }
      });

      return () => {
        if (unsubPengurus) unsubPengurus();
        if (unsubSecretariat) unsubSecretariat();
        if (unsubHeroBg) unsubHeroBg();
      };
    }
  }, [isOpen, initialSection]);

  useEffect(() => {
    if (isOpen && initialSection) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  const handleEdit = (item: PengurusAccountItem) => {
    setEditingItem({ ...item });
    setIsAddingNew(false);
    setSaveSuccessMsg('');
  };

  const handleAddNew = () => {
    const newItem: PengurusAccountItem = {
      id: `user-${Date.now()}`,
      username: `pengurus.${Date.now().toString().slice(-4)}`,
      pin: '123456',
      name: 'Kak Nama Pengurus Baru, S.Pd.',
      role: 'anran_organisasi',
      roleTitle: 'Andalan Ranting Organisasi',
      jabatan: 'Andalan Ranting Kwarran Tanah Sareal',
      nta: '09.02.04.001.0099',
      email: 'pengurus.tanahsareal@gmail.com',
      avatarEmoji: '⚜️',
      description: 'Pengurus Kwarran Tanah Sareal',
      permissions: {
        canEditGudep: true,
        canEditMembers: true,
        canManageKta: true,
        canManageArchives: true,
        canManageSemesterReports: true,
        canAccessAi: true
      }
    };
    setEditingItem(newItem);
    setIsAddingNew(true);
    setSaveSuccessMsg('');
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updated: PengurusAccountItem[];
    if (isAddingNew) {
      updated = [...pengurusList, editingItem];
    } else {
      updated = pengurusList.map(p => p.id === editingItem.id ? editingItem : p);
    }

    setPengurusList(updated);
    saveCustomPengurusList(updated);
    if (onPengurusListUpdated) {
      onPengurusListUpdated(updated);
    }

    // Save to Cloud Firestore Realtime DB
    try {
      await savePengurusToCloud(editingItem);
    } catch (err) {
      console.warn('Realtime cloud sync error:', err);
    }

    // If the currently logged-in user is the one being edited, update their active session too
    if (currentUser && currentUser.id === editingItem.id) {
      const { pin, description, ...activeUser } = editingItem;
      onUpdateCurrentUser(activeUser);
    }

    setEditingItem(null);
    setIsAddingNew(false);
    setSaveSuccessMsg('Data pengurus berhasil diperbarui dan tersinkronisasi ke seluruh perangkat!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (pengurusList.length <= 1) {
      alert('Minimal harus ada 1 akun pengurus dalam sistem.');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus data pengurus "${name}"?`)) {
      const updated = pengurusList.filter(p => p.id !== id);
      setPengurusList(updated);
      saveCustomPengurusList(updated);
      if (onPengurusListUpdated) {
        onPengurusListUpdated(updated);
      }

      try {
        await deletePengurusFromCloud(id);
      } catch (err) {
        console.warn('Realtime cloud delete error:', err);
      }

      if (editingItem?.id === id) {
        setEditingItem(null);
      }
      setSaveSuccessMsg(`Data pengurus "${name}" telah dihapus.`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Kembalikan seluruh susunan nama pengurus ke standar Kwarran Tanah Sareal?')) {
      const def = resetCustomPengurusList();
      setPengurusList(def);
      if (onPengurusListUpdated) {
        onPengurusListUpdated(def);
      }
      setEditingItem(null);
      setIsAddingNew(false);

      for (const item of def) {
        try {
          await savePengurusToCloud(item);
        } catch (e) {}
      }

      setSaveSuccessMsg('Daftar pengurus berhasil dikembalikan ke standar awal.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    }
  };

  const handleSyncAllPengurusToCloud = async () => {
    setIsSyncingAll(true);
    try {
      await syncAllPengurusToCloud(pengurusList);
      if (onPengurusListUpdated) {
        onPengurusListUpdated(pengurusList);
      }
      setSaveSuccessMsg('Semua nama pengurus berhasil disinkronkan ke Cloud Firestore. Nama Ketua Kwarran langsung terupdate di seluruh HP anggota!');
      setTimeout(() => setSaveSuccessMsg(''), 4500);
    } catch (err) {
      console.error(err);
      alert('Gagal menyinkronkan data pengurus ke Cloud.');
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Secretariat Contact Handlers
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSecretariatContact(contactForm);
    if (onUpdateSecretariatContact) {
      onUpdateSecretariatContact(contactForm);
    }

    try {
      await saveSecretariatContactToCloud(contactForm);
    } catch (err) {
      console.warn('Error syncing secretariat contact to cloud:', err);
    }

    setSaveSuccessMsg('Nomor WhatsApp & Informasi Kontak Sekretariat berhasil disimpan dan langsung aktif di Portal Publik!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleResetContact = async () => {
    if (window.confirm('Kembalikan informasi kontak & nomor WhatsApp sekretariat ke pengaturan standar?')) {
      setContactForm(DEFAULT_SECRETARIAT_CONTACT);
      saveSecretariatContact(DEFAULT_SECRETARIAT_CONTACT);
      if (onUpdateSecretariatContact) {
        onUpdateSecretariatContact(DEFAULT_SECRETARIAT_CONTACT);
      }
      try {
        await saveSecretariatContactToCloud(DEFAULT_SECRETARIAT_CONTACT);
      } catch (err) {}

      setSaveSuccessMsg('Kontak sekretariat dikembalikan ke nomor standar.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    }
  };

  // Hero Background Handlers
  const handleSaveBackground = async (e: React.FormEvent) => {
    e.preventDefault();
    let configToSave = { ...bgConfig };

    if (customBgUrlInput.trim()) {
      const normalized = normalizeImageUrl(customBgUrlInput.trim());
      configToSave = {
        ...configToSave,
        logoUrl: normalized,
        logoTitle: normalized.startsWith('/logo-kwarran') ? 'Logo Resmi Kwarran 0917-06' : 'Logo Kustom URL'
      };
      setBgConfig(configToSave);
      setCustomBgUrlInput('');
    }

    saveHeroBackgroundConfig(configToSave);
    if (onUpdateHeroBgConfig) {
      onUpdateHeroBgConfig(configToSave);
    }
    try {
      await saveHeroBackgroundToCloud(configToSave);
    } catch (err) {
      console.warn('Hero background cloud save error:', err);
    }
    setSaveSuccessMsg('Pengaturan background & logo watermark hero Kwarran berhasil disimpan!');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleResetBackground = async () => {
    if (window.confirm('Kembalikan background hero ke logo resmi Kwarran Tanah Sareal standar?')) {
      setBgConfig(DEFAULT_HERO_BACKGROUND);
      saveHeroBackgroundConfig(DEFAULT_HERO_BACKGROUND);
      if (onUpdateHeroBgConfig) {
        onUpdateHeroBgConfig(DEFAULT_HERO_BACKGROUND);
      }
      try {
        await saveHeroBackgroundToCloud(DEFAULT_HERO_BACKGROUND);
      } catch (err) {}
      setSaveSuccessMsg('Background hero dikembalikan ke standar resmi Kwarran.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    }
  };

  const cleanDigits = (contactForm.noWa || '081287654321').replace(/\D/g, '');
  const waNumberIntl = cleanDigits.startsWith('0') ? `62${cleanDigits.slice(1)}` : cleanDigits.startsWith('62') ? cleanDigits : `62${cleanDigits}`;
  const testWaUrl = `https://wa.me/${waNumberIntl}?text=${encodeURIComponent(contactForm.pesanWaDefault || 'Halo Sekretariat Kwarran Tanah Sareal')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E5DFD5] my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#172522] text-white border-b border-[#2C3E3A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white font-sans flex items-center gap-2">
                <span>Pengaturan Akun, Pengurus & Kontak Sekretariat</span>
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-mono">
                  SISKA-SIKAP
                </span>
              </h3>
              <p className="text-xs text-stone-300 font-normal">
                Kelola username dan kata sandi/PIN login, susunan nama pengurus, serta nomor WhatsApp sekretariat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-[#23332F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-[#20312D] border-b border-[#2B403B] overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveSection('credentials'); setEditingItem(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'credentials'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-[#182623] text-stone-300 hover:text-white hover:bg-[#283C37]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>🔐 Username & Password</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSection('pengurus'); setEditingItem(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'pengurus'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-[#182623] text-stone-300 hover:text-white hover:bg-[#283C37]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>👥 Susunan Nama Pengurus</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSection('kontak'); setEditingItem(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'kontak'
                ? 'bg-emerald-500 text-stone-950 shadow-md'
                : 'bg-[#182623] text-stone-300 hover:text-white hover:bg-[#283C37]'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>📞 Kontak & WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSection('background'); setEditingItem(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'background'
                ? 'bg-amber-400 text-stone-950 shadow-md'
                : 'bg-[#182623] text-stone-300 hover:text-white hover:bg-[#283C37]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>🎨 Background & Logo</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF8F5]">
          {saveSuccessMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* TAB 0: KREDENSIAL LOGIN (USERNAME & PASSWORD) */}
          {activeSection === 'credentials' && (
            <CredentialsSettingsTab
              currentUser={currentUser}
              onUpdateCurrentUser={onUpdateCurrentUser}
              pengurusList={pengurusList}
              onPengurusListUpdated={(newList) => {
                setPengurusList(newList);
                saveCustomPengurusList(newList);
                if (onPengurusListUpdated) onPengurusListUpdated(newList);
              }}
              onShowSuccess={(msg) => {
                setSaveSuccessMsg(msg);
                setTimeout(() => setSaveSuccessMsg(''), 4000);
              }}
              onOpenLogin={onOpenLogin}
            />
          )}

          {/* TAB 1: SUSUNAN PENGURUS */}
          {activeSection === 'pengurus' && (
            <div>
              {editingItem ? (
            /* Form Edit / Tambah */
            <form onSubmit={handleSaveItem} className="bg-white rounded-2xl p-6 border border-[#E5DFD5] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{editingItem.avatarEmoji || '⚜️'}</span>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">
                      {isAddingNew ? 'Tambah Akun / Nama Pengurus Baru' : `Edit Nama: ${editingItem.name}`}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-mono">ID: {editingItem.id}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="text-xs text-stone-500 hover:text-stone-800 font-semibold underline"
                >
                  Kembali ke Daftar
                </button>
              </div>

              {/* Box Integrasi Menu Profil & Anggota */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-2 border-amber-300 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-amber-500 text-stone-950 rounded-xl shadow-sm">
                      <Users className="w-4 h-4" />
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-stone-900 flex items-center gap-2">
                        <span>Pilih Dari Menu Profil & Anggota</span>
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-950 rounded text-[10px] font-extrabold">
                          Terintegrasi
                        </span>
                      </h5>
                      <p className="text-[11px] text-stone-600">
                        Ambil data langsung dari basis data anggota ({allMembers.length} terdaftar) agar NTA, Gudep, dan foto sinkron.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMemberPickerTarget('editing');
                      setIsMemberPickerOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all flex-shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{editingLinkedMember ? 'Ganti Anggota Lain' : 'Cari & Pilih dari Anggota'}</span>
                  </button>
                </div>

                {/* Status Tautan Anggota */}
                {editingLinkedMember ? (
                  <div className="p-3 bg-white rounded-xl border border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                        <img
                          src={editingLinkedMember.fotoUrl}
                          alt={editingLinkedMember.namaLengkap}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300';
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">{editingLinkedMember.namaLengkap}</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded-md flex items-center gap-1 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Profil Terhubung
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-600 font-medium">
                          NTA: <span className="font-mono font-bold text-stone-800">{editingLinkedMember.nta}</span> • {editingLinkedMember.namaPangkalan} ({editingLinkedMember.golongan} - {editingLinkedMember.tingkatan})
                        </div>
                        {editingLinkedMember.kualifikasiKursus && editingLinkedMember.kualifikasiKursus !== 'Belum' && (
                          <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                            Kualifikasi Mahir: Kursus {editingLinkedMember.kualifikasiKursus}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleUnlinkMember}
                      className="px-2.5 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg text-xs font-semibold self-end sm:self-center transition-colors flex items-center gap-1"
                      title="Lepas tautan data anggota"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Lepas Tautan</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-white/80 rounded-xl border border-dashed border-amber-300 text-stone-600 text-xs flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">
                      ℹ️ Belum terhubung dengan anggota tertentu. Sangat disarankan memilih dari menu Profil & Anggota agar seluruh sistem terpadu.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMemberPickerTarget('editing');
                        setIsMemberPickerOpen(true);
                      }}
                      className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex-shrink-0 ml-2"
                    >
                      Pilih Sekarang &rarr;
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-800 mb-1">
                    Nama Lengkap & Gelar Pengurus <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CFC5] rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Contoh: Kak Drs. H. Suryadi, M.Pd."
                  />
                  <p className="text-[10px] text-stone-500 mt-1">Nama ini akan tampil di seluruh dashboard, lembar laporan semester, dan KTA.</p>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Jabatan Struktural <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.jabatan}
                    onChange={e => setEditingItem({ ...editingItem, jabatan: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CFC5] rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Contoh: Ketua Kwarran Gerakan Pramuka Tanah Sareal"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Label Peran / Role Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.roleTitle}
                    onChange={e => setEditingItem({ ...editingItem, roleTitle: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CFC5] rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Contoh: Ketua Kwartir Ranting"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Peran Sistem (Role Level)
                  </label>
                  <select
                    value={editingItem.role}
                    onChange={e => setEditingItem({ ...editingItem, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CFC5] rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="ketua_kwarran">Ketua Kwartir Ranting (Akses Penuh)</option>
                    <option value="sekretaris_kwarran">Sekretaris Kwarran & Admin SIKAP</option>
                    <option value="anran_binawasa">Andalan Ranting Bina Wasa (Pembina)</option>
                    <option value="anran_binamuda">Andalan Ranting Bina Muda (KTA)</option>
                    <option value="anran_organisasi">Andalan Ranting Organisasi & Hukum</option>
                    <option value="pembina_gudep">Pembina Gudep / Operator Pangkalan</option>
                    <option value="superadmin">Super Administrator Kwarran</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Ikon / Emoji Avatar
                  </label>
                  <select
                    value={editingItem.avatarEmoji || '⚜️'}
                    onChange={e => setEditingItem({ ...editingItem, avatarEmoji: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CFC5] rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="⚜️">⚜️ Lambang Pramuka WOSM</option>
                    <option value="🎖️">🎖️ Medali / Bintang</option>
                    <option value="📑">📑 Dokumen / Sekretariat</option>
                    <option value="⛺">⛺ Tenda Bina Muda</option>
                    <option value="🏫">🏫 Pangkalan Sekolah</option>
                    <option value="👨‍💼">👨‍💼 Kakak Pembina Putra</option>
                    <option value="👩‍💼">👩‍💼 Kakak Pembina Putri</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Nomor Tanda Anggota (NTA)
                  </label>
                  <input
                    type="text"
                    value={editingItem.nta || ''}
                    onChange={e => setEditingItem({ ...editingItem, nta: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CFC5] rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Contoh: 09.02.04.001.0001"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    required
                    value={editingItem.email}
                    onChange={e => setEditingItem({ ...editingItem, email: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CFC5] rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Contoh: ketua.tanahsareal@gmail.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Username untuk Login
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.username}
                    onChange={e => setEditingItem({ ...editingItem, username: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CFC5] rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Contoh: ketua.kwarran"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    PIN / Kata Sandi Login
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.pin}
                    onChange={e => setEditingItem({ ...editingItem, pin: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CFC5] rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Contoh: 123456"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Nama Pangkalan (Khusus Pembina Gudep)
                  </label>
                  <input
                    type="text"
                    value={editingItem.namaPangkalan || ''}
                    onChange={e => setEditingItem({ ...editingItem, namaPangkalan: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D5CFC5] rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Contoh: SDN Kedung Badak 4"
                  />
                </div>
              </div>

              {/* Tombol Simpan Form */}
              <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-100 transition-colors text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          ) : (
            /* Daftar Akun Pengurus */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    Daftar Pejabat & Pengurus Kwarran Tanah Sareal
                  </h4>
                  <p className="text-xs text-stone-500">
                    Kelola nama, jabatan, dan integrasikan langsung dengan data anggota.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMemberPickerTarget('assign_new');
                      setMemberPickerRoleTarget(null);
                      setIsMemberPickerOpen(true);
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors border border-amber-600"
                    title="Pilih anggota dari menu Profil & Anggota untuk dijadikan pengurus Kwarran"
                  >
                    <Users className="w-3.5 h-3.5 text-stone-950" />
                    <span>Pilih dari Profil & Anggota</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncAllPengurusToCloud}
                    disabled={isSyncingAll}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    title="Kirim dan sinkronkan seluruh nama pengurus ke cloud agar langsung update di HP anggota"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                    <span>{isSyncingAll ? 'Menyinkronkan...' : 'Sinkronkan ke HP Anggota'}</span>
                  </button>

                  <button
                    onClick={handleAddNew}
                    className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Akun Baru</span>
                  </button>

                  <button
                    onClick={handleResetToDefault}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    title="Reset susunan ke nama standar"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset Standar</span>
                  </button>
                </div>
              </div>

              {/* Banner Penugasan Anggota Jika Dibuka dari Menu Anggota */}
              {selectedMemberToAssign && (
                <div className="p-4 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border-2 border-amber-500 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border-2 border-amber-500 flex-shrink-0 shadow-xs">
                      <img
                        src={selectedMemberToAssign.fotoUrl}
                        alt={selectedMemberToAssign.namaLengkap}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300';
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-950 font-extrabold text-[10px] uppercase rounded-md tracking-wider">
                          Dipilih dari Menu Profil & Anggota
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-stone-900 mt-0.5">
                        {selectedMemberToAssign.namaLengkap}
                      </h4>
                      <p className="text-xs text-stone-600 font-mono">
                        NTA: {selectedMemberToAssign.nta} • {selectedMemberToAssign.namaPangkalan} ({selectedMemberToAssign.golongan} - {selectedMemberToAssign.tingkatan})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-stone-700 hidden lg:inline">Pilih Jabatan untuk Kak {selectedMemberToAssign.namaLengkap.split(' ')[0]}:</span>
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const roleId = e.target.value;
                        if (!roleId) return;
                        if (roleId === 'new') {
                          handleSelectMember(selectedMemberToAssign);
                        } else {
                          const targetRole = pengurusList.find(p => p.id === roleId);
                          if (targetRole) {
                            setEditingItem({
                              ...targetRole,
                              name: selectedMemberToAssign.namaLengkap,
                              nta: selectedMemberToAssign.nta,
                              memberId: selectedMemberToAssign.id,
                              pangkalanId: selectedMemberToAssign.gudepId,
                              namaPangkalan: selectedMemberToAssign.namaPangkalan,
                              kelurahan: selectedMemberToAssign.kelurahan,
                              avatarEmoji: selectedMemberToAssign.jenisKelamin === 'P' ? '👩‍💼' : '👨‍💼',
                            });
                            setIsAddingNew(false);
                          }
                        }
                        if (onClearSelectedMemberToAssign) onClearSelectedMemberToAssign();
                      }}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer shadow-sm"
                    >
                      <option value="" disabled>Tetapkan ke Posisi / Jabatan...</option>
                      {pengurusList.map(p => (
                        <option key={p.id} value={p.id} className="text-stone-900 bg-white">
                          {p.roleTitle} (Saat ini: {p.name})
                        </option>
                      ))}
                      <option value="new" className="text-stone-900 bg-white">
                        + Tambah Jabatan Baru
                      </option>
                    </select>

                    {onClearSelectedMemberToAssign && (
                      <button
                        type="button"
                        onClick={onClearSelectedMemberToAssign}
                        className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold rounded-xl text-xs transition-colors"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Grid Pengurus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {pengurusList.map((item) => {
                  const isCurrentActive = currentUser?.id === item.id;
                  const linkedMember = getLinkedMember(item);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all bg-white shadow-sm flex flex-col justify-between ${
                        isCurrentActive ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-[#E5DFD5] hover:border-stone-400'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-1 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5]">
                              {item.avatarEmoji || '⚜️'}
                            </span>
                            <div>
                              <p className="font-extrabold text-sm text-stone-900 leading-tight">
                                {item.name}
                              </p>
                              <p className="text-xs font-semibold text-amber-800 leading-tight mt-0.5">
                                {item.jabatan}
                              </p>
                            </div>
                          </div>

                          {isCurrentActive && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold">
                              Aktif
                            </span>
                          )}
                        </div>

                        {/* Status Integrasi Data Anggota */}
                        {linkedMember ? (
                          <div className="flex items-center justify-between p-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-[10.5px]">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-md overflow-hidden bg-stone-200 flex-shrink-0">
                                <img
                                  src={linkedMember.fotoUrl}
                                  alt={linkedMember.namaLengkap}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300';
                                  }}
                                />
                              </div>
                              <div className="truncate">
                                <span className="font-bold block truncate">{linkedMember.namaLengkap}</span>
                                <span className="text-emerald-700 text-[9.5px] block truncate">{linkedMember.namaPangkalan} • {linkedMember.golongan}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setMemberPickerRoleTarget(item);
                                setMemberPickerTarget('assign_role');
                                setIsMemberPickerOpen(true);
                              }}
                              className="px-2 py-0.5 bg-white text-emerald-800 border border-emerald-300 rounded-md font-bold hover:bg-emerald-100 transition-colors flex-shrink-0 ml-1 text-[10px]"
                            >
                              Ganti
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setMemberPickerRoleTarget(item);
                              setMemberPickerTarget('assign_role');
                              setIsMemberPickerOpen(true);
                            }}
                            className="w-full text-left flex items-center justify-between p-2 bg-amber-50/80 hover:bg-amber-100 text-amber-950 border border-amber-200/90 rounded-xl text-[10.5px] font-semibold transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-amber-700" />
                              <span>Pilih Dari Data Anggota</span>
                            </span>
                            <span className="text-amber-700 font-bold">&rarr;</span>
                          </button>
                        )}

                        <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EBE6DE] space-y-1 text-[11px] text-stone-600">
                          <div className="flex justify-between">
                            <span className="text-stone-400">Peran:</span>
                            <span className="font-medium text-stone-800">{item.roleTitle}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-400">Username Login:</span>
                            <span className="font-mono font-bold text-stone-900">{item.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-400">PIN Login:</span>
                            <span className="font-mono text-stone-800">{item.pin}</span>
                          </div>
                          {item.nta && (
                            <div className="flex justify-between">
                              <span className="text-stone-400">NTA:</span>
                              <span className="font-mono text-stone-700">{item.nta}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 mt-3 border-t border-[#EBE6DE] flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 truncate max-w-[150px]">
                          {item.email}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setMemberPickerRoleTarget(item);
                              setMemberPickerTarget('assign_role');
                              setIsMemberPickerOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Pilih anggota dari menu Profil & Anggota untuk jabatan ini"
                          >
                            <Users className="w-3.5 h-3.5 text-amber-700" />
                            <span>Pilih Anggota</span>
                          </button>

                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-amber-50 text-stone-800 hover:text-amber-900 border border-stone-300 hover:border-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus akun pengurus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KONTAK & WHATSAPP SEKRETARIAT */}
      {activeSection === 'kontak' && (
        <div className="space-y-6">
          <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-800 rounded-xl flex-shrink-0 mt-0.5">
                <Phone className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-emerald-950">
                  Ganti Nomor WhatsApp & Kontak Sekretariat
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  Nomor WhatsApp yang Anda masukkan di sini akan langsung menjadi target tombol <strong>"Chat WhatsApp Sekretariat"</strong> di Portal Publik dan dokumen resmi.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetContact}
              className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1 flex-shrink-0 shadow-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>

          <form onSubmit={handleSaveContact} className="bg-white rounded-2xl p-6 border border-[#E5DFD5] shadow-sm space-y-5">
            <div className="border-b border-[#E5DFD5] pb-3 flex items-center justify-between">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Formulir Kontak Layanan & WhatsApp</span>
              </h4>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                Auto Format Tautan wa.me
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Nomor WhatsApp Resmi (Hotline) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={contactForm.noWa}
                    onChange={(e) => setContactForm({ ...contactForm, noWa: e.target.value })}
                    placeholder="Contoh: 081287654321 atau 0812-8765-4321"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono font-bold text-stone-900"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Bisa format 0812xxx atau 62812xxx. Sistem otomatis mengonversi ke format tautan WhatsApp resmi.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Nomor Telepon Kantor / Tambahan
                </label>
                <input
                  type="text"
                  value={contactForm.noTelepon}
                  onChange={(e) => setContactForm({ ...contactForm, noTelepon: e.target.value })}
                  placeholder="Contoh: (0251) 833-4455"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Nomor telepon kabel / PSTN sekretariat atau nomor alternatif.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Nama Resmi Kwartir Ranting <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.namaKwarran}
                  onChange={(e) => setContactForm({ ...contactForm, namaKwarran: e.target.value })}
                  placeholder="Contoh: Kwartir Ranting Gerakan Pramuka Tanah Sareal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Email Resmi Sekretariat <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Contoh: kwarran.tanahsareal@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-800 mb-1">
                  Alamat Lengkap Kantor Sekretariat <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={contactForm.alamat}
                    onChange={(e) => setContactForm({ ...contactForm, alamat: e.target.value })}
                    placeholder="Contoh: Jl. Kebon Pedes No. 12, Kel. Kebon Pedes, Kec. Tanah Sareal, Kota Bogor, Jawa Barat"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={contactForm.kodePos}
                  onChange={(e) => setContactForm({ ...contactForm, kodePos: e.target.value })}
                  placeholder="16162"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Jam Layanan & Operasional <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={contactForm.jamLayanan}
                    onChange={(e) => setContactForm({ ...contactForm, jamLayanan: e.target.value })}
                    placeholder="Contoh: Senin - Jumat: 08.30 - 16.00 WIB • Sabtu: 09.00 - 13.00 WIB"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-800 mb-1">
                  Template Pesan Otomatis WhatsApp (Teks Pembuka Pengirim)
                </label>
                <textarea
                  rows={2}
                  value={contactForm.pesanWaDefault}
                  onChange={(e) => setContactForm({ ...contactForm, pesanWaDefault: e.target.value })}
                  placeholder="Contoh: Halo Sekretariat Kwarran Tanah Sareal, saya ingin konsultasi layanan kepramukaan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-xs"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Pesan ini akan otomatis terisi di kolom chat WhatsApp ketika pengunjung mengklik tombol Chat WhatsApp.
                </p>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-4 bg-[#14221F] border border-[#263D37] rounded-2xl text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold font-mono">
                  Pratinjau Tombol Portal Publik
                </span>
                <span className="text-[10px] text-stone-400">Target Tautan: {`https://wa.me/${waNumberIntl}`}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={testWaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Uji Chat WhatsApp ({contactForm.noWa})</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                <span className="text-xs text-stone-300">
                  Klik untuk menguji apakah nomor WhatsApp terbuka dengan benar di aplikasi WhatsApp Anda.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DFD5]">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Nomor WhatsApp & Kontak Sekretariat</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: PENGATURAN LOGO & BACKGROUND HERO KWARRAN */}
      {activeSection === 'background' && (
        <form onSubmit={handleSaveBackground} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E5DFD5] shadow-sm space-y-6">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-stone-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-600" />
                  <span>Kustomisasi Background & Logo Watermark Hero</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Sesuaikan logo Gerakan Pramuka Kwarran Tanah Sareal di balik tulisan utama, termasuk transparansi dan ukuran dimensi.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetBackground}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Standar Kwarran</span>
              </button>
            </div>

            {/* 1. Live Mini Simulation Preview */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-[#111A18] p-6 shadow-inner text-center">
              <div className="absolute top-2 right-3 text-[10px] text-stone-400 font-mono flex items-center gap-1">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>Simulasi Teks & Logo Watermark</span>
              </div>

              {/* Simulated Watermark */}
              {bgConfig.enabled && (
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden transition-all duration-300"
                  style={{
                    transform: `translateY(${bgConfig.offsetY * 0.4}px) rotate(${bgConfig.rotation}deg)`
                  }}
                >
                  {bgConfig.glow && (
                    <div 
                      className="absolute rounded-full blur-2xl opacity-40 bg-amber-500/30 pointer-events-none"
                      style={{
                        width: `${Math.min(300, bgConfig.size * 0.6)}px`,
                        height: `${Math.min(300, bgConfig.size * 0.6)}px`
                      }}
                    />
                  )}
                  <img
                    src={bgConfig.logoUrl}
                    alt="Logo Watermark Preview"
                    className={`object-contain transition-all duration-200 ${bgConfig.animateFloat ? 'animate-pulse' : ''}`}
                    referrerPolicy="no-referrer"
                    style={{
                      width: `${Math.min(320, bgConfig.size * 0.55)}px`,
                      height: `${Math.min(320, bgConfig.size * 0.55)}px`,
                      opacity: bgConfig.opacity,
                      filter: `${bgConfig.grayscale ? 'grayscale(100%)' : 'none'} ${bgConfig.blur > 0 ? `blur(${bgConfig.blur * 0.5}px)` : ''}`,
                      mixBlendMode: bgConfig.blendMode
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo-kwarran-tanah-sareal.png';
                    }}
                  />
                </div>
              )}

              {/* Simulated Foreground Text */}
              <div className="relative z-10 max-w-lg mx-auto py-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C2C28]/90 border border-amber-500/30 text-amber-300 text-[11px] font-medium mb-2.5">
                  <span>⚜️</span>
                  <span>Satu Data Pramuka Terpadu • Kwarran Tanah Sareal</span>
                </div>
                <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                  Portal Layanan & Database Keanggotaan Pramuka <span className="text-amber-400">Tanah Sareal</span>
                </h4>
                <p className="mt-2 text-xs text-stone-300 line-clamp-2">
                  Digitalisasi administrasi kepramukaan, validasi NTA/KTA, dan akreditasi pangkalan.
                </p>
              </div>
            </div>

            {/* 2. Toggle Status Watermark */}
            <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgConfig.enabled ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-200 text-stone-500'}`}>
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-stone-900">
                    Aktifkan Logo Watermark di Background Hero
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {bgConfig.enabled ? 'Logo aktif ditampilkan di balik tulisan utama' : 'Watermark nonaktif (gradien polos)'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bgConfig.enabled}
                  onChange={(e) => setBgConfig({ ...bgConfig, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* 3. Slider Transparansi (Opacity) */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>Transparansi (Opacity Watermark)</span>
                </label>
                <span className="font-mono text-xs font-bold text-amber-800 px-2.5 py-0.5 bg-amber-100 rounded-lg border border-amber-300">
                  {Math.round(bgConfig.opacity * 100)}%
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="80"
                step="1"
                value={Math.round(bgConfig.opacity * 100)}
                onChange={(e) => setBgConfig({ ...bgConfig, opacity: Number(e.target.value) / 100 })}
                className="w-full h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[11px] text-stone-500">Pilihan Cepat:</span>
                {[
                  { label: 'Sangat Samar (10%)', val: 0.10 },
                  { label: 'Standar Seimbang (22%)', val: 0.22 },
                  { label: 'Tegas (35%)', val: 0.35 },
                  { label: 'Kontras Tinggi (50%)', val: 0.50 }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setBgConfig({ ...bgConfig, opacity: item.val })}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      Math.abs(bgConfig.opacity - item.val) < 0.04
                        ? 'bg-amber-500 text-stone-950 font-bold border-amber-600 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-amber-500'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Slider Ukuran (Dimensi Logo) */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-amber-600" />
                  <span>Ukuran Dimensi Logo Watermark</span>
                </label>
                <span className="font-mono text-xs font-bold text-amber-800 px-2.5 py-0.5 bg-amber-100 rounded-lg border border-amber-300">
                  {bgConfig.size} px
                </span>
              </div>

              <input
                type="range"
                min="180"
                max="850"
                step="10"
                value={bgConfig.size}
                onChange={(e) => setBgConfig({ ...bgConfig, size: Number(e.target.value) })}
                className="w-full h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[11px] text-stone-500">Pilihan Cepat:</span>
                {[
                  { label: 'Kompak (280px)', val: 280 },
                  { label: 'Sedang (440px)', val: 440 },
                  { label: 'Besar (580px)', val: 580 },
                  { label: 'Ekstra Lebar (720px)', val: 720 }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setBgConfig({ ...bgConfig, size: item.val })}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      Math.abs(bgConfig.size - item.val) < 30
                        ? 'bg-amber-500 text-stone-950 font-bold border-amber-600 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-amber-500'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Ganti Logo (Presets, Upload File, dan Input URL) */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-600" />
                  <span>Pilih Logo Kwarran / Lambang Pramuka</span>
                </label>
                <span className="text-xs text-amber-700 font-semibold">
                  {bgConfig.logoTitle || 'Logo Terpilih'}
                </span>
              </div>

              {/* Grid Preset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_HERO_LOGOS.map((preset) => {
                  const isSelected = bgConfig.logoUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setBgConfig((prev) => ({ ...prev, logoUrl: preset.url, logoTitle: preset.title }));
                        setCustomBgUrlInput('');
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        isSelected 
                          ? 'bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-400/50' 
                          : 'bg-white border-stone-200 hover:border-amber-400 hover:bg-stone-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-stone-900 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img 
                          src={preset.url} 
                          alt={preset.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo-kwarran-tanah-sareal.png';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {preset.title}
                        </p>
                        <p className="text-[10px] text-stone-500 truncate">
                          {preset.subtitle}
                        </p>
                        <span className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          {preset.tag}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Upload Local File & URL Input */}
              <div className="pt-2 space-y-2">
                {logoUploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{logoUploadError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Upload Logo Sendiri (PNG / JPG / SVG)
                    </label>
                    <label className={`w-full p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm ${isProcessingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isProcessingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                          <span>Mengompresi Logo...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-amber-600" />
                          <span>Pilih File Gambar</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setLogoUploadError(null);

                          const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg|gif|bmp|avif)$/i.test(file.name);
                          if (!isImage) {
                            setLogoUploadError('Mohon pilih file gambar yang valid (PNG, JPG, WEBP, atau SVG).');
                            return;
                          }

                          try {
                            setIsProcessingLogo(true);
                            const optimizedDataUrl = await compressImageFile(file, 480, 480, 0.88);
                            setCustomBgUrlInput('');
                            setBgConfig((prev) => ({
                              ...prev,
                              logoUrl: optimizedDataUrl,
                              logoTitle: file.name.replace(/\.[^/.]+$/, '')
                            }));
                            setSaveSuccessMsg(`File logo "${file.name}" berhasil diunggah! Klik tombol "Simpan Pengaturan" di bawah untuk menyimpan permanen.`);
                            setTimeout(() => setSaveSuccessMsg(''), 4000);
                          } catch (err: any) {
                            console.error('Error compressing logo:', err);
                            setLogoUploadError(err.message || 'Gagal memproses file gambar.');
                          } finally {
                            setIsProcessingLogo(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                    <p className="mt-1 text-[10px] text-stone-500 text-center">
                      Format: PNG Transparan, JPG, SVG (Otomatis dioptimalkan)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Atau Masukkan Tautan URL Gambar
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://...gambar.png atau link Google Drive"
                        value={customBgUrlInput}
                        onChange={(e) => setCustomBgUrlInput(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!customBgUrlInput.trim()) return;
                            setLogoUploadError(null);
                            setIsProcessingLogo(true);
                            try {
                              const normalized = normalizeImageUrl(customBgUrlInput.trim());
                              const test = await checkImageUrlCanLoad(normalized);
                              setBgConfig({
                                ...bgConfig,
                                logoUrl: normalized,
                                logoTitle: normalized.startsWith('/logo-kwarran') ? 'Logo Resmi Kwarran 0917-06' : 'Logo Kustom URL'
                              });
                              setCustomBgUrlInput('');
                              if (!test.ok && test.reason) {
                                setLogoUploadError(`Catatan: ${test.reason}`);
                              }
                            } finally {
                              setIsProcessingLogo(false);
                            }
                          }
                        }}
                        className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        disabled={isProcessingLogo}
                        onClick={async () => {
                          if (!customBgUrlInput.trim()) return;
                          setLogoUploadError(null);
                          setIsProcessingLogo(true);
                          try {
                            const normalized = normalizeImageUrl(customBgUrlInput.trim());
                            const test = await checkImageUrlCanLoad(normalized);
                            setBgConfig({
                              ...bgConfig,
                              logoUrl: normalized,
                              logoTitle: normalized.startsWith('/logo-kwarran') ? 'Logo Resmi Kwarran 0917-06' : 'Logo Kustom URL'
                            });
                            setCustomBgUrlInput('');
                            if (!test.ok && test.reason) {
                              setLogoUploadError(`Catatan: ${test.reason}`);
                            }
                          } finally {
                            setIsProcessingLogo(false);
                          }
                        }}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                      >
                        {isProcessingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        <span>Pakai</span>
                      </button>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-500 flex-wrap gap-1">
                      <span>Mendukung link Google Drive, Dropbox, atau tautan gambar langsung</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomBgUrlInput('/logo-kwarran-tanah-sareal.png');
                        }}
                        className="text-amber-700 hover:underline font-mono font-medium"
                      >
                        Pakai link lokal: /logo-kwarran-tanah-sareal.png
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Efek Visual Tambahan (Y-Offset, Blur, Blend Mode, Glow, Animasi) */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
              <h5 className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Penyempurnaan Posisi & Efek Pencampuran</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-700 font-medium">Posisi Vertikal (Y-Offset)</span>
                    <span className="font-mono text-amber-800 text-[11px] font-bold">
                      {bgConfig.offsetY > 0 ? `+${bgConfig.offsetY}px` : `${bgConfig.offsetY}px`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="5"
                    value={bgConfig.offsetY}
                    onChange={(e) => setBgConfig({ ...bgConfig, offsetY: Number(e.target.value) })}
                    className="w-full h-1.5 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-[9px] text-stone-500 mt-0.5">
                    <span>Lebih Tinggi (-80px)</span>
                    <span>Tengah (0)</span>
                    <span>Lebih Rendah (+80px)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-700 font-medium">Efek Kelembutan / Blur</span>
                    <span className="font-mono text-amber-800 text-[11px] font-bold">
                      {bgConfig.blur} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={bgConfig.blur}
                    onChange={(e) => setBgConfig({ ...bgConfig, blur: Number(e.target.value) })}
                    className="w-full h-1.5 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-[9px] text-stone-500 mt-0.5">
                    <span>Tajam (0px)</span>
                    <span>Medium (4px)</span>
                    <span>Sangat Lembut (8px)</span>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer hover:border-amber-400 shadow-sm">
                  <input
                    type="checkbox"
                    checked={bgConfig.glow}
                    onChange={(e) => setBgConfig({ ...bgConfig, glow: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs text-stone-700 font-medium">Aura Cahaya Emas</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer hover:border-amber-400 shadow-sm">
                  <input
                    type="checkbox"
                    checked={bgConfig.animateFloat}
                    onChange={(e) => setBgConfig({ ...bgConfig, animateFloat: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs text-stone-700 font-medium">Animasi Bernapas Halus</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer hover:border-amber-400 shadow-sm">
                  <input
                    type="checkbox"
                    checked={bgConfig.grayscale}
                    onChange={(e) => setBgConfig({ ...bgConfig, grayscale: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs text-stone-700 font-medium">Mode Monokrom (B&W)</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DFD5]">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Background & Logo Hero</span>
              </button>
            </div>

          </div>
        </form>
      )}
    </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-100 border-t border-[#E5DFD5] flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Semua data tersinkronisasi otomatis dengan Realtime Cloud Firestore</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 text-white font-semibold rounded-xl hover:bg-stone-900 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* MODAL PILIH ANGGOTA DARI DATABASE PROFIL & ANGGOTA */}
      {isMemberPickerOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#182623] to-[#253d37] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-stone-950 rounded-2xl shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
                    <span>Pilih Dari Data Profil & Anggota</span>
                    <span className="px-2 py-0.5 bg-amber-400 text-stone-950 rounded-md text-[10px] font-black uppercase tracking-wider">
                      Terintegrasi
                    </span>
                  </h3>
                  <p className="text-xs text-stone-300">
                    {memberPickerRoleTarget 
                      ? `Menetapkan anggota untuk jabatan: ${memberPickerRoleTarget.roleTitle}` 
                      : 'Pilih anggota/pembina untuk mengisi data struktur pengurus Kwarran secara otomatis'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMemberPickerOpen(false);
                  setMemberPickerRoleTarget(null);
                  setMemberPickerTarget(null);
                }}
                className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3 sm:p-4 border-b border-stone-200 bg-[#FAF8F5] space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={memberSearchText}
                  onChange={e => setMemberSearchText(e.target.value)}
                  placeholder="Cari nama anggota, NTA, NIK, nama pangkalan, gugus depan, kelurahan..."
                  className="w-full pl-10 pr-16 py-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
                  autoFocus
                />
                {memberSearchText && (
                  <button
                    type="button"
                    onClick={() => setMemberSearchText('')}
                    className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700 font-semibold"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-stone-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-stone-400" />
                  <span>Kategori:</span>
                </span>
                {[
                  { id: 'ALL', label: `Semua (${allMembers.length})` },
                  { id: 'PEMBINA', label: `Pembina (${allMembers.filter(m => m.golongan === 'Pembina').length})` },
                  { id: 'PELATIH', label: `Pelatih & Mahir (${allMembers.filter(m => m.golongan === 'Pelatih' || m.kualifikasiKursus === 'KPD' || m.kualifikasiKursus === 'KPL').length})` },
                  { id: 'DEWASA', label: `Dewasa (${allMembers.filter(m => m.golongan === 'Pembina' || m.golongan === 'Pelatih' || m.golongan === 'Andalan' || m.golongan === 'Mabigus').length})` },
                  { id: 'MUDA', label: `Penegak & Pandega (${allMembers.filter(m => m.golongan === 'Penegak' || m.golongan === 'Pandega').length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMemberFilterCategory(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors ${
                      memberFilterCategory === tab.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Anggota */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-stone-100">
              {filteredPickerMembers.length === 0 ? (
                <div className="py-12 text-center text-stone-500">
                  <Users className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                  <p className="font-bold text-xs text-stone-700">Tidak ada anggota yang cocok dengan pencarian.</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Silakan gunakan kata kunci lain atau tambahkan anggota baru di menu Profil & Anggota.
                  </p>
                </div>
              ) : (
                filteredPickerMembers.map((member) => {
                  const assignedPengurus = pengurusList.find(
                    p => (p.memberId && p.memberId === member.id) || 
                         (p.nta && member.nta && p.nta.trim() === member.nta.trim()) ||
                         (p.name.toLowerCase().replace(/kak|\.|,/g, '').trim() === member.namaLengkap.toLowerCase().replace(/kak|\.|,/g, '').trim())
                  );

                  return (
                    <div
                      key={member.id}
                      className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-amber-50/60 border border-transparent hover:border-amber-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                          <img
                            src={member.fotoUrl}
                            alt={member.namaLengkap}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-xs text-stone-950">{member.namaLengkap}</span>
                            <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px] font-bold border border-stone-200">
                              {member.golongan} - {member.tingkatan}
                            </span>
                            {assignedPengurus && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold">
                                ⚜️ {assignedPengurus.roleTitle}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-600 font-mono mt-0.5">
                            NTA: <span className="font-bold text-stone-800">{member.nta}</span> • {member.namaPangkalan} (Gudep {member.noGudep})
                          </div>
                          <div className="text-[10.5px] text-stone-400 mt-0.5">
                            Kel. {member.kelurahan} {member.kualifikasiKursus && member.kualifikasiKursus !== 'Belum' ? `• Kursus: ${member.kualifikasiKursus}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleSelectMember(member)}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Pilih Anggota Ini</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span className="text-[11px]">
                Menampilkan <strong>{filteredPickerMembers.length}</strong> dari <strong>{allMembers.length}</strong> anggota terdaftar
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsMemberPickerOpen(false);
                  setMemberPickerRoleTarget(null);
                  setMemberPickerTarget(null);
                }}
                className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-xl text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
