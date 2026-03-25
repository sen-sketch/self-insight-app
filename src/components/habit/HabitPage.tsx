"use client";

import { useState } from "react";
import type { HabitStartLog, CreateHabitInput, Habit, UpdateHabitInput } from "@/lib/types";
import {
  getHabits,
  addHabit,
  updateHabit,
  deleteHabit,
  addHabitStartLog,
  getHabitStartLogs,
  reorderActiveHabits
} from "@/storage";
import { HabitForm } from "./HabitForm";
import { HabitList } from "./HabitList";

export function HabitPage() {
  const [habits, setHabits] = useState<Habit[]>(() => getHabits());
  const [showForm, setShowForm] = useState(false);

  const [logs, setLogs] = useState<HabitStartLog[]>(() => getHabitStartLogs());

  function reload() {
    setHabits(getHabits());
    setLogs(getHabitStartLogs());
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
    addHabitStartLog({
      habitId,
      startedAt: new Date().toISOString(),
      note,
    });
    reload();
  }

  function handleReorder(orderedIds: string[]) {
    reorderActiveHabits(orderedIds);
    reload();
  }


  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          習慣トラッカー
        </h1>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          {showForm ? "閉じる" : "+ タスク追加"}
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
      />
    </div>
  );
}
