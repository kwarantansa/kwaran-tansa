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
 * Helper to clean and format nomor gudep digits
 */
function cleanNoGudep(no: string | undefined, defaultNum: string): string {
  if (!no) return defaultNum;
  const digits = no.replace(/[^0-9]/g, '');
  return digits.length >= 3 ? digits.slice(-3) : digits.padStart(3, '0');
}

/**
 * Generate synthetic deterministic 16-digit NIK
 */
function generateSyntheticNik(name: string, seed: string = '327103'): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash).toString().padStart(10, '0').slice(0, 10);
  return `${seed.slice(0, 6)}${positive}`;
}

/**
 * Normalisasi nama orang untuk pencocokan akurat (menghapus gelar, panggilan, dll).
 */
export const normalizePersonName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(kak|kakak|bapak|ibu|pak|bu|dr|dra|drs|h\.|hj\.|ir\.|prof\.)\s+/i, '')
    .replace(/,\s*(s\.pd|m\.pd|s\.kom|s\.e|s\.si|m\.m|m\.si|ph\.d|dr|s\.t|m\.t|s\.ag).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Normalisasi nama pangkalan (menghapus prefiks gudep/pangkalan/kota bogor/singkatan negeri).
 */
export const normalizePangkalanName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(gugus\s*depan|gudep|pangkalan)\s+/i, '')
    .replace(/\s+/g, ' ')
    .replace(/negeri/g, 'n')
    .replace(/kota\s+bogor/g, '')
    .trim();
};

/**
 * Cek apakah seorang anggota terdaftar pada Gudep yang ada di menu Pendataan Gudep.
 */
export const isMemberGudepExisting = (m: Member, gudepList: Gudep[]): boolean => {
  if (!gudepList || gudepList.length === 0) return true; // Hindari salah hapus jika list gudep belum termuat

  return gudepList.some(g => {
    // 1. Cocok ID Gudep langsung
    if (m.gudepId && m.gudepId === g.id) return true;

    // 2. Cocok nama pangkalan
    if (m.namaPangkalan && g.namaPangkalan) {
      const p1 = normalizePangkalanName(m.namaPangkalan);
      const p2 = normalizePangkalanName(g.namaPangkalan);
      if (p1 === p2) return true;
      if (p1.length >= 4 && p2.length >= 4 && (p1.includes(p2) || p2.includes(p1))) return true;
    }

    // 3. Cocok nomor gudep
    if (m.noGudep) {
      const cleanM = m.noGudep.replace(/[^0-9]/g, '');
      const paClean = (g.noGudepPa || '').replace(/[^0-9]/g, '');
      const piClean = (g.noGudepPi || '').replace(/[^0-9]/g, '');
      if (paClean && cleanM.includes(paClean)) return true;
      if (piClean && cleanM.includes(piClean)) return true;
    }

    return false;
  });
};

export interface CleanMembersResult {
  cleanedMembers: Member[];
  removedMemberIds: string[];
  orphanCount: number;
  duplicateCount: number;
}

/**
 * Hapus anggota di buku induk yang tidak ada data gudepnya di menu pendataan gudep,
 * serta bersihkan data duplikat (misal duplikat nama atau data pemimpin gudep ganda).
 */
export const cleanOrphanAndDuplicateMembers = (
  currentMembers: Member[],
  gudepList: Gudep[]
): CleanMembersResult => {
  if (!gudepList || gudepList.length === 0 || !currentMembers || currentMembers.length === 0) {
    return {
      cleanedMembers: currentMembers || [],
      removedMemberIds: [],
      orphanCount: 0,
      duplicateCount: 0
    };
  }

  const removedMemberIds: string[] = [];
  let orphanCount = 0;
  let duplicateCount = 0;

  // 1. Filter: Hapus anggota yang TIDAK memiliki pangkalan di Pendataan Gudep
  const withValidGudep: Member[] = [];

  for (const m of currentMembers) {
    const hasGudep = isMemberGudepExisting(m, gudepList);
    if (!hasGudep) {
      removedMemberIds.push(m.id);
      orphanCount++;
    } else {
      // Hubungkan ke gudep resmi di menu Pendataan Gudep
      const matchedGudep = gudepList.find(g => 
        g.id === m.gudepId ||
        (m.namaPangkalan && g.namaPangkalan && (
          normalizePangkalanName(m.namaPangkalan) === normalizePangkalanName(g.namaPangkalan) ||
          normalizePangkalanName(m.namaPangkalan).includes(normalizePangkalanName(g.namaPangkalan)) ||
          normalizePangkalanName(g.namaPangkalan).includes(normalizePangkalanName(m.namaPangkalan))
        ))
      );

      if (matchedGudep) {
        withValidGudep.push({
          ...m,
          gudepId: matchedGudep.id,
          namaPangkalan: matchedGudep.namaPangkalan
        });
      } else {
        withValidGudep.push(m);
      }
    }
  }

  // 2. Filter: Bersihkan data duplikat dalam satu Gudep
  const cleanedMembers: Member[] = [];
  const seenMap = new Map<string, Member>();

  for (const m of withValidGudep) {
    const normName = normalizePersonName(m.namaLengkap);
    const pangkalanKey = m.gudepId || normalizePangkalanName(m.namaPangkalan);
    const uniqueKey = `${pangkalanKey}:::${normName}`;

    if (!seenMap.has(uniqueKey)) {
      seenMap.set(uniqueKey, m);
    } else {
      duplicateCount++;
      const existing = seenMap.get(uniqueKey)!;

      // Jika salah satunya adalah data sintetis ('leader-...') dan satu lagi data riil,
      // HAPUS yang sintetis dan pertahankan yang asli riil
      const isMSynthetic = m.id.startsWith('leader-');
      const isExistingSynthetic = existing.id.startsWith('leader-');

      if (isMSynthetic && !isExistingSynthetic) {
        removedMemberIds.push(m.id);
      } else if (!isMSynthetic && isExistingSynthetic) {
        removedMemberIds.push(existing.id);
        seenMap.set(uniqueKey, m);
      } else {
        // Keduanya riil atau keduanya sintetis: simpan yang datanya paling lengkap (NTA / NIK / Foto)
        const scoreM = (m.nik && m.nik.length >= 10 ? 3 : 0) + (m.nta && !m.nta.includes('NaN') ? 2 : 0) + (m.fotoUrl ? 1 : 0);
        const scoreE = (existing.nik && existing.nik.length >= 10 ? 3 : 0) + (existing.nta && !existing.nta.includes('NaN') ? 2 : 0) + (existing.fotoUrl ? 1 : 0);

        if (scoreM > scoreE) {
          removedMemberIds.push(existing.id);
          seenMap.set(uniqueKey, m);
        } else {
          removedMemberIds.push(m.id);
        }
      }
    }
  }

  seenMap.forEach(m => cleanedMembers.push(m));

  return {
    cleanedMembers,
    removedMemberIds,
    orphanCount,
    duplicateCount
  };
};

/**
 * Sinkronisasi Ka Mabigus dan Pembina Gudep ke Pusat Data Anggota (Buku Induk Anggota).
 * Menjamin bahwa seluruh Ketua Mabigus dan Pembina Gudep Putra/Putri dari Buku Induk Pangkalan / Registrasi
 * otomatis terdaftar resmi di menu Sinkronisasi Anggota (Buku Induk Anggota) tanpa duplikasi.
 */
export const syncGudepLeadersWithMembers = (
  gudepList: Gudep[], 
  currentMembers: Member[],
  registrations?: GudepRegistration[]
): Member[] => {
  if (!gudepList || gudepList.length === 0) {
    return currentMembers;
  }

  const regs = registrations || loadGudepRegistrations();
  const result: Member[] = [...currentMembers];
  let hasChanged = false;

  for (const g of gudepList) {
    if (!g.namaPangkalan) continue;
    const normPangkalan = normalizePangkalanName(g.namaPangkalan);

    // Cari pendaftaran terkait jika ada
    const matchingReg = regs.find(r => 
      (r.namaPangkalan && normalizePangkalanName(r.namaPangkalan) === normPangkalan) ||
      (r.noGudepPa && g.noGudepPa && r.noGudepPa === g.noGudepPa)
    );

    const cleanPa = cleanNoGudep(g.noGudepPa, '071');
    const cleanPi = cleanNoGudep(g.noGudepPi, '072');

    // 1. Sinkronisasi Ka Mabigus (Kepala Pangkalan / Sekolah)
    const rawKaMabigus = (g.kaMabigus || matchingReg?.kaMabigus || '').trim();
    if (rawKaMabigus && rawKaMabigus !== '-' && !rawKaMabigus.toLowerCase().startsWith('belum')) {
      const normKaMabigus = normalizePersonName(rawKaMabigus);

      const existingMabigusIndex = result.findIndex(m => {
        const sameGudep = m.gudepId === g.id || (m.namaPangkalan && normalizePangkalanName(m.namaPangkalan) === normPangkalan);
        if (!sameGudep) return false;
        return (
          normalizePersonName(m.namaLengkap) === normKaMabigus ||
          m.golongan === 'Mabigus' ||
          m.tingkatan === 'Ketua Mabigus' ||
          (m.jabatan && m.jabatan.toLowerCase().includes('mabigus'))
        );
      });

      if (existingMabigusIndex >= 0) {
        const existing = result[existingMabigusIndex];
        // Pastikan relasi gudepId dan nama pangkalan sinkron
        if (existing.gudepId !== g.id || existing.namaPangkalan !== g.namaPangkalan || existing.namaLengkap !== rawKaMabigus) {
          result[existingMabigusIndex] = {
            ...existing,
            gudepId: g.id,
            namaPangkalan: g.namaPangkalan,
            namaLengkap: existing.namaLengkap || rawKaMabigus,
            noGudep: g.noGudepPa && g.noGudepPi ? `${g.noGudepPa} / ${g.noGudepPi}` : (g.noGudepPa || existing.noGudep),
            kelurahan: g.kelurahan || existing.kelurahan,
            golongan: 'Mabigus',
            tingkatan: 'Ketua Mabigus'
          };
          hasChanged = true;
        }
      } else {
        // Buat data anggota baru untuk Ka Mabigus
        const newMabigus: Member = {
          id: `leader-${g.id}-mabigus`,
          nta: `09.02.04.${cleanPa}.0001`,
          nik: generateSyntheticNik(rawKaMabigus, '327103750101'),
          namaLengkap: rawKaMabigus,
          jenisKelamin: 'L',
          tempatLahir: 'Bogor',
          tanggalLahir: '1975-05-12',
          agama: 'Islam',
          golongan: 'Mabigus',
          tingkatan: 'Ketua Mabigus',
          jabatan: matchingReg?.jabatanKaMabigus || 'Ketua Majelis Pembimbing Gugus Depan (Ka Mabigus)',
          gudepId: g.id,
          namaPangkalan: g.namaPangkalan,
          noGudep: g.noGudepPa && g.noGudepPi ? `${g.noGudepPa} / ${g.noGudepPi}` : (g.noGudepPa || '04.071'),
          kelurahan: g.kelurahan || 'Tanah Sareal',
          alamatRumah: g.alamat || 'Kecamatan Tanah Sareal, Kota Bogor',
          noTelepon: matchingReg?.noHpKaMabigus || g.kontakHp || '081287654321',
          fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          statusKta: 'Sudah Terbit',
          statusSync: 'Tersinkronisasi',
          kualifikasiKursus: 'KML',
          berlakuKtaSampai: '2028-12-31',
          tanggalBergabung: `${g.tahunBerdiri || 2020}-01-01`,
          inputSource: 'gudep',
          inputBy: g.namaPangkalan,
          inputDate: g.terakhirDiperbarui || new Date().toISOString().slice(0, 10)
        };
        result.push(newMabigus);
        hasChanged = true;
      }
    }

    // 2. Sinkronisasi Pembina Gudep Putra
    const rawPembinaPa = (g.pembinaGudepPa || matchingReg?.namaPembinaPa || '').trim();
    if (rawPembinaPa && rawPembinaPa !== '-' && !rawPembinaPa.toLowerCase().startsWith('belum')) {
      const normPembinaPa = normalizePersonName(rawPembinaPa);

      const existingPaIndex = result.findIndex(m => {
        const sameGudep = m.gudepId === g.id || (m.namaPangkalan && normalizePangkalanName(m.namaPangkalan) === normPangkalan);
        if (!sameGudep) return false;
        return (
          normalizePersonName(m.namaLengkap) === normPembinaPa ||
          (m.jenisKelamin === 'L' && (m.golongan === 'Pembina' || (m.jabatan && m.jabatan.toLowerCase().includes('pembina pa'))))
        );
      });

      if (existingPaIndex >= 0) {
        const existing = result[existingPaIndex];
        if (existing.gudepId !== g.id || existing.namaPangkalan !== g.namaPangkalan || existing.namaLengkap !== rawPembinaPa) {
          result[existingPaIndex] = {
            ...existing,
            gudepId: g.id,
            namaPangkalan: g.namaPangkalan,
            namaLengkap: existing.namaLengkap || rawPembinaPa,
            noGudep: g.noGudepPa || existing.noGudep,
            kelurahan: g.kelurahan || existing.kelurahan
          };
          hasChanged = true;
        }
      } else {
        const ntaPa = matchingReg?.ntaPembinaPa?.trim() || `09.02.04.${cleanPa}.0002`;
        const kursusPa = matchingReg?.kursusPembinaPa || 'KML';
        const newPa: Member = {
          id: `leader-${g.id}-pembinapa`,
          nta: ntaPa,
          nik: generateSyntheticNik(rawPembinaPa, '327103850315'),
          namaLengkap: rawPembinaPa,
          jenisKelamin: 'L',
          tempatLahir: 'Bogor',
          tanggalLahir: '1985-03-15',
          agama: 'Islam',
          golongan: 'Pembina',
          tingkatan: kursusPa === 'KML' ? 'Pembina Mahir Lanjutan (KML)' : kursusPa === 'KMD' ? 'Pembina Mahir Dasar (KMD)' : 'Pembina Mahir Lanjutan (KML)',
          jabatan: 'Pembina Gudep Putra',
          gudepId: g.id,
          namaPangkalan: g.namaPangkalan,
          noGudep: g.noGudepPa || '04.071',
          kelurahan: g.kelurahan || 'Tanah Sareal',
          alamatRumah: g.alamat || 'Kecamatan Tanah Sareal, Kota Bogor',
          noTelepon: matchingReg?.noHpPembinaPa || g.kontakHp || '081287654321',
          fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          statusKta: 'Sudah Terbit',
          statusSync: 'Tersinkronisasi',
          kualifikasiKursus: kursusPa === 'Belum KMD' ? 'Belum' : (kursusPa as any),
          berlakuKtaSampai: '2028-12-31',
          tanggalBergabung: `${g.tahunBerdiri || 2020}-01-01`,
          inputSource: 'gudep',
          inputBy: g.namaPangkalan,
          inputDate: g.terakhirDiperbarui || new Date().toISOString().slice(0, 10)
        };
        result.push(newPa);
        hasChanged = true;
      }
    }

    // 3. Sinkronisasi Pembina Gudep Putri
    const rawPembinaPi = (g.pembinaGudepPi || matchingReg?.namaPembinaPi || '').trim();
    if (rawPembinaPi && rawPembinaPi !== '-' && !rawPembinaPi.toLowerCase().startsWith('belum')) {
      const normPembinaPi = normalizePersonName(rawPembinaPi);

      const existingPiIndex = result.findIndex(m => {
        const sameGudep = m.gudepId === g.id || (m.namaPangkalan && normalizePangkalanName(m.namaPangkalan) === normPangkalan);
        if (!sameGudep) return false;
        return (
          normalizePersonName(m.namaLengkap) === normPembinaPi ||
          (m.jenisKelamin === 'P' && (m.golongan === 'Pembina' || (m.jabatan && m.jabatan.toLowerCase().includes('pembina pi'))))
        );
      });

      if (existingPiIndex >= 0) {
        const existing = result[existingPiIndex];
        if (existing.gudepId !== g.id || existing.namaPangkalan !== g.namaPangkalan || existing.namaLengkap !== rawPembinaPi) {
          result[existingPiIndex] = {
            ...existing,
            gudepId: g.id,
            namaPangkalan: g.namaPangkalan,
            namaLengkap: existing.namaLengkap || rawPembinaPi,
            noGudep: g.noGudepPi || existing.noGudep,
            kelurahan: g.kelurahan || existing.kelurahan
          };
          hasChanged = true;
        }
      } else {
        const ntaPi = matchingReg?.ntaPembinaPi?.trim() || `09.02.04.${cleanPi}.0003`;
        const kursusPi = matchingReg?.kursusPembinaPi || 'KMD';
        const newPi: Member = {
          id: `leader-${g.id}-pembinapi`,
          nta: ntaPi,
          nik: generateSyntheticNik(rawPembinaPi, '327103880820'),
          namaLengkap: rawPembinaPi,
          jenisKelamin: 'P',
          tempatLahir: 'Bogor',
          tanggalLahir: '1988-08-20',
          agama: 'Islam',
          golongan: 'Pembina',
          tingkatan: kursusPi === 'KML' ? 'Pembina Mahir Lanjutan (KML)' : 'Pembina Mahir Dasar (KMD)',
          jabatan: 'Pembina Gudep Putri',
          gudepId: g.id,
          namaPangkalan: g.namaPangkalan,
          noGudep: g.noGudepPi || '04.072',
          kelurahan: g.kelurahan || 'Tanah Sareal',
          alamatRumah: g.alamat || 'Kecamatan Tanah Sareal, Kota Bogor',
          noTelepon: matchingReg?.noHpPembinaPi || g.kontakHp || '081287654321',
          fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          statusKta: 'Sudah Terbit',
          statusSync: 'Tersinkronisasi',
          kualifikasiKursus: kursusPi === 'Belum KMD' ? 'Belum' : (kursusPi as any),
          berlakuKtaSampai: '2028-12-31',
          tanggalBergabung: `${g.tahunBerdiri || 2020}-01-01`,
          inputSource: 'gudep',
          inputBy: g.namaPangkalan,
          inputDate: g.terakhirDiperbarui || new Date().toISOString().slice(0, 10)
        };
        result.push(newPi);
        hasChanged = true;
      }
    }
  }

  if (hasChanged) {
    saveStoredMembers(result);
  }

  return result;
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
    'Sumber Input',
    'Keterangan Penginput',
    'No Telepon',
    'Status KTA',
    'Status Sinkronisasi',
    'Kualifikasi Kursus',
    'Masa Berlaku KTA'
  ];

  const rows = members.map(m => {
    const isPengurus = m.inputSource === 'pengurus' || 
      (m.inputBy && (m.inputBy.toLowerCase().includes('pengurus') || m.inputBy.toLowerCase().includes('kwarran')));
    const sumberLabel = isPengurus ? 'Diinput Manual Pengurus' : 'Diinput di Gudep (Mandiri)';
    const penginput = m.inputBy || (isPengurus ? 'Pengurus Kwarran' : m.namaPangkalan);

    return [
      `"${m.nta}"`,
      `"${m.nik}"`,
      `"${m.namaLengkap.replace(/"/g, '""')}"`,
      `"${m.jenisKelamin}"`,
      `"${m.golongan}"`,
      `"${m.tingkatan}"`,
      `"${m.namaPangkalan.replace(/"/g, '""')}"`,
      `"${m.noGudep}"`,
      `"${m.kelurahan}"`,
      `"${sumberLabel}"`,
      `"${penginput.replace(/"/g, '""')}"`,
      `"${m.noTelepon}"`,
      `"${m.statusKta}"`,
      `"${m.statusSync}"`,
      `"${m.kualifikasiKursus || '-'}"`,
      `"${m.berlakuKtaSampai}"`
    ];
  });

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
