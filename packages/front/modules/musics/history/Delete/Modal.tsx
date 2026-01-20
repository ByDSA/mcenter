import { assertIsDefined } from "$shared/utils/validation";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { FormInputGroup } from "#modules/ui-kit/form/FormInputGroup";
import { FormLabel } from "#modules/ui-kit/form/Label/FormLabel";
import { OpenConfirmModalProps, useConfirmModal } from "#modules/ui-kit/modal/useConfirmModal";
import { getLongDateStr } from "#modules/utils/dates";
import { useLocalData } from "#modules/utils/local-data-context";
import { DeleteHistoryEntryModalContentWrapper } from "#modules/series/episodes/history/Delete/Delete";
import { MusicHistoryEntryEntity } from "../models";
import { MusicHistoryApi } from "../requests";

type UseDeleteMusicHistoryEntryProps = Pick<OpenConfirmModalProps, "onFinish"> & {
  onActionSuccess?: ()=> void;
};

export function useDeleteMusicHistoryEntryModal(
  { onFinish, onActionSuccess }: UseDeleteMusicHistoryEntryProps,
): ReturnType<typeof useConfirmModal> {
  const { openModal, ...modal } = useConfirmModal();
  const { data, setData } = useLocalData<MusicHistoryEntryEntity>();

  assertIsDefined(setData);

  return {
    ...modal,
    openModal: (props) => {
      return openModal( {
        title: "Confirmar borrado",
        content: <DeleteHistoryEntryModalContentWrapper>
          <FormInputGroup inline>
            <FormLabel>Fecha</FormLabel>
            <span>{getLongDateStr(new Date(data.date.timestamp * 1_000), "datetime")}</span>
          </FormInputGroup>
          <FormInputGroup inline>
            <FormLabel>Título</FormLabel>
            <span>{data.resource?.title}</span>
          </FormInputGroup>
          <FormInputGroup inline>
            <FormLabel>Artista</FormLabel>
            <span>{data.resource?.artist}</span>
          </FormInputGroup>
        </DeleteHistoryEntryModalContentWrapper>,
        onFinish,
        onActionSuccess,
        action: async () => {
          const api = FetchApi.get(MusicHistoryApi);

          await api.deleteOneById(data.id);
          logger.info("Quitada entrada de historial");
          setData(undefined);

          return true;
        },
        ...props,
      } );
    },
  };
}
