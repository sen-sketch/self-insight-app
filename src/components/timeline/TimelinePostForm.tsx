// 投稿フォーム
"use client";

import { useState } from "react";
import type { MoodScore, TimelinePost } from "@/lib/types";
import { Annoyed, Frown, Meh, Smile, Laugh } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SubmitData = {
  postedAt: string;
  moodScore: MoodScore;
  content: string;
  tags: string[];
};

type Props = {
  initial?: TimelinePost;
  onSubmit: (data: SubmitData) => void;
  onCancel?: () => void;
  submitLabel?: string;
};

const MOOD_SCORES: MoodScore[] = [1, 2, 3, 4, 5];
const MOOD_ICONS: Record<MoodScore, LucideIcon> = {
  1: Annoyed,
  2: Frown,
  3: Meh,
  4: Smile,
  5: Laugh,
};

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function nowDatetimeLocalValue(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}


export function TimelinePostForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "投稿する",
}: Props) {
  const [postedAt, setPostedAt] = useState(
    initial ? toDatetimeLocalValue(initial.postedAt) : nowDatetimeLocalValue()
  );
  const [moodScore, setMoodScore] = useState<MoodScore>(initial?.moodScore ?? 3);
  const [content, setContent] = useState(initial?.content ?? "");
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);

  function parseTags(raw: string): string[] {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (content.trim().length === 0) {
      setError("本文を入力してください");
      return;
    }

    try {
      onSubmit({
        postedAt: new Date(postedAt).toISOString(),
        moodScore,
        content: content.trim(),
        tags: parseTags(tagsInput),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
    >
      {/* 気分スコア */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">気分</span>
        <div className="flex gap-2">
          {MOOD_SCORES.map((score) => {
            const Icon = MOOD_ICONS[score];
            return (
              <button
                key={score}
                type="button"
                onClick={() => setMoodScore(score)}
                aria-label={`気分スコア ${score}`}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  moodScore === score
                    ? "bg-orange-500 text-white ring-2 ring-orange-300"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                <Icon size={20} strokeWidth={3} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 本文 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="timeline-content"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          本文 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="timeline-content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今どんな状態？思考・感情・行動を書いてみよう"
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* タグ */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="timeline-tags"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          タグ（カンマ区切り）
        </label>
        <input
          id="timeline-tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="例: 仕事, 感情, 振り返り"
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* 日時 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="timeline-posted-at"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          日時
        </label>
        <input
          id="timeline-posted-at"
          type="datetime-local"
          value={postedAt}
          onChange={(e) => setPostedAt(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
