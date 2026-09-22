import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AcademicHoliday } from '../types';
import {
  CalendarDays,
  Plus,
  Trash2,
  BellOff,
  Bell,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { holidays, addHoliday, deleteHoliday, currentTime } = useApp();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Omit<AcademicHoliday, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    type: 'libur_nasional',
    description: '',
    isBellDisabled: true,
  });

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const holidayTypeLabels: Record<string, { label: string; badge: string }> = {
    libur_nasional: { label: 'Libur Nasional', badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
    libur_sekolah: { label: 'Libur Semester/Sekolah', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    libur_semester: { label: 'Libur Semester', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    kegiatan: { label: 'Kegiatan Sekolah', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    ujian: { label: 'Pekan Ujian', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    addHoliday(formData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      type: 'libur_nasional',
      description: '',
      isBellDisabled: true,
    });
    setIsModalOpen(false);
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Kalender Akademik & Pengaturan Hari Libur
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Bel sekolah otomatis akan otomatis terjeda pada hari libur resmi untuk mencegah bunyi bel yang tidak diinginkan.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Hari Libur / Agenda</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1 Col): Interactive Month Grid */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white capitalize">
              {monthName}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                ←
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                →
              </button>
            </div>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
              <span key={i} className="font-bold text-slate-400 py-1">
                {d}
              </span>
            ))}

            {/* Empty prefix cells */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {/* Actual day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday =
                currentTime.getFullYear() === year &&
                currentTime.getMonth() === month &&
                currentTime.getDate() === dayNum;

              const matchedHoliday = holidays.find((h) => h.date === dateString);

              return (
                <div
                  key={dayNum}
                  className={`p-2 rounded-xl text-xs font-semibold relative flex flex-col items-center justify-center transition-all ${
                    isToday
                      ? 'bg-blue-600 text-white font-black'
                      : matchedHoliday
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 font-bold border border-red-200 dark:border-red-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                  title={matchedHoliday ? `${matchedHoliday.title} (${matchedHoliday.type})` : undefined}
                >
                  <span>{dayNum}</span>
                  {matchedHoliday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute bottom-1" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Hari Ini</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Libur / Bel Otomatis Dimatikan</span>
            </div>
          </div>
        </div>

        {/* Right Column (2 Cols): Holidays List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Daftar Hari Libur & Agenda Khusus
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Total {holidays.length} catatan
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 text-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {new Date(h.date).toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                    <span className="font-black text-base text-slate-900 dark:text-white">
                      {new Date(h.date).getDate()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {h.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${holidayTypeLabels[h.type].badge}`}>
                        {holidayTypeLabels[h.type].label}
                      </span>
                    </div>

                    {h.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {h.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                      {h.isBellDisabled ? (
                        <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                          <BellOff className="w-3 h-3" /> Bel Sekolah Otomatis Dinonaktifkan
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Bell className="w-3 h-3" /> Bel Sekolah Tetap Berbunyi
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteHoliday(h.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Hapus Agenda"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {holidays.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada hari libur yang ditambahkan.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Tambah Hari Libur / Agenda Sekolah
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tanggal:
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Hari Libur / Kegiatan:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Libur Semester Ganjil..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kategori Agenda:
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="libur_nasional">Libur Nasional</option>
                  <option value="libur_sekolah">Libur Semester / Sekolah</option>
                  <option value="kegiatan">Kegiatan Sekolah</option>
                  <option value="ujian">Pekan Ujian</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Keterangan Tambahan:
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Opsional..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBellDisabled}
                  onChange={(e) => setFormData({ ...formData, isBellDisabled: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Nonaktifkan bel sekolah otomatis pada hari ini
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
