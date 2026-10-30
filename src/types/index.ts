/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Definisi Tipe Data Inti untuk Aplikasi YTM (YouTube Manager)
 * Mengatur seluruh struktur data Channel, Kategori, Video, Playlist, dan Pengguna.
 */

export type VideoStatus = 'To Watch' | 'Watching' | 'Watched';

export interface Channel {
  id: string;
  name: string; // Wajib diisi
  categories: string[]; // Multi-select kategori
  rating: number; // 1 sampai 5 bintang (0 jika belum dinilai)
  link: string; // Tautan ke channel YouTube
  tag: string; // Single-select tag
  isArchived: boolean; // Status arsip
  isFavorite: boolean; // Status favorit
  avatarUrl: string; // URL foto profil atau hasil upload base64
  videoIds: string[]; // Daftar ID video yang dikaitkan ke channel ini
  createdAt: string; // Waktu pembuatan ISO
  updatedAt: string; // Status 'Terakhir di edit' untuk sorting
}

export interface Category {
  id: string;
  name: string; // Wajib diisi
  tags: string[]; // Multi-select tag
  icon: string; // Identifier Iconify (misal: "solar:folder-bold", "mdi:youtube")
  channelIds: string[]; // Daftar channel yang terkait
  playlistIds: string[]; // Daftar playlist yang terkait
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string; // Wajib diisi
  status: VideoStatus; // 'To Watch' | 'Watching' | 'Watched' (hanya satu yang dipilih)
  tags: string[]; // Multi-select tag
  rating: number; // 1 sampai 5 bintang
  link: string; // Tautan video YouTube
  youtubeId: string; // ID video YouTube (diekstrak otomatis dari tautan)
  thumbnailUrl: string; // URL thumbnail video YouTube
  durationSeconds: number; // Durasi total dalam detik
  timestampSeconds: number; // Posisi tonton terakhir dalam detik
  channelId?: string; // ID Channel terkait
  channelName?: string; // Cache nama channel
  playlistId?: string; // ID Playlist terkait
  playlistName?: string; // Cache nama playlist
  categoryId?: string; // ID Kategori terkait
  categoryName?: string; // Cache nama kategori
  isArchived: boolean; // Status arsip
  isFavorite: boolean; // Status favorit
  watchedAt?: string; // Tanggal ditonton (untuk perhitungan today, this week, this month)
  createdAt: string;
  updatedAt: string; // Status 'Terakhir di edit'
}

export interface Playlist {
  id: string;
  name: string; // Wajib diisi
  categoryId?: string;
  categoryName?: string;
  tags: string[];
  videoIds: string[]; // Urutan ID video di dalam playlist (mendukung drag & drop)
  isArchived: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

// Navigasi Rute Aktif
export type RoutePath =
  | 'dashboard'
  | 'channels'
  | 'channel-detail'
  | 'categories'
  | 'category-detail'
  | 'videos'
  | 'video-detail'
  | 'playlists'
  | 'playlist-detail'
  | 'favorites'
  | 'archive'
  | 'stats'
  | 'pivot'
  | 'settings'
  | 'login'
  | 'register'
  | '404'
  | '403'
  | '500'
  | '503';

export type SettingsSubPage = 'account' | 'appearance' | 'data' | 'sql-schema';
