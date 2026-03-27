"use client";

import { useState } from "react";
import type { Habit, CreatePostInput } from "@/lib/types";
import { getHabits, addPost } from "@/storage";
import { UnifiedPostForm } from "./UnifiedPostForm";

export function PostPage() {
  const [habits] = useState<Habit[]>(() => getHabits());
  const [submitted, setSubmitted] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(data: CreatePostInput) {
    addPost(data);
    setSubmitted(true);
    setFormKey((k) => k + 1);
    setTimeout(() => setSubmitted(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-base font-bold text-zinc-900">新規投稿</h1>

      {submitted && (
        <p className="border border-[#3d5016] bg-[#f0ede6] px-3 py-2 text-center text-sm font-medium text-[#3d5016]">
          投稿しました
        </p>
      )}

      <UnifiedPostForm
        key={formKey}
        habits={habits}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
