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
      className="flex flex-col gap-3 border border-zinc-200 bg-white p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600">
          タスク名 *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：朝のランニング"
          className="border border-zinc-900 bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600">
          目標開始時刻（任意）
        </label>
        <input
          type="time"
          value={targetStartTime}
          onChange={(e) => setTargetStartTime(e.target.value)}
          className="border border-zinc-900 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-[#3d5016]"
        />
        有効にする
      </label>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="border border-zinc-900 bg-[#3d5016] px-3 py-1.5 text-sm font-bold text-white hover:bg-[#4a6320] disabled:opacity-40"
        >
          保存
        </button>
      </div>
    </form>
  );
}
