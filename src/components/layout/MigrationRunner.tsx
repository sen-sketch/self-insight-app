"use client";

import { useEffect } from "react";
import { runMigrationIfNeeded } from "@/lib/migration";

/**
 * アプリ初回マウント時に旧データのマイグレーションを実行する。
 * layout.tsx に配置して全ページで一度だけ走らせる。
 */
export function MigrationRunner() {
  useEffect(() => {
    runMigrationIfNeeded();
  }, []);

  return null;
}
