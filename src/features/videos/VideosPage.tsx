import React, { useState, useMemo } from "react";
import { useYtmStore, useFuseSearch } from "../../store/useYtmStore";
import { ProgressRing } from "../../components/ProgressRing";
import { Pagination } from "../../components/Pagination";
import { SkeletonList } from "../../components/SkeletonList";
import { DataFilterToolbar } from "../../components/DataFilterToolbar";
import { DeleteConfirmModal } from "../../components/DeleteConfirmModal";
import { formatDuration } from "../../lib/youtube";
import {
  PlaySquare,
  Plus,
  Filter,
  ArrowUpDown,
  Heart,
  Trash2,
} from "lucide-react";
import type { RoutePath, Video } from "../../types";

interface VideosPageProps {
  navigate: (route: RoutePath) => void;
  onOpenAddModal: (
    type: "video" | "channel" | "category" | "playlist",
    itemToEdit?: any,
  ) => void;
}

export const VideosPage: React.FC<VideosPageProps> = ({
  navigate,
  onOpenAddModal,
}) => {
  const {
    videos,
    setActiveVideoId,
    toggleFavoriteVideo,
    deleteVideo,
    isLoading,
  } = useYtmStore();

  // State Pencarian Lokal Fuse.js, Filter, dan Sortir
  const [localSearch, setLocalSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "updatedAt" | "title" | "rating" | "duration"
  >("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // State Modal Konfirmasi Hapus Video
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

  // Filter awal (tidak menampilkan video yang diarsipkan di halaman utama)
  const nonArchivedVideos = useMemo(() => {
    return videos.filter((v) => !v.isArchived);
  }, [videos]);

  // Pencarian Fuse.js terhadap judul, tag, nama saluran, dan kategori
  const searchedVideos = useFuseSearch(
    nonArchivedVideos,
    ["title", "tags", "channelName", "categoryName"],
    localSearch,
  );

  // Filter Status & Tag
  const filteredVideos = useMemo(() => {
    return searchedVideos.filter((v) => {
      if (filterStatus !== "all" && v.status !== filterStatus) return false;
      if (filterTag !== "all" && !v.tags.includes(filterTag)) return false;
      return true;
    });
  }, [searchedVideos, filterStatus, filterTag]);

  // Pengurutan (Sorting)
  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "rating") {
        comparison = a.rating - b.rating;
      } else if (sortBy === "duration") {
        comparison = a.durationSeconds - b.durationSeconds;
      } else {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });
  }, [filteredVideos, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedVideos.length / pageSize) || 1;
  const paginatedVideos = sortedVideos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Kumpulan tag unik untuk opsi filter
  const allAvailableTags = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => v.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [videos]);

  // Hitung jumlah kontrol aktif untuk badge indikator
  const activeFilterCount =
    (filterStatus !== "all" ? 1 : 0) +
    (filterTag !== "all" ? 1 : 0) +
    (sortBy !== "updatedAt" || sortOrder !== "desc" ? 1 : 0);

  const handleResetFilters = () => {
    setFilterStatus("all");
    setFilterTag("all");
    setSortBy("updatedAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const handleVideoClick = (videoId: string) => {
    setActiveVideoId(videoId);
    navigate("video-detail");
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;
    await deleteVideo(videoToDelete.id);
    setVideoToDelete(null);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header Halaman Video & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff0000]/15 text-[#ff0000] flex items-center justify-center">
            <PlaySquare size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Daftar Video
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenAddModal("video")}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-medium rounded-xl transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus size={15} />
          <span>Tambah Video</span>
        </button>
      </div>

      {/* Toolbar Filter, Sortir & Pencarian Fuse.js (Tersembunyi secara Default) */}
      <DataFilterToolbar
        searchQuery={localSearch}
        onSearchChange={(q) => {
          setLocalSearch(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Telusuri..."
        activeFilterCount={activeFilterCount}
        onResetFilters={handleResetFilters}
      >
        {/* Kontrol Filter Status */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 rounded-lg text-neutral-300">
          <Filter size={12} className="text-neutral-500" />
          <span className="text-[11px] text-neutral-400">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-white focus:outline-none text-xs"
          >
            <option value="all">Semua</option>
            <option value="To Watch">To Watch</option>
            <option value="Watching">Watching</option>
            <option value="Watched">Watched</option>
          </select>
        </div>

        {/* Kontrol Filter Tag */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 rounded-lg text-neutral-300">
          <span className="text-[11px] text-neutral-400">Tag:</span>
          <select
            value={filterTag}
            onChange={(e) => {
              setFilterTag(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-white focus:outline-none text-xs"
          >
            <option value="all">Semua Tag</option>
            {allAvailableTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        </div>

        {/* Kontrol Pengurutan */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 rounded-lg text-neutral-300">
            <ArrowUpDown size={12} className="text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white focus:outline-none text-xs"
            >
              <option value="updatedAt">Terakhir di edit</option>
              <option value="title">Judul</option>
              <option value="rating">Rating</option>
              <option value="duration">Durasi</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-2 py-1 bg-neutral-900 border border-neutral-700/80 rounded-lg text-neutral-300 hover:text-white text-xs"
            title={
              sortOrder === "asc" ? "Urutan Naik (A-Z)" : "Urutan Turun (Z-A)"
            }
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </DataFilterToolbar>

      {/* Grid Video Tampilan Gallery / Card */}
      {isLoading ? (
        <SkeletonList type="card" count={8} />
      ) : paginatedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => handleVideoClick(vid.id)}
              className="rounded-2xl bg-[#181818] border border-neutral-800 overflow-hidden hover:border-neutral-700 cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail dengan Badge Durasi & Tombol Aksi Cepat */}
                <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/85 backdrop-blur-xs rounded text-[11px] font-mono text-white tabular-nums">
                    {formatDuration(vid.durationSeconds)}
                  </div>

                  {/* Tombol Aksi Cepat: Favorit & Hapus */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteVideo(vid.id);
                      }}
                      className={`p-1.5 rounded-full bg-black/60 backdrop-blur-xs hover:bg-black/90 transition-colors ${
                        vid.isFavorite
                          ? "text-[#ff0000]"
                          : "text-neutral-400 hover:text-white"
                      }`}
                      title={
                        vid.isFavorite ? "Hapus Favorit" : "Tandai Favorit"
                      }
                    >
                      <Heart
                        size={14}
                        className={vid.isFavorite ? "fill-[#ff0000]" : ""}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoToDelete(vid);
                      }}
                      className="p-1.5 rounded-full bg-black/60 backdrop-blur-xs hover:bg-red-950/80 text-neutral-400 hover:text-red-400 transition-colors"
                      title="Hapus Video"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Konten Card: Judul, Channel, Tag */}
                <div className="p-3.5 space-y-2">
                  <h3 className="text-xs font-semibold text-white line-clamp-2 group-hover:text-[#ff0000] transition-colors leading-snug">
                    {vid.title}
                  </h3>

                  {vid.channelName && (
                    <p className="text-[11px] text-neutral-400 truncate">
                      {vid.channelName}
                    </p>
                  )}

                  {/* Tag Video (Multi-select) */}
                  {vid.tags && vid.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {vid.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300"
                        >
                          #{tag}
                        </span>
                      ))}
                      {vid.tags.length > 3 && (
                        <span className="text-[10px] text-neutral-500">
                          +{vid.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bagian Bawah: Status Badge & Video Progress Ring */}
              <div className="p-3.5 pt-0 flex items-center justify-between border-t border-neutral-800/70 mt-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    vid.status === "Watched"
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/70"
                      : vid.status === "Watching"
                        ? "bg-amber-950/80 text-amber-400 border border-amber-800/70"
                        : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {vid.status}
                </span>

                {/* Ring Kecil Berwarna Lengkap dengan Persen & Durasi */}
                <ProgressRing
                  durationSeconds={vid.durationSeconds}
                  timestampSeconds={vid.timestampSeconds}
                  status={vid.status}
                  size="sm"
                  showLabel={true}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800 p-6 space-y-2">
          <PlaySquare size={32} className="mx-auto text-neutral-600" />
          <h4 className="text-sm font-semibold text-white">
            Video belum ada
          </h4>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={sortedVideos.length}
      />

      {/* Modal Dialog Konfirmasi Hapus Video */}
      <DeleteConfirmModal
        isOpen={Boolean(videoToDelete)}
        title="Hapus Video Tersimpan"
        itemName={videoToDelete?.title}
        itemType="video"
        onConfirm={handleConfirmDelete}
        onClose={() => setVideoToDelete(null)}
      />
    </div>
  );
};
