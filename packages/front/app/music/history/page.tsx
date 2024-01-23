"use client";

import { MusicHistoryList } from "#modules/musics";

export default function History() {
  return (
    <>
      <h2>Historial</h2>

      <MusicHistoryList showDate="groupByDay"/>
    </>
  );
}
