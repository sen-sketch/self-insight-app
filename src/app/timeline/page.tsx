"use client";

// サイバーコンポーネントのシェル
import dynamic from "next/dynamic";

const TimelinePage = dynamic(
  () => import("@/components/timeline/TimelinePage").then((mod) => mod.TimelinePage),
  { ssr: false }
);

export default function Page() {
  return <TimelinePage />;
}
