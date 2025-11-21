import { Music, MusicEntityWithUserInfo } from "$shared/models/musics";
import { createDurationElement, createWeightElement, HistoryEntryHeader } from "#modules/history";
import { ContextMenuProps } from "#modules/musics/playlists/PlaylistItem";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import styles from "./Header.module.css";

type HeaderProps = {
  entry: MusicEntityWithUserInfo;
  contextMenu?: ContextMenuProps;
};
export function Header( { entry, contextMenu }: HeaderProps) {
  const resource = entry;
  const { title } = resource;
  const duration = resource.fileInfos?.[0]?.mediaInfo.duration;

  return HistoryEntryHeader( {
    left: undefined,
    right: <>
      <span className={styles.columns}>
        <span className={styles.rows}>
          {duration && createDurationElement(duration)}
          {createWeightElement(resource.userInfo.weight)}
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
    subtitle: createMusicSubtitle(resource),
  } );
}

export function createMusicSubtitle(resource: Music) {
  return resource.game ?? resource.artist;
}
