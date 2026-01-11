import { CalendarToday, Public, PublicOff } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import { formatDateDDMMYYY } from "#modules/utils/dates";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { PlayerStatus } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { ResourcePlayButtonView } from "#modules/resources/PlayButton";
import { Separator } from "#modules/resources/Separator";
import { formatDurationHeader } from "../../utils";
import styles from "../Playlist.module.css";
import { SettingsButton } from "../../SettingsButton";
import { MusicPlaylistEntity } from "../../models";

interface PlaylistHeaderProps {
  value: MusicPlaylistEntity;
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
          title={value.name}
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
              <Separator />
              <div className={styles.statItem}>
                <span>{formatDurationHeader(totalDuration)}</span>
              </div>
              <Separator />
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
        <ResourcePlayButtonView
          onClick={onPlay}
          disabled={totalSongs === 0}
          status={playlistStatus}
        />
        <SettingsButton theme="dark" onClick={onMoreOptions} />
      </div>
    </div>
  );
};
