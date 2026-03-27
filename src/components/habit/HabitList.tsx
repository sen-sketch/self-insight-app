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
  const floatingElRef = useRef<HTMLDivElement | null>(null);

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

      if (floatingElRef.current) {
        const fw = floatingElRef.current.offsetWidth;
        floatingElRef.current.style.left = `${touch.clientX - fw / 2}px`;
        floatingElRef.current.style.top = `${touch.clientY - 30}px`;
      }

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
      if (floatingElRef.current) {
        floatingElRef.current.remove();
        floatingElRef.current = null;
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

  function handleDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index);
    const el = itemRefs.current[index];
    if (el) {
      const clone = el.cloneNode(true) as HTMLDivElement;
      clone.style.cssText = [
        "position:fixed",
        "top:-1000px",
        "left:-1000px",
        `width:${el.offsetWidth}px`,
        "box-shadow:0 20px 40px rgba(0,0,0,0.22)",
        "transform:rotate(-1deg) scale(1.03)",
        "opacity:1",
        "pointer-events:none",
        "border-radius:2px",
      ].join(";");
      document.body.appendChild(clone);
      e.dataTransfer.setDragImage(clone, el.offsetWidth / 2, 30);
      setTimeout(() => clone.remove(), 0);
    }
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

  function handleTouchStart(e: React.TouchEvent, index: number) {
    if (!habits[index].isActive) return;
    const touch = e.touches[0];
    const el = itemRefs.current[index];
    if (el) {
      const rect = el.getBoundingClientRect();
      const clone = el.cloneNode(true) as HTMLDivElement;
      clone.style.cssText = [
        "position:fixed",
        `width:${rect.width}px`,
        `left:${touch.clientX - rect.width / 2}px`,
        `top:${touch.clientY - 30}px`,
        "z-index:9999",
        "box-shadow:0 20px 40px rgba(0,0,0,0.22)",
        "transform:rotate(-1deg) scale(1.03)",
        "opacity:0.95",
        "pointer-events:none",
        "border-radius:2px",
      ].join(";");
      document.body.appendChild(clone);
      floatingElRef.current = clone;
    }
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
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={[
            "flex items-stretch border border-zinc-200 bg-white transition-opacity duration-150",
            dragIndex === index ? "opacity-25" : "",
            dropIndex === index && dragIndex !== index ? "ring-2 ring-[#3d5016] ring-inset" : "",
          ].filter(Boolean).join(" ")}
        >
          {habit.isActive && (
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onTouchStart={(e) => handleTouchStart(e, index)}
              className="flex items-center justify-center w-7 shrink-0 bg-white text-zinc-300 cursor-grab active:cursor-grabbing touch-none select-none"
              title="ドラッグして並び替え"
            >
              <svg width="12" height="14" viewBox="0 0 14 14" fill="currentColor">
                <circle cx="4" cy="3" r="1.2" />
                <circle cx="10" cy="3" r="1.2" />
                <circle cx="4" cy="7" r="1.2" />
                <circle cx="10" cy="7" r="1.2" />
                <circle cx="4" cy="11" r="1.2" />
                <circle cx="10" cy="11" r="1.2" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0 [&_form]:border-0">
            <HabitCard
              habit={habit}
              logs={logs.filter((l) => l.habitId === habit.id)}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              onLogStart={onLogStart}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
