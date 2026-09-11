import { SuratKeluarTemplate, KlasifikasiSuratKeluar } from '../types';

export const KWARANTANSA_LETTERHEAD = {
  namaOrganisasi: 'GERAKAN PRAMUKA',
  kwartir: 'KWARTIR RANTING TANAH SAREAL',
  wilayah: 'KOTA BOGOR - JAWA BARAT',
  kodeKwartir: '09.02.04',
  alamat: 'Jl. Kebon Pedes No. 12, Kel. Kebon Pedes, Kec. Tanah Sareal, Kota Bogor 16162',
  kontak: 'Email: kwarran.tanahsareal@gmail.com • Telp/WA: 0812-8765-4321',
  ketuaKwarran: 'Kak Drs. H. Mulyadi, M.Pd',
  ketuaNta: '09.02.04.001.0001',
  sekretarisKwarran: 'Kak Siti Fatimah, S.Pd',
  sekretarisNta: '09.02.04.002.0005'
};

export const SURAT_KELUAR_TEMPLATES: SuratKeluarTemplate[] = [
  {
    id: 'tpl-undangan-rakor',
    kodeKlasifikasi: 'A',
    namaTemplate: 'Surat Undangan Rapat Kerja Ranting / Rakor Pembina',
    deskripsi: 'Undangan resmi pertemuan pengurus, ketua majelis pembimbing gugus depan (Mabigus), dan pembina satuan se-Kecamatan Tanah Sareal.',
    kategori: 'Undangan Resmi',
    perihalDefault: 'Undangan Rapat Koordinasi & Kerja Ranting Tahun 2026',
    lampiranDefault: '1 (satu) Berkas Agenda Rapat',
    tujuanDefault: 'Yth. Ketua Majelis Pembimbing Gugus Depan (Mabigus) & Pembina Satuan',
    tempatTujuanDefault: 'Se-Kecamatan Tanah Sareal\ndi Tempat',
    salamPembukaDefault: 'Salam Pramuka,',
    isiPembukaDefault: 'Dalam rangka evaluasi program kerja semester berjalan serta konsolidasi persiapan kegiatan kepramukaan tingkat Kwartir Ranting Tanah Sareal Tahun 2026, bersama ini kami mengundang Kakak untuk hadir pada:',
    detailKegiatanDefault: {
      hariTanggal: 'Sabtu, 26 September 2026',
      waktu: '08.30 WIB s.d. Selesai',
      tempat: 'Aula Kantor Kecamatan Tanah Sareal / Sanggar Pramuka Kwarran',
      acara: 'Rapat Koordinasi & Pembahasan Program Kerja Kwarran Semester Genap',
      pakaian: 'Seragam Pramuka Lengkap (SPL)'
    },
    isiBadanDefault: 'Mengingat pentingnya agenda musyawarah ini untuk kelancaran pembinaan gugus depan di wilayah Kwartir Ranting Tanah Sareal, kami sangat mengharapkan kehadiran Kakak tepat pada waktunya.',
    isiPenutupDefault: 'Demikian surat undangan ini kami sampaikan. Atas perhatian, kesediaan, dan kerjasama Kakak, kami haturkan terima kasih.',
    penandatanganJabatanDefault: 'Ketua Kwartir Ranting Tanah Sareal',
    penandatanganNamaDefault: 'Kak Drs. H. Mulyadi, M.Pd',
    penandatanganNtaDefault: 'NTA. 09.02.04.001.0001',
    tembusanDefault: [
      'Yth. Ketua Kwartir Cabang Gerakan Pramuka Kota Bogor',
      'Yth. Camat Tanah Sareal selaku Ketua Mabiran',
      'Arsip Kwarran Tanah Sareal'
    ]
  },
  {
    id: 'tpl-edaran-hari-pramuka',
    kodeKlasifikasi: 'A',
    namaTemplate: 'Surat Edaran Peringatan Hari Pramuka & Kegiatan Akbar',
    deskripsi: 'Pemberitahuan resmi rangkaian kegiatan apel akbar, bakti sosial, lomba ketangkasan, dan peringatan Hari Pramuka se-Ranting.',
    kategori: 'Surat Edaran',
    perihalDefault: 'Edaran Peringatan Hari Pramuka Ke-65 Kwartir Ranting Tanah Sareal',
    lampiranDefault: '1 (satu) Berkas Petunjuk Teknis Kegiatan',
    tujuanDefault: 'Yth. Ketua Mabigus dan Pembina Gugus Depan Se-Kecamatan Tanah Sareal',
    tempatTujuanDefault: 'di Tempat',
    salamPembukaDefault: 'Salam Pramuka,',
    isiPembukaDefault: 'Menindaklanjuti Petunjuk Pelaksanaan Kwartir Cabang Kota Bogor dalam rangka menyambut dan memeriahkan Peringatan Hari Pramuka Ke-65 Tahun 2026, Kwartir Ranting Tanah Sareal akan menyelenggarakan rangkaian kegiatan serentak:',
    detailKegiatanDefault: {
      hariTanggal: 'Jumat s.d. Minggu, 14 - 16 Agustus 2026',
      waktu: '07.30 WIB s.d. Selesai',
      tempat: 'Lapangan Utama Alun-Alun / Bumi Perkemahan Ranting Tanah Sareal',
      acara: 'Apel Akbar Hari Pramuka, Lomba Ketangkasan Siaga & Penggalang, Bakti Bumbung Kemanusiaan',
      pakaian: 'Seragam Pramuka Lengkap (SPL)'
    },
    isiBadanDefault: 'Sehubungan dengan hal tersebut, kami menghimbau seluruh Pangkalan Gugus Depan (SD/MI, SMP/MTs, SMA/SMK/MA) untuk mengirimkan utusan perindukan dan pasukan sesuai juknis terlampir. Pendaftaran kontingen dibuka melalui sistem terpusat SISKA-SIKAP paling lambat tanggal 10 Agustus 2026.',
    isiPenutupDefault: 'Demikian surat edaran ini kami sampaikan untuk dipedomani bersama. Satyaku Kudarmakan, Darmaku Kubaktikan.',
    penandatanganJabatanDefault: 'Ketua Kwartir Ranting Tanah Sareal',
    penandatanganNamaDefault: 'Kak Drs. H. Mulyadi, M.Pd',
    penandatanganNtaDefault: 'NTA. 09.02.04.001.0001',
    tembusanDefault: [
      'Yth. Ketua Kwartir Cabang Gerakan Pramuka Kota Bogor',
      'Yth. Camat Tanah Sareal selaku Ketua Mabiran',
      'Yth. Kepala Puskesmas & Kapolsek Tanah Sareal',
      'Arsip Kwarran'
    ]
  },
  {
    id: 'tpl-surat-tugas-kontingen',
    kodeKlasifikasi: 'C',
    namaTemplate: 'Surat Tugas & Mandat Penugasan Petugas / Kontingen',
    deskripsi: 'Surat penugasan pembina, tim pendamping, dewan kerja, juri lomba, atau kontingen utusan Kwarran ke tingkat Kwarcab/Kwarda.',
    kategori: 'Surat Tugas & Mandat',
    perihalDefault: 'Surat Tugas Utusan Kontingen & Petugas Kwarran Tanah Sareal',
    lampiranDefault: '-',
    tujuanDefault: 'Yth. Kakak-kakak Pembina & Anggota yang Ditugaskan (Terlampir)',
    tempatTujuanDefault: 'di Tempat',
    salamPembukaDefault: 'Salam Pramuka,',
    isiPembukaDefault: 'Kwartir Ranting Gerakan Pramuka Tanah Sareal dengan ini memberikan TUGAS DAN MANDAT RESMI kepada:',
    detailKegiatanDefault: {
      hariTanggal: 'Senin s.d. Kamis, 12 - 15 Oktober 2026',
      waktu: '08.00 WIB s.d. Selesai',
      tempat: 'Bumi Perkemahan Cimandala / Gedung Pusdiklatcab Kota Bogor',
      acara: 'Partisipasi Kegiatan Jambore Cabang & Karang Pamitran Kwarcab Kota Bogor',
      pakaian: 'Seragam Pramuka Lengkap'
    },
    isiBadanDefault: 'Untuk bertindak atas nama Kwartir Ranting Tanah Sareal dengan penuh disiplin, menjunjung tinggi Kode Kehormatan Tri Satya dan Dasa Darma Pramuka, serta melaporkan hasil pelaksanaan tugas kepada Kwartir Ranting setelah kegiatan berakhir.',
    isiPenutupDefault: 'Demikian surat tugas ini diterbitkan untuk dilaksanakan sebaik-baiknya dengan penuh rasa tanggung jawab dan dedikasi.',
    penandatanganJabatanDefault: 'Ketua Kwartir Ranting Tanah Sareal',
    penandatanganNamaDefault: 'Kak Drs. H. Mulyadi, M.Pd',
    penandatanganNtaDefault: 'NTA. 09.02.04.001.0001',
    tembusanDefault: [
      'Yth. Ketua Kwartir Cabang Kota Bogor',
      'Yth. Ketua Gugus Depan yang bersangkutan',
      'Arsip Kwarran'
    ]
  },
  {
    id: 'tpl-rekomendasi-gudep',
    kodeKlasifikasi: 'D',
    namaTemplate: 'Surat Rekomendasi Kegiatan Gugus Depan',
    deskripsi: 'Surat persetujuan dan rekomendasi resmi Kwarran atas permohonan pangkalan Gudep untuk melaksanakan kegiatan perkemahan, pelantikan, atau lomba.',
    kategori: 'Rekomendasi & Izin',
    perihalDefault: 'Rekomendasi Pelaksanaan Perkemahan Sabtu-Minggu (Persami) & Pelantikan Penggalang',
    lampiranDefault: '-',
    tujuanDefault: 'Yth. Ketua Majelis Pembimbing Gugus Depan (Ka Mabigus)',
    tempatTujuanDefault: 'Pangkalan SMP Negeri 5 Kota Bogor (Gudep 04.081 - 04.082)\ndi Tempat',
    salamPembukaDefault: 'Salam Pramuka,',
    isiPembukaDefault: 'Memperhatikan surat permohonan dari Pangkalan Gugus Depan nomor: 04.081/SMPN5/IX/2026 perihal Permohonan Izin & Rekomendasi Kegiatan Kepramukaan di luar pangkalan:',
    detailKegiatanDefault: {
      hariTanggal: 'Sabtu - Minggu, 17 - 18 Oktober 2026',
      waktu: 'Mulai Pukul 07.30 WIB s.d. Selesai',
      tempat: 'Bumi Perkemahan Sukamantri / Highland Camp Bogor',
      acara: 'Perkemahan Pelantikan Kenaikan Tingkat Penggalang Rakit & Terap',
      pakaian: 'Seragam Pramuka & Pakaian Lapangan'
    },
    isiBadanDefault: 'Pada prinsipnya Kwartir Ranting Gerakan Pramuka Tanah Sareal MEMBERIKAN REKOMENDASI DAN DUKUNGAN atas kegiatan tersebut dengan ketentuan: wajib mengutamakan manajemen risiko keselamatan peserta, berkoordinasi dengan aparat wilayah setempat, serta didampingi Pembina Satuan berijazah KMD/KML aktif.',
    isiPenutupDefault: 'Demikian surat rekomendasi ini kami berikan untuk dipergunakan sebagaimana mestinya.',
    penandatanganJabatanDefault: 'Ketua Kwartir Ranting Tanah Sareal',
    penandatanganNamaDefault: 'Kak Drs. H. Mulyadi, M.Pd',
    penandatanganNtaDefault: 'NTA. 09.02.04.001.0001',
    tembusanDefault: [
      'Yth. Ketua Kwartir Cabang Kota Bogor',
      'Yth. Camat Tanah Sareal selaku Ka Mabiran',
      'Arsip Kwarran Tanah Sareal'
    ]
  },
  {
    id: 'tpl-izin-tempat-fasilitas',
    kodeKlasifikasi: 'A',
    namaTemplate: 'Surat Permohonan Izin Tempat & Fasilitas ke Instansi',
    deskripsi: 'Permohonan peminjaman aula pertemuan, lapangan upacara, atau fasilitas sarana prasarana kepada pimpinan instansi / sekolah / kecamatan.',
    kategori: 'Permohonan Izin',
    perihalDefault: 'Permohonan Peminjaman Tempat & Fasilitas Kegiatan Gelar Senja Kwarran',
    lampiranDefault: '1 (satu) Berkas Rundown & Layout Acara',
    tujuanDefault: 'Yth. Camat Tanah Sareal / Kepala Sekolah',
    tempatTujuanDefault: 'Kecamatan Tanah Sareal, Kota Bogor\ndi Tempat',
    salamPembukaDefault: 'Salam Pramuka,',
    isiPembukaDefault: 'Dalam rangka pelaksanaan Upacara Gelar Senja dan Penyerahan Piagam Apresiasi Gugus Depan Berprestasi Tingkat Kwartir Ranting Tanah Sareal Tahun 2026, bersama ini kami memohon izin penggunaan fasilitas:',
    detailKegiatanDefault: {
      hariTanggal: 'Kamis, 22 Oktober 2026',
      waktu: '14.00 s.d. 18.00 WIB',
      tempat: 'Plaza Lapangan Kantor Kecamatan Tanah Sareal / Aula Pertemuan',
      acara: 'Upacara Gelar Senja & Penyerahan Penghargaan Gudep Berprestasi',
      pakaian: 'Seragam Pramuka Lengkap'
    },
    isiBadanDefault: 'Kami berkomitmen untuk menjaga ketertiban, kebersihan, dan keamanan sarana prasarana selama kegiatan berlangsung. Koordinasi teknis akan ditangani oleh Panitia Pelaksana Kwarran.',
    isiPenutupDefault: 'Besar harapan kami kiranya Bapak/Ibu berkenan mengabulkan permohonan ini. Atas perkenan dan dukungannya, kami ucapkan terima kasih.',
    penandatanganJabatanDefault: 'Sekretaris Kwartir Ranting Tanah Sareal',
    penandatanganNamaDefault: 'Kak Siti Fatimah, S.Pd',
    penandatanganNtaDefault: 'NTA. 09.02.04.002.0005',
    tembusanDefault: [
      'Yth. Ketua Kwartir Ranting Tanah Sareal (sebagai laporan)',
      'Arsip Sekretariat Kwarran'
    ]
  },
  {
    id: 'tpl-pengantar-kwarcab',
    kodeKlasifikasi: 'D',
    namaTemplate: 'Surat Pengantar Berkas & Usulan ke Kwarcab Kota Bogor',
    deskripsi: 'Pengantar resmi penyampaian berkas laporan semester ranting, usulan tanda kehormatan/penghargaan, dan borang akreditasi pangkalan.',
    kategori: 'Surat Pengantar',
    perihalDefault: 'Pengantar Berkas Usulan Tanda Penghargaan Gerakan Pramuka (Pancawarsa) & Laporan Semester',
    lampiranDefault: '1 (satu) Bundel Berkas Portofolio',
    tujuanDefault: 'Yth. Ketua Kwartir Cabang Gerakan Pramuka Kota Bogor',
    tempatTujuanDefault: 'Cq. Komisi Pembinaan Anggota Dewasa & Organisasi\ndi Kota Bogor',
    salamPembukaDefault: 'Salam Pramuka,',
    isiPembukaDefault: 'Bersama ini kami sampaikan dengan hormat kelengkapan berkas usulan administratif dari Kwartir Ranting Tanah Sareal sebagai berikut:',
    detailKegiatanDefault: {
      hariTanggal: '-',
      waktu: '-',
      tempat: 'Sekretariat Kwarcab Kota Bogor',
      acara: '1. Berkas Portofolio Usulan Lencana Pancawarsa bagi Pembina (12 Berkas)\n2. Rekapitulasi Laporan Semester Ganjil Potensi Gugus Depan Se-Tanah Sareal\n3. Berkas Usulan Nomor Gudep Baru Satuan Komunitas',
      pakaian: '-'
    },
    isiBadanDefault: 'Seluruh berkas fisik dan digital telah diverifikasi oleh tim sekretariat dan bidang organisasi Kwartir Ranting Tanah Sareal sesuai ketentuan petunjuk penyelenggaraan yang berlaku.',
    isiPenutupDefault: 'Demikian surat pengantar ini kami sampaikan untuk dapat diproses lebih lanjut. Atas perhatian dan kerjasamanya, kami haturkan terima kasih.',
    penandatanganJabatanDefault: 'Ketua Kwartir Ranting Tanah Sareal',
    penandatanganNamaDefault: 'Kak Drs. H. Mulyadi, M.Pd',
    penandatanganNtaDefault: 'NTA. 09.02.04.001.0001',
    tembusanDefault: [
      'Yth. Camat Tanah Sareal selaku Ka Mabiran',
      'Arsip Kwarran Tanah Sareal'
    ]
  },
  {
    id: 'tpl-pemberitahuan-iuran-kta',
    kodeKlasifikasi: 'A',
    namaTemplate: 'Surat Pemberitahuan Iuran Bulan Bakti & Tertib KTA',
    deskripsi: 'Pemberitahuan sosialisasi pengumpulan bumbung kepramukaan, pemutakhiran data KTA online, dan tertib administrasi pangkalan.',
    kategori: 'Pemberitahuan & Himbauan',
    perihalDefault: 'Pemberitahuan Tertib Administrasi Registrasi KTA & Partisipasi Bulan Bakti Pramuka',
    lampiranDefault: '1 Lembar Petunjuk Alur Registrasi SISKA-SIKAP',
    tujuanDefault: 'Yth. Seluruh Ketua Mabigus SD/MI, SMP/MTs, SMA/SMK/MA',
    tempatTujuanDefault: 'Se-Kecamatan Tanah Sareal\ndi Tempat',
    salamPembukaDefault: 'Salam Pramuka,',
    isiPembukaDefault: 'Dalam rangka mewujudkan tertib administrasi keanggotaan dan kepeloporan sosial Gerakan Pramuka se-Tanah Sareal, kami menghimbau seluruh gugus depan untuk:',
    detailKegiatanDefault: {
      hariTanggal: 'Batas Akhir: 30 November 2026',
      waktu: 'Setiap Hari Kerja (08.30 - 15.30 WIB)',
      tempat: 'Sekretariat Kwarran / Portal Online SISKA-SIKAP',
      acara: '1. Validasi data Nomor Gudep & NUP Pembina di aplikasi SISKA-SIKAP\n2. Pengajuan KTA Kolektif peserta didik golongan Siaga, Penggalang, Penegak\n3. Penyaluran Bumbung Kemanusiaan Pramuka Peduli Ranting',
      pakaian: '-'
    },
    isiBadanDefault: 'Partisipasi aktif dari seluruh pangkalan sangat menentukan pemeringkatan akreditasi gugus depan serta kesiapan data kontingen Ranting Tanah Sareal pada ajang-ajang kwartir cabang mendatang.',
    isiPenutupDefault: 'Demikian surat pemberitahuan ini disampaikan untuk dilaksanakan dengan sebaik-baiknya. Terima kasih atas dedikasi dan pengabdian Kakak.',
    penandatanganJabatanDefault: 'Ketua Kwartir Ranting Tanah Sareal',
    penandatanganNamaDefault: 'Kak Drs. H. Mulyadi, M.Pd',
    penandatanganNtaDefault: 'NTA. 09.02.04.001.0001',
    tembusanDefault: [
      'Yth. Ketua Kwartir Cabang Kota Bogor',
      'Yth. Pengawas Pembina Gugus Depan Se-Kecamatan Tanah Sareal',
      'Arsip Kwarran'
    ]
  }
];

export function generateLetterNumber(
  sequence: number,
  classification: KlasifikasiSuratKeluar = 'A',
  year: number = new Date().getFullYear()
): string {
  const padSeq = sequence.toString().padStart(3, '0');
  return `${padSeq}/09.02.04-${classification}/${year}`;
}
