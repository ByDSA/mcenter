import { useState, useMemo } from "react";
import { useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { MusicUserListsCrudDtos } from "$shared/models/musics/users-lists/dto/transport";
import { SetState } from "#modules/utils/react";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicUsersListsApi } from "./users-lists/requests";

type Data = NonNullable<MusicUserListsCrudDtos.GetMyList.Response["data"]>;

export const useListsDragAndDrop = (
  data: Data | null,
  setData: SetState<Data | null>,
) => {
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Pequeño retraso para evitar drag accidental al hacer click
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

    if (!over || active.id === over.id || !data)
      return;

    const oldIndex = data.list.findIndex((e) => e.id === active.id);
    const newIndex = data.list.findIndex((e) => e.id === over.id);
    // Actualización Optimista
    const newArray = arrayMove(data.list, oldIndex, newIndex);

    setData((old) => {
      if (!old)
        return old;

      return {
        ...old,
        list: newArray,
      };
    } );

    const api = FetchApi.get(MusicUsersListsApi);

    await api.moveOneList( {
      entryId: data.list[oldIndex].id,
      newIndex,
    } );
  };
  const itemIds = useMemo(() => data?.list.map((item) => item.id) ?? [], [data]);

  return {
    sensors,
    handleDragStart,
    handleDragEnd,
    isDraggingGlobal,
    activeId,
    itemIds,
  };
};
