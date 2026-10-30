/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Daftar Saluran YouTube (ChannelsPage)
 * Menampilkan seluruh channel dalam tampilan Gallery / Card berukuran Small:
 * - Foto Profil Channel
 * - Nama Channel & Tag
 * - Tombol Link ke Channel YouTube
 * - Rating (1-5 Bintang)
 * - Fitur Hapus Saluran langsung dari card dengan modal konfirmasi
 * - Filter Kategori, Filter Rating, Pengurutan, dan Pencarian Fuse.js
 *   yang TERSEMBUNYI secara default di balik tombol toggle ringkas
 * - Navigasi ke Halaman Detail Saluran Penuh saat diklik
 */

import React, { useState, useMemo } from 'react';
import { useYtmStore, useFuseSearch } from '../../store/useYtmStore';
import { RatingStars } from '../../components/RatingStars';
import { Pagination } from '../../components/Pagination';
import { SkeletonList } from '../../components/SkeletonList';
import { ChannelAvatar } from '../../components/ChannelAvatar';
import { DataFilterToolbar } from '../../components/DataFilterToolbar';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { ExternalLink, Plus, Filter, ArrowUpDown, Tv, Heart, Trash2 } from 'lucide-react';
import type { RoutePath, Channel } from '../../types';

interface ChannelsPageProps {
  navigate: (route: RoutePath) => void;
  onOpenAddModal: (type: 'video' | 'channel' | 'category' | 'playlist', itemToEdit?: any) => void;
}

export const ChannelsPage: React.FC<ChannelsPageProps> = ({
  navigate,
  onOpenAddModal,
}) => {
  const {
    channels,
    setActiveChannelId,
    toggleFavoriteChannel,
    deleteChannel,
    isLoading,
  } = useYtmStore();

  // State Pencarian Fuse.js, Filter, dan Sortir
  const [localSearch, setLocalSearch] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name' | 'rating'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // State Modal Konfirmasi Hapus Channel
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

  // Filter awal (tidak menampilkan saluran yang diarsipkan di halaman utama)
  const nonArchivedChannels = useMemo(() => {
    return channels.filter((c) => !c.isArchived);
  }, [channels]);

  // Pencarian Fuse.js terhadap nama saluran, kategori, dan tag
  const searchedChannels = useFuseSearch(
    nonArchivedChannels,
    ['name', 'categories', 'tag'],
    localSearch
  );

  // Filter Kategori & Rating
  const filteredChannels = useMemo(() => {
    return searchedChannels.filter((ch) => {
      if (filterCategory !== 'all' && !ch.categories.includes(filterCategory)) {
        return false;
      }
      if (filterRating !== 'all' && ch.rating !== filterRating) {
        return false;
      }
      return true;
    });
  }, [searchedChannels, filterCategory, filterRating]);

  // Pengurutan (Sorting)
  const sortedChannels = useMemo(() => {
    return [...filteredChannels].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating;
      } else {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filteredChannels, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedChannels.length / pageSize) || 1;
  const paginatedChannels = sortedChannels.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Kategori unik untuk opsi filter
  const allAvailableCategories = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((c) => c.categories.forEach((cat) => set.add(cat)));
    return Array.from(set);
  }, [channels]);

  // Hitung filter aktif untuk badge DataFilterToolbar
  const activeFilterCount =
    (filterCategory !== 'all' ? 1 : 0) +
    (filterRating !== 'all' ? 1 : 0) +
    (sortBy !== 'updatedAt' || sortOrder !== 'desc' ? 1 : 0);

  const handleResetFilters = () => {
    setFilterCategory('all');
    setFilterRating('all');
    setSortBy('updatedAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleChannelClick = (channelId: string) => {
    setActiveChannelId(channelId);
    navigate('channel-detail');
  };

  const handleConfirmDelete = async () => {
    if (!channelToDelete) return;
    await deleteChannel(channelToDelete.id);
    setChannelToDelete(null);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header Halaman & Tombol Tambah Saluran */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff0000]/15 text-[#ff0000] flex items-center justify-center">
            <Tv size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Saluran YouTube</h2>
            <p className="text-[11px] text-neutral-400">
              Kelola saluran YouTube tersimpan Anda dalam kartu berukuran ringkas.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenAddModal('channel')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-medium rounded-xl transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus size={15} />
          <span>Tambah Saluran</span>
        </button>
      </div>

      {/* Toolbar Filter, Sortir & Pencarian Fuse.js (Tersembunyi secara Default) */}
      <DataFilterToolbar
        searchQuery={localSearch}
        onSearchChange={(q) => {
          setLocalSearch(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Cari saluran berdasarkan nama, kategori, atau tag..."
        activeFilterCount={activeFilterCount}
        onResetFilters={handleResetFilters}
      >
        {/* Filter Kategori */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 rounded-lg text-neutral-300">
          <Filter size={12} className="text-neutral-500" />
          <span className="text-[11px] text-neutral-400">Kategori:</span>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-white focus:outline-none text-xs"
          >
            <option value="all">Semua Kategori</option>
            {allAvailableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Rating */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 rounded-lg text-neutral-300">
          <span className="text-[11px] text-neutral-400">Rating:</span>
          <select
            value={filterRating}
            onChange={(e) => {
              setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-transparent text-white focus:outline-none text-xs"
          >
            <option value="all">Semua Rating</option>
            <option value="5">5 Bintang</option>
            <option value="4">4 Bintang</option>
            <option value="3">3 Bintang</option>
            <option value="2">2 Bintang</option>
            <option value="1">1 Bintang</option>
          </select>
        </div>

        {/* Pengurutan */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 rounded-lg text-neutral-300">
            <ArrowUpDown size={12} className="text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white focus:outline-none text-xs"
            >
              <option value="updatedAt">Terakhir di edit</option>
              <option value="name">Nama Saluran</option>
              <option value="rating">Rating</option>
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

      {/* Daftar Saluran Tampilan Gallery / Card Berukuran Small */}
      {isLoading ? (
        <SkeletonList type="channel" count={10} />
      ) : paginatedChannels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {paginatedChannels.map((ch) => (
            <div
              key={ch.id}
              onClick={() => handleChannelClick(ch.id)}
              className="p-3 rounded-2xl bg-[#181818] border border-neutral-800 hover:border-neutral-700 hover:bg-[#202020] cursor-pointer transition-all flex flex-col items-center text-center group relative"
            >
              {/* Tombol Aksi Cepat Favorit & Hapus */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteChannel(ch.id);
                  }}
                  className={`p-1 rounded-full hover:bg-neutral-800 transition-colors ${
                    ch.isFavorite ? 'text-[#ff0000]' : 'text-neutral-500 hover:text-white'
                  }`}
                  title={ch.isFavorite ? 'Hapus Favorit' : 'Tandai Favorit'}
                >
                  <Heart size={13} className={ch.isFavorite ? 'fill-[#ff0000]' : ''} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChannelToDelete(ch);
                  }}
                  className="p-1 rounded-full text-neutral-500 hover:text-red-400 hover:bg-red-950/60 transition-colors"
                  title="Hapus Saluran"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Foto Profil Saluran */}
              <ChannelAvatar name={ch.name} avatarUrl={ch.avatarUrl} size="md" className="w-14 h-14 group-hover:scale-105 transition-transform" />

              {/* Nama Channel */}
              <h4 className="text-xs font-semibold text-white mt-2 truncate w-full group-hover:text-[#ff0000] transition-colors">
                {ch.name}
              </h4>

              {/* Rating Bintang */}
              <div className="mt-1">
                <RatingStars rating={ch.rating} size="sm" />
              </div>

              {/* Tag Saluran */}
              {ch.tag && (
                <span className="mt-1.5 text-[10px] text-neutral-400 truncate max-w-full">
                  #{ch.tag}
                </span>
              )}

              {/* Tombol Link Eksternal ke YouTube */}
              {ch.link && (
                <a
                  href={ch.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <ExternalLink size={10} />
                  <span>Kunjungi</span>
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800 p-6 space-y-2">
          <Tv size={32} className="mx-auto text-neutral-600" />
          <h4 className="text-sm font-semibold text-white">Tidak ada saluran ditemukan</h4>
          <p className="text-xs text-neutral-400">
            Coba ubah kata kunci pencarian atau tambahkan saluran baru.
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={sortedChannels.length}
      />

      {/* Modal Dialog Konfirmasi Hapus Saluran */}
      <DeleteConfirmModal
        isOpen={Boolean(channelToDelete)}
        title="Hapus Saluran"
        itemName={channelToDelete?.name}
        itemType="channel"
        onConfirm={handleConfirmDelete}
        onClose={() => setChannelToDelete(null)}
      />
    </div>
  );
};
