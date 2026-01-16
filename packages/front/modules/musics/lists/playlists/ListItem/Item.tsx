import { assertIsDefined } from "$shared/utils/validation";
import { PATH_ROUTES } from "$shared/routing";
import { MusicUserListResourceItem } from "$shared/models/musics/users-lists";
import { useContextMenuTrigger, ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useArrayData } from "#modules/utils/array-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ResourceEntry";
import { PlayerStatus, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { VisibilityTag } from "#modules/ui-kit/VisibilityTag";
import { LocalDataProvider, useLocalData } from "#modules/utils/local-data-context";
import { formatDurationHeader, playlistCopySlugUrl } from "../utils";
import { MusicPlaylistEntity } from "../models";
import { EditPlaylistContextMenuItem } from "../Edit/ContextMenuItem";
import { DeletePlaylistContextMenuItem } from "../Delete/ContextMenuItem";
import styles from "./Item.module.css";

interface PlaylistProps {
  index: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylistListItem = ( { index }: PlaylistProps) => {
  const { removeItemByIndex } = useArrayData<MusicUserListResourceItem>();
  const { data, setData } = useLocalData<MusicPlaylistEntity>();
  const totalDuration = data.list?.reduce(
    (acc, item) => acc + (item.music?.fileInfos?.[0].mediaInfo.duration ?? 0),
    0,
  ) || 0;
  const totalSongs = data.list?.length || 0;
  const { openMenu } = useContextMenuTrigger();
  const { user } = useUser();

  assertIsDefined(user);
  const userSlug = data.ownerUserPublic?.slug;

  assertIsDefined(userSlug);

  const playerStatus = useBrowserPlayer(s=>s.status);
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  let status: PlayerStatus = "stopped";

  if (currentResource?.playlistId === data.id) {
    if (playerStatus === "playing")
      status = "playing";
    else
      status = "paused";
  }

  const isPublic = data.visibility === "public";
  const isUserOwner = data.ownerUserId === user.id;

  return <ResourceEntry
    mainTitle={data.name}
    href={PATH_ROUTES.musics.frontend.playlists.withParams( {
      playlistId: data.id,
    } )}
    settings={{
      onClick: (e: React.MouseEvent<HTMLElement>)=>openMenu( {
        event: e,
        content: <LocalDataProvider data={data} setData={setData}>
          <ContextMenuItem
            label="Copiar enlace"
            onClick={async () => {
              assertIsDefined(data.ownerUserPublic);
              await playlistCopySlugUrl( {
                userSlug: data.ownerUserPublic.slug,
                playlistSlug: data.slug,
                token: user.id,
              } );
            }}
          />
          {isUserOwner && <>
            <EditPlaylistContextMenuItem />
            <DeletePlaylistContextMenuItem
              onActionSuccess={() => removeItemByIndex(index)}
            />
          </>
          }
        </LocalDataProvider>,
      } ),
    }}

    subtitle={<ResourceSubtitle items={[{
      text: `${totalSongs} canciones`,
    }, {
      text: formatDurationHeader(totalDuration),
    }, {
      text: isPublic ? "Lista pública" : "Lista privada",
      customContent: <VisibilityTag isPublic={isPublic} iconClassName={styles.visibility}/>,
    },
    ...(isPublic && !isUserOwner
      ? [{
        text: data.ownerUserPublic?.publicName ?? "(User)",
      }]
      : [] as any),
    ]}
    />}
    imageCover={data.imageCover}
    play={{
      onClick: async ()=> {
        if (status === "stopped") {
          const { playPlaylist } = useBrowserPlayer.getState();

          await playPlaylist( {
            playlist: data,
            ownerSlug: data.ownerUser?.slug,
          } );
        } else if (status === "playing")
          useBrowserPlayer.getState().pause();
        else if (status === "paused")
          useBrowserPlayer.getState().resume();
      },
      status,
    }}
  />;
};
