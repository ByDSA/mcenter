import { ReactNode } from "react";
import { ContextMenuItem } from "#modules/ui-kit/ContextMenu";
import { logger } from "#modules/core/logger";
import { FetchApi } from "#modules/fetching/fetch-api";
import { useConfirmModal } from "#modules/ui-kit/modal/ConfirmModal/useConfirmModal";
import { getLongDateStr } from "#modules/utils/dates";
import { DaInputGroup, DaInputGroupItem } from "#modules/ui-kit/form/InputGroup";
import { DaLabel } from "#modules/ui-kit/form/Label/Label";
import { SetState } from "#modules/utils/react";
import { EpisodeHistoryApi } from "../requests";
import styles from "./DeleteEntryModal.module.css";

type Data = EpisodeHistoryApi.GetMany.Data;

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

type Props<T> = {
  value: T;
  setValue: SetState<T>;
};

export function DeleteHistoryEntryContextMenuItem( { setValue, value }: Props<Data>) {
  const { openModal } = useConfirmModal();

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
              <span>{value.resource.serie?.name ?? value.resource.compKey.seriesKey}</span>
            </DaInputGroupItem>
            <DaInputGroupItem inline>
              <DaLabel>Episodio</DaLabel>
              <span>{value.resource.compKey.episodeKey}</span>
            </DaInputGroupItem>
            <DaInputGroupItem inline>
              <DaLabel>Título</DaLabel>
              <span>{value.resource.title}</span>
            </DaInputGroupItem>
          </DaInputGroup>
        </DeleteHistoryEntryModalContentWrapper>,
        action: async ()=> {
          const api = FetchApi.get(EpisodeHistoryApi);

          await api.delete(value.id);
          logger.info("Quitada entrada de historial");
          setValue(undefined);

          return true;
        },
      } );
    }}
  />;
}
