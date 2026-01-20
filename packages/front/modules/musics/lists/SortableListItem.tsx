import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragHandle } from "@mui/icons-material";
import { ReactNode } from "react";
import { classes } from "#modules/utils/styles";
import styles from "./List.module.css";

interface Props {
  id: string;
  children: (dragHandleProps: {
    element: ReactNode;
    isDragging: boolean;
    isDraggingGlobal: boolean;
  } )=> ReactNode;
  isDraggingGlobal: boolean;
}

export const SortableListItem = ( { id, children, isDraggingGlobal }: Props) => {
  const { attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging } = useSortable( {
    id: id,
    animateLayoutChanges: (args) => defaultAnimateLayoutChanges( {
      ...args,
      wasDragging: true,
    } ),
  } );
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    position: "relative" as const,
    opacity: isDragging ? 0 : 1, // Ocultamos el original mientras se arrastra el overlay
  };
  const dragHandle = (
    <div
      className={classes(styles.dragHandle, isDragging && styles.isDragging)}
      {...attributes}
      {...listeners}
      style={{
        cursor: isDraggingGlobal ? "grabbing" : "grab",
      }}
    >
      <DragHandle />
    </div>
  );

  return (
    <div ref={setNodeRef} style={style} className={classes(styles.sortableItemWrapper)}>
      {children( {
        element: dragHandle,
        isDragging,
        isDraggingGlobal,
      } )}
    </div>
  );
};
