/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Daftar Playlist (PlaylistsPage)
 * Menampilkan seluruh playlist dalam format List dan Tabel yang responsif di mobile:
 * - Nama Playlist, Kategori, Total Video
 * - Watched Progress: Bar berwarna + angka + persen
 * - Fitur Hapus Playlist dengan modal konfirmasi
 * - Filter & Pencarian Fuse.js yang TERSEMBUNYI secara default di balik toggle DataFilterToolbar
 * - Toggle tampilan List vs Table
 * - Pagination & Skeleton Loading
 * - Klik item menuju Halaman Detail Playlist Penuh
 */

import React, { useState, useMemo } from 'react';
import { useYtmStore, useFuseSearch } from '../../store/useYtmStore';
import { Pagination } from '../../components/Pagination';
import { SkeletonList } from '../../components/SkeletonList';
import { DataFilterToolbar } from '../../components/DataFilterToolbar';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import {
  ListVideo,
  Plus,
  Table as TableIcon,
  List as ListIcon,
  BarChart2,
  ChevronRight,
  Heart,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';
import type { RoutePath, Playlist } from '../../types';

interface PlaylistsPageProps {
  navigate: (route: RoutePath) => void;
  onOpenAddModal: (type: 'video' | 'channel' | 'category' | 'playlist', itemToEdit?: any) => void;
}

export const PlaylistsPage: React.FC<PlaylistsPageProps> = ({
  navigate,
  onOpenAddModal,
}) => {
  const {
    playlists,
    videos,
    setActivePlaylistId,
    toggleFavoritePlaylist,
    deletePlaylist,
    isLoading,
  } = useYtmStore();

  const [localSearch, setLocalSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name' | 'total'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // State Modal Konfirmasi Hapus Playlist
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);

  const nonArchivedPlaylists = useMemo(() => {
    return playlists.filter((p) => !p.isArchived);
  }, [playlists]);

  // Pencarian Fuse.js
  const searchedPlaylists = useFuseSearch(
    nonArchivedPlaylists,
    ['name', 'categoryName', 'tags'],
    localSearch
  );

  // Sorting Playlist
  const sortedPlaylists = useMemo(() => {
    return [...searchedPlaylists].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'total') {
        comparison = (a.videoIds?.length || 0) - (b.videoIds?.length || 0);
      } else {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [searchedPlaylists, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedPlaylists.length / pageSize) || 1;
  const paginatedPlaylists = sortedPlaylists.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeFilterCount = (sortBy !== 'updatedAt' || sortOrder !== 'desc' ? 1 : 0);

  const handleResetFilters = () => {
    setSortBy('updatedAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handlePlaylistClick = (playlistId: string) => {
    setActivePlaylistId(playlistId);
    navigate('playlist-detail');
  };

  const handleConfirmDelete = async () => {
    if (!playlistToDelete) return;
    await deletePlaylist(playlistToDelete.id);
    setPlaylistToDelete(null);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header Halaman Playlist */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff0000]/15 text-[#ff0000] flex items-center justify-center">
            <ListVideo size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Daftar Putar (Playlist)</h2>
            <p className="text-[11px] text-neutral-400">
              Kelola koleksi playlist video lengkap dengan ringkasan status tontonan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Toggle List vs Table */}
          <div className="flex items-center bg-[#181818] p-0.5 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Tampilan Daftar / List"
            >
              <ListIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenAddModal('playlist')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span>Tambah Playlist</span>
          </button>
        </div>
      </div>

      {/* Toolbar Filter & Pencarian Fuse.js Tersembunyi */}
      <DataFilterToolbar
        searchQuery={localSearch}
        onSearchChange={(q) => {
          setLocalSearch(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Cari playlist berdasarkan nama, kategori, atau tag..."
        activeFilterCount={activeFilterCount}
        onResetFilters={handleResetFilters}
      >
        {/* Kontrol Pengurutan */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 rounded-lg text-neutral-300">
            <ArrowUpDown size={12} className="text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white focus:outline-none text-xs"
            >
              <option value="updatedAt">Terakhir di edit</option>
              <option value="name">Nama Playlist</option>
              <option value="total">Total Video</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 bg-neutral-900 border border-neutral-700/80 rounded-lg text-neutral-300 hover:text-white text-xs"
            title={sortOrder === 'asc' ? 'Urutan Naik (A-Z)' : 'Urutan Turun (Z-A)'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </DataFilterToolbar>

      {/* Konten Playlist (List vs Table Responsif) */}
      {isLoading ? (
        <SkeletonList type="row" count={6} />
      ) : paginatedPlaylists.length > 0 ? (
        viewMode === 'list' ? (
          /* Tampilan List Responsif */
          <div className="space-y-3">
            {paginatedPlaylists.map((pl) => {
              const plVideos = videos.filter((v) => pl.videoIds && pl.videoIds.includes(v.id));
              const total = plVideos.length;
              const watched = plVideos.filter((v) => v.status === 'Watched').length;
              const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

              return (
                <div
                  key={pl.id}
                  onClick={() => handlePlaylistClick(pl.id)}
                  className="p-4 rounded-2xl bg-[#181818] border border-neutral-800 hover:border-neutral-700 hover:bg-[#202020] cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-neutral-800 text-[#ff0000] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <ListVideo size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-[#ff0000] transition-colors truncate">
                          {pl.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                          {pl.categoryName && <span>{pl.categoryName}</span>}
                          {pl.categoryName && <span>·</span>}
                          <span className="tabular-nums">{total} Video</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoritePlaylist(pl.id);
                        }}
                        className={`p-1.5 rounded-lg hover:bg-neutral-800 transition-colors ${
                          pl.isFavorite ? 'text-[#ff0000]' : 'text-neutral-500 hover:text-white'
                        }`}
                        title="Favorit"
                      >
                        <Heart size={14} className={pl.isFavorite ? 'fill-[#ff0000]' : ''} />
                      </button>

                      {/* Tombol Hapus Playlist */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaylistToDelete(pl);
                        }}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/60 transition-colors"
                        title="Hapus Playlist"
                      >
                        <Trash2 size={14} />
                      </button>

                      <ChevronRight size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  {/* Watched Progress: Bar Berwarna + Angka + Persen */}
                  <div className="space-y-1 pt-1 border-t border-neutral-800/80">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <BarChart2 size={12} className="text-emerald-500" />
                        <span>Watched:</span>
                      </span>
                      <span className="font-mono text-emerald-400 tabular-nums">
                        {watched} / {total} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Tampilan Tabel Responsif Ala YouTube */
          <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-[#181818]">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800 select-none">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama Playlist</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold text-center">Total Video</th>
                  <th className="px-4 py-3 font-semibold min-w-[180px]">Watched Progress</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {paginatedPlaylists.map((pl) => {
                  const plVideos = videos.filter((v) => pl.videoIds && pl.videoIds.includes(v.id));
                  const total = plVideos.length;
                  const watched = plVideos.filter((v) => v.status === 'Watched').length;
                  const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

                  return (
                    <tr
                      key={pl.id}
                      onClick={() => handlePlaylistClick(pl.id)}
                      className="hover:bg-neutral-850/60 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-white truncate max-w-[200px]">
                        {pl.name}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 truncate max-w-[150px]">
                        {pl.categoryName || '-'}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums font-medium text-white">
                        {total}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-neutral-400 font-mono tabular-nums">
                            <span>{watched}/{total}</span>
                            <span className="text-emerald-400 font-bold">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setPlaylistToDelete(pl)}
                            className="p-1 rounded-md text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                            title="Hapus Playlist"
                          >
                            <Trash2 size={13} />
                          </button>
                          <ChevronRight size={16} className="text-neutral-500" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800 p-6 space-y-2">
          <ListVideo size={32} className="mx-auto text-neutral-600" />
          <h4 className="text-sm font-semibold text-white">Tidak ada playlist ditemukan</h4>
          <p className="text-xs text-neutral-400">
            Buat playlist baru untuk mengorganisir video favorit Anda.
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={sortedPlaylists.length}
      />

      {/* Modal Dialog Konfirmasi Hapus Playlist */}
      <DeleteConfirmModal
        isOpen={Boolean(playlistToDelete)}
        title="Hapus Playlist"
        itemName={playlistToDelete?.name}
        itemType="playlist"
        onConfirm={handleConfirmDelete}
        onClose={() => setPlaylistToDelete(null)}
      />
    </div>
  );
};
