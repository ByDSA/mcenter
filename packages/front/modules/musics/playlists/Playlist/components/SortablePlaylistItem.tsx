import { memo } from "react";
import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragHandle } from "@mui/icons-material";
import { classes } from "#modules/utils/styles";
import { SetState } from "#modules/utils/resources/useCrud";
import { MusicPlaylistItem } from "../../PlaylistItem";
import styles from "../Playlist.module.css";
import { MusicPlaylistEntity } from "../../models";

interface Props {
  item: MusicPlaylistEntity["list"][0];
  index: number;
  start: number;
  size: number;
  value: MusicPlaylistEntity;
  setValue: SetState<MusicPlaylistEntity>;
  draggable: boolean;
  isDraggingGlobal: boolean;
  scrollMargin: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SortablePlaylistItem = memo(( { item,
  index,
  start,
  size,
  value,
  setValue,
  draggable,
  isDraggingGlobal,
  scrollMargin }: Props) => {
  const { attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition } = useSortable( {
    id: item.id,
    animateLayoutChanges: (args) => defaultAnimateLayoutChanges( {
      ...args,
      wasDragging: true,
    } ),
  } );
  const style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: `${size}px`,
    transform: CSS.Transform.toString(transform),
    translate: `0 ${start - scrollMargin}px`,
    transition,
    zIndex: isDragging ? 999 : 1,
    willChange: "transform",
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? "hidden" : "visible",
  };

  return (
    <div
      ref={setNodeRef}
      className={classes(styles.sortableItemWrapper)}
      style={style}
    >
      <MusicPlaylistItem
        playlist={value}
        setPlaylist={setValue}
        index={index}
        drag={
          draggable
            ? {
              isDragging,
              isDraggingGlobal,
              element: (
                <div
                  className={classes(styles.dragHandle, isDragging && styles.isDragging)}
                  {...attributes}
                  {...listeners}
                >
                  <DragHandle />
                </div>
              ),
            }
            : undefined
        }
      />
    </div>
  );
} );
