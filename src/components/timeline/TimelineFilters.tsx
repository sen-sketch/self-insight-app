// 日付範囲フィルタ、タグフィルタ

"use client";

type Props = {
    fromDate: string;
    toDate: string;
    tagFilter: string;
    allTags: string[];
    onFromDateChange: (v: string) => void;
    onToDateChange: (v: string) => void;
    onTagFilterChange: (v: string) => void;
    onClear: () => void;
};

export function TimelineFilters({
    fromDate,
    toDate,
    tagFilter,
    allTags,
    onFromDateChange,
    onToDateChange,
    onTagFilterChange,
    onClear,
}: Props) {
    const hasFilter = fromDate || toDate || tagFilter;

    return (
        <div className="flex flex-col gap-3 p-1">
            <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">絞り込み</span>
        {hasFilter && (
          <button onClick={onClear} className="text-xs text-[#3d5016] hover:underline">
            クリア
          </button>
        )}
        </div>
        {/* 日付範囲 */}
        <div className="flex items-center gap-2">
            <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            aria-label="開始日"
            className="flex-1 border border-zinc-900 bg-white px-2 py-1.5 text-center text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#3d5016] [&::-webkit-datetime-edit]:text-center [&::-webkit-datetime-edit-fields-wrapper]:w-full"
            />
            <span className="text-xs text-zinc-400">〜</span>
            <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            aria-label="終了日"
            className="flex-1 border border-zinc-900 bg-white px-2 py-1.5 text-center text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#3d5016] [&::-webkit-datetime-edit]:text-center [&::-webkit-datetime-edit-fields-wrapper]:w-full"
            />
        </div>

        {/* タグフィルタ */}
        {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
            {allTags.map((tag) => (
                <button
                key={tag}
                onClick={() => onTagFilterChange(tagFilter === tag ? "" : tag)}
                className={`px-2 py-0.5 text-xs font-medium transition-colors border ${
                    tagFilter === tag
                    ? "border-[#3d5016] bg-[#3d5016] text-white"
                    : "border-zinc-900 bg-white text-zinc-700 hover:bg-zinc-200"
                }`}
                >
                #{tag}
                </button>
            ))}
            </div>
        )}
    </div>
    );
}