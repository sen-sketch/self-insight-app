"use client";

import { useState } from "react";
import type { HabitStartLog, CreateHabitInput, Habit, UpdateHabitInput } from "@/lib/types";
import {
  getHabits,
  addHabit,
  updateHabit,
  deleteHabit,
  addPost,
  getHabitStartLogs,
  reorderActiveHabits
} from "@/storage";
import { HabitForm } from "./HabitForm";
import { HabitList } from "./HabitList";

type Props = {
  showTracker?: boolean;
};

export function HabitPage({ showTracker = true }: Props) {
  const [habits, setHabits] = useState<Habit[]>(() => getHabits());
  const [showForm, setShowForm] = useState(false);

  const [logs, setLogs] = useState<HabitStartLog[]>(() =>
    showTracker ? getHabitStartLogs() : []
  );

  function reload() {
    setHabits(getHabits());
    if (showTracker) setLogs(getHabitStartLogs());
  }

  function handleAdd(data: CreateHabitInput) {
    addHabit(data);
    reload();
    setShowForm(false);
  }

  function handleUpdate(id: string, patch: UpdateHabitInput) {
    updateHabit(id, patch);
    reload();
  }

  function handleToggleActive(id: string, isActive: boolean) {
    updateHabit(id, { isActive });
    reload();
  }

  function handleDelete(id: string) {
    deleteHabit(id);
    reload();
  }

  function handleLogStart(habitId: string, note: string | null) {
    addPost({
      postedAt: new Date().toISOString(),
      habitTags: [habitId],
      whatText: note,
      resultText: null,
      questionText: null,
      moodScore: null,
      freeTags: [],
    });
    reload();
  }


  function handleReorder(orderedIds: string[]) {
    reorderActiveHabits(orderedIds);
    reload();
  }


  if (!showTracker) {
    return (
      <div className="flex flex-col gap-3 px-4 py-5">
        {showForm ? (
          <HabitForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-1 bg-[#3d5016] py-4 text-sm font-bold text-white"
          >
            ＋ 習慣を追加する
          </button>
        )}

        <HabitList
          habits={habits}
          logs={logs}
          onReorder={handleReorder}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onLogStart={undefined}
          settingsMode={true}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-5">
      <div className="relative flex items-center py-1">
        <h1 className="w-full text-center text-base font-bold text-zinc-900">
          習慣トラッカー
        </h1>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="absolute right-0 border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-800"
        >
          {showForm ? "閉じる" : "+ 追加"}
        </button>
      </div>

      {showForm && (
        <HabitForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      <HabitList
        habits={habits}
        logs={logs}
        onReorder={handleReorder}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onLogStart={handleLogStart}
        settingsMode={false}
      />
    </div>
  );
}
