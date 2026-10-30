/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Helper & Utilitas YouTube untuk YTM (YouTube Manager)
 * Mengelola ekstraksi ID video, pembuatan thumbnail, perhitungan durasi,
 * serta pengambilan otomatis metadata Judul Video & Info Saluran YouTube via oEmbed.
 */

// Interface untuk hasil metadata video YouTube
export interface YouTubeVideoMetadata {
  videoId: string;
  title: string;
  authorName: string;
  authorUrl: string;
  thumbnailUrl: string;
}

// Interface untuk hasil ekstraksi & metadata saluran YouTube
export interface YouTubeChannelMetadata {
  name: string;
  avatarUrl: string;
  handle?: string;
  channelId?: string;
  rawUrl?: string;
}

/**
 * Mengekstrak ID Video YouTube dari berbagai format tautan:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pola regex komprehensif untuk mendeteksi ID video YouTube (11 karakter)
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : null;
}

/**
 * Menghasilkan URL thumbnail YouTube berkualitas tinggi berdasarkan Video ID
 */
export function getYouTubeThumbnail(videoId: string, quality: 'hq' | 'maxres' | 'mq' = 'hq'): string {
  if (!videoId) return '';
  if (quality === 'maxres') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  if (quality === 'mq') {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Memformat detik menjadi teks jam:menit:detik (01:23:45 atau 05:30)
 */
export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (num: number) => String(num).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Mengonversi format durasi string (misal: "12:30" atau "01:15:00") menjadi detik
 */
export function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr) return 0;
  const parts = durationStr.trim().split(':').map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

/**
 * Menghitung persentase progres tontonan (0% hingga 100%)
 */
export function calculateProgressPercentage(timestampSeconds: number, durationSeconds: number): number {
  if (!durationSeconds || durationSeconds <= 0) return 0;
  if (!timestampSeconds || timestampSeconds <= 0) return 0;
  const percent = Math.min(100, Math.round((timestampSeconds / durationSeconds) * 100));
  return percent;
}

/**
 * Mengekstrak informasi saluran YouTube dari URL atau handle:
 * Mendukung format:
 * - https://www.youtube.com/@NamaSaluran
 * - https://www.youtube.com/c/NamaSaluran
 * - https://www.youtube.com/channel/UCxxxxxxxxxxxxxx
 * - https://www.youtube.com/user/NamaUser
 * - @NamaSaluran
 */
export function extractYouTubeChannelInfo(urlOrHandle: string): {
  type: 'handle' | 'channelId' | 'custom' | 'user' | 'unknown';
  identifier: string;
  displayName: string;
} | null {
  if (!urlOrHandle) return null;
  const trimmed = urlOrHandle.trim();

  // Format 1: @Handle langsung
  if (trimmed.startsWith('@')) {
    const handle = trimmed.slice(1);
    return {
      type: 'handle',
      identifier: handle,
      displayName: handle,
    };
  }

  // Format 2: URL YouTube dengan @handle
  const handleMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([a-zA-Z0-9_.-]+)/i);
  if (handleMatch && handleMatch[1]) {
    return {
      type: 'handle',
      identifier: handleMatch[1],
      displayName: handleMatch[1],
    };
  }

  // Format 3: URL Channel ID (UC...)
  const channelIdMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
  if (channelIdMatch && channelIdMatch[1]) {
    return {
      type: 'channelId',
      identifier: channelIdMatch[1],
      displayName: channelIdMatch[1],
    };
  }

  // Format 4: URL Custom /c/Nama
  const customMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/c\/([a-zA-Z0-9_.-]+)/i);
  if (customMatch && customMatch[1]) {
    return {
      type: 'custom',
      identifier: customMatch[1],
      displayName: customMatch[1],
    };
  }

  // Format 5: URL User /user/Nama
  const userMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/([a-zA-Z0-9_.-]+)/i);
  if (userMatch && userMatch[1]) {
    return {
      type: 'user',
      identifier: userMatch[1],
      displayName: userMatch[1],
    };
  }

  return null;
}

/**
 * Mengambil metadata Judul Video YouTube secara otomatis menggunakan YouTube oEmbed API publik.
 * Tanpa memerlukan API key berbayar dan sudah mendukung CORS.
 */
export async function fetchYouTubeVideoMetadata(urlOrVideoId: string): Promise<YouTubeVideoMetadata | null> {
  const videoId = extractYouTubeId(urlOrVideoId) || (urlOrVideoId.length === 11 ? urlOrVideoId : null);
  if (!videoId) return null;

  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(oembedUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      videoId,
      title: data.title || '',
      authorName: data.author_name || '',
      authorUrl: data.author_url || '',
      thumbnailUrl: data.thumbnail_url || getYouTubeThumbnail(videoId, 'hq'),
    };
  } catch (error) {
    // Logging minim untuk proses debugging senyap
    console.warn('Gagal mengambil metadata YouTube oEmbed:', error);
    return null;
  }
}

/**
 * Mengambil informasi Saluran YouTube (Nama Saluran & Foto Profil) secara otomatis.
 * Mendukung URL saluran, handle (@), maupun URL video dari saluran tersebut.
 */
export async function fetchYouTubeChannelMetadata(channelUrl: string): Promise<YouTubeChannelMetadata | null> {
  if (!channelUrl) return null;
  const trimmed = channelUrl.trim();

  // 1. Cek jika tautan yang dimasukkan sebenarnya adalah video YouTube
  const possibleVideoId = extractYouTubeId(trimmed);
  if (possibleVideoId) {
    const videoMeta = await fetchYouTubeVideoMetadata(possibleVideoId);
    if (videoMeta && videoMeta.authorName) {
      const channelInfo = extractYouTubeChannelInfo(videoMeta.authorUrl);
      const avatarUrl = channelInfo?.identifier
        ? `https://unavatar.io/youtube/${encodeURIComponent(channelInfo.identifier)}`
        : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(videoMeta.authorName)}`;

      return {
        name: videoMeta.authorName,
        avatarUrl,
        handle: channelInfo?.identifier,
        rawUrl: videoMeta.authorUrl || trimmed,
      };
    }
  }

  // 2. Cek format URL saluran YouTube (@handle, /c/, /channel/, /user/)
  const channelInfo = extractYouTubeChannelInfo(trimmed);
  if (channelInfo) {
    // Format nama saluran agar rapi
    const formattedName = channelInfo.displayName.replace(/[-_]/g, ' ');
    // Gunakan provider unavatar untuk YouTube avatar dengan fallback identicon
    const avatarUrl = channelInfo.type === 'handle' || channelInfo.type === 'custom' || channelInfo.type === 'user'
      ? `https://unavatar.io/youtube/${encodeURIComponent(channelInfo.identifier)}`
      : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(channelInfo.identifier)}`;

    return {
      name: formattedName,
      avatarUrl,
      handle: channelInfo.identifier,
      channelId: channelInfo.type === 'channelId' ? channelInfo.identifier : undefined,
      rawUrl: trimmed,
    };
  }

  return null;
}
