import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  BellScheduleItem,
  UserRole,
  SchoolProfile,
  BellHistoryItem,
  AcademicHoliday,
  AnnouncerPreset,
} from '../types';
import { soundEngine } from '../services/soundEngine';

interface AppContextType {
  // Realtime Clock
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;
  timezone: string;
  setTimezone: (tz: string) => void;

  // School Profile & Multi-School
  currentSchool: SchoolProfile;
  availableSchools: SchoolProfile[];
  switchSchool: (schoolId: string) => void;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;

  // Roles & Auth
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  // Schedules
  schedules: BellScheduleItem[];
  addSchedule: (item: Omit<BellScheduleItem, 'id'>) => void;
  updateSchedule: (id: string, item: Partial<BellScheduleItem>) => void;
  deleteSchedule: (id: string) => void;
  duplicateSchedule: (id: string) => void;
  toggleSchedule: (id: string) => void;
  resetDefaultSchedules: () => void;
  copyDaySchedule: (fromDay: number, toDays: number[]) => void;

  // Bell Automation & Control
  isAutoBellEnabled: boolean;
  setIsAutoBellEnabled: (enabled: boolean) => void;
  isExamMode: boolean;
  setIsExamMode: (exam: boolean) => void;
  isEmergencyActive: boolean;
  triggerEmergency: (reason: string) => void;
  cancelEmergency: () => void;

  // Next Bell & Controls
  nextBell: BellScheduleItem | null;
  secondsToNextBell: number | null;
  ringBellNow: (scheduleOrCustom?: Partial<BellScheduleItem>) => Promise<void>;
  snoozeNextBell: (minutes?: number) => void;
  skipNextBell: () => void;

  // History
  history: BellHistoryItem[];
  clearHistory: () => void;

  // Academic Calendar
  holidays: AcademicHoliday[];
  addHoliday: (holiday: Omit<AcademicHoliday, 'id'>) => void;
  deleteHoliday: (id: string) => void;
  isTodayHoliday: boolean;
  todayHolidayName: string | null;

  // Announcements
  announcerPresets: AnnouncerPreset[];
  saveAnnouncerPreset: (preset: Omit<AnnouncerPreset, 'id'>) => void;
  deleteAnnouncerPreset: (id: string) => void;

  // Branding & Logo
  customLogoUrl: string | null;
  setCustomLogoUrl: (url: string | null) => void;

  // Settings
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  masterVolume: number;
  setMasterVolume: (vol: number) => void;
  isAudioConnected: boolean;
  testAudio: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial default school profiles
const DEFAULT_SCHOOLS: SchoolProfile[] = [
  {
    id: 'school_sdn1_kalisoro',
    name: 'SD Negeri 1 Kalisoro',
    code: 'NPSN: 20312078',
    address: 'Jl. Sekrincing, Kalisoro, Kec. Tawangmangu',
    city: 'Kab. Karanganyar, Jawa Tengah',
    level: 'SD',
    principalName: 'Sri Mulyani, S.Pd., M.Pd.',
    operatorName: 'Operator Bel SDN 1 Kalisoro',
  },
  {
    id: 'school_2',
    name: 'SMP Negeri 1 Tawangmangu',
    code: 'NPSN: 20312100',
    address: 'Jl. Raya Tawangmangu No. 18',
    city: 'Kab. Karanganyar, Jawa Tengah',
    level: 'SMP',
    principalName: 'Drs. H. Bambang Suhartono, M.Pd.',
    operatorName: 'Ahmad Fauzi, S.Kom.',
  },
];

// Initial realistic regular schedule for SD Negeri 1 Kalisoro
const DEFAULT_REGULAR_SCHEDULES: BellScheduleItem[] = [
  {
    id: 'bel_1',
    time: '06:45',
    days: [1], // Senin
    title: 'Persiapan Upacara Bendera Hari Senin',
    type: 'upacara',
    sound: 'westminster',
    announcementText: 'Perhatian seluruh siswa-siswi SD Negeri 1 Kalisoro dan bapak ibu guru. Waktu menunjukkan pukul 06:45. Silakan segera menuju lapangan upacara untuk persiapan upacara bendera hari Senin. Bariskan barisan kelas dengan tertib.',
    enabled: true,
    targetGroup: 'Semua Siswa & Guru',
    repeatCount: 1,
    volume: 100,
    category: 'reguler',
  },
  {
    id: 'bel_1b',
    time: '06:45',
    days: [5], // Jumat
    title: 'Senam Pagi Ceria & Gerakan Literasi',
    type: 'upacara',
    sound: 'westminster',
    announcementText: 'Selamat pagi anak-anak hebat SD Negeri 1 Kalisoro. Waktunya kegiatan senam pagi sehat dan literasi bersama di halaman sekolah. Mari berbaris dengan ceria.',
    enabled: true,
    targetGroup: 'Semua Siswa',
    repeatCount: 1,
    volume: 95,
    category: 'reguler',
  },
  {
    id: 'bel_2',
    time: '07:00',
    days: [1, 2, 3, 4, 5],
    title: 'Bel Masuk Sekolah & Doa Bersama',
    type: 'masuk',
    sound: 'westminster',
    announcementText: 'Selamat pagi anak-anak SD Negeri 1 Kalisoro yang cerdas dan berkarakter. Bel masuk sekolah telah berbunyi. Silakan masuk ke kelas masing-masing dengan tertib, rapikan meja, dan awali hari ini dengan berdoa bersama.',
    enabled: true,
    targetGroup: 'Semua Kelas (1-6)',
    repeatCount: 1,
    volume: 95,
    category: 'reguler',
  },
  {
    id: 'bel_3',
    time: '07:15',
    days: [1, 2, 3, 4, 5],
    title: 'Jam Pelajaran Ke-1 Dimulai',
    type: 'masuk',
    sound: 'soft_chime',
    announcementText: 'Jam pelajaran pertama segera dimulai. Kepada bapak ibu guru pengajar, dipersilakan memasuki ruang kelas. Selamat belajar anak-anak!',
    enabled: true,
    targetGroup: 'Semua Kelas',
    repeatCount: 1,
    volume: 90,
    category: 'reguler',
  },
  {
    id: 'bel_4',
    time: '07:50',
    days: [1, 2, 3, 4, 5],
    title: 'Pergantian Jam Pelajaran Ke-2',
    type: 'pergantian',
    sound: 'soft_chime',
    announcementText: 'Jam pelajaran pertama telah selesai. Sekarang memasuki jam pelajaran kedua. Tetap fokus dan semangat belajar.',
    enabled: true,
    targetGroup: 'Semua Kelas',
    repeatCount: 1,
    volume: 85,
    category: 'reguler',
  },
  {
    id: 'bel_5',
    time: '08:25',
    days: [1, 2, 3, 4, 5],
    title: 'Pergantian Jam Pelajaran Ke-3',
    type: 'pergantian',
    sound: 'soft_chime',
    announcementText: 'Memasuki jam pelajaran ketiga.',
    enabled: true,
    targetGroup: 'Semua Kelas',
    repeatCount: 1,
    volume: 85,
    category: 'reguler',
  },
  {
    id: 'bel_6',
    time: '09:00',
    days: [1, 2, 3, 4, 5],
    title: 'Bel Istirahat Pertama & Cuci Tangan',
    type: 'istirahat',
    sound: 'digital_marimba',
    announcementText: 'Bel istirahat pertama telah berbunyi. Selamat beristirahat anak-anak. Jangan lupa cuci tangan dengan sabun sebelum makan bekal, makan dengan tertib, dan buang bungkus makanan ke tempat sampah.',
    enabled: true,
    targetGroup: 'Semua Kelas',
    repeatCount: 1,
    volume: 90,
    category: 'reguler',
  },
  {
    id: 'bel_7',
    time: '09:20',
    days: [1, 2, 3, 4, 5],
    title: 'Bel Masuk Kembali (Jam Ke-4)',
    type: 'masuk_istirahat',
    sound: 'westminster',
    announcementText: 'Waktu istirahat telah selesai. Seluruh siswa dipersilakan segera kembali ke dalam kelas masing-masing untuk melanjutkan jam pelajaran keempat.',
    enabled: true,
    targetGroup: 'Semua Kelas',
    repeatCount: 1,
    volume: 95,
    category: 'reguler',
  },
  {
    id: 'bel_8',
    time: '09:55',
    days: [1, 2, 3, 4, 5],
    title: 'Pergantian Jam Pelajaran Ke-5',
    type: 'pergantian',
    sound: 'soft_chime',
    announcementText: 'Jam pelajaran keempat selesai, sekarang memasuki jam pelajaran kelima.',
    enabled: true,
    targetGroup: 'Semua Kelas',
    repeatCount: 1,
    volume: 85,
    category: 'reguler',
  },
  {
    id: 'bel_9',
    time: '10:30',
    days: [1, 2, 3, 4],
    title: 'Pergantian Jam Pelajaran Ke-6',
    type: 'pergantian',
    sound: 'soft_chime',
    announcementText: 'Memasuki jam pelajaran keenam.',
    enabled: true,
    targetGroup: 'Semua Kelas',
    repeatCount: 1,
    volume: 85,
    category: 'reguler',
  },
  {
    id: 'bel_9_jumat',
    time: '10:30',
    days: [5], // Jumat
    title: 'Bel Pulang Hari Jumat & Doa',
    type: 'pulang',
    sound: 'electric',
    announcementText: 'Kegiatan belajar hari Jumat telah selesai. Rapikan alat tulis, berdoa bersama, dan salam untuk keluarga di rumah. Selamat berakhir pekan!',
    enabled: true,
    targetGroup: 'Semua Siswa',
    repeatCount: 1,
    volume: 100,
    category: 'reguler',
  },
  {
    id: 'bel_10',
    time: '11:05',
    days: [1, 2, 3, 4],
    title: 'Istirahat Kedua & Sholat Dzuhur Berjamaah',
    type: 'istirahat',
    sound: 'digital_marimba',
    announcementText: 'Bel istirahat kedua dan waktu sholat Dzuhur telah tiba. Siswa muslim dipersilakan mengambil air wudhu dengan tertib dan melaksanakan sholat Dzuhur berjamaah di musholla sekolah.',
    enabled: true,
    targetGroup: 'Semua Siswa',
    repeatCount: 1,
    volume: 90,
    category: 'reguler',
  },
  {
    id: 'bel_12',
    time: '11:35',
    days: [1, 2, 3, 4],
    title: 'Bel Masuk Jam Ke-7 (Kelas Atas)',
    type: 'masuk_istirahat',
    sound: 'westminster',
    announcementText: 'Waktu istirahat kedua telah selesai. Siswa kelas atas dipersilakan masuk kembali ke ruang kelas untuk jam pelajaran ketujuh.',
    enabled: true,
    targetGroup: 'Kelas 4, 5, 6',
    repeatCount: 1,
    volume: 90,
    category: 'reguler',
  },
  {
    id: 'bel_14',
    time: '12:10',
    days: [1, 2, 3, 4],
    title: 'Bel Pulang Sekolah & Doa Penutup',
    type: 'pulang',
    sound: 'electric',
    announcementText: 'Bel pulang sekolah telah berbunyi. Kegiatan belajar mengajar hari ini telah selesai. Rapikan meja belajar, bersihkan laci kelas, berdoa bersama, dan berhati-hatilah di jalan saat pulang ke rumah.',
    enabled: true,
    targetGroup: 'Semua Siswa & Guru',
    repeatCount: 1,
    volume: 100,
    category: 'reguler',
  },
];

// Special Exam Schedule preset
const DEFAULT_EXAM_SCHEDULES: BellScheduleItem[] = [
  {
    id: 'exam_1',
    time: '07:00',
    days: [1, 2, 3, 4, 5, 6],
    title: 'Persiapan Masuk Ruang Ujian',
    type: 'persiapan_ujian',
    sound: 'exam_alert',
    announcementText: 'Perhatian kepada seluruh peserta ujian. Waktu menunjukkan pukul 07:00. Silakan meletakkan tas di depan kelas, membawa kartu peserta dan alat tulis, lalu menempati kursi sesuai nomor ujian masing-masing.',
    enabled: true,
    targetGroup: 'Peserta Ujian',
    repeatCount: 1,
    volume: 95,
    category: 'ujian',
  },
  {
    id: 'exam_2',
    time: '07:30',
    days: [1, 2, 3, 4, 5, 6],
    title: 'Ujian Sesi 1 Dimulai',
    type: 'ujian_mulai',
    sound: 'soft_chime',
    announcementText: 'Ujian sesi pertama resmi dimulai. Pengawas ruang dipersilakan membagikan lembar soal dan jawaban. Dilarang berbuat curang, bekerja samalah dengan kejujuran hati Anda. Selamat mengerjakan.',
    enabled: true,
    targetGroup: 'Peserta Ujian',
    repeatCount: 1,
    volume: 90,
    category: 'ujian',
  },
  {
    id: 'exam_3',
    time: '08:50',
    days: [1, 2, 3, 4, 5, 6],
    title: 'Peringatan 10 Menit Sisa Waktu Ujian Sesi 1',
    type: 'pergantian',
    sound: 'exam_alert',
    announcementText: 'Peringatan. Waktu pengerjaan ujian sesi pertama tersisa sepuluh menit lagi. Periksa kembali identitas, nomor ujian, dan lembar jawaban Anda.',
    enabled: true,
    targetGroup: 'Peserta Ujian',
    repeatCount: 1,
    volume: 85,
    category: 'ujian',
  },
  {
    id: 'exam_4',
    time: '09:00',
    days: [1, 2, 3, 4, 5, 6],
    title: 'Ujian Sesi 1 Selesai & Istirahat',
    type: 'ujian_selesai',
    sound: 'westminster',
    announcementText: 'Waktu ujian sesi pertama telah habis. Letakkan alat tulis Anda. Pengawas dipersilakan mengumpulkan lembar jawaban. Peserta ujian dipersilakan beristirahat sejenak di luar ruangan.',
    enabled: true,
    targetGroup: 'Peserta Ujian',
    repeatCount: 1,
    volume: 95,
    category: 'ujian',
  },
  {
    id: 'exam_5',
    time: '09:30',
    days: [1, 2, 3, 4, 5, 6],
    title: 'Ujian Sesi 2 Dimulai',
    type: 'ujian_mulai',
    sound: 'soft_chime',
    announcementText: 'Ujian sesi kedua dimulai. Selamat mengerjakan dengan teliti dan jujur.',
    enabled: true,
    targetGroup: 'Peserta Ujian',
    repeatCount: 1,
    volume: 90,
    category: 'ujian',
  },
  {
    id: 'exam_6',
    time: '10:50',
    days: [1, 2, 3, 4, 5, 6],
    title: 'Peringatan 10 Menit Sisa Waktu Ujian Sesi 2',
    type: 'pergantian',
    sound: 'exam_alert',
    announcementText: 'Peringatan. Waktu ujian sesi kedua tersisa sepuluh menit lagi. Cek kembali kelengkapan jawaban Anda.',
    enabled: true,
    targetGroup: 'Peserta Ujian',
    repeatCount: 1,
    volume: 85,
    category: 'ujian',
  },
  {
    id: 'exam_7',
    time: '11:00',
    days: [1, 2, 3, 4, 5, 6],
    title: 'Ujian Hari Ini Selesai & Pulang',
    type: 'pulang',
    sound: 'electric',
    announcementText: 'Ujian hari ini telah selesai. Seluruh peserta dipersilakan meninggalkan ruang ujian dengan tertib. Persiapkan materi ujian untuk esok hari dan istirahatlah yang cukup di rumah.',
    enabled: true,
    targetGroup: 'Peserta Ujian',
    repeatCount: 1,
    volume: 100,
    category: 'ujian',
  },
];

// Initial academic holidays
const DEFAULT_HOLIDAYS: AcademicHoliday[] = [
  {
    id: 'h_1',
    date: '2026-08-17',
    title: 'Hari Kemerdekaan Republik Indonesia ke-81',
    type: 'libur_nasional',
    description: 'Upacara bendera peringatan HUT Kemerdekaan RI.',
    isBellDisabled: true,
  },
  {
    id: 'h_2',
    date: '2026-10-28',
    title: 'Hari Sumpah Pemuda',
    type: 'kegiatan',
    description: 'Upacara dan pentas seni budaya pemuda.',
    isBellDisabled: false,
  },
  {
    id: 'h_3',
    date: '2026-11-25',
    title: 'Hari Guru Nasional & PGRI',
    type: 'kegiatan',
    description: 'Apresiasi guru dan pertunjukan apresiasi seni murid.',
    isBellDisabled: false,
  },
  {
    id: 'h_4',
    date: '2026-12-14',
    title: 'Penilaian Akhir Semester (PAS) Ganjil',
    type: 'ujian',
    description: 'Pelaksanaan ujian semester ganjil seluruh kelas.',
    isBellDisabled: false,
  },
  {
    id: 'h_5',
    date: '2026-12-25',
    title: 'Hari Raya Natal & Cuti Bersama',
    type: 'libur_nasional',
    description: 'Libur nasional keagamaan.',
    isBellDisabled: true,
  },
];

// Initial Announcer Voice Presets
const DEFAULT_PRESETS: AnnouncerPreset[] = [
  {
    id: 'pre_1',
    title: 'Pengumuman Masuk Pagi',
    context: 'Bel masuk kelas pagi hari',
    text: 'Selamat pagi bapak ibu guru dan seluruh siswa tercinta. Bel masuk sekolah telah berbunyi. Silakan memasuki ruang kelas masing-masing dengan tertib dan awali hari dengan doa bersama.',
    language: 'id',
    tone: 'ramah',
    targetGroup: 'Semua Siswa & Guru',
  },
  {
    id: 'pre_2',
    title: 'Himbauan Kebersihan Kelas & Kantin',
    context: 'Waktu istirahat',
    text: 'Perhatian kepada seluruh siswa yang sedang menikmati waktu istirahat. Harap menjaga kebersihan lingkungan sekolah. Buang bungkus makanan dan minuman ke tempat sampah sesuai jenisnya: organik dan anorganik. Sekolah bersih, belajar pun nyaman.',
    language: 'id',
    tone: 'edukatif',
    targetGroup: 'Semua Siswa',
  },
  {
    id: 'pre_3',
    title: 'Teguran Disiplin & Kerapihan',
    context: 'Disiplin seragam',
    text: 'Pemberitahuan kepada seluruh siswa. Pastikan baju seragam dimasukkan rapi, mengenakan ikat pinggang hitam, kaos kaki putih, dan sepatu hitam sesuai tata tertib sekolah.',
    language: 'id',
    tone: 'tegas',
    targetGroup: 'Semua Siswa',
  },
  {
    id: 'pre_4',
    title: 'Basa Jawa: Sugeng Enjang Pasinaon',
    context: 'Pengumuman bahasa daerah',
    text: 'Sugeng enjang para siswa lan bapak ibu guru. Wanci pasinaon sampun kawiwitan. Mangga sami mlebet dhateng kelasipun piyambak-piyambak kanthi tertib lan nyuwun berkah dhumateng Gusti Kang Maha Kuwaos.',
    language: 'jv',
    tone: 'formal',
    targetGroup: 'Warga Sekolah',
  },
  {
    id: 'pre_5',
    title: 'English: Morning Assembly Notice',
    context: 'Bilingual announcement',
    text: 'Good morning respected teachers and students. The morning bell has rung. Please proceed to your classrooms immediately. Have a productive and joyful day of learning.',
    language: 'en',
    tone: 'formal',
    targetGroup: 'All Students & Teachers',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>('Asia/Jakarta');

  // 2. School Profile
  const [availableSchools, setAvailableSchools] = useState<SchoolProfile[]>(() => {
    const saved = localStorage.getItem('desaka_schools');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((s: SchoolProfile) => s.name?.includes('Kalisoro'))) {
          return parsed;
        }
      } catch {}
    }
    return DEFAULT_SCHOOLS;
  });
  const [currentSchoolId, setCurrentSchoolId] = useState<string>(() => {
    const saved = localStorage.getItem('desaka_active_school_id');
    if (saved && saved !== 'school_1') {
      return saved;
    }
    return 'school_sdn1_kalisoro';
  });

  const currentSchool = availableSchools.find((s) => s.id === currentSchoolId) || availableSchools[0];

  // 3. User Role
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('desaka_user_role') as UserRole) || 'super_admin';
  });

  // 4. Schedules
  const [schedules, setSchedules] = useState<BellScheduleItem[]>(() => {
    const saved = localStorage.getItem('desaka_schedules');
    return saved ? JSON.parse(saved) : DEFAULT_REGULAR_SCHEDULES;
  });

  // 5. Modes
  const [isAutoBellEnabled, setIsAutoBellEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('desaka_auto_bell');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isExamMode, setIsExamModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('desaka_exam_mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);

  // 6. Next Bell & Snooze
  const [snoozedUntil, setSnoozedUntil] = useState<Date | null>(null);
  const [skippedBellId, setSkippedBellId] = useState<string | null>(null);
  const [nextBell, setNextBell] = useState<BellScheduleItem | null>(null);
  const [secondsToNextBell, setSecondsToNextBell] = useState<number | null>(null);

  // 7. History
  const [history, setHistory] = useState<BellHistoryItem[]>(() => {
    const saved = localStorage.getItem('desaka_bell_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 'hist_1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        bellTitle: 'Bel Masuk Sekolah & Doa Bersama',
        type: 'masuk',
        triggerMode: 'otomatis',
        status: 'berhasil',
        note: 'Dering otomatis Westminster Chime + AI Announcer',
      },
    ];
  });

  // 8. Holidays
  const [holidays, setHolidays] = useState<AcademicHoliday[]>(() => {
    const saved = localStorage.getItem('desaka_holidays');
    return saved ? JSON.parse(saved) : DEFAULT_HOLIDAYS;
  });

  // 9. Presets
  const [announcerPresets, setAnnouncerPresets] = useState<AnnouncerPreset[]>(() => {
    const saved = localStorage.getItem('desaka_presets');
    return saved ? JSON.parse(saved) : DEFAULT_PRESETS;
  });

  // 10. Branding & Logo
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('desaka_custom_logo') || null;
  });

  // 11. Theme & Audio
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('desaka_theme') as any) || 'light';
  });
  const [masterVolume, setMasterVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('desaka_master_volume');
    return saved !== null ? Number(saved) : 90;
  });
  const [isAudioConnected, setIsAudioConnected] = useState<boolean>(true);

  // Guard to prevent multiple rings in the same minute
  const lastRungMinuteRef = useRef<string>('');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('desaka_schools', JSON.stringify(availableSchools));
  }, [availableSchools]);

  useEffect(() => {
    localStorage.setItem('desaka_active_school_id', currentSchoolId);
  }, [currentSchoolId]);

  useEffect(() => {
    localStorage.setItem('desaka_user_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('desaka_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('desaka_auto_bell', JSON.stringify(isAutoBellEnabled));
  }, [isAutoBellEnabled]);

  useEffect(() => {
    localStorage.setItem('desaka_exam_mode', JSON.stringify(isExamMode));
  }, [isExamMode]);

  useEffect(() => {
    localStorage.setItem('desaka_bell_history', JSON.stringify(history.slice(0, 100)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('desaka_holidays', JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem('desaka_presets', JSON.stringify(announcerPresets));
  }, [announcerPresets]);

  useEffect(() => {
    try {
      if (customLogoUrl) {
        localStorage.setItem('desaka_custom_logo', customLogoUrl);
      } else {
        localStorage.removeItem('desaka_custom_logo');
        localStorage.removeItem('desaka_device_logo_info');
      }
    } catch (err) {
      console.warn('Gagal menyimpan logo ke localStorage perangkat:', err);
    }
  }, [customLogoUrl]);

  useEffect(() => {
    localStorage.setItem('desaka_theme', theme);
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('desaka_master_volume', masterVolume.toString());
    soundEngine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Set Theme helper
  const setTheme = (t: 'light' | 'dark' | 'system') => {
    setThemeState(t);
  };

  const setMasterVolume = (vol: number) => {
    setMasterVolumeState(vol);
  };

  // Toggle Exam Mode
  const setIsExamMode = (exam: boolean) => {
    setIsExamModeState(exam);
    if (exam) {
      // Merge or switch to exam schedule
      setSchedules(DEFAULT_EXAM_SCHEDULES);
    } else {
      setSchedules(DEFAULT_REGULAR_SCHEDULES);
    }
  };

  // Clock Ticker (runs every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format strings for clock
  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Check if today is a holiday
  const todayYMD = currentTime.toISOString().split('T')[0];
  const activeHoliday = holidays.find((h) => h.date === todayYMD);
  const isTodayHoliday = !!activeHoliday && activeHoliday.isBellDisabled;
  const todayHolidayName = activeHoliday ? activeHoliday.title : null;

  // Next Bell calculation & Auto Trigger logic
  useEffect(() => {
    const currentDay = currentTime.getDay(); // 0 = Minggu, 1 = Senin, ...
    const curHours = currentTime.getHours();
    const curMinutes = currentTime.getMinutes();
    const curSeconds = currentTime.getSeconds();
    const currentMinuteString = `${String(curHours).padStart(2, '0')}:${String(curMinutes).padStart(2, '0')}`;

    // Active eligible schedules for today
    const activeSchedules = schedules
      .filter((s) => s.enabled && s.days.includes(currentDay))
      .sort((a, b) => a.time.localeCompare(b.time));

    let upcoming: BellScheduleItem | null = null;
    let minSecondsDiff = Infinity;

    for (const item of activeSchedules) {
      if (item.id === skippedBellId) continue;

      const [hStr, mStr] = item.time.split(':');
      const itemH = parseInt(hStr, 10);
      const itemM = parseInt(mStr, 10);

      const itemTotalSec = itemH * 3600 + itemM * 60;
      const curTotalSec = curHours * 3600 + curMinutes * 60 + curSeconds;

      const diff = itemTotalSec - curTotalSec;
      if (diff > 0 && diff < minSecondsDiff) {
        minSecondsDiff = diff;
        upcoming = item;
      }
    }

    setNextBell(upcoming);
    setSecondsToNextBell(minSecondsDiff !== Infinity ? minSecondsDiff : null);

    // AUTO BELL TRIGGER CHECK
    if (isAutoBellEnabled && !isTodayHoliday && !isEmergencyActive) {
      // Check if current minute matches any scheduled bell
      const bellToRing = activeSchedules.find((s) => s.time === currentMinuteString);

      if (
        bellToRing &&
        bellToRing.id !== skippedBellId &&
        lastRungMinuteRef.current !== `${currentMinuteString}_${bellToRing.id}` &&
        curSeconds <= 2 // Trigger precisely at start of minute
      ) {
        lastRungMinuteRef.current = `${currentMinuteString}_${bellToRing.id}`;
        ringBellNow(bellToRing, 'otomatis');
      }
    }
  }, [currentTime, schedules, isAutoBellEnabled, isTodayHoliday, isEmergencyActive, skippedBellId]);

  // Ring Bell Action
  const ringBellNow = async (
    scheduleOrCustom?: Partial<BellScheduleItem>,
    triggerMode: 'otomatis' | 'manual' | 'ditunda' | 'dilewati' = 'manual'
  ) => {
    const itemToRing = scheduleOrCustom || nextBell || schedules[0];
    if (!itemToRing) return;

    try {
      // Play sound and announcement
      await soundEngine.playBellWithAnnouncement(
        itemToRing.sound || 'westminster',
        itemToRing.announcementText,
        { rate: 0.95 }
      );

      // Record to history
      const newHistoryItem: BellHistoryItem = {
        id: 'hist_' + Date.now(),
        timestamp: new Date().toISOString(),
        bellTitle: itemToRing.title || 'Bel Manual',
        type: itemToRing.type || 'custom',
        triggerMode,
        status: 'berhasil',
        note: `Suara: ${itemToRing.sound} • Ulang: ${itemToRing.repeatCount || 1}x`,
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
    } catch (err: any) {
      console.error('Failed to ring bell:', err);
      const failItem: BellHistoryItem = {
        id: 'hist_' + Date.now(),
        timestamp: new Date().toISOString(),
        bellTitle: itemToRing.title || 'Bel',
        type: itemToRing.type || 'custom',
        triggerMode,
        status: 'gagal',
        note: err.message || 'Audio error',
      };
      setHistory((prev) => [failItem, ...prev]);
    }
  };

  // Snooze next bell
  const snoozeNextBell = (minutes: number = 5) => {
    if (!nextBell) return;
    const snoozeDate = new Date(Date.now() + minutes * 60000);
    setSnoozedUntil(snoozeDate);

    // Record snooze to history
    setHistory((prev) => [
      {
        id: 'hist_' + Date.now(),
        timestamp: new Date().toISOString(),
        bellTitle: `${nextBell.title} (Ditunda ${minutes} menit)`,
        type: nextBell.type,
        triggerMode: 'ditunda',
        status: 'berhasil',
        note: `Ditunda oleh ${currentRole}`,
      },
      ...prev,
    ]);
  };

  // Skip next bell
  const skipNextBell = () => {
    if (!nextBell) return;
    setSkippedBellId(nextBell.id);
    setHistory((prev) => [
      {
        id: 'hist_' + Date.now(),
        timestamp: new Date().toISOString(),
        bellTitle: `${nextBell.title} (Dilewati)`,
        type: nextBell.type,
        triggerMode: 'dilewati',
        status: 'berhasil',
        note: `Dilewati oleh ${currentRole}`,
      },
      ...prev,
    ]);
  };

  // Emergency Mode triggers
  const triggerEmergency = async (reason: string) => {
    setIsEmergencyActive(true);
    soundEngine.playEmergencySiren(8);

    const announcement = `PERHATIAN PERHATIAN! Peringatan darurat evakuasi gedung sekolah. ${reason}. Seluruh siswa, guru, dan staf harap segera meninggalkan ruangan secara tertib melalui tangga evakuasi menuju titik kumpul lapangan terbuka. Jangan panik dan ikuti arahan petugas keselamatan!`;

    setTimeout(() => {
      soundEngine.speakText(announcement, { rate: 1.05, pitch: 1.1 });
    }, 4000);

    setHistory((prev) => [
      {
        id: 'hist_' + Date.now(),
        timestamp: new Date().toISOString(),
        bellTitle: 'SIRINE DARURAT EVAKUASI',
        type: 'darurat',
        triggerMode: 'manual',
        status: 'berhasil',
        note: `Alasan: ${reason} (Diaktifkan oleh ${currentRole})`,
      },
      ...prev,
    ]);
  };

  const cancelEmergency = () => {
    setIsEmergencyActive(false);
    soundEngine.stopAll();
    soundEngine.speakText('Situasi darurat telah dicabut dan dinyatakan aman. Terima kasih atas kerja sama seluruh warga sekolah.', { rate: 0.95 });
  };

  // Schedule CRUD Operations
  const addSchedule = (item: Omit<BellScheduleItem, 'id'>) => {
    const newItem: BellScheduleItem = {
      ...item,
      id: 'bel_' + Date.now(),
    };
    setSchedules((prev) => [...prev, newItem].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const updateSchedule = (id: string, item: Partial<BellScheduleItem>) => {
    setSchedules((prev) =>
      prev
        .map((s) => (s.id === id ? { ...s, ...item } : s))
        .sort((a, b) => a.time.localeCompare(b.time))
    );
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const duplicateSchedule = (id: string) => {
    const target = schedules.find((s) => s.id === id);
    if (!target) return;
    const duplicated: BellScheduleItem = {
      ...target,
      id: 'bel_' + Date.now(),
      title: `${target.title} (Salinan)`,
    };
    setSchedules((prev) => [...prev, duplicated].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const toggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const resetDefaultSchedules = () => {
    setSchedules(DEFAULT_REGULAR_SCHEDULES);
  };

  const copyDaySchedule = (fromDay: number, toDays: number[]) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.days.includes(fromDay)) {
          const combined = Array.from(new Set([...item.days, ...toDays]));
          return { ...item, days: combined };
        }
        return item;
      })
    );
  };

  // School Switching & Profile
  const switchSchool = (schoolId: string) => {
    const found = availableSchools.find((s) => s.id === schoolId);
    if (found) {
      setCurrentSchoolId(schoolId);
    }
  };

  const updateSchoolProfile = (profile: Partial<SchoolProfile>) => {
    setAvailableSchools((prev) =>
      prev.map((s) => (s.id === currentSchoolId ? { ...s, ...profile } : s))
    );
  };

  // Academic Holiday CRUD
  const addHoliday = (holiday: Omit<AcademicHoliday, 'id'>) => {
    const newH: AcademicHoliday = { ...holiday, id: 'h_' + Date.now() };
    setHolidays((prev) => [...prev, newH].sort((a, b) => a.date.localeCompare(b.date)));
  };

  const deleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  // Announcer Preset CRUD
  const saveAnnouncerPreset = (preset: Omit<AnnouncerPreset, 'id'>) => {
    const newPreset: AnnouncerPreset = { ...preset, id: 'pre_' + Date.now() };
    setAnnouncerPresets((prev) => [newPreset, ...prev]);
  };

  const deleteAnnouncerPreset = (id: string) => {
    setAnnouncerPresets((prev) => prev.filter((p) => p.id !== id));
  };

  // Clear History
  const clearHistory = () => {
    setHistory([]);
  };

  // Test Audio
  const testAudio = async () => {
    await soundEngine.testSpeakerOutput();
  };

  return (
    <AppContext.Provider
      value={{
        currentTime,
        formattedTime,
        formattedDate,
        timezone,
        setTimezone,
        currentSchool,
        availableSchools,
        switchSchool,
        updateSchoolProfile,
        currentRole,
        setCurrentRole,
        schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        duplicateSchedule,
        toggleSchedule,
        resetDefaultSchedules,
        copyDaySchedule,
        isAutoBellEnabled,
        setIsAutoBellEnabled,
        isExamMode,
        setIsExamMode,
        isEmergencyActive,
        triggerEmergency,
        cancelEmergency,
        nextBell,
        secondsToNextBell,
        ringBellNow,
        snoozeNextBell,
        skipNextBell,
        history,
        clearHistory,
        holidays,
        addHoliday,
        deleteHoliday,
        isTodayHoliday,
        todayHolidayName,
        announcerPresets,
        saveAnnouncerPreset,
        deleteAnnouncerPreset,
        customLogoUrl,
        setCustomLogoUrl,
        theme,
        setTheme,
        masterVolume,
        setMasterVolume,
        isAudioConnected,
        testAudio,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
