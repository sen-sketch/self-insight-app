// 全体を繋ぐクライアントコンポーネント

"use client";

import { useState } from "react";
import type { Post, CreatePostInput, Habit } from "@/lib/types";
import {
  getPosts,
  updatePost,
  deletePost,
  getHabits,
} from "@/storage";
import { toTokyoYmd } from "@/lib/datetime";
import { PostList } from "@/components/post/PostList";
import { TimelineFilters } from "./TimelineFilters";

export function TimelinePage() {
  const [posts, setPosts] = useState<Post[]>(() => getPosts());
  const [habits] = useState<Habit[]>(() => getHabits());
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  function reload() {
    setPosts(getPosts());
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
