"use client";

import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { logger } from "#modules/core/logger";
import { PlayListsList } from "#modules/musics/playlists";
import { useMusicPlaylists } from "#modules/musics/playlists/list/List";
import { useNewPlaylistButton } from "#modules/musics/playlists/NewPlaylistButton";
import { ArrayDataProvider } from "#modules/utils/array-data-context";
import MusicLayout from "../music.layout";
import styles from "./styles.module.css";

export default function MusicPlaylistsPage() {
  const usingMusicPlaylist = useMusicPlaylists();
  const newPlaylistButton = useNewPlaylistButton( {
    theme: "dark-gray",
    onSuccess: (newPlaylist: MusicPlaylistEntity) => {
      usingMusicPlaylist.addItem(newPlaylist);
      logger.debug("Nueva lista creada: " + newPlaylist.name);
    },
  } );

  return (
    <MusicLayout>
      <div>
        <section className={styles.newPlaylistSection}>
          {newPlaylistButton.element}
        </section>
      </div>
      <ArrayDataProvider
        data={usingMusicPlaylist.data ?? []}
        addItem={usingMusicPlaylist.addItem}
        removeItemByIndex={usingMusicPlaylist.removeItemByIndex}
        setItemByIndex={usingMusicPlaylist.setItemByIndex}
      >
        <PlayListsList {...usingMusicPlaylist} />
      </ArrayDataProvider>
    </MusicLayout>
  );
}
