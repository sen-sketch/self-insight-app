import type { TimelinePost, Habit, HabitStartLog, LuckRecord, MetaDiary } from "@/lib/types";
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

// ── ステップ3：タイムライン ──────────────────────────────────

export function formatTimelinePosts(posts: TimelinePost[], period: ExportPeriod): string {
  const filtered = posts
    .filter((p) => isInPeriod(p.postedAt, period.fromDate, period.toDate))
    .sort((a, b) => a.postedAt.localeCompare(b.postedAt));

  if (filtered.length === 0) return "（この期間の投稿はありません）";

  return filtered.map((p) => {
    const lines = [
      `【${formatDisplayDateTime(p.postedAt)}】気分: ${MOOD_LABELS[p.moodScore] ?? p.moodScore}`,
      p.content,
    ];
    if (p.tags.length > 0) lines.push(`タグ: ${p.tags.join(", ")}`);
    return lines.join("\n");
  }).join("\n\n");
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

// ── ステップ5：運記録 ────────────────────────────────────────

export function formatLuckRecords(records: LuckRecord[], period: ExportPeriod): string {
  const filtered = records
    .filter((r) => isInPeriod(r.recordedAt, period.fromDate, period.toDate))
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));

  if (filtered.length === 0) return "（この期間の運記録はありません）";

  return filtered.map((r) => {
    const lines = [
      `【${formatDisplayDateTime(r.recordedAt)}】`,
      `チャレンジ: ${r.challengeText}`,
      `感情: ${r.emotionText}`,
    ];
    if (r.insightText) lines.push(`洞察: ${r.insightText}`);
    if (r.nextActionText) lines.push(`次のアクション: ${r.nextActionText}`);
    return lines.join("\n");
  }).join("\n\n");
}

// ── ステップ6：メタ認知日記 ──────────────────────────────────

export function formatMetaDiaries(diaries: MetaDiary[], period: ExportPeriod): string {
  const filtered = diaries
    .filter((d) => isInPeriod(d.diaryDate, period.fromDate, period.toDate))
    .sort((a, b) => a.diaryDate.localeCompare(b.diaryDate));

  if (filtered.length === 0) return "（この期間の日記はありません）";

  return filtered.map((d) => {
    const lines = [
      `【${d.diaryDate}】`,
      `目標: ${d.goalText}`,
      `やったこと: ${d.actualText}`,
    ];
    if (d.blockedPointsText) lines.push(`詰まったこと: ${d.blockedPointsText}`);
    lines.push(`明日の予定: ${d.tomorrowPlanText}`);
    return lines.join("\n");
  }).join("\n\n");
}

// ── ステップ7：統合テキスト生成 ──────────────────────────────

export function buildExportText(params: {
  period: ExportPeriod;
  targets: ExportTargets;
  timelinePosts: TimelinePost[];
  habits: Habit[];
  habitLogs: HabitStartLog[];
  luckRecords: LuckRecord[];
  metaDiaries: MetaDiary[];
}): string {
  const { period, targets, timelinePosts, habits, habitLogs, luckRecords, metaDiaries } = params;
  const sections: string[] = [];

  sections.push(`## 自己観察データ（${period.fromDate} 〜 ${period.toDate}）`);

  if (targets.timeline) {
    sections.push(`### タイムライン投稿\n${formatTimelinePosts(timelinePosts, period)}`);
  }
  if (targets.habit) {
    sections.push(`### 習慣記録\n${formatHabitLogs(habits, habitLogs, period)}`);
  }
  if (targets.luck) {
    sections.push(`### 運を上げる記録\n${formatLuckRecords(luckRecords, period)}`);
  }
  if (targets.metaDiary) {
    sections.push(`### メタ認知日記\n${formatMetaDiaries(metaDiaries, period)}`);
  }

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
