import React from 'react';
import {
  HelpCircle,
  Volume2,
  Smartphone,
  Shield,
  Radio,
  FileQuestion,
  Headphones,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const HelpView: React.FC = () => {
  const faqs = [
    {
      q: 'Bagaimana cara menghubungkan aplikasi DESAKA AI ke sistem sound speaker sekolah?',
      a: 'Anda dapat menghubungkan perangkat komputer/laptop/tablet operator ke amplifier sentral sekolah menggunakan: (1) Kabel Audio AUX jack 3.5mm ke RCA amplifier, atau (2) Bluetooth Audio Receiver jika amplifier mendukung wireless audio. Pastikan volume amplifier telah diatur pada tingkat yang aman dan tidak terdistorsi.',
    },
    {
      q: 'Apakah bel otomatis tetap berbunyi jika laptop operator dalam kondisi sleep / terkunci?',
      a: 'Sistem bel berjalan pada browser modern berbasis background Web Audio API. Agar dering bel tidak terhenti, atur pengaturan daya laptop/PC operator ke mode "Never Sleep" (Jangan Pernah Tidur) saat jam operasional sekolah sedang berlangsung.',
    },
    {
      q: 'Bagaimana cara mengaktifkan Mode Ujian?',
      a: 'Buka menu Jadwal Bel atau klik tombol "Mode Ujian" di Dashboard. Sistem akan beralih ke nada dering khusus ujian yang lebih hening dengan pengumuman instruksi pengawasan serta peringatan 10 menit sisa waktu.',
    },
    {
      q: 'Apakah pengumuman suara AI memerlukan koneksi internet?',
      a: 'DESAKA AI dirancang secara hybrid: Pembuatan naskah cerdas baru memanfaatkan model AI server-side, sementara pembacaan suara Text-to-Speech (TTS) dan dering nada bel (Westminster chime, lonceng listrik) dapat bekerja secara instan bahkan tanpa koneksi internet (Mode Offline).',
    },
    {
      q: 'Bagaimana cara memasang aplikasi ini di Android atau tablet sekolah?',
      a: 'Buka aplikasi di browser Chrome Android, klik menu titik tiga di kanan atas browser, lalu pilih "Tambahkan ke Layar Utama" (Install App). DESAKA AI akan terpasang sebagai aplikasi mandiri (PWA) berlayar penuh.',
    },
  ];

  const rolesGuide = [
    {
      role: 'Super Admin',
      badge: 'SA',
      color: 'bg-purple-600',
      desc: 'Memiliki kontrol menyeluruh: mengunggah logo resmi, menambah dan mengganti profil instansi multi-sekolah, mereset database, dan mengelola hak akses.',
    },
    {
      role: 'Admin Sekolah (Operator)',
      badge: 'AD',
      color: 'bg-blue-600',
      desc: 'Mengelola jadwal bel sekolah harian dan ujian, menjadwalkan hari libur kalender akademik, menyiarkan pengumuman suara, dan mencadangkan data.',
    },
    {
      role: 'Bapak / Ibu Guru',
      badge: 'GU',
      color: 'bg-emerald-600',
      desc: 'Dapat memanfaatkan Guru Virtual AI untuk membuat modul ajar Kurikulum Merdeka, bank soal kuis, serta melihat jadwal pelajaran.',
    },
    {
      role: 'Siswa / Murid',
      badge: 'SI',
      color: 'bg-amber-600',
      desc: 'Melihat jadwal harian sekolah, mengakses tutor materi edukatif Guru AI, dan bertanya pada CS Pintar seputar kegiatan sekolah.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Pusat Bantuan & Panduan Teknis DESAKA AI
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Panduan integrasi hardware speaker, instalasi perangkat operator, dan tanya jawab operasional.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hardware & Speaker Setup Guide */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-600" />
            Panduan Menghubungkan ke Speaker Sekolah
          </h3>

          <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 space-y-1.5">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-blue-600" />
                1. Koneksi Kabel AUX 3.5mm (Paling Direkomendasikan)
              </h4>
              <p className="text-[11px] text-blue-800 dark:text-blue-300">
                Colokkan kabel jack 3.5mm dari port headphone laptop/PC operator ke soket INPUT AUX (RCA merah-putih) pada Power Amplifier speaker sentral sekolah.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-purple-600" />
                2. Koneksi Nirkabel Bluetooth
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gunakan Bluetooth Audio Receiver pada amplifier jika jarak ruang operator dengan sound system memerlukan koneksi nirkabel tanpa kabel panjang.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                3. Pemasangan Aplikasi PWA di Tablet / Android
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Aplikasi ini mendukung PWA (Progressive Web App). Buka melalui Google Chrome, lalu pilih menu "Install DESAKA AI" untuk penggunaan offline praktis.
              </p>
            </div>
          </div>
        </div>

        {/* Roles & Access Guide */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            Struktur Peran Pengguna (Hak Akses)
          </h3>

          <div className="space-y-3">
            {rolesGuide.map((rg) => (
              <div
                key={rg.role}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3"
              >
                <span className={`w-8 h-8 rounded-xl ${rg.color} text-white font-black text-xs flex items-center justify-center shrink-0`}>
                  {rg.badge}
                </span>
                <div className="text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {rg.role}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {rg.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FAQ Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-amber-500" />
          Pertanyaan yang Sering Diajukan (FAQ)
        </h3>

        <div className="space-y-3">
          {faqs.map((f, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
            >
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-start gap-2">
                <span className="text-blue-600 font-black">Q:</span>
                <span>{f.q}</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-5 leading-relaxed">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
