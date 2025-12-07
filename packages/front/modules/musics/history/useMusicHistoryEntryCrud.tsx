import { useHistoryEntryEdition } from "#modules/history/entry/useHistoryEntryEdition";
import { FetchApi } from "#modules/fetching/fetch-api";
import { UseCrudProps } from "#modules/utils/resources/useCrud";
import { getLongDateStr } from "#modules/utils/dates";
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
    dataJsx: (d)=> <div>
      <span>Fecha: {getLongDateStr(new Date(d.date.timestamp * 1_000), "datetime")}</span><br/>
      <span>Título: {d.resource.title}</span><br/>
      <span>Artista: {d.resource.artist}</span><br/>
    </div>,
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
