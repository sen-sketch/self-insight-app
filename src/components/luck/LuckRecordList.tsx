"use client";

import type { LuckRecord, UpdateLuckRecordInput } from "@/lib/types";
import { LuckRecordCard } from "./LuckRecordCard";
import { Clover } from "lucide-react";

type Props = {
  records: LuckRecord[];
  onUpdate: (id: string, data: UpdateLuckRecordInput) => void;
  onDelete: (id: string) => void;
};

export function LuckRecordList({ records, onUpdate, onDelete }: Props) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-zinc-400">
        <Clover size={36} strokeWidth={3} className="text-zinc-300" />
        <p className="text-sm">まだ記録がありません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {records.map((record) => (
        <LuckRecordCard
          key={record.id}
          record={record}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

