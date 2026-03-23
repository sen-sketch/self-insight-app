"use client";

import { useState } from "react";
import type { CreateHabitInput } from "@/lib/types";

type Props = {
  initialValues?: Partial<CreateHabitInput>;
  onSubmit: (data: CreateHabitInput) => void;
  onCancel: () => void;
};

export function HabitForm({ initialValues, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [targetStartTime, setTargetStartTime] = useState(
    initialValues?.targetStartTime ?? ""
  );
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      targetStartTime: targetStartTime || null,
      isActive,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          タスク名 *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：朝のランニング"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          目標開始時刻（任意）
        </label>
        <input
          type="time"
          value={targetStartTime}
          onChange={(e) => setTargetStartTime(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-blue-500"
        />
        有効にする
      </label>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-40"
        >
          保存
        </button>
      </div>
    </form>
  );
}
