"use client";

import { useState } from "react";
import type { CreateHabitInput, Habit } from "@/lib/types";
import { HabitForm } from "./HabitForm";

type Props = {
  habit: Habit;
  onUpdate: (id: string, patch: Partial<CreateHabitInput>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onLogStart: (habitId: string, note: string | null) => void;
};

export function HabitCard({ habit, onUpdate, onDelete, onToggleActive, onLogStart }: Props) {
  const [editing, setEditing] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState("");

  function handleUpdate(data: CreateHabitInput) {
    onUpdate(habit.id, data);
    setEditing(false);
  }

  function handleConfirmNote() {
    onLogStart(habit.id, note.trim() || null);
    setShowNoteInput(false);
    setNote("");
  }

  if (editing) {
    return (
      <HabitForm
        initialValues={{
          name: habit.name,
          targetStartTime: habit.targetStartTime ?? "",
          isActive: habit.isActive,
        }}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-opacity ${
        habit.isActive
          ? "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
          : "border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-700 dark:bg-zinc-800"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {habit.name}
          </span>
          {habit.targetStartTime && (
            <span className="text-xs text-zinc-400">目標: {habit.targetStartTime}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onToggleActive(habit.id, !habit.isActive)}
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              habit.isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
            }`}
          >
            {habit.isActive ? "有効" : "無効"}
          </button>
          <button
            onClick={() => setEditing(true)}
            className="rounded px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            編集
          </button>
          <button
            onClick={() => {
              if (confirm(`「${habit.name}」を削除しますか？`)) onDelete(habit.id);
            }}
            className="rounded px-2 py-0.5 text-xs text-red-400 hover:text-red-600"
          >
            削除
          </button>
        </div>
      </div>

      {habit.isActive && (
        <div className="mt-3 flex flex-col gap-2">
          {showNoteInput ? (
            <>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="補足メモ（任意）"
                autoFocus
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmNote}
                  className="flex-1 rounded-lg bg-blue-500 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
                >
                  記録する
                </button>
                <button
                  onClick={() => { setShowNoteInput(false); setNote(""); }}
                  className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700"
                >
                  キャンセル
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onLogStart(habit.id, null)}
                className="flex-1 rounded-lg bg-emerald-500 py-1.5 text-sm font-medium text-white hover:bg-emerald-600"
              >
                開始
              </button>
              <button
                onClick={() => setShowNoteInput(true)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
              >
                メモ付き
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
