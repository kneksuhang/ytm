/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Sidebar YouTube-Native Desktop
 * Menampilkan tautan navigasi utama: Beranda, Saluran, Kategori, Video, Playlist,
 * Favorit, Arsip, Statistik, dan Pengaturan dengan visual khas YouTube.
 */

import React from 'react';
import {
  Home,
  Tv,
  FolderTree,
  PlaySquare,
  ListVideo,
  Heart,
  Archive,
  BarChart3,
  TableProperties,
  Settings,
} from 'lucide-react';
import type { RoutePath } from '../types';

interface SidebarProps {
  currentRoute: RoutePath;
  navigate: (route: RoutePath) => void;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  isCollapsed = false,
}) => {
  const primaryNavItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'videos', label: 'Video', icon: PlaySquare },
    { id: 'channels', label: 'Saluran', icon: Tv },
    { id: 'categories', label: 'Kategori', icon: FolderTree },
    { id: 'playlists', label: 'Playlist', icon: ListVideo },
  ];

  const secondaryNavItems = [
    { id: 'favorites', label: 'Favorit', icon: Heart },
    { id: 'archive', label: 'Arsip', icon: Archive },
    { id: 'stats', label: 'Statistik', icon: BarChart3 },
    { id: 'pivot', label: 'Pivot Data', icon: TableProperties },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  if (isCollapsed) {
    return (
      <aside className="w-18 shrink-0 bg-[#0f0f0f] border-r border-neutral-800 hidden md:flex flex-col items-center py-3 select-none">
        <div className="space-y-4 w-full px-2">
          {primaryNavItems.concat(secondaryNavItems).map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id as RoutePath)}
                className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-[#ff0000] font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
                title={item.label}
              >
                <Icon size={19} className={isActive ? 'text-[#ff0000]' : ''} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-56 shrink-0 bg-[#0f0f0f] border-r border-neutral-800 hidden md:block py-3 px-3 select-none overflow-y-auto h-[calc(100vh-3.5rem)]">
      {/* Bagian Utama */}
      <div className="space-y-1">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id as RoutePath)}
              className={`w-full h-10 px-3 rounded-xl flex items-center gap-4 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900/90'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#ff0000]' : 'text-neutral-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="my-3 border-t border-neutral-800" />

      {/* Bagian Koleksi & Utilitas */}
      <div className="space-y-1">
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id as RoutePath)}
              className={`w-full h-10 px-3 rounded-xl flex items-center gap-4 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900/90'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#ff0000]' : 'text-neutral-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
