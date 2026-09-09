import React, { useState } from 'react';
import { Member, Gudep } from '../types';
import { QrCode, Search, ShieldCheck, AlertCircle, CheckCircle2, X, Building2, User, Award, ExternalLink } from 'lucide-react';

interface QrVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  gudepList: Gudep[];
  onSelectMember?: (m: Member) => void;
}

export const QrVerifierModal: React.FC<QrVerifierModalProps> = ({
  isOpen,
  onClose,
  members,
  gudepList,
  onSelectMember
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  // Search logic
  const query = searchQuery.trim().toLowerCase();
  const matchedMember = query
    ? members.find(
        m =>
          m.nta.toLowerCase().includes(query) ||
          m.nik.toLowerCase().includes(query) ||
          m.namaLengkap.toLowerCase().includes(query)
      )
    : null;

  const matchedGudep = query
    ? gudepList.find(
        g =>
          g.noGudepPa.toLowerCase().includes(query) ||
          g.noGudepPi.toLowerCase().includes(query) ||
          g.namaPangkalan.toLowerCase().includes(query)
      )
    : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const handleQuickLookup = (code: string) => {
    setSearchQuery(code);
    setSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5DFD5]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#24140D] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-100">
                Verifikasi QR Code & Nomor Registrasi Pramuka
              </h3>
              <p className="text-xs text-stone-400">
                Pusat Validasi Keabsahan NTA, KTA Digital & Profil Gudep Kwarran Tanah Sareal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-semibold text-stone-800">
              Masukkan NTA, NIK, atau Nama Anggota / Pangkalan:
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearched(true);
                }}
                placeholder="Contoh: 09.02.04.071.0023 atau 04.081..."
                className="w-full pl-10 pr-24 py-2.5 text-sm bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-600 font-mono"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 text-xs font-bold text-stone-950 bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors border border-amber-400"
              >
                Cek Data
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-stone-500">
              <span>Contoh Cepat:</span>
              <button
                type="button"
                onClick={() => handleQuickLookup('09.02.04.071.0023')}
                className="px-2 py-0.5 bg-[#FAF8F5] hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-[#E5DFD5] rounded-md font-mono text-[11px] transition-colors"
              >
                Siaga (09.02.04.071.0023)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLookup('09.02.04.071.0001')}
                className="px-2 py-0.5 bg-[#FAF8F5] hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-[#E5DFD5] rounded-md font-mono text-[11px] transition-colors"
              >
                Pembina NTA (0001)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLookup('04.081')}
                className="px-2 py-0.5 bg-[#FAF8F5] hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-[#E5DFD5] rounded-md font-mono text-[11px] transition-colors"
              >
                Gudep SMPN 5 (04.081)
              </button>
            </div>
          </form>

          {/* Results Display */}
          {searched && (
            <div className="space-y-4">
              {matchedMember ? (
                <div className="p-5 bg-emerald-50/50 border border-emerald-300 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-700 text-white rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                          Dokumen Terverifikasi Sah
                        </span>
                        <h4 className="text-base font-bold text-stone-900 mt-0.5">
                          {matchedMember.namaLengkap}
                        </h4>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                      NTA: {matchedMember.nta}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-xl border border-emerald-200">
                    <div>
                      <span className="text-stone-500 block text-[10px]">Golongan & Tingkat</span>
                      <span className="font-semibold text-stone-800">
                        {matchedMember.golongan} ({matchedMember.tingkatan})
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Pangkalan / Gudep</span>
                      <span className="font-semibold text-stone-800 truncate block">
                        {matchedMember.namaPangkalan} ({matchedMember.noGudep})
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Kelurahan / Wilayah</span>
                      <span className="font-semibold text-stone-800">
                        Kel. {matchedMember.kelurahan}, Tanah Sareal
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Status KTA Digital</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {matchedMember.statusKta}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Masa Berlaku</span>
                      <span className="font-medium text-stone-700">
                        s.d {matchedMember.berlakuKtaSampai}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">Status Sinkronisasi</span>
                      <span className="font-semibold text-blue-800">
                        {matchedMember.statusSync}
                      </span>
                    </div>
                  </div>

                  {onSelectMember && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          onSelectMember(matchedMember);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 border border-amber-300 rounded-lg transition-colors"
                      >
                        Buka Kartu KTA Digital
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : matchedGudep ? (
                <div className="p-5 bg-blue-50/50 border border-blue-300 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-700 text-white rounded-lg">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md">
                          Gugus Depan Terdata Resmi
                        </span>
                        <h4 className="text-base font-bold text-stone-900 mt-0.5">
                          {matchedGudep.namaPangkalan}
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-300">
                      Gudep {matchedGudep.noGudepPa} - {matchedGudep.noGudepPi}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-blue-200">
                    <div>
                      <span className="text-stone-500 text-[10px] block">Kelurahan</span>
                      <span className="font-semibold text-stone-800">Kel. {matchedGudep.kelurahan}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block">Ka Mabigus</span>
                      <span className="font-semibold text-stone-800">{matchedGudep.kaMabigus}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block">Jumlah Anggota Muda</span>
                      <span className="font-semibold text-stone-800">{matchedGudep.jumlahAnggotaMuda} Orang</span>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block">Akreditasi Gudep</span>
                      <span className="font-bold text-amber-800">Peringkat {matchedGudep.akreditasi}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E5DFD5] space-y-2">
                  <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-stone-700">
                    Data tidak ditemukan pada basis data Kwarran Tanah Sareal
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Pastikan nomor NTA / NIK atau nama pangkalan yang dimasukkan sudah terdaftar dalam sistem SISKA-SIKAP.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
