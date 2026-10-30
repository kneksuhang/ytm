/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Modal Dialog & Panel UI YouTube-Native
 * Menggantikan semua penggunaan window popup dengan panel modal elegan, responsif, dan mudah diakses.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  // Kunci scrolling pada body saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop Gelap dengan Efek Blur */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Kontainer Panel Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        className={`relative w-full ${maxWidthClass} bg-[#181818] border border-neutral-700/80 rounded-2xl shadow-2xl text-white overflow-hidden z-10 my-auto transform transition-all duration-200 animate-in fade-in zoom-in-95`}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h3 id="modal-headline" className="text-base font-semibold text-white tracking-tight truncate">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors -mr-1"
            title="Tutup dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Konten Badan Modal */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
