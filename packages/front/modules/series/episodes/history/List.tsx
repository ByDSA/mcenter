import { Fragment } from "react";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { INITIAL_FETCHING_LENGTH } from "#modules/history/lists";
import { ResourceList } from "#modules/resources/List/ResourceList";
import { dayTitle } from "#modules/history/utils";
import { EpisodeHistoryEntryElement } from "./ListItem/HistoryEntry";
import { EpisodeHistoryApi } from "./requests";

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
            data!.map((entry: EpisodeHistoryApi.GetMany.Data, i: number, array) => {
              return <Fragment
                key={entry.date.timestamp}>
                {dayTitle( {
                  currentDateTimestamp: entry.date.timestamp,
                  previousDateTimestamp: i > 0 ? array[i - 1].date.timestamp : undefined,
                } )}
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
