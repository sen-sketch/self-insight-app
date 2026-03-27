"use client";

import { useState, useCallback, useRef } from "react";
import { toTokyoYmd, getRecentDateRange } from "@/lib/datetime";
import {
  getTimelinePosts,
  getHabits,
  getHabitStartLogs,
} from "@/storage";
import { buildTimelineExportText, buildHabitExportText } from "@/lib/export";
import type { ExportPeriod } from "@/lib/export";

const PRESET_DAYS = [
  { label: "直近1日", days: 1 as const },
  { label: "直近7日", days: 7 as const },
  { label: "直近30日", days: 30 as const },
];

async function copyTextWithFallback(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  return ok;
}



export function ExportPage() {
  const today = toTokyoYmd();

  const [fromDate, setFromDate] = useState(() => getRecentDateRange(7).fromDate);
  const [toDate, setToDate] = useState(today);

  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const outputRef = useRef<HTMLTextAreaElement | null>(null);

  const generateTimeline = useCallback(() => {
    const period: ExportPeriod = { fromDate, toDate };
    const text = buildTimelineExportText({
      period,
      timelinePosts: getTimelinePosts(),
    });
    setOutputText(text);
    setCopied(false);
  }, [fromDate, toDate]);

  const generateHabit = useCallback(() => {
    const period: ExportPeriod = { fromDate, toDate };
    const text = buildHabitExportText({
      period,
      habits: getHabits(),
      habitLogs: getHabitStartLogs(),
    });
    setOutputText(text);
    setCopied(false);
  }, [fromDate, toDate]);

  const handleCopy = useCallback(async () => {
    if (!outputText) return;

    setCopyError(null);

    try {
        const ok = await copyTextWithFallback(outputText);
        if (!ok) throw new Error("copy failed");

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch {
        const el = outputRef.current;
        if (el) {
        el.focus();
        el.select();
        el.setSelectionRange(0, el.value.length);
        }
        setCopyError("自動コピー失敗。テキストを長押ししてコピーしてください。");
    }
    }, [outputText]);


  const handlePreset = (days: 1 | 7 | 30) => {
    const range = getRecentDateRange(days);
    setFromDate(range.fromDate);
    setToDate(range.toDate);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="w-full text-center text-xl font-black text-zinc-900">エクスポート</h1>

      {/* ステップ1：期間選択UI */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          期間
        </h2>
        <div className="flex gap-2 flex-wrap">
          {PRESET_DAYS.map(({ label, days }) => (
            <button
              key={days}
              type="button"
              onClick={() => handlePreset(days)}
              className="px-3 py-1.5 text-sm border border-zinc-900 text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-zinc-900 bg-transparent px-2 py-1.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
          />
          <span className="text-zinc-500">〜</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            max={today}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-zinc-900 bg-transparent px-2 py-1.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
          />
        </div>
      </section>

      {/* 出力ボタン */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          出力項目
        </h2>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={generateTimeline}
            className="w-full border border-zinc-900 bg-[#3d5016] py-2.5 text-white font-bold hover:bg-[#4a6320] transition-colors"
          >
            タイムライン
          </button>
          <button
            type="button"
            onClick={generateHabit}
            className="w-full border border-zinc-900 bg-[#3d5016] py-2.5 text-white font-bold hover:bg-[#4a6320] transition-colors"
          >
            習慣記録
          </button>
        </div>
      </section>

      {/* ステップ8：出力欄UI */}
      {outputText && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              出力テキスト
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm border border-zinc-900 bg-[#3d5016] text-white hover:bg-[#4a6320] transition-colors"
              >
                {copied ? "コピー済み ✓" : "コピー"}
              </button>
              {copyError && (
                <p className="text-xs text-red-500">{copyError}</p>
                )}
            </div>
          </div>
          <textarea
            ref={outputRef}
            readOnly
            value={outputText}
            rows={20}
            className="w-full border border-zinc-200 bg-white text-zinc-900 text-sm font-mono p-3 resize-y focus:outline-none"
          />
        </section>
      )}
    </div>
  );
}
