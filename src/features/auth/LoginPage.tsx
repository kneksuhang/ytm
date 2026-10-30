/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Masuk Akun (LoginPage)
 * Mendukung autentikasi Supabase Auth menggunakan:
 * - Email & Kata Sandi
 * - Google OAuth
 * - GitHub OAuth
 * - Akses Cepat Mode Tamu (Offline Local Mode)
 */

import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowLeft, Mail, Lock, LogIn, Loader2, Play } from 'lucide-react';
import { Icon } from '@iconify/react';
import type { RoutePath } from '../../types';

interface LoginPageProps {
  navigate: (route: RoutePath) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { signInWithEmail, signInWithProvider, isLoading, errorMessage, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signInWithEmail(email, password);
    if (result.success) {
      navigate('dashboard');
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    await signInWithProvider(provider);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#181818] border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Header Login */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-7 bg-[#ff0000] rounded-lg flex items-center justify-center mx-auto shadow-sm">
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Masuk ke YTM</h2>
          <p className="text-xs text-neutral-400">
            Kelola saluran dan video YouTube favorit Anda.
          </p>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Form Email & Password */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-neutral-300 mb-1 font-medium">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  clearError();
                  setEmail(e.target.value);
                }}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000]"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 mb-1 font-medium">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  clearError();
                  setPassword(e.target.value);
                }}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            <span>Masuk Akun</span>
          </button>
        </form>

        {/* Garis Pembatas */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-800 w-full" />
          <span className="bg-[#181818] px-2 text-[11px] text-neutral-500 uppercase">atau</span>
        </div>

        {/* Pilihan OAuth (Google & GitHub) */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="w-full py-2 px-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Icon icon="logos:google-icon" width="16" height="16" />
            <span>Lanjutkan dengan Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('github')}
            className="w-full py-2 px-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Icon icon="mdi:github" width="18" height="18" />
            <span>Lanjutkan dengan GitHub</span>
          </button>
        </div>

        {/* Navigasi ke Daftar Akun atau Kembali */}
        <div className="text-center pt-2 space-y-2 border-t border-neutral-800 text-xs">
          <p className="text-neutral-400">
            Belum memiliki akun?{' '}
            <button
              type="button"
              onClick={() => navigate('register')}
              className="text-[#ff0000] hover:underline font-semibold"
            >
              Daftar Sekarang
            </button>
          </p>

          <button
            type="button"
            onClick={() => navigate('dashboard')}
            className="text-neutral-500 hover:text-neutral-300 text-[11px] flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={12} />
            <span>Kembali ke Beranda (Mode Tamu)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
