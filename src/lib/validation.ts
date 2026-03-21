import type {
  CreateLuckRecordInput,
  CreateTimelinePostInput,
  UpsertMetaDiaryInput,
  UpdateLuckRecordInput,
  UpdateTimelinePostInput,
} from "@/lib/types";

export class ValidationError extends Error {
  field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

export const VALIDATION_MESSAGES = {
  timelineContentRequired: "タイムライン本文は必須です",
  moodScoreInvalid: "気分スコアは1から5の整数で入力してください",
  tagsEmpty: "タグに空文字は使えません",
  luckChallengeRequired: "運を上げる行動は必須です",
  luckEmotionRequired: "そのときの感情は必須です",
  metaGoalRequired: "今日の目標は必須です",
  metaActualRequired: "今日やったことは必須です",
  metaTomorrowRequired: "明日の予定は必須です",
  diaryDateInvalid: "日記日付はYYYY-MM-DD形式で入力してください",
} as const;

export function assertNonEmptyString(
  value: string,
  fieldName: string,
  message = `${fieldName}は必須です`
): void {
  if (value.trim().length === 0) {
    throw new ValidationError(fieldName, message);
  }
}

export function assertIsoDateString(
  value: string,
  fieldName: string,
  message = VALIDATION_MESSAGES.diaryDateInvalid
): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ValidationError(fieldName, message);
  }
}

export function assertMoodScore(value: number): void {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new ValidationError("moodScore", VALIDATION_MESSAGES.moodScoreInvalid);
  }
}

export function normalizeTags(tags: string[]): string[] {
  const trimmedTags = tags.map((tag) => tag.trim());

  if (trimmedTags.some((tag) => tag.length === 0)) {
    throw new ValidationError("tags", VALIDATION_MESSAGES.tagsEmpty);
  }

  return [...new Set(trimmedTags)];
}

export function validateTimelinePostInput(
  input: CreateTimelinePostInput
): CreateTimelinePostInput {
  assertNonEmptyString(
    input.content,
    "content",
    VALIDATION_MESSAGES.timelineContentRequired
  );
  assertMoodScore(input.moodScore);

  return {
    ...input,
    content: input.content.trim(),
    tags: normalizeTags(input.tags),
  };
}

export function validateTimelinePostPatch(
  patch: UpdateTimelinePostInput
): UpdateTimelinePostInput {
  const nextPatch = { ...patch };

  if (nextPatch.content !== undefined) {
    assertNonEmptyString(
      nextPatch.content,
      "content",
      VALIDATION_MESSAGES.timelineContentRequired
    );
    nextPatch.content = nextPatch.content.trim();
  }

  if (nextPatch.moodScore !== undefined) {
    assertMoodScore(nextPatch.moodScore);
  }

  if (nextPatch.tags !== undefined) {
    nextPatch.tags = normalizeTags(nextPatch.tags);
  }

  return nextPatch;
}

export function validateLuckRecordInput(
  input: CreateLuckRecordInput
): CreateLuckRecordInput {
  assertNonEmptyString(
    input.challengeText,
    "challengeText",
    VALIDATION_MESSAGES.luckChallengeRequired
  );
  assertNonEmptyString(
    input.emotionText,
    "emotionText",
    VALIDATION_MESSAGES.luckEmotionRequired
  );

  return {
    ...input,
    challengeText: input.challengeText.trim(),
    emotionText: input.emotionText.trim(),
    insightText: input.insightText?.trim() || null,
    nextActionText: input.nextActionText?.trim() || null,
  };
}

export function validateLuckRecordPatch(
  patch: UpdateLuckRecordInput
): UpdateLuckRecordInput {
  const nextPatch = { ...patch };

  if (nextPatch.challengeText !== undefined) {
    assertNonEmptyString(
      nextPatch.challengeText,
      "challengeText",
      VALIDATION_MESSAGES.luckChallengeRequired
    );
    nextPatch.challengeText = nextPatch.challengeText.trim();
  }

  if (nextPatch.emotionText !== undefined) {
    assertNonEmptyString(
      nextPatch.emotionText,
      "emotionText",
      VALIDATION_MESSAGES.luckEmotionRequired
    );
    nextPatch.emotionText = nextPatch.emotionText.trim();
  }

  if (nextPatch.insightText !== undefined) {
    nextPatch.insightText = nextPatch.insightText?.trim() || null;
  }

  if (nextPatch.nextActionText !== undefined) {
    nextPatch.nextActionText = nextPatch.nextActionText?.trim() || null;
  }

  return nextPatch;
}

export function validateMetaDiaryInput(
  diaryDate: string,
  input: UpsertMetaDiaryInput
): UpsertMetaDiaryInput {
  assertIsoDateString(diaryDate, "diaryDate");
  assertNonEmptyString(
    input.goalText,
    "goalText",
    VALIDATION_MESSAGES.metaGoalRequired
  );
  assertNonEmptyString(
    input.actualText,
    "actualText",
    VALIDATION_MESSAGES.metaActualRequired
  );
  assertNonEmptyString(
    input.tomorrowPlanText,
    "tomorrowPlanText",
    VALIDATION_MESSAGES.metaTomorrowRequired
  );

  return {
    ...input,
    goalText: input.goalText.trim(),
    actualText: input.actualText.trim(),
    blockedPointsText: input.blockedPointsText?.trim() || null,
    tomorrowPlanText: input.tomorrowPlanText.trim(),
  };
}
