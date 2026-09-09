import React from 'react';
import { 
  Building2, 
  Users, 
  Award, 
  CreditCard, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  PlusCircle, 
  QrCode, 
  Sparkles, 
  Layers, 
  MapPin, 
  CheckCircle, 
  FileCheck2,
  FolderArchive,
  FileCheck,
  FileSpreadsheet
} from 'lucide-react';
import { Gudep, Member, CollectiveKtaBatch, ArchiveDocument } from '../types';
import { ActiveTab } from './Navbar';

interface DashboardProps {
  gudepList: Gudep[];
  members: Member[];
  batches: CollectiveKtaBatch[];
  archives?: ArchiveDocument[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenVerifier: () => void;
  onOpenAi: () => void;
  onSelectMemberForKta: (member: Member) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  gudepList,
  members,
  batches,
  archives = [],
  setActiveTab,
  onOpenVerifier,
  onOpenAi,
  onSelectMemberForKta
}) => {
  // Metric calculations
  const totalGudep = gudepList.length;
  const totalMuda = members.filter(m => ['Siaga', 'Penggalang', 'Penegak', 'Pandega'].includes(m.golongan)).length;
  const totalDewasa = members.filter(m => ['Pembina', 'Pelatih', 'Andalan', 'Mabigus'].includes(m.golongan)).length;
  const totalKtaTerbit = members.filter(m => m.statusKta === 'Sudah Terbit').length;
  
  const countSiaga = members.filter(m => m.golongan === 'Siaga').length;
  const countPenggalang = members.filter(m => m.golongan === 'Penggalang').length;
  const countPenegak = members.filter(m => m.golongan === 'Penegak').length;
  const countPandega = members.filter(m => m.golongan === 'Pandega').length;

  const totalAllMembers = members.length;
  const syncPercentage = Math.round((members.filter(m => m.statusSync === 'Tersinkronisasi').length / (totalAllMembers || 1)) * 100);

  // Group by Kelurahan
  const kelurahanCounts: Record<string, number> = {};
  gudepList.forEach(g => {
    kelurahanCounts[g.kelurahan] = (kelurahanCounts[g.kelurahan] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#24140D] text-white p-6 sm:p-8 shadow-md border border-[#3C2216]">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#341B10] text-amber-300 text-xs font-bold border border-amber-600/30 font-mono">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Sistem Terpadu SISKA - SIKAP Kwarran Tanah Sareal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Pemutakhiran Data Gugus Depan & Keanggotaan Pramuka
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Selamat datang di portal pendataan digital Kwartir Ranting Tanah Sareal Kota Bogor. Terintegrasi penuh untuk ketertiban Nomor Tanda Anggota (NTA) dan penerbitan KTA Pramuka resmi.
            </p>
          </div>

          {/* Sync Status Badge Box */}
          <div className="flex-shrink-0 bg-[#1A0C06] border border-[#381C10] p-4 sm:p-5 rounded-2xl space-y-3 min-w-[250px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400 font-medium">Status Integrasi Sistem</span>
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <CheckCircle className="w-3.5 h-3.5" /> Terhubung
              </span>
            </div>
            
            <div>
              <div className="flex justify-between text-xs font-mono font-bold text-amber-300 mb-1.5">
                <span>Sinkronisasi Data</span>
                <span>{syncPercentage}%</span>
              </div>
              <div className="w-full bg-[#351B10] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${syncPercentage}%` }} 
                />
              </div>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center justify-between pt-2 border-t border-[#331B10]">
              <span>Wilayah Ranting:</span>
              <strong className="text-stone-200">11 Kelurahan</strong>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Gudep */}
        <div 
          onClick={() => setActiveTab('gudep')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-sm hover:shadow-md hover:border-amber-700/60 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              100% Aktif
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-stone-900 font-sans tracking-tight">
              {totalGudep}
            </div>
            <div className="text-xs font-bold text-stone-700 mt-0.5">Gugus Depan Terdata</div>
            <p className="text-[11px] text-stone-500 mt-1">SD/MI, SMP/MTs, SMA/SMK/MA & PT</p>
          </div>
        </div>

        {/* Card 2: Anggota Muda */}
        <div 
          onClick={() => setActiveTab('members')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-sm hover:shadow-md hover:border-amber-700/60 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              Siaga • G • T • D
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-stone-900 font-sans tracking-tight">
              {totalMuda}
            </div>
            <div className="text-xs font-bold text-stone-700 mt-0.5">Anggota Muda Terdata</div>
            <p className="text-[11px] text-stone-500 mt-1">Calon & Pemegang TKK/Garuda</p>
          </div>
        </div>

        {/* Card 3: KTA & NTA Anggota */}
        <div 
          onClick={() => setActiveTab('collective-kta')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-sm hover:shadow-md hover:border-amber-700/60 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              KTA Kolektif
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-stone-900 font-sans tracking-tight">
              {totalKtaTerbit}
            </div>
            <div className="text-xs font-bold text-stone-700 mt-0.5">KTA Ber-NTA Terbit</div>
            <p className="text-[11px] text-stone-500 mt-1">{batches.length} kelompok pengajuan kolektif</p>
          </div>
        </div>

        {/* Card 4: Arsip Digital */}
        <div 
          onClick={() => setActiveTab('archives')}
          className="group cursor-pointer bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-sm hover:shadow-md hover:border-amber-700/60 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
              <FolderArchive className="w-5 h-5 text-amber-800" />
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
              Cloud Drive
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-stone-900 font-sans tracking-tight">
              {archives.length}
            </div>
            <div className="text-xs font-bold text-stone-700 mt-0.5">Arsip Dokumen Kwarran</div>
            <p className="text-[11px] text-stone-500 mt-1">SK, Edaran & Repositori Resmi</p>
          </div>
        </div>
      </div>

      {/* Main Row: Visual Statistics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Charts & Census Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* Golongan Breakdown Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5DFD5] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  Komposisi Keanggotaan Berdasarkan Golongan
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Distribusi data anggota muda dan dewasa di Kwarran Tanah Sareal
                </p>
              </div>
              <button
                onClick={() => setActiveTab('members')}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors"
              >
                Lihat Semua Anggota <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Golongan Visual Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* Siaga */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Siaga (SD/MI)</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                </div>
                <div className="text-2xl font-black text-emerald-950">{countSiaga}</div>
                <div className="text-[10px] text-emerald-700 font-medium">Mula, Bantu, Tata, Garuda</div>
              </div>

              {/* Penggalang */}
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900">Penggalang</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                </div>
                <div className="text-2xl font-black text-rose-950">{countPenggalang}</div>
                <div className="text-[10px] text-rose-700 font-medium">Ramu, Rakit, Terap, Garuda</div>
              </div>

              {/* Penegak */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Penegak</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                </div>
                <div className="text-2xl font-black text-amber-950">{countPenegak}</div>
                <div className="text-[10px] text-amber-700 font-medium">Bantara, Laksana, Garuda</div>
              </div>

              {/* Pandega & Dewasa */}
              <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">Pembina / Pelatih</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-700"></span>
                </div>
                <div className="text-2xl font-black text-stone-900">{totalDewasa}</div>
                <div className="text-[10px] text-stone-600 font-medium">KMD, KML, KPD, KPL</div>
              </div>
            </div>
          </div>

          {/* Kelurahan Census Grid */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5DFD5] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900">
                  <MapPin className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    Sebaran Pangkalan di 11 Kelurahan Tanah Sareal
                  </h3>
                  <p className="text-xs text-stone-500">
                    Monitoring pendataan ulang Gugus Depan per wilayah kelurahan
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
              {Object.entries(kelurahanCounts).map(([kelurahan, count]) => (
                <div 
                  key={kelurahan}
                  className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-between hover:bg-white hover:border-amber-600 transition-colors"
                >
                  <span className="font-semibold text-stone-800">{kelurahan}</span>
                  <span className="font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    {count} Gudep
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Actions & Layanan */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Action Shortcuts */}
          <div className="bg-[#24140D] text-white p-6 rounded-2xl shadow-sm border border-[#3C2216] space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Layanan Cepat Administrasi
            </h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => setActiveTab('gudep')}
                className="w-full py-2.5 px-3.5 bg-[#331B10] hover:bg-[#442416] text-stone-200 rounded-xl font-semibold flex items-center justify-between border border-[#522B19] transition-colors text-left"
              >
                <span>➕ Registrasi Gugus Depan Baru</span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => setActiveTab('collective-kta')}
                className="w-full py-2.5 px-3.5 bg-[#331B10] hover:bg-[#442416] text-stone-200 rounded-xl font-semibold flex items-center justify-between border border-[#522B19] transition-colors text-left"
              >
                <span>💳 Permohonan KTA Kolektif (NTA)</span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => setActiveTab('archives')}
                className="w-full py-2.5 px-3.5 bg-[#331B10] hover:bg-[#442416] text-stone-200 rounded-xl font-semibold flex items-center justify-between border border-[#522B19] transition-colors text-left"
              >
                <span>📂 Digitalisasi Arsip & SK Kwarran</span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => setActiveTab('semester-report')}
                className="w-full py-2.5 px-3.5 bg-[#331B10] hover:bg-[#442416] text-stone-200 rounded-xl font-semibold flex items-center justify-between border border-[#522B19] transition-colors text-left"
              >
                <span>📊 Laporan Evaluasi Semesteran</span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={onOpenVerifier}
                className="w-full py-2.5 px-3.5 bg-[#331B10] hover:bg-[#442416] text-stone-200 rounded-xl font-semibold flex items-center justify-between border border-[#522B19] transition-colors text-left"
              >
                <span>🔍 Pindai / Verifikasi QR Dokumen</span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={onOpenAi}
                className="w-full py-2.5 px-3.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl font-bold flex items-center justify-between shadow transition-all text-left"
              >
                <span>🤖 Asisten AI Kwarran</span>
                <ArrowUpRight className="w-4 h-4 text-stone-950" />
              </button>
            </div>
          </div>

          {/* Recent Members NTA Feed */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5DFD5] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-stone-900">
                Pencatatan NTA Anggota
              </h4>
              <button
                onClick={() => setActiveTab('members')}
                className="text-xs text-amber-800 font-bold hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-2.5">
              {members.slice(0, 4).map(m => (
                <div
                  key={m.id}
                  className="p-3 bg-[#FAF8F5] hover:bg-amber-50/50 rounded-xl border border-[#E5DFD5] text-xs space-y-1 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 truncate max-w-[140px]">
                      {m.namaLengkap}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                      NTA: {m.nta}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 flex justify-between">
                    <span className="truncate max-w-[150px]">{m.namaPangkalan}</span>
                    <span className="font-semibold text-amber-900 font-mono">{m.golongan}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
