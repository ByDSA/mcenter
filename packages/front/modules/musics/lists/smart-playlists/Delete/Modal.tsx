import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { FormInputGroup } from "#modules/ui-kit/form/FormInputGroup";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
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
          <FormInputGroup inline>
            <FormLabel>Nombre</FormLabel>
            <span>{data.name}</span>
          </FormInputGroup>
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
