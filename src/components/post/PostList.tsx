import type { Post, Habit, CreatePostInput } from "@/lib/types";
import { PostCard } from "./PostCard";
import { FileText } from "lucide-react";

type Props = {
  posts: Post[];
  habits: Habit[];
  onUpdate: (id: string, data: CreatePostInput) => void;
  onDelete: (id: string) => void;
};

export function PostList({ posts, habits, onUpdate, onDelete }: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-zinc-400">
        <FileText size={40} strokeWidth={3} className="text-zinc-300" />
        <p className="text-sm">投稿がありません</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-zinc-200 border-t border-b border-zinc-200">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard
            post={post}
            habits={habits}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
