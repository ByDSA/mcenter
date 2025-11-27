import { MusicNote } from "@mui/icons-material";
import { PlaylistEntity } from "../Playlist";
import { formatDurationHeader } from "../utils";
import { SettingsButton } from "../SettingsButton";
import { ContextMenuProps } from "../PlaylistItem";
import styles from "./Item.module.css";

interface PlaylistProps {
  value: PlaylistEntity;
  setValue: (newValue: PlaylistEntity)=> void;
  contextMenu?: ContextMenuProps;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylistListItem = ( { value, contextMenu }: PlaylistProps) => {
  const totalDuration = value.list?.reduce(
    (acc, item) => acc + (item.music.fileInfos[0].mediaInfo.duration ?? 0),
    0,
  ) || 0;
  const totalSongs = value.list?.length || 0;

  return (
    <a className={styles.playlistContainer}
      href={`${window.location.pathname}/${value.slug}`}>
      <div className={styles.playlistCover}>
        {value.coverUrl
          ? (
            <img
              src={value.coverUrl}
              alt={value.name}
              className={styles.playlistCoverImage}
            />
          )
          : (
            <MusicNote className={styles.playlistCoverIcon} />
          )}
      </div>

      <div className={styles.playlistInfo}>
        <h1 className={styles.playlistTitle} title={value.name}><span>{value.name}</span></h1>

        <div className={styles.playlistStats}>
          <div className={styles.statItem}>
            <span>{totalSongs} canciones</span>
          </div>
          <span className={styles.separator}>•</span>
          <div className={styles.statItem}>
            <span>{formatDurationHeader(totalDuration)}</span>
          </div>
        </div>
      </div>
      <div>
        {contextMenu?.onClick
        && <><SettingsButton
          theme="dark"
          className={styles.settingsButton}
          onClick={(e: React.MouseEvent<HTMLElement>)=>contextMenu.onClick?.(e)}
        />
        {contextMenu.element}
        </>}
      </div>
    </a>
  );
};
