import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { DaInputGroup } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { OpenConfirmModalProps, useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { useLocalData } from "#modules/utils/local-data-context";
import { MusicSmartPlaylistEntity } from "../models";
import { MusicSmartPlaylistsApi } from "../requests";

type Props = Pick<OpenConfirmModalProps, "onFinish"> & {
  onActionSuccess: ()=> void;
};

export function useDeleteSmartPlaylistModal(
  { onFinish, onActionSuccess }: Props,
): ReturnType<typeof useConfirmModal> {
  const { openModal, ...modal } = useConfirmModal();
  const { data } = useLocalData<MusicSmartPlaylistEntity>();

  return {
    ...modal,
    openModal: (props) => {
      return openModal( {
        title: "Confirmar borrado",
        content: <>
          <p>¿Estás seguro de que deseas eliminar esta Smart Playlist?</p>
          <DaInputGroup inline>
            <DaLabel>Nombre</DaLabel>
            <span>{data.name}</span>
          </DaInputGroup>
        </>,
        onFinish,
        onActionSuccess,
        action: async () => {
          const api = FetchApi.get(MusicSmartPlaylistsApi);
          const response = await api.deleteOneById(data.id);
          const deleted = response.data;

          if (deleted) {
            logger.debug("Deleted music Smart Playlist: " + deleted.name);

            return true;
          }

          return false;
        },
        ...props,
      } );
    },
  };
}
