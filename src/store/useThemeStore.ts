/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pengelola Status Tema (Gelap / Terang)
 * Menyimpan preferensi pengguna langsung ke localStorage sesuai instruksi.
 * Memastikan kelas .light dan data-theme disinkronkan ke <html> dan <body>.
 */

import { create } from 'zustand';

interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  initTheme: () => void;
}

const STORAGE_KEY = 'ytm_theme_preference';

const applyThemeToDOM = (theme: 'dark' | 'light') => {
  const root = document.documentElement;
  const body = document.body;

  if (theme === 'light') {
    root.classList.add('light');
    body.classList.add('light');
    root.classList.remove('dark');
    body.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  } else {
    root.classList.remove('light');
    body.classList.remove('light');
    root.classList.add('dark');
    body.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark', // Standar YouTube adalah mode gelap
  initTheme: () => {
    const saved = localStorage.getItem(STORAGE_KEY) as 'dark' | 'light' | null;
    const initialTheme = saved ? saved : 'dark';
    set({ theme: initialTheme });
    applyThemeToDOM(initialTheme);
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    set({ theme: next });
    applyThemeToDOM(next);
  },
  setTheme: (newTheme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    set({ theme: newTheme });
    applyThemeToDOM(newTheme);
  },
}));
