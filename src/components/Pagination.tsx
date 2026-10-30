/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Pagination Responsif
 * Menavigasi data per halaman dengan tata letak ringkas yang ramah layar mobile.
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-2 py-4 px-2 border-t border-neutral-800 text-xs">
      <div className="text-neutral-400">
        {totalItems !== undefined ? (
          <span>Total: <strong className="text-white font-medium tabular-nums">{totalItems}</strong> data</span>
        ) : (
          <span>Halaman <strong className="text-white font-medium tabular-nums">{currentPage}</strong> dari <strong className="text-white font-medium tabular-nums">{totalPages}</strong></span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <span className="px-2 py-1 text-neutral-400 font-mono tabular-nums">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
