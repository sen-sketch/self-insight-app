"use client";

import dynamic from "next/dynamic";

const MetaDiaryPage = dynamic(
  () => import("@/components/metadiary/MetaDiaryPage").then((mod) => mod.MetaDiaryPage),
  { ssr: false }
);

export default function Page() {
  return <MetaDiaryPage />;
}
