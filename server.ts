import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// 1. Chat AI (Customer Service & General School Knowledge)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, style = 'normal', schoolName = 'Sekolah Kita' } = req.body;
    
    if (!aiClient) {
      return res.json({
        reply: `[Mode Demo DESAKA AI] Halo! Saya adalah asisten cerdas DESAKA AI untuk ${schoolName}. Sistem bel otomatis dan announcer lokal tetap berjalan normal. Untuk mengaktifkan respon AI pintar secara penuh, pastikan kunci API Gemini sudah terpasang. Apakah ada jadwal atau informasi sekolah yang ingin Anda tanyakan?`,
        isDemo: true,
      });
    }

    const lastMessage = messages?.[messages.length - 1]?.content || 'Halo';
    
    let styleInstruction = 'Berikan jawaban ramah, jelas, solutif, dan profesional dengan panjang sedang (1-2 paragraf).';
    if (style === 'singkat') {
      styleInstruction = 'Berikan jawaban ringkas, padat, to the point dalam 1-3 kalimat saja.';
    } else if (style === 'detail') {
      styleInstruction = 'Berikan jawaban mendalam, runtut, terstruktur dengan poin-poin penjelas yang lengkap.';
    }

    const systemInstruction = `Anda adalah DESAKA AI — Customer Service Pintar & Asisten Pengetahuan Sekolah resmi untuk ${schoolName}.
Identitas & Tagline: "Cerdas Mengingatkan, Pintar Mengajarkan."
Karakteristik Anda:
1. Sangat ramah, sopan, mendidik, solutif, dan berbahasa Indonesia yang baik dan santun.
2. Anda ahli dalam:
   - Menjelaskan cara penggunaan aplikasi DESAKA AI (Sistem Bel Sekolah Otomatis, Voice Announcer, Guru AI, Kalender Akademik, Mode Ujian, Mode Darurat, speaker Bluetooth/AUX).
   - Menjawab pertanyaan jadwal dan kegiatan sekolah.
   - Menjawab pertanyaan pengetahuan umum, sains, teknologi, matematika, bahasa.
   - Membantu keluhan guru, siswa, dan orang tua.
3. ${styleInstruction}
4. Jika Anda tidak mengetahui jawaban jadwal atau kebijakan internal khusus yang belum diberikan, katakan terus terang dengan sopan bahwa Anda menyarankan konfirmasi ke pihak Tata Usaha atau Bagian Kurikulum sekolah.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nPertanyaan pengguna:\n${lastMessage}` }],
        },
      ],
    });

    const reply = response.text || 'Maaf, DESAKA AI belum dapat memproses jawaban saat ini. Silakan coba kembali.';
    return res.json({ reply, isDemo: false });
  } catch (error: any) {
    console.error('Chat AI Error:', error);
    return res.status(500).json({
      reply: 'Terjadi kendala saat menghubungkan ke server AI. Sistem beralih ke mode offline.',
      error: error.message,
      isDemo: true,
    });
  }
});

// 2. DESAKA Guru AI (Modul Ajar, Tutor, Tanya Jawab, Kuis, Bahasa)
app.post('/api/guru-ai', async (req, res) => {
  try {
    const { mode, gradeLevel, subject, prompt, topic } = req.body;

    if (!aiClient) {
      return res.json({
        content: `[Mode Demo Guru AI]\nTopik: ${topic || 'Pembelajaran'}\nJenjang: ${gradeLevel || 'Semua Jenjang'}\n\nFitur Guru AI memerlukan koneksi Gemini API aktif. Pada mode demo ini, Anda tetap dapat menggunakan bel sekolah, announcer lokal, dan jadwal harian secara penuh.`,
        isDemo: true,
      });
    }

    let systemInstruction = `Anda adalah DESAKA Guru AI — Guru Virtual dan Asisten Pembelajaran Cerdas di Indonesia.
Pedoman umum:
- Sesuai dengan Kurikulum Merdeka dan standar pendidikan nasional Indonesia.
- Bahasa santun, membakar semangat belajar, jelas, dan akurat secara pedagogis.
- Sesuaikan kosakata dan analogi dengan jenjang peserta didik (${gradeLevel || 'SMP/SMA'}).
- Utamakan akurasi ilmiah, tidak mengarang referensi, jelaskan konsep secara bertahap (step-by-step).`;

    if (mode === 'guru') {
      systemInstruction += `\nMode: ADMINISTRASI & MODUL AJAR GURU.
Tugas Anda: Buat Modul Ajar / RPP / Kisi-kisi / Rubrik Penilaian untuk mata pelajaran ${subject || 'Umum'} dengan topik "${topic || prompt}".
Format keluaran yang rapi:
1. Informasi Umum (Fase/Jenjang, Alokasi Waktu, Profil Pelajar Pancasila).
2. Capaian Pembelajaran (CP) & Tujuan Pembelajaran (TP).
3. Pemahaman Bermakna & Pertanyaan Pemantik.
4. Urutan Kegiatan Pembelajaran (Pendahuluan, Inti - berdiferensiasi, Penutup).
5. Asesmen / Rubrik Penilaian (Formatif & Sumatif).`;
    } else if (mode === 'tutor') {
      systemInstruction += `\nMode: TUTOR VIRTUAL BERTINGKAT (STEP-BY-STEP).
Tugas Anda: Jelaskan materi/konsep "${topic || prompt}" untuk mata pelajaran ${subject} kepada siswa jenjang ${gradeLevel}.
Gunakan format langkah demi langkah:
Langkah 1: Pengenalan analogi sehari-hari yang mudah dipahami.
Langkah 2: Definisi inti dan konsep ilmiah/matematis.
Langkah 3: Contoh soal dan cara penyelesaian detail.
Langkah 4: Tips trik cepat mengingat & tantangan mini untuk siswa.`;
    } else if (mode === 'kuis') {
      systemInstruction += `\nMode: KUIS INTERAKTIF & LATIHAN SOAL.
Tugas Anda: Buat 3 sampai 5 soal latihan bermutu untuk mata pelajaran ${subject} materi "${topic || prompt}".
Sertakan pilihan ganda A, B, C, D beserta kunci jawaban dan pembahasan komprehensif di setiap nomor.`;
    } else if (mode === 'bahasa') {
      systemInstruction += `\nMode: BELAJAR BAHASA (Indonesia, Jawa Krama/Ngoko, Inggris).
Tugas Anda: Bantu siswa memahami tata bahasa, kosa kata, percakapan, dan terjemahan dengan contoh kalimat kontekstual dan panduan pelafalan.`;
    } else {
      systemInstruction += `\nMode: TANYA JAWAB MATERI.
Jawab pertanyaan siswa dengan ramah, komunikatif, dan sertakan contoh konkret.`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nPermintaan Spesifik:\n${prompt || topic}` }],
        },
      ],
    });

    const content = response.text || 'Tidak ada tanggapan yang dihasilkan.';
    return res.json({ content, isDemo: false });
  } catch (error: any) {
    console.error('Guru AI Error:', error);
    return res.status(500).json({
      content: 'Maaf, terjadi kesalahan saat menyusun materi pembelajaran. Silakan coba kembali.',
      error: error.message,
    });
  }
});

// 3. AI Voice Announcer Generator
app.post('/api/announcer-generate', async (req, res) => {
  try {
    const { context, tone = 'formal', language = 'id', targetGroup = 'Semua Siswa & Guru' } = req.body;

    if (!aiClient) {
      return res.json({
        announcement: `Perhatian seluruh warga sekolah. ${context || 'Mohon bersiap untuk kegiatan sekolah.'} Terima kasih atas perhatian dan kerja samanya.`,
        isDemo: true,
      });
    }

    const toneGuide = {
      formal: 'Resmi, tertib, tegas namun sopan, cocok untuk upacara, ujian, atau pengumuman kedinasan.',
      ramah: 'Hangat, ramah layaknya customer service modern, membangkitkan suasana positif.',
      ceria: 'Semangat, penuh energi positif, cocok untuk pagi hari atau istirahat.',
      tegas: 'Lugast, disiplin, berwibawa, cocok untuk himbauan ketertiban dan waktu masuk kelas.',
      edukatif: 'Menyisipkan pesan moral, motivasi belajar, dan kepedulian lingkungan.',
    }[tone as string] || 'Ramah dan profesional.';

    const langGuide = {
      id: 'Bahasa Indonesia yang baik, benar, dan santun.',
      jv: 'Bahasa Jawa Krama Inggil halus yang sopan dan santun untuk lingkungan sekolah.',
      en: 'Standard clear English suitable for bilingual school announcements.',
    }[language as string] || 'Bahasa Indonesia.';

    const promptText = `Anda adalah sistem AI Voice Announcer untuk pengumuman speaker sekolah (DESAKA AI Voice Announcer).
Buat teks pengumuman suara yang siap dibacakan oleh mesin Text-to-Speech (TTS) melalui speaker sekolah.

Konteks / Keperluan Pengumuman: ${context}
Sasaran Pendengar: ${targetGroup}
Gaya Nada Bicara: ${tone} (${toneGuide})
Bahasa: ${langGuide}

Aturan Penulisan untuk TTS:
1. Mulai dengan salam pembuka khas sekolah yang pas (misal: "Perhatian kepada seluruh siswa...", "Selamat pagi rekan-rekan guru dan siswa sekalian...").
2. Gunakan tanda baca (titik, koma) yang presisi untuk jeda nafas TTS yang natural.
3. Hindari singkatan yang membingungkan mesin suara (tulis 'kilometer' bukan 'km', 'menit' bukan 'mnt').
4. Akhiri dengan penutup yang santun dan terima kasih.
5. Berikan HANYA teks naskah pengumuman yang siap dibaca (tanpa judul naskah, tanpa tanda kutip, tanpa catatan kurung).`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
    });

    const announcement = response.text?.trim() || 'Perhatian seluruh siswa dan guru, mohon mempersiapkan diri untuk kegiatan sekolah. Terima kasih.';
    return res.json({ announcement, isDemo: false });
  } catch (error: any) {
    console.error('Announcer Generator Error:', error);
    return res.status(500).json({
      announcement: `Perhatian kepada seluruh siswa dan guru. ${req.body.context || 'Mohon perhatian untuk informasi penting sekolah.'} Terima kasih.`,
      error: error.message,
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`DESAKA AI Server running on port ${PORT}`);
  });
}

startServer();
