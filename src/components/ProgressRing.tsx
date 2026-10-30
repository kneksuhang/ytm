/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Progress Ring Video
 * Menampilkan ring sirkular berwarna lengkap dengan persentase dan angka progress
 * yang berkaitan dengan durasi dan timestamp posisi tonton.
 */

import React from 'react';
import { formatDuration, calculateProgressPercentage } from '../lib/youtube';
import type { VideoStatus } from '../types';

interface ProgressRingProps {
  durationSeconds: number;
  timestampSeconds: number;
  status?: VideoStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  durationSeconds,
  timestampSeconds,
  status,
  size = 'sm',
  showLabel = true,
}) => {
  const percentage = calculateProgressPercentage(timestampSeconds, durationSeconds);

  // Ukuran dimensi lingkaran ring
  const dimensions = {
    sm: { diameter: 28, stroke: 3, fontSize: 'text-[9px]' },
    md: { diameter: 36, stroke: 3.5, fontSize: 'text-[11px]' },
    lg: { diameter: 48, stroke: 4.5, fontSize: 'text-[13px]' },
  }[size];

  const radius = (dimensions.diameter - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Warna aksen ring YouTube
  let strokeColor = '#ff0000'; // Merah YouTube default
  if (status === 'Watched' || percentage >= 100) {
    strokeColor = '#22c55e'; // Hijau jika selesai
  } else if (status === 'To Watch' && percentage === 0) {
    strokeColor = '#525252'; // Netral abu jika belum mulai
  } else {
    strokeColor = '#ff0000'; // Merah saat menonton
  }

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0" title={`Progres: ${percentage}% (${formatDuration(timestampSeconds)} / ${formatDuration(durationSeconds)})`}>
      <div className="relative flex items-center justify-center shrink-0" style={{ width: dimensions.diameter, height: dimensions.diameter }}>
        <svg
          className="transform -rotate-90"
          width={dimensions.diameter}
          height={dimensions.diameter}
        >
          {/* Jalur latar belakang ring */}
          <circle
            cx={dimensions.diameter / 2}
            cy={dimensions.diameter / 2}
            r={radius}
            stroke="currentColor"
            className="text-neutral-700/50"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Jalur progres aktif */}
          <circle
            cx={dimensions.diameter / 2}
            cy={dimensions.diameter / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        <span className={`absolute font-bold tabular-nums text-white ${dimensions.fontSize}`}>
          {percentage}%
        </span>
      </div>

      {showLabel && (
        <span className="text-[11px] tabular-nums text-neutral-400 font-medium">
          {formatDuration(timestampSeconds)} / {formatDuration(durationSeconds)}
        </span>
      )}
    </div>
  );
};
