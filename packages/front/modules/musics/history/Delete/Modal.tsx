import { assertIsDefined } from "$shared/utils/validation";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { DaInputGroup } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { OpenConfirmModalProps, useConfirmModal } from "#modules/ui-kit/modal/ConfirmModal/useConfirmModal";
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
          <DaInputGroup inline>
            <DaLabel>Fecha</DaLabel>
            <span>{getLongDateStr(new Date(data.date.timestamp * 1_000), "datetime")}</span>
          </DaInputGroup>
          <DaInputGroup inline>
            <DaLabel>Título</DaLabel>
            <span>{data.resource?.title}</span>
          </DaInputGroup>
          <DaInputGroup inline>
            <DaLabel>Artista</DaLabel>
            <span>{data.resource?.artist}</span>
          </DaInputGroup>
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
