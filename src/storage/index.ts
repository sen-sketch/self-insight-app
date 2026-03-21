import type {
  TimelinePost,
  Habit,
  HabitStartLog,
  LuckRecord,
  MetaDiary,
} from "@/lib/types";

// ─── キー定義 ─────────────────────────────────────────────

const KEYS = {
  timelinePosts: "sia:timeline_posts",
  habits: "sia:habits",
  habitStartLogs: "sia:habit_start_logs",
  luckRecords: "sia:luck_records",
  metaDiaries: "sia:meta_diaries",
} as const;

// ─── 内部ユーティリティ ───────────────────────────────────

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function newId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ─── タイムライン投稿 ─────────────────────────────────────

export function getTimelinePosts(): TimelinePost[] {
  return load<TimelinePost>(KEYS.timelinePosts);
}

export function addTimelinePost(
  draft: Omit<TimelinePost, "id" | "createdAt" | "updatedAt">
): TimelinePost {
  const posts = getTimelinePosts();
  const record: TimelinePost = {
    ...draft,
    id: newId(),
    createdAt: now(),
    updatedAt: now(),
  };
  save(KEYS.timelinePosts, [record, ...posts]);
  return record;
}

export function updateTimelinePost(
  id: string,
  patch: Partial<Omit<TimelinePost, "id" | "createdAt">>
): void {
  const posts = getTimelinePosts().map((p) =>
    p.id === id ? { ...p, ...patch, updatedAt: now() } : p
  );
  save(KEYS.timelinePosts, posts);
}

export function deleteTimelinePost(id: string): void {
  save(KEYS.timelinePosts, getTimelinePosts().filter((p) => p.id !== id));
}

// ─── 習慣タスク ────────────────────────────────────────────

export function getHabits(): Habit[] {
  return load<Habit>(KEYS.habits);
}

export function addHabit(
  draft: Omit<Habit, "id" | "createdAt" | "updatedAt">
): Habit {
  const habits = getHabits();
  const record: Habit = {
    ...draft,
    id: newId(),
    createdAt: now(),
    updatedAt: now(),
  };
  save(KEYS.habits, [...habits, record]);
  return record;
}

export function updateHabit(
  id: string,
  patch: Partial<Omit<Habit, "id" | "createdAt">>
): void {
  const habits = getHabits().map((h) =>
    h.id === id ? { ...h, ...patch, updatedAt: now() } : h
  );
  save(KEYS.habits, habits);
}

// ─── 習慣開始記録 ──────────────────────────────────────────

export function getHabitStartLogs(): HabitStartLog[] {
  return load<HabitStartLog>(KEYS.habitStartLogs);
}

export function addHabitStartLog(
  draft: Omit<HabitStartLog, "id" | "createdAt">
): HabitStartLog {
  const logs = getHabitStartLogs();
  const record: HabitStartLog = {
    ...draft,
    id: newId(),
    createdAt: now(),
  };
  save(KEYS.habitStartLogs, [record, ...logs]);
  return record;
}

// ─── 運を上げる記録 ────────────────────────────────────────

export function getLuckRecords(): LuckRecord[] {
  return load<LuckRecord>(KEYS.luckRecords);
}

export function addLuckRecord(
  draft: Omit<LuckRecord, "id" | "createdAt" | "updatedAt">
): LuckRecord {
  const records = getLuckRecords();
  const record: LuckRecord = {
    ...draft,
    id: newId(),
    createdAt: now(),
    updatedAt: now(),
  };
  save(KEYS.luckRecords, [record, ...records]);
  return record;
}

export function updateLuckRecord(
  id: string,
  patch: Partial<Omit<LuckRecord, "id" | "createdAt">>
): void {
  const records = getLuckRecords().map((r) =>
    r.id === id ? { ...r, ...patch, updatedAt: now() } : r
  );
  save(KEYS.luckRecords, records);
}

export function deleteLuckRecord(id: string): void {
  save(KEYS.luckRecords, getLuckRecords().filter((r) => r.id !== id));
}

// ─── メタ認知日記 ──────────────────────────────────────────

export function getMetaDiaries(): MetaDiary[] {
  return load<MetaDiary>(KEYS.metaDiaries);
}

/** diaryDate が同じ日記があれば返す */
export function getMetaDiaryByDate(diaryDate: string): MetaDiary | null {
  return getMetaDiaries().find((d) => d.diaryDate === diaryDate) ?? null;
}

/** 当日分がなければ作成、あれば更新（upsert） */
export function upsertMetaDiary(
  diaryDate: string,
  patch: Omit<MetaDiary, "id" | "diaryDate" | "createdAt" | "updatedAt">
): MetaDiary {
  const existing = getMetaDiaryByDate(diaryDate);
  if (existing) {
    const updated: MetaDiary = { ...existing, ...patch, updatedAt: now() };
    save(
      KEYS.metaDiaries,
      getMetaDiaries().map((d) => (d.id === existing.id ? updated : d))
    );
    return updated;
  }
  const record: MetaDiary = {
    ...patch,
    id: newId(),
    diaryDate,
    createdAt: now(),
    updatedAt: now(),
  };
  save(KEYS.metaDiaries, [record, ...getMetaDiaries()]);
  return record;
}

export function deleteMetaDiary(id: string): void {
  save(KEYS.metaDiaries, getMetaDiaries().filter((d) => d.id !== id));
}
