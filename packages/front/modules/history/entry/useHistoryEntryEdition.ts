import { useCrud, UseCrudProps, UseCrudRet } from "#modules/utils/resources/useCrud";

type Props<T> = UseCrudProps<T> ;
type Ret<T> = UseCrudRet<T>;
export function useHistoryEntryEdition<T>(
  params: Props<T>,
): Ret<T> {
  const { isModified, remove, reset, addOnReset, state, update, initialState } = useCrud<T>( {
    data: params.data,
    setData: params.setData,
    fetchRemove: async () => {
      if (!confirm(`Borar esta entrada del historial?\n${ JSON.stringify(params.data, null, 2)}`))
        return Promise.resolve();

      return await params.fetchRemove();
    },
    fetchUpdate: params.fetchUpdate,
    isModifiedFn: params.isModifiedFn,
  } );

  return {
    initialState,
    isModified,
    remove,
    addOnReset,
    reset,
    state,
    update,
  };
}
