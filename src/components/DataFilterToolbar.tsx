/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Toolbar Filter, Sortir, dan Pencarian Fuse.js Tersembunyi (DataFilterToolbar)
 * Sesuai instruksi: Seluruh Filter, Sort, dan Search disembunyikan secara default
 * dan dapat dibuka dengan tombol toggle yang ringkas agar tampilan rapi & ramah mobile.
 */

import React, { useState } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

interface DataFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  activeFilterCount?: number;
  onResetFilters?: () => void;
  children: React.ReactNode;
}

export const DataFilterToolbar: React.FC<DataFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  activeFilterCount = 0,
  onResetFilters,
  children,
}) => {
  // Status tersembunyi/terbuka (default: TERSEMBUNYI sesuai instruksi)
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveControls = activeFilterCount > 0 || Boolean(searchQuery.trim());

  return (
    <div className="space-y-2.5 select-none">
      {/* Baris Tombol Toggle Filter & Search (Minimalis & Rapi) */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            isOpen || hasActiveControls
              ? 'bg-[#181818] border-neutral-700 text-white'
              : 'bg-[#181818]/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
          }`}
        >
          <SlidersHorizontal size={13} className={hasActiveControls ? 'text-[#ff0000]' : 'text-neutral-400'} />
          <span>Filter & Pencarian</span>

          {/* Indikator Badge Filter Aktif */}
          {hasActiveControls && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff0000]" />
          )}

          {isOpen ? <ChevronUp size={14} className="text-neutral-400" /> : <ChevronDown size={14} className="text-neutral-400" />}
        </button>

        {/* Tombol Reset Cepat jika ada filter atau pencarian aktif */}
        {hasActiveControls && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              if (onResetFilters) onResetFilters();
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors"
            title="Reset semua filter dan pencarian"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Konten Tersembunyi: Bilah Pencarian Fuse.js & Opsi Filter/Sortir */}
      {isOpen && (
        <div className="p-3 sm:p-3.5 bg-[#181818] border border-neutral-800 rounded-2xl space-y-3 animate-fadeIn text-xs shadow-md">
          {/* 1. Input Pencarian Fuse.js */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-8 pl-8 pr-8 bg-neutral-900 border border-neutral-700/80 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-white"
                title="Hapus pencarian"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* 2. Opsi Filter & Pengurutan Tambahan */}
          <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2.5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
