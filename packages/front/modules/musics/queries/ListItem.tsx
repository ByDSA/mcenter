import { assertIsDefined } from "$shared/utils/validation";
import { PATH_ROUTES } from "$shared/routing";
import { useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useArrayData } from "#modules/utils/array-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ResourceEntry";
import { PlayerStatus, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { VisibilityTag } from "#modules/ui-kit/VisibilityTag";
import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import styles from "../playlists/list/Item.module.css";
import { MusicQueryEntity } from "./models";
import { EditQueryContextMenuItem } from "./Edit/ContextMenuItem";
import { DeleteQueryContextMenuItem } from "./Delete/ContextMenuItem";

interface QueryProps {
  index: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicQueryListItem = ( { index }: QueryProps) => {
  const { removeItemByIndex } = useArrayData<MusicQueryEntity>();
  const { data, setData } = useLocalData<MusicQueryEntity>();
  const { openMenu } = useContextMenuTrigger();
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

  const isUserOwner = data.ownerUserId === user.id;

  return <ResourceEntry
    mainTitle={data.name}
    href={PATH_ROUTES.musics.frontend.queries.withParams(data.id)}
    settings={{
      onClick: (e: React.MouseEvent<HTMLElement>) => openMenu( {
        event: e,
        className: styles.contextMenu,
        content: <LocalDataProvider data={data} setData={setData}>
          {isUserOwner && (
            <>
              <EditQueryContextMenuItem />
              <DeleteQueryContextMenuItem
                onActionSuccess={() => removeItemByIndex(index)}
              />
            </>
          )}
        </LocalDataProvider>,
      } ),
    }}
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
