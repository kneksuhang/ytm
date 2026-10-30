/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Daftar Kategori (CategoriesPage)
 * Menampilkan seluruh kategori dalam bentuk Gallery / Card:
 * - Ikon kustom dari Iconify
 * - Nama Kategori
 * - Total Video yang berkaitan dengan kategori tersebut
 * - Setiap masing-masing kategori menampilkan preview channel terkait (foto profil & nama)
 * - Fitur Hapus Kategori langsung dengan modal konfirmasi
 * - Filter & Pencarian Fuse.js yang TERSEMBUNYI secara default di balik toggle DataFilterToolbar
 * - Pagination & Skeleton Loading
 * - Klik kartu menuju Halaman Detail Kategori Penuh
 */

import React, { useState, useMemo } from 'react';
import { useYtmStore, useFuseSearch } from '../../store/useYtmStore';
import { Icon } from '@iconify/react';
import { Pagination } from '../../components/Pagination';
import { SkeletonList } from '../../components/SkeletonList';
import { ChannelAvatar } from '../../components/ChannelAvatar';
import { DataFilterToolbar } from '../../components/DataFilterToolbar';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { FolderTree, Plus, ChevronRight, Tv, Trash2, ArrowUpDown } from 'lucide-react';
import type { RoutePath, Category } from '../../types';

interface CategoriesPageProps {
  navigate: (route: RoutePath) => void;
  onOpenAddModal: (type: 'video' | 'channel' | 'category' | 'playlist', itemToEdit?: any) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  navigate,
  onOpenAddModal,
}) => {
  const {
    categories,
    videos,
    channels,
    setActiveCategoryId,
    deleteCategory,
    isLoading,
  } = useYtmStore();

  const [localSearch, setLocalSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'name' | 'total'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // State Modal Konfirmasi Hapus Kategori
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Pencarian Fuse.js
  const searchedCategories = useFuseSearch(categories, ['name', 'tags'], localSearch);

  // Sorting Kategori
  const sortedCategories = useMemo(() => {
    return [...searchedCategories].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'total') {
        const countA = videos.filter((v) => v.categoryId === a.id || v.categoryName?.toLowerCase() === a.name.toLowerCase()).length;
        const countB = videos.filter((v) => v.categoryId === b.id || v.categoryName?.toLowerCase() === b.name.toLowerCase()).length;
        comparison = countA - countB;
      } else {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [searchedCategories, sortBy, sortOrder, videos]);

  const totalPages = Math.ceil(sortedCategories.length / pageSize) || 1;
  const paginatedCategories = sortedCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeFilterCount = (sortBy !== 'updatedAt' || sortOrder !== 'desc' ? 1 : 0);

  const handleResetFilters = () => {
    setSortBy('updatedAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleCategoryClick = (catId: string) => {
    setActiveCategoryId(catId);
    navigate('category-detail');
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    await deleteCategory(categoryToDelete.id);
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header Halaman Kategori & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff0000]/15 text-[#ff0000] flex items-center justify-center">
            <FolderTree size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Kategori</h2>
            <p className="text-[11px] text-neutral-400">
              Kelompokkan saluran dan video YouTube dengan ikon kustom Iconify.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenAddModal('category')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-medium rounded-xl transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus size={15} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Toolbar Filter & Pencarian Fuse.js Tersembunyi */}
      <DataFilterToolbar
        searchQuery={localSearch}
        onSearchChange={(q) => {
          setLocalSearch(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Cari kategori berdasarkan nama atau tag..."
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
              <option value="name">Nama Kategori</option>
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

      {/* Grid Card Kategori */}
      {isLoading ? (
        <SkeletonList type="category" count={8} />
      ) : paginatedCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {paginatedCategories.map((cat) => {
            // Hitung total video yang berkaitan dengan kategori ini
            const relatedVideos = videos.filter(
              (v) => v.categoryId === cat.id || v.categoryName?.toLowerCase() === cat.name.toLowerCase()
            );

            // Channel terkait kategori
            const relatedChannels = channels.filter(
              (ch) =>
                (cat.channelIds && cat.channelIds.includes(ch.id)) ||
                ch.categories.includes(cat.name)
            );

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="p-4 rounded-2xl bg-[#181818] border border-neutral-800 hover:border-neutral-700 hover:bg-[#202020] cursor-pointer transition-all flex flex-col justify-between group space-y-3 relative"
              >
                {/* Tombol Hapus Kategori di Pojok Kanan Atas */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategoryToDelete(cat);
                  }}
                  className="absolute top-3.5 right-3.5 p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                  title="Hapus Kategori"
                >
                  <Trash2 size={14} />
                </button>

                <div>
                  {/* Ikon Kategori Iconify & Nama */}
                  <div className="flex items-start gap-3 pr-6">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 text-[#ff0000] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon icon={cat.icon || 'solar:folder-with-files-bold'} width="22" height="22" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#ff0000] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-neutral-400 tabular-nums">
                        Total Video: <strong className="text-white font-medium">{relatedVideos.length}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Tag Kategori */}
                  {cat.tags && cat.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {cat.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-300">
                          #{tag}
                        </span>
                      ))}
                      {cat.tags.length > 3 && (
                        <span className="text-[10px] text-neutral-500">+{cat.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Saluran Terkait di Dalam Kategori (Foto Profil & Nama Channel) */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <p className="text-[10px] text-neutral-400 font-medium mb-1.5 flex items-center gap-1">
                    <Tv size={11} className="text-amber-500" />
                    <span>Saluran Terkait:</span>
                  </p>
                  {relatedChannels.length > 0 ? (
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {relatedChannels.slice(0, 4).map((ch) => (
                        <div key={ch.id} className="flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded-md border border-neutral-800 text-[10px] text-neutral-300 truncate max-w-[130px]">
                          <ChannelAvatar name={ch.name} avatarUrl={ch.avatarUrl} size="sm" className="w-4 h-4" />
                          <span className="truncate">{ch.name}</span>
                        </div>
                      ))}
                      {relatedChannels.length > 4 && (
                        <span className="text-[10px] text-neutral-500">+{relatedChannels.length - 4}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-neutral-500">Belum ada saluran terkait.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800 p-6 space-y-2">
          <FolderTree size={32} className="mx-auto text-neutral-600" />
          <h4 className="text-sm font-semibold text-white">Tidak ada kategori ditemukan</h4>
          <p className="text-xs text-neutral-400">
            Tambahkan kategori baru untuk mulai mengelompokkan saluran dan video Anda.
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={sortedCategories.length}
      />

      {/* Modal Konfirmasi Hapus Kategori */}
      <DeleteConfirmModal
        isOpen={Boolean(categoryToDelete)}
        title="Hapus Kategori"
        itemName={categoryToDelete?.name}
        itemType="kategori"
        onConfirm={handleConfirmDelete}
        onClose={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
