/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Aplikasi Utama: YTM - YouTube Manager
 * Mengatur perutean halaman (Router), inisialisasi tema, autentikasi Supabase,
 * dan modal manajemen formulir terpusat.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';
import { useYtmStore } from './store/useYtmStore';
import { animatePageIn } from './lib/anime';

// Komponen Tata Letak & Navigasi
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileDrawer } from './components/MobileDrawer';
import { BottomNavigation } from './components/BottomNavigation';

// Halaman-Halaman Fitur (Feature-Based)
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ChannelsPage } from './features/channels/ChannelsPage';
import { ChannelDetailPage } from './features/channels/ChannelDetailPage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { CategoryDetailPage } from './features/categories/CategoryDetailPage';
import { VideosPage } from './features/videos/VideosPage';
import { VideoDetailPage } from './features/videos/VideoDetailPage';
import { PlaylistsPage } from './features/playlists/PlaylistsPage';
import { PlaylistDetailPage } from './features/playlists/PlaylistDetailPage';
import { FavoritesPage } from './features/favorites/FavoritesPage';
import { ArchivePage } from './features/archive/ArchivePage';
import { StatsPage } from './features/stats/StatsPage';
import { PivotDataPage } from './features/pivot/PivotDataPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import {
  NotFoundPage,
  ForbiddenPage,
  ServerErrorPage,
  ServiceUnavailablePage,
} from './features/errors/ErrorPages';

// Formulir Modal Input
import { ChannelFormModal } from './features/channels/ChannelFormModal';
import { CategoryFormModal } from './features/categories/CategoryFormModal';
import { VideoFormModal } from './features/videos/VideoFormModal';
import { PlaylistFormModal } from './features/playlists/PlaylistFormModal';

import type { RoutePath } from './types';

export default function App() {
  const { initTheme } = useThemeStore();
  const { initAuth, user } = useAuthStore();
  const { loadData, syncWithSupabase } = useYtmStore();

  const [currentRoute, setCurrentRoute] = useState<RoutePath>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Status Modal Tambah / Ubah Terpusat
  const [modalType, setModalType] = useState<'video' | 'channel' | 'category' | 'playlist' | null>(null);
  const [itemToEdit, setItemToEdit] = useState<any>(null);

  const mainContentRef = useRef<HTMLDivElement>(null);

  // Inisialisasi Tema, Auth Supabase, dan Data Awal
  useEffect(() => {
    initTheme();
    initAuth();
    loadData();
  }, [initTheme, initAuth, loadData]);

  // Sinkronisasi data saat user berhasil login
  useEffect(() => {
    if (user?.id) {
      syncWithSupabase(user.id);
    }
  }, [user, syncWithSupabase]);

  // Pengendali Perutean URL Path (HTML5 History API tanpa tanda '#')
  useEffect(() => {
    const handleLocationChange = () => {
      // Ambil path utama dari pathname browser
      const rawPath = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      if (rawPath) {
        setCurrentRoute(rawPath as RoutePath);
      } else {
        setCurrentRoute('dashboard');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    // Jalankan pengecekan rute awal saat aplikasi dimuat
    handleLocationChange();

    // Hapus sisa hash jika pengguna mengakses URL dengan tanda '#' lama
    if (window.location.hash) {
      const cleanPath = window.location.pathname;
      window.history.replaceState(null, '', cleanPath);
    }

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Fungsi Navigasi Ramah Riwayat Browser menggunakan pathname bersih tanpa '#'
  const navigate = (route: RoutePath) => {
    setCurrentRoute(route);
    const targetPath = route === 'dashboard' ? '/' : `/${route}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Animasi transisi Anime.js lembut ke konten halaman
    if (mainContentRef.current) {
      animatePageIn(mainContentRef.current);
    }
  };

  const handleOpenAddModal = (type: 'video' | 'channel' | 'category' | 'playlist', editItem?: any) => {
    setItemToEdit(editItem || null);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setItemToEdit(null);
  };

  // Render Konten Sesuai Rute Aktif
  const renderPageContent = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardPage navigate={navigate} onOpenAddModal={handleOpenAddModal} />;
      case 'channels':
        return <ChannelsPage navigate={navigate} onOpenAddModal={handleOpenAddModal} />;
      case 'channel-detail':
        return <ChannelDetailPage navigate={navigate} onOpenEditModal={(type, item) => handleOpenAddModal(type, item)} />;
      case 'categories':
        return <CategoriesPage navigate={navigate} onOpenAddModal={handleOpenAddModal} />;
      case 'category-detail':
        return <CategoryDetailPage navigate={navigate} onOpenEditModal={(type, item) => handleOpenAddModal(type, item)} />;
      case 'videos':
        return <VideosPage navigate={navigate} onOpenAddModal={handleOpenAddModal} />;
      case 'video-detail':
        return <VideoDetailPage navigate={navigate} onOpenEditModal={(type, item) => handleOpenAddModal(type, item)} />;
      case 'playlists':
        return <PlaylistsPage navigate={navigate} onOpenAddModal={handleOpenAddModal} />;
      case 'playlist-detail':
        return <PlaylistDetailPage navigate={navigate} onOpenEditModal={(type, item) => handleOpenAddModal(type, item)} />;
      case 'favorites':
        return <FavoritesPage navigate={navigate} />;
      case 'archive':
        return <ArchivePage navigate={navigate} />;
      case 'stats':
        return <StatsPage />;
      case 'pivot':
        return <PivotDataPage navigate={navigate} />;
      case 'settings':
        return <SettingsPage navigate={navigate} />;
      case 'login':
        return <LoginPage navigate={navigate} />;
      case 'register':
        return <RegisterPage navigate={navigate} />;
      case '403':
        return <ForbiddenPage navigate={navigate} />;
      case '500':
        return <ServerErrorPage navigate={navigate} />;
      case '503':
        return <ServiceUnavailablePage navigate={navigate} />;
      case '404':
      default:
        return <NotFoundPage navigate={navigate} />;
    }
  };

  // Jangan tampilkan sidebar atau navbar pada halaman autentikasi mandiri jika diinginkan
  const isAuthPage = currentRoute === 'login' || currentRoute === 'register';

  return (
    <div className="min-h-screen bg-[var(--yt-bg)] text-[var(--yt-text)] flex flex-col font-sans transition-colors duration-200">
      {/* 1. Navbar YouTube Top Bar */}
      <Navbar
        onToggleMobileDrawer={() => {
          if (window.innerWidth >= 768) {
            setIsSidebarCollapsed(!isSidebarCollapsed);
          } else {
            setIsMobileDrawerOpen(true);
          }
        }}
        currentRoute={currentRoute}
        navigate={navigate}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* 2. Tata Letak Utama (Sidebar + Konten Halaman) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar YouTube Desktop */}
        {!isAuthPage && (
          <Sidebar
            currentRoute={currentRoute}
            navigate={navigate}
            isCollapsed={isSidebarCollapsed}
          />
        )}

        {/* Drawer Menu Hamburger Khusus Mobile */}
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          currentRoute={currentRoute}
          navigate={navigate}
        />

        {/* Area Konten Dinamis */}
        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto w-full"
        >
          {renderPageContent()}
        </main>
      </div>

      {/* 3. Bottom Navigation Khusus Layar Mobile */}
      {!isAuthPage && (
        <BottomNavigation currentRoute={currentRoute} navigate={navigate} />
      )}

      {/* 4. Modal Formulir Input Terpusat */}
      <ChannelFormModal
        isOpen={modalType === 'channel'}
        onClose={handleCloseModal}
        channelToEdit={itemToEdit}
      />

      <CategoryFormModal
        isOpen={modalType === 'category'}
        onClose={handleCloseModal}
        categoryToEdit={itemToEdit}
      />

      <VideoFormModal
        isOpen={modalType === 'video'}
        onClose={handleCloseModal}
        videoToEdit={itemToEdit}
      />

      <PlaylistFormModal
        isOpen={modalType === 'playlist'}
        onClose={handleCloseModal}
        playlistToEdit={itemToEdit}
      />
    </div>
  );
}
