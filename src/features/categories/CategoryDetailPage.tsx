/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Detail Kategori Penuh (CategoryDetailPage)
 * Menampilkan detail lengkap kategori:
 * - Ikon Iconify, nama kategori, tags, total video
 * - Fitur Hapus Kategori dengan modal konfirmasi
 * - Daftar channels terkait dengan tampilan gallery/card foto profile dan nama channel
 * - Daftar video dalam kategori dengan thumbnail, durasi, progress ring, status
 * - Fitur Hapus Video dalam kategori
 * - Filter & Pencarian Fuse.js tersembunyi
 * - Pagination & Skeleton
 */

import React, { useState, useMemo } from 'react';
import { useYtmStore, useFuseSearch } from '../../store/useYtmStore';
import { Icon } from '@iconify/react';
import { ProgressRing } from '../../components/ProgressRing';
import { RatingStars } from '../../components/RatingStars';
import { Pagination } from '../../components/Pagination';
import { SkeletonList } from '../../components/SkeletonList';
import { ChannelAvatar } from '../../components/ChannelAvatar';
import { DataFilterToolbar } from '../../components/DataFilterToolbar';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { formatDuration } from '../../lib/youtube';
import { ArrowLeft, Edit2, Tv, PlaySquare, Trash2, Filter } from 'lucide-react';
import type { RoutePath, Video } from '../../types';

interface CategoryDetailPageProps {
  navigate: (route: RoutePath) => void;
  onOpenEditModal: (type: 'category', item: any) => void;
}

export const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  navigate,
  onOpenEditModal,
}) => {
  const {
    categories,
    channels,
    videos,
    activeCategoryId,
    setActiveChannelId,
    setActiveVideoId,
    deleteCategory,
    deleteVideo,
    isLoading,
  } = useYtmStore();

  const category = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId) || categories[0];
  }, [categories, activeCategoryId]);

  const [localSearch, setLocalSearch] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // State Modal Konfirmasi Hapus
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

  // Channel terkait kategori
  const relatedChannels = useMemo(() => {
    if (!category) return [];
    return channels.filter(
      (ch) =>
        (category.channelIds && category.channelIds.includes(ch.id)) ||
        ch.categories.includes(category.name)
    );
  }, [channels, category]);

  // Video terkait kategori
  const relatedVideos = useMemo(() => {
    if (!category) return [];
    return videos.filter(
      (v) =>
        v.categoryId === category.id ||
        v.categoryName?.toLowerCase() === category.name.toLowerCase()
    );
  }, [videos, category]);

  // Pencarian Fuse.js terhadap video kategori
  const searchedVideos = useFuseSearch(relatedVideos, ['title', 'tags', 'channelName'], localSearch);

  // Filter Status
  const filteredVideos = useMemo(() => {
    return searchedVideos.filter((v) => {
      if (filterStatus !== 'all' && v.status !== filterStatus) return false;
      return true;
    });
  }, [searchedVideos, filterStatus]);

  const totalPages = Math.ceil(filteredVideos.length / pageSize) || 1;
  const paginatedVideos = filteredVideos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeFilterCount = (filterStatus !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setFilterStatus('all');
    setCurrentPage(1);
  };

  const handleChannelClick = (channelId: string) => {
    setActiveChannelId(channelId);
    navigate('channel-detail');
  };

  const handleVideoClick = (videoId: string) => {
    setActiveVideoId(videoId);
    navigate('video-detail');
  };

  const handleConfirmDeleteCategory = async () => {
    if (!category) return;
    await deleteCategory(category.id);
    setIsDeleteCategoryOpen(false);
    navigate('categories');
  };

  const handleConfirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    await deleteVideo(videoToDelete.id);
    setVideoToDelete(null);
  };

  if (!category) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm text-neutral-400">Kategori tidak ditemukan.</p>
        <button
          type="button"
          onClick={() => navigate('categories')}
          className="px-4 py-2 bg-neutral-800 rounded-lg text-xs text-white"
        >
          Kembali ke Daftar Kategori
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Tombol Kembali */}
      <button
        type="button"
        onClick={() => navigate('categories')}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Kategori</span>
      </button>

      {/* Header Detail Kategori Penuh */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#181818] border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-800 text-[#ff0000] flex items-center justify-center shrink-0 border border-neutral-700 shadow-md">
              <Icon icon={category.icon || 'solar:folder-with-files-bold'} width="32" height="32" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {category.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                <span className="tabular-nums">{relatedVideos.length} Video</span>
                <span>·</span>
                <span className="tabular-nums">{relatedChannels.length} Saluran</span>
              </div>
              {category.tags && category.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {category.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onOpenEditModal('category', category)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
            >
              <Edit2 size={13} />
              <span>Ubah Kategori</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteCategoryOpen(true)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 transition-colors"
              title="Hapus Kategori"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Saluran dalam Kategori */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tv size={17} className="text-[#ff0000]" />
          <h3 className="text-sm font-semibold text-white">
            Saluran Terkait ({relatedChannels.length})
          </h3>
        </div>

        {relatedChannels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {relatedChannels.map((ch) => (
              <div
                key={ch.id}
                onClick={() => handleChannelClick(ch.id)}
                className="p-3 rounded-xl bg-[#181818] border border-neutral-800 hover:border-neutral-700 hover:bg-[#202020] cursor-pointer transition-all flex flex-col items-center text-center group"
              >
                <ChannelAvatar name={ch.name} avatarUrl={ch.avatarUrl} size="md" className="group-hover:scale-105 transition-transform" />
                <h4 className="text-xs font-semibold text-white mt-2 truncate w-full group-hover:text-[#ff0000] transition-colors">
                  {ch.name}
                </h4>
                <div className="mt-1">
                  <RatingStars rating={ch.rating} size="sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400">
            Belum ada saluran yang dikaitkan ke kategori ini.
          </div>
        )}
      </div>

      {/* 2. Video dalam Kategori dengan Filter & Pencarian Fuse.js Tersembunyi */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlaySquare size={17} className="text-[#ff0000]" />
            <h3 className="text-sm font-semibold text-white">
              Video dalam Kategori ({relatedVideos.length})
            </h3>
          </div>
        </div>

        {/* Toolbar Filter & Pencarian Tersembunyi */}
        <DataFilterToolbar
          searchQuery={localSearch}
          onSearchChange={(q) => {
            setLocalSearch(q);
            setCurrentPage(1);
          }}
          searchPlaceholder="Cari video dalam kategori ini..."
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
        >
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 rounded-lg text-neutral-300">
            <Filter size={12} className="text-neutral-500" />
            <span className="text-[11px] text-neutral-400">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white focus:outline-none text-xs"
            >
              <option value="all">Semua Status</option>
              <option value="To Watch">To Watch</option>
              <option value="Watching">Watching</option>
              <option value="Watched">Watched</option>
            </select>
          </div>
        </DataFilterToolbar>

        {isLoading ? (
          <SkeletonList type="card" count={4} />
        ) : paginatedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {paginatedVideos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => handleVideoClick(vid.id)}
                className="rounded-xl bg-[#181818] border border-neutral-800 overflow-hidden hover:border-neutral-700 cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full bg-neutral-900">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-mono text-white tabular-nums">
                      {formatDuration(vid.durationSeconds)}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoToDelete(vid);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-neutral-400 hover:text-red-400 hover:bg-black/90 transition-colors"
                      title="Hapus Video"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="p-3 space-y-1.5">
                    <h4 className="text-xs font-semibold text-white line-clamp-2 group-hover:text-[#ff0000] transition-colors">
                      {vid.title}
                    </h4>
                    {vid.channelName && (
                      <p className="text-[11px] text-neutral-400 truncate">{vid.channelName}</p>
                    )}
                  </div>
                </div>

                <div className="p-3 pt-0 flex items-center justify-between border-t border-neutral-800/60 mt-1">
                  <span className="text-[10px] text-neutral-400">{vid.status}</span>
                  <ProgressRing
                    durationSeconds={vid.durationSeconds}
                    timestampSeconds={vid.timestampSeconds}
                    status={vid.status}
                    size="sm"
                    showLabel={false}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-neutral-900/40 rounded-xl border border-neutral-800 text-xs text-neutral-400">
            Tidak ada video yang cocok dengan filter.
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={filteredVideos.length}
        />
      </div>

      {/* Modal Konfirmasi Hapus Kategori */}
      <DeleteConfirmModal
        isOpen={isDeleteCategoryOpen}
        title="Hapus Kategori"
        itemName={category.name}
        itemType="kategori"
        onConfirm={handleConfirmDeleteCategory}
        onClose={() => setIsDeleteCategoryOpen(false)}
      />

      {/* Modal Konfirmasi Hapus Video */}
      <DeleteConfirmModal
        isOpen={Boolean(videoToDelete)}
        title="Hapus Video"
        itemName={videoToDelete?.title}
        itemType="video"
        onConfirm={handleConfirmDeleteVideo}
        onClose={() => setVideoToDelete(null)}
      />
    </div>
  );
};
