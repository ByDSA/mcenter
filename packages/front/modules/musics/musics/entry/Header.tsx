import { Music, MusicEntityWithUserInfo } from "$shared/models/musics";
import { createDurationElement, createWeightElement, HistoryEntryHeader } from "#modules/history";
import { ContextMenuProps } from "#modules/musics/playlists/PlaylistItem";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { FavButton, UpdateFavButtons } from "#modules/musics/playlists/FavButton";
import { useUser } from "#modules/core/auth/useUser";
import { classes } from "#modules/utils/styles";
import styles from "../../../history/entry/Header/styles.module.css";

type HeaderProps = {
  entry: MusicEntityWithUserInfo;
  contextMenu?: ContextMenuProps;
  updateFavButtons: UpdateFavButtons;
};
export function Header( { entry: music, contextMenu, updateFavButtons }: HeaderProps) {
  const { user } = useUser();
  const favoritesPlaylistId = user?.musics.favoritesPlaylistId ?? null;
  const { title } = music;
  const duration = music.fileInfos?.[0]?.mediaInfo.duration;

  return HistoryEntryHeader( {
    left: undefined,
    right: <>
      <span className={styles.columns}>
        <span className={classes(styles.rows, styles.small)}>
          {duration && createDurationElement(duration)}
          {createWeightElement(music.userInfo.weight)}
        </span>
        <span className={styles.rows}>
          {FavButton( {
            className: styles.favButton,
            favoritesPlaylistId,
            updateFavButtons,
            musicId: music.id,
            value: music.isFav,
          } )}
        </span>
        {contextMenu?.onClick
        && <><SettingsButton
          theme="dark"
          onClick={(e: React.MouseEvent<HTMLElement>)=>contextMenu.onClick?.(e)}
        />
        {contextMenu.element}
        </>}
      </span>
    </>,
    title,
    subtitle: createMusicSubtitle(music),
  } );
}

export function createMusicSubtitle(resource: Music) {
  return resource.game ?? resource.artist;
}
