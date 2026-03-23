// 投稿一覧、降順表示
import type { MoodScore, TimelinePost } from "@/lib/types";
import { TimelinePostCard } from "./TimelinePostCard";

type Props = {
  posts: TimelinePost[];
  onUpdate: (id: string, data: { postedAt: string; moodScore: MoodScore; content: string; tags: string[] }) => void;
  onDelete: (id: string) => void;
};

export function TimelinePostList({ posts, onUpdate, onDelete }: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-zinc-400">
        <span className="text-4xl">📝</span>
        <p className="text-sm">投稿がありません</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {posts.map((post) => (
        <li key={post.id}>
          <TimelinePostCard post={post} onUpdate={onUpdate} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
