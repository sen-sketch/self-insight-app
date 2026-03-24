"use client";

import dynamic from "next/dynamic";

const HabitPage = dynamic(
  () => import("@/components/habit/HabitPage").then((mod) => mod.HabitPage),
  { ssr: false }
);

export default function Page() {
  return <HabitPage />;
}
