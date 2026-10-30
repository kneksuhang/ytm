/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Inisialisasi Klien Supabase
 * Mengatur koneksi ke Supabase backend dengan konfigurasi env variabel.
 */

import { createClient } from '@supabase/supabase-js';

// Baca konfigurasi URL dan Anon Key dari environment Vite
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL || 'https://zcnilgeigsycnlvwcszm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbmlsZ2VpZ3N5Y25sdndjc3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMTYwMDcsImV4cCI6MjEwODU5MjAwN30.4ed-8XF4TyMqO2DXwv1ecnz1W-BNFFo92lwtdATiTs8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Memeriksa apakah koneksi Supabase terkonfigurasi dengan benar
 */
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseAnonKey !== 'MY_ANON_KEY');
};
