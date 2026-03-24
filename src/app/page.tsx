"use client";

import dynamic from "next/dynamic";

const DashboardPage = dynamic(
  () => import("@/components/dashboard/DashboardPage").then((mod) => mod.DashboardPage),
  { ssr: false }
);

export default function Home() {
  return <DashboardPage />;
}
