"use client";

import dynamic from "next/dynamic";

const LuckPage = dynamic(
  () => import("@/components/luck/LuckPage").then((mod) => mod.LuckPage),
  { ssr: false }
);

export default function Page() {
  return <LuckPage />;
}
