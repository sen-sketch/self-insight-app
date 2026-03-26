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
      className={`border p-4 transition-opacity ${
        habit.isActive
          ? "border-zinc-900 bg-[#f0ede6]"
          : "border-zinc-900 bg-[#f0ede6] opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          {!habit.isActive && (
            <span className="text-sm font-medium text-zinc-900">{habit.name}</span>
          )}
          {habit.targetStartTime && (
            <span className="text-xs text-zinc-400">目標: {habit.targetStartTime}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setShowWeekly((prev) => !prev)}
            title="週次サマリー"
            className="px-1.5 py-0.5 text-zinc-600 hover:text-zinc-900"
          >
            <BarChart2 size={14} strokeWidth={3} />
          </button>

          {!actionsExpanded ? (
            <button
              onClick={() => setActionsExpanded(true)}
              title="編集"
              className="px-1.5 py-0.5 text-[#3d5016] hover:text-zinc-900"
            >
              <Pencil size={14} strokeWidth={3} />
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                title="フォームで編集"
                className="px-1.5 py-0.5 text-[#3d5016] hover:text-zinc-900"
              >
                <Pencil size={14} strokeWidth={3} />
              </button>
              <button
                onClick={() => {
                  if (confirm(`「${habit.name}」を削除しますか？`)) onDelete(habit.id);
                }}
                title="削除"
                className="px-1.5 py-0.5 text-zinc-600 hover:text-zinc-900"
              >
                <Trash2 size={14} strokeWidth={3} />
              </button>
              <button
                onClick={() => setActionsExpanded(false)}
                title="閉じる"
                className="px-1.5 py-0.5 text-zinc-400 hover:text-zinc-900"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {habit.isActive && showNoteInput ? (
          <>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="補足メモ（任意）"
              autoFocus
              className="border border-zinc-900 bg-transparent px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleConfirmNote}
                className="flex-1 border border-zinc-900 bg-[#3d5016] py-1.5 text-sm font-bold text-white hover:bg-[#4a6320]"
              >
                記録する
              </button>
              <button
                onClick={() => { setShowNoteInput(false); setNote(""); }}
                className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-700"
              >
                キャンセル
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            {habit.isActive && (
              <>
                <button
                  onClick={() => onLogStart(habit.id, null)}
                  className="flex-1 border border-zinc-900 bg-[#3d5016] py-1.5 text-sm font-bold text-white hover:bg-[#4a6320]"
                >
                  {habit.name}　開始
                </button>
                <button
                  onClick={() => setShowNoteInput(true)}
                  className="border border-zinc-900 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-200"
                >
                  メモ
                </button>
              </>
            )}
            <button
              onClick={() => onToggleActive(habit.id, !habit.isActive)}
              className={`px-2 py-0.5 text-xs font-medium border ${
                habit.isActive
                  ? "border-[#3d5016] text-[#3d5016]"
                  : "border-zinc-400 text-zinc-500"
              }`}
            >
              {habit.isActive ? "有効" : "無効"}
            </button>
          </div>
        )}

        {habit.isActive && (() => {
          const todayYmd = toTokyoYmd(new Date().toISOString());
          const todayLogs = logs
            .filter((l) => toTokyoYmd(l.startedAt) === todayYmd)
            .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
          if (todayLogs.length === 0) return null;
          return (
            <div className="flex flex-wrap gap-1">
              {todayLogs.map((l) => (
                <span key={l.id} className="border border-[#3d5016] px-2 py-0.5 text-xs text-[#3d5016]">
                  {toTokyoHHmm(l.startedAt)}{l.note ? ` (${l.note})` : ""}
                </span>
              ))}
            </div>
          );
        })()}
        {habit.isActive && showWeekly && <HabitWeeklySummary habitId={habit.id} />}
      </div>
    </div>
  );
}
