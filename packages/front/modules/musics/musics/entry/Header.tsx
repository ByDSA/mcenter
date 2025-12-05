import { Music, MusicEntityWithUserInfo } from "$shared/models/musics";
import { createDurationElement, createWeightElement, HistoryEntryHeader } from "#modules/history";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { FavButton, UpdateFavButtons } from "#modules/musics/playlists/FavButton";
import { useUser } from "#modules/core/auth/useUser";
import { classes } from "#modules/utils/styles";
import { OnClickMenu } from "#modules/musics/history/entry/Header";
import styles from "../../../history/entry/Header/styles.module.css";

type HeaderProps = {
  entry: MusicEntityWithUserInfo;
  onClickMenu?: OnClickMenu;
  updateFavButtons: UpdateFavButtons;
};
export function Header( { entry: music, onClickMenu, updateFavButtons }: HeaderProps) {
  const { user } = useUser();
  const favoritesPlaylistId = user?.musics.favoritesPlaylistId ?? null;
  const { title } = music;
  const duration = music.fileInfos?.[0]?.mediaInfo.duration;

  return HistoryEntryHeader( {
    right: <>
      <span className={styles.columns}>
        <span className={classes(styles.rows, styles.small, styles.info)}>
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
        {onClickMenu
        && <><SettingsButton
          theme="dark"
          onClick={(e: React.MouseEvent<HTMLElement>)=>onClickMenu?.(e)}
        />
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
