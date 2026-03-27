import type {
  CreateHabitInput,
  CreatePostInput,
  Post,
  Habit,
  HabitStartLog,
  UpdateHabitInput,
  UpdatePostInput,
} from "@/lib/types";
import {
  validatePostInput,
  validatePostPatch,
} from "@/lib/validation";


// ─── キー定義 ─────────────────────────────────────────────
const KEYS = {
  currentUserId: "sia:current_user_id",
  posts: "sia:posts",
  habits: "sia:habits",
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
  const c = globalThis.crypto as Crypto | undefined;

  if (c?.randomUUID) {
    return c.randomUUID();
  }

  if (c?.getRandomValues) {
    // RFC4122 v4 fallback
    const bytes = c.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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


function readAllHabits(): Habit[] {
  return load<Habit>(KEYS.habits).map((habit, index) =>
    withUserId({
      ...habit,
      sortOrder: typeof habit.sortOrder === "number" ? habit.sortOrder : index,
    })
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

// ─── 統合投稿 ──────────────────────────────────────────────

function readAllPosts(): Post[] {
  return load<Post>(KEYS.posts).map((post) => withUserId(post));
}

export function getPosts(): Post[] {
  return filterByCurrentUser(readAllPosts()).sort((left, right) =>
    byIsoDateDesc(left, right, "postedAt")
  );
}

export function addPost(draft: CreatePostInput): Post {
  const validatedDraft = validatePostInput(draft);

  const allPosts = readAllPosts();
  const posts = filterByCurrentUser(allPosts);
  const record: Post = {
    ...validatedDraft,
    id: newId(),
    userId: getCurrentUserId(),
    createdAt: now(),
    updatedAt: now(),
  };
  save(KEYS.posts, replaceCurrentUserRecords(allPosts, [record, ...posts]));
  return record;
}

export function updatePost(id: string, patch: UpdatePostInput): void {
  const validatedPatch = validatePostPatch(patch);

  const allPosts = readAllPosts();
  const posts = filterByCurrentUser(allPosts).map((p) =>
    p.id === id && p.userId === getCurrentUserId()
      ? { ...p, ...validatedPatch, updatedAt: now() }
      : p
  );
  save(KEYS.posts, replaceCurrentUserRecords(allPosts, posts));
}

export function deletePost(id: string): void {
  const allPosts = readAllPosts();
  const posts = filterByCurrentUser(allPosts).filter((p) => p.id !== id);
  save(KEYS.posts, replaceCurrentUserRecords(allPosts, posts));
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

export function deleteHabit(id: string): void {
  const allHabits = readAllHabits();
  const habits = filterByCurrentUser(allHabits).filter((h) => h.id !== id);
  save(KEYS.habits, replaceCurrentUserRecords(allHabits, habits));
}

// ─── 習慣開始記録 ──────────────────────────────────────────
export function getHabitStartLogs(): HabitStartLog[] {
  const posts = getPosts();
  const logs: HabitStartLog[] = [];
  for (const post of posts) {
    for (const habitId of post.habitTags) {
      logs.push({
        id: `${post.id}:${habitId}`,
        userId: post.userId,
        habitId,
        startedAt: post.postedAt,
        note: post.whatText ?? null,
        createdAt: post.createdAt,
      });
    }
  }
  return logs.sort((a, b) => byIsoDateDesc(a, b, "startedAt"));
}

