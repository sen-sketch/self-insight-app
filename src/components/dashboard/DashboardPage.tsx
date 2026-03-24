"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  getTimelinePosts,
  getHabitStartLogs,
  getLuckRecords,
  getMetaDiaryByDate,
  getHabits,
} from "@/storage";
import { toTokyoYmd } from "@/lib/datetime";
import { getHabitWeeklyStats } from "@/lib/habitStats";
import type { TimelinePost } from "@/lib/types";
import type { DailyStartEntry } from "@/lib/habitStats";

// ─── ユーティリティ ────────────────────────────────────────────

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"] as const;

function getDayLabel(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const idx = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  return DAY_LABELS[idx];
}

function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── サマリカード ──────────────────────────────────────────────

type SummaryCardProps = {
  label: string;
  value: string | number;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</span>
    </div>
  );
}

// ─── 直近投稿アイテム ──────────────────────────────────────────

const MOOD_LABELS = ["", "😞", "😕", "😐", "🙂", "😊"] as const;

function RecentPostItem({ post }: { post: TimelinePost }) {
  const date = new Date(post.postedAt).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{date}</span>
        <span className="text-sm">{MOOD_LABELS[post.moodScore]}</span>
      </div>
      <p className="line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">{post.content}</p>
    </div>
  );
}

// ─── ミニドットグラフ ──────────────────────────────────────────

function MiniDotRow({ entries }: { entries: DailyStartEntry[] }) {
  return (
    <div className="flex items-end gap-1">
      {entries.map((entry) => {
        const has = entry.minutesSinceMidnight !== null;
        const label = has
          ? `${getDayLabel(entry.date)} ${minutesToHHmm(entry.minutesSinceMidnight!)}`
          : getDayLabel(entry.date);
        return (
          <div key={entry.date} className="flex flex-col items-center gap-0.5" title={label}>
            <span
              className={`h-3 w-3 rounded-full ${
                has
                  ? "bg-emerald-500"
                  : "border border-zinc-300 dark:border-zinc-600"
              }`}
            />
            <span className="text-[8px] text-zinc-400">{getDayLabel(entry.date)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── クイック入力ボタン ────────────────────────────────────────

function QuickButton({ href, label, emoji }: { href: string; label: string; emoji: string }) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2 py-3 text-center transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs text-zinc-600 dark:text-zinc-300">{label}</span>
    </Link>
  );
}

// ─── メインコンポーネント ──────────────────────────────────────

export function DashboardPage() {
  const [today] = useState(() => toTokyoYmd());

  const [data] = useState(() => {
  const t = toTokyoYmd();
  const posts = getTimelinePosts();
  const logs = getHabitStartLogs();
  const luckRecords = getLuckRecords();
  const diary = getMetaDiaryByDate(t);
  const activeHabits = getHabits().filter((h) => h.isActive);

  return {
    todayPostCount: posts.filter((p) => toTokyoYmd(p.postedAt) === t).length,
    todayHabitStartCount: logs.filter((l) => toTokyoYmd(l.startedAt) === t).length,
    todayLuckCount: luckRecords.filter((r) => toTokyoYmd(r.recordedAt) === t).length,
    hasDiary: diary !== null,
    recentPosts: posts.slice(0, 3),
    activeHabits,
    allLogs: logs,
  };
});

  const habitStats = useMemo(
    () =>
      data.activeHabits.map((h) => ({
        habit: h,
        stats: getHabitWeeklyStats(data.allLogs, h.id),
      })),
    [data.activeHabits, data.allLogs]
  );

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 flex flex-col gap-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">ダッシュボード</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{today}</p>
      </div>

      {/* 今日のサマリカード */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">今日の記録</h2>
        <div className="grid grid-cols-2 gap-2">
          <SummaryCard label="投稿" value={`${data.todayPostCount} 件`} />
          <SummaryCard label="習慣開始" value={`${data.todayHabitStartCount} 回`} />
          <SummaryCard label="運記録" value={`${data.todayLuckCount} 件`} />
          <SummaryCard label="メタ認知日記" value={data.hasDiary ? "入力済み ✓" : "未入力 —"} />
        </div>
      </section>

      {/* クイック入力 */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">クイック入力</h2>
        <div className="flex gap-2">
          <QuickButton href="/timeline" label="投稿" emoji="📝" />
          <QuickButton href="/tracker" label="習慣" emoji="✅" />
          <QuickButton href="/luck" label="運記録" emoji="🍀" />
          <QuickButton href="/metadiary" label="日記" emoji="📔" />
        </div>
      </section>

      {/* 直近投稿3件 */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">直近の投稿</h2>
          <Link href="/timeline" className="text-xs text-blue-500 hover:underline dark:text-blue-400">
            すべて見る
          </Link>
        </div>
        {data.recentPosts.length === 0 ? (
          <p className="text-sm text-zinc-400">投稿がありません</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.recentPosts.map((post) => (
              <RecentPostItem key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* 今週の習慣開始ミニグラフ */}
      {habitStats.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">今週の習慣</h2>
            <Link href="/tracker" className="text-xs text-blue-500 hover:underline dark:text-blue-400">
              詳細
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {habitStats.map(({ habit, stats }) => (
              <div
                key={habit.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/50"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
                  {habit.name}
                </span>
                <MiniDotRow entries={stats.currentWeek} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
