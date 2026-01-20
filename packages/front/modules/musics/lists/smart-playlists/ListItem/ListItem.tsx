import { assertIsDefined } from "$shared/utils/validation";
import { PATH_ROUTES } from "$shared/routing";
import { useArrayData } from "#modules/utils/array-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ListItem/ResourceEntry";
import { PlayerStatus, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { VisibilityTag } from "#modules/ui-kit/VisibilityTag";
import { useLocalData } from "#modules/utils/local-data-context";
import { MusicSmartPlaylistEntity } from "../models";
import { MusicSmartPlaylistSettingsButton } from "../SettingsButton/Settings";
import styles from "./ListItem.module.css";

type Props = {
  index: number;
  drag?: Parameters<typeof ResourceEntry>[0]["drag"];
};

export const MusicSmartPlaylistListItem = ( { index, drag }: Props) => {
  const { removeItemByIndex } = useArrayData<MusicSmartPlaylistEntity>();
  const { data } = useLocalData<MusicSmartPlaylistEntity>();
  const { user } = useUser();

  assertIsDefined(user);

  const playerStatus = useBrowserPlayer(s => s.status);
  const queryPlaying = useBrowserPlayer(s => s.query);
  let status: PlayerStatus = "stopped";

  if (queryPlaying === data.query) {
    if (playerStatus === "playing")
      status = "playing";
    else
      status = "paused";
  }

  return <ResourceEntry
    mainTitle={data.name}
    href={PATH_ROUTES.musics.frontend.smartPlaylists.withParams(data.id)}
    settings={ <MusicSmartPlaylistSettingsButton
      onDelete={() => removeItemByIndex(index)}
    />}
    subtitle={<ResourceSubtitle items={[{
      text: "Smart Playlist",
    }, {
      text: data.visibility === "public" ? "Pública" : "Privada",
      customContent: <VisibilityTag
        isPublic={data.visibility === "public"}
        iconClassName={styles.visibility}
      />,
    }]}
    />}
    imageCover={data.imageCover}
    play={{
      onClick: async () => {
        if (status === "stopped") {
          const { playSmartPlaylist } = useBrowserPlayer.getState();

          await playSmartPlaylist(data.query);
        } else if (status === "playing")
          useBrowserPlayer.getState().pause();
        else if (status === "paused")
          useBrowserPlayer.getState().resume();
      },
      status,
    }}
    drag={drag}
  />;
};
