/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Detail Saluran Penuh (ChannelDetailPage)
 * Menampilkan rincian channel secara lengkap (bukan modal):
 * - Foto profil, nama channel, rating, kategori, tag, link ke YouTube
 * - Fitur Hapus Saluran dengan modal konfirmasi
 * - Daftar video dalam channel dengan tombol toggle Gallery/Card vs List
 * - Fitur Hapus Video dalam channel
 * - Filter status tontonan, Sortir, dan Pencarian Fuse.js
 *   yang TERSEMBUNYI secara default di balik tombol toggle
 * - Pagination dan Skeleton
 */

import React, { useState, useMemo } from 'react';
import { useYtmStore, useFuseSearch } from '../../store/useYtmStore';
import { RatingStars } from '../../components/RatingStars';
import { ProgressRing } from '../../components/ProgressRing';
import { Pagination } from '../../components/Pagination';
import { SkeletonList } from '../../components/SkeletonList';
import { ChannelAvatar } from '../../components/ChannelAvatar';
import { DataFilterToolbar } from '../../components/DataFilterToolbar';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { formatDuration } from '../../lib/youtube';
import {
  ArrowLeft,
  ExternalLink,
  Edit2,
  Heart,
  Archive,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  PlaySquare,
  Trash2,
} from 'lucide-react';
import type { RoutePath, Video } from '../../types';

interface ChannelDetailPageProps {
  navigate: (route: RoutePath) => void;
  onOpenEditModal: (type: 'channel', item: any) => void;
}

export const ChannelDetailPage: React.FC<ChannelDetailPageProps> = ({
  navigate,
  onOpenEditModal,
}) => {
  const {
    channels,
    videos,
    activeChannelId,
    setActiveVideoId,
    toggleFavoriteChannel,
    toggleArchiveChannel,
    deleteChannel,
    deleteVideo,
    isLoading,
  } = useYtmStore();

  const channel = useMemo(() => {
    return channels.find((c) => c.id === activeChannelId) || channels[0];
  }, [channels, activeChannelId]);

  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [channelSearch, setChannelSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title' | 'rating'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // State Modal Konfirmasi Hapus Channel & Video
  const [isDeleteChannelOpen, setIsDeleteChannelOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

  // Video-video yang terhubung ke channel ini
  const channelVideos = useMemo(() => {
    if (!channel) return [];
    return videos.filter(
      (v) =>
        (channel.videoIds && channel.videoIds.includes(v.id)) ||
        v.channelId === channel.id ||
        v.channelName?.toLowerCase() === channel.name.toLowerCase()
    );
  }, [videos, channel]);

  // Pencarian Fuse.js dalam video channel
  const searchedVideos = useFuseSearch(channelVideos, ['title', 'tags'], channelSearch);

  // Filter Status
  const filteredVideos = useMemo(() => {
    return searchedVideos.filter((v) => {
      if (filterStatus !== 'all' && v.status !== filterStatus) return false;
      return true;
    });
  }, [searchedVideos, filterStatus]);

  // Sorting Video
  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating;
      } else {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filteredVideos, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedVideos.length / pageSize) || 1;
  const paginatedVideos = sortedVideos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeFilterCount =
    (filterStatus !== 'all' ? 1 : 0) +
    (sortBy !== 'updatedAt' || sortOrder !== 'desc' ? 1 : 0);

  const handleResetFilters = () => {
    setFilterStatus('all');
    setSortBy('updatedAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleVideoClick = (videoId: string) => {
    setActiveVideoId(videoId);
    navigate('video-detail');
  };

  const handleConfirmDeleteChannel = async () => {
    if (!channel) return;
    await deleteChannel(channel.id);
    setIsDeleteChannelOpen(false);
    navigate('channels');
  };

  const handleConfirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    await deleteVideo(videoToDelete.id);
    setVideoToDelete(null);
  };

  if (!channel) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm text-neutral-400">Saluran tidak ditemukan.</p>
        <button
          type="button"
          onClick={() => navigate('channels')}
          className="px-4 py-2 bg-neutral-800 rounded-lg text-xs text-white"
        >
          Kembali ke Daftar Saluran
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Tombol Navigasi Kembali */}
      <button
        type="button"
        onClick={() => navigate('channels')}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Saluran</span>
      </button>

      {/* Banner / Header Detail Saluran Penuh */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#181818] border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ChannelAvatar name={channel.name} avatarUrl={channel.avatarUrl} size="lg" className="w-16 h-16 sm:w-20 sm:h-20 shadow-lg" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {channel.name}
                </h1>
                {channel.isFavorite && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff0000]/15 text-[#ff0000] font-medium">
                    Favorit
                  </span>
                )}
                {channel.isArchived && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                    Arsip
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <RatingStars rating={channel.rating} size="md" />
                <span className="text-xs text-neutral-400 tabular-nums">({channel.rating} / 5)</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pt-0.5">
                {channel.categories.map((cat) => (
                  <span key={cat} className="text-neutral-300">
                    {cat}
                  </span>
                ))}
                {channel.tag && (
                  <>
                    <span>·</span>
                    <span className="text-[#ff0000]">#{channel.tag}</span>
                  </>
                )}
                <span>·</span>
                <span className="tabular-nums">{channelVideos.length} video</span>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Saluran */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {channel.link && (
              <a
                href={channel.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <ExternalLink size={13} />
                <span>Buka YouTube</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => onOpenEditModal('channel', channel)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Ubah Saluran"
            >
              <Edit2 size={15} />
            </button>

            <button
              type="button"
              onClick={() => toggleFavoriteChannel(channel.id)}
              className={`p-2 rounded-xl transition-colors ${
                channel.isFavorite ? 'bg-[#ff0000]/20 text-[#ff0000]' : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Favorit"
            >
              <Heart size={15} className={channel.isFavorite ? 'fill-[#ff0000]' : ''} />
            </button>

            <button
              type="button"
              onClick={() => toggleArchiveChannel(channel.id)}
              className={`p-2 rounded-xl transition-colors ${
                channel.isArchived ? 'bg-amber-500/20 text-amber-500' : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Arsip"
            >
              <Archive size={15} />
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteChannelOpen(true)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 transition-colors"
              title="Hapus Saluran"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Bagian Daftar Video Saluran */}
      <div className="space-y-4">
        {/* Header Bagian Video & Toggle Tampilan Gallery vs List */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlaySquare size={17} className="text-[#ff0000]" />
            <h3 className="text-sm font-semibold text-white">
              Daftar Video di Saluran Ini ({channelVideos.length})
            </h3>
          </div>

          <div className="flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-700/80">
            <button
              type="button"
              onClick={() => setViewMode('gallery')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'gallery' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Tampilan Galeri / Kartu"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Tampilan Daftar / List"
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Toolbar Filter, Sortir & Pencarian Fuse.js Tersembunyi */}
        <DataFilterToolbar
          searchQuery={channelSearch}
          onSearchChange={(q) => {
            setChannelSearch(q);
            setCurrentPage(1);
          }}
          searchPlaceholder="Cari video di saluran ini..."
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
        >
          {/* Filter Status */}
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

          {/* Sortir Video */}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 rounded-lg text-neutral-300">
              <ArrowUpDown size={12} className="text-neutral-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white focus:outline-none text-xs"
              >
                <option value="updatedAt">Terakhir di edit</option>
                <option value="title">Judul Video</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 bg-neutral-900 border border-neutral-700/80 rounded-lg text-neutral-300 hover:text-white text-xs"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </DataFilterToolbar>

        {/* Tampilan Konten Video (Gallery vs List) */}
        {isLoading ? (
          <SkeletonList type={viewMode === 'gallery' ? 'card' : 'row'} count={6} />
        ) : paginatedVideos.length > 0 ? (
          viewMode === 'gallery' ? (
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

                      {/* Tombol Hapus Cepat */}
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
                      <RatingStars rating={vid.rating} size="sm" />
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
            <div className="space-y-2">
              {paginatedVideos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => handleVideoClick(vid.id)}
                  className="p-3 rounded-xl bg-[#181818] border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-20 sm:w-24 aspect-video rounded-lg object-cover shrink-0 border border-neutral-700"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-[#ff0000] transition-colors">
                        {vid.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <RatingStars rating={vid.rating} size="sm" />
                        <span className="text-[11px] text-neutral-400">{vid.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <ProgressRing
                      durationSeconds={vid.durationSeconds}
                      timestampSeconds={vid.timestampSeconds}
                      status={vid.status}
                      size="sm"
                      showLabel={true}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoToDelete(vid);
                      }}
                      className="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                      title="Hapus Video"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="p-8 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800 space-y-2">
            <PlaySquare size={28} className="mx-auto text-neutral-600" />
            <p className="text-xs text-neutral-400">Tidak ada video di saluran ini yang cocok dengan pencarian atau filter.</p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={sortedVideos.length}
        />
      </div>

      {/* Modal Konfirmasi Hapus Saluran */}
      <DeleteConfirmModal
        isOpen={isDeleteChannelOpen}
        title="Hapus Saluran"
        itemName={channel.name}
        itemType="channel"
        onConfirm={handleConfirmDeleteChannel}
        onClose={() => setIsDeleteChannelOpen(false)}
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
