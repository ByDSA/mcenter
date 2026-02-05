import { assertIsDefined } from "$shared/utils/validation";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { OpenConfirmModalProps, useConfirmModal } from "#modules/ui-kit/modal/ConfirmModal/useConfirmModal";
import { useLocalData } from "#modules/utils/local-data-context";
import { SeriesApi } from "../requests";
import { SeriesEntity } from "../models";

type Props = Pick<OpenConfirmModalProps, "onFinish"> & {
  onActionSuccess: ()=> void;
};

export function useDeleteSeriesModal(
  { onFinish, onActionSuccess }: Props,
): ReturnType<typeof useConfirmModal> {
  const { openModal, ...modal } = useConfirmModal();
  const { data } = useLocalData<SeriesEntity>();

  return {
    ...modal,
    openModal: (props) => {
      assertIsDefined(data);

      return openModal( {
        title: "Confirmar borrado",
        content: (
          <>
            <p>¿Estás seguro de que deseas eliminar esta serie?</p>
            <DaInputGroup >
              <DaInputGroupItem inline>
                <DaLabel>Nombre</DaLabel>
                <span>{data.name}</span>
              </DaInputGroupItem>
              <DaInputGroupItem inline>
                <DaLabel>Key</DaLabel>
                <span>{data.key}</span>
              </DaInputGroupItem>
            </DaInputGroup>
          </>
        ),
        onFinish,
        onActionSuccess,
        action: async () => {
          const api = FetchApi.get(SeriesApi);
          const response = await api.deleteOneById(data.id);
          const deleted = response.data;

          if (deleted) {
            logger.debug("Deleted series: " + deleted.name);

            return true;
          }

          return false;
        },
        ...props,
      } );
    },
  };
}
