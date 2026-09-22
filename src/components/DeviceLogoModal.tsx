import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  processDeviceImage,
  saveLogoToDeviceStorage,
  removeLogoFromDeviceStorage,
  getDeviceLogoInfo,
  downloadLogoToDevice,
  DeviceLogoInfo,
} from '../services/deviceLogoStorage';
import { DesakaLogo } from './DesakaLogo';
import {
  Upload,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Download,
  X,
  Sparkles,
  Image as ImageIcon,
  Smartphone,
  Laptop,
  Check,
} from 'lucide-react';

interface DeviceLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceLogoModal: React.FC<DeviceLogoModalProps> = ({ isOpen, onClose }) => {
  const { customLogoUrl, setCustomLogoUrl, currentSchool } = useApp();

  const [deviceLogoInfo, setDeviceLogoInfo] = useState<DeviceLogoInfo | null>(() => getDeviceLogoInfo());
  const [selectedShape, setSelectedShape] = useState<'rounded' | 'circle' | 'original'>('rounded');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Process image: resize to optimal 512px and compress
      const { dataUrl, info } = await processDeviceImage(file, 512, 0.92);

      // Save to localStorage of this specific device
      const saved = saveLogoToDeviceStorage(dataUrl, info);
      if (saved) {
        setCustomLogoUrl(dataUrl);
        setDeviceLogoInfo(info);
        setSuccessMessage(`Logo berhasil diperbarui dari penyimpanan perangkat (${file.name})!`);
      } else {
        throw new Error('Kapasitas penyimpanan browser penuh.');
      }
    } catch (err: any) {
      console.error('Error handling device image:', err);
      setErrorMessage(err.message || 'Gagal memproses gambar dari penyimpanan perangkat.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = () => {
    removeLogoFromDeviceStorage();
    setCustomLogoUrl(null);
    setDeviceLogoInfo(null);
    setSuccessMessage('Logo telah dikembalikan ke logo resmi bawaan SD Negeri 1 Kalisoro.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDownload = () => {
    if (customLogoUrl) {
      downloadLogoToDevice(customLogoUrl, `logo-${currentSchool.name.toLowerCase().replace(/\s+/g, '-')}.png`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Ganti Logo dari Penyimpanan Perangkat
              </h3>
              <p className="text-xs text-slate-500">
                Pilih file logo/lambang dari galeri atau memori perangkat ini untuk {currentSchool.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Notification Alerts */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-3xl p-6 text-center transition-all bg-slate-50/50 dark:bg-slate-800/30">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
              id="device-logo-file-input"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                <Upload className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  {isProcessing ? 'Mengoptimalkan Logo...' : 'Pilih File Logo dari Penyimpanan Perangkat'}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto text-[11px]">
                  Mendukung format PNG, JPG, JPEG, WEBP, atau SVG dari Galeri HP, Tablet, Laptop, atau Komputer Sekolah.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <label
                  htmlFor="device-logo-file-input"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Buka File Perangkat</span>
                </label>

                {customLogoUrl && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-1.5"
                    title="Kembalikan ke Lambang Bawaan SDN 1 Kalisoro"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset ke Bawaan</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Storage Details Info */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
              <Laptop className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <span>Penyimpanan Lokal Perangkat (Device Local Storage)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">
                  {customLogoUrl ? 'Logo Kustom Aktif' : 'Logo Bawaan Aktif'}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Logo disimpan langsung di memori lokal browser/perangkat ini. Setiap perangkat (misal HP guru piket, laptop operator, komputer kantor) dapat memiliki logo sekolah yang sama ataupun berbeda sesuai kebutuhan tanpa memerlukan server eksternal.
              </p>
              {deviceLogoInfo && (
                <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>File: <strong className="text-slate-700 dark:text-slate-300">{deviceLogoInfo.fileName}</strong></span>
                  <span>Ukuran: <strong className="text-slate-700 dark:text-slate-300">{deviceLogoInfo.fileSizeKb} KB</strong></span>
                  <span>Diperbarui: <strong className="text-slate-700 dark:text-slate-300">{deviceLogoInfo.updatedAt}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Shape selector */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Bentuk Bingkai Logo:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rounded', label: 'Kotak Membulat' },
                { id: 'circle', label: 'Lingkaran (Bulat)' },
                { id: 'original', label: 'Asli / Persegi' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedShape(s.id as any)}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                    selectedShape === s.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Realtime Previews in 3 Contexts */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200">
              Pratinjau Tampilan Logo di Berbagai Tempat:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Preview 1: Header Navbar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  1. Bilah Navigasi Atas (Header Navbar)
                </span>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center">
                  <DesakaLogo
                    variant="horizontal"
                    size="md"
                    customLogoUrl={customLogoUrl}
                    schoolName={currentSchool.name}
                    shape={selectedShape}
                  />
                </div>
              </div>

              {/* Preview 2: App Icon */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  2. Ikon Aplikasi / Favicon
                </span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3">
                  <DesakaLogo
                    variant="icon"
                    size="lg"
                    customLogoUrl={customLogoUrl}
                    shape={selectedShape}
                  />
                  <div className="text-left">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{currentSchool.name}</p>
                    <p className="text-[10px] text-slate-400">Tampilan Ikon Layar Utama</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview 3: Official Kop Surat Print Preview */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                3. Kop Surat Cetak Jadwal Resmi
              </span>
              <div className="p-3 bg-white text-slate-900 rounded-xl border border-slate-300 shadow-xs flex items-center gap-3">
                <DesakaLogo
                  variant="icon"
                  size="md"
                  customLogoUrl={customLogoUrl}
                  shape={selectedShape}
                />
                <div className="leading-tight text-center flex-1">
                  <p className="text-[10px] font-semibold text-slate-600 uppercase">
                    PEMERINTAH KABUPATEN KARANGANYAR • DINAS PENDIDIKAN
                  </p>
                  <p className="text-xs font-black uppercase text-slate-900">
                    {currentSchool.name}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    {currentSchool.address}, {currentSchool.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-between gap-3">
          {customLogoUrl ? (
            <button
              type="button"
              onClick={handleDownload}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File Logo</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">
              Menggunakan lambang resmi {currentSchool.name}
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Selesai</span>
          </button>
        </div>

      </div>
    </div>
  );
};
