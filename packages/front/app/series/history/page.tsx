"use client";

import { HistoryList } from "#modules/history";

export default function History() {
  return (
    <>
      <h2 className="title">
          Historial
      </h2>

      <HistoryList />
    </>
  );
}