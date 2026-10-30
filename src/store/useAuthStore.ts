/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pengelola Autentikasi Supabase
 * Mengatur sesi login dengan Email, Google, GitHub, dan status profil pengguna.
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  errorMessage: string | null;
  initAuth: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  errorMessage: null,

  initAuth: async () => {
    try {
      set({ isLoading: true });
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Pengguna YTM',
            avatarUrl: session.user.user_metadata?.avatar_url,
          },
        });
      }

      // Pasang listener status autentikasi dari Supabase
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Pengguna YTM',
              avatarUrl: session.user.user_metadata?.avatar_url,
            },
          });
        } else {
          set({ user: null });
        }
      });
    } catch (err: any) {
      console.warn('Supabase Auth init notice:', err?.message || err);
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ errorMessage: error.message, isLoading: false });
        return { success: false, error: error.message };
      }
      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Pengguna YTM',
            avatarUrl: data.user.user_metadata?.avatar_url,
          },
          isLoading: false,
        });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Gagal masuk akun';
      set({ errorMessage: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  signUpWithEmail: async (email, password, displayName) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
          },
        },
      });
      if (error) {
        set({ errorMessage: error.message, isLoading: false });
        return { success: false, error: error.message };
      }
      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            displayName: displayName || data.user.email?.split('@')[0] || 'Pengguna YTM',
          },
          isLoading: false,
        });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Gagal mendaftar akun';
      set({ errorMessage: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  signInWithProvider: async (provider) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        set({ errorMessage: error.message, isLoading: false });
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || `Gagal login dengan ${provider}`;
      set({ errorMessage: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null });
    } catch (err: any) {
      console.warn('Gagal logout Supabase:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ errorMessage: null }),
}));
