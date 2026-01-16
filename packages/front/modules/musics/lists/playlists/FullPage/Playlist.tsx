import { useMemo } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { usePathname } from "next/navigation";
import { PATH_ROUTES } from "$shared/routing";
import { SetState } from "#modules/utils/resources/useCrud";
import { ContextMenuItem } from "../../../../ui-kit/ContextMenu/ContextMenu";
import { EditPlaylistContextMenuItem } from "../Edit/ContextMenuItem";
import { DeletePlaylistContextMenuItem } from "../Delete/ContextMenuItem";
import { MusicPlaylistEntity } from "../models";
import { usePlaylistPlayer } from "./hooks/usePlaylistPlayer";
import { usePlaylistDragAndDrop } from "./hooks/usePlaylistDragAndDrop";
import { usePlaylistMenu } from "./hooks/usePlaylistMenu";
import { PlaylistHeader } from "./components/PlaylistHeader";
import { PlaylistTracks } from "./components/PlaylistTracks";
import styles from "./Playlist.module.css";

interface PlaylistProps {
  value: MusicPlaylistEntity;
  setValue: SetState<MusicPlaylistEntity>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MusicPlaylistFullPage = ( { value, setValue }: PlaylistProps) => {
  const { playlistStatus, handlePlayPlaylist } = usePlaylistPlayer(value);
  const { sensors,
    handleDragStart,
    handleDragEnd,
    isDraggingGlobal,
    activeId,
    itemIds } = usePlaylistDragAndDrop(value, setValue);
  const { user,
    openMenu,
    copyLink,
    navigateToRenamed,
    handleDeleteSuccess } = usePlaylistMenu(value);
    // TODO: duration
  // const musicIds = value.list.map(e=>e.musicId);
  // const usingMusics = useMusics(musicIds);
  // const totalDuration = useMemo(
  //   () => usingMusics.data.reduce(
  //     (acc, e) => acc + (e?.fileInfos?.[0].mediaInfo.duration ?? 0),
  //     0,
  //   ) ?? 0,
  //   [usingMusics.data],
  // );
  const totalDuration = 0;
  const totalSongs = useMemo(() => value.list?.length ?? 0, [value.list]);
  const draggable = useMemo(()=>value.ownerUserId === user?.id, [value.ownerUserId]);
  const pathname = usePathname();
  const handleMoreOptions = (e: React.MouseEvent<HTMLElement>) => {
    openMenu( {
      event: e,
      content: (
        <>
          {user?.id === value.ownerUserId && (
            <EditPlaylistContextMenuItem
              className={styles.contextMenuItem}
              onSuccess={( { previous, current } ) => {
                if (
                  pathname.startsWith(PATH_ROUTES.musics.frontend.playlists.slug.path)
                    && previous.slug !== current.slug) {
                  const userSlug = current.ownerUserPublic?.slug;

                  assertIsDefined(userSlug);
                  navigateToRenamed(current.slug, userSlug);
                }
              }}
              value={value}
              setValue={(v: MusicPlaylistEntity) => {
                setValue( {
                  ...value,
                  name: v.name,
                  slug: v.slug,
                  imageCoverId: v.imageCoverId,
                  imageCover: v.imageCover,
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
              onActionSuccess={handleDeleteSuccess}
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
