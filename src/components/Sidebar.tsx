import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Clock,
  Mic,
  MessageSquare,
  GraduationCap,
  CalendarDays,
  History,
  Settings,
  HelpCircle,
  Bell,
  Play,
  SkipForward,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const {
    nextBell,
    secondsToNextBell,
    ringBellNow,
    snoozeNextBell,
    skipNextBell,
    currentRole,
    isExamMode,
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard, badge: null },
    { id: 'schedules', label: 'Jadwal Bel', icon: Clock, badge: isExamMode ? 'Ujian' : null },
    { id: 'announcer', label: 'AI Announcer', icon: Mic, badge: 'Suara' },
    { id: 'chat', label: 'Chat CS Pintar', icon: MessageSquare, badge: 'AI' },
    { id: 'guru', label: 'Guru Virtual AI', icon: GraduationCap, badge: '5 Mode' },
    { id: 'calendar', label: 'Kalender Akademik', icon: CalendarDays, badge: null },
    { id: 'history', label: 'Riwayat & Log', icon: History, badge: null },
    { id: 'settings', label: 'Pengaturan & Logo', icon: Settings, badge: null },
    { id: 'help', label: 'Bantuan & Audio', icon: HelpCircle, badge: null },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const formatCountdown = (totalSec: number | null) => {
    if (totalSec === null || totalSec <= 0) return '00:00';
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <aside
      className={`flex flex-col justify-between h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 ${
        isMobileDrawer ? 'w-full py-4' : 'w-64 py-5'
      }`}
    >
      {/* Top Menu Links */}
      <div className="px-3 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Menu Utama DESAKA AI
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 dark:bg-blue-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Card: Live Next Bell Card */}
      <div className="px-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 p-4 text-white shadow-lg border border-blue-800/40">
          {/* Subtle background glow */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              Bel Berikutnya
            </span>
            <span className="font-mono text-xs font-black bg-white/10 px-2 py-0.5 rounded-md text-blue-200">
              {nextBell ? nextBell.time : '--:--'}
            </span>
          </div>

          <h4 className="font-bold text-sm text-white line-clamp-1 leading-tight mb-2">
            {nextBell ? nextBell.title : 'Semua bel hari ini selesai'}
          </h4>

          {nextBell && (
            <div className="flex items-baseline justify-between mb-3 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-[11px] text-slate-300">Hitung Mundur:</span>
              <span className="font-mono font-black text-lg text-amber-400 tracking-wider">
                {formatCountdown(secondsToNextBell)}
              </span>
            </div>
          )}

          {/* Quick Bell action buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={() => ringBellNow()}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white transition-all active:scale-95 shadow-sm"
              title="Bunyikan Sekarang Secara Manual"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Dering</span>
            </button>
            <button
              onClick={() => snoozeNextBell(5)}
              disabled={!nextBell}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-bold text-white disabled:opacity-40 transition-all active:scale-95"
              title="Tunda 5 Menit"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Tunda</span>
            </button>
            <button
              onClick={() => skipNextBell()}
              disabled={!nextBell}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-bold text-white disabled:opacity-40 transition-all active:scale-95"
              title="Lewati Bel Ini"
            >
              <SkipForward className="w-3 h-3" />
              <span>Lewati</span>
            </button>
          </div>
        </div>

        {/* Offline & App Info footer */}
        <div className="mt-3 px-1 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Mode Offline Siap
          </span>
          <span>v2.4 Pro</span>
        </div>
      </div>
    </aside>
  );
};
