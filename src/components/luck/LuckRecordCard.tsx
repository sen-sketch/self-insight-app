"use client";

import { useState } from "react";
import type { LuckRecord, UpdateLuckRecordInput } from "@/lib/types";
import { formatDisplayDateTime } from "@/lib/datetime";
import { LuckRecordForm } from "./LuckRecordForm";
import { Clover, Pencil, Trash2 } from "lucide-react";

type Props = {
  record: LuckRecord;
  onUpdate: (id: string, data: UpdateLuckRecordInput) => void;
  onDelete: (id: string) => void;
};

export function LuckRecordCard({ record, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (isEditing) {
    return (
      <LuckRecordForm
        initial={record}
        submitLabel="更新する"
        onSubmit={(data) => {
          onUpdate(record.id, data);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 border border-zinc-900 bg-[#f0ede6] p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clover size={18} strokeWidth={3} className="text-[#3d5016]" />
          <span className="text-xs text-zinc-400">
            {formatDisplayDateTime(record.recordedAt)}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            title="編集"
            className="p-1 text-[#3d5016] transition-colors hover:bg-zinc-200"
          >
            <Pencil size={14} strokeWidth={3} />
          </button>
          <button
            onClick={() => setIsConfirmingDelete(true)}
            title="削除"
            className="p-1 text-zinc-600 transition-colors hover:bg-zinc-200"
          >
            <Trash2 size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* やってみた行動 */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-zinc-500">やってみた行動</span>
        <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
          {record.challengeText}
        </p>
      </div>

      {/* そのときの感情 */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-zinc-500">そのときの感情</span>
        <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
          {record.emotionText}
        </p>
      </div>

      {/* 気づき・洞察 */}
      {record.insightText && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-zinc-500">気づき・洞察</span>
          <p className="whitespace-pre-wrap text-sm text-zinc-800">
            {record.insightText}
          </p>
        </div>
      )}

      {/* 次のアクション */}
      {record.nextActionText && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-zinc-500">次のアクション</span>
          <p className="whitespace-pre-wrap text-sm text-zinc-800">
            {record.nextActionText}
          </p>
        </div>
      )}

      {/* 削除確認 */}
      {isConfirmingDelete && (
        <div className="flex items-center gap-2 border border-red-300 bg-red-50 px-3 py-2">
          <span className="flex-1 text-xs text-red-700">
            本当に削除しますか？
          </span>
          <button
            onClick={() => onDelete(record.id)}
            className="bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
          >
            削除
          </button>
          <button
            onClick={() => setIsConfirmingDelete(false)}
            className="border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  );
}

