import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderNavbar } from './components/HeaderNavbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ScheduleView } from './components/ScheduleView';
import { VoiceAnnouncerView } from './components/VoiceAnnouncerView';
import { ChatAIView } from './components/ChatAIView';
import { GuruAIView } from './components/GuruAIView';
import { CalendarView } from './components/CalendarView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { HelpView } from './components/HelpView';
import { EmergencyModal } from './components/EmergencyModal';
import { X, Sparkles, Heart } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} onOpenEmergency={() => setIsEmergencyModalOpen(true)} />;
      case 'schedules':
        return <ScheduleView />;
      case 'announcer':
        return <VoiceAnnouncerView />;
      case 'chat':
        return <ChatAIView />;
      case 'guru':
        return <GuruAIView />;
      case 'calendar':
        return <CalendarView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} onOpenEmergency={() => setIsEmergencyModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <HeaderNavbar
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0 sticky top-20 h-[calc(100vh-5rem)]">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full flex flex-col z-10 shadow-2xl">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-800 dark:text-white">
                  Menu Navigasi
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isMobileDrawer={true}
                  onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md py-4 text-center text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="font-bold text-slate-800 dark:text-slate-200">DESAKA AI</span>
            <span>— Asisten Sekolah Pintar</span>
            <span className="hidden md:inline italic text-slate-400">
              • "Cerdas Mengingatkan, Pintar Mengajarkan."
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Sistem Bel Siap
            </span>
            <span>•</span>
            <span>Teknologi Web Audio & Gemini AI</span>
          </div>
        </div>
      </footer>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
