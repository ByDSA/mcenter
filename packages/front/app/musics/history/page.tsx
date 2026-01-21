"use client";

import { MusicHistoryList } from "#modules/musics/history/List";
import MusicLayout from "../music.layout";

export default function MusicHistoryPage() {
  return (
    <MusicLayout>
      <MusicHistoryList />
    </MusicLayout>
  );
}
