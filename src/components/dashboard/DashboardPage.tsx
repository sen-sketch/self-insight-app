"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getPosts,
  updatePost,
  deletePost,
  getHabits,
  addHabit,
  updateHabit,
  deleteHabit,
  getHabitStartLogs,
  reorderActiveHabits,
} from "@/storage";
import { toTokyoYmd } from "@/lib/datetime";
import type { Post, Habit, HabitStartLog, CreateHabitInput, CreatePostInput } from "@/lib/types";
import { HabitList } from "@/components/habit/HabitList";
import { HabitForm } from "@/components/habit/HabitForm";
import { PostList } from "@/components/post/PostList";
import { PenLine } from "lucide-react";

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

// ─── メインコンポーネント ──────────────────────────────────────

export function DashboardPage() {
  const [today] = useState(() => toTokyoYmd());

  const [habits, setHabits] = useState<Habit[]>(() => getHabits());
  const [logs, setLogs] = useState<HabitStartLog[]>(() => getHabitStartLogs());
  const [posts, setPosts] = useState<Post[]>(() => getPosts());
  const [showHabitForm, setShowHabitForm] = useState(false);

  const todayPosts = posts.filter((p) => toTokyoYmd(p.postedAt) === today);
  const todayHabitStartCount = logs.filter((l) => toTokyoYmd(l.startedAt) === today).length;

  function reloadHabits() {
    setHabits(getHabits());
    setLogs(getHabitStartLogs());
  }

  function reloadPosts() {
    setPosts(getPosts());
  }

  function handleReorder(orderedIds: string[]) {
    reorderActiveHabits(orderedIds);
    reloadHabits();
  }

  function handleAddHabit(data: CreateHabitInput) {
    addHabit(data);
    reloadHabits();
    setShowHabitForm(false);
  }

  function handleUpdateHabit(id: string, patch: Partial<CreateHabitInput>) {
    updateHabit(id, patch);
    reloadHabits();
  }

  function handleToggleActive(id: string, isActive: boolean) {
    updateHabit(id, { isActive });
    reloadHabits();
  }

  function handleDeleteHabit(id: string) {
    deleteHabit(id);
    reloadHabits();
  }

  function handleUpdatePost(id: string, data: CreatePostInput) {
    updatePost(id, data);
    reloadPosts();
  }

  function handleDeletePost(id: string) {
    deletePost(id);
    reloadPosts();
  }

  return (
    <div className="mx-auto w-full max-w-md flex flex-col gap-6 py-2">
      {/* ヘッダー */}
      <div>
        <h1 className="text-xl font-black text-zinc-900 text-center w-full">ダッシュボード</h1>
        <p className="text-sm text-zinc-500">{today}</p>
      </div>

      {/* 今日のサマリカード */}
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">今日のサマリ</h2>
        <div className="grid grid-cols-2 gap-0 border border-zinc-900">
          <SummaryCard label="投稿" value={`${todayPosts.length} 件`} />
          <SummaryCard label="習慣開始" value={`${todayHabitStartCount} 回`} />
        </div>
      </section>

      {/* クイック入力 */}
      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">クイック入力</h2>
        <div className="flex gap-0 border border-zinc-900">
          <Link
            href="/post"
            className="group flex flex-1 flex-col items-center gap-1 border border-zinc-900 bg-[#f0ede6] px-2 py-4 text-center hover:bg-[#3d5016] transition-colors"
          >
            <PenLine size={24} strokeWidth={3} className="text-[#3d5016] group-hover:text-white transition-colors" />
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-900 group-hover:text-white transition-colors">投稿</span>
          </Link>
        </div>
      </section>

      {/* 今日の習慣トラッカー */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">今日の習慣トラッカー</h2>
          <button
            onClick={() => setShowHabitForm((prev) => !prev)}
            className="text-xs text-[#3d5016] hover:underline"
          >
            {showHabitForm ? "閉じる" : "+ 追加"}
          </button>
        </div>
        {showHabitForm && (
          <div className="mb-2">
            <HabitForm onSubmit={handleAddHabit} onCancel={() => setShowHabitForm(false)} />
          </div>
        )}
        <HabitList
          habits={habits}
          logs={logs}
          onReorder={handleReorder}
          onUpdate={handleUpdateHabit}
          onDelete={handleDeleteHabit}
          onToggleActive={handleToggleActive}

        />
      </section>

      {/* 今日の投稿 */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">今日の投稿</h2>
          <Link href="/timeline" className="text-xs text-[#3d5016] hover:underline">
            すべて見る
          </Link>
        </div>
        <PostList
          posts={todayPosts}
          habits={habits}
          onUpdate={handleUpdatePost}
          onDelete={handleDeletePost}
        />
      </section>
    </div>
  );
}
