/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Formulir Tambah & Ubah Saluran YouTube (ChannelFormModal)
 * Aturan input:
 * - Nama Channel: WAJIB diisi (Dilengkapi fitur otomatis ambil Nama & Foto Profil dari link saluran)
 * - Kategori: Multi-Select (opsional, sumber data dari kategori yang ada)
 * - Rating: Pilihan bintang 1 - 5 (opsional)
 * - Tag: Single-Select (opsional, hanya 1 yang bisa dipilih)
 * - Arsip & Favorit: Checkbox
 * - Video: Memilih video yang sudah ada untuk dimasukkan ke channel
 * - Foto Profil: Link URL atau Upload langsung (Base64 data URL)
 * - Terakhir di edit: Status otomatis (bukan input pengguna)
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { RatingStars } from '../../components/RatingStars';
import { useYtmStore } from '../../store/useYtmStore';
import {
  extractYouTubeChannelInfo,
  fetchYouTubeChannelMetadata,
  extractYouTubeId,
} from '../../lib/youtube';
import type { Channel } from '../../types';
import {
  Upload,
  Link as LinkIcon,
  Check,
  Plus,
  RefreshCw,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ChannelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelToEdit?: Channel | null;
}

export const ChannelFormModal: React.FC<ChannelFormModalProps> = ({
  isOpen,
  onClose,
  channelToEdit,
}) => {
  const { categories, videos, allTags, addTag, addChannel, updateChannel } = useYtmStore();

  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [link, setLink] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [photoMode, setPhotoMode] = useState<'url' | 'upload'>('url');
  const [error, setError] = useState<string | null>(null);

  // State untuk proses otomatisasi pengambilan info saluran
  const [isFetchingChannel, setIsFetchingChannel] = useState(false);
  const [fetchNotice, setFetchNotice] = useState<string | null>(null);

  useEffect(() => {
    if (channelToEdit) {
      setName(channelToEdit.name);
      setSelectedCategories(channelToEdit.categories || []);
      setRating(channelToEdit.rating || 0);
      setLink(channelToEdit.link || '');
      setSelectedTag(channelToEdit.tag || '');
      setIsArchived(channelToEdit.isArchived || false);
      setIsFavorite(channelToEdit.isFavorite || false);
      setAvatarUrl(channelToEdit.avatarUrl || '');
      setSelectedVideoIds(channelToEdit.videoIds || []);
    } else {
      setName('');
      setSelectedCategories([]);
      setRating(0);
      setLink('');
      setSelectedTag('');
      setIsArchived(false);
      setIsFavorite(false);
      setAvatarUrl('');
      setSelectedVideoIds([]);
    }
    setError(null);
    setFetchNotice(null);
  }, [channelToEdit, isOpen]);

  // Fungsi untuk mengambil Nama & Foto Profil Saluran secara otomatis atau dipaksa via tombol refresh
  const handleFetchChannelInfo = async (forceOverwrite = false) => {
    if (!link.trim()) return;

    // Jika tidak dipaksa dan kedua field sudah terisi, abaikan
    if (!forceOverwrite && name.trim().length > 0 && avatarUrl.trim().length > 0) {
      return;
    }

    setIsFetchingChannel(true);
    setFetchNotice(null);

    try {
      const channelMeta = await fetchYouTubeChannelMetadata(link);
      if (channelMeta) {
        if (forceOverwrite || !name.trim()) {
          setName(channelMeta.name);
        }
        if (forceOverwrite || !avatarUrl.trim()) {
          setAvatarUrl(channelMeta.avatarUrl);
        }

        setFetchNotice(`Saluran terdeteksi: "${channelMeta.name}"`);
        setTimeout(() => setFetchNotice(null), 4000);
      }
    } catch (err) {
      console.warn('Gagal mengambil data saluran otomatis:', err);
    } finally {
      setIsFetchingChannel(false);
    }
  };

  // Efek otomatis: saat link saluran dimasukkan dan nama atau foto masih kosong, otomatis deteksi
  useEffect(() => {
    const trimmed = link.trim();
    if (trimmed && (!name.trim() || !avatarUrl.trim())) {
      const timeoutId = setTimeout(() => {
        handleFetchChannelInfo(false);
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [link]);

  // Mengunggah gambar lokal dan mengubah ke data Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCategorySelection = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const toggleVideoSelection = (vidId: string) => {
    setSelectedVideoIds((prev) =>
      prev.includes(vidId) ? prev.filter((id) => id !== vidId) : [...prev, vidId]
    );
  };

  const handleAddNewTag = () => {
    if (newTagInput.trim()) {
      addTag(newTagInput.trim());
      setSelectedTag(newTagInput.trim());
      setNewTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama Channel wajib diisi.');
      return;
    }

    if (channelToEdit) {
      await updateChannel(channelToEdit.id, {
        name: name.trim(),
        categories: selectedCategories,
        rating,
        link: link.trim(),
        tag: selectedTag,
        isArchived,
        isFavorite,
        avatarUrl,
        videoIds: selectedVideoIds,
      });
    } else {
      await addChannel({
        name: name.trim(),
        categories: selectedCategories,
        rating,
        link: link.trim(),
        tag: selectedTag,
        isArchived,
        isFavorite,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name.trim())}`,
        videoIds: selectedVideoIds,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={channelToEdit ? 'Ubah Saluran YouTube' : 'Tambah Saluran Baru'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-200">
            {error}
          </div>
        )}

        {/* Notifikasi feedback saat nama saluran atau foto berhasil diambil otomatis */}
        {fetchNotice && (
          <div className="p-2 rounded-lg bg-neutral-900 border border-emerald-600/50 text-emerald-300 flex items-center gap-2 text-[11px] animate-fadeIn">
            <Check size={14} className="text-emerald-400 shrink-0" />
            <span className="truncate">{fetchNotice}</span>
          </div>
        )}

        {/* 1. Tautan Saluran YouTube (Dilengkapi deteksi otomatis & tombol refresh) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-medium text-neutral-300">
              Tautan Saluran (Opsional)
            </label>
            {link.trim() && (
              <button
                type="button"
                onClick={() => handleFetchChannelInfo(true)}
                disabled={isFetchingChannel}
                title="Ambil nama dan foto profil otomatis dari tautan saluran"
                className="text-[11px] text-[#ff0000] hover:text-[#ff3333] flex items-center gap-1 font-medium transition-colors disabled:opacity-50"
              >
                {isFetchingChannel ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-[#ff0000]" />
                    <span>Mendeteksi...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={12} />
                    <span>Ambil Info Saluran</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://www.youtube.com/@channelName atau @handle"
              className="w-full px-3 py-2 pr-8 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000]"
            />
            {isFetchingChannel && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <Loader2 size={14} className="animate-spin text-[#ff0000]" />
              </div>
            )}
          </div>
          <p className="text-[10px] text-neutral-500 mt-1">
            Mendukung format tautan <span className="text-neutral-400">@handle</span>, <span className="text-neutral-400">/c/nama</span>, atau tautan video dari saluran ini.
          </p>
        </div>

        {/* 2. Nama Channel (Wajib, dengan tombol sinkronisasi refresh manual) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-medium text-neutral-300">
              Nama Saluran <span className="text-[#ff0000]">*</span>
            </label>
            {link.trim() && (
              <button
                type="button"
                onClick={() => handleFetchChannelInfo(true)}
                disabled={isFetchingChannel}
                className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={10} className={isFetchingChannel ? 'animate-spin text-[#ff0000]' : ''} />
                <span>Sinkronkan Nama</span>
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Marques Brownlee, Fireship, dll."
              className="w-full px-3 py-2 pr-8 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000]"
            />
            {isFetchingChannel && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <Loader2 size={14} className="animate-spin text-[#ff0000]" />
              </div>
            )}
          </div>
        </div>

        {/* 3. Foto Profil: Tautan atau Upload (Terisi otomatis bila tersedia) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <label className="font-medium text-neutral-300">Foto Profil Saluran</label>
              {avatarUrl && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Sparkles size={10} /> Terdeteksi
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={() => setPhotoMode('url')}
                className={`px-2 py-1 rounded text-[11px] ${photoMode === 'url' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'}`}
              >
                Tautan URL
              </button>
              <button
                type="button"
                onClick={() => setPhotoMode('upload')}
                className={`px-2 py-1 rounded text-[11px] ${photoMode === 'upload' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'}`}
              >
                Upload Berkas
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Preview Avatar Saluran"
                className="w-12 h-12 rounded-full object-cover border border-neutral-700 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 shrink-0">
                <Upload size={18} />
              </div>
            )}

            <div className="flex-1">
              {photoMode === 'url' ? (
                <div className="relative">
                  <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://yt3.googleusercontent.com/..."
                    className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000]"
                  />
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 px-3 py-1.5 border border-dashed border-neutral-700 rounded-lg bg-neutral-900 hover:bg-neutral-850 cursor-pointer text-neutral-300">
                  <Upload size={14} />
                  <span>Pilih file gambar...</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* 4. Kategori: Multi Select */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1.5">
            Kategori (Multi-Select)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-neutral-900/80 border border-neutral-800 rounded-lg">
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.name);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategorySelection(cat.name)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#ff0000] text-white font-medium'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {isSelected && <Check size={12} />}
                  <span>{cat.name}</span>
                </button>
              );
            })}
            {categories.length === 0 && (
              <span className="text-neutral-500">Belum ada kategori tersedia.</span>
            )}
          </div>
        </div>

        {/* 5. Rating (Pilihan Bintang 1 - 5) */}
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
                Hapus Rating
              </button>
            )}
          </div>
        </div>

        {/* 6. Tag: Single Select */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1">
            Tag Saluran (Hanya Bisa 1 Tag)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#ff0000]"
            >
              <option value="">-- Pilih 1 Tag --</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Buat tag baru..."
                className="flex-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddNewTag}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center gap-1"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* 7. Masukkan Video yang Sudah Ada ke Saluran Ini */}
        <div>
          <label className="block font-medium text-neutral-300 mb-1">
            Pilih Video Terkait ({selectedVideoIds.length} video dipilih)
          </label>
          <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-neutral-900 border border-neutral-800 rounded-lg">
            {videos.map((vid) => {
              const isChecked = selectedVideoIds.includes(vid.id);
              return (
                <label
                  key={vid.id}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleVideoSelection(vid.id)}
                    className="rounded border-neutral-700 text-[#ff0000] focus:ring-0"
                  />
                  <span className="text-neutral-200 truncate flex-1">{vid.title}</span>
                </label>
              );
            })}
            {videos.length === 0 && (
              <span className="text-neutral-500 block p-2 text-center">Belum ada video tersimpan.</span>
            )}
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
            <span className="text-neutral-200 font-medium">Arsipkan Saluran</span>
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
            {channelToEdit ? 'Simpan Perubahan' : 'Tambah Saluran'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
