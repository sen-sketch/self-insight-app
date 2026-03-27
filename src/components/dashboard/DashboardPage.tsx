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
import { formatDisplayDateTime, toTokyoYmd } from "@/lib/datetime";
import { getHabitWeeklyStats } from "@/lib/habitStats";
import type { TimelinePost } from "@/lib/types";
import type { DailyStartEntry } from "@/lib/habitStats";
import { PenLine, CheckSquare, Clover, BookOpen, Annoyed, Frown, Meh, Smile, Laugh } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
    <div className="flex flex-col border border-zinc-200 bg-white px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</span>
      <span className="mt-1 text-3xl font-black text-zinc-900">{value}</span>
    </div>
  );
}


// ─── 直近投稿アイテム ──────────────────────────────────────────

const MOOD_ICONS: Record<number, LucideIcon> = {
  1: Annoyed,
  2: Frown,
  3: Meh,
  4: Smile,
  5: Laugh,
};

function RecentPostItem({ post }: { post: TimelinePost }) {
  const date = formatDisplayDateTime(post.postedAt);
  return (
    <div className="flex flex-col gap-1 border-b border-zinc-900 px-3 py-2 last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{date}</span>
        {(() => { const Icon = MOOD_ICONS[post.moodScore]; return Icon ? <Icon size={16} strokeWidth={3} className="text-zinc-400" /> : null; })()}
      </div>
      <p className="line-clamp-2 text-sm text-zinc-700">{post.content}</p>
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
                  ? "bg-[#3d5016]"
                  : "border border-zinc-400"
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

function QuickButton({ href, label, Icon }: { href: string; label: string; Icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="group flex flex-1 flex-col items-center gap-1 border border-zinc-900 bg-[#f0ede6] px-2 py-4 text-center hover:bg-[#3d5016] transition-colors"
    >
      <Icon size={24} strokeWidth={3} className="text-[#3d5016] group-hover:text-white transition-colors" />
      <span className="text-xs font-bold uppercase tracking-wide text-zinc-900 group-hover:text-white transition-colors">{label}</span>
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
    <div className="mx-auto w-full max-w-md flex flex-col gap-6 py-2">
      {/* ヘッダー */}
      <div>
        <h1 className="text-xl font-black text-zinc-900 text-center w-full">ダッシュボード</h1>
        <p className="text-sm text-zinc-500">{today}</p>
      </div>

      {/* 今日のサマリカード */}
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">今日の記録</h2>
        <div className="grid grid-cols-2 gap-0 border border-zinc-900">
          <SummaryCard label="投稿" value={`${data.todayPostCount} 件`} />
          <SummaryCard label="習慣開始" value={`${data.todayHabitStartCount} 回`} />
          <SummaryCard label="運記録" value={`${data.todayLuckCount} 件`} />
          <SummaryCard label="メタ認知日記" value={data.hasDiary ? "済 ✓" : "未 —"} />
        </div>
      </section>

      {/* クイック入力 */}
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">クイック入力</h2>
        <div className="flex gap-0 border border-zinc-900">
          <QuickButton href="/timeline" label="投稿" Icon={PenLine} />
          <QuickButton href="/tracker" label="習慣" Icon={CheckSquare} />
          <QuickButton href="/luck" label="運記録" Icon={Clover} />
          <QuickButton href="/metadiary" label="日記" Icon={BookOpen} />
        </div>
      </section>

      {/* 直近投稿3件 */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">直近の投稿</h2>
          <Link href="/timeline" className="text-xs text-[#3d5016] hover:underline">
            すべて見る
          </Link>
        </div>
        {data.recentPosts.length === 0 ? (
          <p className="text-sm text-zinc-400">投稿がありません</p>
        ) : (
          <div className="flex flex-col gap-0 border border-zinc-900">
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">今週の習慣</h2>
            <Link href="/tracker" className="text-xs text-[#3d5016] hover:underline">
              詳細
            </Link>
          </div>
          <div className="flex flex-col gap-0 border border-zinc-900">
            {habitStats.map(({ habit, stats }) => (
              <div
                key={habit.id}
                className="flex items-center justify-between gap-3 border-b border-zinc-900 px-3 py-2 last:border-b-0"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-700">
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
