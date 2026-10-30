/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Halaman Statistik (StatsPage)
 * Menampilkan analitik status video, kategori teratas, dan waktu tonton dengan Recharts.
 */

import React, { useMemo } from 'react';
import { useYtmStore } from '../../store/useYtmStore';
import { formatDuration } from '../../lib/youtube';
import { BarChart3, Clock, PlaySquare, Tv, FolderTree, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const StatsPage: React.FC = () => {
  const { videos, channels, categories } = useYtmStore();

  const totalWatchTime = useMemo(() => videos.reduce((acc, v) => acc + (v.timestampSeconds || 0), 0), [videos]);
  const totalContentDuration = useMemo(() => videos.reduce((acc, v) => acc + (v.durationSeconds || 0), 0), [videos]);

  const statusData = useMemo(() => [
    { name: 'To Watch', value: videos.filter((v) => v.status === 'To Watch').length, color: '#64748b' },
    { name: 'Watching', value: videos.filter((v) => v.status === 'Watching').length, color: '#f59e0b' },
    { name: 'Watched', value: videos.filter((v) => v.status === 'Watched').length, color: '#10b981' },
  ], [videos]);

  const categoryStats = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.name.length > 10 ? cat.name.slice(0, 10) + '..' : cat.name,
      total: videos.filter((v) => v.categoryId === cat.id || v.categoryName === cat.name).length,
    })).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [categories, videos]);

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#ff0000]/15 text-[#ff0000] flex items-center justify-center">
          <BarChart3 size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Statistik & Analisis</h2>
          <p className="text-[11px] text-neutral-400">Wawasan aktivitas tontonan dan koleksi YouTube Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-[#181818] border border-neutral-800">
          <span className="text-neutral-400 flex items-center gap-1.5"><PlaySquare size={13} className="text-[#ff0000]" /> Total Video</span>
          <p className="text-xl font-bold text-white mt-1 tabular-nums">{videos.length}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#181818] border border-neutral-800">
          <span className="text-neutral-400 flex items-center gap-1.5"><Tv size={13} className="text-amber-500" /> Saluran</span>
          <p className="text-xl font-bold text-white mt-1 tabular-nums">{channels.length}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#181818] border border-neutral-800">
          <span className="text-neutral-400 flex items-center gap-1.5"><FolderTree size={13} className="text-sky-500" /> Kategori</span>
          <p className="text-xl font-bold text-white mt-1 tabular-nums">{categories.length}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#181818] border border-neutral-800">
          <span className="text-neutral-400 flex items-center gap-1.5"><Clock size={13} className="text-emerald-500" /> Ditonton</span>
          <p className="text-xl font-bold text-white mt-1 tabular-nums">{formatDuration(totalWatchTime)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#181818] border border-neutral-800 space-y-3">
          <h3 className="text-xs font-semibold text-white">Status Tontonan</h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {statusData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#181818', borderColor: '#333', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs border-t border-neutral-800 pt-2">
            {statusData.map((item) => (
              <span key={item.name} className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}: <strong className="text-white tabular-nums">{item.value}</strong>
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#181818] border border-neutral-800 space-y-3">
          <h3 className="text-xs font-semibold text-white">Video per Kategori Teratas</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#181818', borderColor: '#333', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="total" fill="#ff0000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-neutral-400 text-center border-t border-neutral-800 pt-2">Distribusi kategori yang disimpan</p>
        </div>
      </div>
    </div>
  );
};
