import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { OpenConfirmModalProps, useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { useLocalData } from "#modules/utils/local-data-context";
import { MusicPlaylistEntity, musicPlaylistEntitySchema } from "../models";
import { MusicPlaylistsApi } from "../requests";

type UseDeletePlayListProps = Pick<OpenConfirmModalProps, "onFinish"> & {
  onActionSuccess: ()=> void;
};
export function useDeletePlayListModal(
  { onFinish, onActionSuccess }: UseDeletePlayListProps,
): ReturnType<typeof useConfirmModal> {
  const { openModal, ...modal } = useConfirmModal();
  const { data } = useLocalData<MusicPlaylistEntity>();

  return {
    ...modal,
    openModal: (props)=> {
      return openModal( {
        title: "Confirmar eliminación",
        content: <>
          <p>¿Estás seguro de que deseas eliminar esta lista?</p>
          <p style={{
            textAlign: "center",
          }}>{data.name}</p>
        </>,
        onFinish,
        onActionSuccess,
        bypass: ()=> {
          return data.list.length === 0;
        },
        action: async ()=> {
          musicPlaylistEntitySchema.parse(data);
          const api = FetchApi.get(MusicPlaylistsApi);
          const response = await api.deleteOneById(data.id);
          const deleted = response.data;

          if (deleted) {
            logger.debug("Deleted playlist: " + deleted.name);

            return true;
          }

          return false;
        },
        ...props,
      } );
    },
  };
}
