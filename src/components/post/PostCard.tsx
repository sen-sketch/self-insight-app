"use client";

import { useState } from "react";
import type { MoodScore, Post, Habit, CreatePostInput } from "@/lib/types";
import { formatDisplayDateTime } from "@/lib/datetime";
import { UnifiedPostForm } from "./UnifiedPostForm";
import { Pencil, Trash2, Annoyed, Frown, Meh, Smile, Laugh } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  post: Post;
  habits: Habit[];
  onUpdate: (id: string, data: CreatePostInput) => void;
  onDelete: (id: string) => void;
};

const MOOD_ICONS: Record<MoodScore, LucideIcon> = {
  1: Annoyed,
  2: Frown,
  3: Meh,
  4: Smile,
  5: Laugh,
};

export function PostCard({ post, habits, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const habitNameMap = new Map(habits.map((h) => [h.id, h.name]));

  if (isEditing) {
    return (
      <UnifiedPostForm
        habits={habits}
        initial={post}
        submitLabel="更新する"
        onSubmit={(data) => {
          onUpdate(post.id, data);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 border border-zinc-200 bg-white p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {post.moodScore !== null && (() => {
            const Icon = MOOD_ICONS[post.moodScore];
            return (
              <Icon
                size={20}
                strokeWidth={3}
                aria-label={`気分スコア ${post.moodScore}`}
                className="text-[#3d5016]"
              />
            );
          })()}
          <span className="text-xs text-zinc-400">
            {formatDisplayDateTime(post.postedAt)}
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

      {/* 何をしたか */}
      {post.whatText && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-zinc-400">何をしたか</span>
          <p className="whitespace-pre-wrap text-sm text-zinc-800">{post.whatText}</p>
        </div>
      )}

      {/* 結果・気づき */}
      {post.resultText && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-zinc-400">結果・気づき</span>
          <p className="whitespace-pre-wrap text-sm text-zinc-800">{post.resultText}</p>
        </div>
      )}

      {/* 疑問と考察 */}
      {post.questionText && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-zinc-400">疑問と考察</span>
          <p className="whitespace-pre-wrap text-sm text-zinc-800">{post.questionText}</p>
        </div>
      )}

      {/* 習慣タグ + 自由タグ */}
      {(post.habitTags.length > 0 || post.freeTags.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {post.habitTags.map((id) => {
            const name = habitNameMap.get(id) ?? id;
            return (
              <span
                key={id}
                className="border border-[#3d5016] bg-[#3d5016]/10 px-2 py-0.5 text-xs font-medium text-[#3d5016]"
              >
                {name}
              </span>
            );
          })}
          {post.freeTags.map((tag) => (
            <span
              key={tag}
              className="border border-zinc-400 px-2 py-0.5 text-xs font-medium text-zinc-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 削除確認 */}
      {isConfirmingDelete && (
        <div className="flex items-center gap-2 border border-red-300 bg-red-50 px-3 py-2">
          <span className="flex-1 text-xs text-red-700">本当に削除しますか？</span>
          <button
            onClick={() => onDelete(post.id)}
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
