import { MusicNote, CalendarToday } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import { formatDateDDMMYYY } from "#modules/utils/dates";
import { PlaylistEntity } from "../Playlist";
import { formatDurationHeader } from "../utils";
import { SettingsButton } from "../SettingsButton";
import styles from "./Item.module.css";

interface PlaylistProps {
  value: PlaylistEntity;
  setValue: (newValue: PlaylistEntity)=> void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylistListItem = ( { value }: PlaylistProps) => {
  const totalDuration = value.list?.reduce(
    (acc, item) => acc + (item.music.fileInfos[0].mediaInfo.duration ?? 0),
    0,
  ) || 0;
  const totalSongs = value.list?.length || 0;
  const handleMoreOptions = () => {
    // Implementar menú de opciones para playlist
  };

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
        <h1 className={styles.playlistTitle}>{value.name}</h1>

        <div className={styles.playlistStats}>
          <div className={styles.statItem}>
            <span>{totalSongs} canciones</span>
          </div>
          <span className={styles.separator}>•</span>
          <div className={styles.statItem}>
            <span>{formatDurationHeader(totalDuration)}</span>
          </div>
          <span className={styles.separator}>•</span>
          <div className={classes(styles.statItem, styles.createdAt)} title="Fecha de creación">
            <CalendarToday />
            <span>{formatDateDDMMYYY(value.createdAt)}</span>
          </div>
        </div>
      </div>
      <div>
        <SettingsButton onClick={handleMoreOptions} />
      </div>
    </a>
  );
};
