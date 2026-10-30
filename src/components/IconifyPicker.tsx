/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Pemilih Ikon Iconify Kustom
 * Mengintegrasikan pencarian API Iconify resmi (https://api.iconify.design/search)
 * dan menampilkan preview langsung menggunakan @iconify/react.
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Search, Loader2, Check } from 'lucide-react';

interface IconifyPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

// Ikon-ikon populer default untuk akses kilat
const popularIcons = [
  'solar:devices-bold',
  'solar:code-square-bold',
  'solar:planet-bold',
  'solar:cpu-bolt-bold',
  'solar:palette-bold',
  'solar:gamepad-bold',
  'solar:music-note-bold',
  'solar:camera-bold',
  'solar:book-2-bold',
  'solar:folder-with-files-bold',
  'solar:video-frame-bold',
  'solar:heart-bold',
  'solar:star-bold',
  'solar:fire-bold',
  'solar:shield-check-bold',
  'solar:podcast-bold',
  'solar:tv-bold',
  'mdi:youtube',
  'mdi:robot-excited',
  'mdi:source-branch',
  'mdi:web',
  'mdi:chart-line',
  'mdi:school',
  'mdi:lightbulb',
];

export const IconifyPicker: React.FC<IconifyPickerProps> = ({
  selectedIcon,
  onSelectIcon,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>(popularIcons);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search ke API Iconify
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(popularIcons);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(searchQuery.trim())}&limit=36`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.icons) && data.icons.length > 0) {
            setSearchResults(data.icons);
          } else {
            setSearchResults([]);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat ikon dari Iconify API:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="space-y-3">
      {/* Kolom Input Pencarian Ikon */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari ikon di Iconify (misal: code, video, tech, game)..."
          className="w-full pl-9 pr-9 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000] focus:ring-1 focus:ring-[#ff0000]"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-400" size={16} />
        )}
      </div>

      {/* Preview Ikon Terpilih */}
      <div className="flex items-center gap-2 p-2 bg-neutral-800/60 rounded-lg border border-neutral-700/60">
        <div className="w-8 h-8 rounded-md bg-[#ff0000]/15 text-[#ff0000] flex items-center justify-center shrink-0">
          <Icon icon={selectedIcon || 'solar:folder-with-files-bold'} width="20" height="20" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-neutral-400">Ikon Terpilih:</p>
          <p className="text-xs font-mono font-medium text-white truncate">{selectedIcon || 'solar:folder-with-files-bold'}</p>
        </div>
      </div>

      {/* Grid Pilihan Ikon */}
      <div className="max-h-48 overflow-y-auto pr-1">
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
          {searchResults.map((iconName) => {
            const isSelected = selectedIcon === iconName;
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => onSelectIcon(iconName)}
                title={iconName}
                className={`relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-[#ff0000] bg-[#ff0000]/20 text-[#ff0000]'
                    : 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-600 hover:text-white'
                }`}
              >
                <Icon icon={iconName} width="22" height="22" />
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#ff0000] text-white rounded-full flex items-center justify-center text-[8px]">
                    <Check size={10} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {searchResults.length === 0 && !isSearching && (
          <p className="text-center py-6 text-xs text-neutral-500">
            Tidak ada ikon ditemukan untuk "{searchQuery}".
          </p>
        )}
      </div>
    </div>
  );
};
