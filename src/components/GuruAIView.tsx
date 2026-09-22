import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../services/soundEngine';
import { GuruModule } from '../types';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileText,
  Volume2,
  Copy,
  Printer,
  CheckCircle,
  RotateCcw,
  Languages,
  Check,
  Award,
  ChevronRight,
} from 'lucide-react';

export const GuruAIView: React.FC = () => {
  const { currentSchool } = useApp();

  const [mode, setMode] = useState<'materi' | 'soal' | 'rangkuman' | 'modul_ajar' | 'bahasa'>('materi');
  const [level, setLevel] = useState<string>('SMP');
  const [grade, setGrade] = useState<string>('Kelas 8');
  const [subject, setSubject] = useState<string>('IPA (Ilmu Pengetahuan Alam)');
  const [topic, setTopic] = useState<string>('Sistem Peredaran Darah Manusia');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Saved modules history
  const [savedModules, setSavedModules] = useState<GuruModule[]>([
    {
      id: 'mod_1',
      title: 'Hukum Newton I, II, dan III',
      subject: 'IPA (Fisika)',
      grade: 'Kelas 8 SMP',
      mode: 'materi',
      content: `### 🌟 Konsep Dasar Hukum Newton

1. **Hukum I Newton (Kelembaman/Inersia):**
   Suatu benda akan tetap diam atau bergerak lurus beraturan jika tidak ada gaya luar total yang bekerja padanya (ΣF = 0).
   *Contoh:* Saat mobil direm mendadak, tubuh penumpang terdorong ke depan.

2. **Hukum II Newton:**
   Percepatan sebuah benda sebanding dengan resultan gaya yang bekerja dan berbanding terbalik dengan massanya (F = m × a).
   *Contoh:* Mendorong gerobak kosong jauh lebih ringan daripada mendorong gerobak penuh muatan.

3. **Hukum III Newton (Aksi - Reaksi):**
   Jika benda A memberikan gaya pada benda B, maka benda B akan memberikan gaya yang sama besar dan berlawanan arah pada benda A (F_aksi = -F_reaksi).
   *Contoh:* Roket meluncur ke atas karena menyemburkan gas ke bawah.`,
      createdAt: '22 Sep 2026',
    },
  ]);

  const modes = [
    { id: 'materi', label: 'Tutor Penjelasan Materi', desc: 'Penjelasan konsep bertahap, analogi, dan contoh nyata' },
    { id: 'soal', label: 'Pembuat Soal & Kuis', desc: 'Pilihan ganda, esai, kunci jawaban, dan pembahasan' },
    { id: 'rangkuman', label: 'Rangkuman & Peta Konsep', desc: 'Intisari materi ringkas, poin penting untuk ujian' },
    { id: 'modul_ajar', label: 'Modul Ajar / RPP Merdeka', desc: 'Capaian pembelajaran, ATP, profil pelajar Pancasila' },
    { id: 'bahasa', label: 'Latihan Percakapan Bahasa', desc: 'Bahasa Indonesia, Basa Jawa Krama, dan English' },
  ];

  const subjects = [
    'Matematika',
    'IPA (Ilmu Pengetahuan Alam)',
    'IPS (Ilmu Pengetahuan Sosial)',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Pendidikan Pancasila & Kewarganegaraan',
    'Informatika & Koding',
    'Pendidikan Agama Islam (PAI)',
    'Basa Jawa (Mulok Daerah)',
    'Seni Budaya',
    'PJOK (Olahraga)',
  ];

  const grades = [
    'Kelas 1 SD', 'Kelas 2 SD', 'Kelas 3 SD', 'Kelas 4 SD', 'Kelas 5 SD', 'Kelas 6 SD',
    'Kelas 7 SMP', 'Kelas 8 SMP', 'Kelas 9 SMP',
    'Kelas 10 SMA/SMK', 'Kelas 11 SMA/SMK', 'Kelas 12 SMA/SMK',
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    soundEngine.stopAll();
    setIsSpeaking(false);

    try {
      const res = await fetch('/api/guru-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          level,
          grade,
          subject,
          topic,
          customPrompt,
        }),
      });

      const data = await res.json();
      const generatedContent = data.content || 'Gagal menghasilkan materi.';
      setResult(generatedContent);

      // Save to local module history
      const newMod: GuruModule = {
        id: 'mod_' + Date.now(),
        title: `${topic} (${subject})`,
        subject,
        grade,
        mode,
        content: generatedContent,
        createdAt: new Date().toLocaleDateString('id-ID'),
      };
      setSavedModules((prev) => [newMod, ...prev]);
    } catch (err) {
      console.error('Guru AI error:', err);
      setResult('Terjadi kesalahan saat menghubungi server Guru Virtual AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      soundEngine.stopAll();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      // Clean markdown tags for clearer speech
      const cleanText = result.replace(/[#*_`]/g, '');
      soundEngine.speakText(cleanText, {
        lang: mode === 'bahasa' && subject.includes('Inggris') ? 'en' : 'id',
        rate: 0.95,
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-sky-900 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </span>
            <h2 className="text-xl font-black tracking-tight text-white">
              DESAKA Guru AI — Guru Virtual & Asisten Pendidikan
            </h2>
          </div>
          <p className="text-xs text-blue-100 max-w-xl">
            Asisten cerdas bagi guru dan siswa. Menyusun modul ajar Kurikulum Merdeka, penjelasan konsep, bank soal, dan latihan bertahap dengan dukungan suara.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
          Kurikulum Merdeka Ready
        </span>
      </div>

      {/* 5 Mode Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              mode === m.id
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20 ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <h4 className="text-xs font-black leading-tight">{m.label}</h4>
            <p className={`text-[10px] mt-1 line-clamp-2 ${mode === m.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
              {m.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Form & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form Box (1 Col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Parameter Pembelajaran
          </h3>

          {/* Jenjang & Kelas */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Jenjang:
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="SD">SD / MI</option>
                <option value="SMP">SMP / MTs</option>
                <option value="SMA">SMA / MA</option>
                <option value="SMK">SMK</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Kelas:
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {grades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mata Pelajaran */}
          <div className="text-xs">
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Mata Pelajaran:
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Topik Materi */}
          <div className="text-xs">
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Materi / Topik Pelajaran:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Teorema Pythagoras, Fotosintesis, Teks Eksposisi..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Catatan / Kebutuhan Khusus */}
          <div className="text-xs">
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Instruksi Tambahan (Opsional):
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Misal: Buat 5 soal pilihan ganda tingkat HOTS dengan pembahasan..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'DESAKA Guru AI Sedang Menyusun...' : 'Susun Pembelajaran Sekarang'}</span>
          </button>

          {/* Saved History list */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <h4 className="font-bold text-slate-500 uppercase tracking-wider mb-2 text-[10px]">
              Modul Tersimpan Sebelumnya:
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {savedModules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setResult(m.content);
                    setTopic(m.title);
                    setSubject(m.subject);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between"
                >
                  <span className="truncate font-semibold text-[11px]">{m.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output Box (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          
          {/* Header toolbar */}
          <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Hasil Materi Guru Virtual AI
              </h3>
              <p className="text-[11px] text-slate-400">
                {subject} • {grade} • {level}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {result && (
                <>
                  <button
                    onClick={handleSpeak}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSpeaking
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100'
                    }`}
                    title="Dengarkan penjelasan dengan suara AI"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? 'Hentikan Suara' : 'Jelaskan Suara'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                    title="Salin Teks"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                    title="Cetak Materi"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <Sparkles className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="font-bold text-xs">Menyusun materi dengan standar Kurikulum Merdeka...</p>
              </div>
            ) : result ? (
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {result}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center space-y-3 text-center text-slate-400">
                <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <div>
                  <h4 className="font-bold text-sm text-slate-600 dark:text-slate-300">
                    Belum Ada Materi yang Dibuat
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Pilih mata pelajaran, topik materi di formulir sebelah kiri, lalu klik "Susun Pembelajaran Sekarang".
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
