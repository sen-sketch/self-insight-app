import type { HabitStartLog } from "./types";
import {
  toTokyoYmd,
  toTokyoHHmm,
  habitStartTimeToMinutes,
} from "./datetime";

// ─── 型 ───────────────────────────────────────────────────────

export type DailyStartEntry = {
  date: string;                         // YYYY-MM-DD
  minutesSinceMidnight: number | null;  // 記録なし = null
};

export type HabitWeeklyStats = {
  habitId: string;
  currentWeek: DailyStartEntry[];   // 直近7日
  prevWeek: DailyStartEntry[];      // 前週7日
  currentAvgMinutes: number | null;
  prevAvgMinutes: number | null;
  diffMinutes: number | null;       // 正=遅れた / 負=早まった
  direction: "earlier" | "later" | "same" | null;
};

// ─── 内部ユーティリティ ────────────────────────────────────────

function shiftDate(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days));
  return [
    utc.getUTCFullYear(),
    String(utc.getUTCMonth() + 1).padStart(2, "0"),
    String(utc.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function getMondayOfWeek(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=日, 1=月...
  const daysFromMonday = (dayOfWeek + 6) % 7; // 月=0, 火=1, ..., 日=6
  return shiftDate(ymd, -daysFromMonday);
}

function buildDateRange(fromDate: string, toDate: string): string[] {
  const dates: string[] = [];
  let cur = fromDate;
  while (cur <= toDate) {
    dates.push(cur);
    cur = shiftDate(cur, 1);
  }
  return dates;
}

// ─── 集計関数 ─────────────────────────────────────────────────

/** 指定期間の habitId について日別最初の開始時刻（分）を返す */
export function getDailyFirstStartMinutes(
  logs: HabitStartLog[],
  habitId: string,
  dates: string[]
): DailyStartEntry[] {
  const dateSet = new Set(dates);
  const byDate = new Map<string, number>();

  for (const log of logs) {
    if (log.habitId !== habitId) continue;
    const date = toTokyoYmd(log.startedAt);
    if (!dateSet.has(date)) continue;
    const minutes = habitStartTimeToMinutes(toTokyoHHmm(log.startedAt));
    if (minutes === null) continue;
    const prev = byDate.get(date);
    if (prev === undefined || minutes < prev) {
      byDate.set(date, minutes);
    }
  }

  return dates.map((date) => ({
    date,
    minutesSinceMidnight: byDate.get(date) ?? null,
  }));
}

/** 日別エントリーの平均開始時刻（分）。記録なし日は除外 */
export function calcAverageStartMinutes(
  entries: DailyStartEntry[]
): number | null {
  const recorded = entries
    .map((e) => e.minutesSinceMidnight)
    .filter((m): m is number => m !== null);
  if (recorded.length === 0) return null;
  return Math.round(recorded.reduce((sum, m) => sum + m, 0) / recorded.length);
}

/** 今週平均 − 前週平均（分）。正=遅れた / 負=早まった */
export function calcStartTimeDiff(
  currentAvg: number | null,
  prevAvg: number | null
): number | null {
  if (currentAvg === null || prevAvg === null) return null;
  return currentAvg - prevAvg;
}

/** ±5分以内は "same" として扱う */
export function judgeDirection(
  diffMinutes: number | null
): "earlier" | "later" | "same" | null {
  if (diffMinutes === null) return null;
  if (diffMinutes < -5) return "earlier";
  if (diffMinutes > 5) return "later";
  return "same";
}

/** 習慣1件の週次統計をまとめて算出する */
export function getHabitWeeklyStats(
  logs: HabitStartLog[],
  habitId: string,
  today?: string
): HabitWeeklyStats {
  const todayYmd = today ?? toTokyoYmd();
  const currFrom = getMondayOfWeek(todayYmd);   // 今週の月曜
  const currTo = shiftDate(currFrom, 6);         // 今週の日曜
  const prevFrom = shiftDate(currFrom, -7);      // 前週の月曜
  const prevTo = shiftDate(currFrom, -1);        // 前週の日曜


  const currentWeek = getDailyFirstStartMinutes(
    logs, habitId, buildDateRange(currFrom, currTo)
  );
  const prevWeek = getDailyFirstStartMinutes(
    logs, habitId, buildDateRange(prevFrom, prevTo)
  );
  const currentAvgMinutes = calcAverageStartMinutes(currentWeek);
  const prevAvgMinutes = calcAverageStartMinutes(prevWeek);
  const diffMinutes = calcStartTimeDiff(currentAvgMinutes, prevAvgMinutes);

  return {
    habitId,
    currentWeek,
    prevWeek,
    currentAvgMinutes,
    prevAvgMinutes,
    diffMinutes,
    direction: judgeDirection(diffMinutes),
  };
}
