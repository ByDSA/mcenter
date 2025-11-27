import { MusicEntityWithUserInfo } from "$shared/models/musics";
import { MusicHistoryEntryEntity } from "#modules/musics/history/models";
import { createHistoryTimeElement, createWeightElement, HistoryEntryHeader } from "#modules/history";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { ContextMenuProps } from "#modules/musics/playlists/PlaylistItem";
import { FavButton, UpdateFavButtons } from "#modules/musics/playlists/FavButton";
import { useUser } from "#modules/core/auth/useUser";
import { classes } from "#modules/utils/styles";
import headerStyles from "../../../history/entry/Header/styles.module.css";
import styles from "../../../history/entry/Header/styles.module.css";

type HeaderProps = {
  entry: Omit<MusicHistoryEntryEntity, "resource"> & {
    resource: MusicEntityWithUserInfo;
  };
  contextMenu?: ContextMenuProps;
  updateFavButtons: UpdateFavButtons;
};
export function Header( { entry, contextMenu, updateFavButtons }: HeaderProps) {
  const { user } = useUser();
  const favoritesPlaylistId = user?.musics.favoritesPlaylistId ?? null;
  const { resource } = entry;
  const { title } = resource;
  const subtitle = resource.game ?? resource.artist;
  const timeStampDate = new Date(entry.date.timestamp * 1000);

  return HistoryEntryHeader( {
    left: <>
      <span className={classes(headerStyles.rows, headerStyles.small)}>

      </span>
    </>,
    title,
    subtitle,
    right: <>
      <span className={headerStyles.columns}>
        <span className={classes(headerStyles.rows, headerStyles.small)}>
          {createHistoryTimeElement(timeStampDate)}
          {createWeightElement(resource.userInfo.weight) }
        </span>
        <span className={styles.rows}>
          {FavButton( {
            className: styles.favButton,
            favoritesPlaylistId,
            musicId: entry.resource.id,
            value: entry.resource.isFav,
            updateFavButtons,
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
  } );
}
