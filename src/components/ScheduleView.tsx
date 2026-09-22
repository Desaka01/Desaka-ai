import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../services/soundEngine';
import { DesakaLogo } from './DesakaLogo';
import { BellScheduleItem, BellType, BellSound } from '../types';
import {
  Clock,
  Plus,
  Play,
  Edit2,
  Trash2,
  Copy,
  Printer,
  Download,
  Upload,
  RotateCcw,
  Check,
  Volume2,
  VolumeX,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const {
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    duplicateSchedule,
    toggleSchedule,
    resetDefaultSchedules,
    copyDaySchedule,
    currentSchool,
    currentRole,
    isExamMode,
    setIsExamMode,
    customLogoUrl,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'harian' | 'ujian' | 'khusus'>('harian');
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Senin
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<BellScheduleItem | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState<boolean>(false);
  const [copyTargetDays, setCopyTargetDays] = useState<number[]>([2, 3, 4]); // Selasa, Rabu, Kamis

  // Form State
  const [formData, setFormData] = useState<Omit<BellScheduleItem, 'id'>>({
    time: '07:00',
    days: [1, 2, 3, 4, 5],
    title: '',
    type: 'masuk',
    sound: 'westminster',
    announcementText: '',
    enabled: true,
    targetGroup: 'Semua Kelas',
    repeatCount: 1,
    volume: 90,
    category: 'reguler',
  });

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const bellTypeOptions: { value: BellType; label: string }[] = [
    { value: 'masuk', label: 'Bel Masuk Sekolah' },
    { value: 'pergantian', label: 'Pergantian Jam Pelajaran' },
    { value: 'istirahat', label: 'Bel Istirahat' },
    { value: 'masuk_istirahat', label: 'Bel Masuk dari Istirahat' },
    { value: 'persiapan_ujian', label: 'Persiapan Ujian' },
    { value: 'ujian_mulai', label: 'Ujian Dimulai' },
    { value: 'ujian_selesai', label: 'Ujian Selesai' },
    { value: 'pulang', label: 'Bel Pulang Sekolah' },
    { value: 'upacara', label: 'Upacara / Senam' },
    { value: 'custom', label: 'Jadwal Khusus / Lainnya' },
  ];

  const soundOptions: { value: BellSound; label: string; desc: string }[] = [
    { value: 'westminster', label: 'Westminster Chime', desc: 'Melodi lonceng gereja/sekolah klasik 4 nada' },
    { value: 'electric', label: 'Electric School Bell', desc: 'Dering lonceng listrik cepat (kring-kring)' },
    { value: 'soft_chime', label: 'Soft Modern Chime', desc: 'Dua nada ding-dong lembut kelas' },
    { value: 'digital_marimba', label: 'Digital Pelog / Marimba', desc: 'Harmoni pentatonik khas Indonesia' },
    { value: 'exam_alert', label: 'Exam Focus Alert', desc: 'Nada hening khusus peringatan ujian' },
    { value: 'siren', label: 'Evacuation Siren', desc: 'Sirine darurat' },
  ];

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    if (activeTab === 'ujian') {
      return s.category === 'ujian';
    }
    if (activeTab === 'khusus') {
      return s.category === 'khusus';
    }
    // Harian tab
    return s.days.includes(selectedDay);
  }).sort((a, b) => a.time.localeCompare(b.time));

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      time: '07:30',
      days: activeTab === 'ujian' ? [1, 2, 3, 4, 5, 6] : [selectedDay],
      title: '',
      type: activeTab === 'ujian' ? 'ujian_mulai' : 'pergantian',
      sound: activeTab === 'ujian' ? 'exam_alert' : 'soft_chime',
      announcementText: '',
      enabled: true,
      targetGroup: activeTab === 'ujian' ? 'Peserta Ujian' : 'Semua Kelas',
      repeatCount: 1,
      volume: 90,
      category: activeTab === 'ujian' ? 'ujian' : activeTab === 'khusus' ? 'khusus' : 'reguler',
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (item: BellScheduleItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  // Save form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingItem) {
      updateSchedule(editingItem.id, formData);
    } else {
      addSchedule(formData);
    }
    setIsModalOpen(false);
  };

  // Preview sound & announcement
  const handlePreview = (item: BellScheduleItem) => {
    soundEngine.playBellWithAnnouncement(item.sound, item.announcementText, { rate: 0.95 });
  };

  // Copy schedule from current day to other days
  const handleExecuteCopy = () => {
    copyDaySchedule(selectedDay, copyTargetDays);
    setIsCopyModalOpen(false);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(schedules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `desaka_jadwal_bel_${currentSchool.code.toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => addSchedule(item));
          alert('Jadwal berhasil diimpor!');
        }
      } catch (err) {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Manajemen Jadwal Bel Sekolah
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur waktu dering, jenis nada, pengumuman otomatis, dan mode ujian untuk {currentSchool.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            title="Ekspor Backup Jadwal ke JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor</span>
          </button>

          <label className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Impor</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handlePrint}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            title="Cetak Jadwal Resmi (Print / PDF)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Tabs: Harian, Ujian, Khusus */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('harian')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'harian'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Jadwal Harian Reguler
        </button>
        <button
          onClick={() => setActiveTab('ujian')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'ujian'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Jadwal Khusus Ujian
        </button>
        <button
          onClick={() => setActiveTab('khusus')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'khusus'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Jadwal Kegiatan Khusus
        </button>
      </div>

      {/* Day Selector (for Harian tab) */}
      {activeTab === 'harian' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
              const count = schedules.filter((s) => s.category === 'reguler' && s.days.includes(dayIdx)).length;
              return (
                <button
                  key={dayIdx}
                  onClick={() => setSelectedDay(dayIdx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedDay === dayIdx
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{dayNames[dayIdx]}</span>
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsCopyModalOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            title="Salin jadwal hari ini ke hari-hari lainnya"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin ke Hari Lain</span>
          </button>
        </div>
      )}

      {/* Schedule Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Status</th>
                <th className="py-3.5 px-4 w-24">Waktu</th>
                <th className="py-3.5 px-4">Nama Sesi & Pengumuman Suara</th>
                <th className="py-3.5 px-4 w-32">Kategori</th>
                <th className="py-3.5 px-4 w-36">Nada Suara</th>
                <th className="py-3.5 px-4 w-28">Sasaran</th>
                <th className="py-3.5 px-4 w-32 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSchedules.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                    !item.enabled ? 'opacity-50 bg-slate-50/40 dark:bg-slate-950/20' : ''
                  }`}
                >
                  {/* Status Toggle Switch */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleSchedule(item.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          item.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Time */}
                  <td className="py-3.5 px-4 font-mono font-black text-sm text-slate-900 dark:text-white">
                    {item.time} WIB
                  </td>

                  {/* Title & Announcement Preview */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.title}
                    </div>
                    {item.announcementText && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 italic">
                        "{item.announcementText}"
                      </p>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                      {item.type.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Sound Tone */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    <span className="capitalize">{item.sound.replace('_', ' ')}</span>
                    <span className="text-[10px] text-slate-400 block">{item.repeatCount}x • Vol {item.volume}%</span>
                  </td>

                  {/* Target */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {item.targetGroup}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handlePreview(item)}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 transition-colors"
                        title="Dengarkan pratinjau nada bel dan suara AI"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => duplicateSchedule(item.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Duplikasi jadwal ini"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
                        title="Edit jadwal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus jadwal "${item.title}"?`)) {
                            deleteSchedule(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 transition-colors"
                        title="Hapus jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-xs">Belum ada jadwal untuk kategori ini.</p>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-3 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 text-white"
                    >
                      + Tambah Jadwal Baru
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Official Schedule View (Only shows when printing) */}
      <div className="hidden print:block p-8 bg-white text-black font-serif">
        <div className="border-b-4 border-double border-black pb-4 mb-5 flex items-center justify-between gap-4">
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            <DesakaLogo
              variant="icon"
              size="lg"
              customLogoUrl={customLogoUrl}
              schoolName={currentSchool.name}
            />
          </div>
          <div className="text-center flex-1">
            <h3 className="text-[11px] font-bold uppercase tracking-wider">
              PEMERINTAH KABUPATEN KARANGANYAR
            </h3>
            <h3 className="text-[11px] font-bold uppercase tracking-wider">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h3>
            <h1 className="text-lg font-black uppercase tracking-wide mt-0.5">
              {currentSchool.name}
            </h1>
            <p className="text-[10px] italic">
              {currentSchool.address}, {currentSchool.city} • {currentSchool.code}
            </p>
          </div>
          <div className="w-20 h-20 shrink-0 flex items-center justify-center opacity-0 pointer-events-none">
            {/* Spacer to center title */}
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-sm font-black underline uppercase tracking-wide">
            JADWAL RESMI BEL SEKOLAH OTOMATIS
          </h2>
          <p className="text-[10px] italic mt-0.5 text-slate-700">
            Tahun Ajaran 2025/2026 • Didukung oleh DESAKA AI — Asisten Sekolah Pintar
          </p>
        </div>

        <table className="w-full border-collapse border border-black text-xs my-4">
          <thead>
            <tr className="bg-slate-100 border border-black font-bold">
              <th className="border border-black p-2">No</th>
              <th className="border border-black p-2">Waktu</th>
              <th className="border border-black p-2">Kegiatan / Bel</th>
              <th className="border border-black p-2">Hari</th>
              <th className="border border-black p-2">Sasaran</th>
              <th className="border border-black p-2">Keterangan Suara</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, idx) => (
              <tr key={s.id} className="border border-black">
                <td className="border border-black p-2 text-center">{idx + 1}</td>
                <td className="border border-black p-2 font-mono font-bold text-center">{s.time} WIB</td>
                <td className="border border-black p-2 font-bold">{s.title}</td>
                <td className="border border-black p-2 text-center">
                  {s.days.map((d) => dayNames[d].slice(0, 3)).join(', ')}
                </td>
                <td className="border border-black p-2">{s.targetGroup}</td>
                <td className="border border-black p-2 text-[10px]">{s.sound}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 pt-12 text-center text-xs">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah</p>
            <div className="h-16" />
            <p className="font-bold underline">{currentSchool.principalName}</p>
            <p>NIP. 19740512 199903 1 004</p>
          </div>
          <div>
            <p>{currentSchool.city}, {new Date().toLocaleDateString('id-ID')}</p>
            <p className="font-bold">Operator Bel & Sistem IT</p>
            <div className="h-16" />
            <p className="font-bold underline">{currentSchool.operatorName}</p>
            <p>NIP/NUPTK. 8492048291039</p>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {editingItem ? 'Edit Jadwal Bel' : 'Tambah Jadwal Bel Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Time & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Waktu (HH:mm)
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Jadwal / Sesi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Bel Istirahat Pertama, Pergantian Jam..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Day selection */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Hari Berlakunya Bel:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                    const isSelected = formData.days.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({ ...formData, days: formData.days.filter((x) => x !== d) });
                          } else {
                            setFormData({ ...formData, days: [...formData.days, d].sort() });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {dayNames[d]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bell Type & Sound Tone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Jenis Bel:
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as BellType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {bellTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Pilihan Suara Bel:
                  </label>
                  <select
                    value={formData.sound}
                    onChange={(e) => setFormData({ ...formData, sound: e.target.value as BellSound })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {soundOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Volume & Repeat */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Pengulangan Dering:
                  </label>
                  <select
                    value={formData.repeatCount}
                    onChange={(e) => setFormData({ ...formData, repeatCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value={1}>1 Kali</option>
                    <option value={2}>2 Kali</option>
                    <option value={3}>3 Kali</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Volume: {formData.volume}%
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: Number(e.target.value) })}
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sasaran Pendengar:
                  </label>
                  <input
                    type="text"
                    value={formData.targetGroup}
                    onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
                    placeholder="Semua Kelas, Guru, dll"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Announcement text */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Naskah Pengumuman Suara AI (Opsional dibaca setelah bel):
                  </label>
                  <button
                    type="button"
                    onClick={() => soundEngine.playBellWithAnnouncement(formData.sound, formData.announcementText)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    <Play className="w-3 h-3" /> Tes Suara
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={formData.announcementText}
                  onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                  placeholder="Contoh: Selamat pagi anak-anak, bel masuk sekolah telah berbunyi. Silakan memasuki kelas masing-masing..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan ke Jadwal'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* COPY SCHEDULE MODAL */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Salin Jadwal Hari {dayNames[selectedDay]} ke Hari Lain
            </h3>
            <p className="text-xs text-slate-500">
              Pilih hari target untuk menerapkan jadwal yang sama:
            </p>

            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].filter((d) => d !== selectedDay).map((d) => {
                const checked = copyTargetDays.includes(d);
                return (
                  <label key={d} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCopyTargetDays([...copyTargetDays, d]);
                        } else {
                          setCopyTargetDays(copyTargetDays.filter((x) => x !== d));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>Hari {dayNames[d]}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteCopy}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md"
              >
                Terapkan Salinan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
