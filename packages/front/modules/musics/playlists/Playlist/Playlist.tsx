import { useMemo } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { SetState } from "#modules/utils/resources/useCrud";
import { ContextMenuItem } from "../../../ui-kit/ContextMenu/ContextMenu";
import { RenamePlaylistContextMenuItem } from "../list/renameMenuItem";
import { DeletePlaylistContextMenuItem } from "../list/deleteItem";
import { PlaylistEntity } from "./types";
import { usePlaylistPlayer } from "./hooks/usePlaylistPlayer";
import { usePlaylistDragAndDrop } from "./hooks/usePlaylistDragAndDrop";
import { usePlaylistMenu } from "./hooks/usePlaylistMenu";
import { PlaylistHeader } from "./components/PlaylistHeader";
import { PlaylistTracks } from "./components/PlaylistTracks";
import styles from "./Playlist.module.css";

interface PlaylistProps {
  value: PlaylistEntity;
  setValue: SetState<PlaylistEntity>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylist = ( { value, setValue }: PlaylistProps) => {
  const { playlistStatus, handlePlayPlaylist } = usePlaylistPlayer(value);
  const { sensors,
    handleDragStart,
    handleDragEnd,
    isDraggingGlobal,
    activeId,
    itemIds } = usePlaylistDragAndDrop(value, setValue);
  const { user,
    openMenu,
    closeMenu,
    copyLink,
    navigateToRenamed,
    handleDeleteSuccess } = usePlaylistMenu(value);
  const totalDuration = useMemo(
    () => value.list?.reduce(
      (acc, e) => acc + (e.music.fileInfos[0].mediaInfo.duration ?? 0),
      0,
    ) ?? 0,
    [value.list],
  );
  const totalSongs = useMemo(() => value.list?.length ?? 0, [value.list]);
  const draggable = useMemo(()=>value.ownerUserId === user?.id, [value.ownerUserId]);
  const handleMoreOptions = (e: React.MouseEvent<HTMLElement>) => {
    openMenu( {
      event: e,
      content: (
        <>
          {user?.id === value.ownerUserId && (
            <RenamePlaylistContextMenuItem
              className={styles.contextMenuItem}
              onSuccess={( { previous, current } ) => {
                if (previous.slug !== current.slug) {
                  const userSlug = current.ownerUserPublic?.slug;

                  assertIsDefined(userSlug);
                  navigateToRenamed(current.slug, userSlug);
                }
              }}
              value={value}
              setValue={(v: PlaylistEntity) => {
                setValue( {
                  ...value,
                  name: v.name,
                  slug: v.slug,
                } );
              }}
            />
          )}
          <ContextMenuItem
            label="Copiar enlace"
            className={styles.contextMenuItem}
            onClick={copyLink}
          />
          {user?.id === value.ownerUserId && (
            <DeletePlaylistContextMenuItem
              value={value}
              onOpen={closeMenu}
              onActionSuccess={handleDeleteSuccess}
              getValue={() => value}
            />
          )}
        </>
      ),
    } );
  };

  return (
    <div className={styles.playlistContainer}>
      <PlaylistHeader
        value={value}
        totalSongs={totalSongs}
        totalDuration={totalDuration}
        playlistStatus={playlistStatus}
        onPlay={handlePlayPlaylist}
        onMoreOptions={handleMoreOptions}
      />

      <PlaylistTracks
        value={value}
        setValue={setValue}
        draggable={draggable}
        dndSensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        isDraggingGlobal={isDraggingGlobal}
        activeId={activeId}
        itemIds={itemIds}
      />
    </div>
  );
};
