"use client";

import { useEffect, useRef, useState } from "react";
import type { CreateHabitInput, Habit, HabitStartLog } from "@/lib/types";
import { HabitCard } from "./HabitCard";

type Props = {
  habits: Habit[];
  logs: HabitStartLog[];
  onReorder: (orderedIds: string[]) => void;
  onUpdate: (id: string, patch: Partial<CreateHabitInput>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onLogStart?: (habitId: string, note: string | null) => void;
};

export function HabitList({ habits, logs, onUpdate, onReorder, onDelete, onToggleActive, onLogStart }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchDragRef = useRef<{ startIndex: number; currentDrop: number }>({ startIndex: -1, currentDrop: -1 });

  // refs for stable access inside passive event listeners
  const habitsRef = useRef(habits);
  habitsRef.current = habits;
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    function onTouchMove(e: TouchEvent) {
      if (touchDragRef.current.startIndex === -1) return;
      e.preventDefault();
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      for (let i = 0; i < itemRefs.current.length; i++) {
        if (itemRefs.current[i]?.contains(target as Node)) {
          if (touchDragRef.current.currentDrop !== i) {
            touchDragRef.current.currentDrop = i;
            setDropIndex(i);
          }
          break;
        }
      }
    }

    function onTouchEnd() {
      const { startIndex, currentDrop } = touchDragRef.current;
      if (startIndex !== -1 && currentDrop !== -1 && startIndex !== currentDrop) {
        const cur = habitsRef.current;
        const newHabits = [...cur];
        const [moved] = newHabits.splice(startIndex, 1);
        newHabits.splice(currentDrop, 0, moved);
        onReorderRef.current(newHabits.filter((h) => h.isActive).map((h) => h.id));
      }
      touchDragRef.current = { startIndex: -1, currentDrop: -1 };
      setDragIndex(null);
      setDropIndex(null);
    }

    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  function executeReorder(from: number, to: number) {
    if (from === to) return;
    const newHabits = [...habits];
    const [moved] = newHabits.splice(from, 1);
    newHabits.splice(to, 0, moved);
    onReorder(newHabits.filter((h) => h.isActive).map((h) => h.id));
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDropIndex(index);
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex !== null) executeReorder(dragIndex, index);
    setDragIndex(null);
    setDropIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDropIndex(null);
  }

  function handleTouchStart(index: number) {
    if (!habits[index].isActive) return;
    touchDragRef.current = { startIndex: index, currentDrop: index };
    setDragIndex(index);
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
    <div ref={listRef} className="flex flex-col gap-2">
      {habits.map((habit, index) => (
        <div
          key={habit.id}
          ref={(el) => { itemRefs.current[index] = el; }}
          draggable={habit.isActive}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          onTouchStart={() => handleTouchStart(index)}
          className={[
            habit.isActive ? "cursor-grab active:cursor-grabbing" : "",
            dragIndex === index ? "opacity-40" : "",
            dropIndex === index && dragIndex !== index ? "ring-2 ring-[#3d5016] ring-inset" : "",
          ].filter(Boolean).join(" ")}
        >
          <HabitCard
            habit={habit}
            logs={logs.filter((l) => l.habitId === habit.id)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            onLogStart={onLogStart}
          />
        </div>
      ))}
    </div>
  );
}
