import { useMemo } from "react";
import { MusicEntityWithUserInfo } from "$shared/models/musics";
import { SetState } from "#modules/utils/react";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceFullPage } from "#modules/resources/FullPage/FullPage/FullPage";
import { useBulkSelection } from "#modules/musics/musics/BlukEdit/useBulkSelection";
import { BulkEditBar } from "#modules/musics/musics/BlukEdit/BulkEditBar";
import { useMusic } from "#modules/musics/hooks";
import { MusicPlaylistEntity } from "../models";
import { usePlaylistPlayer } from "./hooks/usePlaylistPlayer";
import { usePlaylistDragAndDrop } from "./hooks/usePlaylistDragAndDrop";
import { PlaylistHeader } from "./Header";
import { MusicPlaylistTrackList } from "./Tracks/List";

interface PlaylistProps {
  value: MusicPlaylistEntity;
  setValue: SetState<MusicPlaylistEntity>;
}

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
  //     (acc, e) => acc + (
  // getFirstAvailableFileInfoOrFirst(e?.fileInfos)?.mediaInfo.duration ?? 0
  // ),
  //     0,
  //   ) ?? 0,
  //   [usingMusics.data],
  // );
  const totalDuration = 0;
  const totalSongs = useMemo(() => value.list?.length ?? 0, [value.list]);
  const draggable = useMemo(() => value.ownerUserId === user?.id, [value.ownerUserId]);
  const selection = useBulkSelection();

  return <LocalDataProvider data={value} setData={setValue}>

    <ResourceFullPage>
      <PlaylistHeader
        totalSongs={totalSongs}
        totalDuration={totalDuration}
        playlistStatus={playlistStatus}
        onPlay={handlePlayPlaylist}
      />

      <BulkEditBar
        isBulkMode={selection.isBulkMode}
        onActivate={selection.activateBulkMode}
        count={selection.count}
        onClear={selection.clear}
        getSelectedMusics={() => [...selection.selectedIds]
          .map((id) => useMusic.getCache(id))
          .filter(Boolean) as MusicEntityWithUserInfo[]
        }
      />

      <MusicPlaylistTrackList
        value={value}
        setValue={setValue}
        draggable={draggable}
        dndSensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        isDraggingGlobal={isDraggingGlobal}
        activeId={activeId}
        itemIds={itemIds}
        selection={selection}
      />
    </ResourceFullPage>
  </LocalDataProvider>;
};
