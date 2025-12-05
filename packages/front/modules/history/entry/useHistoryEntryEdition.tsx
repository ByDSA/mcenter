import { ReactNode } from "react";
import { useCrud, UseCrudProps, UseCrudRet } from "#modules/utils/resources/useCrud";
import { useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";

type Props<T> = UseCrudProps<T> & {
  dataJsx: (data: T)=> ReactNode;
};
type Ret<T> = UseCrudRet<T>;
export function useHistoryEntryEdition<T>(
  params: Props<T>,
): Ret<T> {
  const { openModal } = useConfirmModal();
  const { isModified, remove, reset, addOnReset, state, update, initialState } = useCrud<T>( {
    data: params.data,
    setData: params.setData,
    beforeFetchRemove: async () => {
      const { data } = params;
      let ret = false;

      await openModal( {
        title: "Confirmar borrado",
        staticContent: (<>
          <p>¿Borrar esta entrada del historial?</p>
          {params.dataJsx(data)}
        </>),
        action: () => {
          ret = true;

          return true;
        },
      } );

      return ret;
    },
    fetchRemove: params.fetchRemove,
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
