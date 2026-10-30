/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Formulir Tambah & Ubah Kategori (CategoryFormModal)
 * Aturan input:
 * - Nama Kategori: WAJIB diisi
 * - Tag: Multi-select
 * - Channel & Playlist: Memilih data yang sudah ada
 * - Icon: Kustomisasi ikon dari Iconify (searchable & selectable via API)
 * - Total Video: Status kalkulasi (bukan input, ditampilkan sebagai info)
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { IconifyPicker } from '../../components/IconifyPicker';
import { useYtmStore } from '../../store/useYtmStore';
import type { Category } from '../../types';
import { Plus, Check, Film } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
}) => {
  const { channels, playlists, videos, allTags, addTag, addCategory, updateCategory } = useYtmStore();

  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [icon, setIcon] = useState('solar:folder-with-files-bold');
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Hitung jumlah video berkaitan dengan kategori ini
  const relatedVideosCount = categoryToEdit
    ? videos.filter((v) => v.categoryId === categoryToEdit.id || v.categoryName === categoryToEdit.name).length
    : 0;

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSelectedTags(categoryToEdit.tags || []);
      setIcon(categoryToEdit.icon || 'solar:folder-with-files-bold');
      setSelectedChannelIds(categoryToEdit.channelIds || []);
      setSelectedPlaylistIds(categoryToEdit.playlistIds || []);
    } else {
      setName('');
      setSelectedTags([]);
      setIcon('solar:folder-with-files-bold');
      setSelectedChannelIds([]);
      setSelectedPlaylistIds([]);
    }
    setError(null);
  }, [categoryToEdit, isOpen]);

  const toggleTagSelection = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
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

  const toggleChannelSelection = (chId: string) => {
    setSelectedChannelIds((prev) =>
      prev.includes(chId) ? prev.filter((id) => id !== chId) : [...prev, chId]
    );
  };

  const togglePlaylistSelection = (plId: string) => {
    setSelectedPlaylistIds((prev) =>
      prev.includes(plId) ? prev.filter((id) => id !== plId) : [...prev, plId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama Kategori wajib diisi.');
      return;
    }

    if (categoryToEdit) {
      await updateCategory(categoryToEdit.id, {
        name: name.trim(),
        tags: selectedTags,
        icon,
        channelIds: selectedChannelIds,
        playlistIds: selectedPlaylistIds,
      });
    } else {
      await addCategory({
        name: name.trim(),
        tags: selectedTags,
        icon: icon || 'solar:folder-with-files-bold',
        channelIds: selectedChannelIds,
        playlistIds: selectedPlaylistIds,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-200">
            {error}
          </div>
        )}

        {/* Status Total Video yang Berkaitan */}
        {categoryToEdit && (
          <div className="flex items-center gap-2 p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300">
            <Film size={16} className="text-[#ff0000]" />
            <span>Total video berkaitan dengan kategori ini: <strong className="text-white tabular-nums">{relatedVideosCount}</strong> video</span>
          </div>
        )}

        {/* 1. Nama Kategori (Wajib) */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1">
            Nama Kategori <span className="text-[#ff0000]">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Pemrograman Web, Sains, Hiburan, dll."
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000]"
          />
        </div>

        {/* 2. Ikon Kustomisasi Iconify API */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1">
            Pilih Ikon Kategori (Pencarian API Iconify)
          </label>
          <IconifyPicker selectedIcon={icon} onSelectIcon={(newIcon) => setIcon(newIcon)} />
        </div>

        {/* 3. Tag: Multi Select */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1.5">
            Tag Kategori (Multi-Select)
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
              placeholder="Tambah tag baru..."
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

        {/* 4. Memilih Saluran yang Sudah Ada */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1">
            Kaitkan Saluran YouTube ({selectedChannelIds.length} saluran dipilih)
          </label>
          <div className="max-h-28 overflow-y-auto space-y-1 p-2 bg-neutral-900 border border-neutral-800 rounded-lg">
            {channels.map((ch) => {
              const isChecked = selectedChannelIds.includes(ch.id);
              return (
                <label key={ch.id} className="flex items-center gap-2 p-1 rounded hover:bg-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleChannelSelection(ch.id)}
                    className="rounded border-neutral-700 text-[#ff0000] focus:ring-0"
                  />
                  <span className="text-neutral-200 truncate">{ch.name}</span>
                </label>
              );
            })}
            {channels.length === 0 && <span className="text-neutral-500">Belum ada channel.</span>}
          </div>
        </div>

        {/* 5. Memilih Playlist yang Sudah Ada */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1">
            Kaitkan Playlist ({selectedPlaylistIds.length} playlist dipilih)
          </label>
          <div className="max-h-28 overflow-y-auto space-y-1 p-2 bg-neutral-900 border border-neutral-800 rounded-lg">
            {playlists.map((pl) => {
              const isChecked = selectedPlaylistIds.includes(pl.id);
              return (
                <label key={pl.id} className="flex items-center gap-2 p-1 rounded hover:bg-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => togglePlaylistSelection(pl.id)}
                    className="rounded border-neutral-700 text-[#ff0000] focus:ring-0"
                  />
                  <span className="text-neutral-200 truncate">{pl.name}</span>
                </label>
              );
            })}
            {playlists.length === 0 && <span className="text-neutral-500">Belum ada playlist.</span>}
          </div>
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
            {categoryToEdit ? 'Simpan Perubahan' : 'Tambah Kategori'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
