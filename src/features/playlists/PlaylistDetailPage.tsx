/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Detail Playlist Penuh (PlaylistDetailPage)
 * Menampilkan:
 * - Header nama playlist, kategori, tag, total video, dan progress watched
 * - Daftar video dalam playlist dengan reorder interaktif menggunakan dnd-kit & @dnd-kit/sortable
 * - Quick jump ke video detail
 * - Aksi edit playlist, favorit, dan arsip
 */

import React, { useState, useMemo } from 'react';
import { useYtmStore } from '../../store/useYtmStore';
import { ProgressRing } from '../../components/ProgressRing';
import { RatingStars } from '../../components/RatingStars';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { formatDuration } from '../../lib/youtube';
import {
  ArrowLeft,
  Edit2,
  Heart,
  Archive,
  BarChart2,
  GripVertical,
  PlaySquare,
  X,
  Trash2,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { RoutePath, Video } from '../../types';

interface PlaylistDetailPageProps {
  navigate: (route: RoutePath) => void;
  onOpenEditModal: (type: 'playlist', item: any) => void;
}

// Komponen Item Video yang Bisa Di-drag (Sortable Item)
interface SortableVideoItemProps {
  video: Video;
  index: number;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

function SortableVideoItem({ video, index, onSelect, onRemove }: SortableVideoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-xl bg-[#181818] border transition-colors flex items-center justify-between gap-3 ${
        isDragging ? 'border-[#ff0000] shadow-lg' : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Drag Handle Gripper */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 text-neutral-500 hover:text-white cursor-grab active:cursor-grabbing touch-none"
          title="Geser untuk mengubah urutan video"
        >
          <GripVertical size={16} />
        </button>

        <span className="font-mono text-xs text-neutral-500 w-4 text-center tabular-nums">
          {index + 1}
        </span>

        {/* Thumbnail Video */}
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          onClick={() => onSelect(video.id)}
          className="w-20 sm:w-24 aspect-video rounded-lg object-cover shrink-0 cursor-pointer border border-neutral-700 hover:opacity-90"
        />

        <div className="min-w-0 cursor-pointer" onClick={() => onSelect(video.id)}>
          <h4 className="text-xs font-semibold text-white truncate hover:text-[#ff0000] transition-colors">
            {video.title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
            {video.channelName && <span>{video.channelName}</span>}
            <span>·</span>
            <span>{formatDuration(video.durationSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Progress Ring & Hapus dari Playlist */}
      <div className="flex items-center gap-2 shrink-0">
        <ProgressRing
          durationSeconds={video.durationSeconds}
          timestampSeconds={video.timestampSeconds}
          status={video.status}
          size="sm"
          showLabel={false}
        />

        <button
          type="button"
          onClick={() => onRemove(video.id)}
          className="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
          title="Keluarkan video dari playlist ini"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export const PlaylistDetailPage: React.FC<PlaylistDetailPageProps> = ({
  navigate,
  onOpenEditModal,
}) => {
  const {
    playlists,
    videos,
    activePlaylistId,
    setActiveVideoId,
    reorderPlaylistVideos,
    updatePlaylist,
    toggleFavoritePlaylist,
    toggleArchivePlaylist,
    deletePlaylist,
  } = useYtmStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const playlist = useMemo(() => {
    return playlists.find((p) => p.id === activePlaylistId) || playlists[0];
  }, [playlists, activePlaylistId]);

  // Video dalam playlist terurut sesuai videoIds
  const orderedVideos = useMemo(() => {
    if (!playlist) return [];
    const map = new Map(videos.map((v) => [v.id, v]));
    return playlist.videoIds.map((id) => map.get(id)).filter(Boolean) as Video[];
  }, [videos, playlist]);

  // Statistik Progres Tontonan Playlist
  const total = orderedVideos.length;
  const watched = orderedVideos.filter((v) => v.status === 'Watched').length;
  const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

  // Konfigurasi sensor Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !playlist) return;

    const oldIndex = playlist.videoIds.indexOf(String(active.id));
    const newIndex = playlist.videoIds.indexOf(String(over.id));

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(playlist.videoIds, oldIndex, newIndex);
      reorderPlaylistVideos(playlist.id, newOrder);
    }
  };

  const handleRemoveVideo = (videoId: string) => {
    if (!playlist) return;
    const nextVideoIds = playlist.videoIds.filter((id) => id !== videoId);
    updatePlaylist(playlist.id, { videoIds: nextVideoIds });
  };

  const handleSelectVideo = (videoId: string) => {
    setActiveVideoId(videoId);
    navigate('video-detail');
  };

  if (!playlist) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm text-neutral-400">Playlist tidak ditemukan.</p>
        <button
          type="button"
          onClick={() => navigate('playlists')}
          className="px-4 py-2 bg-neutral-800 rounded-lg text-xs text-white"
        >
          Kembali ke Daftar Playlist
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Tombol Navigasi Kembali */}
      <button
        type="button"
        onClick={() => navigate('playlists')}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Playlist</span>
      </button>

      {/* Header Info Playlist Penuh */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#181818] border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {playlist.name}
              </h1>
              {playlist.isFavorite && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff0000]/15 text-[#ff0000] font-medium">
                  Favorit
                </span>
              )}
              {playlist.isArchived && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                  Arsip
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              {playlist.categoryName && <span>Kategori: <strong className="text-neutral-200">{playlist.categoryName}</strong></span>}
              {playlist.categoryName && <span>·</span>}
              <span className="tabular-nums">{total} Video</span>
            </div>

            {playlist.tags && playlist.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {playlist.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tombol Aksi Playlist */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onOpenEditModal('playlist', playlist)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Ubah Playlist"
            >
              <Edit2 size={15} />
            </button>

            <button
              type="button"
              onClick={() => toggleFavoritePlaylist(playlist.id)}
              className={`p-2 rounded-xl transition-colors ${
                playlist.isFavorite ? 'bg-[#ff0000]/20 text-[#ff0000]' : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Favorit"
            >
              <Heart size={15} className={playlist.isFavorite ? 'fill-[#ff0000]' : ''} />
            </button>

            <button
              type="button"
              onClick={() => toggleArchivePlaylist(playlist.id)}
              className={`p-2 rounded-xl transition-colors ${
                playlist.isArchived ? 'bg-amber-500/20 text-amber-500' : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Arsip"
            >
              <Archive size={15} />
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-red-950/80 text-neutral-400 hover:text-red-400 transition-colors"
              title="Hapus Playlist"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Status Watched Progress Bar */}
        <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <BarChart2 size={13} className="text-emerald-500" />
              Progres Tontonan Playlist
            </span>
            <span className="font-mono text-emerald-400 tabular-nums">
              {watched} / {total} video ({percent}%)
            </span>
          </div>

          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daftar Video dalam Playlist dengan Drag & Drop Reorder (dnd-kit) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlaySquare size={17} className="text-[#ff0000]" />
            <h3 className="text-sm font-semibold text-white">
              Urutan Video dalam Playlist (Drag untuk Menata)
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400">
            Tahan grip icon untuk geser urutan
          </span>
        </div>

        {orderedVideos.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedVideos.map((v) => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {orderedVideos.map((vid, idx) => (
                  <SortableVideoItem
                    key={vid.id}
                    video={vid}
                    index={idx}
                    onSelect={handleSelectVideo}
                    onRemove={handleRemoveVideo}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="p-8 text-center bg-neutral-900/40 rounded-2xl border border-neutral-800 space-y-2">
            <PlaySquare size={28} className="mx-auto text-neutral-600" />
            <p className="text-xs text-neutral-400">Belum ada video di dalam playlist ini.</p>
            <button
              type="button"
              onClick={() => onOpenEditModal('playlist', playlist)}
              className="px-3 py-1.5 rounded-lg bg-[#ff0000] text-white text-xs font-medium"
            >
              Tambahkan Video
            </button>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus Playlist */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Hapus Playlist"
        itemName={playlist.name}
        itemType="playlist"
        onConfirm={async () => {
          await deletePlaylist(playlist.id);
          setIsDeleteModalOpen(false);
          navigate('playlists');
        }}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
