"use client";

import { PlayListsList } from "#modules/musics/playlists";
import MusicLayout from "../music.layout";

export default function MusicPlaylistsPage() {
  return (
    <MusicLayout>
      <h2>Playlists</h2>
      <PlayListsList />
    </MusicLayout>
  );
}
