import { ReactNode } from "react";
import { assertIsDefined } from "$shared/utils/validation";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useConfirmModal } from "#modules/ui-kit/modal/ConfirmModal/useConfirmModal";
import { getLongDateStr } from "#modules/utils/dates";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { useEpisode } from "#modules/episodes/hooks";
import { EpisodeHistoryApi } from "../requests";
import { EpisodeHistoryEntryEntity } from "../models";
import styles from "./DeleteEntryModal.module.css";

type DeleteHistoryEntryModalContentWrapperProps = {
  children: ReactNode;
};
export function DeleteHistoryEntryModalContentWrapper(
  { children }: DeleteHistoryEntryModalContentWrapperProps,
) {
  return <span className={styles.wrapper}>
    <header>¿Borrar entrada?</header>
    <div>
      {children}
    </div>
  </span>;
}

type Props = {
  value: EpisodeHistoryEntryEntity;
  onActionSuccess?: (entry: EpisodeHistoryEntryEntity)=> Promise<void>;
};

export function DeleteHistoryEntryContextMenuItem( { value, onActionSuccess }: Props) {
  const { openModal } = useConfirmModal();
  const { data: episode } = useEpisode(value.resourceId);

  assertIsDefined(episode);

  return <ContextMenuItem
    label="Quitar del historial"
    theme="danger"
    onClick={async () => {
      await openModal( {
        title: "Confirmar borrado",
        content: <DeleteHistoryEntryModalContentWrapper>
          <DaInputGroup>
            <DaInputGroupItem inline>
              <DaLabel>Fecha</DaLabel>
              <span>{getLongDateStr(new Date(value.date.timestamp * 1_000), "datetime")}</span>
            </DaInputGroupItem>
            <DaInputGroupItem inline>
              <DaLabel>Serie</DaLabel>
              <span>{episode.serie?.name ?? episode.compKey.seriesKey}</span>
            </DaInputGroupItem>
            <DaInputGroupItem inline>
              <DaLabel>Episodio</DaLabel>
              <span>{episode.compKey.episodeKey}</span>
            </DaInputGroupItem>
            <DaInputGroupItem inline>
              <DaLabel>Título</DaLabel>
              <span>{episode.title}</span>
            </DaInputGroupItem>
          </DaInputGroup>
        </DeleteHistoryEntryModalContentWrapper>,
        action: async ()=> {
          const api = FetchApi.get(EpisodeHistoryApi);
          const res = await api.delete(value.id);

          if (res.data) {
            await onActionSuccess?.(res.data);
            logger.info("Quitada entrada de historial");

            return true;
          }

          return false;
        },
      } );
    }}
  />;
}
