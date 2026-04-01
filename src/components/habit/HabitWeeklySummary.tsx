"use client";

import { useMemo, useState } from "react";
import { getHabitWeeklyStats } from "@/lib/habitStats";
import { shiftYmd, toTokyoYmd } from "@/lib/datetime";
import type { HabitStartLog } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── 表示ユーティリティ ───────────────────────────────────────

function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatWeekLabel(ymd: string): string {
  const [, m, d] = ymd.split("-").map(Number);
  return `${m}/${d}〜`;
}

// ─── 週次サマリー ─────────────────────────────────────────────

type Props = {
  habitId: string;
  habitName: string;
  logs: HabitStartLog[];
};

export function HabitWeeklySummary({ habitId, habitName, logs }: Props) {
  const [weekOffset, setWeekOffset] = useState(0); // 0=今週, -1=先週, ...

  const stats = useMemo(() => {
    const ref = weekOffset === 0 ? toTokyoYmd() : shiftYmd(toTokyoYmd(), weekOffset * 7);
    return getHabitWeeklyStats(logs, habitId, ref);
  }, [logs, habitId, weekOffset]);

  const entries = stats.currentWeek;
  const weekLabel = entries.length > 0 ? formatWeekLabel(entries[0].date) : "";

  const trendNode = (() => {
    if (stats.direction === null) return null;
    const abs = Math.abs(stats.diffMinutes!);
    if (stats.direction === "earlier")
      return <span className="flex items-center gap-0.5 text-[10px] text-[#3d5016]"><TrendingUp size={10} strokeWidth={2.5} />{abs}分早まった</span>;
    if (stats.direction === "later")
      return <span className="flex items-center gap-0.5 text-[10px] text-red-500"><TrendingDown size={10} strokeWidth={2.5} />{abs}分遅れた</span>;
    return <span className="flex items-center gap-0.5 text-[10px] text-zinc-400"><Minus size={10} strokeWidth={2.5} />ほぼ同じ</span>;
  })();

  return (
    <div onTouchStart={(e) => e.stopPropagation()}>
      {/* Row 1: 時刻ラベル（ドットの真上に右寄せ） */}
      <div className="flex justify-end">
        <div className="flex gap-1">
          {entries.map((entry) => (
            <div key={entry.date} className="flex w-6 justify-center">
              <span className="text-[9px] leading-tight text-zinc-500 tabular-nums">
                {entry.minutesSinceMidnight !== null ? minutesToHHmm(entry.minutesSinceMidnight) : "\u00A0"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: 習慣名（左）＋ドット（右） */}
      <div className="flex items-center">
        <span className="min-w-0 flex-1 truncate pr-2 text-sm font-semibold text-zinc-900">{habitName}</span>
        <div className="flex shrink-0 gap-1">
          {entries.map((entry) => (
            <div key={entry.date} className="flex w-6 justify-center">
              <div className={`h-3 w-3 rounded-sm ${entry.minutesSinceMidnight !== null ? "bg-[#3d5016]" : "bg-[#f0ede6]"}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: 平均時間（左）＋トレンド＋週ナビ（右） */}
      <div className="mt-0.5 flex items-center justify-between">
        <span className="text-xs tabular-nums text-zinc-400">
          {stats.currentAvgMinutes !== null ? minutesToHHmm(stats.currentAvgMinutes) : "—"}
        </span>
        <div className="flex items-center gap-0.5">
          {trendNode}
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="px-1 text-xs text-zinc-400 hover:text-zinc-600"
          >
            ＜
          </button>
          <span className="min-w-[36px] text-center text-[10px] tabular-nums text-zinc-400">{weekLabel}</span>
          <button
            onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}
            disabled={weekOffset >= 0}
            className="px-1 text-xs text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
          >
            ＞
          </button>
        </div>
      </div>
    </div>
  );
}
