import type {
  Post,
  TimelinePost,
  LuckRecord,
  MetaDiary,
  HabitStartLog,
} from "@/lib/types";

// ─── キー定義 ─────────────────────────────────────────────

const MIGRATION_FLAG_KEY = "sia:migrated_v2";
const POSTS_KEY = "sia:posts";
const TIMELINE_KEY = "sia:timeline_posts";
const LUCK_KEY = "sia:luck_records";
const META_KEY = "sia:meta_diaries";
const HABIT_LOG_KEY = "sia:habit_start_logs";

// ─── 内部ユーティリティ ───────────────────────────────────

function loadRaw<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

// ─── 変換関数 ─────────────────────────────────────────────

function convertTimelinePost(p: TimelinePost): Post {
  return {
    id: p.id,
    userId: p.userId,
    postedAt: p.postedAt,
    moodScore: p.moodScore,
    whatText: p.content || null,
    resultText: null,
    questionText: null,
    habitTags: [],
    freeTags: p.tags,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function convertLuckRecord(r: LuckRecord): Post {
  return {
    id: r.id,
    userId: r.userId,
    postedAt: r.recordedAt,
    moodScore: null,
    whatText: r.challengeText || null,
    resultText: r.emotionText || null,
    questionText: r.insightText,
    habitTags: [],
    freeTags: [],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function convertMetaDiary(d: MetaDiary): Post {
  const parts = [d.goalText, d.actualText].filter(Boolean);
  const whatText = parts.length > 0 ? parts.join("\n") : null;

  return {
    id: d.id,
    userId: d.userId,
    // diaryDate は日付のみなので createdAt（実際の記録時刻）を使用
    postedAt: d.createdAt,
    moodScore: null,
    whatText,
    resultText: null,
    questionText: d.tomorrowPlanText || null,
    habitTags: [],
    freeTags: [],
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

function convertHabitStartLog(l: HabitStartLog): Post {
  return {
    id: l.id,
    userId: l.userId,
    postedAt: l.startedAt,
    moodScore: null,
    whatText: l.note ?? null,
    resultText: null,
    questionText: null,
    habitTags: [l.habitId],
    freeTags: [],
    createdAt: l.createdAt,
    // HabitStartLog は updatedAt を持たないため createdAt で代替
    updatedAt: l.createdAt,
  };
}

// ─── マイグレーション本体 ─────────────────────────────────

/**
 * アプリ初回起動時に一度だけ旧データを Post 形式へ移行する。
 * `sia:migrated_v2` フラグが存在する場合はスキップ。
 * 旧キーのデータはバックアップとして保持する。
 */
export function runMigrationIfNeeded(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATION_FLAG_KEY)) return;

  const existingPosts = loadRaw<Post>(POSTS_KEY);
  const existingIds = new Set(existingPosts.map((p) => p.id));

  const migrated: Post[] = [];

  for (const p of loadRaw<TimelinePost>(TIMELINE_KEY)) {
    const converted = convertTimelinePost(p);
    if (!existingIds.has(converted.id)) {
      migrated.push(converted);
    }
  }

  for (const r of loadRaw<LuckRecord>(LUCK_KEY)) {
    const converted = convertLuckRecord(r);
    if (!existingIds.has(converted.id)) {
      migrated.push(converted);
    }
  }

  for (const d of loadRaw<MetaDiary>(META_KEY)) {
    const converted = convertMetaDiary(d);
    if (!existingIds.has(converted.id)) {
      migrated.push(converted);
    }
  }

  for (const l of loadRaw<HabitStartLog>(HABIT_LOG_KEY)) {
    const converted = convertHabitStartLog(l);
    if (!existingIds.has(converted.id)) {
      migrated.push(converted);
    }
  }

  const merged = [...existingPosts, ...migrated];
  localStorage.setItem(POSTS_KEY, JSON.stringify(merged));
  localStorage.setItem(MIGRATION_FLAG_KEY, new Date().toISOString());
}
