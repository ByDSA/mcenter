import { assertIsDefined } from "$shared/utils/validation";
import { PATH_ROUTES } from "$shared/routing";
import { useRouter } from "next/navigation";
import { useContextMenuTrigger, ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useArrayData } from "#modules/utils/array-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { frontendUrl } from "#modules/requests";
import { Separator } from "#modules/resources/Separator";
import { PlaylistEntity } from "../Playlist/types";
import { formatDurationHeader, playlistCopySlugUrl } from "../utils";
import { SettingsButton } from "../SettingsButton";
import { MusicImageCover } from "../../MusicCover";
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
  const userSlug = value.ownerUserPublic?.slug;
  const router = useRouter();

  assertIsDefined(userSlug);

  return (
    <a
      className={styles.playlistContainer}
      onClick={()=> {
        router.push(
          frontendUrl(PATH_ROUTES.musics.frontend.playlists.withParams( {
            playlistId: value.id,
          } )),
        );
      }}
    >
      <MusicImageCover
        className={styles.playlistCover}
        title={value.name}
      />

      <div className={styles.playlistInfo}>
        <h1 className={styles.playlistTitle} title={value.name}><span>{value.name}</span></h1>

        <div className={styles.playlistStats}>
          <div className={styles.statItem}>
            <span>{totalSongs} canciones</span>
          </div>
          <Separator />
          <div className={styles.statItem}>
            <span>{formatDurationHeader(totalDuration)}</span>
          </div>
        </div>
      </div>
      <div>
        {<><SettingsButton
          theme="dark"
          className={styles.settingsButton}
          onClick={(e: React.MouseEvent<HTMLElement>)=>openMenu( {
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
                    token: user?.id,
                  } );
                }}
              />
              {user?.id === value.ownerUserId && <><RenamePlaylistContextMenuItem
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
          } )}
        />
        </>}
      </div>
    </a>
  );
};
