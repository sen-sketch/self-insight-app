import type {
  CreateHabitInput,
  CreateHabitStartLogInput,
  CreateLuckRecordInput,
  CreateTimelinePostInput,
  TimelinePost,
  Habit,
  HabitStartLog,
  LuckRecord,
  MetaDiary,
  UpsertMetaDiaryInput,
  UpdateHabitInput,
  UpdateLuckRecordInput,
  UpdateTimelinePostInput,
} from "@/lib/types";

// ─── キー定義 ─────────────────────────────────────────────

const KEYS = {
  currentUserId: "sia:current_user_id",
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

function getCurrentUserId(): string {
  if (typeof window === "undefined") {
    return "00000000-0000-4000-8000-000000000001";
  }

  const existing = localStorage.getItem(KEYS.currentUserId);
  if (existing) return existing;

  const userId = "00000000-0000-4000-8000-000000000001";
  localStorage.setItem(KEYS.currentUserId, userId);
  return userId;
}

function assertNonEmptyString(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${fieldName} must not be empty`);
  }
}

  function assertIsoDateString(value: string, fieldName: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(`${fieldName} must be in YYYY-MM-DD format`);
    }
  }

function assertMoodScore(value: number): void {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("moodScore must be an integer between 1 and 5");
  }
}

function assertTags(tags: string[]): void {
  if (tags.some((tag) => tag.trim().length === 0)) {
    throw new Error("tags must not contain empty values");
  }

  const normalizedTags = tags.map((tag) => tag.trim());
  if (new Set(normalizedTags).size !== normalizedTags.length) {
    throw new Error("tags must not contain duplicate values");
  }
}

function withUserId<T extends { userId?: string }>(record: T): T & { userId: string } {
  return {
    ...record,
    userId: record.userId ?? getCurrentUserId(),
  };
}

function byIsoDateDesc<T>(
  left: T,
  right: T,
  field: keyof T
): number {
  return String(right[field]).localeCompare(String(left[field]));
}

function readAllTimelinePosts(): TimelinePost[] {
  return load<TimelinePost>(KEYS.timelinePosts).map((post) => withUserId(post));
}

function readAllHabits(): Habit[] {
  return load<Habit>(KEYS.habits).map((habit, index) =>
    withUserId({
      ...habit,
      sortOrder: typeof habit.sortOrder === "number" ? habit.sortOrder : index,
    })
  );
}


function readAllHabitStartLogs(): HabitStartLog[] {
  return load<HabitStartLog>(KEYS.habitStartLogs).map((log) => withUserId(log));
}

function readAllLuckRecords(): LuckRecord[] {
  return load<LuckRecord>(KEYS.luckRecords).map((record) => withUserId(record));
}

function readAllMetaDiaries(): MetaDiary[] {
  return load<MetaDiary>(KEYS.metaDiaries).map((diary) => withUserId(diary));
}

function getMetaDiariesByDate(diaryDate: string): MetaDiary[] {
  const currentUserId = getCurrentUserId();
  return readAllMetaDiaries().filter(
    (d) => d.userId === currentUserId && d.diaryDate === diaryDate
  );
}

function filterByCurrentUser<T extends { userId: string }>(records: T[]): T[] {
  const currentUserId = getCurrentUserId();
  return records.filter((record) => record.userId === currentUserId);
}

function replaceCurrentUserRecords<T extends { id: string; userId: string }>(
  allRecords: T[],
  currentUserRecords: T[]
): T[] {
  const currentUserId = getCurrentUserId();
  const otherUsersRecords = allRecords.filter(
    (record) => record.userId !== currentUserId
  );
  return [...otherUsersRecords, ...currentUserRecords];
}

// ─── タイムライン投稿 ─────────────────────────────────────

export function getTimelinePosts(): TimelinePost[] {
  return filterByCurrentUser(readAllTimelinePosts()).sort((left, right) =>
    byIsoDateDesc(left, right, "postedAt")
  );
}

export function addTimelinePost(
  draft: CreateTimelinePostInput
): TimelinePost {
  assertNonEmptyString(draft.content, "content");
  assertMoodScore(draft.moodScore);
  assertTags(draft.tags);

  const allPosts = readAllTimelinePosts();
  const posts = filterByCurrentUser(allPosts);
  const record: TimelinePost = {
    ...draft,
    id: newId(),
    userId: getCurrentUserId(),
    createdAt: now(),
    updatedAt: now(),
  };
  save(
    KEYS.timelinePosts,
    replaceCurrentUserRecords(allPosts, [record, ...posts])
  );
  return record;
}

export function updateTimelinePost(
  id: string,
  patch: UpdateTimelinePostInput
): void {
  if (patch.content !== undefined) {
    assertNonEmptyString(patch.content, "content");
  }
  if (patch.moodScore !== undefined) {
    assertMoodScore(patch.moodScore);
  }
  if (patch.tags !== undefined) {
    assertTags(patch.tags);
  }

  const allPosts = readAllTimelinePosts();
  const posts = filterByCurrentUser(allPosts).map((p) =>
    p.id === id && p.userId === getCurrentUserId()
      ? { ...p, ...patch, updatedAt: now() }
      : p
  );
  save(KEYS.timelinePosts, replaceCurrentUserRecords(allPosts, posts));
}

export function deleteTimelinePost(id: string): void {
  const allPosts = readAllTimelinePosts();
  const posts = filterByCurrentUser(allPosts).filter((p) => p.id !== id);
  save(KEYS.timelinePosts, replaceCurrentUserRecords(allPosts, posts));
}

// ─── 習慣タスク ────────────────────────────────────────────

export function getHabits(): Habit[] {
  return filterByCurrentUser(readAllHabits()).sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }
    return left.sortOrder - right.sortOrder;
  });
}

export function addHabit(
  draft: CreateHabitInput
): Habit {
  const allHabits = readAllHabits();
  const habits = filterByCurrentUser(allHabits);
  const activeHabits = habits.filter((habit) => habit.isActive);

  const record: Habit = {
    ...draft,
    id: newId(),
    userId: getCurrentUserId(),
    createdAt: now(),
    updatedAt: now(),
    sortOrder: draft.isActive ? activeHabits.length : habits.length,
  };
  save(KEYS.habits, replaceCurrentUserRecords(allHabits, [...habits, record]));
  return record;
}

export function updateHabit(
  id: string,
  patch: UpdateHabitInput
): void {
  const allHabits = readAllHabits();
  const currentUserId = getCurrentUserId();
  const habits = filterByCurrentUser(allHabits);
  const target = habits.find((habit) => habit.id === id && habit.userId === currentUserId);

  if (!target) {
    return;
  }

  const nextIsActive = patch.isActive ?? target.isActive;
  const updatedAt = now();

  if (nextIsActive === target.isActive) {
    const updatedHabits = habits.map((habit) =>
      habit.id === id && habit.userId === currentUserId
        ? { ...habit, ...patch, updatedAt }
        : habit
    );
    save(KEYS.habits, replaceCurrentUserRecords(allHabits, updatedHabits));
    return;
  }

  if (nextIsActive) {
    const nextSortOrder = habits.filter((habit) => habit.isActive).length;

    const updatedHabits = habits.map((habit) =>
      habit.id === id && habit.userId === currentUserId
        ? {
            ...habit,
            ...patch,
            isActive: true,
            sortOrder: nextSortOrder,
            updatedAt,
          }
        : habit
    );

    save(KEYS.habits, replaceCurrentUserRecords(allHabits, updatedHabits));
    return;
  }

  const reorderedActiveHabits = habits
    .filter((habit) => habit.isActive && habit.id !== id)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((habit, index) => ({
      ...habit,
      sortOrder: index,
    }));

  const updatedHabits = habits.map((habit) => {
    if (habit.id === id && habit.userId === currentUserId) {
      return {
        ...habit,
        ...patch,
        isActive: false,
        updatedAt,
      };
    }

    const reordered = reorderedActiveHabits.find((activeHabit) => activeHabit.id === habit.id);
    return reordered ?? habit;
  });

  save(KEYS.habits, replaceCurrentUserRecords(allHabits, updatedHabits));
}


export function reorderActiveHabits(habitIdsInOrder: string[]): void {
  const allHabits = readAllHabits();
  const currentUserId = getCurrentUserId();
  const orderMap = new Map(habitIdsInOrder.map((id, index) => [id, index]));

  const habits = filterByCurrentUser(allHabits).map((habit) => {
    if (habit.userId !== currentUserId || !habit.isActive) {
      return habit;
    }

    const nextOrder = orderMap.get(habit.id);
    if (nextOrder === undefined) {
      return habit;
    }

    return {
      ...habit,
      sortOrder: nextOrder,
      updatedAt: now(),
    };
  });

  save(KEYS.habits, replaceCurrentUserRecords(allHabits, habits));
}


// ─── 習慣開始記録 ──────────────────────────────────────────

export function getHabitStartLogs(): HabitStartLog[] {
  return filterByCurrentUser(readAllHabitStartLogs()).sort((left, right) =>
    byIsoDateDesc(left, right, "startedAt")
  );
}

export function addHabitStartLog(
  draft: CreateHabitStartLogInput
): HabitStartLog {
  const allLogs = readAllHabitStartLogs();
  const logs = filterByCurrentUser(allLogs);
  const record: HabitStartLog = {
    ...draft,
    id: newId(),
    userId: getCurrentUserId(),
    createdAt: now(),
  };
  save(KEYS.habitStartLogs, replaceCurrentUserRecords(allLogs, [record, ...logs]));
  return record;
}

// ─── 運を上げる記録 ────────────────────────────────────────

export function getLuckRecords(): LuckRecord[] {
  return filterByCurrentUser(readAllLuckRecords()).sort((left, right) =>
    byIsoDateDesc(left, right, "recordedAt")
  );
}

export function addLuckRecord(
  draft: CreateLuckRecordInput
): LuckRecord {
  assertNonEmptyString(draft.challengeText, "challengeText");
  assertNonEmptyString(draft.emotionText, "emotionText");

  const allRecords = readAllLuckRecords();
  const records = filterByCurrentUser(allRecords);
  const record: LuckRecord = {
    ...draft,
    id: newId(),
    userId: getCurrentUserId(),
    createdAt: now(),
    updatedAt: now(),
  };
  save(
    KEYS.luckRecords,
    replaceCurrentUserRecords(allRecords, [record, ...records])
  );
  return record;
}

export function updateLuckRecord(
  id: string,
  patch: UpdateLuckRecordInput
): void {
  if (patch.challengeText !== undefined) {
    assertNonEmptyString(patch.challengeText, "challengeText");
  }
  if (patch.emotionText !== undefined) {
    assertNonEmptyString(patch.emotionText, "emotionText");
  }

  const allRecords = readAllLuckRecords();
  const records = filterByCurrentUser(allRecords).map((r) =>
    r.id === id && r.userId === getCurrentUserId()
      ? { ...r, ...patch, updatedAt: now() }
      : r
  );
  save(KEYS.luckRecords, replaceCurrentUserRecords(allRecords, records));
}

export function deleteLuckRecord(id: string): void {
  const allRecords = readAllLuckRecords();
  const records = filterByCurrentUser(allRecords).filter((r) => r.id !== id);
  save(KEYS.luckRecords, replaceCurrentUserRecords(allRecords, records));
}

// ─── メタ認知日記 ──────────────────────────────────────────

export function getMetaDiaries(): MetaDiary[] {
  return filterByCurrentUser(readAllMetaDiaries()).sort((left, right) =>
    byIsoDateDesc(left, right, "diaryDate")
  );
}

/** diaryDate が同じ日記があれば返す */
export function getMetaDiaryByDate(diaryDate: string): MetaDiary | null {
  return getMetaDiariesByDate(diaryDate)[0] ?? null;
}



/** 当日分がなければ作成、あれば更新（upsert） */
export function upsertMetaDiary(
  diaryDate: string,
  patch: UpsertMetaDiaryInput
): MetaDiary {
  assertIsoDateString(diaryDate, "diaryDate");
  assertNonEmptyString(patch.goalText, "goalText");
  assertNonEmptyString(patch.actualText, "actualText");
  assertNonEmptyString(patch.tomorrowPlanText, "tomorrowPlanText");

  const allDiaries = readAllMetaDiaries();
  const currentUserDiaries = filterByCurrentUser(allDiaries);
  const sameDateDiaries = currentUserDiaries.filter((d) => d.diaryDate === diaryDate);

  if (sameDateDiaries.length > 0) {
    const base = sameDateDiaries[0];
    const updated: MetaDiary = {
      ...base,
      ...patch,
      diaryDate,
      updatedAt: now(),
    };

    const diaries = [
      updated,
      ...currentUserDiaries.filter((d) => d.diaryDate !== diaryDate),
    ];

    save(KEYS.metaDiaries, replaceCurrentUserRecords(allDiaries, diaries));
    return updated;
  }

  const record: MetaDiary = {
    ...patch,
    id: newId(),
    userId: getCurrentUserId(),
    diaryDate,
    createdAt: now(),
    updatedAt: now(),
  };

  save(KEYS.metaDiaries, replaceCurrentUserRecords(allDiaries, [record, ...currentUserDiaries]));
  return record;

}

export function deleteMetaDiary(id: string): void {
  const allDiaries = readAllMetaDiaries();
  const diaries = filterByCurrentUser(allDiaries).filter((d) => d.id !== id);
  save(KEYS.metaDiaries, replaceCurrentUserRecords(allDiaries, diaries));
}
