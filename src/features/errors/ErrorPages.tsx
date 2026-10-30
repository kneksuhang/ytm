/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman-Halaman Error Minimalis (404, 403, 500, 503)
 * Menampilkan status kode error dengan desain elegan minimalis dan tombol kembali ke beranda.
 */

import React from 'react';
import { ArrowLeft, AlertCircle, ShieldAlert, ServerOff, Ban } from 'lucide-react';
import type { RoutePath } from '../../types';

interface ErrorPageProps {
  navigate: (route: RoutePath) => void;
}

// 1. Halaman 404: Not Found
export const NotFoundPage: React.FC<ErrorPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#ff0000]">
        <AlertCircle size={28} />
      </div>
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold text-white font-mono">404</h1>
        <h2 className="text-base font-semibold text-neutral-200">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Tautan yang Anda tuju mungkin sudah dipindahkan, dihapus, atau tidak pernah ada.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('dashboard')}
        className="px-4 py-2 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
      >
        <ArrowLeft size={14} />
        <span>Kembali ke Beranda</span>
      </button>
    </div>
  );
};

// 2. Halaman 403: Forbidden
export const ForbiddenPage: React.FC<ErrorPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500">
        <Ban size={28} />
      </div>
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold text-white font-mono">403</h1>
        <h2 className="text-base font-semibold text-neutral-200">Akses Ditolak (Forbidden)</h2>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Anda tidak memiliki izin yang cukup untuk mengakses halaman atau sumber daya ini.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('dashboard')}
        className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Kembali ke Beranda</span>
      </button>
    </div>
  );
};

// 3. Halaman 500: Internal Server Error
export const ServerErrorPage: React.FC<ErrorPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-500">
        <ShieldAlert size={28} />
      </div>
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold text-white font-mono">500</h1>
        <h2 className="text-base font-semibold text-neutral-200">Kesalahan Server Internal</h2>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Terjadi kendala teknis pada server kami. Silakan coba kembali dalam beberapa saat.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('dashboard')}
        className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Kembali ke Beranda</span>
      </button>
    </div>
  );
};

// 4. Halaman 503: Service Unavailable
export const ServiceUnavailablePage: React.FC<ErrorPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sky-500">
        <ServerOff size={28} />
      </div>
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold text-white font-mono">503</h1>
        <h2 className="text-base font-semibold text-neutral-200">Layanan Sedang Tidak Tersedia</h2>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Sistem sedang dalam proses pemeliharaan berkala atau lalu lintas sedang padat.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('dashboard')}
        className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Kembali ke Beranda</span>
      </button>
    </div>
  );
};
