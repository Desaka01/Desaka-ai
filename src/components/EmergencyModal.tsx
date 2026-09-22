import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ShieldAlert, X, Volume2, CheckCircle2 } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { isEmergencyActive, triggerEmergency, cancelEmergency, currentRole } = useApp();
  const [selectedReason, setSelectedReason] = useState<string>('Simulasi Evakuasi & Keselamatan Gedung');
  const [customReason, setCustomReason] = useState<string>('');
  const [confirmed, setConfirmed] = useState<boolean>(false);

  if (!isOpen) return null;

  const reasons = [
    'Simulasi Evakuasi & Keselamatan Gedung',
    'Peringatan Bencana Gempa Bumi',
    'Bahaya Kebakaran di Lingkungan Sekolah',
    'Cuaca Ekstrem / Banjir Bandang',
    'Keadaan Darurat Keamanan Khusus',
  ];

  const handleActivate = () => {
    const finalReason = customReason.trim() ? customReason : selectedReason;
    triggerEmergency(finalReason);
    setConfirmed(false);
  };

  const handleDeactivate = () => {
    cancelEmergency();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-red-200 dark:border-red-900/60 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xs">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">MODE DARURAT & SIRINE EVAKUASI</h3>
              <p className="text-xs text-red-100 font-medium">Protokol Keselamatan Resmi DESAKA AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isEmergencyActive ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center border-4 border-red-500 animate-ping">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h4 className="text-xl font-black text-red-600 dark:text-red-400">
                  SIRINE DARURAT SEDANG AKTIF!
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto">
                  Sirine dan pengumuman evakuasi suara sedang disiarkan melalui seluruh speaker sekolah.
                </p>
              </div>

              <button
                onClick={handleDeactivate}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                HENTIKAN SIRINE & NYATAKAN SITUASI AMAN
              </button>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Peringatan Otoritas:</strong> Membunyikan sirine darurat akan langsung membunyikan nada alarm kencang dan menyiarkan suara AI instruksi evakuasi ke speaker sekolah. Pastikan Anda memiliki izin ({currentRole}).
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pilih Kategori Situasi Darurat:
                </label>
                <div className="space-y-1.5">
                  {reasons.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setSelectedReason(r);
                        setCustomReason('');
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all border ${
                        selectedReason === r && !customReason
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 ring-2 ring-red-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      • {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Atau tuliskan keterangan khusus:
                </label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Misal: Evakuasi gedung sayap timur..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                />
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Saya mengonfirmasi untuk membunyikan sirine darurat sekolah sekarang
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!confirmed}
                  onClick={handleActivate}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4" />
                  BUNYIKAN SIRINE SEKARANG
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
