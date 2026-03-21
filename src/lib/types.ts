// ─── 共通 ───────────────────────────────────────────────

/** 気分スコア 1-5 */
export type MoodScore = 1 | 2 | 3 | 4 | 5;

// ─── タイムライン投稿 ─────────────────────────────────────

export type TimelinePost = {
  id: string;           // UUID
  postedAt: string;     // ISO 8601 (timestamptz)
  moodScore: MoodScore;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

// ─── 習慣タスク ────────────────────────────────────────────

export type Habit = {
  id: string;
  name: string;
  targetStartTime: string | null; // "HH:MM" 形式 or null
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// ─── 習慣開始記録 ──────────────────────────────────────────

export type HabitStartLog = {
  id: string;
  habitId: string;
  startedAt: string;    // ISO 8601 (timestamptz)
  note: string | null;
  createdAt: string;
};

// ─── 運を上げる記録 ────────────────────────────────────────

export type LuckRecord = {
  id: string;
  recordedAt: string;   // ISO 8601 (timestamptz)
  challengeText: string;
  emotionText: string;
  insightText: string | null;
  nextActionText: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── メタ認知日記 ──────────────────────────────────────────

export type MetaDiary = {
  id: string;
  diaryDate: string;    // "YYYY-MM-DD" 形式
  goalText: string;
  actualText: string;
  blockedPointsText: string | null;
  tomorrowPlanText: string;
  createdAt: string;
  updatedAt: string;
};
