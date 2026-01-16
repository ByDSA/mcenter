import { CalendarToday, Code } from "@mui/icons-material";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { PlayerStatus, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { ResourcePlayButtonView } from "#modules/resources/PlayButton";
import { formatDateDDMMYYY } from "#modules/utils/dates";
import { classes } from "#modules/utils/styles";
import { SettingsButton } from "#modules/musics/playlists/SettingsButton";
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useImageCover } from "#modules/image-covers/hooks";
import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { VisibilityTag } from "#modules/ui-kit/VisibilityTag";
import playlistStyles from "../../playlists/Playlist/Playlist.module.css";
import { MusicQueryEntity } from "../models";
import { EditQueryContextMenuItem } from "../Edit/ContextMenuItem";
import { usePlayQueryModal } from "../PlayQuery/Modal";
import styles from "./styles.module.css";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicQueryFullPage = () => {
  const { data, setData } = useLocalData<MusicQueryEntity>();
  const playerStatus = useBrowserPlayer(s => s.status);
  const queryPlaying = useBrowserPlayer(s => s.query);
  const { openMenu } = useContextMenuTrigger();
  const { data: imageCover } = useImageCover(data.imageCoverId ?? null);
  const { user } = useUser();
  let status: PlayerStatus = "stopped";

  if (queryPlaying === data.query)
    status = playerStatus === "playing" ? "playing" : "paused";

  const handlePlay = async () => {
    const player = useBrowserPlayer.getState();

    if (status === "stopped")
      await player.playQuery(data.query);
    else if (status === "paused")
      player.resume();
    else
      player.pause();
  };
  const playQueryModal = usePlayQueryModal();

  return (
    <div className={playlistStyles.playlistContainer}>
      <div className={playlistStyles.playlistHeader}>
        <div className={playlistStyles.headerContent}>
          <MusicImageCover
            title={data.name}
            className={playlistStyles.playlistCover}
            cover={imageCover}
          />

          <div className={playlistStyles.playlistInfo}>
            <span className={playlistStyles.playlistTitle}>
              <h1>{data.name}</h1>
            </span>

            <div className={playlistStyles.playlistStats}>
              <div className={playlistStyles.row}>
                <VisibilityTag
                  isPublic={data.visibility === "public"}
                  className={playlistStyles.statItem}
                />

              </div>
              <div className={playlistStyles.row}>
                <div
                  className={classes(playlistStyles.statItem)}
                  title="Fecha de creación"
                >
                  <CalendarToday />
                  <span>{formatDateDDMMYYY(data.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={playlistStyles.playlistControls}>
          <ResourcePlayButtonView
            onClick={handlePlay}
            status={status}
          />
          <SettingsButton theme="dark" onClick={(e)=> {
            openMenu( {
              event: e,
              content: <LocalDataProvider data={data!} setData={setData}>
                <ContextMenuItem
                  label="Reproducir modificación"
                  onClick={async ()=> {
                    await playQueryModal.openModal( {
                      initialValue: data.query,
                    } );
                  }}
                />
                {user && <EditQueryContextMenuItem />}
              </LocalDataProvider>,
            } );
          }} />
        </div>
      </div>

      <div className={classes(styles.body)}>
        <h3 className={styles.queryTitle}><Code /> Query</h3>
        <p className={styles.queryText}>{makeReadableQuery(data.query)}</p>
      </div>
    </div>
  );
};

function makeReadableQuery(query: string) {
  return query.replaceAll("*", " * ")
    .replaceAll("|", " | ");
}
