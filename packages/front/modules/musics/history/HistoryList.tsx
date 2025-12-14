import { Fragment } from "react";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { INITIAL_FETCHING_LENGTH, FETCHING_MORE_LENGTH } from "#modules/history/lists";
import { ResourceList } from "#modules/resources/ResourceList";
import { dayTitle } from "#modules/history/utils";
import { MusicHistoryApi } from "./requests";
import { MusicHistoryEntryElement } from "./HistoryEntry";

type Data = MusicHistoryApi.GetManyByCriteria.Data[];

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
    render: () => (
      <ResourceList>
        {
          data!.map(
            (entry, i, array) => {
              return <Fragment key={`${entry.resourceId} ${entry.date.timestamp}`}>
                {dayTitle( {
                  currentDateTimestamp: entry.date.timestamp,
                  previousDateTimestamp: i > 0 ? array[i - 1].date.timestamp : undefined,
                } )}
                <MusicHistoryEntryElement
                  value={entry}
                  setValue={(newEntry: typeof entry) => {
                    setItem(i, newEntry);
                  }}
                />
              </Fragment>;
            },
          )
        }
      </ResourceList>
    ),
  } );
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
