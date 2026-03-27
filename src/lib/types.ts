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

// ─── タイムライン投稿 ─────────────────────────────────────

export type TimelinePost = UserScoped &
  Timestamped & {
    id: UUID;
    postedAt: IsoDateTimeString;
    moodScore: MoodScore;
    content: string;
    tags: string[];
  };

export type CreateTimelinePostInput = {
  postedAt: IsoDateTimeString;
  moodScore: MoodScore;
  content: string;
  tags: string[];
};

export type UpdateTimelinePostInput = Partial<CreateTimelinePostInput>;

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

export type CreateHabitStartLogInput = {
  habitId: UUID;
  startedAt: IsoDateTimeString;
  note: string | null;
};

// ─── 運を上げる記録 ────────────────────────────────────────

export type LuckRecord = UserScoped &
  Timestamped & {
    id: UUID;
    recordedAt: IsoDateTimeString;
    challengeText: string;
    emotionText: string;
    insightText: string | null;
    nextActionText: string | null;
  };

export type CreateLuckRecordInput = {
  recordedAt: IsoDateTimeString;
  challengeText: string;
  emotionText: string;
  insightText: string | null;
  nextActionText: string | null;
};

export type UpdateLuckRecordInput = Partial<CreateLuckRecordInput>;

// ─── メタ認知日記 ──────────────────────────────────────────

export type MetaDiary = UserScoped &
  Timestamped & {
    id: UUID;
    diaryDate: IsoDateString;
    goalText: string;
    actualText: string;
    blockedPointsText: string | null;
    tomorrowPlanText: string;
  };

export type UpsertMetaDiaryInput = {
  goalText: string;
  actualText: string;
  blockedPointsText: string | null;
  tomorrowPlanText: string;
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
