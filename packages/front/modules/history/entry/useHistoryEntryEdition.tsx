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
    fetchRemove: params.fetchRemove
      ? (async () => {
        const { data } = params;
        let ret = {
          data: undefined as typeof data | undefined | void,
          success: false,
        };

        await openModal( {
          title: "Confirmar borrado",
          staticContent: (<>
            <p>¿Borrar esta entrada del historial?</p>
            {params.dataJsx(data)}
          </>),
          action: async () => {
            const got = await params.fetchRemove?.();

            if (got)
              ret = got;

            return true;
          },
        } );

        return ret;
      } )
      : undefined,
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
