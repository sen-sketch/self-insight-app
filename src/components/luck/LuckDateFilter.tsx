"use client";

type Props = {
  fromDate: string;
  toDate: string;
  onFromDateChange: (v: string) => void;
  onToDateChange: (v: string) => void;
  onClear: () => void;
};

export function LuckDateFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
}: Props) {
  const hasFilter = fromDate || toDate;

  return (
    <div className="flex flex-col gap-3 border border-zinc-900 bg-[#f0ede6] p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">絞り込み</span>
        {hasFilter && (
          <button onClick={onClear} className="text-xs text-[#3d5016] hover:underline">
            クリア
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          aria-label="開始日"
          className="flex-1 border border-zinc-900 bg-transparent px-2 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
        <span className="text-xs text-zinc-400">〜</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          aria-label="終了日"
          className="flex-1 border border-zinc-900 bg-transparent px-2 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#3d5016]"
        />
      </div>
    </div>
  );
}
