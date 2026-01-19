import { CalendarToday } from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { assertIsDefined } from "$shared/utils/validation";
import { classes } from "#modules/utils/styles";
import { formatDateDDMMYYY } from "#modules/utils/dates";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { PlayerStatus } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { ResourcePlayButtonView } from "#modules/resources/PlayButton/PlayButton";
import { Separator } from "#modules/resources/Separator/Separator";
import { VisibilityTag } from "#modules/ui-kit/VisibilityTag";
import { useLocalData } from "#modules/utils/local-data-context";
import { formatDurationHeader } from "../../utils";
import styles from "../Playlist.module.css";
import { MusicPlaylistEntity } from "../../models";
import { MusicPlaylistSettingsButton } from "../../SettingsButton/Settings";

interface PlaylistHeaderProps {
  totalSongs: number;
  totalDuration: number;
  playlistStatus: PlayerStatus;
  onPlay: ()=> void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistHeader = ( { totalSongs,
  totalDuration,
  playlistStatus,
  onPlay }: PlaylistHeaderProps) => {
  const { data } = useLocalData<MusicPlaylistEntity>();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={styles.playlistHeader}>
      <div className={styles.headerContent}>
        <MusicImageCover
          title={data.name}
          className={styles.playlistCover}
          cover={data.imageCover}
        />

        <div className={styles.playlistInfo}>
          <span className={styles.playlistTitle}>
            <h1>{data.name}</h1>
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
              <VisibilityTag
                isPublic={data.visibility === "public"}
                className={styles.statItem}
              />
            </div>
            <div className={styles.row}>
              <div
                className={classes(styles.statItem)}
                title="Fecha de creación"
              >
                <CalendarToday />
                <span>{formatDateDDMMYYY(data.createdAt)}</span>
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
        <MusicPlaylistSettingsButton
          onEdit={(current, previous)=> {
            if (
              pathname.startsWith(PATH_ROUTES.musics.frontend.playlists.slug.path)
                              && previous.slug !== current.slug) {
              const userSlug = current.ownerUserPublic?.slug;

              assertIsDefined(userSlug);
              router.push(
                PATH_ROUTES.musics.frontend.playlists.slug.withParams( {
                  playlistSlug: current.slug,
                  userSlug,
                } ),
              );
            }
          }}
          onDelete={()=> {
            router.push(PATH_ROUTES.musics.frontend.playlists.path);
          }}
        />
      </div>
    </div>
  );
};
