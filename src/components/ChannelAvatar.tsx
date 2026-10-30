/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Komponen Foto Profil Saluran YouTube (ChannelAvatar)
 * Menampilkan avatar saluran dengan fallback inisial elegan dan zero-broken-image policy.
 */

import React, { useState } from 'react';

interface ChannelAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ChannelAvatar: React.FC<ChannelAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg',
  }[size];

  // Inisial nama (maksimal 2 karakter)
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((n) => n.charAt(0))
        .join('')
        .toUpperCase()
    : 'Y';

  // Warna gradien acak konsisten berdasarkan nama
  const colors = [
    'from-red-600 to-amber-600',
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-purple-600 to-pink-600',
    'from-amber-600 to-orange-600',
  ];
  const colorIndex = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
  const gradient = colors[colorIndex];

  if (!avatarUrl || hasError) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-sm shrink-0 border border-neutral-700/60 select-none ${className}`}
      >
        <span className="keep-white font-semibold">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      className={`${sizeClasses} rounded-full object-cover border border-neutral-700/60 shadow-sm shrink-0 ${className}`}
    />
  );
};
