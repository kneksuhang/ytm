/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Modal Konfirmasi Hapus Data (DeleteConfirmModal)
 * Menampilkan dialog konfirmasi sebelum penghapusan data permanen
 * dengan gaya YouTube-Native yang kompak, rapi, dan responsif di mobile.
 */

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  itemType?: 'video' | 'channel' | 'kategori' | 'playlist' | 'tag' | 'data';
  description?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  itemName,
  itemType = 'data',
  description,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={isLoading ? undefined : onClose} />

      {/* Modal Card Box */}
      <div className="relative w-full max-w-sm rounded-2xl bg-[#181818] border border-neutral-800 shadow-2xl overflow-hidden p-4 sm:p-5 space-y-4 z-10 animate-scaleUp">
        {/* Tombol Tutup Silang di Kanan Atas */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-3.5 right-3.5 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Tutup Modal"
        >
          <X size={16} />
        </button>

        {/* Ikon Peringatan & Judul */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 text-[#ff0000] flex items-center justify-center shrink-0 border border-red-500/20">
            <Trash2 size={20} />
          </div>
          <div className="space-y-1 pr-6">
            <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {description || (
                <>
                  Apakah Anda yakin ingin menghapus {itemType}{' '}
                  {itemName ? <strong className="text-white">"{itemName}"</strong> : ''}? Tindakan ini tidak dapat dibatalkan.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Tombol Aksi Konfirmasi */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <Trash2 size={13} />
            <span>{isLoading ? 'Menghapus...' : 'Hapus'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
