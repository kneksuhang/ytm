/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Favorit (FavoritesPage)
 * Menampilkan seluruh data yang ditandai Favorit (Video, Saluran, dan Playlist)
 * secara terpisah dari Halaman Arsip sesuai instruksi pengguna:
 * - Tab filter: Semua, Video, Saluran, Playlist
 * - Fitur Hapus data langsung dari daftar favorit dengan konfirmasi
 * - Filter & Pencarian Fuse.js yang TERSEMBUNYI secara default di balik toggle DataFilterToolbar
 * - Navigasi ke halaman detail saat diklik
 */

import React, { useState, useMemo } from 'react';
import { useYtmStore, useFuseSearch } from '../../store/useYtmStore';
import { ProgressRing } from '../../components/ProgressRing';
import { RatingStars } from '../../components/RatingStars';
import { ChannelAvatar } from '../../components/ChannelAvatar';
import { DataFilterToolbar } from '../../components/DataFilterToolbar';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { formatDuration } from '../../lib/youtube';
import { Heart, PlaySquare, Tv, ListVideo, Trash2 } from 'lucide-react';
import type { RoutePath, Video, Channel, Playlist } from '../../types';

interface FavoritesPageProps {
  navigate: (route: RoutePath) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ navigate }) => {
  const {
    videos,
    channels,
    playlists,
    setActiveVideoId,
    setActiveChannelId,
    setActivePlaylistId,
    toggleFavoriteVideo,
    toggleFavoriteChannel,
    toggleFavoritePlaylist,
    deleteVideo,
    deleteChannel,
    deletePlaylist,
  } = useYtmStore();

  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'channels' | 'playlists'>('all');
  const [localSearch, setLocalSearch] = useState<string>('');

  // State Modal Konfirmasi Hapus
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: 'video' | 'channel' | 'playlist';
  } | null>(null);

  const favoriteVideos = useMemo(() => videos.filter((v) => v.isFavorite && !v.isArchived), [videos]);
  const favoriteChannels = useMemo(() => channels.filter((c) => c.isFavorite && !c.isArchived), [channels]);
  const favoritePlaylists = useMemo(() => playlists.filter((p) => p.isFavorite && !p.isArchived), [playlists]);

  // Pencarian Fuse.js di masing-masing koleksi favorit
  const searchedVideos = useFuseSearch(favoriteVideos, ['title', 'tags', 'channelName'], localSearch);
  const searchedChannels = useFuseSearch(favoriteChannels, ['name', 'categories', 'tag'], localSearch);
  const searchedPlaylists = useFuseSearch(favoritePlaylists, ['name', 'categoryName', 'tags'], localSearch);

  const totalCount = favoriteVideos.length + favoriteChannels.length + favoritePlaylists.length;
  const filteredTotalCount = searchedVideos.length + searchedChannels.length + searchedPlaylists.length;

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'video') {
      await deleteVideo(itemToDelete.id);
    } else if (itemToDelete.type === 'channel') {
      await deleteChannel(itemToDelete.id);
    } else if (itemToDelete.type === 'playlist') {
      await deletePlaylist(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header Halaman Favorit */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#ff0000]/15 text-[#ff0000] flex items-center justify-center">
          <Heart size={18} className="fill-[#ff0000]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Koleksi Favorit</h2>
          <p className="text-[11px] text-neutral-400">
            Daftar seluruh item yang Anda sukai ({totalCount} item).
          </p>
        </div>
      </div>

      {/* Toolbar Filter & Pencarian Fuse.js Tersembunyi */}
      <DataFilterToolbar
        searchQuery={localSearch}
        onSearchChange={(q) => setLocalSearch(q)}
        searchPlaceholder="Cari di koleksi favorit..."
        activeFilterCount={localSearch ? 1 : 0}
        onResetFilters={() => setLocalSearch('')}
      >
        <span className="text-[11px] text-neutral-400">
          Hasil ditemukan: <strong className="text-white">{filteredTotalCount}</strong> item
        </span>
      </DataFilterToolbar>

      {/* Tab Filter Kategori Favorit */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#181818] rounded-xl border border-neutral-800 text-xs w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            activeTab === 'all' ? 'bg-[#ff0000] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Semua ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('videos')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            activeTab === 'videos' ? 'bg-[#ff0000] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Video ({favoriteVideos.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('channels')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            activeTab === 'channels' ? 'bg-[#ff0000] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Saluran ({favoriteChannels.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('playlists')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            activeTab === 'playlists' ? 'bg-[#ff0000] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Playlist ({favoritePlaylists.length})
        </button>
      </div>

      {/* Konten Video Favorit */}
      {(activeTab === 'all' || activeTab === 'videos') && searchedVideos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PlaySquare size={16} className="text-[#ff0000]" />
            <h3 className="text-xs font-semibold text-white">Video Favorit ({searchedVideos.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {searchedVideos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => {
                  setActiveVideoId(vid.id);
                  navigate('video-detail');
                }}
                className="rounded-xl bg-[#181818] border border-neutral-800 overflow-hidden hover:border-neutral-700 cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full bg-neutral-900">
                    <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-mono text-white">
                      {formatDuration(vid.durationSeconds)}
                    </div>

                    {/* Tombol Aksi Hapus */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete({ id: vid.id, name: vid.title, type: 'video' });
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-neutral-400 hover:text-red-400 hover:bg-black/90 transition-colors"
                      title="Hapus Video"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className="text-xs font-semibold text-white line-clamp-2 group-hover:text-[#ff0000] transition-colors">{vid.title}</h4>
                    {vid.channelName && <p className="text-[11px] text-neutral-400 truncate">{vid.channelName}</p>}
                  </div>
                </div>
                <div className="p-3 pt-0 flex items-center justify-between border-t border-neutral-800/60 mt-1">
                  <span className="text-[10px] text-neutral-400">{vid.status}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteVideo(vid.id);
                    }}
                    className="text-[#ff0000] p-1 hover:scale-110 transition-transform"
                    title="Batal Favorit"
                  >
                    <Heart size={14} className="fill-[#ff0000]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Konten Saluran Favorit */}
      {(activeTab === 'all' || activeTab === 'channels') && searchedChannels.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tv size={16} className="text-amber-500" />
            <h3 className="text-xs font-semibold text-white">Saluran Favorit ({searchedChannels.length})</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {searchedChannels.map((ch) => (
              <div
                key={ch.id}
                onClick={() => {
                  setActiveChannelId(ch.id);
                  navigate('channel-detail');
                }}
                className="p-3 rounded-xl bg-[#181818] border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all flex flex-col items-center text-center group relative"
              >
                {/* Tombol Hapus */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToDelete({ id: ch.id, name: ch.name, type: 'channel' });
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                  title="Hapus Saluran"
                >
                  <Trash2 size={13} />
                </button>

                <ChannelAvatar name={ch.name} avatarUrl={ch.avatarUrl} size="md" className="group-hover:scale-105 transition-transform" />
                <h4 className="text-xs font-semibold text-white mt-2 truncate w-full group-hover:text-[#ff0000] transition-colors">{ch.name}</h4>
                <div className="mt-1">
                  <RatingStars rating={ch.rating} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Konten Playlist Favorit */}
      {(activeTab === 'all' || activeTab === 'playlists') && searchedPlaylists.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ListVideo size={16} className="text-emerald-500" />
            <h3 className="text-xs font-semibold text-white">Playlist Favorit ({searchedPlaylists.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchedPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => {
                  setActivePlaylistId(pl.id);
                  navigate('playlist-detail');
                }}
                className="p-3.5 rounded-xl bg-[#181818] border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-[#ff0000] transition-colors">{pl.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoritePlaylist(pl.id);
                      }}
                      className="text-[#ff0000] p-1"
                      title="Batal Favorit"
                    >
                      <Heart size={14} className="fill-[#ff0000]" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete({ id: pl.id, name: pl.name, type: 'playlist' });
                      }}
                      className="p-1 rounded-md text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                      title="Hapus Playlist"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {pl.categoryName && <p className="text-[11px] text-neutral-400">Kategori: {pl.categoryName}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {totalCount === 0 && (
        <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800 p-6 space-y-2">
          <Heart size={32} className="mx-auto text-neutral-600" />
          <h4 className="text-sm font-semibold text-white">Belum ada item favorit</h4>
          <p className="text-xs text-neutral-400">
            Tandai ikon hati pada video, saluran, atau playlist untuk menyimpannya di sini.
          </p>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        title={`Hapus ${itemToDelete?.type || 'Data'}`}
        itemName={itemToDelete?.name}
        itemType={itemToDelete?.type}
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
};
