/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Arsip (ArchivePage)
 * Menampilkan seluruh data yang diarsipkan (Video, Saluran, dan Playlist)
 * secara terpisah dari Halaman Favorit dengan opsi pemulihan (unarchive)
 * dan opsi Hapus Permanen lengkap dengan konfirmasi:
 * - Tab filter: Semua, Video, Saluran, Playlist
 * - Fitur Hapus Permanen data dengan konfirmasi
 * - Filter & Pencarian Fuse.js yang TERSEMBUNYI secara default di balik DataFilterToolbar
 */

import React, { useState, useMemo } from 'react';
import { useYtmStore, useFuseSearch } from '../../store/useYtmStore';
import { ChannelAvatar } from '../../components/ChannelAvatar';
import { DataFilterToolbar } from '../../components/DataFilterToolbar';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { Archive, RotateCcw, PlaySquare, Tv, ListVideo, Trash2 } from 'lucide-react';
import type { RoutePath } from '../../types';

interface ArchivePageProps {
  navigate: (route: RoutePath) => void;
}

export const ArchivePage: React.FC<ArchivePageProps> = ({ navigate }) => {
  const {
    videos,
    channels,
    playlists,
    toggleArchiveVideo,
    toggleArchiveChannel,
    toggleArchivePlaylist,
    deleteVideo,
    deleteChannel,
    deletePlaylist,
  } = useYtmStore();

  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'channels' | 'playlists'>('all');
  const [localSearch, setLocalSearch] = useState<string>('');

  // State Modal Konfirmasi Hapus Permanen
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: 'video' | 'channel' | 'playlist';
  } | null>(null);

  const archivedVideos = useMemo(() => videos.filter((v) => v.isArchived), [videos]);
  const archivedChannels = useMemo(() => channels.filter((c) => c.isArchived), [channels]);
  const archivedPlaylists = useMemo(() => playlists.filter((p) => p.isArchived), [playlists]);

  // Pencarian Fuse.js terhadap item-item arsip
  const searchedVideos = useFuseSearch(archivedVideos, ['title', 'tags', 'channelName'], localSearch);
  const searchedChannels = useFuseSearch(archivedChannels, ['name', 'categories', 'tag'], localSearch);
  const searchedPlaylists = useFuseSearch(archivedPlaylists, ['name', 'categoryName', 'tags'], localSearch);

  const totalArchived = archivedVideos.length + archivedChannels.length + archivedPlaylists.length;
  const filteredArchivedCount = searchedVideos.length + searchedChannels.length + searchedPlaylists.length;

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
      {/* Header Halaman Arsip */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
          <Archive size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Koleksi Arsip</h2>
          <p className="text-[11px] text-neutral-400">
            Daftar seluruh item yang diarsipkan ({totalArchived} item). Anda dapat memulihkannya atau menghapusnya secara permanen.
          </p>
        </div>
      </div>

      {/* Toolbar Filter & Pencarian Fuse.js Tersembunyi */}
      <DataFilterToolbar
        searchQuery={localSearch}
        onSearchChange={(q) => setLocalSearch(q)}
        searchPlaceholder="Cari di koleksi arsip..."
        activeFilterCount={localSearch ? 1 : 0}
        onResetFilters={() => setLocalSearch('')}
      >
        <span className="text-[11px] text-neutral-400">
          Hasil ditemukan: <strong className="text-white">{filteredArchivedCount}</strong> item
        </span>
      </DataFilterToolbar>

      {/* Tab Filter Arsip */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#181818] rounded-xl border border-neutral-800 text-xs w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            activeTab === 'all' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Semua ({totalArchived})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('videos')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            activeTab === 'videos' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Video ({archivedVideos.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('channels')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            activeTab === 'channels' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Saluran ({archivedChannels.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('playlists')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            activeTab === 'playlists' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Playlist ({archivedPlaylists.length})
        </button>
      </div>

      {/* Konten Video yang Diarsipkan */}
      {(activeTab === 'all' || activeTab === 'videos') && searchedVideos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PlaySquare size={16} className="text-[#ff0000]" />
            <h3 className="text-xs font-semibold text-white">Video Terarsip ({searchedVideos.length})</h3>
          </div>
          <div className="space-y-2">
            {searchedVideos.map((vid) => (
              <div
                key={vid.id}
                className="p-3 rounded-xl bg-[#181818] border border-neutral-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-16 sm:w-20 aspect-video rounded-lg object-cover shrink-0 border border-neutral-700"
                  />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white truncate">{vid.title}</h4>
                    <p className="text-[11px] text-neutral-400">{vid.channelName || 'Video'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleArchiveVideo(vid.id)}
                    className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    title="Pulihkan dari Arsip"
                  >
                    <RotateCcw size={12} />
                    <span className="hidden sm:inline">Pulihkan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemToDelete({ id: vid.id, name: vid.title, type: 'video' })}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 transition-colors"
                    title="Hapus Permanen"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Konten Saluran yang Diarsipkan */}
      {(activeTab === 'all' || activeTab === 'channels') && searchedChannels.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tv size={16} className="text-amber-500" />
            <h3 className="text-xs font-semibold text-white">Saluran Terarsip ({searchedChannels.length})</h3>
          </div>
          <div className="space-y-2">
            {searchedChannels.map((ch) => (
              <div
                key={ch.id}
                className="p-3 rounded-xl bg-[#181818] border border-neutral-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ChannelAvatar name={ch.name} avatarUrl={ch.avatarUrl} size="sm" className="w-10 h-10" />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white truncate">{ch.name}</h4>
                    <p className="text-[11px] text-neutral-400">{ch.tag ? `#${ch.tag}` : 'Saluran'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleArchiveChannel(ch.id)}
                    className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    title="Pulihkan dari Arsip"
                  >
                    <RotateCcw size={12} />
                    <span className="hidden sm:inline">Pulihkan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemToDelete({ id: ch.id, name: ch.name, type: 'channel' })}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 transition-colors"
                    title="Hapus Permanen"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Konten Playlist yang Diarsipkan */}
      {(activeTab === 'all' || activeTab === 'playlists') && searchedPlaylists.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ListVideo size={16} className="text-emerald-500" />
            <h3 className="text-xs font-semibold text-white">Playlist Terarsip ({searchedPlaylists.length})</h3>
          </div>
          <div className="space-y-2">
            {searchedPlaylists.map((pl) => (
              <div
                key={pl.id}
                className="p-3 rounded-xl bg-[#181818] border border-neutral-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <h4 className="font-semibold text-white truncate">{pl.name}</h4>
                  <p className="text-[11px] text-neutral-400">{pl.categoryName || 'Playlist'}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleArchivePlaylist(pl.id)}
                    className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    title="Pulihkan dari Arsip"
                  >
                    <RotateCcw size={12} />
                    <span className="hidden sm:inline">Pulihkan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemToDelete({ id: pl.id, name: pl.name, type: 'playlist' })}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 transition-colors"
                    title="Hapus Permanen"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalArchived === 0 && (
        <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800 p-6 space-y-2">
          <Archive size={32} className="mx-auto text-neutral-600" />
          <h4 className="text-sm font-semibold text-white">Tidak ada data terarsip</h4>
          <p className="text-xs text-neutral-400">
            Item yang Anda arsipkan akan tersimpan rapi di sini dan dapat dipulihkan sewaktu-waktu.
          </p>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Permanen */}
      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        title={`Hapus Permanen ${itemToDelete?.type || 'Data'}`}
        itemName={itemToDelete?.name}
        itemType={itemToDelete?.type}
        description="Data ini akan dihapus secara permanen dari basis data dan tidak dapat dipulihkan lagi. Lanjutkan?"
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
};
