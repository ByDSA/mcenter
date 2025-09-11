import { useHistoryEntryEdition } from "#modules/history/entry/useHistoryEntryEdition";
import { FetchApi } from "#modules/fetching/fetch-api";
import { UseCrudProps } from "#modules/utils/resources/useCrud";
import { MusicHistoryApi } from "./requests";

type Data = MusicHistoryApi.GetManyByCriteria.Data;

export type UseMusicHistoryEntryCrudWithElementsProps<T> =
Pick<UseCrudProps<T>, "data" | "setData"> & {
  shouldFetchFileInfo?: boolean;
};

export function useMusicHistoryEntryEdition<T extends Data>( { data,
  setData }: UseMusicHistoryEntryCrudWithElementsProps<T>) {
  const historyApi = FetchApi.get(MusicHistoryApi);
  const { remove } = useHistoryEntryEdition<T>( {
    data,
    setData,
    isModifiedFn: ()=>false,
    fetchRemove: async ()=> {
      const res = await historyApi.deleteOneById(data.id);

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
