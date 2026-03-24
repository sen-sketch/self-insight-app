"use client";

import dynamic from "next/dynamic";

const ExportPage = dynamic(
  () => import("@/components/export/ExportPage").then((mod) => mod.ExportPage),
  { ssr: false }
);

export default function ExportPageRoute() {
  return <ExportPage />;
}
