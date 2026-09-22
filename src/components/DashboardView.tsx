import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../services/soundEngine';
import { DesakaLogo } from './DesakaLogo';
import { DeviceLogoModal } from './DeviceLogoModal';
import {
  Bell,
  Clock,
  Mic,
  MessageSquare,
  GraduationCap,
  Calendar,
  Play,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Sparkles,
  Wifi,
  Radio,
  FileText,
  HelpCircle,
  Activity,
  HardDrive,
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  onOpenEmergency: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, onOpenEmergency }) => {
  const {
    currentSchool,
    currentTime,
    formattedTime,
    formattedDate,
    schedules,
    nextBell,
    secondsToNextBell,
    ringBellNow,
    snoozeNextBell,
    skipNextBell,
    isAutoBellEnabled,
    setIsAutoBellEnabled,
    isExamMode,
    setIsExamMode,
    history,
    isTodayHoliday,
    todayHolidayName,
    testAudio,
    customLogoUrl,
  } = useApp();

  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const currentDay = currentTime.getDay();

  // Filter today's schedules
  const todaySchedules = schedules
    .filter((s) => s.days.includes(currentDay))
    .sort((a, b) => a.time.localeCompare(b.time));

  const formatCountdown = (totalSec: number | null) => {
    if (totalSec === null) return '--:--';
    if (totalSec <= 0) return '00:00';
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getStatusBadge = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const curH = currentTime.getHours();
    const curM = currentTime.getMinutes();
    const itemTotalMin = h * 60 + m;
    const curTotalMin = curH * 60 + curM;

    if (itemTotalMin < curTotalMin) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
          <CheckCircle2 className="w-3 h-3 text-slate-400" /> Selesai
        </span>
      );
    } else if (nextBell && nextBell.time === timeStr) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
          <Clock className="w-3 h-3" /> Bel Berikutnya
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
          Mendatang
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Holiday Alert Banner if applicable */}
      {isTodayHoliday && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white font-black">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Pemberitahuan Hari Libur: {todayHolidayName}
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Bel sekolah otomatis dinonaktifkan untuk hari ini sesuai kalender akademik. Anda tetap dapat membunyikan bel manual.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('calendar')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors shrink-0"
          >
            Lihat Kalender
          </button>
        </div>
      )}

      {/* Hero Banner: School greeting + Next Bell Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Welcome card & Quick Stats */}
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between border border-blue-600/30">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-blue-100 backdrop-blur-xs border border-white/10">
                {currentSchool.level} • {currentSchool.city}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Sistem Terhubung & Siap
              </span>
              {isExamMode && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/30 text-amber-300 border border-amber-400/40">
                  Mode Ujian Aktif
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(true)}
                  className="shrink-0 transition-transform active:scale-95 group relative focus:outline-none"
                  title="Klik untuk ganti logo dari penyimpanan perangkat"
                >
                  <DesakaLogo
                    variant="icon"
                    size="lg"
                    customLogoUrl={customLogoUrl}
                    schoolName={currentSchool.name}
                    onEditClick={() => setIsLogoModalOpen(true)}
                  />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                    {currentSchool.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-100/90 font-medium mt-0.5">
                    Selamat beraktivitas! DESAKA AI siap mengawal bel otomatis dan pembelajaran di SD Negeri 1 Kalisoro.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Ganti Logo Perangkat</span>
              </button>
            </div>
          </div>

          {/* Quick Dashboard Stat row */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-4 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-semibold text-blue-200 block">Jadwal Hari Ini</span>
              <span className="text-xl sm:text-2xl font-black text-white">{todaySchedules.length}</span>
              <span className="text-[10px] text-blue-300 block">sesi bel terjadwal</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-semibold text-blue-200 block">Status Bel Otomatis</span>
              <span className="text-base sm:text-lg font-black text-emerald-300">
                {isAutoBellEnabled ? 'Aktif (On)' : 'Jeda (Off)'}
              </span>
              <span className="text-[10px] text-blue-300 block">latar belakang</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-semibold text-blue-200 block">Koneksi Suara</span>
              <span className="text-base sm:text-lg font-black text-amber-300">Speaker Siap</span>
              <span className="text-[10px] text-blue-300 block">Web Audio API</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-semibold text-blue-200 block">Bel Dibunyikan</span>
              <span className="text-xl sm:text-2xl font-black text-white">{history.length}</span>
              <span className="text-[10px] text-blue-300 block">riwayat tercatat</span>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Next Bell Spotlight Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Bel Berikutnya
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {nextBell ? nextBell.time : 'Selesai'}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => ringBellNow()}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors flex items-center gap-1"
              title="Uji coba nada bel sekarang"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Tes Bel</span>
            </button>
          </div>

          {/* Main Countdown Display */}
          <div className="py-5 text-center space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {nextBell ? nextBell.title : 'Semua Jadwal Hari Ini Telah Terlaksana'}
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
              {formatCountdown(secondsToNextBell)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {nextBell ? `Target pukul ${nextBell.time} WIB • ${nextBell.sound}` : 'Sampai jumpa besok pagi'}
            </p>
          </div>

          {/* Action Button Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => ringBellNow()}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              BUNYIKAN SEKARANG (MANUAL)
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => snoozeNextBell(5)}
                disabled={!nextBell}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                title="Tunda dering bel 5 menit"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Tunda 5 Menit
              </button>
              <button
                onClick={() => skipNextBell()}
                disabled={!nextBell}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                title="Lewati jadwal bel berikutnya"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Lewati Bel Ini
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 4 Core Features Quick Access Grid (Bel Sekolah, AI Announcer, Chat AI, Guru AI) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Fitur Utama DESAKA AI
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Satu Aplikasi untuk Semua Kebutuhan Pintar Sekolah
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: Bel Sekolah Otomatis */}
          <button
            onClick={() => setActiveTab('schedules')}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-sm hover:shadow-xl transition-all text-left group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Bel Sekolah Otomatis
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Atur jadwal harian, ujian, volume, nada Westminster, dan bel manual.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <span>Buka Jadwal</span>
              <span>→</span>
            </div>
          </button>

          {/* Card 2: AI Announcer Suara Cerdas */}
          <button
            onClick={() => setActiveTab('announcer')}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 shadow-sm hover:shadow-xl transition-all text-left group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                AI Voice Announcer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Suara pengumuman natural profesional (Pria/Wanita, Indo/Jawa/Inggris).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
              <span>Siarkan Suara</span>
              <span>→</span>
            </div>
          </button>

          {/* Card 3: Chat AI Customer Service */}
          <button
            onClick={() => setActiveTab('chat')}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all text-left group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Chat AI CS Pintar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Voice & text chat, tanya jadwal, pengetahuan umum, dan panduan sekolah.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span>Mulai Chat</span>
              <span>→</span>
            </div>
          </button>

          {/* Card 4: Guru Virtual AI */}
          <button
            onClick={() => setActiveTab('guru')}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-xl transition-all text-left group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Guru Virtual AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Modul ajar Kurikulum Merdeka, tutor bertahap, kuis interaktif, & bahasa.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
              <span>Buka Modul Guru</span>
              <span>→</span>
            </div>
          </button>

        </div>
      </div>

      {/* Main Content Split: Jadwal Hari Ini (Left) & Riwayat Bel + Quick Tools (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Jadwal Hari Ini */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Jadwal Bel Hari Ini ({formattedDate})
              </h3>
              <p className="text-xs text-slate-500">
                {isExamMode ? 'Jadwal Mode Khusus Ujian Aktif' : 'Jadwal Rutin Reguler'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExamMode(!isExamMode)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                  isExamMode
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isExamMode ? 'Nonaktifkan Mode Ujian' : 'Aktifkan Mode Ujian'}
              </button>
              <button
                onClick={() => setActiveTab('schedules')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Kelola Semua Jadwal
              </button>
            </div>
          </div>

          {/* Schedule List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {todaySchedules.map((item, idx) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 text-center font-mono font-black text-sm text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 py-1 rounded-lg">
                    {item.time}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{item.targetGroup}</span>
                      <span>•</span>
                      <span className="capitalize">{item.sound}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {getStatusBadge(item.time)}
                  <button
                    onClick={() => ringBellNow(item)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
                    title="Uji coba nada bel ini"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {todaySchedules.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                Tidak ada jadwal aktif untuk hari ini.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Riwayat Terakhir & System Diagnostics */}
        <div className="space-y-6">
          
          {/* Quick Hardware Diagnostic card */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Status Output Audio Sekolah</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-300">Speaker / Amplifier:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Siap (AUX/BT)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-300">Mesin Suara (Offline):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Web Audio API</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-300">Text-to-Speech (TTS):</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">Bahasa Indonesia</span>
              </div>
            </div>

            <button
              onClick={testAudio}
              className="w-full py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Uji Coba Suara Speaker (Test Beep)
            </button>
          </div>

          {/* Recent History Feed */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Riwayat Bel Terakhir
              </h4>
              <button
                onClick={() => setActiveTab('history')}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-2">
              {history.slice(0, 4).map((h) => (
                <div
                  key={h.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex items-start gap-2.5 text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 shrink-0 mt-0.5">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {h.bellTitle}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(h.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB • Mode {h.triggerMode}
                    </p>
                  </div>
                </div>
              ))}

              {history.length === 0 && (
                <p className="text-center py-4 text-xs text-slate-400">
                  Belum ada catatan riwayat bel hari ini.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Device Logo Modal */}
      <DeviceLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />

    </div>
  );
};
