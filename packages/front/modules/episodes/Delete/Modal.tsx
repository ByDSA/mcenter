import { EpisodeEntity } from "$shared/models/episodes";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { OpenConfirmModalProps, useConfirmModal } from "#modules/ui-kit/modal/ConfirmModal/useConfirmModal";
import { useLocalData } from "#modules/utils/local-data-context";
import { EpisodesApi } from "../requests";

type Props = Pick<OpenConfirmModalProps, "onFinish"> & {
  onActionSuccess?: ()=> void;
};

export function useDeleteEpisodeModal(
  { onFinish, onActionSuccess }: Props,
): ReturnType<typeof useConfirmModal> {
  const { openModal, ...modal } = useConfirmModal();
  const { data } = useLocalData<EpisodeEntity>();

  return {
    ...modal,
    openModal: (props) => {
      return openModal( {
        title: "Confirmar borrado de episodio",
        content: (
          <>
            <p>¿Estás seguro de que deseas eliminar este episodio permanentemente?</p>
            <DaInputGroup>
              <DaInputGroupItem inline>
                <DaLabel>Serie</DaLabel>
                <span>{data.serie?.name ?? data.compKey.seriesKey}</span>
              </DaInputGroupItem>
              <DaInputGroupItem inline>
                <DaLabel>Episodio</DaLabel>
                <span>{data.compKey.episodeKey}</span>
              </DaInputGroupItem>
              <DaInputGroupItem inline>
                <DaLabel>Título</DaLabel>
                <span>{data.title}</span>
              </DaInputGroupItem>
            </DaInputGroup>
          </>
        ),
        onFinish,
        onActionSuccess,
        action: async () => {
          const api = FetchApi.get(EpisodesApi);
          const response = await api.deleteOne(data.id);

          if (response.data) {
            logger.debug(`Deleted episode: ${data.compKey.episodeKey}`);

            return true;
          }

          return false;
        },
        ...props,
      } );
    },
  };
}
