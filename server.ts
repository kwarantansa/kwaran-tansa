import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI:', err);
    }
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SISKA-SIKAP Kwarran Tanah Sareal' });
});

// AI: Generate Official Scout Administrative Letter (Surat Pengantar / Rekomendasi / SK)
app.post('/api/ai/letter', async (req, res) => {
  try {
    const { type, gudepName, applicantName, applicantRole, count, notes } = req.body;
    const ai = getAi();

    if (!ai) {
      // Return structured official template if Gemini API key not present
      const todayStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const letterContent = `GERAKAN PRAMUKA
KWARTIR RANTING TANAH SAREAL - KOTA BOGOR
Sekretariat: Jl. Kebon Pedes No. 45, Tanah Sareal, Kota Bogor 16162

Nomor    : 04.07/04.02-TS/KTA/${new Date().getFullYear()}
Lampiran : 1 (satu) Berkas
Perihal  : ${type === 'rekomendasi' ? 'Rekomendasi Keaktifan Pembina & Pangkalan' : 'Pengantar Penerbitan KTA Pramuka Kolektif'}

Kepada Yth,
Ketua Kwartir Ranting Gerakan Pramuka Tanah Sareal
Cq. Komisi Pembinaan Anggota & Organisasi
di Tempat

Salam Pramuka,

Berdasarkan hasil verifikasi dan pemutakhiran data pada Sistem Informasi SISKA-SIKAP Kwartir Ranting Tanah Sareal, dengan ini kami menerangkan bahwa:

Pangkalan / Gudep : ${gudepName || 'Gugus Depan Terdaftar'}
${applicantName ? `Nama Pembina/Pemohon : ${applicantName}` : ''}
${applicantRole ? `Jabatan / Kualifikasi : ${applicantRole}` : ''}
${count ? `Jumlah Usulan KTA     : ${count} Orang Anggota` : ''}

Telah memenuhi persyaratan administrasi keanggotaan dan kepembinaan sesuai dengan Petunjuk Penyelenggaraan Gerakan Pramuka. Bersama surat ini kami lampirkan berkas pendukung dan rekapitulasi data anggota untuk diproses lebih lanjut.

Demikian rekomendasi ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.

Bogor, ${todayStr}
Kwartir Ranting Gerakan Pramuka Tanah Sareal
Ketua,



( Ttd & Cap Kwartir Ranting )`;

      return res.json({ letter: letterContent, fallback: true });
    }

    const prompt = `Anda adalah Sekretaris Eksekutif Kwartir Ranting Gerakan Pramuka Tanah Sareal, Kota Bogor, Jawa Barat.
Buatlah draft Surat Resmi Administrasi Gerakan Pramuka dengan format kop surat standar Kwartir Ranting Tanah Sareal Kota Bogor.
Jenis Surat: ${type === 'rekomendasi' ? 'Surat Rekomendasi Keaktifan Pembina & Pangkalan Gugus Depan' : 'Surat Pengantar Penerbitan Kartu Tanda Anggota (KTA) Pramuka Kolektif'}.
Detail Data:
- Pangkalan/Gudep: ${gudepName || 'Gugus Depan Pangkalan di Wilayah Tanah Sareal'}
- Pemohon / Nama Pembina: ${applicantName || '-'}
- Jabatan/Kualifikasi: ${applicantRole || '-'}
- Jumlah Anggota (jika KTA): ${count || '-'}
- Catatan Tambahan: ${notes || 'Semua persyaratan berkas administrasi telah diverifikasi sistem SISKA-SIKAP'}

Format harus formal, menyertakan Salam Pramuka, nomor surat dinas standar Kwarran Tanah Sareal, rincian dasar pertimbangan, dan penutup resmi. Berikan teks surat yang rapi dan siap cetak.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ letter: response.text || 'Gagal membuat draft surat.', fallback: false });
  } catch (error: any) {
    console.error('Gemini Letter Gen Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// AI: Analyze Census and Document Completeness
app.post('/api/ai/analyze-census', async (req, res) => {
  try {
    const { stats, gudepSummary } = req.body;
    const ai = getAi();

    if (!ai) {
      return res.json({
        analysis: `Laporan Analisis Pemutakhiran Data Kwarran Tanah Sareal:\n\n1. Ketercapaian Pendataan: Terdata ${stats?.totalGudep || 0} Gudep dari target 11 Kelurahan di Tanah Sareal.\n2. Anggota Muda: Total ${stats?.totalMembers || 0} anggota aktif (Siaga, Penggalang, Penegak).\n3. Kualifikasi Pembina: Terdapat pembina yang telah KMD/KML yang terdata dengan kualifikasi resmi.\n4. Rekomendasi: Lanjutkan verifikasi kolektif KTA untuk mempercepat target 100% KTA terbit.`,
        fallback: true
      });
    }

    const prompt = `Analisis data pemutakhiran keanggotaan dan Gugus Depan Pramuka Kwartir Ranting Tanah Sareal Kota Bogor berikut:
Statistik Ringkas: ${JSON.stringify(stats)}
Ringkasan Gudep: ${JSON.stringify(gudepSummary)}

Berikan laporan analisis eksekutif singkat berstruktur:
1. Ringkasan Progres Pemutakhiran (Gudep & Anggota)
2. Evaluasi Kualifikasi Pembina (Rasio Pembina KMD/KML)
3. Identifikasi Pangkalan yang Membutuhkan Pendampingan Khusus
4. Rekomendasi Strategis Kwarran Tanah Sareal menuju Tertib Administrasi Keanggotaan dan KTA Pramuka.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ analysis: response.text, fallback: false });
  } catch (error: any) {
    console.error('Gemini Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SISKA-SIKAP Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
