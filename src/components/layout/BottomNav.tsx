"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenLine, CheckSquare, Clover, BookOpen, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/",          label: "ホーム",   Icon: Home },
  { href: "/timeline",  label: "投稿",     Icon: PenLine },
  { href: "/tracker",   label: "習慣",     Icon: CheckSquare },
  { href: "/luck",      label: "運記録",   Icon: Clover },
  { href: "/metadiary", label: "日記",     Icon: BookOpen },
  { href: "/export",    label: "出力",     Icon: Upload },
];

export function BottomNav() {
    const pathname = usePathname();
    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[calc(56px+env(safe-area-inset-bottom))] w-full max-w-md items-stretch border-t border-zinc-900 bg-[#f0ede6] pb-[env(safe-area-inset-bottom)]">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                    <Link
                    key={href}
                    href={href}
                    className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                        active
                            ? "text-[#3d5016]"
                            : "text-zinc-400 hover:text-zinc-900"
                    }`}
                >
                    <Icon size={20} strokeWidth={3} />
                    <span className="text-[10px] leading-none">{label}</span>
                </Link>
                );
            })}
        </nav>
    );
}