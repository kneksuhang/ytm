/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Pengaturan Terbagi (SettingsPage)
 * Memisahkan pengaturan ke dalam sub-halaman terpisah sesuai instruksi:
 * 1. Sub-halaman Akun (Login/Logout, Profile Pengguna)
 * 2. Sub-halaman Tampilan (Tema Gelap/Terang tersimpan ke localStorage)
 * 3. Sub-halaman Manajemen Data (Export JSON/CSV, Import JSON, Reset Data)
 * 4. Sub-halaman Skema SQL Supabase (Viewer Kode DDL Lengkap dengan tombol Salin)
 */

import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useYtmStore } from '../../store/useYtmStore';
import {
  Settings,
  User,
  Palette,
  Database,
  Code2,
  Download,
  Upload,
  Trash2,
  Copy,
  Check,
  Sun,
  Moon,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import type { RoutePath } from '../../types';

interface SettingsPageProps {
  navigate: (route: RoutePath) => void;
}

type SettingsTab = 'account' | 'appearance' | 'data' | 'sql-schema';

export const SettingsPage: React.FC<SettingsPageProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [copiedSql, setCopiedSql] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const { user, signOut } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { exportDataAsJson, importJsonData, resetAllData, channels, videos, playlists, categories } = useYtmStore();

  const tabs = [
    { id: 'account', label: 'Akun & Profil', icon: User },
    { id: 'appearance', label: 'Tampilan & Tema', icon: Palette },
    { id: 'data', label: 'Manajemen Data', icon: Database },
    { id: 'sql-schema', label: 'Skema SQL Supabase', icon: Code2 },
  ];

  // Ekspor JSON
  const handleExportJson = () => {
    const jsonStr = exportDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ytm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Ekspor CSV Sederhana untuk Video
  const handleExportCsv = () => {
    const headers = ['ID', 'Judul', 'Status', 'Rating', 'Channel', 'Playlist', 'Durasi_Detik', 'Timestamp_Detik', 'Link'];
    const rows = videos.map((v) => [
      v.id,
      `"${v.title.replace(/"/g, '""')}"`,
      v.status,
      v.rating,
      `"${(v.channelName || '').replace(/"/g, '""')}"`,
      `"${(v.playlistName || '').replace(/"/g, '""')}"`,
      v.durationSeconds,
      v.timestampSeconds,
      v.link,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ytm-videos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Impor File JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importJsonData(content);
      if (success) {
        setImportStatus('Data berhasil diimpor!');
      } else {
        setImportStatus('Gagal mengimpor file. Format JSON tidak sesuai.');
      }
    };
    reader.readAsText(file);
  };

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetData = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetAllData();
    setConfirmReset(false);
    setResetMessage('Semua data lokal telah berhasil dibersihkan.');
    setTimeout(() => setResetMessage(null), 4000);
  };

  const sqlSchemaCode = `-- SKRIP DDL POSTGRESQL UNTUK SUPABASE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  categories TEXT[] DEFAULT '{}',
  rating INTEGER DEFAULT 0,
  link TEXT,
  tag TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT 'solar:folder-with-files-bold',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  tags TEXT[] DEFAULT '{}',
  is_archived BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'To Watch',
  tags TEXT[] DEFAULT '{}',
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  channel_name TEXT,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE SET NULL,
  playlist_name TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  rating INTEGER DEFAULT 0,
  link TEXT NOT NULL,
  youtube_id TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  timestamp_seconds INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Header Halaman Pengaturan */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#ff0000]/15 text-[#ff0000] flex items-center justify-center">
          <Settings size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Pengaturan Aplikasi</h2>
          <p className="text-[11px] text-neutral-400">
            Kelola preferensi akun, tampilan tema, pencadangan data, dan konfigurasi Supabase.
          </p>
        </div>
      </div>

      {/* Navigasi Sub-Halaman Pengaturan (Tabs Terpisah) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#181818] rounded-xl border border-neutral-800 text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-[#ff0000] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Konten Sub-Halaman 1: Akun & Profil */}
      {activeTab === 'account' && (
        <div className="p-5 rounded-2xl bg-[#181818] border border-neutral-800 space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Informasi Akun Supabase</h3>
            <p className="text-[11px] text-neutral-400">
              Pengaturan sesi autentikasi pengguna YTM.
            </p>
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <div className="w-12 h-12 rounded-full bg-[#ff0000]/15 text-[#ff0000] flex items-center justify-center font-bold text-base uppercase border border-[#ff0000]/30">
                  {user.displayName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{user.displayName}</h4>
                  <p className="text-neutral-400 text-[11px]">{user.email}</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">● Terhubung dengan Supabase Auth</p>
                </div>
              </div>

              <button
                type="button"
                onClick={signOut}
                className="px-4 py-2 rounded-xl bg-red-950/80 border border-red-800 text-red-300 hover:bg-red-900 flex items-center gap-2 transition-colors"
              >
                <LogOut size={14} />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-neutral-900 rounded-xl border border-neutral-800">
              <p className="text-neutral-300">
                Anda saat ini menggunakan <strong>Mode Lokal</strong>. Data tersimpan di penyimpanan peramban (localStorage).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="px-4 py-2 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white font-medium transition-colors"
                >
                  Masuk / Daftar Akun
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Konten Sub-Halaman 2: Tampilan & Tema */}
      {activeTab === 'appearance' && (
        <div className="p-5 rounded-2xl bg-[#181818] border border-neutral-800 space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Preferensi Tampilan & Tema</h3>
            <p className="text-[11px] text-neutral-400">
              Pilih antara tema gelap (khas YouTube Studio) atau tema terang. Disimpan ke localStorage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'border-[#ff0000] bg-[#ff0000]/10 text-white'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-white">
                <Moon size={16} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Tema Gelap (Default)</p>
                <p className="text-[10px] text-neutral-400">Kenyamanan mata ala YouTube</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                theme === 'light'
                  ? 'border-[#ff0000] bg-[#ff0000]/10 text-white'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400">
                <Sun size={16} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Tema Terang</p>
                <p className="text-[10px] text-neutral-400">Tampilan bersih cerah</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Konten Sub-Halaman 3: Manajemen Data (Export, Import, Reset) */}
      {activeTab === 'data' && (
        <div className="p-5 rounded-2xl bg-[#181818] border border-neutral-800 space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Pencadangan & Pemulihan Data</h3>
            <p className="text-[11px] text-neutral-400">
              Ekspor seluruh saluran, kategori, video, dan playlist atau impor file JSON cadangan.
            </p>
          </div>

          {importStatus && (
            <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200">
              {importStatus}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ekspor Data */}
            <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-1.5">
                <Download size={14} className="text-[#ff0000]" />
                <span>Ekspor Cadangan Data</span>
              </h4>
              <p className="text-[11px] text-neutral-400">
                Unduh file data lengkap ({channels.length} saluran, {videos.length} video, {playlists.length} playlist).
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium"
                >
                  Ekspor JSON
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium"
                >
                  Ekspor CSV Video
                </button>
              </div>
            </div>

            {/* Impor Data */}
            <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-1.5">
                <Upload size={14} className="text-emerald-500" />
                <span>Impor File JSON</span>
              </h4>
              <p className="text-[11px] text-neutral-400">
                Pulihkan data dari file JSON cadangan YTM sebelumnya.
              </p>
              <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium cursor-pointer">
                <span>Pilih Berkas JSON...</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
          </div>

          {/* Reset / Bersihkan Seluruh Data */}
          <div className="p-4 bg-red-950/20 border border-red-900/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-semibold">
              <AlertTriangle size={15} />
              <span>Zona Berbahaya: Reset Seluruh Data</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Membersihkan semua perubahan lokal dan mengosongkan seluruh data koleksi YTM.
            </p>

            {resetMessage && (
              <p className="text-xs text-emerald-400 font-medium bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/50">
                {resetMessage}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetData}
                className={`px-3.5 py-1.5 rounded-lg text-white font-medium flex items-center gap-1.5 transition-colors text-xs ${
                  confirmReset
                    ? 'bg-red-700 hover:bg-red-800 ring-2 ring-red-400'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Trash2 size={13} />
                <span>{confirmReset ? 'Konfirmasi: Hapus Semua Data Sekarang' : 'Reset & Bersihkan Data'}</span>
              </button>

              {confirmReset && (
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Konten Sub-Halaman 4: Kode Skema SQL Supabase */}
      {activeTab === 'sql-schema' && (
        <div className="p-5 rounded-2xl bg-[#181818] border border-neutral-800 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Skema SQL Supabase (DDL)</h3>
              <p className="text-[11px] text-neutral-400">
                Salin skrip ini dan jalankan pada Supabase SQL Editor proyek Anda.
              </p>
            </div>

            <button
              type="button"
              onClick={copySqlToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              {copiedSql ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedSql ? 'Tersalin!' : 'Salin Kode SQL'}</span>
            </button>
          </div>

          <pre className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-96 leading-relaxed">
            {sqlSchemaCode}
          </pre>
        </div>
      )}
    </div>
  );
};
