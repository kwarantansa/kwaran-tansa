import React, { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { Member } from '../types';
import { getCustomPengurusList, PengurusAccountItem } from '../utils/auth';
import { ShieldCheck, Calendar, Award, MapPin, Printer, Download, RotateCw } from 'lucide-react';

interface KtaCardProps {
  member: Member;
  onClose?: () => void;
  ketuaKwarran?: PengurusAccountItem;
}

export const KtaCard: React.FC<KtaCardProps> = ({ member, onClose, ketuaKwarran: propKetuaKwarran }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const activeKetua = useMemo(() => {
    if (propKetuaKwarran) return propKetuaKwarran;
    const list = getCustomPengurusList();
    return list.find(p => p.role === 'ketua_kwarran') || list[0];
  }, [propKetuaKwarran]);

  useEffect(() => {
    // Generate QR code containing official verification URL / ID payload
    const verificationPayload = JSON.stringify({
      nta: member.nta,
      nama: member.namaLengkap,
      gudep: member.noGudep,
      pangkalan: member.namaPangkalan,
      golongan: member.golongan,
      kwarran: 'Tanah Sareal',
      kwarcab: 'Kota Bogor',
      validThru: member.berlakuKtaSampai
    });

    QRCode.toDataURL(verificationPayload, {
      width: 160,
      margin: 1,
      color: {
        dark: '#451a03',
        light: '#ffffff'
      }
    }).then(url => setQrDataUrl(url)).catch(err => console.error(err));
  }, [member]);

  const getGolonganTheme = (golongan: string) => {
    switch (golongan) {
      case 'Siaga':
        return {
          bg: 'from-emerald-700 via-emerald-800 to-teal-900',
          accent: 'bg-emerald-500 text-white',
          border: 'border-emerald-400',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          colorName: 'Hijau Siaga'
        };
      case 'Penggalang':
        return {
          bg: 'from-rose-700 via-red-800 to-red-950',
          accent: 'bg-rose-500 text-white',
          border: 'border-rose-400',
          badge: 'bg-rose-100 text-rose-900 border-rose-300',
          colorName: 'Merah Penggalang'
        };
      case 'Penegak':
        return {
          bg: 'from-amber-600 via-amber-700 to-yellow-900',
          accent: 'bg-amber-400 text-amber-950',
          border: 'border-amber-300',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          colorName: 'Kuning Penegak'
        };
      case 'Pandega':
        return {
          bg: 'from-amber-800 via-yellow-900 to-stone-900',
          accent: 'bg-amber-600 text-white',
          border: 'border-amber-400',
          badge: 'bg-amber-100 text-amber-950 border-amber-400',
          colorName: 'Coklat Pandega'
        };
      default: // Pembina, Pelatih, Dewasa
        return {
          bg: 'from-amber-950 via-stone-900 to-black',
          accent: 'bg-amber-500 text-stone-950',
          border: 'border-amber-400',
          badge: 'bg-amber-100 text-amber-900 border-amber-400',
          colorName: 'Coklat Emas Pembina'
        };
    }
  };

  const theme = getGolonganTheme(member.golongan);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Action Controls */}
      <div className="flex items-center justify-between w-full max-w-md px-2 print:hidden">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-[#E5DFD5] rounded-xl shadow-sm hover:bg-[#FAF8F5] transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5 text-amber-600" />
          {isFlipped ? 'Lihat Tampak Depan' : 'Lihat Tampak Belakang'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm border border-amber-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Kartu
          </button>
        </div>
      </div>

      {/* Card Container with Realistic ID Card Dimension (Ratio ~ 85.6mm x 53.98mm) */}
      <div className="relative w-[360px] sm:w-[400px] h-[250px] sm:h-[260px] perspective-1000 shadow-2xl rounded-2xl print:shadow-none print:m-0">
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* SISI DEPAN (FRONT) */}
          <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white p-3.5 border-2 border-amber-500/40 shadow-xl flex flex-col justify-between backface-hidden">
            {/* Background Texture & Watermark */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
            
            {/* Header KTA */}
            <div className="relative z-10 flex items-center justify-between border-b border-amber-500/30 pb-2">
              <div className="flex items-center gap-2.5">
                {/* Logo Gerakan Pramuka Tunas Kelapa */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-amber-950 flex items-center justify-center text-amber-300 font-bold text-xs tracking-tighter">
                    ⚜️
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 leading-tight">
                    Gerakan Pramuka Indonesia
                  </h4>
                  <p className="text-[9px] text-amber-100/90 font-medium">
                    Kwarran Tanah Sareal • Kwarcab Kota Bogor
                  </p>
                </div>
              </div>

              {/* Golongan Badge */}
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm ${theme.badge}`}>
                {member.golongan}
              </div>
            </div>

            {/* Body Info */}
            <div className="relative z-10 flex gap-3.5 items-center my-auto">
              {/* Foto Member */}
              <div className="relative flex-shrink-0">
                <div className="w-[72px] h-[90px] rounded-lg overflow-hidden border-2 border-amber-400/80 shadow-md bg-stone-800">
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
                {/* Blood Type Badge */}
                {member.golonganDarah && (
                  <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-white shadow">
                    {member.golonganDarah}
                  </div>
                )}
              </div>

              {/* Detail Texts */}
              <div className="flex-1 min-w-0 space-y-1">
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-amber-300/80 font-semibold">
                    Nomor Tanda Anggota (NTA)
                  </p>
                  <p className="text-[12px] font-mono font-bold tracking-wide text-amber-200 truncate">
                    {member.nta}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                    {member.namaLengkap}
                  </h3>
                  <p className="text-[10px] text-amber-100/80 truncate">
                    {member.tingkatan}
                  </p>
                </div>

                <div className="pt-0.5 grid grid-cols-2 gap-1 text-[9px]">
                  <div>
                    <span className="text-stone-400 block text-[7.5px]">Gudep / Pangkalan</span>
                    <span className="text-white font-medium truncate block">
                      {member.noGudep} • {member.namaPangkalan}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[7.5px]">Masa Berlaku</span>
                    <span className="text-amber-300 font-semibold block">
                      s.d {member.berlakuKtaSampai}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Bar */}
            <div className="relative z-10 flex items-center justify-between border-t border-amber-500/20 pt-1 text-[8px] text-amber-200/70">
              <span className="flex items-center gap-1 font-mono">
                <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
                SISKA-SIKAP TERVERIFIKASI
              </span>
              <span className="text-stone-400 font-sans">Kwarda Jawa Barat</span>
            </div>
          </div>

          {/* SISI BELAKANG (BACK) */}
          <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-stone-900 text-stone-200 p-3.5 border-2 border-amber-500/40 shadow-xl flex flex-col justify-between rotate-y-180 backface-hidden">
            {/* Header Belakang */}
            <div className="flex items-center justify-between border-b border-stone-700 pb-1.5">
              <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                Ketentuan Pemegang KTA Pramuka
              </div>
              <div className="text-[8px] text-stone-400">
                Kwarran Tanah Sareal
              </div>
            </div>

            {/* Dasa Darma / Info Teks Ringkas */}
            <div className="grid grid-cols-12 gap-3 items-center my-auto">
              <div className="col-span-8 text-[8px] text-stone-300 leading-relaxed space-y-1">
                <p className="font-semibold text-amber-200">
                  Janji & Kode Kehormatan Pramuka:
                </p>
                <p className="text-stone-400 text-[7.5px] italic">
                  &ldquo;Demi kehormatanku aku berjanji akan bersungguh-sungguh menjalankan kewajibanku terhadap Tuhan Yang Maha Esa, Negara Kesatuan Republik Indonesia dan mengamalkan Pancasila...&rdquo;
                </p>
                <ul className="list-disc pl-3 text-[7.5px] text-stone-300 space-y-0.5">
                  <li>Kartu ini adalah identitas resmi anggota Gerakan Pramuka.</li>
                  <li>Wajib dibawa pada saat kegiatan kepramukaan resmi.</li>
                  <li>Jika menemukan kartu ini, harap hubungi Sekretariat Kwarran Tanah Sareal.</li>
                </ul>
              </div>

              {/* QR Code Verifikasi */}
              <div className="col-span-4 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-1 rounded-lg shadow-md border border-amber-500/30">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-stone-200 animate-pulse rounded" />
                  )}
                </div>
                <span className="text-[7px] text-stone-400 font-mono mt-1">
                  Scan Verifikasi
                </span>
              </div>
            </div>

            {/* Tanda Tangan & Cap Kwarran */}
            <div className="flex items-end justify-between border-t border-stone-800 pt-1.5">
              <div className="text-[7.5px] text-stone-400">
                <p>Kel. {member.kelurahan}, Kec. Tanah Sareal</p>
                <p className="text-amber-400/90 font-mono">NIK: {member.nik.slice(0, 6)}******{member.nik.slice(-4)}</p>
              </div>

              <div className="text-right text-[7.5px]">
                <p className="text-stone-400">Kwartir Ranting Tanah Sareal</p>
                <p className="text-stone-300 font-semibold">Ketua Kwarran,</p>
                <div className="text-amber-300 font-bold text-[7.5px] mt-0.5">
                  [ Ttd & Cap Elektronik ]
                </div>
                <p className="font-bold text-amber-200 mt-0.5 leading-tight">{activeKetua?.name}</p>
                <p className="text-[6.5px] text-stone-400 font-mono">NTA. {activeKetua?.nta || '09.02.04.001.0001'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
