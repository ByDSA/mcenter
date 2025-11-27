import type { MusicHistoryEntry, MusicHistoryEntryEntity } from "#modules/musics/history/models";
import { Fragment } from "react";
import { PATH_ROUTES } from "$shared/routing";
import { formatDate } from "#modules/utils/dates";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { classes } from "#modules/utils/styles";
import { INITIAL_FETCHING_LENGTH, FETCHING_MORE_LENGTH } from "#modules/history/lists";
import { logger } from "#modules/core/logger";
import { backendUrl } from "#modules/requests";
import { createContextMenuItem, useListContextMenu } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import styles from "../musics/styles.module.css";
import { createAddToPlaylistContextMenuItem } from "../musics/MusicList";
import { usePlaylistSelectorModal } from "../playlists/list-selector/modal";
import { MusicHistoryApi } from "./requests";
import { HistoryEntryElement } from "./entry/HistoryEntry";

import "#styles/resources/resource-list-entry.css";

type Props = {
  showDate?: "eachOne" | "groupByDay" | "none";
};

type Data = MusicHistoryApi.GetManyByCriteria.Data[];

export function HistoryList(props?: Props) {
  const showDate = props?.showDate ?? "groupByDay";
  const { data, isLoading, error,
    setItem, observerTarget, setData } = useHistoryList();
  const playlistModal = usePlaylistSelectorModal();
  const { user } = useUser();
  const { openMenu,
    renderContextMenu,
    activeIndex, closeMenu } = useListContextMenu( {
    renderChildren: (item: MusicHistoryEntryEntity)=><>
      {
        createAddToPlaylistContextMenuItem( {
          musicId: item.resourceId,
          user,
          modal: playlistModal,
          closeMenu,
        } )
      }
      {
        createContextMenuItem( {
          label: "Copiar backend URL",
          closeMenu,
          onClick: async () => {
            await navigator.clipboard.writeText(
              backendUrl(PATH_ROUTES.musics.slug.withParams(item.resourceId)),
            );
            logger.info("Copiada url");
          },
        } )
      }
      {
        createContextMenuItem( {
          label: "Eliminar del historial",
          closeMenu,
          theme: "danger",
          onClick: async () => {
            const api = FetchApi.get(MusicHistoryApi);

            await api.deleteOneById(item.id);
            logger.info("Entrada de historial eliminada");
            setItem(activeIndex!, null);
          },
        } )
      }
    </>,
  } );
  const updateIsFav = (musicId: string, favorite: boolean) => {
    if (!data)
      return;

    let dirty = false;

    for (const entry of data) {
      let m = entry.resource;

      if (m.id === musicId && !!m.isFav !== favorite) {
        m.isFav = favorite;
        dirty = true;
      }
    }

    if (dirty) {
      setData([
        ...data,
      ]);
    }
  };

  return renderFetchedData<Data | null>( {
    data,
    error,
    isLoading,
    scroll: {
      observerRef: observerTarget,
    },
    render: () => (
      <span className={classes("resource-list", styles.list)}>
        {
          data!.map(
            (entry, i, array) => <Fragment key={`${entry.resourceId} ${entry.date.timestamp}`}>
              {showDate === "groupByDay" ? dayTitle(entry, i, array) : null}
              <HistoryEntryElement showDate={showDate === "eachOne"}
                value={entry} setValue={(newEntry: typeof entry | undefined) => {
                  setItem(i, newEntry ?? null);
                }}
                updateFavButtons={updateIsFav}
                contextMenu={{
                  element: activeIndex === i
                    ? renderContextMenu(entry)
                    : undefined,
                  onClick: (e) => openMenu( {
                    event: e,
                    index: i,
                  } ),
                }} />
            </Fragment>,
          )
        }
      </span>
    ),
  } );
}

function dayTitle(
  entry: Required<MusicHistoryEntry>,
  i: number,
  array: Required<MusicHistoryEntry>[],
) {
  if (i === 0 || !isSameday(array[i - 1].date.timestamp, entry.date.timestamp)) {
    return <h3 key={entry.date.timestamp}>{formatDate(new Date(entry.date.timestamp * 1000), {
      ago: "no",
      dateTime: "fullDate",
    } )}</h3>;
  }

  return null;
}

function isSameday(timestamp1: number, timestamp2: number) {
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);

  return date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate();
}

function useHistoryList() {
  const api = FetchApi.get(MusicHistoryApi);
  const { data, isLoading, error,
    setItem, observerTarget, setData } = useCrudDataWithScroll( {
    initialFetch: async () => {
      const result = await api.getManyByCriteria( {
        limit: INITIAL_FETCHING_LENGTH,
      } );

      return result.data;
    },
    refetching: {
      fn: async (d)=> {
        const result = await api.getManyByCriteria( {
          limit: Math.max(d?.length ?? 0, INITIAL_FETCHING_LENGTH),
        } );

        return result.data;
      },
      everyMs: 5_000,
    },
    fetchingMore: {
      fn: async (d) => {
        const result = await api.getManyByCriteria( {
          limit: FETCHING_MORE_LENGTH,
          offset: d?.length ?? 0,
        } );

        return result.data;
      },
    },
  } );

  return {
    data,
    setData,
    isLoading,
    error,
    setItem,
    observerTarget,
  };
}
