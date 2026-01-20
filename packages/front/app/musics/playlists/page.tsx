"use client";

import { logger } from "#modules/core/logger";
import { PlayListsList } from "#modules/musics/lists/playlists";
import { useMusicPlaylists } from "#modules/musics/lists/List";
import { ArrayDataProvider } from "#modules/utils/array-data-context";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicUsersListsApi } from "#modules/musics/lists/users-lists/requests";
import { ContentSpinner } from "#modules/ui-kit/Spinner/Spinner";
import MusicLayout from "../music.layout";
import styles from "./styles.module.css";
import { NewListButton } from "./NewListButton";

export default function MusicPlaylistsPage() {
  const usingMusicPlaylist = useMusicPlaylists();

  return (
    <MusicLayout>
      <header className={styles.header}>
        <NewListButton onSuccess={async (newValue, type) => {
          const api = FetchApi.get(MusicUsersListsApi);
          const res = await api.getMyList( {
            expand: false,
          } );
          const item = res.data?.list.find(i=>i.resourceId === newValue.id && i.type === type);

          if (item) {
            usingMusicPlaylist.addItem( {
              ...item,
              resource: newValue,
            } );
          }

          logger.debug(
            `Nueva ${type === "playlist" ? "playlist" : "Smart Playlist"} creada: ${newValue.name}`,
          );
        }}/>
      </header>
      <ArrayDataProvider
        data={usingMusicPlaylist.data ?? []}
        addItem={usingMusicPlaylist.addItem}
        removeItemByIndex={usingMusicPlaylist.removeItemByIndex}
        setItemByIndex={usingMusicPlaylist.setItemByIndex}
      >
        {(usingMusicPlaylist.data && <PlayListsList {...usingMusicPlaylist} />) || <ContentSpinner /> }
      </ArrayDataProvider>
    </MusicLayout>
  );
}
