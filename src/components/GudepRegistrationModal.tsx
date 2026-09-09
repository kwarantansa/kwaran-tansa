import React, { useState } from 'react';
import {
  X,
  Building,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Award,
  Compass,
  Upload,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  Copy,
  Printer,
  Search,
  School,
  FileCheck,
  Globe,
  Instagram,
  Facebook,
  Video,
  Check
} from 'lucide-react';
import {
  GudepRegistration,
  JenjangSekolah,
  KelurahanTanahSareal,
  KELURAHAN_TANAH_SAREAL
} from '../types';

interface GudepRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRegistration?: (registration: GudepRegistration) => Promise<void> | void;
  onSubmit?: (registration: GudepRegistration) => Promise<void> | void;
  existingRegistrations?: GudepRegistration[];
  registrations?: GudepRegistration[];
  gudepList?: any[];
}

const JENJANG_OPTIONS: JenjangSekolah[] = [
  'SD/MI',
  'SMP/MTs',
  'SMA/SMK/MA',
  'Perguruan Tinggi',
  'Komunitas/Wilayah'
];

const KEGIATAN_OPTIONS = [
  'Latihan Mingguan',
  'Persami',
  'Jambore',
  'Raimuna',
  'LT (Lomba Tingkat)',
  'Gladian',
  'Bakti Sosial',
  'Hiking'
];

const SARPRAS_OPTIONS = [
  'Sanggar',
  'Papan Nama Gudep',
  'Tiang Bendera',
  'Gudang',
  'Tenda',
  'Tongkat',
  'Semaphore',
  'Kompas',
  'Peralatan PBB',
  'Peralatan Tali-temali',
  'Peralatan Masak',
  'Laptop',
  'LCD'
];

const POTENSI_OPTIONS = [
  'Saka',
  'Kewirausahaan (potensi pengembangan mandiri)',
  'Lingkungan',
  'Seni',
  'Teknologi (pemanfaatan media digital/web madrasah)',
  'Pramuka Garuda',
  'Paskibra',
  'PMR'
];

const KENDALA_OPTIONS = [
  'Kekurangan Pembina',
  'Kekurangan Anggota',
  'Administrasi',
  'Dana',
  'Sarana',
  'Sanggar',
  'Peralatan'
];

const KEBUTUHAN_OPTIONS = [
  'KMD',
  'KML',
  'Administrasi Gudep',
  'Manajemen Gudep',
  'Digitalisasi Gudep (selaras dengan pemanfaatan platform digital madrasah)',
  'Keprotokolan',
  'PBB',
  'Tali-temali',
  'Survival'
];

export const GudepRegistrationModal: React.FC<GudepRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmitRegistration,
  onSubmit,
  existingRegistrations = [],
  registrations = []
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'status'>('form');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submittedReg, setSubmittedReg] = useState<GudepRegistration | null>(null);
  const [statusSearchQuery, setStatusSearchQuery] = useState('');
  const [foundStatus, setFoundStatus] = useState<GudepRegistration | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const effectiveRegistrations = existingRegistrations.length > 0 ? existingRegistrations : registrations;

  // Form State initialized to empty or default structure
  const [formData, setFormData] = useState<Partial<GudepRegistration>>({
    nomorGudep: '',
    noGudepPa: '',
    noGudepPi: '',
    namaPangkalan: '',
    jenjang: 'SMP/MTs',
    statusSekolah: 'Swasta',
    npsn: '',
    kelurahan: 'Tanah Sareal',
    alamat: '',
    kaMabigus: '',
    jabatanKaMabigus: 'Kepala Madrasah / Kepala Sekolah',
    noHpKaMabigus: '',

    namaPembinaPa: '',
    ntaPembinaPa: '',
    noHpPembinaPa: '',
    kursusPembinaPa: 'KMD',
    jumlahPembinaPa: 2,

    namaPembinaPi: '',
    ntaPembinaPi: '',
    noHpPembinaPi: '',
    kursusPembinaPi: 'KMD',
    jumlahPembinaPi: 2,

    jumlahSiagaPa: 0,
    jumlahSiagaPi: 0,
    jumlahPenggalangPa: 0,
    jumlahPenggalangPi: 0,
    jumlahPenegakPa: 0,
    jumlahPenegakPi: 0,
    jumlahPandegaPa: 0,
    jumlahPandegaPi: 0,

    kegiatanGudep: ['Latihan Mingguan', 'Persami'],
    kegiatanLainnya: '',

    prestasi3Tahun: '',
    saranaPrasarana: ['Papan Nama Gudep', 'Tiang Bendera', 'Tenda', 'Tongkat'],
    saranaLainnya: '',
    potensiGudep: ['Lingkungan', 'Teknologi (pemanfaatan media digital/web madrasah)'],
    potensiLainnya: '',

    kendalaGudep: ['Sarana'],
    kendalaLainnya: '',
    kebutuhanPembinaan: ['Digitalisasi Gudep (selaras dengan pemanfaatan platform digital madrasah)'],
    kebutuhanLainnya: '',

    mediaSosial: {
      instagram: '',
      facebook: '',
      tiktok: '',
      website: ''
    },
    skGudepFileName: '',
    skGudepUrl: '',
    fotoPapanNamaUrl: '',
    fotoKegiatanUrls: [],
    dokumenPendukungUrls: [],

    akunGudep: {
      username: '',
      password: '',
      namaPendaftar: '',
      noWaPendaftar: '',
      emailPendaftar: ''
    }
  });

  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Fill sample data as specified in user's uploaded document (MTs Manba'ul Islam)
  const handleFillSampleDocumentData = () => {
    setFormData({
      nomorGudep: '04.075 / 04.076',
      noGudepPa: '04.075',
      noGudepPi: '04.076',
      namaPangkalan: "MTs Manba'ul Islam",
      jenjang: 'SMP/MTs',
      statusSekolah: 'Swasta',
      npsn: '20277490',
      kelurahan: 'Tanah Sareal',
      alamat: 'Bogor, Jawa Barat',
      kaMabigus: 'Akhmad Taufik, S.Pd.I.',
      jabatanKaMabigus: 'Kepala Madrasah / Ketua Mabigus',
      noHpKaMabigus: '081388992211',

      namaPembinaPa: 'Akhmad Taufik, S.Pd.I.',
      ntaPembinaPa: '09.02.04.075.0001',
      noHpPembinaPa: '081388992211',
      kursusPembinaPa: 'KMD',
      jumlahPembinaPa: 2,

      namaPembinaPi: 'Siti Rohmah, S.Pd.',
      ntaPembinaPi: '09.02.04.076.0001',
      noHpPembinaPi: '081299887766',
      kursusPembinaPi: 'KMD',
      jumlahPembinaPi: 2,

      jumlahSiagaPa: 0,
      jumlahSiagaPi: 0,
      jumlahPenggalangPa: 64,
      jumlahPenggalangPi: 58,
      jumlahPenegakPa: 0,
      jumlahPenegakPi: 0,
      jumlahPandegaPa: 0,
      jumlahPandegaPi: 0,

      kegiatanGudep: [
        'Latihan Mingguan',
        'Persami',
        'LT (Lomba Tingkat)',
        'Gladian',
        'Bakti Sosial',
        'Hiking'
      ],
      kegiatanLainnya: '',

      prestasi3Tahun:
        'Keaktifan dalam kegiatan kepramukaan tingkat kwartir ranting dan penyelenggaraan kegiatan internal madrasah serta juara Lomba Tingkat (LT) Ranting.',
      saranaPrasarana: [
        'Sanggar',
        'Papan Nama Gudep',
        'Tiang Bendera',
        'Tenda',
        'Tongkat',
        'Semaphore',
        'Peralatan PBB',
        'Peralatan Tali-temali',
        'Laptop'
      ],
      saranaLainnya: '',
      potensiGudep: [
        'Kewirausahaan (potensi pengembangan mandiri)',
        'Lingkungan',
        'Seni',
        'Teknologi (pemanfaatan media digital/web madrasah)'
      ],
      potensiLainnya: '',

      kendalaGudep: ['Sarana (atau sesuaikan kondisi lapangan)'],
      kendalaLainnya: '',
      kebutuhanPembinaan: [
        'Digitalisasi Gudep (selaras dengan pemanfaatan platform digital madrasah)'
      ],
      kebutuhanLainnya: '',

      mediaSosial: {
        instagram: '@mtsmanbaulislam',
        facebook: 'MTs Manbaul Islam',
        tiktok: '@pramuka_manbaulislam',
        website: 'https://mtsmanbaulislam.cyou'
      },
      skGudepFileName: 'SK_Kwartir_Ranting_MTs_Manbaul_Islam.pdf',
      skGudepUrl: 'https://mtsmanbaulislam.cyou/sk-gudep.pdf',
      fotoPapanNamaUrl:
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&auto=format&fit=crop&q=80',
      fotoKegiatanUrls: [
        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&auto=format&fit=crop&q=80'
      ],
      dokumenPendukungUrls: [],

      akunGudep: {
        username: 'pembina.mtsmanbaul',
        password: 'mtsmanbaul2026',
        namaPendaftar: 'Kak Akhmad Taufik, S.Pd.I.',
        noWaPendaftar: '081388992211',
        emailPendaftar: 'mtsmanbaulislam@gmail.com'
      }
    });
    setFormError(null);
  };

  const toggleArrayItem = (field: 'kegiatanGudep' | 'saranaPrasarana' | 'potensiGudep' | 'kendalaGudep' | 'kebutuhanPembinaan', item: string) => {
    const current = (formData[field] as string[]) || [];
    if (current.includes(item)) {
      setFormData({ ...formData, [field]: current.filter(i => i !== item) });
    } else {
      setFormData({ ...formData, [field]: [...current, item] });
    }
  };

  const validateStep = (step: number): boolean => {
    setFormError(null);
    if (step === 1) {
      if (!formData.namaPangkalan?.trim()) {
        setFormError('Nama Gudep / Pangkalan wajib diisi.');
        return false;
      }
      if (!formData.alamat?.trim()) {
        setFormError('Alamat lengkap pangkalan wajib diisi.');
        return false;
      }
      if (!formData.kaMabigus?.trim()) {
        setFormError('Nama Ketua Mabigus wajib diisi.');
        return false;
      }
      if (!formData.noHpKaMabigus?.trim()) {
        setFormError('Nomor HP Ketua Mabigus wajib diisi.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.namaPembinaPa?.trim() && !formData.namaPembinaPi?.trim()) {
        setFormError('Mohon isi minimal salah satu nama Pembina Putra atau Pembina Putri.');
        return false;
      }
    } else if (step === 4) {
      const akun = formData.akunGudep;
      if (!akun?.username?.trim()) {
        setFormError('Username Akun Gudep wajib diisi untuk login.');
        return false;
      }
      if (akun.username.length < 4) {
        setFormError('Username minimal harus 4 karakter.');
        return false;
      }
      if (!akun?.password?.trim()) {
        setFormError('Kata sandi / PIN Akun Gudep wajib diisi.');
        return false;
      }
      if (akun.password.length < 6) {
        setFormError('Kata sandi / PIN minimal harus 6 karakter.');
        return false;
      }
      if (!akun?.namaPendaftar?.trim()) {
        setFormError('Nama lengkap penanggung jawab / pendaftar wajib diisi.');
        return false;
      }
      if (!akun?.noWaPendaftar?.trim()) {
        setFormError('Nomor WhatsApp aktif pendaftar wajib diisi untuk konfirmasi aktivasi.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setFormError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const regId = `reg-gd-${Date.now()}`;
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const regNumber = `REG-GD-${new Date().getFullYear()}-${randomSuffix}`;

      // Extract numbers
      const noGudepPa = formData.noGudepPa || (formData.nomorGudep ? formData.nomorGudep.split('/')[0]?.trim() : '04.071');
      const noGudepPi = formData.noGudepPi || (formData.nomorGudep ? formData.nomorGudep.split('/')[1]?.trim() : '04.072');

      const fullRegistration: GudepRegistration = {
        id: regId,
        noRegistrasi: regNumber,
        tanggalRegistrasi: new Date().toISOString().slice(0, 10),
        statusVerifikasi: 'Menunggu Verifikasi',
        nomorGudep: formData.nomorGudep || `${noGudepPa} / ${noGudepPi}`,
        noGudepPa: noGudepPa,
        noGudepPi: noGudepPi,
        namaPangkalan: formData.namaPangkalan?.trim() || 'Gugus Depan Baru',
        jenjang: formData.jenjang || 'SMP/MTs',
        statusSekolah: formData.statusSekolah || 'Swasta',
        npsn: formData.npsn?.trim() || '',
        kelurahan: formData.kelurahan || 'Tanah Sareal',
        alamat: formData.alamat?.trim() || 'Tanah Sareal, Kota Bogor',
        kaMabigus: formData.kaMabigus?.trim() || '',
        jabatanKaMabigus: formData.jabatanKaMabigus?.trim() || 'Ketua Mabigus',
        noHpKaMabigus: formData.noHpKaMabigus?.trim() || '',

        namaPembinaPa: formData.namaPembinaPa?.trim() || '',
        ntaPembinaPa: formData.ntaPembinaPa?.trim() || '',
        noHpPembinaPa: formData.noHpPembinaPa?.trim() || '',
        kursusPembinaPa: formData.kursusPembinaPa || 'KMD',
        jumlahPembinaPa: Number(formData.jumlahPembinaPa) || 1,

        namaPembinaPi: formData.namaPembinaPi?.trim() || '',
        ntaPembinaPi: formData.ntaPembinaPi?.trim() || '',
        noHpPembinaPi: formData.noHpPembinaPi?.trim() || '',
        kursusPembinaPi: formData.kursusPembinaPi || 'KMD',
        jumlahPembinaPi: Number(formData.jumlahPembinaPi) || 1,

        jumlahSiagaPa: Number(formData.jumlahSiagaPa) || 0,
        jumlahSiagaPi: Number(formData.jumlahSiagaPi) || 0,
        jumlahPenggalangPa: Number(formData.jumlahPenggalangPa) || 0,
        jumlahPenggalangPi: Number(formData.jumlahPenggalangPi) || 0,
        jumlahPenegakPa: Number(formData.jumlahPenegakPa) || 0,
        jumlahPenegakPi: Number(formData.jumlahPenegakPi) || 0,
        jumlahPandegaPa: Number(formData.jumlahPandegaPa) || 0,
        jumlahPandegaPi: Number(formData.jumlahPandegaPi) || 0,

        kegiatanGudep: formData.kegiatanGudep || ['Latihan Mingguan'],
        kegiatanLainnya: formData.kegiatanLainnya || '',

        prestasi3Tahun: formData.prestasi3Tahun || '',
        saranaPrasarana: formData.saranaPrasarana || [],
        saranaLainnya: formData.saranaLainnya || '',
        potensiGudep: formData.potensiGudep || [],
        potensiLainnya: formData.potensiLainnya || '',

        kendalaGudep: formData.kendalaGudep || [],
        kendalaLainnya: formData.kendalaLainnya || '',
        kebutuhanPembinaan: formData.kebutuhanPembinaan || [],
        kebutuhanLainnya: formData.kebutuhanLainnya || '',

        mediaSosial: {
          instagram: formData.mediaSosial?.instagram || '',
          facebook: formData.mediaSosial?.facebook || '',
          tiktok: formData.mediaSosial?.tiktok || '',
          website: formData.mediaSosial?.website || ''
        },
        skGudepFileName: formData.skGudepFileName || 'SK_Gudep_Terbaru.pdf',
        skGudepUrl: formData.skGudepUrl || '',
        fotoPapanNamaUrl: formData.fotoPapanNamaUrl || '',
        fotoKegiatanUrls: formData.fotoKegiatanUrls || [],
        dokumenPendukungUrls: formData.dokumenPendukungUrls || [],

        akunGudep: {
          username: formData.akunGudep?.username?.trim().toLowerCase() || '',
          password: formData.akunGudep?.password?.trim() || '123456',
          namaPendaftar: formData.akunGudep?.namaPendaftar?.trim() || '',
          noWaPendaftar: formData.akunGudep?.noWaPendaftar?.trim() || '',
          emailPendaftar: formData.akunGudep?.emailPendaftar?.trim() || ''
        }
      };

      const submitFn = onSubmitRegistration || onSubmit;
      if (typeof submitFn === 'function') {
        await submitFn(fullRegistration);
      }
      setSubmittedReg(fullRegistration);
    } catch (err: any) {
      console.error('Error submitting registration:', err);
      setFormError(err.message || 'Gagal mengirim pendaftaran. Silakan periksa koneksi atau coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchStatus = () => {
    setSearchAttempted(true);
    const query = statusSearchQuery.trim().toLowerCase();
    if (!query) {
      setFoundStatus(null);
      return;
    }
    const found = effectiveRegistrations.find(
      r =>
        r.noRegistrasi.toLowerCase() === query ||
        r.akunGudep.username.toLowerCase() === query ||
        r.namaPangkalan.toLowerCase().includes(query) ||
        (r.nomorGudep && r.nomorGudep.toLowerCase().includes(query))
    );
    setFoundStatus(found || null);
  };

  const copyRegistrationCode = () => {
    if (!submittedReg) return;
    navigator.clipboard.writeText(submittedReg.noRegistrasi);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1F110B] border border-[#48281A] text-stone-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2C170F] via-[#351B12] to-[#24120B] p-5 sm:p-6 border-b border-[#4D2A1C] flex items-center justify-between relative">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl flex-shrink-0 text-amber-400">
              ⚜️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500 text-stone-950 px-2 py-0.5 rounded">
                  PORTAL REGISTRASI PUBLIK
                </span>
                <span className="text-xs text-amber-300 font-medium">
                  Kwartir Ranting Tanah Sareal
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                Pendaftaran Gugus Depan & Akun Pangkalan Baru
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Pengisian data pangkalan, mabigus, pembina, potensi, dan pembuatan akun akses mandiri
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1A0C06] hover:bg-[#2B140B] text-stone-400 hover:text-white border border-[#442316] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Form Pendaftaran vs Cek Status */}
        <div className="bg-[#160B06] px-5 sm:px-6 py-2.5 border-b border-[#3A1E13] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('form'); setSubmittedReg(null); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'form'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#251209]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Formulir Registrasi Gudep</span>
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'status'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#251209]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cek Status Verifikasi Akun</span>
            </button>
          </div>

          {activeTab === 'form' && !submittedReg && (
            <button
              type="button"
              onClick={handleFillSampleDocumentData}
              className="text-[11px] bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5"
              title="Isi contoh data sesuai dokumen kuesioner MTs Manba'ul Islam"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Isi Contoh Data (MTs Manba'ul Islam)</span>
            </button>
          )}
        </div>

        {/* TAB 1: FORMULIR PENDAFTARAN */}
        {activeTab === 'form' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

            {/* CELEBRATORY SUBMISSION SUCCESS */}
            {submittedReg ? (
              <div className="space-y-6 max-w-2xl mx-auto py-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
                    Pendaftaran Berhasil Diajukan
                  </span>
                  <h3 className="text-xl font-bold text-white mt-2">
                    Registrasi Gugus Depan Berhasil Dikirimkan!
                  </h3>
                  <p className="text-xs text-stone-300 mt-2 max-w-lg mx-auto leading-relaxed">
                    Data pangkalan <strong className="text-amber-300">{submittedReg.namaPangkalan}</strong> beserta akun akses mandiri telah tersimpan di sistem Kwarran Tanah Sareal.
                  </p>
                </div>

                {/* Registration summary card */}
                <div className="bg-[#2A160E] border border-[#48281A] rounded-xl p-5 text-left space-y-3.5 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-[#3D2014]">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Nomor Registrasi:</span>
                      <strong className="text-sm font-mono text-amber-400 font-bold tracking-wider">
                        {submittedReg.noRegistrasi}
                      </strong>
                    </div>
                    <button
                      onClick={copyRegistrationCode}
                      className="px-2.5 py-1 rounded bg-[#1A0C06] hover:bg-[#381B0F] border border-[#4D2817] text-stone-300 text-xs flex items-center gap-1.5"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText ? 'Tersalin' : 'Salin Kode'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[11px]">Nama Pangkalan:</span>
                      <span className="font-semibold text-white">{submittedReg.namaPangkalan}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Nomor Gudep:</span>
                      <span className="font-semibold text-amber-300">{submittedReg.nomorGudep}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Username Akun:</span>
                      <span className="font-mono font-bold text-white bg-[#1A0C06] px-2 py-0.5 rounded border border-stone-700">
                        {submittedReg.akunGudep.username}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Status Akun Saat Ini:</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        Menunggu Verifikasi Pengurus
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#1A0C06] rounded-lg border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5 mt-2">
                    <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <strong>Ketentuan Aktivasi:</strong> Sesuai kebijakan Kwarran Tanah Sareal, akun Gugus Depan harus diverifikasi terlebih dahulu oleh pengurus sebelum dapat login. Silakan hubungi Sekretariat Kwarran untuk konfirmasi dan percepatan verifikasi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSubmittedReg(null);
                      setCurrentStep(1);
                    }}
                    className="px-4 py-2.5 bg-[#2C170F] hover:bg-[#3D2014] text-stone-300 rounded-xl text-xs font-semibold border border-[#502818]"
                  >
                    Daftarkan Gudep Lain
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow"
                  >
                    Selesai & Kembali ke Portal
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE STEP FORM */
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Step indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-[#3B1F13] pb-4">
                  {[
                    { step: 1, label: 'Identitas & Mabigus', desc: 'Halaman 1 PDF' },
                    { step: 2, label: 'Pembina & Anggota', desc: 'Peserta & Kegiatan' },
                    { step: 3, label: 'Sarpras & Potensi', desc: 'Halaman 2 & 3' },
                    { step: 4, label: 'Berkas & Akun Login', desc: 'Halaman 4 & Akses' },
                  ].map((s) => (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => {
                        if (s.step < currentStep || validateStep(currentStep)) {
                          setCurrentStep(s.step);
                        }
                      }}
                      className={`p-2.5 rounded-xl text-left transition-all border ${
                        currentStep === s.step
                          ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-sm'
                          : currentStep > s.step
                          ? 'bg-[#29150E] border-[#442316] text-stone-300'
                          : 'bg-[#180B06] border-[#2A140B] text-stone-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            currentStep === s.step
                              ? 'bg-amber-500 text-stone-950'
                              : currentStep > s.step
                              ? 'bg-emerald-500 text-stone-950'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {currentStep > s.step ? '✓' : s.step}
                        </div>
                        <span className="text-xs font-semibold truncate">{s.label}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-1 ml-7 truncate">
                        {s.desc}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Form Error Notice */}
                {formError && (
                  <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* STEP 1: IDENTITAS GUGUS DEPAN & MABIGUS (PDF Hal. 1) */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#351A0F] pb-2">
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>Halaman 1: Identitas Gugus Depan & Mabigus</span>
                      </h3>
                      <span className="text-[11px] text-stone-400">Pertanyaan Bagian 1</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">
                          Nomor Gudep (Putra / Putri) <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nomorGudep || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                              ...formData,
                              nomorGudep: val,
                              noGudepPa: val.includes('/') ? val.split('/')[0].trim() : val,
                              noGudepPi: val.includes('/') ? val.split('/')[1].trim() : ''
                            });
                          }}
                          placeholder="Contoh: 04.075 / 04.076"
                          className="w-full bg-[#180C07] border border-[#3E2114] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <span className="text-[10px] text-stone-400 mt-0.5 block">Format: 04.XXX (Putra) / 04.YYY (Putri)</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">
                          Nama Gudep / Pangkalan <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.namaPangkalan || ''}
                          onChange={(e) => setFormData({ ...formData, namaPangkalan: e.target.value })}
                          placeholder="Contoh: MTs Manba'ul Islam / SDN Kebon Pedes 1"
                          className="w-full bg-[#180C07] border border-[#3E2114] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">
                          Jenjang Pangkalan <span className="text-amber-400">*</span>
                        </label>
                        <select
                          value={formData.jenjang || 'SMP/MTs'}
                          onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as JenjangSekolah })}
                          className="w-full bg-[#180C07] border border-[#3E2114] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {JENJANG_OPTIONS.map((j) => (
                            <option key={j} value={j} className="bg-[#1F110B] text-white">
                              {j}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">
                          Status Sekolah / Lembaga
                        </label>
                        <select
                          value={formData.statusSekolah || 'Swasta'}
                          onChange={(e) => setFormData({ ...formData, statusSekolah: e.target.value as any })}
                          className="w-full bg-[#180C07] border border-[#3E2114] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="Negeri" className="bg-[#1F110B]">Negeri</option>
                          <option value="Swasta" className="bg-[#1F110B]">Swasta</option>
                          <option value="Komunitas/Lainnya" className="bg-[#1F110B]">Komunitas / Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">
                          NPSN (Nomor Pokok Sekolah Nasional)
                        </label>
                        <input
                          type="text"
                          value={formData.npsn || ''}
                          onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                          placeholder="Contoh: 20277490"
                          className="w-full bg-[#180C07] border border-[#3E2114] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">
                          Kelurahan di Wilayah Tanah Sareal <span className="text-amber-400">*</span>
                        </label>
                        <select
                          value={formData.kelurahan || 'Tanah Sareal'}
                          onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value as KelurahanTanahSareal })}
                          className="w-full bg-[#180C07] border border-[#3E2114] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {KELURAHAN_TANAH_SAREAL.map((k) => (
                            <option key={k} value={k} className="bg-[#1F110B] text-white">
                              Kelurahan {k}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Alamat Lengkap Pangkalan <span className="text-amber-400">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={formData.alamat || ''}
                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        placeholder="Contoh: Jl. Pondok Rumput No. 45, RT 02/RW 04, Kel. Kebon Pedes, Kec. Tanah Sareal, Kota Bogor"
                        className="w-full bg-[#180C07] border border-[#3E2114] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="pt-2 border-t border-[#351A0F]">
                      <h4 className="text-xs font-bold text-amber-300 mb-3 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Data Ketua Majelis Pembimbing Gugus Depan (Ka Mabigus)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-stone-400 mb-1">
                            Nama Ketua Mabigus <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.kaMabigus || ''}
                            onChange={(e) => setFormData({ ...formData, kaMabigus: e.target.value })}
                            placeholder="Contoh: Akhmad Taufik, S.Pd.I."
                            className="w-full bg-[#180C07] border border-[#3E2114] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-stone-400 mb-1">
                            Jabatan Ketua Mabigus
                          </label>
                          <input
                            type="text"
                            value={formData.jabatanKaMabigus || ''}
                            onChange={(e) => setFormData({ ...formData, jabatanKaMabigus: e.target.value })}
                            placeholder="Kepala Madrasah / Kepala Sekolah"
                            className="w-full bg-[#180C07] border border-[#3E2114] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-stone-400 mb-1">
                            Nomor HP / WhatsApp Ka Mabigus <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.noHpKaMabigus || ''}
                            onChange={(e) => setFormData({ ...formData, noHpKaMabigus: e.target.value })}
                            placeholder="081388992211"
                            className="w-full bg-[#180C07] border border-[#3E2114] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: PEMBINA, PESERTA DIDIK & KEGIATAN (PDF Hal. 1 lanjutan) */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#351A0F] pb-2">
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Halaman 1 Lanjutan: Pembina, Anggota & Kegiatan</span>
                      </h3>
                      <span className="text-[11px] text-stone-400">Pertanyaan Pembina & Siswa</span>
                    </div>

                    {/* Pembina Putra */}
                    <div className="p-3.5 bg-[#180C07] rounded-xl border border-[#3D2014] space-y-3">
                      <h4 className="text-xs font-bold text-amber-300">Data Pembina Putra</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Nama Pembina Putra</label>
                          <input
                            type="text"
                            value={formData.namaPembinaPa || ''}
                            onChange={(e) => setFormData({ ...formData, namaPembinaPa: e.target.value })}
                            placeholder="Kak Akhmad Taufik, S.Pd.I."
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">NTA Pembina Putra</label>
                          <input
                            type="text"
                            value={formData.ntaPembinaPa || ''}
                            onChange={(e) => setFormData({ ...formData, ntaPembinaPa: e.target.value })}
                            placeholder="09.02.04.075.0001"
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Nomor HP Pembina Putra</label>
                          <input
                            type="text"
                            value={formData.noHpPembinaPa || ''}
                            onChange={(e) => setFormData({ ...formData, noHpPembinaPa: e.target.value })}
                            placeholder="081388992211"
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Tingkat Kursus Pembina</label>
                          <select
                            value={formData.kursusPembinaPa || 'KMD'}
                            onChange={(e) => setFormData({ ...formData, kursusPembinaPa: e.target.value as any })}
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="Belum KMD">Belum KMD</option>
                            <option value="KMD">KMD (Kursus Mahir Dasar)</option>
                            <option value="KML">KML (Kursus Mahir Lanjutan)</option>
                            <option value="KPD">KPD (Kursus Pelatih Dasar)</option>
                            <option value="KPL">KPL (Kursus Pelatih Lanjutan)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Jumlah Pembina Putra</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahPembinaPa ?? 2}
                            onChange={(e) => setFormData({ ...formData, jumlahPembinaPa: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pembina Putri */}
                    <div className="p-3.5 bg-[#180C07] rounded-xl border border-[#3D2014] space-y-3">
                      <h4 className="text-xs font-bold text-amber-300">Data Pembina Putri</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Nama Pembina Putri</label>
                          <input
                            type="text"
                            value={formData.namaPembinaPi || ''}
                            onChange={(e) => setFormData({ ...formData, namaPembinaPi: e.target.value })}
                            placeholder="Kak Siti Rohmah, S.Pd."
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">NTA Pembina Putri</label>
                          <input
                            type="text"
                            value={formData.ntaPembinaPi || ''}
                            onChange={(e) => setFormData({ ...formData, ntaPembinaPi: e.target.value })}
                            placeholder="09.02.04.076.0001"
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Nomor HP Pembina Putri</label>
                          <input
                            type="text"
                            value={formData.noHpPembinaPi || ''}
                            onChange={(e) => setFormData({ ...formData, noHpPembinaPi: e.target.value })}
                            placeholder="081299887766"
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Tingkat Kursus Pembina</label>
                          <select
                            value={formData.kursusPembinaPi || 'KMD'}
                            onChange={(e) => setFormData({ ...formData, kursusPembinaPi: e.target.value as any })}
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="Belum KMD">Belum KMD</option>
                            <option value="KMD">KMD (Kursus Mahir Dasar)</option>
                            <option value="KML">KML (Kursus Mahir Lanjutan)</option>
                            <option value="KPD">KPD (Kursus Pelatih Dasar)</option>
                            <option value="KPL">KPL (Kursus Pelatih Lanjutan)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Jumlah Pembina Putri</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahPembinaPi ?? 2}
                            onChange={(e) => setFormData({ ...formData, jumlahPembinaPi: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Jumlah Anggota Peserta Didik */}
                    <div className="p-3.5 bg-[#180C07] rounded-xl border border-[#3D2014] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-amber-300">Jumlah Anggota Siswa/i Aktif</h4>
                        <span className="text-[11px] text-stone-400">
                          Total: {(formData.jumlahSiagaPa || 0) + (formData.jumlahSiagaPi || 0) + (formData.jumlahPenggalangPa || 0) + (formData.jumlahPenggalangPi || 0) + (formData.jumlahPenegakPa || 0) + (formData.jumlahPenegakPi || 0) + (formData.jumlahPandegaPa || 0) + (formData.jumlahPandegaPi || 0)} Anggota
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-0.5">Siaga Putra</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahSiagaPa ?? 0}
                            onChange={(e) => setFormData({ ...formData, jumlahSiagaPa: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#120804] border border-[#361B0E] rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-0.5">Siaga Putri</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahSiagaPi ?? 0}
                            onChange={(e) => setFormData({ ...formData, jumlahSiagaPi: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#120804] border border-[#361B0E] rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-amber-300 font-semibold mb-0.5">Penggalang Putra</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahPenggalangPa ?? 0}
                            onChange={(e) => setFormData({ ...formData, jumlahPenggalangPa: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#120804] border border-amber-500/40 rounded px-2 py-1 text-xs text-white font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-amber-300 font-semibold mb-0.5">Penggalang Putri</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahPenggalangPi ?? 0}
                            onChange={(e) => setFormData({ ...formData, jumlahPenggalangPi: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#120804] border border-amber-500/40 rounded px-2 py-1 text-xs text-white font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-0.5">Penegak Putra</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahPenegakPa ?? 0}
                            onChange={(e) => setFormData({ ...formData, jumlahPenegakPa: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#120804] border border-[#361B0E] rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-0.5">Penegak Putri</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahPenegakPi ?? 0}
                            onChange={(e) => setFormData({ ...formData, jumlahPenegakPi: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#120804] border border-[#361B0E] rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-0.5">Pandega Putra</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahPandegaPa ?? 0}
                            onChange={(e) => setFormData({ ...formData, jumlahPandegaPa: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#120804] border border-[#361B0E] rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-0.5">Pandega Putri</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.jumlahPandegaPi ?? 0}
                            onChange={(e) => setFormData({ ...formData, jumlahPandegaPi: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#120804] border border-[#361B0E] rounded px-2 py-1 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Checkboxes: Kegiatan Gudep */}
                    <div className="p-3.5 bg-[#180C07] rounded-xl border border-[#3D2014] space-y-2.5">
                      <label className="block text-xs font-bold text-amber-300">
                        Kegiatan Gudep yang Rutin Diselenggarakan:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {KEGIATAN_OPTIONS.map((item) => {
                          const isChecked = formData.kegiatanGudep?.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleArrayItem('kegiatanGudep', item)}
                              className={`p-2 rounded-lg text-left text-xs flex items-center gap-2 border transition-all ${
                                isChecked
                                  ? 'bg-amber-500/20 border-amber-500/60 text-white'
                                  : 'bg-[#120804] border-[#361B0E] text-stone-400 hover:text-stone-200'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isChecked ? 'bg-amber-500 border-amber-400 text-stone-950' : 'border-stone-600'
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: PRESTASI, SARPRAS, POTENSI & KENDALA (PDF Hal. 2 & 3) */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#351A0F] pb-2">
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span>Halaman 2 & 3: Prestasi, Sarpras, Potensi & Kebutuhan</span>
                      </h3>
                      <span className="text-[11px] text-stone-400">Analisis Kuesioner</span>
                    </div>

                    {/* Prestasi 3 Tahun Terakhir */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Prestasi Gudep dalam 3 Tahun Terakhir (Halaman 2):
                      </label>
                      <textarea
                        rows={2}
                        value={formData.prestasi3Tahun || ''}
                        onChange={(e) => setFormData({ ...formData, prestasi3Tahun: e.target.value })}
                        placeholder="Contoh: Keaktifan dalam kegiatan kepramukaan tingkat kwartir ranting dan penyelenggaraan kegiatan internal madrasah serta juara Lomba Tingkat (LT) Ranting."
                        className="w-full bg-[#180C07] border border-[#3E2114] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Sarana Prasarana (Halaman 2) */}
                    <div className="p-3.5 bg-[#180C07] rounded-xl border border-[#3D2014] space-y-2">
                      <label className="block text-xs font-bold text-amber-300">
                        Sarana & Prasarana yang Dimiliki Gudep (Halaman 2):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SARPRAS_OPTIONS.map((item) => {
                          const isChecked = formData.saranaPrasarana?.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleArrayItem('saranaPrasarana', item)}
                              className={`p-2 rounded-lg text-left text-xs flex items-center gap-2 border transition-all ${
                                isChecked
                                  ? 'bg-amber-500/20 border-amber-500/60 text-white'
                                  : 'bg-[#120804] border-[#361B0E] text-stone-400 hover:text-stone-200'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isChecked ? 'bg-amber-500 border-amber-400 text-stone-950' : 'border-stone-600'
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Potensi Gudep (Halaman 2) */}
                    <div className="p-3.5 bg-[#180C07] rounded-xl border border-[#3D2014] space-y-2">
                      <label className="block text-xs font-bold text-amber-300">
                        Potensi Unggulan Gudep (Halaman 2):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {POTENSI_OPTIONS.map((item) => {
                          const isChecked = formData.potensiGudep?.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleArrayItem('potensiGudep', item)}
                              className={`p-2 rounded-lg text-left text-xs flex items-center gap-2 border transition-all ${
                                isChecked
                                  ? 'bg-amber-500/20 border-amber-500/60 text-white'
                                  : 'bg-[#120804] border-[#361B0E] text-stone-400 hover:text-stone-200'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isChecked ? 'bg-amber-500 border-amber-400 text-stone-950' : 'border-stone-600'
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Kendala Gudep (Halaman 3) */}
                    <div className="p-3.5 bg-[#180C07] rounded-xl border border-[#3D2014] space-y-2">
                      <label className="block text-xs font-bold text-amber-300">
                        Kendala / Hambatan yang Dihadapi Gudep (Halaman 3):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {KENDALA_OPTIONS.map((item) => {
                          const isChecked = formData.kendalaGudep?.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleArrayItem('kendalaGudep', item)}
                              className={`p-2 rounded-lg text-left text-xs flex items-center gap-2 border transition-all ${
                                isChecked
                                  ? 'bg-red-500/20 border-red-500/50 text-red-200'
                                  : 'bg-[#120804] border-[#361B0E] text-stone-400 hover:text-stone-200'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isChecked ? 'bg-red-500 border-red-400 text-stone-950' : 'border-stone-600'
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Kebutuhan Pembinaan (Halaman 3) */}
                    <div className="p-3.5 bg-[#180C07] rounded-xl border border-[#3D2014] space-y-2">
                      <label className="block text-xs font-bold text-amber-300">
                        Kebutuhan Pembinaan dari Kwartir Ranting (Halaman 3):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {KEBUTUHAN_OPTIONS.map((item) => {
                          const isChecked = formData.kebutuhanPembinaan?.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleArrayItem('kebutuhanPembinaan', item)}
                              className={`p-2 rounded-lg text-left text-xs flex items-center gap-2 border transition-all ${
                                isChecked
                                  ? 'bg-amber-500/20 border-amber-500/60 text-white'
                                  : 'bg-[#120804] border-[#361B0E] text-stone-400 hover:text-stone-200'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isChecked ? 'bg-amber-500 border-amber-400 text-stone-950' : 'border-stone-600'
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: MEDIA SOSIAL, BERKAS & BUAT AKUN LOGIN (PDF Hal. 4 & Akun Akses) */}
                {currentStep === 4 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#351A0F] pb-2">
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>Halaman 4: Media Sosial, Berkas & Buat Akun Gudep</span>
                      </h3>
                      <span className="text-[11px] text-stone-400">Paling Penting: Akses Login</span>
                    </div>

                    {/* Media Sosial */}
                    <div className="p-3.5 bg-[#180C07] rounded-xl border border-[#3D2014] space-y-3">
                      <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Media Sosial & Website Pangkalan (Halaman 4)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1 flex items-center gap-1">
                            <Instagram className="w-3 h-3 text-pink-400" />
                            <span>Instagram:</span>
                          </label>
                          <input
                            type="text"
                            value={formData.mediaSosial?.instagram || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              mediaSosial: { ...formData.mediaSosial, instagram: e.target.value }
                            })}
                            placeholder="@mtsmanbaulislam"
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1 flex items-center gap-1">
                            <Facebook className="w-3 h-3 text-blue-400" />
                            <span>Facebook:</span>
                          </label>
                          <input
                            type="text"
                            value={formData.mediaSosial?.facebook || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              mediaSosial: { ...formData.mediaSosial, facebook: e.target.value }
                            })}
                            placeholder="MTs Manbaul Islam"
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1 flex items-center gap-1">
                            <Video className="w-3 h-3 text-red-400" />
                            <span>TikTok:</span>
                          </label>
                          <input
                            type="text"
                            value={formData.mediaSosial?.tiktok || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              mediaSosial: { ...formData.mediaSosial, tiktok: e.target.value }
                            })}
                            placeholder="@pramuka_manbaulislam"
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-emerald-400" />
                            <span>Website Lembaga / Gudep:</span>
                          </label>
                          <input
                            type="text"
                            value={formData.mediaSosial?.website || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              mediaSosial: { ...formData.mediaSosial, website: e.target.value }
                            })}
                            placeholder="https://mtsmanbaulislam.cyou"
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dokumen & Foto Lampiran */}
                    <div className="p-3.5 bg-[#180C07] rounded-xl border border-[#3D2014] space-y-3">
                      <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Berkas & Dokumen Pendukung (Halaman 4)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">
                            Nama Berkas SK Gudep Terbaru (PDF Kwarran):
                          </label>
                          <input
                            type="text"
                            value={formData.skGudepFileName || ''}
                            onChange={(e) => setFormData({ ...formData, skGudepFileName: e.target.value })}
                            placeholder="Contoh: SK_Kwartir_Ranting_MTs_Manbaul_Islam.pdf"
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">
                            Tautan URL / Drive SK Gudep:
                          </label>
                          <input
                            type="text"
                            value={formData.skGudepUrl || ''}
                            onChange={(e) => setFormData({ ...formData, skGudepUrl: e.target.value })}
                            placeholder="https://mtsmanbaulislam.cyou/sk-gudep.pdf"
                            className="w-full bg-[#120804] border border-[#361B0E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* BUAT USER DAN PASSWORD UNTUK MASUK KE AKUN GUGUS DEPAN */}
                    <div className="p-4 bg-gradient-to-b from-[#2A150D] to-[#1E0F09] rounded-2xl border-2 border-amber-500/50 space-y-3.5 shadow-lg">
                      <div className="flex items-start gap-2.5 pb-2 border-b border-[#442316]">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-base flex-shrink-0">
                          🔐
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            Buat Username & Kata Sandi Akun Gugus Depan
                          </h4>
                          <p className="text-[11px] text-amber-200/90 leading-tight mt-0.5">
                            Kredensial ini akan digunakan pangkalan untuk masuk (login) ke dashboard Gugus Depan setelah diverifikasi dan diaktifkan oleh Pengurus Kwarran.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-stone-200 mb-1">
                            Username Pilihan Akun Gudep <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.akunGudep?.username || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              akunGudep: {
                                ...formData.akunGudep!,
                                username: e.target.value.toLowerCase().replace(/\s+/g, '')
                              }
                            })}
                            placeholder="Contoh: pembina.mtsmanbaul / gudep.04075"
                            className="w-full bg-[#120804] border border-[#48281A] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                          />
                          <span className="text-[10px] text-stone-400 mt-0.5 block">Hanya huruf kecil, angka, dan titik tanpa spasi</span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-200 mb-1">
                            Kata Sandi / PIN Akses Gudep <span className="text-amber-400">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={formData.akunGudep?.password || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                akunGudep: {
                                  ...formData.akunGudep!,
                                  password: e.target.value
                                }
                              })}
                              placeholder="Minimal 6 karakter"
                              className="w-full bg-[#120804] border border-[#48281A] focus:border-amber-500 rounded-xl px-3 py-2 pr-10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-200 mb-1">
                            Nama Lengkap Penanggung Jawab Akun <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.akunGudep?.namaPendaftar || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              akunGudep: {
                                ...formData.akunGudep!,
                                namaPendaftar: e.target.value
                              }
                            })}
                            placeholder="Contoh: Akhmad Taufik, S.Pd.I."
                            className="w-full bg-[#120804] border border-[#48281A] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-200 mb-1">
                            Nomor WhatsApp Aktif (Untuk Notifikasi) <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.akunGudep?.noWaPendaftar || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              akunGudep: {
                                ...formData.akunGudep!,
                                noWaPendaftar: e.target.value
                              }
                            })}
                            placeholder="Contoh: 081388992211"
                            className="w-full bg-[#120804] border border-[#48281A] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-stone-200 mb-1">
                            Email Resmi Pangkalan / Pembina
                          </label>
                          <input
                            type="email"
                            value={formData.akunGudep?.emailPendaftar || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              akunGudep: {
                                ...formData.akunGudep!,
                                emailPendaftar: e.target.value
                              }
                            })}
                            placeholder="Contoh: mtsmanbaulislam@gmail.com"
                            className="w-full bg-[#120804] border border-[#48281A] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-[#170B05] rounded-xl border border-amber-500/30 text-xs text-stone-300 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">
                          <strong>Penting:</strong> Setelah Anda menekan tombol "Kirim Pendaftaran & Buat Akun", status pendaftaran Anda akan berstatus <strong>"Menunggu Verifikasi Pengurus"</strong>. Pengurus Kwarran akan memvalidasi data sebelum mengaktifkan login Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-[#3B1F13]">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-4 py-2 bg-[#28150E] hover:bg-[#381D13] text-stone-300 rounded-xl text-xs font-semibold border border-[#48281A] flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali ke Langkah Sebelumnya</span>
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow flex items-center gap-1.5 transition-colors"
                    >
                      <span>Lanjut ke Langkah Berikutnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-2 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Mengirimkan Registrasi...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Kirim Pendaftaran & Buat Akun Gudep</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: CEK STATUS VERIFIKASI AKUN */}
        {activeTab === 'status' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            <div className="bg-[#2A160E] border border-[#48281A] rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" />
                <span>Pelacakan Status Pendaftaran Gudep & Akun</span>
              </h3>
              <p className="text-xs text-stone-400">
                Masukkan <strong>Nomor Registrasi</strong> (contoh: REG-GD-2026-001) atau <strong>Username Akun</strong> atau <strong>Nama Pangkalan</strong> untuk memeriksa apakah pendaftaran Anda telah diverifikasi oleh Pengurus Kwarran.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={statusSearchQuery}
                  onChange={(e) => setStatusSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchStatus()}
                  placeholder="Ketik Nomor Registrasi atau Username atau Nama Pangkalan..."
                  className="flex-1 bg-[#170C07] border border-[#442316] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSearchStatus}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Cek Status</span>
                </button>
              </div>
            </div>

            {/* Search Result */}
            {searchAttempted && (
              <div>
                {foundStatus ? (
                  <div className="bg-[#23120A] border border-[#492718] rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between flex-wrap gap-2 pb-3 border-b border-[#3D2014]">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                          Nomor Registrasi:
                        </span>
                        <strong className="text-base font-mono text-amber-400">
                          {foundStatus.noRegistrasi}
                        </strong>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {foundStatus.namaPangkalan}
                        </h4>
                      </div>

                      {/* Status Badge */}
                      {foundStatus.statusVerifikasi === 'Disetujui' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>TERVERIFIKASI & AKTIF</span>
                        </span>
                      ) : foundStatus.statusVerifikasi === 'Ditolak' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-300 bg-red-500/20 border border-red-500/40 px-3 py-1 rounded-full">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span>DITOLAK / REVISI</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                          <span>MENUNGGU VERIFIKASI PENGURUS</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[11px]">Tanggal Pengajuan:</span>
                        <span className="text-stone-200">{foundStatus.tanggalRegistrasi}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[11px]">Nomor Gudep:</span>
                        <span className="text-amber-300 font-semibold">{foundStatus.nomorGudep}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[11px]">Username Akun Gudep:</span>
                        <span className="font-mono text-white bg-[#150A05] px-2 py-0.5 rounded border border-stone-800">
                          {foundStatus.akunGudep.username}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[11px]">Penanggung Jawab / Pendaftar:</span>
                        <span className="text-stone-200">{foundStatus.akunGudep.namaPendaftar}</span>
                      </div>
                    </div>

                    {/* Status Specific Guidance */}
                    {foundStatus.statusVerifikasi === 'Disetujui' ? (
                      <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Akun Gudep Anda Telah Diaktifkan!</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          Pangkalan Anda telah resmi terdaftar di Buku Induk Kwarran Tanah Sareal. Silakan klik menu <strong>"Masuk Pengurus"</strong> di pojok kanan atas portal dan gunakan username <strong className="font-mono text-white">"{foundStatus.akunGudep.username}"</strong> serta kata sandi yang Anda buat saat pendaftaran.
                        </p>
                      </div>
                    ) : foundStatus.statusVerifikasi === 'Ditolak' ? (
                      <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-red-300">
                          <AlertCircle className="w-4 h-4" />
                          <span>Pendaftaran Perlu Revisi / Belum Disetujui</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          Catatan Pengurus: {foundStatus.catatanVerifikasi || 'Dokumen atau data yang diunggah belum lengkap. Silakan koordinasikan dengan Sekretariat Kwarran Tanah Sareal.'}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-300">
                          <Info className="w-4 h-4" />
                          <span>Berkas Sedang Ditinjau Pengurus Kwarran</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          Pendaftaran pangkalan dan akun Anda telah diterima oleh Sekretariat Kwarran Tanah Sareal. Akun akan aktif segera setelah dilakukan verifikasi berkas oleh Tim Pengurus.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#1C0D07] border border-[#3A1B0F] rounded-xl p-8 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-stone-800/80 text-stone-400 flex items-center justify-center mx-auto">
                      <Search className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-stone-300">Data Pendaftaran Tidak Ditemukan</h4>
                    <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
                      Pastikan nomor registrasi atau username yang Anda masukkan sudah benar, atau ajukan pendaftaran baru melalui tab Formulir.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-[#170C07] px-6 py-3 border-t border-[#351A0F] flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>SIKAP Terintegrasi • Kwarran Tanah Sareal</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white font-medium underline"
          >
            Tutup Jendela
          </button>
        </div>

      </div>
    </div>
  );
};
