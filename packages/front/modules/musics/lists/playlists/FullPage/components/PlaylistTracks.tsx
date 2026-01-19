import { useRef, useState, useEffect, useMemo, memo } from "react";
import { DndContext, DragOverlay, MeasuringStrategy, closestCenter } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { MusicNote, DragHandle } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import { SetState } from "#modules/utils/react";
import listItemStyles from "#modules/resources/ListItem/ListItem.module.css";
import { MusicPlaylistItem } from "../PlaylistItem";
import styles from "../Playlist.module.css";
import { MusicPlaylistEntity } from "../../models";
import { SortablePlaylistItem } from "./SortablePlaylistItem";

interface PlaylistTracksProps {
  value: MusicPlaylistEntity;
  setValue: SetState<MusicPlaylistEntity>;
  draggable: boolean;
  // DnD Props pasadas desde el hook
  dndSensors: any;
  onDragStart: (e: any)=> void;
  onDragEnd: (e: any)=> void;
  isDraggingGlobal: boolean;
  activeId: string | null;
  itemIds: string[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const EmptyPlaylist = memo(()=><div className={styles.emptyState}>
  <MusicNote className={styles.emptyStateIcon} />
  <p className={styles.emptyStateText}>
                    No hay canciones en esta playlist
  </p>
</div>);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaylistTracks = ( { value,
  setValue,
  draggable,
  dndSensors,
  onDragStart,
  onDragEnd,
  isDraggingGlobal,
  activeId,
  itemIds }: PlaylistTracksProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [offsetTop, setOffsetTop] = useState(0);

  useEffect(() => {
    if (parentRef.current)
      setOffsetTop(parentRef.current.offsetTop);
  }, []);

  const heightChangingOverscanOffset = 2; // Por compresión de height en widths pequeños
  const fastScrollOverscanOffset = 10;
  const overscan = 2 + heightChangingOverscanOffset + fastScrollOverscanOffset;
  const virtualizer = useWindowVirtualizer( {
    count: value.list.length,
    estimateSize: () => 60,
    overscan,
    scrollMargin: offsetTop,
  } );
  const virtualItems = virtualizer.getVirtualItems();
  const activeIndex = useMemo(
    () => (activeId ? value.list.findIndex((i) => i.id === activeId) : -1),
    [activeId, value.list],
  );

  return (
    <div className={classes(styles.playlistItems, draggable && styles.draggable)}>
      <div className={classes(styles.tracksHeader, listItemStyles.sidePadding)}>
        {draggable && <div className={styles.headerDrag}></div>}
        <div className={classes(styles.headerIndex, listItemStyles.leftDiv)}>#</div>
        <div className={styles.headerTitle}>CANCIÓN</div>
      </div>

      <div ref={parentRef} style={{
        position: "relative",
      }}>
        <DndContext
          sensors={dndSensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          modifiers={[restrictToVerticalAxis]}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.BeforeDragging,
            },
          }}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div
              className={classes(isDraggingGlobal && styles.isDraggingGlobal)}
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {value.list.length > 0
                ? (
                  virtualItems.map((vItem) => (
                    <SortablePlaylistItem
                      key={value.list[vItem.index].id}
                      start={vItem.start}
                      size={vItem.size}
                      item={value.list[vItem.index]}
                      index={vItem.index}
                      draggable={draggable}
                      isDraggingGlobal={isDraggingGlobal}
                      setValue={setValue}
                      value={value}
                      scrollMargin={offsetTop}
                    />
                  ))
                )
                : <EmptyPlaylist />}
            </div>
          </SortableContext>

          <DragOverlay adjustScale={false}>
            {activeId && activeIndex !== -1
              ? (
                <span
                  style={{
                    opacity: 0.8,
                  }}
                >
                  <MusicPlaylistItem
                    playlist={value}
                    setPlaylist={setValue}
                    index={activeIndex}
                    drag={{
                      isDragging: true,
                      isDraggingGlobal: true,
                      element: <div
                        className={classes(styles.dragHandle, styles.isDragging)}
                      >
                        <DragHandle />
                      </div>,
                    }}
                  />
                </span>
              )
              : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
