import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DesakaLogo } from './DesakaLogo';
import { DeviceLogoModal } from './DeviceLogoModal';
import { SchoolProfile } from '../types';
import {
  processDeviceImage,
  saveLogoToDeviceStorage,
  removeLogoFromDeviceStorage,
  getDeviceLogoInfo,
  DeviceLogoInfo,
} from '../services/deviceLogoStorage';
import {
  Settings,
  Image,
  Upload,
  RotateCcw,
  Volume2,
  Building,
  Shield,
  Download,
  Database,
  CheckCircle,
  HelpCircle,
  Save,
  Check,
  Globe,
  HardDrive,
  Laptop,
  Sparkles,
  School,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentSchool,
    availableSchools,
    switchSchool,
    updateSchoolProfile,
    customLogoUrl,
    setCustomLogoUrl,
    masterVolume,
    setMasterVolume,
    testAudio,
    isAutoBellEnabled,
    setIsAutoBellEnabled,
    isExamMode,
    setIsExamMode,
    timezone,
    setTimezone,
    theme,
    setTheme,
    resetDefaultSchedules,
  } = useApp();

  const [schoolForm, setSchoolForm] = useState<Partial<SchoolProfile>>({
    name: currentSchool.name,
    code: currentSchool.code,
    address: currentSchool.address,
    city: currentSchool.city,
    level: currentSchool.level,
    principalName: currentSchool.principalName,
    operatorName: currentSchool.operatorName,
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState<boolean>(false);
  const [deviceLogoInfo, setDeviceLogoInfo] = useState<DeviceLogoInfo | null>(() => getDeviceLogoInfo());
  const [logoUploadNotice, setLogoUploadNotice] = useState<string | null>(null);

  // Sync form when currentSchool changes
  useEffect(() => {
    setSchoolForm({
      name: currentSchool.name,
      code: currentSchool.code,
      address: currentSchool.address,
      city: currentSchool.city,
      level: currentSchool.level,
      principalName: currentSchool.principalName,
      operatorName: currentSchool.operatorName,
    });
  }, [currentSchool]);

  // Direct fast logo upload handler from device storage
  const handleDirectLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLogoUploadNotice('Mengompres dan memproses logo dari perangkat...');
      const { dataUrl, info } = await processDeviceImage(file, 512, 0.92);
      const saved = saveLogoToDeviceStorage(dataUrl, info);
      if (saved) {
        setCustomLogoUrl(dataUrl);
        setDeviceLogoInfo(info);
        setLogoUploadNotice(`Logo berhasil diperbarui dari perangkat (${info.fileSizeKb} KB)!`);
        setTimeout(() => setLogoUploadNotice(null), 3500);
      }
    } catch (err: any) {
      console.error(err);
      setLogoUploadNotice(`Gagal: ${err.message || 'Format tidak didukung'}`);
      setTimeout(() => setLogoUploadNotice(null), 3500);
    }
  };

  const handleResetLogo = () => {
    removeLogoFromDeviceStorage();
    setCustomLogoUrl(null);
    setDeviceLogoInfo(null);
    setLogoUploadNotice('Logo telah dikembalikan ke lambang resmi SD Negeri 1 Kalisoro.');
    setTimeout(() => setLogoUploadNotice(null), 3000);
  };

  const handleSetSDN1Kalisoro = () => {
    const sdn1 = {
      name: 'SD Negeri 1 Kalisoro',
      code: 'NPSN: 20312078',
      address: 'Jl. Sekrincing, Kalisoro, Kec. Tawangmangu',
      city: 'Kabupaten Karanganyar, Jawa Tengah',
      level: 'SD' as const,
      principalName: 'Sri Mulyani, S.Pd., M.Pd.',
      operatorName: 'Operator Bel SDN 1 Kalisoro',
    };
    setSchoolForm(sdn1);
    updateSchoolProfile(sdn1);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(schoolForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Full backup
  const handleFullBackup = () => {
    const fullData = {
      backupDate: new Date().toISOString(),
      school: currentSchool,
      customLogoPresent: !!customLogoUrl,
      deviceLogoInfo,
      schedules: localStorage.getItem('desaka_schedules'),
      holidays: localStorage.getItem('desaka_holidays'),
      presets: localStorage.getItem('desaka_presets'),
      history: localStorage.getItem('desaka_bell_history'),
      autoBell: isAutoBellEnabled,
      examMode: isExamMode,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `desaka_sdn1kalisoro_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {currentSchool.name}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              NPSN: 20312078
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-1.5">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Pengaturan Sistem & Kustomisasi Identitas Perangkat
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sesuaikan logo sekolah dari penyimpanan perangkat masing-masing, profil SD Negeri 1 Kalisoro, volume bel, dan pencadangan data.
          </p>
        </div>

        <button
          onClick={handleFullBackup}
          className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Database className="w-4 h-4" />
          <span>Cadangkan Data Sekolah</span>
        </button>
      </div>

      {/* SECTION 1: Identitas Visual & Logo Storage Perangkat */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Image className="w-4 h-4 text-amber-500" />
              Logo Sekolah dari Penyimpanan Perangkat (Device Storage)
            </h3>
            <p className="text-xs text-slate-500">
              Setiap perangkat (komputer operator, HP guru piket, laptop TU) dapat memilih dan menyimpan logo sekolah secara mandiri dari galeri/memori perangkat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLogoModalOpen(true)}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Kelola Logo Perangkat</span>
            </button>

            <label className="text-xs font-bold px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih Cepat File</span>
              <input type="file" accept="image/*" onChange={handleDirectLogoUpload} className="hidden" />
            </label>

            {customLogoUrl && (
              <button
                onClick={handleResetLogo}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1"
                title="Kembali ke lambang resmi bawaan SD Negeri 1 Kalisoro"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Bawaan</span>
              </button>
            )}
          </div>
        </div>

        {/* Notice alert */}
        {logoUploadNotice && (
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            <span>{logoUploadNotice}</span>
          </div>
        )}

        {/* Device Storage Status Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Penyimpanan Lokal: {customLogoUrl ? 'Logo Kustom Tersimpan di Perangkat Ini' : 'Menggunakan Lambang Bawaan SDN 1 Kalisoro'}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {deviceLogoInfo
                  ? `File: ${deviceLogoInfo.fileName} (${deviceLogoInfo.fileSizeKb} KB) • Disimpan pada ${deviceLogoInfo.updatedAt}`
                  : 'Belum ada file kustom yang dipilih. Lambang vektor resmi SD Negeri 1 Kalisoro sedang aktif.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tersimpan di Perangkat Ini
            </span>
          </div>
        </div>

        {/* 4 Logo Variations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Variation 1: Logo Utama */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              1. Logo Utama (Full)
            </span>
            <div className="py-4 flex items-center justify-center">
              <DesakaLogo
                variant="main"
                size="md"
                customLogoUrl={customLogoUrl}
                schoolName={currentSchool.name}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Digunakan untuk banner promosi, cetak resmi, & halaman sambutan
            </p>
          </div>

          {/* Variation 2: Ikon Aplikasi */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              2. Ikon Lambang Aplikasi
            </span>
            <div className="py-4 flex items-center justify-center">
              <DesakaLogo
                variant="icon"
                size="xl"
                customLogoUrl={customLogoUrl}
                schoolName={currentSchool.name}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Ukuran ringkas untuk app icon layar beranda & favicon browser
            </p>
          </div>

          {/* Variation 3: Logo Horizontal */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              3. Logo Horizontal
            </span>
            <div className="py-4 flex items-center justify-center">
              <DesakaLogo
                variant="horizontal"
                size="md"
                customLogoUrl={customLogoUrl}
                schoolName={currentSchool.name}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Optimal untuk bilah navigasi (Navbar) atas di komputer & HP
            </p>
          </div>

          {/* Variation 4: Dark & Light Version */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col justify-between space-y-3 text-white">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              4. Versi Mode Gelap (Dark)
            </span>
            <div className="py-4 flex items-center justify-center">
              <DesakaLogo
                variant="dark"
                size="md"
                customLogoUrl={customLogoUrl}
                schoolName={currentSchool.name}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Warna kontras tinggi untuk tampilan malam di ruang operator
            </p>
          </div>

        </div>
      </div>

      {/* SECTION 2: Profil Sekolah (SD Negeri 1 Kalisoro) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              Profil Sekolah: {currentSchool.name}
            </h3>
            <p className="text-xs text-slate-500">
              Kelola data nama sekolah, NPSN, alamat, kepala sekolah, dan operator bel.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetSDN1Kalisoro}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-1.5"
            >
              <School className="w-3.5 h-3.5" />
              <span>Set Default: SD Negeri 1 Kalisoro</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveSchool} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nama Lengkap Sekolah:
            </label>
            <input
              type="text"
              required
              value={schoolForm.name}
              onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Kode / NPSN Sekolah:
            </label>
            <input
              type="text"
              required
              value={schoolForm.code}
              onChange={(e) => setSchoolForm({ ...schoolForm, code: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Jenjang Pendidikan:
            </label>
            <select
              value={schoolForm.level}
              onChange={(e) => setSchoolForm({ ...schoolForm, level: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            >
              <option value="SD">SD (Sekolah Dasar)</option>
              <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
              <option value="SMA">SMA (Sekolah Menengah Atas)</option>
              <option value="SMK">SMK (Sekolah Menengah Kejuruan)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Alamat Jalan & Desa/Kelurahan:
            </label>
            <input
              type="text"
              required
              value={schoolForm.address}
              onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Kota / Kabupaten & Provinsi:
            </label>
            <input
              type="text"
              required
              value={schoolForm.city}
              onChange={(e) => setSchoolForm({ ...schoolForm, city: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nama Kepala Sekolah:
            </label>
            <input
              type="text"
              required
              value={schoolForm.principalName}
              onChange={(e) => setSchoolForm({ ...schoolForm, principalName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nama Petugas / Operator Bel:
            </label>
            <input
              type="text"
              required
              value={schoolForm.operatorName}
              onChange={(e) => setSchoolForm({ ...schoolForm, operatorName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-2 flex items-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil Sekolah</span>
            </button>

            {savedSuccess && (
              <span className="ml-3 text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Tersimpan!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* SECTION 3: Pengaturan Audio & Bel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-500" />
            Pengaturan Master Suara & Output Speaker Sekolah
          </h3>
          <p className="text-xs text-slate-500">
            Pastikan volume bel terdengar jelas di seluruh area kelas, lapangan, dan kantor guru.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">Master Volume Bel & Pengumuman:</span>
              <span className="font-mono font-black text-blue-600 text-sm">{masterVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Hening)</span>
              <span>50% (Sedang)</span>
              <span>100% (Maksimal)</span>
            </div>
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <button
              onClick={testAudio}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>Uji Coba Suara Speaker Sekarang (Sound Test)</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Memainkan 4 nada Westminster Chime via Web Audio API browser.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: Tampilan & Zona Waktu */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-500" />
            Tema Tampilan & Sinkronisasi Waktu
          </h3>
          <p className="text-xs text-slate-500">
            Sesuaikan mode warna dan zona waktu acuan bel otomatis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Pilihan Tema Aplikasi:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`py-2 rounded-xl font-bold capitalize transition-all border ${
                    theme === t
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {t === 'light' ? 'Terang' : t === 'dark' ? 'Gelap' : 'Sistem'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Zona Waktu Sekolah:
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            >
              <option value="Asia/Jakarta">WIB (Waktu Indonesia Barat) — Jawa Tengah / Karanganyar</option>
              <option value="Asia/Makassar">WITA (Waktu Indonesia Tengah)</option>
              <option value="Asia/Jayapura">WIT (Waktu Indonesia Timur)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Device Logo Modal */}
      <DeviceLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => {
          setIsLogoModalOpen(false);
          setDeviceLogoInfo(getDeviceLogoInfo());
        }}
      />
    </div>
  );
};
