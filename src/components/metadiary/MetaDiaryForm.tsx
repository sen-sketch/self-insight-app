"use client";

import { useState } from "react";
import type { MetaDiary, UpsertMetaDiaryInput } from "@/lib/types";

type Props = {
  initial?: MetaDiary;
  onSubmit: (data: UpsertMetaDiaryInput) => void;
};

export function MetaDiaryForm({ initial, onSubmit }: Props) {
  const [goalText, setGoalText] = useState(initial?.goalText ?? "");
  const [actualText, setActualText] = useState(initial?.actualText ?? "");
  const [blockedPointsText, setBlockedPointsText] = useState(
    initial?.blockedPointsText ?? ""
  );
  const [tomorrowPlanText, setTomorrowPlanText] = useState(
    initial?.tomorrowPlanText ?? ""
  );
  const [error, setError] = useState<string | null>(null);

  const isUpdate = initial !== undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (goalText.trim().length === 0) {
      setError("今日の目標は必須です");
      return;
    }
    if (actualText.trim().length === 0) {
      setError("今日やったことは必須です");
      return;
    }
    if (tomorrowPlanText.trim().length === 0) {
      setError("明日の予定は必須です");
      return;
    }

    try {
      onSubmit({
        goalText: goalText.trim(),
        actualText: actualText.trim(),
        blockedPointsText: blockedPointsText.trim() || null,
        tomorrowPlanText: tomorrowPlanText.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-zinc-200 bg-white p-4"
    >
      {isUpdate && (
        <p className="text-xs font-medium text-[#3d5016]">
          本日の日記が存在します — 上書き更新されます
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label
          htmlFor="meta-goal"
          className="text-sm font-medium text-zinc-700"
        >
          今日の目標 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="meta-goal"
          rows={2}
          value={goalText}
          onChange={(e) => setGoalText(e.target.value)}
          placeholder="今日達成したいこと"
          className="border border-zinc-900 bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="meta-actual"
          className="text-sm font-medium text-zinc-700"
        >
          今日やったこと <span className="text-red-500">*</span>
        </label>
        <textarea
          id="meta-actual"
          rows={3}
          value={actualText}
          onChange={(e) => setActualText(e.target.value)}
          placeholder="実際にやったこと"
          className="border border-zinc-900 bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="meta-blocked"
          className="text-sm font-medium text-zinc-700"
        >
          詰まったこと・障害
        </label>
        <textarea
          id="meta-blocked"
          rows={2}
          value={blockedPointsText}
          onChange={(e) => setBlockedPointsText(e.target.value)}
          placeholder="うまくいかなかったこと（任意）"
          className="border border-zinc-900 bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="meta-tomorrow"
          className="text-sm font-medium text-zinc-700"
        >
          明日の予定 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="meta-tomorrow"
          rows={2}
          value={tomorrowPlanText}
          onChange={(e) => setTomorrowPlanText(e.target.value)}
          placeholder="明日やること"
          className="border border-zinc-900 bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        className="border border-zinc-900 bg-[#3d5016] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#4a6320]"
      >
        {isUpdate ? "更新する" : "保存する"}
      </button>
    </form>
  );
}
