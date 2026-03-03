"use client";

import { logger } from "#modules/core/logger";
import { PlayListsList } from "#modules/musics/lists/playlists";
import { useMusicPlaylists } from "#modules/musics/lists/List";
import { ArrayDataProvider } from "#modules/utils/array-data-context";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicUsersListsApi } from "#modules/musics/lists/users-lists/requests";
import { ContentSpinner } from "#modules/ui-kit/Spinner/Spinner";
import { useI18nContext } from "#modules/core/i18n/i18n-react";
import MusicLayout from "../music.layout";
import styles from "./styles.module.css";
import { NewListButton } from "./NewListButton";

export default function MusicPlaylistsPage() {
  const usingMusicPlaylist = useMusicPlaylists();
  const { LL } = useI18nContext();

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

          if (type === "playlist")
            logger.debug(LL.modules.musics.lists.playlists.oneCreated());
          else
            logger.debug(LL.modules.musics.lists.smartPlaylists.oneCreated());
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
