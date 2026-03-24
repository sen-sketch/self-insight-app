"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/",          label: "ホーム",   emoji: "🏠" },
  { href: "/timeline",  label: "投稿",     emoji: "📝" },
  { href: "/tracker",   label: "習慣",     emoji: "✅" },
  { href: "/luck",      label: "運記録",   emoji: "🍀" },
  { href: "/metadiary", label: "日記",     emoji: "📔" },
  { href: "/export",    label: "出力",     emoji: "📤" },
] as const;

export function BottomNav() {
    const pathname = usePathname();
    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[calc(56px+env(safe-area-inset-bottom))] w-full max-w-md items-stretch border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-zinc-700 dark:bg-zinc-900">
            {NAV_ITEMS.map(({ href, label, emoji }) => {
                const active = pathname === href;
                return (
                    <Link
                    key={href}
                    href={href}
                    className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                        active
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                >
                    <span className="text-lg leading-none">{emoji}</span>
                    <span className="text-[10px] leading-none">{label}</span>
                </Link>
                );
            })}
        </nav>
    );
}