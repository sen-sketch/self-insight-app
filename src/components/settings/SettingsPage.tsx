"use client";

import { HabitPage } from "@/components/habit/HabitPage";

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 pb-6">
      <h1 className="px-4 pt-5 text-center text-base font-bold text-zinc-900">設定</h1>

      {/* 習慣タスク管理 */}
      <section>
        <HabitPage showTracker={false} />
      </section>

      {/* 出力文カスタム設定 */}
      <section className="px-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">出力文カスタム設定</h2>
        <div className="border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-400">
            出力テンプレートのカスタマイズ機能は今後追加予定です。
          </p>
        </div>
      </section>
    </div>
  );
}
