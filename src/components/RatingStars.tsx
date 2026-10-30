/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Penilaian Bintang (Rating 1 - 5)
 * Mendukung mode interaktif untuk formulir dan mode tampilan saja pada card/daftar.
 */

import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  interactive = false,
  onChange,
  size = 'sm',
}) => {
  const iconSize = {
    sm: 13,
    md: 16,
    lg: 20,
  }[size];

  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined}>
      {Array.from({ length: maxRating }, (_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= rating;

        if (interactive) {
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange?.(starValue)}
              className="p-1 -m-1 text-amber-400 hover:text-amber-300 focus:outline-none transition-transform hover:scale-110 active:scale-95"
              title={`Beri nilai ${starValue} bintang`}
            >
              <Star
                size={iconSize}
                className={isFilled ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'}
              />
            </button>
          );
        }

        return (
          <Star
            key={idx}
            size={iconSize}
            className={isFilled ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'}
          />
        );
      })}
    </div>
  );
};
