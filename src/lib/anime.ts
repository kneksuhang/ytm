/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Helper Animasi Anime.js Minimalis & Halus
 * Digunakan untuk transisi halaman, efek kartu, dan pop feedback yang mulus tanpa kaku.
 */

import * as animeModule from 'animejs';

// Dukungan universal untuk anime.js v3 maupun v4
const animeEngine: any = (animeModule as any).animate || (animeModule as any).default || animeModule;

/**
 * Animasi transisi masuk untuk elemen kontainer atau halaman baru
 */
export function animatePageIn(targetElement: HTMLElement | string) {
  if (!targetElement) return;
  try {
    if (typeof animeEngine === 'function') {
      animeEngine(targetElement, {
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 220,
        easing: 'easeOutCubic',
      });
    }
  } catch (e) {
    // Fallback CSS lembut jika runtime tidak mendukung
  }
}

/**
 * Animasi bergelombang halus untuk daftar item kartu
 */
export function animateStaggerCards(targets: string) {
  try {
    if (typeof animeEngine === 'function') {
      animeEngine(targets, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 240,
        easing: 'easeOutQuad',
      });
    }
  } catch (e) {}
}

/**
 * Animasi klik tombol atau aksi cepat
 */
export function animatePress(target: HTMLElement) {
  if (!target) return;
  try {
    if (typeof animeEngine === 'function') {
      animeEngine(target, {
        scale: [1, 0.95, 1],
        duration: 160,
        easing: 'easeOutQuad',
      });
    }
  } catch (e) {}
}
