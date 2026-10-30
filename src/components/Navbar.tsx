import React, { useState } from "react";
import {
  Menu,
  Search,
  X,
  Sun,
  Moon,
  Plus,
  PlaySquare,
  FolderPlus,
  Tv,
  ListPlus,
  User,
  LogOut,
} from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { useYtmStore } from "../store/useYtmStore";
import type { RoutePath } from "../types";

interface NavbarProps {
  onToggleMobileDrawer: () => void;
  currentRoute: RoutePath;
  navigate: (route: RoutePath) => void;
  onOpenAddModal: (type: "video" | "channel" | "category" | "playlist") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileDrawer,
  currentRoute,
  navigate,
  onOpenAddModal,
}) => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, signOut } = useAuthStore();
  const { searchQuery, setSearchQuery } = useYtmStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#0f0f0f] border-b border-neutral-800 px-3 sm:px-5 flex items-center justify-between gap-3 select-none">
      {/* Zona 1: Tombol Hamburger & Logo YTM */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleMobileDrawer}
          className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Menu Navigasi"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          onClick={() => navigate("dashboard")}
          className="flex items-center gap-1.5 focus:outline-none group"
        >
          {/* Ikon YouTube Merah Khas */}
          <div className="w-8 h-6 bg-[#ff0000] rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-8 border-l-white border-b-[5px] border-b-transparent ml-0.5" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-base tracking-tight text-white">
              YTM
            </span>
          </div>
        </button>
      </div>

      {/* Zona 2: Bilah Pencarian Fuse.js Terpusat */}
      <div className="flex-1 max-w-md mx-auto hidden sm:block">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Telusuri..."
            className="w-full h-9 pl-3.5 pr-8 bg-neutral-900 border border-neutral-700/80 rounded-full text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff0000] transition-colors"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-neutral-400 hover:text-white"
            >
              <X size={14} />
            </button>
          ) : (
            <Search className="absolute right-3 text-neutral-500" size={14} />
          )}
        </div>
      </div>

      {/* Zona 3: Aksi Cepat (Tambah, Ganti Tema, Profil/Login) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Tombol Tambah Cepat (+) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors"
            title="Tambah Data Baru"
          >
            <Plus size={16} className="text-[#ff0000]" />
            <span className="hidden sm:inline">Buat</span>
          </button>

          {/* Dropdown Menu Tambah */}
          {showAddMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAddMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-[#181818] border border-neutral-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onOpenAddModal("video");
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors text-left"
                >
                  <PlaySquare size={16} className="text-[#ff0000]" />
                  <span>Tambah Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onOpenAddModal("channel");
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors text-left"
                >
                  <Tv size={16} className="text-amber-500" />
                  <span>Tambah Saluran</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onOpenAddModal("category");
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors text-left"
                >
                  <FolderPlus size={16} className="text-sky-500" />
                  <span>Tambah Kategori</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onOpenAddModal("playlist");
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors text-left"
                >
                  <ListPlus size={16} className="text-emerald-500" />
                  <span>Tambah Playlist</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Tombol Tema Gelap / Terang */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          title={
            theme === "dark"
              ? "Beralih ke Tema Terang"
              : "Beralih ke Tema Gelap"
          }
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Menu Akun Pengguna / Login */}
        <div className="relative">
          {user ? (
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 flex items-center justify-center hover:ring-2 hover:ring-[#ff0000] transition-all"
              title={user.displayName}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-white uppercase">
                  {user.displayName.charAt(0)}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("login")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-700 hover:border-[#ff0000] text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
            >
              <User size={14} className="text-[#ff0000]" />
              <span>Masuk</span>
            </button>
          )}

          {/* Dropdown Akun Pengguna */}
          {showUserMenu && user && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-[#181818] border border-neutral-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-3.5 py-2 border-b border-neutral-800">
                  <p className="font-semibold text-white truncate">
                    {user.displayName}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("settings");
                  }}
                  className="w-full px-3.5 py-2 text-left text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  Pengaturan Akun
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2 text-red-400 hover:bg-neutral-800 hover:text-red-300 transition-colors text-left"
                >
                  <LogOut size={14} />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
