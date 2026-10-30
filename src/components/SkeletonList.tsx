/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Skeleton Loading YouTube-Style
 * Memberikan feedback visual loading yang mulus dan proporsional untuk seluruh daftar data.
 */

import React from 'react';

interface SkeletonListProps {
  type?: 'card' | 'row' | 'channel' | 'category';
  count?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  type = 'card',
  count = 6,
}) => {
  return (
    <div
      className={
        type === 'row'
          ? 'space-y-3'
          : type === 'channel'
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
          : type === 'category'
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
      }
    >
      {Array.from({ length: count }, (_, idx) => (
        <div
          key={idx}
          className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 animate-pulse"
        >
          {type === 'card' && (
            <div className="space-y-2.5">
              <div className="aspect-video w-full bg-neutral-800 rounded-lg" />
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-neutral-800 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-neutral-800 rounded w-4/5" />
                  <div className="h-2.5 bg-neutral-800/80 rounded w-1/2" />
                </div>
              </div>
            </div>
          )}

          {type === 'channel' && (
            <div className="flex flex-col items-center text-center p-2 space-y-2">
              <div className="w-14 h-14 rounded-full bg-neutral-800" />
              <div className="h-3 bg-neutral-800 rounded w-3/4" />
              <div className="h-2 bg-neutral-800/70 rounded w-1/2" />
            </div>
          )}

          {type === 'category' && (
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-neutral-800 rounded w-2/3" />
                <div className="h-2 bg-neutral-800/70 rounded w-1/3" />
              </div>
            </div>
          )}

          {type === 'row' && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-16 h-10 rounded bg-neutral-800 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-neutral-800 rounded w-1/2" />
                  <div className="h-2 bg-neutral-800/70 rounded w-1/4" />
                </div>
              </div>
              <div className="w-16 h-4 bg-neutral-800 rounded" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
