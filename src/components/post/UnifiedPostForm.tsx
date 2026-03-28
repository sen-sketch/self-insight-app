"use client";

import { useState } from "react";
import type { MoodScore, Post, CreatePostInput, Habit } from "@/lib/types";
import { Annoyed, Frown, Meh, Smile, Laugh } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  habits: Habit[];
  initial?: Post;
  onSubmit: (data: CreatePostInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
};

const MOOD_SCORES: MoodScore[] = [5, 4, 3, 2, 1];
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

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function UnifiedPostForm({
  habits,
  initial,
  onSubmit,
  onCancel,
  submitLabel = "投稿する",
}: Props) {
  const [postedAt, setPostedAt] = useState(
    initial ? toDatetimeLocalValue(initial.postedAt) : nowDatetimeLocalValue()
  );
  const [moodScore, setMoodScore] = useState<MoodScore | null>(
    initial?.moodScore ?? null
  );
  const [whatText, setWhatText] = useState(initial?.whatText ?? "");
  const [resultText, setResultText] = useState(initial?.resultText ?? "");
  const [questionText, setQuestionText] = useState(initial?.questionText ?? "");
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(
    initial?.habitTags ?? []
  );
  const [freeTagsInput, setFreeTagsInput] = useState(
    initial?.freeTags.join(", ") ?? ""
  );
  const [error, setError] = useState<string | null>(null);

  const activeHabits = habits.filter((h) => h.isActive);

  function toggleHabit(id: string) {
    setSelectedHabitIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedWhat = whatText.trim();
    const trimmedResult = resultText.trim();
    const trimmedQuestion = questionText.trim();

    if (
      !trimmedWhat &&
      !trimmedResult &&
      !trimmedQuestion &&
      selectedHabitIds.length === 0
    ) {
      setError("何か1つ以上入力してください");
      return;
    }

    try {
      onSubmit({
        postedAt: new Date(postedAt).toISOString(),
        moodScore,
        whatText: trimmedWhat || null,
        resultText: trimmedResult || null,
        questionText: trimmedQuestion || null,
        habitTags: selectedHabitIds,
        freeTags: parseTags(freeTagsInput),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-[#f0ede6] p-4"
    >
      {/* 気分スコア（任意） */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">
          気分
        </span>
        <div className="flex gap-2">
          {MOOD_SCORES.map((score) => {
            const Icon = MOOD_ICONS[score];
            const isSelected = moodScore === score;
            return (
              <button
                key={score}
                type="button"
                onClick={() => setMoodScore(isSelected ? null : score)}
                aria-label={`気分スコア ${score}${isSelected ? "（選択中・クリックで解除）" : ""}`}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  isSelected
                    ? "bg-[#3d5016] text-white ring-2 ring-[#3d5016]/40"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                <Icon size={20} strokeWidth={2.5} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 何をしたか */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="post-what"
          className="text-sm font-medium text-zinc-700"
        >
          何をしたか
        </label>
        <textarea
          id="post-what"
          rows={3}
          value={whatText}
          onChange={(e) => setWhatText(e.target.value)}
          placeholder="目標・行動・食事内容・トレーニング内容など"
          className="border border-zinc-900 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      {/* 結果・気づき */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="post-result"
          className="text-sm font-medium text-zinc-700"
        >
          結果・気づき
        </label>
        <textarea
          id="post-result"
          rows={3}
          value={resultText}
          onChange={(e) => setResultText(e.target.value)}
          placeholder="うまくいったこと・難しかったこと"
          className="border border-zinc-900 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      {/* 疑問と考察 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="post-question"
          className="text-sm font-medium text-zinc-700"
        >
          疑問と考察
        </label>
        <textarea
          id="post-question"
          rows={3}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="なぜうまく行ったのか？結果が出ないパターンの共通点は何か？その感情の裏にある前提は？"
          className="border border-zinc-900 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      {/* 習慣タグ */}
      {activeHabits.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700">
            習慣タスク
          </span>
          <div className="flex flex-wrap gap-2">
            {activeHabits.map((habit) => {
              const isSelected = selectedHabitIds.includes(habit.id);
              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => toggleHabit(habit.id)}
                  className={`border px-3 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? "border-[#3d5016] bg-[#3d5016] text-white"
                      : "border-zinc-400 bg-white text-zinc-600 hover:border-[#3d5016] hover:text-[#3d5016]"
                  }`}
                >
                  {habit.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 自由タグ */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="post-free-tags"
          className="text-sm font-medium text-zinc-700"
        >
          タグ（カンマ区切り）
        </label>
        <input
          id="post-free-tags"
          type="text"
          value={freeTagsInput}
          onChange={(e) => setFreeTagsInput(e.target.value)}
          placeholder="例: 仕事, 感情, 振り返り"
          className="border border-zinc-900 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      {/* 日時 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="post-posted-at"
          className="text-sm font-medium text-zinc-700"
        >
          日時
        </label>
        <input
          id="post-posted-at"
          type="datetime-local"
          value={postedAt}
          onChange={(e) => setPostedAt(e.target.value)}
          className="border border-zinc-900 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 border border-zinc-900 bg-[#3d5016] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#4a6320]"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border border-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
