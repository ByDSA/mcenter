import { useMemo } from "react";
import { SetState } from "#modules/utils/react";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { MusicPlaylistEntity } from "../models";
import { usePlaylistPlayer } from "./hooks/usePlaylistPlayer";
import { usePlaylistDragAndDrop } from "./hooks/usePlaylistDragAndDrop";
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
  const { user } = useUser();
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

  return <LocalDataProvider data={value} setData={setValue}>

    <div className={styles.playlistContainer}>
      <PlaylistHeader
        totalSongs={totalSongs}
        totalDuration={totalDuration}
        playlistStatus={playlistStatus}
        onPlay={handlePlayPlaylist}
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
  </LocalDataProvider>;
};
