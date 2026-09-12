export type JenjangSekolah = 'SD/MI' | 'SMP/MTs' | 'SMA/SMK/MA' | 'Perguruan Tinggi' | 'Komunitas/Wilayah';

export type KelurahanTanahSareal =
  | 'Kebon Pedes'
  | 'Kedung Badak'
  | 'Kedung Jaya'
  | 'Kedung Waringin'
  | 'Tanah Sareal'
  | 'Sukadamai'
  | 'Sukaresmi'
  | 'Cibadak'
  | 'Kayumanis'
  | 'Mekarwangi'
  | 'Kencana';

export const KELURAHAN_TANAH_SAREAL: KelurahanTanahSareal[] = [
  'Kebon Pedes',
  'Kedung Badak',
  'Kedung Jaya',
  'Kedung Waringin',
  'Tanah Sareal',
  'Sukadamai',
  'Sukaresmi',
  'Cibadak',
  'Kayumanis',
  'Mekarwangi',
  'Kencana'
];

export type GolonganPramuka = 'Siaga' | 'Penggalang' | 'Penegak' | 'Pandega' | 'Pembina' | 'Pelatih' | 'Andalan' | 'Mabigus';

export type TingkatanPramuka =
  // Siaga
  | 'Siaga Mula'
  | 'Siaga Bantu'
  | 'Siaga Tata'
  | 'Siaga Garuda'
  // Penggalang
  | 'Penggalang Ramu'
  | 'Penggalang Rakit'
  | 'Penggalang Terap'
  | 'Penggalang Garuda'
  // Penegak
  | 'Penegak Bantara'
  | 'Penegak Laksana'
  | 'Penegak Garuda'
  // Pandega
  | 'Pandega'
  | 'Pandega Garuda'
  // Dewasa
  | 'Pembina Mahir Dasar (KMD)'
  | 'Pembina Mahir Lanjutan (KML)'
  | 'Pelatih Dasar (KPD)'
  | 'Pelatih Lanjutan (KPL)'
  | 'Pembina Satuan'
  | 'Ketua Mabigus';

export type StatusSync = 'Tersinkronisasi' | 'Menunggu Sinkronisasi' | 'Belum Terdaftar' | 'Perlu Pemutakhiran';

export type StatusKTA = 'Sudah Terbit' | 'Menunggu Verifikasi' | 'Proses Cetak' | 'Belum Diajukan';

export type StatusVerifikasiGudep = 'Menunggu Verifikasi' | 'Disetujui' | 'Ditolak';

export interface GudepRegistration {
  id: string;
  noRegistrasi: string; // Misal: REG-GD-2026-001
  tanggalRegistrasi: string;
  statusVerifikasi: StatusVerifikasiGudep;
  catatanVerifikasi?: string;
  diverifikasiOleh?: string;
  tanggalVerifikasi?: string;

  // Halaman 1: Identitas Gudep & Mabigus
  nomorGudep: string; // contoh: 04.071 / 04.072
  noGudepPa: string;
  noGudepPi: string;
  namaPangkalan: string; // contoh: MTs Manba'ul Islam
  jenjang: JenjangSekolah;
  statusSekolah: 'Negeri' | 'Swasta' | 'Komunitas/Lainnya';
  npsn?: string;
  kelurahan: KelurahanTanahSareal;
  alamat: string;
  kaMabigus: string;
  jabatanKaMabigus: string;
  noHpKaMabigus: string;

  // Pembina Putra
  namaPembinaPa: string;
  ntaPembinaPa?: string;
  noHpPembinaPa: string;
  kursusPembinaPa: 'KMD' | 'KML' | 'KPD' | 'KPL' | 'Belum KMD';
  jumlahPembinaPa: number;

  // Pembina Putri
  namaPembinaPi: string;
  ntaPembinaPi?: string;
  noHpPembinaPi: string;
  kursusPembinaPi: 'KMD' | 'KML' | 'KPD' | 'KPL' | 'Belum KMD';
  jumlahPembinaPi: number;

  // Jumlah Peserta Didik Aktif
  jumlahSiagaPa: number;
  jumlahSiagaPi: number;
  jumlahPenggalangPa: number;
  jumlahPenggalangPi: number;
  jumlahPenegakPa: number;
  jumlahPenegakPi: number;
  jumlahPandegaPa: number;
  jumlahPandegaPi: number;

  // Kegiatan Gudep
  kegiatanGudep: string[];
  kegiatanLainnya?: string;

  // Halaman 2: Prestasi & Sarpras & Potensi
  prestasi3Tahun: string;
  saranaPrasarana: string[];
  saranaLainnya?: string;
  potensiGudep: string[];
  potensiLainnya?: string;

  // Halaman 3: Kendala & Kebutuhan Pembinaan
  kendalaGudep: string[];
  kendalaLainnya?: string;
  kebutuhanPembinaan: string[];
  kebutuhanLainnya?: string;

  // Halaman 4: Media Sosial & Berkas Unggahan
  mediaSosial: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    website?: string;
  };
  skGudepUrl?: string;
  skGudepFileName?: string;
  fotoPapanNamaUrl?: string;
  fotoKegiatanUrls?: string[];
  dokumenPendukungUrls?: { name: string; url: string }[];

  // Akun Gudep (Untuk login pengguna)
  akunGudep: {
    username: string;
    password: string;
    namaPendaftar: string;
    noWaPendaftar: string;
    emailPendaftar: string;
  };
}

export interface Gudep {
  id: string;
  noGudepPa: string; // Contoh: 04.071
  noGudepPi: string; // Contoh: 04.072
  namaPangkalan: string; // Contoh: SDN Kebon Pedes 1
  jenjang: JenjangSekolah;
  kelurahan: KelurahanTanahSareal;
  alamat: string;
  kaMabigus: string;
  pembinaGudepPa: string;
  pembinaGudepPi: string;
  kontakHp: string;
  email: string;
  akreditasi: 'A' | 'B' | 'C' | 'Belum Terakreditasi';
  tahunBerdiri: number;
  jumlahAnggotaMuda: number;
  jumlahPembina: number;
  statusSync: StatusSync;
  terakhirDiperbarui: string;
}

export type MemberInputSource = 'gudep' | 'pengurus';

export interface Member {
  id: string;
  nta: string; // Nomor Tanda Anggota (e.g. 09.02.04.071.0001)
  nik: string;
  namaLengkap: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  golongan: GolonganPramuka;
  tingkatan: TingkatanPramuka;
  jabatan?: string; // Jabatan di Gudep (misal: 'Ketua Mabigus', 'Pembina Gudep Pa', 'Pembina Gudep Pi')
  gudepId: string;
  namaPangkalan: string;
  noGudep: string;
  kelurahan: KelurahanTanahSareal;
  alamatRumah: string;
  noTelepon: string;
  fotoUrl: string;
  golonganDarah?: 'A' | 'B' | 'AB' | 'O';
  statusKta: StatusKTA;
  statusSync: StatusSync;
  kualifikasiKursus?: 'Belum' | 'KMD' | 'KML' | 'KPD' | 'KPL';
  berlakuKtaSampai: string;
  tanggalBergabung: string;
  inputSource?: MemberInputSource; // 'gudep' = Diinput di Gudep masing-masing, 'pengurus' = Diinput manual oleh Pengurus
  inputBy?: string; // Keterangan instansi/petugas penginput (e.g. "SDN Kebon Pedes 1" atau "Pengurus Kwarran")
  inputDate?: string; // Tanggal penginputan (YYYY-MM-DD atau ISO string)
}

export interface CollectiveKtaBatch {
  id: string;
  noBatch: string;
  gudepId: string;
  namaPangkalan: string;
  noGudep: string;
  tanggalPengajuan: string;
  jumlahAnggota: number;
  golonganUtama: GolonganPramuka;
  status: 'Draf' | 'Diajukan ke Kwarcab' | 'Disetujui' | 'Selesai Cetak';
  pemohonNama: string;
  pemohonKontak: string;
  daftarAnggotaIds: string[];
  catatan?: string;
  suratPengantarNo?: string;
}

export interface CensusStatSummary {
  totalGudep: number;
  totalAnggotaMuda: number;
  totalAnggotaDewasa: number;
  totalSiaga: number;
  totalPenggalang: number;
  totalPenegak: number;
  totalPandega: number;
  totalPembinaKmdKml: number;
  totalPembinaMahir?: number;
  totalKtaTerbit: number;
  persenSync: number;
}

export type ArchiveType = 'surat_masuk' | 'surat_keluar' | 'arsip_umum';

export type SifatSurat = 'Biasa' | 'Penting' | 'Segera' | 'Sangat Rahasia';
export type StatusDisposisi = 'Menunggu Disposisi' | 'Sudah Didisposisikan' | 'Selesai Ditindaklanjuti';
export type KlasifikasiSuratKeluar = 'A' | 'B' | 'C' | 'D'; // A: Biasa/Edaran/Undangan, B: SK/Instruksi, C: Tugas/Mandat, D: Pengantar/Rekomendasi

export interface SuratMasukDetail {
  nomorSuratAsal: string;
  pengirimAsal: string;
  tanggalSurat: string;
  tanggalDiterima: string;
  sifatSurat: SifatSurat;
  disposisiTujuan?: string;
  disposisiCatatan?: string;
  statusDisposisi?: StatusDisposisi;
}

export interface SuratKeluarDetail {
  nomorSuratKwarran: string;
  kodeKlasifikasi: KlasifikasiSuratKeluar;
  tujuanPenerima: string;
  perihal: string;
  tanggalSurat: string;
  lampiran?: string;
  penandatanganNama: string;
  penandatanganJabatan: string;
  penandatanganNta?: string;
  tembusan?: string[];
  templateId?: string;
  statusDistribusi?: 'Draf' | 'Telah Terbit & Didistribusikan' | 'Arsip Resmi';
}

export interface SuratKeluarTemplate {
  id: string;
  kodeKlasifikasi: KlasifikasiSuratKeluar;
  namaTemplate: string;
  deskripsi: string;
  kategori: string;
  perihalDefault: string;
  lampiranDefault: string;
  tujuanDefault: string;
  tempatTujuanDefault: string;
  salamPembukaDefault: string;
  isiPembukaDefault: string;
  detailKegiatanDefault?: {
    hariTanggal?: string;
    waktu?: string;
    tempat?: string;
    acara?: string;
    pakaian?: string;
  };
  isiBadanDefault: string;
  isiPenutupDefault: string;
  penandatanganJabatanDefault: string;
  penandatanganNamaDefault: string;
  penandatanganNtaDefault: string;
  tembusanDefault: string[];
}

export type ArchiveCategory = 
  | 'Surat Keputusan (SK)' 
  | 'Data Registrasi' 
  | 'Akreditasi Gudep' 
  | 'Musran & Rakor' 
  | 'Edaran & Petunjuk'
  | 'Surat Masuk Kwarran'
  | 'Surat Keluar Kwarran'
  | 'Dokumen Umum';

export interface ArchiveDocument {
  id: string;
  nomorDokumen: string;
  judul: string;
  kategori: ArchiveCategory;
  tipeArsip?: ArchiveType; // 'surat_masuk' | 'surat_keluar' | 'arsip_umum'
  tanggalTerbit: string;
  tahun: number;
  instansiPenerbit: string;
  pangkalanTerkait?: string;
  ringkasan: string;
  fileType: 'PDF' | 'Spreadsheet' | 'DOCX' | 'Google Docs';
  fileSize: string;
  cloudStorageUrl: string;
  targetDriveId?: string;
  targetDriveName?: string;
  spreadsheetId?: string;
  tags: string[];
  statusArsip: 'Tersimpan di Cloud' | 'Tersinkronisasi Spreadsheet' | 'Arsip Fisik Tersedia' | 'Draf Digital';
  aksesLevel: 'Publik / Gudep' | 'Pengurus Harian' | 'Rahasia / Terbatas';
  diunggahOleh: string;
  terakhirDiperbarui: string;
  suratMasuk?: SuratMasukDetail;
  suratKeluar?: SuratKeluarDetail;
  isiSurat?: string;
}

export type GDriveType = 
  | 'Google Drive Resmi Kwarran' 
  | 'Google Drive Sekretariat' 
  | 'Shared Drive Kwarcab' 
  | 'Google Workspace Satuan / Sekolah' 
  | 'Google Drive Kustom / Pribadi';

export interface GDriveFolderTarget {
  id: string;
  name: string;
  accountEmail: string;
  type: GDriveType;
  folderName: string;
  folderUrl: string;
  sheetsUrl?: string;
  storageQuota?: string;
  description?: string;
  isDefault: boolean;
  kategoriKhusus?: ArchiveCategory[];
  subfolders?: {
    skFolderUrl?: string;
    registrasiFolderUrl?: string;
    akreditasiFolderUrl?: string;
    musranFolderUrl?: string;
    edaranFolderUrl?: string;
  };
  terakhirDigunakan?: string;
}

export interface GDriveStorageSettings {
  activeDriveId: string;
  drives: GDriveFolderTarget[];
  autoSubfolderCategorization: boolean;
  directUploadNotice?: string;
}

export const DEFAULT_GDRIVE_SETTINGS: GDriveStorageSettings = {
  activeDriveId: 'gdrive-kwarran-utama',
  autoSubfolderCategorization: true,
  directUploadNotice: 'Seluruh berkas arsip dan formulir digital akan disimpan ke Google Drive yang dipilih.',
  drives: [
    {
      id: 'gdrive-kwarran-utama',
      name: 'Google Drive Resmi Kwarran Tanah Sareal',
      accountEmail: 'kwarran.tanahsareal@gmail.com',
      type: 'Google Drive Resmi Kwarran',
      folderName: 'ARSIP_RESMI_KWARRAN_TANAH_SAREAL_2026',
      folderUrl: 'https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74',
      sheetsUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      storageQuota: '14.8 GB / 30 GB (49% Terpakai)',
      description: 'Repositori penyimpanan cloud primer untuk SK, Dokumen Sah, Buku Induk Gudep, dan Arsip Terpadu.',
      isDefault: true,
      terakhirDigunakan: 'Hari ini, 08:30 WIB'
    },
    {
      id: 'gdrive-sekretariat-harian',
      name: 'Google Drive Sekretariat & Urusan Dokumen',
      accountEmail: 'sekretariat.tanahsareal@gmail.com',
      type: 'Google Drive Sekretariat',
      folderName: 'SEKRETARIAT_ADMIN_SURAT_DAN_DOKUMEN',
      folderUrl: 'https://drive.google.com/drive/folders/sekretariat-tanahsareal-dokumen',
      storageQuota: '6.2 GB / 15 GB (41% Terpakai)',
      description: 'Penyimpanan berkas administrasi rutin, surat masuk/keluar, notulensi rapat pengurus, dan edaran berkala.',
      isDefault: false,
      terakhirDigunakan: 'Kemarin, 16:45 WIB'
    },
    {
      id: 'gdrive-kwarcab-shared',
      name: 'Shared Drive Kwarcab Kota Bogor (Wil. II Tanah Sareal)',
      accountEmail: 'kwarcab.kotabogor@pramuka.or.id',
      type: 'Shared Drive Kwarcab',
      folderName: 'SHARED_KWARCAB_KOTA_BOGOR_WILAYAH_II_TANSA',
      folderUrl: 'https://drive.google.com/drive/folders/kwarcab-bogor-tansa-shared',
      storageQuota: 'Unlimited (Google Workspace for Nonprofits)',
      description: 'Drive terpusat Kwarcab Kota Bogor untuk penerbitan KTA kolektif dan berkas Musran.',
      isDefault: false,
      terakhirDigunakan: '28 Agu 2026'
    },
    {
      id: 'gdrive-akreditasi-gudep',
      name: 'Google Drive Khusus Akreditasi & Portofolio Gudep',
      accountEmail: 'akreditasi.tanahsareal@gmail.com',
      type: 'Google Workspace Satuan / Sekolah',
      folderName: 'ARSIP_BORANG_DAN_PORTOFOLIO_AKREDITASI',
      folderUrl: 'https://drive.google.com/drive/folders/akreditasi-gudep-tanahsareal',
      storageQuota: '3.1 GB / 15 GB (20% Terpakai)',
      description: 'Folder arsip khusus berkas borang akreditasi, portofolio pangkalan gugus depan, dan foto visitasi lapangan.',
      isDefault: false,
      terakhirDigunakan: '15 Agu 2026'
    }
  ]
};

export interface KelurahanSemesterStat {
  kelurahan: KelurahanTanahSareal;
  totalGudep: number;
  gudepAktif: number;
  gudepPasif: number;
  totalAnggota: number;
  status: 'Sangat Baik' | 'Optimal' | 'Perlu Perhatian' | 'Kritis';
}

export interface JenjangSemesterStat {
  jenjang: JenjangSekolah;
  totalGudep: number;
  gudepAktif: number;
  gudepPasif: number;
  totalAnggota: number;
}

export interface SemesterReport {
  id: string;
  semester: 'Semester Ganjil' | 'Semester Genap';
  tahunAjaran: string; // Misal: 2026/2027
  tanggalLaporan: string;
  periodeMulai: string;
  periodeSelesai: string;
  totalGudepTerdaftar: number;
  totalGudepAktif: number;
  totalGudepTidakAktif: number;
  totalGudepPerluReaktivasi: number;
  totalAnggotaMuda: number;
  totalPembinaMahir: number;
  persentaseKeaktifan: number;
  kelurahanBreakdown: KelurahanSemesterStat[];
  jenjangBreakdown: JenjangSemesterStat[];
  evaluasiKetuaKwarran: string[];
  rekomendasiTindakLanjut: string[];
  statusLaporan: 'Draf Evaluasi' | 'Disahkan Ketua Kwarran' | 'Dilaporkan ke Kwarcab';
  disahkanOleh?: string;
  tanggalDisahkan?: string;
}

export type UserRole = 
  | 'superadmin'
  | 'ketua_kwarran'
  | 'sekretaris_kwarran'
  | 'anran_binawasa'
  | 'anran_binamuda'
  | 'anran_organisasi'
  | 'pembina_gudep';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  jabatan: string;
  nta?: string;
  memberId?: string;
  pangkalanId?: string;
  namaPangkalan?: string;
  kelurahan?: string;
  email: string;
  avatarEmoji?: string;
  permissions: {
    canEditGudep: boolean;
    canEditMembers: boolean;
    canManageKta: boolean;
    canManageArchives: boolean;
    canManageSemesterReports: boolean;
    canAccessAi: boolean;
  };
}

export interface SecretariatContact {
  namaKwarran: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  kodePos: string;
  email: string;
  noWa: string;
  noTelepon: string;
  jamLayanan: string;
  pesanWaDefault: string;
}

export interface HeroBackgroundConfig {
  enabled: boolean;
  logoUrl: string;
  logoTitle?: string;
  opacity: number; // 0.05 to 0.85 (e.g. 0.22)
  size: number; // width in pixels (150 to 900)
  offsetY: number; // in pixels (-120 to 120)
  rotation: number; // in degrees (-45 to 45)
  blur: number; // in pixels (0 to 10)
  blendMode: 'normal' | 'screen' | 'overlay' | 'luminosity' | 'soft-light';
  grayscale: boolean;
  glow: boolean;
  animateFloat: boolean;
}

export const DEFAULT_HERO_BACKGROUND: HeroBackgroundConfig = {
  enabled: true,
  logoUrl: './logo-kwarran-tanah-sareal.png',
  logoTitle: 'Logo Resmi Kwarran 0917-06 Tanah Sareal',
  opacity: 0.25,
  size: 440,
  offsetY: 0,
  rotation: 0,
  blur: 0,
  blendMode: 'screen',
  grayscale: false,
  glow: true,
  animateFloat: true,
};

export interface GudepActivityReport {
  id: string;
  pangkalanId: string;
  namaPangkalan: string;
  nomorGudep: string;
  judul: string;
  tanggalKegiatan: string;
  kategori: 'Latihan Rutin' | 'Perkemahan / Persami' | 'Ujian SKU / SKK' | 'Lomba Tingkat' | 'Bakti Sosial' | 'Laporan Semester' | 'Muspas / Musyawarah';
  tempat: string;
  jumlahPeserta: number;
  ringkasan: string;
  dokumenUrl?: string;
  diunggahOleh: string;
  terakhirDiperbarui: string;
}
