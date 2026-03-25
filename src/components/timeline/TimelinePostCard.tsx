// 編集、削除、タグ表示UI
"use client";

import { useState } from "react";
import type { MoodScore, TimelinePost } from "@/lib/types";
import { formatDisplayDateTime } from "@/lib/datetime";
import { TimelinePostForm } from "./TimelinePostForm";
import { Pencil, Trash2, Annoyed, Frown, Meh, Smile, Laugh } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
    post: TimelinePost;
    onUpdate: (id: string, data: { postedAt: string; moodScore: MoodScore; content: string; tags: string[] }) => void;
    onDelete: (id: string) => void;
};

const MOOD_ICONS: Record<MoodScore, LucideIcon> = {
  1: Annoyed,
  2: Frown,
  3: Meh,
  4: Smile,
  5: Laugh,
};

export function TimelinePostCard({ post, onUpdate, onDelete }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    if (isEditing) {
        return (
            <TimelinePostForm
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

    return(
        <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {(() => { const Icon = MOOD_ICONS[post.moodScore]; return <Icon size={20} strokeWidth={3} aria-label={`気分スコア ${post.moodScore}`} className="text-amber-500 dark:text-amber-400" />; })()}
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {formatDisplayDateTime(post.postedAt)}
                    </span>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setIsEditing(true)}
                        title="編集"
                        className="rounded-md p-1 text-amber-500 transition-colors hover:bg-amber-50 dark:hover:bg-zinc-800"
                    >
                        <Pencil size={14} strokeWidth={3} />
                    </button>
                    <button
                        onClick={() => setIsConfirmingDelete(true)}
                        title="削除"
                        className="rounded-md p-1 text-orange-500 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950"
                    >
                        <Trash2 size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>

             {/* 本文 */}
            <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
                {post.content}
            </p>

            {/* タグ */}
            {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                    <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-300"
                    >
                    #{tag}
                    </span>
                ))}
                </div>
            )}  

            {/* 削除確認 */}
            {isConfirmingDelete && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-950">
                <span className="flex-1 text-xs text-red-700 dark:text-red-300">
                    本当に削除しますか？
                </span>
                <button
                    onClick={() => onDelete(post.id)}
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

