import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../services/soundEngine';
import { AnnouncerPreset } from '../types';
import {
  Mic,
  Volume2,
  Sparkles,
  Play,
  Square,
  Save,
  Radio,
  Sliders,
  Languages,
  CheckCircle,
  Copy,
  Trash2,
  Bookmark,
  Share2,
  Headphones,
} from 'lucide-react';

export const VoiceAnnouncerView: React.FC = () => {
  const { announcerPresets, saveAnnouncerPreset, deleteAnnouncerPreset, currentSchool } = useApp();

  // Announcement state
  const [text, setText] = useState<string>(
    'Selamat pagi anak-anak. Bel masuk sekolah telah berbunyi. Silakan memasuki kelas masing-masing dan bersiap untuk belajar bersama.'
  );
  const [language, setLanguage] = useState<'id' | 'jv' | 'en'>('id');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [tone, setTone] = useState<'formal' | 'ramah' | 'ceria' | 'tegas' | 'edukatif'>('ramah');
  const [targetGroup, setTargetGroup] = useState<string>('Semua Siswa & Guru');

  // TTS Parameters
  const [rate, setRate] = useState<number>(0.95);
  const [pitch, setPitch] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // AI Generation prompt
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveTitle, setSaveTitle] = useState<string>('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  // Quick prompt suggestions
  const promptSuggestions = [
    'Pengumuman upacara bendera hari Senin pagi',
    'Himbauan menjaga kebersihan kelas dan kantin saat istirahat',
    'Pengumuman persiapan pelaksanaan ujian semester',
    'Pengumuman kegiatan sholat berjamaah di musholla',
    'Pemberitahuan latihan ekstrakurikuler sore hari',
    'Basa Jawa: Wanci mlebet kelas lan sinau bebarengan',
  ];

  // Generate with AI
  const handleGenerateAI = async (customContext?: string) => {
    const ctx = customContext || aiPrompt;
    if (!ctx.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/announcer-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: ctx,
          tone,
          language,
          targetGroup,
        }),
      });
      const data = await res.json();
      if (data.announcement) {
        setText(data.announcement);
      }
    } catch (err) {
      console.error('Failed to generate announcement:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Play / Speak
  const handlePlay = async () => {
    if (!text.trim()) return;
    setIsPlaying(true);
    await soundEngine.speakText(text, {
      lang: language,
      voiceGender,
      rate,
      pitch,
      onEnd: () => setIsPlaying(false),
    });
    setIsPlaying(false);
  };

  // Stop playback
  const handleStop = () => {
    soundEngine.stopAll();
    setIsPlaying(false);
  };

  // Save as preset template
  const handleSavePreset = () => {
    if (!saveTitle.trim()) return;
    saveAnnouncerPreset({
      title: saveTitle,
      context: aiPrompt || 'Pengumuman Umum',
      text,
      language,
      tone,
      targetGroup,
    });
    setSaveTitle('');
    setIsSaveModalOpen(false);
  };

  // Load preset template
  const handleLoadPreset = (preset: AnnouncerPreset) => {
    setText(preset.text);
    setLanguage(preset.language);
    setTone(preset.tone);
    setTargetGroup(preset.targetGroup);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Mic className="w-5 h-5 text-purple-200" />
            </span>
            <h2 className="text-xl font-black tracking-tight text-white">
              DESAKA AI Voice Announcer
            </h2>
          </div>
          <p className="text-xs text-purple-100 max-w-xl">
            Sistem pengumuman suara cerdas berbasis Text-to-Speech & AI. Hasilkan naskah pengumuman natural dan siarkan langsung ke speaker sekolah (Bluetooth / AUX).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => soundEngine.testSpeakerOutput()}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center gap-1.5"
            title="Tes koneksi audio ke speaker"
          >
            <Headphones className="w-4 h-4" />
            <span>Tes Speaker</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Announcer Text Editor & Controls */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* AI Generator Box */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                AI Pengumuman Generator
              </span>
              <span className="text-[11px] text-slate-400">Model Gemini 3.8 Flash</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateAI()}
                placeholder="Tulis topik... misal: 'Pengumuman persiapan upacara hari Senin'"
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                disabled={isGenerating || !aiPrompt.trim()}
                onClick={() => handleGenerateAI()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? 'Menyusun...' : 'Buat Teks'}</span>
              </button>
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {promptSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiPrompt(s);
                    handleGenerateAI(s);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Main Text Editor Box */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Naskah Suara Pengumuman:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(text)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
                  title="Salin Naskah"
                >
                  <Copy className="w-3.5 h-3.5" /> Salin
                </button>
                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
                  title="Simpan ke Template"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Simpan Template
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ketik teks pengumuman yang ingin disiarkan..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
            />

            {/* Audio Voice Player Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {!isPlaying ? (
                  <button
                    onClick={handlePlay}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/25 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    SIARKAN KE SPEAKER SEKARANG
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/25 active:scale-95 transition-all flex items-center gap-2 animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    HENTIKAN SUARA
                  </button>
                )}

                <button
                  onClick={() => soundEngine.playBellWithAnnouncement('westminster', text)}
                  className="px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5"
                  title="Putar nada bel Westminster terlebih dahulu lalu naskah suara"
                >
                  <Volume2 className="w-4 h-4" />
                  Bel + Pengumuman
                </button>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {text.length} karakter
              </span>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Voice & Audio Parameters, Templates */}
        <div className="space-y-5">
          
          {/* Voice Settings Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-500" />
              Karakter & Suara Announcer
            </h3>

            {/* Language */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Bahasa Pengumuman:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'id', label: 'Indonesia' },
                  { id: 'jv', label: 'Basa Jawa' },
                  { id: 'en', label: 'English' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      language === l.id
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Voice */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Pilihan Suara:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setVoiceGender('female')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    voiceGender === 'female'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Wanita (Lembut & Ramah)
                </button>
                <button
                  onClick={() => setVoiceGender('male')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    voiceGender === 'male'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Pria (Berwibawa & Tegas)
                </button>
              </div>
            </div>

            {/* Tone of voice */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Gaya Bicara:
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white capitalize"
              >
                <option value="formal">Formal & Resmi (Upacara / Ujian)</option>
                <option value="ramah">Ramah & Menyapa (Customer Service)</option>
                <option value="ceria">Ceria & Penuh Energi (Pagi Hari)</option>
                <option value="tegas">Tegas & Disiplin (Tata Tertib)</option>
                <option value="edukatif">Edukatif & Inspiratif</option>
              </select>
            </div>

            {/* Rate & Pitch Sliders */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  <span>Kecepatan Bicara:</span>
                  <span>{rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  <span>Intonasi Nada (Pitch):</span>
                  <span>{pitch.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

          </div>

          {/* Saved Templates List */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Daftar Template Pengumuman</span>
              <Bookmark className="w-4 h-4 text-slate-400" />
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {announcerPresets.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {p.title}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 uppercase">
                      {p.language}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 italic">
                    "{p.text}"
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <button
                      onClick={() => handleLoadPreset(p)}
                      className="font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Gunakan Template
                    </button>
                    <button
                      onClick={() => deleteAnnouncerPreset(p.id)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* SAVE TEMPLATE MODAL */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Simpan Naskah Pengumuman
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Judul Template:
              </label>
              <input
                type="text"
                required
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Contoh: Pengumuman Sholat Dzuhur..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!saveTitle.trim()}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 disabled:opacity-50 text-white text-xs font-bold shadow-md"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
