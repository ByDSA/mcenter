import { assertIsDefined } from "$shared/utils/validation";
import { PATH_ROUTES } from "$shared/routing";
import { MusicUserListResourceItem } from "$shared/models/musics/users-lists";
import { useArrayData } from "#modules/utils/array-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceEntry, ResourceSubtitle } from "#modules/resources/ListItem/ResourceEntry";
import { PlayerStatus, useBrowserPlayer } from "#modules/player/browser/MediaPlayer/BrowserPlayerContext";
import { VisibilityTag } from "#modules/ui-kit/VisibilityTag";
import { useLocalData } from "#modules/utils/local-data-context";
import { formatDurationHeader } from "../utils";
import { MusicPlaylistEntity } from "../models";
import { MusicPlaylistSettingsButton } from "../SettingsButton/Settings";
import styles from "./ListItem.module.css";

interface PlaylistProps {
  index: number;
  drag?: Parameters<typeof ResourceEntry>[0]["drag"];
}

export const MusicPlaylistListItem = ( { index, drag }: PlaylistProps) => {
  const { removeItemByIndex } = useArrayData<MusicUserListResourceItem>();
  const { data } = useLocalData<MusicPlaylistEntity>();
  const totalDuration = data.list?.reduce(
    (acc, item) => acc + (item.music?.fileInfos?.[0].mediaInfo.duration ?? 0),
    0,
  ) || 0;
  const totalSongs = data.list?.length || 0;
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
    settings={<MusicPlaylistSettingsButton
      onDelete={() => removeItemByIndex(index)}
    />}

    subtitle={<ResourceSubtitle items={[{
      text: `${totalSongs} músicas`,
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
    drag={drag}
  />;
};
