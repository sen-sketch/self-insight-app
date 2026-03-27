import type {
  CreatePostInput,
  UpdatePostInput,
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


export function validatePostInput(
  input: CreatePostInput
): CreatePostInput {
  if (input.moodScore !== null) {
    assertMoodScore(input.moodScore);
  }

  return {
    ...input,
    whatText: input.whatText?.trim() || null,
    resultText: input.resultText?.trim() || null,
    questionText: input.questionText?.trim() || null,
    habitTags: [...new Set(input.habitTags)],
    freeTags: normalizeTags(input.freeTags),
  };
}

export function validatePostPatch(
  patch: UpdatePostInput
): UpdatePostInput {
  const nextPatch = { ...patch };

  if (nextPatch.moodScore !== undefined && nextPatch.moodScore !== null) {
    assertMoodScore(nextPatch.moodScore);
  }

  if (nextPatch.whatText !== undefined) {
    nextPatch.whatText = nextPatch.whatText?.trim() || null;
  }
  if (nextPatch.resultText !== undefined) {
    nextPatch.resultText = nextPatch.resultText?.trim() || null;
  }
  if (nextPatch.questionText !== undefined) {
    nextPatch.questionText = nextPatch.questionText?.trim() || null;
  }
  if (nextPatch.habitTags !== undefined) {
    nextPatch.habitTags = [...new Set(nextPatch.habitTags)];
  }
  if (nextPatch.freeTags !== undefined) {
    nextPatch.freeTags = normalizeTags(nextPatch.freeTags);
  }

  return nextPatch;
}
