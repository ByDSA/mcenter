import { MusicNote } from "@mui/icons-material";
import { useContextMenuTrigger, ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { useArrayData } from "#modules/utils/array-data-context";
import { PlaylistEntity } from "../Playlist";
import { formatDurationHeader, playlistCopyBackendUrl } from "../utils";
import { SettingsButton } from "../SettingsButton";
import styles from "./Item.module.css";
import { RenamePlaylistContextMenuItem } from "./renameItem";
import { DeletePlaylistContextMenuItem } from "./deleteItem";

interface PlaylistProps {
  value: PlaylistEntity;
  index: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylistListItem = ( { value, index }: PlaylistProps) => {
  const { removeItemByIndex, data, setItemByIndex } = useArrayData<PlaylistEntity>();
  const totalDuration = value.list?.reduce(
    (acc, item) => acc + (item.music.fileInfos[0].mediaInfo.duration ?? 0),
    0,
  ) || 0;
  const totalSongs = value.list?.length || 0;
  const { openMenu, closeMenu } = useContextMenuTrigger();

  return (
    <a className={styles.playlistContainer}
      href={`${window.location.pathname}/${value.slug}`}>
      <div className={styles.playlistCover}>
        {value.coverUrl
          ? (
            <img
              src={value.coverUrl}
              alt={value.name}
              className={styles.playlistCoverImage}
            />
          )
          : (
            <MusicNote className={styles.playlistCoverIcon} />
          )}
      </div>

      <div className={styles.playlistInfo}>
        <h1 className={styles.playlistTitle} title={value.name}><span>{value.name}</span></h1>

        <div className={styles.playlistStats}>
          <div className={styles.statItem}>
            <span>{totalSongs} canciones</span>
          </div>
          <span className={styles.separator}>•</span>
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
                label="Copiar backend URL"
                onClick={async () => {
                  await playlistCopyBackendUrl( {
                    value,
                  } );
                }}
              />
              <RenamePlaylistContextMenuItem
                value={value}
                setValue={(newPlaylist: PlaylistEntity) => {
                  // Para optimistic case
                  const i = data?.findIndex((d) => d.id === newPlaylist.id);

                  if (i === undefined || i === -1)
                    return;

                  setItemByIndex(i, v=>{
                    return {
                      ...v,
                      name: newPlaylist.name,
                      slug: newPlaylist.slug,
                    };
                  } );
                }}
              />
              <DeletePlaylistContextMenuItem
                value={value}
                onOpen={() => closeMenu()}
                onActionSuccess={() => removeItemByIndex(index)}
                getValue={() => data[index]}
              />
            </>,
          } )}
        />
        </>}
      </div>
    </a>
  );
};
