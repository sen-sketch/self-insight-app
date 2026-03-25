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
    <div className="flex flex-col gap-3 border border-zinc-900 bg-[#f0ede6] p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#3d5016]">
          {diary.diaryDate}
        </span>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            title="削除"
            className="p-1 text-zinc-500 hover:text-zinc-900 transition-colors"
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

      <div className="flex flex-col gap-2 text-sm text-zinc-700">
        <div>
          <span className="font-medium text-zinc-500 text-xs">目標</span>
          <p className="mt-0.5 whitespace-pre-wrap">{diary.goalText}</p>
        </div>
        <div>
          <span className="font-medium text-zinc-500 text-xs">やったこと</span>
          <p className="mt-0.5 whitespace-pre-wrap">{diary.actualText}</p>
        </div>
        {diary.blockedPointsText && (
          <div>
            <span className="font-medium text-zinc-500 text-xs">詰まったこと</span>
            <p className="mt-0.5 whitespace-pre-wrap">{diary.blockedPointsText}</p>
          </div>
        )}
        <div>
          <span className="font-medium text-zinc-500 text-xs">明日の予定</span>
          <p className="mt-0.5 whitespace-pre-wrap">{diary.tomorrowPlanText}</p>
        </div>
      </div>
    </div>
  );
}
