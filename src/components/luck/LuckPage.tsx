"use client";

import { useState } from "react";
import type { LuckRecord, UpdateLuckRecordInput } from "@/lib/types";
import {
  getLuckRecords,
  addLuckRecord,
  updateLuckRecord,
  deleteLuckRecord,
} from "@/storage";
import { toTokyoYmd } from "@/lib/datetime";
import { LuckRecordForm } from "./LuckRecordForm";
import { LuckRecordList } from "./LuckRecordList";
import { LuckDateFilter } from "./LuckDateFilter";

export function LuckPage() {
  const [records, setRecords] = useState<LuckRecord[]>(() => getLuckRecords());
  const [showForm, setShowForm] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  function reload() {
    setRecords(getLuckRecords());
  }

  function handleAdd(data: Parameters<typeof addLuckRecord>[0]) {
    addLuckRecord(data);
    reload();
    setShowForm(false);
  }

  function handleUpdate(id: string, data: UpdateLuckRecordInput) {
    updateLuckRecord(id, data);
    reload();
  }

  function handleDelete(id: string) {
    deleteLuckRecord(id);
    reload();
  }

  const filteredRecords = records.filter((record) => {
    const date = toTokyoYmd(record.recordedAt);
    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;
    return true;
  });

  const hasFilter = fromDate || toDate;

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          🍀 運を上げる記録
        </h1>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-lg bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-yellow-600"
        >
          {showForm ? "閉じる" : "+ 記録"}
        </button>
      </div>

      {showForm && (
        <LuckRecordForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      <LuckDateFilter
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onClear={() => {
          setFromDate("");
          setToDate("");
        }}
      />

      {hasFilter && (
        <p className="text-xs text-zinc-400">
          {filteredRecords.length} / {records.length} 件
        </p>
      )}

      <LuckRecordList
        records={filteredRecords}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
