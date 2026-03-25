import type { CreateHabitInput, Habit, HabitStartLog } from "@/lib/types";
import { HabitCard } from "./HabitCard";

type Props = {
  habits: Habit[];
  logs: HabitStartLog[];
  onReorder: (orderedIds: string[]) => void;
  onUpdate: (id: string, patch: Partial<CreateHabitInput>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onLogStart: (habitId: string, note: string | null) => void;
};

export function HabitList({ habits, logs, onUpdate, onReorder, onDelete, onToggleActive, onLogStart }: Props) {
  const activeHabits = habits.filter((h) => h.isActive);
  function moveUp(index: number) {
    if (index === 0) return;
    const ids = activeHabits.map((h) => h.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    onReorder(ids);
  }

  function moveDown(index: number) {
    if (index === activeHabits.length - 1) return;
    const ids = activeHabits.map((h) => h.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    onReorder(ids);
  }  

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
      {habits.map((habit) => {
        const activeIndex = activeHabits.findIndex((h) => h.id === habit.id);
        return (
          <HabitCard
            key={habit.id}
            habit={habit}
            logs={logs.filter((l) => l.habitId === habit.id)}
            canMoveUp={habit.isActive && activeIndex > 0}
            canMoveDown={habit.isActive && activeIndex < activeHabits.length - 1}
            onMoveUp={() => moveUp(activeIndex)}
            onMoveDown={() => moveDown(activeIndex)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            onLogStart={onLogStart}
          />
        );
      })}
    </div>
  );
}
