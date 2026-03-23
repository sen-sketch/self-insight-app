import type { CreateHabitInput, Habit } from "@/lib/types";
import { HabitCard } from "./HabitCard";

type Props = {
  habits: Habit[];
  onUpdate: (id: string, patch: Partial<CreateHabitInput>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onLogStart: (habitId: string, note: string | null) => void;
};

export function HabitList({ habits, onUpdate, onDelete, onToggleActive, onLogStart }: Props) {
  if (habits.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-400">
        習慣タスクがありません。
        <br />「+ タスク追加」で作成してください。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          onLogStart={onLogStart}
        />
      ))}
    </div>
  );
}
