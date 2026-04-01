"use client";

import { useState } from "react";
import type { CreateHabitInput, Habit, HabitStartLog } from "@/lib/types";
import { HabitForm } from "./HabitForm";
import { HabitWeeklySummary } from "./HabitWeeklySummary";
import { toTokyoYmd, toTokyoHHmm } from "@/lib/datetime";
import { Pencil, Trash2, X } from "lucide-react";

type Props = {
  habit: Habit;
  logs: HabitStartLog[];
  onUpdate: (id: string, patch: Partial<CreateHabitInput>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onLogStart?: (habitId: string, note: string | null) => void;
  settingsMode?: boolean;
};

export function HabitCard({ habit, logs, onUpdate, onDelete, onToggleActive, onLogStart, settingsMode = false }: Props) {
  const [editing, setEditing] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState("");
  const [actionsExpanded, setActionsExpanded] = useState(false);

  function handleUpdate(data: CreateHabitInput) {
    onUpdate(habit.id, data);
    setEditing(false);
    setActionsExpanded(false);
  }

  function handleConfirmNote() {
    onLogStart?.(habit.id, note.trim() || null);
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

  // ─── ダッシュボードモード ───────────────────────────────────
  if (!settingsMode) {
    const todayYmd = toTokyoYmd(new Date().toISOString());
    const todayLogs = logs
      .filter((l) => toTokyoYmd(l.startedAt) === todayYmd)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

    return (
      <div className={`bg-white px-3 py-2 transition-opacity ${!habit.isActive ? "opacity-50" : ""}`}>
        {/* 週次サマリー3行（アクティブ習慣のみ） */}
        {habit.isActive ? (
          <HabitWeeklySummary habitId={habit.id} habitName={habit.name} logs={logs} />
        ) : (
          <span className="truncate text-sm font-semibold text-zinc-900">{habit.name}</span>
        )}

        {/* メモ入力 */}
        {habit.isActive && onLogStart && showNoteInput && (
          <div className="mt-1 flex flex-col gap-2">
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

        {/* 本日の記録チップ */}
        {habit.isActive && onLogStart && todayLogs.length > 0 && (
          <div className="mt-1 flex flex-wrap justify-end gap-1">
            {todayLogs.map((l) => (
              <span key={l.id} className="bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                {toTokyoHHmm(l.startedAt)}{l.note ? ` · ${l.note}` : ""}
              </span>
            ))}
          </div>
        )}

        {/* アクションボタン */}
        <div className="mt-1 flex items-center justify-end gap-1.5">
          {habit.isActive && onLogStart && !showNoteInput && (
            <button
              onClick={() => setShowNoteInput(true)}
              className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-600"
            >
              メモ
            </button>
          )}
          {habit.isActive && onLogStart && (
            <button
              onClick={() => onLogStart(habit.id, null)}
              className="bg-[#3d5016] px-3 py-1 text-xs font-bold text-white hover:bg-[#4a6320] active:bg-[#2e3d10]"
            >
              開始
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── 設定モード ────────────────────────────────────────────
  return (
    <div className={`flex gap-2 bg-white px-3 py-2 transition-opacity ${!habit.isActive ? "opacity-50" : ""}`}>
      <div className="flex flex-1 min-w-0 items-center">
        <span className="truncate text-sm font-semibold text-zinc-900">{habit.name}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1.5">
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
                onClick={() => { onToggleActive(habit.id, !habit.isActive); setActionsExpanded(false); }}
                className="border border-zinc-300 px-2 py-0.5 text-xs font-medium text-zinc-500 hover:border-red-300 hover:text-red-500"
              >
                {habit.isActive ? "中止" : "有効にする"}
              </button>
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
      </div>
    </div>
  );
}
