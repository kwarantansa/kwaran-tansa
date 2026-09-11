import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { GudepManager } from './components/GudepManager';
import { MemberManager } from './components/MemberManager';
import { CollectiveKtaManager } from './components/CollectiveKtaManager';
import { DigitalArchiveManager } from './components/DigitalArchiveManager';
import { SemesterReportManager } from './components/SemesterReportManager';
import { PublicPortal } from './components/PublicPortal';
import { GudepDashboard } from './components/GudepDashboard';
import { LoginModal } from './components/LoginModal';
import { PengurusSettingsModal } from './components/PengurusSettingsModal';
import { HeroBackgroundSettingsModal } from './components/HeroBackgroundSettingsModal';
import { KtaCard } from './components/KtaCard';
import { QrVerifierModal } from './components/QrVerifierModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { GDriveSelectorModal } from './components/GDriveSelectorModal';
import { GudepRegistrationModal } from './components/GudepRegistrationModal';
import { BottomNavigation } from './components/BottomNavigation';
import { 
  loadGudepList, 
  saveGudepList, 
  loadMemberList, 
  saveMemberList, 
  loadBatchesList, 
  saveBatchesList,
  loadArchives,
  saveArchives,
  loadSemesterReports,
  saveSemesterReports,
  loadSecretariatContact,
  saveSecretariatContact,
  DEFAULT_SECRETARIAT_CONTACT,
  loadHeroBackgroundConfig,
  saveHeroBackgroundConfig,
  loadGDriveSettings,
  saveGDriveSettings,
  loadRegistrations,
  saveRegistrations,
  resetToInitialData,
  syncGudepLeadersWithMembers
} from './utils/storage';
import { getStoredAuthUser, setStoredAuthUser, getCustomPengurusList, saveCustomPengurusList, PengurusAccountItem } from './utils/auth';
import { 
  seedInitialDataIfEmpty,
  testConnection,
  subscribeToGudep,
  subscribeToMembers,
  subscribeToKtaBatches,
  subscribeToArchives,
  subscribeToSemesterReports,
  subscribeToPengurus,
  subscribeToSecretariatContact,
  subscribeToHeroBackground,
  subscribeToRegistrations,
  saveGudepToCloud,
  deleteGudepFromCloud,
  saveMemberToCloud,
  deleteMemberFromCloud,
  saveKtaBatchToCloud,
  saveArchiveToCloud,
  deleteArchiveFromCloud,
  saveSemesterReportToCloud,
  deleteSemesterReportFromCloud,
  saveHeroBackgroundToCloud,
  saveRegistrationToCloud,
  updateRegistrationStatusInCloud,
  deleteGudepRegistrationFromCloud
} from './services/realtimeDb';
import { 
  Gudep, 
  Member, 
  CollectiveKtaBatch,
  ArchiveDocument,
  SemesterReport,
  AuthUser,
  SecretariatContact,
  HeroBackgroundConfig,
  GDriveStorageSettings,
  DEFAULT_HERO_BACKGROUND,
  GudepRegistration
} from './types';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Award, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  X, 
  RotateCcw,
  BarChart3,
  Heart,
  Globe,
  Lock,
  LogOut,
  UserCheck,
  Cloud,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Navigation & Authentication states
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialTab, setLoginInitialTab] = useState<'gudep' | 'pengurus'>('gudep');
  const [isPengurusSettingsOpen, setIsPengurusSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Data states
  const [gudepList, setGudepList] = useState<Gudep[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [batches, setBatches] = useState<CollectiveKtaBatch[]>([]);
  const [archives, setArchives] = useState<ArchiveDocument[]>([]);
  const [semesterReports, setSemesterReports] = useState<SemesterReport[]>([]);
  const [secretariatContact, setSecretariatContact] = useState<SecretariatContact>(loadSecretariatContact());
  const [heroBgConfig, setHeroBgConfig] = useState<HeroBackgroundConfig>(loadHeroBackgroundConfig());
  const [pengurusList, setPengurusList] = useState<PengurusAccountItem[]>(getCustomPengurusList());
  const [gdriveSettings, setGDriveSettings] = useState<GDriveStorageSettings>(loadGDriveSettings());
  const [registrations, setRegistrations] = useState<GudepRegistration[]>(() => loadRegistrations());

  // Modal states
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isHeroBgSettingsOpen, setIsHeroBgSettingsOpen] = useState(false);
  const [isGDriveSelectorOpen, setIsGDriveSelectorOpen] = useState(false);
  const [isGudepRegistrationOpen, setIsGudepRegistrationOpen] = useState(false);
  const [pengurusSettingsSection, setPengurusSettingsSection] = useState<'pengurus' | 'credentials' | 'kontak' | 'background'>('credentials');
  const [selectedKtaMember, setSelectedKtaMember] = useState<Member | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [memberFilter, setMemberFilter] = useState<{ search?: string; gudepId?: string; gol?: string }>({
    search: '',
    gudepId: 'ALL',
    gol: 'ALL'
  });

  // Realtime Cloud Database Setup & Subscriptions
  useEffect(() => {
    // 1. Load initial cached local storage data first
    setGudepList(loadGudepList());
    setMembers(loadMemberList());
    setBatches(loadBatchesList());
    setArchives(loadArchives());
    setSemesterReports(loadSemesterReports());
    setSecretariatContact(loadSecretariatContact());
    setHeroBgConfig(loadHeroBackgroundConfig());
    setPengurusList(getCustomPengurusList());
    setGDriveSettings(loadGDriveSettings());

    // Check stored authentication session
    const storedUser = getStoredAuthUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }

    // 2. Initialize Firestore Cloud Data & Subscriptions
    testConnection().then((connected) => {
      if (connected) {
        setIsCloudSynced(true);
      }
    });
    seedInitialDataIfEmpty();

    const unsubGudep = subscribeToGudep((data) => {
      setGudepList(data);
      saveGudepList(data);
      setIsCloudSynced(true);
      setMembers(prev => {
        const synced = syncGudepLeadersWithMembers(data, prev);
        saveMemberList(synced);
        return synced;
      });
    });

    const unsubMembers = subscribeToMembers((data) => {
      const currentGudep = loadGudepList();
      const synced = syncGudepLeadersWithMembers(currentGudep, data);
      setMembers(synced);
      saveMemberList(synced);
      // Simpan pemimpin gudep (Ka Mabigus & Pembina) yang baru terbuat ke cloud
      const newLeaders = synced.filter(s => !data.some(d => d.id === s.id));
      if (newLeaders.length > 0) {
        newLeaders.forEach(item => {
          saveMemberToCloud(item).catch(() => {});
        });
      }
    });

    const unsubBatches = subscribeToKtaBatches((data) => {
      setBatches(data);
      saveBatchesList(data);
    });

    const unsubArchives = subscribeToArchives((data) => {
      setArchives(data);
      saveArchives(data);
    });

    const unsubReports = subscribeToSemesterReports((data) => {
      setSemesterReports(data);
      saveSemesterReports(data);
    });

    const unsubPengurus = subscribeToPengurus((data) => {
      if (data && data.length > 0) {
        setPengurusList(data);
        saveCustomPengurusList(data);
      }
    });

    const unsubContact = subscribeToSecretariatContact((data) => {
      if (data) {
        setSecretariatContact(data);
        saveSecretariatContact(data);
      }
    });

    const unsubHeroBg = subscribeToHeroBackground((data) => {
      if (data) {
        setHeroBgConfig(data);
        saveHeroBackgroundConfig(data);
      }
    });

    const unsubRegistrations = subscribeToRegistrations((data) => {
      if (data && data.length > 0) {
        setRegistrations(data);
        saveRegistrations(data);
      }
    });

    return () => {
      if (unsubGudep) unsubGudep();
      if (unsubMembers) unsubMembers();
      if (unsubBatches) unsubBatches();
      if (unsubArchives) unsubArchives();
      if (unsubReports) unsubReports();
      if (unsubPengurus) unsubPengurus();
      if (unsubContact) unsubContact();
      if (unsubHeroBg) unsubHeroBg();
      if (unsubRegistrations) unsubRegistrations();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setStoredAuthUser(user);
    setCurrentView('admin');
    if (user.role === 'pembina_gudep') {
      showToast(`Selamat datang! Anda masuk ke Dashboard Gugus Depan ${user.namaPangkalan || user.name}`);
    } else {
      showToast(`Berhasil masuk sebagai ${user.name} (${user.roleTitle})`);
    }
  };

  const handleLogout = () => {
    setStoredAuthUser(null);
    setCurrentUser(null);
    setCurrentView('public');
    showToast('Sesi telah berakhir. Anda berada di portal umum.');
  };

  const handleSwitchToPublic = () => {
    setCurrentView('public');
  };

  const handleSwitchToAdmin = () => {
    if (currentUser) {
      setCurrentView('admin');
    } else {
      setLoginInitialTab('gudep');
      setIsLoginModalOpen(true);
    }
  };

  const handleUpdateGudepPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Tidak ada sesi login aktif.' };

    const updatedList = registrations.map(reg => {
      const match = (currentUser.pangkalanId && reg.id === currentUser.pangkalanId) ||
        (currentUser.username && reg.akunGudep?.username?.toLowerCase() === currentUser.username.toLowerCase()) ||
        (currentUser.namaPangkalan && reg.namaPangkalan?.toLowerCase() === currentUser.namaPangkalan.toLowerCase());
      if (match) {
        return {
          ...reg,
          akunGudep: {
            ...reg.akunGudep,
            password: newPassword
          }
        };
      }
      return reg;
    });

    setRegistrations(updatedList);
    saveRegistrations(updatedList);

    const target = updatedList.find(reg => 
      (currentUser.pangkalanId && reg.id === currentUser.pangkalanId) ||
      (currentUser.username && reg.akunGudep?.username?.toLowerCase() === currentUser.username.toLowerCase())
    );

    if (target) {
      try {
        await saveRegistrationToCloud(target);
      } catch (err) {
        console.warn('Realtime cloud sync password error:', err);
      }
    }

    showToast('Kata sandi Akun Gudep berhasil diperbarui.');
    return { success: true };
  };

  // Gudep Profile Update Handler (Direct Self-Service by Gudep)
  const handleSaveGudepRegistration = async (updatedReg: GudepRegistration) => {
    const updatedList = registrations.map(r => r.id === updatedReg.id ? updatedReg : r);
    const finalRegistrations = updatedList.some(r => r.id === updatedReg.id) 
      ? updatedList 
      : [...updatedList, updatedReg];
    
    setRegistrations(finalRegistrations);
    saveRegistrations(finalRegistrations);

    // Sync to gudepList if matching
    const matchingGudepIndex = gudepList.findIndex(g => 
      g.id === updatedReg.id || 
      g.namaPangkalan.toLowerCase() === updatedReg.namaPangkalan.toLowerCase() ||
      (g.noGudepPa && updatedReg.noGudepPa && g.noGudepPa === updatedReg.noGudepPa)
    );

    let newGudepList = [...gudepList];
    if (matchingGudepIndex >= 0) {
      const existingGudep = gudepList[matchingGudepIndex];
      const updatedGudep: Gudep = {
        ...existingGudep,
        namaPangkalan: updatedReg.namaPangkalan,
        noGudepPa: updatedReg.noGudepPa,
        noGudepPi: updatedReg.noGudepPi,
        kelurahan: updatedReg.kelurahan,
        alamat: updatedReg.alamat,
        kaMabigus: updatedReg.kaMabigus,
        pembinaGudepPa: updatedReg.namaPembinaPa,
        pembinaGudepPi: updatedReg.namaPembinaPi,
        kontakHp: updatedReg.noHpKaMabigus || updatedReg.noHpPembinaPa || existingGudep.kontakHp,
        jenjang: updatedReg.jenjang,
        statusSekolah: updatedReg.statusSekolah,
        saranaPrasarana: updatedReg.saranaPrasarana || existingGudep.saranaPrasarana,
        prestasi: updatedReg.prestasi3Tahun ? [updatedReg.prestasi3Tahun] : existingGudep.prestasi,
        jumlahPembina: (updatedReg.jumlahPembinaPa || 0) + (updatedReg.jumlahPembinaPi || 0),
        jumlahPesertaDidik: (updatedReg.jumlahSiagaPa || 0) + (updatedReg.jumlahSiagaPi || 0) +
          (updatedReg.jumlahPenggalangPa || 0) + (updatedReg.jumlahPenggalangPi || 0) +
          (updatedReg.jumlahPenegakPa || 0) + (updatedReg.jumlahPenegakPi || 0) +
          (updatedReg.jumlahPandegaPa || 0) + (updatedReg.jumlahPandegaPi || 0),
      };
      newGudepList[matchingGudepIndex] = updatedGudep;
      setGudepList(newGudepList);
      saveGudepList(newGudepList);

      // Otomatis sinkronkan Ka Mabigus & Pembina Gudep ke Pusat Data Anggota (MemberManager)
      const syncedMembers = syncGudepLeadersWithMembers(newGudepList, members);
      setMembers(syncedMembers);
      saveMemberList(syncedMembers);

      try {
        await saveGudepToCloud(updatedGudep);
      } catch (e) {
        console.warn('Sync updated gudep to cloud warning:', e);
      }
    }

    // Update currentUser session if user is pembina_gudep
    if (currentUser && currentUser.role === 'pembina_gudep') {
      const updatedUser = {
        ...currentUser,
        namaPangkalan: updatedReg.namaPangkalan,
        kelurahan: updatedReg.kelurahan
      };
      setCurrentUser(updatedUser);
      setStoredAuthUser(updatedUser);
    }

    try {
      await saveRegistrationToCloud(updatedReg);
    } catch (err) {
      console.warn('Save registration to cloud error:', err);
    }

    showToast(`Data profil Gudep ${updatedReg.namaPangkalan} berhasil diperbarui.`);
  };

  // Gudep Handlers
  const handleSaveGudep = async (gudep: Gudep) => {
    const exists = gudepList.some(g => g.id === gudep.id);
    let updated: Gudep[];
    if (exists) {
      updated = gudepList.map(g => g.id === gudep.id ? gudep : g);
      showToast(`Data Gugus Depan ${gudep.namaPangkalan} berhasil diperbarui (Real-time).`);
    } else {
      updated = [gudep, ...gudepList];
      showToast(`Gugus Depan ${gudep.namaPangkalan} berhasil ditambahkan (Real-time).`);
    }
    setGudepList(updated);
    saveGudepList(updated);

    // Otomatis sinkronkan Ka Mabigus & Pembina Gudep ke Pusat Data Anggota (MemberManager)
    const syncedMembers = syncGudepLeadersWithMembers(updated, members);
    setMembers(syncedMembers);
    saveMemberList(syncedMembers);

    try {
      await saveGudepToCloud(gudep);
      // Simpan personil pembina/mabigus terkait ke cloud
      const leaders = syncedMembers.filter(m => m.gudepId === gudep.id && (m.golongan === 'Mabigus' || ['Pembina', 'Pelatih'].includes(m.golongan)));
      for (const lm of leaders) {
        await saveMemberToCloud(lm);
      }
    } catch (err) {
      console.warn('Realtime cloud sync error:', err);
    }
  };

  const handleDeleteGudep = async (id: string) => {
    const updated = gudepList.filter(g => g.id !== id);
    setGudepList(updated);
    saveGudepList(updated);

    try {
      await deleteGudepFromCloud(id);
    } catch (err) {
      console.warn('Realtime cloud delete error:', err);
    }
    showToast('Data Gugus Depan berhasil dihapus.');
  };

  // Registration Handlers (Public & Admin Verification)
  const handleSaveRegistration = async (newReg: GudepRegistration) => {
    const updated = [newReg, ...registrations.filter(r => r.id !== newReg.id)];
    setRegistrations(updated);
    saveRegistrations(updated);

    try {
      await saveRegistrationToCloud(newReg);
    } catch (err) {
      console.warn('Realtime cloud save registration error:', err);
    }
    showToast(`Registrasi ${newReg.namaPangkalan} berhasil diajukan (${newReg.noRegistrasi}).`);
  };

  const handleVerifyRegistration = async (regId: string, status: 'Disetujui' | 'Ditolak', note?: string) => {
    const targetReg = registrations.find(r => r.id === regId);
    if (!targetReg) return;

    const verifierName = currentUser?.name || 'Pengurus Kwarran Tanah Sareal';
    const updated = registrations.map(r => {
      if (r.id === regId) {
        return {
          ...r,
          statusVerifikasi: status,
          catatanVerifikasi: note || (status === 'Disetujui' ? 'Disetujui dan diverifikasi oleh Pengurus Kwarran' : 'Ditolak / Perlu Revisi'),
          diverifikasiOleh: verifierName,
          tanggalVerifikasi: new Date().toISOString()
        };
      }
      return r;
    });

    setRegistrations(updated);
    saveRegistrations(updated);

    try {
      await updateRegistrationStatusInCloud(regId, status, note, verifierName);
    } catch (err) {
      console.warn('Realtime cloud update registration status error:', err);
    }

    if (status === 'Disetujui') {
      // Create or update in Buku Induk Gudep
      const existingGudep = gudepList.find(g => 
        g.namaPangkalan.toLowerCase() === targetReg.namaPangkalan.toLowerCase() ||
        (targetReg.nomorGudep && g.nomorGudep === targetReg.nomorGudep)
      );

      if (!existingGudep) {
        const newGudep: Gudep = {
          id: `gudep-${Date.now()}`,
          noGudepPa: targetReg.noGudepPa || targetReg.nomorGudep?.split('/')[0]?.trim() || '04.071',
          noGudepPi: targetReg.noGudepPi || targetReg.nomorGudep?.split('/')[1]?.trim() || '04.072',
          namaPangkalan: targetReg.namaPangkalan,
          jenjang: targetReg.jenjang,
          kelurahan: targetReg.kelurahan,
          alamat: targetReg.alamatLengkap || targetReg.alamat || '',
          kaMabigus: targetReg.kaMabigus,
          pembinaGudepPa: targetReg.namaPembinaPa,
          pembinaGudepPi: targetReg.namaPembinaPi,
          kontakHp: targetReg.noWaMabigus || targetReg.noWaPembinaPa || targetReg.akunGudep.noWaPendaftar || '081287654321',
          email: targetReg.akunGudep.emailPendaftar || '',
          akreditasi: 'Belum Terakreditasi',
          tahunBerdiri: 2020,
          jumlahAnggotaMuda: (targetReg.jumlahPutra || 0) + (targetReg.jumlahPutri || 0),
          jumlahPembina: 2,
          statusSync: 'Tersinkronisasi',
          terakhirDiperbarui: new Date().toISOString().slice(0, 10)
        };
        const updatedGudep = [newGudep, ...gudepList];
        setGudepList(updatedGudep);
        saveGudepList(updatedGudep);
        saveGudepToCloud(newGudep).catch(() => {});
      }

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      showToast(`Pendaftaran Gudep ${targetReg.namaPangkalan} disetujui & akun @${targetReg.akunGudep.username} diaktifkan!`);
    } else {
      showToast(`Pendaftaran Gudep ${targetReg.namaPangkalan} ditolak / diberi catatan revisi.`);
    }
  };

  const handleDeleteRegistration = async (regId: string) => {
    const target = registrations.find(r => r.id === regId);
    const updated = registrations.filter(r => r.id !== regId);
    setRegistrations(updated);
    saveRegistrations(updated);

    try {
      await deleteGudepRegistrationFromCloud(regId);
    } catch (err) {
      console.warn('Error deleting registration from cloud:', err);
    }

    showToast(`Berkas pendaftaran ${target?.noRegistrasi || ''} (${target?.namaPangkalan || 'Gudep'}) berhasil dihapus.`);
  };

  // Member Handlers
  const handleSaveMember = async (member: Member) => {
    const exists = members.some(m => m.id === member.id);
    let updated: Member[];
    if (exists) {
      updated = members.map(m => m.id === member.id ? member : m);
      showToast(`Data anggota ${member.namaLengkap} berhasil diperbarui (Real-time).`);
    } else {
      updated = [member, ...members];
      showToast(`Anggota ${member.namaLengkap} (${member.nta}) berhasil diregistrasi (Real-time).`);
    }
    setMembers(updated);
    saveMemberList(updated);

    // Sinkronisasi balik jika personil ini adalah Ka Mabigus atau Pembina Gudep
    if (member.gudepId) {
      const targetGudep = gudepList.find(g => g.id === member.gudepId);
      if (targetGudep) {
        let gudepChanged = false;
        const updatedGudep = { ...targetGudep };

        if (member.golongan === 'Mabigus' || member.jabatan?.toLowerCase().includes('mabigus')) {
          if (updatedGudep.kaMabigus !== member.namaLengkap) {
            updatedGudep.kaMabigus = member.namaLengkap;
            gudepChanged = true;
          }
        } else if (member.jabatan?.toLowerCase().includes('putra') || (member.golongan === 'Pembina' && member.jenisKelamin === 'L')) {
          if (updatedGudep.pembinaGudepPa !== member.namaLengkap) {
            updatedGudep.pembinaGudepPa = member.namaLengkap;
            gudepChanged = true;
          }
        } else if (member.jabatan?.toLowerCase().includes('putri') || (member.golongan === 'Pembina' && member.jenisKelamin === 'P')) {
          if (updatedGudep.pembinaGudepPi !== member.namaLengkap) {
            updatedGudep.pembinaGudepPi = member.namaLengkap;
            gudepChanged = true;
          }
        }

        if (gudepChanged) {
          const newGudepList = gudepList.map(g => g.id === updatedGudep.id ? updatedGudep : g);
          setGudepList(newGudepList);
          saveGudepList(newGudepList);
          try {
            await saveGudepToCloud(updatedGudep);
          } catch (e) {}
        }
      }
    }

    try {
      await saveMemberToCloud(member);
    } catch (err) {
      console.warn('Realtime cloud sync error:', err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    saveMemberList(updated);

    try {
      await deleteMemberFromCloud(id);
    } catch (err) {
      console.warn('Realtime cloud delete error:', err);
    }
    showToast('Data anggota berhasil dihapus.');
  };

  const handleSyncMembers = async (memberIds: string[]) => {
    const updated = members.map(m => {
      if (memberIds.includes(m.id)) {
        return {
          ...m,
          statusSync: 'Tersinkronisasi' as const,
          statusKta: 'Sudah Terbit' as const
        };
      }
      return m;
    });
    setMembers(updated);
    saveMemberList(updated);

    // Update affected members to cloud
    for (const id of memberIds) {
      const target = updated.find(m => m.id === id);
      if (target) {
        try {
          await saveMemberToCloud(target);
        } catch (e) {}
      }
    }

    showToast(`Berhasil menyinkronkan ${memberIds.length} data anggota ke sistem Cloud!`);
    
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}
  };

  // Collective Batch Handlers
  const handleSaveBatch = async (batch: CollectiveKtaBatch, newMembers?: Member[]) => {
    const updatedBatches = [batch, ...batches];
    setBatches(updatedBatches);
    saveBatchesList(updatedBatches);

    try {
      await saveKtaBatchToCloud(batch);
    } catch (err) {
      console.warn('Realtime cloud sync error:', err);
    }

    if (newMembers && newMembers.length > 0) {
      const updatedMembers = [...newMembers, ...members];
      setMembers(updatedMembers);
      saveMemberList(updatedMembers);

      for (const nm of newMembers) {
        try {
          await saveMemberToCloud(nm);
        } catch (e) {}
      }
    }

    showToast(`Batch kolektif ${batch.noBatch} (${batch.jumlahAnggota} anggota) berhasil didaftarkan secara Real-time!`);
  };

  const handleUpdateBatchStatus = async (batchId: string, status: CollectiveKtaBatch['status']) => {
    const updated = batches.map(b => b.id === batchId ? { ...b, status } : b);
    setBatches(updated);
    saveBatchesList(updated);

    const target = updated.find(b => b.id === batchId);
    if (target) {
      try {
        await saveKtaBatchToCloud(target);
      } catch (err) {
        console.warn('Realtime cloud sync error:', err);
      }
    }

    showToast(`Status batch KTA diperbarui: ${status}`);
  };

  // Archive Handlers
  const handleSaveArchive = async (doc: ArchiveDocument) => {
    const exists = archives.some(a => a.id === doc.id);
    let updated: ArchiveDocument[];
    if (exists) {
      updated = archives.map(a => a.id === doc.id ? doc : a);
      showToast(`Arsip ${doc.nomorDokumen} berhasil diperbarui.`);
    } else {
      updated = [doc, ...archives];
      showToast(`Dokumen arsip ${doc.nomorDokumen} berhasil ditambahkan ke Cloud Repositori.`);
    }
    setArchives(updated);
    saveArchives(updated);

    try {
      await saveArchiveToCloud(doc);
    } catch (err) {
      console.warn('Realtime cloud sync error:', err);
    }
  };

  const handleDeleteArchive = async (id: string) => {
    const updated = archives.filter(a => a.id !== id);
    setArchives(updated);
    saveArchives(updated);

    try {
      await deleteArchiveFromCloud(id);
    } catch (err) {
      console.warn('Realtime cloud delete error:', err);
    }
    showToast('Dokumen arsip berhasil dihapus dari sistem.');
  };

  // Semester Report Handlers
  const handleSaveSemesterReport = async (report: SemesterReport) => {
    const exists = semesterReports.some(r => r.id === report.id);
    let updated: SemesterReport[];
    if (exists) {
      updated = semesterReports.map(r => r.id === report.id ? report : r);
      showToast(`Laporan ${report.semester} ${report.tahunAjaran} berhasil diperbarui.`);
    } else {
      updated = [report, ...semesterReports];
      showToast(`Laporan ${report.semester} ${report.tahunAjaran} berhasil diterbitkan.`);
    }
    setSemesterReports(updated);
    saveSemesterReports(updated);

    try {
      await saveSemesterReportToCloud(report);
    } catch (err) {
      console.warn('Realtime cloud sync error:', err);
    }
  };

  const handleDeleteSemesterReport = async (id: string) => {
    const updated = semesterReports.filter(r => r.id !== id);
    setSemesterReports(updated);
    saveSemesterReports(updated);

    try {
      await deleteSemesterReportFromCloud(id);
    } catch (err) {
      console.warn('Realtime cloud delete error:', err);
    }
    showToast('Laporan semester berhasil dihapus.');
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data kembali ke data contoh standar Kwarran Tanah Sareal?')) {
      resetToInitialData();
      setGudepList(loadGudepList());
      setMembers(loadMemberList());
      setBatches(loadBatchesList());
      setArchives(loadArchives());
      setSemesterReports(loadSemesterReports());
      setGDriveSettings(loadGDriveSettings());
      seedInitialDataIfEmpty();
      showToast('Data berhasil di-reset ke data awal.');
    }
  };

  const handleUpdateGDriveSettings = (newSettings: GDriveStorageSettings) => {
    setGDriveSettings(newSettings);
    saveGDriveSettings(newSettings);
    showToast('Konfigurasi Google Drive berhasil disimpan.');
  };

  const handleSelectActiveDrive = (driveId: string) => {
    const updated: GDriveStorageSettings = {
      ...gdriveSettings,
      activeDriveId: driveId
    };
    setGDriveSettings(updated);
    saveGDriveSettings(updated);
    const drive = updated.drives.find(d => d.id === driveId);
    showToast(`Google Drive aktif dialihkan ke: ${drive ? drive.name : driveId}`);
  };

  const handleExportBackup = () => {
    const fullBackup = {
      exportDate: new Date().toISOString(),
      organization: 'Kwartir Ranting Gerakan Pramuka Tanah Sareal',
      gudepList,
      members,
      batches,
      archives,
      semesterReports
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SISKA_SIKAP_Backup_TanahSareal_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup basis data terpadu berhasil diekspor.');
  };

  return (
    <div className="min-h-screen bg-[#1A0E08] flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#28170F] text-stone-100 px-5 py-3.5 rounded-2xl shadow-xl border border-amber-500/40 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white ml-2 p-0.5 rounded-md hover:bg-stone-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW 1: PUBLIC PORTAL (HALAMAN UNTUK UMUM) */}
      {currentView === 'public' ? (
        <div>
          {/* Top Session Alert if logged in user is viewing public */}
          {currentUser && (
            <div className="bg-[#2A170F] border-b border-[#48291B] px-4 py-2 text-xs text-stone-200 flex flex-wrap items-center justify-between gap-2 print:hidden sticky top-0 z-50">
              <div className="flex items-center gap-2">
                <span className="text-base">{currentUser.avatarEmoji || (currentUser.role === 'pembina_gudep' ? '🏫' : '⚜️')}</span>
                <span>
                  Sesi Aktif: <strong className="text-amber-300">{currentUser.name}</strong> ({currentUser.roleTitle})
                  {currentUser.namaPangkalan && (
                    <span className="text-stone-300"> • {currentUser.namaPangkalan}</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('admin')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{currentUser.role === 'pembina_gudep' ? 'Buka Dashboard Gudep' : 'Buka Dashboard Pengurus'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 bg-[#382014] hover:bg-red-950/50 text-stone-300 hover:text-red-300 rounded-lg text-xs flex items-center gap-1 border border-[#502F1F]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}

          <PublicPortal
            gudepList={gudepList}
            members={members}
            archives={archives}
            secretariatContact={secretariatContact}
            heroBgConfig={heroBgConfig}
            pengurusList={pengurusList}
            onOpenHeroBgSettings={() => setIsHeroBgSettingsOpen(true)}
            onOpenLogin={() => {
              setLoginInitialTab('pengurus');
              setIsLoginModalOpen(true);
            }}
            onOpenGudepLogin={() => {
              setLoginInitialTab('gudep');
              setIsLoginModalOpen(true);
            }}
            onOpenVerifier={() => setIsVerifierOpen(true)}
            onViewMemberKta={(m) => setSelectedKtaMember(m)}
            onOpenRegistration={() => setIsGudepRegistrationOpen(true)}
          />
        </div>
      ) : currentUser?.role === 'pembina_gudep' ? (
        /* VIEW 2A: GUDEP MEMBER & PEMBINA DASHBOARD (KHUSUS ANGGOTA GUGUS DEPAN) */
        <GudepDashboard
          currentUser={currentUser}
          registration={
            registrations.find(r => 
              (currentUser.pangkalanId && r.id === currentUser.pangkalanId) ||
              (currentUser.username && r.akunGudep?.username?.toLowerCase() === currentUser.username.toLowerCase()) ||
              (currentUser.namaPangkalan && r.namaPangkalan?.toLowerCase() === currentUser.namaPangkalan.toLowerCase())
            )
          }
          gudep={
            gudepList.find(g => 
              (currentUser.pangkalanId && g.id === currentUser.pangkalanId) ||
              (currentUser.namaPangkalan && g.namaPangkalan?.toLowerCase() === currentUser.namaPangkalan.toLowerCase())
            )
          }
          members={members}
          batches={batches}
          onSaveMember={handleSaveMember}
          onDeleteMember={handleDeleteMember}
          onSaveBatch={handleSaveBatch}
          onLogout={handleLogout}
          onSwitchToPublic={handleSwitchToPublic}
          onUpdatePassword={handleUpdateGudepPassword}
          onSaveRegistration={handleSaveGudepRegistration}
        />
      ) : (
        /* VIEW 2B: PENGURUS MANAGEMENT (MENU PENGURUS KWARRAN) */
        <div className="flex-1 flex flex-col bg-[#F8F5F0] pb-24 lg:pb-0">
          {/* Main Pengurus Header / Navbar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenVerifier={() => setIsVerifierOpen(true)}
            onOpenAi={() => setIsAiOpen(true)}
            onExportBackup={handleExportBackup}
            currentUser={currentUser}
            onLogout={handleLogout}
            onSwitchToPublic={handleSwitchToPublic}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onOpenPengurusSettings={(section) => {
              setPengurusSettingsSection(section || 'credentials');
              setIsPengurusSettingsOpen(true);
            }}
            onOpenHeroBgSettings={() => setIsHeroBgSettingsOpen(true)}
            onOpenGDriveSettings={() => setIsGDriveSelectorOpen(true)}
            logoUrl={heroBgConfig.logoUrl}
          />

          {/* Pengurus Role Ribbon */}
          {currentUser && (
            <div className="bg-[#2B170F] text-stone-200 px-4 sm:px-6 lg:px-8 py-2 text-xs border-b border-[#462719] flex flex-wrap items-center justify-between gap-2 shadow-inner print:hidden">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-[#3C2216] text-amber-400">
                  <UserCheck className="w-3.5 h-3.5" />
                </span>
                <span className="text-stone-400">Mode Pengurus:</span>
                <strong className="text-white font-medium">{currentUser.name}</strong>
                <span className="text-amber-400 text-[11px] bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  {currentUser.roleTitle}
                </span>
                {currentUser.namaPangkalan && (
                  <span className="text-stone-400 hidden md:inline">
                    • Pangkalan: <strong className="text-stone-200">{currentUser.namaPangkalan}</strong>
                  </span>
                )}
                <button
                  onClick={() => {
                    setPengurusSettingsSection('credentials');
                    setIsPengurusSettingsOpen(true);
                  }}
                  className="ml-1 text-[11px] text-amber-300 hover:text-amber-200 underline flex items-center gap-1 font-semibold"
                  title="Atur username dan password login pengurus"
                >
                  (Atur Username & Password)
                </button>
                <button
                  onClick={() => {
                    setPengurusSettingsSection('pengurus');
                    setIsPengurusSettingsOpen(true);
                  }}
                  className="text-[11px] text-stone-400 hover:text-stone-200 underline flex items-center gap-1"
                  title="Ganti atau sesuaikan nama pengurus"
                >
                  (Ganti Nama Pengurus)
                </button>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <Cloud className="w-3 h-3 text-amber-400" />
                  <span>Realtime Cloud Synced</span>
                </div>

                <button
                  onClick={handleSwitchToPublic}
                  className="text-stone-300 hover:text-amber-300 flex items-center gap-1 font-semibold underline"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lihat Portal Umum</span>
                </button>
                <span className="text-stone-600">•</span>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Container Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'dashboard' && (
              <Dashboard
                gudepList={gudepList}
                members={members}
                batches={batches}
                archives={archives}
                setActiveTab={setActiveTab}
                onOpenVerifier={() => setIsVerifierOpen(true)}
                onOpenAi={() => setIsAiOpen(true)}
                onSelectMemberForKta={(m) => setSelectedKtaMember(m)}
              />
            )}

            {activeTab === 'gudep' && (
              <GudepManager
                gudepList={gudepList}
                members={members}
                registrations={registrations}
                onSaveGudep={handleSaveGudep}
                onDeleteGudep={handleDeleteGudep}
                onVerifyRegistration={handleVerifyRegistration}
                onDeleteRegistration={handleDeleteRegistration}
                onOpenRegistration={() => setIsGudepRegistrationOpen(true)}
                onNavigateToMembers={(search, gudepId, gol) => {
                  setMemberFilter({ search, gudepId, gol });
                  setActiveTab('members');
                }}
              />
            )}

            {activeTab === 'members' && (
              <MemberManager
                members={members}
                gudepList={gudepList}
                pengurusList={pengurusList}
                initialSearch={memberFilter.search}
                initialGudepId={memberFilter.gudepId}
                initialGolongan={memberFilter.gol}
                onSaveMember={handleSaveMember}
                onDeleteMember={handleDeleteMember}
                onOpenKtaModal={(m) => setSelectedKtaMember(m)}
                onSyncMembers={handleSyncMembers}
                onOpenPengurusSettings={() => setIsPengurusSettingsOpen(true)}
              />
            )}

            {activeTab === 'collective-kta' && (
              <CollectiveKtaManager
                batches={batches}
                gudepList={gudepList}
                members={members}
                onSaveBatch={handleSaveBatch}
                onUpdateBatchStatus={handleUpdateBatchStatus}
                onOpenKtaModal={(m) => setSelectedKtaMember(m)}
              />
            )}

            {activeTab === 'archives' && (
              <DigitalArchiveManager
                archives={archives}
                gudepList={gudepList}
                onSaveArchive={handleSaveArchive}
                onDeleteArchive={handleDeleteArchive}
                gdriveSettings={gdriveSettings}
                onOpenGDriveSettings={() => setIsGDriveSelectorOpen(true)}
                onSelectActiveDrive={handleSelectActiveDrive}
              />
            )}

            {activeTab === 'semester-report' && (
              <SemesterReportManager
                reports={semesterReports}
                gudepList={gudepList}
                members={members}
                onSaveReport={handleSaveSemesterReport}
                onDeleteReport={handleDeleteSemesterReport}
              />
            )}
          </main>

          {/* Footer Pengurus */}
          <footer className="bg-white border-t border-[#E5DFD5] mt-12 py-6 text-xs text-stone-600 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#28170F] text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                  ⚜️
                </div>
                <span className="font-medium">
                  <strong className="text-stone-900">SISKA - SIKAP</strong> • Kwartir Ranting Gerakan Pramuka Tanah Sareal Kota Bogor
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-stone-400 text-[11px] font-serif italic">
                  &ldquo;Satyaku Kudarmakan, Darmaku Kubaktikan&rdquo;
                </span>
                <button
                  onClick={handleResetData}
                  className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-amber-800 transition-colors font-semibold"
                  title="Reset data ke default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Data Standar
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* LOGIN MODAL (MENU LOGIN PENGURUS & AKUN ANGGOTA / GUDEP) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenPengurusSettings={() => {
          setPengurusSettingsSection('credentials');
          setIsPengurusSettingsOpen(true);
        }}
        pengurusList={pengurusList}
        existingRegistrations={registrations}
        initialTab={loginInitialTab}
        onOpenRegistration={() => setIsGudepRegistrationOpen(true)}
      />

      {/* PENGURUS SETTINGS MODAL (GANTI NAMA / AKUN PENGURUS & KONTAK WA) */}
      <PengurusSettingsModal
        isOpen={isPengurusSettingsOpen}
        onClose={() => setIsPengurusSettingsOpen(false)}
        initialSection={pengurusSettingsSection}
        currentUser={currentUser}
        members={members}
        onPengurusListUpdated={(newList) => {
          setPengurusList(newList);
        }}
        secretariatContact={secretariatContact}
        onUpdateSecretariatContact={(contact) => {
          setSecretariatContact(contact);
          showToast('Nomor WhatsApp & Kontak Sekretariat berhasil diperbarui secara realtime.');
        }}
        heroBgConfig={heroBgConfig}
        onUpdateHeroBgConfig={(bg) => {
          setHeroBgConfig(bg);
          saveHeroBackgroundConfig(bg);
          saveHeroBackgroundToCloud(bg);
          showToast('Pengaturan background & logo hero Kwarran berhasil diperbarui.');
        }}
        onUpdateCurrentUser={(updatedUser) => {
          setCurrentUser(updatedUser);
          setStoredAuthUser(updatedUser);
          showToast(`Data profil pengurus aktif (${updatedUser.name}) berhasil diperbarui.`);
        }}
        onOpenLogin={() => {
          setIsPengurusSettingsOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* HERO BACKGROUND & LOGO WATERMARK SETTINGS MODAL */}
      <HeroBackgroundSettingsModal
        isOpen={isHeroBgSettingsOpen}
        onClose={() => setIsHeroBgSettingsOpen(false)}
        config={heroBgConfig}
        onSave={(newConfig) => {
          setHeroBgConfig(newConfig);
          saveHeroBackgroundConfig(newConfig);
          saveHeroBackgroundToCloud(newConfig);
          showToast('Pengaturan background & logo watermark hero berhasil disimpan.');
        }}
      />

      {/* Single KTA Viewer / Card Modal */}
      {selectedKtaMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5] my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-[#28170F] text-white">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-stone-100">
                  Kartu Tanda Anggota (KTA) Digital
                </h3>
              </div>
              <button
                onClick={() => setSelectedKtaMember(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center space-y-4">
              <KtaCard 
                member={selectedKtaMember} 
                ketuaKwarran={pengurusList.find(p => p.role === 'ketua_kwarran') || pengurusList[0]}
              />
              
              <div className="w-full text-center text-xs text-stone-500 pt-3 border-t border-[#E5DFD5]">
                Kartu ini merupakan tanda pengenal resmi anggota Gerakan Pramuka Kwarran Tanah Sareal yang terintegrasi dengan database Kwarcab Kota Bogor.
              </div>

              <div className="flex justify-end w-full pt-1">
                <button
                  onClick={() => setSelectedKtaMember(null)}
                  className="px-5 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Verifier Modal */}
      <QrVerifierModal
        isOpen={isVerifierOpen}
        onClose={() => setIsVerifierOpen(false)}
        members={members}
        gudepList={gudepList}
        onSelectMember={(m) => setSelectedKtaMember(m)}
      />

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        gudepList={gudepList}
        members={members}
      />

      {/* Google Drive Archive Storage Selector Modal */}
      <GDriveSelectorModal
        isOpen={isGDriveSelectorOpen}
        onClose={() => setIsGDriveSelectorOpen(false)}
        settings={gdriveSettings}
        onUpdateSettings={handleUpdateGDriveSettings}
        onSelectActiveDrive={handleSelectActiveDrive}
      />

      {/* Public Gudep Registration Modal */}
      <GudepRegistrationModal
        isOpen={isGudepRegistrationOpen}
        onClose={() => setIsGudepRegistrationOpen(false)}
        onSubmit={handleSaveRegistration}
        onSubmitRegistration={handleSaveRegistration}
        gudepList={gudepList}
        registrations={registrations}
        existingRegistrations={registrations}
      />

      {/* MOBILE BOTTOM DASHBOARD NAVIGATION BAR */}
      <BottomNavigation
        currentView={currentView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVerifier={() => setIsVerifierOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenPengurusSettings={() => setIsPengurusSettingsOpen(true)}
        onOpenHeroBgSettings={() => setIsHeroBgSettingsOpen(true)}
        onOpenGDriveSettings={() => setIsGDriveSelectorOpen(true)}
        onSwitchToPublic={handleSwitchToPublic}
        onSwitchToAdmin={() => setCurrentView('admin')}
        currentUser={currentUser}
        onLogout={handleLogout}
        onExportBackup={handleExportBackup}
        memberCount={members.length}
        gudepCount={gudepList.length}
      />
    </div>
  );
}
