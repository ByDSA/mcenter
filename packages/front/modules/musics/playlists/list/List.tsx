import type { PlaylistEntity } from "../Playlist/types";
import { Fragment } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { renderFetchedData } from "#modules/fetching";
import { useCrudDataWithScroll } from "#modules/fetching/index";
import { FetchApi } from "#modules/fetching/fetch-api";
import { INITIAL_FETCHING_LENGTH } from "#modules/history/lists";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceList } from "#modules/resources/ResourceList";
import { MusicPlaylistsApi } from "../requests";
import { MusicPlaylistListItem } from "./Item";
import styles from "./List.module.css";

type Data = MusicPlaylistsApi.GetManyByCriteria.Data[];

type Props = ReturnType<typeof useMusicPlaylists>;

export function MusicPlayListsList(
  { data, error, isLoading, observerTarget }: Props,
) {
  const { user } = useUser();
  const userId = user?.id;

  assertIsDefined(userId);

  return renderFetchedData<Data | null>( {
    data,
    error,
    loader: {
      isLoading,
    },
    render: () => (
      <ResourceList>
        {
          data!.map(
            (playlist, i) => <Fragment key={playlist.id}>
              <MusicPlaylistListItem
                index={i}
                value={playlist as PlaylistEntity}
              />
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
      </ResourceList>
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
