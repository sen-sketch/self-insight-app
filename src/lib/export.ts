import type { Post, Habit, HabitStartLog } from "@/lib/types";
import { toTokyoYmd, toTokyoHHmm, formatDisplayDateTime } from "@/lib/datetime";

export type ExportPeriod = {
  fromDate: string; // YYYY-MM-DD
  toDate: string;   // YYYY-MM-DD
};

export type ExportTargets = {
  timeline: boolean;
  habit: boolean;
  luck: boolean;
  metaDiary: boolean;
};

const MOOD_LABELS: Record<number, string> = {
  1: "😞 とても悪い",
  2: "😕 悪い",
  3: "😐 普通",
  4: "🙂 良い",
  5: "😊 とても良い",
};

function isInPeriod(isoDateTimeOrDate: string, fromDate: string, toDate: string): boolean {
  const ymd = isoDateTimeOrDate.length === 10
    ? isoDateTimeOrDate
    : toTokyoYmd(isoDateTimeOrDate);
  return ymd >= fromDate && ymd <= toDate;
}

// ── 統合投稿フォーマット ──────────────────────────────────

export function formatPosts(posts: Post[], habits: Habit[], period: ExportPeriod): string {
  const filtered = posts
    .filter((p) => isInPeriod(p.postedAt, period.fromDate, period.toDate))
    .sort((a, b) => a.postedAt.localeCompare(b.postedAt));

  if (filtered.length === 0) return "（この期間の投稿はありません）";

  const habitMap = new Map(habits.map((h) => [h.id, h.name]));

  return filtered.map((p) => {
    const lines: string[] = [];
    const mood = p.moodScore != null ? ` 気分: ${MOOD_LABELS[p.moodScore] ?? p.moodScore}` : "";
    lines.push(`【${formatDisplayDateTime(p.postedAt)}】${mood}`);
    if (p.whatText) lines.push(`何をしたか: ${p.whatText}`);
    if (p.resultText) lines.push(`結果・気づき: ${p.resultText}`);
    if (p.questionText) lines.push(`疑問と考察: ${p.questionText}`);
    if (p.habitTags.length > 0) {
      const names = p.habitTags.map((id) => habitMap.get(id) ?? id);
      lines.push(`習慣: ${names.join(", ")}`);
    }
    if (p.freeTags.length > 0) lines.push(`タグ: ${p.freeTags.join(", ")}`);
    return lines.join("\n");
  }).join("\n\n");
}

export function buildPostsExportText(params: {
  period: ExportPeriod;
  posts: Post[];
  habits: Habit[];
}): string {
  const { period, posts, habits } = params;
  const sections: string[] = [];

  sections.push(`## 自己観察データ（${period.fromDate} 〜 ${period.toDate}）`);
  sections.push(formatPosts(posts, habits, period));
  sections.push(
    `---\n以上のデータをもとに、以下の観点で分析してください。\n` +
    `1. この期間の行動・感情パターンの傾向\n` +
    `2. 繰り返しているポジティブな行動や思考\n` +
    `3. 繰り返しているネガティブな行動や思考\n` +
    `4. 改善できそうな具体的な行動提案\n` +
    `5. 来週に向けてのアドバイス`
  );

  return sections.join("\n\n");
}


// ── ステップ4：習慣記録 ──────────────────────────────────────

export function formatHabitLogs(
  habits: Habit[],
  logs: HabitStartLog[],
  period: ExportPeriod
): string {
  const filtered = logs.filter((l) => isInPeriod(l.startedAt, period.fromDate, period.toDate));

  if (filtered.length === 0) return "（この期間の習慣記録はありません）";

  const habitMap = new Map(habits.map((h) => [h.id, h]));
  const grouped = new Map<string, HabitStartLog[]>();
  for (const log of filtered) {
    const list = grouped.get(log.habitId) ?? [];
    list.push(log);
    grouped.set(log.habitId, list);
  }

  const lines: string[] = [];
  for (const [habitId, habitLogs] of grouped.entries()) {
    const habit = habitMap.get(habitId);
    const name = habit?.name ?? `習慣 (${habitId.slice(0, 8)})`;
    const target = habit?.targetStartTime ? ` (目標: ${habit.targetStartTime})` : "";
    lines.push(`■ ${name}${target}`);
    for (const log of habitLogs.sort((a, b) => a.startedAt.localeCompare(b.startedAt))) {
      const note = log.note ? ` — ${log.note}` : "";
      lines.push(`  ${toTokyoYmd(log.startedAt)} ${toTokyoHHmm(log.startedAt)}${note}`);
    }
  }

  return lines.join("\n");
}

// ── 個別エクスポート：習慣記録 ───────────────────────────────

export function buildHabitExportText(params: {
  period: ExportPeriod;
  habits: Habit[];
  habitLogs: HabitStartLog[];
}): string {
  const { period, habits, habitLogs } = params;
  const sections: string[] = [];

  sections.push(`## 習慣記録（${period.fromDate} 〜 ${period.toDate}）`);
  sections.push(formatHabitLogs(habits, habitLogs, period));

  return sections.join("\n\n");
}

