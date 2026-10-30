/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Bottom Navigation Mobile YouTube-Style
 * Mengoptimalkan ergonomi jempol pengguna mobile dengan akses cepat ke menu utama.
 */

import React from 'react';
import { Home, PlaySquare, Tv, ListVideo, FolderTree } from 'lucide-react';
import type { RoutePath } from '../types';

interface BottomNavigationProps {
  currentRoute: RoutePath;
  navigate: (route: RoutePath) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentRoute,
  navigate,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'videos', label: 'Video', icon: PlaySquare },
    { id: 'channels', label: 'Saluran', icon: Tv },
    { id: 'playlists', label: 'Playlist', icon: ListVideo },
    { id: 'categories', label: 'Kategori', icon: FolderTree },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-t border-neutral-800 md:hidden select-none">
      <div className="grid grid-cols-5 items-center h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.id as RoutePath)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                isActive ? 'text-[#ff0000]' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon size={19} className={isActive ? 'text-[#ff0000]' : ''} />
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
