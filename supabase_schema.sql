-- ==============================================================================
-- SKEMA BASIS DATA SUPABASE UNTUK YTM (YOUTUBE MANAGER)
-- File: supabase_schema.sql
-- Keterangan: Skrip DDL PostgreSQL mutakhir dengan tipe TEXT ID untuk kompatibilitas frontend,
--            Indeks performa, Kebijakan Keamanan Tingkat Baris (RLS), Trigger updated_at,
--            dan relasi Foreign Key dengan aturan ON DELETE yang aman.
-- ==============================================================================

-- 1. Ekstensi UUID untuk pembuatan identifier acak
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Fungsi Pemicu Otomatis untuk Memperbarui Kolom updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Tabel Profil Pengguna (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger updated_at untuk profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Tabel Kategori (Categories)
-- Mendukung id berupa TEXT (misal: 'cat-1730000000000') atau UUID string
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  icon TEXT DEFAULT 'solar:folder-with-files-bold',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger updated_at untuk categories
DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Tabel Saluran YouTube (Channels)
-- Mendukung id berupa TEXT (misal: 'ch-1730000000000') atau UUID string
CREATE TABLE IF NOT EXISTS public.channels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  link TEXT,
  tag TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger updated_at untuk channels
DROP TRIGGER IF EXISTS set_channels_updated_at ON public.channels;
CREATE TRIGGER set_channels_updated_at
  BEFORE UPDATE ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Tabel Daftar Putar (Playlists)
-- Mendukung id berupa TEXT (misal: 'pl-1730000000000') atau UUID string
CREATE TABLE IF NOT EXISTS public.playlists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_archived BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger updated_at untuk playlists
DROP TRIGGER IF EXISTS set_playlists_updated_at ON public.playlists;
CREATE TRIGGER set_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Tabel Video YouTube (Videos)
-- Mendukung id berupa TEXT (misal: 'vid-1730000000000') atau UUID string
CREATE TABLE IF NOT EXISTS public.videos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'To Watch' CHECK (status IN ('To Watch', 'Watching', 'Watched')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  channel_id TEXT REFERENCES public.channels(id) ON DELETE SET NULL,
  channel_name TEXT,
  playlist_id TEXT REFERENCES public.playlists(id) ON DELETE SET NULL,
  playlist_name TEXT,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  link TEXT NOT NULL,
  youtube_id TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  timestamp_seconds INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger updated_at untuk videos
DROP TRIGGER IF EXISTS set_videos_updated_at ON public.videos;
CREATE TRIGGER set_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 8. Tabel Tag Pengguna (Tags)
CREATE TABLE IF NOT EXISTS public.tags (
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (name, user_id)
);

-- 9. Indeks Performa untuk Pencarian dan Relasi Cepat
CREATE INDEX IF NOT EXISTS idx_channels_user ON public.channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_name ON public.channels(name);
CREATE INDEX IF NOT EXISTS idx_categories_user ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_user ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_channel ON public.videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_playlist ON public.videos(playlist_id);
CREATE INDEX IF NOT EXISTS idx_videos_category ON public.videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_is_archived ON public.videos(is_archived);
CREATE INDEX IF NOT EXISTS idx_videos_is_favorite ON public.videos(is_favorite);
CREATE INDEX IF NOT EXISTS idx_videos_updated_at ON public.videos(updated_at DESC);

-- 10. Mengaktifkan Row Level Security (RLS) di Seluruh Tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- 11. Kebijakan Keamanan Tingkat Baris (RLS Policies)
-- Kebijakan Profiles
DROP POLICY IF EXISTS "Pengguna dapat mengelola profil mereka sendiri" ON public.profiles;
CREATE POLICY "Pengguna dapat mengelola profil mereka sendiri" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Kebijakan Categories (Pengguna otentikasi atau sesi tamu lokal)
DROP POLICY IF EXISTS "Pengguna dapat mengelola kategori mereka sendiri" ON public.categories;
CREATE POLICY "Pengguna dapat mengelola kategori mereka sendiri" ON public.categories
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

-- Kebijakan Channels
DROP POLICY IF EXISTS "Pengguna dapat mengelola channel mereka sendiri" ON public.channels;
CREATE POLICY "Pengguna dapat mengelola channel mereka sendiri" ON public.channels
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

-- Kebijakan Playlists
DROP POLICY IF EXISTS "Pengguna dapat mengelola playlist mereka sendiri" ON public.playlists;
CREATE POLICY "Pengguna dapat mengelola playlist mereka sendiri" ON public.playlists
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

-- Kebijakan Videos
DROP POLICY IF EXISTS "Pengguna dapat mengelola video mereka sendiri" ON public.videos;
CREATE POLICY "Pengguna dapat mengelola video mereka sendiri" ON public.videos
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);

-- Kebijakan Tags
DROP POLICY IF EXISTS "Pengguna dapat mengelola tag mereka sendiri" ON public.tags;
CREATE POLICY "Pengguna dapat mengelola tag mereka sendiri" ON public.tags
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL);
