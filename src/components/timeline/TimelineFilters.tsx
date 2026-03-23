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
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">絞り込み</span>
        {hasFilter && (
          <button onClick={onClear} className="text-xs text-blue-500 hover:underline">
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
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <span className="text-xs text-zinc-400">〜</span>
            <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            aria-label="終了日"
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
        </div>

        {/* タグフィルタ */}
        {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
            {allTags.map((tag) => (
                <button
                key={tag}
                onClick={() => onTagFilterChange(tagFilter === tag ? "" : tag)}
                className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                    tagFilter === tag
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
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