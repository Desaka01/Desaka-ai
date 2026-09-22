import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  Trash2,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Bell,
  Search,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { history, clearHistory, currentRole } = useApp();

  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredHistory = history.filter((item) => {
    const matchMode = filterMode === 'all' || item.triggerMode === filterMode;
    const matchSearch =
      item.bellTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchMode && matchSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Waktu', 'Nama Bel', 'Tipe', 'Mode Pemicu', 'Status', 'Catatan'];
    const rows = history.map((h) => [
      `"${new Date(h.timestamp).toLocaleString('id-ID')}"`,
      `"${h.bellTitle}"`,
      `"${h.type}"`,
      `"${h.triggerMode}"`,
      `"${h.status}"`,
      `"${h.note || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `desaka_riwayat_bel_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Riwayat Bel & Audit Log Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Catatan kronologis seluruh aktivitas bel sekolah (otomatis, manual, penundaan, dan status).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            title="Ekspor Riwayat ke Format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          {(currentRole === 'super_admin' || currentRole === 'admin_sekolah') && (
            <button
              onClick={() => {
                if (confirm('Yakin ingin mengosongkan seluruh riwayat log bel?')) {
                  clearHistory();
                }
              }}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter Mode:</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'otomatis', label: 'Otomatis' },
              { id: 'manual', label: 'Manual' },
              { id: 'ditunda', label: 'Ditunda' },
              { id: 'dilewati', label: 'Dilewati' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterMode === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari riwayat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-44">Waktu Eksekusi</th>
                <th className="py-3.5 px-4">Nama Bel / Kejadian</th>
                <th className="py-3.5 px-4 w-28">Mode Pemicu</th>
                <th className="py-3.5 px-4 w-28">Status</th>
                <th className="py-3.5 px-4">Keterangan Teknis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-600 dark:text-slate-300">
                    {new Date(item.timestamp).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })} WIB
                  </td>

                  {/* Title & Type */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {item.bellTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      Tipe: {item.type.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Trigger Mode */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        item.triggerMode === 'otomatis'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : item.triggerMode === 'manual'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.triggerMode}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {item.status === 'berhasil' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Gagal
                      </span>
                    )}
                  </td>

                  {/* Note */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    {item.note || '-'}
                  </td>

                </tr>
              ))}

              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Tidak ada data riwayat yang cocok.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
