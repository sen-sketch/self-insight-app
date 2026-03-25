"use client";

import { useState } from "react";
import type { LuckRecord } from "@/lib/types";

type SubmitData = {
  recordedAt: string;
  challengeText: string;
  emotionText: string;
  insightText: string | null;
  nextActionText: string | null;
};

type Props = {
  initial?: LuckRecord;
  onSubmit: (data: SubmitData) => void;
  onCancel?: () => void;
  submitLabel?: string;
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

export function LuckRecordForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "記録する",
}: Props) {
  const [recordedAt, setRecordedAt] = useState(
    initial ? toDatetimeLocalValue(initial.recordedAt) : nowDatetimeLocalValue()
  );
  const [challengeText, setChallengeText] = useState(initial?.challengeText ?? "");
  const [emotionText, setEmotionText] = useState(initial?.emotionText ?? "");
  const [insightText, setInsightText] = useState(initial?.insightText ?? "");
  const [nextActionText, setNextActionText] = useState(initial?.nextActionText ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (challengeText.trim().length === 0) {
      setError("やってみた行動は必須です");
      return;
    }
    if (emotionText.trim().length === 0) {
      setError("そのときの感情は必須です");
      return;
    }

    try {
      onSubmit({
        recordedAt: new Date(recordedAt).toISOString(),
        challengeText: challengeText.trim(),
        emotionText: emotionText.trim(),
        insightText: insightText.trim() || null,
        nextActionText: nextActionText.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-zinc-900 bg-[#f0ede6] p-4"
    >
      {/* やってみた行動 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="luck-challenge"
          className="text-sm font-medium text-zinc-700"
        >
          やってみた行動 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="luck-challenge"
          rows={3}
          value={challengeText}
          onChange={(e) => setChallengeText(e.target.value)}
          placeholder="運を上げるためにやってみたこと"
          className="border border-zinc-900 bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      {/* そのときの感情 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="luck-emotion"
          className="text-sm font-medium text-zinc-700"
        >
          そのときの感情 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="luck-emotion"
          rows={2}
          value={emotionText}
          onChange={(e) => setEmotionText(e.target.value)}
          placeholder="行動したときに感じたこと"
          className="border border-zinc-900 bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      {/* 気づき・洞察 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="luck-insight"
          className="text-sm font-medium text-zinc-700"
        >
          気づき・洞察
        </label>
        <textarea
          id="luck-insight"
          rows={2}
          value={insightText}
          onChange={(e) => setInsightText(e.target.value)}
          placeholder="振り返って気づいたこと（任意）"
          className="border border-zinc-900 bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      {/* 次のアクション */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="luck-next-action"
          className="text-sm font-medium text-zinc-700"
        >
          次のアクション
        </label>
        <textarea
          id="luck-next-action"
          rows={2}
          value={nextActionText}
          onChange={(e) => setNextActionText(e.target.value)}
          placeholder="次にやってみること（任意）"
          className="border border-zinc-900 bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>

      {/* 日時 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="luck-recorded-at"
          className="text-sm font-medium text-zinc-700"
        >
          日時
        </label>
        <input
          id="luck-recorded-at"
          type="datetime-local"
          value={recordedAt}
          onChange={(e) => setRecordedAt(e.target.value)}
          className="border border-zinc-900 bg-transparent px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
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
