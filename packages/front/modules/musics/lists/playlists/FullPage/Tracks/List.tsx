import { useRef, useState, useEffect, useMemo, memo } from "react";
import { DndContext, DragOverlay, MeasuringStrategy, closestCenter } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { MusicNote, DragHandle } from "@mui/icons-material";
import { MusicEntityWithUserInfo } from "$shared/models/musics";
import { EmptyList, EmptyListTopIconWrap } from "#modules/resources/EmptyList/EmptyList";
import listItemStyles from "#modules/resources/ListItem/ListItem.module.css";
import { SetState } from "#modules/utils/react";
import { classes } from "#modules/utils/styles";
import { useBulkSelection } from "#modules/musics/musics/BlukEdit/useBulkSelection";
import { BulkEditBar } from "#modules/musics/musics/BlukEdit/BulkEditBar";
import { useMusic } from "#modules/musics/hooks";
import { MusicPlaylistEntity } from "../../models";
import { MusicPlaylistItem } from "./ListItem";
import { SortablePlaylistItem } from "./SortableListItem";
import styles from "./List.module.css";

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

const EmptyPlaylist = memo(()=>{
  return <EmptyList
    top={<EmptyListTopIconWrap><MusicNote /></EmptyListTopIconWrap>}
    label="No hay músicas en esta playlist."
  />;
} );

export const MusicPlaylistTrackList = ( { value,
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
  const selection = useBulkSelection();

  return (
    <>
      <div className={classes(styles.playlistItems, draggable && styles.draggable)}>
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
        <div className={classes(styles.tracksHeader, listItemStyles.sidePadding)}>
          {draggable && <div className={styles.headerDrag}></div>}
          <div className={classes(styles.headerIndex, listItemStyles.leftDiv)}>#</div>
          <div className={styles.headerTitle}>MÚSICA</div>
        </div>

        <div ref={parentRef} style={{
          position: "relative",
        }}>
          {value.list.length === 0 && <EmptyPlaylist />}
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
                {
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
                      selection={selection}
                    />
                  ))
                }
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
                      selection={selection}
                    />
                  </span>
                )
                : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </>
  );
};
