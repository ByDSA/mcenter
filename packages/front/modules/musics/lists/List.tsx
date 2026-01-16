import { Fragment, useEffect, useState } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { showError } from "$shared/utils/errors/showError";
import { MusicQueryEntity } from "$shared/models/musics/queries";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useUser } from "#modules/core/auth/useUser";
import { ResourceList } from "#modules/resources/ResourceList";
import { MusicUsersListsApi } from "#modules/musics/lists/users-lists/requests";
import { MusicQueryListItem } from "#modules/musics/lists/queries/ListItem";
import { LocalDataProvider } from "#modules/utils/local-data-context";
import { NewItemOrFn, useArrayData } from "#modules/utils/array-data-context";
import { MusicPlaylistEntity } from "./playlists/models";
import { MusicPlaylistListItem } from "./playlists/ListItem/Item";
import styles from "./List.module.css";

type Data = NonNullable<MusicUsersListsApi.GetMyList.Response["data"]>;
type Item = Data["list"][0];

type Props = ReturnType<typeof useMusicPlaylists>;

export function MusicPlayListsList(
  { data }: Props,
) {
  const { user } = useUser();
  const userId = user?.id;

  assertIsDefined(userId);

  const { setItemByIndex } = useArrayData();

  if (!data)
    return null;

  return <ResourceList>
    {
      data.map(
        (item, i) => <Fragment key={item.id}>

          {
            item.type === "playlist"
              && <LocalDataProvider
                data={item.resource!}
                setData={(newData: MusicPlaylistEntity)=> {
                  if (!newData)
                    return newData;

                  setItemByIndex(i, (old: Item | undefined)=> {
                    if (!old)
                      return old;

                    return {
                      ...old,
                      resource: {
                        ...old.resource,
                        ...newData,
                      },
                    } as Item;
                  } );
                }}>
                <MusicPlaylistListItem
                  index={i}
                />
              </LocalDataProvider>
          }
          {
            item.type === "query"
              && <LocalDataProvider
                data={item.resource!}
                setData={(newData: MusicQueryEntity)=> {
                  if (!newData)
                    return newData;

                  setItemByIndex(i, (old: Item | undefined)=> {
                    if (!old)
                      return old;

                    return {
                      ...old,
                      resource: {
                        ...old.resource,
                        ...newData,
                      },
                    } as Item;
                  } );
                }}>
                <MusicQueryListItem
                  index={i}
                />
              </LocalDataProvider>
          }
        </Fragment>,
      )
    }

    {data?.length === 0
        && <section className={styles.noPlaylists}>
          <p>No tienes ninguna playlist creada.</p>
        </section>}
  </ResourceList>;
}

export function useMusicPlaylists() {
  const api = FetchApi.get(MusicUsersListsApi);
  const { user } = useUser();

  assertIsDefined(user);
  const [data, setData] = useState<Data | null>(null);

  useEffect(()=> {
    const fn = async () => {
      const res = await api.getMyList( {
        expand: true,
      } );

      setData(res.data);
    };

    fn().catch(showError);
  }, []);

  const setItem = (index: number, item: NewItemOrFn<Item>) => {
    setData((old: Data | null) => {
      if (!old)
        return old;

      const oldItem: Item = old.list[index];
      const newItem: Item | undefined = typeof item === "function" ? item(oldItem) : item;

      return {
        ...old,
        list: old.list.map((current, i) => (i === index ? newItem : current)),
      } as Data;
    } );
  };

  return {
    data: data?.list,
    setItemByIndex: setItem,
    removeItemByIndex: (index: number) => {
      setData((oldData) => {
        if (!oldData)
          return oldData;

        const newData = [...oldData.list];

        newData.splice(index, 1);

        return {
          ...oldData,
          list: newData,
        };
      } );
    },
    addItem: (newItem: Item) => {
      setData((oldData) => {
        if (!oldData)
          return oldData;

        const newData = [...oldData.list, newItem];

        return {
          ...oldData,
          list: newData,
        };
      } );
    },
  };
}
