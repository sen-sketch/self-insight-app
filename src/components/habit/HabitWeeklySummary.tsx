"use client";

import { useMemo } from "react";
import { getHabitStartLogs } from "@/storage";
import { getHabitWeeklyStats } from "@/lib/habitStats";
import type { DailyStartEntry } from "@/lib/habitStats";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── 表示ユーティリティ ───────────────────────────────────────

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"] as const;

function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getDayLabel(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const idx = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  return DAY_LABELS[idx];
}

// ─── 日別プロット ─────────────────────────────────────────────

function HabitStartDotPlot({ entries }: { entries: DailyStartEntry[] }) {
  return (
    <div className="flex items-end justify-between gap-1">
      {entries.map((entry) => {
        const has = entry.minutesSinceMidnight !== null;
        return (
          <div key={entry.date} className="flex flex-1 flex-col items-center gap-0.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                has
                  ? "bg-[#3d5016] text-white"
                  : "border border-zinc-400 text-zinc-400"
              }`}
            >
              {has ? "●" : "○"}
            </span>
            <span className="text-[10px] text-zinc-400">
              {getDayLabel(entry.date)}
            </span>
            <span className="text-[9px] leading-tight text-zinc-500">
              {has ? minutesToHHmm(entry.minutesSinceMidnight!) : "\u00A0"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── 週次サマリー ─────────────────────────────────────────────

type Props = { habitId: string };

export function HabitWeeklySummary({ habitId }: Props) {
  const stats = useMemo(() => {
    return getHabitWeeklyStats(getHabitStartLogs(), habitId);
  }, [habitId]);

  const directionNode = (() => {
    if (stats.direction === null) return null;
    const abs = Math.abs(stats.diffMinutes!);
    if (stats.direction === "earlier")
      return <span className="flex items-center gap-0.5 text-[#3d5016]"><TrendingUp size={12} strokeWidth={3} /> {abs}分 早まった</span>;
    if (stats.direction === "later")
      return <span className="flex items-center gap-0.5 text-red-500 dark:text-red-400"><TrendingDown size={12} strokeWidth={3} /> {abs}分 遅れた</span>;
    return <span className="flex items-center gap-0.5 text-zinc-400"><Minus size={12} strokeWidth={3} /> ほぼ同じ</span>;
  })();

  return (
    <div className="mt-3 border border-zinc-900 bg-[#f0ede6] px-3 py-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">直近7日</span>
        <div className="flex items-center gap-2 text-xs">
          {stats.currentAvgMinutes !== null && (
            <span className="text-zinc-700">
              平均 {minutesToHHmm(stats.currentAvgMinutes)}
            </span>
          )}
          {directionNode}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[280px]">
          <HabitStartDotPlot entries={stats.currentWeek} />
        </div>
      </div>
    </div>
  );
}
