import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  Award, 
  CreditCard, 
  Search, 
  ShieldCheck, 
  QrCode, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Download, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Lock, 
  UserCheck, 
  HelpCircle,
  FileCheck,
  Clock,
  School,
  FileSpreadsheet,
  FolderArchive,
  ArrowRight,
  Filter,
  Palette,
  Smartphone
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Gudep, 
  Member, 
  ArchiveDocument, 
  KelurahanTanahSareal, 
  JenjangSekolah,
  SecretariatContact,
  HeroBackgroundConfig,
  DEFAULT_HERO_BACKGROUND 
} from '../types';
import { DEFAULT_SECRETARIAT_CONTACT } from '../utils/storage';
import { getCustomPengurusList, PengurusAccountItem } from '../utils/auth';

interface PublicPortalProps {
  gudepList: Gudep[];
  members: Member[];
  archives: ArchiveDocument[];
  secretariatContact?: SecretariatContact;
  heroBgConfig?: HeroBackgroundConfig;
  pengurusList?: PengurusAccountItem[];
  onOpenLogin: () => void;
  onOpenGudepLogin?: () => void;
  onOpenVerifier: () => void;
  onViewMemberKta: (member: Member) => void;
  onOpenHeroBgSettings?: () => void;
  onOpenRegistration?: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  gudepList,
  members,
  archives,
  secretariatContact = DEFAULT_SECRETARIAT_CONTACT,
  heroBgConfig = DEFAULT_HERO_BACKGROUND,
  pengurusList,
  onOpenLogin,
  onOpenGudepLogin,
  onOpenVerifier,
  onViewMemberKta,
  onOpenHeroBgSettings,
  onOpenRegistration,
}) => {
  const activeKetua = useMemo(() => {
    if (pengurusList && pengurusList.length > 0) {
      return pengurusList.find(p => p.role === 'ketua_kwarran') || pengurusList[0];
    }
    const list = getCustomPengurusList();
    return list.find(p => p.role === 'ketua_kwarran') || list[0];
  }, [pengurusList]);
  // Public Verification / Search States
  const [activeSearchTab, setActiveSearchTab] = useState<'member' | 'gudep'>('member');
  const [memberQuery, setMemberQuery] = useState('');
  const [gudepQuery, setGudepQuery] = useState('');

  // Gudep Directory Filter States
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>('Semua');
  const [selectedJenjang, setSelectedJenjang] = useState<string>('Semua');
  const [directorySearch, setDirectorySearch] = useState('');

  // Public Archives Filter States
  const [archiveCategoryFilter, setArchiveCategoryFilter] = useState<string>('Semua');

  // Stats calculation
  const totalAnggotaMuda = useMemo(() => {
    return members.filter(m => ['Siaga', 'Penggalang', 'Penegak', 'Pandega'].includes(m.golongan)).length;
  }, [members]);

  const totalPembinaMahir = useMemo(() => {
    return members.filter(m => m.kualifikasiKursus && m.kualifikasiKursus !== 'Belum').length;
  }, [members]);

  const totalGudepA = useMemo(() => {
    return gudepList.filter(g => g.akreditasi === 'A').length;
  }, [gudepList]);

  // Filtered Member Lookup
  const searchedMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    if (!q) return [];
    return members.filter(m => 
      m.namaLengkap.toLowerCase().includes(q) ||
      m.nta.toLowerCase().includes(q) ||
      m.nik.toLowerCase().includes(q) ||
      m.namaPangkalan.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [members, memberQuery]);

  // Filtered Gudep Quick Lookup
  const searchedGudepQuick = useMemo(() => {
    const q = gudepQuery.trim().toLowerCase();
    if (!q) return [];
    return gudepList.filter(g => 
      g.namaPangkalan.toLowerCase().includes(q) ||
      g.noGudepPa.toLowerCase().includes(q) ||
      g.noGudepPi.toLowerCase().includes(q) ||
      g.kelurahan.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [gudepList, gudepQuery]);

  // Filtered Gudep Directory List
  const filteredGudepDirectory = useMemo(() => {
    return gudepList.filter(g => {
      const matchKel = selectedKelurahan === 'Semua' || g.kelurahan === selectedKelurahan;
      const matchJen = selectedJenjang === 'Semua' || g.jenjang === selectedJenjang;
      const matchSearch = !directorySearch || 
        g.namaPangkalan.toLowerCase().includes(directorySearch.toLowerCase()) ||
        g.noGudepPa.includes(directorySearch) ||
        g.noGudepPi.includes(directorySearch) ||
        g.kaMabigus.toLowerCase().includes(directorySearch.toLowerCase());
      return matchKel && matchJen && matchSearch;
    });
  }, [gudepList, selectedKelurahan, selectedJenjang, directorySearch]);

  // Public Archives
  const publicArchives = useMemo(() => {
    return archives.filter(a => {
      const isPublic = a.aksesLevel === 'Publik / Gudep';
      const matchCat = archiveCategoryFilter === 'Semua' || a.kategori === archiveCategoryFilter;
      return isPublic && matchCat;
    });
  }, [archives, archiveCategoryFilter]);

  const kelurahanList: KelurahanTanahSareal[] = [
    'Kebon Pedes', 'Kedung Badak', 'Kedung Jaya', 'Kedung Waringin', 
    'Tanah Sareal', 'Sukadamai', 'Sukaresmi', 'Cibadak', 
    'Kayumanis', 'Mekarwangi', 'Kencana'
  ];

  return (
    <div id="top" className="min-h-screen bg-[#180E09] text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 pb-20 lg:pb-0">
      {/* 1. TOP OFFICIAL HEADER */}
      <header className="sticky top-0 z-40 bg-[#24140D]/95 backdrop-blur-md border-b border-[#3C2216] shadow-lg">
        <div className="bg-[#140A05] px-3 sm:px-6 py-1.5 text-[11px] border-b border-[#28140B] flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-2 text-stone-300 min-w-0">
            <span className="inline-flex items-center gap-1.5 font-bold tracking-wider text-amber-400 text-[10px] sm:text-[11px] truncate">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
              PORTAL PUBLIK & LAYANAN TERPADU
            </span>
            <span className="text-stone-600 hidden md:inline">•</span>
            <span className="text-stone-400 hidden md:inline truncate">Kwarran Tanah Sareal</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-500/30 text-amber-300 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Cloud Realtime Sync Active</span>
            </div>

            <button
              onClick={onOpenVerifier}
              className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex-shrink-0"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Verifikasi QR</span>
            </button>

            <PWAInstallButton variant="header" logoUrl={heroBgConfig?.logoUrl} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Brand */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 p-0.5 shadow-md flex items-center justify-center flex-shrink-0 border border-amber-400/40 overflow-hidden">
                <div className="w-full h-full rounded-[9px] bg-[#1A0E08] flex items-center justify-center text-amber-400 font-bold text-base sm:text-lg overflow-hidden">
                  {heroBgConfig?.logoUrl ? (
                    <img
                      src={heroBgConfig.logoUrl}
                      alt="Logo Kwarran"
                      className="w-full h-full object-contain p-0.5"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = './logo-kwarran-tanah-sareal.png';
                      }}
                    />
                  ) : (
                    <span>⚜️</span>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-white truncate">
                    PRAMUKA <span className="text-amber-400">TANAH SAREAL</span>
                  </span>
                  <span className="hidden sm:inline-block text-[9.5px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                    PUBLIK
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                  Kwarcab Gerakan Pramuka Kota Bogor
                </p>
              </div>
            </div>

            {/* Nav links (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-5 text-xs font-medium text-stone-300">
              <a href="#layanan-cek" className="hover:text-amber-300 transition-colors">Cek NTA Anggota</a>
              <a href="#statistik" className="hover:text-amber-300 transition-colors">Statistik Potensi</a>
              <a href="#direktori-gudep" className="hover:text-amber-300 transition-colors">Direktori Gudep</a>
              <a href="#unduhan" className="hover:text-amber-300 transition-colors">Arsip & Edaran</a>
              <a href="#panduan" className="hover:text-amber-300 transition-colors">Juknis & SOP</a>
              {onOpenRegistration && (
                <button
                  onClick={onOpenRegistration}
                  className="hover:text-emerald-300 transition-colors flex items-center gap-1 text-emerald-400 font-bold"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Daftar Gudep</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1 py-0.5 rounded border border-emerald-500/40">Publik</span>
                </button>
              )}
            </nav>

            {/* Login Pengurus & Daftar Gudep & Login Gudep Buttons (Top CTA) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {onOpenRegistration && (
                <button
                  onClick={onOpenRegistration}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md border border-emerald-400/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex-shrink-0"
                  title="Daftarkan Gugus Depan & Buat Akun Pangkalan Baru"
                >
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">Daftar Gudep</span>
                  <span className="sm:hidden">Daftar</span>
                </button>
              )}

              <button
                onClick={onOpenGudepLogin || onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 bg-[#2D160C] hover:bg-[#3D1E11] text-amber-300 hover:text-white text-xs font-bold rounded-xl shadow-md border border-amber-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex-shrink-0"
                title="Login Anggota & Pembina Pangkalan Terverifikasi"
              >
                <School className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="hidden sm:inline">Login Gudep</span>
                <span className="sm:hidden">Gudep</span>
              </button>

              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-900/20 border border-amber-300 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex-shrink-0"
              >
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Portal Pengurus</span>
                <span className="hidden sm:inline md:hidden">Pengurus</span>
                <span className="sm:hidden">Masuk</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-[#381F14] bg-gradient-to-b from-[#2E180E] via-[#20100A] to-[#180E09]">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-700/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* LOGO KWARRAN TANAH SAREAL WATERMARK DI BACKGROUND BELAKANG TULISAN */}
        {heroBgConfig.enabled && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0"
            aria-hidden="true"
          >
            <div 
              className="relative flex items-center justify-center transition-all duration-300"
              style={{
                transform: `translateY(${heroBgConfig.offsetY}px) rotate(${heroBgConfig.rotation}deg)`
              }}
            >
              {/* Optional Golden/Scout Aura Halo behind Logo */}
              {heroBgConfig.glow && (
                <div 
                  className="absolute rounded-full blur-3xl pointer-events-none bg-gradient-to-tr from-amber-500/30 via-amber-400/20 to-amber-600/30 transition-all duration-500"
                  style={{
                    width: `${heroBgConfig.size * 1.18}px`,
                    height: `${heroBgConfig.size * 1.18}px`,
                  }}
                />
              )}

              {/* Logo Emblem Image */}
              <img
                src={heroBgConfig.logoUrl}
                alt="Logo Kwarran Gerakan Pramuka Tanah Sareal Background"
                className={`max-w-none transition-all duration-300 ${heroBgConfig.animateFloat ? 'animate-pulse' : ''}`}
                referrerPolicy="no-referrer"
                style={{
                  width: `${heroBgConfig.size}px`,
                  height: `${heroBgConfig.size}px`,
                  objectFit: 'contain',
                  opacity: heroBgConfig.opacity,
                  filter: `${heroBgConfig.grayscale ? 'grayscale(100%)' : 'none'} ${heroBgConfig.blur > 0 ? `blur(${heroBgConfig.blur}px)` : ''}`,
                  mixBlendMode: heroBgConfig.blendMode
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = './logo-kwarran-tanah-sareal.png';
                }}
              />
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#331B10] border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
                <span className="text-base">⚜️</span>
                <span>Satu Data Pramuka Terpadu • Kwarran Tanah Sareal Kota Bogor</span>
              </div>
              {onOpenHeroBgSettings && (
                <button
                  onClick={onOpenHeroBgSettings}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all shadow-sm"
                  title="Klik untuk mengganti logo Kwarran atau menyesuaikan background hero"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ganti Logo / Background</span>
                </button>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Portal Layanan & Database Keanggotaan Pramuka <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Tanah Sareal</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Mewujudkan digitalisasi administrasi kepramukaan, validasi Nomor Tanda Anggota (NTA/KTA), akreditasi pangkalan, dan pusat dokumen resmi Gerakan Pramuka se-Kecamatan Tanah Sareal.
            </p>

            {/* Quick Hero Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {/* PWA Direct Install Button for Mobile & Tablet */}
              <PWAInstallButton variant="hero" logoUrl={heroBgConfig?.logoUrl} />

              {onOpenRegistration && (
                <button
                  onClick={onOpenRegistration}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl border border-emerald-400/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Building2 className="w-4 h-4 text-emerald-100" />
                  <span>Daftar Gudep & Akun Baru</span>
                </button>
              )}

              <button
                onClick={onOpenGudepLogin || onOpenLogin}
                className="px-5 py-3 rounded-xl bg-[#3B1F13] hover:bg-[#4D2819] text-amber-300 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-amber-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <School className="w-4 h-4 text-amber-400" />
                <span>Masuk Akun Gudep Terverifikasi</span>
              </button>

              <a
                href="#layanan-cek"
                className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Cek NTA Anggota Sekarang</span>
              </a>

              <a
                href="#direktori-gudep"
                className="px-5 py-3 rounded-xl bg-[#351C11] hover:bg-[#462719] text-stone-200 font-semibold text-xs sm:text-sm flex items-center gap-2 border border-[#55301E] transition-all"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Lihat Data Gugus Depan</span>
              </a>

              <button
                onClick={onOpenLogin}
                className="px-5 py-3 rounded-xl bg-[#402316] hover:bg-[#522E1D] text-amber-300 font-semibold text-xs sm:text-sm flex items-center gap-2 border border-amber-500/30 transition-all"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Portal Pengurus Kwarran</span>
              </button>
            </div>

            {/* PWA Highlight Card */}
            <PWAInstallButton variant="card" logoUrl={heroBgConfig?.logoUrl} className="mt-8 max-w-4xl mx-auto text-left" />
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-[#28150D]/90 border border-[#3F2317] p-4 rounded-2xl text-center shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{gudepList.length}</p>
              <p className="text-xs text-stone-400 font-medium mt-1">Pangkalan Gugus Depan</p>
            </div>
            <div className="bg-[#28150D]/90 border border-[#3F2317] p-4 rounded-2xl text-center shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">{totalAnggotaMuda.toLocaleString('id-ID')}+</p>
              <p className="text-xs text-stone-400 font-medium mt-1">Anggota Muda Terdata</p>
            </div>
            <div className="bg-[#28150D]/90 border border-[#3F2317] p-4 rounded-2xl text-center shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">{totalPembinaMahir}</p>
              <p className="text-xs text-stone-400 font-medium mt-1">Pembina Mahir (KMD/KML)</p>
            </div>
            <div className="bg-[#28150D]/90 border border-[#3F2317] p-4 rounded-2xl text-center shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-orange-400 font-mono">11</p>
              <p className="text-xs text-stone-400 font-medium mt-1">Kelurahan Terintegrasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2B. REGISTRASI GUGUS DEPAN & AKUN PANGKALAN (PORTAL PUBLIK) */}
      <section className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#2F1910] via-[#24130C] to-[#1A0D08] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Layanan Registrasi Terbuka untuk Seluruh Pangkalan Sekolah & Komunitas</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                Pendaftaran Gugus Depan & Pembuatan Akun Pangkalan
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Pangkalan baru atau yang hendak memutakhirkan data pangkalan (SD/MI, SMP/MTs, SMA/SMK/MA) kini dapat mengisi kuesioner profil pangkalan secara online dan langsung membuat <strong>Username & Kata Sandi</strong>. Akun akan aktif setelah diverifikasi oleh Tim Pengurus Kwarran Tanah Sareal.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] text-stone-300">
                <div className="flex items-center gap-2 bg-[#1B0C06] p-2 rounded-xl border border-stone-800">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>Formulir 4 Halaman Lengkap</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1B0C06] p-2 rounded-xl border border-stone-800">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>Buat Akun Login Mandiri</span>
                </div>
                <div className="flex items-center gap-2 bg-[#1B0C06] p-2 rounded-xl border border-stone-800">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>Verifikasi Cepat Pengurus</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
              <button
                onClick={onOpenGudepLogin || onOpenLogin}
                className="px-6 py-3.5 bg-[#2C150A] hover:bg-[#3D1E0F] text-amber-300 hover:text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 border border-amber-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <School className="w-4 h-4 text-amber-400" />
                <span>Masuk Akun Gudep Terverifikasi</span>
              </button>

              {onOpenRegistration && (
                <button
                  onClick={onOpenRegistration}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 border border-emerald-400/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Building2 className="w-4 h-4 text-emerald-100" />
                  <span>Isi Formulir Pendaftaran Gudep</span>
                </button>
              )}
              {onOpenRegistration && (
                <button
                  onClick={onOpenRegistration}
                  className="px-6 py-2.5 bg-[#1A0B05] hover:bg-[#2A1308] text-amber-300 font-semibold text-xs sm:text-sm rounded-2xl border border-amber-500/40 flex items-center justify-center gap-2 transition-colors"
                >
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>Cek Status Verifikasi Akun</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. LAYANAN CEK MANDIRI (INTERACTIVE SEARCH WIDGET) */}
      <section id="layanan-cek" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#26140D] border border-[#442618] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">
              LAYANAN VERIFIKASI MANDIRI
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Cek Status Keanggotaan (NTA) & Gudep
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-2">
              Ketikkan Nomor Tanda Anggota (NTA), NIK, atau nama sekolah untuk melihat keabsahan status resmi.
            </p>
          </div>

          {/* Search Category Tabs */}
          <div className="flex max-w-sm mx-auto bg-[#1A0C06] p-1.5 rounded-2xl border border-[#3B1F13] mb-6">
            <button
              onClick={() => setActiveSearchTab('member')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeSearchTab === 'member'
                  ? 'bg-amber-600 text-stone-950 shadow'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cek NTA / KTA</span>
            </button>
            <button
              onClick={() => setActiveSearchTab('gudep')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeSearchTab === 'gudep'
                  ? 'bg-amber-600 text-stone-950 shadow'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Cek Gudep</span>
            </button>
          </div>

          {/* Tab 1: Member / KTA Search */}
          {activeSearchTab === 'member' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="relative">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  placeholder="Cari berdasarkan Nama Lengkap, NTA (contoh: 09.02.04...), atau NIK..."
                  className="w-full bg-[#1A0C06] border border-[#48281A] focus:border-amber-500 rounded-2xl pl-12 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors shadow-inner"
                />
                {memberQuery && (
                  <button
                    onClick={() => setMemberQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {memberQuery.trim() === '' ? (
                <div className="p-6 bg-[#1D0E07] rounded-2xl border border-[#381D11] text-center">
                  <p className="text-xs text-stone-400">
                    💡 Contoh pencarian: ketik <strong className="text-amber-400">"Ahmad"</strong>, <strong className="text-amber-400">"09.02.04"</strong>, atau <strong className="text-amber-400">"Kebon Pedes"</strong> untuk melihat data anggota Pramuka.
                  </p>
                </div>
              ) : searchedMembers.length === 0 ? (
                <div className="p-8 bg-[#1D0E07] rounded-2xl border border-[#381D11] text-center">
                  <AlertCircle className="w-8 h-8 text-amber-500/80 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">Data Anggota Tidak Ditemukan</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Pastikan ejaan nama atau nomor NTA sudah benar, atau ajukan registrasi anggota ke Pembina Gudep pangkalan Anda.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-stone-400">
                    Ditemukan {searchedMembers.length} data anggota:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchedMembers.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 bg-[#23120A] border border-[#442618] hover:border-amber-500/50 rounded-2xl flex flex-col justify-between gap-3 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={m.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={m.namaLengkap}
                            className="w-12 h-12 rounded-xl object-cover border border-[#55311E] flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-white">{m.namaLengkap}</h4>
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                                {m.golongan}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-amber-400 mt-0.5">{m.nta}</p>
                            <p className="text-[11px] text-stone-400 mt-0.5 truncate max-w-[200px]">
                              {m.namaPangkalan} ({m.noGudep})
                            </p>
                            <p className="text-[10px] text-stone-500 mt-0.5">
                              Tingkat: <strong className="text-stone-300">{m.tingkatan}</strong> • Kel. {m.kelurahan}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#3A1E12] flex items-center justify-between">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            m.statusKta === 'Sudah Terbit' 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-stone-500/20 text-stone-300'
                          }`}>
                            KTA: {m.statusKta}
                          </span>

                          <button
                            onClick={() => onViewMemberKta(m)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#381D12] hover:bg-[#4A281A] text-amber-300 text-[11px] font-bold rounded-lg border border-[#5E3420] transition-colors"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Lihat KTA Digital</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Gudep Search */}
          {activeSearchTab === 'gudep' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="relative">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={gudepQuery}
                  onChange={(e) => setGudepQuery(e.target.value)}
                  placeholder="Cari Pangkalan Sekolah, Nomor Gudep (04.071), atau Kelurahan..."
                  className="w-full bg-[#1A0C06] border border-[#48281A] focus:border-amber-500 rounded-2xl pl-12 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors shadow-inner"
                />
                {gudepQuery && (
                  <button
                    onClick={() => setGudepQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {gudepQuery.trim() === '' ? (
                <div className="p-6 bg-[#1D0E07] rounded-2xl border border-[#381D11] text-center">
                  <p className="text-xs text-stone-400">
                    💡 Contoh: ketik <strong className="text-amber-400">"SDN"</strong>, <strong className="text-amber-400">"SMPN 5"</strong>, atau <strong className="text-amber-400">"04.071"</strong> untuk melihat pangkalan resmi Kwarran Tanah Sareal.
                  </p>
                </div>
              ) : searchedGudepQuick.length === 0 ? (
                <div className="p-8 bg-[#1D0E07] rounded-2xl border border-[#381D11] text-center">
                  <AlertCircle className="w-8 h-8 text-amber-500/80 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">Gugus Depan Tidak Ditemukan</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Periksa kembali kata kunci Anda atau lihat direktori lengkap pada tabel di bawah.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-stone-400">
                    Ditemukan {searchedGudepQuick.length} Gugus Depan:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchedGudepQuick.map((g) => (
                      <div
                        key={g.id}
                        className="p-4 bg-[#23120A] border border-[#442618] rounded-2xl space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white">{g.namaPangkalan}</h4>
                            <p className="text-[11px] font-mono text-amber-400 mt-0.5">
                              Gudep Pa: {g.noGudepPa} • Pi: {g.noGudepPi}
                            </p>
                          </div>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                            Akreditasi {g.akreditasi}
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-300 space-y-0.5 pt-1 border-t border-[#3A1E12]">
                          <p>📍 Kelurahan: <strong className="text-white">{g.kelurahan}</strong></p>
                          <p>👤 Ka Mabigus: {g.kaMabigus}</p>
                          <p className="text-[10px] text-stone-400 truncate">
                            {g.alamat}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4. STATISTIK & POTENSI TERBUKA */}
      <section id="statistik" className="py-16 bg-[#1E100A] border-y border-[#381E13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                DATA SENSUS & POTENSI
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Statistik Kepramukaan Se-Tanah Sareal
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
                Transparansi data keanggotaan dan pangkalan di 11 kelurahan Kecamatan Tanah Sareal Kota Bogor.
              </p>
            </div>
            <div className="text-xs text-stone-400 bg-[#2A160E] px-3.5 py-2 rounded-xl border border-[#46281A] self-start md:self-auto">
              Pembaruan: <strong className="text-stone-200">Semester Berjalan 2026/2027</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="p-5 bg-[#28150D] border border-[#442618] rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-400">Pangkalan Gugus Depan</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white font-mono mt-3">{gudepList.length}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-amber-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{totalGudepA} Gudep Terakreditasi A</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-5 bg-[#28150D] border border-[#442618] rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-400">Anggota Muda Aktif</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white font-mono mt-3">{totalAnggotaMuda.toLocaleString('id-ID')}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-stone-300">
                <span>Siaga, Penggalang, Penegak & Pandega</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-5 bg-[#28150D] border border-[#442618] rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-400">Pembina Mahir (KMD/KML)</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white font-mono mt-3">{totalPembinaMahir}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-purple-300">
                <span>Pembina Bersertifikat Mahir Terdaftar</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-5 bg-[#28150D] border border-[#442618] rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-400">Kelurahan Terlingkup</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white font-mono mt-3">11 / 11</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-blue-300">
                <span>100% Wilayah Tanah Sareal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DIREKTORI GUGUS DEPAN LENGKAP (PUBLIC DIRECTORY) */}
      <section id="direktori-gudep" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              BUKU INDUK TERBUKA
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Direktori Gugus Depan Se-Tanah Sareal
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              Daftar seluruh pangkalan SD/MI, SMP/MTs, SMA/SMK/MA, dan Komunitas resmi di Kwartir Ranting Tanah Sareal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Filter nama sekolah/gudep..."
                className="bg-[#26140D] border border-[#46281A] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={selectedKelurahan}
              onChange={(e) => setSelectedKelurahan(e.target.value)}
              className="bg-[#26140D] border border-[#46281A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Semua">Semua Kelurahan (11)</option>
              {kelurahanList.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>

            <select
              value={selectedJenjang}
              onChange={(e) => setSelectedJenjang(e.target.value)}
              className="bg-[#26140D] border border-[#46281A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Semua">Semua Jenjang</option>
              <option value="SD/MI">SD / MI</option>
              <option value="SMP/MTs">SMP / MTs</option>
              <option value="SMA/SMK/MA">SMA / SMK / MA</option>
              <option value="Perguruan Tinggi">Perguruan Tinggi</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGudepDirectory.map((g) => (
            <div
              key={g.id}
              className="bg-[#24130C] border border-[#422417] hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#341C11] text-amber-300 border border-[#532E1D]">
                    {g.jenjang}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    g.akreditasi === 'A' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-stone-500/20 text-stone-300 border border-stone-500/30'
                  }`}>
                    Akreditasi {g.akreditasi}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors mt-2">
                  {g.namaPangkalan}
                </h3>

                <div className="mt-2 bg-[#180C06] p-2.5 rounded-xl border border-[#3A1E12] flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-semibold">Pa: {g.noGudepPa}</span>
                  <span className="text-stone-600">•</span>
                  <span className="text-amber-400 font-semibold">Pi: {g.noGudepPi}</span>
                </div>

                <div className="mt-3 space-y-1 text-[11px] text-stone-300">
                  <p className="flex items-center gap-1.5 text-stone-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Kel. {g.kelurahan}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-stone-500">Ka Mabigus:</span>
                    <strong className="text-white truncate">{g.kaMabigus}</strong>
                  </p>
                  <p className="text-[10px] text-stone-400 line-clamp-1">
                    {g.alamat}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#3A1E12] flex items-center justify-between text-[11px] text-stone-400">
                <span>{g.jumlahAnggotaMuda} Anggota Muda</span>
                <span className="text-amber-400 font-medium">✓ Aktif</span>
              </div>
            </div>
          ))}
        </div>

        {filteredGudepDirectory.length === 0 && (
          <div className="p-12 text-center bg-[#24130C] rounded-2xl border border-[#422417]">
            <p className="text-sm font-semibold text-stone-300">Tidak ada pangkalan yang sesuai dengan filter.</p>
            <button
              onClick={() => { setSelectedKelurahan('Semua'); setSelectedJenjang('Semua'); setDirectorySearch(''); }}
              className="mt-3 text-xs text-amber-400 hover:underline font-bold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>

      {/* 6. PUSAT UNDUHAN & ARSIP RESMI PUBLIK */}
      <section id="unduhan" className="py-16 bg-[#1D0F09] border-t border-[#3A1E12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                REPOSITORI TERBUKA
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Pusat Arsip, Dokumen & Surat Edaran
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
                Unduh format formulir, borang akreditasi pangkalan, juklak kegiatan, dan edaran resmi Kwarran.
              </p>
            </div>

            <div className="flex gap-2">
              {['Semua', 'Surat Keputusan (SK)', 'Edaran & Petunjuk', 'Akreditasi Gudep', 'Data Registrasi'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setArchiveCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    archiveCategoryFilter === cat
                      ? 'bg-amber-600 text-stone-950 font-bold'
                      : 'bg-[#2A160E] text-stone-300 hover:text-white border border-[#442618]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicArchives.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#24130C] border border-[#442618] rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#331B10] text-amber-300 border border-[#522E1C]">
                      {doc.kategori}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {doc.fileType} • {doc.fileSize}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-2.5 line-clamp-2">
                    {doc.judul}
                  </h4>

                  <p className="text-[11px] font-mono text-amber-400 mt-1">
                    No: {doc.nomorDokumen}
                  </p>

                  <p className="text-[11px] text-stone-400 mt-2 line-clamp-2">
                    {doc.ringkasan}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#381E13] flex items-center justify-between">
                  <span className="text-[10px] text-stone-500">
                    Tahun: {doc.tahun}
                  </span>
                  <a
                    href={doc.cloudStorageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Dokumen</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PANDUAN & ALUR STANDAR OPERASIONAL PROSEDUR (JUKNIS) */}
      <section id="panduan" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">
            PANDUAN & JUKNIS RESMI
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Alur Layanan Kepramukaan Kwarran
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-2">
            Ikuti tahapan resmi untuk penerbitan KTA, pendataan anggota (NTA), dan akreditasi pangkalan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-[#24130C] border border-[#442618] p-6 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-extrabold text-lg mb-4 border border-amber-500/30">
              1
            </div>
            <h3 className="text-sm font-bold text-white">Alur KTA Digital Siswa / Anggota</h3>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              1. Pembina Pangkalan mengumpulkan formulir sensus dan foto seragam pramuka.<br/>
              2. Operator Gudep memverifikasi data pada modul Keanggotaan.<br/>
              3. Kwarran memvalidasi pengajuan dan menerbitkan NTA resmi.<br/>
              4. KTA diterbitkan dengan QR Code resmi.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#24130C] border border-[#442618] p-6 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-amber-700/30 text-amber-300 flex items-center justify-center font-extrabold text-lg mb-4 border border-amber-500/30">
              2
            </div>
            <h3 className="text-sm font-bold text-white">Pendataan NTA & Pembina Satuan</h3>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              1. Pembina mengunggah ijazah kursus mahir (KMD/KML/KPD/KPL).<br/>
              2. Operator Gudep mendaftarkan NTA Pembina secara resmi.<br/>
              3. Kwarran memvalidasi kualifikasi kursus dan keaktifan satuan.<br/>
              4. Terdata dalam Buku Induk Ranting dengan hak bina resmi.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#24130C] border border-[#442618] p-6 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-stone-700/40 text-stone-300 flex items-center justify-center font-extrabold text-lg mb-4 border border-stone-500/30">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Akreditasi Pangkalan Gudep</h3>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              1. Pangkalan mengisi instrumen borang 9 komponen akreditasi Gudep.<br/>
              2. Melampirkan program kerja tahunan dan data potensi anggota.<br/>
              3. Tim Asesor Kwarran melakukan visitasi dan verifikasi lapangan.<br/>
              4. Penetapan predikat akreditasi (A / B / C) oleh Kwartir Cabang.
            </p>
          </div>
        </div>
      </section>

      {/* 8. CTA SECTION FOR OPERATORS */}
      <section className="py-12 bg-gradient-to-r from-[#2A160E] via-[#3A1E13] to-[#2A160E] border-y border-[#4F2B1B]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Akses Khusus Pengurus Kwarran & Operator Gudep
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-xl mx-auto">
            Masuk untuk mengelola Buku Induk Gudep, Pendataan NTA Anggota, Cetak KTA Kolektif, Penyusunan Laporan Semesteran, dan Asisten AI Kwarran.
          </p>
          <div className="mt-6">
            <button
              onClick={onOpenLogin}
              className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-sm rounded-2xl shadow-xl transition-all hover:scale-105 inline-flex items-center gap-2 border border-amber-300"
            >
              <UserCheck className="w-4 h-4" />
              <span>Buka Menu Login Pengurus</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. KONTAK & SEKRETARIAT */}
      <section id="kontak" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              SEKRETARIAT KWARRAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {secretariatContact.namaKwarran}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-3 leading-relaxed">
              Sekretariat melayani administrasi pangkalan, validasi data NTA anggota, surat rekomendasi kegiatan perkemahan/lomba, serta konsultasi program kepramukaan di tingkat Kwartir Ranting.
            </p>

            <div className="mt-6 space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{secretariatContact.alamat} {secretariatContact.kodePos ? `(${secretariatContact.kodePos})` : ''}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{secretariatContact.jamLayanan}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{secretariatContact.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Hotline WhatsApp: {secretariatContact.noWa} {secretariatContact.noTelepon ? `/ ${secretariatContact.noTelepon}` : ''}</span>
              </div>
            </div>

            {/* Pimpinan Kwarran Card */}
            <div className="mt-5 p-3.5 bg-[#25130C] border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-base flex-shrink-0">
                  ⚜️
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                    Ketua Kwartir Ranting
                  </span>
                  <p className="text-sm font-bold text-white leading-tight">
                    {activeKetua?.name || 'Kak Drs. H. Suryadi, M.Pd.'}
                  </p>
                  <p className="text-[11px] text-stone-400 font-mono">
                    NTA. {activeKetua?.nta || '09.02.04.001.0001'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-medium px-2 py-1 rounded-full border border-amber-500/30 whitespace-nowrap">
                Masa Bakti Aktif
              </span>
            </div>
          </div>

          {/* Quick Contact Card */}
          <div className="bg-[#24130C] border border-[#442618] p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>⚜️</span>
              <span>Hubungi Pengurus Harian</span>
            </h3>
            <p className="text-xs text-stone-400">
              Perlu bantuan atau verifikasi mendesak? Hubungi kami langsung melalui layanan resmi WhatsApp Kwarran Tanah Sareal.
            </p>
            <div className="space-y-2">
              {(() => {
                const cleanDigits = (secretariatContact.noWa || '081287654321').replace(/\D/g, '');
                const waNumberIntl = cleanDigits.startsWith('0') ? `62${cleanDigits.slice(1)}` : cleanDigits.startsWith('62') ? cleanDigits : `62${cleanDigits}`;
                const waChatUrl = `https://wa.me/${waNumberIntl}?text=${encodeURIComponent(secretariatContact.pesanWaDefault || 'Halo Sekretariat Kwarran Tanah Sareal, saya ingin konsultasi layanan kepramukaan')}`;
                
                return (
                  <a
                    href={waChatUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-[#381E12] hover:bg-[#492718] text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-amber-500/30 transition-colors shadow-sm"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>Chat WhatsApp Sekretariat ({secretariatContact.noWa})</span>
                  </a>
                );
              })()}
              <button
                onClick={onOpenVerifier}
                className="w-full py-3 bg-[#331B10] hover:bg-[#422315] text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-[#5A311D] transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Buka Verifikasi QR Code</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. PUBLIC FOOTER */}
      <footer className="bg-[#120905] border-t border-[#2B170E] py-8 text-center text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center justify-center gap-2 text-stone-200 font-bold text-sm">
            <span>⚜️</span>
            <span>SISKA-SIKAP KWARTIR RANTING TANAH SAREAL</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Sistem Informasi Satu Data Keanggotaan & Gugus Depan Pramuka Terpadu • Kota Bogor • Jawa Barat
          </p>
          <div className="pt-3 border-t border-[#24130C] flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-400">
            <span>© 2026 Kwartir Ranting Tanah Sareal. Seluruh hak cipta dilindungi.</span>
            <div className="flex items-center gap-4">
              <PWAInstallButton variant="header" logoUrl={heroBgConfig?.logoUrl} />
              <button
                onClick={onOpenLogin}
                className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Portal Akses Pengurus</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating PWA Install Button for Mobile Users */}
      <PWAInstallButton variant="floating" logoUrl={heroBgConfig?.logoUrl} />
    </div>
  );
};
