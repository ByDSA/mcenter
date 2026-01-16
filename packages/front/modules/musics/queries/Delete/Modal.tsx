import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { OpenConfirmModalProps, useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { useLocalData } from "#modules/utils/local-data-context";
import { MusicQueryEntity } from "../models";
import { MusicQueriesApi } from "../requests";

type UseDeleteMusicQueryProps = Pick<OpenConfirmModalProps, "onFinish"> & {
  onActionSuccess: ()=> void;
};

export function useDeleteQueryModal(
  { onFinish, onActionSuccess }: UseDeleteMusicQueryProps,
): ReturnType<typeof useConfirmModal> {
  const { openModal, ...modal } = useConfirmModal();
  const { data } = useLocalData<MusicQueryEntity>();

  return {
    ...modal,
    openModal: (props) => {
      return openModal( {
        title: "Confirmar eliminación",
        content: <><p>¿Estás seguro de que deseas eliminar esta query?</p>
          <p style={{
            textAlign: "center",
          }}>{data.name}</p></>,
        onFinish,
        onActionSuccess,
        action: async () => {
          const api = FetchApi.get(MusicQueriesApi);
          const response = await api.deleteOneById(data.id);
          const deleted = response.data;

          if (deleted) {
            logger.debug("Deleted music query: " + deleted.name);

            return true;
          }

          return false;
        },
        ...props,
      } );
    },
  };
}
