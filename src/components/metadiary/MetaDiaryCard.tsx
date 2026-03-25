"use client";

import { useState } from "react";
import type { MetaDiary } from "@/lib/types";
import { Trash2 } from "lucide-react";

type Props = {
  diary: MetaDiary;
  onDelete: (id: string) => void;
};

export function MetaDiaryCard({ diary, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          {diary.diaryDate}
        </span>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            title="削除"
            className="p-1 text-orange-400 hover:text-orange-600 transition-colors"
          >
            <Trash2 size={14} strokeWidth={3} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">本当に削除しますか？</span>
            <button
              onClick={() => onDelete(diary.id)}
              className="text-xs text-red-500 font-medium hover:text-red-600"
            >
              削除する
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <div>
          <span className="font-medium text-zinc-500 dark:text-zinc-400 text-xs">目標</span>
          <p className="mt-0.5 whitespace-pre-wrap">{diary.goalText}</p>
        </div>
        <div>
          <span className="font-medium text-zinc-500 dark:text-zinc-400 text-xs">やったこと</span>
          <p className="mt-0.5 whitespace-pre-wrap">{diary.actualText}</p>
        </div>
        {diary.blockedPointsText && (
          <div>
            <span className="font-medium text-zinc-500 dark:text-zinc-400 text-xs">詰まったこと</span>
            <p className="mt-0.5 whitespace-pre-wrap">{diary.blockedPointsText}</p>
          </div>
        )}
        <div>
          <span className="font-medium text-zinc-500 dark:text-zinc-400 text-xs">明日の予定</span>
          <p className="mt-0.5 whitespace-pre-wrap">{diary.tomorrowPlanText}</p>
        </div>
      </div>
    </div>
  );
}
