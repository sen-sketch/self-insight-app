"use client";

import { useState } from "react";
import type { MetaDiary } from "@/lib/types";
import {
  getMetaDiaries,
  getMetaDiaryByDate,
  upsertMetaDiary,
  deleteMetaDiary,
} from "@/storage";
import { toTokyoYmd, getRecent30DayRange } from "@/lib/datetime";
import { MetaDiaryForm } from "./MetaDiaryForm";
import { MetaDiaryList } from "./MetaDiaryList";
import { Notebook } from "lucide-react";

export function MetaDiaryPage() {
  const today = toTokyoYmd();
  const { fromDate } = getRecent30DayRange();

  const [todayDiary, setTodayDiary] = useState<MetaDiary | null>(
    () => getMetaDiaryByDate(today)
  );
  const [pastDiaries, setPastDiaries] = useState<MetaDiary[]>(() =>
    getMetaDiaries().filter(
      (d) => d.diaryDate !== today && d.diaryDate >= fromDate
    )
  );

  function reload() {
    const { fromDate: from } = getRecent30DayRange();
    setTodayDiary(getMetaDiaryByDate(today));
    setPastDiaries(
      getMetaDiaries().filter(
        (d) => d.diaryDate !== today && d.diaryDate >= from
      )
    );
  }

  function handleSubmit(data: Parameters<typeof upsertMetaDiary>[1]) {
    upsertMetaDiary(today, data);
    reload();
  }

  function handleDelete(id: string) {
    deleteMetaDiary(id);
    reload();
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        <Notebook size={20} strokeWidth={3} className="inline-block text-orange-500" /> メタ認知日記
      </h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {today} の日記
        </h2>
        <MetaDiaryForm initial={todayDiary ?? undefined} onSubmit={handleSubmit} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          過去30日の記録
        </h2>
        <MetaDiaryList diaries={pastDiaries} onDelete={handleDelete} />
      </section>
    </div>
  );
}
