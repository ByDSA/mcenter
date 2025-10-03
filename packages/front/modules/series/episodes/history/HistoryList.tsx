import { Fragment } from "react";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { classes } from "#modules/utils/styles";
import { HistoryEntryElement } from "./entry/HistoryEntry";
import { EpisodeHistoryApi } from "./requests";
import { getDateStr } from "./utils";
import styles from "./styles.module.css";

import "#styles/resources/resource-list-entry.css";

type Data = EpisodeHistoryApi.GetMany.Data[];

export function HistoryList() {
  const { data, isLoading, error,
    setItem, observerTarget } = useHistoryList();

  return renderFetchedData<Data | null>( {
    data,
    error,
    isLoading,
    scroll: {
      observerRef: observerTarget,
    },
    render: () => {
      return (
        <span className={classes("resource-list", styles.list)}>
          {
            data!.map((entry: EpisodeHistoryApi.GetMany.Data, i: number) => {
              let dayTitle;

              if (i === 0 || !isSameday(data![i - 1].date.timestamp, entry.date.timestamp)) {
                const dateStr = getDateStr(new Date(entry.date.timestamp * 1000));

                dayTitle = <h3 key={dateStr}>{dateStr}</h3>;
              }

              return <Fragment
                key={entry.date.timestamp}>
                {dayTitle}
                <HistoryEntryElement value={entry} setValue={(newEntry: typeof entry |
                  undefined) => {
                  if (!newEntry) {
                    setItem(i, null);

                    return;
                  }

                  const oldEntry = data![i];
                  const newData = {
                    ...oldEntry,
                    resource: {
                      ...oldEntry.resource,
                      ...newEntry.resource,
                      serie: newEntry.resource.serie ?? oldEntry.resource.serie,
                    },
                  };

                  setItem(i, newData);
                }}/>
              </Fragment>;
            } )
          }
        </span>
      );
    },
  } );
}

function isSameday(timestamp1: number, timestamp2: number) {
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);

  return date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate();
}

function useHistoryList() {
  const historyApi = FetchApi.get(EpisodeHistoryApi);
  const { data, isLoading, error,
    setData, setItem, observerTarget } = useCrudDataWithScroll( {
    initialFetch: async () => {
      const result = await historyApi.getMany( {
        limit: 10,
      } );

      return result.data;
    },
    refetching: {
      fn: async (d)=> {
        const result = await historyApi.getMany( {
          limit: Math.max(d?.length ?? 0, 10),
        } );

        return result.data;
      },
      everyMs: 5_000,
    },
    fetchingMore: {
      fn: async (d) => {
        const result = await historyApi.getMany( {
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
    setItem,
    setData,
    observerTarget,
  };
}
