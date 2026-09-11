import { Gudep, GudepRegistration } from '../types';

/**
 * Mencari data Gugus Depan di Buku Induk Pangkalan Resmi yang cocok dengan berkas pendaftaran
 */
export function findMatchingGudep(reg: GudepRegistration, list: Gudep[]): Gudep | undefined {
  const normPangkalan = reg.namaPangkalan.trim().toLowerCase();
  const regPa = (reg.noGudepPa || reg.nomorGudep?.split('/')[0]?.trim() || '').replace(/\s+/g, '');
  const regPi = (reg.noGudepPi || reg.nomorGudep?.split('/')[1]?.trim() || '').replace(/\s+/g, '');

  return list.find(g => {
    // 1. Cocokkan berdasarkan nama pangkalan (case-insensitive & trimmed)
    if (g.namaPangkalan.trim().toLowerCase() === normPangkalan) return true;
    // 2. Cocokkan berdasarkan nomor gudep putra
    if (regPa && g.noGudepPa && g.noGudepPa.replace(/\s+/g, '') === regPa) return true;
    // 3. Cocokkan berdasarkan nomor gudep putri
    if (regPi && g.noGudepPi && g.noGudepPi.replace(/\s+/g, '') === regPi) return true;
    return false;
  });
}

/**
 * Mengonversi berkas pendaftaran Gudep yang telah diverifikasi menjadi data resmi Buku Induk Pangkalan
 */
export function convertRegistrationToGudep(reg: GudepRegistration, existing?: Gudep): Gudep {
  const noPa = reg.noGudepPa || reg.nomorGudep?.split('/')[0]?.trim() || existing?.noGudepPa || '04.071';
  const noPi = reg.noGudepPi || reg.nomorGudep?.split('/')[1]?.trim() || existing?.noGudepPi || '04.072';

  // Hitung total potensi anggota muda (Siaga, Penggalang, Penegak, Pandega)
  const totalMuda = 
    (reg.jumlahSiagaPa || 0) + (reg.jumlahSiagaPi || 0) +
    (reg.jumlahPenggalangPa || 0) + (reg.jumlahPenggalangPi || 0) +
    (reg.jumlahPenegakPa || 0) + (reg.jumlahPenegakPi || 0) +
    (reg.jumlahPandegaPa || 0) + (reg.jumlahPandegaPi || 0);

  const totalPembina = 
    ((reg.jumlahPembinaPa || 0) + (reg.jumlahPembinaPi || 0)) || 
    existing?.jumlahPembina || 
    2;

  const kontak = 
    reg.noHpKaMabigus || 
    reg.noHpPembinaPa || 
    reg.noHpPembinaPi || 
    reg.akunGudep?.noWaPendaftar || 
    existing?.kontakHp || 
    '081287654321';

  const email = reg.akunGudep?.emailPendaftar || existing?.email || '';

  return {
    id: existing?.id || `gudep-reg-${reg.id || Date.now()}`,
    noGudepPa: noPa,
    noGudepPi: noPi,
    namaPangkalan: reg.namaPangkalan,
    jenjang: reg.jenjang || existing?.jenjang || 'SD/MI',
    kelurahan: reg.kelurahan || existing?.kelurahan || 'Tanah Sareal',
    alamat: reg.alamat || existing?.alamat || '',
    kaMabigus: reg.kaMabigus || existing?.kaMabigus || '',
    pembinaGudepPa: reg.namaPembinaPa || existing?.pembinaGudepPa || '',
    pembinaGudepPi: reg.namaPembinaPi || existing?.pembinaGudepPi || '',
    kontakHp: kontak,
    email: email,
    akreditasi: existing?.akreditasi || 'Belum Terakreditasi',
    tahunBerdiri: existing?.tahunBerdiri || 2020,
    jumlahAnggotaMuda: totalMuda > 0 ? totalMuda : (existing?.jumlahAnggotaMuda || 0),
    jumlahPembina: totalPembina,
    statusSync: 'Tersinkronisasi',
    terakhirDiperbarui: new Date().toISOString().slice(0, 10)
  };
}

/**
 * Memastikan semua pendaftaran yang berstatus 'Disetujui' masuk ke Buku Induk Pangkalan Resmi
 */
export function reconcileVerifiedRegistrationsWithBukuInduk(
  registrations: GudepRegistration[],
  currentGudepList: Gudep[]
): { updatedList: Gudep[]; hasChanges: boolean; newEntries: Gudep[] } {
  const approved = registrations.filter(r => r.statusVerifikasi === 'Disetujui');
  if (approved.length === 0) {
    return { updatedList: currentGudepList, hasChanges: false, newEntries: [] };
  }

  let list = [...currentGudepList];
  const newEntries: Gudep[] = [];
  let hasChanges = false;

  for (const reg of approved) {
    const match = findMatchingGudep(reg, list);
    if (!match) {
      const newGudep = convertRegistrationToGudep(reg);
      list = [newGudep, ...list];
      newEntries.push(newGudep);
      hasChanges = true;
    }
  }

  return { updatedList: list, hasChanges, newEntries };
}
