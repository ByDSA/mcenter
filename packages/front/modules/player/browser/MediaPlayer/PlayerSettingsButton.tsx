"use client";

import { PATH_ROUTES } from "$shared/routing";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { useContextMenuTrigger, AnchorContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { useMusic } from "#modules/musics/hooks";
import { MusicContextMenu } from "#modules/musics/musics/SettingsButton/Button";
import { PlaySmartPlaylistContextMenuItem } from "#modules/musics/lists/smart-playlists/Play/ContextMenuItem";
import { useBrowserPlayer } from "./BrowserPlayerContext";
import styles from "./PlayerSettingsButton.module.css";

export const PlayerSettingsButton = () => {
  const { openMenu } = useContextMenuTrigger();
  const currentResource = useBrowserPlayer((s) => s.currentResource);
  const query = useBrowserPlayer((s) => s.query);
  const { data: music } = useMusic(currentResource?.resourceId ?? null);

  if (!music)
    return null;

  const playingType: "one" | "playlist" | "smart-playlist" = (() => {
    if (currentResource?.playlistId)
      return "playlist";

    if (query)
      return "smart-playlist";

    return "one";
  } )();
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    openMenu( {
      event: e,
      content: (
        <LocalDataProvider data={music}>
          {playingType === "playlist" && currentResource?.playlistId && (
            <AnchorContextMenuItem
              label="Ir a la playlist"
              href={PATH_ROUTES.musics.frontend.playlists.withParams( {
                playlistId: currentResource.playlistId,
              } )}
            />
          )}

          {playingType === "smart-playlist" && query && (
            <PlaySmartPlaylistContextMenuItem
              initialValue={query}
              label="Reproducir modificación"
            />
          )}

          <AnchorContextMenuItem
            label="Ir a la música"
            href={PATH_ROUTES.musics.frontend.path + "/" + music.id}
          />

          <MusicContextMenu />
        </LocalDataProvider>
      ),
    } );
  };

  return <SettingsButton onClick={handleClick} className={styles.settingsButton}/>;
};
