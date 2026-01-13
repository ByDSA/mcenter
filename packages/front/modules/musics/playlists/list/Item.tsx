import { assertIsDefined } from "$shared/utils/validation";
import { PATH_ROUTES } from "$shared/routing";
import { useContextMenuTrigger, ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useArrayData } from "#modules/utils/array-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ResourceEntry";
import { PlayerStatus, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { VisibilityTag } from "#modules/ui-kit/VisibilityTag";
import { PlaylistEntity } from "../Playlist/types";
import { formatDurationHeader, playlistCopySlugUrl } from "../utils";
import { MusicPlaylistEntity } from "../models";
import styles from "./Item.module.css";
import { RenamePlaylistContextMenuItem } from "./renameMenuItem";
import { DeletePlaylistContextMenuItem } from "./deleteItem";

interface PlaylistProps {
  value: MusicPlaylistEntity;
  index: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylistListItem = ( { value, index }: PlaylistProps) => {
  const { removeItemByIndex, data, setItemByIndex } = useArrayData<PlaylistEntity>();
  const totalDuration = value.list?.reduce(
    (acc, item) => acc + (item.music?.fileInfos?.[0].mediaInfo.duration ?? 0),
    0,
  ) || 0;
  const totalSongs = value.list?.length || 0;
  const { openMenu, closeMenu } = useContextMenuTrigger();
  const { user } = useUser();

  assertIsDefined(user);
  const userSlug = value.ownerUserPublic?.slug;

  assertIsDefined(userSlug);

  const playerStatus = useBrowserPlayer(s=>s.status);
  const currentResource = useBrowserPlayer(s=>s.currentResource);
  let status: PlayerStatus = "stopped";

  if (currentResource?.playlistId === value.id) {
    if (playerStatus === "playing")
      status = "playing";
    else
      status = "paused";
  }

  const isPublic = value.visibility === "public";
  const isUserOwner = value.ownerUserId === user.id;

  return <ResourceEntry
    mainTitle={value.name}
    href={PATH_ROUTES.musics.frontend.playlists.withParams( {
      playlistId: value.id,
    } )}
    settings={{
      onClick: (e: React.MouseEvent<HTMLElement>)=>openMenu( {
        event: e,
        className: styles.contextMenu,
        content: <>
          <ContextMenuItem
            label="Copiar enlace"
            onClick={async () => {
              assertIsDefined(value.ownerUserPublic);
              await playlistCopySlugUrl( {
                userSlug: value.ownerUserPublic.slug,
                playlistSlug: value.slug,
                token: user.id,
              } );
            }}
          />
          {isUserOwner && <><RenamePlaylistContextMenuItem
            value={value}
            setValue={(newPlaylist: PlaylistEntity) => {
            // Para optimistic case
              const i = data?.findIndex((d) => d.id === newPlaylist.id);

              if (i === undefined || i === -1)
                return;

              setItemByIndex(i, v=>{
                if (v) {
                  return {
                    ...v,
                    name: newPlaylist.name,
                    slug: newPlaylist.slug,
                  };
                }
              } );
            }}
          />
          <DeletePlaylistContextMenuItem
            value={value}
            onOpen={() => closeMenu()}
            onActionSuccess={() => removeItemByIndex(index)}
            getValue={() => data[index]}
          />
          </>
          }
        </>,
      } ),
    }}

    subtitle={<ResourceSubtitle items={[{
      text: `${totalSongs} canciones`,
    }, {
      text: formatDurationHeader(totalDuration),
    }, {
      text: isPublic ? "Lista pública" : "Lista privada",
      customContent: <VisibilityTag isPublic={isPublic} className={styles.visibility}/>,
    },
    ...(isPublic && !isUserOwner
      ? [{
        text: value.ownerUserPublic?.publicName ?? "AA",
      }]
      : [] as any),
    ]}
    />}
    imageCover={null}
    play={{
      onClick: async ()=> {
        if (status === "stopped") {
          const { playPlaylist } = useBrowserPlayer.getState();

          await playPlaylist( {
            playlist: value,
            ownerSlug: value.ownerUser?.slug,
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
