import type { MusicHistoryEntry } from "#modules/musics/history/models";
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
import { ContextMenuItem, useContextMenuTrigger } from "#modules/ui-kit/ContextMenu";
import { useUser } from "#modules/core/auth/useUser";
import styles from "../musics/styles.module.css";
import { AddToPlaylistContextMenuItem } from "../playlists/AddToPlaylistContextMenuItem";
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
  const { user } = useUser();
  const { openMenu } = useContextMenuTrigger();
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
    loader: {
      isLoading,
    },
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
                onClickMenu={(e)=> {
                  openMenu( {
                    event: e,
                    content: <>
                      <AddToPlaylistContextMenuItem
                        musicId={entry.resourceId}
                        user={user}
                      />
                      <ContextMenuItem
                        label="Copiar backend URL"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            backendUrl(PATH_ROUTES.musics.slug.withParams(entry.resource.slug)),
                          );
                          logger.info("Copiada url");
                        }}
                      />
                      <ContextMenuItem
                        label="Eliminar del historial"
                        theme="danger"
                        onClick={async () => {
                          const api = FetchApi.get(MusicHistoryApi);

                          await api.deleteOneById(entry.id);
                          logger.info("Entrada de historial eliminada");
                          setItem(i, null);
                        }}
                      />
                    </>,
                  } );
                }}
              />
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
