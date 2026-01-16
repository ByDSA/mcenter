"use client";

import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { logger } from "#modules/core/logger";
import { PlayListsList } from "#modules/musics/lists/playlists";
import { useMusicPlaylists } from "#modules/musics/lists/List";
import { NewPlaylistButton } from "#modules/musics/lists/playlists/New/NewPlaylistButton";
import { ArrayDataProvider } from "#modules/utils/array-data-context";
import { NewQueryButton } from "#modules/musics/lists/queries/New/Button";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicUsersListsApi } from "#modules/musics/lists/users-lists/requests";
import { PlayQueryButton } from "#modules/musics/lists/queries/PlayQuery";
import { ContentSpinner } from "#modules/ui-kit/spinner/Spinner";
import MusicLayout from "../music.layout";
import styles from "./styles.module.css";

export default function MusicPlaylistsPage() {
  const usingMusicPlaylist = useMusicPlaylists();
  const newPlaylistButton = <NewPlaylistButton
    theme="dark-gray"
    onSuccess= {async (newPlaylist: MusicPlaylistEntity) => {
      const api = FetchApi.get(MusicUsersListsApi);
      const res = await api.getMyList( {
        expand: false,
      } );
      const item = res.data?.list.find(i=>i.resourceId === newPlaylist.id);

      if (item) {
        usingMusicPlaylist.addItem( {
          ...item,
          resource: newPlaylist,
        } );
      }

      logger.debug("Nueva lista creada: " + newPlaylist.name);
    }} />;
  const newQueryButton = <NewQueryButton
    theme="dark-gray"
    onSuccess={async (newQuery) => {
      const api = FetchApi.get(MusicUsersListsApi);
      const res = await api.getMyList( {
        expand: false,
      } );
      const item = res.data?.list.find(i=>i.resourceId === newQuery.id);

      if (item) {
        usingMusicPlaylist.addItem( {
          ...item,
          resource: newQuery,
        } );
      }

      logger.debug("Nueva query creada: " + newQuery.name);
    }} />;

  return (
    <MusicLayout>
      <header className={styles.header}>
        <PlayQueryButton />
        <section className={styles.newPlaylistSection}>
          {newQueryButton}
          {newPlaylistButton}
        </section>
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
