import { Fragment } from "react";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { INITIAL_FETCHING_LENGTH } from "#modules/history/lists";
import { MusicPlaylistsApi } from "../requests";
import { PlaylistEntity } from "../Playlist";
import { MusicPlaylistListItem } from "./Item";

import "#styles/resources/resource-list-entry.css";

type Data = MusicPlaylistsApi.GetManyByCriteria.Data[];

export function MusicPlayListsList() {
  const { data, isLoading, error,
    setItem, observerTarget } = useMusicPlaylists();

  return renderFetchedData<Data | null>( {
    data,
    error,
    isLoading,
    render: () => (
      <span className="resource-list">
        {
          data!.map(
            (playlist, i) => <Fragment key={playlist.id}>
              <MusicPlaylistListItem
                value={playlist as PlaylistEntity}
                setValue={(newEntry: typeof playlist | undefined) => {
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

function useMusicPlaylists() {
  const api = FetchApi.get(MusicPlaylistsApi);
  const userId = "test";
  const { data, isLoading, error,
    setItem, observerTarget } = useCrudDataWithScroll( {
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
    setItem,
    observerTarget,
  };
}
