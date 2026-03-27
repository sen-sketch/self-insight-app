// ─── 共通 ───────────────────────────────────────────────

export type UUID = string;
export type IsoDateTimeString = string;
export type IsoDateString = string;
export type TimeString = string;

/** 気分スコア 1-5 */
export type MoodScore = 1 | 2 | 3 | 4 | 5;

export type UserScoped = {
  userId: UUID;
};

export type CreatedMeta = {
  createdAt: IsoDateTimeString;
};

export type UpdatedMeta = {
  updatedAt: IsoDateTimeString;
};

export type Timestamped = CreatedMeta & UpdatedMeta;


// ─── 習慣タスク ────────────────────────────────────────────

export type Habit = UserScoped &
  Timestamped & {
    id: UUID;
    name: string;
    targetStartTime: TimeString | null;
    isActive: boolean;
    sortOrder: number;
  };

export type CreateHabitInput = {
  name: string;
  targetStartTime: TimeString | null;
  isActive: boolean;
};

export type UpdateHabitInput = Partial<CreateHabitInput>;

// ─── 習慣開始記録 ──────────────────────────────────────────

export type HabitStartLog = UserScoped &
  CreatedMeta & {
    id: UUID;
    habitId: UUID;
    startedAt: IsoDateTimeString;
    note: string | null;
  };


// ─── 統合投稿 ──────────────────────────────────────────────

export type Post = UserScoped &
  Timestamped & {
    id: UUID;
    postedAt: IsoDateTimeString;
    moodScore: MoodScore | null;
    whatText: string | null;
    resultText: string | null;
    questionText: string | null;
    habitTags: UUID[];   // Habit.id の配列
    freeTags: string[];
  };

export type CreatePostInput = {
  postedAt: IsoDateTimeString;
  moodScore: MoodScore | null;
  whatText: string | null;
  resultText: string | null;
  questionText: string | null;
  habitTags: UUID[];
  freeTags: string[];
};

export type UpdatePostInput = Partial<CreatePostInput>;
