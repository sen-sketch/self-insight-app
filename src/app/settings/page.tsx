"use client";

import dynamic from "next/dynamic";

const SettingsPage = dynamic(
  () => import("@/components/settings/SettingsPage").then((mod) => mod.SettingsPage),
  { ssr: false }
);

export default function Page() {
  return <SettingsPage />;
}
