"use client";

import { HistoryList as MusicHistoryList } from "#modules/musics/history/HistoryList";

export default function History() {
  return (
    <>
      <h2>Historial</h2>

      <MusicHistoryList showDate="groupByDay"/>
    </>
  );
}
