/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Detail Video Penuh (VideoDetailPage)
 * Menampilkan rincian penuh video YouTube (bukan modal):
 * - Player YouTube tersemat atau penampil interaktif
 * - Pengubah status tontonan (To Watch / Watching / Watched)
 * - Pembaruan timestamp dan durasi dengan Progress Ring
 * - Penilaian Bintang, Tag, Saluran, Kategori, Playlist
 * - Aksi Favorit, Arsip, dan Edit
 */

import React, { useState, useMemo } from 'react';
import { useYtmStore } from '../../store/useYtmStore';
import { ProgressRing } from '../../components/ProgressRing';
import { RatingStars } from '../../components/RatingStars';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { formatDuration } from '../../lib/youtube';
import {
  ArrowLeft,
  ExternalLink,
  Edit2,
  Heart,
  Archive,
  Tv,
  ListVideo,
  FolderTree,
  Calendar,
  CheckCircle2,
  Play,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { RoutePath, VideoStatus } from '../../types';

interface VideoDetailPageProps {
  navigate: (route: RoutePath) => void;
  onOpenEditModal: (type: 'video', item: any) => void;
}

export const VideoDetailPage: React.FC<VideoDetailPageProps> = ({
  navigate,
  onOpenEditModal,
}) => {
  const {
    videos,
    activeVideoId,
    updateVideoProgress,
    toggleFavoriteVideo,
    toggleArchiveVideo,
    deleteVideo,
    setActiveChannelId,
    setActivePlaylistId,
    setActiveCategoryId,
  } = useYtmStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const video = useMemo(() => {
    return videos.find((v) => v.id === activeVideoId) || videos[0];
  }, [videos, activeVideoId]);

  if (!video) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm text-neutral-400">Video tidak ditemukan.</p>
        <button
          type="button"
          onClick={() => navigate('videos')}
          className="px-4 py-2 bg-neutral-800 rounded-lg text-xs text-white"
        >
          Kembali ke Daftar Video
        </button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: VideoStatus) => {
    let nextTimestamp = video.timestampSeconds;
    if (newStatus === 'Watched') {
      nextTimestamp = video.durationSeconds;
    } else if (newStatus === 'To Watch') {
      nextTimestamp = 0;
    }
    updateVideoProgress(video.id, nextTimestamp, newStatus);
  };

  const handleSeek = (newSeconds: number) => {
    const clamped = Math.max(0, Math.min(video.durationSeconds, newSeconds));
    updateVideoProgress(video.id, clamped);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Tombol Navigasi Kembali */}
      <button
        type="button"
        onClick={() => navigate('videos')}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Video</span>
      </button>

      {/* Kontainer Video Player YouTube Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Player & Kontrol Timestamp */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-xl">
            {video.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Bar Kontrol Timestamp & Video Progress Ring */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Progres Tontonan Video</span>
              <ProgressRing
                durationSeconds={video.durationSeconds}
                timestampSeconds={video.timestampSeconds}
                status={video.status}
                size="md"
                showLabel={true}
              />
            </div>

            {/* Slider Posisi Tonton */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={video.durationSeconds || 100}
                value={video.timestampSeconds || 0}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 accent-[#ff0000] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-neutral-400 tabular-nums">
                <span>{formatDuration(video.timestampSeconds)}</span>
                <span>{formatDuration(video.durationSeconds)}</span>
              </div>
            </div>

            {/* Tombol Aksi Cepat Timestamp */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => handleSeek(video.timestampSeconds + 60)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                +1 Menit
              </button>
              <button
                type="button"
                onClick={() => handleSeek(video.timestampSeconds + 300)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                +5 Menit
              </button>
              <button
                type="button"
                onClick={() => handleSeek(0)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Mulai Dari Awal"
              >
                <RotateCcw size={12} />
                <span>Ulang</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('Watched')}
                className="ml-auto px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 size={13} />
                <span>Tandai Selesai</span>
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Metadata, Status Picker, Relasi & Aksi */}
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#181818] border border-neutral-800 space-y-4">
            {/* Judul & Status */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  video.status === 'Watched'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/70'
                    : video.status === 'Watching'
                    ? 'bg-amber-950/80 text-amber-400 border border-amber-800/70'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {video.status}
                </span>

                {video.isFavorite && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff0000]/15 text-[#ff0000] font-medium">
                    Favorit
                  </span>
                )}
                {video.isArchived && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                    Arsip
                  </span>
                )}
              </div>

              <h1 className="text-base sm:text-lg font-bold text-white leading-snug">
                {video.title}
              </h1>
            </div>

            {/* Pilihan 3 Status Cepat */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1.5">Ubah Status Tontonan:</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['To Watch', 'Watching', 'Watched'] as VideoStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`py-1.5 rounded-lg border text-center transition-colors ${
                      video.status === st
                        ? 'border-[#ff0000] bg-[#ff0000]/15 text-white font-medium'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Stars */}
            <div className="pt-2 border-t border-neutral-800">
              <span className="block text-[11px] text-neutral-400 mb-1">Penilaian Rating:</span>
              <div className="flex items-center gap-2">
                <RatingStars rating={video.rating} size="md" />
                <span className="text-xs text-neutral-400 tabular-nums">({video.rating} / 5)</span>
              </div>
            </div>

            {/* Tag Video */}
            {video.tags && video.tags.length > 0 && (
              <div className="pt-2 border-t border-neutral-800">
                <span className="block text-[11px] text-neutral-400 mb-1.5">Tag:</span>
                <div className="flex flex-wrap gap-1">
                  {video.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Relasi Terkait (Channel, Playlist, Kategori) */}
            <div className="pt-2 border-t border-neutral-800 space-y-2 text-xs">
              {video.channelName && (
                <div
                  onClick={() => {
                    if (video.channelId) {
                      setActiveChannelId(video.channelId);
                      navigate('channel-detail');
                    }
                  }}
                  className="flex items-center gap-2 text-neutral-300 hover:text-white cursor-pointer group"
                >
                  <Tv size={14} className="text-[#ff0000]" />
                  <span className="truncate">Saluran: <strong className="text-white group-hover:underline">{video.channelName}</strong></span>
                </div>
              )}

              {video.playlistName && (
                <div
                  onClick={() => {
                    if (video.playlistId) {
                      setActivePlaylistId(video.playlistId);
                      navigate('playlist-detail');
                    }
                  }}
                  className="flex items-center gap-2 text-neutral-300 hover:text-white cursor-pointer group"
                >
                  <ListVideo size={14} className="text-emerald-500" />
                  <span className="truncate">Playlist: <strong className="text-white group-hover:underline">{video.playlistName}</strong></span>
                </div>
              )}

              {video.categoryName && (
                <div
                  onClick={() => {
                    if (video.categoryId) {
                      setActiveCategoryId(video.categoryId);
                      navigate('category-detail');
                    }
                  }}
                  className="flex items-center gap-2 text-neutral-300 hover:text-white cursor-pointer group"
                >
                  <FolderTree size={14} className="text-sky-500" />
                  <span className="truncate">Kategori: <strong className="text-white group-hover:underline">{video.categoryName}</strong></span>
                </div>
              )}

              <div className="flex items-center gap-2 text-neutral-400 text-[11px] pt-1">
                <Calendar size={13} />
                <span>Terakhir di edit: {new Date(video.updatedAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="pt-3 border-t border-neutral-800 flex items-center gap-2">
              <a
                href={video.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <ExternalLink size={13} />
                <span>Buka YouTube Asli</span>
              </a>

              <button
                type="button"
                onClick={() => onOpenEditModal('video', video)}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                title="Ubah Video"
              >
                <Edit2 size={15} />
              </button>

              <button
                type="button"
                onClick={() => toggleFavoriteVideo(video.id)}
                className={`p-2 rounded-xl transition-colors ${
                  video.isFavorite ? 'bg-[#ff0000]/20 text-[#ff0000]' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
                title="Favorit"
              >
                <Heart size={15} className={video.isFavorite ? 'fill-[#ff0000]' : ''} />
              </button>

              <button
                type="button"
                onClick={() => toggleArchiveVideo(video.id)}
                className={`p-2 rounded-xl transition-colors ${
                  video.isArchived ? 'bg-amber-500/20 text-amber-500' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
                title="Arsip"
              >
                <Archive size={15} />
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 transition-colors"
                title="Hapus Video"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Video */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Hapus Video"
        itemName={video.title}
        itemType="video"
        onConfirm={async () => {
          await deleteVideo(video.id);
          setIsDeleteModalOpen(false);
          navigate('videos');
        }}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
