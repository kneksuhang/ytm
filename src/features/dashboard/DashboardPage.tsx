import React, { useMemo } from "react";
import { useYtmStore } from "../../store/useYtmStore";
import { RatingStars } from "../../components/RatingStars";
import { ProgressRing } from "../../components/ProgressRing";
import { Icon } from "@iconify/react";
import { ChannelAvatar } from "../../components/ChannelAvatar";
import {
  Clock,
  Calendar,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  PlaySquare,
  Tv,
  FolderTree,
  ListVideo,
} from "lucide-react";
import { formatDuration } from "../../lib/youtube";
import type { RoutePath } from "../../types";

interface DashboardPageProps {
  navigate: (route: RoutePath) => void;
  onOpenAddModal: (type: "video" | "channel" | "category" | "playlist") => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  navigate,
  onOpenAddModal,
}) => {
  const {
    videos,
    channels,
    categories,
    playlists,
    setActiveChannelId,
    setActiveCategoryId,
    setActiveVideoId,
    setActivePlaylistId,
  } = useYtmStore();

  // 1. Perhitungan 3 Komponen Overview:
  // - Today’s Watched
  // - Watched This Week
  // - Watched This Month
  const overviewStats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const oneWeekAgo = now.getTime() - 7 * 86400000;
    const oneMonthAgo = now.getTime() - 30 * 86400000;

    let todayCount = 0;
    let todaySeconds = 0;

    let weekCount = 0;
    let weekSeconds = 0;

    let monthCount = 0;
    let monthSeconds = 0;

    videos.forEach((vid) => {
      if (vid.status === "Watched" || vid.timestampSeconds > 0) {
        const watchTime = vid.watchedAt
          ? new Date(vid.watchedAt).getTime()
          : new Date(vid.updatedAt).getTime();
        const durationContributed =
          vid.status === "Watched" ? vid.durationSeconds : vid.timestampSeconds;

        if (watchTime >= startOfToday) {
          todayCount++;
          todaySeconds += durationContributed;
        }
        if (watchTime >= oneWeekAgo) {
          weekCount++;
          weekSeconds += durationContributed;
        }
        if (watchTime >= oneMonthAgo) {
          monthCount++;
          monthSeconds += durationContributed;
        }
      }
    });

    return {
      today: { count: todayCount, duration: todaySeconds },
      week: { count: weekCount, duration: weekSeconds },
      month: { count: monthCount, duration: monthSeconds },
    };
  }, [videos]);

  // 2. 10 Kategori yang berisi video (bukan yang kosong)
  const categoriesWithVideos = useMemo(() => {
    return categories
      .map((cat) => {
        const catVideos = videos.filter(
          (v) => v.categoryId === cat.id || v.categoryName === cat.name,
        );
        return {
          ...cat,
          videoCount: catVideos.length,
        };
      })
      .filter((cat) => cat.videoCount > 0)
      .slice(0, 10);
  }, [categories, videos]);

  // 3. 10 Daftar Channels
  const topChannels = useMemo(() => {
    return channels.filter((c) => !c.isArchived).slice(0, 10);
  }, [channels]);

  // 4. 10 Video Terakhir (berdasarkan updatedAt terbaru)
  const recentVideos = useMemo(() => {
    return [...videos]
      .filter((v) => !v.isArchived)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 10);
  }, [videos]);

  // 5. 10 Playlist
  const topPlaylists = useMemo(() => {
    return playlists.filter((p) => !p.isArchived).slice(0, 10);
  }, [playlists]);

  const goToChannelDetail = (id: string) => {
    setActiveChannelId(id);
    navigate("channel-detail");
  };

  const goToCategoryDetail = (id: string) => {
    setActiveCategoryId(id);
    navigate("category-detail");
  };

  const goToVideoDetail = (id: string) => {
    setActiveVideoId(id);
    navigate("video-detail");
  };

  const goToPlaylistDetail = (id: string) => {
    setActivePlaylistId(id);
    navigate("playlist-detail");
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* ============================================================== */}
      {/* 1. TIGA KOMPONEN OVERVIEW: TODAY, THIS WEEK, THIS MONTH         */}
      {/* ============================================================== */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Today's Watched */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                <Clock size={14} className="text-[#ff0000]" />
                Today’s Watched
              </p>
              <h4 className="text-2xl font-bold text-white  mt-1.5 tabular-nums">
                {overviewStats.today.count}{" "}
                <span className="text-xs font-normal text-neutral-400">
                  video
                </span>
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 tabular-nums">
                Durasi: {formatDuration(overviewStats.today.duration)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ff0000]/15 text-[#ff0000] flex items-center justify-center shrink-0">
              <CheckCircle size={20} />
            </div>
          </div>

          {/* Card 2: Watched This Week */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-500" />
                Watched This Week
              </p>
              <h4 className="text-2xl font-bold text-white mt-1.5 tabular-nums">
                {overviewStats.week.count}{" "}
                <span className="text-xs font-normal text-neutral-400">
                  video
                </span>
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 tabular-nums">
                Durasi: {formatDuration(overviewStats.week.duration)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
          </div>

          {/* Card 3: Watched This Month */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-500" />
                Watched This Month
              </p>
              <h4 className="text-2xl font-bold text-white mt-1.5 tabular-nums">
                {overviewStats.month.count}{" "}
                <span className="text-xs font-normal text-neutral-400">
                  video
                </span>
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 tabular-nums">
                Durasi: {formatDuration(overviewStats.month.duration)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. 10 KATEGORI BERISI VIDEO (BUKAN KOSONG)                     */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree size={18} className="text-[#ff0000]" />
            <h3 className="text-sm font-semibold text-white">
              10 Kategori Teratas
            </h3>
          </div>
          <button
            type="button"
            onClick={() => navigate("categories")}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-0.5"
          >
            <span>Lihat Semua</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {categoriesWithVideos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {categoriesWithVideos.map((cat) => (
              <div
                key={cat.id}
                onClick={() => goToCategoryDetail(cat.id)}
                className="p-3 rounded-xl bg-[#181818] border border-neutral-800 hover:border-neutral-700 hover:bg-[#202020] cursor-pointer transition-colors group flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-neutral-800 text-[#ff0000] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon
                    icon={cat.icon || "solar:folder-with-files-bold"}
                    width="20"
                    height="20"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-medium text-white truncate group-hover:text-[#ff0000] transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 tabular-nums">
                    {cat.videoCount} video
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400">
            Belum ada kategori.
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 3. 10 DAFTAR CHANNELS (GALLERY / CARD SMALL)                   */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv size={18} className="text-[#ff0000]" />
            <h3 className="text-sm font-semibold text-white">
              10 Saluran Unggulan
            </h3>
          </div>
          <button
            type="button"
            onClick={() => navigate("channels")}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-0.5"
          >
            <span>Semua Saluran</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {topChannels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {topChannels.map((ch) => (
              <div
                key={ch.id}
                onClick={() => goToChannelDetail(ch.id)}
                className="p-3 rounded-xl bg-[#181818] border border-neutral-800 hover:border-neutral-700 hover:bg-[#202020] cursor-pointer transition-all flex flex-col items-center text-center group"
              >
                <ChannelAvatar
                  name={ch.name}
                  avatarUrl={ch.avatarUrl}
                  size="md"
                  className="group-hover:scale-105 transition-transform"
                />
                <h4 className="text-xs font-semibold text-white mt-2 truncate w-full group-hover:text-[#ff0000] transition-colors">
                  {ch.name}
                </h4>
                <div className="mt-1">
                  <RatingStars rating={ch.rating} size="sm" />
                </div>
                {ch.link && (
                  <a
                    href={ch.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <ExternalLink size={10} />
                    <span>Kunjungi</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
            <span>Belum ada saluran.</span>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 4. 10 VIDEO TERAKHIR                                           */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlaySquare size={18} className="text-[#ff0000]" />
            <h3 className="text-sm font-semibold text-white">
              10 Video Terakhir
            </h3>
          </div>
          <button
            type="button"
            onClick={() => navigate("videos")}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-0.5"
          >
            <span>Semua Video</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {recentVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {recentVideos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => goToVideoDetail(vid.id)}
                className="rounded-xl bg-[#181818] border border-neutral-800 overflow-hidden hover:border-neutral-700 cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-mono text-white tabular-nums">
                      {formatDuration(vid.durationSeconds)}
                    </div>
                  </div>

                  <div className="p-2.5 space-y-1.5">
                    <h4 className="text-xs font-semibold text-white line-clamp-2 group-hover:text-[#ff0000] transition-colors">
                      {vid.title}
                    </h4>
                    {vid.channelName && (
                      <p className="text-[11px] text-neutral-400 truncate">
                        {vid.channelName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-2.5 pt-0 flex items-center justify-between border-t border-neutral-800/60 mt-1">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      vid.status === "Watched"
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                        : vid.status === "Watching"
                          ? "bg-amber-950/80 text-amber-400 border border-amber-800/60"
                          : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {vid.status}
                  </span>

                  <ProgressRing
                    durationSeconds={vid.durationSeconds}
                    timestampSeconds={vid.timestampSeconds}
                    status={vid.status}
                    size="sm"
                    showLabel={false}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
            <span>Belum ada video.</span>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 5. 10 PLAYLIST                                                 */}
      {/* ============================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListVideo size={18} className="text-[#ff0000]" />
            <h3 className="text-sm font-semibold text-white">
              10 Playlist Pilihan
            </h3>
          </div>
          <button
            type="button"
            onClick={() => navigate("playlists")}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-0.5"
          >
            <span>Semua Playlist</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {topPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topPlaylists.map((pl) => {
              const plVideos = videos.filter((v) => pl.videoIds.includes(v.id));
              const total = plVideos.length;
              const watched = plVideos.filter(
                (v) => v.status === "Watched",
              ).length;
              const percent =
                total > 0 ? Math.round((watched / total) * 100) : 0;

              return (
                <div
                  key={pl.id}
                  onClick={() => goToPlaylistDetail(pl.id)}
                  className="p-3.5 rounded-xl bg-[#181818] border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all space-y-2.5 group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-white truncate flex-1 group-hover:text-[#ff0000] transition-colors">
                      {pl.name}
                    </h4>
                    <span className="text-[11px] text-neutral-400 tabular-nums ml-2">
                      {total} video
                    </span>
                  </div>

                  {pl.categoryName && (
                    <p className="text-[11px] text-neutral-400 truncate">
                      Kategori:{" "}
                      <span className="text-neutral-300">
                        {pl.categoryName}
                      </span>
                    </p>
                  )}

                  {/* Bar Progres Watched */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Watched</span>
                      <span className="tabular-nums font-mono text-emerald-400">
                        {watched}/{total} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
            <span>Belum ada playlist.</span>
          </div>
        )}
      </section>
    </div>
  );
};
