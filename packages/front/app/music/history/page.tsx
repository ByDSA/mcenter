"use client";

import { HistoryList as MusicHistoryList } from "#modules/musics/history/HistoryList";
import MusicLayout from "../music.layout";

export default function MusicHistoryPage() {
  return (
    <MusicLayout>
      <MusicHistoryList showDate="groupByDay"/>
    </MusicLayout>
  );
}
