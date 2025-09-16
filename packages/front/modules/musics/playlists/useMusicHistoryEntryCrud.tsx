import { useHistoryEntryEdition } from "#modules/history/entry/useHistoryEntryEdition";
import { FetchApi } from "#modules/fetching/fetch-api";
import { UseCrudProps } from "#modules/utils/resources/useCrud";
import { MusicPlaylistsApi } from "./requests";

type Data = MusicPlaylistsApi.GetManyByCriteria.Data;

export type UseMusicHistoryEntryCrudWithElementsProps<T> =
Pick<UseCrudProps<T>, "data" | "setData"> & {
  shouldFetchFileInfo?: boolean;
};

export function useMusicPlaylistsEdition<T extends Data>( { data,
  setData }: UseMusicHistoryEntryCrudWithElementsProps<T>) {
  const api = FetchApi.get(MusicPlaylistsApi);
  const { remove } = useHistoryEntryEdition<T>( {
    data,
    setData,
    isModifiedFn: ()=>false,
    fetchRemove: async ()=> {
      const res = await api.deleteOneById(data.id);

      return {
        data: res.data as T,
        success: true,
      };
    },
    // eslint-disable-next-line require-await
    fetchUpdate: async () => {
      return undefined as any;
    },
  } );

  return {
    actions: {
      remove,
    },
  };
}
