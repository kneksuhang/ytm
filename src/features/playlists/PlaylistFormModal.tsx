/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Formulir Tambah & Ubah Playlist (PlaylistFormModal)
 * Aturan input:
 * - Nama Playlist: WAJIB diisi
 * - Kategori: Pilih dari kategori yang ada
 * - Video: Memilih video yang sudah ada untuk dimasukkan ke dalam playlist
 * - Tag: Multi-select
 * - Total Video & Watched Progress: Status kalkulasi otomatis
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { useYtmStore } from '../../store/useYtmStore';
import type { Playlist } from '../../types';
import { Plus, Check, PlaySquare, BarChart2 } from 'lucide-react';

interface PlaylistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistToEdit?: Playlist | null;
}

export const PlaylistFormModal: React.FC<PlaylistFormModalProps> = ({
  isOpen,
  onClose,
  playlistToEdit,
}) => {
  const { categories, videos, allTags, addTag, addPlaylist, updatePlaylist } = useYtmStore();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [isArchived, setIsArchived] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Perhitungan status Total Video & Watched Progress
  const totalVideos = selectedVideoIds.length;
  const currentSelectedVideos = videos.filter((v) => selectedVideoIds.includes(v.id));
  const watchedVideosCount = currentSelectedVideos.filter((v) => v.status === 'Watched').length;
  const watchedPercent = totalVideos > 0 ? Math.round((watchedVideosCount / totalVideos) * 100) : 0;

  useEffect(() => {
    if (playlistToEdit) {
      setName(playlistToEdit.name);
      setCategoryId(playlistToEdit.categoryId || '');
      setSelectedTags(playlistToEdit.tags || []);
      setSelectedVideoIds(playlistToEdit.videoIds || []);
      setIsArchived(playlistToEdit.isArchived || false);
      setIsFavorite(playlistToEdit.isFavorite || false);
    } else {
      setName('');
      setCategoryId('');
      setSelectedTags([]);
      setSelectedVideoIds([]);
      setIsArchived(false);
      setIsFavorite(false);
    }
    setError(null);
  }, [playlistToEdit, isOpen]);

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

  const toggleVideoSelection = (vidId: string) => {
    setSelectedVideoIds((prev) =>
      prev.includes(vidId) ? prev.filter((id) => id !== vidId) : [...prev, vidId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama Playlist wajib diisi.');
      return;
    }

    const selectedCat = categories.find((c) => c.id === categoryId);

    if (playlistToEdit) {
      await updatePlaylist(playlistToEdit.id, {
        name: name.trim(),
        categoryId: categoryId || undefined,
        categoryName: selectedCat?.name,
        tags: selectedTags,
        videoIds: selectedVideoIds,
        isArchived,
        isFavorite,
      });
    } else {
      await addPlaylist({
        name: name.trim(),
        categoryId: categoryId || undefined,
        categoryName: selectedCat?.name,
        tags: selectedTags,
        videoIds: selectedVideoIds,
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
      title={playlistToEdit ? 'Ubah Playlist' : 'Tambah Playlist Baru'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-200">
            {error}
          </div>
        )}

        {/* Status Total Video & Watched Progress Bar */}
        <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="flex items-center gap-1.5 font-medium">
              <PlaySquare size={14} className="text-[#ff0000]" />
              Total Video: <strong className="text-white tabular-nums">{totalVideos}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <BarChart2 size={14} className="text-emerald-500" />
              Watched Progress: <strong className="text-emerald-400 tabular-nums">{watchedVideosCount}/{totalVideos} ({watchedPercent}%)</strong>
            </span>
          </div>

          {/* Bar Berwarna Progres Ditonton */}
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${watchedPercent}%` }}
            />
          </div>
        </div>

        {/* 1. Nama Playlist (Wajib) */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1">
            Nama Playlist <span className="text-[#ff0000]">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Belajar Frontend 2026, Review Gadget, dll."
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000]"
          />
        </div>

        {/* 2. Kategori */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1">
            Pilih Kategori (Opsional)
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#ff0000]"
          >
            <option value="">-- Tanpa Kategori --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Tag: Multi Select */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1.5">
            Tag Playlist (Multi-Select)
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

        {/* 4. Masukkan Video yang Sudah Ada ke Playlist Ini */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1">
            Pilih Video ({selectedVideoIds.length} video dimasukkan)
          </label>
          <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-neutral-900 border border-neutral-800 rounded-lg">
            {videos.map((vid) => {
              const isChecked = selectedVideoIds.includes(vid.id);
              return (
                <label
                  key={vid.id}
                  className="flex items-center gap-2.5 p-1.5 rounded hover:bg-neutral-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleVideoSelection(vid.id)}
                    className="rounded border-neutral-700 text-[#ff0000] focus:ring-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-200 truncate">{vid.title}</p>
                    <p className="text-[10px] text-neutral-500">Status: {vid.status}</p>
                  </div>
                </label>
              );
            })}
            {videos.length === 0 && <span className="text-neutral-500">Belum ada video.</span>}
          </div>
        </div>

        {/* 5. Checkbox Arsip & Favorit */}
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
            <span className="text-neutral-200 font-medium">Arsipkan Playlist</span>
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
            {playlistToEdit ? 'Simpan Perubahan' : 'Tambah Playlist'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
