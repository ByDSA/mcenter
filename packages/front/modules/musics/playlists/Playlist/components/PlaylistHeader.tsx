import { CalendarToday, Public, PublicOff } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import { formatDateDDMMYYY } from "#modules/utils/dates";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { PlayButtonView } from "#modules/player/browser/MediaPlayer/PlayButtonView";
import { PlayerStatus } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { formatDurationHeader } from "../../utils";
import styles from "../Playlist.module.css";
import commonStyles from "../../common.module.css";
import { PlaylistEntity } from "../types";
import { SettingsButton } from "../../SettingsButton";

interface PlaylistHeaderProps {
  value: PlaylistEntity;
  totalSongs: number;
  totalDuration: number;
  playlistStatus: PlayerStatus;
  onPlay: ()=> void;
  onMoreOptions: (e: React.MouseEvent<HTMLElement>)=> void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistHeader = ( { value,
  totalSongs,
  totalDuration,
  playlistStatus,
  onPlay,
  onMoreOptions }: PlaylistHeaderProps) => {
  return (
    <div className={styles.playlistHeader}>
      <div className={styles.headerContent}>
        <MusicImageCover
          img={{
            alt: value.name,
            url: value.coverUrl,
          }}
          className={styles.playlistCover}
        />

        <div className={styles.playlistInfo}>
          <span className={styles.playlistTitle}>
            <h1>{value.name}</h1>
          </span>

          <div className={styles.playlistStats}>
            <div className={styles.row}>
              <div className={styles.statItem}>
                <span>{totalSongs} {totalSongs === 1 ? "canción" : "canciones"}</span>
              </div>
              <span className={commonStyles.separator}>•</span>
              <div className={styles.statItem}>
                <span>{formatDurationHeader(totalDuration)}</span>
              </div>
              <span className={commonStyles.separator}>•</span>
              <span
                className={classes(styles.statItem, styles.visibility)}
                title={value.visibility === "public" ? "Playlist pública" : "Playlist privada"}
              >{value.visibility === "public" ? <Public /> : <PublicOff /> }</span>
            </div>
            <div className={styles.row}>
              <div
                className={classes(styles.statItem)}
                title="Fecha de creación"
              >
                <CalendarToday />
                <span>{formatDateDDMMYYY(value.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.playlistControls}>
        <PlayButtonView
          theme="blue"
          className={styles.playAllButton}
          onClick={onPlay}
          disabled={totalSongs === 0}
          status={playlistStatus}
        />
        <SettingsButton theme="dark" onClick={onMoreOptions} />
      </div>
    </div>
  );
};
