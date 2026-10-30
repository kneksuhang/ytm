/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Pendaftaran Akun (RegisterPage)
 * Mendukung pendaftaran pengguna baru melalui Supabase Auth dengan Email, Google, dan GitHub.
 */

import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowLeft, Mail, Lock, User, UserPlus, Loader2 } from 'lucide-react';
import { Icon } from '@iconify/react';
import type { RoutePath } from '../../types';

interface RegisterPageProps {
  navigate: (route: RoutePath) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { signUpWithEmail, signInWithProvider, isLoading, errorMessage, clearError } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signUpWithEmail(email, password, displayName);
    if (result.success) {
      setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke halaman Masuk...');
      setTimeout(() => {
        navigate('login');
      }, 1200);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    await signInWithProvider(provider);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#181818] border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Header Register */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-7 bg-[#ff0000] rounded-lg flex items-center justify-center mx-auto shadow-sm">
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Daftar Akun YTM</h2>
          <p className="text-xs text-neutral-400">
            Simpan dan sinkronkan koleksi YouTube Anda ke Cloud Supabase.
          </p>
        </div>

        {successMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Form Pendaftaran */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-neutral-300 mb-1 font-medium">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => {
                  clearError();
                  setDisplayName(e.target.value);
                }}
                placeholder="Nama Anda"
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000]"
              />
            </div>
          </div>

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
                minLength={6}
                value={password}
                onChange={(e) => {
                  clearError();
                  setPassword(e.target.value);
                }}
                placeholder="Minimal 6 karakter"
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            <span>Buat Akun Sekarang</span>
          </button>
        </form>

        {/* Pembatas */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-800 w-full" />
          <span className="bg-[#181818] px-2 text-[11px] text-neutral-500 uppercase">atau</span>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="w-full py-2 px-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Icon icon="logos:google-icon" width="16" height="16" />
            <span>Daftar dengan Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('github')}
            className="w-full py-2 px-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Icon icon="mdi:github" width="18" height="18" />
            <span>Daftar dengan GitHub</span>
          </button>
        </div>

        {/* Navigasi ke Login */}
        <div className="text-center pt-2 border-t border-neutral-800 text-xs">
          <p className="text-neutral-400">
            Sudah memiliki akun?{' '}
            <button
              type="button"
              onClick={() => navigate('login')}
              className="text-[#ff0000] hover:underline font-semibold"
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
