// 全体を繋ぐクライアントコンポーネント

"use client";

import { useState } from "react";
import type { MoodScore, TimelinePost } from "@/lib/types";
import {
  getTimelinePosts,
  addTimelinePost,
  updateTimelinePost,
  deleteTimelinePost,
} from "@/storage";
import { toTokyoYmd } from "@/lib/datetime";
import { TimelinePostForm } from "./TimelinePostForm";
import { TimelinePostList } from "./TimelinePostList";
import { TimelineFilters } from "./TimelineFilters";

type UpdateData = { postedAt: string; moodScore: MoodScore; content: string; tags: string[] };

export function TimelinePage() {
  const [posts, setPosts] = useState<TimelinePost[]>(() => getTimelinePosts());
  const [showForm, setShowForm] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  function reload() {
    setPosts(getTimelinePosts());
  }

  function handleAdd(data: UpdateData) {
    addTimelinePost(data);
    reload();
    setShowForm(false);
  }

  function handleUpdate(id: string, data: UpdateData) {
    updateTimelinePost(id, data);
    reload();
  }

  function handleDelete(id: string) {
    deleteTimelinePost(id);
    reload();
  }

  const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();

  const filteredPosts = posts.filter((post) => {
    const postDate = toTokyoYmd(post.postedAt);
    if (fromDate && postDate < fromDate) return false;
    if (toDate && postDate > toDate) return false;
    if (tagFilter && !post.tags.includes(tagFilter)) return false;
    return true;
  });

  const hasFilter = fromDate || toDate || tagFilter;

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">タイムライン</h1>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          {showForm ? "閉じる" : "+ 投稿"}
        </button>
      </div>

      {showForm && (
        <TimelinePostForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
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

      <TimelinePostList
        posts={filteredPosts}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
