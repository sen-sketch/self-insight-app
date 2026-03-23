"use client";

import { useState } from "react";
import type { LuckRecord, UpdateLuckRecordInput } from "@/lib/types";
import { formatDisplayDateTime } from "@/lib/datetime";
import { LuckRecordForm } from "./LuckRecordForm";

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
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🍀</span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {formatDisplayDateTime(record.recordedAt)}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            編集
          </button>
          <button
            onClick={() => setIsConfirmingDelete(true)}
            className="rounded-md px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
          >
            削除
          </button>
        </div>
      </div>

      {/* やってみた行動 */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">やってみた行動</span>
        <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
          {record.challengeText}
        </p>
      </div>

      {/* そのときの感情 */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">そのときの感情</span>
        <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
          {record.emotionText}
        </p>
      </div>

      {/* 気づき・洞察 */}
      {record.insightText && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">気づき・洞察</span>
          <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
            {record.insightText}
          </p>
        </div>
      )}

      {/* 次のアクション */}
      {record.nextActionText && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">次のアクション</span>
          <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
            {record.nextActionText}
          </p>
        </div>
      )}

      {/* 削除確認 */}
      {isConfirmingDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-950">
          <span className="flex-1 text-xs text-red-700 dark:text-red-300">
            本当に削除しますか？
          </span>
          <button
            onClick={() => onDelete(record.id)}
            className="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
          >
            削除
          </button>
          <button
            onClick={() => setIsConfirmingDelete(false)}
            className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300"
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  );
}

