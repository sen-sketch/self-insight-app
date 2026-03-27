"use client";

import { HabitPage } from "@/components/habit/HabitPage";

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center text-base font-bold text-zinc-900">設定</h1>
      <HabitPage />
    </div>
  );
}
