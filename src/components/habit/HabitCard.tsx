"use client";

import { useState } from "react";
import type { CreateHabitInput, Habit, HabitStartLog } from "@/lib/types";
import { HabitForm } from "./HabitForm";
import { HabitWeeklySummary } from "./HabitWeeklySummary";
import { toTokyoYmd, toTokyoHHmm } from "@/lib/datetime";
import { Pencil, Trash2, BarChart2, X } from "lucide-react";

type Props = {
  habit: Habit;
  logs: HabitStartLog[];
  onUpdate: (id: string, patch: Partial<CreateHabitInput>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onLogStart: (habitId: string, note: string | null) => void;
};

export function HabitCard({ habit, logs, onUpdate, onDelete, onToggleActive, onLogStart }: Props) {
  const [editing, setEditing] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState("");
  const [actionsExpanded, setActionsExpanded] = useState(false);

  function handleUpdate(data: CreateHabitInput) {
    onUpdate(habit.id, data);
    setEditing(false);
    setActionsExpanded(false);
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
        onCancel={() => { setEditing(false); setActionsExpanded(false); }}
      />
    );
  }

  return (
    <div
      className={`border border-zinc-200 bg-white p-3 transition-opacity ${
        !habit.isActive ? "opacity-50" : ""
      }`}
    >
      {/* Row 1: 主情報（習慣名 + 開始ボタン） */}
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-zinc-900">{habit.name}</span>
          {habit.targetStartTime && (
            <span className="text-xs text-zinc-400">目標: {habit.targetStartTime}</span>
          )}
        </div>
        {habit.isActive && (
          <button
            onClick={() => onLogStart(habit.id, null)}
            className="shrink-0 bg-[#3d5016] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#4a6320] active:bg-[#2e3d10]"
          >
            開始
          </button>
        )}
      </div>

      {/* メモ入力（展開時） */}
      {habit.isActive && showNoteInput && (
        <div className="mt-2 flex flex-col gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="補足メモ（任意）"
            autoFocus
            className="border border-zinc-200 bg-transparent px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#3d5016]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleConfirmNote}
              className="flex-1 bg-[#3d5016] py-1.5 text-sm font-bold text-white hover:bg-[#4a6320]"
            >
              記録する
            </button>
            <button
              onClick={() => { setShowNoteInput(false); setNote(""); }}
              className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-600"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Row 2: 操作群（メモ・有効/無効・グラフ・編集） */}
      <div className="mt-2 flex items-center gap-1">
        {habit.isActive && !showNoteInput && (
          <button
            onClick={() => setShowNoteInput(true)}
            className="border border-zinc-200 px-2.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
          >
            メモ
          </button>
        )}
        <button
          onClick={() => onToggleActive(habit.id, !habit.isActive)}
          className={`border px-2.5 py-1 text-xs font-medium ${
            habit.isActive
              ? "border-zinc-200 text-zinc-500"
              : "border-zinc-200 text-zinc-400"
          }`}
        >
          {habit.isActive ? "有効" : "無効"}
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setShowWeekly((prev) => !prev)}
          title="週次サマリー"
          className={`p-1.5 hover:text-zinc-700 ${showWeekly ? "text-zinc-700" : "text-zinc-400"}`}
        >
          <BarChart2 size={14} strokeWidth={1.5} />
        </button>

        {!actionsExpanded ? (
          <button
            onClick={() => setActionsExpanded(true)}
            title="編集"
            className="p-1.5 text-zinc-400 hover:text-zinc-700"
          >
            <Pencil size={14} strokeWidth={1.5} />
          </button>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              title="フォームで編集"
              className="p-1.5 text-zinc-500 hover:text-zinc-800"
            >
              <Pencil size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => {
                if (confirm(`「${habit.name}」を削除しますか？`)) onDelete(habit.id);
              }}
              title="削除"
              className="p-1.5 text-zinc-400 hover:text-red-500"
            >
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setActionsExpanded(false)}
              title="閉じる"
              className="p-1.5 text-zinc-300 hover:text-zinc-600"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {/* 時刻チップ */}
      {habit.isActive && (() => {
        const todayYmd = toTokyoYmd(new Date().toISOString());
        const todayLogs = logs
          .filter((l) => toTokyoYmd(l.startedAt) === todayYmd)
          .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
        if (todayLogs.length === 0) return null;
        return (
          <div className="mt-2 flex flex-wrap gap-1">
            {todayLogs.map((l) => (
              <span
                key={l.id}
                className="bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500"
              >
                {toTokyoHHmm(l.startedAt)}{l.note ? ` · ${l.note}` : ""}
              </span>
            ))}
          </div>
        );
      })()}

      {habit.isActive && showWeekly && <HabitWeeklySummary habitId={habit.id} />}
    </div>
  );
}
