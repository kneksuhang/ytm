/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Hamburger Menu Drawer Mobile
 * Panel drawer samping khusus mobile/layar kecil dengan animasi slide-over lembut.
 */

import React, { useEffect } from 'react';
import {
  X,
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
  User,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import type { RoutePath } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: RoutePath;
  navigate: (route: RoutePath) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentRoute,
  navigate,
}) => {
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavigate = (path: RoutePath) => {
    navigate(path);
    onClose();
  };

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'videos', label: 'Video', icon: PlaySquare },
    { id: 'channels', label: 'Saluran', icon: Tv },
    { id: 'categories', label: 'Kategori', icon: FolderTree },
    { id: 'playlists', label: 'Playlist', icon: ListVideo },
    { id: 'favorites', label: 'Favorit', icon: Heart },
    { id: 'archive', label: 'Arsip', icon: Archive },
    { id: 'stats', label: 'Statistik', icon: BarChart3 },
    { id: 'pivot', label: 'Pivot Data', icon: TableProperties },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-[#0f0f0f] border-r border-neutral-800 shadow-2xl p-4 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
        <div>
          {/* Header Drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-5 bg-[#ff0000] rounded-md flex items-center justify-center">
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
              </div>
              <span className="font-bold text-base text-white">YTM</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* Profil Pengguna Singkat */}
          <div className="py-3 px-1 border-b border-neutral-800/80 mb-2">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-white uppercase border border-neutral-700">
                  {user.displayName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNavigate('login')}
                className="w-full py-2 px-3 rounded-lg bg-neutral-800 text-xs font-medium text-white flex items-center justify-center gap-2 hover:bg-neutral-700"
              >
                <User size={14} className="text-[#ff0000]" />
                <span>Masuk Akun</span>
              </button>
            )}
          </div>

          {/* Daftar Tautan Navigasi */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-16rem)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id as RoutePath)}
                  className={`w-full h-10 px-3 rounded-xl flex items-center gap-3.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-800 text-[#ff0000] font-semibold'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#ff0000]' : 'text-neutral-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Drawer */}
        <div className="pt-3 border-t border-neutral-800 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-neutral-400">Mode Tema</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1.5 text-xs"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
            </button>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-lg text-xs font-medium text-red-400 hover:bg-neutral-800 flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
