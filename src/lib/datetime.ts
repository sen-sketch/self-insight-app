const TOKYO_TIME_ZONE = "Asia/Tokyo" as const;

type DateInput = Date | string | number;
type TokyoDateParts = { year: number; month: number; day: number };

export type RecentPeriodDays = 1 | 7 | 30;

export type RecentDateRange = {
    days: RecentPeriodDays;
    fromDate: string;
    toDate: string;
}

const TOKYO_DATE_PARTS_FORMATTER = new Intl.DateTimeFormat("en-US", {
    timeZone: TOKYO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

const DISPLAY_DATETIME_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  timeZone: TOKYO_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const TOKYO_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: TOKYO_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function parseDateInput(input: DateInput): Date {
    const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid date input: ${String(input)}`);
    }
    return date;
}

function getTokyoDateParts(input: DateInput): TokyoDateParts {
    const date = parseDateInput(input);
    const parts = TOKYO_DATE_PARTS_FORMATTER.formatToParts(date);

    const year = Number(parts.find((p) => p.type === "year")?.value);
    const month = Number(parts.find((p) => p.type === "month")?.value);
    const day = Number(parts.find((p) => p.type === "day")?.value);

    if (!year || !month || !day) {
        throw new Error("Failed to resolve Tokyo date parts");
    }

    return { year, month, day };
}

function shiftYmd(ymd: string, diffDays: number): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    if (!match) throw new Error(`Invalid YYYY-MM-DD: ${ymd}`);

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const utc = new Date(Date.UTC(year, month -1, day));
    utc.setUTCDate(utc.getUTCDate() + diffDays);

    const y = utc.getUTCFullYear();
    const m = utc.getUTCMonth() + 1;
    const d = utc.getUTCDate();
    return `${y}-${pad2(m)}-${pad2(d)}`;
}

function pad2(value: number): string {
    return String(value).padStart(2, "0");
}

export function toTokyoYmd(input: DateInput = new Date()): string {
    const { year, month, day } = getTokyoDateParts(input);
    return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function getRecentDateRange(
    days: RecentPeriodDays,
    base: DateInput = new Date()
): RecentDateRange {
    const toDate = toTokyoYmd(base);
    const fromDate = shiftYmd(toDate, -(days - 1));
    return { days, fromDate, toDate };
}

export function habitStartTimeToMinutes(time: string | null): number | null {
  if (time === null) return null;

  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) {
    throw new Error(`Invalid time format (expected HH:mm): ${time}`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

export function formatDisplayDateTime(input: DateInput): string {
  return DISPLAY_DATETIME_FORMATTER.format(parseDateInput(input));
}

export const getRecent1DayRange = (base?: DateInput) => getRecentDateRange(1, base);
export const getRecent7DayRange = (base?: DateInput) => getRecentDateRange(7, base);
export const getRecent30DayRange = (base?: DateInput) => getRecentDateRange(30, base);

export function toTokyoHHmm(input: DateInput): string {
  const date = parseDateInput(input);
  const parts = TOKYO_TIME_FORMATTER.formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  // 一部ブラウザで "24" が返ることがある
  return `${hour === "24" ? "00" : hour}:${minute}`;
}
