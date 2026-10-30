/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Formulir Tambah & Ubah Video YouTube (VideoFormModal)
 * Aturan input:
 * - Status: 3 pilihan radio dan HANYA 1 yang bisa dipilih ('To Watch', 'Watching', 'Watched')
 * - Judul Video: WAJIB diisi (Dilengkapi fitur otomatis ambil Judul dari YouTube link dan tombol refresh manual)
 * - Tag: Multi-select
 * - Rating: Pilihan bintang 1 sampai 5
 * - Video Progress: Ring kecil berwarna lengkap dengan persen dan angka berkaitan dengan durasi & timestamp
 * - Tautan Link: Otomatis ekstrak YouTube ID, Thumbnail, dan Judul Video via oEmbed
 * - Channel, Playlist, Kategori, Arsip, Favorit
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { RatingStars } from '../../components/RatingStars';
import { ProgressRing } from '../../components/ProgressRing';
import { useYtmStore } from '../../store/useYtmStore';
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  formatDuration,
  parseDurationToSeconds,
  fetchYouTubeVideoMetadata,
} from '../../lib/youtube';
import type { Video, VideoStatus } from '../../types';
import {
  Plus,
  Check,
  Play,
  Eye,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface VideoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoToEdit?: Video | null;
}

export const VideoFormModal: React.FC<VideoFormModalProps> = ({
  isOpen,
  onClose,
  videoToEdit,
}) => {
  const { channels, playlists, categories, allTags, addTag, addVideo, updateVideo } = useYtmStore();

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<VideoStatus>('To Watch');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [link, setLink] = useState('');
  const [durationInput, setDurationInput] = useState('10:00');
  const [timestampInput, setTimestampInput] = useState('00:00');
  const [channelId, setChannelId] = useState('');
  const [playlistId, setPlaylistId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk proses otomatisasi pengambilan judul YouTube
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [fetchNotice, setFetchNotice] = useState<string | null>(null);

  const durationSeconds = parseDurationToSeconds(durationInput);
  const timestampSeconds = parseDurationToSeconds(timestampInput);
  const detectedYtId = extractYouTubeId(link);
  const previewThumbnail = detectedYtId ? getYouTubeThumbnail(detectedYtId, 'hq') : '';

  // Reset form saat modal dibuka atau video diedit
  useEffect(() => {
    if (videoToEdit) {
      setTitle(videoToEdit.title);
      setStatus(videoToEdit.status || 'To Watch');
      setSelectedTags(videoToEdit.tags || []);
      setRating(videoToEdit.rating || 0);
      setLink(videoToEdit.link || '');
      setDurationInput(formatDuration(videoToEdit.durationSeconds || 600));
      setTimestampInput(formatDuration(videoToEdit.timestampSeconds || 0));
      setChannelId(videoToEdit.channelId || '');
      setPlaylistId(videoToEdit.playlistId || '');
      setCategoryId(videoToEdit.categoryId || '');
      setIsArchived(videoToEdit.isArchived || false);
      setIsFavorite(videoToEdit.isFavorite || false);
    } else {
      setTitle('');
      setStatus('To Watch');
      setSelectedTags([]);
      setRating(0);
      setLink('');
      setDurationInput('10:00');
      setTimestampInput('00:00');
      setChannelId('');
      setPlaylistId('');
      setCategoryId('');
      setIsArchived(false);
      setIsFavorite(false);
    }
    setError(null);
    setFetchNotice(null);
  }, [videoToEdit, isOpen]);

  // Fungsi untuk mengambil Judul Video YouTube secara otomatis atau via tombol refresh
  const handleFetchYouTubeTitle = async (forceOverwrite = false) => {
    if (!link.trim()) return;
    const ytId = extractYouTubeId(link);
    if (!ytId) return;

    // Jika tidak dipaksa dan judul sudah ada, jangan timpa
    if (!forceOverwrite && title.trim().length > 0) return;

    setIsFetchingTitle(true);
    setFetchNotice(null);

    try {
      const metadata = await fetchYouTubeVideoMetadata(link);
      if (metadata && metadata.title) {
        setTitle(metadata.title);
        setFetchNotice(`Judul YouTube berhasil diambil: "${metadata.title.slice(0, 35)}..."`);

        // Coba sinkronkan saluran otomatis jika ada nama author yang cocok di daftar saluran pengguna
        if (!channelId && metadata.authorName) {
          const matchedChannel = channels.find(
            (c) => c.name.toLowerCase() === metadata.authorName.toLowerCase()
          );
          if (matchedChannel) {
            setChannelId(matchedChannel.id);
          }
        }

        setTimeout(() => setFetchNotice(null), 4000);
      }
    } catch (err) {
      console.warn('Gagal mengambil judul video otomatis:', err);
    } finally {
      setIsFetchingTitle(false);
    }
  };

  // Efek otomatis: saat link YouTube valid dimasukkan dan judul masih kosong, otomatis ambil judul
  useEffect(() => {
    const ytId = extractYouTubeId(link);
    if (ytId && !title.trim()) {
      const timeoutId = setTimeout(() => {
        handleFetchYouTubeTitle(false);
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [link]);

  const toggleTagSelection = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddNewTag = () => {
    if (newTagInput.trim()) {
      addTag(newTagInput.trim());
      if (!selectedTags.includes(newTagInput.trim())) {
        setSelectedTags([...selectedTags, newTagInput.trim()]);
      }
      setNewTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul Video wajib diisi.');
      return;
    }
    if (!link.trim()) {
      setError('Tautan video YouTube wajib diisi.');
      return;
    }

    const durSec = parseDurationToSeconds(durationInput);
    const timeSec = parseDurationToSeconds(timestampInput);
    const ytId = extractYouTubeId(link) || 'video_' + Date.now();
    const thumbUrl = getYouTubeThumbnail(ytId, 'hq');

    const selectedCh = channels.find((c) => c.id === channelId);
    const selectedPl = playlists.find((p) => p.id === playlistId);
    const selectedCat = categories.find((cat) => cat.id === categoryId);

    if (videoToEdit) {
      await updateVideo(videoToEdit.id, {
        title: title.trim(),
        status,
        tags: selectedTags,
        rating,
        link: link.trim(),
        youtubeId: ytId,
        thumbnailUrl: thumbUrl,
        durationSeconds: durSec,
        timestampSeconds: timeSec,
        channelId: channelId || undefined,
        channelName: selectedCh?.name,
        playlistId: playlistId || undefined,
        playlistName: selectedPl?.name,
        categoryId: categoryId || undefined,
        categoryName: selectedCat?.name,
        isArchived,
        isFavorite,
      });
    } else {
      await addVideo({
        title: title.trim(),
        status,
        tags: selectedTags,
        rating,
        link: link.trim(),
        youtubeId: ytId,
        thumbnailUrl: thumbUrl,
        durationSeconds: durSec,
        timestampSeconds: timeSec,
        channelId: channelId || undefined,
        channelName: selectedCh?.name,
        playlistId: playlistId || undefined,
        playlistName: selectedPl?.name,
        categoryId: categoryId || undefined,
        categoryName: selectedCat?.name,
        isArchived,
        isFavorite,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={videoToEdit ? 'Ubah Informasi Video' : 'Tambah Video YouTube'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-200">
            {error}
          </div>
        )}

        {/* Notifikasi feedback saat judul video berhasil diambil otomatis */}
        {fetchNotice && (
          <div className="p-2 rounded-lg bg-neutral-900 border border-emerald-600/50 text-emerald-300 flex items-center gap-2 text-[11px] animate-fadeIn">
            <Check size={14} className="text-emerald-400 shrink-0" />
            <span className="truncate">{fetchNotice}</span>
          </div>
        )}

        {/* 1. Status Video (3 Pilihan, Hanya 1 yang Dipilih) */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1.5">
            Status Tontonan <span className="text-[#ff0000]">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'To Watch', label: 'To Watch', icon: Play, desc: 'Belum ditonton' },
              { id: 'Watching', label: 'Watching', icon: Eye, desc: 'Sedang ditonton' },
              { id: 'Watched', label: 'Watched', icon: CheckCircle2, desc: 'Selesai ditonton' },
            ].map((item) => {
              const isSelected = status === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatus(item.id as VideoStatus)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'border-[#ff0000] bg-[#ff0000]/15 text-white font-medium shadow-sm'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <Icon size={16} className={isSelected ? 'text-[#ff0000]' : ''} />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Tautan Link Video YouTube (Dilengkapi auto-fetch & preview) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-medium text-neutral-300">
              Tautan YouTube (Link) <span className="text-[#ff0000]">*</span>
            </label>
            {detectedYtId && (
              <button
                type="button"
                onClick={() => handleFetchYouTubeTitle(true)}
                disabled={isFetchingTitle}
                title="Ambil ulang judul otomatis dari tautan YouTube"
                className="text-[11px] text-[#ff0000] hover:text-[#ff3333] flex items-center gap-1 font-medium transition-colors disabled:opacity-50"
              >
                {isFetchingTitle ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-[#ff0000]" />
                    <span>Mengambil...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={12} />
                    <span>Ambil Judul YouTube</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            type="url"
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000]"
          />

          {/* Preview Thumbnail Otomatis dari Link */}
          {previewThumbnail && (
            <div className="mt-2 flex items-center gap-3 p-2 bg-neutral-900/90 rounded-lg border border-neutral-800">
              <img
                src={previewThumbnail}
                alt="Thumbnail Preview"
                className="w-24 aspect-video object-cover rounded border border-neutral-700 shrink-0"
              />
              <div className="text-[11px] text-neutral-400 min-w-0">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <Sparkles size={12} className="text-[#ff0000]" />
                  <span>Thumbnail & Judul Otomatis Terdeteksi</span>
                </div>
                <p className="font-mono text-[10px] text-neutral-500 truncate">ID: {detectedYtId}</p>
                {isFetchingTitle && (
                  <p className="text-[10px] text-[#ff0000] flex items-center gap-1 mt-0.5 animate-pulse">
                    <Loader2 size={10} className="animate-spin" /> Sedang mengambil judul video...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Judul Video (Wajib, dengan tombol sinkronisasi refresh manual) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-medium text-neutral-300">
              Judul Video <span className="text-[#ff0000]">*</span>
            </label>
            {detectedYtId && (
              <button
                type="button"
                onClick={() => handleFetchYouTubeTitle(true)}
                disabled={isFetchingTitle}
                className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={10} className={isFetchingTitle ? 'animate-spin text-[#ff0000]' : ''} />
                <span>Sinkronkan Ulang Judul</span>
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul lengkap video YouTube..."
              className="w-full px-3 py-2 pr-8 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000]"
            />
            {isFetchingTitle && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <Loader2 size={14} className="animate-spin text-[#ff0000]" />
              </div>
            )}
          </div>
        </div>

        {/* 4. Durasi & Timestamp dengan Live Video Progress Ring */}
        <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-neutral-300">Durasi, Timestamp & Video Progress</span>
            {/* Live Progress Ring Preview */}
            <ProgressRing
              durationSeconds={durationSeconds}
              timestampSeconds={timestampSeconds}
              status={status}
              size="md"
              showLabel={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Durasi Total (Format mm:ss atau hh:mm:ss)
              </label>
              <input
                type="text"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                placeholder="15:30"
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-[#ff0000]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Posisi Ditonton / Timestamp (mm:ss)
              </label>
              <input
                type="text"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                placeholder="05:10"
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-[#ff0000]"
              />
            </div>
          </div>
        </div>

        {/* 5. Rating (Bintang 1 - 5) */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1">
            Penilaian Rating (1 - 5 Bintang)
          </label>
          <div className="flex items-center gap-3">
            <RatingStars
              rating={rating}
              interactive
              onChange={(newVal) => setRating(newVal)}
              size="md"
            />
            {rating > 0 && (
              <button
                type="button"
                onClick={() => setRating(0)}
                className="text-[11px] text-neutral-500 hover:text-neutral-300 underline"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* 6. Tag: Multi Select */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1.5">
            Tag Video (Multi-Select)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-neutral-900/80 border border-neutral-800 rounded-lg mb-2">
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTagSelection(tag)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#ff0000] text-white font-medium'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {isSelected && <Check size={12} />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-1.5">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="Tag baru..."
              className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddNewTag}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* 7. Relasi: Channel, Playlist, Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-neutral-300 mb-1">Pilih Saluran</label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full px-2.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#ff0000]"
            >
              <option value="">-- Tanpa Saluran --</option>
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-neutral-300 mb-1">Pilih Playlist</label>
            <select
              value={playlistId}
              onChange={(e) => setPlaylistId(e.target.value)}
              className="w-full px-2.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#ff0000]"
            >
              <option value="">-- Tanpa Playlist --</option>
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>{pl.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-neutral-300 mb-1">Pilih Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-2.5 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#ff0000]"
            >
              <option value="">-- Tanpa Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 8. Checkbox Arsip & Favorit */}
        <div className="flex items-center gap-6 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="rounded border-neutral-700 text-[#ff0000] focus:ring-0"
            />
            <span className="text-neutral-200 font-medium">Tandai Favorit</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isArchived}
              onChange={(e) => setIsArchived(e.target.checked)}
              className="rounded border-neutral-700 text-[#ff0000] focus:ring-0"
            />
            <span className="text-neutral-200 font-medium">Arsipkan Video</span>
          </label>
        </div>

        {/* Tombol Simpan / Batal */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-[#ff0000] hover:bg-[#cc0000] text-white font-medium transition-colors"
          >
            {videoToEdit ? 'Simpan Perubahan' : 'Tambah Video'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
