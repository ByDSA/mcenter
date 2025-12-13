import { Fragment } from "react";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { INITIAL_FETCHING_LENGTH } from "#modules/history/lists";
import { ResourceList } from "#modules/resources/ResourceList";
import { EpisodeHistoryEntryElement } from "./entry/HistoryEntry";
import { EpisodeHistoryApi } from "./requests";
import { getDateStr } from "./utils";

type Data = EpisodeHistoryApi.GetMany.Data[];

export function HistoryList() {
  const { data, isLoading, error,
    setItem, observerTarget } = useHistoryList();

  return renderFetchedData<Data | null>( {
    data,
    error,
    loader: {
      isLoading,
    },
    scroll: {
      observerRef: observerTarget,
    },
    render: () => {
      return (
        <ResourceList>
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
                <EpisodeHistoryEntryElement
                  value={entry}
                  setValue={(fnOrData) => {
                    setItem(i, (oldEntry)=> {
                      let newEntry: (typeof entry) | undefined;

                      if (typeof fnOrData === "function")
                        newEntry = fnOrData(oldEntry);
                      else
                        newEntry = fnOrData;

                      if (!newEntry)
                        return oldEntry;

                      const newData = {
                        ...oldEntry,
                        resource: {
                          ...oldEntry?.resource,
                          ...newEntry.resource,
                          serie: newEntry.resource.serie ?? oldEntry?.resource.serie,
                        },
                      };

                      return newData;
                    } );
                  }}/>
              </Fragment>;
            } )
          }
        </ResourceList>
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
        limit: INITIAL_FETCHING_LENGTH,
      } );

      return result.data;
    },
    refetching: {
      fn: async (d)=> {
        const result = await historyApi.getMany( {
          limit: Math.max(d?.length ?? 0, INITIAL_FETCHING_LENGTH),
        } );

        return result.data;
      },
      everyMs: 5_000,
    },
    fetchingMore: {
      fn: async (d) => {
        const result = await historyApi.getMany( {
          limit: INITIAL_FETCHING_LENGTH,
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
