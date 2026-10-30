/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pengelola Data Utama YTM (YouTube Manager)
 * Mengelola Channels, Kategori, Video, dan Playlist secara Feature-Based dengan
 * persistensi ganda: LocalStorage + Sinkronisasi Cloud Supabase.
 */

import { create } from 'zustand';
import Fuse from 'fuse.js';
import { supabase } from '../lib/supabase';
import type { Channel, Category, Video, Playlist, VideoStatus } from '../types';

interface YtmState {
  channels: Channel[];
  categories: Category[];
  videos: Video[];
  playlists: Playlist[];
  allTags: string[];
  searchQuery: string;
  isLoading: boolean;
  activeChannelId: string | null;
  activeCategoryId: string | null;
  activeVideoId: string | null;
  activePlaylistId: string | null;

  // Aksi Inisialisasi & Sinkronisasi
  loadData: () => Promise<void>;
  syncWithSupabase: (userId: string) => Promise<void>;

  // Aksi Channels
  addChannel: (channel: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateChannel: (id: string, updates: Partial<Channel>) => Promise<void>;
  deleteChannel: (id: string) => Promise<void>;
  toggleArchiveChannel: (id: string) => Promise<void>;
  toggleFavoriteChannel: (id: string) => Promise<void>;
  setActiveChannelId: (id: string | null) => void;

  // Aksi Kategori
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setActiveCategoryId: (id: string | null) => void;

  // Aksi Video
  addVideo: (video: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateVideo: (id: string, updates: Partial<Video>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  toggleArchiveVideo: (id: string) => Promise<void>;
  toggleFavoriteVideo: (id: string) => Promise<void>;
  updateVideoProgress: (id: string, timestampSeconds: number, status?: VideoStatus) => Promise<void>;
  setActiveVideoId: (id: string | null) => void;

  // Aksi Playlist
  addPlaylist: (playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  toggleArchivePlaylist: (id: string) => Promise<void>;
  toggleFavoritePlaylist: (id: string) => Promise<void>;
  reorderPlaylistVideos: (playlistId: string, videoIds: string[]) => Promise<void>;
  setActivePlaylistId: (id: string | null) => void;

  // Aksi Tag & Pencarian
  addTag: (tag: string) => void;
  deleteTag: (tag: string) => void;
  setSearchQuery: (query: string) => void;

  // Utilitas Data
  resetAllData: () => void;
  importJsonData: (jsonString: string) => boolean;
  exportDataAsJson: () => string;
}

const LOCAL_STORAGE_KEY = 'ytm_storage_state_v2';

// Inisialisasi Data Bersih Kosong (Seluruh Data Seed Dihapus Penuh Sesuai Instruksi)
const initialCategories: Category[] = [];
const initialChannels: Channel[] = [];
const initialVideos: Video[] = [];
const initialPlaylists: Playlist[] = [];
const initialTags: string[] = [];

function saveToLocalStorage(state: {
  channels: Channel[];
  categories: Category[];
  videos: Video[];
  playlists: Playlist[];
  allTags: string[];
}) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Gagal menyimpan ke LocalStorage:', err);
  }
}

export const useYtmStore = create<YtmState>((set, get) => ({
  channels: initialChannels,
  categories: initialCategories,
  videos: initialVideos,
  playlists: initialPlaylists,
  allTags: initialTags,
  searchQuery: '',
  isLoading: false,
  activeChannelId: null,
  activeCategoryId: null,
  activeVideoId: null,
  activePlaylistId: null,

  loadData: async () => {
    try {
      // Hapus data cache lama v1 untuk memastikan data seed lama tidak tersisa
      localStorage.removeItem('ytm_storage_state_v1');

      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Pastikan tidak ada data seed lama dengan id bawaan
        const filterOldSeeds = (items: any[]) =>
          Array.isArray(items)
            ? items.filter(
                (item) =>
                  !['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'ch-1', 'ch-2', 'ch-3', 'ch-4', 'ch-5', 'vid-1', 'vid-2', 'vid-3', 'vid-4', 'vid-5', 'vid-6', 'vid-7', 'pl-1', 'pl-2'].includes(item?.id)
              )
            : [];

        set({
          channels: filterOldSeeds(parsed.channels),
          categories: filterOldSeeds(parsed.categories),
          videos: filterOldSeeds(parsed.videos),
          playlists: filterOldSeeds(parsed.playlists),
          allTags: Array.isArray(parsed.allTags) ? parsed.allTags : [],
        });
      } else {
        set({
          channels: [],
          categories: [],
          videos: [],
          playlists: [],
          allTags: [],
        });
      }
    } catch (e) {
      console.warn('Gagal memuat data dari LocalStorage:', e);
      set({
        channels: [],
        categories: [],
        videos: [],
        playlists: [],
        allTags: [],
      });
    }
  },

  syncWithSupabase: async (userId: string) => {
    if (!userId) return;
    try {
      set({ isLoading: true });
      // Ambil data channels dari Supabase
      const { data: dbChannels } = await supabase.from('channels').select('*');
      const { data: dbCategories } = await supabase.from('categories').select('*');
      const { data: dbPlaylists } = await supabase.from('playlists').select('*');
      const { data: dbVideos } = await supabase.from('videos').select('*');

      if (dbChannels && dbChannels.length > 0) {
        const mappedChannels: Channel[] = dbChannels.map((c: any) => ({
          id: c.id,
          name: c.name,
          categories: c.categories || [],
          rating: c.rating || 0,
          link: c.link || '',
          tag: c.tag || '',
          isArchived: Boolean(c.is_archived),
          isFavorite: Boolean(c.is_favorite),
          avatarUrl: c.avatar_url || '',
          videoIds: [],
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
        set({ channels: mappedChannels });
      }

      if (dbCategories && dbCategories.length > 0) {
        const mappedCategories: Category[] = dbCategories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          tags: cat.tags || [],
          icon: cat.icon || 'solar:folder-with-files-bold',
          channelIds: [],
          playlistIds: [],
          createdAt: cat.created_at,
          updatedAt: cat.updated_at,
        }));
        set({ categories: mappedCategories });
      }

      if (dbPlaylists && dbPlaylists.length > 0) {
        const mappedPlaylists: Playlist[] = dbPlaylists.map((p: any) => ({
          id: p.id,
          name: p.name,
          categoryId: p.category_id,
          categoryName: p.category_name,
          tags: p.tags || [],
          videoIds: [],
          isArchived: Boolean(p.is_archived),
          isFavorite: Boolean(p.is_favorite),
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }));
        set({ playlists: mappedPlaylists });
      }

      if (dbVideos && dbVideos.length > 0) {
        const mappedVideos: Video[] = dbVideos.map((v: any) => ({
          id: v.id,
          title: v.title,
          status: v.status || 'To Watch',
          tags: v.tags || [],
          rating: v.rating || 0,
          link: v.link,
          youtubeId: v.youtube_id || '',
          thumbnailUrl: v.thumbnail_url || '',
          durationSeconds: v.duration_seconds || 0,
          timestampSeconds: v.timestamp_seconds || 0,
          channelId: v.channel_id,
          channelName: v.channel_name,
          playlistId: v.playlist_id,
          playlistName: v.playlist_name,
          categoryId: v.category_id,
          categoryName: v.category_name,
          isArchived: Boolean(v.is_archived),
          isFavorite: Boolean(v.is_favorite),
          watchedAt: v.watched_at,
          createdAt: v.created_at,
          updatedAt: v.updated_at,
        }));
        set({ videos: mappedVideos });
      }
    } catch (err) {
      console.warn('Koneksi Supabase offline/berjalan pada local mode:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // CHANNELS
  addChannel: async (newCh) => {
    const id = 'ch-' + Date.now();
    const now = new Date().toISOString();
    const channel: Channel = {
      ...newCh,
      id,
      videoIds: newCh.videoIds || [],
      createdAt: now,
      updatedAt: now,
    };
    const nextChannels = [channel, ...get().channels];
    set({ channels: nextChannels });
    saveToLocalStorage({ ...get(), channels: nextChannels });

    // Coba simpan ke Supabase jika ada koneksi
    try {
      await supabase.from('channels').insert({
        id,
        name: channel.name,
        categories: channel.categories,
        rating: channel.rating,
        link: channel.link,
        tag: channel.tag,
        is_archived: channel.isArchived,
        is_favorite: channel.isFavorite,
        avatar_url: channel.avatarUrl,
        created_at: now,
        updated_at: now,
      });
    } catch (e) {
      // Offline fallback
    }

    return id;
  },

  updateChannel: async (id, updates) => {
    const now = new Date().toISOString();
    const nextChannels = get().channels.map((ch) =>
      ch.id === id ? { ...ch, ...updates, updatedAt: now } : ch
    );
    set({ channels: nextChannels });
    saveToLocalStorage({ ...get(), channels: nextChannels });

    try {
      await supabase.from('channels').update({
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.categories ? { categories: updates.categories } : {}),
        ...(updates.rating !== undefined ? { rating: updates.rating } : {}),
        ...(updates.link !== undefined ? { link: updates.link } : {}),
        ...(updates.tag !== undefined ? { tag: updates.tag } : {}),
        ...(updates.isArchived !== undefined ? { is_archived: updates.isArchived } : {}),
        ...(updates.isFavorite !== undefined ? { is_favorite: updates.isFavorite } : {}),
        ...(updates.avatarUrl !== undefined ? { avatar_url: updates.avatarUrl } : {}),
        updated_at: now,
      }).eq('id', id);
    } catch (e) {}
  },

  deleteChannel: async (id) => {
    // Hapus channel dan lepaskan tautan channel pada video terkait
    const nextChannels = get().channels.filter((c) => c.id !== id);
    const nextVideos = get().videos.map((v) =>
      v.channelId === id ? { ...v, channelId: undefined, channelName: undefined } : v
    );
    const activeChannelId = get().activeChannelId === id ? null : get().activeChannelId;

    set({ channels: nextChannels, videos: nextVideos, activeChannelId });
    saveToLocalStorage({ ...get(), channels: nextChannels, videos: nextVideos });
    try {
      await supabase.from('channels').delete().eq('id', id);
    } catch (e) {}
  },

  toggleArchiveChannel: async (id) => {
    const target = get().channels.find((c) => c.id === id);
    if (!target) return;
    await get().updateChannel(id, { isArchived: !target.isArchived });
  },

  toggleFavoriteChannel: async (id) => {
    const target = get().channels.find((c) => c.id === id);
    if (!target) return;
    await get().updateChannel(id, { isFavorite: !target.isFavorite });
  },

  setActiveChannelId: (id) => set({ activeChannelId: id }),

  // KATEGORI
  addCategory: async (newCat) => {
    const id = 'cat-' + Date.now();
    const now = new Date().toISOString();
    const category: Category = {
      ...newCat,
      id,
      createdAt: now,
      updatedAt: now,
    };
    const nextCategories = [category, ...get().categories];
    set({ categories: nextCategories });
    saveToLocalStorage({ ...get(), categories: nextCategories });

    try {
      await supabase.from('categories').insert({
        id,
        name: category.name,
        tags: category.tags,
        icon: category.icon,
        created_at: now,
        updated_at: now,
      });
    } catch (e) {}

    return id;
  },

  updateCategory: async (id, updates) => {
    const now = new Date().toISOString();
    const nextCategories = get().categories.map((cat) =>
      cat.id === id ? { ...cat, ...updates, updatedAt: now } : cat
    );
    set({ categories: nextCategories });
    saveToLocalStorage({ ...get(), categories: nextCategories });

    try {
      await supabase.from('categories').update({
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.tags ? { tags: updates.tags } : {}),
        ...(updates.icon ? { icon: updates.icon } : {}),
        updated_at: now,
      }).eq('id', id);
    } catch (e) {}
  },

  deleteCategory: async (id) => {
    const targetCat = get().categories.find((c) => c.id === id);
    const catName = targetCat?.name;
    const nextCategories = get().categories.filter((c) => c.id !== id);
    
    // Lepaskan referensi category dari playlist dan video
    const nextPlaylists = get().playlists.map((p) =>
      p.categoryId === id ? { ...p, categoryId: undefined, categoryName: undefined } : p
    );
    const nextVideos = get().videos.map((v) =>
      v.categoryId === id || (catName && v.categoryName?.toLowerCase() === catName.toLowerCase())
        ? { ...v, categoryId: undefined, categoryName: undefined }
        : v
    );
    const nextChannels = get().channels.map((ch) =>
      catName ? { ...ch, categories: ch.categories.filter((c) => c.toLowerCase() !== catName.toLowerCase()) } : ch
    );
    const activeCategoryId = get().activeCategoryId === id ? null : get().activeCategoryId;

    set({
      categories: nextCategories,
      playlists: nextPlaylists,
      videos: nextVideos,
      channels: nextChannels,
      activeCategoryId,
    });
    saveToLocalStorage({
      ...get(),
      categories: nextCategories,
      playlists: nextPlaylists,
      videos: nextVideos,
      channels: nextChannels,
    });

    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (e) {}
  },

  setActiveCategoryId: (id) => set({ activeCategoryId: id }),

  // VIDEO
  addVideo: async (newVid) => {
    const id = 'vid-' + Date.now();
    const now = new Date().toISOString();
    const video: Video = {
      ...newVid,
      id,
      createdAt: now,
      updatedAt: now,
    };
    const nextVideos = [video, ...get().videos];
    set({ videos: nextVideos });

    // Jika video dimasukkan ke channel, perbarui array videoIds channel
    if (video.channelId) {
      const targetChannel = get().channels.find((c) => c.id === video.channelId);
      if (targetChannel && !targetChannel.videoIds.includes(id)) {
        get().updateChannel(video.channelId, { videoIds: [...targetChannel.videoIds, id] });
      }
    }

    // Jika video dimasukkan ke playlist, perbarui playlist videoIds
    if (video.playlistId) {
      const targetPlaylist = get().playlists.find((p) => p.id === video.playlistId);
      if (targetPlaylist && !targetPlaylist.videoIds.includes(id)) {
        get().updatePlaylist(video.playlistId, { videoIds: [...targetPlaylist.videoIds, id] });
      }
    }

    saveToLocalStorage({ ...get(), videos: nextVideos });

    try {
      await supabase.from('videos').insert({
        id,
        title: video.title,
        status: video.status,
        tags: video.tags,
        rating: video.rating,
        link: video.link,
        youtube_id: video.youtubeId,
        thumbnail_url: video.thumbnailUrl,
        duration_seconds: video.durationSeconds,
        timestamp_seconds: video.timestampSeconds,
        channel_id: video.channelId,
        channel_name: video.channelName,
        playlist_id: video.playlistId,
        playlist_name: video.playlistName,
        category_id: video.categoryId,
        category_name: video.categoryName,
        is_archived: video.isArchived,
        is_favorite: video.isFavorite,
        watched_at: video.watchedAt,
        created_at: now,
        updated_at: now,
      });
    } catch (e) {}

    return id;
  },

  updateVideo: async (id, updates) => {
    const now = new Date().toISOString();
    const nextVideos = get().videos.map((vid) =>
      vid.id === id ? { ...vid, ...updates, updatedAt: now } : vid
    );
    set({ videos: nextVideos });
    saveToLocalStorage({ ...get(), videos: nextVideos });

    try {
      await supabase.from('videos').update({
        ...(updates.title ? { title: updates.title } : {}),
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.tags ? { tags: updates.tags } : {}),
        ...(updates.rating !== undefined ? { rating: updates.rating } : {}),
        ...(updates.link ? { link: updates.link } : {}),
        ...(updates.youtubeId ? { youtube_id: updates.youtubeId } : {}),
        ...(updates.thumbnailUrl ? { thumbnail_url: updates.thumbnailUrl } : {}),
        ...(updates.durationSeconds !== undefined ? { duration_seconds: updates.durationSeconds } : {}),
        ...(updates.timestampSeconds !== undefined ? { timestamp_seconds: updates.timestampSeconds } : {}),
        ...(updates.channelId !== undefined ? { channel_id: updates.channelId } : {}),
        ...(updates.channelName !== undefined ? { channel_name: updates.channelName } : {}),
        ...(updates.playlistId !== undefined ? { playlist_id: updates.playlistId } : {}),
        ...(updates.playlistName !== undefined ? { playlist_name: updates.playlistName } : {}),
        ...(updates.categoryId !== undefined ? { category_id: updates.categoryId } : {}),
        ...(updates.categoryName !== undefined ? { category_name: updates.categoryName } : {}),
        ...(updates.isArchived !== undefined ? { is_archived: updates.isArchived } : {}),
        ...(updates.isFavorite !== undefined ? { is_favorite: updates.isFavorite } : {}),
        ...(updates.watchedAt !== undefined ? { watched_at: updates.watchedAt } : {}),
        updated_at: now,
      }).eq('id', id);
    } catch (e) {}
  },

  deleteVideo: async (id) => {
    // Hapus video dari daftar video
    const nextVideos = get().videos.filter((v) => v.id !== id);
    // Bersihkan ID video dari channels dan playlists yang menampungnya
    const nextChannels = get().channels.map((ch) => ({
      ...ch,
      videoIds: ch.videoIds ? ch.videoIds.filter((vId) => vId !== id) : [],
    }));
    const nextPlaylists = get().playlists.map((pl) => ({
      ...pl,
      videoIds: pl.videoIds ? pl.videoIds.filter((vId) => vId !== id) : [],
    }));
    const activeVideoId = get().activeVideoId === id ? null : get().activeVideoId;

    set({
      videos: nextVideos,
      channels: nextChannels,
      playlists: nextPlaylists,
      activeVideoId,
    });
    saveToLocalStorage({
      ...get(),
      videos: nextVideos,
      channels: nextChannels,
      playlists: nextPlaylists,
    });
    try {
      await supabase.from('videos').delete().eq('id', id);
    } catch (e) {}
  },

  toggleArchiveVideo: async (id) => {
    const target = get().videos.find((v) => v.id === id);
    if (!target) return;
    await get().updateVideo(id, { isArchived: !target.isArchived });
  },

  toggleFavoriteVideo: async (id) => {
    const target = get().videos.find((v) => v.id === id);
    if (!target) return;
    await get().updateVideo(id, { isFavorite: !target.isFavorite });
  },

  updateVideoProgress: async (id, timestampSeconds, newStatus) => {
    const target = get().videos.find((v) => v.id === id);
    if (!target) return;

    let computedStatus: VideoStatus = target.status;
    let watchedAt = target.watchedAt;

    if (newStatus) {
      computedStatus = newStatus;
    } else if (target.durationSeconds > 0) {
      if (timestampSeconds >= target.durationSeconds - 5) {
        computedStatus = 'Watched';
        watchedAt = new Date().toISOString();
      } else if (timestampSeconds > 5) {
        computedStatus = 'Watching';
      }
    }

    if (computedStatus === 'Watched' && !watchedAt) {
      watchedAt = new Date().toISOString();
    }

    await get().updateVideo(id, {
      timestampSeconds,
      status: computedStatus,
      ...(watchedAt ? { watchedAt } : {}),
    });
  },

  setActiveVideoId: (id) => set({ activeVideoId: id }),

  // PLAYLIST
  addPlaylist: async (newPl) => {
    const id = 'pl-' + Date.now();
    const now = new Date().toISOString();
    const playlist: Playlist = {
      ...newPl,
      id,
      videoIds: newPl.videoIds || [],
      createdAt: now,
      updatedAt: now,
    };
    const nextPlaylists = [playlist, ...get().playlists];
    set({ playlists: nextPlaylists });
    saveToLocalStorage({ ...get(), playlists: nextPlaylists });

    try {
      await supabase.from('playlists').insert({
        id,
        name: playlist.name,
        category_id: playlist.categoryId,
        category_name: playlist.categoryName,
        tags: playlist.tags,
        is_archived: playlist.isArchived,
        is_favorite: playlist.isFavorite,
        created_at: now,
        updated_at: now,
      });
    } catch (e) {}

    return id;
  },

  updatePlaylist: async (id, updates) => {
    const now = new Date().toISOString();
    const nextPlaylists = get().playlists.map((pl) =>
      pl.id === id ? { ...pl, ...updates, updatedAt: now } : pl
    );
    set({ playlists: nextPlaylists });
    saveToLocalStorage({ ...get(), playlists: nextPlaylists });

    try {
      await supabase.from('playlists').update({
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.categoryId !== undefined ? { category_id: updates.categoryId } : {}),
        ...(updates.categoryName !== undefined ? { category_name: updates.categoryName } : {}),
        ...(updates.tags ? { tags: updates.tags } : {}),
        ...(updates.isArchived !== undefined ? { is_archived: updates.isArchived } : {}),
        ...(updates.isFavorite !== undefined ? { is_favorite: updates.isFavorite } : {}),
        updated_at: now,
      }).eq('id', id);
    } catch (e) {}
  },

  deletePlaylist: async (id) => {
    // Hapus playlist dan lepaskan tautan playlist pada video terkait
    const nextPlaylists = get().playlists.filter((p) => p.id !== id);
    const nextVideos = get().videos.map((v) =>
      v.playlistId === id ? { ...v, playlistId: undefined, playlistName: undefined } : v
    );
    const activePlaylistId = get().activePlaylistId === id ? null : get().activePlaylistId;

    set({ playlists: nextPlaylists, videos: nextVideos, activePlaylistId });
    saveToLocalStorage({ ...get(), playlists: nextPlaylists, videos: nextVideos });
    try {
      await supabase.from('playlists').delete().eq('id', id);
    } catch (e) {}
  },

  toggleArchivePlaylist: async (id) => {
    const target = get().playlists.find((p) => p.id === id);
    if (!target) return;
    await get().updatePlaylist(id, { isArchived: !target.isArchived });
  },

  toggleFavoritePlaylist: async (id) => {
    const target = get().playlists.find((p) => p.id === id);
    if (!target) return;
    await get().updatePlaylist(id, { isFavorite: !target.isFavorite });
  },

  reorderPlaylistVideos: async (playlistId, videoIds) => {
    await get().updatePlaylist(playlistId, { videoIds });
  },

  setActivePlaylistId: (id) => set({ activePlaylistId: id }),

  // TAGS & SEARCH
  addTag: (tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const current = get().allTags;
    if (!current.includes(trimmed)) {
      const nextTags = [...current, trimmed];
      set({ allTags: nextTags });
      saveToLocalStorage({ ...get(), allTags: nextTags });
    }
  },

  deleteTag: (tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const nextTags = get().allTags.filter((t) => t !== trimmed);
    const nextVideos = get().videos.map((v) => ({
      ...v,
      tags: v.tags.filter((t) => t !== trimmed),
    }));
    const nextChannels = get().channels.map((c) => ({
      ...c,
      tag: c.tag === trimmed ? '' : c.tag,
    }));
    const nextCategories = get().categories.map((cat) => ({
      ...cat,
      tags: cat.tags.filter((t) => t !== trimmed),
    }));
    const nextPlaylists = get().playlists.map((pl) => ({
      ...pl,
      tags: pl.tags.filter((t) => t !== trimmed),
    }));

    set({
      allTags: nextTags,
      videos: nextVideos,
      channels: nextChannels,
      categories: nextCategories,
      playlists: nextPlaylists,
    });
    saveToLocalStorage({
      ...get(),
      allTags: nextTags,
      videos: nextVideos,
      channels: nextChannels,
      categories: nextCategories,
      playlists: nextPlaylists,
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  // RESET & EXPORT / IMPORT
  resetAllData: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem('ytm_storage_state_v1');
    set({
      channels: [],
      categories: [],
      videos: [],
      playlists: [],
      allTags: [],
    });
  },

  importJsonData: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.channels) && Array.isArray(data.videos)) {
        set({
          channels: data.channels,
          categories: data.categories || [],
          videos: data.videos,
          playlists: data.playlists || [],
          allTags: data.allTags || [],
        });
        saveToLocalStorage(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  exportDataAsJson: () => {
    const data = {
      channels: get().channels,
      categories: get().categories,
      videos: get().videos,
      playlists: get().playlists,
      allTags: get().allTags,
      exportedAt: new Date().toISOString(),
      appName: 'YTM - YouTube Manager',
    };
    return JSON.stringify(data, null, 2);
  },
}));

/**
 * Hook bantuan Fuse.js untuk pencarian fuzzy cepat dan presisi di seluruh data YTM
 */
export function useFuseSearch<T extends Record<string, any>>(items: T[], keys: string[], query: string): T[] {
  if (!query || !query.trim()) return items;
  const fuse = new Fuse(items, {
    keys,
    threshold: 0.35,
    distance: 100,
  });
  return fuse.search(query.trim()).map((result) => result.item);
}
