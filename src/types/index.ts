export type BellType = 
  | 'masuk'
  | 'pergantian'
  | 'istirahat'
  | 'masuk_istirahat'
  | 'persiapan_ujian'
  | 'ujian_mulai'
  | 'ujian_selesai'
  | 'pulang'
  | 'upacara'
  | 'darurat'
  | 'custom';

export type BellSound = 
  | 'westminster'
  | 'electric'
  | 'soft_chime'
  | 'digital_marimba'
  | 'exam_alert'
  | 'siren';

export interface BellScheduleItem {
  id: string;
  time: string; // HH:mm format, e.g. "07:00"
  days: number[]; // 0=Minggu, 1=Senin, ..., 6=Sabtu
  title: string;
  type: BellType;
  sound: BellSound;
  announcementText: string;
  enabled: boolean;
  targetGroup: string; // e.g. "Semua Kelas", "Kelas 7-9", "Peserta Ujian"
  repeatCount: number; // 1, 2, 3
  volume: number; // 0 - 100
  category: 'reguler' | 'ujian' | 'khusus';
}

export type UserRole = 'super_admin' | 'admin_sekolah' | 'guru' | 'siswa';

export interface SchoolProfile {
  id: string;
  name: string;
  code: string; // e.g. "SMPN 01 Kalitidu"
  address: string;
  level: 'SD' | 'SMP' | 'SMA' | 'SMK' | 'Madrasah';
  city: string;
  principalName: string;
  operatorName: string;
}

export interface BellHistoryItem {
  id: string;
  timestamp: string; // ISO string
  bellTitle: string;
  type: BellType;
  triggerMode: 'otomatis' | 'manual' | 'ditunda' | 'dilewati';
  status: 'berhasil' | 'gagal';
  note?: string;
}

export interface AcademicHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'libur_nasional' | 'libur_sekolah' | 'libur_semester' | 'ujian' | 'kegiatan';
  description?: string;
  isBellDisabled: boolean;
}

export interface GuruModule {
  id: string;
  title: string;
  subject: string;
  grade: string;
  mode: string;
  content: string;
  createdAt: string;
}

export interface AnnouncerPreset {
  id: string;
  title: string;
  context: string;
  text: string;
  language: 'id' | 'jv' | 'en';
  tone: 'formal' | 'ramah' | 'ceria' | 'tegas' | 'edukatif';
  targetGroup: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isDemo?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
