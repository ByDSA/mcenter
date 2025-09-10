import type { MusicHistoryEntry } from "#modules/musics/history/models";
import extend from "just-extend";
import { Fragment } from "react";
import { formatDate } from "#modules/utils/dates";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { MusicHistoryApi } from "./requests";
import { HistoryEntryElement } from "./entry/HistoryEntry";

import "#styles/resources/resource-list-entry.css";
import "#styles/resources/resource-list-musics.css";
import "#styles/resources/music.css";

type Props = {
  showDate?: "eachOne" | "groupByDay" | "none";
};
const DEFAULT_PARAMS: Required<Props> = {
  showDate: "groupByDay",
};

type Data = MusicHistoryApi.GetManyByCriteria.Data[];

export function HistoryList(props?: Props) {
  const params = extend(true, DEFAULT_PARAMS, props) as typeof DEFAULT_PARAMS;
  const { data, isLoading, error,
    setItem, observerTarget } = useHistoryList();

  return renderFetchedData<Data | null>( {
    data,
    error,
    isLoading,
    render: () => (
      <span className="resource-list">
        {
          data!.map(
            (entry, i, array) => <Fragment key={`${entry.resourceId} ${entry.date.timestamp}`}>
              {params.showDate === "groupByDay" ? dayTitle(entry, i, array) : null}
              <HistoryEntryElement showDate={params.showDate === "eachOne"}
                value={entry} setValue={(newEntry: typeof entry | undefined) => {
                  setItem(i, newEntry ?? null);
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
    setItem, observerTarget } = useCrudDataWithScroll( {
    initialFetch: async () => {
      const result = await api.getManyByCriteria( {
        limit: 10,
      } );

      return result.data;
    },
    refetching: {
      fn: async (d)=> {
        const result = await api.getManyByCriteria( {
          limit: Math.max(d?.length ?? 0, 10),
        } );

        return result.data;
      },
      everyMs: 5_000,
    },
    fetchingMore: {
      fn: async (d) => {
        const result = await api.getManyByCriteria( {
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
    observerTarget,
  };
}
