"use client";

import { useMemo, useState } from "react";
import { getHabitStartLogs } from "@/storage";
import { getHabitWeeklyStats } from "@/lib/habitStats";
import type { DailyStartEntry } from "@/lib/habitStats";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── 表示ユーティリティ ───────────────────────────────────────

const DAY_LABELS_JP = ["日", "月", "火", "水", "木", "金", "土"] as const;

function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatClickDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${m}月${d}日（${DAY_LABELS_JP[dow]}）`;
}

// ─── 日別プロット ─────────────────────────────────────────────

type DotPlotProps = {
  entries: DailyStartEntry[];
  activeDate: string | null;
  onClickDate: (date: string) => void;
};

function HabitStartDotPlot({ entries, activeDate, onClickDate }: DotPlotProps) {
  return (
    <div className="flex gap-1">
      {entries.map((entry) => {
        const has = entry.minutesSinceMidnight !== null;
        return (
          <div key={entry.date} className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => onClickDate(entry.date)}
              className={`h-3 w-3 rounded-sm ${has ? "bg-[#3d5016]" : "bg-[#f0ede6]"}`}
            />
            <span className="text-[9px] leading-tight text-zinc-500 tabular-nums">
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
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const stats = useMemo(() => {
    return getHabitWeeklyStats(getHabitStartLogs(), habitId);
  }, [habitId]);

  const directionNode = (() => {
    if (stats.direction === null) return null;
    const abs = Math.abs(stats.diffMinutes!);
    if (stats.direction === "earlier")
      return <span className="flex items-center gap-0.5 text-[#3d5016]"><TrendingUp size={12} strokeWidth={3} /> {abs}分 早まった</span>;
    if (stats.direction === "later")
      return <span className="flex items-center gap-0.5 text-red-500"><TrendingDown size={12} strokeWidth={3} /> {abs}分 遅れた</span>;
    return <span className="flex items-center gap-0.5 text-zinc-400"><Minus size={12} strokeWidth={3} /> ほぼ同じ</span>;
  })();

  function handleClickDate(date: string) {
    setActiveDate(activeDate === date ? null : date);
  }

  return (
    <div className="mt-2" onTouchStart={(e) => e.stopPropagation()}>
      {/* カレンダー（右寄せ） */}
      <div className="flex justify-end">
        <HabitStartDotPlot
          entries={stats.currentWeek}
          activeDate={activeDate}
          onClickDate={handleClickDate}
        />
      </div>
      {/* トレンド */}
      {directionNode && (
        <div className="mt-0.5 flex justify-end text-xs">
          {directionNode}
        </div>
      )}
      {/* クリック日付 */}
      {activeDate && (
        <p className="mt-0.5 text-right text-[10px] text-zinc-500">
          {formatClickDate(activeDate)}
        </p>
      )}
    </div>
  );
}
