"use client";

import { useState, useCallback, useRef } from "react";
import { toTokyoYmd, getRecentDateRange } from "@/lib/datetime";
import {
  getTimelinePosts,
  getHabits,
  getHabitStartLogs,
  getLuckRecords,
  getMetaDiaries,
} from "@/storage";
import { buildExportText } from "@/lib/export";
import type { ExportPeriod, ExportTargets } from "@/lib/export";

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


const TARGET_ITEMS = [
  { key: "timeline", label: "タイムライン" },
  { key: "habit", label: "習慣記録" },
  { key: "luck", label: "運を上げる記録" },
  { key: "metaDiary", label: "メタ認知日記" },
] as const;

export function ExportPage() {
  const today = toTokyoYmd();

  const [fromDate, setFromDate] = useState(() => getRecentDateRange(7).fromDate);
  const [toDate, setToDate] = useState(today);

  const [targets, setTargets] = useState<ExportTargets>({
    timeline: true,
    habit: true,
    luck: true,
    metaDiary: true,
  });

  const [outputText, setOutputText] = useState("");

  const [copied, setCopied] = useState(false);

  const [copyError, setCopyError] = useState<string | null>(null);
  const outputRef = useRef<HTMLTextAreaElement | null>(null);


  const generate = useCallback(() => {
    const period: ExportPeriod = { fromDate, toDate };
    const text = buildExportText({
      period,
      targets,
      timelinePosts: getTimelinePosts(),
      habits: getHabits(),
      habitLogs: getHabitStartLogs(),
      luckRecords: getLuckRecords(),
      metaDiaries: getMetaDiaries(),
    });
    setOutputText(text);
    setCopied(false);
  }, [fromDate, toDate, targets]);

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

  const toggleTarget = (key: keyof ExportTargets) => {
    setTargets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">エクスポート</h1>

      {/* ステップ1：期間選択UI */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          期間
        </h2>
        <div className="flex gap-2 flex-wrap">
          {PRESET_DAYS.map(({ label, days }) => (
            <button
              key={days}
              type="button"
              onClick={() => handlePreset(days)}
              className="px-3 py-1.5 text-sm rounded-full border border-gray-300 dark:border-gray-600
                         text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                         transition-colors"
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
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5
                       bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          />
          <span className="text-gray-500">〜</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            max={today}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5
                       bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          />
        </div>
      </section>

      {/* ステップ2：出力対象チェックUI */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          出力対象
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {TARGET_ITEMS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
            >
              <input
                type="checkbox"
                checked={targets[key]}
                onChange={() => toggleTarget(key)}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* 生成ボタン */}
      <button
        type="button"
        onClick={generate}
        className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold
                   hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
      >
        テキストを生成する
      </button>

      {/* ステップ8：出力欄UI */}
      {outputText && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              出力テキスト
            </h2>
            <div className="flex gap-2">
              
              <button
                type="button"
                onClick={generate}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                           transition-colors"
              >
                再生成
              </button>
              
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white
                           hover:bg-indigo-700 transition-colors"
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
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600
                       bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100
                       text-sm font-mono p-3 resize-y"
          />
        </section>
      )}
    </div>
  );
}
