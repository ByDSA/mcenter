import { Code } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { MusicImageCover } from "#modules/musics/MusicCover";
import { PlayerStatus, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { useImageCover } from "#modules/image-covers/hooks";
import { useLocalData } from "#modules/utils/local-data-context";
import { VisibilityTag } from "#modules/resources/FullPage/VisibilityTag";
import { classes } from "#modules/utils/styles";
import { DateTag } from "#modules/resources/FullPage/DateTag/DateTag";
import { HeaderList } from "#modules/resources/FullPage/HeaderList";
import { ResourceFullPage } from "#modules/resources/FullPage/FullPage/FullPage";
import { MusicSmartPlaylistEntity } from "../models";
import { MusicSmartPlaylistSettingsButton } from "../SettingsButton/Settings";
import styles from "./styles.module.css";

export const MusicSmartPlaylistFullPage = () => {
  const { data } = useLocalData<MusicSmartPlaylistEntity>();
  const playerStatus = useBrowserPlayer((s) => s.status);
  const queryPlaying = useBrowserPlayer((s) => s.query);
  const { data: imageCover } = useImageCover(data.imageCoverId ?? null);
  const router = useRouter();
  let status: PlayerStatus = "stopped";

  if (queryPlaying === data.query)
    status = playerStatus === "playing" ? "playing" : "paused";

  const handlePlay = async () => {
    const player = useBrowserPlayer.getState();

    if (player.status === "stopped")
      await player.playSmartPlaylist(data.query);
    else if (player.status === "paused")
      player.resume();
    else
      player.pause();
  };
  const infoItems = [
    <span key="type" title="Smart Playlist">Smart Playlist</span>,
    <VisibilityTag key="visibility" isPublic={data.visibility === "public"} />,
    <DateTag key="date" date={data.createdAt} />,
  ];

  return (
    <ResourceFullPage>
      <HeaderList
        title={data.name}
        cover={<MusicImageCover
          title={data.name}
          cover={imageCover}
        />}
        onPlay={handlePlay}
        playStatus={status}
        settings={
          <MusicSmartPlaylistSettingsButton
            onDelete={() => router.push(PATH_ROUTES.musics.frontend.playlists.path)}
          />
        }
        info={infoItems}
      />

      <div className={classes(styles.body)}>
        <h3 className={styles.queryTitle}><Code /> Query</h3>
        <p className={styles.queryText}>{makeReadableQuery(data.query)}</p>
      </div>
    </ResourceFullPage>
  );
};

function makeReadableQuery(query: string) {
  return query.replaceAll("*", " * ")
    .replaceAll("|", " | ")
    .replaceAll("(", "( ")
    .replaceAll(")", " )");
}
