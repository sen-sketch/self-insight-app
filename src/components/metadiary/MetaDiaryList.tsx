import type { MetaDiary } from "@/lib/types";
import { MetaDiaryCard } from "./MetaDiaryCard";

type Props = {
  diaries: MetaDiary[];
  onDelete: (id: string) => void;
};

export function MetaDiaryList({ diaries, onDelete }: Props) {
  if (diaries.length === 0) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        過去30日の記録がありません
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {diaries.map((diary) => (
        <MetaDiaryCard key={diary.id} diary={diary} onDelete={onDelete} />
      ))}
    </div>
  );
}
