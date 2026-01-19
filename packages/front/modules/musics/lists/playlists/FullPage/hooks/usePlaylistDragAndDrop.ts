import { useState, useMemo } from "react";
import { useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { FetchApi } from "#modules/fetching/fetch-api";
import { SetState } from "#modules/utils/react";
import { MusicPlaylistsApi } from "../../requests";
import { MusicPlaylistEntity } from "../../models";

export const usePlaylistDragAndDrop = (
  value: MusicPlaylistEntity,
  setValue: SetState<MusicPlaylistEntity>,
) => {
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingMotions, setPendingMotions] = useState<{ oldIndex: number;
newIndex: number; }[]>([]);
  const api = FetchApi.get(MusicPlaylistsApi);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0,
        delay: 0,
      },
    } ),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    } ),
  );
  const handleDragStart = (event: any) => {
    setIsDraggingGlobal(true);
    setActiveId(event.active.id);
  };
  const handleDragEnd = async (event: any) => {
    setIsDraggingGlobal(false);
    setActiveId(null);
    const { active, over } = event;

    if (!over || active.id === over.id)
      return;

    const oldIndex = value.list.findIndex((e) => e.id === active.id);
    const newIndex = value.list.findIndex((e) => e.id === over.id);
    // Actualización Optimista
    const newArray = arrayMove(value.list, oldIndex, newIndex);

    setValue( {
      ...value,
      list: newArray,
    } );

    // Gestión de API y Cola de Movimientos
    const motionsToDo = [...pendingMotions, {
      oldIndex,
      newIndex,
    }];
    let lastResult: Awaited<ReturnType<typeof api.moveOneTrack>>["data"] | null = null;

    try {
      while (motionsToDo.length > 0) {
        const currentMotion = motionsToDo[0];
        const res = await api.moveOneTrack(
          value.id,
          value.list[currentMotion.oldIndex].id,
          currentMotion.newIndex,
        );

        lastResult = res.data;
        motionsToDo.shift(); // Eliminar el procesado
      }
    } catch (error) {
      console.error("Error moving track", error);
      setPendingMotions(motionsToDo); // Guardar los pendientes para reintentar o manejar error
      // Aquí podrías considerar revertir el estado si falla drásticamente
    }

    // Sincronización final si todo salió bien
    if (motionsToDo.length === 0 && lastResult) {
      const res = await api.getManyByCriteria( {
        filter: {
          id: value.id,
        },
        expand: ["musics"],
      } );

      // Aseguramos el tipo antes de setear
      if (res.data[0])
        setValue(res.data[0]);
    }
  };
  const itemIds = useMemo(() => value.list.map((item) => item.id), [value.list]);

  return {
    sensors,
    handleDragStart,
    handleDragEnd,
    isDraggingGlobal,
    activeId,
    itemIds,
  };
};
