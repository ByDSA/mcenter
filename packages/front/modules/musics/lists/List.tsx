import { Fragment, useEffect, useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { showError } from "$shared/utils/errors/showError";
import { MusicSmartPlaylistEntity } from "$shared/models/musics/smart-playlists";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { DragHandle } from "@mui/icons-material";
import { MusicUserListsCrudDtos } from "$shared/models/musics/users-lists/dto/transport";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceList } from "#modules/resources/List/ResourceList";
import { MusicUsersListsApi } from "#modules/musics/lists/users-lists/requests";
import { MusicSmartPlaylistListItem } from "#modules/musics/lists/smart-playlists/ListItem";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { NewItemOrFn, useArrayData } from "#modules/utils/array-data-context";
import { classes } from "#modules/utils/styles";
import { MusicPlaylistEntity } from "./playlists/models";
import { MusicPlaylistListItem } from "./playlists/ListItem/ListItem";
import styles from "./List.module.css";
import { useListsDragAndDrop } from "./useListsDragAndDrop";
import { SortableListItem } from "./SortableListItem";

type Data = NonNullable<MusicUserListsCrudDtos.GetMyList.Response["data"]>;
type Item = Data["list"][0];

type Props = ReturnType<typeof useMusicPlaylists>;

export function MusicPlayListsList(
  { data, fullData, setData }: Props,
) {
  const { user } = useUser();
  const userId = user?.id;

  assertIsDefined(userId);

  const { setItemByIndex } = useArrayData();
  const { sensors,
    handleDragStart,
    handleDragEnd,
    isDraggingGlobal,
    activeId,
    itemIds } = useListsDragAndDrop(fullData, setData);

  if (!data)
    return null;

  const renderItem = (item: Item, i: number, dragProps?: { element: React.ReactNode;
isDragging: boolean;
isDraggingGlobal: boolean; } ) => (
    <Fragment key={item.id}>
      {
        item.type === "playlist"
          && <LocalDataProvider
            data={item.resource!}
            setData={(newData: MusicPlaylistEntity)=> {
              if (!newData)
                return newData;

              setItemByIndex(i, (old: Item | undefined)=> {
                if (!old)
                  return old;

                return {
                  ...old,
                  resource: {
                    ...old.resource,
                    ...newData,
                  },
                } as Item;
              } );
            }}>
            <MusicPlaylistListItem
              index={i}
              // Pasamos las props de drag al componente de lista (que usa ResourceEntry)
              // para que pinte el handle a la izquierda
              drag={dragProps}
            />
          </LocalDataProvider>
      }
      {
        item.type === "smart-playlist"
          && <LocalDataProvider
            data={item.resource!}
            setData={(newData: MusicSmartPlaylistEntity)=> {
              if (!newData)
                return newData;

              setItemByIndex(i, (old: Item | undefined)=> {
                if (!old)
                  return old;

                return {
                  ...old,
                  resource: {
                    ...old.resource,
                    ...newData,
                  },
                } as Item;
              } );
            }}>
            <MusicSmartPlaylistListItem
              index={i}
              drag={dragProps}
            />
          </LocalDataProvider>
      }
    </Fragment>
  );
  const activeItem = activeId ? data.find(i => i.id === activeId) : null;
  const activeIndex = activeId ? data.findIndex(i => i.id === activeId) : -1;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <ResourceList>
          {data.map((item, i) => (
            <SortableListItem
              key={item.id}
              id={item.id}
              isDraggingGlobal={isDraggingGlobal}
            >
              {(dragProps) => renderItem(item, i, dragProps)}
            </SortableListItem>
          ))}

          {data?.length === 0
              && <section className={styles.noPlaylists}>
                <p>No tienes ninguna playlist creada.</p>
              </section>}
        </ResourceList>
      </SortableContext>

      <DragOverlay adjustScale={false}>
        {activeItem
          ? (
            <div className={classes(styles.sortableItemWrapper, styles.overlayItem)}>
              {renderItem(activeItem, activeIndex, {
                isDragging: true,
                isDraggingGlobal: true,
                element: (
                  <div className={classes(styles.dragHandle, styles.isDragging)}>
                    <DragHandle />
                  </div>
                ),
              } )}
            </div>
          )
          : null}
      </DragOverlay>
    </DndContext>
  );
}

export function useMusicPlaylists() {
  const api = FetchApi.get(MusicUsersListsApi);
  const { user } = useUser();

  assertIsDefined(user);
  const [data, setData] = useState<Data | null>(null);

  useEffect(()=> {
    const fn = async () => {
      const res = await api.getMyList( {
        expand: true,
      } );

      setData(res.data);
    };

    fn().catch(showError);
  }, []);

  const setItem = (index: number, item: NewItemOrFn<Item>) => {
    setData((old: Data | null) => {
      if (!old)
        return old;

      const oldItem: Item = old.list[index];
      const newItem: Item | undefined = typeof item === "function" ? item(oldItem) : item;

      return {
        ...old,
        list: old.list.map((current, i) => (i === index ? newItem : current)),
      } as Data;
    } );
  };

  return {
    data: data?.list,
    fullData: data,
    setData,
    setItemByIndex: setItem,
    removeItemByIndex: (index: number) => {
      setData((oldData) => {
        if (!oldData)
          return oldData;

        const newData = [...oldData.list];

        newData.splice(index, 1);

        return {
          ...oldData,
          list: newData,
        };
      } );
    },
    addItem: (newItem: Item) => {
      setData((oldData) => {
        if (!oldData)
          return oldData;

        const newData = [...oldData.list, newItem];

        return {
          ...oldData,
          list: newData,
        };
      } );
    },
  };
}
