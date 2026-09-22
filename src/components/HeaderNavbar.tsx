import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DesakaLogo } from './DesakaLogo';
import { DeviceLogoModal } from './DeviceLogoModal';
import { UserRole } from '../types';
import {
  Bell,
  Clock,
  Volume2,
  AlertTriangle,
  Sun,
  Moon,
  Shield,
  UserCheck,
  ChevronDown,
  VolumeX,
  Radio,
  BookOpen,
  Sparkles,
  Camera,
} from 'lucide-react';

interface HeaderNavbarProps {
  onOpenEmergency: () => void;
  onOpenMobileMenu?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  onOpenEmergency,
  onOpenMobileMenu,
  activeTab,
  setActiveTab,
}) => {
  const {
    formattedTime,
    formattedDate,
    currentSchool,
    currentRole,
    setCurrentRole,
    isAutoBellEnabled,
    setIsAutoBellEnabled,
    isExamMode,
    isEmergencyActive,
    customLogoUrl,
    theme,
    setTheme,
    ringBellNow,
    nextBell,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    super_admin: { label: 'Super Admin', badge: 'SA', color: 'bg-purple-600 text-white' },
    admin_sekolah: { label: 'Admin Sekolah', badge: 'AD', color: 'bg-blue-600 text-white' },
    guru: { label: 'Bapak/Ibu Guru', badge: 'GU', color: 'bg-emerald-600 text-white' },
    siswa: { label: 'Siswa / Murid', badge: 'SI', color: 'bg-amber-600 text-white' },
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            {onOpenMobileMenu && (
              <button
                type="button"
                onClick={onOpenMobileMenu}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                aria-label="Buka Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="text-left focus:outline-none group transition-transform active:scale-95"
              >
                <DesakaLogo
                  variant="horizontal"
                  size="md"
                  customLogoUrl={customLogoUrl}
                  schoolName={currentSchool.name}
                  showTagline={false}
                  onEditClick={() => setIsLogoModalOpen(true)}
                />
              </button>
            </div>

            {/* School Tag Badge with Quick Logo Change */}
            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 transition-colors cursor-pointer group"
                title="Ganti logo sekolah dari penyimpanan perangkat ini"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>{currentSchool.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-200/70 dark:bg-blue-800/70 text-blue-800 dark:text-blue-200 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  Ganti Logo
                </span>
              </button>
            </div>
          </div>

          {/* Center: Digital Clock (Asia/Jakarta WIB) */}
          <div className="hidden md:flex flex-col items-center justify-center py-1 px-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-sm border border-blue-700/30">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white drop-shadow-xs">
                {formattedTime}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/20">
                WIB
              </span>
            </div>
            <span className="text-[11px] font-medium text-blue-200/90 tracking-wide mt-0.5">
              {formattedDate}
            </span>
          </div>

          {/* Right: Status Badges, Emergency, Roles, Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Auto-bell status toggle */}
            <button
              onClick={() => setIsAutoBellEnabled(!isAutoBellEnabled)}
              title={isAutoBellEnabled ? 'Bel Otomatis Aktif (Klik untuk jeda)' : 'Bel Otomatis Nonaktif (Klik untuk aktifkan)'}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isAutoBellEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isAutoBellEnabled && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isAutoBellEnabled ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <span className="hidden md:inline">Bel:</span> {isAutoBellEnabled ? 'Otomatis' : 'Manual Saja'}
            </button>

            {/* Exam Mode Badge if active */}
            {isExamMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                Mode Ujian
              </span>
            )}

            {/* Quick Ring Manual Button */}
            <button
              onClick={() => ringBellNow()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              title="Bunyikan Bel Sekarang Secara Manual"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bunyikan Bel</span>
            </button>

            {/* Emergency Evacuation Button */}
            <button
              onClick={onOpenEmergency}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                isEmergencyActive
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60'
              }`}
              title="Sirine Darurat & Pengumuman Evakuasi"
            >
              <AlertTriangle className="w-4 h-4 inline-block sm:mr-1 text-red-500" />
              <span className="hidden sm:inline">Darurat</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Ganti Tema (Gelap / Terang)"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/60 dark:border-slate-700/60"
              >
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${roleLabels[currentRole].color}`}>
                  {roleLabels[currentRole].badge}
                </span>
                <span className="hidden md:inline">{roleLabels[currentRole].label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white">Simulasi Hak Akses</p>
                      <p className="text-[11px] text-slate-500">Pilih peran pengguna di aplikasi</p>
                    </div>
                    {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setCurrentRole(r);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${
                          currentRole === r ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${roleLabels[r].color}`}>
                            {roleLabels[r].badge}
                          </span>
                          <span>{roleLabels[r].label}</span>
                        </div>
                        {currentRole === r && <span className="text-blue-600 font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Modal for Device Storage Logo Management */}
      <DeviceLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />
    </header>
  );
};
