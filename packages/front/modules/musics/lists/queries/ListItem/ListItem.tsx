import { assertIsDefined } from "$shared/utils/validation";
import { PATH_ROUTES } from "$shared/routing";
import { useArrayData } from "#modules/utils/array-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ListItem/ResourceEntry";
import { PlayerStatus, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { VisibilityTag } from "#modules/ui-kit/VisibilityTag";
import { useLocalData } from "#modules/utils/local-data-context";
import { MusicQueryEntity } from "../models";
import { MusicQuerySettingsButton } from "../SettingsButton/Settings";
import styles from "./ListItem.module.css";

interface QueryProps {
  index: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicQueryListItem = ( { index }: QueryProps) => {
  const { removeItemByIndex } = useArrayData<MusicQueryEntity>();
  const { data } = useLocalData<MusicQueryEntity>();
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
    href={PATH_ROUTES.musics.frontend.queries.withParams(data.id)}
    settings={ <MusicQuerySettingsButton
      onDelete={() => removeItemByIndex(index)}
    />}
    subtitle={<ResourceSubtitle items={[{
      text: "Query",
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
          const { playQuery } = useBrowserPlayer.getState();

          await playQuery(data.query);
        } else if (status === "playing")
          useBrowserPlayer.getState().pause();
        else if (status === "paused")
          useBrowserPlayer.getState().resume();
      },
      status,
    }}
  />;
};
