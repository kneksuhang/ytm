/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Pivot Data & Analisis Tabular (PivotDataPage)
 * Fitur analisis multidimensi data video, channel, dan kategori:
 * - Pengelompokan Baris (Rows): Kategori, Saluran, Status, Rating, atau Tag
 * - Pengelompokan Kolom Silang (Columns): Status, Rating, Kategori, atau Tanpa Kolom
 * - Metrik Agregasi (Metrics): Jumlah Video, Total Durasi, Rata-rata Durasi, Rata-rata Rating, Watched Count
 * - Heatmap visual lembut pada sel tabel untuk representasi proporsi data
 * - Preset Pivot Cepat (Quick Presets)
 * - Filter & Pencarian Fuse.js tersembunyi menggunakan DataFilterToolbar
 * - Ekspor hasil tabel pivot ke format CSV
 * - Drill-down modal rincian video saat sel pivot diklik
 */

import React, { useState, useMemo } from 'react';
import { useYtmStore, useFuseSearch } from '../../store/useYtmStore';
import { DataFilterToolbar } from '../../components/DataFilterToolbar';
import { formatDuration } from '../../lib/youtube';
import {
  TableProperties,
  Download,
  Layers,
  Sliders,
  Filter,
  CheckCircle2,
  PlaySquare,
  Clock,
  Star,
  Eye,
  Tv,
  FolderTree,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import type { RoutePath, Video, VideoStatus } from '../../types';

interface PivotDataPageProps {
  navigate: (route: RoutePath) => void;
}

// Opsi Dimensi Baris
type RowDimension = 'category' | 'channel' | 'status' | 'rating' | 'tag';

// Opsi Dimensi Kolom
type ColDimension = 'none' | 'status' | 'rating' | 'category';

// Opsi Metrik Agregasi
type MetricType = 'count' | 'totalDuration' | 'avgDuration' | 'avgRating' | 'watchedCount';

export const PivotDataPage: React.FC<PivotDataPageProps> = ({ navigate }) => {
  const { videos, channels, categories, setActiveVideoId } = useYtmStore();

  // Konfigurasi Pivot
  const [rowDimension, setRowDimension] = useState<RowDimension>('category');
  const [colDimension, setColDimension] = useState<ColDimension>('status');
  const [metric, setMetric] = useState<MetricType>('count');

  // Filter Sumber Data (Tersembunyi secara default di balik DataFilterToolbar)
  const [localSearch, setLocalSearch] = useState<string>('');
  const [filterSource, setFilterSource] = useState<'all' | 'active' | 'favorites'>('active');

  // State Modal Drill-down Video saat sel diklik
  const [drillDownInfo, setDrillDownInfo] = useState<{
    title: string;
    videos: Video[];
  } | null>(null);

  // Filter awal data masukan
  const baseVideos = useMemo(() => {
    return videos.filter((v) => {
      if (filterSource === 'active') return !v.isArchived;
      if (filterSource === 'favorites') return v.isFavorite && !v.isArchived;
      return true;
    });
  }, [videos, filterSource]);

  // Pencarian Fuse.js
  const filteredVideos = useFuseSearch(
    baseVideos,
    ['title', 'channelName', 'categoryName', 'tags'],
    localSearch
  );

  // Ambil label untuk baris data video
  const getRowKey = (video: Video, dim: RowDimension): string[] => {
    switch (dim) {
      case 'category':
        return [video.categoryName || 'Tanpa Kategori'];
      case 'channel':
        return [video.channelName || 'Tanpa Saluran'];
      case 'status':
        return [video.status || 'To Watch'];
      case 'rating':
        return [video.rating > 0 ? `${video.rating} Bintang` : 'Belum Dinilai'];
      case 'tag':
        return video.tags && video.tags.length > 0 ? video.tags : ['Tanpa Tag'];
      default:
        return ['Lainnya'];
    }
  };

  // Ambil nilai kolom silang video
  const getColKey = (video: Video, dim: ColDimension): string => {
    switch (dim) {
      case 'status':
        return video.status || 'To Watch';
      case 'rating':
        return video.rating > 0 ? `${video.rating}★` : '0★';
      case 'category':
        return video.categoryName || 'Tanpa Kategori';
      case 'none':
      default:
        return 'Nilai';
    }
  };

  // Kalkulasi Matriks Pivot
  const pivotData = useMemo(() => {
    const rowMap = new Map<string, { [colKey: string]: Video[] }>();
    const allColsSet = new Set<string>();

    filteredVideos.forEach((v) => {
      const rowKeys = getRowKey(v, rowDimension);
      const colKey = getColKey(v, colDimension);

      allColsSet.add(colKey);

      rowKeys.forEach((rKey) => {
        if (!rowMap.has(rKey)) {
          rowMap.set(rKey, {});
        }
        const rowObj = rowMap.get(rKey)!;
        if (!rowObj[colKey]) {
          rowObj[colKey] = [];
        }
        rowObj[colKey].push(v);
      });
    });

    // Susun daftar kolom unik dengan urutan logis
    let colKeys = Array.from(allColsSet);
    if (colDimension === 'status') {
      const statusOrder = ['To Watch', 'Watching', 'Watched'];
      colKeys = colKeys.sort((a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b));
    } else if (colDimension === 'rating') {
      colKeys = colKeys.sort((a, b) => parseInt(b) - parseInt(a));
    } else {
      colKeys.sort();
    }

    // Susun baris
    const rowKeys = Array.from(rowMap.keys()).sort((a, b) => a.localeCompare(b));

    // Hitung agregasi untuk setiap sel
    const computeAgg = (vList: Video[] = []) => {
      if (vList.length === 0) return { val: 0, formatted: '-' };

      switch (metric) {
        case 'count':
          return { val: vList.length, formatted: vList.length.toString() };
        case 'totalDuration': {
          const sumSec = vList.reduce((acc, v) => acc + (v.durationSeconds || 0), 0);
          return { val: sumSec, formatted: formatDuration(sumSec) };
        }
        case 'avgDuration': {
          const sumSec = vList.reduce((acc, v) => acc + (v.durationSeconds || 0), 0);
          const avgSec = Math.round(sumSec / vList.length);
          return { val: avgSec, formatted: formatDuration(avgSec) };
        }
        case 'avgRating': {
          const sumRating = vList.reduce((acc, v) => acc + (v.rating || 0), 0);
          const avg = sumRating / vList.length;
          return { val: avg, formatted: avg.toFixed(1) + '★' };
        }
        case 'watchedCount': {
          const watched = vList.filter((v) => v.status === 'Watched').length;
          const pct = Math.round((watched / vList.length) * 100);
          return { val: watched, formatted: `${watched} (${pct}%)` };
        }
      }
    };

    // Temukan nilai maksimum sel untuk efek visual heatmap lembut
    let maxVal = 0;
    rowKeys.forEach((r) => {
      const row = rowMap.get(r)!;
      colKeys.forEach((c) => {
        const list = row[c] || [];
        const agg = computeAgg(list);
        if (agg.val > maxVal) maxVal = agg.val;
      });
    });

    return {
      rowKeys,
      colKeys,
      rowMap,
      computeAgg,
      maxVal: maxVal || 1,
    };
  }, [filteredVideos, rowDimension, colDimension, metric]);

  // Ekspor hasil Pivot ke CSV
  const handleExportCSV = () => {
    const headers = ['Grup', ...pivotData.colKeys, 'Total Baris'];
    const rows: string[][] = [];

    pivotData.rowKeys.forEach((rKey) => {
      const rowObj = pivotData.rowMap.get(rKey)!;
      let allRowVideos: Video[] = [];

      const colValues = pivotData.colKeys.map((cKey) => {
        const vList = rowObj[cKey] || [];
        allRowVideos = allRowVideos.concat(vList);
        return `"${pivotData.computeAgg(vList).formatted}"`;
      });

      const totalVal = pivotData.computeAgg(allRowVideos).formatted;
      rows.push([`"${rKey}"`, ...colValues, `"${totalVal}"`]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YTM_Pivot_${rowDimension}_x_${colDimension}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preset Cepat
  const applyPreset = (preset: 'cat-status' | 'channel-status' | 'cat-rating' | 'status-dur') => {
    if (preset === 'cat-status') {
      setRowDimension('category');
      setColDimension('status');
      setMetric('count');
    } else if (preset === 'channel-status') {
      setRowDimension('channel');
      setColDimension('status');
      setMetric('count');
    } else if (preset === 'cat-rating') {
      setRowDimension('category');
      setColDimension('none');
      setMetric('avgRating');
    } else if (preset === 'status-dur') {
      setRowDimension('status');
      setColDimension('none');
      setMetric('totalDuration');
    }
  };

  const activeFilterCount = (filterSource !== 'active' ? 1 : 0);

  return (
    <div className="space-y-5 pb-20 md:pb-8 select-none">
      {/* 1. Header Halaman Pivot Data */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff0000]/15 text-[#ff0000] flex items-center justify-center">
            <TableProperties size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Pivot Data</h1>
            <p className="text-[11px] text-neutral-400">
              Analisis tabular dan agregasi multidimensi data video, saluran, dan kategori.
            </p>
          </div>
        </div>

        {/* Tombol Ekspor CSV */}
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={pivotData.rowKeys.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl transition-colors self-start sm:self-auto border border-neutral-700/80 disabled:opacity-40"
          title="Unduh hasil tabel pivot ke file CSV"
        >
          <Download size={14} className="text-[#ff0000]" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* 2. Preset Cepat Analisis (Quick Presets) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-neutral-400 flex items-center gap-1">
          <Sparkles size={12} className="text-amber-500" />
          <span>Preset Cepat:</span>
        </span>
        <button
          type="button"
          onClick={() => applyPreset('cat-status')}
          className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
            rowDimension === 'category' && colDimension === 'status' && metric === 'count'
              ? 'bg-[#ff0000]/15 border-[#ff0000] text-white font-medium'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
          }`}
        >
          Kategori × Status
        </button>
        <button
          type="button"
          onClick={() => applyPreset('channel-status')}
          className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
            rowDimension === 'channel' && colDimension === 'status' && metric === 'count'
              ? 'bg-[#ff0000]/15 border-[#ff0000] text-white font-medium'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
          }`}
        >
          Saluran × Status
        </button>
        <button
          type="button"
          onClick={() => applyPreset('cat-rating')}
          className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
            rowDimension === 'category' && colDimension === 'none' && metric === 'avgRating'
              ? 'bg-[#ff0000]/15 border-[#ff0000] text-white font-medium'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
          }`}
        >
          Kategori × Rating
        </button>
        <button
          type="button"
          onClick={() => applyPreset('status-dur')}
          className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
            rowDimension === 'status' && colDimension === 'none' && metric === 'totalDuration'
              ? 'bg-[#ff0000]/15 border-[#ff0000] text-white font-medium'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
          }`}
        >
          Status × Durasi
        </button>
      </div>

      {/* 3. Panel Konfigurasi Baris, Kolom, & Metrik (Kompak & Modern) */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#181818] border border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Pilihan Dimensi Baris */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
            <Layers size={13} className="text-neutral-400" />
            <span>Dimensi Baris (Rows):</span>
          </label>
          <select
            value={rowDimension}
            onChange={(e) => setRowDimension(e.target.value as RowDimension)}
            className="w-full py-1.5 px-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-[#ff0000]"
          >
            <option value="category">Kategori Video</option>
            <option value="channel">Saluran (Channel)</option>
            <option value="status">Status Tontonan</option>
            <option value="rating">Rating Bintang</option>
            <option value="tag">Tag</option>
          </select>
        </div>

        {/* Pilihan Dimensi Kolom */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
            <Sliders size={13} className="text-neutral-400" />
            <span>Dimensi Kolom (Columns):</span>
          </label>
          <select
            value={colDimension}
            onChange={(e) => setColDimension(e.target.value as ColDimension)}
            className="w-full py-1.5 px-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-[#ff0000]"
          >
            <option value="status">Status (To Watch / Watching / Watched)</option>
            <option value="rating">Rating Bintang (1 - 5★)</option>
            <option value="category">Kategori</option>
            <option value="none">Tanpa Kolom Silang (Datar)</option>
          </select>
        </div>

        {/* Pilihan Metrik Agregasi */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            <span>Metrik Nilai (Values):</span>
          </label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as MetricType)}
            className="w-full py-1.5 px-2.5 bg-neutral-900 border border-neutral-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-[#ff0000]"
          >
            <option value="count">Jumlah Video (Count)</option>
            <option value="totalDuration">Total Durasi (Sum)</option>
            <option value="avgDuration">Rata-rata Durasi (Avg)</option>
            <option value="avgRating">Rata-rata Rating Bintang</option>
            <option value="watchedCount">Jumlah Sudah Ditonton (%)</option>
          </select>
        </div>
      </div>

      {/* 4. Toolbar Filter & Pencarian Fuse.js Tersembunyi (Sesuai Aturan) */}
      <DataFilterToolbar
        searchQuery={localSearch}
        onSearchChange={(q) => setLocalSearch(q)}
        searchPlaceholder="Saring data yang dihitung dalam pivot..."
        activeFilterCount={activeFilterCount}
        onResetFilters={() => {
          setLocalSearch('');
          setFilterSource('active');
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400">Sumber Data:</span>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value as any)}
            className="bg-neutral-900 border border-neutral-700/80 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
          >
            <option value="active">Data Aktif (Tanpa Arsip)</option>
            <option value="all">Seluruh Data (Termasuk Arsip)</option>
            <option value="favorites">Hanya Koleksi Favorit</option>
          </select>
        </div>

        <span className="text-[11px] text-neutral-400 ml-auto">
          Menganalisis <strong className="text-white">{filteredVideos.length}</strong> video
        </span>
      </DataFilterToolbar>

      {/* 5. Tabel Pivot Interaktif */}
      {pivotData.rowKeys.length > 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-[#181818] overflow-hidden shadow-xl">
          <div className="overflow-x-auto max-h-[650px] scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              {/* Header Kolom Pivot */}
              <thead className="bg-[#121212] text-neutral-300 sticky top-0 z-20 border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4 font-bold text-white bg-[#121212] sticky left-0 z-30 min-w-[170px] border-r border-neutral-800/80">
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{rowDimension}</span>
                      <span className="text-[10px] text-neutral-500 font-normal">
                        ({pivotData.rowKeys.length})
                      </span>
                    </div>
                  </th>

                  {pivotData.colKeys.map((cKey) => (
                    <th
                      key={cKey}
                      className="py-3 px-3.5 font-semibold text-center min-w-[110px] border-r border-neutral-800/60"
                    >
                      <span className="truncate block">{cKey}</span>
                    </th>
                  ))}

                  {/* Kolom Total Baris */}
                  {colDimension !== 'none' && (
                    <th className="py-3 px-3.5 font-bold text-center min-w-[120px] bg-[#1a1a1a] text-white">
                      Total
                    </th>
                  )}
                </tr>
              </thead>

              {/* Badan Tabel Pivot */}
              <tbody className="divide-y divide-neutral-800/70 text-neutral-200">
                {pivotData.rowKeys.map((rKey) => {
                  const rowObj = pivotData.rowMap.get(rKey)!;
                  let allRowVideos: Video[] = [];

                  return (
                    <tr key={rKey} className="hover:bg-neutral-800/40 transition-colors group">
                      {/* Sel Baris Sticky Kiri */}
                      <td className="py-2.5 px-4 font-medium text-white sticky left-0 z-10 bg-[#181818] group-hover:bg-[#202020] border-r border-neutral-800/80 truncate max-w-[200px]">
                        {rKey}
                      </td>

                      {/* Sel-Sel Matriks */}
                      {pivotData.colKeys.map((cKey) => {
                        const cellVideos = rowObj[cKey] || [];
                        allRowVideos = allRowVideos.concat(cellVideos);
                        const agg = pivotData.computeAgg(cellVideos);
                        const intensity = cellVideos.length > 0 ? (agg.val / pivotData.maxVal) : 0;

                        return (
                          <td
                            key={cKey}
                            onClick={() => {
                              if (cellVideos.length > 0) {
                                setDrillDownInfo({
                                  title: `${rKey} · ${cKey}`,
                                  videos: cellVideos,
                                });
                              }
                            }}
                            className={`py-2.5 px-3 text-center border-r border-neutral-800/50 tabular-nums transition-colors ${
                              cellVideos.length > 0
                                ? 'cursor-pointer hover:bg-neutral-700/50 hover:text-white font-medium'
                                : 'text-neutral-600'
                            }`}
                            style={{
                              backgroundColor:
                                cellVideos.length > 0 && metric === 'count'
                                  ? `rgba(255, 0, 0, ${Math.min(0.25, Math.max(0.04, intensity * 0.25))})`
                                  : undefined,
                            }}
                            title={
                              cellVideos.length > 0
                                ? `${cellVideos.length} video. Klik untuk melihat daftar video.`
                                : 'Kosong'
                            }
                          >
                            <span>{agg.formatted}</span>
                          </td>
                        );
                      })}

                      {/* Kolom Total Baris */}
                      {colDimension !== 'none' && (
                        <td
                          onClick={() => {
                            if (allRowVideos.length > 0) {
                              setDrillDownInfo({
                                title: `Total · ${rKey}`,
                                videos: allRowVideos,
                              });
                            }
                          }}
                          className="py-2.5 px-3 text-center bg-neutral-900/60 font-bold text-white tabular-nums border-l border-neutral-800/80 cursor-pointer hover:bg-neutral-800 transition-colors"
                          title="Klik untuk melihat seluruh video pada baris ini"
                        >
                          {pivotData.computeAgg(allRowVideos).formatted}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>

              {/* Baris Total Keseluruhan (Grand Total) */}
              <tfoot className="bg-[#121212] font-bold text-white border-t-2 border-neutral-700 sticky bottom-0 z-20">
                <tr>
                  <td className="py-3 px-4 sticky left-0 z-30 bg-[#121212] border-r border-neutral-800">
                    Grand Total
                  </td>

                  {pivotData.colKeys.map((cKey) => {
                    let allColVideos: Video[] = [];
                    pivotData.rowKeys.forEach((rKey) => {
                      const list = pivotData.rowMap.get(rKey)![cKey] || [];
                      allColVideos = allColVideos.concat(list);
                    });

                    return (
                      <td
                        key={cKey}
                        onClick={() => {
                          if (allColVideos.length > 0) {
                            setDrillDownInfo({
                              title: `Total Kolom: ${cKey}`,
                              videos: allColVideos,
                            });
                          }
                        }}
                        className="py-3 px-3 text-center tabular-nums border-r border-neutral-800/80 cursor-pointer hover:bg-neutral-800 transition-colors"
                        title="Klik untuk melihat video dalam kolom ini"
                      >
                        {pivotData.computeAgg(allColVideos).formatted}
                      </td>
                    );
                  })}

                  {colDimension !== 'none' && (
                    <td className="py-3 px-3 text-center bg-[#1e1e1e] text-[#ff0000] tabular-nums">
                      {pivotData.computeAgg(filteredVideos).formatted}
                    </td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Baris Keterangan di Bawah Tabel */}
          <div className="p-2.5 bg-[#121212] border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Info size={13} className="text-neutral-500" />
              <span>Klik angka pada sel tabel untuk melihat daftar video secara mendalam.</span>
            </span>
            <span className="font-mono text-neutral-400">
              Total {filteredVideos.length} Video Terhitung
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800 p-6 space-y-2">
          <TableProperties size={32} className="mx-auto text-neutral-600" />
          <h4 className="text-sm font-semibold text-white">Tidak ada data untuk dipivot</h4>
          <p className="text-xs text-neutral-400">
            Tambahkan video dan saluran baru untuk melihat analisis tabular multidimensi.
          </p>
        </div>
      )}

      {/* 6. Modal Drill-down Video saat Sel Pivot Diklik */}
      {drillDownInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs select-none">
          <div className="fixed inset-0" onClick={() => setDrillDownInfo(null)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-[#181818] border border-neutral-800 shadow-2xl p-4 sm:p-5 space-y-4 z-10 max-h-[85vh] flex flex-col">
            {/* Header Modal Drill-down */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <PlaySquare size={16} className="text-[#ff0000]" />
                  <span>Daftar Video ({drillDownInfo.videos.length})</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-sm">
                  {drillDownInfo.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrillDownInfo(null)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 hover:text-white"
              >
                Tutup
              </button>
            </div>

            {/* List Video */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 scrollbar-thin">
              {drillDownInfo.videos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => {
                    setActiveVideoId(vid.id);
                    navigate('video-detail');
                  }}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-16 aspect-video rounded-md object-cover shrink-0 border border-neutral-700"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-[#ff0000] transition-colors">
                        {vid.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {vid.channelName || vid.categoryName || 'YouTube'} · {formatDuration(vid.durationSeconds)}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium ${
                    vid.status === 'Watched'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/70'
                      : vid.status === 'Watching'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/70'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {vid.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
