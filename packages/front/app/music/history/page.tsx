"use client";

import { HistoryList as MusicHistoryList } from "#modules/musics/history/HistoryList";
import MusicLayout from "../music.layout";

export default function History() {
  return (
    <MusicLayout>
      <h2>Historial</h2>

      <MusicHistoryList showDate="groupByDay"/>
    </MusicLayout>
  );
}
