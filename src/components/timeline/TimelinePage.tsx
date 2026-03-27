// 全体を繋ぐクライアントコンポーネント

"use client";

import { useState } from "react";
import type { Post, CreatePostInput, Habit } from "@/lib/types";
import {
  getPosts,
  addPost,
  updatePost,
  deletePost,
  getHabits,
} from "@/storage";
import { toTokyoYmd } from "@/lib/datetime";
import { UnifiedPostForm } from "@/components/post/UnifiedPostForm";
import { PostList } from "@/components/post/PostList";
import { TimelineFilters } from "./TimelineFilters";

export function TimelinePage() {
  const [posts, setPosts] = useState<Post[]>(() => getPosts());
  const [habits] = useState<Habit[]>(() => getHabits());
  const [showForm, setShowForm] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  function reload() {
    setPosts(getPosts());
  }

  function handleAdd(data: CreatePostInput) {
    addPost(data);
    reload();
    setShowForm(false);
  }

  function handleUpdate(id: string, data: CreatePostInput) {
    updatePost(id, data);
    reload();
  }

  function handleDelete(id: string) {
    deletePost(id);
    reload();
  }

  const allTags = [...new Set(posts.flatMap((p) => p.freeTags))].sort();

  const filteredPosts = posts.filter((post) => {
    const postDate = toTokyoYmd(post.postedAt);
    if (fromDate && postDate < fromDate) return false;
    if (toDate && postDate > toDate) return false;
    if (tagFilter && !post.freeTags.includes(tagFilter)) return false;
    return true;
  });

  const hasFilter = fromDate || toDate || tagFilter;

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="relative flex items-center">
        <h1 className="w-full text-center text-lg font-black text-zinc-900">タイムライン</h1>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="absolute right-0 border border-zinc-900 bg-[#3d5016] px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-[#4a6320]"
        >
          {showForm ? "閉じる" : "+ 投稿"}
        </button>
      </div>

      {showForm && (
        <UnifiedPostForm
          habits={habits}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      <TimelineFilters
        fromDate={fromDate}
        toDate={toDate}
        tagFilter={tagFilter}
        allTags={allTags}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onTagFilterChange={setTagFilter}
        onClear={() => {
          setFromDate("");
          setToDate("");
          setTagFilter("");
        }}
      />

      {hasFilter && (
        <p className="text-xs text-zinc-400">
          {filteredPosts.length} / {posts.length} 件
        </p>
      )}

      <PostList
        posts={filteredPosts}
        habits={habits}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
