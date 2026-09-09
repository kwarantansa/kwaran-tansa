import { 
  Gudep, 
  Member, 
  CollectiveKtaBatch, 
  ArchiveDocument, 
  SemesterReport, 
  SecretariatContact,
  HeroBackgroundConfig,
  DEFAULT_HERO_BACKGROUND,
  GDriveFolderTarget,
  GDriveStorageSettings,
  DEFAULT_GDRIVE_SETTINGS,
  GudepRegistration,
  GudepActivityReport
} from '../types';
import { 
  INITIAL_GUDEP_LIST, 
  INITIAL_MEMBERS, 
  INITIAL_COLLECTIVE_BATCHES,
  INITIAL_ARCHIVES,
  INITIAL_SEMESTER_REPORTS
} from '../data/initialData';

export const DEFAULT_SECRETARIAT_CONTACT: SecretariatContact = {
  namaKwarran: 'Kwartir Ranting Gerakan Pramuka Tanah Sareal',
  alamat: 'Jl. Kebon Pedes No. 12, Kel. Kebon Pedes, Kec. Tanah Sareal, Kota Bogor, Jawa Barat',
  kelurahan: 'Kebon Pedes',
  kecamatan: 'Tanah Sareal',
  kota: 'Kota Bogor',
  kodePos: '16162',
  email: 'kwarran.tanahsareal@gmail.com',
  noWa: '081287654321',
  noTelepon: '(0251) 833-4455',
  jamLayanan: 'Senin - Jumat: 08.30 - 16.00 WIB • Sabtu: 09.00 - 13.00 WIB',
  pesanWaDefault: 'Halo Sekretariat Kwarran Tanah Sareal, saya ingin konsultasi layanan kepramukaan'
};

const STORAGE_KEYS = {
  GUDEP: 'siska_gudep_list_v1',
  MEMBERS: 'siska_members_list_v1',
  BATCHES: 'siska_collective_batches_v1',
  ARCHIVES: 'siska_digital_archives_v1',
  SEMESTER_REPORTS: 'siska_semester_reports_v1',
  SECRETARIAT_CONTACT: 'siska_secretariat_contact_v1',
  HERO_BACKGROUND: 'siska_hero_background_config_v1',
  GDRIVE_SETTINGS: 'siska_gdrive_storage_settings_v1',
  REGISTRATIONS: 'siska_gudep_registrations_v1',
  ACTIVITY_REPORTS: 'siska_gudep_activity_reports_v1',
  LAST_SYNC: 'siska_last_sync_timestamp',
};

// Automatic one-time cleanup of stale local mock data for clean registration-only workflow
const CLEAN_STORAGE_VERSION_KEY = 'siska_clean_db_v2026_empty_v2';
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(CLEAN_STORAGE_VERSION_KEY)) {
      localStorage.removeItem(STORAGE_KEYS.GUDEP);
      localStorage.removeItem(STORAGE_KEYS.MEMBERS);
      localStorage.removeItem(STORAGE_KEYS.REGISTRATIONS);
      localStorage.removeItem(STORAGE_KEYS.BATCHES);
      localStorage.setItem(CLEAN_STORAGE_VERSION_KEY, 'true');
    }
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }
}

export const INITIAL_GUDEP_REGISTRATIONS: GudepRegistration[] = [];

export const loadGudepRegistrations = (): GudepRegistration[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stored Gudep registrations:', err);
    return [];
  }
};

export const saveGudepRegistrations = (data: GudepRegistration[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving Gudep registrations:', err);
  }
};

export const loadRegistrations = loadGudepRegistrations;
export const saveRegistrations = saveGudepRegistrations;

export const getStoredGudep = (): Gudep[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUDEP);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stored Gudep:', err);
    return [];
  }
};

export const saveStoredGudep = (data: Gudep[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GUDEP, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving Gudep data:', err);
  }
};

/**
 * Sinkronisasi Ka Mabigus dan Pembina Gudep ke Pusat Data Anggota (Member List).
 * Menjamin bahwa seluruh Ketua Mabigus dan Pembina Gudep Putra/Putri dari SISKA
 * otomatis terdata di menu Sinkronisasi Anggota.
 */
export const syncGudepLeadersWithMembers = (_gudepList: Gudep[], currentMembers: Member[]): Member[] => {
  return currentMembers;
};

const _unusedOldSync = (_gudepList: Gudep[], currentMembers: Member[]): Member[] => {
  let updated = [...currentMembers];
  let changed = false;

  const isFemaleName = (name: string): boolean => {
    const lower = name.toLowerCase();
    return (
      lower.includes('dra.') ||
      lower.includes('hj.') ||
      lower.includes('siti') ||
      lower.includes('dewi') ||
      lower.includes('nurul') ||
      lower.includes('rina') ||
      lower.includes('endang') ||
      lower.includes('fitria') ||
      lower.includes('nadia') ||
      lower.includes('halimah') ||
      lower.includes('ira') ||
      lower.includes('ratna') ||
      lower.includes('maya') ||
      lower.includes('tantri') ||
      lower.includes('warsiti') ||
      lower.includes('mimin') ||
      lower.includes('eni') ||
      lower.includes('rohmah') ||
      lower.includes('maryam') ||
      lower.includes('wahyuningsih') ||
      lower.includes('mustika') ||
      lower.includes('anggraini') ||
      lower.includes('wulandari') ||
      lower.includes('safitri') ||
      lower.includes('tusadiah')
    );
  };

  for (const g of gudepList) {
    const rawNoPa = g.noGudepPa ? g.noGudepPa.replace(/[^0-9]/g, '') : '071';
    const rawNoPi = g.noGudepPi ? g.noGudepPi.replace(/[^0-9]/g, '') : '072';

    // 1. Sinkronisasi Ketua Mabigus (Kepala Sekolah)
    if (g.kaMabigus && g.kaMabigus.trim()) {
      const cleanName = g.kaMabigus.trim();
      const existingIndex = updated.findIndex(m => 
        (m.gudepId === g.id && (m.golongan === 'Mabigus' || m.jabatan?.toLowerCase().includes('mabigus') || m.tingkatan?.toLowerCase().includes('mabigus'))) ||
        (m.gudepId === g.id && m.namaLengkap.toLowerCase().trim() === cleanName.toLowerCase().trim()) ||
        m.id === `mem-mabigus-${g.id}`
      );

      if (existingIndex === -1) {
        const isP = isFemaleName(cleanName);
        const newMabigus: Member = {
          id: `mem-mabigus-${g.id}`,
          nta: `09.02.04.${rawNoPa}.0001`,
          nik: `327103${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          namaLengkap: cleanName,
          jenisKelamin: isP ? 'P' : 'L',
          tempatLahir: 'Bogor',
          tanggalLahir: '1974-05-12',
          agama: 'Islam',
          golongan: 'Mabigus',
          tingkatan: 'Ketua Mabigus',
          jabatan: 'Ketua Mabigus',
          gudepId: g.id,
          namaPangkalan: g.namaPangkalan,
          noGudep: g.noGudepPa,
          kelurahan: g.kelurahan,
          alamatRumah: g.alamat || `Kel. ${g.kelurahan}, Kec. Tanah Sareal, Kota Bogor`,
          noTelepon: g.kontakHp || '0812-8765-4321',
          fotoUrl: isP
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&fit=crop&crop=face'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&crop=face',
          golonganDarah: 'O',
          statusKta: 'Sudah Terbit',
          statusSync: g.statusSync || 'Tersinkronisasi',
          berlakuKtaSampai: '2029-08-14',
          tanggalBergabung: `${g.tahunBerdiri || 2010}-07-15`
        };
        updated.push(newMabigus);
        changed = true;
      } else {
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          namaLengkap: cleanName,
          namaPangkalan: g.namaPangkalan,
          noGudep: g.noGudepPa,
          kelurahan: g.kelurahan,
          golongan: 'Mabigus',
          tingkatan: existing.tingkatan || 'Ketua Mabigus',
          jabatan: 'Ketua Mabigus',
          statusSync: g.statusSync || existing.statusSync
        };
        changed = true;
      }
    }

    // 2. Sinkronisasi Pembina Gudep Putra
    if (g.pembinaGudepPa && g.pembinaGudepPa.trim()) {
      const rawPa = g.pembinaGudepPa.trim();
      const cleanNamePa = rawPa.replace(/\s*\([^)]*\)/g, '').trim() || rawPa;
      const kualifikasi = rawPa.includes('KPL') ? 'KPL' : rawPa.includes('KPD') ? 'KPD' : rawPa.includes('KML') ? 'KML' : 'KMD';
      const isPelatih = rawPa.includes('Pelatih') || rawPa.includes('KPD') || rawPa.includes('KPL');

      const existingIndex = updated.findIndex(m => 
        (m.gudepId === g.id && m.jenisKelamin === 'L' && (m.golongan === 'Pembina' || m.golongan === 'Pelatih')) ||
        (m.gudepId === g.id && m.namaLengkap.toLowerCase().trim() === cleanNamePa.toLowerCase().trim()) ||
        m.id === `mem-pembina-pa-${g.id}`
      );

      if (existingIndex === -1) {
        const newPembinaPa: Member = {
          id: `mem-pembina-pa-${g.id}`,
          nta: `09.02.04.${rawNoPa}.0002`,
          nik: `327103${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          namaLengkap: cleanNamePa,
          jenisKelamin: 'L',
          tempatLahir: 'Bogor',
          tanggalLahir: '1982-04-18',
          agama: 'Islam',
          golongan: isPelatih ? 'Pelatih' : 'Pembina',
          tingkatan: isPelatih 
            ? (kualifikasi === 'KPL' ? 'Pelatih Lanjutan (KPL)' : 'Pelatih Dasar (KPD)')
            : (kualifikasi === 'KML' ? 'Pembina Mahir Lanjutan (KML)' : 'Pembina Mahir Dasar (KMD)'),
          jabatan: 'Pembina Gudep Putra',
          gudepId: g.id,
          namaPangkalan: g.namaPangkalan,
          noGudep: g.noGudepPa,
          kelurahan: g.kelurahan,
          alamatRumah: `Kel. ${g.kelurahan}, Kec. Tanah Sareal, Kota Bogor`,
          noTelepon: g.kontakHp || '0812-3344-5566',
          fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&crop=face',
          golonganDarah: 'B',
          statusKta: 'Sudah Terbit',
          statusSync: g.statusSync || 'Tersinkronisasi',
          kualifikasiKursus: kualifikasi as any,
          berlakuKtaSampai: '2028-08-14',
          tanggalBergabung: '2016-07-20'
        };
        updated.push(newPembinaPa);
        changed = true;
      } else {
        const existing = updated[existingIndex];
        if (!existing.jabatan) {
          updated[existingIndex] = {
            ...existing,
            jabatan: 'Pembina Gudep Putra'
          };
          changed = true;
        }
      }
    }

    // 3. Sinkronisasi Pembina Gudep Putri
    if (g.pembinaGudepPi && g.pembinaGudepPi.trim()) {
      const rawPi = g.pembinaGudepPi.trim();
      const cleanNamePi = rawPi.replace(/\s*\([^)]*\)/g, '').trim() || rawPi;
      const kualifikasi = rawPi.includes('KPL') ? 'KPL' : rawPi.includes('KPD') ? 'KPD' : rawPi.includes('KML') ? 'KML' : 'KMD';
      const isPelatih = rawPi.includes('Pelatih') || rawPi.includes('KPD') || rawPi.includes('KPL');

      const existingIndex = updated.findIndex(m => 
        (m.gudepId === g.id && m.jenisKelamin === 'P' && (m.golongan === 'Pembina' || m.golongan === 'Pelatih')) ||
        (m.gudepId === g.id && m.namaLengkap.toLowerCase().trim() === cleanNamePi.toLowerCase().trim()) ||
        m.id === `mem-pembina-pi-${g.id}`
      );

      if (existingIndex === -1) {
        const newPembinaPi: Member = {
          id: `mem-pembina-pi-${g.id}`,
          nta: `09.02.04.${rawNoPi}.0003`,
          nik: `327103${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          namaLengkap: cleanNamePi,
          jenisKelamin: 'P',
          tempatLahir: 'Bogor',
          tanggalLahir: '1988-08-25',
          agama: 'Islam',
          golongan: isPelatih ? 'Pelatih' : 'Pembina',
          tingkatan: isPelatih 
            ? (kualifikasi === 'KPL' ? 'Pelatih Lanjutan (KPL)' : 'Pelatih Dasar (KPD)')
            : (kualifikasi === 'KML' ? 'Pembina Mahir Lanjutan (KML)' : 'Pembina Mahir Dasar (KMD)'),
          jabatan: 'Pembina Gudep Putri',
          gudepId: g.id,
          namaPangkalan: g.namaPangkalan,
          noGudep: g.noGudepPi,
          kelurahan: g.kelurahan,
          alamatRumah: `Kel. ${g.kelurahan}, Kec. Tanah Sareal, Kota Bogor`,
          noTelepon: g.kontakHp || '0813-9988-7766',
          fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&fit=crop&crop=face',
          golonganDarah: 'A',
          statusKta: 'Sudah Terbit',
          statusSync: g.statusSync || 'Tersinkronisasi',
          kualifikasiKursus: kualifikasi as any,
          berlakuKtaSampai: '2029-08-14',
          tanggalBergabung: '2018-01-15'
        };
        updated.push(newPembinaPi);
        changed = true;
      } else {
        const existing = updated[existingIndex];
        if (!existing.jabatan) {
          updated[existingIndex] = {
            ...existing,
            jabatan: 'Pembina Gudep Putri'
          };
          changed = true;
        }
      }
    }
  }

  return updated;
};

export const getStoredMembers = (): Member[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stored Members:', err);
    return [];
  }
};

export const saveStoredMembers = (data: Member[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving Members data:', err);
  }
};

export const getStoredBatches = (): CollectiveKtaBatch[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stored Batches:', err);
    return [];
  }
};

export const saveStoredBatches = (data: CollectiveKtaBatch[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving Batches data:', err);
  }
};

export const getStoredArchives = (): ArchiveDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ARCHIVES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(INITIAL_ARCHIVES));
      return INITIAL_ARCHIVES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stored Archives:', err);
    return INITIAL_ARCHIVES;
  }
};

export const saveStoredArchives = (data: ArchiveDocument[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving Archives data:', err);
  }
};

export const getStoredSemesterReports = (): SemesterReport[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEMESTER_REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SEMESTER_REPORTS, JSON.stringify(INITIAL_SEMESTER_REPORTS));
      return INITIAL_SEMESTER_REPORTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading stored Semester Reports:', err);
    return INITIAL_SEMESTER_REPORTS;
  }
};

export const saveStoredSemesterReports = (data: SemesterReport[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SEMESTER_REPORTS, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving Semester Reports data:', err);
  }
};

export const getStoredSecretariatContact = (): SecretariatContact => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SECRETARIAT_CONTACT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SECRETARIAT_CONTACT, JSON.stringify(DEFAULT_SECRETARIAT_CONTACT));
      return DEFAULT_SECRETARIAT_CONTACT;
    }
    return { ...DEFAULT_SECRETARIAT_CONTACT, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error reading stored Secretariat Contact:', err);
    return DEFAULT_SECRETARIAT_CONTACT;
  }
};

export const saveStoredSecretariatContact = (data: SecretariatContact) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SECRETARIAT_CONTACT, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving Secretariat Contact data:', err);
  }
};

export const getStoredHeroBackground = (): HeroBackgroundConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HERO_BACKGROUND);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HERO_BACKGROUND, JSON.stringify(DEFAULT_HERO_BACKGROUND));
      return DEFAULT_HERO_BACKGROUND;
    }
    const parsed = JSON.parse(raw);
    // Automatically upgrade legacy placeholder paths to the official Kwarran 0917-06 logo
    if (!parsed.logoUrl || parsed.logoUrl === '/logo-kwarran-tanah-sareal.jpg') {
      parsed.logoUrl = '/logo-kwarran-tanah-sareal.png';
      parsed.logoTitle = 'Logo Resmi Kwarran 0917-06 Tanah Sareal';
      localStorage.setItem(STORAGE_KEYS.HERO_BACKGROUND, JSON.stringify({ ...DEFAULT_HERO_BACKGROUND, ...parsed }));
    }
    return { ...DEFAULT_HERO_BACKGROUND, ...parsed };
  } catch (err) {
    console.error('Error reading stored Hero Background config:', err);
    return DEFAULT_HERO_BACKGROUND;
  }
};

export const saveStoredHeroBackground = (data: HeroBackgroundConfig) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HERO_BACKGROUND, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving Hero Background config:', err);
  }
};

export const getStoredGDriveSettings = (): GDriveStorageSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GDRIVE_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GDRIVE_SETTINGS, JSON.stringify(DEFAULT_GDRIVE_SETTINGS));
      return DEFAULT_GDRIVE_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_GDRIVE_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Error reading stored GDrive settings:', err);
    return DEFAULT_GDRIVE_SETTINGS;
  }
};

export const saveStoredGDriveSettings = (data: GDriveStorageSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GDRIVE_SETTINGS, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving GDrive settings:', err);
  }
};

export const getActiveGDrive = (): GDriveFolderTarget => {
  const settings = getStoredGDriveSettings();
  const found = settings.drives.find(d => d.id === settings.activeDriveId);
  return found || settings.drives[0] || DEFAULT_GDRIVE_SETTINGS.drives[0];
};

export const setActiveGDriveId = (driveId: string): GDriveStorageSettings => {
  const settings = getStoredGDriveSettings();
  const updatedDrives = settings.drives.map(d => ({
    ...d,
    isDefault: d.id === driveId,
    terakhirDigunakan: d.id === driveId ? 'Baru saja diaktifkan' : d.terakhirDigunakan
  }));
  const updatedSettings: GDriveStorageSettings = {
    ...settings,
    activeDriveId: driveId,
    drives: updatedDrives
  };
  saveStoredGDriveSettings(updatedSettings);
  return updatedSettings;
};

export const getLastSyncTime = (): string => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '2026-09-02 08:30 WIB';
};

export const setLastSyncTime = (timestamp: string) => {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
};

// Aliases for convenient importing
export const loadGudepList = getStoredGudep;
export const saveGudepList = saveStoredGudep;
export const loadMemberList = getStoredMembers;
export const saveMemberList = saveStoredMembers;
export const loadBatchesList = getStoredBatches;
export const saveBatchesList = saveStoredBatches;
export const loadArchives = getStoredArchives;
export const saveArchives = saveStoredArchives;
export const loadSemesterReports = getStoredSemesterReports;
export const saveSemesterReports = saveStoredSemesterReports;
export const loadSecretariatContact = getStoredSecretariatContact;
export const saveSecretariatContact = saveStoredSecretariatContact;
export const loadHeroBackgroundConfig = getStoredHeroBackground;
export const saveHeroBackgroundConfig = saveStoredHeroBackground;
export const loadGDriveSettings = getStoredGDriveSettings;
export const saveGDriveSettings = saveStoredGDriveSettings;

// Reset to clean data
export const resetToDefaultData = () => {
  localStorage.setItem(STORAGE_KEYS.GUDEP, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(INITIAL_ARCHIVES));
  localStorage.setItem(STORAGE_KEYS.SEMESTER_REPORTS, JSON.stringify(INITIAL_SEMESTER_REPORTS));
  localStorage.setItem(STORAGE_KEYS.GDRIVE_SETTINGS, JSON.stringify(DEFAULT_GDRIVE_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toLocaleString('id-ID'));
};

export const resetToInitialData = resetToDefaultData;

// Export all data as JSON
export const exportBackupJson = () => {
  const backup = {
    exportDate: new Date().toISOString(),
    kwarran: 'Tanah Sareal',
    kwarcab: 'Kota Bogor',
    kwarda: 'Jawa Barat',
    system: 'SISKA-SIKAP v2.0',
    gudep: getStoredGudep(),
    members: getStoredMembers(),
    collectiveBatches: getStoredBatches(),
    digitalArchives: getStoredArchives(),
    semesterReports: getStoredSemesterReports(),
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SISKA_SIKAP_Backup_Kwarran_Tanah_Sareal_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export Archives CSV
export const exportArchivesCsv = (archives: ArchiveDocument[]) => {
  const headers = [
    'Nomor Dokumen',
    'Judul Dokumen',
    'Kategori',
    'Tanggal Terbit',
    'Tahun',
    'Instansi Penerbit',
    'Pangkalan Terkait',
    'Format File',
    'Ukuran',
    'Status Arsip',
    'Level Akses',
    'Tautan Cloud / Spreadsheet',
    'Diunggah Oleh'
  ];

  const rows = archives.map(a => [
    `"${a.nomorDokumen}"`,
    `"${a.judul.replace(/"/g, '""')}"`,
    `"${a.kategori}"`,
    `"${a.tanggalTerbit}"`,
    `"${a.tahun}"`,
    `"${a.instansiPenerbit.replace(/"/g, '""')}"`,
    `"${(a.pangkalanTerkait || '-').replace(/"/g, '""')}"`,
    `"${a.fileType}"`,
    `"${a.fileSize}"`,
    `"${a.statusArsip}"`,
    `"${a.aksesLevel}"`,
    `"${a.cloudStorageUrl}"`,
    `"${a.diunggahOleh}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Arsip_Digital_Kwarran_Tanah_Sareal_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export Members CSV
export const exportMembersCsv = (members: Member[]) => {
  const headers = [
    'NTA',
    'NIK',
    'Nama Lengkap',
    'Jenis Kelamin',
    'Golongan',
    'Tingkatan',
    'Pangkalan',
    'No Gudep',
    'Kelurahan',
    'No Telepon',
    'Status KTA',
    'Status Sinkronisasi',
    'Kualifikasi Kursus',
    'Masa Berlaku KTA'
  ];

  const rows = members.map(m => [
    `"${m.nta}"`,
    `"${m.nik}"`,
    `"${m.namaLengkap.replace(/"/g, '""')}"`,
    `"${m.jenisKelamin}"`,
    `"${m.golongan}"`,
    `"${m.tingkatan}"`,
    `"${m.namaPangkalan.replace(/"/g, '""')}"`,
    `"${m.noGudep}"`,
    `"${m.kelurahan}"`,
    `"${m.noTelepon}"`,
    `"${m.statusKta}"`,
    `"${m.statusSync}"`,
    `"${m.kualifikasiKursus || '-'}"`,
    `"${m.berlakuKtaSampai}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Data_Anggota_Pramuka_Tanah_Sareal_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const INITIAL_GUDEP_ACTIVITY_REPORTS: GudepActivityReport[] = [
  {
    id: 'act-rep-001',
    pangkalanId: 'reg-gudep-sdnkebonpedes1',
    namaPangkalan: 'SDN Kebon Pedes 1',
    nomorGudep: '04.071 / 04.072',
    judul: 'Latihan Rutin & Persiapan Ujian SKU Penggalang Ramu',
    tanggalKegiatan: '2026-08-28',
    kategori: 'Latihan Rutin',
    tempat: 'Halaman Pangkalan SDN Kebon Pedes 1',
    jumlahPeserta: 48,
    ringkasan: 'Materi latihan teknik semaphore, tali-temali (simpul mati, simpul hidup, simpul pangkal), serta pengenalan dasa darma pramuka untuk regu rajawali dan mawar.',
    dokumenUrl: 'https://drive.google.com',
    diunggahOleh: 'Kak Budi Santoso, S.Pd.',
    terakhirDiperbarui: '2026-08-28 17:00'
  },
  {
    id: 'act-rep-002',
    pangkalanId: 'reg-gudep-sdnkebonpedes1',
    namaPangkalan: 'SDN Kebon Pedes 1',
    nomorGudep: '04.071 / 04.072',
    judul: 'Perkemahan Sabtu Minggu (Persami) Karakter Disiplin',
    tanggalKegiatan: '2026-07-18',
    kategori: 'Perkemahan / Persami',
    tempat: 'Bumi Perkemahan Cimandala / Lapangan Pangkalan',
    jumlahPeserta: 65,
    ringkasan: 'Penyelenggaraan perkemahan penggalang dengan agenda api unggun, penjelajahan halang rintang, bakti lingkungan bersih, dan pelantikan SKU Penggalang Ramu.',
    dokumenUrl: 'https://drive.google.com',
    diunggahOleh: 'Kak Budi Santoso, S.Pd.',
    terakhirDiperbarui: '2026-07-20 10:30'
  }
];

export const getStoredGudepActivityReports = (): GudepActivityReport[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_REPORTS, JSON.stringify(INITIAL_GUDEP_ACTIVITY_REPORTS));
      return INITIAL_GUDEP_ACTIVITY_REPORTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading Gudep activity reports:', err);
    return INITIAL_GUDEP_ACTIVITY_REPORTS;
  }
};

export const saveStoredGudepActivityReports = (data: GudepActivityReport[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_REPORTS, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving Gudep activity reports:', err);
  }
};

export const loadGudepActivityReports = getStoredGudepActivityReports;
export const saveGudepActivityReports = saveStoredGudepActivityReports;
