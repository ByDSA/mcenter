import type { PlaylistEntity } from "../Playlist";
import { Fragment } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { INITIAL_FETCHING_LENGTH } from "#modules/history/lists";
import { useUser } from "#modules/core/auth/useUser";
import { createContextMenuItem, useListContextMenu } from "#modules/ui-kit/ContextMenu";
import { classes } from "#modules/utils/styles";
import { MusicPlaylistsApi } from "../requests";
import { playlistCopyBackendUrl } from "../utils";
import { MusicPlaylistListItem } from "./Item";
import styles from "./List.module.css";
import { RenamePlaylistContextMenuItem } from "./renameItem";
import { useRenamePlaylistModal } from "./useRenamePlaylistModal";
import { useDeletePlaylistContextMenuItem } from "./deleteItem";

import "#styles/resources/resource-list-entry.css";

type Data = MusicPlaylistsApi.GetManyByCriteria.Data[];

type Props = ReturnType<typeof useMusicPlaylists>;

export function MusicPlayListsList(
  { data, error, isLoading, observerTarget, removeItemByIndex, setItemByIndex }: Props,
) {
  const { user } = useUser();
  const userId = user?.id;

  assertIsDefined(userId);

  const { generateDeletePlayListContextMenuItem } = useDeletePlaylistContextMenuItem( {
    onOpen: () => {
      closeMenu();
    },
    onActionSuccess: ()=>removeItemByIndex(activeIndex!),
    getValue: ()=>data![activeIndex!],
  } );
  const renameModal = useRenamePlaylistModal();
  const { openMenu,
    renderContextMenu,
    activeIndex, closeMenu } = useListContextMenu( {
    className: styles.contextMenu,
    renderChildren: (item: PlaylistEntity)=><>
      {createContextMenuItem( {
        label: "Copiar backend URL",
        onClick: async ()=> {
          await playlistCopyBackendUrl( {
            value: item,
          } );
        },
      } )}
      {RenamePlaylistContextMenuItem( {
        renameModal,
        closeMenu,
        value: item,
        setValue: (value: PlaylistEntity) => {
          const i = data?.findIndex((d) => d.id === value.id);

          if (i === undefined || i === -1)
            return;

          setItemByIndex(i, {
            ...item,
            name: value.name,
            slug: value.slug,
          } );
        },
      } )}
      {generateDeletePlayListContextMenuItem(item)}
    </>,
  } );

  return renderFetchedData<Data | null>( {
    data,
    error,
    isLoading,
    render: () => (
      <span className={classes("resource-list", styles.list)}>
        {
          data!.map(
            (playlist, i) => <Fragment key={playlist.id}>
              <MusicPlaylistListItem
                value={playlist as PlaylistEntity}
                setValue={(newEntry: typeof playlist | undefined) => {
                  setItemByIndex(i, newEntry ?? null);
                }}
                contextMenu={{
                  element: activeIndex === i
                    ? renderContextMenu(playlist as PlaylistEntity)
                    : undefined,
                  onClick: (e) => openMenu( {
                    event: e,
                    index: i,
                  } ),
                }} />
            </Fragment>,
          )
        }
        <div ref={observerTarget} style={{
          height: "1px",
        }} />
        {
          !!error
        && error instanceof Error
        && <span style={{
          marginTop: "2em",
        }}>{error.message}</span>
        }
        {data?.length === 0
        && <section className={styles.noPlaylists}>
          <p>No tienes ninguna playlist creada.</p>
        </section>}
      </span>
    ),
  } );
}

export function useMusicPlaylists() {
  const api = FetchApi.get(MusicPlaylistsApi);
  const { user } = useUser();
  const userId = user?.id;

  assertIsDefined(userId);
  const { data, isLoading, error,
    setItem, observerTarget, setData } = useCrudDataWithScroll( {
    initialFetch: async () => {
      const result = await api.getManyByUserCriteria(userId, {
        limit: 10,
      } );

      return result.data;
    },
    refetching: {
      fn: async (d)=> {
        const result = await api.getManyByUserCriteria(userId, {
          limit: Math.max(d?.length ?? 0, INITIAL_FETCHING_LENGTH),
        } );

        return result.data;
      },
      everyMs: 5_000,
    },
    fetchingMore: {
      fn: async (d) => {
        const result = await api.getManyByUserCriteria(userId, {
          limit: 5,
          offset: d?.length ?? 0,
        } );

        return result.data;
      },
    },
  } );

  return {
    data,
    isLoading,
    error,
    setItemByIndex: setItem,
    removeItemByIndex: (index: number) => {
      setData((oldData) => {
        if (!oldData)
          return oldData;

        const newData = [...oldData];

        newData.splice(index, 1);

        return newData;
      } );
    },
    addItem: (newItem: PlaylistEntity) => {
      setData((oldData) => {
        if (!oldData)
          return [newItem];

        const newData = [...oldData, newItem];

        return newData;
      } );
    },
    observerTarget,
  };
}
