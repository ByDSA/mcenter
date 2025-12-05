import { MusicEntityWithUserInfo } from "$shared/models/musics";
import { MusicHistoryEntryEntity } from "#modules/musics/history/models";
import { createHistoryTimeElement, createWeightElement, HistoryEntryHeader } from "#modules/history";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { FavButton, UpdateFavButtons } from "#modules/musics/playlists/FavButton";
import { useUser } from "#modules/core/auth/useUser";
import { classes } from "#modules/utils/styles";
import headerStyles from "../../../history/entry/Header/styles.module.css";
import styles from "../../../history/entry/Header/styles.module.css";

export type OnClickMenu = (e: React.MouseEvent<HTMLElement>)=> void;

type HeaderProps = {
  entry: Omit<MusicHistoryEntryEntity, "resource"> & {
    resource: MusicEntityWithUserInfo;
  };
  onClickMenu?: (e: React.MouseEvent<HTMLElement>)=> void;
  updateFavButtons: UpdateFavButtons;
};
export function Header( { entry, onClickMenu, updateFavButtons }: HeaderProps) {
  const { user } = useUser();
  const favoritesPlaylistId = user?.musics.favoritesPlaylistId ?? null;
  const { resource } = entry;
  const { title } = resource;
  const subtitle = resource.game ?? resource.artist;
  const timeStampDate = new Date(entry.date.timestamp * 1000);

  return HistoryEntryHeader( {
    title,
    subtitle,
    right: <>
      <span className={headerStyles.columns}>
        <span className={classes(headerStyles.rows, headerStyles.small, headerStyles.info)}>
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
        {onClickMenu
              && <><SettingsButton
                theme="dark"
                onClick={(e: React.MouseEvent<HTMLElement>)=>onClickMenu?.(e)}
              />
              </>}
      </span>
    </>,
  } );
}
