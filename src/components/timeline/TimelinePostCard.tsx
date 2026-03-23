// 編集、削除、タグ表示UI
"use client";

import { useState } from "react";
import type { MoodScore, TimelinePost } from "@/lib/types";
import { formatDisplayDateTime } from "@/lib/datetime";
import { TimelinePostForm } from "./TimelinePostForm";

type Props = {
    post: TimelinePost;
    onUpdate: (id: string, data: { postedAt: string; moodScore: MoodScore; content: string; tags: string[] }) => void;
    onDelete: (id: string) => void;
};

const MOOD_LABELS: Record<MoodScore, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😄",
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
                    <span className="text-xl" aria-label={`気分スコア ${post.moodScore}`}>
                        {MOOD_LABELS[post.moodScore]}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {formatDisplayDateTime(post.postedAt)}
                    </span>
                </div>
                <div className="flex gap-1">
                    <button
                    onClick={() =>setIsEditing(true)}
                    className="rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
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

